import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, CREDIT_PROFILE, FUNDING_OFFERS, LOAN_APPLICATIONS, NOTIFICATIONS, REPAYMENTS,
} from "./data";
import type {
  Activity, AppStatus, CreditProfile, FundingOffer, LoanApplication, Notification, Repayment, RepayStatus,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  profile: CreditProfile;
  offers: FundingOffer[];
  applications: LoanApplication[];
  repayments: Repayment[];
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
  /* funding actions */
  applyForOffer: (offerId: string) => void;
  acceptFacility: (appId: string) => void;
  repayLoan: (repayId: string) => void;
  simulateScore: () => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [profile, setProfile] = useState<CreditProfile>(CREDIT_PROFILE);
  const [offers, setOffers] = useState<FundingOffer[]>(FUNDING_OFFERS);
  const [applications, setApplications] = useState<LoanApplication[]>(LOAN_APPLICATIONS);
  const [repayments, setRepayments] = useState<Repayment[]>(REPAYMENTS);
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

  /* ---------- funding ---------- */
  const applyForOffer = useCallback((offerId: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    setApplications((prev) => [{
      id: "app" + Date.now(),
      lender: offer.lender,
      product: offer.product,
      amount: offer.amount,
      status: "In review",
      submitted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      note: "Application submitted — decision within 2 hours.",
    }, ...prev]);
    recordActivity(`Applied for ${offer.product} (${offer.lender}, ${offer.amount.toLocaleString()})`, "bi-send-check");
    toast(`${offer.product} application sent to ${offer.lender} — we'll ping you the decision.`, "success", "Application submitted");
  }, [offers, recordActivity, toast]);

  const acceptFacility = useCallback((appId: string) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: "Disbursed" as AppStatus, note: "Facility activated — funds available in NCBA Current." } : a)));
    const app = applications.find((a) => a.id === appId);
    recordActivity(`${app?.product ?? "Facility"} accepted and activated (${app?.lender ?? ""})`, "bi-check2-circle");
    toast(`${app?.product ?? "Facility"} activated 🎉 — draw down from Cash & Accounts anytime.`, "success", "Facility active");
  }, [applications, recordActivity, toast]);

  const repayLoan = useCallback((repayId: string) => {
    setRepayments((prev) => prev.map((r) => (r.id === repayId ? { ...r, status: "Paid" as RepayStatus } : r)));
    const r = repayments.find((x) => x.id === repayId);
    recordActivity(`Repayment of ${r ? "KES " + r.amount.toLocaleString() : ""} posted for ${r?.lender ?? "loan"}`, "bi-cash-stack");
    toast("Payment posted — M-Pesa confirmation sent.", "success", "Repayment made");
  }, [repayments, recordActivity, toast]);

  const simulateScore = useCallback(() => {
    setProfile((p) => ({ ...p, score: Math.min(850, p.score + 4), updated: "Updated just now · simulated" }));
    recordActivity("Credit score simulated — factoring projected collections", "bi-lightning-charge");
    toast("Simulation complete — paying down KES 300K of debt lifts your score to 746.", "success", "Score simulated");
  }, [recordActivity, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, profile, offers, applications, repayments, notifications, activity,
    searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast,
    recordActivity, applyForOffer, acceptFacility, repayLoan, simulateScore, markNotifsRead, dismissNotif,
  }), [business, profile, offers, applications, repayments, notifications, activity, searchQuery,
    modal, toasts, openModal, closeModal, toast, dismissToast, recordActivity, applyForOffer,
    acceptFacility, repayLoan, simulateScore, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export type { AppStatus, RepayStatus };
