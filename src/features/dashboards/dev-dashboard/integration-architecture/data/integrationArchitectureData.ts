/* ============================================================================
 * 4.7 Integration Architecture & Patterns — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Extracted out of the 4.7.html skeleton: 4 KPI cards, 4 integration-pattern
 * cards, 3 enterprise topology panels, the performance/scalability table, plus
 * every option list used by the 25 modals.
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
export interface KpiCard {
	key: string;
	col: string;
	accent?: boolean;
	label: string;
	labelColor: string;
	value: string;
	valueSize?: number;
	badge: { tone: Tone; icon: string; text: string };
	note?: string;
	meter?: { pct: number; color: string };
}
export interface PatternCard {
	key: string;
	icon: string;
	iconBg: string;
	title: string;
	desc: string;
	actions: { label: string; modal: string }[];
}
export interface TopologyRow {
	label: string;
	value: string;
	tone?: Tone;
	strong?: boolean;
}
export interface TopologyPanel {
	key: string;
	icon: string;
	title: string;
	titleColor: string;
	desc: string;
	rows: TopologyRow[];
	actions: { label: string; modal: string; full?: boolean }[];
}
export interface PerfRow {
	component: string;
	icon: string;
	iconColor: string;
	strategy: string;
	status: string;
	statusTone: Tone;
	throughput: string;
	actions: { label: string; modal: string }[];
}
export interface SoapMapping {
	operation: string;
	rest: string[];
}

export interface IntegrationArchitectureContent {
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	breadcrumb: { parents: Crumb[]; current: string };
	header: {
		title: string;
		subtitle: string;
		searchPlaceholder: string;
		user: { name: string; role: string; initials: string };
		actions: { icon: string; title: string; modal: string }[];
	};
	pageActions: {
		label: string;
		icon: string;
		modal: string;
		primary?: boolean;
		iconColor?: string;
	}[];
	kpis: KpiCard[];
	patterns: PatternCard[];
	topology: TopologyPanel[];
	perfRows: PerfRow[];
	soapMappings: SoapMapping[];
	drRegions: { name: string; state: "active" | "passive"; tone: string }[];
	stacks: { key: string; label: string; icon: string; color: string }[];
	boilerplateOptions: {
		deployment: string[];
		database: string[];
		features: { label: string; on: boolean }[];
	};
	statusServices: { name: string; sub: string; status: string; tone: Tone }[];
}

export const initialMockData: IntegrationArchitectureContent = {
	pageCode: "",
	pageTitle: "Integration Architecture & Patterns",
	pageSub:
		"Define how your systems connect to PayMo via direct APIs, embedded checkouts, microservices, or legacy translators.",
	breadcrumb: {
		parents: [
			{ label: "Developer Portal", to: "/dev" },
			{ label: "Guides", to: "/dev" },
		],
		current: "Architecture",
	},

	header: {
		title: "Integration Architecture & Patterns",
		subtitle:
			"System topologies, integration methods, and scalability frameworks for PayMo BaaS",
		searchPlaceholder: "Search architecture patterns, caching, mesh...",
		user: { name: "Dev Lead", role: "System Architect", initials: "DL" },
		actions: [
			{
				icon: "bi-heart-pulse",
				title: "API Status",
				modal: "healthCheckModal",
			},
			{
				icon: "bi-shield-exclamation",
				title: "DR Monitor",
				modal: "drMonitorModal",
			},
		],
	},

	pageActions: [
		{
			label: "Arch Guide",
			icon: "bi-download",
			modal: "archGuideModal",
			iconColor: "var(--pm-primary)",
		},
		{
			label: "Test Simulator",
			icon: "bi-bug",
			modal: "testIntegrationModal",
			iconColor: "var(--pm-warning)",
		},
		{
			label: "Gen Boilerplate",
			icon: "bi-code-slash",
			modal: "boilerplateModal",
			primary: true,
		},
	],

	kpis: [
		{
			key: "pattern",
			col: "col-lg-3 col-6",
			accent: true,
			label: "ACTIVE PATTERN",
			labelColor: "rgba(255,255,255,.8)",
			value: "Hybrid Sync",
			valueSize: 22,
			badge: { tone: "badgeS", icon: "bi-check-circle", text: "Online" },
			note: "API + Webhooks + Offline Queue",
		},
		{
			key: "sla",
			col: "col-lg-3 col-6",
			label: "API SLA HEALTH",
			labelColor: "var(--pm-accent)",
			value: "99.99%",
			badge: { tone: "badgeI", icon: "bi-activity", text: "p95 < 200ms" },
			meter: { pct: 99.99, color: "var(--pm-accent)" },
		},
		{
			key: "cache",
			col: "col-lg-3 col-6",
			label: "CACHE HIT RATE",
			labelColor: "var(--pm-warning)",
			value: "84.2%",
			badge: { tone: "badgeW", icon: "bi-lightning", text: "Redis Edge" },
			note: "Saved ~1.2M backend queries today",
		},
		{
			key: "mesh",
			col: "col-lg-3 col-6",
			label: "MESH NODES",
			labelColor: "var(--pm-purple)",
			value: "12 Active",
			badge: { tone: "badgeP", icon: "bi-diagram-2", text: "gRPC Connected" },
			note: "Cross-region availability group",
		},
	],

	patterns: [
		{
			key: "direct",
			icon: "bi-hdd-network",
			iconBg: "var(--pm-primary)",
			title: "Direct API",
			desc: "RESTful server-to-server calls. Includes webhook listeners, idempotency, and fallback polling.",
			actions: [
				{ label: "Configure", modal: "directApiModal" },
				{ label: "Webhooks", modal: "webhookConfigModal" },
			],
		},
		{
			key: "embedded",
			icon: "bi-window-sidebar",
			iconBg: "var(--pm-info)",
			title: "Embedded Checkout",
			desc: "iFrame, Popups, or Redirects. Reduces PCI scope while maintaining UX.",
			actions: [
				{ label: "Customize Checkout", modal: "embeddedCheckoutModal" },
			],
		},
		{
			key: "whitelabel",
			icon: "bi-palette",
			iconBg: "var(--pm-purple)",
			title: "White-Label",
			desc: "Fully branded payment pages, emails, SMS, and custom domains mapping.",
			actions: [{ label: "Theme & Domain", modal: "whiteLabelModal" }],
		},
		{
			key: "hybrid",
			icon: "bi-shuffle",
			iconBg: "var(--pm-accent)",
			title: "Hybrid Setup",
			desc: "Mix API + SDK. Offline queueing, bulk background processing.",
			actions: [{ label: "Sync Settings", modal: "hybridSyncModal" }],
		},
	],

	topology: [
		{
			key: "mesh",
			icon: "bi-boxes",
			title: "Microservices Mesh",
			titleColor: "var(--pm-purple)",
			desc: "Integrate PayMo via sidecar proxies. gRPC support enabled.",
			rows: [
				{ label: "Istio/Envoy Proxy", value: "Active", tone: "badgeS" },
				{ label: "Event-driven triggers", value: "Kafka", tone: "badgeI" },
			],
			actions: [
				{ label: "Mesh Config", modal: "meshConfigModal" },
				{ label: "gRPC Specs", modal: "grpcSetupModal" },
				{ label: "Circuit Breakers", modal: "circuitBreakerModal", full: true },
			],
		},
		{
			key: "legacy",
			icon: "bi-device-hdd",
			title: "Legacy Integrations",
			titleColor: "var(--pm-danger)",
			desc: "Bridges for older systems (SOAP, File-drop, AS400).",
			rows: [
				{ label: "SOAP to REST Bridge", value: "Configured", tone: "badgeW" },
				{ label: "SFTP Batch Drops", value: "CSV/XML", tone: "badgeP" },
			],
			actions: [
				{ label: "SOAP Translator", modal: "soapTranslatorModal" },
				{ label: "SFTP Config", modal: "fileIntegrationModal" },
				{
					label: "Database Sync Rules",
					modal: "legacyDbSyncModal",
					full: true,
				},
			],
		},
		{
			key: "tenant",
			icon: "bi-diagram-3-fill",
			title: "Multi-Tenant SaaS",
			titleColor: "var(--pm-accent)",
			desc: "Manage multiple distinct businesses under a single master API token.",
			rows: [
				{ label: "Tenant Isolation", value: "Strict", tone: "badgeS" },
				{ label: "Active Tenants", value: "142", strong: true },
			],
			actions: [
				{
					label: "Tenant Data Policies",
					modal: "tenantIsolationModal",
					full: true,
				},
				{
					label: "Cert Pinning Security",
					modal: "certPinningModal",
					full: true,
				},
			],
		},
	],

	perfRows: [
		{
			component: "Caching",
			icon: "bi-memory",
			iconColor: "var(--pm-info)",
			strategy: "Edge response caching (Redis)",
			status: "Active",
			statusTone: "badgeS",
			throughput: "TTL 300s · Assets 24h",
			actions: [
				{ label: "Rules", modal: "cacheStrategyModal" },
				{ label: "CDN", modal: "cdnSetupModal" },
			],
		},
		{
			component: "Throttling",
			icon: "bi-sign-stop",
			iconColor: "var(--pm-warning)",
			strategy: "Token-bucket client rate limit",
			status: "Monitoring",
			statusTone: "badgeW",
			throughput: "1000 req/sec per token",
			actions: [{ label: "Limit Params", modal: "rateLimitModal" }],
		},
		{
			component: "Load Balancing",
			icon: "bi-router",
			iconColor: "var(--pm-purple)",
			strategy: "Geo-routed active-active",
			status: "Healthy",
			statusTone: "badgeS",
			throughput: "3 Availability Zones",
			actions: [{ label: "Routes", modal: "lbIntegrationModal" }],
		},
		{
			component: "Disaster Recovery",
			icon: "bi-life-preserver",
			iconColor: "var(--pm-danger)",
			strategy: "Cross-region failover",
			status: "Ready",
			statusTone: "badgeI",
			throughput: "RTO < 5m · RPO < 1s",
			actions: [{ label: "Test DR", modal: "drMonitorModal" }],
		},
	],

	soapMappings: [
		{ operation: "doFundTransfer", rest: ["POST /v1/disbursements"] },
		{ operation: "checkAccountBal", rest: ["GET /v1/wallet/balance"] },
	],

	drRegions: [
		{ name: "Nairobi (Active)", state: "active", tone: "var(--pm-primary)" },
		{ name: "Mombasa (Active)", state: "active", tone: "var(--pm-info)" },
		{ name: "Cape Town (Passive)", state: "passive", tone: "var(--pm-muted)" },
	],

	stacks: [
		{
			key: "node",
			label: "Node.js",
			icon: "bi-filetype-js",
			color: "var(--pm-accent)",
		},
		{
			key: "python",
			label: "Python",
			icon: "bi-filetype-py",
			color: "var(--pm-warning)",
		},
		{
			key: "java",
			label: "Java/Spring",
			icon: "bi-filetype-java",
			color: "var(--pm-danger)",
		},
	],

	boilerplateOptions: {
		deployment: [
			"Serverless (AWS Lambda / Cloud Functions)",
			"Microservices (Docker / K8s ready)",
			"Monolithic Backend",
		],
		database: ["PostgreSQL", "MongoDB", "None (Stateless proxy)"],
		features: [
			{ label: "Include Direct API Auth (HMAC)", on: true },
			{ label: "Include Webhook Listener with signature validation", on: true },
			{ label: "Include Embedded Checkout HTML snippet", on: false },
			{ label: "Include Idempotency caching middleware (Redis)", on: false },
		],
	},

	statusServices: [
		{
			name: "Core API Gateway",
			sub: "Uptime 99.99%",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Webhook Delivery",
			sub: "Latency < 2s",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Edge Cache (Redis)",
			sub: "Hit rate 84.2%",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Service Mesh",
			sub: "12 nodes healthy",
			status: "Operational",
			tone: "badgeS",
		},
	],
};

export async function fetchIntegrationArchitecture(): Promise<IntegrationArchitectureContent> {
	try {
		const res = await fetch("/api/dev/integration-architecture");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as IntegrationArchitectureContent;
	} catch {
		return initialMockData;
	}
}
