import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/bulk-disbursements.module.css'
import BulkDisbursementsModals from '../components/BulkDisbursementsModals'

/* ============================================================================
   PayMo BaaS — Bulk Disbursements (legacy page 3.5)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeDark'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; progress?: { percent: number; color: string }; miniBars?: { height: string; color: string }[] }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface BatchRow { id: string; type: string; recipients: number; amount: string; status: string; statusTone: BadgeTone; date: string; modal: string }
interface ActiveBatch { id: string; type: string; recipients: number; amount: string; status: string; statusTone: BadgeTone; progress: number; modal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface DisbursementsConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; current: string }
  pageTitle: string
  pageSub: string
  heroStats: HeroStat[]
  attentionItems: FeedItem[]
  quickActions: QuickAction[]
  batchHistory: BatchRow[]
  activeBatches: ActiveBatch[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: DisbursementsConfig = {
  nav: [
    { icon: 'bi-house', title: 'Dashboard' },
    { icon: 'bi-shop', title: 'Collections' },
    { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll' },
    { icon: 'bi-send', title: 'Disbursements', active: true, dot: true },
    { icon: 'bi-bar-chart-line', title: 'Analytics' },
    { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Safiri Operations Ltd',
  headerSub: 'PayBill 400192 · Disbursement Engine',
  searchPlaceholder: 'Search batches, recipients, templates, settlements...',
  user: { initials: 'SO', name: 'Sam O.', role: 'Operations Manager', avatarBg: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' },
  breadcrumb: { parent: 'Business Portal', current: 'Bulk Disbursements' },
  pageTitle: 'PAGE 3.5 — Bulk Disbursements',
  pageSub: 'Manage bulk payments, batch processing, float management, and disbursement analytics.',
  heroStats: [
    { key: 'engine', col: 'col-lg-4', label: 'Disbursement Engine Active', labelColor: 'rgba(255,255,255,.78)', value: 'KES 1.8M', badge: { icon: 'bi-check-circle', text: 'Processing', tone: 'badgeS' } },
    { key: 'queue', col: 'col-lg-2 col-md-4 col-6', label: 'BATCH QUEUE', labelColor: 'var(--pm-info)', value: '3 Pending', badge: { icon: 'bi-clock', text: '2 scheduled', tone: 'badgeI' }, miniBars: [{ height: '40%', color: 'var(--pm-info)' }, { height: '70%', color: 'var(--pm-primary)' }, { height: '50%', color: 'var(--pm-accent)' }] },
    { key: 'success', col: 'col-lg-3 col-md-4 col-6', label: 'SUCCESS RATE', labelColor: 'var(--pm-accent)', value: '97.8%', badge: { icon: 'bi-check-circle', text: '118 successful', tone: 'badgeS' }, progress: { percent: 97.8, color: 'var(--pm-accent)' } },
    { key: 'float', col: 'col-lg-3 col-md-4', label: 'FLOAT MANAGEMENT', labelColor: 'var(--pm-warning)', value: 'KES 14.2M', badge: { icon: 'bi-bank', text: 'Buffer OK', tone: 'badgeW' }, progress: { percent: 60, color: 'var(--pm-warning)' } },
  ],
  attentionItems: [
    { icon: 'bi-check-circle', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Approval Needed: BTH-9922', sub: 'Emergency Relief batch · KES 450,000 · 120 recipients', btnLabel: 'Review', modal: 'approvalModal' },
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: '2 Invalid Accounts Detected', sub: 'Bank account length mismatch · Batch BTH-9920', btnLabel: 'Fix', btnClass: 'btnPmD', modal: 'recipientValidationModal' },
    { icon: 'bi-bank', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Low Float Warning', sub: 'Scheduled batches exceed current KES 14.2M float', btnLabel: 'Top-up', modal: 'fundWalletModal' },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-primary)', label: 'New Batch', modal: 'newDisbursementModal' },
    { icon: 'bi-calendar-plus', iconColor: 'var(--pm-info)', label: 'Schedule', modal: 'scheduleBatchModal' },
    { icon: 'bi-people', iconColor: 'var(--pm-accent)', label: 'Salary', modal: 'newDisbursementModal' },
    { icon: 'bi-shop', iconColor: 'var(--pm-purple)', label: 'Vendor Pay', modal: 'newDisbursementModal' },
    { icon: 'bi-exclamation-triangle', iconColor: 'var(--pm-danger)', label: 'Emergency', modal: 'emergencyDisbursementModal' },
    { icon: 'bi-wallet2', iconColor: 'var(--pm-warning)', label: 'Float Top-up', modal: 'fundWalletModal' },
    { icon: 'bi-clock-history', iconColor: 'var(--pm-muted)', label: 'Audit Trail', modal: 'auditTrailModal' },
    { icon: 'bi-file-earmark-text', iconColor: 'var(--pm-primary)', label: 'Templates', modal: 'templateLibraryModal' },
  ],
  batchHistory: [
    { id: 'BTH-9920', type: 'Salary', recipients: 118, amount: 'KES 1,180,000', status: 'Completed', statusTone: 'badgeS', date: '25 Jun 2025', modal: 'batchDetailModal' },
    { id: 'BTH-9919', type: 'Vendor', recipients: 42, amount: 'KES 620,000', status: 'Completed', statusTone: 'badgeS', date: '22 Jun 2025', modal: 'batchDetailModal' },
    { id: 'BTH-9918', type: 'Emergency', recipients: 25, amount: 'KES 375,000', status: 'Completed', statusTone: 'badgeS', date: '20 Jun 2025', modal: 'batchDetailModal' },
    { id: 'BTH-9917', type: 'Salary', recipients: 115, amount: 'KES 1,150,000', status: 'Completed', statusTone: 'badgeS', date: '28 May 2025', modal: 'batchDetailModal' },
  ],
  activeBatches: [
    { id: 'BTH-9921', type: 'Vendor', recipients: 38, amount: 'KES 380,000', status: 'Processing', statusTone: 'badgeI', progress: 65, modal: 'batchDetailModal' },
    { id: 'BTH-9922', type: 'Emergency', recipients: 120, amount: 'KES 450,000', status: 'Awaiting Approval', statusTone: 'badgeW', progress: 0, modal: 'approvalModal' },
    { id: 'BTH-9923', type: 'Scheduled', recipients: 50, amount: 'KES 500,000', status: 'Scheduled', statusTone: 'badgeP', progress: 0, modal: 'batchDetailModal' },
  ],
}

/* ---------- TanStack Query fetcher ---------- */
async function fetchDisbursementsData(): Promise<DisbursementsConfig> {
  const res = await fetch('/api/business-dashboard/bulk-disbursements')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function BulkDisbursements() {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData } = useQuery({
    queryKey: ['bulk-disbursements'],
    queryFn: fetchDisbursementsData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const config = apiData ?? initialMockData

  return (
    <div className={cx(s.bizPage, 'container-fluid')}>
      {/* CONTENT */}
      <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            {config.heroStats.map((hs) => (
              <div key={hs.key} className={hs.col}>
                <div className={cx(s.card, hs.key === 'engine' ? s.cardAccent : '')} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(hs.key === 'engine' ? 'batchHistoryModal' : hs.key === 'float' ? 'floatManagementModal' : 'batchDetailModal')}>
                  <div className={s.sl} style={hs.labelColor ? { color: hs.labelColor } : {}}>{hs.label}</div>
                  <div className={s.sv}>{hs.value}</div>
                  {hs.badge && <span className={cx(s.badge, s[hs.badge.tone])}><i className={`bi ${hs.badge.icon}`} /> {hs.badge.text}</span>}
                  {hs.progress && <div className={s.progress}><div className={s.progressBar} style={{ width: `${hs.progress.percent}%`, background: hs.progress.color }} /></div>}
                  {hs.miniBars && <div className={s.miniBars}>{hs.miniBars.map((mb, i) => <div key={i} className={s.miniBar} style={{ height: mb.height, background: mb.color }} />)}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION */}
          <div className={s.card}>
            <h3 className={cx(s.st, 'text-danger')}><i className="bi bi-exclamation-triangle" style={{ color: 'var(--pm-danger)' }} /> Attention Required</h3>
            {config.attentionItems.map((ai) => (
              <div key={ai.title} className={s.feedItem}>
                <div className={s.iconCircle} style={{ background: ai.iconBg, color: ai.iconColor }}><i className={`bi ${ai.icon}`} /></div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ai.title}</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{ai.sub}</div></div>
                <button className={cx(s.btnPm, s.btnSm, ai.btnClass ? s[ai.btnClass] : '')} onClick={() => setActiveModal(ai.modal)}>{ai.btnLabel}</button>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className={s.card}>
            <h3 className={s.st}><i className="bi bi-grid-3x3-gap" style={{ color: 'var(--pm-primary)' }} /> Quick Actions</h3>
            <div className={s.quickGrid}>
              {config.quickActions.map((qa) => (
                <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                  <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE BATCHES */}
          <div className={s.card}>
            <h3 className={cx(s.st, 'text-info')}><i className="bi bi-play-circle" style={{ color: 'var(--pm-info)' }} /> Active Batches</h3>
            <div className="row g-3">
              {config.activeBatches.map((ab) => (
                <div key={ab.id} className="col-lg-4 col-md-6">
                  <div className={cx(s.card)} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(ab.modal)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong style={{ fontSize: 13 }}>{ab.id}</strong>
                      <span className={cx(s.badge, s[ab.statusTone])}>{ab.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{ab.type} · {ab.recipients} recipients · {ab.amount}</div>
                    {ab.progress > 0 && <div className={s.progress}><div className={s.progressBar} style={{ width: `${ab.progress}%`, background: 'var(--pm-info)' }} /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BATCH HISTORY */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={s.st}><i className="bi bi-clock-history" style={{ color: 'var(--pm-primary)' }} /> Batch History</h3>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('batchHistoryModal')}><i className="bi bi-list" /> View All</button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Batch ID</th><th>Type</th><th>Recipients</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.batchHistory.map((bh) => (
                    <tr key={bh.id}>
                      <td><strong>{bh.id}</strong></td>
                      <td>{bh.type}</td>
                      <td>{bh.recipients}</td>
                      <td>{bh.amount}</td>
                      <td>{bh.date}</td>
                      <td><span className={cx(s.badge, s[bh.statusTone])}>{bh.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(bh.modal)}>Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* MODALS */}
      <BulkDisbursementsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
