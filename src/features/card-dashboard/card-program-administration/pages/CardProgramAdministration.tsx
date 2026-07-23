import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/card-program-administration.module.css'
import CardProgramAdministrationModals from '../components/CardProgramAdministrationModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; active?: boolean; dot?: boolean }
interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; lines: string[]; warnBorder?: boolean }
interface AlertItem { initials: string; color: string; iconColor: string; title: string; sub: string; btnLabel: string; btnTone: BadgeTone; modal: string }
interface SuggestionItem { initials: string; color: string; iconColor: string; title: string; sub: string; btnLabel: string; modal: string }
interface ActionItem { icon: string; color: string; label: string; modal: string }
interface BinRow { bin: string; program: string; type: string; network: string; networkColor: string; issued: string; spend: string; status: string; statusTone: BadgeTone; btnLabel: string; modal: string }
interface SupportRow { name: string; sub: string; btnLabel: string; btnTone: BadgeTone; modal: string }
interface BatchRow { id: string; status: string; statusTone: BadgeTone; sub: string; btnLabel: string; modal: string }

interface CardProgramAdministrationConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  heroActions: { label: string; modal: string; tone?: BadgeTone }[]
  statCards: StatCard[]
  alerts: AlertItem[]
  suggestions: SuggestionItem[]
  actions: ActionItem[]
  bins: BinRow[]
  supportActions: SupportRow[]
  batchQueue: BatchRow[]
}

const initialMockData: CardProgramAdministrationConfig = {
  nav: [
    { icon: 'bi-house' },
    { icon: 'bi-grid-3x3-gap' },
    { icon: 'bi-wallet2' },
    { icon: 'bi-credit-card', active: true, dot: true },
    { icon: 'bi-people' },
    { icon: 'bi-bar-chart' },
    { icon: 'bi-gear' },
  ],
  headerTitle: 'Card Program Administration',
  headerSub: 'BaaS Operator & Issuer Card Management Console',
  searchPlaceholder: 'Search cardholder, PAN, program ID, BIN, or dispute...',
  user: { initials: 'AO', name: 'Amina O.', role: 'BaaS Card Operator' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/cards' }],
    current: 'Program Administration',
  },
  pageCode: 'PAGE 5.9',
  pageTitle: 'Card Program Admin (Issuer/BaaS)',
  pageSub: 'Manage BIN sponsorships, cardholder lifecycles, global limits, compliance rules, and fee schedules for your enterprise card programs.',
  heroActions: [
    { label: 'Compliance Check', modal: 'healthCheckModal', tone: 'badgeS' },
    { label: 'Reports', modal: 'exportReportModal', tone: 'badgeI' },
    { label: 'Find Cardholder', modal: 'cardholderSearchModal', tone: 'badgeP' },
    { label: 'Issue Cards Batch', modal: 'issueBatchModal', tone: 'badgeS' },
  ],
  statCards: [
    { key: 'hero', col: 'col-lg-4', label: 'BaaS Issuing Platform', labelColor: 'rgba(255,255,255,.7)', value: '24,850 Active Cards', warnBorder: false },
    { key: 'issuance', col: 'col-lg-2 col-md-4 col-6', label: '30D ISSUANCE VOL', labelColor: 'var(--pm-info)', value: '1,420', badge: { icon: 'bi-graph-up-arrow', text: '+12% MoM', tone: 'badgeS' }, lines: [], warnBorder: false },
    { key: 'risk', col: 'col-lg-3 col-md-4 col-6', label: 'RISK & FRAUD ALERTS', labelColor: 'var(--pm-danger)', value: '28', badge: { icon: 'bi-shield-exclamation', text: '5 critical', tone: 'badgeD' }, lines: ['Velocity breaches: 12', 'Geo-mismatch: 11', 'AML flags: 5'], warnBorder: false },
    { key: 'revenue', col: 'col-lg-3 col-md-4', label: 'PROGRAM REVENUE (YTD)', labelColor: 'var(--pm-primary)', value: 'KES 14.2M', badge: { icon: 'bi-cash-stack', text: 'Interchange & Fees', tone: 'badgeS' }, lines: ['Interchange fee: KES 8.4M', 'Issuance & FX: KES 4.2M', 'ATM & Penalty: KES 1.6M'], warnBorder: false },
  ],
  alerts: [
    { initials: 'AM', color: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: '5 High-Risk AML Alerts', sub: 'Requires manual review & unblock', btnLabel: 'Review', btnTone: 'badgeD', modal: 'amlReviewModal' },
    { initials: 'B2', color: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Batch Issuance #8892 Pending', sub: '250 Corporate virtual cards', btnLabel: 'Approve', btnTone: 'badgeS', modal: 'approveBatchModal' },
    { initials: 'DS', color: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: '14 New Chargeback Disputes', sub: 'Deadline approaching for 3 cases', btnLabel: 'Resolve', btnTone: 'badgeI', modal: 'disputeResolutionModal' },
    { initials: 'ST', color: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Low Settlement Balance', sub: 'BIN 441011 settlement account < 10%', btnLabel: 'Top-up', btnTone: 'badgeS', modal: 'settlementDetailsModal' },
  ],
  suggestions: [
    { initials: 'LM', color: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Update Velocity Limits', sub: 'Increase daily limits for corporate BINs based on usage', btnLabel: 'Update', modal: 'velocityLimitsModal' },
    { initials: 'MC', color: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Review MCC Blocklist', sub: 'High failure rate on MCC 5411 (Grocery)', btnLabel: 'Review', modal: 'mccBlocklistModal' },
    { initials: 'FX', color: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Optimize FX Fee Schedule', sub: 'Consider lowering cross-border fees by 0.5%', btnLabel: 'Model', modal: 'feeScheduleModal' },
    { initials: 'WH', color: 'var(--pm-primary-light)', iconColor: 'white', title: 'Webhook Failures Detected', sub: '3 endpoint timeouts in the last 24h', btnLabel: 'Check', modal: 'webhookSettingsModal' },
  ],
  actions: [
    { icon: 'bi-search', color: 'var(--pm-primary)', label: 'Find Card', modal: 'cardholderSearchModal' },
    { icon: 'bi-credit-card-2-front', color: 'var(--pm-info)', label: 'Manage BIN', modal: 'binConfigModal' },
    { icon: 'bi-speedometer2', color: 'var(--pm-warning)', label: 'Limits', modal: 'velocityLimitsModal' },
    { icon: 'bi-tags', color: 'var(--pm-accent)', label: 'Fee Engine', modal: 'feeScheduleModal' },
    { icon: 'bi-slash-circle', color: 'var(--pm-danger)', label: 'Global MCC', modal: 'mccBlocklistModal' },
    { icon: 'bi-shield-lock', color: 'var(--pm-purple)', label: 'AML Review', modal: 'amlReviewModal' },
    { icon: 'bi-file-earmark-spreadsheet', color: 'var(--pm-muted)', label: 'Batch Issue', modal: 'issueBatchModal' },
    { icon: 'bi-bank', color: 'var(--pm-primary)', label: 'Settlements', modal: 'settlementDetailsModal' },
  ],
  bins: [
    { bin: '4410 11**', program: 'Corporate Expense', type: 'Virtual Credit', network: 'Visa', networkColor: '#1434CB', issued: '12,450', spend: 'KES 85.2M', status: 'Active', statusTone: 'badgeS', btnLabel: 'Config', modal: 'binConfigModal' },
    { bin: '5529 00**', program: 'Standard Retail', type: 'Physical Debit', network: 'Mastercard', networkColor: '#EB001B', issued: '8,200', spend: 'KES 42.1M', status: 'Active', statusTone: 'badgeS', btnLabel: 'Config', modal: 'binConfigModal' },
    { bin: '4288 99**', program: 'Premium Travel', type: 'Physical Credit', network: 'Visa', networkColor: '#1434CB', issued: '4,200', spend: 'KES 61.5M', status: 'Active', statusTone: 'badgeS', btnLabel: 'Config', modal: 'binConfigModal' },
    { bin: '5399 21**', program: 'Student Prepaid', type: 'Virtual Prepaid', network: 'Mastercard', networkColor: '#EB001B', issued: '0', spend: 'KES 0', status: 'Awaiting Setup', statusTone: 'badgeW', btnLabel: 'Setup', modal: 'binConfigModal' },
  ],
  supportActions: [
    { name: 'James Kamau (Corporate)', sub: 'Card *4421 · PIN reset requested', btnLabel: 'Action', btnTone: 'badgeS', modal: 'resetPinModal' },
    { name: 'Amina Hassan (Retail)', sub: 'Card *8812 · Reported stolen', btnLabel: 'Freeze', btnTone: 'badgeD', modal: 'forceFreezeModal' },
    { name: 'TechCorp Ltd (Expense)', sub: 'Card *9923 · Replacement damaged', btnLabel: 'Initiate', btnTone: 'badgeS', modal: 'replaceCardModal' },
  ],
  batchQueue: [
    { id: '#8892', status: 'Pending Approval', statusTone: 'badgeW', sub: '250 Virtual · Corp Expense BIN · by John D.', btnLabel: 'Review', modal: 'approveBatchModal' },
    { id: '#8891', status: 'In Production', statusTone: 'badgeI', sub: '150 Physical · Premium BIN · 40% printed', btnLabel: 'Track', modal: 'batchStatusModal' },
    { id: '#8890', status: 'Completed', statusTone: 'badgeS', sub: '500 Virtual · Standard BIN · 12 Jun 2025', btnLabel: 'Details', modal: 'batchStatusModal' },
  ],
}

async function fetchCardProgramAdministration(): Promise<CardProgramAdministrationConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/card-program-administration', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as CardProgramAdministrationConfig
  } catch {
    return initialMockData
  }
}

export default function CardProgramAdministration() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-card-program-administration'],
    queryFn: fetchCardProgramAdministration,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const openModal = (id: string) => setActiveModal(id)
  const closeModal = () => setActiveModal(null)

  return (
    <div className={styles.cardProgramAdministration}>
      <div className={styles.main}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load program data. Showing cached data.</span>
            <button className="btn-close" onClick={() => setErrorDismissed(true)} />
          </div>
        )}

        {/* PAGE BAR */}
        <div className={styles.pageBar}>
          <div>
            <div className={styles.breadcrumb}>
              {config.breadcrumb.parents.map((p) => (
                <span key={p.to}><Link to={p.to}>{p.label}</Link> / </span>
              ))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 className={styles.pageH2}>{config.pageCode} — {config.pageTitle}</h2>
            <p className={styles.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={styles.btnPm} onClick={() => openModal('healthCheckModal')}><i className="bi bi-shield-check" /> Compliance Check</button>
            <button className={styles.btnPm} onClick={() => openModal('exportReportModal')}><i className="bi bi-file-earmark-bar-graph" /> Reports</button>
            <button className={styles.btnPm} onClick={() => openModal('cardholderSearchModal')}><i className="bi bi-search" /> Find Cardholder</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openModal('issueBatchModal')}><i className="bi bi-upload" /> Issue Cards Batch</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card + ' ' + styles.cardHero} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.7)' }}>BaaS Issuing Platform <span style={{ color: '#34D399' }}>● Live</span></p>
                <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>24,850 Active Cards</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.7)' }}>Operating across 3 BIN programs (Corporate, Standard Debit, Premium Credit).</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff' }} onClick={() => openModal('issueBatchModal')}>New batch</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff' }} onClick={() => openModal('binConfigModal')}>BIN config</button>
                </div>
              </div>
            </div>
            {config.statCards.slice(1).map((s) => (
              <div key={s.key} className={s.col}>
                <div className={styles.card} style={{ minHeight: 170, ...(s.warnBorder ? { borderLeft: '3px solid var(--pm-warning)' } : {}) }}>
                  <p className={styles.statLabel} style={{ color: s.labelColor }}>{s.label}</p>
                  <div className={styles.statValue} style={{ margin: '6px 0' }}>{s.value}</div>
                  {s.badge && (
                    <span className={`${styles.badge} ${styles[s.badge.tone]}`}>
                      <i className={`bi ${s.badge.icon}`} /> {s.badge.text}
                    </span>
                  )}
                  {s.lines.map((l) => (
                    <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ALERTS & QUICK ACTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>Attention Required</h3>
                  <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => openModal('notificationsModal')}>View all</button>
                </div>
                {config.alerts.map((a) => (
                  <div key={a.title} className={styles.feedItem}>
                    <div className={styles.iconCircle} style={{ background: a.color, color: a.iconColor, fontSize: 12 }}>{a.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{a.sub}</div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm} ${a.btnTone === 'badgeD' ? styles.btnPmD : a.btnTone === 'badgeS' ? styles.btnPmA : styles.btnPmP}`} onClick={() => openModal(a.modal)}>{a.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>System Suggestions</h3>
                  <span className={styles.badge + ' ' + styles.badgeP}><i className="bi bi-stars"></i> System AI</span>
                </div>
                {config.suggestions.map((s) => (
                  <div key={s.title} className={styles.feedItem}>
                    <div className={styles.iconCircle} style={{ background: s.color, color: s.iconColor, fontSize: 12 }}>{s.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{s.sub}</div>
                    </div>
                    <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => openModal(s.modal)}>{s.btnLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="mb-3">
                  <h3 className={styles.sectionTitle}>Operator Actions</h3>
                  <p className={styles.sectionSub}>Administrative and compliance controls</p>
                </div>
                <div className={styles.quickActionGrid}>
                  {config.actions.map((a) => (
                    <button key={a.label} className={styles.quickActionBtn} onClick={() => openModal(a.modal)}>
                      <i className={`bi ${a.icon}`} style={{ color: a.color }} className="me-1"></i> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5.9.1 — Program Overview & BIN Management */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-2-front-fill" style={{ color: 'var(--pm-primary)' }}></i> 5.9.1 — Program Overview & BIN Management</h3>
                <p className={styles.sectionSub}>Manage active card programs, view BIN performance, and configure issuing parameters.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => openModal('addBinModal')}><i className="bi bi-plus"></i> Request New BIN</button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.tablePm}>
                <thead>
                  <tr><th>BIN / IIN</th><th>Program Name</th><th>Type</th><th>Network</th><th>Issued Cards</th><th>30D Spend</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {config.bins.map((b) => (
                    <tr key={b.bin}>
                      <td data-label="BIN / IIN"><code>{b.bin}</code></td>
                      <td data-label="Program Name">{b.program}</td>
                      <td data-label="Type">{b.type}</td>
                      <td data-label="Network"><span className={styles.badge} style={{ background: b.networkColor, color: 'white' }}>{b.network}</span></td>
                      <td data-label="Issued Cards">{b.issued}</td>
                      <td data-label="30D Spend">{b.spend}</td>
                      <td data-label="Status"><span className={`${styles.badge} ${styles[b.statusTone]}`}>{b.status}</span></td>
                      <td data-label="Actions"><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openModal(b.modal)}>{b.btnLabel}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5.9.2 — Cardholder & Lifecycle Management */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-people-fill" style={{ color: 'var(--pm-info)' }}></i> 5.9.2 — Cardholder & Lifecycle Management</h3>
                <p className={styles.sectionSub}>Support end-users, execute forced actions, track card deliveries, and manage batch requests.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => openModal('cardholderSearchModal')}><i className="bi bi-search"></i> Search User</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openModal('issueBatchModal')}><i className="bi bi-upload"></i> Issue Batch</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Cardholder Support Actions</h4>
                  </div>
                  {config.supportActions.map((s) => (
                    <div key={s.name} className={styles.statusRow}>
                      <div><strong>{s.name}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{s.sub}</div></div>
                      <button className={`${styles.btnPm} ${styles.btnSm} ${s.btnTone === 'badgeD' ? styles.btnPmD : styles.btnPmP}`} onClick={() => openModal(s.modal)}>{s.btnLabel}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.utilityBlock}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Batch Issuance Queue</h4>
                  </div>
                  {config.batchQueue.map((b) => (
                    <div key={b.id} className={styles.statusRow}>
                      <div><strong>Batch {b.id}</strong> · <span className={`${styles.badge} ${styles[b.statusTone]}`}>{b.status}</span><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{b.sub}</div></div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openModal(b.modal)}>{b.btnLabel}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5.9.3 — Compliance, Limits & Fee Configuration */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-shield-check" style={{ color: 'var(--pm-accent)' }}></i> 5.9.3 — Compliance, Limits & Fee Configuration</h3>
                <p className={styles.sectionSub}>Define global velocity limits, construct fee schedules, and apply fraud and AML constraints.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={styles.btnPm + ' ' + styles.btnSm} onClick={() => openModal('geoFencingModal')}><i className="bi bi-globe"></i> Geo-Rules</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.utilityBlock + ' text-center'} style={{ cursor: 'pointer' }} onClick={() => openModal('velocityLimitsModal')}>
                  <div className={styles.iconCircle + ' mx-auto mb-2'} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' }}><i className="bi bi-speedometer2"></i></div>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>Velocity Limits</h4>
                  <p style={{ fontSize: 12, color: 'var(--pm-muted)', margin: 0 }}>Set daily, weekly, monthly transaction caps and frequency rules across programs.</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock + ' text-center'} style={{ cursor: 'pointer' }} onClick={() => openModal('feeScheduleModal')}>
                  <div className={styles.iconCircle + ' mx-auto mb-2'} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)' }}><i className="bi bi-tags"></i></div>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>Fee Schedule Engine</h4>
                  <p style={{ fontSize: 12, color: 'var(--pm-muted)', margin: 0 }}>Configure issuance, ATM, cross-border, and maintenance fees per BIN.</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className={styles.utilityBlock + ' text-center'} style={{ cursor: 'pointer' }} onClick={() => openModal('mccBlocklistModal')}>
                  <div className={styles.iconCircle + ' mx-auto mb-2'} style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' }}><i className="bi bi-slash-circle"></i></div>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>Global MCC & Fraud Rules</h4>
                  <p style={{ fontSize: 12, color: 'var(--pm-muted)', margin: 0 }}>Block restricted categories (e.g. gambling, crypto) and setup 3DS enforcement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CardProgramAdministrationModals active={activeModal} onClose={closeModal} onOpen={openModal} />
    </div>
  )
}
