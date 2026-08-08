/* ============================================================================
 * Reconciliation.tsx — Page 1.6 "Reconciliation Center".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.6.html (single-file HTML/CSS/JS, ~2,450 LOC).
 *   - raw HTML converted 1:1 to TSX (class → className, style → style={{ }}),
 *     Bootstrap grid (row / col-lg-* / g-3 …) kept intact;
 *   - the legacy populateTables() helper that injected pendingData/matchedData/
 *     exceptionData/ruleData via innerHTML is replaced by typed entries inside
 *     `initialMockData` rendered with .map() — NO innerHTML anywhere;
 *   - data loads through TanStack Query (fetchReconciliationCenter →
 *     GET /api/reconciliation-center) with the bundled mock as fallback;
 *     Bootstrap .spinner-border covers isLoading, .alert-danger covers error;
 *   - the legacy pm-sidebar + pm-header chrome is replaced by the shared
 *     AppShell (this page renders inside routes/app.tsx <Outlet />);
 *   - all 19 Bootstrap-JS modals + flows{} + sw() + doAction() became React
 *     state-driven modals (see ../components/ReconciliationModals.tsx). The
 *     two duplicate legacy #filterModal blocks were merged into one.
 *
 * FACILITATOR REBUILD: the page is now a payment-facilitator reconciliation
 * workspace — it verifies the money flows from the Settlement page (what
 * flowed) and the Liquidity page (what's in the tanks) against the actual
 * rail/settlement statements. Every row carries a traceable chain:
 *   customer txn (COL-/ORD-/PLT-) → business → rail → statement → float link
 *   (RB-…). Bank/SWIFT/FX concepts removed; team permissions replaced by the
 *   My Recon Access scope panel. Business selector refilters every table.
 *
 * STYLES: ../styles/reconciliation.module.css (emerald theme = Transfer theme).
 * ========================================================================== */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import {
	type ReconciliationData,
	ReconciliationModals,
} from "../components/ReconciliationModals";
import s from "../styles/reconciliation.module.css";

type Tone = "success" | "warn" | "danger" | "info" | "purple" | "neutral";
type Stream = "collection" | "payout" | "float";

const toneBadge: Record<Tone, string> = {
	success: s.badgeSuccess,
	warn: s.badgeWarn,
	danger: s.badgeDanger,
	info: s.badgeInfo,
	purple: s.badgePurple,
	neutral: s.badgeOutline,
};
const toneIcon: Record<Tone, string> = {
	success: s.toneSuccess,
	warn: s.toneWarn,
	danger: s.toneDanger,
	info: s.toneInfo,
	purple: s.tonePurple,
	neutral: s.toneNeutral,
};
type ToneColor = "pri" | "warn" | "danger" | "info" | "purple" | "muted";
function toneColor(t: ToneColor): string {
	switch (t) {
		case "pri":
			return "var(--pri)";
		case "warn":
			return "var(--warning)";
		case "danger":
			return "var(--danger)";
		case "info":
			return "var(--info)";
		case "purple":
			return "var(--purple)";
		default:
			return "var(--ink-500)";
	}
}

const streamMeta: Record<Stream, { icon: string; cls: string; label: string }> = {
	collection: { icon: "bi-arrow-down-circle", cls: s.streamCollection, label: "Collection" },
	payout: { icon: "bi-arrow-up-circle", cls: s.streamPayout, label: "Payout" },
	float: { icon: "bi-arrow-left-right", cls: s.streamFloat, label: "Float" },
};

/* --------------------------------------------------------------------------
 * Types for the extracted content model.
 * ------------------------------------------------------------------------ */
interface Row {
	icon: string;
	tone: Tone;
	title: string;
	sub: string;
	action: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	tone: ToneColor;
	label: string;
	modal: string;
}
interface CoverageRow {
	name: string;
	rate: string;
	tone: Tone;
}
interface ActivityBar {
	height: number;
	color: ToneColor;
	label: string;
}
interface ExceptionBreakdown {
	label: string;
	tone: Tone;
	count: string;
}
interface HealthTile {
	label: string;
	value: string;
	tone: "success" | "info" | "warn";
}
interface PendingRow {
	date: string;
	business: string;
	customerRef: string;
	stream: Stream;
	rail: string;
	expected: string;
	received: string;
	variance: string;
	status: string;
	statusTone: Tone;
}
interface MatchedRow {
	id: string;
	date: string;
	business: string;
	recordSide: string;
	statementSide: string;
	amount: string;
	by: string;
	time: string;
	floatLink: string;
	status: string;
	statusTone: Tone;
}
interface ExceptionRow {
	id: string;
	ref: string;
	business: string;
	stream: Stream;
	issue: string;
	amount: string;
	priority: string;
	priorityTone: Tone;
	assigned: string;
}
interface RuleRow {
	name: string;
	business: string;
	conditions: string;
	rate: string;
	lastRun: string;
	status: string;
	statusTone: Tone;
}
interface TopRule {
	name: string;
	sub: string;
	rate: string;
}
interface AuditRow {
	time: string;
	user: string;
	action: string;
	item: string;
	result: string;
	resultTone: Tone;
}
interface ToleranceRow {
	label: string;
	value: string;
}
interface NotifyToggle {
	label: string;
	on: boolean;
}
interface ScopeRow {
	scope: string;
	desc: string;
	granted: boolean;
}

export interface ReconciliationContent extends ReconciliationData {
	heroTitle: string;
	heroValue: string;
	heroSub: string;
	matchedStat: { label: string; value: string; badge: string; pct: number };
	pendingStat: {
		label: string;
		value: string;
		badge: string;
		line1: string;
		line2: string;
	};
	auditStat: { label: string; value: string; badge: string; lastRun: string };
	attention: Row[];
	suggestions: Row[];
	quickActions: QuickAction[];
	coverage: CoverageRow[];
	activityBars: ActivityBar[];
	exceptionBreakdown: ExceptionBreakdown[];
	healthTiles: HealthTile[];
	pending: PendingRow[];
	matched: MatchedRow[];
	exceptions: ExceptionRow[];
	rules: RuleRow[];
	topRules: TopRule[];
	quickReports: { label: string; modal: string }[];
	auditActivity: AuditRow[];
	tolerances: ToleranceRow[];
	notifications: NotifyToggle[];
	reconAccess: ScopeRow[];
	businesses: string[];
	rails: string[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating block from legacy 1.6.html extracted
 * (includes the four rows that legacy populateTables() injected via innerHTML).
 * GET /api/reconciliation-center should return this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: ReconciliationContent = {
	heroTitle: "Reconciliation coverage is live",
	heroValue: "98.2% match rate",
	heroSub:
		"Land Buyers LTD 98.2% • Company 2 96.4% — collections, payouts and float movements verified against rail statements.",

	matchedStat: {
		label: "MATCHED TODAY",
		value: "8,412",
		badge: "+312 since morning",
		pct: 98.2,
	},
	pendingStat: {
		label: "PENDING / EXCEPTIONS",
		value: "47",
		badge: "5 high-value",
		line1: "KES 18.4M in unmatched customer payments",
		line2: "1 float refill pending linkage",
	},
	auditStat: {
		label: "AUDIT TRAIL",
		value: "124,892",
		badge: "entries this month",
		lastRun: "Last reconciliation run: Today 06:00",
	},

	attention: [
		{
			icon: "bi-bank",
			tone: "danger",
			title: "Land Buyers LTD installment unmatched",
			sub: "KES 2.25M • PLT-088 • bank statement not received",
			action: "Match",
			modal: "manualMatchModal",
		},
		{
			icon: "bi-exclamation-triangle",
			tone: "warn",
			title: "Company 2 M-Pesa batch variance",
			sub: "KES 48,200 • ORD-8899 • amount mismatch",
			action: "Review",
			modal: "discrepancyModal",
		},
		{
			icon: "bi-arrow-left-right",
			tone: "info",
			title: "Float refill RB-9923 not yet linked",
			sub: "Business Wallet → Land Buyers float • KES 3M",
			action: "Track",
			modal: "manualMatchModal",
		},
	],
	suggestions: [
		{
			icon: "bi-magic",
			tone: "success",
			title: "Run auto-match on 34 pending items",
			sub: "Confidence > 92%",
			action: "Run",
			modal: "runAutoReconModal",
		},
		{
			icon: "bi-link-45deg",
			tone: "warn",
			title: "Create rule for Land Buyers Friday installments",
			sub: "Ref prefix PLT- • weekly batch",
			action: "Create",
			modal: "ruleEngineModal",
		},
		{
			icon: "bi-file-earmark-text",
			tone: "purple",
			title: "Export June reconciliation for Company 2",
			sub: "Ready for the business to verify",
			action: "Export",
			modal: "exportReportModal",
		},
	],
	quickActions: [
		{
			icon: "bi-hand-index",
			tone: "pri",
			label: "Manual Match",
			modal: "manualMatchModal",
		},
		{
			icon: "bi-exclamation-triangle",
			tone: "warn",
			label: "Flag Exception",
			modal: "discrepancyModal",
		},
		{
			icon: "bi-upload",
			tone: "pri",
			label: "Upload Statement",
			modal: "uploadStatementModal",
		},
		{
			icon: "bi-collection",
			tone: "info",
			label: "Bulk Match",
			modal: "bulkMatchModal",
		},
		{
			icon: "bi-magic",
			tone: "purple",
			label: "Auto-Rule",
			modal: "ruleEngineModal",
		},
		{
			icon: "bi-play-fill",
			tone: "success",
			label: "Run Auto-Recon",
			modal: "runAutoReconModal",
		},
		{
			icon: "bi-clock-history",
			tone: "muted",
			label: "Audit Log",
			modal: "auditLogModal",
		},
		{
			icon: "bi-download",
			tone: "pri",
			label: "Reports",
			modal: "exportReportModal",
		},
	],

	coverage: [
		{ name: "Land Buyers LTD", rate: "98.2%", tone: "success" },
		{ name: "Company 2", rate: "96.4%", tone: "warn" },
		{ name: "M-Pesa", rate: "99.1%", tone: "success" },
		{ name: "Card", rate: "97.8%", tone: "success" },
		{ name: "Bank transfer", rate: "98.8%", tone: "success" },
	],
	activityBars: [
		{ height: 85, color: "pri", label: "L.Buyers" },
		{ height: 90, color: "info", label: "Co. 2" },
		{ height: 72, color: "muted", label: "M-Pesa" },
		{ height: 55, color: "warn", label: "Card" },
		{ height: 60, color: "purple", label: "Bank" },
	],
	exceptionBreakdown: [
		{ label: "Amount mismatch", tone: "danger", count: "18" },
		{ label: "Duplicate", tone: "warn", count: "9" },
		{ label: "Missing reference", tone: "info", count: "12" },
		{ label: "Missing statement", tone: "purple", count: "5" },
		{ label: "Timing difference", tone: "success", count: "3" },
	],
	healthTiles: [
		{ label: "AUTO-MATCH RATE", value: "98.2%", tone: "success" },
		{ label: "MANUAL REVIEW NEEDED", value: "47 items", tone: "info" },
		{ label: "AVG RESOLUTION TIME", value: "14 min", tone: "warn" },
	],

	pending: [
		{
			date: "27 Jun",
			business: "Land Buyers LTD",
			customerRef: "PLT-088",
			stream: "collection",
			rail: "Bank transfer",
			expected: "KES 2,250,000",
			received: "—",
			variance: "KES 2,250,000",
			status: "Unmatched",
			statusTone: "warn",
		},
		{
			date: "27 Jun",
			business: "Company 2",
			customerRef: "ORD-8899",
			stream: "collection",
			rail: "M-Pesa",
			expected: "KES 48,200",
			received: "KES 47,900",
			variance: "KES 300",
			status: "Exception",
			statusTone: "danger",
		},
		{
			date: "26 Jun",
			business: "Company 2",
			customerRef: "ORD-8897",
			stream: "payout",
			rail: "M-Pesa",
			expected: "KES 12,400",
			received: "KES 12,400",
			variance: "Duplicate",
			status: "Exception",
			statusTone: "danger",
		},
		{
			date: "26 Jun",
			business: "Land Buyers LTD",
			customerRef: "RB-9923",
			stream: "float",
			rail: "Paymo wallet",
			expected: "KES 3,000,000",
			received: "KES 3,000,000",
			variance: "Unlinked",
			status: "Unmatched",
			statusTone: "warn",
		},
	],
	matched: [
		{
			id: "MATCH-88291",
			date: "27 Jun",
			business: "Land Buyers LTD",
			recordSide: "COL-5501",
			statementSide: "M-Pesa stmt",
			amount: "KES 4,500,000",
			by: "You",
			time: "14:32",
			floatLink: "RB-9921",
			status: "Matched",
			statusTone: "success",
		},
		{
			id: "MATCH-88290",
			date: "27 Jun",
			business: "Company 2",
			recordSide: "ORD-8901",
			statementSide: "M-Pesa stmt",
			amount: "KES 12,400",
			by: "System",
			time: "14:28",
			floatLink: "RB-9922",
			status: "Matched",
			statusTone: "success",
		},
		{
			id: "MATCH-88289",
			date: "26 Jun",
			business: "Land Buyers LTD",
			recordSide: "PLT-087",
			statementSide: "Bank stmt",
			amount: "KES 2,250,000",
			by: "System",
			time: "09:10",
			floatLink: "RB-9920",
			status: "Matched",
			statusTone: "success",
		},
	],
	exceptions: [
		{
			id: "EXC-9910",
			ref: "ORD-8899",
			business: "Company 2",
			stream: "collection",
			issue: "Amount mismatch",
			amount: "KES 300",
			priority: "High",
			priorityTone: "danger",
			assigned: "You",
		},
		{
			id: "EXC-9909",
			ref: "ORD-8897",
			business: "Company 2",
			stream: "payout",
			issue: "Duplicate",
			amount: "KES 12,400",
			priority: "Medium",
			priorityTone: "warn",
			assigned: "You",
		},
		{
			id: "EXC-9908",
			ref: "PLT-088",
			business: "Land Buyers LTD",
			stream: "collection",
			issue: "Missing statement",
			amount: "KES 2,250,000",
			priority: "High",
			priorityTone: "danger",
			assigned: "System",
		},
	],
	rules: [
		{
			name: "Land Buyers weekly installments",
			business: "Land Buyers LTD",
			conditions: "Ref prefix PLT- • amount ± KES 500",
			rate: "99.1%",
			lastRun: "Fri 09:00",
			status: "Active",
			statusTone: "success",
		},
		{
			name: "Company 2 M-Pesa orders",
			business: "Company 2",
			conditions: "Ref prefix ORD- • 3-day window",
			rate: "99.4%",
			lastRun: "Today 06:00",
			status: "Active",
			statusTone: "success",
		},
		{
			name: "Float refill auto-match",
			business: "All businesses",
			conditions: "Ref prefix RB- • exact amount",
			rate: "100%",
			lastRun: "Today 06:00",
			status: "Active",
			statusTone: "success",
		},
	],
	topRules: [
		{
			name: "Land Buyers installments",
			sub: "Ref prefix PLT- + exact amount",
			rate: "99.1%",
		},
		{
			name: "Company 2 M-Pesa orders",
			sub: "Ref prefix ORD- + 3-day window",
			rate: "99.4%",
		},
		{ name: "Float refill", sub: "Ref prefix RB- same day", rate: "100%" },
	],

	quickReports: [
		{ label: "Daily Reconciliation", modal: "exportReportModal" },
		{ label: "Monthly Summary", modal: "exportReportModal" },
		{ label: "Exception Report", modal: "exportReportModal" },
		{ label: "Audit Certificate", modal: "exportReportModal" },
	],
	auditActivity: [
		{
			time: "14:32",
			user: "You",
			action: "Manual Match",
			item: "COL-5501",
			result: "Matched",
			resultTone: "success",
		},
		{
			time: "14:28",
			user: "System",
			action: "Auto-Rule",
			item: "34 items",
			result: "Success",
			resultTone: "success",
		},
		{
			time: "13:55",
			user: "You",
			action: "Flag Exception",
			item: "ORD-8899",
			result: "Flagged",
			resultTone: "warn",
		},
		{
			time: "13:50",
			user: "System",
			action: "Statement Upload",
			item: "M-Pesa 27 Jun",
			result: "Processed",
			resultTone: "success",
		},
	],

	tolerances: [
		{ label: "Amount tolerance", value: "± KES 100" },
		{ label: "Date window", value: "± 3 days" },
		{ label: "Reference similarity", value: "85%" },
	],
	notifications: [
		{ label: "High-value exceptions", on: true },
		{ label: "Auto-match success", on: true },
		{ label: "Daily summary email", on: false },
	],
	reconAccess: [
		{
			scope: "View customer transactions",
			desc: "See all 239 customers' txn details in the workbench",
			granted: true,
		},
		{
			scope: "Initiate refunds",
			desc: "Auto-approve refunds under KES 5K to resolve exceptions",
			granted: true,
		},
		{
			scope: "Reverse chargebacks / disputes",
			desc: "File and manage disputes on unmatched items",
			granted: true,
		},
		{
			scope: "Hold settlements",
			desc: "Pause a business's payouts while an exception is open",
			granted: false,
		},
		{
			scope: "Export statements",
			desc: "Reconciliation certificates & audit reports",
			granted: true,
		},
	],

	/* option lists consumed by the modal forms */
	businesses: ["Land Buyers LTD", "Company 2"],
	rails: ["M-Pesa", "Card", "Bank transfer", "Paymo wallet"],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchReconciliationCenter(): Promise<ReconciliationContent> {
	const res = await fetch("/api/reconciliation-center", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as ReconciliationContent;
}

/* --------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------ */
export default function Reconciliation() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [biz, setBiz] = useState("all");
	const openModal = (id: string) =>
		setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) =>
		setModalState((p) => ({ ...p, [id]: false }));

	const { data, error, isLoading } = useQuery({
		queryKey: ["paymo-reconciliation-center"],
		queryFn: fetchReconciliationCenter,
		staleTime: 60_000,
		retry: 1,
	});
	// Falls back to initialMockData so the page never breaks.
	const c = data ?? initialMockData;

	const bizName =
		biz === "land" ? "Land Buyers LTD" : biz === "co2" ? "Company 2" : "";
	const inScope = (b: string) => biz === "all" || b === bizName;
	const bizPending = c.pending.filter((p) => inScope(p.business));
	const bizMatched = c.matched.filter((m) => inScope(m.business));
	const bizExceptions = c.exceptions.filter((e) => inScope(e.business));
	const bizRules = c.rules.filter((r) => inScope(r.business));

	const scopeTag =
		biz === "all"
			? "All businesses"
			: biz === "land"
				? "Land Buyers LTD"
				: "Company 2";

	const renderRow = (item: Row) => (
		<div className={s.rowItem} key={item.title}>
			<div className={s.rowLead}>
				<div className={cx(s.rowIcon, toneIcon[item.tone])}>
					<i className={cx("bi", item.icon)} />
				</div>
				<div style={{ minWidth: 0 }}>
					<div className={s.rowTitle}>{item.title}</div>
					<div className={s.rowSub}>{item.sub}</div>
				</div>
			</div>
			<button
				type="button"
				className={cx(s.btn, s.btnSm)}
				onClick={() => openModal(item.modal)}
			>
				{item.action}
			</button>
		</div>
	);

	return (
		<div className={s.pageRoot} style={{ position: "relative" }}>
			{/* ===== TanStack Query: loading spinner ===== */}
			{isLoading && (
				<div className={s.qLoading} role="status" aria-live="polite">
					<div
						className="spinner-border"
						style={{ width: "3rem", height: "3rem" }}
					/>
					<span>Loading reconciliation center…</span>
				</div>
			)}

			{/* ===== TanStack Query: error banner ===== */}
			{error && (
				<div className={cx("alert alert-danger", s.qError)} role="alert">
					<strong>
						<i className="bi bi-exclamation-triangle me-2" />
						Reconciliation data unavailable
					</strong>
					<div className="small mt-1">
						<code>/api/reconciliation-center</code> — {(error as Error).message}
						. Showing bundled sample data.
					</div>
				</div>
			)}

			<div className={s.stack}>
				{/* ---------- page bar ---------- */}
				<div className={s.pageBar}>
					<div>
						<div className={s.breadcrumb}>
							<Link to="/app">Home</Link> /{" "}
							<Link to="/app/transfers">B2B Transactions</Link> /{" "}
							<strong>Reconciliation Center</strong>
						</div>
						<div className={cx(s.bizBar, "mt-2")}>
							<span className={s.bizLabel}>Scope</span>
							<div className={s.pills}>
								<button
									type="button"
									className={cx(s.pill, biz === "all" && s.pillActive)}
									onClick={() => setBiz("all")}
								>
									All businesses
								</button>
								<button
									type="button"
									className={cx(s.pill, biz === "land" && s.pillActive)}
									onClick={() => setBiz("land")}
								>
									Land Buyers LTD <span className="ms-1">30</span>
								</button>
								<button
									type="button"
									className={cx(s.pill, biz === "co2" && s.pillActive)}
									onClick={() => setBiz("co2")}
								>
									Company 2 <span className="ms-1">209</span>
								</button>
							</div>
						</div>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button
							type="button"
							className={cx(s.btn, s.btnSm)}
							onClick={() => openModal("runAutoReconModal")}
						>
							<i className="bi bi-magic" /> Run Auto-Recon
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnSm)}
							onClick={() => openModal("teamAccessModal")}
						>
							<i className="bi bi-shield-check" /> My Recon Access
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnPrimary, s.btnSm)}
							onClick={() => openModal("manualMatchModal")}
						>
							<i className="bi bi-hand-index" /> Manual Match
						</button>
					</div>
				</div>

				{/* ---------- HERO STATS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div
							className={cx(s.card, s.cardAccent)}
							style={{ minHeight: 170 }}
						>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									color: "rgba(255,255,255,.78)",
								}}
							>
								{c.heroTitle} <span style={{ color: "#86efac" }}>●</span>
							</p>
							<div
								className={s.statValue}
								style={{ margin: "8px 0", color: "#fff" }}
							>
								{c.heroValue}
							</div>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									color: "rgba(255,255,255,.78)",
								}}
							>
								{c.heroSub}
							</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button
									type="button"
									className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)}
									onClick={() => openModal("runAutoReconModal")}
								>
									Auto-Reconcile
								</button>
								<button
									type="button"
									className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)}
									onClick={() => openModal("ruleEngineModal")}
								>
									Rules
								</button>
							</div>
						</div>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.statLabel} style={{ color: "var(--pri)" }}>
								{c.matchedStat.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.matchedStat.value}
							</div>
							<span className={cx(s.badge, s.badgeSuccess)}>
								<i className="bi bi-check-circle" /> {c.matchedStat.badge}
							</span>
							<div className={cx(s.progress, "mt-2")}>
								<div
									className={s.progressBar}
									style={{ width: `${c.matchedStat.pct}%` }}
								/>
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.statLabel} style={{ color: "var(--warning)" }}>
								{c.pendingStat.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.pendingStat.value}
							</div>
							<span className={cx(s.badge, s.badgeWarn)}>
								<i className="bi bi-exclamation-triangle" />{" "}
								{c.pendingStat.badge}
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--ink-700)" }}
							>
								{c.pendingStat.line1}
								<br />
								{c.pendingStat.line2}
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4">
						<div
							className={cx(s.card, s.cardInfoEdge)}
							style={{ minHeight: 170 }}
						>
							<p className={s.statLabel} style={{ color: "var(--info)" }}>
								{c.auditStat.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.auditStat.value}
							</div>
							<span className={cx(s.badge, s.badgeInfo)}>
								<i className="bi bi-clock-history" /> {c.auditStat.badge}
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--ink-700)" }}
							>
								{c.auditStat.lastRun}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- ATTENTION / SUGGESTIONS / QUICK ACTIONS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Attention Required</h3>
								<button
									type="button"
									className={cx(s.btn, s.btnSm)}
									onClick={() => openModal("attentionFullModal")}
								>
									View all
								</button>
							</div>
							{c.attention.map(renderRow)}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Smart Suggestions</h3>
								<span className={cx(s.badge, s.badgePurple)}>
									<i className="bi bi-stars" /> AI
								</span>
							</div>
							{c.suggestions.map(renderRow)}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div style={{ marginBottom: 16 }}>
								<h3 className={s.sectionTitle}>Quick Actions</h3>
								<p className={s.sectionSub}>
									Frequent reconciliation workflows
								</p>
							</div>
							<div className={s.qaGrid}>
								{c.quickActions.map((qa) => (
									<button
										key={qa.label}
										type="button"
										className={s.qaBtn}
										onClick={() => openModal(qa.modal)}
									>
										<i
											className={cx("bi", qa.icon)}
											style={{ color: toneColor(qa.tone) }}
										/>
										{qa.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION Overview Dashboard ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-speedometer2" /> Reconciliation Overview
								Dashboard
							</h3>
							<p className={s.sectionSub}>
								Real-time coverage across your linked businesses and payout
								rails — {scopeTag}.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("healthCheckModal")}
							>
								<i className="bi bi-heart-pulse" /> Health
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm, s.btnPrimary)}
								onClick={() => openModal("runAutoReconModal")}
							>
								<i className="bi bi-play-fill" /> Run Now
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Business &amp; Rail Coverage</h4>
								{c.coverage.map((b) => (
									<div className={s.rowItem} key={b.name}>
										<div>{b.name}</div>
										<span className={cx(s.badge, toneBadge[b.tone])}>
											{b.rate}
										</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Today's Activity</h4>
								<div className={s.chartBars} style={{ height: 80 }}>
									{c.activityBars.map((b) => (
										<div
											key={b.label}
											className={s.chartBar}
											style={{
												height: `${b.height}%`,
												background: toneColor(b.color),
											}}
										>
											<span className={s.barLabel}>{b.label}</span>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Exception Breakdown</h4>
								{c.exceptionBreakdown.map((e) => (
									<div className={s.rowItem} key={e.label}>
										<span className={cx(s.badge, toneBadge[e.tone])}>
											{e.label}
										</span>
										<strong>{e.count}</strong>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Reconciliation Health</h4>
								{c.healthTiles.map((t) => (
									<div
										key={t.label}
										className={cx(
											s.tile,
											t.tone === "success"
												? s.tileSuccess
												: t.tone === "info"
													? s.tileInfo
													: s.tileWarn,
											"mb-2",
										)}
									>
										<div className={s.tileTitle}>{t.label}</div>
										<div className={s.tileValue} style={{ fontSize: 24 }}>
											{t.value}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION Pending Reconciliations Workbench ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i
									className="bi bi-clock-history"
									style={{ color: "var(--warning)" }}
								/>{" "}
								Pending Reconciliations Workbench
							</h3>
							<p className={s.sectionSub}>
								Unmatched customer payments, payouts and float movements
								requiring attention — {scopeTag}.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("filterModal")}
							>
								<i className="bi bi-funnel" /> Filters
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm, s.btnPrimary)}
								onClick={() => openModal("bulkMatchModal")}
							>
								<i className="bi bi-check2-all" /> Bulk Match
							</button>
						</div>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Date</th>
									<th>Business</th>
									<th>Customer Ref</th>
									<th>Stream</th>
									<th>Rail</th>
									<th>Expected</th>
									<th>Received</th>
									<th>Variance</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{bizPending.map((p) => {
									const sm = streamMeta[p.stream];
									return (
										<tr key={`${p.customerRef}-${p.date}`}>
											<td>{p.date}</td>
											<td>
												<strong>{p.business}</strong>
											</td>
											<td>
												<code>{p.customerRef}</code>
											</td>
											<td>
												<span className={cx(s.streamTag, sm.cls)}>
													<i className={cx("bi", sm.icon)} /> {sm.label}
												</span>
											</td>
											<td>{p.rail}</td>
											<td>{p.expected}</td>
											<td>{p.received}</td>
											<td>
												<strong>{p.variance}</strong>
											</td>
											<td>
												<span
													className={cx(s.badge, toneBadge[p.statusTone])}
												>
													{p.status}
												</span>
											</td>
											<td>
												<div
													className="d-flex"
													style={{ gap: 4, flexWrap: "wrap" }}
												>
													<button
														type="button"
														className={cx(s.btn, s.btnSm)}
														onClick={() => openModal("manualMatchModal")}
													>
														Match
													</button>
													<button
														type="button"
														className={cx(s.btn, s.btnSm)}
														onClick={() => openModal("discrepancyModal")}
													>
														Flag
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- SECTION Matched Transactions ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-check2-circle" /> Matched Transactions
							</h3>
							<p className={s.sectionSub}>
								Verified items — Paymo record vs rail statement, with the float
								movement each one funded — {scopeTag}.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("matchedFilterModal")}
							>
								<i className="bi bi-funnel" /> Filter
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("exportReportModal")}
							>
								<i className="bi bi-download" /> Export
							</button>
						</div>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Match ID</th>
									<th>Date</th>
									<th>Business</th>
									<th>Paymo Record</th>
									<th>Statement</th>
									<th>Amount</th>
									<th>Matched By</th>
									<th>Float Link</th>
									<th>View</th>
								</tr>
							</thead>
							<tbody>
								{bizMatched.map((m) => (
									<tr key={m.id}>
										<td>
											<code>{m.id}</code>
										</td>
										<td>{m.date}</td>
										<td>
											<strong>{m.business}</strong>
										</td>
										<td>{m.recordSide}</td>
										<td>{m.statementSide}</td>
										<td>
											<strong>{m.amount}</strong>
										</td>
										<td>{m.by}</td>
										<td>
											<span className={s.floatLink}>
												<i className="bi bi-arrow-left-right" /> {m.floatLink}
											</span>
										</td>
										<td>
											<button
												type="button"
												className={cx(s.btn, s.btnSm)}
												onClick={() => openModal("auditLogModal")}
											>
												View
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- SECTION Discrepancies & Exceptions ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i
									className="bi bi-exclamation-triangle"
									style={{ color: "var(--danger)" }}
								/>{" "}
								Discrepancies &amp; Exceptions
							</h3>
							<p className={s.sectionSub}>
								Investigate, flag, refund, dispute or re-match unmatched items —
								{scopeTag}.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("discrepancyModal")}
							>
								<i className="bi bi-plus-lg" /> New Exception
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("disputeModal")}
							>
								<i className="bi bi-flag" /> Dispute
							</button>
						</div>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Exception ID</th>
									<th>Ref</th>
									<th>Business</th>
									<th>Stream</th>
									<th>Issue</th>
									<th>Amount</th>
									<th>Priority</th>
									<th>Assigned</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{bizExceptions.map((e) => {
									const sm = streamMeta[e.stream];
									return (
										<tr key={e.id}>
											<td>
												<code>{e.id}</code>
											</td>
											<td>{e.ref}</td>
											<td>
												<strong>{e.business}</strong>
											</td>
											<td>
												<span className={cx(s.streamTag, sm.cls)}>
													<i className={cx("bi", sm.icon)} /> {sm.label}
												</span>
											</td>
											<td>{e.issue}</td>
											<td>
												<strong>{e.amount}</strong>
											</td>
											<td>
												<span
													className={cx(s.badge, toneBadge[e.priorityTone])}
												>
													{e.priority}
												</span>
											</td>
											<td>{e.assigned}</td>
											<td>
												<div
													className="d-flex"
													style={{ gap: 4, flexWrap: "wrap" }}
												>
													<button
														type="button"
														className={cx(s.btn, s.btnSm)}
														onClick={() => openModal("manualMatchModal")}
													>
														Resolve
													</button>
													<button
														type="button"
														className={cx(s.btn, s.btnSm)}
														onClick={() => openModal("disputeModal")}
													>
														Dispute
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- SECTION Auto-Reconciliation Rules Engine ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-magic" style={{ color: "var(--purple)" }} />{" "}
								Auto-Reconciliation Rules Engine
							</h3>
							<p className={s.sectionSub}>
								Per-business matching rules for collections, payouts and float
								refills — {scopeTag}.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("ruleEngineModal")}
							>
								<i className="bi bi-plus-lg" /> New Rule
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("rulePerformanceModal")}
							>
								<i className="bi bi-graph-up" /> Performance
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Rule Name</th>
											<th>Business</th>
											<th>Conditions</th>
											<th>Match Rate</th>
											<th>Last Run</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{bizRules.map((r) => (
											<tr key={r.name}>
												<td>{r.name}</td>
												<td>
													<strong>{r.business}</strong>
												</td>
												<td>{r.conditions}</td>
												<td>{r.rate}</td>
												<td>{r.lastRun}</td>
												<td>
													<span
														className={cx(s.badge, toneBadge[r.statusTone])}
													>
														{r.status}
													</span>
												</td>
												<td>
													<button
														type="button"
														className={cx(s.btn, s.btnSm)}
														onClick={() => openModal("rulePerformanceModal")}
													>
														View
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Top Performing Rules</h4>
								{c.topRules.map((r) => (
									<div className={s.rowItem} key={r.name}>
										<div style={{ minWidth: 0 }}>
											<strong>{r.name}</strong>
											<div className={s.rowSub}>{r.sub}</div>
										</div>
										<span className={cx(s.badge, s.badgeSuccess)}>
											{r.rate}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION Reports, Exports & Audit Trail ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i
									className="bi bi-file-earmark-bar-graph"
									style={{ color: "var(--info)" }}
								/>{" "}
								Reports, Exports &amp; Audit Trail
							</h3>
							<p className={s.sectionSub}>
								Per-business reconciliation statements, audit logs and
								certificates.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("exportReportModal")}
							>
								<i className="bi bi-download" /> Export
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("auditLogModal")}
							>
								<i className="bi bi-clock-history" /> Audit Log
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Quick Reports</h4>
								<div className={s.qaGrid}>
									{c.quickReports.map((q) => (
										<button
											key={q.label}
											type="button"
											className={s.qaBtn}
											onClick={() => openModal(q.modal)}
										>
											{q.label}
										</button>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-8">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Recent Audit Activity</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Time</th>
												<th>User</th>
												<th>Action</th>
												<th>Item</th>
												<th>Result</th>
											</tr>
										</thead>
										<tbody>
											{c.auditActivity.map((a) => (
												<tr key={`${a.time}-${a.action}`}>
													<td>{a.time}</td>
													<td>{a.user}</td>
													<td>{a.action}</td>
													<td>{a.item}</td>
													<td>
														<span
															className={cx(s.badge, toneBadge[a.resultTone])}
														>
															{a.result}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION Settings & Automation ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i
									className="bi bi-gear-fill"
									style={{ color: "var(--ink-500)" }}
								/>{" "}
								Reconciliation Settings &amp; Automation
							</h3>
							<p className={s.sectionSub}>
								Matching tolerances, notifications and your facilitator access
								to customer data.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("reconSettingsModal")}
							>
								<i className="bi bi-sliders" /> Settings
							</button>
							<button
								type="button"
								className={cx(s.btn, s.btnSm)}
								onClick={() => openModal("teamAccessModal")}
							>
								<i className="bi bi-shield-check" /> My Recon Access
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Matching Tolerances</h4>
								{c.tolerances.map((t) => (
									<div className={s.rowItem} key={t.label}>
										<div>{t.label}</div>
										<strong>{t.value}</strong>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Notifications</h4>
								{c.notifications.map((n) => (
									<div className="form-check form-switch mb-2" key={n.label}>
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked={n.on}
											id={`notif-${n.label}`}
										/>
										<label
											className="form-check-label"
											style={{ fontSize: 13 }}
											htmlFor={`notif-${n.label}`}
										>
											{n.label}
										</label>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>My Recon Access</h4>
								{c.reconAccess.map((sc) => (
									<div className={s.permItem} key={sc.scope}>
										<span
											className={cx(
												s.permDot,
												sc.granted ? s.permOk : s.permPending,
											)}
										/>
										<div style={{ minWidth: 0 }}>
											<div className={s.permTitle}>{sc.scope}</div>
											<div className={s.permSub}>{sc.desc}</div>
										</div>
										<span
											className={cx(
												s.badge,
												sc.granted ? s.badgeSuccess : s.badgeWarn,
											)}
										>
											{sc.granted ? "Granted" : "Pending"}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ---------- ALL MODALS (state-driven) ---------- */}
			<ReconciliationModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={c}
			/>
		</div>
	);
}
