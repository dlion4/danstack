import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/support.module.css'

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

export default function SupportModals({ active, onClose, onOpen, config }: ModalsProps) {
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

  const renderChangePin = () => (
    <MBox id="changePinModal" active={active} onClose={onClose}
      title={<><i className="bi bi-key text-primary me-2" />Change Card PIN</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('changePinModal', 'PIN changed successfully!', 'PIN-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>
          Confirm Change
        </button>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginBottom: 16 }}>Enter your current PIN and choose a new 4-digit PIN for your card.</p>
      <div className="mb-3"><label className={styles.formLabel}>Current PIN</label>
        <div className={styles.pinRow}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={(e) => handlePinInput(i)} />)}
        </div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>New PIN</label>
        <div className={styles.pinRow}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={(e) => handlePinInput(i)} />)}
        </div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Confirm New PIN</label>
        <div className={styles.pinRow}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={(e) => handlePinInput(i)} />)}
        </div>
      </div>
    </MBox>
  )

  const renderFreezeCard = () => (
    <MBox id="freezeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-snow text-info me-2" />Freeze / Unfreeze Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('freezeCardModal', 'Card freeze status updated successfully!')}>
          Update Status
        </button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}><option>Primary Debit ****4521</option><option>Tap-Pay Card ****3392</option><option>Online Shopping ****1190</option></select>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Temporary Freeze</label><div className="text-muted" style={{ fontSize: 11 }}>Card is disabled but can be unfrozen instantly anytime.</div></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label fw-bold">Permanent Block (Lost/Stolen)</label><div className="text-muted" style={{ fontSize: 11 }}>Card is cancelled forever. A replacement must be ordered.</div></div>
      </div>
    </MBox>
  )

  const renderTroubleshoot = () => (
    <MBox id="troubleshootModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-wrench text-warning me-2" />Transaction Troubleshooter</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('troubleshootModal', 'Diagnosis complete. Recommendations generated.')}>
          Run Diagnosis
        </button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Failed Transaction</label>
        <select className={styles.formControl}><option>AWS Web Services — KES 4,500 — Declined (Insufficient Funds)</option><option>Netflix — KES 1,400 — Declined (Card Frozen)</option><option>AliExpress — KES 6,240 — Pending 3DS</option></select>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
        <strong>Common causes:</strong> Insufficient funds, card frozen, daily limit exceeded, 3DS authentication pending, MCC blocked.
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" defaultChecked /><label className="form-check-label">Insufficient funds</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">Card frozen / blocked</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">Daily limit exceeded</label></div>
        </div>
        <div className="col-md-6">
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">3DS authentication pending</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">MCC / merchant blocked</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">Other</label></div>
        </div>
      </div>
    </MBox>
  )

  const renderContactSupport = () => (
    <MBox id="contactSupportModal" active={active} onClose={onClose}
      title={<><i className="bi bi-headset text-primary me-2" />Contact Support</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('contactSupportModal', 'Support ticket created!', 'TKT-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>Start Chat</button></>
      }
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div className={styles.ub}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Live Chat</h4>
            <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Average response time: 45 seconds</p>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} style={{ width: '100%' }} onClick={() => doAction('contactSupportModal', 'Chat session started!')}>
              <i className="bi bi-chat-left-text" /> Start Chat
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className={styles.ub}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Call Hotline</h4>
            <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>24/7 card support hotline</p>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-primary)', marginBottom: 12 }}>+254 800 723 001</div>
            <button className={`${styles.btnPm}`} style={{ width: '100%' }} onClick={() => doAction('contactSupportModal', 'Call request submitted!')}>
              <i className="bi bi-telephone" /> Request Callback
            </button>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className={styles.ub}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Email Support</h4>
            <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Response within 24 hours</p>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pm-accent)', marginBottom: 12 }}>cards@paymo.co.ke</div>
            <button className={`${styles.btnPm} ${styles.btnPmA}`} style={{ width: '100%' }} onClick={() => doAction('contactSupportModal', 'Email support ticket created!')}>
              <i className="bi bi-envelope" /> Send Email
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className={styles.ub}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>WhatsApp</h4>
            <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Chat on WhatsApp</p>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#25D366', marginBottom: 12 }}>+254 712 000 001</div>
            <button className={`${styles.btnPm}`} style={{ width: '100%', background: '#25D366', borderColor: '#25D366', color: '#fff' }} onClick={() => doAction('contactSupportModal', 'WhatsApp chat initiated!')}>
              <i className="bi bi-whatsapp" /> Open WhatsApp
            </button>
          </div>
        </div>
      </div>
    </MBox>
  )

  const renderFaq = () => (
    <MBox id="faqModal" active={active} onClose={onClose}
      title={<><i className="bi bi-question-circle text-primary me-2" />FAQ by Card Type</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card Type</label>
        <select className={styles.formControl}><option>Visa Debit</option><option>Mastercard Debit</option><option>Virtual Credit</option><option>Prepaid</option><option>Business Debit</option></select>
      </div>
      <div className={styles.ub}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Frequently Asked Questions</h4>
        <div className={styles.sr}><div><strong>How do I activate my new card?</strong></div><i className="bi bi-chevron-down text-muted" /></div>
        <div className={styles.sr}><div><strong>What should I do if my card is lost or stolen?</strong></div><i className="bi bi-chevron-down text-muted" /></div>
        <div className={styles.sr}><div><strong>How can I increase my transaction limits?</strong></div><i className="bi bi-chevron-down text-muted" /></div>
        <div className={styles.sr}><div><strong>Why was my transaction declined?</strong></div><i className="bi bi-chevron-down text-muted" /></div>
        <div className={styles.sr}><div><strong>How do I set up contactless payments?</strong></div><i className="bi bi-chevron-down text-muted" /></div>
      </div>
    </MBox>
  )

  const renderCardStatus = () => (
    <MBox id="cardStatusModal" active={active} onClose={onClose}
      title={<><i className="bi bi-check-circle text-success me-2" />Card Status Checker</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Enter Card Number</label>
        <input className={styles.formControl} placeholder="**** **** **** ****" />
      </div>
      <div className={styles.ub}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Card Health</h4>
        <div className={styles.sr}><div><strong>Status</strong></div><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></div>
        <div className={styles.sr}><div><strong>3D Secure</strong></div><span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span></div>
        <div className={styles.sr}><div><strong>Contactless</strong></div><span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span></div>
        <div className={styles.sr}><div><strong>International</strong></div><span className={`${styles.badge} ${styles.badgeD}`}>Disabled</span></div>
      </div>
    </MBox>
  )

  const renderBinLookup = () => (
    <MBox id="binLookupModal" active={active} onClose={onClose}
      title={<><i className="bi bi-search text-info me-2" />BIN Lookup Tool</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Enter BIN / IIN</label>
        <input className={styles.formControl} placeholder="e.g. 411111" />
      </div>
      <div className={styles.ub}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Card Details</h4>
        <div className={styles.sr}><div><strong>Brand</strong></div><span>Visa</span></div>
        <div className={styles.sr}><div><strong>Type</strong></div><span>Debit</span></div>
        <div className={styles.sr}><div><strong>Level</strong></div><span>Platinum</span></div>
        <div className={styles.sr}><div><strong>Country</strong></div><span>Kenya</span></div>
        <div className={styles.sr}><div><strong>Bank</strong></div><span>Paymo Bank</span></div>
      </div>
    </MBox>
  )

  const renderReportLost = () => (
    <MBox id="reportLostModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-diamond text-danger me-2" />Report Lost / Stolen Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('reportLostModal', 'Card reported as lost/stolen!', 'LST-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>
          Report Card
        </button>
      }
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pm-danger)' }}>Immediate Action Required</div>
        <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Your card will be blocked immediately and a replacement will be ordered.</div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}><option>Primary Debit ****4521</option><option>Tap-Pay Card ****3392</option></select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Incident Type</label>
        <select className={styles.formControl}><option>Lost</option><option>Stolen</option><option>Suspected Fraud</option></select>
      </div>
    </MBox>
  )

  const renderRenewCard = () => (
    <MBox id="renewCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat text-primary me-2" />Renew / Replace Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('renewCardModal', 'Card renewal request submitted!', 'RNW-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>
          Submit Request
        </button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card to Renew</label>
        <select className={styles.formControl}><option>Visa Debit ****4521 (expires 07/25)</option><option>MC Debit ****3392 (expires 11/26)</option></select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Delivery Method</label>
        <select className={styles.formControl}><option>Branch Pickup</option><option>Express Courier (4 hours)</option><option>Standard Delivery (2-3 days)</option></select>
      </div>
    </MBox>
  )

  const renderEmergency = () => (
    <MBox id="emergencyModal" active={active} onClose={onClose}
      title={<><i className="bi bi-airplane text-warning me-2" />Travel Emergency Assistance</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('emergencyModal', 'Emergency assistance request sent!')}>
          Request Assistance
        </button>
      }
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>Traveling Abroad?</div>
        <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Get cash advances, emergency card replacement, and concierge services worldwide.</div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}><option>Primary Debit ****4521</option><option>Virtual Credit ****1190</option></select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Assistance Type</label>
        <select className={styles.formControl}><option>Cash Advance</option><option>Emergency Replacement</option><option>Card Block (Temporary)</option><option>Concierge Service</option></select>
      </div>
    </MBox>
  )

  const renderDispute = () => (
    <MBox id="disputeModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-shield-exclamation text-warning me-2" />File a Dispute</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('disputeModal', 'Dispute filed successfully!', 'DSP-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>Submit Dispute</button></>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Transaction</label>
        <select className={styles.formControl}><option>Amazon — KES 12,500 — 15 Jun 2025</option><option>Uber — KES 3,200 — 18 Jun 2025</option><option>Restaurant — KES 8,900 — 20 Jun 2025</option></select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Dispute Reason</label>
        <select className={styles.formControl}><option>Unauthorized transaction</option><option>Duplicate charge</option><option>Product not received</option><option>Product defective</option><option>Amount incorrect</option></select>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Additional Details</label>
        <textarea className={styles.formControl} rows={4} placeholder="Describe the issue..." />
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Attach Evidence (optional)</label>
        <input className={styles.formControl} type="file" />
      </div>
    </MBox>
  )

  const renderFeeCalc = () => (
    <MBox id="feeCalcModal" active={active} onClose={onClose}
      title={<><i className="bi bi-calculator text-primary me-2" />Fee Calculator</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label>
            <input className={styles.formControl} type="number" defaultValue="50000" /></div>
        </div>
        <div className="col-md-6">
          <div className="mb-3"><label className={styles.formLabel}>Transaction Type</label>
            <select className={styles.formControl}><option>Local Transfer</option><option>International</option><option>ATM Withdrawal</option></select></div>
        </div>
      </div>
      <div className={styles.ub}>
        <div className={styles.sr}><div><strong>Transfer Fee</strong></div><span>KES 0</span></div>
        <div className={styles.sr}><div><strong>Processing Fee</strong></div><span>KES 0</span></div>
        <div className={styles.sr}><div><strong>Total Fees</strong></div><span style={{ fontWeight: 700 }}>KES 0</span></div>
      </div>
    </MBox>
  )

  const renderBranchLocator = () => (
    <MBox id="branchLocatorModal" active={active} onClose={onClose}
      title={<><i className="bi bi-geo-alt text-primary me-2" />Branch Locator</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Search Location</label>
        <input className={styles.formControl} placeholder="Enter city or address" />
      </div>
      <div className={styles.ub}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Nearby Branches</h4>
        <div className={styles.sr}><div><strong>Westlands Branch</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Westlands Road, Nairobi</div></div><button className={`${styles.btnPm} ${styles.btnSm}`}>Directions</button></div>
        <div className={styles.sr}><div><strong>CBD Branch</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Moi Avenue, Nairobi</div></div><button className={`${styles.btnPm} ${styles.btnSm}`}>Directions</button></div>
        <div className={styles.sr}><div><strong>Kilimani Branch</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Kilimani Road, Nairobi</div></div><button className={`${styles.btnPm} ${styles.btnSm}`}>Directions</button></div>
      </div>
    </MBox>
  )

  const renderCaseExport = () => (
    <MBox id="caseExportModal" active={active} onClose={onClose}
      title={<><i className="bi bi-download text-primary me-2" />Export Cases</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => { downloadFile('open-cases.csv', 'Case ID,Type,Card,Status,Next Step\nCDP-44892,Chargeback,Visa ****4521,Awaiting evidence,Upload merchant receipt\nPR-11228,PIN Reset,MC ****3392,Processing,OTP verification pending', 'text/csv'); doAction('caseExportModal', 'Cases exported successfully!') }}>Export CSV</button></>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Export all open cases and dispute tracker data.</p>
      <div className="mb-3"><label className={styles.formLabel}>Format</label>
        <select className={styles.formControl}><option>CSV</option><option>PDF</option></select></div>
    </MBox>
  )

  const modalContent: Record<string, ReactNode> = {
    changePinModal: renderChangePin(),
    freezeCardModal: renderFreezeCard(),
    troubleshootModal: renderTroubleshoot(),
    contactSupportModal: renderContactSupport(),
    faqModal: renderFaq(),
    cardStatusModal: renderCardStatus(),
    binLookupModal: renderBinLookup(),
    reportLostModal: renderReportLost(),
    renewCardModal: renderRenewCard(),
    emergencyModal: renderEmergency(),
    disputeModal: renderDispute(),
    feeCalcModal: renderFeeCalc(),
    branchLocatorModal: renderBranchLocator(),
    caseExportModal: renderCaseExport(),
  }

  const modalTitles: Record<string, string> = {
    changePinModal: 'Change Card PIN',
    freezeCardModal: 'Freeze / Unfreeze Card',
    troubleshootModal: 'Transaction Troubleshooter',
    contactSupportModal: 'Contact Support',
    faqModal: 'FAQ by Card Type',
    cardStatusModal: 'Card Status Checker',
    binLookupModal: 'BIN Lookup Tool',
    reportLostModal: 'Report Lost / Stolen Card',
    renewCardModal: 'Renew / Replace Card',
    emergencyModal: 'Travel Emergency Assistance',
    disputeModal: 'File a Dispute',
    feeCalcModal: 'Fee Calculator',
    branchLocatorModal: 'Branch Locator',
    caseExportModal: 'Export Cases',
  }

  if (!active) return null
  const content = modalContent[active]
  const title = modalTitles[active] || ''
  if (!content) return null

  return (
    <div id={active} className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered">
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
