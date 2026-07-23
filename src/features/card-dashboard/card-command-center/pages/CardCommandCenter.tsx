import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/card-command-center.module.css'
import CardCommandCenterModals from '../components/CardCommandCenterModals'

/* ============================================================================
   PayMo BaaS — Card Command Center (legacy page 5.1)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; to: string; label: string; active?: boolean; dot?: boolean }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; lines: string[]; warnBorder?: boolean }
interface CardItem { id: string; type: string; number: string; name: string; expiry: string; balance: string; gradient: string; logo: string; frozen?: boolean; actions: { label: string; icon: string; modal: string; btnClass?: string }[] }
interface FeedItem { id: string; icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionModal: string }
interface HealthItem { title: string; sub: string; actionLabel?: string; actionModal?: string; icon?: string }
interface BudgetItem { label: string; used: string; total: string; percent: number; color: string }
interface TransactionRow { date: string; card: string; cardIcon: string; merchant: string; category: string; amount: string; status: string; statusTone: BadgeTone; actionModal: string }
interface ChartBar { label: string; height: string; color: string }
interface SubscriptionRow { service: string; icon: string; iconColor: string; card: string; cycle: string; avg: string; lastPaid: string; nextDue: string; status: string; statusTone: BadgeTone; actionModal: string }

interface CardCommandCenterConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  quickActions: QuickAction[]
  statCards: StatCard[]
  cards: CardItem[]
  attention: FeedItem[]
  portfolio: CardItem[]
  health: { score: number; items: HealthItem[] }
  analytics: { bars: ChartBar[]; budgets: BudgetItem[] }
  transactions: TransactionRow[]
  subscriptions: SubscriptionRow[]
}

const initialMockData: CardCommandCenterConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/transfers', label: 'Transfers' },
    { icon: 'bi-wallet2', to: '/banking', label: 'Banking' },
    { icon: 'bi-credit-card', to: '/cards', label: 'Cards', active: true, dot: true },
    { icon: 'bi-arrow-left-right', to: '/transactions', label: 'Activity' },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics' },
    { icon: 'bi-shield-lock', to: '/security', label: 'Security' },
  ],
  headerTitle: 'Card Command Center',
  headerSub: 'Manage physical, virtual debit, credit, and prepaid cards',
  searchPlaceholder: 'Search cards, transactions, merchants...',
  user: { initials: 'MN', name: 'James K.', role: 'Cardholder' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Dashboard 5', to: '/cards' }],
    current: 'Card Command Center',
  },
  pageCode: 'PAGE 5.1',
  pageTitle: 'Card Command Center',
  pageSub: 'Full visibility and control over all active cards, spending analytics, budget limits, security, and transactions.',
  quickActions: [
    { icon: 'bi-snow', iconColor: 'var(--pm-info)', label: 'Freeze/Thaw', modal: 'freezeCardModal' },
    { icon: 'bi-asterisk', iconColor: 'var(--pm-warning)', label: 'Change PIN', modal: 'changePinModal' },
    { icon: 'bi-shield-exclamation', iconColor: 'var(--pm-danger)', label: 'Report Lost', modal: 'reportLostModal' },
    { icon: 'bi-speedometer2', iconColor: 'var(--pm-accent)', label: 'Set Limit', modal: 'tempLimitModal' },
    { icon: 'bi-wifi', iconColor: 'var(--pm-primary)', label: 'Contactless', modal: 'contactlessLimitModal' },
    { icon: 'bi-globe', iconColor: 'var(--pm-purple)', label: 'Online Txn', modal: 'onlineTransactionsModal' },
    { icon: 'bi-credit-card-2-front', iconColor: 'var(--pm-ink-soft)', label: 'Pay Bill', modal: 'payCardBillModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-ink-soft)', label: 'Transfer', modal: 'transferBetweenCardsModal' },
  ],
  statCards: [
    { key: 'active', col: 'col-lg-3 col-md-6', label: 'ACTIVE CARDS', labelColor: 'var(--pm-primary)', value: '4 Cards', badge: { icon: 'bi-credit-card', text: '2 Virtual / 1 Physical / 1 Credit', tone: 'badgeI' }, lines: [] },
    { key: 'credit', col: 'col-lg-3 col-md-6', label: 'AVAILABLE CREDIT', labelColor: 'var(--pm-primary)', value: 'KES 145,000', badge: { icon: 'bi-wallet2', text: 'Limit: KES 250,000', tone: 'badgeI' }, lines: ['Used: KES 105,000'] },
    { key: 'prepaid', col: 'col-lg-3 col-md-6', label: 'PREPAID BALANCE', labelColor: 'var(--pm-accent)', value: 'KES 32,450', badge: { icon: 'bi-arrow-up', text: 'Top-up Ready', tone: 'badgeS' }, lines: ['Across 2 prepaid virtual cards'] },
    { key: 'spend', col: 'col-lg-3 col-md-6', label: "MONTH'S SPEND", labelColor: 'var(--pm-warning)', value: 'KES 118,200', badge: { icon: 'bi-graph-up-arrow', text: '+12% vs last month', tone: 'badgeW' }, lines: ['Budget used: 85%'], warnBorder: true },
  ],
  cards: [
    { id: 'card1', type: 'Premium Credit', number: '**** 4921', name: 'JAMES KAMAU', expiry: '12/28', balance: 'KES 145,000', gradient: 'bankCardBg1', logo: 'VISA', frozen: false, actions: [
      { label: 'Freeze', icon: 'bi-snow', modal: 'freezeCardModal' },
      { label: 'CVV', icon: 'bi-eye', modal: 'showCvvModal' },
    ]},
    { id: 'card2', type: 'Virtual Debit', number: '**** 8810', name: 'ONLINE SPEND', expiry: '04/27', balance: 'KES 18,200', gradient: 'bankCardBg2', logo: 'Mastercard', frozen: false, actions: [
      { label: 'Freeze', icon: 'bi-snow', modal: 'freezeCardModal' },
      { label: 'Copy', icon: 'bi-files', modal: 'showCvvModal' },
    ]},
    { id: 'card3', type: 'Physical Debit', number: '**** 3105', name: 'JAMES KAMAU', expiry: '09/26', balance: 'Linked to Main Acct', gradient: 'bankCardBg3', logo: 'VISA', frozen: true, actions: [
      { label: 'Unfreeze', icon: 'bi-fire', modal: 'freezeCardModal', btnClass: 'pm-btn-accent' },
      { label: 'Replace', icon: 'bi-arrow-repeat', modal: 'replaceCardModal' },
    ]},
  ],
  attention: [
    { id: 'at1', icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Scheduled transfer to landlord failed', sub: 'KES 35,000 · Insufficient funds', actionLabel: 'Retry', actionModal: 'retryTransferModal' },
    { id: 'at2', icon: 'bi-clock', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '3 recurring payments need funding source update', sub: 'M-Pesa number changed', actionLabel: 'Update', actionModal: 'manageBeneficiariesModal' },
    { id: 'at3', icon: 'bi-shield-exclamation', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Large transfer (KES 450,000) pending approval', sub: 'Requires 2FA confirmation', actionLabel: 'Approve', actionModal: 'initiateTransferModal' },
  ],
  portfolio: [
    { id: 'p1', type: 'Personal Standard Debit', number: '8422', name: 'JAMES KAMAU', expiry: '', balance: 'KES 145.2k', gradient: 'bankCardBg3', logo: 'PayMo', frozen: false, actions: [{ label: 'View', icon: 'bi-eye', modal: 'viewCardDetailsModal' }] },
    { id: 'p2', type: 'SME Business Debit', number: '1102', name: 'JAMES KAMAU', expiry: '', balance: 'Linked to Biz Wallet', gradient: 'bankCardBg4', logo: 'PayMo Biz', frozen: false, actions: [{ label: 'PIN', icon: 'bi-asterisk', modal: 'pinManagementModal' }] },
    { id: 'p3', type: 'Premium Travel Debit', number: '5591', name: 'JAMES KAMAU', expiry: '', balance: 'In transit', gradient: 'bankCardBg1', logo: 'PayMo', frozen: false, actions: [{ label: 'Track', icon: 'bi-truck', modal: 'cardDeliveryModal' }] },
    { id: 'p4', type: 'Legacy Debit Card', number: '9421', name: 'JAMES KAMAU', expiry: '', balance: 'Frozen', gradient: 'bankCardBg2', logo: 'PayMo', frozen: true, actions: [{ label: 'Replace', icon: 'bi-arrow-repeat', modal: 'replaceCardModal' }] },
  ],
  health: {
    score: 85,
    items: [
      { title: 'Expiry Management', sub: 'Card ****3105 expiring in 72 days', actionLabel: 'Review', actionModal: 'autoRenewalModal' },
      { title: '3D Secure Setup', sub: 'All active cards enrolled', icon: 'bi-check-circle-fill' },
      { title: 'International Txn', sub: 'Allowed on Virtual Debit ****8810', actionLabel: 'Manage', actionModal: 'internationalTransactionsModal' },
    ],
  },
  analytics: {
    bars: [
      { label: 'Groceries', height: '80%', color: 'var(--pm-warning)' },
      { label: 'Dining', height: '45%', color: 'var(--pm-info)' },
      { label: 'Transport', height: '60%', color: 'var(--pm-purple)' },
      { label: 'Online', height: '95%', color: 'var(--pm-primary)' },
      { label: 'Health', height: '30%', color: 'var(--pm-accent)' },
    ],
    budgets: [
      { label: 'Overall Card Spend', used: 'KES 118,200', total: 'KES 140,000', percent: 85, color: 'var(--pm-warning)' },
      { label: 'Online Purchases (Virtual)', used: 'KES 42,000', total: 'KES 50,000', percent: 84, color: 'var(--pm-primary)' },
      { label: 'Dining & Entertainment', used: 'KES 18,500', total: 'KES 30,000', percent: 61, color: 'var(--pm-info)' },
    ],
  },
  transactions: [
    { date: 'Today, 14:20', card: '****4921', cardIcon: 'bi-credit-card', merchant: 'Carrefour Supermarket', category: 'Groceries', amount: 'KES 12,450.00', status: 'Approved', statusTone: 'badgeS', actionModal: 'transactionDetailsModal' },
    { date: 'Today, 09:15', card: '****8810', cardIcon: 'bi-globe', merchant: 'Netflix.com', category: 'Entertainment', amount: 'KES 1,200.00', status: 'Approved', statusTone: 'badgeS', actionModal: 'transactionDetailsModal' },
    { date: 'Yesterday', card: '****4921', cardIcon: 'bi-credit-card', merchant: 'Shell Petrol Station', category: 'Transport', amount: 'KES 4,000.00', status: 'Approved', statusTone: 'badgeS', actionModal: 'transactionDetailsModal' },
    { date: '26 Jun 2025', card: '****8810', cardIcon: 'bi-globe', merchant: 'Amazon AWS', category: 'Online', amount: 'USD 45.00', status: 'Declined', statusTone: 'badgeD', actionModal: 'transactionDetailsModal' },
    { date: '24 Jun 2025', card: '****3105', cardIcon: 'bi-credit-card', merchant: 'ATM Withdrawal', category: 'Cash', amount: 'KES 10,000.00', status: 'Approved', statusTone: 'badgeS', actionModal: 'transactionDetailsModal' },
  ],
  subscriptions: [
    { service: 'Netflix', icon: 'bi-play-btn-fill', iconColor: 'var(--pm-danger)', card: 'Sub Master (**9021)', cycle: 'Monthly (26th)', avg: 'KES 1,400', lastPaid: 'Yesterday', nextDue: '26 Jul', status: 'Active', statusTone: 'badgeS', actionModal: 'manageSingleSubModal' },
    { service: 'Apple Music', icon: 'bi-apple', iconColor: 'var(--pm-ink)', card: 'Sub Master (**9021)', cycle: 'Monthly (22nd)', avg: 'KES 400', lastPaid: '22 Jun', nextDue: '22 Jul', status: 'Active', statusTone: 'badgeS', actionModal: 'manageSingleSubModal' },
    { service: 'Microsoft 365', icon: 'bi-microsoft', iconColor: 'var(--pm-info)', card: 'Office Exp (**1184)', cycle: 'Annual (14 Aug)', avg: 'KES 12,000', lastPaid: 'Aug 2024', nextDue: '14 Aug 2025', status: 'Active', statusTone: 'badgeS', actionModal: 'manageSingleSubModal' },
    { service: 'Spotify', icon: 'bi-spotify', iconColor: 'var(--pm-success)', card: 'Global Web (**3841)', cycle: 'Monthly (05th)', avg: 'KES 300', lastPaid: '05 Jun', nextDue: '05 Jul', status: 'Unused alert', statusTone: 'badgeW', actionModal: 'cancelSubModal' },
    { service: 'AWS Hosting', icon: 'bi-cloud-arrow-up', iconColor: 'var(--pm-warning)', card: 'AWS & Host (**4418)', cycle: 'Monthly (28th)', avg: 'KES 4,500', lastPaid: '28 May', nextDue: 'Tomorrow', status: 'Fund required', statusTone: 'badgeD', actionModal: 'topUpCardModal' },
  ],
}

async function fetchCardCommandCenter(): Promise<CardCommandCenterConfig> {
  // Frontend-only demo: /api/card-command-center has no backend yet. Try the
  // real endpoint when present, otherwise fall back to mock data so SSR does
  // not throw on the origin-less relative fetch and the page renders content
  // (rather than an error banner) on the server.
  try {
    const res = await fetch('/api/card-command-center', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as CardCommandCenterConfig
  } catch {
    return initialMockData
  }
}

export default function CardCommandCenter() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-card-command-center'],
    queryFn: fetchCardCommandCenter,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.cardCommandCenterPage}>
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
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load card data. Showing cached data.</span>
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
            <button className={styles.btnPm} onClick={() => setActiveModal('securityScoreModal')}><i className="bi bi-shield-check" /> Security</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('subscriptionManageModal')}><i className="bi bi-arrow-repeat" /> Subscriptions</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('issueCardModal')}><i className="bi bi-plus-lg" /> Issue Card</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            {config.statCards.map((s) => (
              <div key={s.key} className={s.col}>
                <div className={styles.card} style={{ minHeight: 160, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-warning)' } : {}) }}>
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

          {/* QUICK ACTIONS + CARD PORTFOLIO + HEALTH */}
          <div className="row g-3">
            <div className="col-lg-3">
              <div className={styles.card} style={{ height: '100%' }}>
                <h3 className={`${styles.st} mb-3`}>Quick Actions</h3>
                <div className={styles.quickGrid}>
                  {config.quickActions.map((a) => (
                    <button key={a.label} className={styles.quickBtn} onClick={() => setActiveModal(a.modal)}>
                      <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              <div className={styles.card} style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}><i className="bi bi-credit-card-2-back-fill" style={{ color: 'var(--pm-primary)' }} /> Card Portfolio Overview</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('addCardModal')}>Add Card</button>
                </div>
                <div className="row g-3">
                  {config.cards.map((c) => (
                    <div key={c.id} className="col-md-4">
                      <div className={`${styles.bankCard} ${styles[c.gradient]} ${c.frozen ? styles.bankCardFrozen : ''}`} onClick={() => setActiveModal('cardDetailsModal')}>
                        {c.frozen && <div className={styles.frozenOverlay}><i className="bi bi-snow me-2"></i>FROZEN</div>}
                        <div className="d-flex justify-content-between align-items-start">
                          <div className={styles.bankCardType}>{c.type}</div>
                          <div className={styles.bankCardLogo}>{c.logo}</div>
                        </div>
                        <div className={styles.bankCardChip} />
                        <div className={styles.bankCardNumber}><span>****</span><span>****</span><span>****</span><span>{c.number.replace('**** ', '')}</span></div>
                        <div className={styles.bankCardBottom}>
                          <div><div className={styles.bankCardName}>{c.name}</div><div style={{ fontSize: 11, opacity: 0.8 }}>{c.balance}</div></div>
                          <div className={styles.bankCardExp}>{c.expiry}</div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between mt-2 px-1">
                        {c.actions.map((a) => (
                          <button key={a.label} className={`${styles.btnPm} ${styles.btnSm} ${a.btnClass || ''}`} style={{ flex: 1, fontSize: 11 }} onClick={() => setActiveModal(a.modal)}>
                            <i className={`bi ${a.icon}`} /> {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HEALTH & SECURITY + ANALYTICS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card} style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}><i className="bi bi-shield-check text-success" /> Health & Security</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('securityScoreModal')}>Details</button>
                </div>
                <div className="text-center mb-4">
                  <div style={{ position: 'relative', display: 'inline-block', width: 120, height: 120, borderRadius: '50%', border: '8px solid var(--pm-accent-soft)', borderTopColor: 'var(--pm-accent)', borderRightColor: 'var(--pm-accent)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'var(--pm-font-display)' }}>
                      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--pm-accent)', lineHeight: 1 }}>{config.health.score}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm-muted)' }}>SCORE</div>
                    </div>
                  </div>
                </div>
                {config.health.items.map((item) => (
                  <div key={item.title} className={styles.sr}>
                    <div><strong>{item.title}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div></div>
                    {item.actionLabel ? (
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(item.actionModal!)}>{item.actionLabel}</button>
                    ) : (
                      <i className={`bi ${item.icon} text-success`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-8">
              <div className={styles.card} style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}><i className="bi bi-pie-chart text-warning" /> Spending Analytics & Budgets</h3>
                  <div className="d-flex gap-2">
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('budgetSettingsModal')}>Budgets</button>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('merchantAnalyticsModal')}>Merchants</button>
                  </div>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 style={{ fontWeight: 700, fontSize: 13 }}>Spend by Category (This Month)</h6>
                    <div className={styles.chartBars}>
                      {config.analytics.bars.map((b) => (
                        <div key={b.label} className={styles.chartBar} style={{ height: b.height, background: b.color }} onClick={() => setActiveModal('merchantAnalyticsModal')}>
                          <span className={styles.barLabel}>{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ fontWeight: 700, fontSize: 13 }}>Budget Tracking</h6>
                    {config.analytics.budgets.map((b) => (
                      <div key={b.label} className="mb-3">
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: 11 }}><span>{b.label}</span><span>{b.used} / {b.total}</span></div>
                        <div className={styles.progress}><div className={styles.progressBar} style={{ width: `${b.percent}%`, background: b.color }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT CARD ACTIVITY */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={styles.st}><i className="bi bi-list-ul text-muted" /> Recent Card Activity</h3>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('configureAlertsModal')}><i className="bi bi-bell" /> Alerts Setup</button>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead><tr><th>Date</th><th>Card</th><th>Merchant</th><th>Category</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {config.transactions.map((t) => (
                    <tr key={t.date + t.merchant}>
                      <td data-label="Date">{t.date}</td>
                      <td data-label="Card"><span className={styles.badge} style={{ background: '#f3f4f6', color: '#333' }}><i className={`bi ${t.cardIcon} me-1`}></i> {t.card}</span></td>
                      <td data-label="Merchant"><strong>{t.merchant}</strong></td>
                      <td data-label="Category">{t.category}</td>
                      <td data-label="Amount">{t.amount}</td>
                      <td data-label="Status"><span className={`${styles.badge} ${styles[t.statusTone]}`}>{t.status}</span></td>
                      <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(t.actionModal)}>Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CardCommandCenterModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
