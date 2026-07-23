import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/utilities-command-center.module.css'
import CommandCenterModals from '../components/CommandCenterModals'
import { initialMockData, fetchCommandCenter } from '../data/commandCenterData'
import type { ConnectedService } from '../data/commandCenterData'

const s = styles as Record<string, string>

const STATUS_COLOR: Record<ConnectedService['status'], string> = {
  active: '#10B981', paused: '#F59E0B', pending: '#9CA3AF',
}
const STATUS_BADGE: Record<ConnectedService['status'], { cls: string; label: string }> = {
  active: { cls: s.badgeS, label: 'Active' },
  paused: { cls: s.badgeW, label: 'Paused' },
  pending: { cls: s.badgeI, label: 'Pending' },
}

type Filter = 'all' | 'active' | 'pending' | 'paused'

export default function UtilitiesCommandCenter() {
  const { data } = useQuery({ queryKey: ['utilities-command-center'], queryFn: fetchCommandCenter, staleTime: 60_000, retry: 1 })
  const config = data ?? initialMockData
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const open = (id: string) => setActiveModal(id)
  const connected = filter === 'all' ? config.connectedServices : config.connectedServices.filter((c) => c.status === filter)
  const filterCounts = {
    all: config.connectedServices.length,
    active: config.connectedServices.filter((c) => c.status === 'active').length,
    pending: config.connectedServices.filter((c) => c.status === 'pending').length,
    paused: config.connectedServices.filter((c) => c.status === 'paused').length,
  }

  return (
    <div className={s.utilCmdPage}>
      <div className={s.main}>
        {/* PAGE BAR */}
        <div className={s.pageBar}>
          <div>
            <div className={s.breadcrumb}>
              {config.breadcrumb.parents.map((p) => (<span key={p.label + p.to}><Link to={p.to}>{p.label}</Link> / </span>))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 className={s.pageH2}>{config.pageCode} — {config.pageTitle}</h2>
            <p className={s.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={s.btnPm} onClick={() => open('healthCheckModal')}><i className="bi bi-heart-pulse" /> Health Check</button>
            <button className={s.btnPm} onClick={() => open('billInboxModal')}><i className="bi bi-inbox" /> Bill Inbox</button>
            <button className={s.btnPm} onClick={() => open('payBillQuickModal')}><i className="bi bi-credit-card" /> Pay Bill</button>
            <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => open('addUtilityModal')}><i className="bi bi-plus-lg" /> Add Utility</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${s.card} ${s.cardAccent}`} style={{ minHeight: 160 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{config.hero.live} <span style={{ color: '#34D399' }}>●</span></p>
                <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>{config.hero.value}</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.actions.map((a) => (
                    <button key={a.label} className={`${s.btnPm} ${s.btnSm} ${s.btnGhostLight}`} onClick={() => open(a.modal)}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((st) => (
              <div key={st.key} className={st.col}>
                <div className={s.card} style={{ minHeight: 160, ...(st.accentBorder ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}>
                  <p className={s.sl} style={{ color: st.labelColor }}>{st.label}</p>
                  <div className={s.sv} style={{ margin: '6px 0' }}>{st.value}</div>
                  <span className={`${s.badge} ${s[st.badge.tone]}`}><i className={`bi ${st.badge.icon}`} /> {st.badge.text}</span>
                  {st.miniBars && (
                    <div className={`${s.miniBars} mt-3`}>
                      {st.miniBars.map((b, i) => (<div key={i} className={s.miniBar} style={{ height: b.height, background: b.color }} />))}
                    </div>
                  )}
                  {st.progress && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>{st.progress.label}</span><span>{st.progress.pct}</span></div>
                      <div className={`${s.progress} mt-1`}><div className={s.progressBar} style={{ width: st.progress.pct, background: st.progress.color }} /></div>
                    </div>
                  )}
                  {st.lines && st.lines.map((l) => (
                    <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }} dangerouslySetInnerHTML={{ __html: l }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.sectionTitle}>Attention Required</h3>
                  <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('attentionDetailModal')}>View all</button>
                </div>
                {config.attention.map((it) => (
                  <div key={it.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}>{it.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{it.sub}</div>
                    </div>
                    <button className={`${s.btnPm} ${s.btnSm} ${it.actionClass ? s[it.actionClass] : ''}`} onClick={() => open(it.modal)}>{it.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.sectionTitle}>Smart Suggestions</h3>
                  <span className={`${s.badge} ${s.badgeP}`}><i className="bi bi-stars" /> AI</span>
                </div>
                {config.suggestions.map((it) => (
                  <div key={it.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}>{it.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{it.sub}</div>
                    </div>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(it.modal)}>{it.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3">
                  <h3 className={s.sectionTitle}>Quick Actions</h3>
                  <p className={s.sectionSub}>Frequent utility payment workflows</p>
                </div>
                <div className={s.quickActionGrid}>
                  {config.quickActions.map((a) => (
                    <button key={a.label} className={s.quickActionBtn} onClick={() => open(a.modal)}>
                      <i className={`bi ${a.icon}`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2.1.1 — SERVICE GRID */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.sectionTitle}><i className="bi bi-grid-3x3-gap-fill" style={{ color: 'var(--pm-primary)' }} /> 3.1.1 — Utilities Overview Dashboard</h3>
                <p className={s.sectionSub}>All your connected services with real-time status and quick-pay options.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('manageUtilitiesModal')}><i className="bi bi-gear" /> Manage</button>
                <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('addUtilityModal')}><i className="bi bi-plus-lg" /> Add Utility</button>
              </div>
            </div>
            <div className={s.serviceGrid}>
              {config.services.map((svc) => (
                <div key={svc.id} className={s.serviceCard} onClick={() => open(svc.modal)} role="button" tabIndex={0}>
                  <span className={s.statusDot} style={{ background: STATUS_COLOR[svc.status] }} title={svc.status} />
                  <div className={`${s.iconCircle} mx-auto mb-2`} style={{ background: svc.bg, color: svc.color, width: 44, height: 44, fontSize: 18 }}><i className={`bi ${svc.icon}`} /></div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{svc.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{svc.account}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2.1.2 — CONNECTED SERVICES */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.sectionTitle}><i className="bi bi-plug" style={{ color: 'var(--pm-accent)' }} /> 3.1.2 — Connected Services & Status Monitor</h3>
                <p className={s.sectionSub}>Monitor, onboard, edit, pause or manage all your connected utility accounts.</p>
              </div>
              <div className={s.tabPills}>
                {([['all', 'All'], ['active', 'Active'], ['pending', 'Pending'], ['paused', 'Paused']] as [Filter, string][]).map(([key, label]) => (
                  <button key={key} className={`${s.tabPill} ${filter === key ? s.tabPillActive : ''}`} onClick={() => setFilter(key)}>{label} ({filterCounts[key]})</button>
                ))}
              </div>
            </div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead>
                  <tr><th>Service</th><th>Provider</th><th>Account / Meter</th><th>Status</th><th>Last Payment</th><th>Next Due</th><th>Amount</th><th>Auto-Pay</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {connected.map((c) => {
                    const sb = STATUS_BADGE[c.status]
                    return (
                      <tr key={`${c.provider}-${c.account}`}>
                        <td data-label="Service">
                          <div className="d-flex align-items-center gap-2">
                            <div className={s.iconCircle} style={{ background: c.bg, color: c.color, width: 32, height: 32, fontSize: 14 }}><i className={`bi ${c.icon}`} /></div>
                            {c.service}
                          </div>
                        </td>
                        <td data-label="Provider">{c.provider}</td>
                        <td data-label="Account / Meter"><code style={{ fontSize: 12 }}>{c.account}</code></td>
                        <td data-label="Status"><span className={`${s.badge} ${sb.cls}`}>{sb.label}</span></td>
                        <td data-label="Last Payment" style={{ fontSize: 12 }}>{c.lastPay}</td>
                        <td data-label="Next Due" style={{ fontSize: 12 }}>{c.nextDue}</td>
                        <td data-label="Amount"><strong>{c.amount}</strong></td>
                        <td data-label="Auto-Pay">{c.autoPay ? <span className={`${s.badge} ${s.badgeS}`}><i className="bi bi-check" /> On</span> : <span className={`${s.badge} ${s.badgeNeutral}`}>Off</span>}</td>
                        <td data-label="Actions">
                          <div className="d-flex" style={{ gap: 4 }}>
                            <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(c.modal)} title="Pay"><i className="bi bi-credit-card" /></button>
                            <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('editServiceModal')} title="Edit"><i className="bi bi-pencil" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2.1.3 — ANALYTICS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.sectionTitle}><i className="bi bi-bar-chart-line" style={{ color: 'var(--pm-info)' }} /> 3.1.3 — Utility Spending Analytics & Budget Tracker</h3>
                <p className={s.sectionSub}>Track spending trends, set budgets, and discover cost-saving opportunities.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('budgetSettingsModal')}><i className="bi bi-sliders" /> Budget Settings</button>
                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('exportReportModal')}><i className="bi bi-download" /> Export Report</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Monthly Spend by Category</h4>
                  <div className={s.chartBarGroup} style={{ height: 120, marginBottom: 24 }}>
                    {config.spendByCategory.map((c) => (
                      <div key={c.label} className={s.chartBar} style={{ height: c.height, background: c.color }} onClick={() => open('spendDetailModal')} role="button" tabIndex={0}>
                        <span className={s.barLabel}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex flex-wrap mt-2" style={{ gap: 12, fontSize: 12 }}>
                    {config.spendByCategory.map((c) => (
                      <span key={c.label}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 4 }} />{c.label} {c.amount}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Budget vs Actual</h4>
                  {config.budgetTracker.map((b) => (
                    <div key={b.label} className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>{b.label}</span><span>{b.used} / {b.budget}</span></div>
                      <div className={s.progress}><div className={s.progressBar} style={{ width: b.pct, background: b.color }} /></div>
                    </div>
                  ))}
                  <button className={`${s.btnPm} ${s.btnSm} w-100 mt-2`} onClick={() => open('budgetSettingsModal')}><i className="bi bi-pencil" /> Edit Budgets</button>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>6-Month Trend</h4>
                  <div className={s.chartBarGroup} style={{ height: 80, marginBottom: 24 }}>
                    {config.trend.map((t) => (
                      <div key={t.month} className={s.chartBar} style={{ height: t.height, background: t.highlight ? 'var(--pm-primary)' : 'var(--pm-primary-light)' }}>
                        <span className={s.barLabel}>{t.month}</span>
                      </div>
                    ))}
                  </div>
                  <hr className={s.divider} />
                  <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}><i className="bi bi-lightbulb text-warning" /> Tips</h4>
                  <ul style={{ fontSize: 12, color: 'var(--pm-ink-soft)', paddingLeft: 16, margin: 0 }}>
                    {config.tips.map((t) => (<li key={t}>{t}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 2.1.4 — AUTOMATION */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.sectionTitle}><i className="bi bi-cpu" style={{ color: 'var(--pm-purple)' }} /> 3.1.4 — Smart Automation & Household Management</h3>
                <p className={s.sectionSub}>Auto-pay configurations, scheduled payments, household members, and notification preferences.</p>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}><i className="bi bi-arrow-repeat text-primary me-1" /> Auto-Pay Rules</h4>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('autoPaySetupModal')}><i className="bi bi-plus" /> Add</button>
                  </div>
                  {config.autoPayRules.map((r) => (
                    <div key={r.name} className="d-flex align-items-center justify-content-between p-2 border-bottom" style={{ fontSize: 12 }}>
                      <div><strong>{r.name}</strong><div style={{ color: 'var(--pm-muted)', fontSize: 11 }}>{r.rule}</div></div>
                      <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked={r.active} aria-label={`Toggle auto-pay ${r.name}`} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}><i className="bi bi-calendar-check text-success me-1" /> Upcoming Payments</h4>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('schedulePaymentModal')}><i className="bi bi-plus" /> Schedule</button>
                  </div>
                  {config.scheduledPayments.map((p) => (
                    <div key={p.name} className="d-flex align-items-center justify-content-between p-2 border-bottom" style={{ fontSize: 12 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 4, height: 24, borderRadius: 2, background: p.color }} />
                        <div><strong>{p.name}</strong><div style={{ color: 'var(--pm-muted)', fontSize: 11 }}>{p.date}</div></div>
                      </div>
                      <strong>{p.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}><i className="bi bi-people me-1" style={{ color: 'var(--pm-purple)' }} /> Household Members</h4>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('addMemberModal')}><i className="bi bi-plus" /> Add</button>
                  </div>
                  {config.householdMembers.map((m) => (
                    <div key={m.name} className="d-flex align-items-center justify-content-between p-2 border-bottom" style={{ fontSize: 12 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className={s.avatar} style={{ width: 28, height: 28, fontSize: 10, background: m.color }}>{m.initials}</div>
                        <div><strong>{m.name}</strong><div style={{ color: 'var(--pm-muted)', fontSize: 11 }}>{m.role} · {m.perm}</div></div>
                      </div>
                      <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('editServiceModal')}><i className="bi bi-pencil" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={s.sectionTitle}><i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Utility Transactions</h3>
              <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('transactionHistoryModal')}>View All</button>
            </div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead><tr><th>Date</th><th>Utility</th><th>Provider</th><th>Account</th><th>Amount</th><th>Method</th><th>Status</th><th>Receipt</th></tr></thead>
                <tbody>
                  {config.recentTransactions.map((t) => (
                    <tr key={`${t.date}-${t.account}`}>
                      <td data-label="Date">{t.date}</td>
                      <td data-label="Utility"><i className={`bi ${t.icon} me-1`} style={{ color: t.iconColor }} /> {t.utility}</td>
                      <td data-label="Provider">{t.provider}</td>
                      <td data-label="Account">{t.account}</td>
                      <td data-label="Amount"><strong>{t.amount}</strong></td>
                      <td data-label="Method">{t.method}</td>
                      <td data-label="Status"><span className={`${s.badge} ${s[t.tone]}`}>{t.status}</span></td>
                      <td data-label="Receipt"><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(t.modal)}>{t.modal === 'disputeModal' ? <i className="bi bi-exclamation-triangle" /> : <i className="bi bi-receipt" />}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CommandCenterModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
