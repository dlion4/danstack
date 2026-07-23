import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/analytics.module.css'
import AnalyticsModals from '../components/AnalyticsModals'

/* ============================================================================
   PayMo BaaS — Transaction Analytics & Reporting (legacy page 1.8)
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface SrRow {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  sub: string
  actionLabel: string
  modal: string
}

interface AnalyticsConfig {
  nav: { icon: string; to: string; label: string; active?: boolean; dot?: boolean }[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string; headerInitials: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  hero: { live: string; value: string; detail: string; actions: { label: string; modal: string }[] }
  statCards: {
    key: string
    label: string
    labelColor: string
    value: string
    badge: { icon: string; text: string; tone: BadgeTone }
    note?: string[]
    progress?: { width: string; color: string }
    bordered?: boolean
  }[]
  attention: SrRow[]
  suggestions: SrRow[]
  quickActions: { icon: string; label: string; color: string; modal: string }[]
  trendBars: { height: string; color: string; label: string }[]
  trendSummary: { value: string; label: string }[]
  topMerchants: { name: string; sub: string; share: string; tone: BadgeTone }[]
  heatmap: { label: string; value: string; bg: string; color?: string }[]
  weekdays: { label: string; value: string; color: string }[]
  bestDay: { label: string; day: string; note: string }
  seasonal: { label: string; badge: string; tone: BadgeTone }[]
  failureReasons: { label: string; badge: string; tone: BadgeTone; count: string }[]
  topFailing: { name: string; badge: string; tone: BadgeTone }[]
  retryPerf: { label: string; value: string; bg: string; color: string; labelColor: string }[]
  categories: { name: string; volume: string; txns: string; success: string; successTone: BadgeTone; avg: string }[]
  concentration: { title: string; value: string; sub: string; score: string }
  templates: { title: string; sub: string }[]
  recentReports: { name: string; created: string; filters: string; status: string; tone: BadgeTone; action: string; modal: string }[]
  scheduled: { name: string; freq: string; next: string; recipients: string; status: string; tone: BadgeTone; paused: boolean; msg: string }[]
  recentExports: { name: string; meta: string }[]
  exportOptions: { icon: string; label: string; color: string }[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: AnalyticsConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-wallet2', to: '/wallets', label: 'Wallets' },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics', active: true, dot: true },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Transaction Analytics & Reporting',
  headerSub: 'Comprehensive insights, trends, custom reports and scheduled exports for all bank-to-bank activity',
  searchPlaceholder: 'Search reports, merchants, failed transactions, categories...',
  user: { initials: 'JK', name: 'James K.', role: 'Analytics Lead', headerInitials: 'MN' },
  pageCode: 'PAGE 1.8',
  pageTitle: 'Transaction Analytics & Reporting',
  pageSub:
    'Deep-dive analytics on volumes, success rates, failure patterns, merchant insights, custom report builder and automated delivery.',
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'Transactions', to: '/settlement' },
    ],
    current: 'Analytics & Reporting',
  },
  hero: {
    live: 'Analytics engine live',
    value: 'KES 2.84B analyzed',
    detail: '42,891 transactions • 94.7% success rate • 1,284 merchants tracked this month.',
    actions: [
      { label: 'Build Report', modal: 'reportBuilderModal' },
      { label: 'Schedule', modal: 'scheduledReportsModal' },
      { label: 'Export', modal: 'exportModal' },
    ],
  },
  statCards: [
    {
      key: 'success',
      label: 'SUCCESS RATE',
      labelColor: 'var(--pm-accent)',
      value: '94.7%',
      badge: { icon: 'bi-graph-up-arrow', text: '+1.8% vs last month', tone: 'badgeS' },
      progress: { width: '94.7%', color: 'var(--pm-accent)' },
    },
    {
      key: 'avg',
      label: 'AVG TRANSACTION VALUE',
      labelColor: 'var(--pm-info)',
      value: 'KES 66,240',
      badge: { icon: 'bi-graph-down-arrow', text: '-4.2% MoM', tone: 'badgeI' },
      note: ['Peak day: KES 124.8M', 'Peak hour: 10:00–11:00 AM'],
    },
    {
      key: 'failed',
      label: 'FAILED TRANSACTIONS',
      labelColor: 'var(--pm-warning)',
      value: '2,247',
      badge: { icon: 'bi-exclamation-triangle', text: '5.3% failure rate', tone: 'badgeD' },
      note: ['Top reason: Insufficient funds (1,124)', 'Top merchant: KRA iTax (318)'],
      bordered: true,
    },
  ],
  attention: [
    {
      icon: 'bi-x-circle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'KRA iTax failures spike 38%',
      sub: '318 failed • KES 42.1M at risk',
      actionLabel: 'Investigate',
      modal: 'failureDrillModal',
    },
    {
      icon: 'bi-clock',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Report generation delayed',
      sub: 'Monthly reconciliation • 4 hours late',
      actionLabel: 'Retry',
      modal: 'scheduledReportsModal',
    },
    {
      icon: 'bi-graph-down',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Merchant concentration risk',
      sub: 'Top 3 merchants = 47% volume',
      actionLabel: 'Review',
      modal: 'merchantDrillModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-lightbulb',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Enable auto-retry for failed KRA payments',
      sub: 'Recover ~KES 18M monthly',
      actionLabel: 'Enable',
      modal: 'autoRetryModal',
    },
    {
      icon: 'bi-clock-history',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Schedule weekly failure analysis',
      sub: 'Every Monday 8 AM',
      actionLabel: 'Schedule',
      modal: 'scheduledReportsModal',
    },
    {
      icon: 'bi-pie-chart',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Add merchant risk scoring to dashboard',
      sub: 'Proactive concentration alerts',
      actionLabel: 'Add',
      modal: 'merchantDrillModal',
    },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', label: 'New Report', color: 'var(--pm-primary-light)', modal: 'reportBuilderModal' },
    { icon: 'bi-download', label: 'Export CSV/PDF', color: 'var(--pm-accent)', modal: 'exportModal' },
    { icon: 'bi-x-circle', label: 'Failure Analysis', color: 'var(--pm-danger)', modal: 'failureDrillModal' },
    { icon: 'bi-shop', label: 'Merchant Insights', color: 'var(--pm-warning)', modal: 'merchantDrillModal' },
    { icon: 'bi-calendar-event', label: 'Scheduled Reports', color: 'var(--pm-info)', modal: 'scheduledReportsModal' },
    { icon: 'bi-graph-up', label: 'Trend Drill-down', color: 'var(--pm-purple)', modal: 'trendModal' },
    { icon: 'bi-heart-pulse', label: 'Health Check', color: 'var(--pm-muted)', modal: 'healthCheckModal' },
    { icon: 'bi-tags', label: 'Category Analysis', color: 'var(--pm-accent)', modal: 'categoryModal' },
  ],
  trendBars: [
    { height: '55%', color: 'var(--pm-info)', label: 'W1' },
    { height: '68%', color: 'var(--pm-info)', label: 'W2' },
    { height: '82%', color: 'var(--pm-primary)', label: 'W3' },
    { height: '74%', color: 'var(--pm-primary)', label: 'W4' },
    { height: '91%', color: 'var(--pm-accent)', label: 'W5' },
  ],
  trendSummary: [
    { value: 'KES 2.84B', label: 'total volume' },
    { value: '42,891', label: 'transactions' },
    { value: '94.7%', label: 'success' },
  ],
  topMerchants: [
    { name: 'KRA iTax', sub: 'KES 684M • 8,421 txns', share: '24.1%', tone: 'badgeS' },
    { name: 'Equity Bank', sub: 'KES 412M • 5,882 txns', share: '14.5%', tone: 'badgeI' },
    { name: 'Safaricom M-Pesa', sub: 'KES 298M • 12,104 txns', share: '10.5%', tone: 'badgeP' },
    { name: 'Co-op Bank', sub: 'KES 187M • 2,991 txns', share: '6.6%', tone: 'badgeW' },
    { name: 'DTB Kenya', sub: 'KES 154M • 1,882 txns', share: '5.4%', tone: 'badgeW' },
  ],
  heatmap: [
    { label: '6-9AM', value: '18%', bg: 'var(--pm-accent-soft)' },
    { label: '9AM-12PM', value: '32%', bg: 'linear-gradient(135deg,#2ee6a0,#14b981)', color: '#02120a' },
    { label: '12-3PM', value: '24%', bg: 'var(--pm-accent-soft)' },
    { label: '3-6PM', value: '19%', bg: 'var(--pm-info-soft)' },
    { label: '6-9PM', value: '7%', bg: 'var(--pm-warning-soft)' },
  ],
  weekdays: [
    { label: 'Weekdays', value: '78%', color: 'var(--pm-primary-light)' },
    { label: 'Weekends', value: '22%', color: 'var(--pm-accent)' },
  ],
  bestDay: { label: 'Best performing day', day: 'Tuesday', note: '+18% above average' },
  seasonal: [
    { label: 'End of Month', badge: '+34%', tone: 'badgeS' },
    { label: 'Salary Week', badge: '+27%', tone: 'badgeI' },
    { label: 'Tax Filing Season', badge: '+41%', tone: 'badgeP' },
  ],
  failureReasons: [
    { label: 'Insufficient Funds', badge: '50%', tone: 'badgeD', count: '(1,124)' },
    { label: 'Daily Limit Exceeded', badge: '18%', tone: 'badgeW', count: '(404)' },
    { label: '3D Secure Timeout', badge: '14%', tone: 'badgeI', count: '(315)' },
    { label: 'Invalid Account', badge: '11%', tone: 'badgeP', count: '(247)' },
    { label: 'Network/Timeout', badge: '7%', tone: 'badgeW', count: '(157)' },
  ],
  topFailing: [
    { name: 'KRA iTax', badge: '318 fails', tone: 'badgeD' },
    { name: 'Co-op Bank', badge: '142 fails', tone: 'badgeW' },
    { name: 'DTB Kenya', badge: '97 fails', tone: 'badgeI' },
    { name: 'Equity Bank', badge: '84 fails', tone: 'badgeP' },
  ],
  retryPerf: [
    { label: 'AUTO-RETRY SUCCESS', value: '67%', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', labelColor: '#6ee7b7' },
    { label: 'MANUAL RETRY SUCCESS', value: '41%', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)', labelColor: '#93c5fd' },
  ],
  categories: [
    { name: 'Government (KRA, NSSF, SHIF)', volume: 'KES 892M', txns: '9,421', success: '89.2%', successTone: 'badgeD', avg: 'KES 94,600' },
    { name: 'Bank Transfers', volume: 'KES 684M', txns: '12,884', success: '97.1%', successTone: 'badgeS', avg: 'KES 53,100' },
    { name: 'Utilities & Airtime', volume: 'KES 412M', txns: '18,201', success: '98.4%', successTone: 'badgeS', avg: 'KES 22,600' },
    { name: 'Business Payments', volume: 'KES 298M', txns: '1,992', success: '94.8%', successTone: 'badgeI', avg: 'KES 149,600' },
  ],
  concentration: {
    title: 'HIGH CONCENTRATION',
    value: 'Top 3 = 47%',
    sub: 'KRA + Equity + Safaricom',
    score: '42/100',
  },
  templates: [
    { title: 'Monthly Reconciliation', sub: 'All banks • Success + Failed' },
    { title: 'Merchant Performance', sub: 'Top 50 merchants by volume' },
    { title: 'Failure Root Cause', sub: 'Last 30 days with retry rates' },
    { title: 'Category Trends', sub: 'Government, Banks, Utilities' },
  ],
  recentReports: [
    { name: 'Q2 Bank-to-Bank Summary', created: '25 Jun 2025', filters: 'All banks • Success only', status: 'Delivered', tone: 'badgeS', action: 'Download', modal: 'exportModal' },
    { name: 'KRA Failure Analysis', created: '24 Jun 2025', filters: 'KRA • Last 90 days', status: 'Scheduled', tone: 'badgeI', action: 'Edit', modal: 'scheduledReportsModal' },
    { name: 'High-Value Transactions', created: '20 Jun 2025', filters: '> KES 500K • All banks', status: 'Delivered', tone: 'badgeS', action: 'Download', modal: 'exportModal' },
  ],
  scheduled: [
    { name: 'Daily Transaction Summary', freq: 'Daily 7:00 AM', next: '28 Jun 2025', recipients: 'Finance Team (8)', status: 'Active', tone: 'badgeS', paused: false, msg: 'Report paused successfully.' },
    { name: 'Weekly Failure Report', freq: 'Weekly Monday', next: '30 Jun 2025', recipients: 'Risk Team (3)', status: 'Active', tone: 'badgeS', paused: false, msg: 'Report paused successfully.' },
    { name: 'Monthly Merchant Ranking', freq: 'Monthly 1st', next: '01 Jul 2025', recipients: 'Exec Team (5)', status: 'Paused', tone: 'badgeW', paused: true, msg: 'Report resumed. Next delivery 01 Jul.' },
  ],
  recentExports: [
    { name: 'June_Transactions_Full.csv', meta: '27 Jun • 42.8 MB' },
    { name: 'Q2_Merchant_Ranking.pdf', meta: '25 Jun • 8.2 MB' },
    { name: 'Failure_Analysis_May.xlsx', meta: '20 Jun • 3.1 MB' },
  ],
  exportOptions: [
    { icon: 'bi-file-earmark-spreadsheet', label: 'CSV / Excel', color: 'var(--pm-accent)' },
    { icon: 'bi-file-earmark-pdf', label: 'PDF Report', color: 'var(--pm-danger)' },
    { icon: 'bi-file-earmark-zip', label: 'Compressed Archive', color: 'var(--pm-info)' },
  ],
}

/* ---------- TanStack Query fetcher ---------- */
async function fetchAnalytics(): Promise<AnalyticsConfig> {
  const res = await fetch('/api/analytics')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<AnalyticsConfig>
  return { ...initialMockData, ...json }
}

/* ---------- LEGACY BRIDGE: file download ---------- */
function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-analytics'],
    queryFn: fetchAnalytics,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  /* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
  const openM = (id: string) => setActiveModal(id)
  const closeM = () => setActiveModal(null)

  /* ---------- LEGACY BRIDGE: inline doAction notice (page-level Pause/Resume) ---------- */
  const [notice, setNotice] = useState<string | null>(null)
  const noticeTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])
  const notify = (msg: string) => {
    setNotice(msg)
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3500)
  }

  const downloadExport = (name: string) =>
    downloadFile(name.replace(/\.(pdf|xlsx)$/, '.csv'), 'date,bank,merchant,amount,status\n2025-06-27,Equity,KRA iTax,45000,Success\n2025-06-27,Co-op,Safaricom,12500,Success\n', 'text/csv')

  return (
    <div className={styles.analyticsPage}>
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load analytics data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {notice && (
        <div
          className="alert alert-dismissible"
          role="alert"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2200,
            width: 'min(560px, calc(100vw - 2rem))',
            background: 'rgba(4, 40, 24, 0.95)',
            border: '1px solid rgba(46, 230, 160, 0.4)',
            color: '#bdf5d8',
            borderRadius: 14,
            backdropFilter: 'blur(8px)',
          }}
        >
          <i className="bi bi-check-circle me-2" />
          {notice}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setNotice(null)} />
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading analytics workspace…
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
            <input type="text" placeholder={config.searchPlaceholder} aria-label="Search analytics" />
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn} onClick={() => openM('healthCheckModal')} title="Health check" aria-label="Health check">
              <i className="bi bi-heart-pulse" />
            </button>
            <button className={styles.headerBtn} onClick={() => openM('scheduledReportsModal')} title="Scheduled reports" aria-label="Scheduled reports">
              <i className="bi bi-calendar-event" />
              <span className={styles.counter}>4</span>
            </button>
            <button className={styles.headerBtn} onClick={() => openM('notifModal')} title="Notifications" aria-label="Notifications">
              <i className="bi bi-bell" />
              <span className={styles.counter}>9</span>
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
              <i className="bi bi-heart-pulse" /> Health Check
            </button>
            <button className={styles.btnPm} onClick={() => openM('scheduledReportsModal')}>
              <i className="bi bi-calendar-event" /> Scheduled
            </button>
            <button className={styles.btnPm} onClick={() => openM('reportBuilderModal')}>
              <i className="bi bi-plus-lg" /> New Report
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('exportModal')}>
              <i className="bi bi-download" /> Export
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* ======================= HERO ======================= */}
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
                  {config.hero.actions.map((a) => (
                    <button key={a.label} className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => openM(a.modal)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((card) => (
              <div className={`${card.key === 'success' ? 'col-lg-2' : 'col-lg-3'} col-md-4 col-6`} key={card.key}>
                <div className={`${styles.card} ${card.bordered ? styles.attentionCard : ''}`} style={{ minHeight: 170 }}>
                  <p className={styles.sl} style={{ color: card.labelColor }}>
                    {card.label}
                  </p>
                  <div className={styles.sv} style={{ margin: '6px 0' }}>
                    {card.value}
                  </div>
                  <span className={`${styles.badge} ${styles[card.badge.tone]}`}>
                    <i className={`bi ${card.badge.icon}`} /> {card.badge.text}
                  </span>
                  {card.progress && (
                    <div className={`${styles.pmProgress} mt-2`}>
                      <div className={styles.pmProgressBar} style={{ width: card.progress.width, background: card.progress.color }} />
                    </div>
                  )}
                  {card.note && (
                    <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                      {card.note.map((n) => (
                        <div key={n}>{n}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ======================= ATTENTION / SUGGESTIONS / QUICK ======================= */}
          <div className="row g-3">
            {[
              { title: 'Attention Required', rows: config.attention, tail: { label: 'View all', modal: 'attentionModal' } },
              { title: 'Smart Suggestions', rows: config.suggestions, ai: true },
            ].map((block) => (
              <div className="col-lg-4" key={block.title}>
                <div className={`${styles.card} h-100`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className={styles.st}>{block.title}</h3>
                    {block.tail ? (
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(block.tail!.modal)}>
                        {block.tail!.label}
                      </button>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeP}`}>
                        <i className="bi bi-stars" /> AI
                      </span>
                    )}
                  </div>
                  {block.rows.map((item) => (
                    <div className={styles.sr} key={item.title}>
                      <div className="d-flex align-items-center gap-3">
                        <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14 }}>
                          <i className={`bi ${item.icon}`} />
                        </div>
                        <div>
                          <div className={styles.fwBold13}>{item.title}</div>
                          <div className={styles.mutedSmall}>{item.sub}</div>
                        </div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(item.modal)}>
                        {item.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent analytics workflows</p>
                </div>
                <div className={styles.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button className={styles.quickBtn} key={qa.label} onClick={() => openM(qa.modal)}>
                      <i className={`bi ${qa.icon} me-1`} style={{ color: qa.color }} /> {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.1 OVERVIEW ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-speedometer2" style={{ color: 'var(--pm-primary-light)' }} /> 1.8.1 — Analytics
                  Overview Dashboard
                </h3>
                <p className={styles.ss}>Real-time KPIs, volume trends, success rates and top merchants at a glance.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('healthCheckModal')}>
                  <i className="bi bi-heart-pulse" /> Health
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM('reportBuilderModal')}>
                  <i className="bi bi-plus-lg" /> Custom Report
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>30-Day Transaction Volume Trend</h4>
                  <div className={styles.chartBars}>
                    {config.trendBars.map((b) => (
                      <div
                        key={b.label}
                        className={styles.chartBar}
                        style={{ height: b.height, background: b.color }}
                        onClick={() => openM('trendModal')}
                        role="button"
                        tabIndex={0}
                      >
                        <span className={styles.barLabel}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between mt-4 flex-wrap" style={{ fontSize: 12, gap: 8 }}>
                    {config.trendSummary.map((t) => (
                      <div key={t.label}>
                        <strong>{t.value}</strong> {t.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Top 5 Merchants</h4>
                  {config.topMerchants.map((m) => (
                    <div className={styles.sr} key={m.name}>
                      <div>
                        <strong>{m.name}</strong>
                        <div className={styles.mutedSmall}>{m.sub}</div>
                      </div>
                      <span className={`${styles.badge} ${styles[m.tone]}`}>{m.share}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('merchantDrillModal')}>
                    View All Merchants
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.2 TRENDS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-graph-up" style={{ color: 'var(--pm-info)' }} /> 1.8.2 — Transaction Trends &
                  Patterns
                </h3>
                <p className={styles.ss}>Time-series analysis, peak hours, weekend vs weekday, seasonal patterns.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('trendModal')}>
                  Drill-down
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Hourly Volume Heatmap (Last 7 Days)</h4>
                  <div className="d-flex flex-wrap" style={{ gap: 4 }}>
                    {config.heatmap.map((h) => (
                      <div key={h.label} className={styles.heatCell} style={{ background: h.bg, color: h.color }}>
                        {h.label}
                        <br />
                        <strong>{h.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Weekday vs Weekend</h4>
                  {config.weekdays.map((w) => (
                    <div className={styles.sr} key={w.label}>
                      <div>
                        <strong>{w.label}</strong>
                      </div>
                      <strong style={{ color: w.color }}>{w.value}</strong>
                    </div>
                  ))}
                  <div className={`${styles.summaryBox} mt-2`}>
                    <div className={styles.mutedSmall}>{config.bestDay.label}</div>
                    <div style={{ fontWeight: 700 }}>{config.bestDay.day}</div>
                    <div style={{ fontSize: 12, color: 'var(--pm-accent)' }}>{config.bestDay.note}</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Seasonal Trends</h4>
                  {config.seasonal.map((s) => (
                    <div className={styles.sr} key={s.label}>
                      <div>
                        <strong>{s.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[s.tone]}`}>{s.badge}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('trendModal')}>
                    Full Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.3 FAILURE ANALYSIS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-x-circle" style={{ color: 'var(--pm-danger)' }} /> 1.8.3 — Failed & Declined
                  Transaction Analysis
                </h3>
                <p className={styles.ss}>Root cause breakdown, retry success rates, merchant-level failure patterns.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('failureDrillModal')}>
                  Deep Dive
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Failure Reason Distribution</h4>
                  {config.failureReasons.map((f) => (
                    <div className={styles.sr} key={f.label}>
                      <div>
                        <strong>{f.label}</strong>
                      </div>
                      <div>
                        <span className={`${styles.badge} ${styles[f.tone]}`}>{f.badge}</span>{' '}
                        <small className={styles.mutedSmall}>{f.count}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Top Failing Merchants</h4>
                  {config.topFailing.map((m) => (
                    <div className={styles.sr} key={m.name}>
                      <div>
                        <strong>{m.name}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[m.tone]}`}>{m.badge}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('merchantDrillModal')}>
                    Merchant Failure Report
                  </button>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Retry Performance</h4>
                  {config.retryPerf.map((r) => (
                    <div className={`${styles.miniStat} mb-2`} style={{ background: r.bg, textAlign: 'left' }} key={r.label}>
                      <div style={{ fontSize: 11, color: r.labelColor, fontWeight: 700 }}>{r.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: r.color }}>{r.value}</div>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-1`} onClick={() => openM('autoRetryModal')}>
                    Configure Auto-Retry
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.4 MERCHANT & CATEGORY ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-shop" style={{ color: 'var(--pm-warning)' }} /> 1.8.4 — Merchant & Category
                  Insights
                </h3>
                <p className={styles.ss}>Concentration risk, category performance, loyalty and cross-sell opportunities.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('merchantDrillModal')}>
                  Merchant Drill
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('categoryModal')}>
                  Category Analysis
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Category Performance (Last 30 Days)</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Volume</th>
                          <th>Txns</th>
                          <th>Success</th>
                          <th>Avg Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.categories.map((c) => (
                          <tr key={c.name}>
                            <td>{c.name}</td>
                            <td>{c.volume}</td>
                            <td>{c.txns}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[c.successTone]}`}>{c.success}</span>
                            </td>
                            <td>{c.avg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Merchant Concentration Risk</h4>
                  <div className={`${styles.summaryBoxDanger} mb-2`}>
                    <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 700 }}>{config.concentration.title}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-danger)' }}>{config.concentration.value}</div>
                    <div style={{ fontSize: 12, color: '#fecaca' }}>{config.concentration.sub}</div>
                  </div>
                  <div className={styles.sr}>
                    <div>
                      <strong>Diversification Score</strong>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeW}`}>{config.concentration.score}</span>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('merchantDrillModal')}>
                    Risk Mitigation Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.5 CUSTOM REPORT BUILDER ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-file-earmark-plus" style={{ color: 'var(--pm-purple)' }} /> 1.8.5 — Custom Report
                  Builder
                </h3>
                <p className={styles.ss}>Drag-and-drop report creation with filters, groupings, scheduling and delivery.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM('reportBuilderModal')}>
                  Launch Builder
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Quick Templates</h4>
                  {config.templates.map((t) => (
                    <div
                      className={styles.sr}
                      key={t.title}
                      style={{ cursor: 'pointer' }}
                      onClick={() => openM('reportBuilderModal')}
                      role="button"
                      tabIndex={0}
                    >
                      <div>
                        <strong>{t.title}</strong>
                        <div className={styles.mutedSmall}>{t.sub}</div>
                      </div>
                      <i className="bi bi-chevron-right" style={{ color: 'var(--pm-muted)' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Custom Reports</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Report Name</th>
                          <th>Created</th>
                          <th>Filters</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.recentReports.map((r) => (
                          <tr key={r.name}>
                            <td>{r.name}</td>
                            <td>{r.created}</td>
                            <td>{r.filters}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                            </td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(r.modal)}>
                                {r.action}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.6 SCHEDULED REPORTS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-calendar-check" style={{ color: 'var(--pm-accent)' }} /> 1.8.6 — Scheduled &
                  Automated Reports
                </h3>
                <p className={styles.ss}>Manage recurring reports, delivery schedules, recipients and pause/resume controls.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('scheduledReportsModal')}>
                  Manage All
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <div className={styles.ub}>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Report</th>
                          <th>Frequency</th>
                          <th>Next Run</th>
                          <th>Recipients</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.scheduled.map((r) => (
                          <tr key={r.name}>
                            <td>{r.name}</td>
                            <td>{r.freq}</td>
                            <td>{r.next}</td>
                            <td>{r.recipients}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('scheduledReportsModal')}>
                                  Edit
                                </button>
                                <button
                                  className={`${styles.btnPm} ${styles.btnSm} ${r.paused ? styles.btnPmA : ''}`}
                                  onClick={() => notify(r.msg)}
                                >
                                  {r.paused ? 'Resume' : 'Pause'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.8.7 EXPORT CENTER ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-download" style={{ color: 'var(--pm-primary-light)' }} /> 1.8.7 — Export &
                  Delivery Center
                </h3>
                <p className={styles.ss}>One-time and bulk exports, format options, compression and delivery methods.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM('exportModal')}>
                  New Export
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Exports</h4>
                  {config.recentExports.map((e) => (
                    <div className={styles.sr} key={e.name}>
                      <div>
                        <strong>{e.name}</strong>
                        <div className={styles.mutedSmall}>{e.meta}</div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => downloadExport(e.name)} aria-label={`Download ${e.name}`}>
                        <i className="bi bi-download" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Export Options</h4>
                  <div className="row g-3">
                    {config.exportOptions.map((o) => (
                      <div className="col-md-4" key={o.label}>
                        <div
                          className="p-3 rounded text-center"
                          style={{ cursor: 'pointer', border: '1px solid var(--pm-border)' }}
                          onClick={() => openM('exportModal')}
                          role="button"
                          tabIndex={0}
                        >
                          <i className={`bi ${o.icon} d-block mb-1`} style={{ fontSize: 22, color: o.color }} />
                          <strong style={{ fontSize: 12 }}>{o.label}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= ALL MODALS ======================= */}
      <AnalyticsModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
