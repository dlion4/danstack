import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/command-center.module.css'
import CommandCenterModals from '../components/CommandCenterModals'

/* ============================================================================
   PayMo BaaS — Business Command Center (legacy page 3.1)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeDark'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface StatCard { key: string; col: string; label: string; labelColor?: string; value: string; valueColor?: string; badge?: { icon: string; text: string; tone: BadgeTone }; badgeExtra?: string; progress?: { percent: number; color: string; lines: string[] }; borderColor?: string; modal: string; extraContent?: string }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface ChartBar { month: string; target: number; actual: number; color: string }
interface AgingBlock { range: string; amount: string; color: string; bgColor: string; textColor: string }
interface ProfileField { label: string; value: string; mono?: boolean }
interface KybItem { name: string; badge: { icon: string; text: string; tone: BadgeTone } }
interface EntityRow { name: string; isCurrent?: boolean; role: string; balance: string; actionLabel: string; actionModal: string; actionDisabled?: boolean }
interface TeamRow { initials: string; name: string; email: string; avatarBg: string; roleBadge: { text: string; tone?: BadgeTone; customBg?: string; customColor?: string }; approvalLimit: string; mfa: { icon: string; text: string; tone: BadgeTone }; lastActive: string; actionLabel: string; actionModal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface CommandCenterConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; current: string }
  pageTitle: string
  pageSub: string
  statCards: StatCard[]
  attentionItems: FeedItem[]
  quickActions: QuickAction[]
  suggestion: { icon: string; title: string; text: string; btnLabel: string; modal: string }
  chartBars: ChartBar[]
  agingBlocks: AgingBlock[]
  profileFields: ProfileField[]
  kybItems: KybItem[]
  entities: EntityRow[]
  teamRows: TeamRow[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: CommandCenterConfig = {
  nav: [
    { icon: 'bi-grid-1x2', title: 'Command Center', active: true, dot: true },
    { icon: 'bi-shop', title: 'Collections & Merchants' },
    { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll' },
    { icon: 'bi-send', title: 'Disbursements' },
    { icon: 'bi-box-arrow-right', title: 'Payables' },
    { icon: 'bi-gear', title: 'Business Settings' },
  ],
  headerTitle: 'TechSolutions Ltd',
  headerSub: 'KRA PIN: P051234567M · Reg: PVT-2022/10492',
  searchPlaceholder: 'Search invoices, employees, payments, customers...',
  user: { initials: 'AD', name: 'Amina D.', role: 'Director (Admin)', avatarBg: 'var(--pm-primary)' },
  breadcrumb: { parent: 'Business Portal', current: 'Command Center' },
  pageTitle: 'PAGE 3.1 — Business Command Center',
  pageSub: 'Consolidated overview of collections, payroll, invoices, and business health.',
  statCards: [
    { key: 'cash', col: 'col-lg-3 col-md-6', label: 'AVAILABLE CASH POSITION', labelColor: 'var(--pm-muted)', value: 'KES 2.45M', badge: { icon: 'bi-bank', text: '+ KES 850K in transit', tone: 'badgeDark' }, modal: 'cashFlowDetailsModal' },
    { key: 'revenue', col: 'col-lg-3 col-md-6', label: 'MONTHLY REVENUE', value: 'KES 1.82M', valueColor: 'var(--pm-ink)', badge: { icon: 'bi-graph-up-arrow', text: '+12% vs last month', tone: 'badgeS' }, badgeExtra: 'Target: 2.0M', modal: 'revenueDetailsModal' },
    { key: 'expenses', col: 'col-lg-3 col-md-6', label: 'MONTHLY EXPENSES', value: 'KES 940K', valueColor: 'var(--pm-danger)', progress: { percent: 65, color: 'var(--pm-danger)', lines: ['Payroll: 450K', 'Supplier: 320K'] }, modal: 'expenseDetailsModal' },
    { key: 'pending', col: 'col-lg-3 col-md-6', label: 'PENDING APPROVALS', labelColor: 'var(--pm-warning)', value: '5 Actionable', borderColor: 'var(--pm-warning)', modal: 'pendingApprovalsModal', extraContent: 'Review Queue' },
  ],
  attentionItems: [
    { icon: 'bi-people', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Payroll Run: October 2025 Requires Approval', sub: '24 Employees · Total KES 450,500 · Maker: HR Dept', btnLabel: 'Review & Approve', btnClass: 'btnPmP', modal: 'runPayrollModal' },
    { icon: 'bi-shield-exclamation', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'KYB Update Required: Annual Returns', sub: 'Upload 2024 CR12 to maintain Tier 3 limit (Overdue in 5 days)', btnLabel: 'Upload Doc', btnClass: 'btnPmD', modal: 'kybUploadModal' },
    { icon: 'bi-receipt', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: '3 Invoices Aging > 60 Days', sub: 'Total outstanding: KES 145,000 · Action recommended', btnLabel: 'Send Reminders', btnClass: '', modal: 'agingInvoicesModal' },
  ],
  quickActions: [
    { icon: 'bi-receipt', iconColor: 'var(--pm-primary)', label: 'Invoice', modal: 'newInvoiceModal' },
    { icon: 'bi-people', iconColor: 'var(--pm-accent)', label: 'Payroll', modal: 'runPayrollModal' },
    { icon: 'bi-send', iconColor: 'var(--pm-info)', label: 'Disburse', modal: 'disburseFundsModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-purple)', label: 'Transfer', modal: 'interCompanyTransferModal' },
    { icon: 'bi-person-plus', iconColor: 'var(--pm-warning)', label: 'Add Team', modal: 'inviteUserModal' },
    { icon: 'bi-shield-check', iconColor: 'var(--pm-muted)', label: 'KYB', modal: 'kybUploadModal' },
  ],
  suggestion: { icon: 'bi-stars', title: 'Smart Suggestion', text: 'You have KES 1.2M idle cash. Consider moving 500K to the Money Market Fund to earn ~11% p.a.', btnLabel: 'View Investment Options', modal: 'interCompanyTransferModal' },
  chartBars: [
    { month: 'May', target: 60, actual: 55, color: 'var(--pm-muted)' },
    { month: 'Jun', target: 65, actual: 60, color: 'var(--pm-muted)' },
    { month: 'Jul', target: 70, actual: 75, color: 'var(--pm-accent)' },
    { month: 'Aug', target: 75, actual: 68, color: 'var(--pm-warning)' },
    { month: 'Sep', target: 80, actual: 85, color: 'var(--pm-accent)' },
    { month: 'Oct', target: 85, actual: 95, color: 'var(--pm-primary)' },
  ],
  agingBlocks: [
    { range: '0-30 Days', amount: 'KES 420K', color: '#047857', bgColor: 'var(--pm-accent-soft)', textColor: '#065F46' },
    { range: '31-60 Days', amount: 'KES 185K', color: '#B45309', bgColor: 'var(--pm-warning-soft)', textColor: '#92400E' },
    { range: '61-90+ Days', amount: 'KES 145K', color: '#DC2626', bgColor: 'var(--pm-danger-soft)', textColor: '#991B1B' },
  ],
  profileFields: [
    { label: 'Company Name', value: 'TechSolutions Ltd' },
    { label: 'KRA PIN', value: 'P051234567M', mono: true },
    { label: 'Registration Number', value: 'PVT-2022/10492' },
    { label: 'Business Type / Sector', value: 'LLC · IT Services' },
  ],
  kybItems: [
    { name: 'Certificate of Incorporation', badge: { icon: 'bi-check-circle', text: 'Verified', tone: 'badgeS' } },
    { name: 'KRA PIN Certificate', badge: { icon: 'bi-check-circle', text: 'Verified', tone: 'badgeS' } },
    { name: 'Tax Compliance Certificate', badge: { icon: 'bi-check-circle', text: 'Valid till Dec 2025', tone: 'badgeS' } },
    { name: 'Annual Returns (CR12)', badge: { icon: 'bi-exclamation-circle', text: 'Missing 2024', tone: 'badgeD' } },
  ],
  entities: [
    { name: 'TechSolutions Ltd', isCurrent: true, role: 'Owner', balance: '2.45M', actionLabel: 'Active', actionModal: '', actionDisabled: true },
    { name: 'TS Logistics & Delivery', role: 'Owner', balance: '8.10M', actionLabel: 'Transfer', actionModal: 'interCompanyTransferModal' },
    { name: 'TechSolutions Foundation', role: 'Admin', balance: '2.25M', actionLabel: 'Switch', actionModal: 'switchBusinessModal' },
  ],
  teamRows: [
    { initials: 'AD', name: 'Amina D.', email: 'amina@techsol.co.ke', avatarBg: 'var(--pm-primary)', roleBadge: { text: 'Owner', customBg: '#1E293B', customColor: '#fff' }, approvalLimit: 'Unlimited', mfa: { icon: 'bi-phone', text: 'Enforced', tone: 'badgeS' }, lastActive: 'Today, 09:41 AM', actionLabel: 'Edit', actionModal: 'viewUserModal' },
    { initials: 'PK', name: 'Peter K.', email: 'peter.k@techsol.co.ke', avatarBg: 'var(--pm-info)', roleBadge: { text: 'Finance Admin', tone: 'badgeI' }, approvalLimit: 'KES 1,000,000', mfa: { icon: 'bi-phone', text: 'Enforced', tone: 'badgeS' }, lastActive: 'Today, 08:15 AM', actionLabel: 'Edit', actionModal: 'viewUserModal' },
    { initials: 'SW', name: 'Sarah W.', email: 'sarah.hr@techsol.co.ke', avatarBg: 'var(--pm-warning)', roleBadge: { text: 'HR Manager', tone: 'badgeW' }, approvalLimit: 'KES 5,000,000 (Payroll)', mfa: { icon: 'bi-phone', text: 'Enforced', tone: 'badgeS' }, lastActive: 'Yesterday', actionLabel: 'Edit', actionModal: 'viewUserModal' },
    { initials: 'JM', name: 'John M.', email: 'john@techsol.co.ke', avatarBg: 'var(--pm-muted)', roleBadge: { text: 'Sales (Invoicing)', customBg: '#f1f5f9', customColor: 'var(--pm-ink-soft)' }, approvalLimit: 'None (Maker only)', mfa: { icon: 'bi-exclamation-circle', text: 'Pending Setup', tone: 'badgeD' }, lastActive: 'Never (Invited)', actionLabel: 'Manage', actionModal: 'viewUserModal' },
  ],
}

/* ---------- TanStack Query fetcher (backend-ready) ---------- */
async function fetchCommandCenterContent(): Promise<CommandCenterConfig> {
  const res = await fetch('/api/business/command-center')
  if (!res.ok) throw new Error('Failed to fetch command center data')
  return res.json()
}

export default function CommandCenter() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  /* ---------- TanStack Query ---------- */
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['business-command-center'],
    queryFn: fetchCommandCenterContent,
    staleTime: 5 * 60_000,
    retry: 1,
  })
  const config = apiData ?? initialMockData

  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  if (isLoading) {
    return (
      <div className={s.spinnerWrap} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={s.spinner} />
        <span style={{ marginTop: 12, fontWeight: 600, color: 'var(--pm-primary)' }}>Loading workspace…</span>
      </div>
    )
  }

  return (
    <div className={cx(s.bizPage, 'container-fluid')}>
      {/* CONTENT */}
      <div className={s.content}>
          {/* HERO ROW: Key Metrics */}
          <div className="row g-3">
            {config.statCards.map((sc) => (
              <div key={sc.key} className={sc.col}>
                <div
                  className={cx(s.card, sc.key === 'cash' && s.cardBiz)}
                  style={{
                    ...(sc.borderColor ? { borderLeft: `3px solid ${sc.borderColor}` } : {}),
                    ...(sc.modal ? { cursor: 'pointer' } : {}),
                  }}
                  onClick={sc.modal ? () => setActiveModal(sc.modal) : undefined}
                >
                  <div className={s.sl} style={sc.labelColor ? { color: sc.labelColor } : {}}>{sc.label}</div>
                  <div className={s.sv} style={sc.valueColor ? { color: sc.valueColor } : {}}>{sc.value}</div>
                  {sc.badge && (
                    <div className="d-flex align-items-center justify-content-between mt-2" style={{ fontSize: 12, ...(sc.key === 'cash' ? { color: 'rgba(255,255,255,.7)' } : {}) }}>
                      <span className={cx(s.badge, s[sc.badge.tone])}>
                        <i className={`bi ${sc.badge.icon}`} /> {sc.badge.text}
                      </span>
                      {sc.badgeExtra && <span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sc.badgeExtra}</span>}
                    </div>
                  )}
                  {sc.progress && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                        {sc.progress.lines.map((l, i) => <span key={i}>{l}</span>)}
                      </div>
                      <div className={s.progress}>
                        <div className={s.progressBar} style={{ width: `${sc.progress.percent}%`, background: sc.progress.color }} />
                      </div>
                    </div>
                  )}
                  {sc.extraContent && (
                    <div className="d-flex gap-2 mt-2">
                      <button className={cx(s.btnPm, s.btnSm)} style={{ flex: 1 }} onClick={() => setActiveModal(sc.modal)}>
                        {sc.extraContent}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION & QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-8">
              <div className={cx(s.card, 'h-100')}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.st}>Attention & Operations</h3>
                  <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('notificationsModal')}>View all</button>
                </div>
                {config.attentionItems.map((item) => (
                  <div key={item.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: item.iconBg, color: item.iconColor }}>
                      <i className={`bi ${item.icon}`} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{item.sub}</div>
                    </div>
                    <button className={cx(s.btnPm, s.btnSm, s[item.btnClass])} onClick={() => setActiveModal(item.modal)}>
                      {item.btnLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={cx(s.card, 'h-100')}>
                <h3 className={cx(s.st, 'mb-3')}>Quick Actions</h3>
                <div className={s.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <div key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                      <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
                      {qa.label}
                    </div>
                  ))}
                </div>
                <div className={s.suggestionBox} style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', marginBottom: 4 }}>
                    <i className={`bi ${config.suggestion.icon}`} /> {config.suggestion.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#065F46' }}>{config.suggestion.text}</div>
                  <button className={cx(s.btnPm, s.btnSm, 'mt-2 w-100')} style={{ background: '#fff', color: '#047857', borderColor: 'rgba(16,185,129,.3)' }} onClick={() => setActiveModal(config.suggestion.modal)}>
                    {config.suggestion.btnLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.1.1: Overview Dashboard */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className={cx(s.st, 'text-primary')}><i className="bi bi-graph-up" style={{ color: 'var(--pm-primary)' }} /> 3.1.1 — Business Overview Dashboard</h3>
                <p className={s.ss}>Collections vs Targets, Aging Invoices, and Disbursement Rates.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('collectionTargetModal')}>
                <i className="bi bi-sliders" /> Edit Targets
              </button>
            </div>
            <div className="row g-4">
              <div className="col-lg-6">
                <div className={s.statusBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Collections vs Target (Last 6 Months)</h4>
                  <div className={s.chartContainer}>
                    {config.chartBars.map((cb) => (
                      <div key={cb.month} className={s.chartBarWrapper} onClick={() => setActiveModal('revenueDetailsModal')}>
                        <div style={{ position: 'relative', width: 40, height: '100%', margin: '0 auto' }}>
                          <div style={{ width: '60%', height: `${cb.target}%`, background: 'var(--pm-border-2)', borderRadius: '4px 4px 0 0', position: 'absolute', bottom: 0, zIndex: 1 }} />
                          <div className={s.chartBarActual} style={{ height: `${cb.actual}%`, background: cb.color, width: '100%', borderRadius: '4px 4px 0 0', position: 'absolute', bottom: 0, zIndex: 2 }} />
                        </div>
                        <div className={s.chartLabel}>{cb.month}</div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-center gap-3 mt-3" style={{ fontSize: 11 }}>
                    <span className="d-flex align-items-center gap-1">
                      <div style={{ width: 10, height: 10, background: 'var(--pm-border-2)', borderRadius: 2 }} /> Target
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <div style={{ width: 10, height: 10, background: 'var(--pm-primary)', borderRadius: 2 }} /> Actual
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={s.statusBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Outstanding Invoices Aging</h4>
                  <div className="d-flex gap-2 h-100">
                    {config.agingBlocks.map((ab) => (
                      <div
                        key={ab.range}
                        className={s.agingBlock}
                        style={{ background: ab.bgColor, cursor: 'pointer' }}
                        onClick={() => setActiveModal('agingInvoicesModal')}
                      >
                        <div style={{ fontSize: 12, color: ab.color, fontWeight: 600 }}>{ab.range}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: ab.textColor }}>{ab.amount}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button className={cx(s.btnPm, s.btnSm, 'w-100')} onClick={() => setActiveModal('agingInvoicesModal')}>
                      <i className="bi bi-envelope" /> Send Auto-Reminders to All Overdue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW: PROFILE & MULTI-BIZ */}
          <div className="row g-3">
            {/* SECTION 3.1.2: Business Profile */}
            <div className="col-lg-6">
              <div className={cx(s.card, 'h-100')}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className={cx(s.st, 'text-info')}><i className="bi bi-building-check" style={{ color: 'var(--pm-info)' }} /> 3.1.2 — Business Profile & Settings</h3>
                    <p className={s.ss}>KYC/KYB status and corporate details.</p>
                  </div>
                  <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('businessSettingsModal')}>
                    <i className="bi bi-pencil" />
                  </button>
                </div>
                <div className="row g-2 mb-3">
                  {config.profileFields.map((pf) => (
                    <div key={pf.label} className="col-sm-6">
                      <div className={s.profileField}>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{pf.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, ...(pf.mono ? { fontFamily: 'monospace' } : {}) }}>{pf.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>Verification & KYB Status</h4>
                {config.kybItems.map((ki) => (
                  <div key={ki.name} className="d-flex justify-content-between align-items-center p-2 border-bottom" style={{ fontSize: 13 }}>
                    <span>{ki.name}</span>
                    <span className={cx(s.badge, s[ki.badge.tone])}>
                      <i className={`bi ${ki.badge.icon}`} /> {ki.badge.text}
                    </span>
                  </div>
                ))}
                <button className={cx(s.btnPm, s.btnSm, 'mt-2')} onClick={() => setActiveModal('kybUploadModal')}>
                  Manage Documents
                </button>
              </div>
            </div>

            {/* SECTION 3.1.3: Multi-Business */}
            <div className="col-lg-6">
              <div className={cx(s.card, 'h-100')}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className={s.st} style={{ color: 'var(--pm-purple)' }}>
                      <i className="bi bi-diagram-3" style={{ color: 'var(--pm-purple)' }} /> 3.1.3 — Multi-Business Management
                    </h3>
                    <p className={s.ss}>Switch accounts, view consolidated data, inter-company transfers.</p>
                  </div>
                  <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('switchBusinessModal')}>Switch</button>
                </div>
                <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-purple-soft)' }}>
                  <div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 700 }}>CONSOLIDATED GROUP CASH (3 ENTITIES)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-purple)' }}>KES 12.8M</div>
                  <div className="mt-2 d-flex gap-2">
                    <button className={cx(s.btnPm, s.btnSm)} style={{ borderColor: 'var(--pm-purple)', color: 'var(--pm-purple)' }} onClick={() => setActiveModal('consolidatedReportModal')}>
                      View Group Report
                    </button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className={s.tbl}>
                    <thead><tr><th>Entity Name</th><th>Role</th><th>Cash Bal</th><th>Action</th></tr></thead>
                    <tbody>
                      {config.entities.map((e) => (
                        <tr key={e.name} style={e.isCurrent ? { background: 'var(--pm-surface-2)' } : {}}>
                          <td><strong>{e.name}</strong>{e.isCurrent ? ' (Current)' : ''}</td>
                          <td>{e.role}</td>
                          <td>{e.balance}</td>
                          <td>
                            <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(e.actionModal)} disabled={e.actionDisabled}>
                              {e.actionLabel}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.1.4: Team & User Management */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-success')}><i className="bi bi-people" style={{ color: 'var(--pm-accent)' }} /> 3.1.4 — Team & User Management</h3>
                <p className={s.ss}>Manage roles, permissions, approval limits, and MFA requirements.</p>
              </div>
              <div className="d-flex gap-2">
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('rolePermissionsModal')}>
                  <i className="bi bi-shield-lock" /> View Roles Matrix
                </button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('inviteUserModal')}>
                  <i className="bi bi-person-plus" /> Invite User
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>User</th><th>Role / Dept</th><th>Approval Limit</th><th>MFA Status</th><th>Last Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.teamRows.map((tr) => (
                    <tr key={tr.email}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={s.avatar} style={{ width: 28, height: 28, fontSize: 10, background: tr.avatarBg }}>{tr.initials}</div>
                          <div><strong>{tr.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{tr.email}</div></div>
                        </div>
                      </td>
                      <td>
                        <span className={cx(s.badge, s[tr.roleBadge.tone ?? ''])} style={{ ...(tr.roleBadge.customBg ? { background: tr.roleBadge.customBg, color: tr.roleBadge.customColor } : {}) }}>
                          {tr.roleBadge.text}
                        </span>
                      </td>
                      <td>{tr.approvalLimit}</td>
                      <td>
                        <span className={cx(s.badge, s[tr.mfa.tone])}>
                          <i className={`bi ${tr.mfa.icon}`} /> {tr.mfa.text}
                        </span>
                      </td>
                      <td>{tr.lastActive}</td>
                      <td>
                        <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(tr.actionModal)}>
                          {tr.actionLabel}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* MODALS */}
      <CommandCenterModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
