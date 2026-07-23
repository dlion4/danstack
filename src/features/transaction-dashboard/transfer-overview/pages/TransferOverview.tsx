import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/transfer-overview.module.css'
import TransferOverviewModals from '../components/TransferOverviewModals'

/* ============================================================================
   PayMo BaaS — Transfer Overview Command Center (legacy page 1.1)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; to: string; label: string; active?: boolean; dot?: boolean }
interface SrItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface TransferRow { date: string; beneficiary: string; amount: string; method: string; status: string; statusTone: BadgeTone; ref: string; actionLabel: string; actionModal: string }
interface ChannelRow { name: string; transfers: string; amount: string }
interface ScheduledRow { schedule: string; beneficiary: string; amount: string; frequency: string; nextRun: string; status: string; statusTone: BadgeTone; actionLabel: string }
interface Favorite { name: string; account: string; type: string; color: string }
interface TopRecipient { name: string; amount: string }
interface SuccessRate { channel: string; rate: string; tone: BadgeTone }
interface TrendBar { month: string; height: string; color: string }

interface TransferConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: { live: string; value: string; detail: string; actions: { label: string; modal: string }[] }
  statCards: { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; lines: string[]; warnBorder?: boolean }[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  recentTransfers: TransferRow[]
  channels: ChannelRow[]
  favorites: Favorite[]
  scheduled: ScheduledRow[]
  topRecipients: TopRecipient[]
  successRates: SuccessRate[]
  trendBars: TrendBar[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: TransferConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers', active: true, dot: true },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-bank', to: '/banking', label: 'Banking' },
    { icon: 'bi-people-fill', to: '/customers', label: 'Customers' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Transfer Overview Command Center',
  headerSub: 'Initiate transfers, schedule payments, manage beneficiaries, and monitor money movement',
  searchPlaceholder: 'Search transfers, beneficiaries, references...',
  user: { initials: 'JK', name: 'James K.', role: 'Relationship Manager' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Transfers', to: '/select-dashboard' }],
    current: 'Command Center',
  },
  pageCode: 'PAGE 1.1',
  pageTitle: 'Transfer Overview Command Center',
  pageSub: 'Initiate instant transfers, schedule recurring payments, manage beneficiaries, and monitor all money movement across M-Pesa, banks, and internal wallets.',
  hero: {
    live: 'Transfer center is live',
    value: 'KES 2.84M transferred',
    detail: 'This month across 1,248 transactions. 98.7% success rate.',
    actions: [
      { label: 'Send', modal: 'initiateTransferModal' },
      { label: 'Bulk', modal: 'bulkTransferModal' },
      { label: 'Schedule', modal: 'scheduleTransferModal' },
    ],
  },
  statCards: [
    { key: 'completed', col: 'col-lg-2 col-md-4 col-6', label: 'COMPLETED', labelColor: 'var(--pm-accent)', value: '1,189', badge: { icon: 'bi-check-circle', text: '98.7%', tone: 'badgeS' }, lines: ['Avg time: 12 seconds'] },
    { key: 'pending', col: 'col-lg-3 col-md-4 col-6', label: 'PENDING / SCHEDULED', labelColor: 'var(--pm-info)', value: '47', badge: { icon: 'bi-clock', text: '32 today', tone: 'badgeI' }, lines: ['Next execution: Today 3:00 PM'] },
    { key: 'failed', col: 'col-lg-3 col-md-4', label: 'FAILED / REJECTED', labelColor: 'var(--pm-warning)', value: '12', badge: { icon: 'bi-exclamation-triangle', text: '1.0%', tone: 'badgeW' }, lines: ['Most common: Insufficient funds'], warnBorder: true },
  ],
  attention: [
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Scheduled transfer to landlord failed', sub: 'KES 35,000 · Insufficient funds', actionLabel: 'Retry', modal: 'retryTransferModal' },
    { icon: 'bi-clock', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '3 recurring payments need funding source update', sub: 'M-Pesa number changed', actionLabel: 'Update', modal: 'manageBeneficiariesModal' },
    { icon: 'bi-shield-exclamation', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Large transfer (KES 450,000) pending approval', sub: 'Requires 2FA confirmation', actionLabel: 'Approve', modal: 'initiateTransferModal' },
  ],
  suggestions: [
    { icon: 'bi-lightning-charge', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Set up auto-pay for 4 recurring bills', sub: 'Save 3 hours/month', actionLabel: 'Setup', modal: 'scheduleTransferModal' },
    { icon: 'bi-people', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Add 6 frequent contacts as favorites', sub: 'Faster transfers', actionLabel: 'Add', modal: 'manageBeneficiariesModal' },
    { icon: 'bi-graph-up', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Your rent transfer is due in 4 days', sub: 'KES 45,000 to Landlord', actionLabel: 'Pay Early', modal: 'initiateTransferModal' },
  ],
  quickActions: [
    { icon: 'bi-send', iconColor: 'var(--pm-primary)', label: 'Send Money', modal: 'initiateTransferModal' },
    { icon: 'bi-collection', iconColor: 'var(--pm-info)', label: 'Bulk Transfer', modal: 'bulkTransferModal' },
    { icon: 'bi-calendar-event', iconColor: 'var(--pm-accent)', label: 'Schedule', modal: 'scheduleTransferModal' },
    { icon: 'bi-person-plus', iconColor: 'var(--pm-warning)', label: 'Beneficiaries', modal: 'manageBeneficiariesModal' },
    { icon: 'bi-clock-history', iconColor: 'var(--pm-purple)', label: 'History', modal: 'transferHistoryModal' },
    { icon: 'bi-sliders', iconColor: 'var(--pm-accent)', label: 'Limits', modal: 'transferLimitsModal' },
    { icon: 'bi-globe', iconColor: 'var(--pm-danger)', label: 'International', modal: 'internationalTransferModal' },
    { icon: 'bi-qr-code', iconColor: 'var(--pm-primary)', label: 'QR Pay', modal: 'qrPayModal' },
  ],
  recentTransfers: [
    { date: '27 Jun', beneficiary: 'Grace Kamau', amount: 'KES 12,500', method: 'M-Pesa', status: 'Success', statusTone: 'badgeS', ref: 'TRF-448291', actionLabel: 'Details', actionModal: 'transferDetailModal' },
    { date: '26 Jun', beneficiary: 'Landlord Properties', amount: 'KES 45,000', method: 'Bank', status: 'Success', statusTone: 'badgeS', ref: 'TRF-447820', actionLabel: 'Details', actionModal: 'transferDetailModal' },
    { date: '25 Jun', beneficiary: 'James Ochieng', amount: 'KES 8,200', method: 'Internal', status: 'Success', statusTone: 'badgeS', ref: 'TRF-447103', actionLabel: 'Details', actionModal: 'transferDetailModal' },
    { date: '24 Jun', beneficiary: 'Equity Bank', amount: 'KES 120,000', method: 'Bank', status: 'Pending', statusTone: 'badgeI', ref: 'TRF-446991', actionLabel: 'Track', actionModal: 'retryTransferModal' },
    { date: '23 Jun', beneficiary: 'Safaricom', amount: 'KES 1,500', method: 'M-Pesa', status: 'Success', statusTone: 'badgeS', ref: 'TRF-446450', actionLabel: 'Details', actionModal: 'transferDetailModal' },
  ],
  channels: [
    { name: 'M-Pesa', transfers: '612 transfers', amount: 'KES 1.24M' },
    { name: 'Bank Transfer', transfers: '298 transfers', amount: 'KES 892K' },
    { name: 'Internal Wallet', transfers: '187 transfers', amount: 'KES 412K' },
    { name: 'International', transfers: '51 transfers', amount: 'KES 296K' },
  ],
  favorites: [
    { name: 'Grace Kamau', account: '0712 345 890', type: 'M-Pesa', color: '#10B981' },
    { name: 'Landlord Properties', account: 'Bank 0012345678', type: 'Bank', color: '#3B82F6' },
    { name: 'James Ochieng', account: '0722 111 222', type: 'M-Pesa', color: '#10B981' },
    { name: 'Equity Bank', account: '0012345678', type: 'Bank', color: '#3B82F6' },
  ],
  scheduled: [
    { schedule: 'Rent', beneficiary: 'Landlord Properties', amount: 'KES 45,000', frequency: 'Monthly', nextRun: '01 Jul 2025', status: 'Active', statusTone: 'badgeS', actionLabel: 'Edit' },
    { schedule: 'Salary Advance', beneficiary: 'Grace Kamau', amount: 'KES 15,000', frequency: 'Bi-weekly', nextRun: '28 Jun 2025', status: 'Active', statusTone: 'badgeS', actionLabel: 'Edit' },
    { schedule: 'Internet Bill', beneficiary: 'Safaricom Fibre', amount: 'KES 5,999', frequency: 'Monthly', nextRun: '01 Jul 2025', status: 'Paused', statusTone: 'badgeW', actionLabel: 'Resume' },
  ],
  topRecipients: [
    { name: 'Grace Kamau', amount: 'KES 187,500' },
    { name: 'Landlord Properties', amount: 'KES 135,000' },
    { name: 'Equity Bank', amount: 'KES 120,000' },
    { name: 'Safaricom', amount: 'KES 42,000' },
  ],
  successRates: [
    { channel: 'M-Pesa', rate: '99.4%', tone: 'badgeS' },
    { channel: 'Bank Transfer', rate: '97.8%', tone: 'badgeS' },
    { channel: 'Internal', rate: '100%', tone: 'badgeS' },
    { channel: 'International', rate: '94.1%', tone: 'badgeW' },
  ],
  trendBars: [
    { month: 'Jan', height: '55%', color: 'var(--pm-primary)' },
    { month: 'Feb', height: '68%', color: 'var(--pm-primary)' },
    { month: 'Mar', height: '82%', color: 'var(--pm-warning)' },
    { month: 'Apr', height: '75%', color: 'var(--pm-primary)' },
    { month: 'May', height: '90%', color: 'var(--pm-accent)' },
    { month: 'Jun', height: '100%', color: 'var(--pm-primary)' },
  ],
}

/* ---------- data fetch (falls back to mock on error) ---------- */
async function fetchTransferOverview(): Promise<TransferConfig> {
  const res = await fetch('/api/transfer-overview', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as TransferConfig
}

export default function TransferOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-transfer-overview'],
    queryFn: fetchTransferOverview,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.transferPage}>
      {/* MAIN */}
      <div className={styles.main}>
        {/* LOADING */}
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {/* ERROR */}
        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load transfer data. Showing cached data.</span>
            <button className="btn-close" onClick={() => setErrorDismissed(true)} />
          </div>
        )}

        {/* PAGE BAR */}
        <div className={styles.pageBar}>
          <div>
            <div className={styles.breadcrumb}>
              {config.breadcrumb.parents.map((p) => (
                <span key={p.to}><Link to={p.to}>{p.label}</Link> / </span>
              ))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 className={styles.pageH2}>{config.pageCode} — {config.pageTitle}</h2>
            <p className={styles.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={styles.btnPm} onClick={() => setActiveModal('transferHistoryModal')}>
              <i className="bi bi-clock-history" /> History
            </button>
            <button className={styles.btnPm} onClick={() => setActiveModal('scheduleTransferModal')}>
              <i className="bi bi-calendar-event" /> Schedule
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('initiateTransferModal')}>
              <i className="bi bi-send" /> Send Money
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                  {config.hero.live} <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff' }}>{config.hero.value}</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.actions.map((a) => (
                    <button key={a.label} className={`${styles.btnPm} ${styles.btnSm}`}
                      style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }}
                      onClick={() => setActiveModal(a.modal)}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((s) => (
              <div key={s.key} className={s.col}>
                <div className={styles.card} style={{ minHeight: 170, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-warning)' } : {}) }}>
                  <p className={styles.sl} style={{ color: s.labelColor }}>{s.label}</p>
                  <div className={styles.sv} style={{ margin: '6px 0' }}>{s.value}</div>
                  <span className={`${styles.badge} ${styles[s.badge.tone]}`}>
                    <i className={`bi ${s.badge.icon}`} /> {s.badge.text}
                  </span>
                  {s.lines.map((l) => (
                    <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}>Attention Required</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('attentionModal')}>View all</button>
                </div>
                {config.attention.map((item) => (
                  <div key={item.title} className={styles.sr}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}>Smart Suggestions</h3>
                  <span className={`${styles.badge} ${styles.badgeP}`}><i className="bi bi-stars" /> AI</span>
                </div>
                {config.suggestions.map((item) => (
                  <div key={item.title} className={styles.sr}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent transfer workflows</p>
                </div>
                <div className={styles.quickGrid}>
                  {config.quickActions.map((a) => (
                    <button key={a.label} className={styles.quickBtn} onClick={() => setActiveModal(a.modal)}>
                      <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TRANSFER PORTFOLIO OVERVIEW */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}><i className="bi bi-speedometer2" style={{ color: 'var(--pm-primary)' }} /> Transfer Portfolio Overview</h3>
                <p className={styles.ss}>Real-time view of all transfer activity, success rates, and spending patterns.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('transferAnalyticsModal')}>
                  <i className="bi bi-bar-chart" /> Analytics
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('initiateTransferModal')}>
                  <i className="bi bi-plus-lg" /> New Transfer
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Recent Transfers</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead><tr><th>Date</th><th>Beneficiary</th><th>Amount</th><th>Method</th><th>Status</th><th>Ref</th><th>Action</th></tr></thead>
                      <tbody>
                        {config.recentTransfers.map((t) => (
                          <tr key={t.ref}>
                            <td>{t.date}</td>
                            <td>{t.beneficiary}</td>
                            <td><strong>{t.amount}</strong></td>
                            <td>{t.method}</td>
                            <td><span className={`${styles.badge} ${styles[t.statusTone]}`}>{t.status}</span></td>
                            <td>{t.ref}</td>
                            <td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(t.actionModal)}>{t.actionLabel}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Transfer Channels</h4>
                  {config.channels.map((ch) => (
                    <div key={ch.name} className={styles.sr}>
                      <div><strong>{ch.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{ch.transfers}</div></div>
                      <strong>{ch.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAVORITES & BENEFICIARIES */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}><i className="bi bi-star-fill" style={{ color: 'var(--pm-warning)' }} /> Favorites & Frequent Beneficiaries</h3>
                <p className={styles.ss}>Quick-send to your most used recipients with one tap.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('manageBeneficiariesModal')}>
                  <i className="bi bi-gear" /> Manage
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('addBeneficiaryModal')}>
                  <i className="bi bi-plus-lg" /> Add
                </button>
              </div>
            </div>
            <div className="row g-2">
              {config.favorites.map((f) => (
                <div key={f.name} className="col-6 col-md-3">
                  <div className={styles.card} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('favoritesQuickModal')}>
                    <div className="d-flex align-items-center gap-2">
                      <div className={styles.iconCircle} style={{ background: f.color, color: '#fff' }}>
                        <i className="bi bi-person" />
                      </div>
                      <div>
                        <strong>{f.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{f.account}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SCHEDULED & RECURRING */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}><i className="bi bi-calendar-check" style={{ color: 'var(--pm-accent)' }} /> Scheduled & Recurring Transfers</h3>
                <p className={styles.ss}>Manage your automated payments and upcoming scheduled transfers.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('scheduleTransferModal')}>
                  <i className="bi bi-plus-lg" /> New Schedule
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead><tr><th>Schedule</th><th>Beneficiary</th><th>Amount</th><th>Frequency</th><th>Next Run</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {config.scheduled.map((s) => (
                    <tr key={s.schedule}>
                      <td>{s.schedule}</td>
                      <td>{s.beneficiary}</td>
                      <td><strong>{s.amount}</strong></td>
                      <td>{s.frequency}</td>
                      <td>{s.nextRun}</td>
                      <td><span className={`${styles.badge} ${styles[s.statusTone]}`}>{s.status}</span></td>
                      <td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('editScheduleModal')}>{s.actionLabel}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANALYTICS SNAPSHOT */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}><i className="bi bi-graph-up-arrow" style={{ color: 'var(--pm-info)' }} /> Transfer Analytics Snapshot</h3>
                <p className={styles.ss}>Spending patterns, success rates, and top recipients.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('transferAnalyticsModal')}>Full Analytics</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Top Recipients (30 days)</h4>
                  {config.topRecipients.map((r) => (
                    <div key={r.name} className={styles.sr}><div><strong>{r.name}</strong></div><strong>{r.amount}</strong></div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Success Rate by Channel</h4>
                  {config.successRates.map((s) => (
                    <div key={s.channel} className={styles.sr}><div><strong>{s.channel}</strong></div><span className={`${styles.badge} ${styles[s.tone]}`}>{s.rate}</span></div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Monthly Trend</h4>
                  <div className={styles.chartBars} style={{ height: 90 }}>
                    {config.trendBars.map((b) => (
                      <div key={b.month} className={styles.chartBar} style={{ height: b.height, background: b.color }}>
                        <span className={styles.barLabel}>{b.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <TransferOverviewModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
