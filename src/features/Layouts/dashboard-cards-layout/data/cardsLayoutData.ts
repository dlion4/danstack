/* ============================================================================
 * cardsLayoutData.ts — Paymo BAAS Cards Layout (data + types)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-layout/*.ts + *.html
 *   Hardcoded nav groups, notifications, aside panel data extracted here as
 *   `initialMockData` so the layout is backend-ready:
 *   GET /api/cards-layout-content returns this exact shape.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
export type ToastTone = 'success' | 'danger' | 'warning' | 'info';
export type AsideKind = 'security' | 'limits' | 'cardProgram';

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

export interface AccountItem {
  id: string;
  name: string;
  role: string;
  primary?: boolean;
}

export interface SessionRow {
  device: string;
  meta: string;
  status: 'active' | 'warning';
  statusText: string;
}

export interface ApiHealthRow {
  service: string;
  status: 'active' | 'warning';
  statusText: string;
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

export interface CardsLayoutContent {
  brand: { name: string; tag: string; initials: string; icon: string };
  user: { name: string; role: string; email: string; initials: string };
  navGroups: NavGroup[];
  notifications: NotificationItem[];
  accounts: AccountItem[];
  security: { twoFactorOn: boolean; sessions: SessionRow[] };
  developers: { sandboxOn: boolean; health: ApiHealthRow[] };
  modules: ModuleDef[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating/hardcoded block from Angular layout.
 * GET /api/cards-layout-content should return this same shape.
 * ------------------------------------------------------------------------ */
export const initialMockData: CardsLayoutContent = {
  brand: { name: 'Paymo', tag: 'Cards', initials: 'PM', icon: 'bi-credit-card-2-front' },

  user: {
    name: 'James K.',
    role: 'Card Admin',
    email: 'james@paymo.co',
    initials: 'JK',
  },

  navGroups: [
    {
      title: 'Cards',
      items: [
        { key: 'card-overview', label: 'Card Overview', icon: 'bi-speedometer2' },
        { key: 'virtual-debit-cards', label: 'Virtual Debit', icon: 'bi-credit-card' },
        { key: 'virtual-credit-cards', label: 'Virtual Credit', icon: 'bi-credit-card-2-front' },
        { key: 'physical-debit-cards', label: 'Physical Debit', icon: 'bi-credit-card-2-front-fill' },
        { key: 'prepaid-card-management', label: 'Prepaid Cards', icon: 'bi-wallet2' },
        { key: 'corporate-business-cards', label: 'Corporate Business', icon: 'bi-building' },
        { key: 'card-command-center', label: 'Command Center', icon: 'bi-cpu' },
        { key: 'card-program-administration', label: 'Program Admin', icon: 'bi-shield-check' },
        { key: 'card-analytics-reporting', label: 'Analytics & Reporting', icon: 'bi-bar-chart-line' },
        { key: 'card-security-fraud-prevention', label: 'Fraud Prevention', icon: 'bi-shield-lock' },
        { key: 'account-settings', label: 'Account & Settings', icon: 'bi-gear' },
        { key: 'support', label: 'Support', icon: 'bi-headset' },
      ],
    },
    {
      title: 'Account',
      items: [
        { key: 'settings', label: 'Settings', icon: 'bi-gear' },
        { key: 'logout', label: 'Logout', icon: 'bi-box-arrow-right' },
      ],
    },
  ],

  notifications: [
    { id: 1, icon: 'bi-credit-card', tone: 'primary', title: 'New card issued', desc: 'Virtual card for John Doe', time: '5m', unread: true },
    { id: 2, icon: 'bi-currency-dollar', tone: 'success', title: 'Settlement received', desc: 'KES 2.84M settled to operating wallet.', time: '15m', unread: true },
    { id: 3, icon: 'bi-shield-check', tone: 'warning', title: 'New login from Safari', desc: 'If this was not you, review sessions.', time: '1h', unread: true },
    { id: 4, icon: 'bi-arrow-left-right', tone: 'danger', title: 'Payment declined', desc: '12 transactions need retry.', time: '3h', unread: false },
  ],

  accounts: [
    { id: 'ACC-8X29-KL4', name: 'Operating Account', role: 'Primary', primary: true },
    { id: 'ACC-2P91-MNQ', name: 'Developer Sandbox', role: 'Test' },
    { id: 'ACC-7L44-XYZ', name: 'Treasury Reserve', role: 'Restricted' },
  ],

  security: {
    twoFactorOn: true,
    sessions: [
      { device: 'Chrome · Windows', meta: 'Nairobi, KE', status: 'active', statusText: 'Now' },
      { device: 'Safari · iPhone', meta: 'Mombasa, KE', status: 'active', statusText: 'Now' },
      { device: 'Firefox · macOS', meta: 'New York, US', status: 'warning', statusText: '2h ago' },
    ],
  },

  developers: {
    sandboxOn: false,
    health: [
      { service: 'Cards API', status: 'active', statusText: 'Operational' },
      { service: 'Webhooks', status: 'warning', statusText: 'Degraded' },
      { service: 'Settlement API', status: 'active', statusText: 'Operational' },
    ],
  },

  // Module marketing blocks are currently disabled (commented out below).
  // Kept as an empty array so the required `modules` field stays satisfied
  // and consumers using .find()/.filter() don't crash at runtime.
  modules: [],

  // modules: [
  //   {
  //     key: 'card-overview',
  //     label: 'Card Overview',
  //     icon: 'bi-speedometer2',
  //     pill: 'OPERATING OVERVIEW',
  //     titlePre: 'Your cards, ',
  //     titleAccent: 'at a glance.',
  //     copy: 'All cards, spend, limits and live risk signals unified into one real-time view.',
  //     c1: '#2ee6a0',
  //     c2: '#7cf5c8',
  //     stats: [
  //       { label: 'Active cards', value: '14' },
  //       { label: 'Spend (30d)', value: 'KES 96K' },
  //       { label: 'Blocked', value: '2' },
  //       { label: 'Auth rate', value: '98.1%' },
  //     ],
  //     features: [
  //       { icon: 'bi-lightning-charge', text: 'Real-time card monitoring across all networks' },
  //       { icon: 'bi-shield-check', text: 'Live fraud and compliance signals on every transaction' },
  //       { icon: 'bi-cash-coin', text: 'Multi-currency settlement with T+0 liquidity windows' },
  //       { icon: 'bi-bell', text: 'Threshold alerts the moment a transaction lands' },
  //     ],
  //     actions: [
  //       { icon: 'bi-plus-lg', label: 'Issue card', tone: 'primary' },
  //       { icon: 'bi-download', label: 'Export statement', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'virtual-debit-cards',
  //     label: 'Virtual Debit',
  //     icon: 'bi-credit-card',
  //     pill: 'DEBIT',
  //     titlePre: 'Debit cards, ',
  //     titleAccent: 'instant.',
  //     copy: 'Provision virtual debit cards with spend limits and instant freeze controls.',
  //     c1: '#60a5fa',
  //     c2: '#2ee6a0',
  //     stats: [
  //       { label: 'Active', value: '8' },
  //       { label: 'Spend (30d)', value: 'KES 45K' },
  //       { label: 'Blocked', value: '1' },
  //       { label: 'Auth rate', value: '97.5%' },
  //     ],
  //     features: [
  //       { icon: 'bi-credit-card-2-back', text: 'Single-use and reusable virtual debit cards' },
  //       { icon: 'bi-slash-circle', text: 'Merchant category and country locks' },
  //       { icon: 'bi-snow', text: 'Instant freeze and unfreeze per card' },
  //       { icon: 'bi-bell', text: 'Real-time authorization and decline alerts' },
  //     ],
  //     actions: [
  //       { icon: 'bi-plus-lg', label: 'Issue card', tone: 'primary' },
  //       { icon: 'bi-gear', label: 'Card policies', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'virtual-credit-cards',
  //     label: 'Virtual Credit',
  //     icon: 'bi-credit-card-2-front',
  //     pill: 'CREDIT',
  //     titlePre: 'Credit cards, ',
  //     titleAccent: 'in seconds.',
  //     copy: 'Provision virtual credit cards with configurable limits and controls.',
  //     c1: '#fb7185',
  //     c2: '#a78bfa',
  //     stats: [
  //       { label: 'Active', value: '6' },
  //       { label: 'Spend (30d)', value: 'KES 51K' },
  //       { label: 'Blocked', value: '1' },
  //       { label: 'Auth rate', value: '98.7%' },
  //     ],
  //     features: [
  //       { icon: 'bi-credit-card-2-front', text: 'Virtual credit with revolving balance' },
  //       { icon: 'bi-slash-circle', text: 'Merchant locks and spend controls' },
  //       { icon: 'bi-snow', text: 'Instant freeze per card' },
  //       { icon: 'bi-bell', text: 'Authorization alerts' },
  //     ],
  //     actions: [
  //       { icon: 'bi-plus-lg', label: 'Issue card', tone: 'primary' },
  //       { icon: 'bi-gear', label: 'Card policies', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'card-command-center',
  //     label: 'Command Center',
  //     icon: 'bi-cpu',
  //     pill: 'OPERATIONS',
  //     titlePre: 'Command, ',
  //     titleAccent: 'center stage.',
  //     copy: 'Monitor all card operations, health and incidents from one pane.',
  //     c1: '#a78bfa',
  //     c2: '#2ee6a0',
  //     stats: [
  //       { label: 'Cards online', value: '13 / 14' },
  //       { label: 'Incidents', value: '0' },
  //       { label: 'Latency', value: '42ms' },
  //       { label: 'Uptime', value: '99.98%' },
  //     ],
  //     features: [
  //       { icon: 'bi-cpu', text: 'Unified card operations dashboard' },
  //       { icon: 'bi-shield-check', text: 'Real-time fraud monitoring' },
  //       { icon: 'bi-graph-up-arrow', text: 'Performance and latency analytics' },
  //       { icon: 'bi-bell', text: 'Instant incident alerts' },
  //     ],
  //     actions: [
  //       { icon: 'bi-arrow-clockwise', label: 'Refresh status', tone: 'primary' },
  //       { icon: 'bi-download', label: 'Export ops log', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'issuance',
  //     label: 'Issuance',
  //     icon: 'bi-plus-lg',
  //     pill: 'PROVISIONING',
  //     titlePre: 'Issue cards, ',
  //     titleAccent: 'at scale.',
  //     copy: 'Bulk and single card provisioning with configurable limits and controls.',
  //     c1: '#22c55e',
  //     c2: '#2ee6a0',
  //     stats: [
  //       { label: 'Issued today', value: '24' },
  //       { label: 'Pending', value: '3' },
  //       { label: 'This week', value: '142' },
  //       { label: 'Avg time', value: '2.1s' },
  //     ],
  //     features: [
  //       { icon: 'bi-plus-lg', text: 'Single and bulk card issuance' },
  //       { icon: 'bi-sliders', text: 'Configurable spend and velocity limits' },
  //       { icon: 'bi-shield-check', text: 'KYC and compliance checks before issue' },
  //       { icon: 'bi-bell', text: 'Issuance confirmation and alerts' },
  //     ],
  //     actions: [
  //       { icon: 'bi-plus-lg', label: 'Issue card', tone: 'primary' },
  //       { icon: 'bi-upload', label: 'Bulk upload', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'limits-controls',
  //     label: 'Limits & Controls',
  //     icon: 'bi-sliders',
  //     pill: 'RISK MANAGEMENT',
  //     titlePre: 'Control spend, ',
  //     titleAccent: 'precisely.',
  //     copy: 'Set and adjust per-card limits, locks and spending controls.',
  //     c1: '#fbbf24',
  //     c2: '#2ee6a0',
  //     stats: [
  //       { label: 'Cards with limits', value: '14' },
  //       { label: 'Avg daily limit', value: 'KES 50K' },
  //       { label: 'Locked cards', value: '2' },
  //       { label: 'Exceptions', value: '1' },
  //     ],
  //     features: [
  //       { icon: 'bi-sliders', text: 'Per-card daily, weekly and monthly limits' },
  //       { icon: 'bi-slash-circle', text: 'Merchant category and country locks' },
  //       { icon: 'bi-snow', text: 'Instant freeze and unfreeze' },
  //       { icon: 'bi-shield-check', text: 'Velocity and fraud rule overrides' },
  //     ],
  //     actions: [
  //       { icon: 'bi-sliders', label: 'Adjust limits', tone: 'primary' },
  //       { icon: 'bi-snow', label: 'Freeze all', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'card-program',
  //     label: 'Card Program',
  //     icon: 'bi-gear',
  //     pill: 'CONFIGURATION',
  //     titlePre: 'Program settings, ',
  //     titleAccent: 'your way.',
  //     copy: 'Configure card program branding, issuer settings and preferences.',
  //     c1: '#7cf5c8',
  //     c2: '#2ee6a0',
  //     stats: [
  //       { label: 'Program', value: 'Paymo Platinum' },
  //       { label: 'Issuer', value: 'Visa' },
  //       { label: 'Cards issued', value: '1,240' },
  //       { label: 'Status', value: 'Active' },
  //     ],
  //     features: [
  //       { icon: 'bi-palette', text: 'Custom card branding and colors' },
  //       { icon: 'bi-gear', text: 'Issuer and network configuration' },
  //       { icon: 'bi-sliders', text: 'Program-wide limit templates' },
  //       { icon: 'bi-bell', text: 'Program notification preferences' },
  //     ],
  //     actions: [
  //       { icon: 'bi-check-lg', label: 'Save changes', tone: 'primary' },
  //       { icon: 'bi-arrow-counterclockwise', label: 'Reset', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'card-transactions',
  //     label: 'Card Transactions',
  //     icon: 'bi-arrow-left-right',
  //     pill: 'LEDGER',
  //     titlePre: 'Every swipe, ',
  //     titleAccent: 'tracked.',
  //     copy: 'Complete transaction history for all cards with search and filters.',
  //     c1: '#60a5fa',
  //     c2: '#2ee6a0',
  //     stats: [
  //       { label: 'Today', value: 'KES 18.4K' },
  //       { label: 'This week', value: 'KES 124K' },
  //       { label: 'Pending', value: '3' },
  //       { label: 'Declined', value: '2' },
  //     ],
  //     features: [
  //       { icon: 'bi-arrow-left-right', text: 'Full transaction history per card' },
  //       { icon: 'bi-search', text: 'Search by amount, merchant or date' },
  //       { icon: 'bi-download', text: 'Export CSV and PDF statements' },
  //       { icon: 'bi-bell', text: 'Transaction alerts and notifications' },
  //     ],
  //     actions: [
  //       { icon: 'bi-download', label: 'Export', tone: 'primary' },
  //       { icon: 'bi-search', label: 'Advanced search', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'disputes',
  //     label: 'Disputes',
  //     icon: 'bi-exclamation-triangle',
  //     pill: 'RESOLUTION',
  //     titlePre: 'Disputes, ',
  //     titleAccent: 'resolved fast.',
  //     copy: 'Manage card disputes and chargebacks with full audit trails.',
  //     c1: '#f87171',
  //     c2: '#fbbf24',
  //     stats: [
  //       { label: 'Open', value: '2' },
  //       { label: 'Resolved (7d)', value: '5' },
  //       { label: 'Avg resolution', value: '2.4d' },
  //       { label: 'Win rate', value: '87%' },
  //     ],
  //     features: [
  //       { icon: 'bi-exclamation-triangle', text: 'Dispute filing and tracking' },
  //       { icon: 'bi-file-earmark-text', text: 'Evidence upload and management' },
  //       { icon: 'bi-clock-history', text: 'Full dispute timeline and history' },
  //       { icon: 'bi-graph-up-arrow', text: 'Dispute analytics and trends' },
  //     ],
  //     actions: [
  //       { icon: 'bi-plus-lg', label: 'New dispute', tone: 'primary' },
  //       { icon: 'bi-download', label: 'Export report', tone: 'ghost' },
  //     ],
  //   },
  //   {
  //     key: 'refunds',
  //     label: 'Refunds',
  //     icon: 'bi-arrow-counterclockwise',
  //     pill: 'REVERSALS',
  //     titlePre: 'Refunds, ',
  //     titleAccent: 'managed.',
  //     copy: 'Process and track card refunds with full visibility.',
  //     c1: '#a78bfa',
  //     c2: '#60a5fa',
  //     stats: [
  //       { label: 'Pending', value: 'KES 4.2K' },
  //       { label: 'Processed (7d)', value: 'KES 28K' },
  //       { label: 'Failed', value: '1' },
  //       { label: 'Avg time', value: '1.2d' },
  //     ],
  //     features: [
  //       { icon: 'bi-arrow-counterclockwise', text: 'Full and partial refund processing' },
  //       { icon: 'bi-search', text: 'Refund search and tracking' },
  //       { icon: 'bi-bell', text: 'Refund status notifications' },
  //       { icon: 'bi-file-earmark-bar-graph', text: 'Refund reporting and analytics' },
  //     ],
  //     actions: [
  //       { icon: 'bi-plus-lg', label: 'Process refund', tone: 'primary' },
  //       { icon: 'bi-download', label: 'Export report', tone: 'ghost' },
  //     ],
  //   },
  // ],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
export async function fetchCardsLayoutContent(): Promise<CardsLayoutContent> {
  // Frontend-only demo: no /api backend exists yet. Attempt the real endpoint
  // when it becomes available, but fall back to bundled mock data on any
  // failure so (a) SSR never throws on the origin-less relative fetch and
  // (b) the layout degrades cleanly instead of surfacing an error state.
  try {
    const response = await fetch('/api/cards-layout-content', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Cards layout API responded HTTP ${response.status}`);
    return (await response.json()) as CardsLayoutContent;
  } catch {
    return initialMockData;
  }
}

/* --------------------------------------------------------------------------
 * Helpers shared across cards layout components.
 * ------------------------------------------------------------------------ */

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export function findModule(content: CardsLayoutContent, key: string): ModuleDef {
  return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
