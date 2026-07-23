import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/internet.module.css'
import InternetModals from '../components/InternetModals'
import { initialMockData, fetchInternetManagement } from '../data/internetData'

const s = styles as Record<string, string>
const NET_BG: Record<string, { bg: string; border: string; color: string }> = {
  success: { bg: 'var(--pm-accent-soft)', border: '#10B981', color: '#047857' },
  warning: { bg: 'var(--pm-warning-soft)', border: '#F59E0B', color: '#B45309' },
  muted: { bg: 'var(--pm-surface-2)', border: 'var(--pm-border)', color: 'var(--pm-ink)' },
}

export default function InternetManagement() {
  const { data } = useQuery({ queryKey: ['internet-management'], queryFn: fetchInternetManagement, staleTime: 60_000, retry: 1 })
  const config = data ?? initialMockData
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const open = (id: string) => setActiveModal(id)

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
            <button className={s.btnPm} onClick={() => open('connectivityHealthModal')}><i className="bi bi-activity" /> Net Health</button>
            <button className={s.btnPm} onClick={() => open('dataUsageAnalyticsModal')}><i className="bi bi-pie-chart" /> Usage</button>
            <button className={s.btnPm} onClick={() => open('bulkTopupModal')}><i className="bi bi-collection" /> Bulk Pay</button>
            <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => open('addConnectionModal')}><i className="bi bi-plus-lg" /> Add Connection</button>
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
                  {st.progress && (<div className="mt-2"><div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>{st.progress.label}</span><span>{st.progress.value}</span></div><div className={`${s.progress} mt-1`}><div className={s.progressBar} style={{ width: st.progress.pct, background: st.progress.color }} /></div></div>)}
                  {st.lines && st.lines.map((l) => (<div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }} dangerouslySetInnerHTML={{ __html: l }} />))}
                </div>
              </div>
            ))}
          </div>

          {/* FEED ROW */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Attention Required</h3><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('attentionDetailModal')}>View all</button></div>
                {config.attention.map((it) => (
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
                    <div className={s.iconCircle} style={{ background: it.iconBg, color: it.iconColor, fontSize: 12 }}>{it.iconText}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{it.sub}</div></div>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(it.modal)}>{it.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3"><h3 className={s.sectionTitle}>Quick Actions</h3><p className={s.sectionSub}>Frequent connectivity workflows</p></div>
                <div className={s.quickActionGrid}>{config.quickActions.map((a) => (<button key={a.label} className={s.quickActionBtn} onClick={() => open(a.modal)}><i className={`bi ${a.icon}`} style={{ color: a.iconColor }} /> {a.label}</button>))}</div>
              </div>
            </div>
          </div>

          {/* 2.4.1 — FIBRE */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-router-fill" style={{ color: 'var(--pm-primary)' }} /> 3.4.1 — Broadband & Fiber Connections</h3><p className={s.sectionSub}>Manage your fixed home and office internet connections.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('reportFaultModal')}><i className="bi bi-headset" /> Support</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('addConnectionModal')}><i className="bi bi-plus-lg" /> Add Connection</button></div>
            </div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead><tr><th>Provider</th><th>Account</th><th>Location / Plan</th><th>Speed</th><th>Status</th><th>Next Bill</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.fibreConnections.map((f) => (
                    <tr key={f.account}>
                      <td data-label="Provider"><strong>{f.provider}</strong></td>
                      <td data-label="Account"><code>{f.account}</code></td>
                      <td data-label="Location / Plan">{f.plan}</td>
                      <td data-label="Speed">{f.speed}</td>
                      <td data-label="Status">{f.status === 'active' ? <span className={`${s.badge} ${s.badgeS}`}>Online</span> : <span className={`${s.badge} ${s.badgeW}`}>Degraded</span>}</td>
                      <td data-label="Next Bill">{f.due}</td>
                      <td data-label="Actions"><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('payFibreModal')}>Manage</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2.4.2 — SIMs */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-sim" style={{ color: '#10B981' }} /> 3.4.2 — Mobile Data & Airtime Management</h3><p className={s.sectionSub}>Manage multiple SIM cards, track data balances, and automate bundle renewals.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('bulkTopupModal')}><i className="bi bi-collection" /> Bulk Pay</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('buyDataModal')}><i className="bi bi-phone" /> Buy Bundle</button></div>
            </div>
            <div className="row g-3">
              {config.sims.map((sim) => (
                <div key={sim.number} className="col-md-4">
                  <div className="p-3 border rounded" style={{ background: '#fff', position: 'relative' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className={s.iconCircle} style={{ background: sim.bg, color: sim.color }}><i className="bi bi-sim" /></div>
                      <div><h6 style={{ margin: 0, fontWeight: 700 }}>{sim.network}</h6><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sim.number}</div></div>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6"><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>DATA BAL</div><strong style={{ fontSize: 16 }}>{sim.bal}</strong></div>
                      <div className="col-6"><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>EXPIRY</div><strong style={{ fontSize: 14, color: sim.expiry === 'Tomorrow' ? 'var(--pm-danger)' : 'inherit' }}>{sim.expiry}</strong></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                      <span style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Auto-renew: {sim.auto ? <span style={{ color: '#10B981' }}>ON</span> : <span style={{ color: '#EF4444' }}>OFF</span>}</span>
                      <div className="d-flex" style={{ gap: 4 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('buyDataModal')}>Buy</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('manageSimModal')}><i className="bi bi-gear" /></button></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2.4.3 — ANALYTICS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-bar-chart-line" style={{ color: 'var(--pm-info)' }} /> 3.4.3 — Analytics, Subscriptions & Automation</h3><p className={s.sectionSub}>Analyze bandwidth usage, manage auto-renew schedules, and track network outages.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('dataUsageAnalyticsModal')}><i className="bi bi-graph-up" /> Full Report</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Total Data Usage (GB)</h4>
                  <div className={s.chartBarGroup}>{config.dataUsageTrend.map((t) => (<div key={t.month} className={s.chartBar} style={{ height: t.height, background: t.color }} onClick={() => open('dataUsageAnalyticsModal')} role="button" tabIndex={0}><span className={s.barLabel}>{t.month}</span></div>))}</div>
                  <div className="d-flex flex-wrap mt-3 justify-content-between" style={{ fontSize: 12 }}><span><strong>Total:</strong> 1.2 TB</span><span><strong>Peak:</strong> Streaming (68%)</span><span><strong>Cost:</strong> KES 14,200</span></div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Auto-Renewals</h4>
                  {config.autoRenewals.map((r) => (<div key={r.name} className={s.statusRow}><div><strong>{r.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r.sub}</div></div><span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span></div>))}
                  <button className={`${s.btnPm} ${s.btnSm} w-100 mt-2`} onClick={() => open('autoRenewSetupModal')}>Manage Rules</button>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Network Status & Outages</h4>
                  {config.networkStatus.map((n) => { const c = NET_BG[n.tone]; return (<div key={n.name} className="p-3 rounded mb-2" style={{ background: c.bg, border: `1px solid ${c.border}` }}><div style={{ fontWeight: 600, color: c.color }}><i className={`bi ${n.icon} me-1`} /> {n.name}</div><div style={{ fontSize: 11, color: n.tone === 'muted' ? 'var(--pm-muted)' : c.color }}>{n.detail}</div></div>) })}
                  <button className={`${s.btnPm} ${s.btnSm} w-100`} onClick={() => open('networkOutagesModal')}>View Outage Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InternetModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
