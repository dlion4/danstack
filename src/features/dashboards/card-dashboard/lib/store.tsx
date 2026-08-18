import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  SEED_ALERTS,
  SEED_AUDIT,
  SEED_BILLING,
  SEED_CARDS,
  SEED_CREDIT_LINE,
  SEED_DEFAULTS,
  SEED_CREDIT_TXNS,
  SEED_FRAUD_EVENTS,
  SEED_LOADS,
  SEED_NOTIFS,
  SEED_POLICIES,
  SEED_PREPAID,
  SEED_REPAYMENTS,
  SEED_TXNS,
  SEED_VIOLATIONS,
  type AlertPrefs,
  type AuditLog,
  type BillingConfig,
  type CardChannels,
  type CardDefaults,
  type CreditLine,
  type CreditTxn,
  type FraudEvent,
  type LoadEvent,
  type Notif,
  type PmCard,
  type PrepaidCard,
  type Repayment,
  type SpendPolicy,
  type Txn,
} from "./data";
import { Icon, type IconName } from "../components/ui/icons";
import { cn } from "./utils/cn";
import { kes } from "./data";

/* ---------------- types ---------------- */

export type PageId = "5.1" | "5.2" | "5.3" | "5.4" | "5.5" | "5.6" | "5.7" | "5.8" | "5.9" | "5.10";

export type ModalState =
  | { type: "alerts"; cardId?: string }
  | { type: "issue" }
  | { type: "freeze"; cardId: string }
  | { type: "freezeAll" }
  | { type: "pin"; cardId: string }
  | { type: "limits"; cardId: string }
  | { type: "dispute"; txnId: string }
  | { type: "fraud" }
  | { type: "shortcuts" }
  | { type: "activate"; cardId: string }
  | { type: "replace"; cardId: string }
  | { type: "virtualIssue" }
  | { type: "virtualDetails"; cardId: string }
  | { type: "creditIssue" }
  | { type: "creditDetails"; cardId: string }
  | { type: "repay" }
  | { type: "statement" }
  | { type: "prepaidIssue" }
  | { type: "prepaidManage"; cardId: string }
  | { type: "topup"; cardId?: string }
  | { type: "billing" }
  | { type: "policy" }
  | { type: "approve"; approvalId: string }
  | { type: "violation"; violationId: string }
  | { type: "inviteEmployee" }
  | { type: "fraudWizard"; cardId?: string }
  | { type: "fraudEvent"; eventId: string }
  | { type: "reportBuilder" }
  | { type: "adminHealth" }
  | { type: "adminWebhook"; webhookId: string }
  | { type: "adminKey" }
  | { type: "settingsDefaults" }
  | null;

export type DrawerState = { type: "card"; cardId: string } | { type: "support" } | { type: "nav" } | null;

export interface Toast {
  id: number;
  kind: "success" | "info" | "warn" | "danger";
  title: string;
  msg?: string;
}

interface Store {
  page: PageId;
  setPage: (p: PageId) => void;
  creditLine: CreditLine;
  creditTxns: CreditTxn[];
  repayments: Repayment[];
  repayCredit: (amount: number, method: string) => void;
  setAutoDebit: (on: boolean) => void;
  prepaid: PrepaidCard[];
  loads: LoadEvent[];
  addPrepaid: (c: PrepaidCard) => void;
  topupPrepaid: (id: string, amount: number, source: string) => void;
  setPrepaidStatus: (id: string, status: PrepaidCard["status"]) => void;
  updatePrepaid: (id: string, patch: Partial<Pick<PrepaidCard, "monthlyLimit" | "mcc" | "reloadable" | "name">>) => void;
  retirePrepaid: (id: string) => void;
  billing: BillingConfig;
  policies: SpendPolicy[];
  violations: typeof SEED_VIOLATIONS;
  saveBilling: (b: BillingConfig) => void;
  togglePolicy: (id: string) => void;
  resolveViolation: (id: string, action: string) => void;
  cardDefaults: CardDefaults;
  saveDefaults: (d: CardDefaults) => void;
  fraudEvents: FraudEvent[];
  audit: AuditLog[];
  resolveFraudEvent: (id: string) => void;
  cards: PmCard[];
  txns: Txn[];
  alerts: AlertPrefs;
  notifs: Notif[];
  unread: number;
  modal: ModalState;
  drawer: DrawerState;
  openModal: (m: ModalState) => void;
  closeModal: () => void;
  openDrawer: (d: DrawerState) => void;
  closeDrawer: () => void;
  toast: (kind: Toast["kind"], title: string, msg?: string) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  saveAlerts: (p: AlertPrefs) => void;
  setCardStatus: (id: string, status: PmCard["status"]) => void;
  freezeAll: () => void;
  unfreezeAll: () => void;
  updateChannels: (id: string, ch: Partial<CardChannels>) => void;
  updateLimits: (id: string, limitMonth: number, limitPerTxn: number) => void;
  updateVirtualMeta: (id: string, meta: Pick<PmCard, "merchantLock" | "purpose" | "singleUse" | "requires3ds">) => void;
  fileDispute: (txnId: string, reason: string) => void;
  blockAndReplace: (cardId: string, txnIds: string[]) => void;
  addCard: (c: PmCard) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  pushNotif: (n: Omit<Notif, "id" | "time" | "read">) => void;
  syncing: boolean;
  sync: () => void;
  lastSync: string;
}

const Ctx = createContext<Store | null>(null);

const LS_KEY = "paymo-card-center-v1";

interface Persisted {
  alerts: AlertPrefs;
  cardStatus: Record<string, PmCard["status"]>;
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

/* ---------------- provider ---------------- */

export function AppProvider({
  children,
  onPageChange,
}: {
  children: ReactNode;
  /**
   * Called whenever the active module (PageId) changes so the host shell can
   * keep the URL in sync (e.g. navigate to /cards/app/<module>).
   */
  onPageChange?: (page: PageId) => void;
}) {
  const persisted = useRef(loadPersisted());

  const [cards, setCards] = useState<PmCard[]>(() =>
    SEED_CARDS.map((c) => (persisted.current?.cardStatus?.[c.id] ? { ...c, status: persisted.current.cardStatus[c.id] } : c))
  );
  const [txns, setTxns] = useState<Txn[]>(SEED_TXNS);
  const [alerts, setAlerts] = useState<AlertPrefs>(persisted.current?.alerts ?? SEED_ALERTS);
  const [page, setPageState] = useState<PageId>("5.1");

  const setPage = useCallback(
    (p: PageId) => {
      setPageState(p);
      onPageChange?.(p);
    },
    [onPageChange]
  );
  const [creditLine, setCreditLine] = useState<CreditLine>(SEED_CREDIT_LINE);
  const [creditTxns] = useState<CreditTxn[]>(SEED_CREDIT_TXNS);
  const [repayments, setRepayments] = useState<Repayment[]>(SEED_REPAYMENTS);
  const [prepaid, setPrepaid] = useState<PrepaidCard[]>(SEED_PREPAID);
  const [loads, setLoads] = useState<LoadEvent[]>(SEED_LOADS);
  const [billing, setBilling] = useState<BillingConfig>(SEED_BILLING);
  const [cardDefaults, setCardDefaults] = useState<CardDefaults>(SEED_DEFAULTS);
  const [policies, setPolicies] = useState<SpendPolicy[]>(SEED_POLICIES);
  const [violations, setViolations] = useState(SEED_VIOLATIONS);
  const [fraudEvents, setFraudEvents] = useState<FraudEvent[]>(SEED_FRAUD_EVENTS);
  const [audit, setAudit] = useState<AuditLog[]>(SEED_AUDIT);
  const [notifs, setNotifs] = useState<Notif[]>(SEED_NOTIFS);
  const [modal, setModal] = useState<ModalState>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("2 min ago");
  const toastId = useRef(0);
  const notifId = useRef(100);

  useEffect(() => {
    const cardStatus: Record<string, PmCard["status"]> = {};
    cards.forEach((c) => (cardStatus[c.id] = c.status));
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ alerts, cardStatus } satisfies Persisted));
    } catch {
      /* ignore */
    }
  }, [alerts, cards]);

  const toast = useCallback((kind: Toast["kind"], title: string, msg?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, kind, title, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const pushNotif = useCallback((n: Omit<Notif, "id" | "time" | "read">) => {
    setNotifs((prev) => [{ ...n, id: `n${++notifId.current}`, time: "Just now", read: false }, ...prev]);
  }, []);

  const saveAlerts = useCallback(
    (p: AlertPrefs) => {
      setAlerts(p);
      const chans = [p.push && "App Push", p.sms && "SMS", p.email && "Email"].filter(Boolean).join(", ");
      toast("success", "Alert preferences saved", `Delivering via ${chans || "no channels"}.`);
      pushNotif({ channel: "system", title: "Alert rules updated", body: p.allTxns ? "You will now be notified on every transaction." : `Large-transaction threshold set at KES ${p.threshold.toLocaleString()}.` });
    },
    [toast, pushNotif]
  );

  const setCardStatus = useCallback(
    (id: string, status: PmCard["status"]) => {
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    },
    []
  );

  const freezeAll = useCallback(() => {
    setCards((cs) => cs.map((c) => (c.status === "active" ? { ...c, status: "frozen" } : c)));
    toast("warn", "All active cards frozen", "Every active card was frozen instantly. Unfreeze individually when ready.");
    pushNotif({ channel: "push", title: "Portfolio freeze applied", body: "All active cards frozen from the Command Center." });
  }, [toast, pushNotif]);

  const unfreezeAll = useCallback(() => {
    setCards((cs) => cs.map((c) => (c.status === "frozen" ? { ...c, status: "active" } : c)));
    toast("success", "All frozen cards reactivated");
  }, [toast]);

  const updateChannels = useCallback((id: string, ch: Partial<CardChannels>) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, channels: { ...c.channels, ...ch } } : c)));
  }, []);

  const updateLimits = useCallback(
    (id: string, limitMonth: number, limitPerTxn: number) => {
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, limitMonth, limitPerTxn } : c)));
      toast("success", "Card limits updated", `Monthly KES ${limitMonth.toLocaleString()} · per-transaction KES ${limitPerTxn.toLocaleString()}.`);
    },
    [toast]
  );

  const updateVirtualMeta = useCallback((id: string, meta: Pick<PmCard, "merchantLock" | "purpose" | "singleUse" | "requires3ds">) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...meta } : c)));
  }, []);

  const fileDispute = useCallback(
    (txnId: string, reason: string) => {
      setTxns((ts) => ts.map((t) => (t.id === txnId ? { ...t, status: "Disputed", flagged: false } : t)));
      const txn = SEED_TXNS.find((t) => t.id === txnId);
      toast("success", "Dispute filed", `${txn?.merchant ?? "Transaction"} pushed to VISA/Mastercard. Resolution takes 7–14 days.`);
      pushNotif({ channel: "email", title: "Dispute opened", body: `${txn?.merchant ?? "A transaction"} — KES ${(txn?.amount ?? 0).toLocaleString()}. Reason: ${reason}.` });
    },
    [toast, pushNotif]
  );

  const blockAndReplace = useCallback(
    (cardId: string, txnIds: string[]) => {
      const old = cards.find((c) => c.id === cardId);
      if (!old) return;
      setCards((cs) => cs.map((c) => (c.id === cardId ? { ...c, status: "blocked" } : c)));
      if (txnIds.length) setTxns((ts) => ts.map((t) => (txnIds.includes(t.id) ? { ...t, status: "Disputed", flagged: false } : t)));
      const replacement: PmCard = {
        ...old,
        id: `c${Date.now()}`,
        nickname: `${old.nickname} (Replacement)`,
        kind: "virtual",
        tier: "single-use",
        last4: String(Math.floor(1000 + Math.random() * 9000)),
        panMask: "5210 44•• •••• " + String(Math.floor(1000 + Math.random() * 9000)),
        status: "active",
        issuedOn: "Today",
        spentMonth: 0,
        gradient: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)",
        tag: "Just issued",
      };
      setCards((cs) => [replacement, ...cs]);
      toast("success", "Card blocked & secured", "Old card cancelled. A virtual replacement was issued instantly.");
      pushNotif({ channel: "push", title: "Card permanently blocked", body: `${old.nickname} •• ${old.last4} was blocked. Replacement virtual card is live.` });
    },
    [cards, toast, pushNotif]
  );

  const addCard = useCallback(
    (c: PmCard) => {
      setCards((cs) => [c, ...cs]);
      pushNotif({ channel: "push", title: "Card issued", body: `${c.nickname} •• ${c.last4} is ready for use.` });
    },
    [pushNotif]
  );

  const repayCredit = useCallback(
    (amount: number, method: string) => {
      const applied = Math.min(amount, creditLine.outstanding);
      setCreditLine((cl) => ({ ...cl, outstanding: Math.max(0, cl.outstanding - applied), minimumDue: Math.max(0, Math.round(cl.minimumDue - applied)) }));
      setRepayments((rs) => [
        { id: `r${Date.now()}`, date: "Today", amount: applied, method, ref: `RBP-${Math.floor(95000 + Math.random() * 4000)}`, type: method.startsWith("Biz Wallet") ? "Wallet" : "Manual" },
        ...rs,
      ]);
      toast("success", "Payment received", `${kes(applied)} applied to your credit line. Available credit has increased.`);
      pushNotif({ channel: "push", title: "Credit payment posted", body: `${kes(applied)} repaid via ${method}. Statement balance updated.` });
    },
    [creditLine.outstanding, toast, pushNotif]
  );

  const setAutoDebit = useCallback(
    (on: boolean) => {
      setCreditLine((cl) => ({ ...cl, autoDebit: on }));
      toast(on ? "success" : "warn", `Auto-debit ${on ? "enabled" : "disabled"}`, on ? "The statement minimum will be debited on the due date." : "You must settle manually before the due date.");
    },
    [toast]
  );

  /* ---- prepaid actions ---- */
  const addPrepaid = useCallback(
    (c: PrepaidCard) => {
      setPrepaid((ps) => [c, ...ps]);
      if (c.loaded > 0) setLoads((ls) => [{ id: `l${Date.now()}`, cardId: c.id, date: "Today", kind: "Top-up", merchant: "Initial load", amount: c.loaded, source: "Biz Wallet" }, ...ls]);
      pushNotif({ channel: "push", title: "Prepaid card issued", body: `${c.name} •• ${c.last4} loaded with ${kes(c.loaded)}.` });
    },
    [pushNotif]
  );

  const topupPrepaid = useCallback(
    (id: string, amount: number, source: string) => {
      setPrepaid((ps) => ps.map((p) => (p.id === id ? { ...p, balance: p.balance + amount, loaded: p.loaded + amount, status: p.status === "depleted" ? "active" : p.status } : p)));
      const card = prepaid.find((p) => p.id === id);
      setLoads((ls) => [{ id: `l${Date.now()}`, cardId: id, date: "Today", kind: "Top-up", merchant: "Wallet top-up", amount, source }, ...ls]);
      toast("success", "Top-up successful", `${kes(amount)} added to ${card?.name ?? "card"}. New balance available immediately.`);
      pushNotif({ channel: "push", title: "Prepaid top-up", body: `${kes(amount)} loaded to ${card?.name ?? "card"} •• ${card?.last4 ?? ""} from ${source}.` });
    },
    [prepaid, toast, pushNotif]
  );

  const setPrepaidStatus = useCallback(
    (id: string, status: PrepaidCard["status"]) => {
      setPrepaid((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)));
      const card = prepaid.find((p) => p.id === id);
      if (status === "frozen") toast("warn", `${card?.name ?? "Card"} frozen`, "New authorisations will decline until unfrozen.");
      else if (status === "active") toast("success", `${card?.name ?? "Card"} reactivated`);
    },
    [prepaid, toast]
  );

  const updatePrepaid = useCallback(
    (id: string, patch: Partial<Pick<PrepaidCard, "monthlyLimit" | "mcc" | "reloadable" | "name">>) => {
      setPrepaid((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      toast("success", "Card controls saved", "Prepaid limits and category lock updated.");
    },
    [toast]
  );

  const retirePrepaid = useCallback(
    (id: string) => {
      const card = prepaid.find((p) => p.id === id);
      setPrepaid((ps) => ps.map((p) => (p.id === id ? { ...p, status: "retired", balance: 0 } : p)));
      if (card && card.balance > 0) setLoads((ls) => [{ id: `l${Date.now()}`, cardId: id, date: "Today", kind: "Refund", merchant: "Balance refund to wallet", amount: card.balance, source: "Biz Wallet" }, ...ls]);
      toast("info", `${card?.name ?? "Card"} retired`, card && card.balance > 0 ? `${kes(card.balance)} refunded to your Biz Wallet.` : "The card is now closed.");
    },
    [prepaid, toast]
  );

  /* ---- corporate programme actions ---- */
  const saveBilling = useCallback(
    (b: BillingConfig) => {
      setBilling(b);
      toast("success", "Programme billing saved", `${b.autoDebit ? "Auto-debit on" : "Manual settlement"} · cycle ends day ${b.cycleEndDay} · ${b.graceDays}-day grace.`);
      pushNotif({ channel: "system", title: "Billing configuration updated", body: `Liability model set to ${b.liability}. Settlement via ${b.settlementAccount}.` });
    },
    [toast, pushNotif]
  );

  const togglePolicy = useCallback(
    (id: string) => {
      setPolicies((ps) => {
        const next = ps.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
        const changed = next.find((p) => p.id === id);
        if (changed) toast(changed.enabled ? "success" : "warn", `${changed.title} ${changed.enabled ? "enabled" : "disabled"}`, "Applied to every employee card in the programme.");
        return next;
      });
    },
    [toast]
  );

  const resolveViolation = useCallback(
    (id: string, action: string) => {
      const v = violations.find((x) => x.id === id);
      setViolations((vs) => vs.filter((x) => x.id !== id));
      toast(action === "card" ? "warn" : "success", `Violation ${action === "card" ? "escalated" : "resolved"}`, `${v?.holder} · ${v?.violation}.`);
    },
    [violations, toast]
  );

  const resolveFraudEvent = useCallback(
    (id: string) => {
      const ev = fraudEvents.find((e) => e.id === id);
      setFraudEvents((es) => es.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
      setAudit((as) => [{ id: `au${Date.now()}`, time: "Just now", actor: "David A.", action: "Resolved fraud event", target: ev?.title ?? "Fraud event", outcome: "success" }, ...as]);
      toast("success", "Fraud event resolved", `${ev?.title} marked as investigated and closed.`);
      pushNotif({ channel: "push", title: "Fraud event closed", body: `${ev?.title} has been resolved and archived.` });
    },
    [fraudEvents, toast, pushNotif]
  );

  const saveDefaults = useCallback(
    (d: CardDefaults) => {
      setCardDefaults(d);
      toast("success", "Programme defaults saved", "New cards will inherit these settings automatically.");
      pushNotif({ channel: "system", title: "Card defaults updated", body: `Funding ${d.fundingSource} · currency ${d.currency} · online ${d.online ? "on" : "off"} · contactless ${d.contactless ? "on" : "off"} · ATM ${d.atm ? "on" : "off"}.` });
    },
    [toast, pushNotif]
  );

  const markAllRead = useCallback(() => setNotifs((ns) => ns.map((n) => ({ ...n, read: true }))), []);
  const markRead = useCallback((id: string) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n))), []);

  const sync = useCallback(() => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      setLastSync("just now");
      toast("success", "Portfolio synced", "Card balances, limits and gateway health are up to date.");
    }, 1100);
  }, [syncing, toast]);

  const value = useMemo<Store>(
    () => ({
      page,
      setPage,
      creditLine,
      creditTxns,
      repayments,
      repayCredit,
      setAutoDebit,
      prepaid,
      loads,
      addPrepaid,
      topupPrepaid,
      setPrepaidStatus,
      updatePrepaid,
      retirePrepaid,
      billing,
      policies,
      saveBilling,
      togglePolicy,
      resolveViolation,
      violations,
      cardDefaults,
      saveDefaults,
      fraudEvents,
      audit,
      resolveFraudEvent,
      cards,
      txns,
      alerts,
      notifs,
      unread: notifs.filter((n) => !n.read).length,
      modal,
      drawer,
      openModal: setModal,
      closeModal: () => setModal(null),
      openDrawer: setDrawer,
      closeDrawer: () => setDrawer(null),
      toast,
      toasts,
      dismissToast,
      saveAlerts,
      setCardStatus,
      freezeAll,
      unfreezeAll,
      updateChannels,
      updateLimits,
      updateVirtualMeta,
      fileDispute,
      blockAndReplace,
      addCard,
      markAllRead,
      markRead,
      pushNotif,
      syncing,
      sync,
      lastSync,
    }),
    [page, setPage, creditLine, creditTxns, repayments, repayCredit, setAutoDebit, prepaid, loads, billing, policies, saveBilling, togglePolicy, resolveViolation, violations, cardDefaults, saveDefaults, fraudEvents, audit, resolveFraudEvent, addPrepaid, topupPrepaid, setPrepaidStatus, updatePrepaid, retirePrepaid, cards, txns, alerts, notifs, modal, drawer, toasts, syncing, lastSync, toast, dismissToast, saveAlerts, setCardStatus, freezeAll, unfreezeAll, updateChannels, updateLimits, updateVirtualMeta, fileDispute, blockAndReplace, addCard, markAllRead, markRead, pushNotif, sync]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useApp outside provider");
  return s;
}

/* ---------------- toast viewport ---------------- */

export function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  const iconFor: Record<Toast["kind"], IconName> = { success: "checkCircle", info: "info", warn: "alertTri", danger: "alertTri" };
  const toneFor: Record<Toast["kind"], string> = {
    success: "bg-pmgreen-soft text-[#067647]",
    info: "bg-pmblue-soft text-[#175cd3]",
    warn: "bg-warn-soft text-[#93370d]",
    danger: "bg-danger-soft text-[#b42318]",
  };
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[95] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 lg:bottom-24">
      {toasts.map((t) => (
        <div key={t.id} className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-pm-lg">
          <span className={cn("mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg", toneFor[t.kind])}>
            <Icon name={iconFor[t.kind]} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold leading-snug text-ink">{t.title}</p>
            {t.msg && <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{t.msg}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="grid h-6 w-6 flex-none place-items-center rounded-md text-faint transition hover:bg-canvas hover:text-ink">
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- scroll helper ---------------- */

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
