import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/corporate-business-cards.module.css'
import CorporateBusinessCardsModals from '../components/CorporateBusinessCardsModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'

interface AttentionItem {
  initials: string
  iconBg: string
  iconColor: string
  title: string
  sub: string
  actionLabel: string
  actionClass?: string
  modal: string
}
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface IssuedCard {
  initials: string
  avatarBg?: string
  name: string
  dept: string
  type: string
  limit: string
  status: string
  statusTone: BadgeTone
  actionLabel: string
  modal: string
}
interface PolicyGroup { name: string; desc: string; members: string; active?: boolean }
interface ApprovalRow {
  initials: string
  employee: string
  merchant: string
  amount: string
  flag: string
  flagTone: BadgeTone
}
interface TxnRow {
  date: string
  employee: string
  merchant: string
  amount: string
  category: string
  receipt: string
  receiptTone: BadgeTone
  receiptIcon: string
  actionLabel: string
  modal: string
}
interface SettlementRow { period: string; amount: string; status: string; settled: string }

interface CorporateBusinessCardsConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: {
    activeCards: string
    activeSub: string
    actions: { label: string; modal: string }[]
  }
  stats: {
    pending: { value: string; badge: string; modal: string }
    spend: { value: string; badge: string; progressWidth: string }
    missing: { value: string; badge: string; oldest: string; modal: string }
  }
  attention: AttentionItem[]
  recommendations: AttentionItem[]
  quickActions: QuickAction[]
  recentlyIssued: IssuedCard[]
  programConfig: { label: string; sub: string; actionLabel: string; modal: string }[]
  policyGroups: PolicyGroup[]
  approvalQueue: ApprovalRow[]
  receiptStatus: { matched: string; missing: string; grace: string; pct: number }
  transactions: TxnRow[]
  billing: {
    balance: string
    due: string
    source: string
    unbilled: string
    modal: string
  }
  settlements: SettlementRow[]
}

const initialMockData: CorporateBusinessCardsConfig = {
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/cards' }],
    current: 'Corporate Programs',
  },
  pageCode: 'PAGE 5.6',
  pageTitle: 'Corporate & Business Card Programs',
  pageSub: 'Manage employee expense cards, setup policies, enforce approvals, automate reconciliation, and control corporate billing.',
  hero: {
    activeCards: '42 Active Cards',
    activeSub: '38 employee cards, 4 department cards linked to the centralized Acme Corp billing account.',
    actions: [
      { label: 'Issue New', modal: 'issueCardModal' },
      { label: 'View Directory', modal: 'cardRosterModal' },
      { label: 'Fund Program', modal: 'fundingModal' },
    ],
  },
  stats: {
    pending: { value: 'KES 485K', badge: '8 transactions', modal: 'approvalQueueModal' },
    spend: { value: 'KES 2.4M', badge: '12% under budget', progressWidth: '86%' },
    missing: { value: '14 items', badge: 'KES 312,400 unverified', oldest: '12 days ago', modal: 'missingReceiptsModal' },
  },
  attention: [
    { initials: 'AP', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Large software purchase approval', sub: 'S. Kamau · AWS EMEA · KES 145,000', actionLabel: 'Review', actionClass: 'btnPmP', modal: 'reviewTransactionModal' },
    { initials: 'MR', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Missing receipt over grace period', sub: 'P. Ochieng · Emirates Air · KES 85,200', actionLabel: 'Chase', modal: 'missingReceiptsModal' },
    { initials: 'PV', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Policy violation detected', sub: 'J. Njoroge · Weekend spend (blocked)', actionLabel: 'Inspect', modal: 'violationDetailsModal' },
    { initials: 'BL', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Marketing Card approaching limit', sub: 'KES 490K / 500K used · Reset in 4 days', actionLabel: 'Top-up', modal: 'editLimitModal' },
  ],
  recommendations: [
    { initials: 'SA', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Auto-approve recurring software', sub: 'Save 4 hours/month on SaaS approvals', actionLabel: 'Automate', modal: 'policyRulesModal' },
    { initials: 'MC', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Consolidate AWS spending', sub: '4 employees using personal cards for AWS', actionLabel: 'Issue Card', modal: 'issueCardModal' },
    { initials: 'VR', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Vendor redundancy detected', sub: 'Uber & Bolt used interchangeably', actionLabel: 'Report', modal: 'reportsModal' },
    { initials: 'FR', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Dormant cards present', sub: '3 issued cards not used in 90+ days', actionLabel: 'Review', modal: 'cardRosterModal' },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-accent)', label: 'Issue Card', modal: 'issueCardModal' },
    { icon: 'bi-people', iconColor: 'var(--pm-primary)', label: 'Bulk Upload', modal: 'bulkIssueModal' },
    { icon: 'bi-shield-lock', iconColor: 'var(--pm-warning)', label: 'Policy Rules', modal: 'policyRulesModal' },
    { icon: 'bi-check-circle', iconColor: 'var(--pm-purple)', label: 'Approvals', modal: 'approvalQueueModal' },
    { icon: 'bi-journal-check', iconColor: 'var(--pm-info)', label: 'Accounting', modal: 'reconciliationModal' },
    { icon: 'bi-bar-chart', iconColor: 'var(--pm-danger)', label: 'Reporting', modal: 'reportsModal' },
    { icon: 'bi-receipt', iconColor: 'var(--pm-primary)', label: 'Receipts', modal: 'missingReceiptsModal' },
    { icon: 'bi-cash', iconColor: 'var(--pm-accent)', label: 'Program Funding', modal: 'fundingModal' },
  ],
  recentlyIssued: [
    { initials: 'SK', name: 'Sarah Kamau', dept: 'Engineering', type: 'Virtual', limit: '150,000 /mo', status: 'Active', statusTone: 'badgeS', actionLabel: 'Manage', modal: 'manageEmployeeCardModal' },
    { initials: 'M', avatarBg: 'var(--pm-danger)', name: 'Marketing Dept', dept: 'Shared Procurement', type: 'Virtual', limit: '500,000 /mo', status: 'Active', statusTone: 'badgeS', actionLabel: 'Manage', modal: 'manageEmployeeCardModal' },
    { initials: 'PO', name: 'Peter Ochieng', dept: 'Sales', type: 'Physical', limit: '80,000 /mo', status: 'Dispatched', statusTone: 'badgeI', actionLabel: 'Track', modal: 'cardDeliveryModal' },
    { initials: 'P1', avatarBg: 'var(--pm-warning)', name: 'Project Alpha', dept: 'Vendor Payments', type: 'Virtual', limit: '1,000,000 fixed', status: 'Active', statusTone: 'badgeS', actionLabel: 'Manage', modal: 'manageEmployeeCardModal' },
  ],
  programConfig: [
    { label: 'Billing Structure', sub: 'Corporate liability, centralized', actionLabel: 'Edit', modal: 'billingSetupModal' },
    { label: 'Card Branding', sub: 'Acme Logo, Blue background', actionLabel: 'Edit', modal: 'brandingModal' },
    { label: 'Issuance Scope', sub: 'Domestic & Regional allowed', actionLabel: 'Edit', modal: 'policyRulesModal' },
  ],
  policyGroups: [
    { name: 'Executive Level', desc: 'KES 500K limit, T&E allowed, No auto-blocks', members: '6 employees' },
    { name: 'Standard Employee', desc: 'KES 50K limit, strict MCC blocks, weekend block', members: '24 employees', active: true },
    { name: 'Department Head', desc: 'KES 200K limit, Software & Procure allowed', members: '8 employees' },
  ],
  approvalQueue: [
    { initials: 'SK', employee: 'S. Kamau', merchant: 'AWS EMEA', amount: 'KES 145,000', flag: 'Exceeds KES 100K auto-limit', flagTone: 'badgeW' },
    { initials: 'JW', employee: 'J. Wanjiku', merchant: 'Sarova Stanley', amount: 'KES 24,500', flag: 'Requires Manager Auth', flagTone: 'badgeI' },
    { initials: 'DM', employee: 'D. Mutua', merchant: 'Apple Store', amount: 'KES 184,000', flag: 'Unauthorized MCC', flagTone: 'badgeD' },
  ],
  receiptStatus: { matched: '142 trans', missing: '14 trans', grace: '17 trans', pct: 82 },
  transactions: [
    { date: '28 Jun', employee: 'S. Kamau', merchant: 'Uber Kenya', amount: 'KES 1,200', category: 'Travel (GL-6100)', receipt: 'Matched', receiptTone: 'badgeS', receiptIcon: 'bi-check', actionLabel: 'View', modal: 'expenseDetailModal' },
    { date: '27 Jun', employee: 'P. Ochieng', merchant: 'Naivas Supermarket', amount: 'KES 4,850', category: 'Office Supplies (GL-5400)', receipt: 'Missing', receiptTone: 'badgeD', receiptIcon: 'bi-x', actionLabel: 'Upload', modal: 'uploadReceiptModal' },
    { date: '26 Jun', employee: 'Mktg Dept', merchant: 'Facebook Ads', amount: 'KES 45,000', category: 'Advertising (GL-7200)', receipt: 'Auto', receiptTone: 'badgeS', receiptIcon: 'bi-check', actionLabel: 'View', modal: 'expenseDetailModal' },
    { date: '25 Jun', employee: 'J. Wanjiku', merchant: 'Java House', amount: 'KES 8,500', category: 'Meals/Ent (GL-6300)', receipt: 'Day 3', receiptTone: 'badgeW', receiptIcon: 'bi-clock', actionLabel: 'Upload', modal: 'uploadReceiptModal' },
  ],
  billing: {
    balance: 'KES 2,410,500',
    due: 'Due on 05 Jul 2025',
    source: 'Equity Bank ***4491',
    unbilled: 'KES 185,200',
    modal: 'settlementModal',
  },
  settlements: [
    { period: 'May 01 – May 31, 2025', amount: 'KES 1,985,400', status: 'Paid in full', settled: '02 Jun 2025' },
    { period: 'Apr 01 – Apr 30, 2025', amount: 'KES 2,150,000', status: 'Paid in full', settled: '03 May 2025' },
    { period: 'Mar 01 – Mar 31, 2025', amount: 'KES 1,740,200', status: 'Paid in full', settled: '04 Apr 2025' },
  ],
}

async function fetchCorporateBusinessCards(): Promise<CorporateBusinessCardsConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/corporate-business-cards', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as CorporateBusinessCardsConfig
  } catch {
    return initialMockData
  }
}

export default function CorporateBusinessCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-corporate-business-cards'],
    queryFn: fetchCorporateBusinessCards,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    )
  }

  return (
    <div className={styles.corporateBusinessCards}>
      {error && !errorDismissed && (
        <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
          <span><i className="bi bi-exclamation-triangle me-2" />Failed to load program data. Showing cached data.</span>
          <button type="button" className="btn-close" onClick={() => setErrorDismissed(true)} />
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
          <button className={styles.btnPm} onClick={() => setActiveModal('policyRulesModal')}><i className="bi bi-shield-lock" /> Policies</button>
          <button className={styles.btnPm} onClick={() => setActiveModal('reconciliationModal')}><i className="bi bi-journal-check" /> Recon</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('issueCardModal')}><i className="bi bi-plus-lg" /> Issue Card</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* HERO STATS ROW */}
        <div className="row g-3">
          <div className="col-lg-4">
            <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Corporate card program active <span style={{ color: '#86efac' }}>●</span></p>
              <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>{config.hero.activeCards}</div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.activeSub}</p>
              <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                {config.hero.actions.map((a) => (
                  <button key={a.label} className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhostLight}`} onClick={() => setActiveModal(a.modal)}>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-6">
            <div className={styles.card} style={{ minHeight: 170 }}>
              <p className={styles.statLabel} style={{ color: 'var(--pm-warning)' }}>PENDING APPROVALS</p>
              <div className={styles.statValue} style={{ margin: '6px 0' }}>{config.stats.pending.value}</div>
              <span className={`${styles.badge} ${styles.badgeW}`}><i className="bi bi-clock" /> {config.stats.pending.badge}</span>
              <div className="mt-3">
                <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => setActiveModal(config.stats.pending.modal)}>Review Queue</button>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-4 col-6">
            <div className={styles.card} style={{ minHeight: 170 }}>
              <p className={styles.statLabel} style={{ color: 'var(--pm-info)' }}>TOTAL SPEND (MTD)</p>
              <div className={styles.statValue} style={{ margin: '6px 0' }}>{config.stats.spend.value}</div>
              <span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-graph-down-arrow" /> {config.stats.spend.badge}</span>
              <div className="mt-2">
                <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>Company budget limit</span><span>86%</span></div>
                <div className={`${styles.progress} mt-1`}><div className={styles.progressBar} style={{ width: config.stats.spend.progressWidth, background: 'var(--pm-info)' }} /></div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-4">
            <div className={styles.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-danger)' }}>
              <p className={styles.statLabel} style={{ color: 'var(--pm-danger)' }}>MISSING RECEIPTS</p>
              <div className={styles.statValue} style={{ margin: '6px 0' }}>{config.stats.missing.value}</div>
              <span className={`${styles.badge} ${styles.badgeD}`}><i className="bi bi-exclamation-triangle" /> {config.stats.missing.badge}</span>
              <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                <div>Oldest missing: <strong>{config.stats.missing.oldest}</strong></div>
                <div className="mt-1">
                  <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmDSoft}`} onClick={() => setActiveModal(config.stats.missing.modal)}>Chase Employees</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENTION / RECOMMENDATIONS / QUICK ACTIONS */}
        <div className="row g-3">
          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className={styles.sectionTitle}>Attention Required</h3>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('attentionCenterModal')}>View all</button>
              </div>
              {config.attention.map((item) => (
                <div key={item.title} className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>{item.initials}</div>
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
                <h3 className={styles.sectionTitle}>Smart Recommendations</h3>
                <span className={`${styles.badge} ${styles.badgeP}`}><i className="bi bi-stars" /> AI</span>
              </div>
              {config.recommendations.map((item) => (
                <div key={item.title} className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>{item.initials}</div>
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
                <h3 className={styles.sectionTitle}>Program Quick Actions</h3>
                <p className={styles.sectionSub}>Frequent corporate card tasks</p>
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

        {/* 5.6.1 — Corporate Card Program Setup */}
        <div className={styles.card}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
            <div>
              <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-2-front" style={{ color: 'var(--pm-primary)' }} /> 5.6.1 — Corporate Card Program Setup</h3>
              <p className={styles.sectionSub}>Manage program configuration, bulk employee issuance, department cards, and shared project virtual cards.</p>
            </div>
            <div className="d-flex" style={{ gap: 8 }}>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardRosterModal')}><i className="bi bi-list-ul" /> Full Directory</button>
              <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('issueCardModal')}><i className="bi bi-plus-lg" /> Issue Card</button>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-lg-7">
              <div className={styles.utilityBlock}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Recently Issued Cards</h4>
                <div className="table-responsive">
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Cardholder / Dept</th><th>Type</th><th>Limit (KES)</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {config.recentlyIssued.map((c) => (
                        <tr key={c.name}>
                          <td data-label="Cardholder / Dept">
                            <div className="d-flex align-items-center gap-2">
                              <div className={styles.avatar} style={{ width: 24, height: 24, fontSize: 10, ...(c.avatarBg ? { background: c.avatarBg } : {}) }}>{c.initials}</div>
                              <div>
                                <strong>{c.name}</strong>
                                <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{c.dept}</div>
                              </div>
                            </div>
                          </td>
                          <td data-label="Type"><span className={`${styles.badge} ${styles.badgeNeutral}`}>{c.type}</span></td>
                          <td data-label="Limit (KES)">{c.limit}</td>
                          <td data-label="Status"><span className={`${styles.badge} ${styles[c.statusTone]}`}>{c.status}</span></td>
                          <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(c.modal)}>{c.actionLabel}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className={styles.utilityBlock}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Program Configuration</h4>
                {config.programConfig.map((p) => (
                  <div key={p.label} className={styles.statusRow}>
                    <div>
                      <strong>{p.label}</strong>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{p.sub}</div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(p.modal)}>{p.actionLabel}</button>
                  </div>
                ))}
                <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-info-soft)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--pm-info)' }}><i className="bi bi-building" /> ACME CORP PROGRAM</div>
                  <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>KRA PIN: P051283991K<br />Dedicated BIN: 481920<br />Billing cycle ends: 30th of month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5.6.2 — Corporate Controls, Policies & Approvals */}
        <div className={styles.card}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
            <div>
              <h3 className={styles.sectionTitle}><i className="bi bi-shield-lock" style={{ color: 'var(--pm-warning)' }} /> 5.6.2 — Corporate Controls, Policies & Approvals</h3>
              <p className={styles.sectionSub}>Define strict spending policies, configure multi-tier approval workflows, and monitor real-time policy compliance.</p>
            </div>
            <div className="d-flex" style={{ gap: 8 }}>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('policyRulesModal')}><i className="bi bi-sliders" /> Edit Global Rules</button>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.utilityBlock}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Active Policy Groups</h4>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('createPolicyModal')}>New</button>
                </div>
                {config.policyGroups.map((g) => (
                  <div key={g.name} className={`${styles.policyCard} ${g.active ? styles.policyCardActive : ''}`} onClick={() => setActiveModal('policyRulesModal')}>
                    <strong>{g.name}</strong>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{g.desc}</div>
                    <div className="mt-2"><span className={`${styles.badge} ${styles.badgeNeutral}`}>{g.members}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-8">
              <div className={styles.utilityBlock}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Approval Workflow Queue</h4>
                  <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('approvalQueueModal')}>Process All</button>
                </div>
                <div className="table-responsive">
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Employee</th><th>Merchant</th><th>Amount</th><th>Policy Flag</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {config.approvalQueue.map((r) => (
                        <tr key={r.employee}>
                          <td data-label="Employee">
                            <div className="d-flex align-items-center gap-2">
                              <div className={styles.avatar} style={{ width: 24, height: 24, fontSize: 10 }}>{r.initials}</div>
                              <span>{r.employee}</span>
                            </div>
                          </td>
                          <td data-label="Merchant">{r.merchant}</td>
                          <td data-label="Amount"><strong>{r.amount}</strong></td>
                          <td data-label="Policy Flag"><span className={`${styles.badge} ${styles[r.flagTone]}`}>{r.flag}</span></td>
                          <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('reviewTransactionModal')}>Review</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5.6.3 — Expense Management & Reconciliation */}
        <div className={styles.card}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
            <div>
              <h3 className={styles.sectionTitle}><i className="bi bi-receipt" style={{ color: 'var(--pm-accent)' }} /> 5.6.3 — Expense Management & Reconciliation</h3>
              <p className={styles.sectionSub}>Automate receipt matching, categorize spend by MCC and cost centers, and push reconciled data to accounting systems.</p>
            </div>
            <div className="d-flex" style={{ gap: 8 }}>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('reconciliationModal')}><i className="bi bi-journal-arrow-up" /> Export GL</button>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('missingReceiptsModal')}><i className="bi bi-search" /> Find Missing</button>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-lg-3">
              <div className={styles.utilityBlock}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Receipt Status (MTD)</h4>
                <div className={`${styles.donut} mx-auto mb-3`}>
                  <svg viewBox="0 0 36 36" width="100%" height="100%">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--pm-border)" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--pm-accent)" strokeWidth="4" strokeDasharray={`${config.receiptStatus.pct} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--pm-danger)" strokeWidth="4" strokeDasharray={`${100 - config.receiptStatus.pct} 100`} strokeDashoffset={-config.receiptStatus.pct} transform="rotate(-90 18 18)" />
                  </svg>
                  <div className={styles.donutLabel}>{config.receiptStatus.pct}%</div>
                </div>
                <div className="text-center" style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Matched & Verified</div>
                <hr className={styles.divider} />
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span>Matched</span><strong style={{ color: 'var(--pm-accent)' }}>{config.receiptStatus.matched}</strong></div>
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span>Missing</span><strong style={{ color: 'var(--pm-danger)' }}>{config.receiptStatus.missing}</strong></div>
                <div className="d-flex justify-content-between" style={{ fontSize: 12 }}><span>Grace Period</span><strong>{config.receiptStatus.grace}</strong></div>
              </div>
            </div>
            <div className="col-lg-9">
              <div className={styles.utilityBlock}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Recent Transactions & Coding</h4>
                <div className="table-responsive">
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Date</th><th>Employee</th><th>Merchant</th><th>Amount</th><th>Category / GL Code</th><th>Receipt</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {config.transactions.map((t, i) => (
                        <tr key={`${t.merchant}-${i}`}>
                          <td data-label="Date">{t.date}</td>
                          <td data-label="Employee">{t.employee}</td>
                          <td data-label="Merchant">{t.merchant}</td>
                          <td data-label="Amount">{t.amount}</td>
                          <td data-label="Category / GL Code"><span className={`${styles.badge} ${styles.badgeNeutral}`}>{t.category}</span></td>
                          <td data-label="Receipt"><span className={`${styles.badge} ${styles[t.receiptTone]}`}><i className={`bi ${t.receiptIcon}`} /> {t.receipt}</span></td>
                          <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(t.modal)}>{t.actionLabel}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5.6.4 — Corporate Card Billing & Settlement */}
        <div className={styles.card}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
            <div>
              <h3 className={styles.sectionTitle}><i className="bi bi-bank" style={{ color: 'var(--pm-info)' }} /> 5.6.4 — Corporate Card Billing & Settlement</h3>
              <p className={styles.sectionSub}>Manage consolidated statements, centralized payment accounts, and early settlement options.</p>
            </div>
            <div className="d-flex" style={{ gap: 8 }}>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('statementModal')}><i className="bi bi-file-earmark-pdf" /> Current Statement</button>
              <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('settlementModal')}><i className="bi bi-cash" /> Settle Balance</button>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.utilityBlock}>
                <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface)', border: '1px solid var(--pm-border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-muted)' }}>CURRENT STATEMENT BALANCE</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{config.billing.balance}</div>
                  <div style={{ fontSize: 12, color: 'var(--pm-danger)', marginTop: 4 }}>{config.billing.due}</div>
                </div>
                <div className={styles.statusRow}>
                  <div>
                    <strong>Auto-Debit Source</strong>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{config.billing.source}</div>
                  </div>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Active</span>
                </div>
                <div className={styles.statusRow}>
                  <div>
                    <strong>Unbilled Spend</strong>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Current open cycle</div>
                  </div>
                  <strong>{config.billing.unbilled}</strong>
                </div>
                <div className="mt-3">
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => setActiveModal(config.billing.modal)}>Pay Now Manually</button>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className={styles.utilityBlock}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Recent Settlements & Invoices</h4>
                <div className="table-responsive">
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Statement Period</th><th>Amount Due</th><th>Status</th><th>Settled Date</th><th>Receipt</th></tr>
                    </thead>
                    <tbody>
                      {config.settlements.map((s) => (
                        <tr key={s.period}>
                          <td data-label="Statement Period">{s.period}</td>
                          <td data-label="Amount Due">{s.amount}</td>
                          <td data-label="Status"><span className={`${styles.badge} ${styles.badgeS}`}>{s.status}</span></td>
                          <td data-label="Settled Date">{s.settled}</td>
                          <td data-label="Receipt"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('statementModal')}><i className="bi bi-download" /></button></td>
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

      <CorporateBusinessCardsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
