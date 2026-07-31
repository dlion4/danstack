/* ============================================================================
 * 4.8 Monitoring, Alerting & Incident Management — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Extracted from 4.8.html: 4 hero KPIs, active alerts, recent incidents,
 * 8 quick actions, the core-subsystem table, external dependencies, alert
 * rules, on-call board, live log tail and the observability tool tiles.
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
export interface MiniBar {
	height: string;
	color: string;
}
export interface HeroStat {
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
	facts?: { label: string; value: string }[];
}
export interface FeedRow {
	tag: string;
	icon?: string;
	bg: string;
	color: string;
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
	danger?: boolean;
}
export interface QuickAction {
	label: string;
	icon: string;
	color: string;
	modal: string;
}
export interface SubsystemRow {
	name: string;
	status: string;
	tone: Tone;
	uptime: string;
	latency: string;
	trend: "flat" | "down" | "up";
}
export interface DependencyRow {
	name: string;
	sub: string;
	status: string;
	tone: Tone;
}
export interface AlertRuleRow {
	name: string;
	condition: string;
	severity: string;
	severityTone: Tone;
	channelIcon: string;
	channelColor: string;
	status: string;
	statusTone: Tone;
}
export interface LogRow {
	text: string;
	level: "info" | "warn" | "error";
}
export interface ToolTile {
	title: string;
	sub: string;
	icon: string;
	color: string;
	modal: string;
}
export interface OnCall {
	l1: string;
	l2: string;
	pagerDuty: string;
}
export interface IncidentRow {
	id: string;
	title: string;
	date: string;
	severity: string;
	status: string;
	tone: Tone;
}
export interface SpanRow {
	span: string;
	duration: string;
	pct: string;
	impact: string;
	tone: Tone;
}
export interface DlqRow {
	eventId: string;
	type: string;
	attempts: string;
	lastError: string;
}
export interface ChannelRow {
	name: string;
	detail: string;
	icon: string;
	color: string;
	connected: boolean;
}

export interface MonitoringIncidentsContent {
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	breadcrumb: { parents: Crumb[]; current: string };
	header: {
		title: string;
		subtitle: string;
		projects: string[];
		user: { name: string; role: string; initials: string; email: string };
		actions: {
			icon: string;
			title: string;
			modal: string;
			counter?: number;
			counterColor?: string;
		}[];
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
	heroStats: HeroStat[];
	activeAlerts: FeedRow[];
	recentIncidents: FeedRow[];
	quickActions: QuickAction[];
	subsystems: SubsystemRow[];
	dependencies: DependencyRow[];
	alertRules: AlertRuleRow[];
	onCall: OnCall;
	logLines: LogRow[];
	tools: ToolTile[];
	incidents: IncidentRow[];
	spans: SpanRow[];
	dlqRows: DlqRow[];
	channels: ChannelRow[];
	statusServices: {
		name: string;
		status: string;
		tone: Tone;
		uptime: string;
	}[];
	alertHistory: { title: string; text: string; bg: string; age: string }[];
}

export const initialMockData: MonitoringIncidentsContent = {
	pageCode: "PAGE 4.8",
	pageTitle: "Monitoring, Alerting & Incident Management",
	pageSub:
		"Real-time API health, distributed tracing, developer alerts, ELK log aggregation, and PagerDuty integration.",
	breadcrumb: {
		parents: [
			{ label: "Developer Portal", to: "/dev" },
			{ label: "Technical Operations", to: "/dev" },
		],
		current: "Monitoring & Alerting",
	},

	header: {
		title: "Developer Portal",
		subtitle: "APIs, Integration & Technical Operations",
		projects: [
			"Production — Core API",
			"Sandbox — Test Env",
			"Staging — E-Commerce v2",
			"+ Manage Projects",
		],
		user: {
			name: "John D.",
			role: "Lead Engineer",
			initials: "JD",
			email: "john.d@paymo.dev",
		},
		actions: [
			{
				icon: "bi-envelope-paper",
				title: "Status Updates",
				modal: "statusSubscriptionModal",
			},
			{
				icon: "bi-exclamation-triangle",
				title: "Active Incidents",
				modal: "incidentWarRoomModal",
				counter: 1,
				counterColor: "var(--pm-warning)",
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
		{
			label: "Status Page",
			icon: "bi-check-circle",
			modal: "systemStatusModal",
			iconColor: "var(--pm-accent)",
		},
		{
			label: "Live Logs",
			icon: "bi-journal-code",
			modal: "centralizedLogModal",
		},
		{
			label: "Tracing",
			icon: "bi-diagram-3",
			modal: "traceVisualizationModal",
			iconColor: "var(--pm-purple)",
		},
		{
			label: "New Alert Rule",
			icon: "bi-plus-lg",
			modal: "addAlertRuleModal",
			primary: true,
		},
	],

	hero: {
		status: "Global API Status ● Operational",
		value: "99.98% Uptime",
		detail:
			"Trailing 30 days across all production endpoints. API latency is stable.",
		actions: [
			{ label: "View Status", modal: "systemStatusModal" },
			{ label: "Post-mortems", modal: "incidentPostmortemModal" },
			{ label: "Dependencies", modal: "dependencyHealthModal" },
		],
	},

	heroStats: [
		{
			key: "latency",
			col: "col-lg-2 col-md-4 col-6",
			label: "API LATENCY (p95)",
			labelColor: "var(--pm-info)",
			value: "184",
			unit: "ms",
			badge: {
				tone: "badgeS",
				icon: "bi-graph-down-arrow",
				text: "-12ms vs yesterday",
			},
			miniBars: [
				{ height: "60%", color: "var(--pm-primary)" },
				{ height: "65%", color: "var(--pm-primary)" },
				{ height: "85%", color: "var(--pm-warning)" },
				{ height: "62%", color: "var(--pm-primary)" },
				{ height: "58%", color: "var(--pm-primary)" },
				{ height: "55%", color: "var(--pm-primary)" },
			],
		},
		{
			key: "errors",
			col: "col-lg-3 col-md-4 col-6",
			label: "ERROR RATE (5xx)",
			labelColor: "var(--pm-danger)",
			value: "0.02%",
			badge: {
				tone: "badgeW",
				icon: "bi-exclamation-triangle",
				text: "Spike detected at 10am",
			},
			meter: {
				label: "SLA Budget",
				value: "98% remaining",
				pct: 98,
				color: "var(--pm-accent)",
			},
		},
		{
			key: "throughput",
			col: "col-lg-3 col-md-4",
			label: "THROUGHPUT",
			labelColor: "var(--pm-purple)",
			value: "1,240",
			unit: "req/s",
			badge: { tone: "badgeS", icon: "bi-activity", text: "Normal traffic" },
			accentBorder: "var(--pm-purple)",
			facts: [
				{ label: "Peak today", value: "1,892 req/s" },
				{ label: "Active Webhooks", value: "14" },
			],
		},
	],

	activeAlerts: [
		{
			tag: "WH",
			bg: "var(--pm-warning-soft)",
			color: "var(--pm-warning)",
			title: "Webhook delivery failing",
			sub: "Endpoint /callbacks/payment > 5% fail rate",
			actionLabel: "Inspect",
			modal: "webhookRetryModal",
		},
		{
			tag: "DB",
			bg: "var(--pm-info-soft)",
			color: "var(--pm-info)",
			title: "Database query latency high",
			sub: "p99 latency crossed 500ms on Read Replica",
			actionLabel: "Trace",
			modal: "bottleneckDetailsModal",
		},
		{
			tag: "MP",
			bg: "var(--pm-danger-soft)",
			color: "var(--pm-danger)",
			title: "Dependency: M-Pesa STK Timeouts",
			sub: "Safaricom Daraja API responding slowly",
			actionLabel: "War Room",
			modal: "incidentWarRoomModal",
			danger: true,
		},
	],

	recentIncidents: [
		{
			tag: "",
			icon: "bi-check2-all",
			bg: "var(--pm-surface-2)",
			color: "var(--pm-muted)",
			title: "PesaLink Settlement Delay",
			sub: "Resolved · 22 Jun 2025 · SEV-3",
			actionLabel: "Report",
			modal: "incidentPostmortemModal",
		},
		{
			tag: "",
			icon: "bi-check2-all",
			bg: "var(--pm-surface-2)",
			color: "var(--pm-muted)",
			title: "Auth API Certificate Expiry",
			sub: "Resolved · 15 Jun 2025 · SEV-2",
			actionLabel: "Report",
			modal: "incidentPostmortemModal",
		},
		{
			tag: "",
			icon: "bi-check2-all",
			bg: "var(--pm-surface-2)",
			color: "var(--pm-muted)",
			title: "Webhook Queue Backlog",
			sub: "Resolved · 05 Jun 2025 · SEV-3",
			actionLabel: "Report",
			modal: "incidentPostmortemModal",
		},
	],

	quickActions: [
		{
			label: "Search Logs",
			icon: "bi-journal-text",
			color: "var(--pm-primary)",
			modal: "centralizedLogModal",
		},
		{
			label: "Traces",
			icon: "bi-diagram-3",
			color: "var(--pm-purple)",
			modal: "traceVisualizationModal",
		},
		{
			label: "Grafana",
			icon: "bi-bar-chart",
			color: "var(--pm-warning)",
			modal: "grafanaDashboardModal",
		},
		{
			label: "On-Call (PD)",
			icon: "bi-telephone-outbound",
			color: "var(--pm-danger)",
			modal: "pagerDutySetupModal",
		},
		{
			label: "New Alert",
			icon: "bi-bell",
			color: "var(--pm-info)",
			modal: "addAlertRuleModal",
		},
		{
			label: "Escalation",
			icon: "bi-arrow-up-right-square",
			color: "var(--pm-accent)",
			modal: "escalationPolicyModal",
		},
		{
			label: "Maintenance",
			icon: "bi-calendar-event",
			color: "var(--pm-muted)",
			modal: "scheduleMaintenanceModal",
		},
		{
			label: "Biz Metrics",
			icon: "bi-graph-up",
			color: "var(--pm-primary)",
			modal: "businessMetricModal",
		},
	],

	subsystems: [
		{
			name: "Collections API (PayBill/Till)",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.99%",
			latency: "142ms",
			trend: "flat",
		},
		{
			name: "Disbursements API (B2C)",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.98%",
			latency: "185ms",
			trend: "flat",
		},
		{
			name: "Authentication & Identity API",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.99%",
			latency: "85ms",
			trend: "flat",
		},
		{
			name: "Card Processing Gateway",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.95%",
			latency: "410ms",
			trend: "down",
		},
		{
			name: "Webhook Event Delivery",
			status: "Degraded",
			tone: "badgeW",
			uptime: "99.90%",
			latency: "1,205ms",
			trend: "up",
		},
	],

	dependencies: [
		{
			name: "Safaricom Daraja (M-Pesa)",
			sub: "STK Push, B2C, C2B",
			status: "Timeouts detected",
			tone: "badgeW",
		},
		{
			name: "PesaLink Switch (IPSL)",
			sub: "Bank transfers",
			status: "Stable",
			tone: "badgeS",
		},
		{
			name: "Visa/Mastercard Network",
			sub: "Card acquiring",
			status: "Stable",
			tone: "badgeS",
		},
		{
			name: "KRA iTax Gateway",
			sub: "Tax validation",
			status: "Maintenance tonight",
			tone: "badgeI",
		},
	],

	alertRules: [
		{
			name: "High 5xx Error Rate",
			condition: "HTTP 5xx > 1% over 5m",
			severity: "Critical",
			severityTone: "badgeD",
			channelIcon: "bi-telephone-outbound",
			channelColor: "var(--pm-danger)",
			status: "Active",
			statusTone: "badgeS",
		},
		{
			name: "Webhook Failure Spike",
			condition: "Failures > 5% over 15m",
			severity: "Warning",
			severityTone: "badgeW",
			channelIcon: "bi-slack",
			channelColor: "var(--pm-purple)",
			status: "Triggered",
			statusTone: "badgeD",
		},
		{
			name: "Failed Sandbox Logins",
			condition: "Failures > 50 / hour",
			severity: "Info",
			severityTone: "badgeI",
			channelIcon: "bi-envelope",
			channelColor: "var(--pm-info)",
			status: "Active",
			statusTone: "badgeS",
		},
	],

	onCall: { l1: "John D.", l2: "Sarah W.", pagerDuty: "Connected" },

	logLines: [
		{
			level: "info",
			text: '{"time":"2025-06-27T10:41:01Z","level":"INFO","svc":"api-gateway","method":"POST","path":"/v2/collections/stk","status":200,"latency_ms":142,"traceId":"tx-99128a"}',
		},
		{
			level: "info",
			text: '{"time":"2025-06-27T10:41:02Z","level":"INFO","svc":"auth-svc","msg":"Token validated","userId":"usr_8812","traceId":"tx-99128b"}',
		},
		{
			level: "warn",
			text: '{"time":"2025-06-27T10:41:03Z","level":"WARN","svc":"webhook-worker","msg":"Delivery timeout, queuing retry","target":"https://api.merchant.com/hook","attempt":1}',
		},
		{
			level: "error",
			text: '{"time":"2025-06-27T10:41:04Z","level":"ERROR","svc":"mpesa-bridge","msg":"Upstream STK timeout","err":"Read timeout","traceId":"tx-99128c"}',
		},
		{
			level: "info",
			text: '{"time":"2025-06-27T10:41:05Z","level":"INFO","svc":"api-gateway","method":"GET","path":"/v1/balance","status":200,"latency_ms":45,"traceId":"tx-99128d"}',
		},
	],

	tools: [
		{
			title: "Distributed Tracing",
			sub: "OpenTelemetry",
			icon: "bi-diagram-3",
			color: "var(--pm-purple)",
			modal: "traceVisualizationModal",
		},
		{
			title: "Custom Dashboards",
			sub: "Grafana / PromQL",
			icon: "bi-bar-chart-steps",
			color: "var(--pm-warning)",
			modal: "grafanaDashboardModal",
		},
		{
			title: "Log Retention",
			sub: "30d hot, 7yr archive",
			icon: "bi-archive",
			color: "var(--pm-info)",
			modal: "logRetentionModal",
		},
		{
			title: "Business Metrics",
			sub: "Conversion & success",
			icon: "bi-funnel",
			color: "var(--pm-primary)",
			modal: "businessMetricModal",
		},
	],

	incidents: [
		{
			id: "INC-2291",
			title: "PesaLink Settlement Delay",
			date: "22 Jun 2025",
			severity: "SEV-3",
			status: "Resolved",
			tone: "badgeS",
		},
		{
			id: "INC-2284",
			title: "Auth API Certificate Expiry",
			date: "15 Jun 2025",
			severity: "SEV-2",
			status: "Resolved",
			tone: "badgeS",
		},
		{
			id: "INC-2270",
			title: "Webhook Queue Backlog",
			date: "05 Jun 2025",
			severity: "SEV-3",
			status: "Resolved",
			tone: "badgeS",
		},
	],

	spans: [
		{
			span: "mpesa-bridge → Daraja STK",
			duration: "1,840ms",
			pct: "72%",
			impact: "Critical",
			tone: "badgeD",
		},
		{
			span: "db.query (read-replica)",
			duration: "512ms",
			pct: "20%",
			impact: "High",
			tone: "badgeW",
		},
		{
			span: "auth-svc.validateToken",
			duration: "128ms",
			pct: "5%",
			impact: "Low",
			tone: "badgeS",
		},
		{
			span: "api-gateway.route",
			duration: "72ms",
			pct: "3%",
			impact: "Low",
			tone: "badgeS",
		},
	],

	dlqRows: [
		{
			eventId: "evt_88f2a1",
			type: "payment.success",
			attempts: "5/5",
			lastError: "HTTP 500 Internal Server Error",
		},
		{
			eventId: "evt_77b3c9",
			type: "disbursement.completed",
			attempts: "5/5",
			lastError: "Connection timeout after 30s",
		},
		{
			eventId: "evt_66d4e2",
			type: "payment.failed",
			attempts: "5/5",
			lastError: "HTTP 502 Bad Gateway",
		},
	],

	channels: [
		{
			name: "PagerDuty",
			detail: "Routing key ****9c21",
			icon: "bi-telephone-outbound",
			color: "var(--pm-danger)",
			connected: true,
		},
		{
			name: "Slack",
			detail: "#paymo-alerts",
			icon: "bi-slack",
			color: "var(--pm-purple)",
			connected: true,
		},
		{
			name: "Email",
			detail: "devops@company.com",
			icon: "bi-envelope",
			color: "var(--pm-info)",
			connected: true,
		},
		{
			name: "Microsoft Teams",
			detail: "Not configured",
			icon: "bi-microsoft-teams",
			color: "var(--pm-muted)",
			connected: false,
		},
	],

	statusServices: [
		{
			name: "Collections API",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.99%",
		},
		{
			name: "Disbursements API",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.98%",
		},
		{
			name: "Identity & KYC API",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.99%",
		},
		{
			name: "Card Gateway",
			status: "Operational",
			tone: "badgeS",
			uptime: "99.95%",
		},
		{
			name: "Webhook Delivery",
			status: "Degraded",
			tone: "badgeW",
			uptime: "99.90%",
		},
	],

	alertHistory: [
		{
			title: "Webhook Failure Spike",
			text: "Endpoint /callbacks/payment exceeded 5% failure rate.",
			bg: "var(--pm-warning-soft)",
			age: "12 mins ago",
		},
		{
			title: "M-Pesa STK Timeouts",
			text: "Safaricom Daraja responding above 3s for 8 consecutive minutes.",
			bg: "var(--pm-danger-soft)",
			age: "45 mins ago",
		},
		{
			title: "DB Read Replica Latency",
			text: "p99 query latency crossed the 500ms threshold.",
			bg: "var(--pm-info-soft)",
			age: "2 hours ago",
		},
	],
};

export async function fetchMonitoringIncidents(): Promise<MonitoringIncidentsContent> {
	try {
		const res = await fetch("/api/dev/monitoring-incidents");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as MonitoringIncidentsContent;
	} catch {
		return initialMockData;
	}
}
