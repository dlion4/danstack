import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/fees.module.css'

/* ============================================================================
   Fee & Commission Management — modal layer (legacy page 1.15, 25 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; legacy showLoading 1400ms spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state; labeled steppers:
                          fee(4: Details/Pricing/Conditions/Done)
                          calc(3: Details/Breakdown/Done)
                          waiver(3: Details/Eligibility/Done)
                          settle(3: Select/Review/Done)
     calculateFee/advCalc → controlled inputs + live derived totals below
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

/* ---------- LEGACY BRIDGE: flows map from page JS ---------- */
type FlowKey = 'fee' | 'calc' | 'waiver' | 'settle'
const FLOWS: Record<FlowKey, { total: number; labels: string[]; modal: string }> = {
  fee: { total: 4, labels: ['Details', 'Pricing', 'Conditions', 'Done'], modal: 'addFeeRuleModal' },
  calc: { total: 3, labels: ['Details', 'Breakdown', 'Done'], modal: 'feeCalculatorModal' },
  waiver: { total: 3, labels: ['Details', 'Eligibility', 'Done'], modal: 'waiverModal' },
  settle: { total: 3, labels: ['Select', 'Review', 'Done'], modal: 'settlementModal' },
}

const TXN_TYPES = ['Inter-bank Transfer', 'Instant Payment', 'Wallet Transfer', 'Agent Cash-in']
const FEE_TYPES = ['Percentage', 'Fixed Amount', 'Tiered']
const WAIVER_TYPES = ['Hardship', 'Promotional', 'Regulatory', 'Partner']
const SETTLEMENT_TYPES = ['Agent Commission — June 2025', 'Partner Revenue Share', 'Merchant Cashback']
const REPORT_PERIODS = ['June 2025', 'Q2 2025', 'YTD 2025']
const FORMATS = ['PDF', 'Excel', 'CSV']
const EXEMPTION_TYPES = ['Regulatory (CBK)', 'Government Disbursement', 'Charity / NGO', 'Staff Benefit']
const PARTNERS = ['Safaricom M-Pesa', 'Airtel Money', 'Equity Bank']
const SETTLE_FREQS = ['Weekly', 'Bi-weekly', 'Monthly']
const REGULATORS = ['CBK — Central Bank of Kenya', 'KRA — Kenya Revenue Authority', 'CAK — Competition Authority']
const HARDSHIP_REASONS = ['Medical emergency', 'Job loss', 'Natural disaster', 'Other']
const ADV_TYPES = ['Inter-bank Transfer', 'Instant Payment', 'Wallet to Bank']

interface Result {
  msg: string
  ref?: string
}

/* ---------- LEGACY BRIDGE: advCalc() — verbatim formula from page JS ----------
   base = amt*0.0085; Instant → 0.45%; Wallet → KES 25 flat; VAT 16%; network KES 50. */
function advCalc(amount: number, type: string) {
  let base = amount * 0.0085
  if (type.includes('Instant')) base = amount * 0.0045
  if (type.includes('Wallet')) base = 25
  const vat = base * 0.16
  const net = 50
  return { base, vat, net, total: base + vat + net }
}

const fmt = (n: number) => `KES ${Math.round(n).toLocaleString('en-KE')}`

export default function FeesModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<FlowKey, number>>({ fee: 1, calc: 1, waiver: 1, settle: 1 })

  /* LEGACY BRIDGE: #advAmount oninput / #advType onchange → advCalc() */
  const [advAmount, setAdvAmount] = useState('500000')
  const [advType, setAdvType] = useState('Inter-bank Transfer')
  const adv = advCalc(parseFloat(advAmount) || 0, advType)

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ fee: 1, calc: 1, waiver: 1, settle: 1 })
      setBusy(null)
      setAdvAmount('500000')
      setAdvType('Inter-bank Transfer')
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) — 1400ms as legacy ---------- */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1400)
  }

  /* ---------- LEGACY BRIDGE: nextFlow(key,total) with modalMap close ---------- */
  const nextFlow = (key: FlowKey) => {
    const f = FLOWS[key]
    const cur = flows[key]
    if (cur === f.total - 1) {
      setBusy(f.modal)
      busyTimer.current = window.setTimeout(() => {
        setFlows((prev) => ({ ...prev, [key]: f.total }))
        setBusy(null)
      }, 1400)
      return
    }
    if (cur >= f.total) {
      onClose()
      return
    }
    setFlows((prev) => ({ ...prev, [key]: cur + 1 }))
  }

  /* ---------- receipt (exact legacy doAction result body) ---------- */
  const receipt = (id: string) => {
    const r = results[id]
    if (!r) return null
    return (
      <div className={styles.receipt}>
        <div className={styles.ri}>
          <i className="bi bi-check-lg" />
        </div>
        <h5 className={styles.receiptTitle}>{r.msg}</h5>
        {r.ref && <p className={styles.receiptSub}>Reference: {r.ref}</p>}
        <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
          <button
            className={`${styles.btnPm} ${styles.btnSm}`}
            onClick={() =>
              downloadFile(
                `${r.ref ?? 'paymo-receipt'}.txt`,
                `PayMo — Fee & Commission Management\n${r.msg}${r.ref ? `\nReference: ${r.ref}` : ''}\nGenerated: ${new Date().toLocaleString()}`,
              )
            }
          >
            <i className="bi bi-download" /> Save
          </button>
          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>
            <i className="bi bi-share" /> Continue
          </button>
        </div>
      </div>
    )
  }

  const actionBody = (id: string, form: ReactNode) => (
    <div style={{ position: 'relative' }}>
      {busy === id && <BusyOverlay />}
      {results[id] ? receipt(id) : form}
    </div>
  )

  const actionFooter = (id: string, label: ReactNode, msg: string, ref?: string) =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          Cancel
        </button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction(id, msg, ref)}>
          {label}
        </button>
      </>
    )

  /* ---------- flow stepper (legacy renderStepper) ---------- */
  const stepper = (key: FlowKey) => {
    const f = FLOWS[key]
    const cur = flows[key]
    return (
      <div className={styles.stepper}>
        {f.labels.map((l, i) => {
          const n = i + 1
          return (
            <div key={l} style={{ display: 'contents' }}>
              <div className={`${styles.step} ${n < cur ? styles.stepDone : ''} ${n === cur ? styles.stepActive : ''}`}>
                <div className={styles.stepN}>{n < cur ? <i className="bi bi-check" /> : n}</div>
                <div className={styles.stepL}>{l}</div>
              </div>
              {i < f.labels.length - 1 && <div className={styles.stepLine} />}
            </div>
          )
        })}
      </div>
    )
  }

  /* ---------- flow footer (legacy Continue → Done) ---------- */
  const flowFooter = (key: FlowKey, cancelLabel = 'Cancel') => {
    const f = FLOWS[key]
    const cur = flows[key]
    return (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          {cancelLabel}
        </button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow(key)} disabled={busy === f.modal}>
          {cur >= f.total ? (
            'Done'
          ) : (
            <>
              Continue <i className="bi bi-arrow-right" />
            </>
          )}
        </button>
      </>
    )
  }

  const complianceTiles = [
    { value: '98', label: 'COMPLIANCE', vColor: 'var(--pm-accent)', bg: 'var(--pm-accent-soft)', big: true },
    { value: '0', label: 'OPEN ISSUES', vColor: 'var(--pm-info)', bg: 'var(--pm-info-soft)' },
    { value: '3', label: 'RECOMMENDATIONS', vColor: 'var(--pm-warning)', bg: 'var(--pm-warning-soft)' },
    { value: '47', label: 'RULES AUDITED', vColor: 'var(--pm-purple)', bg: 'var(--pm-purple-soft)' },
  ]
  const complianceRows = [
    ['CBK Fee Transparency', '15 Jun 2025', '15 Sep 2025'],
    ['KRA Withholding Tax', '01 Jun 2025', '01 Jul 2025'],
    ['Consumer Protection Act', '20 Jun 2025', '20 Sep 2025'],
  ]
  const leaderboard: [string, string, string, string, string, 'badgeS' | 'badgeP'][] = [
    ['1', 'AG-8821 — Grace W.', 'KES 48.2M', 'KES 866K', 'Elite', 'badgeS'],
    ['2', 'AG-7744 — Peter M.', 'KES 39.8M', 'KES 715K', 'Elite', 'badgeS'],
    ['3', 'AG-9910 — Amina K.', 'KES 31.4M', 'KES 565K', 'Pro', 'badgeP'],
    ['4', 'AG-3342 — John O.', 'KES 27.9M', 'KES 502K', 'Pro', 'badgeP'],
    ['5', 'AG-5510 — Sarah N.', 'KES 24.1M', 'KES 433K', 'Pro', 'badgeP'],
  ]
  const attentionRows = [
    { title: 'Tier 3 commission underperforming', sub: 'Only 12% of target volume', label: 'Review', modal: 'editCommissionModal' },
    { title: 'Fee rule FR-415 expiring in 5 days', sub: 'Promotional 0.5% for SMEs', label: 'Extend', modal: 'editFeeRuleModal' },
    { title: 'Settlement reconciliation pending', sub: 'KES 2.1M difference flagged', label: 'Reconcile', modal: 'settlementModal' },
    { title: 'Waiver WV-101 budget 78% used', sub: 'Consider increasing budget', label: 'Adjust', modal: 'editWaiverModal' },
  ]
  const notifItems = [
    { box: 'summaryBoxWarn', title: 'FR-415 expires in 5 days', sub: 'SME promotional fee ending soon.' },
    { box: 'summaryBoxDanger', title: 'Settlement reconciliation difference', sub: 'KES 2.1M flagged for review.' },
    { box: 'summaryBoxAccent', title: 'New commission tier T4 activated', sub: '73 agents now eligible.' },
    { box: 'summaryBox', title: 'Waiver WV-101 budget at 78%', sub: 'Consider top-up.' },
  ] as const
  const notifSettingsRows: [string, boolean, boolean, boolean][] = [
    ['Fee rule changes', true, false, true],
    ['Settlement completed', true, true, false],
    ['Waiver budget alerts', true, false, true],
    ['Commission payout', true, true, true],
  ]
  const tierPerfRows = [
    ['T1 — Starter', '1,240', 'KES 312K', '78%', '+12%'],
    ['T2 — Growth', '682', 'KES 1.2M', '89%', '+24%'],
    ['T3 — Pro', '189', 'KES 4.8M', '94%', '+18%'],
    ['T4 — Elite', '73', 'KES 28.4M', '97%', '+31%'],
  ]
  const feeCompareRows: [string, string, string, string, string, 'badgeS' | 'badgeI' | 'badgeW', boolean][] = [
    ['PayMo', '0.85%', 'KES 25', '0.45%', 'Best', 'badgeS', true],
    ['Bank A', '1.2%', 'KES 35', '0.8%', 'Average', 'badgeI', false],
    ['Bank B', '1.0%', 'KES 30', '0.6%', 'Average', 'badgeI', false],
    ['Mobile Money X', '1.5%', 'KES 20', '1.0%', 'Higher', 'badgeW', false],
  ]

  return (
    <>
      {/* ============ M1: Add Fee Rule (flow: fee, 4 steps) ============ */}
      <MBox
        id="addFeeRuleModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-plus-circle" style={{ color: 'var(--pm-info)' }} /> Create New Fee Rule
          </>
        }
        footer={flowFooter('fee')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'addFeeRuleModal' && <BusyOverlay />}
          {stepper('fee')}
          {flows.fee === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Basic Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.fl}>Rule Name</label>
                  <input className={styles.fc} defaultValue="SME Instant Transfer" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Transaction Type</label>
                  <select className={styles.fc}>
                    {TXN_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Fee Type</label>
                  <select className={styles.fc}>
                    {FEE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Effective Date</label>
                  <input type="date" className={styles.fc} defaultValue="2025-07-01" />
                </div>
              </div>
            </div>
          )}
          {flows.fee === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Pricing</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.fl}>Rate / Amount</label>
                  <input className={styles.fc} defaultValue="0.75" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Unit</label>
                  <select className={styles.fc}>
                    <option>% of transaction</option>
                    <option>KES fixed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Minimum Fee</label>
                  <input className={styles.fc} defaultValue="10" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Maximum Fee</label>
                  <input className={styles.fc} defaultValue="5000" />
                </div>
              </div>
              <div className={`${styles.summaryBoxInfo} mt-3`} style={{ fontSize: 12 }}>
                <i className="bi bi-info-circle me-1" /> Preview: KES 100,000 transfer = KES 750 fee
              </div>
            </div>
          )}
          {flows.fee === 3 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 3: Conditions &amp; Approval</h6>
              <div className="mb-3">
                <label className={styles.fl}>Applicable Segments</label>
                {[
                  { label: 'All customers', on: true },
                  { label: 'SME only', on: false },
                  { label: 'Agents only', on: false },
                ].map((s, i) => (
                  <div className={`form-check ${i < 2 ? 'mb-1' : ''}`} key={s.label}>
                    <input className="form-check-input" type="checkbox" defaultChecked={s.on} id={`seg-${i}`} />
                    <label className="form-check-label" htmlFor={`seg-${i}`}>
                      {s.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" defaultChecked id="fee-approval" />
                <label className="form-check-label" htmlFor="fee-approval">
                  Require manual approval for changes
                </label>
              </div>
            </div>
          )}
          {flows.fee === 4 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Fee Rule Created</h5>
              <p className={styles.receiptSub}>Rule FR-448 has been created and is pending approval.</p>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M2: Edit Fee Rule ============ */}
      <MBox
        id="editFeeRuleModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-pencil" style={{ color: 'var(--pm-info)' }} /> Edit Fee Rule
          </>
        }
        footer={actionFooter(
          'editFeeRuleModal',
          'Save Changes',
          'Fee rule updated successfully. Changes take effect immediately.',
        )}
      >
        {actionBody(
          'editFeeRuleModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Rule</label>
              <input className={styles.fc} defaultValue="FR-415 — SME Promotional" />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Rate</label>
                <input className={styles.fc} defaultValue="0.50" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Max Fee</label>
                <input className={styles.fc} defaultValue="2500" />
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className={styles.fl}>Expiry Date</label>
              <input type="date" className={styles.fc} defaultValue="2025-07-05" />
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" defaultChecked id="fee-active" />
              <label className="form-check-label" htmlFor="fee-active">
                Active
              </label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M3: Fee Calculator (flow: calc, 3 steps) ============ */}
      <MBox
        id="feeCalculatorModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calculator" style={{ color: 'var(--pm-info)' }} /> Advanced Fee Calculator
          </>
        }
        footer={flowFooter('calc', 'Close')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'feeCalculatorModal' && <BusyOverlay />}
          {stepper('calc')}
          {flows.calc === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Transaction Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.fl}>From Account</label>
                  <select className={styles.fc}>
                    <option>PayMo Wallet — KES 24,500</option>
                    <option>Equity Bank ****4521</option>
                    <option>KCB M-Pesa</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>To Account</label>
                  <select className={styles.fc}>
                    <option>Equity Bank ****7788</option>
                    <option>Co-op Bank ****9910</option>
                    <option>PayMo Wallet</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Amount (KES)</label>
                  {/* LEGACY BRIDGE: #advAmount oninput → advCalc() */}
                  <input className={styles.fc} value={advAmount} onChange={(e) => setAdvAmount(e.target.value)} inputMode="numeric" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Transaction Type</label>
                  {/* LEGACY BRIDGE: #advType onchange → advCalc() */}
                  <select className={styles.fc} value={advType} onChange={(e) => setAdvType(e.target.value)}>
                    {ADV_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          {flows.calc === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Fee Breakdown</h6>
              <div className={`${styles.summaryBox} mb-3`}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Base Fee ({advType.includes('Instant') ? '0.45' : advType.includes('Wallet') ? 'flat' : '0.85'}%)</span>
                  <strong>{fmt(adv.base)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>VAT (16%)</span>
                  <strong>{fmt(adv.vat)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Network Fee</span>
                  <strong>{fmt(adv.net)}</strong>
                </div>
                <hr className={styles.divider} />
                <div className="d-flex justify-content-between">
                  <span className={styles.fwBold13}>Total Cost</span>
                  <strong className={styles.textAccent} style={{ fontSize: 18 }}>
                    {fmt(adv.total)}
                  </strong>
                </div>
              </div>
              <div className={styles.summaryBoxAccent} style={{ fontSize: 12 }}>
                <i className="bi bi-lightbulb me-1" /> You save KES 1,200 compared to average market rate.
              </div>
            </div>
          )}
          {flows.calc === 3 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Fee Calculated</h5>
              <p className={styles.receiptSub}>Transaction cost preview complete. Ready to execute.</p>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M4: Add Commission Tier ============ */}
      <MBox
        id="addCommissionTierModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-layers" style={{ color: 'var(--pm-accent)' }} /> Create Commission Tier
          </>
        }
        footer={actionFooter('addCommissionTierModal', 'Create Tier', 'Commission tier created successfully!', 'CT-013')}
      >
        {actionBody(
          'addCommissionTierModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Tier Name</label>
              <input className={styles.fc} defaultValue="Super Agent" />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Volume Threshold (KES)</label>
                <input className={styles.fc} defaultValue="50000000" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Commission Rate</label>
                <input className={styles.fc} defaultValue="2.2" />
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className={styles.fl}>Benefits</label>
              {[
                { label: 'Priority support', on: true },
                { label: 'Higher payout frequency', on: true },
                { label: 'Dedicated account manager', on: false },
              ].map((b, i) => (
                <div className={`form-check ${i < 2 ? 'mb-1' : ''}`} key={b.label}>
                  <input className="form-check-input" type="checkbox" defaultChecked={b.on} id={`ct-${i}`} />
                  <label className="form-check-label" htmlFor={`ct-${i}`}>
                    {b.label}
                  </label>
                </div>
              ))}
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M5: Edit Commission ============ */}
      <MBox
        id="editCommissionModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-pencil" style={{ color: 'var(--pm-accent)' }} /> Edit Commission Tier
          </>
        }
        footer={actionFooter('editCommissionModal', 'Save Changes', 'Commission tier updated successfully!')}
      >
        {actionBody(
          'editCommissionModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Tier</label>
              <input className={styles.fc} defaultValue="T3 — Pro" />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Volume Threshold</label>
                <input className={styles.fc} defaultValue="2000000" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Rate</label>
                <input className={styles.fc} defaultValue="1.4" />
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className={styles.fl}>Status</label>
              <select className={styles.fc}>
                <option>Active</option>
                <option>Paused</option>
                <option>Archived</option>
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M6: Waiver (flow: waiver, 3 steps) ============ */}
      <MBox
        id="waiverModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gift" style={{ color: 'var(--pm-warning)' }} /> Create Fee Waiver
          </>
        }
        footer={flowFooter('waiver')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'waiverModal' && <BusyOverlay />}
          {stepper('waiver')}
          {flows.waiver === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Waiver Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.fl}>Waiver Name</label>
                  <input className={styles.fc} defaultValue="Flood Relief 2025" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Type</label>
                  <select className={styles.fc}>
                    {WAIVER_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Discount</label>
                  <input className={styles.fc} defaultValue="100" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Budget (KES)</label>
                  <input className={styles.fc} defaultValue="5000000" />
                </div>
              </div>
            </div>
          )}
          {flows.waiver === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Eligibility</h6>
              <div className="mb-3">
                <label className={styles.fl}>Eligible Segments</label>
                {[
                  { label: 'All customers in affected counties', on: true },
                  { label: 'SME customers only', on: false },
                  { label: 'Agents in flood zones', on: false },
                ].map((s, i) => (
                  <div className={`form-check ${i < 2 ? 'mb-1' : ''}`} key={s.label}>
                    <input className="form-check-input" type="checkbox" defaultChecked={s.on} id={`wseg-${i}`} />
                    <label className="form-check-label" htmlFor={`wseg-${i}`}>
                      {s.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Valid Until</label>
                <input type="date" className={styles.fc} defaultValue="2025-09-30" />
              </div>
            </div>
          )}
          {flows.waiver === 3 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Waiver Created</h5>
              <p className={styles.receiptSub}>WV-118 — Flood Relief 2025 is now active.</p>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M7: Edit Waiver ============ */}
      <MBox
        id="editWaiverModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-pencil" style={{ color: 'var(--pm-warning)' }} /> Edit Waiver
          </>
        }
        footer={actionFooter('editWaiverModal', 'Save Changes', 'Waiver updated successfully!')}
      >
        {actionBody(
          'editWaiverModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Waiver</label>
              <input className={styles.fc} defaultValue="WV-101 — SME First Transfer" />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Discount %</label>
                <input className={styles.fc} defaultValue="100" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Remaining Budget</label>
                <input className={styles.fc} defaultValue="1100000" />
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className={styles.fl}>Status</label>
              <select className={styles.fc}>
                <option>Active</option>
                <option>Paused</option>
                <option>Expired</option>
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M8: Settlement (flow: settle, 3 steps) ============ */}
      <MBox
        id="settlementModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-cash-stack" style={{ color: 'var(--pm-purple)' }} /> Run Settlement
          </>
        }
        footer={flowFooter('settle')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'settlementModal' && <BusyOverlay />}
          {stepper('settle')}
          {flows.settle === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Select Settlement</h6>
              <div className="mb-3">
                <label className={styles.fl}>Settlement Type</label>
                <select className={styles.fc}>
                  {SETTLEMENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className={styles.summaryBox}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Amount</span>
                  <strong>KES 4,820,000</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Recipients</span>
                  <strong>2,184 agents</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Status</span>
                  <span className={`${styles.badge} ${styles.badgeW}`}>Ready to settle</span>
                </div>
              </div>
            </div>
          )}
          {flows.settle === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Review &amp; Approve</h6>
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Volume</th>
                      <th>Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['AG-8821', 'KES 48.2M', 'KES 866,400'],
                      ['AG-7744', 'KES 39.8M', 'KES 715,200'],
                      ['AG-9910', 'KES 31.4M', 'KES 564,600'],
                    ].map(([a, v, c]) => (
                      <tr key={a}>
                        <td>{a}</td>
                        <td>{v}</td>
                        <td>{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" defaultChecked id="settle-approve" />
                <label className="form-check-label" htmlFor="settle-approve">
                  I approve this settlement batch
                </label>
              </div>
            </div>
          )}
          {flows.settle === 3 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Settlement Executed</h5>
              <p className={styles.receiptSub}>
                KES 4,820,000 disbursed to 2,184 agents. Reference: SET-20250627-9914
              </p>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M9: Compliance Check ============ */}
      <MBox
        id="complianceCheckModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shield-check" style={{ color: 'var(--pm-accent)' }} /> Compliance Health Check
          </>
        }
        footer={actionFooter('complianceCheckModal', 'Download Report', 'Full compliance report downloaded.')}
      >
        {actionBody(
          'complianceCheckModal',
          <>
            <div className="row g-3 mb-3">
              {complianceTiles.map((t) => (
                <div className="col-md-3 col-6" key={t.label}>
                  <div className={styles.miniStat} style={{ background: t.bg }}>
                    <div
                      className={t.big ? styles.miniStatBig : undefined}
                      style={t.big ? { color: t.vColor } : { fontSize: 24, fontWeight: 700, color: t.vColor }}
                    >
                      {t.value}
                    </div>
                    <div className={styles.miniStatLabel}>{t.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${styles.summaryBoxAccent} mb-3`} style={{ fontSize: 13 }}>
              <i className="bi bi-check-circle me-1" /> All fee disclosure requirements met. No regulatory breaches
              detected.
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Regulation</th>
                    <th>Status</th>
                    <th>Last Audit</th>
                    <th>Next Due</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceRows.map(([r, l, n]) => (
                    <tr key={r}>
                      <td>{r}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeS}`}>Compliant</span>
                      </td>
                      <td>{l}</td>
                      <td>{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M10: Fee Report ============ */}
      <MBox
        id="feeReportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-bar-graph" /> Fee Revenue Report
          </>
        }
        footer={actionFooter('feeReportModal', 'Generate Report', 'Fee revenue report generated and downloading...')}
      >
        {actionBody(
          'feeReportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Report Period</label>
              <select className={styles.fc}>
                {REPORT_PERIODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Format</label>
              <select className={styles.fc}>
                {FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBox} style={{ fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2">
                <span>Inter-bank Fees</span>
                <strong>KES 7.16M</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Wallet Fees</span>
                <strong>KES 3.12M</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Instant Fees</span>
                <strong>KES 6.84M</strong>
              </div>
              <hr className={styles.divider} />
              <div className="d-flex justify-content-between">
                <span className={styles.fwBold13}>Total Revenue</span>
                <strong className={styles.textAccent}>KES 18.4M</strong>
              </div>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M11: Agent Leaderboard ============ */}
      <MBox
        id="agentLeaderboardModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-trophy" style={{ color: 'var(--pm-warning)' }} /> Agent Leaderboard
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
                <th>Rank</th>
                <th>Agent</th>
                <th>Volume</th>
                <th>Commission</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(([rk, a, v, c, t, tone]) => (
                <tr key={rk}>
                  <td>{rk}</td>
                  <td>{a}</td>
                  <td>{v}</td>
                  <td>{c}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[tone]}`}>{t}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M12: Exemption ============ */}
      <MBox
        id="exemptionModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shield" /> Fee Exemptions
          </>
        }
        footer={actionFooter('exemptionModal', 'Create Exemption', 'Exemption rule created successfully!')}
      >
        {actionBody(
          'exemptionModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Exemption Type</label>
              <select className={styles.fc}>
                {EXEMPTION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Applicable Transactions</label>
              {[
                { label: 'All government-to-citizen payments', on: true },
                { label: 'Salary disbursements', on: true },
                { label: 'Charity donations', on: false },
              ].map((t, i) => (
                <div className={`form-check ${i < 2 ? 'mb-1' : ''}`} key={t.label}>
                  <input className="form-check-input" type="checkbox" defaultChecked={t.on} id={`ex-${i}`} />
                  <label className="form-check-label" htmlFor={`ex-${i}`}>
                    {t.label}
                  </label>
                </div>
              ))}
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M13: Attention Full ============ */}
      <MBox
        id="attentionFullModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-circle" style={{ color: 'var(--pm-warning)' }} /> All Items Requiring
            Attention
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        {attentionRows.map((r) => (
          <div className={styles.sr} key={r.title}>
            <div>
              <strong>{r.title}</strong>
              <div className={styles.mutedSmall}>{r.sub}</div>
            </div>
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen(r.modal)}>
              {r.label}
            </button>
          </div>
        ))}
      </MBox>

      {/* ============ M14: Fee Notifications ============ */}
      <MBox
        id="feeNotifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell" /> Fee Notifications (7)
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={() => onOpen('notifSettingsModal')}>
              Settings
            </button>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
          </>
        }
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {notifItems.map((n) => (
            <div key={n.title} className={`${styles[n.box]} mb-2`} style={{ fontSize: 13 }}>
              <strong>{n.title}</strong>
              <div className={styles.mutedSmall}>{n.sub}</div>
            </div>
          ))}
        </div>
      </MBox>

      {/* ============ M15: Profile ============ */}
      <MBox
        id="profileModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-person-circle" /> Profile
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
          <h5 className={styles.fwBold13} style={{ fontSize: 16, marginBottom: 2 }}>
            James Kamau
          </h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@paymo.co.ke</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            <div className="col-6">
              <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
                <span className={styles.mutedSmall}>Role</span>
                <br />
                <strong>Treasury Manager</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
                <span className={styles.mutedSmall}>Fee Rules Managed</span>
                <br />
                <strong>47</strong>
              </div>
            </div>
          </div>
        </div>
      </MBox>

      {/* ============ M16: Notification Settings ============ */}
      <MBox
        id="notifSettingsModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gear" /> Notification Preferences
          </>
        }
        footer={actionFooter('notifSettingsModal', 'Save', 'Notification preferences saved!')}
      >
        {actionBody(
          'notifSettingsModal',
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Alert Type</th>
                  <th>Push</th>
                  <th>SMS</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {notifSettingsRows.map(([label, push, sms, email]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    {[push, sms, email].map((v, i) => (
                      <td key={i}>
                        <input type="checkbox" defaultChecked={v} aria-label={`${label} channel ${i + 1}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )}
      </MBox>

      {/* ============ M17: Policy Config ============ */}
      <MBox
        id="policyConfigModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text" /> Fee Policy Configuration
          </>
        }
        footer={actionFooter('policyConfigModal', 'Save Policy', 'Policy updated successfully!')}
      >
        {actionBody(
          'policyConfigModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Policy Name</label>
              <input className={styles.fc} defaultValue="Standard Transaction Fee Policy 2025" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Effective From</label>
              <input type="date" className={styles.fc} defaultValue="2025-01-01" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Review Cycle</label>
              <select className={styles.fc}>
                <option>Quarterly</option>
                <option>Bi-annually</option>
                <option>Annually</option>
              </select>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="policy-board" />
              <label className="form-check-label" htmlFor="policy-board">
                Require board approval for changes &gt;10%
              </label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M18: Audit Detail ============ */}
      <MBox
        id="auditDetailModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-text" /> Audit Log Detail
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={styles.summaryBox} style={{ fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Action ID</span>
            <strong>AUD-20250626-8812</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>User</span>
            <strong>James K. (Treasury)</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>IP Address</span>
            <strong>102.68.45.112</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Timestamp</span>
            <strong>26 Jun 2025, 14:22 EAT</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className={styles.mutedSmall}>Changes</span>
            <strong>FR-415 rate: 0.75% → 0.50%</strong>
          </div>
        </div>
      </MBox>

      {/* ============ M19: Bulk Upload ============ */}
      <MBox
        id="bulkUploadModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-upload" /> Bulk Fee Rule Upload
          </>
        }
        footer={actionFooter('bulkUploadModal', 'Upload & Validate', '47 fee rules imported successfully!', 'BULK-20250627')}
      >
        {actionBody(
          'bulkUploadModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Upload CSV</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Download template:{' '}
              {/* LEGACY BRIDGE: alert('Template downloaded!') → real CSV download */}
              <button
                className="btn btn-link btn-sm p-0 align-baseline"
                style={{ fontSize: 12 }}
                onClick={() =>
                  downloadFile(
                    'fee_rules_template.csv',
                    'rule_name,transaction_type,fee_type,rate,min_fee,max_fee,effective_date\nSME Instant,Instant Payment,Percentage,0.75,10,5000,2025-07-01',
                    'text/csv',
                  )
                }
              >
                fee_rules_template.csv
              </button>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M20: Partner Payout ============ */}
      <MBox
        id="partnerPayoutModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-building" /> Partner Payout Configuration
          </>
        }
        footer={actionFooter('partnerPayoutModal', 'Save', 'Partner payout configuration saved!')}
      >
        {actionBody(
          'partnerPayoutModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Partner</label>
              <select className={styles.fc}>
                {PARTNERS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Revenue Share %</label>
              <input className={styles.fc} defaultValue="15" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Settlement Frequency</label>
              <select className={styles.fc}>
                {SETTLE_FREQS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M21: Regulatory Report ============ */}
      <MBox
        id="regulatoryReportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-check" /> Regulatory Fee Report
          </>
        }
        footer={actionFooter(
          'regulatoryReportModal',
          'Generate & Submit',
          'Regulatory report generated and submitted!',
          'REG-20250627',
        )}
      >
        {actionBody(
          'regulatoryReportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Report For</label>
              <select className={styles.fc}>
                {REGULATORS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Period</label>
              <select className={styles.fc}>
                {REPORT_PERIODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBox} style={{ fontSize: 12 }}>
              Report will include: Total fees collected, waiver utilization, commission payouts, and compliance
              attestations.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M22: Tier Performance ============ */}
      <MBox
        id="tierPerformanceModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bar-chart-line" /> Tier Performance Analytics
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('addCommissionTierModal')}>
              Add New Tier
            </button>
          </>
        }
      >
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Agents</th>
                <th>Avg Volume</th>
                <th>Retention</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {tierPerfRows.map(([t, a, v, r, g]) => (
                <tr key={t}>
                  <td>{t}</td>
                  <td>{a}</td>
                  <td>{v}</td>
                  <td>{r}</td>
                  <td>{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M23: Hardship Waiver ============ */}
      <MBox
        id="hardshipWaiverModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart" /> Hardship Waiver Request
          </>
        }
        footer={actionFooter(
          'hardshipWaiverModal',
          'Submit Request',
          'Hardship waiver request submitted for review!',
          'HW-20250627',
        )}
      >
        {actionBody(
          'hardshipWaiverModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer ID / Phone</label>
              <input className={styles.fc} defaultValue="0712 345 890" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Reason</label>
              <select className={styles.fc}>
                {HARDSHIP_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Requested Discount</label>
              <input className={styles.fc} defaultValue="100" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Supporting Document</label>
              <input type="file" className={styles.fc} />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M24: Fee Comparison Tool ============ */}
      <MBox
        id="feeCompareModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-left-right" /> Market Fee Comparison
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
                <th>Provider</th>
                <th>Inter-bank</th>
                <th>Wallet</th>
                <th>Instant</th>
                <th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {feeCompareRows.map(([p, ib, w, inst, overall, tone, strong]) => (
                <tr key={p}>
                  <td>{strong ? <strong>{p}</strong> : p}</td>
                  <td>{ib}</td>
                  <td>{w}</td>
                  <td>{inst}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[tone]}`}>{overall}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M25: Final Confirmation ============ */}
      <MBox
        id="finalConfirmModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-check2-circle" /> Confirm Action
          </>
        }
        footer={actionFooter(
          'finalConfirmModal',
          'Confirm & Execute',
          'Action confirmed and executed successfully!',
          'CONF-20250627',
        )}
      >
        {actionBody(
          'finalConfirmModal',
          <div className={styles.summaryBoxAccent}>
            <i className="bi bi-info-circle me-1" /> This action will affect 142,890 transactions and KES 18.4M in
            monthly revenue. Are you sure?
          </div>,
        )}
      </MBox>
    </>
  )
}
