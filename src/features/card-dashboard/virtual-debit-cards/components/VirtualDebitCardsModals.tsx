import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/virtual-debit-cards.module.css'

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
          className={`${styles.modalContent} ${size === 'lg' ? styles.modalBoxLg : ''} ${size === 'xl' ? styles.modalBoxXl : ''}`}
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

const CARD_TYPES = ['Global Shopping', 'Subscription Manager', 'Single-Use Burner', 'Business / Travel']
const CURRENCIES = ['KES - Kenyan Shilling', 'USD - US Dollar', 'EUR - Euro', 'GBP - British Pound']
const FUNDING_SOURCES = ['PayMo Main Wallet (KES 120,500)', 'M-Pesa Direct', 'Equity Bank Linked']
const VALIDITY_PERIODS = ['1 Hour', '24 Hours', '7 Days']
const FREEZE_REASONS = ['Temporary pause', 'Suspected unauthorized use', 'Card details leaked', 'Other']
const ROTATION_FREQUENCIES = ['Every 24 hours', 'Every 7 days', 'After every transaction', 'Manual only']
const BILLING_CYCLES = ['Monthly', 'Annually', 'Weekly']
const CARDS_FOR_STATEMENT = ['All Cards', 'Global Shopping **3841', 'Sub Master **9021']
const STATEMENT_MONTHS = ['June 2025', 'May 2025', 'Custom Range']
const WITHDRAW_DESTINATIONS = ['Main PayMo Wallet', 'M-Pesa']
const RENEW_ACTIONS = ['Extend expiry date (keep PAN)', 'Issue new PAN (migrate subs)']
const DISPUTE_REASONS = ['I did not authorize this charge', 'Goods/services not received', 'Charged incorrect amount', 'Subscription was cancelled prior']
const SUBS_FOR_DISPUTE = ['AliExpress · KES 6,240 · 25 Jun', 'Apple Services · KES 400 · 22 Jun']
const CARDS_FOR_TOPUP = ['AWS & Hosting — **4418', 'Global Shopping — **3841']
const CARDS_FOR_FREEZE = ['Global Web Shopping — **3841']
const CARDS_FOR_LIMITS = ['Global Shopping — **3841']
const CARDS_FOR_MERCHANT_LOCK = ['Subscription Master — **9021', 'AWS & Hosting — **4418']
const CARDS_FOR_CVV = ['Global Web Shopping — **3841']
const CARDS_FOR_ALIAS = ['Global Web Shopping — **3841']


const FLOW_DEFS: Record<string, { labels: string[] }> = {
  createCard: { labels: ['Type', 'Limits', 'Confirm', 'Done'] },
}

interface Result { msg: string; ref?: string }

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
  const def = FLOW_DEFS[flowKey]
  if (!def) return null
  return (
    <div className={styles.stepper}>
      {def.labels.map((label, i) => {
        const stepNum = i + 1
        const done = stepNum < current
        const active = stepNum === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 80 }}>
            {i > 0 && <div className={styles.stepLine} />}
            <div className={`${styles.step} ${done ? styles.stepDone : ''} ${active ? styles.stepActive : ''}`}>
              <div className={styles.stepN}>
                {done ? <i className="bi bi-check" /> : stepNum}
              </div>
              <div className={styles.stepL}>{label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function VirtualDebitCardsModals({ active, onClose, onOpen }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ createCard: 1 })
  const [selectedCardType, setSelectedCardType] = useState('')
  const [selectedCardColor, setSelectedCardColor] = useState('vCardBg1')
  const [topUpAmount, setTopUpAmount] = useState('5000')
  const [cardRevealed, setCardRevealed] = useState(false)

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ createCard: 1 })
      setBusy(null)
      setSelectedCardType('')
      setSelectedCardColor('vCardBg1')
      setTopUpAmount('5000')
      setCardRevealed(false)
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

  const pinRef = useRef<(HTMLInputElement | null)[]>([])
  const handlePinInput = (idx: number) => {
    const el = pinRef.current[idx]
    if (el && el.value.length === 1 && idx < 3) {
      pinRef.current[idx + 1]?.focus()
    }
  }

  const selectBox = (cardType: string) => {
    setSelectedCardType(cardType)
  }

  const selectColor = (color: string) => {
    setSelectedCardColor(color)
  }

  const pickChip = (val: string) => {
    setTopUpAmount(val)
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

  const renderCreateCard = () => {
    const step = flows.createCard
    return (
      <MBox id="createCardModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-credit-card text-primary me-2" />Create New Virtual Card</>}
        footer={
          <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => {
              if (step === 3) {
                doAction('createCardModal', 'Virtual Card Issued! Your new card is ready for immediate online use.')
                return
              }
              nextFlow('createCard', 4)
            }}>
              {step >= 4 ? 'Done' : step === 3 ? <>Authorize <i className="bi bi-lock" /></> : <>Continue <i className="bi bi-arrow-right" /></>}
            </button>
          </>
        }
      >
        <Stepper flowKey="createCard" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Card Type & Purpose</h6>
            <div className="row g-3">
              {CARD_TYPES.map((type) => (
                <div key={type} className="col-md-6">
                  <div className="p-3 border rounded text-center"
                    style={{ cursor: 'pointer', ...(selectedCardType === type ? { borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' } : {}) }}
                    onClick={() => selectBox(type)}>
                    <i className={`bi ${type === 'Global Shopping' ? 'bi-globe' : type === 'Subscription Manager' ? 'bi-arrow-repeat' : type === 'Single-Use Burner' ? 'bi-lightning-charge' : 'bi-briefcase'} d-block mb-2`}
                      style={{ fontSize: 24, color: type === 'Global Shopping' ? 'var(--pm-primary)' : type === 'Subscription Manager' ? 'var(--pm-purple)' : type === 'Single-Use Burner' ? 'var(--pm-warning)' : 'var(--pm-info)' }} />
                    <strong>{type}</strong>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                      {type === 'Global Shopping' ? 'Multi-use, reloadable, online purchases' : type === 'Subscription Manager' ? 'Dedicated for recurring payments' : type === 'Single-Use Burner' ? 'Auto-deletes after one transaction' : 'Strict limits and MCC restrictions'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3"><label className={styles.formLabel}>Card Nickname (Alias)</label>
              <input className={styles.formControl} placeholder="e.g. Flight Bookings, Online Grocery" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Limits & Funding</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.formLabel}>Funding Source</label>
                <select className={styles.formControl}>{FUNDING_SOURCES.map((f) => <option key={f}>{f}</option>)}</select>
              </div>
              <div className="col-md-6">
                <label className={styles.formLabel}>Card Currency</label>
                <select className={styles.formControl}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
              <div className="col-md-6">
                <label className={styles.formLabel}>Monthly Spending Limit (KES)</label>
                <input type="number" className={styles.formControl} defaultValue="20000" />
              </div>
              <div className="col-md-6">
                <label className={styles.formLabel}>Per-Transaction Limit (KES)</label>
                <input type="number" className={styles.formControl} defaultValue="10000" />
              </div>
            </div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
              Funds are not locked; they are pulled from the funding source at the exact moment of transaction up to the specified limits.
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Appearance & Confirm</h6>
            <label className={styles.formLabel}>Select Card Color</label>
            <div className="d-flex gap-2 mb-3">
              {['vCardBg1', 'vCardBg2', 'vCardBg3', 'vCardBg4', 'vCardBg5'].map((color) => (
                <div key={color} className={styles[color]} style={{ width: 40, height: 40, borderRadius: 8, cursor: 'pointer', ...(selectedCardColor === color ? { border: '2px solid #fff', boxShadow: '0 0 0 2px var(--pm-primary)' } : {}) }}
                  onClick={() => selectColor(color)} />
              ))}
            </div>
            <div className="p-3 border rounded mb-3" style={{ fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span className="text-muted">Type</span><strong>{selectedCardType || 'Global Shopping'}</strong></div>
              <div className="d-flex justify-content-between mb-1"><span className="text-muted">Funding</span><strong>PayMo Main Wallet</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Limit</span><strong>KES 20,000 / month</strong></div>
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
        {step === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-credit-card" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Virtual Card Issued!</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your new card is ready for immediate online use.</p>
              <div className={`${styles.vCard} ${styles.vCardBg1} mx-auto mt-3`} style={{ maxWidth: 320, textAlign: 'left', cursor: 'default' }}>
                <div className={styles.vCardBadge}>ACTIVE</div>
                <div className={styles.vCardLogo}>PayMo</div>
                <div className={styles.vCardChip} />
                <div className={styles.vCardNumber}>4532 8821 0092 1145</div>
                <div className={styles.vCardDetails}>
                  <div>JAMES KAMAU</div>
                  <div>12/28</div>
                </div>
                <div className={styles.vCardNetwork}>VISA</div>
              </div>
              <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('viewCardDetailsModal')}>Reveal CVV</button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('merchantLockModal')}>Lock to Merchant</button>
              </div>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  const renderViewCardDetails = () => (
    <MBox id="viewCardDetailsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-eye me-2" />Reveal Card Details</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {!cardRevealed ? (
        <>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Enter your PayMo PIN to reveal the full card number and CVV for Global Shopping Card.</p>
          <div className={styles.pinRow} style={{ margin: '20px 0' }}>
            {[0, 1, 2, 3].map((i) => (
              <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1}
                onChange={() => handlePinInput(i)} />
            ))}
          </div>
          <button className={`${styles.btnPm} ${styles.btnPmP} w-100`} onClick={() => setCardRevealed(true)}>Authorize</button>
        </>
      ) : (
        <div className="text-center">
          <div className={`${styles.vCard} ${styles.vCardBg1} mx-auto`} style={{ maxWidth: 320, textAlign: 'left', cursor: 'default' }}>
            <div className={styles.vCardBadge}>ACTIVE</div>
            <div className={styles.vCardLogo}>PayMo</div>
            <div className={styles.vCardChip} />
            <div className={styles.vCardNumber}>4532 8821 0092 3841</div>
            <div className={styles.vCardDetails}>
              <div>JAMES KAMAU</div>
              <div>12/28</div>
            </div>
            <div className={styles.vCardNetwork}>VISA</div>
          </div>
          <div className="d-flex justify-content-center mt-3">
            <div className="text-center">
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>CVV</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace' }}>882</div>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2 justify-content-center">
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-clipboard" /> Copy PAN</button>
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-clipboard" /> Copy CVV</button>
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setCardRevealed(false)}>Hide</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--pm-danger)', marginTop: 16 }}>Details will auto-hide in 60 seconds.</p>
        </div>
      )}
    </MBox>
  )

  const renderSingleUseCard = () => (
    <MBox id="singleUseCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-lightning-charge text-warning me-2" />Generate Single-Use Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmW}`} onClick={() => doAction('singleUseCardModal', 'Single-Use Card Generated! The card is active for 24 hours.', 'BRN-9921')}>Generate Card</button>
        </>
      }
    >
      {renderActionBody('singleUseCardModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
          Single-use cards automatically destroy themselves after one approved transaction. Perfect for sketchy websites or free trials.
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Exact Purchase Amount (KES)</label>
          <input type="number" className={styles.formControl} defaultValue="1500" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Validity Period</label>
          <select className={styles.formControl}>{VALIDITY_PERIODS.map((v) => <option key={v}>{v}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Funding Source</label>
          <select className={styles.formControl}><option>PayMo Wallet</option><option>M-Pesa</option></select>
        </div>
      </>)}
    </MBox>
  )

  const renderTopUpCard = () => (
    <MBox id="topUpCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-plus-circle text-success me-2" />Fund Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmS}`} onClick={() => doAction('topUpCardModal', 'Card funded successfully! AWS charge should clear on next retry.', '')}>Top Up KES {topUpAmount}</button>
        </>
      }
    >
      {renderActionBody('topUpCardModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
          <select className={styles.formControl}>{CARDS_FOR_TOPUP.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}>
          <i className="bi bi-exclamation-triangle me-1" /> AWS is trying to charge KES 4,500. This card has insufficient funds.
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Top-up Amount (KES)</label>
          <div className={styles.amountChips}>
            {['1000', '3000', '5000', '10000'].map((val) => (
              <span key={val} className={`${styles.amountChip} ${topUpAmount === val ? styles.active : ''}`}
                onClick={() => pickChip(val)}>{parseInt(val).toLocaleString()}</span>
            ))}
          </div>
          <input type="number" className={styles.formControl} value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>From</label>
          <select className={styles.formControl}><option>M-Pesa (0712***890)</option><option>Main Wallet</option></select>
        </div>
      </>)}
    </MBox>
  )

  const renderFreezeCard = () => (
    <MBox id="freezeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-snow text-info me-2" />Freeze Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm}`} style={{ color: '#fff', background: 'var(--pm-info)', borderColor: 'var(--pm-info)' }}
            onClick={() => doAction('freezeCardModal', 'Card frozen successfully. All new charges will be blocked.', '')}>Freeze Card</button>
        </>
      }
    >
      {renderActionBody('freezeCardModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Card to Freeze</label>
          <select className={styles.formControl}>{CARDS_FOR_FREEZE.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Reason</label>
          <select className={styles.formControl}>{FREEZE_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          Freezing is temporary. All new transactions will be declined. Existing pending authorizations may still clear. You can unfreeze at any time.
        </div>
      </>)}
    </MBox>
  )

  const renderDeleteCard = () => (
    <MBox id="deleteCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-trash text-danger me-2" />Terminate Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('deleteCardModal', 'Card terminated and securely destroyed. KES 0.00 returned to wallet.', '')}>Delete Card</button>
        </>
      }
    >
      {renderActionBody('deleteCardModal', <>
        <div className="text-center">
          <div className={styles.iconCircle} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}>
            <i className="bi bi-exclamation-triangle" />
          </div>
          <h5 style={{ fontWeight: 700 }}>Permanent Action</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
            You are about to permanently delete <strong>Global Web Shopping (**3841)</strong>.
          </p>
          <ul className="text-start" style={{ fontSize: 12, color: 'var(--pm-muted)' }}>
            <li>The card number will be destroyed.</li>
            <li>All linked subscriptions (Spotify) will fail.</li>
            <li>Any remaining dedicated balance will return to Main Wallet.</li>
          </ul>
          <div className="mt-3 text-start"><label className={styles.formLabel}>Type "TERMINATE" to confirm</label>
            <input type="text" className={styles.formControl} placeholder="TERMINATE" />
          </div>
        </div>
      </>)}
    </MBox>
  )

  const renderEditLimits = () => (
    <MBox id="editLimitsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-sliders me-2" />Adjust Card Limits</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('editLimitsModal', 'Limits updated successfully!', '')}>Save Limits</button>
        </>
      }
    >
      {renderActionBody('editLimitsModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Card</label>
          <select className={styles.formControl}>{CARDS_FOR_LIMITS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Monthly Spending Cap (KES)</label>
          <input type="number" className={styles.formControl} defaultValue="50000" />
          <div className="mt-1" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Used so far: KES 12,400</div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Per-Transaction Limit (KES)</label>
          <input type="number" className={styles.formControl} defaultValue="20000" />
        </div>
        <div className="form-check form-switch mb-2">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Block international transactions</label>
        </div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Block crypto/betting MCCs</label>
        </div>
      </>)}
    </MBox>
  )

  const renderMerchantLock = () => (
    <MBox id="merchantLockModal" active={active} onClose={onClose}
      title={<><i className="bi bi-lock me-2" />Merchant Lock</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('merchantLockModal', 'Card locked to NETFLIX.COM successfully.', '')}>Save Lock</button>
        </>
      }
    >
      {renderActionBody('merchantLockModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          Locking a card ensures it can <strong>only</strong> be charged by the specified merchant. Any other charge attempts will be instantly declined.
        </p>
        <div className="mb-3"><label className={styles.formLabel}>Card</label>
          <select className={styles.formControl}>{CARDS_FOR_MERCHANT_LOCK.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label" style={{ fontWeight: 700 }}>Enable Merchant Lock</label>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Allowed Merchant Name</label>
          <input type="text" className={styles.formControl} defaultValue="NETFLIX.COM" />
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
          If the merchant uses multiple payment gateways with different billing names, locking may cause legitimate renewals to fail.
        </div>
      </>)}
    </MBox>
  )

  const renderRotateCvv = () => (
    <MBox id="rotateCvvModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-clockwise me-2" />Dynamic CVV Setup</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('rotateCvvModal', 'Dynamic CVV settings saved.', '')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('rotateCvvModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          Dynamic CVV automatically changes your card's 3-digit security code periodically, rendering stolen card details useless.
        </p>
        <div className="mb-3"><label className={styles.formLabel}>Card</label>
          <select className={styles.formControl}>{CARDS_FOR_CVV.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Rotation Frequency</label>
          <select className={styles.formControl}>{ROTATION_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}</select>
        </div>
        <div className="p-3 rounded text-center mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>CURRENT CVV</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 4 }}>882</div>
          <div style={{ fontSize: 10, color: 'var(--pm-danger)' }}>Expires in 14h 22m</div>
        </div>
        <button className={`${styles.btnPmOutline} w-100`}><i className="bi bi-arrow-clockwise" /> Force rotate now</button>
      </>)}
    </MBox>
  )

  const renderEditAlias = () => (
    <MBox id="editAliasModal" active={active} onClose={onClose}
      title={<><i className="bi bi-pencil me-2" />Edit Card Alias</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('editAliasModal', 'Card alias updated.', '')}>Save</button>
        </>
      }
    >
      {renderActionBody('editAliasModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Current Nickname</label>
          <input type="text" className={styles.formControl} defaultValue="Global Web Shopping" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Card Color</label>
          <div className="d-flex gap-2">
            {['vCardBg1', 'vCardBg2', 'vCardBg3'].map((color) => (
              <div key={color} className={styles[color]} style={{ width: 40, height: 40, borderRadius: 8, cursor: 'pointer', ...(selectedCardColor === color ? { border: '2px solid #fff', boxShadow: '0 0 0 2px var(--pm-primary)' } : {}) }}
                onClick={() => selectColor(color)} />
            ))}
          </div>
        </div>
      </>)}
    </MBox>
  )

  const renderSubManager = () => (
    <MBox id="subManagerModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-arrow-repeat me-2" />Subscription Hub</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('addSubscriptionModal')}>Add Known Subscription</button>
        </>
      }
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>MONTHLY OBLIGATION</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 14,500</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>ACTIVE SUBS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>8</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 rounded text-center" style={{ background: 'var(--pm-danger-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>DUE NEXT 7 DAYS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-danger)' }}>3</div>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className={styles.tbl}>
          <thead><tr><th>Service</th><th>Card</th><th>Cycle</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><strong>Netflix</strong></td><td>**9021</td><td>26th</td><td>KES 1,400</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('manageSingleSubModal')}>Edit</button></td></tr>
            <tr><td><strong>Apple Music</strong></td><td>**9021</td><td>22nd</td><td>KES 400</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('manageSingleSubModal')}>Edit</button></td></tr>
            <tr><td><strong>Spotify</strong></td><td>**3841</td><td>05th</td><td>KES 300</td><td><span className={`${styles.badge} ${styles.badgeW}`}>Unused</span></td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmDSoft}`} onClick={() => onOpen('cancelSubModal')}>Cancel</button></td></tr>
            <tr><td><strong>AWS Hosting</strong></td><td>**4418</td><td>28th</td><td>KES 4,500</td><td><span className={`${styles.badge} ${styles.badgeD}`}>Fund Req</span></td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => onOpen('topUpCardModal')}>Fund</button></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  const renderManageSingleSub = () => (
    <MBox id="manageSingleSubModal" active={active} onClose={onClose}
      title={<><i className="bi bi-play-btn-fill text-danger me-2" />Manage Netflix</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('manageSingleSubModal', 'Subscription settings updated.', '')}>Save</button>
        </>
      }
    >
      {renderActionBody('manageSingleSubModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Avg Amount</span><strong>KES 1,400</strong></div>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Billed On</span><strong>26th of Month</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Linked Card</span><strong>Sub Master (**9021)</strong></div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Change Linked Card</label>
          <select className={styles.formControl}><option>Sub Master (**9021)</option><option>Global Shopping (**3841)</option></select>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>
            Requires updating the card on the Netflix website. We'll generate a secure portal link.
          </div>
        </div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Allow auto-pay from this card</label>
        </div>
        <button className={`${styles.btnPm} ${styles.btnPmDSoft} w-100`}><i className="bi bi-slash-circle" /> Block Future Charges (Cancel Sub)</button>
      </>)}
    </MBox>
  )

  const renderCancelSub = () => (
    <MBox id="cancelSubModal" active={active} onClose={onClose}
      title={<><i className="bi bi-x-circle text-danger me-2" />Block Subscription</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('cancelSubModal', 'Spotify has been added to the blocklist. Future charges will be declined.', '')}>Block Charges</button>
        </>
      }
    >
      {renderActionBody('cancelSubModal', <>
        <div className="text-center">
          <div className={styles.iconCircle} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}>
            <i className="bi bi-slash-circle" />
          </div>
          <h5 style={{ fontWeight: 700 }}>Block Spotify Charges?</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
            PayMo will automatically decline any future charge attempts from <strong>Spotify</strong> on the card **3841.
          </p>
          <div className="p-3 rounded text-start" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
            Note: Blocking charges at the card level does not cancel your contract with the merchant.
            You may still owe them money. We recommend also cancelling on their website.
          </div>
        </div>
      </>)}
    </MBox>
  )

  const renderAddSubscription = () => (
    <MBox id="addSubscriptionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-plus me-2" />Track Manual Subscription</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('addSubscriptionModal', 'Subscription added to tracker.', '')}>Add Subscription</button>
        </>
      }
    >
      {renderActionBody('addSubscriptionModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>
          Add a subscription manually if PayMo hasn't auto-detected it yet to include it in your forecasting.
        </p>
        <div className="mb-3"><label className={styles.formLabel}>Service Name</label>
          <input className={styles.formControl} placeholder="e.g. Gym Membership, Notion" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label>
          <input type="number" className={styles.formControl} />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Billing Cycle</label>
          <select className={styles.formControl}>{BILLING_CYCLES.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Next Due Date</label>
          <input type="date" className={styles.formControl} />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Linked Card</label>
          <select className={styles.formControl}>{CARDS_FOR_ALIAS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
      </>)}
    </MBox>
  )

  const renderBulkCreate = () => (
    <MBox id="bulkCreateModal" active={active} onClose={onClose}
      title={<><i className="bi bi-files me-2" />Bulk Issue Virtual Cards</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('bulkCreateModal', '10 cards generated successfully. Download CSV for PAN details.', '')}>Generate Batch</button>
        </>
      }
    >
      {renderActionBody('bulkCreateModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          Issue multiple cards at once for ad-campaigns, employee allowances, or batch purchasing.
        </p>
        <div className="mb-3"><label className={styles.formLabel}>Number of Cards to Issue (Max 50)</label>
          <input type="number" className={styles.formControl} value="10" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Card Type</label>
          <select className={styles.formControl}><option>Single-Use Burner</option><option>Multi-use (Ad Spend)</option></select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Limit per Card (KES)</label>
          <input type="number" className={styles.formControl} value="5000" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Naming Pattern</label>
          <input type="text" className={styles.formControl} placeholder="e.g. FB-Ads-Campaign-[Seq]" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Funding Source</label>
          <select className={styles.formControl}><option>Main Wallet</option></select>
        </div>
      </>)}
    </MBox>
  )

  const renderDisputeTx = () => (
    <MBox id="disputeTxModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-triangle text-warning me-2" />Dispute Transaction</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmW}`} onClick={() => doAction('disputeTxModal', 'Dispute submitted to network. Card frozen. Case ID: CB-99102', 'CB-99102')}>Submit Dispute</button>
        </>
      }
    >
      {renderActionBody('disputeTxModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Transaction</label>
          <select className={styles.formControl}>{SUBS_FOR_DISPUTE.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Dispute Reason</label>
          <select className={styles.formControl}>{DISPUTE_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Details</label>
          <textarea className={styles.formControl} rows={3} />
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label text-danger" style={{ fontWeight: 700 }}>Freeze this card immediately</label>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
          Filing a false chargeback may result in account termination. Chargebacks take 7-14 days to resolve via VISA/Mastercard networks.
        </div>
      </>)}
    </MBox>
  )

  const renderReportFraud = () => (
    <MBox id="reportFraudModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-exclamation text-danger me-2" />Report Fraud (Panic)</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('reportFraudModal', 'ALL CARDS FROZEN. Our security team will contact you shortly.', '')}>FREEZE ALL CARDS</button>
        </>
      }
    >
      {renderActionBody('reportFraudModal', <>
        <div className="text-center">
          <div className={styles.iconCircle} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}>
            <i className="bi bi-shield-lock" />
          </div>
          <h5 style={{ fontWeight: 700 }}>Lock Down Card Center?</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
            This will instantly freeze <strong>ALL</strong> active virtual cards and physical cards linked to your account.
          </p>
          <div className="form-check text-start mt-4 mb-3">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label font-weight-bold">I confirm my account is compromised</label>
          </div>
        </div>
      </>)}
    </MBox>
  )

  const renderCardStatement = () => (
    <MBox id="cardStatementModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-file-earmark-text me-2" />Card Activity & Statements</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('cardStatementModal', 'Statement PDF downloaded.', '')}>
            <i className="bi bi-download" /> Export Data
          </button>
        </>
      }
    >
      {renderActionBody('cardStatementModal', <>
        <div className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
          <select className={styles.formControl} style={{ width: 'auto' }}>
            {CARDS_FOR_STATEMENT.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={styles.formControl} style={{ width: 'auto' }}>
            {STATEMENT_MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <input className={styles.formControl} style={{ width: 220 }} placeholder="Search merchant" />
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead><tr><th>Date</th><th>Card</th><th>Merchant</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>26 Jun</td><td>**4418</td><td>AWS Web Services</td><td>Software</td><td>KES 4,500</td><td><span className={`${styles.badge} ${styles.badgeD}`}>Declined</span></td></tr>
              <tr><td>25 Jun</td><td>**9021</td><td>Netflix</td><td>Entertainment</td><td>KES 1,400</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td></tr>
              <tr><td>25 Jun</td><td>**3841</td><td>AliExpress</td><td>Shopping</td><td>KES 6,240</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td></tr>
              <tr><td>22 Jun</td><td>**9021</td><td>Apple Services</td><td>Software</td><td>KES 400</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td></tr>
              <tr><td>15 Jun</td><td>**3841</td><td>Uber B.V.</td><td>Transport</td><td>KES 850</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td></tr>
            </tbody>
          </table>
        </div>
      </>)}
    </MBox>
  )

  const renderWithdrawCard = () => (
    <MBox id="withdrawCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-down-circle text-danger me-2" />Unload Card Funds</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('withdrawCardModal', 'Funds moved successfully.', '')}>Withdraw KES 12,000</button>
        </>
      }
    >
      {renderActionBody('withdrawCardModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          Move locked funds from a prepaid virtual card back to your main wallet or M-Pesa.
        </p>
        <div className="mb-3"><label className={styles.formLabel}>From Card</label>
          <select className={styles.formControl}><option>Prepaid Travel Card (**8812) — KES 12,000 avail</option></select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Amount</label>
          <input type="number" className={styles.formControl} value="12000" />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Destination</label>
          <select className={styles.formControl}>{WITHDRAW_DESTINATIONS.map((d) => <option key={d}>{d}</option>)}</select>
        </div>
      </>)}
    </MBox>
  )

  const renderRenewCard = () => (
    <MBox id="renewCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat me-2" />Renew Virtual Card</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('renewCardModal', 'Card expiry extended successfully.', '')}>Renew Card</button>
        </>
      }
    >
      {renderActionBody('renewCardModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          Global Shopping Card (**3841) expires in 15 days.
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Action</label>
          <select className={styles.formControl}>{RENEW_ACTIONS.map((a) => <option key={a}>{a}</option>)}</select>
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Notify Visa Token Service to auto-update merchants (Apple, Netflix, etc.)</label>
        </div>
      </>)}
    </MBox>
  )

  const renderAuth3DS = () => (
    <MBox id="auth3DSModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-check text-success me-2" />3D Secure Authentication</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Decline</button>
          <button className={`${styles.btnPm} ${styles.btnPmS}`} onClick={() => doAction('auth3DSModal', 'Purchase authorized! You can return to the merchant site.', '')}>Authorize Purchase</button>
        </>
      }
    >
      {renderActionBody('auth3DSModal', <>
        <div className="p-3 border rounded text-start mb-3" style={{ fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Merchant</span><strong>AliExpress.com</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 2,100</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Card</span><strong>**3841</strong></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Enter your PayMo PIN to authorize this online purchase.</p>
        <div className={`${styles.pinRow} mb-3`}>
          {[0, 1, 2, 3].map((i) => (
            <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1}
              onChange={() => handlePinInput(i)} />
          ))}
        </div>
      </>)}
    </MBox>
  )

  const renderCardSecurity = () => (
    <MBox id="cardSecurityModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-shield-lock me-2" />Global Card Security Hub</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('cardSecurityModal', 'Global security settings updated.', '')}>Save Global Rules</button>
        </>
      }
    >
      {renderActionBody('cardSecurityModal', <>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>SECURITY SCORE</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-accent)' }}>92/100</div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="p-3 rounded h-100" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
              <strong>Strong Posture:</strong> You use dynamic CVVs, have tight MCC locks on subscription cards, and 3D secure is mandatory.
              <br />
              <span className="text-danger">Recommendation:</span> Consider freezing the 'Spotify' card since it hasn't been used in 60 days.
            </div>
          </div>
        </div>
        <h6 style={{ fontWeight: 700, marginTop: 20 }}>Global Overrides (Applies to all cards)</h6>
        <div className={styles.statusRow}>
          <div><strong>Block Magstripe/Fallback</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>EMV Chip & Contactless only</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Block High-Risk MCCs</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Gambling, Crypto, Adult</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Mandatory 3D Secure</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Decline CNP transactions if merchant lacks 3DS</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /></div>
        </div>
      </>)}
    </MBox>
  )

  const renderCardAnalytics = () => (
    <MBox id="cardAnalyticsModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-graph-up me-2" />Card Spend Analytics</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      {renderActionBody('cardAnalyticsModal', <>
        <div className={styles.pills}>
          <button className={styles.pill}>By Category</button>
          <button className={styles.pill}>By Merchant</button>
          <button className={styles.pill}>By Card</button>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <h6 style={{ fontWeight: 700, fontSize: 13 }}>Spend by Category (This Month)</h6>
              <div className="d-flex justify-content-between mb-1 mt-3" style={{ fontSize: 12 }}>
                <span>Software & Cloud</span><strong>KES 16,500</strong>
              </div>
              <div className={`${styles.progress} mb-3`}>
                <div className={styles.progressBar} style={{ width: '40%', background: 'var(--pm-primary)' }} />
              </div>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                <span>Online Shopping</span><strong>KES 12,240</strong>
              </div>
              <div className={`${styles.progress} mb-3`}>
                <div className={styles.progressBar} style={{ width: '30%', background: 'var(--pm-warning)' }} />
              </div>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                <span>Entertainment</span><strong>KES 3,800</strong>
              </div>
              <div className={`${styles.progress} mb-3`}>
                <div className={styles.progressBar} style={{ width: '15%', background: 'var(--pm-accent)' }} />
              </div>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                <span>Transport</span><strong>KES 2,400</strong>
              </div>
              <div className={styles.progress}>
                <div className={styles.progressBar} style={{ width: '10%', background: 'var(--pm-info)' }} />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 rounded h-100" style={{ background: 'var(--pm-surface-2)' }}>
              <h6 style={{ fontWeight: 700, fontSize: 13 }}>Top Merchants</h6>
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead><tr><th>Merchant</th><th>Spend</th><th>Txns</th></tr></thead>
                  <tbody>
                    <tr><td>AWS Web Services</td><td>KES 12,000</td><td>3</td></tr>
                    <tr><td>AliExpress</td><td>KES 6,240</td><td>1</td></tr>
                    <tr><td>Netflix</td><td>KES 1,400</td><td>1</td></tr>
                    <tr><td>Uber</td><td>KES 850</td><td>2</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>)}
    </MBox>
  )

  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Alerts & Notifications</>}
      footer={
        <><button className={styles.btnPm} onClick={() => onOpen('notifPrefsModal')}>Preferences</button>
          <button className={styles.btnPm} onClick={onClose}>Close</button>
        </>
      }
    >
      {renderActionBody('notificationsModal', <>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
          <strong>Declined: Insufficient Funds</strong>
          <div style={{ fontSize: 11, color: '#7F1D1D' }}>AWS Web Services tried to charge KES 4,500 on card **4418.</div>
          <div className="mt-2">
            <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
              onClick={() => { onOpen('topUpCardModal'); onClose() }}>Fund Card</button>
          </div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
          <strong>3D Secure Authentication</strong>
          <div style={{ fontSize: 11, color: '#1E40AF' }}>AliExpress purchase of KES 2,100 requires your approval.</div>
          <div className="mt-2">
            <button className={`${styles.btnPm} ${styles.btnSm}`}
              onClick={() => { onOpen('auth3DSModal'); onClose() }}>Approve</button>
          </div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <strong>Purchase Approved</strong>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Netflix charged KES 1,400 on Sub Master (**9021).</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <strong>Card Expiring Soon</strong>
          <div style={{ fontSize: 11, color: '#92400E' }}>Global Shopping Card (**3841) expires in 15 days.</div>
        </div>
      </>)}
    </MBox>
  )

  const renderNotifPrefs = () => (
    <MBox id="notifPrefsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-gear me-2" />Card Notification Settings</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('notifPrefsModal', 'Notification settings saved.', '')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('notifPrefsModal', <>
        <div className={styles.statusRow}>
          <div><strong>All Transactions</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Push notification for every swipe/charge</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Declined Transactions</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Immediate alert if card fails</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Large Purchases</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Alert for amounts &gt; KES 10,000</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Subscription Reminders</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>3 days before recurring charge</div>
          </div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
        </div>
      </>)}
    </MBox>
  )

  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person me-2" />Profile</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center">
        <div className={styles.avatar} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-gradient-sunset)' }}>JK</div>
        <h5 style={{ fontWeight: 700, margin: '12px 0 2px' }}>James Kamau</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@email.com · +254 712 345 890</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6">
            <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <span className="text-muted">Virtual Cards</span>
              <br /><strong>5 Active</strong>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <span className="text-muted">Total Card Spend</span>
              <br /><strong>KES 48,200 this mo</strong>
            </div>
          </div>
        </div>
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
          <div><strong>Declined: Insufficient Funds (AWS)</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Card **4418 requires KES 4,500</div>
          </div>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
            onClick={() => { onOpen('topUpCardModal'); onClose() }}>Fund</button>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Card Expiring Soon</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Global Shopping Card expires in 15 days</div>
          </div>
          <button className={styles.btnPm} onClick={() => { onOpen('renewCardModal'); onClose() }}>Renew</button>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Netflix Sub Increased</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>+KES 300 detected this cycle</div>
          </div>
          <button className={styles.btnPm} onClick={() => { onOpen('subManagerModal'); onClose() }}>Review</button>
        </div>
        <div className={styles.statusRow}>
          <div><strong>Pending 3D Secure</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>AliExpress order KES 2,100</div>
          </div>
          <button className={styles.btnPm} onClick={() => { onOpen('auth3DSModal'); onClose() }}>Approve</button>
        </div>
      </>)}
    </MBox>
  )

  return (
    <>
      {renderCreateCard()}
      {renderViewCardDetails()}
      {renderSingleUseCard()}
      {renderTopUpCard()}
      {renderFreezeCard()}
      {renderDeleteCard()}
      {renderEditLimits()}
      {renderMerchantLock()}
      {renderRotateCvv()}
      {renderEditAlias()}
      {renderSubManager()}
      {renderManageSingleSub()}
      {renderCancelSub()}
      {renderAddSubscription()}
      {renderBulkCreate()}
      {renderDisputeTx()}
      {renderReportFraud()}
      {renderCardStatement()}
      {renderWithdrawCard()}
      {renderRenewCard()}
      {renderAuth3DS()}
      {renderCardSecurity()}
      {renderCardAnalytics()}
      {renderNotifications()}
      {renderNotifPrefs()}
      {renderProfile()}
      {renderAttention()}
    </>
  )
}