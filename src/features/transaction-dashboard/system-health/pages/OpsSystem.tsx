/* ============================================================================
 * OpsSystem.tsx — System Health & Operations (Page 1.17)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.17.html — the B2B operations command center.
 *   This page owns platform uptime monitoring, transaction health, API
 *   performance, settlement reconciliation, fraud detection, infrastructure
 *   scaling, and support ticket queues — all in real time.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query
 * ARCHITECTURE .: Child of routes/app.tsx, renders INSIDE the app shell.
 * ========================================================================== */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from '../styles/systemHealth.module.css';
import { cx } from '../../../shell/data/shellData';
import OpsSystemModals, { initialModalsState, type ModalKey } from '../components/OpsSystemModals';

const s = styles as Record<string, string>;

/* ============================================================
   MOCK DATA — extracted from the legacy HTML template
   ============================================================ */
interface ServiceHealth {
  name: string;
  status: 'Healthy' | 'Degraded';
  uptime: string;
  latency: string;
  errorRate: string;
  lastIncident: string;
}

interface Corridor {
  name: string;
  count: string;
  success: string;
  avgTime: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'High' | 'Medium';
  started: string;
  owner: string;
  status: string;
}

interface FraudRule {
  name: string;
  triggered: number;
  blocked: number;
  fpRate: string;
}

interface InfraComponent {
  name: string;
  cpu: string;
  memory: string;
  disk: string;
  status: string;
}

interface Ticket {
  id: string;
  type: string;
  priority: string;
  assignee: string;
  sla: string;
  status: string;
}

interface OpsData {
  platformUptime: string;
  platformStatus: string;
  incidents30d: number;
  criticalOutages: number;
  txnSuccess: string;
  txnCount: string;
  txnFailed: string;
  txnFailedPct: string;
  apiP95: string;
  apiLoad: string;
  apiPeak: string;
  openIncidents: number;
  highPriority: number;
  settlementDelay: number;
  fraudSpike: number;
  apiDegradation: number;
  services: ServiceHealth[];
  regions: { name: string; status: string }[];
  corridors: Corridor[];
  failureReasons: { reason: string; count: number; pct: number }[];
  partnerApis: { name: string; status: string; latency: string; success: string }[];
  webhookDelivered: number;
  webhookFailed: number;
  webhookRetry: number;
  fraudAlerts: number;
  blockedTxns: number;
  fraudRules: FraudRule[];
  manualReviewHigh: number;
  manualReviewMedium: number;
  manualReviewLow: number;
  infra: InfraComponent[];
  scalingEvents: { component: string; count: string }[];
  tickets: Ticket[];
  reconciliationMatched: number;
  reconciliationUnmatched: number;
  reconciliationDisputed: number;
}

const initialMockData: OpsData = {
  platformUptime: '99.97%',
  platformStatus: 'All systems operational',
  incidents30d: 4,
  criticalOutages: 0,
  txnSuccess: '99.4%',
  txnCount: '1.24M',
  txnFailed: '7,412',
  txnFailedPct: '0.6%',
  apiP95: '187ms',
  apiLoad: '42,800 req/min',
  apiPeak: '68,200 req/min',
  openIncidents: 7,
  highPriority: 2,
  settlementDelay: 2,
  fraudSpike: 1,
  apiDegradation: 4,
  services: [
    { name: 'Transaction Engine', status: 'Healthy', uptime: '99.98%', latency: '142ms', errorRate: '0.12%', lastIncident: '12 Jun 2025' },
    { name: 'Settlement Engine', status: 'Degraded', uptime: '99.71%', latency: '890ms', errorRate: '1.84%', lastIncident: '27 Jun 2025' },
    { name: 'API Gateway', status: 'Healthy', uptime: '99.99%', latency: '187ms', errorRate: '0.08%', lastIncident: '19 Jun 2025' },
    { name: 'Fraud Detection', status: 'Degraded', uptime: '99.82%', latency: '310ms', errorRate: '4.2% FP', lastIncident: '27 Jun 2025' },
    { name: 'Reconciliation Service', status: 'Healthy', uptime: '99.95%', latency: '420ms', errorRate: '0.31%', lastIncident: '25 Jun 2025' },
    { name: 'Notification Service', status: 'Healthy', uptime: '99.97%', latency: '89ms', errorRate: '0.05%', lastIncident: '20 Jun 2025' },
  ],
  regions: [
    { name: 'Kenya (Primary)', status: 'All Green' },
    { name: 'Uganda', status: 'All Green' },
    { name: 'Tanzania', status: 'API Degraded' },
    { name: 'Rwanda', status: 'All Green' },
    { name: 'Nigeria', status: 'Settlement Delayed' },
    { name: 'Ghana', status: 'All Green' },
  ],
  corridors: [
    { name: 'Kenya → Uganda', count: '8,421', success: '99.7%', avgTime: '1.8s' },
    { name: 'Kenya → Tanzania', count: '6,112', success: '99.2%', avgTime: '2.4s' },
    { name: 'Uganda → Kenya', count: '5,890', success: '99.5%', avgTime: '1.6s' },
    { name: 'Nigeria → Ghana', count: '3,421', success: '98.1%', avgTime: '4.2s' },
  ],
  failureReasons: [
    { reason: 'Insufficient Funds', count: 2841, pct: 42 },
    { reason: 'Invalid Account', count: 1102, pct: 18 },
    { reason: 'Network Timeout', count: 892, pct: 14 },
    { reason: 'Fraud Block', count: 421, pct: 9 },
    { reason: 'Daily Limit Exceeded', count: 312, pct: 7 },
    { reason: 'Other', count: 844, pct: 10 },
  ],
  partnerApis: [
    { name: 'Equity Bank', status: 'Healthy', latency: '98ms', success: '99.9%' },
    { name: 'KCB Bank', status: 'Healthy', latency: '112ms', success: '99.8%' },
    { name: 'Stanbic Bank', status: 'Degraded', latency: '420ms', success: '97.1%' },
    { name: 'Co-op Bank', status: 'Healthy', latency: '76ms', success: '99.9%' },
  ],
  webhookDelivered: 184291,
  webhookFailed: 312,
  webhookRetry: 1842,
  fraudAlerts: 1842,
  blockedTxns: 421,
  fraudRules: [
    { name: 'Velocity Check', triggered: 892, blocked: 312, fpRate: '2.1%' },
    { name: 'Geo Anomaly', triggered: 421, blocked: 89, fpRate: '4.8%' },
    { name: 'Device Mismatch', triggered: 312, blocked: 18, fpRate: '1.2%' },
  ],
  manualReviewHigh: 87,
  manualReviewMedium: 214,
  manualReviewLow: 312,
  infra: [
    { name: 'Transaction DB Primary', cpu: '42%', memory: '68%', disk: '54%', status: 'Healthy' },
    { name: 'API Gateway Cluster', cpu: '71%', memory: '82%', disk: '39%', status: 'Warning' },
    { name: 'Redis Cache', cpu: '18%', memory: '44%', disk: '12%', status: 'Healthy' },
    { name: 'Kafka Brokers', cpu: '55%', memory: '61%', disk: '47%', status: 'Healthy' },
  ],
  scalingEvents: [
    { component: 'API Gateway', count: '+12 nodes' },
    { component: 'Worker Nodes', count: '+8 nodes' },
    { component: 'DB Read Replicas', count: '+3 replicas' },
  ],
  tickets: [
    { id: 'OP-44291', type: 'Partner Integration', priority: 'High', assignee: 'James K.', sla: '2h remaining', status: 'In Progress' },
    { id: 'OP-44288', type: 'Settlement Dispute', priority: 'Medium', assignee: 'Grace M.', sla: '18h remaining', status: 'Waiting Partner' },
    { id: 'OP-44285', type: 'API Key Request', priority: 'Low', assignee: 'Auto', sla: '48h remaining', status: 'Resolved' },
  ],
  reconciliationMatched: 1241892,
  reconciliationUnmatched: 4812,
  reconciliationDisputed: 187,
};

async function fetchOpsData(): Promise<OpsData> {
  const response = await fetch('/api/ops-system');
  if (!response.ok) throw new Error('Failed to fetch operations data');
  return response.json();
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function OpsSystem() {
  const [modals, setModals] = useState(initialModalsState);

  const openModal = useCallback((key: ModalKey) => {
    setModals((prev: typeof initialModalsState) => ({ ...prev, [key]: true }));
  }, []);

  const closeModal = useCallback((key: ModalKey) => {
    setModals((prev: typeof initialModalsState) => ({ ...prev, [key]: false }));
  }, []);

  const { data, isLoading, error } = useQuery<OpsData>({
    queryKey: ['paymo-ops-system'],
    queryFn: fetchOpsData,
    staleTime: 30_000,
    retry: 1,
    initialData: initialMockData,
  });

  if (!data) return null;

  return (
    <div className={s.systemHealthPage}>
      {/* ===== Loading Overlay ===== */}
      {isLoading && (
        <div className={s.loadingOverlay}>
          <div className={s.loadingBox}>
            <div className={s.spinner} />
            <span>Loading operations dashboard...</span>
          </div>
        </div>
      )}

      {/* ===== Error Banner ===== */}
      {error && (
        <div className={s.errorBanner} role="alert">
          <div className="d-flex align-items-center gap-2 p-3">
            <i className="bi bi-exclamation-triangle" />
            <div>
              <strong>Failed to load operations data.</strong>
              <div className={s.mutedSmall}>Using cached data. Check your connection and try again.</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO STATS ===== */}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
              Platform status <span style={{ color: '#86efac' }}>●</span> {data.platformStatus}
            </p>
            <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>{data.platformUptime} Uptime</div>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
              Last 30 days • {data.incidents30d} minor incidents resolved • {data.criticalOutages} critical outages
            </p>
            <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
              <button type="button" className={`${s.btnPm} ${s.btnSm} ${s.btnGhost}`} onClick={() => openModal('uptimeHistory')}>History</button>
              <button type="button" className={`${s.btnPm} ${s.btnSm} ${s.btnGhost}`} onClick={() => openModal('slaReport')}>SLA Report</button>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-6">
          <div className={s.card} style={{ minHeight: 170 }}>
            <p className={s.sl} style={{ color: 'var(--pm-accent)' }}>TRANSACTION SUCCESS</p>
            <div className={s.sv} style={{ margin: '6px 0' }}>{data.txnSuccess}</div>
            <span className={cx(s.badge, s.badgeS)}><i className="bi bi-check-circle" /> {data.txnCount} txns today</span>
            <div className="mt-2">
              <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                <span>Failed</span><span>{data.txnFailed} ({data.txnFailedPct})</span>
              </div>
              <div className={s.pmProgress} style={{ marginTop: 6 }}>
                <div className={s.pmProgressBar} style={{ width: data.txnSuccess, background: 'var(--pm-accent)' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-4 col-6">
          <div className={s.card} style={{ minHeight: 170 }}>
            <p className={s.sl} style={{ color: 'var(--pm-info)' }}>API RESPONSE (P95)</p>
            <div className={s.sv} style={{ margin: '6px 0' }}>{data.apiP95}</div>
            <span className={cx(s.badge, s.badgeI)}><i className="bi bi-speedometer2" /> Within SLA</span>
            <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
              <div>Current load: <strong>{data.apiLoad}</strong></div>
              <div>Peak today: <strong>{data.apiPeak}</strong></div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-4">
          <div className={s.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-warning)' }}>
            <p className={s.sl} style={{ color: 'var(--pm-warning)' }}>OPEN INCIDENTS</p>
            <div className={s.sv} style={{ margin: '6px 0' }}>{data.openIncidents}</div>
            <span className={cx(s.badge, s.badgeW)}><i className="bi bi-exclamation-triangle" /> {data.highPriority} high priority</span>
            <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
              <div>Settlement delay: <strong>{data.settlementDelay}</strong></div>
              <div>Fraud alert spike: <strong>{data.fraudSpike}</strong></div>
              <div>API degradation: <strong>{data.apiDegradation}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ATTENTION / SUGGESTIONS / QUICK ACTIONS ===== */}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={s.st}>Attention Required</h3>
              <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('incidentQueue')}>View all</button>
            </div>
            <div className={s.sr}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  <i className="bi bi-exclamation-triangle" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Settlement batch #S-88219 delayed</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>2h 14m behind SLA • KES 184M</div>
                </div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`} onClick={() => openModal('settlementDetail')}>Investigate</button>
            </div>
            <div className={s.sr}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  <i className="bi bi-graph-up" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Fraud detection false positive rate 4.2%</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Above threshold (2.5%)</div>
                </div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('fraudModel')}>Tune Model</button>
            </div>
            <div className={s.sr}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-info-soft)', color: 'var(--pm-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  <i className="bi bi-server" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>API Gateway P99 latency 420ms</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>SLA breach risk (SLA: 300ms)</div>
                </div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('apiPerformance')}>Scale</button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={s.st}>Smart Suggestions</h3>
              <span className={cx(s.badge, s.badgeP)}><i className="bi bi-stars" /> AI</span>
            </div>
            <div className={s.sr}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  <i className="bi bi-lightning-charge" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Enable auto-scaling on API Gateway</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Reduce P99 latency by 35%</div>
                </div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('infraScaling')}>Enable</button>
            </div>
            <div className={s.sr}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-purple-soft)', color: 'var(--pm-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  <i className="bi bi-shield-check" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Update fraud rules for weekend patterns</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Reduce false positives by 1.8%</div>
                </div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('fraudModel')}>Apply</button>
            </div>
            <div className={s.sr}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  <i className="bi bi-clock-history" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Schedule reconciliation catch-up job</div>
                  <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Clear 4 pending settlement batches</div>
                </div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('reconciliation')}>Schedule</button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className={s.card}>
            <div className="mb-3">
              <h3 className={s.st}>Quick Actions</h3>
              <p className={s.ss}>Frequent operations workflows</p>
            </div>
            <div className={s.quickGrid}>
              <button type="button" className={s.quickBtn} onClick={() => openModal('runHealthCheck')}><i className="bi bi-play-circle textAccent me-1" /> Run Health Check</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('incidentQueue')}><i className="bi bi-exclamation-triangle textDanger me-1" /> View Incidents</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('settlementDetail')}><i className="bi bi-bank textInfo me-1" /> Settlement Status</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('fraudModel')}><i className="bi bi-shield-exclamation textWarn me-1" /> Fraud Console</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('apiPerformance')}><i className="bi bi-speedometer2 textInfo me-1" /> API Metrics</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('auditLog')}><i className="bi bi-file-earmark-text textPurple me-1" /> Audit Logs</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('ticketDetail')}><i className="bi bi-headset textAccent me-1" /> Support Queue</button>
              <button type="button" className={s.quickBtn} onClick={() => openModal('infraScaling')}><i className="bi bi-server textInfo me-1" /> Scale Services</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 1: System Status Dashboard ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-heart-pulse-fill" style={{ color: 'var(--pm-primary)' }} /> 1.17.1 — System Status Dashboard</h3>
            <p className={s.ss}>Real-time health of all B2B transaction services, APIs, settlement engines and fraud systems.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('globalStatus')}><i className="bi bi-globe" /> Global View</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => openModal('runHealthCheck')}><i className="bi bi-play" /> Run Full Check</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-8">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Service Health Overview</h4>
              <div className="table-responsive">
                <table className={s.tbl}>
                  <thead>
                    <tr><th>Service</th><th>Status</th><th>Uptime</th><th>Latency (P95)</th><th>Error Rate</th><th>Last Incident</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.services.map((svc) => (
                      <tr key={svc.name}>
                        <td><strong>{svc.name}</strong></td>
                        <td>
                          <span className={cx(s.badge, svc.status === 'Healthy' ? s.badgeS : s.badgeW)}>
                            <i className={`bi ${svc.status === 'Healthy' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`} />
                            {svc.status}
                          </span>
                        </td>
                        <td>{svc.uptime}</td>
                        <td>{svc.latency}</td>
                        <td>{svc.errorRate}</td>
                        <td>{svc.lastIncident}</td>
                        <td>
                          <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('serviceDetail')}>Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Regional Status</h4>
              {data.regions.map((region) => (
                <div className={s.sr} key={region.name}>
                  <div><strong>{region.name}</strong></div>
                  <span className={cx(s.badge, region.status === 'All Green' ? s.badgeS : s.badgeW)}>{region.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 2: Transaction Health Monitor ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-activity" style={{ color: 'var(--pm-accent)' }} /> 1.17.2 — Transaction Health Monitor</h3>
            <p className={s.ss}>Live transaction volume, success rates, failure reasons, and channel performance across all corridors.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('liveTransactionFeed')}>Live Feed</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('failureAnalysis')}>Failure Analysis</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-7">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Live Transaction Metrics (Last 60 min)</h4>
              <div className="row g-3">
                <div className="col-4">
                  <div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-accent)' }}>42,811</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#047857' }}>Transactions</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 rounded text-center" style={{ background: 'var(--pm-info-soft)' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-info)' }}>KES 8.42B</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8' }}>Volume</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 rounded text-center" style={{ background: 'var(--pm-purple-soft)' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-purple)' }}>99.41%</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6D28D9' }}>Success Rate</div>
                  </div>
                </div>
              </div>
              <div className="table-responsive mt-3">
                <table className={s.tbl}>
                  <thead>
                    <tr><th>Corridor</th><th>Count</th><th>Success</th><th>Avg Time</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.corridors.map((cor) => (
                      <tr key={cor.name}>
                        <td>{cor.name}</td>
                        <td>{cor.count}</td>
                        <td>{cor.success}</td>
                        <td>{cor.avgTime}</td>
                        <td>
                          <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('corridorDetail')}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Failure Breakdown (Last Hour)</h4>
              {data.failureReasons.map((reason) => (
                <div className={s.sr} key={reason.reason}>
                  <div><strong>{reason.reason}</strong></div>
                  <div>
                    <span className={cx(s.badge, reason.pct > 20 ? s.badgeD : reason.pct > 10 ? s.badgeW : s.badgeI)}>
                      {reason.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <button type="button" className={`${s.btnPm} ${s.btnSm} w-100 mt-3`} onClick={() => openModal('failureAnalysis')}>Deep Dive into Failures</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 3: API & Integration Health ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-plug" style={{ color: 'var(--pm-info)' }} /> 1.17.3 — API & Integration Health</h3>
            <p className={s.ss}>Partner API performance, webhook delivery, integration status and rate limiting.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('apiPerformance')}>Performance</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('webhookMonitor')}>Webhooks</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-6">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Partner API Status</h4>
              <div className="table-responsive">
                <table className={s.tbl}>
                  <thead>
                    <tr><th>Partner</th><th>Status</th><th>Latency</th><th>Success</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.partnerApis.map((api) => (
                      <tr key={api.name}>
                        <td><strong>{api.name}</strong></td>
                        <td>
                          <span className={cx(s.badge, api.status === 'Healthy' ? s.badgeS : s.badgeW)}>{api.status}</span>
                        </td>
                        <td>{api.latency}</td>
                        <td>{api.success}</td>
                        <td>
                          <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('partnerApiDetail')}>Logs</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Webhook Delivery</h4>
              <div className={s.sr}>
                <div><strong>Delivered (Last 24h)</strong></div>
                <div><span className={cx(s.badge, s.badgeS)}>{data.webhookDelivered.toLocaleString()}</span></div>
              </div>
              <div className={s.sr}>
                <div><strong>Failed (Retries exhausted)</strong></div>
                <div><span className={cx(s.badge, s.badgeD)}>{data.webhookFailed.toLocaleString()}</span></div>
              </div>
              <div className={s.sr}>
                <div><strong>Pending Retry Queue</strong></div>
                <div><span className={cx(s.badge, s.badgeW)}>{data.webhookRetry.toLocaleString()}</span></div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm} w-100 mt-3`} onClick={() => openModal('webhookMonitor')}>Monitor Queue</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 4: Settlement & Reconciliation ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-bank2" style={{ color: 'var(--pm-primary)' }} /> 1.17.4 — Settlement & Reconciliation</h3>
            <p className={s.ss}>Real-time settlement status, batch reconciliation, pending items and dispute resolution.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('settlementDetail')}>Settlement Batches</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('reconciliation')}>Run Reconciliation</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-8">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Reconciliation Summary</h4>
              <div className={s.sr}>
                <div><strong>Matched Today</strong></div>
                <div><span className={cx(s.badge, s.badgeS)}>{data.reconciliationMatched.toLocaleString()}</span></div>
              </div>
              <div className={s.sr}>
                <div><strong>Unmatched</strong></div>
                <div><span className={cx(s.badge, s.badgeW)}>{data.reconciliationUnmatched.toLocaleString()}</span></div>
              </div>
              <div className={s.sr}>
                <div><strong>Disputed Items</strong></div>
                <div><span className={cx(s.badge, s.badgeD)}>{data.reconciliationDisputed.toLocaleString()}</span></div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm} w-100 mt-3`} onClick={() => openModal('reconciliation')}>Run Full Reconciliation</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 5: Fraud & Security Operations ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-shield-exclamation" style={{ color: 'var(--pm-danger)' }} /> 1.17.5 — Fraud & Security Operations</h3>
            <p className={s.ss}>Real-time fraud detection, alert queue, model performance and manual review cases.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('fraudModel')}>Model Console</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`} onClick={() => openModal('fraudAlertQueue')}>Alert Queue</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-7">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Fraud Detection Performance</h4>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>ALERTS TODAY</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--pm-danger)' }}>{data.fraudAlerts.toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>BLOCKED TRANSACTIONS</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--pm-accent)' }}>{data.blockedTxns.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="table-responsive mt-3">
                <table className={s.tbl}>
                  <thead>
                    <tr><th>Rule</th><th>Triggered</th><th>Blocked</th><th>FP Rate</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.fraudRules.map((rule) => (
                      <tr key={rule.name}>
                        <td>{rule.name}</td>
                        <td>{rule.triggered.toLocaleString()}</td>
                        <td>{rule.blocked.toLocaleString()}</td>
                        <td>{rule.fpRate}</td>
                        <td>
                          <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('fraudModel')}>Tune</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Manual Review Queue</h4>
              <div className={s.sr}>
                <div><strong>High Risk Cases</strong></div>
                <div><span className={cx(s.badge, s.badgeD)}>{data.manualReviewHigh}</span></div>
              </div>
              <div className={s.sr}>
                <div><strong>Medium Risk Cases</strong></div>
                <div><span className={cx(s.badge, s.badgeW)}>{data.manualReviewMedium}</span></div>
              </div>
              <div className={s.sr}>
                <div><strong>Low Risk Cases</strong></div>
                <div><span className={cx(s.badge, s.badgeI)}>{data.manualReviewLow}</span></div>
              </div>
              <button type="button" className={`${s.btnPm} ${s.btnSm} w-100 mt-3 ${s.btnPmD}`} onClick={() => openModal('fraudAlertQueue')}>Review Queue</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 6: Infrastructure & Uptime ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-server" style={{ color: 'var(--pm-primary)' }} /> 1.17.6 — Infrastructure & Uptime</h3>
            <p className={s.ss}>Server health, database performance, queue depths, auto-scaling events and capacity planning.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('infraScaling')}>Scaling</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('capacityPlanning')}>Capacity</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-8">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Infrastructure Metrics</h4>
              <div className="table-responsive">
                <table className={s.tbl}>
                  <thead>
                    <tr><th>Component</th><th>CPU</th><th>Memory</th><th>Disk</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.infra.map((comp) => (
                      <tr key={comp.name}>
                        <td><strong>{comp.name}</strong></td>
                        <td>{comp.cpu}</td>
                        <td>{comp.memory}</td>
                        <td>{comp.disk}</td>
                        <td>
                          <span className={cx(s.badge, comp.status === 'Healthy' ? s.badgeS : s.badgeW)}>{comp.status}</span>
                        </td>
                        <td>
                          <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('infraDetail')}>Metrics</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Auto-Scaling Events (24h)</h4>
              {data.scalingEvents.map((evt) => (
                <div className={s.sr} key={evt.component}>
                  <div><strong>{evt.component}</strong></div>
                  <div><span className={cx(s.badge, s.badgeI)}>{evt.count}</span></div>
                </div>
              ))}
              <button type="button" className={`${s.btnPm} ${s.btnSm} w-100 mt-3`} onClick={() => openModal('infraScaling')}>Manage Scaling Policies</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 7: Operations Queue & Support Tickets ===== */}
      <div className={s.card}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <div>
            <h3 className={s.st}><i className="bi bi-headset" style={{ color: 'var(--pm-purple)' }} /> 1.17.7 — Operations Queue & Support Tickets</h3>
            <p className={s.ss}>Internal operations tickets, partner support requests, SLA tracking and escalation management.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('ticketDetail')}>Support Queue</button>
            <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('escalation')}>Escalations</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-12">
            <div className={s.ub}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Operations Ticket Queue</h4>
              <div className="table-responsive">
                <table className={s.tbl}>
                  <thead>
                    <tr><th>Ticket</th><th>Type</th><th>Priority</th><th>Assignee</th><th>SLA</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td><code>{ticket.id}</code></td>
                        <td>{ticket.type}</td>
                        <td>
                          <span className={cx(s.badge, ticket.priority === 'High' ? s.badgeD : ticket.priority === 'Medium' ? s.badgeW : s.badgeI)}>{ticket.priority}</span>
                        </td>
                        <td>{ticket.assignee}</td>
                        <td>{ticket.sla}</td>
                        <td>
                          <span className={cx(s.badge, ticket.status === 'Resolved' ? s.badgeS : ticket.status === 'In Progress' ? s.badgeW : s.badgeI)}>{ticket.status}</span>
                        </td>
                        <td>
                          <button type="button" className={`${s.btnPm} ${s.btnSm}`} onClick={() => openModal('ticketDetail')}>Open</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      <OpsSystemModals state={modals} onClose={closeModal} />
    </div>
  );
}
