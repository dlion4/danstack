import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/corporate-business-cards.module.css'

interface ModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

type Size = 'md' | 'lg' | 'xl'
type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'

interface MBoxProps {
  id: string
  active: string | null
  title: ReactNode
  size?: Size
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
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

/* ---- shared option lists ---- */
const ASSIGNMENT_TYPES = ['Individual Employee', 'Department (Shared)', 'Project (Shared)', 'Vendor-Locked']
const POLICY_GROUPS = ['Standard Employee', 'Executive Level', 'Department Head', 'Custom Policy']
const COST_CENTERS = ['Engineering (CC-400)', 'Sales (CC-200)', 'Marketing (CC-300)']
const RECEIPT_POLICIES = ['Required for all transactions', 'Required > KES 5,000 only', 'Not required']
const MCC_ALLOW = ['Travel & Flights', 'Accommodation', 'Meals & Dining', 'Software / SaaS', 'Office Supplies']
const EXPORT_TARGETS = ['QuickBooks Online', 'Xero', 'Sage 300', 'SAP ERP', 'Generic CSV Export']
const REPORT_TYPES = ['Overall Spend Summary', 'Departmental Breakdown', 'Employee Spend Ranking', 'Policy Violation Audit', 'Merchant Concentration Report']
const REPORT_FORMATS = ['PDF Executive Summary', 'Excel Data Dump', 'CSV Raw Data']
const GEO_SCOPES = ['Domestic Only (Kenya)', 'East Africa Region', 'Global']
const TIME_RESTRICTIONS = ['Anytime', 'Business Hours Only (8am - 6pm)', 'Weekdays Only (Mon-Fri)']
const LIABILITY_MODELS = ['Corporate Liability (Company pays all)', 'Individual Liability (Employee pays, seeks reimbursement)', 'Mixed (Company pays approved, employee pays personal)']

const ISSUE_FLOW = ['Assignment', 'Controls', 'Delivery', 'Done']

interface Result { msg: string; ref?: string }

function Stepper({ labels, current }: { labels: string[]; current: number }) {
  return (
    <div className={styles.stepper}>
      {labels.map((label, i) => {
        const stepNum = i + 1
        const done = stepNum < current
        const activeStep = stepNum === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 80 }}>
            {i > 0 && <div className={styles.stepLine} />}
            <div className={`${styles.step} ${done ? styles.stepDone : ''} ${activeStep ? styles.stepActive : ''}`}>
              <div className={styles.stepNum}>{done ? <i className="bi bi-check" /> : stepNum}</div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CorporateCard({ name, pan = '•••• •••• •••• 1234', logo = 'ACME CORP' }: { name: string; pan?: string; logo?: string }) {
  return (
    <div className={styles.cCard}>
      <div className={styles.cCardLogo}>{logo}</div>
      <div className={styles.cCardChip} />
      <div className={styles.cCardPan}>{pan}</div>
      <div className={styles.cCardBot}>
        <div className={styles.cCardName}>{name}</div>
        <div className={styles.cCardVisa}>VISA</div>
      </div>
    </div>
  )
}

export default function CorporateBusinessCardsModals({ active, onClose, onOpen }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [issueStep, setIssueStep] = useState(1)
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual')
  const [settleCustom, setSettleCustom] = useState(false)

  useEffect(() => {
    if (active === null) {
      setResults({})
      setBusy(null)
      setIssueStep(1)
      setTabs({})
      setCardType('virtual')
      setSettleCustom(false)
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1300)
  }

  const switchTab = (prefix: string, key: string) => setTabs((prev) => ({ ...prev, [prefix]: key }))

  const renderReceipt = (r: Result) => (
    <div className={styles.receipt}>
      <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}><i className="bi bi-check2-all" /> Done</button>
      </div>
    </div>
  )

  const actionBody = (modalId: string, content: ReactNode) => {
    if (busy === modalId) return <BusyOverlay />
    if (results[modalId]) return renderReceipt(results[modalId])
    return content
  }

  /* ============================ 1. ISSUE CARD (multi-step) ============================ */
  const renderIssueCard = () => {
    const step = issueStep
    const advance = () => {
      if (step === 3) {
        setBusy('issueCardModal')
        busyTimer.current = window.setTimeout(() => {
          setIssueStep(4)
          setBusy(null)
        }, 1300)
        return
      }
      if (step >= 4) { onClose(); return }
      setIssueStep((s) => s + 1)
    }
    return (
      <MBox id="issueCardModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-plus-circle text-primary me-2" />Issue Corporate Card</>}
        footer={
          <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={advance}>
              {step >= 4 ? 'Done' : step === 3 ? <>Issue Card <i className="bi bi-check-circle" /></> : <>Continue <i className="bi bi-arrow-right" /></>}
            </button>
          </>
        }
      >
        {busy === 'issueCardModal' ? <BusyOverlay /> : (
          <>
            <Stepper labels={ISSUE_FLOW} current={step} />
            {step === 1 && (
              <div>
                <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Card Assignment</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Assignment Type</label>
                    <select className={styles.formControl}>{ASSIGNMENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Employee / Entity Name</label>
                    <input className={styles.formControl} placeholder="Search employee directory..." />
                  </div>
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Card Type</label>
                    <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3"
                      style={{ cursor: 'pointer', ...(cardType === 'virtual' ? { borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' } : {}) }}
                      onClick={() => setCardType('virtual')}>
                      <input type="radio" checked={cardType === 'virtual'} readOnly />
                      <i className="bi bi-phone" style={{ fontSize: 20, color: 'var(--pm-primary)' }} />
                      <div><strong>Virtual Card</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Instant digital issue</div></div>
                    </div>
                    <div className="p-3 border rounded d-flex align-items-center gap-3"
                      style={{ cursor: 'pointer', ...(cardType === 'physical' ? { borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' } : {}) }}
                      onClick={() => setCardType('physical')}>
                      <input type="radio" checked={cardType === 'physical'} readOnly />
                      <i className="bi bi-credit-card" style={{ fontSize: 20, color: 'var(--pm-accent)' }} />
                      <div><strong>Physical Card</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Delivered in 3-5 days</div></div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Card Design</label>
                    <CorporateCard name="EMPLOYEE NAME" />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Controls & Policies</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Policy Group</label>
                    <select className={styles.formControl}>{POLICY_GROUPS.map((t) => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Monthly Spending Limit (KES)</label>
                    <input className={styles.formControl} defaultValue="50000" />
                  </div>
                  <div className="col-12">
                    <label className={styles.formLabel}>Allowed Categories (MCC)</label>
                    <div className="d-flex flex-wrap gap-3">
                      {MCC_ALLOW.map((m, i) => (
                        <div key={m} className="form-check">
                          <input className="form-check-input" type="checkbox" defaultChecked={i < 3} id={`mcc-${m}`} />
                          <label className="form-check-label" htmlFor={`mcc-${m}`}>{m}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className={styles.formLabel}>Restrictions</label>
                    <div className="form-check form-switch mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Block weekend transactions</label></div>
                    <div className="form-check form-switch mb-1"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Block international / FX transactions</label></div>
                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Require pre-approval &gt; KES 10,000</label></div>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Cost Center & Delivery</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Default GL Code / Cost Center</label>
                    <select className={styles.formControl}>{COST_CENTERS.map((t) => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div className="col-md-6">
                    <label className={styles.formLabel}>Receipt Policy</label>
                    <select className={styles.formControl}>{RECEIPT_POLICIES.map((t) => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
                      <i className="bi bi-envelope me-1" /> Virtual card details will be securely emailed to the employee with activation instructions. They must download the PayMo Corporate app to view full PAN and CVV.
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className={styles.receipt}>
                <div className={styles.receiptIcon}><i className="bi bi-credit-card" /></div>
                <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Card Issued Successfully!</h5>
                <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>The virtual corporate card has been provisioned and the employee has been notified.</p>
                <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13, border: '1px solid var(--pm-border)' }}>
                  <div className="d-flex justify-content-between mb-2"><span className="text-muted">Cardholder</span><strong>Sarah Kamau</strong></div>
                  <div className="d-flex justify-content-between mb-2"><span className="text-muted">Limit</span><strong>KES 50,000 /mo</strong></div>
                  <div className="d-flex justify-content-between mb-2"><span className="text-muted">Type</span><strong>Virtual Visa</strong></div>
                  <div className="d-flex justify-content-between"><span className="text-muted">Card ID</span><strong>VCD-8841-92</strong></div>
                </div>
              </div>
            )}
          </>
        )}
      </MBox>
    )
  }

  /* ============================ 2. BULK ISSUE ============================ */
  const renderBulkIssue = () => (
    <MBox id="bulkIssueModal" active={active} onClose={onClose}
      title={<><i className="bi bi-people me-2" />Bulk Employee Card Upload</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('bulkIssueModal', 'Batch upload successful. 24 cards are being provisioned.', 'BAT-1029')}>Process Batch</button>
        </>
      }
    >
      {actionBody('bulkIssueModal', <>
        <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface-2)', border: '1px dashed var(--pm-border)' }}>
          <i className="bi bi-file-earmark-spreadsheet d-block mb-2" style={{ fontSize: 32, color: 'var(--pm-info)' }} />
          <strong>Upload CSV File</strong>
          <div style={{ fontSize: 12, color: 'var(--pm-muted)', marginBottom: 10 }}>Format: Name, Email, Dept, Limit, Policy Group</div>
          <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-upload" /> Browse File</button>
        </div>
        <div className="text-center mb-3"><a href="#" style={{ fontSize: 12, color: 'var(--pm-primary)', textDecoration: 'none' }}><i className="bi bi-download" /> Download CSV Template</a></div>
        <hr className={styles.divider} />
        <div className="mb-3"><label className={styles.formLabel}>Default Card Type for Batch</label>
          <select className={styles.formControl}><option>Virtual Cards</option><option>Physical Cards (Central Delivery to HR)</option></select>
        </div>
      </>)}
    </MBox>
  )

  /* ============================ 3. POLICY RULES (tabs) ============================ */
  const renderPolicyRules = () => {
    const tab = tabs.policy ?? 'groups'
    return (
      <MBox id="policyRulesModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-shield-lock me-2" />Corporate Spending Policies</>}
        footer={
          <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('policyRulesModal', 'Policy rules updated across the entire corporate portfolio.', '')}>Save Global Policies</button>
          </>
        }
      >
        {actionBody('policyRulesModal', <>
          <div className={`${styles.tabPills} mb-3`}>
            <button className={`${styles.tabPill} ${tab === 'groups' ? styles.tabPillActive : ''}`} onClick={() => switchTab('policy', 'groups')}>Policy Groups</button>
            <button className={`${styles.tabPill} ${tab === 'mcc' ? styles.tabPillActive : ''}`} onClick={() => switchTab('policy', 'mcc')}>MCC Restrictions</button>
            <button className={`${styles.tabPill} ${tab === 'approval' ? styles.tabPillActive : ''}`} onClick={() => switchTab('policy', 'approval')}>Approval Routing</button>
          </div>
          {tab === 'groups' && (
            <div>
              <div className="d-flex justify-content-between mb-3">
                <label className={styles.formLabel}>Manage Policy Groups</label>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('createPolicyModal')}>New Group</button>
              </div>
              <div className="table-responsive">
                <table className={styles.table}>
                  <thead><tr><th>Group Name</th><th>Default Limit</th><th>Rules</th><th>Members</th><th>Action</th></tr></thead>
                  <tbody>
                    <tr><td data-label="Group Name">Standard Employee</td><td data-label="Default Limit">KES 50K</td><td data-label="Rules">Strict MCC, No weekends</td><td data-label="Members">24</td><td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-pencil" /></button></td></tr>
                    <tr><td data-label="Group Name">Executive Level</td><td data-label="Default Limit">KES 500K</td><td data-label="Rules">All MCC, Global access</td><td data-label="Members">6</td><td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-pencil" /></button></td></tr>
                    <tr><td data-label="Group Name">Department Head</td><td data-label="Default Limit">KES 200K</td><td data-label="Rules">SaaS + T&E</td><td data-label="Members">8</td><td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-pencil" /></button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'mcc' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Global category blocks (applies to all cards unless explicitly overridden by an Executive policy).</p>
              <div className="row g-2">
                {[['Gambling & Betting', true], ['Adult Content / Entertainment', true], ['Cryptocurrency & Trading', true], ['Alcohol & Bars', false]].map(([label, on]) => (
                  <div key={label as string} className="col-md-6">
                    <div className="form-check form-switch p-2 border rounded">
                      <input className="form-check-input" type="checkbox" defaultChecked={on as boolean} />
                      <label className="form-check-label">{label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'approval' && (
            <div>
              <div className="mb-3">
                <label className={styles.formLabel}>Auto-Approval Threshold</label>
                <input className={styles.formControl} defaultValue="10000" type="number" />
                <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>Transactions below this amount require no manual pre-approval if within policy.</div>
              </div>
              <div className={styles.statusRow}>
                <div><strong>Manager Approval</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>For transactions KES 10K - 100K</div></div>
                <span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span>
              </div>
              <div className={styles.statusRow}>
                <div><strong>Director / Finance Approval</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>For transactions &gt; KES 100K</div></div>
                <span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span>
              </div>
              <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" defaultChecked />
                <label className="form-check-label" style={{ fontSize: 13 }}>Auto-approve recurring software subscriptions (AWS, Google, etc.)</label>
              </div>
            </div>
          )}
        </>)}
      </MBox>
    )
  }

  /* ============================ 4. CREATE POLICY ============================ */
  const renderCreatePolicy = () => (
    <MBox id="createPolicyModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-plus me-2" />Create New Policy Group</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('createPolicyModal', 'New policy group created successfully.', '')}>Create Group</button>
        </>
      }
    >
      {actionBody('createPolicyModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Policy Group Name</label><input className={styles.formControl} placeholder="e.g. Sales Team Travel" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Base Monthly Limit (KES)</label><input className={styles.formControl} defaultValue="0" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Allowed Geographic Scope</label><select className={styles.formControl}>{GEO_SCOPES.map((g) => <option key={g}>{g}</option>)}</select></div>
        <div className="mb-3"><label className={styles.formLabel}>Time Restrictions</label><select className={styles.formControl}>{TIME_RESTRICTIONS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Require receipts for all transactions in this group</label></div>
      </>)}
    </MBox>
  )

  /* ============================ 5. APPROVAL QUEUE ============================ */
  const renderApprovalQueue = () => (
    <MBox id="approvalQueueModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-ui-checks me-2" />Manager Approval Queue</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="d-flex justify-content-between mb-3">
        <label className={styles.formLabel}>Pending Requests (8)</label>
        <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-check-all" /> Bulk Approve Selected</button>
      </div>
      <div className="table-responsive">
        <table className={styles.table}>
          <thead><tr><th></th><th>Requestor</th><th>Merchant/Type</th><th>Amount</th><th>Status/Flag</th><th>Action</th></tr></thead>
          <tbody>
            {[['S. Kamau', 'AWS EMEA', 'KES 145,000', '> KES 100K limit', 'badgeW'], ['J. Wanjiku', 'Sarova Stanley', 'KES 24,500', 'Manager Auth', 'badgeI'], ['D. Mutua', 'Apple Store', 'KES 184,000', 'Unauthorized MCC', 'badgeD'], ['B. Kiptoo', 'Naivas Supermarket', 'KES 12,000', 'Manager Auth', 'badgeI']].map((r) => (
              <tr key={r[0]}>
                <td data-label=""><input type="checkbox" /></td>
                <td data-label="Requestor">{r[0]}</td>
                <td data-label="Merchant/Type">{r[1]}</td>
                <td data-label="Amount">{r[2]}</td>
                <td data-label="Status/Flag"><span className={`${styles.badge} ${styles[r[4] as BadgeTone]}`}>{r[3]}</span></td>
                <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('reviewTransactionModal')}>Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ============================ 6. REVIEW TRANSACTION ============================ */
  const renderReviewTransaction = () => (
    <MBox id="reviewTransactionModal" active={active} onClose={onClose}
      title={<><i className="bi bi-search me-2" />Review Transaction Request</>}
      footer={
        <div className="d-flex justify-content-between w-100" style={{ gap: 8 }}>
          <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => doAction('reviewTransactionModal', 'Transaction request rejected. Employee notified.', '')}><i className="bi bi-x-circle" /> Reject</button>
          <button className={`${styles.btnPm} ${styles.btnPmA}`} onClick={() => doAction('reviewTransactionModal', 'Transaction approved successfully.', 'AUTH-99120')}><i className="bi bi-check-circle" /> Approve</button>
        </div>
      }
    >
      {actionBody('reviewTransactionModal', <>
        <div className="text-center mb-4">
          <div className={`${styles.avatar} mx-auto mb-2`} style={{ width: 48, height: 48, fontSize: 16 }}>SK</div>
          <h6 style={{ fontWeight: 700, margin: 0 }}>Sarah Kamau</h6>
          <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Engineering Dept</div>
        </div>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Merchant</span><strong>AWS EMEA</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong style={{ color: 'var(--pm-primary)' }}>KES 145,000</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Category</span><strong>Software / IT</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Policy Flag</span><span className={`${styles.badge} ${styles.badgeW}`}>Exceeds KES 100K</span></div>
        </div>
        <div className="mb-3">
          <label className={styles.formLabel}>Employee Note</label>
          <div className="p-3 border rounded" style={{ fontSize: 13, fontStyle: 'italic' }}>"Monthly server hosting bill. Spiked this month due to new database migration tests."</div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Manager Note (Optional)</label><textarea className={styles.formControl} rows={2} placeholder="Reason for approval or rejection..." /></div>
      </>)}
    </MBox>
  )

  /* ============================ 7. RECONCILIATION ============================ */
  const renderReconciliation = () => (
    <MBox id="reconciliationModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-journal-check me-2" />Accounting & Reconciliation</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('reconciliationModal', 'Data synced to QuickBooks Online successfully. 142 records pushed.', '')}><i className="bi bi-cloud-upload" /> Sync to Accounting</button>
        </>
      }
    >
      {actionBody('reconciliationModal', <>
        <div className="row g-3 mb-4">
          <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>142</div><div style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>READY TO EXPORT</div></div></div>
          <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>14</div><div style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>MISSING RECEIPTS</div></div></div>
          <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-danger-soft)' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-danger)' }}>3</div><div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>UNCODED (NO GL)</div></div></div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Export Target System</label><select className={styles.formControl}>{EXPORT_TARGETS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="mb-3"><label className={styles.formLabel}>Date Range</label>
          <div className="row g-2"><div className="col-6"><input type="date" className={styles.formControl} defaultValue="2025-06-01" /></div><div className="col-6"><input type="date" className={styles.formControl} defaultValue="2025-06-28" /></div></div>
        </div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Only export fully reconciled transactions (receipt + GL code matched)</label></div>
      </>)}
    </MBox>
  )

  /* ============================ 8. MISSING RECEIPTS ============================ */
  const renderMissingReceipts = () => (
    <MBox id="missingReceiptsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-receipt me-2" />Missing Receipts Chase</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="d-flex justify-content-between mb-3">
        <label className={styles.formLabel}>Outstanding Items (14)</label>
        <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmDSoft}`}><i className="bi bi-envelope" /> Chase All via Email</button>
      </div>
      <div className="table-responsive">
        <table className={styles.table}>
          <thead><tr><th>Employee</th><th>Date</th><th>Merchant</th><th>Amount</th><th>Days Old</th><th>Action</th></tr></thead>
          <tbody>
            {[['P. Ochieng', '16 Jun', 'Emirates Air', 'KES 85,200', '12 days', 'var(--pm-danger)'], ['J. Wanjiku', '20 Jun', 'Java House', 'KES 8,500', '8 days', 'var(--pm-warning)'], ['Mktg Dept', '22 Jun', 'Google Ads', 'KES 120,000', '6 days', 'var(--pm-warning)'], ['D. Mutua', '25 Jun', 'Shell Station', 'KES 6,000', '3 days', 'var(--pm-ink)']].map((r) => (
              <tr key={`${r[0]}-${r[1]}`}>
                <td data-label="Employee">{r[0]}</td>
                <td data-label="Date">{r[1]}</td>
                <td data-label="Merchant">{r[2]}</td>
                <td data-label="Amount">{r[3]}</td>
                <td data-label="Days Old"><strong style={{ color: r[5] }}>{r[4]}</strong></td>
                <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('uploadReceiptModal')}>Upload</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ============================ 9. UPLOAD RECEIPT ============================ */
  const renderUploadReceipt = () => (
    <MBox id="uploadReceiptModal" active={active} onClose={onClose}
      title={<><i className="bi bi-upload me-2" />Upload Receipt</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('uploadReceiptModal', 'Receipt uploaded and matched successfully.', '')}>Submit Receipt</button>
        </>
      }
    >
      {actionBody('uploadReceiptModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Transaction</span><strong>Emirates Air</strong></div>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Amount</span><strong>KES 85,200</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Employee</span><strong>P. Ochieng</strong></div>
        </div>
        <div className="p-4 border rounded mb-3 text-center" style={{ borderStyle: 'dashed' }}>
          <i className="bi bi-file-earmark-image d-block mb-2" style={{ fontSize: 24, color: 'var(--pm-muted)' }} />
          <label className={styles.formLabel} style={{ cursor: 'pointer', color: 'var(--pm-primary)', marginBottom: 0 }}>Click to browse or drag file here<input type="file" style={{ display: 'none' }} /></label>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>PDF, JPG, PNG up to 5MB</div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Note / Purpose</label><input className={styles.formControl} placeholder="e.g. Flight to Dubai for tech conference" /></div>
      </>)}
    </MBox>
  )

  /* ============================ 10. CARD ROSTER ============================ */
  const renderCardRoster = () => (
    <MBox id="cardRosterModal" active={active} size="xl" onClose={onClose}
      title={<><i className="bi bi-list-ul me-2" />Corporate Card Directory</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('issueCardModal')}>Issue New Card</button>
        </>
      }
    >
      <div className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
        <select className={styles.formControl} style={{ width: 'auto' }}><option>All Departments</option><option>Engineering</option><option>Sales</option><option>Marketing</option></select>
        <select className={styles.formControl} style={{ width: 'auto' }}><option>All Statuses</option><option>Active</option><option>Frozen</option><option>Pending Activation</option></select>
        <input className={styles.formControl} style={{ width: 250 }} placeholder="Search name or card last 4..." />
      </div>
      <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table className={styles.table}>
          <thead><tr><th>Employee / Dept</th><th>Card ending in</th><th>Type</th><th>Limit</th><th>Spend MTD</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {[['Sarah Kamau (Eng)', '•••• 8821', 'Virtual', 'KES 150K', 'KES 42K', 'Active', 'badgeS'], ['Peter Ochieng (Sales)', '•••• 4410', 'Physical', 'KES 80K', 'KES 76K', 'Active', 'badgeS'], ['Jane Wanjiku (Exec)', '•••• 9022', 'Physical', 'KES 500K', 'KES 210K', 'Active', 'badgeS'], ['Mktg Procure (Dept)', '•••• 1120', 'Virtual', 'KES 500K', 'KES 410K', 'Active', 'badgeS'], ['David Mutua (Sales)', '•••• 5531', 'Physical', 'KES 50K', 'KES 0', 'Frozen', 'badgeW'], ['Project Alpha (Shared)', '•••• 7748', 'Virtual', 'KES 1M', 'KES 950K', 'Active', 'badgeS']].map((r) => (
              <tr key={r[1]}>
                <td data-label="Employee / Dept">{r[0]}</td>
                <td data-label="Card ending in">{r[1]}</td>
                <td data-label="Type">{r[2]}</td>
                <td data-label="Limit">{r[3]}</td>
                <td data-label="Spend MTD">{r[4]}</td>
                <td data-label="Status"><span className={`${styles.badge} ${styles[r[6] as BadgeTone]}`}>{r[5]}</span></td>
                <td data-label="Action"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('manageEmployeeCardModal')}>Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ============================ 11. MANAGE EMPLOYEE CARD ============================ */
  const renderManageEmployeeCard = () => (
    <MBox id="manageEmployeeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-credit-card-2-front me-2" />Manage Card: Sarah Kamau</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('manageEmployeeCardModal', 'Card settings updated successfully.', '')}>Save Changes</button>
        </>
      }
    >
      {actionBody('manageEmployeeCardModal', <>
        <div className="text-center mb-3">
          <CorporateCard name="SARAH KAMAU" pan="•••• •••• •••• 8821" />
        </div>
        <div className="d-flex justify-content-between mb-3" style={{ gap: 8 }}>
          <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-snow" /> Freeze</button>
          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('editLimitModal')}><i className="bi bi-sliders" /> Edit Limit</button>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmDSoft}`}><i className="bi bi-trash" /> Cancel</button>
        </div>
        <hr className={styles.divider} />
        <div className="mb-3"><label className={styles.formLabel}>Policy Group</label>
          <select className={styles.formControl}><option>Standard Employee (KES 50K Limit)</option><option>Department Head (KES 200K Limit)</option></select>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Linked Cost Center</label>
          <select className={styles.formControl}><option>Engineering (CC-400)</option><option>Product (CC-410)</option></select>
        </div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Online Transactions Allowed</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">International Transactions Allowed</label></div>
      </>)}
    </MBox>
  )

  /* ============================ 12. EDIT LIMIT ============================ */
  const renderEditLimit = () => (
    <MBox id="editLimitModal" active={active} onClose={onClose}
      title={<><i className="bi bi-sliders me-2" />Adjust Card Limits</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('editLimitModal', 'Card limits updated successfully. Employee notified.', '')}>Update Limit</button>
        </>
      }
    >
      {actionBody('editLimitModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Cardholder</span><strong>Sarah Kamau</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Current Limit</span><strong>KES 150,000 /mo</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Utilized</span><strong style={{ color: 'var(--pm-warning)' }}>KES 142,000 (94%)</strong></div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>New Monthly Limit (KES)</label><input type="number" className={styles.formControl} defaultValue="200000" /></div>
        <div className="mb-3"><label className={styles.formLabel}>Per-Transaction Limit (KES)</label><input type="number" className={styles.formControl} defaultValue="50000" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Make this a temporary limit increase (reverts at end of month)</label></div>
      </>)}
    </MBox>
  )

  /* ============================ 13. EXPENSE DETAIL ============================ */
  const renderExpenseDetail = () => (
    <MBox id="expenseDetailModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-receipt text-primary me-2" />Expense Detail</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('expenseDetailModal', 'Expense coding saved and marked ready for sync.', '')}>Save Coding</button>
        </>
      }
    >
      {actionBody('expenseDetailModal', <>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 rounded h-100" style={{ background: 'var(--pm-surface-2)' }}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>KES 1,200</div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Merchant</span><strong>Uber Kenya</strong></div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Date</span><strong>28 Jun 2025, 14:30</strong></div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}><span className="text-muted">Cardholder</span><strong>Sarah Kamau</strong></div>
              <div className="d-flex justify-content-between" style={{ fontSize: 13 }}><span className="text-muted">Auth Code</span><strong>A-991204</strong></div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3"><label className={styles.formLabel}>GL Category / Code</label>
              <select className={styles.formControl}><option>Travel & Local Trans (GL-6100)</option><option>Meals & Ent (GL-6300)</option></select>
            </div>
            <div className="mb-3"><label className={styles.formLabel}>Cost Center</label>
              <select className={styles.formControl}><option>Engineering (CC-400)</option><option>General Admin (CC-100)</option></select>
            </div>
            <div className="mb-3"><label className={styles.formLabel}>Business Purpose</label><input className={styles.formControl} defaultValue="Ride to client site meeting at Westlands" /></div>
          </div>
          <div className="col-12">
            <label className={styles.formLabel}>Receipt Image</label>
            <div className="p-3 border rounded text-center">
              <i className="bi bi-file-earmark-pdf" style={{ fontSize: 32, color: 'var(--pm-danger)' }} />
              <div className="mt-2" style={{ fontSize: 12, fontWeight: 600 }}>Uber_Receipt_Jun28.pdf</div>
              <button className={`${styles.btnPm} ${styles.btnSm} mt-2`}><i className="bi bi-eye" /> View Document</button>
            </div>
          </div>
        </div>
      </>)}
    </MBox>
  )

  /* ============================ 14. ATTENTION CENTER ============================ */
  const renderAttentionCenter = () => (
    <MBox id="attentionCenterModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-exclamation-circle text-warning me-2" />Corporate Attention Center</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={styles.attentionRow} style={{ borderLeft: '3px solid var(--pm-warning)' }}>
        <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
          <div><strong>Large transaction requires approval</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>S. Kamau · AWS EMEA · KES 145,000</div></div>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => onOpen('reviewTransactionModal')}>Review</button>
        </div>
      </div>
      <div className={styles.attentionRow} style={{ borderLeft: '3px solid var(--pm-danger)' }}>
        <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
          <div><strong>Missing receipt limit exceeded (12 days)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>P. Ochieng · Emirates Air · KES 85,200</div></div>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmDSoft}`} onClick={() => onOpen('missingReceiptsModal')}>Chase</button>
        </div>
      </div>
      <div className={styles.attentionRow} style={{ borderLeft: '3px solid var(--pm-purple)' }}>
        <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
          <div><strong>Policy violation - out of hours spend</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>J. Njoroge · Naivas · KES 8,000 (Blocked)</div></div>
          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('violationDetailsModal')}>Inspect</button>
        </div>
      </div>
      <div className={styles.attentionRow} style={{ borderLeft: '3px solid var(--pm-info)' }}>
        <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
          <div><strong>Marketing Dept card limit warning</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>98% utilized (KES 490K/500K)</div></div>
          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('editLimitModal')}>Top-up</button>
        </div>
      </div>
    </MBox>
  )

  /* ============================ 15. VIOLATION DETAILS ============================ */
  const renderViolationDetails = () => (
    <MBox id="violationDetailsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-exclamation text-danger me-2" />Policy Violation Report</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('violationDetailsModal', 'Violation logged. No policy changes made.', '')}>Confirm Action</button>
        </>
      }
    >
      {actionBody('violationDetailsModal', <>
        <div className="text-center mb-3">
          <i className="bi bi-x-circle text-danger" style={{ fontSize: 48 }} />
          <h5 style={{ marginTop: 8, fontWeight: 700 }}>Transaction Blocked</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Transaction violated active corporate policy.</p>
        </div>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Employee</span><strong>J. Njoroge</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Merchant</span><strong>Naivas Supermarket</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 8,000</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Time</span><strong>Sun, 22 Jun 14:15</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Violation Reason</span><strong style={{ color: 'var(--pm-danger)' }}>Weekend Block Active</strong></div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Action to Take</label>
          <select className={styles.formControl}><option>Acknowledge & keep block</option><option>Create one-time exception & notify employee</option><option>Modify policy to allow weekend spend</option></select>
        </div>
      </>)}
    </MBox>
  )

  /* ============================ 16. FUNDING (tabs) ============================ */
  const renderFunding = () => {
    const tab = tabs.fund ?? 'deposit'
    return (
      <MBox id="fundingModal" active={active} onClose={onClose}
        title={<><i className="bi bi-cash-stack text-success me-2" />Corporate Program Funding</>}
        footer={
          <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
            <button className={`${styles.btnPm} ${styles.btnPmA}`} onClick={() => doAction('fundingModal', 'Deposit initiated. Funds will reflect instantly via RTGS API.', '')}>Initiate Transfer</button>
          </>
        }
      >
        {actionBody('fundingModal', <>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', border: '1px solid var(--pm-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-muted)' }}>CENTRAL BILLING WALLET</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>KES 8,540,000</div>
            <div style={{ fontSize: 12, color: 'var(--pm-muted)', marginTop: 4 }}>Available for settlement and prepaid cards</div>
          </div>
          <div className={`${styles.tabPills} mb-3`}>
            <button className={`${styles.tabPill} ${tab === 'deposit' ? styles.tabPillActive : ''}`} onClick={() => switchTab('fund', 'deposit')}>Deposit</button>
            <button className={`${styles.tabPill} ${tab === 'withdraw' ? styles.tabPillActive : ''}`} onClick={() => switchTab('fund', 'withdraw')}>Withdraw</button>
            <button className={`${styles.tabPill} ${tab === 'autofund' ? styles.tabPillActive : ''}`} onClick={() => switchTab('fund', 'autofund')}>Auto-Fund</button>
          </div>
          {tab === 'deposit' && (
            <div>
              <div className="mb-3"><label className={styles.formLabel}>Amount to Deposit (KES)</label><input type="number" className={styles.formControl} defaultValue="2000000" /></div>
              <div className="mb-3"><label className={styles.formLabel}>Funding Source</label><select className={styles.formControl}><option>Linked Equity Bank (***4491)</option><option>RTGS / EFT Transfer (Show details)</option></select></div>
            </div>
          )}
          {tab === 'withdraw' && (
            <div>
              <div className="mb-3"><label className={styles.formLabel}>Amount to Withdraw (KES)</label><input type="number" className={styles.formControl} placeholder="0" /></div>
              <div className="mb-3"><label className={styles.formLabel}>Destination</label><select className={styles.formControl}><option>Linked Equity Bank (***4491)</option></select></div>
            </div>
          )}
          {tab === 'autofund' && (
            <div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Enable auto-funding</label></div>
              <div className="mb-3"><label className={styles.formLabel}>When wallet balance falls below (KES)</label><input type="number" className={styles.formControl} defaultValue="1000000" /></div>
              <div className="mb-3"><label className={styles.formLabel}>Auto-transfer amount (KES)</label><input type="number" className={styles.formControl} defaultValue="5000000" /></div>
            </div>
          )}
        </>)}
      </MBox>
    )
  }

  /* ============================ 17. REPORTS ============================ */
  const renderReports = () => (
    <MBox id="reportsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bar-chart text-danger me-2" />Corporate Spend Reports</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('reportsModal', 'Report generated and downloaded successfully.', '')}><i className="bi bi-download" /> Generate Report</button>
        </>
      }
    >
      {actionBody('reportsModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Report Type</label><select className={styles.formControl}>{REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="row g-3 mb-3">
          <div className="col-6"><label className={styles.formLabel}>Date From</label><input type="date" className={styles.formControl} defaultValue="2025-06-01" /></div>
          <div className="col-6"><label className={styles.formLabel}>Date To</label><input type="date" className={styles.formControl} defaultValue="2025-06-28" /></div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Format</label><select className={styles.formControl}>{REPORT_FORMATS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="mb-3"><label className={styles.formLabel}>Delivery</label><select className={styles.formControl}><option>Download instantly</option><option>Email to finance@acmecorp.co.ke</option></select></div>
      </>)}
    </MBox>
  )

  /* ============================ 18. STATEMENT ============================ */
  const renderStatement = () => (
    <MBox id="statementModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-pdf text-info me-2" />Corporate Billing Statement</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`}><i className="bi bi-download" /> Download PDF</button></>
      }
    >
      <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface-2)', border: '1px solid var(--pm-border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-muted)' }}>ACME CORP MAY STATEMENT</div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>KES 1,985,400</div>
        <div style={{ fontSize: 12, color: 'var(--pm-accent)', marginTop: 4 }}><i className="bi bi-check-circle" /> Settled in full on 02 Jun 2025</div>
      </div>
      <div className="table-responsive">
        <table className={styles.table}>
          <thead><tr><th>Summary Item</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td data-label="Summary Item">Total Purchases</td><td data-label="Amount">KES 1,985,400</td></tr>
            <tr><td data-label="Summary Item">Cash Advances</td><td data-label="Amount">KES 0</td></tr>
            <tr><td data-label="Summary Item">Fees & Charges</td><td data-label="Amount">KES 0</td></tr>
            <tr><td data-label="Summary Item">Payments Received</td><td data-label="Amount">(KES 1,985,400)</td></tr>
            <tr><td data-label="Summary Item"><strong>New Balance</strong></td><td data-label="Amount"><strong>KES 0</strong></td></tr>
          </tbody>
        </table>
      </div>
    </MBox>
  )

  /* ============================ 19. SETTLEMENT ============================ */
  const renderSettlement = () => (
    <MBox id="settlementModal" active={active} onClose={onClose}
      title={<><i className="bi bi-cash text-success me-2" />Settle Statement Balance</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('settlementModal', 'Payment of KES 2,410,500 processed successfully. Balance is now 0.', 'SET-99104')}>Confirm Payment</button>
        </>
      }
    >
      {actionBody('settlementModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', border: '1px solid var(--pm-warning)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>CURRENT OUTSTANDING</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 2,410,500</div>
            </div>
            <span className={`${styles.badge} ${styles.badgeW}`}>Due 05 Jul</span>
          </div>
        </div>
        <div className="mb-3">
          <label className={styles.formLabel}>Payment Amount</label>
          <select className={styles.formControl} onChange={(e) => setSettleCustom(e.target.value === 'custom')}>
            <option value="full">Pay Full Statement (KES 2,410,500)</option>
            <option value="custom">Pay Custom Amount</option>
          </select>
          {settleCustom && <input type="number" className={`${styles.formControl} mt-2`} placeholder="Enter amount" />}
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Payment Source</label>
          <select className={styles.formControl}><option>Deduct from Central Wallet (KES 8.5M avail)</option><option>Direct Debit from Equity Bank (***4491)</option></select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
          <i className="bi bi-info-circle me-1" /> Auto-debit is scheduled for 05 Jul. Making a manual payment now will reduce or cancel the auto-debit amount.
        </div>
      </>)}
    </MBox>
  )

  /* ============================ 20. CARD DELIVERY ============================ */
  const renderCardDelivery = () => (
    <MBox id="cardDeliveryModal" active={active} onClose={onClose}
      title={<><i className="bi bi-truck me-2" />Track Physical Card Delivery</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-4" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Employee</span><strong>Peter Ochieng</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Card ending</span><strong>•••• 4410</strong></div>
        <div className="d-flex justify-content-between"><span className="text-muted">Tracking #</span><strong style={{ color: 'var(--pm-primary)' }}>FGL-29188402</strong></div>
      </div>
      <div className="d-flex flex-column" style={{ gap: 16 }}>
        {[
          { icon: <i className="bi bi-check" />, bg: 'var(--pm-accent)', title: 'Card Printed & Personalized', sub: '25 Jun 2025, 09:14', dim: false },
          { icon: <i className="bi bi-check" />, bg: 'var(--pm-accent)', title: 'Dispatched to Courier', sub: '26 Jun 2025, 14:30', dim: false },
          { icon: <i className="bi bi-truck" />, bg: 'var(--pm-primary)', title: 'Out for Delivery', sub: 'Expected today by 17:00', dim: false, active: true },
          { icon: '4', bg: 'var(--pm-border)', title: 'Delivered', sub: 'Pending', dim: true },
        ].map((s, i) => (
          <div key={i} className="d-flex gap-3 align-items-center" style={s.dim ? { opacity: 0.5 } : {}}>
            <div className={styles.iconCircle} style={{ width: 28, height: 28, fontSize: 12, background: s.bg, color: s.bg === 'var(--pm-border)' ? 'var(--pm-muted)' : '#fff' }}>{s.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: s.active ? 'var(--pm-primary)' : undefined }}>{s.title}</div>
              <div style={{ fontSize: 11, color: s.active ? 'var(--pm-primary)' : 'var(--pm-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </MBox>
  )

  /* ============================ 21. BILLING SETUP ============================ */
  const renderBillingSetup = () => (
    <MBox id="billingSetupModal" active={active} onClose={onClose}
      title={<><i className="bi bi-building-gear me-2" />Corporate Billing Setup</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('billingSetupModal', 'Billing configuration updated successfully.', '')}>Save Setup</button>
        </>
      }
    >
      {actionBody('billingSetupModal', <>
        <div className="mb-3"><label className={styles.formLabel}>Liability Model</label><select className={styles.formControl}>{LIABILITY_MODELS.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div className="mb-3"><label className={styles.formLabel}>Billing Cycle End Date</label><select className={styles.formControl}><option>End of Month (30th/31st)</option><option>15th of Month</option><option>Custom</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Auto-Debit Settlement</label><select className={styles.formControl}><option>Enabled - Full Balance</option><option>Enabled - Minimum Payment</option><option>Disabled - Manual settlement</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Settlement Grace Period</label><select className={styles.formControl}><option>5 days after statement</option><option>10 days after statement</option><option>15 days after statement</option></select></div>
      </>)}
    </MBox>
  )

  /* ============================ 22. BRANDING ============================ */
  const renderBranding = () => (
    <MBox id="brandingModal" active={active} onClose={onClose}
      title={<><i className="bi bi-palette me-2" />Card Branding & Design</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('brandingModal', 'Card branding updated. Virtual cards reflect the new design immediately.', '')}>Save Branding</button>
        </>
      }
    >
      {actionBody('brandingModal', <>
        <div className="row g-3">
          <div className="col-12"><CorporateCard name="EMPLOYEE NAME" /></div>
          <div className="col-12"><label className={styles.formLabel}>Company Logo (White/Transparent PNG)</label><input type="file" className={styles.formControl} /></div>
          <div className="col-md-6"><label className={styles.formLabel}>Primary Card Color</label><input type="color" className={styles.formControl} style={{ height: 40, padding: 4 }} defaultValue="#0F172A" /></div>
          <div className="col-md-6"><label className={styles.formLabel}>Card Scheme</label><select className={styles.formControl}><option>Visa Corporate</option><option>Mastercard Business</option></select></div>
          <div className="col-12">
            <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Apply to all existing virtual cards instantly</label></div>
          </div>
        </div>
      </>)}
    </MBox>
  )

  /* ============================ 23. NOTIFICATIONS ============================ */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bell me-2" />Admin Notifications</>}
      footer={
        <><button className={`${styles.btnPm} ${styles.btnSm}`}>Mark All Read</button>
          <button className={styles.btnPm} onClick={onClose}>Close</button></>
      }
    >
      <div style={{ maxHeight: 450, overflowY: 'auto' }}>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><i className="bi bi-ui-checks text-warning me-1" /> <strong>8 transactions pending approval</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>2 hours ago</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><i className="bi bi-receipt text-danger me-1" /> <strong>14 receipts missing beyond grace period</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>5 hours ago</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><i className="bi bi-credit-card text-info me-1" /> <strong>Marketing Dept card near limit</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>1 day ago</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><i className="bi bi-check-circle text-success me-1" /> <strong>Statement auto-debit successful</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>May 03, 2025</div></div>
      </div>
    </MBox>
  )

  /* ============================ 24. COMPANY PROFILE ============================ */
  const renderCompanyProfile = () => (
    <MBox id="companyProfileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-building me-2" />Company Profile & Access</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center">
        <div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24, background: '#1E293B' }}>A</div>
        <h5 style={{ fontWeight: 700, marginBottom: 2 }}>Acme Corporation Ltd</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>KRA PIN: P051283991K · IT & Software</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Admin Name</span><br /><strong>Jane Doe (CFO)</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Total Issued Limits</span><br /><strong>KES 4.2M</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Active Cards</span><br /><strong>42</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Billing Cycle</span><br /><strong>Ends 30th</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  return (
    <>
      {renderIssueCard()}
      {renderBulkIssue()}
      {renderPolicyRules()}
      {renderCreatePolicy()}
      {renderApprovalQueue()}
      {renderReviewTransaction()}
      {renderReconciliation()}
      {renderMissingReceipts()}
      {renderUploadReceipt()}
      {renderCardRoster()}
      {renderManageEmployeeCard()}
      {renderEditLimit()}
      {renderExpenseDetail()}
      {renderAttentionCenter()}
      {renderViolationDetails()}
      {renderFunding()}
      {renderReports()}
      {renderStatement()}
      {renderSettlement()}
      {renderCardDelivery()}
      {renderBillingSetup()}
      {renderBranding()}
      {renderNotifications()}
      {renderCompanyProfile()}
    </>
  )
}
