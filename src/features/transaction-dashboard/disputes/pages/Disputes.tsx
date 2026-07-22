import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/disputes.module.css'
import DisputesModals from '../components/DisputesModals'

/* ============================================================================
   PayMo BaaS — Dispute & Chargeback Management (legacy page 1.16)
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
  actionTone?: 'btnPmD'
  modal: string
}

interface QuickAction {
  icon: string
  label: string
  color: string
  modal: string
}

interface TxnRow {
  merchant: string
  sub: string
}

interface MiniBox {
  box: 'summaryBoxDanger' | 'summaryBoxWarn' | 'summaryBoxAccent' | 'summaryBoxInfo' | 'summaryBox'
  label: string
  labelColor: string
  value: string
  valueColor: string
  valueSize: number
}

interface DisputesConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string; headerInitials: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  notifCounter: number
  hero: { live: string; value: string; detail: string; actions: { label: string; modal: string }[] }
  statCards: {
    key: string
    colClass: string
    label: string
    labelColor: string
    value: string
    valueSuffix?: string
    badge: { icon: string; text: string; tone: BadgeTone }
    lines: string[]
    accent?: boolean
  }[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  eligibleTxns: TxnRow[]
  reasonQuickSelect: QuickAction[]
  filingStats: MiniBox[]
  evidenceReqs: {
    caseId: string
    network: string
    deadline: string
    dangerDeadline?: boolean
    needed: string
    status: string
    tone: BadgeTone
    actionLabel: string
    modal: string
  }[]
  evidenceLibrary: { name: string; count: string }[]
  chargebacks: {
    cb: string
    caseId: string
    network: string
    stage: string
    tone: BadgeTone
    amount: string
    due: string
    actionLabel: string
    modal: string
  }[]
  stageSummary: { label: string; value: string; tone: BadgeTone }[]
  winRates: { label: string; pct: string; tone: BadgeTone }[]
  topMerchants: { name: string; sub: string; badge: string; tone: BadgeTone }[]
  recovery: MiniBox[]
  activity: {
    date: string
    caseId: string
    type: string
    merchant: string
    amount: string
    status: string
    tone: BadgeTone
    actionLabel: string
    modal: string
  }[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: DisputesConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-wallet2', to: '/wallets', label: 'Wallets' },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-exclamation-triangle', to: '/disputes', label: 'Dispute & Chargeback', active: true, dot: true },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics' },
  ],
  headerTitle: 'Dispute & Chargeback Management',
  headerSub: 'End-to-end dispute lifecycle, evidence management, chargeback tracking and resolution analytics',
  searchPlaceholder: 'Search disputes, chargebacks, cases, merchants...',
  user: { initials: 'JK', name: 'James K.', role: 'Dispute Manager', headerInitials: 'MN' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'BaaS Transactions', to: '/transactions' },
    ],
    current: 'Dispute & Chargeback',
  },
  pageCode: 'PAGE 1.16',
  pageTitle: 'Dispute & Chargeback Management',
  pageSub:
    'Initiate disputes, manage evidence, track chargeback workflows, resolve cases and analyse resolution performance across all payment rails.',
  notifCounter: 14,
  hero: {
    live: 'Dispute command center live',
    value: '142 open cases',
    detail:
      '38 disputes filed this month, 67 chargebacks in progress, 37 resolved in last 7 days across Visa, Mastercard, PesaLink, SWIFT and local rails.',
    actions: [
      { label: 'File dispute', modal: 'disputeModal' },
      { label: 'Upload evidence', modal: 'evidenceUploadModal' },
      { label: 'Bulk action', modal: 'bulkDisputeModal' },
    ],
  },
  statCards: [
    {
      key: 'winrate',
      colClass: 'col-lg-2 col-md-4 col-6',
      label: 'WIN RATE',
      labelColor: 'var(--pm-danger)',
      value: '68%',
      valueSuffix: '/90d',
      badge: { icon: 'bi-trophy', text: '+4% vs last quarter', tone: 'badgeS' },
      lines: ['Avg resolution: 41 days', 'Recovery: KES 18.4M'],
    },
    {
      key: 'atrisk',
      colClass: 'col-lg-3 col-md-4 col-6',
      label: 'AT RISK / PENDING',
      labelColor: 'var(--pm-warning)',
      value: '29',
      badge: { icon: 'bi-clock', text: '11 expiring in 7 days', tone: 'badgeW' },
      lines: ['High-value: 8 cases', 'Merchant repeat: 4 merchants'],
    },
    {
      key: 'savings',
      colClass: 'col-lg-3 col-md-4',
      label: 'MONTHLY SAVINGS',
      labelColor: 'var(--pm-accent)',
      value: 'KES 4.2M',
      badge: { icon: 'bi-piggy-bank', text: 'Chargeback recovery', tone: 'badgeS' },
      lines: ['Fraud prevention: KES 2.1M', 'Merchant clawbacks: KES 2.1M'],
      accent: true,
    },
  ],
  attention: [
    {
      icon: 'bi-exclamation-triangle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'High-value dispute expiring',
      sub: 'CDP-44892 · KES 1.85M · 4 days left',
      actionLabel: 'Upload',
      actionTone: 'btnPmD',
      modal: 'evidenceUploadModal',
    },
    {
      icon: 'bi-arrow-repeat',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Merchant repeat offender',
      sub: '4 cases this month · Blacklist review',
      actionLabel: 'Review',
      modal: 'merchantRiskModal',
    },
    {
      icon: 'bi-clock',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Chargeback response due today',
      sub: 'CB-99102 · Visa · KES 87,400',
      actionLabel: 'Respond',
      modal: 'chargebackResponseModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-graph-up',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Increase evidence bundle for online disputes',
      sub: '+18% win rate improvement',
      actionLabel: 'Apply',
      modal: 'evidenceUploadModal',
    },
    {
      icon: 'bi-building',
      iconBg: 'var(--pm-purple-soft)',
      iconColor: 'var(--pm-purple)',
      title: 'Blacklist 3 high-risk merchants',
      sub: 'Prevent 12 future disputes',
      actionLabel: 'Blacklist',
      modal: 'merchantRiskModal',
    },
    {
      icon: 'bi-clock-history',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Enable auto-escalation for >KES 500k',
      sub: 'Reduce SLA breach risk',
      actionLabel: 'Enable',
      modal: 'disputeRulesModal',
    },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', label: 'File Dispute', color: 'var(--pm-info)', modal: 'disputeModal' },
    { icon: 'bi-upload', label: 'Upload Evidence', color: 'var(--pm-accent)', modal: 'evidenceUploadModal' },
    { icon: 'bi-reply', label: 'Respond to CB', color: 'var(--pm-info)', modal: 'chargebackResponseModal' },
    { icon: 'bi-collection', label: 'Bulk Action', color: 'var(--pm-purple)', modal: 'bulkDisputeModal' },
    { icon: 'bi-building', label: 'Merchant Risk', color: 'var(--pm-warning)', modal: 'merchantRiskModal' },
    { icon: 'bi-bar-chart-line', label: 'Analytics', color: 'var(--pm-accent)', modal: 'resolutionAnalyticsModal' },
    { icon: 'bi-sliders', label: 'Rules', color: 'var(--pm-primary-light)', modal: 'disputeRulesModal' },
    { icon: 'bi-download', label: 'Export Report', color: 'var(--pm-muted)', modal: 'exportReportModal' },
  ],
  eligibleTxns: [
    { merchant: 'Amazon Kenya', sub: 'Visa ****4521 · KES 87,400 · 12 Jun' },
    { merchant: 'Jumia Pay', sub: 'MC ****3392 · KES 23,150 · 10 Jun' },
    { merchant: 'Booking.com', sub: 'Visa ****4521 · KES 124,800 · 08 Jun' },
    { merchant: 'Uber Eats', sub: 'Prepaid ****8890 · KES 4,200 · 05 Jun' },
  ],
  reasonQuickSelect: [
    { icon: 'bi-person-x', label: 'Unauthorised', color: 'var(--pm-danger)', modal: 'quickDisputeModal' },
    { icon: 'bi-box-arrow-left', label: 'Not Received', color: 'var(--pm-warning)', modal: 'quickDisputeModal' },
    { icon: 'bi-exclamation-octagon', label: 'Not Described', color: 'var(--pm-info)', modal: 'quickDisputeModal' },
    { icon: 'bi-copy', label: 'Duplicate', color: 'var(--pm-purple)', modal: 'quickDisputeModal' },
    { icon: 'bi-x-circle', label: 'Cancelled', color: 'var(--pm-danger)', modal: 'quickDisputeModal' },
    { icon: 'bi-arrow-counterclockwise', label: 'Refund Issue', color: 'var(--pm-accent)', modal: 'quickDisputeModal' },
  ],
  filingStats: [
    { box: 'summaryBoxDanger', label: 'FILED', labelColor: 'var(--pm-danger)', value: '38', valueColor: 'var(--pm-danger)', valueSize: 24 },
    { box: 'summaryBoxWarn', label: 'AVG VALUE', labelColor: 'var(--pm-warning)', value: 'KES 124,800', valueColor: 'var(--pm-warning)', valueSize: 20 },
    { box: 'summaryBoxAccent', label: 'TOP REASON', labelColor: 'var(--pm-accent)', value: 'Unauthorised (42%)', valueColor: 'var(--pm-accent)', valueSize: 18 },
  ],
  evidenceReqs: [
    { caseId: 'CDP-44892', network: 'Visa', deadline: '29 Jun', dangerDeadline: true, needed: 'Receipt, Police report, ID', status: '4/6 uploaded', tone: 'badgeW', actionLabel: 'Upload', modal: 'evidenceUploadModal' },
    { caseId: 'CB-99102', network: 'Mastercard', deadline: '27 Jun', dangerDeadline: true, needed: 'Invoice, Delivery proof', status: '2/5 uploaded', tone: 'badgeD', actionLabel: 'Upload', modal: 'evidenceUploadModal' },
    { caseId: 'CDP-44915', network: 'PesaLink', deadline: '02 Jul', needed: 'Contract, Bank statement', status: 'Complete', tone: 'badgeS', actionLabel: 'Review', modal: 'evidencePackageModal' },
  ],
  evidenceLibrary: [
    { name: 'Receipts', count: '124 files' },
    { name: 'Police Reports', count: '38 files' },
    { name: 'Delivery Proof', count: '67 files' },
    { name: 'Contracts', count: '19 files' },
  ],
  chargebacks: [
    { cb: 'CB-99102', caseId: 'CDP-44892', network: 'Visa', stage: 'Representment', tone: 'badgeW', amount: 'KES 87,400', due: '27 Jun', actionLabel: 'Respond', modal: 'chargebackResponseModal' },
    { cb: 'CB-99087', caseId: 'CDP-44710', network: 'MC', stage: 'Pre-Arbitration', tone: 'badgeI', amount: 'KES 312,000', due: '02 Jul', actionLabel: 'Track', modal: 'chargebackTrackerModal' },
    { cb: 'CB-99065', caseId: 'CDP-44655', network: 'Visa', stage: 'Arbitration', tone: 'badgeP', amount: 'KES 1,240,000', due: '15 Jul', actionLabel: 'View', modal: 'arbitrationModal' },
  ],
  stageSummary: [
    { label: 'First Chargeback', value: '48 cases', tone: 'badgeS' },
    { label: 'Representment', value: '29 cases', tone: 'badgeW' },
    { label: 'Pre-Arbitration', value: '12 cases', tone: 'badgeI' },
    { label: 'Arbitration', value: '7 cases', tone: 'badgeD' },
    { label: 'Resolved (30d)', value: '67 cases', tone: 'badgeS' },
  ],
  winRates: [
    { label: 'Unauthorised', pct: '82%', tone: 'badgeS' },
    { label: 'Not Received', pct: '71%', tone: 'badgeS' },
    { label: 'Not Described', pct: '54%', tone: 'badgeW' },
    { label: 'Duplicate', pct: '89%', tone: 'badgeS' },
    { label: 'Cancelled', pct: '63%', tone: 'badgeI' },
  ],
  topMerchants: [
    { name: 'Amazon Kenya', sub: '18 cases · 61% win', badge: 'Review', tone: 'badgeW' },
    { name: 'Jumia Pay', sub: '12 cases · 75% win', badge: 'OK', tone: 'badgeS' },
    { name: 'Booking.com', sub: '9 cases · 44% win', badge: 'High Risk', tone: 'badgeD' },
    { name: 'Uber Eats', sub: '7 cases · 86% win', badge: 'OK', tone: 'badgeS' },
    { name: 'Local Vendor X', sub: '6 cases · 17% win', badge: 'Blacklist', tone: 'badgeD' },
  ],
  recovery: [
    { box: 'summaryBoxAccent', label: 'TOTAL RECOVERED', labelColor: 'var(--pm-accent)', value: 'KES 18.4M', valueColor: 'var(--pm-accent)', valueSize: 22 },
    { box: 'summaryBoxInfo', label: 'AVG PER CASE', labelColor: 'var(--pm-info)', value: 'KES 129,600', valueColor: 'var(--pm-info)', valueSize: 18 },
    { box: 'summaryBox', label: 'MERCHANT CLAWBACKS', labelColor: 'var(--pm-purple)', value: 'KES 4.7M', valueColor: 'var(--pm-purple)', valueSize: 18 },
  ],
  activity: [
    { date: '27 Jun', caseId: 'CDP-44923', type: 'Dispute', merchant: 'Amazon Kenya', amount: 'KES 87,400', status: 'Under Review', tone: 'badgeI', actionLabel: 'View', modal: 'disputeDetailModal' },
    { date: '26 Jun', caseId: 'CB-99102', type: 'Chargeback', merchant: 'Jumia Pay', amount: 'KES 23,150', status: 'Representment', tone: 'badgeW', actionLabel: 'Respond', modal: 'chargebackResponseModal' },
    { date: '25 Jun', caseId: 'CDP-44915', type: 'Dispute', merchant: 'Booking.com', amount: 'KES 124,800', status: 'Resolved - Won', tone: 'badgeS', actionLabel: 'View', modal: 'disputeDetailModal' },
    { date: '24 Jun', caseId: 'CDP-44892', type: 'Dispute', merchant: 'Local Vendor X', amount: 'KES 1,850,000', status: 'Evidence Pending', tone: 'badgeW', actionLabel: 'Upload', modal: 'evidenceUploadModal' },
  ],
}

/* ---------- data fetch (falls back to mock on error) ---------- */
async function fetchDisputes(): Promise<DisputesConfig> {
  const res = await fetch('/api/disputes', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as DisputesConfig
}

function MiniStatBox({ b }: { b: MiniBox }) {
  return (
    <div className={`${styles[b.box]} mb-2`}>
      <div style={{ fontSize: 11, fontWeight: 700, color: b.labelColor }}>{b.label}</div>
      <div style={{ fontSize: b.valueSize, fontWeight: 700, color: b.valueColor }}>{b.value}</div>
    </div>
  )
}

export default function Disputes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-disputes'],
    queryFn: fetchDisputes,
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
    <div className={styles.disputesPage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load dispute data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading dispute workspace…
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
            <button className={styles.btnPm} onClick={() => openM('disputeModal')}>
              <i className="bi bi-plus-lg" /> New Dispute
            </button>
            <button className={styles.btnPm} onClick={() => openM('bulkDisputeModal')}>
              <i className="bi bi-collection" /> Bulk
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('evidenceUploadModal')}>
              <i className="bi bi-upload" /> Upload Evidence
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* ======================= HERO STATS ======================= */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                  {config.hero.live} <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff' }}>
                  {config.hero.value}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.actions.map((a) => (
                    <button
                      key={a.label}
                      className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
                      onClick={() => openM(a.modal)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((card) => (
              <div className={card.colClass} key={card.key}>
                <div
                  className={styles.card}
                  style={{ minHeight: 170, borderLeft: card.accent ? '3px solid var(--pm-accent)' : undefined }}
                >
                  <p className={styles.sl} style={{ color: card.labelColor }}>
                    {card.label}
                  </p>
                  <div className={styles.sv} style={{ margin: '6px 0' }}>
                    {card.value}
                    {card.valueSuffix && <span style={{ fontSize: 14, color: 'var(--pm-muted)' }}>{card.valueSuffix}</span>}
                  </div>
                  <span className={`${styles.badge} ${styles[card.badge.tone]}`}>
                    <i className={`bi ${card.badge.icon}`} /> {card.badge.text}
                  </span>
                  <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                    {card.lines.map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
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
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14 }}>
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
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent dispute workflows</p>
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

          {/* ======================= 1.16.1 DISPUTE INITIATION & FILING ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-file-earmark-plus" style={{ color: 'var(--pm-primary-light)' }} /> 1.16.1 —
                  Dispute Initiation &amp; Filing
                </h3>
                <p className={styles.ss}>
                  Create new disputes, select transactions, choose reason codes, attach initial evidence and route to
                  the correct workflow.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('disputeModal')}>
                  <i className="bi bi-plus-lg" /> New Dispute
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('bulkDisputeModal')}>
                  <i className="bi bi-collection" /> Bulk
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Transactions Eligible for Dispute</h4>
                  {config.eligibleTxns.map((t) => (
                    <div className={styles.sr} key={t.merchant}>
                      <div>
                        <strong>{t.merchant}</strong>
                        <div className={styles.mutedSmall}>{t.sub}</div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('disputeModal')}>
                        Dispute
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Dispute Reason Quick Select</h4>
                  <div className={styles.quickGrid}>
                    {/* LEGACY BRIDGE: quickDispute(type) → closeM('disputeModal') + openM('quickDisputeModal') */}
                    {config.reasonQuickSelect.map((r) => (
                      <button key={r.label} className={styles.quickBtn} onClick={() => openM(r.modal)}>
                        <i className={`bi ${r.icon} me-1`} style={{ color: r.color }} /> {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Filing Stats (30d)</h4>
                  {config.filingStats.map((b) => (
                    <MiniStatBox key={b.label} b={b} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.16.2 EVIDENCE MANAGEMENT ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-folder-fill" style={{ color: 'var(--pm-info)' }} /> 1.16.2 — Evidence Management
                  &amp; Submission
                </h3>
                <p className={styles.ss}>
                  Upload, organise and submit evidence packages to networks with deadline tracking and compliance
                  checks.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('evidenceUploadModal')}>
                  <i className="bi bi-upload" /> Upload
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('evidencePackageModal')}>
                  <i className="bi bi-archive" /> Packages
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Evidence Requirements</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Case</th>
                          <th>Network</th>
                          <th>Deadline</th>
                          <th>Evidence Needed</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.evidenceReqs.map((r) => (
                          <tr key={r.caseId}>
                            <td>
                              <code>{r.caseId}</code>
                            </td>
                            <td>{r.network}</td>
                            <td>
                              <span className={r.dangerDeadline ? styles.textDanger : undefined}>{r.deadline}</span>
                            </td>
                            <td>{r.needed}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                            </td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(r.modal)}>
                                {r.actionLabel}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Evidence Library</h4>
                  {config.evidenceLibrary.map((l) => (
                    <div className={styles.sr} key={l.name}>
                      <div>
                        <strong>{l.name}</strong>
                        <div className={styles.mutedSmall}>{l.count}</div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('evidencePackageModal')}>
                        Browse
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.16.3 CHARGEBACK WORKFLOW & TRACKING ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-arrow-repeat" style={{ color: 'var(--pm-purple)' }} /> 1.16.3 — Chargeback
                  Workflow &amp; Tracking
                </h3>
                <p className={styles.ss}>
                  Track chargeback lifecycle, respond to representments, manage pre-arbitration and arbitration
                  stages.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('chargebackResponseModal')}>
                  <i className="bi bi-reply" /> Respond
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('chargebackTrackerModal')}>
                  <i className="bi bi-graph-up" /> Tracker
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Chargebacks</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>CB ID</th>
                          <th>Case</th>
                          <th>Network</th>
                          <th>Stage</th>
                          <th>Amount</th>
                          <th>Due</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.chargebacks.map((c) => (
                          <tr key={c.cb}>
                            <td>
                              <code>{c.cb}</code>
                            </td>
                            <td>{c.caseId}</td>
                            <td>{c.network}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[c.tone]}`}>{c.stage}</span>
                            </td>
                            <td>{c.amount}</td>
                            <td>{c.due}</td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(c.modal)}>
                                {c.actionLabel}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Stage Summary</h4>
                  {config.stageSummary.map((s) => (
                    <div className={styles.sr} key={s.label}>
                      <div>
                        <strong>{s.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[s.tone]}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.16.4 RESOLUTION ANALYTICS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-bar-chart-line" style={{ color: 'var(--pm-accent)' }} /> 1.16.4 — Resolution
                  Analytics &amp; Insights
                </h3>
                <p className={styles.ss}>
                  Analyse win/loss rates, merchant performance, reason code effectiveness and financial recovery
                  metrics.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('resolutionAnalyticsModal')}>
                  <i className="bi bi-graph-up-arrow" /> Deep Analytics
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('exportReportModal')}>
                  <i className="bi bi-download" /> Export
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Win Rate by Reason Code</h4>
                  {config.winRates.map((w) => (
                    <div className={styles.sr} key={w.label}>
                      <div>
                        <strong>{w.label}</strong>
                      </div>
                      <div>
                        <span className={`${styles.badge} ${styles[w.tone]}`}>{w.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Top 5 Merchants by Disputes</h4>
                  {config.topMerchants.map((m) => (
                    <div className={styles.sr} key={m.name}>
                      <div>
                        <strong>{m.name}</strong>
                        <div className={styles.mutedSmall}>{m.sub}</div>
                      </div>
                      <span className={`${styles.badge} ${styles[m.tone]}`}>{m.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-3">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recovery Summary (30d)</h4>
                  {config.recovery.map((b) => (
                    <MiniStatBox key={b.label} b={b} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= RECENT DISPUTE ACTIVITY ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={styles.st}>
                <i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Dispute Activity
              </h3>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('activityLogModal')}>
                View Full Log
              </button>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Case</th>
                    <th>Type</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.activity.map((a, i) => (
                    <tr key={i}>
                      <td>{a.date}</td>
                      <td>{a.caseId}</td>
                      <td>{a.type}</td>
                      <td>{a.merchant}</td>
                      <td>{a.amount}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[a.tone]}`}>{a.status}</span>
                      </td>
                      <td>
                        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(a.modal)}>
                          {a.actionLabel}
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

      {/* ======================= MODAL LAYER ======================= */}
      <DisputesModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
