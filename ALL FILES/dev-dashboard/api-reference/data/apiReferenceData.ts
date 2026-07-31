/* ============================================================================
 * 4.2 API Reference & Documentation — backend-ready content model.
 * ----------------------------------------------------------------------------
 * The legacy page hardcoded 13 endpoint rows, 4 log rows, 6 quick tools, 8
 * error codes, 4 SDK cards, 4 KYC magic values and 3 notifications directly in
 * the markup. All of it now lives here so the TSX is a pure skeleton and the
 * whole page can be driven by GET /api/dev/api-reference.
 * ========================================================================== */

export type Tone =
	| "badgeS"
	| "badgeW"
	| "badgeD"
	| "badgeI"
	| "badgeP"
	| "badgeNeutral";
export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface Crumb {
	label: string;
	to?: string;
}
export interface Endpoint {
	method: Method;
	path: string;
	title: string;
	desc: string;
}
export interface EndpointSection {
	id: string;
	icon: string;
	iconColor: string;
	title: string;
	sub: string;
	action?: { label: string; icon: string; modal: string };
	endpoints: Endpoint[];
}
export interface AppRow {
	name: string;
	status: string;
	tone: "live" | "testing";
}
export interface LogFeedItem {
	code: string;
	codeBg: string;
	codeColor: string;
	title: string;
	sub: string;
	modal: string;
}
export interface QuickTool {
	label: string;
	icon: string;
	color: string;
	modal: string;
}
export interface SupportAction {
	label: string;
	icon: string;
	color?: string;
	modal: string;
}
export interface ErrorCode {
	http: string;
	code: string;
	desc: string;
	action: string;
}
export interface SdkCard {
	name: string;
	icon: string;
	iconColor: string;
	install: string;
}
export interface KycMagic {
	id: string;
	result: string;
	tone: string;
	note: string;
}
export interface KeyRow {
	name: string;
	env: string;
	envTone: Tone;
	prefix: string;
	created: string;
	status: string;
	statusTone: Tone;
}
export interface WebhookEndpointRow {
	name: string;
	url: string;
	status: string;
	tone: Tone;
}
export interface WebhookLogRow {
	time: string;
	event: string;
	url: string;
	status: string;
	tone: Tone;
	response: string;
	retry?: boolean;
}
export interface ApiLogRow {
	time: string;
	method: string;
	path: string;
	status: string;
	tone: Tone;
	latency: string;
	ip: string;
}
export interface StatusRow {
	name: string;
	status: string;
	tone: Tone;
}
export interface NotificationRow {
	title: string;
	text: string;
	bg: string;
	color: string;
}
export interface IpRow {
	ip: string;
	label: string;
}

export interface ApiReferenceContent {
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	breadcrumb: { parents: Crumb[]; current: string };
	header: {
		title: string;
		subtitle: string;
		searchPlaceholder: string;
		user: { name: string; role: string; initials: string; email: string };
		actions: { icon: string; title: string; modal: string; counter?: number }[];
	};
	pageActions: {
		label: string;
		icon: string;
		modal: string;
		primary?: boolean;
		iconColor?: string;
	}[];
	hero: {
		status: string;
		value: string;
		detail: string;
		actions: { label: string; modal: string }[];
	};
	activeApps: { label: string; value: string; badge: string; rows: AppRow[] };
	errorRate: {
		label: string;
		value: string;
		badge: string;
		meterLabel: string;
		meterValue: string;
		pct: number;
	};
	webhookHealth: {
		label: string;
		value: string;
		badge: string;
		facts: { label: string; value: string }[];
		actionLabel: string;
		modal: string;
	};
	sections: EndpointSection[];
	quickTools: QuickTool[];
	recentLogs: LogFeedItem[];
	support: { title: string; blurb: string; actions: SupportAction[] };
	errorCodes: ErrorCode[];
	sdkCards: SdkCard[];
	plugins: { label: string; icon: string }[];
	kycMagic: KycMagic[];
	keys: KeyRow[];
	webhookEndpoints: WebhookEndpointRow[];
	webhookLogs: WebhookLogRow[];
	apiLogs: ApiLogRow[];
	systemStatus: { group: string; rows: StatusRow[] }[];
	notifications: NotificationRow[];
	ipWhitelist: IpRow[];
	slackChannels: string[];
}

export const initialMockData: ApiReferenceContent = {
	pageCode: "PAGE 4.2",
	pageTitle: "API Reference & Documentation",
	pageSub:
		"Extensive RESTful endpoints for Collections, Disbursements, KYC, Account Management, Webhooks, and Real-time Analytics.",
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/dev" },
			{ label: "Developer Portal", to: "/dev" },
		],
		current: "API Reference",
	},

	header: {
		title: "Developer Portal",
		subtitle: "APIs, SDKs, Webhooks, Sandbox & Integration Tools",
		searchPlaceholder: "Search endpoints, guides, webhooks, error codes...",
		user: {
			name: "John S.",
			role: "Lead Engineer",
			initials: "JS",
			email: "john.smith@company.com",
		},
		actions: [
			{
				icon: "bi-activity",
				title: "System Health",
				modal: "healthStatusModal",
			},
			{ icon: "bi-key", title: "API Keys", modal: "apiKeysModal" },
			{
				icon: "bi-bell",
				title: "Notifications",
				modal: "notificationsModal",
				counter: 3,
			},
		],
	},

	pageActions: [
		{
			label: "Sandbox: Active",
			icon: "bi-toggle-on",
			modal: "envToggleModal",
			iconColor: "var(--pm-accent)",
		},
		{
			label: "Postman Collection",
			icon: "bi-box-arrow-in-down",
			modal: "postmanModal",
		},
		{
			label: "Create App",
			icon: "bi-plus-lg",
			modal: "createAppModal",
			primary: true,
		},
	],

	hero: {
		status: "API Gateway is Operational",
		value: "2.4M Req / 30d",
		detail: "99.99% Uptime across all production and sandbox endpoints.",
		actions: [
			{ label: "API Keys", modal: "apiKeysModal" },
			{ label: "Webhooks", modal: "webhookSetupModal" },
			{ label: "Security", modal: "ipWhitelistModal" },
		],
	},

	activeApps: {
		label: "ACTIVE APPS",
		value: "3",
		badge: "Production Ready",
		rows: [
			{ name: "E-Commerce", status: "Live", tone: "live" },
			{ name: "Payroll App", status: "Live", tone: "live" },
			{ name: "Internal POS", status: "Testing", tone: "testing" },
		],
	},

	errorRate: {
		label: "API ERROR RATE",
		value: "0.04%",
		badge: "Target < 1%",
		meterLabel: "Rate Limit Hits",
		meterValue: "12 today",
		pct: 12,
	},

	webhookHealth: {
		label: "WEBHOOK DELIVERY",
		value: "99.8%",
		badge: "5 retries pending",
		facts: [
			{ label: "Avg Latency", value: "340ms" },
			{ label: "Endpoint health", value: "Good" },
		],
		actionLabel: "View Logs",
		modal: "webhookLogsModal",
	},

	sections: [
		{
			id: "4.2.1",
			icon: "bi-wallet2",
			iconColor: "var(--pm-primary)",
			title: "4.2.1 — Core APIs (Payments & Disbursements)",
			sub: "Endpoints for Collections (PayBill, Till, Card) and Payouts (B2C, B2B, Bank transfers).",
			action: {
				label: "Auth Guide",
				icon: "bi-shield-lock",
				modal: "authGuideModal",
			},
			endpoints: [
				{
					method: "POST",
					path: "/v1/collections/stk-push",
					title: "Initiate M-Pesa STK Push",
					desc: "Trigger a prompt on the customer's phone to enter their M-Pesa PIN.",
				},
				{
					method: "POST",
					path: "/v1/collections/card/charge",
					title: "Process Card Payment",
					desc: "Charge a tokenized card or process a new 3D Secure card transaction.",
				},
				{
					method: "GET",
					path: "/v1/collections/{tx_ref}/status",
					title: "Check Transaction Status",
					desc: "Retrieve the real-time status of a specific collection attempt.",
				},
				{
					method: "POST",
					path: "/v1/disbursements/b2c",
					title: "Bulk B2C Disbursement",
					desc: "Send money from business wallet to one or multiple mobile numbers.",
				},
				{
					method: "POST",
					path: "/v1/disbursements/pesalink",
					title: "PesaLink Bank Transfer",
					desc: "Instant bank transfer to any of the 50+ supported Kenyan banks.",
				},
			],
		},
		{
			id: "4.2.2",
			icon: "bi-person-badge",
			iconColor: "var(--pm-accent)",
			title: "4.2.2 — Identity, KYC & Account APIs",
			sub: "Customer verification, business KYB, account balance, and sub-wallet creation.",
			action: {
				label: "KYC Simulator",
				icon: "bi-magic",
				modal: "kycSimModal",
			},
			endpoints: [
				{
					method: "POST",
					path: "/v1/identity/verify-id",
					title: "Verify National ID / Passport",
					desc: "Validate Kenyan National ID or Passport via IPRS integrated check.",
				},
				{
					method: "POST",
					path: "/v1/identity/verify-kra",
					title: "Verify KRA PIN",
					desc: "Verify individual or corporate KRA PIN against iTax records.",
				},
				{
					method: "GET",
					path: "/v1/accounts/balance",
					title: "Get Wallet Balance",
					desc: "Fetch real-time available, pending, and reserved balances.",
				},
				{
					method: "POST",
					path: "/v1/accounts/sub-wallet",
					title: "Create Virtual Account",
					desc: "Provision a segregated sub-wallet for specific funds management.",
				},
			],
		},
		{
			id: "4.2.3",
			icon: "bi-activity",
			iconColor: "var(--pm-purple)",
			title: "4.2.3 & 4.2.4 — Webhooks, Data & Analytics APIs",
			sub: "Event catalog, real-time transaction streaming, and historical data exports.",
			action: {
				label: "Export Data",
				icon: "bi-download",
				modal: "analyticsExportModal",
			},
			endpoints: [
				{
					method: "POST",
					path: "/v1/webhooks/register",
					title: "Register Webhook URL",
					desc: "Register a new HTTPS endpoint to receive event payloads.",
				},
				{
					method: "GET",
					path: "/v1/analytics/transactions",
					title: "Query Transaction History",
					desc: "Paginated query with advanced filters (date, status, metadata).",
				},
				{
					method: "GET",
					path: "/v1/analytics/summary",
					title: "Aggregated Metrics",
					desc: "Get volume, success rates, and spend by category.",
				},
				{
					method: "GET",
					path: "/v1/reports/reconciliation",
					title: "Settlement & Reconciliation",
					desc: "Download daily settlement files and matching rules data.",
				},
			],
		},
	],

	quickTools: [
		{
			label: "API Keys",
			icon: "bi-key",
			color: "var(--pm-warning)",
			modal: "apiKeysModal",
		},
		{
			label: "Webhooks",
			icon: "bi-broadcast",
			color: "var(--pm-info)",
			modal: "webhookSetupModal",
		},
		{
			label: "IP Whitelist",
			icon: "bi-shield-check",
			color: "var(--pm-accent)",
			modal: "ipWhitelistModal",
		},
		{
			label: "API Console",
			icon: "bi-terminal",
			color: "var(--pm-purple)",
			modal: "testConsoleModal",
		},
		{
			label: "Error Codes",
			icon: "bi-bug",
			color: "var(--pm-danger)",
			modal: "errorCodesModal",
		},
		{
			label: "SDKs",
			icon: "bi-box-seam",
			color: "var(--pm-primary)",
			modal: "sdkModal",
		},
	],

	recentLogs: [
		{
			code: "200",
			codeBg: "var(--pm-accent-soft)",
			codeColor: "var(--pm-accent)",
			title: "POST /v1/collections/stk-push",
			sub: "2 mins ago · 142ms · IP 192.168.1.1",
			modal: "logDetailModal",
		},
		{
			code: "401",
			codeBg: "var(--pm-danger-soft)",
			codeColor: "var(--pm-danger)",
			title: "GET /v1/accounts/balance",
			sub: "15 mins ago · Invalid Signature",
			modal: "logDetailModal",
		},
		{
			code: "200",
			codeBg: "var(--pm-accent-soft)",
			codeColor: "var(--pm-accent)",
			title: "POST /v1/webhooks/trigger",
			sub: "1 hr ago · payment.success event",
			modal: "logDetailModal",
		},
		{
			code: "429",
			codeBg: "var(--pm-warning-soft)",
			codeColor: "var(--pm-warning)",
			title: "GET /v1/analytics/transactions",
			sub: "2 hrs ago · Rate limit exceeded",
			modal: "logDetailModal",
		},
	],

	support: {
		title: "Integration Support",
		blurb:
			"Need help with your implementation? Our Developer Success team is available.",
		actions: [
			{
				label: "Open Support Ticket",
				icon: "bi-ticket-detailed",
				modal: "supportTicketModal",
			},
			{
				label: "Join Slack Community",
				icon: "bi-slack",
				color: "var(--pm-primary)",
				modal: "slackCommunityModal",
			},
			{
				label: "Request Arch Review",
				icon: "bi-diagram-3",
				modal: "archReviewModal",
			},
		],
	},

	errorCodes: [
		{
			http: "400",
			code: "bad_request",
			desc: "Validation failed for one or more fields.",
			action: "Check errors array in response.",
		},
		{
			http: "401",
			code: "unauthorized",
			desc: "Invalid API key or signature.",
			action: "Verify your Bearer token.",
		},
		{
			http: "402",
			code: "insufficient_funds",
			desc: "Wallet balance is too low for disbursement.",
			action: "Top-up wallet via portal.",
		},
		{
			http: "404",
			code: "not_found",
			desc: "The requested resource does not exist.",
			action: "Check ID or URL path.",
		},
		{
			http: "409",
			code: "duplicate_reference",
			desc: "Idempotency key or reference reused.",
			action: "Use a unique reference per transaction.",
		},
		{
			http: "429",
			code: "rate_limit_exceeded",
			desc: "Too many requests within the time window.",
			action: "Implement exponential backoff.",
		},
		{
			http: "500",
			code: "internal_error",
			desc: "PayMo server encountered an issue.",
			action: "Retry later or check status page.",
		},
		{
			http: "503",
			code: "provider_error",
			desc: "Downstream provider (e.g. M-Pesa) is down.",
			action: "Retry with exponential backoff.",
		},
	],

	sdkCards: [
		{
			name: "Node.js / TypeScript",
			icon: "bi-filetype-js",
			iconColor: "var(--pm-warning)",
			install: "npm install paymo-node",
		},
		{
			name: "Python",
			icon: "bi-filetype-py",
			iconColor: "var(--pm-info)",
			install: "pip install paymo-python",
		},
		{
			name: "PHP",
			icon: "bi-filetype-php",
			iconColor: "var(--pm-purple)",
			install: "composer require paymo/paymo-php",
		},
		{
			name: "Java / Android",
			icon: "bi-filetype-java",
			iconColor: "var(--pm-danger)",
			install: "implementation 'com.paymo:sdk:2.1.0'",
		},
	],

	plugins: [
		{ label: "WooCommerce", icon: "bi-wordpress" },
		{ label: "Shopify", icon: "bi-shop" },
		{ label: "Magento", icon: "bi-cart" },
	],

	kycMagic: [
		{
			id: "11111111",
			result: "Success",
			tone: "var(--pm-accent)",
			note: "(Valid ID, returns mock data)",
		},
		{
			id: "22222222",
			result: "Failed",
			tone: "var(--pm-danger)",
			note: "(ID not found in IPRS)",
		},
		{
			id: "33333333",
			result: "Timeout",
			tone: "var(--pm-warning)",
			note: "(Simulates IPRS downtime)",
		},
		{
			id: "44444444",
			result: "Fraud",
			tone: "var(--pm-danger)",
			note: "(Flagged on watchlist)",
		},
	],

	keys: [
		{
			name: "Main Production App",
			env: "Live",
			envTone: "badgeS",
			prefix: "pk_live_8f2...",
			created: "12 Mar 2024",
			status: "Active",
			statusTone: "badgeS",
		},
		{
			name: "Testing Sandbox",
			env: "Test",
			envTone: "badgeI",
			prefix: "pk_test_1a9...",
			created: "01 Jun 2025",
			status: "Active",
			statusTone: "badgeS",
		},
	],

	webhookEndpoints: [
		{
			name: "Main Listener",
			url: "https://api.merchant.com/webhooks/paymo",
			status: "Active",
			tone: "badgeS",
		},
		{
			name: "Staging Listener",
			url: "https://staging.merchant.com/webhooks/paymo",
			status: "Failing",
			tone: "badgeW",
		},
	],

	webhookLogs: [
		{
			time: "27 Jun, 14:32:01",
			event: "payment.success",
			url: ".../webhooks/paymo",
			status: "Delivered",
			tone: "badgeS",
			response: "HTTP 200",
		},
		{
			time: "27 Jun, 14:28:15",
			event: "payment.success",
			url: ".../webhooks/paymo",
			status: "Delivered",
			tone: "badgeS",
			response: "HTTP 200",
		},
		{
			time: "27 Jun, 13:15:44",
			event: "disbursement.completed",
			url: ".../webhooks/paymo",
			status: "Failed",
			tone: "badgeD",
			response: "HTTP 500",
			retry: true,
		},
		{
			time: "27 Jun, 12:01:22",
			event: "payment.failed",
			url: ".../webhooks/paymo",
			status: "Delivered",
			tone: "badgeS",
			response: "HTTP 200",
		},
	],

	apiLogs: [
		{
			time: "14:32:01",
			method: "POST",
			path: "/v1/collections/stk-push",
			status: "200",
			tone: "badgeS",
			latency: "142ms",
			ip: "192.168.1.1",
		},
		{
			time: "14:28:15",
			method: "GET",
			path: "/v1/accounts/balance",
			status: "200",
			tone: "badgeS",
			latency: "85ms",
			ip: "192.168.1.1",
		},
		{
			time: "14:15:22",
			method: "POST",
			path: "/v1/disbursements/b2c",
			status: "401",
			tone: "badgeD",
			latency: "42ms",
			ip: "10.0.0.45",
		},
		{
			time: "13:45:09",
			method: "GET",
			path: "/v1/analytics/transactions",
			status: "429",
			tone: "badgeW",
			latency: "11ms",
			ip: "192.168.1.2",
		},
		{
			time: "13:10:00",
			method: "POST",
			path: "/v1/collections/card/charge",
			status: "200",
			tone: "badgeS",
			latency: "890ms",
			ip: "192.168.1.1",
		},
	],

	systemStatus: [
		{
			group: "API Services",
			rows: [
				{ name: "Core Payments API", status: "Operational", tone: "badgeS" },
				{ name: "Disbursements API", status: "Operational", tone: "badgeS" },
				{ name: "Identity & KYC API", status: "Operational", tone: "badgeS" },
				{
					name: "Webhook Delivery Engine",
					status: "Operational",
					tone: "badgeS",
				},
			],
		},
		{
			group: "Downstream Providers",
			rows: [
				{
					name: "Safaricom M-Pesa (C2B/B2C)",
					status: "Operational",
					tone: "badgeS",
				},
				{
					name: "PesaLink Transfer Network",
					status: "Operational",
					tone: "badgeS",
				},
				{
					name: "IPRS Identity Verification",
					status: "Degraded Performance",
					tone: "badgeW",
				},
			],
		},
	],

	notifications: [
		{
			title: "Webhook Delivery Failing",
			text: "Endpoint /webhooks/paymo returned HTTP 500 for 5 consecutive events. Auto-retry in effect.",
			bg: "var(--pm-danger-soft)",
			color: "#7F1D1D",
		},
		{
			title: "New API Version Available",
			text: "v2 Collections API is now in open beta. Check the docs for migration details.",
			bg: "var(--pm-info-soft)",
			color: "#1E40AF",
		},
		{
			title: "Scheduled Maintenance",
			text: "M-Pesa downstream maintenance expected on Sunday 2:00 AM – 4:00 AM EAT.",
			bg: "var(--pm-warning-soft)",
			color: "#92400E",
		},
	],

	ipWhitelist: [
		{ ip: "198.51.100.14", label: "Main Server" },
		{ ip: "203.0.113.0/24", label: "AWS VPC Block" },
	],

	slackChannels: [
		"#api-announcements",
		"#integration-help",
		"#feature-requests",
	],
};

export async function fetchApiReference(): Promise<ApiReferenceContent> {
	try {
		const res = await fetch("/api/dev/api-reference");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as ApiReferenceContent;
	} catch {
		return initialMockData;
	}
}
