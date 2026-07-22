/* ============================================================================
 * devLayoutData.ts — Paymo BAAS Developer Layout (data + types)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: the Angular dashboard-dev components (typescript + html).
 *   Nav groups, notifications and per-module marketing blocks extracted here as
 *   `initialMockData` so the layout is backend-ready:
 *   GET /api/dev-layout-content returns this exact shape.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
export type ToastTone = 'success' | 'danger' | 'warning' | 'info';
export type AsideKind = 'apiExplorer' | 'systemStatus' | 'apiKeys';

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

export interface DevLayoutContent {
  brand: { name: string; tag: string; initials: string; icon: string };
  user: { name: string; role: string; email: string; initials: string };
  navGroups: NavGroup[];
  notifications: NotificationItem[];
  modules: ModuleDef[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating/hardcoded block from the Angular layout.
 * GET /api/dev-layout-content should return this same shape.
 * ------------------------------------------------------------------------ */
export const initialMockData: DevLayoutContent = {
  brand: { name: 'Paymo Dev', tag: 'v2025', initials: 'PM', icon: 'bi-terminal' },

  user: {
    name: 'John Dev',
    role: 'Tech Lead',
    email: 'john@paymo.dev',
    initials: 'JD',
  },

  navGroups: [
    {
      title: 'Development',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
        { key: 'explorer', label: 'API Explorer', icon: 'bi-terminal', badge: 'Beta' },
        { key: 'playground', label: 'Playground', icon: 'bi-code-square' },
      ],
    },
    {
      title: 'Integration',
      items: [
        { key: 'api-keys', label: 'API Keys', icon: 'bi-key' },
        { key: 'oauth', label: 'OAuth Apps', icon: 'bi-shield-check' },
        { key: 'webhooks', label: 'Webhooks', icon: 'bi-broadcast' },
        { key: 'sdks', label: 'SDKs & Libraries', icon: 'bi-journal-text' },
      ],
    },
    {
      title: 'Monitoring',
      items: [
        { key: 'logs', label: 'Request Logs', icon: 'bi-activity' },
        { key: 'errors', label: 'Error Insights', icon: 'bi-exclamation-triangle' },
        { key: 'metrics', label: 'Usage Metrics', icon: 'bi-bar-chart' },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { key: 'servers', label: 'Web Servers', icon: 'bi-hdd-network' },
        { key: 'storage', label: 'Data Storage', icon: 'bi-database' },
        { key: 'settings', label: 'Dev Settings', icon: 'bi-gear' },
      ],
    },
  ],

  notifications: [
    { id: 1, icon: 'bi-x-circle', tone: 'danger', title: 'Webhook Failed', desc: 'Endpoint: https://api.client.com/hooks timed out.', time: '5m', unread: true },
    { id: 2, icon: 'bi-exclamation-triangle', tone: 'warning', title: 'API Limit Warning', desc: 'Sandbox limit at 80% consumed.', time: '30m', unread: true },
    { id: 3, icon: 'bi-check-circle', tone: 'success', title: 'Deploy Successful', desc: 'SDK v4.2.0 published to npm.', time: '2h', unread: false },
  ],

  modules: [
    {
      key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', pill: 'DEVELOPER HOME',
      titlePre: 'Build, ship & monitor ', titleAccent: 'from one console.',
      copy: 'Keys, endpoints, logs and infrastructure for your Paymo integration — unified in a single sandbox-aware developer workspace.',
      c1: '#6366f1', c2: '#4338ca',
      stats: [
        { label: 'API keys', value: '6' },
        { label: 'Requests (24h)', value: '48.2K', delta: '+12%', up: true },
        { label: 'Error rate', value: '0.4%', delta: '-0.1%', up: true },
        { label: 'p95 latency', value: '189ms' },
      ],
      features: [
        { icon: 'bi-key', text: 'Provision and rotate scoped API keys' },
        { icon: 'bi-terminal', text: 'Test endpoints live in the API Explorer' },
        { icon: 'bi-activity', text: 'Stream request logs and error insights' },
        { icon: 'bi-broadcast', text: 'Manage webhooks and delivery health' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New API key', tone: 'primary' },
        { icon: 'bi-terminal', label: 'Open Explorer', tone: 'ghost' },
      ],
    },
    {
      key: 'explorer', label: 'API Explorer', icon: 'bi-terminal', pill: 'TRY IT',
      titlePre: 'Call any endpoint, ', titleAccent: 'right here.',
      copy: 'Compose requests, inspect responses and copy ready-to-use cURL/SDK snippets against the sandbox.',
      c1: '#8b5cf6', c2: '#6366f1',
      stats: [
        { label: 'Endpoints', value: '124' },
        { label: 'Saved requests', value: '18' },
        { label: 'Avg response', value: '142ms' },
        { label: 'Last run', value: '2m' },
      ],
      features: [
        { icon: 'bi-braces', text: 'Auto-generated request bodies from schema' },
        { icon: 'bi-clock-history', text: 'Request history with one-click replay' },
        { icon: 'bi-clipboard', text: 'Export to cURL, Node, Python & Go' },
        { icon: 'bi-shield-lock', text: 'Sandbox-scoped auth, never production' },
      ],
      actions: [
        { icon: 'bi-play-fill', label: 'New request', tone: 'primary' },
        { icon: 'bi-collection', label: 'Saved requests', tone: 'ghost' },
      ],
    },
    {
      key: 'playground', label: 'Playground', icon: 'bi-code-square', pill: 'SANDBOX',
      titlePre: 'Prototype flows ', titleAccent: 'in seconds.',
      copy: 'Spin up sandbox accounts, cards and transfers to validate your integration end-to-end.',
      c1: '#06b6d4', c2: '#3b82f6',
      stats: [
        { label: 'Sandbox accounts', value: '5' },
        { label: 'Test cards', value: '12' },
        { label: 'Simulated txns', value: '340' },
        { label: 'Scenarios', value: '9' },
      ],
      features: [
        { icon: 'bi-person-plus', text: 'Create sandbox customers on demand' },
        { icon: 'bi-credit-card', text: 'Issue test cards with fixed outcomes' },
        { icon: 'bi-lightning-charge', text: 'Trigger webhook events manually' },
        { icon: 'bi-arrow-repeat', text: 'Reset the sandbox in one click' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'New scenario', tone: 'primary' },
        { icon: 'bi-arrow-clockwise', label: 'Reset sandbox', tone: 'ghost' },
      ],
    },
    {
      key: 'api-keys', label: 'API Keys', icon: 'bi-key', pill: 'SECRETS',
      titlePre: 'Keys & scopes, ', titleAccent: 'under control.',
      copy: 'Issue, scope and rotate secrets with least-privilege permissions and full audit trails.',
      c1: '#f59e0b', c2: '#ef4444',
      stats: [
        { label: 'Active keys', value: '6' },
        { label: 'Restricted', value: '2' },
        { label: 'Rotated (30d)', value: '3' },
        { label: 'Last rotation', value: '4d' },
      ],
      features: [
        { icon: 'bi-shield-check', text: 'Granular read/write scopes per key' },
        { icon: 'bi-clock', text: 'Optional expiry and auto-rotation' },
        { icon: 'bi-eye-slash', text: 'Secrets shown once, then masked' },
        { icon: 'bi-journal-text', text: 'Per-key usage and IP allow-lists' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Create key', tone: 'primary' },
        { icon: 'bi-arrow-clockwise', label: 'Rotate key', tone: 'ghost' },
      ],
    },
    {
      key: 'oauth', label: 'OAuth Apps', icon: 'bi-shield-check', pill: 'CONNECT',
      titlePre: 'OAuth & ', titleAccent: 'consent flows.',
      copy: 'Register applications, manage redirect URIs and review granted scopes and tokens.',
      c1: '#10b981', c2: '#06b6d4',
      stats: [
        { label: 'Apps', value: '4' },
        { label: 'Active tokens', value: '21' },
        { label: 'Redirect URIs', value: '9' },
        { label: 'Revoked (7d)', value: '2' },
      ],
      features: [
        { icon: 'bi-app', text: 'Confidential & public client types' },
        { icon: 'bi-link-45deg', text: 'Validated redirect URI allow-lists' },
        { icon: 'bi-key', text: 'Scoped access & refresh tokens' },
        { icon: 'bi-shield-x', text: 'Revoke tokens and consent anytime' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Register app', tone: 'primary' },
        { icon: 'bi-list-check', label: 'View tokens', tone: 'ghost' },
      ],
    },
    {
      key: 'webhooks', label: 'Webhooks', icon: 'bi-broadcast', pill: 'EVENTS',
      titlePre: 'Webhooks that ', titleAccent: 'just deliver.',
      copy: 'Subscribe to events, replay failures and monitor delivery health across endpoints.',
      c1: '#ec4899', c2: '#8b5cf6',
      stats: [
        { label: 'Endpoints', value: '7' },
        { label: 'Delivered (24h)', value: '12.4K' },
        { label: 'Failed', value: '3' },
        { label: 'Success rate', value: '99.8%' },
      ],
      features: [
        { icon: 'bi-bell', text: 'Subscribe to 40+ event types' },
        { icon: 'bi-arrow-clockwise', text: 'Automatic retries with backoff' },
        { icon: 'bi-lock', text: 'Signed payloads for verification' },
        { icon: 'bi-send', text: 'One-click replay of any event' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Add endpoint', tone: 'primary' },
        { icon: 'bi-arrow-repeat', label: 'Replay failed', tone: 'ghost' },
      ],
    },
    {
      key: 'sdks', label: 'SDKs & Libraries', icon: 'bi-journal-text', pill: 'LIBRARIES',
      titlePre: 'Official SDKs, ', titleAccent: 'always current.',
      copy: 'Drop-in clients for every major stack with typed models and built-in retries.',
      c1: '#3b82f6', c2: '#6366f1',
      stats: [
        { label: 'Languages', value: '6' },
        { label: 'Latest', value: 'v4.2.0' },
        { label: 'Downloads/mo', value: '84K' },
        { label: 'Open issues', value: '2' },
      ],
      features: [
        { icon: 'bi-braces', text: 'Fully typed Node, Python, Go, Java, PHP, Ruby' },
        { icon: 'bi-arrow-repeat', text: 'Idempotency and retries built in' },
        { icon: 'bi-book', text: 'Copy-paste examples per endpoint' },
        { icon: 'bi-github', text: 'Open source with changelogs' },
      ],
      actions: [
        { icon: 'bi-download', label: 'Install SDK', tone: 'primary' },
        { icon: 'bi-book', label: 'Read docs', tone: 'ghost' },
      ],
    },
    {
      key: 'logs', label: 'Request Logs', icon: 'bi-activity', pill: 'OBSERVABILITY',
      titlePre: 'Every request, ', titleAccent: 'searchable.',
      copy: 'Inspect headers, bodies and timings for every API call with powerful filters.',
      c1: '#14b8a6', c2: '#10b981',
      stats: [
        { label: 'Logged (24h)', value: '48.2K' },
        { label: '2xx', value: '98.9%' },
        { label: '4xx', value: '0.7%' },
        { label: '5xx', value: '0.4%' },
      ],
      features: [
        { icon: 'bi-search', text: 'Filter by key, status, endpoint or trace id' },
        { icon: 'bi-braces', text: 'Expand request and response payloads' },
        { icon: 'bi-funnel', text: 'Save views and export to CSV' },
        { icon: 'bi-link-45deg', text: 'Jump from a log to the matching webhook' },
      ],
      actions: [
        { icon: 'bi-funnel', label: 'New filter', tone: 'primary' },
        { icon: 'bi-download', label: 'Export logs', tone: 'ghost' },
      ],
    },
    {
      key: 'errors', label: 'Error Insights', icon: 'bi-exclamation-triangle', pill: 'RELIABILITY',
      titlePre: 'Catch errors ', titleAccent: 'before users do.',
      copy: 'Grouped error trends with context, suggested fixes and affected keys.',
      c1: '#ef4444', c2: '#f59e0b',
      stats: [
        { label: 'Open groups', value: '4' },
        { label: 'Occurrences (24h)', value: '192' },
        { label: 'Top code', value: '401' },
        { label: 'MTTR', value: '18m' },
      ],
      features: [
        { icon: 'bi-layers', text: 'Automatic error grouping by code & endpoint' },
        { icon: 'bi-lightbulb', text: 'Suggested fixes per error family' },
        { icon: 'bi-bell', text: 'Alerts on new or spiking errors' },
        { icon: 'bi-bug', text: 'Full stack context and sample payloads' },
      ],
      actions: [
        { icon: 'bi-bell', label: 'Create alert', tone: 'primary' },
        { icon: 'bi-list-ul', label: 'View groups', tone: 'ghost' },
      ],
    },
    {
      key: 'metrics', label: 'Usage Metrics', icon: 'bi-bar-chart', pill: 'ANALYTICS',
      titlePre: 'Usage & quota, ', titleAccent: 'at a glance.',
      copy: 'Track request volume, latency percentiles and quota consumption over time.',
      c1: '#8b5cf6', c2: '#ec4899',
      stats: [
        { label: 'Requests (30d)', value: '1.4M' },
        { label: 'Quota used', value: '64%' },
        { label: 'p99 latency', value: '342ms' },
        { label: 'Uptime', value: '99.98%' },
      ],
      features: [
        { icon: 'bi-graph-up', text: 'Volume and latency dashboards' },
        { icon: 'bi-speedometer', text: 'Quota and rate-limit tracking' },
        { icon: 'bi-pie-chart', text: 'Breakdown by endpoint and key' },
        { icon: 'bi-download', text: 'Export metrics and reports' },
      ],
      actions: [
        { icon: 'bi-graph-up', label: 'Open dashboard', tone: 'primary' },
        { icon: 'bi-download', label: 'Export report', tone: 'ghost' },
      ],
    },
    {
      key: 'servers', label: 'Web Servers', icon: 'bi-hdd-network', pill: 'INFRA',
      titlePre: 'Your web servers, ', titleAccent: 'visible.',
      copy: 'Monitor origin health, TLS and routing for the servers behind your integration.',
      c1: '#64748b', c2: '#334155',
      stats: [
        { label: 'Origins', value: '4' },
        { label: 'Healthy', value: '4 / 4' },
        { label: 'TLS expiring', value: '0' },
        { label: 'Avg TTFB', value: '96ms' },
      ],
      features: [
        { icon: 'bi-heart-pulse', text: 'Active health checks per origin' },
        { icon: 'bi-shield-lock', text: 'TLS certificate expiry tracking' },
        { icon: 'bi-signpost-2', text: 'Routing and failover visibility' },
        { icon: 'bi-bell', text: 'Alerts on origin degradation' },
      ],
      actions: [
        { icon: 'bi-plus-lg', label: 'Add origin', tone: 'primary' },
        { icon: 'bi-arrow-clockwise', label: 'Re-check health', tone: 'ghost' },
      ],
    },
    {
      key: 'storage', label: 'Data Storage', icon: 'bi-database', pill: 'DATA',
      titlePre: 'Storage & ', titleAccent: 'retention.',
      copy: 'Inspect stored objects, retention policies and encryption for your account data.',
      c1: '#0ea5e9', c2: '#6366f1',
      stats: [
        { label: 'Objects', value: '2.1M' },
        { label: 'Size', value: '38 GB' },
        { label: 'Retention', value: '90d' },
        { label: 'Encrypted', value: '100%' },
      ],
      features: [
        { icon: 'bi-database', text: 'Object and record inventory' },
        { icon: 'bi-clock-history', text: 'Configurable retention windows' },
        { icon: 'bi-lock', text: 'Encryption at rest and in transit' },
        { icon: 'bi-trash', text: 'Scheduled purge and exports' },
      ],
      actions: [
        { icon: 'bi-sliders', label: 'Retention policy', tone: 'primary' },
        { icon: 'bi-download', label: 'Export data', tone: 'ghost' },
      ],
    },
    {
      key: 'settings', label: 'Dev Settings', icon: 'bi-gear', pill: 'CONFIG',
      titlePre: 'Workspace ', titleAccent: 'preferences.',
      copy: 'Environment defaults, team access and notification preferences for your dev workspace.',
      c1: '#6366f1', c2: '#8b5cf6',
      stats: [
        { label: 'Environments', value: '3' },
        { label: 'Members', value: '8' },
        { label: 'Default env', value: 'Sandbox' },
        { label: '2FA', value: 'On' },
      ],
      features: [
        { icon: 'bi-people', text: 'Team roles and member access' },
        { icon: 'bi-toggles', text: 'Default environment and region' },
        { icon: 'bi-bell', text: 'Per-channel notification preferences' },
        { icon: 'bi-shield-lock', text: 'Enforce 2FA for the workspace' },
      ],
      actions: [
        { icon: 'bi-check-lg', label: 'Save changes', tone: 'primary' },
        { icon: 'bi-arrow-counterclockwise', label: 'Reset', tone: 'ghost' },
      ],
    },
  ],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
export async function fetchDevLayoutContent(): Promise<DevLayoutContent> {
  // Frontend-only demo: no /api backend exists yet. Attempt the real endpoint
  // when it becomes available, but fall back to bundled mock data on any
  // failure so (a) SSR never throws on the origin-less relative fetch and
  // (b) the layout degrades cleanly instead of surfacing an error state.
  try {
    const response = await fetch('/api/dev-layout-content', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Dev layout API responded HTTP ${response.status}`);
    return (await response.json()) as DevLayoutContent;
  } catch {
    return initialMockData;
  }
}

/* --------------------------------------------------------------------------
 * Helpers shared across dev layout components.
 * ------------------------------------------------------------------------ */

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export function findModule(content: DevLayoutContent, key: string): ModuleDef {
  return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
