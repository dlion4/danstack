/* ============================================================================
 * utilityLayoutData.ts — Paymo BAAS Utility Layout (data + types)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: the Angular dashboard-utility components (typescript + html).
 *   Nav groups, notifications, wallet balance, saved accounts and per-module
 *   marketing blocks extracted here as `initialMockData` so the layout is
 *   backend-ready: GET /api/utility-layout-content returns this exact shape.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
export type ToastTone = 'success' | 'danger' | 'warning' | 'info';
export type AsideKind = 'autoPay' | 'payBill' | 'savedAccounts';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  badge?: string | number;
  opensAside?: AsideKind;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NotificationItem {
  id: number;
  icon: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

export interface SavedAccount {
  name: string;
  provider: string;
  number: string;
}

export interface ModuleStat {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
}

export interface ModuleFeature {
  icon: string;
  text: string;
}

export interface ModuleAction {
  icon: string;
  label: string;
  tone?: 'primary' | 'ghost';
}

export interface ModuleDef {
  key: string;
  label: string;
  icon: string;
  pill: string;
  titlePre: string;
  titleAccent: string;
  copy: string;
  c1: string;
  c2: string;
  stats: ModuleStat[];
  features: ModuleFeature[];
  actions: ModuleAction[];
}

export interface UtilityLayoutContent {
  brand: { name: string; tag: string; initials: string; icon: string };
  user: { name: string; role: string; email: string; initials: string };
  walletBalance: string;
  savedAccounts: SavedAccount[];
  navGroups: NavGroup[];
  notifications: NotificationItem[];
  modules: ModuleDef[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating/hardcoded block from the Angular layout.
 * GET /api/utility-layout-content should return this same shape.
 * ------------------------------------------------------------------------ */
export const initialMockData: UtilityLayoutContent = {
  brand: { name: 'Paymo', tag: 'Util', initials: 'JK', icon: 'bi-lightning-charge' },

  user: {
    name: 'James K.',
    role: 'Account Holder',
    email: 'james@paymo.co',
    initials: 'JK',
  },

  walletBalance: 'KES 124,500',

  savedAccounts: [
    { name: 'Home Meter', provider: 'KPLC', number: '14825739' },
    { name: 'Office Water', provider: 'NCWSC', number: '290081-01' },
    { name: 'Home Internet', provider: 'Safaricom', number: 'SF-40812' },
  ],

  navGroups: [
    {
      title: 'Utility Services',
      items: [
        { key: 'electricity', label: 'Electricity', icon: 'bi-lightning-charge' },
        { key: 'water', label: 'Water Bills', icon: 'bi-droplet' },
        { key: 'tv', label: 'Cable TV', icon: 'bi-tv' },
        { key: 'internet', label: 'Internet / Fiber', icon: 'bi-wifi' },
        { key: 'airtime', label: 'Airtime & Data', icon: 'bi-phone' },
        { key: 'gas', label: 'Gas & Fuel', icon: 'bi-fuel-pump' },
      ],
    },
    {
      title: 'Management',
      items: [
        { key: 'autopay', label: 'Auto-Pay', icon: 'bi-calendar-check', badge: 3 },
        { key: 'history', label: 'History', icon: 'bi-clock-history' },
        { key: 'saved', label: 'Saved Accounts', icon: 'bi-bookmark' },
      ],
    },
    {
      title: 'System',
      items: [
        { key: 'security', label: 'Security', icon: 'bi-shield-check' },
        { key: 'settings', label: 'Settings', icon: 'bi-gear' },
        { key: 'support', label: 'Support', icon: 'bi-life-preserver' },
      ],
    },
  ],

  notifications: [
    { id: 1, icon: 'bi-lightning', tone: 'warning', title: 'Token Generated', desc: 'KPLC Token: 4729-8301-2284-1190', time: '2m', unread: true },
    { id: 2, icon: 'bi-droplet', tone: 'danger', title: 'Water bill due', desc: 'NCWSC account overdue by 3 days.', time: '1h', unread: true },
    { id: 3, icon: 'bi-check2-circle', tone: 'success', title: 'Auto-pay succeeded', desc: 'Safaricom Fiber — KES 5,999', time: '5h', unread: true },
  ],

  modules: [
    {
      key: 'home', label: 'Utility Home', icon: 'bi-lightning-charge-fill', pill: 'UTILITY HOME',
      titlePre: 'Pay every bill ', titleAccent: 'in one place.',
      copy: 'Electricity, water, cable TV, internet, airtime and gas — plus auto-pay, history and saved accounts — unified in one wallet.',
      c1: '#f59e0b', c2: '#d97706',
      stats: [
        { label: 'Active services', value: '6' },
        { label: 'Auto-pay', value: '3' },
        { label: 'Paid (MTD)', value: 'KES 18,400' },
        { label: 'Saved accounts', value: '9' },
      ],
      features: [
        { icon: 'bi-lightning', text: 'Pay any utility bill in seconds' },
        { icon: 'bi-calendar-check', text: 'Schedule and manage auto-pay' },
        { icon: 'bi-clock-history', text: 'Full payment history and tokens' },
        { icon: 'bi-bookmark', text: 'Save accounts for one-tap pay' },
      ],
      actions: [
        { icon: 'bi-lightning', label: 'Pay a bill', tone: 'primary' },
        { icon: 'bi-calendar-check', label: 'Manage auto-pay', tone: 'ghost' },
      ],
    },
    {
      key: 'electricity', label: 'Electricity', icon: 'bi-lightning-charge', pill: 'KPLC',
      titlePre: 'Power up, ', titleAccent: 'instantly.',
      copy: 'Buy KPLC prepaid tokens and pay postpaid bills with instant confirmation.',
      c1: '#f59e0b', c2: '#f97316',
      stats: [
        { label: 'Last token', value: '4729-8301' },
        { label: 'Meter', value: '14825739' },
        { label: 'Spent (MTD)', value: 'KES 6,000' },
        { label: 'Auto-pay', value: 'On' },
      ],
      features: [
        { icon: 'bi-lightning', text: 'Instant prepaid token generation' },
        { icon: 'bi-receipt', text: 'Postpaid bill payments' },
        { icon: 'bi-bookmark', text: 'Save meter numbers' },
        { icon: 'bi-calendar-check', text: 'Monthly auto top-up' },
      ],
      actions: [
        { icon: 'bi-lightning', label: 'Buy token', tone: 'primary' },
        { icon: 'bi-calendar-check', label: 'Auto-pay', tone: 'ghost' },
      ],
    },
    {
      key: 'water', label: 'Water Bills', icon: 'bi-droplet', pill: 'NCWSC',
      titlePre: 'Water bills, ', titleAccent: 'settled.',
      copy: 'Pay NCWSC and county water accounts and track consumption history.',
      c1: '#0ea5e9', c2: '#3b82f6',
      stats: [
        { label: 'Account', value: '290081-01' },
        { label: 'Outstanding', value: 'KES 1,850' },
        { label: 'Paid (MTD)', value: 'KES 2,400' },
        { label: 'Auto-pay', value: 'Off' },
      ],
      features: [
        { icon: 'bi-droplet', text: 'Pay water bills by account number' },
        { icon: 'bi-graph-down', text: 'Consumption and billing history' },
        { icon: 'bi-bell', text: 'Due-date reminders' },
        { icon: 'bi-bookmark', text: 'Save water accounts' },
      ],
      actions: [
        { icon: 'bi-droplet', label: 'Pay bill', tone: 'primary' },
        { icon: 'bi-bell', label: 'Set reminder', tone: 'ghost' },
      ],
    },
    {
      key: 'tv', label: 'Cable TV', icon: 'bi-tv', pill: 'DSTV / GOTV',
      titlePre: 'Never miss ', titleAccent: 'a match.',
      copy: 'Renew DSTV, GOtv and Showmax subscriptions with instant activation.',
      c1: '#8b5cf6', c2: '#6366f1',
      stats: [
        { label: 'Package', value: 'Premium' },
        { label: 'Renewal', value: 'KES 9,500' },
        { label: 'Next due', value: '20 Jul' },
        { label: 'Auto-pay', value: 'On' },
      ],
      features: [
        { icon: 'bi-tv', text: 'DSTV, GOtv and Showmax renewals' },
        { icon: 'bi-lightning', text: 'Instant subscription activation' },
        { icon: 'bi-calendar-check', text: 'Auto-renew before expiry' },
        { icon: 'bi-bookmark', text: 'Save decoder numbers' },
      ],
      actions: [
        { icon: 'bi-tv', label: 'Renew', tone: 'primary' },
        { icon: 'bi-calendar-check', label: 'Auto-renew', tone: 'ghost' },
      ],
    },
    {
      key: 'internet', label: 'Internet / Fiber', icon: 'bi-wifi', pill: 'FIBER',
      titlePre: 'Stay ', titleAccent: 'connected.',
      copy: 'Pay Safaricom, Zuku and Jamii fiber and home internet bundles.',
      c1: '#06b6d4', c2: '#0ea5e9',
      stats: [
        { label: 'Provider', value: 'Safaricom' },
        { label: 'Plan', value: 'KES 5,999' },
        { label: 'Next due', value: '20 Jul' },
        { label: 'Auto-pay', value: 'On' },
      ],
      features: [
        { icon: 'bi-wifi', text: 'Fiber and home internet payments' },
        { icon: 'bi-phone', text: 'Mobile home bundles' },
        { icon: 'bi-calendar-check', text: 'Auto-pay monthly' },
        { icon: 'bi-clock-history', text: 'Bundle and payment history' },
      ],
      actions: [
        { icon: 'bi-wifi', label: 'Pay bundle', tone: 'primary' },
        { icon: 'bi-calendar-check', label: 'Auto-pay', tone: 'ghost' },
      ],
    },
    {
      key: 'airtime', label: 'Airtime & Data', icon: 'bi-phone', pill: 'TELCO',
      titlePre: 'Airtime & data, ', titleAccent: 'on demand.',
      copy: 'Send airtime and data bundles to any number across all networks.',
      c1: '#10b981', c2: '#14b8a6',
      stats: [
        { label: 'Sent (MTD)', value: 'KES 2,200' },
        { label: 'Favourites', value: '4' },
        { label: 'Networks', value: '4' },
        { label: 'Last send', value: '1h' },
      ],
      features: [
        { icon: 'bi-phone', text: 'Airtime to any network' },
        { icon: 'bi-broadcast', text: 'Data bundle packages' },
        { icon: 'bi-people', text: 'Send to contacts and favourites' },
        { icon: 'bi-clock-history', text: 'Airtime and data history' },
      ],
      actions: [
        { icon: 'bi-phone', label: 'Send airtime', tone: 'primary' },
        { icon: 'bi-broadcast', label: 'Buy data', tone: 'ghost' },
      ],
    },
    {
      key: 'gas', label: 'Gas & Fuel', icon: 'bi-fuel-pump', pill: 'FUEL',
      titlePre: 'Gas & fuel, ', titleAccent: 'sorted.',
      copy: 'Pay for cooking gas refills and fuel with saved meters and pumps.',
      c1: '#ef4444', c2: '#f97316',
      stats: [
        { label: 'Last refill', value: 'KES 2,100' },
        { label: 'Saved meters', value: '2' },
        { label: 'Spent (MTD)', value: 'KES 4,200' },
        { label: 'Auto-pay', value: 'Off' },
      ],
      features: [
        { icon: 'bi-fuel-pump', text: 'Cooking gas and fuel payments' },
        { icon: 'bi-bookmark', text: 'Save meter and pump details' },
        { icon: 'bi-receipt', text: 'Refill and receipt history' },
        { icon: 'bi-bell', text: 'Low-balance refill reminders' },
      ],
      actions: [
        { icon: 'bi-fuel-pump', label: 'Pay refill', tone: 'primary' },
        { icon: 'bi-bookmark', label: 'Saved meters', tone: 'ghost' },
      ],
    },
    {
      key: 'autopay', label: 'Auto-Pay', icon: 'bi-calendar-check', pill: 'SCHEDULES',
      titlePre: 'Set it, ', titleAccent: 'forget it.',
      copy: 'Automate recurring utility payments so bills never slip past due.',
      c1: '#14b8a6', c2: '#10b981',
      stats: [
        { label: 'Active', value: '3' },
        { label: 'Next run', value: '15 Jul' },
        { label: 'Monthly total', value: 'KES 18,499' },
        { label: 'Success rate', value: '100%' },
      ],
      features: [
        { icon: 'bi-calendar-check', text: 'Recurring payment schedules' },
        { icon: 'bi-wallet2', text: 'Funded from your Paymo wallet' },
        { icon: 'bi-bell', text: 'Pre-charge and success alerts' },
        { icon: 'bi-clock-history', text: 'Auto-pay execution history' },
      ],
      actions: [
        { icon: 'bi-calendar-check', label: 'Open manager', tone: 'primary' },
        { icon: 'bi-plus-lg', label: 'Add auto-pay', tone: 'ghost' },
      ],
    },
    {
      key: 'history', label: 'History', icon: 'bi-clock-history', pill: 'LEDGER',
      titlePre: 'Every payment, ', titleAccent: 'on record.',
      copy: 'Searchable history of all utility payments, tokens and refunds.',
      c1: '#64748b', c2: '#334155',
      stats: [
        { label: 'Payments (MTD)', value: '14' },
        { label: 'Total (MTD)', value: 'KES 18,400' },
        { label: 'Tokens', value: '3' },
        { label: 'Refunds', value: '0' },
      ],
      features: [
        { icon: 'bi-search', text: 'Filter by service, date or status' },
        { icon: 'bi-receipt', text: 'Download receipts and tokens' },
        { icon: 'bi-tags', text: 'Tag payments for budgeting' },
        { icon: 'bi-download', text: 'Export history to CSV' },
      ],
      actions: [
        { icon: 'bi-funnel', label: 'Filter', tone: 'primary' },
        { icon: 'bi-download', label: 'Export', tone: 'ghost' },
      ],
    },
    {
      key: 'saved', label: 'Saved Accounts', icon: 'bi-bookmark', pill: 'FAVOURITES',
      titlePre: 'One tap to ', titleAccent: 'pay.',
      copy: 'Keep your meters and accounts saved for instant, error-free payments.',
      c1: '#f59e0b', c2: '#d97706',
      stats: [
        { label: 'Saved', value: '9' },
        { label: 'Providers', value: '5' },
        { label: 'Recent', value: '3' },
        { label: 'Shared', value: '0' },
      ],
      features: [
        { icon: 'bi-bookmark', text: 'Save meters and account numbers' },
        { icon: 'bi-lightning', text: 'One-tap pay from saved list' },
        { icon: 'bi-pencil', text: 'Edit nicknames and details' },
        { icon: 'bi-trash', text: 'Remove accounts anytime' },
      ],
      actions: [
        { icon: 'bi-bookmark', label: 'Open list', tone: 'primary' },
        { icon: 'bi-plus-lg', label: 'Add account', tone: 'ghost' },
      ],
    },
    {
      key: 'security', label: 'Security', icon: 'bi-shield-check', pill: 'PROTECT',
      titlePre: 'Payments, ', titleAccent: 'protected.',
      copy: 'PIN, biometrics and limits keep every utility transaction secure.',
      c1: '#10b981', c2: '#059669',
      stats: [
        { label: '2FA', value: 'On' },
        { label: 'Biometrics', value: 'On' },
        { label: 'Pay limit', value: 'KES 50K' },
        { label: 'Alerts', value: 'All' },
      ],
      features: [
        { icon: 'bi-shield-lock', text: 'PIN and biometric confirmation' },
        { icon: 'bi-speedometer', text: 'Per-service payment limits' },
        { icon: 'bi-bell', text: 'Instant payment and token alerts' },
        { icon: 'bi-key', text: 'Device and session management' },
      ],
      actions: [
        { icon: 'bi-shield-check', label: 'Security settings', tone: 'primary' },
        { icon: 'bi-bell', label: 'Alerts', tone: 'ghost' },
      ],
    },
    {
      key: 'settings', label: 'Settings', icon: 'bi-gear', pill: 'PREFS',
      titlePre: 'Make it ', titleAccent: 'yours.',
      copy: 'Default payment method, wallet top-up rules and notification preferences.',
      c1: '#6366f1', c2: '#8b5cf6',
      stats: [
        { label: 'Default pay', value: 'Wallet' },
        { label: 'Auto top-up', value: 'On' },
        { label: 'Currency', value: 'KES' },
        { label: 'Language', value: 'EN' },
      ],
      features: [
        { icon: 'bi-wallet2', text: 'Default funding source' },
        { icon: 'bi-arrow-repeat', text: 'Wallet auto top-up thresholds' },
        { icon: 'bi-bell', text: 'Notification preferences' },
        { icon: 'bi-toggles', text: 'Receipt and token delivery' },
      ],
      actions: [
        { icon: 'bi-check-lg', label: 'Save changes', tone: 'primary' },
        { icon: 'bi-wallet2', label: 'Funding', tone: 'ghost' },
      ],
    },
    {
      key: 'support', label: 'Support', icon: 'bi-life-preserver', pill: 'HELP',
      titlePre: 'Help when ', titleAccent: 'you need it.',
      copy: 'Chat, call or browse FAQs for any utility payment or token issue.',
      c1: '#3b82f6', c2: '#6366f1',
      stats: [
        { label: 'Open tickets', value: '1' },
        { label: 'Avg reply', value: '4m' },
        { label: 'FAQs', value: '60+' },
        { label: 'Resolved', value: '98%' },
      ],
      features: [
        { icon: 'bi-chat-left-text', text: 'Live chat with an agent' },
        { icon: 'bi-telephone', text: 'Call the support hotline' },
        { icon: 'bi-question-circle', text: 'Searchable utility FAQs' },
        { icon: 'bi-ticket', text: 'Raise and track a ticket' },
      ],
      actions: [
        { icon: 'bi-chat-left-text', label: 'Start chat', tone: 'primary' },
        { icon: 'bi-question-circle', label: 'Browse FAQs', tone: 'ghost' },
      ],
    },
  ],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
export async function fetchUtilityLayoutContent(): Promise<UtilityLayoutContent> {
  // Frontend-only demo: no /api backend exists yet. Attempt the real endpoint
  // when it becomes available, but fall back to bundled mock data on any
  // failure so (a) SSR never throws on the origin-less relative fetch and
  // (b) the layout degrades cleanly instead of surfacing an error state.
  try {
    const response = await fetch('/api/utility-layout-content', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Utility layout API responded HTTP ${response.status}`);
    return (await response.json()) as UtilityLayoutContent;
  } catch {
    return initialMockData;
  }
}

/* --------------------------------------------------------------------------
 * Helpers shared across utility layout components.
 * ------------------------------------------------------------------------ */

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export function findModule(content: UtilityLayoutContent, key: string): ModuleDef {
  return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
