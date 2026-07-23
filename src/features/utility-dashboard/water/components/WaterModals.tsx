import styles from '../styles/water.module.css'
import { MBox, Stepper, Loading, Lbl, Fld, useModals } from '../../_shared/modalKit'

const s = styles as Record<string, string>
interface Props { active: string | null; onClose: () => void; onOpen: (id: string) => void }

export default function WaterModals({ active, onClose, onOpen }: Props) {
  const m = useModals(s, active, onClose)

  return (
    <>
      {/* 1 PAY WATER (4-step) */}
      <MBox s={s} id="payWaterModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('payWater', 4, 3, <>Authorize <i className="bi bi-lock" /></>)}
        title={<><i className="bi bi-droplet text-info me-2" />Pay Water Bill</>}>
        {m.busy === 'payWater' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Account', 'Amount', 'Confirm', 'Done']} current={m.step('payWater')} />
          {m.step('payWater') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Water Account</h6>
            <div className="mb-3"><Lbl s={s}>Saved Accounts</Lbl><Fld s={s} as="select" options={['Nairobi Water (NCWSC) — 290081', 'Kisumu Water (KIWASCO) — 441092', 'Mombasa Water (MOWASSCO) — 112009', '+ Add new account']} /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Current Balance</span><strong>KES 3,200</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Due Date</span><strong style={{ color: 'var(--pm-danger)' }}>Tomorrow</strong></div>
              <div className="d-flex justify-content-between"><span>Status</span><span className={`${s.badge} ${s.badgeW}`}>Due Soon</span></div>
            </div>
          </div>)}
          {m.step('payWater') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Enter Amount</h6>
            <Lbl s={s}>Amount to Pay</Lbl>
            <div className="mb-3">{m.Chips({ k: 'wAmt', opts: [{ v: '3200', label: 'Full Bill (3,200)' }, { v: '1600', label: 'Half Bill (1,600)' }, { v: '5000', label: 'Overpay (5,000)' }] })}</div>
            <input type="number" className={s.formControl} value={m.chip('wAmt', '3200')} onChange={(e) => m.setChip('wAmt', e.target.value)} />
            <div className="mt-3"><Lbl s={s}>Payment Method</Lbl>{m.payMethodRadios('wpay')}</div>
          </div>)}
          {m.step('payWater') === 3 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Confirm & Authorize</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-1"><span>Provider</span><strong>Nairobi Water (NCWSC)</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Account</span><strong>290081</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Fee</span><strong>KES 0</strong></div>
              <hr className={s.divider} /><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES {Number(m.chip('wAmt', '3200')).toLocaleString()}</strong></div>
            </div>
            <Lbl s={s}>Enter PIN to authorize M-Pesa</Lbl>
            <div className={s.pinInput}>{[0, 1, 2, 3].map((i) => <input key={i} type="password" maxLength={1} />)}</div>
          </div>)}
          {m.step('payWater') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Water Bill Paid!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your payment to Nairobi Water has been processed successfully.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES {Number(m.chip('wAmt', '3200')).toLocaleString()}</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Account</span><strong>290081</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Reference</span><strong>WTR-PM-20250627-8834</strong></div>
            </div>
            <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('shareReceiptModal')}>Share</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('exportWaterModal')}>Download</button></div>
          </div>)}
        </>)}
      </MBox>

      {/* 2 ADD WATER METER (4-step) */}
      <MBox s={s} id="addWaterMeterModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('addWaterMeter', 4, 3, <>Verify Account <i className="bi bi-shield-check" /></>)}
        title={<><i className="bi bi-plus-circle text-primary me-2" />Add Water Account</>}>
        {m.busy === 'addWaterMeter' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Provider', 'Details', 'Verify', 'Done']} current={m.step('addWaterMeter')} />
          {m.step('addWaterMeter') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select County / Provider</h6>
            <Fld s={s} placeholder="Search provider or county... (e.g. Nairobi, Mombasa)" />
            <div className="mt-3" style={{ maxHeight: 250, overflowY: 'auto' }}>
              {([['Nairobi Water (NCWSC)', 'Paybill 444400'], ['Mombasa Water (MOWASSCO)', 'Paybill 614614'], ['Kisumu Water (KIWASCO)', 'Paybill 300300'], ['Nakuru Water (NAWASSCO)', 'Paybill 743743']] as const).map(([n, sub]) => (
                <div key={n} className={`p-3 border rounded mb-2 d-flex align-items-center gap-3 ${m.isPicked('wProv', n) ? s.selectableActive : ''}`} style={{ cursor: 'pointer' }} onClick={() => m.setPicked('wProv', n)}>
                  <div className={s.iconCircle} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-droplet" /></div>
                  <div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div>
                </div>
              ))}
            </div>
          </div>)}
          {m.step('addWaterMeter') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Account Details</h6>
            <div className="mb-3"><Lbl s={s}>Account Number</Lbl><Fld s={s} placeholder="Enter water account number" /></div>
            <div className="mb-3"><Lbl s={s}>Property Nickname</Lbl><Fld s={s} placeholder="e.g. Home Kilimani, Office" /></div>
            <div className="mb-3"><Lbl s={s}>Property Type</Lbl><Fld s={s} as="select" options={['Residential', 'Commercial', 'Industrial']} /></div>
          </div>)}
          {m.step('addWaterMeter') === 3 && (<div className="p-4 text-center">
            <div className={`${s.spinner} mx-auto mb-3`} style={{ borderTopColor: 'var(--pm-info)' }} />
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Contacting NCWSC to verify account details...</p>
          </div>)}
          {m.step('addWaterMeter') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-info)' }}>Account Verified</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Nairobi Water account successfully linked.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Account Name</span><strong>James Kamau</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Current Balance</span><strong>KES 0.00</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Status</span><span className={`${s.badge} ${s.badgeS}`}>Active</span></div>
            </div>
          </div>)}
        </>)}
      </MBox>

      {/* 3 ORDER BOWSER (4-step) */}
      <MBox s={s} id="orderBowserModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('orderBowser', 4, 3, <>Confirm Order <i className="bi bi-check2" /></>)}
        title={<><i className="bi bi-truck text-primary me-2" />Order Emergency Water Bowser</>}>
        {m.busy === 'orderBowser' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Size', 'Supplier', 'Pay', 'Done']} current={m.step('orderBowser')} />
          {m.step('orderBowser') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Location & Size</h6>
            <div className="mb-3"><Lbl s={s}>Delivery Address</Lbl><Fld s={s} defaultValue="Apt 4B, Kilimani Heights, Nairobi" /></div>
            <Lbl s={s}>Water Capacity Needed</Lbl>
            <div className="row g-2 mb-3">
              {([['5,000 L', 'Small truck', 20], ['10,000 L', 'Standard', 24], ['20,000 L', 'Large tank', 28]] as const).map(([n, d, fs]) => (
                <div key={n} className="col-4">{m.PickedBox({ k: 'bowSize', v: n, children: (<><i className="bi bi-truck d-block mb-1" style={{ fontSize: fs, color: 'var(--pm-primary)' }} /><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{d}</div></>) })}</div>
              ))}
            </div>
          </div>)}
          {m.step('orderBowser') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Choose Supplier</h6>
            <div className="table-responsive"><table className={s.table}><thead><tr><th>Supplier</th><th>Price</th><th>ETA</th><th>Select</th></tr></thead><tbody>
              {([['Nairobi Pure Water', 'KES 7,500', '4 hrs'], ['Aqua Delivery Co.', 'KES 8,000', '2 hrs (Express)'], ['Maji Safi Trucking', 'KES 6,800', 'Tomorrow 10 AM']] as const).map(([n, p, eta], i) => (
                <tr key={n}><td><strong>{n}</strong><br /><small className="text-success"><i className="bi bi-patch-check" /> Verified clean</small></td><td>{p}</td><td>{eta}</td><td><input type="radio" name="bsup" defaultChecked={i === 0} /></td></tr>
              ))}
            </tbody></table></div>
          </div>)}
          {m.step('orderBowser') === 3 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Confirm Payment</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-1"><span>Supplier</span><strong>Nairobi Pure Water Ltd</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Size</span><strong>10,000 Liters</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Delivery</span><strong>Kilimani Heights (4 hrs)</strong></div>
              <hr className={s.divider} /><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 7,500</strong></div>
            </div>
            <div className="mb-3"><Lbl s={s}>Payment Method</Lbl><Fld s={s} as="select" options={['M-Pesa on Delivery', 'Pay Now via Wallet']} /></div>
          </div>)}
          {m.step('orderBowser') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-truck" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-info)' }}>Bowser Ordered Successfully</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Driver details and live tracking link sent via SMS.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Order ID</span><strong>BWS-PM-9941</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Driver</span><strong>Kamau (KCD 412F)</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">ETA</span><strong>Today, 3:30 PM</strong></div>
            </div>
          </div>)}
        </>)}
      </MBox>

      {/* 4 BILL BREAKDOWN */}
      <MBox s={s} id="waterBillBreakdownModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmI}`} onClick={() => onOpen('payWaterModal')}>Pay Now</button></>}
        title={<><i className="bi bi-list-columns me-2" />Water Bill Statement</>}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Account</span><strong>NCWSC - 290081</strong></div>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Period</span><strong>May 15 - Jun 15</strong></div>
          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Units (m³)</span><strong>24 m³</strong></div>
          <div className="d-flex justify-content-between"><span className="text-muted">Due Date</span><strong style={{ color: 'var(--pm-danger)' }}>Tomorrow</strong></div>
        </div>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Charge Item</th><th>Amount</th></tr></thead><tbody>
          {([['Water Charge (0-6 m³) @ KES 34', 'KES 204'], ['Water Charge (7-24 m³) @ KES 53', 'KES 954'], ['Sewerage Charge (75% of water)', 'KES 868'], ['Meter Rent', 'KES 50'], ['VAT (16% on taxable items)', 'KES 124'], ['Arrears', 'KES 1,000']] as const).map(([k, v]) => (<tr key={k}><td>{k}</td><td>{v}</td></tr>))}
        </tbody></table></div>
        <div className="d-flex justify-content-between mt-3 p-3 rounded" style={{ background: 'var(--pm-warning-soft)', color: '#B45309' }}><span style={{ fontWeight: 700 }}>Total Payable</span><strong style={{ fontSize: 18 }}>KES 3,200</strong></div>
      </MBox>

      {/* 5 MANAGE WATER ACCOUNT (tabs) */}
      <MBox s={s} id="manageWaterAccountModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('manageWaterAccountModal', 'Account details updated!')}>Save Changes</button></>}
        title={<><i className="bi bi-gear me-2" />Manage Water Account</>}>
        {m.body('manageWaterAccountModal', <>
          <div className={`${s.tabPills} mb-3`}>{([['details', 'Details'], ['alerts', 'Alerts'], ['history', 'History']] as const).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${m.tab('manageW', 'details') === k ? s.tabPillActive : ''}`} onClick={() => m.setTab('manageW', k)}>{l}</button>))}</div>
          {m.tab('manageW', 'details') === 'details' && (<div className="row g-3">
            <div className="col-md-6"><Lbl s={s}>Nickname</Lbl><Fld s={s} defaultValue="Home Kilimani" /></div>
            <div className="col-md-6"><Lbl s={s}>Provider</Lbl><Fld s={s} defaultValue="Nairobi Water (NCWSC)" disabled /></div>
            <div className="col-md-6"><Lbl s={s}>Account No.</Lbl><Fld s={s} defaultValue="290081" disabled /></div>
            <div className="col-md-6"><Lbl s={s}>Default Payment</Lbl><Fld s={s} as="select" options={['M-Pesa', 'Wallet']} /></div>
            <div className="col-12"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Auto-pay enabled</label></div></div>
          </div>)}
          {m.tab('manageW', 'details') === 'alerts' && (<div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Bill due reminders (3 days prior)</label></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Abnormal usage / Leak alerts</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Rationing / Outage notices in my area</label></div>
          </div>)}
          {m.tab('manageW', 'details') === 'history' && (<div className="table-responsive"><table className={s.table}><thead><tr><th>Date</th><th>Action</th><th>Status</th></tr></thead><tbody>
            {([['25 Jun', 'Paid KES 3,200 via Wallet', 'badgeS', 'Success'], ['15 Jun', 'Bill generated KES 3,200', 'badgeI', 'Logged'], ['25 May', 'Paid KES 2,800 via M-Pesa', 'badgeS', 'Success']] as const).map((r, i) => (<tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td><span className={`${s.badge} ${s[r[2]]}`}>{r[3]}</span></td></tr>))}
          </tbody></table></div>)}
        </>)}
      </MBox>

      {/* 6 DISPUTE WATER */}
      <MBox s={s} id="disputeWaterModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('disputeWaterModal', 'Dispute submitted to provider. Ticket #DSP-W-9942.', 'DSP-W-9942')}>Submit Dispute</button></>}
        title={<><i className="bi bi-exclamation-circle text-warning me-2" />Dispute Water Bill</>}>
        {m.body('disputeWaterModal', <div className="row g-3">
          <div className="col-md-6"><Lbl s={s}>Account</Lbl><Fld s={s} as="select" options={['KIWASCO — 441092', 'NCWSC — 290081']} /></div>
          <div className="col-md-6"><Lbl s={s}>Dispute Reason</Lbl><Fld s={s} as="select" options={['Bill abnormally high', 'Estimated bill (no actual reading)', 'Payment not reflected', 'Meter faulty']} /></div>
          <div className="col-12"><Lbl s={s}>Description</Lbl><Fld s={s} as="textarea" rows={3} defaultValue="The bill for June is KES 5,150 which is 40% above my historical average, yet no extra usage occurred." /></div>
          <div className="col-md-6"><Lbl s={s}>Current Meter Reading Value</Lbl><Fld s={s} type="number" placeholder="e.g. 1042" /></div>
          <div className="col-md-6"><Lbl s={s}>Upload Photo of Meter</Lbl><input type="file" className={s.formControl} /></div>
          <div className="col-12"><div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-shield-exclamation me-1" /> Submitting a dispute will pause late fees for 14 days while the provider investigates.</div></div>
        </div>)}
      </MBox>

      {/* 7 REPORT LEAK */}
      <MBox s={s} id="reportLeakModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('reportLeakModal', 'Leak reported to NCWSC emergency desk.', 'LEAK-1045')}>Report to Authority</button></>}
        title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Report Leak / Burst Pipe</>}>
        {m.body('reportLeakModal', <>
          <div className="mb-3"><Lbl s={s}>Location type</Lbl><Fld s={s} as="select" options={['Inside my property (Private)', 'Public road / Main line']} /></div>
          <div className="mb-3"><Lbl s={s}>Associated Account / Area</Lbl><Fld s={s} as="select" options={['Rental Unit A — NCWSC', 'Home Kilimani']} /></div>
          <div className="mb-3"><Lbl s={s}>Severity</Lbl><Fld s={s} as="select" options={['Minor dripping', 'Major burst / Flowing water']} /></div>
          <div className="mb-3"><Lbl s={s}>Photo (Optional)</Lbl><input type="file" className={s.formControl} /></div>
          <div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>Need a private plumber for an internal issue?<br /><button className={`${s.btnPm} ${s.btnSm} mt-2`} onClick={() => onOpen('serviceWaterModal')}>Request Plumber via PayMo</button></div>
        </>)}
      </MBox>

      {/* 8 AUTO-PAY */}
      <MBox s={s} id="autoPayWaterModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('autoPayWaterModal', 'Auto-pay enabled for NCWSC account.')}>Save Auto-Pay</button></>}
        title={<><i className="bi bi-arrow-repeat text-primary me-2" />Water Auto-Pay Setup</>}>
        {m.body('autoPayWaterModal', <>
          <div className="mb-3"><Lbl s={s}>Account</Lbl><Fld s={s} as="select" options={['NCWSC — 290081', 'KIWASCO — 441092']} /></div>
          <div className="mb-3"><Lbl s={s}>Rule</Lbl><Fld s={s} as="select" options={['Pay full bill amount 2 days before due', 'Pay full bill on due date']} /></div>
          <div className="mb-3"><Lbl s={s}>Maximum Cap (KES)</Lbl><Fld s={s} type="number" defaultValue="5000" /></div>
          <div className="mb-3"><Lbl s={s}>Payment Source</Lbl><Fld s={s} as="select" options={['PayMo Wallet (Primary), M-Pesa (Fallback)', 'M-Pesa only']} /></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Notify me before paying</label></div>
        </>)}
      </MBox>

      {/* 9 USAGE ANALYTICS (tabs) */}
      <MBox s={s} id="waterAnalyticsModal" active={active} size="xl" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('exportWaterModal')}>Export Report</button></>}
        title={<><i className="bi bi-bar-chart text-primary me-2" />Water Consumption Analytics</>}>
        <div className={`${s.tabPills} mb-3`}>{([['monthly', 'Monthly Trend'], ['anomalies', 'Anomalies & Leaks']] as const).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${m.tab('wanalytics', 'monthly') === k ? s.tabPillActive : ''}`} onClick={() => m.setTab('wanalytics', k)}>{l}</button>))}</div>
        {m.tab('wanalytics', 'monthly') === 'monthly' && (<div>
          <div className={s.chartBarGroup}>{([['Jan (18m³)', '50%', 'var(--pm-info)'], ['Feb (20m³)', '55%', 'var(--pm-info)'], ['Mar (19m³)', '52%', 'var(--pm-info)'], ['Apr (22m³)', '60%', 'var(--pm-info)'], ['May (34m³)', '90%', 'var(--pm-danger)'], ['Jun (24m³)', '65%', 'var(--pm-info)']] as const).map(([l, h, c]) => (<div key={l} className={s.chartBar} style={{ height: h, background: c }}><span className={s.barLabel}>{l}</span></div>))}</div>
          <div className="row g-3 mt-3">
            <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>6-Mo Average</div><div style={{ fontSize: 20, fontWeight: 700 }}>22.8 m³/mo</div></div></div>
            <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-danger-soft)' }}><div style={{ fontSize: 11, color: '#991B1B' }}>Peak Usage (May)</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-danger)' }}>34 m³ (Suspected Leak)</div></div></div>
            <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Avg Spend</div><div style={{ fontSize: 20, fontWeight: 700 }}>KES 2,850/mo</div></div></div>
          </div>
        </div>)}
        {m.tab('wanalytics', 'monthly') === 'anomalies' && (<div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', border: '1px solid #FCD34D' }}>
          <h6 style={{ fontWeight: 700, color: '#B45309' }}><i className="bi bi-exclamation-triangle" /> Continuous Flow Detected</h6>
          <p style={{ fontSize: 13, marginBottom: 0 }}>Meter at Rental Unit A shows continuous rotation between 2 AM and 4 AM for the last 3 days. This strongly indicates a running toilet or internal leak wasting approx 1.5 m³/day.</p>
          <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmD} mt-2`} onClick={() => onOpen('serviceWaterModal')}>Call Plumber</button>
        </div>)}
      </MBox>

      {/* 10 OUTAGE */}
      <MBox s={s} id="outageWaterModal" active={active} size="lg" onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-cone-striped text-warning me-2" />Rationing & Outage Tracker</>}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)' }}><div className="d-flex justify-content-between align-items-center"><div><h6 style={{ margin: 0, fontWeight: 700, color: '#1D4ED8' }}>Nairobi West Zone Rationing</h6><p style={{ margin: 0, fontSize: 12 }}>Supply scheduled: Tue, Thu, Sun</p></div><span className={`${s.badge} ${s.badgeI}`}>Active Program</span></div></div>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Notice Type</th><th>Area / Affected Account</th><th>Expected Duration</th><th>Status</th></tr></thead><tbody>
          <tr><td>Pipe Burst</td><td>Kilimani (Home)</td><td>Until 6 PM today</td><td><span className={`${s.badge} ${s.badgeW}`}>Fixing</span></td></tr>
          <tr><td>Low Pressure</td><td>Thika Rd (Workshop)</td><td>Next 48 hrs</td><td><span className={`${s.badge} ${s.badgeI}`}>Notified</span></td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded" style={{ background: 'var(--pm-surface-2)', textAlign: 'center' }}><i className="bi bi-truck text-primary d-block mb-2" style={{ fontSize: 24 }} /><p style={{ fontSize: 13, marginBottom: 12 }}>Is your storage running low due to outages?</p><button className={`${s.btnPm} ${s.btnPmP} ${s.btnSm}`} onClick={() => onOpen('orderBowserModal')}>Order Bowser Delivery</button></div>
      </MBox>

      {/* 11 NOTIFICATIONS */}
      <MBox s={s} id="waterNotificationsModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-bell me-2" />Water Alerts (4)</>}>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><i className="bi bi-droplet text-danger me-1" /> <strong>Leak Warning:</strong> Continuous flow at Rental A. <a href="#" style={{ color: 'var(--pm-primary)' }} onClick={(e) => { e.preventDefault(); onOpen('reportLeakModal') }}>Take action</a></div>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><i className="bi bi-clock text-warning me-1" /> <strong>NCWSC Bill Due:</strong> KES 3,200 due tomorrow. <a href="#" style={{ color: 'var(--pm-primary)' }} onClick={(e) => { e.preventDefault(); onOpen('payWaterModal') }}>Pay now</a></div>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><i className="bi bi-info-circle text-info me-1" /> <strong>Rationing Notice:</strong> Nairobi West supply cut on Friday.</div>
          <div className="p-3 rounded mb-2" style={{ background: '#fff', border: '1px solid var(--pm-border)', fontSize: 13 }}><i className="bi bi-check-circle text-success me-1" /> <strong>Dispute Updated:</strong> DSP-W-9912 is under review by NCWSC.</div>
        </div>
      </MBox>

      {/* 12 HEALTH */}
      <MBox s={s} id="waterHealthModal" active={active} size="lg" onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-heart-pulse text-info me-2" />Water Portfolio Health</>}>
        <div className="row g-3 mb-3">
          <div className="col-md-4"><div className={s.waterGraphic}><div className={s.waterLevel} style={{ height: '82%' }} /><div style={{ position: 'relative', zIndex: 2 }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-primary-dark)' }}>82/100</div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--pm-muted)' }}>HEALTH SCORE</div></div></div></div>
          <div className="col-md-8"><div className="row g-2">
            {([['0', 'Disconnections', 'var(--pm-accent)'], ['1', 'Suspected Leak', 'var(--pm-danger)'], ['1', 'Due Soon', 'var(--pm-warning)'], ['2', 'Storage Tanks Low', 'var(--pm-info)']] as const).map(([v, l, c]) => (<div key={l} className="col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{l}</div></div></div>))}
          </div></div>
        </div>
        <h6 style={{ fontWeight: 700 }}>Recommended Actions</h6>
        <ul style={{ fontSize: 13, color: 'var(--pm-ink-soft)', paddingLeft: 16 }}>
          <li>Dispatch plumber to Rental Unit A to investigate continuous flow indicator.</li>
          <li>Top up rooftop reserve tank at Home Kilimani before Friday rationing.</li>
          <li>Enroll NCWSC account in auto-pay to improve punctuality score.</li>
        </ul>
      </MBox>

      {/* 13 EXPORT */}
      <MBox s={s} id="exportWaterModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('exportWaterModal', 'Statement export generated and downloaded.')}>Download</button></>}
        title={<><i className="bi bi-download me-2" />Export Water Statements</>}>
        {m.body('exportWaterModal', <>
          <div className="mb-3"><Lbl s={s}>Data to Export</Lbl><Fld s={s} as="select" options={['All Water Transactions', 'Consumption Analytics (m³)', 'Only NCWSC Bills', 'Bowser Deliveries']} /></div>
          <div className="row g-3 mb-3"><div className="col-6"><Lbl s={s}>From</Lbl><input type="date" className={s.formControl} defaultValue="2025-01-01" /></div><div className="col-6"><Lbl s={s}>To</Lbl><input type="date" className={s.formControl} defaultValue="2025-06-28" /></div></div>
          <div className="mb-3"><Lbl s={s}>Format</Lbl><Fld s={s} as="select" options={['PDF Document', 'Excel / CSV']} /></div>
        </>)}
      </MBox>

      {/* 14 SHARE RECEIPT */}
      <MBox s={s} id="shareReceiptModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-share me-2" />Share Receipt</>}>
        <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface-2)' }}><i className="bi bi-receipt d-block mb-2" style={{ fontSize: 24, color: 'var(--pm-primary)' }} /><strong>NCWSC Water Payment</strong><br />KES 3,200 · Ref: WTR-8834</div>
        <div className="mb-3"><Lbl s={s}>Send to Contact</Lbl><Fld s={s} placeholder="Search saved contacts or enter number" /></div>
        <div className="d-flex gap-2"><button className={`${s.btnPm} w-100 justify-content-center`}><i className="bi bi-whatsapp" style={{ color: '#25D366' }} /> WhatsApp</button><button className={`${s.btnPm} w-100 justify-content-center`}><i className="bi bi-envelope text-primary" /> Email</button></div>
      </MBox>

      {/* 15 PROFILE */}
      <MBox s={s} id="profileModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-person-circle me-2" />Profile Summary</>}>
        <div className="text-center">
          <div className={`${s.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24, background: 'var(--pm-info)' }}>JK</div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Property Admin · james.k@email.com</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Water Wallet</span><br /><strong>KES 24,500</strong></div></div>
            <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">Linked Properties</span><br /><strong>5 Accounts</strong></div></div>
          </div>
        </div>
      </MBox>

      {/* 16 COMPARE SUPPLIERS */}
      <MBox s={s} id="compareSuppliersModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('orderBowserModal')}>Order Recommended</button></>}
        title={<><i className="bi bi-layout-split me-2" />Compare Bowser Suppliers</>}>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Feature</th><th style={{ background: 'rgba(59,130,246,.06)' }}>Nairobi Pure Water</th><th>Maji Safi Trucking</th><th>Aqua Delivery Co.</th></tr></thead><tbody>
          <tr><td>Price (10,000L)</td><td style={{ background: 'rgba(59,130,246,.03)' }}><strong>KES 7,500</strong></td><td><strong style={{ color: 'var(--pm-accent)' }}>KES 6,800</strong></td><td>KES 8,000</td></tr>
          <tr><td>Delivery Speed</td><td style={{ background: 'rgba(59,130,246,.03)' }}>4 Hours</td><td>Next Day</td><td><strong style={{ color: 'var(--pm-accent)' }}>2 Hours</strong></td></tr>
          <tr><td>Certification</td><td style={{ background: 'rgba(59,130,246,.03)' }}><i className="bi bi-patch-check text-success" /> NEMA / KEBS</td><td><i className="bi bi-patch-check text-success" /> NEMA</td><td><i className="bi bi-check text-success" /> Borehole Cert</td></tr>
          <tr><td>Hose Length</td><td style={{ background: 'rgba(59,130,246,.03)' }}>50 Meters</td><td>30 Meters</td><td>100 Meters (High rise)</td></tr>
        </tbody></table></div>
        <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-stars me-1" /> <strong>Recommendation:</strong> For standard residential tanks, Nairobi Pure Water offers the best balance of speed, price, and quality certification.</div>
      </MBox>

      {/* 17 SERVICE / PLUMBER */}
      <MBox s={s} id="serviceWaterModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('serviceWaterModal', 'Plumber requested for Rental Unit A. Partner will call you shortly.')}>Confirm Request</button></>}
        title={<><i className="bi bi-tools me-2" />Request Plumbing Service</>}>
        {m.body('serviceWaterModal', <>
          <div className="mb-3"><Lbl s={s}>Service Type</Lbl><Fld s={s} as="select" options={['Leak Detection & Repair', 'Tank Cleaning', 'Pipe Unblocking', 'Water Pump Repair']} /></div>
          <div className="mb-3"><Lbl s={s}>Property</Lbl><Fld s={s} as="select" options={['Rental Unit A', 'Home Kilimani']} /></div>
          <div className="mb-3"><Lbl s={s}>Preferred Time</Lbl><input type="datetime-local" className={s.formControl} defaultValue="2025-06-29T10:00" /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>A verified PayMo partner plumber will be dispatched. Callout fee: KES 1,000 (deducted from final repair bill).</div>
        </>)}
      </MBox>

      {/* 18 BULK PAY */}
      <MBox s={s} id="bulkWaterPayModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('bulkWaterPayModal', 'Batch payment of KES 8,350 successfully processed!')}>Pay Selected</button></>}
        title={<><i className="bi bi-collection me-2" />Bulk Water Payments</>}>
        {m.body('bulkWaterPayModal', <>
          <div className="form-check p-3 border rounded mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label ms-2 d-flex justify-content-between w-100"><span>NCWSC — Home Kilimani</span><span>KES 3,200</span></label></div>
          <div className="form-check p-3 border rounded mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label ms-2 d-flex justify-content-between w-100"><span>KIWASCO — Rental B</span><span>KES 5,150</span></label></div>
          <hr className={s.divider} /><div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 700 }}>Total</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 8,350</strong></div>
          <div className="mb-3"><Lbl s={s}>Payment Source</Lbl><Fld s={s} as="select" options={['Wallet (Balance KES 24,500)', 'M-Pesa']} /></div>
        </>)}
      </MBox>

      {/* 19 SCHEDULE */}
      <MBox s={s} id="scheduleWaterPaymentModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('scheduleWaterPaymentModal', 'Payment scheduled for 30 Jun 2025.')}>Schedule</button></>}
        title={<><i className="bi bi-calendar-event me-2" />Schedule Water Payment</>}>
        {m.body('scheduleWaterPaymentModal', <>
          <div className="mb-3"><Lbl s={s}>Account</Lbl><Fld s={s} as="select" options={['KIWASCO — 441092']} /></div>
          <div className="mb-3"><Lbl s={s}>Amount</Lbl><Fld s={s} type="number" defaultValue="5150" /></div>
          <div className="mb-3"><Lbl s={s}>Execution Date</Lbl><input type="date" className={s.formControl} defaultValue="2025-06-30" /></div>
          <div className="mb-3"><Lbl s={s}>Source</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'Bank Transfer']} /></div>
        </>)}
      </MBox>

      {/* 20 HOUSEHOLD ACCESS */}
      <MBox s={s} id="householdAccessModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('householdAccessModal', 'Permissions updated successfully.')}>Save Access</button></>}
        title={<><i className="bi bi-people me-2" />Property Access Control</>}>
        {m.body('householdAccessModal', <>
          <div className="mb-3"><Lbl s={s}>User / Tenant</Lbl><Fld s={s} as="select" options={['Brian Kamau (Son)', 'Tenant - Rental A']} /></div>
          <div className="mb-3"><Lbl s={s}>Allowed Properties (Water)</Lbl>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Rental Unit A</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Home Kilimani</label></div>
          </div>
          <div className="mb-3"><Lbl s={s}>Permission</Lbl><Fld s={s} as="select" options={['View bills only', 'Can view & pay bills']} /></div>
        </>)}
      </MBox>

      {/* 21 UPLOAD READING */}
      <MBox s={s} id="uploadWaterReadingModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('uploadWaterReadingModal', 'Reading submitted to provider for verification.')}>Submit Reading</button></>}
        title={<><i className="bi bi-camera me-2" />Upload Water Reading</>}>
        {m.body('uploadWaterReadingModal', <>
          <div className="mb-3"><Lbl s={s}>Account</Lbl><Fld s={s} as="select" options={['NCWSC — 290081', 'KIWASCO — 441092']} /></div>
          <div className="mb-3"><Lbl s={s}>Current Reading (Black digits only)</Lbl><Fld s={s} type="number" placeholder="e.g. 1042" /></div>
          <div className="mb-3"><Lbl s={s}>Photo of Meter Dial</Lbl><input type="file" className={s.formControl} /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}>Submitting accurate readings prevents estimated billing and billing shock.</div>
        </>)}
      </MBox>

      {/* 22 EMERGENCY */}
      <MBox s={s} id="emergencyWaterModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('emergencyWaterModal', 'Emergency dispatch initiated. Truck en route!')}>Dispatch Now</button></>}
        title={<><i className="bi bi-exclamation-octagon text-danger me-2" />Emergency Water Dispatch</>}>
        {m.body('emergencyWaterModal', <>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}><i className="bi bi-siren d-block mb-2" style={{ fontSize: 24 }} /><strong>Critical Shortage Protocol</strong><br /><span style={{ fontSize: 12 }}>For situations requiring immediate water delivery (under 2 hours).</span></div>
          <div className="mb-3"><Lbl s={s}>Location</Lbl><Fld s={s} defaultValue="Home Kilimani" /></div>
          <div className="mb-3"><Lbl s={s}>Volume</Lbl><Fld s={s} as="select" options={['Express 5,000L (Small truck)']} /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>Emergency dispatch carries a KES 1,500 priority fee. Total cost: KES 6,500.</div>
        </>)}
      </MBox>
    </>
  )
}
