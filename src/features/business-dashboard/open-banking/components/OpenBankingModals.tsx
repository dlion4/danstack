import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/open-banking.module.css'

/* ============================================================================
   Open Banking & Account Aggregation — modal layer (legacy page 3.10)
   ========================================================================== */

interface ModalsProps { active: string | null; onClose: () => void; onOpen: (id: string) => void }
type Size = 'md' | 'lg' | 'xl'
interface MBoxProps { id: string; active: string | null; title: ReactNode; size?: Size; onClose: () => void; children: ReactNode; footer?: ReactNode }
interface Result { msg: string; ref?: string }

function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

function MBox({ id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
  const s = styles as Record<string, string>
  if (active !== id) return null
  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.modalWrap} role="dialog" aria-modal="true">
        <div className={`${s.modalBox} ${size === 'lg' ? s.modalBoxLg : ''} ${size === 'xl' ? s.modalBoxXl : ''}`}>
          <div className={s.modalHeader}><h5 className={s.modalTitle}>{title}</h5><button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div>
          <div className={s.modalBody}>{children}</div>
          {footer && <div className={s.modalFooter}>{footer}</div>}
        </div>
      </div>
    </>
  )
}

function BusyOverlay() { const s = styles as Record<string, string>; return (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing...</p></div>) }

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  connect: { labels: ['Bank', 'Details', 'Consent', 'Done'] },
  transfer: { labels: ['Details', 'Authorise', 'Done'] },
  recon: { labels: ['Select', 'Match', 'Done'] },
}

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
  const s = styles as Record<string, string>
  const def = FLOW_DEFS[flowKey]
  if (!def) return null
  return (
    <div className={s.stepper}>
      {def.labels.map((label, i) => {
        const stepNum = i + 1
        const done = stepNum < current
        const isActive = stepNum === current
        const lineStyle: React.CSSProperties = { position: 'absolute', top: 14, left: '-50%', width: '100%' }
        if (done) lineStyle.background = 'var(--pm-accent)'
        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
            {i > 0 && <div className={s.stepLine} style={lineStyle} />}
            <div className={`${s.step} ${done ? s.stepDone : ''} ${isActive ? s.stepActive : ''}`}>
              <div className={s.stepN}>{done ? <i className="bi bi-check" /> : stepNum}</div>
              <div className={s.stepL}>{label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OpenBankingModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ connect: 1, transfer: 1, recon: 1 })

  useEffect(() => { if (active === null) { setResults({}); setFlows({ connect: 1, transfer: 1, recon: 1 }); setBusy(null) } }, [active])
  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId); busyTimer.current = window.setTimeout(() => { setResults(prev => ({ ...prev, [modalId]: { msg, ref } })); setBusy(null) }, 1500)
  }

  const nextFlow = (key: string, total: number) => { const cur = flows[key] ?? 1; if (cur >= total) { onClose(); return }; setFlows(prev => ({ ...prev, [key]: cur + 1 })) }

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
    if (busy === modalId) return <BusyOverlay />; if (results[modalId]) return renderReceipt(results[modalId]); return defaultContent
  }

  /* M1: Connect Bank (Multistep 4 steps) */
  const renderConnectBank = () => {
    const step = flows.connect
    return (
      <MBox id="connectBankModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-plus-lg text-primary me-2" />Connect Bank Account</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('connect', 4)}>{step >= 4 ? 'Done' : 'Continue'}</button></>}>
        <Stepper flowKey="connect" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Select Bank</h6>
            <div className="row g-2">
              {['Equity Bank', 'KCB Bank', 'Co-op Bank', 'Stanbic Bank', 'NCBA Bank', 'Family Bank', 'I&M Bank'].map(b => (
                <div key={b} className="col-md-4 col-6"><button className={cx(s.btnPm, 'w-100')} style={{ padding: 12 }}>{b}</button></div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Account Details</h6>
            <div className="mb-3"><label className={s.formLabel}>Account Number</label><input className={s.formControl} placeholder="Enter account number" /></div>
            <div className="mb-3"><label className={s.formLabel}>Account Name</label><input className={s.formControl} placeholder="As per bank records" /></div>
            <div className="mb-3"><label className={s.formLabel}>Account Type</label><select className={s.formControl}><option>Business Current</option><option>Savings</option><option>Call Deposit</option></select></div>
          </div>
        )}
        {step === 3 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Consent & Permissions</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)' }}>
              <strong>Open Banking Consent</strong><br />
              <span style={{ fontSize: 12 }}>You are granting PayMo read access to your account balance and transactions. No write access is granted.</span>
            </div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Share account balance</label></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Share transaction history</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Enable payment initiation (write access)</label></div>
          </div>
        )}
        {step === 4 && renderActionBody('connectBankModal', (
          <div className={s.fstepActive}><button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('connectBankModal', 'Bank connected successfully!', 'OBC-20250627-4493')}>Complete Connection <i className="bi bi-check-lg" /></button></div>
        ))}
      </MBox>
    )
  }

  /* M2: Transfer (Multistep 3 steps) */
  const renderTransfer = () => {
    const step = flows.transfer
    return (
      <MBox id="transferModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-arrow-left-right text-primary me-2" />Instant Bank Transfer</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('transfer', 3)}>{step >= 3 ? 'Done' : 'Continue'}</button></>}>
        <Stepper flowKey="transfer" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>From Account</label><select className={s.formControl}><option>Equity ****4521 (KES 4.25M)</option><option>Co-op ****3390 (KES 8.9M)</option></select></div>
            <div className="mb-3"><label className={s.formLabel}>To Bank</label><select className={s.formControl}><option>KCB Bank ****7782</option><option>NCBA ****1128</option></select></div>
            <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="500000" /></div>
            <div className="mb-3"><label className={s.formLabel}>Reference</label><input className={s.formControl} placeholder="Payment reference" /></div>
          </div>
        )}
        {step === 2 && renderActionBody('transferModal', (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Authorise Transfer</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">From</span><strong>Equity ****4521</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">To</span><strong>KCB ****7782</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Amount</span><strong>KES 500,000</strong></div>
            </div>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('transferModal', 'Transfer completed successfully! KES 500,000 sent.', 'PL-442201')}>Confirm & Send <i className="bi bi-check-lg" /></button>
          </div>
        ))}
        {step === 3 && renderActionBody('transferModal', (<div className={s.fstepActive}><div className="text-center p-3" style={{ background: 'var(--pm-accent-soft)', borderRadius: 12 }}><strong>Transfer Complete!</strong></div></div>))}
      </MBox>
    )
  }

  /* M3: Reconcile (Multistep 3 steps) */
  const renderReconcile = () => {
    const step = flows.recon
    return (
      <MBox id="reconcileModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-list-check text-success me-2" />Multi-Bank Reconciliation</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('recon', 3)}>{step >= 3 ? 'Done' : 'Continue'}</button></>}>
        <Stepper flowKey="recon" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Banks to Reconcile</label>
              <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Equity Bank ****4521</label></div>
              <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">KCB Bank ****7782</label></div>
              <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Co-op Bank ****3390</label></div>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Statement Period</label>
              <div className="row g-2"><div className="col-6"><input type="date" className={s.formControl} defaultValue="2025-06-01" /></div><div className="col-6"><input type="date" className={s.formControl} defaultValue="2025-06-27" /></div></div>
            </div>
          </div>
        )}
        {step === 2 && renderActionBody('reconcileModal', (
          <div className={s.fstepActive}>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)' }}>
              <strong>412 transactions auto-matched</strong><br /><span style={{ fontSize: 12 }}>14 require manual review</span>
            </div>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('reconcileModal', 'Reconciliation complete. 412 matched, 14 flagged.', 'REC-20250627-8821')}>Finalize Reconciliation <i className="bi bi-check-lg" /></button>
          </div>
        ))}
        {step === 3 && renderActionBody('reconcileModal', (<div className={s.fstepActive}><div className="text-center p-3" style={{ background: 'var(--pm-accent-soft)', borderRadius: 12 }}><strong>Reconciliation Complete!</strong></div></div>))}
      </MBox>
    )
  }

  /* M4: Schedule Transfer */
  const renderScheduleTransfer = () => (
    <MBox id="scheduleTransferModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-clock text-info me-2" />Schedule Transfer</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('scheduleTransferModal', 'Transfer scheduled successfully!', 'SCH-20250627-1120')}>Schedule</button></>}>
      {renderActionBody('scheduleTransferModal', <>
        <div className="mb-3"><label className={s.formLabel}>From</label><select className={s.formControl}><option>Equity ****4521</option><option>Co-op ****3390</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>To</label><select className={s.formControl}><option>KCB ****7782</option><option>NCBA ****1128</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="2400000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Frequency</label><select className={s.formControl}><option>One-time</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Start Date</label><input type="date" className={s.formControl} defaultValue="2025-06-25" /></div>
      </>)}
    </MBox>
  )

  /* M5: Account Detail */
  const renderAccountDetail = () => (
    <MBox id="accountDetailModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-bank text-primary me-2" />Account Details</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="row g-3 mb-3">
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Bank</span><br /><strong>Equity Bank</strong></div></div>
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Account</span><br /><strong>****4521</strong></div></div>
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><span style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>BALANCE</span><br /><strong style={{ fontSize: 20, color: '#047857' }}>KES 4,250,000</strong></div></div>
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><span style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 700 }}>STATUS</span><br /><strong style={{ color: '#1D4ED8' }}>Active • Live</strong></div></div>
      </div>
      <h6 style={{ fontWeight: 700 }}>Recent Transactions</h6>
      <div className="table-responsive">
        <table className={s.tbl}><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody><tr><td>27 Jun</td><td>Client payment — ABC Ltd</td><td><strong>+KES 1,850,000</strong></td></tr><tr><td>26 Jun</td><td>Supplier payment — XYZ Corp</td><td><strong>-KES 425,000</strong></td></tr><tr><td>25 Jun</td><td>Transfer from KCB</td><td><strong>+KES 500,000</strong></td></tr></tbody>
        </table>
      </div>
    </MBox>
  )

  /* M6: Manage Links */
  const renderManageLinks = () => (
    <MBox id="manageLinksModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-gear me-2" />Manage Bank Links</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="table-responsive">
        <table className={s.tbl}><thead><tr><th>Bank</th><th>Account</th><th>Consent</th><th>Sync</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>Equity Bank</td><td>****4521</td><td>Valid</td><td>Live</td><td><div className="d-flex" style={{ gap: 4 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('reauthModal')}>Re-auth</button><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('manageLinksModal', 'Bank link paused successfully.', '')}>Pause</button></div></td></tr>
            <tr><td>KCB Bank</td><td>****7782</td><td>Valid</td><td>Live</td><td><div className="d-flex" style={{ gap: 4 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('reauthModal')}>Re-auth</button><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('manageLinksModal', 'Bank link paused successfully.', '')}>Pause</button></div></td></tr>
            <tr><td>Family Bank</td><td>****5543</td><td>Expired</td><td>Paused</td><td><div className="d-flex" style={{ gap: 4 }}><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => onOpen('reauthModal')}>Re-auth</button><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('manageLinksModal', 'Bank link removed successfully.', '')}>Remove</button></div></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* M7: Reauth Modal */
  const renderReauth = () => (
    <MBox id="reauthModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-lock text-warning me-2" />Re-authenticate Bank</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reauthModal', 'Bank re-authenticated successfully!', '')}>Re-authenticate</button></>}>
      {renderActionBody('reauthModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <strong>Consent renewal required</strong><br />Your open banking consent has expired or is about to expire.
        </div>
        <div className="mb-3"><label className={s.formLabel}>Bank</label><select className={s.formControl}><option>Family Bank ****5543</option><option>Co-op Bank ****3390</option></select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Extend consent for 90 days</label></div>
      </>)}
    </MBox>
  )

  /* M8: Export Statement */
  const renderExportStatement = () => (
    <MBox id="exportStatementModal" active={active} onClose={onClose} title={<><i className="bi bi-download me-2" />Export Multi-Bank Statement</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('exportStatementModal', 'Multi-bank statement exported successfully.', '')}>Export</button></>}>
      {renderActionBody('exportStatementModal', <>
        <div className="mb-3"><label className={s.formLabel}>Banks</label><select className={s.formControl} multiple><option selected>Equity Bank</option><option selected>KCB Bank</option><option>Co-op Bank</option><option>Stanbic Bank</option></select></div>
        <div className="row g-3 mb-3"><div className="col-6"><label className={s.formLabel}>From</label><input type="date" className={s.formControl} defaultValue="2025-06-01" /></div><div className="col-6"><label className={s.formLabel}>To</label><input type="date" className={s.formControl} defaultValue="2025-06-27" /></div></div>
        <div className="mb-3"><label className={s.formLabel}>Format</label><select className={s.formControl}><option>PDF (Consolidated)</option><option>Excel (Multi-sheet)</option><option>CSV (Combined)</option><option>MT940 (Bank format)</option></select></div>
      </>)}
    </MBox>
  )

  /* M9: OB Settings */
  const renderOBSettings = () => (
    <MBox id="obSettingsModal" active={active} onClose={onClose} title={<><i className="bi bi-gear me-2" />Open Banking Preferences</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('obSettingsModal', 'Settings saved successfully.', '')}>Save</button></>}>
      {renderActionBody('obSettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Default Transfer Bank</label><select className={s.formControl}><option>Equity Bank ****4521</option><option>Co-op Bank ****3390</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Reconciliation Auto-Run</label><select className={s.formControl}><option>Daily at 6:00 AM</option><option>Twice daily</option><option>Manual only</option></select></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Email daily reconciliation summary</label></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">SMS for large unmatched amounts</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Auto-create exceptions for unmatched</label></div>
      </>)}
    </MBox>
  )

  /* M10: Bank Benchmark */
  const renderBankBenchmark = () => (
    <MBox id="bankBenchmarkModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-bar-chart me-2" style={{ color: 'var(--pm-purple)' }} />Bank Performance Benchmark</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="table-responsive">
        <table className={s.tbl}><thead><tr><th>Bank</th><th>Settlement</th><th>Fee</th><th>Uptime</th><th>Sync Speed</th><th>Score</th></tr></thead>
          <tbody>
            <tr><td>Equity Bank</td><td>8s</td><td>KES 0</td><td>99.9%</td><td>Real-time</td><td><strong>98</strong></td></tr>
            <tr><td>KCB Bank</td><td>12s</td><td>KES 0</td><td>99.8%</td><td>Real-time</td><td><strong>96</strong></td></tr>
            <tr><td>Co-op Bank</td><td>15s</td><td>KES 0</td><td>99.7%</td><td>Real-time</td><td><strong>94</strong></td></tr>
            <tr><td>Stanbic Bank</td><td>22s</td><td>KES 25</td><td>99.5%</td><td>15 min</td><td><strong>82</strong></td></tr>
            <tr><td>Family Bank</td><td>18s</td><td>KES 0</td><td>98.2%</td><td>3 hr</td><td><strong>71</strong></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* M11: Attention */
  const renderAttention = () => (
    <MBox id="attentionModal" active={active} onClose={onClose} title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Attention Items</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className={s.statusRow}><div><strong>KCB balance below minimum</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 42,100</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('transferModal')}>Top-up</button></div>
      <div className={s.statusRow}><div><strong>14 unreconciled transactions</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Equity & Stanbic</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('reconcileModal')}>Reconcile</button></div>
      <div className={s.statusRow}><div><strong>Co-op consent expires</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>7 days remaining</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('reauthModal')}>Renew</button></div>
      <div className={s.statusRow}><div><strong>Family Bank link expired</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Reconnect needed</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('connectBankModal')}>Reconnect</button></div>
    </MBox>
  )

  /* M12: Optimize */
  const renderOptimize = () => (
    <MBox id="optimizeModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-lightbulb text-warning me-2" />Account Optimisation</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('optimizeModal', 'Optimisation plan saved.', '')}>Adopt Plan</button></>}>
      {renderActionBody('optimizeModal', <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Analysis shows 3 low-activity accounts can be closed with minimal operational impact, saving KES 18,200 annually in fees.</p>)}
    </MBox>
  )

  /* M13: Match Detail */
  const renderMatchDetail = () => (
    <MBox id="matchDetailModal" active={active} onClose={onClose} title={<><i className="bi bi-link-45deg me-2" />Transaction Match Details</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Bank Transaction</span><strong>Equity • 27 Jun • KES 1,850,000</strong></div>
        <div className="d-flex justify-content-between"><span className="text-muted">Matched To</span><strong>Invoice INV-4421 • ABC Ltd</strong></div>
      </div>
      <div className="row g-3">
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>MATCH CONFIDENCE</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-accent)' }}>98%</div></div></div>
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 700 }}>MATCH METHOD</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-info)' }}>Amount + Reference</div></div></div>
      </div>
    </MBox>
  )

  /* M14: Health Check */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-heart-pulse text-danger me-2" />Open Banking Health</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('attentionModal')}>Fix Issues</button></>}>
      <div className="row g-3 mb-3">
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 28, fontWeight: 800, color: '#047857', fontFamily: 'var(--pm-font-display)' }}>96</div><div style={{ fontSize: 10, fontWeight: 700, color: '#047857' }}>HEALTH SCORE</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>7</div><div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>LINKED BANKS</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>14</div><div style={{ fontSize: 10, fontWeight: 700, color: '#B45309' }}>EXCEPTIONS</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-purple-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-purple)' }}>186</div><div style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9' }}>TRANSFERS MTD</div></div></div>
      </div>
      <div className="table-responsive">
        <table className={s.tbl}><thead><tr><th>Bank</th><th>Consent</th><th>Sync</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Equity Bank</td><td>Valid (83d)</td><td>Live</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td></tr>
            <tr><td>KCB Bank</td><td>Valid (45d)</td><td>Live</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td></tr>
            <tr><td>Co-op Bank</td><td>Expiring (7d)</td><td>Live</td><td><span className={cx(s.badge, s.badgeW)}>Watch</span></td></tr>
            <tr><td>Family Bank</td><td>Expired</td><td>Paused</td><td><span className={cx(s.badge, s.badgeD)}>Disconnected</span></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* M15: Notifications */
  const renderNotif = () => (
    <MBox id="notifModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Notifications (9)</>}
      footer={<><button className={s.btnPm} onClick={() => onOpen('obSettingsModal')}><i className="bi bi-gear" /> Settings</button><button className={s.btnPm} onClick={onClose}>Close</button></>}>
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>KCB balance below minimum</strong><div style={{ fontSize: 11, color: '#7F1D1D' }}>KES 42,100 (min KES 50,000)</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Co-op consent expires in 7 days</strong><div style={{ fontSize: 11, color: '#92400E' }}>Re-authenticate before 04 Jul</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>14 transactions unmatched</strong><div style={{ fontSize: 11, color: '#1E40AF' }}>Requires reconciliation review</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>Transfer PL-442189 completed</strong><div style={{ fontSize: 11, color: '#065F46' }}>KES 850,000 to KCB ****7782</div></div>
        <div className="p-3 rounded mb-2" style={{ background: '#fff', border: '1px solid var(--pm-border)', fontSize: 13 }}><strong>Family Bank link expired</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Reconnect to resume sync</div></div>
      </div>
    </MBox>
  )

  /* M16: Profile */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose} title={<><i className="bi bi-person-circle me-2" />Profile</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="text-center">
        <div className={cx(s.avatar, 'mx-auto mb-3')} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
        <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.k@email.com · +254 712 345 890</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Linked Banks</span><br /><strong>7 accounts</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Health Score</span><br /><strong style={{ color: 'var(--pm-accent)' }}>96/100</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Transfers (MTD)</span><br /><strong>186</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Open Exceptions</span><br /><strong>14</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  return (
    <>
      {renderConnectBank()}
      {renderTransfer()}
      {renderReconcile()}
      {renderScheduleTransfer()}
      {renderAccountDetail()}
      {renderManageLinks()}
      {renderReauth()}
      {renderExportStatement()}
      {renderOBSettings()}
      {renderBankBenchmark()}
      {renderAttention()}
      {renderOptimize()}
      {renderMatchDetail()}
      {renderHealthCheck()}
      {renderNotif()}
      {renderProfile()}
    </>
  )
}
