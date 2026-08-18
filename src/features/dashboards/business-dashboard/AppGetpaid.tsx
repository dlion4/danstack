import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Search, Menu, X, ChevronDown, Plus, Zap, Wallet, Building2,
  CheckCircle2, LayoutGrid, Sparkles, LogOut, User, Settings,
} from "lucide-react";
import {
  agingSeed, channelsSeed, customers as customersSeed, entities, invoicesSeed,
  linksSeed, modules, notificationsSeed, products, recurringSeed, txsSeed,
  type Customer, type Invoice, type Recurring as RecurringRow,
} from "./dataGetpaid";
import { cls, fmt, scrollToSection, type QAction } from "./lib";
import { Sidebar, type ShellData } from "./lib/AppShell";
import { Avatar, Badge, Modal, ToastProvider, useToast } from "./components/Getpaid/ui";
import Channels from "./components/Getpaid/Channels";
import InvoiceCenter from "./components/Getpaid/InvoiceCenter";
import Recurring from "./components/Getpaid/Recurring";
import Receivables from "./components/Getpaid/Receivables";
import Reconciliation from "./components/Getpaid/Reconciliation";
import Links from "./components/Getpaid/Links";
import Disputes from "./components/Getpaid/Disputes";
import Insights from "./components/Getpaid/Insights";
import QuickActions from "./components/Getpaid/QuickActions";

const ZONES: Record<string, string> = {
  "💰 Money In": "#0ea37f",
  "💸 Money Out": "#e11d48",
  "🏦 Your Money": "#0e7490",
  "📦 Your Business": "#7c3aed",
  "🚀 Grow": "#f59e0b",
  "⚙️ Run": "#64748b",
};

const SECTION_NAV = [
  { id: "sec-channels", label: "1.1 Channels" },
  { id: "sec-invoices", label: "1.2 Invoices" },
  { id: "sec-recurring", label: "1.4 Recurring" },
  { id: "sec-receivables", label: "1.5 Receivables" },
  { id: "sec-matching", label: "1.6 Matching" },
  { id: "sec-links", label: "1.7 Links" },
  { id: "sec-disputes", label: "1.8 Disputes" },
  { id: "sec-insights", label: "1.9 Insights" },
];


export default function App({ onNavigate, pendingAction }: { onNavigate?: (p: string, anchor?: string, action?: QAction) => void; pendingAction?: QAction }) {
  return (
    <ToastProvider>
      <Shell onNavigate={onNavigate} pendingAction={pendingAction} />
    </ToastProvider>
  );
}

function Shell({ onNavigate, pendingAction }: { onNavigate?: (p: string, anchor?: string, action?: QAction) => void; pendingAction?: QAction }) {
  const notify = useToast();
  const [business, setBusiness] = useState(entities[0]);
  const [qa, setQa] = useState<QAction>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(invoicesSeed);
  const [customers, setCustomers] = useState<Customer[]>(customersSeed);
  const [recurring, setRecurring] = useState<RecurringRow[]>(recurringSeed);
  const [txs, setTxs] = useState(txsSeed);
  const [links, setLinks] = useState(linksSeed);
  const [aging, setAging] = useState(agingSeed);
  const [channels, setChannels] = useState(channelsSeed);
  const [notifs, setNotifs] = useState(notificationsSeed);
  const [sideOpen, setSideOpen] = useState(false);
  const [bizSwitch, setBizSwitch] = useState(false);
  const [modulePreview, setModulePreview] = useState<null | (typeof modules)[number]>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const emit = (q: QAction) => setQa(q);
  const onConsume = () => setQa(null);

  /* actions carried across page navigation (e.g. "New Invoice" from the CRM) */
  useEffect(() => {
    if (pendingAction) {
      setQa(pendingAction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction]);

  const unread = notifs.filter((n) => !n.read).length;

  /* apply a matched payment to an invoice */
  const onInvoicePaid = (invoiceId: string, amount: number) => {
    setInvoices((xs) => xs.map((i) => {
      if (i.id !== invoiceId) return i;
      const paid = i.paid + amount;
      const status: Invoice["status"] = paid >= i.amount ? "paid" : "partial";
      return {
        ...i, paid, status,
        activity: [...i.activity, { t: new Date().toISOString(), text: `Payment ${fmt(amount)} matched automatically`, kind: "paid" }],
        payments: [...i.payments, { id: "pay-" + Date.now(), amount, method: "M-Pesa (matched)", ref: "AUTO", t: new Date().toISOString(), status: "settled" }],
      };
    }));
  };

  /* global search results */
  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return { invoices: [], customers: [], channels: [] };
    return {
      invoices: invoices.filter((i) => i.number.toLowerCase().includes(s) || (customers.find((c) => c.id === i.customerId)?.name.toLowerCase().includes(s) ?? false)).slice(0, 4),
      customers: customers.filter((c) => (c.name + c.business).toLowerCase().includes(s)).slice(0, 3),
      channels: channels.filter((c) => c.name.toLowerCase().includes(s)).slice(0, 3),
    };
  }, [search, invoices, customers, channels]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocus(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const notifAction = (id: string) => {
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setBellOpen(false);
    switch (id) {
      case "n1": emit({ a: "configChannel", p: "mpesa-paybill" }); break;
      case "n2": emit({ a: "focusOverdue" }); break;
      case "n4": emit({ a: "priceImpact" }); break;
      case "n5": notify({ tone: "info", title: "Payment details", body: "STK push SLK8XQ21PL · Akili Studio · settled 07:05 EAT." }); break;
      case "n3": emit({ a: "matchTx", p: null }); break;
      default: notify({ tone: "info", title: "Notification opened" }); break;
    }
  };

  /* shell data adapter — feeds the shared master sidebar */
  const shellData: ShellData = {
    business: business.name,
    setBusiness: (name) => {
      const e = entities.find((x) => x.name === name);
      if (e) setBusiness(e);
    },
    notifications: notifs.map((n) => ({ id: Number(String(n.id).replace(/\D/g, "")), icon: (n as { icon?: string }).icon ?? "bi-bell", text: n.title, time: n.time, unread: !n.read })),
    markNotifsRead: () => setNotifs((ns) => ns.map((x) => ({ ...x, read: true }))),
    dismissNotif: (id) => setNotifs((ns) => ns.filter((x) => Number(String(x.id).replace(/\D/g, "")) !== id)),
    toast: (msg, type, title) => notify({ tone: type === "danger" ? "danger" : type === "warning" ? "warning" : "info", title: title ?? "PayMo", body: msg }),
    openModal: () => undefined,
    searchQuery: search,
    setSearchQuery: setSearch,
  };

  const onAddRecurring: React.ComponentProps<typeof InvoiceCenter>["onAddRecurring"] = (r) => {
    setRecurring((rs) => [{ ...r, id: "r-" + Date.now(), lifetime: 0, count: 0, failures: 0, onTime: 100 }, ...rs]);
  };

  return (
    <div className="pm-shell">
      {/* ══════════ SIDEBAR — master shell (uniform routed nav) ══════════ */}
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="getpaid" data={shellData} brandSub="Page 2 · Get Paid" />
      {/* legacy sidebar disabled — the master shell above routes every page */}
      {false && (<aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Get Paid · Money In</div>
          </div>
          <button className="pm-side-x" onClick={() => setSideOpen(false)}><X size={18} /></button>
        </div>

        <button className="pm-biz-switch" onClick={() => setBizSwitch(true)}>
          <span className="pm-biz-avatar">{business.name[0]}</span>
          <span className="flex-grow-1 text-start">
            <b>{business.name}</b>
            <span className="d-block pm-fs-11 pm-muted">{business.type} · {business.cash}</span>
          </span>
          <ChevronDown size={14} />
        </button>

        <nav className="pm-nav">
          {Object.entries({
            "💰 Money In": [
              { id: "getpaid", label: "Get Paid", icon: <Wallet size={16} />, active: true, badge: null },
              { id: "customers", label: "Customers & CRM", icon: <User size={16} />, active: false, badge: null },
              { id: "products", label: "Products & Store", icon: <LayoutGrid size={16} />, active: false, badge: "New" },
            ],
            "💸 Money Out": [
              { id: "suppliers", label: "Pay Suppliers", icon: <Building2 size={16} />, active: false, badge: null },
              { id: "payroll", label: "Payroll", icon: <Wallet size={16} />, active: false, badge: null },
            ],
            "🏦 Your Money": [
              { id: "cash", label: "Cash & Accounts", icon: <Wallet size={16} />, active: false, badge: null },
              { id: "funding", label: "Funding & Credit", icon: <Zap size={16} />, active: false, badge: null },
            ],
            "📦 Your Business": [
              { id: "taxes", label: "Bookkeeping & Taxes", icon: <Wallet size={16} />, active: false, badge: null },
              { id: "inventory", label: "Inventory & Stock", icon: <LayoutGrid size={16} />, active: false, badge: null },
            ],
            "🚀 Grow": [
              { id: "insurance", label: "Insurance & Protection", icon: <Sparkles size={16} />, active: false, badge: null },
              { id: "marketing", label: "Marketing & Growth", icon: <Zap size={16} />, active: false, badge: null },
              { id: "integrations", label: "Apps & Integrations", icon: <LayoutGrid size={16} />, active: false, badge: null },
            ],
            "⚙️ Run": [
              { id: "portfolio", label: "Multi-Business", icon: <Building2 size={16} />, active: false, badge: null },
              { id: "settings", label: "Settings & Security", icon: <Settings size={16} />, active: false, badge: null },
            ],
          }).map(([zone, items]) => (
            <div className="pm-nav-zone" key={zone}>
              <div className="pm-nav-zone-label" style={{ color: ZONES[zone] }}>{zone}</div>
              {items.map((it) => (
                <button
                  key={it.id}
                  className={cls("pm-nav-item", it.active && "pm-nav-active")}
                  onClick={() => {
                    setSideOpen(false);
                    if (it.active) scrollToSection("sec-channels");
                    else if (it.id === "portfolio") setBizSwitch(true);
                    else if (it.id === "suppliers" || it.id === "payroll")
                      onNavigate?.("paysuppliers", it.id === "payroll" ? "sec-payroll" : undefined);
                    else if (it.id === "cash") onNavigate?.("cash");
                    else if (it.id === "taxes") onNavigate?.("books");
                    else if (it.id === "customers") onNavigate?.("crm");
                    else {
                      const m = modules.find((x) => x.id === it.id);
                      if (m) setModulePreview(m);
                    }
                  }}
                >
                  <span className="pm-nav-ic">{it.icon}</span>
                  {it.label}
                  {it.badge && <span className="pm-nav-badge">{it.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-upgrade">
            <Sparkles size={14} /> <span>PayMo Pro — 14 days left in trial</span>
          </div>
          <button className="pm-nav-item" onClick={() => notify({ tone: "info", title: "Help centre", body: "Docs & support are available in the full PayMo suite." })}>
            <span className="pm-nav-ic"><Zap size={16} /></span> Help & Support
          </button>
        </div>
      </aside>)}

      {/* ══════════ MAIN ══════════ */}
      <div className="pm-main">
        {/* topbar */}
        <header className="pm-topbar">
          <button className="pm-burger" onClick={() => setSideOpen(true)}><Menu size={19} /></button>
          <div className="pm-crumb">
            <span className="pm-muted">PayMo Business /</span> <b>Get Paid</b>
          </div>
          <div className="pm-top-search" ref={searchRef}>
            <Search size={15} />
            <input
              placeholder="Search invoices, customers, channels…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
            />
            {searchFocus && search.trim() && (
              <div className="pm-search-dd">
                {results.invoices.length + results.customers.length + results.channels.length === 0 && (
                  <div className="pm-dd-empty">No results for “{search}”</div>
                )}
                {results.invoices.length > 0 && <div className="pm-dd-group">Invoices</div>}
                {results.invoices.map((i) => (
                  <button key={i.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "openInvoice", p: i.id }); }}>
                    <Wallet size={14} className="t-primary" /> <b>{i.number}</b>
                    <span className="pm-muted pm-fs-12">{customers.find((c) => c.id === i.customerId)?.name}</span>
                    <span className="ms-auto pm-fs-12">{fmt(i.amount)}</span>
                  </button>
                ))}
                {results.customers.length > 0 && <div className="pm-dd-group">Customers</div>}
                {results.customers.map((c) => (
                  <button key={c.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "customer", p: c.id }); }}>
                    <User size={14} className="t-info" /> <b>{c.name}</b>
                    <span className="pm-muted pm-fs-12">{c.business}</span>
                    <span className="ms-auto pm-fs-12">{c.phone}</span>
                  </button>
                ))}
                {results.channels.length > 0 && <div className="pm-dd-group">Channels</div>}
                {results.channels.map((ch) => (
                  <button key={ch.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "configChannel", p: ch.id }); }}>
                    <Zap size={14} className="t-primary" /> <b>{ch.name}</b>
                    <span className="pm-muted pm-fs-12">{ch.account}</span>
                    <span className="ms-auto"><Badge tone={ch.tier === "active" ? "success" : "muted"}>{ch.tier}</Badge></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-top-actions">
              <button className="btn pm-btn-ghost btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "receive" })}><Zap size={15} /> Receive</button>
              <button className="btn pm-btn-primary btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "newInvoice" })}><Plus size={15} /> New Invoice</button>
            </div>
            <div className="pm-bell-wrap">
              <button className="pm-bell" onClick={() => { setBellOpen(!bellOpen); setUserMenu(false); }}>
                <Bell size={18} />
                {unread > 0 && <span className="pm-bell-badge">{unread}</span>}
              </button>
              {bellOpen && (
                <>
                  <div className="pm-pop-backdrop" onClick={() => setBellOpen(false)} />
                  <div className="pm-pop pm-notif-pop">
                    <div className="pm-pop-head">
                      <b>Notifications</b>
                      <button className="pm-link-btn pm-fs-12" onClick={() => { setNotifs((ns) => ns.map((n) => ({ ...n, read: true }))); notify({ tone: "info", title: "All notifications marked as read" }); }}>Mark all read</button>
                    </div>
                    {notifs.map((n) => (
                      <button key={n.id} className={cls("pm-notif-row", !n.read && "pm-notif-unread")} onClick={() => notifAction(n.id)}>
                        <span className={`pm-notif-dot pm-notif-dot-${n.tone}`} />
                        <span className="flex-grow-1 text-start">
                          <b className="pm-fs-13">{n.title}</b>
                          <span className="pm-muted pm-fs-11 d-block">{n.body}</span>
                          <span className="pm-fs-11 pm-muted">{n.time}</span>
                        </span>
                      </button>
                    ))}
                    <div className="pm-pop-foot">Showing {notifs.length} · eTIMS auto-filing ON</div>
                  </div>
                </>
              )}
            </div>
            <div className="pm-user-wrap">
              <button className="pm-user" onClick={() => { setUserMenu(!userMenu); setBellOpen(false); }}>
                <Avatar name="Amina Wanjiru" size={34} />
                <span className="d-none d-md-block text-start">
                  <b className="pm-fs-13 d-block">Wanjiru K.</b>
                  <span className="pm-fs-11 pm-muted">Owner · {business.name}</span>
                </span>
                <ChevronDown size={13} className="pm-muted" />
              </button>
              {userMenu && (
                <>
                  <div className="pm-pop-backdrop" onClick={() => setUserMenu(false)} />
                  <div className="pm-pop pm-menu-pop">
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); notify({ tone: "info", title: "Profile", body: "Wanjiru K. — Owner · 2FA enabled · last login today 07:58." }); }}><User size={14} /> My profile</button>
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); const m = modules.find((x) => x.id === "settings"); if (m) setModulePreview(m); }}><Settings size={14} /> Settings & Security</button>
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); setBizSwitch(true); }}><Building2 size={14} /> Switch business</button>
                    <div className="pm-dd-sep" />
                    <button className="pm-dd-row pm-dd-danger" onClick={() => { setUserMenu(false); notify({ tone: "info", title: "Signed out (demo)", body: "Session would end here in production." }); }}><LogOut size={14} /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* hero */}
        <div className="pm-hero">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h1 className="pm-hero-title">Get Paid</h1>
            <span className="pm-zone-chip">💰 Money In</span>
            <span className="pm-live-chip"><span className="pm-live-dot" /> Live — 6 rails monitoring</span>
          </div>
          <p className="pm-hero-sub">
            Everything about how money comes in: every channel, every customer, every invoice — one command center.
          </p>
          <div className="pm-hero-actions">
            {SECTION_NAV.map((s) => (
              <button key={s.id} className="pm-nav-chip" onClick={() => scrollToSection(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="pm-kpis">
          <KpiCard label="Money In (this month)" value={fmt(486200)} trend="▲ 12.4%" tone="up" icon={<Wallet size={17} />} sub="vs KES 432K last month" />
          <KpiCard label="Collection rate" value="87%" trend="▲ 4.2 pts" tone="up" icon={<CheckCircle2 size={17} />} sub="target 100%" />
          <KpiCard label="Outstanding" value={fmt(218400)} trend="▼ 3.1%" tone="down" icon={<Wallet size={17} />} sub="across 11 invoices" />
          <KpiCard label="Overdue" value={fmt(97500)} trend="▲ 5 invoices" tone="bad" icon={<Sparkles size={17} />} sub="needs action today" />
          <KpiCard label="Days Sales Outstanding" value="41 days" trend="▲ 3 days faster" tone="up" icon={<Zap size={17} />} sub="benchmark 45" />
        </div>

        {/* sections */}
        <div className="pm-content">
          <Channels
            channels={channels} setChannels={setChannels} txs={txs}
            notify={notify} emit={emit} qa={qa} onConsume={onConsume}
          />
          <InvoiceCenter
            invoices={invoices} setInvoices={setInvoices} customers={customers} setCustomers={setCustomers}
            products={products} txs={txs} notify={notify} emit={emit} qa={qa} onConsume={onConsume}
            onAddRecurring={onAddRecurring}
          />
          <Recurring recurring={recurring} setRecurring={setRecurring} customers={customers} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Receivables aging={aging} setAging={setAging} customers={customers} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Reconciliation txs={txs} setTxs={setTxs} invoices={invoices} notify={notify} qa={qa} onConsume={onConsume} onInvoicePaid={onInvoicePaid} />
          <Links links={links} setLinks={setLinks} notify={notify} qa={qa} onConsume={onConsume} />
          <Disputes customers={customers} notify={notify} />
          <Insights notify={notify} emit={emit} qa={qa} onConsume={onConsume} />

          <footer className="pm-footer">
            PayMo Business · TechSol Ltd · eTIMS auto-file ON · Ledger synced 2 min ago · All figures in KES.
          </footer>
        </div>
      </div>

      {/* ══════════ Quick actions (1.10) ══════════ */}
      <QuickActions
        emit={emit}
        counts={{
          unmatched: txs.filter((t) => t.status === "unmatched").length,
          suggested: txs.filter((t) => t.status === "suggested").length,
          overdue: invoices.filter((i) => i.status === "overdue").length,
        }}
      />

      {/* ══════════ global modals ══════════ */}
      <BusinessSwitcher open={bizSwitch} onClose={() => setBizSwitch(false)} business={business}
        onPick={(e) => {
          setBusiness(e);
          notify({ tone: "success", title: `Switched to ${e.name}`, body: "All data on this page is now scoped to this entity (demo data shown)." });
        }} />
      <ModulePreview m={modulePreview} onClose={() => setModulePreview(null)} notify={notify} />
    </div>
  );
}

/* ── KPI card ── */

function KpiCard({ label, value, trend, tone, icon, sub }: {
  label: string; value: string; trend: string; tone: "up" | "down" | "bad"; icon: React.ReactNode; sub: string;
}) {
  return (
    <div className="pm-kpi">
      <div className="pm-kpi-top">
        <span className={cls("pm-kpi-ic", tone === "up" && "pm-kpi-ic-good", tone === "down" && "pm-kpi-ic-bad", tone === "bad" && "pm-kpi-ic-warn")}>{icon}</span>
        <span className="pm-kpi-label">{label}</span>
      </div>
      <div className="pm-kpi-value">{value}</div>
      <div className="pm-kpi-sub">
        <span className={cls("pm-kpi-delta", tone === "up" ? "t-up" : tone === "down" ? "t-down" : "t-danger")}>{trend}</span>
        <span className="pm-kpi-note">{sub}</span>
      </div>
    </div>
  );
}

/* ── Business switcher ── */

function BusinessSwitcher({ open, onClose, business, onPick }: {
  open: boolean; onClose: () => void; business: (typeof entities)[number];
  onPick: (e: (typeof entities)[number]) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} kicker="Portfolio" title="Switch business entity" subtitle="Each entity keeps strictly separate books. Data on this page is scoped to the active entity."
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>}
    >
      <div className="pm-entity-list">
        {entities.map((e) => (
          <button key={e.id} className={cls("pm-entity-row", business.id === e.id && "pm-entity-on")} onClick={() => onPick(e)}>
            <span className="pm-biz-avatar">{e.name[0]}</span>
            <span className="flex-grow-1 text-start">
              <b className="pm-fs-13">{e.name}</b>
              <span className="pm-muted pm-fs-11 d-block">{e.type} · {e.desc}</span>
            </span>
            <span className="text-end">
              <span className="pm-fs-12 d-block">{e.cash}</span>
              <Badge tone={e.health === "green" ? "success" : e.health === "amber" ? "warning" : "danger"} dot>{e.health === "green" ? "Healthy" : e.health === "amber" ? "Watch" : "Needs funds"}</Badge>
            </span>
            {business.id === e.id && <CheckCircle2 size={17} className="t-primary" />}
          </button>
        ))}
      </div>
      <div className="pm-note mt-2">Consolidated group view lives in Multi-Business / Portfolio (⚙️ Run zone).</div>
    </Modal>
  );
}

/* ── Module preview (no dead ends) ── */

function ModulePreview({ m, onClose, notify }: {
  m: null | (typeof modules)[number]; onClose: () => void; notify: ReturnType<typeof useToast>;
}) {
  if (!m) return null;
  return (
    <Modal open={!!m} onClose={onClose} kicker={`${m.zone} · Next in the suite`} title={m.name} subtitle={m.desc}
      footer={
        <>
          <button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
          <button className="btn pm-btn-primary" onClick={() => { notify({ tone: "info", title: `${m.name} — on the roadmap`, body: "This module ships next in the PayMo Superapp build. Get Paid is fully live." }); onClose(); }}>
            Notify me when live
          </button>
        </>
      }
    >
      <div className="pm-module-feats">
        {m.features.map((f) => (
          <div className="pm-module-feat" key={f}><CheckCircle2 size={15} className="t-primary" /> {f}</div>
        ))}
      </div>
      <div className="pm-cyan-note">Fully spec'd in the PayMo architecture blueprint — coming to this dashboard next.</div>
    </Modal>
  );
}
