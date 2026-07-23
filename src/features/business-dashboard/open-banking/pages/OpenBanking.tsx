import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/open-banking.module.css'
import OpenBankingModals from '../components/OpenBankingModals'

/* ============================================================================
   PayMo BaaS — Open Banking & Account Aggregation (legacy page 3.10)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface User { initials: string; name: string; role: string }
interface BankAccount { bank: string; account: string; type: string; balance: string; status: string; statusTone: BadgeTone; consent: string; sync: string; color: string }
interface TransferRow { date: string; from: string; to: string; amount: string; status: string; statusTone: BadgeTone; ref: string }
interface StandingOrder { label: string; detail: string; modal: string }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface ReconMatch { desc: string; amount: string; bank: string; confidence: number; status: string; statusTone: BadgeTone }
interface NotifItem { bg: string; textColor: string; title: string; sub: string }

interface OBConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; mid: string; current: string }
  pageTitle: string
  pageSub: string
  bankAccounts: BankAccount[]
  transferRows: TransferRow[]
  standingOrders: StandingOrder[]
  attentionItems: AttentionItem[]
  suggestions: SuggestionItem[]
  quickActions: QuickAction[]
  reconMatches: ReconMatch[]
  notifications: NotifItem[]
}

const initialMockData: OBConfig = {
  nav: [
    { icon: 'bi-house', title: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', title: 'Overview' },
    { icon: 'bi-lightning-charge', title: 'Payments' },
    { icon: 'bi-wallet2', title: 'Treasury' },
    { icon: 'bi-credit-card-2-front', title: 'Cards' },
    { icon: 'bi-bank2', title: 'Open Banking', active: true, dot: true },
    { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Open Banking & Account Aggregation',
  headerSub: 'Linked bank accounts, consolidated cash view, PesaLink transfers, transaction analytics and reconciliation',
  searchPlaceholder: 'Search linked accounts, banks, transactions, reconciliation...',
  user: { initials: 'JK', name: 'James K.', role: 'Treasury Manager' },
  breadcrumb: { parent: 'Business Portal', mid: 'Treasury', current: 'Open Banking' },
  pageTitle: 'PAGE 3.10 — Open Banking & Account Aggregation',
  pageSub: 'Connect bank accounts via PesaLink, view consolidated cash positions, execute instant transfers, reconcile transactions, and analyse multi-bank cash flow — all within a single secure dashboard.',
  bankAccounts: [
    { bank: 'Equity Bank', account: '****4521', type: 'Business Current', balance: 'KES 4,250,000', status: 'Active', statusTone: 'badgeS', consent: 'Valid', sync: 'Live', color: 'var(--pm-danger)' },
    { bank: 'KCB Bank', account: '****7782', type: 'Business Current', balance: 'KES 42,100', status: 'Active', statusTone: 'badgeW', consent: 'Valid', sync: 'Live', color: 'var(--pm-accent)' },
    { bank: 'Co-op Bank', account: '****3390', type: 'Savings', balance: 'KES 8,900,000', status: 'Active', statusTone: 'badgeS', consent: 'Expiring', sync: 'Live', color: 'var(--pm-info)' },
    { bank: 'Stanbic Bank', account: '****9912', type: 'Business Current', balance: 'KES 1,850,000', status: 'Active', statusTone: 'badgeS', consent: 'Valid', sync: 'Live', color: 'var(--pm-purple)' },
    { bank: 'NCBA Bank', account: '****1128', type: 'Call Deposit', balance: 'KES 2,400,000', status: 'Active', statusTone: 'badgeS', consent: 'Valid', sync: 'Live', color: 'var(--pm-warning)' },
    { bank: 'Family Bank', account: '****5543', type: 'Business Current', balance: 'KES 0', status: 'Link Expired', statusTone: 'badgeD', consent: 'Expired', sync: 'Paused', color: 'var(--pm-muted)' },
    { bank: 'I&M Bank', account: '****6671', type: 'Foreign Currency', balance: 'USD 12,500', status: 'Active', statusTone: 'badgeS', consent: 'Valid', sync: 'Live', color: 'var(--pm-accent)' },
  ],
  transferRows: [
    { date: '27 Jun 14:32', from: 'Equity', to: 'KCB', amount: 'KES 850,000', status: 'Instant', statusTone: 'badgeS', ref: 'PL-442189' },
    { date: '27 Jun 11:04', from: 'Co-op', to: 'Equity', amount: 'KES 1,200,000', status: 'Instant', statusTone: 'badgeS', ref: 'PL-442155' },
    { date: '26 Jun 16:55', from: 'Stanbic', to: 'NCBA', amount: 'KES 320,000', status: 'Instant', statusTone: 'badgeS', ref: 'PL-441902' },
    { date: '26 Jun 09:12', from: 'Equity', to: 'Family', amount: 'KES 500,000', status: 'Pending', statusTone: 'badgeI', ref: 'PL-441784' },
  ],
  standingOrders: [
    { label: 'Payroll to KCB', detail: 'KES 2.4M • Every 25th', modal: 'scheduleTransferModal' },
    { label: 'Rent to NCBA', detail: 'KES 185K • Monthly 1st', modal: 'scheduleTransferModal' },
    { label: 'Utilities to Equity', detail: 'KES 320K • Auto', modal: 'scheduleTransferModal' },
    { label: 'Insurance to Stanbic', detail: 'KES 92K • Quarterly', modal: 'scheduleTransferModal' },
  ],
  attentionItems: [
    { icon: 'bi-bank', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'KCB account balance below minimum', sub: 'KES 42,100 · minimum KES 50,000', btnLabel: 'Top-up', modal: 'transferModal' },
    { icon: 'bi-list-check', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '14 unreconciled transactions', sub: 'Equity & Stanbic accounts', btnLabel: 'Reconcile', modal: 'reconcileModal' },
    { icon: 'bi-clock', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Co-op consent expires in 7 days', sub: 'Re-authenticate before 04 Jul', btnLabel: 'Renew', modal: 'connectBankModal' },
    { icon: 'bi-exclamation-diamond', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Family Bank link expired', sub: 'Reconnect to resume sync', btnLabel: 'Reconnect', modal: 'reauthModal' },
  ],
  suggestions: [
    { icon: 'bi-lightbulb', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Close 3 low-activity accounts', sub: 'Save KES 18,200/year in fees', btnLabel: 'Optimize', modal: 'optimizeModal' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Enable auto-reconciliation', sub: 'Match 94% of transactions automatically', btnLabel: 'Enable', modal: 'obSettingsModal' },
    { icon: 'bi-graph-up', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Consolidate idle balances', sub: 'KES 2.1M in low-interest accounts', btnLabel: 'Move', modal: 'transferModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Schedule bulk transfers', sub: 'Save 2 hours/week on recurring payments', btnLabel: 'Setup', modal: 'scheduleTransferModal' },
  ],
  quickActions: [
    { icon: 'bi-plus-lg', iconColor: 'var(--pm-primary)', label: 'Connect Bank', modal: 'connectBankModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-accent)', label: 'Transfer', modal: 'transferModal' },
    { icon: 'bi-list-check', iconColor: 'var(--pm-info)', label: 'Reconcile', modal: 'reconcileModal' },
    { icon: 'bi-clock', iconColor: 'var(--pm-warning)', label: 'Schedule', modal: 'scheduleTransferModal' },
    { icon: 'bi-download', iconColor: 'var(--pm-purple)', label: 'Export', modal: 'exportStatementModal' },
    { icon: 'bi-gear', iconColor: 'var(--pm-muted)', label: 'Settings', modal: 'obSettingsModal' },
  ],
  reconMatches: [
    { desc: 'Invoice INV-4421 • ABC Ltd', amount: 'KES 1,850,000', bank: 'Equity', confidence: 98, status: 'Matched', statusTone: 'badgeS' },
    { desc: 'Supplier payment • XYZ Corp', amount: 'KES 425,000', bank: 'Co-op', confidence: 95, status: 'Matched', statusTone: 'badgeS' },
    { desc: 'Unknown credit', amount: 'KES 120,000', bank: 'Stanbic', confidence: 45, status: 'Unmatched', statusTone: 'badgeW' },
    { desc: 'Duplicate debit', amount: 'KES 85,000', bank: 'Equity', confidence: 0, status: 'Exception', statusTone: 'badgeD' },
  ],
  notifications: [
    { bg: 'var(--pm-danger-soft)', textColor: '#7F1D1D', title: 'KCB balance below minimum', sub: 'KES 42,100 (min KES 50,000)' },
    { bg: 'var(--pm-warning-soft)', textColor: '#92400E', title: 'Co-op consent expires in 7 days', sub: 'Re-authenticate before 04 Jul' },
    { bg: 'var(--pm-info-soft)', textColor: '#1E40AF', title: '14 transactions unmatched', sub: 'Requires reconciliation review' },
    { bg: 'var(--pm-accent-soft)', textColor: '#065F46', title: 'Transfer PL-442189 completed', sub: 'KES 850,000 to KCB ****7782' },
    { bg: '#fff', textColor: 'var(--pm-muted)', title: 'Family Bank link expired', sub: 'Reconnect to resume sync' },
  ],
}

async function fetchOBContent(): Promise<OBConfig> {
  const res = await fetch('/api/business/open-banking')
  if (!res.ok) throw new Error('Failed to fetch open banking data')
  return res.json()
}

export default function OpenBanking() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['business-open-banking'],
    queryFn: fetchOBContent,
    staleTime: 5 * 60_000,
    retry: 1,
  })
  const config = apiData ?? initialMockData

  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  if (isLoading) {
    return (
      <div className="container-fluid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className={s.spinner} />
        <span style={{ marginTop: 12, fontWeight: 600, color: 'var(--pm-primary)' }}>Loading workspace…</span>
      </div>
    )
  }

  return (
    <div className={cx(s.bizPage, 'container-fluid')}>
      {/* SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}>P</div>
        <nav className={s.sidebarNav}>
          {config.nav.map((n, i) => (
            <button key={i} className={`${s.navItem} ${n.active ? s.navItemActive : ''}`} title={n.title}>
              <i className={`bi ${n.icon}`} />
              {n.dot && <span className={s.badgeDot} />}
            </button>
          ))}
        </nav>
        <button className={s.sidebarHelp} title="Help"><i className="bi bi-question-circle" /></button>
      </aside>

      {/* MAIN */}
      <div className={s.main}>
        {/* HEADER */}
        <header className={s.header}>
          <div className={s.headerTitle} style={{ flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className={cx(s.avatar, s.avatarLarge)}>BK</div>
              <div>
                <h1>{config.headerTitle}</h1>
                <p>{config.headerSub}</p>
              </div>
            </div>
          </div>
          <div className={s.headerSearch}>
            <i className="bi bi-search" />
            <input type="text" placeholder={config.searchPlaceholder} />
          </div>
          <div className={s.headerActions}>
            <button className={s.headerBtn} onClick={() => setActiveModal('healthCheckModal')}><i className="bi bi-heart-pulse" /></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('notifModal')}><i className="bi bi-bell" /><span className={s.counter}>9</span></button>
            <div className={s.profileBtn} onClick={() => setActiveModal('profileModal')}>
              <div className={s.avatar}>{config.user.initials}</div>
              <div>
                <div className={s.profileName}>{config.user.name}</div>
                <div className={s.profileRole}>{config.user.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE BAR */}
        <div className={s.pageBar}>
          <div>
            <div className={s.breadcrumb}><a href="#">Home</a> / <a href="#">{config.breadcrumb.parent}</a> / <strong>{config.breadcrumb.current}</strong></div>
            <h2 className={s.pageH2}>{config.pageTitle}</h2>
            <p className={s.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={s.btnPm} onClick={() => setActiveModal('healthCheckModal')}><i className="bi bi-heart-pulse" /> Health Check</button>
            <button className={s.btnPm} onClick={() => setActiveModal('reconcileModal')}><i className="bi bi-list-check" /> Reconcile</button>
            <button className={s.btnPm} onClick={() => setActiveModal('transferModal')}><i className="bi bi-arrow-left-right" /> Transfer</button>
            <button className={cx(s.btnPm, s.btnPmP)} onClick={() => setActiveModal('connectBankModal')}><i className="bi bi-plus-lg" /> Connect Bank</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Open banking hub live <span style={{ color: '#86efac' }}>●</span></p>
                <div className={s.sv} style={{ margin: '8px 0', color: '#fff' }}>7 bank accounts connected</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Equity, KCB, Co-op, Stanbic, Family, NCBA, I&M — consolidated view across all business and personal accounts.</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('connectBankModal')}>Connect</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('transferModal')}>Transfer</button>
                  <button className={cx(s.btnPm, s.btnSm)} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('reconcileModal')}>Reconcile</button>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: 'var(--pm-accent)' }}>TOTAL CASH POSITION</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>KES 18.7M</div>
                <span className={cx(s.badge, s.badgeS)}><i className="bi bi-graph-up" /> +12.4% MoM</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Available: KES 14.2M<br />Pending: KES 4.5M</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6">
              <div className={s.card} style={{ minHeight: 170 }}>
                <p className={s.sl} style={{ color: 'var(--pm-info)' }}>INSTANT TRANSFERS (MTD)</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>KES 41.2M</div>
                <span className={cx(s.badge, s.badgeI)}><i className="bi bi-lightning-charge" /> 186 transfers</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Avg settlement: 12 seconds<br />Success rate: 99.7%</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4">
              <div className={s.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-warning)' }}>
                <p className={s.sl} style={{ color: 'var(--pm-warning)' }}>RECONCILIATION STATUS</p>
                <div className={s.sv} style={{ margin: '6px 0' }}>94.8%</div>
                <span className={cx(s.badge, s.badgeW)}><i className="bi bi-exclamation-triangle" /> 14 exceptions</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Auto-matched: 412<br />Manual review: 14</div>
              </div>
            </div>
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.st}>Attention Required</h3>
                  <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('attentionModal')}>View all</button>
                </div>
                {config.attentionItems.map((item) => (
                  <div key={item.title} className={s.statusRow}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}><i className={`bi ${item.icon}`} /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(item.modal)}>{item.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={s.st}>Smart Suggestions</h3>
                  <span className={cx(s.badge, s.badgeP)}><i className="bi bi-stars" /> AI</span>
                </div>
                {config.suggestions.map((item) => (
                  <div key={item.title} className={s.statusRow}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={cx(s.iconCircle, s.iconCircleSm)} style={{ background: item.iconBg, color: item.iconColor }}><i className={`bi ${item.icon}`} /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(item.modal)}>{item.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={s.card}>
                <div className="mb-3">
                  <h3 className={s.st}>Quick Actions</h3>
                  <p className={s.ss}>Frequent banking workflows</p>
                </div>
                <div className={s.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                      <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.10.1: Linked Bank Accounts */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-bank" style={{ color: 'var(--pm-primary)' }} /> 3.10.1 — Linked Bank Accounts & Consolidated Cash View</h3>
                <p className={s.ss}>View all connected bank accounts, balances, consent status, and sync health in one unified dashboard.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('manageLinksModal')}><i className="bi bi-gear" /> Manage</button>
                <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('connectBankModal')}><i className="bi bi-plus-lg" /> Connect</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Bank</th><th>Account</th><th>Type</th><th>Balance</th><th>Consent</th><th>Sync</th><th>Actions</th></tr></thead>
                      <tbody>
                        {config.bankAccounts.map((ba) => (
                          <tr key={ba.account}>
                            <td><strong>{ba.bank}</strong></td>
                            <td>{ba.account}</td>
                            <td>{ba.type}</td>
                            <td><strong>{ba.balance}</strong></td>
                            <td><span className={cx(s.badge, ba.consent === 'Valid' ? s.badgeS : ba.consent === 'Expiring' ? s.badgeW : s.badgeD)}>{ba.consent}</span></td>
                            <td><span className={cx(s.badge, ba.sync === 'Live' ? s.badgeS : s.badgeW)}>{ba.sync}</span></td>
                            <td>
                              <div className="d-flex" style={{ gap: 4 }}>
                                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('transferModal')}>Transfer</button>
                                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('accountDetailModal')}>View</button>
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
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Consolidated Position</h4>
                  <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)' }}>
                    <div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>TOTAL AVAILABLE CASH</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-accent)' }}>KES 14.2M</div>
                  </div>
                  <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)' }}>
                    <div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 700 }}>PENDING SETTLEMENTS</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--pm-info)' }}>KES 4.5M</div>
                  </div>
                  <div className="p-3 rounded" style={{ background: 'var(--pm-surface)' }}>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)', fontWeight: 700 }}>7-DAY FORECAST</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-primary)' }}>KES 22.1M</div>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Expected inflows: KES 8.3M</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.10.2: Transfers */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-arrow-left-right" style={{ color: 'var(--pm-accent)' }} /> 3.10.2 — Instant Transfers, Standing Orders & Scheduled Payments</h3>
                <p className={s.ss}>Execute real-time PesaLink transfers, create recurring payment schedules, and manage standing orders across all linked banks.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('transferModal')}><i className="bi bi-send" /> New Transfer</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('scheduleTransferModal')}><i className="bi bi-clock" /> Schedule</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-5">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Recent Transfers</h4>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Date</th><th>From → To</th><th>Amount</th><th>Status</th><th>Ref</th></tr></thead>
                      <tbody>
                        {config.transferRows.map((t) => (
                          <tr key={t.ref}>
                            <td>{t.date}</td>
                            <td>{t.from} → {t.to}</td>
                            <td><strong>{t.amount}</strong></td>
                            <td><span className={cx(s.badge, s[t.statusTone])}>{t.status}</span></td>
                            <td>{t.ref}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Standing Orders</h4>
                  {config.standingOrders.map((so) => (
                    <div key={so.label} className={s.statusRow}>
                      <div><strong>{so.label}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{so.detail}</div></div>
                      <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(so.modal)}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-3">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Quick Transfer</h4>
                  <div className="mb-3"><label className={s.formLabel}>From</label>
                    <select className={s.formControl}><option>Equity ****4521</option><option>Co-op ****3390</option><option>Stanbic ****9912</option></select>
                  </div>
                  <div className="mb-3"><label className={s.formLabel}>To</label>
                    <select className={s.formControl}><option>KCB ****7782</option><option>NCBA ****1128</option><option>Family ****5543</option></select>
                  </div>
                  <div className="mb-3"><label className={s.formLabel}>Amount (KES)</label><input className={s.formControl} defaultValue="500000" /></div>
                  <button className={cx(s.btnPm, s.btnPmP, 'w-100')} onClick={() => setActiveModal('transferModal')}>Send Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.10.3: Reconciliation */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-list-check" style={{ color: 'var(--pm-warning)' }} /> 3.10.3 — Multi-Bank Reconciliation & Matching</h3>
                <p className={s.ss}>Auto-match transactions across banks, review exceptions, and resolve discrepancies in real-time.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('reconcileModal')}><i className="bi bi-play" /> Run Now</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('exportStatementModal')}><i className="bi bi-download" /> Export</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Match Queue</h4>
                  <div className="table-responsive">
                    <table className={s.tbl}>
                      <thead><tr><th>Description</th><th>Amount</th><th>Bank</th><th>Confidence</th><th>Status</th></tr></thead>
                      <tbody>
                        {config.reconMatches.map((m) => (
                          <tr key={m.desc}>
                            <td>{m.desc}</td>
                            <td><strong>{m.amount}</strong></td>
                            <td>{m.bank}</td>
                            <td>{m.confidence > 0 ? `${m.confidence}%` : '—'}</td>
                            <td><span className={cx(s.badge, s[m.statusTone])}>{m.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Reconciliation Summary</h4>
                  <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-accent-soft)' }}>
                    <div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>AUTO-MATCHED</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-accent)' }}>412</div>
                  </div>
                  <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
                    <div style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>MANUAL REVIEW</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-warning)' }}>14</div>
                  </div>
                  <div className="p-3 rounded" style={{ background: 'var(--pm-danger-soft)' }}>
                    <div style={{ fontSize: 11, color: '#991B1B', fontWeight: 700 }}>EXCEPTIONS</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-danger)' }}>3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.10.4: Analytics & Settings */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={s.st}><i className="bi bi-gear" style={{ color: 'var(--pm-purple)' }} /> 3.10.4 — Analytics, Preferences & API Management</h3>
                <p className={s.ss}>Track multi-bank performance, configure open banking preferences, and manage API integrations.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('bankBenchmarkModal')}><i className="bi bi-bar-chart" /> Benchmark</button>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('obSettingsModal')}><i className="bi bi-gear" /> Settings</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Bank Performance</h4>
                  <div className={s.statusRow}><div><strong>Equity</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>8s settlement</div></div><span className={cx(s.badge, s.badgeS)}>98</span></div>
                  <div className={s.statusRow}><div><strong>KCB</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>12s settlement</div></div><span className={cx(s.badge, s.badgeS)}>96</span></div>
                  <div className={s.statusRow}><div><strong>Co-op</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>15s settlement</div></div><span className={cx(s.badge, s.badgeS)}>94</span></div>
                  <div className={s.statusRow}><div><strong>Family</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>18s settlement</div></div><span className={cx(s.badge, s.badgeW)}>71</span></div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>API Connections</h4>
                  <div className={s.statusRow}><div><strong>PesaLink API</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Instant transfers</div></div><span className={cx(s.badge, s.badgeS)}>Active</span></div>
                  <div className={s.statusRow}><div><strong>Equity Eazzy Banking</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Balance & statements</div></div><span className={cx(s.badge, s.badgeS)}>Active</span></div>
                  <div className={s.statusRow}><div><strong>KCB API</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Payments & balance</div></div><span className={cx(s.badge, s.badgeS)}>Active</span></div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={s.utilityBlock}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Quick Reports</h4>
                  <div className={s.quickGrid}>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportStatementModal')}>Multi-Bank Statement</button>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportStatementModal')}>Cash Flow Report</button>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportStatementModal')}>Transfer History</button>
                    <button className={s.quickBtn} onClick={() => setActiveModal('exportStatementModal')}>Recon Summary</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <OpenBankingModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
