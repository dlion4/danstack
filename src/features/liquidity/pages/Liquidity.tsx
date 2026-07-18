/* ============================================================================
 * Liquidity.tsx — Page 1.5 "Liquidity & Float Management".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.5.html (single-file HTML/CSS/JS, ~2,850 LOC).
 *   - raw HTML converted 1:1 to TSX (class → className, style → style={{ }}),
 *     Bootstrap grid classes (row / col-lg-* / g-3 / d-flex…) kept intact;
 *   - every repeating block (stat cards, bank float rows, agent tables, alert
 *     lists, forecast bars, activity tables…) extracted into `initialMockData`
 *     below and rendered with .map();
 *   - data loads through TanStack Query (fetchLiquidityFloat →
 *     GET /api/liquidity-float) with the bundled mock as fallback; a Bootstrap
 *     .spinner-border shows while isLoading and an .alert-danger banner shows
 *     on error — the page never renders empty;
 *   - the legacy pm-sidebar + pm-header chrome is replaced by the shared
 *     AppShell (this page renders inside routes/app.tsx <Outlet />);
 *   - all 25 Bootstrap-JS modals + flows{} + sw() + doAction() + nf() became
 *     React state-driven modals (see ../components/LiquidityModals.tsx).
 *
 * STYLES: ../styles/liquidity.module.css (emerald theme = Transfer page theme).
 * ========================================================================== */
"use client";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cx } from "../../shell/data/shellData";
import s from "../styles/liquidity.module.css";
import { LiquidityModals, type LiquidityData } from "../components/LiquidityModals";

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
	dangerBtn?: boolean;
}
interface QuickAction {
	icon: string;
	tone: ToneColor;
	label: string;
	modal: string;
}
interface BankFloatRow {
	bank: string;
	account: string;
	float: string;
	threshold: string;
	status: string;
	statusTone: Tone;
	action: { label: string; modal: string; danger?: boolean };
}
interface PoolRow {
	name: string;
	amount: string;
	status: string;
	tone: Tone;
}
interface AgentRow {
	name: string;
	location: string;
	current: string;
	min: string;
	status: string;
	statusTone: Tone;
	action: { label: string; modal: string; danger?: boolean };
}
interface PartnerRow {
	name: string;
	amount: string;
	status: string;
	tone: Tone;
}
interface AlertRow {
	title: string;
	sub: string;
	badge: string;
	tone: Tone;
}
interface ToggleRow {
	label: string;
	sub: string;
	on: boolean;
}
interface RebalanceRow {
	time: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	statusTone: Tone;
	ref: string;
}
interface SettlementRow {
	batch: string;
	counterparty: string;
	amount: string;
	status: string;
	statusTone: Tone;
	variance: string;
	action: { label: string; modal: string };
}
interface ForecastBar {
	height: number;
	color: ToneColor;
	label: string;
}
interface ScenarioRow {
	title: string;
	sub: string;
	badge: string;
	tone: Tone;
}
interface Facility {
	title: string;
	value: string;
	sub: string;
	tone: "danger" | "warn";
	btnLabel: string;
	btnDanger?: boolean;
	modal: string;
}
interface GovRow {
	time: string;
	action: string;
	initiator: string;
	approver: string;
	amount: string;
	status: string;
	statusTone: Tone;
}
interface ActivityRow {
	time: string;
	action: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	statusTone: Tone;
	ref: string;
	btn: { label: string; modal: string };
}
interface MiniBar {
	height: number;
	color: ToneColor;
}

export interface LiquidityContent extends LiquidityData {
	heroTitle: string;
	heroValue: string;
	heroSub: string;
	critical: {
		label: string;
		value: string;
		badge: string;
		badgeTone: Tone;
		bars: MiniBar[];
	};
	settlementsStat: {
		label: string;
		value: string;
		badge: string;
		badgeTone: Tone;
		pendingLabel: string;
		pendingValue: string;
		pct: number;
	};
	forecastStat: {
		label: string;
		value: string;
		badge: string;
		badgeTone: Tone;
		line1: string;
		line2: string;
		edge: boolean;
	};
	attention: Row[];
	suggestions: Row[];
	quickActions: QuickAction[];
	bankFloat: BankFloatRow[];
	settlementPools: PoolRow[];
	criticalAgents: AgentRow[];
	partnerFloat: PartnerRow[];
	activeAlerts: AlertRow[];
	alertConfig: ToggleRow[];
	quickTopup: { label: string; modal: string }[];
	recentRebalance: RebalanceRow[];
	settlements: SettlementRow[];
	reconQueue: AlertRow[];
	forecastBars: ForecastBar[];
	scenarios: ScenarioRow[];
	facilities: Facility[];
	governance: GovRow[];
	activity: ActivityRow[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating block from legacy 1.5.html extracted.
 * GET /api/liquidity-float should return this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: LiquidityContent = {
	heroTitle: "Liquidity command center is live",
	heroValue: "KES 1.84B Total Float",
	heroSub: "Across 12 partner banks, 847 agents and 31 settlement accounts — all monitored in real time.",

	critical: {
		label: "CRITICAL FLOAT",
		value: "KES 42.8M",
		badge: "7 accounts below threshold",
		badgeTone: "warn",
		bars: [
			{ height: 85, color: "danger" },
			{ height: 60, color: "warn" },
			{ height: 40, color: "info" },
			{ height: 75, color: "danger" },
		],
	},
	settlementsStat: {
		label: "SETTLEMENTS TODAY",
		value: "KES 318.4M",
		badge: "94% completed",
		badgeTone: "success",
		pendingLabel: "Pending",
		pendingValue: "KES 19.2M",
		pct: 94,
	},
	forecastStat: {
		label: "FORECASTED SHORTFALL (48H)",
		value: "KES 87.5M",
		badge: "3 banks at risk",
		badgeTone: "info",
		line1: "Recommended top-up: KES 120M",
		line2: "Auto-rebalance scheduled: Tomorrow 06:00",
		edge: true,
	},

	attention: [
		{ icon: "bi-bank", tone: "danger", title: "KCB Float critically low", sub: "KES 8.2M remaining (threshold KES 15M)", action: "Top-up", modal: "rebalanceModal", dangerBtn: true },
		{ icon: "bi-people", tone: "warn", title: "47 agents below minimum float", sub: "Auto-replenishment failed for 12", action: "Review", modal: "agentFloatModal" },
		{ icon: "bi-clock-history", tone: "info", title: "Settlement mismatch detected", sub: "Equity Bank batch #SB-44291 — KES 1.8M variance", action: "Investigate", modal: "reconciliationModal" },
	],
	suggestions: [
		{ icon: "bi-arrow-repeat", tone: "success", title: "Rebalance 5 low-float banks tonight", sub: "Projected savings: KES 340K in overnight fees", action: "Schedule", modal: "rebalanceModal" },
		{ icon: "bi-graph-up", tone: "info", title: "Increase Co-op float buffer by 18%", sub: "Based on weekend transaction patterns", action: "Apply", modal: "forecastModal" },
		{ icon: "bi-shield-check", tone: "warn", title: "Activate emergency liquidity line", sub: "KES 200M standby facility ready", action: "Activate", modal: "emergencyLiquidityModal" },
	],
	quickActions: [
		{ icon: "bi-arrow-left-right", tone: "pri", label: "Rebalance Float", modal: "rebalanceModal" },
		{ icon: "bi-bank", tone: "info", label: "Top-up Bank", modal: "topupBankModal" },
		{ icon: "bi-people", tone: "pri", label: "Agent Float", modal: "agentFloatModal" },
		{ icon: "bi-clock-history", tone: "purple", label: "Settlements", modal: "settlementModal" },
		{ icon: "bi-graph-up-arrow", tone: "warn", label: "Forecast", modal: "forecastModal" },
		{ icon: "bi-lightning-charge", tone: "danger", label: "Emergency", modal: "emergencyLiquidityModal" },
		{ icon: "bi-search", tone: "muted", label: "Reconcile", modal: "reconciliationModal" },
		{ icon: "bi-download", tone: "pri", label: "Reports", modal: "liquidityReportModal" },
	],

	bankFloat: [
		{ bank: "KCB Bank", account: "KCB-447291", float: "KES 142.8M", threshold: "KES 80M", status: "Healthy", statusTone: "success", action: { label: "Manage", modal: "rebalanceModal" } },
		{ bank: "Equity Bank", account: "EQB-991023", float: "KES 98.4M", threshold: "KES 60M", status: "Healthy", statusTone: "success", action: { label: "Manage", modal: "rebalanceModal" } },
		{ bank: "Co-op Bank", account: "COOP-334871", float: "KES 41.2M", threshold: "KES 45M", status: "Warning", statusTone: "warn", action: { label: "Top-up", modal: "topupBankModal", danger: true } },
		{ bank: "Absa Bank", account: "ABSA-772910", float: "KES 67.9M", threshold: "KES 40M", status: "Healthy", statusTone: "success", action: { label: "Manage", modal: "rebalanceModal" } },
		{ bank: "Stanbic Bank", account: "STB-556102", float: "KES 12.4M", threshold: "KES 25M", status: "Critical", statusTone: "danger", action: { label: "Emergency", modal: "emergencyLiquidityModal", danger: true } },
	],
	settlementPools: [
		{ name: "PayMo Main Pool", amount: "KES 284.6M", status: "Optimal", tone: "success" },
		{ name: "Agent Float Pool", amount: "KES 119.3M", status: "Warning", tone: "warn" },
		{ name: "Partner Settlement", amount: "KES 67.8M", status: "Healthy", tone: "success" },
		{ name: "Emergency Reserve", amount: "KES 200.0M", status: "Ready", tone: "success" },
	],

	criticalAgents: [
		{ name: "John's M-Pesa", location: "Kawangware", current: "KES 18,400", min: "KES 50,000", status: "Critical", statusTone: "danger", action: { label: "Top-up", modal: "agentTopupModal", danger: true } },
		{ name: "Grace Kiosk", location: "Kayole", current: "KES 29,100", min: "KES 40,000", status: "Low", statusTone: "warn", action: { label: "Top-up", modal: "agentTopupModal" } },
		{ name: "Peter Agent", location: "Embakasi", current: "KES 12,800", min: "KES 35,000", status: "Critical", statusTone: "danger", action: { label: "Top-up", modal: "agentTopupModal", danger: true } },
	],
	partnerFloat: [
		{ name: "Safaricom M-Pesa", amount: "KES 1.24B", status: "Healthy", tone: "success" },
		{ name: "Airtel Money", amount: "KES 312M", status: "Healthy", tone: "success" },
		{ name: "Telkom T-Kash", amount: "KES 87M", status: "Warning", tone: "warn" },
		{ name: "Equity Pay", amount: "KES 156M", status: "Healthy", tone: "success" },
	],

	activeAlerts: [
		{ title: "Stanbic Bank float critical", sub: "12.4M / 25M threshold", badge: "Critical", tone: "danger" },
		{ title: "Co-op Bank warning", sub: "41.2M / 45M threshold", badge: "Warning", tone: "warn" },
		{ title: "12 agents below minimum", sub: "Auto-replenishment failed", badge: "Warning", tone: "warn" },
		{ title: "Equity settlement variance", sub: "KES 1.8M mismatch", badge: "Investigate", tone: "info" },
	],
	alertConfig: [
		{ label: "Bank float threshold", sub: "Alert when below 80% of minimum", on: true },
		{ label: "Agent float threshold", sub: "Alert when below KES 30,000", on: true },
		{ label: "Settlement mismatch", sub: "Alert on >KES 500K variance", on: true },
		{ label: "Forecast shortfall", sub: "Alert 48 hours before predicted low", on: true },
	],

	quickTopup: [
		{ label: "Bank Float", modal: "topupBankModal" },
		{ label: "Agent Float", modal: "agentTopupModal" },
		{ label: "Partner Float", modal: "partnerTopupModal" },
		{ label: "Internal Transfer", modal: "internalTransferModal" },
	],
	recentRebalance: [
		{ time: "27 Jun 14:22", from: "PayMo Main", to: "Stanbic Bank", amount: "KES 25.0M", status: "Completed", statusTone: "success", ref: "RB-44291" },
		{ time: "27 Jun 11:45", from: "Equity Bank", to: "Co-op Bank", amount: "KES 12.5M", status: "Completed", statusTone: "success", ref: "RB-44288" },
		{ time: "27 Jun 09:10", from: "PayMo Main", to: "Agent Pool", amount: "KES 8.0M", status: "Completed", statusTone: "success", ref: "RB-44285" },
	],

	settlements: [
		{ batch: "SB-44291", counterparty: "Equity Bank", amount: "KES 87.4M", status: "Variance", statusTone: "warn", variance: "KES 1.8M", action: { label: "Investigate", modal: "reconciliationModal" } },
		{ batch: "SB-44290", counterparty: "KCB Bank", amount: "KES 112.6M", status: "Matched", statusTone: "success", variance: "KES 0", action: { label: "View", modal: "settlementDetailModal" } },
		{ batch: "SB-44289", counterparty: "Co-op Bank", amount: "KES 54.2M", status: "Matched", statusTone: "success", variance: "KES 0", action: { label: "View", modal: "settlementDetailModal" } },
	],
	reconQueue: [
		{ title: "Pending batches", sub: "3 batches", badge: "3", tone: "info" },
		{ title: "Mismatches to resolve", sub: "1 variance", badge: "1", tone: "warn" },
		{ title: "Auto-matched today", sub: "94%", badge: "28", tone: "success" },
	],

	forecastBars: [
		{ height: 75, color: "pri", label: "Now" },
		{ height: 68, color: "pri", label: "+6h" },
		{ height: 55, color: "warn", label: "+12h" },
		{ height: 42, color: "danger", label: "+24h" },
		{ height: 38, color: "danger", label: "+36h" },
		{ height: 52, color: "warn", label: "+48h" },
	],
	scenarios: [
		{ title: "Weekend surge (+40%)", sub: "Probability: 68%", badge: "Medium", tone: "warn" },
		{ title: "Salary run (end of month)", sub: "Probability: 92%", badge: "High", tone: "danger" },
		{ title: "Partner outage", sub: "Probability: 12%", badge: "Low", tone: "info" },
	],

	facilities: [
		{ title: "STANDBY LINE", value: "KES 200M", sub: "Available 24/7 • Pre-approved", tone: "danger", btnLabel: "Activate Now", btnDanger: true, modal: "emergencyLiquidityModal" },
		{ title: "PARTNER CREDIT LINE", value: "KES 150M", sub: "Equity Bank facility • 2-hour activation", tone: "warn", btnLabel: "Request", modal: "emergencyLiquidityModal" },
	],
	governance: [
		{ time: "26 Jun 22:14", action: "Emergency top-up", initiator: "System", approver: "CFO (auto)", amount: "KES 80M", status: "Executed", statusTone: "success" },
		{ time: "25 Jun 14:02", action: "Float rebalance override", initiator: "Liquidity Mgr", approver: "Treasurer", amount: "KES 45M", status: "Executed", statusTone: "success" },
		{ time: "24 Jun 09:30", action: "Threshold change", initiator: "Ops Lead", approver: "Risk Committee", amount: "—", status: "Approved", statusTone: "success" },
	],

	activity: [
		{ time: "27 Jun 14:22", action: "Rebalance", from: "PayMo Main", to: "Stanbic", amount: "KES 25.0M", status: "Success", statusTone: "success", ref: "RB-44291", btn: { label: "View", modal: "reconciliationModal" } },
		{ time: "27 Jun 11:45", action: "Top-up", from: "KCB", to: "Co-op", amount: "KES 12.5M", status: "Success", statusTone: "success", ref: "TP-44288", btn: { label: "View", modal: "reconciliationModal" } },
		{ time: "27 Jun 09:10", action: "Agent top-up", from: "Agent Pool", to: "John's M-Pesa", amount: "KES 50,000", status: "Success", statusTone: "success", ref: "AG-44285", btn: { label: "View", modal: "agentFloatModal" } },
		{ time: "26 Jun 22:14", action: "Emergency", from: "Reserve", to: "Equity", amount: "KES 80.0M", status: "Success", statusTone: "success", ref: "EM-44279", btn: { label: "Audit", modal: "governanceModal" } },
	],

	/* option lists consumed by the modal forms */
	banks: ["KCB Bank (KES 142.8M)", "Equity Bank (KES 98.4M)", "Co-op Bank (KES 41.2M)", "Absa Bank (KES 67.9M)", "Stanbic Bank (KES 12.4M)"],
	pools: ["PayMo Main Pool (KES 284.6M)", "Emergency Reserve (KES 200M)", "Agent Float Pool (KES 119.3M)"],
	agents: ["John's M-Pesa (KES 18,400)", "Peter Agent (KES 12,800)", "Grace Kiosk (KES 29,100)"],
	partners: ["Safaricom M-Pesa (KES 1.24B)", "Airtel Money (KES 312M)", "Telkom T-Kash (KES 87M)"],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchLiquidityFloat(): Promise<LiquidityContent> {
	const res = await fetch("/api/liquidity-float", { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as LiquidityContent;
}

/* --------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------ */
export default function Liquidity() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const openModal = (id: string) => setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) => setModalState((p) => ({ ...p, [id]: false }));

	const { data, error, isLoading } = useQuery({
		queryKey: ["paymo-liquidity-float"],
		queryFn: fetchLiquidityFloat,
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
			<button type="button" className={cx(s.btn, s.btnSm, item.dangerBtn && s.btnDangerGhost)} onClick={() => openModal(item.modal)}>
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
					<span>Loading liquidity center…</span>
				</div>
			)}

			{/* ===== TanStack Query: error banner ===== */}
			{error && (
				<div className={cx("alert alert-danger", s.qError)} role="alert">
					<strong>
						<i className="bi bi-exclamation-triangle me-2" />
						Liquidity data unavailable
					</strong>
					<div className="small mt-1">
						<code>/api/liquidity-float</code> — {(error as Error).message}. Showing bundled sample data.
					</div>
				</div>
			)}

			<div className={s.stack}>
				{/* ---------- page bar ---------- */}
				<div className={s.pageBar}>
					<div>
						<div className={s.breadcrumb}>
							<Link to="/app">Home</Link> / <Link to="/app/transfers">Transactions Hub</Link> / <strong>Liquidity &amp; Float</strong>
						</div>
						<h1 className={s.pageTitle}>Liquidity &amp; Float Management</h1>
						<p className={s.pageCopy}>
							Monitor and manage float across banks, agents, and partners. Execute rebalancing, forecast shortfalls, and trigger emergency
							liquidity with full audit trails.
						</p>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("liquidityHealthModal")}>
							<i className="bi bi-heart-pulse" /> Health Check
						</button>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("floatAlertModal")}>
							<i className="bi bi-exclamation-triangle" /> Alerts
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("rebalanceModal")}>
							<i className="bi bi-arrow-left-right" /> Rebalance
						</button>
						<button type="button" className={cx(s.btn, s.btnAm, s.btnSm)} onClick={() => openModal("emergencyLiquidityModal")}>
							<i className="bi bi-lightning-charge" /> Emergency
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
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("rebalanceModal")}>
									Rebalance
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("forecastModal")}>
									Forecast
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("emergencyLiquidityModal")}>
									Emergency
								</button>
							</div>
						</div>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.statLabel} style={{ color: "var(--warning)" }}>
								{c.critical.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.critical.value}
							</div>
							<span className={cx(s.badge, toneBadge[c.critical.badgeTone])}>
								<i className="bi bi-exclamation-triangle" /> {c.critical.badge}
							</span>
							<div className={cx(s.miniBars, "mt-3")}>
								{c.critical.bars.map((b, i) => (
									<div key={`${b.height}-${i}`} className={s.miniBar} style={{ height: `${b.height}%`, background: toneColor(b.color) }} />
								))}
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.statLabel} style={{ color: "var(--info)" }}>
								{c.settlementsStat.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.settlementsStat.value}
							</div>
							<span className={cx(s.badge, toneBadge[c.settlementsStat.badgeTone])}>
								<i className="bi bi-check-circle" /> {c.settlementsStat.badge}
							</span>
							<div className="mt-2">
								<div className="d-flex justify-content-between" style={{ fontSize: 11, color: "var(--ink-500)" }}>
									<span>{c.settlementsStat.pendingLabel}</span>
									<span>{c.settlementsStat.pendingValue}</span>
								</div>
								<div className={cx(s.progress, "mt-1")}>
									<div className={s.progressBar} style={{ width: `${c.settlementsStat.pct}%`, background: "var(--pri)" }} />
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4">
						<div className={cx(s.card, c.forecastStat.edge && s.cardAccentEdge)} style={{ minHeight: 170 }}>
							<p className={s.statLabel} style={{ color: "var(--pri)" }}>
								{c.forecastStat.label}
							</p>
							<div className={s.statValue} style={{ margin: "6px 0" }}>
								{c.forecastStat.value}
							</div>
							<span className={cx(s.badge, toneBadge[c.forecastStat.badgeTone])}>
								<i className="bi bi-graph-down-arrow" /> {c.forecastStat.badge}
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: "var(--ink-700)" }}>
								<div>
									Recommended top-up: <strong>KES 120M</strong>
								</div>
								<div>
									Auto-rebalance scheduled: <strong>Tomorrow 06:00</strong>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- ATTENTION / SUGGESTIONS / QUICK ACTIONS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Attention Required</h3>
								<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("attentionModal")}>
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
								<p className={s.sectionSub}>Frequent liquidity workflows</p>
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

				{/* ---------- SECTION 1.5.1 — Float Portfolio Overview ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-bank2" /> 1.5.1 — Float Portfolio Overview
							</h3>
							<p className={s.sectionSub}>Real-time view of all float accounts across banks, agents, and internal settlement pools with health indicators.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("liquidityHealthModal")}>
								<i className="bi bi-heart-pulse" /> Health
							</button>
							<button type="button" className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal("rebalanceModal")}>
								<i className="bi bi-arrow-left-right" /> Rebalance
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Bank Float Accounts</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Bank</th>
												<th>Account</th>
												<th>Current Float</th>
												<th>Threshold</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{c.bankFloat.map((b) => (
												<tr key={b.account}>
													<td>
														<strong>{b.bank}</strong>
													</td>
													<td>{b.account}</td>
													<td>
														<strong>{b.float}</strong>
													</td>
													<td>{b.threshold}</td>
													<td>
														<span className={cx(s.badge, toneBadge[b.statusTone])}>{b.status}</span>
													</td>
													<td>
														<button
															type="button"
															className={cx(s.btn, s.btnSm, b.action.danger && s.btnDangerGhost)}
															onClick={() => openModal(b.action.modal)}
														>
															{b.action.label}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Internal Settlement Pools</h4>
								{c.settlementPools.map((p) => (
									<button
										key={p.name}
										type="button"
										className={cx(s.rowItem, s.rowItemButton)}
										onClick={() => openModal("internalPoolModal")}
										title={`Manage ${p.name}`}
									>
										<div style={{ textAlign: "left", minWidth: 0 }}>
											<strong>{p.name}</strong>
											<div className={s.rowSub}>{p.amount}</div>
										</div>
										<span className={cx(s.badge, toneBadge[p.tone])}>{p.status}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.5.2 — Agent & Partner Float ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-people-fill" style={{ color: "var(--pri)" }} /> 1.5.2 — Agent &amp; Partner Float Management
							</h3>
							<p className={s.sectionSub}>Monitor and replenish float for 847 agents and 31 partner organizations with automated rules and manual overrides.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("agentFloatModal")}>
								<i className="bi bi-people" /> Manage Agents
							</button>
							<button type="button" className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal("bulkTopupModal")}>
								<i className="bi bi-upload" /> Bulk Top-up
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Critical Agent Float (Below Threshold)</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Agent</th>
												<th>Location</th>
												<th>Current</th>
												<th>Min</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{c.criticalAgents.map((a) => (
												<tr key={a.name}>
													<td>
														<button type="button" className={s.btnLink} onClick={() => openModal("agentDetailModal")}>
															{a.name}
														</button>
													</td>
													<td>{a.location}</td>
													<td>{a.current}</td>
													<td>{a.min}</td>
													<td>
														<span className={cx(s.badge, toneBadge[a.statusTone])}>{a.status}</span>
													</td>
													<td>
														<button
															type="button"
															className={cx(s.btn, s.btnSm, a.action.danger && s.btnDangerGhost)}
															onClick={() => openModal(a.action.modal)}
														>
															{a.action.label}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Partner Float Summary</h4>
								{c.partnerFloat.map((p) => (
									<div className={s.rowItem} key={p.name}>
										<div style={{ minWidth: 0 }}>
											<strong>{p.name}</strong>
											<div className={s.rowSub}>{p.amount}</div>
										</div>
										<span className={cx(s.badge, toneBadge[p.tone])}>{p.status}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.5.3 — Monitoring & Alerts ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-graph-up-arrow" style={{ color: "var(--info)" }} /> 1.5.3 — Liquidity Monitoring &amp; Real-time Alerts
							</h3>
							<p className={s.sectionSub}>Live monitoring of float levels with configurable thresholds, automated alerts, and escalation workflows.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("floatAlertModal")}>
								<i className="bi bi-bell" /> Alerts
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("thresholdModal")}>
								<i className="bi bi-sliders" /> Thresholds
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Active Alerts (14)</h4>
								{c.activeAlerts.map((a) => (
									<div className={s.rowItem} key={a.title}>
										<div style={{ minWidth: 0 }}>
											<strong>{a.title}</strong>
											<div className={s.rowSub}>{a.sub}</div>
										</div>
										<span className={cx(s.badge, toneBadge[a.tone])}>{a.badge}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-6">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Alert Configuration</h4>
								{c.alertConfig.map((t) => (
									<div className={s.switchRow} key={t.label}>
										<div style={{ minWidth: 0 }}>
											<div className={s.rowTitle}>{t.label}</div>
											<div className={s.rowSub}>{t.sub}</div>
										</div>
										<div className="form-check form-switch">
											<input className="form-check-input" type="checkbox" defaultChecked={t.on} aria-label={t.label} />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.5.4 — Top-up, Rebalancing & Transfers ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-arrow-left-right" /> 1.5.4 — Float Top-up, Rebalancing &amp; Transfers
							</h3>
							<p className={s.sectionSub}>Execute manual and automated float movements between banks, agents, and internal pools with full approval workflows.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("rebalanceModal")}>
								<i className="bi bi-arrow-left-right" /> Rebalance
							</button>
							<button type="button" className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => openModal("bulkTopupModal")}>
								<i className="bi bi-upload" /> Bulk
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Quick Top-up</h4>
								<div className={s.quickGrid}>
									{c.quickTopup.map((q) => (
										<button key={q.label} type="button" className={s.quickBtn} onClick={() => openModal(q.modal)}>
											{q.label}
										</button>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-7">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Recent Rebalancing Activity</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Time</th>
												<th>From</th>
												<th>To</th>
												<th>Amount</th>
												<th>Status</th>
												<th>Ref</th>
											</tr>
										</thead>
										<tbody>
											{c.recentRebalance.map((r) => (
												<tr key={r.ref}>
													<td>{r.time}</td>
													<td>{r.from}</td>
													<td>{r.to}</td>
													<td>{r.amount}</td>
													<td>
														<span className={cx(s.badge, toneBadge[r.statusTone])}>{r.status}</span>
													</td>
													<td>{r.ref}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.5.5 — Settlement & Reconciliation ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-clock-history" style={{ color: "var(--purple)" }} /> 1.5.5 — Settlement &amp; Reconciliation
							</h3>
							<p className={s.sectionSub}>Track daily settlements, investigate mismatches, and reconcile float movements across all counterparties.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("settlementModal")}>
								<i className="bi bi-clock-history" /> Settlements
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("reconciliationModal")}>
								<i className="bi bi-search" /> Reconcile
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Today's Settlements</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Batch</th>
												<th>Counterparty</th>
												<th>Amount</th>
												<th>Status</th>
												<th>Variance</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{c.settlements.map((row) => (
												<tr key={row.batch}>
													<td>{row.batch}</td>
													<td>{row.counterparty}</td>
													<td>{row.amount}</td>
													<td>
														<span className={cx(s.badge, toneBadge[row.statusTone])}>{row.status}</span>
													</td>
													<td>{row.variance}</td>
													<td>
														<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(row.action.modal)}>
															{row.action.label}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Reconciliation Queue</h4>
								{c.reconQueue.map((q) => (
									<div className={s.rowItem} key={q.title}>
										<div style={{ minWidth: 0 }}>
											<strong>{q.title}</strong>
											<div className={s.rowSub}>{q.sub}</div>
										</div>
										<span className={cx(s.badge, toneBadge[q.tone])}>{q.badge}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.5.6 — Forecasting & Analytics ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-graph-up" style={{ color: "var(--warning)" }} /> 1.5.6 — Liquidity Forecasting &amp; Analytics
							</h3>
							<p className={s.sectionSub}>AI-powered forecasting of float requirements, seasonal patterns, and risk scenarios with recommended actions.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("forecastModal")}>
								<i className="bi bi-graph-up" /> Forecast
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("scenarioModal")}>
								<i className="bi bi-sliders" /> Scenarios
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>48-Hour Float Forecast</h4>
								<div className={s.chartBars}>
									{c.forecastBars.map((b) => (
										<div key={b.label} className={s.chartBar} style={{ height: `${b.height}%`, background: toneColor(b.color) }}>
											<span className={s.barLabel}>{b.label}</span>
										</div>
									))}
								</div>
								<div className={cx(s.tile, s.tileDanger, "mt-4")} style={{ fontSize: 12 }}>
									<i className="bi bi-exclamation-triangle me-1" /> <strong>Critical shortfall predicted at +36h</strong> — Recommend KES 120M
									top-up before 06:00 tomorrow.
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Risk Scenarios</h4>
								{c.scenarios.map((sc) => (
									<div className={s.rowItem} key={sc.title}>
										<div style={{ minWidth: 0 }}>
											<strong>{sc.title}</strong>
											<div className={s.rowSub}>{sc.sub}</div>
										</div>
										<span className={cx(s.badge, toneBadge[sc.tone])}>{sc.badge}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 1.5.7 — Emergency Liquidity & Governance ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-shield-lock" style={{ color: "var(--danger)" }} /> 1.5.7 — Emergency Liquidity &amp; Governance
							</h3>
							<p className={s.sectionSub}>Pre-approved emergency facilities, governance controls, audit logs, and executive override capabilities.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm, s.btnDanger)} onClick={() => openModal("emergencyLiquidityModal")}>
								<i className="bi bi-lightning-charge" /> Emergency
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("governanceModal")}>
								<i className="bi bi-file-earmark-check" /> Governance
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Emergency Facilities</h4>
								{c.facilities.map((f) => (
									<div key={f.title} className={cx(s.tile, f.tone === "danger" ? s.tileDanger : s.tileWarn, "mb-2")}>
										<div className={s.tileTitle}>{f.title}</div>
										<div className={s.tileValue}>{f.value}</div>
										<div className={s.tileSub}>{f.sub}</div>
										<button
											type="button"
											className={cx(s.btn, s.btnSm, "mt-2", f.btnDanger ? s.btnDanger : s.btnSecondary)}
											onClick={() => openModal(f.modal)}
										>
											{f.btnLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-7">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Governance & Override Log</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Time</th>
												<th>Action</th>
												<th>Initiator</th>
												<th>Approver</th>
												<th>Amount</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{c.governance.map((g) => (
												<tr key={`${g.time}-${g.action}`}>
													<td>{g.time}</td>
													<td>{g.action}</td>
													<td>{g.initiator}</td>
													<td>{g.approver}</td>
													<td>{g.amount}</td>
													<td>
														<span className={cx(s.badge, toneBadge[g.statusTone])}>{g.status}</span>
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

				{/* ---------- Recent Liquidity Activity ---------- */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<h3 className={s.sectionTitle}>
							<i className="bi bi-clock-history" style={{ color: "var(--ink-500)" }} /> Recent Liquidity Activity
						</h3>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("liquidityReportModal")}>
							Full Audit Log
						</button>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Time</th>
									<th>Action</th>
									<th>From</th>
									<th>To</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Ref</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{c.activity.map((a) => (
									<tr key={a.ref}>
										<td>{a.time}</td>
										<td>{a.action}</td>
										<td>{a.from}</td>
										<td>{a.to}</td>
										<td>{a.amount}</td>
										<td>
											<span className={cx(s.badge, toneBadge[a.statusTone])}>{a.status}</span>
										</td>
										<td>{a.ref}</td>
										<td>
											<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(a.btn.modal)}>
												{a.btn.label}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* ---------- ALL MODALS (state-driven) ---------- */}
			<LiquidityModals modalState={modalState} openModal={openModal} closeModal={closeModal} data={c} />
		</div>
	);
}
