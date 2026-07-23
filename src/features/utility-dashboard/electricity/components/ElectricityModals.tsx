import styles from '../styles/electricity.module.css'
import { MBox, Stepper, Loading, Lbl, Fld, useModals } from '../../_shared/modalKit'

const s = styles as Record<string, string>
interface Props { active: string | null; onClose: () => void; onOpen: (id: string) => void }
const pills = (m: ReturnType<typeof useModals>, k: string, def: string, opts: [string, string][]) => (
  <div className={`${s.tabPills} mb-3`}>{opts.map(([v, l]) => (<button key={v} className={`${s.tabPill} ${m.tab(k, def) === v ? s.tabPillActive : ''}`} onClick={() => m.setTab(k, v)}>{l}</button>))}</div>
)
const kv = (a: string, b: React.ReactNode, strong = false) => (<div className="d-flex justify-content-between mb-1"><span>{a}</span>{strong ? <strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>{b}</strong> : <strong>{b}</strong>}</div>)

export default function ElectricityModals({ active, onClose, onOpen }: Props) {
  const m = useModals(s, active, onClose)

  return (
    <>
      {/* 1 BUY TOKEN (4-step) */}
      <MBox s={s} id="buyTokenModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('buyToken', 4, 3, <>Buy Token <i className="bi bi-lock" /></>)} title={<><i className="bi bi-lightning-charge text-warning me-2" />Buy Prepaid Token</>}>
        {m.busy === 'buyToken' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Meter', 'Amount', 'Pay', 'Done']} current={m.step('buyToken')} />
          {m.step('buyToken') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Choose Meter</h6>
            <div className="mb-3"><Lbl s={s}>Saved Meter</Lbl><Fld s={s} as="select" options={['14825739 — Home Kilimani', '33741092 — Rental Unit A', '55128201 — Parent Home', '80291284 — Borehole Pump']} /></div>
            <div className="row g-3">
              <div className="col-md-6"><Lbl s={s}>Meter Type</Lbl><Fld s={s} as="select" options={['Prepaid Domestic', 'Prepaid Business']} /></div>
              <div className="col-md-6"><Lbl s={s}>Delivery</Lbl><Fld s={s} as="select" options={['In-app + SMS', 'SMS only', 'Email + WhatsApp']} /></div>
            </div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Current balance estimate: <strong>17 units</strong> · Last successful token on 27 Jun 2025</div>
          </div>)}
          {m.step('buyToken') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Set Amount</h6>
            <Lbl s={s}>Quick Amounts</Lbl>
            <div className="mb-3">{m.Chips({ k: 'tAmt', opts: [{ v: '500', label: '500' }, { v: '1000', label: '1,000' }, { v: '2000', label: '2,000' }, { v: '3000', label: '3,000' }, { v: '5000', label: '5,000' }, { v: '10000', label: '10,000' }] })}</div>
            <input type="number" className={s.formControl} value={m.chip('tAmt', '2000')} onChange={(e) => m.setChip('tAmt', e.target.value)} />
            <div className="row g-3 mt-1">
              <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>ESTIMATED UNITS</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-accent)' }}>141.8 kWh</div></div></div>
              <div className="col-md-6"><div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>TARIFF BAND</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 14.10/kWh</div></div></div>
            </div>
          </div>)}
          {m.step('buyToken') === 3 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Payment & Security</h6>
            <Lbl s={s}>Payment Method</Lbl>{m.payMethodRadios('tpay')}
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              {kv('Token amount', `KES ${Number(m.chip('tAmt', '2000')).toLocaleString()}`)}{kv('Fee', 'KES 0')}{kv('Delivery', 'SMS + App')}
              <hr className={s.divider} />{kv('Total', `KES ${Number(m.chip('tAmt', '2000')).toLocaleString()}`, true)}
            </div>
            <Lbl s={s}>Enter 4-digit PIN</Lbl>
            <div className={s.pinInput}>{[0, 1, 2, 3].map((i) => <input key={i} type="password" maxLength={1} />)}</div>
          </div>)}
          {m.step('buyToken') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Token Purchased Successfully</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your KPLC prepaid token is ready and has been delivered to the selected channels.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Meter</span><strong>14825739</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES {Number(m.chip('tAmt', '2000')).toLocaleString()}</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Units</span><strong>141.8 kWh</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Token</span><strong style={{ fontFamily: 'monospace', color: 'var(--pm-primary)' }}>4729-8301-5624-9173</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Reference</span><strong>TKN-20250627-8834</strong></div>
            </div>
            <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('shareTokenModal')}>Share</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('statementExportModal')}>Download</button></div>
          </div>)}
        </>)}
      </MBox>

      {/* 2 PAY POSTPAID (4-step) */}
      <MBox s={s} id="payPostpaidModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('payPostpaid', 4, 3, <>Submit Payment <i className="bi bi-arrow-right" /></>)} title={<><i className="bi bi-receipt-cutoff text-primary me-2" />Pay Postpaid Bill</>}>
        {m.busy === 'payPostpaid' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Account', 'Amount', 'Pay', 'Done']} current={m.step('payPostpaid')} />
          {m.step('payPostpaid') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Account</h6>
            <div className="mb-3"><Lbl s={s}>Postpaid Account</Lbl><Fld s={s} as="select" options={['22901847 — Office Westlands (KES 8,400)', '11820384 — Workshop Thika Rd (KES 6,950)', '77839101 — Guest House Naivasha (KES 5,240)', '99201833 — Admin Flat (KES 3,410)']} /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Current Bill</span><strong>KES 8,400</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Due Date</span><strong style={{ color: 'var(--pm-danger)' }}>Overdue 2 days</strong></div>
              <div className="d-flex justify-content-between"><span>Status</span><span className={`${s.badge} ${s.badgeD}`}>Due</span></div>
            </div>
          </div>)}
          {m.step('payPostpaid') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Amount</h6>
            <Lbl s={s}>Quick Amounts</Lbl>
            <div className="mb-3">{m.Chips({ k: 'bAmt', opts: [{ v: '8400', label: 'Full (8,400)' }, { v: '4200', label: 'Half (4,200)' }, { v: '2000', label: 'Partial (2,000)' }] })}</div>
            <input type="number" className={s.formControl} value={m.chip('bAmt', '8400')} onChange={(e) => m.setChip('bAmt', e.target.value)} />
            <div className="mt-3"><Lbl s={s}>Payment Method</Lbl>{m.payMethodRadios('bpay')}</div>
          </div>)}
          {m.step('payPostpaid') === 3 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Confirm & Authorize</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              {kv('Account', 'Office Westlands')}{kv('Account No.', '22901847')}{kv('Fee', 'KES 0')}
              <hr className={s.divider} />{kv('Total', `KES ${Number(m.chip('bAmt', '8400')).toLocaleString()}`, true)}
            </div>
            <Lbl s={s}>Enter PIN to authorize M-Pesa</Lbl>
            <div className={s.pinInput}>{[0, 1, 2, 3].map((i) => <input key={i} type="password" maxLength={1} />)}</div>
          </div>)}
          {m.step('payPostpaid') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Bill Payment Submitted</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your postpaid payment is being processed and will reflect shortly.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Account</span><strong>22901847</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES {Number(m.chip('bAmt', '8400')).toLocaleString()}</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Method</span><strong>M-Pesa STK</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Reference</span><strong>BIL-20250627-1172</strong></div>
            </div>
            <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('disputeBillModal')}>Raise issue if not reflected</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('statementExportModal')}>Download receipt</button></div>
          </div>)}
        </>)}
      </MBox>

      {/* 3 ADD METER (4-step) */}
      <MBox s={s} id="addMeterModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('addMeter', 4, 3, <>Verify & Add <i className="bi bi-check2" /></>)} title={<><i className="bi bi-plus-circle text-primary me-2" />Add Electricity Meter</>}>
        {m.busy === 'addMeter' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Category', 'Details', 'Controls', 'Done']} current={m.step('addMeter')} />
          {m.step('addMeter') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Meter Category</h6>
            <div className="row g-2">
              {([['bi-house-door', 'var(--pm-primary)', 'Home'], ['bi-building', 'var(--pm-info)', 'Office'], ['bi-key', 'var(--pm-warning)', 'Rental'], ['bi-water', 'var(--pm-accent)', 'Pump/Site']] as const).map(([ic, col, lb]) => (
                <div key={lb} className="col-md-3 col-6"><m.PickedBox k="mCat" v={lb}><i className={`bi ${ic} d-block mb-1`} style={{ fontSize: 22, color: col }} /><strong>{lb}</strong></m.PickedBox></div>
              ))}
            </div>
          </div>)}
          {m.step('addMeter') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Account Details</h6>
            <div className="row g-3">
              <div className="col-md-6"><Lbl s={s}>Meter Number</Lbl><Fld s={s} placeholder="Enter 11–15 digit meter number" /></div>
              <div className="col-md-6"><Lbl s={s}>Meter Type</Lbl><Fld s={s} as="select" options={['Prepaid', 'Postpaid']} /></div>
              <div className="col-md-6"><Lbl s={s}>Nickname</Lbl><Fld s={s} placeholder="e.g. Main House, Workshop" /></div>
              <div className="col-md-6"><Lbl s={s}>Region</Lbl><Fld s={s} as="select" options={['Nairobi', 'Kiambu', 'Nakuru', 'Mombasa', 'Kisumu']} /></div>
            </div>
          </div>)}
          {m.step('addMeter') === 3 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Controls & Alerts</h6>
            <div className="mb-3"><Lbl s={s}>Default Funding Method</Lbl><Fld s={s} as="select" options={['M-Pesa', 'PayMo Wallet', 'Bank']} /></div>
            {['Enable low-balance alert', 'Enable scheduled reminders', 'Enable auto-top-up', 'Share with household members'].map((l, i) => (
              <div key={l} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked={i < 2} id={`am-${i}`} /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`am-${i}`}>{l}</label></div>
            ))}
          </div>)}
          {m.step('addMeter') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-plug" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Meter Added Successfully</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>The meter is now visible in your electricity portfolio and ready for transactions.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Meter</span><strong>61190214</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Nickname</span><strong>Guest House Annex</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Type</span><strong>Prepaid</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Status</span><span className={`${s.badge} ${s.badgeS}`}>Active</span></div>
            </div>
          </div>)}
        </>)}
      </MBox>

      {/* 4 BULK PAY (3-step) */}
      <MBox s={s} id="bulkElectricityPayModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('bulkPay', 3, 2, <>Execute Batch <i className="bi bi-arrow-right" /></>)} title={<><i className="bi bi-collection text-purple me-2" style={{ color: 'var(--pm-purple)' }} />Bulk Electricity Payments</>}>
        {m.busy === 'bulkPay' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Select', 'Review', 'Done']} current={m.step('bulkPay')} />
          {m.step('bulkPay') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Meters to Fund</h6>
            {([['Home Kilimani', '14825739', 'KES 2,000'], ['Parent Home', '55128201', 'KES 1,500'], ['Rental Unit A', '33741092', 'KES 3,000'], ['Borehole Pump', '80291284', 'KES 1,000']] as const).map(([n, mt, amt], i) => (
              <div key={mt} className="form-check p-3 border rounded mb-2 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => m.setPicked(`bulk-${mt}`, m.isPicked(`bulk-${mt}`, 'y') ? 'n' : 'y')}>
                <input className="form-check-input" type="checkbox" readOnly checked={m.isPicked(`bulk-${mt}`, 'y')} />
                <div style={{ flex: 1 }}><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{mt}</div></div>
                <strong>{amt}</strong>{i === 0 && <span className={`${s.badge} ${s.badgeW}`}>Low</span>}
              </div>
            ))}
          </div>)}
          {m.step('bulkPay') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Review Batch</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              {kv('Meters selected', '4')}{kv('Batch total', 'KES 7,500')}{kv('Fee', 'KES 0')}
              <hr className={s.divider} />{kv('Total', 'KES 7,500', true)}
            </div>
            <Lbl s={s}>Funding Method</Lbl>{m.payMethodRadios('bulkpay')}
          </div>)}
          {m.step('bulkPay') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Batch Executed Successfully</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>4 meters funded. Tokens delivered via SMS + App.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>{kv('Batch total', 'KES 7,500')}{kv('Meters', '4 funded')}{kv('Reference', 'BLK-20250627-0091')}</div>
          </div>)}
        </>)}
      </MBox>

      {/* 5 MANAGE METER (tabs) */}
      <MBox s={s} id="manageMeterModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('manageMeter', 'Meter profile updated successfully!')}>Save Changes</button></>} title={<><i className="bi bi-gear me-2" />Manage Meter Profile</>}>
        {m.body('manageMeter', (<>
          {pills(m, 'mm', 'profile', [['profile', 'Profile'], ['controls', 'Controls'], ['sharing', 'Sharing'], ['history', 'History']])}
          {m.tab('mm', 'profile') === 'profile' && (<div>
            <div className="row g-3">
              <div className="col-md-6"><Lbl s={s}>Meter Number</Lbl><Fld s={s} defaultValue="14825739" /></div>
              <div className="col-md-6"><Lbl s={s}>Nickname</Lbl><Fld s={s} defaultValue="Home Kilimani" /></div>
              <div className="col-md-6"><Lbl s={s}>Type</Lbl><Fld s={s} as="select" options={['Prepaid', 'Postpaid']} /></div>
              <div className="col-md-6"><Lbl s={s}>Region</Lbl><Fld s={s} as="select" options={['Nairobi', 'Kiambu', 'Nakuru']} /></div>
            </div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>{kv('Provider', 'KPLC')}{kv('Current balance', '17 units')}{kv('Tariff band', 'KES 14.10/kWh')}</div>
          </div>)}
          {m.tab('mm', 'profile') === 'controls' && (<div>
            {['Enable low-balance alert', 'Enable scheduled reminders', 'Enable auto-top-up', 'Share with household members'].map((l, i) => (<div key={l} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked={i < 2} id={`mmc-${i}`} /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`mmc-${i}`}>{l}</label></div>))}
            <div className="mt-3"><Lbl s={s}>Default Funding Method</Lbl><Fld s={s} as="select" options={['M-Pesa', 'PayMo Wallet', 'Bank']} /></div>
          </div>)}
          {m.tab('mm', 'profile') === 'sharing' && (<div>
            {([['Grace Kamau', 'Full pay + manage', 'GK'], ['Mama Nyokabi', 'View only', 'MN'], ['Caretaker Joe', 'Alert only', 'CJ']] as const).map(([n, r, ini]) => (
              <div key={n} className={s.statusRow}><div className="d-flex align-items-center" style={{ gap: 8 }}><div className={s.avatar} style={{ width: 28, height: 28, fontSize: 10 }}>{ini}</div><div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r}</div></div></div><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('householdAccessModal')}>Edit</button></div>
            ))}
          </div>)}
          {m.tab('mm', 'profile') === 'history' && (<div className="table-responsive"><table className={s.table}><thead><tr><th>Date</th><th>Amount</th><th>Units</th><th>Method</th></tr></thead><tbody>
            {([['27 Jun 2025', 'KES 2,000', '141.8 kWh', 'M-Pesa'], ['24 Jun 2025', 'KES 1,500', '106.2 kWh', 'Wallet'], ['21 Jun 2025', 'KES 3,000', '212.4 kWh', 'M-Pesa']] as const).map((r) => (<tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>))}
          </tbody></table></div>)}
        </>))}
      </MBox>

      {/* 6 AUTO TOP-UP (tabs) */}
      <MBox s={s} id="autoTopupModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('autoTopup', 'Auto-top-up rule saved successfully!')}>Save Rule</button></>} title={<><i className="bi bi-arrow-repeat text-primary me-2" />Auto-Top-Up Rule Builder</>}>
        {m.body('autoTopup', (<>
          {pills(m, 'at', 'create', [['create', 'Create Rule'], ['existing', 'Existing Rules'], ['failsafe', 'Fail-safe']])}
          {m.tab('at', 'create') === 'create' && (<div>
            <div className="row g-3">
              <div className="col-md-6"><Lbl s={s}>Meter</Lbl><Fld s={s} as="select" options={['Home Kilimani — 14825739', 'Parent Home — 55128201', 'Borehole Pump — 80291284']} /></div>
              <div className="col-md-6"><Lbl s={s}>Trigger</Lbl><Fld s={s} as="select" options={['When units below threshold', 'On a schedule', 'When bill is due']} /></div>
              <div className="col-md-6"><Lbl s={s}>Threshold (units)</Lbl><Fld s={s} type="number" defaultValue="20" /></div>
              <div className="col-md-6"><Lbl s={s}>Top-up Amount</Lbl><Fld s={s} type="number" defaultValue="2000" /></div>
            </div>
            <div className="mt-3"><Lbl s={s}>Funding Method</Lbl>{m.payMethodRadios('atpay')}</div>
          </div>)}
          {m.tab('at', 'create') === 'existing' && (<div>
            {([['Home meter', 'KES 2,000 when units < 20', 'badgeS', 'Active'], ['Parent home', 'KES 1,500 when units < 15', 'badgeS', 'Active'], ['Borehole pump', 'KES 1,000 every Tuesday 7 PM', 'badgeW', 'Paused'], ['Rental A', 'Notify only when units < 25', 'badgeI', 'Alert'], ['Office bill', 'Pay full bill 2 days before due', 'badgeS', 'Active']] as const).map(([n, r, t, st]) => (
              <div key={n} className={s.statusRow}><div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r}</div></div><span className={`${s.badge} ${s[t]}`}>{st}</span></div>
            ))}
          </div>)}
          {m.tab('at', 'create') === 'failsafe' && (<div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><i className="bi bi-shield-exclamation me-1" /> If primary funding method fails, PayMo will retry using your fallback method before alerting you.</div>
            <div className="mb-3"><Lbl s={s}>Fallback Method</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'Equity Bank ***4521', 'M-Pesa 0712***890']} /></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked id="ff1" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="ff1">Retry up to 3 times before failing</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked id="ff2" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="ff2">Notify me on every failure</label></div>
          </div>)}
        </>))}
      </MBox>

      {/* 7 USAGE ANALYTICS (tabs) */}
      <MBox s={s} id="usageAnalyticsModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-graph-up-arrow text-info me-2" />Usage Analytics & Consumption</>}>
        {pills(m, 'ua', 'daily', [['daily', 'Daily'], ['monthly', 'Monthly'], ['peak', 'Peak Hours'], ['anomaly', 'Anomalies']])}
        {m.tab('ua', 'daily') === 'daily' && (<div>
          <div className="row g-2 mb-3">{([['Avg Daily', '116 kWh'], ['Peak Day', '182 kWh'], ['Lowest Day', '74 kWh']] as const).map(([l, v]) => (<div key={l} className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{l}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div></div></div>))}</div>
          <div className={s.chartBarGroup}>{[['Mon', '60%'], ['Tue', '72%'], ['Wed', '55%'], ['Thu', '80%'], ['Fri', '68%'], ['Sat', '90%'], ['Sun', '48%']].map(([mo, h]) => (<div key={mo} className={s.chartBar} style={{ height: h, background: 'var(--pm-info)' }}><span className={s.barLabel}>{mo}</span></div>))}</div>
        </div>)}
        {m.tab('ua', 'daily') === 'monthly' && (<div>
          <div className={s.chartBarGroup}>{[['Jan', '58%'], ['Feb', '66%'], ['Mar', '81%'], ['Apr', '74%'], ['May', '70%'], ['Jun', '62%']].map(([mo, h]) => (<div key={mo} className={s.chartBar} style={{ height: h, background: 'var(--pm-accent)' }}><span className={s.barLabel}>{mo}</span></div>))}</div>
          <p className="mt-3" style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>6-month average: <strong>3,180 kWh</strong>. Consumption trending 6.4% below forecast.</p>
        </div>)}
        {m.tab('ua', 'daily') === 'peak' && (<div>
          {([['7pm – 10pm', 'Peak', 'badgeD', 'Highest load · lighting + cooking'], ['5pm – 7pm', 'High', 'badgeW', 'Evening ramp-up'], ['10pm – 6am', 'Off-peak', 'badgeS', 'Lowest tariff band']] as const).map(([t, b, tone, sub]) => (<div key={t} className={s.statusRow}><div><strong>{t}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><span className={`${s.badge} ${s[tone]}`}>{b}</span></div>))}
        </div>)}
        {m.tab('ua', 'daily') === 'anomaly' && (<div>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Office Westlands</strong> — 38% spike on 18 Jun (aircon load). Potential saving KES 2,100/mo by shifting to off-peak.</div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Borehole Pump</strong> — runs overnight on peak tariff. Reschedule to save KES 1,400/mo.</div>
        </div>)}
      </MBox>

      {/* 8 DISPUTE BILL (tabs) */}
      <MBox s={s} id="disputeBillModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('disputeBill', 'Dispute submitted successfully. Ticket DSP-22818 has been created.', 'DSP-22818')}>Submit Dispute</button></>} title={<><i className="bi bi-exclamation-circle text-warning me-2" />Billing Dispute</>}>
        {m.body('disputeBill', (<>
          {pills(m, 'dp', 'new', [['new', 'New Dispute'], ['existing', 'Existing'], ['evidence', 'Evidence']])}
          {m.tab('dp', 'new') === 'new' && (<div>
            <div className="mb-3"><Lbl s={s}>Account / Meter</Lbl><Fld s={s} as="select" options={['22901847 — Office Westlands', '99201833 — Admin Flat', '14825739 — Home Kilimani']} /></div>
            <div className="mb-3"><Lbl s={s}>Dispute Reason</Lbl><Fld s={s} as="select" options={['Unusually high bill', 'Incorrect meter reading', 'Double billing', 'Wrong tariff band', 'Other']} /></div>
            <div className="mb-3"><Lbl s={s}>Disputed Amount</Lbl><Fld s={s} type="number" defaultValue="8400" /></div>
            <div><Lbl s={s}>Explanation</Lbl><Fld s={s} as="textarea" placeholder="Describe the issue with your bill..." /></div>
          </div>)}
          {m.tab('dp', 'new') === 'existing' && (<div>
            {([['DSP-22419', 'Office Westlands · awaiting reply', 'badgeW'], ['DSP-22101', 'Admin Flat · resolved (credit issued)', 'badgeS']] as const).map(([id, sub, t]) => (<div key={id} className={s.statusRow}><div><strong>{id}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><span className={`${s.badge} ${s[t]}`}>{t === 'badgeW' ? 'Open' : 'Closed'}</span></div>))}
          </div>)}
          {m.tab('dp', 'new') === 'evidence' && (<div>
            <div className="p-3 rounded mb-3 text-center" style={{ border: '1px dashed var(--pm-border-2)', cursor: 'pointer' }}><i className="bi bi-cloud-arrow-up d-block mb-2" style={{ fontSize: 28, color: 'var(--pm-primary)' }} /><strong>Upload meter photo / receipt</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PNG, JPG or PDF up to 10MB</div></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked id="dpe" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="dpe">Attach current bill snapshot automatically</label></div>
          </div>)}
        </>))}
      </MBox>

      {/* 9 OUTAGE TRACKER (tabs) */}
      <MBox s={s} id="outageTrackerModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-broadcast-pin text-purple me-2" style={{ color: 'var(--pm-purple)' }} />Outage Tracker & Maintenance Notices</>}>
        {pills(m, 'ot', 'planned', [['planned', 'Planned'], ['reported', 'Reported'], ['sla', 'SLA']])}
        {m.tab('ot', 'planned') === 'planned' && (<div>
          {([['Planned maintenance — Rental Unit B', '28 Jun · 9 AM – 3 PM · line upgrade', 'badgeW', 'Planned'], ['Transformer upgrade — Nairobi West', '02 Jul · 10 AM – 2 PM', 'badgeW', 'Planned']] as const).map(([t, meta, tone, b]) => (<div key={t} className={s.statusRow}><div><strong>{t}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{meta}</div></div><span className={`${s.badge} ${s[tone]}`}>{b}</span></div>))}
        </div>)}
        {m.tab('ot', 'planned') === 'reported' && (<div>
          {([['Reported outage — Home meter area', 'Ticket OUT-89244 · queued for verification', 'badgeI', 'Reported'], ['Office voltage complaint', 'Technician visit expected today 2 PM', 'badgeD', 'Escalated'], ['Resolved outage — Parent Home', 'Closed on 22 Jun · service restored', 'badgeS', 'Resolved']] as const).map(([t, meta, tone, b]) => (<div key={t} className={s.statusRow}><div><strong>{t}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{meta}</div></div><span className={`${s.badge} ${s[tone]}`}>{b}</span></div>))}
        </div>)}
        {m.tab('ot', 'planned') === 'sla' && (<div>
          <div className="row g-2">{([['Avg Response', '42 min'], ['Resolution SLA', '4 hrs'], ['Restoration Rate', '98.2%']] as const).map(([l, v]) => (<div key={l} className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{l}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div></div></div>))}</div>
          <p className="mt-3" style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>KPLC commit: critical faults restored within 4 hours in urban zones.</p>
        </div>)}
      </MBox>

      {/* 10 TOKEN HISTORY (xl) */}
      <MBox s={s} id="tokenHistoryModal" active={active} size="xl" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('statementExportModal')}><i className="bi bi-download" /> Export</button></>} title={<><i className="bi bi-safe me-2" />Token Vault & Purchase History</>}>
        <div className="row g-2 mb-3">{([['Purchased (Month)', 'KES 31,250'], ['Units', '2,198 kWh'], ['Tokens', '14']] as const).map(([l, v]) => (<div key={l} className="col-md-4"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{l}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div></div></div>))}</div>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Date</th><th>Meter</th><th>Amount</th><th>Units</th><th>Token</th><th>Method</th><th>Action</th></tr></thead><tbody>
          {([['27 Jun 2025', '14825739', 'KES 2,000', '141.8 kWh', '4729-8301-5624-9173', 'M-Pesa'], ['24 Jun 2025', '55128201', 'KES 1,500', '106.2 kWh', '8831-2204-1794-5560', 'Wallet'], ['21 Jun 2025', '33741092', 'KES 3,000', '212.4 kWh', '1190-6642-3308-7781', 'M-Pesa'], ['18 Jun 2025', '80291284', 'KES 1,000', '70.9 kWh', '5527-9013-2281-0042', 'Bank']] as const).map((r) => (
            <tr key={r[4]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><code>{r[4]}</code></td><td>{r[5]}</td><td><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('shareTokenModal')}><i className="bi bi-send" /></button></td></tr>
          ))}
        </tbody></table></div>
      </MBox>

      {/* 11 SHARE TOKEN */}
      <MBox s={s} id="shareTokenModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('shareToken', 'Token shared successfully. Delivery confirmation will appear in your activity log.')}>Send</button></>} title={<><i className="bi bi-send me-2" />Share Token</>}>
        {m.body('shareToken', (<div>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>TOKEN</div><div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--pm-primary)', fontSize: 16 }}>4729-8301-5624-9173</div></div>
          <div className="mb-3"><Lbl s={s}>Share via</Lbl><Fld s={s} as="select" options={['WhatsApp', 'SMS', 'Email', 'Copy link']} /></div>
          <div><Lbl s={s}>Recipient</Lbl><Fld s={s} placeholder="Phone number or email" /></div>
        </div>))}
      </MBox>

      {/* 12 LOW BALANCE ALERT */}
      <MBox s={s} id="lowBalanceAlertModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('lowBalanceAlert', 'Low balance alert preferences updated!')}>Save</button></>} title={<><i className="bi bi-bell-exclamation text-warning me-2" />Low Balance Alert Settings</>}>
        {m.body('lowBalanceAlert', (<div>
          <div className="mb-3"><Lbl s={s}>Meter</Lbl><Fld s={s} as="select" options={['Rental Unit A — 33741092', 'Home Kilimani — 14825739']} /></div>
          <div className="mb-3"><Lbl s={s}>Alert me when units below</Lbl><Fld s={s} type="number" defaultValue="25" /></div>
          {['Send SMS alert', 'Send push notification', 'Auto-suggest top-up amount'].map((l, i) => (<div key={l} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked id={`lb-${i}`} /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`lb-${i}`}>{l}</label></div>))}
        </div>))}
      </MBox>

      {/* 13 BILL BREAKDOWN */}
      <MBox s={s} id="billBreakdownModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('payPostpaidModal')}>Pay this bill</button></>} title={<><i className="bi bi-list-columns me-2" />Detailed Bill Breakdown</>}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
          {([['Base Charge', 'Energy units', 'KES 6,220'], ['Fuel Cost Charge', 'Monthly adjustment', 'KES 850'], ['VAT 16%', 'Inclusive bill tax', 'KES 1,138'], ['Levies & Forex', 'ERC / REA / Forex', 'KES 192'], ['Previous Balance', 'Carried forward', 'KES 0']] as const).map(([l, sub, amt]) => (<div key={l} className={s.statusRow}><div><strong>{l}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><strong>{amt}</strong></div>))}
          <hr className={s.divider} /><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total Due</span><strong style={{ fontSize: 18, color: 'var(--pm-danger)' }}>KES 8,400</strong></div>
        </div>
      </MBox>

      {/* 14 TARIFF CALCULATOR */}
      <MBox s={s} id="tariffCalculatorModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-calculator me-2" style={{ color: 'var(--pm-primary)' }} />Tariff & Unit Estimator</>}>
        <div className="mb-3"><Lbl s={s}>Amount (KES)</Lbl><input type="number" className={s.formControl} defaultValue={2000} /></div>
        <div className="mb-3"><Lbl s={s}>Tariff Band</Lbl><Fld s={s} as="select" options={['Domestic — KES 14.10/kWh', 'Business — KES 18.40/kWh', 'Off-peak — KES 11.20/kWh']} /></div>
        <div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>ESTIMATED UNITS</div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--pm-accent)' }}>141.8 kWh</div><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>≈ 1.2 days at current usage</div></div>
      </MBox>

      {/* 15 BILL FORECAST */}
      <MBox s={s} id="billForecastModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-graph-up-arrow text-info me-2" />Bill Forecast & Prediction</>}>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>FORECAST NEXT BILL (OFFICE)</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>KES 10,950</div><div style={{ fontSize: 12, color: '#92400E' }}>Budget KES 9,500 · over by KES 1,450</div></div>
        {([['Home Kilimani', 'KES 7,920', 'badgeS', 'On track'], ['Office Westlands', 'KES 10,950', 'badgeD', 'Over budget'], ['Rental Unit A', 'KES 5,110', 'badgeI', 'Stable']] as const).map(([n, v, t, st]) => (<div key={n} className={s.statusRow}><div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{v}</div></div><span className={`${s.badge} ${s[t]}`}>{st}</span></div>))}
      </MBox>

      {/* 16 UPLOAD READING */}
      <MBox s={s} id="uploadReadingModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('uploadReading', 'Meter reading uploaded and attached to the selected case.')}>Upload</button></>} title={<><i className="bi bi-camera text-info me-2" />Upload Meter Reading</>}>
        {m.body('uploadReading', (<div>
          <div className="mb-3"><Lbl s={s}>Meter / Case</Lbl><Fld s={s} as="select" options={['DSP-22419 — Office Westlands', '14825739 — Home Kilimani']} /></div>
          <div className="p-3 rounded mb-3 text-center" style={{ border: '1px dashed var(--pm-border-2)', cursor: 'pointer' }}><i className="bi bi-cloud-arrow-up d-block mb-2" style={{ fontSize: 28, color: 'var(--pm-info)' }} /><strong>Upload meter photo</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>PNG or JPG up to 10MB</div></div>
          <div><Lbl s={s}>Current Reading (kWh)</Lbl><Fld s={s} type="number" placeholder="Enter visible meter reading" /></div>
        </div>))}
      </MBox>

      {/* 17 REPORT OUTAGE */}
      <MBox s={s} id="reportOutageModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('reportOutage', 'Outage report submitted. Tracking ID OUT-89244 created.', 'OUT-89244')}>Submit</button></>} title={<><i className="bi bi-cone-striped text-danger me-2" />Report Power Outage</>}>
        {m.body('reportOutage', (<div>
          <div className="mb-3"><Lbl s={s}>Affected Meter / Area</Lbl><Fld s={s} as="select" options={['Home meter area', 'Rental Unit B', 'Office Westlands', 'Borehole Pump']} /></div>
          <div className="mb-3"><Lbl s={s}>Outage Type</Lbl><Fld s={s} as="select" options={['Complete blackout', 'Low voltage / flickering', 'Sparking / exposed cable', 'Transformer fault']} /></div>
          <div><Lbl s={s}>Details</Lbl><Fld s={s} as="textarea" placeholder="Describe what you're experiencing..." /></div>
        </div>))}
      </MBox>

      {/* 18 SERVICE REQUEST */}
      <MBox s={s} id="serviceRequestModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('serviceRequest', 'Service request logged successfully. Ticket SRQ-11904 created.', 'SRQ-11904')}>Submit</button></>} title={<><i className="bi bi-tools me-2" />Electricity Service Request</>}>
        {m.body('serviceRequest', (<div>
          <div className="mb-3"><Lbl s={s}>Request Type</Lbl><Fld s={s} as="select" options={['New connection', 'Meter replacement', 'Name / label change', 'Tariff change', 'Faulty meter inspection']} /></div>
          <div className="mb-3"><Lbl s={s}>Meter / Account</Lbl><Fld s={s} as="select" options={['Parent Home — 55128201', 'Office Westlands — 22901847', 'Home Kilimani — 14825739']} /></div>
          <div><Lbl s={s}>Notes</Lbl><Fld s={s} as="textarea" placeholder="Additional details for the technician..." /></div>
        </div>))}
      </MBox>

      {/* 19 STATEMENT EXPORT */}
      <MBox s={s} id="statementExportModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('statementExport', 'Electricity report generated successfully. Your export is ready.')}>Generate</button></>} title={<><i className="bi bi-download me-2" style={{ color: 'var(--pm-accent)' }} />Export Electricity</>}>
        {m.body('statementExport', (<div>
          <div className="mb-3"><Lbl s={s}>Report Type</Lbl><Fld s={s} as="select" options={['Full statement', 'Token purchases only', 'Postpaid bills only', 'Consumption (kWh) report']} /></div>
          <div className="row g-3"><div className="col-md-6"><Lbl s={s}>From</Lbl><Fld s={s} type="date" defaultValue="2025-06-01" /></div><div className="col-md-6"><Lbl s={s}>To</Lbl><Fld s={s} type="date" defaultValue="2025-06-30" /></div></div>
          <div className="mt-3"><Lbl s={s}>Format</Lbl><Fld s={s} as="select" options={['PDF', 'CSV', 'Excel']} /></div>
        </div>))}
      </MBox>

      {/* 20 SUGGESTIONS */}
      <MBox s={s} id="suggestionsModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Later</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('suggestions', 'Optimization plan saved to your electricity dashboard actions list.')}>Adopt Plan</button></>} title={<><i className="bi bi-stars text-purple me-2" style={{ color: 'var(--pm-purple)' }} />Optimization Suggestions</>}>
        {m.body('suggestions', (<div>
          {([['Shift borehole pumping to off-peak', 'Save KES 2,100/month', 'badgeS'], ['Reschedule water heater to 10pm–5am', 'Save KES 1,400/month', 'badgeS'], ['Enable auto-top-up on 3 meters', 'Avoid disconnection penalties', 'badgeI'], ['Upgrade Office aircon to inverter', 'Save ~KES 3,200/month', 'badgeW']] as const).map(([t, sub, tone]) => (<div key={t} className={s.feedItem}><div className={s.iconCircle} style={{ background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', fontSize: 12 }}><i className="bi bi-lightbulb" /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><span className={`${s.badge} ${s[tone]}`}>AI</span></div>))}
        </div>))}
      </MBox>

      {/* 21 EMERGENCY CREDIT */}
      <MBox s={s} id="emergencyCreditModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('emergencyCredit', 'Emergency credit activated successfully. 15 kWh has been provisioned.', 'ECR-20250627-2201')}>Activate Credit</button></>} title={<><i className="bi bi-lightning text-danger me-2" />Emergency Electricity Credit</>}>
        {m.body('emergencyCredit', (<div>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-danger-soft)' }}><i className="bi bi-lightning-charge-fill d-block mb-1" style={{ fontSize: 26, color: 'var(--pm-danger)' }} /><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-danger)' }}>15 kWh available</div><div style={{ fontSize: 12, color: '#7F1D1D' }}>Borehole Pump · repay on next purchase</div></div>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Emergency credit keeps essential meters running until your next token purchase. A small service fee applies and is deducted automatically on recharge.</p>
        </div>))}
      </MBox>

      {/* 22 REDEMPTION CHECK */}
      <MBox s={s} id="redemptionCheckModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('redemptionCheck', 'Redemption status recorded successfully.')}>Save</button></>} title={<><i className="bi bi-check2-square me-2" />Token Redemption Check</>}>
        {m.body('redemptionCheck', (<div>
          <div className="mb-3"><Lbl s={s}>Token</Lbl><Fld s={s} defaultValue="4729-8301-5624-9173" /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>{kv('Meter', '14825739')}{kv('Status', <span className={`${s.badge} ${s.badgeS}`}>Redeemed</span>)}{kv('Redeemed at', '27 Jun 2025 · 09:14')}</div>
        </div>))}
      </MBox>

      {/* 23 HOUSEHOLD ACCESS */}
      <MBox s={s} id="householdAccessModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('householdAccess', 'Access permissions updated and member notified.')}>Save Permissions</button></>} title={<><i className="bi bi-people me-2" />Household & Team Access Control</>}>
        {m.body('householdAccess', (<div>
          <div className="mb-3"><Lbl s={s}>Member</Lbl><Fld s={s} as="select" options={['Grace Kamau', 'Mama Nyokabi', 'Caretaker Joe', '+ Invite new member']} /></div>
          <div className="mb-3"><Lbl s={s}>Role</Lbl><Fld s={s} as="select" options={['Primary household manager', 'Full pay + manage', 'View only', 'Alert only']} /></div>
          <div className="mb-2"><Lbl s={s}>Accessible Meters</Lbl></div>
          {['Home Kilimani', 'Parent Home', 'Rental Unit A', 'Borehole Pump'].map((mt, i) => (<div key={mt} className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked={i < 2} id={`ha-${i}`} /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`ha-${i}`}>{mt}</label></div>))}
        </div>))}
      </MBox>

      {/* 24 NOTIFICATIONS */}
      <MBox s={s} id="electricityNotifModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-bell me-2" />Electricity Notifications</>}>
        {([['bi-lightning-charge', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Token delivered', 'KES 2,000 → Home meter · 141.8 kWh', '2m ago'], ['bi-exclamation-triangle', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'Postpaid overdue', 'Office Westlands overdue by 2 days', '1h ago'], ['bi-broadcast-pin', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'Planned outage', 'Rental Unit B · tomorrow 9 AM – 3 PM', '3h ago'], ['bi-stars', 'var(--pm-accent-soft)', 'var(--pm-accent)', 'Savings opportunity', 'Shift borehole pumping to save KES 2,100/mo', 'Today']] as const).map(([ic, bg, col, t, sub, when]) => (
          <div key={t} className={s.feedItem}><div className={s.iconCircle} style={{ background: bg, color: col, fontSize: 13 }}><i className={`bi ${ic}`} /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><small style={{ color: 'var(--pm-muted)' }}>{when}</small></div>
        ))}
      </MBox>

      {/* 25 PORTFOLIO HEALTH */}
      <MBox s={s} id="portfolioHealthModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-heart-pulse text-info me-2" />Electricity Portfolio Health</>}>
        <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>PORTFOLIO HEALTH SCORE</div><div style={{ fontSize: 34, fontWeight: 700, color: 'var(--pm-accent)' }}>86 / 100</div><div style={{ fontSize: 12, color: '#065F46' }}>Good — 2 accounts need attention</div></div>
        {([['8 meters linked', 'All providers reachable', 'badgeS'], ['5 auto-rules active', '2 active · 1 paused · 2 alerts', 'badgeI'], ['1 overdue bill', 'Office Westlands KES 8,400', 'badgeD'], ['4 outages tracked', '1 planned · 1 escalated', 'badgeW']] as const).map(([t, sub, tone]) => (<div key={t} className={s.statusRow}><div><strong>{t}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><span className={`${s.badge} ${s[tone]}`}>{tone === 'badgeS' ? 'OK' : tone === 'badgeI' ? 'Info' : tone === 'badgeD' ? 'Action' : 'Watch'}</span></div>))}
      </MBox>

      {/* 26 METER COMPARE */}
      <MBox s={s} id="meterCompareModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-layout-split me-2" />Compare Meters</>}>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Meter</th><th>This Month</th><th>vs Avg</th><th>Cost / kWh</th><th>Status</th></tr></thead><tbody>
          {([['Home Kilimani', '412 kWh', '-9%', 'KES 14.10', 'badgeS', 'Healthy'], ['Office Westlands', '1,188 kWh', '+22%', 'KES 18.40', 'badgeD', 'Over Budget'], ['Rental Unit A', '289 kWh', '-3%', 'KES 14.10', 'badgeI', 'Stable'], ['Borehole Pump', '521 kWh', '+11%', 'KES 14.10', 'badgeW', 'Optimize']] as const).map((r) => (<tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><span className={`${s.badge} ${s[r[4]]}`}>{r[5]}</span></td></tr>))}
        </tbody></table></div>
      </MBox>

      {/* 27 ATTENTION */}
      <MBox s={s} id="attentionModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-exclamation-triangle text-warning me-2" />Electricity — Attention Required</>}>
        {([['KP', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'Office postpaid overdue by 2 days', 'Acc #KPLC-22901847 · KES 8,400', 'Pay', 'payPostpaidModal', 'btnPmP'], ['LB', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Home prepaid balance below 20 units', 'Meter #14825739 · est. 1.2 days left', 'Top-up', 'buyTokenModal', ''], ['OT', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'Planned outage near Rental Unit B', 'Tomorrow, 9:00 AM – 3:00 PM', 'Review', 'outageTrackerModal', ''], ['DR', 'var(--pm-info-soft)', 'var(--pm-info)', 'Meter reading dispute response ready', 'Ticket #DSP-22419 · action required', 'Open', 'disputeBillModal', ''], ['AL', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'Auto-top-up failure on Borehole Pump', 'Update fallback payment method', 'Fix', 'autoTopupModal', '']] as const).map(([ini, bg, col, t, sub, lb, mod, cls]) => (
          <div key={t} className={s.feedItem}><div className={s.iconCircle} style={{ background: bg, color: col, fontSize: 12 }}>{ini}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><button className={`${s.btnPm} ${s.btnSm} ${cls ? s[cls] : ''}`} onClick={() => onOpen(mod)}>{lb}</button></div>
        ))}
      </MBox>

      {/* 28 PROFILE */}
      <MBox s={s} id="profileModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-person-circle me-2" />Profile Summary</>}>
        <div className="text-center mb-3"><div className={`${s.avatar} mx-auto`} style={{ width: 56, height: 56, fontSize: 18, background: 'var(--pm-gradient-hero)' }}>JK</div><div style={{ fontWeight: 700, marginTop: 8 }}>James K.</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Power Portfolio Owner · Nairobi</div></div>
        <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>{kv('Meters managed', '8')}{kv('Monthly spend', 'KES 78,900')}{kv('Member since', 'Jan 2023')}{kv('Plan', <span className={`${s.badge} ${s.badgeP}`}>PayMo Pro</span>)}</div>
      </MBox>
    </>
  )
}
