/* 3.6 Utility Settings & Automation — backend-ready mock content. */
export type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeNeutral'
export interface FeedItem { icon?: string; iconText?: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
export interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
export interface AutoPayRule { icon: string; iconBg: string; iconColor: string; service: string; amountRule: string; timing: string; sourceTone: BadgeTone; source: string; smart: string; on: boolean }
export interface BudgetRow { label: string; used: string; budget: string; pct: string; color: string }
export interface AlertToggle { label: string; sub: string; on: boolean }
export interface Member { initials: string; gradient: string; name: string; role: string; limit: string; access: string; accessTone?: string; badge?: string; actions: { label: string; modal: string; outline?: boolean }[] }

export interface SettingsConfig {
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string; pageTitle: string; pageSub: string
  heroCards: { key: string; col: string; label: string; labelColor: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone | 'white' }; accent?: boolean; warnBorder?: boolean; progress?: { pct: string; color: string; note: string }; avatars?: { initials: string; gradient: string }[]; lines?: string[]; action?: { label: string; modal: string } }[]
  attention: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  autoPayRules: AutoPayRule[]
  budgets: BudgetRow[]
  alertToggles: AlertToggle[]
  members: Member[]
}

export const initialMockData: SettingsConfig = {
  breadcrumb: { parents: [{ label: 'Home', to: '/utility' }, { label: 'Utilities Hub', to: '/utility' }], current: 'Settings & Automation' },
  pageCode: 'PAGE 3.6', pageTitle: 'Utility Settings & Automation',
  pageSub: 'Configure robust auto-pay frameworks, optimize monthly utility budgets, tune alert preferences, and manage multi-user household access.',
  heroCards: [
    { key: 'auto', col: 'col-lg-3 col-6', label: 'ACTIVE AUTOMATIONS', labelColor: 'rgba(255,255,255,.7)', value: '8 Rules', accent: true, badge: { icon: 'bi-arrow-repeat', text: 'Running smoothly', tone: 'white' }, action: { label: 'Add rule', modal: 'autoPaySetupModal' } },
    { key: 'budget', col: 'col-lg-3 col-6', label: 'TOTAL UTILITY BUDGET', labelColor: 'var(--pm-info)', value: 'KES 48k', badge: { icon: 'bi-piggy-bank', text: 'KES 4,500 under limit', tone: 'badgeI' }, progress: { pct: '78%', color: 'var(--pm-info)', note: '78% utilized this month' } },
    { key: 'members', col: 'col-lg-3 col-6', label: 'HOUSEHOLD MEMBERS', labelColor: 'var(--pm-purple)', value: '4 Users', avatars: [{ initials: 'JK', gradient: 'var(--pm-gradient-hero)' }, { initials: 'GK', gradient: 'var(--pm-gradient-rose)' }, { initials: 'BK', gradient: 'var(--pm-gradient-blue)' }, { initials: '+1', gradient: 'var(--pm-gradient-slate)' }], action: { label: 'Manage', modal: 'addMemberModal' } },
    { key: 'alerts', col: 'col-lg-3 col-6', label: 'ALERTS TRIGGERED', labelColor: 'var(--pm-warning)', value: '12', warnBorder: true, badge: { icon: 'bi-bell', text: 'Last 7 days', tone: 'badgeW' }, lines: ['<i class="bi bi-envelope text-muted"></i> 5 Due Reminders', '<i class="bi bi-exclamation-triangle text-muted"></i> 2 Low Balances'] },
  ],
  attention: [
    { iconText: 'AP', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Pending payment approval', sub: 'Brian (Child) requested KES 500', actionLabel: 'Review', actionClass: 'btnPmP', modal: 'approvalRequestModal' },
    { iconText: 'FA', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Auto-pay failed (Card expired)', sub: 'Zuku Internet · KES 5,500', actionLabel: 'Fix', modal: 'failureHandlingModal' },
    { iconText: 'SM', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Unused budget detected', sub: 'Rollover KES 4,500 to savings?', actionLabel: 'Setup', modal: 'rolloverSettingsModal' },
  ],
  suggestions: [
    { iconText: 'SW', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Run Budget Wizard', sub: 'Align limits to 3-month avg spend', actionLabel: 'Run', modal: 'budgetWizardModal' },
    { iconText: 'SP', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Enable Smart Auto-Pay', sub: 'Prevent bill shock on variable utilities', actionLabel: 'Enable', modal: 'smartAutoPayModal' },
    { iconText: 'OS', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Block overspend payments', sub: 'Enforce strict household budget caps', actionLabel: 'Apply', modal: 'overspendPreventionModal' },
  ],
  quickActions: [
    { icon: 'bi-arrow-repeat', iconColor: 'var(--pm-primary)', label: 'New Rule', modal: 'autoPaySetupModal' },
    { icon: 'bi-person-plus', iconColor: 'var(--pm-accent)', label: 'Add Member', modal: 'addMemberModal' },
    { icon: 'bi-sort-numeric-down', iconColor: 'var(--pm-info)', label: 'Priorities', modal: 'paymentSourcePriorityModal' },
    { icon: 'bi-bell', iconColor: 'var(--pm-warning)', label: 'Alert Prefs', modal: 'alertSettingsModal' },
    { icon: 'bi-pie-chart', iconColor: 'var(--pm-purple)', label: 'Split Bills', modal: 'splitBillModal' },
    { icon: 'bi-person-badge', iconColor: 'var(--pm-danger)', label: 'Child Acct', modal: 'childAccountModal' },
    { icon: 'bi-person-heart', iconColor: 'var(--pm-accent)', label: 'Elder Acct', modal: 'elderlyParentModal' },
    { icon: 'bi-shield-check', iconColor: 'var(--pm-ink-soft)', label: 'System Check', modal: 'healthCheckModal' },
  ],
  autoPayRules: [
    { icon: 'bi-lightning-charge', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', service: 'KPLC Prepaid', amountRule: 'KES 2,000 top-up', timing: 'When balance < 20 units', sourceTone: 'badgeI', source: 'M-Pesa (Primary)', smart: 'None', on: true },
    { icon: 'bi-tv', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', service: 'DSTV Compact+', amountRule: 'Full exact bill (KES 11,500)', timing: '2 days before due date', sourceTone: 'badgeI', source: 'Wallet (Primary)', smart: 'Block if > KES 12K', on: true },
    { icon: 'bi-droplet', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', service: 'NCWSC Water', amountRule: 'Fetch dynamic bill', timing: 'On due date', sourceTone: 'badgeI', source: 'Bank (Primary)', smart: 'Requires approval if > 15% avg', on: true },
    { icon: 'bi-phone', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', service: 'Safaricom Data', amountRule: 'KES 1,000 fixed', timing: '1st of every month', sourceTone: 'badgeI', source: 'M-Pesa (Primary)', smart: 'None', on: true },
  ],
  budgets: [
    { label: 'Electricity', used: 'KES 18,400', budget: '20,000', pct: '92%', color: 'var(--pm-warning)' },
    { label: 'Water', used: 'KES 6,800', budget: '8,000', pct: '85%', color: 'var(--pm-info)' },
    { label: 'TV & Streaming', used: 'KES 14,500', budget: '15,000', pct: '97%', color: 'var(--pm-purple)' },
    { label: 'Internet', used: 'KES 8,500', budget: '12,000', pct: '71%', color: 'var(--pm-primary)' },
  ],
  alertToggles: [
    { label: 'Due Date Reminders', sub: '7 days, 3 days, and 1 day before due', on: true },
    { label: 'Low Balance Warnings', sub: 'When prepaid units drop below safety threshold', on: true },
    { label: 'Unusual Usage Detection', sub: 'Spikes greater than 20% vs average', on: true },
    { label: 'Provider Price/Tariff Changes', sub: 'Get notified when providers adjust rates', on: false },
    { label: 'Service Outages & Maintenance', sub: 'KPLC / NCWSC local outage bulletins', on: true },
  ],
  members: [
    { initials: 'JK', gradient: 'var(--pm-gradient-hero)', name: 'James Kamau', role: 'Full Ownership', limit: 'Unlimited', access: 'All 14 Utilities', badge: 'Primary Admin', actions: [{ label: 'Activity', modal: 'memberActivityLogModal' }] },
    { initials: 'GK', gradient: 'var(--pm-gradient-rose)', name: 'Grace Kamau', role: 'Spouse (Co-Payer)', limit: 'KES 30,000 / mo', access: '12 Utilities', actions: [{ label: 'Manage', modal: 'editMemberModal' }, { label: 'Split Bill', modal: 'splitBillModal' }] },
    { initials: 'BK', gradient: 'var(--pm-gradient-blue)', name: 'Brian Kamau', role: 'Child Account', limit: 'KES 2,000 / mo', access: 'Req. > KES 500', accessTone: 'text-warning', actions: [{ label: 'Controls', modal: 'childAccountModal' }, { label: 'Suspend', modal: 'suspendMemberModal', outline: true }] },
    { initials: 'MN', gradient: 'var(--pm-gradient-violet)', name: 'Mama Nyokabi', role: 'Elderly Parent', limit: 'None (View Only)', access: 'Active (Home Meter)', accessTone: 'text-success', actions: [{ label: 'Remote Config', modal: 'elderlyParentModal' }] },
  ],
}

export async function fetchSettingsAutomation(): Promise<SettingsConfig> {
  try {
    const res = await fetch('/api/settings-automation', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as SettingsConfig
  } catch { return initialMockData }
}
