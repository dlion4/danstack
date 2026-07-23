/* 3.3 Water Management Deep Dive — backend-ready mock content. */
export type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'
export interface FeedItem { icon?: string; iconText?: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
export interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
export interface WaterAccount { provider: string; account: string; nickname: string; due: string; date: string; status: 'due' | 'paid' }
export interface BreakdownRow { label: string; sub: string; amount: string }
export interface TrendBar { month: string; height: string; color: string }
export interface Metric { label: string; value: string; bg: string; color: string; sub?: string }
export interface DisputeRow { id: string; sub: string; tone: BadgeTone; status: string }
export interface BowserSupplier { name: string; cert: string; cost: string; sla: string }

export interface WaterConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string; pageTitle: string; pageSub: string
  hero: { live: string; value: string; detail: string; actions: { label: string; modal: string }[] }
  statCards: { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; accentBorder?: boolean; progress?: { label: string; pct: string; color: string }; lines?: string[] }[]
  waterAlerts: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  waterAccounts: WaterAccount[]
  lastPaidBreakdown: BreakdownRow[]
  consumptionTrend: TrendBar[]
  keyMetrics: Metric[]
  openDisputes: DisputeRow[]
  bowserSuppliers: BowserSupplier[]
}

export const initialMockData: WaterConfig = {
  breadcrumb: { parents: [{ label: 'Home', to: '/utility' }, { label: 'Utilities Hub', to: '/utility' }, { label: 'Water', to: '/utility/water' }], current: 'Deep Dive' },
  pageCode: 'PAGE 3.3', pageTitle: 'Water Management (Deep Dive)',
  pageSub: 'Manage county water accounts, track m³ consumption, report bursts/leaks, and source emergency bulk water via verified bowsers.',
  hero: { live: 'Water operations active', value: '5 water accounts', detail: 'Nairobi Water, Mombasa Water, and private boreholes managed in one place.', actions: [{ label: 'Pay account', modal: 'payWaterModal' }, { label: 'Emergency supply', modal: 'orderBowserModal' }, { label: 'Auto-pay', modal: 'autoPayWaterModal' }] },
  statCards: [
    { key: 'due', col: 'col-lg-2 col-md-4 col-6', label: 'DUE IN 7 DAYS', labelColor: 'var(--pm-warning)', value: 'KES 8,350', badge: { icon: 'bi-clock', text: '2 bills due', tone: 'badgeW' }, lines: ['NCWSC — <strong>KES 3,200</strong>', 'KIWASCO — <strong>KES 5,150</strong>'] },
    { key: 'consumption', col: 'col-lg-3 col-md-4 col-6', label: 'TOTAL CONSUMPTION', labelColor: 'var(--pm-info)', value: '124 m³', badge: { icon: 'bi-graph-up-arrow', text: '12% above average', tone: 'badgeD' }, progress: { label: 'Usage vs Budget', pct: '88%', color: 'var(--pm-info)' } },
    { key: 'leak', col: 'col-lg-3 col-md-4', label: 'LEAK & PRESSURE STATUS', labelColor: 'var(--pm-accent)', value: '1 Alert', badge: { icon: 'bi-exclamation-triangle', text: 'Continuous flow detected', tone: 'badgeW' }, accentBorder: true, lines: ['Meter: <strong>Rental Unit A</strong>', 'Est. waste: <strong>1.5 m³/day</strong>'] },
  ],
  waterAlerts: [
    { icon: 'bi-droplet', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Continuous flow (Potential leak)', sub: 'Rental Unit A · Detected for 48hrs', actionLabel: 'Report', actionClass: 'btnPmD', modal: 'reportLeakModal' },
    { iconText: 'NW', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'NCWSC bill due tomorrow', sub: 'Acc #290081 · KES 3,200', actionLabel: 'Pay', modal: 'payWaterModal' },
    { icon: 'bi-cone-striped', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Low pressure / rationing expected', sub: 'Nairobi West area · Thu-Fri', actionLabel: 'Details', modal: 'outageWaterModal' },
    { icon: 'bi-clipboard-check', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Meter reading required', sub: 'Home Kilimani · verify current bill', actionLabel: 'Upload', modal: 'uploadWaterReadingModal' },
  ],
  suggestions: [
    { icon: 'bi-truck', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Pre-book water bowser', sub: 'Prepare for rationing in Nairobi West', actionLabel: 'Order', modal: 'orderBowserModal' },
    { icon: 'bi-tools', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Request plumber for Rental A', sub: 'Fix leak to prevent KES 4k penalty/waste', actionLabel: 'Request', modal: 'serviceWaterModal' },
    { icon: 'bi-arrow-repeat', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Set auto-pay for NCWSC', sub: 'Avoid disconnection fees (KES 1,500)', actionLabel: 'Setup', modal: 'autoPayWaterModal' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-primary-light)', iconColor: '#fff', title: 'Dispute unusually high bill', sub: 'KIWASCO bill is 40% above average', actionLabel: 'Dispute', modal: 'disputeWaterModal' },
  ],
  quickActions: [
    { icon: 'bi-droplet', iconColor: 'var(--pm-info)', label: 'Pay Bill', modal: 'payWaterModal' },
    { icon: 'bi-truck', iconColor: 'var(--pm-primary)', label: 'Order Bowser', modal: 'orderBowserModal' },
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-accent)', label: 'Add Account', modal: 'addWaterMeterModal' },
    { icon: 'bi-collection', iconColor: 'var(--pm-purple)', label: 'Bulk Pay', modal: 'bulkWaterPayModal' },
    { icon: 'bi-camera', iconColor: 'var(--pm-info)', label: 'Submit Reading', modal: 'uploadWaterReadingModal' },
    { icon: 'bi-exclamation-triangle', iconColor: 'var(--pm-danger)', label: 'Report Leak', modal: 'reportLeakModal' },
    { icon: 'bi-cone-striped', iconColor: 'var(--pm-warning)', label: 'Outages / Supply', modal: 'outageWaterModal' },
    { icon: 'bi-download', iconColor: 'var(--pm-accent)', label: 'Statements', modal: 'exportWaterModal' },
  ],
  waterAccounts: [
    { provider: 'Nairobi Water (NCWSC)', account: '290081', nickname: 'Home Kilimani', due: 'KES 3,200', date: 'Tomorrow', status: 'due' },
    { provider: 'Kisumu Water (KIWASCO)', account: '441092', nickname: 'Rental B', due: 'KES 5,150', date: '12 Jul', status: 'due' },
    { provider: 'Mombasa Water', account: '112009', nickname: 'Coastal Plot', due: 'KES 0', date: 'Paid', status: 'paid' },
    { provider: 'Nakuru Water', account: '881023', nickname: 'Workshop', due: 'KES 1,200', date: 'Paid via Wallet', status: 'paid' },
  ],
  lastPaidBreakdown: [
    { label: 'Water Charge', sub: 'Volume usage', amount: 'KES 2,100' },
    { label: 'Sewerage Charge', sub: 'Sanitation', amount: 'KES 800' },
    { label: 'Meter Rent', sub: 'Maintenance', amount: 'KES 50' },
    { label: 'VAT (16%)', sub: 'Taxes', amount: 'KES 250' },
    { label: 'Total Paid', sub: 'Nairobi Water', amount: 'KES 3,200' },
  ],
  consumptionTrend: [
    { month: 'Jan', height: '55%', color: 'var(--pm-primary-light)' }, { month: 'Feb', height: '60%', color: 'var(--pm-primary-light)' },
    { month: 'Mar', height: '58%', color: 'var(--pm-primary-light)' }, { month: 'Apr', height: '70%', color: 'var(--pm-primary-light)' },
    { month: 'May', height: '88%', color: 'var(--pm-danger)' }, { month: 'Jun', height: '62%', color: 'var(--pm-info)' },
  ],
  keyMetrics: [
    { label: 'Total Properties', value: '5 linked', bg: 'var(--pm-surface)', color: 'var(--pm-ink)' },
    { label: 'Leak Suspected', value: 'Rental Unit A', bg: 'var(--pm-danger-soft)', color: 'var(--pm-danger)' },
    { label: 'Avg Price per m³', value: 'KES 85.50', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)' },
  ],
  openDisputes: [
    { id: 'DSP-W-9912', sub: 'Unusually high May bill (Rental A)', tone: 'badgeW', status: 'In Review' },
    { id: 'LEAK-1044', sub: 'Continuous meter spin reported', tone: 'badgeI', status: 'Plumber Dispatched' },
  ],
  bowserSuppliers: [
    { name: 'Nairobi Pure Water Ltd', cert: 'NEMA Certified', cost: 'KES 7,500', sla: 'Same day (4h)' },
    { name: 'Maji Safi Trucking', cert: 'NEMA Certified', cost: 'KES 6,800', sla: 'Next day' },
    { name: 'Aqua Delivery Co.', cert: 'Borehole Cert.', cost: 'KES 8,000', sla: 'Express (2h)' },
  ],
}

export async function fetchWaterDeepDive(): Promise<WaterConfig> {
  try {
    const res = await fetch('/api/water-deep-dive', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as WaterConfig
  } catch { return initialMockData }
}
