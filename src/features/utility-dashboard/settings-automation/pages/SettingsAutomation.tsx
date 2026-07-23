import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/settings-automation.module.css'
import SettingsModals from '../components/SettingsModals'
import { initialMockData, fetchSettingsAutomation } from '../data/settingsData'

const s = styles as Record<string, string>

export default function SettingsAutomation() {
  const { data } = useQuery({ queryKey: ['settings-automation'], queryFn: fetchSettingsAutomation, staleTime: 60_000, retry: 1 })
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
            <button className={s.btnPm} onClick={() => open('budgetWizardModal')}><i className="bi bi-magic" /> Budget Wizard</button>
            <button className={s.btnPm} onClick={() => open('addMemberModal')}><i className="bi bi-person-plus" /> Add Member</button>
            <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => open('autoPaySetupModal')}><i className="bi bi-plus-lg" /> New Auto-Pay Rule</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">
            {config.heroCards.map((h) => (
              <div key={h.key} className={h.col}>
                <div className={`${s.card} ${h.accent ? s.cardAccent : ''}`} style={{ minHeight: 160, ...(h.warnBorder ? { borderLeft: '3px solid var(--pm-warning)' } : {}) }}>
                  <p className={s.sl} style={{ color: h.labelColor }}>{h.label}</p>
                  <div className={s.sv} style={{ margin: '6px 0', ...(h.accent ? { color: '#fff' } : {}) }}>{h.value}</div>
                  {h.badge && (h.badge.tone === 'white'
                    ? <span className={s.badge} style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}><i className={`bi ${h.badge.icon}`} /> {h.badge.text}</span>
                    : <span className={`${s.badge} ${s[h.badge.tone]}`}><i className={`bi ${h.badge.icon}`} /> {h.badge.text}</span>)}
                  {h.progress && (<><div className={`${s.progress} mt-3`}><div className={s.progressBar} style={{ width: h.progress.pct, background: h.progress.color }} /></div><div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>{h.progress.note}</div></>)}
                  {h.avatars && (<div className="d-flex align-items-center mt-2 mb-2" style={{ marginLeft: 8 }}>{h.avatars.map((a) => (<div key={a.initials} className={s.avatar} style={{ width: 24, height: 24, marginLeft: -8, border: '2px solid #fff', background: a.gradient, fontSize: 10 }}>{a.initials}</div>))}</div>)}
                  {h.lines && h.lines.map((l) => (<div key={l} className="mt-1" style={{ fontSize: 12, color: h.accent ? 'rgba(255,255,255,.85)' : 'var(--pm-ink-soft)' }} dangerouslySetInnerHTML={{ __html: l }} />))}
                  {h.action && (<div className="mt-3"><button className={`${s.btnPm} ${s.btnSm} ${h.accent ? s.btnGhostLight : ''} ${!h.accent ? 'w-100' : ''}`} onClick={() => open(h.action!.modal)}>{h.accent ? <><i className="bi bi-plus" /> {h.action.label}</> : <><i className="bi bi-person-plus" /> {h.action.label}</>}</button></div>)}
                </div>
              </div>
            ))}
          </div>

          {/* ACTIONS ROW */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Attention Needed</h3></div>
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
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Smart Config Suggestions</h3><span className={`${s.badge} ${s.badgeP}`}><i className="bi bi-stars" /> AI</span></div>
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
                <div className="mb-3"><h3 className={s.sectionTitle}>Settings Quick Links</h3><p className={s.sectionSub}>Jump straight to configuration modes</p></div>
                <div className={s.quickActionGrid}>{config.quickActions.map((a) => (<button key={a.label} className={s.quickActionBtn} onClick={() => open(a.modal)}><i className={`bi ${a.icon}`} style={{ color: a.iconColor }} /> {a.label}</button>))}</div>
              </div>
            </div>
          </div>

          {/* 2.10.1 — AUTO-PAY ENGINE */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-arrow-repeat" style={{ color: 'var(--pm-primary)' }} /> 3.6.1 — Auto-Pay Configuration Engine</h3><p className={s.sectionSub}>Service-level automation, execution timing, amount rules, priority routing, and smart deviation bounds.</p></div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('smartAutoPayModal')}><i className="bi bi-cpu" /> Smart Settings</button>
                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('paymentSourcePriorityModal')}><i className="bi bi-wallet2" /> Funding Priority</button>
                <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('autoPaySetupModal')}><i className="bi bi-plus" /> Add Rule</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead><tr><th>Utility Service</th><th>Amount Rule</th><th>Timing Strategy</th><th>Funding Source</th><th>Smart Logic</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.autoPayRules.map((r) => (
                    <tr key={r.service}>
                      <td data-label="Utility Service"><div className="d-flex align-items-center gap-2"><div className={s.iconCircle} style={{ width: 32, height: 32, fontSize: 14, background: r.iconBg, color: r.iconColor }}><i className={`bi ${r.icon}`} /></div>{r.service}</div></td>
                      <td data-label="Amount Rule">{r.amountRule}</td>
                      <td data-label="Timing Strategy">{r.timing}</td>
                      <td data-label="Funding Source"><span className={`${s.badge} ${s[r.sourceTone]}`}>{r.source}</span></td>
                      <td data-label="Smart Logic">{r.smart}</td>
                      <td data-label="Status"><div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked={r.on} /></div></td>
                      <td data-label="Actions"><div className="d-flex" style={{ gap: 4 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('editAutoPayModal')}><i className="bi bi-pencil" /></button><button className={`${s.btnPm} ${s.btnSm}`} style={{ color: 'var(--pm-danger)' }} onClick={() => open('deleteRuleModal')}><i className="bi bi-trash" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2.10.2 — BUDGET & ALERTS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-piggy-bank" style={{ color: 'var(--pm-accent)' }} /> 3.6.2 — Budget Logic & Alert System</h3><p className={s.sectionSub}>Category budget tracking, rollover tools, overspend protection, and comprehensive notification tuning.</p></div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('alertSettingsModal')}><i className="bi bi-bell" /> Global Alerts</button>
                <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('editBudgetModal')}><i className="bi bi-sliders" /> Edit Limits</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Category Budgets</h4>
                  {config.budgets.map((b) => (
                    <div key={b.label} className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}><span>{b.label}</span><span>{b.used} / {b.budget} ({b.pct})</span></div>
                      <div className={s.progress}><div className={s.progressBar} style={{ width: b.pct, background: b.color }} /></div>
                    </div>
                  ))}
                  <div className="mt-3 p-3 rounded d-flex justify-content-between align-items-center" style={{ background: 'var(--pm-surface)', border: '1px solid var(--pm-border)' }}>
                    <div><strong style={{ fontSize: 13 }}>Rollover Enabled</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Unused budget flows to Savings</div></div>
                    <button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('rolloverSettingsModal')}>Configure</button>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Event Alert Toggles</h4>
                  {config.alertToggles.map((t) => (
                    <div key={t.label} className={s.switchItem}>
                      <div><strong>{t.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{t.sub}</div></div>
                      <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked={t.on} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2.10.3 — HOUSEHOLD */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-people" style={{ color: 'var(--pm-purple)' }} /> 3.6.3 — Household & Family Account Management</h3><p className={s.sectionSub}>Add dependents, spouses, or caretakers. Assign granular permission levels, budget limits, and split responsibilities.</p></div>
              <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('addMemberModal')}><i className="bi bi-person-plus" /> Add Member</button>
            </div>
            <div className="row g-3">
              {config.members.map((mem) => (
                <div key={mem.name} className="col-md-4">
                  <div className={s.memberCard}>
                    {mem.badge && <span className={`${s.badge} ${s.badgeS}`} style={{ position: 'absolute', top: 16, right: 16 }}>{mem.badge}</span>}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className={s.avatar} style={{ width: 48, height: 48, fontSize: 16, background: mem.gradient }}>{mem.initials}</div>
                      <div><h5 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{mem.name}</h5><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{mem.role}</div></div>
                    </div>
                    <div className="p-2 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 12 }}>
                      <div className="d-flex justify-content-between mb-1"><span>Spend Limit</span><strong>{mem.limit}</strong></div>
                      <div className={`d-flex justify-content-between ${mem.accessTone ?? ''}`}><span>{mem.badge ? 'Access' : 'Approvals'}</span><strong>{mem.access}</strong></div>
                    </div>
                    <div className="d-flex" style={{ gap: 8 }}>
                      {mem.actions.map((a) => (<button key={a.label} className={`${s.btnPm} ${s.btnSm} w-100 ${a.outline ? s.btnPmOutline : ''}`} onClick={() => open(a.modal)}>{a.label}</button>))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SettingsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
