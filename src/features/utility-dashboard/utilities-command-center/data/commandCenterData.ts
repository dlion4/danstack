/* ============================================================================
 * utilities-command-center data (legacy page 3.1) — backend-ready mock content.
 * All repeating blocks (services, connected accounts, charts, automation lists,
 * transactions) are extracted here and rendered via .map() in the page.
 * GET /api/utilities-command-center should return this same shape.
 * ========================================================================== */
import type { BadgeTone } from './types';

export interface HeroAction { label: string; modal: string }
export interface StatCard {
  key: string; col: string; label: string; labelColor: string; value: string;
  badge: { icon: string; text: string; tone: BadgeTone };
  lines?: string[]; warnBorder?: boolean; accentBorder?: boolean;
  progress?: { label: string; pct: string; color: string };
  miniBars?: { height: string; color: string }[];
}
export interface FeedItem { initials: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
export interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
export interface Service { id: number; name: string; icon: string; color: string; bg: string; type: string; status: 'active' | 'paused' | 'pending'; account: string; provider: string; modal: string }
export interface ConnectedService { service: string; icon: string; color: string; bg: string; provider: string; account: string; status: 'active' | 'paused' | 'pending'; lastPay: string; nextDue: string; amount: string; autoPay: boolean; modal: string }
export interface SpendCat { label: string; height: string; color: string; amount: string }
export interface BudgetRow { label: string; used: string; budget: string; pct: string; color: string }
export interface TrendBar { month: string; height: string; highlight?: boolean }
export interface AutoPayRule { name: string; rule: string; next: string; active: boolean }
export interface ScheduledPayment { name: string; date: string; amount: string; color: string }
export interface HouseholdMember { name: string; role: string; perm: string; initials: string; color: string }
export interface RecentTxn { date: string; utility: string; icon: string; iconColor: string; provider: string; account: string; amount: string; method: string; status: string; tone: BadgeTone; modal: string }

export interface CommandCenterConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string };
  pageCode: string; pageTitle: string; pageSub: string;
  hero: { live: string; value: string; detail: string; actions: HeroAction[] };
  statCards: StatCard[];
  attention: FeedItem[];
  suggestions: FeedItem[];
  quickActions: QuickAction[];
  services: Service[];
  connectedServices: ConnectedService[];
  spendByCategory: SpendCat[];
  budgetTracker: BudgetRow[];
  trend: TrendBar[];
  tips: string[];
  autoPayRules: AutoPayRule[];
  scheduledPayments: ScheduledPayment[];
  householdMembers: HouseholdMember[];
  recentTransactions: RecentTxn[];
}

export const initialMockData: CommandCenterConfig = {
  breadcrumb: { parents: [{ label: 'Home', to: '/utility' }, { label: 'Utilities Hub', to: '/utility' }], current: 'Utilities Command Center' },
  pageCode: 'PAGE 3.1',
  pageTitle: 'Utilities Command Center',
  pageSub: 'Manage all utility accounts, track spending, pay bills, set auto-pay & monitor service health from one central hub.',
  hero: {
    live: 'Utility command center is live',
    value: '14 utilities linked',
    detail: 'Electricity, water, gas, internet, TV, airtime & solar managed in one place.',
    actions: [
      { label: 'Pay bill', modal: 'payBillQuickModal' },
      { label: 'Buy airtime', modal: 'buyAirtimeModal' },
      { label: 'Auto-pay', modal: 'autoPaySetupModal' },
    ],
  },
  statCards: [
    { key: 'due', col: 'col-lg-2 col-md-4 col-6', label: 'DUE IN 7 DAYS', labelColor: 'var(--pm-warning)', value: 'KES 38,750', badge: { icon: 'bi-clock', text: '7 payments due', tone: 'badgeW' }, miniBars: [
      { height: '70%', color: 'var(--pm-primary)' }, { height: '45%', color: 'var(--pm-primary)' }, { height: '90%', color: 'var(--pm-primary)' },
      { height: '30%', color: 'var(--pm-info)' }, { height: '55%', color: 'var(--pm-info)' }, { height: '80%', color: 'var(--pm-primary)' }, { height: '40%', color: 'var(--pm-info)' },
    ] },
    { key: 'spend', col: 'col-lg-3 col-md-4 col-6', label: 'MONTHLY UTILITY SPEND', labelColor: 'var(--pm-info)', value: 'KES 67,400', badge: { icon: 'bi-graph-down-arrow', text: '-8.2% vs last month', tone: 'badgeS' }, progress: { label: 'Budget usage', pct: '74%', color: 'var(--pm-info)' } },
    { key: 'savings', col: 'col-lg-3 col-md-4', label: 'SAVINGS THIS MONTH', labelColor: 'var(--pm-accent)', value: 'KES 6,050', badge: { icon: 'bi-piggy-bank', text: 'Smart auto-pay active', tone: 'badgeS' }, accentBorder: true, lines: ['Auto-pay saved: <strong>KES 3,200</strong>', 'Bundle deals: <strong>KES 2,850</strong>'] },
  ],
  attention: [
    { initials: 'EL', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'KPLC bill overdue by 3 days', sub: 'Meter #14825739 · KES 4,850', actionLabel: 'Pay', actionClass: 'btnPmP', modal: 'payElectricityModal' },
    { initials: 'WT', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Water bill due tomorrow', sub: 'NCWSC Acc #290081 · KES 3,200', actionLabel: 'Pay', modal: 'payWaterModal' },
    { initials: 'TV', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'DSTV expires in 2 days', sub: 'Compact Plus · KES 11,500', actionLabel: 'Renew', modal: 'payTVModal' },
    { initials: 'IN', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Zuku Internet low data', sub: '3.2GB remaining · Resets in 8 days', actionLabel: 'Top-up', modal: 'payInternetModal' },
  ],
  suggestions: [
    { initials: 'AP', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Auto-pay 5 recurring bills', sub: 'Save KES 1,200/mo in late fees', actionLabel: 'Setup', modal: 'autoPaySetupModal' },
    { initials: 'BD', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Switch to Faiba 40Mbps plan', sub: 'Save KES 1,500/mo vs current plan', actionLabel: 'Compare', modal: 'serviceComparisonModal' },
    { initials: 'TK', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Buy KPLC tokens in bulk', sub: 'KES 5,000 tokens save 3% on tariff', actionLabel: 'Buy', modal: 'buyTokenModal' },
    { initials: 'GS', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: '13kg gas refill due soon', sub: 'Based on 28-day usage cycle', actionLabel: 'Order', modal: 'orderGasModal' },
  ],
  quickActions: [
    { icon: 'bi-lightning-charge', iconColor: 'var(--pm-warning)', label: 'Electricity', modal: 'payElectricityModal' },
    { icon: 'bi-droplet', iconColor: 'var(--pm-info)', label: 'Water', modal: 'payWaterModal' },
    { icon: 'bi-tv', iconColor: 'var(--pm-purple)', label: 'TV Subscription', modal: 'payTVModal' },
    { icon: 'bi-wifi', iconColor: 'var(--pm-primary)', label: 'Internet', modal: 'payInternetModal' },
    { icon: 'bi-phone', iconColor: 'var(--pm-accent)', label: 'Airtime & Data', modal: 'buyAirtimeModal' },
    { icon: 'bi-fire', iconColor: 'var(--pm-danger)', label: 'Gas / LPG', modal: 'orderGasModal' },
    { icon: 'bi-collection', iconColor: 'var(--pm-ink-soft)', label: 'Bulk Pay', modal: 'bulkPayModal' },
    { icon: 'bi-calendar-event', iconColor: 'var(--pm-primary)', label: 'Schedule', modal: 'schedulePaymentModal' },
  ],
  services: [
    { id: 1, name: 'KPLC Prepaid', icon: 'bi-lightning-charge', color: '#F59E0B', bg: '#FEF3C7', type: 'Electricity', status: 'active', account: '14825739', provider: 'Kenya Power', modal: 'payElectricityModal' },
    { id: 2, name: 'KPLC Postpaid', icon: 'bi-lightning-charge', color: '#F59E0B', bg: '#FEF3C7', type: 'Electricity', status: 'active', account: '22901847', provider: 'Kenya Power', modal: 'payElectricityModal' },
    { id: 3, name: 'Rental Unit A', icon: 'bi-lightning-charge', color: '#F59E0B', bg: '#FEF3C7', type: 'Electricity', status: 'active', account: '33741092', provider: 'Kenya Power', modal: 'payElectricityModal' },
    { id: 4, name: 'Nairobi Water', icon: 'bi-droplet', color: '#3B82F6', bg: '#DBEAFE', type: 'Water', status: 'active', account: '290081', provider: 'NCWSC', modal: 'payWaterModal' },
    { id: 5, name: 'DSTV', icon: 'bi-tv', color: '#8B5CF6', bg: '#EDE9FE', type: 'TV', status: 'active', account: '20491867421', provider: 'MultiChoice', modal: 'payTVModal' },
    { id: 6, name: 'GOtv', icon: 'bi-tv', color: '#8B5CF6', bg: '#EDE9FE', type: 'TV', status: 'active', account: 'GOT-7712', provider: 'MultiChoice', modal: 'payTVModal' },
    { id: 7, name: 'Safaricom Fibre', icon: 'bi-wifi', color: '#4F46E5', bg: '#DBEAFE', type: 'Internet', status: 'active', account: 'SF-40812', provider: 'Safaricom', modal: 'payInternetModal' },
    { id: 8, name: 'Safaricom Line', icon: 'bi-phone', color: '#10B981', bg: '#D1FAE5', type: 'Airtime', status: 'active', account: '0712***890', provider: 'Safaricom', modal: 'buyAirtimeModal' },
    { id: 9, name: 'Airtel Line', icon: 'bi-phone', color: '#10B981', bg: '#D1FAE5', type: 'Airtime', status: 'active', account: '0733***456', provider: 'Airtel', modal: 'buyAirtimeModal' },
    { id: 10, name: 'K-Gas 13kg', icon: 'bi-fire', color: '#EF4444', bg: '#FEE2E2', type: 'Gas', status: 'active', account: 'KG-8821', provider: 'K-Gas', modal: 'orderGasModal' },
    { id: 11, name: 'M-KOPA Solar', icon: 'bi-sun', color: '#F59E0B', bg: '#FEF3C7', type: 'Solar', status: 'paused', account: 'MK-44821', provider: 'M-KOPA', modal: 'solarManageModal' },
    { id: 12, name: 'Zuku Internet', icon: 'bi-wifi', color: '#4F46E5', bg: '#DBEAFE', type: 'Internet', status: 'pending', account: 'ZK-44201', provider: 'Zuku', modal: 'payInternetModal' },
    { id: 13, name: 'Mombasa Water', icon: 'bi-droplet', color: '#3B82F6', bg: '#DBEAFE', type: 'Water', status: 'pending', account: 'MW-9921', provider: 'MOWASSCO', modal: 'payWaterModal' },
    { id: 14, name: 'StarTimes', icon: 'bi-tv', color: '#8B5CF6', bg: '#EDE9FE', type: 'TV', status: 'active', account: 'ST-112903', provider: 'StarTimes', modal: 'payTVModal' },
  ],
  connectedServices: [
    { service: 'Electricity', icon: 'bi-lightning-charge', color: '#F59E0B', bg: '#FEF3C7', provider: 'KPLC Prepaid', account: '14825739', status: 'active', lastPay: '27 Jun 2025', nextDue: '24 Jun (overdue)', amount: 'KES 4,850', autoPay: true, modal: 'payElectricityModal' },
    { service: 'Water', icon: 'bi-droplet', color: '#3B82F6', bg: '#DBEAFE', provider: 'NCWSC', account: '290081', status: 'active', lastPay: '25 Jun 2025', nextDue: '28 Jun 2025', amount: 'KES 3,200', autoPay: false, modal: 'payWaterModal' },
    { service: 'TV', icon: 'bi-tv', color: '#8B5CF6', bg: '#EDE9FE', provider: 'DSTV', account: '20491867421', status: 'active', lastPay: '24 Jun 2025', nextDue: '29 Jun 2025', amount: 'KES 11,500', autoPay: false, modal: 'payTVModal' },
    { service: 'Internet', icon: 'bi-wifi', color: '#4F46E5', bg: '#DBEAFE', provider: 'Safaricom Fibre', account: 'SF-40812', status: 'active', lastPay: '20 Jun 2025', nextDue: '01 Jul 2025', amount: 'KES 5,999', autoPay: true, modal: 'payInternetModal' },
    { service: 'Airtime', icon: 'bi-phone', color: '#10B981', bg: '#D1FAE5', provider: 'Safaricom', account: '0712***890', status: 'active', lastPay: '22 Jun 2025', nextDue: 'Auto', amount: 'KES 1,000', autoPay: true, modal: 'buyAirtimeModal' },
    { service: 'TV', icon: 'bi-tv', color: '#8B5CF6', bg: '#EDE9FE', provider: 'GOtv', account: 'GOT-7712', status: 'active', lastPay: '12 Jun 2025', nextDue: '12 Jul 2025', amount: 'KES 1,650', autoPay: false, modal: 'payTVModal' },
    { service: 'Gas', icon: 'bi-fire', color: '#EF4444', bg: '#FEE2E2', provider: 'K-Gas', account: 'KG-8821', status: 'active', lastPay: '18 Jun 2025', nextDue: '~16 Jul 2025', amount: 'KES 2,850', autoPay: false, modal: 'orderGasModal' },
    { service: 'Solar', icon: 'bi-sun', color: '#F59E0B', bg: '#FEF3C7', provider: 'M-KOPA', account: 'MK-44821', status: 'paused', lastPay: '08 Jun 2025', nextDue: 'Paused', amount: 'KES 150/day', autoPay: false, modal: 'solarManageModal' },
    { service: 'Internet', icon: 'bi-wifi', color: '#4F46E5', bg: '#DBEAFE', provider: 'Zuku', account: 'ZK-44201', status: 'pending', lastPay: '—', nextDue: 'Pending setup', amount: '—', autoPay: false, modal: 'payInternetModal' },
    { service: 'Water', icon: 'bi-droplet', color: '#3B82F6', bg: '#DBEAFE', provider: 'MOWASSCO', account: 'MW-9921', status: 'pending', lastPay: '—', nextDue: 'Pending verify', amount: '—', autoPay: false, modal: 'payWaterModal' },
    { service: 'Electricity', icon: 'bi-lightning-charge', color: '#F59E0B', bg: '#FEF3C7', provider: 'KPLC Postpaid', account: '22901847', status: 'active', lastPay: '15 Jun 2025', nextDue: '15 Jul 2025', amount: 'KES 8,400', autoPay: true, modal: 'payElectricityModal' },
    { service: 'TV', icon: 'bi-tv', color: '#8B5CF6', bg: '#EDE9FE', provider: 'StarTimes', account: 'ST-112903', status: 'active', lastPay: '01 Jun 2025', nextDue: '01 Jul 2025', amount: 'KES 1,349', autoPay: false, modal: 'payTVModal' },
    { service: 'Airtime', icon: 'bi-phone', color: '#10B981', bg: '#D1FAE5', provider: 'Airtel', account: '0733***456', status: 'active', lastPay: '20 Jun 2025', nextDue: 'Auto', amount: 'KES 500', autoPay: true, modal: 'buyAirtimeModal' },
    { service: 'Electricity', icon: 'bi-lightning-charge', color: '#F59E0B', bg: '#FEF3C7', provider: 'KPLC Prepaid', account: '33741092', status: 'active', lastPay: '10 Jun 2025', nextDue: 'On demand', amount: 'KES 2,000', autoPay: false, modal: 'payElectricityModal' },
  ],
  spendByCategory: [
    { label: 'Electric', height: '85%', color: 'var(--pm-warning)', amount: 'KES 18,400' },
    { label: 'Water', height: '50%', color: 'var(--pm-info)', amount: 'KES 6,800' },
    { label: 'TV', height: '70%', color: 'var(--pm-purple)', amount: 'KES 14,500' },
    { label: 'Internet', height: '60%', color: 'var(--pm-primary)', amount: 'KES 8,500' },
    { label: 'Airtime', height: '35%', color: 'var(--pm-accent)', amount: 'KES 5,200' },
    { label: 'Gas', height: '45%', color: 'var(--pm-danger)', amount: 'KES 7,800' },
    { label: 'Solar', height: '25%', color: '#64748B', amount: 'KES 6,200' },
  ],
  budgetTracker: [
    { label: 'Electricity', used: 'KES 18,400', budget: '20,000', pct: '92%', color: 'var(--pm-warning)' },
    { label: 'Water', used: 'KES 6,800', budget: '8,000', pct: '85%', color: 'var(--pm-info)' },
    { label: 'TV & Streaming', used: 'KES 14,500', budget: '15,000', pct: '97%', color: 'var(--pm-danger)' },
    { label: 'Internet', used: 'KES 8,500', budget: '12,000', pct: '71%', color: 'var(--pm-primary)' },
    { label: 'Gas & Energy', used: 'KES 7,800', budget: '10,000', pct: '78%', color: 'var(--pm-accent)' },
  ],
  trend: [
    { month: 'Jan', height: '70%' }, { month: 'Feb', height: '85%' }, { month: 'Mar', height: '75%' },
    { month: 'Apr', height: '90%' }, { month: 'May', height: '65%' }, { month: 'Jun', height: '60%', highlight: true },
  ],
  tips: [
    'Off-peak electricity usage can save up to 15%',
    'Bundle DSTV + Showmax for KES 500 less',
    'Switch to solar for daytime power needs',
  ],
  autoPayRules: [
    { name: 'KPLC Prepaid', rule: 'Top-up KES 2,000 when < 50 units', next: 'Auto', active: true },
    { name: 'NCWSC Water', rule: 'Pay full bill 2 days before due', next: '26 Jul', active: true },
    { name: 'Safaricom Fibre', rule: 'Monthly KES 5,999 on 1st', next: '01 Jul', active: true },
    { name: 'Safaricom Data', rule: 'Auto-renew 12GB monthly', next: '03 Jul', active: true },
    { name: 'Airtel Airtime', rule: 'Weekly KES 200 top-up', next: '04 Jul', active: true },
  ],
  scheduledPayments: [
    { name: 'Safaricom Fibre', date: '01 Jul', amount: 'KES 5,999', color: 'var(--pm-primary)' },
    { name: 'Safaricom Data', date: '03 Jul', amount: 'KES 1,000', color: 'var(--pm-accent)' },
    { name: 'Airtel Top-up', date: '04 Jul', amount: 'KES 200', color: 'var(--pm-accent)' },
    { name: 'GOtv Renewal', date: '12 Jul', amount: 'KES 1,650', color: 'var(--pm-purple)' },
    { name: 'StarTimes', date: '01 Jul', amount: 'KES 1,349', color: 'var(--pm-purple)' },
  ],
  householdMembers: [
    { name: 'Grace Kamau', role: 'Spouse', perm: 'Full Access', initials: 'GK', color: 'var(--pm-gradient-rose)' },
    { name: 'Brian Kamau', role: 'Son', perm: 'View Only', initials: 'BK', color: 'var(--pm-gradient-blue)' },
    { name: 'Mama Nyokabi', role: 'Mother', perm: 'View Only', initials: 'MN', color: 'var(--pm-gradient-violet)' },
  ],
  recentTransactions: [
    { date: '27 Jun 2025', utility: 'Electricity', icon: 'bi-lightning-charge', iconColor: 'var(--pm-warning)', provider: 'KPLC Prepaid', account: '14825739', amount: 'KES 3,000', method: 'M-Pesa', status: 'Success', tone: 'badgeS', modal: 'receiptModal' },
    { date: '25 Jun 2025', utility: 'Water', icon: 'bi-droplet', iconColor: 'var(--pm-info)', provider: 'NCWSC', account: '290081', amount: 'KES 3,200', method: 'PayMo Wallet', status: 'Success', tone: 'badgeS', modal: 'receiptModal' },
    { date: '24 Jun 2025', utility: 'TV', icon: 'bi-tv', iconColor: 'var(--pm-purple)', provider: 'DSTV', account: '20491867421', amount: 'KES 11,500', method: 'M-Pesa', status: 'Success', tone: 'badgeS', modal: 'receiptModal' },
    { date: '22 Jun 2025', utility: 'Airtime', icon: 'bi-phone', iconColor: 'var(--pm-accent)', provider: 'Safaricom', account: '0712***890', amount: 'KES 1,000', method: 'M-Pesa', status: 'Success', tone: 'badgeS', modal: 'receiptModal' },
    { date: '20 Jun 2025', utility: 'Internet', icon: 'bi-wifi', iconColor: 'var(--pm-primary)', provider: 'Safaricom Fibre', account: 'SF-40812', amount: 'KES 5,999', method: 'Bank Transfer', status: 'Pending', tone: 'badgeW', modal: 'disputeModal' },
  ],
};

export async function fetchCommandCenter(): Promise<CommandCenterConfig> {
  try {
    const res = await fetch('/api/utilities-command-center', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as CommandCenterConfig;
  } catch {
    return initialMockData;
  }
}
