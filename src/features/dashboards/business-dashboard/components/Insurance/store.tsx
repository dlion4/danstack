import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ACTIVITY, BENEFICIARIES, CLAIMS, NOTIFICATIONS, POLICIES } from "./data";
import type {
  Activity, Beneficiary, Claim, ClaimStatus, Notification, Policy, PolicyStatus,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  policies: Policy[];
  claims: Claim[];
  beneficiaries: Beneficiary[];
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
  /* insurance actions */
  renewPolicy: (policyId: string) => void;
  reinstatePolicy: (policyId: string) => void;
  fileClaim: (policyId: string, amount: number, note: string) => void;
  updateClaimStatus: (claimId: string, status: ClaimStatus) => void;
  activateCyber: () => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [policies, setPolicies] = useState<Policy[]>(POLICIES);
  const [claims, setClaims] = useState<Claim[]>(CLAIMS);
  const [beneficiaries] = useState<Beneficiary[]>(BENEFICIARIES);
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

  /* ---------- insurance ---------- */
  const renewPolicy = useCallback((policyId: string) => {
    setPolicies((prev) => prev.map((p) => (p.id === policyId ? {
      ...p,
      status: "Active" as PolicyStatus,
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      notes: "Renewed automatically — next review in 12 months.",
    } : p)));
    const p = policies.find((x) => x.id === policyId);
    recordActivity(`${p?.name ?? "Policy"} renewed (${p?.provider ?? ""})`, "bi-calendar-check");
    toast(`${p?.name ?? "Policy"} renewed 🎉 — coverage continues uninterrupted.`, "success", "Policy renewed");
  }, [policies, recordActivity, toast]);

  const reinstatePolicy = useCallback((policyId: string) => {
    setPolicies((prev) => prev.map((p) => (p.id === policyId ? {
      ...p,
      status: "Active" as PolicyStatus,
      started: "Just now",
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      notes: "Reinstated with no break — claims from today covered.",
    } : p)));
    const p = policies.find((x) => x.id === policyId);
    recordActivity(`${p?.name ?? "Policy"} reinstated (${p?.provider ?? ""})`, "bi-arrow-counterclockwise");
    toast(`${p?.name ?? "Policy"} reinstated — you're covered as of now.`, "success", "Coverage active");
  }, [policies, recordActivity, toast]);

  const fileClaim = useCallback((policyId: string, amount: number, note: string) => {
    const p = policies.find((x) => x.id === policyId);
    setClaims((prev) => [{
      id: "cl" + Date.now(),
      policyId,
      policyName: p?.name ?? policyId,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      amount,
      status: "Under review",
      note,
    }, ...prev]);
    recordActivity(`Claim KES ${amount.toLocaleString()} lodged on ${p?.name ?? policyId}`, "bi-shield-exclamation");
    toast("Claim received — an assessor will reach out within 24 hours.", "success", "Claim lodged");
  }, [policies, recordActivity, toast]);

  const updateClaimStatus = useCallback((claimId: string, status: ClaimStatus) => {
    setClaims((prev) => prev.map((c) => (c.id === claimId ? { ...c, status } : c)));
    const c = claims.find((x) => x.id === claimId);
    recordActivity(`Claim ${c?.id ?? claimId} marked ${status}`, "bi-pencil");
    toast(`Claim ${c?.id ?? claimId} is now ${status}.`, status === "Paid" ? "success" : "info", "Claim updated");
  }, [claims, recordActivity, toast]);

  const activateCyber = useCallback(() => {
    setPolicies((prev) => prev.map((p) => (p.id === "pol4" ? { ...p, status: "Active" as PolicyStatus, started: "Just now", expires: "12 months from activation", notes: "Security audit passed — cyber cover live." } : p)));
    recordActivity("Cyber & Data Breach policy activated", "bi-shield-lock");
    toast("Cyber cover is live 🛡️ — KES 4M protection against breach & ransomware.", "success", "Cyber policy active");
  }, [recordActivity, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, policies, claims, beneficiaries, notifications, activity, searchQuery,
    setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    renewPolicy, reinstatePolicy, fileClaim, updateClaimStatus, activateCyber, markNotifsRead, dismissNotif,
  }), [business, policies, claims, beneficiaries, notifications, activity, searchQuery, modal,
    toasts, openModal, closeModal, toast, dismissToast, recordActivity, renewPolicy, reinstatePolicy,
    fileClaim, updateClaimStatus, activateCyber, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export type { ClaimStatus, PolicyStatus };
