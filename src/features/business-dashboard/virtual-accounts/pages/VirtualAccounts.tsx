import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/virtual-accounts.module.css'
import VirtualAccountsModals from '../components/VirtualAccountsModals'

/* ============================================================================
   PayMo BaaS — Virtual Accounts & Sub-Accounts (legacy page 3.9)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface User { initials: string; name: string; role: string }
interface VARow { id: string; name: string; type: string; balance: string; subs: number; status: string; rules: number }
interface SubRow { id: string; name: string; parent: string; balance: string; limit: string; status: string }
interface FundingRow { date: string; va: string; desc: string; amount: string; status: string; statusTone: BadgeTone }
interface ReconRow { va: string; book: string; bank: string; diff: string; status: string; statusTone: BadgeTone; action?: string }
interface LimitRow { label: string; value: string; tone: BadgeTone }
interface RuleRow { label: string; status: string; tone: BadgeTone }
interface SweepRow { label: string; status: string; tone: BadgeTone }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface HealthRow { account: string; score: number; issues: string; status: string; tone: BadgeTone }
interface ApprovalRow { label: string; level: string; tone: BadgeTone }

interface VAConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; mid: string; current: string }
  pageTitle: string
  pageSub: string
  attentionItems: AttentionItem[]
  suggestions: SuggestionItem[]
  quickActions: QuickAction[]
  vaRows: VARow[]
  subRows: SubRow[]
  fundingRows: FundingRow[]
  reconRows: ReconRow[]
  limits: LimitRow[]
  approvalMatrix: ApprovalRow[]
  rules: RuleRow[]
  sweeps: SweepRow[]
  healthRows: HealthRow[]
}

const initialMockData: VAConfig = {
  nav: [
    { icon: 'bi-house', title: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', title: 'Overview' },
    { icon: 'bi-lightning-charge', title: 'Payments' },
    { icon: 'bi-briefcase', title: 'Services' },
    { icon: 'bi-wallet2', title: 'Treasury' },
    { icon: 'bi-diagram-3', title: 'Virtual Accts', active: true, dot: true },
    { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Virtual Accounts & Sub-Accounts',
  headerSub: 'Business virtual accounts, sub-account hierarchy, funding, reconciliation & automation',
  searchPlaceholder: 'Search virtual accounts, sub-accounts, transactions, rules...',
  user: { initials: 'BK', name: 'Business Owner', role: 'Finance Director' },
  breadcrumb: { parent: 'Business Portal', mid: 'Treasury', current: 'Virtual Accounts' },
  pageTitle: 'PAGE 3.9 — Virtual Accounts & Sub-Accounts',
  pageSub: 'Create, manage and reconcile business virtual accounts and sub-accounts with full funding controls, hierarchy, automation rules and audit trails.',
  attentionItems: [
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Unmatched credit KES 1.2M', sub: 'VA-003 • 26 Jun', btnLabel: 'Resolve', modal: 'reconModal' },
    { icon: 'bi-clock', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Sub-account limit breach', sub: 'Payroll Sub • KES 450K over', btnLabel: 'Adjust', modal: 'subLimitModal' },
    { icon: 'bi-pause-circle', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Auto-sweep rule paused', sub: 'Collections VA • 3 days', btnLabel: 'Resume', modal: 'autoSweepModal' },
    { icon: 'bi-exclamation-diamond', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Bank error ticket open', sub: 'Duplicate debit KES 125K', btnLabel: 'Track', modal: 'bankErrorModal' },
  ],
  suggestions: [
    { icon: 'bi-lightbulb', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Consolidate 3 inactive VAs', sub: 'Save KES 12,500/year in fees', btnLabel: 'Review', modal: 'consolidateModal' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Enable dual approval', sub: 'For sub-accounts > KES 500K', btnLabel: 'Enable', modal: 'approvalRulesModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Optimize sweep rules', sub: '3 rules could reduce idle balances', btnLabel: 'Optimize', modal: 'autoSweepModal' },
    { icon: 'bi-graph-up', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Monthly reconciliation report ready', sub: 'June 2025 • 99.2% match rate', btnLabel: 'View', modal: 'exportReportModal' },
  ],
  quickActions: [
    { icon: 'bi-plus-lg', iconColor: 'var(--pm-primary)', label: 'New VA', modal: 'createVA' },
    { icon: 'bi-diagram-3', iconColor: 'var(--pm-accent)', label: 'New Sub', modal: 'createSub' },
    { icon: 'bi-cash-stack', iconColor: 'var(--pm-warning)', label: 'Fund VA', modal: 'fundVA' },
    { icon: 'bi-list-check', iconColor: 'var(--pm-info)', label: 'Reconcile', modal: 'reconModal' },
    { icon: 'bi-upload', iconColor: 'var(--pm-purple)', label: 'Bulk Upload', modal: 'bulkFundModal' },
    { icon: 'bi-file-earmark-spreadsheet', iconColor: 'var(--pm-danger)', label: 'Export', modal: 'exportReportModal' },
  ],
  vaRows: [
    { id: 'VA-001', name: 'Operations', type: 'General', balance: '8.9M', subs: 3, status: 'Active', rules: 2 },
    { id: 'VA-003', name: 'Client Collections', type: 'Collections', balance: '12.4M', subs: 8, status: 'Active', rules: 3 },
    { id: 'VA-007', name: 'Payroll', type: 'Restricted', balance: '22.1M', subs: 5, status: 'Active', rules: 1 },
    { id: 'VA-009', name: 'Marketing', type: 'Project', balance: '3.2M', subs: 4, status: 'Active', rules: 2 },
    { id: 'VA-012', name: 'Old Project Reserve', type: 'Reserve', balance: '1.2M', subs: 0, status: 'Active', rules: 0 },
  ],
  subRows: [
    { id: 'SUB-0142', name: 'Project Alpha', parent: 'VA-003', balance: '2.1M', limit: '2.5M', status: 'active' },
    { id: 'SUB-0143', name: 'Project Beta', parent: 'VA-003', balance: '1.8M', limit: '2.0M', status: 'active' },
    { id: 'SUB-0144', name: 'Project Gamma', parent: 'VA-003', balance: '2.45M', limit: '2.0M', status: 'warning' },
    { id: 'SUB-0071', name: 'June Salaries', parent: 'VA-007', balance: '8.9M', limit: '10M', status: 'active' },
    { id: 'SUB-0121', name: 'Campaign Q2', parent: 'VA-009', balance: '450K', limit: '500K', status: 'active' },
  ],
  fundingRows: [
    { date: '27 Jun', va: 'VA-003', desc: 'Client payment', amount: 'KES 2.45M', status: 'Success', statusTone: 'badgeS' },
    { date: '26 Jun', va: 'VA-007', desc: 'Payroll funding', amount: 'KES 8.5M', status: 'Success', statusTone: 'badgeS' },
    { date: '25 Jun', va: 'SUB-012', desc: 'Campaign top-up', amount: 'KES 450K', status: 'Success', statusTone: 'badgeS' },
  ],
  reconRows: [
    { va: 'VA-003', book: 'KES 12.4M', bank: 'KES 12.4M', diff: '0', status: 'Cleared', statusTone: 'badgeS' },
    { va: 'VA-001', book: 'KES 8.9M', bank: 'KES 8.775M', diff: 'KES 125K', status: 'Bank error', statusTone: 'badgeD', action: 'Track' },
    { va: 'VA-007', book: 'KES 22.1M', bank: 'KES 22.1M', diff: '0', status: 'Cleared', statusTone: 'badgeS' },
  ],
  limits: [
    { label: 'VA-003 Daily', value: 'KES 5M', tone: 'badgeS' },
    { label: 'VA-007 Daily', value: 'KES 10M', tone: 'badgeS' },
    { label: 'SUB-0142 Daily', value: 'KES 500K', tone: 'badgeW' },
  ],
  approvalMatrix: [
    { label: 'Up to KES 100K', level: 'Auto', tone: 'badgeS' },
    { label: 'KES 100K – 500K', level: 'Manager', tone: 'badgeI' },
    { label: 'KES 500K – 2M', level: 'Director', tone: 'badgeW' },
    { label: 'Above KES 2M', level: 'CFO + Board', tone: 'badgeD' },
  ],
  rules: [
    { label: 'Auto-sweep', status: 'Active', tone: 'badgeS' },
    { label: 'Low balance alert', status: 'Active', tone: 'badgeS' },
    { label: 'Dual approval', status: 'Paused', tone: 'badgeW' },
  ],
  sweeps: [
    { label: 'Collections → Treasury', status: 'Active', tone: 'badgeS' },
    { label: 'Operations → Reserve', status: 'Active', tone: 'badgeS' },
  ],
  healthRows: [
    { account: 'VA-003', score: 98, issues: 'None', status: 'Healthy', tone: 'badgeS' },
    { account: 'VA-007', score: 91, issues: '1 limit breach', status: 'Warning', tone: 'badgeW' },
    { account: 'SUB-0144', score: 72, issues: 'Over limit, no rule', status: 'Critical', tone: 'badgeD' },
  ],
}

async function fetchVAContent(): Promise<VAConfig> {
  const res = await fetch('/api/business/virtual-accounts')
  if (!res.ok) throw new Error('Failed to fetch virtual accounts data')
  return res.json()
}

export default function VirtualAccounts() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['business-virtual-accounts'],
    queryFn: fetchVAContent,
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
              <div className={cx(s.avatar, s.avatarLarge)}>BK</div>
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
            <button className={s.headerBtn} onClick={() => setActiveModal('healthCheckModal')}><i className="bi bi-heart-pulse" /></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('reconModal')}><i className="bi bi-list-check" /><span className={s.counter}>4</span></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('notifModal')}><i className="bi bi-bell" /><span className={s.counter}>9</span></button>
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
            <button className={s.btnPm} onClick={() => setActiveModal('healthCheckModal')}><i className="bi bi-heart-pulse" /> Health</button>
            <button className={s.btnPm} onClick={() => setActiveModal('reconModal')}><i className="bi bi-list-check" /> Reconcile</button>
            <button className={s.btnPm} onClick={() => setActiveModal('createVA')}><i className="bi bi-plus-lg" /> New VA</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => setActiveModal('createSub')}><i className="bi bi-diagram-3" /> New Sub-Account</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Virtual accounts live <span style={{ color: '#86efac' }}>●</span></p>
                <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>18 virtual accounts</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>12 main VAs + 47 sub-accounts • KES 124.8M total balance • 6 automated rules active</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('createVA')}>New VA</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('createSub')}>New Sub</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('bulkFundModal')}>Bulk Fund</button>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: 'var(--pm-accent)' }}>TOTAL BALANCE</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>KES 124.8M</div>
                <span className={cx(s.badge, s.badgeS)}><i className="bi bi-graph-up" /> +12.4% MoM</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Main VAs: KES 89.4M<br />Sub-accounts: KES 35.4M</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6">
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: 'var(--pm-info)' }}>THIS MONTH ACTIVITY</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>KES 312.6M</div>
                <span className={cx(s.badge, s.badgeI)}><i className="bi bi-arrow-left-right" /> 4,812 txns</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Collections: KES 198.2M<br />Disbursements: KES 114.4M</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4">
              <div className={s.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-warning)' }}>
                <p className={s.sl} style={{ color: 'var(--pm-warning)' }}>RECONCILIATION STATUS</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>4 issues</div>
                <span className={cx(s.badge, s.badgeW)}><i className="bi bi-exclamation-triangle" /> Review needed</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>2 unmatched credits<br />1 timing difference<br />1 bank error</div>
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
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
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
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
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
                  <p className={s.ss}>Frequent VA workflows</p>
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

          {/* SECTION 3.9.1: Virtual Account Registry */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-journal-bookmark" style={{ color: 'var(--pm-primary)' }} /> 3.9.1 — Virtual Account Registry</h3>
                <p className={s.ss}>Manage business virtual accounts, sub-account hierarchy, and funding.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('consolidateModal')}><i className="bi bi-compress-arrows" /> Consolidate</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('createVA')}><i className="bi bi-plus-lg" /> New VA</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Virtual Accounts</h4>
                    <div className={cx(s.pills)}>
                      <button className={cx(s.pill, s.pillActive)}>All</button>
                      <button className={s.pill}>Active</button>
                      <button className={s.pill}>Restricted</button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Balance</th><th>Subs</th><th>Status</th><th>Rules</th><th>Actions</th></tr></thead>
                      <tbody>
                        {config.vaRows.map((v) => (
                          <tr key={v.id}>
                            <td><code>{v.id}</code></td>
                            <td>{v.name}</td>
                            <td>{v.type}</td>
                            <td><strong>KES {v.balance}</strong></td>
                            <td>{v.subs}</td>
                            <td><span className={cx(s.badge, s.badgeS)}>Active</span></td>
                            <td>{v.rules}</td>
                            <td>
                              <div className="d-flex" style={{ gap: 4 }}>
                                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('fundVA')}><i className="bi bi-cash-stack" /></button>
                                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('createSub')}><i className="bi bi-diagram-3" /></button>
                                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('healthCheckModal')}><i className="bi bi-heart-pulse" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={cx(s.utilityBlock, 'mb-3')}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Account Hierarchy</h4>
                  <div className={s.hierarchyNode}>
                    <div style={{ fontWeight: 700 }}>VA-003 — Client Collections</div>
                    <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Balance: KES 12.4M | 8 sub-accounts</div>
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    {config.subRows.filter(r => r.parent === 'VA-003').map((sub) => (
                      <div key={sub.id} className={s.hierarchyChild}>
                        <strong>{sub.id} — {sub.name}</strong>{' '}
                        <span className={cx(s.badge, sub.status === 'active' ? s.badgeS : s.badgeW)}>
                          KES {sub.balance}{sub.status === 'warning' ? ' (over)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Recent Funding</h4>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Date</th><th>VA</th><th>Source</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {config.fundingRows.map((f) => (
                          <tr key={f.date + f.va}>
                            <td>{f.date}</td>
                            <td>{f.va}</td>
                            <td>{f.desc}</td>
                            <td><strong>{f.amount}</strong></td>
                            <td><span className={cx(s.badge, s[f.statusTone])}>{f.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.9.2: Sub-Account Management */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-diagram-3" style={{ color: 'var(--pm-accent)' }} /> 3.9.2 — Sub-Account Management</h3>
                <p className={s.ss}>Create sub-accounts under parent VAs, set spending limits, and track budgets.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('subLimitModal')}><i className="bi bi-sliders" /> Limits</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('createSub')}><i className="bi bi-plus-lg" /> New Sub</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Sub-ID</th><th>Parent</th><th>Balance</th><th>Limit</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.subRows.map((sub) => (
                    <tr key={sub.id}>
                      <td><code>{sub.id}</code></td>
                      <td>{sub.parent}</td>
                      <td><strong>KES {sub.balance}</strong></td>
                      <td>KES {sub.limit}</td>
                      <td><span className={cx(s.badge, sub.status === 'active' ? s.badgeS : s.badgeW)}>{sub.status === 'active' ? 'Active' : 'Warning'}</span></td>
                      <td>
                        <div className="d-flex" style={{ gap: 4 }}>
                          <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('subLimitModal')}><i className="bi bi-sliders" /></button>
                          <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('transferModal')}><i className="bi bi-arrow-left-right" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3.9.3: Funding & Internal Transfers */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-cash-stack" style={{ color: 'var(--pm-warning)' }} /> 3.9.3 — Funding & Internal Transfers</h3>
                <p className={s.ss}>Fund virtual accounts via M-Pesa, bank transfer, or PayMo wallet. Bulk fund via CSV upload.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('fundVA')}><i className="bi bi-cash" /> Fund</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('bulkFundModal')}><i className="bi bi-upload" /> Bulk Fund</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Quick Fund</h4>
                  <div className="mb-3"><label className={s.formLabel}>Target Account</label>
                    <select className={s.formControl}>
                      <option>VA-003 — Client Collections</option>
                      <option>VA-007 — Payroll</option>
                      <option>VA-009 — Marketing</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="500000" /></div>
                  <div className="mb-3"><label className={s.formLabel}>Funding Source</label>
                    <select className={s.formControl}>
                      <option>M-Pesa PayBill</option>
                      <option>Bank Transfer</option>
                      <option>PayMo Wallet</option>
                    </select>
                  </div>
                  <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => setActiveModal('fundVA')}>Fund Now</button>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Internal Transfer</h4>
                  <div className="mb-3"><label className={s.formLabel}>From</label>
                    <select className={s.formControl}>
                      <option>VA-001 — Operations</option>
                      <option>VA-003 — Client Collections</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className={s.formLabel}>To</label>
                    <select className={s.formControl}>
                      <option>VA-007 — Payroll</option>
                      <option>VA-009 — Marketing</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="1000000" /></div>
                  <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => setActiveModal('transferModal')}>Transfer Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.9.4: Controls & Limits */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-sliders" style={{ color: 'var(--pm-info)' }} /> 3.9.4 — Virtual Account Controls & Limits</h3>
                <p className={s.ss}>Set spending limits, approval workflows, transaction rules and velocity controls per account and sub-account.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('approvalRulesModal')}>Approval Rules</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('velocityModal')}>Velocity Controls</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Daily Limits</h4>
                  {config.limits.map((l) => (
                    <div key={l.label} className={s.statusRow}>
                      <div><strong>{l.label}</strong></div>
                      <span className={cx(s.badge, s[l.tone])}>{l.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Approval Matrix</h4>
                  {config.approvalMatrix.map((a) => (
                    <div key={a.label} className={s.statusRow}>
                      <div><strong>{a.label}</strong></div>
                      <span className={cx(s.badge, s[a.tone])}>{a.level}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Rules</h4>
                  {config.rules.map((r) => (
                    <div key={r.label} className={s.statusRow}>
                      <div><strong>{r.label}</strong></div>
                      <span className={cx(s.badge, s[r.tone])}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.9.5: Reconciliation & Reporting */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-list-check" style={{ color: 'var(--pm-warning)' }} /> 3.9.5 — Reconciliation & Reporting</h3>
                <p className={s.ss}>Reconcile bank statements, match transactions, resolve discrepancies and generate comprehensive reports.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('reconModal')}>Reconcile Now</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('exportReportModal')}>Export Reports</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Reconciliation Dashboard</h4>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>VA / Sub</th><th>Book Balance</th><th>Bank Balance</th><th>Difference</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {config.reconRows.map((r) => (
                          <tr key={r.va}>
                            <td>{r.va}</td>
                            <td>{r.book}</td>
                            <td>{r.bank}</td>
                            <td>{r.diff}</td>
                            <td><span className={cx(s.badge, s[r.statusTone])}>{r.status}</span></td>
                            <td>{r.action ? <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('bankErrorModal')}>{r.action}</button> : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Quick Reports</h4>
                  <div className={s.quickGrid}>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportReportModal')}>Daily Summary</button>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportReportModal')}>Monthly Statement</button>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportReportModal')}>Sub-Account Report</button>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportReportModal')}>Audit Trail</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.9.6: Settings & Automation */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-cpu" style={{ color: 'var(--pm-purple)' }} /> 3.9.6 — Virtual Account Settings & Automation</h3>
                <p className={s.ss}>Configure auto-sweep rules, notification preferences, access controls and integration settings.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('autoSweepModal')}>Auto-Sweep</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('integrationModal')}>Integrations</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Auto-Sweep Rules</h4>
                  {config.sweeps.map((sw) => (
                    <div key={sw.label} className={s.statusRow}>
                      <div><strong>{sw.label}</strong></div>
                      <span className={cx(s.badge, s[sw.tone])}>{sw.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Notifications</h4>
                  <div className={s.statusRow}>
                    <div><strong>Low balance alerts</strong></div>
                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                  </div>
                  <div className={s.statusRow}>
                    <div><strong>Transaction notifications</strong></div>
                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                  </div>
                  <div className={s.statusRow}>
                    <div><strong>Limit breach alerts</strong></div>
                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Access & Security</h4>
                  <div className={s.statusRow}>
                    <div><strong>Multi-user access</strong></div><span className={cx(s.badge, s.badgeS)}>Enabled</span>
                  </div>
                  <div className={s.statusRow}>
                    <div><strong>API access</strong></div><span className={cx(s.badge, s.badgeS)}>Enabled</span>
                  </div>
                  <div className={s.statusRow}>
                    <div><strong>Webhook notifications</strong></div><span className={cx(s.badge, s.badgeW)}>Paused</span>
                  </div>
                  <button className={cx(s.btnPm, s.btnSm, 'mt-2 w-100')} onClick={() => setActiveModal('securityModal')}>Manage Security</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <VirtualAccountsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
