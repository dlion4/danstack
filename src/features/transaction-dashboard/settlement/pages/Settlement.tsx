import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/settlement.module.css'
import SettlementModals from '../components/SettlementModals'

/* ============================================================================
   PayMo BaaS — Settlement & Clearing (legacy page 1.7)
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

interface StatCard {
  key: string
  label: string
  labelColor: string
  value: string
  badge: { icon: string; text: string; tone: BadgeTone }
  kind: 'bars' | 'progress' | 'list' | 'bordered'
  bars?: { height: string; color: string }[]
  progress?: { label: string; value: string; width: string; color: string }[]
  list?: { label: string; value: string }[]
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

interface SettlementConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string; headerInitials: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: { live: string; value: string; detail: string }
  statCards: StatCard[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  channels: { cols: TableCol[]; rows: string[][] }
  exceptionQueue: { title: string; sub: string; actionLabel: string; modal: string }[]
  engineHealth: { label: string; value: string }[]
  clearing: {
    title: string
    windowLabel: string
    windowStatus: { text: string; tone: BadgeTone }
    cleared: string
    net: string
    actionLabel: string
    actionTone?: 'btnPmD'
    modal: string
  }[]
  reconRows: { cols: TableCol[]; rows: (string | { badge: string; tone: BadgeTone } | { action: string; modal: string })[][] }
  openDisputes: { ref: string; sub: string; modal: string }[]
  trendBars: { height: string; color: string; label: string }[]
  keyMetrics: { label: string; value: string }[]
  autoRules: { title: string; sub: string; status: string; tone: BadgeTone }[]
  nostroPositions: { label: string; value: string }[]
  regReports: { label: string; status: string; tone: BadgeTone }[]
  activity: { cols: TableCol[]; rows: (string | { badge: string; tone: BadgeTone } | { action: string; modal: string })[][] }
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: SettlementConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-wallet2', to: '/wallets', label: 'Wallets' },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-bank', to: '/banking', label: 'Banking' },
    { icon: 'bi-arrow-left-right', to: '/settlement', label: 'Settlement & Clearing', active: true, dot: true },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Settlement & Clearing',
  headerSub: 'Real-time settlements, clearing house integration, reconciliation, and compliance',
  searchPlaceholder: 'Search settlements, batches, disputes, reports...',
  user: { initials: 'JK', name: 'James K.', role: 'Treasury Manager', headerInitials: 'MN' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'BaaS Transactions', to: '/select-dashboard' },
    ],
    current: 'Settlement & Clearing',
  },
  pageCode: 'PAGE 1.7',
  pageTitle: 'Settlement & Clearing',
  pageSub:
    'Manage real-time and batch settlements, PesaLink/RTGS clearing, reconciliation, disputes, and regulatory reporting across all bank-to-bank flows.',
  hero: {
    live: 'Settlement engine live',
    value: 'KES 2.84B settled today',
    detail: '1,284 transactions • 99.7% success rate • 14 batches processed • 3 disputes under review.',
  },
  statCards: [
    {
      key: 'settled',
      label: 'SETTLED TODAY',
      labelColor: 'var(--pm-accent)',
      value: 'KES 2.84B',
      badge: { icon: 'bi-check2-circle', text: '1,284 txns', tone: 'badgeS' },
      kind: 'bars',
      bars: [
        { height: '85%', color: 'var(--pm-primary)' },
        { height: '60%', color: 'var(--pm-info)' },
        { height: '92%', color: 'var(--pm-primary)' },
        { height: '45%', color: 'var(--pm-info)' },
        { height: '78%', color: 'var(--pm-primary)' },
      ],
    },
    {
      key: 'pending',
      label: 'PENDING CLEARING',
      labelColor: 'var(--pm-info)',
      value: 'KES 184.6M',
      badge: { icon: 'bi-clock', text: '47 batches', tone: 'badgeW' },
      kind: 'progress',
      progress: [
        { label: 'RTGS', value: 'KES 92M', width: '62%', color: 'var(--pm-info)' },
        { label: 'PesaLink', value: 'KES 92.6M', width: '38%', color: 'var(--pm-accent)' },
      ],
    },
    {
      key: 'disputes',
      label: 'DISPUTES & EXCEPTIONS',
      labelColor: 'var(--pm-warning)',
      value: '3 open',
      badge: { icon: 'bi-exclamation-triangle', text: 'KES 4.2M at risk', tone: 'badgeD' },
      kind: 'list',
      list: [
        { label: 'High value:', value: '1' },
        { label: 'Medium:', value: '2' },
        { label: 'Auto-resolved today:', value: '9' },
      ],
    },
  ],
  attention: [
    {
      icon: 'bi-exclamation-triangle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'High-value settlement failed',
      sub: 'Equity → KCB • KES 18.4M • Retry pending',
      actionLabel: 'Retry',
      actionTone: 'btnPmD',
      modal: 'retrySettlementModal',
    },
    {
      icon: 'bi-clock',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'RTGS cut-off in 47 minutes',
      sub: '14 batches queued • KES 92M',
      actionLabel: 'Prioritize',
      modal: 'batchInboxModal',
    },
    {
      icon: 'bi-shield-exclamation',
      iconBg: 'var(--pm-purple-soft)',
      iconColor: 'var(--pm-purple)',
      title: 'Dispute #SET-44892 awaiting evidence',
      sub: 'Co-op Bank • KES 2.1M',
      actionLabel: 'Respond',
      modal: 'disputeModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-lightning-charge',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Enable auto-retry on 3 failed batches',
      sub: 'Recover KES 12.4M automatically',
      actionLabel: 'Enable',
      modal: 'autoRulesModal',
    },
    {
      icon: 'bi-graph-up',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Shift 4 batches to PesaLink',
      sub: 'Save KES 18,400 in RTGS fees',
      actionLabel: 'Shift',
      modal: 'batchInboxModal',
    },
    {
      icon: 'bi-calendar-event',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Schedule weekend settlement run',
      sub: 'Reduce Monday morning backlog',
      actionLabel: 'Schedule',
      modal: 'settlementCalendarModal',
    },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', label: 'New Settlement', color: 'var(--pm-primary-light)', modal: 'initiateSettlementModal' },
    { icon: 'bi-list-check', label: 'Reconcile', color: 'var(--pm-accent)', modal: 'reconciliationWizardModal' },
    { icon: 'bi-upload', label: 'Bulk Upload', color: 'var(--pm-info)', modal: 'batchUploadModal' },
    { icon: 'bi-exclamation-triangle', label: 'Raise Dispute', color: 'var(--pm-warning)', modal: 'disputeModal' },
    { icon: 'bi-download', label: 'Reports', color: 'var(--pm-muted)', modal: 'generateReportModal' },
    { icon: 'bi-gear', label: 'Auto Rules', color: 'var(--pm-purple)', modal: 'autoRulesModal' },
    { icon: 'bi-bank2', label: 'Nostro', color: 'var(--pm-primary-light)', modal: 'nostroModal' },
    { icon: 'bi-file-earmark-text', label: 'Compliance', color: 'var(--pm-accent)', modal: 'complianceReportModal' },
  ],
  channels: {
    cols: [
      { key: 'channel', label: 'Channel' },
      { key: 'volume', label: 'Volume Today' },
      { key: 'success', label: 'Success' },
      { key: 'pending', label: 'Pending' },
      { key: 'avg', label: 'Avg Time' },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      ['RTGS (KES)', 'KES 1.42B', 'B:s:99.4%', 'KES 92M', '42m', 'B:s:Healthy'],
      ['PesaLink', 'KES 984M', 'B:s:99.9%', 'KES 41M', '8s', 'B:s:Healthy'],
      ['EFT / ACH', 'KES 312M', 'B:w:98.1%', 'KES 51M', '3.2h', 'B:w:Delayed'],
      ['SWIFT (Cross-border)', 'USD 4.8M', 'B:s:100%', 'USD 0.2M', '4.1h', 'B:s:Healthy'],
    ],
  },
  exceptionQueue: [
    { title: 'Failed settlements', sub: '14 items • KES 18.4M', actionLabel: 'Retry All', modal: 'retrySettlementModal' },
    { title: 'Partial settlements', sub: '8 items • KES 6.2M', actionLabel: 'Resolve', modal: 'partialSettlementModal' },
    { title: 'Compliance holds', sub: '3 items • KES 42M', actionLabel: 'Review', modal: 'complianceReportModal' },
    { title: 'Duplicate detections', sub: '2 items • KES 1.8M', actionLabel: 'Investigate', modal: 'disputeModal' },
  ],
  engineHealth: [
    { label: 'Throughput', value: '184 tx/min' },
    { label: 'Queue Depth', value: '47 pending' },
    { label: 'Auto-retry Success', value: '94.2%' },
    { label: 'Manual Intervention', value: '3 cases' },
  ],
  clearing: [
    {
      title: 'PesaLink Clearing',
      windowLabel: 'Closes in 2h 14m',
      windowStatus: { text: 'Open', tone: 'badgeS' },
      cleared: '892 / 920',
      net: '+KES 184M',
      actionLabel: 'Manage PesaLink',
      modal: 'pesaLinkModal',
    },
    {
      title: 'RTGS Clearing',
      windowLabel: 'Closes in 47m',
      windowStatus: { text: 'Closing Soon', tone: 'badgeW' },
      cleared: '214 / 261',
      net: '-KES 92M',
      actionLabel: 'Urgent Submit',
      actionTone: 'btnPmD',
      modal: 'rtgsUrgentModal',
    },
  ],
  reconRows: {
    cols: [
      { key: 'batch', label: 'Batch' },
      { key: 'expected', label: 'Expected' },
      { key: 'actual', label: 'Actual' },
      { key: 'variance', label: 'Variance' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['C:BAT-21092', 'KES 184.2M', 'KES 184.2M', { badge: '0', tone: 'badgeS' }, { badge: 'Matched', tone: 'badgeS' }, { action: 'View', modal: 'reconciliationDetailModal' }],
      ['C:BAT-21093', 'KES 67.8M', 'KES 65.1M', { badge: '-KES 2.7M', tone: 'badgeD' }, { badge: 'Exception', tone: 'badgeW' }, { action: 'Investigate', modal: 'disputeModal' }],
    ],
  },
  openDisputes: [
    { ref: '#SET-44892', sub: 'Co-op vs KCB • KES 2.1M', modal: 'disputeModal' },
    { ref: '#SET-44889', sub: 'Equity vs Absa • KES 1.8M', modal: 'disputeModal' },
  ],
  trendBars: [
    { height: '65%', color: 'var(--pm-primary)', label: 'Mon' },
    { height: '78%', color: 'var(--pm-primary)', label: 'Tue' },
    { height: '92%', color: 'var(--pm-accent)', label: 'Wed' },
    { height: '85%', color: 'var(--pm-primary)', label: 'Thu' },
    { height: '70%', color: 'var(--pm-info)', label: 'Fri' },
    { height: '55%', color: 'var(--pm-warning)', label: 'Sat' },
    { height: '48%', color: 'var(--pm-info)', label: 'Sun' },
  ],
  keyMetrics: [
    { label: 'Total Settled (MTD)', value: 'KES 41.2B' },
    { label: 'Average Fee per txn', value: 'KES 42' },
    { label: 'Failed Rate', value: '0.31%' },
    { label: 'Regulatory Reports Filed', value: '28 / 31' },
  ],
  autoRules: [
    { title: 'Auto-retry failed RTGS', sub: 'Max 3 attempts • 15 min interval', status: 'Active', tone: 'badgeS' },
    { title: 'Auto-escalate disputes > KES 5M', sub: 'Route to Treasury Manager', status: 'Active', tone: 'badgeS' },
    { title: 'Weekend batch deferral', sub: 'Hold non-urgent batches until Monday 8 AM', status: 'Paused', tone: 'badgeW' },
  ],
  nostroPositions: [
    { label: 'USD Nostro (Citibank NY)', value: 'USD 8.4M' },
    { label: 'EUR Nostro (Deutsche Bank)', value: 'EUR 3.2M' },
    { label: 'GBP Nostro (HSBC London)', value: 'GBP 1.1M' },
  ],
  regReports: [
    { label: 'CBK Daily Settlement Return', status: 'Submitted', tone: 'badgeS' },
    { label: 'KRA Withholding Tax', status: 'Due in 2 days', tone: 'badgeW' },
    { label: 'AML Large Transaction Report', status: 'Submitted', tone: 'badgeS' },
  ],
  activity: {
    cols: [
      { key: 'time', label: 'Time' },
      { key: 'ref', label: 'Ref' },
      { key: 'route', label: 'From → To' },
      { key: 'amount', label: 'Amount' },
      { key: 'channel', label: 'Channel' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['14:32', 'C:SET-88422', 'Co-op → Stanbic', 'STR:KES 12.8M', 'PesaLink', { badge: 'Settled', tone: 'badgeS' }, { action: 'Receipt', modal: 'settlementDetailModal' }],
      ['14:28', 'C:SET-88421', 'Equity → KCB', 'STR:KES 45.0M', 'RTGS', { badge: 'In Progress', tone: 'badgeI' }, { action: 'Track', modal: 'settlementDetailModal' }],
      ['14:15', 'C:BAT-21093', 'Multiple', 'STR:KES 67.8M', 'RTGS', { badge: 'Exception', tone: 'badgeW' }, { action: 'Investigate', modal: 'disputeModal' }],
    ],
  },
}

const ACTIVE_SETTLEMENTS = {
  cols: ['Ref', 'From → To', 'Amount', 'Channel', 'Status', 'ETA', 'Action'],
  rows: [
    ['C:SET-88421', 'Equity → KCB', 'STR:KES 45.0M', 'RTGS', { badge: 'In Progress', tone: 'badgeI' as BadgeTone }, '14m', { action: 'Track', modal: 'settlementDetailModal' }],
    ['C:SET-88422', 'Co-op → Stanbic', 'STR:KES 12.8M', 'PesaLink', { badge: 'Settled', tone: 'badgeS' as BadgeTone }, '—', { action: 'Receipt', modal: 'settlementDetailModal' }],
    ['C:SET-88423', 'Absa → NCBA', 'STR:KES 8.4M', 'RTGS', { badge: 'Retry #2', tone: 'badgeW' as BadgeTone }, '32m', { action: 'Force', modal: 'retrySettlementModal', tone: 'btnPmD' }],
  ],
}

type Cell = string | { badge: string; tone: BadgeTone } | { action: string; modal: string; tone?: string }

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchSettlement(): Promise<SettlementConfig> {
  const res = await fetch('/api/settlement')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<SettlementConfig>
  return { ...initialMockData, ...json }
}

/* ---------- cell renderer for data tables ---------- */
function CellValue({ cell, onOpen }: { cell: Cell; onOpen: (id: string) => void }) {
  if (typeof cell === 'string') {
    if (cell.startsWith('C:')) return <code>{cell.slice(2)}</code>
    if (cell.startsWith('B:')) {
      const [, tone, text] = cell.split(':')
      const toneClass = tone === 's' ? styles.badgeS : tone === 'w' ? styles.badgeW : tone === 'd' ? styles.badgeD : tone === 'i' ? styles.badgeI : styles.badgeP
      return <span className={`${styles.badge} ${toneClass}`}>{text}</span>
    }
    if (cell.startsWith('STR:')) return <strong>{cell.slice(4)}</strong>
    return <>{cell}</>
  }
  if ('badge' in cell) return <span className={`${styles.badge} ${styles[cell.tone]}`}>{cell.badge}</span>
  return (
    <button
      className={`${styles.btnPm} ${styles.btnSm} ${cell.tone ? styles[cell.tone as 'btnPmD'] : ''}`}
      onClick={() => onOpen(cell.modal)}
    >
      {cell.action}
    </button>
  )
}

export default function Settlement() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-settlement'],
    queryFn: fetchSettlement,
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
    <div className={styles.settlementPage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load settlement data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading settlement workspace…
          </div>
        </div>
      )}

      <div className={styles.main}>


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
            <button className={styles.btnPm} onClick={() => openM('batchInboxModal')}>
              <i className="bi bi-inbox" /> Batches
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('initiateSettlementModal')}>
              <i className="bi bi-plus-lg" /> New Settlement
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
                  <button
                    className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
                    onClick={() => openM('initiateSettlementModal')}
                  >
                    New Settlement
                  </button>
                  <button
                    className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
                    onClick={() => openM('reconciliationWizardModal')}
                  >
                    Reconcile
                  </button>
                </div>
              </div>
            </div>
            {config.statCards.map((card) => (
              <div className={`${card.key === 'settled' ? 'col-lg-2' : 'col-lg-3'} col-md-4 col-6`} key={card.key}>
                <div
                  className={`${styles.card} ${card.kind === 'list' ? styles.attentionCard : ''}`}
                  style={{ minHeight: 170 }}
                >
                  <p className={styles.sl} style={{ color: card.labelColor }}>
                    {card.label}
                  </p>
                  <div className={styles.sv} style={{ margin: '6px 0', fontSize: card.key === 'disputes' ? 24 : undefined }}>
                    {card.value}
                  </div>
                  <span className={`${styles.badge} ${styles[card.badge.tone]}`}>
                    <i className={`bi ${card.badge.icon}`} /> {card.badge.text}
                  </span>
                  {card.kind === 'bars' && card.bars && (
                    <div className={`${styles.miniBars} mt-3`}>
                      {card.bars.map((b, i) => (
                        <div key={i} className={styles.miniBar} style={{ height: b.height, background: b.color }} />
                      ))}
                    </div>
                  )}
                  {card.kind === 'progress' && card.progress && (
                    <div className="mt-2">
                      {card.progress.map((p, i) => (
                        <div key={p.label}>
                          <div className={`d-flex justify-content-between ${i > 0 ? 'mt-1' : ''}`} style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                            <span>{p.label}</span>
                            <span>{p.value}</span>
                          </div>
                          <div className={`${styles.pmProgress} mt-1`}>
                            <div className={styles.pmProgressBar} style={{ width: p.width, background: p.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {card.kind === 'list' && card.list && (
                    <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                      {card.list.map((li) => (
                        <div key={li.label}>
                          {li.label} <strong>{li.value}</strong>
                        </div>
                      ))}
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
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(item.modal)}>
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
                  <p className={styles.ss}>Frequent settlement workflows</p>
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

          {/* ======================= 1.7.1 OVERVIEW ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-speedometer2" style={{ color: 'var(--pm-primary-light)' }} /> 1.7.1 — Settlement
                  Overview Dashboard
                </h3>
                <p className={styles.ss}>
                  Real-time view of all settlement channels, success rates, pending volumes, and exception queues.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('settlementCalendarModal')}>
                  <i className="bi bi-calendar" /> Calendar
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM('initiateSettlementModal')}>
                  Initiate
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Settlement Channels Performance</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.channels.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.channels.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                {j === 0 ? (
                                  <strong>{cell}</strong>
                                ) : (
                                  <CellValue cell={cell} onOpen={openM} />
                                )}
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
                  <h4 className={styles.ubTitle}>Exception Queue</h4>
                  {config.exceptionQueue.map((ex) => (
                    <div className={styles.sr} key={ex.title}>
                      <div>
                        <strong>{ex.title}</strong>
                        <div className={styles.mutedSmall}>{ex.sub}</div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(ex.modal)}>
                        {ex.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.7.2 REAL-TIME ENGINE ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-lightning-charge" style={{ color: 'var(--pm-accent)' }} /> 1.7.2 — Real-time
                  Settlement Engine
                </h3>
                <p className={styles.ss}>
                  Instant settlement initiation, status tracking, and automated retry logic for high-value and
                  time-critical transactions.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('initiateSettlementModal')}>
                  <i className="bi bi-plus-lg" /> Instant Settlement
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Real-time Settlements</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {ACTIVE_SETTLEMENTS.cols.map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ACTIVE_SETTLEMENTS.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                <CellValue cell={cell as Cell} onOpen={openM} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Engine Health</h4>
                  {config.engineHealth.map((h) => (
                    <div className={styles.sr} key={h.label}>
                      <div>
                        <strong>{h.label}</strong>
                      </div>
                      <strong>{h.value}</strong>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`} onClick={() => openM('engineConfigModal')}>
                    Configure Engine
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.7.3 CLEARING HOUSE ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-building" style={{ color: 'var(--pm-info)' }} /> 1.7.3 — Clearing House
                  Integration
                </h3>
                <p className={styles.ss}>
                  PesaLink, RTGS, ACH, and SWIFT clearing status, cut-off timers, and direct integration controls.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('clearingStatusModal')}>
                  Live Status
                </button>
              </div>
            </div>
            <div className="row g-3">
              {config.clearing.map((ch) => (
                <div className="col-lg-6" key={ch.title}>
                  <div className={styles.ub}>
                    <h4 className={styles.ubTitle}>{ch.title}</h4>
                    <div className={styles.sr}>
                      <div>
                        <strong>Current Window</strong>
                        <div className={styles.mutedSmall}>{ch.windowLabel}</div>
                      </div>
                      <span className={`${styles.badge} ${styles[ch.windowStatus.tone]}`}>{ch.windowStatus.text}</span>
                    </div>
                    <div className={styles.sr}>
                      <div>
                        <strong>Transactions Cleared</strong>
                      </div>
                      <strong>{ch.cleared}</strong>
                    </div>
                    <div className={styles.sr}>
                      <div>
                        <strong>Net Position</strong>
                      </div>
                      <strong>{ch.net}</strong>
                    </div>
                    <button
                      className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2 ${ch.actionTone ? styles[ch.actionTone] : ''}`}
                      onClick={() => openM(ch.modal)}
                    >
                      {ch.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======================= 1.7.4 RECON & DISPUTES ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-list-check" style={{ color: 'var(--pm-purple)' }} /> 1.7.4 — Reconciliation &
                  Dispute Resolution
                </h3>
                <p className={styles.ss}>
                  Automated and manual reconciliation, exception handling, and full dispute lifecycle management.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('reconciliationWizardModal')}>
                  Start Reconciliation
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('disputeModal')}>
                  New Dispute
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Reconciliation Summary</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.reconRows.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.reconRows.rows.map((row, i) => (
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
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Open Disputes</h4>
                  {config.openDisputes.map((d) => (
                    <div className={styles.sr} key={d.ref}>
                      <div>
                        <strong>{d.ref}</strong>
                        <div className={styles.mutedSmall}>{d.sub}</div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(d.modal)}>
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.7.5 REPORTS & ANALYTICS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-bar-chart-line" style={{ color: 'var(--pm-info)' }} /> 1.7.5 — Settlement Reports
                  & Analytics
                </h3>
                <p className={styles.ss}>
                  Daily, weekly, and monthly settlement performance, fee analysis, and regulatory reports.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('generateReportModal')}>
                  Generate Report
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>7-Day Settlement Trend</h4>
                  <div className={styles.chartBars}>
                    {config.trendBars.map((b) => (
                      <div key={b.label} className={styles.chartBar} style={{ height: b.height, background: b.color }}>
                        <span className={styles.barLabel}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Key Metrics</h4>
                  {config.keyMetrics.map((m) => (
                    <div className={styles.sr} key={m.label}>
                      <div>
                        <strong>{m.label}</strong>
                      </div>
                      <strong>{m.value}</strong>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('complianceReportModal')}>
                    View Compliance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.7.6 AUTO RULES ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-gear-fill" style={{ color: 'var(--pm-warning)' }} /> 1.7.6 — Automated Settlement
                  Rules
                </h3>
                <p className={styles.ss}>
                  Configure intelligent auto-settlement, retry logic, cut-off handling, and exception routing.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('autoRulesModal')}>
                  Manage Rules
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Automation Rules</h4>
                  {config.autoRules.map((r) => (
                    <div className={styles.sr} key={r.title}>
                      <div>
                        <strong>{r.title}</strong>
                        <div className={styles.mutedSmall}>{r.sub}</div>
                      </div>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.7.7 NOSTRO & COMPLIANCE ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-globe" style={{ color: 'var(--pm-purple)' }} /> 1.7.7 — Nostro/Vostro &
                  Regulatory Compliance
                </h3>
                <p className={styles.ss}>
                  Cross-border account management, FX settlement, and automated regulatory reporting.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('nostroModal')}>
                  Nostro Accounts
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('complianceReportModal')}>
                  Compliance
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Nostro Positions</h4>
                  {config.nostroPositions.map((p) => (
                    <div className={styles.sr} key={p.label}>
                      <div>
                        <strong>{p.label}</strong>
                      </div>
                      <strong>{p.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Regulatory Reports</h4>
                  {config.regReports.map((r) => (
                    <div className={styles.sr} key={r.label}>
                      <div>
                        <strong>{r.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= RECENT ACTIVITY ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={styles.st}>
                <i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Settlement Activity
              </h3>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('activityLogModal')}>
                Full Log
              </button>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.activity.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.activity.rows.map((row, i) => (
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
        {/* content */}
      </div>
      {/* main */}

      {/* ======================= ALL 25 MODALS ======================= */}
      <SettlementModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
