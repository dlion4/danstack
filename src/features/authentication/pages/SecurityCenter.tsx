/* ============================================================================
 * SecurityCenter.tsx — Paymo BAAS Session Management & Security Center
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page57.html (1,214 LOC) — vanilla JS + Bootstrap CSS
 * STACK ........: Vite + React + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/securityCenter.module.css.
 * REPO NOTES ...: tuned for dlion4/danstack — no new packages; art is served
 *                 from /public/assets; fonts come from routes/__root.tsx.
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   security score ring (SVG dash-offset) + component checklist, 7 tab panels,
 *   session cards (trust toggle / log out / mini-map / auto-logout select /
 *   log-out-all-others), login-history dual filters + CSV/TXT exports,
 *   trusted devices (limit chip, rename w/ inline editor, remove trust),
 *   alert toggles + threshold input + enable-all, recommendations that
 *   complete score components / jump panels, emergency lock / freeze / panic
 *   (panic revokes all other sessions), third-party app revoke, JSON summary
 *   export, and timed success notices.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   state{} object ....................... useState slices
 *   renderScore/Sessions/...() innerHTML . derived render (.map() loops)
 *   document click delegation ............ per-control onClick handlers
 *   prompt('Rename device') .............. inline edit mode (no dialog UX loss)
 *   showNotice()/showEmergency() ......... notice state + timed dismiss
 *   downloadFile() Blob+a.click() ........ kept verbatim (browser API bridge)
 *   score circle strokeDashoffset ........ derived from score()
 * ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import styles from '../styles/securityCenter.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type PanelId = 'sessions' | 'history' | 'trusted' | 'alerts' | 'recommendations' | 'emergency' | 'apps';
type BadgeKind = 'badgeOk' | 'badgeAdv' | 'badgeNative' | 'badgeSoon' | 'badgeDangerSoft';

interface ScoreComponent { key: string; label: string; points: number; done: boolean }
interface Session { id: number; device: string; icon: string; location: string; ip: string; last: string; status: string; current: boolean; trusted: boolean }
type HistoryRow = [string, string, string, string, string, string, string];
interface AlertRule { key: string; label: string; desc: string; channels: string[]; enabled: boolean; threshold?: number }
interface ThirdPartyApp { id: string; name: string; icon: string; last: string; risk: 'Low' | 'Medium' | 'High'; perms: string[] }
interface Recommendation { key: string; title: string; desc: string; link: string; completes?: string }

interface SecurityConfig {
  brand: { titlePre: string; titleAccent: string; copy: string; pill: string; stats: Array<{ value: string; label: string; gold?: boolean }> };
  components: ScoreComponent[];
  sessions: Session[];
  history: HistoryRow[];
  historyLocations: string[];
  autoLogoutOptions: Array<{ value: string; label: string; selected?: boolean }>;
  alerts: AlertRule[];
  apps: ThirdPartyApp[];
  recommendations: Recommendation[];
  trustedLimit: number;
}

/* --------------------------------------------------------------------------
 * 1. initialMockData — every legacy state{} array extracted (score
 *    components, sessions, 90-day history rows, alert rules, OAuth apps,
 *    recommendations). GET /api/security-center returns this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: SecurityConfig = {
  brand: {
    pill: 'Account protected',
    titlePre: 'Session Management & ',
    titleAccent: 'Security Center',
    copy: 'Monitor active devices, login history, app access, alert rules, and emergency controls from one secure surface.',
    stats: [
      { value: '7', label: 'Active sessions' },
      { value: '90d', label: 'Login history' },
      { value: '2', label: 'Open actions', gold: true },
      { value: '24/7', label: 'Fraud watch' },
    ],
  },

  components: [
    { key: 'password', label: 'Strong password', points: 20, done: true },
    { key: 'twofa', label: '2FA enabled', points: 25, done: true },
    { key: 'passkey', label: 'Passkey enrolled', points: 20, done: true },
    { key: 'biometric', label: 'Biometric enabled', points: 10, done: true },
    { key: 'review', label: 'Recent security review', points: 10, done: false },
    { key: 'clean', label: 'No suspicious activity', points: 15, done: true },
  ],

  sessions: [
    { id: 1, device: 'iPhone 15 Pro', icon: 'bi-phone', location: 'Nairobi, Kenya', ip: '192.168.x.x', last: 'Active now', status: 'This device', current: true, trusted: true },
    { id: 2, device: 'Chrome on MacBook', icon: 'bi-laptop', location: 'Nairobi, Kenya', ip: '197.x.x.x', last: '2 hours ago', status: 'Active', current: false, trusted: true },
    { id: 3, device: 'Safari on iPad', icon: 'bi-tablet', location: 'Accra, Ghana', ip: '154.x.x.x', last: '3 days ago', status: 'Inactive', current: false, trusted: false },
    { id: 4, device: 'Edge on Windows', icon: 'bi-pc-display', location: 'London, UK', ip: '82.x.x.x', last: '6 days ago', status: 'Active', current: false, trusted: false },
  ],

  history: [
    ['Jun 11, 2026 09:14', 'iPhone 15 Pro', 'Paymo iOS', 'Nairobi', '192.168.x.x', 'Passkey', 'Success'],
    ['Jun 11, 2026 06:45', 'MacBook Pro', 'Chrome', 'Nairobi', '197.x.x.x', 'Password + MFA', 'Success'],
    ['Jun 10, 2026 23:02', 'Unknown Windows', 'Chrome', 'Dubai', '51.x.x.x', 'Password', 'Step-up Required'],
    ['Jun 10, 2026 03:18', 'Unknown Android', 'Chrome', 'London', '82.x.x.x', 'Password', 'Failed'],
    ['Jun 09, 2026 18:40', 'iPad Pro', 'Safari', 'Accra', '154.x.x.x', 'PIN', 'Success'],
    ['Jun 08, 2026 02:11', 'Unknown Linux', 'Firefox', 'Moscow', '185.x.x.x', 'Password', 'Blocked'],
    ['Jun 07, 2026 11:28', 'MacBook Pro', 'Chrome', 'Nairobi', '197.x.x.x', 'Passkey', 'Success'],
  ],
  historyLocations: ['Lagos', 'Nairobi', 'Accra', 'London', 'Dubai'],

  autoLogoutOptions: [
    { value: '15', label: 'Auto logout: 15 min' },
    { value: '60', label: 'Auto logout: 1 hour' },
    { value: '480', label: 'Auto logout: 8 hours', selected: true },
    { value: 'never', label: 'Auto logout: Never' },
  ],

  alerts: [
    { key: 'newDevice', label: 'New device login', desc: 'Notify when your account is accessed from a new device.', channels: ['Email', 'Push'], enabled: true },
    { key: 'password', label: 'Password changed', desc: 'Immediate alert when password or PIN changes.', channels: ['Email', 'SMS', 'Push'], enabled: true },
    { key: 'largeTxn', label: 'Large transaction initiated', desc: 'Alert for transactions above your custom threshold.', channels: ['Push'], enabled: true, threshold: 10000 },
    { key: 'apiKey', label: 'API key created or rotated', desc: 'Notify admins when API credentials change.', channels: ['Email'], enabled: true },
    { key: 'failedLogin', label: 'Failed login attempts', desc: 'Warn after repeated failed attempts.', channels: ['Email'], enabled: false },
    { key: 'suspicious', label: 'Suspicious activity detected', desc: 'High priority fraud and risk engine alerts.', channels: ['SMS', 'Push'], enabled: true },
  ],

  apps: [
    { id: 'xero', name: 'Xero Accounting', icon: 'bi-receipt', last: 'Used 1 hour ago', risk: 'Low', perms: ['Read balances', 'Read transactions', 'Export statements'] },
    { id: 'slack', name: 'Slack Alerts', icon: 'bi-bell', last: 'Used today', risk: 'Low', perms: ['Send security notifications'] },
    { id: 'payroll', name: 'Northstar Payroll', icon: 'bi-people', last: 'Used 4 days ago', risk: 'Medium', perms: ['Read wallets', 'Initiate payouts', 'View beneficiaries'] },
    { id: 'legacy', name: 'Legacy BI Connector', icon: 'bi-database', last: 'Used 61 days ago', risk: 'High', perms: ['Read transactions', 'Read customers', 'Export CSV'] },
  ],

  recommendations: [
    { key: 'twofa', title: 'Enable 2FA', desc: 'Require an additional factor for logins and sensitive actions.', link: 'Already enabled', completes: 'twofa' },
    { key: 'passkey', title: 'Set up a passkey', desc: 'Use phishing-resistant authentication on supported devices.', link: 'Already enrolled', completes: 'passkey' },
    { key: 'review', title: 'Review security settings', desc: 'Confirm devices, alerts, apps, and recovery options.', link: 'Start review', completes: 'review' },
    { key: 'questions', title: 'Update security questions', desc: 'Refresh recovery questions and answers.', link: 'Update now' },
    { key: 'recovery', title: 'Generate new recovery codes', desc: 'Keep fresh backup codes offline.', link: 'Generate codes' },
    { key: 'apps', title: 'Review connected apps', desc: 'Remove stale or excessive OAuth permissions.', link: 'Review apps' },
  ],

  trustedLimit: 10,
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchSecurityCenter(): Promise<SecurityConfig> {
  const response = await fetch('/api/security-center', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Security center API responded HTTP ${response.status}`);
  return response.json() as Promise<SecurityConfig>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* LEGACY BRIDGE: badgeForStatus() mapping — verbatim. */
const STATUS_BADGE: Record<string, string> = {
  Success: 'badgeOk',
  Failed: 'badgeSoon',
  Blocked: 'badgeDangerSoft',
  'Step-up Required': 'badgeAdv',
};

/* LEGACY BRIDGE: downloadFile() — Blob + temp anchor, exactly as legacy. */
function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

const TABS: Array<{ id: PanelId; icon: string; label: string }> = [
  { id: 'sessions', icon: 'bi-phone', label: 'Active sessions' },
  { id: 'history', icon: 'bi-clock-history', label: 'Login history' },
  { id: 'trusted', icon: 'bi-patch-check', label: 'Trusted devices' },
  { id: 'alerts', icon: 'bi-bell', label: 'Alerts' },
  { id: 'recommendations', icon: 'bi-check2-square', label: 'Recommendations' },
  { id: 'emergency', icon: 'bi-shield-lock', label: 'Emergency' },
  { id: 'apps', icon: 'bi-plug', label: 'Apps' },
];

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function SecurityCenter() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-security-center'],
    queryFn: fetchSecurityCenter,
    staleTime: 60_000,
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable; the error
  // banner below surfaces that failure state to the user.
  const content = apiData ?? initialMockData;

  /* ---------- state (legacy `state` object) ---------- */
  const [panel, setPanel] = useState<PanelId>('sessions');
  const [components, setComponents] = useState<ScoreComponent[]>(content.components);
  const [sessions, setSessions] = useState<Session[]>(content.sessions);
  const [alerts, setAlerts] = useState<AlertRule[]>(content.alerts);
  const [apps, setApps] = useState<ThirdPartyApp[]>(content.apps);

  const [historyStatus, setHistoryStatus] = useState('all');
  const [historyLocation, setHistoryLocation] = useState('all');
  const [autoLogout, setAutoLogout] = useState(
    content.autoLogoutOptions.find((o) => o.selected)?.value ?? content.autoLogoutOptions[0].value,
  );
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const [notice, setNotice] = useState<string | null>(null);
  const [emergencyNotice, setEmergencyNotice] = useState<string | null>(null);

  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

  /* LEGACY BRIDGE: showNotice(text) — .notice.show + 3.5s timeout removal. */
  const showNotice = (text: string) => {
    setNotice(text);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 3500);
  };

  /* LEGACY BRIDGE: showEmergency(text) — emergency notice + global notice. */
  const showEmergency = (text: string) => {
    setEmergencyNotice(text);
    showNotice(text);
  };

  /* ---------- derived (legacy score() / filtered history) ---------- */
  const score = components.reduce((sum, c) => sum + (c.done ? c.points : 0), 0);
  const scoreOffset = 452 - (452 * score) / 100;
  const trustedDevices = sessions.filter((x) => x.trusted);
  const openActions = content.recommendations.filter((r) => {
    if (!r.completes) return true;
    return !components.find((c) => c.key === r.completes)?.done;
  }).length;
  const historyRows = content.history.filter(
    (r) => (historyStatus === 'all' || r[6] === historyStatus) && (historyLocation === 'all' || r[3] === historyLocation),
  );

  /* ---------- panel / session handlers (legacy delegated clicks) ---------- */
  const goPanel = (next: PanelId) => {
    setPanel(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTrust = (id: number) => {
    setSessions((prev) => prev.map((x) => (x.id === id ? { ...x, trusted: !x.trusted } : x)));
    const target = sessions.find((x) => x.id === id);
    showNotice(target?.trusted ? 'Device removed from trusted list.' : 'Device marked as trusted.');
  };

  const logoutSession = (id: number) => {
    setSessions((prev) => prev.filter((x) => x.id !== id));
    showNotice('Selected session logged out.');
  };

  const logoutOthers = () => {
    setSessions((prev) => prev.filter((x) => x.current));
    showNotice('All other sessions have been logged out.');
  };

  /* LEGACY BRIDGE: rename-device prompt() -> inline edit (same mutation). */
  const startRename = (session: Session) => {
    setRenamingId(session.id);
    setRenameDraft(session.device);
  };

  const commitRename = () => {
    if (renamingId !== null && renameDraft.trim()) {
      setSessions((prev) => prev.map((x) => (x.id === renamingId ? { ...x, device: renameDraft.trim() } : x)));
      showNotice('Device renamed.');
    }
    setRenamingId(null);
  };

  /* ---------- recommendations ---------- */
  const completeRecommendation = (rec: Recommendation) => {
    if (rec.key === 'apps') {
      goPanel('apps');
      return;
    }
    if (rec.completes) {
      setComponents((prev) => prev.map((c) => (c.key === rec.completes ? { ...c, done: true } : c)));
    }
    showNotice('Security recommendation completed.');
  };

  /* ---------- emergency (legacy .emergency-action handler) ---------- */
  const applyEmergency = (action: 'lock' | 'freeze' | 'panic') => {
    if (action === 'lock') showEmergency('Account locked for 24 hours. Identity verification required to unlock.');
    if (action === 'freeze') showEmergency('Money movement frozen. Fraud review started.');
    if (action === 'panic') {
      setSessions((prev) => prev.filter((x) => x.current));
      showEmergency('Account secured, sessions revoked, transactions frozen.');
    }
  };

  /* ---------- exports (legacy csvBtn/pdfBtn/exportSummaryBtn) ---------- */
  const exportCsv = () => downloadFile(
    'paymo-login-history.csv',
    `Date/Time,Device,Browser,Location,IP,Method,Status\n${content.history.map((r) => r.join(',')).join('\n')}`,
    'text/csv',
  );

  const exportTxt = () => downloadFile(
    'paymo-login-history.txt',
    `Paymo BAAS Login History\n\n${content.history.map((r) => r.join(' | ')).join('\n')}`,
    'text/plain',
  );

  const exportSummary = () => downloadFile(
    'paymo-security-summary.json',
    JSON.stringify({ score, sessions, alerts, apps }, null, 2),
    'application/json',
  );

  /* ------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ---------------------------------------------------------------------- */
  return (
    <div className={s.securityPage}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading security center…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Security data unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/security-center</code> — {error.message}. Showing bundled snapshot.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      <div className={cx(s.gridOverlay, 'position-fixed top-0 start-0 w-100 h-100')} style={{ opacity: 0.45, pointerEvents: 'none' }} />
      <div className={s.blob} style={{ width: '520px', height: '520px', background: '#2ee6a0', top: '-190px', right: '-120px' }} />
      <div className={s.blob} style={{ width: '430px', height: '430px', background: '#0a7a54', bottom: '-140px', left: '-120px', animationDelay: '-6s' }} />

      <div className={s.shell}>
        <div className="row g-4 align-items-start">
          {/* ================= LEFT: sticky brand visual ================= */}
          <aside className="col-lg-4">
            <div className={cx(s.sideVisual, s.glassStrong)}>
              <div className={s.scanLine} />
              <div className={s.sideContent}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <span className={s.logoMark}>P</span>
                    <div>
                      <div className="fw-bold text-white">Paymo <span className={s.textGradient}>BAAS</span></div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--sc-ink-3)' }}>Zero-trust security center</div>
                    </div>
                  </div>
                  <span className={cx(s.pill, 'mb-3')}><span className={s.pillDot} /> {content.brand.pill}</span>
                  <h1 className={cx(s.sideTitle, 'mb-3')}>
                    {content.brand.titlePre}
                    <span className={s.textGradient}>{content.brand.titleAccent}</span>
                  </h1>
                  <p className={cx(s.mutedText, 'mb-4')} style={{ maxWidth: '360px' }}>{content.brand.copy}</p>
                  <div className={cx(s.flowFrame, 'mb-4')}>
                    <img src="/assets/flow-3d.jpg" alt="Security telemetry flow" />
                    <div className={s.flowCaption}>
                      <span className={cx(s.badgeMini, s.badgeNative)}>Live risk engine</span>
                      <div className="fw-bold text-white mt-1">Device, location, API and login telemetry</div>
                    </div>
                  </div>
                </div>
                <div className="row g-2">
                  {content.brand.stats.map((stat) => (
                    <div className="col-6" key={stat.label}>
                      <div className={cx(s.glass, 'p-3')}>
                        <div className={cx(s.mono, 'fw-bold', stat.gold ? s.textGradientGold : s.textGradient)}>{stat.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sc-ink-3)' }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT: security surface ================= */}
          <section className="col-lg-8">
            {/* header + score */}
            <div className={cx(s.glassStrong, 'p-3 p-md-4 mb-4')}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
                <div>
                  <div className={s.sectionLabel}>Security Center</div>
                  <h2 className="mb-2" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--sc-ink-0)' }}>
                    Security Center
                  </h2>
                  <p className={cx(s.mutedText, 'mb-0')}>Monitor your account security and manage every active session.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={exportSummary}>
                    <i className="bi bi-download me-1" /> Export summary
                  </button>
                  <button type="button" className={cx(s.btnDanger, 'btn btn-sm')} onClick={() => goPanel('emergency')}>
                    <i className="bi bi-shield-exclamation me-1" /> Emergency
                  </button>
                </div>
              </div>

              <div className="row g-3 align-items-center">
                <div className="col-md-4 d-flex justify-content-center">
                  <div className={s.scoreRing}>
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" />
                      <circle
                        cx="90" cy="90" r="72" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="14" strokeLinecap="round"
                        strokeDasharray="452"
                        strokeDashoffset={scoreOffset}
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" x2="1">
                          <stop offset="0" stopColor="#2ee6a0" />
                          <stop offset="1" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className={s.scoreCenter}>
                      <div className={s.scoreNum}>{score}</div>
                      <div className={s.scoreCaption}>Security score</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row g-2">
                    {components.map((c) => (
                      <div className="col-sm-6" key={c.key}>
                        <div className={cx(s.glass, 'p-3 h-100 d-flex align-items-center justify-content-between')} style={{ borderRadius: '14px' }}>
                          <div>
                            <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>{c.label}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--sc-ink-3)' }}>+{c.points} points</div>
                          </div>
                          <span className={cx(s.badgeMini, c.done ? s.badgeOk : s.badgeSoon)}>{c.done ? 'Done' : 'Open'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LEGACY BRIDGE: #globalNotice */}
              <div className={cx(s.notice, 'mt-3', notice && s.show)} role="status">
                <i className="bi bi-check-circle-fill" />
                <span>{notice ?? 'Updated.'}</span>
              </div>
            </div>

            {/* tab bar */}
            <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
              <div className={s.tabbar} role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={panel === tab.id}
                    className={cx(s.tabbtn, panel === tab.id && s.active)}
                    onClick={() => goPanel(tab.id)}
                  >
                    <i className={`bi ${tab.icon} me-1`} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== PANEL: active sessions ===== */}
            <div className={cx(s.panel, panel === 'sessions' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Active Sessions</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>
                      Review devices currently signed in and revoke anything unfamiliar.
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={autoLogout}
                      onChange={(e) => {
                        setAutoLogout(e.target.value);
                        showNotice(`Auto-logout updated to ${e.target.options[e.target.selectedIndex].text.replace('Auto logout: ', '')}.`);
                      }}
                      aria-label="Auto logout interval"
                    >
                      {content.autoLogoutOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={logoutOthers}>
                      <i className="bi bi-box-arrow-right me-1" /> Log out all other devices
                    </button>
                  </div>
                </div>
                <div className="row g-3">
                  {sessions.map((session) => (
                    <div className="col-md-6" key={session.id}>
                      <div className={cx(s.sessionCard, 'h-100')}>
                        <div className="d-flex gap-3 align-items-start">
                          <div className={s.deviceIcon}><i className={`bi ${session.icon}`} /></div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between gap-2 flex-wrap">
                              {renamingId === session.id ? (
                                <input
                                  className={s.renameInput}
                                  value={renameDraft}
                                  onChange={(e) => setRenameDraft(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                                  onBlur={commitRename}
                                  autoFocus
                                  aria-label="Rename device"
                                />
                              ) : (
                                <h5 className={cx(s.h5, 'mb-1')}>{session.device}</h5>
                              )}
                              <span className={cx(s.badgeMini, session.current ? s.badgeNative : session.status === 'Active' ? s.badgeOk : s.badgeSoon)}>
                                {session.status}
                              </span>
                            </div>
                            <div className={s.mutedText} style={{ fontSize: '0.82rem' }}>
                              <i className="bi bi-geo-alt me-1" />{session.location}
                            </div>
                            <div className={s.mono} style={{ fontSize: '0.74rem', color: 'var(--sc-ink-3)' }}>
                              {session.ip} · {session.last}
                            </div>
                          </div>
                        </div>
                        <div className={cx(s.miniMap, 'my-3')} />
                        <div className="d-flex gap-2 flex-wrap">
                          <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={() => toggleTrust(session.id)}>
                            <i className={`bi ${session.trusted ? 'bi-patch-check-fill' : 'bi-patch-check'} me-1`} />
                            {session.trusted ? 'Trusted' : 'Mark trusted'}
                          </button>
                          {session.current ? (
                            <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} disabled>This device</button>
                          ) : (
                            <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={() => logoutSession(session.id)}>
                              <i className="bi bi-box-arrow-right me-1" />Log out
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== PANEL: login history ===== */}
            <div className={cx(s.panel, panel === 'history' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Login History</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>
                      90-day activity trail with risk flags and step-up events.
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <select className="form-select form-select-sm" style={{ width: 'auto' }} value={historyStatus}
                      onChange={(e) => setHistoryStatus(e.target.value)} aria-label="Filter by status">
                      <option value="all">All statuses</option>
                      <option>Success</option>
                      <option>Failed</option>
                      <option>Blocked</option>
                      <option>Step-up Required</option>
                    </select>
                    <select className="form-select form-select-sm" style={{ width: 'auto' }} value={historyLocation}
                      onChange={(e) => setHistoryLocation(e.target.value)} aria-label="Filter by location">
                      <option value="all">All locations</option>
                      {content.historyLocations.map((loc) => <option key={loc}>{loc}</option>)}
                    </select>
                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={exportCsv}>
                      <i className="bi bi-filetype-csv me-1" /> CSV
                    </button>
                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={exportTxt}>
                      <i className="bi bi-filetype-pdf me-1" /> PDF
                    </button>
                  </div>
                </div>
                <div className={s.tableWrap}>
                  <table className={s.securityTable}>
                    <thead>
                      <tr>
                        <th>Date/Time</th><th>Device</th><th>Browser</th><th>Location</th><th>IP</th><th>Method</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((r) => (
                        <tr key={`${r[0]}-${r[1]}`}>
                          <td className={s.mono}>{r[0]}</td>
                          <td>{r[1]}</td>
                          <td>{r[2]}</td>
                          <td>
                            {r[3]}
                            {r[6] === 'Blocked' && <span className={cx(s.badgeMini, s.badgeDangerSoft, 'ms-1')}>Unusual</span>}
                          </td>
                          <td className={s.mono}>{r[4]}</td>
                          <td>{r[5]}</td>
                          <td><span className={cx(s.badgeMini, s[STATUS_BADGE[r[6]] ?? 'badgeNative'])}>{r[6]}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ===== PANEL: trusted devices ===== */}
            <div className={cx(s.panel, panel === 'trusted' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Trusted Devices</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>
                      Trusted devices can use longer sessions and lighter step-up prompts. Limit: {content.trustedLimit} devices.
                    </p>
                  </div>
                  <span className={cx(s.badgeMini, s.badgeNative)}>{trustedDevices.length} / {content.trustedLimit}</span>
                </div>
                <div className="row g-3">
                  {trustedDevices.length > 0 ? trustedDevices.map((device) => (
                    <div className="col-md-6" key={device.id}>
                      <div className={cx(s.deviceCard, 'h-100')}>
                        <div className="d-flex gap-3">
                          <div className={s.deviceIcon}><i className={`bi ${device.icon}`} /></div>
                          <div className="flex-grow-1">
                            <h5 className={s.h5}>{device.device}</h5>
                            <div className={s.mutedText} style={{ fontSize: '0.84rem' }}>{device.location}</div>
                            <div className={s.mono} style={{ color: 'var(--sc-ink-3)', fontSize: '0.74rem' }}>Last active: {device.last}</div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={() => startRename(device)}>Rename</button>
                          <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={() => toggleTrust(device.id)}>Remove trust</button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-12">
                      <div className={cx(s.glass, 'p-4 text-center')} style={{ borderRadius: '14px', color: 'var(--sc-ink-2)' }}>
                        No trusted devices yet.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ===== PANEL: alerts ===== */}
            <div className={cx(s.panel, panel === 'alerts' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Security Alerts & Notifications</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>
                      Customize delivery methods and thresholds for high-risk events.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={cx(s.btnPaymo, 'btn btn-sm')}
                    onClick={() => {
                      setAlerts((prev) => prev.map((a) => ({ ...a, enabled: true })));
                      showNotice('All security alerts enabled.');
                    }}
                  >
                    <i className="bi bi-bell-fill me-1" /> Enable all alerts
                  </button>
                </div>
                <div className="row g-3">
                  {alerts.map((rule) => (
                    <div className="col-md-6" key={rule.key}>
                      <div className={cx(s.alertCard, 'h-100')}>
                        <div className="d-flex justify-content-between gap-3 align-items-start mb-2">
                          <div>
                            <h5 className={s.h5}>{rule.label}</h5>
                            <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.84rem' }}>{rule.desc}</p>
                          </div>
                          <label className={s.toggle}>
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => {
                                setAlerts((prev) => prev.map((a) => (a.key === rule.key ? { ...a, enabled: e.target.checked } : a)));
                                showNotice(`${rule.label} ${e.target.checked ? 'enabled' : 'disabled'}.`);
                              }}
                              aria-label={`Toggle ${rule.label}`}
                            />
                            <span />
                          </label>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mt-3">
                          {rule.channels.map((ch) => (
                            <span key={ch} className={cx(s.badgeMini, s.badgeNative)}>{ch}</span>
                          ))}
                        </div>
                        {rule.threshold !== undefined && (
                          <div className="mt-3">
                            <label style={{ fontSize: '0.72rem', color: 'var(--sc-ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }} htmlFor={`threshold-${rule.key}`}>
                              Threshold USD
                            </label>
                            <input
                              id={`threshold-${rule.key}`}
                              className="form-control form-control-sm"
                              value={rule.threshold}
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = Number(e.target.value.replace(/\D/g, '')) || 0;
                                setAlerts((prev) => prev.map((a) => (a.key === rule.key ? { ...a, threshold: value } : a)));
                              }}
                              onBlur={() => showNotice('Alert threshold updated.')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== PANEL: recommendations ===== */}
            <div className={cx(s.panel, panel === 'recommendations' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Security Recommendations</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>Complete these actions to improve your score.</p>
                  </div>
                  <span className={cx(s.badgeMini, s.badgeSoon)}>{openActions} open</span>
                </div>
                <div className="row g-3">
                  {content.recommendations.map((rec) => {
                    const done = rec.completes ? components.find((c) => c.key === rec.completes)?.done ?? false : false;
                    return (
                      <div className="col-md-6" key={rec.key}>
                        <div className={cx(s.recommendCard, 'h-100')}>
                          <div className="d-flex gap-3">
                            <div className={s.deviceIcon} style={{ width: '42px', height: '42px', flexBasis: '42px', fontSize: '1.1rem' }}>
                              <i className={`bi ${done ? 'bi-check-circle-fill' : 'bi-circle'}`} />
                            </div>
                            <div className="flex-grow-1">
                              <h5 className={s.h5}>{rec.title}</h5>
                              <p className={s.mutedText} style={{ fontSize: '0.84rem' }}>{rec.desc}</p>
                              <button
                                type="button"
                                className={cx(done ? s.btnOutline : s.btnPaymo, 'btn btn-sm')}
                                disabled={done}
                                onClick={() => completeRecommendation(rec)}
                              >
                                {rec.link}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ===== PANEL: emergency ===== */}
            <div className={cx(s.panel, panel === 'emergency' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className={s.deviceIcon} style={{ background: 'rgba(239,68,68,.12)', borderColor: 'rgba(239,68,68,.35)', color: '#fca5a5' }}>
                    <i className="bi bi-shield-exclamation" />
                  </div>
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Account Lock & Emergency Freeze</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>
                      Use these controls if you suspect unauthorized access or card fraud.
                    </p>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className={cx(s.alertCard, 'h-100')}>
                      <span className={cx(s.badgeMini, s.badgeSoon, 'mb-2 d-inline-flex')}>Temporary</span>
                      <h5 className={s.h5}>Lock account for 24 hours</h5>
                      <p className={s.mutedText} style={{ fontSize: '0.86rem' }}>Blocks all new logins and sensitive account changes.</p>
                      <button type="button" className={cx(s.btnOutline, 'btn btn-sm w-100')} onClick={() => applyEmergency('lock')}>
                        <i className="bi bi-lock me-1" /> Lock account
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={cx(s.alertCard, 'h-100')}>
                      <span className={cx(s.badgeMini, s.badgeDangerSoft, 'mb-2 d-inline-flex')}>Fraud control</span>
                      <h5 className={s.h5}>Freeze cards and transactions</h5>
                      <p className={s.mutedText} style={{ fontSize: '0.86rem' }}>Stops card spend, payouts, beneficiary additions, and API transfers.</p>
                      <button type="button" className={cx(s.btnDanger, 'btn btn-sm w-100')} onClick={() => applyEmergency('freeze')}>
                        <i className="bi bi-credit-card-2-front me-1" /> Freeze movement
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={cx(s.alertCard, 'h-100')}>
                      <span className={cx(s.badgeMini, s.badgeDangerSoft, 'mb-2 d-inline-flex')}>Panic button</span>
                      <h5 className={s.h5}>Secure my account now</h5>
                      <p className={s.mutedText} style={{ fontSize: '0.86rem' }}>Revokes sessions, freezes money movement, and starts a fraud review.</p>
                      <button type="button" className={cx(s.btnDanger, 'btn btn-sm w-100')} onClick={() => applyEmergency('panic')}>
                        <i className="bi bi-lightning-charge me-1" /> Secure now
                      </button>
                    </div>
                  </div>
                </div>
                <div className={cx(s.notice, 'mt-3', emergencyNotice && s.show)} role="status">
                  <i className="bi bi-check-circle-fill" />
                  <span>{emergencyNotice ?? 'Emergency control applied.'}</span>
                </div>
              </div>
            </div>

            {/* ===== PANEL: apps ===== */}
            <div className={cx(s.panel, panel === 'apps' && s.active)}>
              <div className={cx(s.glass, 'p-3 p-md-4 mb-4')}>
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h3 className={cx(s.h3, 'mb-1')}>Third-Party App Access</h3>
                    <p className={cx(s.mutedText, 'mb-0')} style={{ fontSize: '0.92rem' }}>OAuth-connected apps and their granted permissions.</p>
                  </div>
                  <span className={cx(s.badgeMini, s.badgeAdv)}>{apps.length} connected</span>
                </div>
                <div className="row g-3">
                  {apps.length > 0 ? apps.map((app) => (
                    <div className="col-md-6" key={app.id}>
                      <div className={cx(s.appCard, 'h-100')}>
                        <div className="d-flex gap-3 align-items-start">
                          <div className={s.deviceIcon}><i className={`bi ${app.icon}`} /></div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between gap-2">
                              <h5 className={s.h5}>{app.name}</h5>
                              <span className={cx(s.badgeMini, app.risk === 'High' ? s.badgeDangerSoft : app.risk === 'Medium' ? s.badgeSoon : s.badgeOk)}>
                                {app.risk} risk
                              </span>
                            </div>
                            <div style={{ color: 'var(--sc-ink-3)', fontSize: '0.78rem' }}>{app.last}</div>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-1 my-3">
                          {app.perms.map((perm) => (
                            <span key={perm} className={cx(s.badgeMini, s.badgeAdv)}>{perm}</span>
                          ))}
                        </div>
                        <button
                          type="button"
                          className={cx(s.btnOutline, 'btn btn-sm')}
                          onClick={() => {
                            setApps((prev) => prev.filter((a) => a.id !== app.id));
                            showNotice('Third-party app access revoked.');
                          }}
                        >
                          <i className="bi bi-x-circle me-1" />Revoke access
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-12">
                      <div className={cx(s.glass, 'p-4 text-center')} style={{ borderRadius: '14px', color: 'var(--sc-ink-2)' }}>
                        No connected apps remain.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
