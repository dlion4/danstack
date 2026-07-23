import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/mobileMoney.module.css'

/* ============================================================================
   Mobile Money & PSP Integration Hub — modal layer (legacy page 1.11, 25 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows legacy showLoading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with labeled stepper + receipt step;
                          confirm-step button labels match legacy exactly
                          (Send Money 🔒 / Execute ✔ / Submit Dispute 📤)
     nf(el) PIN advance → pinRefs focus chain
     sw(prefix,key,btn) → `tabs` state map for pill/panel switching
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

/* ---------- static option lists ---------- */
const SEND_FROM = ['M-Pesa Business (KES 8.42M)', 'Airtel Disbursement (KES 2.18M)']
const SEND_TO = ['0712 345 890 — James Kamau', '0733 112 445 — Finance Dept']
const CHARGE_BEARERS = ['Sender pays fee', 'Recipient pays fee', 'Shared']
const PROVIDERS = ['M-Pesa', 'Airtel Money', 'T-Kash', 'Pesalink']
const ACCOUNT_TYPES = ['Business Paybill', 'Personal Till', 'Disbursement Account']
const RECON_WALLETS = ['M-Pesa Business', 'Airtel Disbursement', 'T-Kash Collections']
const KYC_ACCOUNTS = ['45 Partial KYC accounts', '12 Expired KYC accounts']
const KYC_METHODS = ['Send eKYC link via SMS', 'Send eKYC link via WhatsApp', 'Require branch visit']
const DISPUTE_REASONS = ['Amount not received by recipient', 'Duplicate transfer', 'Wrong recipient', 'Fraudulent transaction']
const SCHEDULE_FREQS = ['One-time', 'Weekly', 'Monthly']
const PAUSE_REASONS = ['Security review', 'Suspicious activity', 'Compliance hold', 'Maintenance']
const STATEMENT_WALLETS = ['All Wallets', 'M-Pesa Business', 'Airtel Disbursement']
const STATEMENT_FORMATS = ['PDF', 'Excel', 'CSV']
const PSP_TYPES = ['B2C Aggregator', 'C2B Aggregator', 'Bank Switch']
const PSP_CYCLES = ['T+0', 'T+1', 'T+2']
const SUPPORT_SUBJECTS = ['API Integration Issue', 'Settlement Delay', 'Transaction Failure', 'Compliance Query']

type FlowKey = 'send' | 'bulk' | 'disp'
interface Result {
  msg: string
  ref?: string
}

export default function MobileMoneyModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<FlowKey, number>>({ send: 1, bulk: 1, disp: 1 })
  /* ---------- LEGACY BRIDGE: sw(prefix,key,btn) tab pill state ---------- */
  const [tabs, setTabs] = useState<Record<string, string>>({ wd: 'overview', psp: 'creds' })
  const sw = (prefix: string, key: string) => setTabs((prev) => ({ ...prev, [prefix]: key }))
  /* ---------- LEGACY BRIDGE: nf(el) PIN auto-advance ---------- */
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])
  const nf = (i: number) => {
    const el = pinRefs.current[i]
    if (el && el.value.length === 1) pinRefs.current[i + 1]?.focus()
  }

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ send: 1, bulk: 1, disp: 1 })
      setBusy(null)
      setTabs({ wd: 'overview', psp: 'creds' })
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

  /* ---------- LEGACY BRIDGE: nextFlow(key, total) with legacy modalMap ---------- */
  const flowTotals: Record<FlowKey, number> = { send: 4, bulk: 3, disp: 3 }
  const flowLabels: Record<FlowKey, string[]> = {
    send: ['Wallets', 'Amount', 'Confirm', 'Done'],
    bulk: ['Upload', 'Review', 'Done'],
    disp: ['Transaction', 'Evidence', 'Done'],
  }
  const flowModals: Record<FlowKey, string> = { send: 'sendMoneyModal', bulk: 'bulkTransferModal', disp: 'disputeModal' }
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

  /* ---------- shared UI fragments ---------- */
  const stepper = (key: FlowKey) => {
    const total = flowTotals[key]
    const current = flows[key]
    return (
      <div className={styles.stepper}>
        {flowLabels[key].map((label, i) => {
          const n = i + 1
          const cls = n < current ? styles.stepDone : n === current ? styles.stepActive : ''
          return (
            <div key={n} className={styles.step} style={{ display: 'contents' }}>
              <div className={`${styles.step} ${cls}`} style={{ display: 'flex' }}>
                <div className={styles.stepN}>{n < current ? <i className="bi bi-check" /> : n}</div>
                <div className={styles.stepL}>{label}</div>
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
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
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

  const actionFooter = (id: string, label: string, tone: 'btnPmP' | 'btnPmD', msg: string, ref?: string, cancelLabel = 'Cancel') =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          {cancelLabel}
        </button>
        <button className={`${styles.btnPm} ${styles[tone]}`} disabled={busy === id} onClick={() => doAction(id, msg, ref)}>
          {label}
        </button>
      </>
    )

  /* ---------- LEGACY BRIDGE: legacy confirm-step button labels ---------- */
  const flowFooter = (key: FlowKey) => {
    const total = flowTotals[key]
    const current = flows[key]
    const confirmLabel =
      key === 'send' ? (
        <>
          Send Money <i className="bi bi-lock" />
        </>
      ) : key === 'disp' ? (
        <>
          Submit Dispute <i className="bi bi-send" />
        </>
      ) : (
        <>
          Execute <i className="bi bi-check-lg" />
        </>
      )
    return (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          Cancel
        </button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === key} onClick={() => nextFlow(key)}>
          {current >= total ? (
            'Done'
          ) : busy === key ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> Processing
            </>
          ) : current === total - 1 ? (
            confirmLabel
          ) : (
            <>
              Continue <i className="bi bi-arrow-right" />
            </>
          )}
        </button>
      </>
    )
  }

  const showFlow = (key: FlowKey) => active === flowModals[key]

  return (
    <>
      {/* ============ M1: Send Money (multi-step + PIN) ============ */}
      <MBox
        id="sendMoneyModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-send me-2" style={{ color: 'var(--pm-accent)' }} />
            Send Money
          </>
        }
        footer={flowFooter('send')}
      >
        {stepper('send')}
        {busy === 'send' && <BusyOverlay />}
        {showFlow('send') && flows.send === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Wallets</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>From</label>
                <select className={styles.fc} defaultValue={SEND_FROM[0]}>
                  {SEND_FROM.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>To</label>
                <select className={styles.fc} defaultValue={SEND_TO[0]}>
                  {SEND_TO.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {showFlow('send') && flows.send === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Amount &amp; Reason</h6>
            <div className="mb-3">
              <label className={styles.fl}>Amount (KES)</label>
              <input className={styles.fc} defaultValue="250000" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Reason / Reference</label>
              <input className={styles.fc} defaultValue="Monthly supplier payment - June" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Charge Bearer</label>
              <select className={styles.fc} defaultValue={CHARGE_BEARERS[0]}>
                {CHARGE_BEARERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {showFlow('send') && flows.send === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Confirm &amp; Authorize</h6>
            <div className={styles.summaryBox}>
              <div className="d-flex justify-content-between mb-2">
                <span>From</span>
                <strong>M-Pesa Business</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>To</span>
                <strong>0712 345 890</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Amount</span>
                <strong>KES 250,000</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Fee</span>
                <strong>KES 0</strong>
              </div>
            </div>
            <label className={`${styles.fl} mt-3`}>Enter PIN</label>
            <div className={styles.pinRow}>
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="password"
                  maxLength={1}
                  className={styles.pinInput}
                  aria-label={`PIN digit ${i + 1}`}
                  ref={(el) => {
                    pinRefs.current[i] = el
                  }}
                  onChange={() => nf(i)}
                />
              ))}
            </div>
          </div>
        )}
        {showFlow('send') && flows.send === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Transfer Successful</h5>
              <p className={styles.receiptSub}>KES 250,000 sent to 0712 345 890</p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Reference</span>
                  <strong>MP-882910</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={styles.mutedSmall}>Time</span>
                  <strong>27 Jun 2025, 14:32</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M2: Bulk Transfer (multi-step) ============ */}
      <MBox
        id="bulkTransferModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-collection me-2" style={{ color: 'var(--pm-primary-light)' }} />
            Bulk Transfer
          </>
        }
        footer={flowFooter('bulk')}
      >
        {stepper('bulk')}
        {busy === 'bulk' && <BusyOverlay />}
        {showFlow('bulk') && flows.bulk === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Upload Recipients</h6>
            <div className="mb-3">
              <label className={styles.fl}>Upload CSV (Name, Phone, Amount, Reason)</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> 200 recipients detected • Total KES 4,820,000
            </div>
          </div>
        )}
        {showFlow('bulk') && flows.bulk === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Review &amp; Fund</h6>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>0712***890</td>
                    <td>KES 25,000</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeS}`}>Ready</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>0733***112</td>
                    <td>KES 18,500</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeS}`}>Ready</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {showFlow('bulk') && flows.bulk === 3 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-all" />
              </div>
              <h5 className={styles.receiptTitle}>Bulk Transfer Initiated</h5>
              <p className={styles.receiptSub}>200 transfers queued. 153 completed, 47 failed (will retry automatically).</p>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M3: Link New Wallet ============ */}
      <MBox
        id="linkWalletModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-plus-circle me-2" style={{ color: 'var(--pm-info)' }} />
            Link New Mobile Money Wallet
          </>
        }
        footer={actionFooter('linkWalletModal', 'Link Wallet', 'btnPmP', 'Wallet linked successfully! KYC verification in progress.')}
      >
        {actionBody(
          'linkWalletModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Provider</label>
              <select className={styles.fc} defaultValue={PROVIDERS[0]}>
                {PROVIDERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Phone Number</label>
              <input className={styles.fc} defaultValue="0712 345 890" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Account Type</label>
              <select className={styles.fc} defaultValue={ACCOUNT_TYPES[0]}>
                {ACCOUNT_TYPES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="lw1" />
              <label className="form-check-label" htmlFor="lw1">Enable instant notifications</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="lw2" />
              <label className="form-check-label" htmlFor="lw2">Auto-reconcile daily</label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M4: Wallet Detail (multi-tab) ============ */}
      <MBox
        id="walletDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-wallet2 me-2" />
            Wallet Details
          </>
        }
        footer={actionFooter('walletDetailModal', 'Save Changes', 'btnPmP', 'Wallet settings updated!', undefined, 'Close')}
      >
        {actionBody(
          'walletDetailModal',
          <>
            <div className={`${styles.pills} mb-3`}>
              {(
                [
                  ['overview', 'Overview'],
                  ['txns', 'Transactions'],
                  ['limits', 'Limits'],
                  ['kyc', 'KYC'],
                ] as const
              ).map(([key, label]) => (
                <button key={key} className={`${styles.pill} ${tabs.wd === key ? styles.pillActive : ''}`} onClick={() => sw('wd', key)}>
                  {label}
                </button>
              ))}
            </div>
            {tabs.wd === 'overview' && (
              <div className="row g-3">
                {(
                  [
                    ['Balance', 'KES 8,420,500'],
                    ['24h Volume', 'KES 12.4M'],
                  ] as const
                ).map(([k, v]) => (
                  <div className="col-md-6" key={k}>
                    <div className={styles.summaryBox}>
                      <div className={styles.mutedSmall}>{k}</div>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tabs.wd === 'txns' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>27 Jun</td>
                      <td>B2C Payment</td>
                      <td>KES 250,000</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeS}`}>Success</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {tabs.wd === 'limits' && (
              <>
                <div className="mb-3">
                  <label className={styles.fl}>Daily Limit</label>
                  <input className={styles.fc} defaultValue="50000000" />
                </div>
                <div className="mb-3">
                  <label className={styles.fl}>Per Transaction</label>
                  <input className={styles.fc} defaultValue="1000000" />
                </div>
              </>
            )}
            {tabs.wd === 'kyc' && (
              <>
                <div className={styles.sr}>
                  <div>
                    <strong>KYC Status</strong>
                  </div>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Full</span>
                </div>
                <div className={styles.sr}>
                  <div>
                    <strong>Last Verified</strong>
                  </div>
                  <strong>12 Mar 2025</strong>
                </div>
              </>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M5: Bulk Retry ============ */}
      <MBox
        id="bulkRetryModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-repeat me-2" style={{ color: 'var(--pm-warning)' }} />
            Retry Failed Transfers
          </>
        }
        footer={actionFooter('bulkRetryModal', 'Retry Now', 'btnPmP', '47 transfers queued for retry. ETA: 15 minutes.')}
      >
        {actionBody(
          'bulkRetryModal',
          <>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
              47 transfers failed in the last batch. Reason: Insufficient float on Airtel Money.
            </p>
            <div className={`${styles.summaryBoxWarn} mb-3`}>
              <div className="d-flex justify-content-between">
                <span>Total Amount</span>
                <strong>KES 1,240,000</strong>
              </div>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="br1" />
              <label className="form-check-label" htmlFor="br1">Retry all 47</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="br2" />
              <label className="form-check-label" htmlFor="br2">Skip and notify recipients</label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M6: Run Reconciliation ============ */}
      <MBox
        id="reconcileModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-repeat me-2" />
            Run Reconciliation
          </>
        }
        footer={actionFooter('reconcileModal', 'Start Reconciliation', 'btnPmP', 'Reconciliation started. Report will be emailed in 5 minutes.', 'REC-20250627-9912')}
      >
        {actionBody(
          'reconcileModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Select Wallets</label>
              <select className={styles.fc} multiple defaultValue={RECON_WALLETS.slice(0, 2)}>
                {RECON_WALLETS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Date Range</label>
              <div className="row g-2">
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-20" />
                </div>
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-27" />
                </div>
              </div>
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Reconciliation typically takes 2–5 minutes. You will receive a detailed report via
              email.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M7: PSP Integration Settings (multi-tab) ============ */}
      <MBox
        id="pspSettingsModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gear me-2" />
            PSP Integration Settings
          </>
        }
        footer={actionFooter('pspSettingsModal', 'Save Settings', 'btnPmP', 'PSP settings updated successfully!', undefined, 'Close')}
      >
        {actionBody(
          'pspSettingsModal',
          <>
            <div className={`${styles.pills} mb-3`}>
              {(
                [
                  ['creds', 'Credentials'],
                  ['limits', 'Limits'],
                  ['webhooks', 'Webhooks'],
                ] as const
              ).map(([key, label]) => (
                <button key={key} className={`${styles.pill} ${tabs.psp === key ? styles.pillActive : ''}`} onClick={() => sw('psp', key)}>
                  {label}
                </button>
              ))}
            </div>
            {tabs.psp === 'creds' && (
              <>
                <div className="mb-3">
                  <label className={styles.fl}>API Key</label>
                  <input className={styles.fc} defaultValue="sk_live_****************************" />
                </div>
                <div className="mb-3">
                  <label className={styles.fl}>Secret</label>
                  <input className={styles.fc} type="password" defaultValue="••••••••••••••••" />
                </div>
              </>
            )}
            {tabs.psp === 'limits' && (
              <div className="mb-3">
                <label className={styles.fl}>Daily Settlement Cap</label>
                <input className={styles.fc} defaultValue="100000000" />
              </div>
            )}
            {tabs.psp === 'webhooks' && (
              <div className="mb-3">
                <label className={styles.fl}>Webhook URL</label>
                <input className={styles.fc} defaultValue="https://api.paymo.co.ke/webhooks/mpesa" />
              </div>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M8: Bulk KYC Refresh ============ */}
      <MBox
        id="kycBulkModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-person-check me-2" style={{ color: 'var(--pm-info)' }} />
            Bulk KYC Refresh
          </>
        }
        footer={actionFooter('kycBulkModal', 'Send Links', 'btnPmP', 'eKYC links sent to 57 accounts. Tracking dashboard updated.', 'KYC-20250627-1128')}
      >
        {actionBody(
          'kycBulkModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Select Accounts</label>
              <select className={styles.fc} multiple defaultValue={[KYC_ACCOUNTS[0]]}>
                {KYC_ACCOUNTS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Method</label>
              <select className={styles.fc} defaultValue={KYC_METHODS[0]}>
                {KYC_METHODS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}>
              <i className="bi bi-clock me-1" /> eKYC links expire in 72 hours. Recipients must complete within the window.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M9: File Dispute (multi-step) ============ */}
      <MBox
        id="disputeModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-triangle me-2" style={{ color: 'var(--pm-danger)' }} />
            File Mobile Money Dispute
          </>
        }
        footer={flowFooter('disp')}
      >
        {stepper('disp')}
        {busy === 'disp' && <BusyOverlay />}
        {showFlow('disp') && flows.disp === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Transaction</h6>
            <div className="mb-3">
              <label className={styles.fl}>Transaction Reference</label>
              <input className={styles.fc} defaultValue="MP-882910" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Dispute Reason</label>
              <select className={styles.fc} defaultValue={DISPUTE_REASONS[0]}>
                {DISPUTE_REASONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {showFlow('disp') && flows.disp === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Evidence</h6>
            <div className="mb-3">
              <label className={styles.fl}>Description</label>
              <textarea
                className={styles.fc}
                rows={3}
                defaultValue="Recipient claims they never received the funds. Transaction shows successful on our side."
              />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Upload Screenshot / Proof</label>
              <input type="file" className={styles.fc} />
            </div>
          </div>
        )}
        {showFlow('disp') && flows.disp === 3 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Dispute Filed</h5>
              <p className={styles.receiptSub}>Case #MMD-44987 created. Expected resolution: 5–10 business days.</p>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M10: Wallet Permissions ============ */}
      <MBox
        id="walletPermissionsModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shield-lock me-2" />
            Wallet Permissions
          </>
        }
        footer={actionFooter('walletPermissionsModal', 'Save Permissions', 'btnPmP', 'Permissions updated successfully!')}
      >
        {actionBody(
          'walletPermissionsModal',
          <>
            {(
              [
                ['Send Money', true],
                ['Receive Money', true],
                ['Bulk Transfers', true],
                ['View Balance', false],
                ['Manage Settings', false],
              ] as const
            ).map(([label, checked], i) => (
              <div className={`form-check ${i < 4 ? 'mb-2' : ''}`} key={label}>
                <input className="form-check-input" type="checkbox" defaultChecked={checked} id={`wp${i}`} />
                <label className="form-check-label" htmlFor={`wp${i}`}>{label}</label>
              </div>
            ))}
          </>,
        )}
      </MBox>

      {/* ============ M11: Schedule Transfer ============ */}
      <MBox
        id="scheduleTransferModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calendar-event me-2" />
            Schedule Transfer
          </>
        }
        footer={actionFooter('scheduleTransferModal', 'Schedule', 'btnPmP', 'Transfer scheduled successfully!', 'SCH-20250701-001')}
      >
        {actionBody(
          'scheduleTransferModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>From</label>
              <select className={styles.fc} defaultValue="M-Pesa Business">
                <option>M-Pesa Business</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>To</label>
              <select className={styles.fc} defaultValue="0712 345 890">
                <option>0712 345 890</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Amount</label>
              <input className={styles.fc} defaultValue="100000" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Schedule Date</label>
              <input type="datetime-local" className={styles.fc} defaultValue="2025-07-01T09:00" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Frequency</label>
              <select className={styles.fc} defaultValue={SCHEDULE_FREQS[0]}>
                {SCHEDULE_FREQS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M12: PSP Health Dashboard ============ */}
      <MBox
        id="pspHealthModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" />
            PSP Health Dashboard
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
                <th>PSP</th>
                <th>Uptime</th>
                <th>Latency</th>
                <th>Error Rate</th>
                <th>Last Incident</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['M-Pesa', '99.98%', '120ms', '0.02%', '12 Jun', styles.badgeS],
                  ['Airtel Money', '99.71%', '180ms', '0.12%', '25 Jun', styles.badgeS],
                  ['Pesalink', '94.2%', '450ms', '1.8%', '27 Jun', styles.badgeW],
                ] as const
              ).map(([psp, uptime, latency, err, incident, tone]) => (
                <tr key={psp}>
                  <td>{psp}</td>
                  <td>
                    <span className={`${styles.badge} ${tone}`}>{uptime}</span>
                  </td>
                  <td>{latency}</td>
                  <td>{err}</td>
                  <td>{incident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M13: Transaction Limits ============ */}
      <MBox
        id="limitSettingsModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-sliders me-2" />
            Transaction Limits
          </>
        }
        footer={actionFooter('limitSettingsModal', 'Save Limits', 'btnPmP', 'Limits updated successfully!')}
      >
        {actionBody(
          'limitSettingsModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Per Transaction Limit</label>
              <input className={styles.fc} defaultValue="1000000" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Daily Limit</label>
              <input className={styles.fc} defaultValue="50000000" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Monthly Limit</label>
              <input className={styles.fc} defaultValue="500000000" />
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="ls1" />
              <label className="form-check-label" htmlFor="ls1">Require approval for amounts above KES 500,000</label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M14: Transfer Receipt ============ */}
      <MBox
        id="transferReceiptModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-receipt me-2" />
            Transfer Receipt
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={styles.receipt}>
          <div className={styles.ri}>
            <i className="bi bi-check-lg" />
          </div>
          <h5 className={styles.receiptTitle}>Transfer Successful</h5>
          <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
            <div className="d-flex justify-content-between mb-2">
              <span className={styles.mutedSmall}>Reference</span>
              <strong>MP-882910</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className={styles.mutedSmall}>From</span>
              <strong>M-Pesa Business</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className={styles.mutedSmall}>To</span>
              <strong>0712 345 890</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className={styles.mutedSmall}>Amount</span>
              <strong>KES 250,000</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className={styles.mutedSmall}>Date</span>
              <strong>27 Jun 2025, 14:32</strong>
            </div>
          </div>
          {/* LEGACY BRIDGE: dead PDF/Share buttons in legacy → real receipt downloads */}
          <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
            <button
              className={`${styles.btnPm} ${styles.btnSm}`}
              onClick={() =>
                downloadFile(
                  'transfer-receipt-MP-882910.txt',
                  'PayMo — Transfer Receipt\nReference: MP-882910\nFrom: M-Pesa Business\nTo: 0712 345 890\nAmount: KES 250,000\nDate: 27 Jun 2025, 14:32\nStatus: Successful',
                )
              }
            >
              <i className="bi bi-download" /> PDF
            </button>
            <button
              className={`${styles.btnPm} ${styles.btnSm}`}
              onClick={() =>
                downloadFile(
                  'transfer-share-MP-882910.txt',
                  'PayMo transfer of KES 250,000 to 0712 345 890 completed successfully. Ref: MP-882910 (27 Jun 2025, 14:32).',
                )
              }
            >
              <i className="bi bi-whatsapp" /> Share
            </button>
          </div>
        </div>
      </MBox>

      {/* ============ M15: Pause Wallet ============ */}
      <MBox
        id="pauseWalletModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-pause-circle me-2" style={{ color: 'var(--pm-warning)' }} />
            Pause Wallet
          </>
        }
        footer={actionFooter('pauseWalletModal', 'Pause Wallet', 'btnPmP', 'Wallet paused successfully. All transactions blocked.')}
      >
        {actionBody(
          'pauseWalletModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Reason</label>
              <select className={styles.fc} defaultValue={PAUSE_REASONS[0]}>
                {PAUSE_REASONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="pw1" />
              <label className="form-check-label" htmlFor="pw1">Block all outgoing transfers</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="pw2" />
              <label className="form-check-label" htmlFor="pw2">Block all incoming transfers</label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M16: Export Statements ============ */}
      <MBox
        id="statementModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-download me-2" />
            Export Statements
          </>
        }
        footer={actionFooter('statementModal', 'Export', 'btnPmP', 'Statement generated and downloading...')}
      >
        {actionBody(
          'statementModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Wallet</label>
              <select className={styles.fc} defaultValue={STATEMENT_WALLETS[0]}>
                {STATEMENT_WALLETS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className={styles.fl}>From</label>
                <input type="date" className={styles.fc} defaultValue="2025-06-01" />
              </div>
              <div className="col-6">
                <label className={styles.fl}>To</label>
                <input type="date" className={styles.fc} defaultValue="2025-06-27" />
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Format</label>
              <select className={styles.fc} defaultValue={STATEMENT_FORMATS[0]}>
                {STATEMENT_FORMATS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M17: Wallet Health Dashboard ============ */}
      <MBox
        id="walletHealthModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" />
            Wallet Health Dashboard
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="row g-3">
          {(
            [
              ['96', 'AVG HEALTH', 'var(--pm-accent-soft)', 'var(--pm-accent)'],
              ['4', 'ACTIVE', 'var(--pm-info-soft)', 'var(--pm-info)'],
              ['1', 'DEGRADED', 'var(--pm-warning-soft)', 'var(--pm-warning)'],
            ] as const
          ).map(([value, label, bg, color]) => (
            <div className="col-md-4" key={label}>
              <div className={styles.miniStat} style={{ background: bg }}>
                <div className={styles.miniStatBig} style={{ color }}>
                  {value}
                </div>
                <div className={styles.miniStatLabel} style={{ color }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MBox>

      {/* ============ M18: Add New PSP ============ */}
      <MBox
        id="addPspModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-plug me-2" />
            Add New PSP
          </>
        }
        footer={actionFooter('addPspModal', 'Add PSP', 'btnPmP', 'PSP added successfully! API credentials required next.')}
      >
        {actionBody(
          'addPspModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>PSP Name</label>
              <input className={styles.fc} placeholder="e.g. Flutterwave" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Type</label>
              <select className={styles.fc} defaultValue={PSP_TYPES[0]}>
                {PSP_TYPES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>API Endpoint</label>
              <input className={styles.fc} placeholder="https://api.psp.com" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Settlement Cycle</label>
              <select className={styles.fc} defaultValue={PSP_CYCLES[0]}>
                {PSP_CYCLES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M19: Contact PSP Support ============ */}
      <MBox
        id="contactSupportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-headset me-2" />
            Contact PSP Support
          </>
        }
        footer={actionFooter('contactSupportModal', 'Send', 'btnPmP', 'Support ticket created. Reference: PSP-8821')}
      >
        {actionBody(
          'contactSupportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Subject</label>
              <select className={styles.fc} defaultValue={SUPPORT_SUBJECTS[0]}>
                {SUPPORT_SUBJECTS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Message</label>
              <textarea className={styles.fc} rows={4} defaultValue="Need assistance with Pesalink integration." />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M20: Mobile Money Health Check ============ */}
      <MBox
        id="healthCheckModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" style={{ color: 'var(--pm-danger)' }} />
            Mobile Money Health Check
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('walletHealthModal')}>
              View Details
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          {(
            [
              ['97', 'OVERALL', 'var(--pm-accent-soft)', 'var(--pm-accent)'],
              ['12', 'WALLETS', 'var(--pm-info-soft)', 'var(--pm-info)'],
              ['1', 'DEGRADED', 'var(--pm-warning-soft)', 'var(--pm-warning)'],
              ['0', 'CRITICAL', 'var(--pm-purple-soft)', 'var(--pm-purple)'],
            ] as const
          ).map(([value, label, bg, color]) => (
            <div className="col-md-3 col-6" key={label}>
              <div className={styles.miniStat} style={{ background: bg }}>
                <div className={styles.miniStatBig} style={{ color }}>
                  {value}
                </div>
                <div className={styles.miniStatLabel} style={{ color }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MBox>

      {/* ============ M21: All Attention Items ============ */}
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
        {(
          [
            ['M-Pesa B2C batch failed', 'Retry', 'bulkRetryModal', true],
            ['45 KYC pending', 'Start', 'kycBulkModal', false],
            ['Airtel API token expiring', 'Renew', 'pspSettingsModal', false],
          ] as const
        ).map(([title, label, modal, danger]) => (
          <div className={styles.sr} key={title}>
            <div>
              <strong>{title}</strong>
            </div>
            <button className={`${styles.btnPm} ${styles.btnSm} ${danger ? styles.btnPmD : ''}`} onClick={() => onOpen(modal)}>
              {label}
            </button>
          </div>
        ))}
      </MBox>

      {/* ============ M22: PSP Comparison ============ */}
      <MBox
        id="pspCompareModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-left-right me-2" />
            PSP Comparison
          </>
        }
        footer={actionFooter('pspCompareModal', 'Switch to T-Kash', 'btnPmP', 'Recommendation noted. Switching 18% volume to T-Kash.', undefined, 'Close')}
      >
        {actionBody(
          'pspCompareModal',
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>M-Pesa</th>
                  <th>Airtel Money</th>
                  <th>T-Kash</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fee (KES 10k)</td>
                  <td>KES 25</td>
                  <td>KES 20</td>
                  <td>KES 15</td>
                </tr>
                <tr>
                  <td>Success Rate</td>
                  <td>99.98%</td>
                  <td>99.71%</td>
                  <td>99.4%</td>
                </tr>
                <tr>
                  <td>Settlement</td>
                  <td>T+0</td>
                  <td>T+1</td>
                  <td>T+0</td>
                </tr>
              </tbody>
            </table>
          </div>,
        )}
      </MBox>

      {/* ============ M23: Notifications ============ */}
      <MBox
        id="notifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell me-2" />
            Notifications (14)
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          <div className={`${styles.summaryBoxDanger} mb-2`} style={{ fontSize: 13 }}>
            <strong>M-Pesa B2C batch failed</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>47 transactions • KES 1.24M</div>
          </div>
          <div className={`${styles.summaryBoxWarn} mb-2`} style={{ fontSize: 13 }}>
            <strong>Airtel API token expiring</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>Expires in 6 days</div>
          </div>
          <div className={styles.summaryBoxInfo} style={{ fontSize: 13 }}>
            <strong>Reconciliation completed</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>0 mismatches found</div>
          </div>
        </div>
      </MBox>

      {/* ============ M24: Profile ============ */}
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
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@email.com</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            <div className="col-6">
              <div className={`${styles.summaryBox} p-2`}>
                <span className={styles.mutedSmall}>Wallets</span>
                <br />
                <strong>12 linked</strong>
              </div>
            </div>
            <div className="col-6">
              <div className={`${styles.summaryBox} p-2`}>
                <span className={styles.mutedSmall}>Health</span>
                <br />
                <strong style={{ color: 'var(--pm-accent)' }}>97/100</strong>
              </div>
            </div>
          </div>
        </div>
      </MBox>

      {/* ============ M25: Pause Confirmation ============ */}
      <MBox
        id="pauseConfirmModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-pause-circle me-2" style={{ color: 'var(--pm-warning)' }} />
            Confirm Pause
          </>
        }
        footer={actionFooter('pauseConfirmModal', 'Pause', 'btnPmD', 'Wallet paused successfully.')}
      >
        {actionBody('pauseConfirmModal', <p>Are you sure you want to pause this wallet? All transfers will be blocked until resumed.</p>)}
      </MBox>
    </>
  )
}
