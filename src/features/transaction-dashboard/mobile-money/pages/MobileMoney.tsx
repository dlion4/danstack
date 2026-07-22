import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/mobileMoney.module.css'
import MobileMoneyModals from '../components/MobileMoneyModals'

/* ============================================================================
   PayMo BaaS — Mobile Money & PSP Integration Hub (legacy page 1.11)
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem {
  icon: string
  to: string
  label: string
  active?: boolean
  dot?: boolean
}

interface SrItem {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  sub: string
  actionLabel: string
  actionTone?: 'btnPmD' | 'btnPmP'
  modal: string
}

interface QuickAction {
  icon: string
  label: string
  color: string
  modal: string
}

interface TableCol {
  key: string
  label: string
}

type CellAction = { action: string; modal: string; tone?: 'btnPmD' | 'btnPmP' }
type Cell = string | { badge: string; tone: BadgeTone } | CellAction | { actions: CellAction[] }

interface StatCardM {
  key: string
  colClass: string
  label: string
  labelColor: string
  value: string
  badge: { icon: string; text: string; tone: BadgeTone }
  lines?: { label: string; value: string }[]
  progress?: { label: string; value: string; width: string; color: string }
  bordered?: boolean
}

interface MobileMoneyConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string; headerInitials: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: { live: string; value: string; detail: string; buttons: { label: string; modal: string }[] }
  statCards: StatCardM[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  wallets: { cols: TableCol[]; rows: Cell[][] }
  snapshot: { label: string; value: string; boxTone: 'summaryBoxAccent' | 'summaryBoxInfo' | 'summaryBoxWarn'; color: string; big?: boolean }[]
  linkedWallets: { cols: TableCol[]; rows: Cell[][] }
  quickTransfer: { fromOptions: string[]; toOptions: string[]; amount: string }
  recentTransfers: { cols: TableCol[]; rows: Cell[][] }
  psps: { cols: TableCol[]; rows: Cell[][] }
  kycStatus: { label: string; count: string; tone: BadgeTone }[]
  txnLimits: { label: string; value: string }[]
  trendBars: { height: string; color: string }[]
  reconciliation: { label: string; value: string; sub: string }
  supportContacts: { label: string; value: string }[]
  alertSwitches: { label: string; checked: boolean }[]
  integrationHealth: { label: string; status: string; tone: BadgeTone }[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: MobileMoneyConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-phone', to: '/mobile-money', label: 'Mobile Money & PSP Hub', active: true, dot: true },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Mobile Money & PSP Hub',
  headerSub: 'M-Pesa, Airtel Money, T-Kash, PSP integrations, transfers, reconciliation & compliance',
  searchPlaceholder: 'Search wallets, transactions, PSPs, disputes...',
  user: { initials: 'JK', name: 'James K.', role: 'Treasury Manager', headerInitials: 'MN' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'Transactions', to: '/select-dashboard' },
    ],
    current: 'Mobile Money & PSP Hub',
  },
  pageCode: 'PAGE 1.11',
  pageTitle: 'Mobile Money & PSP Integration Hub',
  pageSub:
    'Manage M-Pesa, Airtel Money, T-Kash, Pesalink, and 20+ PSP integrations. Execute transfers, reconcile wallets, handle disputes, and maintain full compliance from one command center.',
  hero: {
    live: 'Mobile Money command center live',
    value: '12 wallets linked',
    detail: 'M-Pesa, Airtel Money, T-Kash, Pesalink, 8 PSPs and 3 bank integrations — all reconciled in real time.',
    buttons: [
      { label: 'Send', modal: 'sendMoneyModal' },
      { label: 'Bulk', modal: 'bulkTransferModal' },
      { label: 'Reconcile', modal: 'reconcileModal' },
    ],
  },
  statCards: [
    {
      key: 'pending',
      colClass: 'col-lg-2 col-md-4 col-6',
      label: 'PENDING SETTLEMENT',
      labelColor: 'var(--pm-warning)',
      value: 'KES 4.82M',
      badge: { icon: 'bi-clock', text: '7 batches', tone: 'badgeW' },
      lines: [{ label: 'Next auto-settle:', value: 'Today 6 PM' }],
    },
    {
      key: 'volume',
      colClass: 'col-lg-3 col-md-4 col-6',
      label: "TODAY'S VOLUME",
      labelColor: 'var(--pm-info)',
      value: 'KES 18.4M',
      badge: { icon: 'bi-graph-up-arrow', text: '+31% vs yesterday', tone: 'badgeS' },
      progress: { label: 'Success rate', value: '99.2%', width: '99.2%', color: 'var(--pm-accent)' },
    },
    {
      key: 'compliance',
      colClass: 'col-lg-3 col-md-4',
      label: 'COMPLIANCE HEALTH',
      labelColor: 'var(--pm-accent)',
      value: '98.7',
      badge: { icon: 'bi-shield-check', text: 'All clear', tone: 'badgeS' },
      lines: [
        { label: 'Last audit:', value: '12 Jun 2025' },
        { label: 'Next KYC refresh:', value: '45 accounts' },
      ],
      bordered: true,
    },
  ],
  attention: [
    {
      icon: 'bi-exclamation-triangle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'M-Pesa B2C batch failed (47 txns)',
      sub: 'KES 1.24M — retry or manual review',
      actionLabel: 'Retry',
      actionTone: 'btnPmD',
      modal: 'bulkRetryModal',
    },
    {
      icon: 'bi-person-exclamation',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'KYC refresh required (45 accounts)',
      sub: 'Due by 30 Jun 2025',
      actionLabel: 'Start',
      modal: 'kycBulkModal',
    },
    {
      icon: 'bi-link-45deg',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Airtel Money API token expiring',
      sub: 'In 6 days — renew credentials',
      actionLabel: 'Renew',
      modal: 'pspSettingsModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-lightning-charge',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Enable instant M-Pesa B2B for 3 suppliers',
      sub: 'Save 2–4 hours per payment cycle',
      actionLabel: 'Enable',
      modal: 'pspSettingsModal',
    },
    {
      icon: 'bi-graph-down',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Switch 18% of volume to T-Kash',
      sub: 'Lower fees on small disbursements',
      actionLabel: 'Compare',
      modal: 'pspCompareModal',
    },
    {
      icon: 'bi-shield-check',
      iconBg: 'var(--pm-purple-soft)',
      iconColor: 'var(--pm-purple)',
      title: 'Run daily reconciliation at 10 PM',
      sub: 'Catch 99.8% of mismatches automatically',
      actionLabel: 'Schedule',
      modal: 'reconcileModal',
    },
  ],
  quickActions: [
    { icon: 'bi-send', label: 'Send Money', color: 'var(--pm-accent)', modal: 'sendMoneyModal' },
    { icon: 'bi-collection', label: 'Bulk Transfer', color: 'var(--pm-primary-light)', modal: 'bulkTransferModal' },
    { icon: 'bi-plus-circle', label: 'Link Wallet', color: 'var(--pm-info)', modal: 'linkWalletModal' },
    { icon: 'bi-arrow-repeat', label: 'Reconcile', color: 'var(--pm-warning)', modal: 'reconcileModal' },
    { icon: 'bi-exclamation-triangle', label: 'Dispute', color: 'var(--pm-danger)', modal: 'disputeModal' },
    { icon: 'bi-gear', label: 'PSP Settings', color: 'var(--pm-purple)', modal: 'pspSettingsModal' },
    { icon: 'bi-person-check', label: 'KYC Refresh', color: 'var(--pm-accent)', modal: 'kycBulkModal' },
    { icon: 'bi-download', label: 'Statements', color: 'var(--pm-muted)', modal: 'statementModal' },
  ],
  wallets: {
    cols: [
      { key: 'wallet', label: 'Wallet' },
      { key: 'provider', label: 'Provider' },
      { key: 'balance', label: 'Balance' },
      { key: 'limit', label: 'Daily Limit' },
      { key: 'health', label: 'Health' },
      { key: 'txns', label: '24h Txns' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['STR:Business Paybill', { badge: 'M-Pesa', tone: 'badgeS' }, 'STR:KES 8,420,500', 'KES 50M', { badge: '98', tone: 'badgeS' }, '1,842', { action: 'Manage', modal: 'walletDetailModal' }],
      ['STR:Disbursement Till', { badge: 'Airtel Money', tone: 'badgeI' }, 'STR:KES 2,184,000', 'KES 20M', { badge: '94', tone: 'badgeS' }, '892', { action: 'Manage', modal: 'walletDetailModal' }],
      ['STR:Collections Till', { badge: 'T-Kash', tone: 'badgeW' }, 'STR:KES 941,200', 'KES 10M', { badge: '87', tone: 'badgeW' }, '312', { action: 'Manage', modal: 'walletDetailModal' }],
      ['STR:Payroll Float', { badge: 'Pesalink', tone: 'badgeP' }, 'STR:KES 12,500,000', 'KES 100M', { badge: '99', tone: 'badgeS' }, '48', { action: 'Manage', modal: 'walletDetailModal' }],
    ],
  },
  snapshot: [
    { label: 'TOTAL MOBILE BALANCE', value: 'KES 24.05M', boxTone: 'summaryBoxAccent', color: 'var(--pm-accent)', big: true },
    { label: "TODAY'S NET FLOW", value: '+ KES 3.82M', boxTone: 'summaryBoxInfo', color: 'var(--pm-info)' },
    { label: 'PENDING SETTLEMENT', value: 'KES 4.82M', boxTone: 'summaryBoxWarn', color: 'var(--pm-warning)' },
  ],
  linkedWallets: {
    cols: [
      { key: 'wallet', label: 'Wallet' },
      { key: 'provider', label: 'Provider' },
      { key: 'owner', label: 'Owner' },
      { key: 'kyc', label: 'KYC' },
      { key: 'status', label: 'Status' },
      { key: 'perms', label: 'Permissions' },
      { key: 'actions', label: 'Actions' },
    ],
    rows: [
      ['STR:0712 345 890', 'M-Pesa', 'James Kamau', { badge: 'Full', tone: 'badgeS' }, { badge: 'Active', tone: 'badgeS' }, 'Send, Receive, Bulk', { actions: [{ action: 'Edit', modal: 'walletDetailModal' }, { action: 'Perms', modal: 'walletPermissionsModal' }, { action: 'Pause', modal: 'pauseWalletModal', tone: 'btnPmD' }] }],
      ['STR:0733 112 445', 'Airtel Money', 'Finance Dept', { badge: 'Full', tone: 'badgeS' }, { badge: 'Active', tone: 'badgeS' }, 'Send, Bulk', { actions: [{ action: 'Edit', modal: 'walletDetailModal' }, { action: 'Perms', modal: 'walletPermissionsModal' }, { action: 'Pause', modal: 'pauseWalletModal', tone: 'btnPmD' }] }],
      ['STR:0700 998 112', 'T-Kash', 'Procurement', { badge: 'Partial', tone: 'badgeW' }, { badge: 'Pending KYC', tone: 'badgeW' }, 'Receive only', { actions: [{ action: 'Complete KYC', modal: 'kycBulkModal' }, { action: 'Pause', modal: 'pauseWalletModal', tone: 'btnPmD' }] }],
    ],
  },
  quickTransfer: {
    fromOptions: ['M-Pesa Business (KES 8.42M)', 'Airtel Disbursement (KES 2.18M)'],
    toOptions: ['0712 345 890 — James Kamau', '0733 112 445 — Finance', '0700 998 112 — Procurement'],
    amount: '250000',
  },
  recentTransfers: {
    cols: [
      { key: 'date', label: 'Date' },
      { key: 'route', label: 'From → To' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'ref', label: 'Ref' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['27 Jun', 'M-Pesa → 0712***890', 'KES 250,000', { badge: 'Success', tone: 'badgeS' }, 'C:MP-882910', { action: 'Receipt', modal: 'transferReceiptModal' }],
      ['27 Jun', 'Airtel → 200 suppliers', 'KES 4,820,000', { badge: 'Partial', tone: 'badgeW' }, 'C:AT-991203', { action: 'Retry 47', modal: 'bulkRetryModal' }],
      ['26 Jun', 'T-Kash → 0733***445', 'KES 85,000', { badge: 'Success', tone: 'badgeS' }, 'C:TK-774501', { action: 'Receipt', modal: 'transferReceiptModal' }],
    ],
  },
  psps: {
    cols: [
      { key: 'psp', label: 'PSP' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'health', label: 'API Health' },
      { key: 'settlement', label: 'Settlement' },
      { key: 'actions', label: 'Actions' },
    ],
    rows: [
      ['STR:Safaricom M-Pesa', 'B2C / C2B', { badge: 'Live', tone: 'badgeS' }, { badge: '99.98%', tone: 'badgeS' }, 'T+0', { actions: [{ action: 'Settings', modal: 'pspSettingsModal' }, { action: 'Health', modal: 'pspHealthModal' }] }],
      ['STR:Airtel Money', 'B2C / C2B', { badge: 'Live', tone: 'badgeS' }, { badge: '99.71%', tone: 'badgeS' }, 'T+1', { actions: [{ action: 'Settings', modal: 'pspSettingsModal' }, { action: 'Health', modal: 'pspHealthModal' }] }],
      ['STR:Pesalink', 'Bank Transfer', { badge: 'Live', tone: 'badgeS' }, { badge: '100%', tone: 'badgeS' }, 'Real-time', { actions: [{ action: 'Settings', modal: 'pspSettingsModal' }, { action: 'Health', modal: 'pspHealthModal' }] }],
      ['STR:Cellulant', 'PSP Aggregator', { badge: 'Maintenance', tone: 'badgeW' }, { badge: '94.2%', tone: 'badgeW' }, 'T+1', { actions: [{ action: 'Settings', modal: 'pspSettingsModal' }, { action: 'Health', modal: 'pspHealthModal' }] }],
    ],
  },
  kycStatus: [
    { label: 'Full KYC', count: '187 accounts', tone: 'badgeS' },
    { label: 'Partial KYC', count: '45 accounts', tone: 'badgeW' },
    { label: 'Expired KYC', count: '12 accounts', tone: 'badgeD' },
  ],
  txnLimits: [
    { label: 'Per Transaction', value: 'KES 1,000,000' },
    { label: 'Daily Limit', value: 'KES 50,000,000' },
    { label: 'Monthly Limit', value: 'KES 500,000,000' },
  ],
  trendBars: [
    { height: '65%', color: 'var(--pm-primary)' },
    { height: '78%', color: 'var(--pm-primary)' },
    { height: '92%', color: 'var(--pm-primary)' },
    { height: '71%', color: 'var(--pm-primary)' },
    { height: '85%', color: 'var(--pm-primary)' },
    { height: '100%', color: 'var(--pm-primary)' },
    { height: '88%', color: 'var(--pm-accent)' },
  ],
  reconciliation: { label: 'LAST RECONCILIATION', value: '27 Jun 2025, 06:00', sub: '0 mismatches • 100% matched' },
  supportContacts: [
    { label: 'Phone', value: '+254 800 723 001' },
    { label: 'WhatsApp', value: '+254 712 000 001' },
    { label: 'Email', value: 'psp@paymo.co.ke' },
  ],
  alertSwitches: [
    { label: 'Failed transactions', checked: true },
    { label: 'API downtime', checked: true },
    { label: 'Settlement delays', checked: true },
    { label: 'KYC expiry', checked: false },
  ],
  integrationHealth: [
    { label: 'M-Pesa API', status: 'Healthy', tone: 'badgeS' },
    { label: 'Airtel API', status: 'Healthy', tone: 'badgeS' },
    { label: 'Pesalink', status: 'Degraded', tone: 'badgeW' },
  ],
}

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchMobileMoney(): Promise<MobileMoneyConfig> {
  const res = await fetch('/api/mobile-money-hub')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<MobileMoneyConfig>
  return { ...initialMockData, ...json }
}

/* ---------- cell renderer for data tables ---------- */
function CellValue({ cell, onOpen }: { cell: Cell; onOpen: (id: string) => void }) {
  if (typeof cell === 'string') {
    if (cell.startsWith('C:')) return <code>{cell.slice(2)}</code>
    if (cell.startsWith('STR:')) return <strong>{cell.slice(4)}</strong>
    return <>{cell}</>
  }
  if ('badge' in cell) return <span className={`${styles.badge} ${styles[cell.tone]}`}>{cell.badge}</span>
  if ('actions' in cell) {
    return (
      <div className="d-flex" style={{ gap: 4 }}>
        {cell.actions.map((a) => (
          <button
            key={a.action}
            className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ''}`}
            onClick={() => onOpen(a.modal)}
          >
            {a.action}
          </button>
        ))}
      </div>
    )
  }
  return (
    <button
      className={`${styles.btnPm} ${styles.btnSm} ${cell.tone ? styles[cell.tone] : ''}`}
      onClick={() => onOpen(cell.modal)}
    >
      {cell.action}
    </button>
  )
}

/* ---------- section header (1.11.x pattern) ---------- */
function SectionHead({
  icon,
  iconColor,
  code,
  title,
  sub,
  actions,
  onOpen,
}: {
  icon: string
  iconColor: string
  code: string
  title: string
  sub: string
  actions: { label: string; icon?: string; modal: string; tone?: 'btnPmP' | 'btnPmD' }[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
      <div>
        <h3 className={styles.st}>
          <i className={`bi ${icon}`} style={{ color: iconColor }} /> {code} — {title}
        </h3>
        <p className={styles.ss}>{sub}</p>
      </div>
      <div className="d-flex" style={{ gap: 8 }}>
        {actions.map((a) => (
          <button
            key={a.label}
            className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ''}`}
            onClick={() => onOpen(a.modal)}
          >
            {a.icon && <i className={`bi ${a.icon}`} />} {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MobileMoney() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-mobile-money'],
    queryFn: fetchMobileMoney,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  /* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
  const openM = (id: string) => setActiveModal(id)
  const closeM = () => setActiveModal(null)

  return (
    <div className={styles.mobileMoneyPage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load mobile money data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading mobile money workspace…
          </div>
        </div>
      )}

      {/* ======================= SIDEBAR ======================= */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>P</div>
        <nav className={styles.sidebarNav}>
          {config.nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
              title={item.label}
              aria-label={item.label}
            >
              <i className={`bi ${item.icon}`} />
              {item.dot && <span className={styles.badgeDot} />}
            </Link>
          ))}
        </nav>
        <Link to="/support" className={styles.navItem} style={{ marginTop: 'auto' }} title="Help & Support" aria-label="Help & Support">
          <i className="bi bi-question-circle" />
        </Link>
      </aside>

      <div className={styles.main}>
        {/* ======================= HEADER ======================= */}
        <header className={styles.header}>
          <div className={styles.headerTitle} style={{ flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className={styles.avatar} style={{ width: 36, height: 36, fontSize: 13 }}>
                {config.user.headerInitials}
              </div>
              <div>
                <h1>{config.headerTitle}</h1>
                <p>{config.headerSub}</p>
              </div>
            </div>
          </div>
          <div className={styles.headerSearch}>
            <i className="bi bi-search" />
            <input type="text" placeholder={config.searchPlaceholder} aria-label="Search mobile money" />
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn} onClick={() => openM('healthCheckModal')} title="Health check" aria-label="Health check">
              <i className="bi bi-heart-pulse" />
            </button>
            <button className={styles.headerBtn} onClick={() => openM('notifModal')} title="Notifications" aria-label="Notifications">
              <i className="bi bi-bell" />
              <span className={styles.counter}>14</span>
            </button>
            <button className={styles.profileBtn} onClick={() => openM('profileModal')}>
              <div className={styles.avatar}>{config.user.initials}</div>
              <div className={styles.profileMeta}>
                <div className={styles.profileName}>{config.user.name}</div>
                <div className={styles.profileRole}>{config.user.role}</div>
              </div>
            </button>
          </div>
        </header>

        {/* ======================= PAGE BAR ======================= */}
        <div className={styles.pageBar}>
          <div>
            <div className={styles.breadcrumb}>
              {config.breadcrumb.parents.map((p) => (
                <span key={p.label}>
                  <Link to={p.to}>{p.label}</Link> /{' '}
                </span>
              ))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 className={styles.pageH2}>
              {config.pageCode} — {config.pageTitle}
            </h2>
            <p className={styles.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={styles.btnPm} onClick={() => openM('healthCheckModal')}>
              <i className="bi bi-heart-pulse" /> Health
            </button>
            <button className={styles.btnPm} onClick={() => openM('reconcileModal')}>
              <i className="bi bi-arrow-repeat" /> Reconcile
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('sendMoneyModal')}>
              <i className="bi bi-send" /> Send Money
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmA}`} onClick={() => openM('linkWalletModal')}>
              <i className="bi bi-plus-lg" /> Link Wallet
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* ======================= HERO STATS ======================= */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.82)' }}>
                  {config.hero.live} <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff' }}>
                  {config.hero.value}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.82)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.buttons.map((b) => (
                    <button key={b.label} className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => openM(b.modal)}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((card) => (
              <div className={card.colClass} key={card.key}>
                <div
                  className={styles.card}
                  style={{ minHeight: 170, ...(card.bordered ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}
                >
                  <p className={styles.sl} style={{ color: card.labelColor }}>
                    {card.label}
                  </p>
                  <div className={styles.sv} style={{ margin: '6px 0' }}>
                    {card.value}
                  </div>
                  <span className={`${styles.badge} ${styles[card.badge.tone]}`}>
                    <i className={`bi ${card.badge.icon}`} /> {card.badge.text}
                  </span>
                  {card.lines && (
                    <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                      {card.lines.map((li) => (
                        <div key={li.label}>
                          {li.label} <strong>{li.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                  {card.progress && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                        <span>{card.progress.label}</span>
                        <span>{card.progress.value}</span>
                      </div>
                      <div className={`${styles.pmProgress} mt-1`}>
                        <div className={styles.pmProgressBar} style={{ width: card.progress.width, background: card.progress.color }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ======================= ATTENTION / SUGGESTIONS / QUICK ACTIONS ======================= */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className={styles.st}>Attention Required</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('attentionModal')}>
                    View all
                  </button>
                </div>
                {config.attention.map((item) => (
                  <div className={styles.sr} key={item.title}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div>
                        <div className={styles.fwBold13}>{item.title}</div>
                        <div className={styles.mutedSmall}>{item.sub}</div>
                      </div>
                    </div>
                    <button
                      className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ''}`}
                      onClick={() => openM(item.modal)}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className={styles.st}>Smart Suggestions</h3>
                  <span className={`${styles.badge} ${styles.badgeP}`}>
                    <i className="bi bi-stars" /> AI
                  </span>
                </div>
                {config.suggestions.map((item) => (
                  <div className={styles.sr} key={item.title}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div>
                        <div className={styles.fwBold13}>{item.title}</div>
                        <div className={styles.mutedSmall}>{item.sub}</div>
                      </div>
                    </div>
                    <button
                      className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ''}`}
                      onClick={() => openM(item.modal)}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent mobile money workflows</p>
                </div>
                <div className={styles.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button key={qa.label} className={styles.quickBtn} onClick={() => openM(qa.modal)}>
                      <i className={`bi ${qa.icon} me-1`} style={{ color: qa.color }} /> {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.11.1 — Portfolio Overview ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-wallet2"
              iconColor="var(--pm-primary)"
              code="1.11.1"
              title="Mobile Money Portfolio Overview"
              sub="Real-time balances, limits, health scores and transaction velocity across all connected mobile money wallets."
              actions={[
                { label: 'Link', icon: 'bi-plus-lg', modal: 'linkWalletModal' },
                { label: 'Health', modal: 'walletHealthModal', tone: 'btnPmP' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.wallets.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.wallets.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                <CellValue cell={cell} onOpen={openM} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Portfolio Snapshot</h4>
                  {config.snapshot.map((s) => (
                    <div className={`${styles[s.boxTone]} mb-2`} key={s.label}>
                      <div className={styles.miniStatLabel} style={{ color: s.color }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: s.big ? 24 : 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.11.2 — Linked Wallets ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-link-45deg"
              iconColor="var(--pm-accent)"
              code="1.11.2"
              title="Linked Wallets & Accounts"
              sub="View, edit, pause, or remove all connected mobile money accounts with full KYC status and permission levels."
              actions={[{ label: 'Link New Wallet', modal: 'linkWalletModal', tone: 'btnPmP' }]}
              onOpen={openM}
            />
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.linkedWallets.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.linkedWallets.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          <CellValue cell={cell} onOpen={openM} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================= SECTION 1.11.3 — Transfer Hub ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-send"
              iconColor="var(--pm-primary)"
              code="1.11.3"
              title="Transfer & Payment Hub"
              sub="Execute single, bulk, scheduled and recurring transfers across all mobile money networks with full audit trails."
              actions={[
                { label: 'Schedule', modal: 'scheduleTransferModal' },
                { label: 'New Transfer', modal: 'sendMoneyModal', tone: 'btnPmP' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Quick Transfer</h4>
                  <div className="mb-3">
                    <label className={styles.fl}>From</label>
                    <select className={styles.fc} defaultValue={config.quickTransfer.fromOptions[0]}>
                      {config.quickTransfer.fromOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className={styles.fl}>To</label>
                    <select className={styles.fc} defaultValue={config.quickTransfer.toOptions[0]}>
                      {config.quickTransfer.toOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className={styles.fl}>Amount</label>
                    <input className={styles.fc} defaultValue={config.quickTransfer.amount} />
                  </div>
                  <div className="d-flex gap-2">
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('sendMoneyModal')}>
                      Send Now
                    </button>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('scheduleTransferModal')}>
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Transfers</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.recentTransfers.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.recentTransfers.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                <CellValue cell={cell} onOpen={openM} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.11.4 — PSP Integration ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-plug"
              iconColor="var(--pm-purple)"
              code="1.11.4"
              title="PSP Integration Management"
              sub="Connect, monitor, and manage 20+ Payment Service Providers with API health, credentials, and settlement rules."
              actions={[{ label: 'Add PSP', modal: 'addPspModal', tone: 'btnPmP' }]}
              onOpen={openM}
            />
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.psps.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.psps.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          <CellValue cell={cell} onOpen={openM} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================= SECTION 1.11.5 — Compliance, KYC & Limits ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-shield-check"
              iconColor="var(--pm-info)"
              code="1.11.5"
              title="Compliance, KYC & Limits"
              sub="Manage KYC status, transaction limits, AML flags, and regulatory reporting for all mobile money activity."
              actions={[{ label: 'Bulk KYC', modal: 'kycBulkModal', tone: 'btnPmP' }]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>KYC Status</h4>
                  {config.kycStatus.map((k) => (
                    <div className={styles.sr} key={k.label}>
                      <div>
                        <strong>{k.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[k.tone]}`}>{k.count}</span>
                    </div>
                  ))}
                  <div className="mt-3">
                    <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => openM('kycBulkModal')}>
                      Refresh 45 Partial + 12 Expired
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Transaction Limits</h4>
                  {config.txnLimits.map((l) => (
                    <div className={styles.sr} key={l.label}>
                      <div>
                        <strong>{l.label}</strong>
                      </div>
                      <strong>{l.value}</strong>
                    </div>
                  ))}
                  <div className="mt-3">
                    <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => openM('limitSettingsModal')}>
                      Adjust Limits
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.11.6 — Analytics & Reconciliation ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-bar-chart-line"
              iconColor="var(--pm-warning)"
              code="1.11.6"
              title="Analytics, Reconciliation & Reporting"
              sub="Reconciliation engine, volume trends, fee analysis, and regulatory reports."
              actions={[
                { label: 'Run Reconciliation', modal: 'reconcileModal' },
                { label: 'Export Reports', modal: 'statementModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>7-Day Volume Trend</h4>
                  <div className={styles.chartBars} style={{ height: 80 }}>
                    {config.trendBars.map((b, i) => (
                      <div key={i} className={styles.chartBar} style={{ height: b.height, background: b.color }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Reconciliation Status</h4>
                  <div className={`${styles.summaryBoxAccent} mb-2`}>
                    <div className={styles.miniStatLabel} style={{ color: 'var(--pm-accent)' }}>
                      {config.reconciliation.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-accent)' }}>{config.reconciliation.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{config.reconciliation.sub}</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => openM('reconcileModal')}>
                    Run Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.11.7 — Support & Settings ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-headset"
              iconColor="var(--pm-danger)"
              code="1.11.7"
              title="Support, Alerts & Settings"
              sub="24/7 support, alert configuration, API credentials, and integration health monitoring."
              actions={[{ label: 'Contact Support', modal: 'contactSupportModal', tone: 'btnPmD' }]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>24/7 Support</h4>
                  {config.supportContacts.map((c) => (
                    <div className={styles.sr} key={c.label}>
                      <div>
                        <strong>{c.label}</strong>
                      </div>
                      <strong>{c.value}</strong>
                    </div>
                  ))}
                  <div className={styles.sr}>
                    <div>
                      <strong>In-app Chat</strong>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('contactSupportModal')}>
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Alert Settings</h4>
                  {config.alertSwitches.map((s, i) => (
                    <div className={`form-check form-switch ${i < config.alertSwitches.length - 1 ? 'mb-2' : ''}`} key={s.label}>
                      <input className="form-check-input" type="checkbox" defaultChecked={s.checked} id={`asw${i}`} />
                      <label className="form-check-label" htmlFor={`asw${i}`}>
                        {s.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Integration Health</h4>
                  {config.integrationHealth.map((h) => (
                    <div className={styles.sr} key={h.label}>
                      <div>
                        <strong>{h.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[h.tone]}`}>{h.status}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('pspHealthModal')}>
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* content */}
      </div>
      {/* main */}

      {/* ======================= ALL 25 MODALS ======================= */}
      <MobileMoneyModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
