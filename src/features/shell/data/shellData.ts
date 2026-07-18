/* ============================================================================
 * shellData.ts — Paymo BAAS App Shell (data + types)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html (1,627 LOC) — the BaaS shell had its nav
 * groups, notifications and accounts hardcoded as JS consts that were injected
 * via innerHTML. They are extracted here as `initialMockData` so the shell is
 * backend-ready: GET /api/shell-content returns this exact shape.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * REPO NOTES ...: tuned for dlion4/danstack — no new packages; emerald theme;
 *                 fonts come from routes/__root.tsx; art served from /public.
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
export type ToastTone = 'success' | 'danger' | 'warning' | 'info';
export type AsideKind = 'security' | 'developers';

export interface NavItem {
  key: string;
  label: string;
  icon: string; // bootstrap-icons class fragment, e.g. 'bi-house-door'
  badge?: string | number;
  /** When true, opens a right-aside panel instead of routing. */
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
  /** Used as the route param and the nav key. */
  key: string;
  label: string;
  icon: string;
  pill: string;
  titlePre: string;
  titleAccent: string;
  copy: string;
  c1: string; // accent gradient start
  c2: string; // accent gradient end
  stats: ModuleStat[];
  features: ModuleFeature[];
  actions: ModuleAction[];
}

export interface ShellContent {
  brand: { name: string; tag: string; initials: string };
  user: { name: string; role: string; email: string; initials: string };
  accountId: string;
  navGroups: NavGroup[];
  notifications: NotificationItem[];
  accounts: AccountItem[];
  security: { twoFactorOn: boolean; sessions: SessionRow[] };
  developers: { sandboxOn: boolean; health: ApiHealthRow[] };
  modules: ModuleDef[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating/hardcoded block from legacy layout.html.
 * GET /api/shell-content should return this same shape.
 * ------------------------------------------------------------------------ */
export const initialMockData: ShellContent = {
  brand: { name: 'Paymo', tag: 'BaaS', initials: 'PM' },

  user: {
    name: 'James K.',
    role: 'Account Holder',
    email: 'james.k@paymo.co',
    initials: 'JK',
  },

  accountId: 'ACC-8X29-KL4',

  navGroups: [
    {
      title: 'Platform',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'bi-house-door' },
        { key: 'transfers', label: 'Transfers', icon: 'bi-arrow-left-right' },
        { key: 'payments', label: 'Payments', icon: 'bi-currency-dollar' },
        { key: 'wallets', label: 'Wallets', icon: 'bi-wallet2' },
        { key: 'cards', label: 'Virtual Cards', icon: 'bi-credit-card' },
      ],
    },
    {
      title: 'Treasury',
      items: [
        { key: 'liquidity', label: 'Liquidity & Float', icon: 'bi-droplet', badge: 14 },
        { key: 'reconciliation', label: 'Reconciliation', icon: 'bi-clipboard-check' },
        { key: 'payment-rails', label: 'Payment Rails', icon: 'bi-signpost-split' },
      ],
    },
    {
      title: 'Banking',
      items: [
        { key: 'beneficiaries', label: 'Beneficiaries', icon: 'bi-people' },
        { key: 'scheduled', label: 'Scheduled', icon: 'bi-calendar-event', badge: 3 },
        { key: 'qrpay', label: 'QR Pay', icon: 'bi-qr-code-scan' },
        { key: 'international', label: 'International', icon: 'bi-globe2' },
      ],
    },
    {
      title: 'Business',
      items: [
        { key: 'business', label: 'Business Accounts', icon: 'bi-building' },
        { key: 'analytics', label: 'Analytics', icon: 'bi-graph-up-arrow' },
        { key: 'developers', label: 'Developers', icon: 'bi-terminal', opensAside: 'developers' },
        { key: 'apikeys', label: 'API Keys', icon: 'bi-key' },
        { key: 'webhooks', label: 'Webhooks', icon: 'bi-broadcast', badge: 'Live' },
      ],
    },
    {
      title: 'Account',
      items: [
        { key: 'security', label: 'Security', icon: 'bi-shield-check', opensAside: 'security' },
        { key: 'settings', label: 'Settings', icon: 'bi-gear' },
        { key: 'support', label: 'Support', icon: 'bi-life-preserver' },
        { key: 'logout', label: 'Logout', icon: 'bi-box-arrow-right' },
      ],
    },
  ],

  notifications: [
    { id: 1, icon: 'bi-cpu', tone: 'primary', title: 'Developer API key rotated', desc: 'Production key was refreshed 2 min ago.', time: '2m', unread: true },
    { id: 2, icon: 'bi-currency-dollar', tone: 'success', title: 'Incoming settlement received', desc: 'KES 2.84M settled to operating wallet.', time: '15m', unread: true },
    { id: 3, icon: 'bi-shield-check', tone: 'warning', title: 'New login from Safari · Nairobi', desc: "If this wasn't you, review active sessions.", time: '1h', unread: true },
    { id: 4, icon: 'bi-arrow-left-right', tone: 'danger', title: 'Bulk transfer partially failed', desc: '12 of 340 transactions need retry.', time: '3h', unread: false },
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
      { service: 'Transfers API', status: 'active', statusText: 'Operational' },
      { service: 'Webhooks', status: 'warning', statusText: 'Degraded' },
      { service: 'Payouts API', status: 'active', statusText: 'Operational' },
    ],
  },

  /* Every nav destination resolves to a non-empty module page.
     The dashboard key is the home view at /app; the rest render at /app/<key>. */
  modules: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'bi-house-door',
      pill: 'OPERATING OVERVIEW',
      titlePre: 'Your money, ',
      titleAccent: 'at a glance.',
      copy: 'Balances, rails, settlement and live risk signals across every wallet and corridor — unified into one real-time view.',
      c1: '#2ee6a0', c2: '#7cf5c8',
      stats: [
        { label: 'Total balance', value: 'KES 4.82M', delta: '+4.2%', up: true },
        { label: 'Today volume', value: 'KES 318K', delta: '+12%', up: true },
        { label: 'Pending', value: 'KES 24.5K', delta: '-3%', up: false },
        { label: 'Success rate', value: '99.4%', delta: '+0.2%', up: true },
      ],
      features: [
        { icon: 'bi-lightning-charge', text: 'Real-time rail monitoring across M-Pesa, ACH, SEPA and cards' },
        { icon: 'bi-shield-check', text: 'Live fraud and compliance signals on every transaction' },
        { icon: 'bi-cash-coin', text: 'Multi-currency settlement with T+0 liquidity windows' },
        { icon: 'bi-bell', text: 'Threshold alerts the moment a payout or transfer lands' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New transfer', tone: 'primary' },
        { icon: 'bi-download', label: 'Export statement', tone: 'ghost' },
        { icon: 'bi-arrow-clockwise', label: 'Refresh rails', tone: 'ghost' },
      ],
    },
    {
      key: 'transfers',
      label: 'Transfers',
      icon: 'bi-arrow-left-right',
      pill: 'MONEY MOVEMENT',
      titlePre: 'Move money, ',
      titleAccent: 'rail by rail.',
      copy: 'Initiate, track and reconcile transfers across mobile money, bank rails and card networks with full lifecycle visibility.',
      c1: '#60a5fa', c2: '#2ee6a0',
      stats: [
        { label: 'Sent today', value: 'KES 142K' },
        { label: 'Received today', value: 'KES 88K' },
        { label: 'In flight', value: '7' },
        { label: 'Failed', value: '2', delta: 'retry', up: false },
      ],
      features: [
        { icon: 'bi-send', text: 'Single and bulk transfers with approval workflows' },
        { icon: 'bi-arrow-repeat', text: 'Automatic retry on rail timeouts and soft failures' },
        { icon: 'bi-file-earmark-spreadsheet', text: 'Reconciliation exports mapped to your ledger' },
        { icon: 'bi-clock-history', text: 'Per-transfer status timeline from initiation to settlement' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New transfer', tone: 'primary' },
        { icon: 'bi-list-check', label: 'Bulk upload', tone: 'ghost' },
      ],
    },
    {
      key: 'liquidity',
      label: 'Liquidity & Float',
      icon: 'bi-droplet',
      pill: 'TREASURY OPS',
      titlePre: 'Float, ',
      titleAccent: 'always funded.',
      copy: 'Bank float accounts, agent liquidity, rebalancing, forecasting and emergency liquidity controls with full audit trails.',
      c1: '#2ee6a0', c2: '#60a5fa',
      stats: [
        { label: 'Total float', value: 'KES 1.84B' },
        { label: 'Critical float', value: 'KES 42.8M', delta: '7 accounts', up: false },
        { label: 'Settlements today', value: 'KES 318.4M', delta: '94%', up: true },
        { label: 'Forecast shortfall', value: 'KES 87.5M', delta: '48h', up: false },
      ],
      features: [
        { icon: 'bi-bank', text: 'Real-time bank float accounts across 12 partner banks' },
        { icon: 'bi-people', text: 'Agent and partner float top-ups with auto-replenishment rules' },
        { icon: 'bi-graph-up-arrow', text: 'AI forecast of shortfalls with recommended top-up actions' },
        { icon: 'bi-shield-lock', text: 'Emergency liquidity lines with dual executive approval' },
      ],
      actions: [
        { icon: 'bi-arrow-left-right', label: 'Rebalance', tone: 'primary' },
        { icon: 'bi-lightning-charge', label: 'Emergency', tone: 'ghost' },
      ],
    },
    {
      key: 'reconciliation',
      label: 'Reconciliation',
      icon: 'bi-clipboard-check',
      pill: 'MATCHING ENGINE',
      titlePre: 'Every shilling, ',
      titleAccent: 'accounted for.',
      copy: 'Bank-to-bank transaction matching, exception handling, auto-reconciliation rules and a complete audit trail across all corridors.',
      c1: '#a78bfa', c2: '#2ee6a0',
      stats: [
        { label: 'Match rate', value: '94.7%', delta: '+0.6%', up: true },
        { label: 'Matched today', value: '8,412', delta: '+312', up: true },
        { label: 'Exceptions', value: '47', delta: '12 high-value', up: false },
        { label: 'Audit entries', value: '124,892' },
      ],
      features: [
        { icon: 'bi-hand-index', text: 'Manual and bulk matching with confidence scoring' },
        { icon: 'bi-magic', text: 'Auto-reconciliation rules with tolerances and prefixes' },
        { icon: 'bi-exclamation-triangle', text: 'Exception workbench with disputes and FX resolution' },
        { icon: 'bi-file-earmark-bar-graph', text: 'Signed audit exports and reconciliation certificates' },
      ],
      actions: [
        { icon: 'bi-magic', label: 'Run auto-recon', tone: 'primary' },
        { icon: 'bi-upload', label: 'Upload statement', tone: 'ghost' },
      ],
    },
    {
      key: 'payment-rails',
      label: 'Payment Rails',
      icon: 'bi-signpost-split',
      pill: 'ROUTING FABRIC',
      titlePre: 'Route every payment, ',
      titleAccent: 'the optimal way.',
      copy: 'Connected banks, rail configurations, routing rules, fees and nostro positions across M-Pesa, PesaLink, RTGS, SWIFT and cards.',
      c1: '#60a5fa', c2: '#2ee6a0',
      stats: [
        { label: 'Connected banks', value: '12' },
        { label: 'Active rails', value: '9' },
        { label: 'Routing success', value: '99.2%', delta: '+0.3%', up: true },
        { label: 'Avg fee', value: '0.42%' },
      ],
      features: [
        { icon: 'bi-bank', text: 'Bank connections with health and settlement visibility' },
        { icon: 'bi-shuffle', text: 'Priority routing rules with automatic fallbacks' },
        { icon: 'bi-cash-coin', text: 'Per-rail fees, limits and cutoff configuration' },
        { icon: 'bi-globe', text: 'Nostro positions and corridor liquidity tracking' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Connect bank', tone: 'primary' },
        { icon: 'bi-sliders', label: 'Routing rules', tone: 'ghost' },
      ],
    },
    {
      key: 'payments',
      label: 'Payments',
      icon: 'bi-currency-dollar',
      pill: 'COLLECTIONS & PAYOUTS',
      titlePre: 'Collect and pay, ',
      titleAccent: 'without limits.',
      copy: 'Payment links, checkout, subscriptions and mass payouts — built for merchants operating across African and global rails.',
      c1: '#a78bfa', c2: '#2ee6a0',
      stats: [
        { label: 'Payment links', value: '128' },
        { label: 'Collected (7d)', value: 'KES 612K' },
        { label: 'Refunds', value: '4' },
        { label: 'Disputes', value: '1' },
      ],
      features: [
        { icon: 'bi-link-45deg', text: 'Hosted payment links and embedded checkout' },
        { icon: 'bi-credit-card-2-front', text: 'Card, mobile money and bank collection in one flow' },
        { icon: 'bi-arrow-counterclockwise', text: 'Refunds and partial captures with audit trail' },
        { icon: 'bi-broadcast', text: 'Webhooks for every payment state change' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Create payment link', tone: 'primary' },
        { icon: 'bi-people', label: 'Mass payout', tone: 'ghost' },
      ],
    },
    {
      key: 'wallets',
      label: 'Wallets',
      icon: 'bi-wallet2',
      pill: 'MULTI-CURRENCY',
      titlePre: 'Balances, ',
      titleAccent: 'every currency.',
      copy: 'Hold, convert and route funds across KES, USD, EUR, GBP and NGN wallets with live FX and liquidity controls.',
      c1: '#22c55e', c2: '#2ee6a0',
      stats: [
        { label: 'Wallets', value: '6' },
        { label: 'KES', value: '2.4M' },
        { label: 'USD', value: '$18.2K' },
        { label: 'FX spread', value: '0.42%' },
      ],
      features: [
        { icon: 'bi-currency-exchange', text: 'Instant conversion at locked FX rates' },
        { icon: 'bi-shield-lock', text: 'Reserve and operating sub-wallets with permissions' },
        { icon: 'bi-graph-up', text: 'Per-wallet movement and balance history' },
        { icon: 'bi-bank', text: 'Auto-sweep into treasury and interest accounts' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Open wallet', tone: 'primary' },
        { icon: 'bi-currency-exchange', label: 'Convert', tone: 'ghost' },
      ],
    },
    {
      key: 'cards',
      label: 'Virtual Cards',
      icon: 'bi-credit-card',
      pill: 'ISSUING',
      titlePre: 'Issue cards, ',
      titleAccent: 'in seconds.',
      copy: 'Provision virtual and physical cards with spend limits, merchant locks and instant freeze controls.',
      c1: '#fb7185', c2: '#a78bfa',
      stats: [
        { label: 'Active cards', value: '14' },
        { label: 'Spend (30d)', value: 'KES 96K' },
        { label: 'Blocked', value: '2' },
        { label: 'Auth rate', value: '98.1%' },
      ],
      features: [
        { icon: 'bi-credit-card-2-back', text: 'Single-use and reusable virtual cards' },
        { icon: 'bi-slash-circle', text: 'Merchant category and country locksouts' },
        { icon: 'bi-snow', text: 'Instant freeze and unfreeze per card' },
        { icon: 'bi-bell', text: 'Real-time authorization and decline alerts' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Issue card', tone: 'primary' },
        { icon: 'bi-gear', label: 'Card policies', tone: 'ghost' },
      ],
    },
    {
      key: 'beneficiaries',
      label: 'Beneficiaries',
      icon: 'bi-people',
      pill: 'SAVED PAYEES',
      titlePre: 'Pay your people, ',
      titleAccent: 'faster.',
      copy: 'Keep beneficiaries, banks and mobile wallets on file with verified account details and saved rails.',
      c1: '#2ee6a0', c2: '#22c55e',
      stats: [
        { label: 'Beneficiaries', value: '64' },
        { label: 'Verified', value: '58' },
        { label: 'Pending KYC', value: '6' },
        { label: 'Groups', value: '5' },
      ],
      features: [
        { icon: 'bi-person-check', text: 'Verified bank and mobile money details' },
        { icon: 'bi-people', text: 'Group beneficiaries for repeat bulk payouts' },
        { icon: 'bi-shield-check', text: 'Beneficiary approval and allowlist policies' },
        { icon: 'bi-search', text: 'Instant search across names, banks and references' },
      ],
      actions: [
        { icon: 'bi-person-plus', label: 'Add beneficiary', tone: 'primary' },
        { icon: 'bi-upload', label: 'Import CSV', tone: 'ghost' },
      ],
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      icon: 'bi-calendar-event',
      pill: 'AUTOMATIONS',
      titlePre: 'Automate, ',
      titleAccent: 'on a schedule.',
      copy: 'Standing orders, recurring transfers and timed payouts that run themselves — with full edit and pause controls.',
      c1: '#fbbf24', c2: '#2ee6a0',
      stats: [
        { label: 'Scheduled', value: '12' },
        { label: 'This week', value: '3' },
        { label: 'Paused', value: '1' },
        { label: 'Completed', value: '248' },
      ],
      features: [
        { icon: 'bi-calendar2-week', text: 'Daily, weekly and custom recurrence rules' },
        { icon: 'bi-pause-circle', text: 'Pause and resume without losing history' },
        { icon: 'bi-bell', text: 'Pre-run and post-run notifications' },
        { icon: 'bi-shield-check', text: 'Approval gate for high-value schedules' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New schedule', tone: 'primary' },
        { icon: 'bi-clock-history', label: 'Run history', tone: 'ghost' },
      ],
    },
    {
      key: 'qrpay',
      label: 'QR Pay',
      icon: 'bi-qr-code-scan',
      pill: 'SCAN & PAY',
      titlePre: 'Scan, pay, ',
      titleAccent: 'done.',
      copy: 'Generate and accept QR payments for in-store and remote checkout with dynamic amounts and merchant identity.',
      c1: '#60a5fa', c2: '#a78bfa',
      stats: [
        { label: 'QR codes', value: '32' },
        { label: 'Scans (7d)', value: '1,204' },
        { label: 'Paid', value: 'KES 74K' },
        { label: 'Avg time', value: '4s' },
      ],
      features: [
        { icon: 'bi-qr-code', text: 'Dynamic and static QR generation' },
        { icon: 'bi-shop', text: 'Merchant-tagged checkout QRs' },
        { icon: 'bi-phone', text: 'Scan-to-pay from any mobile wallet' },
        { icon: 'bi-receipt', text: 'Automatic receipt and reconciliation' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Create QR', tone: 'primary' },
        { icon: 'bi-download', label: 'Download set', tone: 'ghost' },
      ],
    },
    {
      key: 'international',
      label: 'International',
      icon: 'bi-globe2',
      pill: 'CROSS-BORDER',
      titlePre: 'Send across borders, ',
      titleAccent: 'seamlessly.',
      copy: 'Cross-border transfers across 40+ corridors with transparent FX, compliance and settlement tracking.',
      c1: '#fbbf24', c2: '#60a5fa',
      stats: [
        { label: 'Corridors', value: '42' },
        { label: 'Sent (30d)', value: '$24K' },
        { label: 'In transit', value: '3' },
        { label: 'Avg time', value: '18m' },
      ],
      features: [
        { icon: 'bi-globe-americas', text: 'Send to bank, wallet and card globally' },
        { icon: 'bi-currency-exchange', text: 'Locked FX with transparent fee breakdown' },
        { icon: 'bi-shield-check', text: 'Built-in sanctions and compliance screening' },
        { icon: 'bi-clock-history', text: 'Per-corridor settlement timing' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Send abroad', tone: 'primary' },
        { icon: 'bi-table', label: 'Corridor rates', tone: 'ghost' },
      ],
    },
    {
      key: 'business',
      label: 'Business Accounts',
      icon: 'bi-building',
      pill: 'OPERATIONS',
      titlePre: 'Run the business, ',
      titleAccent: 'end to end.',
      copy: 'Invoices, suppliers, payroll, staff roles and merchant settlement from a single business workspace.',
      c1: '#22c55e', c2: '#2ee6a0',
      stats: [
        { label: 'Invoices', value: '42' },
        { label: 'Suppliers', value: '8' },
        { label: 'Staff', value: '5' },
        { label: 'Approvals', value: '2' },
      ],
      features: [
        { icon: 'bi-receipt', text: 'Invoice and payment link management' },
        { icon: 'bi-people', text: 'Supplier and payroll workflows' },
        { icon: 'bi-person-gear', text: 'Role-based staff permissions' },
        { icon: 'bi-bank', text: 'Merchant settlement scheduling' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Create invoice', tone: 'primary' },
        { icon: 'bi-people', label: 'Invite staff', tone: 'ghost' },
      ],
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'bi-graph-up-arrow',
      pill: 'INSIGHTS',
      titlePre: 'See the trends, ',
      titleAccent: 'clearly.',
      copy: 'Cohort, volume, failure and revenue analytics with exportable dashboards and saved views.',
      c1: '#a78bfa', c2: '#60a5fa',
      stats: [
        { label: 'Reports', value: '18' },
        { label: 'Saved views', value: '6' },
        { label: 'Scheduled', value: '4' },
        { label: 'Data points', value: '2.4M' },
      ],
      features: [
        { icon: 'bi-bar-chart', text: 'Volume and cohort analytics by rail and market' },
        { icon: 'bi-graph-up', text: 'Failure and latency trend analysis' },
        { icon: 'bi-calendar', text: 'Scheduled report delivery to email and Slack' },
        { icon: 'bi-database', text: 'Warehouse-ready CSV and API exports' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New report', tone: 'primary' },
        { icon: 'bi-download', label: 'Export data', tone: 'ghost' },
      ],
    },
    {
      key: 'apikeys',
      label: 'API Keys',
      icon: 'bi-key',
      pill: 'CREDENTIALS',
      titlePre: 'Keys, ',
      titleAccent: 'scoped and rotated.',
      copy: 'Create, scope and rotate API keys with environment separation and full usage visibility.',
      c1: '#fb7185', c2: '#fbbf24',
      stats: [
        { label: 'Active keys', value: '7' },
        { label: 'Test keys', value: '4' },
        { label: 'Rotations (30d)', value: '2' },
        { label: 'Last used', value: '2m' },
      ],
      features: [
        { icon: 'bi-key', text: 'Scoped keys per environment and service' },
        { icon: 'bi-arrow-repeat', text: 'Zero-downtime rotation with grace windows' },
        { icon: 'bi-clock-history', text: 'Per-key usage logs and rate-limit visibility' },
        { icon: 'bi-shield-lock', text: 'IP allowlists and revocation controls' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Create key', tone: 'primary' },
        { icon: 'bi-clock-history', label: 'Usage logs', tone: 'ghost' },
      ],
    },
    {
      key: 'webhooks',
      label: 'Webhooks',
      icon: 'bi-broadcast',
      pill: 'EVENTS · LIVE',
      titlePre: 'Events, ',
      titleAccent: 'delivered reliably.',
      copy: 'Subscribe, debug and replay webhook events with signed payloads and delivery insights.',
      c1: '#2ee6a0', c2: '#60a5fa',
      stats: [
        { label: 'Endpoints', value: '4' },
        { label: 'Events (24h)', value: '8,210' },
        { label: 'Delivery rate', value: '99.6%' },
        { label: 'Replays', value: '12' },
      ],
      features: [
        { icon: 'bi-broadcast', text: 'Per-event subscriptions and versioning' },
        { icon: 'bi-shield-lock', text: 'Signed payloads with timestamp validation' },
        { icon: 'bi-arrow-repeat', text: 'One-click replay with backoff policy' },
        { icon: 'bi-bug', text: 'Live request inspector and debugger' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Add endpoint', tone: 'primary' },
        { icon: 'bi-arrow-repeat', label: 'Replay events', tone: 'ghost' },
      ],
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'bi-gear',
      pill: 'WORKSPACE',
      titlePre: 'Configure, ',
      titleAccent: 'your way.',
      copy: 'Workspace preferences, notifications, branding and regional defaults in one place.',
      c1: '#7cf5c8', c2: '#2ee6a0',
      stats: [
        { label: 'Profiles', value: '2' },
        { label: 'Timezone', value: 'GMT+3' },
        { label: 'Currency', value: 'KES' },
        { label: 'Locale', value: 'en-KE' },
      ],
      features: [
        { icon: 'bi-sliders', text: 'Workspace and profile preferences' },
        { icon: 'bi-bell', text: 'Granular notification and digest controls' },
        { icon: 'bi-palette', text: 'Branding and receipt customization' },
        { icon: 'bi-translate', text: 'Regional, language and currency defaults' },
      ],
      actions: [
        { icon: 'bi-check-lg', label: 'Save changes', tone: 'primary' },
        { icon: 'bi-arrow-counterclockwise', label: 'Reset', tone: 'ghost' },
      ],
    },
    {
      key: 'support',
      label: 'Support',
      icon: 'bi-life-preserver',
      pill: 'HELP CENTER',
      titlePre: 'We are here, ',
      titleAccent: 'around the clock.',
      copy: 'Search docs, open a ticket or chat with Paymo support — with full case history and SLA tracking.',
      c1: '#60a5fa', c2: '#2ee6a0',
      stats: [
        { label: 'Open tickets', value: '2' },
        { label: 'Resolved (7d)', value: '11' },
        { label: 'Avg response', value: '14m' },
        { label: 'SLA', value: '99%' },
      ],
      features: [
        { icon: 'bi-search', text: 'Searchable knowledge base and API docs' },
        { icon: 'bi-chat-dots', text: 'Live chat with priority routing' },
        { icon: 'bi-ticket-detailed', text: 'Ticket creation with case history' },
        { icon: 'bi-clock-history', text: 'SLA and response-time tracking' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Open ticket', tone: 'primary' },
        { icon: 'bi-chat-dots', label: 'Start chat', tone: 'ghost' },
      ],
    },
  ],
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
export async function fetchShellContent(): Promise<ShellContent> {
  const response = await fetch('/api/shell-content', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Shell content API responded HTTP ${response.status}`);
  return response.json() as Promise<ShellContent>;
}

/* --------------------------------------------------------------------------
 * Helpers shared across shell components.
 * ------------------------------------------------------------------------ */

/** Classnames join (same convention used across all danstack feature pages). */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

/** Resolve a module by key, with a safe fallback to the dashboard module. */
export function findModule(content: ShellContent, key: string): ModuleDef {
  return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
