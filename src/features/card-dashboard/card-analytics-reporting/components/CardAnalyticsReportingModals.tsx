import { useState } from 'react'
import styles from '../styles/card-analytics-reporting.module.css'

interface CardAnalyticsReportingModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

/* ======================= LEGACY JS BRIDGE PATTERNS ======================= */
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
const ExportReportModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Data', 'Options', 'Ready']
  const next = () => {
    if (step === 2) {
      showLoading('#exportReportModal .modal-body', () => { setStep(3); renderStepper('exportStepper', labels, 3); showFlow('exportStep', 3, 3) })
      return
    }
    if (step >= 3) { onClose?.(); return }
    const nextStep = step + 1
    setStep(nextStep)
    renderStepper('exportStepper', labels, nextStep)
    showFlow('exportStep', nextStep, 3)
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
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>1. Select Datasets</h6>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Card Issuance & Activation</label></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Usage & Revenue Trends</label></div>
        <div className="form-check mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Merchant Concentration</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Corporate Spend & Violations</label></div>
      </div>
      <div id="exportStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>2. Configure Options</h6>
        <div className="mb-3"><label className={styles.formLabel}>Date Range</label><select className={styles.formControl}><option>Last 30 Days</option><option>Last 90 Days</option><option>Year to Date</option><option>Custom Range</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Format</label><select className={styles.formControl}><option>Excel (.xlsx)</option><option>CSV</option><option>PDF Summary</option></select></div>
      </div>
      <div id="exportStep3" style={step === 3 ? {} : { display: 'none' }}>
        <div className={styles.receipt}>
          <div className={styles.receiptIcon}><i className="bi bi-check-lg"></i></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Export Ready</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Your report has been compiled successfully.</p>
          <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Download Report</button>
        </div>
      </div>
      <div className="d-flex justify-content-between mt-4 pt-3" style={{ borderTop: '1px solid var(--pm-border)' }}>
        <button className={styles.btnPm} onClick={onClose}>Cancel</button>
        <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={next}>{step < 3 ? <>Continue <i className="bi bi-arrow-right" /></> : 'Finish'}</button>
      </div>
    </div>
  )
}

const BuildReportModal = () => {
  const [tab, setTab] = useState<'fields' | 'group' | 'filter'>('fields')
  return (
    <div>
      <div className={styles.tabPills + ' mb-3'}>
        <button className={`${styles.tabPill} ${tab === 'fields' ? styles.tabPillActive : ''}`} onClick={() => setTab('fields')}>1. Data Fields</button>
        <button className={`${styles.tabPill} ${tab === 'group' ? styles.tabPillActive : ''}`} onClick={() => setTab('group')}>2. Grouping</button>
        <button className={`${styles.tabPill} ${tab === 'filter' ? styles.tabPillActive : ''}`} onClick={() => setTab('filter')}>3. Filters</button>
      </div>
      {tab === 'fields' && (
        <div className="row">
          <div className="col-6"><label className={styles.formLabel}>Available Fields</label>
            {['Card PAN (Masked)', 'Transaction Amount', 'Merchant Category (MCC)', 'Authorization Status'].map((f) => (
              <div key={f} className="p-2 border rounded mb-1" style={{ fontSize: 12, cursor: 'pointer' }}>{f} <i className="bi bi-plus float-end" /></div>
            ))}
          </div>
          <div className="col-6"><label className={styles.formLabel}>Selected Fields</label>
            {['Transaction Date', 'Cardholder Name', 'Settlement Amount'].map((f) => (
              <div key={f} className="p-2 rounded mb-1" style={{ fontSize: 12, background: 'var(--pm-surface-2)' }}>{f} <i className="bi bi-x float-end text-danger" /></div>
            ))}
          </div>
        </div>
      )}
      {tab === 'group' && (
        <div>
          <div className="mb-3"><label className={styles.formLabel}>Group By</label><select className={styles.formControl}><option>Card Type</option><option>Merchant Category</option><option>Date Range</option></select></div>
          <div className="mb-3"><label className={styles.formLabel}>Time Granularity</label><select className={styles.formControl}><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
        </div>
      )}
      {tab === 'filter' && (
        <div>
          <div className="mb-3"><label className={styles.formLabel}>Date Range</label><input type="date" className={styles.formControl} /></div>
          <div className="mb-3"><label className={styles.formLabel}>Card Segment</label><select className={styles.formControl}><option>All Cards</option><option>Debit Only</option><option>Credit Only</option></select></div>
        </div>
      )}
    </div>
  )
}

const ScheduleReportModal = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState(1)
  const labels = ['Report', 'Timing', 'Delivery']
  const next = () => {
    if (step === 2) {
      showLoading('#scheduleReportModal .modal-body', () => { setStep(3); renderStepper('schedStepper', labels, 3); showFlow('schedStep', 3, 3) })
      return
    }
    if (step >= 3) { processAction('scheduleReportModal', 'Automated schedule saved successfully!', ''); return }
    const nextStep = step + 1
    setStep(nextStep)
    renderStepper('schedStepper', labels, nextStep)
    showFlow('schedStep', nextStep, 3)
  }
  return (
    <div>
      <div className={styles.stepper} id="schedStepper">{labels.map((l, i) => (
        <div key={l} className={`${styles.step} ${i + 1 === step ? styles.stepActive : i + 1 < step ? styles.stepDone : ''}`}>
          <div className={styles.stepNum}>{i + 1 < step ? <i className="bi bi-check" /> : i + 1}</div>
          <div className={styles.stepLabel}>{l}</div>
          {i < labels.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}</div>
      <div id="schedStep1" style={step === 1 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>1. Select Report</h6>
        <select className={styles.formControl}><option>Monthly Executive Portfolio Summary</option><option>Daily Corporate Policy Violations</option><option>Weekly Churn Risk Alerts</option><option>Custom: Marketing Dept Spend</option></select>
      </div>
      <div id="schedStep2" style={step === 2 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>2. Frequency & Timing</h6>
        <div className="mb-3"><label className={styles.formLabel}>Frequency</label><select className={styles.formControl}><option>Daily</option><option>Weekly (Mondays)</option><option selected>Monthly (1st of Month)</option></select></div>
        <div className="mb-3"><label className={styles.formLabel}>Delivery Time</label><input type="time" className={styles.formControl} defaultValue="08:00" /></div>
      </div>
      <div id="schedStep3" style={step === 3 ? {} : { display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>3. Recipients & Format</h6>
        <div className="mb-3"><label className={styles.formLabel}>Email Addresses (Comma separated)</label><textarea className={styles.formControl} rows={2}>management@paymo.com, finance@paymo.com</textarea></div>
        <div className="mb-3"><label className={styles.formLabel}>Attachment Format</label><select className={styles.formControl}><option>PDF</option><option>Excel</option><option>CSV link</option></select></div>
      </div>
    </div>
  )
}

const GlobalFilterModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Time Period</label><select className={styles.formControl}><option>This Month (MTD)</option><option>Last Month</option><option>Last 90 Days</option><option>Year to Date</option><option>Custom Dates</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Card Portfolio Segment</label><select className={styles.formControl}><option>All Cards</option><option>Retail / Consumer</option><option>SME / Business</option><option>Enterprise / Corporate</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Currency View</label><select className={styles.formControl}><option>KES (Default)</option><option>USD</option><option>EUR</option></select></div>
  </div>
)

const IssuanceAnalyticsModal = () => (
  <div>
    <div className="row mb-3">
      <div className="col-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Total Issued MTD</div><div style={{ fontSize: 20, fontWeight: 700 }}>4,500</div></div></div>
      <div className="col-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-primary-dark)' }}><div style={{ fontSize: 11 }}>Virtual Share</div><div style={{ fontSize: 20, fontWeight: 700 }}>68%</div></div></div>
      <div className="col-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)', color: '#047857' }}><div style={{ fontSize: 11 }}>Credit Approved</div><div style={{ fontSize: 20, fontWeight: 700 }}>1,210</div></div></div>
    </div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Card Type</th><th>Issued (MTD)</th><th>MoM Growth</th><th>Pending Review</th></tr></thead>
        <tbody>
          <tr><td>Virtual Debit (Single/Multi)</td><td>2,450</td><td><span className="text-success">+14%</span></td><td>0</td></tr>
          <tr><td>Physical Debit (Premium/Std)</td><td>610</td><td><span className="text-danger">-2%</span></td><td>142</td></tr>
          <tr><td>Virtual Credit</td><td>980</td><td><span className="text-success">+22%</span></td><td>310</td></tr>
          <tr><td>Physical Credit</td><td>230</td><td><span className="text-success">+5%</span></td><td>85</td></tr>
          <tr><td>Prepaid (GPR/Gift)</td><td>230</td><td><span className="text-muted">0%</span></td><td>12</td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const ActivationDetailsModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Analysis of 4,500 issued cards this month.</p>
    <div className={styles.statusRow}><div><strong>Virtual Cards</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Auto-activated instantly</div></div><div className="text-end"><strong>100% Rate</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-accent)' }}>Avg: 0 mins</span></div></div>
    <div className={styles.statusRow}><div><strong>Physical Delivery (Metro)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Nairobi & Environs</div></div><div className="text-end"><strong>78% Rate</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-warning)' }}>Avg: 2.4 Days</span></div></div>
    <div className={styles.statusRow}><div><strong>Physical Delivery (Regional)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Courier network delays</div></div><div className="text-end"><strong>54% Rate</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-danger)' }}>Avg: 5.1 Days</span></div></div>
    <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-exclamation-triangle me-1" /> Drop-off reason analysis: 65% of unactivated physical cards failed delivery OTP verification. Recommend SMS reminders.</div>
  </div>
)

const ReplacementLogModal = () => {
  const [tab, setTab] = useState<'reasons' | 'cancellations'>('reasons')
  return (
    <div>
      <div className={styles.tabPills + ' mb-3'}>
        <button className={`${styles.tabPill} ${tab === 'reasons' ? styles.tabPillActive : ''}`} onClick={() => setTab('reasons')}>Replacement Reasons</button>
        <button className={`${styles.tabPill} ${tab === 'cancellations' ? styles.tabPillActive : ''}`} onClick={() => setTab('cancellations')}>Cancellation Log</button>
      </div>
      {tab === 'reasons' ? (
        <div className={styles.chartBars}>
          {[{ label: 'Lost/Stolen', height: '60%', color: 'var(--pm-danger)' }, { label: 'Damaged', height: '20%', color: 'var(--pm-warning)' }, { label: 'Expired', height: '80%', color: 'var(--pm-info)' }, { label: 'Fraud Susp.', height: '40%', color: 'var(--pm-purple)' }, { label: 'Other', height: '10%', color: 'var(--pm-muted)' }].map((b) => (
            <div key={b.label} className={styles.chartBar} style={{ height: b.height, background: b.color }}><span className={styles.barLabel}>{b.label}</span></div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className={styles.table}>
            <thead><tr><th>Card Mask</th><th>Cardholder</th><th>Date</th><th>Reason Code</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>**** 4102</td><td>Grace Kamau</td><td>27 Jun</td><td>Customer Request</td><td>Closed</td></tr>
              <tr><td>**** 8821</td><td>Acme Corp</td><td>26 Jun</td><td>Employee Terminated</td><td>Closed</td></tr>
              <tr><td>**** 9011</td><td>David O.</td><td>24 Jun</td><td>Account Delinquent</td><td>Forced Closure</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const UsageTrendsModal = () => (
  <div>
    <div className={styles.chartBars + ' mb-3'} style={{ height: 150 }}>
      {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => (
        <div key={m} className={styles.chartBar} style={{ height: [30, 35, 40, 42, 50, 65, 55, 60, 62, 70, 75, 85][i] + '%', background: i === 11 ? 'var(--pm-primary)' : 'var(--pm-primary-light)' }}><span className={styles.barLabel}>{m}</span></div>
      ))}
    </div>
    <div className="row text-center mt-4">
      <div className="col-4"><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>AVERAGE ACTIVE RATE</div><div style={{ fontSize: 20, fontWeight: 700 }}>82.3%</div></div>
      <div className="col-4"><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>PEAK MONTH</div><div style={{ fontSize: 20, fontWeight: 700 }}>June</div></div>
      <div className="col-4"><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 600 }}>GROWTH RATE</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-accent)' }}>+12.5%</div></div>
    </div>
  </div>
)

const RevenueAnalyticsModal = () => (
  <div>
    <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface-2)' }}>
      <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Total Gross Revenue MTD</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 18,500,000</div>
    </div>
    <div className={styles.statusRow}><div><strong>Interchange Revenue</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Merchant discount sharing</div></div><strong style={{ color: 'var(--pm-accent)' }}>KES 12.2M</strong></div>
    <div className={styles.statusRow}><div><strong>FX Spread / Cross-Border</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Markup on international spend</div></div><strong style={{ color: 'var(--pm-info)' }}>KES 4.1M</strong></div>
    <div className={styles.statusRow}><div><strong>Card Replacement Fees</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Lost/damaged re-issuance</div></div><strong>KES 850k</strong></div>
    <div className={styles.statusRow}><div><strong>Late & Cash Advance Fees</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Credit portfolio penalties</div></div><strong style={{ color: 'var(--pm-warning)' }}>KES 1.35M</strong></div>
  </div>
)

const TopCategoriesModal = () => (
  <div>
    {[
      { name: 'Supermarkets & Grocery', pct: '22%', width: '100%', color: 'var(--pm-primary)' },
      { name: 'Dining & Restaurants', pct: '18%', width: '81%', color: 'var(--pm-info)' },
      { name: 'Fuel & Auto', pct: '14%', width: '63%', color: 'var(--pm-accent)' },
      { name: 'Travel & Airlines', pct: '10%', width: '45%', color: 'var(--pm-purple)' },
      { name: 'Digital Subscriptions & Media', pct: '7%', width: '32%', color: 'var(--pm-warning)' },
      { name: 'Healthcare & Pharmacies', pct: '5%', width: '22%', color: 'var(--pm-danger)' },
    ].map((c) => (
      <div key={c.name} className="mb-3">
        <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>{c.name}</span><strong>KES {c.pct === '22%' ? '264M' : c.pct === '18%' ? '216M' : c.pct === '14%' ? '168M' : c.pct === '10%' ? '120M' : c.pct === '7%' ? '85M' : '60M'} ({c.pct})</strong></div>
        <div className={styles.progress}><div className={styles.progressBar} style={{ width: c.width, background: c.color }} /></div>
      </div>
    ))}
  </div>
)

const ChannelMixModal = () => (
  <div>
    <div className="row g-3">
      {[
        { title: 'POS TERMINALS', pct: '45%', sub: 'Physical Retail', bg: 'var(--pm-warning-soft)', border: 'var(--pm-warning)' },
        { title: 'ONLINE / E-COMMERCE', pct: '35%', sub: 'Card-Not-Present', bg: 'var(--pm-info-soft)', border: 'var(--pm-info)' },
        { title: 'ATM WITHDRAWALS', pct: '15%', sub: 'Cash Access', bg: 'var(--pm-purple-soft)', border: 'var(--pm-purple)' },
        { title: 'MOBILE WALLETS', pct: '5%', sub: 'Apple/Google Pay', bg: 'var(--pm-accent-soft)', border: 'var(--pm-accent)' },
      ].map((ch) => (
        <div key={ch.title} className="col-6">
          <div className="p-3 rounded" style={{ background: ch.bg, borderLeft: '3px solid ' + ch.border }}>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{ch.title}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{ch.pct}</div>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{ch.sub}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-3" style={{ fontSize: 13 }}>
      <p><strong>Insights:</strong></p>
      <ul>
        <li>Contactless (Tap-to-Pay) accounts for 68% of all POS transactions.</li>
        <li>Mobile wallet usage has doubled since Apple Pay integration last quarter.</li>
      </ul>
    </div>
  </div>
)

const GeoSpendModal = () => (
  <div>
    <div className="d-flex align-items-center justify-content-between mb-4">
      <div className="text-center"><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary)' }}>88%</div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--pm-muted)' }}>DOMESTIC (KES)</div></div>
      <div style={{ flex: 1, height: 4, background: 'var(--pm-border)', margin: '0 15px', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '88%', background: 'var(--pm-primary)' }} /></div>
      <div className="text-center"><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>12%</div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--pm-muted)' }}>INTERNATIONAL</div></div>
    </div>
    <h6 style={{ fontWeight: 700 }}>Top International Destinations (Corridor)</h6>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Country / Currency</th><th>Volume</th><th>% of Intl</th></tr></thead>
        <tbody>
          <tr><td>United States (USD)</td><td>KES 72M</td><td>50%</td></tr>
          <tr><td>United Kingdom (GBP)</td><td>KES 28M</td><td>20%</td></tr>
          <tr><td>European Union (EUR)</td><td>KES 21M</td><td>15%</td></tr>
          <tr><td>UAE (AED)</td><td>KES 10M</td><td>7%</td></tr>
          <tr><td>Others</td><td>KES 13M</td><td>8%</td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const SubscriptionTrackerModal = () => (
  <div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Identified Monthly Subscription Volume</div><div style={{ fontSize: 20, fontWeight: 700 }}>KES 85.2M</div></div>
      <span className={`${styles.badge} ${styles.badgeI}`}>7% of portfolio</span>
    </div>
    <h6 style={{ fontWeight: 700 }}>Top Recurring Merchants</h6>
    <div className={styles.statusRow}><div><strong>Netflix</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Entertainment</div></div><strong>12,400 cards</strong></div>
    <div className={styles.statusRow}><div><strong>DSTV Multichoice</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Media</div></div><strong>9,850 cards</strong></div>
    <div className={styles.statusRow}><div><strong>Spotify</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Audio</div></div><strong>8,100 cards</strong></div>
    <div className={styles.statusRow}><div><strong>AWS / Google Cloud</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Tech / B2B</div></div><strong>4,200 cards</strong></div>
    <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}><i className="bi bi-shield-x me-1 text-danger" /> Failed subscription renewal rate is <strong>4.2%</strong>. Mostly due to insufficient funds on prepaid cards.</div>
  </div>
)

const MerchantConcentrationModal = () => (
  <div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Merchant Name</th><th>Category</th><th>Txn Volume</th><th>% of Total</th></tr></thead>
        <tbody>
          <tr><td>Naivas Supermarket</td><td>Groceries</td><td>98,420</td><td>8.2%</td></tr>
          <tr><td>Safaricom PLC</td><td>Telco / Util</td><td>85,110</td><td>7.1%</td></tr>
          <tr><td>Quickmart</td><td>Groceries</td><td>62,300</td><td>5.2%</td></tr>
          <tr><td>Shell / Vivo Energy</td><td>Fuel</td><td>54,800</td><td>4.5%</td></tr>
          <tr><td>Jumia Kenya</td><td>E-commerce</td><td>41,200</td><td>3.4%</td></tr>
          <tr><td>Uber</td><td>Transport</td><td>38,900</td><td>3.2%</td></tr>
        </tbody>
      </table>
    </div>
    <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}><strong>Concentration Risk:</strong> Top 10 merchants account for 45% of total transaction volume, indicating high reliance on daily essentials and transport.</div>
  </div>
)

const MerchantCrossSellModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>AI-identified co-branding and reward partnership opportunities based on overlapping spend.</p>
    <div className={styles.statusRow}><div><strong>Co-brand Opportunity: Fuel</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>14% of users spend &gt;KES 10k/mo at Shell</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => processAction('merchantCrossSellModal', 'Initiated partnership workflow for Fuel Co-Brand.', '')}>Draft Proposal</button></div>
    <div className={styles.statusRow}><div><strong>Cashback Tier: Groceries</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Naivas/Quickmart frequent shoppers (2x/week)</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => processAction('merchantCrossSellModal', 'Added to Marketing Campaign queue.', '')}>Create Campaign</button></div>
    <div className={styles.statusRow}><div><strong>Upsell: Travel Card</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Users with &gt;2 international flight bookings YTD</div></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => processAction('merchantCrossSellModal', 'Targeted 4,200 users for Premium Travel Card.', '')}>Target Users</button></div>
  </div>
)

const ChurnRiskModal = () => (
  <div>
    <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><div style={{ fontSize: 11, color: '#991B1B', fontWeight: 700 }}>IDENTIFIED AT RISK</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-danger)' }}>1,420 Cards</div></div>
      <span className={`${styles.badge} ${styles.badgeD}`}>3.1% of portfolio</span>
    </div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Risk Factor</th><th>Cards Affected</th><th>Avg Decline in Vol</th><th>Action Trigger</th></tr></thead>
        <tbody>
          <tr><td>Zero activity &gt; 45 days</td><td>840</td><td>-100%</td><td><button className={styles.btnPm}>Send 'We Miss You' Offer</button></td></tr>
          <tr><td>Salary deposit stopped</td><td>310</td><td>-85%</td><td><button className={styles.btnPm}>Call/Check Status</button></td></tr>
          <tr><td>Multiple 3DS failures</td><td>150</td><td>-60%</td><td><button className={styles.btnPm}>Support Intervention</button></td></tr>
          <tr><td>Prepaid balance KES 0</td><td>120</td><td>-100%</td><td><button className={styles.btnPm}>Reload Incentive (KES 100)</button></td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const UpsellOpportunityModal = () => (
  <div>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Users exhibiting high debit volume, excellent balance histories, and clean KYC, eligible for Virtual Credit.</p>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Segment</th><th>Eligible Users</th><th>Suggested Limit</th><th>Conv. Est.</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>High Net Worth Debit</td><td>142</td><td>KES 500k+</td><td>45%</td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}>Email Upgrade</button></td></tr>
          <tr><td>Consistent Salary Deposits</td><td>180</td><td>KES 100k - 300k</td><td>60%</td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}>Push Notification</button></td></tr>
          <tr><td>Heavy E-commerce Shoppers</td><td>90</td><td>KES 50k</td><td>35%</td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}>In-App Banner</button></td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const CorpSpendSummaryModal = () => (
  <div>
    <div className="row g-3 mb-3">
      <div className="col-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Total Active Companies</div><div style={{ fontSize: 24, fontWeight: 700 }}>124</div></div></div>
      <div className="col-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Employee Cards Issued</div><div style={{ fontSize: 24, fontWeight: 700 }}>8,450</div></div></div>
      <div className="col-12"><div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', color: '#B45309' }}><div style={{ fontSize: 11, fontWeight: 700 }}>B2B SPEND MTD</div><div style={{ fontSize: 28, fontWeight: 700 }}>KES 412M</div></div></div>
    </div>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Corporate spend represents 34% of total dashboard volume, with highly profitable interchange margins.</p>
  </div>
)

const DeptBudgetModal = () => (
  <div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Department</th><th>Allocated Budget</th><th>Actual Spend</th><th>Utilization</th></tr></thead>
        <tbody>
          <tr><td>Fleet Management</td><td>KES 2.5M</td><td>KES 2.1M</td><td><div className={styles.progress}><div className={styles.progressBar} style={{ width: '84%', background: 'var(--pm-warning)' }} /></div></td></tr>
          <tr><td>Sales & Marketing</td><td>KES 1.0M</td><td>KES 950k</td><td><div className={styles.progress}><div className={styles.progressBar} style={{ width: '95%', background: 'var(--pm-danger)' }} /></div></td></tr>
          <tr><td>Executive Travel</td><td>KES 800k</td><td>KES 350k</td><td><div className={styles.progress}><div className={styles.progressBar} style={{ width: '43%', background: 'var(--pm-info)' }} /></div></td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const PolicyViolationModal = () => (
  <div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Employee Card</th><th>Amount</th><th>Merchant</th><th>Violation Type</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>**** 4412 (J. Doe)</td><td>KES 45,000</td><td>Nairobi Serena</td><td>Over per-transaction limit</td><td><button className={styles.btnPm}>Override</button></td></tr>
          <tr><td>**** 8810 (S. Smith)</td><td>KES 12,000</td><td>Brew Bistro</td><td>Weekend/Alcohol MCC</td><td><button className={styles.btnPm}>Flag to HR</button></td></tr>
          <tr><td>**** 9921 (M. Kariuki)</td><td>KES 8,500</td><td>Total Petrol</td><td>Missing Receipt &gt; 7 days</td><td><button className={styles.btnPm}>Remind</button></td></tr>
        </tbody>
      </table>
    </div>
  </div>
)

const ComplianceTaxModal = () => (
  <div>
    <div className="mb-3"><label className={styles.formLabel}>Report Form Type</label><select className={styles.formControl}><option>Tax-Deductible Business Expenses</option><option>VAT Withholding Report</option><option>CBK Transaction Volume Summary</option><option>Per Diem & Mileage Allowances</option></select></div>
    <div className="mb-3"><label className={styles.formLabel}>Fiscal Quarter</label><select className={styles.formControl}><option>Q1 2025</option><option>Q2 2025</option><option>Q3 2025</option><option>Q4 2025</option><option>Full Year</option></select></div>
    <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Data exported here is pre-formatted to align with Kenya Revenue Authority (KRA) standard iTax templates.</div>
  </div>
)

const NotificationsModal = () => (
  <div>
    <div className="p-3 border rounded mb-2" style={{ borderLeft: '3px solid var(--pm-warning)' }}><div style={{ fontWeight: 600, fontSize: 13 }}>Fraud Spike Detected</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>CNP transactions in Eastern Europe elevated by 400% in last 6 hours.</div></div>
    <div className="p-3 border rounded mb-2" style={{ borderLeft: '3px solid var(--pm-primary)' }}><div style={{ fontWeight: 600, fontSize: 13 }}>Report Successfully Generated</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Monthly Portfolio Summary (June) is ready for download.</div></div>
    <div className="p-3 border rounded mb-2" style={{ borderLeft: '3px solid var(--pm-danger)' }}><div style={{ fontWeight: 600, fontSize: 13 }}>Corporate Budget Exceeded</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>TechStart Inc has breached 90% of their monthly limit.</div></div>
    <div className="p-3 border rounded" style={{ borderLeft: '3px solid var(--pm-accent)' }}><div style={{ fontWeight: 600, fontSize: 13 }}>Scheduled Job Complete</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Churn risk predictive model updated at 02:00 AM.</div></div>
  </div>
)

const ProfileModal = () => (
  <div className="text-center">
    <div className={styles.avatar + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-gradient-slate)' }}>DA</div>
    <h5 style={{ fontWeight: 700, marginBottom: 2 }}>David A.</h5>
    <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>BAAS Admin · Card Center Data Owner</p>
    <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Access Level</span><br /><strong>Full Analytics</strong></div></div>
      <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Last Login</span><br /><strong>Today, 08:42 AM</strong></div></div>
    </div>
  </div>
)

const PredictiveEngineModal = ({ onClose, onOpen }: { onClose?: () => void; onOpen?: (id: string) => void }) => (
  <div>
    <div className="row g-3">
      {[
        { title: 'Churn Prediction', sub: '1,420 users at risk', icon: 'bi-exclamation-triangle', bg: 'var(--pm-danger-soft)', border: 'var(--pm-danger)', modal: 'churnRiskModal' },
        { title: 'Credit Upsell', sub: '412 qualified users', icon: 'bi-graph-up-arrow', bg: 'var(--pm-accent-soft)', border: 'var(--pm-accent)', modal: 'upsellOpportunityModal' },
        { title: 'Merchant Cross-Sell', sub: '3 active campaigns', icon: 'bi-link-45deg', bg: 'var(--pm-warning-soft)', border: 'var(--pm-warning)', modal: 'merchantCrossSellModal' },
      ].map((item) => (
        <div key={item.title} className="col-md-4">
          <div className="p-3 rounded text-center" style={{ background: item.bg, border: '1px solid ' + item.border, cursor: 'pointer' }} onClick={() => { onClose?.(); onOpen(item.modal) }}>
            <i className={`${item.icon} d-block mb-2`} style={{ fontSize: 24, color: item.border }}></i>
            <div style={{ fontWeight: 700 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
      <p><strong>Next Month Forecast:</strong></p>
      <ul>
        <li>Projected Volume: KES 1.35B (+12.5%)</li>
        <li>Predicted Active Cards: 48,000</li>
        <li>Machine Learning confidence: 94.2%</li>
      </ul>
    </div>
  </div>
)

const LtvAnalyticsModal = () => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm-muted)' }}>AVERAGE LIFETIME VALUE</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 12,400</div>
    </div>
    <div className="table-responsive">
      <table className={styles.table}>
        <thead><tr><th>Segment</th><th>Avg LTV</th><th>CAC</th><th>ROI Ratio</th></tr></thead>
        <tbody>
          <tr><td>Premium Credit</td><td>KES 45,000</td><td>KES 2,500</td><td>18x</td></tr>
          <tr><td>Corporate Expense</td><td>KES 32,100</td><td>KES 1,200</td><td>26x</td></tr>
          <tr><td>Standard Debit</td><td>KES 8,500</td><td>KES 800</td><td>10.6x</td></tr>
          <tr><td>Virtual Only</td><td>KES 4,200</td><td>KES 150</td><td>28x</td></tr>
        </tbody>
      </table>
    </div>
    <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>Virtual cards have the lowest LTV but the highest ROI ratio due to zero physical acquisition costs. Focus acquisition budget here.</div>
  </div>
)

function CardAnalyticsReportingModals({ active, onClose, onOpen }: CardAnalyticsReportingModalsProps) {
  if (!active) return null

  /* ======================= MODAL REGISTRY ======================= */
  const modalContent: Record<string, React.ReactNode> = {
    exportReportModal: <ExportReportModal onClose={onClose} />,
    buildReportModal: <BuildReportModal />,
    scheduleReportModal: <ScheduleReportModal onClose={onClose} />,
    globalFilterModal: <GlobalFilterModal />,
    issuanceAnalyticsModal: <IssuanceAnalyticsModal />,
    activationDetailsModal: <ActivationDetailsModal />,
    replacementLogModal: <ReplacementLogModal />,
    usageTrendsModal: <UsageTrendsModal />,
    revenueAnalyticsModal: <RevenueAnalyticsModal />,
    topCategoriesModal: <TopCategoriesModal />,
    channelMixModal: <ChannelMixModal />,
    geoSpendModal: <GeoSpendModal />,
    subscriptionTrackerModal: <SubscriptionTrackerModal />,
    merchantConcentrationModal: <MerchantConcentrationModal />,
    merchantCrossSellModal: <MerchantCrossSellModal />,
    churnRiskModal: <ChurnRiskModal />,
    upsellOpportunityModal: <UpsellOpportunityModal />,
    corpSpendSummaryModal: <CorpSpendSummaryModal />,
    deptBudgetModal: <DeptBudgetModal />,
    policyViolationModal: <PolicyViolationModal />,
    complianceTaxModal: <ComplianceTaxModal />,
    notificationsModal: <NotificationsModal />,
    profileModal: <ProfileModal />,
    predictiveEngineModal: <PredictiveEngineModal onClose={onClose} onOpen={onOpen} />,
    ltvAnalyticsModal: <LtvAnalyticsModal />,
  }

  const modalTitles: Record<string, string> = {
    exportReportModal: 'Export Dashboard Data',
    buildReportModal: 'Build Custom Report',
    scheduleReportModal: 'Schedule Automated Report',
    globalFilterModal: 'Global Analytics Filter',
    issuanceAnalyticsModal: 'Issuance Breakdown',
    activationDetailsModal: 'Activation Funnel Details',
    replacementLogModal: 'Replacement & Cancellation Log',
    usageTrendsModal: 'Usage Trends (12 Months)',
    revenueAnalyticsModal: 'Revenue & Fee Analytics',
    topCategoriesModal: 'Top Category Drill-down',
    channelMixModal: 'Usage Channel Mix',
    geoSpendModal: 'Geographic Spend Analysis',
    subscriptionTrackerModal: 'Recurring & Subscription Tracker',
    merchantConcentrationModal: 'Merchant Concentration',
    merchantCrossSellModal: 'Loyalty & Cross-Sell Engine',
    churnRiskModal: 'Churn Risk Identification',
    upsellOpportunityModal: 'Credit Upsell Opportunities',
    corpSpendSummaryModal: 'Corporate Program Overview',
    deptBudgetModal: 'Department Budget Breakdown',
    policyViolationModal: 'Policy Violation Audit',
    complianceTaxModal: 'Compliance & Tax Data Export',
    notificationsModal: 'Analytics Alerts',
    profileModal: 'Admin Profile',
    predictiveEngineModal: 'AI Predictive Engine Dashboard',
    ltvAnalyticsModal: 'Customer LTV Analytics',
  }

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

export default CardAnalyticsReportingModals
