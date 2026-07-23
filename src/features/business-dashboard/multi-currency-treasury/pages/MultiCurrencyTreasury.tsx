import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/multi-currency-treasury.module.css'
import MultiCurrencyTreasuryModals from '../components/MultiCurrencyTreasuryModals'

/* ============================================================================
   PayMo BaaS — Multi-Currency Treasury & Forex (legacy page 3.11)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface User { initials: string; name: string; role: string }
interface CurrencyRow { code: string; symbol: string; balance: string; change: string; changeTone: BadgeTone; volume: string; progress: number; progressColor: string }
interface FXRate { pair: string; rate: string; change: string; spread: string; bidAsk: string }
interface ContractRow { id: string; pair: string; amount: string; rate: string; value: string; expiry: string; pnl: string; pnlTone: BadgeTone }
interface TransferRow { date: string; from: string; to: string; amount: string; status: string; statusTone: BadgeTone }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface Settlement { label: string; detail: string; status: string; statusTone: BadgeTone }
interface ComplianceRow { area: string; status: string; tone: BadgeTone; filing: string; deadline: string }

interface FXConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; mid: string; current: string }
  pageTitle: string
  pageSub: string
  currencies: CurrencyRow[]
  fxRates: FXRate[]
  contracts: ContractRow[]
  transferRows: TransferRow[]
  attentionItems: AttentionItem[]
  suggestions: SuggestionItem[]
  quickActions: QuickAction[]
  settlements: Settlement[]
  compliance: ComplianceRow[]
}

const initialMockData: FXConfig = {
  nav: [
    { icon: 'bi-house', title: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', title: 'Overview' },
    { icon: 'bi-credit-card', title: 'Cards' },
    { icon: 'bi-cash-stack', title: 'Payments' },
    { icon: 'bi-currency-exchange', title: 'Treasury', active: true, dot: true },
    { icon: 'bi-bar-chart-line', title: 'Analytics' },
    { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Multi-Currency Treasury & Forex',
  headerSub: 'FX accounts, live rates, transfers, hedging, compliance, reconciliation and reporting',
  searchPlaceholder: 'Search currencies, rates, transfers, FX contracts...',
  user: { initials: 'JK', name: 'James K.', role: 'Treasury Manager' },
  breadcrumb: { parent: 'Business Portal', mid: 'Treasury', current: 'Multi-Currency' },
  pageTitle: 'PAGE 3.11 — Multi-Currency Treasury & Forex Operations',
  pageSub: 'Manage multi-currency accounts, execute live FX trades, set hedging contracts, monitor exposure, ensure regulatory compliance and reconcile treasury positions.',
  currencies: [
    { code: 'KES', symbol: 'KSh', balance: '48,240,000', change: '+2.4%', changeTone: 'badgeS', volume: '12.4M', progress: 62, progressColor: 'var(--pm-accent)' },
    { code: 'USD', symbol: '$', balance: '318,400', change: '+1.8%', changeTone: 'badgeS', volume: '2.8M', progress: 78, progressColor: 'var(--pm-primary)' },
    { code: 'EUR', symbol: '€', balance: '142,800', change: '-0.3%', changeTone: 'badgeW', volume: '1.2M', progress: 45, progressColor: 'var(--pm-info)' },
    { code: 'GBP', symbol: '£', balance: '84,200', change: '+0.4%', changeTone: 'badgeS', volume: '850K', progress: 38, progressColor: 'var(--pm-purple)' },
    { code: 'UGX', symbol: 'USh', balance: '245,000,000', change: '-1.2%', changeTone: 'badgeD', volume: '3.2M', progress: 55, progressColor: 'var(--pm-warning)' },
    { code: 'AED', symbol: 'د.إ', balance: '84,200', change: '+0.2%', changeTone: 'badgeS', volume: '200K', progress: 42, progressColor: 'var(--pm-info)' },
  ],
  fxRates: [
    { pair: 'USD/KES', rate: '129.42', change: '-0.08', spread: '0.15', bidAsk: '129.35 - 129.50' },
    { pair: 'EUR/KES', rate: '139.80', change: '+0.22', spread: '0.30', bidAsk: '139.65 - 139.95' },
    { pair: 'GBP/KES', rate: '167.90', change: '-0.45', spread: '0.40', bidAsk: '167.70 - 168.10' },
    { pair: 'USD/EUR', rate: '0.926', change: '-0.001', spread: '0.002', bidAsk: '0.925 - 0.927' },
    { pair: 'USD/UGX', rate: '3,712', change: '+8', spread: '14', bidAsk: '3,705 - 3,719' },
    { pair: 'USD/TZS', rate: '2,705', change: '-3', spread: '14', bidAsk: '2,698 - 2,712' },
  ],
  contracts: [
    { id: 'FX-8821', pair: 'USD/KES', amount: 'USD 120,000', rate: '129.35', value: 'KES 15.5M', expiry: '27 Jun', pnl: '+KES 42,000', pnlTone: 'badgeS' },
    { id: 'FX-8819', pair: 'EUR/KES', amount: 'EUR 85,000', rate: '139.50', value: 'KES 11.9M', expiry: '14 Jul', pnl: '-KES 12,500', pnlTone: 'badgeD' },
    { id: 'FX-8815', pair: 'GBP/KES', amount: 'GBP 45,000', rate: '167.80', value: 'KES 7.6M', expiry: '30 Jun', pnl: '+KES 8,400', pnlTone: 'badgeS' },
    { id: 'FX-8810', pair: 'USD/KES', amount: 'USD 200,000', rate: '128.90', value: 'KES 25.8M', expiry: '15 Jul', pnl: '+KES 106,000', pnlTone: 'badgeS' },
  ],
  transferRows: [
    { date: '27 Jun', from: 'USD Account', to: 'KES Account', amount: 'USD 50,000 → KES 6.47M', status: 'Settled', statusTone: 'badgeS' },
    { date: '26 Jun', from: 'EUR Account', to: 'GBP Account', amount: 'EUR 25,000 → GBP 16,600', status: 'Settled', statusTone: 'badgeS' },
    { date: '25 Jun', from: 'KES Account', to: 'UGX Account', amount: 'KES 5M → UGX 18.6M', status: 'Pending', statusTone: 'badgeI' },
    { date: '24 Jun', from: 'USD Account', to: 'EUR Account', amount: 'USD 85,000 → EUR 78,800', status: 'Settled', statusTone: 'badgeS' },
  ],
  attentionItems: [
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'USD 45K forward expires today', sub: 'Contract FX-8821 · action required', btnLabel: 'Roll', modal: 'rollContractModal' },
    { icon: 'bi-file-earmark-text', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'STR report due for large USD inflow', sub: 'KES 12.4M from US client', btnLabel: 'File', modal: 'complianceModal' },
    { icon: 'bi-graph-up', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'GBP volatility alert', sub: '1.8% move in 4 hours', btnLabel: 'Hedge', modal: 'hedgeModal' },
    { icon: 'bi-shield-exclamation', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Hedge ratio below target', sub: '68% hedged vs 75% target', btnLabel: 'Adjust', modal: 'hedgeModal' },
  ],
  suggestions: [
    { icon: 'bi-lightbulb', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Lock in USD/KES above 129', sub: 'Forward rate favourable for 30d', btnLabel: 'Lock', modal: 'hedgeModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Roll expiring contracts', sub: '2 contracts expiring this week', btnLabel: 'Roll', modal: 'rollContractModal' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Increase EUR hedge', sub: 'EUR exposure growing 12% MoM', btnLabel: 'Hedge', modal: 'hedgeModal' },
    { icon: 'bi-graph-up-arrow', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'FX P&L trending positive', sub: '+KES 184K today • +1.8%', btnLabel: 'View', modal: 'marketCommentModal' },
  ],
  quickActions: [
    { icon: 'bi-currency-exchange', iconColor: 'var(--pm-primary)', label: 'Trade FX', modal: 'tradeModal' },
    { icon: 'bi-shield', iconColor: 'var(--pm-accent)', label: 'Hedge', modal: 'hedgeModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-info)', label: 'Transfer', modal: 'transferModal' },
    { icon: 'bi-bell', iconColor: 'var(--pm-warning)', label: 'Rate Alert', modal: 'rateAlertModal' },
    { icon: 'bi-file-earmark-text', iconColor: 'var(--pm-purple)', label: 'Compliance', modal: 'complianceModal' },
    { icon: 'bi-download', iconColor: 'var(--pm-muted)', label: 'Export', modal: 'reportExportModal' },
  ],
  settlements: [
    { label: 'USD 85,000 incoming', detail: 'From US client • Value date 28 Jun', status: 'T+2', statusTone: 'badgeI' },
    { label: 'EUR 42,000 outgoing', detail: 'Supplier payment • Value date 27 Jun', status: 'Pending', statusTone: 'badgeW' },
    { label: 'GBP 18,500 incoming', detail: 'UK subsidiary • Value date 29 Jun', status: 'Confirmed', statusTone: 'badgeS' },
    { label: 'UGX 45M outgoing', detail: 'Uganda branch payroll • Value date 30 Jun', status: 'Pending', statusTone: 'badgeW' },
  ],
  compliance: [
    { area: 'USD Exposure', status: 'Healthy', tone: 'badgeS', filing: '68% hedged', deadline: '—' },
    { area: 'GBP Volatility', status: 'Watch', tone: 'badgeW', filing: '1.8% volatility', deadline: 'Increase hedge' },
    { area: 'Compliance', status: 'Action', tone: 'badgeW', filing: 'STR pending', deadline: 'File today' },
    { area: 'Reconciliation', status: 'Healthy', tone: 'badgeS', filing: '1 exception resolved', deadline: '—' },
  ],
}

async function fetchFXContent(): Promise<FXConfig> {
  const res = await fetch('/api/business/multi-currency-treasury')
  if (!res.ok) throw new Error('Failed to fetch FX data')
  return res.json()
}

export default function MultiCurrencyTreasury() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['business-multi-currency-treasury'],
    queryFn: fetchFXContent,
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
      {/* SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}>P</div>
        <nav className={s.sidebarNav}>
          {config.nav.map((n, i) => (
            <button key={i} className={`${s.navItem} ${n.active ? s.navItemActive : ''}`} title={n.title}>
              <i className={`bi ${n.icon}`} />
              {n.dot && <span className={s.badgeDot} />}
            </button>
          ))}
        </nav>
        <button className={s.sidebarHelp} title="Help"><i className="bi bi-question-circle" /></button>
      </aside>

      {/* MAIN */}
      <div className={s.main}>
        {/* HEADER */}
        <header className={s.header}>
          <div className={s.headerTitle} style={{ flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className={cx(s.avatar, s.avatarLarge)}>MN</div>
              <div>
                <h1>{config.headerTitle}</h1>
                <p>{config.headerSub}</p>
              </div>
            </div>
          </div>
          <div className={s.headerSearch}>
            <i className="bi bi-search" />
            <input type="text" placeholder={config.searchPlaceholder} />
          </div>
          <div className={s.headerActions}>
            <button className={s.headerBtn} onClick={() => setActiveModal('fxHealthModal')}><i className="bi bi-heart-pulse" /></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('fxNotifModal')}><i className="bi bi-bell" /><span className={s.counter}>7</span></button>
            <div className={s.profileBtn} onClick={() => setActiveModal('profileModal')}>
              <div className={s.avatar}>{config.user.initials}</div>
              <div>
                <div className={s.profileName}>{config.user.name}</div>
                <div className={s.profileRole}>{config.user.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE BAR */}
        <div className={s.pageBar}>
          <div>
            <div className={s.breadcrumb}><a href="#">Home</a> / <a href="#">{config.breadcrumb.parent}</a> / <strong>{config.breadcrumb.current}</strong></div>
            <h2 className={s.pageH2}>{config.pageTitle}</h2>
            <p className={s.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={s.btnPm} onClick={() => setActiveModal('fxHealthModal')}><i className="bi bi-heart-pulse" /> Health Check</button>
            <button className={s.btnPm} onClick={() => setActiveModal('fxNotifModal')}><i className="bi bi-bell" /> Alerts</button>
            <button className={s.btnPm} onClick={() => setActiveModal('transferModal')}><i className="bi bi-arrow-left-right" /> Transfer</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => setActiveModal('tradeModal')}><i className="bi bi-currency-exchange" /> Trade FX</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Treasury platform live <span style={{ color: '#86efac' }}>●</span></p>
                <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>KES 124.8M equivalent</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Across 7 currencies (KES, USD, EUR, GBP, UGX, TZS, AED). Hedged exposure: 68%. Pending trades: 4.</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('tradeModal')}>Trade</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('hedgeModal')}>Hedge</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('transferModal')}>Transfer</button>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: 'var(--pm-accent)' }}>NET FX EXPOSURE</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>USD 318K</div>
                <span className={cx(s.badge, s.badgeS)}><i className="bi bi-shield-check" /> 68% hedged</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Unhedged: USD 102K<br />Next hedge expiry: 14 Jul</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6">
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: 'var(--pm-info)' }}>TODAY'S FX P&L</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>+KES 184,200</div>
                <span className={cx(s.badge, s.badgeS)}><i className="bi bi-graph-up-arrow" /> +1.8% vs yesterday</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Spot gain: KES 142K<br />Forward gain: KES 42K</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4">
              <div className={s.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-warning)' }}>
                <p className={s.sl} style={{ color: 'var(--pm-warning)' }}>COMPLIANCE STATUS</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>99.4%</div>
                <span className={cx(s.badge, s.badgeW)}><i className="bi bi-exclamation-triangle" /> 1 STR pending</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>CBK filing: Complete<br />Next report: 30 Jun</div>
              </div>
            </div>
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.st}>Attention Required</h3>
                  <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('attentionModal')}>View all</button>
                </div>
                {config.attentionItems.map((item) => (
                  <div key={item.title} className={s.statusRow}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}><i className={`bi ${item.icon}`} /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(item.modal)}>{item.btnLabel}</button>
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
                  <div key={item.title} className={s.statusRow}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}><i className={`bi ${item.icon}`} /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
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
                  <p className={s.ss}>Frequent treasury workflows</p>
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

          {/* SECTION 3.11.1: Multi-Currency Accounts & Positions */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-wallet2" style={{ color: 'var(--pm-primary)' }} /> 3.11.1 — Multi-Currency Accounts & Positions</h3>
                <p className={s.ss}>View all currency balances, exposure, hedging status, and pending settlements.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('accountModal')}><i className="bi bi-gear" /> Manage</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('tradeModal')}><i className="bi bi-currency-exchange" /> Trade FX</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={s.utilityBlock}>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Currency</th><th>Balance</th><th>Volume (MTD)</th><th>Change</th><th>Hedge %</th><th>Progress</th><th>Actions</th></tr></thead>
                      <tbody>
                        {config.currencies.map((c) => (
                          <tr key={c.code}>
                            <td><strong>{c.code}</strong></td>
                            <td><strong>{c.symbol} {c.balance}</strong></td>
                            <td>{c.volume}</td>
                            <td><span className={cx(s.badge, s[c.changeTone])}>{c.change}</span></td>
                            <td>{c.progress}%</td>
                            <td>
                              <div className={s.progress}><div className={s.progressBar} style={{ width: `${c.progress}%`, background: c.progressColor }} /></div>
                            </td>
                            <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('transferModal')}>Transfer</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Pending Settlements</h4>
                  {config.settlements.map((st) => (
                    <div key={st.label} className={s.statusRow}>
                      <div><strong>{st.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{st.detail}</div></div>
                      <span className={cx(s.badge, s[st.statusTone])}>{st.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.11.2: Live FX Rates */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-graph-up-arrow" style={{ color: 'var(--pm-accent)' }} /> 3.11.2 — Live FX Rates & Market Intelligence</h3>
                <p className={s.ss}>Real-time interbank rates, spreads, historical trends, volatility alerts and market commentary.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('rateAlertModal')}><i className="bi bi-bell" /> Alerts</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('marketModal')}><i className="bi bi-newspaper" /> Market</button>
              </div>
            </div>
            <div className="row g-2">
              {config.fxRates.map((fx) => (
                <div key={fx.pair} className="col-md-4">
                  <div className={s.fxRate}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{fx.pair}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{fx.rate} • {fx.change}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{fx.bidAsk}</div>
                      <div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>Spread {fx.spread}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3.11.3: FX Contracts & Hedging */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-shield-check" style={{ color: 'var(--pm-info)' }} /> 3.11.3 — FX Contracts & Hedging</h3>
                <p className={s.ss}>Manage forward contracts, set hedging strategies, track P&L, and monitor contract lifecycle.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('rollContractModal')}><i className="bi bi-arrow-repeat" /> Roll</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('hedgeModal')}><i className="bi bi-shield" /> New Hedge</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Contract</th><th>Pair</th><th>Amount</th><th>Rate</th><th>Value</th><th>Expiry</th><th>P&L</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.contracts.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.id}</code></td>
                      <td>{c.pair}</td>
                      <td>{c.amount}</td>
                      <td>{c.rate}</td>
                      <td>{c.value}</td>
                      <td>{c.expiry}</td>
                      <td><span className={cx(s.badge, s[c.pnlTone])}>{c.pnl}</span></td>
                      <td>
                        <div className="d-flex" style={{ gap: 4 }}>
                          <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('fxContractModal')}>View</button>
                          <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('rollContractModal')}>Roll</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3.11.4: Transfers & Compliance */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-arrow-left-right" style={{ color: 'var(--pm-warning)' }} /> 3.11.4 — Cross-Border Transfers & Compliance</h3>
                <p className={s.ss}>Execute multi-currency transfers, track SWIFT payments, and manage regulatory compliance.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('complianceModal')}><i className="bi bi-file-earmark-text" /> Compliance</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('transferModal')}><i className="bi bi-send" /> Transfer</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Recent FX Transfers</h4>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Date</th><th>From</th><th>To</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {config.transferRows.map((t) => (
                          <tr key={t.date + t.from}>
                            <td>{t.date}</td>
                            <td>{t.from}</td>
                            <td>{t.to}</td>
                            <td><strong>{t.amount}</strong></td>
                            <td><span className={cx(s.badge, s[t.statusTone])}>{t.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Compliance Dashboard</h4>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Area</th><th>Status</th><th>Detail</th></tr></thead>
                      <tbody>
                        {config.compliance.map((c) => (
                          <tr key={c.area}>
                            <td><strong>{c.area}</strong></td>
                            <td><span className={cx(s.badge, s[c.tone])}>{c.status}</span></td>
                            <td>{c.filing}</td>
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

      {/* MODALS */}
      <MultiCurrencyTreasuryModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
