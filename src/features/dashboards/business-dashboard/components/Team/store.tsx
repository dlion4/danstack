import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, APPROVAL_RULES, AUDIT, LOGIN_EVENTS, MEMBERS, MODULES, NOTIFICATIONS,
  ROLES, SECURITY_POLICY, SESSIONS,
} from "./data";
import type {
  AccessLevel, Activity, ApprovalRule, AuditEvent, LoginEvent, Member, MemberStatus,
  Notification, PermLevel, Role, RoleId, Session,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  members: Member[];
  roles: Role[];
  approvalRules: ApprovalRule[];
  sessions: Session[];
  loginEvents: LoginEvent[];
  audit: AuditEvent[];
  policy: typeof SECURITY_POLICY;
  notifications: Notification[];
  activity: Activity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  modal: ModalState | null;
  openModal: (name: string, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  toasts: Toast[];
  toast: (msg: string, type?: ToastType, title?: string) => void;
  dismissToast: (id: number) => void;
  recordActivity: (text: string, icon?: string) => void;
  pushAudit: (actor: string, action: string, target: string, module: string, severity?: AuditEvent["severity"]) => void;
  /* members */
  inviteMember: (m: Omit<Member, "id" | "status" | "joined" | "lastActive" | "sessions" | "twoFA">) => string;
  updateMember: (id: string, patch: Partial<Member>) => void;
  changeRole: (id: string, roleId: RoleId) => void;
  suspendMember: (id: string) => void;
  reactivateMember: (id: string) => void;
  removeMember: (id: string) => void;
  resendInvite: (id: string) => void;
  revokeInvite: (id: string) => void;
  setMemberBusinessAccess: (id: string, businessId: string, level: AccessLevel) => void;
  bulkUpdateRole: (ids: string[], roleId: RoleId) => void;
  /* roles */
  createRole: (r: Omit<Role, "memberCount" | "system">) => string;
  updateRolePerm: (roleId: RoleId, moduleId: string, level: PermLevel) => void;
  updateRole: (roleId: RoleId, patch: Partial<Role>) => void;
  deleteRole: (roleId: RoleId) => void;
  /* approvals */
  createApprovalRule: (r: Omit<ApprovalRule, "id" | "triggered">) => string;
  toggleApprovalRule: (id: string) => void;
  deleteApprovalRule: (id: string) => void;
  /* security */
  updatePolicy: (patch: Partial<typeof SECURITY_POLICY>) => void;
  revokeSession: (id: string) => void;
  revokeAllSessions: (memberId: string) => void;
  toggle2FA: (memberId: string, on: boolean) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business] = useState("TechSolutions Ltd");
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(APPROVAL_RULES);
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [loginEvents] = useState<LoginEvent[]>(LOGIN_EVENTS);
  const [audit, setAudit] = useState<AuditEvent[]>(AUDIT);
  const [policy, setPolicy] = useState(SECURITY_POLICY);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activity, setActivity] = useState<Activity[]>(ACTIVITY);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, type: ToastType = "success", title?: string) => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-4), { id, msg, type, title }]);
    window.setTimeout(() => dismissToast(id), 4600);
  }, [dismissToast]);
  const openModal = useCallback((name: string, payload: Record<string, unknown> = {}) => setModal({ name, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const recordActivity = useCallback((text: string, icon = "bi-pencil") => {
    setActivity((a) => [{ time: "Just now", icon, text, by: "You" }, ...a].slice(0, 40));
  }, []);
  const pushAudit = useCallback((actor: string, action: string, target: string, module: string, severity: AuditEvent["severity"] = "Info") => {
    setAudit((a) => [{ id: "a" + Date.now(), time: "Just now", actor, action, target, module, severity, ip: "41.80.112.9" }, ...a].slice(0, 60));
  }, []);

  const recount = useCallback((list: Member[]) => {
    setRoles((rs) => rs.map((r) => ({ ...r, memberCount: list.filter((m) => m.roleId === r.id && m.status !== "Revoked").length })));
  }, []);

  /* ---------- members ---------- */
  const inviteMember = useCallback((m: Omit<Member, "id" | "status" | "joined" | "lastActive" | "sessions" | "twoFA">) => {
    const id = "u" + Date.now();
    const next: Member = { ...m, id, status: "Pending invite", joined: "—", lastActive: "Never", sessions: 0, twoFA: false, invitedBy: "Wanjiku Maina", inviteExpires: "in 7 days" };
    setMembers((prev) => { const list = [...prev, next]; recount(list); return list; });
    recordActivity(`Invite sent to ${m.email} as ${roles.find((r) => r.id === m.roleId)?.name}`, "bi-envelope-paper");
    pushAudit("Wanjiku Maina", "Invited team member", `${m.email} as ${roles.find((r) => r.id === m.roleId)?.name}`, "Team");
    return id;
  }, [roles, recount, recordActivity, pushAudit]);

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    setMembers((prev) => { const list = prev.map((m) => (m.id === id ? { ...m, ...patch } : m)); recount(list); return list; });
  }, [recount]);

  const changeRole = useCallback((id: string, roleId: RoleId) => {
    const m = members.find((x) => x.id === id);
    const oldRole = roles.find((r) => r.id === m?.roleId)?.name;
    const newRole = roles.find((r) => r.id === roleId)?.name;
    setMembers((prev) => { const list = prev.map((x) => (x.id === id ? { ...x, roleId } : x)); recount(list); return list; });
    recordActivity(`${m?.name} role changed: ${oldRole} → ${newRole}`, "bi-person-badge");
    pushAudit("Wanjiku Maina", "Changed role", `${m?.name}: ${oldRole} → ${newRole}`, "Team", "Warning");
    toast(`${m?.name} is now ${newRole}. Permissions apply on their next page load.`, "success", "Role updated");
  }, [members, roles, recount, recordActivity, pushAudit, toast]);

  const suspendMember = useCallback((id: string) => {
    const m = members.find((x) => x.id === id);
    setMembers((prev) => { const list = prev.map((x) => (x.id === id ? { ...x, status: "Suspended" as MemberStatus, sessions: 0 } : x)); recount(list); return list; });
    setSessions((prev) => prev.filter((s) => s.memberId !== id));
    recordActivity(`${m?.name} suspended — all sessions revoked`, "bi-person-x");
    pushAudit("Wanjiku Maina", "Suspended member", `${m?.name}`, "Team", "Warning");
    toast(`${m?.name} suspended. All active sessions killed immediately.`, "warning", "Member suspended");
  }, [members, recount, recordActivity, pushAudit, toast]);

  const reactivateMember = useCallback((id: string) => {
    const m = members.find((x) => x.id === id);
    setMembers((prev) => { const list = prev.map((x) => (x.id === id ? { ...x, status: "Active" as MemberStatus } : x)); recount(list); return list; });
    recordActivity(`${m?.name} reactivated`, "bi-person-check");
    pushAudit("Wanjiku Maina", "Reactivated member", `${m?.name}`, "Team");
    toast(`${m?.name} can sign in again. They'll need to re-authenticate.`, "success", "Member reactivated");
  }, [members, recount, recordActivity, pushAudit, toast]);

  const removeMember = useCallback((id: string) => {
    const m = members.find((x) => x.id === id);
    setMembers((prev) => { const list = prev.filter((x) => x.id !== id); recount(list); return list; });
    setSessions((prev) => prev.filter((s) => s.memberId !== id));
    recordActivity(`${m?.name} removed from the team`, "bi-person-dash");
    pushAudit("Wanjiku Maina", "Removed member", `${m?.name} — access revoked`, "Team", "Critical");
    toast(`${m?.name} removed. Their audit trail is retained for compliance.`, "danger", "Member removed");
  }, [members, recount, recordActivity, pushAudit, toast]);

  const resendInvite = useCallback((id: string) => {
    const m = members.find((x) => x.id === id);
    setMembers((prev) => prev.map((x) => (x.id === id ? { ...x, inviteExpires: "in 7 days" } : x)));
    recordActivity(`Invite resent to ${m?.email}`, "bi-envelope-paper");
    toast(`Invite resent to ${m?.email} via email + WhatsApp. Expires in 7 days.`, "success", "Invite resent");
  }, [members, recordActivity, toast]);

  const revokeInvite = useCallback((id: string) => {
    const m = members.find((x) => x.id === id);
    setMembers((prev) => { const list = prev.filter((x) => x.id !== id); recount(list); return list; });
    recordActivity(`Invite revoked for ${m?.email}`, "bi-envelope-x");
    pushAudit("Wanjiku Maina", "Revoked invite", `${m?.email}`, "Team", "Warning");
    toast(`Invite for ${m?.email} revoked — the link no longer works.`, "info", "Invite revoked");
  }, [members, recount, recordActivity, pushAudit, toast]);

  const setMemberBusinessAccess = useCallback((id: string, businessId: string, level: AccessLevel) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, businesses: { ...m.businesses, [businessId]: level } } : m)));
  }, []);

  const bulkUpdateRole = useCallback((ids: string[], roleId: RoleId) => {
    const roleName = roles.find((r) => r.id === roleId)?.name;
    setMembers((prev) => { const list = prev.map((m) => (ids.includes(m.id) && m.roleId !== "owner" ? { ...m, roleId } : m)); recount(list); return list; });
    recordActivity(`Bulk role change — ${ids.length} member(s) → ${roleName}`, "bi-people");
    pushAudit("Wanjiku Maina", "Bulk role change", `${ids.length} members → ${roleName}`, "Team", "Warning");
    toast(`${ids.length} member(s) moved to ${roleName}.`, "success", "Bulk update applied");
  }, [roles, recount, recordActivity, pushAudit, toast]);

  /* ---------- roles ---------- */
  const createRole = useCallback((r: Omit<Role, "memberCount" | "system">) => {
    setRoles((prev) => [...prev, { ...r, memberCount: 0, system: false }]);
    recordActivity(`Custom role "${r.name}" created`, "bi-shield-lock");
    pushAudit("Wanjiku Maina", "Created custom role", r.name, "Team");
    return r.id;
  }, [recordActivity, pushAudit]);

  const updateRolePerm = useCallback((roleId: RoleId, moduleId: string, level: PermLevel) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, perms: { ...r.perms, [moduleId]: level } } : r)));
  }, []);

  const updateRole = useCallback((roleId: RoleId, patch: Partial<Role>) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, ...patch } : r)));
  }, []);

  const deleteRole = useCallback((roleId: RoleId) => {
    const r = roles.find((x) => x.id === roleId);
    setRoles((prev) => prev.filter((x) => x.id !== roleId));
    recordActivity(`Role "${r?.name}" deleted`, "bi-trash");
    pushAudit("Wanjiku Maina", "Deleted role", r?.name ?? roleId, "Team", "Warning");
    toast(`Role "${r?.name}" deleted — affected members moved to Viewer.`, "warning", "Role deleted");
  }, [roles, recordActivity, pushAudit, toast]);

  /* ---------- approvals ---------- */
  const createApprovalRule = useCallback((r: Omit<ApprovalRule, "id" | "triggered">) => {
    const id = "ar" + Date.now();
    setApprovalRules((prev) => [{ ...r, id, triggered: 0 }, ...prev]);
    recordActivity(`Approval rule created: ${r.name}`, "bi-check2-square");
    pushAudit("Wanjiku Maina", "Created approval rule", r.name, "Team");
    return id;
  }, [recordActivity, pushAudit]);

  const toggleApprovalRule = useCallback((id: string) => {
    setApprovalRules((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Paused" as const : "Active" as const } : r)));
  }, []);

  const deleteApprovalRule = useCallback((id: string) => {
    const r = approvalRules.find((x) => x.id === id);
    setApprovalRules((prev) => prev.filter((x) => x.id !== id));
    recordActivity(`Approval rule deleted: ${r?.name}`, "bi-trash");
    pushAudit("Wanjiku Maina", "Deleted approval rule", r?.name ?? id, "Team", "Warning");
    toast(`Rule deleted — payments above this threshold now go through without approval.`, "warning", "Rule removed");
  }, [approvalRules, recordActivity, pushAudit, toast]);

  /* ---------- security ---------- */
  const updatePolicy = useCallback((patch: Partial<typeof SECURITY_POLICY>) => {
    setPolicy((p) => ({ ...p, ...patch }));
  }, []);

  const revokeSession = useCallback((id: string) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((prev) => prev.filter((x) => x.id !== id));
    const m = members.find((x) => x.id === s?.memberId);
    setMembers((prev) => prev.map((x) => (x.id === s?.memberId ? { ...x, sessions: Math.max(0, x.sessions - 1) } : x)));
    recordActivity(`Session revoked: ${s?.device} (${m?.name})`, "bi-box-arrow-right");
    pushAudit("Wanjiku Maina", "Revoked session", `${m?.name} · ${s?.device} · ${s?.location}`, "Security", "Warning");
    toast(`Session killed — ${s?.device} signed out instantly.`, "success", "Session revoked");
  }, [sessions, members, recordActivity, pushAudit, toast]);

  const revokeAllSessions = useCallback((memberId: string) => {
    const m = members.find((x) => x.id === memberId);
    const count = sessions.filter((s) => s.memberId === memberId).length;
    setSessions((prev) => prev.filter((s) => s.memberId !== memberId));
    setMembers((prev) => prev.map((x) => (x.id === memberId ? { ...x, sessions: 0 } : x)));
    recordActivity(`All sessions revoked for ${m?.name} (${count})`, "bi-box-arrow-right");
    pushAudit("Wanjiku Maina", "Revoked all sessions", `${m?.name} · ${count} device(s)`, "Security", "Critical");
    toast(`${count} session(s) killed. ${m?.name} must sign in again everywhere.`, "warning", "All sessions revoked");
  }, [members, sessions, recordActivity, pushAudit, toast]);

  const toggle2FA = useCallback((memberId: string, on: boolean) => {
    const m = members.find((x) => x.id === memberId);
    setMembers((prev) => prev.map((x) => (x.id === memberId ? { ...x, twoFA: on } : x)));
    recordActivity(`2FA ${on ? "required for" : "reset for"} ${m?.name}`, "bi-shield-lock");
    pushAudit("Wanjiku Maina", on ? "Enforced 2FA" : "Reset 2FA", `${m?.name}`, "Security", "Warning");
  }, [members, recordActivity, pushAudit]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, members, roles, approvalRules, sessions, loginEvents, audit, policy, notifications, activity,
    searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    pushAudit, inviteMember, updateMember, changeRole, suspendMember, reactivateMember, removeMember,
    resendInvite, revokeInvite, setMemberBusinessAccess, bulkUpdateRole, createRole, updateRolePerm,
    updateRole, deleteRole, createApprovalRule, toggleApprovalRule, deleteApprovalRule, updatePolicy,
    revokeSession, revokeAllSessions, toggle2FA, markNotifsRead, dismissNotif,
  }), [business, members, roles, approvalRules, sessions, loginEvents, audit, policy, notifications, activity,
    searchQuery, modal, toasts, openModal, closeModal, toast, dismissToast, recordActivity, pushAudit,
    inviteMember, updateMember, changeRole, suspendMember, reactivateMember, removeMember, resendInvite,
    revokeInvite, setMemberBusinessAccess, bulkUpdateRole, createRole, updateRolePerm, updateRole, deleteRole,
    createApprovalRule, toggleApprovalRule, deleteApprovalRule, updatePolicy, revokeSession, revokeAllSessions,
    toggle2FA, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export { MODULES };
