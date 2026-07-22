import styles from '../styles/card-command-center.module.css'

interface CardCommandCenterModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

let payBillStep = 1
let addCardStep = 1
let lostStep = 1

function renderStepper(elId: string, labels: string[], current: number) {
  const wrap = document.getElementById(elId)
  if (!wrap) return
  wrap.innerHTML = labels.map((l, i) => 
    `<div class="${i + 1 < current ? 'pm-step completed' : i + 1 === current ? 'pm-step active' : 'pm-step'}">
      <div class="pm-step-num">${i + 1 < current ? '<i class="bi bi-check"></i>' : i + 1}</div>
      <div class="pm-step-label">${l}</div>
    </div>${i < labels.length - 1 ? '<div class="pm-step-line"></div>' : ''}`
  ).join('')
}

function showFlow(prefix: string, current: number, total: number) {
  for (let i = 1; i <= total; i++) {
    const el = document.getElementById(prefix + i)
    if (el) {
      el.classList.remove('active')
      el.style.display = 'none'
    }
  }
  const a = document.getElementById(prefix + current)
  if (a) {
    a.classList.add('active')
    a.style.display = 'block'
  }
}

function showLoading(target: string | HTMLElement, cb: () => void) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) {
    cb()
    return
  }
  const ov = document.createElement('div')
  ov.className = styles.loadingOv
  ov.innerHTML = '<div class="${styles.spinner}"></div><p style="margin-top:12px;font-size:13px;font-weight:600;color:${"var(--pm-primary)"}>Processing...</p>'
  el.style.position = 'relative'
  el.appendChild(ov)
  setTimeout(() => {
    ov.remove()
    cb()
  }, 1200)
}

function moveFocus(el: HTMLInputElement) {
  if (el.value.length === 1 && el.nextElementSibling) {
    (el.nextElementSibling as HTMLInputElement).focus()
  }
}

function selectBox(el: HTMLElement) {
  el.closest('.row')?.querySelectorAll('.border').forEach((b: Element) => {
    b.style.borderColor = ''
    b.style.background = ''
  })
  el.style.borderColor = 'var(--pm-primary)'
  el.style.background = 'rgba(79,70,229,.04)'
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

function pickChip(el: HTMLElement, target: string, val: string) {
  el.parentElement?.querySelectorAll('.pm-amount-chip').forEach((c: Element) => c.classList.remove('active'))
  el.classList.add('active')
  const input = document.getElementById(target) as HTMLInputElement
  if (input) input.value = val
}

function CardDetailsModal() {
  return (
    <div className="text-center">
      <div className={`${styles.bankCard} ${styles.bankCardBg2} mx-auto mb-3`} style={{ maxWidth: 320, textAlign: 'left' }}>
        <div className="d-flex justify-content-between align-items-start">
          <div className={styles.bankCardType}>Virtual Debit</div>
          <div className={styles.bankCardLogo}>Mastercard</div>
        </div>
        <div className={`${styles.bankCardChip} mb-2`} style={{ opacity: 0.5, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }} />
        <div className={styles.bankCardNumber} style={{ margin: '16px 0' }}>
          <span>5412</span><span>7512</span><span>3412</span><span>8810</span>
        </div>
        <div className={styles.bankCardBottom}>
          <div>
            <div className={styles.bankCardName}>ONLINE SPEND</div>
          </div>
          <div className={styles.bankCardExp}>04/27</div>
        </div>
      </div>
      <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ marginBottom: 12 }}>Reveal CVV</button>
      <div className="row g-2 text-start">
         <div className="col-6"><div className="p-2 border rounded"><small className="text-muted">Type</small><br /><strong>Virtual Prepaid</strong></div></div>
        <div className="col-6"><div className="p-2 border rounded"><small className="text-muted">Status</small><br /><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></div></div>
        <div className="col-6"><div className="p-2 border rounded"><small className="text-muted">Daily Limit</small><br /><strong>KES 50,000</strong></div></div>
        <div className="col-6"><div className="p-2 border rounded"><small className="text-muted">Available</small><br /><strong>KES 18,200</strong></div></div>
      </div>
    </div>
  )
}

function FreezeCardModal() {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Temporarily block all transactions on card <strong>****4921</strong>. You can unfreeze it instantly at any time.</p>
      <div className="mb-3">
        <label className={styles.formLabel}>Reason for Freezing</label>
        <select className={styles.formControl}>
          <option>Misplaced temporarily</option>
          <option>Suspected fraud/unauthorized use</option>
          <option>Not using it right now</option>
          <option>Other</option>
        </select>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
        <i className="bi bi-info-circle me-1" /> Freezing blocks new purchases and ATM withdrawals. Recurring subscriptions may also be declined.
      </div>
    </div>
  )
}

function ShowCvvModal() {
  return (
    <div className="text-center">
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Enter your PayMo PIN to reveal the CVV and full card number for Virtual Debit ****8810.</p>
      <div className={styles.pinInput}>
        <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
        <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
        <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
        <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
      </div>
    </div>
  )
}

function TransactionDetailsModal() {
  return (
    <div>
      <div className="text-center mb-4">
        <div className={`${styles.iconCircle} mx-auto mb-2`} style={{ width: 56, height: 56, background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', fontSize: 24 }}><i className="bi bi-globe" /></div>
        <h3 style={{ fontWeight: 700, margin: 0 }}>Amazon AWS</h3>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pm-danger)' }}>Declined: USD 45.00</p>
      </div>
      <div className="p-3 border rounded mb-3" style={{ fontSize: 13 }}>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Date & Time</span><strong>26 Jun 2025, 08:14 AM</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Card Used</span><strong>Virtual Debit ****8810</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Category</span><strong>Online / Tech</strong></div>
        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Decline Reason</span><strong className="text-danger">Insufficient Prepaid Balance</strong></div>
        <div className="d-flex justify-content-between"><span className="text-muted">Transaction ID</span><strong>TXN-CRD-991204</strong></div>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
        Your current prepaid balance is KES 2,150. You need approx KES 5,900 to clear this.
      </div>
    </div>
  )
}

function ConfigureAlertsModal() {
  return (
    <div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Notify on all transactions</label>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Large Transaction Alert Threshold</label>
        <input className={styles.formControl} type="number" defaultValue={10000} />
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Notify on international transactions</label>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Notify on declined transactions</label>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Notify on Card-Not-Present (Online) usage</label>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Delivery Channels</label>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="checkbox" defaultChecked /> App Push
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="checkbox" defaultChecked /> SMS
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="checkbox" /> Email
        </div>
      </div>
    </div>
  )
}

function AutoRenewalModal() {
  return (
    <div>
      <div className="p-3 border rounded mb-3" style={{ borderLeft: '3px solid var(--pm-warning)!important' }}>
        <strong>Physical Debit ****3105</strong><br />
        <span style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Expires: 09/26 (72 days remaining)</span>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Automatically issue replacement card</label>
        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>A new card will be generated 30 days before expiry.</div>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Delivery Address for New Card</label>
        <textarea className={styles.formControl} rows={2}>Apt 4B, Kilimani Heights, Nairobi</textarea>
      </div>
    </div>
  )
}

function RenewCardModal() {
  return (
    <div>
      <p style={{ fontSize: 13 }}>Initiate an early renewal for card ****3105. Your current card will remain active until you activate the new one or until it expires.</p>
      <div className="mb-3">
        <label className={styles.formLabel}>Delivery Method</label>
        <select className={styles.formControl}>
          <option>Standard Mail (Free, 5-7 days)</option>
          <option>Courier Delivery (KES 500, 1-2 days)</option>
          <option>Branch Pickup (Same day)</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Branch Selection (If applicable)</label>
        <select className={styles.formControl}>
          <option>Westlands Branch</option>
          <option>CBD Branch</option>
        </select>
      </div>
    </div>
  )
}

function SecurityScoreModal() {
  return (
    <div>
      <div className="row align-items-center mb-4">
        <div className="col-md-4 text-center">
          <div style={{ display: 'inline-block', width: 120, height: 120, borderRadius: '50%', border: '8px solid var(--pm-accent-soft)', borderTopColor: 'var(--pm-accent)', borderRightColor: 'var(--pm-accent)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--pm-font-display)', fontSize: 32, fontWeight: 700, color: 'var(--pm-accent)', lineHeight: 1 }}>
              85
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <h4 style={{ fontWeight: 700 }}>Excellent Security</h4>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your card settings are highly secure. Implement the recommendations below to reach 100.</p>
        </div>
      </div>
      <div className="table-responsive">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Security Control</th>
              <th>Status</th>
              <th>Impact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>3D Secure Verification</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></td><td>High</td><td>—</td></tr>
            <tr><td>PIN Age (&lt; 90 days)</td><td><span className={`${styles.badge} ${styles.badgeW}`}>112 days old</span></td><td>Medium</td><td><button className={styles.btnPm}>Change</button></td></tr>
            <tr><td>International Txn Limits</td><td><span className={`${styles.badge} ${styles.badgeW}`}>Global allowed</span></td><td>High</td><td><button className={styles.btnPm}>Restrict</button></td></tr>
            <tr><td>Contactless Limits</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Capped KES 2,500</span></td><td>Medium</td><td>—</td></tr>
            <tr><td>Device Binding</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Bound</span></td><td>High</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BudgetSettingsModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Global Monthly Card Spend Limit</label>
        <input className={styles.formControl} type="number" defaultValue={140000} />
      </div>
      <h6 style={{ fontWeight: 700, marginTop: 20, marginBottom: 12 }}>Category Budgets</h6>
      <div className="row g-3">
        <div className="col-md-6"><label className={styles.formLabel}>Online Purchases</label><input className={styles.formControl} type="number" defaultValue={50000} /></div>
        <div className="col-md-6"><label className={styles.formLabel}>Dining & Entertainment</label><input className={styles.formControl} type="number" defaultValue={30000} /></div>
        <div className="col-md-6"><label className={styles.formLabel}>Groceries</label><input className={styles.formControl} type="number" defaultValue={40000} /></div>
        <div className="col-md-6"><label className={styles.formLabel}>Transport & Fuel</label><input className={styles.formControl} type="number" defaultValue={20000} /></div>
      </div>
      <div className="form-check form-switch mt-4">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Block transactions that exceed category limits</label>
      </div>
      <div className="form-check form-switch mt-2">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Send alert at 80% usage</label>
      </div>
    </div>
  )
}

function MerchantAnalyticsModal() {
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h6 style={{ fontWeight: 700 }}>Top Merchants (This Month)</h6>
        <select className={styles.formControl} style={{ width: 150 }}>
          <option>All Cards</option>
          <option>Credit ****4921</option>
        </select>
      </div>
      <div className="table-responsive">
        <table className={styles.table}>
          <thead><tr><th>Merchant</th><th>Category</th><th>Txns</th><th>Total Spend</th><th>Trend</th></tr></thead>
          <tbody>
            <tr><td><strong>Carrefour Supermarket</strong></td><td>Groceries</td><td>4</td><td>KES 32,450</td><td><span className="text-danger"><i className="bi bi-arrow-up" /> 12%</span></td></tr>
            <tr><td><strong>Shell Petrol</strong></td><td>Transport</td><td>3</td><td>KES 12,000</td><td><span className="text-success"><i className="bi bi-arrow-down" /> 4%</span></td></tr>
            <tr><td><strong>Amazon AWS</strong></td><td>Online</td><td>1</td><td>KES 5,850</td><td><span className="text-muted">—</span></td></tr>
            <tr><td><strong>Uber Kenya</strong></td><td>Transport</td><td>8</td><td>KES 4,200</td><td><span className="text-danger"><i className="bi bi-arrow-up" /> 22%</span></td></tr>
          </tbody>
        </table>
      </div>
      <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}>
        <i className="bi bi-exclamation-triangle me-1" /> You have 2 active subscriptions to Netflix on different cards.
      </div>
    </div>
  )
}

function ReportLostModal() {
  return (
    <div>
      <div className={styles.stepper} id="lostStepper">
        <div className="pm-step active"><div className="pm-step-num">1</div><div className="pm-step-label">Select</div></div>
        <div className="pm-step-line"></div>
        <div className="pm-step"><div className="pm-step-num">2</div><div className="pm-step-label">Confirm</div></div>
        <div className="pm-step-line"></div>
        <div className="pm-step"><div className="pm-step-num">3</div><div className="pm-step-label">Replace</div></div>
      </div>
      <div id="lostStep1" className="fade-step active">
        <div className="mb-3">
          <label className={styles.formLabel}>Select Card</label>
          <select className={styles.formControl}>
            <option>Physical Debit ****3105</option>
            <option>Premium Credit ****4921</option>
          </select>
        </div>
        <div className="mb-3">
          <label className={styles.formLabel}>Incident Type</label>
          <select className={styles.formControl}>
            <option>Lost Card</option>
            <option>Stolen Card</option>
            <option>Suspected Fraud / Compromised</option>
          </select>
        </div>
      </div>
      <div id="lostStep2" className="fade-step">
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', fontSize: 13 }}>
          <strong>WARNING:</strong> This will permanently cancel card ****3105. Any linked subscriptions will fail until updated with a new card. This action cannot be undone.
        </div>
        <label className={styles.formLabel}>Enter PIN to authorize cancellation</label>
        <div className={styles.pinInput}>
          <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
          <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
          <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
          <input type="password" maxLength={1} onInput={e => moveFocus(e.target as HTMLInputElement)} />
        </div>
      </div>
      <div id="lostStep3" className="fade-step">
        <div className="text-center mb-3">
          <i className="bi bi-check-circle text-success" style={{ fontSize: 48 }}></i>
          <h5 className="mt-2" style={{ fontWeight: 700 }}>Card Blocked Successfully</h5>
          <p style={{ fontSize: 13 }}>Your card has been terminated. Reference: BLK-499120</p>
        </div>
        <hr className={styles.divider} />
        <h6 style={{ fontWeight: 700 }}>Order Replacement</h6>
        <div className="mb-3">
          <label className={styles.formLabel}>Delivery Address</label>
          <textarea className={styles.formControl} rows={2}>Apt 4B, Kilimani Heights, Nairobi</textarea>
        </div>
        <div className="mb-3">
          <label className={styles.formLabel}>Fee</label>
          <input className={styles.formControl} value="KES 500 (Deducted from Wallet)" disabled />
        </div>
      </div>
    </div>
  )
}

function ReplaceCardModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Physical Debit ****3105 (Frozen)</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Reason</label>
        <select className={styles.formControl}>
          <option>Card is damaged / chip unreadable</option>
          <option>Name change</option>
          <option>Design upgrade</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Upload image of damaged card (Optional, waives fee)</label>
        <input type="file" className={styles.formControl} />
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Delivery</label>
        <select className={styles.formControl}>
          <option>Standard Mail (5-7 days)</option>
          <option>Branch Pickup</option>
        </select>
      </div>
    </div>
  )
}

function ChangePinModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Physical Debit ****3105</option>
          <option>Premium Credit ****4921</option>
        </select>
      </div>
      <label className={styles.formLabel}>Current PIN</label>
      <div className={styles.pinInput} mb-3>
        <input type="password" maxLength={1} />
        <input type="password" maxLength={1} />
        <input type="password" maxLength={1} />
        <input type="password" maxLength={1} />
      </div>
      <div className="text-center mt-3">
        <a href="#" style={{ fontSize: 12, color: 'var(--pm-primary)' }} onClick={e => { e.preventDefault(); }}>Forgot current PIN? Reset via OTP.</a>
      </div>
    </div>
  )
}

function ResetPinModal() {
  return (
    <div>
      <p style={{ fontSize: 13 }}>We will send a 6-digit OTP to your registered phone number (*** *** 890).</p>
      <button className={`${styles.btnPm} ${styles.btnSm} w-100 mb-4`}>Send OTP</button>
      <label className={styles.formLabel}>Enter OTP</label>
      <div className={styles.pinInput} mb-4>
        <input type="text" maxLength={1} />
        <input type="text" maxLength={1} />
        <input type="text" maxLength={1} />
        <input type="text" maxLength={1} />
        <input type="text" maxLength={1} />
        <input type="text" maxLength={1} />
      </div>
      <label className={styles.formLabel}>Create New PIN</label>
      <div className={styles.pinInput}>
        <input type="password" maxLength={1} />
        <input type="password" maxLength={1} />
        <input type="password" maxLength={1} />
        <input type="password" maxLength={1} />
      </div>
    </div>
  )
}

function ContactlessLimitModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Physical Debit ****3105</option>
        </select>
      </div>
      <div className="form-check form-switch mb-4">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Enable Tap-to-Pay (NFC)</label>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Maximum per tap without PIN (KES)</label>
        <input className={styles.formControl} type="number" defaultValue={2500} />
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Maximum daily contactless limit (KES)</label>
        <input className={styles.formControl} type="number" defaultValue={10000} />
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
        Transactions above these limits will require you to insert the card and enter your PIN.
      </div>
    </div>
  )
}

function OnlineTransactionsModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Premium Credit ****4921</option>
          <option>Physical Debit ****3105</option>
        </select>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Enable Online/E-commerce Purchases</label>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Require 3D Secure OTP for all online txn</label>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Allow Subscriptions / Recurring billing</label>
        <select className={styles.formControl}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>
    </div>
  )
}

function InternationalTransactionsModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Premium Credit ****4921</option>
        </select>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Enable International Transactions</label>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Geo-Mode</label>
        <select className={styles.formControl}>
          <option>Global</option>
          <option>East Africa Only</option>
          <option>Whitelist Countries</option>
        </select>
      </div>
      <hr className={styles.divider} />
      <h6 style={{ fontWeight: 700 }}>Travel Mode</h6>
      <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Pre-declare travel dates to prevent security blocks.</p>
      <div className="row g-2 mb-2">
        <div className="col-6"><input type="date" className={styles.formControl} placeholder="Start Date" /></div>
        <div className="col-6"><input type="date" className={styles.formControl} placeholder="End Date" /></div>
      </div>
      <input type="text" className={styles.formControl} mb-3 placeholder="Destination Countries (e.g. UAE, UK)" />
    </div>
  )
}

function AtmWithdrawalModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Physical Debit ****3105</option>
        </select>
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" defaultChecked />
        <label className="form-check-label">Allow ATM Withdrawals</label>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Daily ATM Limit (KES)</label>
        <input className={styles.formControl} type="number" defaultValue={40000} />
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" />
        <label className="form-check-label">Allow International ATM Withdrawals</label>
      </div>
    </div>
  )
}

function TempLimitModal() {
  return (
    <div>
      <p style={{ fontSize: 13 }}>Set a temporary spending cap that automatically expires after a specific time.</p>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>Virtual Debit ****8810</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Temporary Limit Amount (KES)</label>
        <input className={styles.formControl} type="number" defaultValue={5000} />
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Expires After</label>
        <select className={styles.formControl}>
          <option>24 Hours</option>
          <option>48 Hours</option>
          <option>7 Days</option>
          <option>Custom Date</option>
        </select>
      </div>
    </div>
  )
}

function PayCardBillModal() {
  return (
    <div>
      <div className={styles.stepper} id="payBillStepper">
        <div className="pm-step active"><div className="pm-step-num">1</div><div className="pm-step-label">Select</div></div>
        <div className="pm-step-line"></div>
        <div className="pm-step"><div className="pm-step-num">2</div><div className="pm-step-label">Pay</div></div>
      </div>
      <div id="payBillStep1" className="fade-step active">
        <div className="mb-3">
          <label className={styles.formLabel}>Credit Card</label>
          <select className={styles.formControl}>
            <option>Premium Credit ****4921</option>
          </select>
        </div>
        <div className="row g-3">
          <div className="col-6">
            <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-danger)' }}>STATEMENT BALANCE</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-danger)' }}>KES 42,500</div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-warning)' }}>MINIMUM DUE</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 4,250</div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className={styles.formLabel}>Amount to Pay</label>
          <select className={styles.formControl}>
            <option>Statement Balance (KES 42,500)</option>
            <option>Minimum Due (KES 4,250)</option>
            <option>Custom Amount</option>
          </select>
        </div>
      </div>
      <div id="payBillStep2" className="fade-step">
        <h6 style={{ fontWeight: 700 }}>Select Funding Source</h6>
        <div className="mb-3">
          <div className="p-3 border rounded mb-2 d-flex align-items-center gap-3" style={{ borderColor: 'var(--pm-primary)!important', background: 'rgba(79,70,229,.04)' }} onClick={e => selectRadioCard(e.currentTarget as HTMLElement)}>
            <input type="radio" name="cpay" defaultChecked />
            <i className="bi bi-wallet2" style={{ fontSize: 20, color: 'var(--pm-primary)' }}></i>
            <div><strong>PayMo Wallet</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Balance KES 105,000</div></div>
          </div>
          <div className="p-3 border rounded d-flex align-items-center gap-3" onClick={e => selectRadioCard(e.currentTarget as HTMLElement)}>
            <input type="radio" name="cpay" />
            <i className="bi bi-phone" style={{ fontSize: 20, color: 'var(--pm-accent)' }}></i>
            <div><strong>M-Pesa</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>STK Push</div></div>
          </div>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total to pay</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 42,500</strong></div></div>
      </div>
    </div>
  )
}

function TopupPrepaidModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Prepaid Card</label>
        <select className={styles.formControl}>
          <option>Virtual Debit ****8810</option>
        </select>
      </div>
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
        <div className="d-flex justify-content-between"><span>Current Balance</span><strong>KES 18,200</strong></div>
        <div className="d-flex justify-content-between"><span>Max Allowed Balance</span><strong>KES 100,000</strong></div>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Top-up Amount</label>
        <div className={styles.amountChips} mb-2>
          <span className={styles.amountChip} onClick={e => pickChip(e.currentTarget as HTMLElement, 'topAmt', '1000')}>1,000</span>
          <span className={styles.amountChip} onClick={e => pickChip(e.currentTarget as HTMLElement, 'topAmt', '5000')}>5,000</span>
          <span className={`${styles.amountChip} ${styles.amountChipActive}`} onClick={e => pickChip(e.currentTarget as HTMLElement, 'topAmt', '10000')}>10,000</span>
        </div>
        <input type="number" id="topAmt" className={styles.formControl} defaultValue={10000} />
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Fund From</label>
        <select className={styles.formControl}>
          <option>PayMo Wallet</option>
          <option>M-Pesa</option>
        </select>
      </div>
    </div>
  )
}

function TransferBetweenCardsModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>From</label>
        <select className={styles.formControl}>
          <option>Physical Debit ****3105 (Balance: KES 45,000)</option>
        </select>
      </div>
      <div className="text-center mb-3"><i className="bi bi-arrow-down fs-4 text-muted"></i></div>
      <div className="mb-3">
        <label className={styles.formLabel}>To</label>
        <select className={styles.formControl}>
          <option>Virtual Debit ****8810 (Balance: KES 18,200)</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Amount (KES)</label>
        <input type="number" className={styles.formControl} defaultValue={5000} />
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
        Transfers between your own PayMo cards are instant and free.
      </div>
    </div>
  )
}

function AddCardModal() {
  return (
    <div>
      <div className={styles.stepper} id="addCardStepper">
        <div className="pm-step active"><div className="pm-step-num">1</div><div className="pm-step-label">Type</div></div>
        <div className="pm-step-line"></div>
        <div className="pm-step"><div className="pm-step-num">2</div><div className="pm-step-label">Design</div></div>
        <div className="pm-step-line"></div>
        <div className="pm-step"><div className="pm-step-num">3</div><div className="pm-step-label">Deliver</div></div>
      </div>
      <div id="addCardStep1" className="fade-step active">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 border rounded" style={{ cursor: 'pointer', borderColor: 'var(--pm-primary)!important', background: 'rgba(79,70,229,.04)' }} onClick={e => selectBox(e.currentTarget as HTMLElement)}>
              <i className="bi bi-globe fs-2 d-block mb-2 text-primary"></i>
              <strong>Virtual Card</strong>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Instant issue for online spend</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 border rounded" style={{ cursor: 'pointer' }} onClick={e => selectBox(e.currentTarget as HTMLElement)}>
              <i className="bi bi-credit-card fs-2 d-block mb-2 text-info"></i>
              <strong>Physical Card</strong>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Standard EMV card via mail</div>
            </div>
          </div>
        </div>
      </div>
      <div id="addCardStep2" className="fade-step">
        <label className={styles.formLabel}>Card Design</label>
        <div className="d-flex gap-3 mb-3">
          <div className={`${styles.bankCard} ${styles.bankCardBg1}`} style={{ width: 180, height: 114, border: '2px solid var(--pm-primary)' }}></div>
          <div className={`${styles.bankCard} ${styles.bankCardBg2}`} style={{ width: 180, height: 114, opacity: 0.6 }}></div>
          <div className={`${styles.bankCard} ${styles.bankCardBg4}`} style={{ width: 180, height: 114, opacity: 0.6 }}></div>
        </div>
        <div className="mb-3">
          <label className={styles.formLabel}>Name on Card</label>
          <input className={styles.formControl} defaultValue="JAMES KAMAU" />
        </div>
      </div>
      <div id="addCardStep3" className="fade-step">
        <div className="mb-3">
          <label className={styles.formLabel}>Delivery Address</label>
          <textarea className={styles.formControl} rows={2}>Apt 4B, Kilimani Heights, Nairobi</textarea>
        </div>
        <div className="mb-3">
          <label className={styles.formLabel}>Delivery Method</label>
          <select className={styles.formControl}>
            <option>Standard Mail (5-7 days) - Free</option>
            <option>Express Courier (1-2 days) - KES 500</option>
          </select>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>
          You will receive an OTP via SMS upon delivery to authorize the release of the card.
        </div>
      </div>
    </div>
  )
}

function HealthCheckModal() {
  return (
    <div className="text-center">
      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 48 }}></i>
      <h4 className="mt-2" style={{ fontWeight: 700 }}>All Systems Normal</h4>
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your card portfolio is healthy. No active fraud alerts or impending expiries.</p>
      <div className="row mt-4">
        <div className="col-4 border-end">
          <div className="fs-4 fw-bold">4</div>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>ACTIVE CARDS</div>
        </div>
        <div className="col-4 border-end">
          <div className="fs-4 fw-bold text-success">0</div>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>FRAUD ALERTS</div>
        </div>
        <div className="col-4">
          <div className="fs-4 fw-bold">1</div>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>FROZEN CARD</div>
        </div>
      </div>
    </div>
  )
}

function StatementExportModal() {
  return (
    <div>
      <div className="mb-3">
        <label className={styles.formLabel}>Select Card</label>
        <select className={styles.formControl}>
          <option>All Cards</option>
          <option>Premium Credit ****4921</option>
          <option>Virtual Debit ****8810</option>
        </select>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <label className={styles.formLabel}>From</label>
          <input type="date" className={styles.formControl} defaultValue="2025-06-01" />
        </div>
        <div className="col-6">
          <label className={styles.formLabel}>To</label>
          <input type="date" className={styles.formControl} defaultValue="2025-06-27" />
        </div>
      </div>
      <div className="mb-3">
        <label className={styles.formLabel}>Format</label>
        <select className={styles.formControl}>
          <option>PDF</option>
          <option>CSV</option>
          <option>Excel</option>
        </select>
      </div>
    </div>
  )
}

function ProfileModal() {
  return (
    <div className="text-center">
      <div className={`${styles.avatar} mx-auto mb-2`} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
      <h5 style={{ fontWeight: 700, margin: 0 }}>James Kamau</h5>
      <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Cardholder since 2022</div>
      <hr className={styles.divider} />
      <button className={`${styles.btnPm} ${styles.btnSm} w-100 mb-2`} style={{ marginBottom: 12 }}>Settings</button>
      <button className={`${styles.btnPm} ${styles.btnSm} w-100`} style={{ background: 'var(--pm-danger)', borderColor: 'var(--pm-danger)', color: '#fff' }}>Sign Out</button>
    </div>
  )
}

function NotificationsModal() {
  return (
    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
      <div className="p-3 border rounded mb-2">
        <div className="d-flex justify-content-between">
          <strong style={{ fontSize: 13 }}>Declined Transaction</strong>
          <span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>2h ago</span>
        </div>
        <div style={{ fontSize: 12 }}>Amazon AWS (USD 45.00) declined due to insufficient prepaid balance.</div>
      </div>
      <div className="p-3 border rounded mb-2">
        <div className="d-flex justify-content-between">
          <strong style={{ fontSize: 13 }}>Large Purchase Alert</strong>
          <span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>5h ago</span>
        </div>
        <div style={{ fontSize: 12 }}>KES 12,450 spent at Carrefour.</div>
      </div>
      <div className="p-3 border rounded mb-2">
        <div className="d-flex justify-content-between">
          <strong style={{ fontSize: 13 }}>Budget Warning</strong>
          <span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>1d ago</span>
        </div>
        <div style={{ fontSize: 12 }}>You have reached 85% of your global monthly card limit.</div>
      </div>
    </div>
  )
}

const modalContent: Record<string, React.ReactNode> = {
  cardDetailsModal: <CardDetailsModal />,
  freezeCardModal: <FreezeCardModal />,
  showCvvModal: <ShowCvvModal />,
  transactionDetailsModal: <TransactionDetailsModal />,
  configureAlertsModal: <ConfigureAlertsModal />,
  autoRenewalModal: <AutoRenewalModal />,
  renewCardModal: <RenewCardModal />,
  securityScoreModal: <SecurityScoreModal />,
  budgetSettingsModal: <BudgetSettingsModal />,
  merchantAnalyticsModal: <MerchantAnalyticsModal />,
  reportLostModal: <ReportLostModal />,
  replaceCardModal: <ReplaceCardModal />,
  changePinModal: <ChangePinModal />,
  resetPinModal: <ResetPinModal />,
  contactlessLimitModal: <ContactlessLimitModal />,
  onlineTransactionsModal: <OnlineTransactionsModal />,
  internationalTransactionsModal: <InternationalTransactionsModal />,
  atmWithdrawalModal: <AtmWithdrawalModal />,
  tempLimitModal: <TempLimitModal />,
  payCardBillModal: <PayCardBillModal />,
  topupPrepaidModal: <TopupPrepaidModal />,
  transferBetweenCardsModal: <TransferBetweenCardsModal />,
  addCardModal: <AddCardModal />,
  healthCheckModal: <HealthCheckModal />,
  statementExportModal: <StatementExportModal />,
  profileModal: <ProfileModal />,
  notificationsModal: <NotificationsModal />,
}

const modalTitles: Record<string, string> = {
  cardDetailsModal: 'Card Details',
  freezeCardModal: 'Freeze Card',
  showCvvModal: 'Security Check',
  transactionDetailsModal: 'Transaction Details',
  configureAlertsModal: 'Spending Alerts Setup',
  autoRenewalModal: 'Expiry & Auto-Renewal',
  renewCardModal: 'Renew Expiring Card',
  securityScoreModal: 'Security Posture',
  budgetSettingsModal: 'Card Budget Controls',
  merchantAnalyticsModal: 'Merchant Analytics',
  reportLostModal: 'Report Lost/Stolen Card',
  replaceCardModal: 'Request Card Replacement',
  changePinModal: 'Change Card PIN',
  resetPinModal: 'Reset PIN via OTP',
  contactlessLimitModal: 'Contactless Controls',
  onlineTransactionsModal: 'Online Transactions (CNP)',
  internationalTransactionsModal: 'International & Travel Controls',
  atmWithdrawalModal: 'ATM Withdrawals',
  tempLimitModal: 'Set Temporary Limit',
  payCardBillModal: 'Pay Credit Card Bill',
  topupPrepaidModal: 'Top Up Prepaid Card',
  transferBetweenCardsModal: 'Transfer Between Cards',
  addCardModal: 'Issue New Card',
  healthCheckModal: 'Portfolio Health',
  statementExportModal: 'Download Statement',
  profileModal: 'Profile',
  notificationsModal: 'Notifications',
}

function CardCommandCenterModals({ active, onClose }: CardCommandCenterModalsProps) {
  if (!active) return null

  const content = modalContent[active]
  const title = modalTitles[active] || ''

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
    </div>
  )
}

export default CardCommandCenterModals