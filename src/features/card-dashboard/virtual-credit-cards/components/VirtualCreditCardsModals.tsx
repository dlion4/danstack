import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/virtual-credit-cards.module.css'

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
  if (active !== id) return null
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
        <div
className={`${styles.modalBox} ${size === 'lg' ? styles.modalBoxLg : ''} ${size === 'xl' ? styles.modalBoxXl : ''}`}
          >
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className={styles.modalBody}>{children}</div>
          {footer && <div className={styles.modalFooter}>{footer}</div>}
        </div>
      </div>
    </>
  )
}

function BusyOverlay() {
  return (
    <div className={styles.loadingOv}>
      <div className={styles.spinner} />
      <p className={styles.loadingLabel}>Processing...</p>
    </div>
  )
}

const CARD_TYPES = ['Single-Use Card', 'Subscription Card', 'Multi-Use Card']
const VALIDITY_PERIODS = ['1 Hour', '24 Hours', '7 Days']
const FUNDING_SOURCES = ['PayMo Wallet Balance', 'Linked Bank Account', 'M-Pesa Direct']
const RENEW_ACTIONS = ['Renew Automatically', 'Close on Expiry']
const DISPUTE_REASONS = ['I do not recognize this transaction', 'I was overcharged', 'Duplicate charge', 'Subscription was cancelled', 'Goods/services not received']

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  createCard: { labels: ['Purpose', 'Limits', 'Auth', 'Done'] },
  payCredit: { labels: ['Amount', 'Method', 'Done'] }
}

interface Result { msg: string; ref?: string }

export default function VirtualCreditCardsModals({ active, onClose, onOpen }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ createCard: 1, payCredit: 1 })
  const [cardStep, setCardStep] = useState(1)
  const [payCredStep, setPayCredStep] = useState(1)
  const [selectedCardType, setSelectedCardType] = useState('')
  const [selectedCardColor, setSelectedCardColor] = useState('vCardBg1')
  const [selectedPayAmount, setSelectedPayAmount] = useState('statement')

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ createCard: 1, payCredit: 1 })
      setBusy(null)
      setCardStep(1)
      setPayCredStep(1)
      setSelectedCardType('')
      setSelectedCardColor('vCardBg1')
      setSelectedPayAmount('statement')
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

  const nextCardStep = () => {
    if (cardStep === 3) {
      doAction('createCardModal', 'Virtual Card Issued! Your new card is ready for immediate online use.')
      return
    }
    if (cardStep >= 4) { onClose(); return }
    setCardStep(prev => prev + 1)
  }

  const nextPayCredStep = () => {
    if (payCredStep === 2) {
      doAction('payCreditBillModal', 'Payment processed successfully!')
      return
    }
    if (payCredStep >= 3) { onClose(); return }
    setPayCredStep(prev => prev + 1)
  }

  const pinRef = useRef<(HTMLInputElement | null)[]>([])
  const handlePinInput = (idx: number) => {
    const el = pinRef.current[idx]
    if (el && el.value.length === 1 && idx < 3) {
      pinRef.current[idx + 1]?.focus()
    }
  }

  const renderReceipt = (r: Result) => (
    <div className={styles.receipt}>
      <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => downloadFile('receipt.txt', r.msg)}>
          <i className="bi bi-download" /> Save
        </button>
        <button className={`${styles.btnPm} ${styles.btnSm}`}>Continue</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  const renderCreateCard = () => (
    <MBox id="createCardModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-credit-card text-primary me-2" />Create Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={nextCardStep}>
            {cardStep >= 4 ? 'Done' : cardStep === 3 ? <>Issue Card <i className="bi bi-lock" /></> : <>Continue <i className="bi bi-arrow-right" /></>}
          </button>
        </>
      }
    >
      <div id="cardStepper" />
      {cardStep === 1 && (
        <div className={styles.fstepActive}>
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Card Purpose</h6>
          <div className="row g-3">
            {CARD_TYPES.map((type) => (
              <div key={type} className="col-md-4">
                <div className="p-3 border rounded text-center" style={{ cursor: 'pointer', height: '100%' }}
                  onClick={() => setSelectedCardType(type)}>
                  <i className={`bi ${type === 'Single-Use Card' ? 'bi-lightning-charge' : type === 'Subscription Card' ? 'bi-arrow-repeat' : 'bi-wallet2'} d-block mb-2`}
                    style={{ fontSize: 28, color: type === 'Single-Use Card' ? 'var(--pm-warning)' : type === 'Subscription Card' ? 'var(--pm-purple)' : 'var(--pm-info)' }} />
                  <strong style={{ fontSize: 13 }}>{type}</strong>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>
                    {type === 'Single-Use Card' ? 'Destroys itself after one successful transaction. High security.' :
                      type === 'Subscription Card' ? 'Locks to the first merchant it transacts with. Great for Netflix, AWS.' :
                        'Standard virtual card for general online spending.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {cardStep === 2 && (
        <div className={styles.fstepActive}>
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Customization & Limits</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className={styles.formLabel}>Monthly Limit (KES)</label>
              <input type="number" className={styles.formControl} defaultValue="50000" />
            </div>
            <div className="col-md-6">
              <label className={styles.formLabel}>Per-Transaction Limit (KES)</label>
              <input type="number" className={styles.formControl} defaultValue="15000" />
            </div>
            <div className="col-md-6">
              <label className={styles.formLabel}>Expiry Period</label>
              <select className={styles.formControl}>{VALIDITY_PERIODS.map((v) => <option key={v}>{v}</option>)}</select>
            </div>
            <div className="col-md-6">
              <label className={styles.formLabel}>Funding Source</label>
              <select className={styles.formControl}>{FUNDING_SOURCES.map((f) => <option key={f}>{f}</option>)}</select>
            </div>
          </div>
        </div>
      )}
      {cardStep === 3 && (
        <div className={styles.fstepActive}>
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Confirm & Issue</h6>
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between mb-1"><span className="text-muted">Type</span><strong>{selectedCardType || 'Multi-Use Card'}</strong></div>
            <div className="d-flex justify-content-between mb-1"><span className="text-muted">Limit</span><strong>KES 50,000</strong></div>
            <div className="d-flex justify-content-between"><span className="text-muted">Expiry</span><strong>7 Days</strong></div>
          </div>
          <label className={styles.formLabel}>Enter PIN to authorize issuance</label>
          <div className={styles.pinRow}>
            {[0, 1, 2, 3].map((i) => (
              <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1}
                onChange={() => handlePinInput(i)} />
            ))}
          </div>
        </div>
      )}
      {cardStep === 4 && (
        <div className={styles.fstepActive}>
          <div className={styles.receipt}>
            <div className={styles.receiptIcon}><i className="bi bi-credit-card" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Virtual Card Issued!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your new card is ready for immediate online use.</p>
            <div className={`${styles.creditCardUi} ${styles.bgGradientHero} mx-auto mt-3`} style={{ maxWidth: 320, textAlign: 'left' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div className={styles.vcardBrand}>PayMo</div>
                <div className={styles.vcardMastercard}>
                  <div className={styles.circle1} />
                  <div className={styles.circle2} />
                </div>
              </div>
              <div className={styles.vcardChip} />
              <div className={styles.vcardNumber}>5521 8802 4419 7720</div>
              <div className={styles.vcardBottom}>
                <div><div className={styles.vcardLabel}>Valid Thru</div><div className={styles.vcardValue}>11/26</div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MBox>
  )

  const renderPayCreditBill = () => (
    <MBox id="payCreditBillModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-cash-stack text-success me-2" />Repay Credit Balance</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={nextPayCredStep}>
            {payCredStep >= 3 ? 'Done' : payCredStep === 2 ? 'Pay Balance' : <>Continue <i className="bi bi-arrow-right" /></>}
          </button>
        </>
      }
    >
      {payCredStep === 1 && (
        <div className={styles.fstepActive}>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>OUTSTANDING BALANCE</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 42,300</div>
            <div style={{ fontSize: 12, color: '#92400E' }}>Payment due by 12 Jul 2025</div>
          </div>
          <div className="mb-3"><label className={styles.formLabel}>Payment Amount</label>
            <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3" onClick={() => setSelectedPayAmount('minimum')}>
              <input type="radio" name="payamt" checked={selectedPayAmount === 'minimum'} />
              <div><strong>Minimum Payment</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 4,230</div></div>
            </div>
            <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3" style={{ borderColor: 'var(--pm-primary)!important', background: 'rgba(79,70,229,.04)' }}
              onClick={() => setSelectedPayAmount('statement')}>
              <input type="radio" name="payamt" checked={selectedPayAmount === 'statement'} />
              <div><strong>Statement Balance</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 42,300 (Avoids interest)</div></div>
            </div>
            <div className="p-3 border rounded d-flex align-items-center gap-3" onClick={() => setSelectedPayAmount('custom')}>
              <input type="radio" name="payamt" checked={selectedPayAmount === 'custom'} />
              <div><strong>Custom Amount</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Enter specific amount</div></div>
            </div>
          </div>
        </div>
      )}
      {payCredStep === 2 && (
        <div className={styles.fstepActive}>
          <div className="mb-3"><label className={styles.formLabel}>Payment Method</label>
            <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3">
              <input type="radio" name="paymethod" defaultChecked />
              <div><strong>PayMo Wallet Balance</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Available: KES 45,000</div></div>
            </div>
            <div className="p-3 border rounded d-flex align-items-center gap-3">
              <input type="radio" name="paymethod" />
              <div><strong>Linked Equity Bank (***4521)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Instant transfer</div></div>
            </div>
          </div>
        </div>
      )}
    </MBox>
  )

  const renderRevealCard = () => (
    <MBox id="revealCardModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-eye text-primary me-2" />Reveal Card Details</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('revealCardModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>For your security, please enter your PIN to view full card details and CVV.</p>
        <div className={`${styles.pinRow} mb-3`}>
          {[0, 1, 2, 3].map((i) => (
            <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1}
              onChange={() => handlePinInput(i)} />
          ))}
        </div>
        <div id="revealedDetails" style={{ display: 'none' }} className="mt-4">
          <div className={styles.creditCardUi} style={{ background: 'var(--pm-gradient-slate)' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div className={styles.vcardBrand}>PayMo</div>
              <div className={styles.vcardMastercard}>
                <div className={styles.circle1} />
                <div className={styles.circle2} />
              </div>
            </div>
            <div className={styles.vcardChip} />
            <div className={styles.vcardNumber}>5521 8802 4419 7720</div>
            <div className={styles.vcardBottom}>
              <div><div className={styles.vcardLabel}>Cardholder</div><div className={styles.vcardValue}>JAMES KAMAU</div></div>
              <div><div className={styles.vcardLabel}>Valid Thru</div><div className={styles.vcardValue}>11/26</div></div>
              <div><div className={styles.vcardLabel}>CVV</div><div className={styles.vcardValue} style={{ color: 'var(--pm-warning)' }}>842</div></div>
            </div>
          </div>
          <div className="d-flex justify-content-center gap-2" style={{ marginTop: 16 }}>
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-clipboard" /> Copy Number</button>
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-clipboard" /> Copy CVV</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--pm-danger)', marginTop: 12 }}>Details will auto-hide in 30 seconds.</p>
        </div>
      </>)}
    </MBox>
  )

  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-shield-check text-success me-2" />Security Health Check</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('healthCheckModal', <>
        <div className="d-flex align-items-center justify-content-center mb-4">
          <div className={styles.iconCircle} style={{ width: 80, height: 80, background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', fontSize: 32 }}>
            <i className="bi bi-shield-check" />
          </div>
        </div>
        <div className={styles.statusRow}>
          <div><strong>3D Secure Verification</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Active on all multi-use cards</div>
          </div>
          <span className={`${styles.badge} ${styles.badgeS}`}>Pass</span>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Device Binding</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Approvals restricted to this iPhone 14</div>
          </div>
          <span className={`${styles.badge} ${styles.badgeS}`}>Pass</span>
        </div>
        <div className={styles.statusRow}>
          <div><strong>CVV Rotation</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>AWS Hosting CVV hasn't changed in 6 months</div>
          </div>
          <span className={`${styles.badge} ${styles.badgeW}`}>Action</span>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Dark Web Scan</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Checking card numbers against breaches</div>
          </div>
          <span className={`${styles.badge} ${styles.badgeS}`}>Clear</span>
        </div>
      </>)}
    </MBox>
  )

  const renderFraudAlert = () => (
    <MBox id="fraudAlertModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-shield-x text-danger me-2" />Fraud Alert Review</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('fraudAlertModal', 'Card has been permanently destroyed and new single-use card issued.', 'FRAUD-9912')}>No, destroy card and reissue</button>
        </>
      }
    >
      {renderActionBody('fraudAlertModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ fontSize: 24, color: 'var(--pm-danger)' }}><i className="bi bi-exclamation-triangle-fill" /></div>
            <div>
              <div style={{ fontWeight: 700, color: '#991B1B' }}>Suspicious Transaction Blocked</div>
              <div style={{ fontSize: 12, color: '#7F1D1D' }}>A single-use card was attempted multiple times.</div>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <tbody>
              <tr><td><strong>Merchant</strong></td><td>Unknown Crypto Exchange</td></tr>
              <tr><td><strong>Amount</strong></td><td>USD 450.00 (KES 58,500)</td></tr>
              <tr><td><strong>Card</strong></td><td>Single-Use (ends 3302)</td></tr>
              <tr><td><strong>Location</strong></td><td>Kyiv, Ukraine (IP based)</td></tr>
              <tr><td><strong>Time</strong></td><td>Today, 03:14 AM EAT</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, marginTop: 16 }}>Was this you?</p>
        <div className="d-flex flex-column gap-2">
          <button className={`${styles.btnPm} ${styles.btnPmD} w-100`} onClick={() => doAction('fraudAlertModal', 'Card has been permanently destroyed and new single-use card issued.', 'FRAUD-9912')}>
            No, destroy card and reissue
          </button>
          <button className={`${styles.btnPm} w-100`} onClick={() => doAction('fraudAlertModal', 'Transaction unblocked. You can retry the payment.', '')}>
            Yes, it was me (Unblock)
          </button>
        </div>
      </>)}
    </MBox>
  )

  const renderLimitAllocation = () => (
    <MBox id="limitAllocationModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-sliders text-warning me-2" />Allocate Credit Limits</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('limitAllocationModal', 'Limits updated successfully!', '')}>Save Changes</button>
        </>
      }
    >
      {renderActionBody('limitAllocationModal', <>
        <div className="row mb-4">
          <div className="col-6">
            <div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 700 }}>TOTAL CREDIT LINE</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 150,000</div>
          </div>
          <div className="col-6 text-end">
            <div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 700 }}>UNALLOCATED / AVAILABLE</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-accent)' }}>KES 42,000</div>
          </div>
          <div className="col-12 mt-2">
            <div className={styles.progress} style={{ height: '12px', borderRadius: '6px' }}>
              <div className={styles.progressBarFill} style={{ width: '72%', background: 'var(--pm-info)' }} />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Card Alias</th>
                <th>Limit Assigned</th>
                <th>New Limit (KES)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AWS Hosting</strong></td>
                <td>KES 20,000</td>
                <td><input type="number" className={styles.formControl} style={{ padding: '4px 8px', height: 'auto' }} defaultValue={20000} /></td>
              </tr>
              <tr>
                <td><strong>Marketing Ads</strong></td>
                <td>KES 50,000</td>
                <td><input type="number" className={styles.formControl} style={{ padding: '4px 8px', height: 'auto' }} defaultValue={60000} /></td>
              </tr>
              <tr>
                <td><strong>Software Subs</strong></td>
                <td>KES 15,000</td>
                <td><input type="number" className={styles.formControl} style={{ padding: '4px 8px', height: 'auto' }} defaultValue={15000} /></td>
              </tr>
              <tr>
                <td><strong>Travel Exp</strong></td>
                <td>KES 23,000</td>
                <td><input type="number" className={styles.formControl} style={{ padding: '4px 8px', height: 'auto' }} defaultValue={13000} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 12 }}>
          Total allocated cannot exceed KES 150,000. Changes apply instantly.
        </p>
      </>)}
    </MBox>
  )

  const renderFreezeCard = () => (
    <MBox id="freezeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-snow text-info me-2" />Freeze Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm}`} style={{ color: '#fff', background: 'var(--pm-info)', borderColor: 'var(--pm-info)' }}
            onClick={() => doAction('freezeCardModal', 'Card frozen successfully. All transactions are blocked.', '')}>Freeze Card</button>
        </>
      }
    >
      {renderActionBody('freezeCardModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Select Card to Freeze</label>
          <select className={styles.formControl}>
            <option>AWS Hosting (ends in 9173)</option>
            <option>Marketing Ads (ends in 7720)</option>
            <option>Software Subs (ends in 1104)</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Reason</label>
          <select className={styles.formControl}>
            <option>Temporarily disable spending</option>
            <option>Suspected unauthorized use</option>
            <option>Stop a specific subscription</option>
            <option>Card details compromised</option>
          </select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> Freezing a card blocks all new transactions immediately. Pre-authorized payments may still process. You can unfreeze at any time.
        </div>
      </>)}
    </MBox>
  )

  const renderGenerateCVV = () => (
    <MBox id="generateCVVModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-clockwise text-danger me-2" />Rotate Security Code (CVV)</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('generateCVVModal', 'CVV rotated. Your new CVV is 491.', 'ROT-20250627')}>Rotate Now</button>
        </>
      }
    >
      {renderActionBody('generateCVVModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
          <select className={styles.formControl}>
            <option>Marketing Ads (ends in 7720)</option>
            <option>AWS Hosting (ends in 9173)</option>
          </select>
        </div>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 12, color: 'var(--pm-danger)' }}>
          <i className="bi bi-exclamation-triangle me-1" /> Warning: Rotating the CVV will immediately invalidate the current 3-digit code. Any saved checkouts using the old CVV will fail until updated.
        </div>
<label className={styles.formLabel}>Confirm PIN</label>
        <div className={`${styles.pinRow} mb-2`}>
          {[0, 1, 2, 3].map((i) => (
            <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1}
              onChange={() => handlePinInput(i)} />
          ))}
        </div>
        </>)}
    </MBox>
  )

  const renderSubscriptionManage = () => (
    <MBox id="subscriptionManageModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-arrow-repeat text-purple me-2" style={{ color: 'var(--pm-purple)' }} />Subscription Manager</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('subscriptionManageModal', <>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Card Used</th>
                <th>Avg. Monthly</th>
                <th>Last Charged</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><div className="d-flex align-items-center gap-2">
                  <div className={styles.iconCircle} style={{ background: '#1473E6', color: '#fff' }}>A</div>
                  AWS
                </div></td>
                <td>AWS Hosting</td>
                <td>KES 2,400</td>
                <td>15th</td>
                <td><button className={`${styles.btnPm} ${styles.btnSm}`}>Details</button></td>
              </tr>
              <tr>
                <td><div className="d-flex align-items-center gap-2">
                  <div className={styles.iconCircle} style={{ background: '#E50914', color: '#fff' }}>N</div>
                  Netflix
                </div></td>
                <td>Software Subs</td>
                <td>KES 1,200</td>
                <td>20th</td>
                <td><button className={`${styles.btnPm} ${styles.btnSm}`}>Details</button></td>
              </tr>
              <tr>
                <td><div className="d-flex align-items-center gap-2">
                  <div className={styles.iconCircle} style={{ background: '#1DB954', color: '#fff' }}>S</div>
                  Spotify
                </div></td>
                <td>Software Subs</td>
                <td>KES 300</td>
                <td>1st</td>
                <td><button className={`${styles.btnPm} ${styles.btnSm}`}>Details</button></td>
              </tr>
              <tr>
                <td><div className="d-flex align-items-center gap-2">
                  <div className={styles.iconCircle} style={{ background: '#1473E6', color: '#fff' }}>F</div>
                  Facebook Ads
                </div></td>
                <td>Marketing Ads</td>
                <td>KES 15,400</td>
                <td>Weekly</td>
                <td><button className={`${styles.btnPm} ${styles.btnSm}`}>Details</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </>)}
    </MBox>
  )

  const renderAutoPay = () => (
    <MBox id="autoPayModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat text-success me-2" />Auto-Pay Credit Balance</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('autoPayModal', 'Auto-pay successfully configured.', '')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('autoPayModal', <>
        <div className="form-check form-switch mb-4">
          <input className="form-check-input" type="checkbox" defaultChecked id="autoPayToggle" />
          <label className="form-check-label" htmlFor="autoPayToggle">Enable Auto-Pay</label>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Payment Amount</label>
          <select className={styles.formControl}>
            <option>Full Statement Balance</option>
            <option>Minimum Payment Due</option>
            <option>Custom Fixed Amount</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Deduction Date</label>
          <select className={styles.formControl}>
            <option>On Due Date</option>
            <option>3 Days Before Due Date</option>
            <option>5 Days Before Due Date</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Pay From</label>
          <select className={styles.formControl}>
            <option>PayMo Wallet Balance</option>
            <option>Linked Equity Bank (***4521)</option>
          </select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
          Auto-pay ensures you never miss a payment and avoids late fees. If your balance is lower than the amount you owe, we will notify you 24 hours prior.
        </div>
      </>)}
    </MBox>
  )

  const renderTransactionHistory = () => (
    <MBox id="transactionHistoryModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-list-columns text-primary me-2" />Virtual Card Statements</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('transactionHistoryModal', <>
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <select className={styles.formControl} style={{ width: 'auto' }}>
            <option>All Virtual Cards</option>
            <option>AWS Hosting</option>
            <option>Marketing Ads</option>
          </select>
          <select className={styles.formControl} style={{ width: 'auto' }}>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
          <input type="text" className={styles.formControl} placeholder="Search merchant..." style={{ width: 200 }} />
        </div>
        <div className="table-responsive" style={{ maxHeight: 350, overflowY: 'auto' }}>
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Card</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>27 Jun</td>
                <td>Facebook Ads</td>
                <td>Marketing Ads</td>
                <td>KES 12,400</td>
                <td><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></td>
              </tr>
              <tr>
                <td>25 Jun</td>
                <td>Google Wksp</td>
                <td>Software Subs</td>
                <td>KES 2,100</td>
                <td><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></td>
              </tr>
              <tr>
                <td>22 Jun</td>
                <td>AWS EMEA</td>
                <td>AWS Hosting</td>
                <td>KES 2,400</td>
                <td><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></td>
              </tr>
              <tr>
                <td>18 Jun</td>
                <td>Uber *Trip</td>
                <td>Travel Exp</td>
                <td>KES 850</td>
                <td><span className={`${styles.badge} ${styles.badgeW}`}>Pending</span></td>
              </tr>
              <tr>
                <td>15 Jun</td>
                <td>Netflix</td>
                <td>Software Subs</td>
                <td>KES 1,200</td>
                <td><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></td>
              </tr>
              <tr>
                <td>10 Jun</td>
                <td>LinkedIn Ads</td>
                <td>Marketing Ads</td>
                <td>KES 3,000</td>
                <td><span className={`${styles.badge} ${styles.badgeD}`}>Declined</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </>)}
    </MBox>
  )

  const renderDisputeTransaction = () => (
    <MBox id="disputeTransactionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-exclamation text-accent me-2" style={{ color: 'var(--pm-accent)' }} />Dispute a Transaction</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('disputeTransactionModal', 'Dispute submitted. Tracking ID: CHB-92014.', 'CHB-92014')}>Submit Chargeback</button>
        </>
      }
    >
      {renderActionBody('disputeTransactionModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Select Transaction</label>
          <select className={styles.formControl}>
            <option>27 Jun - Facebook Ads - KES 12,400</option>
            <option>25 Jun - Google Workspace - KES 2,100</option>
            <option>18 Jun - Uber *Trip - KES 850</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Reason for Dispute</label>
          <select className={styles.formControl}>{DISPUTE_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Additional Details</label>
          <textarea className={styles.formControl} rows={3}>I cancelled this subscription on the merchant's website on June 20th, but I was still charged.</textarea>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> Disputes may take up to 14 days to resolve. A temporary credit may be issued while we investigate with Visa/Mastercard.
        </div>
      </>)}
    </MBox>
  )

  const renderMerchantAnalytics = () => (
    <MBox id="merchantAnalyticsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-pie-chart text-info me-2" />Merchant Spending Insights</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('merchantAnalyticsModal', <>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 border rounded">
              <div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 700 }}>TOP MERCHANT</div>
              <div className="d-flex align-items-center gap-3 mt-2">
                <div className={styles.iconCircle} style={{ background: '#1473E6', color: '#fff' }}>F</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Facebook Ads</div>
                  <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>KES 45,200 this year</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 border rounded">
              <div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 700 }}>MOST FREQUENT</div>
              <div className="d-flex align-items-center gap-3 mt-2">
                <div className={styles.iconCircle} style={{ background: '#000', color: '#fff' }}>U</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Uber Trips</div>
                  <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>24 transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h6 style={{ fontWeight: 700, marginTop: 24, marginBottom: 12 }}>Spending by Category</h6>
        <div className={styles.progress} style={{ height: 12, borderRadius: 6, marginBottom: 8 }}>
          <div className={styles.progressBarFill} style={{ width: '45%', background: 'var(--pm-primary)' }} title="Digital Ads" />
          <div className={styles.progressBarFill} style={{ width: '30%', background: 'var(--pm-info)' }} title="Software" />
          <div className={styles.progressBarFill} style={{ width: '15%', background: 'var(--pm-warning)' }} title="Travel" />
          <div className={styles.progressBarFill} style={{ width: '10%', background: 'var(--pm-accent)' }} title="Entertainment" />
        </div>
        <div className="d-flex flex-wrap gap-3" style={{ fontSize: 12 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pm-primary)', borderRadius: 2 }} /> Digital Ads</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pm-info)', borderRadius: 2 }} /> Software</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pm-warning)', borderRadius: 2 }} /> Travel</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pm-accent)', borderRadius: 2 }} /> Entertainment</span>
        </div>
      </>)}
    </MBox>
  )

  const renderStatements = () => (
    <MBox id="statementsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-pdf me-2"></i> Download Statements</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('statementsModal', 'Statement generated and downloaded to your device.', '')}>
            <i className="bi bi-download" /> Download
          </button>
        </>
      }
    >
      {renderActionBody('statementsModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Billing Cycle</label>
          <select className={styles.formControl}>
            <option>June 2025 (Current)</option>
            <option>May 2025</option>
            <option>April 2025</option>
            <option>Q2 2025 Summary</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Scope</label>
          <select className={styles.formControl}>
            <option>All Virtual Cards</option>
            <option>Specific Card</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Format</label>
          <select className={styles.formControl}>
            <option>PDF</option>
            <option>Excel CSV</option>
            <option>OFX (Accounting)</option>
          </select>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" />
          <label className="form-check-label" style={{ fontSize: 13 }}>Include merchant category codes (MCC)</label>
        </div>
      </>)}
    </MBox>
  )

  const renderLimitIncrease = () => (
    <MBox id="limitIncreaseModal" active={active} onClose={onClose}
      title={<><i className="bi bi-graph-up text-accent me-2" style={{ color: 'var(--pm-accent)' }} />Request Limit Increase</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('limitIncreaseModal', 'Limit increase application submitted! You will receive a decision within 5 minutes.', '')}>Submit Application</button>
        </>
      }
    >
      {renderActionBody('limitIncreaseModal', <>
        <div className="p-3 rounded mb-4" style={{ background: 'var(--pm-surface-2)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-muted)' }}>CURRENT CREDIT LIMIT</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 150,000</div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Requested Limit (KES)</label>
          <input type="number" className={styles.formControl} defaultValue={250000} />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Reason for Increase</label>
          <select className={styles.formControl}>
            <option>Higher ad spend requirements</option>
            <option>Upcoming travel</option>
            <option>Software licensing expansion</option>
            <option>Other</option>
          </select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Average Monthly Income (KES)</label>
          <input type="number" className={styles.formControl} defaultValue={450000} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
          Approval is subject to an instant soft credit check. This will not affect your credit score.
        </p>
      </>)}
    </MBox>
  )

  const renderDeleteCard = () => (
    <MBox id="deleteCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-trash text-danger me-2" />Cancel Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Keep Card</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('deleteCardModal', 'Card permanently deleted. Limit returned to pool.', '')}>
            Cancel Card
          </button>
        </>
      }
    >
      {renderActionBody('deleteCardModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          Are you sure you want to permanently cancel <strong>AWS Hosting (ends in 9173)</strong>?
        </p>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12, color: '#92400E' }}>
          <i className="bi bi-exclamation-triangle me-1" /> Any pending transactions or future subscriptions tied to this card will fail. You cannot undo this action.
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Reason</label>
          <select className={styles.formControl}>
            <option>No longer needed</option>
            <option>Compromised details</option>
            <option>Switching to a different card</option>
          </select>
        </div>
        <label className={styles.formLabel}>Confirm PIN</label>
        <div className={styles.pinRow}>
          {[0, 1, 2, 3].map((i) => (
            <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1}
              onChange={() => handlePinInput(i)} />
          ))}
        </div>
      </>)}
    </MBox>
  )

  const renderDeletedCards = () => (
    <MBox id="deletedCardsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-archive me-2"></i> Inactive & Deleted Cards</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('deletedCardsModal', <>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Card Alias</th>
                <th>Status</th>
                <th>Closed On</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Holiday Trip 2024</td>
                <td><span className={`${styles.badge} ${styles.badgeD}`}>Deleted</span></td>
                <td>15 Jan 2025</td>
              </tr>
              <tr>
                <td>One-time Purchase</td>
                <td><span className={`${styles.badge} ${styles.badgeW}`}>Used</span></td>
                <td>02 May 2025</td>
              </tr>
              <tr>
                <td>Adobe CC</td>
                <td><span className={`${styles.badge} ${styles.badgeD}`}>Deleted</span></td>
                <td>22 Mar 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 12 }}>
          Historical statements for deleted cards are still available in the Statements section.
        </p>
      </>)}
    </MBox>
  )

  const renderManageCard = () => (
    <MBox id="manageCardModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-gear me-2"></i> Manage Virtual Card</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={styles.pills}>
        <button className={`${styles.pill} ${styles.pillActive}`}>Settings</button>
        <button className={styles.pill}>Limits</button>
        <button className={styles.pill}>Danger Zone</button>
      </div>
      <div id="managev-settings" className={styles.tpanelActive}>
        <div className="mb-3"><label className={styles.formLabel}>Alias</label>
          <input className={styles.formControl} defaultValue="Marketing Ads" />
        </div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Card Active</label>
        </div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Lock to single merchant (Facebook Ads)</label>
        </div>
      </div>
      <div id="managev-limits" className={styles.tpanel}>
        <div className="mb-3"><label className={styles.formLabel}>Monthly Limit (KES)</label>
          <input type="number" className={styles.formControl} defaultValue={50000} />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Per-Transaction Limit (KES)</label>
          <input type="number" className={styles.formControl} defaultValue={15000} />
        </div>
      </div>
      <div id="managev-danger" className={styles.tpanel}>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>These actions cannot be undone.</p>
        <button className={`${styles.btnPm} ${styles.btnPmD} w-100 mb-2`} onClick={() => { onOpen('deleteCardModal'); onClose(); }}>
          Permanently Delete Card
        </button>
        <button className={`${styles.btnPm} w-100`} onClick={() => { onOpen('generateCVVModal'); onClose(); }}>
          Force CVV Rotation
        </button>
      </div>
    </MBox>
  )

  const renderAttention = () => (
    <MBox id="attentionModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-exclamation-circle text-warning me-2" />Attention Center</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('attentionModal', <>
        <div className={styles.statusRow}>
          <div><strong>Single-use card compromised</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Unauthorized merchant blocked</div>
          </div>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => { onOpen('fraudAlertModal'); onClose(); }}>Review</button>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Approaching limit</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>&apos;Marketing Ads&apos; card at 92% of limit</div>
          </div>
          <button className={styles.btnPm} onClick={() => { onOpen('limitAllocationModal'); onClose(); }}>Adjust</button>
        </div>
        <div className={styles.statusRow}>
          <div><strong>AWS Hosting expiring</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Expires in 5 days</div>
          </div>
          <button className={styles.btnPm} onClick={() => { onOpen('cardExpiryModal'); onClose(); }}>Renew</button>
        </div>
      </>)}
    </MBox>
  )

  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-bell me-2"></i> Card Notifications</>}
      footer={
        <><button className={`${styles.btnPm} ${styles.btnSm}`}>Mark All Read</button>
          <button className={styles.btnPm} onClick={onClose}>Close</button>
        </>
      }
    >
      {renderActionBody('notificationsModal', <>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <i className="bi bi-check-circle text-success me-1" /> <strong>Payment Cleared</strong> — KES 12,400 to Facebook Ads via Marketing Ads card.
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
          <i className="bi bi-shield-x text-danger me-1" /> <strong>Declined Transaction</strong> — KES 3,000 to LinkedIn Ads. Insufficient allocated limit.
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <i className="bi bi-exclamation-triangle text-warning me-1" /> <strong>Limit Warning</strong> — Software Subs card is at 90% of its monthly limit.
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-purple-soft)', fontSize: 13 }}>
          <i className="bi bi-stars text-purple me-1" style={{ color: 'var(--pm-purple)' }} /> <strong>Statement Ready</strong> — Your May 2025 virtual card statement is available.
        </div>
      </>)}
    </MBox>
  )

  const renderProfile = () => (
    <MBox id="profileModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-person-circle me-2"></i> Profile & Card Settings</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('profileModal', <>
        <div className="text-center">
          <div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Card Account ID: PM-991204</p>
          <div className="text-start mt-4">
            <h6 style={{ fontWeight: 700, fontSize: 13 }}>Global Controls</h6>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked />
              <label className="form-check-label" style={{ fontSize: 13 }}>Allow international transactions</label>
            </div>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" />
              <label className="form-check-label" style={{ fontSize: 13 }}>Strict IP Geofencing (Kenya only)</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" defaultChecked />
              <label className="form-check-label" style={{ fontSize: 13 }}>Push notifications for all spends</label>
            </div>
          </div>
        </div>
      </>)}
    </MBox>
  )

  const renderCardExpiry = () => (
    <MBox id="cardExpiryModal" active={active} onClose={onClose}
      title={<><i className="bi bi-calendar-x text-purple me-2" style={{ color: 'var(--pm-purple)' }} />Card Expiring Soon</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('cardExpiryModal', 'Card successfully renewed. Valid Thru is now 06/28.', '')}>
            Confirm Action
          </button>
        </>
      }
    >
      {renderActionBody('cardExpiryModal', <>
        <div className="text-center mb-4">
          <div className={styles.iconCircle} style={{ width: 56, height: 56, background: 'var(--pm-purple-soft)', color: 'var(--pm-purple)', fontSize: 24 }}>
            <i className="bi bi-credit-card" />
          </div>
          <h5 style={{ fontWeight: 700 }}>AWS Hosting</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Ends in 9173 · Expires 06/25</p>
        </div>
        <p style={{ fontSize: 13 }}>This virtual card is expiring in 5 days. Subscriptions tied to this card (like AWS) will fail if not updated.</p>
        <div className="p-3 border rounded mb-3">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="renew" defaultChecked id="ren1" />
            <label className="form-check-label" htmlFor="ren1" style={{ fontWeight: 700, fontSize: 13 }}>Renew Automatically</label>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Generates a new expiry date. PAN remains same, CVV changes.</div>
          </div>
        </div>
        <div className="p-3 border rounded mb-3">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="renew" id="ren2" />
            <label className="form-check-label" htmlFor="ren2" style={{ fontWeight: 700, fontSize: 13 }}>Close Card on Expiry</label>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Let it expire. Future charges will be declined.</div>
          </div>
        </div>
      </>)}
    </MBox>
  )

  return (
    <>
      {renderCreateCard()}
      {renderPayCreditBill()}
      {renderRevealCard()}
      {renderHealthCheck()}
      {renderFraudAlert()}
      {renderLimitAllocation()}
      {renderFreezeCard()}
      {renderGenerateCVV()}
      {renderSubscriptionManage()}
      {renderAutoPay()}
      {renderTransactionHistory()}
      {renderDisputeTransaction()}
      {renderMerchantAnalytics()}
      {renderStatements()}
      {renderLimitIncrease()}
      {renderDeleteCard()}
      {renderDeletedCards()}
      {renderManageCard()}
      {renderAttention()}
      {renderNotifications()}
      {renderProfile()}
      {renderCardExpiry()}
    </>
  )
}