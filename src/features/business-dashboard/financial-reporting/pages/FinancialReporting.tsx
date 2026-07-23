import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/financial-reporting.module.css'
import FinancialReportingModals from '../components/FinancialReportingModals'

/* ============================================================================
   PayMo BaaS — Financial Reporting, Audit & Analytics (legacy page 3.8)
   React + TypeScript + TanStack Query, cream + indigo/emerald dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeDark'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; progress?: { percent: number; color: string }; miniBars?: { height: string; color: string }[]; extra?: { label: string; value: string }[]; accentButtons?: { label: string; icon: string; modal: string }[] }
interface FeedItem { icon: string; iconBg: string; iconColor: string; initials?: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface ReportRow { name: string; type: string; generatedBy: string; date: string; format: string; modal: string }
interface AuditRow { timestamp: string; user: string; action: string; ip: string; status: string; statusTone: BadgeTone; modal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface FRConfig {
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
  insightItems: FeedItem[]
  quickActions: QuickAction[]
  reports: ReportRow[]
  auditLogs: AuditRow[]
}

const initialMockData: FRConfig = {
  nav: [
    { icon: 'bi-speedometer2', title: 'Command Center' },
    { icon: 'bi-wallet2', title: 'Collections' },
    { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll' },
    { icon: 'bi-send-check', title: 'Bulk Pay' },
    { icon: 'bi-bar-chart-line', title: 'Reporting & Audit', active: true, dot: true },
    { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Financial Reporting & Analytics',
  headerSub: 'Audit trails, standard reports, business intelligence & tax readiness',
  searchPlaceholder: 'Search reports, audit logs, transactions, metrics...',
  user: { initials: 'TG', name: 'Titus G.', role: 'Finance Director', avatarBg: 'linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)' },
  breadcrumb: { parent: 'Business Portal', current: 'Financial Reporting, Audit & Analytics' },
  pageTitle: 'PAGE 3.8 — Financial Reporting, Audit & Analytics',
  pageSub: 'Generate compliance-ready financial statements, drill down into BI metrics, review immutable audit trails, and prepare statutory KRA/NSSF tax extracts.',
  heroStats: [
    { key: 'liquidity', col: 'col-lg-4', label: 'LIQUIDITY POSITION', labelColor: 'rgba(255,255,255,.78)', value: 'KES 12,450,800', badge: { icon: 'bi-check-circle', text: 'Consolidated', tone: 'badgeS' }, accentButtons: [{ label: 'Forecast', icon: 'bi-graph-up', modal: 'cashFlowForecastModal' }, { label: 'Statements', icon: 'bi-download', modal: 'downloadStatementModal' }] },
    { key: 'revenue', col: 'col-lg-2 col-md-4 col-6', label: 'YTD REVENUE', labelColor: 'var(--pm-primary)', value: 'KES 48.2M', badge: { icon: 'bi-graph-up-arrow', text: '14% YoY', tone: 'badgeS' }, miniBars: [{ height: '45%', color: 'var(--pm-primary)' }, { height: '55%', color: 'var(--pm-info)' }, { height: '62%', color: 'var(--pm-primary)' }, { height: '75%', color: 'var(--pm-info)' }, { height: '88%', color: 'var(--pm-primary)' }, { height: '95%', color: 'var(--pm-accent)' }] },
    { key: 'recon', col: 'col-lg-3 col-md-4 col-6', label: 'PENDING RECONCILIATIONS', labelColor: 'var(--pm-warning)', value: '4 Items', badge: { icon: 'bi-exclamation-triangle', text: 'Action Required', tone: 'badgeW' }, progress: { percent: 12, color: 'var(--pm-warning)' }, extra: [{ label: 'Amount unmatched', value: 'KES 142,500' }] },
    { key: 'compliance', col: 'col-lg-3 col-md-4', label: 'COMPLIANCE & AUDIT SCORE', labelColor: 'var(--pm-accent)', value: '98 / 100', badge: { icon: 'bi-shield-check', text: 'Audit Ready', tone: 'badgeS' }, extra: [{ label: 'Next KRA VAT Due', value: '20 Jul 2025' }, { label: 'e-TIMS invoices matched', value: '100%' }] },
  ],
  attentionItems: [
    { icon: 'bi-exclamation-triangle', initials: 'RC', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '4 Unmatched Bank Deposits', sub: 'Totaling KES 142,500 · Require manual allocation', btnLabel: 'Match', modal: 'reconciliationExceptionsModal' },
    { icon: 'bi-bank', initials: 'TX', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'PAYE Return (P10) Due Soon', sub: 'Due in 3 days · KES 450,200 pending extract', btnLabel: 'Extract', btnClass: 'btnPmP', modal: 'statutoryDeductionsModal' },
    { icon: 'bi-person-lock', initials: 'AU', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Auditor access expiring', sub: 'KPMG Audit Team · Expires in 48 hrs', btnLabel: 'Extend', modal: 'inviteAuditorModal' },
  ],
  insightItems: [
    { icon: 'bi-stars', initials: 'CS', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Top 5 clients driving 62% of revenue', sub: 'High concentration risk identified', btnLabel: 'Analyze', modal: 'customerSpendAnalyticsModal' },
    { icon: 'bi-graph-up-arrow', initials: 'EX', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Software subscriptions up 18%', sub: 'Unused SaaS licenses detected', btnLabel: 'Review', modal: 'vendorExpenseAnalyticsModal' },
    { icon: 'bi-cash-stack', initials: 'CF', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Cash flow dip predicted next Friday', sub: 'Payroll + supplier runs overlap', btnLabel: 'Forecast', modal: 'cashFlowForecastModal' },
  ],
  quickActions: [
    { icon: 'bi-file-earmark-plus', iconColor: 'var(--pm-primary)', label: 'Custom Report', modal: 'generateCustomReportModal' },
    { icon: 'bi-calendar2-check', iconColor: 'var(--pm-accent)', label: 'Month-End', modal: 'runMonthEndModal' },
    { icon: 'bi-bank', iconColor: 'var(--pm-warning)', label: 'KRA VAT Extract', modal: 'exportKRAVATModal' },
    { icon: 'bi-shield-lock', iconColor: 'var(--pm-purple)', label: 'Audit Trail', modal: 'viewAuditLogModal' },
    { icon: 'bi-graph-up-arrow', iconColor: 'var(--pm-info)', label: 'P&L Snapshot', modal: 'plSnapshotModal' },
    { icon: 'bi-file-spreadsheet', iconColor: 'var(--pm-danger)', label: 'Trial Balance', modal: 'exportTrialBalanceModal' },
    { icon: 'bi-receipt', iconColor: 'var(--pm-muted)', label: 'e-TIMS Recon', modal: 'eTimsReconciliationModal' },
    { icon: 'bi-sliders', iconColor: 'var(--pm-primary)', label: 'Dashboards', modal: 'configureDashboardsModal' },
  ],
  reports: [
    { name: 'Q2 Income Statement', type: 'Financial', generatedBy: 'Titus G.', date: '28 Jun 2025', format: 'PDF', modal: 'downloadStatementModal' },
    { name: 'May Payroll Extract', type: 'Operational', generatedBy: 'System (Auto)', date: '01 Jun 2025', format: 'CSV', modal: 'downloadStatementModal' },
    { name: 'Trial Balance (YTD)', type: 'Financial', generatedBy: 'Grace M.', date: '15 Jun 2025', format: 'Excel', modal: 'exportTrialBalanceModal' },
    { name: 'Supplier Aging Summary', type: 'Operational', generatedBy: 'Titus G.', date: '10 Jun 2025', format: 'PDF', modal: 'downloadStatementModal' },
  ],
  auditLogs: [
    { timestamp: '28 Jun, 14:32:01', user: 'Titus G. (Admin)', action: 'Approved Bulk Disbursement (ID: 9921)', ip: '197.232.14.8', status: 'Success', statusTone: 'badgeS', modal: 'userActivityLogModal' },
    { timestamp: '28 Jun, 10:15:44', user: 'System Automation', action: 'Generated VAT Extract (June)', ip: 'Internal', status: 'Success', statusTone: 'badgeS', modal: 'userActivityLogModal' },
    { timestamp: '27 Jun, 16:45:12', user: 'Grace M. (Finance)', action: 'Initiated Payroll Run (June)', ip: '197.232.14.8', status: 'Pending Approval', statusTone: 'badgeI', modal: 'userActivityLogModal' },
    { timestamp: '27 Jun, 09:12:33', user: 'James K. (Sales)', action: 'Voided Invoice #INV-2041', ip: '105.161.88.2', status: 'Logged', statusTone: 'badgeW', modal: 'disputeAuditModal' },
    { timestamp: '26 Jun, 23:55:01', user: 'System Automation', action: 'Daily EOD Ledger Lock', ip: 'Internal', status: 'Success', statusTone: 'badgeS', modal: 'userActivityLogModal' },
  ],
}

async function fetchFRData(): Promise<FRConfig> {
  const res = await fetch('/api/business-dashboard/financial-reporting')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function FinancialReporting() {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const { data: apiData } = useQuery({ queryKey: ['financial-reporting'], queryFn: fetchFRData, staleTime: 5 * 60 * 1000, retry: 1 })
  const config = apiData ?? initialMockData

  return (
    <div className={s.bizPage}>
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}>P</div>
        <nav className={s.sidebarNav}>
          {config.nav.map((n) => (
            <button key={n.title} className={`${s.navItem} ${n.active ? s.navItemActive : ''}`} title={n.title}>
              <i className={`bi ${n.icon}`} />{n.dot && <span className={s.badgeDot} />}
            </button>
          ))}
        </nav>
      </aside>

      <div className={s.main}>
        <header className={s.header}>
          <div className={s.headerTitle}>
            <div className="d-flex align-items-center gap-2">
              <div className={s.avatar} style={{ width: 36, height: 36, fontSize: 13, background: config.user.avatarBg }}>{config.user.initials}</div>
              <div><h1>{config.headerTitle}</h1><p>{config.headerSub}</p></div>
            </div>
          </div>
          <div className={s.headerSearch}><i className="bi bi-search" /><input type="text" placeholder={config.searchPlaceholder} /></div>
          <div className={s.headerActions}>
            <button className={s.headerBtn} onClick={() => setActiveModal('taxReadinessModal')} title="Tax Readiness"><i className="bi bi-bank" /><span className={s.counter}>2</span></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('reconciliationExceptionsModal')} title="Exceptions"><i className="bi bi-exclamation-triangle" /><span className={s.counter} style={{ background: 'var(--pm-warning)' }}>4</span></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('reportDeliverySettingsModal')} title="Report Settings"><i className="bi bi-sliders" /></button>
            <button className={s.profileBtn} onClick={() => setActiveModal('profileModal')}>
              <div className={s.avatar} style={{ background: config.user.avatarBg }}>{config.user.initials}</div>
              <div><div className={s.profileName}>{config.user.name}</div><div className={s.profileRole}>{config.user.role}</div></div>
            </button>
          </div>
        </header>

        <div className={s.pageBar}>
          <div>
            <div className={s.breadcrumb}><a href="#">Home</a> / <a href="#">{config.breadcrumb.parent}</a> / <strong>{config.breadcrumb.current}</strong></div>
            <h2 className={s.pageH2}>{config.pageTitle}</h2>
            <p className={s.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('inviteAuditorModal')}><i className="bi bi-person-lock" /> Auditor Access</button>
            <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('runMonthEndModal')}><i className="bi bi-calendar2-check" /> Month-End Close</button>
            <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('generateCustomReportModal')}><i className="bi bi-file-earmark-plus" /> Create Report</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">
            {config.heroStats.map((hs) => (
              <div key={hs.key} className={hs.col}>
                <div className={cx(s.card, hs.key === 'liquidity' ? s.cardAccent : '')} style={{ minHeight: 170, ...(hs.key === 'compliance' ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}>
                  <div className={s.sl} style={hs.labelColor ? { color: hs.labelColor } : {}}>{hs.label}</div>
                  <div className={s.sv} style={{ margin: '6px 0', ...(hs.key === 'liquidity' ? { color: '#fff' } : {}) }}>{hs.value}</div>
                  {hs.badge && <span className={cx(s.badge, s[hs.badge.tone])}><i className={`bi ${hs.badge.icon}`} /> {hs.badge.text}</span>}
                  {hs.progress && <div className={s.progress}><div className={s.progressBar} style={{ width: `${hs.progress.percent}%`, background: hs.progress.color }} /></div>}
                  {hs.miniBars && <div className={cx(s.miniBars, 'mt-3')}>{hs.miniBars.map((mb, i) => <div key={i} className={s.miniBar} style={{ height: mb.height, background: mb.color }} />)}</div>}
                  {hs.extra && <div className="mt-2" style={{ fontSize: 12, ...(hs.key === 'liquidity' ? { color: 'rgba(255,255,255,.78)' } : { color: 'var(--pm-ink-soft)' }) }}>{hs.extra.map((e) => <div key={e.label}>{e.label}: <strong>{e.value}</strong></div>)}</div>}
                  {hs.accentButtons && <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>{hs.accentButtons.map((ab) => <button key={ab.label} className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal(ab.modal)}><i className={`bi ${ab.icon}`} /> {ab.label}</button>)}</div>}
                  {hs.key === 'liquidity' && <p style={{ margin: '0 0 8px', fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Consolidated across PayMo Wallet, PesaLink buffers, and M-Pesa Tills.</p>}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION + INSIGHTS + QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.st}>Attention Required</h3><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('reconciliationExceptionsModal')}>View all</button></div>
                {config.attentionItems.map((ai) => (
                  <div key={ai.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: ai.iconBg, color: ai.iconColor, fontSize: 12 }}>{ai.initials}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ai.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{ai.sub}</div></div>
                    <button className={cx(s.btnPm, s.btnSm, ai.btnClass ? s[ai.btnClass] : '')} onClick={() => setActiveModal(ai.modal)}>{ai.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.st}>Smart BI Insights</h3><span className={cx(s.badge, s.badgeP)}><i className="bi bi-stars" /> AI</span></div>
                {config.insightItems.map((ii) => (
                  <div key={ii.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: ii.iconBg, color: ii.iconColor, fontSize: 12 }}>{ii.initials}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ii.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{ii.sub}</div></div>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(ii.modal)}>{ii.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3"><h3 className={s.st}>Quick Actions</h3><p className={s.ss}>Frequent reporting and audit workflows</p></div>
                <div className={s.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                      <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />{qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3.8.1 Real-Time Financial Dashboards & Cash Flow */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={cx(s.st, 'text-accent')}><i className="bi bi-cash-stack" style={{ color: 'var(--pm-accent)' }} /> 3.8.1 — Real-Time Financial Dashboards & Cash Flow</h3><p className={s.ss}>Monitor liquidity, inbound vs outbound cash movements, and quick P&L snapshots.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('cashFlowForecastModal')}><i className="bi bi-graph-up" /> Full Forecast</button><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('plSnapshotModal')}><i className="bi bi-file-bar-graph" /> P&L View</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div style={{ background: 'var(--pm-surface-2)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>30-Day Cash Movement (In vs Out)</h4><select className={cx(s.formControl, s.btnSm)} style={{ width: 'auto' }}><option>Last 30 Days</option><option>This Quarter</option></select></div>
                  <div className="d-flex align-items-end" style={{ height: 160, gap: 8 }}>
                    {[{ in: '40%', out: '25%', lbl: 'W1' }, { in: '65%', out: '80%', lbl: 'W2' }, { in: '90%', out: '35%', lbl: 'W3' }, { in: '55%', out: '45%', lbl: 'W4' }].map((wk, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', gap: 2, height: '100%' }}>
                        <div style={{ flex: 1, borderRadius: '5px 5px 0 0', background: 'var(--pm-accent)', height: wk.in, position: 'relative', minWidth: 18 }} title={`In: KES`}><span style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--pm-muted)' }}>{wk.lbl}</span></div>
                        <div style={{ flex: 1, borderRadius: '5px 5px 0 0', background: 'var(--pm-danger)', height: wk.out, minWidth: 18 }} title={`Out: KES`} />
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-center mt-3" style={{ gap: 16, fontSize: 12 }}>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pm-accent)', borderRadius: 2, marginRight: 4 }} />Cash Inflow</span>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pm-danger)', borderRadius: 2, marginRight: 4 }} />Cash Outflow</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div style={{ background: 'var(--pm-surface-2)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Liquidity Breakdown</h4>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: '8px solid var(--pm-primary)', borderRightColor: 'var(--pm-info)', borderBottomColor: 'var(--pm-warning)', transform: 'rotate(45deg)', marginRight: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span><span style={{ color: 'var(--pm-primary)' }}>●</span> PayMo Wallet</span><strong>KES 8.2M</strong></div>
                      <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span><span style={{ color: 'var(--pm-info)' }}>●</span> Equity Bank</span><strong>KES 3.1M</strong></div>
                      <div className="d-flex justify-content-between" style={{ fontSize: 12 }}><span><span style={{ color: 'var(--pm-warning)' }}>●</span> M-Pesa Tills</span><strong>KES 1.15M</strong></div>
                    </div>
                  </div>
                  <hr className={s.divider} />
                  <div className="d-flex justify-content-between align-items-center" style={{ fontSize: 13 }}><span style={{ color: 'var(--pm-muted)' }}>Working Capital Ratio</span><strong style={{ color: 'var(--pm-accent)', fontSize: 16 }}>2.4x</strong></div>
                  <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: 13 }}><span style={{ color: 'var(--pm-muted)' }}>Burn Rate (Monthly)</span><strong>KES 4.2M</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3.8.2 Standard & Custom Reporting Engine */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={cx(s.st, 'text-info')}><i className="bi bi-file-earmark-bar-graph" style={{ color: 'var(--pm-info)' }} /> 3.8.2 — Standard & Custom Reporting Engine</h3><p className={s.ss}>Generate, schedule, and export standard accounting reports and custom operational data extracts.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('scheduleReportModal')}><i className="bi bi-clock" /> Scheduled</button><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('generateCustomReportModal')}><i className="bi bi-plus-lg" /> New Report</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="table-responsive">
                  <table className={s.tbl}>
                    <thead><tr><th>Report Name</th><th>Type</th><th>Generated By</th><th>Date</th><th>Format</th><th>Action</th></tr></thead>
                    <tbody>
                      {config.reports.map((r) => (
                        <tr key={r.name}><td>{r.name}</td><td>{r.type}</td><td>{r.generatedBy}</td><td>{r.date}</td><td>{r.format}</td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(r.modal)}>{r.modal === 'exportTrialBalanceModal' ? 'View' : 'Download'}</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-lg-4">
                <div style={{ background: 'var(--pm-bg)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase', color: 'var(--pm-muted)' }}>Saved Templates</h4>
                  {[
                    { icon: 'bi-journal-text', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-primary)', name: 'Trial Balance', sub: 'Standard GL extract', modal: 'exportTrialBalanceModal' },
                    { icon: 'bi-graph-up', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', name: 'Profit & Loss', sub: 'Income statement', modal: 'plSnapshotModal' },
                    { icon: 'bi-shield-check', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', name: 'Statutory Deductions', sub: 'PAYE, NSSF, SHIF', modal: 'statutoryDeductionsModal' },
                  ].map((t) => (
                    <div key={t.name} className="mb-2" style={{ padding: 14, border: '1px solid var(--pm-border)', borderRadius: 'var(--pm-r-md)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s' }} onClick={() => setActiveModal(t.modal)}>
                      <div className={s.iconCircle} style={{ background: t.iconBg, color: t.iconColor, fontSize: 12 }}><i className={`bi ${t.icon}`} /></div>
                      <div style={{ flex: 1 }}><strong style={{ fontSize: 13 }}>{t.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{t.sub}</div></div>
                      <i className="bi bi-chevron-right" style={{ color: 'var(--pm-muted)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3.8.3 Tax, Statutory & Compliance Reporting */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={cx(s.st, 'text-warning')}><i className="bi bi-bank" style={{ color: 'var(--pm-warning)' }} /> 3.8.3 — Tax, Statutory & Compliance Reporting</h3><p className={s.ss}>Prepare KRA iTax reports, e-TIMS reconciliations, and view your business compliance score.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('eTimsReconciliationModal')}><i className="bi bi-receipt" /> e-TIMS Check</button><button className={cx(s.btnPm, s.btnSm)} style={{ background: 'var(--pm-warning)', color: '#fff', borderColor: 'var(--pm-warning)' }} onClick={() => setActiveModal('exportKRAVATModal')}><i className="bi bi-download" /> KRA Extract</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div style={{ background: 'var(--pm-accent-soft)', border: '1px solid var(--pm-accent)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <div className="d-flex justify-content-between align-items-start mb-2"><div><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#047857' }}>VAT Return (June 2025)</h4><div style={{ fontSize: 12, color: '#065F46' }}>Due 20 Jul 2025</div></div><i className="bi bi-check-circle-fill" style={{ fontSize: 20, color: 'var(--pm-accent)' }} /></div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-accent)', margin: '12px 0' }}>KES 840,500</div>
                  <div style={{ fontSize: 12, color: '#065F46' }}>Output VAT: KES 1.2M<br />Input VAT: KES 359.5K</div>
                  <button className={cx(s.btnPm, s.btnSm, 'w-100 mt-3')} onClick={() => setActiveModal('exportKRAVATModal')}>Download CSV for iTax</button>
                </div>
              </div>
              <div className="col-lg-4">
                <div style={{ background: 'var(--pm-warning-soft)', border: '1px solid var(--pm-warning)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <div className="d-flex justify-content-between align-items-start mb-2"><div><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#B45309' }}>PAYE Return (June)</h4><div style={{ fontSize: 12, color: '#92400E' }}>Due 09 Jul 2025</div></div><i className="bi bi-exclamation-circle-fill" style={{ fontSize: 20, color: 'var(--pm-warning)' }} /></div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)', margin: '12px 0' }}>KES 450,200</div>
                  <div style={{ fontSize: 12, color: '#92400E' }}>Employees: 42<br />Status: Awaiting Payroll Lock</div>
                  <button className={cx(s.btnPm, s.btnSm, 'w-100 mt-3')} onClick={() => setActiveModal('statutoryDeductionsModal')}>View Payroll Extract</button>
                </div>
              </div>
              <div className="col-lg-4">
                <div style={{ background: 'var(--pm-surface-2)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Compliance Health</h4>
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span>e-TIMS invoices</span><span style={{ color: 'var(--pm-accent)', fontWeight: 700 }}>100% Matched</span></div>
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span>Withholding Tax (WHT)</span><span style={{ color: 'var(--pm-accent)', fontWeight: 700 }}>Up to date</span></div>
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span>CR12 Annual Returns</span><span style={{ color: 'var(--pm-warning)', fontWeight: 700 }}>Due in 45 days</span></div>
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: 12 }}><span>County Business Permit</span><span style={{ color: 'var(--pm-accent)', fontWeight: 700 }}>Valid (2025)</span></div>
                  <button className={cx(s.btnPm, s.btnSm, 'w-100 mt-2')} onClick={() => setActiveModal('taxReadinessModal')}>Full Health Check</button>
                </div>
              </div>
            </div>
          </div>

          {/* 3.8.4 Audit Trails, Logs & Access Control */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={cx(s.st, 'text-purple')}><i className="bi bi-shield-lock" style={{ color: 'var(--pm-purple)' }} /> 3.8.4 — Audit Trails, Logs & Access Control</h3><p className={s.ss}>Immutable transaction logs, user activity tracking, and external auditor portal access.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('inviteAuditorModal')}><i className="bi bi-person-plus" /> Invite Auditor</button><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('viewAuditLogModal')}><i className="bi bi-search" /> Search Logs</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table className={s.tbl}>
                    <thead><tr><th>Timestamp (EAT)</th><th>User / System</th><th>Action</th><th>IP Address</th><th>Status</th><th>View</th></tr></thead>
                    <tbody>
                      {config.auditLogs.map((al) => (
                        <tr key={al.timestamp}>
                          <td>{al.timestamp}</td><td>{al.user}</td><td>{al.action}</td><td>{al.ip}</td>
                          <td><span className={cx(s.badge, s[al.statusTone])}>{al.status}</span></td>
                          <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(al.modal)}><i className="bi bi-eye" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-lg-4">
                <div style={{ background: 'var(--pm-surface-2)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Auditor Access</h4>
                  <div className={s.statusRow}><div><strong>KPMG Kenya Team</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Read-only · Financials + Logs</div></div><span className={cx(s.badge, s.badgeW)}>Exp. 48h</span></div>
                  <div className={s.statusRow}><div><strong>KRA Compliance Officer</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>e-TIMS & VAT Scope only</div></div><span className={cx(s.badge, s.badgeS)}>Active</span></div>
                  <button className={cx(s.btnPm, s.btnSm, 'w-100 mt-3')} onClick={() => setActiveModal('inviteAuditorModal')}><i className="bi bi-plus" /> Grant New Access</button>
                </div>
              </div>
            </div>
          </div>

          {/* 3.8.5 Business Intelligence & Advanced Analytics */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={cx(s.st, 'text-primary')}><i className="bi bi-pie-chart" style={{ color: 'var(--pm-primary)' }} /> 3.8.5 — Business Intelligence & Advanced Analytics</h3><p className={s.ss}>Deep dive into customer spending, vendor expenses, branch performance, and financial health.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('branchPerformanceModal')}><i className="bi bi-shop" /> Branches</button><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('financialHealthScoreModal')}><i className="bi bi-heart-pulse" /> Health Score</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div style={{ background: 'var(--pm-surface-2)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Top Customers (By Revenue YTD)</h4><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('customerSpendAnalyticsModal')}>Analyze</button></div>
                  {[
                    { name: 'Acme Corp Ltd', amount: 'KES 12.5M', pct: 100 },
                    { name: 'TechFlow Solutions', amount: 'KES 8.2M', pct: 65 },
                    { name: 'Global Logistics Ke', amount: 'KES 5.4M', pct: 42 },
                    { name: 'City Retail Chain', amount: 'KES 3.1M', pct: 25 },
                  ].map((c) => (
                    <div key={c.name} className="mb-2">
                      <div className="d-flex justify-content-between" style={{ fontSize: 12, marginBottom: 2 }}><span>{c.name}</span><strong>{c.amount}</strong></div>
                      <div className={s.progress}><div className={s.progressBar} style={{ width: `${c.pct}%`, background: 'var(--pm-primary)' }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div style={{ background: 'var(--pm-surface-2)', borderRadius: 'var(--pm-r-md)', padding: 16 }}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Top Expense Categories (YTD)</h4><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('vendorExpenseAnalyticsModal')}>Analyze</button></div>
                  {[
                    { name: 'Payroll & Benefits', amount: 'KES 18.2M', pct: 100, color: 'var(--pm-danger)' },
                    { name: 'Inventory & Suppliers', amount: 'KES 6.5M', pct: 35, color: 'var(--pm-danger)' },
                    { name: 'Software & IT Subscriptions', amount: 'KES 1.8M', pct: 10, color: 'var(--pm-warning)' },
                    { name: 'Utilities (Power, Water, Net)', amount: 'KES 1.1M', pct: 6, color: 'var(--pm-warning)' },
                  ].map((e) => (
                    <div key={e.name} className="mb-2">
                      <div className="d-flex justify-content-between" style={{ fontSize: 12, marginBottom: 2 }}><span>{e.name}</span><strong>{e.amount}</strong></div>
                      <div className={s.progress}><div className={s.progressBar} style={{ width: `${e.pct}%`, background: e.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FinancialReportingModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
