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
export type ToastTone = "success" | "danger" | "warning" | "info";
export type AsideKind = "security" | "limits" | "cardProgram" | "securityTab" | "apiKeysTab";

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
	tone: "primary" | "success" | "warning" | "danger";
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
	status: "active" | "warning";
	statusText: string;
}

export interface ApiHealthRow {
	service: string;
	status: "active" | "warning";
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
	tone?: "primary" | "ghost";
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
	brand: {
		name: "Paymo",
		tag: "Cards",
		initials: "PM",
		icon: "bi-credit-card-2-front",
	},

	user: {
		name: "James K.",
		role: "Card Admin",
		email: "james@paymo.co",
		initials: "JK",
	},

	navGroups: [
		{
			title: "Intelligence & Control",
			items: [
				{ key: "card-command-center", label: "Command Center", icon: "bi-cpu" },
				{
					key: "card-overview",
					label: "Overview",
					icon: "bi-speedometer2",
				},
				{
					key: "card-analytics-reporting",
					label: "Analytics",
					icon: "bi-bar-chart-line",
				},
			],
		},
		{
			title: "Issuance & Products",
			items: [
				{
					key: "virtual-debit-cards",
					label: "Virtual Debit",
					icon: "bi-credit-card",
				},
				{
					key: "virtual-credit-cards",
					label: "Virtual Credit",
					icon: "bi-credit-card-2-front",
				},
				{
					key: "physical-debit-cards",
					label: "Physical Debit",
					icon: "bi-credit-card-2-front-fill",
				},
				{
					key: "prepaid-card-management",
					label: "Prepaid Cards",
					icon: "bi-wallet2",
				},
				{
					key: "corporate-business-cards",
					label: "Corporate Cards",
					icon: "bi-building",
				},
			],
		},
		{
			title: "Program Management",
			items: [
				{
					key: "card-program-administration",
					label: "Program Admin",
					icon: "bi-shield-check",
				},
				{
					key: "card-security-fraud-prevention",
					label: "Fraud Prevention",
					icon: "bi-shield-lock",
				},
			],
		},
		{
			title: "Settings & Support",
			items: [
				{
					key: "account-settings",
					label: "Settings",
					icon: "bi-gear",
				},
				{ key: "support", label: "Support", icon: "bi-headset" },
			],
		},
	],

	notifications: [
		{
			id: 1,
			icon: "bi-credit-card",
			tone: "primary",
			title: "New card issued",
			desc: "Virtual card for John Doe",
			time: "5m",
			unread: true,
		},
		{
			id: 2,
			icon: "bi-currency-dollar",
			tone: "success",
			title: "Settlement received",
			desc: "KES 2.84M settled to operating wallet.",
			time: "15m",
			unread: true,
		},
		{
			id: 3,
			icon: "bi-shield-check",
			tone: "warning",
			title: "New login from Safari",
			desc: "If this was not you, review sessions.",
			time: "1h",
			unread: true,
		},
		{
			id: 4,
			icon: "bi-arrow-left-right",
			tone: "danger",
			title: "Payment declined",
			desc: "12 transactions need retry.",
			time: "3h",
			unread: false,
		},
	],

	accounts: [
		{
			id: "ACC-8X29-KL4",
			name: "Operating Account",
			role: "Primary",
			primary: true,
		},
		{ id: "ACC-2P91-MNQ", name: "Developer Sandbox", role: "Test" },
		{ id: "ACC-7L44-XYZ", name: "Treasury Reserve", role: "Restricted" },
	],

	security: {
		twoFactorOn: true,
		sessions: [
			{
				device: "Chrome · Windows",
				meta: "Nairobi, KE",
				status: "active",
				statusText: "Now",
			},
			{
				device: "Safari · iPhone",
				meta: "Mombasa, KE",
				status: "active",
				statusText: "Now",
			},
			{
				device: "Firefox · macOS",
				meta: "New York, US",
				status: "warning",
				statusText: "2h ago",
			},
		],
	},

	developers: {
		sandboxOn: false,
		health: [
			{ service: "Cards API", status: "active", statusText: "Operational" },
			{ service: "Webhooks", status: "warning", statusText: "Degraded" },
			{
				service: "Settlement API",
				status: "active",
				statusText: "Operational",
			},
		],
	},

	// Module marketing blocks — one definition per routed module so the home
	// grid and /cards/app/<module> destinations always resolve real content.
	modules: [
		{
			key: "card-overview",
			label: "Card Overview",
			icon: "bi-speedometer2",
			pill: "OPERATING OVERVIEW",
			titlePre: "Your cards, ",
			titleAccent: "at a glance.",
			copy: "All cards, spend, limits and live risk signals unified into one real-time view.",
			c1: "#2ee6a0",
			c2: "#7cf5c8",
			stats: [
				{ label: "Active cards", value: "14", delta: "+2 this week", up: true },
				{ label: "Spend (30d)", value: "KES 96K", delta: "8.4%", up: true },
				{ label: "Blocked", value: "2" },
				{ label: "Auth rate", value: "98.1%", delta: "0.3%", up: true },
			],
			features: [
				{ icon: "bi-lightning-charge", text: "Real-time card monitoring across all networks" },
				{ icon: "bi-shield-check", text: "Live fraud and compliance signals on every transaction" },
				{ icon: "bi-cash-coin", text: "Multi-currency settlement with T+0 liquidity windows" },
				{ icon: "bi-bell", text: "Threshold alerts the moment a transaction lands" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Issue card", tone: "primary" },
				{ icon: "bi-download", label: "Export statement", tone: "ghost" },
			],
		},
		{
			key: "card-command-center",
			label: "Command Center",
			icon: "bi-cpu",
			pill: "OPERATIONS",
			titlePre: "Command, ",
			titleAccent: "center stage.",
			copy: "Monitor all card operations, health and incidents from one pane.",
			c1: "#a78bfa",
			c2: "#2ee6a0",
			stats: [
				{ label: "Cards online", value: "13 / 14" },
				{ label: "Incidents", value: "0" },
				{ label: "Latency", value: "42ms", delta: "12ms", up: false },
				{ label: "Uptime", value: "99.98%" },
			],
			features: [
				{ icon: "bi-cpu", text: "Unified card operations dashboard" },
				{ icon: "bi-shield-check", text: "Real-time fraud monitoring" },
				{ icon: "bi-graph-up-arrow", text: "Performance and latency analytics" },
				{ icon: "bi-bell", text: "Instant incident alerts" },
			],
			actions: [
				{ icon: "bi-arrow-clockwise", label: "Refresh status", tone: "primary" },
				{ icon: "bi-download", label: "Export ops log", tone: "ghost" },
			],
		},
		{
			key: "virtual-debit-cards",
			label: "Virtual Debit",
			icon: "bi-credit-card",
			pill: "DEBIT",
			titlePre: "Debit cards, ",
			titleAccent: "instant.",
			copy: "Provision virtual debit cards with spend limits and instant freeze controls.",
			c1: "#60a5fa",
			c2: "#2ee6a0",
			stats: [
				{ label: "Active", value: "8", delta: "+2 this month", up: true },
				{ label: "Spend (30d)", value: "KES 45K" },
				{ label: "Blocked", value: "1" },
				{ label: "Auth rate", value: "97.5%", delta: "0.6%", up: true },
			],
			features: [
				{ icon: "bi-credit-card-2-back", text: "Single-use and reusable virtual debit cards" },
				{ icon: "bi-slash-circle", text: "Merchant category and country locks" },
				{ icon: "bi-snow", text: "Instant freeze and unfreeze per card" },
				{ icon: "bi-bell", text: "Real-time authorization and decline alerts" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Issue card", tone: "primary" },
				{ icon: "bi-gear", label: "Card policies", tone: "ghost" },
			],
		},
		{
			key: "virtual-credit-cards",
			label: "Virtual Credit",
			icon: "bi-credit-card-2-front",
			pill: "CREDIT",
			titlePre: "Credit cards, ",
			titleAccent: "in seconds.",
			copy: "Provision virtual credit cards with configurable limits and controls.",
			c1: "#fb7185",
			c2: "#a78bfa",
			stats: [
				{ label: "Active", value: "6", delta: "+1 this month", up: true },
				{ label: "Spend (30d)", value: "KES 51K" },
				{ label: "Blocked", value: "1" },
				{ label: "Auth rate", value: "98.7%", delta: "0.2%", up: true },
			],
			features: [
				{ icon: "bi-credit-card-2-front", text: "Virtual credit with revolving balance" },
				{ icon: "bi-slash-circle", text: "Merchant locks and spend controls" },
				{ icon: "bi-snow", text: "Instant freeze per card" },
				{ icon: "bi-bell", text: "Authorization alerts" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Issue card", tone: "primary" },
				{ icon: "bi-gear", label: "Card policies", tone: "ghost" },
			],
		},
		{
			key: "physical-debit-cards",
			label: "Physical Debit",
			icon: "bi-credit-card-2-back",
			pill: "PLASTIC",
			titlePre: "Physical cards, ",
			titleAccent: "delivered.",
			copy: "Order, personalize and track physical debit cards end to end.",
			c1: "#22c55e",
			c2: "#2ee6a0",
			stats: [
				{ label: "Active", value: "6", delta: "+1 this week", up: true },
				{ label: "In delivery", value: "3" },
				{ label: "Lost / stolen", value: "0" },
				{ label: "Avg delivery", value: "3.2d" },
			],
			features: [
				{ icon: "bi-truck", text: "Tracked delivery across Kenya" },
				{ icon: "bi-palette", text: "Name and design personalization" },
				{ icon: "bi-shield-lock", text: "Chip + PIN with 3D Secure" },
				{ icon: "bi-bell", text: "Delivery and activation alerts" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Order card", tone: "primary" },
				{ icon: "bi-geo-alt", label: "Track delivery", tone: "ghost" },
			],
		},
		{
			key: "prepaid-card-management",
			label: "Prepaid Cards",
			icon: "bi-wallet2",
			pill: "PREPAID",
			titlePre: "Prepaid cards, ",
			titleAccent: "load & go.",
			copy: "Issue and reload prepaid cards with top-up limits and spend visibility.",
			c1: "#fbbf24",
			c2: "#2ee6a0",
			stats: [
				{ label: "Active", value: "5" },
				{ label: "Balance held", value: "KES 32K" },
				{ label: "Reloads (30d)", value: "41", delta: "12%", up: true },
				{ label: "Expiring soon", value: "1" },
			],
			features: [
				{ icon: "bi-arrow-repeat", text: "Instant wallet and M-Pesa reloads" },
				{ icon: "bi-sliders", text: "Top-up and velocity limits per card" },
				{ icon: "bi-graph-up", text: "Per-card balance and spend tracking" },
				{ icon: "bi-bell", text: "Low-balance and expiry alerts" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Issue card", tone: "primary" },
				{ icon: "bi-arrow-repeat", label: "Reload card", tone: "ghost" },
			],
		},
		{
			key: "corporate-business-cards",
			label: "Corporate Cards",
			icon: "bi-briefcase",
			pill: "TEAM SPEND",
			titlePre: "Team cards, ",
			titleAccent: "controlled.",
			copy: "Issue employee cards with role-based limits and consolidated billing.",
			c1: "#38bdf8",
			c2: "#a78bfa",
			stats: [
				{ label: "Cards issued", value: "9", delta: "+3 this month", up: true },
				{ label: "Employees", value: "7" },
				{ label: "Monthly limit", value: "KES 300K" },
				{ label: "Policy breaches", value: "0" },
			],
			features: [
				{ icon: "bi-people", text: "Employee onboarding and offboarding" },
				{ icon: "bi-sliders", text: "Role-based spend and category limits" },
				{ icon: "bi-receipt", text: "Consolidated billing and statements" },
				{ icon: "bi-shield-check", text: "Receipt capture and policy checks" },
			],
			actions: [
				{ icon: "bi-person-plus", label: "Issue employee card", tone: "primary" },
				{ icon: "bi-download", label: "Export billing", tone: "ghost" },
			],
		},
		{
			key: "card-security-fraud-prevention",
			label: "Fraud Prevention",
			icon: "bi-shield-lock",
			pill: "RISK",
			titlePre: "Security, ",
			titleAccent: "always on.",
			copy: "Freeze, lock and monitor every card with live fraud rules and 3D Secure.",
			c1: "#f87171",
			c2: "#fbbf24",
			stats: [
				{ label: "Rules active", value: "12" },
				{ label: "Blocked today", value: "2" },
				{ label: "3DS coverage", value: "100%" },
				{ label: "False positives", value: "0.4%" },
			],
			features: [
				{ icon: "bi-snow", text: "Instant freeze and unfreeze" },
				{ icon: "bi-shield-exclamation", text: "Velocity, merchant and country rules" },
				{ icon: "bi-phone", text: "3D Secure on every transaction" },
				{ icon: "bi-bell", text: "Compromise and alert workflows" },
			],
			actions: [
				{ icon: "bi-shield-exclamation", label: "Report compromised", tone: "primary" },
				{ icon: "bi-sliders", label: "Edit rules", tone: "ghost" },
			],
		},
		{
			key: "card-analytics-reporting",
			label: "Analytics",
			icon: "bi-bar-chart",
			pill: "INSIGHTS",
			titlePre: "Spend data, ",
			titleAccent: "decoded.",
			copy: "Issuance, spend and decline analytics with exportable reports.",
			c1: "#a78bfa",
			c2: "#60a5fa",
			stats: [
				{ label: "Issued MTD", value: "142", delta: "18%", up: true },
				{ label: "Spend MTD", value: "KES 96K" },
				{ label: "Decline rate", value: "1.9%", delta: "0.4%", up: false },
				{ label: "Reports run", value: "38" },
			],
			features: [
				{ icon: "bi-bar-chart", text: "Spend, issuance and usage trends" },
				{ icon: "bi-graph-down", text: "Decline and fraud analytics" },
				{ icon: "bi-download", text: "CSV, PDF and scheduled exports" },
				{ icon: "bi-clock-history", text: "Month-over-month comparisons" },
			],
			actions: [
				{ icon: "bi-download", label: "Export report", tone: "primary" },
				{ icon: "bi-calendar2-check", label: "Schedule report", tone: "ghost" },
			],
		},
		{
			key: "card-program-administration",
			label: "Program Admin",
			icon: "bi-gear",
			pill: "CONFIGURATION",
			titlePre: "Program settings, ",
			titleAccent: "your way.",
			copy: "Card program branding, limits, fees and issuer configuration.",
			c1: "#7cf5c8",
			c2: "#2ee6a0",
			stats: [
				{ label: "Program", value: "Paymo Platinum" },
				{ label: "Issuer", value: "Visa" },
				{ label: "Cards issued", value: "1,240" },
				{ label: "Status", value: "Active" },
			],
			features: [
				{ icon: "bi-palette", text: "Custom card branding and colors" },
				{ icon: "bi-gear", text: "Issuer and network configuration" },
				{ icon: "bi-sliders", text: "Program-wide limit templates" },
				{ icon: "bi-bell", text: "Program notification preferences" },
			],
			actions: [
				{ icon: "bi-check-lg", label: "Save changes", tone: "primary" },
				{ icon: "bi-arrow-counterclockwise", label: "Reset", tone: "ghost" },
			],
		},
		{
			key: "card-settings-support",
			label: "Settings",
			icon: "bi-sliders",
			pill: "PREFERENCES",
			titlePre: "Defaults & support, ",
			titleAccent: "tuned.",
			copy: "Card defaults, notifications, statements and 24/7 support.",
			c1: "#60a5fa",
			c2: "#2ee6a0",
			stats: [
				{ label: "Default limit", value: "KES 50K" },
				{ label: "Channels", value: "3" },
				{ label: "Tickets open", value: "1" },
				{ label: "First reply", value: "47s" },
			],
			features: [
				{ icon: "bi-sliders", text: "Default card limits and behaviour" },
				{ icon: "bi-bell", text: "Notification channel preferences" },
				{ icon: "bi-file-earmark-text", text: "Statement frequency and format" },
				{ icon: "bi-headset", text: "24/7 priority support desk" },
			],
			actions: [
				{ icon: "bi-check-lg", label: "Save changes", tone: "primary" },
				{ icon: "bi-headset", label: "Contact support", tone: "ghost" },
			],
		},
	],
};

/* --------------------------------------------------------------------------
 * Left drawer data — session info, auth items, policy links.
 * ------------------------------------------------------------------------ */
export interface SessionInfo {
	ip: string;
	location: string;
	device: string;
	lastLogin: string;
}

export interface AuthItem {
	key: string;
	label: string;
	icon: string;
	status: "set" | "not-set";
	action: string;
	statusLabel: string;
}

export interface PolicyLink {
	key: string;
	label: string;
	icon: string;
}


export interface LinkedAccount {
	key: string;
	label: string;
	icon: string;
	linked: boolean;
	id?: string;
}
export interface LeftDrawerData {
	session: SessionInfo;
	authItems: AuthItem[];
	policies: PolicyLink[];
}


/* --------------------------------------------------------------------------
 * Linked Accounts — for the header Accounts dropdown.
 * ------------------------------------------------------------------------ */
export const linkedAccounts: LinkedAccount[] = [
	{ key: "primary", label: "Primary Account", icon: "bi-person-circle", linked: true, id: "ACC-2942-019" },
	{ key: "business", label: "Business Account", icon: "bi-briefcase", linked: false },
	{ key: "utility", label: "Utility Account", icon: "bi-lightning-charge", linked: false },
	{ key: "developer", label: "Developer Account", icon: "bi-code-slash", linked: true, id: "DEV-8818-042" },
	{ key: "savings", label: "Savings Account", icon: "bi-piggy-bank", linked: false },
];
export const leftDrawerData: LeftDrawerData = {
	session: {
		ip: "192.168.1.42",
		location: "Nairobi, Kenya",
		device: "Chrome on macOS",
		lastLogin: "2 Aug 2026, 09:14 EAT",
	},
	authItems: [
		{ key: "2fa", label: "Two-Factor Authentication", icon: "bi-shield-lock", status: "not-set", action: "Set Now", statusLabel: "Not set" },
		{ key: "password", label: "Password", icon: "bi-key", status: "set", action: "Change", statusLabel: "Last changed 14d ago" },
		{ key: "pin", label: "Transaction PIN", icon: "bi-pin-angle", status: "set", action: "Manage", statusLabel: "Active" },
		{ key: "passkeys", label: "Passkeys", icon: "bi-fingerprint", status: "not-set", action: "Add", statusLabel: "Not set" },
	],
	policies: [
		{ key: "privacy", label: "Privacy Policy", icon: "bi-shield-check" },
		{ key: "aml", label: "AML Policy", icon: "bi-file-earmark-text" },
		{ key: "terms", label: "Terms of Service", icon: "bi-journal-text" },
		{ key: "cookies", label: "Cookie Policy", icon: "bi-cookie" },
	],
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
		const response = await fetch("/api/cards-layout-content", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok)
			throw new Error(`Cards layout API responded HTTP ${response.status}`);
		return (await response.json()) as CardsLayoutContent;
	} catch {
		return initialMockData;
	}
}

/* --------------------------------------------------------------------------
 * Helpers shared across cards layout components.
 * ------------------------------------------------------------------------ */

export const cx = (
	...parts: Array<string | false | null | undefined>
): string => parts.filter(Boolean).join(" ");

export function findModule(
	content: CardsLayoutContent,
	key: string,
): ModuleDef {
	return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
