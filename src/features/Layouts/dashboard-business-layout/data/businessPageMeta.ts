/* ============================================================================
 * businessPageMeta.ts — per-route page-bar metadata for the business dashboard.
 * ----------------------------------------------------------------------------
 * The BusinessShell owns the page bar (breadcrumb + title + subtitle) so the
 * 14 child pages stay pure content and never duplicate layout chrome. Each
 * child route declares its identity here, keyed by the final path segment of
 * /business-dashboard/<slug> (the index route uses INDEX_SLUG).
 *
 * Titles/subtitles are lifted verbatim from the legacy `BAAS business` HTML so
 * the migrated pages keep their original wording.
 * ========================================================================== */

export interface BusinessPageMeta {
	/** Intermediate breadcrumb crumb, e.g. "Finance" in Portal / Finance / AP. */
	section?: string;
	/** Final breadcrumb crumb + document identity. */
	title: string;
	/** Legacy page code + name shown as the page <h2>. */
	heading: string;
	/** One-line description under the heading. */
	subtitle: string;
}

/** Key used for the /business-dashboard index route. */
export const INDEX_SLUG = "__index__";

/** Root crumb shared by every business dashboard page. */
export const BUSINESS_ROOT_CRUMB = "Business Portal";

export const BUSINESS_PAGE_META: Record<string, BusinessPageMeta> = {
	[INDEX_SLUG]: {
		title: "Command Center",
		heading: "PAGE 3.1 — Business Command Center",
		subtitle:
			"Consolidated overview of collections, payroll, invoices, and business health.",
	},
	"command-center": {
		title: "Command Center",
		heading: "PAGE 3.1 — Business Command Center",
		subtitle:
			"Consolidated overview of collections, payroll, invoices, and business health.",
	},
	"collections-merchant": {
		section: "Collections",
		title: "Merchant Services",
		heading: "PAGE 3.2 — Collections & Merchant Services",
		subtitle:
			"Manage your PayBill, Till, Card, and PesaLink collections. Track real-time settlements, handle refunds, and manage customer payment data.",
	},
	"invoicing-billing": {
		section: "Finance",
		title: "Invoicing & Billing",
		heading: "PAGE 3.3 — Invoicing & Billing",
		subtitle:
			"Manage invoices, payment links, collections tracking, and recurring subscriptions.",
	},
	"payroll-hr": {
		section: "People",
		title: "Payroll & HR",
		heading: "PAGE 3.4 — Payroll & Salary Disbursement",
		subtitle:
			"Manage employees, run payroll, generate payslips, and ensure statutory compliance.",
	},
	"bulk-disbursements": {
		section: "Payments",
		title: "Bulk Disbursements",
		heading: "PAGE 3.5 — Bulk Disbursements",
		subtitle:
			"Manage bulk payments, batch processing, float management, and disbursement analytics.",
	},
	"accounts-payable": {
		section: "Finance",
		title: "Accounts Payable",
		heading: "PAGE 3.6 — Accounts Payable & Supplier Management",
		subtitle:
			"Manage supplier invoices, approval workflows, payment execution, and discount tracking.",
	},
	"treasury-cash": {
		section: "Treasury",
		title: "Treasury & Cash",
		heading: "PAGE 3.7 — Treasury, Cash Management & Forex",
		subtitle:
			"Manage cash positions, inter-account transfers, FX, and investment portfolio.",
	},
	"financial-reporting": {
		section: "Finance",
		title: "Financial Reporting",
		heading: "PAGE 3.8 — Financial Reporting, Audit & Analytics",
		subtitle:
			"Generate compliance-ready financial statements, drill down into BI metrics, review immutable audit trails, and prepare statutory KRA/NSSF tax extracts.",
	},
	"virtual-accounts": {
		section: "Treasury",
		title: "Virtual Accounts",
		heading: "PAGE 3.9 — Virtual Accounts & Sub-Accounts",
		subtitle:
			"Create, manage and reconcile business virtual accounts and sub-accounts with full funding controls, hierarchy, automation rules and audit trails.",
	},
	"open-banking": {
		section: "Treasury",
		title: "Open Banking",
		heading: "PAGE 3.10 — Open Banking & Account Aggregation",
		subtitle:
			"Connect bank accounts via PesaLink, view consolidated cash positions, execute instant transfers, reconcile transactions, and analyse multi-bank cash flow — all within a single secure dashboard.",
	},
	"multi-currency-treasury": {
		section: "Treasury",
		title: "Multi-Currency & FX",
		heading: "PAGE 3.11 — Multi-Currency Treasury & Forex Operations",
		subtitle:
			"Manage multi-currency accounts, execute live FX trades, set hedging contracts, monitor exposure, ensure regulatory compliance and reconcile treasury positions.",
	},
	"business-onboarding": {
		section: "Compliance",
		title: "Onboarding & KYB",
		heading: "PAGE 3.12 — Business Onboarding & KYB/KYC Center",
		subtitle:
			"Onboard sole proprietors, partnerships, LLCs, SACCOs and NGOs. Manage KYB/KYC intake, beneficial ownership declarations, director verification, compliance scoring and full audit trails.",
	},
	"support-disputes": {
		section: "Support",
		title: "Disputes & Refunds",
		heading: "PAGE 3.13 — Support, Disputes & Refunds Center",
		subtitle:
			"Manage customer tickets, merchant disputes, chargebacks, refunds, evidence uploads, SLA performance and resolution workflows in one comprehensive hub.",
	},
	"settings-administration": {
		section: "Administration",
		title: "Settings",
		heading: "PAGE 3.14 — Settings, Account Details & Administration",
		subtitle:
			"Manage business identity, KYC/KYB documents, multi-business switching, user roles & permissions, security policies, integrations, compliance calendar and support tickets.",
	},
};

/**
 * Resolve the page-bar metadata for a pathname such as
 * `/business-dashboard/accounts-payable`. Returns undefined for paths outside
 * the business dashboard so the shell can skip the page bar entirely.
 */
export function resolveBusinessPageMeta(
	pathname: string,
): BusinessPageMeta | undefined {
	const segments = pathname.split("/").filter(Boolean);
	const base = segments.indexOf("business-dashboard");
	if (base === -1) return undefined;
	const slug = segments[base + 1] ?? INDEX_SLUG;
	return BUSINESS_PAGE_META[slug];
}
