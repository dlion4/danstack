import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/virtual-debit-cards.module.css'
import VirtualDebitCardsModals from '../components/VirtualDebitCardsModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'
type CardBg = 'vCardBg1' | 'vCardBg2' | 'vCardBg3' | 'vCardBg4' | 'vCardBg5' | 'vCardBgFrozen'
type CardStatus = 'active' | 'low' | 'frozen'

interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; lines: string[]; warnBorder?: boolean; miniBars?: { height: string; color: string }[]; progress?: { width: string; color: string } }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; iconText: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; iconText: string; title: string; sub: string; actionLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface VirtualCard { alias: string; pan: string; exp: string; cvv: string; net: string; bg: CardBg; bal: string; status: CardStatus }
interface ActivityItem { icon: string; iconColor: string; title: string; status: string; statusColor: string; card: string; amount: string; time: string }
interface Subscription { service: string; icon: string; iconColor: string; card: string; cycle: string; avg: string; lastPaid: string; nextDue: string; status: string; statusTone: BadgeTone; actionLabel: string; actionClass?: string; actionModal: string }

interface VirtualDebitCardsConfig {
  statCards: StatCard[]
  attention: AttentionItem[]
  suggestions: SuggestionItem[]
  quickActions: QuickAction[]
  virtualCards: VirtualCard[]
  cardOptions: string[]
  securityControls: { title: string; items: { label: string; sub: string; actionLabel: string; actionClass?: string; modal: string }[] }[]
  recentActivity: ActivityItem[]
  subscriptions: Subscription[]
}

const initialMockData: VirtualDebitCardsConfig = {
  statCards: [
    { key: 'spend', col: 'col-lg-2 col-md-4 col-6', label: 'TOTAL MONTHLY SPEND', labelColor: 'var(--pm-primary)', value: 'KES 48,200', badge: { icon: 'bi-graph-up', text: '+12% this month', tone: 'badgeI' }, lines: [], miniBars: [
      { height: '45%', color: 'var(--pm-primary)' },
      { height: '60%', color: 'var(--pm-primary)' },
      { height: '35%', color: 'var(--pm-info)' },
      { height: '80%', color: 'var(--pm-primary)' },
      { height: '90%', color: 'var(--pm-danger)' },
      { height: '60%', color: 'var(--pm-primary)' },
    ] },
    { key: 'subs', col: 'col-lg-3 col-md-4 col-6', label: 'ACTIVE SUBSCRIPTIONS', labelColor: 'var(--pm-warning)', value: '8 services', badge: { icon: 'bi-clock', text: '3 due this week', tone: 'badgeW' }, lines: [], progress: { width: '40%', color: 'var(--pm-warning)' } },
    { key: 'secured', col: 'col-lg-3 col-md-4', label: 'SECURED BY PAYMO', labelColor: 'var(--pm-accent)', value: 'KES 12,400', badge: { icon: 'bi-shield-check', text: 'Blocked attempts', tone: 'badgeS' }, lines: ['Frozen cards: <strong>1</strong>', 'Single-use burned: <strong>4</strong>'], warnBorder: true },
  ],
  attention: [
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', iconText: 'AL', title: 'Declined: Insufficient Funds', sub: 'AWS Web Services · KES 4,500', actionLabel: 'Fund', actionClass: 'btnPmD', modal: 'topUpCardModal' },
    { icon: 'bi-clock', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', iconText: 'EX', title: 'Card expiring in 15 days', sub: 'Global Shopping Card · **3841', actionLabel: 'Renew', modal: 'renewCardModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', iconText: 'SB', title: 'Subscription increased', sub: 'Netflix · +KES 300 this month', actionLabel: 'Review', modal: 'subManagerModal' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', iconText: '3D', title: 'Pending 3D Secure Auth', sub: 'AliExpress · KES 2,100', actionLabel: 'Approve', modal: 'auth3DSModal' },
  ],
  suggestions: [
    { icon: 'bi-lightning-charge', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', iconText: 'LC', title: 'Lock card to single merchant', sub: 'Secure your Netflix card further', actionLabel: 'Lock', modal: 'merchantLockModal' },
    { icon: 'bi-credit-card-2-front', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', iconText: 'CV', title: 'Enable Dynamic CVV', sub: 'Rotate CVV daily on Shopping Card', actionLabel: 'Enable', modal: 'rotateCvvModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', iconText: 'IN', title: 'Unused subscription detected', sub: 'Spotify not used in 60 days', actionLabel: 'Cancel', modal: 'cancelSubModal' },
    { icon: 'bi-sliders', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', iconText: 'LM', title: 'Lower spending limit', sub: 'Freelance Services card rarely uses >KES 10k', actionLabel: 'Adjust', modal: 'editLimitsModal' },
  ],
  quickActions: [
    { icon: 'bi-credit-card', iconColor: 'var(--pm-primary)', label: 'New Card', modal: 'createCardModal' },
    { icon: 'bi-lightning-charge', iconColor: 'var(--pm-warning)', label: 'Single-Use', modal: 'singleUseCardModal' },
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-accent)', label: 'Top-up Card', modal: 'topUpCardModal' },
    { icon: 'bi-arrow-down-circle', iconColor: 'var(--pm-danger)', label: 'Withdraw', modal: 'withdrawCardModal' },
    { icon: 'bi-snow', iconColor: 'var(--pm-info)', label: 'Freeze', modal: 'freezeCardModal' },
    { icon: 'bi-arrow-repeat', iconColor: 'var(--pm-purple)', label: 'Subs Hub', modal: 'subManagerModal' },
    { icon: 'bi-file-earmark-text', iconColor: 'var(--pm-muted)', label: 'Statements', modal: 'cardStatementModal' },
    { icon: 'bi-shield-exclamation', iconColor: 'var(--pm-danger)', label: 'Report Fraud', modal: 'reportFraudModal' },
  ],
  virtualCards: [
    { alias: 'Global Web Shopping', pan: '4532 8821 0092 3841', exp: '12/28', cvv: '882', net: 'VISA', bg: 'vCardBg1', bal: 'KES 12,500 avail', status: 'active' },
    { alias: 'Subscription Master', pan: '5123 9901 2244 9021', exp: '08/29', cvv: '***', net: 'MASTERCARD', bg: 'vCardBg2', bal: 'KES 50,000 limit', status: 'active' },
    { alias: 'AWS & Hosting', pan: '4532 1100 8872 4418', exp: '01/27', cvv: '***', net: 'VISA', bg: 'vCardBg3', bal: 'KES 0.00 avail', status: 'low' },
    { alias: 'Single-Use Burner', pan: '5123 0000 0000 1192', exp: '06/25', cvv: '***', net: 'MASTERCARD', bg: 'vCardBg5', bal: 'KES 1,500 lock', status: 'active' },
    { alias: 'Travel & Booking', pan: '4532 6610 9921 5504', exp: '11/26', cvv: '***', net: 'VISA', bg: 'vCardBgFrozen', bal: 'KES 0.00 avail', status: 'frozen' },
  ],
  cardOptions: [
    'Global Web Shopping — **3841',
    'Subscription Master — **9021',
    'AWS & Hosting — **4418',
  ],
  securityControls: [
    {
      title: 'State & Access',
      items: [
        { label: 'Card Status', sub: 'Active and accepting charges', actionLabel: 'Freeze', modal: 'freezeCardModal' },
        { label: 'Terminate Card', sub: 'Permanently delete this card', actionLabel: 'Delete', actionClass: 'btnPmDSoft', modal: 'deleteCardModal' },
        { label: 'Card Alias', sub: 'Global Web Shopping', actionLabel: 'Edit', modal: 'editAliasModal' },
      ],
    },
    {
      title: 'Advanced Protection',
      items: [
        { label: 'Merchant Lock', sub: 'Lock to Amazon only', actionLabel: 'Manage', modal: 'merchantLockModal' },
        { label: 'Dynamic CVV', sub: 'Auto-rotates every 24h', actionLabel: 'Enable', modal: 'rotateCvvModal' },
        { label: 'Spending Limit', sub: 'KES 50,000 / month', actionLabel: 'Adjust', modal: 'editLimitsModal' },
      ],
    },
  ],
  recentActivity: [
    { icon: 'bi-amazon', iconColor: 'var(--pm-ink)', title: 'AWS Web Services', status: 'Declined · Insufficient Funds', statusColor: 'var(--pm-danger)', card: 'Card **4418', amount: 'KES 4,500', time: 'Today, 10:15 AM' },
    { icon: 'bi-play-btn-fill', iconColor: 'var(--pm-danger)', title: 'Netflix Subscription', status: 'Approved', statusColor: 'var(--pm-accent)', card: 'Card **9021', amount: 'KES 1,400', time: 'Yesterday' },
    { icon: 'bi-bag-check', iconColor: 'var(--pm-primary)', title: 'AliExpress Shopping', status: 'Approved · 3DS', statusColor: 'var(--pm-accent)', card: 'Card **3841', amount: 'KES 6,240', time: '25 Jun' },
    { icon: 'bi-apple', iconColor: 'var(--pm-ink)', title: 'Apple Services', status: 'Approved', statusColor: 'var(--pm-accent)', card: 'Card **9021', amount: 'KES 400', time: '22 Jun' },
  ],
  subscriptions: [
    { service: 'Netflix', icon: 'bi-play-btn-fill', iconColor: 'text-danger', card: 'Sub Master (**9021)', cycle: 'Monthly (26th)', avg: 'KES 1,400', lastPaid: 'Yesterday', nextDue: '26 Jul', status: 'Active', statusTone: 'badgeS', actionLabel: 'Manage', actionModal: 'manageSingleSubModal' },
    { service: 'Apple Music', icon: 'bi-apple', iconColor: 'text-dark', card: 'Sub Master (**9021)', cycle: 'Monthly (22nd)', avg: 'KES 400', lastPaid: '22 Jun', nextDue: '22 Jul', status: 'Active', statusTone: 'badgeS', actionLabel: 'Manage', actionModal: 'manageSingleSubModal' },
    { service: 'Microsoft 365', icon: 'bi-microsoft', iconColor: 'text-info', card: 'Office Exp (**1184)', cycle: 'Annual (14 Aug)', avg: 'KES 12,000', lastPaid: 'Aug 2024', nextDue: '14 Aug 2025', status: 'Active', statusTone: 'badgeS', actionLabel: 'Manage', actionModal: 'manageSingleSubModal' },
    { service: 'Spotify', icon: 'bi-spotify', iconColor: 'text-success', card: 'Global Web (**3841)', cycle: 'Monthly (05th)', avg: 'KES 300', lastPaid: '05 Jun', nextDue: '05 Jul', status: 'Unused alert', statusTone: 'badgeW', actionLabel: 'Cancel', actionModal: 'cancelSubModal' },
    { service: 'AWS Hosting', icon: 'bi-cloud-arrow-up', iconColor: 'text-dark', card: 'AWS & Host (**4418)', cycle: 'Monthly (28th)', avg: 'KES 4,500', lastPaid: '28 May', nextDue: 'Tomorrow', status: 'Fund required', statusTone: 'badgeD', actionLabel: 'Fund Card', actionClass: 'btnPmP', actionModal: 'topUpCardModal' },
  ],
}

async function fetchVirtualDebitCards(): Promise<VirtualDebitCardsConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/virtual-debit-cards', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as VirtualDebitCardsConfig
  } catch {
    return initialMockData
  }
}

export default function VirtualDebitCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-virtual-debit-cards'],
    queryFn: fetchVirtualDebitCards,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const getCardBadge = (status: CardStatus): string => {
    if (status === 'active') return 'ACTIVE'
    if (status === 'frozen') return 'FROZEN'
    return 'LOW FUNDS'
  }

  const getPanDisplay = (pan: string): string => {
    return `**** **** **** ${pan.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    )
  }

  if (error && !errorDismissed) {
    return (
      <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
        <span><i className="bi bi-exclamation-triangle me-2" />Failed to load card data. Showing cached data.</span>
        <button className="btn-close" onClick={() => setErrorDismissed(true)} />
      </div>
    )
  }

  return (
    <div className={styles.virtualDebitCards}>
      {/* PAGE BAR */}
      <div className={styles.pageBar}>
        <div>
          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link> / <Link to="/cards/app">Cards</Link> / <strong>Virtual Debit Cards</strong>
          </div>
          <h2 className={styles.pageH2}>PAGE 5.3 — Virtual Debit Card Center</h2>
          <p className={styles.pageSub}>Create and manage multiple virtual debit cards for safer online shopping, compartmentalized subscriptions, and single-use e-commerce transactions.</p>
        </div>
        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
          <button className={styles.btnPm} onClick={() => setActiveModal('cardSecurityModal')}><i className="bi bi-shield-lock" /> Security</button>
          <button className={styles.btnPm} onClick={() => setActiveModal('subManagerModal')}><i className="bi bi-arrow-repeat" /> Subscriptions</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('createCardModal')}><i className="bi bi-plus-lg" /> Create Virtual Card</button>
        </div>
      </div>

      {/* HERO ROW */}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
              Virtual issuance engine is live <span style={{ color: '#86efac' }}>●</span>
            </p>
            <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>5 active virtual cards</div>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Used for global shopping, Netflix, AWS hosting, and secure single-use purchases.</p>
          </div>
        </div>
        {config.statCards.map((s) => (
          <div key={s.key} className={s.col}>
            <div className={styles.card} style={{ minHeight: 170, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}>
              <p className={styles.statLabel} style={{ color: s.labelColor }}>{s.label}</p>
              <div className={styles.statValue} style={{ margin: '6px 0' }}>{s.value}</div>
              <span className={`${styles.badge} ${styles[s.badge.tone]}`}>
                <i className={`bi ${s.badge.icon}`} /> {s.badge.text}
              </span>
              {s.miniBars && (
                <div className={`${styles.miniBars} mt-3`}>
                  {s.miniBars.map((bar, i) => (
                    <div key={i} className={styles.miniBar} style={{ height: bar.height, background: bar.color }} />
                  ))}
                </div>
              )}
              {s.progress && (
                <div className="mt-2"><div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>Total recurring</span><span>KES 14,500/mo</span></div><div className={styles.progress}><div className={styles.progressBar} style={{ width: s.progress.width, background: s.progress.color }} /></div></div>
              )}
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
              <h3 className={styles.sectionTitle}>Attention Required</h3>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('attentionModal')}>View all</button>
            </div>
            {config.attention.map((item) => (
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
              <h3 className={styles.sectionTitle}>Smart Suggestions</h3>
              <span className={`${styles.badge} ${styles.badgeP}`}><i className="bi bi-stars" /> AI</span>
            </div>
            {config.suggestions.map((item) => (
              <div key={item.title} className={styles.feedItem}>
                <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                  {item.iconText}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                </div>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className={styles.card}>
            <div className="mb-3">
              <h3 className={styles.sectionTitle}>Quick Actions</h3>
              <p className={styles.sectionSub}>Frequent card operations</p>
            </div>
            <div className={styles.quickActionGrid}>
              {config.quickActions.map((a) => (
                <button key={a.label} className={styles.quickActionBtn} onClick={() => setActiveModal(a.modal)}>
                  <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VIRTUAL CARD ISSUANCE */}
      <div className={styles.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-fill" style={{ color: 'var(--pm-primary)' }} /> 5.3.1 — Virtual Card Issuance & Portfolio</h3>
            <p className={styles.sectionSub}>Manage your active virtual cards. Click on any card to reveal details, copy numbers, or manage security settings.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('bulkCreateModal')}><i className="bi bi-files" /> Bulk Issue</button>
            <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('createCardModal')}><i className="bi bi-plus-lg" /> Issue New Card</button>
          </div>
        </div>
        <div className={styles.vCardGrid}>
          {config.virtualCards.map((card) => (
            <div key={card.alias} className={`${styles.vCard} ${styles[card.bg]}`} onClick={() => setActiveModal('viewCardDetailsModal')}>
              <div className={styles.vCardBadge} style={card.status === 'low' ? { background: 'rgba(239,68,68,0.8)' } : {}}>{getCardBadge(card.status)}</div>
              <div className={styles.vCardLogo}>PayMo</div>
              <div className={styles.vCardChip} />
              <div className={styles.vCardNumber}>{getPanDisplay(card.pan)}</div>
              <div className={styles.vCardDetails}>
                <div>{card.alias.toUpperCase()}</div>
                <div>{card.exp}</div>
              </div>
              <div className={styles.vCardNetwork}>{card.net}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS & SECURITY */}
      <div className="row g-3">
        <div className="col-lg-7">
          <div className={`${styles.card} h-100`}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-shield-lock-fill" style={{ color: 'var(--pm-accent)' }} /> 5.3.2 — Card Details & Security Controls</h3>
                <p className={styles.sectionSub}>Advanced security settings for selected virtual cards.</p>
              </div>
              <div className={styles.pills}>
                <button className={`${styles.pill} ${styles.pillActive}`}>Security</button>
                <button className={styles.pill} onClick={() => setActiveModal('editLimitsModal')}>Limits</button>
              </div>
            </div>
            <div className="mb-3">
              <select className={styles.formControl}>
                {config.cardOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="row g-3">
              {config.securityControls.map((group) => (
                <div key={group.title} className="col-md-6">
                  <div className={styles.utilityBlock}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>{group.title}</h4>
                    {group.items.map((item) => (
                      <div key={item.label} className="d-flex justify-content-between align-items-center mb-3">
                        <div style={{ fontSize: 13 }}>
                          <strong>{item.label}</strong>
                          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                        </div>
                        <button className={`${styles.btnPm} ${styles.btnSm} ${item.actionClass ? styles[item.actionClass] : ''}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className={`${styles.card} h-100`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Card Activity</h3>
              </div>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardStatementModal')}>View All</button>
            </div>
            {config.recentActivity.map((item) => (
              <div key={item.title} className={styles.feedItem}>
                <div className={styles.iconCircle} style={{ background: 'var(--pm-surface-2)', color: item.iconColor, fontSize: 14, border: '1px solid var(--pm-border)' }}>
                  <i className={`bi ${item.icon}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: item.statusColor }}>{item.status}</div>
                  <div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{item.card}</div>
                </div>
                <div className="text-end">
                  <strong>{item.amount}</strong><br />
                  <span style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{item.time}</span>
                </div>
              </div>
            ))}
            <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => setActiveModal('disputeTxModal')}>
              <i className="bi bi-exclamation-triangle" style={{ color: 'var(--pm-warning)' }} /> Dispute a transaction
            </button>
          </div>
        </div>
      </div>

      {/* ONLINE SUBSCRIPTIONS */}
      <div className={styles.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={styles.sectionTitle}><i className="bi bi-arrow-repeat" style={{ color: 'var(--pm-purple)' }} /> 5.3.3 — Online Subscriptions & E-commerce</h3>
            <p className={styles.sectionSub}>Auto-detected recurring payments linked to your virtual cards. Manage, block, or migrate subscriptions.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('addSubscriptionModal')}><i className="bi bi-plus" /> Add Sub</button>
            <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('subManagerModal')}><i className="bi bi-gear" /> Manage All</button>
          </div>
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Virtual Card</th>
                <th>Billing Cycle</th>
                <th>Avg Amount</th>
                <th>Last Paid</th>
                <th>Next Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {config.subscriptions.map((sub) => (
                <tr key={sub.service}>
                  <td data-label="Service">
                    <div className="d-flex align-items-center gap-2">
                      <div className={`${styles.subIcon} ${sub.iconColor}`}><i className={`bi ${sub.icon}`} /></div>
                      <strong>{sub.service}</strong>
                    </div>
                  </td>
                  <td data-label="Card">{sub.card}</td>
                  <td data-label="Billing Cycle">{sub.cycle}</td>
                  <td data-label="Avg Amount">KES {sub.avg.replace('KES ', '')}</td>
                  <td data-label="Last Paid">{sub.lastPaid}</td>
                  <td data-label="Next Due">{sub.nextDue}</td>
                  <td data-label="Status"><span className={`${styles.badge} ${styles[sub.statusTone]}`}>{sub.status}</span></td>
                  <td data-label="Actions">
                    <button className={`${styles.btnPm} ${styles.btnSm} ${sub.actionClass ? styles[sub.actionClass] : ''}`} onClick={() => setActiveModal(sub.actionModal)}>{sub.actionLabel}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <VirtualDebitCardsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}