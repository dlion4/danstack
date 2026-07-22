import { useRef } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/account-settings.module.css'

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

const PIN_LENGTH = 4

export default function AccountSettingsModals({ active, onClose, config }: ModalsProps) {
  const pinRef = useRef<(HTMLInputElement | null)[]>([])
  const handlePinInput = (idx: number) => {
    const el = pinRef.current[idx]
    if (el && el.value.length === 1 && idx < PIN_LENGTH - 1) {
      pinRef.current[idx + 1]?.focus()
    }
  }

  // Submit actions close the modal (the MBox already gives clear open/close feedback).
  const doAction = (_id: string, _msg: string, _ref?: string) => onClose()

  const renderChangePin = () => (
    <MBox id="changePinModal" active={active} onClose={onClose}
      title={<><i className="bi bi-key text-primary me-2" />Change Card PIN</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('changePinModal', 'PIN changed successfully!', 'PIN-' + Math.random().toString(36).slice(2, 8).toUpperCase())}>
          Confirm Change
        </button>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginBottom: 16 }}>Enter your current PIN and choose a new 4-digit PIN for your card.</p>
      <div className="mb-3"><label className={styles.formLabel}>Current PIN</label>
        <div className={styles.pinRow}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={() => handlePinInput(i)} />)}
        </div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>New PIN</label>
        <div className={styles.pinRow}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={() => handlePinInput(i)} />)}
        </div>
      </div>
      <div className="mb-3"><label className={styles.formLabel}>Confirm New PIN</label>
        <div className={styles.pinRow}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={() => handlePinInput(i)} />)}
        </div>
      </div>
    </MBox>
  )

  const renderFreezeCard = () => (
    <MBox id="freezeCardModal" active={active} onClose={onClose}
      title={<><i className="bi bi-snow text-info me-2" />Freeze / Unfreeze Card</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('freezeCardModal', 'Card freeze status updated successfully!')}>
          Update Status
        </button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}><option>Primary Debit ****4521</option><option>Tap-Pay Card ****3392</option><option>Online Shopping ****1190</option></select>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Temporary Freeze</label><div className="text-muted" style={{ fontSize: 11 }}>Card is disabled but can be unfrozen instantly anytime.</div></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label fw-bold">Permanent Block (Lost/Stolen)</label><div className="text-muted" style={{ fontSize: 11 }}>Card is cancelled forever. A replacement must be ordered.</div></div>
      </div>
    </MBox>
  )

  const renderTroubleshoot = () => (
    <MBox id="troubleshootModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-wrench text-warning me-2" />Transaction Troubleshooter</>}
      footer={
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('troubleshootModal', 'Diagnosis complete. Recommendations generated.')}>
          Run Diagnosis
        </button>
      }
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Failed Transaction</label>
        <select className={styles.formControl}><option>AWS Web Services — KES 4,500 — Declined (Insufficient Funds)</option><option>Netflix — KES 1,400 — Declined (Card Frozen)</option><option>AliExpress — KES 6,240 — Pending 3DS</option></select>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
        <strong>Common causes:</strong> Insufficient funds, card frozen, daily limit exceeded, 3DS authentication pending, MCC blocked.
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" defaultChecked /><label className="form-check-label">Insufficient funds</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">Card frozen / blocked</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">Daily limit exceeded</label></div>
        </div>
        <div className="col-md-6">
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">3DS authentication pending</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">MCC / merchant blocked</label></div>
          <div className="form-check"><input className="form-check-input" type="radio" name="issue" /><label className="form-check-label">Other</label></div>
        </div>
      </div>
    </MBox>
  )

  const renderDefaultCards = () => (
    <MBox id="defaultCardsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-check2-circle text-success me-2" />Default Card Assignments</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Done</button>}
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginBottom: 16 }}>Set which card is used by default for each payment scenario.</p>
      <div className="row g-3">
        {config.sections.preferences.cards.map((c: any) => (
          <div key={c.last4} className="col-md-6">
            <div className={styles.ub}>
              <h5 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>{c.type === 'Virtual Credit' ? 'Online Payments' : c.type === 'Prepaid' ? 'ATM Withdrawals' : c.type}</h5>
              <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{c.name} ****{c.last4}</div>
              <div className="form-check form-switch mt-2"><input className="form-check-input" type="checkbox" defaultChecked={c.status === 'active'} /><label className="form-check-label">Use as default</label></div>
            </div>
          </div>
        ))}
      </div>
    </MBox>
  )

  const renderCardNaming = () => (
    <MBox id="cardNamingModal" active={active} onClose={onClose}
      title={<><i className="bi bi-pencil text-primary me-2" />Organise Card Portfolio</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Save</button>}
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginBottom: 16 }}>Rename cards, assign colour codes, and reorder quick-access items.</p>
      {config.sections.preferences.cards.map((c: any) => (
        <div key={c.last4} className={styles.sr}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}><i className={`bi ${c.icon}`} /></div>
            <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{c.type} ****{c.last4}</div></div>
          </div>
          <input className={styles.fc} style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }} defaultValue={c.name} />
        </div>
      ))}
    </MBox>
  )

  const renderNotifSettings = () => (
    <MBox id="notifSettingsModal" active={active} size="lg" onClose={onClose}
      title={<><i className="bi bi-bell text-warning me-2" />Notification Settings</>}
      footer={
        <><button className={styles.btnPm} onClick={onClose}>Cancel</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction('notifSettingsModal', 'Notification preferences saved!')}>Save Preferences</button></>
      }
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div className={styles.ub}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Transaction Alerts</h4>
            {config.sections.alerts.alerts.map((a: any) => (
              <div key={a.type} className={styles.sr}>
                <div><strong>{a.type}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{a.sub}</div></div>
                {a.value ? (
                  <div className="d-flex align-items-center gap-2">
                    <input className={styles.fc} style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }} defaultValue={a.value} />
                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                  </div>
                ) : (
                  <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className={styles.ub}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Security & Billing Alerts</h4>
            <div className={styles.sr}><div><strong>New device login</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
            <div className={styles.sr}><div><strong>PIN / password change</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
            <div className={styles.sr}><div><strong>Card freeze / unfreeze</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
            <div className={styles.sr}><div><strong>Statement ready</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
            <div className={styles.sr}><div><strong>Expiry reminders</strong></div>
              <div className="d-flex align-items-center gap-2">
                <select className={styles.fc} style={{ width: 'auto' }}><option>90, 60, 30, 7 days</option><option>60, 30, 7 days</option><option>30, 7 days</option></select>
                <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
              </div>
            </div>
            <hr className={styles.divider} />
            <h5 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>Delivery Channels</h5>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>Push</label></div>
              <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>SMS</label></div>
              <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 12 }}>Email</label></div>
              <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 12 }}>WhatsApp</label></div>
            </div>
          </div>
        </div>
      </div>
    </MBox>
  )

  const renderRevealPan = () => (
    <MBox id="revealPanModal" active={active} onClose={onClose}
      title={<><i className="bi bi-eye text-primary me-2" />Reveal Card Details</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={styles.cardWidget} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', maxWidth: 340, margin: '0 auto 20px', textAlign: 'left' }}>
        <div className={styles.cwLogo}>PAYMO VISA</div>
        <div className={styles.cwNumber}>4532 8821 0092 4521</div>
        <div className={styles.cwRow}>
          <div><div className={styles.cwLabel}>Cardholder</div>AMINA KAMAU</div>
          <div><div className={styles.cwLabel}>Expires</div>07/25</div>
          <div><div className={styles.cwLabel}>CVV</div>882</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--pm-danger)', textAlign: 'center' }}>Details will auto-hide in 60 seconds. Do not share your full PAN or CVV.</p>
    </MBox>
  )

  const renderCardControls = () => (
    <MBox id="cardControlsModal" active={active} onClose={onClose}
      title={<><i className="bi bi-sliders text-info me-2" />Card Controls</>}
      footer={<button className={styles.btnPm} onClick={onClose}>Save</button>}
    >
      <div className="mb-3"><label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}><option>Primary Debit ****4521</option><option>Tap-Pay Card ****3392</option></select>
      </div>
      <div className={styles.ub}>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Online Transactions</label><div className="text-muted" style={{ fontSize: 11 }}>Allow card-not-present internet purchases</div></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label fw-bold">International Spend</label><div className="text-muted" style={{ fontSize: 11 }}>Allow non-KES cross-border transactions</div></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Contactless (Tap-to-Pay)</label><div className="text-muted" style={{ fontSize: 11 }}>Allow physical tap limits without PIN</div></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">ATM Withdrawals</label><div className="text-muted" style={{ fontSize: 11 }}>Allow cash out at ATMs</div></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Subscriptions / Recurring</label><div className="text-muted" style={{ fontSize: 11 }}>Allow automated monthly billing charges</div></div>
      </div>
    </MBox>
  )

  const modalContent: Record<string, ReactNode> = {
    changePinModal: renderChangePin(),
    freezeCardModal: renderFreezeCard(),
    troubleshootModal: renderTroubleshoot(),
    defaultCardsModal: renderDefaultCards(),
    cardNamingModal: renderCardNaming(),
    notifSettingsModal: renderNotifSettings(),
    revealPanModal: renderRevealPan(),
    cardControlsModal: renderCardControls(),
  }

  if (!active) return null
  return <>{modalContent[active] ?? null}</>
}
