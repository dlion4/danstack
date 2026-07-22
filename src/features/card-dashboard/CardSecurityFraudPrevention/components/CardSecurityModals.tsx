import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/card-security-fraud-prevention.module.css'

/* ============================================================================
 * Card Security & Fraud Prevention — modal layer (legacy page 5.7, 22 modals)
 * LEGACY BRIDGE:
 *   openM(id)          → parent lifts `active` state into this component
 *   doAction(id,msg)   → `results` state; shows loading spinner,
 *                          then swaps body to a receipt (exact legacy behavior)
 *   nextFlow(key,total)→ `flows` state with stepper + receipt last step
 *   sw(prefix,key)     → `tabs` state (pill switcher)
 *   cacheAndReset()    → useEffect on close resets flows + results + tabs
 * ========================================================================== */

interface ModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
  config: any
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

/* LEGACY BRIDGE: flow definitions */
const FLOW_DEFS: Record<string, { labels: string[] }> = {
  rs: { labels: ['Review', 'Action', 'Done'] },
  fr: { labels: ['Name', 'Criteria', 'Action', 'Done'] },
  rc: { labels: ['Identify', 'Review', 'Confirm', 'Done'] },
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
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 70 }}>
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

export default function CardSecurityModals({ active, onClose, onOpen, config }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ rs: 1, fr: 1, rc: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [rsDecision, setRsDecision] = useState<'yes' | 'no' | null>(null)

  /* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ rs: 1, fr: 1, rc: 1 })
      setBusy(null)
      setTabs({})
      setRsDecision(null)
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
   * M1: Health Check
   * ======================================================================== */
  const renderHealthCheck = () => (
    <MBox id="healthCheckModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-heart-pulse text-danger me-2" />Security Health Check</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center mb-4">
        <div className={styles.sv} style={{ color: 'var(--pm-accent)' }}>92/100</div>
        <div style={{ fontSize: 12, color: 'var(--pm-muted)', fontWeight: 600 }}>OVERALL POSTURE</div>
      </div>
      <div className={styles.sr}><div><strong>PIN Strength</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Changed &lt; 90 days ago</div></div><span className={`${styles.badge} ${styles.badgeS}`}>+20</span></div>
      <div className={styles.sr}><div><strong>3DS Enrollment</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Biometric push enabled</div></div><span className={`${styles.badge} ${styles.badgeS}`}>+30</span></div>
      <div className={styles.sr}><div><strong>Device Binding</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>1 active trusted device</div></div><span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-check" /></span></div>
      <div className={styles.sr}><div><strong>Geo-Fencing</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Active</div></div><span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-check" /></span></div>
      <div className={styles.sr}><div><strong>VPN Protection</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Disabled</div></div><span className={`${styles.badge} ${styles.badgeW}`}>0</span></div>
      <div className="mt-3"><button className={`${styles.btnPm} ${styles.btnPmP} w-100`} onClick={() => onOpen('vpnProxyBlockerModal')}>Improve Score</button></div>
    </MBox>
  )

  /* ==========================================================================
   * M2: Security Alerts
   * ======================================================================== */
  const renderSecurityAlerts = () => (
    <MBox id="securityAlertsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-exclamation text-warning me-2" />Security Alerts</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)' }}>
        <div className="d-flex justify-content-between">
          <strong style={{ color: 'var(--pm-danger)', fontSize: 13 }}>Blocked Transaction</strong>
          <span style={{ fontSize: 10, color: 'var(--pm-muted)' }}>04:12 AM</span>
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>KES 12,500 at AliExpress (CN). Reason: Geo-mismatch.</div>
        <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD} mt-2`} onClick={() => onOpen('reviewSuspiciousTxModal')}>Review</button>
      </div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)' }}>
        <div className="d-flex justify-content-between">
          <strong style={{ color: 'var(--pm-warning)', fontSize: 13 }}>Velocity Warning</strong>
          <span style={{ fontSize: 10, color: 'var(--pm-muted)' }}>Yesterday</span>
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Virtual Card 1011 had 4 transactions in 10 minutes.</div>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M3: Profile
   * ======================================================================== */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose}
      title={<><i className="bi bi-person-circle me-2" />Security Profile</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center">
        <div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
        <h5 style={{ fontWeight: 700 }}>James Kamau</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.k@email.com<br />Device: iPhone 14 Pro (Verified)</p>
      </div>
      <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
        <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Cards</span><br /><strong>12 active</strong></div></div>
        <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Security</span><br /><strong style={{ color: 'var(--pm-accent)' }}>92/100</strong></div></div>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M4: Review Suspicious Transaction (Multi-step, 3 steps)
   * ======================================================================== */
  const renderReviewSuspiciousTx = () => {
    const step = flows.rs
    return (
      <MBox id="reviewSuspiciousTxModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-shield-x text-danger me-2" />Review Suspicious Activity</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            {step === 3 && (
              <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onClose()}>Done</button>
            )}
          </>
        }
      >
        <Stepper flowKey="rs" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Merchant</span><strong>AliExpress (CN)</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong style={{ color: 'var(--pm-danger)' }}>KES 12,500</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Time</span><strong>Today, 04:12 AM</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Risk Flag</span><strong>Device in KE, Tx in CN</strong></div>
            </div>
            <h6 style={{ fontWeight: 700 }}>Did you authorize this transaction?</h6>
            <div className="d-flex gap-2 mt-3">
              <button className={`${styles.btnPm} ${styles.btnSm} w-100`} style={{ background: 'var(--pm-danger)', borderColor: 'var(--pm-danger)', color: '#fff' }} onClick={() => { setRsDecision('no'); nextFlow('rs', 3); }}>
                No, it wasn't me
              </button>
              <button className={`${styles.btnPm} ${styles.btnSm} w-100`} style={{ background: 'var(--pm-accent)', borderColor: 'var(--pm-accent)', color: '#fff' }} onClick={() => { setRsDecision('yes'); nextFlow('rs', 3); }}>
                Yes, I authorized it
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            {rsDecision === 'no' && (
              <>
                <h6 style={{ fontWeight: 700 }}>Fraud Confirmed</h6>
                <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>We will immediately freeze Virtual Card 4412 and block this merchant.</p>
              </>
            )}
            {rsDecision === 'yes' && (
              <>
                <h6 style={{ fontWeight: 700 }}>False Alarm</h6>
                <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>We will clear the block. The transaction can be retried.</p>
              </>
            )}
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>
                {rsDecision === 'no' ? 'Fraud Reported' : 'Transaction Cleared'}
              </h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
                {rsDecision === 'no' ? 'Card has been frozen. A replacement is being issued.' : 'The transaction has been cleared with no action needed.'}
              </p>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
   * M5: Fraud Rule Builder (Multi-step, 4 steps)
   * ======================================================================== */
  const renderFraudRuleBuilder = () => {
    const step = flows.fr
    return (
      <MBox id="fraudRuleBuilderModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-magic text-primary me-2" />Custom Fraud Rule Builder</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            {step === 4 && <button className={styles.btnPm} onClick={onClose}>Close</button>}
            {step < 4 && <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('fr', 4)}>{step >= 3 ? 'Activate Rule <i className="bi bi-check" />' : 'Continue <i className="bi bi-arrow-right" />'}</button>}
          </>
        }
      >
        <Stepper flowKey="fr" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Rule Name</h6>
            <div className="mb-3">
              <label className={styles.formLabel}>Rule Name</label>
              <input className={styles.formControl} defaultValue="Block Late Night International" />
            </div>
            <div className="mb-3">
              <label className={styles.formLabel}>Apply to Cards</label>
              <select className={styles.formControl}>
                <option>All Cards</option>
                <option>Virtual Cards Only</option>
                <option>Physical Debit 9921</option>
              </select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: If transaction matches:</h6>
            <div className="row g-2 mb-3">
              <div className="col-4">
                <select className={styles.formControl}>
                  <option>Time of Day</option>
                  <option>Amount</option>
                  <option>Country</option>
                </select>
              </div>
              <div className="col-4">
                <select className={styles.formControl}><option>Is Between</option></select>
              </div>
              <div className="col-4">
                <input className={styles.formControl} value="00:00 - 05:00" />
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-4">
                <select className={styles.formControl}><option>Country</option></select>
              </div>
              <div className="col-4">
                <select className={styles.formControl}><option>Is Not</option></select>
              </div>
              <div className="col-4">
                <input className={styles.formControl} value="Kenya" />
              </div>
            </div>
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-plus" /> Add Condition</button>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Then Action:</h6>
            <div className="mb-3">
              <select className={styles.formControl}>
                <option>Block Transaction & Notify</option>
                <option>Require Biometric Approval</option>
                <option>Flag for Review</option>
              </select>
            </div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" /> Rules can be overridden by trusted merchants or device binding settings.
            </div>
          </div>
        )}
        {step === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Rule Activated</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Block Late Night International is now active.</p>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
   * M6: MCC Blocker
   * ======================================================================== */
  const renderMCCBlocker = () => (
    <MBox id="mccBlockerModal" active={active} onClose={onClose}
      title={<><i className="bi bi-tags text-primary me-2" />Merchant Category Controls</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('mccBlockerModal', 'MCC rules updated successfully')}>Save</button>
        </>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Block spending at specific types of merchants globally.</p>
      <div className={styles.sr}><div><strong>Gambling & Betting</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
      <div className={styles.sr}><div><strong>Cryptocurrency Exchanges</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
      <div className={styles.sr}><div><strong>Adult Content</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
      <div className={styles.sr}><div><strong>Bars & Liquor Stores</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" /></div></div>
    </MBox>
  )

  /* ==========================================================================
   * M7: Velocity Limits
   * ======================================================================== */
  const renderVelocityLimits = () => (
    <MBox id="velocityLimitsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-speedometer2 text-info me-2" />Velocity Limits</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('velocityLimitsModal', 'Velocity limits saved')}>Save</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Max Transactions per Hour</label>
        <input type="number" className={styles.formControl} defaultValue="5" />
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Max Transactions per Day</label>
        <input type="number" className={styles.formControl} defaultValue="20" />
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Max Spend per Day (KES)</label>
        <input type="number" className={styles.formControl} defaultValue="100000" />
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label" style={{ fontSize: 13 }}>Block transactions exceeding limits (otherwise just flag)</label>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M8: VPN / Proxy Blocker
   * ======================================================================== */
  const renderVPNProxyBlocker = () => (
    <MBox id="vpnProxyBlockerModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-shaded text-danger me-2" />VPN & Proxy Blocker</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('vpnProxyBlockerModal', 'VPN rules updated')}>Save</button>
        </>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Automatically reject online transactions if the buyer's IP address belongs to a known VPN, Tor node, or anonymous proxy.</p>
      <div className={styles.sr}><div><strong>Block Anonymous IPs</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
      <div className={styles.sr}><div><strong>Block Cloud Provider IPs</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>AWS, DigitalOcean, etc.</span></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" /></div></div>
    </MBox>
  )

  /* ==========================================================================
   * M9: Device Binding
   * ======================================================================== */
  const renderDeviceBinding = () => (
    <MBox id="deviceBindingModal" active={active} onClose={onClose}
      title={<><i className="bi bi-phone text-primary me-2" />Device Binding</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={styles.sr}><div><strong>iPhone 14 Pro</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Biometric 3DS Push Enabled</div></div><span className={`${styles.badge} ${styles.badgeS}`}>Verified</span></div>
      <div className={styles.sr}><div><strong>MacBook Air M2</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Web access · Last used yesterday</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}>Unbind</button></div>
      <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}><i className="bi bi-plus" /> Add New Trusted Device</button>
    </MBox>
  )

  /* ==========================================================================
   * M10: Manage 3DS
   * ======================================================================== */
  const renderManage3DS = () => (
    <MBox id="manage3DSModal" active={active} onClose={onClose}
      title={<><i className="bi bi-shield-lock text-accent me-2" style={{ color: 'var(--pm-accent)' }} />3D Secure Preferences</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('manage3DSModal', '3DS Preferences Saved')}>Save</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Primary Challenge Method</label>
        <select className={styles.formControl}>
          <option>Biometric App Push (Recommended)</option>
          <option>SMS OTP</option>
          <option>Email OTP</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Challenge Threshold</label>
        <select className={styles.formControl}>
          <option>Challenge all online txns</option>
          <option selected>Challenge over KES 5,000</option>
          <option>Only high-risk merchants</option>
        </select>
      </div>
      <div className="form-check">
        <input type="checkbox" className="form-check-input" defaultChecked />
        <label className="form-check-label" style={{ fontSize: 13 }}>Skip 3DS for saved subscriptions (Netflix, Spotify)</label>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M11: Geo-Fencing
   * ======================================================================== */
  const renderGeoFencing = () => (
    <MBox id="geoFencingModal" active={active} onClose={onClose}
      title={<><i className="bi bi-geo-alt text-info me-2" />Geo-Fencing</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('geoFencingModal', 'Geo-Fencing Updated')}>Save</button>
        </>
      }
    >
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label fw-bold">Enable Phone Location Enforcement</label>
      </div>
      <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Blocks physical POS/ATM transactions if your physical card is used more than X kilometers away from your phone's GPS location.</p>
      <div className="mb-3">
        <label className={styles.formLabel}>Maximum Radius</label>
        <select className={styles.formControl}>
          <option>10 km</option>
          <option>50 km</option>
          <option selected>100 km</option>
          <option>250 km</option>
        </select>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M12: Travel Mode
   * ======================================================================== */
  const renderTravelMode = () => (
    <MBox id="travelModeModal" active={active} onClose={onClose}
      title={<><i className="bi bi-airplane text-purple me-2" style={{ color: 'var(--pm-purple)' }} />Travel Mode</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('travelModeModal', 'Travel itinerary logged. Cards will work smoothly abroad.')}>Set Travel Mode</button>
        </>
      }
    >
      <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Pre-declare travel destinations to ensure your card is not blocked for suspicious foreign activity.</p>
      <div className="mb-3">
        <label className={styles.formLabel}>Destination Country(ies)</label>
        <input type="text" className={styles.formControl} placeholder="e.g. UAE, South Africa" />
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <label className={styles.formLabel}>Start Date</label>
          <input type="date" className={styles.formControl} />
        </div>
        <div className="col-6">
          <label className={styles.formLabel}>End Date</label>
          <input type="date" className={styles.formControl} />
        </div>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Apply to Cards</label>
        <select className={styles.formControl}>
          <option>All Cards</option>
          <option>Physical Debit 9921</option>
        </select>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M13: Contactless Limit
   * ======================================================================== */
  const renderContactlessLimit = () => (
    <MBox id="contactlessLimitModal" active={active} onClose={onClose}
      title={<><i className="bi bi-wifi text-accent me-2" style={{ color: 'var(--pm-accent)' }} />Contactless Limits</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('contactlessLimitModal', 'Contactless settings saved')}>Save</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Max amount per tap without PIN (KES)</label>
        <input type="number" className={styles.formControl} defaultValue="2500" />
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label fw-bold">Enable Tap-to-Pay</label>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M14: Freeze Card
   * ======================================================================== */
  const renderFreezeCard = () => (
    <MBox id="freezeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-snow text-info me-2" />Freeze Card</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('freezeCardModal', 'Card frozen successfully')}>Freeze</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Physical Debit · 9921</option>
          <option>Virtual Debit · 4412</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Reason</label>
        <select className={styles.formControl}>
          <option>Misplaced temporarily</option>
          <option>Not using it right now</option>
          <option>Suspect unauthorized use</option>
        </select>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
        Freezing is reversible. You can unfreeze it instantly from the app later. Subscriptions may fail while frozen.
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M15: Report Compromise (Multi-step, 4 steps)
   * ======================================================================== */
  const renderReportCompromise = () => {
    const step = flows.rc
    return (
      <MBox id="reportCompromiseModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Report Compromised Card</>}
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>Cancel</button>
            {step === 4 && <button className={styles.btnPm} onClick={onClose}>Done</button>}
            {step < 4 && <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('rc', 4)}>{step === 3 ? 'Freeze & Issue New <i className="bi bi-shield-lock" />' : 'Continue <i className="bi bi-arrow-right" />'}</button>}
          </>
        }
      >
        <Stepper flowKey="rc" current={step} />
        {step === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Which card is compromised?</h6>
            <div className="mb-3">
              <label className={styles.formLabel}>Select Card</label>
              <select className={styles.formControl}>
                <option>Physical Debit · 9921</option>
                <option>Virtual Debit · 4412</option>
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.formLabel}>What happened?</label>
              <select className={styles.formControl}>
                <option>I see unauthorized transactions</option>
                <option>Card was stolen</option>
                <option>Card was lost</option>
                <option>Phishing/Scam suspected</option>
              </select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Flag Unauthorized Transactions</h6>
            <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Select any transactions you did not make. They will be pushed to disputes.</p>
            <div className="form-check p-2 border rounded mb-2">
              <input className="form-check-input" type="checkbox" />
              <label className="form-check-label ms-2 d-flex justify-content-between w-100">
                <span>AliExpress (CN)</span>
                <span>KES 12,500</span>
              </label>
            </div>
            <div className="form-check p-2 border rounded mb-2">
              <input className="form-check-input" type="checkbox" />
              <label className="form-check-label ms-2 d-flex justify-content-between w-100">
                <span>Jumia (KE)</span>
                <span>KES 8,200</span>
              </label>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Action Summary</h6>
            <div className={styles.sr}><div><strong>Permanent Card Block</strong></div><span className={`${styles.badge} ${styles.badgeD}`}>Will apply</span></div>
            <div className={styles.sr}><div><strong>Disputes Created</strong></div><span className={`${styles.badge} ${styles.badgeW}`}>0 items</span></div>
            <div className={styles.sr}><div><strong>Replacement Card</strong></div><span className={`${styles.badge} ${styles.badgeS}`}>Will dispatch</span></div>
          </div>
        )}
        {step === 4 && (
          <div className={styles.fstepActive}>
            <div className={styles.receipt}>
              <div className={styles.receiptIcon}><i className="bi bi-shield-lock" /></div>
              <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Compromise Report Filed</h5>
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Card has been frozen. Replacement will arrive in 3-5 business days.</p>
            </div>
          </div>
        )}
      </MBox>
    )
  }

  /* ==========================================================================
   * M16: Dispute Center
   * ======================================================================== */
  const renderDisputeCenter = () => (
    <MBox id="disputeCenterModal" active={active} onClose={onClose}
      title={<><i className="bi bi-life-preserver text-warning me-2" />Dispute Transaction (Chargeback)</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('disputeCenterModal', 'Dispute logged. CB-11921 created.', 'CB-11921')}>Submit Dispute</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Transaction to Dispute</label>
        <select className={styles.formControl}>
          <option>KES 12,400 - Merchant XYZ</option>
          <option>KES 3,200 - Jumia KE</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Reason</label>
        <select className={styles.formControl}>
          <option>Fraudulent / Did not authorize</option>
          <option>Goods not received</option>
          <option>Duplicate charge</option>
          <option>Amount is incorrect</option>
          <option>Subscription cancelled previously</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Explanation</label>
        <textarea className={styles.formControl} rows={3} defaultValue="The transfer was sent to the wrong number." />
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
        Chargebacks may take 7-45 days to resolve via the Visa/Mastercard network. Please upload any evidence in the vault next.
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M17: Evidence Vault
   * ======================================================================== */
  const renderEvidenceVault = () => (
    <MBox id="evidenceVaultModal" active={active} onClose={onClose}
      title={<><i className="bi bi-cloud-arrow-up text-primary me-2" />Upload Evidence</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('evidenceVaultModal', 'Evidence securely uploaded and attached to case.')}>Upload</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Link to Case</label>
        <select className={styles.formControl}>
          <option>CB-11920 (Chargeback - KES 12,400)</option>
          <option>DP-44912 (Duplicate - KES 3,200)</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Document Type</label>
        <select className={styles.formControl}>
          <option>Receipt / Invoice</option>
          <option>Email correspondence with merchant</option>
          <option>Police abstract</option>
          <option>Other</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select File</label>
        <input type="file" className={styles.formControl} />
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M18: Security Score Details
   * ======================================================================== */
  const renderSecurityScoreDetails = () => (
    <MBox id="securityScoreDetailsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-bar-chart-steps text-accent me-2" style={{ color: 'var(--pm-accent)' }} />Security Score Breakdown</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center mb-4">
        <div className={styles.sv} style={{ color: 'var(--pm-accent)' }}>92/100</div>
      </div>
      <div className={styles.sr}><div><strong>PIN Strength</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Changed &lt; 90 days ago</div></div><span className={`${styles.badge} ${styles.badgeS}`}>+20</span></div>
      <div className={styles.sr}><div><strong>3DS Enrollment</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Biometric push enabled</div></div><span className={`${styles.badge} ${styles.badgeS}`}>+30</span></div>
      <div className={styles.sr}><div><strong>Device Binding</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>1 active trusted device</div></div><span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-check" /></span></div>
      <div className={styles.sr}><div><strong>Geo-Fencing</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Active</div></div><span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-check" /></span></div>
      <div className={styles.sr}><div><strong>VPN Protection</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Disabled</div></div><span className={`${styles.badge} ${styles.badgeW}`}>0</span></div>
      <div className="modal-footer"><button className={styles.btnPm} onClick={() => onOpen('vpnProxyBlockerModal')}>Improve Score</button></div>
    </MBox>
  )

  /* ==========================================================================
   * M19: Export Security Report
   * ======================================================================== */
  const renderExportSecurityReport = () => (
    <MBox id="exportSecurityReportModal" active={active} onClose={onClose}
      title={<><i className="bi bi-file-earmark-pdf text-info me-2" />Export Security Report</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => {
            const reportContent = 'Security Report\n\nGenerated: ' + new Date().toLocaleString() + '\n\nThis report contains security incidents, blocked transactions, and audit logs.'
            downloadFile('security-report.txt', reportContent)
            doAction('exportSecurityReportModal', 'Report generated successfully!')
          }}>Download</button>
        </>
      }
    >
      <div className="mb-3">
        <label className={styles.formLabel}>Content</label>
        <select className={styles.formControl}>
          <option>All Security Incidents</option>
          <option>Blocked Transactions Log</option>
          <option>Audit Log (Settings changes)</option>
        </select>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <label className={styles.formLabel}>From</label>
          <input type="date" className={styles.formControl} value="2025-05-27" />
        </div>
        <div className="col-6">
          <label className={styles.formLabel}>To</label>
          <input type="date" className={styles.formControl} value="2025-06-27" />
        </div>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Format</label>
        <select className={styles.formControl}>
          <option>PDF</option>
          <option>CSV</option>
        </select>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M20: Merchant Whitelist
   * ======================================================================== */
  const renderMerchantWhitelist = () => (
    <MBox id="merchantWhitelistModal" active={active} onClose={onClose}
      title={<><i className="bi bi-card-checklist text-success me-2" />Trusted Merchants</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <p style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>These merchants bypass standard velocity and geo-fencing checks based on your history.</p>
      <div className={styles.sr}><div><strong>Netflix (US)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Recurring Sub</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}>Remove</button></div>
      <div className={styles.sr}><div><strong>Spotify</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Recurring Sub</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}>Remove</button></div>
      <div className={styles.sr}><div><strong>Safaricom PLC</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Utility</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}>Remove</button></div>
      <div className="mt-3">
        <input type="text" className={styles.formControl} placeholder="Search to add merchant manually" />
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M21: Card Replacement Tracker
   * ======================================================================== */
  const renderCardReplacementTracker = () => (
    <MBox id="cardReplacementTrackerModal" active={active} onClose={onClose}
      title={<><i className="bi bi-truck text-info me-2" />Replacement Tracker</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-4" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="d-flex justify-content-between mb-1"><span className="text-muted">Order ID</span><strong>ORD-99120</strong></div>
        <div className="d-flex justify-content-between"><span className="text-muted">Status</span><span className={`${styles.badge} ${styles.badgeI}`}>In Transit</span></div>
      </div>
      <div className={styles.stepper} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
        {config.replacement.steps.map((s: any) => (
          <div key={s.num} className="d-flex align-items-center gap-3">
            <div className={styles.stepN} style={{ background: s.done ? 'var(--pm-accent)' : s.active ? 'var(--pm-primary)' : 'var(--pm-border)', color: '#fff' }}>
              {s.done ? <i className="bi bi-check" /> : s.num}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{s.time}</div>
            </div>
          </div>
        ))}
      </div>
    </MBox>
  )

  /* ==========================================================================
   * M22: Audit Log
   * ======================================================================== */
  const renderAuditLog = () => (
    <MBox id="auditLogModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-journal-text me-2" />Security Audit Log</>}
      footer={
        <>
          <button className={styles.btnPm} onClick={onClose}>Close</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('exportSecurityReportModal')}>Export</button>
        </>
      }
    >
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr><th>Time</th><th>Action</th><th>User / System</th><th>IP / Device</th></tr>
            </thead>
            <tbody>
              {config.auditLog.map((a: any, i: number) => (
                <tr key={i}>
                  <td>{a.time}</td>
                  <td>{a.action}</td>
                  <td>{a.actor}</td>
                  <td>{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MBox>
  )

  /* ==========================================================================
   * Render all modals
   * ======================================================================== */
  return (
    <>
      {renderHealthCheck()}
      {renderSecurityAlerts()}
      {renderProfile()}
      {renderReviewSuspiciousTx()}
      {renderFraudRuleBuilder()}
      {renderMCCBlocker()}
      {renderVelocityLimits()}
      {renderVPNProxyBlocker()}
      {renderDeviceBinding()}
      {renderManage3DS()}
      {renderGeoFencing()}
      {renderTravelMode()}
      {renderContactlessLimit()}
      {renderFreezeCard()}
      {renderReportCompromise()}
      {renderDisputeCenter()}
      {renderEvidenceVault()}
      {renderSecurityScoreDetails()}
      {renderExportSecurityReport()}
      {renderMerchantWhitelist()}
      {renderCardReplacementTracker()}
      {renderAuditLog()}
    </>
  )
}