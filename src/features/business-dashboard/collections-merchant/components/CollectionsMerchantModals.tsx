import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/collections-merchant.module.css'

/* ============================================================================
   Collections & Merchant Services — modal layer (legacy page 3.2)
   LEGACY BRIDGE: same pattern as CommandCenterModals
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
  receive: { labels: ['Details', 'Method', 'Execute', 'Done'] },
  refund: { labels: ['Select', 'Details', 'Done'] },
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

const AMOUNTS = ['500', '1,000', '5,000', '10,000', '25,000', '50,000', '100,000', 'Custom']

export default function CollectionsMerchantModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ receive: 1, refund: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [selectedAmount, setSelectedAmount] = useState('5,000')

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ receive: 1, refund: 1 })
      setBusy(null)
      setTabs({})
      setSelectedAmount('5,000')
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

  const switchTab = (prefix: string, key: string) => {
    setTabs((prev) => ({ ...prev, [prefix]: key }))
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

  /* ==========================================================================
     M1: Receive Payment (Multistep, 4 steps)
     ======================================================================== */
  const renderReceivePayment = () => {
    const step = flows.receive
    return (
      <MBox id="receivePaymentModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-wallet2 text-primary me-2" />Collect Payment</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('receive', 4)}>
              {step >= 3 ? 'Send Prompt' : step >= 4 ? 'Done' : 'Continue'}
            </button>
          </>
        }
      >
        <Stepper flowKey="receive" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Customer Details</h6>
            <div className="mb-3"><label className={s.formLabel}>Customer Name</label><input className={s.formControl} defaultValue="Alice Wanjiku" /></div>
            <div className="mb-3"><label className={s.formLabel}>Phone / Account</label><input className={s.formControl} defaultValue="0722 345 112" /></div>
            <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label>
              <div className={s.amountChips}>
                {AMOUNTS.map((amt) => (
                  <button key={amt} className={cx(s.amountChip, selectedAmount === amt && s.amountChipActive)} onClick={() => setSelectedAmount(amt)}>
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Select Collection Method</h6>
            <div className="row g-2">
              {[
                { icon: 'bi-phone', label: 'M-Pesa PayBill', desc: 'STK Push to customer phone' },
                { icon: 'bi-shop', label: 'M-Pesa Till', desc: 'Customer pays to Till number' },
                { icon: 'bi-credit-card', label: 'Card Payment', desc: 'Visa/Mastercard checkout link' },
              ].map((m) => (
                <div key={m.label} className="col-md-4">
                  <div className="p-3 border rounded" style={{ cursor: 'pointer', textAlign: 'center' }}>
                    <i className={`bi ${m.icon}`} style={{ fontSize: 24, color: 'var(--pm-primary)' }} />
                    <div style={{ fontWeight: 600, marginTop: 8 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Execute Payment Prompt</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
              <i className="bi bi-info-circle me-1" /> STK Push will be sent to 0722 345 112 for KES {selectedAmount}.
            </div>
          </div>
        )}
        {step === 4 && (
          <div className={s.fstepActive}>
            {renderReceipt({ msg: 'Payment collected successfully!', ref: 'TXN-892110' })}
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M2: Refund (Multistep, 3 steps)
     ======================================================================== */
  const renderRefund = () => {
    const step = flows.refund
    return (
      <MBox id="refundModal" active={active} onClose={onClose}
        title={<><i className="bi bi-arrow-return-left text-warning me-2" />Process Refund</>}
        footer={
          <>
            <button className={s.btnPm} onClick={onClose}>Cancel</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('refund', 3)}>
              {step >= 2 ? 'Authorize' : step >= 3 ? 'Done' : 'Continue'}
            </button>
          </>
        }
      >
        <Stepper flowKey="refund" current={step} />
        {step === 1 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Transaction</h6>
            <div className="mb-3"><label className={s.formLabel}>Transaction Reference</label><input className={s.formControl} defaultValue="TXN-892109" /></div>
            <div className="mb-3"><label className={s.formLabel}>Refund Type</label>
              <select className={s.formControl}><option>Full Refund</option><option>Partial Refund</option></select>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Refund Amount (KES)</label><input type="number" className={s.formControl} defaultValue="3400" /></div>
          </div>
        )}
        {step === 2 && (
          <div className={s.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Authorize Refund</h6>
            <div className={s.pinRow}>
              {[0, 1, 2, 3].map((i) => <input key={i} type="text" maxLength={1} className={s.formControl} style={{ width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700 }} placeholder="·" />)}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={s.fstepActive}>
            {renderReceipt({ msg: 'Refund processed successfully!', ref: 'RF-11042' })}
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M3: PayBill Config
     ======================================================================== */
  const renderPaybillConfig = () => (
    <MBox id="paybillConfigModal" active={active} onClose={onClose}
      title={<><i className="bi bi-phone text-success me-2" />M-Pesa PayBill Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('paybillConfigModal', 'PayBill configuration saved. KYC document uploaded.')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('paybillConfigModal', <>
        <div className="mb-3"><label className={s.formLabel}>PayBill Number</label><input className={s.formControl} defaultValue="512234" disabled style={{ background: 'var(--pm-surface-2)' }} /></div>
        <div className="mb-3"><label className={s.formLabel}>Business Name</label><input className={s.formControl} defaultValue="TechSolutions Ltd" /></div>
        <div className="mb-3"><label className={s.formLabel}>Account Validation Mode</label>
          <select className={s.formControl}><option>Enabled (Strict API Lookup)</option><option>Regex Pattern matching</option><option>Disabled (Accept any)</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Customer Fee Configuration</label>
          <select className={s.formControl}><option>Customer pays M-Pesa fee</option><option>Merchant absorbs fee (Zero-rated)</option></select>
        </div>
        <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
          <i className="bi bi-exclamation-triangle me-1" /> KYC Update Required: Please upload your latest CR12 document to avoid service suspension.
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M4: Till Config
     ======================================================================== */
  const renderTillConfig = () => (
    <MBox id="tillConfigModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shop text-info me-2" />M-Pesa Till Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('tillConfigModal', 'Till settings updated successfully.')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('tillConfigModal', <>
        <div className="mb-3"><label className={s.formLabel}>Till Number</label><input className={s.formControl} defaultValue="882001" disabled style={{ background: 'var(--pm-surface-2)' }} /></div>
        <div className="mb-3"><label className={s.formLabel}>Store / Branch Name</label><input className={s.formControl} defaultValue="Nairobi CBD Branch" /></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable LNMO API for online checkout</label></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Allow staff to initiate reversals</label></div>
        <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
          <div className="d-flex justify-content-between mb-1"><span>Current MDR Rate</span><strong>1.0%</strong></div>
          <div className="d-flex justify-content-between"><span>Settlement</span><strong>Real-time to Wallet</strong></div>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M5: PesaLink Config
     ======================================================================== */
  const renderPesalinkConfig = () => (
    <MBox id="pesalinkConfigModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bank text-warning me-2" />PesaLink Collections</>}
    >
      <div className="text-center p-4">
        <div className={cx(s.iconCircle, 'mx-auto mb-3')} style={{ width: 64, height: 64, background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', fontSize: 28 }}>
          <i className="bi bi-hourglass-split" />
        </div>
        <h5 style={{ fontWeight: 700 }}>Awaiting KYC Approval</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your PesaLink merchant account request is currently under review by the acquiring bank. This usually takes 24-48 hours.</p>
      </div>
      <div className="p-3 rounded mt-2 border">
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Features once activated:</div>
        <ul style={{ fontSize: 12, color: 'var(--pm-muted)', margin: 0, paddingLeft: 16 }}>
          <li>Receive funds from 50+ local banks instantly</li>
          <li>Alias routing (Pay to phone number/Till)</li>
          <li>Fixed KES 45 fee per transaction regardless of amount</li>
          <li>Higher transaction limits (up to KES 999,999)</li>
        </ul>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M6: Card Config
     ======================================================================== */
  const renderCardConfig = () => (
    <MBox id="cardConfigModal" active={active} onClose={onClose}
      title={<><i className="bi bi-credit-card me-2" style={{ color: 'var(--pm-purple)' }} />Card Payment Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('cardConfigModal', 'Card settings updated. Tokenization activated.')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('cardConfigModal', <>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Accept Visa / Mastercard</label></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enforce 3D Secure Authentication</label></div>
        <div className="p-3 border rounded mb-3" style={{ background: 'var(--pm-info-soft)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div><strong style={{ fontSize: 13 }}>Enable Tokenization</strong><div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>Allow customers to save cards securely for 1-click checkout. Recommended by AI.</div></div>
            <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /></div>
          </div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Accepted Currencies</label>
          <div className="d-flex gap-2"><span className={cx(s.badge, s.badgeS)}>KES</span><span className={s.badge} style={{ background: 'var(--pm-surface-2)' }}>USD</span><span className={s.badge} style={{ background: 'var(--pm-surface-2)' }}>EUR</span><span className={s.badge} style={{ background: 'var(--pm-surface-2)' }}>GBP</span></div>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M7: API Config (with tabs)
     ======================================================================== */
  const renderApiConfig = () => {
    const currentTab = tabs.api ?? 'keys'
    return (
      <MBox id="apiConfigModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-code-slash me-2" style={{ color: 'var(--pm-purple)' }} />API Integration & Keys</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
      >
        <div className={cx(s.pills, 'mb-3')}>
          <button className={cx(s.pill, currentTab === 'keys' && s.pillActive)} onClick={() => switchTab('api', 'keys')}>API Keys</button>
          <button className={cx(s.pill, currentTab === 'webhooks' && s.pillActive)} onClick={() => switchTab('api', 'webhooks')}>Webhooks</button>
          <button className={cx(s.pill, currentTab === 'logs' && s.pillActive)} onClick={() => switchTab('api', 'logs')}>Logs</button>
        </div>
        {currentTab === 'keys' && (
          <div className={s.tpanelActive}>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-purple-soft)', fontSize: 12 }}>
              <i className="bi bi-exclamation-triangle me-1" /> Your LNMO Production Keys will expire in 3 days. Please rotate them.
            </div>
            <div className="mb-3"><label className={s.formLabel}>Consumer Key</label>
              <div className="d-flex gap-2"><input className={s.formControl} type="password" defaultValue="asdfasdfasdfasdf" readOnly /><button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-clipboard" /></button></div>
            </div>
            <div className="mb-3"><label className={s.formLabel}>Consumer Secret</label>
              <div className="d-flex gap-2"><input className={s.formControl} type="password" defaultValue="asdfasdfasdfasdf" readOnly /><button className={cx(s.btnPm, s.btnSm)}><i className="bi bi-clipboard" /></button></div>
            </div>
            <button className={cx(s.btnPm, s.btnSm, s.btnPmD)} onClick={() => doAction('apiConfigModal', 'Keys rotated successfully. Update your application.')}>
              <i className="bi bi-arrow-repeat" /> Rotate Keys
            </button>
          </div>
        )}
        {currentTab === 'webhooks' && (
          <div className={s.tpanelActive}>
            <div className="mb-3"><label className={s.formLabel}>Validation URL</label><input className={s.formControl} defaultValue="https://api.yourdomain.com/paymo/validate" /></div>
            <div className="mb-3"><label className={s.formLabel}>Confirmation URL</label><input className={s.formControl} defaultValue="https://api.yourdomain.com/paymo/confirm" /></div>
            <button className={cx(s.btnPm, s.btnSm, s.btnPmP)}>Save Endpoints</button>
          </div>
        )}
        {currentTab === 'logs' && (
          <div className={s.tpanelActive}>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Time</th><th>Endpoint</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>10:41 AM</td><td>/v1/stkpush/process</td><td><span className={cx(s.badge, s.badgeS)}>200 OK</span></td></tr>
                  <tr><td>10:35 AM</td><td>/v1/validation</td><td><span className={cx(s.badge, s.badgeS)}>200 OK</span></td></tr>
                  <tr><td>09:12 AM</td><td>/v1/stkpush/process</td><td><span className={cx(s.badge, s.badgeD)}>500 ERR</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M8: Settlement Modal
     ======================================================================== */
  const renderSettlement = () => (
    <MBox id="settlementModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-bank text-info me-2" />Settlement Pipeline</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>CLEARED (WALLET)</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 304,100</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Available for payout</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>PENDING (T+1)</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>KES 89,200</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Card & Bank clearing</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 11, color: '#B45309', fontWeight: 600 }}>HELD (RESERVE)</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 25,000</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Chargeback rolling reserve</div></div></div>
      </div>
      <h6 style={{ fontWeight: 700 }}>Scheduled Bank Payouts</h6>
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Batch ID</th><th>Date</th><th>Gross</th><th>Fees</th><th>Net Payout</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>SET-8821</td><td>Today 4PM</td><td>KES 142,500</td><td>KES 2,137</td><td>KES 140,363</td><td><span className={cx(s.badge, s.badgeI)}>Processing</span></td></tr>
            <tr><td>SET-8820</td><td>Yesterday</td><td>KES 210,000</td><td>KES 3,150</td><td>KES 206,850</td><td><span className={cx(s.badge, s.badgeS)}>Cleared</span></td></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3"><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => doAction('settlementModal', 'Manual withdrawal of KES 304,100 initiated to Equity Bank.')}>Withdraw Available Funds to Bank</button></div>
    </MBox>
  )

  /* ==========================================================================
     M9: Analytics Modal
     ======================================================================== */
  const renderAnalytics = () => (
    <MBox id="analyticsModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-graph-up me-2" />Collection Analytics</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3">
        <div className="col-lg-8">
          <h6 style={{ fontSize: 13, fontWeight: 700 }}>Volume Trend (Last 7 Days)</h6>
          <div className={s.chartBars}>
            {[
              { day: 'Mon', h: '40%', c: 'var(--pm-primary-light)' },
              { day: 'Tue', h: '60%', c: 'var(--pm-primary-light)' },
              { day: 'Wed', h: '85%', c: 'var(--pm-primary)' },
              { day: 'Thu', h: '55%', c: 'var(--pm-primary-light)' },
              { day: 'Fri', h: '95%', c: 'var(--pm-primary)' },
              { day: 'Sat', h: '35%', c: 'var(--pm-primary-light)' },
              { day: 'Sun', h: '25%', c: 'var(--pm-primary-light)' },
            ].map((b) => (
              <div key={b.day} className={s.chartBar} style={{ height: b.h, background: b.c }}>
                <span className={s.barLabel}>{b.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <h6 style={{ fontSize: 13, fontWeight: 700 }}>Key Metrics</h6>
          <div className="p-3 border rounded mb-2">
            <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Total Collected</span><strong>KES 412,500</strong></div>
          </div>
          <div className="p-3 border rounded mb-2">
            <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Avg Transaction</span><strong>KES 2,246</strong></div>
          </div>
          <div className="p-3 border rounded">
            <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Success Rate</span><strong style={{ color: 'var(--pm-accent)' }}>98.4%</strong></div>
          </div>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M10: Dispute Modal
     ======================================================================== */
  const renderDispute = () => (
    <MBox id="disputeModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-exclamation text-danger me-2" />Chargeback Defense</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('disputeModal', 'Dispute defense submitted successfully!', 'DSP-88291')}>Submit Defense</button>
        </>
      }
    >
      {renderActionBody('disputeModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
          <strong>Chargeback Details</strong><br />
          Visa ***4112 · KES 12,500 · Reason: Service not provided<br />
          Deadline: 14 days to respond
        </div>
        <div className="mb-3"><label className={s.formLabel}>Evidence Type</label>
          <select className={s.formControl}><option>Delivery Confirmation</option><option>Customer Communication</option><option>Transaction Receipt</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Description</label><textarea className={s.formControl} rows={3} defaultValue="Service was delivered on October 15, 2025 as per the contract agreement." /></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M11: Generate QR
     ======================================================================== */
  const renderGenerateQR = () => (
    <MBox id="generateQRModal" active={active} onClose={onClose}
      title={<><i className="bi bi-qr-code text-info me-2" />Generate Dynamic QR</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('generateQRModal', 'QR code generated and ready for deployment!')}>Generate</button>
        </>
      }
    >
      {renderActionBody('generateQRModal', <>
        <div className="mb-3"><label className={s.formLabel}>QR Type</label>
          <select className={s.formControl}><option>M-Pesa PayBill (STK Push)</option><option>M-Pesa Till (Buy Goods)</option><option>Payment Link (Universal)</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="0" placeholder="0 = Customer enters amount" /></div>
        <div className="mb-3"><label className={s.formLabel}>Reference / Account</label><input className={s.formControl} defaultValue="512234" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable expiry timer (24 hours)</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M12: Fee Calculator
     ======================================================================== */
  const renderFeeCalculator = () => (
    <MBox id="feeCalculatorModal" active={active} onClose={onClose}
      title={<><i className="bi bi-calculator me-2" />Transfer Fee Calculator</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="50000" id="calcAmt" /></div>
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Method</th><th>MDR</th><th>Fee</th><th>You Receive</th></tr></thead>
          <tbody>
            <tr><td>M-Pesa PayBill</td><td>1.5%</td><td className="calc-pb-fee">750</td><td className="calc-pb-net">49,250</td></tr>
            <tr><td>M-Pesa Till</td><td>1.0%</td><td className="calc-till-fee">500</td><td className="calc-till-net">49,500</td></tr>
            <tr><td>Card (Visa/MC)</td><td>2.9%</td><td className="calc-card-fee">1,450</td><td className="calc-card-net">48,550</td></tr>
            <tr><td>PesaLink</td><td>Fixed</td><td className="calc-pesa-fee">45</td><td className="calc-pesa-net">49,955</td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M13: Send Reminder
     ======================================================================== */
  const renderSendReminder = () => (
    <MBox id="sendReminderModal" active={active} onClose={onClose}
      title={<><i className="bi bi-chat-dots me-2" style={{ color: 'var(--pm-accent)' }} />Send Payment Reminder</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('sendReminderModal', 'Reminders sent to 14 customers via Email & SMS.')}>Send Reminders</button>
        </>
      }
    >
      {renderActionBody('sendReminderModal', <>
        <div className="mb-3"><label className={s.formLabel}>Channel</label>
          <div className={cx(s.pills, 'mb-3')}>
            <button className={cx(s.pill, s.pillActive)}>Email + SMS</button>
            <button className={s.pill}>Email Only</button>
            <button className={s.pill}>SMS Only</button>
          </div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Message Template</label>
          <textarea className={s.formControl} rows={3} defaultValue="Hi {name}, your invoice of KES {amount} is due. Please pay via PayBill 512234." />
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          14 customers selected · Total outstanding: KES 142,000
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M14: Export Report
     ======================================================================== */
  const renderExportReport = () => (
    <MBox id="exportReportModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-spreadsheet me-2" style={{ color: 'var(--pm-primary)' }} />Export Data</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('exportReportModal', 'Report exported successfully!')}>Export</button>
        </>
      }
    >
      {renderActionBody('exportReportModal', <>
        <div className="mb-3"><label className={s.formLabel}>Data Type</label>
          <select className={s.formControl}><option>All Transactions</option><option>Successful Only</option><option>Failed Only</option><option>Settlements</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Date Range</label>
          <div className="row g-2">
            <div className="col-md-6"><input type="date" className={s.formControl} defaultValue="2025-10-01" /></div>
            <div className="col-md-6"><input type="date" className={s.formControl} defaultValue="2025-10-31" /></div>
          </div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Format</label>
          <div className={cx(s.pills)}>
            <button className={cx(s.pill, s.pillActive)}>CSV</button>
            <button className={s.pill}>Excel (XLSX)</button>
            <button className={s.pill}>PDF</button>
          </div>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M15: Health Check
     ======================================================================== */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} onClose={onClose}
      title={<><i className="bi bi-heart-pulse text-success me-2" />Commerce Health Check</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-4 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#047857', fontFamily: 'var(--pm-font-display)' }}>94/100</div>
        <div style={{ fontWeight: 700, color: '#065F46' }}>Good Commerce Health Score</div>
      </div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>PayBill Active</span><span className={cx(s.badge, s.badgeS)}>Running</span></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>API Response Time</span><span className={cx(s.badge, s.badgeS)}>200ms avg</span></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>PesaLink Status</span><span className={cx(s.badge, s.badgeW)}>Pending KYC</span></div>
      <div className="p-3 border rounded d-flex justify-content-between" style={{ fontSize: 13 }}><span>Dispute Resolution</span><span className={cx(s.badge, s.badgeI)}>2 pending</span></div>
    </MBox>
  )

  /* ==========================================================================
     M16: Notifications
     ======================================================================== */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Notifications</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)' }}><strong>Chargeback received</strong><div style={{ fontSize: 11 }}>Visa ***4112 · KES 12,500</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)' }}><strong>Refund approval needed</strong><div style={{ fontSize: 11 }}>Customer: John Mark · KES 3,400</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)' }}><strong>KYC Update required</strong><div style={{ fontSize: 11 }}>Upload CR12 for PB 512234</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-purple-soft)' }}><strong>API token expires soon</strong><div style={{ fontSize: 11 }}>Rotate keys in 3 days</div></div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><strong>KES 412,500 collected today!</strong><div style={{ fontSize: 11 }}>184 successful transactions</div></div>
    </MBox>
  )

  /* ==========================================================================
     M17: Profile
     ======================================================================== */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-badge text-primary me-2" />My Profile</>}
      footer={<button className={cx(s.btnPm, s.btnPmD, 'w-100')} onClick={onClose}>Log Out</button>}
    >
      <div className="text-center">
        <div className={cx(s.avatar, 'mx-auto mb-3')} style={{ width: 64, height: 64, fontSize: 24 }}>JD</div>
        <h4 style={{ fontWeight: 700, marginBottom: 4 }}>Jane Doe</h4>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Finance Admin · TechSolutions Ltd</p>
        <div className="p-3 border rounded text-start mt-3">
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Role</span><strong>Finance Admin</strong></div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Approval Limit</span><strong>KES 1,000,000</strong></div>
          <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Security</span><span className={cx(s.badge, s.badgeS)}>MFA Active</span></div>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M18: Txn Detail
     ======================================================================== */
  const renderTxnDetail = () => (
    <MBox id="txnDetailModal" active={active} onClose={onClose}
      title={<><i className="bi bi-receipt me-2" />Transaction Details</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>REFERENCE</div><div style={{ fontSize: 16, fontWeight: 700 }}>TXN-892110</div></div></div>
        <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>STATUS</div><div style={{ fontSize: 16, fontWeight: 700, color: '#047857' }}>Success</div></div></div>
      </div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Customer</span><strong>Alice W.</strong></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Method</span><strong>PayBill</strong></div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Amount</span><strong>KES 4,500</strong></div>
      <div className="p-3 border rounded d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Time</span><strong>Today 14:32</strong></div>
    </MBox>
  )

  /* ==========================================================================
     M19: Customer Segment
     ======================================================================== */
  const renderCustomerSegment = () => (
    <MBox id="customerSegmentModal" active={active} onClose={onClose}
      title={<><i className="bi bi-stars me-2" style={{ color: 'var(--pm-purple)' }} />Customer Segments</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-purple-soft)' }}><div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 600 }}>VIP ({'>'}KES 50K)</div><div style={{ fontSize: 22, fontWeight: 700 }}>142</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>REGULAR</div><div style={{ fontSize: 22, fontWeight: 700 }}>810</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>NEW (30 DAYS)</div><div style={{ fontSize: 22, fontWeight: 700 }}>252</div></div></div>
      </div>
      <div className="p-3 border rounded mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}><span>Churn Risk</span><strong style={{ color: 'var(--pm-danger)' }}>18 customers</strong></div>
      <div className="p-3 border rounded d-flex justify-content-between" style={{ fontSize: 13 }}><span>Avg LTV (VIP)</span><strong>KES 142,500</strong></div>
    </MBox>
  )

  /* ==========================================================================
     M20: Add Customer
     ======================================================================== */
  const renderAddCustomer = () => (
    <MBox id="addCustomerModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-plus me-2" />Add Customer</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('addCustomerModal', 'Customer added successfully!')}>Add Customer</button>
        </>
      }
    >
      {renderActionBody('addCustomerModal', <>
        <div className="mb-3"><label className={s.formLabel}>Name</label><input className={s.formControl} defaultValue="" placeholder="Customer name" /></div>
        <div className="mb-3"><label className={s.formLabel}>Phone</label><input className={s.formControl} defaultValue="" placeholder="+254 7XX XXX XXX" /></div>
        <div className="mb-3"><label className={s.formLabel}>Email</label><input className={s.formControl} defaultValue="" placeholder="email@example.com" /></div>
        <div className="mb-3"><label className={s.formLabel}>Segment</label>
          <select className={s.formControl}><option>Regular</option><option>VIP</option><option>New</option></select>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M21: Attention Detail
     ======================================================================== */
  const renderAttentionDetail = () => (
    <MBox id="attentionDetailModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Attention Items</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={s.statusRow}><div><strong>Chargeback received</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Visa ***4112 · KES 12,500</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('disputeModal')}>Defend</button></div>
      <div className={s.statusRow}><div><strong>Refund approval needed</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Customer: John Mark · KES 3,400</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('refundModal')}>Review</button></div>
      <div className={s.statusRow}><div><strong>KYC Update required</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Upload CR12 for PB 512234</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('paybillConfigModal')}>Upload</button></div>
      <div className={s.statusRow}><div><strong>API Key Rotation</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Expires in 3 days</div></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('apiConfigModal')}>Rotate</button></div>
    </MBox>
  )

  /* ==========================================================================
     Render all modals
     ======================================================================== */
  return (
    <>
      {renderReceivePayment()}
      {renderRefund()}
      {renderPaybillConfig()}
      {renderTillConfig()}
      {renderPesalinkConfig()}
      {renderCardConfig()}
      {renderApiConfig()}
      {renderSettlement()}
      {renderAnalytics()}
      {renderDispute()}
      {renderGenerateQR()}
      {renderFeeCalculator()}
      {renderSendReminder()}
      {renderExportReport()}
      {renderHealthCheck()}
      {renderNotifications()}
      {renderProfile()}
      {renderTxnDetail()}
      {renderCustomerSegment()}
      {renderAddCustomer()}
      {renderAttentionDetail()}
    </>
  )
}
