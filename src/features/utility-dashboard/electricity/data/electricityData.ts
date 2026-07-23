/* 3.2 Electricity Management Deep Dive — backend-ready mock content. */
export type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'
export interface FeedItem { iconText: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
export interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
export interface PrepaidMeter { name: string; meter: string; units: string; status: 'safe' | 'watch' | 'low' | 'critical'; provider: string; modal: string; color: string; bg: string; icon: string }
export interface AlertRow { name: string; sub: string; tone: BadgeTone; badge: string; actionLabel: string; actionClass?: string; modal: string }
export interface PostpaidRow { account: string; nickname: string; bill: string; due: string; status: 'due' | 'paid' | 'dispute'; forecast: string }
export interface SnapshotRow { label: string; sub: string; amount: string; danger?: boolean }
export interface TrendBar { month: string; height: string; color: string }
export interface PerfRow { name: string; sub: string; tone: BadgeTone; badge: string }
export interface PortfolioRow { meter: string; name: string; type: string; region: string; status: string; tone: BadgeTone; month: string; projected: string }
export interface AutoRule { name: string; rule: string; state: 'Active' | 'Paused' | 'Alert' }
export interface OutageRow { title: string; meta: string; badge: string; tone: BadgeTone }
export interface Member { name: string; role: string; meters: string; initials: string; grad: string }
export interface CaseRow { id: string; type: string; meter: string; tone: BadgeTone; status: string; opened: string; next: string; actionLabel: string; modal: string }
export interface TxnRow { date: string; service: string; meter: string; amount: string; method: string; tone: BadgeTone; status: string; ref: string; actionLabel: string; modal: string }

export interface ElectricityConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string; pageTitle: string; pageSub: string
  hero: { live: string; value: string; detail: string; actions: { label: string; modal: string }[] }
  statCards: { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; accentBorder?: boolean; miniBars?: { height: string; color: string }[]; progress?: { label: string; pct: string; color: string; left: string }; lines?: string[] }[]
  attention: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  prepaidMeters: PrepaidMeter[]
  alertFeed: AlertRow[]
  tokenSummary: { purchased: string; units: string; lastToken: string }
  recentTokens: { date: string; meter: string; nickname: string; amount: string; units: string; token: string; method: string }[]
  postpaidRows: PostpaidRow[]
  billingSnapshot: SnapshotRow[]
  forecastRisk: { highTitle: string; highSub: string; bestTitle: string; bestSub: string }
  consumptionTrend: TrendBar[]
  trendStats: { avg: string; peak: string }
  perfBoard: PerfRow[]
  efficiencyLevers: { label: string; value: string; sub: string; bg: string; color: string; head: string }[]
  portfolioRows: PortfolioRow[]
  autoRules: AutoRule[]
  outageFeed: OutageRow[]
  household: Member[]
  cases: CaseRow[]
  transactions: TxnRow[]
}

export const initialMockData: ElectricityConfig = {
  breadcrumb: { parents: [{ label: 'Home', to: '/utility' }, { label: 'Utilities Hub', to: '/utility' }, { label: 'Electricity', to: '/utility/electricity' }], current: 'Deep Dive' },
  pageCode: 'PAGE 3.2', pageTitle: 'Electricity Management (Deep Dive)',
  pageSub: 'Manage prepaid and postpaid electricity accounts, multiple meters, energy spend, bill forecasts, outages, disputes and automation in one extensive command center.',
  hero: { live: 'Electricity command center is live', value: '8 electricity meters linked', detail: 'Home, office, rental units, parent home and solar PAYGO accounts monitored from one place.', actions: [{ label: 'Buy token', modal: 'buyTokenModal' }, { label: 'Pay bill', modal: 'payPostpaidModal' }, { label: 'Auto-top-up', modal: 'autoTopupModal' }] },
  statCards: [
    { key: 'due', col: 'col-lg-2 col-md-4 col-6', label: 'DUE IN 7 DAYS', labelColor: 'var(--pm-warning)', value: 'KES 22,450', badge: { icon: 'bi-clock', text: '4 bills due', tone: 'badgeW' }, miniBars: [{ height: '75%', color: 'var(--pm-primary)' }, { height: '40%', color: 'var(--pm-info)' }, { height: '82%', color: 'var(--pm-primary)' }, { height: '55%', color: 'var(--pm-info)' }, { height: '88%', color: 'var(--pm-primary)' }, { height: '36%', color: 'var(--pm-info)' }] },
    { key: 'consumption', col: 'col-lg-3 col-md-4 col-6', label: 'THIS MONTH CONSUMPTION', labelColor: 'var(--pm-info)', value: '3,482 kWh', badge: { icon: 'bi-graph-down-arrow', text: '6.4% below forecast', tone: 'badgeS' }, progress: { label: 'Peak usage', pct: '68%', color: 'var(--pm-info)', left: '7pm–10pm' } },
    { key: 'portfolio', col: 'col-lg-3 col-md-4', label: 'POWER PORTFOLIO VALUE', labelColor: 'var(--pm-accent)', value: 'KES 91,620', badge: { icon: 'bi-shield-check', text: '5 auto-rules active', tone: 'badgeS' }, accentBorder: true, lines: ['Projected monthly spend: <strong>KES 78,900</strong>', 'Potential savings identified: <strong>KES 8,450</strong>'] },
  ],
  attention: [
    { iconText: 'KP', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Office postpaid overdue by 2 days', sub: 'Acc #KPLC-22901847 · KES 8,400', actionLabel: 'Pay', actionClass: 'btnPmP', modal: 'payPostpaidModal' },
    { iconText: 'LB', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Home prepaid balance below 20 units', sub: 'Meter #14825739 · est. 1.2 days left', actionLabel: 'Top-up', modal: 'buyTokenModal' },
    { iconText: 'OT', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Planned outage near Rental Unit B', sub: 'Tomorrow, 9:00 AM – 3:00 PM', actionLabel: 'Review', modal: 'outageTrackerModal' },
    { iconText: 'DR', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Meter reading dispute response ready', sub: 'Ticket #DSP-22419 · action required', actionLabel: 'Open', modal: 'disputeBillModal' },
  ],
  suggestions: [
    { iconText: 'AT', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Activate auto-top-up for 3 meters', sub: 'Avoid low-balance interruptions and queue penalties', actionLabel: 'Setup', modal: 'autoTopupModal' },
    { iconText: 'TS', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Shift borehole pumping to off-peak time', sub: 'Estimated savings: KES 2,100/month', actionLabel: 'See plan', modal: 'suggestionsModal' },
    { iconText: 'BF', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'July office bill likely to exceed budget', sub: 'Forecast: KES 11,900 vs budget KES 9,500', actionLabel: 'Forecast', modal: 'billForecastModal' },
    { iconText: 'EC', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Emergency credit available on home meter', sub: 'Unlock 15 kWh until next purchase', actionLabel: 'Activate', modal: 'emergencyCreditModal' },
  ],
  quickActions: [
    { icon: 'bi-lightning-charge', iconColor: 'var(--pm-warning)', label: 'Buy Token', modal: 'buyTokenModal' },
    { icon: 'bi-receipt', iconColor: 'var(--pm-primary)', label: 'Pay Bill', modal: 'payPostpaidModal' },
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-accent)', label: 'Add Meter', modal: 'addMeterModal' },
    { icon: 'bi-collection', iconColor: 'var(--pm-purple)', label: 'Bulk Pay', modal: 'bulkElectricityPayModal' },
    { icon: 'bi-camera', iconColor: 'var(--pm-info)', label: 'Upload Reading', modal: 'uploadReadingModal' },
    { icon: 'bi-cone-striped', iconColor: 'var(--pm-danger)', label: 'Report Outage', modal: 'reportOutageModal' },
    { icon: 'bi-calculator', iconColor: 'var(--pm-primary)', label: 'Tariff Calc', modal: 'tariffCalculatorModal' },
    { icon: 'bi-download', iconColor: 'var(--pm-accent)', label: 'Statements', modal: 'statementExportModal' },
  ],
  prepaidMeters: [
    { name: 'Home Kilimani', meter: '14825739', units: '17 units', status: 'low', provider: 'KPLC', modal: 'buyTokenModal', color: '#F59E0B', bg: '#FEF3C7', icon: 'bi-house-door' },
    { name: 'Rental Unit A', meter: '33741092', units: '42 units', status: 'watch', provider: 'KPLC', modal: 'manageMeterModal', color: '#3B82F6', bg: '#DBEAFE', icon: 'bi-key' },
    { name: 'Parent Home', meter: '55128201', units: '61 units', status: 'safe', provider: 'KPLC', modal: 'manageMeterModal', color: '#10B981', bg: '#D1FAE5', icon: 'bi-heart' },
    { name: 'Borehole Pump', meter: '80291284', units: '9 units', status: 'critical', provider: 'KPLC', modal: 'emergencyCreditModal', color: '#EF4444', bg: '#FEE2E2', icon: 'bi-water' },
    { name: 'Rental Unit B', meter: '44600129', units: '31 units', status: 'watch', provider: 'KPLC', modal: 'manageMeterModal', color: '#8B5CF6', bg: '#EDE9FE', icon: 'bi-house' },
    { name: 'Guest House', meter: '61190214', units: '52 units', status: 'safe', provider: 'KPLC', modal: 'manageMeterModal', color: '#10B981', bg: '#D1FAE5', icon: 'bi-building' },
  ],
  alertFeed: [
    { name: 'Home Meter', sub: 'Meter 14825739 · 17 units left', tone: 'badgeW', badge: 'Low', actionLabel: 'Top-up', modal: 'buyTokenModal' },
    { name: 'Rental Unit A', sub: 'Meter 33741092 · 42 units left', tone: 'badgeI', badge: 'Watch', actionLabel: 'Configure', modal: 'lowBalanceAlertModal' },
    { name: 'Parent Home', sub: 'Meter 55128201 · Auto-top-up enabled', tone: 'badgeS', badge: 'Safe', actionLabel: 'Rule', modal: 'autoTopupModal' },
    { name: 'Borehole Pump', sub: 'Meter 80291284 · 9 units left', tone: 'badgeD', badge: 'Critical', actionLabel: 'Credit', actionClass: 'btnPmD', modal: 'emergencyCreditModal' },
  ],
  tokenSummary: { purchased: 'KES 31,250', units: '2,198 kWh', lastToken: '4729-8301-5624-9173' },
  recentTokens: [
    { date: '27 Jun 2025', meter: '14825739', nickname: 'Home', amount: 'KES 2,000', units: '141.8 kWh', token: '4729-8301-5624...', method: 'M-Pesa' },
    { date: '24 Jun 2025', meter: '55128201', nickname: 'Parent Home', amount: 'KES 1,500', units: '106.2 kWh', token: '8831-2204-1794...', method: 'Wallet' },
    { date: '21 Jun 2025', meter: '33741092', nickname: 'Rental Unit A', amount: 'KES 3,000', units: '212.4 kWh', token: '1190-6642-3308...', method: 'M-Pesa' },
    { date: '18 Jun 2025', meter: '80291284', nickname: 'Borehole Pump', amount: 'KES 1,000', units: '70.9 kWh', token: '5527-9013-2281...', method: 'Bank' },
  ],
  postpaidRows: [
    { account: '22901847', nickname: 'Office Westlands', bill: 'KES 8,400', due: '25 Jun 2025', status: 'due', forecast: 'KES 10,950' },
    { account: '11820384', nickname: 'Workshop Thika Rd', bill: 'KES 6,950', due: '30 Jun 2025', status: 'due', forecast: 'KES 7,100' },
    { account: '77839101', nickname: 'Guest House Naivasha', bill: 'KES 5,240', due: '15 Jul 2025', status: 'paid', forecast: 'KES 5,600' },
    { account: '99201833', nickname: 'Admin Flat', bill: 'KES 3,410', due: '11 Jul 2025', status: 'dispute', forecast: 'KES 3,200' },
  ],
  billingSnapshot: [
    { label: 'Base Charge', sub: 'Energy units', amount: 'KES 6,220' },
    { label: 'Fuel Cost Charge', sub: 'Monthly adjustment', amount: 'KES 850' },
    { label: 'VAT 16%', sub: 'Inclusive bill tax', amount: 'KES 1,138' },
    { label: 'Levies & Forex', sub: 'ERC / REA / Forex', amount: 'KES 192' },
    { label: 'Previous Balance', sub: 'Carried forward', amount: 'KES 0' },
    { label: 'Total Due', sub: 'Office account', amount: 'KES 8,400', danger: true },
  ],
  forecastRisk: { highTitle: 'Office Westlands', highSub: 'Expected to exceed budget by KES 2,400', bestTitle: 'Home Kilimani', bestSub: 'Consumption down 9% vs last month' },
  consumptionTrend: [
    { month: 'Jan', height: '58%', color: 'var(--pm-info)' }, { month: 'Feb', height: '66%', color: 'var(--pm-info)' },
    { month: 'Mar', height: '81%', color: 'var(--pm-warning)' }, { month: 'Apr', height: '74%', color: 'var(--pm-warning)' },
    { month: 'May', height: '70%', color: 'var(--pm-accent)' }, { month: 'Jun', height: '62%', color: 'var(--pm-primary)' },
  ],
  trendStats: { avg: '116 kWh', peak: '182 kWh' },
  perfBoard: [
    { name: 'Home Kilimani', sub: '412 kWh · efficient appliances', tone: 'badgeS', badge: 'Healthy' },
    { name: 'Office Westlands', sub: '1,188 kWh · aircon load high', tone: 'badgeD', badge: 'Over Budget' },
    { name: 'Rental Unit A', sub: '289 kWh · within average', tone: 'badgeI', badge: 'Stable' },
    { name: 'Rental Unit B', sub: '331 kWh · weekend spikes', tone: 'badgeW', badge: 'Watch' },
    { name: 'Parent Home', sub: '206 kWh · auto-top-up enabled', tone: 'badgeS', badge: 'Safe' },
    { name: 'Borehole Pump', sub: '521 kWh · schedule optimization possible', tone: 'badgeW', badge: 'Optimize' },
  ],
  efficiencyLevers: [
    { head: 'AUTO SAVINGS AVAILABLE', label: '', value: 'KES 8,450', sub: 'Move pumps and heaters off peak', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' },
    { head: 'BEST TIME TO TOP-UP', label: '', value: 'Before 7 PM', sub: 'Avoid emergency overnight outages', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)' },
    { head: 'FORECAST NEXT BILL', label: '', value: 'KES 10,950', sub: 'Office account if current pattern continues', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)' },
  ],
  portfolioRows: [
    { meter: '14825739', name: 'Home Kilimani', type: 'Prepaid', region: 'Nairobi', status: 'Low balance', tone: 'badgeW', month: '412 kWh', projected: 'KES 7,920' },
    { meter: '22901847', name: 'Office Westlands', type: 'Postpaid', region: 'Nairobi', status: 'Overdue bill', tone: 'badgeD', month: '1,188 kWh', projected: 'KES 10,950' },
    { meter: '33741092', name: 'Rental Unit A', type: 'Prepaid', region: 'Kiambu', status: 'Healthy', tone: 'badgeS', month: '289 kWh', projected: 'KES 5,110' },
    { meter: '44600129', name: 'Rental Unit B', type: 'Prepaid', region: 'Nairobi', status: 'Planned outage', tone: 'badgeW', month: '331 kWh', projected: 'KES 5,830' },
    { meter: '55128201', name: 'Parent Home', type: 'Prepaid', region: 'Nyeri', status: 'Auto-top-up active', tone: 'badgeI', month: '206 kWh', projected: 'KES 3,680' },
    { meter: '80291284', name: 'Borehole Pump', type: 'Prepaid', region: 'Machakos', status: 'Critical units', tone: 'badgeD', month: '521 kWh', projected: 'KES 9,200' },
    { meter: '61190214', name: 'Guest House', type: 'Prepaid', region: 'Nakuru', status: 'Healthy', tone: 'badgeS', month: '281 kWh', projected: 'KES 4,930' },
  ],
  autoRules: [
    { name: 'Home meter', rule: 'KES 2,000 when units < 20', state: 'Active' },
    { name: 'Parent home', rule: 'KES 1,500 when units < 15', state: 'Active' },
    { name: 'Borehole pump', rule: 'KES 1,000 every Tuesday 7 PM', state: 'Paused' },
    { name: 'Rental A', rule: 'Notify only when units < 25', state: 'Alert' },
    { name: 'Office bill', rule: 'Pay full bill 2 days before due', state: 'Active' },
  ],
  outageFeed: [
    { title: 'Planned maintenance — Rental Unit B', meta: '28 Jun · 9 AM – 3 PM · line upgrade', badge: 'Planned', tone: 'badgeW' },
    { title: 'Reported outage — Home meter area', meta: 'Ticket OUT-89244 · queued for verification', badge: 'Reported', tone: 'badgeI' },
    { title: 'Office voltage complaint', meta: 'Technician visit expected today 2 PM', badge: 'Escalated', tone: 'badgeD' },
    { title: 'Resolved outage — Parent Home', meta: 'Closed on 22 Jun · service restored', badge: 'Resolved', tone: 'badgeS' },
  ],
  household: [
    { name: 'Grace Kamau', role: 'Full pay + manage', meters: 'Home, Parent Home', initials: 'GK', grad: 'var(--pm-gradient-hero)' },
    { name: 'Mama Nyokabi', role: 'View only', meters: 'Parent Home', initials: 'MN', grad: 'var(--pm-gradient-violet)' },
    { name: 'Caretaker Joe', role: 'Alert only', meters: 'Borehole Pump', initials: 'CJ', grad: 'var(--pm-gradient-blue)' },
  ],
  cases: [
    { id: 'DSP-22419', type: 'Billing dispute', meter: 'Office Westlands', tone: 'badgeW', status: 'Awaiting reply', opened: '24 Jun 2025', next: 'Upload meter photo', actionLabel: 'Upload', modal: 'uploadReadingModal' },
    { id: 'OUT-88411', type: 'Outage ticket', meter: 'Rental Unit B', tone: 'badgeI', status: 'Investigating', opened: '26 Jun 2025', next: 'KPLC field visit', actionLabel: 'Track', modal: 'outageTrackerModal' },
    { id: 'SRQ-11872', type: 'Meter label update', meter: 'Parent Home', tone: 'badgeS', status: 'Resolved', opened: '10 Jun 2025', next: 'Download resolution note', actionLabel: 'View', modal: 'serviceRequestModal' },
    { id: 'ALR-55291', type: 'Auto-top-up failure', meter: 'Borehole Pump', tone: 'badgeD', status: 'Needs action', opened: '27 Jun 2025', next: 'Update fallback method', actionLabel: 'Fix', modal: 'autoTopupModal' },
  ],
  transactions: [
    { date: '27 Jun 2025', service: 'Prepaid Token', meter: 'Home · 14825739', amount: 'KES 2,000', method: 'M-Pesa', tone: 'badgeS', status: 'Success', ref: 'TKN-20250627-8834', actionLabel: 'Share', modal: 'shareTokenModal' },
    { date: '26 Jun 2025', service: 'Postpaid Bill', meter: 'Office · 22901847', amount: 'KES 8,400', method: 'M-Pesa', tone: 'badgeS', status: 'Success', ref: 'BIL-20250626-1172', actionLabel: 'Receipt', modal: 'statementExportModal' },
    { date: '24 Jun 2025', service: 'Prepaid Token', meter: 'Parent Home · 55128201', amount: 'KES 1,500', method: 'Wallet', tone: 'badgeS', status: 'Success', ref: 'TKN-20250624-3391', actionLabel: 'Share', modal: 'shareTokenModal' },
    { date: '22 Jun 2025', service: 'Emergency Credit', meter: 'Borehole · 80291284', amount: '15 kWh', method: 'Auto', tone: 'badgeI', status: 'Provisioned', ref: 'ECR-20250622-2201', actionLabel: 'Receipt', modal: 'statementExportModal' },
    { date: '21 Jun 2025', service: 'Prepaid Token', meter: 'Rental A · 33741092', amount: 'KES 3,000', method: 'M-Pesa', tone: 'badgeS', status: 'Success', ref: 'TKN-20250621-7745', actionLabel: 'Share', modal: 'shareTokenModal' },
  ],
}

export async function fetchElectricityDeepDive(): Promise<ElectricityConfig> {
  try {
    // Backend endpoint would resolve here; fall back to bundled mock content.
    await new Promise((r) => setTimeout(r, 120))
    return initialMockData
  } catch {
    return initialMockData
  }
}
