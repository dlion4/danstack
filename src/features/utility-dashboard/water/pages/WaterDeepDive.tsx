import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/water.module.css'
import WaterModals from '../components/WaterModals'
import { initialMockData, fetchWaterDeepDive } from '../data/waterData'

const s = styles as Record<string, string>
type Filter = 'all' | 'due' | 'paid'

export default function WaterDeepDive() {
  const { data } = useQuery({ queryKey: ['water-deep-dive'], queryFn: fetchWaterDeepDive, staleTime: 60_000, retry: 1 })
  const config = data ?? initialMockData
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const open = (id: string) => setActiveModal(id)
  const accounts = filter === 'all' ? config.waterAccounts : config.waterAccounts.filter((a) => a.status === filter)
  const counts = { all: config.waterAccounts.length, due: config.waterAccounts.filter((a) => a.status === 'due').length, paid: config.waterAccounts.filter((a) => a.status === 'paid').length }

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
            <button className={s.btnPm} onClick={() => open('waterHealthModal')}><i className="bi bi-heart-pulse text-info" /> Health Check</button>
            <button className={s.btnPm} onClick={() => open('orderBowserModal')}><i className="bi bi-truck text-primary" /> Order Bowser</button>
            <button className={`${s.btnPm} ${s.btnPmI}`} onClick={() => open('payWaterModal')}><i className="bi bi-droplet" /> Pay Bill</button>
            <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => open('addWaterMeterModal')}><i className="bi bi-plus-lg" /> Add Account</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${s.card} ${s.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.live} <span style={{ color: '#67e8f9' }}>●</span></p>
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
                  {st.progress && (<div className="mt-2"><div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>{st.progress.label}</span><span>{st.progress.pct}</span></div><div className={`${s.progress} mt-1`}><div className={s.progressBar} style={{ width: st.progress.pct, background: st.progress.color }} /></div></div>)}
                  {st.lines && st.lines.map((l) => (<div key={l} className="mt-2 d-flex justify-content-between" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }} dangerouslySetInnerHTML={{ __html: l }} />))}
                </div>
              </div>
            ))}
          </div>

          {/* ALERTS / SUGGESTIONS / QUICK */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Water Alerts</h3><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('waterNotificationsModal')}>View all</button></div>
                {config.waterAlerts.map((it) => (
                  <div key={it.title} className={s.feedItem}>
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}>{it.iconText ?? <i className={`bi ${it.icon}`} />}</div>
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
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}><i className={`bi ${it.icon}`} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{it.sub}</div></div>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(it.modal)}>{it.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3"><h3 className={s.sectionTitle}>Quick Actions</h3><p className={s.sectionSub}>Frequent water management workflows</p></div>
                <div className={s.quickActionGrid}>
                  {config.quickActions.map((a) => (<button key={a.label} className={s.quickActionBtn} onClick={() => open(a.modal)}><i className={`bi ${a.icon}`} style={{ color: a.iconColor }} /> {a.label}</button>))}
                </div>
              </div>
            </div>
          </div>

          {/* 2.3.1 — PAYMENTS & ACCOUNTS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-droplet-half" style={{ color: 'var(--pm-info)' }} /> 3.3.1 — Water Bill Payments & Account Wallet (All Counties)</h3><p className={s.sectionSub}>Manage 47-county water utility providers, pay bills, handle connection fees, and download integrated receipts.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('exportWaterModal')}><i className="bi bi-clock-history" /> History</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmI}`} onClick={() => open('payWaterModal')}><i className="bi bi-credit-card" /> Pay Bill</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Active Water Accounts</h4>
                    <div className={s.tabPills}>{([['all', 'All'], ['due', 'Due'], ['paid', 'Paid']] as [Filter, string][]).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${filter === k ? s.tabPillActive : ''}`} onClick={() => setFilter(k)}>{l} ({counts[k]})</button>))}</div>
                  </div>
                  <div className="table-responsive">
                    <table className={s.table}>
                      <thead><tr><th>Provider</th><th>Account</th><th>Nickname</th><th>Amount Due</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {accounts.map((a) => (
                          <tr key={a.account}>
                            <td data-label="Provider">{a.provider}</td>
                            <td data-label="Account"><code>{a.account}</code></td>
                            <td data-label="Nickname">{a.nickname}</td>
                            <td data-label="Amount Due"><strong>{a.due}</strong></td>
                            <td data-label="Due Date">{a.date}</td>
                            <td data-label="Status">{a.status === 'due' ? <span className={`${s.badge} ${s.badgeW}`}>Due</span> : <span className={`${s.badge} ${s.badgeS}`}>Paid</span>}</td>
                            <td data-label="Actions">
                              <div className="d-flex" style={{ gap: 4 }}>
                                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('payWaterModal')}><i className="bi bi-credit-card" /></button>
                                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('waterBillBreakdownModal')}><i className="bi bi-receipt" /></button>
                                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('manageWaterAccountModal')}><i className="bi bi-gear" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={`${s.utilityBlock} mb-3`}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Last Paid Bill Breakdown</h4>
                  {config.lastPaidBreakdown.map((b, i) => (
                    <div key={b.label} className={s.statusRow}>
                      <div><strong>{b.label}</strong>{i < config.lastPaidBreakdown.length - 1 && <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{b.sub}</div>}</div>
                      <strong style={i === config.lastPaidBreakdown.length - 1 ? { color: 'var(--pm-accent)' } : {}}>{b.amount}</strong>
                    </div>
                  ))}
                  <div className="d-flex mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('waterBillBreakdownModal')}>View full statement</button></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2.3.2 — CONSUMPTION & DISPUTE */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-graph-up-arrow" style={{ color: 'var(--pm-primary)' }} /> 3.3.2 — Consumption Analytics, Meter Tracking & Dispute</h3><p className={s.sectionSub}>Track cubic meters (m³) over time, compare properties, detect abnormal surges (leaks), and resolve billing disputes.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('waterAnalyticsModal')}><i className="bi bi-bar-chart" /> Deep Dive</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('disputeWaterModal')}><i className="bi bi-exclamation-circle" /> Dispute</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>6-Month Portfolio Consumption (m³)</h4>
                  <div className={s.chartBarGroup}>
                    {config.consumptionTrend.map((t) => (<div key={t.month} className={s.chartBar} style={{ height: t.height, background: t.color }} onClick={() => open('waterAnalyticsModal')} role="button" tabIndex={0}><span className={s.barLabel}>{t.month}</span></div>))}
                  </div>
                  <div className="d-flex mt-3 flex-wrap" style={{ gap: 10, fontSize: 12 }}><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--pm-info)', marginRight: 5 }} />Current month</span><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--pm-danger)', marginRight: 5 }} />Anomaly/Leak detected</span></div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Key Metrics</h4>
                  {config.keyMetrics.map((m) => (<div key={m.label} className="p-3 rounded mb-2" style={{ background: m.bg }}><div style={{ fontSize: 11, color: m.bg === 'var(--pm-surface)' ? 'var(--pm-muted)' : m.color }}>{m.label}</div><div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div></div>))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Open Disputes & Issues</h4>
                  {config.openDisputes.map((d) => (<div key={d.id} className={s.statusRow}><div><strong>{d.id}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{d.sub}</div></div><span className={`${s.badge} ${s[d.tone]}`}>{d.status}</span></div>))}
                  <div className="d-flex mt-3" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`} onClick={() => open('reportLeakModal')}>Report new leak</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('disputeWaterModal')}>Raise dispute</button></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2.3.3 — BOWSERS & EMERGENCY */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-truck" style={{ color: 'var(--pm-accent)' }} /> 3.3.3 — Bulk Water, Bowsers & Emergency Supply Management</h3><p className={s.sectionSub}>Supplement county water during rationing. Order from verified private boreholes, manage truck deliveries, and track supply schedules.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('outageWaterModal')}><i className="bi bi-cone-striped" /> Rationing Schedule</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('orderBowserModal')}><i className="bi bi-plus-lg" /> Book Delivery</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Verified Private Bowser Suppliers</h4><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('compareSuppliersModal')}>Compare Prices</button></div>
                  <div className="table-responsive">
                    <table className={s.table}>
                      <thead><tr><th>Supplier</th><th>Verified</th><th>Cost (10k Liters)</th><th>Delivery SLA</th><th>Action</th></tr></thead>
                      <tbody>
                        {config.bowserSuppliers.map((b) => (
                          <tr key={b.name}><td><strong>{b.name}</strong></td><td><i className="bi bi-patch-check-fill text-success" /> {b.cert}</td><td>{b.cost}</td><td>{b.sla}</td><td><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('orderBowserModal')}>Order</button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Deliveries</h4>
                  <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface)', border: '1px solid var(--pm-primary-light)' }}>
                    <i className="bi bi-truck d-block mb-2" style={{ fontSize: 24, color: 'var(--pm-primary)' }} /><strong>Delivery in Progress</strong>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Nairobi Pure Water Ltd · 10,000L</div>
                    <div className={`${s.progress} mt-2 mb-1`}><div className={s.progressBar} style={{ width: '75%', background: 'var(--pm-primary)' }} /></div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>Arriving in approx 45 mins</div>
                  </div>
                  <button className={`${s.btnPm} ${s.btnSm} w-100 justify-content-center`} onClick={() => open('waterHealthModal')}>View Storage Capacity</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WaterModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
