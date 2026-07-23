import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/virtual-debit-cards.module.css'
import VirtualDebitCardsModals from '../components/VirtualDebitCardsModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; to: string; label: string; active?: boolean; dot?: boolean }
interface SrItem { icon: string; iconBg: string; iconColor: string; iconText: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface CardItem { last4: string; name: string; type: string; status: string; expiry: string; color: string; icon: string; network?: string; holderName?: string; cvv?: string }
interface AlertItem { type: string; icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; modal: string }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }

interface VirtualDebitCardsConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: { score: string; detail: string }
  statCards: { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; lines: string[] }[]
  cards: CardItem[]
  sections: {
    attention: SrItem[]
    suggestions: SuggestionItem[]
    quickActions: QuickAction[]
    recentActivity: FeedItem[]
  }
}

const initialMockData: VirtualDebitCardsConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/transactions', label: 'Transactions' },
    { icon: 'bi-wallet2', to: '/payments', label: 'Payments' },
    { icon: 'bi-credit-card', to: '/cards', label: 'Cards', active: true, dot: true },
    { icon: 'bi-shield-check', to: '/security', label: 'Security' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Virtual Debit Card Center',
  headerSub: 'Instant digital cards, e-commerce control & subscription management',
  searchPlaceholder: 'Search cards, subscriptions, transactions, merchants...',
  user: { initials: 'JK', name: 'James K.', role: 'Cardholder' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/cards' }],
    current: 'Virtual Cards',
  },
  pageCode: 'PAGE 5.3',
  pageTitle: 'Virtual Debit Card Center',
  pageSub: 'Create and manage multiple virtual debit cards for safer online shopping, compartmentalized subscriptions, and single-use e-commerce transactions.',
  hero: {
    score: '91/100',
    detail: 'Protected by AI.',
  },
  statCards: [
    { key: 'cards', col: 'col-lg-4 col-md-6', label: 'ACTIVE CARDS', labelColor: 'var(--pm-primary)', value: '5', badge: { icon: 'bi-credit-card-2-front', text: 'All active', tone: 'badgeS' }, lines: ['Global Web Shopping, Subscriptions, AWS Hosting & more — centralized here.'] },
    { key: 'monthlySpend', col: 'col-lg-4 col-md-6', label: 'TOTAL MONTHLY SPEND', labelColor: 'var(--pm-success)', value: 'KES 48,200', badge: { icon: 'bi-graph-up', text: '+12% this month', tone: 'badgeS' }, lines: ['Digital shopping across 8 subscription services.'] },
    { key: 'subscriptions', col: 'col-lg-4 col-md-6', label: 'ACTIVE SUBSCRIPTIONS', labelColor: 'var(--pm-warning)', value: '8 services', badge: { icon: 'bi-clock', text: '3 due this week', tone: 'badgeW' }, lines: ['Monthly recurring payments totaling KES 14,500.'] },
    { key: 'security', col: 'col-lg-4 col-md-6', label: 'SECURED BY PAYMO', labelColor: 'var(--pm-accent)', value: 'KES 12,400', badge: { icon: 'bi-shield-check', text: 'Blocked attempts', tone: 'badgeS' }, lines: ['Frozen cards: 1 · Single-use burned: 4 — all preferences centralised here.'] },
  ],
  cards: [
    { last4: '3841', name: 'Global Web Shopping', type: 'Global Shopping', status: 'active', expiry: '12/28', color: 'linear-gradient(135deg,#1E293B 0%,#0F172A 100%)', icon: 'bi-globe', network: 'VISA', holderName: 'James K.', cvv: '882' },
    { last4: '9021', name: 'Subscription Master', type: 'Subscription Manager', status: 'active', expiry: '12/28', color: 'linear-gradient(135deg,#4F46E5 0%,#3730A3 100%)', icon: 'bi-arrow-repeat', network: 'VISA', holderName: 'James K.', cvv: '123' },
    { last4: '4418', name: 'AWS & Hosting', type: 'Business', status: 'active', expiry: '08/26', color: 'linear-gradient(135deg,#10B981 0%,#047857 100%)', icon: 'bi-briefcase', network: 'MC', holderName: 'James K.', cvv: '456' },
    { last4: '1184', name: 'Apple Services', type: 'Tech Stack', status: 'frozen', expiry: '03/27', color: 'linear-gradient(135deg,#EC4899 0%,#BE185D 100%)', icon: 'bi-apple', network: 'VISA', holderName: 'James K.', cvv: '789' },
  ],
  sections: {
    attention: [
      { icon: 'bi-play-btn-fill', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', iconText: 'AL', title: 'Declined: Insufficient Funds', sub: 'AWS Web Services · KES 4,500', actionLabel: 'Fund', actionClass: 'btnPmDanger', modal: 'topUpCardModal' },
      { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', iconText: 'EX', title: 'Card expiring in 15 days', sub: 'Global Shopping Card · **3841', actionLabel: 'Renew', actionModal: 'renewCardModal' },
      { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', iconText: 'SB', title: 'Subscription increased', sub: 'Netflix · +KES 300 this month', actionLabel: 'Review', actionModal: 'subManagerModal' },
      { icon: 'bi-clock', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', iconText: '3D', title: 'Pending 3D Secure Auth', sub: 'AliExpress · KES 2,100', actionLabel: 'Approve', actionModal: 'auth3DSModal' },
    ],
    suggestions: [
      { icon: 'bi-lock', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Lock card to single merchant', sub: 'Secure your Netflix card further', actionLabel: 'Lock', actionModal: 'merchantLockModal' },
      { icon: 'bi-arrow-clockwise', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Enable Dynamic CVV', sub: 'Rotate CVV daily on Shopping Card', actionLabel: 'Enable', actionModal: 'rotateCvvModal' },
      { icon: 'bi-trash', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Unused subscription detected', sub: 'Spotify not used in 60 days', actionLabel: 'Cancel', actionModal: 'cancelSubModal' },
      { icon: 'bi-bar-chart', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Lower spending limit', sub: 'Card rarely uses >KES 10k', actionLabel: 'Adjust', actionModal: 'editLimitsModal' },
    ],
    quickActions: [
      { icon: 'bi-credit-card', iconColor: 'var(--pm-primary)', label: 'New Card', modal: 'createCardModal' },
      { icon: 'bi-lightning-charge', iconColor: 'var(--pm-warning)', label: 'Single-Use', modal: 'singleUseCardModal' },
      { icon: 'bi-plus-circle', iconColor: 'var(--pm-success)', label: 'Top-up Card', modal: 'topUpCardModal' },
      { icon: 'bi-arrow-down-circle', iconColor: 'var(--pm-danger)', label: 'Withdraw', modal: 'withdrawCardModal' },
      { icon: 'bi-snow', iconColor: 'var(--pm-info)', label: 'Freeze', modal: 'freezeCardModal' },
      { icon: 'bi-arrow-repeat', iconColor: 'var(--pm-purple)', label: 'Subs Hub', modal: 'subManagerModal' },
      { icon: 'bi-file-earmark-text', iconColor: 'var(--pm-secondary)', label: 'Statements', modal: 'cardStatementModal' },
      { icon: 'bi-shield-exclamation', iconColor: 'var(--pm-danger)', label: 'Report Fraud', modal: 'reportFraudModal' },
    ],
    recentActivity: [
      { icon: 'bi-amazon', iconBg: 'var(--pm-surface-2)', iconColor: 'var(--pm-ink);', title: 'AWS Web Services', sub: 'Declined · Insufficient Funds', actionLabel: 'Fund', actionClass: 'btnPmDanger', modal: 'topUpCardModal' },
      { icon: 'bi-play-btn-fill', iconBg: 'var(--pm-surface-2)', iconColor: 'var(--pm-success);', title: 'Netflix Subscription', sub: 'Approved', actionLabel: 'Review', actionModal: 'subManagerModal' },
      { icon: 'bi-bag-check', iconBg: 'var(--pm-surface-2)', iconColor: 'var(--pm-primary);', title: 'AliExpress Shopping', sub: 'Approved · 3DS', actionLabel: 'View', actionModal: 'cardStatementModal' },
      { icon: 'bi-apple', iconBg: 'var(--pm-surface-2)', iconColor: 'var(--pm-accent);', title: 'Apple Services', sub: 'Approved', actionLabel: 'View', actionModal: 'cardStatementModal' },
      { icon: 'bi-play-btn-fill', iconBg: 'var(--pm-surface-2)', iconColor: 'var(--pm-danger);', title: 'Spotify', sub: 'Cancelled — removed from card **9021', actionLabel: 'Refund?', actionModal: 'refundModal' },
    ],
  },
}

async function fetchVirtualDebitCardsConfig(): Promise<VirtualDebitCardsConfig> {
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
    queryFn: fetchVirtualDebitCardsConfig,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.virtualDebitCardsPage}>
      <div className={styles.main}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load cards data. Showing cached data.</span>
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
            <button className={styles.btnPm} onClick={() => setActiveModal('cardSecurityModal')}><i className="bi bi-shield-lock" /> Security</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('cardAnalyticsModal')}><i className="bi bi-graph-up" /> Analytics</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('notificationsModal')}><i className="bi bi-bell" /> Notifications <span className={styles.counter}>4</span></button>
            <div className={styles.profileBtn} onClick={() => setActiveModal('profileModal')}>
              <div className={styles.avatar} style={{ background: 'var(--pm-gradient-sunset)', width: 36, height: 36, fontSize: 13 }}>MN</div>
              <div>
                <div className={styles.name}>James K.</div>
                <div className={styles.role}>Cardholder</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* HERO ROW */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)', textTransform: 'uppercase', fontWeight: 600 }}>Virtual issuance engine is live <span style={{ color: '#86efac' }}>●</span></p>
                <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>5 active virtual cards</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Used for global shopping, Netflix, AWS hosting, and secure single-use purchases.</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('createCardModal')}>New card</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('singleUseCardModal')}>Single-use</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('bulkCreateModal')}>Bulk issue</button>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className={styles.card} style={{ minHeight: 170 }}>
                <p className={styles.statLabel} style={{ color: 'var(--pm-success)' }}>TOTAL MONTHLY SPEND</p>
                <div className={styles.statValue} style={{ margin: '6px 0' }}>KES 48,200</div>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-graph-up" /> +12% this month</span>
                <div className={styles.miniBars} style={{ marginTop: 12 }}>
                  <div className={styles.miniBar} style={{ height: '45%', background: 'var(--pm-primary)' }}></div>
                  <div className={styles.miniBar} style={{ height: '60%', background: 'var(--pm-primary)' }}></div>
                  <div className={styles.miniBar} style={{ height: '35%', background: 'var(--pm-info)' }}></div>
                  <div className={styles.miniBar} style={{ height: '80%', background: 'var(--pm-primary)' }}></div>
                  <div className={styles.miniBar} style={{ height: '90%', background: 'var(--pm-danger)' }}></div>
                  <div className={styles.miniBar} style={{ height: '60%', background: 'var(--pm-primary)' }}></div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6">
              <div className={styles.card} style={{ minHeight: 170 }}>
                <p className={styles.statLabel} style={{ color: 'var(--pm-warning)' }}>ACTIVE SUBSCRIPTIONS</p>
                <div className={styles.statValue} style={{ margin: '6px 0' }}>8 services</div>
                <span className={`${styles.badge} ${styles.badgeWarning}`}><i className="bi bi-clock" /> 3 due this week</span>
                <div className="mt-2">
                  <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                    <span>Total recurring</span><span>KES 14,500/mo</span>
                  </div>
                  <div className={styles.progress} style={{ marginTop: 8 }}>
                    <div className={styles.progressBar} style={{ width: '40%', background: 'var(--pm-warning)' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4">
              <div className={styles.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-accent)' }}>
                <p className={styles.statLabel} style={{ color: 'var(--pm-accent)' }}>SECURED BY PAYMO</p>
                <div className={styles.statValue} style={{ margin: '6px 0' }}>KES 12,400</div>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-shield-check" /> Blocked attempts</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                  <div>Frozen cards: <strong>1</strong></div>
                  <div>Single-use burned: <strong>4</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* ATTENTION / SUGGESTIONS / ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>Attention Required</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('attentionModal')}>View all</button>
                </div>
                {config.sections.attention.map((item) => (
                  <div key={item.title} className={styles.feedItem}>
                    <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14, border: 'none' }}><i className={`bi ${item.icon}`} /></div>
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
                  <span className={`${styles.badge} ${styles.badgePurple}`}><i className="bi bi-stars" /> AI</span>
                </div>
                {config.sections.suggestions.map((item) => (
                  <div key={item.title} className={styles.feedItem}>
                    <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14, border: 'none' }}><i className={`bi ${item.icon}`} /></div>
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
                <div className={styles.quickGrid}>
                  {config.sections.quickActions.map((a) => (
                    <button key={a.label} className={styles.quickBtn} onClick={() => setActiveModal(a.modal)}>
                      <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5.3.1 VIRTUAL CARD ISSUANCE & TYPES */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-fill" style={{ color: 'var(--pm-primary)' }} /> 5.3.1 — Virtual Card Issuance & Portfolio</h3>
                <p className={styles.sectionSub}>Manage your active virtual cards. Click on any card to reveal details, copy numbers, or manage security settings.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('bulkCreateModal')}><i className="bi bi-files" /> Bulk Issue</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmPrimary}`} onClick={() => setActiveModal('createCardModal')}><i className="bi bi-plus-lg" /> Issue New Card</button>
              </div>
            </div>
            <div className={styles.vCardGrid} id="virtualCardGrid">
              {/* Populated by JS */}
            </div>
          </div>

          {/* 5.3.2 CONTROLS & SECURITY */}
          <div className="row g-3">
            <div className="col-lg-7">
              <div className={styles.card} style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                  <div>
                    <h3 className={styles.sectionTitle}><i className="bi bi-shield-lock-fill" style={{ color: 'var(--pm-accent)' }} /> 5.3.2 — Card Details & Security Controls</h3>
                    <p className={styles.sectionSub}>Advanced security settings for selected virtual cards.</p>
                  </div>
                  <div className={styles.tabPills}>
                    <button className={`${styles.tabPill} ${styles.active}`}>Security</button>
                    <button className={styles.tabPill} onClick={() => setActiveModal('editLimitsModal')}>Limits</button>
                  </div>
                </div>
                <div className="mb-3"><select className={styles.formControl}><option>Global Shopping — **3841</option><option>Subscription Master — **9021</option><option>AWS & Hosting — **4418</option></select></div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className={styles.utilityBlock}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>State & Access</h4>
                      <div className="d-flex justify-content-between align-items-center mb-3"><div style={{ fontSize: 13 }}><strong>Card Status</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Active and accepting charges</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmOutline}`} onClick={() => setActiveModal('freezeCardModal')}>Freeze</button></div>
                      <div className="d-flex justify-content-between align-items-center mb-3"><div style={{ fontSize: 13 }}><strong>Terminate Card</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Permanently delete this card</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmDangerSoft}`} onClick={() => setActiveModal('deleteCardModal')}>Delete</button></div>
                      <div className="d-flex justify-content-between align-items-center"><div style={{ fontSize: 13 }}><strong>Card Alias</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Global Web Shopping</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmOutline}`} onClick={() => setActiveModal('editAliasModal')}>Edit</button></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className={styles.card} style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}><i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Card Activity</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardStatementModal')}>View All</button>
                </div>
                {config.sections.recentActivity.map((item) => (
                  <div key={item.title} className={styles.feedItem}>
                    <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14, border: '1px solid var(--pm-border)', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={`bi ${item.icon}`} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-danger)' }}>{item.sub}</div>
                      <div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>Card **{item.title === 'AWS Web Services' ? '4418' : item.title === 'Netflix Subscription' ? '9021' : item.title === 'AliExpress Shopping' ? '3841' : '9021'}</div>
                    </div>
                    <div className="text-end">
                      <strong>KES {item.title === 'AWS Web Services' ? '4,500' : item.title === 'Netflix Subscription' ? '1,400' : item.title === 'AliExpress Shopping' ? '6,240' : '400'}</strong><br />
                      <span style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{item.title === 'AWS Web Services' ? 'Today, 10:15 AM' : item.title === 'Netflix Subscription' ? 'Yesterday' : item.title === 'AliExpress Shopping' ? '25 Jun' : '22 Jun'}</span>
                    </div>
                  </div>
                ))}
                <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => setActiveModal('disputeTxModal')}><i className="bi bi-exclamation-triangle text-warning"></i> Dispute a transaction</button>
              </div>
            </div>
          </div>

          {/* 5.3.3 ONLINE SUBSCRIPTIONS */}
          <div className={styles.card} className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-arrow-repeat" style={{ color: 'var(--pm-purple)' }} /> 5.3.3 — Online Subscriptions & E-commerce</h3>
                <p className={styles.sectionSub}>Auto-detected recurring payments linked to your virtual cards. Manage, block, or migrate subscriptions.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('addSubscriptionModal')}><i className="bi bi-plus" /> Add Sub</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmPrimary}`} onClick={() => setActiveModal('subManagerModal')}><i className="bi bi-gear" /> Manage All</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={styles.table}>
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
                  <tr>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={styles.subIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><i className="bi bi-play-btn-fill"></i></div>
                        <strong>Netflix</strong>
                      </div>
                    </td>
                    <td>Sub Master (**9021)</td>
                    <td>Monthly (26th)</td>
                    <td>KES 1,400</td>
                    <td>Yesterday</td>
                    <td>26 Jul</td>
                    <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span></td>
                    <td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmOutline}`} onClick={() => setActiveModal('manageSingleSubModal')}>Manage</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={styles.subIcon} style={{ background: '#FEF3C7', color: '#B45309' }}><i className="bi bi-apple"></i></div>
                        <strong>Apple Music</strong>
                      </div>
                    </td>
                    <td>Sub Master (**9021)</td>
                    <td>Monthly (22nd)</td>
                    <td>KES 400</td>
                    <td>22 Jun</td>
                    <td>22 Jul</td>
                    <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span></td>
                    <td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmOutline}`} onClick={() => setActiveModal('manageSingleSubModal')}>Manage</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={styles.subIcon} style={{ background: '#DBEAFE', color: '#1D4ED8' }}><i className="bi bi-microsoft"></i></div>
                        <strong>Microsoft 365</strong>
                      </div>
                    </td>
                    <td>Office Exp (**1184)</td>
                    <td>Annual (14 Aug)</td>
                    <td>KES 12,000</td>
                    <td>Aug 2024</td>
                    <td>14 Aug 2025</td>
                    <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span></td>
                    <td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmOutline}`} onClick={() => setActiveModal('manageSingleSubModal')}>Manage</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={styles.subIcon} style={{ background: '#E5E7EB', color: '#374151' }}><i className="bi bi-spotify"></i></div>
                        <strong>Spotify</strong>
                      </div>
                    </td>
                    <td>Global Web (**3841)</td>
                    <td>Monthly (05th)</td>
                    <td>KES 300</td>
                    <td>05 Jun</td>
                    <td>05 Jul</td>
                    <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Unused alert</span></td>
                    <td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmOutline}`} onClick={() => setActiveModal('cancelSubModal')}>Cancel</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={styles.subIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><i className="bi bi-cloud-arrow-up"></i></div>
                        <strong>AWS Hosting</strong>
                      </div>
                    </td>
                    <td>AWS & Host (**4418)</td>
                    <td>Monthly (28th)</td>
                    <td>KES 4,500</td>
                    <td>28 May</td>
                    <td>Tomorrow</td>
                    <td><span className={`${styles.badge} ${styles.badgeDanger}`}>Fund required</span></td>
                    <td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmPrimary}`} onClick={() => setActiveModal('topUpCardModal')}>Fund Card</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <VirtualDebitCardsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} config={config} />
    </div>
  )
}
