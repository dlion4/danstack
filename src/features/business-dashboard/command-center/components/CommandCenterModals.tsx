import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/command-center.module.css'

/* ============================================================================
   Business Command Center — modal layer (legacy page 3.1, 21 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state
     doAction(id,msg)   → `results` state; shows loading spinner, then receipt
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     cacheAndReset()    → useEffect on close resets flows + results + tabs
   ========================================================================== */

interface ModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

type Size = 'md' | 'lg' | 'xl'

interface MBoxProps {
  id: string
  active: string | null
  title: ReactNode
  size?: Size
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/* ---------- LEGACY BRIDGE: file download helper ---------- */
function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ---------- modal shell ---------- */
function MBox({ id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
  const s = styles as Record<string, string>
  if (active !== id) return null
  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
        <div className={`${s.modalBox} ${size === 'lg' ? s.modalBoxLg : ''} ${size === 'xl' ? s.modalBoxXl : ''}`}>
          <div className={s.modalHeader}>
            <h5 className={s.modalTitle}>{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className={s.modalBody}>{children}</div>
          {footer && <div className={s.modalFooter}>{footer}</div>}
        </div>
      </div>
    </>
  )
}

function BusyOverlay() {
  const s = styles as Record<string, string>
  return (
    <div className={s.loadingOv}>
      <div className={s.spinner} />
      <p className={s.loadingLabel}>Processing...</p>
    </div>
  )
}

/* ---------- data arrays ---------- */
const CUSTOMERS = ['Acme Corp', 'Global Industries', '+ Add New Customer']
const DEPARTMENTS = ['Finance', 'HR', 'Sales', 'Operations']
const ROLES = [
  { label: 'Admin', desc: 'Manage settings, approve payments', checked: true },
  { label: 'Finance / Maker', desc: 'Create invoices, initiate payments' },
  { label: 'Viewer', desc: 'Read-only access to reports' },
]

/* LEGACY BRIDGE: flow definitions */
const FLOW_DEFS: Record<string, { labels: string[] }> = {
  payroll: { labels: ['Select', 'Review', 'Approve'] },
  transfer: { labels: ['Details', 'Amount', 'Authorize'] },
  invite: { labels: ['Details', 'Role', 'Limits'] },
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

export default function CommandCenterModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ payroll: 1, transfer: 1, invite: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})

  /* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ payroll: 1, transfer: 1, invite: 1 })
      setBusy(null)
      setTabs({})
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* LEGACY BRIDGE: doAction(modalId, msg, ref) */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1500)
  }

  /* LEGACY BRIDGE: nextFlow(key, total) */
  const nextFlow = (key: string, total: number) => {
    const cur = flows[key] ?? 1
    if (cur >= total) { onClose(); return }
    setFlows((prev) => ({ ...prev, [key]: cur + 1 }))
  }

  const switchTab = (prefix: string, key: string) => {
    setTabs((prev) => ({ ...prev, [prefix]: key }))
  }

  /* Receipt renderer */
  const renderReceipt = (r: Result) => (
    <div className={s.receipt}>
      <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => downloadFile('receipt.txt', r.msg)}>
          <i className="bi bi-download" /> Save
        </button>
        <button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-share" /> Continue</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  /* ==========================================================================
     M1: New Invoice
     ======================================================================== */
  const renderNewInvoice = () => (
    <MBox id="newInvoiceModal" active={active} onClose={onClose}
      title={<><i className="bi bi-receipt text-primary me-2" />Create Quick Invoice</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('newInvoiceModal', 'Invoice #INV-2025-142 created & sent successfully!', 'INV-2025-142')}>Create Invoice</button>
        </>
      }
    >
      {renderActionBody('newInvoiceModal', <>
        <div className="mb-3"><label className={s.formLabel}>Customer</label>
          <select className={s.formControl}>{CUSTOMERS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="150000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Description</label><textarea className={s.formControl} rows={2} defaultValue="IT Consulting Services - October 2025" /></div>
        <div className="mb-3"><label className={s.formLabel}>Due Date</label><input type="date" className={s.formControl} defaultValue="2025-11-15" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Send payment link via Email/SMS</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M2: Run Payroll (Multistep, 3 steps)
     ======================================================================== */
  const renderRunPayroll = () => {
    const step = flows.payroll
    return (
      <MBox id="runPayrollModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-people text-success me-2" />Run & Approve Payroll</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('payroll', 3)}>
              {step >= 3 ? 'Approve & Execute' : 'Continue <i className="bi bi-arrow-right" />'}
            </button>
          </>
        }
      >
        <Stepper flowKey="payroll" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Employees for October 2025</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
                <span>24 Employees Selected</span><strong>Total: KES 450,500</strong>
              </div>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Funding Source</label>
              <select className={s.formControl}><option>PayMo Business Wallet (KES 2.45M)</option><option>Equity Bank ****4521</option></select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Review Payroll Summary</h6>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Employee</th><th>Gross</th><th>Tax (PAYE)</th><th>Net</th></tr></thead>
                <tbody>
                  <tr><td>Amina D. (Admin)</td><td>200,000</td><td>45,000</td><td>155,000</td></tr>
                  <tr><td>Peter K. (Finance)</td><td>150,000</td><td>32,500</td><td>117,500</td></tr>
                  <tr><td>Sarah W. (HR)</td><td>120,000</td><td>24,000</td><td>96,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Approve & Execute</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
              <i className="bi bi-exclamation-triangle text-warning me-1" /> You are authorizing KES 450,500 disbursement to 24 employees. This action is irreversible.
            </div>
            <div className={s.pinRow}>
              {[0, 1, 2, 3].map((i) => <input key={i} type="text" maxLength={1} className={s.formControl} style={{ width: 50, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700 }} placeholder="·" />)}
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M3: Inter-Company Transfer (Multistep, 3 steps)
     ======================================================================== */
  const renderInterCompanyTransfer = () => {
    const step = flows.transfer
    return (
      <MBox id="interCompanyTransferModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-arrow-left-right me-2" style={{ color: 'var(--pm-purple)' }} />Inter-Company Transfer</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('transfer', 3)}>
              {step >= 3 ? 'Authorize' : 'Continue'}
            </button>
          </>
        }
      >
        <Stepper flowKey="transfer" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Transfer Details</h6>
            <div className="mb-3"><label className={s.formLabel}>From Account</label>
              <select className={s.formControl}><option>TechSolutions Ltd (KES 2.45M)</option><option>TS Logistics (KES 8.10M)</option></select>
            </div>
            <div className="mb-3"><label className={s.formLabel}>To Account</label>
              <select className={s.formControl}><option>TS Logistics & Delivery</option><option>TechSolutions Foundation</option></select>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="500000" /></div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Review Transfer</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">From</span><strong>TechSolutions Ltd</strong></div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">To</span><strong>TS Logistics & Delivery</strong></div>
              <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Amount</span><strong style={{ color: 'var(--pm-primary)' }}>KES 500,000</strong></div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Authorize with PIN</h6>
            <div className={s.pinRow}>
              {[0, 1, 2, 3].map((i) => <input key={i} type="text" maxLength={1} className={s.formControl} style={{ width: 50, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700 }} placeholder="·" />)}
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M4: Invite User (Multistep, 3 steps)
     ======================================================================== */
  const renderInviteUser = () => {
    const step = flows.invite
    return (
      <MBox id="inviteUserModal" active={active} onClose={onClose}
        title={<><i className="bi bi-person-plus me-2" />Invite Team Member</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('invite', 3)}>
              {step >= 3 ? 'Send Invite' : 'Continue'}
            </button>
          </>
        }
      >
        <Stepper flowKey="invite" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Member Details</h6>
            <div className="mb-3"><label className={s.formLabel}>Full Name</label><input className={s.formControl} defaultValue="John Mwangi" /></div>
            <div className="mb-3"><label className={s.formLabel}>Email</label><input className={s.formControl} defaultValue="john@techsol.co.ke" /></div>
            <div className="mb-3"><label className={s.formLabel}>Department</label>
              <select className={s.formControl}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Assign Role</h6>
            {ROLES.map((r) => (
              <div key={r.label} className="p-3 border rounded mb-2" style={{ ...(r.checked ? { borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' } : {}) }}>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="role" defaultChecked={r.checked} />
                  <label className="form-check-label"><strong>{r.label}</strong> - {r.desc}</label>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Approval Limits & Security</h6>
            <div className="mb-3"><label className={s.formLabel}>Approval Limit (KES)</label><input type="number" className={s.formControl} defaultValue="1000000" /></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked disabled /><label className="form-check-label">Require 2FA/MFA (Enforced for Admin)</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Allow access to multi-business switcher</label></div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M5: KYB Upload Modal
     ======================================================================== */
  const renderKybUpload = () => (
    <MBox id="kybUploadModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-check text-secondary me-2" />KYB Document Upload</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('kybUploadModal', 'Document uploaded and sent for verification.', 'KYB-99120')}>Submit for Verification</button>
        </>
      }
    >
      {renderActionBody('kybUploadModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
          <i className="bi bi-exclamation-triangle text-danger" /> Missing Annual Returns (CR12). Limit restrictions will apply in 5 days.
        </div>
        <div className="mb-3"><label className={s.formLabel}>Document Type</label>
          <select className={s.formControl} disabled><option>CR12 / Annual Returns</option></select>
        </div>
        <div className={s.uploadZone}>
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: 32, color: 'var(--pm-primary)' }} />
          <div style={{ fontWeight: 600, marginTop: 8 }}>Click to browse or drag file here</div>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PDF, JPG, PNG (Max 5MB)</div>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M6: Business Settings Modal (with tabs)
     ======================================================================== */
  const renderBusinessSettings = () => {
    const currentTab = tabs.bizSettings ?? 'general'
    return (
      <MBox id="businessSettingsModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-gear me-2" />Business Settings</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Close</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('businessSettingsModal', 'Settings updated successfully!')}>Save Changes</button>
          </>
        }
      >
        {renderActionBody('businessSettingsModal', <>
          <div className={cx(s.pills, 'mb-3')}>
            <button className={cx(s.pill, currentTab === 'general' && s.pillActive)} onClick={() => switchTab('bizSettings', 'general')}>General</button>
            <button className={cx(s.pill, currentTab === 'address' && s.pillActive)} onClick={() => switchTab('bizSettings', 'address')}>Address & Contacts</button>
            <button className={cx(s.pill, currentTab === 'signatories' && s.pillActive)} onClick={() => switchTab('bizSettings', 'signatories')}>Signatories</button>
          </div>
          {currentTab === 'general' && (
            <div className="row g-3 mt-2">
              <div className="col-md-6"><label className={s.formLabel}>Trading Name</label><input type="text" className={s.formControl} defaultValue="TechSolutions Ltd" /></div>
              <div className="col-md-6"><label className={s.formLabel}>Industry Sector</label><select className={s.formControl}><option>Information Technology</option><option>Retail</option></select></div>
              <div className="col-md-6"><label className={s.formLabel}>Support Email</label><input type="email" className={s.formControl} defaultValue="support@techsol.co.ke" /></div>
              <div className="col-md-6"><label className={s.formLabel}>Support Phone</label><input type="text" className={s.formControl} defaultValue="+254 700 000 000" /></div>
            </div>
          )}
          {currentTab === 'address' && (
            <div className="row g-3 mt-2">
              <div className="col-md-6"><label className={s.formLabel}>Physical Address</label><input className={s.formControl} defaultValue="123 Westlands Rd, Nairobi" /></div>
              <div className="col-md-6"><label className={s.formLabel}>Postal Code</label><input className={s.formControl} defaultValue="00100" /></div>
            </div>
          )}
          {currentTab === 'signatories' && (
            <div className="mt-2">
              <div className="p-3 border rounded mb-2" style={{ fontSize: 13 }}>
                <strong>Amina D.</strong> — Director (Primary)<br /><span className="text-muted">ID: 29123456 · Signature captured</span>
              </div>
            </div>
          )}
        </>)}
      </MBox>
    )
  }

  /* ==========================================================================
     M7: Switch Business Modal
     ======================================================================== */
  const renderSwitchBusiness = () => (
    <MBox id="switchBusinessModal" active={active} onClose={onClose}
      title={<><i className="bi bi-diagram-3 me-2" />Switch Business Account</>}
    >
      <div className={cx(s.headerSearch, 'mb-3')} style={{ maxWidth: '100%' }}><i className="bi bi-search" /><input type="text" placeholder="Search businesses..." /></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' }}>
        <div className="d-flex align-items-center gap-2">
          <div className={s.avatar} style={{ background: 'var(--pm-ink)' }}>TS</div>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>TechSolutions Ltd</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Owner · Current</div></div>
        </div>
        <i className="bi bi-check-circle-fill text-primary" />
      </div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => doAction('switchBusinessModal', 'Switched to TS Logistics!')}>
        <div className="d-flex align-items-center gap-2">
          <div className={s.avatar} style={{ background: 'var(--pm-danger)' }}>TL</div>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>TS Logistics & Delivery</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Owner</div></div>
        </div>
      </div>
      <div className="p-3 border rounded d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => doAction('switchBusinessModal', 'Switched to Foundation!')}>
        <div className="d-flex align-items-center gap-2">
          <div className={s.avatar} style={{ background: 'var(--pm-info)' }}>TF</div>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>TechSolutions Foundation</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Admin</div></div>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M8: Cash Flow Details
     ======================================================================== */
  const renderCashFlow = () => (
    <MBox id="cashFlowDetailsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-bank me-2" />Cash Position & Liquidity</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div className="p-3 border rounded h-100">
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PAYMO BUSINESS WALLET</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 2,450,000</div>
            <button className={cx(s.btnPm, s.btnSm, 'mt-2 w-100')} onClick={() => onOpen('interCompanyTransferModal')}>Transfer Funds</button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-3 border rounded h-100">
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>LINKED ACCOUNTS (EQUITY BANK)</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>KES 8,120,500</div>
            <button className={cx(s.btnPm, s.btnSm, 'mt-2 w-100')} onClick={() => onOpen('connectBankModal')}>Manage Connections</button>
          </div>
        </div>
      </div>
      <h6 style={{ fontWeight: 700, marginTop: 20 }}>Pending Settlements (T+1)</h6>
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Source</th><th>Amount</th><th>Expected Date</th></tr></thead>
          <tbody>
            <tr><td>M-Pesa Till (Buy Goods)</td><td>KES 450,000</td><td>Tomorrow, 8:00 AM</td></tr>
            <tr><td>Visa/Mastercard Gateway</td><td>KES 400,000</td><td>Tomorrow, 2:00 PM</td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M9: Aging Invoices Modal
     ======================================================================== */
  const renderAgingInvoices = () => (
    <MBox id="agingInvoicesModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-receipt me-2" />Outstanding Invoices (Aging Report)</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Close</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('agingInvoicesModal', 'Reminders sent to all overdue customers via Email & SMS.')}>
            <i className="bi bi-envelope-check" /> Send Batch Reminders
          </button>
        </>
      }
    >
      <div className={cx(s.pills, 'mb-3')}>
        <button className={cx(s.pill, s.pillActive)}>All (750K)</button>
        <button className={s.pill}>0-30 Days (420K)</button>
        <button className={s.pill}>31-60 Days (185K)</button>
        <button className={s.pill} style={{ color: 'var(--pm-danger)' }}>61-90+ Days (145K)</button>
      </div>
      <div className="table-responsive mt-3">
        <table className={s.tbl}>
          <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Days Overdue</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>INV-2025-081</td><td>Acme Corp</td><td>KES 85,000</td><td><span className={cx(s.badge, s.badgeD)}>72 days</span></td><td><button className={cx(s.btnPm, s.btnSm)}>Remind</button></td></tr>
            <tr><td>INV-2025-084</td><td>Global Industries</td><td>KES 60,000</td><td><span className={cx(s.badge, s.badgeD)}>65 days</span></td><td><button className={cx(s.btnPm, s.btnSm)}>Remind</button></td></tr>
            <tr><td>INV-2025-092</td><td>StartUp Inc</td><td>KES 185,000</td><td><span className={cx(s.badge, s.badgeW)}>45 days</span></td><td><button className={cx(s.btnPm, s.btnSm)}>Remind</button></td></tr>
            <tr><td>INV-2025-104</td><td>Retail Chain A</td><td>KES 420,000</td><td><span className={cx(s.badge, s.badgeI)}>15 days</span></td><td><button className={cx(s.btnPm, s.btnSm)}>View</button></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M10: View User Modal
     ======================================================================== */
  const renderViewUser = () => (
    <MBox id="viewUserModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person me-2" />Edit User: Peter K.</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('viewUserModal', 'User settings updated!')}>Save</button>
        </>
      }
    >
      {renderActionBody('viewUserModal', <>
        <div className="mb-3"><label className={s.formLabel}>Role</label>
          <select className={s.formControl}><option>Admin</option><option selected>Finance Admin</option><option>HR Manager</option><option>Viewer</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Approval Limit (KES)</label><input type="number" className={s.formControl} defaultValue="1000000" /></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">MFA Enforced</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label text-danger">Suspend Account</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M11: Disburse Funds Modal
     ======================================================================== */
  const renderDisburseFunds = () => (
    <MBox id="disburseFundsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-send text-info me-2" />Disburse Funds</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('disburseFundsModal', 'Disbursement initiated! Ref: DSP-44829', 'DSP-44829')}>Disburse</button>
        </>
      }
    >
      {renderActionBody('disburseFundsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Disbursement Type</label>
          <select className={s.formControl}><option>Single Vendor Payment</option><option>Bulk CSV Upload (M-Pesa B2C)</option><option>Expense Reimbursement</option></select>
        </div>
        <div className="p-3 border rounded text-center mb-3">
          <i className="bi bi-file-earmark-excel mb-2" style={{ fontSize: 24, color: 'var(--pm-accent)' }} /><br />
          <strong>Upload Beneficiary CSV</strong><br />
          <span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Format: Name, Phone, Account, Amount</span>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M12: Revenue Details
     ======================================================================== */
  const renderRevenueDetails = () => (
    <MBox id="revenueDetailsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-graph-up-arrow text-success me-2" />Revenue Breakdown</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>INVOICES</div><div style={{ fontSize: 24, fontWeight: 700 }}>KES 1.2M</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>M-PESA</div><div style={{ fontSize: 24, fontWeight: 700 }}>KES 420K</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>CARD</div><div style={{ fontSize: 24, fontWeight: 700 }}>KES 200K</div></div></div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M13: Expense Details
     ======================================================================== */
  const renderExpenseDetails = () => (
    <MBox id="expenseDetailsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-graph-down-arrow text-danger me-2" />Expense Breakdown</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 border rounded mb-2"><div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span>Payroll (24 employees)</span><strong style={{ color: 'var(--pm-danger)' }}>KES 450,500</strong></div></div>
      <div className="p-3 border rounded mb-2"><div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span>Supplier Payments</span><strong>KES 320,000</strong></div></div>
      <div className="p-3 border rounded mb-2"><div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span>Operating Expenses</span><strong>KES 169,500</strong></div></div>
    </MBox>
  )

  /* ==========================================================================
     M14: Pending Approvals
     ======================================================================== */
  const renderPendingApprovals = () => (
    <MBox id="pendingApprovalsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-circle text-warning me-2" />Pending Approvals</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={s.feedItem}>
        <div className={s.iconCircle} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-people" /></div>
        <div style={{ flex: 1 }}><strong>Payroll Run: October 2025</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 450,500 · 24 Employees</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('runPayrollModal')}>Approve</button>
      </div>
      <div className={s.feedItem}>
        <div className={s.iconCircle} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-receipt" /></div>
        <div style={{ flex: 1 }}><strong>Invoice INV-2025-104</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 420,000 · Retail Chain A</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('agingInvoicesModal')}>View</button>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M15: Consolidated Report
     ======================================================================== */
  const renderConsolidatedReport = () => (
    <MBox id="consolidatedReportModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-file-earmark-bar-graph me-2" />Consolidated Group Report</>}
      footer={
        <>
          <button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-download" /> Export PDF</button>
          <button className={s.btnPm} onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>GROUP REVENUE</div><div style={{ fontSize: 22, fontWeight: 700 }}>KES 4.82M</div></div></div>
        <div className="col-md-3"><div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)' }}><div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>GROUP EXPENSES</div><div style={{ fontSize: 22, fontWeight: 700 }}>KES 2.1M</div></div></div>
        <div className="col-md-3"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>NET POSITION</div><div style={{ fontSize: 22, fontWeight: 700 }}>KES 2.72M</div></div></div>
        <div className="col-md-3"><div className="p-3 rounded" style={{ background: 'var(--pm-purple-soft)' }}><div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 600 }}>TOTAL INVOICES</div><div style={{ fontSize: 22, fontWeight: 700 }}>42</div></div></div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M16: Health Check
     ======================================================================== */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} onClose={onClose}
      title={<><i className="bi bi-activity text-success me-2" />Business Health Check</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-4 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#047857', fontFamily: 'var(--pm-font-display)' }}>96/100</div>
        <div style={{ fontWeight: 700, color: '#065F46' }}>Excellent Business Health Score</div>
      </div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>KYC/KYB Compliance</span><span className={cx(s.badge, s.badgeS)}>Verified</span></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>Transaction Success Rate</span><span className={cx(s.badge, s.badgeS)}>98.7%</span></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>Outstanding Invoices</span><span className={cx(s.badge, s.badgeW)}>KES 750K</span></div>
      <div className="p-3 border rounded d-flex justify-content-between" style={{ fontSize: 13 }}><span>Annual Returns</span><span className={cx(s.badge, s.badgeD)}>Missing</span></div>
    </MBox>
  )

  /* ==========================================================================
     M17: Notifications
     ======================================================================== */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Notifications</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)' }}><strong>Payroll requires approval</strong><div style={{ fontSize: 11 }}>October payroll — KES 450,500</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)' }}><strong>KYB Update overdue</strong><div style={{ fontSize: 11 }}>CR12 missing — 5 days remaining</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)' }}><strong>3 invoices aging {'>'}60 days</strong><div style={{ fontSize: 11 }}>KES 145,000 outstanding</div></div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><strong>Revenue milestone reached!</strong><div style={{ fontSize: 11 }}>KES 1.82M this month — 12% growth</div></div>
    </MBox>
  )

  /* ==========================================================================
     M18: Role Permissions Matrix
     ======================================================================== */
  const renderRolePermissions = () => (
    <MBox id="rolePermissionsModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-shield-lock me-2" />Roles & Permissions Matrix</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Permission</th><th>Admin</th><th>Finance</th><th>HR</th><th>Viewer</th></tr></thead>
          <tbody>
            <tr><td>Create Invoice</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
            <tr><td>Approve Payments</td><td>✅</td><td>✅ (≤1M)</td><td>✅ (Payroll only)</td><td>❌</td></tr>
            <tr><td>Run Payroll</td><td>✅</td><td>❌</td><td>✅</td><td>❌</td></tr>
            <tr><td>View Reports</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr><td>Manage Users</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M19: Collection Target
     ======================================================================== */
  const renderCollectionTarget = () => (
    <MBox id="collectionTargetModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bullseye text-primary me-2" />Set Collection Targets</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('collectionTargetModal', 'Targets updated for November!')}>Save Targets</button>
        </>
      }
    >
      {renderActionBody('collectionTargetModal', <>
        <div className="mb-3"><label className={s.formLabel}>Target Month</label>
          <select className={s.formControl}><option>November 2025</option><option>December 2025</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Gross Revenue Target (KES)</label><input type="number" className={s.formControl} defaultValue="2500000" /></div>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>Setting targets updates the dashboard charts for the entire team to track progress.</div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M20: Business Profile Modal
     ======================================================================== */
  const renderBusinessProfile = () => (
    <MBox id="businessProfileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-badge text-primary me-2" />My Profile</>}
      footer={<button className={cx(s.btnPm, s.btnPmD, 'w-100')} onClick={onClose}>Log Out</button>}
    >
      <div className="text-center">
        <div className={cx(s.avatar, 'mx-auto mb-3')} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-primary)' }}>AD</div>
        <h4 style={{ fontWeight: 700, marginBottom: 4 }}>Amina D.</h4>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Director (Admin) · TechSolutions Ltd</p>
        <div className="p-3 border rounded text-start mt-3">
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Approval Limit</span><strong>Unlimited</strong></div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Security</span><span className={cx(s.badge, s.badgeS)}>MFA Active</span></div>
          <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Connected Entities</span><strong>3 Businesses</strong></div>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M21: Connect Bank
     ======================================================================== */
  const renderConnectBank = () => (
    <MBox id="connectBankModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bank2 me-2" />Connect Bank Account</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' }}>
        <div className="d-flex align-items-center gap-2"><div className={s.iconCircle} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-building" /></div><div><strong>Equity Bank</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>****4521 · Connected</div></div></div>
        <i className="bi bi-check-circle-fill text-primary" />
      </div>
      <button className={cx(s.btnPm, s.btnSm, 'w-100 mt-2')} onClick={() => doAction('connectBankModal', 'New bank account connection initiated.')}>
        <i className="bi bi-plus-lg" /> Add New Bank
      </button>
    </MBox>
  )

  /* ==========================================================================
     Render all modals
     ======================================================================== */
  return (
    <>
      {renderNewInvoice()}
      {renderRunPayroll()}
      {renderInterCompanyTransfer()}
      {renderInviteUser()}
      {renderKybUpload()}
      {renderBusinessSettings()}
      {renderSwitchBusiness()}
      {renderCashFlow()}
      {renderAgingInvoices()}
      {renderViewUser()}
      {renderDisburseFunds()}
      {renderRevenueDetails()}
      {renderExpenseDetails()}
      {renderPendingApprovals()}
      {renderConsolidatedReport()}
      {renderHealthCheck()}
      {renderNotifications()}
      {renderRolePermissions()}
      {renderCollectionTarget()}
      {renderBusinessProfile()}
      {renderConnectBank()}
    </>
  )
}
