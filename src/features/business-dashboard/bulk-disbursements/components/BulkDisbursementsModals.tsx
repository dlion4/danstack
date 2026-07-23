import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/bulk-disbursements.module.css'

/* ============================================================================
   Bulk Disbursements — modal layer (legacy page 3.5, ~25 modals)
   LEGACY BRIDGE: doAction, nextFlow, switchTab, cacheAndReset
   Includes 4-step New Disbursement with upload simulation
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
  disbursement: { labels: ['Upload', 'Map', 'Setup', 'Submit'] },
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

export default function BulkDisbursementsModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ disbursement: 1 })
  const [_tabs, setTabs] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ disbursement: 1 })
      setBusy(null)
      setTabs({})
      setUploadProgress(0)
      setShowUpload(false)
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  const uploadTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => { window.clearTimeout(busyTimer.current); window.clearInterval(uploadTimer.current) }, [])

  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => { setResults((prev) => ({ ...prev, [modalId]: { msg, ref } })); setBusy(null) }, 1500)
  }

  const nextFlow = (key: string, total: number) => {
    const cur = flows[key] ?? 1
    if (cur >= total) { onClose(); return }
    setFlows((prev) => ({ ...prev, [key]: cur + 1 }))
  }

  const simulateUpload = () => {
    setShowUpload(true)
    setUploadProgress(0)
    let progress = 0
    uploadTimer.current = window.setInterval(() => {
      progress += 20
      setUploadProgress(progress)
      if (progress >= 100) {
        window.clearInterval(uploadTimer.current)
        window.setTimeout(() => nextFlow('disbursement', 4), 400)
      }
    }, 200)
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

  const ndStep = flows.disbursement ?? 1

  /* M1: New Disbursement (4-step with upload simulation) */
  const renderNewDisbursement = () => (
    <MBox id="newDisbursementModal" active={active} onClose={onClose} title={<><i className="bi bi-send text-primary me-2" />New Disbursement Batch</>} size="lg"
      footer={<>
        <button className={s.btnPm} onClick={onClose}>Cancel</button>
        {ndStep < 4 && ndStep !== 2 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => {
          if (ndStep === 1) { simulateUpload(); return }
          nextFlow('disbursement', 4)
        }}>
          {ndStep === 3 ? 'Submit Batch' : 'Next'} <i className={`bi ${ndStep === 3 ? 'bi-check2' : 'bi-arrow-right'}`} />
        </button>}
      </>}
    >
      <Stepper flowKey="disbursement" current={ndStep} />
      {ndStep === 1 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="text-center p-4 rounded mb-3" style={{ background: 'var(--pm-surface-2)', border: '2px dashed var(--pm-border)', cursor: 'pointer' }} onClick={simulateUpload}>
          <i className="bi bi-cloud-upload" style={{ fontSize: 32, color: 'var(--pm-muted)' }} />
          <p style={{ fontSize: 13 }}>Upload CSV/Excel with recipient data</p>
          <p style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Name, Phone/Bank, Amount, Reference</p>
        </div>
        <div className="d-flex gap-2 mb-2">
          <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('templateLibraryModal')}><i className="bi bi-file-earmark-text" /> Use Template</button>
          <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('recipientValidationModal')}><i className="bi bi-people" /> Validate</button>
        </div>
        {showUpload && (<div className={s.uploadProgress}>
          <div className={s.uploadBar}><div className={s.uploadFill} style={{ width: `${uploadProgress}%` }} /></div>
          <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }}>{uploadProgress}% uploaded</div>
        </div>)}
      </div>)}
      {ndStep === 2 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <strong>File: recipients.csv</strong> · 120 records detected<br />
          <span style={{ color: 'var(--pm-accent)' }}>✓ 118 valid</span> · <span style={{ color: 'var(--pm-danger)' }}>✗ 2 invalid accounts</span>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Column Mapping</label>
          <select className={s.formControl}><option>Auto-detect columns</option><option>Manual mapping</option></select>
        </div>
        <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => nextFlow('disbursement', 4)}>Continue <i className="bi bi-arrow-right" /></button>
      </div>)}
      {ndStep === 3 && (<div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Batch Name</label><input type="text" className={s.formControl} defaultValue="June Payroll — Emergency" /></div>
        <div className="mb-3"><label className={s.formLabel}>Disbursement Method</label><select className={s.formControl}><option>M-Pesa B2C</option><option>Bank Transfer</option><option>PesaLink</option><option>Mixed</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Total Amount</label><div className={s.formControl} style={{ background: 'var(--pm-surface-2)' }}>KES 450,000 (120 recipients)</div></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Require checker approval before disbursement</label></div>
      </div>)}
      {ndStep === 4 && renderActionBody('newDisbursementModal', <div className={s.receipt}>
        <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
        <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Batch validated and sent for approval!</h5>
        <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: BTH-9924 · 118 valid recipients · KES 450,000</p>
      </div>)}
    </MBox>
  )

  /* M2: Schedule Batch */
  const renderScheduleBatch = () => (
    <MBox id="scheduleBatchModal" active={active} onClose={onClose} title={<><i className="bi bi-calendar-plus me-2" />Schedule Batch</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('scheduleBatchModal', 'Batch scheduled!', 'BTH-SCHED-9925')}>Schedule</button></>}
    >
      {renderActionBody('scheduleBatchModal', <>
        <div className="mb-3"><label className={s.formLabel}>Batch Template</label><select className={s.formControl}><option>Monthly Payroll</option><option>Vendor Payments</option><option>Custom</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Scheduled Date</label><input type="date" className={s.formControl} defaultValue="2025-07-28" /></div>
        <div className="mb-3"><label className={s.formLabel}>Frequency</label><select className={s.formControl}><option>One-time</option><option>Monthly</option><option>Weekly</option></select></div>
      </>)}
    </MBox>
  )

  /* M3: Recipient Validation */
  const renderRecipientValidation = () => (
    <MBox id="recipientValidationModal" active={active} onClose={onClose} title={<><i className="bi bi-people me-2" />Recipient Validation</>} size="lg"
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>
        <strong>118 valid recipients</strong> · Total: KES 1,180,000
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
        <strong>2 invalid accounts</strong><br />
        <span style={{ fontSize: 11 }}>Grace T. — Bank account length mismatch<br />Ali O. — M-Pesa number format error</span>
      </div>
      <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('newDisbursementModal')}><i className="bi bi-pencil" /> Fix Invalid</button>
    </MBox>
  )

  /* M4: Fund Wallet */
  const renderFundWallet = () => (
    <MBox id="fundWalletModal" active={active} onClose={onClose} title={<><i className="bi bi-wallet2 me-2" />Fund Wallet / Float Top-up</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('fundWalletModal', 'Top-up initiated!', 'TOPUP-2025-001')}>Top-up</button></>}
    >
      {renderActionBody('fundWalletModal', <>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="5000000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Source Account</label><select className={s.formControl}><option>KCB — Business Account</option><option>Equity — Float Account</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <i className="bi bi-info-circle" /> Current float: KES 14.2M · After top-up: KES 19.2M
        </div>
      </>)}
    </MBox>
  )

  /* M5: Batch History */
  const renderBatchHistory = () => (
    <MBox id="batchHistoryModal" active={active} onClose={onClose} title={<><i className="bi bi-clock-history me-2" />Batch History</>} size="xl"
    >
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Batch ID</th><th>Type</th><th>Recipients</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>BTH-9920</td><td>Salary</td><td>118</td><td>KES 1,180,000</td><td>25 Jun 2025</td><span className={cx(s.badge, s.badgeS)}>Completed</span></tr>
            <tr><td>BTH-9919</td><td>Vendor</td><td>42</td><td>KES 620,000</td><td>22 Jun 2025</td><span className={cx(s.badge, s.badgeS)}>Completed</span></tr>
            <tr><td>BTH-9918</td><td>Emergency</td><td>25</td><td>KES 375,000</td><td>20 Jun 2025</td><span className={cx(s.badge, s.badgeS)}>Completed</span></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* M6: Batch Detail */
  const renderBatchDetail = () => (
    <MBox id="batchDetailModal" active={active} onClose={onClose} title={<><i className="bi bi-list-check me-2" />Batch Detail — BTH-9920</>} size="lg"
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Batch ID</span><strong>BTH-9920</strong></div>
        <div className="d-flex justify-content-between"><span>Type</span><strong>Salary Disbursement</strong></div>
        <div className="d-flex justify-content-between"><span>Recipients</span><strong>118/120</strong></div>
        <div className="d-flex justify-content-between"><span>Amount</span><strong>KES 1,180,000</strong></div>
        <div className="d-flex justify-content-between"><span>Status</span><span className={cx(s.badge, s.badgeS)}>Completed</span></div>
      </div>
    </MBox>
  )

  /* M7: Approval Modal */
  const renderApprovalModal = () => (
    <MBox id="approvalModal" active={active} onClose={onClose} title={<><i className="bi bi-check-circle me-2" />Batch Approval</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Reject</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('approvalModal', 'Batch approved and processing!', 'BTH-9922')}>Approve & Process</button></>}
    >
      {renderActionBody('approvalModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>Batch</span><strong>BTH-9922</strong></div>
          <div className="d-flex justify-content-between"><span>Type</span><strong>Emergency Relief</strong></div>
          <div className="d-flex justify-content-between"><span>Recipients</span><strong>120</strong></div>
          <div className="d-flex justify-content-between"><span>Amount</span><strong style={{ color: 'var(--pm-accent)' }}>KES 450,000</strong></div>
          <div className="d-flex justify-content-between"><span>Initiator</span><strong>Sam O. (Operations Manager)</strong></div>
        </div>
        <div className="p-2 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-exclamation-triangle" /> Emergency batch — requires immediate approval</div>
      </>)}
    </MBox>
  )

  /* M8: Emergency Disbursement */
  const renderEmergencyDisbursement = () => (
    <MBox id="emergencyDisbursementModal" active={active} onClose={onClose} title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Emergency Disbursement</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmD)} onClick={() => doAction('emergencyDisbursementModal', 'Emergency batch created!', 'BTH-EMERG')}>Create Emergency</button></>}
    >
      {renderActionBody('emergencyDisbursementModal', <>
        <div className="mb-3"><label className={s.formLabel}>Reason</label><textarea className={s.formControl} rows={2} defaultValue="Critical vendor payment — immediate disbursement required" /></div>
        <div className="mb-3"><label className={s.formLabel}>Recipients</label><input type="number" className={s.formControl} defaultValue="5" /></div>
        <div className="mb-3"><label className={s.formLabel}>Total Amount (KES)</label><input type="number" className={s.formControl} defaultValue="250000" /></div>
        <div className="p-2 rounded" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}><i className="bi bi-exclamation-triangle" /> Emergency batches bypass scheduler and go directly to approval</div>
      </>)}
    </MBox>
  )

  /* M9: Template Library */
  const renderTemplateLibrary = () => (
    <MBox id="templateLibraryModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-text me-2" />Template Library</>}
    >
      <div className="row g-2">
        <div className="col-md-4"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => onOpen('newDisbursementModal')}>
          <i className="bi bi-people" style={{ fontSize: 24, color: 'var(--pm-primary)' }} /><br /><strong>Payroll Template</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>118 recipients</div>
        </div></div>
        <div className="col-md-4"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => onOpen('newDisbursementModal')}>
          <i className="bi bi-shop" style={{ fontSize: 24, color: 'var(--pm-purple)' }} /><br /><strong>Vendor Template</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>42 vendors</div>
        </div></div>
        <div className="col-md-4"><div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => onOpen('newDisbursementModal')}>
          <i className="bi bi-plus" style={{ fontSize: 24, color: 'var(--pm-accent)' }} /><br /><strong>Create Custom</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Upload your own</div>
        </div></div>
      </div>
    </MBox>
  )

  /* M10: Audit Trail */
  const renderAuditTrail = () => (
    <MBox id="auditTrailModal" active={active} onClose={onClose} title={<><i className="bi bi-clock-history me-2" />Audit Trail</>} size="lg"
    >
      <div className={s.feedItem}><div className={cx(s.iconCircle)} style={{ background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' }}><i className="bi bi-check" /></div><div><strong>BTH-9920 completed</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>118/120 processed · 25 Jun · System</div></div></div>
      <div className={s.feedItem}><div className={cx(s.iconCircle)} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-check-circle" /></div><div><strong>BTH-9919 approved</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>CFO Peter K. · 22 Jun · 09:15</div></div></div>
      <div className={s.feedItem}><div className={cx(s.iconCircle)} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-exclamation-triangle" /></div><div><strong>2 invalid accounts flagged</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>BTH-9920 · Bank length mismatch · 25 Jun</div></div></div>
    </MBox>
  )

  /* M11: Float Management */
  const renderFloatManagement = () => (
    <MBox id="floatManagementModal" active={active} onClose={onClose} title={<><i className="bi bi-wallet2 me-2" />Float Management</>}
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Current Float</span><strong>KES 14.2M</strong></div>
        <div className="d-flex justify-content-between"><span>Scheduled Payments</span><strong style={{ color: 'var(--pm-warning)' }}>KES 8.52M (next 48h)</strong></div>
        <div className="d-flex justify-content-between"><span>Buffer</span><strong style={{ color: 'var(--pm-accent)' }}>KES 5.68M</strong></div>
      </div>
      <div className={s.progress}><div className={s.progressBar} style={{ width: '60%', background: 'var(--pm-warning)' }} /></div>
      <button className={cx(s.btnPm, s.btnSm, s.btnPmA, 'mt-2 w-100')} onClick={() => onOpen('fundWalletModal')}><i className="bi bi-wallet2" /> Top-up Float</button>
    </MBox>
  )

  /* M12: Settlement Report */
  const renderSettlementReport = () => (
    <MBox id="settlementReportModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-spreadsheet me-2" />Settlement Report</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => { downloadFile('settlement.csv', 'Batch,Amount,Status'); onClose() }}>Download</button></>}
    >
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Total Disbursed (June)</span><strong>KES 2.18M</strong></div>
        <div className="d-flex justify-content-between"><span>Successful</span><strong style={{ color: 'var(--pm-accent)' }}>118/120 (97.8%)</strong></div>
        <div className="d-flex justify-content-between"><span>Failed</span><strong style={{ color: 'var(--pm-danger)' }}>2</strong></div>
        <div className="d-flex justify-content-between"><span>Average Processing Time</span><strong>2.3 minutes</strong></div>
      </div>
    </MBox>
  )

  /* M13: Attention Action */
  const renderAttentionAction = () => (
    <MBox id="attentionActionModal" active={active} onClose={onClose} title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Attention Actions</>}
    >
      <div className={s.feedItem}>
        <div className={cx(s.iconCircle)} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-check-circle" /></div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Approval Needed</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>BTH-9922 · Emergency · KES 450K</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('approvalModal')}>Review</button>
      </div>
      <div className={s.feedItem}>
        <div className={cx(s.iconCircle)} style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}><i className="bi bi-exclamation-triangle" /></div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Invalid Accounts</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>2 bank mismatches · BTH-9920</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('recipientValidationModal')}>Fix</button>
      </div>
      <div className={s.feedItem}>
        <div className={cx(s.iconCircle)} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-bank" /></div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Low Float Warning</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Batches exceed KES 14.2M float</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('fundWalletModal')}>Top-up</button>
      </div>
    </MBox>
  )

  /* M14: Business Profile */
  const renderBusinessProfile = () => (
    <MBox id="businessProfileModal" active={active} onClose={onClose} title={<><i className="bi bi-buildings me-2" />Business Accounts</>}
    >
      <div className="p-3 border rounded mb-2 d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className={s.avatar} style={{ background: 'var(--pm-gradient-slate)' }}>SO</div>
          <div><strong>Safiri Operations Ltd</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PayBill: 400192</div></div>
        </div>
        <i className="bi bi-check-circle-fill text-success" />
      </div>
      <div className="p-3 border rounded mb-3 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }}>
        <div className="d-flex align-items-center gap-3">
          <div className={s.avatar} style={{ background: 'linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)' }}>SL</div>
          <div><strong>Safiri Logistics (Subsidiary)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PayBill: 400193</div></div>
        </div>
        <i className="bi bi-arrow-right text-muted" />
      </div>
      <hr className={s.divider} />
      <div className="d-flex gap-2">
        <button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-plus" /> Add New Business</button>
        <button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-person" /> My Profile</button>
      </div>
    </MBox>
  )

  /* M15: Notifications */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Alerts & Notifications</>}
      footer={<><button className={cx(s.btnPm, s.btnSm)}>Mark All Read</button><button className={s.btnPm} onClick={onClose}>Close</button></>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}><strong>Batch Executed</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>BTH-9920 successfully completed. 118 records processed.</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Approval Required</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>BTH-9922 (Emergency Relief) is waiting for checker approval.</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Float Alert</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>Payments for next 48h exceed available float by KES 800K.</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>System Update</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>PesaLink routing optimized for lower fees.</div></div>
    </MBox>
  )

  /* M16: Health Check */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-check text-success me-2" />System Health & APIs</>}
    >
      <div className={s.statusRow}><div><strong>M-Pesa B2C Gateway</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Response time: 120ms</div></div><span className={cx(s.badge, s.badgeS)}>Operational</span></div>
      <div className={s.statusRow}><div><strong>PesaLink Core</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Response time: 450ms</div></div><span className={cx(s.badge, s.badgeS)}>Operational</span></div>
      <div className={s.statusRow}><div><strong>Airtel Money API</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Intermittent timeouts</div></div><span className={cx(s.badge, s.badgeW)}>Degraded</span></div>
      <div className={s.statusRow}><div><strong>PayMo Webhooks</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>100% delivery success</div></div><span className={cx(s.badge, s.badgeS)}>Operational</span></div>
      <hr className={s.divider} />
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>Batches targeting Airtel Money will auto-retry up to 3x or fallback to Bank if configured.</div>
    </MBox>
  )

  return (
    <>
      {renderNewDisbursement()}
      {renderScheduleBatch()}
      {renderRecipientValidation()}
      {renderFundWallet()}
      {renderBatchHistory()}
      {renderBatchDetail()}
      {renderApprovalModal()}
      {renderEmergencyDisbursement()}
      {renderTemplateLibrary()}
      {renderAuditTrail()}
      {renderFloatManagement()}
      {renderSettlementReport()}
      {renderAttentionAction()}
      {renderBusinessProfile()}
      {renderNotifications()}
      {renderHealthCheck()}
    </>
  )
}
