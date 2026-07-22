import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/fees.module.css'
import FeesModals from '../components/FeesModals'

/* ============================================================================
   PayMo BaaS — Fee & Commission Management (legacy page 1.15)
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
  modal: string
}

interface QuickAction {
  icon: string
  label: string
  color: string
  modal: string
}

interface FeeRuleRow {
  id: string
  name: string
  type: string
  rate: string
  volume: string
  revenue: string
  status: string
  tone: BadgeTone
  actionLabel: string
}

interface TierRow {
  tier: string
  tone: BadgeTone
  name: string
  threshold: string
  rate: string
  agents: string
  paid: string
}

interface WaiverRow {
  id: string
  name: string
  type: string
  discount: string
  used: string
  budget: string
  actionLabel: string
}

interface FeesConfig {
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
    badge: { icon: string; text: string; tone: BadgeTone }
    lines: string[]
    attention?: boolean
  }[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  feeRules: FeeRuleRow[]
  revenueBars: { height: string; color: string; label: string; modal: string }[]
  revenueLegend: { color: string; label: string }[]
  tiers: TierRow[]
  topAgents: { name: string; sub: string; badge: string; tone: BadgeTone }[]
  calcTypes: string[]
  feeCompare: { provider: string; fee: string; time: string; rating: string; tone: BadgeTone; strong?: boolean }[]
  trendBars: { height: string; color: string; label: string }[]
  topChannels: { name: string; value: string; pct: string; tone: BadgeTone }[]
  waivers: WaiverRow[]
  waiverBudget: { label: string; pct: string; width: string; color: string }[]
  pendingSettlements: { title: string; sub: string; amount: string }[]
  recentSettlements: { date: string; type: string; amount: string; recipients: string; status: string; tone: BadgeTone }[]
  compliance: { label: string; status: string; tone: BadgeTone }[]
  auditLogs: { date: string; action: string; user: string; details: string; result: string; tone: BadgeTone }[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: FeesConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-bank', to: '/banking', label: 'Banking' },
    { icon: 'bi-percent', to: '/fees', label: 'Fee & Commission Management', active: true, dot: true },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Fee & Commission Management',
  headerSub: 'Fee structures, commission tiers, waivers, settlement reconciliation and compliance',
  searchPlaceholder: 'Search fee rules, commission tiers, transactions, waivers...',
  user: { initials: 'JK', name: 'James K.', role: 'Treasury Manager', headerInitials: 'MN' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'Transactions Hub', to: '/transactions' },
    ],
    current: 'Fee & Commission Management',
  },
  pageCode: 'PAGE 1.15',
  pageTitle: 'Fee & Commission Management',
  pageSub:
    'Manage all transaction fees, commission structures, tiered pricing, waivers, settlements and regulatory compliance in one centralised command center.',
  notifCounter: 7,
  hero: {
    live: 'Fee engine is live',
    value: 'KES 18.4M collected',
    detail: 'This month across 142,890 transactions. 47 active fee rules, 12 commission tiers, 8 active waivers.',
    actions: [
      { label: 'Calculator', modal: 'feeCalculatorModal' },
      { label: 'Waivers', modal: 'waiverModal' },
      { label: 'Settle', modal: 'settlementModal' },
    ],
  },
  statCards: [
    {
      key: 'rate',
      colClass: 'col-lg-2 col-md-4 col-6',
      label: 'AVG FEE RATE',
      labelColor: 'var(--pm-accent)',
      value: '1.42%',
      badge: { icon: 'bi-graph-down-arrow', text: '-0.08% MoM', tone: 'badgeS' },
      lines: ['Inter-bank: 0.85%', 'Wallet transfer: 1.95%'],
    },
    {
      key: 'commission',
      colClass: 'col-lg-3 col-md-4 col-6',
      label: 'COMMISSION PAID OUT',
      labelColor: 'var(--pm-info)',
      value: 'KES 4.82M',
      badge: { icon: 'bi-people', text: '2,184 agents', tone: 'badgeI' },
      lines: ['Top tier agents earned KES 312K this month'],
    },
    {
      key: 'waivers',
      colClass: 'col-lg-3 col-md-4',
      label: 'WAIVERS ACTIVE',
      labelColor: 'var(--pm-warning)',
      value: '8',
      badge: { icon: 'bi-gift', text: 'KES 1.24M waived', tone: 'badgeW' },
      lines: ['4 promotional, 3 hardship, 1 regulatory'],
      attention: true,
    },
  ],
  attention: [
    {
      icon: 'bi-exclamation-triangle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'Tier 3 commission rule underperforming',
      sub: 'Only 12% of target volume',
      actionLabel: 'Review',
      modal: 'editCommissionModal',
    },
    {
      icon: 'bi-clock',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Fee rule #FR-442 expires in 5 days',
      sub: 'Promotional 0.5% fee for SMEs',
      actionLabel: 'Extend',
      modal: 'editFeeRuleModal',
    },
    {
      icon: 'bi-file-earmark-text',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Monthly settlement reconciliation pending',
      sub: 'KES 2.1M difference flagged',
      actionLabel: 'Reconcile',
      modal: 'settlementModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-graph-up',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Introduce volume-based tier for agents',
      sub: 'Potential +KES 840K monthly revenue',
      actionLabel: 'Create Tier',
      modal: 'addCommissionTierModal',
    },
    {
      icon: 'bi-lightbulb',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Waive fees for first 3 inter-bank transfers',
      sub: 'Increase wallet adoption by 18%',
      actionLabel: 'Setup',
      modal: 'waiverModal',
    },
    {
      icon: 'bi-file-earmark-check',
      iconBg: 'var(--pm-purple-soft)',
      iconColor: 'var(--pm-purple)',
      title: 'Audit fee leakage on high-value transfers',
      sub: 'KES 312K identified in Q2',
      actionLabel: 'Audit',
      modal: 'complianceCheckModal',
    },
  ],
  quickActions: [
    { icon: 'bi-calculator', label: 'Fee Calculator', color: 'var(--pm-info)', modal: 'feeCalculatorModal' },
    { icon: 'bi-plus-circle', label: 'New Fee Rule', color: 'var(--pm-accent)', modal: 'addFeeRuleModal' },
    { icon: 'bi-layers', label: 'New Commission Tier', color: 'var(--pm-purple)', modal: 'addCommissionTierModal' },
    { icon: 'bi-gift', label: 'Create Waiver', color: 'var(--pm-warning)', modal: 'waiverModal' },
    { icon: 'bi-cash-stack', label: 'Run Settlement', color: 'var(--pm-info)', modal: 'settlementModal' },
    { icon: 'bi-file-earmark-bar-graph', label: 'Fee Report', color: 'var(--pm-accent)', modal: 'feeReportModal' },
    { icon: 'bi-shield', label: 'Exemptions', color: 'var(--pm-primary-light)', modal: 'exemptionModal' },
    { icon: 'bi-clipboard-check', label: 'Compliance Check', color: 'var(--pm-danger)', modal: 'complianceCheckModal' },
  ],
  feeRules: [
    { id: 'FR-401', name: 'Inter-bank Transfer', type: 'Percentage', rate: '0.85%', volume: 'KES 842M', revenue: 'KES 7.16M', status: 'Active', tone: 'badgeS', actionLabel: 'Edit' },
    { id: 'FR-402', name: 'Wallet to Bank', type: 'Fixed', rate: 'KES 25', volume: '124,890 txns', revenue: 'KES 3.12M', status: 'Active', tone: 'badgeS', actionLabel: 'Edit' },
    { id: 'FR-410', name: 'High-Value Instant', type: 'Tiered', rate: '0.45–1.2%', volume: 'KES 1.12B', revenue: 'KES 6.84M', status: 'Active', tone: 'badgeS', actionLabel: 'Edit' },
    { id: 'FR-415', name: 'SME Promotional', type: 'Percentage', rate: '0.50%', volume: 'KES 189M', revenue: 'KES 945K', status: 'Expiring', tone: 'badgeW', actionLabel: 'Extend' },
    { id: 'FR-420', name: 'Agent Cash-in', type: 'Fixed', rate: 'KES 10', volume: '89,420 txns', revenue: 'KES 894K', status: 'Active', tone: 'badgeS', actionLabel: 'Edit' },
  ],
  revenueBars: [
    { height: '85%', color: 'var(--pm-primary)', label: 'Inter-bank', modal: 'feeReportModal' },
    { height: '62%', color: 'var(--pm-info)', label: 'Wallet', modal: 'feeReportModal' },
    { height: '78%', color: 'var(--pm-accent)', label: 'Instant', modal: 'feeReportModal' },
    { height: '45%', color: 'var(--pm-warning)', label: 'Agent', modal: 'feeReportModal' },
    { height: '35%', color: 'var(--pm-purple)', label: 'Other', modal: 'feeReportModal' },
  ],
  revenueLegend: [
    { color: 'var(--pm-primary)', label: 'Inter-bank KES 7.16M' },
    { color: 'var(--pm-info)', label: 'Wallet KES 3.12M' },
    { color: 'var(--pm-accent)', label: 'Instant KES 6.84M' },
  ],
  tiers: [
    { tier: 'T1', tone: 'badgeS', name: 'Starter', threshold: 'KES 0 – 500K', rate: '0.8%', agents: '1,240', paid: 'KES 1.12M' },
    { tier: 'T2', tone: 'badgeI', name: 'Growth', threshold: 'KES 500K – 2M', rate: '1.1%', agents: '682', paid: 'KES 2.04M' },
    { tier: 'T3', tone: 'badgeP', name: 'Pro', threshold: 'KES 2M – 10M', rate: '1.4%', agents: '189', paid: 'KES 1.48M' },
    { tier: 'T4', tone: 'badgeW', name: 'Elite', threshold: 'KES 10M+', rate: '1.8%', agents: '73', paid: 'KES 218K' },
  ],
  topAgents: [
    { name: 'Agent #AG-8821', sub: 'KES 48.2M volume', badge: 'Elite', tone: 'badgeS' },
    { name: 'Agent #AG-7744', sub: 'KES 39.8M volume', badge: 'Elite', tone: 'badgeS' },
    { name: 'Agent #AG-9910', sub: 'KES 31.4M volume', badge: 'Pro', tone: 'badgeP' },
    { name: 'Agent #AG-3342', sub: 'KES 27.9M volume', badge: 'Pro', tone: 'badgeP' },
  ],
  calcTypes: ['Inter-bank Transfer', 'Wallet to Bank', 'Instant Payment', 'Agent Cash-in'],
  feeCompare: [
    { provider: 'PayMo', fee: 'KES 2,465', time: 'Instant', rating: '4.9/5', tone: 'badgeS', strong: true },
    { provider: 'Bank A', fee: 'KES 3,200', time: '30 min', rating: '4.2/5', tone: 'badgeI' },
    { provider: 'Bank B', fee: 'KES 2,850', time: '2 hours', rating: '3.8/5', tone: 'badgeI' },
    { provider: 'Mobile Money', fee: 'KES 4,100', time: 'Instant', rating: '3.5/5', tone: 'badgeW' },
  ],
  trendBars: [
    { height: '55%', color: 'var(--pm-primary)', label: 'Jan' },
    { height: '62%', color: 'var(--pm-primary)', label: 'Feb' },
    { height: '71%', color: 'var(--pm-primary)', label: 'Mar' },
    { height: '68%', color: 'var(--pm-primary)', label: 'Apr' },
    { height: '82%', color: 'var(--pm-primary)', label: 'May' },
    { height: '78%', color: 'var(--pm-accent)', label: 'Jun' },
  ],
  topChannels: [
    { name: 'Inter-bank (KES)', value: 'KES 7.16M', pct: '39%', tone: 'badgeS' },
    { name: 'Wallet Transfers', value: 'KES 3.12M', pct: '17%', tone: 'badgeI' },
    { name: 'Instant Payments', value: 'KES 6.84M', pct: '37%', tone: 'badgeP' },
    { name: 'Agent Services', value: 'KES 1.28M', pct: '7%', tone: 'badgeW' },
  ],
  waivers: [
    { id: 'WV-101', name: 'SME First Transfer', type: 'Promotional', discount: '100%', used: '18,420', budget: 'KES 5M', actionLabel: 'Edit' },
    { id: 'WV-105', name: 'Hardship Relief', type: 'Hardship', discount: '50%', used: '2,184', budget: 'KES 2M', actionLabel: 'Edit' },
    { id: 'WV-110', name: 'Regulatory (CBK)', type: 'Regulatory', discount: '100%', used: '44,920', budget: 'Unlimited', actionLabel: 'View' },
    { id: 'WV-112', name: 'Partner Discount', type: 'Partner', discount: '30%', used: '8,920', budget: 'KES 3M', actionLabel: 'Edit' },
  ],
  waiverBudget: [
    { label: 'SME First Transfer', pct: '78%', width: '78%', color: 'var(--pm-accent)' },
    { label: 'Hardship Relief', pct: '54%', width: '54%', color: 'var(--pm-warning)' },
    { label: 'Partner Discount', pct: '31%', width: '31%', color: 'var(--pm-info)' },
  ],
  pendingSettlements: [
    { title: 'Agent Commission — June', sub: '2,184 agents', amount: 'KES 4.82M' },
    { title: 'Partner Revenue Share', sub: '12 partners', amount: 'KES 1.89M' },
    { title: 'Merchant Cashback', sub: '84 merchants', amount: 'KES 312K' },
  ],
  recentSettlements: [
    { date: '25 Jun 2025', type: 'Agent Commission', amount: 'KES 4.12M', recipients: '2,011', status: 'Completed', tone: 'badgeS' },
    { date: '20 Jun 2025', type: 'Partner Share', amount: 'KES 1.76M', recipients: '12', status: 'Completed', tone: 'badgeS' },
    { date: '18 Jun 2025', type: 'Merchant Cashback', amount: 'KES 289K', recipients: '79', status: 'Completed', tone: 'badgeS' },
  ],
  compliance: [
    { label: 'CBK Fee Disclosure', status: 'Compliant', tone: 'badgeS' },
    { label: 'KRA Withholding', status: 'Compliant', tone: 'badgeS' },
    { label: 'Consumer Protection', status: 'Compliant', tone: 'badgeS' },
    { label: 'PCI DSS Fee Storage', status: 'Compliant', tone: 'badgeS' },
  ],
  auditLogs: [
    { date: '26 Jun', action: 'Fee rule updated', user: 'James K.', details: 'FR-415 rate changed to 0.5%', result: 'Approved', tone: 'badgeS' },
    { date: '25 Jun', action: 'Waiver created', user: 'Grace M.', details: 'WV-115 — Flood Relief 100%', result: 'Approved', tone: 'badgeS' },
    { date: '24 Jun', action: 'Commission tier edited', user: 'James K.', details: 'T3 threshold updated', result: 'Approved', tone: 'badgeS' },
    { date: '23 Jun', action: 'Settlement run', user: 'System', details: 'June agent commission', result: 'Completed', tone: 'badgeS' },
  ],
}

/* ---------- data fetch (falls back to mock on error) ---------- */
async function fetchFees(): Promise<FeesConfig> {
  const res = await fetch('/api/fees', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as FeesConfig
}

/* ---------- LEGACY BRIDGE: calculateFee() — verbatim formula from page JS ----------
   Inter-bank → 0.85%, Wallet → KES 25 flat, Instant → 0.45%, other → KES 10; VAT 16%. */
function quickCalc(type: string, amount: number) {
  let fee = 0
  if (type.includes('Inter-bank')) fee = amount * 0.0085
  else if (type.includes('Wallet')) fee = 25
  else if (type.includes('Instant')) fee = amount * 0.0045
  else fee = 10
  const vat = fee * 0.16
  return { base: fee, vat, total: fee + vat }
}

const fmt = (n: number) => `KES ${Math.round(n).toLocaleString('en-KE')}`

export default function Fees() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-fees'],
    queryFn: fetchFees,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  /* LEGACY BRIDGE: #calcType / #calcAmount oninput=calculateFee() */
  const [calcType, setCalcType] = useState('Inter-bank Transfer')
  const [calcAmount, setCalcAmount] = useState('250000')
  const calc = quickCalc(calcType, parseFloat(calcAmount) || 0)

  /* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
  const openM = (id: string) => setActiveModal(id)
  const closeM = () => setActiveModal(null)

  return (
    <div className={styles.feesPage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load fee data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading fee &amp; commission workspace…
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
            <button className={styles.btnPm} onClick={() => openM('complianceCheckModal')}>
              <i className="bi bi-shield-check" /> Compliance
            </button>
            <button className={styles.btnPm} onClick={() => openM('feeCalculatorModal')}>
              <i className="bi bi-calculator" /> Calculator
            </button>
            <button className={styles.btnPm} onClick={() => openM('waiverModal')}>
              <i className="bi bi-gift" /> Waivers
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('addFeeRuleModal')}>
              <i className="bi bi-plus-lg" /> New Rule
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
                <div className={`${styles.card} ${card.attention ? styles.attentionCard : ''}`} style={{ minHeight: 170 }}>
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
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('attentionFullModal')}>
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
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(item.modal)}>
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
                  <p className={styles.ss}>Frequent fee &amp; commission workflows</p>
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

          {/* ======================= 1.15.1 FEE STRUCTURE DASHBOARD ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-percent" style={{ color: 'var(--pm-primary-light)' }} /> 1.15.1 — Fee Structure
                  Dashboard
                </h3>
                <p className={styles.ss}>
                  Overview of all active fee rules, revenue collected, and performance against targets.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('feeReportModal')}>
                  <i className="bi bi-download" /> Export
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM('addFeeRuleModal')}>
                  <i className="bi bi-plus-lg" /> New Rule
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Fee Rules (47)</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Rule ID</th>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Rate</th>
                          <th>Volume</th>
                          <th>Revenue</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.feeRules.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <code>{r.id}</code>
                            </td>
                            <td>{r.name}</td>
                            <td>{r.type}</td>
                            <td>{r.rate}</td>
                            <td>{r.volume}</td>
                            <td>{r.revenue}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                            </td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('editFeeRuleModal')}>
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
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Revenue by Category</h4>
                  <div className={styles.chartBars}>
                    {config.revenueBars.map((b) => (
                      <div
                        key={b.label}
                        className={styles.chartBar}
                        style={{ height: b.height, background: b.color }}
                        onClick={() => openM(b.modal)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openM(b.modal)}
                      >
                        <span className={styles.barLabel}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex flex-wrap mt-3" style={{ gap: 10, fontSize: 12 }}>
                    {config.revenueLegend.map((l) => (
                      <span key={l.label}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: l.color,
                            marginRight: 5,
                          }}
                        />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.15.2 COMMISSION RULES & TIERS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-layers" style={{ color: 'var(--pm-accent)' }} /> 1.15.2 — Commission Rules &amp;
                  Tiers
                </h3>
                <p className={styles.ss}>
                  Tiered commission structures for agents, partners and merchants with performance tracking.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('addCommissionTierModal')}>
                  <i className="bi bi-plus-lg" /> New Tier
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Commission Tiers (12)</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Name</th>
                          <th>Volume Threshold</th>
                          <th>Rate</th>
                          <th>Agents</th>
                          <th>Paid Out</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.tiers.map((t) => (
                          <tr key={t.tier}>
                            <td>
                              <span className={`${styles.badge} ${styles[t.tone]}`}>{t.tier}</span>
                            </td>
                            <td>{t.name}</td>
                            <td>{t.threshold}</td>
                            <td>{t.rate}</td>
                            <td>{t.agents}</td>
                            <td>{t.paid}</td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('editCommissionModal')}>
                                Edit
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
                  <h4 className={styles.ubTitle}>Top Performing Agents</h4>
                  {config.topAgents.map((a) => (
                    <div className={styles.sr} key={a.name}>
                      <div>
                        <strong>{a.name}</strong>
                        <div className={styles.mutedSmall}>{a.sub}</div>
                      </div>
                      <span className={`${styles.badge} ${styles[a.tone]}`}>{a.badge}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('agentLeaderboardModal')}>
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.15.3 FEE CALCULATOR & PREVIEW ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-calculator" style={{ color: 'var(--pm-info)' }} /> 1.15.3 — Fee Calculator &amp;
                  Preview
                </h3>
                <p className={styles.ss}>
                  Interactive fee calculator with live preview for different transaction types and amounts.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('feeCalculatorModal')}>
                  <i className="bi bi-play-circle" /> Open Full Calculator
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Quick Calculator</h4>
                  <div className="mb-3">
                    <label className={styles.fl}>Transaction Type</label>
                    {/* LEGACY BRIDGE: #calcType onchange → calculateFee() */}
                    <select className={styles.fc} value={calcType} onChange={(e) => setCalcType(e.target.value)}>
                      {config.calcTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className={styles.fl}>Amount (KES)</label>
                    {/* LEGACY BRIDGE: #calcAmount oninput → calculateFee() */}
                    <input className={styles.fc} value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)} inputMode="numeric" />
                  </div>
                  <div className={styles.summaryBox}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className={styles.mutedSmall}>Base Fee</span>
                      <strong>{fmt(calc.base)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className={styles.mutedSmall}>VAT (16%)</span>
                      <strong>{fmt(calc.vat)}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className={styles.fwBold13}>Total Deducted</span>
                      <strong className={styles.textAccent} style={{ fontSize: 18 }}>
                        {fmt(calc.total)}
                      </strong>
                    </div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`} onClick={() => openM('feeCalculatorModal')}>
                    Advanced Options
                  </button>
                </div>
              </div>
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Fee Comparison</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Provider</th>
                          <th>Fee</th>
                          <th>Time</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.feeCompare.map((p) => (
                          <tr key={p.provider}>
                            <td>{p.strong ? <strong>{p.provider}</strong> : p.provider}</td>
                            <td>{p.strong ? <strong>{p.fee}</strong> : p.fee}</td>
                            <td>{p.time}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[p.tone]}`}>{p.rating}</span>
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

          {/* ======================= 1.15.4 FEE REPORTS & ANALYTICS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-file-earmark-bar-graph" style={{ color: 'var(--pm-accent)' }} /> 1.15.4 —
                  Transaction Fee Reports &amp; Analytics
                </h3>
                <p className={styles.ss}>
                  Detailed fee revenue analytics, trends, and performance by channel, product and partner.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('feeReportModal')}>
                  <i className="bi bi-download" /> Export Report
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Monthly Fee Revenue Trend</h4>
                  <div className={styles.chartBars}>
                    {config.trendBars.map((b) => (
                      <div key={b.label} className={styles.chartBar} style={{ height: b.height, background: b.color }}>
                        <span className={styles.barLabel}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Top Fee Generating Channels</h4>
                  {config.topChannels.map((c) => (
                    <div className={styles.sr} key={c.name}>
                      <div>
                        <strong>{c.name}</strong>
                      </div>
                      <div>
                        <strong>{c.value}</strong> <span className={`${styles.badge} ${styles[c.tone]}`}>{c.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.15.5 EXEMPTIONS, WAIVERS & PROMOTIONS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-gift" style={{ color: 'var(--pm-warning)' }} /> 1.15.5 — Fee Exemptions, Waivers
                  &amp; Promotions
                </h3>
                <p className={styles.ss}>
                  Manage promotional waivers, hardship cases, regulatory exemptions and partner discounts.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('waiverModal')}>
                  <i className="bi bi-plus-lg" /> New Waiver
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Waivers (8)</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Waiver ID</th>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Discount</th>
                          <th>Used</th>
                          <th>Budget</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.waivers.map((w) => (
                          <tr key={w.id}>
                            <td>
                              <code>{w.id}</code>
                            </td>
                            <td>{w.name}</td>
                            <td>{w.type}</td>
                            <td>{w.discount}</td>
                            <td>{w.used}</td>
                            <td>{w.budget}</td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('editWaiverModal')}>
                                {w.actionLabel}
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
                  <h4 className={styles.ubTitle}>Waiver Budget Utilization</h4>
                  {config.waiverBudget.map((b) => (
                    <div className="mb-3" key={b.label}>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                        <span>{b.label}</span>
                        <span>{b.pct}</span>
                      </div>
                      <div className={styles.pmProgress}>
                        <div className={styles.pmProgressBar} style={{ width: b.width, background: b.color }} />
                      </div>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM('waiverModal')}>
                    Manage All Waivers
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.15.6 SETTLEMENT, PAYOUTS & RECONCILIATION ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-cash-stack" style={{ color: 'var(--pm-purple)' }} /> 1.15.6 — Settlement,
                  Payouts &amp; Reconciliation
                </h3>
                <p className={styles.ss}>Run fee settlements, reconcile partner payouts and manage commission disbursements.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('settlementModal')}>
                  <i className="bi bi-play-circle" /> Run Settlement
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Pending Settlements</h4>
                  {config.pendingSettlements.map((s) => (
                    <div className={styles.sr} key={s.title}>
                      <div>
                        <strong>{s.title}</strong>
                        <div className={styles.mutedSmall}>{s.sub}</div>
                      </div>
                      <div>
                        <strong>{s.amount}</strong>
                        <button className={`${styles.btnPm} ${styles.btnSm} ms-2`} onClick={() => openM('settlementModal')}>
                          Settle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-7">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Settlements</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Recipients</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.recentSettlements.map((s) => (
                          <tr key={`${s.date}-${s.type}`}>
                            <td>{s.date}</td>
                            <td>{s.type}</td>
                            <td>{s.amount}</td>
                            <td>{s.recipients}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[s.tone]}`}>{s.status}</span>
                            </td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('settlementModal')}>
                                Receipt
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

          {/* ======================= 1.15.7 COMPLIANCE, AUDIT & CONFIGURATION ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-clipboard-check" style={{ color: 'var(--pm-danger)' }} /> 1.15.7 — Compliance,
                  Audit &amp; Configuration
                </h3>
                <p className={styles.ss}>Regulatory compliance checks, audit trails, fee configuration and policy management.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('complianceCheckModal')}>
                  <i className="bi bi-shield-check" /> Run Check
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Compliance Status</h4>
                  {config.compliance.map((c) => (
                    <div className={styles.sr} key={c.label}>
                      <div>
                        <strong>{c.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[c.tone]}`}>{c.status}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`} onClick={() => openM('complianceCheckModal')}>
                    Full Compliance Report
                  </button>
                </div>
              </div>
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Recent Audit Logs</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Action</th>
                          <th>User</th>
                          <th>Details</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.auditLogs.map((a) => (
                          <tr key={`${a.date}-${a.action}`}>
                            <td>{a.date}</td>
                            <td>{a.action}</td>
                            <td>{a.user}</td>
                            <td>{a.details}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[a.tone]}`}>{a.result}</span>
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
        </div>
      </div>

      {/* ======================= MODAL LAYER ======================= */}
      <FeesModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
