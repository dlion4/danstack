import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/electricity.module.css'
import ElectricityModals from '../components/ElectricityModals'
import { initialMockData, fetchElectricityDeepDive } from '../data/electricityData'

const s = styles as Record<string, string>
type PFilter = 'all' | 'due' | 'paid' | 'dispute'
const dot = (c: string): React.CSSProperties => ({ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 })

export default function ElectricityManagement() {
  const { data } = useQuery({ queryKey: ['electricity-deep-dive'], queryFn: fetchElectricityDeepDive, staleTime: 60_000, retry: 1 })
  const config = data ?? initialMockData
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [filter, setFilter] = useState<PFilter>('all')
  const open = (id: string) => setActiveModal(id)
  const rows = filter === 'all' ? config.postpaidRows : config.postpaidRows.filter((r) => r.status === filter)
  const counts = { all: config.postpaidRows.length, due: config.postpaidRows.filter((r) => r.status === 'due').length, paid: config.postpaidRows.filter((r) => r.status === 'paid').length, dispute: config.postpaidRows.filter((r) => r.status === 'dispute').length }
  const statusTone = (st: string) => (st === 'due' ? 'badgeD' : st === 'paid' ? 'badgeS' : 'badgeW')
  const statusLabel = (st: string) => (st === 'due' ? 'Due' : st === 'paid' ? 'Paid/Upcoming' : 'In dispute')

  return (
    <div className={s.utilPage}>
      <div className={s.main}>
        <div className={s.pageBar}>
          <div>
            <div className={s.breadcrumb}>{config.breadcrumb.parents.map((p) => (<span key={p.label}><Link to={p.to}>{p.label}</Link> / </span>))}<strong>{config.breadcrumb.current}</strong></div>
            <h2 className={s.pageH2}>{config.pageCode} — {config.pageTitle}</h2>
            <p className={s.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={s.btnPm} onClick={() => open('portfolioHealthModal')}><i className="bi bi-heart-pulse text-info" /> Health Check</button>
            <button className={s.btnPm} onClick={() => open('tokenHistoryModal')}><i className="bi bi-safe text-warning" /> Token Vault</button>
            <button className={`${s.btnPm} ${s.btnPmI}`} onClick={() => open('payPostpaidModal')}><i className="bi bi-receipt-cutoff" /> Pay Bill</button>
            <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => open('addMeterModal')}><i className="bi bi-plus-lg" /> Add Meter</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${s.card} ${s.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.live} <span style={{ color: '#86efac' }}>●</span></p>
                <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>{config.hero.value}</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.actions.map((a) => (<button key={a.label} className={`${s.btnPm} ${s.btnSm} ${s.btnGhostLight}`} onClick={() => open(a.modal)}>{a.label}</button>))}
                </div>
              </div>
            </div>
            {config.statCards.map((st) => (
              <div key={st.key} className={st.col}>
                <div className={s.card} style={{ minHeight: 170, ...(st.accentBorder ? { borderLeft: '3px solid var(--pm-accent)' } : {}) }}>
                  <p className={s.sl} style={{ color: st.labelColor }}>{st.label}</p>
                  <div className={s.sv} style={{ margin: '6px 0' }}>{st.value}</div>
                  <span className={`${s.badge} ${s[st.badge.tone]}`}><i className={`bi ${st.badge.icon}`} /> {st.badge.text}</span>
                  {st.miniBars && (<div className={`${s.miniBars} mt-3`}>{st.miniBars.map((b, i) => (<div key={i} className={s.miniBar} style={{ height: b.height, background: b.color }} />))}</div>)}
                  {st.progress && (<div className="mt-2"><div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>{st.progress.label}</span><span>{st.progress.left}</span></div><div className={`${s.progress} mt-1`}><div className={s.progressBar} style={{ width: st.progress.pct, background: st.progress.color }} /></div></div>)}
                  {st.lines && st.lines.map((l) => (<div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }} dangerouslySetInnerHTML={{ __html: l }} />))}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Attention Required</h3><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('attentionModal')}>View all</button></div>
                {config.attention.map((it) => (
                  <div key={it.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}>{it.iconText}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{it.sub}</div></div>
                    <button className={`${s.btnPm} ${s.btnSm} ${it.actionClass ? s[it.actionClass] : ''}`} onClick={() => open(it.modal)}>{it.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Smart Suggestions</h3><span className={`${s.badge} ${s.badgeP}`}><i className="bi bi-stars" /> AI</span></div>
                {config.suggestions.map((it) => (
                  <div key={it.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}>{it.iconText}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{it.sub}</div></div>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(it.modal)}>{it.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3"><h3 className={s.sectionTitle}>Quick Actions</h3><p className={s.sectionSub}>Frequent electricity workflows</p></div>
                <div className={s.quickActionGrid}>
                  {config.quickActions.map((a) => (<button key={a.label} className={s.quickActionBtn} onClick={() => open(a.modal)}><i className={`bi ${a.icon}`} style={{ color: a.iconColor }} /> {a.label}</button>))}
                </div>
              </div>
            </div>
          </div>

          {/* 3.2.1 — PREPAID TOKENS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-lightning-charge-fill" style={{ color: 'var(--pm-warning)' }} /> 3.2.1 — Prepaid Token Purchase & Meter Wallet</h3><p className={s.sectionSub}>Purchase prepaid electricity tokens, manage low-balance alerts, share tokens, and run automated top-ups across multiple meters.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('tokenHistoryModal')}><i className="bi bi-clock-history" /> History</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('buyTokenModal')}><i className="bi bi-plus-lg" /> Buy Token</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Linked Prepaid Meters</h4>
                  <div className={s.serviceGrid}>
                    {config.prepaidMeters.map((mt) => (
                      <div key={mt.meter} className={s.serviceCard} onClick={() => open(mt.modal)} style={{ cursor: 'pointer' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2"><div className={s.iconCircle} style={{ background: mt.bg, color: mt.color, width: 44, height: 44 }}><i className={`bi ${mt.icon}`} /></div><span style={dot(mt.color)} /></div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{mt.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{mt.meter}</div>
                        <div className="mt-2 d-flex justify-content-between align-items-center"><span className={`${s.badge} ${s[mt.status === 'safe' ? 'badgeS' : mt.status === 'watch' ? 'badgeI' : mt.status === 'low' ? 'badgeW' : 'badgeD']}`}>{mt.units}</span><small style={{ color: 'var(--pm-muted)' }}>{mt.provider}</small></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Low Balance & Alert Feed</h4>
                  {config.alertFeed.map((a) => (
                    <div key={a.name} className={s.statusRow}>
                      <div><strong>{a.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{a.sub}</div></div>
                      <div className="text-end"><span className={`${s.badge} ${s[a.tone]}`}>{a.badge}</span><div><button className={`${s.btnPm} ${s.btnSm} mt-1 ${a.actionClass ? s[a.actionClass] : ''}`} onClick={() => open(a.modal)}>{a.actionLabel}</button></div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-3">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Token Summary</h4>
                  <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>TOKEN PURCHASED THIS MONTH</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>{config.tokenSummary.purchased}</div></div>
                  <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>UNITS PURCHASED</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-accent)' }}>{config.tokenSummary.units}</div></div>
                  <div className="p-3 rounded" style={{ background: 'var(--pm-surface)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 700 }}>LAST TOKEN</div><div style={{ fontSize: 15, fontWeight: 700 }}>{config.tokenSummary.lastToken}</div><div className="d-flex mt-2" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('shareTokenModal')}>Share</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('redemptionCheckModal')}>Redeem</button></div></div>
                </div>
              </div>
              <div className="col-12">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Token Purchases</h4>
                    <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('shareTokenModal')}><i className="bi bi-send" /> Share Token</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('statementExportModal')}><i className="bi bi-file-earmark-arrow-down" /> Export</button></div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.table}>
                      <thead><tr><th>Date</th><th>Meter</th><th>Nickname</th><th>Amount</th><th>Units</th><th>Token</th><th>Method</th><th>Actions</th></tr></thead>
                      <tbody>
                        {config.recentTokens.map((t) => (
                          <tr key={t.token}>
                            <td data-label="Date">{t.date}</td>
                            <td data-label="Meter">{t.meter}</td>
                            <td data-label="Nickname">{t.nickname}</td>
                            <td data-label="Amount"><strong>{t.amount}</strong></td>
                            <td data-label="Units">{t.units}</td>
                            <td data-label="Token"><code>{t.token}</code></td>
                            <td data-label="Method">{t.method}</td>
                            <td data-label="Actions"><div className="d-flex" style={{ gap: 4 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('shareTokenModal')}><i className="bi bi-whatsapp" /></button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('redemptionCheckModal')}><i className="bi bi-check2-square" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3.2.2 — POSTPAID */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-receipt-cutoff" style={{ color: 'var(--pm-primary)' }} /> 3.2.2 — Postpaid Bill Management & Settlement Desk</h3><p className={s.sectionSub}>View active postpaid accounts, fetch current bills, inspect tariff breakdowns, pay partially or fully, and raise billing disputes.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('billBreakdownModal')}><i className="bi bi-list-columns" /> Breakdown</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('payPostpaidModal')}><i className="bi bi-credit-card" /> Pay Bill</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Postpaid Accounts</h4>
                    <div className={s.tabPills}>{([['all', 'All'], ['due', 'Due'], ['paid', 'Paid'], ['dispute', 'Dispute']] as [PFilter, string][]).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${filter === k ? s.tabPillActive : ''}`} onClick={() => setFilter(k)}>{l} ({counts[k]})</button>))}</div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.table}>
                      <thead><tr><th>Account</th><th>Nickname</th><th>Current Bill</th><th>Due Date</th><th>Status</th><th>Forecast</th><th>Actions</th></tr></thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.account}>
                            <td data-label="Account"><code>{r.account}</code></td>
                            <td data-label="Nickname">{r.nickname}</td>
                            <td data-label="Current Bill"><strong>{r.bill}</strong></td>
                            <td data-label="Due Date">{r.due}</td>
                            <td data-label="Status"><span className={`${s.badge} ${s[statusTone(r.status)]}`}>{statusLabel(r.status)}</span></td>
                            <td data-label="Forecast">{r.forecast}</td>
                            <td data-label="Actions"><div className="d-flex" style={{ gap: 4 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('payPostpaidModal')}><i className="bi bi-credit-card" /></button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('billBreakdownModal')}><i className="bi bi-file-earmark-text" /></button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('disputeBillModal')}><i className="bi bi-exclamation-circle" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={`${s.utilityBlock} mb-3`}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Current Billing Snapshot</h4>
                  {config.billingSnapshot.map((b) => (
                    <div key={b.label} className={s.statusRow}><div><strong>{b.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{b.sub}</div></div><strong style={b.danger ? { color: 'var(--pm-danger)' } : undefined}>{b.amount}</strong></div>
                  ))}
                  <div className="d-flex mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('billBreakdownModal')}>Open full bill</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('disputeBillModal')}>Dispute</button></div>
                </div>
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Forecast & Risk</h4>
                  <div className="p-3 rounded mb-2" style={{ background: 'var(--pm-danger-soft)' }}><div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>HIGH RISK ACCOUNT</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-danger)' }}>{config.forecastRisk.highTitle}</div><div style={{ fontSize: 12, color: '#7F1D1D' }}>{config.forecastRisk.highSub}</div></div>
                  <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>BEST PERFORMING ACCOUNT</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-accent)' }}>{config.forecastRisk.bestTitle}</div><div style={{ fontSize: 12, color: '#065F46' }}>{config.forecastRisk.bestSub}</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3.2.3 — ANALYTICS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-bar-chart-line" style={{ color: 'var(--pm-accent)' }} /> 3.2.3 — Meter Portfolio, Usage Analytics & Consumption Intelligence</h3><p className={s.sectionSub}>Track kWh trends, compare meter performance, forecast future bills, and identify waste across your electricity portfolio.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('usageAnalyticsModal')}><i className="bi bi-graph-up-arrow" /> Analytics</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('meterCompareModal')}><i className="bi bi-layout-split" /> Compare</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>6-Month Consumption Trend</h4>
                  <div className={s.chartBarGroup}>
                    {config.consumptionTrend.map((b) => (<div key={b.month} className={s.chartBar} style={{ height: b.height, background: b.color }} onClick={() => open('usageAnalyticsModal')}><span className={s.barLabel}>{b.month}</span></div>))}
                  </div>
                  <div className="d-flex flex-wrap mt-3" style={{ gap: 10, fontSize: 12 }}><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--pm-primary)', marginRight: 5 }} />Current month</span><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--pm-accent)', marginRight: 5 }} />Improved efficiency</span><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--pm-warning)', marginRight: 5 }} />High season</span></div>
                  <hr className={s.divider} />
                  <div className="row g-2">
                    <div className="col-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Avg Daily</div><div style={{ fontSize: 20, fontWeight: 700 }}>{config.trendStats.avg}</div></div></div>
                    <div className="col-6"><div className="p-3 rounded" style={{ background: 'var(--pm-surface)' }}><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Peak Day</div><div style={{ fontSize: 20, fontWeight: 700 }}>{config.trendStats.peak}</div></div></div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Meter Performance Board</h4>
                  {config.perfBoard.map((p) => (<div key={p.name} className={s.statusRow}><div><strong>{p.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{p.sub}</div></div><span className={`${s.badge} ${s[p.tone]}`}>{p.badge}</span></div>))}
                  <div className="d-flex mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('meterCompareModal')}>Compare meters</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('billForecastModal')}>Forecast</button></div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Efficiency Levers</h4>
                  {config.efficiencyLevers.map((e) => (<div key={e.head} className="p-3 rounded mb-2" style={{ background: e.bg }}><div style={{ fontSize: 11, fontWeight: 700, color: e.color }}>{e.head}</div><div style={{ fontSize: 20, fontWeight: 700, color: e.color }}>{e.value}</div><div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{e.sub}</div></div>))}
                </div>
              </div>
              <div className="col-12">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Meter Portfolio Directory</h4>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('manageMeterModal')}><i className="bi bi-gear" /> Manage selected meter</button>
                  </div>
                  <div className="table-responsive">
                    <table className={s.table}>
                      <thead><tr><th>Meter</th><th>Nickname</th><th>Type</th><th>Region</th><th>Current Status</th><th>This Month</th><th>Projected</th><th>Actions</th></tr></thead>
                      <tbody>
                        {config.portfolioRows.map((r) => (
                          <tr key={r.meter}>
                            <td data-label="Meter"><code>{r.meter}</code></td>
                            <td data-label="Nickname">{r.name}</td>
                            <td data-label="Type">{r.type}</td>
                            <td data-label="Region">{r.region}</td>
                            <td data-label="Current Status"><span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span></td>
                            <td data-label="This Month">{r.month}</td>
                            <td data-label="Projected">{r.projected}</td>
                            <td data-label="Actions"><div className="d-flex" style={{ gap: 4 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('manageMeterModal')}><i className="bi bi-gear" /></button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('usageAnalyticsModal')}><i className="bi bi-bar-chart" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3.2.4 — AUTOMATION / OUTAGES / HOUSEHOLD */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-cpu" style={{ color: 'var(--pm-purple)' }} /> 3.2.4 — Automation, Outages, Service Requests & Household Access</h3><p className={s.sectionSub}>Configure auto-top-up rules, monitor outages and maintenance notices, submit service requests, upload evidence, and control household permissions.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('outageTrackerModal')}><i className="bi bi-broadcast-pin" /> Outages</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('serviceRequestModal')}><i className="bi bi-headset" /> New Request</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Auto Rules</h4><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('autoTopupModal')}>Add rule</button></div>
                  {config.autoRules.map((r) => (<div key={r.name} className={s.statusRow}><div><strong>{r.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r.rule}</div></div><span className={`${s.badge} ${s[r.state === 'Active' ? 'badgeS' : r.state === 'Paused' ? 'badgeW' : 'badgeI']}`}>{r.state}</span></div>))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Outage & Maintenance Feed</h4><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('reportOutageModal')}>Report</button></div>
                  {config.outageFeed.map((o) => (<div key={o.title} className={s.statusRow}><div><strong>{o.title}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{o.meta}</div></div><span className={`${s.badge} ${s[o.tone]}`}>{o.badge}</span></div>))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Household & Access</h4><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('householdAccessModal')}>Manage</button></div>
                  {config.household.map((h) => (
                    <div key={h.name} className={s.statusRow}>
                      <div className="d-flex align-items-center" style={{ gap: 8 }}><div className={s.avatar} style={{ background: h.grad, width: 28, height: 28, fontSize: 10 }}>{h.initials}</div><div><strong>{h.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{h.role} · {h.meters}</div></div></div>
                      <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('householdAccessModal')}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Open Cases, Requests & Evidence</h4>
                    <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('disputeBillModal')}><i className="bi bi-exclamation-circle" /> Dispute</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('uploadReadingModal')}><i className="bi bi-camera" /> Upload Reading</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('serviceRequestModal')}><i className="bi bi-tools" /> Service Request</button></div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.table}>
                      <thead><tr><th>Case ID</th><th>Type</th><th>Meter / Account</th><th>Status</th><th>Opened</th><th>Next Step</th><th>Action</th></tr></thead>
                      <tbody>
                        {config.cases.map((c) => (
                          <tr key={c.id}>
                            <td data-label="Case ID">{c.id}</td>
                            <td data-label="Type">{c.type}</td>
                            <td data-label="Meter / Account">{c.meter}</td>
                            <td data-label="Status"><span className={`${s.badge} ${s[c.tone]}`}>{c.status}</span></td>
                            <td data-label="Opened">{c.opened}</td>
                            <td data-label="Next Step">{c.next}</td>
                            <td data-label="Action"><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(c.modal)}>{c.actionLabel}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}><i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Electricity Transactions</h3><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('statementExportModal')}>Export range</button></div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead><tr><th>Date</th><th>Service</th><th>Meter / Account</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th><th>Action</th></tr></thead>
                <tbody>
                  {config.transactions.map((t) => (
                    <tr key={t.ref}>
                      <td data-label="Date">{t.date}</td>
                      <td data-label="Service">{t.service}</td>
                      <td data-label="Meter / Account">{t.meter}</td>
                      <td data-label="Amount"><strong>{t.amount}</strong></td>
                      <td data-label="Method">{t.method}</td>
                      <td data-label="Status"><span className={`${s.badge} ${s[t.tone]}`}>{t.status}</span></td>
                      <td data-label="Reference">{t.ref}</td>
                      <td data-label="Action"><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(t.modal)}>{t.actionLabel}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ElectricityModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={open} />
    </div>
  )
}
