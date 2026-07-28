/* ============================================================================
 * 4.11 Support, Escalation & SLAs — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Extracted from 4.11.html: 4 hero cards, the support-plan comparison table,
 * premium benefit cards, severity blocks, the SLA table, recent tickets, plus
 * every dataset the 22 modals need (tiers, RCAs, escalation matrix, incidents,
 * maintenance windows, forum threads).
 * ========================================================================== */

export type Tone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP" | "badgeNeutral" | "badgeDark";

export interface Crumb {
	label: string;
	to?: string;
}
export interface HeroCard {
	key: string;
	label: string;
	labelColor?: string;
	value: string;
	valueSize?: number;
	valueColor?: string;
	accentBorder?: string;
	note?: string;
	noteIcon?: string;
	noteIconColor?: string;
	badges?: { text: string; tone: Tone }[];
	actionLabel: string;
	modal: string;
}
export interface PlanRow {
	feature: string;
	standard: string;
	premium: string;
	enterprise: string;
}
export interface BenefitCard {
	title: string;
	icon: string;
	iconColor: string;
	desc: string;
	actionLabel: string;
	modal: string;
	full?: boolean;
	sub?: string;
}
export interface SevBlock {
	key: string;
	level: string;
	sla: string;
	tone: Tone;
	desc: string;
}
export interface SlaRow {
	metric: string;
	target: string;
	actual: string;
	tone: Tone;
}
export interface TicketRow {
	id: string;
	title: string;
	status: string;
	tone: Tone;
	meta: string;
	dim?: boolean;
}
export interface Tier {
	key: string;
	name: string;
	price: string;
	sla: string;
	perks: string[];
	current?: boolean;
}
export interface RcaRow {
	date: string;
	incident: string;
	impact: string;
	status: string;
	tone: Tone;
}
export interface EscalationRow {
	level: string;
	role: string;
	contact: string;
	responseTime: string;
}
export interface IncidentRow {
	id: string;
	date: string;
	severity: string;
	tone: Tone;
	description: string;
	duration: string;
}
export interface MaintenanceRow {
	window: string;
	service: string;
	impact: string;
	tone: Tone;
}
export interface ForumThread {
	title: string;
	author: string;
	replies: number;
	tag: string;
	tone: Tone;
}
export interface ContactRow {
	name: string;
	email: string;
	role: string;
	primary: boolean;
}

export interface SupportSlasContent {
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
	pageActions: { label: string; icon: string; modal: string; primary?: boolean; iconColor?: string }[];
	heroCards: HeroCard[];
	planRows: PlanRow[];
	premiumBenefits: BenefitCard[];
	sevBlocks: SevBlock[];
	slaRows: SlaRow[];
	tickets: TicketRow[];
	tiers: Tier[];
	rcas: RcaRow[];
	escalation: EscalationRow[];
	incidents: IncidentRow[];
	maintenance: MaintenanceRow[];
	forumThreads: ForumThread[];
	contacts: ContactRow[];
	slaExclusions: string[];
	tam: { name: string; hours: string; email: string };
	ticketCategories: string[];
	affectedServices: string[];
}

export const initialMockData: SupportSlasContent = {
	pageCode: "PAGE 4.11",
	pageTitle: "Support, Escalation & SLAs",
	pageSub:
		"Manage technical support tickets, track SLA compliance, declare incidents, and access escalation matrices.",
	breadcrumb: {
		parents: [{ label: "Developer Portal", to: "/dev" }],
		current: "Support, Escalation & Service Levels",
	},

	header: {
		title: "Developer Portal",
		subtitle: "APIs, Integration & Technical Operations",
		searchPlaceholder: "Search documentation, error codes, tickets...",
		user: {
			name: "John Doe",
			role: "Tech Lead",
			initials: "JD",
			email: "john.doe@company.com",
		},
		actions: [
			{ icon: "bi-activity", title: "System Status", modal: "statusPageSubscribeModal" },
			{ icon: "bi-people", title: "Community", modal: "communityForumModal" },
			{
				icon: "bi-ticket-detailed",
				title: "Active Tickets",
				modal: "ticketDetailModal",
				counter: 2,
			},
		],
	},

	pageActions: [
		{ label: "AI Troubleshooter", icon: "bi-magic", modal: "troubleshootingWizardModal" },
		{
			label: "Declare Incident",
			icon: "bi-exclamation-triangle",
			modal: "declareIncidentModal",
			iconColor: "var(--pm-danger)",
		},
		{ label: "New Ticket", icon: "bi-plus-lg", modal: "submitTicketModal", primary: true },
	],

	heroCards: [
		{
			key: "tier",
			label: "CURRENT SUPPORT TIER",
			labelColor: "var(--pm-primary)",
			value: "Premium Support",
			valueSize: 24,
			accentBorder: "var(--pm-primary)",
			note: "4hr SLA for Critical Issues",
			noteIcon: "bi-check-circle-fill",
			noteIconColor: "var(--pm-accent)",
			actionLabel: "Upgrade Tier",
			modal: "upgradeTierModal",
		},
		{
			key: "tickets",
			label: "OPEN TICKETS",
			value: "2 Active",
			badges: [
				{ text: "1 Awaiting Reply", tone: "badgeW" },
				{ text: "1 In Progress", tone: "badgeI" },
			],
			actionLabel: "View Tickets",
			modal: "ticketDetailModal",
		},
		{
			key: "uptime",
			label: "MONTHLY UPTIME (API)",
			labelColor: "var(--pm-accent)",
			value: "99.98%",
			accentBorder: "var(--pm-accent)",
			note: "Exceeds 99.9% SLA target",
			noteIcon: "bi-shield-check",
			noteIconColor: "var(--pm-accent)",
			actionLabel: "Download SLA Report",
			modal: "viewSlaReportModal",
		},
		{
			key: "status",
			label: "SYSTEM STATUS",
			value: "All Systems Operational",
			valueColor: "var(--pm-accent)",
			valueSize: 20,
			note: "Last incident: 14 days ago",
			actionLabel: "View Incident History",
			modal: "incidentHistoryModal",
		},
	],

	planRows: [
		{
			feature: "Response SLA (Critical)",
			standard: "24 hours",
			premium: "4 hours",
			enterprise: "1 hour",
		},
		{
			feature: "Support Channels",
			standard: "Email, Forum",
			premium: "Email, Phone, Chat",
			enterprise: "24/7 Slack, On-site",
		},
		{
			feature: "Account Manager",
			standard: "None",
			premium: "Dedicated TAM",
			enterprise: "TAM + Solutions Eng.",
		},
		{
			feature: "Architecture Reviews",
			standard: "Community",
			premium: "Quarterly",
			enterprise: "Monthly",
		},
	],

	premiumBenefits: [
		{
			title: "Tech Account Manager",
			icon: "bi-person-workspace",
			iconColor: "var(--pm-primary)",
			desc: "Your dedicated TAM is Sarah Ndungu. Available 8AM-6PM EAT.",
			actionLabel: "Message Sarah",
			modal: "contactAmModal",
		},
		{
			title: "Architecture Review",
			icon: "bi-diagram-3",
			iconColor: "var(--pm-info)",
			desc: "Schedule a session to review your integration patterns.",
			actionLabel: "Schedule Review",
			modal: "requestArchitectureReviewModal",
		},
		{
			title: "Quarterly Business Review",
			icon: "bi-calendar-check",
			iconColor: "var(--pm-warning)",
			desc: "",
			sub: "Next review due: Oct 2026",
			actionLabel: "Book QBR",
			modal: "quarterlyBusinessReviewModal",
			full: true,
		},
	],

	sevBlocks: [
		{
			key: "sev1",
			level: "SEV1: Critical",
			sla: "1hr SLA",
			tone: "badgeD",
			desc: "Complete outage, payments down.",
		},
		{
			key: "sev2",
			level: "SEV2: Major",
			sla: "4hr SLA",
			tone: "badgeW",
			desc: "Major degradation, high impact.",
		},
		{
			key: "sev3",
			level: "SEV3: Minor",
			sla: "1 business day",
			tone: "badgeI",
			desc: "Partial issue with a workaround.",
		},
		{
			key: "sev4",
			level: "SEV4: Low",
			sla: "3 business days",
			tone: "badgeNeutral",
			desc: "Cosmetic or documentation issue.",
		},
	],

	slaRows: [
		{
			metric: "Core Payments API Uptime",
			target: "99.9% Target",
			actual: "99.98% Actual",
			tone: "badgeS",
		},
		{
			metric: "Non-Critical Services Uptime",
			target: "99.5% Target",
			actual: "99.85% Actual",
			tone: "badgeS",
		},
		{ metric: "API Response Time (p95)", target: "< 500ms", actual: "210ms", tone: "badgeS" },
		{
			metric: "Webhook Delivery Latency",
			target: "< 2s (99%)",
			actual: "2.4s (98%)",
			tone: "badgeW",
		},
	],

	tickets: [
		{
			id: "TIC-8821",
			title: "Webhook payloads dropping occasionally",
			status: "Awaiting Reply",
			tone: "badgeW",
			meta: "Opened: 2 days ago · Category: Webhooks · Assignee: Sarah N.",
		},
		{
			id: "TIC-8845",
			title: "Request limit increase for Disbursements API",
			status: "In Progress",
			tone: "badgeI",
			meta: "Opened: 5 hours ago · Category: Quotas · Assignee: DevOps Team",
		},
		{
			id: "TIC-8711",
			title: "Sandbox authentication returning 401",
			status: "Resolved",
			tone: "badgeDark",
			meta: "Opened: 12 days ago · Category: Authentication · Resolved: 11 days ago",
			dim: true,
		},
	],

	tiers: [
		{
			key: "standard",
			name: "Standard",
			price: "Included",
			sla: "24hr critical SLA",
			perks: ["Email & forum support", "Community architecture help"],
		},
		{
			key: "premium",
			name: "Premium",
			price: "KES 85,000 / mo",
			sla: "4hr critical SLA",
			perks: ["Email, phone & chat", "Dedicated TAM", "Quarterly reviews"],
			current: true,
		},
		{
			key: "enterprise",
			name: "Enterprise",
			price: "Custom",
			sla: "1hr critical SLA",
			perks: ["24/7 shared Slack", "On-site support", "Monthly reviews", "Solutions engineer"],
		},
	],

	rcas: [
		{
			date: "12 Jun 2026",
			incident: "PesaLink settlement delay",
			impact: "4,200 transfers queued for 38 min",
			status: "Published",
			tone: "badgeS",
		},
		{
			date: "28 May 2026",
			incident: "Auth API certificate expiry",
			impact: "Full auth outage for 12 min",
			status: "Published",
			tone: "badgeS",
		},
		{
			date: "05 May 2026",
			incident: "Webhook queue backlog",
			impact: "Delivery delayed up to 20 min",
			status: "Published",
			tone: "badgeS",
		},
	],

	escalation: [
		{
			level: "L1 — Support Engineer",
			role: "First response & triage",
			contact: "support@paymo.co.ke",
			responseTime: "15 min",
		},
		{
			level: "L2 — Senior Engineer",
			role: "Deep technical investigation",
			contact: "Escalated automatically",
			responseTime: "1 hour",
		},
		{
			level: "L3 — Platform Engineering",
			role: "Code-level fixes & hotfixes",
			contact: "Paged via PagerDuty",
			responseTime: "2 hours",
		},
		{
			level: "L4 — Engineering Manager",
			role: "Incident command & comms",
			contact: "+254 7XX XXX XXX",
			responseTime: "4 hours",
		},
	],

	incidents: [
		{
			id: "INC-2291",
			date: "12 Jun 2026",
			severity: "SEV2",
			tone: "badgeW",
			description: "PesaLink settlement delay",
			duration: "38 min",
		},
		{
			id: "INC-2284",
			date: "28 May 2026",
			severity: "SEV1",
			tone: "badgeD",
			description: "Auth API certificate expiry",
			duration: "12 min",
		},
		{
			id: "INC-2270",
			date: "05 May 2026",
			severity: "SEV3",
			tone: "badgeI",
			description: "Webhook queue backlog",
			duration: "1h 20m",
		},
	],

	maintenance: [
		{
			window: "Sun 06 Jul, 02:00–04:00 EAT",
			service: "KRA iTax Gateway",
			impact: "Tax validation unavailable",
			tone: "badgeW",
		},
		{
			window: "Sun 13 Jul, 01:00–02:00 EAT",
			service: "Database failover drill",
			impact: "No impact expected",
			tone: "badgeS",
		},
		{
			window: "Sat 26 Jul, 23:00–01:00 EAT",
			service: "Card gateway upgrade",
			impact: "Degraded performance",
			tone: "badgeW",
		},
	],

	forumThreads: [
		{
			title: "Best practice for idempotency keys on retries?",
			author: "dev_kamau",
			replies: 12,
			tag: "Integration",
			tone: "badgeI",
		},
		{
			title: "STK push timeout handling in Flutter",
			author: "mobile_amina",
			replies: 8,
			tag: "Mobile",
			tone: "badgeP",
		},
		{
			title: "Webhook signature verification in Go",
			author: "gopher_otieno",
			replies: 5,
			tag: "Webhooks",
			tone: "badgeS",
		},
	],

	contacts: [
		{
			name: "John Doe",
			email: "john.doe@company.com",
			role: "Primary technical contact",
			primary: true,
		},
		{
			name: "Grace Wanjiru",
			email: "grace.w@company.com",
			role: "Billing contact",
			primary: false,
		},
		{
			name: "DevOps Rota",
			email: "devops@company.com",
			role: "On-call distribution list",
			primary: false,
		},
	],

	slaExclusions: [
		"Scheduled maintenance announced at least 72 hours in advance.",
		"Outages caused by third-party providers (Safaricom, IPSL, card schemes).",
		"Issues arising from customer misconfiguration or invalid API usage.",
		"Force majeure events including natural disasters and national outages.",
		"Beta or sandbox endpoints, which carry no uptime guarantee.",
	],

	tam: {
		name: "Sarah Ndungu",
		hours: "8AM-6PM EAT",
		email: "sarah.ndungu@paymo.co.ke",
	},

	ticketCategories: [
		"API Errors (4xx / 5xx)",
		"Webhooks & Events",
		"Authentication & Keys",
		"Quotas & Rate Limits",
		"Settlement & Reconciliation",
		"Billing",
	],

	affectedServices: [
		"Collections API (STK / PayBill)",
		"Disbursements API (B2C)",
		"Authentication & Identity",
		"Card Processing Gateway",
		"Webhook Delivery",
	],
};

export async function fetchSupportSlas(): Promise<SupportSlasContent> {
	try {
		const res = await fetch("/api/dev/support-slas");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as SupportSlasContent;
	} catch {
		return initialMockData;
	}
}
