/* ============================================================================
 * 4.3 Webhooks, Events & Real-Time Integration — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Source page hardcoded: 4 hero stats, 3 attention rows, 6 quick-action tiles,
 * 3 registered endpoints, 4 delivery-log rows, 3 streaming cards, DLQ rows,
 * the retry-policy chain, the event catalog and 3 alerts. All extracted here.
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
export interface HeroStat {
	key: string;
	col: string;
	variant?: "code";
	label: string;
	labelColor?: string;
	value: string;
	badge?: {
		tone: Tone | "custom";
		icon?: string;
		text: string;
		bg?: string;
		color?: string;
	};
	live?: string;
	meter?: { pct: number; color: string; left: string; right: string };
	note?: { text: string; linkLabel?: string; modal?: string; color?: string };
	chips?: string[];
}
export interface AttentionRow {
	tag: string;
	bg: string;
	color: string;
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
	danger?: boolean;
}
export interface QuickTile {
	label: string;
	icon: string;
	color: string;
	modal: string;
}
export interface RegisteredEndpoint {
	name: string;
	url: string;
	status: string;
	tone: Tone;
	metaIcon: string;
	metaIconColor: string;
	meta: string;
	actions: { label: string; modal: string }[];
}
export interface DeliveryLog {
	eventId: string;
	type: string;
	status: string;
	tone: Tone;
	latency: string;
	modal: string;
}
export interface StreamCard {
	kind: "kafka" | "sqs";
	logo: string;
	logoHeight: number;
	alt: string;
	title: string;
	desc: string;
	status: string;
	statusTone: Tone;
	actionLabel: string;
	actionPrimary?: boolean;
	modal: string;
}
export interface SseLine {
	time: string;
	text: string;
}
export interface ReliabilityStat {
	label: string;
	value: string;
	valueColor: string;
	sub: string;
	subColor: string;
}
export interface DlqRow {
	eventId: string;
	type: string;
	endpoint: string;
	lastAttempt: string;
}
export interface CatalogEntry {
	event: string;
	desc: string;
	sample?: string;
}
export interface AlertRow {
	icon: string;
	iconColor: string;
	bg: string;
	title: string;
	text: string;
	age: string;
}
export interface HealthMetric {
	label: string;
	value: string;
	color?: string;
}

export interface WebhooksEventsContent {
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	breadcrumb: { parents: Crumb[]; current: string };
	header: {
		title: string;
		subtitle: string;
		searchPlaceholder: string;
		user: { name: string; role: string; initials: string; org: string };
		actions: { icon: string; title: string; modal: string; counter?: number }[];
	};
	pageActions: {
		label: string;
		icon: string;
		modal: string;
		primary?: boolean;
	}[];
	heroStats: HeroStat[];
	attention: AttentionRow[];
	quickTiles: QuickTile[];
	endpoints: RegisteredEndpoint[];
	deliveryLogs: DeliveryLog[];
	streams: StreamCard[];
	sse: { endpoint: string; lines: SseLine[] };
	reliability: ReliabilityStat[];
	retryChain: string[];
	retryBlurb: string;
	dlqRows: DlqRow[];
	dlqSize: string;
	catalog: CatalogEntry[];
	alerts: AlertRow[];
	healthMetrics: HealthMetric[];
	eventOptions: string[];
	endpointOptions: string[];
}

export const initialMockData: WebhooksEventsContent = {
	pageCode: "",
	pageTitle: "Webhooks, Events & Real-Time Integration",
	pageSub:
		"Manage endpoint configurations, stream enterprise events via Kafka/SQS, and handle payload idempotency, reliability, and dead letters.",
	breadcrumb: {
		parents: [
			{ label: "Developer Portal", to: "/dev" },
			{ label: "Integration", to: "/dev" },
		],
		current: "Webhooks & Events",
	},

	header: {
		title: "Developer Portal",
		subtitle: "APIs, Webhooks, Event Streaming & Technical Operations",
		searchPlaceholder: "Search events, payloads, endpoints, documentation...",
		user: {
			name: "David M.",
			role: "Lead Integration Eng.",
			initials: "DM",
			org: "TechCorp Ltd",
		},
		actions: [
			{ icon: "bi-braces", title: "Search Events", modal: "searchEventsModal" },
			{
				icon: "bi-heart-pulse",
				title: "Endpoint Health",
				modal: "endpointHealthModal",
			},
			{
				icon: "bi-bell",
				title: "Alerts",
				modal: "webhooksNotifModal",
				counter: 3,
			},
		],
	},

	pageActions: [
		{ label: "DLQ Manager", icon: "bi-envelope-x", modal: "dlqManagerModal" },
		{ label: "Simulate", icon: "bi-play-circle", modal: "simulateEventModal" },
		{ label: "Event Catalog", icon: "bi-book", modal: "eventCatalogModal" },
		{
			label: "Add Endpoint",
			icon: "bi-plus-lg",
			modal: "addEndpointModal",
			primary: true,
		},
	],

	heroStats: [
		{
			key: "throughput",
			col: "col-lg-3 col-md-6",
			variant: "code",
			label: "Event Throughput (30d)",
			value: "1.48M",
			badge: {
				tone: "custom",
				icon: "bi-arrow-up-right",
				text: "14% vs last month",
				bg: "rgba(16,185,129,0.2)",
				color: "#34D399",
			},
			live: "32 events/sec current",
		},
		{
			key: "success",
			col: "col-lg-3 col-md-6",
			label: "Delivery Success Rate",
			labelColor: "var(--pm-accent)",
			value: "99.85%",
			meter: {
				pct: 99.85,
				color: "var(--pm-accent)",
				left: "SLA Target: 99.9%",
				right: "P95 Latency: 140ms",
			},
		},
		{
			key: "dlq",
			col: "col-lg-3 col-md-6",
			label: "Dead Letter Queue (DLQ)",
			labelColor: "var(--pm-warning)",
			value: "2,143",
			badge: {
				tone: "badgeW",
				icon: "bi-exclamation-triangle",
				text: "Needs review",
			},
			note: {
				text: "Payloads exhausted max retries.",
				linkLabel: "View & Replay",
				modal: "dlqManagerModal",
			},
		},
		{
			key: "subs",
			col: "col-lg-3 col-md-6",
			label: "Active Subscriptions",
			labelColor: "var(--pm-primary)",
			value: "14",
			chips: ["8 Webhooks", "4 SQS", "2 Kafka Topics"],
		},
	],

	attention: [
		{
			tag: "WH",
			bg: "var(--pm-danger-soft)",
			color: "var(--pm-danger)",
			title: "Prod Webhook Failing",
			sub: "https://api.merchant.com/webhook returning 503",
			actionLabel: "Fix",
			modal: "editEndpointModal",
			danger: true,
		},
		{
			tag: "DQ",
			bg: "var(--pm-warning-soft)",
			color: "var(--pm-warning)",
			title: "DLQ Size Alert",
			sub: "2,000+ payloads stranded in Dead Letter Queue",
			actionLabel: "Replay",
			modal: "dlqManagerModal",
		},
		{
			tag: "KF",
			bg: "var(--pm-purple-soft)",
			color: "var(--pm-purple)",
			title: "Kafka Consumer Lag",
			sub: "Group 'payroll-events' lagging by 4,200 offset",
			actionLabel: "View",
			modal: "kafkaIntegrationModal",
		},
	],

	quickTiles: [
		{
			label: "Add Endpoint",
			icon: "bi-plus-circle",
			color: "var(--pm-primary)",
			modal: "addEndpointModal",
		},
		{
			label: "Test Webhook",
			icon: "bi-bug",
			color: "var(--pm-accent)",
			modal: "testWebhookModal",
		},
		{
			label: "Simulate Event",
			icon: "bi-play-circle",
			color: "var(--pm-warning)",
			modal: "simulateEventModal",
		},
		{
			label: "DLQ Manager",
			icon: "bi-envelope-x",
			color: "var(--pm-danger)",
			modal: "dlqManagerModal",
		},
		{
			label: "Rotate Secrets",
			icon: "bi-shield-lock",
			color: "var(--pm-purple)",
			modal: "generateSecretModal",
		},
		{
			label: "Alert Rules",
			icon: "bi-bell-fill",
			color: "var(--pm-info)",
			modal: "alertSettingsModal",
		},
	],

	endpoints: [
		{
			name: "Core Payment Processor",
			url: "https://api.merchant.com/v1/paymo/webhooks",
			status: "Healthy",
			tone: "badgeS",
			metaIcon: "bi-check2-circle",
			metaIconColor: "var(--pm-accent)",
			meta: "14 events · TLS 1.2+ verified",
			actions: [
				{ label: "Edit", modal: "editEndpointModal" },
				{ label: "Test", modal: "testWebhookModal" },
			],
		},
		{
			name: "Payroll Status Sync",
			url: "https://hr.merchant.com/api/paymo-events",
			status: "Failing",
			tone: "badgeD",
			metaIcon: "bi-x-circle",
			metaIconColor: "var(--pm-danger)",
			meta: "3 events · Last response: 503",
			actions: [
				{ label: "Edit", modal: "editEndpointModal" },
				{ label: "Pause", modal: "pauseEndpointModal" },
			],
		},
		{
			name: "Sandbox Environment",
			url: "https://staging.merchant.com/webhook",
			status: "Sandbox",
			tone: "badgeNeutral",
			metaIcon: "bi-asterisk",
			metaIconColor: "var(--pm-muted)",
			meta: "All events · Signature verified",
			actions: [
				{ label: "Edit", modal: "editEndpointModal" },
				{ label: "Test", modal: "testWebhookModal" },
			],
		},
	],

	deliveryLogs: [
		{
			eventId: "evt_9x8f7a",
			type: "payment.success",
			status: "200 OK",
			tone: "badgeS",
			latency: "142ms",
			modal: "viewPayloadModal",
		},
		{
			eventId: "evt_2b3c4d",
			type: "payroll.completed",
			status: "503 ERR",
			tone: "badgeD",
			latency: "2004ms",
			modal: "viewPayloadModal",
		},
		{
			eventId: "evt_1z2y3x",
			type: "refund.processed",
			status: "201 OK",
			tone: "badgeS",
			latency: "89ms",
			modal: "viewPayloadModal",
		},
		{
			eventId: "evt_4w5v6u",
			type: "payment.failed",
			status: "200 OK",
			tone: "badgeS",
			latency: "115ms",
			modal: "viewPayloadModal",
		},
	],

	streams: [
		{
			kind: "kafka",
			logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Apache_kafka-icon.svg",
			logoHeight: 40,
			alt: "Apache Kafka",
			title: "Apache Kafka Integration",
			desc: "Stream real-time events directly to your MSK or Confluent cluster. Recommended for >1,000 TPS.",
			status: "Connected",
			statusTone: "badgeS",
			actionLabel: "Configure",
			modal: "kafkaIntegrationModal",
		},
		{
			kind: "sqs",
			logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
			logoHeight: 30,
			alt: "Amazon Web Services",
			title: "AWS SQS Integration",
			desc: "Push events directly to your Amazon Simple Queue Service queues via IAM Role assumption.",
			status: "Not Configured",
			statusTone: "badgeNeutral",
			actionLabel: "Connect SQS",
			actionPrimary: true,
			modal: "sqsIntegrationModal",
		},
	],

	sse: {
		endpoint: "wss://stream.paymo.com/events",
		lines: [
			{ time: "14:32:01", text: "id: evt_9128, event: payment.success" },
			{ time: "14:32:04", text: "id: evt_9129, event: kyc.verified" },
			{ time: "14:32:05", text: "id: evt_9130, event: invoice.paid" },
		],
	},

	reliability: [
		{
			label: "IDEMPOTENT REQUESTS",
			value: "18,492",
			valueColor: "var(--pm-primary)",
			sub: "Duplicates safely caught",
			subColor: "var(--pm-accent)",
		},
		{
			label: "DLQ SIZE",
			value: "2,143",
			valueColor: "var(--pm-danger)",
			sub: "Exhausted retries",
			subColor: "var(--pm-warning)",
		},
	],

	retryChain: ["T+0m", "T+5m", "T+30m", "T+2h", "T+12h", "DLQ"],
	retryBlurb:
		"PayMo implements Exponential Backoff for failed webhook deliveries. Payloads are retried up to 5 times before being sent to the Dead Letter Queue.",

	dlqRows: [
		{
			eventId: "evt_a1b2c3",
			type: "payment.success",
			endpoint: "https://api.old.com/wh",
			lastAttempt: "2 days ago",
		},
		{
			eventId: "evt_x9y8z7",
			type: "invoice.paid",
			endpoint: "https://hr.merchant.com/...",
			lastAttempt: "3 days ago",
		},
		{
			eventId: "evt_m4n5o6",
			type: "payroll.failed",
			endpoint: "https://hr.merchant.com/...",
			lastAttempt: "4 days ago",
		},
	],
	dlqSize: "2,143",

	catalog: [
		{
			event: "payment.success",
			desc: "Fired when a collection (C2B) is successfully captured.",
			sample: `{ "id": "evt_...", "type": "payment.success", "data": { "amount": 500, "msisdn": "2547..." } }`,
		},
		{
			event: "disbursement.completed",
			desc: "Fired when a bulk payout (B2C) succeeds.",
		},
		{
			event: "kyc.verified",
			desc: "Fired when a merchant or customer passes identity verification asynchronously.",
		},
	],

	alerts: [
		{
			icon: "bi-exclamation-triangle",
			iconColor: "var(--pm-danger)",
			bg: "var(--pm-danger-soft)",
			title: "Prod Webhook Failing",
			text: "503 errors detected on Payroll Sync endpoint.",
			age: "10 mins ago",
		},
		{
			icon: "bi-envelope-x",
			iconColor: "var(--pm-warning)",
			bg: "var(--pm-warning-soft)",
			title: "DLQ Size Threshold",
			text: "DLQ crossed 2,000 pending payloads.",
			age: "1 hour ago",
		},
		{
			icon: "bi-hdd-network",
			iconColor: "var(--pm-purple)",
			bg: "var(--pm-purple-soft)",
			title: "Kafka Lag",
			text: "Consumer group 'payroll-events' lagging > 4000.",
			age: "2 hours ago",
		},
	],

	healthMetrics: [
		{ label: "UPTIME (7d)", value: "99.99%", color: "var(--pm-accent)" },
		{ label: "AVG LATENCY", value: "142ms" },
		{ label: "ERROR RATE", value: "0.01%", color: "var(--pm-accent)" },
	],

	eventOptions: [
		"payment.success",
		"payment.failed",
		"disbursement.completed",
		"refund.processed",
		"invoice.paid",
		"kyc.verified",
	],

	endpointOptions: [
		"https://api.merchant.com/v1/paymo/webhooks",
		"https://staging.merchant.com/webhook",
	],
};

export async function fetchWebhooksEvents(): Promise<WebhooksEventsContent> {
	try {
		const res = await fetch("/api/dev/webhooks-events");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as WebhooksEventsContent;
	} catch {
		return initialMockData;
	}
}
