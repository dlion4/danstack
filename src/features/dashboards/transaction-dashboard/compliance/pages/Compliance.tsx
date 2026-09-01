import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import AttentionHubFab from "../../shared/components/AttentionHubFab";
import type {
	AttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import ComplianceModals from "../components/ComplianceModals";
import styles from "../styles/compliance.module.css";

/* ============================================================================
   PayMo BaaS — Compliance & AML Command Center
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.

   Refined surface: rebuilt on the PayMo business-dashboard composition —
   executive hero, numbered sections (pulse → attention → monitoring → rules →
   screening → cases & reporting), KPI pulse with sparklines, action centre,
   quick actions, table cards, floating command bar and footer. Shell chrome
   is owned by AppShell; this page renders content only. All 17 modals remain
   reachable from the page.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface NavItem {
	icon: string;
	to: string;
	label: string;
	active?: boolean;
	dot?: boolean;
}

interface SrItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	actionTone?: "btnPmD" | "btnPmP";
	modal: string;
}

interface QuickAction {
	icon: string;
	label: string;
	color: string;
	modal: string;
}

interface TableCol {
	key: string;
	label: string;
}

type Cell =
	| string
	| { badge: string; tone: BadgeTone }
	| { action: string; modal: string; tone?: string };

interface StatCardC {
	key: string;
	colClass: string;
	label: string;
	labelColor: string;
	value: string;
	badge: { icon: string; text: string; tone: BadgeTone };
	lines: { label: string; value: string }[];
	accent: string;
	icon: string;
	chipBg: string;
	chipColor: string;
	spark: string[];
}

interface ComplianceConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: {
		initials: string;
		name: string;
		role: string;
		headerInitials: string;
	};
	breadcrumb: { parents: { label: string; to: string }[]; current: string };
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	hero: {
		live: string;
		value: string;
		detail: string;
		buttons: { label: string; modal: string }[];
		rails: { label: string; pct: string }[];
	};
	statCards: StatCardC[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	liveFeed: { cols: TableCol[]; rows: Cell[][] };
	riskDistribution: {
		label: string;
		value: string;
		width: string;
		color: string;
	}[];
	riskFlagged: {
		title: string;
		body: string;
		scoreLabel: string;
		score: string;
	};
	rules: {
		title: string;
		sub: string;
		status: string;
		statusTone: BadgeTone;
		precision: string;
	}[];
	rulePerformance: { cols: TableCol[]; rows: string[][] };
	screeningSummary: { label: string; value: string }[];
	screeningRefresh: string;
	recentMatches: { cols: TableCol[]; rows: Cell[][] };
	cases: { cols: TableCol[]; rows: Cell[][] };
	filings: { cols: TableCol[]; rows: Cell[][] };
	deadlines: {
		title: string;
		sub: string;
		actionLabel: string;
		actionTone?: "btnPmD";
		modal: string;
	}[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: ComplianceConfig = {
	nav: [
		{ icon: "bi-house", to: "/dashboard", label: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", to: "/select-dashboard", label: "Hubs" },
		{
			icon: "bi-lightning-charge",
			to: "/initiate-transfer",
			label: "Transfers",
		},
		{ icon: "bi-wallet2", to: "/wallets", label: "Wallets" },
		{ icon: "bi-credit-card-2-front", to: "/cards", label: "Cards" },
		{ icon: "bi-bar-chart-line", to: "/analytics", label: "Analytics" },
		{
			icon: "bi-shield-check",
			to: "/compliance",
			label: "Compliance & AML",
			active: true,
			dot: true,
		},
		{ icon: "bi-gear", to: "/settings", label: "Settings" },
	],
	headerTitle: "Compliance & AML",
	headerSub:
		"Transaction monitoring, AML rules, sanctions screening, case management & regulatory reporting",
	searchPlaceholder: "Search transactions, alerts, cases, sanctions lists...",
	user: {
		initials: "AK",
		name: "Amina K.",
		role: "Compliance Officer",
		headerInitials: "CC",
	},
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/" },
			{ label: "Transactions Hub", to: "/select-dashboard" },
		],
		current: "Compliance & AML",
	},
	pageCode: "",
	pageTitle: "Compliance & AML",
	pageSub:
		"Real-time transaction monitoring, AML rules, sanctions & PEP screening, case investigations, and regulatory reporting across all payment rails.",
	hero: {
		live: "AML engine is live",
		value: "47,291 transactions monitored today",
		detail:
			"Real-time screening across 12 payment rails. 17 alerts generated. 4 cases under active investigation.",
		buttons: [
			{ label: "Rules", modal: "amlRulesModal" },
			{ label: "Sanctions", modal: "sanctionsSearchModal" },
			{ label: "Risk Engine", modal: "riskScoringModal" },
		],
		rails: [
			{ label: "PesaLink", pct: "100%" },
			{ label: "M-Pesa", pct: "86%" },
			{ label: "RTGS", pct: "72%" },
			{ label: "Bulk / Corporate", pct: "62%" },
			{ label: "EFT / ACH", pct: "55%" },
			{ label: "Card (Visa)", pct: "48%" },
			{ label: "SWIFT", pct: "42%" },
			{ label: "Card (Mastercard)", pct: "36%" },
			{ label: "Airtel Money", pct: "30%" },
			{ label: "Mobile Wallet", pct: "24%" },
			{ label: "T-Kash", pct: "18%" },
			{ label: "Internal Ledger", pct: "12%" },
		],
	},
	statCards: [
		{
			key: "alerts",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "HIGH RISK ALERTS",
			labelColor: "var(--pm-danger)",
			value: "17",
			badge: {
				icon: "bi-exclamation-triangle",
				text: "4 require immediate action",
				tone: "badgeD",
			},
			lines: [
				{ label: "STRs filed today:", value: "2" },
				{ label: "CTR threshold breaches:", value: "9" },
			],
			accent: "var(--pm-danger)",
			icon: "bi-exclamation-triangle",
			chipBg: "var(--pm-danger-soft)",
			chipColor: "var(--pm-danger)",
			spark: [
				"32%",
				"58%",
				"42%",
				"70%",
				"50%",
				"64%",
				"82%",
				"58%",
				"68%",
				"90%",
				"74%",
				"100%",
			],
		},
		{
			key: "detection",
			colClass: "col-lg-3 col-md-4 col-6",
			label: "AML DETECTION RATE",
			labelColor: "var(--pm-warning)",
			value: "98.7%",
			badge: {
				icon: "bi-graph-up-arrow",
				text: "+1.2% vs last month",
				tone: "badgeS",
			},
			lines: [
				{ label: "False positive rate:", value: "4.1%" },
				{ label: "Avg investigation time:", value: "2.4 hrs" },
			],
			accent: "var(--pm-warning)",
			icon: "bi-graph-up-arrow",
			chipBg: "var(--pm-warning-soft)",
			chipColor: "var(--pm-warning)",
			spark: [
				"22%",
				"34%",
				"45%",
				"40%",
				"56%",
				"62%",
				"70%",
				"66%",
				"78%",
				"85%",
				"92%",
				"100%",
			],
		},
		{
			key: "filings",
			colClass: "col-lg-3 col-md-4",
			label: "REGULATORY FILINGS",
			labelColor: "var(--pm-accent)",
			value: "142",
			badge: {
				icon: "bi-file-earmark-check",
				text: "This month",
				tone: "badgeI",
			},
			lines: [
				{ label: "STRs: 31 | CTRs: 89 | SARs: 22", value: "" },
				{ label: "Next CBK report due:", value: "30 Jun" },
			],
			accent: "var(--pm-accent)",
			icon: "bi-file-earmark-check",
			chipBg: "var(--pm-info-soft)",
			chipColor: "var(--pm-info)",
			spark: [
				"38%",
				"52%",
				"44%",
				"62%",
				"56%",
				"48%",
				"66%",
				"60%",
				"54%",
				"70%",
				"64%",
				"76%",
			],
		},
	],
	attention: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Structuring detected — 3 linked txns",
			sub: "KSh 2.8M in 48h via multiple accounts",
			actionLabel: "Investigate",
			actionTone: "btnPmD",
			modal: "newCaseModal",
		},
		{
			icon: "bi-person-x",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "PEP match on beneficiary",
			sub: "TXN-884291 — Requires enhanced due diligence",
			actionLabel: "Review",
			modal: "pepDetailModal",
		},
		{
			icon: "bi-globe",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Sanctions list update — 47 new entries",
			sub: "Screening in progress (12,400 txns)",
			actionLabel: "Scan",
			modal: "sanctionsSearchModal",
		},
	],
	suggestions: [
		{
			icon: "bi-robot",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Tighten velocity rule for cross-border",
			sub: "Reduce false positives by 18%",
			actionLabel: "Tune Rule",
			modal: "amlRulesModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Increase risk score weight for crypto exchanges",
			sub: "Current weight: 25% → Suggested: 40%",
			actionLabel: "Adjust",
			modal: "riskScoringModal",
		},
		{
			icon: "bi-link-45deg",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Enable real-time sanctions screening on PesaLink",
			sub: "Currently batch (every 15 min)",
			actionLabel: "Enable",
			modal: "monitorSettingsModal",
		},
	],
	quickActions: [
		{
			icon: "bi-folder-plus",
			label: "New Investigation",
			color: "var(--pm-danger)",
			modal: "newCaseModal",
		},
		{
			icon: "bi-globe",
			label: "Sanctions Search",
			color: "var(--pm-warning)",
			modal: "sanctionsSearchModal",
		},
		{
			icon: "bi-sliders",
			label: "Edit Rules",
			color: "var(--pm-primary-light)",
			modal: "amlRulesModal",
		},
		{
			icon: "bi-file-earmark-text",
			label: "File STR/CTR",
			color: "var(--pm-purple)",
			modal: "regReportModal",
		},
		{
			icon: "bi-speedometer2",
			label: "Risk Engine",
			color: "var(--pm-info)",
			modal: "riskScoringModal",
		},
		{
			icon: "bi-people",
			label: "Bulk Screen",
			color: "var(--pm-warning)",
			modal: "bulkScreeningModal",
		},
	],
	liveFeed: {
		cols: [
			{ key: "time", label: "Time" },
			{ key: "ref", label: "Reference" },
			{ key: "route", label: "From → To" },
			{ key: "amount", label: "Amount" },
			{ key: "rail", label: "Rail" },
			{ key: "risk", label: "Risk" },
			{ key: "status", label: "Status" },
			{ key: "actions", label: "Actions" },
		],
		rows: [
			[
				"14:32",
				"C:TXN-992184",
				"Equity → KCB",
				"STR:KES 2,450,000",
				"PesaLink",
				{ badge: "92", tone: "badgeD" },
				{ badge: "Alert", tone: "badgeD" },
				{ action: "Investigate", modal: "caseDetailModal" },
			],
			[
				"14:31",
				"C:TXN-992183",
				"Co-op → Stanbic",
				"STR:KES 185,000",
				"RTGS",
				{ badge: "48", tone: "badgeW" },
				{ badge: "Cleared", tone: "badgeS" },
				{ action: "View", modal: "txnDetailModal" },
			],
			[
				"14:30",
				"C:TXN-992182",
				"Absa → Family",
				"STR:KES 47,500",
				"ACH",
				{ badge: "12", tone: "badgeS" },
				{ badge: "Cleared", tone: "badgeS" },
				{ action: "View", modal: "txnDetailModal" },
			],
			[
				"14:29",
				"C:TXN-992181",
				"NCBA → Equity",
				"STR:USD 125,000",
				"SWIFT",
				{ badge: "78", tone: "badgeD" },
				{ badge: "Hold", tone: "badgeW" },
				{ action: "Screen", modal: "sanctionsSearchModal" },
			],
			[
				"14:28",
				"C:TXN-992180",
				"KCB → I&M",
				"STR:KES 890,000",
				"PesaLink",
				{ badge: "55", tone: "badgeW" },
				{ badge: "Cleared", tone: "badgeS" },
				{ action: "View", modal: "txnDetailModal" },
			],
		],
	},
	riskDistribution: [
		{
			label: "Low Risk (0-30)",
			value: "41,882 (88.5%)",
			width: "88.5%",
			color: "var(--pm-accent)",
		},
		{
			label: "Medium Risk (31-60)",
			value: "4,392 (9.3%)",
			width: "9.3%",
			color: "var(--pm-warning)",
		},
		{
			label: "High Risk (61-100)",
			value: "1,017 (2.2%)",
			width: "2.2%",
			color: "var(--pm-danger)",
		},
	],
	riskFlagged: {
		title: "4 transactions",
		body: "currently flagged for immediate review. Average risk score:",
		scoreLabel: "",
		score: "47.2",
	},
	rules: [
		{
			title: "Structuring Detection",
			sub: "Multiple transactions just below threshold in 48h",
			status: "Active",
			statusTone: "badgeS",
			precision: "98.4%",
		},
		{
			title: "Velocity Rule — Cross-border",
			sub: ">3 international txns in 24h from same originator",
			status: "Active",
			statusTone: "badgeS",
			precision: "94.1%",
		},
		{
			title: "Round-Tripping Detection",
			sub: "Funds returning to originator within 7 days",
			status: "Active",
			statusTone: "badgeS",
			precision: "87.6%",
		},
		{
			title: "PEP Transaction Spike",
			sub: "PEP-linked account >300% avg volume",
			status: "Active",
			statusTone: "badgeS",
			precision: "91.2%",
		},
		{
			title: "Crypto Exchange Concentration",
			sub: ">40% monthly volume to crypto exchanges",
			status: "Paused",
			statusTone: "badgeW",
			precision: "—",
		},
	],
	rulePerformance: {
		cols: [
			{ key: "rule", label: "Rule" },
			{ key: "alerts", label: "Alerts" },
			{ key: "confirmed", label: "Confirmed" },
			{ key: "precision", label: "Precision" },
		],
		rows: [
			["Structuring", "412", "89", "STR:21.6%"],
			["Velocity (Intl)", "187", "61", "STR:32.6%"],
			["Round-Trip", "94", "38", "STR:40.4%"],
			["PEP Spike", "31", "19", "STR:61.3%"],
		],
	},
	screeningSummary: [
		{ label: "Total Screened", value: "47,291" },
		{ label: "Matches Found", value: "47" },
		{ label: "False Positives", value: "38" },
		{ label: "True Matches (Confirmed)", value: "9" },
		{ label: "PEP Hits", value: "12" },
	],
	screeningRefresh: "27 Jun 2025, 06:00 EAT",
	recentMatches: {
		cols: [
			{ key: "entity", label: "Entity" },
			{ key: "list", label: "List" },
			{ key: "score", label: "Match Score" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"John Kamau (Beneficiary)",
				"UN Consolidated",
				{ badge: "98%", tone: "badgeD" },
				{ action: "Review", modal: "pepDetailModal" },
			],
			[
				"Global Trade Ltd (Originator)",
				"OFAC SDN",
				{ badge: "94%", tone: "badgeD" },
				{ action: "Review", modal: "pepDetailModal" },
			],
			[
				"Hon. Peter Ochieng (Director)",
				"Local PEP DB",
				{ badge: "72%", tone: "badgeW" },
				{ action: "Review", modal: "pepDetailModal" },
			],
		],
	},
	cases: {
		cols: [
			{ key: "id", label: "Case ID" },
			{ key: "type", label: "Type" },
			{ key: "subject", label: "Subject" },
			{ key: "risk", label: "Risk" },
			{ key: "status", label: "Status" },
			{ key: "opened", label: "Opened" },
			{ key: "owner", label: "Owner" },
			{ key: "actions", label: "Actions" },
		],
		rows: [
			[
				"C:AML-44892",
				"Structuring",
				"John K. & 3 linked accounts",
				{ badge: "92", tone: "badgeD" },
				{ badge: "Investigation", tone: "badgeD" },
				"24 Jun",
				"Sarah M.",
				{ action: "Open", modal: "caseDetailModal" },
			],
			[
				"C:AML-44885",
				"Sanctions",
				"Global Trade Ltd",
				{ badge: "94", tone: "badgeD" },
				{ badge: "Escalated", tone: "badgeW" },
				"23 Jun",
				"David O.",
				{ action: "Open", modal: "caseDetailModal" },
			],
			[
				"C:AML-44871",
				"PEP",
				"Hon. Peter Ochieng",
				{ badge: "72", tone: "badgeW" },
				{ badge: "Under Review", tone: "badgeS" },
				"22 Jun",
				"Amina K.",
				{ action: "Open", modal: "caseDetailModal" },
			],
			[
				"C:AML-44860",
				"Round-Trip",
				"TechFlow Solutions",
				{ badge: "61", tone: "badgeW" },
				{ badge: "Closed", tone: "badgeS" },
				"18 Jun",
				"James K.",
				{ action: "View", modal: "caseDetailModal" },
			],
		],
	},
	filings: {
		cols: [
			{ key: "id", label: "Report ID" },
			{ key: "type", label: "Type" },
			{ key: "subject", label: "Subject" },
			{ key: "filed", label: "Filed" },
			{ key: "status", label: "Status" },
			{ key: "actions", label: "Actions" },
		],
		rows: [
			[
				"C:STR-2025-0612",
				"STR",
				"Structuring — John K. network",
				"26 Jun",
				{ badge: "Submitted", tone: "badgeS" },
				{ action: "View", modal: "reportDetailModal" },
			],
			[
				"C:CTR-2025-0611",
				"CTR",
				"Cash deposits > KES 1M",
				"25 Jun",
				{ badge: "Acknowledged", tone: "badgeS" },
				{ action: "View", modal: "reportDetailModal" },
			],
			[
				"C:SAR-2025-0608",
				"SAR",
				"PEP adverse media",
				"22 Jun",
				{ badge: "Submitted", tone: "badgeS" },
				{ action: "View", modal: "reportDetailModal" },
			],
		],
	},
	deadlines: [
		{
			title: "STR Draft #AML-44892",
			sub: "Due in 18 hours",
			actionLabel: "Complete",
			actionTone: "btnPmD",
			modal: "caseDetailModal",
		},
		{
			title: "Monthly CBK Summary",
			sub: "Due 30 Jun 2025",
			actionLabel: "Prepare",
			modal: "regReportModal",
		},
		{
			title: "Quarterly AML Report",
			sub: "Due 15 Jul 2025",
			actionLabel: "Start",
			modal: "regReportModal",
		},
	],
};

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchCompliance(): Promise<ComplianceConfig> {
	const res = await fetch("/api/compliance");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<ComplianceConfig>;
	return { ...initialMockData, ...json };
}

/* ---------- cell renderer for data tables ---------- */
function CellValue({
	cell,
	onOpen,
}: {
	cell: Cell;
	onOpen: (id: string) => void;
}) {
	if (typeof cell === "string") {
		if (cell.startsWith("C:")) return <code>{cell.slice(2)}</code>;
		if (cell.startsWith("B:")) {
			const [, tone, text] = cell.split(":");
			const toneClass =
				tone === "s"
					? styles.badgeS
					: tone === "w"
						? styles.badgeW
						: tone === "d"
							? styles.badgeD
							: tone === "i"
								? styles.badgeI
								: styles.badgeP;
			return <span className={`${styles.badge} ${toneClass}`}>{text}</span>;
		}
		if (cell.startsWith("STR:")) return <strong>{cell.slice(4)}</strong>;
		return <>{cell}</>;
	}
	if ("badge" in cell)
		return (
			<span className={`${styles.badge} ${styles[cell.tone]}`}>
				{cell.badge}
			</span>
		);
	return (
		<button
			type="button"
			className={`${styles.btnPm} ${styles.btnSm} ${cell.tone ? styles[cell.tone as "btnPmD"] : ""}`}
			onClick={() => onOpen(cell.modal)}
		>
			{cell.action}
		</button>
	);
}

/* ---------- stable keys: zip columns with cells / dedupe spark heights ---------- */
function zipCells(
	cols: readonly TableCol[],
	row: readonly Cell[],
): Array<[TableCol, Cell]> {
	return cols.map((col, i) => [col, row[i] ?? ""] as [TableCol, Cell]);
}

function sparkBars(spark: readonly string[]): Array<[string, string]> {
	const seen = new Map<string, number>();
	return spark.map((h) => {
		const n = seen.get(h) ?? 0;
		seen.set(h, n + 1);
		return [h, `${h}#${n}`] as [string, string];
	});
}

/* ---------- section heading (business numbered pattern) ---------- */
function SectionHeading({
	id,
	index,
	title,
	description,
	action,
}: {
	id: string;
	index: string;
	title: string;
	description: string;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.sectionHeading}>
			<div className={styles.sectionHeadingCopy}>
				<span className={styles.sectionIndex} aria-hidden="true">
					{index}
				</span>
				<div>
					<h2 id={id}>{title}</h2>
					<p>{description}</p>
				</div>
			</div>
			{action && <div className={styles.sectionAction}>{action}</div>}
		</div>
	);
}

/* ---------- utility box (subtle panel inside cards) ---------- */
function Ub({
	title,
	children,
	action,
}: {
	title: string;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.ub}>
			<div
				className="d-flex justify-content-between align-items-center flex-wrap"
				style={{ gap: 8 }}
			>
				<h4 className={styles.ubTitle} style={{ margin: 0 }}>
					{title}
				</h4>
				{action}
			</div>
			<div style={{ marginTop: 12 }}>{children}</div>
		</div>
	);
}

/* ---------- KPI visual metadata (keyed by stat key) ---------- */
const STAT_ICONS: Record<string, string> = {
	alerts: "bi-exclamation-triangle",
	detection: "bi-graph-up-arrow",
	filings: "bi-file-earmark-check",
};

export default function Compliance() {
	const { data, isFetching, error } = useQuery({
		queryKey: ["paymo-compliance"],
		queryFn: fetchCompliance,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [feedSearch, setFeedSearch] = useState("");
	const [feedFilter, setFeedFilter] = useState<
		"All" | "Alert" | "Cleared" | "Hold"
	>("All");

	const handleDrawerAction = (modal: string) => {
		if (modal) openM(modal);
	};

	const drawerAttention = config.attention.map(
		(item): AttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: item.iconBg,
			iconColor: item.iconColor,
			title: item.title,
			sub: item.sub,
			actionLabel: item.actionLabel,
			modal: item.modal,
		}),
	);
	const drawerSuggestions = config.suggestions.map(
		(item): AttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: item.iconBg,
			iconColor: item.iconColor,
			title: item.title,
			sub: item.sub,
			actionLabel: item.actionLabel,
			modal: item.modal,
		}),
	);
	const drawerQuickActions = config.quickActions.map(
		(action): QuickActionItem => ({
			icon: action.icon.replace(/^bi-/, ""),
			iconColor: action.color,
			label: action.label,
			modal: action.modal,
		}),
	);

	/* Modal hygiene: scroll lock, Escape to close, focus returns to trigger. */
	useEffect(() => {
		if (!activeModal) return;
		const trigger = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setActiveModal(null);
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", closeOnEscape);
			trigger?.focus();
		};
	}, [activeModal]);

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	const feedQuery = feedSearch.trim().toLowerCase();
	const feedRows = config.liveFeed.rows.filter((row) => {
		const statusCell = row[6];
		const statusText =
			typeof statusCell === "object" && "badge" in statusCell
				? statusCell.badge
				: "";
		const matchesFilter = feedFilter === "All" || statusText === feedFilter;
		const matchesSearch =
			!feedQuery ||
			row.some(
				(cell) =>
					typeof cell === "string" && cell.toLowerCase().includes(feedQuery),
			);
		return matchesFilter && matchesSearch;
	});

	return (
		<div className={styles.compliancePage}>
			<main className={styles.main}>
				<div className={styles.content}>
					{/* ======================= EXECUTIVE HERO ======================= */}
					<section
						className={styles.heroBanner}
						aria-labelledby="compliance-page-title"
					>
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-shield-check" /> Compliance &amp; AML
									</span>
									<span className={styles.heroLive}>
										<span className={styles.dotLive} /> {config.hero.live}
										{isFetching ? (
											<small className={styles.heroRefreshing}>
												Refreshing…
											</small>
										) : null}
									</span>
								</div>
								<h1 id="compliance-page-title">
									Watch every transaction. Stay ahead of risk.
								</h1>
								<p>{config.pageSub}</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimaryBtn}
										onClick={() => openM("newCaseModal")}
									>
										<i className="bi bi-folder-plus" /> New case
									</button>
									<button
										type="button"
										className={styles.heroSecondaryBtn}
										onClick={() => openM("amlRulesModal")}
									>
										<i className="bi bi-sliders" /> Rules
									</button>
									<button
										type="button"
										className={styles.heroSecondaryBtn}
										onClick={() => openM("sanctionsSearchModal")}
									>
										<i className="bi bi-globe" /> Sanctions
									</button>
									<button
										type="button"
										className={styles.heroSecondaryBtn}
										onClick={() => openM("riskScoringModal")}
									>
										<i className="bi bi-speedometer2" /> Risk engine
									</button>
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="AML command center snapshot"
							>
								<span>Transactions monitored today</span>
								<strong>{config.hero.value}</strong>
								<p>{config.hero.detail}</p>
								<div className={styles.heroMetricRow}>
									{config.statCards.map((stat) => (
										<div key={stat.key}>
											<strong>{stat.value}</strong>
											<span>{stat.label.replace(/_/g, " ").toLowerCase()}</span>
										</div>
									))}
								</div>
								<div className={styles.throughputWrap}>
									<div className="d-flex justify-content-between align-items-center">
										<span className={styles.throughputLabel}>
											Screening load · today
										</span>
										<span className={styles.throughputCount}>
											{config.hero.rails.length} rails
										</span>
									</div>
									<div className={styles.throughputStrip}>
										{config.hero.rails.map((r) => (
											<div
												key={r.label}
												className={styles.throughputBar}
												style={{ height: r.pct }}
												title={`${r.label} · ${r.pct}`}
											/>
										))}
									</div>
								</div>
							</aside>
						</div>
					</section>

					{error ? (
						<output className={styles.statusNotice}>
							<i className="bi bi-cloud-slash" />
							<span>
								<strong>Live compliance data is temporarily unavailable</strong>
								<small>Using the latest local operating snapshot.</small>
							</span>
						</output>
					) : null}

					{/* ======================= 1.1 COMPLIANCE PULSE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="compliance-pulse-heading"
					>
						<SectionHeading
							id="compliance-pulse-heading"
							index="1.1"
							title="Compliance pulse"
							description="A concise view of risk alerts, detection quality and regulatory filing momentum."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("liveAlertsModal")}
									>
										<i className="bi bi-bell" /> Live alerts
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
										onClick={() => openM("emergencyBlockModal")}
									>
										<i className="bi bi-exclamation-triangle" /> Emergency block
									</button>
								</div>
							}
						/>
						<div className={styles.kpiGrid}>
							{config.statCards.map((stat, index) => (
								<article
									key={stat.key}
									className={`${styles.card} ${styles.kpiCard} ${index === 0 ? styles.kpiDanger : index === 1 ? styles.kpiFeatured : ""}`}
								>
									<div
										className={styles.kpiIcon}
										style={{
											background: stat.chipBg,
											color: stat.chipColor,
										}}
									>
										<i className={`bi ${STAT_ICONS[stat.key] ?? stat.icon}`} />
									</div>
									<div className={styles.kpiMeta}>
										<span>{stat.label}</span>
										<small>Live</small>
									</div>
									<strong className={styles.kpiValue}>{stat.value}</strong>
									<div className={styles.kpiFoot}>
										<span
											className={`${styles.badge} ${styles[stat.badge.tone]}`}
										>
											<i className={`bi ${stat.badge.icon}`} />{" "}
											{stat.badge.text}
										</span>
										<div className={styles.sparkline} aria-hidden="true">
											{sparkBars(stat.spark).map(([h, k]) => (
												<div
													key={k}
													className={styles.sparkBar}
													style={{ height: h, background: stat.chipColor }}
												/>
											))}
										</div>
									</div>
									<div className={styles.kpiLines}>
										{stat.lines.map((li) => (
											<div key={li.label} className={styles.kpiLine}>
												<span>{li.label}</span>
												{li.value && <strong>{li.value}</strong>}
											</div>
										))}
									</div>
								</article>
							))}
						</div>
					</section>

					{/* ======================= 1.3 REAL-TIME MONITORING ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="compliance-monitoring-heading"
					>
						<SectionHeading
							id="compliance-monitoring-heading"
							index="1.3"
							title="Real-time monitoring"
							description="Live feed of every transaction with risk scoring, alerts and immediate action capabilities."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("monitorSettingsModal")}
									>
										<i className="bi bi-gear" /> Settings
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("liveAlertsModal")}
									>
										<i className="bi bi-bell" /> Live alerts
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className={styles.panelGridWide}>
								<Ub
									title="Live transaction feed"
									action={
										<span className={`${styles.badge} ${styles.badgeS}`}>
											<i className="bi bi-radio" /> Streaming
										</span>
									}
								>
									<div
										className="d-flex flex-wrap justify-content-between align-items-center mb-2"
										style={{ gap: 8 }}
									>
										<label className={styles.tableSearch}>
											<i className="bi bi-search" />
											<span className={styles.srOnly}>Search live feed</span>
											<input
												value={feedSearch}
												onChange={(event) => setFeedSearch(event.target.value)}
												placeholder="Search ref, route or amount"
											/>
										</label>
										<fieldset className={styles.filterPills}>
											<legend className={styles.srOnly}>
												Filter feed status
											</legend>
											{(["All", "Alert", "Cleared", "Hold"] as const).map(
												(filter) => (
													<button
														type="button"
														key={filter}
														className={
															feedFilter === filter ? styles.filterActive : ""
														}
														onClick={() => setFeedFilter(filter)}
													>
														{filter}
													</button>
												),
											)}
										</fieldset>
									</div>
									<div
										className={styles.tableScroll}
										style={{ maxHeight: 320 }}
									>
										<table className={styles.tbl}>
											<thead>
												<tr>
													{config.liveFeed.cols.map((c) => (
														<th key={c.key}>{c.label}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{feedRows.map((row) => (
													<tr key={String(row[0])}>
														{zipCells(config.liveFeed.cols, row).map(
															([col, cell]) => (
																<td
																	key={`${col.key}-${typeof cell === "string" ? cell : "obj"}`}
																>
																	<CellValue cell={cell} onOpen={openM} />
																</td>
															),
														)}
													</tr>
												))}
												{feedRows.length === 0 && (
													<tr>
														<td colSpan={config.liveFeed.cols.length}>
															<div className={styles.emptyState}>
																<i className="bi bi-search" />
																<strong>No matching transactions</strong>
																<span>
																	Try a different search or status filter.
																</span>
															</div>
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
									<div className={styles.tableFooter}>
										<span>
											Showing {feedRows.length} of {config.liveFeed.rows.length}{" "}
											transactions
										</span>
										<button
											type="button"
											onClick={() => openM("liveAlertsModal")}
										>
											View all alerts <i className="bi bi-arrow-right" />
										</button>
									</div>
								</Ub>
								<Ub title="Risk distribution (today)">
									{config.riskDistribution.map((b) => (
										<div key={b.label} style={{ marginBottom: 14 }}>
											<div className="d-flex justify-content-between mb-2">
												<span className={styles.mutedSmall}>{b.label}</span>
												<strong style={{ fontSize: 12 }}>{b.value}</strong>
											</div>
											<div className={styles.pmProgress}>
												<div
													className={styles.pmProgressBar}
													style={{ width: b.width, background: b.color }}
												/>
											</div>
										</div>
									))}
									<div
										className={`${styles.summaryBoxDanger} mt-3`}
										style={{ fontSize: 12 }}
									>
										<i className="bi bi-exclamation-octagon me-1" />
										<strong>{config.riskFlagged.title}</strong>{" "}
										{config.riskFlagged.body}{" "}
										<strong>{config.riskFlagged.score}</strong>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}
										onClick={() => openM("attentionFullModal")}
									>
										<i className="bi bi-arrow-right" /> Review flagged
										transactions
									</button>
								</Ub>
							</div>
						</div>
					</section>

					{/* ======================= 1.4 AML RULES ENGINE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="compliance-rules-heading"
					>
						<SectionHeading
							id="compliance-rules-heading"
							index="1.4"
							title="AML rules engine"
							description="Create, tune and A/B test detection rules for structuring, velocity, round-tripping and sanctions evasion."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("ruleTestModal")}
									>
										<i className="bi bi-play" /> Test rules
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("amlRulesModal")}
									>
										<i className="bi bi-plus-lg" /> New rule
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-7">
									<Ub title="Active detection rules">
										{config.rules.map((r) => (
											<div className={styles.sr} key={r.title}>
												<div>
													<strong>{r.title}</strong>
													<div className={styles.mutedSmall}>{r.sub}</div>
												</div>
												<div className="d-flex flex-wrap" style={{ gap: 6 }}>
													<span
														className={`${styles.badge} ${styles[r.statusTone]}`}
													>
														{r.status}
													</span>
													<span className={`${styles.badge} ${styles.badgeP}`}>
														<i className="bi bi-bullseye" /> {r.precision}
													</span>
												</div>
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("amlRulesModal")}
										>
											<i className="bi bi-sliders" /> Manage all rules
										</button>
									</Ub>
								</div>
								<div className="col-lg-5">
									<Ub
										title="Rule performance (30 days)"
										action={
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("ruleTestModal")}
											>
												<i className="bi bi-play" /> A/B test
											</button>
										}
									>
										<div
											className={styles.tableScroll}
											style={{ maxHeight: 320 }}
										>
											<table className={styles.tbl} style={{ minWidth: 420 }}>
												<thead>
													<tr>
														{config.rulePerformance.cols.map((c) => (
															<th key={c.key}>{c.label}</th>
														))}
													</tr>
												</thead>
												<tbody>
													{config.rulePerformance.rows.map((row) => (
														<tr key={String(row[0])}>
															{zipCells(config.rulePerformance.cols, row).map(
																([col, cell]) => (
																	<td
																		key={`${col.key}-${typeof cell === "string" ? cell : "obj"}`}
																	>
																		<CellValue cell={cell} onOpen={openM} />
																	</td>
																),
															)}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</Ub>
								</div>
							</div>
						</div>
					</section>

					{/* ======================= 1.5 SANCTIONS & PEP SCREENING ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="compliance-screening-heading"
					>
						<SectionHeading
							id="compliance-screening-heading"
							index="1.5"
							title="Sanctions & PEP screening"
							description="Real-time and batch screening against UN, OFAC, EU, UK and local sanctions lists plus PEP databases."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("bulkScreeningModal")}
									>
										<i className="bi bi-people" /> Bulk screen
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("sanctionsSearchModal")}
									>
										<i className="bi bi-search" /> Search
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-5">
									<Ub title="Screening summary (today)">
										{config.screeningSummary.map((r) => (
											<div className={styles.sr} key={r.label}>
												<strong>{r.label}</strong>
												<strong>{r.value}</strong>
											</div>
										))}
										<div
											className={`${styles.summaryBoxInfo} mt-3`}
											style={{ fontSize: 12 }}
										>
											<i className="bi bi-info-circle me-1" /> Last full
											sanctions list refresh:{" "}
											<strong>{config.screeningRefresh}</strong>
										</div>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}
											onClick={() => openM("bulkScreeningModal")}
										>
											<i className="bi bi-people" /> Screen a new batch
										</button>
									</Ub>
								</div>
								<div className="col-lg-7">
									<Ub title="Recent matches">
										<div className={styles.tableScroll}>
											<table className={styles.tbl} style={{ minWidth: 520 }}>
												<thead>
													<tr>
														{config.recentMatches.cols.map((c) => (
															<th key={c.key}>{c.label}</th>
														))}
													</tr>
												</thead>
												<tbody>
													{config.recentMatches.rows.map((row) => (
														<tr key={String(row[0])}>
															{zipCells(config.recentMatches.cols, row).map(
																([col, cell]) => (
																	<td
																		key={`${col.key}-${typeof cell === "string" ? cell : "obj"}`}
																	>
																		<CellValue cell={cell} onOpen={openM} />
																	</td>
																),
															)}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</Ub>
								</div>
							</div>
						</div>
					</section>

					{/* ======================= 1.6 CASES & REGULATORY REPORTING ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="compliance-cases-heading"
					>
						<SectionHeading
							id="compliance-cases-heading"
							index="1.6"
							title="Cases & regulatory reporting"
							description="End-to-end investigation lifecycle — creation, evidence, escalation — and STR / CTR / SAR filing with deadline tracking."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("caseExportModal")}
									>
										<i className="bi bi-download" /> Export
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("newCaseModal")}
									>
										<i className="bi bi-folder-plus" /> New case
									</button>
								</div>
							}
						/>
						<article className={`${styles.card} ${styles.tableCard}`}>
							<div className={styles.tableToolbar}>
								<div className={styles.tableTitle}>
									<h3>Investigation cases</h3>
									<span>Active, escalated and closed AML cases.</span>
								</div>
								<div className={styles.tableTools}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("newCaseModal")}
									>
										<i className="bi bi-folder-plus" /> New case
									</button>
								</div>
							</div>
							<div className={styles.tableScroll}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											{config.cases.cols.map((c) => (
												<th key={c.key}>{c.label}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{config.cases.rows.map((row) => (
											<tr key={String(row[0])}>
												{zipCells(config.cases.cols, row).map(([col, cell]) => (
													<td
														key={`${col.key}-${typeof cell === "string" ? cell : "obj"}`}
													>
														<CellValue cell={cell} onOpen={openM} />
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</article>

						<div className="row g-3" style={{ marginTop: "0.25rem" }}>
							<div className="col-lg-7">
								<div className={styles.card}>
									<div className={styles.cardHeader}>
										<div>
											<span className={styles.cardKicker}>Filings</span>
											<h3>Recent filings (STR / CTR / SAR)</h3>
										</div>
										<div className={styles.headerButtonRow}>
											<button
												type="button"
												className={styles.textButton}
												onClick={() => openM("reportCalendarModal")}
											>
												<i className="bi bi-calendar" /> Calendar
											</button>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
												onClick={() => openM("regReportModal")}
											>
												<i className="bi bi-plus-lg" /> New filing
											</button>
										</div>
									</div>
									<div className={styles.tableScroll}>
										<table className={styles.tbl} style={{ minWidth: 520 }}>
											<thead>
												<tr>
													{config.filings.cols.map((c) => (
														<th key={c.key}>{c.label}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{config.filings.rows.map((row) => (
													<tr key={String(row[0])}>
														{zipCells(config.filings.cols, row).map(
															([col, cell]) => (
																<td
																	key={`${col.key}-${typeof cell === "string" ? cell : "obj"}`}
																>
																	<CellValue cell={cell} onOpen={openM} />
																</td>
															),
														)}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
							<div className="col-lg-5">
								<div className={styles.card}>
									<div className={styles.cardHeader}>
										<div>
											<span className={styles.cardKicker}>Deadlines</span>
											<h3>Filing deadlines</h3>
										</div>
										<span className={`${styles.badge} ${styles.badgeW}`}>
											<i className="bi bi-clock" /> {config.deadlines.length}{" "}
											due
										</span>
									</div>
									<div style={{ paddingTop: "0.4rem" }}>
										{config.deadlines.map((d) => (
											<div className={styles.sr} key={d.title}>
												<div>
													<strong>{d.title}</strong>
													<div className={styles.mutedSmall}>{d.sub}</div>
												</div>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm} ${d.actionTone ? styles[d.actionTone] : ""}`}
													onClick={() => openM(d.modal)}
												>
													{d.actionLabel}
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>

				{/* ======================= FLOATING COMMAND BAR ======================= */}
				<nav
					className={styles.floatingBar}
					aria-label="Quick compliance actions"
				>
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openM("newCaseModal")}
					>
						<i className="bi bi-folder-plus" /> New case
					</button>
					<button type="button" onClick={() => openM("sanctionsSearchModal")}>
						<i className="bi bi-globe" /> Sanctions
					</button>
					<button type="button" onClick={() => openM("amlRulesModal")}>
						<i className="bi bi-sliders" /> Rules
					</button>
					<button type="button" onClick={() => openM("regReportModal")}>
						<i className="bi bi-file-earmark-text" /> File STR/CTR
					</button>
					<button type="button" onClick={() => openM("liveAlertsModal")}>
						<i className="bi bi-bell" /> Alerts
					</button>
					<button
						type="button"
						className={styles.floatingDanger}
						onClick={() => openM("emergencyBlockModal")}
					>
						<i className="bi bi-exclamation-triangle" /> Emergency
					</button>
				</nav>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-check" /> Protected by PayMo secure
						transaction controls
					</span>
					<nav aria-label="Footer links">
						<a href="/pm/app/support">Support</a>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v2.4.0</span>
					</nav>
				</footer>
			</main>

			{/* ======================= ALL MODALS ======================= */}
			<AttentionHubFab
				count={drawerAttention.length}
				hidden={drawerOpen}
				onClick={() => setDrawerOpen(true)}
			/>

			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Compliance"
				pageIcon="bi-shield-check"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<ComplianceModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
