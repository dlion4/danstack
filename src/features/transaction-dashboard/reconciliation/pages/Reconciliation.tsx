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
 * STYLES: ../styles/reconciliation.module.css (emerald theme = Transfer theme).
 * ========================================================================== */
"use client";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cx } from "../../../shell/data/shellData";
import s from "../styles/reconciliation.module.css";
import { ReconciliationModals, type ReconciliationData } from "../components/ReconciliationModals";

type Tone = "success" | "warn" | "danger" | "info" | "purple" | "neutral";

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
interface BankCoverage {
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
	bank: string;
	ref: string;
	desc: string;
	amount: string;
	direction: "Debit" | "Credit";
	status: string;
	statusTone: Tone;
}
interface MatchedRow {
	id: string;
	date: string;
	bankA: string;
	bankB: string;
	amount: string;
	by: string;
	time: string;
	status: string;
	statusTone: Tone;
}
interface ExceptionRow {
	id: string;
	ref: string;
	issue: string;
	amount: string;
	priority: string;
	priorityTone: Tone;
	assigned: string;
}
interface RuleRow {
	name: string;
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
interface TeamRow {
	name: string;
	access: string;
	tone: Tone;
}

export interface ReconciliationContent extends ReconciliationData {
	heroTitle: string;
	heroValue: string;
	heroSub: string;
	matchedStat: { label: string; value: string; badge: string; pct: number };
	pendingStat: { label: string; value: string; badge: string; line1: string; line2: string };
	auditStat: { label: string; value: string; badge: string; lastRun: string };
	attention: Row[];
	suggestions: Row[];
	quickActions: QuickAction[];
	bankCoverage: BankCoverage[];
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
	team: TeamRow[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating block from legacy 1.6.html extracted
 * (includes the four rows that legacy populateTables() injected via innerHTML).
 * GET /api/reconciliation-center should return this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: ReconciliationContent = {
	heroTitle: "Reconciliation engine is live",
	heroValue: "94.7% match rate",
	heroSub: "8,412 of 8,882 transactions reconciled today across 6 banks. 47 exceptions awaiting review.",

	matchedStat: { label: "MATCHED TODAY", value: "8,412", badge: "+312 since morning", pct: 94.7 },
	pendingStat: { label: "PENDING / EXCEPTIONS", value: "47", badge: "12 high-value", line1: "KES 18.4M in unmatched transfers", line2: "3 international SWIFT items" },
	auditStat: { label: "AUDIT TRAIL", value: "124,892", badge: "entries this month", lastRun: "Last reconciliation run: 27 Jun 2025, 14:12" },

	attention: [
		{ icon: "bi-bank", tone: "danger", title: "Equity Bank credit not matched", sub: "KES 2.8M • Ref EQ-882910", action: "Match", modal: "manualMatchModal" },
		{ icon: "bi-exclamation-triangle", tone: "warn", title: "KCB debit duplicate detected", sub: "KES 450,000 • Same ref twice", action: "Review", modal: "discrepancyModal" },
		{ icon: "bi-globe", tone: "info", title: "SWIFT inbound pending FX rate", sub: "USD 125,000 • Rate lock expired", action: "Resolve", modal: "fxRateModal" },
	],
	suggestions: [
		{ icon: "bi-magic", tone: "success", title: "Run auto-match on 34 pending items", sub: "Confidence > 92%", action: "Run", modal: "runAutoReconModal" },
		{ icon: "bi-link-45deg", tone: "warn", title: "Create rule for recurring payroll", sub: "KES 8.2M every 25th", action: "Create", modal: "ruleEngineModal" },
		{ icon: "bi-file-earmark-text", tone: "purple", title: "Export June reconciliation report", sub: "Ready for auditors", action: "Export", modal: "exportReportModal" },
	],
	quickActions: [
		{ icon: "bi-hand-index", tone: "pri", label: "Manual Match", modal: "manualMatchModal" },
		{ icon: "bi-exclamation-triangle", tone: "warn", label: "Flag Exception", modal: "discrepancyModal" },
		{ icon: "bi-upload", tone: "pri", label: "Upload Statement", modal: "uploadStatementModal" },
		{ icon: "bi-collection", tone: "info", label: "Bulk Match", modal: "bulkMatchModal" },
		{ icon: "bi-magic", tone: "purple", label: "Auto-Rule", modal: "ruleEngineModal" },
		{ icon: "bi-currency-exchange", tone: "danger", label: "FX Rate", modal: "fxRateModal" },
		{ icon: "bi-clock-history", tone: "muted", label: "Audit Log", modal: "auditLogModal" },
		{ icon: "bi-download", tone: "pri", label: "Reports", modal: "exportReportModal" },
	],

	bankCoverage: [
		{ name: "Equity Bank", rate: "98.4%", tone: "success" },
		{ name: "KCB Bank", rate: "96.1%", tone: "success" },
		{ name: "Co-op Bank", rate: "94.8%", tone: "success" },
		{ name: "Stanbic Bank", rate: "89.2%", tone: "warn" },
		{ name: "M-Pesa B2B", rate: "99.1%", tone: "success" },
	],
	activityBars: [
		{ height: 85, color: "pri", label: "Equity" },
		{ height: 72, color: "info", label: "KCB" },
		{ height: 68, color: "muted", label: "Co-op" },
		{ height: 55, color: "warn", label: "Stanbic" },
		{ height: 90, color: "purple", label: "M-Pesa" },
	],
	exceptionBreakdown: [
		{ label: "Amount mismatch", tone: "danger", count: "18" },
		{ label: "Duplicate", tone: "warn", count: "9" },
		{ label: "Missing reference", tone: "info", count: "12" },
		{ label: "FX rate pending", tone: "purple", count: "5" },
		{ label: "Timing difference", tone: "success", count: "3" },
	],
	healthTiles: [
		{ label: "AUTO-MATCH RATE", value: "94.7%", tone: "success" },
		{ label: "MANUAL REVIEW NEEDED", value: "47 items", tone: "info" },
		{ label: "AVG RESOLUTION TIME", value: "14 min", tone: "warn" },
	],

	pending: [
		{ date: "27 Jun", bank: "Equity", ref: "EQ-882910", desc: "Payroll transfer", amount: "KES 2,800,000", direction: "Debit", status: "Unmatched", statusTone: "warn" },
		{ date: "27 Jun", bank: "KCB", ref: "KCB-991028", desc: "Incoming transfer", amount: "KES 2,800,000", direction: "Credit", status: "Unmatched", statusTone: "warn" },
		{ date: "26 Jun", bank: "Co-op", ref: "COOP-77102", desc: "Supplier payment", amount: "KES 450,000", direction: "Debit", status: "Exception", statusTone: "danger" },
	],
	matched: [
		{ id: "MATCH-88291", date: "27 Jun", bankA: "Equity", bankB: "KCB", amount: "KES 2,800,000", by: "James K.", time: "14:32", status: "Matched", statusTone: "success" },
		{ id: "MATCH-88290", date: "27 Jun", bankA: "KCB", bankB: "M-Pesa", amount: "KES 1,200,000", by: "System", time: "14:28", status: "Matched", statusTone: "success" },
	],
	exceptions: [
		{ id: "EXC-9910", ref: "KCB-99102", issue: "Amount mismatch", amount: "KES 50,000", priority: "High", priorityTone: "danger", assigned: "James K." },
		{ id: "EXC-9909", ref: "EQ-882901", issue: "Duplicate", amount: "KES 120,000", priority: "Medium", priorityTone: "warn", assigned: "Grace M." },
	],
	rules: [
		{ name: "Payroll Auto-Match v2", conditions: "Amount ±500, Ref PAY-", rate: "99.2%", lastRun: "27 Jun 14:28", status: "Active", statusTone: "success" },
		{ name: "Supplier Invoice", conditions: "Amount ±2%, 3-day window", rate: "97.8%", lastRun: "27 Jun 09:15", status: "Active", statusTone: "success" },
	],
	topRules: [
		{ name: "Payroll Auto-Match", sub: "Exact amount + ref prefix", rate: "99.2%" },
		{ name: "Supplier Invoice", sub: "Amount ±2% + date window", rate: "97.8%" },
		{ name: "Internal Transfer", sub: "Same bank, same day", rate: "100%" },
	],

	quickReports: [
		{ label: "Daily Reconciliation", modal: "exportReportModal" },
		{ label: "Monthly Summary", modal: "exportReportModal" },
		{ label: "Exception Report", modal: "exportReportModal" },
		{ label: "Audit Certificate", modal: "exportReportModal" },
	],
	auditActivity: [
		{ time: "14:32", user: "James K.", action: "Manual Match", item: "EQ-882910", result: "Matched", resultTone: "success" },
		{ time: "14:28", user: "System", action: "Auto-Rule", item: "47 items", result: "Success", resultTone: "success" },
		{ time: "13:55", user: "Grace M.", action: "Flag Exception", item: "KCB-99102", result: "Flagged", resultTone: "warn" },
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
	team: [
		{ name: "Finance Team", access: "Full access", tone: "success" },
		{ name: "Auditors", access: "View only", tone: "info" },
		{ name: "Ops Staff", access: "Match only", tone: "warn" },
	],

	/* option list consumed by the modal forms */
	banks: ["Equity Bank", "KCB Bank", "Co-op Bank", "Stanbic Bank"],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchReconciliationCenter(): Promise<ReconciliationContent> {
	const res = await fetch("/api/reconciliation-center", { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as ReconciliationContent;
}

/* --------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------ */
export default function Reconciliation() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const openModal = (id: string) => setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) => setModalState((p) => ({ ...p, [id]: false }));

	const { data, error, isLoading } = useQuery({
		queryKey: ["paymo-reconciliation-center"],
		queryFn: fetchReconciliationCenter,
		staleTime: 60_000,
		retry: 1,
	});
	// Falls back to initialMockData so the page never breaks.
	const c = data ?? initialMockData;

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
			<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(item.modal)}>
				{item.action}
			</button>
		</div>
	);

	return (
		<div className={s.pageRoot} style={{ position: "relative" }}>
			{/* ===== TanStack Query: loading spinner ===== */}
			{isLoading && (
				<div className={s.qLoading} role="status" aria-live="polite">
					<div className="spinner-border" style={{ width: "3rem", height: "3rem" }} />
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
						<code>/api/reconciliation-center</code> — {(error as Error).message}. Showing bundled sample data.
					</div>
				</div>
			)}

			<div className={s.stack}>
				{/* ---------- page bar ---------- */}
				<div className={s.pageBar}>
					<div>
						<div className={s.breadcrumb}>
							<Link to="/app">Home</Link> / <Link to="/app/transfers">B2B Transactions</Link> / <strong>Reconciliation Center</strong>
						</div>
						<h1 className={s.pageTitle}>Reconciliation Center</h1>
						<p className={s.pageCopy}>
							Match incoming and outgoing bank transfers across Equity, KCB, Co-op, Stanbic, M-Pesa and international corridors. Resolve
							discrepancies, run auto-rules and maintain full audit trail.
						</p>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("uploadStatementModal")}>
							<i className="bi bi-upload" /> Upload Statement
						</button>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("runAutoReconModal")}>
							<i className="bi bi-magic" /> Run Auto-Recon
						</button>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("bulkMatchModal")}>
							<i className="bi bi-collection" /> Bulk Match
						</button>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("reconcileNotifModal")}>
							<i className="bi bi-bell" /> Alerts
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("manualMatchModal")}>
							<i className="bi bi-hand-index" /> Manual Match
						</button>
					</div>
				</div>

				{/* ---------- HERO STATS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={cx(s.card, s.cardAccent)} style={{ minHeight: 170 }}>
							<p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.78)" }}>
								{c.heroTitle} <span style={{ color: "#86efac" }}>●</span>
							</p>
							<div className={s.statValue} style={{ margin: "8px 0", color: "#fff" }}>
								{c.heroValue}
							</div>
							<p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.78)" }}>{c.heroSub}</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("runAutoReconModal")}>
									Auto-Reconcile
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("exportReportModal")}>
									Export
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("ruleEngineModal")}>
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
								<div className={s.progressBar} style={{ width: `${c.matchedStat.pct}%` }} />
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
								<i className="bi bi-exclamation-triangle" /> {c.pendingStat.badge}
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: "var(--ink-700)" }}>
								{c.pendingStat.line1}
								<br />
								{c.pendingStat.line2}
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4">
						<div className={cx(s.card, s.cardInfoEdge)} style={{ minHeight: 170 }}>
							<p className={s.statLabel} style={{ color: "var(--info)" }}>
								{c.auditStat.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.auditStat.value}
							</div>
							<span className={cx(s.badge, s.badgeInfo)}>
								<i className="bi bi-clock-history" /> {c.auditStat.badge}
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: "var(--ink-700)" }}>{c.auditStat.lastRun}</div>
						</div>
					</div>
				</div>

				{/* ---------- ATTENTION / SUGGESTIONS / QUICK ACTIONS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Attention Required</h3>
								<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("attentionFullModal")}>
									View all
								</button>
							</div>
							{c.attention.map(renderRow)}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
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
						<div className={s.card}>
							<div style={{ marginBottom: 16 }}>
								<h3 className={s.sectionTitle}>Quick Actions</h3>
								<p className={s.sectionSub}>Frequent reconciliation workflows</p>
							</div>
							<div className={s.quickGrid}>
								{c.quickActions.map((qa) => (
									<button key={qa.label} type="button" className={s.quickBtn} onClick={() => openModal(qa.modal)}>
										<i className={cx("bi", qa.icon)} style={{ color: toneColor(qa.tone) }} /> {qa.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.6.1 — Overview Dashboard ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-speedometer2" /> 1.6.1 — Reconciliation Overview Dashboard
							</h3>
							<p className={s.sectionSub}>Real-time status across all connected bank accounts and corridors.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("healthCheckModal")}>
								<i className="bi bi-heart-pulse" /> Health
							</button>
							<button type="button" className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal("runAutoReconModal")}>
								<i className="bi bi-play-fill" /> Run Now
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Bank Coverage</h4>
								{c.bankCoverage.map((b) => (
									<div className={s.rowItem} key={b.name}>
										<div>{b.name}</div>
										<span className={cx(s.badge, toneBadge[b.tone])}>{b.rate}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Today's Activity</h4>
								<div className={s.chartBars} style={{ height: 80 }}>
									{c.activityBars.map((b) => (
										<div key={b.label} className={s.chartBar} style={{ height: `${b.height}%`, background: toneColor(b.color) }}>
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
										<span className={cx(s.badge, toneBadge[e.tone])}>{e.label}</span>
										<strong>{e.count}</strong>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Reconciliation Health</h4>
								{c.healthTiles.map((t) => (
									<div key={t.label} className={cx(s.tile, t.tone === "success" ? s.tileSuccess : t.tone === "info" ? s.tileInfo : s.tileWarn, "mb-2")}>
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

				{/* ---------- SECTION 1.6.2 — Pending Reconciliations Workbench ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-clock-history" style={{ color: "var(--warning)" }} /> 1.6.2 — Pending Reconciliations Workbench
							</h3>
							<p className={s.sectionSub}>All unmatched transactions requiring attention. Use filters, search and quick actions.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("filterModal")}>
								<i className="bi bi-funnel" /> Filters
							</button>
							<button type="button" className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal("bulkMatchModal")}>
								<i className="bi bi-check2-all" /> Bulk Match
							</button>
						</div>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Date</th>
									<th>Bank</th>
									<th>Reference</th>
									<th>Description</th>
									<th>Amount</th>
									<th>Direction</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{c.pending.map((p) => (
									<tr key={p.ref}>
										<td>{p.date}</td>
										<td>{p.bank}</td>
										<td>
											<code>{p.ref}</code>
										</td>
										<td>{p.desc}</td>
										<td>
											<strong>{p.amount}</strong>
										</td>
										<td>{p.direction}</td>
										<td>
											<span className={cx(s.badge, toneBadge[p.statusTone])}>{p.status}</span>
										</td>
										<td>
											<div className="d-flex" style={{ gap: 4, flexWrap: "wrap" }}>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("manualMatchModal")}>
													Match
												</button>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("discrepancyModal")}>
													Flag
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- SECTION 1.6.3 — Matched Transactions ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-check2-circle" /> 1.6.3 — Matched Transactions
							</h3>
							<p className={s.sectionSub}>Successfully reconciled items with full audit trail.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("matchedFilterModal")}>
								<i className="bi bi-funnel" /> Filter
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("exportReportModal")}>
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
									<th>Bank A</th>
									<th>Bank B</th>
									<th>Amount</th>
									<th>Matched By</th>
									<th>Time</th>
									<th>View</th>
								</tr>
							</thead>
							<tbody>
								{c.matched.map((m) => (
									<tr key={m.id}>
										<td>
											<code>{m.id}</code>
										</td>
										<td>{m.date}</td>
										<td>{m.bankA}</td>
										<td>{m.bankB}</td>
										<td>
											<strong>{m.amount}</strong>
										</td>
										<td>{m.by}</td>
										<td>{m.time}</td>
										<td>
											<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("auditLogModal")}>
												View
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- SECTION 1.6.4 — Discrepancies & Exceptions ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-exclamation-triangle" style={{ color: "var(--danger)" }} /> 1.6.4 — Discrepancies &amp; Exceptions
							</h3>
							<p className={s.sectionSub}>Investigate, flag, dispute or resolve unmatched items.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("discrepancyModal")}>
								<i className="bi bi-plus-lg" /> New Exception
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("disputeModal")}>
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
									<th>Issue</th>
									<th>Amount</th>
									<th>Priority</th>
									<th>Assigned</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{c.exceptions.map((e) => (
									<tr key={e.id}>
										<td>
											<code>{e.id}</code>
										</td>
										<td>{e.ref}</td>
										<td>{e.issue}</td>
										<td>
											<strong>{e.amount}</strong>
										</td>
										<td>
											<span className={cx(s.badge, toneBadge[e.priorityTone])}>{e.priority}</span>
										</td>
										<td>{e.assigned}</td>
										<td>
											<div className="d-flex" style={{ gap: 4, flexWrap: "wrap" }}>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("manualMatchModal")}>
													Resolve
												</button>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("disputeModal")}>
													Dispute
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- SECTION 1.6.5 — Auto-Reconciliation Rules Engine ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-magic" style={{ color: "var(--purple)" }} /> 1.6.5 — Auto-Reconciliation Rules Engine
							</h3>
							<p className={s.sectionSub}>Create, edit and monitor intelligent matching rules.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("ruleEngineModal")}>
								<i className="bi bi-plus-lg" /> New Rule
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("rulePerformanceModal")}>
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
											<th>Conditions</th>
											<th>Match Rate</th>
											<th>Last Run</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{c.rules.map((r) => (
											<tr key={r.name}>
												<td>{r.name}</td>
												<td>{r.conditions}</td>
												<td>{r.rate}</td>
												<td>{r.lastRun}</td>
												<td>
													<span className={cx(s.badge, toneBadge[r.statusTone])}>{r.status}</span>
												</td>
												<td>
													<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("rulePerformanceModal")}>
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
										<span className={cx(s.badge, s.badgeSuccess)}>{r.rate}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.6.6 — Reports, Exports & Audit Trail ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-file-earmark-bar-graph" style={{ color: "var(--info)" }} /> 1.6.6 — Reports, Exports &amp; Audit Trail
							</h3>
							<p className={s.sectionSub}>Generate compliance reports, audit logs and reconciliation certificates.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("exportReportModal")}>
								<i className="bi bi-download" /> Export
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("auditLogModal")}>
								<i className="bi bi-clock-history" /> Audit Log
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Quick Reports</h4>
								<div className={s.quickGrid}>
									{c.quickReports.map((q) => (
										<button key={q.label} type="button" className={s.quickBtn} onClick={() => openModal(q.modal)}>
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
														<span className={cx(s.badge, toneBadge[a.resultTone])}>{a.result}</span>
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

				{/* ---------- SECTION 1.6.7 — Settings & Automation ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-gear-fill" style={{ color: "var(--ink-500)" }} /> 1.6.7 — Reconciliation Settings &amp; Automation
							</h3>
							<p className={s.sectionSub}>Configure matching tolerances, notification rules and team permissions.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("reconSettingsModal")}>
								<i className="bi bi-sliders" /> Settings
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("teamAccessModal")}>
								<i className="bi bi-people" /> Team
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
										<input className="form-check-input" type="checkbox" defaultChecked={n.on} id={`notif-${n.label}`} />
										<label className="form-check-label" style={{ fontSize: 13 }} htmlFor={`notif-${n.label}`}>
											{n.label}
										</label>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Team Permissions</h4>
								{c.team.map((t) => (
									<div className={s.rowItem} key={t.name}>
										<div style={{ minWidth: 0 }}>
											<strong>{t.name}</strong>
										</div>
										<span className={cx(s.badge, toneBadge[t.tone])}>{t.access}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ---------- ALL MODALS (state-driven) ---------- */}
			<ReconciliationModals modalState={modalState} openModal={openModal} closeModal={closeModal} data={c} />
		</div>
	);
}
