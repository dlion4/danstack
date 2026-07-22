import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/compliance.module.css'
import ComplianceModals from '../components/ComplianceModals'

/* ============================================================================
   PayMo BaaS — Compliance & AML, Transactions (legacy page 1.9)
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.

   LEGACY BRIDGE NOTES (broken references in the original 1.9.html):
     openM('railConfigModal')  → modal never existed in legacy HTML; routed
                                  to 'monitorSettingsModal' (same intent).
     openM('riskModelModal')   → modal never existed in legacy HTML; routed
                                  to 'riskScoringModal' (has the AI Model tab).
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

type Cell = string | { badge: string; tone: BadgeTone } | { action: string; modal: string; tone?: string }

interface StatCardC {
  key: string
  colClass: string
  label: string
  labelColor: string
  value: string
  badge: { icon: string; text: string; tone: BadgeTone }
  lines: { label: string; value: string }[]
  bordered?: boolean
}

interface ComplianceConfig {
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
  statCards: StatCardC[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  liveFeed: { cols: TableCol[]; rows: Cell[][] }
  riskDistribution: { label: string; value: string; width: string; color: string }[]
  riskFlagged: { title: string; body: string; scoreLabel: string; score: string }
  rules: { title: string; sub: string; status: string; statusTone: BadgeTone; precision: string }[]
  rulePerformance: { cols: TableCol[]; rows: string[][] }
  screeningSummary: { label: string; value: string }[]
  screeningRefresh: string
  recentMatches: { cols: TableCol[]; rows: Cell[][] }
  riskScoreBands: { label: string; value: string; width: string; color: string }[]
  riskFactors: { label: string; value: string }[]
  cases: { cols: TableCol[]; rows: Cell[][] }
  filings: { cols: TableCol[]; rows: Cell[][] }
  deadlines: { title: string; sub: string; actionLabel: string; actionTone?: 'btnPmD'; modal: string }[]
  audit: { cols: TableCol[]; rows: string[][] }
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: ComplianceConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-wallet2', to: '/wallets', label: 'Wallets' },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics' },
    { icon: 'bi-shield-check', to: '/compliance', label: 'Compliance & AML', active: true, dot: true },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Compliance & AML (Transactions)',
  headerSub: 'Transaction monitoring, AML rules, sanctions screening, risk scoring, case management & regulatory reporting',
  searchPlaceholder: 'Search transactions, alerts, cases, sanctions lists...',
  user: { initials: 'AK', name: 'Amina K.', role: 'Compliance Officer', headerInitials: 'CC' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'Transactions Hub', to: '/select-dashboard' },
    ],
    current: 'Compliance & AML',
  },
  pageCode: 'PAGE 1.9',
  pageTitle: 'Compliance & AML (Transactions)',
  pageSub:
    'Real-time transaction monitoring, AML rules engine, sanctions & PEP screening, risk scoring, investigation case management, and automated regulatory reporting.',
  hero: {
    live: 'AML engine is live',
    value: '47,291 transactions monitored today',
    detail: 'Real-time screening across 12 payment rails. 17 alerts generated. 4 cases under active investigation.',
    buttons: [
      { label: 'Rules', modal: 'amlRulesModal' },
      { label: 'Sanctions', modal: 'sanctionsSearchModal' },
      { label: 'Risk Engine', modal: 'riskScoringModal' },
    ],
  },
  statCards: [
    {
      key: 'alerts',
      colClass: 'col-lg-2 col-md-4 col-6',
      label: 'HIGH RISK ALERTS',
      labelColor: 'var(--pm-danger)',
      value: '17',
      badge: { icon: 'bi-exclamation-triangle', text: '4 require immediate action', tone: 'badgeD' },
      lines: [
        { label: 'STRs filed today:', value: '2' },
        { label: 'CTR threshold breaches:', value: '9' },
      ],
    },
    {
      key: 'detection',
      colClass: 'col-lg-3 col-md-4 col-6',
      label: 'AML DETECTION RATE',
      labelColor: 'var(--pm-warning)',
      value: '98.7%',
      badge: { icon: 'bi-graph-up-arrow', text: '+1.2% vs last month', tone: 'badgeS' },
      lines: [
        { label: 'False positive rate:', value: '4.1%' },
        { label: 'Avg investigation time:', value: '2.4 hrs' },
      ],
    },
    {
      key: 'filings',
      colClass: 'col-lg-3 col-md-4',
      label: 'REGULATORY FILINGS',
      labelColor: 'var(--pm-accent)',
      value: '142',
      badge: { icon: 'bi-file-earmark-check', text: 'This month', tone: 'badgeI' },
      lines: [
        { label: 'STRs: 31 | CTRs: 89 | SARs: 22', value: '' },
        { label: 'Next CBK report due:', value: '30 Jun' },
      ],
      bordered: true,
    },
  ],
  attention: [
    {
      icon: 'bi-exclamation-triangle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'Structuring detected — 3 linked txns',
      sub: 'KSh 2.8M in 48h via multiple accounts',
      actionLabel: 'Investigate',
      actionTone: 'btnPmD',
      modal: 'newCaseModal',
    },
    {
      icon: 'bi-person-x',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'PEP match on beneficiary',
      sub: 'TXN-884291 — Requires enhanced due diligence',
      actionLabel: 'Review',
      modal: 'pepDetailModal',
    },
    {
      icon: 'bi-globe',
      iconBg: 'var(--pm-purple-soft)',
      iconColor: 'var(--pm-purple)',
      title: 'Sanctions list update — 47 new entries',
      sub: 'Screening in progress (12,400 txns)',
      actionLabel: 'Scan',
      modal: 'sanctionsSearchModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-robot',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Tighten velocity rule for cross-border',
      sub: 'Reduce false positives by 18%',
      actionLabel: 'Tune Rule',
      modal: 'amlRulesModal',
    },
    {
      icon: 'bi-graph-up',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Increase risk score weight for crypto exchanges',
      sub: 'Current weight: 25% → Suggested: 40%',
      actionLabel: 'Adjust',
      modal: 'riskScoringModal',
    },
    {
      icon: 'bi-link-45deg',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Enable real-time sanctions screening on PesaLink',
      sub: 'Currently batch (every 15 min)',
      actionLabel: 'Enable',
      // LEGACY BRIDGE: legacy called openM('railConfigModal') — that modal id
      // does not exist in 1.9.html; mapped to the monitoring settings modal.
      modal: 'monitorSettingsModal',
    },
  ],
  quickActions: [
    { icon: 'bi-folder-plus', label: 'New Investigation', color: 'var(--pm-danger)', modal: 'newCaseModal' },
    { icon: 'bi-globe', label: 'Sanctions Search', color: 'var(--pm-warning)', modal: 'sanctionsSearchModal' },
    { icon: 'bi-sliders', label: 'Edit Rules', color: 'var(--pm-primary-light)', modal: 'amlRulesModal' },
    { icon: 'bi-file-earmark-text', label: 'File STR/CTR', color: 'var(--pm-purple)', modal: 'regReportModal' },
    { icon: 'bi-speedometer2', label: 'Risk Engine', color: 'var(--pm-info)', modal: 'riskScoringModal' },
    { icon: 'bi-clock-history', label: 'Audit Log', color: 'var(--pm-accent)', modal: 'auditTrailModal' },
    { icon: 'bi-people', label: 'Bulk Screen', color: 'var(--pm-warning)', modal: 'bulkScreeningModal' },
    { icon: 'bi-archive', label: 'Evidence Locker', color: 'var(--pm-muted)', modal: 'evidenceLockerModal' },
  ],
  liveFeed: {
    cols: [
      { key: 'time', label: 'Time' },
      { key: 'ref', label: 'Reference' },
      { key: 'route', label: 'From → To' },
      { key: 'amount', label: 'Amount' },
      { key: 'rail', label: 'Rail' },
      { key: 'risk', label: 'Risk' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' },
    ],
    rows: [
      ['14:32', 'C:TXN-992184', 'Equity → KCB', 'STR:KES 2,450,000', 'PesaLink', { badge: '92', tone: 'badgeD' }, { badge: 'Alert', tone: 'badgeD' }, { action: 'Investigate', modal: 'caseDetailModal' }],
      ['14:31', 'C:TXN-992183', 'Co-op → Stanbic', 'STR:KES 185,000', 'RTGS', { badge: '48', tone: 'badgeW' }, { badge: 'Cleared', tone: 'badgeS' }, { action: 'View', modal: 'txnDetailModal' }],
      ['14:30', 'C:TXN-992182', 'Absa → Family', 'STR:KES 47,500', 'ACH', { badge: '12', tone: 'badgeS' }, { badge: 'Cleared', tone: 'badgeS' }, { action: 'View', modal: 'txnDetailModal' }],
      ['14:29', 'C:TXN-992181', 'NCBA → Equity', 'STR:USD 125,000', 'SWIFT', { badge: '78', tone: 'badgeD' }, { badge: 'Hold', tone: 'badgeW' }, { action: 'Screen', modal: 'sanctionsSearchModal' }],
      ['14:28', 'C:TXN-992180', 'KCB → I&M', 'STR:KES 890,000', 'PesaLink', { badge: '55', tone: 'badgeW' }, { badge: 'Cleared', tone: 'badgeS' }, { action: 'View', modal: 'txnDetailModal' }],
    ],
  },
  riskDistribution: [
    { label: 'Low Risk (0-30)', value: '41,882 (88.5%)', width: '88.5%', color: 'var(--pm-accent)' },
    { label: 'Medium Risk (31-60)', value: '4,392 (9.3%)', width: '9.3%', color: 'var(--pm-warning)' },
    { label: 'High Risk (61-100)', value: '1,017 (2.2%)', width: '2.2%', color: 'var(--pm-danger)' },
  ],
  riskFlagged: {
    title: '4 transactions',
    body: 'currently flagged for immediate review. Average risk score:',
    scoreLabel: '',
    score: '47.2',
  },
  rules: [
    { title: 'Structuring Detection', sub: 'Multiple transactions just below threshold in 48h', status: 'Active', statusTone: 'badgeS', precision: '98.4%' },
    { title: 'Velocity Rule — Cross-border', sub: '>3 international txns in 24h from same originator', status: 'Active', statusTone: 'badgeS', precision: '94.1%' },
    { title: 'Round-Tripping Detection', sub: 'Funds returning to originator within 7 days', status: 'Active', statusTone: 'badgeS', precision: '87.6%' },
    { title: 'PEP Transaction Spike', sub: 'PEP-linked account >300% avg volume', status: 'Active', statusTone: 'badgeS', precision: '91.2%' },
    { title: 'Crypto Exchange Concentration', sub: '>40% monthly volume to crypto exchanges', status: 'Paused', statusTone: 'badgeW', precision: '—' },
  ],
  rulePerformance: {
    cols: [
      { key: 'rule', label: 'Rule' },
      { key: 'alerts', label: 'Alerts' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'precision', label: 'Precision' },
    ],
    rows: [
      ['Structuring', '412', '89', 'STR:21.6%'],
      ['Velocity (Intl)', '187', '61', 'STR:32.6%'],
      ['Round-Trip', '94', '38', 'STR:40.4%'],
      ['PEP Spike', '31', '19', 'STR:61.3%'],
    ],
  },
  screeningSummary: [
    { label: 'Total Screened', value: '47,291' },
    { label: 'Matches Found', value: '47' },
    { label: 'False Positives', value: '38' },
    { label: 'True Matches (Confirmed)', value: '9' },
    { label: 'PEP Hits', value: '12' },
  ],
  screeningRefresh: '27 Jun 2025, 06:00 EAT',
  recentMatches: {
    cols: [
      { key: 'entity', label: 'Entity' },
      { key: 'list', label: 'List' },
      { key: 'score', label: 'Match Score' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['John Kamau (Beneficiary)', 'UN Consolidated', { badge: '98%', tone: 'badgeD' }, { action: 'Review', modal: 'pepDetailModal' }],
      ['Global Trade Ltd (Originator)', 'OFAC SDN', { badge: '94%', tone: 'badgeD' }, { action: 'Review', modal: 'pepDetailModal' }],
      ['Hon. Peter Ochieng (Director)', 'Local PEP DB', { badge: '72%', tone: 'badgeW' }, { action: 'Review', modal: 'pepDetailModal' }],
    ],
  },
  riskScoreBands: [
    { label: '0-20 (Very Low)', value: '18,442 (39%)', width: '39%', color: 'var(--pm-accent)' },
    { label: '21-40 (Low)', value: '14,188 (30%)', width: '30%', color: '#34D399' },
    { label: '41-60 (Medium)', value: '9,458 (20%)', width: '20%', color: 'var(--pm-warning)' },
    { label: '61-80 (High)', value: '3,776 (8%)', width: '8%', color: 'var(--pm-danger)' },
    { label: '81-100 (Critical)', value: '1,427 (3%)', width: '3%', color: '#DC2626' },
  ],
  riskFactors: [
    { label: 'High-risk jurisdiction', value: '2,841 txns' },
    { label: 'PEP relationship', value: '1,992 txns' },
    { label: 'Crypto exchange exposure', value: '1,447 txns' },
    { label: 'Structuring pattern', value: '892 txns' },
    { label: 'Adverse media hit', value: '611 txns' },
  ],
  cases: {
    cols: [
      { key: 'id', label: 'Case ID' },
      { key: 'type', label: 'Type' },
      { key: 'subject', label: 'Subject' },
      { key: 'risk', label: 'Risk' },
      { key: 'status', label: 'Status' },
      { key: 'opened', label: 'Opened' },
      { key: 'owner', label: 'Owner' },
      { key: 'actions', label: 'Actions' },
    ],
    rows: [
      ['C:AML-44892', 'Structuring', 'John K. & 3 linked accounts', { badge: '92', tone: 'badgeD' }, { badge: 'Investigation', tone: 'badgeD' }, '24 Jun', 'Sarah M.', { action: 'Open', modal: 'caseDetailModal' }],
      ['C:AML-44885', 'Sanctions', 'Global Trade Ltd', { badge: '94', tone: 'badgeD' }, { badge: 'Escalated', tone: 'badgeW' }, '23 Jun', 'David O.', { action: 'Open', modal: 'caseDetailModal' }],
      ['C:AML-44871', 'PEP', 'Hon. Peter Ochieng', { badge: '72', tone: 'badgeW' }, { badge: 'Under Review', tone: 'badgeS' }, '22 Jun', 'Amina K.', { action: 'Open', modal: 'caseDetailModal' }],
      ['C:AML-44860', 'Round-Trip', 'TechFlow Solutions', { badge: '61', tone: 'badgeW' }, { badge: 'Closed', tone: 'badgeS' }, '18 Jun', 'James K.', { action: 'View', modal: 'caseDetailModal' }],
    ],
  },
  filings: {
    cols: [
      { key: 'id', label: 'Report ID' },
      { key: 'type', label: 'Type' },
      { key: 'subject', label: 'Subject' },
      { key: 'filed', label: 'Filed' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' },
    ],
    rows: [
      ['C:STR-2025-0612', 'STR', 'Structuring — John K. network', '26 Jun', { badge: 'Submitted', tone: 'badgeS' }, { action: 'View', modal: 'reportDetailModal' }],
      ['C:CTR-2025-0611', 'CTR', 'Cash deposits > KES 1M', '25 Jun', { badge: 'Acknowledged', tone: 'badgeS' }, { action: 'View', modal: 'reportDetailModal' }],
      ['C:SAR-2025-0608', 'SAR', 'PEP adverse media', '22 Jun', { badge: 'Submitted', tone: 'badgeS' }, { action: 'View', modal: 'reportDetailModal' }],
    ],
  },
  deadlines: [
    { title: 'STR Draft #AML-44892', sub: 'Due in 18 hours', actionLabel: 'Complete', actionTone: 'btnPmD', modal: 'caseDetailModal' },
    { title: 'Monthly CBK Summary', sub: 'Due 30 Jun 2025', actionLabel: 'Prepare', modal: 'regReportModal' },
    { title: 'Quarterly AML Report', sub: 'Due 15 Jul 2025', actionLabel: 'Start', modal: 'regReportModal' },
  ],
  audit: {
    cols: [
      { key: 'ts', label: 'Timestamp' },
      { key: 'user', label: 'User' },
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
      { key: 'evidence', label: 'Evidence' },
      { key: 'ip', label: 'IP / Device' },
    ],
    rows: [
      ['27 Jun 14:28', 'Sarah M.', 'Case escalated to CBK', 'AML-44892', 'STR-2025-0612', '102.68.XX.XX — MacBook'],
      ['27 Jun 13:55', 'David O.', 'Added evidence file', 'AML-44885', 'bank_statements.pdf', '102.68.XX.XX — Windows'],
      ['27 Jun 11:42', 'Amina K.', 'Updated risk score', 'PEP-7721', '—', '102.68.XX.XX — iPhone'],
      ['26 Jun 09:15', 'System', 'Auto-block triggered', 'TXN-992184', 'Rule: Velocity-INTL', '—'],
    ],
  },
}

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchCompliance(): Promise<ComplianceConfig> {
  const res = await fetch('/api/compliance')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<ComplianceConfig>
  return { ...initialMockData, ...json }
}

/* ---------- cell renderer for data tables ---------- */
function CellValue({ cell, onOpen }: { cell: Cell; onOpen: (id: string) => void }) {
  if (typeof cell === 'string') {
    if (cell.startsWith('C:')) return <code>{cell.slice(2)}</code>
    if (cell.startsWith('B:')) {
      const [, tone, text] = cell.split(':')
      const toneClass =
        tone === 's' ? styles.badgeS : tone === 'w' ? styles.badgeW : tone === 'd' ? styles.badgeD : tone === 'i' ? styles.badgeI : styles.badgeP
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

/* ---------- section header (1.9.x pattern) ---------- */
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
  actions: { label: string; icon: string; modal: string; tone?: 'btnPmP' | 'btnPmD' }[]
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
            <i className={`bi ${a.icon}`} /> {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Compliance() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-compliance'],
    queryFn: fetchCompliance,
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
    <div className={styles.compliancePage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load compliance data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading compliance workspace…
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
            <button className={styles.btnPm} onClick={() => openM('amlHealthModal')}>
              <i className="bi bi-heart-pulse" /> Health Check
            </button>
            <button className={styles.btnPm} onClick={() => openM('regReportModal')}>
              <i className="bi bi-file-earmark-text" /> Regulatory Reports
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('newCaseModal')}>
              <i className="bi bi-folder-plus" /> New Case
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => openM('emergencyBlockModal')}>
              <i className="bi bi-exclamation-triangle" /> Emergency Block
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
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff', fontSize: 22 }}>
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
                  <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                    {card.lines.map((li) => (
                      <div key={li.label}>
                        {li.label} {li.value && <strong>{li.value}</strong>}
                      </div>
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
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('attentionFullModal')}>
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
                  <p className={styles.ss}>Frequent compliance workflows</p>
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

          {/* ======================= SECTION 1.9.1 — Real-Time Transaction Monitoring ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-activity"
              iconColor="var(--pm-primary)"
              code="1.9.1"
              title="Real-Time Transaction Monitoring Dashboard"
              sub="Live feed of all bank-to-bank transactions with risk scoring, alerts, and immediate action capabilities."
              actions={[
                { label: 'Settings', icon: 'bi-gear', modal: 'monitorSettingsModal' },
                { label: 'Live Alerts (17)', icon: 'bi-bell', modal: 'liveAlertsModal', tone: 'btnPmP' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Live Transaction Feed</h4>
                  <div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.liveFeed.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.liveFeed.rows.map((row, i) => (
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
                  <h4 className={styles.ubTitle}>Risk Distribution (Today)</h4>
                  {config.riskDistribution.map((b) => (
                    <div key={b.label}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>{b.label}</span>
                        <strong>{b.value}</strong>
                      </div>
                      <div className={`${styles.pmProgress} mb-3`}>
                        <div className={styles.pmProgressBar} style={{ width: b.width, background: b.color }} />
                      </div>
                    </div>
                  ))}
                  <div className={`${styles.summaryBoxDanger} mt-3`} style={{ fontSize: 12 }}>
                    <strong>{config.riskFlagged.title}</strong> {config.riskFlagged.body}{' '}
                    <strong>{config.riskFlagged.score}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.9.2 — AML Rules Engine ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-sliders"
              iconColor="var(--pm-purple)"
              code="1.9.2"
              title="AML Rules Engine & Threshold Configuration"
              sub="Create, tune, and A/B test detection rules for structuring, velocity, round-tripping, and sanctions evasion."
              actions={[
                { label: 'New Rule', icon: 'bi-plus-lg', modal: 'amlRulesModal' },
                { label: 'Test Rules', icon: 'bi-play', modal: 'ruleTestModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Detection Rules</h4>
                  {config.rules.map((r) => (
                    <div className={styles.sr} key={r.title}>
                      <div>
                        <strong>{r.title}</strong>
                        <div className={styles.mutedSmall}>{r.sub}</div>
                      </div>
                      <div>
                        <span className={`${styles.badge} ${styles[r.statusTone]}`}>{r.status}</span>{' '}
                        <span className={`${styles.badge} ${styles.badgeP}`}>{r.precision}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Rule Performance (30 days)</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.rulePerformance.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.rulePerformance.rows.map((row, i) => (
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

          {/* ======================= SECTION 1.9.3 — Sanctions & PEP Screening ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-globe"
              iconColor="var(--pm-info)"
              code="1.9.3"
              title="Sanctions & PEP Screening"
              sub="Real-time and batch screening against UN, OFAC, EU, UK, and local sanctions lists plus PEP databases."
              actions={[
                { label: 'Search', icon: 'bi-search', modal: 'sanctionsSearchModal' },
                { label: 'Bulk Screen', icon: 'bi-people', modal: 'bulkScreeningModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Screening Summary (Today)</h4>
                  {config.screeningSummary.map((r) => (
                    <div className={styles.sr} key={r.label}>
                      <div>
                        <strong>{r.label}</strong>
                      </div>
                      <strong>{r.value}</strong>
                    </div>
                  ))}
                  <div className={`${styles.summaryBoxInfo} mt-3`} style={{ fontSize: 12 }}>
                    <i className="bi bi-info-circle me-1" /> Last full sanctions list refresh:{' '}
                    <strong>{config.screeningRefresh}</strong>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Matches</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.recentMatches.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.recentMatches.rows.map((row, i) => (
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

          {/* ======================= SECTION 1.9.4 — Risk Scoring ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-speedometer2"
              iconColor="var(--pm-warning)"
              code="1.9.4"
              title="Risk Scoring & Customer Risk Profiles"
              sub="Dynamic risk scoring engine with explainable AI, customer risk profiles, and automated risk-based controls."
              actions={[
                { label: 'Configure', icon: 'bi-gear', modal: 'riskScoringModal' },
                // LEGACY BRIDGE: legacy called openM('riskModelModal') — id missing in 1.9.html; mapped to riskScoringModal.
                { label: 'AI Model', icon: 'bi-robot', modal: 'riskScoringModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Risk Score Distribution</h4>
                  {config.riskScoreBands.map((b, i) => (
                    <div key={b.label}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>{b.label}</span>
                        <strong>{b.value}</strong>
                      </div>
                      <div className={`${styles.pmProgress} ${i < config.riskScoreBands.length - 1 ? 'mb-2' : ''}`}>
                        <div className={styles.pmProgressBar} style={{ width: b.width, background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Top Risk Factors (This Month)</h4>
                  {config.riskFactors.map((f) => (
                    <div className={styles.sr} key={f.label}>
                      <div>
                        <strong>{f.label}</strong>
                      </div>
                      <strong>{f.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.9.5 — Case Management ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-folder-check"
              iconColor="var(--pm-info)"
              code="1.9.5"
              title="Investigation Case Management"
              sub="End-to-end case lifecycle: creation, evidence gathering, collaboration, escalation, and regulatory filing."
              actions={[
                { label: 'New Case', icon: 'bi-folder-plus', modal: 'newCaseModal' },
                { label: 'Export', icon: 'bi-download', modal: 'caseExportModal' },
              ]}
              onOpen={openM}
            />
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.cases.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.cases.rows.map((row, i) => (
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

          {/* ======================= SECTION 1.9.6 — Regulatory Reporting ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-file-earmark-text"
              iconColor="var(--pm-purple)"
              code="1.9.6"
              title="Regulatory Reporting (STR / CTR / SAR)"
              sub="Automated generation, review, and submission of Suspicious Transaction Reports, Currency Transaction Reports, and Suspicious Activity Reports."
              actions={[
                { label: 'New Filing', icon: 'bi-plus-lg', modal: 'regReportModal' },
                { label: 'Calendar', icon: 'bi-calendar', modal: 'reportCalendarModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Filings</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.filings.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.filings.rows.map((row, i) => (
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
                  <h4 className={styles.ubTitle}>Filing Deadlines</h4>
                  {config.deadlines.map((d) => (
                    <div className={styles.sr} key={d.title}>
                      <div>
                        <strong>{d.title}</strong>
                        <div className={styles.mutedSmall}>{d.sub}</div>
                      </div>
                      <button
                        className={`${styles.btnPm} ${styles.btnSm} ${d.actionTone ? styles[d.actionTone] : ''}`}
                        onClick={() => openM(d.modal)}
                      >
                        {d.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.9.7 — Audit Trail & Evidence ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-archive"
              iconColor="var(--pm-muted)"
              code="1.9.7"
              title="Audit Trail & Evidence Locker"
              sub="Immutable audit log of all compliance actions, evidence management, chain of custody, and regulatory inspection readiness."
              actions={[
                { label: 'Full Log', icon: 'bi-clock-history', modal: 'auditTrailModal' },
                { label: 'Evidence Locker', icon: 'bi-archive', modal: 'evidenceLockerModal' },
              ]}
              onOpen={openM}
            />
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.audit.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.audit.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
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

      {/* ======================= ALL 24 MODALS ======================= */}
      <ComplianceModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
