import { useState } from 'react'
import styles from '../styles/prepaid-card-management.module.css'

interface PrepaidCardManagementModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

/* ======================= LEGACY JS BRIDGE PATTERNS ======================= */
function moveFocus(el: HTMLInputElement) {
  if (el.value.length === 1 && el.nextElementSibling) {
    ;(el.nextElementSibling as HTMLInputElement).focus()
  }
}

function selectBox(el: HTMLElement) {
  el.closest('.row')?.querySelectorAll('.border').forEach((b: Element) => {
    ;(b as HTMLElement).style.borderColor = ''
    ;(b as HTMLElement).style.background = ''
  })
  el.style.borderColor = 'var(--pm-primary)'
  el.style.background = 'rgba(79,70,229,.04)'
}

function pickChip(el: HTMLElement, target: string, val: string) {
  el.parentElement?.querySelectorAll('.amountChip').forEach((c: Element) => c.classList.remove('amountChipActive'))
  el.classList.add('amountChipActive')
  const input = document.getElementById(target) as HTMLInputElement | null
  if (input) input.value = val
}

function showLoading(target: string | HTMLElement, cb: () => void) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) { cb(); return }
  const ov = document.createElement('div')
  ov.className = styles.loadingOv
  ov.innerHTML = '<div class="' + styles.spinner + '"></div><p class="' + styles.loadingLabel + '">Processing...</p>'
  ;(el as HTMLElement).style.position = 'relative'
  el.appendChild(ov)
  setTimeout(() => { ov.remove(); cb() }, 1200)
}

function processAction(modalId: string, msg: string, ref: string) {
  const modal = document.getElementById(modalId)
  const body = modal?.querySelector('.modal-body')
  const footer = modal?.querySelector('.modal-footer')
  if (!body || !footer) return
  showLoading(body, () => {
    body.innerHTML = '<div class="' + styles.receipt + '"><div class="' + styles.receiptIcon + '"><i class="bi bi-check-lg"></i></div><h5 style="font-weight:700;color:var(--pm-accent)">Success</h5><p style="font-size:13px;color:var(--pm-ink-soft)">' + msg + '</p>' + (ref ? '<p style="font-size:12px;color:var(--pm-muted)">Ref: ' + ref + '</p>' : '') + '<div class="mt-3"><button class="' + styles.btnPm + ' ' + styles.btnSm + '" onclick="location.reload()">Done</button></div></div>'
    footer.innerHTML = '<button class="' + styles.btnPm + ' ' + styles.btnPmP + '" data-bs-dismiss="modal">Close</button>'
  })
}

function renderStepper(elId: string, labels: string[], current: number) {
  const wrap = document.getElementById(elId)
  if (!wrap) return
  wrap.innerHTML = labels.map((l, i) =>
    '<div class="' + styles.step + ' ' + (i + 1 < current ? styles.stepDone : i + 1 === current ? styles.stepActive : '') + '">' +
      '<div class="' + styles.stepNum + '">' + (i + 1 < current ? '<i class="bi bi-check"></i>' : String(i + 1)) + '</div>' +
      '<div class="' + styles.stepLabel + '">' + l + '</div>' +
      (i < labels.length - 1 ? '<div class="' + styles.stepLine + '"></div>' : '') +
    '</div>'
  ).join('')
}

function showFlow(prefix: string, current: number, total: number) {
  for (let i = 1; i <= total; i++) {
    const el = document.getElementById(prefix + i)
    if (el) { el.classList.remove('active'); (el as HTMLElement).style.display = 'none' }
  }
  const a = document.getElementById(prefix + current)
  if (a) { a.classList.add('active'); (a as HTMLElement).style.display = 'block' }
}

/* ======================= MODAL CONTENT ======================= */
const IssueCardModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Type', 'Limits', 'Review', 'Done']
  const next = () => {
    if (step === 3) {
      showLoading('#issueStep3', () => { setStep(4); renderStepper('issueStepper', labels, 4); showFlow('issueStep', 4, 4) })
      return
    }
    if (step >= 4) { onClose?.(); return }
    const nextStep = step + 1
    setStep(nextStep)
    renderStepper('issueStepper', labels, nextStep)
    showFlow('issueStep', nextStep, 4)
  }
  return (
    <div>
      <div className={styles.stepper} id="issueStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="issueStep1" className={step === 1 ? 'active' : ''} style={step === 1 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Step 1: Card Type</h6>
        <div className="row g-3">
          <div className="col-6">
            <div className="p-3 border rounded text-center" style={{ cursor: 'pointer', borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' }} onClick={(e) => selectBox(e.currentTarget)}>
              <i className="bi bi-wifi fs-3 text-primary d-block mb-2" /><strong>Virtual Card</strong><br /><small className="text-muted">Instant activation</small>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3 border rounded text-center" style={{ cursor: 'pointer' }} onClick={(e) => selectBox(e.currentTarget)}>
              <i className="bi bi-credit-card fs-3 text-success d-block mb-2" /><strong>Physical Card</strong><br /><small className="text-muted">Delivery in 3-5 days</small>
            </div>
          </div>
        </div>
        <div className="mt-3"><label className={styles.formLabel}>Card Purpose / Nickname</label><input className={styles.formControl} placeholder="e.g. Employee Travel, Facebook Ads" /></div>
        <div className="mt-3"><label className={styles.formLabel}>Cardholder Name (Appears on card)</label><input className={styles.formControl} placeholder="e.g. John Doe or Marketing Dept" /></div>
      </div>
      <div id="issueStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Step 2: Initial Funding & Limits</h6>
        <div className="mb-3"><label className={styles.formLabel}>Initial Top-up Amount (KES)</label><input type="number" className={styles.formControl} defaultValue={5000} /></div>
        <div className="mb-3"><label className={styles.formLabel}>Funding Source</label><select className={styles.formControl}><option>PayMo Main Wallet (KES 240,000)</option><option>M-Pesa (0712***890)</option><option>Equity Bank</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Monthly Spending Limit (Optional)</label><input type="number" className={styles.formControl} placeholder="Leave blank for no limit" /></div>
        <div className="p-3 bg-light rounded"><div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Lock card to specific Merchant Category (MCC)</label></div></div>
      </div>
      <div id="issueStep3" style={step === 3 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Step 3: Review & Confirm</h6>
        <div className="p-3 bg-light rounded mb-3">
          <div className="d-flex justify-content-between mb-2"><span>Type</span><strong>Virtual Prepaid VISA</strong></div>
          <div className="d-flex justify-content-between mb-2"><span>Name</span><strong>Marketing Dept</strong></div>
          <div className="d-flex justify-content-between mb-2"><span>Initial Load</span><strong>KES 5,000</strong></div>
          <div className="d-flex justify-content-between mb-2"><span>Issuance Fee</span><strong>KES 150</strong></div>
          <hr className={styles.divider} />
          <div className="d-flex justify-content-between fw-bold" style={{ color: 'var(--pm-primary)' }}><span>Total Deduction</span><span>KES 5,150</span></div>
        </div>
        <label className={styles.formLabel}>Enter PIN to authorize issuance</label>
        <div className={styles.pinInput}>
          {[1,2,3,4].map(i => <input key={i} type="password" maxLength={1} onInput={(e) => moveFocus(e.target as HTMLInputElement)} />)}
        </div>
      </div>
      <div id="issueStep4" style={step === 4 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-lg"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Virtual Card Issued!</h5>
          <p style={{ color: 'var(--pm-muted)' }}>Card is active and ready for immediate use.</p>
          <div className={`${styles.creditCardUi} ${styles.bgGradientBlue} mx-auto mt-3`} style={{ maxWidth: 320, textAlign: 'left', height: 160 }}>
            <div className="d-flex justify-content-between"><div className={styles.ccLogo}>PAYMO</div><i className="bi bi-wifi text-white" /></div>
            <div className="mt-3">
              <div className={styles.ccNumber + ' mb-2'}>4123 5567 8901 2345</div>
              <div className="d-flex justify-content-between"><div className={styles.ccName}>Marketing Dept</div><div className={styles.ccExpiry}>07/28</div></div>
            </div>
          </div>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-eye" /> Show CVV</button>
            <button className={`${styles.btnPm} ${styles.btnSm}`}><i className="bi bi-clipboard" /> Copy PAN</button>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={next}>{step < 4 ? <>Continue <i className="bi bi-arrow-right" /></> : 'Finish'}</button>
      </div>
    </div>
  )
}

const TopupCardModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Details', 'Confirm', 'Done']
  const next = () => {
    if (step === 2) {
      showLoading('#topupStep2', () => { setStep(3); renderStepper('topupStepper', labels, 3); showFlow('topupStep', 3, 3) })
      return
    }
    if (step >= 3) { onClose?.(); return }
    const nextStep = step + 1
    setStep(nextStep)
    renderStepper('topupStepper', labels, nextStep)
    showFlow('topupStep', nextStep, 3)
  }
  return (
    <div>
      <div className={styles.stepper} id="topupStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="topupStep1" style={step === 1 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Top-up Details</h6>
        <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Software Subs (Bal: KES 150)</option><option>Marketing Ads (Bal: KES 14,500)</option><option>Fleet #1 (Bal: KES 22,100)</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Amount to Load (KES)</label>
          <div className={styles.amountChips + ' mb-2'}>
            <span className={styles.amountChip} onClick={(e) => pickChip(e.currentTarget, 'topupAmt', '1000')}>1,000</span>
            <span className={`${styles.amountChip} ${styles.amountChipActive}`} onClick={(e) => pickChip(e.currentTarget, 'topupAmt', '5000')}>5,000</span>
            <span className={styles.amountChip} onClick={(e) => pickChip(e.currentTarget, 'topupAmt', '10000')}>10,000</span>
          </div>
          <input type="number" id="topupAmt" className={styles.formControl} defaultValue={5000} />
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Source of Funds</label><select className={styles.formControl}><option>PayMo Wallet</option><option>M-Pesa Express</option><option>Linked Bank</option></select></div>
      </div>
      <div id="topupStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Confirm Funding</h6>
        <div className="p-3 bg-light rounded text-center mb-3">
          <div className="text-muted small">Loading Card</div>
          <div className="fw-bold fs-5" style={{ color: 'var(--pm-primary)' }}>Software Subs (...3321)</div>
          <div className="text-muted small mt-2">Amount</div>
          <div className="fw-bold fs-3" style={{ color: 'var(--pm-accent)' }}>+ KES 5,000</div>
        </div>
        <p className="text-center text-muted small">Funds will be instantly available on the card. Zero fee applies from PayMo Wallet.</p>
      </div>
      <div id="topupStep3" style={step === 3 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-lg"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Top-up Successful</h5>
          <p style={{ color: 'var(--pm-muted)' }}>KES 5,000 added to Software Subs.</p>
          <div className="p-3 bg-light rounded text-start">
            <div className="d-flex justify-content-between"><span>New Balance</span><strong>KES 5,150</strong></div>
            <div className="d-flex justify-content-between mt-2"><span>Ref</span><strong>TOP-88214</strong></div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={next}>{step < 3 ? <>Review <i className="bi bi-arrow-right" /></> : 'Done'}</button>
      </div>
    </div>
  )
}

const UnloadCardModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', marginBottom: 12 }}>Withdraw funds from a prepaid card back to your main PayMo Wallet instantly.</p>
    <div className="mb-3"><label className={styles.formLabel}>Select Card to Unload</label><select className={styles.formControl}><option>Marketing Ads (Bal: KES 14,500)</option><option>Fleet #1 (Bal: KES 22,100)</option><option>Travel Expo (Bal: KES 4,500) - FROZEN</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Amount to Unload</label><input type="number" className={styles.formControl} defaultValue={14500} /><div className="text-end mt-1"><button className="btn btn-link p-0" style={{ fontSize: 11, textDecoration: 'none' }}>Unload Max (KES 14,500)</button></div></div>
  </div>
)

const TransferModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>From Card</label><select className={styles.formControl}><option>Fleet #1 (Bal: KES 22,100)</option><option>Marketing Ads (Bal: KES 14,500)</option></select></div>
    <div className="text-center mb-2"><i className="bi bi-arrow-down fs-4 text-muted" /></div>
    <div className="mb-3"><label className={styles.formLabel}>To Card</label><select className={styles.formControl}><option>Software Subs (Bal: KES 150)</option><option>Fleet #2 (Bal: KES 3,400)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Amount</label><input type="number" className={styles.formControl} placeholder="Enter amount" /></div>
  </div>
)

const CardControlsModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Marketing Ads (...4812)</option><option>Fleet #1 (...9091)</option></select></div>
    <div className="p-3 bg-light rounded">
      <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Online Transactions</label><div className="text-muted" style={{ fontSize: 11 }}>Allow card-not-present internet purchases</div></div>
      <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label fw-bold">International Spend</label><div className="text-muted" style={{ fontSize: 11 }}>Allow non-KES cross-border transactions</div></div>
      <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Contactless (Tap-to-Pay)</label><div className="text-muted" style={{ fontSize: 11 }}>Allow physical tap limits without PIN</div></div>
      <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label fw-bold">ATM Withdrawals</label><div className="text-muted" style={{ fontSize: 11 }}>Allow cash out at ATMs</div></div>
      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label fw-bold">Subscriptions / Recurring</label><div className="text-muted" style={{ fontSize: 11 }}>Allow automated monthly billing charges</div></div>
    </div>
  </div>
)

const CardDetailModal = () => {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="text-center">
      <div className={`${styles.creditCardUi} ${styles.bgGradientBlue} mx-auto mb-4`} style={{ maxWidth: 340, textAlign: 'left', height: 180 }}>
        <div className="d-flex justify-content-between align-items-start"><div className={styles.ccLogo}>PAYMO</div><i className="bi bi-wifi text-white opacity-75 fs-5" /></div>
        <div className="mt-3">
          <div className={styles.ccNumber + ' mb-2'}>{revealed ? '4123 5567 8901 4812' : '**** **** **** 4812'}</div>
          <div className="d-flex justify-content-between">
            <div className={styles.ccName}>Marketing Dept</div>
            <div><span className={styles.ccExpiry}>07/28</span> <span className="ms-2" style={{ fontFamily: 'monospace' }}>{revealed ? '892' : '***'}</span></div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-4">
        <button className={`${styles.btnPm} ${styles.btnOutline}`} onClick={() => setRevealed(!revealed)}><i className="bi bi-eye" style={{ color: 'var(--pm-primary)' }} /> {revealed ? 'Hide Info' : 'Reveal Info'}</button>
        <button className={`${styles.btnPm} ${styles.btnOutline}`}><i className="bi bi-clipboard" style={{ color: 'var(--pm-muted)' }} /> Copy PAN</button>
      </div>
      <div className="text-start">
        <h6 style={{ fontWeight: 700, fontSize: 14 }}>Recent Activity</h6>
        <div className={styles.statusRow}><div><strong>Facebook Ads</strong><div style={{ fontSize: 11 }} className="text-muted">Today</div></div><strong>KES 12,000</strong></div>
        <div className={styles.statusRow}><div><strong>Google Workspace</strong><div style={{ fontSize: 11 }} className="text-muted">Yesterday</div></div><strong>KES 1,450</strong></div>
      </div>
    </div>
  )
}

const ViewPinModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Physical Card</label><select className={styles.formControl}><option>Fleet #1 (...9091)</option></select></div>
    <div className="d-grid gap-2">
      <button className={`${styles.btnPm} ${styles.btnOutline} justify-content-center`} onClick={() => processAction('viewPinModal', 'Check your SMS for the secure PIN link.', '')}><i className="bi bi-eye" /> Send PIN via secure SMS</button>
      <button className={`${styles.btnPm} ${styles.btnOutline} justify-content-center`} onClick={() => processAction('viewPinModal', 'PIN reset initiated. Follow instructions on email.', '')}><i className="bi bi-arrow-clockwise" /> Reset Forgotten PIN</button>
    </div>
  </div>
)

const FreezeCardModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Marketing Ads (...4812)</option><option>Travel Expo (...7762) - FROZEN</option></select></div>
    <div className="p-3 bg-light rounded mb-3">
      <div className="form-check mb-2"><input className="form-check-input" type="radio" name="blk" defaultChecked /><label className="form-check-label fw-bold" style={{ color: 'var(--pm-info)' }}>Temporary Freeze</label><div className="text-muted" style={{ fontSize: 11 }}>Card is disabled but can be unfrozen instantly anytime.</div></div>
      <hr />
      <div className="form-check mb-2"><input className="form-check-input" type="radio" name="blk" /><label className="form-check-label fw-bold" style={{ color: 'var(--pm-danger)' }}>Permanent Block (Lost/Stolen)</label><div className="text-muted" style={{ fontSize: 11 }}>Card is cancelled forever. A replacement must be ordered.</div></div>
    </div>
  </div>
)

const ReplaceCardModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Virtual Ads Card (...3321) - Expiring Soon</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Reason</label><select className={styles.formControl}><option>Expiring</option><option>Damaged</option><option>Name Change</option><option>Compromised</option></select></div>
    <div className="p-3 bg-light rounded" style={{ fontSize: 12 }}><i className="bi bi-info-circle text-primary me-1" /> For virtual cards, a new PAN will be generated instantly and the balance transferred automatically. Active subscriptions will need to be updated with the new number.</div>
  </div>
)

const AutoReloadModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Card</label><select className={styles.formControl}><option>Software Subs (...3321)</option><option>Marketing Ads (...4812)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Trigger Event</label><select className={styles.formControl}><option>When balance falls below amount</option><option>On specific day of month</option><option>Weekly on Monday</option></select></div>
    <div className="row g-2 mb-3">
      <div className="col-6"><label className={styles.formLabel}>Threshold (KES)</label><input type="number" className={styles.formControl} defaultValue={1000} /></div>
      <div className="col-6"><label className={styles.formLabel}>Load Amount (KES)</label><input type="number" className={styles.formControl} defaultValue={5000} /></div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Source Account</label><select className={styles.formControl}><option>PayMo Main Wallet</option><option>Equity Bank Auto-Debit</option></select></div>
    <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Notify me each time rule executes</label></div>
  </div>
)

const GeoBlockModal = () => (
  <div>
    <p className="text-muted small">Restrict physical card usage by region to prevent skimming fraud.</p>
    <div className="mb-3"><label className={styles.formLabel}>Apply to</label><select className={styles.formControl}><option>All Physical Fleet Cards (4)</option><option>Fleet #1 only</option></select></div>
    <div className="p-3 bg-light rounded">
      <div className="form-check mb-2"><input className="form-check-input" type="radio" name="geo" defaultChecked /><label className="form-check-label fw-bold">Kenya Only</label></div>
      <div className="form-check mb-2"><input className="form-check-input" type="radio" name="geo" /><label className="form-check-label fw-bold">East Africa Region</label></div>
      <div className="form-check mb-2"><input className="form-check-input" type="radio" name="geo" /><label className="form-check-label fw-bold">Global (No restrictions)</label></div>
      <div className="form-check"><input className="form-check-input" type="radio" name="geo" /><label className="form-check-label fw-bold">Custom Allowlist</label></div>
    </div>
  </div>
)

const MccBlockModal = () => (
  <div>
    <p className="text-muted small">Prevent card usage at specific merchant types.</p>
    <div className="mb-3"><label className={styles.formLabel}>Apply to</label><select className={styles.formControl}><option>Entire Card Program (All Cards)</option><option>Fleet Cards Only</option></select></div>
    <div className="p-3 bg-light rounded">
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Block Gambling & Casinos</label></div>
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Block Adult Content</label></div>
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Block Cryptocurrency</label></div>
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Block Alcohol & Liquor Stores</label></div>
      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Block Airlines & Travel</label></div>
    </div>
  </div>
)

const CardLimitsModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Card</label><select className={styles.formControl}><option>Fleet #1 (...9091)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Daily Spend Limit (KES)</label><input type="number" className={styles.formControl} defaultValue={10000} /></div>
    <div className="mb-3"><label className={styles.formLabel}>Monthly Spend Limit (KES)</label><input type="number" className={styles.formControl} defaultValue={150000} /></div>
    <div className="mb-3"><label className={styles.formLabel}>Per-Transaction Limit (KES)</label><input type="number" className={styles.formControl} defaultValue={5000} /></div>
    <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Decline and alert me if limit is exceeded</label></div>
  </div>
)

const BulkIssueModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Upload', 'Review', 'Done']
  const next = () => {
    if (step === 2) {
      showLoading('#bulkIssStep2', () => { setStep(3); renderStepper('bulkIssStepper', labels, 3); showFlow('bulkIssStep', 3, 3) })
      return
    }
    if (step >= 3) { onClose?.(); return }
    const nextStep = step + 1
    setStep(nextStep)
    renderStepper('bulkIssStepper', labels, nextStep)
    showFlow('bulkIssStep', nextStep, 3)
  }
  return (
    <div>
      <div className={styles.stepper} id="bulkIssStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="bulkIssStep1" style={step === 1 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Upload Employee Data</h6>
        <div className="p-4 border border-dashed rounded text-center mb-3 bg-light">
          <i className="bi bi-cloud-upload fs-1 text-muted mb-2 d-block" />
          <strong>Upload CSV or Excel</strong>
          <p className="text-muted small mt-1">Columns: Name, Email, Phone, Department, Limit</p>
          <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnOutline} mt-2`}>Select File</button>
        </div>
        <div className="text-center"><a href="#" className="text-decoration-none small" style={{ color: 'var(--pm-primary)' }}><i className="bi bi-download" /> Download CSV Template</a></div>
      </div>
      <div id="bulkIssStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Review Batch Data</h6>
        <div className="alert alert-success py-2"><i className="bi bi-check-circle me-1" /> 45 records validated successfully.</div>
        <div className="table-responsive">
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Dept</th><th>Card Type</th><th>Limit</th></tr></thead>
            <tbody>
              <tr><td>Peter Kariuki</td><td>Sales</td><td>Virtual</td><td>KES 10K</td></tr>
              <tr><td>Jane Mwangi</td><td>Ops</td><td>Physical</td><td>KES 5K</td></tr>
              <tr><td>...</td><td>...</td><td>...</td><td>...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="bulkIssStep3" style={step === 3 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-all"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Batch Issuance Started</h5>
          <p style={{ color: 'var(--pm-muted)' }}>45 cards are being generated.</p>
          <div className="p-3 bg-light rounded text-start">
            <div className="d-flex justify-content-between mb-1"><span>Virtual Cards (30)</span><span style={{ color: 'var(--pm-accent)' }}>Ready in 2 mins</span></div>
            <div className="d-flex justify-content-between"><span>Physical Cards (15)</span><span style={{ color: 'var(--pm-info)' }}>Dispatched in 48hrs</span></div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={next}>{step < 3 ? <>Continue <i className="bi bi-arrow-right" /></> : 'Done'}</button>
      </div>
    </div>
  )
}

const BulkTopupModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Select', 'Confirm', 'Done']
  const next = () => {
    if (step === 2) {
      showLoading('#bulkTopStep2', () => { setStep(3); renderStepper('bulkTopStepper', labels, 3); showFlow('bulkTopStep', 3, 3) })
      return
    }
    if (step >= 3) { onClose?.(); return }
    const nextStep = step + 1
    setStep(nextStep)
    renderStepper('bulkTopStepper', labels, nextStep)
    showFlow('bulkTopStep', nextStep, 3)
  }
  return (
    <div>
      <div className={styles.stepper} id="bulkTopStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="bulkTopStep1" style={step === 1 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Select Cards & Amounts</h6>
        <div className="mb-3"><label className={styles.formLabel}>Funding Strategy</label><select className={styles.formControl}><option>Top-up all low balance cards to KES 5,000</option><option>Top-up specific departments</option><option>Upload custom amount CSV</option></select></div>
        <div className="table-responsive">
          <table className={styles.table}>
            <thead><tr><th><input type="checkbox" defaultChecked /></th><th>Card</th><th>Current Bal</th><th>Load Amt</th></tr></thead>
            <tbody>
              <tr><td><input type="checkbox" defaultChecked /></td><td>Software Subs</td><td style={{ color: 'var(--pm-danger)' }}>KES 150</td><td><input type="number" className="form-control form-control-sm" style={{ width: '75%' }} defaultValue={4850} /></td></tr>
              <tr><td><input type="checkbox" defaultChecked /></td><td>Fleet #4</td><td style={{ color: 'var(--pm-danger)' }}>KES 200</td><td><input type="number" className="form-control form-control-sm" style={{ width: '75%' }} defaultValue={4800} /></td></tr>
            </tbody>
          </table>
        </div>
        <div className="text-end fw-bold mt-2">Total Batch Load: KES 9,650</div>
      </div>
      <div id="bulkTopStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Confirm Bulk Funding</h6>
        <div className="p-3 bg-light rounded mb-3">
          <div className="d-flex justify-content-between mb-2"><span>Total Cards</span><strong>2 Cards</strong></div>
          <div className="d-flex justify-content-between mb-2"><span>Source</span><strong>PayMo Wallet</strong></div>
          <hr className={styles.divider} />
          <div className="d-flex justify-content-between fw-bold fs-5" style={{ color: 'var(--pm-primary)' }}><span>Total Deducted</span><span>KES 9,650</span></div>
        </div>
      </div>
      <div id="bulkTopStep3" style={step === 3 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-lg"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Bulk Top-up Complete</h5>
          <p style={{ color: 'var(--pm-muted)' }}>Funds instantly available on all selected cards.</p>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={next}>{step < 3 ? <>Review <i className="bi bi-arrow-right" /></> : 'Done'}</button>
      </div>
    </div>
  )
}

const DisputeTxModal = () => (
  <div>
    <div className="p-3 bg-light rounded mb-3">
      <div className="fw-bold">Amazon AWS Cloud</div>
      <div className="text-muted small">Software Subs Card · Yesterday</div>
      <div className="fw-bold mt-1" style={{ color: 'var(--pm-danger)' }}>KES 8,400 (Declined)</div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Reason for Dispute / Review</label><select className={styles.formControl}><option>I do not recognize this merchant</option><option>Amount charged is incorrect</option><option>Subscription was cancelled</option><option>Card was lost/stolen</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Details</label><textarea className={styles.formControl} rows={3}>We cancelled our AWS trial account 3 days ago but they still attempted to charge the card.</textarea></div>
    <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--pm-danger)' }}>Freeze card temporarily while investigating</label></div>
  </div>
)

const SpendAnalyticsModal = () => {
  const [tab, setTab] = useState<'category' | 'merchant' | 'card'>('category')
  return (
    <div>
      <div className={styles.tabPills + ' mb-3'}>
        <button className={`${styles.tabPill} ${tab === 'category' ? styles.tabPillActive : ''}`} onClick={() => setTab('category')}>By Category</button>
        <button className={`${styles.tabPill} ${tab === 'merchant' ? styles.tabPillActive : ''}`} onClick={() => setTab('merchant')}>By Merchant</button>
        <button className={`${styles.tabPill} ${tab === 'card' ? styles.tabPillActive : ''}`} onClick={() => setTab('card')}>By Card</button>
      </div>
      <div className="row g-3">
        <div className="col-md-5">
          <div className="p-3 bg-light rounded h-100 text-center d-flex flex-column justify-content-center">
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'conic-gradient(var(--pm-primary) 0 45%, var(--pm-warning) 45% 70%, var(--pm-info) 70% 90%, var(--pm-accent) 90% 100%)', margin: '0 auto' }} />
            <div className="fw-bold mt-3">KES 88.2K Total Spend</div>
          </div>
        </div>
        <div className="col-md-7">
          <table className={styles.table}>
            <tbody>
              <tr><td><span className="d-inline-block rounded-circle me-2" style={{ width: 10, height: 10, background: 'var(--pm-primary)' }} /> <strong>Software & Ads</strong></td><td className="text-end">45%</td></tr>
              <tr><td><span className="d-inline-block rounded-circle me-2" style={{ width: 10, height: 10, background: 'var(--pm-warning)' }} /> <strong>Fuel & Transport</strong></td><td className="text-end">25%</td></tr>
              <tr><td><span className="d-inline-block rounded-circle me-2" style={{ width: 10, height: 10, background: 'var(--pm-info)' }} /> <strong>Travel & Hotels</strong></td><td className="text-end">20%</td></tr>
              <tr><td><span className="d-inline-block rounded-circle me-2" style={{ width: 10, height: 10, background: 'var(--pm-accent)' }} /> <strong>Other Expenses</strong></td><td className="text-end">10%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ExportReportModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Report Type</label><select className={styles.formControl}><option>Full Transaction Ledger (All Cards)</option><option>Card Balances & Status</option><option>Declined Transactions Analysis</option></select></div>
    <div className="row g-2 mb-3">
      <div className="col-6"><label className={styles.formLabel}>Start Date</label><input type="date" className={styles.formControl} defaultValue="2025-06-01" /></div>
      <div className="col-6"><label className={styles.formLabel}>End Date</label><input type="date" className={styles.formControl} defaultValue="2025-06-28" /></div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Format</label><select className={styles.formControl}><option>CSV (For Accounting/ERP)</option><option>Excel (.xlsx)</option><option>PDF Summary</option></select></div>
  </div>
)

const TxLedgerModal = () => (
  <div>
    <div className="d-flex gap-2 mb-3">
      <select className={styles.formControl} style={{ width: 'auto' }}><option>All Cards</option><option>Virtual Only</option></select>
      <select className={styles.formControl} style={{ width: 'auto' }}><option>Last 30 Days</option></select>
      <input type="text" className={styles.formControl} placeholder="Search merchant..." />
    </div>
    <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
      <table className={styles.table}>
        <thead><tr><th>Date</th><th>Card</th><th>Merchant</th><th>Amount</th><th>Status</th><th>Auth Code</th></tr></thead>
        <tbody>
          <tr><td>28 Jun 14:32</td><td>Fleet #1</td><td>Shell</td><td>KES 6,500</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td><td>AUTH-911</td></tr>
          <tr><td>28 Jun 10:15</td><td>Marketing</td><td>Facebook</td><td>KES 12,000</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td><td>AUTH-842</td></tr>
          <tr><td>27 Jun 16:20</td><td>Software</td><td>AWS</td><td>KES 8,400</td><td><span className={`${styles.badge} ${styles.badgeD}`}>Declined NSF</span></td><td>-</td></tr>
          <tr><td>27 Jun 09:10</td><td>Travel</td><td>Kenya Airways</td><td>KES 14,200</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td><td>AUTH-311</td></tr>
          <tr><td>26 Jun 18:45</td><td>Fleet #2</td><td>Carrefour</td><td>KES 1,200</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Approved</span></td><td>AUTH-102</td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const CardListModal = () => (
  <div style={{ maxHeight: 500, overflowY: 'auto' }}>
    <table className={styles.table}>
      <thead><tr><th>Name</th><th>Type</th><th>Last 4</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>Marketing Ads</td><td>Virtual</td><td>4812</td><td>KES 14,500</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`}>Manage</button></td></tr>
        <tr><td>Fleet #1 - John</td><td>Physical</td><td>9091</td><td>KES 22,100</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`}>Manage</button></td></tr>
        <tr><td>Software Subs</td><td>Virtual</td><td>3321</td><td><span className="text-danger fw-bold">KES 150</span></td><td><span className={`${styles.badge} ${styles.badgeW}`}>Low Bal</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`}>Fund</button></td></tr>
        <tr><td>Travel Expo</td><td>Physical</td><td>7762</td><td>KES 4,500</td><td><span className={`${styles.badge} ${styles.badgeI}`}>Frozen</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`}>Unfreeze</button></td></tr>
        <tr><td>Fleet #2 - Mary</td><td>Physical</td><td>1124</td><td>KES 3,400</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Active</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`}>Manage</button></td></tr>
      </tbody>
    </table>
  </div>
)

const TxReceiptModal = () => (
  <div className="text-center">
    <div className={styles.receiptIcon + ' mx-auto mb-3'} style={{ width: 56, height: 56, background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}><i className="bi bi-check-circle-fill"></i></div>
    <h3 className="fw-bold">KES 6,500</h3>
    <p className="text-muted">Shell Petrol Station</p>
    <div className="p-3 bg-light rounded text-start mt-4" style={{ fontSize: 13 }}>
      <div className="d-flex justify-content-between mb-2"><span className="text-muted">Card Used</span><strong>Fleet #1 (...9091)</strong></div>
      <div className="d-flex justify-content-between mb-2"><span className="text-muted">Date & Time</span><strong>28 Jun 2025, 14:32</strong></div>
      <div className="d-flex justify-content-between mb-2"><span className="text-muted">Auth Code</span><strong>AUTH-911244</strong></div>
      <div className="d-flex justify-content-between"><span className="text-muted">Category</span><strong>Fuel & Auto</strong></div>
    </div>
  </div>
)

const ProfileModal = () => (
  <div className="text-center">
    <div className={styles.avatar + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-gradient-blue)' }}>AK</div>
    <h5 style={{ fontWeight: 700, marginBottom: 2 }}>Alex K.</h5>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Fleet Manager · Corporate Acct</p>
    <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Role Permissions</span><br /><strong>Card Issuance (Max 50K)</strong></div></div>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Managed Cards</span><br /><strong>12 Active</strong></div></div>
    </div>
  </div>
)

const NotificationModal = () => (
  <div>
    <div className="p-2 border-bottom"><div className="fw-bold text-danger"><i className="bi bi-x-circle me-1" /> Card Declined</div><div className="small text-muted">Software Subs card declined for KES 8,400 (NSF).</div></div>
    <div className="p-2 border-bottom"><div className="fw-bold text-success"><i className="bi bi-check-circle me-1" /> Top-up Complete</div><div className="small text-muted">Marketing Ads card funded with KES 10,000.</div></div>
    <div className="p-2 border-bottom"><div className="fw-bold text-info"><i className="bi bi-info-circle me-1" /> Travel Notice</div><div className="small text-muted">Travel Expo card used outside Kenya (Dubai).</div></div>
    <div className="p-2"><div className="fw-bold text-warning"><i className="bi bi-exclamation-triangle me-1" /> Balance Alert</div><div className="small text-muted">Fleet #4 balance is below KES 500 threshold.</div></div>
  </div>
)

const HealthCheckModal = () => (
  <div className="text-center">
    <div className="mb-4"><div style={{ fontSize: 48, fontWeight: 800, color: 'var(--pm-accent)' }}>96/100</div><div className="fw-bold text-success">Excellent Security Posture</div></div>
    <div className="text-start p-3 bg-light rounded small">
      <div className="mb-2"><i className="bi bi-check-circle text-success me-1" /> All physical cards require PIN</div>
      <div className="mb-2"><i className="bi bi-check-circle text-success me-1" /> Geo-blocking active on 4 cards</div>
      <div className="mb-2"><i className="bi bi-check-circle text-success me-1" /> No compromised PANs detected</div>
      <div><i className="bi bi-exclamation-circle text-warning me-1" /> 1 card expiring within 30 days</div>
    </div>
  </div>
)

const AttentionModal = () => (
  <div>
    <div className="p-3 border-start border-4 border-danger bg-light mb-2"><div className="fw-bold">Declined Transaction</div><div className="small text-muted">Software Subs card lacked KES 8,400. <a href="#" style={{ color: 'var(--pm-primary)', textDecoration: 'none' }}>Top-up now</a></div></div>
    <div className="p-3 border-start border-4 border-warning bg-light mb-2"><div className="fw-bold">Expiring Card</div><div className="small text-muted">Virtual Ads Card expires 07/25. <a href="#" style={{ color: 'var(--pm-primary)', textDecoration: 'none' }}>Renew</a></div></div>
    <div className="p-3 border-start border-4 border-info bg-light"><div className="fw-bold">Unusual Online Spend</div><div className="small text-muted">Review KES 15,000 charge. <a href="#" style={{ color: 'var(--pm-primary)', textDecoration: 'none' }}>Review</a></div></div>
  </div>
)



function PrepaidCardManagementModals({ active, onClose, onOpen }: PrepaidCardManagementModalsProps) {
  const modalContent: Record<string, React.ReactNode> = {
    issueCardModal: <IssueCardModal onClose={onClose} />,
    topupCardModal: <TopupCardModal onClose={onClose} />,
    unloadCardModal: <UnloadCardModal />,
    transferModal: <TransferModal />,
    cardControlsModal: <CardControlsModal />,
    cardDetailModal: <CardDetailModal />,
    viewPinModal: <ViewPinModal />,
    freezeCardModal: <FreezeCardModal />,
    replaceCardModal: <ReplaceCardModal />,
    autoReloadModal: <AutoReloadModal />,
    geoBlockModal: <GeoBlockModal />,
    mccBlockModal: <MccBlockModal />,
    cardLimitsModal: <CardLimitsModal />,
    bulkIssueModal: <BulkIssueModal onClose={onClose} />,
    bulkTopupModal: <BulkTopupModal onClose={onClose} />,
    disputeTxModal: <DisputeTxModal />,
    spendAnalyticsModal: <SpendAnalyticsModal />,
    exportReportModal: <ExportReportModal />,
    txLedgerModal: <TxLedgerModal />,
    cardListModal: <CardListModal />,
    txReceiptModal: <TxReceiptModal />,
    profileModal: <ProfileModal />,
    notificationModal: <NotificationModal />,
    healthCheckModal: <HealthCheckModal />,
    attentionModal: <AttentionModal />,
  }
  const modalTitles: Record<string, string> = {
    issueCardModal: 'Issue New Prepaid Card',
    topupCardModal: 'Fund Prepaid Card',
    unloadCardModal: 'Unload Funds from Card',
    transferModal: 'Transfer Card to Card',
    cardControlsModal: 'Card Controls & Toggles',
    cardDetailModal: 'Card Details',
    viewPinModal: 'Manage PIN',
    freezeCardModal: 'Freeze or Block Card',
    replaceCardModal: 'Replace Card',
    autoReloadModal: 'Set Auto-Reload Rule',
    geoBlockModal: 'Geographic Blocking',
    mccBlockModal: 'Merchant Category Blocks',
    cardLimitsModal: 'Set Spending Limits',
    bulkIssueModal: 'Bulk Issue Cards (Corporate)',
    bulkTopupModal: 'Bulk Fund Cards',
    disputeTxModal: 'Dispute Transaction',
    spendAnalyticsModal: 'Spend Analytics',
    exportReportModal: 'Export Card Reports',
    txLedgerModal: 'Full Transaction Ledger',
    cardListModal: 'All Issued Cards',
    txReceiptModal: 'Transaction Receipt',
    profileModal: 'User Profile',
    notificationModal: 'Notifications',
    healthCheckModal: 'Card Program Health',
    attentionModal: 'Attention Required',
  }

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

export default PrepaidCardManagementModals
