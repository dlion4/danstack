/* ============================================================================
 * 4.9 Partner Program & Marketplace — backend-ready content model.
 * ----------------------------------------------------------------------------
 * Extracted from 4.9.html: hero partner status + 3 KPI cards, the onboarding
 * checklist, marketplace app listings, community grid, upcoming events, and
 * every dataset used by the 25 modals (tiers, leads, payouts, reviews,
 * roadmap items, revenue-share table).
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
export interface OnboardingRow {
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
	primary?: boolean;
}
export interface MarketplaceApp {
	name: string;
	icon: string;
	iconBg: string;
	iconColor: string;
	status: string;
	statusTone: Tone;
	installs: string;
}
export interface CommunityTile {
	label: string;
	icon: string;
	color: string;
	modal: string;
}
export interface EventRow {
	title: string;
	when: string;
	actionLabel: string;
	modal: string;
}
export interface Tier {
	key: string;
	name: string;
	revShare: string;
	perks: string[];
	icon: string;
	color: string;
}
export interface LeadRow {
	name: string;
	industry: string;
	interest: string;
	date: string;
	status: string;
	tone: Tone;
	actionLabel: string;
}
export interface PayoutRow {
	month: string;
	merchants: string;
	volume: string;
	commission: string;
	status: string;
	tone: Tone;
}
export interface ReviewRow {
	author: string;
	stars: number;
	app: string;
	text: string;
	date: string;
	replied: boolean;
}
export interface RoadmapItem {
	title: string;
	desc: string;
	votes: number;
	status: string;
	tone: Tone;
}
export interface RevShareRow {
	tier: string;
	share: string;
	schedule: string;
}
export interface BetaProgram {
	name: string;
	desc: string;
	status: string;
	tone: Tone;
}

export interface PartnerMarketplaceContent {
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
		statusLabel: string;
		statusValue: string;
		tierName: string;
		benefits: string;
		icon: string;
		actions: { label: string; modal: string }[];
	};
	referrals: {
		label: string;
		value: string;
		badge: string;
		target: string;
		pct: number;
	};
	commissions: {
		label: string;
		value: string;
		badge: string;
		actionLabel: string;
		modal: string;
	};
	apps: {
		label: string;
		value: string;
		badge: string;
		installs: string;
		pendingReviews: string;
	};
	onboarding: OnboardingRow[];
	marketplaceApps: MarketplaceApp[];
	communityTiles: CommunityTile[];
	events: EventRow[];
	tiers: Tier[];
	leads: LeadRow[];
	payouts: PayoutRow[];
	reviews: ReviewRow[];
	roadmap: RoadmapItem[];
	revShare: RevShareRow[];
	betaPrograms: BetaProgram[];
	statusServices: { name: string; status: string; tone: Tone }[];
	notifications: { title: string; text: string; bg: string; age: string }[];
	referralLink: string;
}

export const initialMockData: PartnerMarketplaceContent = {
	pageCode: "",
	pageTitle: "Partner Program & Marketplace",
	pageSub:
		"Manage partner tiers, marketplace apps, referrals, revenue share, and collaborate with the community.",
	breadcrumb: {
		parents: [
			{ label: "Developer Home", to: "/dev" },
			{ label: "Programs", to: "/dev" },
		],
		current: "Partner & Marketplace",
	},

	header: {
		title: "Developer Portal",
		subtitle: "APIs, Integration & Technical Operations",
		searchPlaceholder: "Search API docs, webhooks, partner resources...",
		user: {
			name: "TechCorp Ltd",
			role: "Certified Partner",
			initials: "SD",
			email: "partners@techcorp.co.ke",
		},
		actions: [
			{
				icon: "bi-heart-pulse",
				title: "API Status",
				modal: "healthCheckModal",
			},
			{
				icon: "bi-bell",
				title: "Alerts",
				modal: "notificationModal",
				counter: 4,
			},
		],
	},

	pageActions: [
		{
			label: "Referral Link",
			icon: "bi-link-45deg",
			modal: "referralLinkModal",
		},
		{ label: "Publish App", icon: "bi-cloud-upload", modal: "submitAppModal" },
		{
			label: "Upgrade Tier",
			icon: "bi-stars",
			modal: "applyPartnerModal",
			primary: true,
		},
	],

	hero: {
		statusLabel: "Partner Status",
		statusValue: "● Active",
		tierName: "Certified Partner",
		benefits: "Tier benefits active: 10% Rev Share, App Listing.",
		icon: "bi-award",
		actions: [
			{ label: "Certifications", modal: "certExamModal" },
			{ label: "View Rev Share", modal: "revenueShareModal" },
		],
	},

	referrals: {
		label: "ACTIVE REFERRALS",
		value: "42",
		badge: "+8 this month",
		target: "Target 50",
		pct: 84,
	},

	commissions: {
		label: "MONTHLY COMMISSIONS",
		value: "KES 128,450",
		badge: "Paid automatically",
		actionLabel: "Payout History",
		modal: "payoutHistoryModal",
	},

	apps: {
		label: "MARKETPLACE APPS",
		value: "2 Live",
		badge: "4.8 Avg Rating",
		installs: "314",
		pendingReviews: "3",
	},

	onboarding: [
		{
			title: "Technical Certification",
			sub: "Valid until Dec 2026",
			actionLabel: "Renew",
			modal: "certExamModal",
		},
		{
			title: "Security Assessment",
			sub: "SAQ validation complete",
			actionLabel: "Review",
			modal: "securityAssessmentModal",
		},
		{
			title: "Performance Benchmarking",
			sub: "API limits & load tests",
			actionLabel: "Report",
			modal: "perfBenchmarkModal",
		},
		{
			title: "Co-Marketing Hub",
			sub: "Logos, brand guidelines",
			actionLabel: "Assets",
			modal: "coMarketingModal",
		},
		{
			title: "Lead Sharing Portal",
			sub: "2 new leads from PayMo",
			actionLabel: "View Leads",
			modal: "leadSharingModal",
			primary: true,
		},
	],

	marketplaceApps: [
		{
			name: "WooCommerce Sync",
			icon: "bi-cart",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-primary)",
			status: "Published",
			statusTone: "badgeS",
			installs: "210 Installs",
		},
		{
			name: "Payroll Importer",
			icon: "bi-calculator",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			status: "Published",
			statusTone: "badgeS",
			installs: "104 Installs",
		},
	],

	communityTiles: [
		{
			label: "Roadmap Votes",
			icon: "bi-map",
			color: "var(--pm-primary)",
			modal: "roadmapVoteModal",
		},
		{
			label: "Beta Programs",
			icon: "bi-bug",
			color: "var(--pm-warning)",
			modal: "betaEnrollModal",
		},
		{
			label: "Hackathons",
			icon: "bi-laptop",
			color: "var(--pm-accent)",
			modal: "hackathonModal",
		},
		{
			label: "Tech Blog",
			icon: "bi-envelope",
			color: "var(--pm-info)",
			modal: "newsletterSubscribeModal",
		},
	],

	events: [
		{
			title: "API Office Hours",
			when: "Every Friday, 10 AM",
			actionLabel: "Book",
			modal: "officeHoursModal",
		},
		{
			title: "Auth Workshop",
			when: "15 Nov 2026",
			actionLabel: "Join",
			modal: "techWorkshopModal",
		},
		{
			title: "Partner Summit '26",
			when: "01 Dec 2026, Nairobi",
			actionLabel: "RSVP",
			modal: "partnerSummitModal",
		},
	],

	tiers: [
		{
			key: "registered",
			name: "Registered",
			revShare: "5%",
			perks: ["Sandbox access", "Community support"],
			icon: "bi-person",
			color: "var(--pm-muted)",
		},
		{
			key: "certified",
			name: "Certified",
			revShare: "10%",
			perks: ["App listing", "Lead sharing", "Co-marketing"],
			icon: "bi-award",
			color: "var(--pm-primary)",
		},
		{
			key: "premium",
			name: "Premium",
			revShare: "18%",
			perks: ["Dedicated SA", "Priority SLA", "Summit booth"],
			icon: "bi-gem",
			color: "var(--pm-purple)",
		},
	],

	leads: [
		{
			name: "Nairobi Grocers Ltd",
			industry: "Retail",
			interest: "E-Commerce checkout",
			date: "24 Jun 2026",
			status: "New",
			tone: "badgeI",
			actionLabel: "Accept",
		},
		{
			name: "Rift Valley SACCO",
			industry: "Financial Services",
			interest: "Bulk disbursements",
			date: "21 Jun 2026",
			status: "New",
			tone: "badgeI",
			actionLabel: "Accept",
		},
		{
			name: "Coast Logistics",
			industry: "Transport",
			interest: "Payroll importer",
			date: "12 Jun 2026",
			status: "In progress",
			tone: "badgeW",
			actionLabel: "Update",
		},
	],

	payouts: [
		{
			month: "June 2026",
			merchants: "42",
			volume: "KES 12.8M",
			commission: "KES 128,450",
			status: "Paid",
			tone: "badgeS",
		},
		{
			month: "May 2026",
			merchants: "38",
			volume: "KES 11.2M",
			commission: "KES 112,300",
			status: "Paid",
			tone: "badgeS",
		},
		{
			month: "April 2026",
			merchants: "34",
			volume: "KES 9.6M",
			commission: "KES 96,120",
			status: "Paid",
			tone: "badgeS",
		},
		{
			month: "March 2026",
			merchants: "29",
			volume: "KES 8.1M",
			commission: "KES 81,400",
			status: "Paid",
			tone: "badgeS",
		},
	],

	reviews: [
		{
			author: "James M.",
			stars: 5,
			app: "WooCommerce Sync",
			text: "Setup took ten minutes and STK push just works. Excellent docs.",
			date: "2 days ago",
			replied: false,
		},
		{
			author: "Aisha K.",
			stars: 4,
			app: "WooCommerce Sync",
			text: "Great plugin. Would love multi-currency support in the next release.",
			date: "1 week ago",
			replied: false,
		},
		{
			author: "Peter O.",
			stars: 5,
			app: "Payroll Importer",
			text: "Cut our monthly payroll run from 3 hours to 15 minutes.",
			date: "2 weeks ago",
			replied: true,
		},
	],

	roadmap: [
		{
			title: "Multi-currency wallets",
			desc: "Hold and settle in USD, KES, and UGX from one account.",
			votes: 284,
			status: "Planned",
			tone: "badgeI",
		},
		{
			title: "GraphQL API",
			desc: "Single-endpoint queries for complex reporting screens.",
			votes: 176,
			status: "Researching",
			tone: "badgeW",
		},
		{
			title: "Native Flutter SDK",
			desc: "First-class Flutter package with drop-in checkout widget.",
			votes: 142,
			status: "In progress",
			tone: "badgeP",
		},
	],

	revShare: [
		{ tier: "Registered", share: "5%", schedule: "Quarterly" },
		{ tier: "Certified", share: "10%", schedule: "Monthly" },
		{ tier: "Premium", share: "18%", schedule: "Monthly + bonus" },
	],

	betaPrograms: [
		{
			name: "GraphQL API (Closed Beta)",
			desc: "Early access to the unified query endpoint.",
			status: "Open",
			tone: "badgeS",
		},
		{
			name: "Instant Settlement",
			desc: "T+0 settlement for qualifying merchants.",
			status: "Waitlist",
			tone: "badgeW",
		},
		{
			name: "AI Fraud Scoring",
			desc: "ML risk scores on every transaction.",
			status: "Open",
			tone: "badgeS",
		},
	],

	statusServices: [
		{ name: "Partner API", status: "Operational", tone: "badgeS" },
		{ name: "Marketplace Listings", status: "Operational", tone: "badgeS" },
		{ name: "Referral Tracking", status: "Operational", tone: "badgeS" },
		{ name: "Commission Payouts", status: "Operational", tone: "badgeS" },
	],

	notifications: [
		{
			title: "2 New Leads Shared",
			text: "PayMo shared 2 qualified leads matching your industry focus.",
			bg: "var(--pm-info-soft)",
			age: "3 hours ago",
		},
		{
			title: "App Review Pending Reply",
			text: "Aisha K. left a 4-star review on WooCommerce Sync.",
			bg: "var(--pm-warning-soft)",
			age: "1 day ago",
		},
		{
			title: "Commission Paid",
			text: "KES 128,450 has been deposited to your settlement account.",
			bg: "var(--pm-accent-soft)",
			age: "3 days ago",
		},
		{
			title: "Partner Summit '26",
			text: "Early-bird partner tickets are now open.",
			bg: "var(--pm-purple-soft)",
			age: "1 week ago",
		},
	],

	referralLink: "https://paymo.co.ke/r/techcorp-8f92",
};

export async function fetchPartnerMarketplace(): Promise<PartnerMarketplaceContent> {
	try {
		const res = await fetch("/api/dev/partner-marketplace");
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as PartnerMarketplaceContent;
	} catch {
		return initialMockData;
	}
}
