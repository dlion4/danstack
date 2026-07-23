import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/treasury-cash.module.css'

/* ============================================================================
   Treasury, Cash Management & Forex — modal layer (legacy page 3.7, ~24 modals)
   5 multistep wizards: Add Account, Transfer Funds, Book FX, Cross Border, Invest Cash
   ========================================================================== */

interface ModalsProps { active: string | null; onClose: () => void; onOpen: (id: string) => void }
interface MBoxProps { id: string; active: string | null; title: ReactNode; size?: 'md' | 'lg' | 'xl'; onClose: () => void; children: ReactNode; footer?: ReactNode }

function downloadFile(n: string, c: string, t = 'text/plain') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([c], { type: t })); a.download = n; a.click(); URL.revokeObjectURL(a.href) }

function MBox({ id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
  const s = styles as Record<string, string>
  if (active !== id) return null
  return (<><div className={s.backdrop} onClick={onClose} /><div className={s.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
    <div className={`${s.modalBox} ${size === 'lg' ? s.modalBoxLg : ''} ${size === 'xl' ? s.modalBoxXl : ''}`}>
      <div className={s.modalHeader}><h5 className={s.modalTitle}>{title}</h5><button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div>
      <div className={s.modalBody}>{children}</div>{footer && <div className={s.modalFooter}>{footer}</div>}
    </div></div></>)
}

function BusyOverlay() { const s = styles as Record<string, string>; return (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing...</p></div>) }

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  addBank: { labels: ['Select', 'Auth', 'Done'] },
  transfer: { labels: ['Details', 'Auth', 'Done'] },
  fx: { labels: ['Quote', 'Review', 'Done'] },
  cb: { labels: ['Details', 'Review', 'Done'] },
  invest: { labels: ['Config', 'Review', 'Done'] },
}

interface Result { msg: string; ref?: string }
function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
  const s = styles as Record<string, string>; const def = FLOW_DEFS[flowKey]; if (!def) return null
  return (<div className={s.stepper}>{def.labels.map((label, i) => { const stepNum = i + 1; const done = stepNum < current; const active = stepNum === current
    return (<div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
      {i > 0 && <div className={s.stepLine} style={{ position: 'absolute', top: 14, left: '-50%', width: '100%', ...(done ? { background: 'var(--pm-accent)' } : {}) }} />}
      <div className={`${s.step} ${done ? s.stepDone : ''} ${active ? s.stepActive : ''}`}><div className={s.stepN}>{done ? <i className="bi bi-check" /> : stepNum}</div><div className={s.stepL}>{label}</div></div>
    </div>) })}</div>)
}

export default function TreasuryCashModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ addBank: 1, transfer: 1, fx: 1, cb: 1, invest: 1 })

  useEffect(() => { if (active === null) { setResults({}); setFlows({ addBank: 1, transfer: 1, fx: 1, cb: 1, invest: 1 }); setBusy(null) } }, [active])
  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => { setBusy(modalId); busyTimer.current = window.setTimeout(() => { setResults((prev) => ({ ...prev, [modalId]: { msg, ref } })); setBusy(null) }, 1500) }
  const nextFlow = (key: string, total: number) => { const cur = flows[key] ?? 1; if (cur >= total) { onClose(); return } setFlows((prev) => ({ ...prev, [key]: cur + 1 })) }

  const renderReceipt = (r: Result) => (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>{r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => downloadFile('receipt.txt', r.msg)}><i className="bi bi-download" /> Save</button><button className={cx(s.btnPm, s.btnSm)} onClick={onClose}>Done</button></div></div>)
  const renderActionBody = (modalId: string, defaultContent: ReactNode) => { if (busy === modalId) return <BusyOverlay />; if (results[modalId]) return renderReceipt(results[modalId]); return defaultContent }

  /* ---------- M1: Transfer Funds (3-step) ---------- */
  const transferStep = flows.transfer ?? 1
  const renderTransferFunds = () => (
    <MBox id="transferFundsModal" active={active} onClose={onClose} title={<><i className="bi bi-arrow-left-right text-primary me-2" />Transfer Funds</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{transferStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('transfer', 3)}>{transferStep === 2 ? 'Execute' : 'Next'} <i className={`bi ${transferStep === 2 ? 'bi-lock' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="transfer" current={transferStep} />
      {transferStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>From Account</label><select className={s.formControl}><option>Equity Bank — Main Operations (KES 4.2M)</option><option>KCB — Business Savings (KES 2.8M)</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>To Account</label><select className={s.formControl}><option>KCB — Business Savings</option><option>NCBA — Payroll Disbursement</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="500000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Purpose</label><select className={s.formControl}><option>Savings sweep</option><option>Payroll funding</option><option>FX settlement</option><option>Vendor payment</option></select></div>
      </div>}
      {transferStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><i className="bi bi-shield-lock" /> <strong>Maker-Checker required</strong> · Enter authorization PIN</div>
        <div className={s.pinRow}>{[0,1,2,3,4,5].map(i => <input key={i} type="password" maxLength={1} className={s.formControl} style={{ width: 48, textAlign: 'center' }} />)}</div>
      </div>}
      {transferStep === 3 && renderActionBody('transferFundsModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Transfer executed!</h5><p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: TRF-2025-0042</p></div>)}
    </MBox>
  )

  /* ---------- M2: Add Account (3-step) ---------- */
  const addBankStep = flows.addBank ?? 1
  const renderAddAccount = () => (
    <MBox id="addAccountModal" active={active} onClose={onClose} title={<><i className="bi bi-plus-circle text-accent me-2" />Add Bank Account</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{addBankStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('addBank', 3)}>{addBankStep === 2 ? 'Connect' : 'Next'} <i className="bi bi-arrow-right" /></button>}</>}
    >
      <Stepper flowKey="addBank" current={addBankStep} />
      {addBankStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Bank</label><select className={s.formControl}><option>Equity Bank</option><option>KCB</option><option>Co-op Bank</option><option>NCBA</option><option>DTB</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Account Type</label><select className={s.formControl}><option>Operating</option><option>Savings</option><option>Payroll</option><option>FX Reserve</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Account Name</label><input type="text" className={s.formControl} defaultValue="New Treasury Account" /></div>
      </div>}
      {addBankStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><i className="bi bi-link" /> <strong>Bank API connection</strong> · We'll verify account ownership via bank API</div>
        <div className="mb-3"><label className={s.formLabel}>Account Number</label><input type="text" className={s.formControl} defaultValue="0123456789" /></div>
        <div className="mb-3"><label className={s.formLabel}>Swift/Branch Code</label><input type="text" className={s.formControl} defaultValue="EQBLKENA" /></div>
      </div>}
      {addBankStep === 3 && renderActionBody('addAccountModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Account connected!</h5><p style={{ fontSize: 12 }}>Bank API verification successful</p></div>)}
    </MBox>
  )

  /* ---------- M3: Book FX (3-step) ---------- */
  const fxStep = flows.fx ?? 1
  const renderBookFX = () => (
    <MBox id="bookFXModal" active={active} onClose={onClose} title={<><i className="bi bi-currency-exchange text-warning me-2" />Book FX Trade</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{fxStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('fx', 3)}>{fxStep === 2 ? 'Execute' : 'Next'} <i className={`bi ${fxStep === 2 ? 'bi-lock' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="fx" current={fxStep} />
      {fxStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Currency Pair</label><select className={s.formControl}><option>USD/KES — 129.10</option><option>EUR/KES — 140.25</option><option>GBP/KES — 162.80</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Direction</label><select className={s.formControl}><option>Buy USD (Sell KES)</option><option>Sell USD (Buy KES)</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Amount</label><input type="text" className={s.formControl} defaultValue="USD 10,000" /></div>
      </div>}
      {fxStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>Trade</span><strong>Buy USD 10,000 @ 129.10</strong></div>
          <div className="d-flex justify-content-between"><span>KES Cost</span><strong>KES 1,291,000</strong></div>
          <div className="d-flex justify-content-between"><span>Source Account</span><strong>Co-op Bank FX Reserve</strong></div>
        </div>
      </div>}
      {fxStep === 3 && renderActionBody('bookFXModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>FX trade executed!</h5><p style={{ fontSize: 12 }}>Ref: FX-2025-0010 · USD 10,000 @ 129.10</p></div>)}
    </MBox>
  )

  /* ---------- M4: Cross Border (3-step) ---------- */
  const cbStep = flows.cb ?? 1
  const renderCrossBorder = () => (
    <MBox id="crossBorderModal" active={active} onClose={onClose} title={<><i className="bi bi-globe2 text-info me-2" />Cross-Border Payment</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{cbStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('cb', 3)}>{cbStep === 2 ? 'Execute' : 'Next'} <i className={`bi ${cbStep === 2 ? 'bi-lock' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="cb" current={cbStep} />
      {cbStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Destination Country</label><select className={s.formControl}><option>United States</option><option>United Kingdom</option><option>Germany</option><option>India</option><option>China</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Beneficiary Name</label><input type="text" className={s.formControl} defaultValue="Global Vendor Inc." /></div>
        <div className="mb-3"><label className={s.formLabel}>Amount</label><input type="text" className={s.formControl} defaultValue="USD 5,000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Purpose</label><select className={s.formControl}><option>Vendor Payment</option><option>Service Invoice</option><option>Salary Remittance</option></select></div>
      </div>}
      {cbStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>FX Rate</span><strong>USD/KES 129.10</strong></div>
          <div className="d-flex justify-content-between"><span>KES Amount</span><strong>KES 645,500</strong></div>
          <div className="d-flex justify-content-between"><span>Fee</span><strong>KES 2,500</strong></div>
          <div className="d-flex justify-content-between"><span>Total Debit</span><strong>KES 648,000</strong></div>
        </div>
      </div>}
      {cbStep === 3 && renderActionBody('crossBorderModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Cross-border payment sent!</h5><p style={{ fontSize: 12 }}>Ref: CB-2025-005</p></div>)}
    </MBox>
  )

  /* ---------- M5: Invest Cash (3-step) ---------- */
  const investStep = flows.invest ?? 1
  const renderInvestCash = () => (
    <MBox id="investCashModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-up-arrow text-purple me-2" />Invest Cash</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{investStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('invest', 3)}>{investStep === 2 ? 'Invest' : 'Next'} <i className="bi bi-arrow-right" /></button>}</>}
    >
      <Stepper flowKey="invest" current={investStep} />
      {investStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="mb-3"><label className={s.formLabel}>Investment Type</label><select className={s.formControl}><option>MMF (CIC Money Market)</option><option>T-Bill 91-day</option><option>T-Bill 182-day</option><option>Fixed Deposit 30-day</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="1000000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Source Account</label><select className={s.formControl}><option>Equity Bank — Main Operations</option><option>KCB — Business Savings</option></select></div>
      </div>}
      {investStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between"><span>Type</span><strong>MMF (CIC)</strong></div>
          <div className="d-flex justify-content-between"><span>Amount</span><strong>KES 1,000,000</strong></div>
          <div className="d-flex justify-content-between"><span>Expected Yield</span><strong style={{ color: 'var(--pm-accent)' }}>~11% p.a.</strong></div>
          <div className="d-flex justify-content-between"><span>Maturity</span><strong>Open (withdraw anytime)</strong></div>
        </div>
      </div>}
      {investStep === 3 && renderActionBody('investCashModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Investment placed!</h5><p style={{ fontSize: 12 }}>Ref: INV-MMF-2025-005</p></div>)}
    </MBox>
  )

  /* ---------- M6-M12: simple modals ---------- */
  const renderSweepSetup = () => (
    <MBox id="sweepSetupModal" active={active} onClose={onClose} title={<><i className="bi bi-arrow-repeat me-2" />Sweep Setup</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('sweepSetupModal', 'Sweep configured!')}>Save</button></>}
    >
      {renderActionBody('sweepSetupModal', <>
        <div className="mb-3"><label className={s.formLabel}>Source Account</label><select className={s.formControl}><option>Equity Bank — Main Operations</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Target Account</label><select className={s.formControl}><option>KCB — Business Savings</option><option>MMF (CIC)</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Threshold (KES)</label><input type="number" className={s.formControl} defaultValue="2000000" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Daily sweep at 6 PM</label></div>
      </>)}
    </MBox>
  )

  const renderAutoSweep = () => (
    <MBox id="autoSweepModal" active={active} onClose={onClose} title={<><i className="bi bi-clock-history me-2" />Auto-Sweep Configuration</>} size="lg">
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Status</span><span className={cx(s.badge, s.badgeS)}>Active</span></div>
        <div className="d-flex justify-content-between"><span>Frequency</span><strong>Daily 6 PM</strong></div>
        <div className="d-flex justify-content-between"><span>Last Sweep</span><strong>22 Jun 2025 · KES 500K → KCB</strong></div>
        <div className="d-flex justify-content-between"><span>Threshold</span><strong>KES 2.0M</strong></div>
      </div>
    </MBox>
  )

  const renderReconciliation = () => (
    <MBox id="reconciliationModal" active={active} onClose={onClose} title={<><i className="bi bi-arrow-left-right me-2" />Bank Reconciliation</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reconciliationModal', 'Reconciliation started!')}>Start</button></>}
    >
      {renderActionBody('reconciliationModal', <>
        <div className="mb-3"><label className={s.formLabel}>Account</label><select className={s.formControl}><option>Equity Bank — Main Operations</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Period</label><select className={s.formControl}><option>June 2025</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>1 unreconciled statement · 3 unmatched transactions</div>
      </>)}
    </MBox>
  )

  const renderApprovalQueue = () => (
    <MBox id="approvalQueueModal" active={active} onClose={onClose} title={<><i className="bi bi-check2-square text-primary me-2" />Approval Queue</>} size="lg">
      <div className={s.statusRow}><div><strong>3 Sweeps require approval</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 4.2M target balancing transfers</div></div><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => doAction('approvalQueueModal', 'All sweeps approved!')}>Review</button></div>
      <div className={s.statusRow}><div><strong>USD/KES dropped to 129.10</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Hit target alert for vendor payment</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('bookFXModal')}>Trade</button></div>
      <div className={s.statusRow}><div><strong>T-Bill maturity tomorrow</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 5.0M principal + interest</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('investmentPortfolioModal')}>Action</button></div>
    </MBox>
  )

  const renderInvestmentPortfolio = () => (
    <MBox id="investmentPortfolioModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-up-arrow me-2" />Investment Portfolio</>} size="lg">
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Total Portfolio</span><strong>KES 10.2M</strong></div>
        <div className="d-flex justify-content-between"><span>MMF</span><strong>KES 3.2M (11%)</strong></div>
        <div className="d-flex justify-content-between"><span>T-Bills</span><strong>KES 5.0M (12.5%)</strong></div>
        <div className="d-flex justify-content-between"><span>Fixed Deposit</span><strong>KES 2.0M (9%)</strong></div>
      </div>
      <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('investCashModal')}><i className="bi bi-plus" /> New Investment</button>
    </MBox>
  )

  const renderAccountDetail = () => (
    <MBox id="accountDetailModal" active={active} onClose={onClose} title={<><i className="bi bi-bank me-2" />Account Detail</>} size="lg">
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between"><span>Bank</span><strong>Equity Bank</strong></div>
        <div className="d-flex justify-content-between"><span>Account</span><strong>Main Operations</strong></div>
        <div className="d-flex justify-content-between"><span>Balance</span><strong>KES 4.2M</strong></div>
        <div className="d-flex justify-content-between"><span>Status</span><span className={cx(s.badge, s.badgeS)}>Healthy</span></div>
      </div>
    </MBox>
  )

  const renderTreasurySettings = () => (
    <MBox id="treasurySettingsModal" active={active} onClose={onClose} title={<><i className="bi bi-gear me-2" />Treasury Settings</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('treasurySettingsModal', 'Settings saved.')}>Save</button></>}
    >
      {renderActionBody('treasurySettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Global Daily Transfer Limit (KES)</label><input type="number" className={s.formControl} defaultValue="50000000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Approval Policy</label><select className={s.formControl}><option>Maker-Checker required for all</option><option>Required only {'>'} 1,000,000</option><option>Single approver</option></select></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-reconciliation daily at 6 AM</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable overnight MMF sweeps</label></div>
      </>)}
    </MBox>
  )

  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Notifications</>}
      footer={<><button className={cx(s.btnPm, s.btnSm)}>Mark all read</button><button className={s.btnPm} onClick={onClose}>Close</button></>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Approval Required</strong><div style={{ fontSize: 11 }}>Sweep of KES 1.4M pending your approval</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>FX Alert Hit</strong><div style={{ fontSize: 11 }}>USD/KES fell below 129.50</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>Sweep Successful</strong><div style={{ fontSize: 11 }}>End of day sweep completed to Equity Bank</div></div>
    </MBox>
  )

  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose} title={<><i className="bi bi-person-circle me-2" />Profile Summary</>}
    >
      <div className="text-center">
        <div className={s.avatar} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-gradient-slate)', margin: '0 auto 12px' }}>EA</div>
        <h5 style={{ fontWeight: 700 }}>Esther A.</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>esther.a@corporate.com · CFO / Treasury</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Auth Limit</span><br /><strong>Unlimited</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Accounts</span><br /><strong>6 managed</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  return (<>
    {renderTransferFunds()}{renderAddAccount()}{renderBookFX()}{renderCrossBorder()}{renderInvestCash()}
    {renderSweepSetup()}{renderAutoSweep()}{renderReconciliation()}{renderApprovalQueue()}
    {renderInvestmentPortfolio()}{renderAccountDetail()}{renderTreasurySettings()}
    {renderNotifications()}{renderProfile()}
  </>)
}
