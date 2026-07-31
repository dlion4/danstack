/* ============================================================================
 * 4.12 Compliance, Audit & Regulatory Integration — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Extracted from 4.12.html: 4 hero cards, the 3-tab regulatory endpoint
 * explorer (CBK/AML, KRA, ODPC), quick tools, documentation hub, the audit
 * trail feed, international standards panel, and every dataset the 23 modals
 * need (audit logs, ISO validation rules, consents, filings, alerts).
 * ========================================================================== */

export type Tone =
	| "badgeS"
	| "badgeW"
	| "badgeD"
	| "badgeI"
	| "badgeP"
	| "badgeNeutral"
	| "badgeSlate";
export type Method = "GET" | "POST" | "PUT" | "DEL";

export interface Crumb {
	label: string;
	to?: string;
}
export interface HeroCard {
	key: string;
	label: string;
	labelColor?: string;
	value: string;
	valueColor?: string;
	dark?: boolean;
	accentBorder?: string;
	badge: { text: string; tone: Tone; icon: string };
	note?: string;
	meter?: { pct: number; color: string };
}
export interface Endpoint {
	id: string;
	method: Method;
	path: string;
	desc: string;
	status: string;
	tone: Tone;
	modal?: string;
}
export interface RegTab {
	key: string;
	label: string;
	blurb: string;
	endpoints: Endpoint[];
	action?: { label: string; modal: string };
}
export interface QuickTool {
	label: string;
	icon: string;
	color: string;
	modal: string;
}
export interface DocLink {
	title: string;
	modal: string;
}
export interface AuditEvent {
	title: string;
	meta: string;
	icon: string;
	bg: string;
	color: string;
	age: string;
}
export interface StandardRow {
	name: string;
	sub: string;
	status: string;
	tone: Tone;
	actionLabel: string;
	modal: string;
}
export interface AuditLogRow {
	timestamp: string;
	eventId: string;
	eventType: string;
	actor: string;
	ip: string;
	hashValid: boolean;
}
export interface IsoRule {
	rule: string;
	status: string;
	tone: Tone;
}
export interface ConsentRow {
	tpp: string;
	consentType: string;
	status: string;
	tone: Tone;
	expires: string;
}
export interface FilingRow {
	regulation: string;
	filingType: string;
	deadline: string;
	status: string;
	tone: Tone;
}
export interface AlertRow {
	title: string;
	text: string;
	bg: string;
	age: string;
}

export interface ComplianceAuditContent {
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
	heroCards: HeroCard[];
	regTabs: RegTab[];
	quickTools: QuickTool[];
	docLinks: DocLink[];
	auditEvents: AuditEvent[];
	standards: StandardRow[];
	auditLogs: AuditLogRow[];
	isoRules: IsoRule[];
	consents: ConsentRow[];
	filings: FilingRow[];
	alerts: AlertRow[];
	environments: string[];
	auditScopes: string[];
	isoMessageTypes: string[];
	reportCategories: string[];
}

export const initialMockData: ComplianceAuditContent = {
	pageCode: "PAGE 4.12",
	pageTitle: "Compliance, Audit & Regulatory Integration",
	pageSub:
		"Integrate real-time regulatory reporting, manage immutable audit trails, and ensure strict compliance with KRA, CBK, and global standards (ISO 20022/SWIFT).",
	breadcrumb: {
		parents: [
			{ label: "Developer Portal", to: "/dev" },
			{ label: "APIs", to: "/dev" },
		],
		current: "Compliance & Audit",
	},

	header: {
		title: "Compliance & Regulatory APIs",
		subtitle:
			"Audit logging, CBK/KRA reporting, data privacy & ISO 20022/SWIFT standards",
		searchPlaceholder:
			"Search compliance tools, audit endpoints, logs, ISO docs...",
		user: {
			name: "Dev Admin",
			role: "Prod Environment",
			initials: "DV",
			email: "dev.admin@paymo.co.ke",
		},
		actions: [
			{
				icon: "bi-hdd-network",
				title: "Environment",
				modal: "envSwitcherModal",
			},
			{
				icon: "bi-bell",
				title: "Compliance Alerts",
				modal: "auditAlertsModal",
				counter: 3,
			},
			{ icon: "bi-file-pdf", title: "Audit Report", modal: "auditReportModal" },
		],
	},

	pageActions: [
		{ label: "ISO 20022 Tester", icon: "bi-globe", modal: "isoMessageModal" },
		{
			label: "DSAR API",
			icon: "bi-person-bounding-box",
			modal: "dsarRequestModal",
		},
		{
			label: "KRA e-TIMS Check",
			icon: "bi-receipt-cutoff",
			modal: "kraEtimModal",
		},
		{
			label: "Audit Access Token",
			icon: "bi-key",
			modal: "genAuditTokenModal",
			primary: true,
		},
	],

	heroCards: [
		{
			key: "health",
			label: "COMPLIANCE HEALTH",
			labelColor: "var(--pm-accent)",
			value: "100%",
			accentBorder: "var(--pm-accent)",
			badge: {
				text: "Fully Compliant",
				tone: "badgeS",
				icon: "bi-check-circle",
			},
			note: "CBK, KRA, ODPC checks passed",
		},
		{
			key: "logs",
			label: "AUDIT LOG ENTRIES (30D)",
			labelColor: "var(--pm-info)",
			value: "2.4M",
			badge: { text: "WORM Encrypted", tone: "badgeI", icon: "bi-shield-lock" },
			note: "Last synced: 2 mins ago",
		},
		{
			key: "filings",
			label: "PENDING REG. FILINGS",
			labelColor: "var(--pm-warning)",
			value: "2",
			badge: { text: "Next due in 4 days", tone: "badgeW", icon: "bi-clock" },
			note: "KRA DST, NSSF Tier II",
		},
		{
			key: "rate",
			label: "API RATE LIMIT STATUS",
			value: "Healthy",
			dark: true,
			badge: { text: "450 req/sec", tone: "badgeSlate", icon: "bi-activity" },
			meter: { pct: 15, color: "var(--pm-accent)" },
		},
	],

	regTabs: [
		{
			key: "cbk",
			label: "CBK & AML",
			blurb:
				"Endpoints for Central Bank of Kenya reporting, Anti-Money Laundering (AML), and large transaction flagging.",
			action: { label: "Simulate AML Trigger", modal: "simulateCbkModal" },
			endpoints: [
				{
					id: "cbkLarge",
					method: "POST",
					path: "/v1/compliance/cbk/large-transaction",
					desc: "Report transactions exceeding KES 1M equivalent to the Financial Reporting Centre (FRC).",
					status: "Operational",
					tone: "badgeS",
				},
				{
					id: "cbkStr",
					method: "POST",
					path: "/v1/compliance/cbk/str",
					desc: "Submit Suspicious Transaction Reports (STR) algorithmically based on ML risk scoring.",
					status: "Operational",
					tone: "badgeS",
				},
				{
					id: "cbkKyc",
					method: "GET",
					path: "/v1/compliance/kyc/pep-screening",
					desc: "Screen entities against Politically Exposed Persons (PEP) and global sanction lists.",
					status: "Operational",
					tone: "badgeS",
				},
			],
		},
		{
			key: "kra",
			label: "KRA & Taxes",
			blurb:
				"Tax compliance integrations for e-TIMS, PAYE, and automated VAT reporting.",
			endpoints: [
				{
					id: "kraEtims",
					method: "POST",
					path: "/v1/tax/kra/e-tims/invoice",
					desc: "Push B2B/B2C invoice data directly to KRA e-TIMS and return certified QR/receipt numbers.",
					status: "Operational",
					tone: "badgeS",
					modal: "kraEtimModal",
				},
				{
					id: "kraPaye",
					method: "POST",
					path: "/v1/tax/kra/paye/submit",
					desc: "Submit automated monthly PAYE returns from payroll module to iTax.",
					status: "Maintenance at 10 PM",
					tone: "badgeW",
				},
				{
					id: "kraWht",
					method: "POST",
					path: "/v1/tax/kra/wht/certificate",
					desc: "Generate and remit Withholding Tax certificates for supplier payments.",
					status: "Operational",
					tone: "badgeS",
				},
			],
		},
		{
			key: "odpc",
			label: "Data Privacy (ODPC)",
			blurb: "APIs mapped to Data Protection Act 2019 (Kenya) requirements.",
			endpoints: [
				{
					id: "odpcDsar",
					method: "POST",
					path: "/v1/privacy/dsar/request",
					desc: "Initiate Data Subject Access Request (DSAR). Compiles complete JSON of user data footprint.",
					status: "Operational",
					tone: "badgeS",
					modal: "dsarRequestModal",
				},
				{
					id: "odpcErase",
					method: "DEL",
					path: "/v1/privacy/data/erase",
					desc: "Execute right to erasure (Right to be Forgotten) across non-immutable financial stores.",
					status: "Operational",
					tone: "badgeS",
				},
				{
					id: "odpcConsent",
					method: "PUT",
					path: "/v1/privacy/consent/update",
					desc: "Manage granular user consent flags (marketing, profiling, third-party sharing).",
					status: "Operational",
					tone: "badgeS",
				},
			],
		},
	],

	quickTools: [
		{
			label: "Audit Token",
			icon: "bi-key",
			color: "var(--pm-warning)",
			modal: "genAuditTokenModal",
		},
		{
			label: "MX Validator",
			icon: "bi-file-code",
			color: "var(--pm-info)",
			modal: "isoMessageModal",
		},
		{
			label: "SWIFT Route",
			icon: "bi-send",
			color: "var(--pm-primary)",
			modal: "swiftRouteModal",
		},
		{
			label: "OB Consent",
			icon: "bi-unlock",
			color: "var(--pm-accent)",
			modal: "openBankingModal",
		},
		{
			label: "Export Logs",
			icon: "bi-cloud-download",
			color: "var(--pm-danger)",
			modal: "auditReportModal",
		},
		{
			label: "Dashboard",
			icon: "bi-speedometer",
			color: "var(--pm-purple)",
			modal: "complianceDashModal",
		},
	],

	docLinks: [
		{ title: "KYC/AML Implementation Guide", modal: "docViewerModal" },
		{ title: "Data Privacy Compliance Checklist", modal: "docViewerModal" },
		{ title: "KRA e-TIMS API Spec v2.1", modal: "docViewerModal" },
	],

	auditEvents: [
		{
			title: "API Key Rotated",
			meta: "User: dev.admin@paymo.co.ke · IP: 197.232.x.x",
			icon: "bi-key",
			bg: "var(--pm-info-soft)",
			color: "var(--pm-primary)",
			age: "10 mins ago",
		},
		{
			title: "Failed Login Attempt (x5)",
			meta: "Account: system.hook@paymo.co.ke · IP: 41.220.x.x",
			icon: "bi-person-x",
			bg: "var(--pm-danger-soft)",
			color: "var(--pm-danger)",
			age: "1 hr ago",
		},
		{
			title: "Webhook Endpoint Updated",
			meta: "User: ops.lead@paymo.co.ke · IP: 197.232.x.x",
			icon: "bi-pencil-square",
			bg: "var(--pm-warning-soft)",
			color: "var(--pm-warning)",
			age: "3 hrs ago",
		},
		{
			title: "Auditor Token Issued",
			meta: "Firm: KPMG East Africa · Scope: read-only",
			icon: "bi-shield-check",
			bg: "var(--pm-accent-soft)",
			color: "var(--pm-accent)",
			age: "1 day ago",
		},
	],

	standards: [
		{
			name: "ISO 20022 Migration",
			sub: "pain.001 / pacs.008 / camt.053 supported",
			status: "Certified",
			tone: "badgeS",
			actionLabel: "Validate MX",
			modal: "isoMessageModal",
		},
		{
			name: "SWIFT Connectivity",
			sub: "BIC routing & correspondent network",
			status: "Live",
			tone: "badgeS",
			actionLabel: "Route Check",
			modal: "swiftRouteModal",
		},
		{
			name: "SWIFT gpi Tracking",
			sub: "End-to-end UETR payment tracking",
			status: "Live",
			tone: "badgeS",
			actionLabel: "Track UETR",
			modal: "gpiTrackerModal",
		},
		{
			name: "Open Banking (PSD2-style)",
			sub: "TPP consent & account information APIs",
			status: "Beta",
			tone: "badgeP",
			actionLabel: "Manage Consents",
			modal: "openBankingModal",
		},
		{
			name: "Strong Customer Auth (SCA)",
			sub: "Dynamic linking & exemption rules",
			status: "Active",
			tone: "badgeS",
			actionLabel: "SCA Rules",
			modal: "scaSettingsModal",
		},
	],

	auditLogs: [
		{
			timestamp: "2026-06-27 10:41:01",
			eventId: "evt_9a8b7c",
			eventType: "api_key.rotated",
			actor: "dev.admin@paymo.co.ke",
			ip: "197.232.14.8",
			hashValid: true,
		},
		{
			timestamp: "2026-06-27 09:12:44",
			eventId: "evt_8f2a1b",
			eventType: "auth.failed",
			actor: "system.hook@paymo.co.ke",
			ip: "41.220.9.14",
			hashValid: true,
		},
		{
			timestamp: "2026-06-27 07:55:02",
			eventId: "evt_7d6c5b",
			eventType: "webhook.updated",
			actor: "ops.lead@paymo.co.ke",
			ip: "197.232.14.8",
			hashValid: true,
		},
		{
			timestamp: "2026-06-26 16:30:19",
			eventId: "evt_6c5b4a",
			eventType: "auditor_token.issued",
			actor: "compliance@paymo.co.ke",
			ip: "197.232.14.2",
			hashValid: true,
		},
		{
			timestamp: "2026-06-26 11:04:57",
			eventId: "evt_5b4a39",
			eventType: "dsar.completed",
			actor: "privacy-bot",
			ip: "internal",
			hashValid: true,
		},
	],

	isoRules: [
		{
			rule: "XML schema conforms to pain.001.001.09",
			status: "Pass",
			tone: "badgeS",
		},
		{
			rule: "Mandatory GrpHdr elements present",
			status: "Pass",
			tone: "badgeS",
		},
		{
			rule: "Debtor/Creditor IBAN checksum valid",
			status: "Pass",
			tone: "badgeS",
		},
		{ rule: "Currency code is ISO 4217", status: "Pass", tone: "badgeS" },
		{
			rule: "Remittance info within 140 characters",
			status: "Warning",
			tone: "badgeW",
		},
		{ rule: "End-to-end ID is unique", status: "Pass", tone: "badgeS" },
	],

	consents: [
		{
			tpp: "Fintech Aggregator Ltd",
			consentType: "Account Information",
			status: "Active",
			tone: "badgeS",
			expires: "12 Dec 2026",
		},
		{
			tpp: "BudgetApp Kenya",
			consentType: "Transaction History",
			status: "Active",
			tone: "badgeS",
			expires: "04 Sep 2026",
		},
		{
			tpp: "LoanCheck Services",
			consentType: "Balance Check",
			status: "Expired",
			tone: "badgeNeutral",
			expires: "01 Jun 2026",
		},
	],

	filings: [
		{
			regulation: "KRA (iTax)",
			filingType: "Digital Service Tax",
			deadline: "30 Jun 2026",
			status: "Pending",
			tone: "badgeW",
		},
		{
			regulation: "NSSF",
			filingType: "Tier II Contributions",
			deadline: "05 Jul 2026",
			status: "Pending",
			tone: "badgeW",
		},
		{
			regulation: "CBK",
			filingType: "Monthly Transaction Return",
			deadline: "15 Jun 2026",
			status: "Filed",
			tone: "badgeS",
		},
		{
			regulation: "ODPC",
			filingType: "Annual Data Audit",
			deadline: "31 Dec 2026",
			status: "Not due",
			tone: "badgeNeutral",
		},
	],

	alerts: [
		{
			title: "KRA DST filing due in 4 days",
			text: "Digital Service Tax return for June must be filed by 30 Jun 2026.",
			bg: "var(--pm-warning-soft)",
			age: "2 hours ago",
		},
		{
			title: "5 failed login attempts detected",
			text: "Account system.hook@paymo.co.ke from IP 41.220.9.14. Review the audit log.",
			bg: "var(--pm-danger-soft)",
			age: "1 hour ago",
		},
		{
			title: "Auditor token expires in 7 days",
			text: "KPMG East Africa read-only token will lapse on 04 Jul 2026.",
			bg: "var(--pm-info-soft)",
			age: "1 day ago",
		},
	],

	environments: ["Production", "Sandbox", "Staging"],

	auditScopes: [
		"Read audit logs",
		"Read transaction records",
		"Read compliance filings",
		"Export reports",
	],

	isoMessageTypes: [
		"pain.001 — Customer Credit Transfer Initiation",
		"pacs.008 — FI to FI Customer Credit Transfer",
		"camt.053 — Bank to Customer Statement",
		"pain.002 — Payment Status Report",
	],

	reportCategories: [
		"Full Audit Trail",
		"Access & Authentication Logs",
		"Regulatory Filings",
		"Data Privacy (DSAR) Activity",
	],
};

export async function fetchComplianceAudit(): Promise<ComplianceAuditContent> {
	try {
		const res = await fetch("/api/dev/compliance-audit");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as ComplianceAuditContent;
	} catch {
		return initialMockData;
	}
}
