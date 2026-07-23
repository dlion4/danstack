import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/disputes.module.css'

/* ============================================================================
   Dispute & Chargeback Management — modal layer (legacy page 1.16, 21 modals)
   LEGACY BRIDGE:
     openM(id)           → parent lifts `active` state into this component
     doAction(id,msg)    → `results` state; legacy showLoading 1400ms spinner,
                           then swaps body to a receipt (legacy 1.16 receipt has
                           a single Save button — kept exactly)
     nextFlow(key,total) → `flows` state; UNLABELED steppers ("Step N"):
                           disp(4), ev(3), bulk(3); close via closeM(key+'Modal')
     sw(prefix,key,btn)  → `tabs` state (evpkg / mrisk / ran / drule)
     quickDispute(type)  → closeM('disputeModal') then openM('quickDisputeModal')
     cacheAndReset()     → useEffect on close resets flows + results + tabs
   Legacy defects documented (kept non-breaking):
     - M18–M20 in legacy HTML are TRUNCATED duplicate stubs of quickDisputeModal /
       disputeDetailModal / chargebackTrackerModal — first definitions win in the
       DOM, so the stubs were dead code. Only the real modals are rendered here.
     - feeCalcModal / branchSupportModal / securityCheckModal were truncated in
       legacy markup; completed below with their observed content.
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

/* ---------- LEGACY BRIDGE: flows from page JS (unlabeled steppers) ---------- */
type FlowKey = 'disp' | 'ev' | 'bulk'
const FLOWS: Record<FlowKey, number> = { disp: 4, ev: 3, bulk: 3 }

const CARDS = ['Visa ****4521', 'MC ****3392', 'Prepaid ****8890']
const DISPUTE_TXNS = [
  '12 Jun 2025 — Amazon Kenya — KES 87,400 — Ref: AMZ-882910',
  '10 Jun 2025 — Jumia Pay — KES 23,150 — Ref: JM-441029',
  '08 Jun 2025 — Booking.com — KES 124,800 — Ref: BK-991022',
]
const REASON_CODES = [
  '01 — Unauthorised Transaction',
  '02 — Goods Not Received',
  '03 — Goods Not as Described',
  '04 — Duplicate Charge',
  '05 — Cancelled Recurring',
  '06 — Refund Not Processed',
]
const EV_CASES = [
  'CDP-44892 — Visa — KES 1,850,000',
  'CB-99102 — MC — KES 87,400',
  'CDP-44915 — PesaLink — KES 124,800',
]
const EV_TYPES = ['Receipt / Invoice', 'Police Report', 'Delivery Proof', 'Contract / Agreement', 'Bank Statement', 'Other']
const CB_LIST = [
  'CB-99102 — Visa — KES 87,400 — Representment due 27 Jun',
  'CB-99087 — MC — KES 312,000 — Pre-Arbitration',
]
const CB_RESPONSE_TYPES = [
  'Representment (provide evidence)',
  'Accept chargeback',
  'Pre-arbitration response',
  'Arbitration filing',
]
const BULK_ACTIONS = ['Upload evidence to all', 'Request extension', 'Accept chargebacks', 'Escalate to arbitration']
const EXPORT_TYPES = [
  'Full dispute & chargeback report',
  'Win/loss analysis',
  'Merchant performance',
  'Reason code effectiveness',
  'Monthly resolution summary',
]
const FORMATS = ['PDF', 'Excel', 'CSV']

interface Result {
  msg: string
  ref?: string
}

function Pills({
  prefix,
  tabs,
  first,
  tabsState,
  onSwitch,
}: {
  prefix: string
  tabs: { key: string; label: string }[]
  first: string
  tabsState: Record<string, string>
  onSwitch: (prefix: string, key: string) => void
}) {
  const currentTab = tabsState[prefix] ?? first
  return (
    <div className={`${styles.pills} mb-3`}>
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`${styles.pill} ${currentTab === t.key ? styles.pillActive : ''}`}
          onClick={() => onSwitch(prefix, t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function DisputesModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<FlowKey, number>>({ disp: 1, ev: 1, bulk: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ disp: 1, ev: 1, bulk: 1 })
      setBusy(null)
      setTabs({})
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) — 1400ms ---------- */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1400)
  }

  /* ---------- LEGACY BRIDGE: nextFlow(key,total) — closeM(key+'Modal') ---------- */
  const nextFlow = (key: FlowKey) => {
    const total = FLOWS[key]
    const cur = flows[key]
    const modalId = `${key === 'disp' ? 'dispute' : key === 'ev' ? 'evidenceUpload' : 'bulkDispute'}Modal`
    if (cur === total - 1) {
      setBusy(modalId)
      busyTimer.current = window.setTimeout(() => {
        setFlows((prev) => ({ ...prev, [key]: total }))
        setBusy(null)
      }, 1400)
      return
    }
    if (cur >= total) {
      onClose()
      return
    }
    setFlows((prev) => ({ ...prev, [key]: cur + 1 }))
  }

  /* ---------- LEGACY BRIDGE: sw(prefix,key,btn) ---------- */
  const sw = (prefix: string, key: string) => setTabs((prev) => ({ ...prev, [prefix]: key }))
  const tabOf = (prefix: string, first: string) => tabs[prefix] ?? first

  /* ---------- receipt (legacy 1.16 doAction body: single Save button) ---------- */
  const receipt = (id: string) => {
    const r = results[id]
    if (!r) return null
    return (
      <div className={styles.receipt}>
        <div className={styles.ri}>
          <i className="bi bi-check-lg" />
        </div>
        <h5 className={styles.receiptTitle}>{r.msg}</h5>
        {r.ref && <p className={styles.receiptSub}>Ref: {r.ref}</p>}
        <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
          <button
            className={`${styles.btnPm} ${styles.btnSm}`}
            onClick={() =>
              downloadFile(
                `${r.ref ?? 'paymo-receipt'}.txt`,
                `PayMo — Dispute & Chargeback Management\n${r.msg}${r.ref ? `\nRef: ${r.ref}` : ''}\nGenerated: ${new Date().toLocaleString()}`,
              )
            }
          >
            <i className="bi bi-download" /> Save
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

  const actionFooter = (id: string, label: ReactNode, msg: string, ref?: string, cancelLabel = 'Cancel') =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          {cancelLabel}
        </button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction(id, msg, ref)}>
          {label}
        </button>
      </>
    )

  /* ---------- flow stepper (legacy renderStepper: "Step N" labels) ---------- */
  const stepper = (key: FlowKey) => {
    const total = FLOWS[key]
    const cur = flows[key]
    return (
      <div className={styles.stepper}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          return (
            <div key={n} style={{ display: 'contents' }}>
              <div className={`${styles.step} ${n < cur ? styles.stepDone : ''} ${n === cur ? styles.stepActive : ''}`}>
                <div className={styles.stepN}>{n < cur ? <i className="bi bi-check" /> : n}</div>
                <div className={styles.stepL}>Step {n}</div>
              </div>
              {i < total - 1 && <div className={styles.stepLine} />}
            </div>
          )
        })}
      </div>
    )
  }

  const flowFooter = (key: FlowKey) => {
    const total = FLOWS[key]
    const cur = flows[key]
    const modalId = `${key === 'disp' ? 'dispute' : key === 'ev' ? 'evidenceUpload' : 'bulkDispute'}Modal`
    return (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          Cancel
        </button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow(key)} disabled={busy === modalId}>
          {cur >= total ? (
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

  const evpkgFiles = [
    { file: 'receipt_amz.pdf', caseId: 'CDP-44892', type: 'Receipt', uploaded: '27 Jun', size: '1.2 MB' },
    { file: 'police_88291.pdf', caseId: 'CDP-44892', type: 'Police', uploaded: '26 Jun', size: '3.4 MB' },
    { file: 'id_jk.jpg', caseId: 'CDP-44915', type: 'ID', uploaded: '25 Jun', size: '0.8 MB' },
  ]
  const evpkgReceipts = [
    { file: 'receipt_amz.pdf', sub: 'CDP-44892 · 1.2 MB' },
    { file: 'receipt_jumia.pdf', sub: 'CB-99102 · 0.9 MB' },
  ]
  const ranTiles = [
    { value: '68%', label: 'OVERALL WIN RATE', vColor: 'var(--pm-accent)', bg: 'var(--pm-accent-soft)', big: true },
    { value: '41 days', label: 'AVG RESOLUTION', vColor: 'var(--pm-info)', bg: 'var(--pm-info-soft)' },
    { value: 'KES 129k', label: 'AVG RECOVERED', vColor: 'var(--pm-purple)', bg: 'var(--pm-purple-soft)' },
  ]
  const healthTiles = [
    { value: '84', label: 'HEALTH SCORE', vColor: 'var(--pm-accent)', bg: 'var(--pm-accent-soft)', big: true },
    { value: '11', label: 'EXPIRING', vColor: 'var(--pm-warning)', bg: 'var(--pm-warning-soft)' },
    { value: '41d', label: 'AVG TIME', vColor: 'var(--pm-info)', bg: 'var(--pm-info-soft)' },
    { value: '68%', label: 'WIN RATE', vColor: 'var(--pm-purple)', bg: 'var(--pm-purple-soft)' },
  ]
  const healthRows: [string, string, string, string, 'badgeS' | 'badgeW'][] = [
    ['Evidence completeness', '78%', '95%', 'Below', 'badgeW'],
    ['On-time filing', '94%', '100%', 'Good', 'badgeS'],
    ['Merchant blacklisting', '3', '5', 'Below', 'badgeW'],
    ['Arbitration win rate', '52%', '65%', 'Below', 'badgeW'],
  ]
  const caseNotifs = [
    { box: 'summaryBoxDanger', title: 'CDP-44892 evidence deadline in 2 days', sub: 'Upload remaining documents before 29 Jun.' },
    { box: 'summaryBoxWarn', title: 'CB-99102 representment response due today', sub: 'Visa deadline: 27 Jun 2025.' },
    { box: 'summaryBoxInfo', title: 'CDP-44923 evidence package complete', sub: 'Submitted to Visa successfully.' },
    { box: 'summaryBoxAccent', title: 'CDP-44915 resolved — won', sub: 'KES 124,800 recovered.' },
    { box: 'summaryBox', title: 'Merchant blacklisting applied', sub: 'Local Vendor X — 3 new disputes prevented.' },
  ] as const
  const activityRows = [
    ['27 Jun 14:32', 'CDP-44923', 'Evidence uploaded', 'James K.', 'receipt_amz.pdf, police_88291.pdf'],
    ['27 Jun 11:15', 'CB-99102', 'Representment filed', 'Grace M.', 'Response submitted to Visa'],
    ['26 Jun 09:40', 'CDP-44892', 'Merchant flagged', 'System', 'Local Vendor X — risk score 94'],
    ['25 Jun 16:20', 'CDP-44915', 'Case resolved — won', 'James K.', 'KES 124,800 recovered'],
  ]
  const attentionRows = [
    { title: 'CDP-44892 evidence due in 2 days', sub: 'KES 1.85M — 4 files remaining', label: 'Upload', modal: 'evidenceUploadModal' },
    { title: 'CB-99102 representment due today', sub: 'Visa — KES 87,400', label: 'Respond', modal: 'chargebackResponseModal' },
    { title: 'Local Vendor X blacklisting review', sub: '6 cases — 17% win rate', label: 'Blacklist', modal: 'merchantRiskModal', danger: true },
    { title: 'CDP-44923 evidence package complete', sub: 'Ready for submission', label: 'Submit', modal: 'disputeDetailModal' },
  ]
  const branchRows = [
    ['Sarit Centre, Level 2', 'Dispute filing, Evidence upload', '1.2 km'],
    ['Koinange / Kenyatta', 'Full dispute support', '3.4 km'],
  ]
  const profileStats: [string, string, boolean?][] = [
    ['Disputes Managed', '142 this month'],
    ['Win Rate', '68%', true],
    ['Recovery', 'KES 18.4M'],
    ['Health Score', '84/100', true],
  ]

  const downloadBtn = (modalId: string) => (
    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => doAction(modalId, 'File downloaded.', '')}>
      Download
    </button>
  )

  return (
    <>
      {/* ============ M1: New Dispute (flow: disp, 4 steps) ============ */}
      <MBox
        id="disputeModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-plus" style={{ color: 'var(--pm-info)' }} /> File New Dispute
          </>
        }
        footer={flowFooter('disp')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'disputeModal' && <BusyOverlay />}
          {stepper('disp')}
          {flows.disp === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Select Transaction</h6>
              <div className="mb-3">
                <label className={styles.fl}>Card / Account</label>
                <select className={styles.fc}>
                  {CARDS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Transaction</label>
                <select className={styles.fc}>
                  {DISPUTE_TXNS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {flows.disp === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Reason &amp; Details</h6>
              <div className="mb-3">
                <label className={styles.fl}>Reason Code</label>
                <select className={styles.fc}>
                  {REASON_CODES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Description</label>
                <textarea
                  className={styles.fc}
                  rows={3}
                  defaultValue="I did not authorise this transaction. Card was in my possession at all times."
                />
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Requested Amount</label>
                <input className={styles.fc} defaultValue="87400" />
              </div>
            </div>
          )}
          {flows.disp === 3 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 3: Initial Evidence</h6>
              <div className="mb-3">
                <label className={styles.fl}>Upload Supporting Documents</label>
                <input type="file" className={styles.fc} multiple />
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" defaultChecked id="disp-police" />
                <label className="form-check-label" style={{ fontSize: 13 }} htmlFor="disp-police">
                  Police report will be uploaded within 48 hours
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" defaultChecked id="disp-id" />
                <label className="form-check-label" style={{ fontSize: 13 }} htmlFor="disp-id">
                  ID verification attached
                </label>
              </div>
            </div>
          )}
          {flows.disp === 4 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Dispute Filed Successfully</h5>
              <p className={styles.receiptSub}>Case CDP-44923 created. Network deadline: 11 Jul 2025.</p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Case ID</span>
                  <strong>CDP-44923</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Amount</span>
                  <strong>KES 87,400</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={styles.mutedSmall}>Status</span>
                  <span className={`${styles.badge} ${styles.badgeI}`}>Under Review</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M2: Evidence Upload (flow: ev, 3 steps) ============ */}
      <MBox
        id="evidenceUploadModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-upload" style={{ color: 'var(--pm-accent)' }} /> Upload Evidence Package
          </>
        }
        footer={flowFooter('ev')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'evidenceUploadModal' && <BusyOverlay />}
          {stepper('ev')}
          {flows.ev === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Select Case</h6>
              <div className="mb-3">
                <label className={styles.fl}>Case</label>
                <select className={styles.fc}>
                  {EV_CASES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Evidence Type</label>
                <select className={styles.fc}>
                  {EV_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {flows.ev === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Upload Files</h6>
              <div className="mb-3">
                <label className={styles.fl}>Files</label>
                <input type="file" className={styles.fc} multiple />
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Description / Notes</label>
                <textarea
                  className={styles.fc}
                  rows={2}
                  defaultValue="Receipt from merchant dated 12 Jun 2025 showing full payment."
                />
              </div>
              <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
                <i className="bi bi-info-circle me-1" /> Accepted formats: PDF, JPG, PNG, DOCX. Max 10MB per file.
              </div>
            </div>
          )}
          {flows.ev === 3 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Evidence Uploaded</h5>
              <p className={styles.receiptSub}>3 files attached to CDP-44892. Package completeness: 6/6.</p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Files</span>
                  <strong>receipt.pdf, police.pdf, id.jpg</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={styles.mutedSmall}>Deadline</span>
                  <strong>29 Jun 2025</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M3: Chargeback Response ============ */}
      <MBox
        id="chargebackResponseModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-reply" style={{ color: 'var(--pm-info)' }} /> Respond to Chargeback
          </>
        }
        footer={actionFooter(
          'chargebackResponseModal',
          'Submit Response',
          'Chargeback response submitted successfully. Case updated to Pre-Arbitration stage.',
          'CB-99102-R1',
        )}
      >
        {actionBody(
          'chargebackResponseModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Chargeback</label>
              <select className={styles.fc}>
                {CB_LIST.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Response Type</label>
              <select className={styles.fc}>
                {CB_RESPONSE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Evidence / Notes</label>
              <textarea
                className={styles.fc}
                rows={4}
                defaultValue="Merchant provided signed delivery confirmation and CCTV footage showing cardholder at pickup location."
              />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Additional Files</label>
              <input type="file" className={styles.fc} multiple />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M4: Bulk Dispute (flow: bulk, 3 steps) ============ */}
      <MBox
        id="bulkDisputeModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-collection" style={{ color: 'var(--pm-purple)' }} /> Bulk Dispute Actions
          </>
        }
        footer={flowFooter('bulk')}
      >
        <div style={{ position: 'relative' }}>
          {busy === 'bulkDisputeModal' && <BusyOverlay />}
          {stepper('bulk')}
          {flows.bulk === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Select Cases</h6>
              <div className="form-check p-3 border rounded mb-2">
                <input className="form-check-input" type="checkbox" defaultChecked id="bulk-c1" />
                <label className="form-check-label ms-2 d-flex justify-content-between w-100" htmlFor="bulk-c1">
                  <span>
                    <strong>CDP-44892</strong> — Visa — KES 1.85M
                  </span>
                  <span className={`${styles.badge} ${styles.badgeD}`}>Expiring</span>
                </label>
              </div>
              <div className="form-check p-3 border rounded mb-2">
                <input className="form-check-input" type="checkbox" id="bulk-c2" />
                <label className="form-check-label ms-2 d-flex justify-content-between w-100" htmlFor="bulk-c2">
                  <span>
                    <strong>CB-99087</strong> — MC — KES 312k
                  </span>
                  <span className={`${styles.badge} ${styles.badgeI}`}>Pre-Arbitration</span>
                </label>
              </div>
              <hr className={styles.divider} />
              <div className="d-flex justify-content-between">
                <span className={styles.fwBold13}>Selected</span>
                <strong>2 cases</strong>
              </div>
            </div>
          )}
          {flows.bulk === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Action</h6>
              <div className="mb-3">
                <label className={styles.fl}>Bulk Action</label>
                <select className={styles.fc}>
                  {BULK_ACTIONS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={styles.fl}>Notes (applies to all)</label>
                <textarea className={styles.fc} rows={3} defaultValue="Bulk evidence package attached for all selected cases." />
              </div>
            </div>
          )}
          {flows.bulk === 3 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-all" />
              </div>
              <h5 className={styles.receiptTitle}>Bulk Action Completed</h5>
              <p className={styles.receiptSub}>Evidence uploaded to 2 cases. Deadlines extended where applicable.</p>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M5: Evidence Package Manager ============ */}
      <MBox
        id="evidencePackageModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-archive" /> Evidence Package Manager
          </>
        }
        footer={
          results.evidencePackageModal ? (
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
              Done
            </button>
          ) : (
            <>
              <button className={styles.btnPm} onClick={onClose}>
                Close
              </button>
              <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('evidenceUploadModal')}>
                Upload More
              </button>
            </>
          )
        }
      >
        {actionBody(
          'evidencePackageModal',
          <>
            <Pills
              prefix="evpkg"
              first="all"
              tabs={[
                { key: 'all', label: 'All Files' },
                { key: 'receipt', label: 'Receipts' },
                { key: 'police', label: 'Police' },
                { key: 'delivery', label: 'Delivery' },
              ]}
              tabsState={tabs}
              onSwitch={sw}
            />
            {tabOf('evpkg', 'all') === 'all' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Case</th>
                      <th>Type</th>
                      <th>Uploaded</th>
                      <th>Size</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evpkgFiles.map((f) => (
                      <tr key={f.file}>
                        <td>{f.file}</td>
                        <td>{f.caseId}</td>
                        <td>{f.type}</td>
                        <td>{f.uploaded}</td>
                        <td>{f.size}</td>
                        <td>{downloadBtn('evidencePackageModal')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tabOf('evpkg', 'all') === 'receipt' &&
              evpkgReceipts.map((f) => (
                <div className={styles.sr} key={f.file}>
                  <div>
                    <strong>{f.file}</strong>
                    <div className={styles.mutedSmall}>{f.sub}</div>
                  </div>
                  {downloadBtn('evidencePackageModal')}
                </div>
              ))}
            {tabOf('evpkg', 'all') === 'police' && (
              <div className={styles.sr}>
                <div>
                  <strong>police_88291.pdf</strong>
                  <div className={styles.mutedSmall}>CDP-44892 · 3.4 MB</div>
                </div>
                {downloadBtn('evidencePackageModal')}
              </div>
            )}
            {tabOf('evpkg', 'all') === 'delivery' && (
              <div className={styles.sr}>
                <div>
                  <strong>delivery_booking.jpg</strong>
                  <div className={styles.mutedSmall}>CDP-44915 · 2.1 MB</div>
                </div>
                {downloadBtn('evidencePackageModal')}
              </div>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M6: Merchant Risk ============ */}
      <MBox
        id="merchantRiskModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-building" style={{ color: 'var(--pm-warning)' }} /> Merchant Risk Management
          </>
        }
        footer={
          results.merchantRiskModal ? (
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
          'merchantRiskModal',
          <>
            <Pills
              prefix="mrisk"
              first="high"
              tabs={[
                { key: 'high', label: 'High Risk' },
                { key: 'repeat', label: 'Repeat Offenders' },
                { key: 'blacklist', label: 'Blacklist' },
              ]}
              tabsState={tabs}
              onSwitch={sw}
            />
            {tabOf('mrisk', 'high') === 'high' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Cases (30d)</th>
                      <th>Win Rate</th>
                      <th>Risk Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Local Vendor X</td>
                      <td>6</td>
                      <td>17%</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeD}`}>94</span>
                      </td>
                      <td>
                        <button
                          className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
                          onClick={() =>
                            doAction('merchantRiskModal', 'Merchant blacklisted. All future transactions will be blocked.', '')
                          }
                        >
                          Blacklist
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>Booking.com</td>
                      <td>9</td>
                      <td>44%</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeW}`}>72</span>
                      </td>
                      <td>
                        <button
                          className={`${styles.btnPm} ${styles.btnSm}`}
                          onClick={() => doAction('merchantRiskModal', 'Merchant flagged for review. Monitoring enabled.', '')}
                        >
                          Monitor
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {tabOf('mrisk', 'high') === 'repeat' &&
              [
                { name: 'Amazon Kenya', sub: '18 cases · 61% win rate' },
                { name: 'Jumia Pay', sub: '12 cases · 75% win rate' },
              ].map((m) => (
                <div className={styles.sr} key={m.name}>
                  <div>
                    <strong>{m.name}</strong>
                    <div className={styles.mutedSmall}>{m.sub}</div>
                  </div>
                  <button
                    className={`${styles.btnPm} ${styles.btnSm}`}
                    onClick={() => doAction('merchantRiskModal', 'Merchant flagged for review. Monitoring enabled.', '')}
                  >
                    Monitor
                  </button>
                </div>
              ))}
            {tabOf('mrisk', 'high') === 'blacklist' &&
              [
                { name: 'Local Vendor X', sub: 'Blacklisted 24 Jun 2025' },
                { name: 'Scam Merchant Y', sub: 'Blacklisted 12 May 2025' },
              ].map((m) => (
                <div className={styles.sr} key={m.name}>
                  <div>
                    <strong>{m.name}</strong>
                    <div className={styles.mutedSmall}>{m.sub}</div>
                  </div>
                  <button
                    className={`${styles.btnPm} ${styles.btnSm}`}
                    onClick={() =>
                      doAction('merchantRiskModal', 'Merchant removed from blacklist. Transactions will be allowed.', '')
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
          </>,
        )}
      </MBox>

      {/* ============ M7: Resolution Analytics ============ */}
      <MBox
        id="resolutionAnalyticsModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-graph-up-arrow" style={{ color: 'var(--pm-accent)' }} /> Resolution Analytics Dashboard
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('exportReportModal')}>
              Export Report
            </button>
          </>
        }
      >
        <Pills
          prefix="ran"
          first="win"
          tabs={[
            { key: 'win', label: 'Win Rate' },
            { key: 'merchant', label: 'Merchant' },
            { key: 'reason', label: 'Reason Code' },
            { key: 'time', label: 'Time to Resolve' },
          ]}
          tabsState={tabs}
          onSwitch={sw}
        />
        {tabOf('ran', 'win') === 'win' && (
          <div className="row g-3">
            {ranTiles.map((t) => (
              <div className="col-md-4" key={t.label}>
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
        )}
        {tabOf('ran', 'win') === 'merchant' && (
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Cases</th>
                  <th>Win Rate</th>
                  <th>Avg Amount</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Amazon Kenya', '18', '61%', 'KES 87k', '↑', 'badgeS'],
                  ['Jumia Pay', '12', '75%', 'KES 23k', '↑', 'badgeS'],
                  ['Booking.com', '9', '44%', 'KES 125k', '↓', 'badgeW'],
                ].map(([m, c, w, a, t, tone]) => (
                  <tr key={m}>
                    <td>{m}</td>
                    <td>{c}</td>
                    <td>{w}</td>
                    <td>{a}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[tone as 'badgeS' | 'badgeW']}`}>{t}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tabOf('ran', 'win') === 'reason' && (
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Reason Code</th>
                  <th>Cases</th>
                  <th>Win Rate</th>
                  <th>Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Unauthorised', '16', '82%', '32'],
                  ['Not Received', '9', '71%', '48'],
                  ['Duplicate', '7', '89%', '21'],
                ].map(([r, c, w, d]) => (
                  <tr key={r}>
                    <td>{r}</td>
                    <td>{c}</td>
                    <td>{w}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tabOf('ran', 'win') === 'time' && (
          <div className={styles.summaryBox}>
            <div className={styles.fwBold13}>Resolution Time Distribution</div>
            {[
              ['0-30 days', '42%', 'badgeS'],
              ['31-60 days', '38%', 'badgeW'],
              ['61-90 days', '15%', 'badgeI'],
              ['90+ days', '5%', 'badgeD'],
            ].map(([r, p, tone], i) => (
              <div className={`${styles.sr} ${i === 0 ? 'mt-2' : ''}`} key={r}>
                <div>{r}</div>
                <div>
                  <span className={`${styles.badge} ${styles[tone as 'badgeS' | 'badgeW' | 'badgeI' | 'badgeD']}`}>{p}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </MBox>

      {/* ============ M8: Dispute Automation Rules ============ */}
      <MBox
        id="disputeRulesModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-sliders" style={{ color: 'var(--pm-info)' }} /> Dispute Automation Rules
          </>
        }
        footer={actionFooter(
          'disputeRulesModal',
          'Save Rules',
          'Automation rules updated. Changes take effect immediately.',
        )}
      >
        {actionBody(
          'disputeRulesModal',
          <>
            <Pills
              prefix="drule"
              first="auto"
              tabs={[
                { key: 'auto', label: 'Auto-Escalation' },
                { key: 'evidence', label: 'Evidence Rules' },
                { key: 'merchant', label: 'Merchant Rules' },
              ]}
              tabsState={tabs}
              onSwitch={sw}
            />
            {(
              [
                {
                  key: 'auto',
                  rows: [
                    { label: 'Auto-escalate disputes > KES 500,000', sub: 'Current: Disabled', on: false },
                    { label: 'Auto-file chargeback if no response in 10 days', on: true },
                    { label: 'Auto-blacklist merchant after 5 lost cases', on: false },
                  ],
                },
                {
                  key: 'evidence',
                  rows: [
                    { label: 'Require police report for unauthorised > KES 100k', on: true },
                    { label: 'Require delivery proof for "not received"', on: true },
                  ],
                },
                {
                  key: 'merchant',
                  rows: [
                    { label: 'Auto-flag merchants with win rate < 40%', on: true },
                    { label: 'Auto-block transactions from blacklisted merchants', on: true },
                  ],
                },
              ] as const
            ).map(
              (panel) =>
                tabOf('drule', 'auto') === panel.key && (
                  <div key={panel.key}>
                    {panel.rows.map((r, i) => (
                      <div className={styles.sr} key={r.label}>
                        <div>
                          <strong>{r.label}</strong>
                          {'sub' in r && r.sub && <div className={styles.mutedSmall}>{r.sub}</div>}
                        </div>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" defaultChecked={r.on} id={`drule-${panel.key}-${i}`} aria-label={r.label} />
                        </div>
                      </div>
                    ))}
                  </div>
                ),
            )}
          </>,
        )}
      </MBox>

      {/* ============ M9: Arbitration ============ */}
      <MBox
        id="arbitrationModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gavel" style={{ color: 'var(--pm-purple)' }} /> Arbitration Management
          </>
        }
        footer={actionFooter('arbitrationModal', 'Save', 'Arbitration notes saved. Case updated.', undefined, 'Close')}
      >
        {actionBody(
          'arbitrationModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Case</label>
              <select className={styles.fc}>
                <option>CB-99065 — Visa — KES 1,240,000 — Arbitration</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Arbitration Status</label>
              <div className={styles.summaryBox}>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Stage</span>
                  <strong>Arbitration Filed</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Network</span>
                  <strong>Visa</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={styles.mutedSmall}>Decision Due</span>
                  <strong>15 Aug 2025</strong>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Notes</label>
              <textarea
                className={styles.fc}
                rows={3}
                defaultValue="Strong evidence package submitted. Merchant has poor compliance history."
              />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M10: Export Report ============ */}
      <MBox
        id="exportReportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-download" /> Export Dispute Report
          </>
        }
        footer={actionFooter('exportReportModal', 'Generate', 'Report generated and downloading...')}
      >
        {actionBody(
          'exportReportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Report Type</label>
              <select className={styles.fc}>
                {EXPORT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className={styles.fl}>From</label>
                <input type="date" className={styles.fc} defaultValue="2025-01-01" />
              </div>
              <div className="col-6">
                <label className={styles.fl}>To</label>
                <input type="date" className={styles.fc} defaultValue="2025-06-27" />
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Format</label>
              <select className={styles.fc}>
                {FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M11: Health Check ============ */}
      <MBox
        id="healthCheckModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse" style={{ color: 'var(--pm-danger)' }} /> Dispute Health Check
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('disputeRulesModal')}>
              Improve Score
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          {healthTiles.map((t) => (
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
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {healthRows.map(([m, c, t, s, tone]) => (
                <tr key={m}>
                  <td>{m}</td>
                  <td>{c}</td>
                  <td>{t}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[tone]}`}>{s}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M12: Case Notifications ============ */}
      <MBox
        id="caseNotifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell" /> Dispute Notifications (14)
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={() => onOpen('disputeRulesModal')}>
              Automation
            </button>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
          </>
        }
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {caseNotifs.map((n) => (
            <div key={n.title} className={`${styles[n.box]} mb-2`} style={{ fontSize: 13 }}>
              <strong>{n.title}</strong>
              <div className={styles.mutedSmall}>{n.sub}</div>
            </div>
          ))}
        </div>
      </MBox>

      {/* ============ M13: Profile ============ */}
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
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@email.com · +254 712 345 890</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            {profileStats.map(([l, v, accent]) => (
              <div className="col-6" key={l}>
                <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
                  <span className={styles.mutedSmall}>{l}</span>
                  <br />
                  <strong style={accent ? { color: 'var(--pm-accent)' } : undefined}>{v}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MBox>

      {/* ============ M14: Activity Log ============ */}
      <MBox
        id="activityLogModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-clock-history" /> Full Activity Log
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <select className={styles.fc} style={{ width: 'auto' }} aria-label="Filter by case" defaultValue="All Cases">
            <option>All Cases</option>
            <option>CDP-44892</option>
            <option>CB-99102</option>
          </select>
          <input className={styles.fc} style={{ width: 200 }} placeholder="Search activity..." aria-label="Search activity" />
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Case</th>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map(([ts, c, a, u, d]) => (
                <tr key={`${ts}-${c}`}>
                  <td>{ts}</td>
                  <td>{c}</td>
                  <td>{a}</td>
                  <td>{u}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M15: Attention ============ */}
      <MBox
        id="attentionModal"
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
            <button
              className={`${styles.btnPm} ${styles.btnSm} ${'danger' in r && r.danger ? styles.btnPmD : ''}`}
              onClick={() => onOpen(r.modal)}
            >
              {r.label}
            </button>
          </div>
        ))}
      </MBox>

      {/* ============ M16: Quick Dispute Helper ============ */}
      <MBox
        id="quickDisputeModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-lightning-charge" /> Quick Dispute
          </>
        }
        footer={actionFooter(
          'quickDisputeModal',
          'File Dispute',
          'Quick dispute filed successfully. Case CDP-44924 created.',
          'CDP-44924',
        )}
      >
        {actionBody(
          'quickDisputeModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Transaction</label>
              <select className={styles.fc}>
                <option>Amazon Kenya — KES 87,400 — 12 Jun</option>
                <option>Jumia Pay — KES 23,150 — 10 Jun</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Reason</label>
              <select className={styles.fc}>
                <option>Unauthorised</option>
                <option>Not Received</option>
                <option>Duplicate</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Amount</label>
              <input className={styles.fc} defaultValue="87400" />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M17: Dispute Details ============ */}
      <MBox
        id="disputeDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text" /> Dispute Details
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('evidenceUploadModal')}>
              Upload Evidence
            </button>
          </>
        }
      >
        <div className={`${styles.summaryBox} mb-3`}>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Case ID</span>
            <strong>CDP-44923</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Status</span>
            <span className={`${styles.badge} ${styles.badgeI}`}>Under Review</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>Amount</span>
            <strong>KES 87,400</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className={styles.mutedSmall}>Network Deadline</span>
            <strong>11 Jul 2025</strong>
          </div>
        </div>
        <div className="mb-3">
          <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Timeline</h6>
          <div className={styles.sr}>
            <div>27 Jun 14:32</div>
            <div>Evidence uploaded</div>
          </div>
          <div className={styles.sr}>
            <div>27 Jun 09:15</div>
            <div>Dispute filed</div>
          </div>
        </div>
      </MBox>

      {/* ============ M18: Chargeback Tracker ============ */}
      <MBox
        id="chargebackTrackerModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-graph-up" /> Chargeback Tracker
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={`${styles.summaryBox} mb-3`}>
          <div className="d-flex justify-content-between mb-2">
            <span className={styles.mutedSmall}>CB-99102</span>
            <span className={`${styles.badge} ${styles.badgeW}`}>Representment</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className={styles.mutedSmall}>Progress</span>
            <strong>Visa → Pre-Arbitration</strong>
          </div>
        </div>
        <div className="mb-3">
          <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Stage Timeline</h6>
          <div className={styles.sr}>
            <div>20 Jun</div>
            <div>First chargeback filed</div>
          </div>
          <div className={styles.sr}>
            <div>25 Jun</div>
            <div>Representment submitted</div>
          </div>
          <div className={styles.sr}>
            <div>27 Jun</div>
            <div>Response due</div>
          </div>
        </div>
      </MBox>

      {/* ============ M19: Dispute Rules (legacy quick variant) ============ */}
      <MBox
        id="disputeRulesModal2"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-sliders" /> Dispute Rules
          </>
        }
        footer={actionFooter('disputeRulesModal2', 'Save', 'Rules saved.')}
      >
        {actionBody(
          'disputeRulesModal2',
          <>
            {[
              { label: 'Auto-escalate > KES 500k', on: true },
              { label: 'Auto-file chargeback after 10 days', on: true },
              { label: 'Auto-blacklist after 5 lost cases', on: false },
            ].map((r, i) => (
              <div className={`form-check ${i < 2 ? 'mb-2' : ''}`} key={r.label}>
                <input className="form-check-input" type="checkbox" defaultChecked={r.on} id={`dr2-${i}`} />
                <label className="form-check-label" htmlFor={`dr2-${i}`}>
                  {r.label}
                </label>
              </div>
            ))}
          </>,
        )}
      </MBox>

      {/* ============ M20: Dispute Fee Calculator (legacy truncated — completed) ============ */}
      <MBox
        id="feeCalcModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calculator" /> Dispute Fee Calculator
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="mb-3">
          <label className={styles.fl}>Action</label>
          <select className={styles.fc}>
            <option>Dispute filing fee</option>
            <option>Arbitration filing fee</option>
            <option>Evidence courier / notarisation</option>
          </select>
        </div>
        <div className={styles.summaryBox}>
          <div className="d-flex justify-content-between">
            <span>Fee</span>
            <strong>KES 1,500</strong>
          </div>
        </div>
      </MBox>

      {/* ============ M21: Branch Support Locator (legacy truncated — completed) ============ */}
      <MBox
        id="branchSupportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-geo-alt" /> Branch Support Locator
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
                <th>Branch</th>
                <th>Services</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {branchRows.map(([b, s, d]) => (
                <tr key={b}>
                  <td>{b}</td>
                  <td>{s}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M22: Dispute Security Check (legacy truncated — completed) ============ */}
      <MBox
        id="securityCheckModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shield-check" style={{ color: 'var(--pm-accent)' }} /> Dispute Security Check
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={`${styles.summaryBoxAccent} mb-3`} style={{ fontSize: 13 }}>
          <i className="bi bi-check-circle me-1" /> All dispute workflows pass security validation. Evidence files
          are encrypted at rest and in transit.
        </div>
        {[
          ['Evidence encryption (AES-256)', 'Enabled'],
          ['Two-person rule for arbitration filings', 'Enabled'],
          ['Network webhook signature validation', 'Passing'],
        ].map(([l, v]) => (
          <div className={styles.sr} key={l}>
            <div>
              <strong>{l}</strong>
            </div>
            <span className={`${styles.badge} ${styles.badgeS}`}>{v}</span>
          </div>
        ))}
      </MBox>
    </>
  )
}
