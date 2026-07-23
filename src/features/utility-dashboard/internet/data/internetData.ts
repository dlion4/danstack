/* 3.4 Internet & Connectivity Management — backend-ready mock content. */
export type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'
export interface FeedItem { icon?: string; iconText?: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
export interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
export interface FibreConnection { provider: string; account: string; plan: string; speed: string; status: 'active' | 'degraded'; due: string }
export interface SimCard { network: string; number: string; bal: string; expiry: string; auto: boolean; color: string; bg: string }
export interface TrendBar { month: string; height: string; color: string }
export interface AutoRenew { name: string; sub: string; tone: BadgeTone; status: string }
export interface NetStatus { name: string; detail: string; tone: 'success' | 'warning' | 'muted'; icon: string }

export interface InternetConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string; pageTitle: string; pageSub: string
  hero: { live: string; value: string; detail: string; actions: { label: string; modal: string }[] }
  statCards: { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; accentBorder?: boolean; progress?: { label: string; value: string; pct: string; color: string }; miniBars?: { height: string; color: string }[]; lines?: string[] }[]
  attention: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  fibreConnections: FibreConnection[]
  sims: SimCard[]
  dataUsageTrend: TrendBar[]
  autoRenewals: AutoRenew[]
  networkStatus: NetStatus[]
}

export const initialMockData: InternetConfig = {
  breadcrumb: { parents: [{ label: 'Home', to: '/utility' }, { label: 'Utilities Hub', to: '/utility' }, { label: 'Internet', to: '/utility/internet' }], current: 'Management' },
  pageCode: 'PAGE 3.4', pageTitle: 'Internet & Connectivity Management',
  pageSub: 'Manage home broadband, mobile data SIMs, bundle subscriptions, network outages and auto-renewals.',
  hero: { live: 'Connectivity hub is online', value: '6 networks linked', detail: 'Safaricom Home, Zuku, Starlink, and 3 mobile SIMs managed in one view.', actions: [{ label: 'Buy Data', modal: 'buyDataModal' }, { label: 'Pay Fibre', modal: 'payFibreModal' }, { label: 'Sambaza', modal: 'shareDataModal' }] },
  statCards: [
    { key: 'usage', col: 'col-lg-2 col-md-4 col-6', label: 'MONTHLY DATA USAGE', labelColor: 'var(--pm-primary)', value: '1.2 TB', badge: { icon: 'bi-wifi', text: '92% Fibre', tone: 'badgeI' }, miniBars: [{ height: '60%', color: 'var(--pm-primary)' }, { height: '70%', color: 'var(--pm-primary)' }, { height: '55%', color: 'var(--pm-primary)' }, { height: '90%', color: 'var(--pm-primary)' }, { height: '85%', color: 'var(--pm-primary)' }, { height: '40%', color: 'var(--pm-info)' }] },
    { key: 'renewals', col: 'col-lg-3 col-md-4 col-6', label: 'RENEWALS IN 7 DAYS', labelColor: 'var(--pm-warning)', value: 'KES 9,850', badge: { icon: 'bi-clock', text: '3 subscriptions', tone: 'badgeW' }, progress: { label: 'Safaricom Gold Due', value: '01 Jul', pct: '85%', color: 'var(--pm-warning)' } },
    { key: 'autorenew', col: 'col-lg-3 col-md-4', label: 'ACTIVE AUTO-RENEWALS', labelColor: 'var(--pm-accent)', value: '4 Rules', badge: { icon: 'bi-shield-check', text: 'Seamless', tone: 'badgeS' }, accentBorder: true, lines: ['Next execution: <strong>Tomorrow 8AM</strong>', 'Coverage: <strong>Home + 2 SIMs</strong>'] },
  ],
  attention: [
    { iconText: 'SF', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Safaricom Fibre expires soon', sub: 'Acc #SF-40812 · KES 5,999 · 3 days left', actionLabel: 'Renew', actionClass: 'btnPmP', modal: 'payFibreModal' },
    { iconText: 'AL', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Airtel Data below 500MB', sub: '0733***456 · Auto-renew paused', actionLabel: 'Top-up', modal: 'buyDataModal' },
    { iconText: 'ZK', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Zuku outage reported in area', sub: 'Kilimani zone · expected fix 4PM', actionLabel: 'Track', modal: 'networkOutagesModal' },
  ],
  suggestions: [
    { iconText: 'UP', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Upgrade to Faiba 40Mbps', sub: 'Save KES 2,149/mo vs current plan', actionLabel: 'Compare', modal: 'serviceComparisonModal' },
    { iconText: 'BN', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Switch to 30-day data bundle', sub: 'Your daily bundles cost 20% more', actionLabel: 'Review', modal: 'suggestionsModal' },
    { iconText: 'AR', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Automate Airtel Airtime', sub: 'Never run out during calls', actionLabel: 'Setup', modal: 'autoRenewSetupModal' },
  ],
  quickActions: [
    { icon: 'bi-router', iconColor: 'var(--pm-primary)', label: 'Pay Home Fibre', modal: 'payFibreModal' },
    { icon: 'bi-reception-4', iconColor: 'var(--pm-accent)', label: 'Buy Data / Airtime', modal: 'buyDataModal' },
    { icon: 'bi-share', iconColor: 'var(--pm-info)', label: 'Sambaza (Share)', modal: 'shareDataModal' },
    { icon: 'bi-speedometer', iconColor: 'var(--pm-warning)', label: 'Speed Test', modal: 'runSpeedTestModal' },
    { icon: 'bi-arrow-up-circle', iconColor: 'var(--pm-purple)', label: 'Upgrade Plan', modal: 'upgradePlanModal' },
    { icon: 'bi-exclamation-triangle', iconColor: 'var(--pm-danger)', label: 'Report Fault', modal: 'reportFaultModal' },
    { icon: 'bi-collection', iconColor: 'var(--pm-ink-soft)', label: 'Bulk Top-up', modal: 'bulkTopupModal' },
    { icon: 'bi-globe', iconColor: 'var(--pm-ink)', label: 'Starlink', modal: 'starlinkManageModal' },
  ],
  fibreConnections: [
    { provider: 'Safaricom Home', account: 'SF-40812', plan: 'Gold 40Mbps', speed: '40-50 Mbps', status: 'active', due: '01 Jul 2025' },
    { provider: 'Zuku', account: 'ZK-11928', plan: 'Office 50Mbps', speed: '40-50 Mbps', status: 'degraded', due: '15 Jul 2025' },
    { provider: 'Starlink', account: 'SL-99120', plan: 'Roam', speed: '40-50 Mbps', status: 'active', due: '15 Jul 2025' },
  ],
  sims: [
    { network: 'Safaricom', number: '0712 *** 890', bal: '4.2 GB', expiry: '12 Jul 2025', auto: true, color: '#10B981', bg: '#D1FAE5' },
    { network: 'Airtel', number: '0733 *** 456', bal: '110 MB', expiry: 'Tomorrow', auto: false, color: '#EF4444', bg: '#FEE2E2' },
    { network: 'Telkom', number: '0771 *** 888', bal: '10.5 GB', expiry: '30 Jul 2025', auto: true, color: '#3B82F6', bg: '#DBEAFE' },
  ],
  dataUsageTrend: [
    { month: 'Jan', height: '40%', color: 'var(--pm-primary-light)' }, { month: 'Feb', height: '55%', color: 'var(--pm-primary-light)' },
    { month: 'Mar', height: '48%', color: 'var(--pm-primary-light)' }, { month: 'Apr', height: '80%', color: 'var(--pm-primary)' },
    { month: 'May', height: '65%', color: 'var(--pm-primary)' }, { month: 'Jun', height: '70%', color: 'var(--pm-primary)' },
  ],
  autoRenewals: [
    { name: 'Safaricom Home', sub: 'KES 5,999 on 1st', tone: 'badgeS', status: 'Active' },
    { name: 'Starlink Roam', sub: 'KES 6,500 on 15th', tone: 'badgeS', status: 'Active' },
    { name: 'Airtel Data 12GB', sub: 'KES 1,000 monthly', tone: 'badgeW', status: 'Paused' },
  ],
  networkStatus: [
    { name: 'Safaricom Fibre', detail: '100% uptime last 7 days', tone: 'success', icon: 'bi-check-circle' },
    { name: 'Zuku Kilimani', detail: 'Degraded speeds in area', tone: 'warning', icon: 'bi-exclamation-triangle' },
    { name: 'Starlink', detail: 'Normal operation (45ms latency)', tone: 'muted', icon: 'bi-globe' },
  ],
}

export async function fetchInternetManagement(): Promise<InternetConfig> {
  try {
    const res = await fetch('/api/internet-management', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as InternetConfig
  } catch { return initialMockData }
}
