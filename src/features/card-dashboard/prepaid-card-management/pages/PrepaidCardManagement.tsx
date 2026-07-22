import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/prepaid-card-management.module.css'
import PrepaidCardManagementModals from '../components/PrepaidCardManagementModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; active?: boolean; dot?: boolean }
interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; lines?: string[]; warnBorder?: boolean; miniBars?: { height: string; color: string }[]; progress?: { width: string; color: string } }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; iconText: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface CardItem { id: string; type: 'virtual' | 'physical' | 'frozen'; bg: string; number: string; title: string; sub: string; balance: string; expiry: string; brand: string; statusBadge?: { text: string; tone: BadgeTone }; actions: { label: string; modal: string; actionClass?: string }[]; borderDanger?: boolean }
interface AutoReloadRule { card: string; desc: string; badge: string; tone: BadgeTone }
interface Restriction { label: string; desc: string; actionLabel: string; modal: string }
interface TransactionRow { date: string; card: string; merchant: string; category: string; amount: string; status: string; statusTone: BadgeTone; actionLabel: string; actionModal: string }

interface PrepaidCardManagementConfig {
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
  suggestions: SuggestionItem[]
  quickActions: QuickAction[]
  cards: CardItem[]
  autoReloadRules: AutoReloadRule[]
  restrictions: Restriction[]
  transactions: TransactionRow[]
}

const initialMockData: PrepaidCardManagementConfig = {
  nav: [
    { icon: 'bi-house' },
    { icon: 'bi-wallet2' },
    { icon: 'bi-credit-card', active: true, dot: true },
    { icon: 'bi-arrow-left-right' },
    { icon: 'bi-bar-chart-line' },
    { icon: 'bi-shield-check' },
    { icon: 'bi-gear' },
  ],
  headerTitle: 'Card Center',
  headerSub: 'Issue, fund, control, and monitor your prepaid card portfolio',
  searchPlaceholder: 'Search cards by last 4 digits, cardholder, or status...',
  user: { initials: 'AK', name: 'Alex K.', role: 'Fleet Manager' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/cards' }],
    current: 'Prepaid Card Management',
  },
  pageCode: 'PAGE 5.5',
  pageTitle: 'Prepaid Card Management',
  pageSub: 'Issue physical/virtual prepaid cards for family, staff, or fleet. Manage balances, limits, and restrictions in real-time.',
  heroActions: [
    { label: 'Bulk Issue', modal: 'bulkIssueModal' },
    { label: 'Bulk Top-up', modal: 'bulkTopupModal' },
    { label: 'Issue New Card', modal: 'issueCardModal' },
  ],
  statCards: [
    {
      key: 'primary', col: 'col-lg-4', label: '', labelColor: '', value: '12 Active Cards',
      lines: ['4 Physical, 8 Virtual. Used for fleet fuel, online software, and staff expenses.'],
    },
    {
      key: 'balance', col: 'col-lg-2 col-md-4 col-6', label: 'TOTAL PREPAID BALANCE', labelColor: 'var(--pm-info)', value: 'KES 142.5K',
      badge: { icon: 'bi-wallet2', text: 'Available', tone: 'badgeI' },
      miniBars: [
        { height: '40%', color: 'var(--pm-primary)' },
        { height: '60%', color: 'var(--pm-info)' },
        { height: '30%', color: 'var(--pm-primary)' },
        { height: '80%', color: 'var(--pm-info)' },
        { height: '50%', color: 'var(--pm-primary)' },
        { height: '90%', color: 'var(--pm-info)' },
      ],
    },
    {
      key: 'spend', col: 'col-lg-3 col-md-4 col-6', label: 'SPEND THIS MONTH', labelColor: 'var(--pm-warning)', value: 'KES 88.2K',
      badge: { icon: 'bi-graph-up-arrow', text: '+12% vs last month', tone: 'badgeW' },
      progress: { width: '44%', color: 'var(--pm-warning)' },
      lines: ['Budget Limit'],
    },
    {
      key: 'lowbal', col: 'col-lg-3 col-md-4', label: 'LOW BALANCE CARDS', labelColor: 'var(--pm-accent)', value: '3 Cards',
      badge: { icon: 'bi-exclamation-circle', text: 'Needs top-up', tone: 'badgeD' },
      lines: ['Fleet Card #4 — KES 150', 'Marketing Ads — KES 450'],
      warnBorder: true,
    },
  ],
  attention: [
    { icon: 'bi-x-octagon', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', iconText: 'TX', title: 'Transaction Declined', sub: 'Fleet Card #2 · Insufficient Funds', actionLabel: 'Fund', actionClass: 'btnDanger', modal: 'topupCardModal' },
    { icon: 'bi-hourglass-split', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', iconText: 'EX', title: 'Card Expiring Soon', sub: 'Virtual Ads Card · Exp: 07/25', actionLabel: 'Renew', modal: 'replaceCardModal' },
    { icon: 'bi-shield-lock', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', iconText: 'FS', title: 'Unusual Online Spend', sub: 'Staff Card · KES 15,000 at Amazon', actionLabel: 'Review', modal: 'disputeTxModal' },
  ],
  suggestions: [
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Set Auto-Reload', sub: 'Avoid declines on Marketing Ads Card', actionLabel: 'Setup', modal: 'autoReloadModal' },
    { icon: 'bi-geo-alt', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Enable Geo-Blocking', sub: 'Lock Fleet cards to Kenya only', actionLabel: 'Apply', modal: 'geoBlockModal' },
    { icon: 'bi-archive', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Freeze Unused Card', sub: 'Travel Card inactive for 90 days', actionLabel: 'Freeze', modal: 'freezeCardModal' },
  ],
  quickActions: [
    { icon: 'bi-cash', iconColor: 'var(--pm-accent)', label: 'Top-up Card', modal: 'topupCardModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-info)', label: 'Transfer', modal: 'transferModal' },
    { icon: 'bi-sliders', iconColor: 'var(--pm-primary)', label: 'Set Limits', modal: 'cardLimitsModal' },
    { icon: 'bi-asterisk', iconColor: 'var(--pm-warning)', label: 'View PIN', modal: 'viewPinModal' },
    { icon: 'bi-snow', iconColor: 'var(--pm-danger)', label: 'Freeze', modal: 'freezeCardModal' },
    { icon: 'bi-box-arrow-right', iconColor: 'var(--pm-muted)', label: 'Unload Funds', modal: 'unloadCardModal' },
    { icon: 'bi-shop', iconColor: 'var(--pm-purple)', label: 'MCC Blocks', modal: 'mccBlockModal' },
    { icon: 'bi-download', iconColor: 'var(--pm-ink)', label: 'Reports', modal: 'exportReportModal' },
  ],
  cards: [
    { id: 'v1', type: 'virtual', bg: 'bgGradientBlue', number: '4812', title: 'Marketing Ads', sub: 'Active · Virtual · VISA', balance: 'KES 14,500', expiry: '08/26', brand: 'VISA', actions: [{ label: 'Fund', modal: 'topupCardModal' }, { label: 'Controls', modal: 'cardControlsModal' }] },
    { id: 'p1', type: 'physical', bg: 'bgGradientEmerald', number: '9091', title: 'Fleet #1 - John', sub: 'Active · Physical · VISA', balance: 'KES 22,100', expiry: '12/27', brand: 'VISA', actions: [{ label: 'Fund', modal: 'topupCardModal' }, { label: 'Controls', modal: 'cardControlsModal' }] },
    { id: 'v2', type: 'virtual', bg: 'bgGradientPurple', number: '3321', title: 'Software Subs', sub: 'Low Balance · Virtual · Mastercard', balance: 'KES 150', expiry: '05/25', brand: 'Mastercard', statusBadge: { text: 'LOW BAL', tone: 'badgeD' }, borderDanger: true, actions: [{ label: 'Fund Now', modal: 'topupCardModal', actionClass: 'btnDanger' }, { label: 'Auto-load', modal: 'autoReloadModal' }] },
    { id: 'f1', type: 'frozen', bg: 'bgGradientDark', number: '7762', title: 'Travel Expo', sub: 'Frozen · Physical · VISA', balance: 'KES 4,500', expiry: '09/25', brand: 'VISA', statusBadge: { text: 'FROZEN', tone: 'badgeD' }, actions: [{ label: 'Unfreeze', modal: 'freezeCardModal' }, { label: 'Unload', modal: 'unloadCardModal' }] },
  ],
  autoReloadRules: [
    { card: 'Marketing Ads', desc: 'Load KES 10K when balance < KES 1K', badge: 'Active', tone: 'badgeS' },
    { card: 'Software Subs', desc: 'Load KES 5K on 1st of month', badge: 'Active', tone: 'badgeS' },
  ],
  restrictions: [
    { label: 'Geo-Blocking', desc: 'Physical cards locked to Kenya & EA', actionLabel: 'Edit', modal: 'geoBlockModal' },
    { label: 'MCC Blocks', desc: 'Gambling, Crypto, Adult blocked on all', actionLabel: 'Edit', modal: 'mccBlockModal' },
  ],
  transactions: [
    { date: 'Today, 14:32', card: 'Fleet #1 (...9091)', merchant: 'Shell Petrol Station', category: 'Fuel', amount: 'KES 6,500', status: 'Approved', statusTone: 'badgeS', actionLabel: 'Receipt', actionModal: 'txReceiptModal' },
    { date: 'Today, 10:15', card: 'Marketing (...4812)', merchant: 'Facebook Ads', category: 'Advertising', amount: 'KES 12,000', status: 'Approved', statusTone: 'badgeS', actionLabel: 'Receipt', actionModal: 'txReceiptModal' },
    { date: 'Yesterday', card: 'Software (...3321)', merchant: 'AWS Cloud', category: 'Cloud Svcs', amount: 'KES 8,400', status: 'Declined (NSF)', statusTone: 'badgeD', actionLabel: 'Dispute', actionModal: 'disputeTxModal' },
    { date: 'Yesterday', card: 'Fleet #2 (...1124)', merchant: 'Carrefour', category: 'Groceries', amount: 'KES 1,200', status: 'Approved', statusTone: 'badgeS', actionLabel: 'Receipt', actionModal: 'txReceiptModal' },
    { date: '25 Jun', card: 'Travel (...7762)', merchant: 'Uber', category: 'Transport', amount: 'KES 850', status: 'Approved', statusTone: 'badgeS', actionLabel: 'Receipt', actionModal: 'txReceiptModal' },
  ],
}

async function fetchPrepaidCardManagement(): Promise<PrepaidCardManagementConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/prepaid-card-management', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as PrepaidCardManagementConfig
  } catch {
    return initialMockData
  }
}

export default function PrepaidCardManagement() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-prepaid-card-management'],
    queryFn: fetchPrepaidCardManagement,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [cardFilter, setCardFilter] = useState<string>('all')

  const filteredCards = cardFilter === 'all' ? config.cards : config.cards.filter(c => c.type === cardFilter)

  return (
    <div className={styles.prepaidCardManagement}>
      <div className={styles.main}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load prepaid card data. Showing cached data.</span>
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
            <button className={styles.btnPm} onClick={() => setActiveModal('bulkIssueModal')}><i className="bi bi-layers" /> Bulk Issue</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('bulkTopupModal')}><i className="bi bi-cash-stack" /> Bulk Top-up</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('issueCardModal')}><i className="bi bi-plus-lg" /> Issue New Card</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                  Prepaid Card Program is Active <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>12 Active Cards</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>4 Physical, 8 Virtual. Used for fleet fuel, online software, and staff expenses.</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('bulkTopupModal')}>Fund Cards</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('issueCardModal')}>New Virtual</button>
                </div>
              </div>
            </div>
            {config.statCards.slice(1).map((s) => (
              <div key={s.key} className={s.col}>
                <div className={styles.card} style={{ minHeight: 170, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}>
                  <p className={styles.statLabel} style={{ color: s.labelColor }}>{s.label}</p>
                  <div className={styles.statValue} style={{ margin: '6px 0' }}>{s.value}</div>
                  {s.badge && (
                    <span className={`${styles.badge} ${styles[s.badge.tone]}`}>
                      <i className={`bi ${s.badge.icon}`} /> {s.badge.text}
                    </span>
                  )}
                  {s.progress && (
                    <div className="mt-2"><div className={styles.progress}><div className={styles.progressBar} style={{ width: s.progress.width, background: s.progress.color }} /></div></div>
                  )}
                  {s.miniBars && (
                    <div className={styles.miniBars + ' mt-3'}>
                      {s.miniBars.map((b, i) => (
                        <div key={i} className={styles.miniBar} style={{ height: b.height, background: b.color }} />
                      ))}
                    </div>
                  )}
                  {s.lines?.map((l) => (
                    <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{l}</div>
                  ))}
                  {s.key === 'lowbal' && (
                    <button className={`${styles.btnPm} ${styles.btnSm} mt-2 w-100`} onClick={() => setActiveModal('bulkTopupModal')}>Top-up Now</button>
                  )}
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
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                        {item.iconText}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
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
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
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

          {/* SECTION 5.5.1: Card Portfolio */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-2-front-fill" style={{ color: 'var(--pm-primary)' }} /> 5.5.1 — Prepaid Card Directory & Portfolio</h3>
                <p className={styles.sectionSub}>View and manage all issued physical and virtual prepaid cards.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm} onClick={() => setActiveModal('bulkIssueModal')}><i className="bi bi-layers" /> Bulk Issue</button>
                <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('issueCardModal')}><i className="bi bi-plus-lg" /> Issue Card</button>
              </div>
            </div>

            <div className={styles.tabPills + ' mb-3'}>
              <button className={`${styles.tabPill} ${cardFilter === 'all' ? styles.tabPillActive : ''}`} onClick={() => setCardFilter('all')}>All Cards (12)</button>
              <button className={`${styles.tabPill} ${cardFilter === 'virtual' ? styles.tabPillActive : ''}`} onClick={() => setCardFilter('virtual')}>Virtual (8)</button>
              <button className={`${styles.tabPill} ${cardFilter === 'physical' ? styles.tabPillActive : ''}`} onClick={() => setCardFilter('physical')}>Physical (4)</button>
              <button className={`${styles.tabPill} ${cardFilter === 'frozen' ? styles.tabPillActive : ''}`} onClick={() => setCardFilter('frozen')}>Frozen (1)</button>
            </div>

            <div className="row g-3">
              {filteredCards.map((card) => (
                <div key={card.id} className="col-lg-3 col-md-4 col-sm-6">
                  <div className={`${styles.creditCardUi} ${styles[card.bg]}`} onClick={() => setActiveModal('cardDetailModal')} style={card.borderDanger ? { border: '2px solid var(--pm-danger)' } : undefined}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className={styles.ccLogo}>PAYMO</div>
                      <div>
                        {card.type === 'virtual' ? <i className="bi bi-wifi text-white opacity-75 fs-5" /> : card.type === 'frozen' ? <i className="bi bi-snow text-info fs-5" /> : <i className="bi bi-contactless text-white opacity-75 fs-5" />}
                      </div>
                    </div>
                    <div>
                      {card.type === 'physical' && <div className={styles.ccChip + ' mb-2'} />}
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        {card.statusBadge ? (
                          <span className="badge bg-danger text-white" style={{ fontSize: 10 }}>{card.statusBadge.text}</span>
                        ) : (
                          <span className="badge bg-light" style={{ fontSize: 10, color: card.type === 'virtual' ? 'var(--pm-primary)' : 'var(--pm-accent)' }}>{card.type.toUpperCase()}</span>
                        )}
                        <span className="fs-6 fw-bold">{card.balance}</span>
                      </div>
                      <div className={styles.ccNumber}>**** **** **** {card.number}</div>
                    </div>
                    <div className={styles.ccBottom}>
                      <div>
                        <div className={styles.ccName}>{card.title}</div>
                        <div className={styles.ccExpiry}>{card.expiry}</div>
                      </div>
                      <div className={styles.ccBrand}>{card.brand}</div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-2 px-1">
                    {card.actions.map((a) => (
                      <button key={a.label} className={`${styles.btnPm} ${styles.btnSm} ${a.actionClass ? styles[a.actionClass] : styles.btnOutline} w-100 ${card.actions.indexOf(a) === 0 ? 'me-1' : 'ms-1'}`} onClick={() => setActiveModal(a.modal)}>{a.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <button className={styles.btnPm} onClick={() => setActiveModal('cardListModal')}>View All Cards</button>
            </div>
          </div>

          {/* SECTION 5.5.2 & 5.5.3: Funding & Controls */}
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <div className={`${styles.card} h-100`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}><i className="bi bi-cash-stack text-success" /> 5.5.2 — Funding & Top-ups</h3>
                  <button className={styles.btnPm} onClick={() => setActiveModal('bulkTopupModal')}>Bulk Fund</button>
                </div>
                <div className={styles.utilityBlock + ' mb-3'}>
                  <h4 style={{ fontSize: 13, fontWeight: 700 }}>Active Auto-Reload Rules</h4>
                  {config.autoReloadRules.map((r) => (
                    <div key={r.card} className={styles.statusRow}>
                      <div><strong>{r.card}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r.desc}</div></div>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.badge}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} mt-2 w-100`} onClick={() => setActiveModal('autoReloadModal')}><i className="bi bi-plus" /> New Rule</button>
                </div>
                <div className="d-flex gap-2">
                  <button className={`${styles.btnPm} flex-fill justify-content-center`} onClick={() => setActiveModal('topupCardModal')}>Top-up Card</button>
                  <button className={`${styles.btnPm} flex-fill justify-content-center`} onClick={() => setActiveModal('transferModal')}>Transfer Balance</button>
                  <button className={`${styles.btnPm} flex-fill justify-content-center`} onClick={() => setActiveModal('unloadCardModal')}>Unload to Wallet</button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className={`${styles.card} h-100`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}><i className="bi bi-shield-lock" style={{ color: 'var(--pm-purple)' }} /> 5.5.3 — Controls & Limits</h3>
                  <button className={styles.btnPm} onClick={() => setActiveModal('cardLimitsModal')}>Edit Limits</button>
                </div>
                <div className={styles.utilityBlock + ' mb-3'}>
                  <h4 style={{ fontSize: 13, fontWeight: 700 }}>Global Restrictions Applied</h4>
                  {config.restrictions.map((r) => (
                    <div key={r.label} className={styles.statusRow}>
                      <div><strong>{r.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r.desc}</div></div>
                      <button className={styles.btnPm} onClick={() => setActiveModal(r.modal)}>{r.actionLabel}</button>
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <button className={`${styles.btnPm} flex-fill justify-content-center`} onClick={() => setActiveModal('cardControlsModal')}>Per-Card Settings</button>
                  <button className={`${styles.btnPm} flex-fill justify-content-center`} onClick={() => setActiveModal('viewPinModal')}>PIN Mgmt</button>
                  <button className={`${styles.btnPm} flex-fill justify-content-center`} onClick={() => setActiveModal('freezeCardModal')}>Freeze/Block</button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5.5.4: Analytics & Ledger */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-bar-chart-line text-info" /> 5.5.4 — Spending Analytics & Ledger</h3>
                <p className={styles.sectionSub}>Track real-time spend across your card program, analyze merchants, and export reconciliations.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm} onClick={() => setActiveModal('spendAnalyticsModal')}><i className="bi bi-pie-chart" /> Analytics</button>
                <button className={styles.btnPm} onClick={() => setActiveModal('exportReportModal')}><i className="bi bi-download" /> Export</button>
              </div>
            </div>

            <div className="table-responsive">
              <table className={styles.table}>
                <thead><tr><th>Date</th><th>Card</th><th>Merchant</th><th>Category</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
                <tbody>
                  {config.transactions.map((t) => (
                    <tr key={t.date + t.merchant}>
                      <td data-label="Date">{t.date}</td>
                      <td data-label="Card">{t.card}</td>
                      <td data-label="Merchant">{t.merchant}</td>
                      <td data-label="Category">{t.category}</td>
                      <td data-label="Amount"><strong>{t.amount}</strong></td>
                      <td data-label="Status"><span className={`${styles.badge} ${styles[t.statusTone]}`}>{t.status}</span></td>
                      <td data-label="Receipt"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(t.actionModal)}><i className={`bi ${t.actionLabel === 'Receipt' ? 'bi-receipt' : 'bi-info-circle'}`} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-3">
              <button className={styles.btnPm} onClick={() => setActiveModal('txLedgerModal')}>View Full Ledger</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <PrepaidCardManagementModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
