import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/customers.module.css'

/* ============================================================================
   Customer & Account Management — modal layer (legacy page 1.14, 23 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows legacy showLoading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     selectBox(el)      → `onboardType` state (customer type picker)
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

const CUSTOMERS = [
  'Peter Ochieng (CUS-20250626-7712)',
  'Grace Wanjiku Ltd (CUS-20250625-6621)',
  'Samuel Kipchoge (CUS-20250624-5530)',
]
const DECISIONS = [
  'Approve — Auto-verified',
  'Approve — Manual override',
  'Request more documents',
  'Reject — Fraud suspected',
  'Reject — Incomplete',
]
const ACCOUNT_TYPES = ['Current Account', 'Savings Account', 'Fixed Deposit', 'Escrow Account']
const CURRENCIES = ['KES — Kenyan Shilling', 'USD — US Dollar', 'EUR — Euro']
const CLOSE_REASONS = ['Customer request', 'Account inactivity', 'Compliance / AML', 'Duplicate account', 'Deceased customer']
const SETTLE_DESTS = ['M-Pesa 0712***890', 'PayMo Wallet', 'External Bank (Equity ****4521)']
const BANKS = ['Equity Bank', 'KCB Bank', 'Co-op Bank', 'Absa Bank']
const TICKET_CATEGORIES = ['KYC / Onboarding', 'Account Management', 'Card / Payments', 'Technical Issue', 'General Enquiry']
const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const REPORT_TYPES = [
  'Customer List (CSV)',
  'KYC Status Summary',
  'Account Activity Report',
  'AML / High-Risk Customers',
  'Support Ticket Analytics',
]
const FORMATS = ['PDF', 'Excel', 'CSV']
const SEGMENTS = ['Retail Customers', 'Corporate', 'High-Net-Worth']
const SOURCES_OF_FUNDS = ['Salary / Employment', 'Business Income', 'Investments', 'Inheritance', 'Other']
const NATIONALITIES = ['Kenyan', 'Ugandan', 'Tanzanian', 'Other']

/* LEGACY BRIDGE: onboardStepper labels */
const ONBOARD_LABELS = ['Type', 'Info', 'Docs', 'Done']
const ONBOARD_TYPES = [
  { icon: 'bi-person', label: 'Retail', color: 'var(--pm-primary-light)' },
  { icon: 'bi-building', label: 'Corporate', color: 'var(--pm-info)' },
  { icon: 'bi-briefcase', label: 'SME', color: 'var(--pm-warning)' },
  { icon: 'bi-heart', label: 'Non-Profit', color: 'var(--pm-accent)' },
]

interface Result {
  msg: string
  ref?: string
}

function Pills({
  prefix,
  tabs,
  tabsState,
  onSwitch,
}: {
  prefix: string
  tabs: { key: string; label: string }[]
  tabsState: Record<string, string>
  onSwitch: (prefix: string, key: string) => void
}) {
  const currentTab = tabsState[prefix] ?? tabs[0].key
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

export default function CustomersModals({ active, onClose, onOpen }: ModalsProps) {
  /* ---------- doAction / nextFlow / busy state ---------- */
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flow, setFlow] = useState(1)
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [onboardType, setOnboardType] = useState('Retail')

  /* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlow(1)
      setBusy(null)
      setTabs({})
      setOnboardType('Retail')
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

  /* ---------- LEGACY BRIDGE: nextFlow('onboard', 4) ---------- */
  const nextFlow = () => {
    if (flow === ONBOARD_LABELS.length - 1) {
      setBusy('onboardCustomerModal')
      busyTimer.current = window.setTimeout(() => {
        setFlow(ONBOARD_LABELS.length)
        setBusy(null)
      }, 1500)
      return
    }
    if (flow >= ONBOARD_LABELS.length) {
      onClose()
      return
    }
    setFlow((f) => f + 1)
  }

  /* ---------- LEGACY BRIDGE: sw(prefix,key,btn) ---------- */
  const sw = (prefix: string, key: string) => setTabs((prev) => ({ ...prev, [prefix]: key }))
  const tabOf = (prefix: string, first: string) => tabs[prefix] ?? first

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
                `PayMo — Customer & Account Management\n${r.msg}${r.ref ? `\nReference: ${r.ref}` : ''}\nGenerated: ${new Date().toLocaleString()}`,
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

  /* ---------- action body wrapper: receipt OR form (legacy doAction body swap) ---------- */
  const actionBody = (id: string, form: ReactNode) => (
    <div style={{ position: 'relative' }}>
      {busy === id && <BusyOverlay />}
      {results[id] ? receipt(id) : form}
    </div>
  )

  const actionFooter = (id: string, label: ReactNode, msg: string, ref?: string, tone: 'btnPmP' | 'btnPmD' | '' = 'btnPmP') =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          Cancel
        </button>
        <button className={`${styles.btnPm} ${tone ? styles[tone] : ''}`} onClick={() => doAction(id, msg, ref)}>
          {label}
        </button>
      </>
    )

  /* ---------- flow stepper (legacy renderStepper) ---------- */
  const stepper = (
    <div className={styles.stepper}>
      {ONBOARD_LABELS.map((l, i) => {
        const n = i + 1
        return (
          <div className={styles.step + ' ' + (n < flow ? styles.stepDone : n === flow ? styles.stepActive : '')} key={l} style={{ display: 'contents' }}>
            <div className={`${styles.step} ${n < flow ? styles.stepDone : ''} ${n === flow ? styles.stepActive : ''}`}>
              <div className={styles.stepN}>{n < flow ? <i className="bi bi-check" /> : n}</div>
              <div className={styles.stepL}>{l}</div>
            </div>
            {i < ONBOARD_LABELS.length - 1 && <div className={styles.stepLine} />}
          </div>
        )
      })}
    </div>
  )

  const kycHealthTiles = [
    { value: '98.4', label: 'COMPLETION %', vColor: 'var(--pm-accent)', bg: 'var(--pm-accent-soft)', big: true },
    { value: '47', label: 'PENDING', vColor: 'var(--pm-info)', bg: 'var(--pm-info-soft)' },
    { value: '24', label: 'REJECTED', vColor: 'var(--pm-warning)', bg: 'var(--pm-warning-soft)' },
    { value: '18', label: 'PEP/SANCTIONS', vColor: 'var(--pm-purple)', bg: 'var(--pm-purple-soft)' },
  ]
  const kycHealthRows: [string, string, string, 'badgeS' | 'badgeW' | 'badgeD'][] = [
    ['Avg KYC processing time', '4.2 hours', '-12%', 'badgeS'],
    ['Auto-approval rate', '78%', '+5%', 'badgeS'],
    ['Document rejection rate', '4.9%', '+1%', 'badgeD'],
    ['PEP screening hits', '18 this month', 'Stable', 'badgeW'],
  ]
  const profileStats: [string, string, boolean?][] = [
    ['Customers Managed', '847'],
    ['Tickets Resolved', '1,284'],
    ['Avg Response', '18 min'],
    ['SLA Compliance', '99.2%', true],
  ]
  const apiKeys = [
    { key: 'prod-8821', sub: 'Created 12 Mar • Last used today', status: 'Active', tone: 'badgeS' as const },
    { key: 'prod-9914', sub: 'Created 02 Feb • Last used 10 Jun', status: 'Revoked', tone: 'badgeD' as const },
  ]
  const attentionRows = [
    { title: 'KYC rejected — 3 cases', sub: 'Missing documents or mismatch', label: 'Review', modal: 'kycReviewModal' },
    { title: 'Account closure pending — 7 customers', sub: 'Balance settlement required', label: 'Process', modal: 'closeAccountModal' },
    { title: 'AML flag — 2 high-risk profiles', sub: 'Manual review required', label: 'Investigate', modal: 'amlReviewModal' },
    { title: '5 support tickets overdue', sub: 'SLA breach risk', label: 'Respond', modal: 'supportTicketsModal' },
    { title: '24 customers with expiring consent', sub: 'External bank links expiring in 7 days', label: 'Renew', modal: 'linkExternalModal' },
  ]
  const tixRows = [
    { t: 'TKT-8821', c: 'Peter Ochieng', s: 'KYC document rejected', p: 'Medium', pTone: 'badgeW' as const, st: 'In Progress', stTone: 'badgeI' as const, a: 'Grace M.' },
    { t: 'TKT-8834', c: 'Grace Wanjiku Ltd', s: 'Account statement not received', p: 'Low', pTone: 'badgeS' as const, st: 'Open', stTone: 'badgeS' as const, a: 'Unassigned' },
    { t: 'TKT-8847', c: 'Samuel Kipchoge', s: 'Card not working', p: 'High', pTone: 'badgeD' as const, st: 'Awaiting Customer', stTone: 'badgeW' as const, a: 'James K.' },
  ]
  const timelineRows = [
    ['26 Jun 09:12', 'Ticket created by system'],
    ['26 Jun 10:05', 'Assigned to Grace Muthoni'],
    ['26 Jun 14:30', 'Message sent to customer requesting new ID'],
    ['27 Jun 11:45', 'Customer uploaded new document'],
  ]
  const commRows: [string, boolean, boolean, boolean, boolean][] = [
    ['Email', true, true, true, true],
    ['SMS', false, true, true, false],
    ['Push', true, true, true, true],
    ['WhatsApp', false, false, true, false],
  ]

  return (
    <>
      {/* ============ M1: Onboard Customer (multi-step flow) ============ */}
      <MBox
        id="onboardCustomerModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-person-plus" style={{ color: 'var(--pm-accent)' }} /> Onboard New Customer
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Cancel
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={nextFlow} disabled={busy === 'onboardCustomerModal'}>
              {flow >= ONBOARD_LABELS.length ? (
                'Done'
              ) : (
                <>
                  Continue <i className="bi bi-arrow-right" />
                </>
              )}
            </button>
          </>
        }
      >
        <div style={{ position: 'relative' }}>
          {busy === 'onboardCustomerModal' && <BusyOverlay />}
          {stepper}
          {/* Step 1: Customer Type — LEGACY BRIDGE: selectBox(el) */}
          {flow === 1 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 1: Customer Type</h6>
              <div className="row g-2">
                {ONBOARD_TYPES.map((t) => (
                  <div className="col-md-3 col-6" key={t.label}>
                    <div
                      className="p-3 border rounded text-center"
                      role="button"
                      tabIndex={0}
                      style={{
                        cursor: 'pointer',
                        borderColor: onboardType === t.label ? 'var(--pm-primary)' : undefined,
                        background: onboardType === t.label ? 'rgba(46,230,160,.06)' : undefined,
                      }}
                      onClick={() => setOnboardType(t.label)}
                      onKeyDown={(e) => e.key === 'Enter' && setOnboardType(t.label)}
                    >
                      <i className={`bi ${t.icon} d-block mb-1`} style={{ fontSize: 22, color: t.color }} />
                      <strong style={{ fontSize: 12 }}>{t.label}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Step 2: Basic Information */}
          {flow === 2 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 2: Basic Information</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.fl}>Full Name / Company</label>
                  <input className={styles.fc} placeholder="Enter name" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>ID / Registration Number</label>
                  <input className={styles.fc} placeholder="National ID / CR12" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Phone</label>
                  <input className={styles.fc} placeholder="+254 7XX XXX XXX" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Email</label>
                  <input className={styles.fc} placeholder="email@example.com" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Date of Birth / Incorporation</label>
                  <input type="date" className={styles.fc} />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Nationality</label>
                  <select className={styles.fc}>
                    {NATIONALITIES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          {/* Step 3: Address & Documents */}
          {flow === 3 && (
            <div>
              <h6 className={styles.fwBold13} style={{ fontSize: 14 }}>Step 3: Address &amp; Documents</h6>
              <div className="row g-3">
                <div className="col-12">
                  <label className={styles.fl}>Physical Address</label>
                  <input className={styles.fc} placeholder="Street, Building, City" />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Upload ID / Passport</label>
                  <input type="file" className={styles.fc} />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Upload Proof of Address</label>
                  <input type="file" className={styles.fc} />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Upload Selfie / Company Stamp</label>
                  <input type="file" className={styles.fc} />
                </div>
                <div className="col-md-6">
                  <label className={styles.fl}>Source of Funds</label>
                  <select className={styles.fc}>
                    {SOURCES_OF_FUNDS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          {/* Step 4: Done receipt */}
          {flow === 4 && (
            <div className={styles.receipt}>
              <div className={styles.ri}>
                <i className="bi bi-check-lg" />
              </div>
              <h5 className={styles.receiptTitle}>Customer Onboarded Successfully</h5>
              <p className={styles.receiptSub}>
                KYC verification initiated. Customer will receive welcome SMS and email with login details.
              </p>
              <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>Customer ID</span>
                  <strong>CUS-20250627-8841</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className={styles.mutedSmall}>KYC Status</span>
                  <span className={`${styles.badge} ${styles.badgeW}`}>Pending Review</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={styles.mutedSmall}>Welcome SMS</span>
                  <strong>Sent</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </MBox>

      {/* ============ M2: KYC Review ============ */}
      <MBox
        id="kycReviewModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shield-check" style={{ color: 'var(--pm-info)' }} /> KYC Document Review
          </>
        }
        footer={actionFooter(
          'kycReviewModal',
          'Approve KYC',
          'KYC approved successfully. Customer notified via SMS and email.',
          'KYC-20250627-9914',
        )}
      >
        {actionBody(
          'kycReviewModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer</label>
              <select className={styles.fc}>
                {CUSTOMERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="row g-3">
              {[
                { label: 'National ID', value: '12345678', btn: 'View Document', icon: 'bi-eye' },
                { label: 'Utility Bill', value: 'Nairobi Water — May 2025', btn: 'View Document', icon: 'bi-eye' },
                { label: 'Selfie', value: 'Face match: 98%', btn: 'View Photo', icon: 'bi-eye' },
              ].map((d) => (
                <div className="col-md-6" key={d.label}>
                  <div className="p-3 border rounded">
                    <div className={styles.mutedSmall}>{d.label}</div>
                    <div className={styles.fwBold13}>{d.value}</div>
                    <div className="mt-2">
                      <button className={`${styles.btnPm} ${styles.btnSm}`}>
                        <i className={`bi ${d.icon}`} /> {d.btn}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-md-6">
                <div className="p-3 border rounded">
                  <div className={styles.mutedSmall}>Risk Score</div>
                  <div className={styles.fwBold13} style={{ color: 'var(--pm-accent)' }}>
                    Low (12/100)
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className={styles.fl}>Decision</label>
              <select className={styles.fc}>
                {DECISIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label className={styles.fl}>Internal Notes</label>
              <textarea className={styles.fc} rows={2} defaultValue="All documents clear. Face match excellent. Address matches ID." />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M3: Open Account ============ */}
      <MBox
        id="openAccountModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bank" style={{ color: 'var(--pm-info)' }} /> Open New Account
          </>
        }
        footer={actionFooter(
          'openAccountModal',
          'Open Account',
          'Account opened successfully. Account number: ACC-20250627-4482',
          'ACC-20250627-4482',
        )}
      >
        {actionBody(
          'openAccountModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer</label>
              <select className={styles.fc}>
                {CUSTOMERS.slice(0, 2).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Account Type</label>
                <select className={styles.fc}>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Currency</label>
                <select className={styles.fc}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Initial Deposit</label>
                <input className={styles.fc} defaultValue="5000" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Interest Rate (if applicable)</label>
                <input className={styles.fc} defaultValue="6.5%" />
              </div>
              <div className="col-12">
                <label className={styles.fl}>Account Purpose</label>
                <input className={styles.fc} placeholder="Salary, Business, Savings, Project..." />
              </div>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M4: Close Account ============ */}
      <MBox
        id="closeAccountModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-x-circle" style={{ color: 'var(--pm-danger)' }} /> Close Account
          </>
        }
        footer={actionFooter(
          'closeAccountModal',
          'Confirm Closure',
          'Account closed successfully. Final balance transferred.',
          'CLS-20250627-9914',
          'btnPmD',
        )}
      >
        {actionBody(
          'closeAccountModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Account</label>
              <select className={styles.fc}>
                <option>ACC-20240115-1122 — Current • KES 124,500</option>
                <option>ACC-20240302-3344 — Savings • KES 87,200</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Closure Reason</label>
              <select className={styles.fc}>
                {CLOSE_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Settlement Destination</label>
              <select className={styles.fc}>
                {SETTLE_DESTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}>
              <i className="bi bi-exclamation-triangle me-1" /> Closing this account will cancel all standing orders
              and linked cards. This action cannot be undone.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M5: Permission / Role ============ */}
      <MBox
        id="permissionModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-key" style={{ color: 'var(--pm-warning)' }} /> Manage Permissions &amp; Roles
          </>
        }
        footer={actionFooter('permissionModal', 'Save Changes', 'Role and permissions saved successfully.')}
      >
        {actionBody(
          'permissionModal',
          <>
            <Pills
              prefix="perm"
              tabs={[
                { key: 'roles', label: 'Roles' },
                { key: 'users', label: 'Users' },
                { key: 'api', label: 'API Keys' },
              ]}
              tabsState={tabs}
              onSwitch={sw}
            />
            {tabOf('perm', 'roles') === 'roles' && (
              <div>
                <div className="mb-3">
                  <label className={styles.fl}>Role Name</label>
                  <input className={styles.fc} defaultValue="Joint Signatory" />
                </div>
                <div className="mb-3">
                  <label className={styles.fl}>Permissions</label>
                  {[
                    { label: 'View account balance & transactions', on: true },
                    { label: 'Initiate transfers (with approval)', on: true },
                    { label: 'Approve transfers', on: false },
                    { label: 'Manage beneficiaries', on: false },
                  ].map((p, i) => (
                    <div className={`form-check ${i < 3 ? 'mb-1' : ''}`} key={p.label}>
                      <input className="form-check-input" type="checkbox" defaultChecked={p.on} id={`perm-${i}`} />
                      <label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`perm-${i}`}>
                        {p.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tabOf('perm', 'roles') === 'users' && (
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Last Login</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Grace Kamau', 'Joint Signatory', '26 Jun 2025'],
                      ['Brian Ochieng', 'Viewer Only', '20 Jun 2025'],
                    ].map(([u, r, l]) => (
                      <tr key={u}>
                        <td>{u}</td>
                        <td>{r}</td>
                        <td>{l}</td>
                        <td>
                          <button
                            className={`${styles.btnPm} ${styles.btnSm}`}
                            onClick={() => doAction('permissionModal', `Permissions updated for ${u}`, '')}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tabOf('perm', 'roles') === 'api' && (
              <div>
                {apiKeys.map((k) => (
                  <div className={styles.sr} key={k.key}>
                    <div>
                      <strong>API Key • {k.key}</strong>
                      <div className={styles.mutedSmall}>{k.sub}</div>
                    </div>
                    <span className={`${styles.badge} ${styles[k.tone]}`}>{k.status}</span>
                  </div>
                ))}
                <button
                  className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}
                  onClick={() => doAction('permissionModal', 'New API key generated and copied to clipboard.', '')}
                >
                  Generate New Key
                </button>
              </div>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M6: Statement ============ */}
      <MBox
        id="statementModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-text" style={{ color: 'var(--pm-accent)' }} /> Generate Statements
          </>
        }
        footer={actionFooter('statementModal', 'Generate', 'Statement generated successfully. Download started.')}
      >
        {actionBody(
          'statementModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer / Account</label>
              <select className={styles.fc}>
                <option>Peter Ochieng — All Accounts</option>
                <option>ACC-20240115-1122 — Current</option>
                <option>ACC-20240302-3344 — Savings</option>
              </select>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className={styles.fl}>From</label>
                <input type="date" className={styles.fc} defaultValue="2025-05-01" />
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
            <div className="mb-3">
              <label className={styles.fl}>Delivery</label>
              <select className={styles.fc}>
                <option>Download now</option>
                <option>Email to customer</option>
                <option>WhatsApp link</option>
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M7: Support Tickets ============ */}
      <MBox
        id="supportTicketsModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-headset" /> Support Ticket Center
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('createTicketModal')}>
              Create New Ticket
            </button>
          </>
        }
      >
        <Pills
          prefix="tix"
          tabs={[
            { key: 'open', label: 'Open (14)' },
            { key: 'closed', label: 'Closed' },
            { key: 'sla', label: 'SLA Breach' },
          ]}
          tabsState={tabs}
          onSwitch={sw}
        />
        {tabOf('tix', 'open') === 'open' && (
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tixRows.map((r) => (
                  <tr key={r.t}>
                    <td>{r.t}</td>
                    <td>{r.c}</td>
                    <td>{r.s}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[r.pTone]}`}>{r.p}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[r.stTone]}`}>{r.st}</span>
                    </td>
                    <td>{r.a}</td>
                    <td>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('ticketDetailModal')}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tabOf('tix', 'open') === 'closed' && (
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
            Last 7 days: 47 tickets resolved. Average resolution time: 4.2 hours.
          </p>
        )}
        {tabOf('tix', 'open') === 'sla' && (
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
            5 tickets currently at risk of SLA breach. Immediate attention required.
          </p>
        )}
      </MBox>

      {/* ============ M8: Ticket Detail ============ */}
      <MBox
        id="ticketDetailModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-ticket-perforated" /> Ticket TKT-8821
          </>
        }
        footer={actionFooter('ticketDetailModal', 'Resolve Ticket', 'Ticket status updated to Resolved.')}
      >
        {actionBody(
          'ticketDetailModal',
          <>
            <Pills
              prefix="td"
              tabs={[
                { key: 'details', label: 'Details' },
                { key: 'timeline', label: 'Timeline' },
                { key: 'notes', label: 'Notes' },
              ]}
              tabsState={tabs}
              onSwitch={sw}
            />
            {tabOf('td', 'details') === 'details' && (
              <div className="row g-3">
                <div className="col-md-6">
                  <strong>Customer:</strong> Peter Ochieng
                  <br />
                  <strong>Subject:</strong> KYC document rejected
                  <br />
                  <strong>Priority:</strong> Medium
                  <br />
                  <strong>Status:</strong> In Progress
                  <br />
                  <strong>Assigned:</strong> Grace Muthoni
                </div>
                <div className="col-md-6">
                  <strong>Opened:</strong> 26 Jun 2025, 09:12
                  <br />
                  <strong>Last Update:</strong> 27 Jun 2025, 11:45
                  <br />
                  <strong>SLA:</strong> 48 hours (12h remaining)
                </div>
              </div>
            )}
            {tabOf('td', 'details') === 'timeline' && (
              <div>
                {timelineRows.map(([t, e]) => (
                  <div className={styles.sr} key={t}>
                    <div>
                      <strong>{t}</strong> — {e}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tabOf('td', 'details') === 'notes' && (
              <div>
                <textarea className={styles.fc} rows={4} placeholder="Add internal note..." />
                <button
                  className={`${styles.btnPm} ${styles.btnSm} mt-2`}
                  onClick={() => doAction('ticketDetailModal', 'Note added to ticket TKT-8821', '')}
                >
                  Add Note
                </button>
              </div>
            )}
          </>,
        )}
      </MBox>

      {/* ============ M9: Bulk Upload ============ */}
      <MBox
        id="bulkUploadModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-upload" style={{ color: 'var(--pm-info)' }} /> Bulk Customer Import
          </>
        }
        footer={actionFooter(
          'bulkUploadModal',
          'Start Import',
          'Bulk import started. 124 customers queued for processing.',
          'BULK-20250627-1122',
        )}
      >
        {actionBody(
          'bulkUploadModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Upload CSV / Excel</label>
              <input type="file" className={styles.fc} />
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Download{' '}
              {/* LEGACY BRIDGE: dead template link → real CSV download */}
              <button
                className="btn btn-link btn-sm p-0 align-baseline"
                style={{ fontSize: 12 }}
                onClick={() =>
                  downloadFile(
                    'paymo-customer-import-template.csv',
                    'Name,ID,Phone,Email,Type,Address\nJane Doe,12345678,+254712345678,jane@example.com,Retail,"Nairobi, Kenya"',
                    'text/csv',
                  )
                }
              >
                template
              </button>
              . Required columns: Name, ID, Phone, Email, Type, Address.
            </div>
            <div className="mt-3">
              <label className={styles.fl}>Import Options</label>
              {['Send welcome SMS & email', 'Trigger eKYC for supported IDs'].map((o, i) => (
                <div className={`form-check ${i === 0 ? 'mb-1' : ''}`} key={o}>
                  <input className="form-check-input" type="checkbox" defaultChecked id={`imp-${i}`} />
                  <label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`imp-${i}`}>
                    {o}
                  </label>
                </div>
              ))}
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M10: AML Review ============ */}
      <MBox
        id="amlReviewModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-triangle" style={{ color: 'var(--pm-danger)' }} /> AML / Sanctions Review
          </>
        }
        footer={actionFooter(
          'amlReviewModal',
          'Escalate',
          'Case escalated to Compliance Officer. Ticket AML-20250627-0003 created.',
          'AML-20250627-0003',
          'btnPmD',
        )}
      >
        {actionBody(
          'amlReviewModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer</label>
              <select className={styles.fc}>
                <option>Samuel Kipchoge (High Risk — PEP)</option>
                <option>John Kamau (High Risk — Sanctions Match)</option>
              </select>
            </div>
            <div className={`${styles.summaryBoxDanger} mb-3`}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pm-danger)' }}>SANCTIONS MATCH DETECTED</div>
              <div style={{ fontSize: 13 }}>
                Name matches OFAC / UN sanctions list. Manual review required before onboarding.
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Decision</label>
              <select className={styles.fc}>
                <option>Escalate to Compliance Officer</option>
                <option>Reject — Sanctions match</option>
                <option>Proceed with enhanced due diligence</option>
                <option>False positive — Approve</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Notes</label>
              <textarea
                className={styles.fc}
                rows={3}
                defaultValue="Name similarity 92%. Date of birth does not match sanctions record. Recommend EDD."
              />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M11: Link External Account ============ */}
      <MBox
        id="linkExternalModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-link-45deg" style={{ color: 'var(--pm-info)' }} /> Link External Bank Account
          </>
        }
        footer={actionFooter(
          'linkExternalModal',
          'Send Consent Request',
          'Consent request sent to customer. Account will be linked upon approval.',
          'LNK-20250627-4482',
        )}
      >
        {actionBody(
          'linkExternalModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer</label>
              <select className={styles.fc}>
                <option>Peter Ochieng</option>
                <option>Grace Wanjiku Ltd</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Bank</label>
              <select className={styles.fc}>
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Account Number</label>
              <input className={styles.fc} placeholder="Enter account number" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Consent Expiry</label>
              <input type="date" className={styles.fc} defaultValue="2025-12-31" />
            </div>
            <div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Customer will receive consent request via their bank app or
              USSD.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M12: API Key ============ */}
      <MBox
        id="apiKeyModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-key" style={{ color: 'var(--pm-muted)' }} /> Manage API Keys
          </>
        }
        footer={
          results.apiKeyModal ? (
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
                onClick={() => doAction('apiKeyModal', 'New API key generated: prod-20250627-1122 (copied to clipboard)', '')}
              >
                Generate Key
              </button>
            </>
          )
        }
      >
        {actionBody(
          'apiKeyModal',
          <>
            {apiKeys.map((k) => (
              <div className={styles.sr} key={k.key}>
                <div>
                  <strong>{k.key}</strong>
                  <div className={styles.mutedSmall}>{k.sub}</div>
                </div>
                <span className={`${styles.badge} ${styles[k.tone]}`}>{k.status}</span>
              </div>
            ))}
            <div className="mt-3">
              <label className={styles.fl}>New Key Label</label>
              <input className={styles.fc} placeholder="e.g. Mobile App v2" />
            </div>
            <div className="mt-3">
              <label className={styles.fl}>Permissions</label>
              {[
                { label: 'Read accounts & transactions', on: true },
                { label: 'Initiate transfers', on: false },
                { label: 'Manage beneficiaries', on: false },
              ].map((p, i) => (
                <div className={`form-check ${i < 2 ? 'mb-1' : ''}`} key={p.label}>
                  <input className="form-check-input" type="checkbox" defaultChecked={p.on} id={`ak-${i}`} />
                  <label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`ak-${i}`}>
                    {p.label}
                  </label>
                </div>
              ))}
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M13: Create Ticket ============ */}
      <MBox
        id="createTicketModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-plus-circle" /> Create Support Ticket
          </>
        }
        footer={actionFooter(
          'createTicketModal',
          'Create Ticket',
          'Ticket TKT-8859 created and assigned to support team.',
          'TKT-8859',
        )}
      >
        {actionBody(
          'createTicketModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Customer</label>
              <select className={styles.fc}>
                <option>Peter Ochieng</option>
                <option>Grace Wanjiku Ltd</option>
                <option>Samuel Kipchoge</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Subject</label>
              <input className={styles.fc} placeholder="Brief description of issue" />
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Category</label>
              <select className={styles.fc}>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Priority</label>
              <select className={styles.fc}>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Description</label>
              <textarea className={styles.fc} rows={3} />
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M14: Report ============ */}
      <MBox
        id="reportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-graph-up" style={{ color: 'var(--pm-info)' }} /> Generate Report
          </>
        }
        footer={actionFooter('reportModal', 'Generate Report', 'Report generated and downloading...')}
      >
        {actionBody(
          'reportModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Report Type</label>
              <select className={styles.fc}>
                {REPORT_TYPES.map((r) => (
                  <option key={r}>{r}</option>
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
            <div className="mb-3">
              <label className={styles.fl}>Delivery</label>
              <select className={styles.fc}>
                <option>Download now</option>
                <option>Email to me</option>
                <option>Schedule recurring</option>
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M15: Communication Preferences ============ */}
      <MBox
        id="commModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-envelope" /> Communication Preferences
          </>
        }
        footer={actionFooter('commModal', 'Save Preferences', 'Communication preferences updated for segment.')}
      >
        {actionBody(
          'commModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Segment</label>
              <select className={styles.fc}>
                {SEGMENTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Marketing</th>
                    <th>Transactional</th>
                    <th>Security</th>
                    <th>Statements</th>
                  </tr>
                </thead>
                <tbody>
                  {commRows.map(([ch, m, t, sec, st]) => (
                    <tr key={ch}>
                      <td>{ch}</td>
                      {[m, t, sec, st].map((v, i) => (
                        <td key={i}>
                          <input type="checkbox" defaultChecked={v} aria-label={`${ch} col ${i + 1}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M16: Attention ============ */}
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
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen(r.modal)}>
              {r.label}
            </button>
          </div>
        ))}
      </MBox>

      {/* ============ M17: KYC Health ============ */}
      <MBox
        id="kycHealthModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shield-check" style={{ color: 'var(--pm-accent)' }} /> KYC Health Dashboard
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('kycReviewModal')}>
              Review Pending Queue
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          {kycHealthTiles.map((t) => (
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
                <th>Value</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {kycHealthRows.map(([m, v, tr, tone]) => (
                <tr key={m}>
                  <td>{m}</td>
                  <td>{v}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[tone]}`}>{tr}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M18: Profile ============ */}
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
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@paymo.co.ke · Relationship Manager</p>
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

      {/* ============ M19: Bulk KYC Approve ============ */}
      <MBox
        id="bulkKycApproveModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-check2-all" /> Bulk KYC Approval
          </>
        }
        footer={actionFooter(
          'bulkKycApproveModal',
          'Approve All',
          '18 customers approved automatically.',
          'BULK-KYC-20250627',
        )}
      >
        {actionBody(
          'bulkKycApproveModal',
          <>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
              18 low-risk customers (confidence &gt; 95%) are eligible for automatic approval.
            </p>
            <div className={styles.summaryBoxAccent} style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> This action will approve all 18 customers and send welcome
              notifications.
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M20: API Key Management (legacy placeholder duplicate) ============ */}
      <MBox
        id="apiKeyModal2"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-key" /> API Key Management
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
            <strong>prod-8821</strong>
            <div className={styles.mutedSmall}>Active • Last used today</div>
          </div>
          <span className={`${styles.badge} ${styles.badgeS}`}>Active</span>
        </div>
      </MBox>

      {/* ============ M21: Ticket Details (legacy placeholder duplicate) ============ */}
      <MBox
        id="ticketDetailModal2"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-ticket-perforated" /> Ticket Details
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          Full ticket conversation and resolution notes would appear here.
        </p>
      </MBox>

      {/* ============ M22: Case Export ============ */}
      <MBox
        id="caseExportModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-download" /> Export Cases
          </>
        }
        footer={actionFooter('caseExportModal', 'Export', 'Export generated.')}
      >
        {actionBody(
          'caseExportModal',
          <div className="mb-3">
            <label className={styles.fl}>Format</label>
            <select className={styles.fc}>
              <option>PDF</option>
              <option>Excel</option>
            </select>
          </div>,
        )}
      </MBox>

      {/* ============ M23: Fee Calculator ============ */}
      <MBox
        id="feeCalcModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calculator" /> Fee Calculator
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
            <option>Account opening fee</option>
            <option>Statement request</option>
            <option>Card replacement</option>
          </select>
        </div>
        <div className={styles.summaryBox}>
          <div className="d-flex justify-content-between">
            <span>Fee</span>
            <strong>KES 500</strong>
          </div>
        </div>
      </MBox>
    </>
  )
}
