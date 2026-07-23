import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/treasury-cash.module.css'
import TreasuryCashModals from '../components/TreasuryCashModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'
interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; progress?: { percent: number; color: string }; miniBars?: { height: string; color: string }[]; extra?: { label: string; value: string }[] }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface AccountRow { bank: string; account: string; balance: string; type: string; status: string; statusTone: BadgeTone; modal: string }
interface TransferRow { id: string; from: string; to: string; amount: string; status: string; statusTone: BadgeTone; modal: string }
interface FXRow { pair: string; rate: string; exposure: string; direction: string; status: string; statusTone: BadgeTone; modal: string }
interface InvestmentRow { type: string; amount: string; yieldRate: string; maturity: string; status: string; statusTone: BadgeTone; modal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }
interface TreasuryConfig {
  nav: NavItem[]; headerTitle: string; headerSub: string; searchPlaceholder: string; user: User
  breadcrumb: { parent: string; current: string }; pageTitle: string; pageSub: string; heroStats: HeroStat[]
  attentionItems: FeedItem[]; quickActions: QuickAction[]; accounts: AccountRow[]; transfers: TransferRow[]
  fxPositions: FXRow[]; investments: InvestmentRow[]
}

const initialMockData: TreasuryConfig = {
  nav: [
    { icon: 'bi-house', title: 'Dashboard' }, { icon: 'bi-shop', title: 'Collections' }, { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll' }, { icon: 'bi-send', title: 'Disbursements' }, { icon: 'bi-file-earmark-minus', title: 'Accounts Payable' },
    { icon: 'bi-bank', title: 'Treasury', active: true, dot: true }, { icon: 'bi-bar-chart-line', title: 'Analytics' }, { icon: 'bi-gear', title: 'Settings' },
  ],
  headerTitle: 'Corporate Solutions Ltd', headerSub: '6 Managed Accounts · Treasury Engine',
  searchPlaceholder: 'Search accounts, transfers, FX positions, investments...',
  user: { initials: 'EA', name: 'Esther A.', role: 'CFO / Treasury', avatarBg: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' },
  breadcrumb: { parent: 'Business Portal', current: 'Treasury & Cash' },
  pageTitle: 'PAGE 3.7 — Treasury, Cash Management & Forex',
  pageSub: 'Manage cash positions, inter-account transfers, FX, and investment portfolio.',
  heroStats: [
    { key: 'cash', col: 'col-lg-4', label: 'CASH POSITION', labelColor: 'rgba(255,255,255,.78)', value: 'KES 8.45M', badge: { icon: 'bi-bank', text: '6 accounts', tone: 'badgeI' }, progress: { percent: 55, color: 'var(--pm-accent)' } },
    { key: 'mmf', col: 'col-lg-2 col-md-4 col-6', label: 'MMF POSITION', value: 'KES 3.2M', badge: { icon: 'bi-graph-up', text: '+11% yield', tone: 'badgeS' } },
    { key: 'fx', col: 'col-lg-3 col-md-4 col-6', label: 'FX EXPOSURE', labelColor: 'var(--pm-warning)', value: 'USD 42K', badge: { icon: 'bi-arrow-down', text: 'KES 129.10', tone: 'badgeW' }, miniBars: [{ height: '40%', color: 'var(--pm-primary)' }, { height: '70%', color: 'var(--pm-warning)' }, { height: '55%', color: 'var(--pm-accent)' }] },
    { key: 'sweep', col: 'col-lg-3 col-md-4', label: 'AUTO-SWEEP STATUS', value: 'Active', badge: { icon: 'bi-check-circle', text: 'Running daily', tone: 'badgeS' } },
  ],
  attentionItems: [
    { icon: 'bi-shield-lock', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '3 Sweeps Require Approval', sub: 'KES 4.2M target balancing transfers', btnLabel: 'Review', modal: 'approvalQueueModal' },
    { icon: 'bi-graph-down-arrow', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'USD/KES Dropped to 129.10', sub: 'Hit target alert for vendor payment', btnLabel: 'Trade', modal: 'bookFXModal' },
    { icon: 'bi-calendar-check', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'T-Bill Maturity Tomorrow', sub: 'KES 5.0M principal + interest', btnLabel: 'Action', modal: 'investmentPortfolioModal' },
    { icon: 'bi-arrow-left-right', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Unreconciled Bank Statement', sub: 'Equity Bank main op account', btnLabel: 'Fix', modal: 'reconciliationModal' },
  ],
  quickActions: [
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-primary)', label: 'Transfer', modal: 'transferFundsModal' },
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-accent)', label: 'Add Account', modal: 'addAccountModal' },
    { icon: 'bi-currency-exchange', iconColor: 'var(--pm-warning)', label: 'Book FX', modal: 'bookFXModal' },
    { icon: 'bi-globe2', iconColor: 'var(--pm-info)', label: 'Cross Border', modal: 'crossBorderModal' },
    { icon: 'bi-graph-up-arrow', iconColor: 'var(--pm-purple)', label: 'Invest', modal: 'investCashModal' },
    { icon: 'bi-arrow-repeat', iconColor: 'var(--pm-accent)', label: 'Sweep', modal: 'sweepSetupModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-muted)', label: 'Reconcile', modal: 'reconciliationModal' },
    { icon: 'bi-clock-history', iconColor: 'var(--pm-primary)', label: 'Auto-Sweep', modal: 'autoSweepModal' },
  ],
  accounts: [
    { bank: 'Equity Bank', account: 'Main Operations', balance: 'KES 4.2M', type: 'Operating', status: 'Healthy', statusTone: 'badgeS', modal: 'accountDetailModal' },
    { bank: 'KCB', account: 'Business Savings', balance: 'KES 2.8M', type: 'Savings', status: 'Healthy', statusTone: 'badgeS', modal: 'accountDetailModal' },
    { bank: 'NCBA', account: 'Payroll Disbursement', balance: 'KES 1.45M', type: 'Payroll', status: 'Healthy', statusTone: 'badgeS', modal: 'accountDetailModal' },
    { bank: 'Co-op Bank', account: 'FX Reserve', balance: 'USD 42K', type: 'FX', status: 'Alert', statusTone: 'badgeW', modal: 'accountDetailModal' },
  ],
  transfers: [
    { id: 'TRF-0041', from: 'Equity → KCB', to: 'Savings', amount: 'KES 500K', status: 'Completed', statusTone: 'badgeS', modal: 'accountDetailModal' },
    { id: 'TRF-0040', from: 'KCB → NCBA', to: 'Payroll', amount: 'KES 1.4M', status: 'Pending', statusTone: 'badgeW', modal: 'approvalQueueModal' },
    { id: 'TRF-0039', from: 'Co-op → Equity', to: 'FX Settlement', amount: 'USD 10K', status: 'Completed', statusTone: 'badgeS', modal: 'accountDetailModal' },
  ],
  fxPositions: [
    { pair: 'USD/KES', rate: '129.10', exposure: 'USD 42K', direction: 'Short USD', status: 'Active', statusTone: 'badgeW', modal: 'bookFXModal' },
    { pair: 'EUR/KES', rate: '140.25', exposure: 'EUR 5K', direction: 'Neutral', status: 'No exposure', statusTone: 'badgeI', modal: 'bookFXModal' },
    { pair: 'GBP/KES', rate: '162.80', exposure: 'GBP 2K', direction: 'Long GBP', status: 'Profit', statusTone: 'badgeS', modal: 'bookFXModal' },
  ],
  investments: [
    { type: 'MMF (CIC)', amount: 'KES 3.2M', yieldRate: '11% p.a.', maturity: 'Open', status: 'Active', statusTone: 'badgeS', modal: 'investmentPortfolioModal' },
    { type: 'T-Bill 182-day', amount: 'KES 5.0M', yieldRate: '12.5%', maturity: 'Tomorrow', status: 'Maturing', statusTone: 'badgeW', modal: 'investmentPortfolioModal' },
    { type: 'Fixed Deposit', amount: 'KES 2.0M', yieldRate: '9%', maturity: '30 Aug 2025', status: 'Locked', statusTone: 'badgeI', modal: 'investmentPortfolioModal' },
  ],
}

async function fetchTreasuryData(): Promise<TreasuryConfig> {
  const res = await fetch('/api/business-dashboard/treasury-cash')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function TreasuryCash() {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const { data: apiData } = useQuery({ queryKey: ['treasury-cash'], queryFn: fetchTreasuryData, staleTime: 5 * 60 * 1000, retry: 1 })
  const config = apiData ?? initialMockData

  return (
    <div className={s.bizPage}>
      <aside className={s.sidebar}><div className={s.sidebarLogo}>PB</div>
        <nav className={s.sidebarNav}>{config.nav.map((n) => (<button key={n.title} className={`${s.navItem} ${n.active ? s.navItemActive : ''}`} title={n.title}><i className={`bi ${n.icon}`} />{n.dot && <span className={s.badgeDot} />}</button>))}</nav>
      </aside>
      <div className={s.main}>
        <header className={s.header}>
          <div className={s.headerTitle}><h1>{config.headerTitle}</h1><p>{config.headerSub}</p></div>
          <div className={s.headerSearch}><i className="bi bi-search" /><input type="text" placeholder={config.searchPlaceholder} /></div>
          <div className={s.headerActions}>
            <button className={s.headerBtn} onClick={() => setActiveModal('notificationsModal')}><i className="bi bi-bell" /><span className={s.counter}>3</span></button>
            <button className={s.profileBtn} onClick={() => setActiveModal('profileModal')}>
              <div className={s.avatar} style={{ background: config.user.avatarBg }}>{config.user.initials}</div>
              <div><div className={s.profileName}>{config.user.name}</div><div className={s.profileRole}>{config.user.role}</div></div>
            </button>
          </div>
        </header>
        <div className={s.pageBar}><div><div className={s.breadcrumb}><a href="#">{config.breadcrumb.parent}</a> · {config.breadcrumb.current}</div><h2 className={s.pageH2}>{config.pageTitle}</h2><p className={s.pageSub}>{config.pageSub}</p></div>
          <div className="d-flex gap-2"><button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('transferFundsModal')}><i className="bi bi-arrow-left-right" /> Transfer</button><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('addAccountModal')}><i className="bi bi-plus-circle" /> Add Account</button></div>
        </div>
        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">{config.heroStats.map((hs) => (<div key={hs.key} className={hs.col}>
            <div className={cx(s.card, hs.key === 'cash' ? s.cardAccent : '')} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(hs.key === 'cash' ? 'accountDetailModal' : hs.key === 'fx' ? 'bookFXModal' : hs.key === 'mmf' ? 'investmentPortfolioModal' : 'autoSweepModal')}>
              <div className={s.sl} style={hs.labelColor ? { color: hs.labelColor } : {}}>{hs.label}</div><div className={s.sv}>{hs.value}</div>
              {hs.badge && <span className={cx(s.badge, s[hs.badge.tone])}><i className={`bi ${hs.badge.icon}`} /> {hs.badge.text}</span>}
              {hs.progress && <div className={s.progress}><div className={s.progressBar} style={{ width: `${hs.progress.percent}%`, background: hs.progress.color }} /></div>}
              {hs.miniBars && <div className={s.miniBars}>{hs.miniBars.map((mb, i) => <div key={i} className={s.miniBar} style={{ height: mb.height, background: mb.color }} />)}</div>}
            </div></div>))}</div>

          {/* ATTENTION */}
          <div className={s.card}><h3 className={cx(s.st, 'text-danger')}><i className="bi bi-exclamation-triangle" style={{ color: 'var(--pm-danger)' }} /> Attention Required</h3>
            {config.attentionItems.map((ai) => (<div key={ai.title} className={s.feedItem}>
              <div className={s.iconCircle} style={{ background: ai.iconBg, color: ai.iconColor }}><i className={`bi ${ai.icon}`} /></div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ai.title}</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{ai.sub}</div></div>
              <button className={cx(s.btnPm, s.btnSm, ai.btnClass ? s[ai.btnClass] : '')} onClick={() => setActiveModal(ai.modal)}>{ai.btnLabel}</button>
            </div>))}</div>

          {/* QUICK ACTIONS */}
          <div className={s.card}><h3 className={s.st}><i className="bi bi-grid-3x3-gap" style={{ color: 'var(--pm-primary)' }} /> Quick Actions</h3>
            <div className={s.quickGrid}>{config.quickActions.map((qa) => (<button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}><i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />{qa.label}</button>))}</div></div>

          {/* 3.7.1 Cash Position & Accounts */}
          <div className={s.card}><div className="d-flex justify-content-between align-items-center mb-3"><div><h3 className={cx(s.st, 'text-primary')}><i className="bi bi-bank" style={{ color: 'var(--pm-primary)' }} /> 3.7.1 — Cash Position & Account Management</h3><p className={s.ss}>Manage multi-bank positions, balances, and account health.</p></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('addAccountModal')}><i className="bi bi-plus-circle" /> Add</button></div>
            <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Bank</th><th>Account</th><th>Balance</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{config.accounts.map((ar) => (<tr key={ar.bank + ar.account}><td><strong>{ar.bank}</strong></td><td>{ar.account}</td><td>{ar.balance}</td><td>{ar.type}</td><td><span className={cx(s.badge, s[ar.statusTone])}>{ar.status}</span></td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(ar.modal)}>Detail</button></td></tr>))}</tbody></table></div></div>

          {/* 3.7.2 Fund Transfers */}
          <div className={s.card}><div className="d-flex justify-content-between align-items-center mb-3"><div><h3 className={cx(s.st, 'text-accent')}><i className="bi bi-arrow-left-right" style={{ color: 'var(--pm-accent)' }} /> 3.7.2 — Fund Transfers & Inter-Account</h3><p className={s.ss}>Move funds across accounts with maker-checker approval.</p></div><button className={cx(s.btnPm, s.btnSm, s.btnPmA)} onClick={() => setActiveModal('transferFundsModal')}><i className="bi bi-arrow-left-right" /> Transfer</button></div>
            <div className="table-responsive"><table className={s.tbl}><thead><tr><th>ID</th><th>From → To</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{config.transfers.map((tr) => (<tr key={tr.id}><td><strong>{tr.id}</strong></td><td>{tr.from}</td><td>{tr.amount}</td><td><span className={cx(s.badge, s[tr.statusTone])}>{tr.status}</span></td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(tr.modal)}>View</button></td></tr>))}</tbody></table></div></div>

          {/* 3.7.3 Forex & Cross-Border */}
          <div className={s.card}><div className="d-flex justify-content-between align-items-center mb-3"><div><h3 className={cx(s.st, 'text-warning')}><i className="bi bi-currency-exchange" style={{ color: 'var(--pm-warning)' }} /> 3.7.3 — Forex & Cross-Border</h3><p className={s.ss}>Monitor FX positions, book trades, manage cross-border payments.</p></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('bookFXModal')}><i className="bi bi-currency-exchange" /> Book FX</button></div>
            <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Pair</th><th>Rate</th><th>Exposure</th><th>Direction</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{config.fxPositions.map((fx) => (<tr key={fx.pair}><td><strong>{fx.pair}</strong></td><td>{fx.rate}</td><td>{fx.exposure}</td><td>{fx.direction}</td><td><span className={cx(s.badge, s[fx.statusTone])}>{fx.status}</span></td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(fx.modal)}>Trade</button></td></tr>))}</tbody></table></div></div>

          {/* 3.7.4 Investment & MMF */}
          <div className={s.card}><div className="d-flex justify-content-between align-items-center mb-3"><div><h3 className={cx(s.st, 'text-purple')}><i className="bi bi-graph-up-arrow" style={{ color: 'var(--pm-purple)' }} /> 3.7.4 — Investment & MMF Portfolio</h3><p className={s.ss}>Manage money market funds, T-bills, and fixed deposits.</p></div><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('investCashModal')}><i className="bi bi-graph-up-arrow" /> Invest</button></div>
            <div className="table-responsive"><table className={s.tbl}><thead><tr><th>Type</th><th>Amount</th><th>Yield</th><th>Maturity</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{config.investments.map((inv) => (<tr key={inv.type}><td><strong>{inv.type}</strong></td><td>{inv.amount}</td><td>{inv.yieldRate}</td><td>{inv.maturity}</td><td><span className={cx(s.badge, s[inv.statusTone])}>{inv.status}</span></td><td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(inv.modal)}>View</button></td></tr>))}</tbody></table></div></div>
        </div>
      </div>
      <TreasuryCashModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
