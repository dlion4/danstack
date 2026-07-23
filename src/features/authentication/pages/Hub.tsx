/* ============================================================================
 * Hub.tsx — Paymo BAAS Dashboard Selection Hub (Emerald Glass Edition)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page56.html (1,153 LOC) — vanilla JS + Bootstrap CSS
 * STACK ........: Vite + React + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/hub.module.css (CSS Module).
 * REPO NOTES ...: tuned for dlion4/danstack — no new packages; hero art from
 *                 /public/assets; fonts come from routes/__root.tsx.
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   9 dashboard cards with accent tiles, Cmd/Ctrl+K quick search, category +
 *   account filters, empty-state reset, sticky "Selected route" panel with
 *   metrics + risk badge, Remember (localStorage), Preview tour, Open
 *   dashboard (hash route + toast), notifications with Clear, custom
 *   dashboard modal (widget toggles + name/owner), session 14:59 countdown,
 *   device-aware session context, loading bar, and reveal-on-scroll.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   dashboards[] / notifications[] consts .. initialMockData (API shape)
 *   renderCards() grid.innerHTML ........... useMemo filter + .map() render
 *   cardTemplate() string building ........ JSX card markup (identical DOM)
 *   selectDashboard() DOM updates ........ selectedId state derivation
 *   showToast() / toastish.show ......... toast state + timed dismiss
 *   commandInput/keydown Cmd+K ........... window keydown effect + ref focus
 *   IntersectionObserver .reveal ........ revealRef sandbox + effect observer
 *   session setInterval countdown ........ 1s effect interval (cleaned)
 *   customModal Bootstrap JS ............. data-API + data-bs-dismiss bridge
 *   hexToRgba() inline helper ............ kept verbatim per card render
 * ========================================================================== */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
if (typeof document !== 'undefined') {
  import('bootstrap/dist/js/bootstrap.bundle.min.js')
}
import styles from '../styles/hub.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type BadgeKind = 'badgeOk' | 'badgeAdv' | 'badgeNative' | 'badgeSoon';
type DashCategory = 'money' | 'admin' | 'dev' | 'risk' | 'credit';
type AccountKind = 'personal' | 'business' | 'developer';

interface DashboardDef {
  id: string;
  account: AccountKind;
  cat: DashCategory;
  type: string;
  title: string;
  desc: string;
  icon: string;        // bootstrap-icons class
  emoji: string;       // preview tile glyph (replaces the external preview gif)
  c1: string;          // accent tile gradient start
  c2: string;          // accent tile gradient end
  badge: string;
  badgeClass: BadgeKind;
  metrics: Array<[string, string]>;
  features: string[];
  actions: string[];
  url: string;
}

interface HubConfig {
  user: { name: string };
  hero: { pill: string; titlePre: string; titleAccent: string; copy: string; metrics: Array<[string, string]> };
  accountTabs: Array<{ id: AccountKind | 'all'; icon: string; label: string }>;
  categories: Array<{ id: DashCategory | 'all'; label: string }>;
  dashboards: DashboardDef[];
  notifications: Array<{ dash: string; msg: string; color: string }>;
  session: { location: string; auth: string; startSeconds: number };
  owners: string[];
  widgets: Array<{ name: string; icon: string; defaultOn?: boolean }>;
  defaultCustomName: string;
}

/* --------------------------------------------------------------------------
 * 1. initialMockData — the ENTIRE legacy `dashboards` + `notifications`
 *    arrays, hero metrics, filters, widgets, session context extracted.
 *    GET /api/hub-content returns this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: HubConfig = {
  user: { name: 'Amara Okafor' },

  hero: {
    pill: 'DASHBOARD SELECTION HUB',
    titlePre: 'Choose your ',
    titleAccent: 'financial command center.',
    copy: 'You are signed in as Amara Okafor. Pick the dashboard that matches the job you need to do now. Your choice is remembered and can be changed anytime.',
    metrics: [
      ['9', 'Dashboards'],
      ['13', 'Unread alerts'],
      ['99.97%', 'Platform uptime'],
      ['Trusted', 'Chrome · Nairobi'],
    ],
  },

  accountTabs: [
    { id: 'all', icon: 'bi-grid-fill', label: 'All access' },
    { id: 'personal', icon: 'bi-person', label: 'Personal' },
    { id: 'business', icon: 'bi-building', label: 'Business' },
    { id: 'developer', icon: 'bi-code-slash', label: 'Developer' },
  ],

  categories: [
    { id: 'all', label: 'All' },
    { id: 'money', label: 'Money movement' },
    { id: 'admin', label: 'Admin' },
    { id: 'dev', label: 'Developer' },
    { id: 'risk', label: 'Risk' },
    { id: 'credit', label: 'Credit' },
  ],

  dashboards: [
    {
      id: 'transactions', account: 'business', cat: 'money', type: 'Core',
      title: 'Transactions Dashboard',
      desc: 'Track collections, payouts, refunds, settlement states and dispute queues across all rails.',
      icon: 'bi-arrow-left-right', emoji: '💸', c1: '#2ee6a0', c2: '#7cf5c8',
      badge: '3 new alerts', badgeClass: 'badgeNative',
      metrics: [['1,284', 'today'], ['99.4%', 'success'], ['T+0', 'settlement']],
      features: ['Collections and payouts ledger', 'Rail failure and retry visibility', 'Reconciliation exports by market'],
      actions: ['View transactions', 'Export CSV', 'Resolve alerts'],
      url: '#transactions-dashboard',
    },
    {
      id: 'wallet', account: 'personal', cat: 'money', type: 'Personal',
      title: 'Personal Wallet',
      desc: 'Manage balances, cards, remittances, savings goals and bill payments from one wallet.',
      icon: 'bi-wallet2', emoji: '👛', c1: '#60a5fa', c2: '#a78bfa',
      badge: 'Default', badgeClass: 'badgeOk',
      metrics: [['KES 1.8M', 'balance'], ['4', 'currencies'], ['2', 'cards']],
      features: ['Multi-currency wallet balances', 'Send money and pay bills', 'Card controls and spend limits'],
      actions: ['Send money', 'Freeze card', 'Pay bill'],
      url: '#wallet-dashboard',
    },
    {
      id: 'business', account: 'business', cat: 'admin', type: 'Business',
      title: 'Business Operations',
      desc: 'Run invoices, suppliers, payroll, staff roles, payment links and merchant settlement.',
      icon: 'bi-shop', emoji: '🏪', c1: '#22c55e', c2: '#2ee6a0',
      badge: '2 approvals', badgeClass: 'badgeSoon',
      metrics: [['42', 'invoices'], ['8', 'suppliers'], ['5', 'staff']],
      features: ['Invoice and payment link management', 'Supplier and payroll workflows', 'Role-based staff permissions'],
      actions: ['Create invoice', 'Approve payroll', 'Invite staff'],
      url: '#business-dashboard',
    },
    {
      id: 'developer', account: 'developer', cat: 'dev', type: 'Developer',
      title: 'Developer API Console',
      desc: 'Manage apps, API keys, webhook delivery, sandbox events, SDKs and production access.',
      icon: 'bi-code-slash', emoji: '🧩', c1: '#a78bfa', c2: '#2ee6a0',
      badge: 'Sandbox live', badgeClass: 'badgeAdv',
      metrics: [['142ms', 'latency'], ['12', 'webhooks'], ['2', 'apps']],
      features: ['API key rotation and scopes', 'Webhook replay and debugging', 'Production access requests'],
      actions: ['Rotate key', 'Replay webhook', 'Open docs'],
      url: '#developer-console',
    },
    {
      id: 'treasury', account: 'business', cat: 'money', type: 'Enterprise',
      title: 'Treasury Dashboard',
      desc: 'Control FX exposure, cash positions, corridors, hedging windows and cross-border AP/AR.',
      icon: 'bi-currency-exchange', emoji: '🌍', c1: '#fbbf24', c2: '#60a5fa',
      badge: 'FX alert', badgeClass: 'badgeSoon',
      metrics: [['$4.2M', 'float'], ['18', 'corridors'], ['0.42%', 'spread']],
      features: ['Multi-entity cash pooling', 'FX lock and conversion timing', 'ERP-ready treasury reports'],
      actions: ['Lock FX', 'Move funds', 'Export report'],
      url: '#treasury-dashboard',
    },
    {
      id: 'admin', account: 'business', cat: 'admin', type: 'Admin',
      title: 'Team Admin & Access',
      desc: 'Manage users, roles, approvals, limits, access policies, audit logs and enterprise controls.',
      icon: 'bi-people', emoji: '🛂', c1: '#2ee6a0', c2: '#22c55e',
      badge: 'Needs review', badgeClass: 'badgeNative',
      metrics: [['27', 'users'], ['6', 'roles'], ['14', 'logs']],
      features: ['Role permissions and approval rules', 'Login and device audit trail', 'Spending and transaction limits'],
      actions: ['Invite user', 'Review logs', 'Set limits'],
      url: '#admin-dashboard',
    },
    {
      id: 'compliance', account: 'business', cat: 'risk', type: 'Risk',
      title: 'Compliance & Risk Center',
      desc: 'Review KYC/KYB queues, AML alerts, sanctions hits, regulatory exports and case investigations.',
      icon: 'bi-shield-check', emoji: '🛡️', c1: '#ef4444', c2: '#fbbf24',
      badge: '4 cases', badgeClass: 'badgeSoon',
      metrics: [['18', 'alerts'], ['2', 'EDD'], ['0', 'critical']],
      features: ['KYC/KYB review queue', 'AML case management', 'Regulatory report exports'],
      actions: ['Review case', 'Export STR', 'Update policy'],
      url: '#compliance-center',
    },
    {
      id: 'apps', account: 'developer', cat: 'dev', type: 'Apps',
      title: 'App Management',
      desc: 'Register applications, configure OAuth, review crash reports, analytics and marketplace listing status.',
      icon: 'bi-window-stack', emoji: '📦', c1: '#fb7185', c2: '#a78bfa',
      badge: '1 release', badgeClass: 'badgeAdv',
      metrics: [['3', 'apps'], ['4.8', 'rating'], ['50K', 'MAU']],
      features: ['App registration and configuration', 'Performance and error analytics', 'Marketplace listing management'],
      actions: ['Register app', 'Request prod', 'View analytics'],
      url: '#app-management',
    },
    {
      id: 'loans', account: 'personal', cat: 'credit', type: 'Credit',
      title: 'Loans & Credit',
      desc: 'Access working capital, manage existing loans, repayment schedules and credit options.',
      icon: 'bi-graph-up-arrow', emoji: '📈', c1: '#fbbf24', c2: '#f59e0b',
      badge: 'Pre-approved', badgeClass: 'badgeSoon',
      metrics: [['KES 2M', 'limit'], ['KES 500K', 'outstanding'], ['5 days', 'due']],
      features: ['Loan application and status tracking', 'Repayment history and early payoff', 'Credit score monitoring where available'],
      actions: ['Apply', 'Make payment', 'View score'],
      url: '#loans-credit',
    },
  ],

  notifications: [
    { dash: 'Transactions', msg: '3 payouts require retry approval.', color: '#fbbf24' },
    { dash: 'Bills', msg: '2 scheduled bills due this week.', color: '#2ee6a0' },
    { dash: 'Compliance', msg: 'EDD review needed for one merchant.', color: '#ef4444' },
    { dash: 'Developer', msg: 'Webhook endpoint returned 500 twice.', color: '#a78bfa' },
  ],

  session: { location: 'Nairobi, KE', auth: 'Passkey + MFA', startSeconds: 899 },

  owners: ['Finance team', 'Engineering team', 'Compliance team', 'Executive team'],

  widgets: [
    { name: 'FX Exposure', icon: 'bi-currency-exchange', defaultOn: true },
    { name: 'Cash Position', icon: 'bi-wallet2', defaultOn: true },
    { name: 'Approval Queue', icon: 'bi-check2-square' },
    { name: 'Rail Health', icon: 'bi-broadcast' },
    { name: 'Audit Trail', icon: 'bi-journal-check', defaultOn: true },
    { name: 'ERP Sync', icon: 'bi-database-check' },
  ],

  defaultCustomName: 'Treasury control room',
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchHubContent(): Promise<HubConfig> {
  const response = await fetch('/api/hub-content', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Hub content API responded HTTP ${response.status}`);
  return response.json() as Promise<HubConfig>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* LEGACY BRIDGE: hexToRgba() — verbatim helper, used for the card glow var. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function Hub() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-hub-content'],
    queryFn: fetchHubContent,
    staleTime: 2 * 60_000,
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable; the error
  // banner below surfaces that failure state to the user.
  const content = apiData ?? initialMockData;

  /* ---------- state (legacy module-level lets) ---------- */
  const [selectedId, setSelectedId] = useState<string>(() => {
    const remembered = localStorage.getItem('paymo_selected_dashboard');
    return remembered && content.dashboards.some((d) => d.id === remembered) ? remembered : 'transactions';
  });
  const [currentFilter, setCurrentFilter] = useState<DashCategory | 'all'>('all');
  const [currentAccount, setCurrentAccount] = useState<AccountKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [alertsCleared, setAlertsCleared] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [sessionLeft, setSessionLeft] = useState(content.session.startSeconds);
  const [deviceText, setDeviceText] = useState('Chrome · Desktop');
  const [customName, setCustomName] = useState(content.defaultCustomName);
  const [customOwner, setCustomOwner] = useState(content.owners[0]);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(
    content.widgets.filter((w) => w.defaultOn).map((w) => w.name),
  );

  /* ---------- refs (legacy DOM bridges) ---------- */
  const commandInputRef = useRef<HTMLInputElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  /* LEGACY BRIDGE: showToast() — #statusToast .show class + 3.2s timeout. */
  const showToast = (title: string, body: string) => {
    setToast({ title, body });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  /* LEGACY BRIDGE: IntersectionObserver on .reveal — observes the page root
     sandbox; cleanup disconnects. Honor prefers-reduced-motion via CSS. */
  useEffect(() => {
    const host = revealRef.current;
    if (!host) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add(styles.in as string); }),
      { threshold: 0.12 },
    );
    host.querySelectorAll(`.${styles.reveal}`).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* LEGACY BRIDGE: keydown Cmd/Ctrl+K -> focus command input. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        commandInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* LEGACY BRIDGE: session countdown setInterval(…, 1000). */
  useEffect(() => {
    const id = setInterval(() => setSessionLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  /* LEGACY BRIDGE: deviceText UA sniff. */
  useEffect(() => {
    setDeviceText(/Mobi|Android/i.test(navigator.userAgent) ? 'Mobile browser' : 'Desktop browser');
  }, []);

  /* LEGACY BRIDGE: renderCards() — filter pipeline (query + cat + account). */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.dashboards.filter((d) => {
      const filterOk = currentFilter === 'all' || d.cat === currentFilter;
      const accountOk = currentAccount === 'all' || d.account === currentAccount;
      const queryOk = !q || [d.title, d.desc, d.type, ...d.features, ...d.actions].join(' ').toLowerCase().includes(q);
      return filterOk && accountOk && queryOk;
    });
  }, [content.dashboards, currentFilter, currentAccount, query]);

  /* LEGACY BRIDGE: selectDashboard() — the whole side panel derives here. */
  const selected = content.dashboards.find((d) => d.id === selectedId) ?? content.dashboards[0];
  const riskBadge = selected.cat === 'risk'
    ? { text: 'Step-up may apply', cls: s.badgeSoon }
    : selected.cat === 'credit'
      ? { text: 'Credit check', cls: s.badgeSoon }
      : { text: 'Low risk', cls: s.badgeOk };

  /* ---------- handlers (legacy listener bodies, kept 1:1) ---------- */
  const handleQuickAction = (e: React.MouseEvent, dash: DashboardDef, action: string) => {
    e.stopPropagation();
    showToast('Quick action queued', `${action} opened in ${dash.title}.`);
  };

  const handleRemember = () => {
    localStorage.setItem('paymo_selected_dashboard', selectedId);
    showToast('Dashboard remembered', `${selected.title} will open first next time.`);
  };

  const handleOpenSelected = () => {
    showToast('Opening dashboard', `Routing securely to ${selected.title}.`);
    window.location.hash = selected.url.replace('#', '');
  };

  const handleTour = () => {
    showToast('Preview tour started', `Highlighting the most important actions in ${selected.title}.`);
  };

  const handleClearAlerts = () => {
    setAlertsCleared(true);
    showToast('Notifications cleared', 'Unread alerts were marked as read.');
  };

  const handleLock = () => {
    showToast('Session locked', 'Your dashboard session is locked. Re-authentication would be required in production.');
  };

  const resetSearch = () => {
    setQuery('');
    setCurrentFilter('all');
  };

  const toggleWidget = (name: string) => {
    setActiveWidgets((prev) => (prev.includes(name) ? prev.filter((w) => w !== name) : [...prev, name]));
  };

  const handleCreateCustom = () => {
    const name = customName.trim() || 'Custom dashboard';
    showToast('Custom dashboard created', `${name} includes: ${activeWidgets.join(', ') || 'no widgets selected'}.`);
  };

  const sessionMm = String(Math.floor(sessionLeft / 60)).padStart(2, '0');
  const sessionSs = String(sessionLeft % 60).padStart(2, '0');

  /* ------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ---------------------------------------------------------------------- */
  return (
    <div className={s.hubPage} ref={revealRef}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading your dashboards…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Hub content unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/hub-content</code> — {error.message}. Using bundled configuration.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      {/* legacy grid overlay + blobs (absolute inside shell) */}
      <div className={s.gridOverlay} style={{ position: 'absolute', inset: 0, opacity: 0.55, pointerEvents: 'none' }} />
      <div className={s.blob} style={{ width: '520px', height: '520px', background: '#2ee6a0', top: '-180px', right: '-120px' }} />
      <div className={s.blob} style={{ width: '420px', height: '420px', background: '#0a7a54', bottom: '-150px', left: '-120px', animationDelay: '-6s' }} />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* ============ brand bar ============ */}
        <div className={cx(s.brandbar, s.reveal)}>
          <div className="d-flex align-items-center gap-3">
            <span className={s.logoMark}>P</span>
            <div>
              <div className="fw-bold text-white">
                Paymo <span className={s.textGradient}>BAAS</span>
              </div>
              <div className={s.brandSub}>Dashboard selection hub · Zero-trust routed session</div>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {content.accountTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={cx(s.quickTab, currentAccount === tab.id && s.active)}
                onClick={() => setCurrentAccount(tab.id)}
              >
                <i className={`bi ${tab.icon}`} /> {tab.label}
              </button>
            ))}
            <button type="button" className={s.quickTab} onClick={handleLock}>
              <i className="bi bi-shield-lock" /> Lock
            </button>
          </div>
        </div>

        <div className={cx(s.glassStrong, s.layoutFrame, s.reveal)}>
          {/* ============ hero strip ============ */}
          <section className={cx(s.heroStrip, 'mb-4')}>
            <img src="/assets/emerald-network.jpg" alt="Paymo dashboard command center" />
            <div className={s.heroContent}>
              <div className="row g-4 align-items-center">
                <div className="col-lg-7">
                  <span className={cx(s.pill, 'mb-3')}><span className={s.pillDot} /> {content.hero.pill}</span>
                  <h1 className={cx(s.heroTitle, 'mb-3')}>
                    {content.hero.titlePre}
                    <span className={s.textGradient}>{content.hero.titleAccent}</span>
                  </h1>
                  <p style={{ color: 'var(--hb-ink-2)', maxWidth: '650px', margin: 0 }}>{content.hero.copy}</p>
                </div>
                <div className="col-lg-5">
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    {content.hero.metrics.map(([value, label]) => (
                      <div className={s.heroMetric} key={label}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="row g-4">
            {/* ============ main column ============ */}
            <div className="col-xl-8">
              {/* command palette */}
              <section className={cx(s.glass, 'p-3 p-md-4 mb-4', s.reveal)} aria-label="Command palette">
                <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between mb-3">
                  <div>
                    <div className={s.sectionKicker}>Quick Search</div>
                    <h2 className="h5 mb-0 mt-1" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>
                      Search dashboards, transactions, settings or help.
                    </h2>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className={s.kbd}>Cmd</span><span className={s.kbd}>K</span>
                  </div>
                </div>
                <div className={s.searchWrap}>
                  <i className={cx('bi bi-search', s.searchIcon)} />
                  <input
                    ref={commandInputRef}
                    className={s.commandInput}
                    autoComplete="off"
                    placeholder="Try: transactions, loan, API keys, export, fraud alert..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className={s.filterRow}>
                  {content.categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={cx(s.quickTab, currentFilter === cat.id && s.active)}
                      onClick={() => setCurrentFilter(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* dashboard grid */}
              <section className={cx('mb-4', s.reveal)} aria-label="Dashboard cards">
                <div className="d-flex align-items-center justify-content-between mb-3 gap-3 flex-wrap">
                  <div>
                    <div className={s.sectionKicker}>Your workspaces</div>
                    <h2 className="h4 mb-0 mt-1" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>Available dashboards</h2>
                  </div>
                  <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} data-bs-toggle="modal" data-bs-target="#customDashModal">
                    <i className="bi bi-plus-square me-1" /> Create Custom Dashboard
                  </button>
                </div>
                <div className="row g-3">
                  {filtered.length > 0 ? (
                    filtered.map((dash) => (
                      <div className="col-md-6 col-xxl-4" key={dash.id}>
                        <article
                          className={cx(s.dashboardCard, dash.id === selectedId && s.active)}
                          style={{
                            '--c1': dash.c1,
                            '--c2': dash.c2,
                            '--card-glow': hexToRgba(dash.c1, 0.18),
                          } as CSSProperties}
                          onClick={() => setSelectedId(dash.id)}
                        >
                          <div className={s.cardInner}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <span className={s.cardIcon}><i className={`bi ${dash.icon}`} /></span>
                              <span className={cx(s.badgeMini, s[dash.badgeClass])}>{dash.badge}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className={cx(s.badgeMini, s.badgeNative)}>{dash.type}</span>
                              <h3 className={s.dashTitle}>{dash.title}</h3>
                            </div>
                            <p className={s.dashDesc}>{dash.desc}</p>
                            <div className="row g-2 mb-2">
                              {dash.metrics.map(([value, label]) => (
                                <div className="col-4" key={label}>
                                  <div className={s.metricChip}>
                                    <strong>{value}</strong>
                                    <span>{label}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className={s.featureList}>
                              {dash.features.map((feat) => (
                                <div key={feat}><i className="bi bi-check2-circle" /><span>{feat}</span></div>
                              ))}
                            </div>
                            <div className={s.quickActions}>
                              {dash.actions.map((action) => (
                                <button
                                  type="button"
                                  className={s.actionChip}
                                  key={action}
                                  onClick={(e) => handleQuickAction(e, dash, action)}
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        </article>
                      </div>
                    ))
                  ) : (
                    /* legacy empty state */
                    <div className="col-12">
                      <div className={cx(s.glass, 'p-4 text-center')}>
                        <i className="bi bi-search" style={{ fontSize: '2rem', color: 'var(--hb-accent)' }} />
                        <h3 className="h5 mt-3" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>No dashboard found</h3>
                        <p style={{ color: 'var(--hb-ink-2)' }}>Try another search term or clear filters.</p>
                        <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={resetSearch}>Reset search</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ============ side column ============ */}
            <aside className="col-xl-4">
              <div className={s.sidePanel}>
                {/* selected route */}
                <section className={cx(s.selectedPanel, s.glass, 'mb-3', s.reveal)} aria-label="Selected dashboard">
                  <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
                    <div>
                      <div className={s.sectionKicker}>Live selection</div>
                      <h2 className="h5 mb-0" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>Selected route</h2>
                    </div>
                    <span className={cx(s.badgeMini, riskBadge.cls)}>{riskBadge.text}</span>
                  </div>
                  <div className={cx(s.selectedPreview, 'mb-3')}>
                    <span className={s.previewGlyph} aria-hidden="true">{selected.emoji}</span>
                    <div className={s.previewCopy}>
                      <span className={cx(s.badgeMini, s.badgeNative)}>{selected.type}</span>
                      <h3 className="h5 mb-1" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>{selected.title}</h3>
                      <p className="mb-0" style={{ fontSize: '0.82rem', color: 'var(--hb-ink-2)' }}>{selected.desc}</p>
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    {selected.metrics.map(([value, label]) => (
                      <div className="col-4" key={label}>
                        <div className={s.metricChip}>
                          <strong>{value}</strong>
                          <span>{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className={cx(s.btnPaymo, 'w-100')} onClick={handleOpenSelected}>
                    <i className="bi bi-box-arrow-in-right me-1" /> Go to {selected.title}
                  </button>
                  <div className="d-flex gap-2 mt-2">
                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm flex-fill')} onClick={handleRemember}>
                      <i className="bi bi-pin-angle me-1" /> Remember
                    </button>
                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm flex-fill')} onClick={handleTour}>
                      <i className="bi bi-play-circle me-1" /> Preview tour
                    </button>
                  </div>
                </section>

                {/* notifications */}
                <section className={cx(s.glass, 'p-3 mb-3', s.reveal)} aria-label="Notifications">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className={s.sectionKicker}>Inbox</div>
                      <h2 className="h6 mb-0" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>Recent notifications</h2>
                    </div>
                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={handleClearAlerts} disabled={alertsCleared}>
                      Clear
                    </button>
                  </div>
                  {alertsCleared ? (
                    <div className={cx(s.dimText, 'text-center py-3')} style={{ fontSize: '0.86rem' }}>
                      <i className="bi bi-check2-circle me-1" /> All notifications marked as read.
                    </div>
                  ) : (
                    content.notifications.map((n) => (
                      <div className={s.notificationItem} key={n.dash}>
                        <span className={s.notificationDot} style={{ color: n.color, background: n.color }} />
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.86rem' }}>{n.dash}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--hb-ink-2)' }}>{n.msg}</div>
                        </div>
                      </div>
                    ))
                  )}
                </section>

                {/* session context */}
                <section className={cx(s.glass, 'p-3', s.reveal)} aria-label="Session context">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-fingerprint" style={{ color: 'var(--hb-accent)', fontSize: '1.2rem' }} />
                    <h2 className="h6 mb-0" style={{ color: 'var(--hb-ink-0)', fontWeight: 800 }}>Session context</h2>
                  </div>
                  <div className="d-grid gap-2" style={{ fontSize: '0.84rem', color: 'var(--hb-ink-2)' }}>
                    <div className="d-flex justify-content-between"><span>Device</span><strong className="text-white">{deviceText}</strong></div>
                    <div className="d-flex justify-content-between"><span>Location</span><strong className="text-white">{content.session.location}</strong></div>
                    <div className="d-flex justify-content-between"><span>Auth</span><strong className="text-white">{content.session.auth}</strong></div>
                    <div className="d-flex justify-content-between"><span>Session</span><strong className="text-white">{sessionMm}:{sessionSs}</strong></div>
                  </div>
                  <div className={cx(s.loadingBar, 'mt-3')}><span /></div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ============ custom dashboard modal (Bootstrap data-API) ============ */}
      <div className="modal fade" id="customDashModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className={cx('modal-content', s.modalContent)}>
            <div className="modal-header border-0">
              <div>
                <div className={s.sectionKicker}>Enterprise custom dashboard</div>
                <h5 className="modal-title mt-1">Create a custom dashboard</h5>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body pt-0">
              <p style={{ color: 'var(--hb-ink-2)', fontSize: '0.9rem' }}>
                Build a tailored workspace with widgets, scheduled exports, team sharing and specific KPIs.
              </p>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className={s.sectionKicker} htmlFor="customDashName" style={{ display: 'block', marginBottom: '0.4rem' }}>Dashboard name</label>
                  <input
                    id="customDashName"
                    className={s.commandInput}
                    style={{ paddingLeft: '1rem' }}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <label className={s.sectionKicker} htmlFor="customOwner" style={{ display: 'block', margin: '1rem 0 0.4rem' }}>Primary owner</label>
                  <select
                    id="customOwner"
                    className={s.commandInput}
                    style={{ paddingLeft: '1rem' }}
                    value={customOwner}
                    onChange={(e) => setCustomOwner(e.target.value)}
                  >
                    {content.owners.map((owner) => (
                      <option key={owner}>{owner}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-7">
                  <div className={s.customGrid}>
                    {content.widgets.map((widget) => (
                      <button
                        type="button"
                        key={widget.name}
                        className={cx(s.widgetOption, activeWidgets.includes(widget.name) && s.active)}
                        onClick={() => toggleWidget(widget.name)}
                      >
                        <i className={`bi ${widget.icon} me-1`} style={{ color: 'var(--hb-accent)' }} /> {widget.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className={s.btnOutline} data-bs-dismiss="modal">Cancel</button>
              <button type="button" className={s.btnPaymo} data-bs-dismiss="modal" onClick={handleCreateCustom}>
                <i className="bi bi-magic me-1" /> Create dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ toast (legacy #statusToast) ============ */}
      <div className={cx(s.toastish, s.glass, 'p-3', toast && s.show)} role="status" aria-live="polite">
        <div className="d-flex align-items-start gap-2">
          <i className="bi bi-check-circle-fill" style={{ color: '#86efac', fontSize: '1.15rem' }} />
          <div>
            <strong className="text-white">{toast?.title ?? 'Action completed'}</strong>
            <div style={{ fontSize: '0.82rem', color: 'var(--hb-ink-2)' }}>{toast?.body ?? 'Your preference was saved.'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
