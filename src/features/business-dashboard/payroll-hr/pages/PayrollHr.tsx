import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/payroll-hr.module.css'
import PayrollHrModals from '../components/PayrollHrModals'

/* ============================================================================
   PayMo BaaS — Payroll & HR (legacy page 3.4)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; extra?: { label: string; value: string }[]; progress?: { percent: number; color: string }; avatarGroup?: { initials: string[]; bg: string } }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface ComplianceAlert { icon: string; iconBg: string; iconColor: string; title: string; sub: string; tone: BadgeTone }
interface EmployeeRow { name: string; department: string; position: string; salary: string; status: string; statusTone: BadgeTone; modal: string }
interface BatchRow { id: string; period: string; employees: number; totalCost: string; status: string; statusTone: BadgeTone; modal: string }
interface ActionCard { key: string; icon: string; iconColor: string; title: string; desc: string; modal: string }
interface RequestRow { name: string; type: string; dates: string; amount: string; status: string; statusTone: BadgeTone; modal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface PayrollConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; current: string }
  pageTitle: string
  pageSub: string
  heroStats: HeroStat[]
  attentionItems: FeedItem[]
  complianceAlerts: ComplianceAlert[]
  quickActions: QuickAction[]
  employees: EmployeeRow[]
  batches: BatchRow[]
  actionCards: ActionCard[]
  requests: RequestRow[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: PayrollConfig = {
  nav: [
    { icon: 'bi-house', title: 'Business Overview' },
    { icon: 'bi-shop', title: 'Collections' },
    { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll', active: true, dot: true },
    { icon: 'bi-send', title: 'Bulk Disbursements' },
    { icon: 'bi-cash-coin', title: 'Accounts Payable' },
    { icon: 'bi-gear', title: 'Business Settings' },
  ],
  headerTitle: 'Acme Corp Ltd',
  headerSub: '142 Active Employees · KRA: P051234567M',
  searchPlaceholder: 'Search employees, payroll runs, payslips, compliance...',
  user: { initials: 'A', name: 'Admin', role: 'HR Manager', avatarBg: 'linear-gradient(135deg, #A7F3D0 0%, #34D399 100%)' },
  breadcrumb: { parent: 'Business Portal', current: 'Payroll & HR' },
  pageTitle: 'PAGE 3.4 — Payroll & Salary Disbursement',
  pageSub: 'Manage employees, run payroll, generate payslips, and ensure statutory compliance.',
  heroStats: [
    { key: 'nextPayroll', col: 'col-lg-3 col-md-6', label: 'NEXT PAYROLL', value: '28 Jun 2025', badge: { icon: 'bi-calendar', text: 'Regular Run', tone: 'badgeI' }, extra: [{ label: 'Type', value: 'Monthly' }, { label: 'Approver', value: 'CFO' }] },
    { key: 'totalCost', col: 'col-lg-3 col-md-6', label: 'EST. TOTAL COST', value: 'KES 4.2M', badge: { icon: 'bi-graph-up-arrow', text: 'Within budget', tone: 'badgeS' }, progress: { percent: 78, color: 'var(--pm-accent)' }, extra: [{ label: 'Budget', value: 'KES 5.4M' }, { label: 'Utilized', value: '78%' }] },
    { key: 'employees', col: 'col-lg-3 col-md-6', label: 'ACTIVE EMPLOYEES', value: '142', badge: { icon: 'bi-plus-circle', text: '+3 this month', tone: 'badgeS' }, avatarGroup: { initials: ['JM', 'AK', 'SW', 'PK', 'AD'], bg: 'var(--pm-accent-soft)' } },
    { key: 'compliance', col: 'col-lg-3 col-md-6', label: 'COMPLIANCE STATUS', value: 'Updating', badge: { icon: 'bi-shield-check', text: 'KRA P10 Ready', tone: 'badgeS' }, extra: [{ label: 'SHIF/NSSF', value: 'Updating' }, { label: 'Housing Levy', value: 'Compliant' }] },
  ],
  attentionItems: [
    { icon: 'bi-calendar-x', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '4 Leave Requests Pending', sub: 'John M. (3 days), Mary K. (2 days), 2 others', btnLabel: 'Review', btnClass: '', modal: 'leaveApprovalModal' },
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Missing KRA PINs for 3 Employees', sub: 'Required before next payroll run on 28 Jun', btnLabel: 'Fix Now', btnClass: 'btnPmD', modal: 'editEmployeeModal' },
    { icon: 'bi-cash-coin', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: '2 Expense Claims Submitted', sub: 'Mary K. KES 4,500 · Ali O. KES 2,800', btnLabel: 'Approve', modal: 'expenseApprovalModal' },
    { icon: 'bi-bank', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: '2 Invalid Bank Accounts', sub: 'Wanjiku N. & Grace T. — account length mismatch', btnLabel: 'Fix', btnClass: 'btnPmD', modal: 'editEmployeeModal' },
  ],
  complianceAlerts: [
    { icon: 'bi-file-earmark-text', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'P9A Certificates Ready', sub: 'Download and distribute to all 142 employees', tone: 'badgeS' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'SHIF Deduction Updated', sub: 'New rate: 2.75% effective July 2025', tone: 'badgeI' },
    { icon: 'bi-building', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Housing Levy Compliance', sub: '1.5% employer + 1.5% employee contribution', tone: 'badgeW' },
    { icon: 'bi-calendar-check', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'File May Statutory Returns', sub: 'Deadline: 9 Jul 2025 · KES 312K total', tone: 'badgeD' },
  ],
  quickActions: [
    { icon: 'bi-people', iconColor: 'var(--pm-primary)', label: 'Run Payroll', modal: 'runPayrollModal' },
    { icon: 'bi-person-plus', iconColor: 'var(--pm-accent)', label: 'Add Employee', modal: 'addEmployeeModal' },
    { icon: 'bi-check-circle', iconColor: 'var(--pm-info)', label: 'Approve Run', modal: 'approvePayrollModal' },
    { icon: 'bi-send', iconColor: 'var(--pm-purple)', label: 'B2C Disburse', modal: 'payMpesaBulkModal' },
    { icon: 'bi-sliders', iconColor: 'var(--pm-warning)', label: 'Components', modal: 'salaryComponentsModal' },
    { icon: 'bi-file-earmark-text', iconColor: 'var(--pm-danger)', label: 'Tax Reports', modal: 'generateReportsModal' },
    { icon: 'bi-envelope', iconColor: 'var(--pm-info)', label: 'Send Payslips', modal: 'sendPayslipsModal' },
    { icon: 'bi-laptop', iconColor: 'var(--pm-muted)', label: 'ESS Portal', modal: 'employeeSelfServiceModal' },
  ],
  employees: [
    { name: 'John Mwangi', department: 'Finance', position: 'Senior Accountant', salary: 'KES 85,000', status: 'Active', statusTone: 'badgeS', modal: 'editEmployeeModal' },
    { name: 'Mary Kamau', department: 'HR', position: 'HR Manager', salary: 'KES 95,000', status: 'Active', statusTone: 'badgeS', modal: 'editEmployeeModal' },
    { name: 'Ali Omondi', department: 'Operations', position: 'Ops Supervisor', salary: 'KES 72,000', status: 'New', statusTone: 'badgeI', modal: 'editEmployeeModal' },
    { name: 'Wanjiku Njeri', department: 'Sales', position: 'Sales Lead', salary: 'KES 68,000', status: 'Bank Issue', statusTone: 'badgeD', modal: 'editEmployeeModal' },
  ],
  batches: [
    { id: 'PRL-2025-06-REG', period: 'June 2025', employees: 142, totalCost: 'KES 4.2M', status: 'Pending Approval', statusTone: 'badgeW', modal: 'approvePayrollModal' },
    { id: 'PRL-2025-05-REG', period: 'May 2025', employees: 139, totalCost: 'KES 4.05M', status: 'Completed', statusTone: 'badgeS', modal: 'disbursementTrackingModal' },
    { id: 'PRL-2025-04-REG', period: 'April 2025', employees: 137, totalCost: 'KES 3.95M', status: 'Completed', statusTone: 'badgeS', modal: 'disbursementTrackingModal' },
  ],
  actionCards: [
    { key: 'payslips', icon: 'bi-file-earmark-text', iconColor: 'var(--pm-primary)', title: 'Generate Payslips', desc: 'PDF payslips for all 142 employees', modal: 'sendPayslipsModal' },
    { key: 'p10', icon: 'bi-shield-check', iconColor: 'var(--pm-accent)', title: 'P10 Tax Return', desc: 'Monthly KRA tax filing', modal: 'generateReportsModal' },
    { key: 'shif', icon: 'bi-heart-pulse', iconColor: 'var(--pm-info)', title: 'SHIF/NSSF Filing', desc: 'Statutory deductions filing', modal: 'generateReportsModal' },
    { key: 'annual', icon: 'bi-calendar-check', iconColor: 'var(--pm-warning)', title: 'Annual P9A', desc: 'Year-end tax certificates', modal: 'annualP9Modal' },
  ],
  requests: [
    { name: 'John Mwangi', type: 'Annual Leave', dates: '28 Jun – 2 Jul', amount: '3 days', status: 'Pending', statusTone: 'badgeW', modal: 'leaveApprovalModal' },
    { name: 'Mary Kamau', type: 'Expense Claim', dates: '20 Jun', amount: 'KES 4,500', status: 'Submitted', statusTone: 'badgeI', modal: 'expenseApprovalModal' },
    { name: 'Ali Omondi', type: 'Expense Claim', dates: '19 Jun', amount: 'KES 2,800', status: 'Submitted', statusTone: 'badgeI', modal: 'expenseApprovalModal' },
    { name: 'Grace T.', type: 'Annual Leave', dates: '5-7 Jul', amount: '2 days', status: 'Pending', statusTone: 'badgeW', modal: 'leaveApprovalModal' },
  ],
}

/* ---------- TanStack Query fetcher ---------- */
async function fetchPayrollData(): Promise<PayrollConfig> {
  const res = await fetch('/api/business-dashboard/payroll-hr')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function PayrollHr() {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData } = useQuery({
    queryKey: ['payroll-hr'],
    queryFn: fetchPayrollData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const config = apiData ?? initialMockData

  return (
    <div className={cx(s.bizPage, 'container-fluid')}>
      {/* CONTENT */}
      <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            {config.heroStats.map((hs) => (
              <div key={hs.key} className={hs.col}>
                <div className={cx(s.card, hs.key === 'nextPayroll' ? s.cardAccent : '')} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(hs.key === 'nextPayroll' ? 'runPayrollModal' : hs.key === 'compliance' ? 'complianceAlertsModal' : 'runPayrollModal')}>
                  <div className={s.sl} style={hs.labelColor ? { color: hs.labelColor } : {}}>{hs.label}</div>
                  <div className={s.sv}>{hs.value}</div>
                  {hs.badge && <span className={cx(s.badge, s[hs.badge.tone])}><i className={`bi ${hs.badge.icon}`} /> {hs.badge.text}</span>}
                  {hs.progress && <div className={s.progress}><div className={s.progressBar} style={{ width: `${hs.progress.percent}%`, background: hs.progress.color }} /></div>}
                  {hs.extra && <div className="d-flex gap-2 mt-2" style={{ fontSize: 12 }}>{hs.extra.map((e) => <span key={e.label}><strong>{e.value}</strong> <span style={{ color: 'var(--pm-muted)' }}>{e.label}</span></span>)}</div>}
                  {hs.avatarGroup && (
                    <div className="d-flex gap-1 mt-2">
                      {hs.avatarGroup!.initials.map((ini) => (
                        <div key={ini} className={cx(s.avatar)} style={{ width: 24, height: 24, fontSize: 9, background: hs.avatarGroup!.bg }}>{ini}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION */}
          <div className={s.card}>
            <h3 className={cx(s.st, 'text-danger')}><i className="bi bi-exclamation-triangle" style={{ color: 'var(--pm-danger)' }} /> Attention Required</h3>
            {config.attentionItems.map((ai) => (
              <div key={ai.title} className={s.feedItem}>
                <div className={s.iconCircle} style={{ background: ai.iconBg, color: ai.iconColor }}><i className={`bi ${ai.icon}`} /></div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ai.title}</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{ai.sub}</div></div>
                <button className={cx(s.btnPm, s.btnSm, ai.btnClass ? s[ai.btnClass] : '')} onClick={() => setActiveModal(ai.modal)}>{ai.btnLabel}</button>
              </div>
            ))}
          </div>

          {/* COMPLIANCE */}
          <div className={s.card}>
            <h3 className={cx(s.st, 'text-info')}><i className="bi bi-shield-check" style={{ color: 'var(--pm-info)' }} /> Compliance Alerts</h3>
            {config.complianceAlerts.map((ca) => (
              <div key={ca.title} className={s.complianceAlert} style={{ background: ca.iconBg }}>
                <div className={cx(s.iconCircle)} style={{ background: ca.iconBg, color: ca.iconColor, width: 36, height: 36, minWidth: 36, fontSize: 16 }}><i className={`bi ${ca.icon}`} /></div>
                <div style={{ flex: 1 }}><strong>{ca.title}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{ca.sub}</div></div>
                <span className={cx(s.badge, s[ca.tone])}>{ca.title.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className={s.card}>
            <h3 className={s.st}><i className="bi bi-grid-3x3-gap" style={{ color: 'var(--pm-primary)' }} /> Quick Actions</h3>
            <div className={s.quickGrid}>
              {config.quickActions.map((qa) => (
                <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                  <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3.4.1: Employee Database */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-success')}><i className="bi bi-people" style={{ color: 'var(--pm-accent)' }} /> 3.4.1 — Employee Database</h3>
                <p className={s.ss}>Manage employee records, departments, and payroll assignments.</p>
              </div>
              <div className="d-flex gap-2">
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('importEmployeesModal')}><i className="bi bi-upload" /> Import</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmA)} onClick={() => setActiveModal('addEmployeeModal')}><i className="bi bi-person-plus" /> Add</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Name</th><th>Department</th><th>Position</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.employees.map((emp) => (
                    <tr key={emp.name}>
                      <td><strong>{emp.name}</strong></td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                      <td>{emp.salary}</td>
                      <td><span className={cx(s.badge, s[emp.statusTone])}>{emp.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(emp.modal)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3.4.2: Payroll Execution & Approvals */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-primary')}><i className="bi bi-calculator" style={{ color: 'var(--pm-primary)' }} /> 3.4.2 — Payroll Execution & Approvals</h3>
                <p className={s.ss}>Run payroll batches, review, approve, and disburse salary payments.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('runPayrollModal')}><i className="bi bi-play-fill" /> Run</button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Batch ID</th><th>Period</th><th>Employees</th><th>Total Cost</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.batches.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td>{b.period}</td>
                      <td>{b.employees}</td>
                      <td>{b.totalCost}</td>
                      <td><span className={cx(s.badge, s[b.statusTone])}>{b.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(b.modal)}>{b.status === 'Pending Approval' ? 'Approve' : 'View'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
              <strong>Funding Limits:</strong> Current float KES 14.2M · Monthly payroll KES 4.2M · Buffer: KES 10M
            </div>
          </div>

          {/* SECTION 3.4.3: Payslip & Compliance */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-warning')}><i className="bi bi-file-earmark-text" style={{ color: 'var(--pm-warning)' }} /> 3.4.3 — Payslip & Compliance</h3>
                <p className={s.ss}>Generate payslips, file statutory returns, and manage tax documents.</p>
              </div>
            </div>
            <div className="row g-3">
              {config.actionCards.map((ac) => (
                <div key={ac.key} className="col-lg-3 col-md-6">
                  <div className={s.actionCard} onClick={() => setActiveModal(ac.modal)}>
                    <i className={`bi ${ac.icon}`} style={{ fontSize: 24, color: ac.iconColor }} />
                    <strong style={{ fontSize: 13 }}>{ac.title}</strong>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{ac.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3.4.4: Employee Self-Service */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-purple')}><i className="bi bi-laptop" style={{ color: 'var(--pm-purple)' }} /> 3.4.4 — Employee Self-Service</h3>
                <p className={s.ss}>Leave requests, expense claims, and employee portal management.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('employeeSelfServiceModal')}><i className="bi bi-laptop" /> ESS Portal</button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.requests.map((req) => (
                    <tr key={req.name + req.type}>
                      <td><strong>{req.name}</strong></td>
                      <td>{req.type}</td>
                      <td>{req.dates}</td>
                      <td>{req.amount}</td>
                      <td><span className={cx(s.badge, s[req.statusTone])}>{req.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(req.modal)}>{req.status === 'Pending' ? 'Review' : 'Approve'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* MODALS */}
      <PayrollHrModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
