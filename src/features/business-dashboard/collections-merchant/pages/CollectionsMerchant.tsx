import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/collections-merchant.module.css'
import CollectionsMerchantModals from '../components/CollectionsMerchantModals'

/* ============================================================================
   PayMo BaaS — Collections & Merchant Services (legacy page 3.2)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; miniBars?: { height: string; color: string }[]; progress?: { percent: number; color: string }; extra?: { label: string; value: string }[] }
interface FeedItem { initials: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface MethodCard { key: string; icon: string; iconBg: string; iconColor: string; badge: { text: string; tone: BadgeTone }; title: string; desc: string; mdr: string; modal: string }
interface TxnRow { time: string; customer: string; ref: string; method: string; amount: string; status: string; statusTone: BadgeTone; modal: string }
interface ChartBar { label: string; height: string; color: string; pct: string }
interface SettlementRow { label: string; sub: string; amount: string }
interface CustomerStat { label: string; value: string }
interface CustomerRow { name: string; phone: string; segment: string; segmentTone: BadgeTone; ltv: string; last: string; modal: string }
interface DisputeItem { border: string; title: string; sub: string; amount: string; badge: { text: string; tone: BadgeTone } }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface CollectionsConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; mid: string; current: string }
  pageTitle: string
  pageSub: string
  heroStats: HeroStat[]
  attentionItems: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  methods: MethodCard[]
  txnFeed: TxnRow[]
  chartBars: ChartBar[]
  settlements: SettlementRow[]
  customerStats: CustomerStat[]
  customerRows: CustomerRow[]
  disputes: DisputeItem[]
  refunds: DisputeItem[]
}

const initialMockData: CollectionsConfig = {
  nav: [
    { icon: 'bi-house', title: 'Dashboard' },
    { icon: 'bi-shop', title: 'Collections', active: true, dot: true },
    { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll' },
    { icon: 'bi-cash-coin', title: 'Disbursements' },
    { icon: 'bi-bar-chart-line', title: 'Analytics' },
    { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Collections & Merchant Services',
  headerSub: 'Omnichannel payments, settlements, customers, and disputes',
  searchPlaceholder: 'Search transactions, customers, dispute IDs, refunds...',
  user: { initials: 'JD', name: 'Jane Doe', role: 'Finance Admin', avatarBg: 'var(--pm-gradient-slate)' },
  breadcrumb: { parent: 'Business Portal', mid: 'Commerce', current: 'Collections' },
  pageTitle: 'PAGE 3.2 — Collections & Merchant Services',
  pageSub: 'Manage your PayBill, Till, Card, and PesaLink collections. Track real-time settlements, handle refunds, and manage customer payment data.',
  heroStats: [
    { key: 'collected', col: 'col-lg-4', label: 'Collections engine is live', labelColor: 'rgba(255,255,255,.78)', value: 'KES 412,500', badge: undefined, extra: undefined },
    { key: 'pending', col: 'col-lg-2 col-md-4 col-6', label: 'PENDING SETTLEMENT', labelColor: 'var(--pm-info)', value: 'KES 89,200', badge: { icon: 'bi-bank', text: 'T+1 schedule', tone: 'badgeI' }, miniBars: [{ height: '40%', color: 'var(--pm-info)' }, { height: '70%', color: 'var(--pm-primary)' }, { height: '50%', color: 'var(--pm-info)' }, { height: '85%', color: 'var(--pm-primary)' }, { height: '60%', color: 'var(--pm-info)' }] },
    { key: 'success', col: 'col-lg-3 col-md-4 col-6', label: 'SUCCESS RATE (TODAY)', labelColor: 'var(--pm-accent)', value: '98.4%', badge: { icon: 'bi-check-circle', text: '181 successful', tone: 'badgeS' }, progress: { percent: 98.4, color: 'var(--pm-accent)' } },
    { key: 'disputes', col: 'col-lg-3 col-md-4', label: 'DISPUTES & REFUNDS', labelColor: 'var(--pm-warning)', value: '4 Active', badge: { icon: 'bi-exclamation-triangle', text: 'Needs attention', tone: 'badgeW' }, extra: [{ label: 'Pending Refunds', value: '2' }, { label: 'Open Disputes', value: '2' }] },
  ],
  attentionItems: [
    { initials: 'CB', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Chargeback received', sub: 'Visa ***4112 · KES 12,500', btnLabel: 'Defend', btnClass: 'btnPmD', modal: 'disputeModal' },
    { initials: 'RF', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Refund approval needed', sub: 'Customer: John Mark · KES 3,400', btnLabel: 'Review', modal: 'refundModal' },
    { initials: 'KYC', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'PayBill KYC update required', sub: 'Upload CR12 for PB 512234', btnLabel: 'Upload', modal: 'paybillConfigModal' },
    { initials: 'API', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'LNMO API token expires soon', sub: 'Rotate keys in 3 days', btnLabel: 'Rotate', modal: 'apiConfigModal' },
  ],
  suggestions: [
    { initials: 'QR', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Deploy Dynamic QR for delivery', sub: 'Reduce manual entry errors by 40%', btnLabel: 'Setup', modal: 'generateQRModal' },
    { initials: 'PR', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Send reminders to 14 customers', sub: 'Invoices due this week · KES 142k', btnLabel: 'Remind', modal: 'sendReminderModal' },
    { initials: 'TK', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Enable card tokenization', sub: 'Increase repeat purchase checkout speed', btnLabel: 'Enable', modal: 'cardConfigModal' },
    { initials: 'SG', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'New VIP segment detected', sub: '24 customers have spent >KES 50k', btnLabel: 'View', modal: 'customerSegmentModal' },
  ],
  quickActions: [
    { icon: 'bi-wallet2', iconColor: 'var(--pm-primary)', label: 'Collect Pay', modal: 'receivePaymentModal' },
    { icon: 'bi-qr-code', iconColor: 'var(--pm-info)', label: 'New QR', modal: 'generateQRModal' },
    { icon: 'bi-arrow-return-left', iconColor: 'var(--pm-warning)', label: 'Refund', modal: 'refundModal' },
    { icon: 'bi-shield-exclamation', iconColor: 'var(--pm-danger)', label: 'Dispute', modal: 'disputeModal' },
    { icon: 'bi-code-slash', iconColor: 'var(--pm-purple)', label: 'API Keys', modal: 'apiConfigModal' },
    { icon: 'bi-chat-dots', iconColor: 'var(--pm-accent)', label: 'Reminder', modal: 'sendReminderModal' },
    { icon: 'bi-calculator', iconColor: 'var(--pm-muted)', label: 'Calculate Fees', modal: 'feeCalculatorModal' },
    { icon: 'bi-file-earmark-spreadsheet', iconColor: 'var(--pm-primary)', label: 'Export Data', modal: 'exportReportModal' },
  ],
  methods: [
    { key: 'paybill', icon: 'bi-phone', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', badge: { text: 'Active', tone: 'badgeS' }, title: 'M-Pesa PayBill', desc: 'Shortcode 512234. Supports LNMO, STK Push & account validation.', mdr: '1.5%', modal: 'paybillConfigModal' },
    { key: 'till', icon: 'bi-shop', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', badge: { text: 'Active', tone: 'badgeS' }, title: 'M-Pesa Till (Buy Goods)', desc: 'Till number 882001. Ideal for in-person POS transactions.', mdr: '1.0%', modal: 'tillConfigModal' },
    { key: 'card', icon: 'bi-credit-card', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', badge: { text: 'Active', tone: 'badgeS' }, title: 'Card Payments', desc: 'Visa/Mastercard with 3D Secure. Tokenization ready.', mdr: '2.9%', modal: 'cardConfigModal' },
    { key: 'pesalink', icon: 'bi-bank', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', badge: { text: 'Pending', tone: 'badgeW' }, title: 'PesaLink Collections', desc: 'Real-time collections from 50+ banks. Awaiting KYC approval.', mdr: 'Fixed KES 45', modal: 'pesalinkConfigModal' },
  ],
  txnFeed: [
    { time: '14:32', customer: 'Alice W.', ref: 'TXN-892110', method: 'PayBill', amount: 'KES 4,500', status: 'Success', statusTone: 'badgeS', modal: 'txnDetailModal' },
    { time: '14:15', customer: 'John M.', ref: 'TXN-892109', method: 'Till', amount: 'KES 1,200', status: 'Success', statusTone: 'badgeS', modal: 'txnDetailModal' },
    { time: '13:40', customer: 'Sarah K.', ref: 'TXN-892108', method: 'Visa', amount: 'KES 8,500', status: 'Success', statusTone: 'badgeS', modal: 'txnDetailModal' },
    { time: '13:12', customer: 'David O.', ref: 'TXN-892107', method: 'PayBill', amount: 'KES 2,000', status: 'Failed', statusTone: 'badgeD', modal: 'txnDetailModal' },
    { time: '12:55', customer: 'Mary J.', ref: 'TXN-892106', method: 'Till', amount: 'KES 550', status: 'Success', statusTone: 'badgeS', modal: 'txnDetailModal' },
  ],
  chartBars: [
    { label: 'PayBill', height: '85%', color: 'var(--pm-accent)', pct: '62%' },
    { label: 'Till', height: '60%', color: 'var(--pm-info)', pct: '24%' },
    { label: 'Card', height: '40%', color: 'var(--pm-purple)', pct: '11%' },
    { label: 'PesaLink', height: '15%', color: 'var(--pm-warning)', pct: '3%' },
  ],
  settlements: [
    { label: 'T+0 (Today)', sub: 'M-Pesa balance', amount: 'KES 304,100' },
    { label: 'T+1 (Tomorrow)', sub: 'Card & Bank batches', amount: 'KES 89,200' },
  ],
  customerStats: [
    { label: 'VIP (>KES 50k)', value: '142' },
    { label: 'Regular', value: '810' },
    { label: 'New (30 days)', value: '252' },
  ],
  customerRows: [
    { name: 'Alice Wanjiku', phone: '0722 *** 112', segment: 'VIP', segmentTone: 'badgeP', ltv: 'KES 142,500', last: 'Today', modal: 'sendReminderModal' },
    { name: 'John Mark', phone: '0711 *** 443', segment: 'Regular', segmentTone: 'badgeS', ltv: 'KES 12,400', last: 'Today', modal: 'sendReminderModal' },
    { name: 'Sarah K.', phone: '0733 *** 991', segment: 'VIP', segmentTone: 'badgeP', ltv: 'KES 85,000', last: 'Yesterday', modal: 'sendReminderModal' },
    { name: 'David O.', phone: '0721 *** 220', segment: 'Churn Risk', segmentTone: 'badgeD', ltv: 'KES 8,000', last: '45 days ago', modal: 'sendReminderModal' },
    { name: 'Mary J.', phone: '0755 *** 881', segment: 'New', segmentTone: 'badgeI', ltv: 'KES 550', last: 'Today', modal: 'sendReminderModal' },
  ],
  disputes: [
    { border: 'var(--pm-danger)', title: 'Visa Chargeback', sub: 'TXN-892108 · Reason: Service not provided', amount: 'KES 8,500', badge: { text: '14d to respond', tone: 'badgeD' } },
    { border: 'var(--pm-warning)', title: 'M-Pesa Dispute', sub: 'Customer claims wrong amount', amount: 'KES 2,000', badge: { text: 'Under review', tone: 'badgeW' } },
  ],
  refunds: [
    { border: 'var(--pm-info)', title: 'Partial refund pending', sub: 'John Mark · TXN-892109', amount: 'KES 3,400', badge: { text: 'Awaiting approval', tone: 'badgeI' } },
    { border: 'var(--pm-accent)', title: 'Full refund completed', sub: 'Alice Wanjiku · TXN-892050', amount: 'KES 1,200', badge: { text: 'Done', tone: 'badgeS' } },
  ],
}

async function fetchCollectionsContent(): Promise<CollectionsConfig> {
  const res = await fetch('/api/business/collections-merchant')
  if (!res.ok) throw new Error('Failed to fetch collections data')
  return res.json()
}

export default function CollectionsMerchant() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['business-collections-merchant'],
    queryFn: fetchCollectionsContent,
    staleTime: 5 * 60_000,
    retry: 1,
  })
  const config = apiData ?? initialMockData

  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  if (isLoading) {
    return (
      <div className="container-fluid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className={s.spinner} />
        <span style={{ marginTop: 12, fontWeight: 600, color: 'var(--pm-primary)' }}>Loading workspace…</span>
      </div>
    )
  }

  return (
    <div className={cx(s.bizPage, 'container-fluid')}>
      {/* CONTENT */}
      <div className={s.content}>
          {/* Hero Stats Row */}
          <div className="row g-3">
            {/* Collected Today (accent card) */}
            <div className={config.heroStats[0].col}>
              <div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                      Collections engine is live <span style={{ color: '#86efac' }}>●</span>
                    </p>
                    <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>{config.heroStats[0].value}</div>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Collected today across 184 transactions.</p>
                  </div>
                  <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><i className="bi bi-wallet2" /></div>
                </div>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('receivePaymentModal')}>Collect Now</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('refundModal')}>Refund</button>
                </div>
              </div>
            </div>
            {/* Pending Settlement */}
            <div className={config.heroStats[1].col}>
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: config.heroStats[1].labelColor }}>{config.heroStats[1].label}</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>{config.heroStats[1].value}</div>
                {config.heroStats[1].badge && <span className={cx(s.badge, s[config.heroStats[1].badge.tone])}><i className={`bi ${config.heroStats[1].badge.icon}`} /> {config.heroStats[1].badge.text}</span>}
                {config.heroStats[1].miniBars && (
                  <div className={s.miniBars} style={{ marginTop: 12 }}>
                    {config.heroStats[1].miniBars.map((b, i) => (
                      <div key={i} className={s.miniBar} style={{ height: b.height, background: b.color }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Success Rate */}
            <div className={config.heroStats[2].col}>
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: config.heroStats[2].labelColor }}>{config.heroStats[2].label}</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>{config.heroStats[2].value}</div>
                {config.heroStats[2].badge && <span className={cx(s.badge, s[config.heroStats[2].badge.tone])}><i className={`bi ${config.heroStats[2].badge.icon}`} /> {config.heroStats[2].badge.text}</span>}
                {config.heroStats[2].progress && (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                      <span>Failed (3 txn)</span><span>1.6%</span>
                    </div>
                    <div className={s.progress} style={{ marginTop: 4 }}>
                      <div className={s.progressBar} style={{ width: `${config.heroStats[2].progress.percent}%`, background: config.heroStats[2].progress.color }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Disputes */}
            <div className={config.heroStats[3].col}>
              <div className={s.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-warning)' }}>
                <p className={s.sl} style={{ color: config.heroStats[3].labelColor }}>{config.heroStats[3].label}</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>{config.heroStats[3].value}</div>
                {config.heroStats[3].badge && <span className={cx(s.badge, s[config.heroStats[3].badge.tone])}><i className={`bi ${config.heroStats[3].badge.icon}`} /> {config.heroStats[3].badge.text}</span>}
                {config.heroStats[3].extra && (
                  <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                    {config.heroStats[3].extra.map((e) => (
                      <div key={e.label}>{e.label}: <strong>{e.value}</strong></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attention, Suggestions & Quick Actions */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.st}>Attention Required</h3>
                  <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('attentionDetailModal')}>View all</button>
                </div>
                {config.attentionItems.map((item) => (
                  <div key={item.title} className={s.feedItem}>
                    <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}>{item.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                    </div>
                    <button className={cx(s.btnPm, s.btnSm, s[item.btnClass ?? ''])} onClick={() => setActiveModal(item.modal)}>{item.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.st}>Smart Suggestions</h3>
                  <span className={cx(s.badge, s.badgeP)}><i className="bi bi-stars" /> AI</span>
                </div>
                {config.suggestions.map((item) => (
                  <div key={item.title} className={s.feedItem}>
                    <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}>{item.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                    </div>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(item.modal)}>{item.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3">
                  <h3 className={s.st}>Quick Actions</h3>
                  <p className={s.ss}>Frequent merchant workflows</p>
                </div>
                <div className={s.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                      <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.2.1: Payment Collection Methods */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-grid-fill" style={{ color: 'var(--pm-primary)' }} /> 3.2.1 — Payment Collection Methods</h3>
                <p className={s.ss}>Manage your active payment rails, integrations, and POS channels.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('apiConfigModal')}><i className="bi bi-code" /> API</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('receivePaymentModal')}>New Transaction</button>
              </div>
            </div>
            <div className="row g-3">
              {config.methods.map((m) => (
                <div key={m.key} className="col-md-3">
                  <div className={s.methodCard} onClick={() => setActiveModal(m.modal)}>
                    <div className="d-flex justify-content-between mb-3">
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: m.iconBg, color: m.iconColor }}><i className={`bi ${m.icon}`} /></div>
                      <span className={cx(s.badge, s[m.badge.tone])}>{m.badge.text}</span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>{m.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--pm-muted)', margin: '0 0 12px', flex: 1 }}>{m.desc}</p>
                    <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-auto">
                      <span style={{ fontSize: 12, fontWeight: 600 }}>MDR: {m.mdr}</span>
                      <i className="bi bi-chevron-right text-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3.2.2: Collections Dashboard & Settlement */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-bar-chart-line-fill" style={{ color: 'var(--pm-info)' }} /> 3.2.2 — Collections Dashboard & Settlement</h3>
                <p className={s.ss}>Monitor live transaction feeds, analyze volume trends, and track bank settlements.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('analyticsModal')}><i className="bi bi-graph-up" /> Deep Analytics</button>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Live Transaction Feed</h4>
                    <div className={cx(s.pills)}>
                      <button className={cx(s.pill, s.pillActive)}>All</button>
                      <button className={s.pill}>Successful</button>
                      <button className={s.pill}>Failed</button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Time</th><th>Customer</th><th>Ref</th><th>Method</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {config.txnFeed.map((t) => (
                          <tr key={t.ref}>
                            <td>{t.time}</td>
                            <td>{t.customer}</td>
                            <td><code>{t.ref}</code></td>
                            <td>{t.method}</td>
                            <td><strong>{t.amount}</strong></td>
                            <td><span className={cx(s.badge, s[t.statusTone])}>{t.status}</span></td>
                            <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(t.modal)}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={cx(s.utilityBlock, 'mb-3')}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Collection Breakdown</h4>
                  <div className={s.chartBars}>
                    {config.chartBars.map((cb) => (
                      <div key={cb.label} className={s.chartBar} style={{ height: cb.height, background: cb.color }}>
                        <span className={s.barLabel}>{cb.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-2" style={{ fontSize: 11 }}>
                    {config.chartBars.map((cb) => (
                      <span key={cb.label}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: cb.color, marginRight: 4 }} />
                        {cb.label}: {cb.pct}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Settlement Pipeline</h4>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('settlementModal')}>View</button>
                  </div>
                  {config.settlements.map((sr) => (
                    <div key={sr.label} className={s.statusRow}>
                      <div><strong>{sr.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sr.sub}</div></div>
                      <strong>{sr.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.2.3: Customer Management */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-people-fill" style={{ color: 'var(--pm-purple)' }} /> 3.2.3 — Customer Management</h3>
                <p className={s.ss}>Customer directory, lifetime value tracking, communication and segmentation.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('sendReminderModal')}><i className="bi bi-chat-dots" /> Message</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('addCustomerModal')}><i className="bi bi-person-plus" /> Add Customer</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-3">
                <div className={cx(s.utilityBlock, 'text-center')}>
                  <div className={cx(s.iconCircle, 'mx-auto mb-2')} style={{ background: 'var(--pm-purple-soft)', color: 'var(--pm-purple)', width: 48, height: 48, fontSize: 20 }}>
                    <i className="bi bi-star" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>1,204</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--pm-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total Customers</div>
                  <hr className={s.divider} />
                  {config.customerStats.map((cs) => (
                    <div key={cs.label} className="d-flex justify-content-between text-start mb-2" style={{ fontSize: 12 }}>
                      <span>{cs.label}</span><strong>{cs.value}</strong>
                    </div>
                  ))}
                  <button className={cx(s.btnPm, s.btnSm, 'w-100 mt-3')} onClick={() => setActiveModal('customerSegmentModal')}>Manage Segments</button>
                </div>
              </div>
              <div className="col-lg-9">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between mb-3">
                    <div className={cx(s.headerSearch)} style={{ maxWidth: 300 }}>
                      <i className="bi bi-search" />
                      <input type="text" placeholder="Search customer name or phone" />
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Customer Name</th><th>Contact</th><th>Segment</th><th>LTV</th><th>Last Payment</th><th>Action</th></tr></thead>
                      <tbody>
                        {config.customerRows.map((c) => (
                          <tr key={c.name}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.phone}</td>
                            <td><span className={cx(s.badge, s[c.segmentTone])}>{c.segment}</span></td>
                            <td>{c.ltv}</td>
                            <td>{c.last}</td>
                            <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(c.modal)}>Msg</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.2.4: Refund & Dispute Management */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-shield-exclamation" style={{ color: 'var(--pm-warning)' }} /> 3.2.4 — Refund & Dispute Management</h3>
                <p className={s.ss}>Process full/partial refunds, manage chargebacks, and track resolution workflows.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('refundModal')}><i className="bi bi-arrow-return-left" /> Process Refund</button>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Active Disputes (Chargebacks)</h4>
                    <span className={cx(s.badge, s.badgeW)}>2 Action Required</span>
                  </div>
                  {config.disputes.map((d) => (
                    <div key={d.title} className="p-3 border rounded mb-2" style={{ background: '#fff', borderLeft: `3px solid ${d.border} !important`, borderLeftColor: d.border }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div><strong>{d.title}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{d.sub}</div></div>
                        <div><div style={{ fontWeight: 700 }}>{d.amount}</div><span className={cx(s.badge, s[d.badge.tone])}>{d.badge.text}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Refunds</h4>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('refundModal')}>New Refund</button>
                  </div>
                  {config.refunds.map((r) => (
                    <div key={r.title} className="p-3 border rounded mb-2" style={{ background: '#fff', borderLeftColor: r.border }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div><strong>{r.title}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r.sub}</div></div>
                        <div><div style={{ fontWeight: 700 }}>{r.amount}</div><span className={cx(s.badge, s[r.badge.tone])}>{r.badge.text}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* MODALS */}
      <CollectionsMerchantModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
