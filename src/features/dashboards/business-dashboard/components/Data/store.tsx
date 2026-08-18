import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, AUDIT_TRAIL, CONSENTS, DATA_CATEGORIES, DATA_REQUESTS, INTEGRATIONS,
  NOTIFICATIONS, PRIVACY_POLICY,
} from "./data";
import type {
  Activity, AuditEntry, ConsentItem, ConsentStatus, DataCategory, DataRequest,
  DataRequestType, Integration, Notification, RequestStatus,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  dataRequests: DataRequest[];
  consents: ConsentItem[];
  dataCategories: DataCategory[];
  auditTrail: AuditEntry[];
  integrations: Integration[];
  policy: typeof PRIVACY_POLICY;
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
  pushAudit: (actor: string, action: string, target: string, category: string, severity?: AuditEntry["severity"]) => void;
  /* data requests */
  createDataRequest: (type: DataRequestType, scope: string, note: string) => string;
  downloadRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  /* consent */
  withdrawConsent: (id: string) => void;
  grantConsent: (id: string) => void;
  /* account */
  updatePassword: () => void;
  revokeAllSessions: () => void;
  deleteAccount: (confirmText: string) => boolean;
  /* integrations */
  disconnectIntegration: (id: string) => void;
  reconnectIntegration: (id: string) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business] = useState("TechSolutions Ltd");
  const [dataRequests, setDataRequests] = useState<DataRequest[]>(DATA_REQUESTS);
  const [consents, setConsents] = useState<ConsentItem[]>(CONSENTS);
  const [dataCategories] = useState<DataCategory[]>(DATA_CATEGORIES);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(AUDIT_TRAIL);
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [policy] = useState(PRIVACY_POLICY);
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
  const pushAudit = useCallback((actor: string, action: string, target: string, category: string, severity: AuditEntry["severity"] = "Info") => {
    setAuditTrail((a) => [{ id: "a" + Date.now(), time: "Just now", actor, action, target, category, severity, ip: "41.80.112.9" }, ...a].slice(0, 60));
  }, []);

  /* ---------- data requests ---------- */
  const createDataRequest = useCallback((type: DataRequestType, scope: string, note: string) => {
    const id = `DR-${35 + Math.floor(Math.random() * 30)}`;
    const status: RequestStatus = type === "Export" || type === "Access" ? "Processing" : "Processing";
    const newReq: DataRequest = { id, type, scope, status, requested: "Just now", note };
    setDataRequests((prev) => [newReq, ...prev]);
    recordActivity(`Data request filed: ${type} — ${scope}`, "bi-file-earmark-arrow-down");
    pushAudit("Wanjiku Maina", `Filed ${type} request`, scope, "Data Request", "Warning");
    toast(`${type} request filed (${id}). ${type === "Export" ? "Available within 24 hours." : type === "Delete" ? "Processing with KRA retention overrides." : "Processing."}`, "info", "Request submitted");
    return id;
  }, [recordActivity, pushAudit, toast]);

  const downloadRequest = useCallback((id: string) => {
    const req = dataRequests.find((x) => x.id === id);
    recordActivity(`Data export downloaded: ${id}`, "bi-download");
    pushAudit("Wanjiku Maina", "Downloaded data export", `${id} · ${req?.scope}`, "Data Export");
    toast(`Download started for ${id} (${req?.size ?? "—"}).`, "success", "Download ready");
  }, [dataRequests, recordActivity, pushAudit, toast]);

  const deleteRequest = useCallback((id: string) => {
    setDataRequests((prev) => prev.filter((x) => x.id !== id));
    toast(`Request ${id} cancelled.`, "info", "Cancelled");
  }, [toast]);

  /* ---------- consent ---------- */
  const withdrawConsent = useCallback((id: string) => {
    const c = consents.find((x) => x.id === id);
    setConsents((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Withdrawn" as ConsentStatus } : x)));
    recordActivity(`Consent withdrawn: ${c?.scope}`, "bi-shield-x");
    pushAudit("Wanjiku Maina", "Consent withdrawn", c?.scope ?? id, "Consent", "Warning");
    toast(`${c?.scope} consent withdrawn. ${c?.scope === "Marketing" ? "Campaigns to this contact stop immediately." : "Data sharing paused."}`, "warning", "Consent withdrawn");
  }, [consents, recordActivity, pushAudit, toast]);

  const grantConsent = useCallback((id: string) => {
    const c = consents.find((x) => x.id === id);
    setConsents((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Granted" as ConsentStatus, granted: "Just now" } : x)));
    recordActivity(`Consent re-granted: ${c?.scope}`, "bi-shield-check");
    toast(`${c?.scope} consent granted.`, "success", "Consent updated");
  }, [consents, recordActivity, toast]);

  /* ---------- account ---------- */
  const updatePassword = useCallback(() => {
    recordActivity("Password reset link sent and all sessions revoked", "bi-key");
    pushAudit("Wanjiku Maina", "Password changed", "Account: wanjiku@techsol.co.ke", "Security", "Critical");
    toast("Reset link sent to your email. All active sessions revoked — sign in again everywhere.", "warning", "Password reset");
  }, [recordActivity, pushAudit, toast]);

  const revokeAllSessions = useCallback(() => {
    recordActivity("All sessions revoked across all devices", "bi-box-arrow-right");
    pushAudit("Wanjiku Maina", "Revoked all sessions", "3 active device(s)", "Security", "Critical");
    toast("All sessions killed. Sign in again on every device.", "warning", "Sessions revoked");
  }, [recordActivity, pushAudit, toast]);

  const deleteAccount = useCallback((confirmText: string): boolean => {
    if (confirmText !== "DELETE TECHSOLUTIONS") {
      toast("Confirmation text doesn't match. Type DELETE TECHSOLUTIONS exactly.", "danger", "Cannot proceed");
      return false;
    }
    pushAudit("Wanjiku Maina", "Account deletion initiated", "TechSolutions Ltd — all data", "Account Closure", "Critical");
    toast("Account closure initiated. Data retained 7 years per KRA/CBK, then permanently destroyed. You'll receive a final email.", "danger", "Closure initiated");
    return true;
  }, [pushAudit, toast]);

  /* ---------- integrations ---------- */
  const disconnectIntegration = useCallback((id: string) => {
    const integ = integrations.find((x) => x.id === id);
    setIntegrations((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Disconnected" as const } : x)));
    recordActivity(`Disconnected: ${integ?.name}`, "bi-plug");
    pushAudit("Wanjiku Maina", "Disconnected integration", integ?.name ?? id, "Data Sharing", "Warning");
    toast(`${integ?.name} disconnected. Data sharing stopped. Reconnect any time.`, "info", "Integration disconnected");
  }, [integrations, recordActivity, pushAudit, toast]);

  const reconnectIntegration = useCallback((id: string) => {
    const integ = integrations.find((x) => x.id === id);
    setIntegrations((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Connected" as const, lastSync: "Just now" } : x)));
    recordActivity(`Reconnected: ${integ?.name}`, "bi-plug-fill");
    pushAudit("Wanjiku Maina", "Reconnected integration", integ?.name ?? id, "Data Sharing");
    toast(`${integ?.name} reconnected. Data sync resumed.`, "success", "Integration live");
  }, [integrations, recordActivity, pushAudit, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, dataRequests, consents, dataCategories, auditTrail, integrations, policy,
    notifications, activity, searchQuery, setSearchQuery, modal, openModal, closeModal,
    toasts, toast, dismissToast, recordActivity, pushAudit, createDataRequest, downloadRequest,
    deleteRequest, withdrawConsent, grantConsent, updatePassword, revokeAllSessions, deleteAccount,
    disconnectIntegration, reconnectIntegration, markNotifsRead, dismissNotif,
  }), [business, dataRequests, consents, dataCategories, auditTrail, integrations, policy,
    notifications, activity, searchQuery, modal, toasts, openModal, closeModal, toast, dismissToast,
    recordActivity, pushAudit, createDataRequest, downloadRequest, deleteRequest, withdrawConsent,
    grantConsent, updatePassword, revokeAllSessions, deleteAccount, disconnectIntegration,
    reconnectIntegration, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
