import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/settlement.module.css'

/* ============================================================================
   Settlement & Clearing — modal layer (legacy page 1.7, 25 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows legacy showLoading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     nf(el) PIN advance → pinRefs focus chain
     cacheAndReset()    → useEffect on close resets flows + results
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

/* ---------- LEGACY BRIDGE: file download helper (receipt "Save" button) ---------- */
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
          className={`${styles.modalBox} ${size === 'lg' ? styles.modalBoxLg : ''} ${
            size === 'xl' ? styles.modalBoxXl : ''
          }`}
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

const BANKS_DEBIT = ['Equity Bank', 'Co-operative Bank', 'KCB Bank', 'Absa Bank']
const BANKS_CREDIT = ['KCB Bank', 'Equity Bank', 'NCBA', 'Stanbic Bank']
const PURPOSES = ['Interbank transfer', 'Salary disbursement', 'Supplier payment', 'Government disbursement']
const PRIORITIES = ['Normal', 'Urgent (extra fee)', 'Same-day guaranteed']
const EXEC_TIMES = ['Immediate', 'Next 30 minutes', 'End of day', 'Scheduled']
const RETRY_REASONS = ['Network timeout', 'Insufficient liquidity', 'Technical error at receiving bank', 'Other']
const DISPUTE_REASONS = ['Amount mismatch', 'Wrong beneficiary', 'Duplicate settlement', 'Failed but debited']
const REPORT_TYPES = ['Daily Settlement Summary', 'Weekly Performance', 'Monthly Regulatory Return', 'Fee Analysis']
const REPORT_FORMATS = ['PDF', 'Excel', 'CSV']
const RTGS_REASONS = ['Government disbursement deadline', 'Salary payment deadline', 'Regulatory deadline']

type FlowKey = 'init' | 'recon' | 'disp'
interface Result {
  msg: string
  ref?: string
}

export default function SettlementModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<FlowKey, number>>({ init: 1, recon: 1, disp: 1 })
  const [channel, setChannel] = useState('RTGS')
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ init: 1, recon: 1, disp: 1 })
      setBusy(null)
      setChannel('RTGS')
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) ---------- */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1500)
  }

  /* ---------- LEGACY BRIDGE: nextFlow(key, total) ---------- */
  const flowTotals: Record<FlowKey, number> = { init: 4, recon: 4, disp: 3 }
  const nextFlow = (key: FlowKey) => {
    const total = flowTotals[key]
    const current = flows[key]
    if (current >= total) {
      onClose()
      return
    }
    if (current === total - 1) {
      setBusy(key)
      busyTimer.current = window.setTimeout(() => {
        setFlows((prev) => ({ ...prev, [key]: total }))
        setBusy(null)
      }, 1400)
      return
    }
    setFlows((prev) => ({ ...prev, [key]: current + 1 }))
  }

  /* ---------- LEGACY BRIDGE: nf(el) — PIN auto-advance ---------- */
  const nf = (i: number) => {
    const el = pinRefs.current[i]
    if (el && el.value.length === 1) pinRefs.current[i + 1]?.focus()
  }

  /* ---------- shared UI fragments ---------- */
  const stepper = (key: FlowKey) => {
    const total = flowTotals[key]
    const current = flows[key]
    return (
      <div className={styles.stepper}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          const cls = n < current ? styles.stepDone : n === current ? styles.stepActive : ''
          return (
            <div key={n} className={styles.step} style={{ display: 'contents' }}>
              <div className={`${styles.step} ${cls}`} style={{ display: 'flex' }}>
                <div className={styles.stepN}>{n < current ? <i className="bi bi-check" /> : n}</div>
                <div className={styles.stepL}>Step {n}</div>
              </div>
              {n < total && <div className={styles.stepLine} />}
            </div>
          )
        })}
      </div>
    )
  }

  /* ---------- receipt body swap (legacy doAction success state) ---------- */
  const receipt = (modalId: string, r: Result) => (
    <div className={styles.receipt}>
      <div className={styles.ri}>
        <i className="bi bi-check-lg" />
      </div>
      <h5 className={styles.receiptTitle}>{r.msg}</h5>
      {r.ref && (
        <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>
      )}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button
          className={`${styles.btnPm} ${styles.btnSm}`}
          onClick={() => downloadFile(`${modalId}-receipt.txt`, `${r.msg}${r.ref ? `\nReference: ${r.ref}` : ''}`)}
        >
          <i className="bi bi-download" /> Save
        </button>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>
          <i className="bi bi-share" /> Continue
        </button>
      </div>
    </div>
  )

  /* ---------- action modal helper: body/footer swap for doAction ---------- */
  const actionBody = (id: string, children: ReactNode) => (
    <>
      {busy === id && <BusyOverlay />}
      {results[id] ? receipt(id, results[id]) : children}
    </>
  )

  const actionFooter = (id: string, label: string, tone: 'btnPmP' | 'btnPmD', msg: string, ref?: string) =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          Cancel
        </button>
        <button className={`${styles.btnPm} ${styles[tone]}`} disabled={busy === id} onClick={() => doAction(id, msg, ref)}>
          {label}
        </button>
      </>
    )

  const flowFooter = (key: FlowKey) => (
    <>
      <button className={styles.btnPm} onClick={onClose}>
        Cancel
      </button>
      <button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === key} onClick={() => nextFlow(key)}>
        {flows[key] >= flowTotals[key] ? (
          'Done'
        ) : busy === key ? (
          <>
            <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> Processing
          </>
        ) : (
          <>
            Continue <i className="bi bi-arrow-right" />
          </>
        )}
      </button>
    </>
  )

  return (
    <>
      {/* ============ M1: Initiate Settlement (multi-step) ============ */}
      <MBox
        id="initiateSettlementModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-plus-circle me-2" style={{ color: 'var(--pm-primary-light)' }} />
            Initiate Settlement
          </>
        }
        footer={flowFooter('init')}
      >
        {stepper('init')}
        {busy === 'init' && <BusyOverlay />}
        {flows.init === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Parties &amp; Amount</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Debit Bank</label>
                <select className={styles.fc} defaultValue={BANKS_DEBIT[0]}>
                  {BANKS_DEBIT.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Credit Bank</label>
                <select className={styles.fc} defaultValue={BANKS_CREDIT[0]}>
                  {BANKS_CREDIT.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Amount (KES)</label>
                <input className={styles.fc} defaultValue="45000000" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Purpose</label>
                <select className={styles.fc} defaultValue={PURPOSES[0]}>
                  {PURPOSES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {flows.init === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Channel &amp; Timing</h6>
            <div className="mb-3">
              <label className={styles.fl}>Settlement Channel</label>
              <div className={styles.pills}>
                {['RTGS', 'PesaLink', 'EFT'].map((c) => (
                  <button
                    key={c}
                    className={`${styles.pill} ${channel === c ? styles.pillActive : ''}`}
                    onClick={() => setChannel(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Priority</label>
                <select className={styles.fc} defaultValue={PRIORITIES[0]}>
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Execution Time</label>
                <select className={styles.fc} defaultValue={EXEC_TIMES[0]}>
                  {EXEC_TIMES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {flows.init === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Confirmation &amp; Security</h6>
            <div className={`${styles.summaryBox} mb-3`}>
              {[
                ['Debit Bank', 'Equity Bank'],
                ['Credit Bank', 'KCB Bank'],
                ['Amount', 'KES 45,000,000'],
                ['Channel', channel],
                ['Fee', 'KES 2,250'],
              ].map(([k, v]) => (
                <div className="d-flex justify-content-between mb-1" key={k}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <label className={styles.fl}>Authorizer PIN</label>
            <div className={styles.pinRow}>
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    pinRefs.current[i] = el
                  }}
                  type="password"
                  maxLength={1}
                  className={styles.pinInput}
                  onInput={() => nf(i)}
                />
              ))}
            </div>
          </div>
        )}
        {flows.init >= 4 && (
          <div className={`${styles.receipt} ${styles.fstepActive}`}>
            <div className={styles.ri}>
              <i className="bi bi-check-lg" />
            </div>
            <h5 className={styles.receiptTitle}>Settlement Initiated</h5>
            <p className={styles.receiptSub}>
              Reference: <strong>SET-88424</strong> • Expected completion: 14:47 EAT
            </p>
          </div>
        )}
      </MBox>

      {/* ============ M2: Settlement Detail ============ */}
      <MBox
        id="settlementDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text me-2" />
            Settlement Details — SET-88421
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('retrySettlementModal')}>
              Retry if Failed
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-6">
            <div className={styles.summaryBox}>
              {[
                ['Reference', 'SET-88421'],
                ['From', 'Equity Bank'],
                ['To', 'KCB Bank'],
                ['Amount', 'KES 45,000,000'],
                ['Channel', 'RTGS'],
              ].map(([k, v]) => (
                <div className="d-flex justify-content-between mb-2" key={k}>
                  <span className={styles.mutedSmall}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.summaryBoxInfo}>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Status</span>
                <span className={`${styles.badge} ${styles.badgeI}`}>In Progress</span>
              </div>
              {[
                ['Initiated', '14:18 EAT'],
                ['ETA', '14:47 EAT'],
                ['Fee', 'KES 2,250'],
              ].map(([k, v]) => (
                <div className="d-flex justify-content-between mb-2" key={k}>
                  <span className={styles.mutedSmall}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <h6 style={{ fontWeight: 700 }}>Timeline</h6>
          {[
            ['14:18', 'Instruction received'],
            ['14:19', 'Validation passed'],
            ['14:22', 'Sent to CBK RTGS'],
            ['14:47 (expected)', 'Settlement complete'],
          ].map(([t, d]) => (
            <div className={styles.sr} key={t}>
              <div>
                <strong>{t}</strong> — {d}
              </div>
            </div>
          ))}
        </div>
      </MBox>

      {/* ============ M3: Retry Settlement ============ */}
      <MBox
        id="retrySettlementModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-repeat me-2" style={{ color: 'var(--pm-warning)' }} />
            Retry Failed Settlement
          </>
        }
        footer={actionFooter('retrySettlementModal', 'Retry Now', 'btnPmP', 'Retry initiated for 1 settlement. New reference: SET-88425', 'SET-88425')}
      >
        {actionBody(
          'retrySettlementModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Select Failed Settlements</label>
              {[
                { label: 'SET-88423 • KES 8.4M • Absa → NCBA', checked: true },
                { label: 'SET-88419 • KES 12.1M • Co-op → Equity', checked: false },
              ].map((c) => (
                <div className="form-check mb-2" key={c.label}>
                  <input className="form-check-input" type="checkbox" defaultChecked={c.checked} id={`retry-${c.label}`} />
                  <label className="form-check-label" htmlFor={`retry-${c.label}`}>
                    {c.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Retry Reason</label>
              <select className={styles.fc} defaultValue={RETRY_REASONS[0]}>
                {RETRY_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className={`${styles.summaryBoxWarn}`} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Retry will incur additional RTGS fee of KES 2,250 per transaction.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M4: Reconciliation Wizard (multi-step) ============ */}
      <MBox
        id="reconciliationWizardModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-list-check me-2" style={{ color: 'var(--pm-accent)' }} />
            Reconciliation Wizard
          </>
        }
        footer={flowFooter('recon')}
      >
        {stepper('recon')}
        {busy === 'recon' && <BusyOverlay />}
        {flows.recon === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Batches</h6>
            {[
              { label: 'BAT-21092 • Equity Clearing • KES 184.2M', checked: true },
              { label: 'BAT-21093 • KCB Clearing • KES 67.8M', checked: true },
              { label: 'BAT-21094 • Co-op Clearing • KES 41.5M', checked: false },
            ].map((c) => (
              <div className="form-check mb-2" key={c.label}>
                <input className="form-check-input" type="checkbox" defaultChecked={c.checked} id={`recon-${c.label}`} />
                <label className="form-check-label" htmlFor={`recon-${c.label}`}>
                  {c.label}
                </label>
              </div>
            ))}
          </div>
        )}
        {flows.recon === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Run Matching</h6>
            <div className={`${styles.summaryBoxInfo} mb-3`}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd' }}>Matching Engine Running...</div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div className="progress-bar" style={{ width: '78%' }} />
              </div>
            </div>
            <div className={styles.sr}>
              <div>
                <strong>Matched</strong>
              </div>
              <strong>1,142 / 1,189</strong>
            </div>
            <div className={styles.sr}>
              <div>
                <strong>Exceptions</strong>
              </div>
              <strong>47 items</strong>
            </div>
          </div>
        )}
        {flows.recon === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Resolve Exceptions</h6>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Variance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TRX-99182</td>
                    <td>KES 12,400</td>
                    <td>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('disputeModal')}>
                        Create Dispute
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>TRX-99183</td>
                    <td>KES 8,900</td>
                    <td>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('partialSettlementModal')}>
                        Partial Accept
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {flows.recon >= 4 && (
          <div className={`${styles.receipt} ${styles.fstepActive}`}>
            <div className={styles.ri}>
              <i className="bi bi-check-lg" />
            </div>
            <h5 className={styles.receiptTitle}>Reconciliation Complete</h5>
            <p className={styles.receiptSub}>1,142 matched • 47 exceptions resolved • Report generated.</p>
          </div>
        )}
      </MBox>

      {/* ============ M5: Dispute (multi-step) ============ */}
      <MBox
        id="disputeModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-triangle me-2" style={{ color: 'var(--pm-warning)' }} />
            Raise Settlement Dispute
          </>
        }
        footer={flowFooter('disp')}
      >
        {stepper('disp')}
        {flows.disp === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Details</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Settlement Ref</label>
                <input className={styles.fc} defaultValue="SET-88419" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Dispute Amount</label>
                <input className={styles.fc} defaultValue="2700000" />
              </div>
              <div className="col-12">
                <label className={styles.fl}>Reason</label>
                <select className={styles.fc} defaultValue={DISPUTE_REASONS[0]}>
                  {DISPUTE_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {flows.disp === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Evidence</h6>
            <div className="mb-3">
              <label className={styles.fl}>Description</label>
              <textarea
                className={styles.fc}
                rows={3}
                defaultValue="Expected credit of KES 67.8M but only KES 65.1M received. Difference of KES 2.7M."
              />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Upload Evidence</label>
              <input type="file" className={styles.fc} />
            </div>
          </div>
        )}
        {flows.disp >= 3 && (
          <div className={`${styles.receipt} ${styles.fstepActive}`}>
            <div className={styles.ri}>
              <i className="bi bi-check-lg" />
            </div>
            <h5 className={styles.receiptTitle}>Dispute Filed</h5>
            <p className={styles.receiptSub}>Case #SET-44901 created. Counterparty notified.</p>
          </div>
        )}
      </MBox>

      {/* ============ M6: Batch Inbox ============ */}
      <MBox
        id="batchInboxModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-inbox me-2" />
            Settlement Batch Inbox (47)
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={`${styles.pills} mb-3`}>
          {['All', 'RTGS', 'PesaLink', 'EFT', 'Urgent'].map((p, i) => (
            <button key={p} className={`${styles.pill} ${i === 0 ? styles.pillActive : ''}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Channel</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>BAT-21092</td>
                <td>RTGS</td>
                <td>184</td>
                <td>KES 184.2M</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Ready</span>
                </td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('initiateSettlementModal')}>
                    Submit
                  </button>
                </td>
              </tr>
              <tr>
                <td>BAT-21093</td>
                <td>PesaLink</td>
                <td>892</td>
                <td>KES 67.8M</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeW}`}>Exception</span>
                </td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('reconciliationWizardModal')}>
                    Reconcile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M7: Auto Rules ============ */}
      <MBox
        id="autoRulesModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gear me-2" style={{ color: 'var(--pm-warning)' }} />
            Automated Settlement Rules
          </>
        }
        footer={actionFooter('autoRulesModal', 'Save Rules', 'btnPmP', 'Automation rules updated successfully.')}
      >
        {actionBody(
          'autoRulesModal',
          <>
            <div className={`${styles.pills} mb-3`}>
              <button className={`${styles.pill} ${styles.pillActive}`}>Active Rules</button>
              <button className={styles.pill}>Create New</button>
              <button className={styles.pill}>History</button>
            </div>
            {[
              { title: 'Auto-retry failed RTGS', sub: 'Max 3 attempts • 15 min interval', on: true },
              { title: 'Auto-escalate high-value disputes', sub: '> KES 5M → Treasury Manager', on: true },
              { title: 'Weekend deferral', sub: 'Non-urgent batches held until Monday', on: false },
            ].map((r) => (
              <div className={styles.sr} key={r.title}>
                <div>
                  <strong>{r.title}</strong>
                  <div className={styles.mutedSmall}>{r.sub}</div>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" defaultChecked={r.on} aria-label={r.title} />
                </div>
              </div>
            ))}
          </>,
        )}
      </MBox>

      {/* ============ M8: Nostro ============ */}
      <MBox
        id="nostroModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-globe me-2" />
            Nostro/Vostro Account Management
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Account</th>
                <th>Bank</th>
                <th>Currency</th>
                <th>Balance</th>
                <th>Last Movement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { acct: 'Nostro USD', bank: 'Citibank NY', ccy: 'USD', bal: '8,420,000', mov: '26 Jun 2025', action: 'FX Settle', modal: 'fxSettlementModal' },
                { acct: 'Nostro EUR', bank: 'Deutsche Bank', ccy: 'EUR', bal: '3,210,000', mov: '25 Jun 2025', action: 'FX Settle', modal: 'fxSettlementModal' },
                { acct: 'Vostro KES', bank: 'Standard Chartered', ccy: 'KES', bal: '124,500,000', mov: '27 Jun 2025', action: 'Transfer', modal: 'nostroTransferModal' },
              ].map((n) => (
                <tr key={n.acct}>
                  <td>{n.acct}</td>
                  <td>{n.bank}</td>
                  <td>{n.ccy}</td>
                  <td>
                    <strong>{n.bal}</strong>
                  </td>
                  <td>{n.mov}</td>
                  <td>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen(n.modal)}>
                      {n.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M9: Compliance Report ============ */}
      <MBox
        id="complianceReportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text me-2" />
            Regulatory Compliance Reports
          </>
        }
        footer={
          results.complianceReportModal ? (
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
              Done
            </button>
          ) : (
            <>
              <button className={styles.btnPm} onClick={onClose}>
                Close
              </button>
              <button
                className={`${styles.btnPm} ${styles.btnPmP}`}
                disabled={busy === 'complianceReportModal'}
                onClick={() => doAction('complianceReportModal', 'Report generated and submitted to CBK.', 'CBK-20250627-001')}
              >
                Submit Pending Reports
              </button>
            </>
          )
        }
      >
        {actionBody(
          'complianceReportModal',
          <>
            {[
              { title: 'CBK Daily Settlement Return', sub: '27 Jun 2025 • Submitted 09:12', tone: styles.badgeS, status: 'Submitted' },
              { title: 'KRA Withholding Tax', sub: 'Due 29 Jun 2025', tone: styles.badgeW, status: 'Pending' },
              { title: 'AML Large Transaction Report', sub: '26 Jun 2025 • Submitted', tone: styles.badgeS, status: 'Submitted' },
              { title: 'FX Position Report', sub: 'Monthly • Due 30 Jun', tone: styles.badgeW, status: 'Pending' },
            ].map((r) => (
              <div className={styles.sr} key={r.title}>
                <div>
                  <strong>{r.title}</strong>
                  <div className={styles.mutedSmall}>{r.sub}</div>
                </div>
                <span className={`${styles.badge} ${r.tone}`}>{r.status}</span>
              </div>
            ))}
          </>,
        )}
      </MBox>

      {/* ============ Settlement Calendar ============ */}
      <MBox
        id="settlementCalendarModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calendar-event me-2" />
            Settlement Calendar
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          June 2025 — RTGS cut-off 15:00 daily • PesaLink 24/7 • Weekend deferral active for non-urgent batches.
        </p>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Date</th>
                <th>RTGS</th>
                <th>PesaLink</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>27 Jun</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeW}`}>Closing 47m</span>
                </td>
                <td>Open</td>
                <td>High volume day</td>
              </tr>
              <tr>
                <td>28 Jun</td>
                <td>Open</td>
                <td>Open</td>
                <td>Weekend deferral starts 18:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ FX Settlement ============ */}
      <MBox
        id="fxSettlementModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-currency-exchange me-2" />
            FX Settlement
          </>
        }
        footer={actionFooter('fxSettlementModal', 'Execute FX Settlement', 'btnPmP', 'FX settlement executed. KES 64,725,000 credited.', 'FX-20250627-8841')}
      >
        {actionBody(
          'fxSettlementModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>From Nostro</label>
              <select className={styles.fc} defaultValue="USD Nostro (Citibank) — 8.42M">
                <option>USD Nostro (Citibank) — 8.42M</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>To KES Account</label>
              <select className={styles.fc} defaultValue="PayMo KES Treasury">
                <option>PayMo KES Treasury</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Amount (USD)</label>
              <input className={styles.fc} defaultValue="500000" />
            </div>
            <div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}>
              Rate: 129.45 • Expected KES credit: 64,725,000
            </div>
          </>,
        )}
      </MBox>

      {/* ============ Health Check ============ */}
      <MBox
        id="healthCheckModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" style={{ color: 'var(--pm-danger)' }} />
            Settlement Health Check
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="row g-3 mb-1">
          {[
            { value: '97', label: 'HEALTH SCORE', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', labelColor: '#6ee7b7', big: true },
            { value: '99.7%', label: 'SUCCESS', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)', labelColor: '#93c5fd' },
            { value: '3', label: 'EXCEPTIONS', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', labelColor: '#fcd34d' },
            { value: '14', label: 'BATCHES', bg: 'var(--pm-purple-soft)', color: 'var(--pm-purple)', labelColor: '#c4b5fd' },
          ].map((t) => (
            <div className="col-md-3 col-6" key={t.label}>
              <div className={styles.miniStat} style={{ background: t.bg }}>
                <div className={styles.miniStatBig} style={{ color: t.color, fontSize: t.big ? 28 : 24 }}>
                  {t.value}
                </div>
                <div className={styles.miniStatLabel} style={{ color: t.labelColor }}>
                  {t.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MBox>

      {/* ============ Partial Settlement ============ */}
      <MBox
        id="partialSettlementModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-scissors me-2" />
            Partial Settlement Resolution
          </>
        }
        footer={actionFooter('partialSettlementModal', 'Accept Partial', 'btnPmP', 'Partial settlement accepted. Remaining KES 2.7M scheduled for tomorrow.')}
      >
        {actionBody(
          'partialSettlementModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Accept Partial Amount</label>
              <input className={styles.fc} defaultValue="65100000" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Reason for Partial</label>
              <textarea
                className={styles.fc}
                rows={2}
                defaultValue="Receiving bank liquidity constraint. Balance to be settled tomorrow."
              />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ Generate Report ============ */}
      <MBox
        id="generateReportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-download me-2" />
            Generate Settlement Report
          </>
        }
        footer={
          results.generateReportModal ? (
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
              Done
            </button>
          ) : (
            <>
              <button className={styles.btnPm} onClick={onClose}>
                Cancel
              </button>
              <button
                className={`${styles.btnPm} ${styles.btnPmP}`}
                disabled={busy === 'generateReportModal'}
                onClick={() => {
                  downloadFile(
                    'paymo-settlement-report.csv',
                    'ref,from,to,amount,channel,status\nSET-88421,Equity,KCB,45000000,RTGS,In Progress\nSET-88422,Co-op,Stanbic,12800000,PesaLink,Settled\nSET-88423,Absa,NCBA,8400000,RTGS,Retry\n',
                    'text/csv',
                  )
                  doAction('generateReportModal', 'Report generated successfully. Download started.')
                }}
              >
                Generate
              </button>
            </>
          )
        }
      >
        {actionBody(
          'generateReportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Report Type</label>
              <select className={styles.fc} defaultValue={REPORT_TYPES[0]}>
                {REPORT_TYPES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Date Range</label>
              <div className="row g-2">
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-01" />
                </div>
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-27" />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Format</label>
              <select className={styles.fc} defaultValue={REPORT_FORMATS[0]}>
                {REPORT_FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ Engine Config ============ */}
      <MBox
        id="engineConfigModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-cpu me-2" />
            Settlement Engine Configuration
          </>
        }
        footer={actionFooter('engineConfigModal', 'Save Config', 'btnPmP', 'Engine configuration saved. Changes effective immediately.')}
      >
        {actionBody(
          'engineConfigModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Max Concurrent Settlements</label>
              <input className={styles.fc} defaultValue="500" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Auto-retry Attempts</label>
              <input className={styles.fc} defaultValue="3" />
            </div>
            {['Enable weekend deferral', 'Enable smart channel routing'].map((c) => (
              <div className="form-check mb-2" key={c}>
                <input className="form-check-input" type="checkbox" defaultChecked id={`eng-${c}`} />
                <label className="form-check-label" htmlFor={`eng-${c}`}>
                  {c}
                </label>
              </div>
            ))}
          </>,
        )}
      </MBox>

      {/* ============ Activity Log ============ */}
      <MBox
        id="activityLogModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-clock-history me-2" />
            Full Settlement Activity Log
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Ref</th>
                <th>Action</th>
                <th>User</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['14:32', 'SET-88422', 'Settlement completed', 'System', 'Success'],
                ['14:28', 'SET-88421', 'Submitted to RTGS', 'James K.', 'In Progress'],
                ['14:15', 'BAT-21093', 'Exception detected', 'System', 'Flagged'],
              ].map((row) => (
                <tr key={row[1] + row[0]}>
                  {row.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ PesaLink ============ */}
      <MBox
        id="pesaLinkModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-link-45deg me-2" />
            PesaLink Clearing Management
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        {actionBody(
          'pesaLinkModal',
          <>
            <div className={styles.sr}>
              <div>
                <strong>Current Window</strong>
              </div>
              <span className={`${styles.badge} ${styles.badgeS}`}>Open (Closes 17:00)</span>
            </div>
            <div className={styles.sr}>
              <div>
                <strong>Transactions Processed</strong>
              </div>
              <strong>892 / 920</strong>
            </div>
            <div className={styles.sr}>
              <div>
                <strong>Net Position</strong>
              </div>
              <strong className={styles.textAccent}>+KES 184M</strong>
            </div>
            <div className="mb-1 mt-3">
              <label className={styles.fl}>Force Close Window</label>
              <button
                className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD} w-100`}
                disabled={busy === 'pesaLinkModal'}
                onClick={() => doAction('pesaLinkModal', 'PesaLink window forced closed. Remaining 28 transactions moved to next window.')}
              >
                Force Close
              </button>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ RTGS Urgent ============ */}
      <MBox
        id="rtgsUrgentModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-triangle me-2" style={{ color: 'var(--pm-danger)' }} />
            RTGS Urgent Submission
          </>
        }
        footer={actionFooter('rtgsUrgentModal', 'Submit All Urgent', 'btnPmD', '14 batches submitted with urgent flag. Additional fee: KES 31,500')}
      >
        {actionBody(
          'rtgsUrgentModal',
          <>
            <div className={`${styles.summaryBoxDanger} mb-3`}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>RTGS cut-off in 47 minutes</div>
              <div style={{ fontSize: 12, color: '#fecaca' }}>14 batches (KES 92M) still pending submission.</div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Priority Reason</label>
              <select className={styles.fc} defaultValue={RTGS_REASONS[0]}>
                {RTGS_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ Clearing Status ============ */}
      <MBox
        id="clearingStatusModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-broadcast me-2" />
            Live Clearing House Status
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        {[
          { name: 'PesaLink', status: 'Operational', tone: styles.badgeS },
          { name: 'RTGS (CBK)', status: 'Operational', tone: styles.badgeS },
          { name: 'ACH / EFT', status: 'Degraded (High volume)', tone: styles.badgeW },
          { name: 'SWIFT', status: 'Operational', tone: styles.badgeS },
        ].map((c) => (
          <div className={styles.sr} key={c.name}>
            <div>
              <strong>{c.name}</strong>
            </div>
            <span className={`${styles.badge} ${c.tone}`}>{c.status}</span>
          </div>
        ))}
      </MBox>

      {/* ============ Reconciliation Detail ============ */}
      <MBox
        id="reconciliationDetailModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-list-check me-2" />
            Reconciliation Details — BAT-21092
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={styles.summaryBox}>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Expected Credits</span>
            <strong>184</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Actual Credits</span>
            <strong>184</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className={styles.mutedSmall}>Variance</span>
            <span className={`${styles.badge} ${styles.badgeS}`}>0</span>
          </div>
        </div>
      </MBox>

      {/* ============ Profile ============ */}
      <MBox
        id="profileModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-person-circle me-2" />
            Profile
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="text-center">
          <div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>
            JK
          </div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@paymo.co.ke · Treasury</p>
        </div>
      </MBox>

      {/* ============ Attention ============ */}
      <MBox
        id="attentionModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-circle me-2" style={{ color: 'var(--pm-warning)' }} />
            All Attention Items
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={styles.sr}>
          <div>
            <strong>High-value settlement failed</strong>
          </div>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => onOpen('retrySettlementModal')}>
            Retry
          </button>
        </div>
        <div className={styles.sr}>
          <div>
            <strong>RTGS cut-off in 47 minutes</strong>
          </div>
          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('rtgsUrgentModal')}>
            Prioritize
          </button>
        </div>
        <div className={styles.sr}>
          <div>
            <strong>Dispute awaiting evidence</strong>
          </div>
          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('disputeModal')}>
            Respond
          </button>
        </div>
      </MBox>

      {/* ============ Notifications ============ */}
      <MBox
        id="notifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell me-2" />
            Notifications (7)
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={`${styles.summaryBoxDanger} mb-2`} style={{ fontSize: 13 }}>
          <strong>High-value settlement failed</strong>
          <div style={{ fontSize: 11, color: '#fecaca' }}>SET-88423 • KES 8.4M</div>
        </div>
        <div className={`${styles.summaryBoxWarn} mb-2`} style={{ fontSize: 13 }}>
          <strong>RTGS cut-off approaching</strong>
          <div style={{ fontSize: 11, color: '#fde68a' }}>47 minutes remaining</div>
        </div>
        <div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 13 }}>
          <strong>Dispute evidence requested</strong>
          <div style={{ fontSize: 11, color: '#93c5fd' }}>#SET-44892</div>
        </div>
      </MBox>

      {/* ============ Batch Upload ============ */}
      <MBox
        id="batchUploadModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-upload me-2" />
            Bulk Settlement Upload
          </>
        }
        footer={actionFooter('batchUploadModal', 'Upload & Validate', 'btnPmP', '478 settlements uploaded and validated. Ready for submission.')}
      >
        {actionBody(
          'batchUploadModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Upload CSV/Excel</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Template: Bank Code, Amount, Purpose, Reference. Max 500 rows per
              upload.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ Nostro Transfer ============ */}
      <MBox
        id="nostroTransferModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-left-right me-2" />
            Nostro Internal Transfer
          </>
        }
        footer={actionFooter('nostroTransferModal', 'Execute Transfer', 'btnPmP', 'Internal transfer of USD 500,000 executed.', 'NT-20250627-001')}
      >
        {actionBody(
          'nostroTransferModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>From Account</label>
              <select className={styles.fc} defaultValue="USD Nostro (Citibank) — 8.42M">
                <option>USD Nostro (Citibank) — 8.42M</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>To Account</label>
              <select className={styles.fc} defaultValue="KES Treasury Account">
                <option>KES Treasury Account</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Amount</label>
              <input className={styles.fc} defaultValue="500000" />
            </div>
          </>,
        )}
      </MBox>
    </>
  )
}
