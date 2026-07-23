import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/invoicing-billing.module.css'

/* ============================================================================
   Invoicing & Billing — modal layer (legacy page 3.3, ~26 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state
     doAction(id,msg)   → `results` state; shows loading spinner, then receipt
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     cacheAndReset()    → useEffect on close resets flows + results + tabs
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

/* ---------- LEGACY BRIDGE: file download helper ---------- */
function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ---------- modal shell ---------- */
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

/* ---------- data arrays ---------- */
const CUSTOMERS = ['Global Exporters', 'Coast Logistics', 'Nairobi Distributors', 'Mombasa Traders', '+ Add New']
const INVOICE_ITEMS = ['IT Consulting', 'Software License', 'Cloud Hosting', 'Support & Maintenance', 'Custom Development']

/* LEGACY BRIDGE: flow definitions */
const FLOW_DEFS: Record<string, { labels: string[] }> = {
  invoice: { labels: ['Client', 'Items', 'Settings', 'Done'] },
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

export default function InvoicingBillingModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ invoice: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})

  /* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ invoice: 1 })
      setBusy(null)
      setTabs({})
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
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => downloadFile('receipt.txt', r.msg)}>
          <i className="bi bi-download" /> Save
        </button>
        <button className={cx(s.btnPm, s.btnSm)} onClick={onClose}>Done</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  /* ==========================================================================
     M1: New Invoice — 4-step multistep
     ======================================================================== */
  const invStep = flows.invoice ?? 1

  const renderNewInvoice = () => (
    <MBox id="newInvoiceModal" active={active} onClose={onClose}
      title={<><i className="bi bi-receipt text-primary me-2" />Create New Invoice</>}
      size="lg"
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          {invStep < 4 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('invoice', 4)}>
            {invStep === 3 ? 'Create Invoice' : 'Next'} <i className={`bi ${invStep === 3 ? 'bi-check2' : 'bi-arrow-right'}`} />
          </button>}
        </>
      }
    >
      <Stepper flowKey="invoice" current={invStep} />
      {invStep === 1 && (
        <div className={cx(s.fstep, invStep === 1 ? s.fstepActive : '')}>
          <div className="mb-3"><label className={s.formLabel}>Customer</label>
            <select className={s.formControl}>{CUSTOMERS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="mb-3"><label className={s.formLabel}>Due Date</label><input type="date" className={s.formControl} defaultValue="2025-07-15" /></div>
          <div className="mb-3"><label className={s.formLabel}>Notes</label><textarea className={s.formControl} rows={2} defaultValue="Payment due per contract terms" /></div>
        </div>
      )}
      {invStep === 2 && (
        <div className={cx(s.fstep, invStep === 2 ? s.fstepActive : '')}>
          <div className="mb-3"><label className={s.formLabel}>Item Description</label>
            <select className={s.formControl}>{INVOICE_ITEMS.map((it) => <option key={it}>{it}</option>)}</select>
          </div>
          <div className="mb-3"><label className={s.formLabel}>Quantity</label><input type="number" className={s.formControl} defaultValue="1" /></div>
          <div className="mb-3"><label className={s.formLabel}>Unit Price (KES)</label><input type="number" className={s.formControl} defaultValue="150000" /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
            <strong>Subtotal: KES 150,000</strong><br />
            VAT (16%): KES 24,000<br />
            <strong>Total: KES 174,000</strong>
          </div>
        </div>
      )}
      {invStep === 3 && (
        <div className={cx(s.fstep, invStep === 3 ? s.fstepActive : '')}>
          <div className="mb-3"><label className={s.formLabel}>Payment Method</label>
            <select className={s.formControl}><option>M-Pesa PayBill</option><option>Bank Transfer</option><option>Card</option><option>PesaLink</option></select>
          </div>
          <div className="form-check mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Send payment link via Email/SMS</label></div>
          <div className="form-check mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Apply withholding tax (5%)</label></div>
        </div>
      )}
      {invStep === 4 && renderActionBody('newInvoiceModal',
        <div className={s.receipt}>
          <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Invoice Created & Sent Successfully!</h5>
          <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: INV-2025-043</p>
        </div>
      )}
    </MBox>
  )

  /* ==========================================================================
     M2: New Payment Link
     ======================================================================== */
  const renderNewPaymentLink = () => (
    <MBox id="newPaymentLinkModal" active={active} onClose={onClose}
      title={<><i className="bi bi-link-45deg text-info me-2" />Create Payment Link</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('newPaymentLinkModal', 'Payment link created successfully!', 'LNK-2025-018')}>Generate Link</button>
        </>
      }
    >
      {renderActionBody('newPaymentLinkModal', <>
        <div className="mb-3"><label className={s.formLabel}>Customer</label>
          <select className={s.formControl}>{CUSTOMERS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input type="number" className={s.formControl} defaultValue="98000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Description</label><input type="text" className={s.formControl} defaultValue="Payment for services rendered" /></div>
        <div className="mb-3"><label className={s.formLabel}>Expiry</label><input type="date" className={s.formControl} defaultValue="2025-08-15" /></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
          <i className="bi bi-whatsapp" /> Send via WhatsApp for 2x faster pay.
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M3: New Subscription
     ======================================================================== */
  const renderNewSubscription = () => (
    <MBox id="newSubscriptionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat text-purple me-2" />Create Subscription</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('newSubscriptionModal', 'Subscription created successfully!', 'SUB-2025-099')}>Create</button>
        </>
      }
    >
      {renderActionBody('newSubscriptionModal', <>
        <div className="mb-3"><label className={s.formLabel}>Customer</label>
          <select className={s.formControl}>{CUSTOMERS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Plan</label>
          <select className={s.formControl}><option>Basic Plan — KES 2,500/mo</option><option>Pro Plan — KES 5,000/mo</option><option>Enterprise — KES 12,500/mo</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Start Date</label><input type="date" className={s.formControl} defaultValue="2025-07-01" /></div>
        <div className="mb-3"><label className={s.formLabel}>Payment Method</label>
          <select className={s.formControl}><option>M-Pesa Auto-Pay</option><option>Card Recurring</option><option>Bank Mandate</option></select>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M4: Invoice Detail (with Preview/Timeline tabs)
     ======================================================================== */
  const invDetailTab = tabs.invDetail ?? 'preview'

  const renderInvoiceDetail = () => (
    <MBox id="invoiceDetailModal" active={active} onClose={onClose}
      title={<><i className="bi bi-receipt me-2" />Invoice INV-2025-042 — Global Exporters</>}
      size="lg"
      footer={<button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('sendInvoiceModal', 'Invoice sent successfully!')}>Send Invoice</button>}
    >
      <div className={cx(s.pills, 'mb-3')}>
        <button className={`${s.pill} ${invDetailTab === 'preview' ? s.pillActive : ''}`} onClick={() => switchTab('invDetail', 'preview')}>Preview</button>
        <button className={`${s.pill} ${invDetailTab === 'timeline' ? s.pillActive : ''}`} onClick={() => switchTab('invDetail', 'timeline')}>Timeline</button>
      </div>
      {invDetailTab === 'preview' && (
        <div className={cx(s.tpanel, invDetailTab === 'preview' ? s.tpanelActive : '')}>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
            <div className="d-flex justify-content-between"><span>Invoice #</span><strong>INV-2025-042</strong></div>
            <div className="d-flex justify-content-between"><span>Customer</span><strong>Global Exporters</strong></div>
            <div className="d-flex justify-content-between"><span>Amount</span><strong>KES 145,000</strong></div>
            <div className="d-flex justify-content-between"><span>VAT</span><strong>KES 23,200</strong></div>
            <div className="d-flex justify-content-between"><span>Total</span><strong style={{ color: 'var(--pm-primary)' }}>KES 168,200</strong></div>
            <div className="d-flex justify-content-between"><span>Due Date</span><strong>15 Jun 2025</strong></div>
          </div>
          <span className={cx(s.badge, s.badgeD)}><i className="bi bi-exclamation-circle" /> Overdue 14 days</span>
          <div className="d-flex gap-2 mt-2">
            <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('recordPaymentModal')}><i className="bi bi-cash-coin" /> Record Payment</button>
            <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('reminderSettingsModal')}><i className="bi bi-bell" /> Remind</button>
          </div>
        </div>
      )}
      {invDetailTab === 'timeline' && (
        <div className={cx(s.tpanel, invDetailTab === 'timeline' ? s.tpanelActive : '')}>
          <div className={s.feedItem}><div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' }}><i className="bi bi-check" /></div><div><strong>Created</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>1 Jun 2025 by Sarah A.</div></div></div>
          <div className={s.feedItem}><div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-send" /></div><div><strong>Sent via Email</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>2 Jun 2025 · Opened 5 Jun</div></div></div>
          <div className={s.feedItem}><div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-clock" /></div><div><strong>Reminder Sent</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>15 Jun 2025 · No response</div></div></div>
          <div className={s.feedItem}><div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}><i className="bi bi-exclamation-triangle" /></div><div><strong>Overdue</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>29 Jun 2025 · 14 days past due</div></div></div>
        </div>
      )}
    </MBox>
  )

  /* ==========================================================================
     M5: Link Analytics
     ======================================================================== */
  const renderLinkAnalytics = () => (
    <MBox id="linkAnalyticsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bar-chart me-2" />Link Analytics</>}
      size="lg"
    >
      <div className="row g-3">
        <div className="col-md-4">
          <div className={cx(s.card, s.cardAccent)}><div className={s.sl} style={{ color: 'rgba(255,255,255,.7)' }}>TOTAL LINKS</div><div className={s.sv}>12</div></div>
        </div>
        <div className="col-md-4">
          <div className={s.card}><div className={s.sl}>CONVERSION RATE</div><div className={s.sv}>41.7%</div></div>
        </div>
        <div className="col-md-4">
          <div className={s.card}><div className={s.sl}>REVENUE VIA LINKS</div><div className={s.sv}>KES 340K</div></div>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M6: Reminder Settings
     ======================================================================== */
  const renderReminderSettings = () => (
    <MBox id="reminderSettingsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Reminder & Dunning Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reminderSettingsModal', 'Reminder settings saved!')}>Save Settings</button>
        </>
      }
    >
      {renderActionBody('reminderSettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>First Reminder (days before due)</label><input type="number" className={s.formControl} defaultValue="3" /></div>
        <div className="mb-3"><label className={s.formLabel}>Second Reminder (days after due)</label><input type="number" className={s.formControl} defaultValue="7" /></div>
        <div className="mb-3"><label className={s.formLabel}>Third Reminder (escalation)</label><input type="number" className={s.formControl} defaultValue="14" /></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-send via Email</label></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Auto-send via WhatsApp</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Escalate to manager after 30 days</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M7: Subscription Detail
     ======================================================================== */
  const renderSubscriptionDetail = () => (
    <MBox id="subscriptionDetailModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat me-2" />Subscription Detail</>}
      size="lg"
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="d-flex justify-content-between"><span>Customer</span><strong>Coast Logistics</strong></div>
        <div className="d-flex justify-content-between"><span>Plan</span><strong>Pro Plan — KES 5,000/mo</strong></div>
        <div className="d-flex justify-content-between"><span>Next Billing</span><strong>1 Jul 2025</strong></div>
        <div className="d-flex justify-content-between"><span>Status</span><span className={cx(s.badge, s.badgeS)}>Active</span></div>
      </div>
      <div className="d-flex gap-2">
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('subscriptionDetailModal', 'Subscription paused', 'SUB-PAUSE')}>Pause</button>
        <button className={cx(s.btnPm, s.btnSm, s.btnPmD)} onClick={() => doAction('subscriptionDetailModal', 'Subscription cancelled', 'SUB-CANCEL')}>Cancel</button>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M8: Record Payment
     ======================================================================== */
  const renderRecordPayment = () => (
    <MBox id="recordPaymentModal" active={active} onClose={onClose}
      title={<><i className="bi bi-cash-coin me-2" />Record Payment</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('recordPaymentModal', 'Payment recorded successfully!', 'PAY-2025-042')}>Record</button>
        </>
      }
    >
      {renderActionBody('recordPaymentModal', <>
        <div className="mb-3"><label className={s.formLabel}>Invoice</label>
          <select className={s.formControl}><option>INV-2025-042 — KES 145,000</option><option>INV-2025-040 — KES 98,500</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Amount Received (KES)</label><input type="number" className={s.formControl} defaultValue="145000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Payment Method</label>
          <select className={s.formControl}><option>M-Pesa</option><option>Bank Transfer</option><option>Card</option><option>Cash</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Reference</label><input type="text" className={s.formControl} defaultValue="M-PESA-REF-XXXX" /></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M9: Credit Note
     ======================================================================== */
  const renderCreditNote = () => (
    <MBox id="creditNoteModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-minus me-2" />Create Credit Note</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmD)} onClick={() => doAction('creditNoteModal', 'Credit note created', 'CN-2025-005')}>Create Credit Note</button>
        </>
      }
    >
      {renderActionBody('creditNoteModal', <>
        <div className="mb-3"><label className={s.formLabel}>Invoice</label>
          <select className={s.formControl}><option>INV-2025-042 — KES 145,000</option><option>INV-2025-041 — KES 140,000</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Credit Amount (KES)</label><input type="number" className={s.formControl} defaultValue="5000" /></div>
        <div className="mb-3"><label className={s.formLabel}>Reason</label><textarea className={s.formControl} rows={2} defaultValue="Partial discount applied per agreement" /></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M10: Bulk Reminders
     ======================================================================== */
  const renderBulkReminders = () => (
    <MBox id="bulkRemindersModal" active={active} onClose={onClose}
      title={<><i className="bi bi-envelope me-2" />Send Bulk Reminders</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('bulkRemindersModal', 'Reminders sent to 3 overdue invoices!', 'BULK-2025-01')}>Send All</button>
        </>
      }
    >
      {renderActionBody('bulkRemindersModal', <>
        <div style={{ fontSize: 13 }}>3 invoices overdue &bull; Total: KES 145,000</div>
        <div className={s.feedItem}><div><strong>INV-2025-042</strong> — Global Exporters · KES 145,000 · 14 days</div></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Include WhatsApp message</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Include escalation notice</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M11: Aging Report
     ======================================================================== */
  const renderAgingReport = () => (
    <MBox id="agingReportModal" active={active} onClose={onClose}
      title={<><i className="bi bi-graph-up me-2" />Aging Report</>}
      size="lg"
    >
      <div className="row g-3">
        <div className="col-md-4">
          <div style={{ background: 'var(--pm-accent-soft)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
            <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>0-30 Days</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#065F46' }}>KES 265K</div>
          </div>
        </div>
        <div className="col-md-4">
          <div style={{ background: 'var(--pm-warning-soft)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
            <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>31-60 Days</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#92400E' }}>KES 117K</div>
          </div>
        </div>
        <div className="col-md-4">
          <div style={{ background: 'var(--pm-danger-soft)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
            <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>61-90+ Days</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#991B1B' }}>KES 100K</div>
          </div>
        </div>
      </div>
      <button className={cx(s.btnPm, s.btnSm, 'mt-3 w-100')} onClick={() => onOpen('bulkRemindersModal')}><i className="bi bi-envelope" /> Send Reminders to All Overdue</button>
    </MBox>
  )

  /* ==========================================================================
     M12: Send Invoice
     ======================================================================== */
  const renderSendInvoice = () => (
    <MBox id="sendInvoiceModal" active={active} onClose={onClose}
      title={<><i className="bi bi-send me-2" />Send Invoice</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('sendInvoiceModal', 'Invoice sent successfully!', 'INV-SENT-042')}>Send</button>
        </>
      }
    >
      {renderActionBody('sendInvoiceModal', <>
        <div className="mb-3"><label className={s.formLabel}>Invoice</label>
          <select className={s.formControl}><option>INV-2025-042 — Global Exporters</option></select>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Send via</label>
          <select className={s.formControl}><option>Email</option><option>WhatsApp</option><option>SMS</option><option>All Channels</option></select>
        </div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Attach payment link</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M13: Customer Select
     ======================================================================== */
  const renderCustomerSelect = () => (
    <MBox id="customerSelectModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-lines-fill me-2" />Customer Directory</>}
      size="lg"
    >
      {CUSTOMERS.map((c) => (
        <div key={c} className={s.feedItem} style={{ cursor: 'pointer' }}>
          <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: 'var(--pm-primary)', color: '#fff', fontSize: 12 }}><i className="bi bi-person" /></div>
          <div><strong>{c}</strong></div>
        </div>
      ))}
      <button className={cx(s.btnPm, s.btnSm, 'mt-2 w-100')} onClick={() => onOpen('newInvoiceModal')}><i className="bi bi-plus" /> Add New Customer</button>
    </MBox>
  )

  /* ==========================================================================
     M14: Invoice Templates
     ======================================================================== */
  const renderInvoiceTemplates = () => (
    <MBox id="invoiceTemplatesModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-text me-2" />Invoice Templates</>}
    >
      <div className="row g-2">
        <div className="col-md-4">
          <div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => doAction('invoiceTemplatesModal', 'Template selected: Standard')}>
            <i className="bi bi-file-earmark-text" style={{ fontSize: 24, color: 'var(--pm-primary)' }} /><div><strong>Standard</strong></div>
          </div>
        </div>
        <div className="col-md-4">
          <div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => doAction('invoiceTemplatesModal', 'Template selected: Proforma')}>
            <i className="bi bi-file-earmark-plus" style={{ fontSize: 24, color: 'var(--pm-purple)' }} /><div><strong>Proforma</strong></div>
          </div>
        </div>
        <div className="col-md-4">
          <div className={cx(s.card, 'text-center')} style={{ cursor: 'pointer' }} onClick={() => doAction('invoiceTemplatesModal', 'Template selected: Recurring')}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: 24, color: 'var(--pm-accent)' }} /><div><strong>Recurring</strong></div>
          </div>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M15: Tax Settings
     ======================================================================== */
  const renderTaxSettings = () => (
    <MBox id="taxSettingsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-check me-2" />Tax Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('taxSettingsModal', 'Tax settings updated!')}>Save</button>
        </>
      }
    >
      {renderActionBody('taxSettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Default VAT Rate</label><input type="number" className={s.formControl} defaultValue="16" /></div>
        <div className="mb-3"><label className={s.formLabel}>Withholding Tax Rate</label><input type="number" className={s.formControl} defaultValue="5" /></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Enable KRA WHT API integration</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-calculate VAT on invoices</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M16: Dunning Settings
     ======================================================================== */
  const renderDunningSettings = () => (
    <MBox id="dunningSettingsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-triangle me-2" />Dunning Settings</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('dunningSettingsModal', 'Dunning settings saved!')}>Save</button>
        </>
      }
    >
      {renderActionBody('dunningSettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Escalation Level 1 (days)</label><input type="number" className={s.formControl} defaultValue="7" /></div>
        <div className="mb-3"><label className={s.formLabel}>Escalation Level 2 (days)</label><input type="number" className={s.formControl} defaultValue="14" /></div>
        <div className="mb-3"><label className={s.formLabel}>Final Notice (days)</label><input type="number" className={s.formControl} defaultValue="30" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Auto-suspend services after final notice</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M17: Suggestions Modal
     ======================================================================== */
  const renderSuggestions = () => (
    <MBox id="suggestionsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-stars me-2" />Smart Suggestions</>}
    >
      <div className={s.feedItem}>
        <div className={cx(s.iconCircle)} style={{ background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' }}><i className="bi bi-envelope" /></div>
        <div style={{ flex: 1 }}><strong>Enable Auto-Reminders</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>2 invoices due this week · Reduce DSO by 5 days</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('reminderSettingsModal')}>Setup</button>
      </div>
      <div className={s.feedItem}>
        <div className={cx(s.iconCircle)} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-percent" /></div>
        <div style={{ flex: 1 }}><strong>Offer Early Payment Discount</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>2% for 5-day payment → 15% better collections</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('invoiceDetailModal')}>Configure</button>
      </div>
      <div className={s.feedItem}>
        <div className={cx(s.iconCircle)} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-shield-check" /></div>
        <div style={{ flex: 1 }}><strong>Update Withholding Tax</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>New KRA WHT API integration available</div></div>
        <button className={cx(s.btnPm, s.btnSm)} onClick={() => onOpen('taxSettingsModal')}>Update</button>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M18: Export Billing
     ======================================================================== */
  const renderExportBilling = () => (
    <MBox id="exportBillingModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-spreadsheet me-2" />Export Billing Data</>}
      footer={
        <>
          <button className={s.btnPm} onClick={onClose}>Cancel</button>
          <button className={cx(s.btnPm, s.btnPmP)} onClick={() => { downloadFile('billing-export.csv', 'Invoice,Amount,Status\nINV-042,145000,Overdue\nINV-041,140000,Paid'); onClose() }}>Export</button>
        </>
      }
    >
      <div className="mb-3"><label className={s.formLabel}>Date Range</label>
        <select className={s.formControl}><option>This Month</option><option>Last Month</option><option>Last 3 Months</option><option>Custom</option></select>
      </div>
      <div className="mb-3"><label className={s.formLabel}>Format</label>
        <select className={s.formControl}><option>CSV</option><option>Excel</option><option>PDF</option></select>
      </div>
      <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Include subscription data</label></div>
      <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Include aging details</label></div>
    </MBox>
  )

  /* ==========================================================================
     M19: Health Check
     ======================================================================== */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-check text-success me-2" />Billing Health Check</>}
    >
      <div className={s.statusRow}><div><strong>KRA VAT API</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Connected · Sync rate 99.8%</div></div><span className={cx(s.badge, s.badgeS)}>Healthy</span></div>
      <div className={s.statusRow}><div><strong>M-Pesa Auto-Pay</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>98.2% success rate</div></div><span className={cx(s.badge, s.badgeS)}>Healthy</span></div>
      <div className={s.statusRow}><div><strong>Card Tokenization</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Stripe integration · 2 retries pending</div></div><span className={cx(s.badge, s.badgeW)}>Minor Issues</span></div>
    </MBox>
  )

  /* ==========================================================================
     M20: Notifications
     ======================================================================== */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Notifications (4)</>}
      footer={<><button className={cx(s.btnPm, s.btnSm)}>Mark All Read</button><button className={s.btnPm} onClick={onClose}>Close</button></>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>Payment Received!</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Coast Logistics paid KES 140,000 for INV-2025-041.</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>Link Viewed</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Global Exporters viewed their USD invoice.</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Overdue Alert</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>INV-2025-042 is 14 days overdue.</span></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>System Update</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>New KRA VAT API integration is live.</span></div>
    </MBox>
  )

  /* ==========================================================================
     M21: Profile Modal
     ======================================================================== */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-building me-2" />Business Profile</>}
    >
      <div className="text-center">
        <div className={s.avatar} style={{ width: 64, height: 64, fontSize: 24, background: 'linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)', margin: '0 auto 12px' }}>AP</div>
        <h5 style={{ fontWeight: 700 }}>Apex Retail Ltd.</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>KRA PIN: P051***49G · Nairobi, Kenya</p>
      </div>
      <div className="row g-2 mt-3" style={{ fontSize: 13 }}>
        <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Role</span><br /><strong>Finance Admin (Sarah A.)</strong></div></div>
        <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Active Users</span><br /><strong>4 Users</strong></div></div>
        <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Subscription</span><br /><strong>Enterprise</strong></div></div>
        <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Verification</span><br /><strong style={{ color: 'var(--pm-accent)' }}><i className="bi bi-shield-check" /> KYB Verified</strong></div></div>
      </div>
    </MBox>
  )

  return (
    <>
      {renderNewInvoice()}
      {renderNewPaymentLink()}
      {renderNewSubscription()}
      {renderInvoiceDetail()}
      {renderLinkAnalytics()}
      {renderReminderSettings()}
      {renderSubscriptionDetail()}
      {renderRecordPayment()}
      {renderCreditNote()}
      {renderBulkReminders()}
      {renderAgingReport()}
      {renderSendInvoice()}
      {renderCustomerSelect()}
      {renderInvoiceTemplates()}
      {renderTaxSettings()}
      {renderDunningSettings()}
      {renderSuggestions()}
      {renderExportBilling()}
      {renderHealthCheck()}
      {renderNotifications()}
      {renderProfile()}
    </>
  )
}
