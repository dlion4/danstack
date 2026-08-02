/* ============================================================================
 * 4.1 Developer Dashboard — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Every repeating / hardcoded block that used to live inside the HTML skeleton
 * (stat cards, attention feed, code snippets, quick actions, API-key rows, the
 * team table, the request log, alerts, SDK lists, the go-live checklist and the
 * status board) has been lifted out into `initialMockData` below.
 *
 * `fetchDeveloperDashboard()` is the TanStack Query function: it calls
 * GET /api/dev/dashboard and falls back to the mock so the page renders in full
 * before any backend exists. Swap the endpoint and the UI needs no changes.
 * ========================================================================== */

export type Tone =
	| "badgeS"
	| "badgeW"
	| "badgeD"
	| "badgeI"
	| "badgeP"
	| "badgeNeutral";

export interface Crumb {
	label: string;
	to?: string;
}
export interface HeaderAction {
	icon: string;
	title: string;
	modal: string;
	color?: string;
	counter?: number;
}
export interface PageAction {
	label: string;
	icon: string;
	modal: string;
	primary?: boolean;
}
export interface MiniBar {
	height: string;
	color: string;
}
export interface StatCard {
	key: string;
	col: string;
	label: string;
	labelColor: string;
	value: string;
	unit?: string;
	badge: { tone: Tone; icon: string; text: string };
	accentBorder?: string;
	miniBars?: MiniBar[];
	meter?: { label: string; value: string; pct: number; color: string };
	facts?: {
		label: string;
		value: string;
		modal?: string;
		actionLabel?: string;
	}[];
}
export interface HeroCard {
	projectLabel: string;
	projectName: string;
	modeLabel: string;
	value: string;
	valueUnit: string;
	detail: string;
	actions: { label: string; modal: string }[];
}
export interface FeedItem {
	id: string;
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
	primary?: boolean;
}
export interface Snippet {
	key: string;
	label: string;
	code: string;
}
export interface QuickAction {
	label: string;
	icon: string;
	color: string;
	modal: string;
}
export interface ApiKeyRow {
	name: string;
	envTag: string;
	envTone: "test" | "live";
	token: string;
	created: string;
	lastUsed: string;
	status: string;
	statusTone: Tone;
	actionLabel: string;
	modal: string;
}
export interface TeamRow {
	initials: string;
	avatarBg?: string;
	name: string;
	email: string;
	role: string;
	roleTone: Tone;
	mfa: string;
	mfaTone: Tone;
	mfaIcon?: string;
	lastLogin: string;
	editable: boolean;
}
export interface LogRow {
	method: string;
	methodTone: Tone;
	endpoint: string;
	status: string;
	statusTone: Tone;
	time: string;
	ip: string;
	latency: string;
	modal: string;
}
export interface AlertRow {
	icon: string;
	iconColor: string;
	bg: string;
	title: string;
	text: string;
	linkLabel?: string;
	linkModal?: string;
	age: string;
}
export interface SdkRow {
	group: string;
	name: string;
	sub: string;
	actionIcon: string;
	actionLabel?: string;
	modal?: string;
}
export interface ChecklistRow {
	done: boolean;
	title: string;
	sub: string;
	actionLabel?: string;
	modal?: string;
}
export interface StatusRow {
	name: string;
	sub: string;
	status: string;
	tone: Tone;
}
export interface WebhookLogRow {
	eventId: string;
	type: string;
	endpoint: string;
	status: string;
	tone: Tone;
	time: string;
	actionLabel: string;
	modal: string;
}
export interface ApiLogRow {
	method: string;
	methodTone: Tone;
	endpoint: string;
	status: string;
	statusTone: Tone;
	time: string;
	ip: string;
	source: string;
}
export interface QuotaRow {
	service: string;
	usage: string;
	cost: string;
}

export interface DeveloperDashboardContent {
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	breadcrumb: { parents: Crumb[]; current: string };
	header: {
		title: string;
		subtitle: string;
		searchPlaceholder: string;
		user: { name: string; role: string; initials: string; email: string };
		actions: HeaderAction[];
	};
	pageActions: PageAction[];
	hero: HeroCard;
	statCards: StatCard[];
	attention: FeedItem[];
	snippets: Snippet[];
	quickActions: QuickAction[];
	apiKeys: ApiKeyRow[];
	team: TeamRow[];
	logs: LogRow[];
	alerts: AlertRow[];
	sdks: SdkRow[];
	checklist: ChecklistRow[];
	systemStatus: StatusRow[];
	webhookLogs: WebhookLogRow[];
	apiLogs: ApiLogRow[];
	quota: {
		plan: string;
		usedLabel: string;
		usedPct: number;
		rows: QuotaRow[];
		total: string;
	};
	whitelist: string[];
	docsTopics: string[];
	versionInfo: { current: string; latest: string; changes: string[] };
	rateLimits: { tier: string; read: string; write: string };
}

/* -------------------------------------------------------------------------
 * initialMockData — extracted verbatim from the 4.1 HTML skeleton.
 * ----------------------------------------------------------------------- */
export const initialMockData: DeveloperDashboardContent = {
	pageCode: "",
	// pageTitle: "Developer Dashboard",
	pageSub:
		"Manage your PayMo integration, track API requests, handle webhook events, and manage project access.",
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/dev" },
			{ label: "Developer Portal", to: "/dev" },
		],
		current: "Dashboard & Project Management",
	},

	header: {
		title: "Developer Portal",
		subtitle: "APIs, Integration & Technical Operations",
		searchPlaceholder: "Search API docs, logs, errors, endpoint patterns...",
		user: {
			name: "David K.",
			role: "Lead Engineer",
			initials: "DK",
			email: "david.k@jenga.com",
		},
		actions: [
			{
				icon: "bi-activity",
				title: "API Health",
				modal: "healthStatusModal",
				color: "var(--pm-accent)",
			},
			{ icon: "bi-bell", title: "Alerts", modal: "apiAlertsModal", counter: 3 },
		],
	},

	pageActions: [
		{
			label: "New Project",
			icon: "bi-folder-plus",
			modal: "createProjectModal",
		},
		{ label: "New API Key", icon: "bi-key", modal: "generateKeyModal" },
		{ label: "Read Docs", icon: "bi-book", modal: "docsModal", primary: true },
	],

	hero: {
		projectLabel: "Project:",
		projectName: "JengaPay Core Backend",
		modeLabel: "● Test Mode",
		value: "24,892",
		valueUnit: "requests / 24h",
		detail: "API Version: v2025-01-01 · Region: af-east-1",
		actions: [
			{ label: "View Logs", modal: "apiLogsModal" },
			{ label: "Go Live Checklist", modal: "goLiveChecklistModal" },
		],
	},

	statCards: [
		{
			key: "latency",
			col: "col-lg-2 col-md-4 col-6",
			label: "API LATENCY (P95)",
			labelColor: "var(--pm-info)",
			value: "124",
			unit: "ms",
			badge: {
				tone: "badgeS",
				icon: "bi-graph-down",
				text: "12ms improvement",
			},
			miniBars: [
				{ height: "65%", color: "var(--pm-info)" },
				{ height: "70%", color: "var(--pm-info)" },
				{ height: "55%", color: "var(--pm-info)" },
				{ height: "80%", color: "var(--pm-info)" },
				{ height: "60%", color: "var(--pm-info)" },
				{ height: "45%", color: "var(--pm-info)" },
			],
		},
		{
			key: "errors",
			col: "col-lg-3 col-md-4 col-6",
			label: "ERROR RATE",
			labelColor: "var(--pm-danger)",
			value: "0.42",
			unit: "%",
			badge: {
				tone: "badgeW",
				icon: "bi-exclamation-triangle",
				text: "104 failed reqs",
			},
			meter: {
				label: "Error Budget",
				value: "42% used",
				pct: 42,
				color: "var(--pm-danger)",
			},
		},
		{
			key: "webhooks",
			col: "col-lg-3 col-md-4",
			label: "WEBHOOK DELIVERY",
			labelColor: "var(--pm-purple)",
			value: "99.8",
			unit: "%",
			badge: { tone: "badgeS", icon: "bi-check-all", text: "Healthy" },
			accentBorder: "var(--pm-purple)",
			facts: [
				{ label: "Active Endpoints", value: "3" },
				{
					label: "Pending Retries",
					value: "14",
					modal: "webhookLogsModal",
					actionLabel: "View",
				},
			],
		},
	],

	attention: [
		{
			id: "key-exp",
			icon: "bi-key",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Test Secret Key expires in 14 days",
			sub: "Key prefix: sk_test_8f92...",
			actionLabel: "Roll Key",
			modal: "rollKeyModal",
			primary: true,
		},
		{
			id: "wh-fail",
			icon: "bi-broadcast",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Webhook endpoint failing",
			sub: "https://api.jenga.com/hooks returning 503",
			actionLabel: "Inspect",
			modal: "webhookLogsModal",
		},
		{
			id: "api-ver",
			icon: "bi-box-arrow-up-right",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "New API Version Available",
			sub: "Upgrade to v2025-06-01 for new features",
			actionLabel: "Upgrade",
			modal: "apiVersionModal",
		},
	],

	snippets: [
		{
			key: "curl",
			label: "cURL",
			code: `curl https://api.paymo.com/v1/charges \\
  -H "Authorization: Bearer sk_test_8f92..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "currency": "KES",
    "source": "mpesa_stk",
    "phone": "0712345678"
  }'`,
		},
		{
			key: "node",
			label: "Node.js",
			code: `const paymo = require('paymo')('sk_test_8f92...');
const charge = await paymo.charges.create({
  amount: 5000,
  currency: 'KES',
  source: 'mpesa_stk',
  phone: '0712345678'
});`,
		},
		{
			key: "python",
			label: "Python",
			code: `import paymo
paymo.api_key = "sk_test_8f92..."
charge = paymo.Charge.create(
    amount=5000,
    currency="KES",
    source="mpesa_stk",
    phone="0712345678"
)`,
		},
		{
			key: "php",
			label: "PHP",
			code: `$paymo = new \\PayMo\\PayMo('sk_test_8f92...');
$charge = $paymo->charges->create([
  'amount' => 5000,
  'currency' => 'KES',
  'source' => 'mpesa_stk',
  'phone' => '0712345678'
]);`,
		},
	],

	quickActions: [
		{
			label: "API Keys",
			icon: "bi-key",
			color: "var(--pm-warning)",
			modal: "generateKeyModal",
		},
		{
			label: "Webhooks",
			icon: "bi-broadcast",
			color: "var(--pm-info)",
			modal: "addWebhookModal",
		},
		{
			label: "API Logs",
			icon: "bi-terminal",
			color: "var(--pm-purple)",
			modal: "apiLogsModal",
		},
		{
			label: "IP Whitelist",
			icon: "bi-shield-lock",
			color: "var(--pm-accent)",
			modal: "whitelistIpModal",
		},
		{
			label: "Team Access",
			icon: "bi-people",
			color: "var(--pm-primary)",
			modal: "projectTeamModal",
		},
		{
			label: "Rate Limits",
			icon: "bi-speedometer2",
			color: "var(--pm-danger)",
			modal: "rateLimitModal",
		},
		{
			label: "API Quota",
			icon: "bi-wallet2",
			color: "var(--pm-ink-soft)",
			modal: "quotaBillingModal",
		},
		{
			label: "Go Live",
			icon: "bi-rocket",
			color: "var(--pm-accent)",
			modal: "goLiveChecklistModal",
		},
	],

	apiKeys: [
		{
			name: "Test Secret Key",
			envTag: "TEST",
			envTone: "test",
			token: "sk_test_8f92****************4a1b",
			created: "12 Jan 2025",
			lastUsed: "2 mins ago",
			status: "Active",
			statusTone: "badgeS",
			actionLabel: "Roll Key",
			modal: "rollKeyModal",
		},
		{
			name: "Test Publishable Key",
			envTag: "TEST",
			envTone: "test",
			token: "pk_test_e3b1****************9c0d",
			created: "12 Jan 2025",
			lastUsed: "1 hour ago",
			status: "Active",
			statusTone: "badgeS",
			actionLabel: "Copy",
			modal: "copySnippetModal",
		},
		{
			name: "Live Secret Key",
			envTag: "LIVE",
			envTone: "live",
			token: "sk_live_••••••••••••••••••••",
			created: "Pending go-live",
			lastUsed: "Never",
			status: "Locked",
			statusTone: "badgeW",
			actionLabel: "Go Live",
			modal: "goLiveChecklistModal",
		},
	],

	team: [
		{
			initials: "DK",
			name: "David K.",
			email: "david@jenga.com",
			role: "Owner",
			roleTone: "badgeP",
			mfa: "Enabled",
			mfaTone: "badgeS",
			mfaIcon: "bi-shield-check",
			lastLogin: "Today",
			editable: false,
		},
		{
			initials: "SO",
			avatarBg: "var(--pm-gradient-blue)",
			name: "Sarah O.",
			email: "sarah@jenga.com",
			role: "Developer",
			roleTone: "badgeI",
			mfa: "Enabled",
			mfaTone: "badgeS",
			mfaIcon: "bi-shield-check",
			lastLogin: "Yesterday",
			editable: true,
		},
		{
			initials: "MW",
			avatarBg: "var(--pm-gradient-rose)",
			name: "Mike W.",
			email: "mike@jenga.com",
			role: "Support",
			roleTone: "badgeNeutral",
			mfa: "Disabled",
			mfaTone: "badgeW",
			lastLogin: "5 days ago",
			editable: true,
		},
	],

	logs: [
		{
			method: "POST",
			methodTone: "badgeS",
			endpoint: "/v1/charges/mpesa",
			status: "200 OK",
			statusTone: "badgeS",
			time: "10:42:15 AM",
			ip: "192.168.1.45",
			latency: "112ms",
			modal: "requestDetailModal",
		},
		{
			method: "GET",
			methodTone: "badgeI",
			endpoint: "/v1/customers/cus_9912",
			status: "200 OK",
			statusTone: "badgeS",
			time: "10:41:03 AM",
			ip: "192.168.1.45",
			latency: "85ms",
			modal: "requestDetailModal",
		},
		{
			method: "POST",
			methodTone: "badgeS",
			endpoint: "/v1/disbursements",
			status: "400 ERR",
			statusTone: "badgeD",
			time: "10:38:22 AM",
			ip: "192.168.1.102",
			latency: "145ms",
			modal: "requestDetailModal",
		},
		{
			method: "HOOK",
			methodTone: "badgeW",
			endpoint: "charge.success",
			status: "503 ERR",
			statusTone: "badgeD",
			time: "10:35:10 AM",
			ip: "PayMo Event Bus",
			latency: "—",
			modal: "webhookLogsModal",
		},
		{
			method: "GET",
			methodTone: "badgeI",
			endpoint: "/v1/balance",
			status: "200 OK",
			statusTone: "badgeS",
			time: "10:30:00 AM",
			ip: "192.168.1.45",
			latency: "60ms",
			modal: "requestDetailModal",
		},
	],

	alerts: [
		{
			icon: "bi-key",
			iconColor: "var(--pm-warning)",
			bg: "var(--pm-warning-soft)",
			title: "Key Expiration",
			text: "Test Secret Key expires in 14 days.",
			linkLabel: "Roll Key",
			linkModal: "rollKeyModal",
			age: "2 hours ago",
		},
		{
			icon: "bi-broadcast",
			iconColor: "var(--pm-danger)",
			bg: "var(--pm-danger-soft)",
			title: "Webhook Failures",
			text: "Endpoint .../hooks has failed 14 consecutive times.",
			linkLabel: "Inspect",
			linkModal: "webhookLogsModal",
			age: "5 hours ago",
		},
		{
			icon: "bi-box-arrow-up-right",
			iconColor: "var(--pm-info)",
			bg: "var(--pm-info-soft)",
			title: "Version Deprecation",
			text: "API v2024-08-15 will be deprecated on Dec 31, 2025.",
			linkLabel: "Upgrade",
			linkModal: "apiVersionModal",
			age: "1 day ago",
		},
		{
			icon: "bi-speedometer2",
			iconColor: "var(--pm-muted)",
			bg: "var(--pm-surface-2)",
			title: "Rate Limit",
			text: "Hit 85% of read rate limit during peak hour.",
			age: "2 days ago",
		},
	],

	sdks: [
		{
			group: "backend",
			name: "Node.js",
			sub: "npm install paymo-node",
			actionIcon: "bi-clipboard",
			modal: "copySnippetModal",
		},
		{
			group: "backend",
			name: "Python",
			sub: "pip install paymo-python",
			actionIcon: "bi-clipboard",
			modal: "copySnippetModal",
		},
		{
			group: "backend",
			name: "PHP / Composer",
			sub: "composer require paymo/paymo-php",
			actionIcon: "bi-clipboard",
			modal: "copySnippetModal",
		},
		{
			group: "mobile",
			name: "React Native",
			sub: "Official React Native wrapper",
			actionIcon: "bi-github",
			actionLabel: "View",
		},
		{
			group: "mobile",
			name: "Flutter",
			sub: "paymo_flutter pub.dev",
			actionIcon: "bi-github",
			actionLabel: "View",
		},
		{
			group: "mobile",
			name: "Android (Kotlin)",
			sub: "Maven Central",
			actionIcon: "bi-github",
			actionLabel: "View",
		},
		{
			group: "plugins",
			name: "WooCommerce",
			sub: "WordPress Plugin",
			actionIcon: "bi-download",
		},
		{
			group: "plugins",
			name: "Shopify",
			sub: "Install via Shopify App Store",
			actionIcon: "bi-box-arrow-up-right",
		},
	],

	checklist: [
		{
			done: true,
			title: "Business Verification (KYB)",
			sub: "Documents approved by compliance team.",
		},
		{
			done: true,
			title: "Test Transactions",
			sub: "At least 5 successful API calls in Test mode.",
		},
		{
			done: false,
			title: "Webhook Setup",
			sub: "Configure and verify at least one Live webhook endpoint.",
			actionLabel: "Setup",
			modal: "addWebhookModal",
		},
		{
			done: false,
			title: "IP Whitelisting (Optional but Recommended)",
			sub: "Restrict API key access to your server IPs.",
			actionLabel: "Add IPs",
			modal: "whitelistIpModal",
		},
	],

	systemStatus: [
		{
			name: "Core API Gateway",
			sub: "Uptime 99.99%",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "M-Pesa STK Push",
			sub: "Uptime 99.95%",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "PesaLink Transfers",
			sub: "Uptime 99.80%",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Webhooks Delivery",
			sub: "Latency < 2s",
			status: "Operational",
			tone: "badgeS",
		},
	],

	webhookLogs: [
		{
			eventId: "evt_88319a...",
			type: "charge.success",
			endpoint: ".../hooks",
			status: "503 ERR",
			tone: "badgeD",
			time: "10:35:10 AM",
			actionLabel: "Retry",
			modal: "testWebhookModal",
		},
		{
			eventId: "evt_88318b...",
			type: "customer.created",
			endpoint: ".../hooks",
			status: "200 OK",
			tone: "badgeS",
			time: "10:30:05 AM",
			actionLabel: "View",
			modal: "requestDetailModal",
		},
		{
			eventId: "evt_88317c...",
			type: "charge.failed",
			endpoint: ".../hooks",
			status: "200 OK",
			tone: "badgeS",
			time: "10:22:41 AM",
			actionLabel: "View",
			modal: "requestDetailModal",
		},
		{
			eventId: "evt_88316d...",
			type: "transfer.success",
			endpoint: ".../hooks",
			status: "503 ERR",
			tone: "badgeD",
			time: "10:11:09 AM",
			actionLabel: "Retry",
			modal: "testWebhookModal",
		},
	],

	apiLogs: [
		{
			method: "POST",
			methodTone: "badgeS",
			endpoint: "/v1/charges/mpesa",
			status: "200",
			statusTone: "badgeS",
			time: "10:42:15 AM",
			ip: "192.168.1.45",
			source: "Node.js SDK",
		},
		{
			method: "GET",
			methodTone: "badgeI",
			endpoint: "/v1/customers/cus_9912",
			status: "200",
			statusTone: "badgeS",
			time: "10:41:03 AM",
			ip: "192.168.1.45",
			source: "cURL",
		},
		{
			method: "POST",
			methodTone: "badgeS",
			endpoint: "/v1/disbursements",
			status: "400",
			statusTone: "badgeD",
			time: "10:38:22 AM",
			ip: "192.168.1.102",
			source: "Python SDK",
		},
		{
			method: "GET",
			methodTone: "badgeI",
			endpoint: "/v1/balance",
			status: "200",
			statusTone: "badgeS",
			time: "10:30:00 AM",
			ip: "192.168.1.45",
			source: "Node.js SDK",
		},
		{
			method: "POST",
			methodTone: "badgeS",
			endpoint: "/v1/charges/card",
			status: "402",
			statusTone: "badgeW",
			time: "10:15:22 AM",
			ip: "10.0.0.5",
			source: "PHP SDK",
		},
	],

	quota: {
		plan: "Current Plan: Standard Tier",
		usedLabel: "45,210 / 100,000",
		usedPct: 45,
		rows: [
			{
				service: "M-Pesa Collections",
				usage: "1,240 txns",
				cost: "Standard MDR",
			},
			{
				service: "Identity Verifications",
				usage: "42 checks",
				cost: "KES 1,260",
			},
			{ service: "SMS Notifications", usage: "840 msg", cost: "KES 840" },
		],
		total: "KES 2,100",
	},

	whitelist: ["102.215.33.45", "45.33.22.0/24"],

	docsTopics: [
		"Authentication",
		"Charges API",
		"Transfers API",
		"Webhooks Events",
		"Error Codes",
	],

	versionInfo: {
		current: "v2024-08-15",
		latest: "v2025-06-01",
		changes: [
			"Added bank_code validation to Disbursement API",
			"New Pagination cursor format for List Endpoints",
			"Deprecated receipt_number in favor of transaction_ref in Webhooks",
		],
	},

	rateLimits: {
		tier: "Standard API",
		read: "100 req / sec",
		write: "50 req / sec",
	},
};

/** TanStack Query fetcher — swap the URL for the real service when ready. */
export async function fetchDeveloperDashboard(): Promise<DeveloperDashboardContent> {
	try {
		const res = await fetch("/api/dev/dashboard");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as DeveloperDashboardContent;
	} catch {
		return initialMockData;
	}
}
