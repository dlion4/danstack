import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/customers.module.css'
import CustomersModals from '../components/CustomersModals'

/* ============================================================================
   PayMo BaaS — Customer & Account Management (legacy page 1.14)
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem {
  icon: string
  to: string
  label: string
  active?: boolean
  dot?: boolean
}

interface SrItem {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  sub: string
  actionLabel: string
  modal: string
}

interface QuickAction {
  icon: string
  label: string
  color: string
  modal: string
}

interface StatRow {
  label: string
  value: string
  tone: BadgeTone
}

interface KycQueueRow {
  customer: string
  submitted: string
  docs: string
  risk: string
  riskTone: BadgeTone
}

interface RoleRow {
  name: string
  sub: string
}

interface SegmentRow {
  segment: string
  email: boolean
  sms: boolean
  push: boolean
  whatsapp: boolean
}

interface LinkedBank {
  name: string
  sub: string
  status: string
  tone: BadgeTone
}

/* LEGACY BRIDGE: renderCustomerTable/renderAccountTable/renderTicketTable data
   — the legacy page rendered these tables via innerHTML from these arrays. */
interface CustomerRow {
  name: string
  type: string
  kyc: 'Pending' | 'Approved' | 'Rejected'
  accounts: number
  status: string
  last: string
}

interface AccountRow {
  num: string
  cust: string
  type: string
  bal: string
  status: string
  opened: string
}

interface TicketRow {
  t: string
  c: string
  s: string
  p: 'High' | 'Medium' | 'Low'
  st: string
  a: string
  u: string
}

interface CustomersConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string; headerInitials: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  ticketCounter: number
  hero: {
    live: string
    value: string
    detail: string
    actions: { label: string; modal: string }[]
  }
  statCards: {
    key: string
    colClass: string
    label: string
    labelColor: string
    value: string
    badge: { icon: string; text: string; tone: BadgeTone }
    lines: string[]
    attention?: boolean
  }[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  filters: { status: string[]; types: string[] }
  customers: CustomerRow[]
  accounts: AccountRow[]
  accountHealth: StatRow[]
  kycTabs: { key: string; label: string }[]
  kycQueue: KycQueueRow[]
  kycApprovedNote: string
  kycRejectedNote: string
  riskDist: StatRow[]
  roles: RoleRow[]
  apiAccess: StatRow[]
  quickReports: string[]
  commPrefs: SegmentRow[]
  tickets: TicketRow[]
  linkedBanks: LinkedBank[]
  integrations: { name: string; tone: BadgeTone }[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: CustomersConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-credit-card-2-front', to: '/cards', label: 'Cards' },
    { icon: 'bi-bank', to: '/banking', label: 'Banking' },
    { icon: 'bi-people-fill', to: '/customers', label: 'Customer & Account Management', active: true, dot: true },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Customer & Account Management',
  headerSub: 'Full lifecycle customer onboarding, KYC, accounts, permissions and support',
  searchPlaceholder: 'Search customers, accounts, KYC cases, tickets...',
  user: { initials: 'JK', name: 'James K.', role: 'Relationship Manager', headerInitials: 'MN' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'BaaS Hub', to: '/select-dashboard' },
    ],
    current: 'Customer & Account Management',
  },
  pageCode: 'PAGE 1.14',
  pageTitle: 'Customer & Account Management',
  pageSub:
    'Comprehensive customer lifecycle management including onboarding, KYC/AML, account opening/closure, permissions, statements and support tickets.',
  ticketCounter: 14,
  hero: {
    live: 'Customer platform live',
    value: '4,872 customers',
    detail: '3,241 active accounts • 1,284 pending KYC • 347 corporate entities • 98% verification rate',
    actions: [
      { label: 'Onboard', modal: 'onboardCustomerModal' },
      { label: 'Bulk Import', modal: 'bulkUploadModal' },
      { label: 'KYC Queue', modal: 'kycHealthModal' },
    ],
  },
  statCards: [
    {
      key: 'kyc',
      colClass: 'col-lg-2 col-md-4 col-6',
      label: 'KYC COMPLETION',
      labelColor: 'var(--pm-accent)',
      value: '98.4%',
      badge: { icon: 'bi-check-circle', text: '4,801 verified', tone: 'badgeS' },
      lines: ['47 pending review', '24 documents rejected'],
    },
    {
      key: 'accounts',
      colClass: 'col-lg-3 col-md-4 col-6',
      label: 'ACTIVE ACCOUNTS',
      labelColor: 'var(--pm-info)',
      value: '3,241',
      badge: { icon: 'bi-wallet2', text: '1,184 corporate', tone: 'badgeI' },
      lines: ['2,057 retail • 412 savings', '1,284 current accounts'],
    },
    {
      key: 'tickets',
      colClass: 'col-lg-3 col-md-4',
      label: 'OPEN SUPPORT TICKETS',
      labelColor: 'var(--pm-warning)',
      value: '14',
      badge: { icon: 'bi-clock', text: '5 awaiting reply', tone: 'badgeW' },
      lines: ['3 KYC disputes • 4 account issues', '2 card requests • 5 general'],
      attention: true,
    },
  ],
  attention: [
    {
      icon: 'bi-person-exclamation',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'KYC rejected — 3 cases',
      sub: 'Missing ID or address proof',
      actionLabel: 'Review',
      modal: 'kycReviewModal',
    },
    {
      icon: 'bi-bank2',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Account closure pending — 7 customers',
      sub: 'Balance settlement required',
      actionLabel: 'Process',
      /* LEGACY DEFECT: legacy pointed at non-existent #accountClosureModal (dead
         button) — mapped to the real closeAccountModal. */
      modal: 'closeAccountModal',
    },
    {
      icon: 'bi-shield-exclamation',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'AML flag — 2 high-risk profiles',
      sub: 'Manual review required',
      actionLabel: 'Investigate',
      modal: 'amlReviewModal',
    },
    {
      icon: 'bi-ticket-perforated',
      iconBg: 'var(--pm-purple-soft)',
      iconColor: 'var(--pm-purple)',
      title: '5 support tickets overdue',
      sub: 'SLA breach risk',
      actionLabel: 'Respond',
      modal: 'supportTicketsModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-person-check',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Auto-approve 18 low-risk KYC cases',
      sub: 'Confidence score > 95%',
      actionLabel: 'Auto-approve',
      modal: 'bulkKycApproveModal',
    },
    {
      icon: 'bi-link-45deg',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Link 42 customers to external banks',
      sub: 'Open banking consent pending',
      actionLabel: 'Link',
      modal: 'linkExternalModal',
    },
    {
      icon: 'bi-file-earmark-text',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Generate 124 monthly statements',
      sub: 'Auto-send scheduled for tomorrow',
      actionLabel: 'Generate',
      modal: 'statementModal',
    },
  ],
  quickActions: [
    { icon: 'bi-person-plus', label: 'Onboard', color: 'var(--pm-accent)', modal: 'onboardCustomerModal' },
    { icon: 'bi-shield-check', label: 'KYC Review', color: 'var(--pm-info)', modal: 'kycReviewModal' },
    { icon: 'bi-bank', label: 'Open Account', color: 'var(--pm-info)', modal: 'openAccountModal' },
    { icon: 'bi-x-circle', label: 'Close Account', color: 'var(--pm-danger)', modal: 'closeAccountModal' },
    { icon: 'bi-key', label: 'Permissions', color: 'var(--pm-purple)', modal: 'permissionModal' },
    { icon: 'bi-file-earmark-text', label: 'Statements', color: 'var(--pm-accent)', modal: 'statementModal' },
    { icon: 'bi-headset', label: 'Support', color: 'var(--pm-warning)', modal: 'supportTicketsModal' },
    { icon: 'bi-upload', label: 'Bulk Import', color: 'var(--pm-muted)', modal: 'bulkUploadModal' },
  ],
  filters: {
    status: ['All Status', 'Active', 'Pending KYC', 'Suspended', 'Closed'],
    types: ['All Types', 'Retail', 'Corporate', 'SME', 'Non-Profit'],
  },
  customers: [
    { name: 'Peter Ochieng', type: 'Retail', kyc: 'Pending', accounts: 2, status: 'Active', last: '26 Jun' },
    { name: 'Grace Wanjiku Ltd', type: 'Corporate', kyc: 'Approved', accounts: 4, status: 'Active', last: '27 Jun' },
    { name: 'Samuel Kipchoge', type: 'Retail', kyc: 'Rejected', accounts: 1, status: 'Suspended', last: '24 Jun' },
    { name: 'Amina Hassan', type: 'SME', kyc: 'Approved', accounts: 3, status: 'Active', last: '25 Jun' },
    { name: 'John Kamau', type: 'Retail', kyc: 'Pending', accounts: 1, status: 'Active', last: '27 Jun' },
  ],
  accounts: [
    { num: 'ACC-20240115-1122', cust: 'Peter Ochieng', type: 'Current', bal: 'KES 124,500', status: 'Active', opened: '15 Jan 2024' },
    { num: 'ACC-20240302-3344', cust: 'Grace Wanjiku Ltd', type: 'Savings', bal: 'KES 2,847,200', status: 'Active', opened: '02 Mar 2024' },
    { num: 'ACC-20240511-5566', cust: 'Samuel Kipchoge', type: 'Current', bal: 'KES 8,200', status: 'Suspended', opened: '11 May 2024' },
  ],
  accountHealth: [
    { label: 'Current Accounts', value: '2,841', tone: 'badgeS' },
    { label: 'Savings Accounts', value: '1,284', tone: 'badgeI' },
    { label: 'Corporate Accounts', value: '412', tone: 'badgeP' },
    { label: 'Accounts to Review', value: '47', tone: 'badgeW' },
    { label: 'Pending Closure', value: '7', tone: 'badgeD' },
  ],
  kycTabs: [
    { key: 'pending', label: 'Pending (47)' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ],
  kycQueue: [
    { customer: 'Peter Ochieng', submitted: '26 Jun', docs: 'ID, Utility, Selfie', risk: 'Low', riskTone: 'badgeS' },
    { customer: 'Grace Wanjiku Ltd', submitted: '25 Jun', docs: 'CR12, ID, Bank', risk: 'Medium', riskTone: 'badgeW' },
    { customer: 'Samuel Kipchoge', submitted: '24 Jun', docs: 'ID, Passport', risk: 'High', riskTone: 'badgeD' },
  ],
  kycApprovedNote: 'Last 30 days: 312 customers approved automatically via eKYC.',
  kycRejectedNote: '24 rejections this month. Common reasons: blurry ID, mismatched address, expired documents.',
  riskDist: [
    { label: 'Low Risk', value: '3,812', tone: 'badgeS' },
    { label: 'Medium Risk', value: '847', tone: 'badgeW' },
    { label: 'High Risk', value: '213', tone: 'badgeD' },
    { label: 'PEP / Sanctions', value: '18', tone: 'badgeP' },
  ],
  roles: [
    { name: 'Primary Account Holder', sub: 'Full access • 3,124 users' },
    { name: 'Joint Signatory', sub: 'View + initiate • 684 users' },
    { name: 'Viewer Only', sub: 'Read-only • 412 users' },
    { name: 'Corporate Admin', sub: 'Multi-account • 218 users' },
  ],
  apiAccess: [
    { label: 'Active API Keys', value: '87', tone: 'badgeI' },
    { label: 'Linked External Users', value: '312', tone: 'badgeP' },
    { label: 'Pending Invites', value: '24', tone: 'badgeW' },
    { label: 'Revoked Keys (30d)', value: '9', tone: 'badgeD' },
  ],
  quickReports: ['Customer List (CSV)', 'KYC Status Report', 'Account Activity', 'AML Summary'],
  commPrefs: [
    { segment: 'Retail Customers', email: true, sms: true, push: true, whatsapp: false },
    { segment: 'Corporate', email: true, sms: false, push: true, whatsapp: true },
    { segment: 'High-Net-Worth', email: true, sms: true, push: true, whatsapp: true },
  ],
  tickets: [
    { t: 'TKT-8821', c: 'Peter Ochieng', s: 'KYC document rejected', p: 'Medium', st: 'In Progress', a: 'Grace M.', u: '27 Jun' },
    { t: 'TKT-8834', c: 'Grace Wanjiku Ltd', s: 'Statement not received', p: 'Low', st: 'Open', a: 'Unassigned', u: '26 Jun' },
    { t: 'TKT-8847', c: 'Samuel Kipchoge', s: 'Card not working', p: 'High', st: 'Awaiting Customer', a: 'James K.', u: '25 Jun' },
  ],
  linkedBanks: [
    { name: 'Equity Bank (Open Banking)', sub: '2 accounts linked • Last sync 2h ago', status: 'Active', tone: 'badgeS' },
    { name: 'KCB Bank', sub: '1 account linked • Consent expires 12 Jul', status: 'Expiring', tone: 'badgeW' },
    { name: 'Co-op Bank', sub: 'Consent revoked by customer', status: 'Revoked', tone: 'badgeD' },
  ],
  integrations: [
    { name: 'M-Pesa Integration', tone: 'badgeS' },
    { name: 'CRB Check (Metropol)', tone: 'badgeS' },
    { name: 'eKYC Provider (iProov)', tone: 'badgeS' },
    { name: 'Document OCR (Google)', tone: 'badgeS' },
  ],
}

/* ---------- data fetch (falls back to mock on error) ---------- */
async function fetchCustomers(): Promise<CustomersConfig> {
  const res = await fetch('/api/customers', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as CustomersConfig
}

const ACTIVE_COLOR: Record<string, string> = {
  'bi-person-plus': 'var(--pm-accent)',
  'bi-shield-check': 'var(--pm-info)',
}

function kycBadge(kyc: CustomerRow['kyc']): { tone: BadgeTone; text: string } {
  if (kyc === 'Pending') return { tone: 'badgeW', text: 'Pending' }
  if (kyc === 'Approved') return { tone: 'badgeS', text: 'Approved' }
  return { tone: 'badgeD', text: 'Rejected' }
}

function priorityBadge(p: TicketRow['p']): BadgeTone {
  if (p === 'High') return 'badgeD'
  if (p === 'Medium') return 'badgeW'
  return 'badgeS'
}

function ticketStatusBadge(st: string): { tone: BadgeTone; text: string } {
  if (st === 'In Progress') return { tone: 'badgeI', text: 'In Progress' }
  if (st === 'Open') return { tone: 'badgeS', text: 'Open' }
  return { tone: 'badgeW', text: 'Awaiting' }
}

export default function Customers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-customers'],
    queryFn: fetchCustomers,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  /* LEGACY BRIDGE: sw('kyc',key,btn) pill tab switcher (page-level KYC queue) */
  const [kycTab, setKycTab] = useState('pending')

  /* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
  const openM = (id: string) => setActiveModal(id)
  const closeM = () => setActiveModal(null)

  return (
    <div className={styles.customersPage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load customer data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading customer workspace…
          </div>
        </div>
      )}

      <div className={styles.main}>


        {/* ======================= PAGE BAR ======================= */}
        <div className={styles.pageBar}>
          <div>
            <div className={styles.breadcrumb}>
              {config.breadcrumb.parents.map((p) => (
                <span key={p.label}>
                  <Link to={p.to}>{p.label}</Link> /{' '}
                </span>
              ))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 className={styles.pageH2}>
              {config.pageCode} — {config.pageTitle}
            </h2>
            <p className={styles.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={styles.btnPm} onClick={() => openM('kycHealthModal')}>
              <i className="bi bi-shield-check" /> KYC Health
            </button>
            <button className={styles.btnPm} onClick={() => openM('supportTicketsModal')}>
              <i className="bi bi-headset" /> Tickets
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('onboardCustomerModal')}>
              <i className="bi bi-person-plus" /> Onboard Customer
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* ======================= HERO STATS ======================= */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                  {config.hero.live} <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff' }}>
                  {config.hero.value}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.actions.map((a) => (
                    <button
                      key={a.label}
                      className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
                      onClick={() => openM(a.modal)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((card) => (
              <div className={card.colClass} key={card.key}>
                <div className={`${styles.card} ${card.attention ? styles.attentionCard : ''}`} style={{ minHeight: 170 }}>
                  <p className={styles.sl} style={{ color: card.labelColor }}>
                    {card.label}
                  </p>
                  <div className={styles.sv} style={{ margin: '6px 0' }}>
                    {card.value}
                  </div>
                  <span className={`${styles.badge} ${styles[card.badge.tone]}`}>
                    <i className={`bi ${card.badge.icon}`} /> {card.badge.text}
                  </span>
                  <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                    {card.lines.map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ======================= ATTENTION / SUGGESTIONS / QUICK ACTIONS ======================= */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className={styles.st}>Attention Required</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('attentionModal')}>
                    View all
                  </button>
                </div>
                {config.attention.map((item) => (
                  <div className={styles.sr} key={item.title}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14 }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div>
                        <div className={styles.fwBold13}>{item.title}</div>
                        <div className={styles.mutedSmall}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(item.modal)}>
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className={styles.st}>Smart Suggestions</h3>
                  <span className={`${styles.badge} ${styles.badgeP}`}>
                    <i className="bi bi-stars" /> AI
                  </span>
                </div>
                {config.suggestions.map((item) => (
                  <div className={styles.sr} key={item.title}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 14 }}>
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div>
                        <div className={styles.fwBold13}>{item.title}</div>
                        <div className={styles.mutedSmall}>{item.sub}</div>
                      </div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(item.modal)}>
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent customer &amp; account workflows</p>
                </div>
                <div className={styles.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button className={styles.quickBtn} key={qa.label} onClick={() => openM(qa.modal)}>
                      <i className={`bi ${qa.icon} me-1`} style={{ color: ACTIVE_COLOR[qa.icon] ?? qa.color }} /> {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.1 CUSTOMER DIRECTORY ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-people-fill" style={{ color: 'var(--pm-primary-light)' }} /> 1.14.1 — Customer
                  Directory &amp; Onboarding
                </h3>
                <p className={styles.ss}>
                  Complete customer list with search, filters, onboarding status, KYC progress and quick actions.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('bulkUploadModal')}>
                  <i className="bi bi-upload" /> Bulk
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM('onboardCustomerModal')}>
                  <i className="bi bi-person-plus" /> New
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <div className={styles.ub}>
                  <div className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
                    <input className={styles.fc} style={{ maxWidth: 280 }} placeholder="Search name, email, phone, ID..." aria-label="Search customers" />
                    <select className={styles.fc} style={{ maxWidth: 160 }} aria-label="Status filter" defaultValue="All Status">
                      {config.filters.status.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <select className={styles.fc} style={{ maxWidth: 160 }} aria-label="Type filter" defaultValue="All Types">
                      {config.filters.types.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <button className={`${styles.btnPm} ${styles.btnSm}`}>
                      <i className="bi bi-funnel" /> More Filters
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Type</th>
                          <th>KYC</th>
                          <th>Accounts</th>
                          <th>Status</th>
                          <th>Last Activity</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      {/* LEGACY BRIDGE: renderCustomerTable() → typed rows below */}
                      <tbody>
                        {config.customers.map((c) => {
                          const kb = kycBadge(c.kyc)
                          return (
                            <tr key={c.name}>
                              <td>
                                <strong>{c.name}</strong>
                              </td>
                              <td>{c.type}</td>
                              <td>
                                <span className={`${styles.badge} ${styles[kb.tone]}`}>{kb.text}</span>
                              </td>
                              <td>{c.accounts}</td>
                              <td>
                                <span className={`${styles.badge} ${c.status === 'Active' ? styles.badgeS : styles.badgeD}`}>
                                  {c.status === 'Active' ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td>{c.last}</td>
                              <td>
                                <div className="d-flex" style={{ gap: 4 }}>
                                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('kycReviewModal')}>
                                    KYC
                                  </button>
                                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('permissionModal')}>
                                    Access
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.2 ACCOUNT MANAGEMENT ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-bank2" style={{ color: 'var(--pm-info)' }} /> 1.14.2 — Account Management
                </h3>
                <p className={styles.ss}>Open, close, suspend, reactivate and manage all account types with full audit trail.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('openAccountModal')}>
                  <i className="bi bi-plus-circle" /> Open
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => openM('closeAccountModal')}>
                  <i className="bi bi-x-circle" /> Close
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Account #</th>
                          <th>Customer</th>
                          <th>Type</th>
                          <th>Balance</th>
                          <th>Status</th>
                          <th>Opened</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      {/* LEGACY BRIDGE: renderAccountTable() → typed rows below */}
                      <tbody>
                        {config.accounts.map((a) => (
                          <tr key={a.num}>
                            <td>
                              <code>{a.num}</code>
                            </td>
                            <td>{a.cust}</td>
                            <td>{a.type}</td>
                            <td>
                              <strong>{a.bal}</strong>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${a.status === 'Active' ? styles.badgeS : styles.badgeD}`}>
                                {a.status === 'Active' ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>{a.opened}</td>
                            <td>
                              <div className="d-flex" style={{ gap: 4 }}>
                                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('statementModal')}>
                                  Statement
                                </button>
                                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('closeAccountModal')}>
                                  Close
                                </button>
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
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Account Health Snapshot</h4>
                  {config.accountHealth.map((r) => (
                    <div className={styles.sr} key={r.label}>
                      <div>
                        <strong>{r.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.3 KYC / AML & COMPLIANCE ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-shield-check" style={{ color: 'var(--pm-purple)' }} /> 1.14.3 — KYC / AML &amp;
                  Compliance Center
                </h3>
                <p className={styles.ss}>
                  End-to-end KYC workflow, document management, risk scoring, PEP screening and audit logs.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('kycReviewModal')}>
                  <i className="bi bi-search" /> Review Queue
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('amlReviewModal')}>
                  <i className="bi bi-exclamation-triangle" /> AML Cases
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className={styles.ub}>
                  {/* LEGACY BRIDGE: sw('kyc',key,btn) pill tabs */}
                  <div className={`${styles.pills} mb-3`}>
                    {config.kycTabs.map((t) => (
                      <button
                        key={t.key}
                        className={`${styles.pill} ${kycTab === t.key ? styles.pillActive : ''}`}
                        onClick={() => setKycTab(t.key)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {kycTab === 'pending' && (
                    <div className="table-responsive">
                      <table className={styles.tbl}>
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Submitted</th>
                            <th>Documents</th>
                            <th>Risk</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {config.kycQueue.map((r) => (
                            <tr key={r.customer}>
                              <td>{r.customer}</td>
                              <td>{r.submitted}</td>
                              <td>{r.docs}</td>
                              <td>
                                <span className={`${styles.badge} ${styles[r.riskTone]}`}>{r.risk}</span>
                              </td>
                              <td>
                                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('kycReviewModal')}>
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {kycTab === 'approved' && <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>{config.kycApprovedNote}</p>}
                  {kycTab === 'rejected' && <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>{config.kycRejectedNote}</p>}
                </div>
              </div>
              <div className="col-lg-5">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Risk Distribution</h4>
                  {config.riskDist.map((r) => (
                    <div className={styles.sr} key={r.label}>
                      <div>
                        <strong>{r.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.4 PERMISSIONS, ROLES & ACCESS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-key" style={{ color: 'var(--pm-warning)' }} /> 1.14.4 — Permissions, Roles &amp;
                  Access Control
                </h3>
                <p className={styles.ss}>Role-based access, user permissions, API keys, linked users and audit logs.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('permissionModal')}>
                  <i className="bi bi-plus-circle" /> New Role
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Active Roles</h4>
                  {config.roles.map((r) => (
                    <div className={styles.sr} key={r.name}>
                      <div>
                        <strong>{r.name}</strong>
                        <div className={styles.mutedSmall}>{r.sub}</div>
                      </div>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('permissionModal')}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>API &amp; Linked Access</h4>
                  {config.apiAccess.map((r) => (
                    <div className={styles.sr} key={r.label}>
                      <div>
                        <strong>{r.label}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.value}</span>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`} onClick={() => openM('apiKeyModal')}>
                    Manage API Keys
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.5 STATEMENTS, REPORTS & COMMUNICATION ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-file-earmark-text" style={{ color: 'var(--pm-accent)' }} /> 1.14.5 — Statements,
                  Reports &amp; Communication
                </h3>
                <p className={styles.ss}>
                  Generate statements, compliance reports, send notifications and manage customer communication
                  preferences.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('statementModal')}>
                  <i className="bi bi-file-earmark-text" /> Statements
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('reportModal')}>
                  <i className="bi bi-graph-up" /> Reports
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Quick Reports</h4>
                  <div className={styles.quickGrid}>
                    {config.quickReports.map((r) => (
                      <button key={r} className={styles.quickBtn} onClick={() => openM('reportModal')}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Communication Preferences</h4>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Customer Segment</th>
                          <th>Email</th>
                          <th>SMS</th>
                          <th>Push</th>
                          <th>WhatsApp</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.commPrefs.map((s) => (
                          <tr key={s.segment}>
                            <td>{s.segment}</td>
                            <td>
                              <input type="checkbox" defaultChecked={s.email} aria-label={`${s.segment} email`} />
                            </td>
                            <td>
                              <input type="checkbox" defaultChecked={s.sms} aria-label={`${s.segment} sms`} />
                            </td>
                            <td>
                              <input type="checkbox" defaultChecked={s.push} aria-label={`${s.segment} push`} />
                            </td>
                            <td>
                              <input type="checkbox" defaultChecked={s.whatsapp} aria-label={`${s.segment} whatsapp`} />
                            </td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('commModal')}>
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.6 SUPPORT TICKETS ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-headset" style={{ color: 'var(--pm-danger)' }} /> 1.14.6 — Support Tickets &amp;
                  Customer Service
                </h3>
                <p className={styles.ss}>Full ticketing system with SLA tracking, knowledge base and escalation workflows.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('supportTicketsModal')}>
                  <i className="bi bi-ticket-perforated" /> All Tickets
                </button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('createTicketModal')}>
                  <i className="bi bi-plus-circle" /> New
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <div className={styles.ub}>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Ticket #</th>
                          <th>Customer</th>
                          <th>Subject</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned</th>
                          <th>Updated</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      {/* LEGACY BRIDGE: renderTicketTable() → typed rows below */}
                      <tbody>
                        {config.tickets.map((t) => (
                          <tr key={t.t}>
                            <td>
                              <code>{t.t}</code>
                            </td>
                            <td>{t.c}</td>
                            <td>{t.s}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[priorityBadge(t.p)]}`}>{t.p}</span>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles[ticketStatusBadge(t.st).tone]}`}>
                                {ticketStatusBadge(t.st).text}
                              </span>
                            </td>
                            <td>{t.a}</td>
                            <td>{t.u}</td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('ticketDetailModal')}>
                                Open
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= 1.14.7 LINKED SERVICES ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.st}>
                  <i className="bi bi-link-45deg" style={{ color: 'var(--pm-primary-light)' }} /> 1.14.7 — Linked
                  Services &amp; External Connections
                </h3>
                <p className={styles.ss}>
                  Manage linked external bank accounts, open banking consents, third-party integrations and connected
                  services.
                </p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('linkExternalModal')}>
                  <i className="bi bi-link" /> Link Account
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Connected External Banks</h4>
                  {config.linkedBanks.map((b) => (
                    <div className={styles.sr} key={b.name}>
                      <div>
                        <strong>{b.name}</strong>
                        <div className={styles.mutedSmall}>{b.sub}</div>
                      </div>
                      <span className={`${styles.badge} ${styles[b.tone]}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 className={styles.ubTitle}>Third-Party Integrations</h4>
                  {config.integrations.map((i) => (
                    <div className={styles.sr} key={i.name}>
                      <div>
                        <strong>{i.name}</strong>
                      </div>
                      <span className={`${styles.badge} ${styles[i.tone]}`}>Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= MODAL LAYER ======================= */}
      <CustomersModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
