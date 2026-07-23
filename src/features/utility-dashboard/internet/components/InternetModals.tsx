import { useState } from 'react'
import styles from '../styles/internet.module.css'
import { MBox, Stepper, Loading, Lbl, Fld, useModals } from '../../_shared/modalKit'

const s = styles as Record<string, string>
interface Props { active: string | null; onClose: () => void; onOpen: (id: string) => void }

function SpeedTestBody() {
  const [phase, setPhase] = useState<'idle' | 'testing' | 'done'>('idle')
  if (phase === 'idle') return (
    <div className="text-center">
      <div className={s.iconCircle + ' mx-auto mb-3'} style={{ width: 80, height: 80, fontSize: 32, background: 'var(--pm-surface-2)', color: 'var(--pm-primary)' }}><i className="bi bi-wifi" /></div>
      <h4 style={{ fontWeight: 700 }}>Safaricom Home Fibre</h4>
      <p style={{ color: 'var(--pm-muted)', fontSize: 13 }}>Plan: 40 Mbps</p>
      <button className={`${s.btnPm} ${s.btnPmP} mt-3`} style={{ padding: '12px 24px', fontSize: 15 }} onClick={() => { setPhase('testing'); window.setTimeout(() => setPhase('done'), 1800) }}>Start Test</button>
    </div>
  )
  if (phase === 'testing') return (
    <div className="text-center">
      <div className={s.iconCircle + ' mx-auto mb-3'} style={{ width: 80, height: 80, fontSize: 32, background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-arrow-repeat" /></div>
      <h4 style={{ fontWeight: 700 }}>Testing...</h4>
      <p style={{ color: 'var(--pm-muted)', fontSize: 13 }}>Ping: 12ms</p>
      <div className={s.progress + ' mt-3'}><div className={s.progressBar} style={{ width: '50%', background: 'var(--pm-warning)' }} /></div>
    </div>
  )
  return (
    <div className="text-center">
      <div className={s.iconCircle + ' mx-auto mb-3'} style={{ width: 80, height: 80, fontSize: 32, background: 'var(--pm-accent-soft)', color: '#10B981' }}><i className="bi bi-speedometer2" /></div>
      <h4 style={{ fontWeight: 700 }}>Test Complete</h4>
      <div className="row g-3 mt-2">
        <div className="col-6"><div className="p-2 border rounded"><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>DOWNLOAD</div><strong style={{ fontSize: 18, color: '#10B981' }}>41.2 Mbps</strong></div></div>
        <div className="col-6"><div className="p-2 border rounded"><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>UPLOAD</div><strong style={{ fontSize: 18, color: '#10B981' }}>39.8 Mbps</strong></div></div>
      </div>
      <button className={`${s.btnPm} ${s.btnPmP} mt-3`} onClick={() => setPhase('idle')}>Run Again</button>
    </div>
  )
}

export default function InternetModals({ active, onClose, onOpen }: Props) {
  const m = useModals(s, active, onClose)

  return (
    <>
      {/* 1 PAY FIBRE (3-step) */}
      <MBox s={s} id="payFibreModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('payFibre', 3, 2, <>Pay <i className="bi bi-lock" /></>)}
        title={<><i className="bi bi-router text-primary me-2" />Pay Home Fibre</>}>
        {m.busy === 'payFibre' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Select', 'Pay', 'Done']} current={m.step('payFibre')} />
          {m.step('payFibre') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Connection</h6>
            <div className="mb-3"><Lbl s={s}>Saved Account</Lbl><Fld s={s} as="select" options={['SF-40812 — Safaricom Home (Kilimani)', 'ZK-11928 — Zuku (Office)']} /></div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Current Plan</span><strong>Gold 40Mbps</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Amount Due</span><strong>KES 5,999</strong></div>
              <div className="d-flex justify-content-between"><span>Expiry Date</span><strong style={{ color: 'var(--pm-danger)' }}>01 Jul 2025</strong></div>
            </div>
            <button className={`${s.btnPm} ${s.btnSm} mb-2`} onClick={() => onOpen('upgradePlanModal')}>Upgrade Plan</button>
          </div>)}
          {m.step('payFibre') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Payment Details</h6>
            <div className="mb-3"><Lbl s={s}>Amount</Lbl><Fld s={s} defaultValue="5999" disabled /></div>
            <div className="mb-3"><Lbl s={s}>Payment Method</Lbl>{m.payMethodRadios('fpay')}</div>
            <div className="form-check mt-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Enable auto-renewal next month</label></div>
          </div>)}
          {m.step('payFibre') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Fibre Renewed Successfully</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your internet connection is active until 01 Aug 2025.</p>
            <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Account</span><strong>SF-40812</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 5,999</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Ref</span><strong>FIB-20250627-1182</strong></div>
            </div>
            <div className="mt-3"><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('receiptModal')}>View Receipt</button></div>
          </div>)}
        </>)}
      </MBox>

      {/* 2 BUY DATA (tabs) */}
      <MBox s={s} id="buyDataModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('buyDataModal', 'Bundle purchased successfully!', 'BUN-9912')}>Buy KES 1,000</button></>}
        title={<><i className="bi bi-phone text-success me-2" />Buy Data & Airtime</>}>
        {m.body('buyDataModal', <>
          <div className={`${s.tabPills} mb-3`}>{([['saf', 'Safaricom'], ['airtel', 'Airtel'], ['telkom', 'Telkom']] as const).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${m.tab('dataTab', 'saf') === k ? s.tabPillActive : ''}`} onClick={() => m.setTab('dataTab', k)}>{l}</button>))}</div>
          <div className="mb-3"><Lbl s={s}>Type</Lbl><Fld s={s} as="select" options={['Data Bundles', 'Airtime', 'Minutes / SMS']} /></div>
          <div className="mb-3"><Lbl s={s}>Phone Number</Lbl><Fld s={s} as="select" options={['0712 *** 890 (My Line)', '0722 *** 111 (Wife)', 'Enter new number...']} /></div>
          {m.tab('dataTab', 'saf') === 'saf' && (<div><Lbl s={s}>Select Bundle</Lbl><div className="row g-2 mb-3">{([['1GB / 24hrs', 'KES 99'], ['12GB / 30 Days', 'KES 1,000'], ['25GB / 30 Days', 'KES 2,000'], ['No Expiry 5GB', 'KES 1,500']] as const).map(([n, p]) => (<div key={n} className="col-6">{m.PickedBox({ k: 'safBun', v: n, children: (<><strong>{n}</strong><br />{p}</>) })}</div>))}</div></div>)}
          {m.tab('dataTab', 'saf') === 'airtel' && (<div className="row g-2 mb-3">{([['Amazing 15GB', 'KES 1,000']] as const).map(([n, p]) => (<div key={n} className="col-6">{m.PickedBox({ k: 'airBun', v: n, children: (<><strong>{n}</strong><br />{p}</>) })}</div>))}</div>)}
          {m.tab('dataTab', 'saf') === 'telkom' && (<div className="row g-2 mb-3">{([['Freedom 10GB', 'KES 1,000']] as const).map(([n, p]) => (<div key={n} className="col-6">{m.PickedBox({ k: 'telBun', v: n, children: (<><strong>{n}</strong><br />{p}</>) })}</div>))}</div>)}
          <div className="mb-3"><Lbl s={s}>Payment Method</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'M-Pesa']} /></div>
        </>)}
      </MBox>

      {/* 3 SHARE DATA */}
      <MBox s={s} id="shareDataModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('shareDataModal', 'Data shared successfully!')}>Sambaza</button></>}
        title={<><i className="bi bi-share text-info me-2" />Sambaza Data / Airtime</>}>
        {m.body('shareDataModal', <>
          <div className="mb-3"><Lbl s={s}>From Line</Lbl><Fld s={s} as="select" options={['Safaricom (0712***890) - Bal: 4.2GB', 'Airtel (0733***456) - Bal: 1.1GB']} /></div>
          <div className="mb-3"><Lbl s={s}>Send To</Lbl><Fld s={s} placeholder="Enter phone number" /></div>
          <div className="mb-3"><Lbl s={s}>Amount (MBs / KES)</Lbl><Fld s={s} defaultValue="500" /></div>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>Note: Safaricom allows sharing max 2GB per day. Valid for 24 hours upon receipt.</div>
          <div className="mb-3"><Lbl s={s}>Enter SIM PIN</Lbl><input type="password" className={s.formControl} placeholder="****" /></div>
        </>)}
      </MBox>

      {/* 4 SPEED TEST */}
      <MBox s={s} id="runSpeedTestModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-speedometer text-warning me-2" />Network Speed Test</>}>
        <SpeedTestBody />
      </MBox>

      {/* 5 UPGRADE PLAN */}
      <MBox s={s} id="upgradePlanModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('upgradePlanModal', 'Plan upgraded to Platinum 100Mbps! Router restart required.')}>Pay & Upgrade</button></>}
        title={<><i className="bi bi-arrow-up-circle me-2" style={{ color: 'var(--pm-purple)' }} />Upgrade Broadband Plan</>}>
        {m.body('upgradePlanModal', <>
          <div className="mb-3"><Lbl s={s}>Connection</Lbl><Fld s={s} defaultValue="Safaricom Home Fibre (SF-40812)" disabled /></div>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}><strong>Current Plan:</strong> Gold 40Mbps (KES 5,999/mo)</div>
          <Lbl s={s}>Available Upgrades</Lbl>
          <div className="row g-3">
            <div className="col-md-6">{m.PickedBox({ k: 'upg', v: 'platinum', children: (<><strong style={{ fontSize: 16 }}>Platinum 100Mbps</strong><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-primary)', margin: '8px 0' }}>KES 8,999</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Prorated upgrade fee: KES 1,500 today</div></>) })}</div>
            <div className="col-md-6"><div className="p-3 border rounded text-center opacity-50"><strong style={{ fontSize: 16 }}>Diamond 250Mbps</strong><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-muted)', margin: '8px 0' }}>KES 12,500</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Not available in your area</div></div></div>
          </div>
          <div className="mt-4"><Lbl s={s}>Payment for Prorated Amount</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'M-Pesa']} /></div>
        </>)}
      </MBox>

      {/* 6 REPORT FAULT */}
      <MBox s={s} id="reportFaultModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('reportFaultModal', 'Fault ticket TKT-9912 submitted.', 'TKT-9912')}>Submit Ticket</button></>}
        title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Report Network Fault</>}>
        {m.body('reportFaultModal', <>
          <div className="mb-3"><Lbl s={s}>Connection</Lbl><Fld s={s} as="select" options={['Safaricom Fibre (SF-40812)', 'Zuku (ZK-11928)']} /></div>
          <div className="mb-3"><Lbl s={s}>Issue Type</Lbl><Fld s={s} as="select" options={['Red LOS light on router', 'Slow speeds', 'Intermittent drops', 'Billing issue']} /></div>
          <div className="mb-3"><Lbl s={s}>Description</Lbl><Fld s={s} as="textarea" rows={3} defaultValue="Internet drops every 10 minutes. LOS light blinks red." /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> A support ticket will be generated and tracked. SLA is 24 hours.</div>
        </>)}
      </MBox>

      {/* 7 NETWORK OUTAGES (tabs) */}
      <MBox s={s} id="networkOutagesModal" active={active} size="lg" onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-broadcast-pin text-warning me-2" />Network Outages</>}>
        <div className={`${s.tabPills} mb-3`}>{(['Known Outages', 'My Area', 'Scheduled Maintenance'] as const).map((t) => (<button key={t} className={`${s.tabPill} ${m.tab('outage', 'Known Outages') === t ? s.tabPillActive : ''}`} onClick={() => m.setTab('outage', t)}>{t}</button>))}</div>
        {m.tab('outage', 'Known Outages') === 'Known Outages' && (<>
          <div className="p-3 border rounded mb-2" style={{ borderLeft: '4px solid var(--pm-warning)' }}><div className="d-flex justify-content-between"><strong>Zuku Kilimani Node</strong><span className={`${s.badge} ${s.badgeW}`}>Investigating</span></div><div style={{ fontSize: 12, color: 'var(--pm-muted)', marginTop: 4 }}>Fibre cut reported near Yaya Centre. Teams on site. ETR: 4:00 PM.</div></div>
          <div className="p-3 border rounded mb-2" style={{ borderLeft: '4px solid var(--pm-danger)' }}><div className="d-flex justify-content-between"><strong>Safaricom Mobile Data (Mombasa)</strong><span className={`${s.badge} ${s.badgeD}`}>Major</span></div><div style={{ fontSize: 12, color: 'var(--pm-muted)', marginTop: 4 }}>Core switch failure. 3G/4G degraded. ETR: Undetermined.</div></div>
          <div className="p-3 border rounded" style={{ borderLeft: '4px solid var(--pm-info)' }}><div className="d-flex justify-content-between"><strong>Faiba JTL Planned Maintenance</strong><span className={`${s.badge} ${s.badgeI}`}>Scheduled</span></div><div style={{ fontSize: 12, color: 'var(--pm-muted)', marginTop: 4 }}>Tomorrow 2AM - 4AM. Expected downtime 30 mins.</div></div>
        </>)}
        {m.tab('outage', 'Known Outages') === 'My Area' && (<div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>No active outages mapped to your Kilimani location right now.</div>)}
        {m.tab('outage', 'Known Outages') === 'Scheduled Maintenance' && (<div className="p-3 border rounded" style={{ borderLeft: '4px solid var(--pm-info)' }}><div className="d-flex justify-content-between"><strong>Faiba JTL Planned Maintenance</strong><span className={`${s.badge} ${s.badgeI}`}>Scheduled</span></div><div style={{ fontSize: 12, color: 'var(--pm-muted)', marginTop: 4 }}>Tomorrow 2AM - 4AM. Expected downtime 30 mins.</div></div>)}
      </MBox>

      {/* 8 ADD CONNECTION (3-step) */}
      <MBox s={s} id="addConnectionModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('addConn', 3, 2, <>Link <i className="bi bi-check" /></>)}
        title={<><i className="bi bi-plus-circle text-primary me-2" />Add Connection</>}>
        {m.busy === 'addConn' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Type', 'Details', 'Done']} current={m.step('addConn')} />
          {m.step('addConn') === 1 && (<div><h6 style={{ fontWeight: 700 }}>Select Connection Type</h6><div className="row g-3 mt-2">{([['bi-router', 'var(--pm-primary)', 'Home / Office Fibre'], ['bi-sim', '#10B981', 'Mobile SIM'], ['bi-globe', 'var(--pm-ink)', 'Satellite / Starlink']] as const).map(([ic, col, n]) => (<div key={n} className="col-md-4">{m.PickedBox({ k: 'connType', v: n, children: (<><i className={`bi ${ic} d-block mb-2`} style={{ fontSize: 24, color: col }} /><strong>{n}</strong></>) })}</div>))}</div></div>)}
          {m.step('addConn') === 2 && (<div><h6 style={{ fontWeight: 700 }}>Account Details</h6>
            <div className="mb-3"><Lbl s={s}>Provider</Lbl><Fld s={s} as="select" options={['Safaricom Home', 'Zuku', 'Faiba JTL']} /></div>
            <div className="mb-3"><Lbl s={s}>Account Number</Lbl><Fld s={s} placeholder="e.g. SF-12345" /></div>
            <div className="mb-3"><Lbl s={s}>Nickname</Lbl><Fld s={s} placeholder="e.g. Home Wi-Fi" /></div>
          </div>)}
          {m.step('addConn') === 3 && (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Connection Linked!</h5><p style={{ fontSize: 13 }}>You can now pay bills and monitor this connection.</p></div>)}
        </>)}
      </MBox>

      {/* 9 MANAGE SIM */}
      <MBox s={s} id="manageSimModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('manageSimModal', 'SIM settings updated')}>Save Changes</button></>}
        title={<><i className="bi bi-sim me-2" />Manage SIM Profile</>}>
        {m.body('manageSimModal', <>
          <div className="d-flex align-items-center gap-3 mb-4"><div className={s.iconCircle} style={{ background: 'var(--pm-accent-soft)', color: '#10B981', fontSize: 20 }}><i className="bi bi-phone" /></div><div><h5 style={{ margin: 0, fontWeight: 700 }}>0712 345 890</h5><span className={`${s.badge} ${s.badgeS} mt-1`}>Safaricom Prepaid</span></div></div>
          <div className="mb-3"><Lbl s={s}>Nickname</Lbl><Fld s={s} defaultValue="My Primary Line" /></div>
          <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Allow Sambaza requests from family</label></div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Alert on low data (&lt; 500MB)</label></div>
        </>)}
      </MBox>

      {/* 10 DATA USAGE ANALYTICS */}
      <MBox s={s} id="dataUsageAnalyticsModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('statementExportModal')}>Export Report</button></>}
        title={<><i className="bi bi-pie-chart me-2" />Connectivity Usage Analytics</>}>
        <div className="row g-3">
          {([['FIBRE USAGE (30D)', '1.1 TB', 'var(--pm-info-soft)', 'var(--pm-info)', '#1D4ED8'], ['MOBILE DATA (30D)', '45.2 GB', 'var(--pm-accent-soft)', '#10B981', '#047857'], ['TOTAL SPEND', 'KES 14,200', 'var(--pm-warning-soft)', 'var(--pm-warning)', '#B45309']] as const).map((c) => (<div key={c[0]} className="col-md-4"><div className="p-3 rounded text-center" style={{ background: c[2] }}><div style={{ fontSize: 11, fontWeight: 700, color: c[4] }}>{c[0]}</div><div style={{ fontSize: 24, fontWeight: 700, color: c[3] }}>{c[1]}</div></div></div>))}
        </div>
        <div className="table-responsive mt-4"><table className={s.table}><thead><tr><th>Device / User</th><th>Network</th><th>Data Consumed</th><th>% of Total</th></tr></thead><tbody>
          <tr><td>Smart TV (Living Room)</td><td>Safaricom Fibre</td><td>420 GB</td><td>35%</td></tr>
          <tr><td>James' Laptop</td><td>Safaricom Fibre</td><td>210 GB</td><td>18%</td></tr>
          <tr><td>Grace's iPhone</td><td>Airtel Mobile</td><td>12 GB</td><td>1%</td></tr>
        </tbody></table></div>
      </MBox>

      {/* 11 CONNECTIVITY HEALTH */}
      <MBox s={s} id="connectivityHealthModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-activity text-primary me-2" />Network Health Check</>}>
        <div className="p-3 rounded text-center mb-3" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 36, fontWeight: 800, color: 'var(--pm-primary)' }}>98%</div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm-muted)' }}>OVERALL NETWORK UPTIME (30 DAYS)</div></div>
        {([['Safaricom Fibre', 'Latency: 12ms · Packet Loss: 0%', 'badgeS', 'Excellent'], ['Starlink', 'Latency: 45ms · Satellites: 4 visible', 'badgeS', 'Good'], ['Zuku', 'Intermittent DNS drops detected', 'badgeW', 'Degraded']] as const).map((r) => (<div key={r[0]} className={s.statusRow}><div><strong>{r[0]}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r[1]}</div></div><span className={`${s.badge} ${s[r[2]]}`}>{r[3]}</span></div>))}
        <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-tools me-1" /> Recommendation: Reboot Zuku router to clear stale DNS cache.</div>
      </MBox>

      {/* 12 AUTO-RENEW SETUP */}
      <MBox s={s} id="autoRenewSetupModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('autoRenewSetupModal', 'Auto-renew rule saved!')}>Save Rule</button></>}
        title={<><i className="bi bi-arrow-repeat text-primary me-2" />Auto-Renew Rules</>}>
        {m.body('autoRenewSetupModal', <>
          <div className="mb-3"><Lbl s={s}>Connection</Lbl><Fld s={s} as="select" options={['Safaricom Fibre', 'Airtel Mobile (0733***)']} /></div>
          <div className="mb-3"><Lbl s={s}>Rule</Lbl><Fld s={s} as="select" options={['Renew plan exactly on expiry', 'Top-up KES 1,000 when data < 500MB']} /></div>
          <div className="mb-3"><Lbl s={s}>Payment Source</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'M-Pesa', 'Visa Card']} /></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Notify me before charging</label></div>
        </>)}
      </MBox>

      {/* 13 BULK TOP-UP (3-step) */}
      <MBox s={s} id="bulkTopupModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('bulkTopup', 3, 2, <>Pay KES 6,999 <i className="bi bi-lock" /></>)}
        title={<><i className="bi bi-collection me-2" />Bulk Top-up / Payment</>}>
        {m.busy === 'bulkTopup' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Select', 'Review', 'Done']} current={m.step('bulkTopup')} />
          {m.step('bulkTopup') === 1 && (<div><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Select accounts to top-up simultaneously:</p>
            {([['Safaricom Fibre', 'KES 5,999', true], ['Airtel Airtime', 'KES 1,000', true], ['Starlink', 'KES 6,500', false]] as const).map(([n, amt, on]) => (<div key={n} className="form-check p-3 border rounded mb-2"><input className="form-check-input" type="checkbox" defaultChecked={on} /> <label className="form-check-label d-flex justify-content-between w-100 ms-2"><span>{n}</span><span>{amt}</span></label></div>))}
          </div>)}
          {m.step('bulkTopup') === 2 && (<div><div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total to Pay</span><strong style={{ fontSize: 20, color: 'var(--pm-primary)' }}>KES 6,999</strong></div></div><div className="mb-3"><Lbl s={s}>Payment Source</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'M-Pesa']} /></div></div>)}
          {m.step('bulkTopup') === 3 && (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-all" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Bulk Payment Successful</h5><p style={{ fontSize: 13 }}>All selected accounts have been credited.</p></div>)}
        </>)}
      </MBox>

      {/* 14 STARLINK */}
      <MBox s={s} id="starlinkManageModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-globe me-2" />Starlink Management</>}>
        <div className="d-flex align-items-center gap-3 mb-3"><div className={s.iconCircle} style={{ background: '#1A1F2E', color: '#fff', fontSize: 20 }}><i className="bi bi-globe" /></div><div><h5 style={{ margin: 0, fontWeight: 700 }}>Starlink Roam Kit</h5><span className={`${s.badge} ${s.badgeS} mt-1`}>Online</span></div></div>
        <div className="row g-3">
          <div className="col-6"><div className="p-2 border rounded text-center"><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>LATENCY</div><div style={{ fontWeight: 700, fontSize: 16 }}>42 ms</div></div></div>
          <div className="col-6"><div className="p-2 border rounded text-center"><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>SPEED</div><div style={{ fontWeight: 700, fontSize: 16 }}>180 Mbps</div></div></div>
        </div>
        <hr className={s.divider} />
        <div className={s.statusRow}><div><strong>Pause Service</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Temporarily halt billing</div></div><button className={`${s.btnPm} ${s.btnSm}`}>Pause</button></div>
        <div className={s.statusRow}><div><strong>Billing Cycle</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 6,500 due 15 Jul</div></div><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('payFibreModal')}>Pay early</button></div>
      </MBox>

      {/* 15 STATEMENT EXPORT */}
      <MBox s={s} id="statementExportModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('statementExportModal', 'Report exported and downloaded')}>Download</button></>}
        title={<><i className="bi bi-download me-2" />Export Internet Statements</>}>
        {m.body('statementExportModal', <>
          <div className="mb-3"><Lbl s={s}>Data Range</Lbl><Fld s={s} as="select" options={['Last 30 Days', 'Year to Date', 'Custom']} /></div>
          <div className="mb-3"><Lbl s={s}>Include</Lbl>
            <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label">Fibre Invoices</label></div>
            <div className="form-check"><input type="checkbox" className="form-check-input" defaultChecked /><label className="form-check-label">Mobile Data Receipts</label></div>
          </div>
          <div className="mb-3"><Lbl s={s}>Format</Lbl><Fld s={s} as="select" options={['PDF Report', 'CSV']} /></div>
        </>)}
      </MBox>

      {/* 16 SERVICE COMPARISON */}
      <MBox s={s} id="serviceComparisonModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('serviceComparisonModal', 'Switch request initiated with Faiba.')}>Initiate Switch</button></>}
        title={<><i className="bi bi-layout-split me-2" />Compare Providers</>}>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Feature</th><th>Safaricom Gold</th><th style={{ background: 'rgba(79,70,229,.06)' }}>Faiba 40Mbps</th><th>Zuku 50Mbps</th></tr></thead><tbody>
          <tr><td>Speed</td><td>40 Mbps</td><td style={{ background: 'rgba(79,70,229,.03)' }}>40 Mbps</td><td>50 Mbps</td></tr>
          <tr><td>Cost</td><td>KES 5,999</td><td style={{ background: 'rgba(79,70,229,.03)' }}><strong>KES 3,850</strong></td><td>KES 5,500</td></tr>
          <tr><td>Reliability</td><td>99%</td><td style={{ background: 'rgba(79,70,229,.03)' }}>98%</td><td>95%</td></tr>
        </tbody></table></div>
        <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 12 }}>AI Tip: Switching to Faiba will save you KES 25,788 annually with comparable speeds.</div>
      </MBox>

      {/* 17 ATTENTION DETAIL */}
      <MBox s={s} id="attentionDetailModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-exclamation-circle text-warning me-2" />Attention Required</>}>
        <div className={s.statusRow}><div><strong>Safaricom Fibre expiring</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>KES 5,999 due in 3 days</div></div><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => onOpen('payFibreModal')}>Renew</button></div>
        <div className={s.statusRow}><div><strong>Airtel Data Low</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Under 500MB left</div></div><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('buyDataModal')}>Top-up</button></div>
      </MBox>

      {/* 18 SUGGESTIONS */}
      <MBox s={s} id="suggestionsModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-stars me-2" style={{ color: 'var(--pm-purple)' }} />Smart Suggestions</>}>
        <div className={s.statusRow}><div><strong>Switch to 30-day bundles</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>You buy daily bundles. A monthly plan saves 20%.</div></div><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => onOpen('buyDataModal')}>View Plans</button></div>
        <div className={s.statusRow}><div><strong>Automate Airtel Airtime</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Set up low-balance auto-top-up.</div></div><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('autoRenewSetupModal')}>Automate</button></div>
      </MBox>

      {/* 19 DISPUTE FAULT */}
      <MBox s={s} id="disputeFaultModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('disputeFaultModal', 'Dispute submitted. Ref: DSP-4412')}>Submit</button></>}
        title={<><i className="bi bi-shield-exclamation text-danger me-2" />Dispute Billing / Service</>}>
        {m.body('disputeFaultModal', <>
          <div className="mb-3"><Lbl s={s}>Connection</Lbl><Fld s={s} as="select" options={['Safaricom Fibre']} /></div>
          <div className="mb-3"><Lbl s={s}>Reason</Lbl><Fld s={s} as="select" options={['Billed for downtime period', 'Wrong package charged']} /></div>
          <Fld s={s} as="textarea" rows={3} placeholder="Details..." />
        </>)}
      </MBox>

      {/* 20 RECEIPT */}
      <MBox s={s} id="receiptModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-receipt me-2" />Receipt</>}>
        <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700 }}>Payment Confirmed</h5>
          <div className="p-3 rounded text-start mt-3" style={{ background: '#fff', fontSize: 13 }}>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Item</span><strong>Safaricom Fibre Gold</strong></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 5,999</strong></div>
            <div className="d-flex justify-content-between"><span className="text-muted">Ref</span><strong>FIB-20250627-1182</strong></div>
          </div>
        </div>
      </MBox>

      {/* 21 BILL INBOX */}
      <MBox s={s} id="billInboxModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-envelope me-2" />Bill Inbox</>}>
        <p className="text-muted" style={{ fontSize: 13 }}>No new invoices pending.</p>
      </MBox>

      {/* 22 NOTIFICATIONS */}
      <MBox s={s} id="notificationsModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-bell me-2" />Alerts</>}>
        <div className={s.statusRow}><div><strong>Zuku Outage Fixed</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>2 hours ago</div></div><span className={`${s.badge} ${s.badgeS}`}>Resolved</span></div>
      </MBox>

      {/* 23 PROFILE */}
      <MBox s={s} id="profileModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-person me-2" />Profile</>}>
        <div className="text-center"><div className={s.avatar + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div><h5 style={{ fontWeight: 700 }}>James Kamau</h5><p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Network Admin</p></div>
      </MBox>
    </>
  )
}
