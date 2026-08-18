import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ACTIVITY_FEED, ATTENTION_ITEMS, KPI_CARDS, NOTIFICATIONS } from "../../dataDashboard";
import type { ActivityItem, AttentionItem } from "../../dataDashboard";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  kpis: typeof KPI_CARDS;
  attention: AttentionItem[];
  activity: ActivityItem[];
  notifications: typeof NOTIFICATIONS;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  modal: ModalState | null;
  openModal: (name: string, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  toasts: Toast[];
  toast: (msg: string, type?: ToastType, title?: string) => void;
  dismissToast: (id: number) => void;
  recordActivity: (text: string, icon?: string) => void;
  dismissAttention: (id: string) => void;
  snoozeAttention: (id: string, hours: number) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [kpis] = useState(KPI_CARDS);
  const [attention, setAttention] = useState<AttentionItem[]>(ATTENTION_ITEMS);
  const [activity, setActivity] = useState<ActivityItem[]>(ACTIVITY_FEED);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
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
    setActivity((a) => [{ time: "Just now", icon, title: text, by: "You", module: "Dashboard" }, ...a].slice(0, 30));
  }, []);
  const dismissAttention = useCallback((attId: string) => {
    setAttention((prev) => prev.filter((x) => x.id !== attId));
  }, []);
  const snoozeAttention = useCallback((_attId: string, hours: number) => {
    toast(`Item snoozed for ${hours}h.`, "info");
  }, [toast]);
  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, kpis, attention, activity, notifications, searchQuery,
    setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    dismissAttention, snoozeAttention, markNotifsRead, dismissNotif,
  }), [business, kpis, attention, activity, notifications, searchQuery, modal, toasts,
    openModal, closeModal, toast, dismissToast, recordActivity, dismissAttention,
    snoozeAttention, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
