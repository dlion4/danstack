import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/transfer-overview.module.css'

/* ============================================================================
   Transfer Overview Command Center — modal layer (legacy page 1.1, 23 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows loading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     selectBox(el)      → pill selector within a group
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

/* ---------- modal shell (Bootstrap look, React state driven) ---------- */
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

/* ---------- data arrays ---------- */
const BENEFICIARIES = [
  'Grace Kamau — 0712 345 890',
  'Landlord Properties — Bank 0012345678',
  'James Ochieng — 0722 111 222',
  'Equity Bank — 0012345678',
  'New Beneficiary',
]
const TRANSFER_TYPES = ['M-Pesa', 'Bank', 'Internal', 'International']
const FUNDING_SOURCES = ['PayMo Wallet (KES 24,500)', 'M-Pesa (0712***890)', 'Equity Bank ****4521']
const COUNTRIES = ['United Kingdom', 'United States', 'Germany']
const CURRENCIES = ['GBP', 'USD', 'EUR']
const PURPOSES = ['Family Support', 'Business Payment', 'Education']
const FUND_SOURCES = ['Salary', 'Savings', 'Business Income']
const FREQUENCIES = ['Monthly', 'Bi-weekly', 'Weekly', 'One-time']
const ISSUE_TYPES = ['Wrong amount sent', 'Transfer not received', 'Wrong beneficiary', 'Duplicate transfer']
const METHODS = ['M-Pesa', 'Bank Transfer', 'International']
const BEN_TYPES = ['M-Pesa', 'Bank Account', 'PayMo Wallet', 'International']

/* LEGACY BRIDGE: flow definitions */
const FLOW_DEFS: Record<string, { labels: string[] }> = {
  init: { labels: ['Beneficiary', 'Amount', 'Confirm', 'Done'] },
  bulk: { labels: ['Upload', 'Review', 'Pay', 'Done'] },
  sched: { labels: ['Details', 'Schedule', 'Confirm'] },
  intl: { labels: ['Recipient', 'Amount', 'Compliance', 'Done'] },
}

interface Result { msg: string; ref?: string }

function Pills({
  prefix, tabs, tabsState, onSwitch,
}: {
  prefix: string
  tabs: { key: string; label: string }[]
  tabsState: Record<string, string>
  onSwitch: (prefix: string, key: string) => void
}) {
  const current = tabsState[prefix] ?? tabs[0].key
  return (
    <div className={`${styles.pills} mb-3`}>
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`${styles.pill} ${current === t.key ? styles.pillActive : ''}`}
          onClick={() => onSwitch(prefix, t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

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

export default function TransferOverviewModals({ active, onClose, onOpen }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ init: 1, bulk: 1, sched: 1, intl: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [initType, setInitType] = useState('M-Pesa')

  /* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ init: 1, bulk: 1, sched: 1, intl: 1 })
      setBusy(null)
      setTabs({})
      setInitType('M-Pesa')
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* LEGACY BRIDGE: doAction(modalId, msg, ref) */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1500)
  }

  /* LEGACY BRIDGE: nextFlow(key, total) */
  const nextFlow = (key: string, total: number) => {
    const cur = flows[key] ?? 1
    if (cur >= total) { onClose(); return }
    setFlows((prev) => ({ ...prev, [key]: cur + 1 }))
  }

  const switchTab = (prefix: string, key: string) => {
    setTabs((prev) => ({ ...prev, [prefix]: key }))
  }

  /* PIN auto-focus */
  const pinRef = useRef<(HTMLInputElement | null)[]>([])
  const handlePinInput = (idx: number) => {
    const el = pinRef.current[idx]
    if (el && el.value.length === 1 && idx < 3) {
      pinRef.current[idx + 1]?.focus()
    }
  }

  /* Receipt renderer (legacy bridge) */
  const renderReceipt = (r: Result) => (
    <div className={styles.receipt}>
      <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => downloadFile('receipt.txt', r.msg)}>
          <i className="bi bi-download" /> Save
        </button>
        <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-share" /> Continue</button>
      </div>
    </div>
  )

  const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return defaultContent
  }

  /* ==========================================================================
     M1: Initiate Transfer (Multi-step, 4 steps)
     ======================================================================== */
  const renderInitiateTransfer = () => {
    const step = flows.init
    return (
      <MBox id="initiateTransferModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-send text-primary me-2" />Initiate Transfer</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('init', 4)}>
              {step >= 4 ? 'Done' : step === 3 ? <>Send Money <i className="bi bi-send" /></> : <>Continue <i className="bi bi-arrow-right" /></>}
            </button>
          </>
        }
      >
        <Stepper flowKey="init" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Beneficiary</h6>
            <div className="mb-3">
              <label className={styles.formLabel}>Search or Select</label>
              <select className={styles.formControl}>{BENEFICIARIES.map((b) => <option key={b}>{b}</option>)}</select>
            </div>
            <div className="mb-3">
              <label className={styles.formLabel}>Transfer Type</label>
              <div className={styles.pills}>
                {TRANSFER_TYPES.map((t) => (
                  <button key={t} className={`${styles.pill} ${initType === t ? styles.pillActive : ''}`}
                    onClick={() => setInitType(t)}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Amount & Details</h6>
            <div className="row g-3">
              <div className="col-md-6"><label className={styles.formLabel}>Amount (KES)</label><input className={styles.formControl} defaultValue="12500" /></div>
              <div className="col-md-6"><label className={styles.formLabel}>Reference / Note</label><input className={styles.formControl} defaultValue="Rent June 2025" /></div>
            </div>
            <div className="mt-3"><label className={styles.formLabel}>Funding Source</label>
              <select className={styles.formControl}>{FUNDING_SOURCES.map((f) => <option key={f}>{f}</option>)}</select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Review & Confirm</h6>
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">To</span><strong>Grace Kamau</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 12,500</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Fee</span><strong>KES 0</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Total</span><strong style={{ color: 'var(--pm-primary)' }}>KES 12,500</strong></div>
            </div>
            <label className={`${styles.formLabel} mt-3`}>Enter PIN</label>
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
              <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Transfer Successful!</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>KES 12,500 sent to Grace Kamau via M-Pesa.</p>
              <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Reference</span><strong>TRF-448291</strong></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Transaction ID</span><strong>MPESA-9K2M4P</strong></div>
                <div className="d-flex justify-content-between"><span className="text-muted">Time</span><strong>27 Jun 2025, 14:32</strong></div>
              </div>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M2: Bulk Transfer (Multi-step, 4 steps)
     ======================================================================== */
  const renderBulkTransfer = () => {
    const step = flows.bulk
    return (
      <MBox id="bulkTransferModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-collection text-info me-2" />Bulk Transfer</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('bulk', 4)}>
              {step >= 4 ? 'Done' : <>Continue <i className="bi bi-arrow-right" /></>}
            </button>
          </>
        }
      >
        <Stepper flowKey="bulk" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Upload Beneficiaries</h6>
            <div className="mb-3"><label className={styles.formLabel}>Upload CSV</label><input type="file" className={styles.formControl} /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> CSV format: Name, Phone/Bank, Amount, Reference
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Review List</h6>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead><tr><th>Name</th><th>Account</th><th>Amount</th></tr></thead>
                <tbody>
                  <tr><td>Grace Kamau</td><td>0712 345 890</td><td>KES 12,500</td></tr>
                  <tr><td>John Otieno</td><td>0722 111 222</td><td>KES 8,000</td></tr>
                  <tr><td>Landlord Ltd</td><td>Bank 0012345678</td><td>KES 45,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Confirm & Pay</h6>
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Total Beneficiaries</span><strong>3</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Total Amount</span><strong>KES 65,500</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Total Fee</span><strong>KES 0</strong></div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-check-all" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Bulk Transfer Complete</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>3 transfers processed successfully.</p>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M3: Schedule Transfer (Multi-step, 3 steps)
     ======================================================================== */
  const renderScheduleTransfer = () => {
    const step = flows.sched
    return (
      <MBox id="scheduleTransferModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-calendar-event text-success me-2" />Schedule Transfer</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('sched', 3)}>
              {step >= 3 ? 'Done' : <>Continue <i className="bi bi-arrow-right" /></>}
            </button>
          </>
        }
      >
        <Stepper flowKey="sched" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Beneficiary & Amount</h6>
            <div className="mb-3"><label className={styles.formLabel}>Beneficiary</label>
              <select className={styles.formControl}><option>Grace Kamau</option><option>Landlord Properties</option></select>
            </div>
            <div className="row g-3">
              <div className="col-md-6"><label className={styles.formLabel}>Amount</label><input className={styles.formControl} defaultValue="45000" /></div>
              <div className="col-md-6"><label className={styles.formLabel}>Frequency</label>
                <select className={styles.formControl}>{FREQUENCIES.map((f) => <option key={f}>{f}</option>)}</select>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Schedule Details</h6>
            <div className="row g-3">
              <div className="col-md-6"><label className={styles.formLabel}>Start Date</label><input type="date" className={styles.formControl} defaultValue="2025-07-01" /></div>
              <div className="col-md-6"><label className={styles.formLabel}>End Date (optional)</label><input type="date" className={styles.formControl} /></div>
            </div>
            <div className="mb-3 mt-3"><label className={styles.formLabel}>Funding Source</label>
              <select className={styles.formControl}><option>PayMo Wallet</option><option>M-Pesa</option><option>Bank</option></select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Schedule Created</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your recurring transfer has been scheduled successfully.</p>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M4: Manage Beneficiaries (pill tabs)
     ======================================================================== */
  const renderManageBeneficiaries = () => (
    <MBox id="manageBeneficiariesModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-person-plus text-warning me-2" />Manage Beneficiaries</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('addBeneficiaryModal')}>Add New Beneficiary</button>
        </>
      }
    >
      <Pills prefix="ben" tabs={[{ key: 'list', label: 'All' }, { key: 'favorites', label: 'Favorites' }, { key: 'recent', label: 'Recent' }]}
        tabsState={tabs} onSwitch={switchTab} />
      {(tabs.ben ?? 'list') === 'list' && (
        <div className={styles.tpanelActive}>
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead><tr><th>Name</th><th>Account</th><th>Type</th><th>Actions</th></tr></thead>
              <tbody>
                <tr><td>Grace Kamau</td><td>0712 345 890</td><td>M-Pesa</td>
                  <td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('editBeneficiaryModal')}>Edit</button>{' '}
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('initiateTransferModal')}>Send</button></td></tr>
                <tr><td>Landlord Properties</td><td>Bank 0012345678</td><td>Bank</td>
                  <td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('editBeneficiaryModal')}>Edit</button>{' '}
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('initiateTransferModal')}>Send</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tabs.ben === 'favorites' && (
        <div className={styles.tpanelActive}>
          <div className={styles.sr}><div><strong>Grace Kamau</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`}>Remove from Favorites</button></div>
          <div className={styles.sr}><div><strong>Landlord Properties</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`}>Remove from Favorites</button></div>
        </div>
      )}
      {tabs.ben === 'recent' && (
        <div className={styles.tpanelActive}>
          <div className={styles.sr}><div><strong>James Ochieng</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('addBeneficiaryModal')}>Add to Favorites</button></div>
        </div>
      )}
    </MBox>
  )

  /* ==========================================================================
     M5: Add Beneficiary
     ======================================================================== */
  const renderAddBeneficiary = () => (
    <MBox id="addBeneficiaryModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-plus text-success me-2" />Add Beneficiary</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('addBeneficiaryModal', 'Beneficiary added successfully!')}>Add Beneficiary</button>
        </>
      }
    >
      {renderActionBody('addBeneficiaryModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Name</label><input className={styles.formControl} defaultValue="Mary Wanjiku" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Phone / Account</label><input className={styles.formControl} defaultValue="0733 222 111" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Type</label>
          <select className={styles.formControl}>{BEN_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Add to Favorites</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M6: Transfer Detail
     ======================================================================== */
  const renderTransferDetail = () => (
    <MBox id="transferDetailModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-text me-2" />Transfer Details</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Reference</span><strong>TRF-448291</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 12,500</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">To</span><strong>Grace Kamau</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Method</span><strong>M-Pesa</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Status</span><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></div>
        <div className="d-flex justify-content-between"><span className="text-muted">Date</span><strong>27 Jun 2025, 14:32</strong></div>
      </div>
      <div className="d-flex justify-content-center" style={{ gap: 8 }}>
        <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-download" /> Receipt</button>
        <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-share" /> Share</button>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('disputeTransferModal')}>Report Issue</button>
      </div>
    </MBox>
  )

  /* ==========================================================================
     M7: Edit Schedule
     ======================================================================== */
  const renderEditSchedule = () => (
    <MBox id="editScheduleModal" active={active} onClose={onClose}
      title={<><i className="bi bi-pencil me-2" />Edit Schedule</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('editScheduleModal', 'Schedule updated successfully!')}>Save Changes</button>
        </>
      }
    >
      {renderActionBody('editScheduleModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Amount</label><input className={styles.formControl} defaultValue="45000" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Frequency</label>
          <select className={styles.formControl}><option>Monthly</option><option>Bi-weekly</option></select>
        </div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Active</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Notify before execution</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M8: International Transfer (Multi-step, 4 steps)
     ======================================================================== */
  const renderInternationalTransfer = () => {
    const step = flows.intl
    return (
      <MBox id="internationalTransferModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-globe text-danger me-2" />International Transfer</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('intl', 4)}>
              {step >= 4 ? 'Done' : step === 3 ? <>Confirm Transfer <i className="bi bi-globe" /></> : <>Continue <i className="bi bi-arrow-right" /></>}
            </button>
          </>
        }
      >
        <Stepper flowKey="intl" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Recipient Details</h6>
            <div className="mb-3"><label className={styles.formLabel}>Country</label>
              <select className={styles.formControl}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div className="mb-3"><label className={styles.formLabel}>Recipient Name</label><input className={styles.formControl} defaultValue="John Smith" /></div>
            <div className="mb-3"><label className={styles.formLabel}>Account / IBAN</label><input className={styles.formControl} defaultValue="GB29NWBK60161331926819" /></div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Amount & Fees</h6>
            <div className="row g-3">
              <div className="col-md-6"><label className={styles.formLabel}>Amount (KES)</label><input className={styles.formControl} defaultValue="150000" /></div>
              <div className="col-md-6"><label className={styles.formLabel}>Currency</label>
                <select className={styles.formControl}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Estimated fee: KES 2,850 | Exchange rate: 1 KES = 0.0058 GBP
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Compliance</h6>
            <div className="mb-3"><label className={styles.formLabel}>Purpose of Transfer</label>
              <select className={styles.formControl}>{PURPOSES.map((p) => <option key={p}>{p}</option>)}</select>
            </div>
            <div className="mb-3"><label className={styles.formLabel}>Source of Funds</label>
              <select className={styles.formControl}>{FUND_SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>International Transfer Initiated</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your transfer is being processed. Expected delivery: 1-3 business days.</p>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
     M9: QR Pay
     ======================================================================== */
  const renderQrPay = () => (
    <MBox id="qrPayModal" active={active} onClose={onClose}
      title={<><i className="bi bi-qr-code text-primary me-2" />QR Pay</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('qrPayModal', 'QR code generated! Recipient can scan to pay.')}>Generate QR</button>
        </>
      }
    >
      {renderActionBody('qrPayModal', <div className="text-center">
        <div className="p-4 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div style={{ width: 180, height: 180, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', margin: '0 auto', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <div><i className="bi bi-qr-code" style={{ fontSize: 80 }} /><div style={{ marginTop: 8, fontWeight: 700 }}>Scan to Pay</div></div>
          </div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label><input className={styles.formControl} defaultValue="2500" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Reference</label><input className={styles.formControl} defaultValue="Lunch payment" /></div>
      </div>)}
    </MBox>
  )

  /* ==========================================================================
     M10: Transfer Limits
     ======================================================================== */
  const renderTransferLimits = () => (
    <MBox id="transferLimitsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-sliders me-2" />Transfer Limits & Security</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('transferLimitsModal', 'Transfer limits updated successfully!')}>Save Limits</button>
        </>
      }
    >
      {renderActionBody('transferLimitsModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Daily Limit</label><input className={styles.formControl} defaultValue="500000" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Per Transaction Limit</label><input className={styles.formControl} defaultValue="200000" /></div>
        <div className="mb-3"><label className={styles.formLabel}>International Limit</label><input className={styles.formControl} defaultValue="100000" /></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Require PIN for transfers above KES 10,000</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Require 2FA for international transfers</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M11: Retry Transfer
     ======================================================================== */
  const renderRetryTransfer = () => (
    <MBox id="retryTransferModal" active={active} onClose={onClose}
      title={<><i className="bi bi-arrow-repeat text-warning me-2" />Retry Failed Transfer</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('retryTransferModal', 'Transfer retried successfully!')}>Retry Now</button>
        </>
      }
    >
      {renderActionBody('retryTransferModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>Failed Transfer Details</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Landlord Properties — KES 35,000</div>
          <div style={{ fontSize: 12, color: '#92400E' }}>Reason: Insufficient funds in M-Pesa</div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>New Funding Source</label>
          <select className={styles.formControl}><option>PayMo Wallet (KES 24,500)</option><option>Equity Bank ****4521</option></select>
        </div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     M12: Transfer Analytics (XL, pill tabs)
     ======================================================================== */
  const renderTransferAnalytics = () => (
    <MBox id="transferAnalyticsModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-bar-chart-line me-2" />Transfer Analytics</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <Pills prefix="an" tabs={[{ key: 'volume', label: 'Volume' }, { key: 'success', label: 'Success Rate' }, { key: 'recipients', label: 'Recipients' }]}
        tabsState={tabs} onSwitch={switchTab} />
      {(tabs.an ?? 'volume') === 'volume' && (
        <div className={styles.tpanelActive}>
          <div className={styles.chartBars} style={{ height: 120 }}>
            {[{ h: '60%', c: 'var(--pm-primary)', l: 'Jan' }, { h: '75%', c: 'var(--pm-primary)', l: 'Feb' }, { h: '90%', c: 'var(--pm-warning)', l: 'Mar' }, { h: '82%', c: 'var(--pm-primary)', l: 'Apr' }, { h: '100%', c: 'var(--pm-accent)', l: 'May' }, { h: '95%', c: 'var(--pm-primary)', l: 'Jun' }].map((b) => (
              <div key={b.l} className={styles.chartBar} style={{ height: b.h, background: b.c }}><span className={styles.barLabel}>{b.l}</span></div>
            ))}
          </div>
        </div>
      )}
      {tabs.an === 'success' && (
        <div className={styles.tpanelActive}>
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead><tr><th>Channel</th><th>Success Rate</th><th>Failed</th></tr></thead>
              <tbody>
                <tr><td>M-Pesa</td><td><span className={`${styles.badge} ${styles.badgeS}`}>99.4%</span></td><td>7</td></tr>
                <tr><td>Bank</td><td><span className={`${styles.badge} ${styles.badgeS}`}>97.8%</span></td><td>12</td></tr>
                <tr><td>International</td><td><span className={`${styles.badge} ${styles.badgeW}`}>94.1%</span></td><td>3</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tabs.an === 'recipients' && (
        <div className={styles.tpanelActive}>
          <div className={styles.sr}><div><strong>Grace Kamau</strong></div><strong>24 transfers</strong></div>
          <div className={styles.sr}><div><strong>Landlord Properties</strong></div><strong>6 transfers</strong></div>
        </div>
      )}
    </MBox>
  )

  /* ==========================================================================
     M13–M23: Simple modals
     ======================================================================== */
  const renderSecurityCheck = () => (
    <MBox id="securityCheckModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-check text-success me-2" />Transfer Security</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="row g-3">
        <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--pm-accent)' }}>96</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#047857' }}>SECURITY SCORE</div>
        </div></div>
        <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>2FA</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>ENABLED</div>
        </div></div>
        <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>14d</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#B45309' }}>LAST REVIEW</div>
        </div></div>
      </div>
    </MBox>
  )

  const renderTransferNotif = () => (
    <MBox id="transferNotifModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Transfer Notifications</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)' }}><strong>Scheduled transfer failed</strong><div style={{ fontSize: 11 }}>Landlord Properties — KES 35,000</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)' }}><strong>Large transfer pending approval</strong><div style={{ fontSize: 11 }}>KES 450,000 to James Ochieng</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)' }}><strong>Recurring payment executed</strong><div style={{ fontSize: 11 }}>Grace Kamau — KES 15,000</div></div>
    </MBox>
  )

  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-circle me-2" />Profile</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center">
        <div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
        <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.k@email.com · +254 712 345 890</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Transfers</span><br /><strong>1,248 this month</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Security</span><br /><strong style={{ color: 'var(--pm-accent)' }}>96/100</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  const renderAttention = () => (
    <MBox id="attentionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Attention Items</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={styles.sr}><div><strong>Scheduled transfer failed</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('retryTransferModal')}>Retry</button></div>
      <div className={styles.sr}><div><strong>3 recurring payments need funding source</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('manageBeneficiariesModal')}>Update</button></div>
      <div className={styles.sr}><div><strong>Large transfer pending approval</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('initiateTransferModal')}>Approve</button></div>
    </MBox>
  )

  const renderDispute = () => (
    <MBox id="disputeTransferModal" active={active} onClose={onClose}
      title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Report Transfer Issue</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('disputeTransferModal', 'Dispute submitted. Reference: DSP-88291', 'DSP-88291')}>Submit</button>
        </>
      }
    >
      {renderActionBody('disputeTransferModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Issue Type</label>
          <select className={styles.formControl}>{ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Description</label><textarea className={styles.formControl} rows={3} defaultValue="The transfer was sent to the wrong number." /></div>
      </>)}
    </MBox>
  )

  const renderEditBeneficiary = () => (
    <MBox id="editBeneficiaryModal" active={active} onClose={onClose}
      title={<><i className="bi bi-pencil me-2" />Edit Beneficiary</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('editBeneficiaryModal', 'Beneficiary updated successfully!')}>Save Changes</button>
        </>
      }
    >
      {renderActionBody('editBeneficiaryModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Name</label><input className={styles.formControl} defaultValue="Grace Kamau" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Phone / Account</label><input className={styles.formControl} defaultValue="0712 345 890" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Favorite</label></div>
      </>)}
    </MBox>
  )

  const renderFeeCalc = () => (
    <MBox id="feeCalcModal" active={active} onClose={onClose}
      title={<><i className="bi bi-calculator me-2" />Transfer Fee Calculator</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label><input className={styles.formControl} defaultValue="50000" /></div>
      <div className="mb-3"><label className={styles.formLabel}>Method</label>
        <select className={styles.formControl}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="d-flex justify-content-between"><span>Estimated Fee</span><strong>KES 35</strong></div>
      </div>
    </MBox>
  )

  const renderTransferHistory = () => (
    <MBox id="transferHistoryModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-clock-history me-2" />Full Transfer History</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="d-flex gap-2 mb-3">
        <select className={styles.formControl} style={{ width: 'auto' }}><option>All Methods</option><option>M-Pesa</option><option>Bank</option></select>
        <input className={styles.formControl} style={{ width: 200 }} placeholder="Search reference" />
      </div>
      <div className="table-responsive">
        <table className={styles.tbl}>
          <thead><tr><th>Date</th><th>Beneficiary</th><th>Amount</th><th>Method</th><th>Status</th><th>Ref</th></tr></thead>
          <tbody>
            <tr><td>27 Jun</td><td>Grace Kamau</td><td>KES 12,500</td><td>M-Pesa</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></td><td>TRF-448291</td></tr>
            <tr><td>26 Jun</td><td>Landlord</td><td>KES 45,000</td><td>Bank</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Success</span></td><td>TRF-447820</td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  const renderFavoritesQuick = () => (
    <MBox id="favoritesQuickModal" active={active} onClose={onClose}
      title={<><i className="bi bi-star me-2" />Quick Send to Favorite</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('favoritesQuickModal', 'Transfer sent successfully!')}>Send Now</button>
        </>
      }
    >
      {renderActionBody('favoritesQuickModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label><input className={styles.formControl} defaultValue="5000" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Note</label><input className={styles.formControl} defaultValue="Quick payment" /></div>
      </>)}
    </MBox>
  )

  const renderAddToFavorites = () => (
    <MBox id="addToFavoritesModal" active={active} onClose={onClose}
      title={<><i className="bi bi-star me-2" />Add to Favorites</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('addToFavoritesModal', 'Added to favorites!')}>Add</button>
        </>
      }
    >
      {renderActionBody('addToFavoritesModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Nickname</label><input className={styles.formControl} defaultValue="My Landlord" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Enable quick-send</label></div>
      </>)}
    </MBox>
  )

  /* ==========================================================================
     Render all modals
     ======================================================================== */
  return (
    <>
      {renderInitiateTransfer()}
      {renderBulkTransfer()}
      {renderScheduleTransfer()}
      {renderManageBeneficiaries()}
      {renderAddBeneficiary()}
      {renderTransferDetail()}
      {renderEditSchedule()}
      {renderInternationalTransfer()}
      {renderQrPay()}
      {renderTransferLimits()}
      {renderRetryTransfer()}
      {renderTransferAnalytics()}
      {renderSecurityCheck()}
      {renderTransferNotif()}
      {renderProfile()}
      {renderAttention()}
      {renderDispute()}
      {renderEditBeneficiary()}
      {renderFeeCalc()}
      {renderTransferHistory()}
      {renderFavoritesQuick()}
      {renderAddToFavorites()}
    </>
  )
}
