import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, DEPOSITS, ENTITIES, FOLDERS, INTER_LOANS, MAINTENANCE, NOTIFICATIONS, TAX_ITEMS, TEAM, TENANTS, TRANSFERS,
} from "./data";
import type {
  AccessLevel, Activity, DepositEntry, Entity, Folder, InterLoan, Maintenance, MaintStatus, Notification,
  TaxItem, TeamMember, Tenant, Transfer, TransferType,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  currentEntityId: string;
  setCurrentEntityId: (id: string) => void;
  entities: Entity[];
  folders: Folder[];
  transfers: Transfer[];
  loans: InterLoan[];
  tenants: Tenant[];
  deposits: DepositEntry[];
  maintenance: Maintenance[];
  team: TeamMember[];
  taxItems: TaxItem[];
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
  /* entity & folder actions */
  createEntity: (e: Omit<Entity, "id">) => string;
  addFolder: (name: string, emoji: string) => string;
  moveEntity: (entityId: string, folderId: string) => void;
  /* transfers & loans */
  createTransfer: (from: string, to: string, amount: number, reason: string, type: TransferType) => string;
  approveTransfer: (id: string) => void;
  createLoan: (from: string, to: string, principal: number, rate: number | null, termMonths: number, note: string) => string;
  payLoanInstalment: (id: string, amount: number) => void;
  /* rental sub-system */
  addTenant: (t: Omit<Tenant, "id">) => string;
  sendReminder: (tenantId: string, channel: string) => void;
  moveOutTenant: (tenantId: string, deductions: number, refund: number, note: string) => void;
  addMaintenance: (m: Omit<Maintenance, "id">) => string;
  assignMaintenance: (id: string, vendor: string, cost: number) => void;
  resolveMaintenance: (id: string, cost: number) => void;
  /* access matrix */
  updateMatrix: (userId: string, entityId: string, level: AccessLevel) => void;
  addTeamMember: (name: string, role: string) => void;
  /* tax */
  payTax: (id: string) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [currentEntityId, setCurrentEntityId] = useState("e3"); // rental context active
  const [entities, setEntities] = useState<Entity[]>(ENTITIES);
  const [folders, setFolders] = useState<Folder[]>(FOLDERS);
  const [transfers, setTransfers] = useState<Transfer[]>(TRANSFERS);
  const [loans, setLoans] = useState<InterLoan[]>(INTER_LOANS);
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);
  const [deposits, setDeposits] = useState<DepositEntry[]>(DEPOSITS);
  const [maintenance, setMaintenance] = useState<Maintenance[]>(MAINTENANCE);
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [taxItems, setTaxItems] = useState<TaxItem[]>(TAX_ITEMS);
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

  /* ---------- entities & folders ---------- */
  const createEntity = useCallback((e: Omit<Entity, "id">) => {
    const id = "e" + Date.now();
    setEntities((prev) => [...prev, { ...e, id }]);
    recordActivity(`Entity "${e.name}" created (${e.type}${e.type === "Rental" ? `, ${e.units} units` : ""})`, "bi-plus-circle");
    return id;
  }, [recordActivity]);

  const addFolder = useCallback((name: string, emoji: string) => {
    const id = "f" + Date.now();
    setFolders((prev) => [...prev, { id, name, emoji }]);
    recordActivity(`Folder "${name}" created`, "bi-folder-plus");
    return id;
  }, [recordActivity]);

  const moveEntity = useCallback((entityId: string, folderId: string) => {
    const e = entities.find((x) => x.id === entityId);
    const f = folders.find((x) => x.id === folderId);
    setEntities((prev) => prev.map((x) => (x.id === entityId ? { ...x, folder: folderId } : x)));
    recordActivity(`Moved ${e?.name ?? entityId} → ${f?.name ?? folderId}`, "bi-arrow-left-right");
    toast(`${e?.name} moved to ${f?.name}.`, "success", "Entity moved");
  }, [entities, folders, recordActivity, toast]);

  /* ---------- transfers ---------- */
  const createTransfer = useCallback((from: string, to: string, amount: number, reason: string, type: TransferType) => {
    const id = `TRF-${2213 + Math.floor(Math.random() * 50)}`;
    const needsApproval = amount > 1000000;
    setTransfers((prev) => [{
      id, from, to, amount, reason, type, date: "Just now",
      status: needsApproval ? "Pending approval" as const : "Executed" as const,
      note: needsApproval ? "Above KES 1,000,000 — needs Portfolio Owner approval" : "Instant — internal ledger movement",
    }, ...prev]);
    recordActivity(`${id} ${needsApproval ? "submitted for approval" : "executed"} — ${from} → ${to}, KES ${amount.toLocaleString()} (${type})`, "bi-arrow-left-right");
    return id;
  }, [recordActivity]);

  const approveTransfer = useCallback((id: string) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Executed" as const, note: "Approved by Portfolio Owner — executed" } : t)));
    recordActivity(`${id} approved & executed by Portfolio Owner`, "bi-check2-all");
    toast(`${id} approved — funds moved between your entities instantly (no bank fees).`, "success", "Transfer executed");
  }, [recordActivity, toast]);

  /* ---------- inter-company loans ---------- */
  const createLoan = useCallback((from: string, to: string, principal: number, rate: number | null, termMonths: number, note: string) => {
    const id = `LN-IC-${3 + Math.floor(Math.random() * 40)}`;
    const r = (rate ?? 0) / 12;
    const pmt = r > 0 ? Math.round((principal * r) / (1 - Math.pow(1 + r, -termMonths))) : Math.round(principal / termMonths);
    const schedule = Array.from({ length: termMonths }, (_, i) => ({
      n: i + 1,
      date: new Date(2026, i, 15).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }),
      amount: pmt,
      status: (i === 0 ? "Due" : "Upcoming") as "Due" | "Upcoming",
    }));
    setLoans((prev) => [{
      id, from, to, principal, outstanding: principal, rate, termMonths, paidCount: 0, note, schedule,
    }, ...prev]);
    recordActivity(`${id} created — ${from} → ${to}, KES ${principal.toLocaleString()} (${termMonths}mo)`, "bi-bank");
    return id;
  }, [recordActivity]);

  const payLoanInstalment = useCallback((id: string, amount: number) => {
    setLoans((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const outstanding = Math.max(0, l.outstanding - amount);
      const schedule = l.schedule.map((r, i) => {
        if (r.status === "Due") return { ...r, status: "Paid" as const };
        if (r.status === "Upcoming" && l.schedule[i - 1]?.status === "Due") return { ...r, status: "Due" as const };
        return r;
      });
      return { ...l, outstanding, paidCount: l.paidCount + 1, schedule };
    }));
    recordActivity(`Instalment KES ${amount.toLocaleString()} paid on ${id}`, "bi-cash-stack");
    toast(`KES ${amount.toLocaleString()} posted on ${id} — inter-company entry eliminates in consolidation.`, "success", "Instalment paid");
  }, [recordActivity, toast]);

  /* ---------- tenants ---------- */
  const addTenant = useCallback((t: Omit<Tenant, "id">) => {
    const id = "t" + Date.now();
    setTenants((prev) => [{ ...t, id }, ...prev]);
    setDeposits((prev) => [...prev, { id: "d" + Date.now(), date: "Just now", tenant: t.name, type: "Move-in", amount: t.deposit, note: "Security deposit received — held as liability" }]);
    recordActivity(`Tenant ${t.name} added — Unit ${t.unit}, deposit KES ${t.deposit.toLocaleString()}`, "bi-person-plus");
    return id;
  }, [recordActivity]);

  const sendReminder = useCallback((tenantId: string, channel: string) => {
    const t = tenants.find((x) => x.id === tenantId);
    recordActivity(`Rent reminder sent to ${t?.name ?? tenantId} via ${channel}`, "bi-bell");
    toast(`Reminder sent to ${t?.name} via ${channel} — polite first, formal after day 10.`, "success", "Reminder sent");
  }, [tenants, recordActivity, toast]);

  const moveOutTenant = useCallback((tenantId: string, deductions: number, refund: number, note: string) => {
    const t = tenants.find((x) => x.id === tenantId);
    setTenants((prev) => prev.map((x) => (x.id === tenantId ? { ...x, status: "Vacant" as const, unit: x.unit } : x)));
    if (t) {
      setDeposits((prev) => [...prev,
        { id: "d" + Date.now(), date: "Just now", tenant: t.name, type: "Deduction", amount: -deductions, note },
        { id: "d" + Date.now() + "r", date: "Just now", tenant: t.name, type: "Refund", amount: -refund, note: "Balance refunded via M-Pesa" },
      ]);
    }
    recordActivity(`Move-out processed for ${t?.name ?? tenantId} — refund KES ${refund.toLocaleString()}, deductions KES ${deductions.toLocaleString()}`, "bi-person-x");
  }, [tenants, recordActivity]);

  /* ---------- maintenance ---------- */
  const addMaintenance = useCallback((m: Omit<Maintenance, "id">) => {
    const id = `MR-${105 + Math.floor(Math.random() * 20)}`;
    setMaintenance((prev) => [{ ...m, id }, ...prev]);
    recordActivity(`${id} logged — ${m.issue} (Unit ${m.unit})`, "bi-droplet");
    return id;
  }, [recordActivity]);

  const assignMaintenance = useCallback((id: string, vendor: string, cost: number) => {
    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Assigned" as MaintStatus, vendor, cost } : m)));
    recordActivity(`${id} assigned to ${vendor} (est. KES ${cost.toLocaleString()})`, "bi-person-check");
    toast(`Vendor assigned — a draft PO for ${vendor} was created on Pay Suppliers.`, "success", "Work assigned");
  }, [recordActivity, toast]);

  const resolveMaintenance = useCallback((id: string, cost: number) => {
    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Resolved" as MaintStatus, cost } : m)));
    recordActivity(`${id} resolved — cost KES ${cost.toLocaleString()} posted to Kilimani House 1 P&L`, "bi-check2-circle");
    toast(`${id} resolved — cost posted against the property's P&L.`, "success", "Work completed");
  }, [recordActivity, toast]);

  /* ---------- access matrix ---------- */
  const updateMatrix = useCallback((userId: string, entityId: string, level: AccessLevel) => {
    setTeam((prev) => prev.map((u) => (u.id === userId ? { ...u, matrix: { ...u.matrix, [entityId]: level } } : u)));
  }, []);

  const addTeamMember = useCallback((name: string, role: string) => {
    const id = "u" + Date.now();
    setTeam((prev) => [...prev, { id, name, role, managerOf: "", matrix: { e1: "No Access", e2: "No Access", e3: "No Access", e4: "No Access", e5: "No Access" } }]);
    recordActivity(`Team member ${name} added (${role})`, "bi-person-plus");
  }, [recordActivity]);

  /* ---------- tax ---------- */
  const payTax = useCallback((id: string) => {
    setTaxItems((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Paid" as const } : t)));
    const item = taxItems.find((t) => t.id === id);
    recordActivity(`${item?.type} (${item?.entity}) marked paid — KES ${item?.amount.toLocaleString()}`, "bi-receipt");
    toast(`${item?.type} for ${item?.entity} filed & paid via iTax.`, "success", "Tax settled");
  }, [taxItems, recordActivity, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, currentEntityId, setCurrentEntityId, entities, folders, transfers, loans, tenants,
    deposits, maintenance, team, taxItems, notifications, activity, searchQuery, setSearchQuery, modal, openModal,
    closeModal, toasts, toast, dismissToast, recordActivity, createEntity, addFolder, moveEntity, createTransfer,
    approveTransfer, createLoan, payLoanInstalment, addTenant, sendReminder, moveOutTenant, addMaintenance,
    assignMaintenance, resolveMaintenance, updateMatrix, addTeamMember, payTax, markNotifsRead, dismissNotif,
  }), [business, currentEntityId, entities, folders, transfers, loans, tenants, deposits, maintenance, team,
    taxItems, notifications, activity, searchQuery, modal, toasts, openModal, closeModal, toast, dismissToast,
    recordActivity, createEntity, addFolder, moveEntity, createTransfer, approveTransfer, createLoan,
    payLoanInstalment, addTenant, sendReminder, moveOutTenant, addMaintenance, assignMaintenance, resolveMaintenance,
    updateMatrix, addTeamMember, payTax, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
