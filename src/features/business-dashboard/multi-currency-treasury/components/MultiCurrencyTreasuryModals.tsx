import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/multi-currency-treasury.module.css'

/* ============================================================================
   Multi-Currency Treasury & Forex — modal layer (legacy page 3.11)
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
  trade: { labels: ['Pair', 'Amount', 'Settle', 'Done'] },
  xfer: { labels: ['From/To', 'Amount', 'Purpose', 'Done'] },
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

export default function MultiCurrencyTreasuryModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ trade: 1, xfer: 1 })

  useEffect(() => { if (active === null) { setResults({}); setFlows({ trade: 1, xfer: 1 }); setBusy(null) } }, [active])
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

  /* M1: Trade FX (Multistep 4 steps) */
  const renderTrade = () => {
    const step = flows.trade
    return (
      <MBox id="tradeModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-currency-exchange text-primary me-2" />Execute FX Trade</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('trade', 4)}>{step >= 4 ? 'Done' : 'Continue'}</button></>}>
        <Stepper flowKey="trade" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Select Currency Pair</h6>
            <div className="mb-3"><label className={s.formLabel}>Pair</label><select className={s.formControl}><option>USD/KES (129.42)</option><option>EUR/KES (139.80)</option><option>GBP/KES (167.90)</option><option>USD/EUR (0.926)</option></select></div>
            <div className="mb-3"><label className={s.formLabel}>Trade Type</label><select className={s.formControl}><option>Spot (T+2)</option><option>Forward (Custom date)</option><option>Swap</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Trade Amount</h6>
            <div className="mb-3"><label className={s.formLabel}>Amount</label><input className={s.formControl} defaultValue="50000" /></div>
            <div className="mb-3"><label className={s.formLabel}>Direction</label><select className={s.formControl}><option>Buy USD / Sell KES</option><option>Sell USD / Buy KES</option></select></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-1"><span className="text-muted">Rate</span><strong>129.42</strong></div>
              <div className="d-flex justify-content-between mb-1"><span className="text-muted">You receive</span><strong>KES 6,471,000</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Fee</span><strong>KES 3,200</strong></div>
            </div>
          </div>
        )}
        {step === 3 && renderActionBody('tradeModal', (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Settlement Details</h6>
            <div className="mb-3"><label className={s.formLabel}>Settlement Date</label><input type="date" className={s.formControl} defaultValue="2025-06-29" /></div>
            <div className="mb-3"><label className={s.formLabel}>Purpose</label><select className={s.formControl}><option>Import payment</option><option>Supplier payment</option><option>Intercompany transfer</option></select></div>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('tradeModal', 'FX trade executed successfully!', 'FX-8921')}>Confirm Trade <i className="bi bi-check-lg" /></button>
          </div>
        ))}
        {step === 4 && renderActionBody('tradeModal', (<div className={s.fstepActive}><div className="text-center p-3" style={{ background: 'var(--pm-accent-soft)', borderRadius: 12 }}><strong>Trade Complete!</strong></div></div>))}
      </MBox>
    )
  }

  /* M2: Transfer FX (Multistep 4 steps) */
  const renderTransfer = () => {
    const step = flows.xfer
    return (
      <MBox id="transferModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-arrow-left-right text-primary me-2" />Cross-Border Transfer</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('xfer', 4)}>{step >= 4 ? 'Done' : 'Continue'}</button></>}>
        <Stepper flowKey="xfer" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>From Account</label><select className={s.formControl}><option>USD Account (USD 318,400)</option><option>EUR Account (EUR 142,800)</option><option>GBP Account (GBP 84,200)</option></select></div>
            <div className="mb-3"><label className={s.formLabel}>To Account</label><select className={s.formControl}><option>KES Account</option><option>USD Account</option><option>EUR Account</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Amount</label><input className={s.formControl} defaultValue="50000" /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-1"><span className="text-muted">FX Rate</span><strong>129.42</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Converted</span><strong>KES 6,471,000</strong></div>
            </div>
          </div>
        )}
        {step === 3 && renderActionBody('transferModal', (
          <div className={s.fstepActive}>
            <div className="mb-3"><label className={s.formLabel}>Purpose / Narrative</label><textarea className={s.formControl} rows={2} defaultValue="Supplier payment — invoice ref INV-8829" /></div>
            <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => doAction('transferModal', 'Transfer completed!', 'FXT-20250627-4491')}>Confirm Transfer <i className="bi bi-check-lg" /></button>
          </div>
        ))}
        {step === 4 && renderActionBody('transferModal', (<div className={s.fstepActive}><div className="text-center p-3" style={{ background: 'var(--pm-accent-soft)', borderRadius: 12 }}><strong>Transfer Complete!</strong></div></div>))}
      </MBox>
    )
  }

  /* M3: Hedge */
  const renderHedge = () => (
    <MBox id="hedgeModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-shield text-accent me-2" />Set FX Hedge</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('hedgeModal', 'Forward contract created!', 'FX-8922')}>Create Hedge</button></>}>
      {renderActionBody('hedgeModal', <>
        <div className="mb-3"><label className={s.formLabel}>Pair</label><select className={s.formControl}><option>USD/KES</option><option>EUR/KES</option><option>GBP/KES</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Amount</label><input className={s.formControl} defaultValue="100000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Forward Period</label><select className={s.formControl}><option>30 days</option><option>60 days</option><option>90 days</option><option>180 days</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> Forward rate: 129.55 (current spot: 129.42). Points: +0.13
        </div>
      </>)}
    </MBox>
  )

  /* M4: FX Contract Detail */
  const renderFXContract = () => (
    <MBox id="fxContractModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-text me-2" />Contract Details</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="row g-3 mb-3">
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Contract</span><br /><strong>FX-8821</strong></div></div>
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><span style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>P&L</span><br /><strong style={{ color: '#047857' }}>+KES 42,000</strong></div></div>
      </div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Pair</span><strong>USD/KES</strong></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Amount</span><strong>USD 120,000</strong></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Rate</span><strong>129.35</strong></div>
      <div className="p-3 border rounded d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Expiry</span><strong>27 Jun 2025</strong></div>
    </MBox>
  )

  /* M5: Roll Contract */
  const renderRollContract = () => (
    <MBox id="rollContractModal" active={active} onClose={onClose} title={<><i className="bi bi-arrow-repeat me-2" />Roll Contract</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('rollContractModal', 'Contract rolled. New ID: FX-8922', 'FX-8922')}>Roll</button></>}>
      {renderActionBody('rollContractModal', <>
        <div className="mb-3"><label className={s.formLabel}>Contract</label><select className={s.formControl}><option>FX-8821 • USD 120K • 27 Jun</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>New Expiry</label><select className={s.formControl}><option>30 days</option><option>60 days</option><option>90 days</option></select></div>
      </>)}
    </MBox>
  )

  /* M6: Rate Alert */
  const renderRateAlert = () => (
    <MBox id="rateAlertModal" active={active} onClose={onClose} title={<><i className="bi bi-bell text-warning me-2" />Rate Alert Configuration</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('rateAlertModal', 'Rate alert saved.', '')}>Save Alert</button></>}>
      {renderActionBody('rateAlertModal', <>
        <div className="mb-3"><label className={s.formLabel}>Currency Pair</label><select className={s.formControl}><option>USD/KES</option><option>EUR/KES</option><option>GBP/KES</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Alert When</label><select className={s.formControl}><option>Rate crosses above</option><option>Rate drops below</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Threshold</label><input className={s.formControl} defaultValue="130.00" /></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Email notification</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">SMS notification</label></div>
      </>)}
    </MBox>
  )

  /* M7: Market Intelligence */
  const renderMarket = () => (
    <MBox id="marketModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-newspaper me-2" />FX Market Intelligence</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)' }}>
        <h6 style={{ fontWeight: 700, color: '#1D4ED8' }}>CBK Policy Meeting — Tomorrow</h6>
        <p style={{ fontSize: 13, color: '#1E40AF', margin: '4px 0 0' }}>Consensus: 25bps rate cut expected. USD/KES likely to weaken to 130.50–131.00 range.</p>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
        <h6 style={{ fontWeight: 700, color: '#B45309' }}>GBP Alert</h6>
        <p style={{ fontSize: 13, color: '#92400E', margin: '4px 0 0' }}>UK inflation data tomorrow — potential 1.5% volatility. Consider hedging before event.</p>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}>
        <h6 style={{ fontWeight: 700, color: '#047857' }}>TZS Devaluation Risk</h6>
        <p style={{ fontSize: 13, color: '#065F46', margin: '4px 0 0' }}>Tanzania central bank under pressure. 2–3% devaluation possible in next 30 days.</p>
      </div>
    </MBox>
  )

  /* M8: Compliance */
  const renderCompliance = () => (
    <MBox id="complianceModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-file-earmark-text text-warning me-2" />Regulatory Compliance</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('complianceModal', 'STR filed successfully!', 'CBK-STR-20250627-9914')}>File STR</button></>}>
      {renderActionBody('complianceModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <strong>Suspicious Transaction Report (STR) Required</strong><br />
          Large USD inflow of KES 12.4M from US client requires CBK filing within 24 hours.
        </div>
        <div className="mb-3"><label className={s.formLabel}>Transaction</label><select className={s.formControl}><option>USD 95,500 incoming • 26 Jun</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Report Category</label><select className={s.formControl}><option>Large cash transaction</option><option>Cross-border transfer</option><option>Suspicious activity</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Notes</label><textarea className={s.formControl} rows={2} defaultValue="Legitimate import payment — supporting documents attached." /></div>
      </>)}
    </MBox>
  )

  /* M9: FX Notifications */
  const renderFXNotif = () => (
    <MBox id="fxNotifModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />FX Notifications (7)</>}
      footer={<><button className={s.btnPm} onClick={() => onOpen('rateAlertModal')}>Manage Alerts</button><button className={s.btnPm} onClick={onClose}>Close</button></>}>
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Forward FX-8821 expires today</strong><div style={{ fontSize: 11, color: '#7F1D1D' }}>USD 120K • Action required before 5 PM</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>GBP volatility alert triggered</strong><div style={{ fontSize: 11, color: '#92400E' }}>1.8% move in last 4 hours</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>USD 85K settlement confirmed</strong><div style={{ fontSize: 11, color: '#1E40AF' }}>Value date 28 Jun</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>STR filed successfully</strong><div style={{ fontSize: 11, color: '#065F46' }}>Reference CBK-STR-20250627-9914</div></div>
        <div className="p-3 rounded mb-2" style={{ background: '#fff', border: '1px solid var(--pm-border)', fontSize: 13 }}><strong>Rate alert: USD/KES crossed 129.50</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Current: 129.42</div></div>
      </div>
    </MBox>
  )

  /* M10: FX Health */
  const renderFXHealth = () => (
    <MBox id="fxHealthModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-heart-pulse text-danger me-2" />Treasury Health Check</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('complianceModal')}>File Pending STR</button></>}>
      <div className="row g-3 mb-3">
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 28, fontWeight: 800, color: '#047857', fontFamily: 'var(--pm-font-display)' }}>87</div><div style={{ fontSize: 10, fontWeight: 700, color: '#047857' }}>HEALTH SCORE</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>7</div><div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>CURRENCIES</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>4</div><div style={{ fontSize: 10, fontWeight: 700, color: '#B45309' }}>OPEN TRADES</div></div></div>
        <div className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-purple-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-purple)' }}>1</div><div style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9' }}>STR PENDING</div></div></div>
      </div>
      <div className="table-responsive">
        <table className={s.tbl}><thead><tr><th>Area</th><th>Status</th><th>Issue</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td>USD Exposure</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td><td>68% hedged</td><td>—</td></tr>
            <tr><td>GBP Volatility</td><td><span className={cx(s.badge, s.badgeW)}>Watch</span></td><td>1.8% volatility</td><td>Increase hedge</td></tr>
            <tr><td>Compliance</td><td><span className={cx(s.badge, s.badgeW)}>Action</span></td><td>STR pending</td><td>File today</td></tr>
            <tr><td>Reconciliation</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td><td>1 exception resolved</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* M11: Market Comment */
  const renderMarketComment = () => (
    <MBox id="marketCommentModal" active={active} onClose={onClose} title={<><i className="bi bi-chat-text me-2" />Market Commentary</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
        <h6 style={{ fontWeight: 700 }}>USD/KES Outlook — Next 7 Days</h6>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginTop: 8 }}>CBK expected to cut policy rate by 25bps tomorrow. This should put downward pressure on KES, pushing USD/KES toward 130.00–130.80 range. Recommend locking in any USD receivables above 130.00.</p>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
        <h6 style={{ fontWeight: 700 }}>GBP Risk Event</h6>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginTop: 8 }}>UK CPI data tomorrow could trigger 1.5% volatility. Consider hedging 50% of July GBP exposure before the event.</p>
      </div>
    </MBox>
  )

  /* M12: Security */
  const renderSecurity = () => (
    <MBox id="securityModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-lock me-2" />Treasury Security</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('securityModal', 'Security settings updated.', '')}>Apply</button></>}>
      {renderActionBody('securityModal', <>
        <div className="mb-3"><label className={s.formLabel}>Action</label><select className={s.formControl}><option>Change Treasury PIN</option><option>Enable 2FA for FX trades</option><option>Review authorized signatories</option><option>Download audit log</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> All FX trades above USD 50K require dual authorization.</div>
      </>)}
    </MBox>
  )

  /* M13: Profile */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose} title={<><i className="bi bi-person-circle me-2" />Profile</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="text-center">
        <div className={cx(s.avatar, 'mx-auto mb-3')} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
        <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@company.co.ke · +254 712 345 890</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Treasury Score</span><br /><strong style={{ color: 'var(--pm-accent)' }}>87/100</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Open Contracts</span><br /><strong>4</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Member Since</span><br /><strong>Mar 2022</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">STRs Filed</span><br /><strong>12 YTD</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  /* M14: Attention */
  const renderAttention = () => (
    <MBox id="attentionModal" active={active} onClose={onClose} title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Treasury Items</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className={s.statusRow}><div><strong>USD 45K forward expires today</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>FX-8821</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('rollContractModal')}>Roll</button></div>
      <div className={s.statusRow}><div><strong>STR report due</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 12.4M inflow</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('complianceModal')}>File</button></div>
      <div className={s.statusRow}><div><strong>GBP volatility alert</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>1.8% in 4hrs</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('hedgeModal')}>Hedge</button></div>
      <div className={s.statusRow}><div><strong>Hedge ratio below target</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>68% vs 75%</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('hedgeModal')}>Adjust</button></div>
    </MBox>
  )

  /* M15: Account Modal */
  const renderAccount = () => (
    <MBox id="accountModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-wallet2 me-2" />Treasury Accounts</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className="table-responsive">
        <table className={s.tbl}><thead><tr><th>Currency</th><th>Account ID</th><th>Bank</th><th>Balance</th><th>Limit</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>USD</td><td>ACCT-USD-001</td><td>Equity Bank</td><td>318,400</td><td>500,000</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('accountModal', 'Account settings updated.', '')}>Edit</button></td></tr>
            <tr><td>EUR</td><td>ACCT-EUR-001</td><td>KCB Bank</td><td>142,800</td><td>200,000</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('accountModal', 'Account settings updated.', '')}>Edit</button></td></tr>
            <tr><td>KES</td><td>ACCT-KES-001</td><td>Equity Bank</td><td>48,240,000</td><td>100,000,000</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('accountModal', 'Account settings updated.', '')}>Edit</button></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* M16: Report Export */
  const renderReportExport = () => (
    <MBox id="reportExportModal" active={active} onClose={onClose} title={<><i className="bi bi-download me-2" />Export Report</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reportExportModal', 'Report downloaded.', '')}>Export</button></>}>
      {renderActionBody('reportExportModal', <>
        <div className="mb-3"><label className={s.formLabel}>Report</label><select className={s.formControl}><option>Daily Treasury Position</option><option>FX P&L</option><option>Hedging Report</option><option>Compliance Report</option></select></div>
        <div className="row g-3 mb-3"><div className="col-6"><label className={s.formLabel}>From</label><input type="date" className={s.formControl} defaultValue="2025-06-01" /></div><div className="col-6"><label className={s.formLabel}>To</label><input type="date" className={s.formControl} defaultValue="2025-06-27" /></div></div>
        <div className="mb-3"><label className={s.formLabel}>Format</label><select className={s.formControl}><option>PDF</option><option>Excel</option><option>CSV</option></select></div>
      </>)}
    </MBox>
  )

  /* M17: FAQ */
  const renderFAQ = () => (
    <MBox id="faqModal" active={active} onClose={onClose} title={<><i className="bi bi-question-circle me-2" />FX FAQ</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
      <div className={s.statusRow}><div><strong>How do I roll a forward contract?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Go to FX Contracts → select contract → Roll. New rate based on current forward points.</div></div></div>
      <div className={s.statusRow}><div><strong>What is the cut-off time for same-day FX?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Spot trades before 2 PM EAT settle T+2. After 2 PM → T+3.</div></div></div>
    </MBox>
  )

  return (
    <>
      {renderTrade()}
      {renderTransfer()}
      {renderHedge()}
      {renderFXContract()}
      {renderRollContract()}
      {renderRateAlert()}
      {renderMarket()}
      {renderCompliance()}
      {renderFXNotif()}
      {renderFXHealth()}
      {renderMarketComment()}
      {renderSecurity()}
      {renderProfile()}
      {renderAttention()}
      {renderAccount()}
      {renderReportExport()}
      {renderFAQ()}
    </>
  )
}
