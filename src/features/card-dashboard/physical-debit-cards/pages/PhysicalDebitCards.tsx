import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/physical-debit-cards.module.css'
import PhysicalDebitCardsModals from '../components/PhysicalDebitCardsModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'
type DebitCardBg = 'debitStandard' | 'debitPremium' | 'debitBusiness'

interface NavItem { icon: string; active?: boolean; dot?: boolean }
interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; lines: string[]; warnBorder?: boolean; progress?: { width: string; color: string }; rawCard?: { bg: DebitCardBg; number: string; name: string } }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; iconText: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface PortfolioItem { bg: DebitCardBg; number: string; title: string; sub: string; subTone?: string; actionLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface DeliveryStep { icon: string; title: string; sub: string; done: boolean; active: boolean }
interface ActiveLimit { label: string; value: string; width: string; color: string }
interface ReplacementRow { type: string; desc: string; impact: string; actionLabel: string; actionClass?: string; modal: string }

interface PhysicalDebitCardsConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  heroActions: { label: string; modal: string }[]
  statCards: StatCard[]
  attention: AttentionItem[]
  portfolio: PortfolioItem[]
  quickActions: QuickAction[]
  issuance: {
    delivery: { title: string; badge: string; stepTitle: string; tracker: string; steps: DeliveryStep[]; note: string }
    designs: { bg: DebitCardBg; label: string; price: string }[]
  }
  controls: {
    toggles: { label: string; sub: string; on?: boolean }[]
    security: { label: string; sub: string; actionLabel: string; modal: string }[]
    limits: ActiveLimit[]
    limitsActionLabel: string
    limitsModal: string
  }
  replacements: ReplacementRow[]
}

const initialMockData: PhysicalDebitCardsConfig = {
  nav: [
    { icon: 'bi-house' },
    { icon: 'bi-grid-3x3-gap' },
    { icon: 'bi-wallet2' },
    { icon: 'bi-credit-card', active: true, dot: true },
    { icon: 'bi-arrow-left-right' },
    { icon: 'bi-bar-chart-line' },
    { icon: 'bi-shield-lock' },
  ],
  headerTitle: 'Card Command Center',
  headerSub: 'Physical, Virtual, Prepaid & Corporate Card Management',
  searchPlaceholder: 'Search cards, transactions, limits, requests...',
  user: { initials: 'CA', name: 'James K.', role: 'Cardholder' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/card-center' }],
    current: 'Physical Debit Cards',
  },
  pageCode: 'PAGE 5.2',
  pageTitle: 'Physical Debit Card Management',
  pageSub: 'Order, activate, control limits, set geo-fencing, manage PINs, and handle replacements for physical debit cards.',
  heroActions: [
    { label: 'Track Delivery', modal: 'cardDeliveryModal' },
    { label: 'Activate Card', modal: 'activateCardModal' },
    { label: 'Freeze All', modal: 'freezeCardModal' },
    { label: 'Order New Card', modal: 'orderCardModal' },
  ],
  statCards: [
    {
      key: 'primary', col: 'col-lg-5', label: '', labelColor: '', value: 'KES 145,200.00',
      lines: ['Linked to PayMo Main Wallet. Standard Debit tier.'],
      rawCard: { bg: 'debitStandard', number: '8422', name: 'JAMES KAMAU' },
    },
    {
      key: 'spend', col: 'col-lg-2 col-md-4 col-6', label: 'THIS MONTH SPEND', labelColor: 'var(--pm-primary)', value: 'KES 32k',
      badge: { icon: 'bi-graph-up', text: '14 transactions', tone: 'badgeI' },
      lines: ['POS Tap 65%', 'Online 25%', 'ATM 10%'],
    },
    {
      key: 'limit', col: 'col-lg-2 col-md-4 col-6', label: 'DAILY LIMIT USAGE', labelColor: 'var(--pm-warning)', value: '42%',
      badge: { icon: 'bi-speedometer2', text: 'KES 42k / 100k', tone: 'badgeW' },
      progress: { width: '42%', color: 'var(--pm-warning)' },
    },
    {
      key: 'security', col: 'col-lg-3 col-md-4', label: 'SECURITY POSTURE', labelColor: 'var(--pm-accent)', value: '94/100',
      badge: { icon: 'bi-shield-check', text: 'Excellent', tone: 'badgeS' },
      lines: ['Geo-fencing: Active (Kenya Only)', 'Contactless: Capped at KES 5k'],
      warnBorder: true,
    },
  ],
  attention: [
    { icon: 'bi-box-seam', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', iconText: 'ND', title: 'Premium Card Dispatched', sub: 'Arriving tomorrow via Fargo Courier', actionLabel: 'Track', actionClass: 'btnPmP', modal: 'cardDeliveryModal' },
    { icon: 'bi-asterisk', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', iconText: 'PA', title: 'Business Card Needs PIN', sub: 'Card **** 1102 activated, set PIN to use', actionLabel: 'Set PIN', modal: 'pinManagementModal' },
    { icon: 'bi-x-circle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', iconText: 'TX', title: 'Declined POS Transaction', sub: 'Naivas Supermarket · Exceeded daily tap limit', actionLabel: 'Fix', modal: 'cardLimitsModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', iconText: 'RN', title: 'Card Expiring Soon', sub: 'Card **** 9421 expires in 45 days', actionLabel: 'Renew', modal: 'renewCardModal' },
  ],
  portfolio: [
    { bg: 'debitStandard', number: '8422', title: 'Personal Standard Debit', sub: 'Active · KES 145.2k available', subTone: '', actionLabel: 'View', modal: 'viewCardDetailsModal' },
    { bg: 'debitBusiness', number: '1102', title: 'SME Business Debit', sub: 'Needs PIN · Linked to Biz Wallet', subTone: 'text-warning', actionLabel: 'PIN', modal: 'pinManagementModal' },
    { bg: 'debitPremium', number: '5591', title: 'Premium Travel Debit', sub: 'In transit · Ordered 26 Jun', subTone: 'text-info', actionLabel: 'Track', modal: 'cardDeliveryModal' },
    { bg: 'debitStandard', number: '9421', title: 'Legacy Debit Card', sub: 'Frozen · Reported compromised', subTone: 'text-danger', actionLabel: 'Replace', modal: 'replaceCardModal' },
  ],
  quickActions: [
    { icon: 'bi-upc-scan', iconColor: 'var(--pm-primary)', label: 'Activate Card', modal: 'activateCardModal' },
    { icon: 'bi-asterisk', iconColor: 'var(--pm-warning)', label: 'PIN Settings', modal: 'pinManagementModal' },
    { icon: 'bi-speedometer', iconColor: 'var(--pm-info)', label: 'Card Limits', modal: 'cardLimitsModal' },
    { icon: 'bi-globe-americas', iconColor: 'var(--pm-accent)', label: 'Geo-Fencing', modal: 'geoFencingModal' },
    { icon: 'bi-shop', iconColor: 'var(--pm-purple)', label: 'MCC Blocks', modal: 'merchantControlsModal' },
    { icon: 'bi-snow', iconColor: 'var(--pm-primary)', label: 'Freeze/Thaw', modal: 'freezeCardModal' },
    { icon: 'bi-shield-exclamation', iconColor: 'var(--pm-danger)', label: 'Report Lost', modal: 'reportLostModal' },
    { icon: 'bi-x-circle', iconColor: 'var(--pm-muted)', label: 'Cancel Card', modal: 'cancelCardModal' },
  ],
  issuance: {
    delivery: {
      title: 'Premium Travel Debit',
      badge: 'Dispatched',
      stepTitle: 'Courier',
      tracker: 'TRK-9921448',
      steps: [
        { icon: 'bi-check', title: 'Approved', sub: '25 Jun, 10:00 AM', done: true, active: false },
        { icon: 'bi-check', title: 'Printed', sub: '26 Jun, 09:15 AM', done: true, active: false },
        { icon: '3', title: 'Courier', sub: '26 Jun, 14:30 PM — Hub Nairobi', done: false, active: true },
        { icon: '4', title: 'Out for Delivery', sub: 'Pending', done: false, active: false },
        { icon: '5', title: 'Delivered', sub: 'Pending signature', done: false, active: false },
      ],
      note: 'You must provide the 4-digit Delivery OTP (8812) to the rider to receive your card.',
    },
    designs: [
      { bg: 'debitStandard', label: 'Standard', price: 'Free' },
      { bg: 'debitPremium', label: 'Premium', price: 'KES 1,000' },
      { bg: 'debitBusiness', label: 'Business', price: 'Free for SMEs' },
    ],
  },
  controls: {
    toggles: [
      { label: 'Online Transactions', sub: 'E-commerce & web', on: true },
      { label: 'International Spend', sub: 'Outside Kenya', on: false },
      { label: 'ATM Withdrawals', sub: 'Cash access', on: true },
      { label: 'Contactless (Tap-to-pay)', sub: 'NFC payments', on: true },
    ],
    security: [
      { label: 'Change Card PIN', sub: 'Requires old PIN', actionLabel: 'Change', modal: 'pinManagementModal' },
      { label: 'Reset Forgotten PIN', sub: 'Requires OTP + Auth', actionLabel: 'Reset', modal: 'resetPinModal' },
      { label: 'Geo-Fencing', sub: 'Restrict by location', actionLabel: 'Manage', modal: 'geoFencingModal' },
      { label: 'Travel Mode', sub: 'Pre-declare travel', actionLabel: 'Setup', modal: 'travelModeModal' },
    ],
    limits: [
      { label: 'Daily POS Limit', value: 'KES 42k / 100k', width: '42%', color: 'var(--pm-primary)' },
      { label: 'Daily ATM Limit', value: 'KES 0 / 40k', width: '0%', color: 'var(--pm-info)' },
    ],
    limitsActionLabel: 'Adjust All Limits',
    limitsModal: 'cardLimitsModal',
  },
  replacements: [
    { type: 'Temporary Freeze', desc: 'Misplaced card but not stolen.', impact: 'Blocks new authorizations instantly. Can be unfrozen anytime.', actionLabel: 'Freeze Card', actionClass: 'btnDanger', modal: 'freezeCardModal' },
    { type: 'Report Lost/Stolen', desc: 'Card is definitely lost or stolen.', impact: 'Permanent block. Reissues a new PAN. Stops fraud.', actionLabel: 'Report Lost', actionClass: 'btnDanger', modal: 'reportLostModal' },
    { type: 'Replace Damaged', desc: 'Chip/Magstripe broken. Same card number.', impact: 'Old card works until new card is activated.', actionLabel: 'Replace', modal: 'replaceCardModal' },
    { type: 'Cancel Card', desc: 'Close debit card permanently.', impact: 'Permanent closure. Balance returned to wallet.', actionLabel: 'Cancel', modal: 'cancelCardModal' },
  ],
}

async function fetchPhysicalDebitCards(): Promise<PhysicalDebitCardsConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/physical-debit-cards', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as PhysicalDebitCardsConfig
  } catch {
    return initialMockData
  }
}

export default function PhysicalDebitCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-physical-debit-cards'],
    queryFn: fetchPhysicalDebitCards,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.physicalDebitCards}>
      <div className={styles.main}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load card data. Showing cached data.</span>
            <button className="btn-close" onClick={() => setErrorDismissed(true)} />
          </div>
        )}

        {/* PAGE BAR */}
        <div className={styles.pageBar}>
          <div>
            <div className={styles.breadcrumb}>
              {(config.breadcrumb.parents ?? []).map((p) => (
                <span key={p.to}><Link to={p.to}>{p.label}</Link> / </span>
              ))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 className={styles.pageH2}>{config.pageCode} — {config.pageTitle}</h2>
            <p className={styles.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={styles.btnPm} onClick={() => setActiveModal('cardDeliveryModal')}><i className="bi bi-truck" /> Track Delivery</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('activateCardModal')}><i className="bi bi-check-circle" /> Activate Card</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('freezeCardModal')}><i className="bi bi-snow" /> Freeze All</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('orderCardModal')}><i className="bi bi-plus-lg" /> Order New Card</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* STAT ROW */}
          <div className="row g-3">
            {(config.statCards ?? []).map((s) => (
              <div key={s.key} className={s.col}>
                <div className={`${styles.card} ${s.key === 'primary' ? styles.cardAccent : ''}`} style={{ minHeight: 170, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}>
                  {s.key === 'primary' ? (
                    <>
                      <div className="d-flex justify-content-between">
                        <div>
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Primary Physical Card Active <span style={{ color: '#86efac' }}>●</span></p>
                          <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>{s.value}</div>
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{s.lines[0]}</p>
                        </div>
                        {s.rawCard && (
                          <div className="text-end">
                            <div className={`${styles.debitCard} ${styles[s.rawCard.bg]}`} style={{ width: 160, padding: 12, borderRadius: 8, aspectRatio: '1.586', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.2)', transform: 'none' }}>
                              <div className={styles.cardLogo} style={{ fontSize: 12 }}>PayMo</div>
                              <div className={styles.cardNumber} style={{ fontSize: 10, margin: '8px 0 4px' }}>**** **** **** {s.rawCard.number}</div>
                              <div className={styles.cardName} style={{ fontSize: 10, margin: 0 }}>{s.rawCard.name}</div>
                              <div className={styles.cardVisa} style={{ fontSize: 12, bottom: 10, right: 10 }}>VISA</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                        <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('viewCardDetailsModal')}>View Details</button>
                        <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('cardLimitsModal')}>Limits</button>
                        <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('freezeCardModal')}>Freeze</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.statLabel} style={{ color: s.labelColor }}>{s.label}</p>
                      <div className={styles.statValue} style={{ margin: '6px 0' }}>{s.value}</div>
                      {s.badge && (
                        <span className={`${styles.badge} ${styles[s.badge.tone]}`}><i className={`bi ${s.badge.icon}`} /> {s.badge.text}</span>
                      )}
                      {s.progress && (
                        <div className="mt-3"><div className={styles.progress}><div className={styles.progressBar} style={{ width: s.progress.width, background: s.progress.color }} /></div></div>
                      )}
                      {(s.lines ?? []).map((l) => (
                        <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{l}</div>
                      ))}
                      {s.key === 'limit' && (
                        <button className={`${styles.btnPm} ${styles.btnSm} mt-3 w-100`} onClick={() => setActiveModal('cardLimitsModal')}>Adjust Limits</button>
                      )}
                      {s.key === 'security' && (
                        <button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => setActiveModal('cardHealthModal')}>Security Audit</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* MAIN ACTION SECTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>Attention & Tracking</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardDeliveryModal')}>Track All</button>
                </div>
                {(config.attention ?? []).map((item) => (
                  <div key={item.title} className={styles.feedItem}>
                    <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                      {item.iconText}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm} ${item.actionClass ? styles[item.actionClass] : ''}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>Card Portfolio</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('portfolioModal')}>Manage</button>
                </div>
                {(config.portfolio ?? []).map((item) => (
                  <div key={item.number} className={styles.feedItem}>
                    <div className={`${styles.debitCard} ${styles[item.bg]} ${styles.debitCardMini} ${item.subTone === 'text-danger' ? styles.cardFrozenFilter : ''}`}>
                      <span>{item.number}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span className={item.subTone}>{item.sub}</span></div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="mb-3">
                  <h3 className={styles.sectionTitle}>Card Controls & Actions</h3>
                  <p className={styles.sectionSub}>Section 5.2.2 & 5.2.3 operations</p>
                </div>
                <div className={styles.quickActionGrid}>
                  {(config.quickActions ?? []).map((a) => (
                    <button key={a.label} className={styles.quickActionBtn} onClick={() => setActiveModal(a.modal)}>
                      <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5.2.1 — Card Issuance, Ordering & Tracking */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-2-front-fill" style={{ color: 'var(--pm-primary)' }} /> 5.2.1 — Card Issuance, Ordering & Tracking</h3>
                <p className={styles.sectionSub}>Order new personal or corporate debit cards, customize designs, and track courier delivery in real-time.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('bulkOrderModal')}><i className="bi bi-layers" /> Bulk Order (Corporate)</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('orderCardModal')}><i className="bi bi-plus-lg" /> Order New Card</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Deliveries</h4>
                  <div className="p-3 border rounded mb-3" style={{ borderLeft: '3px solid var(--pm-warning)!important' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><span style={{ fontWeight: 600, fontSize: 14 }}>{config.issuance.delivery.title}</span> <span className={`${styles.badge} ${styles.badgeW} ms-2`}>{config.issuance.delivery.badge}</span></div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardDeliveryModal')}>View Tracker</button>
                    </div>
                    <div className={`${styles.stepper} mb-2 mt-3`} style={{ marginBottom: '12px!important' }}>
                      {(config.issuance.delivery.steps ?? []).map((step, i) => (
                        <div key={i} className={step.active ? `${styles.step} ${styles.stepActive}` : step.done ? `${styles.step} ${styles.stepDone}` : styles.step}>
                          <div className={styles.stepNum}>{step.done ? <i className="bi bi-check" /> : step.icon}</div>
                          <div className={styles.stepLabel}>{step.title}</div>
                          {i < config.issuance.delivery.steps.length - 1 && <div className={styles.stepLine} style={step.done ? { background: 'var(--pm-accent)' } : {}} />}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}><i className="bi bi-truck me-1" /> Fargo Courier ({config.issuance.delivery.tracker}). Expected delivery: <strong>Tomorrow, 2:00 PM - 5:00 PM</strong> at Kilimani Office.</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={styles.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Available Card Designs</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {(config.issuance.designs ?? []).map((d) => (
                      <div key={d.label} className="border rounded p-2 text-center" style={{ width: 120, cursor: 'pointer' }} onClick={() => setActiveModal('orderCardModal')}>
                        <div className={`${styles.debitCard} ${styles[d.bg]} mb-2`} style={{ width: '100%', padding: 8, borderRadius: 6 }}><div className={styles.cardLogo} style={{ fontSize: 8 }}>PayMo</div></div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{d.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{d.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5.2.2 & 5.2.3 — Physical Card Controls & PIN Management */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-sliders" style={{ color: 'var(--pm-info)' }} /> 5.2.2 & 5.2.3 — Physical Card Controls & PIN Management</h3>
                <p className={styles.sectionSub}>Configure daily limits, geographic scopes, MCC blocking, contactless caps, and manage card PINs.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('merchantControlsModal')}><i className="bi bi-shop" /> Merchant Blocks</button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardLimitsModal')}><i className="bi bi-speedometer2" /> Setup Limits</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Transaction Toggles</h4>
                  {(config.controls.toggles ?? []).map((t) => (
                    <div key={t.label} className={styles.statusRow}>
                      <div><strong>{t.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{t.sub}</div></div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" defaultChecked={t.on} onChange={() => setActiveModal('toggleConfirmModal')} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Security & PIN</h4>
                  {(config.controls.security ?? []).map((s) => (
                    <div key={s.label} className={styles.statusRow}>
                      <div><strong>{s.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{s.sub}</div></div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(s.modal)}>{s.actionLabel}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Limits (Standard Debit)</h4>
                  {(config.controls.limits ?? []).map((l) => (
                    <div key={l.label} className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>{l.label}</span><span>{l.value}</span></div>
                      <div className={styles.progress}><div className={styles.progressBar} style={{ width: l.width, background: l.color }} /></div>
                    </div>
                  ))}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>Contactless Cap</span><span>Max KES 5,000/tap</span></div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => setActiveModal(config.controls.limitsModal)}>{config.controls.limitsActionLabel}</button>
                </div>
              </div>
            </div>
          </div>

          {/* 5.2.4 — Card Replacement, Freeze & Cancellation */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-shield-x" style={{ color: 'var(--pm-danger)' }} /> 5.2.4 — Card Replacement, Freeze & Cancellation</h3>
                <p className={styles.sectionSub}>Handle lost/stolen cards, temporary freezes, damaged card replacements, and permanent account closures securely.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className={styles.table}>
                <thead><tr><th>Action Type</th><th>Description</th><th>Impact</th><th>Action</th></tr></thead>
                <tbody>
                  {(config.replacements ?? []).map((r) => (
                    <tr key={r.type}>
                      <td data-label="Action Type"><strong>{r.type}</strong></td>
                      <td data-label="Description">{r.desc}</td>
                      <td data-label="Impact">{r.impact}</td>
                      <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm} ${r.actionClass ? styles[r.actionClass] : ''}`} style={r.actionClass === 'btnDanger' ? { background: 'var(--pm-warning)', color: '#fff', border: 'none' } : {}} onClick={() => setActiveModal(r.modal)}>{r.actionLabel}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <PhysicalDebitCardsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}