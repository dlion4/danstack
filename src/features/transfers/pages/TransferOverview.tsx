/* ============================================================================
 * TransferOverview.tsx — Transfer Overview Command Center (Page 1.1)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.1.html (2,279 LOC) — vanilla JS + Bootstrap CSS.
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * ARCHITECTURE .: One component file holds layout + logic (per spec). Styles
 *                 live in ../styles/transferOverview.module.css. All modals
 *                 live in ./TransferModals.tsx (kept separate purely because
 *                 there are 22 of them — same feature, same folder).
 *
 * This page renders INSIDE the app shell (routes/app.tsx -> <Outlet />), so the
 * sidebar + top nav + right aside stay fixed and only this body swaps.
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   - 4 hero stat cards, Attention / Smart Suggestions / Quick Actions triad
 *   - Recent transfers table + channel breakdown, Favorites grid (mapped)
 *   - Scheduled & recurring table, Analytics snapshot (top recipients / success
 *     rate by channel / monthly trend bars)
 *   - 22 modals incl. 4 multi-step flows (init/bulk/sched/intl), tabbed
 *     (beneficiaries, analytics), PIN entry, receipts, loading overlays.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   favorites[] const + renderFavorites() .innerHTML .. mapped from data
 *   openM(id) new bootstrap.Modal().show() ............. activeModal state +
 *                                                       useBootstrapModal hook
 *   flows{} + renderStepper() + nextFlow() ............. FlowModal component
 *   sw(prefix,key) tab toggle .......................... TabbedModal state
 *   doAction() loading + success innerHTML ............. SimpleModal phase state
 *   cacheAndReset() body restore on hidden ............. React remounts cleanly
 * ========================================================================== */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cx, fetchShellContent, initialMockData } from '../../shell/data/shellData';
import styles from '../styles/transferOverview.module.css';
import TransferModals from '../components/TransferModals';
import type { ModalId } from '../components/TransferModals';

const s = styles as Record<string, string>;

/* --------------------------------------------------------------------------
 * 1. initialMockData — every repeating block from legacy 1.1.html extracted.
 *    GET /api/transfer-overview returns this same shape.
 * ------------------------------------------------------------------------ */
interface RecentTransfer {
  date: string; beneficiary: string; amount: string; method: string;
  status: 'success' | 'pending'; statusLabel: string; ref: string;
}
interface ChannelStat { name: string; count: string; total: string }
interface Favorite { name: string; account: string; type: string; color: string }
interface ScheduledRow {
  label: string; beneficiary: string; amount: string; frequency: string;
  nextRun: string; status: 'active' | 'paused';
}
interface AttentionItem { icon: string; tone: 'danger' | 'warn' | 'info'; title: string; sub: string; action: string; modal: ModalId }
interface SuggestionItem { icon: string; tone: 'success' | 'info' | 'warn'; title: string; sub: string; action: string; modal: ModalId }
interface QuickAction { icon: string; tone: string; label: string; modal: ModalId }
interface TopRecipient { name: string; total: string }
interface SuccessByChannel { channel: string; rate: string; tone: 'success' | 'warn' }
interface TrendBar { height: number; color: string; label: string }

interface TransferContent {
  recentTransfers: RecentTransfer[];
  channels: ChannelStat[];
  favorites: Favorite[];
  scheduled: ScheduledRow[];
  attention: AttentionItem[];
  suggestions: SuggestionItem[];
  quickActions: QuickAction[];
  topRecipients: TopRecipient[];
  successByChannel: SuccessByChannel[];
  trend: TrendBar[];
}

const transferMockData: TransferContent = {
  recentTransfers: [
    { date: '27 Jun', beneficiary: 'Grace Kamau', amount: 'KES 12,500', method: 'M-Pesa', status: 'success', statusLabel: 'Success', ref: 'TRF-448291' },
    { date: '26 Jun', beneficiary: 'Landlord Properties', amount: 'KES 45,000', method: 'Bank', status: 'success', statusLabel: 'Success', ref: 'TRF-447820' },
    { date: '25 Jun', beneficiary: 'James Ochieng', amount: 'KES 8,200', method: 'Internal', status: 'success', statusLabel: 'Success', ref: 'TRF-447103' },
    { date: '24 Jun', beneficiary: 'Equity Bank', amount: 'KES 120,000', method: 'Bank', status: 'pending', statusLabel: 'Pending', ref: 'TRF-446991' },
    { date: '23 Jun', beneficiary: 'Safaricom', amount: 'KES 1,500', method: 'M-Pesa', status: 'success', statusLabel: 'Success', ref: 'TRF-446450' },
  ],
  channels: [
    { name: 'M-Pesa', count: '612 transfers', total: 'KES 1.24M' },
    { name: 'Bank Transfer', count: '298 transfers', total: 'KES 892K' },
    { name: 'Internal Wallet', count: '187 transfers', total: 'KES 412K' },
    { name: 'International', count: '51 transfers', total: 'KES 296K' },
  ],
  favorites: [
    { name: 'Grace Kamau', account: '0712 345 890', type: 'M-Pesa', color: '#10B981' },
    { name: 'Landlord Properties', account: 'Bank 0012345678', type: 'Bank', color: '#3B82F6' },
    { name: 'James Ochieng', account: '0722 111 222', type: 'M-Pesa', color: '#10B981' },
    { name: 'Equity Bank', account: '0012345678', type: 'Bank', color: '#3B82F6' },
  ],
  scheduled: [
    { label: 'Rent', beneficiary: 'Landlord Properties', amount: 'KES 45,000', frequency: 'Monthly', nextRun: '01 Jul 2025', status: 'active' },
    { label: 'Salary advance', beneficiary: 'Grace Kamau', amount: 'KES 15,000', frequency: 'Bi-weekly', nextRun: '28 Jun 2025', status: 'active' },
    { label: 'Internet Bill', beneficiary: 'Safaricom Fibre', amount: 'KES 5,999', frequency: 'Monthly', nextRun: '01 Jul 2025', status: 'paused' },
  ],
  attention: [
    { icon: 'bi-exclamation-triangle', tone: 'danger', title: 'Scheduled transfer to landlord failed', sub: 'KES 35,000 · Insufficient funds', action: 'Retry', modal: 'retry' },
    { icon: 'bi-clock', tone: 'warn', title: '3 recurring payments need funding source update', sub: 'M-Pesa number changed', action: 'Update', modal: 'manageBeneficiaries' },
    { icon: 'bi-shield-exclamation', tone: 'info', title: 'Large transfer (KES 450,000) pending approval', sub: 'Requires 2FA confirmation', action: 'Approve', modal: 'initiate' },
  ],
  suggestions: [
    { icon: 'bi-lightning-charge', tone: 'success', title: 'Set up auto-pay for 4 recurring bills', sub: 'Save 3 hours/month', action: 'Setup', modal: 'schedule' },
    { icon: 'bi-people', tone: 'info', title: 'Add 6 frequent contacts as favorites', sub: 'Faster transfers', action: 'Add', modal: 'manageBeneficiaries' },
    { icon: 'bi-graph-up', tone: 'warn', title: 'Your rent transfer is due in 4 days', sub: 'KES 45,000 to Landlord', action: 'Pay Early', modal: 'initiate' },
  ],
  quickActions: [
    { icon: 'bi-send', tone: 'primary', label: 'Send Money', modal: 'initiate' },
    { icon: 'bi-collection', tone: 'info', label: 'Bulk Transfer', modal: 'bulk' },
    { icon: 'bi-calendar-event', tone: 'success', label: 'Schedule', modal: 'schedule' },
    { icon: 'bi-person-plus', tone: 'warn', label: 'Beneficiaries', modal: 'manageBeneficiaries' },
    { icon: 'bi-clock-history', tone: 'purple', label: 'History', modal: 'history' },
    { icon: 'bi-sliders', tone: 'success', label: 'Limits', modal: 'transferLimits' },
    { icon: 'bi-globe', tone: 'danger', label: 'International', modal: 'international' },
    { icon: 'bi-qr-code', tone: 'primary', label: 'QR Pay', modal: 'qrPay' },
  ],
  topRecipients: [
    { name: 'Grace Kamau', total: 'KES 187,500' },
    { name: 'Landlord Properties', total: 'KES 135,000' },
    { name: 'Equity Bank', total: 'KES 120,000' },
    { name: 'Safaricom', total: 'KES 42,000' },
  ],
  successByChannel: [
    { channel: 'M-Pesa', rate: '99.4%', tone: 'success' },
    { channel: 'Bank Transfer', rate: '97.8%', tone: 'success' },
    { channel: 'Internal', rate: '100%', tone: 'success' },
    { channel: 'International', rate: '94.1%', tone: 'warn' },
  ],
  trend: [
    { height: 55, color: '#60a5fa', label: 'Jan' },
    { height: 68, color: '#60a5fa', label: 'Feb' },
    { height: 82, color: '#fbbf24', label: 'Mar' },
    { height: 75, color: '#60a5fa', label: 'Apr' },
    { height: 90, color: '#2ee6a0', label: 'May' },
    { height: 100, color: '#60a5fa', label: 'Jun' },
  ],
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchTransferOverview(): Promise<TransferContent> {
  const response = await fetch('/api/transfer-overview', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Transfer overview API responded HTTP ${response.status}`);
  return response.json() as Promise<TransferContent>;
}

/* tone -> css class maps */
const toneIcon: Record<string, string> = {
  danger: s.toneDanger, warn: s.toneWarn, info: s.toneInfo, success: s.toneSuccess, purple: s.tonePurple,
};
const badgeTone: Record<string, string> = {
  success: s.badgeSuccess, warn: s.badgeWarn, info: s.badgeInfo, danger: s.badgeDanger, pending: s.badgeInfo,
};

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function TransferOverview() {
  /* ---------- TanStack Query ---------- */
  const { data, error, isLoading } = useQuery({
    queryKey: ['paymo-transfer-overview'],
    queryFn: fetchTransferOverview,
    staleTime: 60_000,
    retry: 1,
  });
  // shell content (for the user info in the profile modal + notifications)
  const { data: shellData } = useQuery({
    queryKey: ['paymo-shell-content'],
    queryFn: fetchShellContent,
    staleTime: 5 * 60_000,
  });

  // Falls back to mock data so the page never breaks.
  const content = data ?? transferMockData;
  const shell = shellData ?? initialMockData;

  const [activeModal, setActiveModal] = useState<ModalId | null>(null);
  const openModal = (id: ModalId) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <div className={s.pageRoot} style={{ position: 'relative' }}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.qLoading} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading transfer center…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.qError)} role="alert">
          <strong><i className="bi bi-exclamation-triangle me-2" />Transfer data unavailable</strong>
          <div className="small mt-1">
            <code>/api/transfer-overview</code> — {error.message}. Using bundled sample data.
          </div>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      {/* ---------- page bar ---------- */}
      <div className={s.pageBar}>
        <div>
          <div className={s.breadcrumb}>
            <a href="/app">Home</a> / <a href="/app/transfers">Transfers</a> / <strong>Command Center</strong>
          </div>
          <h2 className={s.pageTitle}>Transfer Overview Command Center</h2>
          <p className={s.pageCopy}>
            Initiate instant transfers, schedule recurring payments, manage beneficiaries, and monitor all money movement across M-Pesa, banks, and internal wallets.
          </p>
        </div>
        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
          <button className={s.btn} onClick={() => openModal('history')}><i className="bi bi-clock-history" /> History</button>
          <button className={s.btn} onClick={() => openModal('schedule')}><i className="bi bi-calendar-event" /> Schedule</button>
          <button className={cx(s.btn, s.btnPrimary)} onClick={() => openModal('initiate')}><i className="bi bi-send" /> Send Money</button>
        </div>
      </div>

      {/* ---------- HERO STATS ---------- */}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.85)' }}>
              Transfer center is live <span style={{ color: '#86efac' }}>●</span>
            </p>
            <div className={s.statValue} style={{ color: '#fff' }}>KES 2.84M transferred</div>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.85)' }}>
              This month across 1,248 transactions. 98.7% success rate.
            </p>
            <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
              <button className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal('initiate')}>Send</button>
              <button className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal('bulk')}>Bulk</button>
              <button className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal('schedule')}>Schedule</button>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-6">
          <div className={s.card} style={{ minHeight: 170 }}>
            <p className={s.statLabel} style={{ color: 'var(--tr-accent)' }}>COMPLETED</p>
            <div className={s.statValue}>1,189</div>
            <span className={cx(s.badge, s.badgeSuccess)}><i className="bi bi-check-circle" /> 98.7%</span>
            <div className={s.statSub}>Avg time: <strong>12 seconds</strong></div>
          </div>
        </div>
        <div className="col-lg-3 col-md-4 col-6">
          <div className={s.card} style={{ minHeight: 170 }}>
            <p className={s.statLabel} style={{ color: 'var(--tr-info)' }}>PENDING / SCHEDULED</p>
            <div className={s.statValue}>47</div>
            <span className={cx(s.badge, s.badgeInfo)}><i className="bi bi-clock" /> 32 today</span>
            <div className={s.statSub}>Next execution: <strong>Today 3:00 PM</strong></div>
          </div>
        </div>
        <div className="col-lg-3 col-md-4">
          <div className={cx(s.card, s.cardWarnEdge)} style={{ minHeight: 170 }}>
            <p className={s.statLabel} style={{ color: 'var(--tr-warning)' }}>FAILED / REJECTED</p>
            <div className={s.statValue}>12</div>
            <span className={cx(s.badge, s.badgeWarn)}><i className="bi bi-exclamation-triangle" /> 1.0%</span>
            <div className={s.statSub}>Most common: <strong>Insufficient funds</strong></div>
          </div>
        </div>
      </div>

      {/* ---------- ATTENTION / SUGGESTIONS / QUICK ACTIONS ---------- */}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className={s.card}>
            <div className={s.sectionHead}>
              <h3 className={s.sectionTitle}><i className="bi bi-bell" /> Attention Required</h3>
              <button className={cx(s.btn, s.btnSm)} onClick={() => openModal('attention')}>View all</button>
            </div>
            {content.attention.map((item) => (
              <div className={s.rowItem} key={item.title}>
                <div className={s.rowLead}>
                  <div className={cx(s.rowIcon, toneIcon[item.tone])}><i className={cx('bi', item.icon)} /></div>
                  <div>
                    <div className={s.rowTitle}>{item.title}</div>
                    <div className={s.rowSub}>{item.sub}</div>
                  </div>
                </div>
                <button className={cx(s.btn, s.btnSm)} onClick={() => openModal(item.modal)}>{item.action}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className={s.card}>
            <div className={s.sectionHead}>
              <h3 className={s.sectionTitle}><i className="bi bi-stars" /> Smart Suggestions</h3>
              <span className={cx(s.badge, s.badgePurple)}><i className="bi bi-stars" /> AI</span>
            </div>
            {content.suggestions.map((item) => (
              <div className={s.rowItem} key={item.title}>
                <div className={s.rowLead}>
                  <div className={cx(s.rowIcon, toneIcon[item.tone])}><i className={cx('bi', item.icon)} /></div>
                  <div>
                    <div className={s.rowTitle}>{item.title}</div>
                    <div className={s.rowSub}>{item.sub}</div>
                  </div>
                </div>
                <button className={cx(s.btn, s.btnSm)} onClick={() => openModal(item.modal)}>{item.action}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className={s.card}>
            <div style={{ marginBottom: 16 }}>
              <h3 className={s.sectionTitle}><i className="bi bi-lightning-charge" /> Quick Actions</h3>
              <p className={s.sectionSub}>Frequent transfer workflows</p>
            </div>
            <div className={s.quickGrid}>
              {content.quickActions.map((qa) => (
                <button key={qa.label} className={s.quickBtn} onClick={() => openModal(qa.modal)}>
                  <i className={cx('bi', qa.icon)} style={{ color: toneColor(qa.tone) }} /> {qa.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- OVERVIEW: recent + channels ---------- */}
      <div className={s.card}>
        <div className={s.sectionHead}>
          <div>
            <h3 className={s.sectionTitle}><i className="bi bi-speedometer2" /> Transfer Portfolio Overview</h3>
            <p className={s.sectionSub}>Real-time view of all transfer activity, success rates, and spending patterns.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button className={cx(s.btn, s.btnSm)} onClick={() => openModal('analytics')}><i className="bi bi-bar-chart" /> Analytics</button>
            <button className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal('initiate')}><i className="bi bi-plus-lg" /> New Transfer</button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-lg-8">
            <h4 className={s.blockHead}>Recent Transfers</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr><th>Date</th><th>Beneficiary</th><th>Amount</th><th>Method</th><th>Status</th><th>Ref</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {content.recentTransfers.map((t) => (
                    <tr key={t.ref}>
                      <td>{t.date}</td>
                      <td>{t.beneficiary}</td>
                      <td><strong>{t.amount}</strong></td>
                      <td>{t.method}</td>
                      <td><span className={cx(s.badge, badgeTone[t.status])}>{t.statusLabel}</span></td>
                      <td>{t.ref}</td>
                      <td>
                        <button className={cx(s.btn, s.btnSm)} onClick={() => openModal(t.status === 'pending' ? 'retry' : 'transferDetail')}>
                          {t.status === 'pending' ? 'Track' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-lg-4">
            <h4 className={s.blockHead}>Transfer Channels</h4>
            {content.channels.map((ch) => (
              <div className={s.rowItem} key={ch.name}>
                <div>
                  <strong>{ch.name}</strong>
                  <div className={s.rowSub}>{ch.count}</div>
                </div>
                <strong className={s.rowAmount}>{ch.total}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- FAVORITES & BENEFICIARIES ---------- */}
      <div className={s.card}>
        <div className={s.sectionHead}>
          <div>
            <h3 className={s.sectionTitle}><i className="bi bi-star-fill" style={{ color: 'var(--tr-warning)' }} /> Favorites & Frequent Beneficiaries</h3>
            <p className={s.sectionSub}>Quick-send to your most used recipients with one tap.</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <button className={cx(s.btn, s.btnSm)} onClick={() => openModal('manageBeneficiaries')}><i className="bi bi-gear" /> Manage</button>
            <button className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal('addBeneficiary')}><i className="bi bi-plus-lg" /> Add</button>
          </div>
        </div>
        <div className={s.favGrid}>
          {content.favorites.map((fav) => (
            <div className={s.favCard} key={fav.name} onClick={() => openModal('favoritesQuick')} role="button" tabIndex={0}>
              <div className={s.favLead}>
                <div className={s.favAvatar} style={{ background: fav.color }}><i className="bi bi-person" /></div>
                <div style={{ minWidth: 0 }}>
                  <div className={s.favName}>{fav.name}</div>
                  <div className={s.favAcc}>{fav.account}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- SCHEDULED & RECURRING ---------- */}
      <div className={s.card}>
        <div className={s.sectionHead}>
          <div>
            <h3 className={s.sectionTitle}><i className="bi bi-calendar-check" /> Scheduled & Recurring Transfers</h3>
            <p className={s.sectionSub}>Manage your automated payments and upcoming scheduled transfers.</p>
          </div>
          <button className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal('schedule')}><i className="bi bi-plus-lg" /> New Schedule</button>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr><th>Schedule</th><th>Beneficiary</th><th>Amount</th><th>Frequency</th><th>Next Run</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {content.scheduled.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.beneficiary}</td>
                  <td><strong>{row.amount}</strong></td>
                  <td>{row.frequency}</td>
                  <td>{row.nextRun}</td>
                  <td><span className={cx(s.badge, row.status === 'active' ? s.badgeSuccess : s.badgeWarn)}>{row.status === 'active' ? 'Active' : 'Paused'}</span></td>
                  <td><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('editSchedule')}>{row.status === 'active' ? 'Edit' : 'Resume'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- ANALYTICS SNAPSHOT ---------- */}
      <div className={s.card}>
        <div className={s.sectionHead}>
          <div>
            <h3 className={s.sectionTitle}><i className="bi bi-graph-up-arrow" style={{ color: 'var(--tr-info)' }} /> Transfer Analytics Snapshot</h3>
            <p className={s.sectionSub}>Spending patterns, success rates, and top recipients.</p>
          </div>
          <button className={cx(s.btn, s.btnSm)} onClick={() => openModal('analytics')}>Full Analytics</button>
        </div>
        <div className="row g-3">
          <div className="col-lg-4">
            <h4 className={s.blockHead}>Top Recipients (30 days)</h4>
            {content.topRecipients.map((r) => (
              <div className={s.rowItem} key={r.name}>
                <div><strong>{r.name}</strong></div>
                <strong className={s.rowAmount}>{r.total}</strong>
              </div>
            ))}
          </div>
          <div className="col-lg-4">
            <h4 className={s.blockHead}>Success Rate by Channel</h4>
            {content.successByChannel.map((r) => (
              <div className={s.rowItem} key={r.channel}>
                <div><strong>{r.channel}</strong></div>
                <span className={cx(s.badge, r.tone === 'success' ? s.badgeSuccess : s.badgeWarn)}>{r.rate}</span>
              </div>
            ))}
          </div>
          <div className="col-lg-4">
            <h4 className={s.blockHead}>Monthly Trend</h4>
            <div className={s.chartBars} style={{ marginTop: 12 }}>
              {content.trend.map((bar) => (
                <div className={s.chartBar} key={bar.label} style={{ height: `${bar.height}%`, background: bar.color }}>
                  <span className={s.barLabel}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ALL MODALS ---------- */}
      <TransferModals content={shell} active={activeModal} onClose={closeModal} />
    </div>
  );
}

/* helper: maps a quick-action tone string to a hex for the icon color */
function toneColor(tone: string): string {
  switch (tone) {
    case 'primary': return 'var(--tr-accent-2)';
    case 'info': return 'var(--tr-info)';
    case 'success': return 'var(--tr-accent)';
    case 'warn': return 'var(--tr-warning)';
    case 'danger': return 'var(--tr-danger)';
    case 'purple': return 'var(--tr-purple)';
    default: return 'var(--tr-accent-2)';
  }
}
