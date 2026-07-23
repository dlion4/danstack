import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/financial-reporting.module.css'

/* ============================================================================
   Financial Reporting, Audit & Analytics — modal layer (legacy page 3.8, ~22 modals)
   2 multistep wizards: Generate Custom Report (3-step), Month-End Close (3-step)
   LEGACY BRIDGE: doAction, nextFlow, downloadFile
   ========================================================================== */

interface ModalsProps { active: string | null; onClose: () => void; onOpen: (id: string) => void }
interface MBoxProps { id: string; active: string | null; title: ReactNode; size?: 'md' | 'lg' | 'xl'; onClose: () => void; children: ReactNode; footer?: ReactNode }

function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

function MBox({ id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
  const s = styles as Record<string, string>
  if (active !== id) return null
  return (<>
    <div className={s.backdrop} onClick={onClose} />
    <div className={s.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
      <div className={`${s.modalBox} ${size === 'lg' ? s.modalBoxLg : ''} ${size === 'xl' ? s.modalBoxXl : ''}`}>
        <div className={s.modalHeader}><h5 className={s.modalTitle}>{title}</h5><button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div>
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFooter}>{footer}</div>}
      </div>
    </div>
  </>)
}

function BusyOverlay() { const s = styles as Record<string, string>; return (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing...</p></div>) }

const FLOW_DEFS: Record<string, { labels: string[] }> = {
  gcr: { labels: ['Type', 'Filters', 'Delivery'] },
  mec: { labels: ['Checks', 'Lock', 'Done'] },
}

interface Result { msg: string; ref?: string }

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
  const s = styles as Record<string, string>; const def = FLOW_DEFS[flowKey]; if (!def) return null
  return (<div className={s.stepper}>{def.labels.map((label, i) => {
    const stepNum = i + 1; const done = stepNum < current; const active = stepNum === current
    return (<div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
      {i > 0 && <div className={s.stepLine} style={{ position: 'absolute', top: 14, left: '-50%', width: '100%', ...(done ? { background: 'var(--pm-accent)' } : {}) }} />}
      <div className={`${s.step} ${done ? s.stepDone : ''} ${active ? s.stepActive : ''}`}>
        <div className={s.stepN}>{done ? <i className="bi bi-check" /> : stepNum}</div><div className={s.stepL}>{label}</div>
      </div>
    </div>)
  })}</div>)
}

export default function FinancialReportingModals({ active, onClose, onOpen }: ModalsProps) {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ gcr: 1, mec: 1 })
  const [tabState, setTabState] = useState<Record<string, string>>({ cfTab: '7day', veTab: 'category' })
  const [selectedType, setSelectedType] = useState<string>('')

  useEffect(() => { if (active === null) { setResults({}); setFlows({ gcr: 1, mec: 1 }); setBusy(null); setSelectedType('') } }, [active])
  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  const doAction = (modalId: string, msg: string, ref?: string) => { setBusy(modalId); busyTimer.current = window.setTimeout(() => { setResults((prev) => ({ ...prev, [modalId]: { msg, ref } })); setBusy(null) }, 1500) }
  const nextFlow = (key: string, total: number) => { const cur = flows[key] ?? 1; if (cur >= total) { onClose(); return } setFlows((prev) => ({ ...prev, [key]: cur + 1 })) }

  const renderReceipt = (r: Result) => (<div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>{r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => downloadFile('receipt.txt', r.msg)}><i className="bi bi-download" /> Save</button><button className={cx(s.btnPm, s.btnSm)} onClick={onClose}>Done</button></div></div>)
  const renderActionBody = (modalId: string, defaultContent: ReactNode) => { if (busy === modalId) return <BusyOverlay />; if (results[modalId]) return renderReceipt(results[modalId]); return defaultContent }

  const gcrStep = flows.gcr ?? 1
  const mecStep = flows.mec ?? 1

  /* M1: Generate Custom Report (3-step) */
  const renderGenerateCustomReport = () => (
    <MBox id="generateCustomReportModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-plus text-primary me-2" />Generate Custom Report</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{gcrStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('gcr', 3)}>{gcrStep === 2 ? 'Generate' : 'Continue'} <i className={`bi ${gcrStep === 2 ? 'bi-check2' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="gcr" current={gcrStep} />
      {gcrStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Report Type</h6>
        <div className="row g-2">
          {[
            { icon: 'bi-bank', iconColor: 'var(--pm-primary)', name: 'Financials', sub: 'P&L, Balance Sheet, Cash Flow', key: 'financials' },
            { icon: 'bi-receipt', iconColor: 'var(--pm-warning)', name: 'Tax & Statutory', sub: 'VAT, PAYE, WHT Extracts', key: 'tax' },
            { icon: 'bi-briefcase', iconColor: 'var(--pm-accent)', name: 'Operational', sub: 'Sales, Aging, Payroll logs', key: 'operational' },
          ].map((t) => (
            <div key={t.key} className="col-md-4">
              <div className="p-3 border rounded text-center" style={{ cursor: 'pointer', ...(selectedType === t.key ? { borderColor: 'var(--pm-primary)', background: 'rgba(79,70,229,.04)' } : {}) }} onClick={() => setSelectedType(t.key)}>
                <i className={`bi ${t.icon} d-block mb-1`} style={{ fontSize: 24, color: t.iconColor }} /><strong>{t.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>}
      {gcrStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Parameters & Filters</h6>
        <div className="row g-3">
          <div className="col-md-6"><label className={s.formLabel}>Specific Report</label><select className={s.formControl}><option>Income Statement (P&L)</option><option>Trial Balance</option><option>General Ledger Extract</option></select></div>
          <div className="col-md-6"><label className={s.formLabel}>Branch/Location</label><select className={s.formControl}><option>All Consolidated</option><option>Nairobi HQ</option><option>Mombasa Branch</option></select></div>
          <div className="col-md-6"><label className={s.formLabel}>From Date</label><input type="date" className={s.formControl} defaultValue="2025-01-01" /></div>
          <div className="col-md-6"><label className={s.formLabel}>To Date</label><input type="date" className={s.formControl} defaultValue="2025-06-30" /></div>
          <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Include zero-balance accounts</label></div><div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Compare to previous period</label></div></div>
        </div>
      </div>}
      {gcrStep === 3 && renderActionBody('generateCustomReportModal', <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-check-lg" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Report generated and scheduled for delivery!</h5><p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: REP-19028</p></div>)}
    </MBox>
  )

  /* M2: Run Month-End Close (3-step) */
  const renderRunMonthEnd = () => (
    <MBox id="runMonthEndModal" active={active} onClose={onClose} title={<><i className="bi bi-calendar2-check text-success me-2" />Month-End Close Wizard</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button>{mecStep < 3 && <button className={cx(s.btnPm, s.btnPmP)} onClick={() => nextFlow('mec', 3)}>{mecStep === 2 ? 'Lock Ledgers' : 'Continue'} <i className={`bi ${mecStep === 2 ? 'bi-lock' : 'bi-arrow-right'}`} /></button>}</>}
    >
      <Stepper flowKey="mec" current={mecStep} />
      {mecStep === 1 && <div className={cx(s.fstep, s.fstepActive)}>
        <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: System Checks</h6>
        <div className={s.statusRow}><div><strong>Bank Reconciliations</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>4 unmatched items detected</div></div><button className={cx(s.btnPm, s.btnSm)} style={{ background: 'var(--pm-warning)', color: '#fff', borderColor: 'var(--pm-warning)' }} onClick={() => onOpen('reconciliationExceptionsModal')}>Resolve</button></div>
        <div className={s.statusRow}><div><strong>Depreciation & Amortization</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Automated journal entries ready</div></div><span className={cx(s.badge, s.badgeS)}>Ready</span></div>
        <div className={s.statusRow}><div><strong>Payroll Disbursed</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>All June salaries settled</div></div><span className={cx(s.badge, s.badgeS)}>Cleared</span></div>
      </div>}
      {mecStep === 2 && <div className={cx(s.fstep, s.fstepActive)}>
        <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Lock Ledgers</h6>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>You are about to soft-lock the period <strong>June 2025</strong>. No further operational transactions can be backdated into this month.</p>
        <div className="mb-3"><label className={s.formLabel}>Closing Period</label><input className={s.formControl} value="June 2025" disabled /></div>
        <div className="form-check mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>I confirm all material adjustments have been posted.</label></div>
      </div>}
      {mecStep === 3 && <div className={s.receipt}><div className={s.receiptIcon}><i className="bi bi-lock" /></div><h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Period Locked Successfully</h5><p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>June 2025 is now closed. Standard financial statements are being generated and archived.</p><div className="d-flex justify-content-center mt-3"><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => { onClose(); onOpen('plSnapshotModal') }}>View June Financials</button></div></div>}
    </MBox>
  )

  /* M3: Export KRA VAT */
  const renderExportKRAVAT = () => (
    <MBox id="exportKRAVATModal" active={active} onClose={onClose} title={<><i className="bi bi-bank text-warning me-2" />KRA VAT Return Extract</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('exportKRAVATModal', 'VAT Extract Generated for iTax upload.')}><i className="bi bi-download" /> Download CSV</button></>}
    >
      {renderActionBody('exportKRAVATModal', <>
        <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> This tool generates a CSV file formatted specifically for the KRA iTax portal (VAT3 template).</div>
        <div className="row g-3">
          <div className="col-md-6"><label className={s.formLabel}>Tax Period</label><select className={s.formControl}><option>June 2025</option><option>May 2025</option></select></div>
          <div className="col-md-6"><label className={s.formLabel}>KRA PIN</label><input className={s.formControl} value="P051234567M" disabled /></div>
          <div className="col-12"><label className={s.formLabel}>Extract Sections</label><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Output VAT (Sales)</label></div><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Input VAT (Purchases)</label></div><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Withholding VAT credits</label></div></div>
        </div>
      </>)}
    </MBox>
  )

  /* M4: Schedule Report */
  const renderScheduleReport = () => (
    <MBox id="scheduleReportModal" active={active} onClose={onClose} title={<><i className="bi bi-clock me-2" />Schedule Report Delivery</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('scheduleReportModal', 'Report scheduling configured successfully.')}>Save Schedule</button></>}
    >
      {renderActionBody('scheduleReportModal', <>
        <div className="mb-3"><label className={s.formLabel}>Select Report Template</label><select className={s.formControl}><option>Weekly Cash Flow Summary</option><option>Monthly Income Statement</option><option>Daily Collections & Reconciliations</option></select></div>
        <div className="row g-3">
          <div className="col-md-6"><label className={s.formLabel}>Frequency</label><select className={s.formControl}><option>Daily</option><option>Weekly (Mondays)</option><option>Monthly (1st of month)</option></select></div>
          <div className="col-md-6"><label className={s.formLabel}>Format</label><select className={s.formControl}><option>PDF</option><option>Excel</option></select></div>
          <div className="col-12"><label className={s.formLabel}>Email Recipients (comma separated)</label><input className={s.formControl} defaultValue="titus@company.com, audit@kpmg.co.ke" /></div>
        </div>
      </>)}
    </MBox>
  )

  /* M5: View Audit Log */
  const renderViewAuditLog = () => (
    <MBox id="viewAuditLogModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-lock text-purple me-2" />Immutable Audit Trail</>} size="xl"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('downloadStatementModal')}>Export Cryptographic Log</button></>}
    >
      <div className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
        <input type="date" className={s.formControl} style={{ width: 150 }} defaultValue="2025-06-28" />
        <select className={s.formControl} style={{ width: 150 }}><option>All Users</option><option>Titus G.</option><option>System API</option></select>
        <select className={s.formControl} style={{ width: 180 }}><option>All Modules</option><option>Payments</option><option>Payroll</option><option>Settings</option></select>
        <input type="text" className={s.formControl} style={{ width: 200 }} placeholder="Search hash, ID, IP..." />
      </div>
      <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}><table className={s.tbl}><thead><tr><th>Timestamp</th><th>User/IP</th><th>Module</th><th>Action</th><th>Verification Hash</th></tr></thead>
        <tbody>
          <tr><td>2025-06-28 14:32:01</td><td>Titus G. / 197.232.14.8</td><td>Disbursements</td><td>Approved Bulk Batch 9921</td><td><code style={{ fontSize: 10 }}>a4b1c2d3e4f5...</code></td></tr>
          <tr><td>2025-06-28 14:30:15</td><td>Grace M. / 197.232.14.8</td><td>Disbursements</td><td>Created Bulk Batch 9921</td><td><code style={{ fontSize: 10 }}>b9x8y7z6a5b4...</code></td></tr>
          <tr><td>2025-06-28 10:15:44</td><td>System API</td><td>Reporting</td><td>Generated VAT Extract</td><td><code style={{ fontSize: 10 }}>c1d2e3f4g5h6...</code></td></tr>
          <tr><td>2025-06-27 16:45:12</td><td>Grace M. / 197.232.14.8</td><td>Payroll</td><td>Initiated June Payroll Run</td><td><code style={{ fontSize: 10 }}>z9y8x7w6v5u4...</code></td></tr>
          <tr><td>2025-06-27 09:12:33</td><td>James K. / 105.161.88.2</td><td>Invoicing</td><td>Voided INV-2041</td><td><code style={{ fontSize: 10 }}>f5e4d3c2b1a0...</code></td></tr>
        </tbody></table></div>
    </MBox>
  )

  /* M6: Invite Auditor */
  const renderInviteAuditor = () => (
    <MBox id="inviteAuditorModal" active={active} onClose={onClose} title={<><i className="bi bi-person-lock me-2" />Grant Auditor Access</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('inviteAuditorModal', 'Auditor invitation sent securely.')}>Send Invitation</button></>}
    >
      {renderActionBody('inviteAuditorModal', <>
        <div className="mb-3"><label className={s.formLabel}>Auditor Email Address</label><input type="email" className={s.formControl} placeholder="auditor@firm.com" /></div>
        <div className="mb-3"><label className={s.formLabel}>Access Duration</label><select className={s.formControl}><option>24 Hours</option><option>7 Days</option><option>30 Days (Standard Audit)</option><option>Until Revoked</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>Data Scope</label>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked disabled /><label className="form-check-label">Read-only Financial Statements</label></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">View Transaction Level Data & Receipts</label></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Access Immutable Audit Logs</label></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">View Employee Payroll Data (PII)</label></div>
        </div>
      </>)}
    </MBox>
  )

  /* M7: Cash Flow Forecast (tabbed) */
  const cfTab = tabState.cfTab ?? '7day'
  const renderCashFlowForecast = () => (
    <MBox id="cashFlowForecastModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-up me-2" />90-Day Cash Flow Forecast</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('downloadStatementModal')}>Export Forecast</button></>}
    >
      <div className={cx(s.pills, 'mb-3')}>
        {['7day', '30day', '90day'].map((t) => (<button key={t} className={`${s.pill} ${cfTab === t ? s.pillActive : ''}`} onClick={() => setTabState((prev) => ({ ...prev, cfTab: t }))}>{t === '7day' ? '7 Days' : t === '30day' ? '30 Days' : '90 Days'}</button>))}
      </div>
      {cfTab === '7day' && <div>
        <div className="row g-3 mb-4">
          <div className="col-4"><div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>STARTING BALANCE</div><strong style={{ fontSize: 18 }}>KES 12.45M</strong></div></div>
          <div className="col-4"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857' }}>EXPECTED INFLOWS</div><strong style={{ fontSize: 18, color: 'var(--pm-accent)' }}>+ KES 3.2M</strong></div></div>
          <div className="col-4"><div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)' }}><div style={{ fontSize: 11, color: '#991B1B' }}>SCHEDULED OUTFLOWS</div><strong style={{ fontSize: 18, color: 'var(--pm-danger)' }}>− KES 4.8M</strong></div></div>
        </div>
        <h6 style={{ fontWeight: 700 }}>Upcoming Major Movements</h6>
        <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>30 Jun</td><td>Monthly Payroll Run</td><td><span className={cx(s.badge, s.badgeD)}>Out</span></td><td>KES 3,250,000</td></tr>
            <tr><td>02 Jul</td><td>Invoice #2201 (Acme)</td><td><span className={cx(s.badge, s.badgeS)}>In</span></td><td>KES 1,800,000</td></tr>
            <tr><td>05 Jul</td><td>Supplier Run (Q2)</td><td><span className={cx(s.badge, s.badgeD)}>Out</span></td><td>KES 1,150,000</td></tr>
          </tbody></table></div>
      </div>}
      {cfTab === '30day' && <p className="text-center p-4" style={{ color: 'var(--pm-muted)' }}>30-day chart visualization goes here...</p>}
      {cfTab === '90day' && <p className="text-center p-4" style={{ color: 'var(--pm-muted)' }}>90-day chart visualization goes here...</p>}
    </MBox>
  )

  /* M8: P&L Snapshot */
  const renderPLSnapshot = () => (
    <MBox id="plSnapshotModal" active={active} onClose={onClose} title={<><i className="bi bi-file-bar-graph me-2" />Profit & Loss Snapshot (MTD)</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('downloadStatementModal')}>Full P&L Report</button></>}
    >
      <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 700, fontSize: 16 }}>June 2025</span><span className={cx(s.badge, s.badgeI)}>Consolidated View</span></div>
      <div className="p-3 border rounded mb-3">
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Total Gross Revenue</span><strong>KES 8,240,000</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Cost of Goods Sold (COGS)</span><strong>− KES 2,100,000</strong></div>
        <hr className={s.divider} />
        <div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Gross Profit</span><strong style={{ color: 'var(--pm-accent)' }}>KES 6,140,000 (74%)</strong></div>
      </div>
      <div className="p-3 border rounded mb-3">
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Payroll & Employee Benefits</span><strong>− KES 3,250,000</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Marketing & Sales</span><strong>− KES 450,000</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Software & Subscriptions</span><strong>− KES 280,000</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Rent & Utilities</span><strong>− KES 320,000</strong></div>
        <hr className={s.divider} />
        <div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total Opex</span><strong>KES 4,300,000</strong></div>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
        <div className="d-flex justify-content-between"><span style={{ fontWeight: 700, fontSize: 16 }}>Net Operating Profit</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 1,840,000 (22%)</strong></div>
      </div>
    </MBox>
  )

  /* M9: Tax Readiness */
  const renderTaxReadiness = () => (
    <MBox id="taxReadinessModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-check text-success me-2" />Tax & Compliance Readiness</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center mb-4"><div style={{ fontSize: 48, fontWeight: 800, color: 'var(--pm-accent)', fontFamily: 'var(--pm-font-display)', lineHeight: 1 }}>98%</div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pm-muted)', textTransform: 'uppercase' }}>OVERALL COMPLIANCE SCORE</div></div>
      <div className={s.statusRow}><div><strong>KRA VAT (June)</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Extract generated, ready for iTax</div></div><span className={cx(s.badge, s.badgeS)}>Ready</span></div>
      <div className={s.statusRow}><div><strong>e-TIMS Integration</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>API connection healthy, 100% matched</div></div><span className={cx(s.badge, s.badgeS)}>Active</span></div>
      <div className={s.statusRow}><div><strong>PAYE / NSSF / SHIF</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Pending June payroll execution</div></div><span className={cx(s.badge, s.badgeW)}>Pending</span></div>
      <div className={s.statusRow}><div><strong>CR12 Annual Return</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Due August 2025</div></div><span className={cx(s.badge, s.badgeI)}>On Track</span></div>
    </MBox>
  )

  /* M10: e-TIMS Reconciliation */
  const renderETimsReconciliation = () => (
    <MBox id="eTimsReconciliationModal" active={active} onClose={onClose} title={<><i className="bi bi-receipt me-2" />e-TIMS Invoice Reconciliation</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('eTimsReconciliationModal', 'Manual sync triggered. All invoices up to date.')}>Force Sync Now</button></>}
    >
      {renderActionBody('eTimsReconciliationModal', <>
        <div className="row g-3 mb-3">
          <div className="col-md-4"><div className="p-3 border rounded text-center"><div style={{ fontSize: 20, fontWeight: 700 }}>142</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>INVOICES (JUN)</div></div></div>
          <div className="col-md-4"><div className="p-3 border rounded text-center" style={{ borderColor: 'var(--pm-accent)', background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#047857' }}>142</div><div style={{ fontSize: 11, color: '#065F46' }}>SYNCED TO KRA</div></div></div>
          <div className="col-md-4"><div className="p-3 border rounded text-center"><div style={{ fontSize: 20, fontWeight: 700 }}>0</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>EXCEPTIONS</div></div></div>
        </div>
        <div className="table-responsive" style={{ maxHeight: 250, overflowY: 'auto' }}><table className={s.tbl}><thead><tr><th>Invoice #</th><th>Date</th><th>Amount</th><th>e-TIMS CU Number</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>INV-2045</td><td>28 Jun 2025</td><td>KES 45,000</td><td><code style={{ fontSize: 11 }}>KRA-CU-99812A</code></td><td><span className={cx(s.badge, s.badgeS)}>Synced</span></td></tr>
            <tr><td>INV-2044</td><td>27 Jun 2025</td><td>KES 120,500</td><td><code style={{ fontSize: 11 }}>KRA-CU-99811B</code></td><td><span className={cx(s.badge, s.badgeS)}>Synced</span></td></tr>
            <tr><td>INV-2043</td><td>26 Jun 2025</td><td>KES 15,000</td><td><code style={{ fontSize: 11 }}>KRA-CU-99810C</code></td><td><span className={cx(s.badge, s.badgeS)}>Synced</span></td></tr>
          </tbody></table></div>
      </>)}
    </MBox>
  )

  /* M11: Branch Performance */
  const renderBranchPerformance = () => (
    <MBox id="branchPerformanceModal" active={active} onClose={onClose} title={<><i className="bi bi-shop me-2" />Branch Performance Comparison</>} size="lg"
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Metric</th><th style={{ background: 'var(--pm-info-soft)' }}>Nairobi HQ</th><th style={{ background: 'var(--pm-warning-soft)' }}>Mombasa Branch</th><th>Consolidated</th></tr></thead>
        <tbody>
          <tr><td>Gross Revenue (YTD)</td><td>KES 32.5M</td><td>KES 15.7M</td><td><strong>KES 48.2M</strong></td></tr>
          <tr><td>Operating Expenses</td><td>KES 14.1M</td><td>KES 6.8M</td><td><strong>KES 20.9M</strong></td></tr>
          <tr><td>Headcount</td><td>28</td><td>14</td><td><strong>42</strong></td></tr>
          <tr><td>Profit Margin</td><td>56%</td><td>56%</td><td><strong>56%</strong></td></tr>
          <tr><td>Collection Speed (DSO)</td><td>22 Days</td><td>34 Days</td><td><strong>26 Days</strong></td></tr>
        </tbody></table></div>
      <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}><i className="bi bi-lightbulb text-warning me-1" /> <strong>Insight:</strong> Mombasa branch has slower collection times (DSO 34 vs 22). Consider implementing automated payment reminders for coastal clients.</div>
    </MBox>
  )

  /* M12: Customer Spend Analytics */
  const renderCustomerSpendAnalytics = () => (
    <MBox id="customerSpendAnalyticsModal" active={active} onClose={onClose} title={<><i className="bi bi-people me-2" />Customer Revenue Analytics</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('downloadStatementModal')}>Export Data</button></>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-6"><div className="p-3 border rounded"><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>TOP CLIENT</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-primary)' }}>Acme Corp Ltd</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>KES 12.5M (26% of Total)</div></div></div>
        <div className="col-md-6"><div className="p-3 border rounded"><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>FASTEST PAYING</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-accent)' }}>TechFlow Solutions</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Avg. 4 Days to Pay</div></div></div>
      </div>
      <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Customer Name</th><th>Revenue (YTD)</th><th>Invoices</th><th>Avg Time to Pay</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Acme Corp Ltd</td><td>KES 12,500,000</td><td>14</td><td>28 Days</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td></tr>
          <tr><td>TechFlow Solutions</td><td>KES 8,200,000</td><td>42</td><td>4 Days</td><td><span className={cx(s.badge, s.badgeS)}>VIP</span></td></tr>
          <tr><td>Global Logistics Ke</td><td>KES 5,400,000</td><td>6</td><td>65 Days</td><td><span className={cx(s.badge, s.badgeW)}>Slow Payer</span></td></tr>
          <tr><td>City Retail Chain</td><td>KES 3,100,000</td><td>22</td><td>18 Days</td><td><span className={cx(s.badge, s.badgeS)}>Healthy</span></td></tr>
        </tbody></table></div>
    </MBox>
  )

  /* M13: Vendor Expense Analytics (tabbed) */
  const veTab = tabState.veTab ?? 'category'
  const renderVendorExpenseAnalytics = () => (
    <MBox id="vendorExpenseAnalyticsModal" active={active} onClose={onClose} title={<><i className="bi bi-cart me-2" />Supplier & Expense Analytics</>} size="lg"
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className={cx(s.pills, 'mb-3')}>
        <button className={`${s.pill} ${veTab === 'category' ? s.pillActive : ''}`} onClick={() => setTabState((prev) => ({ ...prev, veTab: 'category' }))}>By Category</button>
        <button className={`${s.pill} ${veTab === 'supplier' ? s.pillActive : ''}`} onClick={() => setTabState((prev) => ({ ...prev, veTab: 'supplier' }))}>By Supplier</button>
      </div>
      {veTab === 'category' && <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Category</th><th>Amount (YTD)</th><th>% of Opex</th><th>Trend (vs Last Year)</th></tr></thead>
        <tbody>
          <tr><td>Payroll & Benefits</td><td>KES 18.2M</td><td>64%</td><td>+12% <i className="bi bi-arrow-up-right" style={{ color: 'var(--pm-danger)' }} /></td></tr>
          <tr><td>Inventory & Raw Mat</td><td>KES 6.5M</td><td>23%</td><td>+4% <i className="bi bi-arrow-up-right" style={{ color: 'var(--pm-warning)' }} /></td></tr>
          <tr><td>Software & IT</td><td>KES 1.8M</td><td>6%</td><td>+18% <i className="bi bi-arrow-up-right" style={{ color: 'var(--pm-danger)' }} /></td></tr>
          <tr><td>Utilities</td><td>KES 1.1M</td><td>4%</td><td>−2% <i className="bi bi-arrow-down-right" style={{ color: 'var(--pm-accent)' }} /></td></tr>
        </tbody></table></div>}
      {veTab === 'supplier' && <p className="text-center p-4" style={{ color: 'var(--pm-muted)' }}>Supplier breakdown table visualization goes here...</p>}
    </MBox>
  )

  /* M14: Reconciliation Exceptions */
  const renderReconciliationExceptions = () => (
    <MBox id="reconciliationExceptionsModal" active={active} onClose={onClose} title={<><i className="bi bi-exclamation-triangle text-warning me-2" />Reconciliation Exceptions</>} size="lg"
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>The following incoming bank deposits could not be automatically matched to an open invoice.</p>
      <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Date</th><th>Bank Reference</th><th>Amount</th><th>Suggested Match</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>28 Jun</td><td>EQU-RTGS-9912A</td><td>KES 45,000</td><td>INV-2045 (Acme Corp)?</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('reconciliationExceptionsModal', 'Matched to INV-2045 successfully.')}>Accept</button></td></tr>
          <tr><td>27 Jun</td><td>KCB-EFT-4412X</td><td>KES 32,500</td><td>No match found</td><td><button className={cx(s.btnPm, s.btnSm)}>Manual Map</button></td></tr>
          <tr><td>25 Jun</td><td>MPESA-P9212K</td><td>KES 15,000</td><td>INV-2043 (Retail)?</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('reconciliationExceptionsModal', 'Matched to INV-2043 successfully.')}>Accept</button></td></tr>
          <tr><td>22 Jun</td><td>EQU-DEP-CASH</td><td>KES 50,000</td><td>No match found</td><td><button className={cx(s.btnPm, s.btnSm)}>Manual Map</button></td></tr>
        </tbody></table></div>
    </MBox>
  )

  /* M15: Download Statement */
  const renderDownloadStatement = () => (
    <MBox id="downloadStatementModal" active={active} onClose={onClose} title={<><i className="bi bi-download me-2" />Export Data / Statement</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('downloadStatementModal', 'File generated and download started.')}>Download Now</button></>}
    >
      {renderActionBody('downloadStatementModal', <>
        <div className="mb-3"><label className={s.formLabel}>Data Source</label><select className={s.formControl}><option>PayMo Wallet Statement</option><option>M-Pesa Collections</option><option>Consolidated Financial Report</option></select></div>
        <div className="row g-3 mb-3">
          <div className="col-6"><label className={s.formLabel}>From</label><input type="date" className={s.formControl} defaultValue="2025-06-01" /></div>
          <div className="col-6"><label className={s.formLabel}>To</label><input type="date" className={s.formControl} defaultValue="2025-06-30" /></div>
        </div>
        <div className="mb-3"><label className={s.formLabel}>Format</label><select className={s.formControl}><option>PDF Document</option><option>Excel Spreadsheet</option><option>MT940 (Swift)</option></select></div>
      </>)}
    </MBox>
  )

  /* M16: Configure Dashboards */
  const renderConfigureDashboards = () => (
    <MBox id="configureDashboardsModal" active={active} onClose={onClose} title={<><i className="bi bi-sliders text-primary me-2" />Configure Dashboard Widgets</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('configureDashboardsModal', 'Dashboard configuration saved.')}>Save Layout</button></>}
    >
      {renderActionBody('configureDashboardsModal', <>
        <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Select which metrics appear on your main Financial Reporting view.</p>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Liquidity Position</label></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">YTD Revenue</label></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Pending Reconciliations</label></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Compliance & Audit Score</label></div>
        <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Top Expense Category Tracker</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Live FX Rates (USD/KES)</label></div>
      </>)}
    </MBox>
  )

  /* M17: User Activity Log */
  const renderUserActivityLog = () => (
    <MBox id="userActivityLogModal" active={active} onClose={onClose} title={<><i className="bi bi-eye text-primary me-2" />Activity Detail View</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>User</span><strong>Titus G. (Admin)</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Timestamp</span><strong>28 Jun 2025, 14:32:01 EAT</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>IP Address</span><strong>197.232.14.8 (Kenya)</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Device</span><strong>Mac OS X, Chrome 114</strong></div>
        <div className="d-flex justify-content-between"><span style={{ color: 'var(--pm-muted)' }}>Status</span><span className={cx(s.badge, s.badgeS)}>Success</span></div>
      </div>
      <h6 style={{ fontWeight: 700 }}>Action Payload</h6>
      <pre className="p-3 border rounded" style={{ background: '#f8f9fa', fontSize: 11, overflowX: 'auto', margin: 0 }}>{`{
  "action": "APPROVE_DISBURSEMENT_BATCH",
  "batch_id": "9921",
  "total_amount": 3250000,
  "records": 42,
  "verification_method": "MFA_OTP",
  "hash": "a4b1c2d3e4f5..."
}`}</pre>
    </MBox>
  )

  /* M18: Statutory Deductions */
  const renderStatutoryDeductions = () => (
    <MBox id="statutoryDeductionsModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-check text-warning me-2" />Statutory Deductions (June 2025)</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => onOpen('downloadStatementModal')}>Export All ZIP</button></>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>PAYE (KRA)</div><strong style={{ fontSize: 20, color: 'var(--pm-warning)' }}>KES 450,200</strong></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}><div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 700 }}>NSSF</div><strong style={{ fontSize: 20, color: 'var(--pm-info)' }}>KES 84,000</strong></div></div>
        <div className="col-md-4"><div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>SHIF</div><strong style={{ fontSize: 20, color: 'var(--pm-accent)' }}>KES 72,500</strong></div></div>
      </div>
      <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Filing</th><th>Due Date</th><th>Employees</th><th>Total Due</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>PAYE (P10)</td><td>09 Jul 2025</td><td>42</td><td>KES 450,200</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('statutoryDeductionsModal', 'CSV Downloaded.')}>CSV Extract</button></td></tr>
          <tr><td>NSSF</td><td>09 Jul 2025</td><td>42</td><td>KES 84,000</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('statutoryDeductionsModal', 'Excel Downloaded.')}>Excel Extract</button></td></tr>
          <tr><td>SHIF</td><td>09 Jul 2025</td><td>42</td><td>KES 72,500</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('statutoryDeductionsModal', 'Excel Downloaded.')}>Excel Extract</button></td></tr>
          <tr><td>Housing Levy</td><td>09 Jul 2025</td><td>42</td><td>KES 48,000</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => doAction('statutoryDeductionsModal', 'CSV Downloaded.')}>CSV Extract</button></td></tr>
        </tbody></table></div>
    </MBox>
  )

  /* M19: Export Trial Balance */
  const renderExportTrialBalance = () => (
    <MBox id="exportTrialBalanceModal" active={active} onClose={onClose} title={<><i className="bi bi-file-spreadsheet text-danger me-2" />Trial Balance Preview</>} size="lg"
      footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('exportTrialBalanceModal', 'Trial Balance downloaded successfully.')}><i className="bi bi-download" /> Download Excel</button></>}
    >
      {renderActionBody('exportTrialBalanceModal', <>
        <div className="d-flex justify-content-between mb-3"><span style={{ fontWeight: 700 }}>As of: 28 Jun 2025</span><span className={cx(s.badge, s.badgeI)}>Consolidated</span></div>
        <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto' }}><table className={s.tbl}><thead><tr><th>GL Code</th><th>Account Name</th><th>Debit (KES)</th><th>Credit (KES)</th></tr></thead>
          <tbody>
            <tr><td>1001</td><td>PayMo Wallet</td><td>12,450,800</td><td>−</td></tr>
            <tr><td>1100</td><td>Accounts Receivable</td><td>4,200,000</td><td>−</td></tr>
            <tr><td>2001</td><td>Accounts Payable</td><td>−</td><td>2,150,000</td></tr>
            <tr><td>3001</td><td>Retained Earnings</td><td>−</td><td>8,500,800</td></tr>
            <tr><td>4001</td><td>Sales Revenue</td><td>−</td><td>48,200,000</td></tr>
            <tr><td>5001</td><td>Payroll Expenses</td><td>18,200,000</td><td>−</td></tr>
            <tr><td>5010</td><td>COGS</td><td>21,000,000</td><td>−</td></tr>
            <tr style={{ fontWeight: 700 }}><td></td><td>TOTAL</td><td>55,850,800</td><td>55,850,800</td></tr>
          </tbody></table></div>
      </>)}
    </MBox>
  )

  /* M20: Report Delivery Settings */
  const renderReportDeliverySettings = () => (
    <MBox id="reportDeliverySettingsModal" active={active} onClose={onClose} title={<><i className="bi bi-sliders text-primary me-2" />Automated Delivery Settings</>}
      footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={cx(s.btnPm, s.btnPmP)} onClick={() => doAction('reportDeliverySettingsModal', 'Delivery configuration saved.')}>Save Settings</button></>}
    >
      {renderActionBody('reportDeliverySettingsModal', <>
        <div className="mb-3"><label className={s.formLabel}>Delivery Channel</label><select className={s.formControl}><option>Email (Secure Attachment)</option><option>SFTP Server</option><option>Webhook (JSON Payload)</option></select></div>
        <div className="mb-3"><label className={s.formLabel}>SFTP Host (If applicable)</label><input className={s.formControl} placeholder="sftp.company.com" /></div>
        <div className="mb-3"><label className={s.formLabel}>SFTP Port</label><input className={s.formControl} placeholder="22" /></div>
        <div className="mb-3"><label className={s.formLabel}>Security</label>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Password protect PDFs (using KRA PIN)</label></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">PGP Encrypt CSV/Excel files</label></div>
        </div>
      </>)}
    </MBox>
  )

  /* M21: Dispute Audit */
  const renderDisputeAudit = () => (
    <MBox id="disputeAuditModal" active={active} onClose={onClose} title={<><i className="bi bi-eye text-primary me-2" />Audit Log: Invoice Voided</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>User</span><strong>James K. (Sales)</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Target</span><strong>Invoice #INV-2041</strong></div>
        <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--pm-muted)' }}>Action</span><strong>Status changed to VOID</strong></div>
        <div className="d-flex justify-content-between"><span style={{ color: 'var(--pm-muted)' }}>Reason Provided</span><strong>"Duplicate generated by error"</strong></div>
      </div>
      <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>No financial impact recorded as payment had not been reconciled against this invoice. e-TIMS credit note auto-filed.</div>
    </MBox>
  )

  /* M22: Financial Health Score */
  const renderFinancialHealthScore = () => (
    <MBox id="financialHealthScoreModal" active={active} onClose={onClose} title={<><i className="bi bi-heart-pulse me-2" style={{ color: 'var(--pm-accent)' }} />Business Financial Health</>}
      footer={<button className={s.btnPm} onClick={onClose}>Close</button>}
    >
      <div className="text-center mb-4"><div style={{ fontSize: 48, fontWeight: 800, color: 'var(--pm-accent)', fontFamily: 'var(--pm-font-display)', lineHeight: 1 }}>Excellent</div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pm-muted)', textTransform: 'uppercase' }}>OVERALL RATING</div></div>
      <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Indicator</th><th>Status</th><th>Score</th></tr></thead>
        <tbody>
          <tr><td>Liquidity Ratio (Current)</td><td>2.4x (Very Healthy)</td><td><span className={cx(s.badge, s.badgeS)}>Strong</span></td></tr>
          <tr><td>Days Sales Outstanding</td><td>26 Days</td><td><span className={cx(s.badge, s.badgeS)}>Strong</span></td></tr>
          <tr><td>Expense to Revenue Ratio</td><td>43% (Within target)</td><td><span className={cx(s.badge, s.badgeS)}>Strong</span></td></tr>
          <tr><td>Revenue Concentration</td><td>Top client is 26%</td><td><span className={cx(s.badge, s.badgeW)}>Fair</span></td></tr>
        </tbody></table></div>
      <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}><i className="bi bi-stars me-1" style={{ color: 'var(--pm-purple)' }} /> AI Suggestion: Your liquidity is strong enough to place KES 5M in a 30-day Money Market Fund to generate yield without impacting operational cash flow.</div>
    </MBox>
  )

  /* M23: Profile */
  const renderProfile = () => (
    <MBox id="profileModal" active={active} onClose={onClose} title={<><i className="bi bi-person-circle me-2" />User Profile</>}
    >
      <div className="text-center">
        <div className={s.avatar} style={{ width: 64, height: 64, fontSize: 24, background: 'linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)', margin: '0 auto 12px' }}>TG</div>
        <h5 style={{ fontWeight: 700 }}>Titus G.</h5>
        <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>Finance Director · Financial Reporting Admin</p>
        <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Approval Limit</span><br /><strong>Unlimited</strong></div></div>
          <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span style={{ color: 'var(--pm-muted)' }}>Reports Generated</span><br /><strong>14 this month</strong></div></div>
        </div>
      </div>
    </MBox>
  )

  /* M24: Notifications (bonus, used in header counter) */
  const renderNotifications = () => (
    <MBox id="notificationsModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Notifications</>}
      footer={<><button className={cx(s.btnPm, s.btnSm)}>Mark all read</button><button className={s.btnPm} onClick={onClose}>Close</button></>}
    >
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}><strong>PAYE Return Due in 3 days</strong><div style={{ fontSize: 11 }}>KES 450,200 pending extract</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}><strong>4 Unmatched Bank Deposits</strong><div style={{ fontSize: 11 }}>Require manual allocation</div></div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-purple-soft)', fontSize: 13 }}><strong>Auditor access expiring</strong><div style={{ fontSize: 11 }}>KPMG Team · Expires in 48 hrs</div></div>
    </MBox>
  )

  return (<>
    {renderGenerateCustomReport()}{renderRunMonthEnd()}{renderExportKRAVAT()}{renderScheduleReport()}
    {renderViewAuditLog()}{renderInviteAuditor()}{renderCashFlowForecast()}{renderPLSnapshot()}
    {renderTaxReadiness()}{renderETimsReconciliation()}{renderBranchPerformance()}
    {renderCustomerSpendAnalytics()}{renderVendorExpenseAnalytics()}
    {renderReconciliationExceptions()}{renderDownloadStatement()}{renderConfigureDashboards()}
    {renderUserActivityLog()}{renderStatutoryDeductions()}{renderExportTrialBalance()}
    {renderReportDeliverySettings()}{renderDisputeAudit()}{renderFinancialHealthScore()}
    {renderProfile()}{renderNotifications()}
  </>)
}
