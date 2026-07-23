import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/payroll-hr.module.css'

/* ============================================================================
   Payroll & HR — modal layer (legacy page 3.4, ~20+ modals)
   LEGACY BRIDGE: doAction, nextFlow, switchTab, cacheAndReset
   ========================================================================== */

interface ModalsProps { active: string | null; onClose: () => void; onOpen: (id: string) => void }
type Size = 'md' | 'lg' | 'xl'
interface MBoxProps { id: string; active: string | null; title: ReactNode; size?: Size; onClose: () => void; children: ReactNode; footer?: ReactNode }

function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

function MBox({ id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
  const s = styles as Record<string, string>
  if (active !== id) return null
  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
        <div className={`${s.modalBox} ${size === 'lg' ? s.modalBoxLg : ''} ${size === 'xl' ? s.modalBoxXl : ''}`}>
          <div className={s.modalHeader}><h5 className={s.modalTitle}>{title}</h5><button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div>
          <div className={s.modalBody}>{children}</div>
          {footer && <div className={s.modalFooter}>{footer}</div>}
        </div>
      </div>
    </>
  )
}

function BusyOverlay() {
  const s = styles as Record<string, string>
  return (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing...</p></div>)
}

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  payroll: { labels: ['Define', 'Review', 'Execute', 'Done'] },
  employee: { labels: ['Personal', 'Role', 'Payment', 'Done'] },
}

interface Result { msg: string; ref?: string }

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
  const s = styles as Record<string, string>
  const def = FLOW_DEFS[flowKey]
  if (!def) return null
  return (
    <div className={s.stepper}>
      {def.labels.map((label, i) => {
        const stepNum = i + 1
        const done = stepNum < current
        const active = stepNum === current
        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
            {i > 0 && <div className={s.stepLine} style={{ position: 'absolute', top: 14, left: '-50%', width: '100%', ...(done ? { background: 'var(--pm-accent)' } : {}) }} />}
            <div className={`${s.step} ${done ? s.stepDone : ''} ${active ? s.stepActive : ''}`}>
              <div className={s.stepN}>{done ? <i className="bi bi-check" /> : stepNum}</div>
              <div className={s.stepL}>{label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PayrollHrModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ payroll: 1, employee: 1 })
  const [_tabs, setTabs] = useState<Record<string, string>>({})

  useEffect(() => { if (active === null) { setResults({}); setFlows({ payroll: 1, employee: 1 }); setBusy(null); setTabs({}) } }, [active])
  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => { setResults((prev) => ({ ...prev, [modalId]: { msg, ref } })); setBusy(null) }, 1500)
  }

  const nextFlow = (key: string, total: number) => {
    const cur = flows[key] ?? 1
    if (cur >= total) { onClose(); return }
    setFlows((prev) => ({ ...prev, [key]: cur + 1 }))
  }

  const renderReceipt = (r: Result) => (
    <div className={s.receipt}>
      <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => downloadFile('receipt.txt', r.msg)}><i className="bi bi-download" /> Save</button>
        <button className={cx(s.btnPm, s.btnSm)} onClick={onClose}>Done</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  const rpStep = flows.payroll ?? 1
  const empStep = flows.employee ?? 1

  /* M1: Run Payroll (4-step multistep) */
  const renderRunPayroll = () => (
    <MBox id="runPayrollModal" active={active} onClose={onClose} title={<><i className="bi bi-people text-primary me-2" />Run Payroll</>} size="lg"
      footer={<>
        <button className={s.btnPm} onClick={onClose}>Cancel</button>
        {rpStep < 4 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('payroll', 4)}>
          {rpStep === 3 ? 'Submit Batch' : 'Next'} <i className={`bi ${rpStep === 3 ? 'bi-check2' : 'bi-arrow-right'}`} />
        </button>}
      </>}
    >
      <Stepper flowKey="payroll" current={rpStep} />
      {rpStep === 1 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Payroll Type</label><select className={s.formControl}><option>Regular (Monthly)</option><option>Supplementary</option><option>Off-cycle</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Pay Period</label><select className={s.formControl}><option>June 2025</option><option>May 2025</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Effective Date</label><input type="date" className={s.formControl} defaultValue="2025-06-28" /></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>142 employees</strong> · Est. total: KES 4.2M</div>
      </div>)}
      {rpStep === 2 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>Gross Pay</span><strong>KES 4,200,000</strong></div>
          <div className="d-flex justify-content-between"><span>Tax (PAYE)</span><strong style={{ color: 'var(--pm-danger)' }}>KES 620,000</strong></div>
          <div className="d-flex justify-content-between"><span>SHIF</span><strong>KES 115,500</strong></div>
          <div className="d-flex justify-content-between"><span>NSSF</span><strong>KES 84,000</strong></div>
          <div className="d-flex justify-content-between"><span>Housing Levy</span><strong>KES 63,000</strong></div>
          <hr className={s.divider} />
          <div className="d-flex justify-content-between"><span>Net Pay</span><strong style={{ color: 'var(--pm-accent)' }}>KES 3,317,500</strong></div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--pm-danger)' }}><i className="bi bi-exclamation-circle" /> 3 employees missing KRA PINs — will be excluded</div>
      </div>)}
      {rpStep === 3 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Disbursement Method</label><select className={s.formControl}><option>M-Pesa B2C (Auto)</option><option>Bank Transfer</option><option>Mixed</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Approver</label><select className={s.formControl}><option>CFO — Peter K.</option><option>CEO — Amina D.</option></select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-send payslips after disbursement</label></div>
      </div>)}
      {rpStep === 4 && renderActionBody('runPayrollModal', <div className={s.receipt}>
        <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
        <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Payroll batch submitted for approval!</h5>
        <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: PRL-2025-06-REG · 142 employees · KES 3,317,500 net</p>
      </div>)}
    </MBox>
  )

  /* M2: Add Employee (4-step) */
  const renderAddEmployee = () => (
    <MBox id="addEmployeeModal" active={active} onClose={onClose} title={<><i className="bi bi-person-plus text-success me-2" />Add Employee</>} size="lg"
      footer={<>
        <button className={s.btnPm} onClick={onClose}>Cancel</button>
        {empStep < 4 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('employee', 4)}>Continue <i className="bi bi-arrow-right" /></button>}
      </>}
    >
      <Stepper flowKey="employee" current={empStep} />
      {empStep === 1 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Full Name</label><input type="text" className={s.formControl} defaultValue="New Employee" /></div>
        <div className="mb-3"><label className={s.formLabel}>Email</label><input type="email" className={s.formControl} defaultValue="new@acme.co.ke" /></div>
        <div className="mb-3"><label className={s.formLabel}>Phone (M-Pesa)</label><input type="tel" className={s.formControl} defaultValue="+2547XXXXXXXX" /></div>
        <div className="mb-3"><label className={s.formLabel}>KRA PIN</label><input type="text" className={s.formControl} defaultValue="P05XXXXXXXX" /></div>
      </div>)}
      {empStep === 2 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Department</label><select className={s.formControl}><option>Finance</option><option>HR</option><option>Operations</option><option>Sales</option><option>IT</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Position</label><input type="text" className={s.formControl} defaultValue="Analyst" /></div>
        <div className="mb-3"><label className={s.formLabel}>Start Date</label><input type="date" className={s.formControl} defaultValue="2025-07-01" /></div>
      </div>)}
      {empStep === 3 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Gross Salary (KES)</label><input type="number" className={s.formControl} defaultValue="65000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Payment Preference</label><select className={s.formControl}><option>M-Pesa (Personal)</option><option>Bank Transfer</option><option>M-Pesa (Business)</option></select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-enroll SHIF/NSSF</label></div>
      </div>)}
      {empStep === 4 && renderActionBody('addEmployeeModal', <div className={s.receipt}>
        <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
        <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Employee added successfully!</h5>
        <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Employee ID: EMP-2025-143</p>
      </div>)}
    </MBox>
  )

  /* M3: Import Employees */
  const renderImportEmployees = () => (
    <MBox id="importEmployeesModal" active={active} onClose={onClose} title={<><i className="bi bi-upload me-2" />Import Employees</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('importEmployeesModal', '5 employees imported!', 'IMPORT-003')}>Import</button></>}
    >
      {renderActionBody('importEmployeesModal', <>
        <div className="text-center p-4 rounded mb-3" style={{ background: 'var(--pm-surface-2)', border: '2px dashed var(--pm-border)' }}>
          <i className="bi bi-cloud-upload" style={{ fontSize: 32, color: 'var(--pm-muted)' }} />
          <p style={{ fontSize: 13 }}>Drag & drop CSV/Excel or click to browse</p>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
          <strong>Template format:</strong> Name, Email, Phone, KRA PIN, Department, Position, Salary
        </div>
      </>)}
    </MBox>
  )

  /* M4: Edit Employee */
  const renderEditEmployee = () => (
    <MBox id="editEmployeeModal" active={active} onClose={onClose} title={<><i className="bi bi-pencil me-2" />Edit Employee</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('editEmployeeModal', 'Employee updated!')}>Save</button></>}
    >
      {renderActionBody('editEmployeeModal', <>
        <div className="mb-3"><label className={s.formLabel}>Full Name</label><input type="text" className={s.formControl} defaultValue="Wanjiku Njeri" /></div>
        <div className="mb-3"><label className={s.formLabel}>KRA PIN</label><input type="text" className={s.formControl} defaultValue="P051XXXXXXX" /></div>
        <div className="mb-3"><label className={s.formLabel}>M-Pesa Phone</label><input type="tel" className={s.formControl} defaultValue="+2547XXXXXXXX" /></div>
        <div className="mb-3"><label className={s.formLabel}>Bank Account</label><input type="text" className={s.formControl} defaultValue="KCB - 0123456789" /></div>
        <div className="mb-3"><label className={s.formLabel}>Gross Salary</label><input type="number" className={s.formControl} defaultValue="68000" /></div>
      </>)}
    </MBox>
  )

  /* M5: Approve Payroll */
  const renderApprovePayroll = () => (
    <MBox id="approvePayrollModal" active={active} onClose={onClose} title={<><i className="bi bi-check-circle me-2" />Approve Payroll Batch</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Reject</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('approvePayrollModal', 'Batch approved! Disbursement initiated.', 'PRL-2025-06-REG')}>Approve & Disburse</button></>}
    >
      {renderActionBody('approvePayrollModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>Batch</span><strong>PRL-2025-06-REG</strong></div>
          <div className="d-flex justify-content-between"><span>Period</span><strong>June 2025</strong></div>
          <div className="d-flex justify-content-between"><span>Employees</span><strong>142</strong></div>
          <div className="d-flex justify-content-between"><span>Net Pay Total</span><strong style={{ color: 'var(--pm-accent)' }}>KES 3,317,500</strong></div>
        </div>
        <div className="p-2 rounded" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}><i className="bi bi-exclamation-circle" /> 3 employees missing KRA PINs excluded</div>
      </>)}
    </MBox>
  )

  /* M6: Salary Components */
  const renderSalaryComponents = () => (
    <MBox id="salaryComponentsModal" active={active} onClose={onClose} title={<><i className="bi bi-sliders me-2" />Salary Components</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('salaryComponentsModal', 'Components updated!')}>Save</button></>}
    >
      {renderActionBody('salaryComponentsModal', <>
        <div className="mb-2" style={{ fontSize: 13 }}>
          <div className="d-flex justify-content-between p-2 border-bottom"><span>Basic Salary</span><strong>KES 85,000</strong></div>
          <div className="d-flex justify-content-between p-2 border-bottom"><span>Housing Allowance</span><strong>KES 15,000</strong></div>
          <div className="d-flex justify-content-between p-2 border-bottom"><span>Transport Allowance</span><strong>KES 8,000</strong></div>
          <div className="d-flex justify-content-between p-2 border-bottom"><span>Medical Allowance</span><strong>KES 5,000</strong></div>
        </div>
        <button className={cx(s.btnPm, s.btnSm, 'w-100')}><i className="bi bi-plus" /> Add Component</button>
      </>)}
    </MBox>
  )

  /* M7: Leave Approval */
  const renderLeaveApproval = () => (
    <MBox id="leaveApprovalModal" active={active} onClose={onClose} title={<><i className="bi bi-calendar-check me-2" />Leave Approval</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('leaveApprovalModal', 'Leave approved!')}>Approve</button></>}
    >
      {renderActionBody('leaveApprovalModal', <>
        <div className="mb-3"><label className={s.formLabel}>Employee</label><input type="text" className={s.formControl} defaultValue="John Mwangi" /></div>
        <div className="mb-3"><label className={s.formLabel}>Leave Type</label><select className={s.formControl}><option>Annual Leave</option><option>Sick Leave</option><option>Maternity</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Dates</label><div className="d-flex gap-2"><input type="date" className={s.formControl} defaultValue="2025-06-28" /><input type="date" className={s.formControl} defaultValue="2025-07-02" /></div></div>
        <div className="mb-3"><label className={s.formLabel}>Days</label><input type="number" className={s.formControl} defaultValue="3" /></div>
      </>)}
    </MBox>
  )

  /* M8: Expense Approval */
  const renderExpenseApproval = () => (
    <MBox id="expenseApprovalModal" active={active} onClose={onClose} title={<><i className="bi bi-cash-coin me-2" />Expense Approval</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Reject</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('expenseApprovalModal', 'Expense approved!')}>Approve</button></>}
    >
      {renderActionBody('expenseApprovalModal', <>
        <div className="mb-3"><label className={s.formLabel}>Employee</label><input type="text" className={s.formControl} defaultValue="Mary Kamau" /></div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="4500" /></div>
        <div className="mb-3"><label className={s.formLabel}>Description</label><textarea className={s.formControl} rows={2} defaultValue="Client meeting — transport & meals" /></div>
      </>)}
    </MBox>
  )

  /* M9: Generate Reports */
  const renderGenerateReports = () => (
    <MBox id="generateReportsModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-text me-2" />Generate Reports</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => { downloadFile('report.csv', 'Employee,Tax,Deduction\n'); onClose() }}>Generate</button></>}
    >
      <div className="row g-2">
        <div className="col-6"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => { downloadFile('p10-report.csv', 'P10 Tax Data'); onClose() }}><i className="bi bi-shield-check" style={{ fontSize: 24, color: 'var(--pm-accent)' }} /><br /><strong>P10</strong></div></div>
        <div className="col-6"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => onClose()}><i className="bi bi-file-earmark-text" style={{ fontSize: 24, color: 'var(--pm-info)' }} /><br /><strong>P9A</strong></div></div>
        <div className="col-6"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => onClose()}><i className="bi bi-heart-pulse" style={{ fontSize: 24, color: 'var(--pm-warning)' }} /><br /><strong>SHIF/NSSF</strong></div></div>
        <div className="col-6"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => onClose()}><i className="bi bi-building" style={{ fontSize: 24, color: 'var(--pm-purple)' }} /><br /><strong>Housing Levy</strong></div></div>
      </div>
    </MBox>
  )

  /* M10: Send Payslips */
  const renderSendPayslips = () => (
    <MBox id="sendPayslipsModal" active={active} onClose={onClose} title={<><i className="bi bi-envelope me-2" />Send Payslips</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('sendPayslipsModal', '142 payslips sent via email!', 'PAYSLIPS-06')}>Send All</button></>}
    >
      {renderActionBody('sendPayslipsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Period</label><select className={s.formControl}><option>June 2025</option><option>May 2025</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Delivery Method</label><select className={s.formControl}><option>Email</option><option>Email + WhatsApp</option><option>Print</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>142 employees · June 2025 payslips ready</div>
      </>)}
    </MBox>
  )

  /* M11: Disbursement Tracking */
  const renderDisbursementTracking = () => (
    <MBox id="disbursementTrackingModal" active={active} onClose={onClose} title={<><i className="bi bi-send me-2" />Disbursement Tracking</>} size="lg"
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Batch</span><strong>PRL-2025-05-REG</strong></div>
        <div className="d-flex justify-content-between"><span>Method</span><strong>M-Pesa B2C</strong></div>
        <div className="d-flex justify-content-between"><span>Progress</span><span className={cx(s.badge, s.badgeS)}>139/139 Complete</span></div>
        <div className="d-flex justify-content-between"><span>Amount</span><strong>KES 3,050,000</strong></div>
      </div>
    </MBox>
  )

  /* M12: Employee Self Service */
  const renderEmployeeSelfService = () => (
    <MBox id="employeeSelfServiceModal" active={active} onClose={onClose} title={<><i className="bi bi-laptop me-2" />Employee Self-Service Portal</>} size="lg"
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>
        <strong>ESS Portal</strong> — Employees can view payslips, submit leave & expense requests, and update personal info.
      </div>
      <div className="d-flex gap-2">
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('leaveApprovalModal')}><i className="bi bi-calendar" /> Leave</button>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('expenseApprovalModal')}><i className="bi bi-cash-coin" /> Expense</button>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('sendPayslipsModal')}><i className="bi bi-file-earmark-text" /> Payslips</button>
      </div>
    </MBox>
  )

  /* M13: Compliance Alerts */
  const renderComplianceAlerts = () => (
    <MBox id="complianceAlertsModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-check text-info me-2" />Compliance Alerts</>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>P9A Certificates Ready</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Download and distribute to all 142 employees</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>SHIF Deduction Updated</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>New rate: 2.75% effective July 2025</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Housing Levy Compliance</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>1.5% employer + 1.5% employee</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>File May Statutory Returns</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Deadline: 9 Jul 2025 · KES 312K total</span></div>
    </MBox>
  )

  /* M14: Annual P9 */
  const renderAnnualP9 = () => (
    <MBox id="annualP9Modal" active={active} onClose={onClose} title={<><i className="bi bi-calendar-check me-2" />Annual P9A Certificates</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => { downloadFile('p9a-certificates.csv', 'P9A Data'); onClose() }}>Generate All</button></>}
    >
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>142 employees · FY 2024/25 · Download all P9A certificates in PDF/CSV format</div>
    </MBox>
  )

  /* M15: Pay M-Pesa Bulk */
  const renderPayMpesaBulk = () => (
    <MBox id="payMpesaBulkModal" active={active} onClose={onClose} title={<><i className="bi bi-phone me-2" />M-Pesa B2C Bulk Payment</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('payMpesaBulkModal', 'B2C batch submitted!', 'B2C-2025-06')}>Submit</button></>}
    >
      {renderActionBody('payMpesaBulkModal', <>
        <div className="mb-3"><label className={s.formLabel}>Batch</label><select className={s.formControl}><option>PRL-2025-06-REG</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Recipients</label><div className={s.formControl} style={{ background: 'var(--pm-surface-2)' }}>139 employees (M-Pesa numbers)</div></div>
        <div className="mb-3"><label className={s.formLabel}>Total Amount</label><div className={s.formControl} style={{ background: 'var(--pm-surface-2)' }}>KES 2,890,000</div></div>
      </>)}
    </MBox>
  )

  /* M16: Schedule Payroll */
  const renderSchedulePayroll = () => (
    <MBox id="schedulePayrollModal" active={active} onClose={onClose} title={<><i className="bi bi-calendar-plus me-2" />Schedule Payroll</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('schedulePayrollModal', 'Payroll scheduled!', 'PRL-SCHED')}>Schedule</button></>}
    >
      {renderActionBody('schedulePayrollModal', <>
        <div className="mb-3"><label className={s.formLabel}>Payroll Type</label><select className={s.formControl}><option>Regular (Monthly)</option><option>Supplementary</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Scheduled Date</label><input type="date" className={s.formControl} defaultValue="2025-07-28" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-run on scheduled date</label></div>
      </>)}
    </MBox>
  )

  /* M17: Audit Trail */
  const renderAuditTrail = () => (
    <MBox id="auditTrailModal" active={active} onClose={onClose} title={<><i className="bi bi-clock-history me-2" />Audit Trail</>} size="lg"
    >
      <div className={s.feedItem}><div className={cx(s.iconCircle)} style={{ background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' }}><i className="bi bi-check" /></div><div><strong>Payroll approved</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>CFO Peter K. · 28 Jun 2025 · 09:41</div></div></div>
      <div className={s.feedItem}><div className={cx(s.iconCircle)} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-send" /></div><div><strong>B2C disbursement initiated</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>System · 28 Jun 2025 · 09:42</div></div></div>
      <div className={s.feedItem}><div className={cx(s.iconCircle)} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-person-plus" /></div><div><strong>Employee added: Ali Omondi</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>HR Admin · 15 Jun 2025 · 14:20</div></div></div>
    </MBox>
  )

  /* M18: Tax Config */
  const renderTaxConfig = () => (
    <MBox id="taxConfigModal" active={active} onClose={onClose} title={<><i className="bi bi-calculator me-2" />Tax Configuration</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('taxConfigModal', 'Tax config saved!')}>Save</button></>}
    >
      {renderActionBody('taxConfigModal', <>
        <div className="mb-3"><label className={s.formLabel}>PAYE Rates</label><div className={s.formControl} style={{ background: 'var(--pm-surface-2)' }}>KRA 2025 bands configured</div></div>
        <div className="mb-3"><label className={s.formLabel}>SHIF Rate</label><input type="number" className={s.formControl} defaultValue="2.75" /></div>
        <div className="mb-3"><label className={s.formLabel}>NSSF Rate</label><input type="number" className={s.formControl} defaultValue="6" /></div>
        <div className="mb-3"><label className={s.formLabel}>Housing Levy</label><input type="number" className={s.formControl} defaultValue="1.5" /></div>
      </>)}
    </MBox>
  )

  /* M19: Edit Company Profile */
  const renderEditCompanyProfile = () => (
    <MBox id="editCompanyProfileModal" active={active} onClose={onClose} title={<><i className="bi bi-building me-2" />Company Profile</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('editCompanyProfileModal', 'Profile updated!')}>Save</button></>}
    >
      {renderActionBody('editCompanyProfileModal', <>
        <div className="mb-3"><label className={s.formLabel}>Company Name</label><input type="text" className={s.formControl} defaultValue="Acme Corp Ltd" /></div>
        <div className="mb-3"><label className={s.formLabel}>KRA PIN</label><input type="text" className={s.formControl} defaultValue="P051234567M" /></div>
        <div className="mb-3"><label className={s.formLabel}>Industry</label><select className={s.formControl}><option>Manufacturing</option><option>IT Services</option><option>Retail</option><option>Logistics</option></select></div>
      </>)}
    </MBox>
  )

  /* M20: Notifications */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Payroll Notifications</>}
      footer={<><button className={cx(s.btnPm, s.btnSm)}>Mark All Read</button><button className={s.btnPm} onClick={onClose}>Close</button></>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Approve Payroll Run</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PRL-2025-06-REG requires CFO approval before 28th.</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Compliance Alert</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>3 new hires lack KRA PINs. Fix before running payroll.</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>Expense Claim</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Mary Kamau submitted KES 4,500 expense.</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}><strong>Bank Validation</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Wanjiku's account length is invalid.</span></div>
    </MBox>
  )

  return (
    <>
      {renderRunPayroll()}
      {renderAddEmployee()}
      {renderImportEmployees()}
      {renderEditEmployee()}
      {renderApprovePayroll()}
      {renderSalaryComponents()}
      {renderLeaveApproval()}
      {renderExpenseApproval()}
      {renderGenerateReports()}
      {renderSendPayslips()}
      {renderDisbursementTracking()}
      {renderEmployeeSelfService()}
      {renderComplianceAlerts()}
      {renderAnnualP9()}
      {renderPayMpesaBulk()}
      {renderSchedulePayroll()}
      {renderAuditTrail()}
      {renderTaxConfig()}
      {renderEditCompanyProfile()}
      {renderNotifications()}
    </>
  )
}
