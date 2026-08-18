import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Search, Menu, X, ChevronDown, Zap, Wallet, Building2, BookOpen,
  CheckCircle2, LayoutGrid, Sparkles, LogOut, User, Settings, Users, Landmark, Receipt,
} from "lucide-react";
import { entities, modules } from "./dataGetpaid";
import {
  bookNotificationsSeed, bookTxsSeed, coaSeed, collaboratorsSeed, etimsSeed,
  journalsSeed, taxEventsSeed, vatPeriodsSeed,
  type BookTx, type CoaAccount, type Collaborator, type EtimsDoc, type JournalEntry,
  type TaxEvent, type VatPeriod,
} from "./dataBooks";
import { cls, fmt, scrollToSection, type QAction } from "./lib";
import { Sidebar, type ShellData } from "./lib/AppShell";
import { Avatar, Badge, Modal, ToastProvider, useToast } from "./components/Getpaid/ui";
import Overview from "./components/Books/Overview";
import Categorize from "./components/Books/Categorize";
import Journals from "./components/Books/Journals";
import Reports from "./components/Books/Reports";
import Vat from "./components/Books/Vat";
import Etims from "./components/Books/Etims";
import IncomeTax from "./components/Books/IncomeTax";
import TaxCalendar from "./components/Books/TaxCalendar";
import Accountant from "./components/Books/Accountant";
import BooksQuickActions from "./components/Books/QuickActions";

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
  { id: "sec-books-overview", label: "4.1 Overview" },
  { id: "sec-categorize", label: "4.2 Categorize" },
  { id: "sec-journals", label: "4.3 Journals" },
  { id: "sec-reports", label: "4.4 Reports" },
  { id: "sec-vat", label: "4.5 VAT" },
  { id: "sec-etims", label: "4.6 eTIMS" },
  { id: "sec-income-tax", label: "4.7 Income Tax" },
  { id: "sec-tax-calendar", label: "4.8 Calendar" },
  { id: "sec-accountant", label: "4.9 Close" },
];

export default function AppBooks({ onNavigate }: { onNavigate?: (p: string, anchor?: string) => void }) {
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
  const [txs, setTxs] = useState<BookTx[]>(bookTxsSeed);
  const [coa, setCoa] = useState<CoaAccount[]>(coaSeed);
  const [journals, setJournals] = useState<JournalEntry[]>(journalsSeed);
  const [vatPeriods, setVatPeriods] = useState<VatPeriod[]>(vatPeriodsSeed);
  const [etims, setEtims] = useState<EtimsDoc[]>(etimsSeed);
  const [taxEvents, setTaxEvents] = useState<TaxEvent[]>(taxEventsSeed);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(collaboratorsSeed);
  const [notifs, setNotifs] = useState(bookNotificationsSeed);
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
  const uncategorized = txs.filter((t) => t.status === "uncategorized").length;
  const etimsFailed = etims.filter((e) => e.status === "failed").length;
  const overdueTax = taxEvents.filter((e) => e.status === "overdue").length;

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return { accounts: [], journals: [], txs: [] };
    return {
      accounts: coa.filter((c) => (c.name + c.code).toLowerCase().includes(s)).slice(0, 3),
      journals: journals.filter((j) => (j.narration + j.number).toLowerCase().includes(s)).slice(0, 3),
      txs: txs.filter((t) => t.desc.toLowerCase().includes(s)).slice(0, 3),
    };
  }, [search, coa, journals, txs]);

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
      case "bn1": emit({ a: "focusCalendar" }); break;
      case "bn2": emit({ a: "focusEtims" }); break;
      case "bn3": emit({ a: "fileVat" }); break;
      case "bn4": emit({ a: "autoCategorize" }); break;
      default: emit({ a: "audit" }); break;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="books" data={shellData} brandSub="Page 5 · Bookkeeping &amp; Taxes" />
      {/* legacy sidebar disabled — the master shell above routes every page */}
      {false && (<aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Bookkeeping & Taxes</div>
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
              { id: "customers", label: "Customers & CRM", icon: <User size={16} />, active: false, kind: "nav" as const, to: "crm" as Page },
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
              { id: "books", label: "Bookkeeping & Taxes", icon: <BookOpen size={16} />, active: true, kind: "here" as const },
              { id: "products", label: "Products & Store", icon: <LayoutGrid size={16} />, active: false, kind: "module" as const },
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
                    if (it.kind === "here") scrollToSection("sec-books-overview");
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
          <div className="pm-crumb"><span className="pm-muted">PayMo Business /</span> <b>Bookkeeping & Taxes</b></div>
          <div className="pm-top-search" ref={searchRef}>
            <Search size={15} />
            <input placeholder="Search accounts, journals, transactions…" value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setSearchFocus(true)} />
            {searchFocus && search.trim() && (
              <div className="pm-search-dd">
                {results.accounts.length + results.journals.length + results.txs.length === 0 && <div className="pm-dd-empty">No results for “{search}”</div>}
                {results.accounts.length > 0 && <div className="pm-dd-group">Chart of accounts</div>}
                {results.accounts.map((c) => (
                  <button key={c.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "coa" }); }}>
                    <BookOpen size={14} className="pm-zone-violet" /> <b>{c.code} {c.name}</b>
                    <span className="ms-auto pm-fs-12">{fmt(c.balance)}</span>
                  </button>
                ))}
                {results.journals.length > 0 && <div className="pm-dd-group">Journal entries</div>}
                {results.journals.map((j) => (
                  <button key={j.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); scrollToSection("sec-journals"); }}>
                    <Receipt size={14} className="pm-zone-violet" /> <b>{j.number}</b>
                    <span className="pm-muted pm-fs-12">{j.narration.slice(0, 40)}</span>
                  </button>
                ))}
                {results.txs.length > 0 && <div className="pm-dd-group">Transactions</div>}
                {results.txs.map((t) => (
                  <button key={t.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "focusCategorize" }); }}>
                    <Wallet size={14} className="pm-zone-violet" /> <b>{t.desc}</b>
                    <span className="ms-auto pm-fs-12">{fmt(Math.abs(t.amount))}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-top-actions">
              <button className="btn pm-btn-ghost btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "report", p: "pl" })}><Receipt size={15} /> Reports</button>
              <button className="btn pm-btn-violet btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "autoCategorize" })}><Sparkles size={15} /> Categorize</button>
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
                    <div className="pm-pop-foot">Showing {notifs.length} · books sync live with the ledger</div>
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
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); emit({ a: "invite" }); }}><Users size={14} /> Invite accountant</button>
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
            <h1 className="pm-hero-title">Bookkeeping & Taxes</h1>
            <span className="pm-zone-chip pm-zone-chip-violet">📦 Your Business</span>
            <span className="pm-live-chip"><span className="pm-live-dot pm-live-dot-violet" /> eTIMS online · books synced to the ledger</span>
          </div>
          <p className="pm-hero-sub">
            Your books, your returns and your KRA obligations — categorized automatically, filed on time, audit-ready always.
          </p>
          <div className="pm-hero-actions">
            {SECTION_NAV.map((s) => (
              <button key={s.id} className="pm-nav-chip" onClick={() => scrollToSection(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="pm-kpis">
          <KpiCard label="Net profit (March)" value={fmt(101600)} trend="▲ 6.2%" tone="up" icon={<BookOpen size={17} />} sub="revenue less expenses" />
          <KpiCard label="Uncategorized" value={`${uncategorized} items`} trend="93% auto-matched" tone="down" icon={<Sparkles size={17} />} sub="one click to clear" />
          <KpiCard label="VAT payable (March)" value={fmt(182300)} trend="due in 8 days" tone="bad" icon={<Receipt size={17} />} sub="reserved & ready to file" />
          <KpiCard label="eTIMS failures" value={`${etimsFailed} invoices`} trend="fix before filing" tone="bad" icon={<CheckCircle2 size={17} />} sub="KES 8,897 VAT at risk" />
          <KpiCard label="Tax due (90 days)" value={fmt(461800)} trend={`${overdueTax} overdue`} tone="down" icon={<Landmark size={17} />} sub="PAYE, VAT, NSSF, SHIF" />
        </div>

        {/* sections */}
        <div className="pm-content">
          <Overview uncategorized={uncategorized} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Categorize txs={txs} setTxs={setTxs} coa={coa} setCoa={setCoa} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Journals journals={journals} setJournals={setJournals} coa={coa} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Reports notify={notify} qa={qa} onConsume={onConsume} />
          <Vat periods={vatPeriods} setPeriods={setVatPeriods} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Etims docs={etims} setDocs={setEtims} notify={notify} qa={qa} onConsume={onConsume} />
          <IncomeTax notify={notify} qa={qa} onConsume={onConsume} />
          <TaxCalendar events={taxEvents} setEvents={setTaxEvents} notify={notify} qa={qa} onConsume={onConsume} />
          <Accountant collaborators={collaborators} setCollaborators={setCollaborators} uncategorized={uncategorized} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />

          <footer className="pm-footer">
            PayMo Business · TechSol Ltd · KRA PIN P0512345678V · eTIMS active · books reconciled to the general ledger · all figures in KES.
          </footer>
        </div>
      </div>

      {/* ══════════ Quick actions (4.10) ══════════ */}
      <BooksQuickActions emit={emit} counts={{ uncategorized, etimsFailed, overdue: overdueTax }} />

      {/* ══════════ global modals ══════════ */}
      <Modal open={bizSwitch} onClose={() => setBizSwitch(false)} kicker="Portfolio" title="Switch business entity" subtitle="Each entity keeps a separate ledger, chart of accounts and KRA PIN."
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setBizSwitch(false)}>Done</button>}
      >
        <div className="pm-entity-list">
          {entities.map((e) => (
            <button key={e.id} className={cls("pm-entity-row", business.id === e.id && "pm-entity-on")} onClick={() => { setBusiness(e); notify({ tone: "success", title: `Switched to ${e.name}`, body: "Books, VAT and filings are now scoped to this entity (demo data shown)." }); }}>
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
