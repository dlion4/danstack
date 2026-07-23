import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/fx.module.css'
import FxModals from '../components/FxModals'

/* ============================================================================
   PayMo BaaS — Multi-Currency & FX Management (legacy page 1.13)
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.
   LEGACY BRIDGE: legacy `renderPortfolio()` built the section-1 table with
   innerHTML from a JS array — replaced by typed `portfolio` config below.
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
  actionTone?: 'btnPmD' | 'btnPmP'
  modal: string
}

interface QuickAction {
  icon: string
  label: string
  color: string
  modal: string
}

interface TableCol {
  key: string
  label: string
}

interface CellAction {
  label: string
  modal: string
  tone?: 'btnPmD' | 'btnPmP'
}

type Cell = string | { badge: string; tone: BadgeTone } | { actions: CellAction[] } | { text: string; color: string }

interface StatCardF {
  key: string
  colClass: string
  label: string
  labelColor: string
  value: string
  badge: { icon: string; text: string; tone: BadgeTone }
  lines: { text: string; strong?: string; strongColor?: string }[]
  progress?: { label: string; value: string; width: string; color: string }
  borderColor?: string
}

interface SrRow {
  title: string
  sub?: string
  badge?: { text: string; tone: BadgeTone }
  value?: string
  action?: { label: string; modal: string }
  wideAction?: boolean
}

interface FxConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string; headerInitials: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: { live: string; value: string; detail: string; buttons: { label: string; modal: string }[] }
  statCards: StatCardF[]
  attention: SrItem[]
  suggestions: SrItem[]
  quickActions: QuickAction[]
  portfolio: { cols: TableCol[]; rows: { currency: string; wallet: string; balance: string; kes: string; change: string; status: string; tone: BadgeTone }[] }
  liveRates: { pair: string; buy: string; sell: string; spread: string; change: string }[]
  rateAlerts: SrRow[]
  recentFx: { cols: TableCol[]; rows: Cell[][] }
  quickConvert: { fromOptions: string[]; toOptions: string[]; amount: string }
  contracts: SrRow[]
  exposure: { label: string; value: string; valueColor: string; width: string; color: string }[]
  costBars: { height: string; color: string; label: string }[]
  keyMetrics: { label: string; value: string; color: string }[]
  autoRules: SrRow[]
  alertSettings: SrRow[]
  walletPrefs: SrRow[]
  activity: { cols: TableCol[]; rows: Cell[][] }
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: FxConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-lightning-charge', to: '/initiate-transfer', label: 'Transfers' },
    { icon: 'bi-currency-exchange', to: '/fx', label: 'Multi-Currency & FX', active: true, dot: true },
    { icon: 'bi-wallet2', to: '/wallets', label: 'Wallets' },
    { icon: 'bi-bar-chart-line', to: '/analytics', label: 'Analytics' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Multi-Currency & FX Management',
  headerSub: 'Global currency accounts, live FX rates, transfers, hedging, and cross-border analytics',
  searchPlaceholder: 'Search currencies, rates, transfers, FX alerts...',
  user: { initials: 'JK', name: 'James K.', role: 'Treasury Manager', headerInitials: 'MN' },
  breadcrumb: {
    parents: [
      { label: 'Home', to: '/' },
      { label: 'Transactions Hub', to: '/select-dashboard' },
    ],
    current: 'Multi-Currency & FX',
  },
  pageCode: 'PAGE 1.13',
  pageTitle: 'Multi-Currency & FX Management',
  pageSub:
    'Manage multi-currency wallets, execute instant FX conversions, set up forward contracts, monitor live rates, and optimise cross-border cash flow across 20+ currencies.',
  hero: {
    live: 'FX command center is live',
    value: 'KES 124.8M equivalent',
    detail: 'Across 9 currencies in 14 wallets. USD, EUR, GBP, ZAR, UGX, TZS, GHS, NGN, AED.',
    buttons: [
      { label: 'Convert', modal: 'convertModal' },
      { label: 'Hedge', modal: 'hedgeModal' },
      { label: 'Add Wallet', modal: 'newWalletModal' },
    ],
  },
  statCards: [
    {
      key: 'volume',
      colClass: 'col-lg-2 col-md-4 col-6',
      label: "TODAY'S FX VOLUME",
      labelColor: 'var(--pm-info)',
      value: 'KES 18.4M',
      badge: { icon: 'bi-graph-up-arrow', text: '+31% vs yesterday', tone: 'badgeS' },
      lines: [],
      progress: { label: 'USD', value: 'KES 9.2M', width: '50%', color: 'var(--pm-info)' },
    },
    {
      key: 'bestRate',
      colClass: 'col-lg-3 col-md-4 col-6',
      label: 'BEST RATE TODAY',
      labelColor: 'var(--pm-accent)',
      value: '1 USD = 129.45 KES',
      badge: { icon: 'bi-clock', text: 'Live • Updated 14s ago', tone: 'badgeS' },
      lines: [
        { text: 'USD/EUR: 0.92 ', strong: '+0.4%', strongColor: 'var(--pm-accent)' },
        { text: 'USD/GBP: 0.78 ', strong: '-0.2%', strongColor: 'var(--pm-danger)' },
      ],
    },
    {
      key: 'savings',
      colClass: 'col-lg-3 col-md-4',
      label: 'FX SAVINGS THIS MONTH',
      labelColor: 'var(--pm-warning)',
      value: 'KES 312,400',
      badge: { icon: 'bi-piggy-bank', text: 'Smart routing active', tone: 'badgeS' },
      lines: [
        { text: 'Rate optimisation: ', strong: 'KES 187,200' },
        { text: 'Forward contracts: ', strong: 'KES 125,200' },
      ],
      borderColor: 'var(--pm-warning)',
    },
  ],
  attention: [
    {
      icon: 'bi-currency-exchange',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'USD forward contract expiring',
      sub: 'Contract FX-8821 • 30 Jun',
      actionLabel: 'Roll',
      modal: 'hedgeModal',
    },
    {
      icon: 'bi-wallet2',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'EUR balance below threshold',
      sub: '€2,180 remaining — top up recommended',
      actionLabel: 'Top-up',
      modal: 'convertModal',
    },
    {
      icon: 'bi-globe',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'NGN rate moved 4.2%',
      sub: 'Alert triggered • 1 NGN = 0.084 KES',
      actionLabel: 'View',
      modal: 'rateAlertsModal',
    },
  ],
  suggestions: [
    {
      icon: 'bi-arrow-left-right',
      iconBg: 'var(--pm-accent-soft)',
      iconColor: 'var(--pm-accent)',
      title: 'Convert USD → EUR now',
      sub: 'Rate 0.92 is 2.1% above 30-day avg',
      actionLabel: 'Convert',
      modal: 'convertModal',
    },
    {
      icon: 'bi-shield-check',
      iconBg: 'var(--pm-info-soft)',
      iconColor: 'var(--pm-info)',
      title: 'Lock USD/ZAR forward for July',
      sub: 'Expected volatility from elections',
      actionLabel: 'Hedge',
      modal: 'hedgeModal',
    },
    {
      icon: 'bi-wallet2',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Open ZAR wallet for SA suppliers',
      sub: 'Save 1.8% on FX fees monthly',
      actionLabel: 'Create',
      modal: 'newWalletModal',
    },
  ],
  quickActions: [
    { icon: 'bi-arrow-left-right', label: 'Instant Convert', color: 'var(--pm-primary-light)', modal: 'convertModal' },
    { icon: 'bi-shield-check', label: 'Forward Contract', color: 'var(--pm-accent)', modal: 'hedgeModal' },
    { icon: 'bi-collection', label: 'Bulk FX', color: 'var(--pm-purple)', modal: 'bulkFxModal' },
    { icon: 'bi-bell', label: 'Rate Alerts', color: 'var(--pm-warning)', modal: 'rateAlertsModal' },
    { icon: 'bi-send', label: 'Cross-Border', color: 'var(--pm-info)', modal: 'fxTransferModal' },
    { icon: 'bi-download', label: 'FX Report', color: 'var(--pm-accent)', modal: 'fxStatementModal' },
    { icon: 'bi-shuffle', label: 'Currency Swap', color: 'var(--pm-danger)', modal: 'swapModal' },
    { icon: 'bi-bar-chart-line', label: 'Analytics', color: 'var(--pm-primary-light)', modal: 'fxAnalyticsModal' },
  ],
  portfolio: {
    cols: [
      { key: 'currency', label: 'Currency' },
      { key: 'wallet', label: 'Wallet' },
      { key: 'balance', label: 'Balance' },
      { key: 'kes', label: 'KES Equivalent' },
      { key: 'change', label: '24h Change' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' },
    ],
    rows: [
      { currency: 'USD', wallet: 'USD Wallet', balance: '48,200.00', kes: 'KES 6,240,900', change: '+0.42%', status: 'Active', tone: 'badgeS' },
      { currency: 'EUR', wallet: 'EUR Wallet', balance: '18,400.00', kes: 'KES 2,572,320', change: '-0.18%', status: 'Low', tone: 'badgeW' },
      { currency: 'GBP', wallet: 'GBP Wallet', balance: '9,100.00', kes: 'KES 1,512,420', change: '+0.65%', status: 'Active', tone: 'badgeS' },
      { currency: 'ZAR', wallet: 'ZAR Wallet', balance: '2,140,000', kes: 'KES 15,250,800', change: '-1.12%', status: 'Active', tone: 'badgeS' },
      { currency: 'UGX', wallet: 'UGX Wallet', balance: '68,200,000', kes: 'KES 2,373,360', change: '+0.29%', status: 'Active', tone: 'badgeS' },
    ],
  },
  liveRates: [
    { pair: 'USD/KES', buy: '129.35', sell: '129.85', spread: '0.50', change: '+0.42%' },
    { pair: 'EUR/KES', buy: '139.10', sell: '139.80', spread: '0.70', change: '-0.18%' },
    { pair: 'GBP/KES', buy: '165.40', sell: '166.20', spread: '0.80', change: '+0.65%' },
    { pair: 'ZAR/KES', buy: '7.12', sell: '7.22', spread: '0.10', change: '-1.12%' },
    { pair: 'UGX/KES', buy: '0.0348', sell: '0.0354', spread: '0.0006', change: '+0.29%' },
  ],
  rateAlerts: [
    { title: 'USD/KES > 130.00', sub: 'Current: 129.85 • Trigger: 130.00', badge: { text: 'Active', tone: 'badgeS' } },
    { title: 'EUR/KES < 138.50', sub: 'Current: 139.80 • Trigger: 138.50', badge: { text: 'Paused', tone: 'badgeW' } },
    { title: 'GBP/KES > 167.00', sub: 'Current: 166.20 • Trigger: 167.00', badge: { text: 'Active', tone: 'badgeS' } },
  ],
  recentFx: {
    cols: [
      { key: 'date', label: 'Date' },
      { key: 'from', label: 'From' },
      { key: 'to', label: 'To' },
      { key: 'rate', label: 'Rate' },
      { key: 'amount', label: 'Amount' },
      { key: 'fee', label: 'Fee' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['27 Jun', 'USD 50,000', 'KES 6,472,500', '129.45', 'KES 6,472,500', 'KES 3,200', { badge: 'Completed', tone: 'badgeS' }, { actions: [{ label: 'Receipt', modal: 'fxReceiptModal' }] }],
      ['26 Jun', 'EUR 12,000', 'USD 13,104', '1.092', 'USD 13,104', 'USD 26', { badge: 'Completed', tone: 'badgeS' }, { actions: [{ label: 'Receipt', modal: 'fxReceiptModal' }] }],
      ['25 Jun', 'KES 2,000,000', 'ZAR 281,690', '0.1408', 'ZAR 281,690', 'KES 1,800', { badge: 'Pending', tone: 'badgeW' }, { actions: [{ label: 'Track', modal: 'fxTransferModal' }] }],
    ],
  },
  quickConvert: {
    fromOptions: ['USD Wallet (48,200)', 'EUR Wallet (18,400)', 'GBP Wallet (9,100)'],
    toOptions: ['KES Wallet', 'ZAR Wallet', 'UGX Wallet'],
    amount: '5000',
  },
  contracts: [
    { title: 'USD Forward • FX-8821', sub: '50,000 USD @ 130.00 • Expires 30 Jun', badge: { text: 'Active', tone: 'badgeS' } },
    { title: 'EUR Forward • FX-8799', sub: '€25,000 @ 139.50 • Expires 15 Jul', badge: { text: 'Active', tone: 'badgeS' } },
    { title: 'GBP Forward • FX-8754', sub: '£10,000 @ 166.80 • Expired', badge: { text: 'Settled', tone: 'badgeD' } },
  ],
  exposure: [
    { label: 'USD Net Position', value: 'Long +$82,400', valueColor: 'var(--pm-accent)', width: '68%', color: 'var(--pm-accent)' },
    { label: 'EUR Net Position', value: 'Short -€14,200', valueColor: 'var(--pm-danger)', width: '32%', color: 'var(--pm-danger)' },
    { label: 'GBP Net Position', value: 'Long +£6,800', valueColor: 'var(--pm-accent)', width: '55%', color: 'var(--pm-info)' },
  ],
  costBars: [
    { height: '65%', color: 'var(--pm-primary-light)', label: 'Jan' },
    { height: '72%', color: 'var(--pm-primary-light)', label: 'Feb' },
    { height: '58%', color: 'var(--pm-primary-light)', label: 'Mar' },
    { height: '81%', color: 'var(--pm-warning)', label: 'Apr' },
    { height: '67%', color: 'var(--pm-primary-light)', label: 'May' },
    { height: '49%', color: 'var(--pm-accent)', label: 'Jun' },
  ],
  keyMetrics: [
    { label: 'Avg Spread', value: '0.48%', color: 'var(--pm-accent)' },
    { label: 'Best Execution', value: '99.2%', color: 'var(--pm-info)' },
    { label: 'Hedging Ratio', value: '64%', color: 'var(--pm-purple)' },
  ],
  autoRules: [
    { title: 'USD → KES', sub: 'When balance > $10,000', badge: { text: 'Active', tone: 'badgeS' } },
    { title: 'EUR → KES', sub: 'Daily at 09:00 EAT', badge: { text: 'Active', tone: 'badgeS' } },
    { title: 'GBP → USD', sub: 'When rate > 1.28', badge: { text: 'Paused', tone: 'badgeW' } },
  ],
  alertSettings: [
    { title: 'USD/KES > 130.50', badge: { text: 'SMS + Push', tone: 'badgeS' } },
    { title: 'EUR/KES < 138.00', badge: { text: 'Push', tone: 'badgeS' } },
    { title: 'GBP/KES volatility > 2%', badge: { text: 'Email', tone: 'badgeS' } },
  ],
  walletPrefs: [
    { title: 'Default display currency', value: 'KES' },
    { title: 'Show equivalent in', value: 'USD' },
    { title: 'Auto-hide small balances', badge: { text: 'On', tone: 'badgeS' } },
  ],
  activity: {
    cols: [
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'details', label: 'Details' },
      { key: 'amount', label: 'Amount' },
      { key: 'rate', label: 'Rate' },
      { key: 'fee', label: 'Fee' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ],
    rows: [
      ['27 Jun', 'Conversion', 'USD → KES', 'KES 6,472,500', '129.45', 'KES 3,200', { badge: 'Completed', tone: 'badgeS' }, { actions: [{ label: 'Receipt', modal: 'fxReceiptModal' }] }],
      ['26 Jun', 'Forward Settlement', 'EUR Forward FX-8799', 'USD 13,104', '1.092', 'USD 26', { badge: 'Completed', tone: 'badgeS' }, { actions: [{ label: 'Receipt', modal: 'fxReceiptModal' }] }],
      ['25 Jun', 'Transfer', 'KES → ZAR Wallet', 'ZAR 281,690', '0.1408', 'KES 1,800', { badge: 'Pending', tone: 'badgeW' }, { actions: [{ label: 'Track', modal: 'fxTransferModal' }] }],
    ],
  },
}

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchFx(): Promise<FxConfig> {
  const res = await fetch('/api/fx')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<FxConfig>
  return { ...initialMockData, ...json }
}

const TONES: Record<string, string> = { s: styles.badgeS, w: styles.badgeW, d: styles.badgeD, i: styles.badgeI, p: styles.badgeP }

/* ---------- cell renderer for data tables ---------- */
function CellValue({ cell, onOpen }: { cell: Cell; onOpen: (id: string) => void }) {
  if (typeof cell === 'string') {
    if (cell.startsWith('C:')) return <code>{cell.slice(2)}</code>
    if (cell.startsWith('B:')) {
      const [, tone, text] = cell.split(':')
      return <span className={`${styles.badge} ${TONES[tone] ?? styles.badgeS}`}>{text}</span>
    }
    if (cell.startsWith('STR:')) return <strong>{cell.slice(4)}</strong>
    return <>{cell}</>
  }
  if ('badge' in cell) return <span className={`${styles.badge} ${styles[cell.tone]}`}>{cell.badge}</span>
  if ('text' in cell) return <span style={{ color: cell.color }}>{cell.text}</span>
  return (
    <div className="d-flex" style={{ gap: 4 }}>
      {cell.actions.map((a) => (
        <button key={a.label} className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ''}`} onClick={() => onOpen(a.modal)}>
          {a.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- section header ---------- */
function SectionHead({
  icon,
  iconColor,
  code,
  title,
  sub,
  actions,
  onOpen,
}: {
  icon: string
  iconColor: string
  code: string
  title: string
  sub: string
  actions: { label: string; icon?: string; modal: string; tone?: 'btnPmP' | 'btnPmD' }[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
      <div>
        <h3 className={styles.st}>
          <i className={`bi ${icon}`} style={{ color: iconColor }} /> {code} — {title}
        </h3>
        <p className={styles.ss}>{sub}</p>
      </div>
      <div className="d-flex" style={{ gap: 8 }}>
        {actions.map((a) => (
          <button key={a.label} className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ''}`} onClick={() => onOpen(a.modal)}>
            {a.icon && <i className={`bi ${a.icon}`} />} {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Ub({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={styles.ub}>
      {title && (
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
          <h4 className={styles.ubTitle} style={{ margin: 0 }}>
            {title}
          </h4>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

/* ---------- sr row with optional wide bottom button ---------- */
function SrRowList({ rows, wideButton, onOpen }: { rows: SrRow[]; wideButton?: { label: string; modal: string }; onOpen: (id: string) => void }) {
  return (
    <>
      {rows.map((r) => (
        <div className={styles.sr} key={r.title}>
          <div>
            <strong>{r.title}</strong>
            {r.sub && <div className={styles.mutedSmall}>{r.sub}</div>}
          </div>
          {r.badge ? (
            <span className={`${styles.badge} ${styles[r.badge.tone]}`}>{r.badge.text}</span>
          ) : r.value ? (
            <strong>{r.value}</strong>
          ) : r.action ? (
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen(r.action!.modal)}>
              {r.action.label}
            </button>
          ) : null}
        </div>
      ))}
      {wideButton && (
        <button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => onOpen(wideButton.modal)}>
          {wideButton.label}
        </button>
      )}
    </>
  )
}

export default function FxManagement() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-fx'],
    queryFn: fetchFx,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  /* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
  const openM = (id: string) => setActiveModal(id)
  const closeM = () => setActiveModal(null)

  return (
    <div className={styles.fxPage}>
      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load FX data.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading FX workspace…
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
            <button className={styles.btnPm} onClick={() => openM('fxHealthModal')}>
              <i className="bi bi-heart-pulse" /> Health Check
            </button>
            <button className={styles.btnPm} onClick={() => openM('rateAlertsModal')}>
              <i className="bi bi-bell" /> Rate Alerts
            </button>
            <button className={styles.btnPm} onClick={() => openM('convertModal')}>
              <i className="bi bi-arrow-left-right" /> Convert
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM('newWalletModal')}>
              <i className="bi bi-plus-lg" /> New Wallet
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* ======================= HERO STATS ======================= */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.82)' }}>
                  {config.hero.live} <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff', fontSize: 22 }}>
                  {config.hero.value}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.82)' }}>{config.hero.detail}</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  {config.hero.buttons.map((b) => (
                    <button key={b.label} className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => openM(b.modal)}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {config.statCards.map((card) => (
              <div className={card.colClass} key={card.key}>
                <div
                  className={styles.card}
                  style={{ minHeight: 170, ...(card.borderColor ? { borderLeft: `3px solid ${card.borderColor}` } : {}) }}
                >
                  <p className={styles.sl} style={{ color: card.labelColor }}>
                    {card.label}
                  </p>
                  <div className={styles.sv} style={{ margin: '6px 0', fontSize: card.key === 'bestRate' ? 20 : undefined }}>
                    {card.value}
                  </div>
                  <span className={`${styles.badge} ${styles[card.badge.tone]}`}>
                    <i className={`bi ${card.badge.icon}`} /> {card.badge.text}
                  </span>
                  {card.progress && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                        <span>{card.progress.label}</span>
                        <span>{card.progress.value}</span>
                      </div>
                      <div className={`${styles.pmProgress} mt-1`}>
                        <div className={styles.pmProgressBar} style={{ width: card.progress.width, background: card.progress.color }} />
                      </div>
                    </div>
                  )}
                  {card.lines.length > 0 && (
                    <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                      {card.lines.map((li, i) => (
                        <div key={i}>
                          {li.text}
                          {li.strong && <strong style={li.strongColor ? { color: li.strongColor } : undefined}>{li.strong}</strong>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ======================= ATTENTION / SUGGESTIONS / QUICK ACTIONS ======================= */}
          <div className="row g-3">
            {(
              [
                { title: 'Attention Required', items: config.attention, viewAll: 'attentionModal' },
                { title: 'Smart Suggestions', items: config.suggestions, viewAll: undefined },
              ] as const
            ).map((col) => (
              <div className="col-lg-4" key={col.title}>
                <div className={`${styles.card} h-100`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className={styles.st}>{col.title}</h3>
                    {col.viewAll ? (
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(col.viewAll!)}>
                        View all
                      </button>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeP}`}>
                        <i className="bi bi-stars" /> AI
                      </span>
                    )}
                  </div>
                  {col.items.map((item) => (
                    <div className={styles.sr} key={item.title}>
                      <div className="d-flex align-items-center gap-3">
                        <div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                          <i className={`bi ${item.icon}`} />
                        </div>
                        <div>
                          <div className={styles.fwBold13}>{item.title}</div>
                          <div className={styles.mutedSmall}>{item.sub}</div>
                        </div>
                      </div>
                      <button
                        className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ''}`}
                        onClick={() => openM(item.modal)}
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="col-lg-4">
              <div className={`${styles.card} h-100`}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent FX workflows</p>
                </div>
                <div className={styles.quickGrid}>
                  {config.quickActions.map((qa) => (
                    <button key={qa.label} className={styles.quickBtn} onClick={() => openM(qa.modal)}>
                      <i className={`bi ${qa.icon} me-1`} style={{ color: qa.color }} /> {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.13.1 — Portfolio Overview ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-wallet2"
              iconColor="var(--pm-primary)"
              code="1.13.1"
              title="Multi-Currency Portfolio Overview"
              sub="Real-time balances across all currency wallets with equivalent values, performance, and quick actions."
              actions={[
                { label: 'Analytics', icon: 'bi-bar-chart', modal: 'fxAnalyticsModal' },
                { label: 'New Wallet', icon: 'bi-plus-lg', modal: 'newWalletModal', tone: 'btnPmP' },
              ]}
              onOpen={openM}
            />
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.portfolio.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.portfolio.rows.map((r) => (
                    <tr key={r.currency}>
                      <td>
                        <strong>{r.currency}</strong>
                      </td>
                      <td>{r.wallet}</td>
                      <td>
                        <strong>{r.balance}</strong>
                      </td>
                      <td>{r.kes}</td>
                      <td>
                        <span style={{ color: r.change.includes('+') ? 'var(--pm-accent)' : 'var(--pm-danger)' }}>{r.change}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                      </td>
                      <td>
                        <div className="d-flex" style={{ gap: 4 }}>
                          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('convertModal')}>
                            Convert
                          </button>
                          <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('fxTransferModal')}>
                            Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================= SECTION 1.13.2 — Live FX Rates & Market Center ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-graph-up-arrow"
              iconColor="var(--pm-accent)"
              code="1.13.2"
              title="Live FX Rates & Market Center"
              sub="Real-time interbank and retail rates, historical charts, rate alerts, and market insights."
              actions={[
                { label: 'Alerts', icon: 'bi-bell', modal: 'rateAlertsModal' },
                { label: 'Market Depth', icon: 'bi-globe', modal: 'fxMarketModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-7">
                <Ub title="Live Retail Rates (KES)">
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Pair</th>
                          <th>Buy</th>
                          <th>Sell</th>
                          <th>Spread</th>
                          <th>24h</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.liveRates.map((r) => (
                          <tr key={r.pair}>
                            <td>
                              <strong>{r.pair}</strong>
                            </td>
                            <td>{r.buy}</td>
                            <td>{r.sell}</td>
                            <td>{r.spread}</td>
                            <td>
                              <span style={{ color: r.change.includes('+') ? 'var(--pm-accent)' : 'var(--pm-danger)' }}>{r.change}</span>
                            </td>
                            <td>
                              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('convertModal')}>
                                Trade
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Ub>
              </div>
              <div className="col-lg-5">
                <Ub title="Rate Alerts Active">
                  <SrRowList rows={config.rateAlerts} wideButton={{ label: 'Manage All Alerts', modal: 'rateAlertsModal' }} onOpen={openM} />
                </Ub>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.13.3 — FX Transfers & Conversions ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-arrow-left-right"
              iconColor="var(--pm-info)"
              code="1.13.3"
              title="FX Transfers & Conversions"
              sub="Instant and scheduled currency conversions with smart routing, fee transparency, and receipt generation."
              actions={[
                { label: 'Transfer', icon: 'bi-send', modal: 'fxTransferModal' },
                { label: 'Convert Now', modal: 'convertModal', tone: 'btnPmP' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-8">
                <Ub title="Recent FX Transactions">
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          {config.recentFx.cols.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.recentFx.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                <CellValue cell={cell} onOpen={openM} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Ub>
              </div>
              <div className="col-lg-4">
                <Ub title="Quick Convert">
                  <div className="mb-2">
                    <label className={styles.fl}>From</label>
                    <select className={styles.fc} defaultValue={config.quickConvert.fromOptions[0]}>
                      {config.quickConvert.fromOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className={styles.fl}>To</label>
                    <select className={styles.fc} defaultValue={config.quickConvert.toOptions[0]}>
                      {config.quickConvert.toOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className={styles.fl}>Amount</label>
                    <input className={styles.fc} defaultValue={config.quickConvert.amount} />
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnPmP} w-100`} onClick={() => openM('convertModal')}>
                    Convert Instantly
                  </button>
                </Ub>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.13.4 — Hedging, Forwards & Risk ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-shield-check"
              iconColor="var(--pm-purple)"
              code="1.13.4"
              title="Hedging, Forwards & Risk Management"
              sub="Forward contracts, options, hedging strategies, and exposure monitoring for treasury teams."
              actions={[
                { label: 'New Contract', modal: 'hedgeModal' },
                { label: 'Risk Dashboard', modal: 'fxRiskModal' },
              ]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-6">
                <Ub title="Active Forward Contracts">
                  <SrRowList rows={config.contracts} wideButton={{ label: 'Manage Contracts', modal: 'hedgeModal' }} onOpen={openM} />
                </Ub>
              </div>
              <div className="col-lg-6">
                <Ub title="FX Exposure Summary">
                  {config.exposure.map((e) => (
                    <div className="mb-3" key={e.label}>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                        <span>{e.label}</span>
                        <span style={{ color: e.valueColor }}>{e.value}</span>
                      </div>
                      <div className={styles.pmProgress}>
                        <div className={styles.pmProgressBar} style={{ width: e.width, background: e.color }} />
                      </div>
                    </div>
                  ))}
                  <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => openM('fxRiskModal')}>
                    View Full Exposure
                  </button>
                </Ub>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.13.5 — FX Analytics & Reporting ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-bar-chart-line"
              iconColor="var(--pm-info)"
              code="1.13.5"
              title="FX Analytics & Reporting"
              sub="Comprehensive FX performance reports, cost analysis, and predictive insights."
              actions={[{ label: 'Export', icon: 'bi-download', modal: 'fxStatementModal' }]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-5">
                <Ub title="Monthly FX Cost Breakdown">
                  <div className={styles.chartBars} style={{ height: 90 }}>
                    {config.costBars.map((b) => (
                      <div key={b.label} className={styles.chartBar} style={{ height: b.height, background: b.color }}>
                        <span className={styles.barLabel}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </Ub>
              </div>
              <div className="col-lg-7">
                <Ub title="Key Metrics">
                  <div className="row g-3">
                    {config.keyMetrics.map((m) => (
                      <div className="col-md-4" key={m.label}>
                        <div className={styles.summaryBox}>
                          <div className={styles.mutedSmall}>{m.label}</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: 'var(--pm-font-display)' }}>{m.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Ub>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.13.6 — FX Automation & Preferences ======================= */}
          <div className={styles.card}>
            <SectionHead
              icon="bi-gear"
              iconColor="var(--pm-muted)"
              code="1.13.6"
              title="FX Automation & Preferences"
              sub="Auto-conversion rules, rate alerts, wallet preferences, and permission controls."
              actions={[{ label: 'Automation', icon: 'bi-robot', modal: 'fxAutomationModal' }]}
              onOpen={openM}
            />
            <div className="row g-3">
              <div className="col-lg-4">
                <Ub title="Auto-Conversion Rules">
                  <SrRowList rows={config.autoRules} wideButton={{ label: 'Manage Rules', modal: 'fxAutomationModal' }} onOpen={openM} />
                </Ub>
              </div>
              <div className="col-lg-4">
                <Ub title="Rate Alert Settings">
                  <SrRowList rows={config.alertSettings} wideButton={{ label: 'Edit Alerts', modal: 'rateAlertsModal' }} onOpen={openM} />
                </Ub>
              </div>
              <div className="col-lg-4">
                <Ub title="Wallet Preferences">
                  <SrRowList rows={config.walletPrefs} wideButton={{ label: 'Preferences', modal: 'fxPreferencesModal' }} onOpen={openM} />
                </Ub>
              </div>
            </div>
          </div>

          {/* ======================= SECTION 1.13.7 — Recent FX Activity ======================= */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className={styles.st}>
                <i className="bi bi-clock-history" style={{ color: 'var(--pm-muted)' }} /> Recent FX Activity
              </h3>
              <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM('fxStatementModal')}>
                Full History
              </button>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    {config.activity.cols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.activity.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          <CellValue cell={cell} onOpen={openM} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* content */}
      </div>
      {/* main */}

      {/* ======================= ALL 23 MODALS ======================= */}
      <FxModals active={activeModal} onClose={closeM} onOpen={openM} />
    </div>
  )
}
