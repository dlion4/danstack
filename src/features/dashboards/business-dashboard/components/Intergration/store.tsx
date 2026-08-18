import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, API_USAGE, API_KEYS, APPS, AUTOMATIONS, CONNECTIONS, NOTIFICATIONS, SYNC_ERRORS, SYNC_LOG, WEBHOOKS,
} from "./data";
import type {
  Activity, ApiKey, Automation, Connection, ConnStatus, FieldMap, Notification, SyncError, SyncLog, Webhook,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  connections: Connection[];
  errors: SyncError[];
  webhooks: Webhook[];
  syncLog: SyncLog[];
  apiKeys: ApiKey[];
  automations: Automation[];
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
  /* integration actions */
  installApp: (appId: string) => string;
  uninstallApp: (id: string) => void;
  reconnectApp: (id: string) => void;
  retryError: (id: string) => void;
  syncConnection: (id: string, records: number) => void;
  syncAllHealthy: () => number;
  createWebhook: (name: string, url: string, events: string[], secret: boolean) => string;
  testWebhook: (id: string) => void;
  toggleWebhook: (id: string) => void;
  deleteWebhook: (id: string) => void;
  createApiKey: (name: string, scopes: string[]) => string;
  revokeApiKey: (id: string) => void;
  toggleAutomation: (id: string) => void;
  createAutomation: (name: string, trigger: string, action: string) => void;
  saveMapping: (appId: string, maps: FieldMap[]) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [connections, setConnections] = useState<Connection[]>(CONNECTIONS);
  const [errors, setErrors] = useState<SyncError[]>(SYNC_ERRORS);
  const [webhooks, setWebhooks] = useState<Webhook[]>(WEBHOOKS);
  const [syncLog, setSyncLog] = useState<SyncLog[]>(SYNC_LOG);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(API_KEYS);
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activity, setActivity] = useState<Activity[]>(ACTIVITY);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  void API_USAGE;

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

  const pushLog = useCallback((l: Omit<SyncLog, "id">) => {
    setSyncLog((prev) => [{ ...l, id: "sl" + Date.now() }, ...prev].slice(0, 40));
  }, []);

  /* ---------- install / uninstall ---------- */
  const installApp = useCallback((appId: string) => {
    const app = APPS.find((a) => a.id === appId);
    if (!app) return "";
    const id = "c" + Date.now();
    const conn: Connection = {
      id, appId, name: app.name, initials: app.initials, color: app.color, icon: app.icon,
      status: "Syncing", lastSync: "Connecting…", uptime: "—", records: 0,
      direction: "Two-way", frequency: "Every 15 min", errors: 0, scopes: ["Core data"], realtime: false,
    };
    setConnections((prev) => [conn, ...prev]);
    recordActivity(`${app.name} connected — initial sync started`, "bi-puzzle");
    return id;
  }, [recordActivity]);

  const uninstallApp = useCallback((id: string) => {
    const conn = connections.find((c) => c.id === id);
    setConnections((prev) => prev.filter((c) => c.id !== id));
    recordActivity(`${conn?.name ?? id} disconnected & data links removed`, "bi-plug");
    toast(`${conn?.name ?? "App"} disconnected. Linked records stay in your ledger.`, "info", "App disconnected");
  }, [connections, recordActivity, toast]);

  const reconnectApp = useCallback((id: string) => {
    const conn = connections.find((c) => c.id === id);
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Healthy" as ConnStatus, lastSync: "Just now", tokenExpiry: undefined, errors: 0 } : c)));
    setErrors((prev) => prev.filter((e) => e.app !== conn?.name));
    recordActivity(`${conn?.name ?? id} re-authenticated — sync resumed`, "bi-arrow-repeat");
    toast(`${conn?.name ?? "App"} reconnected. Pending data syncs in the background.`, "success", "Reconnected");
  }, [connections, recordActivity, toast]);

  const retryError = useCallback((id: string) => {
    const err = errors.find((e) => e.id === id);
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Resolved" as const, attempts: e.attempts + 1 } : e)));
    if (err) {
      setConnections((prev) => prev.map((c) => (c.name === err.app ? { ...c, status: "Healthy" as ConnStatus, lastSync: "Just now" } : c)));
      pushLog({ time: "Just now", app: err.app, initials: err.initials, color: err.color, direction: "Retry · queued", records: 0, duration: "0.6s", status: "Success" });
    }
    recordActivity(`Retried sync for ${err?.app ?? id} — success`, "bi-arrow-repeat");
    toast(`${err?.app ?? "Sync"} retried successfully — error cleared.`, "success", "Retry succeeded");
  }, [errors, pushLog, recordActivity, toast]);

  const syncConnection = useCallback((id: string, records: number) => {
    const conn = connections.find((c) => c.id === id);
    if (!conn) return;
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Healthy" as ConnStatus, lastSync: "Just now", records: c.records + records, errors: 0 } : c)));
    pushLog({ time: "Just now", app: conn.name, initials: conn.initials, color: conn.color, direction: "Manual sync · two-way", records, duration: (records / 40).toFixed(1) + "s", status: "Success" });
  }, [connections, pushLog]);

  const syncAllHealthy = useCallback(() => {
    const healthy = connections.filter((c) => c.status === "Healthy");
    healthy.forEach((c) => syncConnection(c.id, 10 + Math.floor(Math.random() * 60)));
    recordActivity(`Sync Now — ${healthy.length} connections refreshed`, "bi-arrow-repeat");
    return healthy.length;
  }, [connections, syncConnection, recordActivity]);

  /* ---------- webhooks ---------- */
  const createWebhook = useCallback((name: string, url: string, events: string[], secret: boolean) => {
    const id = "w" + Date.now();
    setWebhooks((prev) => [{ id, name, url, events, status: "Active" as const, secret, deliveries: [] }, ...prev]);
    recordActivity(`Webhook "${name}" created (${events.length} events)`, "bi-hdd-network");
    return id;
  }, [recordActivity]);

  const testWebhook = useCallback((id: string) => {
    const wh = webhooks.find((w) => w.id === id);
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, deliveries: [{ time: "Just now", code: 200, status: "Delivered", payload: '{"event":"ping.test","ok":true}' }, ...w.deliveries] } : w)));
    recordActivity(`Test webhook sent to ${wh?.name ?? id} — 200 OK (38ms)`, "bi-hdd-network");
    toast(`Test event delivered to ${wh?.name ?? "webhook"} — HTTP 200 in 38ms.`, "success", "Webhook works");
  }, [webhooks, recordActivity, toast]);

  const toggleWebhook = useCallback((id: string) => {
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, status: w.status === "Active" ? "Paused" as const : "Active" as const } : w)));
  }, []);

  const deleteWebhook = useCallback((id: string) => {
    const wh = webhooks.find((w) => w.id === id);
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    recordActivity(`Webhook "${wh?.name ?? id}" deleted`, "bi-trash");
    toast(`Webhook "${wh?.name ?? id}" removed.`, "info", "Webhook deleted");
  }, [webhooks, recordActivity, toast]);

  /* ---------- API keys ---------- */
  const createApiKey = useCallback((name: string, scopes: string[]) => {
    const key: ApiKey = {
      id: "k" + Date.now(), name, prefix: "pk_live_" + Math.random().toString(16).slice(2, 8) + "…" + Math.random().toString(16).slice(2, 6),
      scopes, created: "Just now", lastUsed: "Never", requests: 0,
    };
    setApiKeys((prev) => [key, ...prev]);
    recordActivity(`API key "${name}" created (${scopes.join(", ")})`, "bi-key");
    return key.prefix;
  }, [recordActivity]);

  const revokeApiKey = useCallback((id: string) => {
    const key = apiKeys.find((k) => k.id === id);
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    recordActivity(`API key "${key?.name ?? id}" revoked`, "bi-key");
    toast(`Key "${key?.name ?? id}" revoked — calls using it now fail with 401.`, "warning", "Key revoked");
  }, [apiKeys, recordActivity, toast]);

  /* ---------- automations ---------- */
  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, status: a.status === "Active" ? "Paused" as const : "Active" as const } : a)));
  }, []);

  const createAutomation = useCallback((name: string, trigger: string, action: string) => {
    setAutomations((prev) => [{ id: "a" + Date.now(), name, trigger, action, runs: 0, status: "Active" as const }, ...prev]);
    recordActivity(`Automation "${name}" created (${trigger} → ${action})`, "bi-lightning-charge");
  }, [recordActivity]);

  /* ---------- mapping ---------- */
  const saveMapping = useCallback((appId: string, maps: FieldMap[]) => {
    const conn = connections.find((c) => c.id === appId);
    recordActivity(`Field mapping saved for ${conn?.name ?? appId} — ${maps.length} field(s)`, "bi-diagram-3");
    toast(`Mapping saved — next sync applies ${maps.length} field rules for ${conn?.name ?? appId}.`, "success", "Mapping saved");
  }, [connections, recordActivity, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, connections, errors, webhooks, syncLog, apiKeys, automations, notifications, activity,
    searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    installApp, uninstallApp, reconnectApp, retryError, syncConnection, syncAllHealthy, createWebhook, testWebhook,
    toggleWebhook, deleteWebhook, createApiKey, revokeApiKey, toggleAutomation, createAutomation, saveMapping,
    markNotifsRead, dismissNotif,
  }), [business, connections, errors, webhooks, syncLog, apiKeys, automations, notifications, activity, searchQuery,
    modal, toasts, openModal, closeModal, toast, dismissToast, recordActivity, installApp, uninstallApp, reconnectApp,
    retryError, syncConnection, syncAllHealthy, createWebhook, testWebhook, toggleWebhook, deleteWebhook, createApiKey,
    revokeApiKey, toggleAutomation, createAutomation, saveMapping, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
