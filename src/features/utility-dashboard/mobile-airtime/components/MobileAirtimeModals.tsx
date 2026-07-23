import styles from '../styles/mobile-airtime.module.css'
import { MBox, Stepper, Loading, Lbl, Fld, useModals } from '../../_shared/modalKit'

const s = styles as Record<string, string>
interface Props { active: string | null; onClose: () => void; onOpen: (id: string) => void }
const pills = (m: ReturnType<typeof useModals>, k: string, def: string, opts: [string, string][]) => (
  <div className={`${s.tabPills} mb-3`}>{opts.map(([v, l]) => (<button key={v} className={`${s.tabPill} ${m.tab(k, def) === v ? s.tabPillActive : ''}`} onClick={() => m.setTab(k, v)}>{l}</button>))}</div>
)
const kv = (a: string, b: React.ReactNode, strong = false) => (<div className="d-flex justify-content-between mb-1"><span>{a}</span>{strong ? <strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>{b}</strong> : <strong>{b}</strong>}</div>)

export default function MobileAirtimeModals({ active, onClose, onOpen }: Props) {
  const m = useModals(s, active, onClose)

  return (
    <>
      {/* 1 BUY AIRTIME (3-step) */}
      <MBox s={s} id="buyAirtimeModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('buyAirtime', 3, 2, <>Buy Airtime <i className="bi bi-lock" /></>)} title={<><i className="bi bi-phone text-success me-2" style={{ color: 'var(--pm-accent)' }} />Buy Airtime</>}>
        {m.busy === 'buyAirtime' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Details', 'Pay', 'Done']} current={m.step('buyAirtime')} />
          {m.step('buyAirtime') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Details</h6>
            <div className={`${s.tabPills} mb-3`}><button className={`${s.tabPill} ${m.tab('airWho', 'my') === 'my' ? s.tabPillActive : ''}`} onClick={() => m.setTab('airWho', 'my')}>My Number</button><button className={`${s.tabPill} ${m.tab('airWho', 'my') === 'other' ? s.tabPillActive : ''}`} onClick={() => m.setTab('airWho', 'other')}>Other Number</button></div>
            <div className="mb-3"><Lbl s={s}>Phone Number</Lbl>{m.tab('airWho', 'my') === 'my' ? <Fld s={s} as="select" options={['0712 345 890 (Safaricom)', '0733 987 456 (Airtel)', '0777 112 233 (Telkom)']} /> : <Fld s={s} placeholder="Enter recipient phone number" />}</div>
            <Lbl s={s}>Quick Amount</Lbl>
            <div className="mb-3">{m.Chips({ k: 'airAmt', opts: [{ v: '50', label: '50' }, { v: '100', label: '100' }, { v: '250', label: '250' }, { v: '500', label: '500' }, { v: '1000', label: '1,000' }] })}</div>
            <input type="number" className={s.formControl} value={m.chip('airAmt', '250')} onChange={(e) => m.setChip('airAmt', e.target.value)} placeholder="Custom amount" />
          </div>)}
          {m.step('buyAirtime') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Pay</h6>
            <Lbl s={s}>Payment Method</Lbl>{m.payMethodRadios('airpay', [['M-Pesa Wallet', 'bi-wallet2', 'var(--pm-primary)', 'KES 48,250 available', true], ['Equity Bank', 'bi-bank', 'var(--pm-info)', '***4521', false]])}
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>{kv('Amount', `KES ${Number(m.chip('airAmt', '250')).toLocaleString()}`)}{kv('Fee', 'KES 0')}<hr className={s.divider} />{kv('Total', `KES ${Number(m.chip('airAmt', '250')).toLocaleString()}`, true)}</div>
          </div>)}
          {m.step('buyAirtime') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Airtime Purchased!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>KES {Number(m.chip('airAmt', '250')).toLocaleString()} added to 0712 345 890.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>{kv('Amount', `KES ${Number(m.chip('airAmt', '250')).toLocaleString()}`)}{kv('Reference', 'AIR-20250627-4412')}</div>
          </div>)}
        </>)}
      </MBox>

      {/* 2 SEND MONEY CROSS NETWORK (3-step) */}
      <MBox s={s} id="sendMoneyCrossNetworkModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('xnet', 3, 2, <>Send Money <i className="bi bi-send" /></>)} title={<><i className="bi bi-shuffle text-info me-2" />Send Money Across Networks</>}>
        {m.busy === 'xnet' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Recipient', 'Amount', 'Done']} current={m.step('xnet')} />
          {m.step('xnet') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Recipient</h6>
            <div className="mb-3"><Lbl s={s}>Recipient Phone</Lbl><Fld s={s} placeholder="e.g. 0733 000 000" /></div>
            <div className="mb-3"><Lbl s={s}>Network</Lbl><Fld s={s} as="select" options={['Airtel Money', 'T-Kash (Telkom)', 'M-Pesa', 'PesaLink (Bank)']} /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><i className="bi bi-check-circle me-1" style={{ color: 'var(--pm-accent)' }} /> 0% PayMo interoperability fee · real-time delivery</div>
          </div>)}
          {m.step('xnet') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Amount</h6>
            <Lbl s={s}>Quick Amounts</Lbl>
            <div className="mb-3">{m.Chips({ k: 'xnAmt', opts: [{ v: '500', label: '500' }, { v: '1000', label: '1,000' }, { v: '1500', label: '1,500' }, { v: '5000', label: '5,000' }] })}</div>
            <input type="number" className={s.formControl} value={m.chip('xnAmt', '1500')} onChange={(e) => m.setChip('xnAmt', e.target.value)} />
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)' }}>{kv('Amount', `KES ${Number(m.chip('xnAmt', '1500')).toLocaleString()}`)}{kv('PayMo Fee', 'KES 0')}{kv('Network Fee', 'KES 0')}<hr className={s.divider} />{kv('Total', `KES ${Number(m.chip('xnAmt', '1500')).toLocaleString()}`, true)}</div>
          </div>)}
          {m.step('xnet') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Money Sent Successfully!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>KES {Number(m.chip('xnAmt', '1500')).toLocaleString()} delivered to Airtel Money recipient.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>{kv('Amount', `KES ${Number(m.chip('xnAmt', '1500')).toLocaleString()}`)}{kv('Fee', 'KES 0')}{kv('Reference', 'XNET-20250627-7781')}</div>
          </div>)}
        </>)}
      </MBox>

      {/* 3 M-PESA GLOBAL (3-step) */}
      <MBox s={s} id="mPesaGlobalModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('global', 3, 2, <>Send Global <i className="bi bi-globe" /></>)} title={<><i className="bi bi-globe me-2" />M-Pesa Global Transfers</>}>
        {m.busy === 'global' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Destination', 'Amount', 'Done']} current={m.step('global')} />
          {m.step('global') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Destination</h6>
            <div className="mb-3"><Lbl s={s}>Country</Lbl><Fld s={s} as="select" options={['Uganda (MTN / Airtel)', 'Tanzania (Vodacom / Tigo)', 'Rwanda (MTN)', 'Ghana (MTN)']} /></div>
            <div className="mb-3"><Lbl s={s}>Recipient Phone</Lbl><Fld s={s} placeholder="+256 ..." /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>FX rate locked for 10 minutes · 1 USD ≈ KES 129.40</div>
          </div>)}
          {m.step('global') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Amount</h6>
            <div className="mb-3"><Lbl s={s}>Amount (KES)</Lbl><input type="number" className={s.formControl} defaultValue={5000} /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>{kv('Send', 'KES 5,000')}{kv('FX Fee', 'KES 125')}{kv('Recipient gets', 'UGX 98,200')}<hr className={s.divider} />{kv('Total debit', 'KES 5,125', true)}</div>
          </div>)}
          {m.step('global') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Global Transfer Sent!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>UGX 98,200 delivered to Uganda recipient.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>{kv('Sent', 'KES 5,125')}{kv('Reference', 'GLB-20250627-0091')}</div>
          </div>)}
        </>)}
      </MBox>

      {/* 4 BUY DATA (tabs) */}
      <MBox s={s} id="buyDataModal" active={active} size="lg" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('buyData', '12GB Data Bundle Purchased Successfully!', 'BND-20250627-01')}>Buy Bundle</button></>} title={<><i className="bi bi-wifi text-primary me-2" />Buy Data Bundles</>}>
        {m.body('buyData', (<>
          {pills(m, 'dn', 'saf', [['saf', 'Safaricom'], ['air', 'Airtel'], ['tk', 'Telkom']])}
          <div className="mb-3"><Lbl s={s}>Phone Number</Lbl><Fld s={s} defaultValue="0712 345 890" /></div>
          {m.tab('dn', 'saf') === 'saf' && (<div>
            <Lbl s={s}>Select Bundle</Lbl>
            <div className="row g-2 mb-3">
              {([['1.2GB', '24 Hrs', 'KES 99', 'b1'], ['2.5GB', '7 Days', 'KES 300', 'b2'], ['12GB', '30 Days', 'KES 1,000', 'b3'], ['25GB', '30 Days', 'KES 2,000', 'b4'], ['No Expiry', '1GB', 'KES 100', 'b5'], ['All in One', '15GB+Min', 'KES 2,000', 'b6']] as const).map(([sz, val, price, v], i) => (
                <div key={v} className="col-md-4 col-6"><m.PickedBox k="dBundle" v={v}><strong>{sz}</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{val}</span><br />{price}{i === 2 && <div className="mt-1"><span className={`${s.badge} ${s.badgeS}`}>Popular</span></div>}</m.PickedBox></div>
              ))}
            </div>
          </div>)}
          {m.tab('dn', 'saf') === 'air' && (<div>
            <Lbl s={s}>Airtel Amazing Data</Lbl>
            <div className="row g-2">{([['1GB', 'Daily', 'KES 50', 'a1'], ['3GB', 'Weekly', 'KES 200', 'a2'], ['10GB', 'Monthly', 'KES 900', 'a3'], ['Unlimited', 'Night', 'KES 150', 'a4']] as const).map(([sz, val, price, v]) => (<div key={v} className="col-md-3 col-6"><m.PickedBox k="dBundleAir" v={v}><strong>{sz}</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{val}</span><br />{price}</m.PickedBox></div>))}</div>
          </div>)}
          {m.tab('dn', 'saf') === 'tk' && (<div>
            <Lbl s={s}>Telkom Freedom Data</Lbl>
            <div className="row g-2">{([['750MB', 'Daily', 'KES 20', 't1'], ['3GB', 'Weekly', 'KES 150', 't2'], ['12GB', 'Monthly', 'KES 1,000', 't3'], ['40GB', 'Monthly', 'KES 2,500', 't4']] as const).map(([sz, val, price, v]) => (<div key={v} className="col-md-3 col-6"><m.PickedBox k="dBundleTk" v={v}><strong>{sz}</strong><br /><span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{val}</span><br />{price}</m.PickedBox></div>))}</div>
          </div>)}
          <div className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked id="adcb" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="adcb">Enable auto-renew for this bundle</label></div>
        </>))}
      </MBox>

      {/* 5 AGENT LOCATOR (tabs) */}
      <MBox s={s} id="agentLocatorModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-geo-alt text-primary me-2" />Find Nearby Mobile Money Agents</>}>
        {pills(m, 'ag', 'list', [['list', 'List'], ['map', 'Map']])}
        {m.tab('ag', 'list') === 'list' && (<div>
          {([['Quickmart Agent — Kilimani', 'Cash in/out · Float KES 80K · 350 m', 'badgeS', 'Open'], ['Naivas Till — Valley Arc', 'Cash in/out · PesaLink · 1.2 km', 'badgeS', 'Open'], ['M-Pesa Kiosk — Ngong Rd', 'Full services · Bulk float · 2.0 km', 'badgeW', 'Busy'], ['Petro Station — Hurlingham', 'Cash out only · 2.8 km', 'badgeI', 'Open']] as const).map(([n, sub, t, b]) => (<div key={n} className={s.statusRow}><div className="d-flex align-items-center" style={{ gap: 8 }}><div className={s.iconCircle} style={{ background: 'var(--pm-primary-soft, var(--pm-info-soft))', color: 'var(--pm-primary)' }}><i className="bi bi-shop" /></div><div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div></div><span className={`${s.badge} ${s[t]}`}>{b}</span></div>))}
        </div>)}
        {m.tab('ag', 'list') === 'map' && (<div>
          <div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface)', border: '1px dashed var(--pm-border)', minHeight: 220 }}>
            <i className="bi bi-map text-muted" style={{ fontSize: 48 }} />
            <div style={{ fontWeight: 600, marginTop: 12 }}>Interactive map — Kilimani, Nairobi</div>
            <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>4 agents within 3 km · tap a pin for details</div>
            <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><span className={`${s.badge} ${s.badgeS}`}>Open</span><span className={`${s.badge} ${s.badgeW}`}>Busy</span><span className={`${s.badge} ${s.badgeI}`}>Cash out</span></div>
          </div>
        </div>)}
      </MBox>

      {/* 6 FULIZA MANAGEMENT */}
      <MBox s={s} id="fulizaManagementModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('fuliza', 'Fuliza balance fully repaid! Limit restored to KES 20,000.', 'FUL-20250627')}>Repay Full</button></>} title={<><i className="bi bi-arrow-repeat text-danger me-2" />Fuliza M-Pesa Management</>}>
        {m.body('fuliza', (<div>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-danger-soft)' }}><div style={{ fontSize: 11, color: '#991B1B', fontWeight: 700 }}>OUTSTANDING BALANCE</div><div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-danger)' }}>-KES 6,000</div><div style={{ fontSize: 12, color: '#7F1D1D' }}>Day 4 of 30 · daily fee KES 14.00</div></div>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>{kv('Total Limit', 'KES 20,000')}{kv('Available', 'KES 14,000')}{kv('Accrued fees', 'KES 56.00')}</div>
          <Lbl s={s}>Repayment Amount</Lbl>
          <div className="mb-3">{m.Chips({ k: 'fzAmt', opts: [{ v: '6000', label: 'Full (6,000)' }, { v: '3000', label: 'Half (3,000)' }, { v: '1000', label: '1,000' }] })}</div>
          <input type="number" className={s.formControl} value={m.chip('fzAmt', '6000')} onChange={(e) => m.setChip('fzAmt', e.target.value)} />
        </div>))}
      </MBox>

      {/* 7 M-SHWARI (tabs, per-tab actions) */}
      <MBox s={s} id="mShwariModal" active={active} size="lg" onClose={onClose} footer={<>
        <button className={s.btnPm} onClick={onClose}>Close</button>
        {m.tab('ms', 'save') === 'save' && <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('mShwari', 'Successfully deposited KES 2,000 to M-Shwari Savings.')}>Process Deposit</button>}
        {m.tab('ms', 'save') === 'loan' && <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('mShwari', 'Loan request of KES 5,000 approved and disbursed to M-Pesa.')}>Request Loan</button>}
        {m.tab('ms', 'save') === 'lock' && <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('mShwari', 'KES 5,000 successfully locked for 3 months.')}>Lock Savings</button>}
      </>} title={<><i className="bi bi-piggy-bank text-info me-2" />M-Shwari Services</>}>
        {m.body('mShwari', (<>
          {pills(m, 'ms', 'save', [['save', 'Save'], ['loan', 'Loan'], ['lock', 'Lock']])}
          {m.tab('ms', 'save') === 'save' && (<div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>{kv('Current Savings', 'KES 12,450')}{kv('Interest earned', 'KES 410 YTD')}</div>
            <Lbl s={s}>Deposit Amount</Lbl>
            <div className="mb-3">{m.Chips({ k: 'msAmt', opts: [{ v: '500', label: '500' }, { v: '2000', label: '2,000' }, { v: '5000', label: '5,000' }] })}</div>
            <input type="number" className={s.formControl} value={m.chip('msAmt', '2000')} onChange={(e) => m.setChip('msAmt', e.target.value)} />
          </div>)}
          {m.tab('ms', 'save') === 'loan' && (<div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>{kv('Loan Limit', 'KES 8,000')}{kv('Outstanding', 'KES 0')}{kv('Interest', '7.5% flat')}</div>
            <div className="mb-3"><Lbl s={s}>Loan Amount</Lbl><input type="number" className={s.formControl} defaultValue={5000} /></div>
            <div className="mb-3"><Lbl s={s}>Repayment Period</Lbl><Fld s={s} as="select" options={['30 days', '60 days', '90 days']} /></div>
          </div>)}
          {m.tab('ms', 'save') === 'lock' && (<div>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Lock savings for a fixed term to earn higher interest. Early withdrawal forfeits bonus interest.</p>
            <div className="mb-3"><Lbl s={s}>Amount to Lock</Lbl><input type="number" className={s.formControl} defaultValue={5000} /></div>
            <div className="mb-3"><Lbl s={s}>Lock Period</Lbl><Fld s={s} as="select" options={['1 month (6% p.a)', '3 months (7% p.a)', '6 months (8% p.a)', '12 months (9% p.a)']} /></div>
          </div>)}
        </>))}
      </MBox>

      {/* 8 POCHI LA BIASHARA */}
      <MBox s={s} id="pochiLaBiasharaModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('pochi', 'Funds withdrawn from Pochi to Main M-Pesa account successfully.')}>Withdraw</button></>} title={<><i className="bi bi-briefcase me-2" style={{ color: 'var(--pm-purple)' }} />Pochi La Biashara</>}>
        {m.body('pochi', (<div>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>BUSINESS WALLET BALANCE</div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--pm-accent)' }}>KES 45,900</div><div style={{ fontSize: 12, color: '#065F46' }}>Received today: KES 8,500</div></div>
          <Lbl s={s}>Withdraw to Main M-Pesa</Lbl>
          <div className="mb-3">{m.Chips({ k: 'pcAmt', opts: [{ v: '5000', label: '5,000' }, { v: '10000', label: '10,000' }, { v: '45900', label: 'All' }] })}</div>
          <input type="number" className={s.formControl} value={m.chip('pcAmt', '5000')} onChange={(e) => m.setChip('pcAmt', e.target.value)} />
        </div>))}
      </MBox>

      {/* 9 KCB M-PESA (tabs) */}
      <MBox s={s} id="kcbMpesaModal" active={active} size="lg" onClose={onClose} footer={<>
        <button className={s.btnPm} onClick={onClose}>Close</button>
        {m.tab('kcb', 'save') === 'save' && <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('kcb', 'Deposit to KCB M-Pesa successful.')}>Submit Deposit</button>}
        {m.tab('kcb', 'save') === 'loan' && <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('kcb', 'Loan of KES 5,000 disbursed to M-Pesa.')}>Request Loan</button>}
      </>} title={<><i className="bi bi-bank text-warning me-2" />KCB M-Pesa Account</>}>
        {m.body('kcb', (<>
          {pills(m, 'kcb', 'save', [['save', 'Save'], ['loan', 'Loan']])}
          {m.tab('kcb', 'save') === 'save' && (<div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>{kv('Account Balance', 'KES 0.00')}{kv('Target Savings', 'Active')}</div>
            <div className="mb-3"><Lbl s={s}>Deposit Amount</Lbl><input type="number" className={s.formControl} defaultValue={2000} /></div>
            <div><Lbl s={s}>Target Goal (optional)</Lbl><Fld s={s} placeholder="e.g. School fees" /></div>
          </div>)}
          {m.tab('kcb', 'save') === 'loan' && (<div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>{kv('Loan Limit', 'KES 5,000')}{kv('Interest', '8% p.a')}<hr className={s.divider} />{kv('Outstanding', 'KES 0')}</div>
            <div className="mb-3"><Lbl s={s}>Loan Amount</Lbl><input type="number" className={s.formControl} defaultValue={5000} /></div>
            <div><Lbl s={s}>Repayment Period</Lbl><Fld s={s} as="select" options={['30 days', '3 months', '6 months']} /></div>
          </div>)}
        </>))}
      </MBox>

      {/* 10 AIRTIME AUTO-RENEW */}
      <MBox s={s} id="airtimeAutoRenewModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('airAutoRenew', 'Auto-renew rule created successfully!')}>Save Rule</button></>} title={<><i className="bi bi-arrow-repeat text-primary me-2" />Auto-Renew Rules</>}>
        {m.body('airAutoRenew', (<div>
          <div className="mb-3"><Lbl s={s}>Line</Lbl><Fld s={s} as="select" options={['0712 345 890 (Safaricom)', '0733 987 456 (Airtel)']} /></div>
          <div className="mb-3"><Lbl s={s}>Bundle to Renew</Lbl><Fld s={s} as="select" options={['12GB Monthly — KES 1,000', '2.5GB Weekly — KES 300', '25GB Monthly — KES 2,000']} /></div>
          <div className="mb-3"><Lbl s={s}>Trigger</Lbl><Fld s={s} as="select" options={['When bundle expires', 'When below 500MB', 'On a fixed date']} /></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked id="arcb" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="arcb">Fund from M-Pesa Wallet</label></div>
        </div>))}
      </MBox>

      {/* 11 TUNUKIWA OFFERS */}
      <MBox s={s} id="tunukiwaOffersModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-gift me-2" style={{ color: 'var(--pm-purple)' }} />Special Offers (Tunukiwa)</>}>
        {([['1GB for 1 hour', 'Only KES 20 · Save 80%', 'bi-wifi', 'var(--pm-accent-soft)', 'var(--pm-accent)', 'claim1', '1GB Tunukiwa offer claimed successfully for KES 20.'], ['500 Minutes', 'Only KES 150 · All networks', 'bi-telephone', 'var(--pm-info-soft)', 'var(--pm-info)', 'claim2', '500 Min offer claimed successfully for KES 150.'], ['Unlimited SMS', 'Only KES 10 · 24 hours', 'bi-chat-dots', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'claim3', 'Unlimited SMS offer claimed for KES 10.']] as const).map(([t, sub, ic, bg, col, key, msg]) => (
          <div key={key} className={s.feedItem}>
            <div className={s.iconCircle} style={{ background: bg, color: col, fontSize: 14 }}><i className={`bi ${ic}`} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div>
            {m.results[key] ? <span className={`${s.badge} ${s.badgeS}`}>Claimed</span> : <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => m.doAction(key, msg)}>{m.busy === key ? 'Claiming…' : 'Claim'}</button>}
          </div>
        ))}
      </MBox>

      {/* 12 AIRTIME RESALE */}
      <MBox s={s} id="airtimeResaleModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('airResale', 'Airtime sold successfully. KES 25 commission added to Wallet.')}>Sell Airtime</button></>} title={<><i className="bi bi-shop text-danger me-2" />Airtime Resale (Agent Mode)</>}>
        {m.body('airResale', (<div>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>{kv('Agent Float', 'KES 12,400')}{kv('Commission rate', '5%')}</div>
          <div className="mb-3"><Lbl s={s}>Customer Phone</Lbl><Fld s={s} placeholder="Enter customer number" /></div>
          <div className="mb-3"><Lbl s={s}>Network</Lbl><Fld s={s} as="select" options={['Safaricom', 'Airtel', 'Telkom']} /></div>
          <Lbl s={s}>Amount</Lbl>
          <div className="mb-3">{m.Chips({ k: 'rsAmt', opts: [{ v: '100', label: '100' }, { v: '200', label: '200' }, { v: '500', label: '500' }] })}</div>
          <input type="number" className={s.formControl} value={m.chip('rsAmt', '500')} onChange={(e) => m.setChip('rsAmt', e.target.value)} />
        </div>))}
      </MBox>

      {/* 13 BONGA POINTS */}
      <MBox s={s} id="bongaPointsModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('bonga', 'Bonga points redeemed successfully for 1GB Data!')}>Redeem</button></>} title={<><i className="bi bi-gift me-2" style={{ color: 'var(--pm-purple)' }} />Bonga Points Rewards</>}>
        {m.body('bonga', (<div>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-purple-soft)' }}><div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 700 }}>AVAILABLE POINTS</div><div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-purple)' }}>4,200</div></div>
          <div className="mb-2"><Lbl s={s}>Redeem for</Lbl></div>
          {([['1GB Data (1 day)', '500 pts', 'bi-wifi'], ['500 Minutes', '1,000 pts', 'bi-telephone'], ['KES 100 Airtime', '1,200 pts', 'bi-phone'], ['2GB Data (7 days)', '2,000 pts', 'bi-hdd-network']] as const).map(([t, pts, ic], i) => (
            <label key={t} className={`p-3 border rounded mb-2 d-flex align-items-center gap-3 ${m.isPicked('bongaOpt', t) ? s.selectableActive : ''}`} style={{ cursor: 'pointer' }} onClick={() => m.setPicked('bongaOpt', t)}>
              <input type="radio" name="bongaOpt" defaultChecked={i === 0} readOnly /> <i className={`bi ${ic}`} style={{ fontSize: 18, color: 'var(--pm-purple)' }} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{pts}</div></div>
            </label>
          ))}
        </div>))}
      </MBox>

      {/* 14 MALI INVESTMENT */}
      <MBox s={s} id="maliInvestmentModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('mali', 'KES 10,000 invested successfully into Mali!')}>Confirm Investment</button></>} title={<><i className="bi bi-graph-up-arrow text-primary me-2" />Mali Unit Trust</>}>
        {m.body('mali', (<div>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-primary-soft, var(--pm-info-soft))' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 700 }}>CURRENT INVESTMENT</div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 102,500</div><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Earned YTD: KES 4,120 (9.2% p.a)</div></div>
          <Lbl s={s}>Invest More</Lbl>
          <div className="mb-3">{m.Chips({ k: 'maliAmt', opts: [{ v: '5000', label: '5,000' }, { v: '10000', label: '10,000' }, { v: '20000', label: '20,000' }] })}</div>
          <input type="number" className={s.formControl} value={m.chip('maliAmt', '10000')} onChange={(e) => m.setChip('maliAmt', e.target.value)} />
        </div>))}
      </MBox>

      {/* 15 ADD PHONE NUMBER */}
      <MBox s={s} id="addPhoneNumberModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('addPhone', 'OTP sent. Phone number verified and linked!')}>Send OTP</button></>} title={<><i className="bi bi-sim text-info me-2" />Link New Phone Number</>}>
        {m.body('addPhone', (<div>
          <div className="mb-3"><Lbl s={s}>Network</Lbl><Fld s={s} as="select" options={['Safaricom', 'Airtel', 'Telkom']} /></div>
          <div className="mb-3"><Lbl s={s}>Phone Number</Lbl><Fld s={s} placeholder="07XX XXX XXX" /></div>
          <div><Lbl s={s}>Nickname</Lbl><Fld s={s} placeholder="e.g. Business Line" /></div>
        </div>))}
      </MBox>

      {/* 16 LINK BANK ACCOUNT */}
      <MBox s={s} id="linkBankAccountModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('linkBank', 'Bank account linked successfully via PesaLink!')}>Link Account</button></>} title={<><i className="bi bi-bank me-2" />Link Bank for Interoperability</>}>
        {m.body('linkBank', (<div>
          <div className="mb-3"><Lbl s={s}>Bank</Lbl><Fld s={s} as="select" options={['Equity Bank', 'KCB', 'Co-operative Bank', 'NCBA', 'Absa', 'Stanbic']} /></div>
          <div className="mb-3"><Lbl s={s}>Account Number</Lbl><Fld s={s} placeholder="Enter account number" /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><i className="bi bi-shield-check me-1" style={{ color: 'var(--pm-info)' }} /> Linked securely via PesaLink · instant mobile-to-bank transfers.</div>
        </div>))}
      </MBox>

      {/* 17 EXPORT STATEMENT */}
      <MBox s={s} id="exportStatementModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('exportStmt', 'Statement generated and downloading...')}>Generate</button></>} title={<><i className="bi bi-file-earmark-arrow-down me-2" />Export Statements</>}>
        {m.body('exportStmt', (<div>
          <div className="mb-3"><Lbl s={s}>Statement Type</Lbl><Fld s={s} as="select" options={['M-Pesa transactions', 'Airtime & Data', 'All mobile money', 'Pochi La Biashara']} /></div>
          <div className="row g-3"><div className="col-md-6"><Lbl s={s}>From</Lbl><Fld s={s} type="date" defaultValue="2025-06-01" /></div><div className="col-md-6"><Lbl s={s}>To</Lbl><Fld s={s} type="date" defaultValue="2025-06-30" /></div></div>
          <div className="mt-3"><Lbl s={s}>Format</Lbl><Fld s={s} as="select" options={['PDF', 'CSV', 'Excel']} /></div>
        </div>))}
      </MBox>

      {/* 18 MANAGE LINKED LINE */}
      <MBox s={s} id="manageLinkedLineModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('manageLine', 'Line settings updated!')}>Save</button></>} title={<><i className="bi bi-gear me-2" />Manage Linked Line</>}>
        {m.body('manageLine', (<div>
          <div className="mb-3"><Lbl s={s}>Line</Lbl><Fld s={s} as="select" options={['0712 345 890 (Safaricom)', '0733 987 456 (Airtel)', '0777 112 233 (Telkom)']} /></div>
          <div className="mb-3"><Lbl s={s}>Nickname</Lbl><Fld s={s} defaultValue="Default Line" /></div>
          {['Set as default line', 'Enable data bundle alerts', 'Enable auto-renew', 'Allow household top-up'].map((l, i) => (<div key={l} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked={i < 2} id={`ml-${i}`} /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`ml-${i}`}>{l}</label></div>))}
        </div>))}
      </MBox>

      {/* 19 MOBILE MONEY ANALYTICS */}
      <MBox s={s} id="mobileMoneyAnalyticsModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-graph-up text-primary me-2" />M-Pesa Spend Analytics</>}>
        <div className="row g-2 mb-3">{([['Sent (Month)', 'KES 42,300'], ['Received', 'KES 61,800'], ['Airtime/Data', 'KES 5,480'], ['Fees Saved', 'KES 1,240']] as const).map(([l, v]) => (<div key={l} className="col-md-3 col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{l}</div><div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div></div></div>))}</div>
        <div className={s.chartBarGroup}>{[['W1', '55%'], ['W2', '70%'], ['W3', '48%'], ['W4', '88%']].map(([w, h]) => (<div key={w} className={s.chartBar} style={{ height: h, background: 'var(--pm-primary)' }}><span className={s.barLabel}>{w}</span></div>))}</div>
        <p className="mt-3" style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Top category: <strong>Send Money (46%)</strong> · You saved KES 1,240 on interoperability fees via PayMo.</p>
      </MBox>

      {/* 20 TRANSACTION HISTORY (xl) */}
      <MBox s={s} id="transactionHistoryModal" active={active} size="xl" onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('exportStatementModal')}><i className="bi bi-download" /> Export</button></>} title={<><i className="bi bi-clock-history me-2" />Full Mobile Money History</>}>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Date</th><th>Type</th><th>Details</th><th>Amount</th><th>Network</th><th>Status</th></tr></thead><tbody>
          {([['27 Jun 2025', 'Send Money', 'To: John Doe (Airtel)', '-KES 1,500', 'var(--pm-danger)', 'M-Pesa', 'Completed'], ['27 Jun 2025', 'Buy Data', '12GB Monthly Bundle', '-KES 1,000', 'var(--pm-danger)', 'Safaricom', 'Active'], ['26 Jun 2025', 'Pochi Payment', 'From: Jane Smith', '+KES 4,500', 'var(--pm-accent)', 'M-Pesa Pochi', 'Received'], ['26 Jun 2025', 'Buy Airtime', '0712 345 890', '-KES 250', 'var(--pm-danger)', 'Safaricom', 'Completed'], ['25 Jun 2025', 'Fuliza Repay', 'Overdraft repayment', '-KES 2,000', 'var(--pm-danger)', 'M-Pesa', 'Completed'], ['24 Jun 2025', 'M-Shwari', 'Savings deposit', '-KES 2,000', 'var(--pm-danger)', 'M-Pesa', 'Completed']] as const).map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><strong style={{ color: r[4] }}>{r[3]}</strong></td><td>{r[5]}</td><td><span className={`${s.badge} ${s.badgeS}`}>{r[6]}</span></td></tr>
          ))}
        </tbody></table></div>
      </MBox>

      {/* 21 NOTIFICATIONS */}
      <MBox s={s} id="notificationsModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-bell me-2" />Notifications (4)</>}>
        {([['bi-arrow-repeat', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'Fuliza balance due', 'KES 6,000 · Day 4 of 30', '1h ago'], ['bi-wifi', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Data expiring soon', '2.5GB Safaricom expires in 48 hrs', '3h ago'], ['bi-gift', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'Tunukiwa offer', '1GB for 1 hour @ KES 20', 'Today'], ['bi-piggy-bank', 'var(--pm-info-soft)', 'var(--pm-info)', 'M-Shwari goal', 'Deposit KES 2,000 to meet June target', 'Today']] as const).map(([ic, bg, col, t, sub, when]) => (
          <div key={t} className={s.feedItem}><div className={s.iconCircle} style={{ background: bg, color: col, fontSize: 13 }}><i className={`bi ${ic}`} /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><small style={{ color: 'var(--pm-muted)' }}>{when}</small></div>
        ))}
      </MBox>

      {/* 22 PROFILE */}
      <MBox s={s} id="profileModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-person-circle me-2" />Profile & Security</>}>
        <div className="text-center mb-3"><div className={`${s.avatar} mx-auto`} style={{ width: 56, height: 56, fontSize: 18, background: 'var(--pm-gradient-mint)' }}>JK</div><div style={{ fontWeight: 700, marginTop: 8 }}>James K.</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>0712 345 890 · Verified</div></div>
        <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>{kv('Linked lines', '3')}{kv('Default wallet', 'M-Pesa')}{kv('2FA', <span className={`${s.badge} ${s.badgeS}`}>Enabled</span>)}</div>
        <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('addPhoneNumberModal')}><i className="bi bi-sim" /> Link line</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('linkBankAccountModal')}><i className="bi bi-bank" /> Link bank</button></div>
      </MBox>

      {/* 23 ATTENTION DETAIL */}
      <MBox s={s} id="attentionDetailModal" active={active} size="lg" onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>} title={<><i className="bi bi-exclamation-triangle text-warning me-2" />Attention Required</>}>
        {([['FZ', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'Fuliza outstanding balance', 'KES 6,000 utilized · Day 4 of 30', 'Repay', 'fulizaManagementModal', 'btnPmD'], ['DT', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Data bundle expiring soon', '2.5GB Safaricom expires in 48 hrs', 'Renew', 'buyDataModal', ''], ['MS', 'var(--pm-info-soft)', 'var(--pm-info)', 'M-Shwari savings goal off-track', 'Deposit KES 2,000 to meet June target', 'Save', 'mShwariModal', ''], ['BP', 'var(--pm-purple-soft)', 'var(--pm-purple)', '4,200 Bonga Points available', 'Redeem for 500 Minutes or Data', 'Redeem', 'bongaPointsModal', '']] as const).map(([ini, bg, col, t, sub, lb, mod, cls]) => (
          <div key={t} className={s.feedItem}><div className={s.iconCircle} style={{ background: bg, color: col, fontSize: 12 }}>{ini}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div><button className={`${s.btnPm} ${s.btnSm} ${cls ? s[cls] : ''}`} onClick={() => onOpen(mod)}>{lb}</button></div>
        ))}
      </MBox>

      {/* 24 RECEIPT */}
      <MBox s={s} id="receiptModal" active={active} onClose={onClose} footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('exportStatementModal')}><i className="bi bi-download" /> Download</button></>} title={<><i className="bi bi-receipt me-2" />Transaction Receipt</>}>
        <div className="p-3 rounded text-start" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
          {kv('Type', 'Send Money')}{kv('To', 'John Doe (Airtel)')}{kv('Amount', <strong style={{ color: 'var(--pm-danger)' }}>-KES 1,500</strong>)}{kv('Fee', 'KES 0')}{kv('Date', '27 Jun 2025 · 14:22')}{kv('Network', 'M-Pesa')}
          <hr className={s.divider} />{kv('Status', <span className={`${s.badge} ${s.badgeS}`}>Completed</span>)}{kv('Reference', 'QGH7X2K4PL')}
        </div>
      </MBox>
    </>
  )
}
