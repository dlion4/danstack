import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/card-settings-support.module.css'

/* ============================================================================
 * Card Settings & Support — modal layer (legacy page 5.10, 22 modals)
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
  showFooter?: boolean
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
  pin: { labels: ['Verify', 'New PIN', 'Done'] },
  lost: { labels: ['Card', 'Details', 'Verify', 'Done'] },
  disp: { labels: ['Transaction', 'Evidence', 'Done'] },
  tshoot: { labels: ['Issue', 'Diagnosis', 'Confirm'] },
  renew: { labels: ['Renewal', 'Delivery', 'Confirm'] },
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

export default function CardSettingsModals({ active, onClose, onOpen, config }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ pin: 1, lost: 1, disp: 1, tshoot: 1, renew: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})

  /* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlows({ pin: 1, lost: 1, disp: 1, tshoot: 1, renew: 1 })
      setBusy(null)
      setTabs({})
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

  return (
    <>
      {/* M1: Change PIN (multi-step) */}
      <MBox id="changePinModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-key text-primary me-2" />Change Card PIN</>} footer={
        <div className="d-flex justify-content-end" style={{ gap: 8 }}>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          {flows.pin < 3 && <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => nextFlow('pin', 3)}>Continue <i className="bi bi-arrow-right" /></button>}
          {flows.pin === 3 && results.changePinModal && <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>}
        </div>
      }>
        <Stepper flowKey="pin" current={flows.pin} />
        <div style={flows.pin !== 1 ? { display: 'none' } : {}}>
          <h6 style={{ fontWeight: 700 }}>Step 1: Select Card</h6>
          <div className="mb-3"><label className={styles.formLabel}>Card</label><select className={styles.fc}><option>Visa Debit ****4521</option><option>Mastercard ****3392</option><option>Corporate ****6677</option></select></div>
          <div className="mb-3"><label className={styles.formLabel}>Enter Current PIN</label>
            <div className={styles.pinRow}>
              {[0, 1, 2, 3].map((i) => (
                <input key={i} ref={(el) => { pinRef.current[i] = el }} type="password" maxLength={1} onInput={() => handlePinInput(i)} />
              ))}
            </div>
          </div>
        </div>
        <div style={flows.pin !== 2 ? { display: 'none' } : {}}>
          <h6 style={{ fontWeight: 700 }}>Step 2: Set New PIN</h6>
          <label className={styles.formLabel}>New PIN</label>
          <div className={styles.pinRow} style={{ marginBottom: 12 }}>{[0, 1, 2, 3].map((i) => (<input key={i} type="password" maxLength={1} onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.length === 1 && t.nextElementSibling) (t.nextElementSibling as HTMLInputElement).focus() }} />))}</div>
          <label className={styles.formLabel}>Confirm New PIN</label>
          <div className={styles.pinRow}>{[0, 1, 2, 3].map((i) => (<input key={i} type="password" maxLength={1} onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.length === 1 && t.nextElementSibling) (t.nextElementSibling as HTMLInputElement).focus() }} />))}</div>
          <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> PIN must not contain sequential (1234) or repeated (1111) digits.</div>
        </div>
        <div style={flows.pin !== 3 ? { display: 'none' } : {}}>{results.changePinModal ? renderReceipt(results.changePinModal) : null}</div>
      </MBox>

      {/* M2: Freeze / Unfreeze */}
      <MBox id="freezeCardModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-snow2 text-info me-2" />Freeze / Unfreeze Card</>} footer={
        <div className="d-flex justify-content-end" style={{ gap: 8 }}>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('freezeCardModal', 'Card status updated successfully. Change is effective immediately.', '')}>Apply Change</button>
        </div>
      }>
        {renderActionBody('freezeCardModal',
          <>
            <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.fc}><option>Visa Debit ****4521 — Active</option><option>Mastercard ****3392 — Active</option><option>Prepaid ****8890 — Frozen</option><option>Virtual Credit ****1190 — Active</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Action</label><select className={styles.fc}><option value="freeze">Freeze (temporarily block)</option><option value="unfreeze">Unfreeze (reactivate)</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Reason</label><select className={styles.fc}><option>Temporary hold</option><option>Lost — searching</option><option>Suspected fraud</option><option>Security precaution</option><option>Travel security</option></select></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Frozen cards reject all transactions instantly. Unfreeze to resume normal use.</div>
          </>
        )}
      </MBox>

      {/* M3: Report Lost/Stolen (multi-step) */}
      <MBox id="reportLostModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-exclamation-diamond text-danger me-2" />Report Lost or Stolen Card</>} footer={
        <div className="d-flex justify-content-end" style={{ gap: 8 }}>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          {flows.lost < 4 && <button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={() => nextFlow('lost', 4)}>{flows.lost === 3 ? <>Block Card <i className="bi bi-shield-x" /></> : <>Continue <i className="bi bi-arrow-right" /></>}</button>}
          {flows.lost === 4 && results.reportLostModal && <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>}
        </div>
      }>
        <Stepper flowKey="lost" current={flows.lost} />
        <div style={flows.lost !== 1 ? { display: 'none' } : {}}>
          <h6 style={{ fontWeight: 700 }}>Step 1: Identify Card</h6>
          <div className="mb-3"><label className={styles.formLabel}>Card</label><select className={styles.fc}><option>Visa Debit ****4521</option><option>Mastercard ****3392</option><option>Prepaid Travel ****8890</option></select></div>
          <div className="mb-3"><label className={styles.formLabel}>Report Type</label>
            <div className="form-check mb-2"><input className="form-check-input" type="radio" name="lostType" defaultChecked /> <label className="form-check-label">Lost — unable to locate</label></div>
            <div className="form-check"><input className="form-check-input" type="radio" name="lostType" /> <label className="form-check-label">Stolen — taken by another person</label></div>
          </div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}><i className="bi bi-shield-x me-1" /> <strong>Immediate block:</strong> Reporting a card as lost or stolen will permanently block it. This action cannot be undone.</div>
        </div>
        <div style={flows.lost !== 2 ? { display: 'none' } : {}}>
          <h6 style={{ fontWeight: 700 }}>Step 2: Details & Replacement</h6>
          <div className="row g-3">
            <div className="col-md-6"><label className={styles.formLabel}>When did you last use it?</label><input type="date" className={styles.fc} defaultValue="2025-06-26" /></div>
            <div className="col-md-6"><label className={styles.formLabel}>Last known location</label><input className={styles.fc} defaultValue="Nairobi CBD" /></div>
            <div className="col-12"><label className={styles.formLabel}>Description</label><textarea className={styles.fc} rows={3} defaultValue="Card was in my wallet when I noticed it missing this morning." /></div>
            <div className="col-md-6"><label className={styles.formLabel}>Need replacement?</label><select className={styles.fc}><option>Yes — express courier (4 hours)</option><option>Yes — standard mail (5–7 days)</option><option>Yes — branch pickup (same day)</option><option>No replacement needed</option></select></div>
            <div className="col-md-6"><label className={styles.formLabel}>Delivery address</label><input className={styles.fc} defaultValue="Apt 3A, Lavington Green, Nairobi" /></div>
          </div>
        </div>
        <div style={flows.lost !== 3 ? { display: 'none' } : {}}>
          <h6 style={{ fontWeight: 700 }}>Step 3: Identity Verification</h6>
          <div className="mb-3"><label className={styles.formLabel}>Verify via OTP</label>
            <div className={styles.pinRow}>{[0, 1, 2, 3, 4, 5].map((i) => (<input key={i} type="password" maxLength={1} onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.length === 1 && t.nextElementSibling) (t.nextElementSibling as HTMLInputElement).focus() }} />))}</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--pm-muted)', textAlign: 'center' }}>OTP sent to +254 712***890</p>
        </div>
        <div style={flows.lost !== 4 ? { display: 'none' } : {}}>{results.reportLostModal ? renderReceipt(results.reportLostModal) : null}</div>
      </MBox>

      {/* M4: Card Controls */}
      <MBox id="cardControlsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-sliders me-2" style={{ color: 'var(--pm-purple)' }} />Card Controls & Limits</>} footer={
        <div className="d-flex justify-content-end" style={{ gap: 8 }}>
          <button className={styles.btnPm} onClick={onClose}>Cancel</button>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('cardControlsModal', 'Card controls updated. Changes take effect immediately.', '')}>Save Controls</button>
        </div>
      }>
        {renderActionBody('cardControlsModal',
          <>
            <Pills prefix="ctrl" tabsState={tabs} tabs={[
              { key: 'txn', label: 'Transaction' },
              { key: 'geo', label: 'Geographic' },
              { key: 'time', label: 'Time' },
              { key: 'merchant', label: 'Merchant' },
            ]} onSwitch={switchTab} />
            <div style={{ display: (tabs.ctrl ?? 'txn') !== 'txn' ? 'none' : undefined }} id="ctrl-txn">
              <div className="mb-3"><label className={styles.formLabel}>Card</label><select className={styles.fc}><option>Visa Debit ****4521</option><option>Mastercard ****3392</option><option>Virtual Credit ****1190</option></select></div>
              <div className="row g-3">
                <div className="col-md-6"><label className={styles.formLabel}>Daily Spending Limit</label><input className={styles.fc} defaultValue="50,000" /></div>
                <div className="col-md-6"><label className={styles.formLabel}>Per-Transaction Limit</label><input className={styles.fc} defaultValue="25,000" /></div>
                <div className="col-md-6"><label className={styles.formLabel}>Contactless Limit</label><input className={styles.fc} defaultValue="5,000" /></div>
                <div className="col-md-6"><label className={styles.formLabel}>ATM Withdrawal Limit</label><input className={styles.fc} defaultValue="40,000" /></div>
              </div>
              <hr className={styles.divider} />
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Online transactions</label></div>
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">International transactions</label></div>
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">ATM withdrawals</label></div>
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" /> <label className="form-check-label">Recurring payments</label></div>
              <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Contactless / NFC</label></div>
            </div>
            <div style={{ display: (tabs.ctrl ?? 'txn') !== 'geo' ? 'none' : undefined }} id="ctrl-geo">
              <div className="mb-3"><label className={styles.formLabel}>Geographic Mode</label><select className={styles.fc}><option>Global (all countries)</option><option>East Africa only</option><option>Kenya only</option><option>Custom country list</option></select></div>
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" /> <label className="form-check-label">Enable geo-fencing (block outside 50km radius)</label></div>
              <div className="mb-3"><label className={styles.formLabel}>Travel Mode</label>
                <div className="row g-3">
                  <div className="col-6"><label className={styles.formLabel} style={{ textTransform: 'none', fontSize: 11 }}>Travel start</label><input type="date" className={styles.fc} defaultValue="2025-07-15" /></div>
                  <div className="col-6"><label className={styles.formLabel} style={{ textTransform: 'none', fontSize: 11 }}>Travel end</label><input type="date" className={styles.fc} defaultValue="2025-07-22" /></div>
                </div>
              </div>
              <div className="mb-3"><label className={styles.formLabel}>Destination Countries</label><input className={styles.fc} defaultValue="United Kingdom, Germany, France" /></div>
            </div>
            <div style={{ display: (tabs.ctrl ?? 'txn') !== 'time' ? 'none' : undefined }} id="ctrl-time">
              <div className="row g-3">
                <div className="col-md-6"><label className={styles.formLabel}>Allowed Hours Start</label><select className={styles.fc}><option>6:00 AM</option><option>7:00 AM</option><option>8:00 AM</option></select></div>
                <div className="col-md-6"><label className={styles.formLabel}>Allowed Hours End</label><select className={styles.fc}><option>10:00 PM</option><option>11:00 PM</option><option>Midnight</option></select></div>
              </div>
              <div className="form-check form-switch mt-3 mb-2"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Allow weekend transactions</label></div>
              <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /> <label className="form-check-label">Allow holiday transactions</label></div>
            </div>
            <div style={{ display: (tabs.ctrl ?? 'txn') !== 'merchant' ? 'none' : undefined }} id="ctrl-merchant">
              <div className="mb-3"><label className={styles.formLabel}>Block by Category (MCC)</label>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label" style={{ fontSize: 13 }}>Gambling / Betting</label></div>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /> <label className="form-check-label" style={{ fontSize: 13 }}>Alcohol / Bars</label></div>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /> <label className="form-check-label" style={{ fontSize: 13 }}>Adult Content</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" /> <label className="form-check-label" style={{ fontSize: 13 }}>Crypto Exchanges</label></div>
              </div>
              <div className="mb-3"><label className={styles.formLabel}>Blocklist Specific Merchants</label><input className={styles.fc} placeholder="Enter merchant names separated by commas" /></div>
              <div className="mb-3"><label className={styles.formLabel}>Allowlist Specific Merchants</label><input className={styles.fc} placeholder="Only these merchants allowed" /></div>
            </div>
          </>
        )}
      </MBox>

      {/* M5: Default Cards */}
      <MBox id="defaultCardsModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-check2-circle me-2" />Default Card Assignments</>}>
        {renderActionBody('defaultCardsModal',
          <>
            <div className="mb-3"><label className={styles.formLabel}>Default for Online Payments</label><select className={styles.fc}><option>Visa Debit ****4521</option><option>Mastercard ****3392</option><option>Virtual Credit ****1190</option><option>Prepaid ****8890</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Default for Contactless / NFC</label><select className={styles.fc}><option>Mastercard ****3392</option><option>Visa Debit ****4521</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Default for ATM</label><select className={styles.fc}><option>Visa Debit ****4521</option><option>Mastercard ****3392</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Default Funding Source for Virtual Cards</label><select className={styles.fc}><option>PayMo Wallet (KES 24,500)</option><option>Visa Debit ****4521</option><option>M-Pesa (0712***890)</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Preferred International Currency</label><select className={styles.fc}><option>USD — US Dollar</option><option>EUR — Euro</option><option>GBP — British Pound</option><option>KES — Kenyan Shilling</option></select></div>
          </>
        )}
      </MBox>

      {/* M6: Card Naming & Org */}
      <MBox id="cardNamingModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-pencil me-2" />Organise Card Portfolio</>}>
        {renderActionBody('cardNamingModal',
          <>
            <Pills prefix="org" tabsState={tabs} tabs={[
              { key: 'names', label: 'Nicknames' },
              { key: 'groups', label: 'Groups' },
              { key: 'order', label: 'Quick-Access' },
            ]} onSwitch={switchTab} />
            <div style={{ display: (tabs.org ?? 'names') !== 'names' ? 'none' : undefined }} id="org-names">
              <div className="table-responsive">
                <table className={styles.tbl}>
                  <thead>
                    <tr><th>Card</th><th>Current Name</th><th>New Nickname</th><th>Colour</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Visa ****4521</td><td>Primary Debit</td><td><input className={styles.fc} style={{ padding: '6px 10px' }} defaultValue="Daily Driver" /></td><td><input type="color" defaultValue="#4F46E5" style={{ width: 36, height: 30, border: 'none', cursor: 'pointer' }} /></td></tr>
                    <tr><td>MC ****3392</td><td>Mastercard</td><td><input className={styles.fc} style={{ padding: '6px 10px' }} defaultValue="Tap-Pay Card" /></td><td><input type="color" defaultValue="#10B981" style={{ width: 36, height: 30, border: 'none', cursor: 'pointer' }} /></td></tr>
                    <tr><td>Virtual ****1190</td><td>Credit Card</td><td><input className={styles.fc} style={{ padding: '6px 10px' }} defaultValue="Online Shopping" /></td><td><input type="color" defaultValue="#8B5CF6" style={{ width: 36, height: 30, border: 'none', cursor: 'pointer' }} /></td></tr>
                    <tr><td>Prepaid ****8890</td><td>Travel Prepaid</td><td><input className={styles.fc} style={{ padding: '6px 10px' }} defaultValue="Travel Fund" /></td><td><input type="color" defaultValue="#F59E0B" style={{ width: 36, height: 30, border: 'none', cursor: 'pointer' }} /></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: (tabs.org ?? 'names') !== 'groups' ? 'none' : undefined }} id="org-groups">
              <div className="mb-3"><label className={styles.formLabel}>Personal Cards</label>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Visa ****4521</label></div>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">MC ****3392</label></div>
              </div>
              <div className="mb-3"><label className={styles.formLabel}>Online / Subscriptions</label>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Virtual Credit ****1190</label></div>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /> <label className="form-check-label">Netflix Card ****5501</label></div>
              </div>
              <div className="mb-3"><label className={styles.formLabel}>Travel</label>
                <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Prepaid ****8890</label></div>
              </div>
              <div className="mb-3"><label className={styles.formLabel}>Business</label>
                <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label">Corporate ****6677</label></div>
              </div>
            </div>
            <div style={{ display: (tabs.org ?? 'names') !== 'order' ? 'none' : undefined }} id="org-order">
              <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Drag cards to set your preferred dashboard order:</p>
              <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3"><i className="bi bi-grip-vertical text-muted" /><span className={`${styles.badge} ${styles.badgeP}`}>1</span> Visa ****4521 — Daily Driver</div>
              <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3"><i className="bi bi-grip-vertical text-muted" /><span className={`${styles.badge} ${styles.badgeI}`}>2</span> MC ****3392 — Tap-Pay Card</div>
              <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3"><i className="bi bi-grip-vertical text-muted" /><span className={`${styles.badge} ${styles.badgeS}`}>3</span> Virtual ****1190 — Online Shopping</div>
              <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3"><i className="bi bi-grip-vertical text-muted" /><span className={`${styles.badge} ${styles.badgeW}`}>4</span> Prepaid ****8890 — Travel Fund</div>
            </div>
          </>
        )}
      </MBox>

      {/* M7: Notification Settings */}
      <MBox id="notifSettingsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-bell me-2" />Full Alert Configuration</>}>
        {renderActionBody('notifSettingsModal',
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr><th>Alert Type</th><th>Push</th><th>SMS</th><th>Email</th><th>WhatsApp</th></tr>
              </thead>
              <tbody>
                <tr><td>All transactions</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td><td><input type="checkbox" /></td></tr>
                <tr><td>Large transactions (&gt;KES 10K)</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td></tr>
                <tr><td>International transactions</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td><td><input type="checkbox" /></td></tr>
                <tr><td>Declined transactions</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td>Suspected fraud (CNP)</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td>Security changes (PIN/freeze)</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td></tr>
                <tr><td>Credit statement ready</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td></tr>
                <tr><td>Payment due reminder</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td>Card expiry</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td></tr>
                <tr><td>Card delivery updates</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" /></td><td><input type="checkbox" defaultChecked /></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </MBox>

      {/* M8: Dispute */}
      <MBox id="disputeModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-shield-exclamation text-warning me-2" />File Card Dispute / Chargeback</>}>
        <Stepper flowKey="disp" current={flows.disp} />
        {renderActionBody('disputeModal',
          <>
            <div style={flows.disp !== 1 ? { display: 'none' } : {}}>
              <h6 style={{ fontWeight: 700 }}>Step 1: Transaction</h6>
              <div className="row g-3">
                <div className="col-md-6"><label className={styles.formLabel}>Card</label><select className={styles.fc}><option>Visa ****4521</option><option>MC ****3392</option><option>Virtual ****1190</option></select></div>
                <div className="col-md-6"><label className={styles.formLabel}>Transaction Date</label><input type="date" className={styles.fc} defaultValue="2025-06-20" /></div>
                <div className="col-md-6"><label className={styles.formLabel}>Merchant</label><input className={styles.fc} defaultValue="Online Store XYZ" /></div>
                <div className="col-md-6"><label className={styles.formLabel}>Amount</label><input className={styles.fc} defaultValue="4,500" /></div>
              </div>
              <div className="mb-3 mt-3"><label className={styles.formLabel}>Dispute Reason</label><select className={styles.fc}>
                <option>Unauthorised transaction</option>
                <option>Goods not received</option>
                <option>Goods not as described</option>
                <option>Duplicate charge</option>
                <option>Incorrect amount</option>
                <option>Cancelled recurring charge</option>
                <option>Refund not processed</option>
              </select></div>
            </div>
            <div style={flows.disp !== 2 ? { display: 'none' } : {}}>
              <h6 style={{ fontWeight: 700 }}>Step 2: Evidence</h6>
              <div className="mb-3"><label className={styles.formLabel}>Description</label><textarea className={styles.fc} rows={4} defaultValue="I did not authorise this transaction. The charge appeared without my knowledge. I did not share card details with anyone." /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className={styles.formLabel}>Upload Receipt / Evidence</label><input type="file" className={styles.fc} /></div>
                <div className="col-md-6"><label className={styles.formLabel}>Upload Police Report (if fraud)</label><input type="file" className={styles.fc} /></div>
              </div>
              <div className="mb-3 mt-3"><label className={styles.formLabel}>Merchant Communication</label><textarea className={styles.fc} rows={2} defaultValue="Attempted to contact merchant on 22 Jun via email. No response received." /></div>
            </div>
            <div style={flows.disp !== 3 ? { display: 'none' } : {}}>{results.disputeModal ? renderReceipt(results.disputeModal) : null}</div>
          </>
        )}
      </MBox>

      {/* M9: FAQ */}
      <MBox id="faqModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-question-circle me-2" />Card FAQ & Help Center</>}>
        <Pills prefix="faq" tabsState={tabs} tabs={[
          { key: 'general', label: 'General' },
          { key: 'security', label: 'Security' },
          { key: 'virtual', label: 'Virtual Cards' },
          { key: 'credit', label: 'Credit Cards' },
        ]} onSwitch={switchTab} />
        <div style={{ display: (tabs.faq ?? 'general') !== 'general' ? 'none' : undefined }} id="faq-general">
          <div className={styles.sr}><div><strong>How do I activate my new card?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>In-app: Go to Card Center → select card → tap Activate. Enter last 4 digits and the OTP sent to your phone. Your card is ready to use immediately.</div></div></div>
          <div className={styles.sr}><div><strong>What is the daily spending limit?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>Default limit is KES 50,000/day for debit cards. You can adjust this in Card Controls → Transaction tab up to KES 200,000/day.</div></div></div>
          <div className={styles.sr}><div><strong>How do I change my card PIN?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>Go to Card Settings → Change PIN. Enter your current PIN, then set a new 4-digit PIN. Changes take effect at the next ATM/POS use.</div></div></div>
        </div>
        <div style={{ display: (tabs.faq ?? 'general') !== 'security' ? 'none' : undefined }} id="faq-security">
          <div className={styles.sr}><div><strong>What is 3D Secure?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>3D Secure adds an extra authentication step for online payments. You'll receive an OTP or biometric prompt to confirm each online transaction.</div></div></div>
          <div className={styles.sr}><div><strong>How do I report a fraudulent transaction?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>Immediately freeze the card, then file a dispute from Support → Dispute. You can also call our 24/7 fraud hotline at +254 800 999 001.</div></div></div>
        </div>
        <div style={{ display: (tabs.faq ?? 'general') !== 'virtual' ? 'none' : undefined }} id="faq-virtual">
          <div className={styles.sr}><div><strong>How do single-use virtual cards work?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>A single-use card is created for one transaction. After the first successful charge, the card auto-destroys. Unused balance is refunded to your funding source.</div></div></div>
          <div className={styles.sr}><div><strong>Can I lock a virtual card to one merchant?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>Yes. Merchant-locked cards only accept charges from the specified merchant MCC or name. This prevents misuse if card details are compromised.</div></div></div>
        </div>
        <div style={{ display: (tabs.faq ?? 'general') !== 'credit' ? 'none' : undefined }} id="faq-credit">
          <div className={styles.sr}><div><strong>When is my credit card payment due?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>Payment is due on the statement date shown in your billing cycle. You have a 30-day grace period. Minimum payment is KES 2,000 or 5% of balance.</div></div></div>
          <div className={styles.sr}><div><strong>How do I increase my credit limit?</strong><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginTop: 4 }}>Go to Credit Card → Request Limit Increase. Upload recent income proof. Decisions are typically made within 24 hours.</div></div></div>
        </div>
      </MBox>

      {/* M10: Troubleshoot Wizard */}
      <MBox id="troubleshootModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-wrench me-2" />Card Troubleshoot Wizard</>}>
        <Stepper flowKey="tshoot" current={flows.tshoot} />
        {renderActionBody('troubleshootModal',
          <>
            <div style={flows.tshoot !== 1 ? { display: 'none' } : {}}>
              <h6 style={{ fontWeight: 700 }}>What happened?</h6>
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="p-3 border rounded text-center" style={{ cursor: 'pointer' }}><i className="bi bi-x-circle d-block mb-1" style={{ fontSize: 22, color: 'var(--pm-danger)' }} /><strong style={{ fontSize: 12 }}>Card Declined</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 border rounded text-center" style={{ cursor: 'pointer' }}><i className="bi bi-wifi-off d-block mb-1" style={{ fontSize: 22, color: 'var(--pm-warning)' }} /><strong style={{ fontSize: 12 }}>Contactless Not Working</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 border rounded text-center" style={{ cursor: 'pointer' }}><i className="bi bi-cash-stack d-block mb-1" style={{ fontSize: 22, color: 'var(--pm-info)' }} /><strong style={{ fontSize: 12 }}>ATM Issue</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 border rounded text-center" style={{ cursor: 'pointer' }}><i className="bi bi-globe d-block mb-1" style={{ fontSize: 22, color: 'var(--pm-purple)' }} /><strong style={{ fontSize: 12 }}>Online Payment Failed</strong>
                  </div>
                </div>
              </div>
            </div>
            <div style={flows.tshoot !== 2 ? { display: 'none' } : {}}>
              <h6 style={{ fontWeight: 700 }}>Diagnosis</h6>
              <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>Possible Causes Identified:</div>
                <ul style={{ fontSize: 13, margin: '8px 0 0', paddingLeft: 18, color: 'var(--pm-ink-soft)' }}>
                  <li>Daily spending limit may have been reached (KES 50,000)</li>
                  <li>Online transactions may be toggled off</li>
                  <li>International transactions disabled (if merchant is overseas)</li>
                  <li>3D Secure challenge may have timed out</li>
                </ul>
              </div>
              <h6 style={{ fontWeight: 700 }}>Recommended Fixes:</h6>
              <div className={styles.sr}><div><strong>Check & increase daily limit</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('cardControlsModal')}>Open Controls</button></div>
              <div className={styles.sr}><div><strong>Enable online transactions</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('cardControlsModal')}>Toggle</button></div>
              <div className={styles.sr}><div><strong>Verify 3D Secure enrollment</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('securityCheckModal')}>Check</button></div>
            </div>
            <div style={flows.tshoot !== 3 ? { display: 'none' } : {}}>
              <div className={styles.receipt}>
                <div className={styles.receiptIcon}><i className="bi bi-check-lg" /></div>
                <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Issue Resolved?</h5>
                <div className="d-flex justify-content-center mt-3" style={{ gap: 12 }}>
                  <button className={`${styles.btnPm} ${styles.btnPmA}`} onClick={() => doAction('troubleshootModal', 'Great! Glad the issue is resolved. Your card is ready to use.', '')}>Yes, resolved!</button>
                  <button className={styles.btnPm} onClick={() => onOpen('contactSupportModal')}>No, contact support</button>
                </div>
              </div>
            </div>
          </>
        )}
      </MBox>

      {/* M11: Reveal PAN */}
      <MBox id="revealPanModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-eye me-2" />Reveal Card Details</>}>
        <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.fc}><option>Visa Debit ****4521</option><option>Virtual Credit ****1190</option><option>Netflix Card ****5501</option></select></div>
        <label className={styles.formLabel}>Enter PIN to reveal</label>
        <div className={styles.pinRow} style={{ marginBottom: 12 }}>{[0, 1, 2, 3].map((i) => (<input key={i} type="password" maxLength={1} onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.length === 1 && t.nextElementSibling) (t.nextElementSibling as HTMLInputElement).focus() }} />))}</div>
        <div id="revealedDetails">
          <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontFamily: 'monospace', fontSize: 14 }}>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">PAN</span><strong>4521 6788 9012 4521</strong></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Expiry</span><strong>07/25</strong></div>
            <div className="d-flex justify-content-between"><span className="text-muted">CVV</span><strong>841</strong></div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--pm-danger)', textAlign: 'center', marginTop: 8 }}><i className="bi bi-clock" /> Details auto-hide in 30 seconds</p>
        </div>
      </MBox>

      {/* M12: Security Check */}
      <MBox id="securityCheckModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-shield-check text-success me-2" />Card Security Posture</>}>
        <div className="row g-3 mb-3">
          <div className="col-md-3 col-6">
            <div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--pm-accent)', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>91</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#047857' }}>OVERALL SCORE</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-info)' }}>7/7</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>3D SECURE</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>14d</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#B45309' }}>LAST PIN CHANGE</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 rounded text-center" style={{ background: 'var(--pm-purple-soft)' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-purple)' }}>2</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9' }}>DEVICES BOUND</div>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr><th>Card</th><th>3D Secure</th><th>PIN Age</th><th>Online</th><th>Intl.</th><th>Score</th></tr>
            </thead>
            <tbody>
              <tr><td>Visa ****4521</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Enrolled</span></td><td>14 days</td><td><span className={`${styles.badge} ${styles.badgeS}`}>On</span></td><td><span className={`${styles.badge} ${styles.badgeS}`}>On</span></td><td><strong>94</strong></td></tr>
              <tr><td>MC ****3392</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Enrolled</span></td><td>32 days</td><td><span className={`${styles.badge} ${styles.badgeS}`}>On</span></td><td><span className={`${styles.badge} ${styles.badgeS}`}>On</span></td><td><strong>90</strong></td></tr>
              <tr><td>Virtual ****1190</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Enrolled</span></td><td>N/A</td><td><span className={`${styles.badge} ${styles.badgeS}`}>On</span></td><td><span className={`${styles.badge} ${styles.badgeW}`}>Off</span></td><td><strong>88</strong></td></tr>
              <tr><td>Corporate ****6677</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Enrolled</span></td><td>91 days</td><td><span className={`${styles.badge} ${styles.badgeS}`}>On</span></td><td><span className={`${styles.badge} ${styles.badgeW}`}>Off</span></td><td><strong>79</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-lightbulb me-1" /> Improve score: Update PIN on Corporate card (91 days old) and enable biometric binding.</div>
      </MBox>

      {/* M13: Contact Support */}
      <MBox id="contactSupportModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-headset me-2" />Contact Card Support</>}>
        {renderActionBody('contactSupportModal',
          <>
            <div className="mb-3"><label className={styles.formLabel}>Subject</label><select className={styles.fc}>
              <option>Transaction issue</option>
              <option>Card not working</option>
              <option>Billing query</option>
              <option>Dispute follow-up</option>
              <option>General enquiry</option>
            </select></div>
            <div className="mb-3"><label className={styles.formLabel}>Card (if relevant)</label><select className={styles.fc}>
              <option>Visa ****4521</option>
              <option>MC ****3392</option>
              <option>All cards</option>
            </select></div>
            <div className="mb-3"><label className={styles.formLabel}>Message</label><textarea className={styles.fc} rows={4} defaultValue="I need assistance with my card. Please advise on next steps." /></div>
            <div className="mb-3"><label className={styles.formLabel}>Preferred Channel</label><select className={styles.fc}>
              <option>In-app chat (fastest)</option>
              <option>Phone callback</option>
              <option>Email reply</option>
              <option>WhatsApp</option>
            </select></div>
          </>
        )}
      </MBox>

      {/* M14: Emergency */}
      <MBox id="emergencyModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-telephone me-2" />Emergency Card Services</>}>
        {renderActionBody('emergencyModal',
          <>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)' }}>
              <h6 style={{ fontWeight: 700, color: '#991B1B', margin: '0 0 4px' }}>Lost/Stolen Card?</h6>
              <p style={{ fontSize: 13, color: '#7F1D1D', margin: '0' }}>Call <strong>+254 800 999 001</strong> (24/7, toll-free) or tap the button below to instantly block your card.</p>
              <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD} mt-2`} onClick={() => onOpen('reportLostModal')}>Block Card Now</button>
            </div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
              <h6 style={{ fontWeight: 700, color: '#B45309', margin: '0 0 4px' }}>Emergency Replacement</h6>
              <p style={{ fontSize: 13, color: '#92400E', margin: '0' }}>Express courier delivery within <strong>4 hours</strong> in Nairobi. Nationwide within <strong>24 hours</strong>.</p>
              <button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => onOpen('renewCardModal')}>Request Now</button>
            </div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)' }}>
              <h6 style={{ fontWeight: 700, color: '#1D4ED8', margin: '0 0 4px' }}>Emergency Cash Advance (Credit Cardholders)</h6>
              <p style={{ fontSize: 13, color: '#1E40AF', margin: 0 }}>Access emergency cash up to <strong>30% of your credit limit</strong> via M-Pesa or partner ATMs worldwide.</p>
              <button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => doAction('emergencyModal', 'Emergency cash advance of KES 15,000 sent to M-Pesa 0712***890.', 'ECA-20250627-0001')}>Request Cash</button>
            </div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-purple-soft)' }}>
              <h6 style={{ fontWeight: 700, color: '#6D28D9', margin: '0 0 4px' }}>Travel Assistance (Premium Cardholders)</h6>
              <p style={{ fontSize: 13, color: '#4C1D95', margin: 0 }}>Concierge, hotel booking, medical referral and embassy coordination available 24/7.</p>
              <button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => doAction('emergencyModal', 'Travel concierge request submitted. An agent will call you within 5 minutes.', 'TRV-20250627-0001')}>Contact Concierge</button>
            </div>
          </>
        )}
      </MBox>

      {/* M15: Renew / Replace Card */}
      <MBox id="renewCardModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-arrow-repeat me-2" />Renew / Replace Card</>}>
        {renderActionBody('renewCardModal',
          <>
            <div className="mb-3"><label className={styles.formLabel}>Card</label><select className={styles.fc}><option>Visa Debit ****4521 (expiring 07/25)</option><option>Prepaid ****8890</option><option>Corporate ****6677</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Reason</label><select className={styles.fc}><option>Expiring soon</option><option>Damaged (chip/stripe)</option><option>Lost or stolen</option><option>Name change</option><option>Design upgrade</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Delivery</label><select className={styles.fc}><option>Express courier — 4 hours (KES 500)</option><option>Standard mail — 5-7 days (free)</option><option>Branch pickup — same day (free)</option></select></div>
            <div className="mb-3"><label className={styles.formLabel}>Delivery Address</label><input className={styles.fc} defaultValue="Apt 3A, Lavington Green, Nairobi" /></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label" style={{ fontSize: 13 }}>Transfer balance to new card</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /> <label className="form-check-label" style={{ fontSize: 13 }}>Migrate linked recurring payments</label></div>
          </>
        )}
      </MBox>

      {/* M16: Card Notifications */}
      <MBox id="cardNotifModal" active={active} size="md" onClose={onClose} title="Card Notifications (8)">
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Visa ****4521 expiring in 28 days</strong>
          <div style={{ fontSize: 11, color: '#7F1D1D', marginTop: 2 }}>Renew or request replacement to maintain service.</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
          <strong>Dispute CDP-44892 needs your evidence</strong>
          <div style={{ fontSize: 11, color: '#92400E', marginTop: 2 }}>Upload merchant receipt before 30 Jun deadline.</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><strong>PIN reset PR-11228 processing</strong>
          <div style={{ fontSize: 11, color: '#1E40AF', marginTop: 2 }}>OTP verification required to complete reset.</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>Credit statement ready</strong>
          <div style={{ fontSize: 11, color: '#065F46', marginTop: 2 }}>Virtual Credit ****1190 — June statement available.</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: '#fff', border: '1px solid var(--pm-border)', fontSize: 13 }}><strong>Replacement card RPL-22019 dispatched</strong>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 2 }}>Courier tracking available. Expected today by 5 PM.</div>
        </div>
        <div className="p-3 rounded mb-2" style={{ background: '#fff', border: '1px solid var(--pm-border)', fontSize: 13 }}><strong>Transaction declined at Amazon</strong>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 2 }}>KES 3,200 · Reason: 3D Secure timeout.</div>
        </div>
      </MBox>

      {/* M17: Card Status Checker */}
      <MBox id="cardStatusModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-check-circle me-2" />Card Status Checker</>}>
        <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.fc}><option>Visa ****4521</option><option>MC ****3392</option><option>Virtual Credit ****1190</option><option>Prepaid ****8890</option><option>Corporate ****6677</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Status</span><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Expiry</span><strong>07/2025 <span style={{ color: 'var(--pm-danger)' }}>(28 days)</span></strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">3D Secure</span><span className={`${styles.badge} ${styles.badgeS}`}>Enrolled</span></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Contactless</span><span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Online</span><span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">International</span><span className={`${styles.badge} ${styles.badgeS}`}>Enabled</span></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Daily Limit</span><strong>KES 50,000</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Today's Usage</span><strong>KES 12,400 (24.8%)</strong></div>
        </div>
      </MBox>

      {/* M18: BIN Lookup */}
      <MBox id="binLookupModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-search me-2" />BIN Lookup Tool</>}>
        <div className="mb-3"><label className={styles.formLabel}>Enter first 6–8 digits of card number</label><input className={styles.fc} defaultValue="452167" placeholder="e.g. 452167" /></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Network</span><strong>Visa</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Type</span><strong>Debit</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Issuer</span><strong>PayMo Digital Bank</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Country</span><strong>Kenya (KE)</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Level</span><strong>Classic / Standard</strong></div>
        </div>
      </MBox>

      {/* M19: Fee Calculator */}
      <MBox id="feeCalcModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-calculator me-2" />Card Fee Calculator</>}>
        <div className="mb-3"><label className={styles.formLabel}>Action</label><select className={styles.fc}>
          <option>ATM withdrawal (domestic)</option>
          <option>ATM withdrawal (international)</option>
          <option>Card replacement (express)</option>
          <option>Card replacement (standard)</option>
          <option>Cash advance (credit card)</option>
          <option>Foreign exchange transaction</option>
          <option>Late payment fee</option>
        </select></div>
        <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label><input className={styles.fc} defaultValue="5000" /></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Withdrawal Amount</span><strong>KES 5,000</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">ATM Fee</span><strong>KES 35</strong></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Network Fee</span><strong>KES 0</strong></div>
          <hr className={styles.divider} />
          <div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total Deducted</span><strong style={{ color: 'var(--pm-primary)' }}>KES 5,035</strong></div>
        </div>
      </MBox>

      {/* M20: Branch Locator */}
      <MBox id="branchLocatorModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-geo-alt me-2" />Branch & ATM Locator</>}>
        <div className="mb-3"><label className={styles.formLabel}>Search Location</label><input className={styles.fc} placeholder="Enter area, city or landmark" defaultValue="Nairobi" /></div>
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr><th>Branch / ATM</th><th>Address</th><th>Services</th><th>Hours</th><th>Distance</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>PayMo Westlands</strong></td><td>Sarit Centre, Level 2</td><td>Card issue, PIN reset, Pickup</td><td>8AM – 5PM</td><td>1.2 km</td></tr>
              <tr><td><strong>PayMo CBD Kenyatta Ave</strong></td><td>Koinange / Kenyatta corner</td><td>Card issue, PIN reset, Disputes</td><td>8AM – 6PM</td><td>3.4 km</td></tr>
              <tr><td><strong>ATM — Galleria Mall</strong></td><td>Langata Road</td><td>Cash, Balance inquiry</td><td>24/7</td><td>5.1 km</td></tr>
              <tr><td><strong>ATM — JKIA Terminal 1</strong></td><td>Airport arrivals</td><td>Cash, Balance inquiry</td><td>24/7</td><td>14.8 km</td></tr>
            </tbody>
          </table>
        </div>
      </MBox>

      {/* M21: Attention Full */}
      <MBox id="attentionFullModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Items Requiring Attention</>}>
        {renderActionBody('attentionFullModal',
          <>
            <div className={styles.sr}><div><strong>Visa ****4521 expiring in 28 days</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Renew to avoid service disruption</div></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('renewCardModal')}>Renew</button></div>
            <div className={styles.sr}><div><strong>Prepaid ****8890 frozen</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Unfreeze to resume transactions</div></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('freezeCardModal')}>Unfreeze</button></div>
            <div className={styles.sr}><div><strong>Corporate ****6677 PIN overdue</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>91 days since last PIN change</div></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('changePinModal')}>Change PIN</button></div>
            <div className={styles.sr}><div><strong>Dispute CDP-44892 evidence needed</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Upload before 30 Jun deadline</div></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen('disputeModal')}>Respond</button></div>
            <div className={styles.sr}><div><strong>Credit card payment due in 3 days</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Virtual Credit ****1190 · KES 8,200</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => doAction('attentionFullModal', 'Credit card payment of KES 8,200 scheduled for 30 Jun.', '')}>Pay Now</button></div>
          </>
        )}
      </MBox>

      {/* M22: Case Export */}
      <MBox id="caseExportModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-download me-2" />Export Support Cases</>}>
        {renderActionBody('caseExportModal',
          <>
            <div className="mb-3"><label className={styles.formLabel}>Report Type</label><select className={styles.fc}>
              <option>All open cases</option>
              <option>Dispute history</option>
              <option>Full support log</option>
            </select></div>
            <div className="row g-3 mb-3">
              <div className="col-6"><label className={styles.formLabel}>From</label><input type="date" className={styles.fc} defaultValue="2025-01-01" /></div>
              <div className="col-6"><label className={styles.formLabel}>To</label><input type="date" className={styles.fc} defaultValue="2025-06-27" /></div>
            </div>
            <div className="mb-3"><label className={styles.formLabel}>Format</label><select className={styles.fc}>
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select></div>
          </>
        )}
      </MBox>

      {/* M23: Profile */}
      <MBox id="profileModal" active={active} size="md" onClose={onClose} title={<><i className="bi bi-person-circle me-2" />Profile</>}>
        <div className="text-center">
          <div className="pm-avatar mx-auto mb-3" style={{ width: 64, height: 64, fontSize: 24 }}>AK</div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>Amina Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>amina.k@email.com · +254 712 345 890</p>
        </div>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6">
            <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Cards</span><br /><strong>7 active</strong></div>
          </div>
          <div className="col-6">
            <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Security</span><br /><strong style={{ color: 'var(--pm-accent)' }}>91/100</strong></div>
          </div>
          <div className="col-6">
            <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Member Since</span><br /><strong>Jan 2023</strong></div>
          </div>
          <div className="col-6">
            <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Disputes</span><br /><strong>2 open</strong></div>
          </div>
        </div>
      </MBox>
    </>
  )
}