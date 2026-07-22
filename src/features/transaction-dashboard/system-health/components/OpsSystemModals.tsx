/* ============================================================================
 * OpsSystemModals.tsx — all 30 modals for System Health & Operations (1.17).
 * ----------------------------------------------------------------------------
 * Migrated from legacy Bootstrap modals + vanilla JS flows into React state.
 * Multi-step flows: settlementDetail (4 steps) and incidentDetail (4 steps).
 * Pill tabs: Global Status, Fraud Model Console, Partner API Detail.
 * ========================================================================== */
import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from '../styles/systemHealth.module.css';
import { cx } from '../../../shell/data/shellData';

const s = styles as Record<string, string>;

/* ============================================================
   TYPES
   ============================================================ */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  icon?: string;
  children: ReactNode;
  footer?: ReactNode;
}

interface PillTabsProps {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}

interface FlowState {
  current: number;
  total: number;
  labels: string[];
}

/* ============================================================
   HELPERS
   ============================================================ */
function Modal({ open, onClose, size = 'md', title, icon, children, footer }: ModalProps) {
  const [animating, setAnimating] = useState(false);
  useEffect(() => { if (open) setAnimating(false); }, [open]);
  if (!open) return null;
  const sizeClass = size === 'xl' ? s.modalBoxXl : size === 'lg' ? s.modalBoxLg : '';
  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modalWrap} onClick={(e) => e.stopPropagation()}>
        <div className={cx(s.modalBox, sizeClass)}>
          <div className={s.modalHeader}>
            <span className={s.modalTitle}>
              {icon && <i className={`bi ${icon} me-2`} />}
              {title}
            </span>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className={s.modalBody}>
            {animating ? (
              <div className={s.loadingOv}>
                <div className={s.spinner} />
                <p className={s.loadingLabel}>Processing...</p>
              </div>
            ) : children}
          </div>
          {footer && <div className={s.modalFooter}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function PillTabs({ tabs, active, onChange }: PillTabsProps) {
  return (
    <div className={s.pills} style={{ marginBottom: 12 }}>
      {tabs.map((tab) => (
        <button key={tab.key} type="button" className={cx(active === tab.key && s.pillActive)} onClick={() => onChange(tab.key)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   MULTI-STEP HELPERS
   ============================================================ */
function useFlow(total: number, labels: string[]) {
  const [state, setState] = useState<FlowState>({ current: 1, total, labels });

  const stepClass = useCallback(
    (step: number) => {
      if (step < state.current) return s.stepDone;
      if (step === state.current) return s.stepActive;
      return '';
    },
    [state.current],
  );

  const renderStepper = useCallback(
    () =>
      state.labels.map((label, i) => {
        const step = i + 1;
        const isLast = i === state.labels.length - 1;
        return (
          <div key={step} className={cx(s.step, stepClass(step))}>
            <div className={s.stepN}>{step < state.current ? <i className="bi bi-check" /> : step}</div>
            <div className={s.stepL}>{label}</div>
            {!isLast && <div className={s.stepLine} />}
          </div>
        );
      }),
    [state.labels, stepClass],
  );

  const showStep = useCallback(
    (key: string, step: number) => {
      const id = `${key}S${step}`;
      const el = document.getElementById(id);
      if (el) el.classList.add(s.fstepActive);
      for (let i = 1; i <= state.total; i++) {
        const other = document.getElementById(`${key}S${i}`);
        if (other && i !== step) other.classList.remove(s.fstepActive);
      }
    },
    [state.total, s.fstepActive],
  );

  const next = useCallback(
    (key: string) => {
      setState((prev) => {
        if (prev.current === prev.total - 1) {
          setTimeout(() => showStep(key, prev.total), 1200);
          return { ...prev, current: prev.total };
        }
        if (prev.current >= prev.total) return prev;
        const nextStep = prev.current + 1;
        setTimeout(() => showStep(key, nextStep), 0);
        return { ...prev, current: nextStep };
      });
    },
    [showStep],
  );

  const reset = useCallback(() => setState((prev) => ({ ...prev, current: 1 })), []);

  return { renderStepper, next, reset, current: state.current, total: state.total };
}

/* ============================================================
   MODAL CONTENT COMPONENTS
   ============================================================ */

/* M1: Global Status */
function GlobalStatusModal() {
  const [tab, setTab] = useState('all');
  const tabs = [
    { key: 'all', label: 'All Regions' },
    { key: 'ke', label: 'Kenya' },
    { key: 'ug', label: 'Uganda' },
    { key: 'tz', label: 'Tanzania' },
  ];
  const rows = [
    { r: 'Kenya (Primary)', st: 'Operational', up: '99.98%', inc: '2', time: '2 min ago' },
    { r: 'Uganda', st: 'Operational', up: '99.95%', inc: '1', time: '5 min ago' },
    { r: 'Tanzania', st: 'Degraded', up: '99.71%', inc: '3', time: '1 min ago' },
    { r: 'Rwanda', st: 'Operational', up: '99.99%', inc: '0', time: '8 min ago' },
    { r: 'Nigeria', st: 'Degraded', up: '99.68%', inc: '4', time: '3 min ago' },
    { r: 'Ghana', st: 'Operational', up: '99.92%', inc: '1', time: '12 min ago' },
  ];
  return (
    <>
      <PillTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead>
            <tr><th>Region</th><th>Status</th><th>Uptime</th><th>Active Incidents</th><th>Last Update</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.r}>
                <td><strong>{row.r}</strong></td>
                <td>
                  <span className={cx(s.badge, row.st === 'Operational' ? s.badgeS : s.badgeW)}>
                    <i className={`bi ${row.st === 'Operational' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`} />
                    {row.st}
                  </span>
                </td>
                <td>{row.up}</td>
                <td>{row.inc}</td>
                <td className={s.mutedSmall}>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tab !== 'all' && (
        <div className={s.ub} style={{ marginTop: 12 }}>
          <p className={s.inkSmall}>
            {tab === 'ke' && 'Kenya region is fully operational. 2 minor incidents under active monitoring.'}
            {tab === 'ug' && 'Uganda region operational. 1 settlement delay being investigated.'}
            {tab === 'tz' && 'Tanzania experiencing API latency issues. Engineering team engaged.'}
          </p>
        </div>
      )}
    </>
  );
}

/* M2: Incident Queue */
function IncidentQueueModal() {
  const incidents = [
    { id: 'INC-88219', title: 'Settlement batch delay', sev: 'High', started: '2h 14m ago', owner: 'James K.', status: 'Investigating' },
    { id: 'INC-88218', title: 'Stanbic API degradation', sev: 'Medium', started: '47m ago', owner: 'Auto', status: 'Monitoring' },
    { id: 'INC-88217', title: 'Fraud false positive spike', sev: 'Medium', started: '1h 02m ago', owner: 'Grace M.', status: 'In Progress' },
    { id: 'INC-88216', title: 'Nigeria settlement retry loop', sev: 'High', started: '3h 41m ago', owner: 'James K.', status: 'Investigating' },
    { id: 'INC-88215', title: 'Webhook delivery backlog', sev: 'Medium', started: '19m ago', owner: 'Auto', status: 'Monitoring' },
  ];
  return (
    <div className="table-responsive">
      <table className={s.tbl}>
        <thead>
          <tr><th>ID</th><th>Title</th><th>Severity</th><th>Started</th><th>Owner</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id}>
              <td><code>{inc.id}</code></td>
              <td>{inc.title}</td>
              <td><span className={cx(s.badge, inc.sev === 'High' ? s.badgeD : s.badgeW)}>{inc.sev}</span></td>
              <td className={s.mutedSmall}>{inc.started}</td>
              <td>{inc.owner}</td>
              <td><span className={cx(s.badge, inc.status === 'Investigating' || inc.status === 'In Progress' ? s.badgeW : s.badgeS)}>{inc.status}</span></td>
              <td><button type="button" className={`${s.btnPm} ${s.btnSm}`}>Manage</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* M3: Run Health Check */
function RunHealthCheckModal() {
  return (
    <>
      <div className="mb-3">
        <label className={s.fl}>Scope</label>
        <select className={s.fc}>
          <option>Full Platform Check</option>
          <option>Transaction Engine Only</option>
          <option>Settlement & Reconciliation</option>
          <option>API Gateway & Integrations</option>
          <option>Fraud & Security Systems</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={s.fl}>Include Deep Diagnostics</label>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Database query performance</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Queue depth analysis</label></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Full reconciliation test</label></div>
      </div>
    </>
  );
}

/* M4: Settlement Detail (multi-step) */
function SettlementDetailModal() {
  const flow = useFlow(4, ['Overview', 'Reconciliation', 'Resolution', 'Done']);
  useEffect(() => { flow.reset(); const t = setTimeout(() => flow.next('settle'), 0); return () => clearTimeout(t); }, []);
  return (
    <>
      <div className={s.stepper}>{flow.renderStepper()}</div>
      <div id="settleS1" className={cx(s.fstepActive)}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Batch Overview</h6>
        <div className="row g-3">
          <div className="col-md-4"><div className={s.summaryBoxWarn}><div className={s.miniStatLabel} style={{ color: '#92400E' }}>STATUS</div><div className={s.miniStatBig} style={{ color: '#fbbf24' }}>Delayed +2h 14m</div></div></div>
          <div className="col-md-4"><div className={s.summaryBox}><div className={s.miniStatLabel} style={{ color: 'var(--pm-muted)' }}>AMOUNT</div><div className={s.miniStatBig} style={{ color: '#fff' }}>KES 184,200,000</div></div></div>
          <div className="col-md-4"><div className={s.summaryBox}><div className={s.miniStatLabel} style={{ color: 'var(--pm-muted)' }}>TRANSACTIONS</div><div className={s.miniStatBig} style={{ color: '#fff' }}>8,421</div></div></div>
        </div>
        <div className="mt-3"><label className={s.fl}>Delay Reason</label><div className={s.summaryBoxDanger} style={{ fontSize: 13 }}>Upstream bank (Stanbic) experiencing connectivity issues. Manual intervention required.</div></div>
      </div>
      <div id="settleS2" className={s.fstepActive} style={{ display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Reconciliation Status</h6>
        <div className="table-responsive">
          <table className={s.tbl}>
            <thead><tr><th>Bank</th><th>Expected</th><th>Received</th><th>Matched</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Equity Bank</td><td>KES 92.1M</td><td>KES 92.1M</td><td>100%</td><td><span className={cx(s.badge, s.badgeS)}>Complete</span></td></tr>
              <tr><td>Stanbic Bank</td><td>KES 67.4M</td><td>KES 41.2M</td><td>61%</td><td><span className={cx(s.badge, s.badgeW)}>Partial</span></td></tr>
              <tr><td>KCB Bank</td><td>KES 24.7M</td><td>KES 24.7M</td><td>100%</td><td><span className={cx(s.badge, s.badgeS)}>Complete</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="settleS3" className={s.fstepActive} style={{ display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Resolution Actions</h6>
        <div className="mb-3"><label className={s.fl}>Action</label><select className={s.fc}><option>Request manual push from Stanbic</option><option>Split batch and settle partial</option><option>Hold batch until EOD</option><option>Escalate to partner relationship manager</option></select></div>
        <div className="mb-3"><label className={s.fl}>Notes for Partner</label><textarea className={s.fc} rows={3} defaultValue="Please investigate connectivity issues on your end. We have 26% of the batch still pending acknowledgment." /></div>
      </div>
      <div id="settleS4" className={s.fstepActive} style={{ display: 'none' }}>
        <div className={s.receipt}>
          <div className={s.ri}><i className="bi bi-check-lg" /></div>
          <h5 className={s.receiptTitle}>Resolution Logged</h5>
          <p className={s.receiptSub}>Manual push request sent to Stanbic. ETA updated to +4h. Ticket INC-88219 updated.</p>
        </div>
      </div>
    </>
  );
}

/* M5: Fraud Model Console */
function FraudModelModal() {
  const [tab, setTab] = useState('rules');
  const tabs = [{ key: 'rules', label: 'Active Rules' }, { key: 'perf', label: 'Performance' }, { key: 'tune', label: 'Tune Model' }];
  return (
    <>
      <PillTabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'rules' && (
        <div className="table-responsive">
          <table className={s.tbl}>
            <thead><tr><th>Rule</th><th>Threshold</th><th>Triggered (24h)</th><th>FP Rate</th><th>Enabled</th></tr></thead>
            <tbody>
              {[{ rule: 'Velocity (5 txns/5min)', th: '5', trig: '892', fp: '2.1%', on: true }, { rule: 'Geo Anomaly', th: '500km', trig: '421', fp: '4.8%', on: true }, { rule: 'Device Mismatch', th: '—', trig: '312', fp: '1.2%', on: true }, { rule: 'New Device + High Amount', th: 'KES 50K', trig: '189', fp: '3.4%', on: false }].map((r) => (
                <tr key={r.rule}><td>{r.rule}</td><td>{r.th}</td><td>{r.trig}</td><td>{r.fp}</td><td><input type="checkbox" defaultChecked={r.on} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'perf' && (
        <div className="row g-3">
          <div className="col-6"><div className={s.summaryBoxAccent}><div className={s.miniStatLabel} style={{ color: '#065F46' }}>PRECISION</div><div className={s.miniStatBig} style={{ color: 'var(--pm-accent)' }}>94.2%</div></div></div>
          <div className="col-6"><div className={s.summaryBoxInfo}><div className={s.miniStatLabel} style={{ color: '#1E40AF' }}>RECALL</div><div className={s.miniStatBig} style={{ color: 'var(--pm-info)' }}>88.7%</div></div></div>
        </div>
      )}
      {tab === 'tune' && (
        <>
          <div className="mb-3"><label className={s.fl}>Adjust Velocity Threshold</label><input className={s.fc} type="number" defaultValue={5} /><small className={s.mutedSmall}>Current FP rate 2.1%. Suggested: 6 (expected FP 1.4%)</small></div>
          <div className="mb-3"><label className={s.fl}>Geo Distance Threshold (km)</label><input className={s.fc} type="number" defaultValue={500} /><small className={s.mutedSmall}>Current FP rate 4.8%. Suggested: 750 (expected FP 2.9%)</small></div>
        </>
      )}
    </>
  );
}

/* M6: API Performance */
function ApiPerformanceModal() {
  const metrics = [
    { label: 'REQUESTS/MIN', value: '42,800', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)' },
    { label: 'P95 LATENCY', value: '187ms', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' },
    { label: 'ERROR RATE', value: '0.08%', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' },
    { label: 'ACTIVE NODES', value: '28', bg: 'var(--pm-purple-soft)', color: 'var(--pm-purple)' },
  ];
  return (
    <>
      <div className="row g-3">
        {metrics.map((m) => (
          <div className="col-md-3" key={m.label}>
            <div className={s.miniStat} style={{ background: m.bg, borderRadius: 10 }}>
              <div className={s.miniStatLabel} style={{ color: m.color }}>{m.label}</div>
              <div className={s.miniStatBig} style={{ color: m.color, fontSize: 24 }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="table-responsive mt-3">
        <table className={s.tbl}>
          <thead><tr><th>Endpoint</th><th>Requests</th><th>P95</th><th>Errors</th><th>Status</th></tr></thead>
          <tbody>
            {[{ ep: '/v1/transactions/initiate', req: '18,421', p95: '142ms', err: '0.04%', ok: true }, { ep: '/v1/settlements/batch', req: '4,892', p95: '890ms', err: '1.84%', ok: false }, { ep: '/v1/fraud/score', req: '12,310', p95: '310ms', err: '0.12%', ok: true }].map((row) => (
              <tr key={row.ep}><td><code>{row.ep}</code></td><td>{row.req}</td><td>{row.p95}</td><td>{row.err}</td><td><span className={cx(s.badge, row.ok ? s.badgeS : s.badgeW)}>{row.ok ? 'Healthy' : 'Degraded'}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* M7: Webhook Monitor */
function WebhookMonitorModal() {
  return (
    <div className="table-responsive">
      <table className={s.tbl}>
        <thead><tr><th>Partner</th><th>Endpoint</th><th>Delivered</th><th>Failed</th><th>Retry Queue</th><th>Actions</th></tr></thead>
        <tbody>
          {[{ partner: 'Equity Bank', ep: 'https://api.equity.co.ke/webhook', del: '84,291', fail: '12', retry: '3' }, { partner: 'KCB Bank', ep: 'https://webhook.kcbgroup.com/b2b', del: '42,891', fail: '89', retry: '41' }, { partner: 'Stanbic Bank', ep: 'https://api.stanbic.co.ug/callback', del: '18,421', fail: '211', retry: '178' }].map((row) => (
            <tr key={row.partner}><td><strong>{row.partner}</strong></td><td className={s.mutedSmall}>{row.ep}</td><td>{row.del}</td><td><span className={cx(s.badge, parseInt(row.fail) > 100 ? s.badgeD : s.badgeS)}>{row.fail}</span></td><td><span className={cx(s.badge, parseInt(row.retry) > 100 ? s.badgeW : s.badgeS)}>{row.retry}</span></td><td><button type="button" className={`${s.btnPm} ${s.btnSm}`}>Clear Retries</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* M8: Fraud Alert Queue */
function FraudAlertQueueModal() {
  return (
    <div className="table-responsive">
      <table className={s.tbl}>
        <thead><tr><th>Alert ID</th><th>Transaction</th><th>Risk Score</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {[{ id: 'FA-99142', txn: 'KE-UG-4428191', score: '94', reason: 'Velocity + New Device', status: 'Pending Review' }, { id: 'FA-99141', txn: 'KE-TZ-4428188', score: '72', reason: 'Geo Anomaly', status: 'Under Review' }, { id: 'FA-99140', txn: 'UG-KE-4428182', score: '68', reason: 'Amount Pattern', status: 'Approved' }].map((row) => (
            <tr key={row.id}><td><code>{row.id}</code></td><td>{row.txn}</td><td><span className={cx(s.badge, parseInt(row.score) > 80 ? s.badgeD : s.badgeW)}>{row.score}</span></td><td>{row.reason}</td><td><span className={cx(s.badge, row.status === 'Pending Review' ? s.badgeW : row.status === 'Approved' ? s.badgeS : s.badgeI)}>{row.status}</span></td><td><button type="button" className={`${s.btnPm} ${s.btnSm}`}>Review</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* M9: Fraud Review Modal */
function FraudReviewModal() {
  return (
    <>
      <div className={s.summaryBoxDanger}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>RISK SCORE: 94/100</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-danger)' }}>Velocity (5 txns in 4 min) + New Device + High Amount (KES 125,000)</div>
      </div>
      <div className="mb-3"><label className={s.fl}>Transaction Details</label><div className={s.summaryBox} style={{ fontSize: 13 }}><div>From: 0712***890 → To: UG-0772***112</div><div>Time: 27 Jun 2025 14:22 EAT</div><div>Device: iPhone 14 (new)</div><div>Location: Nairobi, KE → Kampala, UG (impossible travel)</div></div></div>
      <div className="mb-3"><label className={s.fl}>Decision</label><select className={s.fc}><option>Block Transaction</option><option>Allow with 3D Secure</option><option>Allow (False Positive)</option><option>Escalate to Manual Review</option></select></div>
      <div className="mb-3"><label className={s.fl}>Notes</label><textarea className={s.fc} rows={3} defaultValue="High velocity + impossible travel. Strong fraud signal. Recommend block." /></div>
    </>
  );
}

/* M10: Incident Detail (multi-step) */
function IncidentDetailModal() {
  const flow = useFlow(4, ['Summary', 'Timeline', 'Resolution', 'Done']);
  useEffect(() => { flow.reset(); const t = setTimeout(() => flow.next('inc'), 0); return () => clearTimeout(t); }, []);
  const timeline = [{ time: '14:22', event: 'Incident created' }, { time: '14:45', event: 'Assigned to James K.' }, { time: '15:10', event: 'Stanbic contacted' }, { time: '16:30', event: 'Partial settlement executed' }];
  return (
    <>
      <div className={s.stepper}>{flow.renderStepper()}</div>
      <div id="incS1" className={cx(s.fstepActive)}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Incident Summary</h6>
        <div className={s.summaryBoxDanger}><div style={{ fontSize: 13 }}>Settlement batch S-88219 delayed by 2h 14m due to upstream connectivity issues with Stanbic Bank.</div></div>
      </div>
      <div id="incS2" className={s.fstepActive} style={{ display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Timeline & Updates</h6>
        {timeline.map((item) => (<div className={s.sr} key={item.time}><div><strong>{item.time}</strong> — {item.event}</div></div>))}
      </div>
      <div id="incS3" className={s.fstepActive} style={{ display: 'none' }}>
        <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Resolution & Post-Mortem</h6>
        <div className="mb-3"><label className={s.fl}>Resolution</label><textarea className={s.fc} rows={3} defaultValue="Stanbic confirmed DNS issue on their end. Manual push completed at 16:30. Full batch settled by 17:45." /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Schedule post-mortem meeting</label></div>
      </div>
      <div id="incS4" className={s.fstepActive} style={{ display: 'none' }}>
        <div className={s.receipt}>
          <div className={s.ri}><i className="bi bi-check-lg" /></div>
          <h5 className={s.receiptTitle}>Incident Closed</h5>
          <p className={s.receiptSub}>INC-88219 marked as resolved. Post-mortem scheduled for 30 Jun 2025.</p>
        </div>
      </div>
    </>
  );
}

/* M11: Create Incident */
function CreateIncidentModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Title</label><input className={s.fc} defaultValue="New incident title" /></div>
      <div className="row g-3">
        <div className="col-md-6"><label className={s.fl}>Severity</label><select className={s.fc}><option>High</option><option>Medium</option><option>Low</option></select></div>
        <div className="col-md-6"><label className={s.fl}>Component</label><select className={s.fc}><option>Settlement Engine</option><option>API Gateway</option><option>Fraud Detection</option><option>Database</option></select></div>
      </div>
      <div className="mb-3 mt-3"><label className={s.fl}>Description</label><textarea className={s.fc} rows={4} defaultValue="Describe the incident..." /></div>
    </>
  );
}

/* M12: Partner API Detail */
function PartnerApiDetailModal() {
  const [tab, setTab] = useState('health');
  const tabs = [{ key: 'health', label: 'Health' }, { key: 'logs', label: 'Logs' }, { key: 'config', label: 'Config' }];
  return (
    <>
      <PillTabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'health' && (
        <div className="row g-3">
          <div className="col-6"><div className={s.summaryBoxWarn}><div className={s.miniStatLabel} style={{ color: '#92400E' }}>STATUS</div><div className={s.miniStatBig} style={{ color: '#fbbf24' }}>Degraded</div></div></div>
          <div className="col-6"><div className={s.summaryBox}><div className={s.miniStatLabel} style={{ color: 'var(--pm-muted)' }}>LATENCY</div><div className={s.miniStatBig} style={{ color: '#fff' }}>420ms</div></div></div>
        </div>
      )}
      {tab === 'logs' && (
        <div className="table-responsive">
          <table className={s.tbl}>
            <thead><tr><th>Time</th><th>Event</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>16:42</td><td>Timeout on /settle</td><td><span className={s.badgeD}>504</span></td></tr>
              <tr><td>16:41</td><td>Success on /balance</td><td><span className={s.badgeS}>200</span></td></tr>
            </tbody>
          </table>
        </div>
      )}
      {tab === 'config' && (
        <>
          <div className="mb-3"><label className={s.fl}>Base URL</label><input className={s.fc} defaultValue="https://api.stanbic.co.ug/b2b" /></div>
          <div className="mb-3"><label className={s.fl}>Timeout (ms)</label><input className={s.fc} type="number" defaultValue={5000} /></div>
          <div className="mb-3"><label className={s.fl}>Retry Attempts</label><input className={s.fc} type="number" defaultValue={3} /></div>
        </>
      )}
    </>
  );
}

/* M13: Infrastructure Detail */
function InfraDetailModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Component</label><select className={s.fc}><option>Transaction DB Primary</option><option>API Gateway Cluster</option><option>Redis Cache</option></select></div>
      <div className="row g-3">
        {[{ label: 'CPU', value: '42%', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)' }, { label: 'MEMORY', value: '68%', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }, { label: 'DISK', value: '54%', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' }].map((m) => (
          <div className="col-4" key={m.label}>
            <div className={s.miniStat} style={{ background: m.bg, borderRadius: 10 }}>
              <div className={s.miniStatLabel} style={{ color: m.color }}>{m.label}</div>
              <div className={s.miniStatBig} style={{ color: m.color, fontSize: 24 }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3"><label className={s.fl}>Recent Alerts</label><div className={s.summaryBox} style={{ fontSize: 13 }}>No critical alerts in the last 24 hours.</div></div>
    </>
  );
}

/* M14: Infra Scaling */
function InfraScalingModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Component</label><select className={s.fc}><option>API Gateway Cluster</option><option>Worker Nodes</option><option>DB Read Replicas</option></select></div>
      <div className="mb-3"><label className={s.fl}>Min Nodes</label><input className={s.fc} type="number" defaultValue={12} /></div>
      <div className="mb-3"><label className={s.fl}>Max Nodes</label><input className={s.fc} type="number" defaultValue={48} /></div>
      <div className="mb-3"><label className={s.fl}>Scale Up Threshold</label><input className={s.fc} defaultValue="70% CPU for 5 min" /></div>
      <div className="mb-3"><label className={s.fl}>Scale Down Threshold</label><input className={s.fc} defaultValue="30% CPU for 15 min" /></div>
    </>
  );
}

/* M15: Capacity Planning */
function CapacityPlanningModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Forecast Period</label><select className={s.fc}><option>Next 30 days</option><option>Next 90 days</option><option>Next 12 months</option></select></div>
      <div className={s.summaryBoxInfo}>
        <div className="d-flex justify-content-between mb-2"><span>Projected Peak Load</span><strong>2.8x current</strong></div>
        <div className="d-flex justify-content-between mb-2"><span>Required Nodes (API)</span><strong>78 (current 28)</strong></div>
        <div className="d-flex justify-content-between"><span>Budget Impact</span><strong>+KES 4.2M/month</strong></div>
      </div>
    </>
  );
}

/* M16: Ticket Detail */
function TicketDetailModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Status</label><select className={s.fc}><option>In Progress</option><option>Waiting Partner</option><option>Resolved</option><option>Escalated</option></select></div>
      <div className="mb-3"><label className={s.fl}>Assignee</label><select className={s.fc}><option>James K.</option><option>Grace M.</option><option>Michael N.</option></select></div>
      <div className="mb-3"><label className={s.fl}>Internal Notes</label><textarea className={s.fc} rows={4} defaultValue="Partner has been contacted. Awaiting response on their API endpoint change." /></div>
      <div className="mb-3"><label className={s.fl}>SLA Remaining</label><div className={s.summaryBoxWarn} style={{ fontSize: 13 }}>2 hours remaining. Escalate if not resolved.</div></div>
    </>
  );
}

/* M17: Escalation */
function EscalationModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Ticket</label><select className={s.fc}><option>OP-44291 — Partner Integration</option><option>OP-44288 — Settlement Dispute</option></select></div>
      <div className="mb-3"><label className={s.fl}>Escalate To</label><select className={s.fc}><option>Head of Operations</option><option>CTO</option><option>Partner Relationship Manager</option></select></div>
      <div className="mb-3"><label className={s.fl}>Reason</label><textarea className={s.fc} rows={3} defaultValue="Partner not responding within SLA. Business impact increasing." /></div>
    </>
  );
}

/* M18: Audit Log */
function AuditLogModal() {
  const logs = [
    { time: '14:42', actor: 'James K.', action: 'Incident Updated', details: 'INC-88219 status changed to Investigating', ip: '102.68.XX.XX' },
    { time: '14:38', actor: 'System', action: 'Health Check', details: 'Full platform check completed — 99.97% healthy', ip: '—' },
    { time: '14:22', actor: 'Grace M.', action: 'Fraud Rule Tuned', details: 'Velocity threshold changed from 5 to 6', ip: '102.68.XX.XX' },
  ];
  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <input className={s.fc} placeholder="Search logs..." style={{ maxWidth: 300 }} />
        <select className={s.fc} style={{ width: 'auto' }}><option>Last 24 hours</option><option>Last 7 days</option></select>
      </div>
      <div className="table-responsive">
        <table className={s.tbl}>
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Details</th><th>IP</th></tr></thead>
          <tbody>
            {logs.map((log) => (<tr key={log.time + log.action}><td>{log.time}</td><td>{log.actor}</td><td>{log.action}</td><td>{log.details}</td><td><code>{log.ip}</code></td></tr>))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* M19: Live Transaction Feed */
function LiveTransactionFeedModal() {
  const txns = [
    { time: '14:42:18', id: 'KE-UG-4429218', corridor: 'Kenya → Uganda', amount: 'KES 12,500', status: 'Success' },
    { time: '14:42:17', id: 'KE-TZ-4429217', corridor: 'Kenya → Tanzania', amount: 'KES 45,000', status: 'Success' },
    { time: '14:42:15', id: 'UG-KE-4429216', corridor: 'Uganda → Kenya', amount: 'KES 8,200', status: 'Failed' },
    { time: '14:42:12', id: 'TZ-KE-4429215', corridor: 'Tanzania → Kenya', amount: 'KES 23,100', status: 'Success' },
    { time: '14:42:09', id: 'NG-GH-4429214', corridor: 'Nigeria → Ghana', amount: 'KES 67,800', status: 'Pending' },
  ];
  return (
    <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
      <table className={s.tbl}>
        <thead><tr><th>Time</th><th>ID</th><th>Corridor</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {txns.map((txn) => (
            <tr key={txn.id}>
              <td className={s.mutedSmall}>{txn.time}</td>
              <td><code>{txn.id}</code></td>
              <td>{txn.corridor}</td>
              <td>{txn.amount}</td>
              <td><span className={cx(s.badge, txn.status === 'Success' ? s.badgeS : txn.status === 'Failed' ? s.badgeD : s.badgeW)}>{txn.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* M20: Failure Analysis */
function FailureAnalysisModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Time Range</label><select className={s.fc}><option>Last 60 minutes</option><option>Last 24 hours</option><option>Last 7 days</option></select></div>
      <div className={s.summaryBoxDanger}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B' }}>Top Failure Reasons</div>
        <div className="mt-2" style={{ fontSize: 13 }}>
          1. Insufficient Funds (42%)<br />
          2. Invalid Account Number (18%)<br />
          3. Network Timeout (14%)<br />
          4. Fraud Block (9%)<br />
          5. Daily Limit Exceeded (7%)
        </div>
      </div>
    </>
  );
}

/* M21: Corridor Detail */
function CorridorDetailModal() {
  return (
    <>
      <div className="row g-3">
        <div className="col-6"><div className={s.summaryBoxAccent}><div className={s.miniStatLabel} style={{ color: '#065F46' }}>SUCCESS RATE</div><div className={s.miniStatBig} style={{ color: 'var(--pm-accent)' }}>99.7%</div></div></div>
        <div className="col-6"><div className={s.summaryBoxInfo}><div className={s.miniStatLabel} style={{ color: '#1E40AF' }}>AVG TIME</div><div className={s.miniStatBig} style={{ color: 'var(--pm-info)' }}>1.8s</div></div></div>
      </div>
      <div className="mt-3"><label className={s.fl}>Top Failure Reasons</label><div className={s.summaryBox} style={{ fontSize: 13 }}>• Invalid beneficiary account (62%)<br />• Daily limit exceeded (21%)<br />• Network timeout (17%)</div></div>
    </>
  );
}

/* M22: Reconciliation */
function ReconciliationModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Scope</label><select className={s.fc}><option>Full Platform (All Corridors)</option><option>Kenya Only</option><option>Uganda Only</option><option>Tanzania Only</option></select></div>
      <div className="mb-3"><label className={s.fl}>Date Range</label><input type="date" className={s.fc} defaultValue="2025-06-27" /></div>
      <div className={s.summaryBoxInfo} style={{ fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Reconciliation typically takes 8–15 minutes depending on volume.</div>
    </>
  );
}

/* M23: Profile */
function ProfileModal() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className={s.avatar} style={{ width: 64, height: 64, fontSize: 24, margin: '0 auto 12px' }}>MN</div>
      <h5 style={{ fontWeight: 700, margin: '0 0 4px' }}>Michael Njoroge</h5>
      <p style={{ fontSize: 13, color: 'var(--pm-muted)', margin: 0 }}>michael.n@paymo.co.ke · +254 700 123 456</p>
      <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
        <div className="col-6"><div className={s.summaryBox}><span className={s.mutedSmall}>Role</span><br /><strong>Head of Operations</strong></div></div>
        <div className="col-6"><div className={s.summaryBox}><span className={s.mutedSmall}>On-call</span><br /><strong>Active</strong></div></div>
      </div>
    </div>
  );
}

/* M24: SLA Report */
function SlaReportModal() {
  return (
    <>
      <div className="row g-3">
        <div className="col-6"><div className={s.summaryBoxAccent}><div className={s.miniStatLabel} style={{ color: '#065F46' }}>UPTIME SLA</div><div className={s.miniStatBig} style={{ color: 'var(--pm-accent)' }}>99.97%</div><div style={{ fontSize: 12, color: '#065F46' }}>Target: 99.9%</div></div></div>
        <div className="col-6"><div className={s.summaryBoxInfo}><div className={s.miniStatLabel} style={{ color: '#1E40AF' }}>INCIDENT RESPONSE</div><div className={s.miniStatBig} style={{ color: 'var(--pm-info)' }}>4.2 min</div><div style={{ fontSize: 12, color: '#1E40AF' }}>Target: &lt;15 min</div></div></div>
      </div>
    </>
  );
}

/* M25: Uptime History */
function UptimeHistoryModal() {
  const rows = [
    { date: '27 Jun 2025', up: '99.98%', inc: '2', mttr: '12m' },
    { date: '26 Jun 2025', up: '100%', inc: '0', mttr: '—' },
    { date: '25 Jun 2025', up: '99.71%', inc: '1', mttr: '2h 14m' },
    { date: '24 Jun 2025', up: '99.95%', inc: '1', mttr: '8m' },
    { date: '23 Jun 2025', up: '100%', inc: '0', mttr: '—' },
  ];
  return (
    <div className="table-responsive">
      <table className={s.tbl}>
        <thead><tr><th>Date</th><th>Uptime</th><th>Incidents</th><th>MTTR</th></tr></thead>
        <tbody>
          {rows.map((row) => (<tr key={row.date}><td>{row.date}</td><td>{row.up}</td><td>{row.inc}</td><td>{row.mttr}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}

/* M26: Ops Notifications */
function OpsNotifModal() {
  return (
    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)', fontSize: 13 }}>
        <strong>Settlement batch S-88219 delayed</strong>
        <div style={{ fontSize: 11, color: '#7F1D1D' }}>2h 14m behind SLA</div>
      </div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)', fontSize: 13 }}>
        <strong>API Gateway P99 latency breach</strong>
        <div style={{ fontSize: 11, color: '#92400E' }}>420ms (SLA 300ms)</div>
      </div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
        <strong>Health check completed</strong>
        <div style={{ fontSize: 11, color: '#1E40AF' }}>99.97% healthy</div>
      </div>
      <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}>
        <strong>New reconciliation job finished</strong>
        <div style={{ fontSize: 11, color: '#065F46' }}>1,241,892 matched, 4,812 unmatched</div>
      </div>
    </div>
  );
}

/* M27: Service Detail */
function ServiceDetailModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Service</label><select className={s.fc}><option>Transaction Engine</option><option>Settlement Engine</option><option>API Gateway</option></select></div>
      <div className={s.summaryBox}>
        <div className="d-flex justify-content-between mb-2"><span className={s.mutedSmall}>Status</span><span className={cx(s.badge, s.badgeS)}>Healthy</span></div>
        <div className="d-flex justify-content-between mb-2"><span className={s.mutedSmall}>Uptime</span><strong>99.98%</strong></div>
        <div className="d-flex justify-content-between"><span className={s.mutedSmall}>Last Incident</span><strong>12 Jun 2025</strong></div>
      </div>
    </>
  );
}

/* M28: Corridor Performance */
function CorridorPerformanceModal() {
  return (
    <>
      <div className="row g-3">
        {[{ label: 'Kenya → Uganda', count: '8,421', success: '99.7%', time: '1.8s' }, { label: 'Kenya → Tanzania', count: '6,112', success: '99.2%', time: '2.4s' }, { label: 'Uganda → Kenya', count: '5,890', success: '99.5%', time: '1.6s' }].map((row) => (
          <div className="col-md-4" key={row.label}>
            <div className={s.summaryBox} style={{ textAlign: 'center' }}>
              <div className={s.miniStatLabel} style={{ color: 'var(--pm-muted)' }}>{row.label}</div>
              <div className={s.miniStatBig} style={{ color: '#fff', fontSize: 20 }}>{row.count}</div>
              <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Success: {row.success} · Avg: {row.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* M29: Case Export */
function CaseExportModal() {
  return (
    <>
      <div className="mb-3"><label className={s.fl}>Format</label><select className={s.fc}><option>CSV</option><option>JSON</option><option>PDF</option></select></div>
      <div className="mb-3"><label className={s.fl}>Date Range</label><input type="date" className={s.fc} defaultValue="2025-06-01" /></div>
    </>
  );
}

/* M30: Notif Settings */
function NotifSettingsModal() {
  return (
    <>
      <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Email on critical incidents</label></div>
      <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">SMS on high severity</label></div>
      <div className="form-check mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Daily summary report</label></div>
      <div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Webhook failure alerts</label></div>
      <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Settlement delay notifications</label></div>
    </>
  );
}

/* ============================================================
   MAIN EXPORT — OpsSystemModals
   ============================================================ */
export interface OpsModalsState {
  globalStatus: boolean;
  incidentQueue: boolean;
  runHealthCheck: boolean;
  settlementDetail: boolean;
  fraudModel: boolean;
  apiPerformance: boolean;
  webhookMonitor: boolean;
  fraudAlertQueue: boolean;
  fraudReview: boolean;
  incidentDetail: boolean;
  createIncident: boolean;
  partnerApiDetail: boolean;
  infraDetail: boolean;
  infraScaling: boolean;
  capacityPlanning: boolean;
  ticketDetail: boolean;
  escalation: boolean;
  auditLog: boolean;
  liveTransactionFeed: boolean;
  failureAnalysis: boolean;
  corridorDetail: boolean;
  reconciliation: boolean;
  profile: boolean;
  slaReport: boolean;
  uptimeHistory: boolean;
  opsNotif: boolean;
  serviceDetail: boolean;
  corridorPerformance: boolean;
  caseExport: boolean;
  notifSettings: boolean;
}

export const initialModalsState: OpsModalsState = {
  globalStatus: false, incidentQueue: false, runHealthCheck: false, settlementDetail: false,
  fraudModel: false, apiPerformance: false, webhookMonitor: false, fraudAlertQueue: false,
  fraudReview: false, incidentDetail: false, createIncident: false, partnerApiDetail: false,
  infraDetail: false, infraScaling: false, capacityPlanning: false, ticketDetail: false,
  escalation: false, auditLog: false, liveTransactionFeed: false, failureAnalysis: false,
  corridorDetail: false, reconciliation: false, profile: false, slaReport: false,
  uptimeHistory: false, opsNotif: false, serviceDetail: false, corridorPerformance: false,
  caseExport: false, notifSettings: false,
};

export type ModalKey = keyof OpsModalsState;

interface OpsSystemModalsProps {
  state: OpsModalsState;
  onClose: (key: ModalKey) => void;
}

export default function OpsSystemModals({ state, onClose }: OpsSystemModalsProps) {
  return (
    <>
      <Modal open={state.globalStatus} onClose={() => onClose('globalStatus')} size="xl" title="Global Platform Status" icon="bi-globe">
        <GlobalStatusModal />
      </Modal>

      <Modal open={state.incidentQueue} onClose={() => onClose('incidentQueue')} size="xl" title="Active Incident Queue (7)" icon="bi-exclamation-triangle">
        <IncidentQueueModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('incidentQueue')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmD)} onClick={() => onClose('incidentQueue')}>Create New Incident</button>
        </div>
      </Modal>

      <Modal open={state.runHealthCheck} onClose={() => onClose('runHealthCheck')} title="Run System Health Check" icon="bi-play-circle">
        <RunHealthCheckModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('runHealthCheck')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('runHealthCheck')}>Start Health Check</button>
        </div>
      </Modal>

      <Modal open={state.settlementDetail} onClose={() => onClose('settlementDetail')} size="xl" title="Settlement Batch Detail — S-88219" icon="bi-bank2">
        <SettlementDetailModal />
      </Modal>

      <Modal open={state.fraudModel} onClose={() => onClose('fraudModel')} size="lg" title="Fraud Detection Model Console" icon="bi-shield-exclamation">
        <FraudModelModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('fraudModel')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('fraudModel')}>Apply Changes</button>
        </div>
      </Modal>

      <Modal open={state.apiPerformance} onClose={() => onClose('apiPerformance')} size="xl" title="API Gateway Performance" icon="bi-speedometer2">
        <ApiPerformanceModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('apiPerformance')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('apiPerformance')}>Scale Gateway</button>
        </div>
      </Modal>

      <Modal open={state.webhookMonitor} onClose={() => onClose('webhookMonitor')} size="lg" title="Webhook Delivery Monitor" icon="bi-link-45deg">
        <WebhookMonitorModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('webhookMonitor')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('webhookMonitor')}>Re-queue All</button>
        </div>
      </Modal>

      <Modal open={state.fraudAlertQueue} onClose={() => onClose('fraudAlertQueue')} size="xl" title="Fraud Alert Queue (312)" icon="bi-shield-exclamation">
        <FraudAlertQueueModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('fraudAlertQueue')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('fraudAlertQueue')}>Bulk Approve Low Risk</button>
        </div>
      </Modal>

      <Modal open={state.fraudReview} onClose={() => onClose('fraudReview')} title="Fraud Case Review — FA-99142" icon="bi-search">
        <FraudReviewModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('fraudReview')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmD)} onClick={() => onClose('fraudReview')}>Block Transaction</button>
        </div>
      </Modal>

      <Modal open={state.incidentDetail} onClose={() => onClose('incidentDetail')} size="lg" title="Incident Management — INC-88219" icon="bi-exclamation-triangle">
        <IncidentDetailModal />
      </Modal>

      <Modal open={state.createIncident} onClose={() => onClose('createIncident')} title="Create New Incident" icon="bi-plus-circle">
        <CreateIncidentModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('createIncident')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmD)} onClick={() => onClose('createIncident')}>Create Incident</button>
        </div>
      </Modal>

      <Modal open={state.partnerApiDetail} onClose={() => onClose('partnerApiDetail')} size="lg" title="Partner API Detail — Stanbic Bank" icon="bi-plug">
        <PartnerApiDetailModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('partnerApiDetail')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('partnerApiDetail')}>Save Config</button>
        </div>
      </Modal>

      <Modal open={state.infraDetail} onClose={() => onClose('infraDetail')} size="lg" title="Infrastructure Component Detail" icon="bi-server">
        <InfraDetailModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('infraDetail')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('infraDetail')}>Scale Component</button>
        </div>
      </Modal>

      <Modal open={state.infraScaling} onClose={() => onClose('infraScaling')} title="Auto-Scaling Configuration" icon="bi-server">
        <InfraScalingModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('infraScaling')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('infraScaling')}>Save Policy</button>
        </div>
      </Modal>

      <Modal open={state.capacityPlanning} onClose={() => onClose('capacityPlanning')} size="lg" title="Capacity Planning" icon="bi-graph-up-arrow">
        <CapacityPlanningModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('capacityPlanning')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('capacityPlanning')}>Approve Plan</button>
        </div>
      </Modal>

      <Modal open={state.ticketDetail} onClose={() => onClose('ticketDetail')} size="lg" title="Support Ticket — OP-44291" icon="bi-headset">
        <TicketDetailModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('ticketDetail')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('ticketDetail')}>Save & Notify</button>
        </div>
      </Modal>

      <Modal open={state.escalation} onClose={() => onClose('escalation')} title="Escalate Ticket" icon="bi-arrow-up-circle">
        <EscalationModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('escalation')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmD)} onClick={() => onClose('escalation')}>Escalate</button>
        </div>
      </Modal>

      <Modal open={state.auditLog} onClose={() => onClose('auditLog')} size="xl" title="System Audit Log" icon="bi-file-earmark-text">
        <AuditLogModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('auditLog')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('auditLog')}>Export Logs</button>
        </div>
      </Modal>

      <Modal open={state.liveTransactionFeed} onClose={() => onClose('liveTransactionFeed')} size="xl" title="Live Transaction Feed" icon="bi-activity">
        <LiveTransactionFeedModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('liveTransactionFeed')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.failureAnalysis} onClose={() => onClose('failureAnalysis')} size="lg" title="Failure Analysis" icon="bi-x-circle">
        <FailureAnalysisModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('failureAnalysis')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('failureAnalysis')}>Investigate Fraud Blocks</button>
        </div>
      </Modal>

      <Modal open={state.corridorDetail} onClose={() => onClose('corridorDetail')} size="lg" title="Corridor Performance — Kenya → Uganda" icon="bi-globe">
        <CorridorDetailModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('corridorDetail')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.reconciliation} onClose={() => onClose('reconciliation')} title="Run Reconciliation" icon="bi-check2-circle">
        <ReconciliationModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('reconciliation')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('reconciliation')}>Start Reconciliation</button>
        </div>
      </Modal>

      <Modal open={state.profile} onClose={() => onClose('profile')} title="Profile" icon="bi-person-circle">
        <ProfileModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('profile')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.slaReport} onClose={() => onClose('slaReport')} size="lg" title="SLA Performance Report" icon="bi-file-earmark-text">
        <SlaReportModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('slaReport')}>Close</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('slaReport')}>Export Report</button>
        </div>
      </Modal>

      <Modal open={state.uptimeHistory} onClose={() => onClose('uptimeHistory')} size="lg" title="Uptime History (30 Days)" icon="bi-clock-history">
        <UptimeHistoryModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('uptimeHistory')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.opsNotif} onClose={() => onClose('opsNotif')} title="Operations Notifications (14)" icon="bi-bell">
        <OpsNotifModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('opsNotif')}>Settings</button>
          <button type="button" className={s.btnPm} onClick={() => onClose('opsNotif')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.serviceDetail} onClose={() => onClose('serviceDetail')} title="Service Detail" icon="bi-info-circle">
        <ServiceDetailModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('serviceDetail')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.corridorPerformance} onClose={() => onClose('corridorPerformance')} title="Corridor Performance" icon="bi-globe">
        <CorridorPerformanceModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('corridorPerformance')}>Close</button>
        </div>
      </Modal>

      <Modal open={state.caseExport} onClose={() => onClose('caseExport')} title="Export Audit Logs" icon="bi-download">
        <CaseExportModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('caseExport')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('caseExport')}>Export</button>
        </div>
      </Modal>

      <Modal open={state.notifSettings} onClose={() => onClose('notifSettings')} title="Notification Preferences" icon="bi-gear">
        <NotifSettingsModal />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className={s.btnPm} onClick={() => onClose('notifSettings')}>Cancel</button>
          <button type="button" className={cx(s.btnPm, s.btnPmP)} onClick={() => onClose('notifSettings')}>Save</button>
        </div>
      </Modal>
    </>
  );
}
