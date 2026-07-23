import { useState } from 'react'
import styles from '../styles/card-program-administration.module.css'

interface CardProgramAdministrationModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
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

const HealthCheckModal = ({ onClose }: { onClose?: () => void }) => (
  <div>
    <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 600 }}>Mastercard Gateway</span><span className={styles.badge + ' ' + styles.badgeS}>100% Uptime</span></div>
    <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 600 }}>Visa Gateway</span><span className={styles.badge + ' ' + styles.badgeS}>100% Uptime</span></div>
    <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 600 }}>Core Ledger Sync</span><span className={styles.badge + ' ' + styles.badgeS}>Syncing (4ms lag)</span></div>
    <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 600 }}>KYC/AML Oracle</span><span className={styles.badge + ' ' + styles.badgeW}>Degraded (1.2s delay)</span></div>
    <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 600 }}>Settlement Accounts</span><span className={styles.badge + ' ' + styles.badgeS}>Funded</span></div>
    <hr />
    <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Last automated check: 2 minutes ago. All issuing endpoints are active and accepting payload requests.</p>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('healthCheckModal', 'Health diagnostics exported!', 'HC-9921')}>Download Report</button>
    </div>
  </div>
)

const CardholderSearchModal = ({ onClose }: { onClose?: () => void }) => {
  const [showResult, setShowResult] = useState(false)
  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <input type="text" className={styles.formControl} placeholder="Enter Name, Email, Phone, or Last 4 PAN" />
        <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => setShowResult(true)}>Search</button>
      </div>
      {showResult && (
        <div className="table-responsive">
          <table className={styles.tablePm}>
            <thead><tr><th>User / Entity</th><th>Card PAN</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>James Kamau (TechCorp)</td><td><code>4410 **** 4421</code></td><td>Virtual</td><td><span className={styles.badge + ' ' + styles.badgeS}>Active</span></td><td><button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => { onClose?.(); setTimeout(() => onOpen('cardholderDetailModal'), 150) }}>View</button></td></tr>
              <tr><td>Amina Hassan</td><td><code>5529 **** 8812</code></td><td>Physical</td><td><span className={styles.badge + ' ' + styles.badgeD}>Frozen</span></td><td><button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => { onClose?.(); setTimeout(() => onOpen('cardholderDetailModal'), 150) }}>View</button></td></tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="d-flex justify-content-end mt-3">
        <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  )
}

const CardholderDetailModal = ({ onClose, onOpen }: { onClose?: () => void; onOpen: (id: string) => void }) => {
  const [tab, setTab] = useState<'cards' | 'txns' | 'limits'>('cards')
  return (
    <div>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="p-3 border rounded h-100">
            <div className={styles.avatar + ' mb-3'} style={{ width: 48, height: 48, fontSize: 18 }}>JK</div>
            <h6 style={{ fontWeight: 700, margin: 0 }}>James Kamau</h6>
            <p style={{ fontSize: 12, color: 'var(--pm-muted)', marginBottom: 12 }}>james@techcorp.co.ke | +254 712 345 678</p>
            <div className="mb-2"><span className={styles.badge + ' ' + styles.badgeS}>KYC Verified</span></div>
            <div style={{ fontSize: 12 }}><strong>Program:</strong> Corporate Expense (BIN 441011)</div>
            <div style={{ fontSize: 12 }}><strong>Linked Wallet:</strong> WAL-882193</div>
          </div>
        </div>
        <div className="col-md-8">
          <div className={styles.tabPills + ' mb-3'}>
            <button className={`${styles.tabPill} ${tab === 'cards' ? styles.tabPillActive : ''}`} onClick={() => setTab('cards')}>Active Cards</button>
            <button className={`${styles.tabPill} ${tab === 'txns' ? styles.tabPillActive : ''}`} onClick={() => setTab('txns')}>Transactions</button>
            <button className={`${styles.tabPill} ${tab === 'limits' ? styles.tabPillActive : ''}`} onClick={() => setTab('limits')}>Limits</button>
          </div>
          {tab === 'cards' && (
            <div>
              <div className={styles.cardReplica + ' ' + styles.cardReplicaDark + ' mb-3'}>
                <div className="d-flex justify-content-between"><span><i className="bi bi-building"></i> TechCorp Expense</span><i className="bi bi-wifi"></i></div>
                <h4 style={{ fontFamily: 'monospace', letterSpacing: 2, margin: '20px 0' }}>4410 11** **** 4421</h4>
                <div className="d-flex justify-content-between" style={{ fontSize: 12 }}><span>JAMES KAMAU</span><span>12/28</span></div>
              </div>
              <div className="d-flex gap-2">
                <button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmD} onClick={() => onOpen('forceFreezeModal')}><i className="bi bi-snow"></i> Force Freeze</button>
                <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => onOpen('resetPinModal')}><i className="bi bi-key"></i> Reset PIN</button>
                <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => onOpen('replaceCardModal')}><i className="bi bi-arrow-repeat"></i> Replace</button>
              </div>
            </div>
          )}
          {tab === 'txns' && <div style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Last 30 days: 142 transactions totaling KES 284,500.</div>}
          {tab === 'limits' && <div style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Daily: KES 100,000 · Monthly: KES 1,000,000 · Single TXN: KES 50,000</div>}
        </div>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  )
}

const ForceFreezeModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>You are about to place an administrative block on card <strong>*4421</strong> for James Kamau. The cardholder will not be able to unblock this themselves.</p>
    <div className="mb-3"><label className={styles.formLabel}>Reason Code</label><select className={styles.formControl}><option>Suspected Fraud (Permanent)</option><option>AML Investigation (Temporary)</option><option>Corporate Policy Breach (Temporary)</option><option>Lost / Stolen (Permanent)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Operator Notes</label><textarea className={styles.formControl} rows={3}>Multiple high-velocity transactions flagged in foreign jurisdiction.</textarea></div>
    <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>Send email notification to cardholder</label></div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmD} onClick={() => processAction('forceFreezeModal', 'Card frozen successfully. Status updated to blocked.', '')}>Apply Freeze</button>
    </div>
  </div>
)

const ResetPinModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Initiate a secure PIN reset for card <strong>*4421</strong>. A secure link and OTP will be dispatched to the cardholder's verified contact methods.</p>
    <div className="mb-3"><label className={styles.formLabel}>Delivery Channel</label><select className={styles.formControl}><option>Email (ja***@techcorp.co.ke)</option><option>SMS (+254 712 *** 678)</option><option>Both</option></select></div>
    <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-shield-lock me-1"></i> Operator cannot set the PIN directly. The cardholder must use the portal to define a new PIN.</div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('resetPinModal', 'PIN reset instructions sent to cardholder.', '')}>Send Instructions</button>
    </div>
  </div>
)

const ReplaceCardModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Card to Replace</label><input type="text" className={styles.formControl} value="*4421 (James Kamau)" disabled /></div>
    <div className="mb-3"><label className={styles.formLabel}>Reason</label><select className={styles.formControl}><option>Lost / Stolen</option><option>Damaged / Unreadable</option><option>Compromised / Fraud</option><option>Name Change</option></select></div>
    <div className="form-check mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Block old card immediately</label></div>
    <div className="form-check mb-3"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Migrate balance & recurring limits</label></div>
    <div className="mb-3"><label className={styles.formLabel}>Replacement Fee</label><select className={styles.formControl}><option>Waive Fee (Operator Override)</option><option>Charge Standard Fee (KES 500)</option></select></div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('replaceCardModal', 'Replacement issued. New virtual PAN generated instantly.', '')}>Process Replacement</button>
    </div>
  </div>
)

const BinConfigModal = () => {
  const [tab, setTab] = useState<'general' | 'auth' | 'settlement'>('general')
  return (
    <div>
      <div className={styles.tabPills + ' mb-3'}>
        <button className={`${styles.tabPill} ${tab === 'general' ? styles.tabPillActive : ''}`} onClick={() => setTab('general')}>General</button>
        <button className={`${styles.tabPill} ${tab === 'auth' ? styles.tabPillActive : ''}`} onClick={() => setTab('auth')}>Auth Rules</button>
        <button className={`${styles.tabPill} ${tab === 'settlement' ? styles.tabPillActive : ''}`} onClick={() => setTab('settlement')}>Settlement</button>
      </div>
      {tab === 'general' && (
        <div className="row g-3">
          <div className="col-md-6"><label className={styles.formLabel}>BIN / IIN</label><input type="text" className={styles.formControl} value="4410 11**" disabled /></div>
          <div className="col-md-6"><label className={styles.formLabel}>Program Name</label><input type="text" className={styles.formControl} value="Corporate Expense" /></div>
          <div className="col-md-6"><label className={styles.formLabel}>Card Type</label><select className={styles.formControl} disabled><option>Virtual Credit</option></select></div>
          <div className="col-md-6"><label className={styles.formLabel}>Base Currency</label><select className={styles.formControl}><option>KES</option><option>USD</option></select></div>
        </div>
      )}
      {tab === 'auth' && (
        <div>
          <div className="form-check form-switch mb-3"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label">Require 3D Secure for online txns</label></div>
          <div className="form-check form-switch mb-3"><input type="checkbox" className="form-check-input" /><label className="form-check-label">Allow ATM Withdrawals (PIN required)</label></div>
          <div className="form-check form-switch mb-3"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label">Allow Cross-Border (International)</label></div>
          <div className="mb-3"><label className={styles.formLabel}>Max Card Balance (KES)</label><input type="text" className={styles.formControl} value="500,000" /></div>
        </div>
      )}
      {tab === 'settlement' && (
        <div>
          <div className="mb-3"><label className={styles.formLabel}>Settlement Account</label><select className={styles.formControl}><option>BIN 441011 — KES 4,250,000</option></select></div>
          <div className="mb-3"><label className={styles.formLabel}>Settlement Cycle</label><select className={styles.formControl}><option>T+1 (Next Business Day)</option><option>T+2</option></select></div>
        </div>
      )}
      <div className="d-flex justify-content-between mt-3">
        <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
        <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('binConfigModal', 'BIN configuration updated and pushed to gateway.', '')}>Save Changes</button>
      </div>
    </div>
  )
}

const AddBinModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Program Name</label><input type="text" className={styles.formControl} placeholder="e.g. Employee Benefits Prepard" /></div>
    <div className="mb-3"><label className={styles.formLabel}>Network</label><select className={styles.formControl}><option>Visa</option><option>Mastercard</option><option>UnionPay</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Form Factor</label><select className={styles.formControl}><option>Virtual Only</option><option>Physical Only</option><option>Virtual + Physical Companion</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Funding Model</label><select className={styles.formControl}><option>Prepaid (Cardholder funded)</option><option>Prepaid (Corporate funded)</option><option>Credit (Issuer ledger)</option></select></div>
    <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1"></i> New BIN requests are subject to network SLA (approx 2-4 weeks setup).</div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmA} onClick={() => processAction('addBinModal', 'BIN Request submitted to network. Ticket BIN-9921 created.', 'BIN-9921')}>Submit Request</button>
    </div>
  </div>
)

const IssueBatchModal = () => {
  const [step, setStep] = useState(1)
  const labels = ['Program', 'Upload', 'Validate', 'Done']
  const next = () => {
    if (step === 3) {
      showLoading('#issueBatchModal .modal-body', () => { setStep(4); renderStepper('batchStepper', labels, 4); showFlow('batchStep', 4, 4) })
      return
    }
    if (step >= 4) { onClose?.(); return }
    const ns = step + 1
    setStep(ns)
    renderStepper('batchStepper', labels, ns)
    showFlow('batchStep', ns, 4)
  }
  return (
    <div>
      <div className={styles.stepper} id="batchStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="batchStep1" style={step === 1 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700 }}>Step 1: Select Program</h6>
        <div className="mb-3"><label className={styles.formLabel}>BIN Program</label><select className={styles.formControl}><option>Corporate Expense (441011)</option><option>Standard Retail (552900)</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Card Format</label><select className={styles.formControl}><option>Virtual Cards (Instant issue)</option><option>Physical Cards (Requires printing & dispatch)</option></select></div>
      </div>
      <div id="batchStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700 }}>Step 2: Upload Data</h6>
        <div className="p-4 border rounded text-center mb-3" style={{ borderStyle: 'dashed', background: 'var(--pm-surface-2)' }}>
          <i className="bi bi-file-earmark-spreadsheet text-muted mb-2 d-block" style={{ fontSize: 32 }}></i>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Upload CSV or Excel File</div>
          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Columns required: FirstName, LastName, Phone, Email, ID Number, InitLimit</div>
          <input type="file" className="mt-3 form-control-sm w-50 mx-auto" />
        </div>
        <div className="d-flex justify-content-center"><button className={styles.btnPm + ' ' + styles.btnSm}><i className="bi bi-download"></i> Download Template</button></div>
      </div>
      <div id="batchStep3" style={step === 3 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700 }}>Step 3: Validation & Preview</h6>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', color: '#047857', fontSize: 13 }}><i className="bi bi-check-circle me-1"></i> Data validated successfully. No errors found.</div>
        <div className="table-responsive">
          <table className={styles.tablePm}>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>John Doe</td><td>john@corp.co.ke</td><td>+254 712 000 001</td><td><span className={styles.badge + ' ' + styles.badgeS}>Ready</span></td></tr>
              <tr><td>Jane Smith</td><td>jane@corp.co.ke</td><td>+254 712 000 002</td><td><span className={styles.badge + ' ' + styles.badgeS}>Ready</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="batchStep4" style={step === 4 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-lg"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Batch Issued</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>250 virtual cards pushed to production. PANs assigned.</p>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={next}>{step < 3 ? <>Continue <i className="bi bi-arrow-right" /></> : step === 3 ? <>Submit Batch <i className="bi bi-check2" /></> : 'Finish'}</button>
      </div>
    </div>
  )
}

const ApproveBatchModal = () => (
  <div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
      <div className="d-flex justify-content-between mb-1"><span className="text-muted">Batch ID</span><strong>#8892</strong></div>
      <div className="d-flex justify-content-between mb-1"><span className="text-muted">Program</span><strong>Corporate Expense</strong></div>
      <div className="d-flex justify-content-between mb-1"><span className="text-muted">Card Count</span><strong>250 Virtual</strong></div>
      <div className="d-flex justify-content-between"><span className="text-muted">Submitted By</span><strong>John Doe (Admin)</strong></div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Approval Action</label><select className={styles.formControl}><option>Approve & Push to Production</option><option>Reject & Return to Maker</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Approver PIN / Password</label><input type="password" className={styles.formControl} placeholder="Verify identity" /></div>
    <div className="d-flex justify-content-between">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmA} onClick={() => processAction('approveBatchModal', 'Batch #8892 approved. Issuance engine processing...', 'BAT-8892')}>Confirm Action</button>
    </div>
  </div>
)

const BatchStatusModal = () => (
  <div>
    <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12, fontWeight: 600 }}><span>Progress: 40% Completed</span><span>60 / 150 Cards</span></div>
    <div className={styles.progress + ' mb-4'}><div className={styles.progressBar} style={{ width: '40%', background: 'var(--pm-primary)' }} /></div>
    <ul style={{ fontSize: 13, lineHeight: 2, color: 'var(--pm-ink-soft)', paddingLeft: 16 }}>
      <li style={{ color: 'var(--pm-accent)', fontWeight: 600 }}>Data Validation (Done)</li>
      <li style={{ color: 'var(--pm-accent)', fontWeight: 600 }}>Compliance & KYC Check (Done)</li>
      <li style={{ color: 'var(--pm-primary)', fontWeight: 600 }}>PAN Generation (In Progress)</li>
      <li>Personalization & Printing (Pending)</li>
      <li>Dispatch (Pending)</li>
    </ul>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm + ' ' + styles.btnPmD}>Halt Batch</button>
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
    </div>
  </div>
)

const VelocityLimitsModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Program BIN</label><select className={styles.formControl}><option>Corporate Expense (441011)</option><option>Standard Retail (552900)</option></select></div>
    <div className="row g-3">
      <div className="col-md-6"><label className={styles.formLabel}>Daily Spend Limit (KES)</label><input type="text" className={styles.formControl} value="100,000" /></div>
      <div className="col-md-6"><label className={styles.formLabel}>Daily TXN Count Limit</label><input type="text" className={styles.formControl} value="20" /></div>
      <div className="col-md-6"><label className={styles.formLabel}>Monthly Spend Limit (KES)</label><input type="text" className={styles.formControl} value="1,000,000" /></div>
      <div className="col-md-6"><label className={styles.formLabel}>Max Single TXN Amount (KES)</label><input type="text" className={styles.formControl} value="50,000" /></div>
    </div>
    <hr className="pm-divider" />
    <div className="form-check form-switch mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Block transactions if velocity limit breached</label></div>
    <div className="form-check form-switch"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Send email alert to BaaS admin on breach</label></div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('velocityLimitsModal', 'Velocity limits updated and pushed to auth gateway.', '')}>Save Limits</button>
    </div>
  </div>
)

const FeeScheduleModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Select Program</label><select className={styles.formControl}><option>Corporate Expense (441011)</option></select></div>
    <div className="table-responsive">
      <table className={styles.tablePm}>
        <thead><tr><th>Fee Type</th><th>Amount / Percentage</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Card Issuance (Physical)</td><td><input type="text" className={styles.formControl} value="KES 500" style={{ width: 120 }} /></td><td><span className={styles.badge + ' ' + styles.badgeS}>Active</span></td></tr>
          <tr><td>Monthly Maintenance</td><td><input type="text" className={styles.formControl} value="KES 0" style={{ width: 120 }} /></td><td><span className={styles.badge + ' ' + styles.badgeOutline}>Inactive</span></td></tr>
          <tr><td>ATM Withdrawal (Local)</td><td><input type="text" className={styles.formControl} value="KES 35" style={{ width: 120 }} /></td><td><span className={styles.badge + ' ' + styles.badgeS}>Active</span></td></tr>
          <tr><td>Cross-Border FX Markup</td><td><input type="text" className={styles.formControl} value="2.5%" style={{ width: 120 }} /></td><td><span className={styles.badge + ' ' + styles.badgeS}>Active</span></td></tr>
          <tr><td>Replacement Fee</td><td><input type="text" className={styles.formControl} value="KES 500" style={{ width: 120 }} /></td><td><span className={styles.badge + ' ' + styles.badgeS}>Active</span></td></tr>
        </tbody>
      </table>
    </div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('feeScheduleModal', 'Fee table updated. Will apply to next billing cycle.', '')}>Update Fee Table</button>
    </div>
  </div>
)

const MccBlocklistModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Select Merchant Category Codes (MCC) to decline across all cards in the program.</p>
    <div className="mb-3"><label className={styles.formLabel}>Program</label><select className={styles.formControl}><option>Corporate Expense</option></select></div>
    <div className="form-check mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>7995 - Betting, Casino & Gambling</label></div>
    <div className="form-check mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>6051 - Crypto / Non-FI Fiat</label></div>
    <div className="form-check mb-2"><input type="checkbox" className="form-check-input" /><label className="form-check-label" style={{ fontSize: 13 }}>5921 - Liquor Stores</label></div>
    <div className="form-check mb-2"><input type="checkbox" className="form-check-input" /><label className="form-check-label" style={{ fontSize: 13 }}>5814 - Fast Food Restaurants</label></div>
    <div className="form-check mb-2"><input type="checkbox" className="form-check-input" /><label className="form-check-label" style={{ fontSize: 13 }}>7273 - Dating & Escort Services</label></div>
    <div className="mt-3"><label className={styles.formLabel}>Add Custom MCC</label><div className="d-flex gap-2"><input type="text" className={styles.formControl} placeholder="e.g. 5411" /><button className={styles.btnPm}>Add</button></div></div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('mccBlocklistModal', 'MCC rules synced to authorization engine.', '')}>Save Rules</button>
    </div>
  </div>
)

const AmlReviewModal = () => (
  <div>
    <div className={styles.statusRow}>
      <div>
        <span className={styles.badge + ' ' + styles.badgeD + ' mb-1'}>High Risk</span><br />
        <strong>Card *4421 (James Kamau)</strong>
        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Suspicious geo-velocity: Nairobi -&gt; Dubai in 30 mins</div>
      </div>
      <div className="text-end">
        <strong>$850.00 Auth Hold</strong>
        <div className="mt-1 d-flex gap-1">
          <button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmD} onClick={() => processAction('amlReviewModal', 'Card blocked pending investigation.', '')}>Block Card</button>
          <button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmA} onClick={() => processAction('amlReviewModal', 'Alert cleared. Transaction approved.', '')}>Clear Alert</button>
        </div>
      </div>
    </div>
    <div className={styles.statusRow}>
      <div>
        <span className={styles.badge + ' ' + styles.badgeW + ' mb-1'}>Med Risk</span><br />
        <strong>Card *1102 (TechCorp Marketing)</strong>
        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Pattern deviation: 15 micro-transactions in 2 hours</div>
      </div>
      <div className="text-end">
        <strong>Facebook Ads</strong>
        <div className="mt-1 d-flex gap-1">
          <button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmD}>Block Card</button>
          <button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmA}>Clear Alert</button>
        </div>
      </div>
    </div>
    <div className="d-flex justify-content-end mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
    </div>
  </div>
)

const DisputeResolutionModal = () => {
  const [tab, setTab] = useState<'pending' | 'representment' | 'closed'>('pending')
  return (
    <div>
      <div className={styles.tabPills + ' mb-3'}>
        <button className={`${styles.tabPill} ${tab === 'pending' ? styles.tabPillActive : ''}`} onClick={() => setTab('pending')}>Pending Action</button>
        <button className={`${styles.tabPill} ${tab === 'representment' ? styles.tabPillActive : ''}`} onClick={() => setTab('representment')}>Representment</button>
        <button className={`${styles.tabPill} ${tab === 'closed' ? styles.tabPillActive : ''}`} onClick={() => setTab('closed')}>Closed</button>
      </div>
      <div className="table-responsive">
        <table className={styles.tablePm}>
          <thead><tr><th>Case ID</th><th>Cardholder</th><th>Amount</th><th>Reason Code</th><th>Deadline</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td>CB-1192</td><td>Sarah Jenkins</td><td>$45.00</td><td>Fraud (Not Authorized)</td><td>2 Days</td><td><button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmP} onClick={() => processAction('disputeResolutionModal', 'Chargeback accepted. Account credited.', 'CB-1192')}>Review</button></td></tr>
            <tr><td>CB-1188</td><td>Peter Omondi</td><td>KES 12,500</td><td>Services Not Rendered</td><td>5 Days</td><td><button className={styles.btnPm + ' ' + styles.btnSm + ' ' + styles.btnPmP}>Review</button></td></tr>
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  )
}

const SettlementDetailsModal = () => (
  <div>
    <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface-2)' }}>
      <div style={{ fontSize: 12, color: 'var(--pm-muted)', fontWeight: 600 }}>AVAILABLE FUNDING BALANCE</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--pm-primary)', margin: '8px 0' }}>KES 4,250,000</div>
      <div style={{ fontSize: 12, color: 'var(--pm-danger)' }}><i className="bi bi-exclamation-triangle"></i> Below target threshold (KES 5M)</div>
    </div>
    <div className="mb-3"><label className={styles.formLabel}>Top-Up Settlement Account</label><select className={styles.formControl}><option>Transfer from Main Treasury (Acc *8812)</option><option>Wire Transfer Instructions (PDF)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Amount (KES)</label><input type="text" className={styles.formControl} value="5,000,000" /></div>
    <div className="d-flex justify-content-between">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('settlementDetailsModal', 'Settlement account topped up successfully.', '')}>Initiate Transfer</button>
    </div>
  </div>
)

const GeoFencingModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Program</label><select className={styles.formControl}><option>Corporate Expense</option></select></div>
    <div className="row g-3">
      <div className="col-md-6">
        <div className="p-3 border rounded">
          <div className="form-check form-switch mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontWeight: 600 }}>East Africa Only Mode</label></div>
          <p style={{ fontSize: 11, color: 'var(--pm-muted)', margin: 0 }}>Restrict physical transactions to Kenya, Uganda, Tanzania, Rwanda.</p>
        </div>
      </div>
      <div className="col-md-6">
        <div className="p-3 border rounded">
          <div className="form-check form-switch mb-2"><input type="checkbox" className="form-check-input" /><label className="form-check-label" style={{ fontWeight: 600 }}>High-Risk Jurisdiction Block</label></div>
          <p style={{ fontSize: 11, color: 'var(--pm-muted)', margin: 0 }}>Auto-decline CNP & POS transactions from FATF high-risk countries.</p>
        </div>
      </div>
    </div>
    <div className="mt-3"><label className={styles.formLabel}>Whitelist Specific Countries</label><input type="text" className={styles.formControl} placeholder="e.g. United States, United Kingdom" /></div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('geoFencingModal', 'Geo-fencing rules applied to program BIN.', '')}>Save Rules</button>
    </div>
  </div>
)

const ExportReportModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Type', 'Range', 'Ready']
  const next = () => {
    if (step === 2) { showLoading('#exportReportModal .modal-body', () => { setStep(3); renderStepper('exportStepper', labels, 3); showFlow('exportStep', 3, 3) }); return }
    if (step >= 3) { onClose?.(); return }
    const ns = step + 1
    setStep(ns)
    renderStepper('exportStepper', labels, ns)
    showFlow('exportStep', ns, 3)
  }
  return (
    <div>
      <div className={styles.stepper} id="exportStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="exportStep1" style={step === 1 ? {} : { display: 'none' }}>
        <div className="mb-3"><label className={styles.formLabel}>Report Type</label><select className={styles.formControl}><option>Settlement Reconciliation</option><option>Card Issuance Ledger</option><option>Fraud & Dispute Log</option><option>Interchange Revenue Statement</option></select></div>
      </div>
      <div id="exportStep2" style={step === 2 ? {} : { display: 'none' }}>
        <div className="row g-3 mb-3">
          <div className="col-6"><label className={styles.formLabel}>From</label><input type="date" className={styles.formControl} defaultValue="2025-06-01" /></div>
          <div className="col-6"><label className={styles.formLabel}>To</label><input type="date" className={styles.formControl} defaultValue="2025-06-27" /></div>
        </div>
        <div className="mb-3"><label className={styles.formLabel}>Format</label><select className={styles.formControl}><option>CSV</option><option>Excel</option><option>PDF</option></select></div>
      </div>
      <div id="exportStep3" style={step === 3 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-lg"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Report Ready</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your report has been compiled and is ready for download.</p>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={next}>{step < 2 ? <>Continue <i className="bi bi-arrow-right" /></> : step === 2 ? <>Generate <i className="bi bi-download" /></> : 'Finish'}</button>
      </div>
    </div>
  )
}

const WebhookSettingsModal = () => (
  <div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 12, color: 'var(--pm-danger)' }}><i className="bi bi-exclamation-triangle me-1"></i> System detected 3 delivery failures to endpoint <code>https://api.techcorp.com/v1/cards/webhook</code>.</div>
    <div className="mb-3"><label className={styles.formLabel}>Webhook URL</label><input type="text" className={styles.formControl} value="https://api.techcorp.com/v1/cards/webhook" /></div>
    <div className="mb-3"><label className={styles.formLabel}>Signing Secret</label><div className="d-flex gap-2"><input type="password" className={styles.formControl} value="whsec_1234567890abcdef" disabled /><button className={styles.btnPm + ' ' + styles.btnSm}>Reveal</button><button className={styles.btnPm + ' ' + styles.btnSm}>Rotate</button></div></div>
    <label className={styles.formLabel}>Subscribed Events</label>
    <div className="row g-2">
      <div className="col-md-6">
        <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>card.created</label></div>
        <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>card.status_changed</label></div>
      </div>
      <div className="col-md-6">
        <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>transaction.authorized</label></div>
        <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>transaction.declined</label></div>
      </div>
    </div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('webhookSettingsModal', 'Webhook configuration saved.', '')}>Save Settings</button>
    </div>
  </div>
)

const InboxModal = () => (
  <div>
    <div className={styles.statusRow}>
      <div><span className={styles.badge + ' ' + styles.badgeI + ' mb-1'}>System</span><br /><strong>Visa Gateway Maintenance Notice</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Scheduled downtime on 30 Jun 02:00 EAT</div></div>
      <button className={styles.btnPm + ' ' + styles.btnSm}>Read</button>
    </div>
    <div className={styles.statusRow}>
      <div><span className={styles.badge + ' ' + styles.badgeW + ' mb-1'}>Compliance</span><br /><strong>Updated AML Guidelines Q3 2025</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>New reporting requirements for cross-border TXNs</div></div>
      <button className={styles.btnPm + ' ' + styles.btnSm}>Read</button>
    </div>
    <div className="d-flex justify-content-end mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
    </div>
  </div>
)

const NotificationsModal = () => (
  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
    <div className="p-3 border rounded mb-2" style={{ borderLeft: '3px solid var(--pm-danger)', fontSize: 13 }}><strong>Velocity Breach</strong> — Corporate Card *9921 hit daily limit.<div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>10 mins ago</div></div>
    <div className="p-3 border rounded mb-2" style={{ borderLeft: '3px solid var(--pm-info)', fontSize: 13 }}><strong>Batch Processed</strong> — Batch #8890 successfully issued 500 virtual cards.<div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>1 hour ago</div></div>
    <div className="p-3 border rounded mb-2" style={{ borderLeft: '3px solid var(--pm-warning)', fontSize: 13 }}><strong>Low Settlement Balance</strong> — Corporate BIN dropping below threshold.<div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>2 hours ago</div></div>
    <div className="d-flex justify-content-end mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
    </div>
  </div>
)

const ProfileModal = ({ onOpen }: { onOpen: (id: string) => void }) => (
  <div className="text-center">
    <div className={styles.avatar + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-gradient-slate)' }}>AO</div>
    <h5 style={{ fontWeight: 700, marginBottom: 2 }}>Amina O.</h5>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>admin@techcorp.co.ke · Super Admin</p>
    <div className="p-3 rounded mt-3 text-start" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
      <div className="d-flex justify-content-between mb-2"><span>2FA Status</span><span className={styles.badge + ' ' + styles.badgeS}>Enabled</span></div>
      <div className="d-flex justify-content-between mb-2"><span>Last Login</span><strong>Today, 08:14 EAT</strong></div>
      <div className="d-flex justify-content-between"><span>Access Level</span><strong>Level 4 (BIN Admin)</strong></div>
    </div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} onClick={() => onOpen('notificationPrefsModal')}>Preferences</button>
      <button className={styles.btnPm} data-bs-dismiss="modal">Close</button>
    </div>
  </div>
)

const NotificationPrefsModal = () => (
  <div>
    <div className="form-check form-switch mb-3"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label">Email alerts for AML / Fraud flags</label></div>
    <div className="form-check form-switch mb-3"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label">Email alerts for Low Settlement Balance</label></div>
    <div className="form-check form-switch mb-3"><input type="checkbox" className="form-check-input" /><label className="form-check-label">Daily summary report email</label></div>
    <div className="d-flex justify-content-between mt-3">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmP} onClick={() => processAction('notificationPrefsModal', 'Preferences saved.', '')}>Save</button>
    </div>
  </div>
)

const SuspendProgramModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-danger)', fontWeight: 600 }}>WARNING: Suspending a BIN will immediately decline all authorizations for all cards under this program.</p>
    <div className="mb-3"><label className={styles.formLabel}>Program to Suspend</label><select className={styles.formControl}><option>Corporate Expense (441011)</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Type YES to confirm</label><input type="text" className={styles.formControl} /></div>
    <div className="d-flex justify-content-between">
      <button className={styles.btnPm} data-bs-dismiss="modal">Cancel</button>
      <button className={styles.btnPm + ' ' + styles.btnPmD} onClick={() => processAction('suspendProgramModal', 'Program suspended. All authorizations currently blocked.', '')}>Suspend Program</button>
    </div>
  </div>
)

export default function CardProgramAdministrationModals({ active, onClose, onOpen }: CardProgramAdministrationModalsProps) {
  return (
    <>
      {active === 'healthCheckModal' && <div className="modal fade show" id="healthCheckModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-heart-pulse text-danger me-2"></i>Platform Health Check</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><HealthCheckModal onClose={onClose} /></div></div></div></div>}
      {active === 'cardholderSearchModal' && <div className="modal fade show" id="cardholderSearchModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-search text-primary me-2"></i>Find Cardholder</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><CardholderSearchModal onClose={onClose} onOpen={onOpen} /></div></div></div></div>}
      {active === 'cardholderDetailModal' && <div className="modal fade show" id="cardholderDetailModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-xl modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-person-vcard text-info me-2"></i>Cardholder Profile</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><CardholderDetailModal onClose={onClose} onOpen={onOpen} /></div></div></div></div>}
      {active === 'forceFreezeModal' && <div className="modal fade show" id="forceFreezeModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-snow text-danger me-2"></i>Force Freeze Card</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><ForceFreezeModal /></div></div></div></div>}
      {active === 'resetPinModal' && <div className="modal fade show" id="resetPinModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-key text-primary me-2"></i>Reset Card PIN</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><ResetPinModal /></div></div></div></div>}
      {active === 'replaceCardModal' && <div className="modal fade show" id="replaceCardModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-arrow-repeat text-info me-2"></i>Issue Replacement Card</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><ReplaceCardModal /></div></div></div></div>}
      {active === 'binConfigModal' && <div className="modal fade show" id="binConfigModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-sliders text-primary me-2"></i>BIN Configuration</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><BinConfigModal /></div></div></div></div>}
      {active === 'addBinModal' && <div className="modal fade show" id="addBinModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-plus-circle text-success me-2"></i>Request New BIN Program</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><AddBinModal /></div></div></div></div>}
      {active === 'issueBatchModal' && <div className="modal fade show" id="issueBatchModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-upload text-primary me-2"></i>Issue Card Batch</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><IssueBatchModal onClose={onClose} /></div></div></div></div>}
      {active === 'approveBatchModal' && <div className="modal fade show" id="approveBatchModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-check-circle text-success me-2"></i>Approve Batch Issuance</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><ApproveBatchModal /></div></div></div></div>}
      {active === 'batchStatusModal' && <div className="modal fade show" id="batchStatusModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-list-task text-primary me-2"></i>Batch Status #8891</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><BatchStatusModal /></div></div></div></div>}
      {active === 'velocityLimitsModal' && <div className="modal fade show" id="velocityLimitsModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-speedometer2 text-warning me-2"></i>Global Velocity Limits</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><VelocityLimitsModal /></div></div></div></div>}
      {active === 'feeScheduleModal' && <div className="modal fade show" id="feeScheduleModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-tags text-success me-2"></i>Fee Schedule Configuration</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><FeeScheduleModal /></div></div></div></div>}
      {active === 'mccBlocklistModal' && <div className="modal fade show" id="mccBlocklistModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-slash-circle text-danger me-2"></i>Global MCC Blocklist</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><MccBlocklistModal /></div></div></div></div>}
      {active === 'amlReviewModal' && <div className="modal fade show" id="amlReviewModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-shield-lock me-2" style={{ color: 'var(--pm-purple)' }}></i>AML / Fraud Alert Review</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><AmlReviewModal /></div></div></div></div>}
      {active === 'disputeResolutionModal' && <div className="modal fade show" id="disputeResolutionModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-arrow-return-left text-danger me-2"></i>Chargeback & Dispute Management</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><DisputeResolutionModal /></div></div></div></div>}
      {active === 'settlementDetailsModal' && <div className="modal fade show" id="settlementDetailsModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-bank text-primary me-2"></i>BIN Settlement Account</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><SettlementDetailsModal /></div></div></div></div>}
      {active === 'geoFencingModal' && <div className="modal fade show" id="geoFencingModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-globe text-info me-2"></i>Geo-Fencing & Regional Rules</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><GeoFencingModal /></div></div></div></div>}
      {active === 'exportReportModal' && <div className="modal fade show" id="exportReportModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-download me-2"></i>Export Program Reports</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><ExportReportModal onClose={onClose} /></div></div></div></div>}
      {active === 'webhookSettingsModal' && <div className="modal fade show" id="webhookSettingsModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-code-slash text-secondary me-2"></i>Webhook & API Integration</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><WebhookSettingsModal /></div></div></div></div>}
      {active === 'inboxModal' && <div className="modal fade show" id="inboxModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-envelope me-2"></i>Operator Inbox</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><InboxModal /></div></div></div></div>}
      {active === 'notificationsModal' && <div className="modal fade show" id="notificationsModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-bell me-2"></i>Recent Alerts</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><NotificationsModal /></div></div></div></div>}
      {active === 'profileModal' && <div className="modal fade show" id="profileModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-person-circle me-2"></i>BaaS Operator Profile</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><ProfileModal onOpen={onOpen} /></div></div></div></div>}
      {active === 'notificationPrefsModal' && <div className="modal fade show" id="notificationPrefsModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-gear me-2"></i>Operator Notification Preferences</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><NotificationPrefsModal /></div></div></div></div>}
      {active === 'suspendProgramModal' && <div className="modal fade show" id="suspendProgramModal" tabIndex={-1} style={{ display: 'block' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className={styles.modalHeaderCustom}><h5 className="modal-title"><i className="bi bi-exclamation-triangle text-danger me-2"></i>Suspend BIN Program</h5><button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose} /></div><div className={styles.modalBodyCustom}><SuspendProgramModal /></div></div></div></div>}
    </>
  )
}
