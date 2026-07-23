import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/accounts-payable.module.css'

/* ============================================================================
   Accounts Payable — modal layer (legacy page 3.6, ~26 modals)
   LEGACY BRIDGE: doAction, nextFlow, cacheAndReset
   ========================================================================== */

interface ModalsProps { active: string | null; onClose: () => void; onOpen: (id: string) => void }
interface MBoxProps { id: string; active: string | null; title: ReactNode; size?: 'md' | 'lg' | 'xl'; onClose: () => void; children: ReactNode; footer?: ReactNode }

function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

function MBox({ id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
  const s = styles as Record<string, string>
  if (active !== id) return null
  return (<>
    <div className={s.backdrop} onClick={onClose} />
    <div className={s.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
      <div className={`${s.modalBox} ${size === 'lg' ? s.modalBoxLg : ''} ${size === 'xl' ? s.modalBoxXl : ''}`}>
        <div className={s.modalHeader}><h5 className={s.modalTitle}>{title}</h5><button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div>
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFooter}>{footer}</div>}
      </div>
    </div>
  </>)
}

function BusyOverlay() { const s = styles as Record<string, string>; return (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing...</p></div>) }

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  supplier: { labels: ['Business', 'Payment', 'Terms', 'Done'] },
  bulkPay: { labels: ['Select', 'Execute', 'Done'] },
}

interface Result { msg: string; ref?: string }

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
  const s = styles as Record<string, string>; const def = FLOW_DEFS[flowKey]; if (!def) return null
  return (<div className={s.stepper}>{def.labels.map((label, i) => {
    const stepNum = i + 1; const done = stepNum < current; const active = stepNum === current
    return (<div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
      {i > 0 && <div className={s.stepLine} style={{ position: 'absolute', top: 14, left: '-50%', width: '100%', ...(done ? { background: 'var(--pm-accent)' } : {}) }} />}
      <div className={`${s.step} ${done ? s.stepDone : ''} ${active ? s.stepActive : ''}`}>
        <div className={s.stepN}>{done ? <i className="bi bi-check" /> : stepNum}</div><div className={s.stepL}>{label}</div>
      </div>
    </div>)
  })}</div>)
}

export default function AccountsPayableModals({ active, onClose }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ supplier: 1, bulkPay: 1 })

  useEffect(() => { if (active === null) { setResults({}); setFlows({ supplier: 1, bulkPay: 1 }); setBusy(null) } }, [active])
  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => { setBusy(modalId); busyTimer.current = window.setTimeout(() => { setResults((prev) => ({ ...prev, [modalId]: { msg, ref } })); setBusy(null) }, 1500) }
  const nextFlow = (key: string, total: number) => { const cur = flows[key] ?? 1; if (cur >= total) { onClose(); return } setFlows((prev) => ({ ...prev, [key]: cur + 1 })) }

  const renderReceipt = (r: Result) => (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>{r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: {r.ref}</p>}<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => downloadFile('receipt.txt', r.msg)}><i className="bi bi-download" /> Save</button><button className={cx(s.btnPm, s.btnSm)} onClick={onClose}>Done</button></div></div>)
  const renderActionBody = (modalId: string, defaultContent: ReactNode) => { if (busy === modalId) return <BusyOverlay />; if (results[modalId]) return renderReceipt(results[modalId]); return defaultContent }

  const suppStep = flows.supplier ?? 1
  const bulkStep = flows.bulkPay ?? 1

  /* M1: Add Supplier (4-step) */
  const renderAddSupplier = () => (
    <MBox id="addSupplierModal" active={active} onClose={onClose} title={<><i className="bi bi-person-plus text-primary me-2" />Add Supplier</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{suppStep < 4 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('supplier', 4)}>{suppStep === 3 ? 'Submit Profile' : 'Next'} <i className={`bi ${suppStep === 3 ? 'bi-check2' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="supplier" current={suppStep} />
      {suppStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Company Name</label><input type="text" className={s.formControl} defaultValue="New Supplier Ltd" /></div>
        <div className="mb-3"><label className={s.formLabel}>Category</label><select className={s.formControl}><option>Office Supplies</option><option>IT Services</option><option>Marketing</option><option>Logistics</option><option>Professional Services</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Contact Email</label><input type="email" className={s.formControl} defaultValue="billing@supplier.com" /></div>
        <div className="mb-3"><label className={s.formLabel}>KRA PIN</label><input type="text" className={s.formControl} defaultValue="P05XXXXXXXX" /></div>
      </div>}
      {suppStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Bank Name</label><select className={s.formControl}><option>KCB</option><option>Equity</option><option>Co-op Bank</option><option>NCBA</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Account Number</label><input type="text" className={s.formControl} defaultValue="0123456789" /></div>
        <div className="mb-3"><label className={s.formLabel}>Preferred Payment Method</label><select className={s.formControl}><option>PesaLink</option><option>M-Pesa B2C</option><option>EFT</option></select></div>
      </div>}
      {suppStep === 3 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Payment Terms</label><select className={s.formControl}><option>Net 30</option><option>Net 15</option><option>Net 10</option><option>Due on Receipt</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Early Payment Discount</label><input type="text" className={s.formControl} defaultValue="2% if paid within 10 days" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable auto-reminders for upcoming payments</label></div>
      </div>}
      {suppStep === 4 && renderActionBody('addSupplierModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Supplier added successfully!</h5><p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Supplier ID: SUP-2025-019 · Awaiting KYC verification</p></div>)}
    </MBox>
  )

  /* M2: Process Invoice */
  const renderProcessInvoice = () => (
    <MBox id="processInvoiceModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-plus me-2" />Process Invoice</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('processInvoiceModal', 'Invoice processed and sent for approval!', 'INV-2025-5512')}>Submit</button></>}
    >
      {renderActionBody('processInvoiceModal', <>
        <div className="mb-3"><label className={s.formLabel}>Supplier</label><select className={s.formControl}><option>OfficeMart</option><option>CreativeHub</option><option>CloudServe</option><option>Global Logistics</option><option>DesignWorks</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="12500" /></div>
        <div className="mb-3"><label className={s.formLabel}>Description</label><textarea className={s.formControl} rows={2} defaultValue="Monthly office supplies order" /></div>
        <div className="mb-3"><label className={s.formLabel}>Due Date</label><input type="date" className={s.formControl} defaultValue="2025-07-15" /></div>
        <div className="mb-3"><label className={s.formLabel}>Upload Invoice PDF</label>
          <div className="text-center p-3 rounded" style={{ background: 'var(--pm-surface-2)', border: '2px dashed var(--pm-border)', cursor: 'pointer' }}>
            <i className="bi bi-cloud-upload" style={{ fontSize: 24, color: 'var(--pm-muted)' }} /><br /><span style={{ fontSize: 13 }}>Drag & drop or click to browse</span>
          </div>
        </div>
      </>)}
    </MBox>
  )

  /* M3: Bulk Pay Suppliers (3-step) */
  const renderBulkPaySuppliers = () => (
    <MBox id="bulkPaySuppliersModal" active={active} onClose={onClose} title={<><i className="bi bi-people text-accent me-2" />Bulk Pay Suppliers</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{bulkStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('bulkPay', 3)}>{bulkStep === 2 ? 'Authorize Batch' : 'Next'} <i className={`bi ${bulkStep === 2 ? 'bi-shield-lock' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="bulkPay" current={bulkStep} />
      {bulkStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <strong>3 approved invoices selected</strong> · Total: KES 165,500<br />
          OfficeMart KES 12,500 · CloudServe KES 128,000 · DesignWorks KES 28,000
        </div>
        <div className="mb-3"><label className={s.formLabel}>Payment Method</label><select className={s.formControl}><option>PesaLink (Instant)</option><option>M-Pesa B2C</option><option>EFT/Bank Transfer</option></select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Capture available early-payment discounts</label></div>
      </div>}
      {bulkStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <i className="bi bi-shield-lock" /> <strong>Maker-Checker required</strong> · You are the maker. A checker (CFO or Director) must approve before execution.
        </div>
        <div className="mb-3"><label className={s.formLabel}>Authorization PIN</label><div className={s.pinRow}>{[0,1,2,3,4,5].map(i => <input key={i} type="password" maxLength={1} className={s.formControl} style={{ width: 48, textAlign: 'center' }} />)}</div></div>
      </div>}
      {bulkStep === 3 && renderActionBody('bulkPaySuppliersModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Batch authorized and processing!</h5><p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: BAP-2025-06 · 3 payments · KES 165,500</p></div>)}
    </MBox>
  )

  /* M4: Approval Queue */
  const renderApprovalQueue = () => (
    <MBox id="approvalQueueModal" active={active} onClose={onClose} title={<><i className="bi bi-check2-square text-primary me-2" />Invoice Approval Queue</>} size="lg">
      <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Invoice</th><th>Supplier</th><th>Amount</th><th>Requested By</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>INV-4419</td><td>OfficeMart</td><td>KES 12,500</td><td>HR Dept</td><td><div className="d-flex gap-1"><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => doAction('approvalQueueModal', 'Approved INV-4419', 'APPR-1001')}>Approve</button><button className={cx(s.btnPm, s.btnSm, s.btnPmD)} onClick={onClose}>Reject</button></div></td></tr>
          <tr><td>INV-8822</td><td>CreativeHub</td><td>KES 45,000</td><td>Marketing</td><td><div className="d-flex gap-1"><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => doAction('approvalQueueModal', 'Approved INV-8822', 'APPR-1002')}>Approve</button><button className={cx(s.btnPm, s.btnSm, s.btnPmD)} onClick={onClose}>Reject</button></div></td></tr>
        </tbody>
      </table></div>
    </MBox>
  )

  /* M5-M8: simple modals */
  const renderSchedulePayment = () => (
    <MBox id="schedulePaymentModal" active={active} onClose={onClose} title={<><i className="bi bi-calendar-check me-2" />Schedule Payment</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('schedulePaymentModal', 'Payment scheduled!', 'SCH-2025-01')}>Schedule</button></>}
    >
      {renderActionBody('schedulePaymentModal', <>
        <div className="mb-3"><label className={s.formLabel}>Invoice</label><select className={s.formControl}><option>INV-4419 — OfficeMart KES 12,500</option><option>INV-3410 — CloudServe KES 128,000</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Scheduled Date</label><input type="date" className={s.formControl} defaultValue="2025-06-28" /></div>
        <div className="mb-3"><label className={s.formLabel}>Method</label><select className={s.formControl}><option>PesaLink</option><option>M-Pesa B2C</option><option>Bank Transfer</option></select></div>
      </>)}
    </MBox>
  )

  const renderAgingReport = () => (
    <MBox id="agingReportModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-up me-2" />Aging Report</>} size="lg">
      <div className="row g-3">
        <div className="col-md-4"><div style={{ background: 'var(--pm-accent-soft)', borderRadius: 'var(--pm-r-md)', padding: 16 }}><div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>0-30 Days</div><div style={{ fontSize: 18, fontWeight: 700, color: '#065F46' }}>KES 1.2M</div></div></div>
        <div className="col-md-4"><div style={{ background: 'var(--pm-warning-soft)', borderRadius: 'var(--pm-r-md)', padding: 16 }}><div style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>31-60 Days</div><div style={{ fontSize: 18, fontWeight: 700, color: '#92400E' }}>KES 450K</div></div></div>
        <div className="col-md-4"><div style={{ background: 'var(--pm-danger-soft)', borderRadius: 'var(--pm-r-md)', padding: 16 }}><div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>61-90+ Days</div><div style={{ fontSize: 18, fontWeight: 700, color: '#991B1B' }}>KES 120K</div></div></div>
      </div>
    </MBox>
  )

  const renderReconciliation = () => (
    <MBox id="reconciliationModal" active={active} onClose={onClose} title={<><i className="bi bi-arrow-left-right me-2" />Bank Reconciliation</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reconciliationModal', 'Reconciliation started!')}>Start Reconciliation</button></>}
    >
      {renderActionBody('reconciliationModal', <>
        <div className="mb-3"><label className={s.formLabel}>Bank Account</label><select className={s.formControl}><option>Equity Bank — Main Operations</option><option>KCB — Business Account</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Period</label><select className={s.formControl}><option>June 2025</option><option>May 2025</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>1 unreconciled statement found for Equity Bank main account</div>
      </>)}
    </MBox>
  )

  const renderSupplierDetail = () => (
    <MBox id="supplierDetailModal" active={active} onClose={onClose} title={<><i className="bi bi-person-lines-fill me-2" />Supplier Detail</>} size="lg">
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Company</span><strong>OfficeMart</strong></div>
        <div className="d-flex justify-content-between"><span>Category</span><strong>Office Supplies</strong></div>
        <div className="d-flex justify-content-between"><span>Invoices</span><strong>3 open</strong></div>
        <div className="d-flex justify-content-between"><span>Outstanding</span><strong>KES 12,500</strong></div>
        <div className="d-flex justify-content-between"><span>Terms</span><strong>Net 30 / 2% early pay</strong></div>
        <div className="d-flex justify-content-between"><span>KYC Status</span><span className={cx(s.badge, s.badgeS)}>Verified</span></div>
      </div>
    </MBox>
  )

  const renderInvoiceDetail = () => (
    <MBox id="invoiceDetailModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-text me-2" />Invoice Detail</>} size="lg">
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Invoice</span><strong>INV-4419</strong></div>
        <div className="d-flex justify-content-between"><span>Supplier</span><strong>OfficeMart</strong></div>
        <div className="d-flex justify-content-between"><span>Amount</span><strong>KES 12,500</strong></div>
        <div className="d-flex justify-content-between"><span>Due Date</span><strong>28 Jun 2025</strong></div>
        <div className="d-flex justify-content-between"><span>Status</span><span className={cx(s.badge, s.badgeW)}>Pending Approval</span></div>
      </div>
    </MBox>
  )

  const renderPaymentDetail = () => (
    <MBox id="paymentDetailModal" active={active} onClose={onClose} title={<><i className="bi bi-credit-card me-2" />Payment Detail</>} size="lg">
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Reference</span><strong>PAY-2025-092</strong></div>
        <div className="d-flex justify-content-between"><span>Method</span><strong>PesaLink</strong></div>
        <div className="d-flex justify-content-between"><span>Amount</span><strong>KES 75,000</strong></div>
        <div className="d-flex justify-content-between"><span>Status</span><span className={cx(s.badge, s.badgeD)}>Failed</span></div>
        <div className="d-flex justify-content-between"><span>Reason</span><strong style={{ color: 'var(--pm-danger)' }}>Invalid account length</strong></div>
      </div>
      <button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('paymentDetailModal', 'Payment retry initiated!', 'RETRY-092')}>Retry Payment</button>
    </MBox>
  )

  const renderDiscountTracking = () => (
    <MBox id="discountTrackingModal" active={active} onClose={onClose} title={<><i className="bi bi-percent me-2" />Discount Tracking</>} size="lg">
      <div className={s.statusRow}><div><strong>OfficeMart — 2% Early Pay</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Expires tomorrow · Save KES 250</div></div><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => doAction('discountTrackingModal', 'Discount captured! KES 250 saved.')}>Capture</button></div>
      <div className={s.statusRow}><div><strong>CloudServe — 1.5% Net 15</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>3 days left · Save KES 1,920</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('discountTrackingModal', 'Discount captured!')}>Capture</button></div>
    </MBox>
  )

  const renderEarlyPaymentCalc = () => (
    <MBox id="earlyPaymentCalcModal" active={active} onClose={onClose} title={<><i className="bi bi-calculator me-2" />Early Payment Calculator</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('earlyPaymentCalcModal', 'Early payment scheduled! Saving KES 250.')}>Pay Now</button></>}
    >
      {renderActionBody('earlyPaymentCalcModal', <>
        <div className="mb-3"><label className={s.formLabel}>Invoice</label><select className={s.formControl}><option>INV-4419 — OfficeMart KES 12,500 (2% discount)</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>Original Amount</span><strong>KES 12,500</strong></div>
          <div className="d-flex justify-content-between"><span>Discount (2%)</span><strong style={{ color: 'var(--pm-accent)' }}>KES 250</strong></div>
          <div className="d-flex justify-content-between"><span>Net Payment</span><strong style={{ color: 'var(--pm-accent)' }}>KES 12,250</strong></div>
        </div>
      </>)}
    </MBox>
  )

  const renderOnboardSupplierInvite = () => (
    <MBox id="onboardSupplierInviteModal" active={active} onClose={onClose} title={<><i className="bi bi-envelope me-2" />Invite Supplier to Self-Onboard</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('onboardSupplierInviteModal', 'Invitation sent! Supplier will appear as Pending.')}>Send Invitation <i className="bi bi-send" /></button></>}
    >
      {renderActionBody('onboardSupplierInviteModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>Invite suppliers to self-onboard. They upload KRA PIN/CR12 and submit invoices directly into your queue.</div>
        <div className="mb-3"><label className={s.formLabel}>Supplier Company Name</label><input type="text" className={s.formControl} placeholder="e.g. DesignWorks Agency" /></div>
        <div className="mb-3"><label className={s.formLabel}>Contact Email</label><input type="email" className={s.formControl} placeholder="billing@designworks.com" /></div>
        <div className="mb-3"><label className={s.formLabel}>Custom Message</label><textarea className={s.formControl} rows={3} defaultValue="Hello, we are moving our AP process to PayMo. Please click the link to submit your business details and bank information." /></div>
      </>)}
    </MBox>
  )

  const renderTaxSettings = () => (
    <MBox id="taxSettingsModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-check me-2" />Tax Settings</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('taxSettingsModal', 'Tax settings saved!')}>Save</button></>}
    >
      {renderActionBody('taxSettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Withholding Tax Rate</label><input type="number" className={s.formControl} defaultValue="5" /></div>
        <div className="mb-3"><label className={s.formLabel}>VAT Handling</label><select className={s.formControl}><option>Auto-calculate 16% VAT</option><option>Manual entry</option></select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable KRA e-TIMS integration</label></div>
      </>)}
    </MBox>
  )

  const renderExportAP = () => (
    <MBox id="exportAPModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-spreadsheet me-2" />Export AP Data</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => { downloadFile('ap-export.csv', 'Supplier,Invoice,Amount,Status'); onClose() }}>Export</button></>}
    >
      <div className="mb-3"><label className={s.formLabel}>Date Range</label><select className={s.formControl}><option>This Month</option><option>Last Month</option><option>Last 3 Months</option></select></div>
      <div className="mb-3"><label className={s.formLabel}>Format</label><select className={s.formControl}><option>CSV</option><option>Excel</option><option>PDF</option></select></div>
      <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Include discount tracking data</label></div>
    </MBox>
  )

  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Notifications</>}
      footer={<><button className={cx(s.btnPm, s.btnSm)}>Mark all read</button><button className={s.btnPm} onClick={onClose}>Close</button></>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Failed PesaLink Transfer</strong><div style={{ fontSize: 11 }}>Inv-0092 to Global Logistics failed. Invalid account length.</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Discount expiring soon</strong><div style={{ fontSize: 11 }}>OfficeMart 2% discount expires tomorrow.</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>New Supplier Onboarded</strong><div style={{ fontSize: 11 }}>DesignWorks Agency completed self-onboarding.</div></div>
    </MBox>
  )

  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose} title={<><i className="bi bi-person-circle me-2" />User Profile</>}
    >
      <div className="text-center">
        <div className={s.avatar} style={{ width: 64, height: 64, fontSize: 24, background: 'linear-gradient(135deg, #FECDD3 0%, #FB7185 100%)', margin: '0 auto 12px' }}>AO</div>
        <h5 style={{ fontWeight: 700 }}>Amina O.</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Head of Procurement · AP Admin</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Approval Limit</span><br /><strong>Unlimited</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Pending Tasks</span><br /><strong>8 Approvals</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  return (<>
    {renderAddSupplier()}{renderProcessInvoice()}{renderBulkPaySuppliers()}{renderApprovalQueue()}
    {renderSchedulePayment()}{renderAgingReport()}{renderReconciliation()}{renderSupplierDetail()}
    {renderInvoiceDetail()}{renderPaymentDetail()}{renderDiscountTracking()}{renderEarlyPaymentCalc()}
    {renderOnboardSupplierInvite()}{renderTaxSettings()}{renderExportAP()}{renderNotifications()}
    {renderProfile()}
  </>)
}
