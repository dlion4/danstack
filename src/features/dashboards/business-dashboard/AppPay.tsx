import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Search, Menu, X, ChevronDown, Plus, Zap, Wallet, Building2,
  CheckCircle2, LayoutGrid, Sparkles, LogOut, User, Settings, Users,
} from "lucide-react";
import { entities, modules } from "./dataGetpaid";
import {
  billsSeed, payNotificationsSeed, suppliersSeed,
  type Bill, type Supplier,
} from "./dataPay";
import { cls, fmt, scrollToSection, type QAction } from "./lib";
import { Sidebar, type ShellData } from "./lib/AppShell";
import { Avatar, Badge, Modal, ToastProvider, useToast } from "./components/Getpaid/ui";
import Suppliers from "./components/Pay/Suppliers";
import Bills from "./components/Pay/Bills";
import Approvals from "./components/Pay/Approvals";
import PaymentRun from "./components/Pay/PaymentRun";
import Payroll from "./components/Pay/Payroll";
import Expenses from "./components/Pay/Expenses";
import Cashflow from "./components/Pay/Cashflow";
import Compliance from "./components/Pay/Compliance";
import PayQuickActions from "./components/Pay/QuickActions";

const ZONES: Record<string, string> = {
  "💰 Money In": "#0ea37f",
  "💸 Money Out": "#e11d48",
  "🏦 Your Money": "#0e7490",
  "📦 Your Business": "#7c3aed",
  "🚀 Grow": "#f59e0b",
  "⚙️ Run": "#64748b",
};

const SECTION_NAV = [
  { id: "sec-suppliers", label: "2.1 Suppliers" },
  { id: "sec-bills", label: "2.2 Bills" },
  { id: "sec-approvals", label: "2.4 Approvals" },
  { id: "sec-runs", label: "2.5 Payment Runs" },
  { id: "sec-payroll", label: "2.6 Payroll" },
  { id: "sec-expenses", label: "2.7 Expenses" },
  { id: "sec-cashflow", label: "2.8 Cashflow" },
  { id: "sec-compliance", label: "2.9 Compliance" },
];


export default function AppPay({ onNavigate }: { onNavigate?: (p: string, anchor?: string) => void }) {
  return (
    <ToastProvider>
      <Shell onNavigate={onNavigate} />
    </ToastProvider>
  );
}

function Shell({ onNavigate }: { onNavigate?: (p: string, anchor?: string) => void }) {
  const notify = useToast();
  const [business, setBusiness] = useState(entities[0]);
  const [qa, setQa] = useState<QAction>(null);
  const [bills, setBills] = useState<Bill[]>(billsSeed);
  const [suppliers, setSuppliers] = useState<Supplier[]>(suppliersSeed);
  const [notifs, setNotifs] = useState(payNotificationsSeed);
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

  const unread = notifs.filter((n) => !n.read).length;

  /* central bus handling for pure-navigation events */
  useEffect(() => {
    if (qa?.a === "scheduleScroll") {
      setQa(null);
      document.getElementById("sec-cashflow")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [qa]);

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return { bills: [], suppliers: [] };
    return {
      bills: bills.filter((b) => b.number.toLowerCase().includes(s) || (suppliers.find((x) => x.id === b.supplierId)?.name.toLowerCase().includes(s) ?? false)).slice(0, 4),
      suppliers: suppliers.filter((x) => (x.name + x.category).toLowerCase().includes(s)).slice(0, 3),
    };
  }, [search, bills, suppliers]);

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
      case "pn1": emit({ a: "openBill", p: "b-0032" }); break;
      case "pn2": emit({ a: "approveQueue" }); break;
      case "pn3": emit({ a: "payroll" }); break;
      case "pn5": emit({ a: "fx" }); break;
      case "pn4": notify({ tone: "info", title: "Run details", body: "March batch 1 — 4 suppliers, KES 158,300, settled in 4 minutes." }); break;
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

  return (
    <div className="pm-shell">
      {/* ══════════ SIDEBAR — master shell (uniform routed nav) ══════════ */}
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="paysuppliers" data={shellData} brandSub="Page 3 · Pay Suppliers" />
      {/* legacy sidebar disabled — the master shell above routes every page */}
      {false && (<aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Pay Suppliers · Money Out</div>
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
              { id: "getpaid", label: "Get Paid", icon: <Wallet size={16} />, active: false, kind: "back" as const },
              { id: "customers", label: "Customers & CRM", icon: <User size={16} />, active: false, kind: "module" as const },
              { id: "products", label: "Products & Store", icon: <LayoutGrid size={16} />, active: false, kind: "module" as const },
            ],
            "💸 Money Out": [
              { id: "paysuppliers", label: "Pay Suppliers", icon: <Building2 size={16} />, active: true, kind: "here" as const },
              { id: "payroll-nav", label: "Payroll", icon: <Users size={16} />, active: false, kind: "anchor" as const },
              { id: "expenses-nav", label: "Expense Claims", icon: <Wallet size={16} />, active: false, kind: "anchor" as const },
            ],
            "🏦 Your Money": [
              { id: "cash", label: "Cash & Accounts", icon: <Wallet size={16} />, active: false, kind: "module" as const },
              { id: "funding", label: "Funding & Credit", icon: <Zap size={16} />, active: false, kind: "module" as const },
            ],
            "📦 Your Business": [
              { id: "taxes", label: "Bookkeeping & Taxes", icon: <Wallet size={16} />, active: false, kind: "module" as const },
              { id: "inventory", label: "Inventory & Stock", icon: <LayoutGrid size={16} />, active: false, kind: "module" as const },
            ],
            "🚀 Grow": [
              { id: "insurance", label: "Insurance & Protection", icon: <Sparkles size={16} />, active: false, kind: "module" as const },
              { id: "marketing", label: "Marketing & Growth", icon: <Zap size={16} />, active: false, kind: "module" as const },
              { id: "integrations", label: "Apps & Integrations", icon: <LayoutGrid size={16} />, active: false, kind: "module" as const },
            ],
            "⚙️ Run": [
              { id: "portfolio", label: "Multi-Business", icon: <Building2 size={16} />, active: false, kind: "biz" as const },
              { id: "settings", label: "Settings & Security", icon: <Settings size={16} />, active: false, kind: "module" as const },
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
                    if (it.kind === "here") scrollToSection("sec-suppliers");
                    else if (it.kind === "back") onNavigate?.("getpaid");
                    else if (it.kind === "anchor") scrollToSection(it.id === "payroll-nav" ? "sec-payroll" : "sec-expenses");
                    else if (it.id === "cash") onNavigate?.("cash");
                    else if (it.id === "taxes") onNavigate?.("books");
                    else if (it.id === "customers") onNavigate?.("crm");
                    else if (it.kind === "biz") setBizSwitch(true);
                    else {
                      const m = modules.find((x) => x.id === it.id);
                      if (m) setModulePreview(m);
                    }
                  }}
                >
                  <span className="pm-nav-ic">{it.icon}</span>
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-upgrade"><Sparkles size={14} /> <span>PayMo Pro — 14 days left in trial</span></div>
          <button className="pm-nav-item" onClick={() => notify({ tone: "info", title: "Help centre", body: "Docs & support are available in the full PayMo suite." })}>
            <span className="pm-nav-ic"><Zap size={16} /></span> Help & Support
          </button>
        </div>
      </aside>)}

      {/* ══════════ MAIN ══════════ */}
      <div className="pm-main">
        <header className="pm-topbar">
          <button className="pm-burger" onClick={() => setSideOpen(true)}><Menu size={19} /></button>
          <div className="pm-crumb"><span className="pm-muted">PayMo Business /</span> <b>Pay Suppliers</b></div>
          <div className="pm-top-search" ref={searchRef}>
            <Search size={15} />
            <input placeholder="Search bills, suppliers…" value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setSearchFocus(true)} />
            {searchFocus && search.trim() && (
              <div className="pm-search-dd">
                {results.bills.length + results.suppliers.length === 0 && <div className="pm-dd-empty">No results for “{search}”</div>}
                {results.bills.length > 0 && <div className="pm-dd-group">Bills</div>}
                {results.bills.map((b) => (
                  <button key={b.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "openBill", p: b.id }); }}>
                    <Building2 size={14} className="pm-zone-out" /> <b>{b.number}</b>
                    <span className="pm-muted pm-fs-12">{suppliers.find((s) => s.id === b.supplierId)?.name}</span>
                    <span className="ms-auto pm-fs-12">{fmt(b.amount)}</span>
                  </button>
                ))}
                {results.suppliers.length > 0 && <div className="pm-dd-group">Suppliers</div>}
                {results.suppliers.map((s) => (
                  <button key={s.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "openSupplier", p: s.id }); }}>
                    <User size={14} className="t-info" /> <b>{s.name}</b>
                    <span className="pm-muted pm-fs-12">{s.category}</span>
                    <span className="ms-auto pm-fs-12">{s.owed ? fmt(s.owed) + " owed" : "clear"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-top-actions">
              <button className="btn pm-btn-ghost btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "uploadBill" })}><Zap size={15} /> Upload Bill</button>
              <button className="btn pm-btn-out btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "newBill", p: undefined })}><Plus size={15} /> New Bill</button>
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
                    <div className="pm-pop-foot">Showing {notifs.length} · eTIMS auto-file ON</div>
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
            <h1 className="pm-hero-title">Pay Suppliers</h1>
            <span className="pm-zone-chip pm-zone-chip-out">💸 Money Out</span>
            <span className="pm-live-chip"><span className="pm-live-dot pm-live-dot-out" /> 5 suppliers · 3 payment rails live</span>
          </div>
          <p className="pm-hero-sub">
            Every shilling going out: suppliers, bills, approvals, payroll, expenses and KRA compliance — one command center.
          </p>
          <div className="pm-hero-actions">
            {SECTION_NAV.map((s) => (
              <button key={s.id} className="pm-nav-chip" onClick={() => scrollToSection(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="pm-kpis">
          <KpiCard label="Money Out (this month)" value={fmt(412300)} trend="▲ 6.8%" tone="up" icon={<Wallet size={17} />} sub="vs KES 386K last month" />
          <KpiCard label="Upcoming payables" value={fmt(96400)} trend="▲ 3 bills" tone="down" icon={<Building2 size={17} />} sub="due in 14 days" />
          <KpiCard label="Overdue payables" value={fmt(175800)} trend="▲ 2 bills blocked" tone="bad" icon={<Zap size={17} />} sub="Jenga + TechServe" />
          <KpiCard label="Payroll (next run)" value={fmt(450500)} trend="▲ 24 staff" tone="up" icon={<Users size={17} />} sub="due in 6 days" />
          <KpiCard label="WHT remitted (YTD)" value={fmt(148800)} trend="▲ 12 certificates" tone="up" icon={<CheckCircle2 size={17} />} sub="KRA compliant" />
        </div>

        {/* sections */}
        <div className="pm-content">
          <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} bills={bills} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Bills bills={bills} setBills={setBills} suppliers={suppliers} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Approvals bills={bills} setBills={setBills} suppliers={suppliers} notify={notify} qa={qa} onConsume={onConsume} />
          <PaymentRun bills={bills} setBills={setBills} suppliers={suppliers} notify={notify} qa={qa} onConsume={onConsume} />
          <Payroll notify={notify} qa={qa} onConsume={onConsume} />
          <Expenses notify={notify} />
          <Cashflow notify={notify} />
          <Compliance suppliers={suppliers} notify={notify} />

          <footer className="pm-footer">
            PayMo Business · TechSol Ltd · eTIMS auto-file ON · WHT auto-deducted · All figures in KES.
          </footer>
        </div>
      </div>

      {/* ══════════ Quick actions (2.10) ══════════ */}
      <PayQuickActions
        emit={emit}
        counts={{
          pending: bills.filter((b) => b.status === "pending").length,
          scheduled: bills.filter((b) => b.status === "scheduled").length,
        }}
      />

      {/* ══════════ global modals ══════════ */}
      <Modal open={bizSwitch} onClose={() => setBizSwitch(false)} kicker="Portfolio" title="Switch business entity" subtitle="Each entity keeps strictly separate books — bills and payroll are scoped to the active entity."
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setBizSwitch(false)}>Done</button>}
      >
        <div className="pm-entity-list">
          {entities.map((e) => (
            <button key={e.id} className={cls("pm-entity-row", business.id === e.id && "pm-entity-on")} onClick={() => { setBusiness(e); notify({ tone: "success", title: `Switched to ${e.name}`, body: "All money-out data is now scoped to this entity (demo data shown)." }); }}>
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
      </Modal>

      <ModulePreview m={modulePreview} onClose={() => setModulePreview(null)} notify={notify} />
    </div>
  );
}

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

function ModulePreview({ m, onClose, notify }: {
  m: null | (typeof modules)[number]; onClose: () => void; notify: ReturnType<typeof useToast>;
}) {
  if (!m) return null;
  return (
    <Modal open={!!m} onClose={onClose} kicker={`${m.zone} · Next in the suite`} title={m.name} subtitle={m.desc}
      footer={
        <>
          <button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
          <button className="btn pm-btn-primary" onClick={() => { notify({ tone: "info", title: `${m.name} — on the roadmap`, body: "This module ships next in the PayMo Superapp build." }); onClose(); }}>
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
