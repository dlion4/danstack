import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Search, Menu, X, ChevronDown, Plus, Zap, Wallet, Building2,
  CheckCircle2, LayoutGrid, Sparkles, LogOut, User, Settings, Users, Landmark,
} from "lucide-react";
import { entities, modules } from "./dataGetpaid";
import {
  accountsSeed, cardsSeed, cashNotificationsSeed, sweepsSeed, transfersSeed, txsSeed,
  type Account, type CashTx, type InternalTransfer, type SweepRule, type VCard,
} from "./dataCash";
import { fmtMoney } from "./dataCash";
import { cls, scrollToSection, type QAction } from "./lib";
import { Sidebar, type ShellData } from "./lib/AppShell";
import { Avatar, Badge, Modal, ToastProvider, useToast } from "./components/Getpaid/ui";
import Accounts from "./components/Cash/Accounts";
import Cashflow from "./components/Cash/Cashflow";
import MoveMoney from "./components/Cash/MoveMoney";
import BankLink from "./components/Cash/BankLink";
import External from "./components/Cash/External";
import FX from "./components/Cash/FX";
import Sweeps from "./components/Cash/Sweeps";
import Cards from "./components/Cash/Cards";
import SettingsCash from "./components/Cash/SettingsCash";
import CashQuickActions from "./components/Cash/QuickActions";
import { beneficiariesSeed, type Beneficiary } from "./dataCash";

const ZONES: Record<string, string> = {
  "💰 Money In": "#0ea37f",
  "💸 Money Out": "#e11d48",
  "🏦 Your Money": "#0e7490",
  "📦 Your Business": "#7c3aed",
  "🚀 Grow": "#f59e0b",
  "⚙️ Run": "#64748b",
};

const SECTION_NAV = [
  { id: "sec-accounts", label: "3.1 Accounts" },
  { id: "sec-cashflow", label: "3.2 Cash Flow" },
  { id: "sec-transfers", label: "3.3 Transfers" },
  { id: "sec-banklink", label: "3.4 Bank Link" },
  { id: "sec-external", label: "3.5 External" },
  { id: "sec-fx", label: "3.6 FX" },
  { id: "sec-sweeps", label: "3.7 Sweeps" },
  { id: "sec-cards", label: "3.8 Cards" },
  { id: "sec-wallet-settings", label: "3.9 Settings" },
];


export default function AppCash({ onNavigate }: { onNavigate?: (p: string, anchor?: string) => void }) {
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
  const [accounts, setAccounts] = useState<Account[]>(accountsSeed);
  const [txs] = useState<CashTx[]>(txsSeed);
  const [transfers, setTransfers] = useState<InternalTransfer[]>(transfersSeed);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(beneficiariesSeed);
  const [rules, setRules] = useState<SweepRule[]>(sweepsSeed);
  const [cards, setCards] = useState<VCard[]>(cardsSeed);
  const [notifs, setNotifs] = useState(cashNotificationsSeed);
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

  /* pure-navigation bus events */
  useEffect(() => {
    if (qa?.a === "statementScroll") {
      setQa(null);
      document.getElementById("sec-cashflow")?.scrollIntoView({ behavior: "smooth" });
    }
    if (qa?.a === "exportLedger") {
      setQa(null);
      document.getElementById("sec-cashflow")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [qa]);

  /* totals */
  const totalCashKes =
    accounts.filter((a) => a.currency === "KES").reduce((s, a) => s + a.balance, 0) +
    accounts.filter((a) => a.currency === "USD").reduce((s, a) => s + a.balance, 0) * 129.4 +
    accounts.filter((a) => a.currency === "EUR").reduce((s, a) => s + a.balance, 0) * 140.2;
  const moneyIn = accounts.reduce((s, a) => s + (a.currency === "KES" ? a.monthlyIn : 0), 0);
  const moneyOut = accounts.reduce((s, a) => s + (a.currency === "KES" ? a.monthlyOut : 0), 0);
  const reserved = accounts.reduce((s, a) => s + (a.currency === "KES" ? a.reserved : 0), 0);

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return { accounts: [], txs: [] };
    return {
      accounts: accounts.filter((a) => a.name.toLowerCase().includes(s) || a.number.toLowerCase().includes(s)).slice(0, 3),
      txs: txs.filter((t) => t.desc.toLowerCase().includes(s) || t.ref.toLowerCase().includes(s)).slice(0, 4),
    };
  }, [search, accounts, txs]);

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
      case "cn1": emit({ a: "openAccount", p: "a1" }); break;
      case "cn2": emit({ a: "convert" }); break;
      case "cn4": emit({ a: "reconcile" }); break;
      case "cn5": emit({ a: "openAccount", p: "a1" }); notify({ tone: "info", title: "Card alert", body: "Marketing Team Card at 80% — manage it in section 3.8." }); break;
      default: notify({ tone: "info", title: "Notification opened", body: "Sweep details: VAT Reserve received KES 96,400 today." }); break;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="cash" data={shellData} brandSub="Page 4 · Cash &amp; Accounts" />
      {/* legacy sidebar disabled — the master shell above routes every page */}
      {false && (<aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Cash & Accounts · Your Money</div>
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
              { id: "paysuppliers", label: "Pay Suppliers", icon: <Building2 size={16} />, active: false, kind: "back2" as const },
              { id: "payroll-nav", label: "Payroll", icon: <Users size={16} />, active: false, kind: "payroll" as const },
            ],
            "🏦 Your Money": [
              { id: "cash", label: "Cash & Accounts", icon: <Landmark size={16} />, active: true, kind: "here" as const },
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
                    if (it.kind === "here") scrollToSection("sec-accounts");
                    else if (it.kind === "back") onNavigate?.("getpaid");
                    else if (it.kind === "back2") onNavigate?.("paysuppliers");
                    else if (it.kind === "payroll") onNavigate?.("paysuppliers", "sec-payroll");
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
          <div className="pm-crumb"><span className="pm-muted">PayMo Business /</span> <b>Cash & Accounts</b></div>
          <div className="pm-top-search" ref={searchRef}>
            <Search size={15} />
            <input placeholder="Search accounts, ledger entries…" value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setSearchFocus(true)} />
            {searchFocus && search.trim() && (
              <div className="pm-search-dd">
                {results.accounts.length + results.txs.length === 0 && <div className="pm-dd-empty">No results for “{search}”</div>}
                {results.accounts.length > 0 && <div className="pm-dd-group">Accounts</div>}
                {results.accounts.map((a) => (
                  <button key={a.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "openAccount", p: a.id }); }}>
                    <Landmark size={14} className="pm-zone-cyan" /> <b>{a.name}</b>
                    <span className="pm-muted pm-fs-12">{a.number}</span>
                    <span className="ms-auto pm-fs-12">{fmtMoney(a.balance, a.currency)}</span>
                  </button>
                ))}
                {results.txs.length > 0 && <div className="pm-dd-group">Ledger entries</div>}
                {results.txs.map((t) => (
                  <button key={t.id} className="pm-dd-row" onClick={() => { setSearchFocus(false); setSearch(""); emit({ a: "openAccount", p: t.accountId }); }}>
                    <Zap size={14} className="pm-zone-cyan" /> <b>{t.desc}</b>
                    <span className="ms-auto pm-fs-12">{fmtMoney(t.amount)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-top-actions">
              <button className="btn pm-btn-ghost btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "reconcile" })}><Landmark size={15} /> Reconcile</button>
              <button className="btn pm-btn-cyan btn-sm d-none d-lg-inline-flex" onClick={() => emit({ a: "newAccount" })}><Plus size={15} /> New Account</button>
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
                    <div className="pm-pop-foot">Showing {notifs.length} · balances refresh live</div>
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
            <h1 className="pm-hero-title">Cash & Accounts</h1>
            <span className="pm-zone-chip pm-zone-chip-cyan">🏦 Your Money</span>
            <span className="pm-live-chip"><span className="pm-live-dot pm-live-dot-cyan" /> {accounts.filter((a) => a.linked).length} banks linked · balances live</span>
          </div>
          <p className="pm-hero-sub">
            Every shilling you hold — bank accounts, mobile money, virtual reserves and FX wallets — one clear command center.
          </p>
          <div className="pm-hero-actions">
            {SECTION_NAV.map((s) => (
              <button key={s.id} className="pm-nav-chip" onClick={() => scrollToSection(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="pm-kpis">
          <KpiCard label="Total cash (all wallets)" value={fmtMoney(totalCashKes)} trend="▲ 4.6%" tone="up" icon={<Landmark size={17} />} sub="KES + USD + EUR converted" />
          <KpiCard label="Money in (30d)" value={fmtMoney(moneyIn)} trend="▲ 9.2%" tone="up" icon={<Wallet size={17} />} sub="across all rails" />
          <KpiCard label="Money out (30d)" value={fmtMoney(moneyOut)} trend="▼ 6.1%" tone="down" icon={<Building2 size={17} />} sub="suppliers + payroll" />
          <KpiCard label="Reserved funds" value={fmtMoney(reserved)} trend="▲ on track" tone="up" icon={<CheckCircle2 size={17} />} sub="VAT + payroll + buffer" />
          <KpiCard label="FX value (USD+EUR)" value={fmtMoney(accounts.filter((a) => a.currency !== "KES").reduce((s, a) => s + a.balance * (a.currency === "USD" ? 129.4 : 140.2), 0))} trend="▲ 0.8%" tone="up" icon={<Zap size={17} />} sub="USD 129.4 · EUR 140.2" />
        </div>

        {/* sections */}
        <div className="pm-content">
          <Accounts accounts={accounts} setAccounts={setAccounts} txs={txs} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <Cashflow txs={txs} accounts={accounts} notify={notify} emit={emit} qa={qa} onConsume={onConsume} />
          <MoveMoney accounts={accounts} setAccounts={setAccounts} transfers={transfers} setTransfers={setTransfers} notify={notify} qa={qa} onConsume={onConsume} />
          <BankLink accounts={accounts} setAccounts={setAccounts} notify={notify} qa={qa} onConsume={onConsume} />
          <External beneficiaries={beneficiaries} setBeneficiaries={setBeneficiaries} notify={notify} qa={qa} onConsume={onConsume} />
          <FX accounts={accounts} setAccounts={setAccounts} notify={notify} qa={qa} onConsume={onConsume} />
          <Sweeps rules={rules} setRules={setRules} notify={notify} qa={qa} onConsume={onConsume} />
          <Cards cards={cards} setCards={setCards} notify={notify} qa={qa} onConsume={onConsume} />
          <SettingsCash accounts={accounts} notify={notify} />

          <footer className="pm-footer">
            PayMo Business · TechSol Ltd · Balances verified against bank feeds 2 min ago · All figures in KES unless stated.
          </footer>
        </div>
      </div>

      {/* ══════════ Quick actions (3.10) ══════════ */}
      <CashQuickActions emit={emit} counts={{ unmatched: 4 }} />

      {/* ══════════ global modals ══════════ */}
      <Modal open={bizSwitch} onClose={() => setBizSwitch(false)} kicker="Portfolio" title="Switch business entity" subtitle="Balances, ledgers and sweeps are strictly scoped per entity."
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setBizSwitch(false)}>Done</button>}
      >
        <div className="pm-entity-list">
          {entities.map((e) => (
            <button key={e.id} className={cls("pm-entity-row", business.id === e.id && "pm-entity-on")} onClick={() => { setBusiness(e); notify({ tone: "success", title: `Switched to ${e.name}`, body: "All balances are now scoped to this entity (demo data shown)." }); }}>
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
