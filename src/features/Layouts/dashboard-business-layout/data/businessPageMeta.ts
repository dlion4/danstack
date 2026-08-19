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
	"command-center": {
		title: "Command Center",
		heading: "Business Command Center",
		subtitle: "Consolidated overview of collections, payroll, invoices, and business health.",
	},
	marketing: {
		section: "Commerce & Growth",
		title: "Marketing",
		heading: "Marketing & Growth",
		subtitle: "Campaigns, promotions and customer acquisition channels.",
	},
	products: {
		section: "Commerce & Growth",
		title: "Products & Store",
		heading: "Products & Store",
		subtitle: "Manage your product catalog and online store.",
	},
	inventory: {
		section: "Commerce & Growth",
		title: "Inventory",
		heading: "Inventory & Stock",
		subtitle: "Multi-location stock, auto-reorder, expiry tracking and valuation.",
	},
	portfolio: {
		section: "Finance & Operations",
		title: "Portfolio",
		heading: "Business Portfolio",
		subtitle: "Investment holdings and portfolio performance.",
	},
	funding: {
		section: "Finance & Operations",
		title: "Funding",
		heading: "Funding & Capital",
		subtitle: "Loans, credit lines and capital management.",
	},
	insurance: {
		section: "Finance & Operations",
		title: "Insurance",
		heading: "Business Insurance",
		subtitle: "Insurance policies and coverage management.",
	},
	disputes: {
		section: "Finance & Operations",
		title: "Disputes",
		heading: "Disputes & Resolution",
		subtitle: "Manage customer disputes and chargebacks.",
	},
	team: {
		section: "Team & Settings",
		title: "Team",
		heading: "Team Management",
		subtitle: "Roles, permissions and team members.",
	},
	notifications: {
		section: "Team & Settings",
		title: "Notifications",
		heading: "Notifications",
		subtitle: "Alerts, messages and system notifications.",
	},
	profile: {
		section: "Team & Settings",
		title: "Profile",
		heading: "Business Profile",
		subtitle: "Business identity and account settings.",
	},
	data: {
		section: "Team & Settings",
		title: "Data & Privacy",
		heading: "Data & Privacy",
		subtitle: "Data management and privacy controls.",
	},
	integrations: {
		section: "Team & Settings",
		title: "Integrations",
		heading: "Integrations",
		subtitle: "Connect third-party tools and services.",
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
