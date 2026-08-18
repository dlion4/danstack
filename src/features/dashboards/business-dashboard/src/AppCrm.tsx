import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Search, Menu, X, ChevronDown, Zap, Wallet, Building2, Users,
  CheckCircle2, LayoutGrid, Sparkles, LogOut, User, Settings, Landmark, BookOpen,
} from "lucide-react";
import { entities, modules } from "./dataGetpaid";
import { crmCustomersSeed, crmNotificationsSeed, msgsSeed, type CrmCustomer, type Msg } from "./dataCrm";
import { cls, fmt, scrollToSection, type QAction } from "./lib";
import { Sidebar, type ShellData } from "./lib/AppShell";
import { Avatar, Badge, Modal, ToastProvider, useToast } from "./components/Getpaid/ui";
import Directory from "./components/Crm/Directory";
import Communications from "./components/Crm/Communications";
import Ledger from "./components/Crm/Ledger";
import Segments from "./components/Crm/Segments";
import Portal from "./components/Crm/Portal";
import Nudges from "./components/Crm/Nudges";
import CrmQuickActions from "./components/Crm/QuickActions";

type Page = "getpaid" | "paysuppliers" | "cash" | "books" | "crm";

const ZONES: Record<string, string> = {
  "💰 Money In": "#0ea37f",
  "💸 Money Out": "#e11d48",
  "🏦 Your Money": "#0e7490",
  "📦 Your Business": "#7c3aed",
  "🚀 Grow": "#f59e0b",
  "⚙️ Run": "#64748b",
};

const SECTION_NAV = [
  { id: "sec-directory", label: "6.1 Directory" },
  { id: "sec-communications", label: "6.2 Communications" },
  { id: "sec-crm-ledger", label: "6.3 History" },
  { id: "sec-segments", label: "6.4 Segments" },
  { id: "sec-portal", label: "6.5 Portal" },
  { id: "sec-nudges", label: "6.6 Automations" },
];

export default function AppCrm({ onNavigate }: { onNavigate?: (p: string, anchor?: string, action?: QAction) => void }) {
  return (
    <ToastProvider>
      <Shell onNavigate={onNavigate} />
    </ToastProvider>
  );
}

function Shell({ onNavigate }: { onNavigate?: (p: string, anchor?: string, action?: QAction) => void }) {
  const notify = useToast();
  const [business, setBusiness] = useState(entities[0]);
  const [qa, setQa] = useState<QAction>(null);
  const [customers, setCustomers] = useState<CrmCustomer[]>(crmCustomersSeed);
  const [msgs, setMsgs] = useState<Msg[]>(msgsSeed);
  const [notifs, setNotifs] = useState(crmNotificationsSeed);
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

  /* cross-page actions: New Invoice → Get Paid wizard (customer preselected) */
  useEffect(() => {
    if (qa?.a === "invoiceFor") {
      const custId = typeof qa.p === "string" ? qa.p : undefined;
      setQa(null);
      onNavigate?.("getpaid", undefined, { a: "newInvoiceFor", p: custId });
    }
  }, [qa, onNavigate]);

  const unread = notifs.filter((n) => !n.read).length;
  const unreadMsgs = msgs.filter((m) => m.direction === "in" && !m.read).length;

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return customers.filter((c) => (c.name + c.business + c.phone + c.tags.join(" ")).toLowerCase().includes(s)).slice(0, 5);
  }, [search, customers]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocus(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

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

  const notifAction = (id: string) => {
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setBellOpen(false);
    switch (id) {
      case "cn1": emit({ a: "openCustomer", p: "c4" }); break;
      case "cn2": emit({ a: "compose", p: "c5" }); break;
      case "cn3": emit({ a: "compose", p: "c1" }); break;
      case "cn4": emit({ a: "portal" }); break;
      default: emit({ a: "nudgeLog" }); break;
    }
  };

  return (
    <div className="pm-shell">
      {/* ══════════ SIDEBAR — master shell (uniform routed nav) ══════════ */}
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="crm" data={shellData} brandSub="Page 6 · Customers &amp; CRM" />
      {/* legacy sidebar disabled — the master shell above routes every page */}
      {false && (<aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Customers & CRM · Money In</div>
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
              { id: "getpaid", label: "Get Paid", icon: <Wallet size={16} />, active: false, kind: "nav" as const, to: "getpaid" as Page },
              { id: "crm", label: "Customers & CRM", icon: <Users size={16} />, active: true, kind: "here" as const },
              { id: "products", label: "Products & Store", icon: <LayoutGrid size={16} />, active: false, kind: "module" as const },
            ],
            "💸 Money Out": [
              { id: "paysuppliers", label: "Pay Suppliers", icon: <Building2 size={16} />, active: false, kind: "nav" as const, to: "paysuppliers" as Page },
              { id: "payroll-nav", label: "Payroll", icon: <Users size={16} />, active: false, kind: "nav" as const, to: "paysuppliers" as Page, anchor: "sec-payroll" },
            ],
            "🏦 Your Money": [
              { id: "cash", label: "Cash & Accounts", icon: <Landmark size={16} />, active: false, kind: "nav" as const, to: "cash" as Page },
              { id: "funding", label: "Funding & Credit", icon: <Zap size={16} />, active: false, kind: "module" as const },
            ],
            "📦 Your Business": [
              { id: "books", label: "Bookkeeping & Taxes", icon: <BookOpen size={16} />, active: false, kind: "nav" as const, to: "books" as Page },
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
                    if (it.kind === "here") scrollToSection("sec-directory");
                    else if (it.kind === "nav") onNavigate?.(it.to!, (it as { anchor?: string }).anchor);
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
          <div className="pm-crumb"><span className="pm-muted">PayMo Business /</span> <b>Customers & CRM</b></div>
          <div className="pm-top-search" ref={searchRef}>
            <Search size={15} />
            <input placeholder="Search customers, tags, phones…" value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setSearchFocus(true)} />
            {searchFocus && search.trim() && (
              <div className="pm-search-dd">
                {results.length === 0 && <div className="pm-dd-empty">No customers match “{search}”</div>}
                {results.map((c) => (
                  <button key={c.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "openCustomer", p: c.id }); }}>
                    <Avatar name={c.name} size={24} /> <b>{c.name}</b>
                    <span className="pm-muted pm-fs-12">{c.business}</span>
                    <span className="ms-auto"><Badge tone={c.tier === "vip" ? "success" : c.tier === "risk" ? "danger" : "muted"}>{c.tier}</Badge></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-top-actions">
              <button className="btn pm-btn-ghost btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "broadcast" })}><Zap size={15} /> Broadcast</button>
              <button className="btn pm-btn-primary btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "newCustomer" })}><Users size={15} /> Add Customer</button>
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
                    <div className="pm-pop-foot">Showing {notifs.length} · inbox syncs across channels</div>
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
            <h1 className="pm-hero-title">Customers & CRM</h1>
            <span className="pm-zone-chip">💰 Money In</span>
            <span className="pm-live-chip"><span className="pm-live-dot" /> {customers.length} contacts · {unreadMsgs} unread messages</span>
          </div>
          <p className="pm-hero-sub">
            Know every customer completely — who they are, what they owe, what they said, and what they'll do next.
          </p>
          <div className="pm-hero-actions">
            {SECTION_NAV.map((s) => (
              <button key={s.id} className="pm-nav-chip" onClick={() => scrollToSection(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="pm-kpis">
          <KpiCard label="Customer base" value={`${customers.length} contacts`} trend="▲ 2 this month" tone="up" icon={<Users size={17} />} sub="3 sources · 0 duplicates" />
          <KpiCard label="Total lifetime value" value={fmt(customers.reduce((s, c) => s + c.ltv, 0))} trend="▲ 14.2%" tone="up" icon={<Wallet size={17} />} sub="across all customers" />
          <KpiCard label="Outstanding balances" value={fmt(customers.reduce((s, c) => s + c.balance, 0))} trend={`${customers.filter((c) => c.balance > 0).length} customers`} tone="bad" icon={<Building2 size={17} />} sub="tracked in Get Paid" />
          <KpiCard label="Unread messages" value={`${unreadMsgs} messages`} trend="respond under 2h" tone="down" icon={<Zap size={17} />} sub="SLA target 97%" />
          <KpiCard label="Nudges automated" value="5 rules live" trend="42 sent · 30d" tone="up" icon={<CheckCircle2 size={17} />} sub="KES 340K recovered" />
        </div>

        {/* sections */}
        <div className="pm-content">
          <Directory customers={customers} setCustomers={setCustomers} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Communications customers={customers} msgs={msgs} setMsgs={setMsgs} notify={notify} qa={qa} onConsume={onConsume} />
          <Ledger customers={customers} notify={notify} qa={qa} onConsume={onConsume} />
          <Segments customers={customers} notify={notify} qa={qa} onConsume={onConsume} />
          <Portal customers={customers} notify={notify} qa={qa} onConsume={onConsume} />
          <Nudges customers={customers} notify={notify} qa={qa} onConsume={onConsume} />

          <footer className="pm-footer">
            PayMo Business · TechSol Ltd · CRM synced with the ledger · all conversations logged to the 360° profile.
          </footer>
        </div>
      </div>

      {/* ══════════ Quick actions (6.7) ══════════ */}
      <CrmQuickActions emit={emit} counts={{ unread: unreadMsgs, atRisk: customers.filter((c) => c.tier === "risk").length }} />

      {/* ══════════ global modals ══════════ */}
      <Modal open={bizSwitch} onClose={() => setBizSwitch(false)} kicker="Portfolio" title="Switch business entity" subtitle="Customer lists are strictly scoped per entity."
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setBizSwitch(false)}>Done</button>}
      >
        <div className="pm-entity-list">
          {entities.map((e) => (
            <button key={e.id} className={cls("pm-entity-row", business.id === e.id && "pm-entity-on")} onClick={() => { setBusiness(e); notify({ tone: "success", title: `Switched to ${e.name}`, body: "CRM data is now scoped to this entity (demo data shown)." }); }}>
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
