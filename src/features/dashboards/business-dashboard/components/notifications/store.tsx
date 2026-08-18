import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, ALERT_RULES, CATEGORY_PREFS, DELIVERY_LOG, DIGEST_SCHEDULE,
  NOTIFS, NOTIFICATIONS, QUIET_HOURS, TEMPLATES,
} from "./data";
import type {
  Activity, AlertRule, CategoryPref, Channel, DeliveryLog, DeliveryStatus, NotifCategory,
  NotifItem, NotifPriority, Notification, QuietHour, Template,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  notifs: NotifItem[];
  prefs: CategoryPref[];
  rules: AlertRule[];
  deliveryLog: DeliveryLog[];
  quietHours: QuietHour[];
  templates: Template[];
  digest: typeof DIGEST_SCHEDULE;
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
  /* inbox */
  markRead: (id: string) => void;
  markAllRead: () => void;
  archive: (id: string) => void;
  unarchive: (id: string) => void;
  deleteNotif: (id: string) => void;
  muteCategory: (cat: NotifCategory, until: string) => void;
  unmuteCategory: (cat: NotifCategory) => void;
  /* prefs */
  toggleChannel: (cat: NotifCategory, channel: Channel, on: boolean) => void;
  setPriorityMin: (cat: NotifCategory, p: NotifPriority) => void;
  toggleDigests: (cat: NotifCategory, on: boolean) => void;
  /* rules */
  createRule: (r: Omit<AlertRule, "id" | "fired">) => string;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  /* quiet hours */
  addQuietHour: (q: Omit<QuietHour, "id">) => string;
  toggleQuietHour: (id: string) => void;
  removeQuietHour: (id: string) => void;
  /* templates & digest */
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  saveDigest: (patch: Partial<typeof DIGEST_SCHEDULE>) => void;
  retryDelivery: (logId: string) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business] = useState("TS Retail Ltd");
  const [notifs, setNotifs] = useState<NotifItem[]>(NOTIFS);
  const [prefs, setPrefs] = useState<CategoryPref[]>(CATEGORY_PREFS);
  const [rules, setRules] = useState<AlertRule[]>(ALERT_RULES);
  const [deliveryLog, setDeliveryLog] = useState<DeliveryLog[]>(DELIVERY_LOG);
  const [quietHours, setQuietHours] = useState<QuietHour[]>(QUIET_HOURS);
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [digest, setDigest] = useState(DIGEST_SCHEDULE);
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

  /* ---------- inbox ---------- */
  const markRead = useCallback((id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast("All notifications marked as read.", "info", "Inbox cleared");
  }, [toast]);
  const archive = useCallback((id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true, unread: false } : n)));
  }, []);
  const unarchive = useCallback((id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, archived: false } : n)));
  }, []);
  const deleteNotif = useCallback((id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    toast("Notification deleted.", "info", "Deleted");
  }, [toast]);
  const muteCategory = useCallback((cat: NotifCategory, until: string) => {
    setPrefs((prev) => prev.map((p) => (p.id === cat ? { ...p, muted: true } : p)));
    recordActivity(`Muted ${cat} alerts ${until}`, "bi-bell-slash");
    toast(`${cat} alerts muted ${until}. Urgent KRA & security alerts still come through.`, "info", "Category muted");
  }, [recordActivity, toast]);
  const unmuteCategory = useCallback((cat: NotifCategory) => {
    setPrefs((prev) => prev.map((p) => (p.id === cat ? { ...p, muted: false } : p)));
    toast(`${cat} alerts unmuted.`, "success", "Mute lifted");
  }, [toast]);

  /* ---------- prefs ---------- */
  const toggleChannel = useCallback((cat: NotifCategory, channel: Channel, on: boolean) => {
    setPrefs((prev) => prev.map((p) => (p.id === cat ? { ...p, channels: { ...p.channels, [channel]: on } } : p)));
  }, []);
  const setPriorityMin = useCallback((cat: NotifCategory, p: NotifPriority) => {
    setPrefs((prev) => prev.map((x) => (x.id === cat ? { ...x, priorityMin: p } : x)));
  }, []);
  const toggleDigests = useCallback((cat: NotifCategory, on: boolean) => {
    setPrefs((prev) => prev.map((p) => (p.id === cat ? { ...p, digests: on } : p)));
  }, []);

  /* ---------- rules ---------- */
  const createRule = useCallback((r: Omit<AlertRule, "id" | "fired">) => {
    const id = "r" + Date.now();
    setRules((prev) => [{ ...r, id, fired: 0 }, ...prev]);
    recordActivity(`Alert rule created: ${r.name}`, "bi-plus-circle");
    return id;
  }, [recordActivity]);
  const toggleRule = useCallback((id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Paused" as const : "Active" as const } : r)));
  }, []);
  const deleteRule = useCallback((id: string) => {
    const r = rules.find((x) => x.id === id);
    setRules((prev) => prev.filter((x) => x.id !== id));
    recordActivity(`Alert rule deleted: ${r?.name}`, "bi-trash");
    toast(`Rule "${r?.name}" deleted.`, "warning", "Rule removed");
  }, [rules, recordActivity, toast]);

  /* ---------- quiet hours ---------- */
  const addQuietHour = useCallback((q: Omit<QuietHour, "id">) => {
    const id = "q" + Date.now();
    setQuietHours((prev) => [...prev, { ...q, id }]);
    recordActivity(`Quiet hours added: ${q.label}`, "bi-moon");
    return id;
  }, [recordActivity]);
  const toggleQuietHour = useCallback((id: string) => {
    setQuietHours((prev) => prev.map((q) => (q.id === id ? { ...q, active: !q.active } : q)));
  }, []);
  const removeQuietHour = useCallback((id: string) => {
    setQuietHours((prev) => prev.filter((q) => q.id !== id));
    toast("Quiet hours removed.", "info", "Removed");
  }, [toast]);

  /* ---------- templates & digest ---------- */
  const updateTemplate = useCallback((id: string, patch: Partial<Template>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);
  const saveDigest = useCallback((patch: Partial<typeof DIGEST_SCHEDULE>) => {
    setDigest((d) => ({ ...d, ...patch }));
  }, []);
  const retryDelivery = useCallback((logId: string) => {
    setDeliveryLog((prev) => prev.map((l) => {
      if (l.id !== logId) return l;
      return { ...l, status: "Delivered" as DeliveryStatus, attempts: l.attempts + 1, note: "Retried successfully" };
    }));
    recordActivity(`Delivery retried: ${logId}`, "bi-arrow-repeat");
    toast("Notification re-delivered successfully.", "success", "Retry complete");
  }, [recordActivity, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, notifs, prefs, rules, deliveryLog, quietHours, templates, digest, notifications, activity,
    searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    markRead, markAllRead, archive, unarchive, deleteNotif, muteCategory, unmuteCategory, toggleChannel,
    setPriorityMin, toggleDigests, createRule, toggleRule, deleteRule, addQuietHour, toggleQuietHour,
    removeQuietHour, updateTemplate, saveDigest, retryDelivery, markNotifsRead, dismissNotif,
  }), [business, notifs, prefs, rules, deliveryLog, quietHours, templates, digest, notifications, activity,
    searchQuery, modal, toasts, openModal, closeModal, toast, dismissToast, recordActivity, markRead,
    markAllRead, archive, unarchive, deleteNotif, muteCategory, unmuteCategory, toggleChannel, setPriorityMin,
    toggleDigests, createRule, toggleRule, deleteRule, addQuietHour, toggleQuietHour, removeQuietHour,
    updateTemplate, saveDigest, retryDelivery, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
