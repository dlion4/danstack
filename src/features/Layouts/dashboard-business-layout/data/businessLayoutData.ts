/* ============================================================================
 * businessLayoutData.ts — Paymo BAAS Business Layout (data + types)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: the Angular dashboard-business components (typescript + html).
 *   Nav groups, notifications, entity/account id and per-module marketing
 *   blocks extracted here as `initialMockData` so the layout is backend-ready:
 *   GET /api/business-layout-content returns this exact shape.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
export type ToastTone = 'success' | 'danger' | 'warning' | 'info';
export type AsideKind = 'compliance' | 'entity' | 'payroll';

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

export interface BusinessLayoutContent {
  brand: { name: string; tag: string; initials: string; icon: string };
  user: { name: string; role: string; email: string; initials: string };
  accountId: string;
  navGroups: NavGroup[];
  notifications: NotificationItem[];
  modules: ModuleDef[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating/hardcoded block from the Angular layout.
 * GET /api/business-layout-content should return this same shape.
 * ------------------------------------------------------------------------ */
export const initialMockData: BusinessLayoutContent = {
  brand: { name: 'Paymo', tag: 'Biz', initials: 'MK', icon: 'bi-building' },

  user: {
    name: 'Martha K.',
    role: 'Business Admin',
    email: 'admin@modernretail.co.ke',
    initials: 'MK',
  },

  accountId: 'ACC-3942-019',

  navGroups: [
    {
      title: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
        { key: 'insights', label: 'Insights', icon: 'bi-activity', badge: 'New' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { key: 'cash', label: 'Cash Management', icon: 'bi-wallet2' },
        { key: 'movements', label: 'Movements', icon: 'bi-arrow-left-right' },
        { key: 'billing', label: 'Billing', icon: 'bi-receipt' },
        { key: 'vendors', label: 'Vendors', icon: 'bi-people' },
        { key: 'payroll', label: 'Payroll', icon: 'bi-cash-stack' },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { key: 'forecast', label: 'Forecasting', icon: 'bi-pie-chart' },
        { key: 'tax', label: 'Tax Compliance', icon: 'bi-file-earmark-bar-graph' },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { key: 'compliance', label: 'Compliance', icon: 'bi-shield-check' },
        { key: 'integrations', label: 'Integrations', icon: 'bi-plug' },
        { key: 'team', label: 'Team', icon: 'bi-people-fill' },
        { key: 'settings', label: 'Settings', icon: 'bi-gear' },
      ],
    },
  ],

  notifications: [
    { id: 1, icon: 'bi-check2-circle', tone: 'success', title: 'Payroll settled', desc: '42 employees — KES 3.2M', time: '2h', unread: true },
    { id: 2, icon: 'bi-exclamation-triangle', tone: 'warning', title: 'Operating permit expiring', desc: 'Renew within 14 days to stay compliant.', time: '5h', unread: true },
    { id: 3, icon: 'bi-people', tone: 'primary', title: 'New vendor approved', desc: 'Safaricom Ltd added to the vendor book.', time: '1d', unread: true },
    { id: 4, icon: 'bi-x-circle', tone: 'danger', title: 'Failed payout', desc: 'Vendor INV-2291 needs a retry.', time: '1d', unread: true },
  ],

  modules: [
    {
      key: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', pill: 'BUSINESS HOME',
      titlePre: 'Run the business ', titleAccent: 'from one place.',
      copy: 'Cash, billing, payroll, vendors and compliance for Modern Retail Ltd — unified in a single business workspace.',
      c1: '#10b981', c2: '#059669',
      stats: [
        { label: 'Cash balance', value: 'KES 8.4M' },
        { label: 'Receivables', value: 'KES 2.1M', delta: '+6%', up: true },
        { label: 'Payables', value: 'KES 1.3M', delta: '-3%', up: true },
        { label: 'Open invoices', value: '18' },
      ],
      features: [
        { icon: 'bi-wallet2', text: 'Real-time cash position across accounts' },
        { icon: 'bi-receipt', text: 'Billing and collections at a glance' },
        { icon: 'bi-cash-stack', text: 'Payroll runs and payslip history' },
        { icon: 'bi-shield-check', text: 'KYB and compliance status always visible' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New invoice', tone: 'primary' },
        { icon: 'bi-cash-stack', label: 'Run payroll', tone: 'ghost' },
      ],
    },
    {
      key: 'insights', label: 'Insights', icon: 'bi-activity', pill: 'ANALYTICS',
      titlePre: 'Insights that ', titleAccent: 'drive decisions.',
      copy: 'Trends across revenue, spend and cashflow with drill-downs by branch, vendor and category.',
      c1: '#06b6d4', c2: '#0ea5e9',
      stats: [
        { label: 'Revenue (MTD)', value: 'KES 14.2M', delta: '+9%', up: true },
        { label: 'Spend (MTD)', value: 'KES 9.8M' },
        { label: 'Margin', value: '31%' },
        { label: 'Reports', value: '24' },
      ],
      features: [
        { icon: 'bi-graph-up', text: 'Revenue and spend trend dashboards' },
        { icon: 'bi-funnel', text: 'Filter by branch, vendor or category' },
        { icon: 'bi-pie-chart', text: 'Category and cost-centre breakdowns' },
        { icon: 'bi-download', text: 'Export insights to PDF and Excel' },
      ],
      actions: [
        { icon: 'bi-graph-up', label: 'Open dashboard', tone: 'primary' },
        { icon: 'bi-download', label: 'Export report', tone: 'ghost' },
      ],
    },
    {
      key: 'cash', label: 'Cash Management', icon: 'bi-wallet2', pill: 'TREASURY',
      titlePre: 'Cash, ', titleAccent: 'fully visible.',
      copy: 'Balances, sweeps and liquidity across every linked account and wallet.',
      c1: '#10b981', c2: '#14b8a6',
      stats: [
        { label: 'Total cash', value: 'KES 8.4M' },
        { label: 'Accounts', value: '5' },
        { label: 'Pending in', value: 'KES 640K' },
        { label: 'Pending out', value: 'KES 210K' },
      ],
      features: [
        { icon: 'bi-bank', text: 'Multi-account balances in real time' },
        { icon: 'bi-arrow-left-right', text: 'Internal transfers and sweeps' },
        { icon: 'bi-speedometer', text: 'Liquidity and runway tracking' },
        { icon: 'bi-bell', text: 'Low-balance and large-movement alerts' },
      ],
      actions: [
        { icon: 'bi-arrow-left-right', label: 'Transfer', tone: 'primary' },
        { icon: 'bi-bank', label: 'Link account', tone: 'ghost' },
      ],
    },
    {
      key: 'movements', label: 'Movements', icon: 'bi-arrow-left-right', pill: 'LEDGER',
      titlePre: 'Every movement, ', titleAccent: 'tracked.',
      copy: 'A searchable ledger of all inflows and outflows with filters and exports.',
      c1: '#3b82f6', c2: '#6366f1',
      stats: [
        { label: 'Today', value: 'KES 1.2M' },
        { label: 'This week', value: 'KES 6.4M' },
        { label: 'Pending', value: '7' },
        { label: 'Reconciled', value: '98%' },
      ],
      features: [
        { icon: 'bi-search', text: 'Filter by date, account or counterparty' },
        { icon: 'bi-journal-check', text: 'Reconciliation status per movement' },
        { icon: 'bi-tags', text: 'Categorise and tag transactions' },
        { icon: 'bi-download', text: 'Export the ledger to CSV' },
      ],
      actions: [
        { icon: 'bi-funnel', label: 'New filter', tone: 'primary' },
        { icon: 'bi-download', label: 'Export', tone: 'ghost' },
      ],
    },
    {
      key: 'billing', label: 'Billing', icon: 'bi-receipt', pill: 'INVOICES',
      titlePre: 'Billing & ', titleAccent: 'collections.',
      copy: 'Raise invoices, track payment status and chase overdue balances automatically.',
      c1: '#f59e0b', c2: '#f97316',
      stats: [
        { label: 'Outstanding', value: 'KES 2.1M' },
        { label: 'Overdue', value: 'KES 380K' },
        { label: 'Paid (MTD)', value: 'KES 5.9M' },
        { label: 'Open invoices', value: '18' },
      ],
      features: [
        { icon: 'bi-receipt', text: 'Create and send branded invoices' },
        { icon: 'bi-clock-history', text: 'Payment status and reminders' },
        { icon: 'bi-arrow-repeat', text: 'Recurring and subscription billing' },
        { icon: 'bi-download', text: 'Statement and aging exports' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New invoice', tone: 'primary' },
        { icon: 'bi-send', label: 'Chase overdue', tone: 'ghost' },
      ],
    },
    {
      key: 'vendors', label: 'Vendors', icon: 'bi-people', pill: 'SUPPLIERS',
      titlePre: 'Vendors & ', titleAccent: 'payables.',
      copy: 'Onboard vendors, approve bills and schedule payouts with full audit trails.',
      c1: '#8b5cf6', c2: '#6366f1',
      stats: [
        { label: 'Active vendors', value: '64' },
        { label: 'Pending bills', value: '12' },
        { label: 'Payables', value: 'KES 1.3M' },
        { label: 'Paid (MTD)', value: 'KES 4.7M' },
      ],
      features: [
        { icon: 'bi-person-plus', text: 'Vendor onboarding and KYB checks' },
        { icon: 'bi-check2-square', text: 'Bill approval workflows' },
        { icon: 'bi-calendar-event', text: 'Scheduled and batch payouts' },
        { icon: 'bi-journal-text', text: 'Per-vendor spend and history' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Add vendor', tone: 'primary' },
        { icon: 'bi-check2-square', label: 'Approve bills', tone: 'ghost' },
      ],
    },
    {
      key: 'payroll', label: 'Payroll', icon: 'bi-cash-stack', pill: 'PEOPLE PAY',
      titlePre: 'Payroll, ', titleAccent: 'done right.',
      copy: 'Run payroll, manage payslips and stay on top of statutory deductions.',
      c1: '#10b981', c2: '#059669',
      stats: [
        { label: 'Employees', value: '42' },
        { label: 'Next run', value: '25 Jul' },
        { label: 'Gross pay', value: 'KES 3.2M' },
        { label: 'Deductions', value: 'KES 740K' },
      ],
      features: [
        { icon: 'bi-play', text: 'One-click payroll runs' },
        { icon: 'bi-file-earmark-spreadsheet', text: 'Payslip generation and download' },
        { icon: 'bi-percent', text: 'PAYE, NSSF and NHIF calculations' },
        { icon: 'bi-bell', text: 'Payroll calendar and reminders' },
      ],
      actions: [
        { icon: 'bi-play', label: 'Run payroll', tone: 'primary' },
        { icon: 'bi-people', label: 'Open manager', tone: 'ghost' },
      ],
    },
    {
      key: 'forecast', label: 'Forecasting', icon: 'bi-pie-chart', pill: 'PLANNING',
      titlePre: 'Forecast with ', titleAccent: 'confidence.',
      copy: 'Cashflow and revenue projections built from your live billing and spend data.',
      c1: '#0ea5e9', c2: '#3b82f6',
      stats: [
        { label: '30-day forecast', value: 'KES 16.8M' },
        { label: 'Confidence', value: '92%' },
        { label: 'Scenarios', value: '3' },
        { label: 'Runway', value: '11 mo' },
      ],
      features: [
        { icon: 'bi-graph-up-arrow', text: 'Cashflow and revenue projections' },
        { icon: 'bi-sliders', text: 'Best / base / worst-case scenarios' },
        { icon: 'bi-lightning', text: 'Auto-built from live transactions' },
        { icon: 'bi-download', text: 'Export forecasts to your board pack' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New scenario', tone: 'primary' },
        { icon: 'bi-download', label: 'Export', tone: 'ghost' },
      ],
    },
    {
      key: 'tax', label: 'Tax Compliance', icon: 'bi-file-earmark-bar-graph', pill: 'STATUTORY',
      titlePre: 'Tax, ', titleAccent: 'always in order.',
      copy: 'VAT, withholding and corporate tax obligations tracked against KRA deadlines.',
      c1: '#ef4444', c2: '#f59e0b',
      stats: [
        { label: 'VAT due', value: 'KES 920K' },
        { label: 'Next filing', value: '20 Aug' },
        { label: 'Withholding', value: 'KES 180K' },
        { label: 'On time', value: '100%' },
      ],
      features: [
        { icon: 'bi-calendar-check', text: 'Filing calendar and reminders' },
        { icon: 'bi-percent', text: 'VAT and withholding summaries' },
        { icon: 'bi-file-earmark-text', text: 'Return-ready export packs' },
        { icon: 'bi-shield-check', text: 'Audit-ready documentation' },
      ],
      actions: [
        { icon: 'bi-file-earmark-bar-graph', label: 'Prepare return', tone: 'primary' },
        { icon: 'bi-download', label: 'Export pack', tone: 'ghost' },
      ],
    },
    {
      key: 'compliance', label: 'Compliance', icon: 'bi-shield-check', pill: 'KYB',
      titlePre: 'Compliance, ', titleAccent: 'covered.',
      copy: 'KYB status, operating permits and a full audit trail of every action.',
      c1: '#14b8a6', c2: '#10b981',
      stats: [
        { label: 'KYB status', value: 'Verified' },
        { label: 'Permits', value: '3 / 4' },
        { label: 'Expiring', value: '1' },
        { label: 'Audit events', value: '128' },
      ],
      features: [
        { icon: 'bi-shield-check', text: 'KYB and document verification' },
        { icon: 'bi-clock-history', text: 'Immutable audit trail' },
        { icon: 'bi-bell', text: 'Permit and renewal alerts' },
        { icon: 'bi-file-earmark-lock', text: 'Compliance document vault' },
      ],
      actions: [
        { icon: 'bi-shield-check', label: 'Open center', tone: 'primary' },
        { icon: 'bi-journal-text', label: 'Audit log', tone: 'ghost' },
      ],
    },
    {
      key: 'integrations', label: 'Integrations', icon: 'bi-plug', pill: 'CONNECT',
      titlePre: 'Connect your ', titleAccent: 'stack.',
      copy: 'Sync accounting, ERP and banking tools with secure, scoped integrations.',
      c1: '#6366f1', c2: '#8b5cf6',
      stats: [
        { label: 'Connected', value: '6' },
        { label: 'Available', value: '30+' },
        { label: 'Sync errors', value: '0' },
        { label: 'Last sync', value: '4m' },
      ],
      features: [
        { icon: 'bi-plug', text: 'Accounting and ERP connectors' },
        { icon: 'bi-bank', text: 'Bank feeds and statement import' },
        { icon: 'bi-arrow-repeat', text: 'Scheduled and on-demand syncs' },
        { icon: 'bi-shield-lock', text: 'Scoped tokens and audit logs' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Add integration', tone: 'primary' },
        { icon: 'bi-arrow-repeat', label: 'Sync now', tone: 'ghost' },
      ],
    },
    {
      key: 'team', label: 'Team', icon: 'bi-people-fill', pill: 'ACCESS',
      titlePre: 'Your team, ', titleAccent: 'in control.',
      copy: 'Roles, permissions and approvals so the right people do the right things.',
      c1: '#8b5cf6', c2: '#ec4899',
      stats: [
        { label: 'Members', value: '12' },
        { label: 'Roles', value: '5' },
        { label: 'Pending invites', value: '2' },
        { label: '2FA enforced', value: 'Yes' },
      ],
      features: [
        { icon: 'bi-people', text: 'Invite and manage team members' },
        { icon: 'bi-shield-lock', text: 'Role-based permissions' },
        { icon: 'bi-check2-square', text: 'Approval chains for payouts' },
        { icon: 'bi-key', text: 'Enforce 2FA and SSO' },
      ],
      actions: [
        { icon: 'bi-person-plus', label: 'Invite member', tone: 'primary' },
        { icon: 'bi-shield-lock', label: 'Manage roles', tone: 'ghost' },
      ],
    },
    {
      key: 'settings', label: 'Settings', icon: 'bi-gear', pill: 'CONFIG',
      titlePre: 'Workspace ', titleAccent: 'settings.',
      copy: 'Entity details, branding, defaults and notification preferences.',
      c1: '#64748b', c2: '#334155',
      stats: [
        { label: 'Entity', value: 'Verified' },
        { label: 'Currency', value: 'KES' },
        { label: 'Timezone', value: 'EAT' },
        { label: '2FA', value: 'On' },
      ],
      features: [
        { icon: 'bi-building', text: 'Entity and tax details' },
        { icon: 'bi-palette', text: 'Invoice and document branding' },
        { icon: 'bi-toggles', text: 'Default accounts and currencies' },
        { icon: 'bi-bell', text: 'Notification preferences' },
      ],
      actions: [
        { icon: 'bi-check-lg', label: 'Save changes', tone: 'primary' },
        { icon: 'bi-building', label: 'Entity details', tone: 'ghost' },
      ],
    },
  ],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
export async function fetchBusinessLayoutContent(): Promise<BusinessLayoutContent> {
  // Frontend-only demo: no /api backend exists yet. Attempt the real endpoint
  // when it becomes available, but fall back to bundled mock data on any
  // failure so (a) SSR never throws on the origin-less relative fetch and
  // (b) the layout degrades cleanly instead of surfacing an error state.
  try {
    const response = await fetch('/api/business-layout-content', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Business layout API responded HTTP ${response.status}`);
    return (await response.json()) as BusinessLayoutContent;
  } catch {
    return initialMockData;
  }
}

/* --------------------------------------------------------------------------
 * Helpers shared across business layout components.
 * ------------------------------------------------------------------------ */

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export function findModule(content: BusinessLayoutContent, key: string): ModuleDef {
  return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
