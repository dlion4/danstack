import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib";
import { Icon, Logo, type IconName } from "../ui/icons";
import { Badge, Drawer } from "../ui";
import { useApp, scrollToId } from "../../lib";
import { MODULES } from "../../lib";

/* ================= Sidebar ================= */

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  anchor: string;
  badge?: string;
  badgeTone?: "danger" | "warn";
  filter?: string;
}

const NAV_51: NavItem[] = [
  { id: "overview", label: "Command Center", icon: "gauge", anchor: "overview" },
  { id: "cards", label: "My Cards", icon: "card", anchor: "cards" },
  { id: "alerts", label: "Alerts & Notifications", icon: "bell", anchor: "alerts" },
  { id: "transactions", label: "Transactions", icon: "wallet", anchor: "transactions" },
  { id: "security", label: "Security & Fraud", icon: "shield", anchor: "security", badge: "1", badgeTone: "danger" },
  { id: "analytics", label: "Analytics", icon: "chart", anchor: "analytics" },
  { id: "program", label: "Programme & Health", icon: "building", anchor: "program" },
  { id: "settings", label: "Settings & Support", icon: "sliders", anchor: "settings" },
];

const NAV_52: NavItem[] = [
  { id: "overview", label: "Tier Comparison", icon: "gauge", anchor: "overview" },
  { id: "orders", label: "Card Orders", icon: "inbox", anchor: "orders" },
  { id: "mycards", label: "My Physical Cards", icon: "card", anchor: "mycards" },
  { id: "fees", label: "Fee Schedule", icon: "wallet", anchor: "fees" },
  { id: "addresses", label: "Delivery Addresses", icon: "building", anchor: "addresses" },
  { id: "replacement", label: "Replacement", icon: "refresh", anchor: "replacement" },
];

const NAV_53: NavItem[] = [
  { id: "overview", label: "Virtual Debit Center", icon: "gauge", anchor: "overview" },
  { id: "virtual-cards", label: "Virtual Cards", icon: "card", anchor: "virtual-cards" },
  { id: "guardrails", label: "Security Guardrails", icon: "shield", anchor: "guardrails" },
  { id: "funding", label: "Funding & Limits", icon: "wallet", anchor: "funding" },
  { id: "activity", label: "Virtual Activity", icon: "chart", anchor: "activity" },
  { id: "best-practice", label: "Best Practices", icon: "spark", anchor: "best-practice" },
];

const NAV_54: NavItem[] = [
  { id: "overview", label: "Credit Center", icon: "gauge", anchor: "overview" },
  { id: "credit-line", label: "Credit Line & Statement", icon: "wallet", anchor: "credit-line" },
  { id: "credit-cards", label: "Virtual Credit Cards", icon: "card", anchor: "credit-cards" },
  { id: "repayment", label: "Repayment & Billing", icon: "refresh", anchor: "repayment" },
  { id: "credit-activity", label: "Credit Activity", icon: "chart", anchor: "credit-activity" },
  { id: "credit-insights", label: "Fees & Insights", icon: "spark", anchor: "credit-insights" },
];

const NAV_55: NavItem[] = [
  { id: "overview", label: "Prepaid Center", icon: "gauge", anchor: "overview" },
  { id: "prepaid-cards", label: "Prepaid Cards", icon: "card", anchor: "prepaid-cards" },
  { id: "balances", label: "Balances & Reloads", icon: "wallet", anchor: "balances" },
  { id: "controls", label: "Limits & MCC Locks", icon: "shield", anchor: "controls" },
  { id: "prepaid-activity", label: "Load & Spend Activity", icon: "chart", anchor: "prepaid-activity" },
  { id: "prepaid-fees", label: "Fees & Guide", icon: "spark", anchor: "prepaid-fees" },
];

const NAV_56: NavItem[] = [
  { id: "overview", label: "Programme Overview", icon: "gauge", anchor: "overview" },
  { id: "departments", label: "Departments & Budgets", icon: "building", anchor: "departments" },
  { id: "employees", label: "Employee Cards", icon: "users", anchor: "employees" },
  { id: "policies", label: "Spend Policies", icon: "shield", anchor: "policies" },
  { id: "approvals", label: "Approvals & Violations", icon: "flag", anchor: "approvals", badge: "3", badgeTone: "warn" },
  { id: "program-billing", label: "Billing & Settlement", icon: "wallet", anchor: "program-billing" },
];

const NAV_57: NavItem[] = [
  { id: "overview", label: "Security Overview", icon: "gauge", anchor: "overview" },
  { id: "fraud-events", label: "Fraud Events", icon: "flag", anchor: "fraud-events", badge: "2", badgeTone: "danger" },
  { id: "safeguards", label: "Safeguards & Rules", icon: "shield", anchor: "safeguards" },
  { id: "report-card", label: "Report a Compromise", icon: "alertTri", anchor: "report-card" },
  { id: "suspicious", label: "Review Transactions", icon: "search", anchor: "suspicious" },
  { id: "audit-log", label: "Audit Log", icon: "clock", anchor: "audit-log" },
];

const NAV_58: NavItem[] = [
  { id: "overview", label: "Analytics Overview", icon: "gauge", anchor: "overview" },
  { id: "issuance", label: "Issuance & Activation", icon: "card", anchor: "issuance" },
  { id: "revenue", label: "Usage & Revenue", icon: "chart", anchor: "revenue" },
  { id: "concentration", label: "Merchant Concentration", icon: "pie", anchor: "concentration" },
  { id: "corporate-spend", label: "Corporate & Risk", icon: "building", anchor: "corporate-spend" },
  { id: "insights", label: "Insights & Forecast", icon: "spark", anchor: "insights" },
];

const NAV_59: NavItem[] = [
  { id: "overview", label: "System Health", icon: "gauge", anchor: "overview" },
  { id: "gateway-logs", label: "Gateway Logs", icon: "refresh", anchor: "gateway-logs" },
  { id: "integrations", label: "Webhooks & API Keys", icon: "key", anchor: "integrations" },
  { id: "admin-access", label: "Admin Access", icon: "users", anchor: "admin-access" },
  { id: "environment", label: "Environment & Maintenance", icon: "building", anchor: "environment" },
];

const NAV_510: NavItem[] = [
  { id: "overview", label: "Settings & Support", icon: "gauge", anchor: "overview" },
  { id: "card-defaults", label: "Programme Defaults", icon: "sliders", anchor: "card-defaults" },
  { id: "support", label: "Get Support", icon: "headset", anchor: "support" },
  { id: "faq", label: "Help & FAQs", icon: "help", anchor: "faq" },
  { id: "resources", label: "Resources & Trust", icon: "shieldCheck", anchor: "resources" },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [active, setActive] = useState("overview");
  const { openModal, openDrawer, page, setPage } = useApp();

  const NAV_MAIN = page === "5.10" ? NAV_510 : page === "5.9" ? NAV_59 : page === "5.8" ? NAV_58 : page === "5.7" ? NAV_57 : page === "5.6" ? NAV_56 : page === "5.5" ? NAV_55 : page === "5.4" ? NAV_54 : page === "5.3" ? NAV_53 : page === "5.2" ? NAV_52 : NAV_51;

  useEffect(() => {
    const ids = [...NAV_MAIN.map((n) => n.anchor)];
    const onScroll = () => {
      let current = NAV_MAIN[0]?.anchor ?? "overview";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  const go = (anchor: string, filter?: string) => {
    scrollToId(anchor);
    if (filter) window.dispatchEvent(new CustomEvent("pm-card-filter", { detail: filter }));
    onNavigate?.();
  };

  const goPage = (p: "5.1" | "5.2" | "5.3" | "5.4" | "5.5" | "5.6" | "5.7" | "5.8" | "5.9" | "5.10", anchor?: string, filter?: string) => {
    setPage(p);
    onNavigate?.();
    if (anchor) window.setTimeout(() => scrollToId(anchor), 120);
    if (filter) window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-card-filter", { detail: filter })), 120);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <Logo size={32} />
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold text-white">PayMo</p>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#7c8aa0]">BAAS · Cards</p>
        </div>
      </div>

      {/* Business switcher */}
      <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-pmgreen/20 text-pmgreen">
            <Icon name="building" size={16} />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] font-bold text-white">Acme Traders Ltd</p>
            <p className="text-[10.5px] text-[#7c8aa0]">KRA P051 882 440M</p>
          </div>
          <Icon name="chevDown" size={14} className="text-[#7c8aa0]" />
        </div>
      </div>

      <nav className="dark-scroll flex-1 overflow-y-auto px-4 pb-4">
        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5d6b82]">Card Center</p>
        <ul className="space-y-0.5">
          {NAV_MAIN.map((n) => {
            const isOn = active === n.anchor;
            return (
              <li key={n.id}>
                <button
                  onClick={() => go(n.anchor)}
                  className={cn(
                    "group relative flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-semibold transition-all duration-150",
                    isOn ? "bg-pmgreen/15 text-white" : "text-[#9aa7ba] hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span className={cn("absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-pmgreen transition-opacity", isOn ? "opacity-100" : "opacity-0")} />
                  <Icon name={n.icon} size={16} className={cn("flex-none", isOn && "text-pmgreen")} />
                  <span className="flex-1">{n.label}</span>
                  {n.badge && (
                    <span className="rounded-full bg-danger px-1.5 py-px text-[10px] font-bold text-white">{n.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="px-2 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5d6b82]">Card Modules · 5.x</p>
        <ul className="space-y-0.5">
          {MODULES.map((m) => {
            const pageFor = m.id === "5.2" ? "5.2" as const : m.id === "5.3" ? "5.3" as const : m.id === "5.4" ? "5.4" as const : m.id === "5.5" ? "5.5" as const : m.id === "5.6" ? "5.6" as const : m.id === "5.7" ? "5.7" as const : m.id === "5.8" ? "5.8" as const : m.id === "5.9" ? "5.9" as const : m.id === "5.10" ? "5.10" as const : "5.1" as const;
            const primaryPage = ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10"].includes(m.id);
            const isOn = page === pageFor && (primaryPage || active === m.anchor);
            return (
              <li key={m.id} title={m.hint}>
                <button
                  onClick={() => goPage(pageFor, m.anchor, m.filter)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-[7px] text-left text-[12.5px] font-semibold transition-all duration-150",
                    isOn ? "bg-pmgreen/15 text-white" : "text-[#9aa7ba] hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span className={cn("rounded-md px-1.5 py-px font-display text-[10px] font-bold", isOn ? "bg-pmgreen text-white" : "bg-white/[0.07] text-[#8fa0b8]")}>
                    {m.id}
                  </span>
                  <span className="flex-1 truncate">{m.name}</span>
                  {isOn && <span className="live-dot" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status + support */}
      <div className="border-t border-white/[0.07] p-4">
        <button
          onClick={() => openDrawer({ type: "support" })}
          className="group flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/[0.09]"
        >
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-pmblue/20 text-[#7cb8fb]">
            <Icon name="headset" size={15} />
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[12px] font-bold text-white">Card Support</span>
            <span className="block text-[10.5px] text-[#7c8aa0]">24/7 · avg reply 3 min</span>
          </span>
          <Icon name="arrowRight" size={14} className="text-[#7c8aa0] transition group-hover:translate-x-0.5 group-hover:text-white" />
        </button>
        <button
          onClick={() => openModal({ type: "shortcuts" })}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold text-[#5d6b82] transition hover:text-[#9aa7ba]"
        >
          <Icon name="zap" size={12} /> Keyboard shortcuts
        </button>
      </div>
    </div>
  );
}

/* ================= Topbar ================= */

function SearchBox() {
  const { cards, txns, openDrawer } = useApp();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocus(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const query = q.trim().toLowerCase();
  const cardHits = query ? cards.filter((c) => (c.nickname + c.holder + c.last4 + c.tier).toLowerCase().includes(query)).slice(0, 4) : [];
  const txnHits = query ? txns.filter((t) => (t.merchant + t.category).toLowerCase().includes(query)).slice(0, 4) : [];
  const sectionHits = query
    ? MODULES.filter((m) => m.name.toLowerCase().includes(query) || m.hint.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const showPanel = focus && query.length > 0;

  return (
    <div ref={boxRef} className="relative hidden md:block">
      <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        placeholder="Search cards, merchants, modules…"
        className="focus-ring w-[290px] rounded-[10px] border border-line bg-canvas/70 py-2 pl-9 pr-12 text-[12.5px] font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/50 focus:bg-white"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[5px] border border-line border-b-2 bg-white px-1.5 py-px text-[10px] font-bold text-muted">
        /
      </kbd>
      {showPanel && (
        <div className="modal-pop absolute left-0 right-0 top-[calc(100%+6px)] z-[60] overflow-hidden rounded-xl border border-line bg-white shadow-pm-lg">
          {cardHits.length + txnHits.length + sectionHits.length === 0 ? (
            <p className="px-4 py-5 text-center text-[12.5px] text-muted">No matches for “{q}”.</p>
          ) : (
            <div className="thin-scroll max-h-[340px] overflow-y-auto p-1.5">
              {cardHits.length > 0 && <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Cards</p>}
              {cardHits.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    openDrawer({ type: "card", cardId: c.id });
                    setQ("");
                    setFocus(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-canvas"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-pmgreen-soft text-[#067647]"><Icon name="card" size={14} /></span>
                  <span className="flex-1 text-[12.5px] font-bold text-ink">{c.nickname}</span>
                  <span className="text-[11px] font-semibold text-faint">•• {c.last4}</span>
                </button>
              ))}
              {txnHits.length > 0 && <p className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Transactions</p>}
              {txnHits.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    scrollToId("transactions");
                    window.dispatchEvent(new CustomEvent("pm-txn-search", { detail: t.merchant }));
                    setQ("");
                    setFocus(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-canvas"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-pmblue-soft text-[#175cd3]"><Icon name="wallet" size={14} /></span>
                  <span className="flex-1 text-[12.5px] font-bold text-ink">{t.merchant}</span>
                  <span className="num text-[11px] font-bold text-muted">KES {t.amount.toLocaleString()}</span>
                </button>
              ))}
              {sectionHits.length > 0 && <p className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Modules</p>}
              {sectionHits.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    scrollToId(m.anchor);
                    if (m.filter) window.dispatchEvent(new CustomEvent("pm-card-filter", { detail: m.filter }));
                    setQ("");
                    setFocus(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-canvas"
                >
                  <span className="rounded-md bg-ink px-1.5 py-px font-display text-[10px] font-bold text-white">{m.id}</span>
                  <span className="flex-1 text-[12.5px] font-bold text-ink">{m.name}</span>
                  <Icon name="arrowRight" size={13} className="text-faint" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifBell() {
  const { notifs, unread, markAllRead, markRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const chanIcon: Record<string, IconName> = { push: "phone", sms: "sms", email: "mail", system: "shield" };
  const chanTone: Record<string, string> = {
    push: "bg-pmgreen-soft text-[#067647]",
    sms: "bg-pmblue-soft text-[#175cd3]",
    email: "bg-pmviolet-soft text-[#5925dc]",
    system: "bg-warn-soft text-[#93370d]",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications, ${unread} unread`}
        className="focus-ring relative grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-white text-muted transition hover:border-[#c4c9d4] hover:text-ink"
      >
        <Icon name="bell" size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="modal-pop absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(370px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-white shadow-pm-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-[13.5px] font-bold text-ink">Notifications</p>
            <button onClick={markAllRead} className="text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">
              Mark all read
            </button>
          </div>
          <div className="thin-scroll max-h-[360px] overflow-y-auto">
            {notifs.slice(0, 7).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn("flex w-full items-start gap-3 border-b border-line/70 px-4 py-3 text-left transition last:border-0 hover:bg-canvas/60", !n.read && "bg-pmgreen-soft/30")}
              >
                <span className={cn("mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg", chanTone[n.channel])}>
                  <Icon name={chanIcon[n.channel]} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[12.5px] font-bold text-ink">{n.title}</span>
                    {!n.read && <span className="h-1.5 w-1.5 flex-none rounded-full bg-pmgreen" />}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">{n.body}</span>
                  <span className="mt-1 block text-[10.5px] font-semibold text-faint">{n.time} · via {n.channel === "push" ? "App Push" : n.channel.toUpperCase()}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarMenu() {
  const { openDrawer, openModal, toast } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const Item = ({ icon, children, onClick }: { icon: IconName; children: ReactNode; onClick: () => void }) => (
    <button
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-semibold text-ink-2 transition hover:bg-canvas"
    >
      {children}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="focus-ring flex items-center gap-2 rounded-[10px] border border-line bg-white py-1 pl-1 pr-2.5 transition hover:border-[#c4c9d4]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink font-display text-[11px] font-bold text-pmgreen">DA</span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-[12px] font-bold text-ink">David A.</span>
          <span className="block text-[10px] font-semibold text-faint">BAAS Admin</span>
        </span>
        <Icon name="chevDown" size={13} className="text-faint" />
      </button>
      {open && (
        <div className="modal-pop absolute right-0 top-[calc(100%+8px)] z-[60] w-[230px] rounded-xl border border-line bg-white p-1.5 shadow-pm-lg">
          <div className="border-b border-line px-2.5 pb-2 pt-1">
            <p className="text-[12.5px] font-bold text-ink">David Achieng</p>
            <p className="text-[11px] text-muted">david@acmetraders.co.ke</p>
          </div>
          <div className="pt-1.5">
            <Item icon="sliders" onClick={() => scrollToId("settings")}>Card settings</Item>
            <Item icon="zap" onClick={() => openModal({ type: "shortcuts" })}>Keyboard shortcuts</Item>
            <Item icon="headset" onClick={() => openDrawer({ type: "support" })}>Support</Item>
            <Item icon="logout" onClick={() => toast("info", "Signed out of demo session", "This preview keeps you signed in.")}>Sign out</Item>
          </div>
        </div>
      )}
    </div>
  );
}

export function Topbar() {
  const { syncing, sync, lastSync, page } = useApp();
  return (
    <header className="sticky top-0 z-[50] border-b border-line bg-white/85 backdrop-blur-md">
      <div className="flex h-[60px] items-center gap-3 px-4 sm:px-6">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("pm-open-nav"))}
          aria-label="Open navigation"
          className="focus-ring grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-white text-muted transition hover:text-ink lg:hidden"
        >
          <Icon name="menu" size={17} />
        </button>
        <div className="hidden items-center gap-1.5 text-[12px] font-semibold text-faint sm:flex">
          <span>BAAS</span>
          <Icon name="chevRight" size={12} />
          <span>Cards</span>
          <Icon name="chevRight" size={12} />
          <span className="font-bold text-ink">{page === "5.10" ? "Settings & Support" : page === "5.9" ? "Program Administration" : page === "5.8" ? "Analytics & Reporting" : page === "5.7" ? "Security & Fraud" : page === "5.6" ? "Corporate Programs" : page === "5.5" ? "Prepaid Cards" : page === "5.4" ? "Virtual Credit Center" : page === "5.3" ? "Virtual Debit Center" : page === "5.2" ? "Physical Debit Cards" : "Command Center"}</span>
        </div>
        <p className="font-display text-[14px] font-bold text-ink sm:hidden">{page === "5.10" ? "Settings" : page === "5.9" ? "Administration" : page === "5.8" ? "Analytics" : page === "5.7" ? "Security" : page === "5.6" ? "Corporate" : page === "5.5" ? "Prepaid" : page === "5.4" ? "Virtual Credit" : page === "5.3" ? "Virtual Debit" : page === "5.2" ? "Physical Cards" : "Card Center"}</p>

        <div className="ml-auto flex items-center gap-2.5">
          <SearchBox />
          <button
            onClick={sync}
            className="focus-ring hidden items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2 text-[11.5px] font-bold text-muted transition hover:border-[#c4c9d4] hover:text-ink lg:flex"
            title="Sync portfolio"
          >
            <Icon name="refresh" size={13} className={cn(syncing && "spin-slow")} />
            <span className="hidden xl:inline">{syncing ? "Syncing…" : `Synced ${lastSync}`}</span>
            <span className={cn("live-dot", syncing && "amber")} />
          </button>
          <NotifBell />
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}

/* ================= Quick actions bar ================= */

export function QuickBar() {
  const { openModal, toast, page } = useApp();
  const [exporting, setExporting] = useState(false);

  const exportReport = () => {
    if (exporting) return;
    setExporting(true);
    toast("info", "Compiling report…", page === "5.5" ? "Prepaid balances & loads report being generated." : page === "5.4" ? "Credit line & statement report being generated." : page === "5.2" ? "Physical card report being generated." : page === "5.3" ? "Virtual card controls report being generated." : "Monthly Portfolio Summary (June) is being generated.");
    window.setTimeout(() => {
      setExporting(false);
      toast("success", "Report ready", page === "5.5" ? "Prepaid report downloaded." : page === "5.4" ? "Credit report downloaded." : page === "5.2" ? "Physical card report downloaded." : page === "5.3" ? "Virtual card controls report downloaded." : "Monthly Portfolio Summary (June) downloaded as CSV.");
    }, 1600);
  };

  const Action = ({ icon, label, onClick, tone = "light", spin }: { icon: IconName; label: string; onClick: () => void; tone?: "primary" | "light" | "danger"; spin?: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        "focus-ring flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[12.5px] font-bold transition-all duration-150 active:scale-[0.97]",
        tone === "primary" && "bg-pmgreen text-white shadow-[0_4px_14px_-4px_rgba(18,183,106,0.6)] hover:bg-pmgreen-dark",
        tone === "light" && "bg-white text-ink-2 hover:bg-canvas border border-line",
        tone === "danger" && "bg-white text-[#b42318] hover:bg-danger-soft border border-[#fecdca]"
      )}
    >
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[55] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-line bg-white/92 p-1.5 shadow-pm-lg backdrop-blur-md sm:gap-2">
        <Action
          icon="plus"
          label={page === "5.10" ? "Card Defaults" : page === "5.9" ? "Run Health Check" : page === "5.8" ? "Build Report" : page === "5.7" ? "Report Compromise" : page === "5.6" ? "Issue Employee Card" : page === "5.5" ? "Issue Prepaid" : page === "5.4" ? "Issue Credit Card" : page === "5.3" ? "Create Virtual" : "Issue Card"}
          tone={page === "5.7" ? "danger" : "primary"}
          onClick={() => openModal(page === "5.10" ? { type: "settingsDefaults" } : page === "5.9" ? { type: "adminHealth" } : page === "5.8" ? { type: "reportBuilder" } : page === "5.7" ? { type: "fraudWizard" } : page === "5.6" ? { type: "inviteEmployee" } : page === "5.5" ? { type: "prepaidIssue" } : page === "5.4" ? { type: "creditIssue" } : page === "5.3" ? { type: "virtualIssue" } : { type: "issue" })}
        />
        {page === "5.2" ? (
          <Action icon="card" label="Track Orders" onClick={() => scrollToId("orders")} />
        ) : page === "5.3" ? (
          <Action icon="shield" label="Security Rules" onClick={() => scrollToId("guardrails")} />
        ) : page === "5.4" ? (
          <Action icon="wallet" label="Repay Credit" onClick={() => openModal({ type: "repay" })} />
        ) : page === "5.5" ? (
          <Action icon="wallet" label="Top Up" onClick={() => openModal({ type: "topup" })} />
        ) : page === "5.6" ? (
          <Action icon="wallet" label="Billing Setup" onClick={() => openModal({ type: "billing" })} />
        ) : page === "5.7" ? (
          <Action icon="shield" label="Safeguards" onClick={() => scrollToId("safeguards")} />
        ) : page === "5.8" ? (
          <Action icon="chart" label="Revenue Trends" onClick={() => scrollToId("revenue")} />
        ) : page === "5.9" ? (
          <Action icon="key" label="API Keys" onClick={() => scrollToId("integrations")} />
        ) : page === "5.10" ? (
          <Action icon="headset" label="Get Support" onClick={() => scrollToId("support")} />
        ) : (
          <Action icon="bell" label="Configure Alerts" onClick={() => openModal({ type: "alerts" })} />
        )}
        <Action icon="download" label={exporting ? "Compiling…" : "Export Report"} onClick={exportReport} spin={exporting} />
        {page === "5.1" && <Action icon="snow" label="Freeze All" tone="danger" onClick={() => openModal({ type: "freezeAll" })} />}
      </div>
    </div>
  );
}

/* ================= Mobile nav drawer ================= */

export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const openNav = () => setOpen(true);
    window.addEventListener("pm-open-nav", openNav);
    return () => window.removeEventListener("pm-open-nav", openNav);
  }, []);
  return (
    <Drawer open={open} onClose={() => setOpen(false)} side="left" width="max-w-[300px]">
      <div className="side-glow h-full [&_p]:text-inherit">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>
    </Drawer>
  );
}

export { Badge };
