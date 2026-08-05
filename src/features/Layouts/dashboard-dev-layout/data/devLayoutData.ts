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
export type ToastTone = "success" | "danger" | "warning" | "info";
export type AsideKind = "apiExplorer" | "systemStatus" | "apiKeys" | "securityTab" | "envTab";

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
	brand: {
		name: "Paymo Dev",
		tag: "v2025",
		initials: "PM",
		icon: "bi-terminal",
	},

	user: {
		name: "John Dev",
		role: "Tech Lead",
		email: "john@paymo.dev",
		initials: "JD",
	},

	navGroups: [
		{
			title: "Main",
			items: [
				{ key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
			],
		},
		{
			title: "Integration",
			items: [
				{ key: "api-governance", label: "API Governance", icon: "bi-shield-check" },
				{ key: "api-reference", label: "API Reference", icon: "bi-book" },
				{ key: "playground", label: "Playground", icon: "bi-code-square" },
				{ key: "sdks", label: "SDKs", icon: "bi-journal-text" },
				{ key: "webhooks-events", label: "Webhooks & Events", icon: "bi-broadcast" },
			],
		},
		{
			title: "Monitoring",
			items: [
				{
					key: "monitoring-incidents",
					label: "Monitoring & Incidents",
					icon: "bi-activity",
				},
			],
		},
		{
			title: "Security & Compliance",
			items: [
				{ key: "compliance-audit", label: "Compliance & Audit", icon: "bi-clipboard-check" },
				{
					key: "integration-architecture",
					label: "Integration Architecture",
					icon: "bi-diagram-3",
				},
				{ key: "security", label: "Security", icon: "bi-shield-lock" },
			],
		},
		{
			title: "Ecosystem",
			items: [
				{ key: "partner-marketplace", label: "Partner Marketplace", icon: "bi-shop" },
				{ key: "support-slas", label: "Support & SLAs", icon: "bi-headset" },
			],
		},
	],

	notifications: [
		{
			id: 1,
			icon: "bi-x-circle",
			tone: "danger",
			title: "Webhook Failed",
			desc: "Endpoint: https://api.client.com/hooks timed out.",
			time: "5m",
			unread: true,
		},
		{
			id: 2,
			icon: "bi-exclamation-triangle",
			tone: "warning",
			title: "API Limit Warning",
			desc: "Sandbox limit at 80% consumed.",
			time: "30m",
			unread: true,
		},
		{
			id: 3,
			icon: "bi-check-circle",
			tone: "success",
			title: "Deploy Successful",
			desc: "SDK v4.2.0 published to npm.",
			time: "2h",
			unread: false,
		},
	],

	modules: [
		{
			key: "dashboard",
			label: "Dashboard",
			icon: "bi-speedometer2",
			pill: "DEVELOPER HOME",
			titlePre: "Build, ship & monitor ",
			titleAccent: "from one console.",
			copy: "Keys, endpoints, logs and infrastructure for your Paymo integration — unified in a single sandbox-aware developer workspace.",
			c1: "#6366f1",
			c2: "#4338ca",
			stats: [
				{ label: "API keys", value: "6" },
				{ label: "Requests (24h)", value: "48.2K", delta: "+12%", up: true },
				{ label: "Error rate", value: "0.4%", delta: "-0.1%", up: true },
				{ label: "p95 latency", value: "189ms" },
			],
			features: [
				{ icon: "bi-key", text: "Provision and rotate scoped API keys" },
				{ icon: "bi-terminal", text: "Test endpoints live in the API Explorer" },
				{ icon: "bi-activity", text: "Stream request logs and error insights" },
				{ icon: "bi-broadcast", text: "Manage webhooks and delivery health" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "New API key", tone: "primary" },
				{ icon: "bi-terminal", label: "Open Explorer", tone: "ghost" },
			],
		},
		{
			key: "api-governance",
			label: "API Governance",
			icon: "bi-shield-check",
			pill: "STANDARDS",
			titlePre: "Governed APIs, ",
			titleAccent: "from day one.",
			copy: "Naming, versioning, schemas and breaking-change policies enforced across every Paymo endpoint you consume.",
			c1: "#10b981",
			c2: "#059669",
			stats: [
				{ label: "Endpoints", value: "124" },
				{ label: "Versions", value: "3" },
				{ label: "Breaking changes", value: "0" },
				{ label: "Schema lint", value: "100%" },
			],
			features: [
				{ icon: "bi-signpost-split", text: "Versioning and deprecation policies" },
				{ icon: "bi-braces", text: "Validated OpenAPI schemas" },
				{ icon: "bi-file-diff", text: "Changelogs and migration guides" },
				{ icon: "bi-shield-check", text: "Compliance with API standards" },
			],
			actions: [
				{ icon: "bi-book", label: "Read standards", tone: "primary" },
				{ icon: "bi-journal-text", label: "Changelog", tone: "ghost" },
			],
		},
		{
			key: "api-reference",
			label: "API Reference",
			icon: "bi-book",
			pill: "DOCS",
			titlePre: "Every endpoint, ",
			titleAccent: "documented.",
			copy: "Interactive reference for all Paymo endpoints with request bodies, responses and copy-paste examples.",
			c1: "#8b5cf6",
			c2: "#6366f1",
			stats: [
				{ label: "Endpoints", value: "124" },
				{ label: "Examples", value: "96" },
				{ label: "Languages", value: "6" },
				{ label: "Updated", value: "Today" },
			],
			features: [
				{ icon: "bi-braces", text: "Auto-generated request bodies from schema" },
				{ icon: "bi-collection", text: "Endpoint groups by product area" },
				{ icon: "bi-clipboard", text: "Export to cURL, Node, Python & Go" },
				{ icon: "bi-search", text: "Full-text search across the reference" },
			],
			actions: [
				{ icon: "bi-play-fill", label: "Try endpoint", tone: "primary" },
				{ icon: "bi-download", label: "OpenAPI spec", tone: "ghost" },
			],
		},
		{
			key: "playground",
			label: "Playground",
			icon: "bi-code-square",
			pill: "SANDBOX",
			titlePre: "Prototype flows ",
			titleAccent: "in seconds.",
			copy: "Spin up sandbox accounts, cards and transfers to validate your integration end-to-end.",
			c1: "#06b6d4",
			c2: "#3b82f6",
			stats: [
				{ label: "Sandbox accounts", value: "5" },
				{ label: "Test cards", value: "12" },
				{ label: "Simulated txns", value: "340" },
				{ label: "Scenarios", value: "9" },
			],
			features: [
				{ icon: "bi-person-plus", text: "Create sandbox customers on demand" },
				{ icon: "bi-credit-card", text: "Issue test cards with fixed outcomes" },
				{ icon: "bi-lightning-charge", text: "Trigger webhook events manually" },
				{ icon: "bi-arrow-repeat", text: "Reset the sandbox in one click" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "New scenario", tone: "primary" },
				{ icon: "bi-arrow-clockwise", label: "Reset sandbox", tone: "ghost" },
			],
		},
		{
			key: "sdks",
			label: "SDKs",
			icon: "bi-journal-text",
			pill: "LIBRARIES",
			titlePre: "Official SDKs, ",
			titleAccent: "always current.",
			copy: "Drop-in clients for every major stack with typed models and built-in retries.",
			c1: "#3b82f6",
			c2: "#6366f1",
			stats: [
				{ label: "Languages", value: "6" },
				{ label: "Latest", value: "v4.2.0" },
				{ label: "Downloads/mo", value: "84K" },
				{ label: "Open issues", value: "2" },
			],
			features: [
				{ icon: "bi-braces", text: "Fully typed Node, Python, Go, Java, PHP, Ruby" },
				{ icon: "bi-arrow-repeat", text: "Idempotency and retries built in" },
				{ icon: "bi-book", text: "Copy-paste examples per endpoint" },
				{ icon: "bi-github", text: "Open source with changelogs" },
			],
			actions: [
				{ icon: "bi-download", label: "Install SDK", tone: "primary" },
				{ icon: "bi-book", label: "Read docs", tone: "ghost" },
			],
		},
		{
			key: "webhooks-events",
			label: "Webhooks & Events",
			icon: "bi-broadcast",
			pill: "EVENTS",
			titlePre: "Webhooks that ",
			titleAccent: "just deliver.",
			copy: "Subscribe to events, replay failures and monitor delivery health across endpoints.",
			c1: "#ec4899",
			c2: "#8b5cf6",
			stats: [
				{ label: "Endpoints", value: "7" },
				{ label: "Delivered (24h)", value: "12.4K" },
				{ label: "Failed", value: "3" },
				{ label: "Success rate", value: "99.8%" },
			],
			features: [
				{ icon: "bi-bell", text: "Subscribe to 40+ event types" },
				{ icon: "bi-arrow-clockwise", text: "Automatic retries with backoff" },
				{ icon: "bi-lock", text: "Signed payloads for verification" },
				{ icon: "bi-send", text: "One-click replay of any event" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Add endpoint", tone: "primary" },
				{ icon: "bi-arrow-repeat", label: "Replay failed", tone: "ghost" },
			],
		},
		{
			key: "monitoring-incidents",
			label: "Monitoring & Incidents",
			icon: "bi-activity",
			pill: "OBSERVABILITY",
			titlePre: "Uptime & incidents, ",
			titleAccent: "in one view.",
			copy: "Service health, request telemetry and incident timelines so you know the moment anything degrades.",
			c1: "#14b8a6",
			c2: "#10b981",
			stats: [
				{ label: "Uptime (30d)", value: "99.98%" },
				{ label: "Incidents", value: "0" },
				{ label: "Avg response", value: "142ms" },
				{ label: "Last incident", value: "12d ago" },
			],
			features: [
				{ icon: "bi-heart-pulse", text: "Service and endpoint health checks" },
				{ icon: "bi-exclamation-triangle", text: "Incident timeline with statuses" },
				{ icon: "bi-bell", text: "Proactive alerting to email and Slack" },
				{ icon: "bi-clock-history", text: "Resolution history and postmortems" },
			],
			actions: [
				{ icon: "bi-bell", label: "Create alert", tone: "primary" },
				{ icon: "bi-clock-history", label: "Incident history", tone: "ghost" },
			],
		},
		{
			key: "compliance-audit",
			label: "Compliance & Audit",
			icon: "bi-clipboard-check",
			pill: "AUDIT",
			titlePre: "Audit-ready, ",
			titleAccent: "always.",
			copy: "Certifications, data-handling attestations and a searchable audit log of every action on your workspace.",
			c1: "#0ea5e9",
			c2: "#3b82f6",
			stats: [
				{ label: "Certifications", value: "4" },
				{ label: "Audit events", value: "1.2K" },
				{ label: "Open findings", value: "0" },
				{ label: "Last review", value: "2d ago" },
			],
			features: [
				{ icon: "bi-award", text: "SOC 2, ISO 27001 and PCI attestations" },
				{ icon: "bi-journal-text", text: "Immutable audit trail of every action" },
				{ icon: "bi-file-earmark-lock", text: "Data-processing and retention docs" },
				{ icon: "bi-download", text: "Export audit reports for review" },
			],
			actions: [
				{ icon: "bi-journal-text", label: "Open audit log", tone: "primary" },
				{ icon: "bi-download", label: "Export report", tone: "ghost" },
			],
		},
		{
			key: "integration-architecture",
			label: "Integration Architecture",
			icon: "bi-diagram-3",
			pill: "BLUEPRINT",
			titlePre: "Your architecture, ",
			titleAccent: "mapped.",
			copy: "Diagrams and guidance for connecting Paymo to your stack — flows, auth, retries and failure handling.",
			c1: "#6366f1",
			c2: "#8b5cf6",
			stats: [
				{ label: "Patterns", value: "9" },
				{ label: "Auth options", value: "3" },
				{ label: "Reference apps", value: "5" },
				{ label: "Updated", value: "1w ago" },
			],
			features: [
				{ icon: "bi-diagram-3", text: "End-to-end integration blueprints" },
				{ icon: "bi-shield-lock", text: "Auth: API keys, OAuth and mTLS" },
				{ icon: "bi-arrow-repeat", text: "Idempotency and retry guidance" },
				{ icon: "bi-collection", text: "Reference apps for common stacks" },
			],
			actions: [
				{ icon: "bi-diagram-3", label: "View blueprints", tone: "primary" },
				{ icon: "bi-book", label: "Read guide", tone: "ghost" },
			],
		},
		{
			key: "security",
			label: "Security",
			icon: "bi-shield-lock",
			pill: "SECURITY",
			titlePre: "Security, ",
			titleAccent: "by design.",
			copy: "Scoped keys, IP allow-lists, payload signing and best-practice hardening for every request you send.",
			c1: "#ef4444",
			c2: "#f59e0b",
			stats: [
				{ label: "Keys", value: "6" },
				{ label: "IP allow-lists", value: "2" },
				{ label: "Signing", value: "On" },
				{ label: "2FA", value: "On" },
			],
			features: [
				{ icon: "bi-key", text: "Least-privilege scoped API keys" },
				{ icon: "bi-hdd-network", text: "Per-key IP allow-lists" },
				{ icon: "bi-lock", text: "Payload signing and verification" },
				{ icon: "bi-shield-lock", text: "Workspace 2FA enforcement" },
			],
			actions: [
				{ icon: "bi-key", label: "Manage keys", tone: "primary" },
				{ icon: "bi-shield-lock", label: "Hardening guide", tone: "ghost" },
			],
		},
		{
			key: "partner-marketplace",
			label: "Partner Marketplace",
			icon: "bi-shop",
			pill: "PARTNERS",
			titlePre: "Find the right ",
			titleAccent: "partner tools.",
			copy: "Discover vetted integrations, consultants and tools built for the Paymo ecosystem.",
			c1: "#f59e0b",
			c2: "#f97316",
			stats: [
				{ label: "Listings", value: "48" },
				{ label: "Categories", value: "9" },
				{ label: "Featured", value: "6" },
				{ label: "New this month", value: "4" },
			],
			features: [
				{ icon: "bi-shop", text: "Browse vetted partner listings" },
				{ icon: "bi-star", text: "Community ratings and reviews" },
				{ icon: "bi-plug", text: "One-click install connectors" },
				{ icon: "bi-handshake", text: "Verified consultants and agencies" },
			],
			actions: [
				{ icon: "bi-search", label: "Browse marketplace", tone: "primary" },
				{ icon: "bi-shop", label: "List your tool", tone: "ghost" },
			],
		},
		{
			key: "support-slas",
			label: "Support & SLAs",
			icon: "bi-headset",
			pill: "SUPPORT",
			titlePre: "Support that ",
			titleAccent: "answers fast.",
			copy: "Open cases, response-time SLAs and status updates — everything you need to get unblocked.",
			c1: "#3b82f6",
			c2: "#6366f1",
			stats: [
				{ label: "Open cases", value: "2" },
				{ label: "SLA response", value: "< 4h" },
				{ label: "Satisfaction", value: "98%" },
				{ label: "Status", value: "All systems go" },
			],
			features: [
				{ icon: "bi-life-preserver", text: "Priority support with SLAs" },
				{ icon: "bi-chat-dots", text: "Case threads with engineers" },
				{ icon: "bi-activity", text: "Live service status and incidents" },
				{ icon: "bi-journal-text", text: "Knowledge base and troubleshooting" },
			],
			actions: [
				{ icon: "bi-plus-lg", label: "Open a case", tone: "primary" },
				{ icon: "bi-activity", label: "Service status", tone: "ghost" },
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
		const response = await fetch("/api/dev-layout-content", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok)
			throw new Error(`Dev layout API responded HTTP ${response.status}`);
		return (await response.json()) as DevLayoutContent;
	} catch {
		return initialMockData;
	}
}

/* --------------------------------------------------------------------------
 * Helpers shared across dev layout components.
 * ------------------------------------------------------------------------ */

export const cx = (
	...parts: Array<string | false | null | undefined>
): string => parts.filter(Boolean).join(" ");

export function findModule(content: DevLayoutContent, key: string): ModuleDef {
	return content.modules.find((m) => m.key === key) ?? content.modules[0];
}
