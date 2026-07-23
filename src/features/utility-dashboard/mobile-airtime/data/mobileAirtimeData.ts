/* 3.5 Mobile Money & Airtime Hub — backend-ready mock content. */
export type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'
export interface FeedItem { iconText: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
export interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
export interface LineRow { phone: string; isDefault?: boolean; network: string; networkColor: string; airtime: string; data: string; voice: string; autoRenewTone: BadgeTone; autoRenew: string; topupModal: string }
export interface InteropRow { icon: string; bg: string; color: string; title: string; sub: string; tone: BadgeTone; fee: string }
export interface SuiteCard { icon: string; bg: string; color: string; title: string; sub: string; value: string; valueColor?: string; meta: string; actionLabel: string; actionClass?: string; modal: string }
export interface TxnRow { date: string; type: string; details: string; amount: string; amountColor: string; network: string; tone: BadgeTone; status: string }

export interface MobileAirtimeConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string; pageTitle: string; pageSub: string
  hero: { balance: string; received: string; sent: string }
  statCards: { key: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; accentBorder?: string; lines?: { l: string; v: string }[]; progress?: { label: string; left: string; pct: string; color: string } }[]
  attention: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  lines: LineRow[]
  interop: InteropRow[]
  agents: { name: string; sub: string; dist: string; tone: BadgeTone; badge: string }[]
  suite: SuiteCard[]
  transactions: TxnRow[]
}

export const initialMockData: MobileAirtimeConfig = {
  breadcrumb: { parents: [{ label: 'Home', to: '/utility' }, { label: 'Utilities Hub', to: '/utility' }], current: 'Mobile Money & Airtime' },
  pageCode: 'PAGE 3.5', pageTitle: 'Mobile Money & Airtime Hub',
  pageSub: 'Unified management for your Safaricom, Airtel, and Telkom lines. Deep integration with M-Pesa ecosystem, interoperability transfers, and smart data bundles.',
  hero: { balance: 'KES 48,250', received: 'KES 12,400', sent: 'KES 3,200' },
  statCards: [
    { key: 'airtime', label: 'TOTAL AIRTIME (ALL NETWORKS)', labelColor: 'var(--pm-accent)', value: 'KES 1,480', badge: { icon: 'bi-sim', text: '3 Lines Linked', tone: 'badgeS' }, lines: [{ l: 'Safaricom', v: 'KES 1,200' }, { l: 'Airtel', v: 'KES 250' }, { l: 'Telkom', v: 'KES 30' }] },
    { key: 'data', label: 'ACTIVE DATA BUNDLES', labelColor: 'var(--pm-info)', value: '14.2 GB', badge: { icon: 'bi-clock', text: '2.5 GB expiring in 2 days', tone: 'badgeW' }, progress: { label: 'Monthly Usage', left: '14.2 / 20 GB', pct: '71%', color: 'var(--pm-info)' } },
    { key: 'fuliza', label: 'FULIZA LIMIT AVAILABLE', labelColor: 'var(--pm-purple)', value: 'KES 14,000', badge: { icon: 'bi-exclamation-circle', text: 'KES 6,000 Used', tone: 'badgeD' }, accentBorder: 'var(--pm-purple)', lines: [{ l: 'Total Limit', v: 'KES 20,000' }, { l: 'Daily Fee Accruing', v: 'KES 14.00' }] },
  ],
  attention: [
    { iconText: 'FZ', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Fuliza outstanding balance', sub: 'KES 6,000 utilized · Day 4 of 30', actionLabel: 'Repay', actionClass: 'btnPmD', modal: 'fulizaManagementModal' },
    { iconText: 'DT', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Data bundle expiring soon', sub: '2.5GB Safaricom expires in 48 hrs', actionLabel: 'Renew', modal: 'buyDataModal' },
    { iconText: 'MS', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'M-Shwari savings goal off-track', sub: 'Deposit KES 2,000 to meet June target', actionLabel: 'Save', modal: 'mShwariModal' },
    { iconText: 'BP', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: '4,200 Bonga Points available', sub: 'Redeem for 500 Minutes or Data', actionLabel: 'Redeem', modal: 'bongaPointsModal' },
  ],
  suggestions: [
    { iconText: 'TN', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Tunukiwa Offer Available Now!', sub: '1GB for 1 hour @ KES 20 (Save 80%)', actionLabel: 'Claim', modal: 'tunukiwaOffersModal' },
    { iconText: 'AR', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Enable auto-renew for 12GB plan', sub: 'Avoid running out of data mid-meeting', actionLabel: 'Setup', modal: 'airtimeAutoRenewModal' },
    { iconText: 'IO', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Send to Airtel for free via PayMo', sub: 'Save KES 50 on interoperability fees', actionLabel: 'Send', modal: 'sendMoneyCrossNetworkModal' },
    { iconText: 'MI', iconBg: 'var(--pm-primary-light)', iconColor: '#fff', title: 'Move idle funds to Mali', sub: 'Earn 9% p.a. daily interest on KES 20,000', actionLabel: 'Invest', modal: 'maliInvestmentModal' },
  ],
  quickActions: [
    { icon: 'bi-phone', iconColor: 'var(--pm-accent)', label: 'Buy Airtime', modal: 'buyAirtimeModal' },
    { icon: 'bi-wifi', iconColor: 'var(--pm-primary)', label: 'Buy Data', modal: 'buyDataModal' },
    { icon: 'bi-send', iconColor: 'var(--pm-info)', label: 'Send Money', modal: 'sendMoneyCrossNetworkModal' },
    { icon: 'bi-bank', iconColor: 'var(--pm-warning)', label: 'KCB M-Pesa', modal: 'kcbMpesaModal' },
    { icon: 'bi-briefcase', iconColor: 'var(--pm-purple)', label: 'Pochi', modal: 'pochiLaBiasharaModal' },
    { icon: 'bi-globe', iconColor: 'var(--pm-muted)', label: 'Global Tx', modal: 'mPesaGlobalModal' },
    { icon: 'bi-shop', iconColor: 'var(--pm-danger)', label: 'Airtime Resale', modal: 'airtimeResaleModal' },
    { icon: 'bi-geo-alt', iconColor: 'var(--pm-primary)', label: 'Find Agent', modal: 'agentLocatorModal' },
  ],
  lines: [
    { phone: '0712 345 890', isDefault: true, network: 'Safaricom', networkColor: '#047857', airtime: 'KES 1,200.00', data: '11.7 GB (30 Days)', voice: '500 Min, 1000 SMS', autoRenewTone: 'badgeS', autoRenew: 'On (12GB)', topupModal: 'buyDataModal' },
    { phone: '0733 987 456', network: 'Airtel', networkColor: '#DC2626', airtime: 'KES 250.00', data: '2.5 GB (Exp. 2 Days)', voice: '100 Min', autoRenewTone: 'badgeI', autoRenew: 'Alert Only', topupModal: 'buyDataModal' },
    { phone: '0777 112 233', network: 'Telkom', networkColor: '#3B82F6', airtime: 'KES 30.00', data: '0 MB', voice: '0 Min', autoRenewTone: 'badgeNeutral', autoRenew: 'Off', topupModal: 'buyAirtimeModal' },
  ],
  interop: [
    { icon: 'bi-phone', bg: 'var(--pm-accent-soft)', color: '#047857', title: 'M-Pesa to Airtel Money', sub: 'Real-time · Up to KES 250K', tone: 'badgeS', fee: '0% PayMo Fee' },
    { icon: 'bi-phone', bg: 'var(--pm-info-soft)', color: '#1D4ED8', title: 'M-Pesa to T-Kash', sub: 'Real-time · Up to KES 250K', tone: 'badgeS', fee: '0% PayMo Fee' },
    { icon: 'bi-bank', bg: 'var(--pm-warning-soft)', color: '#B45309', title: 'Mobile to PesaLink (Bank)', sub: 'Real-time to 50+ banks', tone: 'badgeW', fee: 'Standard Bank Fees' },
  ],
  agents: [
    { name: 'Quickmart Agent — Kilimani', sub: 'Cash in/out · Float KES 80K', dist: '350 m', tone: 'badgeS', badge: 'Open' },
    { name: 'Naivas Till — Valley Arc', sub: 'Cash in/out · PesaLink', dist: '1.2 km', tone: 'badgeS', badge: 'Open' },
    { name: 'M-Pesa Kiosk — Ngong Rd', sub: 'Full services · Bulk float', dist: '2.0 km', tone: 'badgeW', badge: 'Busy' },
  ],
  suite: [
    { icon: 'bi-arrow-repeat', bg: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', title: 'Fuliza Management', sub: 'Overdraft limit & repayment', value: '-KES 6,000', valueColor: 'var(--pm-danger)', meta: 'Limit: KES 20,000', actionLabel: 'Repay & Manage', actionClass: 'btnPmD', modal: 'fulizaManagementModal' },
    { icon: 'bi-piggy-bank', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)', title: 'M-Shwari', sub: 'Savings & Loan status', value: 'KES 12,450', valueColor: 'var(--pm-info)', meta: 'Loan Limit: KES 8,000', actionLabel: 'Save or Borrow', modal: 'mShwariModal' },
    { icon: 'bi-briefcase', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', title: 'Pochi La Biashara', sub: 'Business wallet separation', value: 'KES 45,900', valueColor: 'var(--pm-accent)', meta: 'Received today: KES 8,500', actionLabel: 'View Pochi', actionClass: 'btnPmA', modal: 'pochiLaBiasharaModal' },
    { icon: 'bi-bank', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', title: 'KCB M-Pesa', sub: 'Bank account integration', value: 'KES 0.00', meta: 'Target Savings: Active', actionLabel: 'Open Account', modal: 'kcbMpesaModal' },
    { icon: 'bi-graph-up-arrow', bg: 'var(--pm-primary-light)', color: '#fff', title: 'Mali Investment', sub: 'Unit trust / Money market', value: 'KES 102,500', valueColor: 'var(--pm-primary)', meta: 'Earned YTD: KES 4,120 (9.2% p.a)', actionLabel: 'Invest More', modal: 'maliInvestmentModal' },
    { icon: 'bi-globe', bg: 'var(--pm-gradient-slate)', color: '#fff', title: 'M-Pesa Global', sub: 'International remittance', value: '3 Transfers', meta: 'This month to UG/TZ', actionLabel: 'Send Global', modal: 'mPesaGlobalModal' },
  ],
  transactions: [
    { date: '27 Jun 2025', type: 'Send Money', details: 'To: John Doe (Airtel)', amount: '-KES 1,500', amountColor: 'var(--pm-danger)', network: 'M-Pesa', tone: 'badgeS', status: 'Completed' },
    { date: '27 Jun 2025', type: 'Buy Data', details: '12GB Monthly Bundle', amount: '-KES 1,000', amountColor: 'var(--pm-danger)', network: 'Safaricom', tone: 'badgeS', status: 'Active' },
    { date: '26 Jun 2025', type: 'Pochi Payment', details: 'From: Jane Smith', amount: '+KES 4,500', amountColor: 'var(--pm-accent)', network: 'M-Pesa Pochi', tone: 'badgeS', status: 'Received' },
    { date: '26 Jun 2025', type: 'Buy Airtime', details: '0712 345 890', amount: '-KES 250', amountColor: 'var(--pm-danger)', network: 'Safaricom', tone: 'badgeS', status: 'Completed' },
    { date: '25 Jun 2025', type: 'Fuliza Repay', details: 'Overdraft repayment', amount: '-KES 2,000', amountColor: 'var(--pm-danger)', network: 'M-Pesa', tone: 'badgeS', status: 'Completed' },
  ],
}

export async function fetchMobileAirtimeHub(): Promise<MobileAirtimeConfig> {
  try {
    await new Promise((r) => setTimeout(r, 120))
    return initialMockData
  } catch {
    return initialMockData
  }
}
