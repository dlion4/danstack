import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/card-analytics-reporting.module.css'
import CardAnalyticsReportingModals from '../components/CardAnalyticsReportingModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; active?: boolean; dot?: boolean }
interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; lines: string[]; warnBorder?: boolean; breakdown?: { label: string; value: string }[] }
interface PortfolioStat { label: string; value: string; progress?: { width: string; color: string }; sub?: string }
interface ChannelBar { label: string; height: string; color: string }
interface ConsumerCategory { name: string; pct: string; amount: string }
interface MerchantRow { name: string; sub: string; rank: string }
interface CorpRow { company: string; dept: string; cards: string; spend: string; budgetPct: string; budgetColor: string; violations: string; violationTone: BadgeTone }

interface CardAnalyticsReportingConfig {
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
  issuanceFunnel: { label: string; value: string; progress: { width: string; color: string } }[]
  revenueOps: { label: string; value: string; color: string }[]
  channelMix: ChannelBar[]
  consumerCategories: ConsumerCategory[]
  topMerchants: MerchantRow[]
  corporateTable: CorpRow[]
}

const initialMockData: CardAnalyticsReportingConfig = {
  nav: [
    { icon: 'bi-house' },
    { icon: 'bi-credit-card' },
    { icon: 'bi-wallet2' },
    { icon: 'bi-bar-chart-line', active: true, dot: true },
    { icon: 'bi-building' },
    { icon: 'bi-shield-check' },
    { icon: 'bi-gear' },
  ],
  headerTitle: 'Card Analytics & Reporting',
  headerSub: 'Deep-dive insights, portfolio performance, compliance & predictive modeling',
  searchPlaceholder: 'Search reports, metrics, accounts, or card insights...',
  user: { initials: 'CA', name: 'David A.', role: 'BAAS Admin' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/cards' }, { label: 'Reporting', to: '/reports' }],
    current: 'Card Analytics',
  },
  pageCode: 'PAGE 5.8',
  pageTitle: 'Card Analytics & Reporting',
  pageSub: 'Analyze issuance, usage, merchant concentration, churn risk, and corporate compliance.',
  heroActions: [
    { label: 'AI Predict', modal: 'predictiveEngineModal' },
    { label: 'Schedule', modal: 'scheduleReportModal' },
    { label: 'Build Custom', modal: 'buildReportModal' },
    { label: 'Export Data', modal: 'exportReportModal' },
  ],
  statCards: [
    {
      key: 'primary', col: 'col-lg-3 col-md-6', label: 'TOTAL ACTIVE CARDS', labelColor: 'var(--pm-accent-soft)', value: '45,210',
      badge: { icon: 'bi-arrow-up', text: '+1,200 this week', tone: 'badgeS' },
      breakdown: [
        { label: 'Debit (Physical/Virtual)', value: '32,010' },
        { label: 'Credit', value: '10,050' },
        { label: 'Prepaid', value: '3,150' },
      ],
    },
    {
      key: 'volume', col: 'col-lg-3 col-md-6', label: 'MONTHLY CARD VOLUME', labelColor: 'var(--pm-info)', value: 'KES 1.2B',
      badge: { icon: 'bi-graph-up-arrow', text: '+8.4% MoM', tone: 'badgeS' },
      lines: ['Total Transactions: 2.1M', 'Avg Ticket Size: KES 571', 'Auth Rate: 98.2%'],
    },
    {
      key: 'revenue', col: 'col-lg-3 col-md-6', label: 'GROSS REVENUE (MTD)', labelColor: 'var(--pm-accent)', value: 'KES 18.5M',
      badge: { icon: 'bi-cash-coin', text: '+12.1% YoY', tone: 'badgeS' },
      lines: ['Interchange: KES 12.2M', 'FX Spread: KES 4.1M', 'Card Fees: KES 2.2M'],
    },
    {
      key: 'risk', col: 'col-lg-3 col-md-6', label: 'RISK & COMPLIANCE', labelColor: 'var(--pm-warning)', value: '1,420',
      badge: { icon: 'bi-exclamation-triangle', text: 'Cards at Churn Risk', tone: 'badgeW' },
      lines: ['Corp. Policy Violations: 42 Flags', 'Chargebacks (Rate): 18 (0.01%)', 'Unactivated Cards: 890'],
      warnBorder: true,
    },
  ],
  issuanceFunnel: [
    { label: 'Applications / Requested', value: '5,200', progress: { width: '100%', color: 'var(--pm-border-2)' } },
    { label: 'Approved & Issued', value: '4,500 (86%)', progress: { width: '86%', color: 'var(--pm-info)' } },
    { label: 'Activated', value: '3,690 (82%)', progress: { width: '71%', color: 'var(--pm-primary)' } },
    { label: 'First Transaction Made', value: '3,100 (84%)', progress: { width: '60%', color: 'var(--pm-accent)' } },
  ],
  revenueOps: [
    { label: 'NET REVENUE / CARD', value: 'KES 410', color: 'var(--pm-accent)' },
    { label: 'LIFETIME VALUE (EST)', value: 'KES 12,400', color: 'var(--pm-info)' },
  ],
  channelMix: [
    { label: 'POS', height: '45%', color: 'var(--pm-warning)' },
    { label: 'Online', height: '35%', color: 'var(--pm-info)' },
    { label: 'ATM', height: '15%', color: 'var(--pm-primary)' },
    { label: 'Mobile', height: '5%', color: 'var(--pm-accent)' },
  ],
  consumerCategories: [
    { name: 'Supermarkets & Grocery', pct: '22%', amount: 'KES 264M' },
    { name: 'Dining & Restaurants', pct: '18%', amount: 'KES 216M' },
    { name: 'Fuel & Auto', pct: '14%', amount: 'KES 168M' },
    { name: 'Travel & Airline', pct: '10%', amount: 'KES 120M' },
  ],
  topMerchants: [
    { name: 'Naivas Supermarket', sub: '98k txns · High Loyalty', rank: '#1' },
    { name: 'Safaricom Postpay/Airtime', sub: '85k txns · Recurring', rank: '#2' },
  ],
  corporateTable: [
    { company: 'Acme Logistics', dept: 'Fleet & Ops', cards: '145', spend: 'KES 3.4M', budgetPct: '78%', budgetColor: 'var(--pm-info)', violations: '12 Flagged', violationTone: 'badgeW' },
    { company: 'TechStart Inc', dept: 'Engineering & SaaS', cards: '42', spend: 'KES 1.8M', budgetPct: '92%', budgetColor: 'var(--pm-warning)', violations: '2 Critical', violationTone: 'badgeD' },
    { company: 'Nairobi Hospital', dept: 'Procurement', cards: '18', spend: 'KES 8.5M', budgetPct: '45%', budgetColor: 'var(--pm-accent)', violations: '0 Flags', violationTone: 'badgeS' },
  ],
}

async function fetchCardAnalyticsReporting(): Promise<CardAnalyticsReportingConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/card-analytics-reporting', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as CardAnalyticsReportingConfig
  } catch {
    return initialMockData
  }
}

export default function CardAnalyticsReporting() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-card-analytics-reporting'],
    queryFn: fetchCardAnalyticsReporting,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.cardAnalyticsReporting}>
      <div className={styles.main}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load analytics data. Showing cached data.</span>
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
            <button className={styles.btnPm} onClick={() => setActiveModal('predictiveEngineModal')}><i className="bi bi-stars" /> AI Predict</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('scheduleReportModal')}><i className="bi bi-calendar3" /> Schedule</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('buildReportModal')}><i className="bi bi-hammer" /> Build Custom</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('exportReportModal')}><i className="bi bi-download" /> Export Data</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <div className={`${styles.card} ${styles.cardHero}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(167,243,208,.9)' }}>TOTAL ACTIVE CARDS</p>
                <div className={styles.statValue} style={{ margin: '6px 0', color: '#fff' }}>45,210</div>
                <span className="pm-badge pm-badge-success" style={{ background: 'rgba(16,185,129,0.2)', color: '#A7F3D0' }}><i className="bi bi-arrow-up" /> +1,200 this week</span>
                <div className="mt-3" style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
                  {config.statCards[0].breakdown?.map((b) => (
                    <div key={b.label} className="d-flex justify-content-between mb-1"><span>{b.label}</span><strong>{b.value}</strong></div>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.slice(1).map((s) => (
              <div key={s.key} className={s.col}>
                <div className={styles.card} style={{ minHeight: 170, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-warning)' } : {}) }}>
                  <p className={styles.statLabel} style={{ color: s.labelColor }}>{s.label}</p>
                  <div className={styles.statValue} style={{ margin: '6px 0' }}>{s.value}</div>
                  {s.badge && (
                    <span className={`${styles.badge} ${styles[s.badge.tone]}`}>
                      <i className={`bi ${s.badge.icon}`} /> {s.badge.text}
                    </span>
                  )}
                  {s.lines.map((l) => (
                    <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 5.8.1: PORTFOLIO ANALYTICS */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-pie-chart-fill" style={{ color: 'var(--pm-info)' }} /> 5.8.1 — Card Portfolio Analytics</h3>
                <p className={styles.sectionSub}>Analyze issuance pipelines, activation rates, replacements, and revenue drivers across the portfolio.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm} onClick={() => setActiveModal('issuanceAnalyticsModal')}>Issuance Data</button>
                <button className={styles.btnPm} onClick={() => setActiveModal('usageTrendsModal')}>Usage Trends</button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-5">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Issuance & Activation Funnel</h4>
                    <button className={styles.btnPm} onClick={() => setActiveModal('activationDetailsModal')}>Details</button>
                  </div>
                  {config.issuanceFunnel.map((f) => (
                    <div key={f.label} className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>{f.label}</span><strong>{f.value}</strong></div>
                      <div className={styles.progress}><div className={styles.progressBar} style={{ width: f.progress.width, background: f.progress.color }} /></div>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between align-items-center mt-4 p-2 rounded" style={{ background: '#fff', border: '1px solid var(--pm-border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Avg Time to Activate</div>
                    <div style={{ fontWeight: 700, color: 'var(--pm-primary)' }}>1.2 Days</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Revenue & Operations</h4>
                    <button className={styles.btnPm} onClick={() => setActiveModal('revenueAnalyticsModal')}><i className="bi bi-box-arrow-up-right" /></button>
                  </div>
                  {config.revenueOps.map((r) => (
                    <div key={r.label} className="p-3 rounded mb-2 text-center" style={{ background: r.color + '22' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: r.color.replace('var(--pm-', 'var(--pm-').replace(')', '-dark)') || '#047857' }}>{r.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: r.color }}>{r.value}</div>
                    </div>
                  ))}
                  <div className={styles.statusRow}>
                    <div><strong>Replacement Rate</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Loss, damage, theft</div></div>
                    <div className="text-end"><strong>2.4%</strong><br /><a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('replacementLogModal') }} style={{ fontSize: 11, color: 'var(--pm-primary)', textDecoration: 'none' }}>View Log</a></div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Usage & Channel Mix</h4>
                    <button className={styles.btnPm} onClick={() => setActiveModal('channelMixModal')}>Drill Down</button>
                  </div>
                  <div className={styles.chartBars}>
                    {config.channelMix.map((ch) => (
                      <div key={ch.label} className={styles.chartBar} style={{ height: ch.height, background: ch.color }} title={`${ch.label}: ${ch.height}`}>
                        <span className={styles.barLabel}>{ch.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex flex-wrap mt-3" style={{ gap: 10, fontSize: 12, justifyContent: 'center' }}>
                    {config.channelMix.map((ch) => (
                      <span key={ch.label}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: ch.color, marginRight: 5 }} />{ch.label} ({ch.height})</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5.8.2: SPEND ANALYTICS & INSIGHTS */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-cart-check-fill" style={{ color: 'var(--pm-purple)' }} /> 5.8.2 — Spend Analytics & Insights</h3>
                <p className={styles.sectionSub}>Understand cardholder spending behavior, merchant concentration, recurring flows, and predictive risk factors.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm} onClick={() => setActiveModal('predictiveEngineModal')}><i className="bi bi-stars" style={{ color: 'var(--pm-purple)' }} /> Predict Insights</button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Consumer Insights</h4>
                    <button className={styles.btnPm} onClick={() => setActiveModal('topCategoriesModal')}>Categories</button>
                  </div>
                  {config.consumerCategories.map((c) => (
                    <div key={c.name} className={styles.statusRow}>
                      <div><strong>{c.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{c.pct} of total spend</div></div>
                      <div className="text-end"><strong>{c.amount}</strong></div>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mt-3">
                    <button className={styles.btnPm} onClick={() => setActiveModal('geoSpendModal')}><i className="bi bi-globe" /> Geo / Intl Spend</button>
                    <button className={styles.btnPm} onClick={() => setActiveModal('subscriptionTrackerModal')}><i className="bi bi-arrow-repeat" /> Subscriptions</button>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Merchant Intelligence</h4>
                    <button className={styles.btnPm} onClick={() => setActiveModal('merchantConcentrationModal')}>View Top</button>
                  </div>
                  <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface)', border: '1px solid var(--pm-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>CONCENTRATION RISK</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-ink)' }}>Top 10 = 45% Vol.</div>
                    <div className={styles.progress + ' mt-2'}><div className={styles.progressBar} style={{ width: '45%', background: 'var(--pm-warning)' }} /></div>
                  </div>
                  {config.topMerchants.map((m) => (
                    <div key={m.name} className={styles.statusRow}>
                      <div><strong>{m.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{m.sub}</div></div>
                      <div className="text-end"><strong>{m.rank}</strong></div>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => setActiveModal('merchantCrossSellModal')}><i className="bi bi-link-45deg" /> Partner / Cross-Sell Analysis</button>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Predictive & Churn Risk</h4>
                    <button className={styles.btnPm} onClick={() => setActiveModal('ltvAnalyticsModal')}>LTV Model</button>
                  </div>
                  <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>CHURN WARNING</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-danger)' }}>1,420 Cards</div></div>
                      <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnDanger}`} onClick={() => setActiveModal('churnRiskModal')}>Action</button>
                    </div>
                    <div style={{ fontSize: 11, color: '#7F1D1D', marginTop: 4 }}>Cards with &gt;30% volume drop last 60 days</div>
                  </div>
                  <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>UPSELL OPPORTUNITIES</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-accent)' }}>412 Users</div></div>
                      <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('upsellOpportunityModal')}>View</button>
                    </div>
                    <div style={{ fontSize: 11, color: '#065F46', marginTop: 4 }}>Debit users eligible for Credit Limits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5.8.3: CORPORATE CARD REPORTING */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-building-fill-gear" style={{ color: 'var(--pm-warning)' }} /> 5.8.3 — Corporate Card Reporting</h3>
                <p className={styles.sectionSub}>Monitor aggregate business spend, department budget utilization, compliance tracking, and policy violations.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm} onClick={() => setActiveModal('complianceTaxModal')}><i className="bi bi-file-earmark-ruled" /> Compliance & Tax</button>
                <button className={styles.btnPm} onClick={() => setActiveModal('corpSpendSummaryModal')}><i className="bi bi-building" /> Corp Summary</button>
              </div>
            </div>

            <div className="table-responsive">
              <table className={styles.table}>
                <thead>
                  <tr><th>Company / Department</th><th>Active Cards</th><th>Spend (MTD)</th><th>Budget Utilization</th><th>Violations</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {config.corporateTable.map((row) => (
                    <tr key={row.company}>
                      <td><strong>{row.company}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{row.dept}</div></td>
                      <td>{row.cards}</td>
                      <td>{row.spend}</td>
                      <td>
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: 11 }}><span>{row.budgetPct}</span><span>KES 4.3M</span></div>
                        <div className={styles.progress}><div className={styles.progressBar} style={{ width: row.budgetPct, background: row.budgetColor }} /></div>
                      </td>
                      <td><span className={`${styles.badge} ${styles[row.violationTone]}`}>{row.violations}</span></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className={styles.btnPm} onClick={() => setActiveModal('deptBudgetModal')}>Budgets</button>
                          <button className={styles.btnPm} onClick={() => setActiveModal('policyViolationModal')}>Audit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CardAnalyticsReportingModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
