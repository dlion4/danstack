import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/compliance.module.css'

/* ============================================================================
   Compliance & AML (Transactions) — modal layer (legacy page 1.9, 24 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows legacy showLoading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with labeled stepper + receipt step
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
  dangerHeader?: boolean
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
function MBox({ id, active, title, size = 'md', onClose, children, footer, dangerHeader }: MBoxProps) {
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
          <div className={styles.modalHeader} style={dangerHeader ? { background: 'var(--pm-danger)', color: '#fff' } : undefined}>
            <h5 className={styles.modalTitle} style={dangerHeader ? { color: '#fff' } : undefined}>
              {title}
            </h5>
            <button
              type="button"
              className={`btn-close ${dangerHeader ? 'btn-close-white' : ''}`}
              aria-label="Close"
              onClick={onClose}
            />
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
const CASE_TYPES = ['Structuring / Smurfing', 'Sanctions / PEP Hit', 'Round-Tripping', 'Adverse Media', 'Internal Referral', 'Regulatory Request']
const CASE_PRIORITIES = ['Critical — Immediate', 'High — 24h', 'Normal — 72h']
const MATCH_THRESHOLDS = ['High (90%+)', 'Medium (70%+)', 'Low (50%+)']
const RULE_CATEGORIES = ['Velocity', 'Structuring', 'Round-Tripping', 'PEP']
const REPORT_TYPES = ['STR — Suspicious Transaction Report', 'CTR — Currency Transaction Report', 'SAR — Suspicious Activity Report', 'Monthly CBK Summary']
const REPORT_SUBJECTS = ['AML-44892 — John Kamau Structuring', 'AML-44885 — Global Trade Ltd', 'AML-44871 — Hon. Peter Ochieng']
const BLOCK_TYPES = ['Single Transaction', 'All Transactions from Originator', 'All Transactions to Beneficiary', 'Entire Account / Entity']
const TEST_RULES = ['Structuring v4.2', 'Velocity-INTL v3.1', 'RoundTrip v2.8']
const TEST_DATASETS = ['Last 30 days (47,291 txns)', 'Last 7 days (12,844 txns)', 'Custom range']
const EXPORT_TYPES = ['All active cases', 'Closed cases (last 90 days)', 'Full audit log']
const EXPORT_FORMATS = ['PDF', 'Excel', 'CSV']
const LOCKER_CASES = ['AML-44892 — Structuring', 'AML-44885 — Sanctions']

type FlowKey = 'case'
interface Result {
  msg: string
  ref?: string
}

export default function ComplianceModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<FlowKey, number>>({ case: 1 })
  /* ---------- LEGACY BRIDGE: sw(prefix,key,btn) tab pill state ---------- */
  const [tabs, setTabs] = useState<Record<string, string>>({ caseD: 'overview', rule: 'active', risk: 'factors' })
  const sw = (prefix: string, key: string) => setTabs((prev) => ({ ...prev, [prefix]: key }))

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ case: 1 })
      setBusy(null)
      setTabs({ caseD: 'overview', rule: 'active', risk: 'factors' })
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

  /* ---------- LEGACY BRIDGE: nextFlow('case', 4) ---------- */
  const flowTotals: Record<FlowKey, number> = { case: 4 }
  const flowLabels: Record<FlowKey, string[]> = { case: ['Type', 'Scope', 'Actions', 'Done'] }
  const flowModals: Record<FlowKey, string> = { case: 'newCaseModal' }
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

  const flowFooter = (key: FlowKey, tone: 'btnPmP' | 'btnPmD' = 'btnPmP') => (
    <>
      <button className={styles.btnPm} onClick={onClose}>
        Cancel
      </button>
      <button className={`${styles.btnPm} ${styles[tone]}`} disabled={busy === key} onClick={() => nextFlow(key)}>
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

  const showFlow = (key: FlowKey) => active === flowModals[key]

  return (
    <>
      {/* ============ M1: New Investigation Case (multi-step) ============ */}
      <MBox
        id="newCaseModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-folder-plus me-2" style={{ color: 'var(--pm-danger)' }} />
            Create New Investigation Case
          </>
        }
        footer={flowFooter('case', 'btnPmD')}
      >
        {stepper('case')}
        {busy === 'case' && <BusyOverlay />}
        {showFlow('case') && flows.case === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Case Type &amp; Trigger</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Case Type</label>
                <select className={styles.fc} defaultValue={CASE_TYPES[0]}>
                  {CASE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Priority</label>
                <select className={styles.fc} defaultValue={CASE_PRIORITIES[0]}>
                  {CASE_PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className={styles.fl}>Triggering Transaction(s)</label>
              <input className={styles.fc} defaultValue="TXN-992184, TXN-992185, TXN-992186" />
            </div>
          </div>
        )}
        {showFlow('case') && flows.case === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Subjects &amp; Scope</h6>
            <div className="mb-3">
              <label className={styles.fl}>Primary Subject</label>
              <input className={styles.fc} defaultValue="John Kamau (ID: 28471920)" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Linked Entities</label>
              <textarea className={styles.fc} rows={2} defaultValue="Mary Wanjiku (Spouse), TechFlow Solutions Ltd, Global Trade EA" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Date Range</label>
              <div className="row g-3">
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-05-01" />
                </div>
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-27" />
                </div>
              </div>
            </div>
          </div>
        )}
        {showFlow('case') && flows.case === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Initial Actions</h6>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="cAct1" />
              <label className="form-check-label" htmlFor="cAct1">Freeze all linked accounts</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="cAct2" />
              <label className="form-check-label" htmlFor="cAct2">Request bank statements (last 90 days)</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="cAct3" />
              <label className="form-check-label" htmlFor="cAct3">Submit SAR to CBK within 24h</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultChecked id="cAct4" />
              <label className="form-check-label" htmlFor="cAct4">Assign to investigation team</label>
            </div>
          </div>
        )}
        {showFlow('case') && flows.case === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-folder-check" />
              </div>
              <h5 className={styles.receiptTitle}>Case Created Successfully</h5>
              <p className={styles.receiptSub}>Case AML-44901 has been created and assigned to Sarah M. (Lead Investigator).</p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Case ID</span>
                  <strong>AML-44901</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Priority</span>
                  <span className={`${styles.badge} ${styles.badgeD}`}>Critical</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={styles.mutedSmall}>Due</span>
                  <strong>28 Jun 2025, 14:32</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M2: Case Detail (multi-tab) ============ */}
      <MBox
        id="caseDetailModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-folder me-2" />
            Case AML-44892 — Structuring Investigation
          </>
        }
        footer={actionFooter('caseDetailModal', 'Save Changes', 'btnPmP', 'Case updated and saved. All changes logged to audit trail.', undefined, 'Close')}
      >
        {actionBody(
          'caseDetailModal',
          <>
            <div className={`${styles.pills} mb-3`}>
              {(
                [
                  ['overview', 'Overview'],
                  ['timeline', 'Timeline'],
                  ['evidence', 'Evidence'],
                  ['network', 'Network'],
                  ['report', 'Report'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={`${styles.pill} ${tabs.caseD === key ? styles.pillActive : ''}`}
                  onClick={() => sw('caseD', key)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tabs.caseD === 'overview' && (
              <div className="row g-3">
                <div className="col-md-6">
                  <div className={styles.summaryBox}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className={styles.mutedSmall}>Status</span>
                      <span className={`${styles.badge} ${styles.badgeD}`}>Active Investigation</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className={styles.mutedSmall}>Opened</span>
                      <strong>24 Jun 2025</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className={styles.mutedSmall}>Owner</span>
                      <strong>Sarah M. (Lead)</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className={styles.mutedSmall}>Risk Score</span>
                      <span className={`${styles.badge} ${styles.badgeD}`}>92</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={styles.summaryBoxDanger}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-danger)' }}>SUBJECTS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-danger)' }}>John Kamau + 7 linked entities</div>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>3 accounts frozen • KES 4.2M under review</div>
                  </div>
                </div>
              </div>
            )}
            {tabs.caseD === 'timeline' && (
              <>
                {[
                  ['24 Jun 09:12', 'Case created by system (Structuring rule triggered)'],
                  ['24 Jun 10:45', 'Sarah M. assigned as lead investigator'],
                  ['24 Jun 14:30', 'Account freeze executed on 3 accounts'],
                  ['25 Jun 11:20', 'Bank statements received (Equity, KCB, NCBA)'],
                  ['26 Jun 16:05', 'Evidence uploaded: 47 transaction screenshots'],
                  ['27 Jun 08:40', 'STR draft submitted for internal review'],
                ].map(([ts, ev]) => (
                  <div className={styles.sr} key={ts}>
                    <div>
                      <strong>{ts}</strong> — {ev}
                    </div>
                  </div>
                ))}
              </>
            )}
            {tabs.caseD === 'evidence' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Type</th>
                      <th>Uploaded</th>
                      <th>Hash</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['equity_statements_jun25.pdf', 'Bank Statement', '25 Jun', 'SHA256: a3f2...'],
                      ['structuring_pattern.png', 'Analysis', '26 Jun', 'SHA256: 9c81...'],
                      ['PEP_profile_john_kamau.pdf', 'Screening', '26 Jun', 'SHA256: 4b92...'],
                    ].map(([file, type, up, hash]) => (
                      <tr key={file}>
                        <td>{file}</td>
                        <td>{type}</td>
                        <td>{up}</td>
                        <td>{hash}</td>
                        <td>
                          {/* LEGACY BRIDGE: dead Download button in legacy → real file download */}
                          <button
                            className={`${styles.btnPm} ${styles.btnSm}`}
                            onClick={() => downloadFile(file, `Evidence file: ${file}\nType: ${type}\nUploaded: ${up}\nHash: ${hash}\nCase: AML-44892`)}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tabs.caseD === 'network' && (
              <div className={styles.summaryBox} style={{ fontSize: 13 }}>
                <strong>Entity Network (8 nodes)</strong>
                <ul className="mt-2 mb-0">
                  <li>John Kamau (Primary) → Mary Wanjiku (Spouse) → TechFlow Ltd → Global Trade EA → 4 shell entities</li>
                </ul>
              </div>
            )}
            {tabs.caseD === 'report' && (
              <>
                <div className="mb-3">
                  <label className={styles.fl}>STR Narrative (Draft)</label>
                  <textarea
                    className={styles.fc}
                    rows={6}
                    defaultValue="Between 12–14 June 2025, John Kamau and linked entities conducted 14 transactions totaling KES 2.84M, all structured just below the KES 1M reporting threshold. Pattern consistent with structuring to evade CTR requirements."
                  />
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked id="cRep1" />
                  <label className="form-check-label" htmlFor="cRep1">Include transaction timeline</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked id="cRep2" />
                  <label className="form-check-label" htmlFor="cRep2">Attach evidence pack (47 files)</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="cRep3" />
                  <label className="form-check-label" htmlFor="cRep3">Request asset freeze order</label>
                </div>
              </>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M3: Sanctions Search ============ */}
      <MBox
        id="sanctionsSearchModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-globe me-2" style={{ color: 'var(--pm-info)' }} />
            Sanctions &amp; PEP Search
          </>
        }
        footer={actionFooter('sanctionsSearchModal', 'Screen Again', 'btnPmP', 'Screening completed. 3 matches flagged for review.', undefined, 'Close')}
      >
        {actionBody(
          'sanctionsSearchModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Search Term</label>
              <input className={styles.fc} defaultValue="John Kamau" placeholder="Name, ID, Company, Passport" />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Lists to Check</label>
                {['UN Consolidated', 'OFAC SDN', 'EU Consolidated', 'UK Sanctions', 'Local PEP Database'].map((l, i) => (
                  <div className={`form-check ${i < 4 ? 'mb-1' : ''}`} key={l}>
                    <input className="form-check-input" type="checkbox" defaultChecked id={`sl${i}`} />
                    <label className="form-check-label" htmlFor={`sl${i}`}>{l}</label>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Match Threshold</label>
                <select className={styles.fc} defaultValue={MATCH_THRESHOLDS[0]}>
                  {MATCH_THRESHOLDS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={`${styles.summaryBox} mt-3`}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Search Results (3 matches)</div>
              {(
                [
                  ['John Kamau (Beneficiary)', 'UN Consolidated List — 98% match', 'High Risk', styles.badgeD],
                  ['John Kamau (Director, Global Trade Ltd)', 'OFAC SDN — 94% match', 'High Risk', styles.badgeD],
                  ['John Kamau (Spouse of PEP)', 'Local PEP DB — 72% match', 'Medium Risk', styles.badgeW],
                ] as const
              ).map(([name, sub, badge, tone], i) => (
                <div className={`${styles.sr} ${i === 0 ? 'mt-2' : ''}`} key={name}>
                  <div>
                    <strong>{name}</strong>
                    <div className={styles.mutedSmall}>{sub}</div>
                  </div>
                  <span className={`${styles.badge} ${tone}`}>{badge}</span>
                </div>
              ))}
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M4: AML Rules Engine (multi-tab) ============ */}
      <MBox
        id="amlRulesModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-sliders me-2" style={{ color: 'var(--pm-purple)' }} />
            AML Rules Engine
          </>
        }
        footer={actionFooter('amlRulesModal', 'Save & Deploy', 'btnPmP', 'Rule changes saved and deployed to production.', undefined, 'Close')}
      >
        {actionBody(
          'amlRulesModal',
          <>
            <div className={`${styles.pills} mb-3`}>
              {(
                [
                  ['active', 'Active Rules'],
                  ['create', 'Create Rule'],
                  ['test', 'A/B Test'],
                ] as const
              ).map(([key, label]) => (
                <button key={key} className={`${styles.pill} ${tabs.rule === key ? styles.pillActive : ''}`} onClick={() => sw('rule', key)}>
                  {label}
                </button>
              ))}
            </div>
            {tabs.rule === 'active' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Trigger</th>
                      <th>Threshold</th>
                      <th>Precision</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ['Structuring v4.2', 'Multiple txns < threshold', '48h / KES 1M', '21.6%'],
                        ['Velocity-INTL v3.1', 'International velocity', '24h / 3 txns', '32.6%'],
                        ['RoundTrip v2.8', 'Funds return to originator', '7 days', '40.4%'],
                      ] as const
                    ).map(([name, trigger, threshold, precision]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{trigger}</td>
                        <td>{threshold}</td>
                        <td>{precision}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeS}`}>Active</span>
                        </td>
                        <td>
                          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('ruleTestModal')}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tabs.rule === 'create' && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.fl}>Rule Name</label>
                  <input className={styles.fc} defaultValue="Crypto Exchange Velocity" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Category</label>
                  <select className={styles.fc} defaultValue={RULE_CATEGORIES[0]}>
                    {RULE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Time Window</label>
                  <input className={styles.fc} defaultValue="24 hours" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Threshold</label>
                  <input className={styles.fc} defaultValue="KES 5,000,000" />
                </div>
                <div className="col-12">
                  <label className={styles.fl}>Rule Logic</label>
                  <textarea
                    className={styles.fc}
                    rows={3}
                    defaultValue="IF (destination == CryptoExchange) AND (amount > threshold) AND (count > 3 in window) THEN alert"
                  />
                </div>
              </div>
            )}
            {tabs.rule === 'test' && (
              <div className={styles.summaryBoxInfo} style={{ fontSize: 13 }}>
                <strong>A/B Test Results (14 days)</strong>
                <div className="mt-2">Rule v4.2 vs v4.3: Precision improved from 21.6% → 28.4%. False positives reduced by 31%.</div>
              </div>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M5: Risk Scoring Engine (multi-tab) ============ */}
      <MBox
        id="riskScoringModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-speedometer2 me-2" style={{ color: 'var(--pm-warning)' }} />
            Risk Scoring Engine
          </>
        }
        footer={actionFooter('riskScoringModal', 'Apply Changes', 'btnPmP', 'Risk model weights updated. New scores will apply to future transactions.', undefined, 'Close')}
      >
        {actionBody(
          'riskScoringModal',
          <>
            <div className={`${styles.pills} mb-3`}>
              {(
                [
                  ['factors', 'Risk Factors'],
                  ['weights', 'Weights'],
                  ['model', 'AI Model'],
                ] as const
              ).map(([key, label]) => (
                <button key={key} className={`${styles.pill} ${tabs.risk === key ? styles.pillActive : ''}`} onClick={() => sw('risk', key)}>
                  {label}
                </button>
              ))}
            </div>
            {tabs.risk === 'factors' && (
              <div className="mb-3">
                <label className={styles.fl}>Factor</label>
                {['High-risk jurisdiction (weight 25)', 'PEP relationship (weight 20)', 'Crypto exposure (weight 15)', 'Adverse media (weight 10)'].map(
                  (f, i) => (
                    <div className={`form-check ${i < 3 ? 'mb-1' : ''}`} key={f}>
                      <input className="form-check-input" type="checkbox" defaultChecked id={`rf${i}`} />
                      <label className="form-check-label" htmlFor={`rf${i}`}>{f}</label>
                    </div>
                  ),
                )}
              </div>
            )}
            {tabs.risk === 'weights' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>Factor</th>
                      <th>Current Weight</th>
                      <th>Recommended</th>
                      <th>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ['High-risk jurisdiction', '25', '30', '+12% precision'],
                        ['PEP relationship', '20', '25', '+8% precision'],
                        ['Crypto exposure', '15', '20', '+15% precision'],
                      ] as const
                    ).map(([f, cur, rec, imp]) => (
                      <tr key={f}>
                        <td>{f}</td>
                        <td>{cur}</td>
                        <td>{rec}</td>
                        <td>{imp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tabs.risk === 'model' && (
              <div className={styles.summaryBox}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Explainable AI Model v3.4</div>
                <div className={styles.mutedSmall}>Last trained: 20 Jun 2025 • Accuracy: 94.2% • Features: 47</div>
              </div>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M6: File Regulatory Report ============ */}
      <MBox
        id="regReportModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text me-2" style={{ color: 'var(--pm-purple)' }} />
            File Regulatory Report
          </>
        }
        footer={actionFooter('regReportModal', 'Submit Report', 'btnPmP', 'Report filed successfully. Confirmation received from CBK (Ref: CBK-STR-2025-0612).', 'CBK-STR-2025-0612')}
      >
        {actionBody(
          'regReportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Report Type</label>
              <select className={styles.fc} defaultValue={REPORT_TYPES[0]}>
                {REPORT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Subject / Case</label>
              <select className={styles.fc} defaultValue={REPORT_SUBJECTS[0]}>
                {REPORT_SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Narrative / Summary</label>
              <textarea
                className={styles.fc}
                rows={4}
                defaultValue="Multiple structured transactions detected across 3 accounts. Total value KES 2.84M within 48 hours. Pattern consistent with deliberate evasion of reporting thresholds."
              />
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="rr1" />
              <label className="form-check-label" htmlFor="rr1">Include transaction timeline</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="rr2" />
              <label className="form-check-label" htmlFor="rr2">Attach evidence pack</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rr3" />
              <label className="form-check-label" htmlFor="rr3">Request asset freeze</label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M7: Evidence Locker ============ */}
      <MBox
        id="evidenceLockerModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-archive me-2" />
            Evidence Locker
          </>
        }
        footer={actionFooter('evidenceLockerModal', 'Upload', 'btnPmP', 'Evidence uploaded and hashed. Chain of custody recorded.', undefined, 'Close')}
      >
        {actionBody(
          'evidenceLockerModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Case</label>
              <select className={styles.fc} defaultValue={LOCKER_CASES[0]}>
                {LOCKER_CASES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Uploaded</th>
                    <th>Hash (SHA256)</th>
                    <th>Chain</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['equity_jun25.pdf', 'Statement', '25 Jun', 'a3f2c9e1...'],
                      ['structuring_map.png', 'Analysis', '26 Jun', '9c81b4d2...'],
                      ['PEP_profile.pdf', 'Screening', '26 Jun', '4b92f7a3...'],
                    ] as const
                  ).map(([file, type, up, hash]) => (
                    <tr key={file}>
                      <td>{file}</td>
                      <td>{type}</td>
                      <td>{up}</td>
                      <td>{hash}</td>
                      <td>Verified</td>
                      <td>
                        {/* LEGACY BRIDGE: dead Download button in legacy → real file download */}
                        <button
                          className={`${styles.btnPm} ${styles.btnSm}`}
                          onClick={() => downloadFile(file, `Evidence locker export\nFile: ${file}\nType: ${type}\nUploaded: ${up}\nSHA256: ${hash}\nChain of custody: Verified`)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <label className={styles.fl}>Upload New Evidence</label>
              <input type="file" className={styles.fc} />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M8: Full Audit Trail ============ */}
      <MBox
        id="auditTrailModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-clock-history me-2" />
            Full Compliance Audit Trail
          </>
        }
        footer={actionFooter('auditTrailModal', 'Export PDF', 'btnPmP', 'Audit trail exported to PDF with digital signature.', undefined, 'Close')}
      >
        {actionBody(
          'auditTrailModal',
          <div className="table-responsive" style={{ maxHeight: 500, overflowY: 'auto' }}>
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP/Device</th>
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['27 Jun 14:28', 'Sarah M.', 'Escalated to CBK', 'AML-44892', '102.68.XX.XX (Mac)', 'Verified'],
                    ['27 Jun 13:55', 'David O.', 'Uploaded evidence', 'AML-44885', '102.68.XX.XX (Win)', 'Verified'],
                    ['27 Jun 11:42', 'Amina K.', 'Updated risk score', 'PEP-7721', '102.68.XX.XX (iOS)', 'Verified'],
                    ['26 Jun 09:15', 'System', 'Auto-block', 'TXN-992184', '—', 'System'],
                    ['25 Jun 16:40', 'James K.', 'Closed case', 'AML-44860', '102.68.XX.XX (Mac)', 'Verified'],
                  ] as const
                ).map((row) => (
                  <tr key={row[0] + row[2]}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )}
      </MBox>

      {/* ============ M9: PEP Detail ============ */}
      <MBox
        id="pepDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-person-x me-2" style={{ color: 'var(--pm-warning)' }} />
            PEP Profile — John Kamau
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => onOpen('newCaseModal')}>
              Open Investigation
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-6">
            <div className={styles.summaryBox}>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Full Name</span>
                <strong>John Kamau</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>ID Number</span>
                <strong>28471920</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>PEP Status</span>
                <span className={`${styles.badge} ${styles.badgeD}`}>Active</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className={styles.mutedSmall}>Position</span>
                <strong>Director, Global Trade Ltd</strong>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.summaryBoxDanger}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-danger)' }}>MATCHED LISTS</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-danger)' }}>UN Consolidated (98%)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-danger)' }}>OFAC SDN (94%)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-warning)' }}>Local PEP DB (72%)</div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className={styles.fl}>Risk Notes</label>
          <textarea
            className={styles.fc}
            rows={3}
            defaultValue={'Subject appears on UN sanctions list under alias "J. Kamau". Multiple accounts show structuring pattern. Spouse (Mary Wanjiku) also flagged.'}
          />
        </div>
      </MBox>

      {/* ============ M10: Live AML Alerts ============ */}
      <MBox
        id="liveAlertsModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell me-2" style={{ color: 'var(--pm-danger)' }} />
            Live AML Alerts (17)
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('amlRulesModal')}>
              Tune Alert Rules
            </button>
          </>
        }
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          <div className={`${styles.summaryBoxDanger} mb-2`}>
            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong>Structuring detected</strong>
                <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>TXN-992184, 992185, 992186 — KES 2.45M in 48h</div>
              </div>
              <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => onOpen('newCaseModal')}>
                Investigate
              </button>
            </div>
          </div>
          <div className={`${styles.summaryBoxWarn} mb-2`}>
            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong>PEP transaction spike</strong>
                <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>Hon. Peter Ochieng — 340% above average</div>
              </div>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('pepDetailModal')}>
                Review
              </button>
            </div>
          </div>
          <div className={styles.summaryBoxInfo}>
            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong>Sanctions match</strong>
                <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>Global Trade Ltd — OFAC SDN hit</div>
              </div>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('sanctionsSearchModal')}>
                Screen
              </button>
            </div>
          </div>
        </div>
      </MBox>

      {/* ============ M11: Bulk Screening ============ */}
      <MBox
        id="bulkScreeningModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-people me-2" style={{ color: 'var(--pm-warning)' }} />
            Bulk Sanctions &amp; PEP Screening
          </>
        }
        footer={actionFooter('bulkScreeningModal', 'Start Screening', 'btnPmP', 'Bulk screening started. You will be notified when complete. 47,291 records queued.', 'BULK-20250627-001')}
      >
        {actionBody(
          'bulkScreeningModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Upload File (CSV/Excel)</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Lists to Screen Against</label>
              <div className="form-check mb-1">
                <input className="form-check-input" type="checkbox" defaultChecked id="bs1" />
                <label className="form-check-label" htmlFor="bs1">UN + OFAC + EU + UK</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" defaultChecked id="bs2" />
                <label className="form-check-label" htmlFor="bs2">Local PEP Database</label>
              </div>
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Estimated screening time: <strong>12–18 minutes</strong> for 50,000 records.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M12: Emergency Block ============ */}
      <MBox
        id="emergencyBlockModal"
        active={active}
        onClose={onClose}
        dangerHeader
        title={
          <>
            <i className="bi bi-exclamation-triangle me-2" />
            Emergency Transaction Block
          </>
        }
        footer={actionFooter('emergencyBlockModal', 'Execute Block', 'btnPmD', 'Emergency block executed. 14 transactions frozen across 3 accounts. CBK notified.', 'EMB-20250627-0001')}
      >
        {actionBody(
          'emergencyBlockModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Block Type</label>
              <select className={styles.fc} defaultValue={BLOCK_TYPES[0]}>
                {BLOCK_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Reference / Account</label>
              <input className={styles.fc} defaultValue="TXN-992184 or John Kamau (28471920)" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Reason</label>
              <textarea className={styles.fc} rows={2} defaultValue="Active sanctions hit — immediate block required per CBK directive." />
            </div>
            <div className={styles.summaryBoxDanger} style={{ fontSize: 12 }}>
              <i className="bi bi-shield-x me-1" /> <strong>Warning:</strong> This action is irreversible and will be logged to the audit
              trail with your digital signature.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M13: Test AML Rule ============ */}
      <MBox
        id="ruleTestModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-play me-2" style={{ color: 'var(--pm-primary-light)' }} />
            Test AML Rule
          </>
        }
        footer={actionFooter('ruleTestModal', 'Run Test', 'btnPmP', 'Rule test completed. Precision: 28.4% (+6.8%). False positives reduced by 31%.')}
      >
        {actionBody(
          'ruleTestModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Rule</label>
              <select className={styles.fc} defaultValue={TEST_RULES[0]}>
                {TEST_RULES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Test Dataset</label>
              <select className={styles.fc} defaultValue={TEST_DATASETS[0]}>
                {TEST_DATASETS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Estimated runtime: <strong>45 seconds</strong>. Results will show precision, recall,
              and false positive rate.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M14: Report Detail ============ */}
      <MBox
        id="reportDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text me-2" />
            STR-2025-0612 — Detailed View
          </>
        }
        footer={actionFooter('reportDetailModal', 'Download PDF', 'btnPmP', 'Report downloaded with digital signature and chain of custody certificate.', undefined, 'Close')}
      >
        {actionBody(
          'reportDetailModal',
          <>
            <div className={`${styles.summaryBox} mb-3`}>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Status</span>
                <span className={`${styles.badge} ${styles.badgeS}`}>Submitted to CBK</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Filed</span>
                <strong>26 Jun 2025, 14:32</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className={styles.mutedSmall}>Confirmation</span>
                <strong>CBK-STR-2025-0612</strong>
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Narrative</label>
              <div className={styles.summaryBox} style={{ fontSize: 13 }}>
                Between 12–14 June 2025, John Kamau and linked entities conducted 14 transactions totaling KES 2.84M, all structured just
                below the KES 1M reporting threshold. Pattern consistent with structuring to evade CTR requirements.
              </div>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M15: Regulatory Filing Calendar ============ */}
      <MBox
        id="reportCalendarModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calendar me-2" />
            Regulatory Filing Calendar
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
            ['28 Jun 2025', 'STR Draft #AML-44892 (Due in 18h)', 'Critical', styles.badgeD],
            ['30 Jun 2025', 'Monthly CBK Summary', 'High', styles.badgeW],
            ['15 Jul 2025', 'Quarterly AML Report to CBK', 'Normal', styles.badgeI],
            ['31 Jul 2025', 'PEP Annual Review', 'Normal', styles.badgeI],
          ] as const
        ).map(([date, item, badge, tone]) => (
          <div className={styles.sr} key={item}>
            <div>
              <strong>{date}</strong> — {item}
            </div>
            <span className={`${styles.badge} ${tone}`}>{badge}</span>
          </div>
        ))}
      </MBox>

      {/* ============ M16: Monitoring Settings ============ */}
      <MBox
        id="monitorSettingsModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gear me-2" />
            Monitoring Settings
          </>
        }
        footer={actionFooter('monitorSettingsModal', 'Save Settings', 'btnPmP', 'Monitoring settings saved. Changes effective immediately.')}
      >
        {actionBody(
          'monitorSettingsModal',
          <>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" defaultChecked id="ms1" />
              <label className="form-check-label" htmlFor="ms1">Real-time monitoring enabled</label>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Alert Threshold (Risk Score)</label>
              <input className={styles.fc} defaultValue="65" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Auto-block Threshold</label>
              <input className={styles.fc} defaultValue="85" />
            </div>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="ms2" />
              <label className="form-check-label" htmlFor="ms2">Auto-notify CBK on critical alerts</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="ms3" />
              <label className="form-check-label" htmlFor="ms3">Enable AI-assisted triage</label>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M17: Transaction Detail ============ */}
      <MBox
        id="txnDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-receipt me-2" />
            Transaction TXN-992184
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => onOpen('newCaseModal')}>
              Open Investigation
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-6">
            <div className={styles.summaryBox}>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>From</span>
                <strong>Equity Bank — John Kamau</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>To</span>
                <strong>KCB — Mary Wanjiku</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Amount</span>
                <strong>KES 2,450,000</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className={styles.mutedSmall}>Rail</span>
                <strong>PesaLink</strong>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.summaryBoxDanger}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-danger)' }}>RISK SCORE</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--pm-danger)', fontFamily: 'var(--pm-font-display)' }}>92</div>
              <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Structuring pattern detected</div>
            </div>
          </div>
        </div>
      </MBox>

      {/* ============ M18: All Compliance Items ============ */}
      <MBox
        id="attentionFullModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-circle me-2" style={{ color: 'var(--pm-warning)' }} />
            All Compliance Items
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
            ['Structuring — John Kamau network', 'AML-44892 • Due in 18h', 'Open', 'caseDetailModal', true],
            ['Sanctions match — Global Trade Ltd', 'AML-44885 • Escalated', 'Open', 'caseDetailModal', false],
            ['PEP profile review', 'Hon. Peter Ochieng • 72% match', 'Review', 'pepDetailModal', false],
            ['STR draft pending', 'AML-44892 • Due 28 Jun', 'File', 'regReportModal', false],
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

      {/* ============ M19: AML System Health Check ============ */}
      <MBox
        id="amlHealthModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" style={{ color: 'var(--pm-danger)' }} />
            AML System Health Check
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('amlRulesModal')}>
              Tune Rules
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          {(
            [
              ['98.7', 'DETECTION RATE', 'var(--pm-accent-soft)', 'var(--pm-accent)'],
              ['4.1%', 'FALSE POSITIVE', 'var(--pm-warning-soft)', 'var(--pm-warning)'],
              ['2.4h', 'AVG INVESTIGATION', 'var(--pm-info-soft)', 'var(--pm-info)'],
              ['142', 'FILINGS THIS MONTH', 'var(--pm-purple-soft)', 'var(--pm-purple)'],
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
        <div className={styles.summaryBox} style={{ fontSize: 13 }}>
          <strong>System Status:</strong> All 12 payment rails connected. Sanctions lists last updated 27 Jun 06:00. AI model v3.4 running
          normally.
        </div>
      </MBox>

      {/* ============ M20: Export Cases ============ */}
      <MBox
        id="caseExportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-download me-2" />
            Export Cases
          </>
        }
        footer={actionFooter('caseExportModal', 'Export', 'btnPmP', 'Export generated and downloading...')}
      >
        {actionBody(
          'caseExportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Export Type</label>
              <select className={styles.fc} defaultValue={EXPORT_TYPES[0]}>
                {EXPORT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Format</label>
              <select className={styles.fc} defaultValue={EXPORT_FORMATS[0]}>
                {EXPORT_FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M21: Compliance Notifications ============ */}
      <MBox
        id="amlNotifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell me-2" />
            Compliance Notifications (17)
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
          <div className={`${styles.summaryBoxDanger} mb-2`} style={{ fontSize: 13 }}>
            <strong>Structuring alert — 3 linked txns</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>KES 2.45M in 48h • Case opened</div>
          </div>
          <div className={`${styles.summaryBoxWarn} mb-2`} style={{ fontSize: 13 }}>
            <strong>PEP match on beneficiary</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>TXN-884291 • EDD required</div>
          </div>
          <div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 13 }}>
            <strong>Sanctions list updated</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>47 new entries • Screening in progress</div>
          </div>
          <div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}>
            <strong>STR draft ready</strong>
            <div style={{ fontSize: 11, color: 'var(--pm-ink-soft)' }}>AML-44892 • Due in 18 hours</div>
          </div>
        </div>
      </MBox>

      {/* ============ M22: Profile ============ */}
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
            AK
          </div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>Amina Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>amina.k@email.com · +254 712 345 890</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            {(
              [
                ['Role', 'Compliance Officer'],
                ['Cases Managed', '142 this year'],
                ['Member Since', 'Mar 2022'],
                ['Certifications', 'CAMS, CFCS'],
              ] as const
            ).map(([k, v]) => (
              <div className="col-6" key={k}>
                <div className={`${styles.summaryBox} p-2`}>
                  <span className={styles.mutedSmall}>{k}</span>
                  <br />
                  <strong>{v}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MBox>

      {/* ============ M23: Notification Preferences ============ */}
      <MBox
        id="notifSettingsModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-gear me-2" />
            Notification Preferences
          </>
        }
        footer={actionFooter('notifSettingsModal', 'Save Preferences', 'btnPmP', 'Notification preferences saved.')}
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
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['High-risk alerts', [true, true, true, true]],
                    ['PEP matches', [true, true, false, false]],
                    ['Sanctions hits', [true, true, true, true]],
                    ['Case updates', [true, false, true, false]],
                    ['Regulatory deadlines', [true, true, true, true]],
                  ] as const
                ).map(([type, chans]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    {chans.map((checked, j) => (
                      <td key={j}>
                        <input type="checkbox" className="form-check-input" defaultChecked={checked} aria-label={`${type} channel ${j + 1}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )}
      </MBox>

      {/* ============ M24: Rule Test Results ============ */}
      <MBox
        id="ruleTestResultModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-check-lg me-2" style={{ color: 'var(--pm-accent)' }} />
            Rule Test Results
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={styles.summaryBoxAccent}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pm-accent)' }}>Structuring v4.2 Test Complete</div>
          <div className="mt-2">
            Precision: <strong>28.4%</strong> (+6.8%)<br />
            Recall: <strong>91.2%</strong>
            <br />
            False Positive Rate: <strong>3.1%</strong> (-31%)
          </div>
        </div>
      </MBox>
    </>
  )
}
