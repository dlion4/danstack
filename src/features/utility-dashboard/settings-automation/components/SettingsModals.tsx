import styles from '../styles/settings-automation.module.css'
import { MBox, Stepper, Loading, Lbl, Fld, useModals } from '../../_shared/modalKit'

const s = styles as Record<string, string>
interface Props { active: string | null; onClose: () => void; onOpen: (id: string) => void }

export default function SettingsModals({ active, onClose, onOpen }: Props) {
  const m = useModals(s, active, onClose)

  return (
    <>
      {/* 1 AUTO-PAY SETUP (4-step) */}
      <MBox s={s} id="autoPaySetupModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('autoPaySetup', 4, 3, <>Save Rule <i className="bi bi-check" /></>)}
        title={<><i className="bi bi-arrow-repeat text-primary me-2" />Create Auto-Pay Rule</>}>
        {m.busy === 'autoPaySetup' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Utility', 'Rule', 'Funding', 'Done']} current={m.step('autoPaySetup')} />
          {m.step('autoPaySetup') === 1 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Utility & Type</h6>
            <div className="mb-3"><Lbl s={s}>Utility Account</Lbl><Fld s={s} as="select" options={['KPLC Prepaid (14825739)', 'NCWSC Water (290081)', 'DSTV (20491867421)', 'Safaricom Fibre (SF-40812)']} /></div>
            <div className="row g-3">
              <div className="col-md-6">{m.PickedBox({ k: 'apType', v: 'sched', children: (<><i className="bi bi-calendar-check d-block mb-1" style={{ fontSize: 24, color: 'var(--pm-primary)' }} /><strong>Schedule Based</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Pay on fixed dates or due dates</div></>) })}</div>
              <div className="col-md-6">{m.PickedBox({ k: 'apType', v: 'thresh', children: (<><i className="bi bi-thermometer-half d-block mb-1" style={{ fontSize: 24, color: 'var(--pm-warning)' }} /><strong>Threshold Based</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Top-up when balance drops</div></>) })}</div>
            </div>
          </div>)}
          {m.step('autoPaySetup') === 2 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Define Amount & Timing</h6>
            <div className="mb-3"><Lbl s={s}>Amount Rule</Lbl><Fld s={s} as="select" options={['Fetch exactly full billed amount', 'Fixed amount (custom)', 'Variable, up to a monthly cap']} /></div>
            <div className="mb-3"><Lbl s={s}>Set Cap / Fixed Amount (KES)</Lbl><Fld s={s} type="number" defaultValue="10000" /></div>
            <div className="mb-3"><Lbl s={s}>Execution Timing</Lbl><Fld s={s} as="select" options={['2 days before due date', 'Exactly on due date', '5 days before due date', '1st of every month']} /></div>
          </div>)}
          {m.step('autoPaySetup') === 3 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Guardrails & Funding</h6>
            <div className="mb-3"><Lbl s={s}>Primary Funding Source</Lbl><Fld s={s} as="select" options={['PayMo Wallet', 'M-Pesa 0712***890', 'Equity Bank ***4521']} /></div>
            <div className="mb-3"><Lbl s={s}>Fallback Funding Source</Lbl><Fld s={s} as="select" options={['M-Pesa 0712***890', 'PayMo Wallet', 'None (Fail if primary fails)']} /></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Require manual approval if bill is 20% higher than average</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Notify me instantly upon execution</label></div>
          </div>)}
          {m.step('autoPaySetup') === 4 && (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Auto-Pay Rule Created!</h5><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your automation is now active and monitored.</p></div>)}
        </>)}
      </MBox>

      {/* 2 EDIT AUTO-PAY */}
      <MBox s={s} id="editAutoPayModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('editAutoPayModal', 'Rule updated successfully.')}>Save Changes</button></>}
        title={<><i className="bi bi-pencil me-2" />Edit Auto-Pay Rule</>}>
        {m.body('editAutoPayModal', <>
          <div className="mb-3"><Lbl s={s}>Utility</Lbl><Fld s={s} defaultValue="KPLC Prepaid (14825739)" disabled /></div>
          <div className="mb-3"><Lbl s={s}>Top-up Amount</Lbl><Fld s={s} type="number" defaultValue="2000" /></div>
          <div className="mb-3"><Lbl s={s}>Trigger Condition</Lbl><Fld s={s} as="select" options={['When balance drops below 20 units', 'When balance drops below 50 units', 'Weekly on Monday']} /></div>
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Rule Active</label></div>
        </>)}
      </MBox>

      {/* 3 SMART AUTO-PAY */}
      <MBox s={s} id="smartAutoPayModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('smartAutoPayModal', 'Smart logic applied to all eligible auto-pay rules.')}>Activate Smart Logic</button></>}
        title={<><i className="bi bi-cpu me-2" style={{ color: 'var(--pm-purple)' }} />Smart Auto-Pay Logic</>}>
        {m.body('smartAutoPayModal', <>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-purple-soft)', fontSize: 13 }}><i className="bi bi-stars me-1" style={{ color: 'var(--pm-purple)' }} /> Let AI manage your variable utility bills to prevent bill shock and optimize liquidity.</div>
          <div className={s.switchItem}><div><strong>Deviation Guard</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Only auto-pay if bill is within X% of your 6-month average</div></div><div className="d-flex align-items-center gap-2"><input className={s.formControl} style={{ width: 70 }} defaultValue="15" /><span style={{ fontSize: 12 }}>%</span><div className="form-check form-switch ms-2 m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div></div>
          <div className={s.switchItem}><div><strong>Hard Cap Alert</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Pause auto-pay and alert me if single bill exceeds KES limit</div></div><div className="d-flex align-items-center gap-2"><input className={s.formControl} style={{ width: 100 }} defaultValue="12000" /><div className="form-check form-switch ms-2 m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div></div>
          <div className={s.switchItem}><div><strong>Seasonal Adjustments</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Automatically allow higher electricity thresholds in cold months (Jun-Aug)</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
          <div className={s.switchItem}><div><strong>Liquidity Check</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Delay non-critical payments by 2 days if main bank account balance is low</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" /></div></div>
        </>)}
      </MBox>

      {/* 4 BUDGET WIZARD (3-step) */}
      <MBox s={s} id="budgetWizardModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('budgetWizard', 3, 2, <>Save Budget <i className="bi bi-check" /></>)}
        title={<><i className="bi bi-magic me-2" style={{ color: 'var(--pm-accent)' }} />Budget Allocation Wizard</>}>
        {m.busy === 'budgetWizard' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Analyze', 'Adjust', 'Done']} current={m.step('budgetWizard')} />
          {m.step('budgetWizard') === 1 && (<div><h6 style={{ fontWeight: 700 }}>Analyze & Forecast</h6><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>PayMo has analyzed your last 6 months of utility transactions.</p>
            <div className="row g-3"><div className="col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>AVERAGE MONTHLY SPEND</div><div style={{ fontSize: 22, fontWeight: 700 }}>KES 46,200</div></div></div><div className="col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>RECOMMENDED BUDGET</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-accent)' }}>KES 50,000</div></div></div></div>
          </div>)}
          {m.step('budgetWizard') === 2 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Proposed Allocation</h6>
            {([['Electricity', '20000', '40%', 'var(--pm-warning)'], ['Water', '8000', '16%', 'var(--pm-info)'], ['TV/Internet', '15000', '30%', 'var(--pm-purple)'], ['Airtime/Gas', '7000', '14%', 'var(--pm-accent)']] as const).map(([l, v, w, c]) => (
              <div key={l} className="mb-3"><div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>{l}</span><input className={s.formControl} style={{ width: 100, height: 24, padding: '0 8px', textAlign: 'right' }} defaultValue={v} /></div><div className={s.progress}><div className={s.progressBar} style={{ width: w, background: c }} /></div></div>
            ))}
            <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ fontWeight: 700 }}>Total Validated</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 50,000</strong></div>
          </div>)}
          {m.step('budgetWizard') === 3 && (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Budget Perfectly Aligned!</h5><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your utility budgets have been applied across all categories.</p></div>)}
        </>)}
      </MBox>

      {/* 5 EDIT BUDGET */}
      <MBox s={s} id="editBudgetModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('editBudgetModal', 'Limits updated!')}>Update Limits</button></>}
        title={<><i className="bi bi-sliders me-2" />Edit Budget Limits</>}>
        {m.body('editBudgetModal', <>
          <div className="mb-3"><Lbl s={s}>Electricity Limit</Lbl><Fld s={s} type="number" defaultValue="20000" /></div>
          <div className="mb-3"><Lbl s={s}>Water Limit</Lbl><Fld s={s} type="number" defaultValue="8000" /></div>
          <div className="mb-3"><Lbl s={s}>TV & Internet</Lbl><Fld s={s} type="number" defaultValue="15000" /></div>
          <div className="mb-3"><Lbl s={s}>Airtime & Gas</Lbl><Fld s={s} type="number" defaultValue="5000" /></div>
        </>)}
      </MBox>

      {/* 6 ALERT SETTINGS */}
      <MBox s={s} id="alertSettingsModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('alertSettingsModal', 'Alert preferences saved globally.')}>Save Preferences</button></>}
        title={<><i className="bi bi-bell text-warning me-2" />Global Alert Preferences</>}>
        {m.body('alertSettingsModal', <div className="table-responsive"><table className={s.table}><thead><tr><th>Notification Category</th><th>Push</th><th>SMS</th><th>Email</th><th>WhatsApp</th></tr></thead><tbody>
          {([['Payment Due Reminders', [1, 1, 0, 0]], ['Auto-Pay Executions & Receipts', [1, 0, 1, 0]], ['Auto-Pay Failures & Issues', [1, 1, 1, 1]], ['Budget Exceeded Warning', [1, 1, 0, 0]], ['Household Member Activity', [1, 0, 0, 0]]] as const).map((r) => (<tr key={r[0]}><td>{r[0]}</td>{r[1].map((c, i) => <td key={i}><input type="checkbox" defaultChecked={c === 1} /></td>)}</tr>))}
        </tbody></table></div>)}
      </MBox>

      {/* 7 ADD MEMBER (4-step) */}
      <MBox s={s} id="addMemberModal" active={active} size="lg" onClose={onClose} footer={m.stepFooter('addMember', 4, 3, <>Send Invite <i className="bi bi-send" /></>)}
        title={<><i className="bi bi-person-plus text-success me-2" />Onboard Household Member</>}>
        {m.busy === 'addMember' ? <Loading s={s} /> : (<>
          <Stepper s={s} labels={['Invite', 'Limits', 'Assign', 'Done']} current={m.step('addMember')} />
          {m.step('addMember') === 1 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Invite Details</h6><div className="row g-3">
            <div className="col-md-6"><Lbl s={s}>Full Name</Lbl><Fld s={s} placeholder="E.g., Jane Doe" /></div>
            <div className="col-md-6"><Lbl s={s}>Phone Number (Invite Link)</Lbl><Fld s={s} placeholder="07XX XXX XXX" /></div>
            <div className="col-12"><Lbl s={s}>Household Role</Lbl><Fld s={s} as="select" options={['Spouse / Partner', 'Child / Dependent', 'Elderly Parent', 'Tenant / Roommate', 'Caretaker']} /></div>
          </div></div>)}
          {m.step('addMember') === 2 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Permissions & Budget</h6>
            <div className="mb-3"><Lbl s={s}>Action Access</Lbl><Fld s={s} as="select" options={['Can view & pay (Requires approval for large sums)', 'Full Admin (Equal rights)', 'View only (Cannot trigger payments)']} /></div>
            <div className="mb-3"><Lbl s={s}>Monthly Spending Limit</Lbl><Fld s={s} type="number" placeholder="Amount in KES" /></div>
            <div className="mb-3"><Lbl s={s}>Approval Threshold</Lbl><div className="p-2 border rounded d-flex align-items-center"><input className="form-check-input me-2" type="checkbox" defaultChecked /><span style={{ fontSize: 13 }}>Require my approval for any payment above KES</span><input type="number" className={s.formControl} style={{ width: 100, marginLeft: 8 }} defaultValue="2000" /></div></div>
          </div>)}
          {m.step('addMember') === 3 && (<div><h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Assign Utilities</h6><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Select which utilities this member can view/manage.</p>
            {['Home Electricity (Prepaid)', 'NCWSC Water (Home)', 'Zuku Internet'].map((u) => (<div key={u} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">{u}</label></div>))}
            {['Office Westlands (Postpaid)', 'Parent Home Electricity'].map((u) => (<div key={u} className="form-check mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">{u}</label></div>))}
          </div>)}
          {m.step('addMember') === 4 && (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Member Invited!</h5><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>They will receive an SMS with setup instructions.</p></div>)}
        </>)}
      </MBox>

      {/* 8 EDIT MEMBER */}
      <MBox s={s} id="editMemberModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('editMemberModal', 'Member profile updated!')}>Save</button></>}
        title={<><i className="bi bi-person-gear me-2" />Manage Grace Kamau</>}>
        {m.body('editMemberModal', <>
          <div className="mb-3"><Lbl s={s}>Change Role</Lbl><Fld s={s} as="select" options={['Spouse (Co-Payer)', 'Full Admin', 'View Only']} /></div>
          <div className="mb-3"><Lbl s={s}>Adjust Spending Limit</Lbl><Fld s={s} type="number" defaultValue="30000" /></div>
          <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Receive their activity notifications</label></div>
          <button className={`${s.btnPm} ${s.btnPmOutline} w-100`} style={{ color: 'var(--pm-danger)' }} onClick={() => onOpen('suspendMemberModal')}>Suspend Member Access</button>
        </>)}
      </MBox>

      {/* 9 SPLIT BILL */}
      <MBox s={s} id="splitBillModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('splitBillModal', 'Split logic applied. Requests will be routed automatically.')}>Set Split Rule</button></>}
        title={<><i className="bi bi-pie-chart me-2" style={{ color: 'var(--pm-purple)' }} />Automated Bill Split</>}>
        {m.body('splitBillModal', <>
          <div className="mb-3"><Lbl s={s}>Select Utility</Lbl><Fld s={s} as="select" options={['Safaricom Fibre (Internet)', 'NCWSC Water', 'DSTV Compact+']} /></div>
          <div className="mb-3"><Lbl s={s}>Split With</Lbl><Fld s={s} as="select" options={['Grace Kamau', 'Brian Kamau', 'External Number...']} /></div>
          <div className="mb-3"><Lbl s={s}>Split Ratio</Lbl><div className="d-flex gap-2"><div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--pm-muted)' }}>You</label><Fld s={s} as="select" options={['50%', '60%', '100%']} /></div><div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Them</label><Fld s={s} as="select" options={['50%', '40%', '0%']} /></div></div></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Auto-send payment request via PayMo/WhatsApp 3 days before due date</label></div>
        </>)}
      </MBox>

      {/* 10 CHILD ACCOUNT */}
      <MBox s={s} id="childAccountModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('childAccountModal', 'Child account controls strictly enforced.')}>Update Controls</button></>}
        title={<><i className="bi bi-person-badge text-danger me-2" />Child Account Controls (Brian)</>}>
        {m.body('childAccountModal', <>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)', fontSize: 12 }}><i className="bi bi-shield-lock me-1" /> Strict guardrails are active for this account. They cannot add new utilities or view global budgets.</div>
          <div className="mb-3"><Lbl s={s}>Monthly Pocket Allowance (Utilities/Airtime)</Lbl><Fld s={s} type="number" defaultValue="2000" /></div>
          <div className="mb-3"><Lbl s={s}>Max single transaction</Lbl><Fld s={s} type="number" defaultValue="500" /></div>
          <div className={s.switchItem}><div><strong>Block Airtime Resale</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Prevent purchasing airtime for non-linked numbers</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
          <div className={`${s.switchItem} border-0`}><div><strong>Require Approval</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Forward all payment requests to my app</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
        </>)}
      </MBox>

      {/* 11 ELDERLY PARENT */}
      <MBox s={s} id="elderlyParentModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('elderlyParentModal', 'Elderly care automation synced!')}>Save Routines</button></>}
        title={<><i className="bi bi-person-heart me-2" style={{ color: 'var(--pm-accent)' }} />Elderly Parent Link (Mama Nyokabi)</>}>
        {m.body('elderlyParentModal', <>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 12 }}>This connection allows you to remotely monitor and fund utilities for your parent without requiring them to use the app.</div>
          <div className={s.switchItem}><div><strong>Auto-fund Electricity</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>If token &lt; 15, auto-buy KES 1,000 using my Wallet</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
          <div className={s.switchItem}><div><strong>Pay Monthly Water</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Auto-settle Nyeri Water bill from my M-Pesa</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
          <div className={`${s.switchItem} border-0`}><div><strong>Send SMS Updates</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Send "Token loaded" SMS directly to her phone</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
        </>)}
      </MBox>

      {/* 12 PAYMENT SOURCE PRIORITY */}
      <MBox s={s} id="paymentSourcePriorityModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('paymentSourcePriorityModal', 'Funding cascade order updated globally.')}>Save Order</button></>}
        title={<><i className="bi bi-sort-numeric-down text-info me-2" />Global Funding Priority</>}>
        {m.body('paymentSourcePriorityModal', <>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Drag and drop to set the default order PayMo will attempt to charge for auto-payments.</p>
          {([['1', 'bi-wallet2', 'var(--pm-primary)', 'PayMo Wallet', '(KES 24,500)'], ['2', 'bi-phone', 'var(--pm-accent)', 'M-Pesa', '(0712***890)'], ['3', 'bi-bank', 'var(--pm-info)', 'Equity Bank', '(**4521)'], ['4', 'bi-credit-card', 'var(--pm-muted)', 'Visa Card', '(**9981)']] as const).map((r) => (
            <div key={r[0]} className={s.sourceDragItem}><i className="bi bi-grip-vertical text-muted" /><span className={`${s.badge} ${s.badgeI}`}>{r[0]}</span><i className={`bi ${r[1]} mx-2`} style={{ color: r[2] }} /><strong>{r[3]}</strong> <span style={{ color: 'var(--pm-muted)' }}>{r[4]}</span></div>
          ))}
        </>)}
      </MBox>

      {/* 13 FAILURE HANDLING */}
      <MBox s={s} id="failureHandlingModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('failureHandlingModal', 'Payment retried successfully using PayMo Wallet. Rule updated.', 'TXN-RETRY-881')}>Retry Payment</button></>}
        title={<><i className="bi bi-exclamation-triangle text-danger me-2" />Auto-Pay Failure Resolution</>}>
        {m.body('failureHandlingModal', <>
          <div className="p-3 rounded mb-3" style={{ border: '1px solid var(--pm-danger)', background: 'var(--pm-surface)' }}><div className="d-flex justify-content-between mb-1"><strong>Zuku Internet</strong><span className={`${s.badge} ${s.badgeD}`}>Failed</span></div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reason: Visa Card expired. Primary & Fallback failed.</div><div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>Amount: KES 5,500</div></div>
          <div className="mb-3"><Lbl s={s}>Select new source to retry immediately</Lbl><Fld s={s} as="select" options={['PayMo Wallet (KES 24,500)', 'M-Pesa 0712***890', 'Equity Bank ***4521']} /></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Update the auto-pay rule with this new source</label></div>
        </>)}
      </MBox>

      {/* 14 ROLLOVER SETTINGS */}
      <MBox s={s} id="rolloverSettingsModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('rolloverSettingsModal', 'Auto-rollover settings saved.')}>Save Settings</button></>}
        title={<><i className="bi bi-piggy-bank text-info me-2" />Budget Rollover & Savings</>}>
        {m.body('rolloverSettingsModal', <>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>You are currently <strong>KES 4,500</strong> under budget for this month across all utilities.</div>
          <div className={s.switchItem}><div><strong>Enable Auto-Rollover</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Sweep unspent utility budget at month-end</div></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
          <div className="mb-3 mt-3"><Lbl s={s}>Sweep Destination</Lbl><Fld s={s} as="select" options={['PayMo Savings (Mali) - 8% p.a', 'PayMo Main Wallet', 'M-Shwari Lock Savings']} /></div>
          <button className={`${s.btnPm} ${s.btnPmOutline} w-100`} onClick={() => m.doAction('rolloverSettingsModal', 'Manual sweep completed! KES 4,500 moved to Savings.')}>Sweep KES 4,500 Now</button>
        </>)}
      </MBox>

      {/* 15 OVERSPEND PREVENTION */}
      <MBox s={s} id="overspendPreventionModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('overspendPreventionModal', 'Overspend guards enforced.')}>Enforce Policy</button></>}
        title={<><i className="bi bi-shield-lock text-warning me-2" />Overspend Prevention</>}>
        {m.body('overspendPreventionModal', <>
          <div className="mb-3"><Lbl s={s}>If a payment exceeds the category budget:</Lbl><Fld s={s} as="select" options={['Block the payment entirely', 'Require explicit admin PIN to proceed', 'Send warning alert but allow payment', 'Do nothing']} /></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Apply this strictly to Household Members (Child/Spouse accounts)</label></div>
        </>)}
      </MBox>

      {/* 16 PRICE CHANGE NOTIF */}
      <MBox s={s} id="priceChangeNotifModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Confirm</button>}
        title={<><i className="bi bi-graph-up-arrow text-primary me-2" />Tariff / Price Change Alerts</>}>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>PayMo monitors EPRA and utility providers for gazetted rate changes.</p>
        {['Alert me if KPLC cost per kWh increases', 'Alert me if Water tariff bands shift', 'Alert me if TV/Internet subscription prices rise', 'Alert me on Gas/LPG market price swings'].map((t) => (<div key={t} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">{t}</label></div>))}
      </MBox>

      {/* 17 SERVICE OUTAGE NOTIF */}
      <MBox s={s} id="serviceOutageNotifModal" active={active} onClose={onClose} footer={<button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Confirm</button>}
        title={<><i className="bi bi-cone-striped text-danger me-2" />Outage & Maintenance Alerts</>}>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>We map your linked meter locations to utility provider maintenance schedules.</p>
        <div className="mb-3"><Lbl s={s}>Alert me before planned outages via:</Lbl><div className="d-flex gap-3 mt-1"><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Push</label></div><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">SMS</label></div></div></div>
        <div className="mb-3"><Lbl s={s}>Lead Time</Lbl><Fld s={s} as="select" options={['24 Hours before', '48 Hours before', 'On the morning of outage']} /></div>
      </MBox>

      {/* 18 MEMBER ACTIVITY LOG */}
      <MBox s={s} id="memberActivityLogModal" active={active} size="lg" onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-card-text me-2" />Activity Log: James Kamau</>}>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Date & Time</th><th>Action</th><th>Target</th><th>Value</th></tr></thead><tbody>
          {([['27 Jun, 14:32', 'Created Auto-Pay Rule', 'Safaricom Fibre', 'KES 5,999'], ['25 Jun, 09:15', 'Added Household Member', 'Grace Kamau', '—'], ['24 Jun, 18:00', 'Paid Bill', 'Office Westlands', 'KES 8,400'], ['22 Jun, 11:45', 'Updated Budget Limit', 'TV & Streaming', 'KES 15,000'], ['18 Jun, 08:30', 'Bought Airtime', '0712***890', 'KES 1,000']] as const).map((r, i) => (<tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>))}
        </tbody></table></div>
      </MBox>

      {/* 19 APPROVAL REQUEST */}
      <MBox s={s} id="approvalRequestModal" active={active} onClose={onClose}
        footer={<><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('approvalRequestModal', 'Request declined. Brian notified.')}>Reject</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('approvalRequestModal', 'Request approved and payment executing.')}>Approve & Pay KES 500</button></>}
        title={<><i className="bi bi-check-circle text-success me-2" />Review Payment Request</>}>
        {m.body('approvalRequestModal', <>
          <div className="text-center mb-4"><div className={s.avatar + ' mx-auto mb-2'} style={{ width: 56, height: 56, fontSize: 20, background: 'var(--pm-gradient-blue)' }}>BK</div><h6 style={{ fontWeight: 700, margin: 0 }}>Brian Kamau</h6><p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Child Account</p></div>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Requested for</span><strong>Safaricom Data Bundle</strong></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount</span><strong>KES 500</strong></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Limit check</span><strong className="text-warning">Requires approval (&gt; 0 KES)</strong></div>
            <div className="d-flex justify-content-between"><span className="text-muted">Funding source</span><strong>M-Pesa (Primary Admin)</strong></div>
          </div>
        </>)}
      </MBox>

      {/* 20 HEALTH CHECK */}
      <MBox s={s} id="healthCheckModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-shield-check text-primary me-2" />Settings & Security Health Check</>}>
        <div className={s.statusRow}><div><i className="bi bi-check-circle-fill text-success me-2" /><strong>Auto-Pay Redundancy</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginLeft: 24 }}>Fallback payment sources are configured for all 8 active rules.</div></div></div>
        <div className={s.statusRow}><div><i className="bi bi-check-circle-fill text-success me-2" /><strong>Budget Alignment</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginLeft: 24 }}>Allocated budget perfectly matches expected forecast.</div></div></div>
        <div className={s.statusRow}><div><i className="bi bi-exclamation-triangle-fill text-warning me-2" /><strong>Stale Permission</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginLeft: 24 }}>Caretaker Joe account inactive for 45 days. Consider revoking.</div></div><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('suspendMemberModal')}>Revoke</button></div>
        <div className={`${s.statusRow} border-0`}><div><i className="bi bi-check-circle-fill text-success me-2" /><strong>Overspend Protection</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginLeft: 24 }}>Active and bound to household members.</div></div></div>
      </MBox>

      {/* 21 NOTIFICATIONS */}
      <MBox s={s} id="notificationsModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-bell me-2" />System Notifications</>}>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>Action Required</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Payment request from Brian Kamau for KES 500 pending.</div><button className={`${s.btnPm} ${s.btnSm} mt-2`} onClick={() => onOpen('approvalRequestModal')}>Review</button></div>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>Auto-Pay Failure</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Zuku Internet payment failed due to expired card.</div><button className={`${s.btnPm} ${s.btnSm} mt-2`} onClick={() => onOpen('failureHandlingModal')}>Fix</button></div>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><strong>Automation Success</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Parent Home KPLC token auto-topped up with KES 1,500.</div></div>
          <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}><strong>Budget Alert</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Electricity category has reached 92% of KES 20,000 limit.</div></div>
        </div>
      </MBox>

      {/* 22 PROFILE */}
      <MBox s={s} id="profileModal" active={active} onClose={onClose} footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
        title={<><i className="bi bi-person-circle me-2" />Profile Settings</>}>
        <div className="text-center"><div className={s.avatar + ' mx-auto mb-3'} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div><h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5><p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Primary Administrator · Joined 2023</p>
          <div className="text-start mt-4">
            <div className={s.switchItem}><div><strong>Two-Factor Authentication</strong></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
            <div className={s.switchItem}><div><strong>Biometric Login</strong></div><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked /></div></div>
          </div>
        </div>
      </MBox>

      {/* 23 SUSPEND MEMBER */}
      <MBox s={s} id="suspendMemberModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('suspendMemberModal', 'Member suspended successfully.')}>Confirm Suspend</button></>}
        title={<><i className="bi bi-person-x text-danger me-2" />Suspend Member Access</>}>
        {m.body('suspendMemberModal', <>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Are you sure you want to suspend this household member's access to utility payments?</p>
          <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', fontWeight: 600 }}>They will no longer be able to initiate payments, but past history will be retained.</div>
          <div className="mb-3"><Lbl s={s}>Duration</Lbl><Fld s={s} as="select" options={['Indefinitely', '7 Days', '30 Days']} /></div>
        </>)}
      </MBox>

      {/* 24 DELETE RULE */}
      <MBox s={s} id="deleteRuleModal" active={active} onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmD}`} onClick={() => m.doAction('deleteRuleModal', 'Auto-pay rule deleted forever.')}>Delete Permanently</button></>}
        title={<><i className="bi bi-trash text-danger me-2" />Delete Auto-Pay Rule</>}>
        {m.body('deleteRuleModal', <>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Are you sure you want to permanently delete this automation rule?</p>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}><div className="d-flex justify-content-between mb-1"><span className="text-muted">Utility</span><strong>Selected Service</strong></div><div className="d-flex justify-content-between"><span className="text-muted">Impact</span><strong>Manual payments required</strong></div></div>
          <p style={{ fontSize: 12, color: 'var(--pm-danger)' }}>This action cannot be undone.</p>
        </>)}
      </MBox>

      {/* 25 ACTIVITY HISTORY */}
      <MBox s={s} id="activityHistoryModal" active={active} size="lg" onClose={onClose}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => m.doAction('activityHistoryModal', 'Audit log exported as CSV.')}><i className="bi bi-download" /> Export Log</button></>}
        title={<><i className="bi bi-clock-history me-2" />System Automation Audit Log</>}>
        <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}><table className={s.table}><thead><tr><th>Timestamp</th><th>Action</th><th>Component</th><th>Initiator</th></tr></thead><tbody>
          {([['27 Jun, 16:00', 'Rule Triggered', 'KPLC Prepaid Top-up', 'System (Auto)'], ['26 Jun, 09:14', 'Budget Sweep', 'KES 4,500 to Savings', 'System (Auto)'], ['25 Jun, 11:22', 'Permissions Edited', 'Brian (Child) Limits', 'James Kamau'], ['24 Jun, 10:05', 'Rule Created', 'DSTV Compact+ Auto-pay', 'James Kamau'], ['22 Jun, 14:30', 'Priority Reordered', 'Global Funding Srcs', 'James Kamau'], ['20 Jun, 08:00', 'Alert Sent', 'Water Due Reminder', 'System (Auto)']] as const).map((r, i) => (<tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>))}
        </tbody></table></div>
      </MBox>
    </>
  )
}
