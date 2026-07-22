import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/kraGovernment.module.css'

/* ============================================================================
   KRA & Government Integration — modal layer (legacy page 1.12, 21 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; legacy showLoading spinner → receipt
     nextFlow(key,total)→ `flows` state with labeled stepper + receipt step
                          confirm-step labels kept: kra='Pay Now 🔒',
                          file='Submit & Pay 📨', bulk='Execute ✔'
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

/* ---------- LEGACY BRIDGE: file download helper (receipt "Save" / template) ---------- */
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
        <div className={`${styles.modalBox} ${size === 'lg' ? styles.modalBoxLg : ''} ${size === 'xl' ? styles.modalBoxXl : ''}`}>
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
const KRA_ENTITIES = ['A012345678Y — James Kamau (PAYE)', 'P987654321Z — JK Holdings (VAT)', 'R445566778X — Rental Portfolio (TOT)', 'C112233445W — JK Investments (CGT)']
const TAX_TYPES = ['PAYE', 'VAT', 'TOT', 'CGT', 'Withholding Tax']
const PAY_METHODS = ['PayMo Wallet (KES 124,500)', 'M-Pesa (0712***890)', 'Equity Bank ***4521']
const PAY_SCHEDULES = ['Pay immediately', 'Schedule for 10 Jul', 'Recurring monthly']
const FILE_PINS = ['P987654321Z — JK Holdings Ltd (VAT)', 'A012345678Y — James Kamau (PAYE)']
const RETURN_PERIODS = ['June 2025', 'May 2025', 'April 2025']
const ECITIZEN_SERVICES = ['Passport Renewal — KES 4,500', 'Driving Licence Renewal — KES 3,200', 'Police Clearance — KES 1,000', 'Good Conduct Certificate — KES 1,000', 'Business Registration — KES 12,500']
const ECITIZEN_METHODS = ['M-Pesa', 'PayMo Wallet', 'Bank Transfer']
const COUNTIES = ['Nairobi City County', 'Kiambu County', 'Nakuru County', 'Mombasa County']
const COUNTY_SERVICES = ['Single Business Permit — KES 18,500', 'Land Rates — KES 42,300', 'Health Permit — KES 7,800', 'Fire Safety Certificate — KES 4,200']
const ARDHISASA_SERVICES = ['Title Deed Processing — KES 28,500', 'Stamp Duty — KES 124,000', 'Lease Renewal — KES 15,200', 'Change of User — KES 45,000']
const ARD_METHODS = ['PayMo Wallet', 'Bank Transfer']
const SCHED_TYPES = ['P987654321Z — VAT', 'A012345678Y — PAYE']
const FREQUENCIES = ['Monthly', 'Quarterly', 'Annual']
const ENTITY_TYPES = ['Individual', 'Company', 'Partnership', 'Trust']
const LINK_SOURCES = ['PayMo Wallet', 'M-Pesa', 'Bank']

type FlowKey = 'kra' | 'file' | 'bulk'
interface Result {
  msg: string
  ref?: string
}

export default function KraGovernmentModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<FlowKey, number>>({ kra: 1, file: 1, bulk: 1 })
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ kra: 1, file: 1, bulk: 1 })
      setBusy(null)
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* ---------- LEGACY BRIDGE: nf(el) PIN auto-advance ---------- */
  const nf = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 1) pinRefs.current[i + 1]?.focus()
  }

  /* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) ---------- */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1500)
  }

  /* ---------- LEGACY BRIDGE: nextFlow(key, total) ---------- */
  const flowTotals: Record<FlowKey, number> = { kra: 4, file: 4, bulk: 3 }
  const flowLabels: Record<FlowKey, string[]> = {
    kra: ['Obligation', 'Details', 'Confirm', 'Done'],
    file: ['Select', 'Upload', 'Submit', 'Done'],
    bulk: ['Upload', 'Validate', 'Done'],
  }
  const flowModals: Record<FlowKey, string> = { kra: 'payKRAModal', file: 'fileReturnModal', bulk: 'bulkTaxModal' }
  const confirmLabels: Record<FlowKey, ReactNode> = {
    kra: (
      <>
        Pay Now <i className="bi bi-lock" />
      </>
    ),
    file: (
      <>
        Submit &amp; Pay <i className="bi bi-send" />
      </>
    ),
    bulk: (
      <>
        Execute <i className="bi bi-check-lg" />
      </>
    ),
  }
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

  const receipt = (modalId: string, r: Result) => (
    <div className={styles.receipt}>
      <div className={styles.ri}>
        <i className="bi bi-check-lg" />
      </div>
      <h5 className={styles.receiptTitle}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => downloadFile(`${modalId}-receipt.txt`, `${r.msg}${r.ref ? `\nReference: ${r.ref}` : ''}`)}>
          <i className="bi bi-download" /> Save
        </button>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>
          <i className="bi bi-share" /> Continue
        </button>
      </div>
    </div>
  )

  const actionBody = (id: string, children: ReactNode) => (
    <>
      {busy === id && <BusyOverlay />}
      {results[id] ? receipt(id, results[id]) : children}
    </>
  )

  const actionFooter = (id: string, label: string, msg: string, ref?: string, cancelLabel = 'Cancel') =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          {cancelLabel}
        </button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === id} onClick={() => doAction(id, msg, ref)}>
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
        ) : flows[key] === flowTotals[key] - 1 ? (
          confirmLabels[key]
        ) : (
          <>
            Continue <i className="bi bi-arrow-right" />
          </>
        )}
      </button>
    </>
  )

  const showFlow = (key: FlowKey) => active === flowModals[key]

  /* ---------- summary box row helper ---------- */
  const BoxRow = ({ label, value, last, tone }: { label: string; value: ReactNode; last?: boolean; tone?: string }) => (
    <div className={`d-flex justify-content-between ${last ? '' : 'mb-2'}`}>
      <span className={styles.mutedSmall}>{label}</span>
      <strong style={tone ? { color: tone } : undefined}>{value}</strong>
    </div>
  )

  return (
    <>
      {/* ============ M1: Pay KRA Tax (multi-step) ============ */}
      <MBox
        id="payKRAModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-receipt-cutoff me-2" style={{ color: 'var(--pm-danger)' }} />
            Pay KRA Tax
          </>
        }
        footer={flowFooter('kra')}
      >
        {stepper('kra')}
        {busy === 'kra' && <BusyOverlay />}
        {showFlow('kra') && flows.kra === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Obligation</h6>
            <div className="mb-3">
              <label className={styles.fl}>KRA PIN / Entity</label>
              <select className={styles.fc} defaultValue={KRA_ENTITIES[0]}>
                {KRA_ENTITIES.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Tax Type</label>
              <select className={styles.fc} defaultValue={TAX_TYPES[0]}>
                {TAX_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Current due: <strong>KES 42,800</strong> • Due date: 15 Jul 2025
            </div>
          </div>
        )}
        {showFlow('kra') && flows.kra === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Payment Details</h6>
            <div className="mb-3">
              <label className={styles.fl}>Amount (KES)</label>
              <input className={styles.fc} defaultValue="42800" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Payment Method</label>
              <select className={styles.fc} defaultValue={PAY_METHODS[0]}>
                {PAY_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Schedule</label>
              <select className={styles.fc} defaultValue={PAY_SCHEDULES[0]}>
                {PAY_SCHEDULES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {showFlow('kra') && flows.kra === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Confirm &amp; Pay</h6>
            <div className={`${styles.summaryBox} mb-3`}>
              <BoxRow label="Tax Type" value="PAYE" />
              <BoxRow label="Amount" value="KES 42,800" />
              <BoxRow label="Method" value="Wallet" />
              <BoxRow label="Fee" value="KES 0" last />
            </div>
            <label className={styles.fl}>Enter Wallet PIN</label>
            <div className={styles.pinRow}>
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    pinRefs.current[i] = el
                  }}
                  type="password"
                  maxLength={1}
                  onChange={nf(i)}
                  className={styles.pinInput}
                  aria-label={`PIN digit ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
        {showFlow('kra') && flows.kra === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Tax Payment Successful</h5>
              <p className={styles.receiptSub}>Your KRA payment has been processed. Receipt and iTax confirmation have been sent.</p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <BoxRow label="KRA PIN" value="A012345678Y" />
                <BoxRow label="Amount" value="KES 42,800" />
                <BoxRow label="iTax Ref" value="ITX-883421" />
                <BoxRow label="Date" value="27 Jun 2025, 14:32" last />
              </div>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M2: File Tax Return (multi-step) ============ */}
      <MBox
        id="fileReturnModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text me-2" style={{ color: 'var(--pm-primary-light)' }} />
            File Tax Return
          </>
        }
        footer={flowFooter('file')}
      >
        {stepper('file')}
        {busy === 'file' && <BusyOverlay />}
        {showFlow('file') && flows.file === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Select Return</h6>
            <div className="mb-3">
              <label className={styles.fl}>KRA PIN</label>
              <select className={styles.fc} defaultValue={FILE_PINS[0]}>
                {FILE_PINS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Return Period</label>
              <select className={styles.fc} defaultValue={RETURN_PERIODS[0]}>
                {RETURN_PERIODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}>
              <i className="bi bi-clock me-1" /> Due in <strong>2 days</strong>. File early to avoid late penalties.
            </div>
          </div>
        )}
        {showFlow('file') && flows.file === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Upload &amp; Review</h6>
            <div className="mb-3">
              <label className={styles.fl}>Upload Supporting Documents</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className={`${styles.summaryBox} mb-3`}>
              <BoxRow label="Gross Sales" value="KES 4,200,000" />
              <BoxRow label="Input VAT" value="KES 672,000" />
              <BoxRow label="Output VAT" value="KES 756,200" />
              <hr className={styles.divider} />
              <div className="d-flex justify-content-between">
                <span style={{ fontWeight: 700 }}>Net VAT Payable</span>
                <strong style={{ color: 'var(--pm-danger)' }}>KES 84,200</strong>
              </div>
            </div>
          </div>
        )}
        {showFlow('file') && flows.file === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Submit &amp; Pay</h6>
            <div className={`${styles.summaryBoxAccent} mb-3`}>
              <BoxRow label="Return Type" value="VAT — June 2025" />
              <BoxRow label="Amount Due" value="KES 84,200" />
              <BoxRow label="iTax Confirmation" value="Will be emailed" last />
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="fr1" />
              <label className="form-check-label" htmlFor="fr1" style={{ fontSize: 13 }}>
                Pay immediately after filing
              </label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="fr2" />
              <label className="form-check-label" htmlFor="fr2" style={{ fontSize: 13 }}>
                Auto-file next month
              </label>
            </div>
          </div>
        )}
        {showFlow('file') && flows.file === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Return Filed Successfully</h5>
              <p className={styles.receiptSub}>VAT return for June 2025 has been submitted to iTax. Payment of KES 84,200 processed.</p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <BoxRow label="iTax Ref" value="VAT-202506-99182" />
                <BoxRow label="Filed By" value="James Kamau" />
                <BoxRow label="Date" value="27 Jun 2025, 14:45" last />
              </div>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M3: Pay eCitizen ============ */}
      <MBox
        id="payECitizenModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-globe me-2" style={{ color: 'var(--pm-info)' }} />
            Pay eCitizen Service
          </>
        }
        footer={actionFooter('payECitizenModal', 'Pay KES 4,500', 'eCitizen payment successful! Receipt sent to your email.', 'EC-449281')}
      >
        {actionBody(
          'payECitizenModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Service</label>
              <select className={styles.fc} defaultValue={ECITIZEN_SERVICES[0]}>
                {ECITIZEN_SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Application / Ref Number</label>
              <input className={styles.fc} defaultValue="P-449281" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Payment Method</label>
              <select className={styles.fc} defaultValue={ECITIZEN_METHODS[0]}>
                {ECITIZEN_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Payment will be processed instantly. You will receive a confirmation SMS and email
              with the receipt.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M4: Pay County ============ */}
      <MBox
        id="payCountyModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-building me-2" style={{ color: 'var(--pm-warning)' }} />
            Pay County Revenue
          </>
        }
        footer={actionFooter('payCountyModal', 'Pay Now', 'County payment successful! Permit updated in your records.', 'CCN-772910')}
      >
        {actionBody(
          'payCountyModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>County</label>
              <select className={styles.fc} defaultValue={COUNTIES[0]}>
                {COUNTIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Service / Permit</label>
              <select className={styles.fc} defaultValue={COUNTY_SERVICES[0]}>
                {COUNTY_SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Account / Plot Number</label>
              <input className={styles.fc} defaultValue="NCC-882910" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Payment Method</label>
              <select className={styles.fc} defaultValue={ECITIZEN_METHODS[0]}>
                {ECITIZEN_METHODS.filter((m) => m !== 'Bank Transfer').map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M5: Pay Ardhisasa ============ */}
      <MBox
        id="payArdhisasaModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-map me-2" style={{ color: 'var(--pm-accent)' }} />
            Pay Ardhisasa Land Services
          </>
        }
        footer={actionFooter('payArdhisasaModal', 'Pay Now', 'Ardhisasa payment successful! Receipt and confirmation sent.', 'ARD-20250627-1192')}
      >
        {actionBody(
          'payArdhisasaModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Service</label>
              <select className={styles.fc} defaultValue={ARDHISASA_SERVICES[0]}>
                {ARDHISASA_SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>LR / Plot Number</label>
              <input className={styles.fc} defaultValue="LR-209/881" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Payment Method</label>
              <select className={styles.fc} defaultValue={ARD_METHODS[0]}>
                {ARD_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxAccent} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Payments are processed through the Ministry of Lands portal. You will receive an
              official receipt.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M6: Bulk Tax Filing (multi-step) ============ */}
      <MBox
        id="bulkTaxModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-collection me-2" />
            Bulk Tax Filing &amp; Payment
          </>
        }
        footer={flowFooter('bulk')}
      >
        {stepper('bulk')}
        {busy === 'bulk' && <BusyOverlay />}
        {showFlow('bulk') && flows.bulk === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Upload File</h6>
            <div className="mb-3">
              <label className={styles.fl}>Upload CSV/Excel</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Download template:{' '}
              {/* LEGACY BRIDGE: legacy alert('Template downloaded') → real CSV template download */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  downloadFile('KRA_Bulk_Template.csv', 'kra_pin,tax_type,period,amount,method\nA012345678Y,PAYE,2025-06,42800,wallet\n', 'text/csv')
                }}
              >
                KRA_Bulk_Template.csv
              </a>
            </div>
          </div>
        )}
        {showFlow('bulk') && flows.bulk === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Preview &amp; Validate</h6>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>PIN</th>
                    <th>Tax Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['A012345678Y', 'PAYE', 'KES 42,800', 'Valid', styles.badgeS],
                      ['P987654321Z', 'VAT', 'KES 84,200', 'Valid', styles.badgeS],
                      ['R445566778X', 'TOT', 'KES 18,600', 'Warning', styles.badgeW],
                    ] as const
                  ).map(([pin, type, amt, status, tone]) => (
                    <tr key={pin}>
                      <td>{pin}</td>
                      <td>{type}</td>
                      <td>{amt}</td>
                      <td>
                        <span className={`${styles.badge} ${tone}`}>{status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {showFlow('bulk') && flows.bulk >= 3 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-all" />
              </div>
              <h5 className={styles.receiptTitle}>Bulk Filing Complete</h5>
              <p className={styles.receiptSub}>3 returns filed and 2 payments processed successfully.</p>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M7: Schedule Tax Payment ============ */}
      <MBox
        id="scheduleTaxModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calendar-event me-2" />
            Schedule Tax Payment
          </>
        }
        footer={actionFooter('scheduleTaxModal', 'Schedule', 'Tax payment scheduled successfully!', 'SCH-20250627-4421')}
      >
        {actionBody(
          'scheduleTaxModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>KRA PIN / Tax Type</label>
              <select className={styles.fc} defaultValue={SCHED_TYPES[0]}>
                {SCHED_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Amount</label>
              <input className={styles.fc} defaultValue="84200" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Frequency</label>
              <select className={styles.fc} defaultValue={FREQUENCIES[0]}>
                {FREQUENCIES.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Start Date</label>
              <input type="date" className={styles.fc} defaultValue="2025-07-05" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Payment Method</label>
              <select className={styles.fc} defaultValue={ARD_METHODS[0]}>
                {['PayMo Wallet', 'M-Pesa'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M8: Tax Optimizer ============ */}
      <MBox
        id="taxOptimizerModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-lightbulb me-2" style={{ color: 'var(--pm-warning)' }} />
            Tax Optimizer
          </>
        }
        footer={
          results.taxOptimizerModal ? (
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
              Done
            </button>
          ) : (
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
          )
        }
      >
        {actionBody(
          'taxOptimizerModal',
          <>
            <div className={`${styles.summaryBoxAccent} mb-3`}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-accent)' }}>POTENTIAL SAVINGS IDENTIFIED</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-accent)', fontFamily: 'var(--pm-font-display)' }}>KES 47,800</div>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Opportunity</th>
                    <th>Estimated Saving</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Claim additional rental income relief</td>
                    <td>KES 31,200</td>
                    <td>
                      <button
                        className={`${styles.btnPm} ${styles.btnSm}`}
                        onClick={() => doAction('taxOptimizerModal', 'Relief claim submitted to KRA.')}
                      >
                        Claim
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>Investment deduction (solar)</td>
                    <td>KES 12,400</td>
                    <td>
                      <button
                        className={`${styles.btnPm} ${styles.btnSm}`}
                        onClick={() => doAction('taxOptimizerModal', 'Deduction added to next return.')}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>Early filing penalty avoidance</td>
                    <td>KES 4,200</td>
                    <td>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('fileReturnModal')}>
                        File Early
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M9: Link New KRA PIN ============ */}
      <MBox
        id="addKRAModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-plus-circle me-2" style={{ color: 'var(--pm-primary-light)' }} />
            Link New KRA PIN
          </>
        }
        footer={actionFooter('addKRAModal', 'Link PIN', 'KRA PIN linked successfully! Syncing obligations...', 'KRA-20250627-1192')}
      >
        {actionBody(
          'addKRAModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>KRA PIN</label>
              <input className={styles.fc} placeholder="A012345678Y" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Entity Type</label>
              <select className={styles.fc} defaultValue={ENTITY_TYPES[0]}>
                {ENTITY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Entity Name</label>
              <input className={styles.fc} placeholder="Company or Individual Name" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Default Payment Source</label>
              <select className={styles.fc} defaultValue={LINK_SOURCES[0]}>
                {LINK_SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="ak1" />
              <label className="form-check-label" htmlFor="ak1" style={{ fontSize: 13 }}>
                Enable auto-sync with iTax
              </label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M10: Sync iTax ============ */}
      <MBox
        id="syncItaxModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-repeat me-2" />
            Sync with iTax
          </>
        }
        footer={actionFooter('syncItaxModal', 'Sync Now', 'iTax sync completed successfully! 3 new obligations found.')}
      >
        {actionBody(
          'syncItaxModal',
          <>
            <div className={`${styles.summaryBoxInfo} mb-3`}>
              <div style={{ fontSize: 13 }}>Last sync: 27 Jun 2025, 09:14</div>
              <div style={{ fontSize: 13 }}>Obligations synced: 12</div>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="sy1" />
              <label className="form-check-label" htmlFor="sy1" style={{ fontSize: 13 }}>
                Full obligation sync
              </label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="sy2" />
              <label className="form-check-label" htmlFor="sy2" style={{ fontSize: 13 }}>
                Payment history
              </label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="sy3" />
              <label className="form-check-label" htmlFor="sy3" style={{ fontSize: 13 }}>
                Refund status
              </label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M11: Tax Receipt ============ */}
      <MBox
        id="taxReceiptModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-receipt me-2" />
            Tax Payment Receipt
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
          <h5 className={styles.receiptTitle}>Official Receipt</h5>
          <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
            <BoxRow label="KRA PIN" value="A012345678Y" />
            <BoxRow label="Tax Type" value="PAYE" />
            <BoxRow label="Amount" value="KES 42,800" />
            <BoxRow label="iTax Ref" value="ITX-882341" />
            <BoxRow label="Date" value="27 Jun 2025" last />
          </div>
          <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
            {/* LEGACY BRIDGE: dead PDF/Share buttons in legacy → real file download */}
            <button
              className={`${styles.btnPm} ${styles.btnSm}`}
              onClick={() => downloadFile('KRA-Receipt-ITX-882341.txt', 'KRA Tax Payment Receipt\nPIN: A012345678Y\nType: PAYE\nAmount: KES 42,800\niTax Ref: ITX-882341\nDate: 27 Jun 2025')}
            >
              <i className="bi bi-download" /> PDF
            </button>
            <button
              className={`${styles.btnPm} ${styles.btnSm}`}
              onClick={() => downloadFile('KRA-Receipt-ITX-882341-share.txt', 'KRA receipt ITX-882341 — KES 42,800 PAYE paid 27 Jun 2025 via PayMo.')}
            >
              <i className="bi bi-whatsapp" /> Share
            </button>
          </div>
        </div>
      </MBox>

      {/* ============ M12: Government Service Receipt ============ */}
      <MBox
        id="govReceiptModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-receipt me-2" />
            Government Service Receipt
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
          <h5 className={styles.receiptTitle}>Payment Confirmed</h5>
          <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
            <BoxRow label="Service" value="Passport Renewal" />
            <BoxRow label="Ref" value="P-449281" />
            <BoxRow label="Amount" value="KES 4,500" />
            <BoxRow label="Date" value="27 Jun 2025" last />
          </div>
        </div>
      </MBox>

      {/* ============ M13: Track Government Service ============ */}
      <MBox
        id="trackGovModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-truck me-2" />
            Track Government Service
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="mb-3">
          <label className={styles.fl}>Application Ref</label>
          <input className={styles.fc} defaultValue="P-449281" />
        </div>
        <div className={styles.summaryBox}>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Status</span>
            <span className={`${styles.badge} ${styles.badgeI}`}>Under Processing</span>
          </div>
          <BoxRow label="Stage" value="Biometric Verification" />
          <BoxRow label="Est. Completion" value="02 Jul 2025" last />
        </div>
      </MBox>

      {/* ============ M14: Compliance Health Dashboard ============ */}
      <MBox
        id="complianceHealthModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" style={{ color: 'var(--pm-accent)' }} />
            Compliance Health Dashboard
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('payKRAModal')}>
              Resolve Issues
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          {(
            [
              ['94', 'COMPLIANCE', 'var(--pm-accent-soft)', 'var(--pm-accent)'],
              ['0', 'PENALTIES', 'var(--pm-info-soft)', 'var(--pm-info)'],
              ['2', 'RETURNS DUE', 'var(--pm-warning-soft)', 'var(--pm-warning)'],
              ['18', 'MONTHS CLEAN', 'var(--pm-purple-soft)', 'var(--pm-purple)'],
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
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Score</th>
                <th>Issues</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>James Kamau</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>98</span>
                </td>
                <td>None</td>
                <td>PAYE 15 Jul</td>
              </tr>
              <tr>
                <td>JK Holdings</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>92</span>
                </td>
                <td>VAT due soon</td>
                <td>File 05 Jul</td>
              </tr>
              <tr>
                <td>JK Investments</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeW}`}>78</span>
                </td>
                <td>CGT overdue</td>
                <td>Pay immediately</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M15: All Items Requiring Attention ============ */}
      <MBox
        id="attentionModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-circle me-2" style={{ color: 'var(--pm-warning)' }} />
            All Items Requiring Attention
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
            ['VAT return due in 2 days', 'P987654321Z · KES 84,200', 'File', 'fileReturnModal', true],
            ['CGT overdue', 'C112233445W · KES 62,000', 'Pay', 'payKRAModal', true],
            ['Passport renewal ready', 'P-449281 · KES 4,500', 'Pay', 'payECitizenModal', false],
          ] as const
        ).map(([title, sub, label, modal, danger]) => (
          <div className={styles.sr} key={title}>
            <div>
              <strong>{title}</strong>
              <div className={styles.mutedSmall}>{sub}</div>
            </div>
            <button className={`${styles.btnPm} ${styles.btnSm} ${danger ? styles.btnPmD : ''}`} onClick={() => onOpen(modal)}>
              {label}
            </button>
          </div>
        ))}
      </MBox>

      {/* ============ M16: Full Tax Payment History ============ */}
      <MBox
        id="taxHistoryModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-clock-history me-2" />
            Full Tax Payment History
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
                <th>Date</th>
                <th>PIN</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Ref</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>25 Jun</td>
                <td>A012345678Y</td>
                <td>PAYE</td>
                <td>KES 42,800</td>
                <td>M-Pesa</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Paid</span>
                </td>
                <td>ITX-882341</td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('taxReceiptModal')}>
                    Receipt
                  </button>
                </td>
              </tr>
              <tr>
                <td>22 Jun</td>
                <td>P987654321Z</td>
                <td>VAT</td>
                <td>KES 84,200</td>
                <td>Wallet</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Filed</span>
                </td>
                <td>ITX-881902</td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('fileReturnModal')}>
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td>15 Jun</td>
                <td>R445566778X</td>
                <td>TOT</td>
                <td>KES 18,600</td>
                <td>Bank</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Paid</span>
                </td>
                <td>ITX-880991</td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('taxReceiptModal')}>
                    Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M17: Government Services History ============ */}
      <MBox
        id="govHistoryModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-clock-history me-2" />
            Government Services History
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
                <th>Date</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ref</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>18 Jun</td>
                <td>Passport Renewal</td>
                <td>eCitizen</td>
                <td>KES 4,500</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeI}`}>Processing</span>
                </td>
                <td>P-449281</td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('trackGovModal')}>
                    Track
                  </button>
                </td>
              </tr>
              <tr>
                <td>15 Jun</td>
                <td>Land Rates</td>
                <td>Nairobi County</td>
                <td>KES 42,300</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeS}`}>Paid</span>
                </td>
                <td>CCN-772910</td>
                <td>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('govReceiptModal')}>
                    Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M18: Dispute KRA Assessment ============ */}
      <MBox
        id="disputeKRAModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-triangle me-2" style={{ color: 'var(--pm-warning)' }} />
            Dispute KRA Assessment
          </>
        }
        footer={actionFooter('disputeKRAModal', 'Submit Dispute', 'Dispute filed successfully. Case #KRA-DSP-99182 created.', 'KRA-DSP-99182')}
      >
        {actionBody(
          'disputeKRAModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>KRA PIN</label>
              <select className={styles.fc} defaultValue="C112233445W — JK Investments">
                <option>C112233445W — JK Investments</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Assessment Ref</label>
              <input className={styles.fc} defaultValue="CGT-2025-6621" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Dispute Reason</label>
              <textarea
                className={styles.fc}
                rows={3}
                defaultValue="The capital gains calculation does not account for improvement costs of KES 1.2M incurred in 2023."
              />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Upload Supporting Documents</label>
              <input type="file" className={styles.fc} />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M19: Profile ============ */}
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
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@email.com · +254 712 345 890</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            <div className="col-6">
              <div className={`${styles.summaryBox} p-2`}>
                <span className={styles.mutedSmall}>KRA PINs</span>
                <br />
                <strong>4 linked</strong>
              </div>
            </div>
            <div className="col-6">
              <div className={`${styles.summaryBox} p-2`}>
                <span className={styles.mutedSmall}>Compliance</span>
                <br />
                <strong style={{ color: 'var(--pm-accent)' }}>94/100</strong>
              </div>
            </div>
            <div className="col-6">
              <div className={`${styles.summaryBox} p-2`}>
                <span className={styles.mutedSmall}>Member Since</span>
                <br />
                <strong>Mar 2022</strong>
              </div>
            </div>
            <div className="col-6">
              <div className={`${styles.summaryBox} p-2`}>
                <span className={styles.mutedSmall}>Open Cases</span>
                <br />
                <strong>2</strong>
              </div>
            </div>
          </div>
        </div>
      </MBox>

      {/* ============ M20: Government Notifications ============ */}
      <MBox
        id="govNotifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell me-2" />
            Government Notifications (9)
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
            <strong>VAT return due in 2 days</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>P987654321Z · File before 05 Jul</div>
          </div>
          <div className={`${styles.summaryBoxWarn} mb-2`} style={{ fontSize: 13 }}>
            <strong>CGT overdue</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>C112233445W · Pay immediately</div>
          </div>
          <div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 13 }}>
            <strong>Passport application update</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>P-449281 · Biometric stage</div>
          </div>
          <div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}>
            <strong>Land rates payment confirmed</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>Nairobi County · Receipt available</div>
          </div>
        </div>
      </MBox>

      {/* ============ M21: Tax Optimizer (legacy placeholder duplicate — kept for parity) ============ */}
      <MBox id="taxOptimizerModal2" active={active} onClose={onClose} title="Tax Optimizer" footer={
        <button className={styles.btnPm} onClick={onClose}>
          Close
        </button>
      }>
        <p>Additional optimization opportunities available.</p>
      </MBox>
    </>
  )
}
