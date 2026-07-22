import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/virtual-debit-cards.module.css'

interface ModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
  config: any
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

const PIN_LENGTH = 4

export default function VirtualDebitCardsModals({ active, onClose, onOpen, config }: ModalsProps) {
  const [results, setResults] = useState<Record<string, { msg: string; ref?: string }>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({})
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [selectedCardType, setSelectedCardType] = useState('')
  const [selectedCardColor, setSelectedCardColor] = useState('')
  const [topUpAmount, setTopUpAmount] = useState('5000')

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({})
      setBusy(null)
      setTabs({})
      setSelectedCardType('')
      setSelectedCardColor('')
      setTopUpAmount('5000')
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

  const pinRef = useRef<(HTMLInputElement | null)[]>([])
  const handlePinInput = (idx: number) => {
    const el = pinRef.current[idx]
    if (el && el.value.length === 1 && idx < PIN_LENGTH - 1) {
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

  const renderReceipt = (r: { msg: string; ref?: string }) => (
    <div className={styles.receipt}>
      <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => downloadFile('receipt.txt', r.msg)}>
          <i className="bi bi-download" /> Save
        </button>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>Continue</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  const renderCreateCard = () => (
    <MBox id="createCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-credit-card text-primary me-2" />Create New Virtual Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('createCardModal', 'Virtual Card Created! New card is ready for immediate use!', 'CARD-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>
          Confirm & Issue
        </button>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginBottom: 16 }}>Choose your card type, add a nickname, and customize security settings before issuing.</p>
      <div className="mb-3"><label className={styles.formLabel}>Card Type</label>
        <div className="row g-2">
          <div className="col-md-4">
            <div className="p-3 border rounded text-center" style={{ cursor: 'pointer', borderColor: selectedCardType === 'Global Shopping' ? 'var(--pm-primary)' : 'var(--pm-border)', background: selectedCardType === 'Global Shopping' ? 'var(--pm-accent-soft)' : '#fff' }} onClick={() => selectBox('Global Shopping')}>
              <i className="bi bi-globe d-block mb-2" style={{ fontSize: 24, color: 'var(--pm-primary)' }}></i>
              <strong>Global Shopping</strong>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Multi-use, reloadable, online purchases</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 border rounded text-center" style={{ cursor: 'pointer', borderColor: selectedCardType === 'Subscription Manager' ? 'var(--pm-primary)' : 'var(--pm-border)', background: selectedCardType === 'Subscription Manager' ? 'var(--pm-accent-soft)' : '#fff' }} onClick={() => selectBox('Subscription Manager')}>
              <i className="bi bi-arrow-repeat d-block mb-2" style={{ fontSize: 24, color: 'var(--pm-purple)' }}></i>
              <strong>Subscription Manager</strong>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Dedicated for recurring payments</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 border rounded text-center" style={{ cursor: 'pointer', borderColor: selectedCardType === 'Single-Use Burner' ? 'var(--pm-primary)' : 'var(--pm-border)', background: selectedCardType === 'Single-Use Burner' ? 'var(--pm-accent-soft)' : '#fff' }} onClick={() => selectBox('Single-Use Burner')}>
              <i className="bi bi-lightning-charge d-block mb-2" style={{ fontSize: 24, color: 'var(--pm-warning)' }}></i>
              <strong>Single-Use Burner</strong>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Auto-deletes after one transaction</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Card Nickname (Alias)</label><input className={styles.formControl} placeholder="e.g. Flight Bookings, Online Grocery" /></div>
    </MBox>
  )

  const renderViewCardDetails = () => (
    <MBox id="viewCardDetailsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-eye text-primary me-2" />Reveal Card Details</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Global Web Shopping — **3841</option>
          <option>Subscription Master — **9021</option>
          <option>AWS & Hosting — **4418</option>
        </select>
      </div>
      <div className={styles.cardWidget} style={{ maxWidth: 340, margin: '0 auto 20px' }}>
        <div className={styles.cwLogo}>PAYMO VISA</div>
        <div className={styles.cwNumber}>4532 8821 0092 3841</div>
        <div className={styles.cwRow}>
          <div><div className={styles.cwLabel}>Cardholder</div>JAMES KAMAU</div>
          <div><div className={styles.cwLabel}>Expires</div>12/28</div>
          <div><div className={styles.cwLabel}>CVV</div>882</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--pm-danger)', textAlign: 'center' }}>Details will auto-hide in 60 seconds. Do not share your full PAN or CVV.</p>
    </MBox>
  )

  const renderSingleUseCard = () => (
    <MBox id="singleUseCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-lightning-charge text-warning me-2" />Generate Single-Use Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('singleUseCardModal', 'Single-Use Card Generated! The card is active for 24 hours.', 'BRN-9921')}>Generate Card</button>
      }
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
        <i className="bi bi-exclamation-triangle me-1"></i> Single-use cards automatically destroy themselves after one approved transaction. Perfect for sketchy websites or free trials.
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Exact Purchase Amount (KES)</label><input type="number" className={styles.formControl} value="1500" /></div>
      <div className="mb-3"><label className={styles.formLabel}>Validity Period</label>
        <select className={styles.formControl}>
          <option>1 Hour</option>
          <option>24 Hours</option>
          <option>7 Days</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Funding Source</label>
        <select className={styles.formControl}>
          <option>PayMo Wallet</option>
          <option>M-Pesa</option>
        </select>
      </div>
    </MBox>
  )

  const renderTopUpCard = () => (
    <MBox id="topUpCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-plus-circle text-success me-2" />Fund Virtual Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmS}`} onClick={() => { downloadFile('fund-receipt.txt', 'Card funded successfully! AWS charge should clear on next retry.'); doAction('topUpCardModal', 'Card funded successfully! AWS charge should clear on next retry.', '') }}>Top Up KES 5,000</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>AWS & Hosting — **4418</option>
          <option>Global Shopping — **3841</option>
        </select>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}>
        <i className="bi bi-exclamation-triangle me-1"></i> AWS is trying to charge KES 4,500. This card has insufficient funds.
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Top-up Amount (KES)</label>
        <div className="pm-amount-chips mb-2">
          <span className="pm-amount-chip" onClick={() => pickChip('1000')}>1,000</span>
          <span className="pm-amount-chip" onClick={() => pickChip('3000')}>3,000</span>
          <span className="pm-amount-chip active" onClick={() => pickChip('5000')}>5,000</span>
          <span className="pm-amount-chip" onClick={() => pickChip('10000')}>10,000</span>
        </div>
        <input type="number" id="topAmt" className={styles.formControl} value={topUpAmount} />
      </div>
      <div className="mb-3"><label className={styles.formLabel}>From</label>
        <select className={styles.formControl}>
          <option>M-Pesa (0712***890)</option>
          <option>Main Wallet</option>
        </select>
      </div>
    </MBox>
  )

  const renderFreezeCard = () => (
    <MBox id="freezeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-snow text-info me-2" />Freeze Virtual Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmI}`} onClick={() => doAction('freezeCardModal', 'Card frozen successfully. All new charges will be blocked.', '')}>Freeze Card</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Card to Freeze</label>
        <select className={styles.formControl}>
          <option>Global Web Shopping — **3841</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Reason</label>
        <select className={styles.formControl}>
          <option>Temporary pause</option>
          <option>Suspected unauthorized use</option>
          <option>Card details leaked</option>
          <option>Other</option>
        </select>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
        Freezing is temporary. All new transactions will be declined. Existing pending authorizations may still clear. You can unfreeze at any time.
      </div>
    </MBox>
  )

  const renderDeleteCard = () => (
    <MBox id="deleteCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-trash text-danger me-2" />Terminate Virtual Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('deleteCardModal', 'Card terminated and securely destroyed. KES 0.00 returned to wallet.', '')}>Delete Card</button>
      }
    >
      <div className="text-center" style={{ marginBottom: 20 }}>
        <div className="pm-icon-circle mx-auto mb-3" style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}>
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h5 style={{ fontWeight: 700 }}>Permanent Action</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>You are about to permanently delete <strong>Global Web Shopping (**3841)</strong>.</p>
        <ul className="text-start mt-3" style={{ fontSize: 12, color: 'var(--pm-muted)' }}>
          <li>The card number will be destroyed.</li>
          <li>All linked subscriptions (Spotify) will fail.</li>
          <li>Any remaining dedicated balance will return to Main Wallet.</li>
        </ul>
        <div className="mt-3 text-start"><label className="pm-form-label">Type "TERMINATE" to confirm</label>
          <input type="text" className="pm-form-control" placeholder="TERMINATE" /></div>
      </div>
    </MBox>
  )

  const renderEditLimits = () => (
    <MBox id="editLimitsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-sliders text-primary me-2" />Adjust Card Limits</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('editLimitsModal', 'Limits updated successfully!', '')}>Save Limits</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Card</label>
        <select className={styles.formControl}>
          <option>Global Shopping — **3841</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Monthly Spending Cap (KES)</label>
        <input type="number" className={styles.formControl} value="50000" />
        <div className="mt-1" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Used so far: KES 12,400</div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Per-Transaction Limit (KES)</label>
        <input type="number" className={styles.formControl} value="20000" />
      </div>
      <div className="form-check form-switch mb-2">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Block international transactions</label>
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Block crypto/betting MCCs</label>
      </div>
    </MBox>
  )

  const renderMerchantLock = () => (
    <MBox id="merchantLockModal" active={active} onClose={onClose}
      title={<><i className="bi bi-lock text-primary me-2" />Merchant Lock</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('merchantLockModal', 'Card locked to NETFLIX.COM successfully.', '')}>Save Lock</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Card</label>
        <select className={styles.formControl}>
          <option>Subscription Master — **9021</option>
          <option>AWS & Hosting — **4418</option>
        </select>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label" style={{ fontWeight: 700 }}>Enable Merchant Lock</label>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Allowed Merchant Name</label>
        <input type="text" className={styles.formControl} value="NETFLIX.COM" />
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
        If the merchant uses multiple payment gateways with different billing names, locking may cause legitimate renewals to fail.
      </div>
    </MBox>
  )

  const renderRotateCvv = () => (
    <MBox id="rotateCvvModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-clockwise text-primary me-2" />Dynamic CVV Setup</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('rotateCvvModal', 'Dynamic CVV settings saved.', '')}>Save Settings</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Card</label>
        <select className={styles.formControl}>
          <option>Global Web Shopping — **3841</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Rotation Frequency</label>
        <select className={styles.formControl}>
          <option>Every 24 hours</option>
          <option>Every 7 days</option>
          <option>After every transaction</option>
          <option>Manual only</option>
        </select>
      </div>
      <div className="p-3 rounded text-center mb-3" style={{ background: 'var(--pm-surface-2)' }}>
        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>CURRENT CVV</div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 4 }}>882</div>
        <div style={{ fontSize: 10, color: 'var(--pm-danger)' }}>Expires in 14h 22m</div>
      </div>
      <button className={`${styles.btnPm} ${styles.btnPmOutline} w-100`}>
        <i className="bi bi-arrow-clockwise" /> Force rotate now
      </button>
    </MBox>
  )

  const renderCardStatement = () => (
    <MBox id="cardStatementModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-text text-primary me-2" />Card Statements</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Global Web Shopping — **3841</option>
          <option>Subscription Master — **9021</option>
          <option>AWS & Hosting — **4418</option>
        </select>
      </div>
      <div className="table-responsive">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>MCC</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Today, 10:15 AM</td>
              <td>AWS Web Services</td>
              <td>5712</td>
              <td>KES -4,500</td>
              <td><span className={`${styles.badge} ${styles.badgeDanger}`}>Declined</span></td>
            </tr>
            <tr>
              <td>Yesterday</td>
              <td>Netflix Subscription</td>
              <td>7812</td>
              <td>KES -1,400</td>
              <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span></td>
            </tr>
            <tr>
              <td>25 Jun</td>
              <td>AliExpress Shopping</td>
              <td>3528</td>
              <td>KES -6,240</td>
              <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span></td>
            </tr>
            <tr>
              <td>22 Jun</td>
              <td>Apple Services</td>
              <td>1520</td>
              <td>KES -400</td>
              <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className={`${styles.btnPm} ${styles.btnPmSm} mt-3`} onClick={() => downloadFile('statements.csv', 'Date,Description,MCC,Amount,Status\nToday,10:15 AM,AWS Web Services,-4500,Declined\nYesterday,Netflix Subscription,-1400,Approved\n25 Jun,AliExpress Shopping,-6240,Approved\n22 Jun,Apple Services,-400,Approved', 'text/csv')}>
        <i className="bi bi-download" /> Export CSV
      </button>
    </MBox>
  )

  const renderDisputeTx = () => (
    <MBox id="disputeTxModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-exclamation-triangle text-warning me-2" />Dispute a Transaction</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('disputeTxModal', 'Transaction dispute filed successfully!', 'DSP-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>Submit Dispute</button>
        </>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Transaction</label>
        <select className={styles.formControl}>
          <option>AWS Web Services — KES 4,500 — Declined (Insufficient Funds)</option>
          <option>Netflix — KES 1,400 — Declined (Card Frozen)</option>
          <option>AliExpress — KES 6,240 — Pending 3DS</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Dispute Reason</label>
        <select className={styles.formControl}>
          <option>Unauthorized transaction</option>
          <option>Duplicate charge</option>
          <option>Product not received</option>
          <option>Product defective</option>
          <option>Amount incorrect</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Additional Details</label>
        <textarea className={styles.formControl} rows={4} placeholder="Describe the issue..." />
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Attach Evidence (optional)</label>
        <input type="file" className={styles.formControl} />
      </div>
    </MBox>
  )

  const renderDeleteSubscription = () => (
    <MBox id="deleteSubModal" active={active} onClose={onClose}
      title={<><i className="bi bi-trash text-danger me-2" />Cancel Subscription</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('deleteSubModal', 'Subscription cancelled successfully! Please check for refunds.', 'CANCEL-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>Cancel Subscription</button>
      }
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
        <i className="bi bi-exclamation-triangle me-1"></i> Cancelling this subscription will affect all linked cards. Any prepaid amounts will be returned to the main wallet.
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Subscription</label>
        <select className={styles.formControl}>
          <option>Spotify — **3841</option>
          <option>Disney+ — **1145</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Cancellation Reason</label>
        <select className={styles.formControl}>
          <option>Unused for 60 days</option>
          <option>Too expensive</option>
          <option>Content issues</option>
          <option>Other</option>
        </select>
      </div>
    </MBox>
  )

  const renderAddSubscription = () => (
    <MBox id="addSubscriptionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-plus-lg text-success me-2" />Add Subscription</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('addSubscriptionModal', 'Subscription added successfully! Your card will be charged on next renewal.', 'SUBS-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>Add Subscription</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Subscription Name</label>
        <input type="text" className={styles.formControl} placeholder="Netflix, Disney+, etc." />
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Billing Frequency</label>
        <select className={styles.formControl}>
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Annually</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Expected Cost</label>
        <div className="input-group">
          <input type="number" className={styles.formControl} placeholder="1,400" />
          <select className={`${styles.formControl} w-auto`}>
            <option>KES</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Linked Card</label>
        <select className={styles.formControl}>
          <option>Global Shopping — **3841</option>
          <option>Subscription Master — **9021</option>
        </select>
      </div>
    </MBox>
  )

  const renderManageSingleSub = () => (
    <MBox id="manageSingleSubModal" active={active} onClose={onClose}
      title={<><i className="bi bi-gear text-info me-2" />Manage Subscription</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('manageSingleSubModal', 'Subscription updated successfully.', 'MG-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>Save Changes</button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Subscription</label>
        <select className={styles.formControl}>
          <option>Netflix — **9021</option>
          <option>Spotify — **3841</option>
        </select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Change Billing Date</label>
        <input type="date" className={styles.formControl} /></div>
      <div className="mb-3"><label className={styles.formLabel}>Change Amount (KES)</label>
        <input type="number" className={styles.formControl} placeholder="1,400" /></div>
      <div className="mb-3"><label className={styles.formLabel}>Auto-renew</label>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" defaultChecked />
          <label className="form-check-label">Enable auto-renewal</label>
        </div>
      </div>
    </MBox>
  )

  const modalContent: Record<string, ReactNode> = {
    createCardModal: renderCreateCard(),
    viewCardDetailsModal: renderViewCardDetails(),
    singleUseCardModal: renderSingleUseCard(),
    topUpCardModal: renderTopUpCard(),
    freezeCardModal: renderFreezeCard(),
    deleteCardModal: renderDeleteCard(),
    editLimitsModal: renderEditLimits(),
    merchantLockModal: renderMerchantLock(),
    rotateCvvModal: renderRotateCvv(),
    cardStatementModal: renderCardStatement(),
    disputeTxModal: renderDisputeTx(),
    deleteSubModal: renderDeleteSubscription(),
    addSubscriptionModal: renderAddSubscription(),
    manageSingleSubModal: renderManageSingleSub(),
  }

  const modalTitles: Record<string, string> = {
    createCardModal: 'Create New Virtual Card',
    viewCardDetailsModal: 'Reveal Card Details',
    singleUseCardModal: 'Generate Single-Use Card',
    topUpCardModal: 'Fund Virtual Card',
    freezeCardModal: 'Freeze Virtual Card',
    deleteCardModal: 'Terminate Virtual Card',
    editLimitsModal: 'Adjust Card Limits',
    merchantLockModal: 'Merchant Lock',
    rotateCvvModal: 'Dynamic CVV Setup',
    cardStatementModal: 'Card Statements',
    disputeTxModal: 'Dispute a Transaction',
    deleteSubModal: 'Cancel Subscription',
    addSubscriptionModal: 'Add Subscription',
    manageSingleSubModal: 'Manage Subscription',
  }

  if (!active) return null
  const content = modalContent[active]
  const title = modalTitles[active] || ''
  if (!content) return null

  return (
    <div id={active} className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {content}
          </div>
        </div>
      </div>
      <div className={styles.backdrop} onClick={onClose} />
    </div>
  )
}
