import { useState } from 'react'
import styles from '../styles/physical-debit-cards.module.css'

interface PhysicalDebitCardsModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

/* ======================= LEGACY JS BRIDGE PATTERNS ======================= */
function moveFocus(el: HTMLInputElement) {
  if (el.value.length === 1 && el.nextElementSibling) {
    (el.nextElementSibling as HTMLInputElement).focus()
  }
}

function selectRadioCard(card: HTMLElement) {
  card.parentElement?.querySelectorAll('.border').forEach((b: Element) => {
    b.style.borderColor = ''
    b.style.background = ''
    const r = b.querySelector('input[type=radio]')
    if (r) (r as HTMLInputElement).checked = false
  })
  card.style.borderColor = 'var(--pm-primary)'
  card.style.background = 'rgba(79,70,229,.04)'
  const radio = card.querySelector('input[type=radio]')
  if (radio) (radio as HTMLInputElement).checked = true
}

function selectCardTier(card: HTMLElement) {
  card.parentElement?.querySelectorAll('.border').forEach((b: Element) => {
    b.style.borderColor = ''
    b.style.background = ''
  })
  card.style.borderColor = 'var(--pm-primary)'
  card.style.background = 'rgba(79,70,229,.04)'
}

function switchTab(prefix: string, key: string, btn: HTMLElement) {
  btn.parentElement?.querySelectorAll('.pm-tab-pill').forEach((b: Element) => b.classList.remove('active'))
  btn.classList.add('active')
  document.querySelectorAll(`[id^="${prefix}-"]`).forEach((p: Element) => p.classList.remove('active'))
  const panel = document.getElementById(prefix + '-' + key)
  if (panel) panel.classList.add('active')
}

function showLoading(target: string | HTMLElement, cb: () => void) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) { cb(); return }
  const ov = document.createElement('div')
  ov.className = styles.loadingOv
  ov.innerHTML = '<div class="' + styles.spinner + '"></div><p style="margin-top:12px;font-size:13px;font-weight:600;color:var(--pm-primary)">Processing...</p>'
  el.style.position = 'relative'
  el.appendChild(ov)
  setTimeout(() => { ov.remove(); cb() }, 1200)
}

function processAction(modalId: string, msg: string, ref: string) {
  const modal = document.getElementById(modalId)
  const body = modal?.querySelector('.modal-body')
  const footer = modal?.querySelector('.modal-footer')
  if (!body || !footer) return
  showLoading(body, () => {
    body.innerHTML = `<div class="${styles.receipt}"><div class="${styles.receiptIcon}"><i class="bi bi-check-lg"></i></div><h5 style="font-weight:700;color:var(--pm-accent)">Success</h5><p style="font-size:13px;color:var(--pm-ink-soft)">${msg}</p>${ref ? `<p style="font-size:12px;color:var(--pm-muted)">Ref: ${ref}</p>` : ''}<div class="d-flex justify-content-center mt-3" style="gap:8px"><button class="${styles.btnPm} ${styles.btnSm}" onclick="location.reload()"><i class="bi bi-download"></i> Save</button><button class="${styles.btnPm} ${styles.btnSm}" onclick="location.reload()"><i class="bi bi-check2-all"></i> Done</button></div></div>`
    footer.innerHTML = '<button class="' + styles.btnPm + ' ' + styles.btnPmP + '" data-bs-dismiss="modal">Close</button>'
  })
}

function renderStepper(elId: string, labels: string[], current: number) {
  const wrap = document.getElementById(elId)
  if (!wrap) return
  wrap.innerHTML = labels.map((l, i) =>
    `<div class="${(i + 1) < current ? styles.stepDone : (i + 1) === current ? styles.stepActive : ''} ${styles.step}">
      <div class="${styles.stepNum}">${(i + 1) < current ? '<i class="bi bi-check"></i>' : (i + 1)}</div>
      <div class="${styles.stepLabel}">${l}</div>
    </div>${i < labels.length - 1 ? '<div class="' + styles.stepLine + '"></div>' : ''}`
  ).join('')
}

function showFlow(prefix: string, current: number, total: number) {
  for (let i = 1; i <= total; i++) {
    const el = document.getElementById(prefix + i)
    if (el) { el.classList.remove('active'); el.style.display = 'none' }
  }
  const a = document.getElementById(prefix + current)
  if (a) { a.classList.add('active'); a.style.display = 'block' }
}

/* ======================= MODAL CONTENT ======================= */
const OrderCardModal = () => {
  const [step, setStep] = useState(1)
  const labels = ['Tier', 'Details', 'Delivery', 'Pay']
  return (
    <div>
      <div className={`${styles.stepper} ${styles.isotope ? 'isotope' : ''}`} id="orderStepper">
        {labels.map((l, i) => (
          <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
            <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
            <div className={styles.stepLabel}>{l}</div>
            {i < labels.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>
      <div id="orderStep1">
        <h6 style={{ fontWeight: 700 }}>Select Card Tier</h6>
        <div className="row g-3 mt-1">
          {['debitStandard|Standard Debit|Free issuance', 'debitPremium|Premium Travel|KES 1,000 fee', 'debitBusiness|SME Business|Linked to Biz Wallet'].map((t) => {
            const [bg, label, price] = t.split('|')
            return (
              <div key={label} className="col-md-4">
                <div className="p-3 border rounded text-center" style={{ cursor: 'pointer' }} onClick={(e) => selectCardTier(e.currentTarget)}>
                  <div className={`${styles.debitCard} ${styles[bg as keyof typeof styles]} mx-auto mb-2`} style={{ width: 100, padding: 8, minHeight: 60 }}><div className={styles.cardLogo} style={{ fontSize: 8 }}>PayMo</div></div>
                  <strong>{label}</strong>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{price}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4">
        <h6 style={{ fontWeight: 700 }}>Personalization & Delivery</h6>
        <div className="mb-3"><label className={styles.formLabel}>Name on Card</label><input className={styles.formControl} defaultValue="JAMES KAMAU" maxLength={21} /></div>
        <div className="mb-3"><label className={styles.formLabel}>Linked Account</label><select className={styles.formControl}><option>Primary PayMo Wallet (KES 24,500)</option><option>Business Wallet (KES 105,000)</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Delivery Method</label><select className={styles.formControl}><option>Express Courier (1-2 days) - KES 300</option><option>Standard Mail (5-7 days) - Free</option><option>Branch Pickup (Same day) - Free</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Delivery Address</label><textarea className={styles.formControl} rows={2}>Apt 4B, Kilimani Heights, Argwings Kodhek Rd, Nairobi</textarea></div>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div className="d-flex justify-content-between mb-1"><span>Card Tier</span><strong>Premium Travel</strong></div>
          <div className="d-flex justify-content-between mb-1"><span>Issuance Fee</span><strong>KES 1,000</strong></div>
          <div className="d-flex justify-content-between mb-1"><span>Delivery Fee</span><strong>KES 300</strong></div>
          <hr className={styles.divider} />
          <div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total to Pay</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 1,300</strong></div>
        </div>
        <button className={`${styles.btnPm} ${styles.btnPmP} w-100`} onClick={() => processAction('orderCardModal', 'Order received. Your Premium Travel Debit card is in production.', '')}>Pay & Order</button>
      </div>
    </div>
  )
}

const CardDeliveryModal = () => (
  <div>
    <div className="p-3 rounded mb-4" style={{ background: 'var(--pm-surface-2)' }}>
      <div className="d-flex justify-content-between mb-2"><span>Tracking ID</span><strong style={{ color: 'var(--pm-primary)' }}>TRK-9921448</strong></div>
      <div className="d-flex justify-content-between mb-2"><span>Courier</span><strong>Fargo Courier Express</strong></div>
      <div className="d-flex justify-content-between"><span>Est. Delivery</span><strong>Tomorrow, 2:00 PM</strong></div>
    </div>
    <div className={`${styles.stepper} ${styles.stepperColumn}`}>
      {[
        { icon: 'bi-check', title: 'Application Approved', sub: '25 Jun, 10:00 AM', done: true },
        { icon: 'bi-check', title: 'Card Personalized & Printed', sub: '26 Jun, 09:15 AM', done: true },
        { icon: '3', title: 'Dispatched to Courier', sub: '26 Jun, 14:30 PM — Hub Nairobi', done: false, active: true },
        { icon: '4', title: 'Out for Delivery', sub: 'Pending', done: false },
        { icon: '5', title: 'Delivered', sub: 'Pending signature', done: false },
      ].map((s, i) => (
        <div key={i} className="d-flex gap-3 w-100" style={s.done || s.active ? {} : { opacity: 0.5 }}>
          <div className={styles.iconCircle} style={{ background: s.done ? 'var(--pm-accent)' : s.active ? 'var(--pm-primary)' : 'var(--pm-border)', color: '#fff', width: 24, height: 24, fontSize: 12 }}>{s.done ? <i className="bi bi-check" /> : s.icon}</div>
          <div><div style={{ fontWeight: 600, color: s.active ? 'var(--pm-primary)' : '' }}>{s.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{s.sub}</div></div>
        </div>
      ))}
    </div>
    <div className="p-3 rounded mt-4" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-shield-lock me-1" /> You must provide the 4-digit Delivery OTP <strong>(8812)</strong> to the rider to receive your card.</div>
  </div>
)

const ActivateCardModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Scan the QR code on the card carrier document or enter the details manually.</p>
    <div className="text-center p-4 border rounded mb-3 border-dashed" style={{ background: 'var(--pm-surface-2)', cursor: 'pointer' }}>
      <i className="bi bi-qr-code-scan" style={{ fontSize: 48, color: 'var(--pm-primary)' }} />
      <div className="mt-2" style={{ fontWeight: 600 }}>Tap to scan QR Code</div>
    </div>
    <div className="text-center mb-3 text-muted" style={{ fontSize: 12 }}>OR ENTER MANUALLY</div>
    <div className="mb-3"><label className={styles.formLabel}>Last 4 digits of Card</label><input className={styles.formControl} placeholder="e.g. 5591" maxLength={4} /></div>
    <div className="mb-3"><label className={styles.formLabel}>CVV (3 digits on back)</label><input className={styles.formControl} type="password" maxLength={3} /></div>
  </div>
)

const PinManagementModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Standard Debit (**** 8422)</option><option>Business Debit (**** 1102)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Current PIN (Leave blank if new activation)</label>
      <div className={styles.pinInput}><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /></div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>New 4-Digit PIN</label>
      <div className={styles.pinInput}><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /></div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Confirm New PIN</label>
      <div className={styles.pinInput}><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /></div>
    </div>
    <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)', fontSize: 12, color: '#991B1B' }}><i className="bi bi-exclamation-circle me-1" /> Do not use sequential numbers (1234) or repeated digits (1111).</div>
  </div>
)

const ResetPinModal = () => {
  const [otpVisible, setOtpVisible] = useState(false)
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>To reset your PIN securely, we will send an OTP to your registered phone number, and you must verify your identity.</p>
      <div className="mb-3"><label className={styles.formLabel}>Card Number</label><select className={styles.formControl}><option>Standard Debit (**** 8422)</option></select></div>
      <div className="mb-3"><label className={styles.formLabel}>Enter National ID / Passport Number</label><input className={styles.formControl} type="text" placeholder="ID Number" /></div>
      <button className={`${styles.btnPm} ${styles.btnPmP} w-100 mb-3`} onClick={() => setOtpVisible(true)}>Send OTP Request</button>
      {otpVisible && (
        <div className="mb-3"><label className={styles.formLabel}>Enter 6-digit OTP</label><input className={styles.formControl} type="text" placeholder="------" maxLength={6} style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }} /></div>
      )}
    </div>
  )
}

const CardLimitsModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Standard Debit (**** 8422)</option><option>Business Debit (**** 1102)</option></select></div>
    <div className="mb-4">
      <label className={styles.formLabel + ' d-flex justify-content-between'}><span>Daily POS/Online Limit</span><span>KES 100,000</span></label>
      <input type="range" className="form-range" min={1000} max={300000} step={1000} defaultValue={100000} />
      <div className="d-flex justify-content-between" style={{ fontSize: 10, color: 'var(--pm-muted)' }}><span>1k</span><span>300k (Max)</span></div>
    </div>
    <div className="mb-4">
      <label className={styles.formLabel + ' d-flex justify-content-between'}><span>Daily ATM Limit</span><span>KES 40,000</span></label>
      <input type="range" className="form-range" min={0} max={100000} step={1000} defaultValue={40000} />
      <div className="d-flex justify-content-between" style={{ fontSize: 10, color: 'var(--pm-muted)' }}><span>0</span><span>100k (Max)</span></div>
    </div>
    <div className="mb-4">
      <label className={styles.formLabel + ' d-flex justify-content-between'}><span>Contactless Tap Limit (No PIN)</span><span>KES 5,000</span></label>
      <input type="range" className="form-range" min={0} max={10000} step={500} defaultValue={5000} />
      <div className="d-flex justify-content-between" style={{ fontSize: 10, color: 'var(--pm-muted)' }}><span>0 (Disabled)</span><span>10k</span></div>
    </div>
    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13, fontWeight: 600 }}>Require App Approval for transactions &gt; KES 50,000</label></div>
  </div>
)

const GeoFencingModal = () => (
  <div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>Block transactions that occur outside your designated secure regions. Reduces skimming fraud risk by 80%.</div>
    <div className="mb-3"><label className={styles.formLabel}>Geographic Scope</label>
      <select className={styles.formControl + ' mb-2'}><option selected>Kenya Only (Highest Security)</option><option>East Africa (EAC)</option><option>Africa Region</option><option>Global (All enabled countries)</option></select>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Blocked Countries / Regions</label>
      <div className="p-2 border rounded d-flex flex-wrap gap-2 mb-2">
        {['Nigeria', 'South Africa', 'High-Risk Zone A'].map((c) => (
          <span key={c} className={styles.badge} style={{ background: 'var(--pm-surface-2)', border: '1px solid var(--pm-border)' }}>{c} <i className="bi bi-x ms-1" style={{ cursor: 'pointer' }} /></span>
        ))}
      </div>
      <select className={styles.formControl}><option>+ Add country to blocklist</option><option>United Kingdom</option><option>USA</option></select>
    </div>
    <hr className={styles.divider} />
    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13, fontWeight: 600 }}>Location Binding</label><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Block physical POS transactions if your phone's GPS is more than 50km away from the terminal.</div></div>
  </div>
)

const TravelModeModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Pre-declare your travel to prevent legitimate international transactions from being blocked by our fraud systems.</p>
    <div className="mb-3"><label className={styles.formLabel}>Destination Country/Countries</label><input className={styles.formControl} placeholder="e.g. UAE, United Kingdom" /></div>
    <div className="row g-3 mb-3">
      <div className="col-6"><label className={styles.formLabel}>Departure Date</label><input type="date" className={styles.formControl} /></div>
      <div className="col-6"><label className={styles.formLabel}>Return Date</label><input type="date" className={styles.formControl} /></div>
    </div>
    <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Temporarily increase daily POS limit to KES 200k during travel</label></div>
    <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Card will automatically revert to domestic Geo-Fencing rules on the return date.</div>
  </div>
)

const MerchantControlsModal = () => {
  const [tab, setTab] = useState<'categories' | 'specific'>('categories')
  return (
    <div>
      <div className={styles.tabPills + ' mb-3'}>
        <button className={`${styles.tabPill} ${tab === 'categories' ? styles.tabPillActive : ''}`} onClick={() => setTab('categories')}>Categories</button>
        <button className={`${styles.tabPill} ${tab === 'specific' ? styles.tabPillActive : ''}`} onClick={() => setTab('specific')}>Specific Merchants</button>
      </div>
      {tab === 'categories' ? (
        <div>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Toggle which merchant categories (MCCs) are allowed to process payments.</p>
          <div className="row g-3">
            {[
              { label: 'Gambling & Betting', on: false },
              { label: 'Alcohol & Bars', on: true },
              { label: 'Airlines & Travel', on: true },
              { label: 'Crypto Exchanges', on: false },
              { label: 'Digital Goods & Gaming', on: true },
              { label: 'Adult Entertainment', on: false },
            ].map((c) => (
              <div key={c.label} className="col-md-6"><div className={styles.statusRow}><div><strong>{c.label}</strong></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked={c.on} /></div></div></div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3"><label className={styles.formLabel}>Block specific merchant</label><div className="d-flex gap-2"><input className={styles.formControl} placeholder="Search recent merchants..." /><button className={`${styles.btnPm} ${styles.btnDanger}`}>Block</button></div></div>
          <h6 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--pm-muted)', marginBottom: 8 }}>Currently Blocked</h6>
          <div className="p-2 border rounded d-flex justify-content-between align-items-center mb-2"><span style={{ fontSize: 13 }}>Spotify Premium</span><button className={`${styles.btnPm} ${styles.btnSm}`}>Unblock</button></div>
          <div className="p-2 border rounded d-flex justify-content-between align-items-center"><span style={{ fontSize: 13 }}>Betika.com</span><button className={`${styles.btnPm} ${styles.btnSm}`}>Unblock</button></div>
        </div>
      )}
    </div>
  )
}

const FreezeCardModal = () => (
  <div className="text-center p-2">
    <div className={styles.iconCircle + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 28, background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-snow" /></div>
    <h5 style={{ fontWeight: 700 }}>Temporarily Freeze Card?</h5>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>This will block all new purchases and ATM withdrawals. Recurring subscriptions may also fail. You can unfreeze it instantly at any time.</p>
    <div className="text-start mt-4 mb-3"><label className={styles.formLabel}>Select Card to Freeze</label><select className={styles.formControl}><option>Standard Debit (**** 8422)</option><option>Business Debit (**** 1102)</option></select></div>
    <div className="text-start mb-3"><label className={styles.formLabel}>Reason (Optional)</label><select className={styles.formControl}><option>I misplaced it</option><option>Suspicious activity</option><option>Not using it right now</option></select></div>
  </div>
)

const ReportLostModal = () => (
  <div>
    <div className="p-3 rounded mb-3 text-danger" style={{ background: 'var(--pm-danger-soft)', fontSize: 13, border: '1px solid rgba(239,68,68,0.3)' }}>
      <strong>WARNING:</strong> This action is permanent. Your current card will be irrevocably cancelled to prevent fraud, and a new card number will be issued.
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Card</label><select className={styles.formControl}><option>Standard Debit (**** 8422)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>What Happened?</label>
      {['Lost or misplaced permanently', 'Stolen (suspect foul play)', 'Card details compromised online'].map((opt, i) => (
        <div key={opt} className="p-2 border rounded mb-2 d-flex align-items-center gap-2" onClick={(e) => selectRadioCard(e.currentTarget)}><input type="radio" name="lostR" defaultChecked={i === 0} /> <span>{opt}</span></div>
      ))}
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Date/Time Noticed</label><input type="datetime-local" className={styles.formControl} /></div>
    <div className="form-check mt-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13, fontWeight: 600 }}>Order replacement card immediately (KES 500 fee)</label></div>
  </div>
)

const ReplaceCardModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Use this if your physical card is cracked, the chip is unreadable, or contactless doesn't work. Your old card will remain active until you activate the new one.</p>
    <div className="mb-3"><label className={styles.formLabel}>Card to Replace</label><select className={styles.formControl}><option>Legacy Debit (**** 9421) - Frozen</option><option>Standard Debit (**** 8422)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Reason for replacement</label><select className={styles.formControl}><option>Chip damaged/unreadable</option><option>Magnetic stripe damaged</option><option>Contactless not working</option><option>Card physically broken</option><option>Name change</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Upload Photo of Damaged Card (Optional)</label><input type="file" className={styles.formControl} /><div style={{ fontSize: 10, color: 'var(--pm-muted)', marginTop: 4 }}>May waive replacement fee if manufacturing defect.</div></div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
      <div className="d-flex justify-content-between mb-1"><span>Replacement Fee</span><strong>KES 500</strong></div>
      <hr className={styles.divider} />
      <div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 500</strong></div>
    </div>
  </div>
)

const CancelCardModal = () => (
  <div>
    <div className="p-3 rounded mb-3 text-danger" style={{ background: 'var(--pm-danger-soft)', fontSize: 13, border: '1px solid rgba(239,68,68,0.3)' }}>
      <strong>PERMANENT CLOSURE:</strong> This will delete the card from your profile. It cannot be undone or reactivated. Any pending refunds will be routed to your main wallet.
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card to Cancel</label><select className={styles.formControl}><option>Legacy Debit (**** 9421) - Frozen</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Reason</label><select className={styles.formControl}><option>No longer needed</option><option>Switching to competitor</option><option>Too many fees</option><option>Other</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Feedback (Optional)</label><textarea className={styles.formControl} rows={2} /></div>
    <><label className={styles.formLabel}>Type "CANCEL" to confirm</label><input type="text" className={styles.formControl} placeholder="CANCEL" /></>
  </div>
)

const ViewCardDetailsModal = () => {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="text-center">
      {!revealed ? (
        <div>
          <i className="bi bi-fingerprint d-block mb-3" style={{ fontSize: 48, color: 'var(--pm-primary)' }} />
          <h6 style={{ fontWeight: 700 }}>Authentication Required</h6>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Enter your PayMo PIN or use biometrics to reveal full card PAN and CVV.</p>
          <div className={styles.pinInput + ' mb-3'}><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /><input type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} /></div>
          <button className={`${styles.btnPm} ${styles.btnPmP} w-100`} onClick={() => setRevealed(true)}>Unlock Details</button>
        </div>
      ) : (
        <div>
          <div className={`${styles.debitCard} ${styles.debitStandard} mx-auto mb-4`} style={{ width: '100%', maxWidth: 320, textAlign: 'left' }}>
            <div className={styles.cardLogo}>PayMo</div>
            <div className={styles.cardNumber} style={{ fontSize: 20, letterSpacing: 3 }}>4213 5592 1044 8422</div>
            <div className="d-flex justify-content-between align-items-end mt-2">
              <div><div style={{ fontSize: 10, opacity: 0.8 }}>VALID THRU</div><div style={{ fontFamily: 'monospace', fontSize: 16 }}>12/28</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.8 }}>CVV</div><div style={{ fontFamily: 'monospace', fontSize: 16 }}>481</div></div>
            </div>
            <div className={styles.cardName + ' mt-3'}>JAMES KAMAU</div>
          </div>
          <div className="d-flex justify-content-center gap-2">
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-clipboard" /> Copy Number</button>
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setRevealed(false)}>Hide</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 16 }}>Details will auto-hide in 30 seconds.</p>
        </div>
      )}
    </div>
  )
}

const ToggleConfirmModal = () => (
  <div className="text-center p-2">
    <i className="bi bi-shield-check mb-3 d-block" style={{ fontSize: 36, color: 'var(--pm-accent)' }} />
    <h6 style={{ fontWeight: 700 }}>Security Control Updated</h6>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)', marginBottom: 0 }}>The card setting has been instantly applied to the processing network.</p>
  </div>
)

const BulkOrderModal = () => (
  <div>
    <div className="row g-3">
      <div className="col-md-6"><label className={styles.formLabel}>Corporate Program</label><select className={styles.formControl}><option>Employee Expense Cards</option><option>Department Purchasing</option></select></div>
      <div className="col-md-6"><label className={styles.formLabel}>Card Branding</label><select className={styles.formControl}><option>Company Logo + PayMo</option><option>Standard PayMo Biz</option></select></div>
      <div className="col-12"><label className={styles.formLabel}>Upload Employee List (CSV)</label>
        <div className="p-4 border border-dashed rounded text-center" style={{ background: 'var(--pm-surface-2)', cursor: 'pointer' }}>
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: 32, color: 'var(--pm-primary)' }} />
          <div className="mt-2" style={{ fontSize: 13, fontWeight: 600 }}>Drag & drop CSV file here</div>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Format: Name, ID, Department, Limit</div>
        </div>
      </div>
      <div className="col-md-6"><label className={styles.formLabel}>Delivery Strategy</label><select className={styles.formControl}><option>Centralized (Ship to HR HQ)</option><option>Direct to Employee Home</option></select></div>
      <div className="col-md-6"><label className={styles.formLabel}>Batch ID</label><input className={styles.formControl} defaultValue="BATCH-2025-06-A" disabled /></div>
    </div>
  </div>
)

const PortfolioModal = () => (
  <div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Card</th><th>Type</th><th>Cardholder</th><th>Status</th><th>Limit</th><th>Actions</th></tr></thead>
        <tbody>
          {[
            { bg: 'debitStandard', num: '8422', type: 'Standard', holder: 'James Kamau', status: 'Active', tone: 'badgeS', limit: '100k', action: 'cardLimitsModal', label: 'Edit' },
            { bg: 'debitBusiness', num: '1102', type: 'Biz Debit', holder: 'James Kamau', status: 'No PIN', tone: 'badgeW', limit: '500k', action: 'pinManagementModal', label: 'PIN' },
            { bg: 'debitPremium', num: '5591', type: 'Premium', holder: 'James Kamau', status: 'Transit', tone: 'badgeI', limit: '250k', action: 'cardDeliveryModal', label: 'Track' },
            { bg: 'debitStandard', num: '9421', type: 'Legacy', holder: 'James Kamau', status: 'Frozen', tone: 'badgeD', limit: '100k', action: 'cancelCardModal', label: 'Drop' },
          ].map((c) => (
            <tr key={c.num}>
              <td><div className="d-flex align-items-center gap-2"><div className={`${styles.debitCard} ${styles[c.bg as keyof typeof styles]} ${styles.debitCardMini}`} style={{ filter: c.status === 'Frozen' ? 'grayscale(1)' : 'none' }} /> **** {c.num}</div></td>
              <td>{c.type}</td><td>{c.holder}</td>
              <td><span className={`${styles.badge} ${styles[c.tone as keyof typeof styles]}`}>{c.status}</span></td>
              <td>{c.limit}</td>
              <td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActive(c.action)}>{c.label}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const CardHealthModal = () => (
  <div>
    <div className="row g-3 mb-4">
      <div className="col-md-4 text-center"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 32, fontWeight: 800, color: 'var(--pm-accent)', fontFamily: 'var(--pm-font-display)' }}>94</div><div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>SECURITY SCORE</div></div></div>
      <div className="col-md-8">
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Audit Checklist</h6>
        {[
          'PIN Complexity — Strong (Changed 3 mo ago)',
          '3D Secure Enrollment — Active',
          'Geo-Fencing — Active (Kenya)',
          'Contactless Limit — High (KES 5,000)',
          'Device Binding — Secured to iPhone 14',
        ].map((row, i) => {
          const [label, val] = row.split(' — ')
          return (
            <div key={i} className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
              <span><i className={`bi ${i < 4 ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-warning'} me-2`}></i> {label}</span>
              <span>{val}</span>
            </div>
          )
        })}
      </div>
    </div>
    <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
      <h6 style={{ fontWeight: 700, fontSize: 13 }}><i className="bi bi-lightbulb text-warning me-1" /> Recommendations to reach 100/100</h6>
      <ul style={{ fontSize: 12, color: 'var(--pm-ink-soft)', marginBottom: 0, paddingLeft: 16 }}>
        <li>Lower contactless threshold to KES 2,000 to reduce tap-fraud risk.</li>
        <li>Enable App Approval for transactions over KES 50,000.</li>
        <li>Update your PIN (last changed over 90 days ago).</li>
      </ul>
    </div>
  </div>
)

const CardNotificationsModal = () => (
  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
    {[
      { bg: 'var(--pm-danger-soft)', title: 'Declined: Naivas Supermarket', sub: 'KES 6,200 · Daily tap limit exceeded.', meta: '1 hr ago', link: true },
      { bg: 'var(--pm-info-soft)', title: 'Delivery Update', sub: 'Premium card dispatched to courier. OTP 8812.', meta: '3 hrs ago', link: false },
      { bg: 'var(--pm-purple-soft)', title: 'Expiry Warning', sub: 'Card **** 9421 expires in 45 days.', meta: '1 day ago', link: false },
      { bg: 'var(--pm-surface-2)', title: 'Transaction Alert', sub: 'KES 2,400 at Uber Kenya.', meta: '2 days ago', link: false },
    ].map((n, i) => (
      <div key={i} className="p-3 rounded mb-2" style={{ background: n.bg, fontSize: 13 }}>
        <strong>{n.title}</strong>
        <div style={{ fontSize: 11, color: n.link ? '#7F1D1D' : 'var(--pm-ink-soft)' }}>{n.sub}</div>
        <div style={{ fontSize: 10, color: 'var(--pm-muted)', marginTop: 4 }}>{n.meta}</div>
      </div>
    ))}
  </div>
)

const RenewCardModal = () => (
  <div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-purple-soft)' }}>
      <div style={{ fontWeight: 700, color: 'var(--pm-purple)' }}>Legacy Debit (**** 9421)</div>
      <div style={{ fontSize: 12, color: '#6D28D9' }}>Expires: 08/25 (in 45 days)</div>
    </div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your new card will inherit the same PIN, settings, and linked accounts. The old card will deactivate automatically when the new one is activated.</p>
    <div className="mb-3"><label className={styles.formLabel}>Delivery Address Confirmation</label><textarea className={styles.formControl} rows={2}>Apt 4B, Kilimani Heights, Argwings Kodhek Rd, Nairobi</textarea></div>
    <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Auto-update my subscriptions (Netflix, Spotify) with the new expiry date using Visa Account Updater.</label></div>
  </div>
)

const AlertPrefsModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Transaction Alerts</label><select className={styles.formControl}><option>All transactions</option><option selected>Transactions over KES 1,000</option><option>International & Online only</option></select></div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Event</th><th>Push</th><th>SMS</th><th>Email</th></tr></thead>
        <tbody>
          {[
            ['Declines', true, true, false],
            ['Fraud Suspicions', true, true, true],
            ['Card Expiry', true, false, true],
            ['Settings Changed', true, false, true],
          ].map((row) => (
            <tr key={row[0] as string}>
              <td>{row[0]}</td>
              <td><input type="checkbox" defaultChecked={row[1] as boolean} /></td>
              <td><input type="checkbox" defaultChecked={row[2] as boolean} /></td>
              <td><input type="checkbox" defaultChecked={row[3] as boolean} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const ProfileModal = () => (
  <div className="text-center">
    <div className={styles.avatar + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-gradient-blue)' }}>CA</div>
    <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@email.com · +254 712 345 890</p>
    <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Total Cards</span><br /><strong>4 Physical</strong></div></div>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Global Limit</span><br /><strong>KES 500k / day</strong></div></div>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Security Score</span><br /><strong style={{ color: 'var(--pm-accent)' }}>94/100</strong></div></div>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Delivery Address</span><br /><strong>Kilimani HQ</strong></div></div>
    </div>
  </div>
)

/* ======================= MODAL REGISTRY ======================= */
const modalContent: Record<string, React.ReactNode> = {
  orderCardModal: <OrderCardModal />,
  cardDeliveryModal: <CardDeliveryModal />,
  activateCardModal: <ActivateCardModal />,
  pinManagementModal: <PinManagementModal />,
  resetPinModal: <ResetPinModal />,
  cardLimitsModal: <CardLimitsModal />,
  geoFencingModal: <GeoFencingModal />,
  travelModeModal: <TravelModeModal />,
  merchantControlsModal: <MerchantControlsModal />,
  freezeCardModal: <FreezeCardModal />,
  reportLostModal: <ReportLostModal />,
  replaceCardModal: <ReplaceCardModal />,
  cancelCardModal: <CancelCardModal />,
  viewCardDetailsModal: <ViewCardDetailsModal />,
  toggleConfirmModal: <ToggleConfirmModal />,
  bulkOrderModal: <BulkOrderModal />,
  portfolioModal: <PortfolioModal />,
  cardHealthModal: <CardHealthModal />,
  cardNotificationsModal: <CardNotificationsModal />,
  renewCardModal: <RenewCardModal />,
  alertPrefsModal: <AlertPrefsModal />,
  profileModal: <ProfileModal />,
}

const modalTitles: Record<string, string> = {
  orderCardModal: 'Order Physical Debit Card',
  cardDeliveryModal: 'Track Card Delivery',
  activateCardModal: 'Activate Physical Card',
  pinManagementModal: 'Set / Change Card PIN',
  resetPinModal: 'Reset Forgotten PIN',
  cardLimitsModal: 'Adjust Card Limits',
  geoFencingModal: 'Geo-Fencing & Location Controls',
  travelModeModal: 'Travel Mode',
  merchantControlsModal: 'Merchant Category Controls',
  freezeCardModal: 'Freeze Card',
  reportLostModal: 'Report Lost or Stolen',
  replaceCardModal: 'Replace Damaged Card',
  cancelCardModal: 'Cancel Card Permanently',
  viewCardDetailsModal: 'Secure Card Details',
  toggleConfirmModal: 'Security Control Updated',
  bulkOrderModal: 'Bulk Corporate Card Order',
  portfolioModal: 'Card Portfolio Administration',
  cardHealthModal: 'Security Posture Audit',
  cardNotificationsModal: 'Card Notifications',
  renewCardModal: 'Renew Expiring Card',
  alertPrefsModal: 'Alert Preferences',
  profileModal: 'Cardholder Profile',
}

function PhysicalDebitCardsModals({ active, onClose, onOpen }: PhysicalDebitCardsModalsProps) {
  if (!active) return null
  const content = modalContent[active]
  const title = modalTitles[active] || ''
  if (!content) return null

  return (
    <div id={active} className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {content}
          </div>
        </div>
      </div>
      <div className={styles.backdrop} onClick={onClose} />
    </div>
  )
}

export default PhysicalDebitCardsModals