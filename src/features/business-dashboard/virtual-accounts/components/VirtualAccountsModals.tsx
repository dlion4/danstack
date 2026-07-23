import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/virtual-accounts.module.css'

/* ============================================================================
   Virtual Accounts & Sub-Accounts — modal layer (legacy page 3.9)
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

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  va: { labels: ['Details', 'Controls', 'Done'] },
  sub: { labels: ['Details', 'Limits', 'Done'] },
  bulk: { labels: ['Upload', 'Review', 'Done'] },
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
            {i > 0 && <div className={s.stepLine} style={{ position: 'absolute', top: 14, left: '-50%', width: '100%', background: done ? 'var(--pm-accent)' : undefined }} />}
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

export default function VirtualAccountsModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ va: 1, sub: 1, bulk: 1 })

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ va: 1, sub: 1, bulk: 1 })
      setBusy(null)
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1500)
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
        <button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-share" /> Continue</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  /* ========================================================================
     M1: Create Virtual Account (Multistep, 3 steps)
     ====================================================================== */
  const renderCreateVA = () => {
    const step = flows.va
    return (
      <MBox id="createVA" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-plus-lg text-primary me-2" />Create Virtual Account</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('va', 3)}>
              {step >= 3 ? 'Done' : 'Continue'}
            </button>
          </>
        }
      >
        <Stepper flowKey="va" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Account Name</label><input className={s.formControl} placeholder="e.g. Client Escrow" /></div>
            <div className="mb-3"><label className={s.formLabel}>Account Type</label>
              <select className={s.formControl}><option>General</option><option>Collections</option><option>Restricted</option><option>Project</option><option>Reserve</option></select>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Description</label><textarea className={s.formControl} rows={2} placeholder="Purpose and description..." /></div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Daily Limit (KES)</label><input className={s.formControl} defaultValue="5000000" /></div>
            <div className="mb-3"><label className={s.formLabel}>Auto-Sweep</label>
              <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable auto-sweep to treasury</label></div>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Approval Level</label>
              <select className={s.formControl}><option>Auto</option><option>Manager</option><option>Director</option><option>CFO + Board</option></select>
            </div>
          </div>
        )}
        {step === 3 && renderActionBody('createVA', (
          <div className={s.fstepActive}>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)' }}>
              <strong>Review & Create</strong>
              <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 8 }}>Account: Client Escrow • Type: Collections • Limit: KES 5M</div>
            </div>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('createVA', 'Virtual account created successfully!', 'VA-019')}>Create Account <i className="bi bi-check-lg" /></button>
          </div>
        ))}
      </MBox>
    )
  }

  /* ========================================================================
     M2: Create Sub-Account (Multistep, 3 steps)
     ====================================================================== */
  const renderCreateSub = () => {
    const step = flows.sub
    return (
      <MBox id="createSub" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-diagram-3 text-primary me-2" />Create Sub-Account</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('sub', 3)}>
              {step >= 3 ? 'Done' : 'Continue'}
            </button>
          </>
        }
      >
        <Stepper flowKey="sub" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Parent VA</label>
              <select className={s.formControl}><option>VA-003 — Client Collections</option><option>VA-007 — Payroll</option><option>VA-009 — Marketing</option></select>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Sub-Account Name</label><input className={s.formControl} placeholder="e.g. Project Delta" /></div>
            <div className="mb-3"><label className={s.formLabel}>Monthly Budget (KES)</label><input className={s.formControl} defaultValue="2000000" /></div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Spending Limit (KES)</label><input className={s.formControl} defaultValue="2000000" /></div>
            <div className="mb-3"><label className={s.formLabel}>Approval Required</label>
              <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Require manager approval for spending</label></div>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Notification Threshold</label>
              <select className={s.formControl}><option>Alert at 80%</option><option>Alert at 90%</option><option>Alert at 100%</option></select>
            </div>
          </div>
        )}
        {step === 3 && renderActionBody('createSub', (
          <div className={s.fstepActive}>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)' }}>
              <strong>Review & Create</strong>
              <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 8 }}>Sub: Project Delta • Parent: VA-003 • Limit: KES 2M</div>
            </div>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('createSub', 'Sub-account created successfully!', 'SUB-0145')}>Create Sub-Account <i className="bi bi-check-lg" /></button>
          </div>
        ))}
      </MBox>
    )
  }

  /* ========================================================================
     M3: Bulk Fund (Multistep, 3 steps)
     ====================================================================== */
  const renderBulkFund = () => {
    const step = flows.bulk
    return (
      <MBox id="bulkFundModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-upload text-primary me-2" />Bulk Fund Virtual Accounts</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('bulk', 3)}>
              {step >= 3 ? 'Done' : step >= 2 ? 'Execute Batch' : 'Review'}
            </button>
          </>
        }
      >
        <Stepper flowKey="bulk" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Upload CSV</label><input type="file" className={s.formControl} accept=".csv" /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Format: VA-ID, Amount, Source, Reference
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Review Batch</h6>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>VA</th><th>Amount</th><th>Source</th></tr></thead>
                <tbody>
                  <tr><td>VA-003</td><td>KES 2,500,000</td><td>Bank Transfer</td></tr>
                  <tr><td>VA-007</td><td>KES 5,000,000</td><td>Bank Transfer</td></tr>
                  <tr><td>VA-009</td><td>KES 1,000,000</td><td>PayMo Wallet</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
              <strong>Total: KES 8,500,000</strong>
            </div>
          </div>
        )}
        {step === 3 && renderActionBody('bulkFundModal', (
          <div className={s.fstepActive}>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('bulkFundModal', '3 accounts funded successfully! KES 8.5M distributed.', 'BF-20250627-9912')}>Execute Batch <i className="bi bi-check-all" /></button>
          </div>
        ))}
      </MBox>
    )
  }

  /* ========================================================================
     M4: Fund VA
     ====================================================================== */
  const renderFundVA = () => (
    <MBox id="fundVA" active={active} onClose={onClose}
      title={<><i className="bi bi-cash-stack text-warning me-2" />Fund Virtual Account</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('fundVA', 'VA funded successfully!', 'FND-20250627-4410')}>Fund Now</button>
        </>
      }
    >
      {renderActionBody('fundVA', <>
        <div className="mb-3"><label className={s.formLabel}>Target Account</label>
          <select className={s.formControl}><option>VA-003 — Client Collections</option><option>VA-007 — Payroll</option><option>VA-009 — Marketing</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="1000000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Source</label>
          <select className={s.formControl}><option>M-Pesa PayBill</option><option>Bank Transfer</option><option>PayMo Wallet</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Reference</label><input className={s.formControl} placeholder="Optional reference" /></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M5: Transfer Modal
     ====================================================================== */
  const renderTransfer = () => (
    <MBox id="transferModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-left-right text-info me-2" />Internal Transfer</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('transferModal', 'Transfer completed successfully!', 'INT-20250627-8834')}>Transfer</button>
        </>
      }
    >
      {renderActionBody('transferModal', <>
        <div className="mb-3"><label className={s.formLabel}>From</label>
          <select className={s.formControl}><option>VA-001 — Operations</option><option>VA-003 — Client Collections</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>To</label>
          <select className={s.formControl}><option>VA-007 — Payroll</option><option>VA-009 — Marketing</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="1000000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Purpose</label><input className={s.formControl} defaultValue="Inter-departmental transfer" /></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M6: Reconciliation Modal
     ====================================================================== */
  const renderRecon = () => (
    <MBox id="reconModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-list-check text-success me-2" />Reconcile Accounts</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reconModal', 'Reconciliation completed. 3 accounts cleared.', 'REC-20250627-7720')}>Run Reconciliation</button>
        </>
      }
    >
      {renderActionBody('reconModal', <>
        <div className="mb-3"><label className={s.formLabel}>Accounts to Reconcile</label>
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">VA-001 — Operations</label></div>
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">VA-003 — Client Collections</label></div>
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">VA-007 — Payroll</label></div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Statement Period</label>
          <div className="row g-2">
            <div className="col-6"><input type="date" className={s.formControl} defaultValue="2025-06-01" /></div>
            <div className="col-6"><input type="date" className={s.formControl} defaultValue="2025-06-27" /></div>
          </div>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> Auto-match enabled. Unmatched items will be flagged for manual review.
        </div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M7: Match Modal
     ====================================================================== */
  const renderMatch = () => (
    <MBox id="matchModal" active={active} onClose={onClose}
      title={<><i className="bi bi-link-45deg text-primary me-2" />Match Transaction</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('matchModal', 'Transaction matched successfully.', 'MTC-20250627-1120')}>Match</button>
        </>
      }
    >
      {renderActionBody('matchModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
          <strong>Unmatched Credit: KES 1,200,000</strong>
          <div style={{ fontSize: 12, color: '#92400E' }}>VA-003 • 26 Jun</div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Match To</label>
          <select className={s.formControl}><option>Client payment — ABC Corp</option><option>Refund from supplier</option><option>Manual entry</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Notes</label><textarea className={s.formControl} rows={2} placeholder="Optional notes..." /></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M8: Auto-Sweep Modal
     ====================================================================== */
  const renderAutoSweep = () => (
    <MBox id="autoSweepModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat text-info me-2" />Auto-Sweep Configuration</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('autoSweepModal', 'Auto-sweep rules updated.', '')}>Save Rules</button>
        </>
      }
    >
      {renderActionBody('autoSweepModal', <>
        <div className="mb-3"><label className={s.formLabel}>Source Account</label>
          <select className={s.formControl}><option>VA-003 — Client Collections</option><option>VA-001 — Operations</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Destination</label>
          <select className={s.formControl}><option>Treasury Main Account</option><option>Reserve Account</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Trigger</label>
          <select className={s.formControl}><option>Balance exceeds KES 5M</option><option>Daily at 6:00 AM</option><option>Weekly (Monday)</option></select>
        </div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable auto-sweep</label></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M9: Export Report
     ====================================================================== */
  const renderExportReport = () => (
    <MBox id="exportReportModal" active={active} onClose={onClose}
      title={<><i className="bi bi-download text-primary me-2" />Export Report</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('exportReportModal', 'Report exported successfully!', '')}>Export</button>
        </>
      }
    >
      {renderActionBody('exportReportModal', <>
        <div className="mb-3"><label className={s.formLabel}>Report Type</label>
          <select className={s.formControl}><option>Daily Summary</option><option>Monthly Statement</option><option>Sub-Account Report</option><option>Audit Trail</option><option>Reconciliation Report</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Date Range</label>
          <div className="row g-2">
            <div className="col-6"><input type="date" className={s.formControl} defaultValue="2025-06-01" /></div>
            <div className="col-6"><input type="date" className={s.formControl} defaultValue="2025-06-27" /></div>
          </div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Format</label>
          <select className={s.formControl}><option>PDF</option><option>Excel (XLSX)</option><option>CSV</option></select>
        </div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M10: Sub Limit Modal
     ====================================================================== */
  const renderSubLimit = () => (
    <MBox id="subLimitModal" active={active} onClose={onClose}
      title={<><i className="bi bi-sliders text-info me-2" />Adjust Sub-Account Limit</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('subLimitModal', 'Limit updated successfully. New limit: KES 2,500,000.', 'LIM-20250627-4493')}>Update Limit</button>
        </>
      }
    >
      {renderActionBody('subLimitModal', <>
        <div className="mb-3"><label className={s.formLabel}>Sub-Account</label>
          <select className={s.formControl}><option>SUB-0144 — Project Gamma</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Current Monthly Limit</label><input className={s.formControl} defaultValue="2000000" /></div>
        <div className="mb-3"><label className={s.formLabel}>New Monthly Limit</label><input className={s.formControl} defaultValue="2500000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Reason</label><textarea className={s.formControl} rows={2} defaultValue="Increased project scope approved by client. Additional budget allocated." /></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M11: Velocity Controls
     ====================================================================== */
  const renderVelocity = () => (
    <MBox id="velocityModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-speedometer2 text-warning me-2" />Velocity & Transaction Controls</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('velocityModal', 'Velocity controls updated.', '')}>Save Controls</button>
        </>
      }
    >
      {renderActionBody('velocityModal', <>
        <div className="row g-3 mb-3">
          <div className="col-md-6"><label className={s.formLabel}>Max Transactions per Hour</label><input className={s.formControl} defaultValue="50" /></div>
          <div className="col-md-6"><label className={s.formLabel}>Max Transactions per Day</label><input className={s.formControl} defaultValue="300" /></div>
          <div className="col-md-6"><label className={s.formLabel}>Max Single Transaction</label><input className={s.formControl} defaultValue="5000000" /></div>
          <div className="col-md-6"><label className={s.formLabel}>Cool-down Period (minutes)</label><input className={s.formControl} defaultValue="5" /></div>
        </div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Block after velocity breach</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Alert on velocity breach</label></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M12: Approval Rules Modal
     ====================================================================== */
  const renderApprovalRules = () => (
    <MBox id="approvalRulesModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-shield-check text-accent me-2" /> Approval Rules Configuration</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('approvalRulesModal', 'Approval rules updated.', '')}>Save Rules</button>
        </>
      }
    >
      {renderActionBody('approvalRulesModal', <>
        <div className="table-responsive">
          <table className={s.tbl}>
            <thead><tr><th>Amount Range</th><th>Approver</th><th>Auto-approve</th></tr></thead>
            <tbody>
              <tr><td>Up to KES 100K</td><td>System</td><td><input type="checkbox" className="form-check-input" defaultChecked /></td></tr>
              <tr><td>KES 100K – 500K</td><td>Manager</td><td><input type="checkbox" className="form-check-input" /></td></tr>
              <tr><td>KES 500K – 2M</td><td>Director</td><td><input type="checkbox" className="form-check-input" /></td></tr>
              <tr><td>Above KES 2M</td><td>CFO + Board</td><td><input type="checkbox" className="form-check-input" /></td></tr>
            </tbody>
          </table>
        </div>
        <div className="form-check mt-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Require dual authorization for amounts above KES 500K</label></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M13: Bank Error Modal
     ====================================================================== */
  const renderBankError = () => (
    <MBox id="bankErrorModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Bank Error Ticket</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Close</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('bankErrorModal', 'Follow-up note added to ticket BNK-88291.', '')}>Add Note</button>
        </>
      }
    >
      {renderActionBody('bankErrorModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B' }}>Duplicate Debit Detected</div>
          <div style={{ fontSize: 12, color: '#7F1D1D' }}>KES 125,000 debited twice on 22 Jun from VA-001. Ticket #BNK-88291 raised with Equity Bank.</div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Ticket Status</label>
          <div><span className={cx(s.badge, s.badgeI)}>Under investigation • Expected resolution: 3 business days</span></div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Notes</label><textarea className={s.formControl} rows={2} defaultValue="Bank confirmed error. Reversal expected by 30 Jun. Temporary credit of KES 125,000 applied to VA-001." /></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M14: Attention Modal
     ====================================================================== */
  const renderAttention = () => (
    <MBox id="attentionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Items Requiring Attention</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={s.statusRow}>
        <div><strong>Unmatched credit KES 1.2M</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>VA-003 • 26 Jun</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('matchModal')}>Match</button>
      </div>
      <div className={s.statusRow}>
        <div><strong>Sub-account SUB-0144 over limit</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 450K over monthly budget</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('subLimitModal')}>Adjust</button>
      </div>
      <div className={s.statusRow}>
        <div><strong>Auto-sweep rule paused</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Collections VA • 3 days</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('autoSweepModal')}>Resume</button>
      </div>
      <div className={s.statusRow}>
        <div><strong>Bank error ticket open</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Duplicate debit KES 125K</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('bankErrorModal')}>Track</button>
      </div>
    </MBox>
  )

  /* ========================================================================
     M15: Consolidate Modal
     ====================================================================== */
  const renderConsolidate = () => (
    <MBox id="consolidateModal" active={active} onClose={onClose}
      title={<><i className="bi bi-compress-arrows text-primary me-2" />Consolidate Virtual Accounts</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('consolidateModal', '3 accounts consolidated successfully. KES 2.54M moved to Operations VA.', 'CON-20250627-9912')}>Consolidate Accounts</button>
        </>
      }
    >
      {renderActionBody('consolidateModal', <>
        <div className="mb-3"><label className={s.formLabel}>Select accounts to consolidate</label>
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /><label className="form-check-label">VA-012 — Old Project Reserve (KES 1.2M)</label></div>
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /><label className="form-check-label">VA-015 — Legacy Marketing (KES 890K)</label></div>
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /><label className="form-check-label">VA-018 — Inactive Campaign (KES 450K)</label></div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Destination Account</label>
          <select className={s.formControl}><option>VA-001 — Operations</option><option>VA-003 — Client Collections</option></select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> Estimated annual fee savings: <strong>KES 12,500</strong>
        </div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M16: Integration Modal
     ====================================================================== */
  const renderIntegration = () => (
    <MBox id="integrationModal" active={active} onClose={onClose}
      title={<><i className="bi bi-plug text-primary me-2" />VA Integration Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Close</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('integrationModal', 'Integration settings saved.', '')}>Save</button>
        </>
      }
    >
      {renderActionBody('integrationModal', <>
        <div className={s.statusRow}>
          <div><strong>ERP Sync (SAP)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Real-time balance sync</div></div>
          <span className={cx(s.badge, s.badgeS)}>Active</span>
        </div>
        <div className={s.statusRow}>
          <div><strong>Accounting (QuickBooks)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Daily transaction export</div></div>
          <span className={cx(s.badge, s.badgeS)}>Active</span>
        </div>
        <div className={s.statusRow}>
          <div><strong>Webhook Notifications</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Events endpoint</div></div>
          <span className={cx(s.badge, s.badgeW)}>Paused</span>
        </div>
        <div className={s.statusRow}>
          <div><strong>REST API</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Programmatic access</div></div>
          <span className={cx(s.badge, s.badgeS)}>Enabled</span>
        </div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M17: Security Modal
     ====================================================================== */
  const renderSecurity = () => (
    <MBox id="securityModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-lock text-danger me-2" />VA Security Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('securityModal', 'Security settings updated.', '')}>Apply</button>
        </>
      }
    >
      {renderActionBody('securityModal', <>
        <div className="mb-3"><label className={s.formLabel}>Action</label>
          <select className={s.formControl}><option>Change Treasury PIN</option><option>Enable 2FA for VA operations</option><option>Review authorized signatories</option><option>Download audit log</option></select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> All transfers above KES 5M require dual authorization.
        </div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M18: Notifications Modal
     ====================================================================== */
  const renderNotif = () => (
    <MBox id="notifModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Notifications (9)</>}
      footer={
        <>
          <button className={s.btnPm} onClick={() => onOpen('notifSettingsModal')}><i className="bi bi-gear" /> Settings</button>
          <button className={s.btnPm} onClick={onClose}>Close</button>
        </>
      }
    >
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
          <strong>Unmatched credit KES 1.2M</strong>
          <div style={{ fontSize: 11, color: '#7F1D1D' }}>VA-003 • Requires manual match</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <strong>Sub-account over limit</strong>
          <div style={{ fontSize: 11, color: '#92400E' }}>SUB-0144 • KES 450K over budget</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
          <strong>Auto-sweep rule paused</strong>
          <div style={{ fontSize: 11, color: '#1E40AF' }}>Collections VA • 3 days inactive</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>
          <strong>Bank error resolved</strong>
          <div style={{ fontSize: 11, color: '#065F46' }}>Duplicate debit KES 125K reversed</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: '#fff', border: '1px solid var(--pm-border)', fontSize: 13 }}>
          <strong>Monthly statement ready</strong>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>VA-003 • June 2025 statement</div>
        </div>
      </div>
    </MBox>
  )

  /* ========================================================================
     M19: Notification Settings
     ====================================================================== */
  const renderNotifSettings = () => (
    <MBox id="notifSettingsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-gear me-2" />Notification Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('notifSettingsModal', 'Notification preferences saved.', '')}>Save</button>
        </>
      }
    >
      {renderActionBody('notifSettingsModal', <>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Email: Limit breach alerts</label></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">SMS: Large unmatched amounts</label></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Push: Daily VA summary</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Email: Monthly reconciliation report</label></div>
      </>)}
    </MBox>
  )

  /* ========================================================================
     M20: Profile Modal
     ====================================================================== */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-circle me-2" />Profile</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center">
        <div className={cx(s.avatar, 'mx-auto mb-3')} style={{ width: 64, height: 64, fontSize: 24 }}>BK</div>
        <h5 style={{ fontWeight: 700, marginBottom: 2 }}>Business Owner</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>finance.director@company.co.ke</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Virtual Accounts</span><br /><strong>18 active</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Total Balance</span><br /><strong>KES 124.8M</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Health Score</span><br /><strong style={{ color: 'var(--pm-accent)' }}>94/100</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Active Rules</span><br /><strong>6</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  /* ========================================================================
     M21: Health Check Modal
     ====================================================================== */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-heart-pulse text-danger me-2" />Virtual Account Portfolio Health</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Close</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('attentionModal')}>Fix Issues</button>
        </>
      }
    >
      <div className="row g-3 mb-3">
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 28, fontWeight: 800, color: '#047857', fontFamily: 'var(--pm-font-display)' }}>94</div><div style={{ fontSize: 10, fontWeight: 700, color: '#047857' }}>HEALTH SCORE</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>18/18</div><div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>ACTIVE</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>4</div><div style={{ fontSize: 10, fontWeight: 700, color: '#B45309' }}>ISSUES</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-purple-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-purple)' }}>6</div><div style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9' }}>RULES</div></div></div>
      </div>
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Account</th><th>Score</th><th>Issues</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>VA-003</td><td><strong>98</strong></td><td>None</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td></tr>
            <tr><td>VA-007</td><td><strong>91</strong></td><td>1 limit breach</td><td><span className={cx(s.badge, s.badgeW)}>Warning</span></td></tr>
            <tr><td>SUB-0144</td><td><strong>72</strong></td><td>Over limit, no rule</td><td><span className={cx(s.badge, s.badgeD)}>Critical</span></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ========================================================================
     Render all modals
     ====================================================================== */
  return (
    <>
      {renderCreateVA()}
      {renderCreateSub()}
      {renderBulkFund()}
      {renderFundVA()}
      {renderTransfer()}
      {renderRecon()}
      {renderMatch()}
      {renderAutoSweep()}
      {renderExportReport()}
      {renderSubLimit()}
      {renderVelocity()}
      {renderApprovalRules()}
      {renderBankError()}
      {renderAttention()}
      {renderConsolidate()}
      {renderIntegration()}
      {renderSecurity()}
      {renderNotif()}
      {renderNotifSettings()}
      {renderProfile()}
      {renderHealthCheck()}
    </>
  )
}
