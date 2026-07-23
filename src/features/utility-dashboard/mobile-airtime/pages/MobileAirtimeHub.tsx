import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/mobile-airtime.module.css'
import MobileAirtimeModals from '../components/MobileAirtimeModals'
import { initialMockData, fetchMobileAirtimeHub } from '../data/mobileAirtimeData'

const s = styles as Record<string, string>

export default function MobileAirtimeHub() {
  const { data } = useQuery({ queryKey: ['mobile-airtime-hub'], queryFn: fetchMobileAirtimeHub, staleTime: 60_000, retry: 1 })
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
            <button className={s.btnPm} onClick={() => open('agentLocatorModal')}><i className="bi bi-geo-alt text-primary" /> Find Agent</button>
            <button className={s.btnPm} onClick={() => open('addPhoneNumberModal')}><i className="bi bi-sim text-info" /> Link Line</button>
            <button className={`${s.btnPm} ${s.btnPmI}`} onClick={() => open('buyAirtimeModal')}><i className="bi bi-phone" /> Buy Airtime</button>
            <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => open('sendMoneyCrossNetworkModal')}><i className="bi bi-send" /> Send Money</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <div className={`${s.card} ${s.cardAccent}`} style={{ minHeight: 160, background: 'var(--pm-gradient-mint)' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <p className={s.sl} style={{ color: 'rgba(255,255,255,0.85)' }}>M-PESA WALLET BALANCE</p>
                  <i className="bi bi-shield-check" style={{ color: '#A7F3D0' }} />
                </div>
                <div className={s.sv} style={{ margin: '6px 0', color: '#fff' }}>{config.hero.balance}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 16 }}>
                  <div>Total Received Today: <strong>{config.hero.received}</strong></div>
                  <div>Total Sent Today: <strong>{config.hero.sent}</strong></div>
                </div>
              </div>
            </div>
            {config.statCards.map((st) => (
              <div key={st.key} className="col-lg-3 col-md-6">
                <div className={s.card} style={{ minHeight: 160, ...(st.accentBorder ? { borderLeft: `3px solid ${st.accentBorder}` } : {}) }}>
                  <p className={s.sl} style={{ color: st.labelColor }}>{st.label}</p>
                  <div className={s.sv} style={{ margin: '6px 0' }}>{st.value}</div>
                  <span className={`${s.badge} ${s[st.badge.tone]}`}><i className={`bi ${st.badge.icon}`} /> {st.badge.text}</span>
                  {st.lines && (<div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{st.lines.map((l) => (<div key={l.l} className="d-flex justify-content-between"><span>{l.l}</span><strong>{l.v}</strong></div>))}</div>)}
                  {st.progress && (<div className="mt-3"><div className="d-flex justify-content-between mb-1" style={{ fontSize: 11, color: 'var(--pm-muted)' }}><span>{st.progress.label}</span><span>{st.progress.left}</span></div><div className={s.progress}><div className={s.progressBar} style={{ width: st.progress.pct, background: st.progress.color }} /></div></div>)}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}>Attention Required</h3><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('attentionDetailModal')}>View all</button></div>
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
                <div className="mb-3"><h3 className={s.sectionTitle}>Mobile Money Actions</h3><p className={s.sectionSub}>Frequent transfers and airtime operations</p></div>
                <div className={s.quickActionGrid}>
                  {config.quickActions.map((a) => (<button key={a.label} className={s.quickActionBtn} onClick={() => open(a.modal)}><i className={`bi ${a.icon}`} style={{ color: a.iconColor }} /> {a.label}</button>))}
                </div>
              </div>
            </div>
          </div>

          {/* 3.5.1 — AIRTIME & DATA */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-sim" style={{ color: 'var(--pm-accent)' }} /> 3.5.1 — Airtime & Data Management</h3><p className={s.sectionSub}>Unified dashboard for Safaricom, Airtel, and Telkom balances, bundle status, and auto-renewals.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('airtimeAutoRenewModal')}><i className="bi bi-arrow-repeat" /> Auto-Renew</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('addPhoneNumberModal')}><i className="bi bi-plus-lg" /> Link Line</button></div>
            </div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead><tr><th>Phone Number</th><th>Network</th><th>Airtime Balance</th><th>Active Data</th><th>Voice/SMS</th><th>Auto-Renew</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.lines.map((ln) => (
                    <tr key={ln.phone}>
                      <td data-label="Phone Number"><strong>{ln.phone}</strong> {ln.isDefault && <span className={`${s.badge} ms-1`} style={{ background: 'var(--pm-surface-2)' }}>Default</span>}</td>
                      <td data-label="Network"><span style={{ color: ln.networkColor, fontWeight: 600 }}>{ln.network}</span></td>
                      <td data-label="Airtime Balance">{ln.airtime}</td>
                      <td data-label="Active Data">{ln.data}</td>
                      <td data-label="Voice/SMS">{ln.voice}</td>
                      <td data-label="Auto-Renew"><span className={`${s.badge} ${s[ln.autoRenewTone]}`}>{ln.autoRenew}</span></td>
                      <td data-label="Actions"><div className="d-flex" style={{ gap: 4 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open(ln.topupModal)}>Top-up</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('manageLinkedLineModal')}><i className="bi bi-gear" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.5.2 — INTEROPERABILITY & AGENTS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-shuffle" style={{ color: 'var(--pm-info)' }} /> 3.5.2 — Mobile Money Interoperability & Agents</h3><p className={s.sectionSub}>Cross-network transfers, transparent fee calculator, and nearby agent locator with GPS.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('linkBankAccountModal')}><i className="bi bi-bank" /> Link Bank</button><button className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`} onClick={() => open('sendMoneyCrossNetworkModal')}><i className="bi bi-send" /> Send Money</button></div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Interoperability Transfer Network</h4>
                  {config.interop.map((r) => (
                    <div key={r.title} className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ gap: 8 }}>
                      <div className="d-flex align-items-center" style={{ gap: 8, minWidth: 0 }}>
                        <div className={s.iconCircle} style={{ background: r.bg, color: r.color }}><i className={`bi ${r.icon}`} /></div>
                        <div style={{ minWidth: 0 }}><strong>{r.title}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r.sub}</div></div>
                      </div>
                      <span className={`${s.badge} ${s[r.tone]}`}>{r.fee}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={s.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: 8 }}><h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Nearby Agents Locator</h4><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('agentLocatorModal')}><i className="bi bi-map" /> Map</button></div>
                  <div className="p-3 rounded mb-3 text-center" style={{ background: 'var(--pm-surface)', border: '1px dashed var(--pm-border)' }}>
                    <i className="bi bi-map text-muted" style={{ fontSize: 32 }} />
                    <div style={{ fontWeight: 600, marginTop: 8 }}>Located 3 agents near Kilimani</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>GPS active · Loita Plains, Nairobi</div>
                  </div>
                  {config.agents.map((a) => (<div key={a.name} className={s.statusRow}><div><strong>{a.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{a.sub} · {a.dist}</div></div><span className={`${s.badge} ${s[a.tone]}`}>{a.badge}</span></div>))}
                </div>
              </div>
            </div>
          </div>

          {/* 3.5.3 — M-PESA DEEP INTEGRATION SUITE */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div><h3 className={s.sectionTitle}><i className="bi bi-shield-check" style={{ color: 'var(--pm-purple)' }} /> 3.5.3 — M-Pesa Deep Integration Suite</h3><p className={s.sectionSub}>Manage your Fuliza limit, M-Shwari savings, Mali investments, Pochi la Biashara and Global transfers directly.</p></div>
              <div className="d-flex" style={{ gap: 8 }}><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('mobileMoneyAnalyticsModal')}><i className="bi bi-graph-up" /> M-Pesa Analytics</button></div>
            </div>
            <div className="row g-3">
              {config.suite.map((c) => (
                <div key={c.title} className="col-md-4">
                  <div className={`${s.utilityBlock} text-center`} style={{ height: '100%' }}>
                    <div className={`${s.iconCircle} mx-auto mb-2`} style={{ background: c.bg, color: c.color }}><i className={`bi ${c.icon}`} /></div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{c.title}</h4>
                    <p style={{ fontSize: 11, color: 'var(--pm-muted)', margin: '4px 0 12px' }}>{c.sub}</p>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c.valueColor ?? 'var(--pm-ink)' }}>{c.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{c.meta}</div>
                    <button className={`${s.btnPm} ${s.btnSm} w-100 mt-3 ${c.actionClass ? s[c.actionClass] : ''}`} onClick={() => open(c.modal)}>{c.actionLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3"><h3 className={s.sectionTitle}><i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent Mobile Money & Airtime Transactions</h3><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('transactionHistoryModal')}>View All</button></div>
            <div className="table-responsive">
              <table className={s.table}>
                <thead><tr><th>Date</th><th>Type</th><th>Details</th><th>Amount</th><th>Network/Wallet</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {config.transactions.map((t, i) => (
                    <tr key={i}>
                      <td data-label="Date">{t.date}</td>
                      <td data-label="Type">{t.type}</td>
                      <td data-label="Details">{t.details}</td>
                      <td data-label="Amount"><strong style={{ color: t.amountColor }}>{t.amount}</strong></td>
                      <td data-label="Network/Wallet">{t.network}</td>
                      <td data-label="Status"><span className={`${s.badge} ${s[t.tone]}`}>{t.status}</span></td>
                      <td data-label="Action"><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => open('receiptModal')}><i className="bi bi-receipt" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <MobileAirtimeModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={open} />
    </div>
  )
}
