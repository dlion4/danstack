/* ============================================================================
 * 4.10 API Governance, Versioning & Roadmap — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Extracted from 4.10.html: hero + 3 KPI cards, the version lifecycle table,
 * the 4 governance metric tiles, the 3-column kanban roadmap board, plus every
 * dataset the 21 modals need (changelog, linter findings, audit checklist,
 * benchmarks, feature requests, SDK targets).
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
export interface VersionRow {
	version: string;
	sub: string;
	status: string;
	tone: Tone;
	adoption: number;
	adoptionColor: string;
	sunset: string;
	sunsetDanger?: boolean;
	actionLabel: string;
	modal: string;
}
export interface GovTile {
	label: string;
	value: string;
	color: string;
	icon?: string;
	modal?: string;
}
export interface RoadmapCard {
	title: string;
	desc: string;
	badge: string;
	badgeTone?: Tone;
	votes?: number;
	progress?: number;
	progressColor?: string;
	modal: string;
	joinBeta?: boolean;
}
export interface KanbanCol {
	key: string;
	title: string;
	accent: string;
	cards: RoadmapCard[];
}
export interface ChangelogEntry {
	type: string;
	tone: Tone;
	text: string;
}
export interface LinterFinding {
	rule: string;
	severity: string;
	tone: Tone;
	path: string;
	message: string;
}
export interface AuditRule {
	rule: string;
	description: string;
	status: string;
	tone: Tone;
}
export interface BenchmarkRow {
	service: string;
	throughput: string;
	errorRate: string;
	uptime: string;
}
export interface FeatureRow {
	votes: number;
	feature: string;
	category: string;
	status: string;
	tone: Tone;
}
export interface AlertRow {
	title: string;
	text: string;
	bg: string;
	age: string;
}
export interface StatusRow {
	name: string;
	sub: string;
	status: string;
	tone: Tone;
}

export interface ApiGovernanceContent {
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
	}[];
	hero: {
		status: string;
		value: string;
		detail: string;
		actions: { label: string; modal: string }[];
	};
	versionsCard: {
		label: string;
		value: string;
		badge: string;
		bars: { label: string; pct: number; color: string }[];
	};
	governanceCard: {
		label: string;
		value: string;
		badge: string;
		facts: { label: string; value: string; color?: string }[];
		actionLabel: string;
		modal: string;
	};
	feedbackCard: {
		label: string;
		value: string;
		badge: string;
		topVoted: string;
		actionLabel: string;
		modal: string;
	};
	versions: VersionRow[];
	govTiles: GovTile[];
	kanban: KanbanCol[];
	changelog: ChangelogEntry[];
	linterFindings: LinterFinding[];
	auditRules: AuditRule[];
	benchmarks: BenchmarkRow[];
	featureRequests: FeatureRow[];
	sdkLanguages: string[];
	alerts: AlertRow[];
	statusServices: StatusRow[];
	specFormats: string[];
	versionOptions: string[];
}

export const initialMockData: ApiGovernanceContent = {
	pageCode: "PAGE 4.10",
	pageTitle: "API Governance, Versioning & Roadmap",
	pageSub:
		"Control API lifecycles, enforce design standards (OpenAPI 3.0), publish release notes, and track the developer roadmap.",
	breadcrumb: {
		parents: [
			{ label: "Developer Portal", to: "/dev" },
			{ label: "Operations", to: "/dev" },
		],
		current: "Governance & Roadmap",
	},

	header: {
		title: "API Governance & Roadmap",
		subtitle:
			"Manage API lifecycle, standards, versions, and product evolution",
		searchPlaceholder: "Search API endpoints, version docs, RFCs...",
		user: {
			name: "Sarah D.",
			role: "Lead Architect",
			initials: "SD",
			email: "sarah.d@paymo.dev",
		},
		actions: [
			{
				icon: "bi-activity",
				title: "System Status",
				modal: "healthCheckModal",
			},
			{
				icon: "bi-bell",
				title: "Alerts",
				modal: "developerAlertsModal",
				counter: 3,
			},
		],
	},

	pageActions: [
		{ label: "Export Spec", icon: "bi-download", modal: "exportSpecModal" },
		{
			label: "Audit Report",
			icon: "bi-shield-check",
			modal: "apiGovernanceAuditModal",
		},
		{
			label: "Publish Release",
			icon: "bi-rocket-takeoff",
			modal: "publishReleaseModal",
			primary: true,
		},
	],

	hero: {
		status: "API Gateway routing is optimal",
		value: "v2.4.1 (Current)",
		detail:
			"Handling 94% of all production traffic. v1 deprecation scheduled in 180 days.",
		actions: [
			{ label: "View Changelog", modal: "changelogDetailModal" },
			{ label: "Migration Docs", modal: "migrationGuideModal" },
			{ label: "Deprecate v1", modal: "deprecateVersionModal" },
		],
	},

	versionsCard: {
		label: "ACTIVE VERSIONS",
		value: "3 APIs",
		badge: "v1, v2, v3-beta",
		bars: [
			{ label: "v2.x Traffic", pct: 94, color: "var(--pm-info)" },
			{ label: "v1.x Traffic", pct: 6, color: "var(--pm-warning)" },
		],
	},

	governanceCard: {
		label: "GOVERNANCE COMPLIANCE",
		value: "98.5%",
		badge: "Passed OAS 3.0",
		facts: [
			{ label: "Linter Warnings", value: "12", color: "var(--pm-warning)" },
			{ label: "Breaking Changes", value: "0" },
		],
		actionLabel: "Run Linter",
		modal: "runLinterModal",
	},

	feedbackCard: {
		label: "COMMUNITY FEEDBACK",
		value: "142",
		badge: "Open Requests",
		topVoted: "GraphQL Support (89 votes)",
		actionLabel: "New Request",
		modal: "submitFeatureModal",
	},

	versions: [
		{
			version: "v3.0.0-beta",
			sub: "GraphQL + gRPC",
			status: "Beta",
			tone: "badgeP",
			adoption: 2,
			adoptionColor: "var(--pm-purple)",
			sunset: "—",
			actionLabel: "Manage Beta",
			modal: "enrollBetaModal",
		},
		{
			version: "v2.4.1",
			sub: "Current GA Release",
			status: "Active",
			tone: "badgeS",
			adoption: 94,
			adoptionColor: "var(--pm-accent)",
			sunset: "—",
			actionLabel: "Changelog",
			modal: "changelogDetailModal",
		},
		{
			version: "v1.8.4",
			sub: "Legacy API",
			status: "Deprecated",
			tone: "badgeW",
			adoption: 6,
			adoptionColor: "var(--pm-warning)",
			sunset: "Dec 31, 2026",
			sunsetDanger: true,
			actionLabel: "Headers",
			modal: "configureDeprecationModal",
		},
	],

	govTiles: [
		{
			label: "OAS 3.0 VALIDATION",
			value: "Passed",
			color: "var(--pm-accent)",
			icon: "bi-check-circle",
		},
		{ label: "DOC COVERAGE", value: "100%", color: "var(--pm-info)" },
		{ label: "CONTRACT TESTS", value: "482/482", color: "var(--pm-accent)" },
		{
			label: "P95 LATENCY",
			value: "112ms",
			color: "var(--pm-primary)",
			modal: "performanceBenchmarkModal",
		},
	],

	kanban: [
		{
			key: "review",
			title: "UNDER REVIEW (Votes)",
			accent: "var(--pm-purple)",
			cards: [
				{
					title: "GraphQL API Support",
					desc: "Reduce over-fetching on mobile apps.",
					badge: "89",
					votes: 89,
					modal: "featureDetailModal",
				},
				{
					title: "Idempotency Keys",
					desc: "Standardize across all POST endpoints.",
					badge: "54",
					votes: 54,
					modal: "featureDetailModal",
				},
				{
					title: "Ruby SDK",
					desc: "Official support for Ruby on Rails.",
					badge: "32",
					votes: 32,
					modal: "featureDetailModal",
				},
			],
		},
		{
			key: "planned",
			title: "PLANNED (Q3 2026)",
			accent: "var(--pm-info)",
			cards: [
				{
					title: "Webhooks v2",
					desc: "HMAC verification and automatic retries.",
					badge: "Q3",
					badgeTone: "badgeI",
					progress: 15,
					progressColor: "var(--pm-info)",
					modal: "roadmapItemModal",
				},
				{
					title: "Bulk Payroll Endpoints",
					desc: "Async processing for >10k employees.",
					badge: "Q3",
					badgeTone: "badgeI",
					progress: 5,
					progressColor: "var(--pm-info)",
					modal: "roadmapItemModal",
				},
			],
		},
		{
			key: "beta",
			title: "BETA / ROLLOUT",
			accent: "var(--pm-accent)",
			cards: [
				{
					title: "PesaLink B2B API",
					desc: "Real-time corporate bank transfers.",
					badge: "Beta",
					badgeTone: "badgeS",
					modal: "roadmapItemModal",
					joinBeta: true,
				},
				{
					title: "GoLang SDK v1.0",
					desc: "Release candidate available on GitHub.",
					badge: "RC1",
					badgeTone: "badgeS",
					modal: "roadmapItemModal",
				},
			],
		},
	],

	changelog: [
		{
			type: "Added",
			tone: "badgeS",
			text: "New `/v2/disbursements/bulk` endpoint for batch payouts.",
		},
		{
			type: "Added",
			tone: "badgeS",
			text: "`X-Request-Id` echoed on every response for tracing.",
		},
		{
			type: "Fixed",
			tone: "badgeI",
			text: "Pagination cursor no longer skips records on concurrent writes.",
		},
		{
			type: "Changed",
			tone: "badgeW",
			text: "Rate limit headers now use the IETF draft format.",
		},
		{
			type: "Deprecated",
			tone: "badgeD",
			text: "`receipt_number` is superseded by `transaction_ref`.",
		},
	],

	linterFindings: [
		{
			rule: "oas3-schema",
			severity: "Error",
			tone: "badgeD",
			path: "paths./v1/charges.post",
			message: "Missing 4xx response definition.",
		},
		{
			rule: "operation-description",
			severity: "Warning",
			tone: "badgeW",
			path: "paths./v1/balance.get",
			message: "Description shorter than 20 characters.",
		},
		{
			rule: "no-trailing-slash",
			severity: "Warning",
			tone: "badgeW",
			path: "paths./v1/customers/",
			message: "Path should not end with a slash.",
		},
		{
			rule: "camel-case-params",
			severity: "Info",
			tone: "badgeI",
			path: "components.parameters",
			message: "Prefer snake_case for query parameters.",
		},
	],

	auditRules: [
		{
			rule: "REST-01",
			description: "All resources use plural nouns",
			status: "Pass",
			tone: "badgeS",
		},
		{
			rule: "REST-02",
			description: "Correct HTTP verbs for each operation",
			status: "Pass",
			tone: "badgeS",
		},
		{
			rule: "DOC-01",
			description: "Every endpoint has a description and example",
			status: "Pass",
			tone: "badgeS",
		},
		{
			rule: "SEC-01",
			description: "All endpoints declare a security scheme",
			status: "Pass",
			tone: "badgeS",
		},
		{
			rule: "PERF-01",
			description: "List endpoints support pagination",
			status: "Warning",
			tone: "badgeW",
		},
		{
			rule: "VER-01",
			description: "No breaking change without a major bump",
			status: "Pass",
			tone: "badgeS",
		},
	],

	benchmarks: [
		{
			service: "Collections API",
			throughput: "1,240 TPS",
			errorRate: "0.02%",
			uptime: "99.99%",
		},
		{
			service: "Disbursements API",
			throughput: "860 TPS",
			errorRate: "0.04%",
			uptime: "99.98%",
		},
		{
			service: "Identity & KYC API",
			throughput: "420 TPS",
			errorRate: "0.11%",
			uptime: "99.95%",
		},
		{
			service: "Webhook Dispatcher",
			throughput: "2,100 TPS",
			errorRate: "0.15%",
			uptime: "99.90%",
		},
	],

	featureRequests: [
		{
			votes: 89,
			feature: "GraphQL API Support",
			category: "API Design",
			status: "Under Review",
			tone: "badgeP",
		},
		{
			votes: 54,
			feature: "Idempotency Keys everywhere",
			category: "Reliability",
			status: "Under Review",
			tone: "badgeP",
		},
		{
			votes: 41,
			feature: "Webhooks v2 with HMAC",
			category: "Webhooks",
			status: "Planned",
			tone: "badgeI",
		},
		{
			votes: 32,
			feature: "Ruby SDK",
			category: "SDKs",
			status: "Under Review",
			tone: "badgeP",
		},
		{
			votes: 28,
			feature: "PesaLink B2B API",
			category: "Payments",
			status: "Beta",
			tone: "badgeS",
		},
		{
			votes: 19,
			feature: "Sandbox data seeding",
			category: "Tooling",
			status: "Planned",
			tone: "badgeI",
		},
	],

	sdkLanguages: [
		"Node.js / TypeScript",
		"Python",
		"PHP",
		"Java",
		"Go",
		"Ruby",
		"C# / .NET",
	],

	alerts: [
		{
			title: "v1 Sunset in 180 days",
			text: "6% of traffic still on v1.8.4. Notify remaining consumers.",
			bg: "var(--pm-warning-soft)",
			age: "2 hours ago",
		},
		{
			title: "12 Linter Warnings",
			text: "Latest spec push introduced 3 new documentation warnings.",
			bg: "var(--pm-info-soft)",
			age: "1 day ago",
		},
		{
			title: "GraphQL request hit 89 votes",
			text: "Highest-voted community request this quarter.",
			bg: "var(--pm-purple-soft)",
			age: "3 days ago",
		},
	],

	statusServices: [
		{
			name: "API Gateway",
			sub: "Routing optimal",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Spec Registry",
			sub: "OAS 3.0 store",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Linter Service",
			sub: "12 open warnings",
			status: "Operational",
			tone: "badgeS",
		},
		{
			name: "Docs Portal",
			sub: "100% coverage",
			status: "Operational",
			tone: "badgeS",
		},
	],

	specFormats: [
		"OpenAPI 3.0 (YAML)",
		"OpenAPI 3.0 (JSON)",
		"Postman Collection",
		"AsyncAPI 2.6",
	],

	versionOptions: ["v3.0.0-beta", "v2.4.1 (Current)", "v1.8.4 (Deprecated)"],
};

export async function fetchApiGovernance(): Promise<ApiGovernanceContent> {
	try {
		const res = await fetch("/api/dev/api-governance");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as ApiGovernanceContent;
	} catch {
		return initialMockData;
	}
}
