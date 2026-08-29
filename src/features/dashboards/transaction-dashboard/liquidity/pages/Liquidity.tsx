/* ============================================================================
 * Liquidity.tsx — Page 1.5 "Liquidity & Float Management".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.5.html (single-file HTML/CSS/JS, ~2,850 LOC) and
 * REBUILT as a payment-facilitator float workspace (LIQUIDITY_REBUILD_PLAN.md):
 *
 *   - World A — Business Floats: per-business settlement floats (the tanks that
 *     fund customer auto-settlement), with meters, My Access pills, editable
 *     Float Rules, a float-movement ledger, payout-rail liquidity and a runway
 *     forecast. Replaces the old bank/agent/partner treasury console.
 *   - World B — My Liquidity: your Business Wallet + Virtual Wallet, internal
 *     transfers, and the Facilitator Permissions scopes over customer money.
 *   - The rebalance (World B wallet -> World A business float) is the hero flow,
 *     and the RB- refs cross-link to the Reconciliation page.
 *
 * VISUAL REFINEMENT (see ../DESIGN-BLUEPRINT.md): rebuilt on top of the
 * navy/emerald PayMo business-dashboard language shared by transfer-overview,
 * payment-rails and customers — executive hero, numbered dashboard sections,
 * a queue-style attention/suggestions/quick-actions grid, a floating command
 * bar and a page footer. All 25 modals continue to run on the shared
 * SimpleModal / FlowModal / TabbedModal / ModalShell primitives.
 *
 * STYLES: ../styles/liquidity.module.css (emerald theme = Transfer page theme).
 * ========================================================================== */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import {
	type LiquidityData,
	LiquidityModals,
} from "../components/LiquidityModals";
import s from "../styles/liquidity.module.css";

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
interface BusinessFloat {
	id: string;
	name: string;
	type: string;
	customers: number;
	schedule: string;
	balance: number;
	minimum: number;
	status: string;
	statusTone: Tone;
	runwayDays: string;
	runwayTone: "success" | "warn" | "danger";
	role: string;
	roleLimit: string;
	rails: { rail: string; share: number }[];
	autoRule: { trigger: string; source: string; topUp: string };
}
interface FloatMovement {
	ref: string;
	time: string;
	business: string;
	direction: string;
	from: string;
	to: string;
	amount: string;
	trigger: "Manual" | "Auto";
	status: string;
	statusTone: Tone;
}
interface RailUsage {
	rail: string;
	share: number;
	consumed: string;
	businesses: string;
	tone: ToneColor;
}
interface MyWallet {
	icon: string;
	name: string;
	balance: string;
	available: string;
	pending: string;
	purpose: string;
	linked: string;
}
interface ScopeRow {
	icon: string;
	scope: string;
	desc: string;
	granted: boolean;
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
interface RunwayBar {
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
interface ActivityRow {
	time: string;
	world: "customer" | "internal";
	action: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	statusTone: Tone;
	ref: string;
}

export interface LiquidityContent extends LiquidityData {
	connected: boolean;
	connTitle: string;
	connSub: string;
	totalFloat: string;
	totalFloatSub: string;
	worldStats: {
		label: string;
		value: string;
		badge: string;
		badgeTone: Tone;
		icon: string;
	}[];
	attention: Row[];
	suggestions: Row[];
	quickActions: QuickAction[];
	floats: BusinessFloat[];
	movements: FloatMovement[];
	rails: RailUsage[];
	wallets: MyWallet[];
	facilitatorScopes: ScopeRow[];
	activeAlerts: AlertRow[];
	alertConfig: ToggleRow[];
	runwayBars: RunwayBar[];
	scenarios: ScenarioRow[];
	activity: ActivityRow[];
	businesses: string[];
	businessWallets: string[];
	walletsList: string[];
}

const fmt = (n: number) =>
	n >= 1_000_000
		? `KES ${(n / 1_000_000).toFixed(2)}M`
		: `KES ${(n / 1_000).toFixed(0)}K`;

/* --------------------------------------------------------------------------
 * initialMockData — every repeating block from legacy 1.5.html extracted.
 * GET /api/liquidity-float should return this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: LiquidityContent = {
	connected: false,
	connTitle: "Paymo not connected yet",
	connSub:
		"Link your API key to start holding and moving float. You're currently viewing preview data.",
	totalFloat: "KES 3.84M",
	totalFloatSub:
		"Total float held for auto-settlement across your 2 linked businesses",

	worldStats: [
		{
			label: "TOTAL FLOAT HELD",
			value: "KES 3.84M",
			badge: "2 business floats",
			badgeTone: "success",
			icon: "bi-bank2",
		},
		{
			label: "FLOAT VS MINIMUM",
			value: "KES 340K",
			badge: "above combined minimum",
			badgeTone: "warn",
			icon: "bi-bar-chart",
		},
		{
			label: "DAYS OF PAYOUT RUNWAY",
			value: "2.5 days",
			badge: "worst business",
			badgeTone: "info",
			icon: "bi-calendar2-week",
		},
		{
			label: "AUTO-SETTLE READY",
			value: "KES 3.2M",
			badge: "1 of 2 floats above min",
			badgeTone: "success",
			icon: "bi-lightning-charge",
		},
		{
			label: "PAYOUTS THIS WEEK",
			value: "KES 4.6M",
			badge: "drawn from floats",
			badgeTone: "purple",
			icon: "bi-arrow-up-right",
		},
		{
			label: "FLOATS BELOW MINIMUM",
			value: "1",
			badge: "Company 2 at risk",
			badgeTone: "danger",
			icon: "bi-exclamation-triangle",
		},
	],

	attention: [
		{
			icon: "bi-wallet2",
			tone: "danger",
			title: "Company 2 float below minimum",
			sub: "KES 640K available • KES 500K min • auto-settle at risk",
			action: "Rebalance",
			modal: "rebalanceModal",
		},
		{
			icon: "bi-calendar-event",
			tone: "warn",
			title: "Land Buyers payout batch due Friday",
			sub: "Projected draw KES 2.8M • float short by KES 2.8M",
			action: "Top-up",
			modal: "topupBankModal",
		},
		{
			icon: "bi-arrow-repeat",
			tone: "info",
			title: "Auto-refill rule paused for Land Buyers",
			sub: "Re-enable to prevent future gaps before Friday batch",
			action: "Enable",
			modal: "thresholdModal",
		},
	],
	suggestions: [
		{
			icon: "bi-shield-plus",
			tone: "success",
			title: "Set auto-rebalance at 20% above minimum",
			sub: "Prevents weekend gaps for Land Buyers",
			action: "Apply",
			modal: "thresholdModal",
		},
		{
			icon: "bi-arrow-left-right",
			tone: "info",
			title: "Move KES 2M Virtual → Business Wallet",
			sub: "Before Friday's Land Buyers payout batch",
			action: "Move",
			modal: "internalTransferModal",
		},
		{
			icon: "bi-clock",
			tone: "warn",
			title: "Schedule daily float top-up at 6 AM",
			sub: "Avoids auto-settle pauses during peak hours",
			action: "Schedule",
			modal: "forecastModal",
		},
	],
	quickActions: [
		{
			icon: "bi-arrow-left-right",
			tone: "pri",
			label: "Rebalance Float",
			modal: "rebalanceModal",
		},
		{
			icon: "bi-plus-circle",
			tone: "info",
			label: "Top-up Float",
			modal: "topupBankModal",
		},
		{
			icon: "bi-wallet2",
			tone: "pri",
			label: "My Wallets",
			modal: "internalTransferModal",
		},
		{
			icon: "bi-sliders",
			tone: "purple",
			label: "Float Rules",
			modal: "thresholdModal",
		},
		{
			icon: "bi-shield-check",
			tone: "warn",
			label: "My Access",
			modal: "governanceModal",
		},
		{
			icon: "bi-graph-up-arrow",
			tone: "danger",
			label: "Runway",
			modal: "forecastModal",
		},
		{
			icon: "bi-search",
			tone: "muted",
			label: "Reconcile",
			modal: "reconciliationModal",
		},
		{
			icon: "bi-download",
			tone: "pri",
			label: "Reports",
			modal: "liquidityReportModal",
		},
	],

	floats: [
		{
			id: "land",
			name: "Land Buyers LTD",
			type: "Real Estate • 30 customers • Weekly • Fri",
			customers: 30,
			schedule: "Weekly • Fri",
			balance: 3_200_000,
			minimum: 3_000_000,
			status: "Active",
			statusTone: "success",
			runwayDays: "6 days",
			runwayTone: "success",
			role: "Manager",
			roleLimit: "payouts ≤ KES 5M",
			rails: [
				{ rail: "Bank transfer", share: 60 },
				{ rail: "M-Pesa", share: 40 },
			],
			autoRule: {
				trigger: "below-minimum",
				source: "Business Wallet",
				topUp: "to min + 20%",
			},
		},
		{
			id: "co2",
			name: "Company 2",
			type: "Retail • 209 customers • Daily",
			customers: 209,
			schedule: "Daily",
			balance: 640_000,
			minimum: 500_000,
			status: "Active",
			statusTone: "success",
			runwayDays: "2.5 days",
			runwayTone: "danger",
			role: "Owner",
			roleLimit: "full rights",
			rails: [
				{ rail: "M-Pesa", share: 78 },
				{ rail: "Card", share: 22 },
			],
			autoRule: {
				trigger: "below-minimum",
				source: "Business Wallet",
				topUp: "to min + 25% • daily 06:00",
			},
		},
	],
	movements: [
		{
			ref: "RB-9921",
			time: "Today 09:15",
			business: "Land Buyers LTD",
			direction: "Auto-refill",
			from: "Business Wallet",
			to: "Land Buyers Float",
			amount: "KES 3,000,000",
			trigger: "Auto",
			status: "Completed",
			statusTone: "success",
		},
		{
			ref: "RB-9922",
			time: "Today 08:30",
			business: "Company 2",
			direction: "Auto-refill",
			from: "Business Wallet",
			to: "Company 2 Float",
			amount: "KES 640,000",
			trigger: "Auto",
			status: "Completed",
			statusTone: "success",
		},
		{
			ref: "RB-9919",
			time: "Yesterday 16:05",
			business: "Land Buyers LTD",
			direction: "Payout",
			from: "Land Buyers Float",
			to: "Bank transfer",
			amount: "KES 2,250,000",
			trigger: "Auto",
			status: "Completed",
			statusTone: "success",
		},
		{
			ref: "TN-9921",
			time: "Yesterday 11:20",
			business: "—",
			direction: "Wallet transfer",
			from: "Business Wallet",
			to: "Virtual Wallet",
			amount: "KES 150,000",
			trigger: "Manual",
			status: "Completed",
			statusTone: "success",
		},
	],
	rails: [
		{
			rail: "M-Pesa",
			share: 62,
			consumed: "KES 2.9M",
			businesses: "Company 2 • Land Buyers",
			tone: "pri",
		},
		{
			rail: "Bank transfer",
			share: 24,
			consumed: "KES 1.1M",
			businesses: "Land Buyers LTD",
			tone: "info",
		},
		{
			rail: "Card",
			share: 10,
			consumed: "KES 460K",
			businesses: "Company 2",
			tone: "purple",
		},
		{
			rail: "Paymo wallet",
			share: 4,
			consumed: "KES 184K",
			businesses: "Refills & fees",
			tone: "muted",
		},
	],
	wallets: [
		{
			icon: "bi-briefcase",
			name: "Business Wallet",
			balance: "KES 8.40M",
			available: "KES 7.90M",
			pending: "KES 500K",
			purpose: "Funding customer payouts & floats",
			linked: "Equity Bank • 01-2345678-0",
		},
		{
			icon: "bi-person-circle",
			name: "Virtual Wallet",
			balance: "KES 2.10M",
			available: "KES 2.10M",
			pending: "KES 0",
			purpose: "My own money, withdrawable",
			linked: "Paymo account • VIR-88213",
		},
	],
	facilitatorScopes: [
		{
			icon: "bi-eye",
			scope: "View customer transactions",
			desc: "See all 239 customers' txn data flowing through your floats",
			granted: true,
		},
		{
			icon: "bi-arrow-counterclockwise",
			scope: "Initiate refunds",
			desc: "Auto-approve refunds under KES 5K to customers",
			granted: true,
		},
		{
			icon: "bi-shield-exclamation",
			scope: "Reverse chargebacks",
			desc: "File and manage disputes on customer payments",
			granted: true,
		},
		{
			icon: "bi-pause-circle",
			scope: "Hold settlements",
			desc: "Pause a business's payouts while an exception is open",
			granted: false,
		},
		{
			icon: "bi-file-earmark-bar-graph",
			scope: "Export statements",
			desc: "Per-business float & settlement statements",
			granted: true,
		},
	],

	activeAlerts: [
		{
			title: "Company 2 float below minimum",
			sub: "KES 640K / KES 500K min • auto-settle at risk",
			badge: "Critical",
			tone: "danger",
		},
		{
			title: "Land Buyers weekly payout due Friday",
			sub: "Projected draw KES 2.8M",
			badge: "Watch",
			tone: "warn",
		},
		{
			title: "Auto-refill paused for Land Buyers",
			sub: "Manual top-up required before Friday",
			badge: "Warning",
			tone: "warn",
		},
		{
			title: "M-Pesa payout rail slight delay",
			sub: "+12 min avg this morning",
			badge: "Info",
			tone: "info",
		},
	],
	alertConfig: [
		{
			label: "Business float threshold",
			sub: "Alert when below 80% of minimum",
			on: true,
		},
		{
			label: "Runway below 3 days",
			sub: "Alert before auto-settle pauses",
			on: true,
		},
		{
			label: "Auto-refill failure",
			sub: "Alert when a scheduled refill fails",
			on: true,
		},
		{
			label: "Rail delay",
			sub: "Alert when a payout rail slows > 10 min",
			on: false,
		},
	],

	runwayBars: [
		{ height: 95, color: "pri", label: "Now" },
		{ height: 82, color: "pri", label: "+12h" },
		{ height: 64, color: "warn", label: "+24h" },
		{ height: 48, color: "danger", label: "+36h" },
		{ height: 38, color: "danger", label: "+48h" },
	],
	scenarios: [
		{
			title: "Land Buyers weekly batch due Fri",
			sub: "Probability: 92% • draw KES 2.8M",
			badge: "High",
			tone: "danger",
		},
		{
			title: "Company 2 weekend surge",
			sub: "Probability: 68% • M-Pesa orders",
			badge: "Medium",
			tone: "warn",
		},
		{
			title: "M-Pesa payout rail delay",
			sub: "Probability: 12% • +2h worst case",
			badge: "Low",
			tone: "info",
		},
	],

	activity: [
		{
			time: "Today 09:15",
			world: "customer",
			action: "Auto-refill",
			from: "Business Wallet",
			to: "Land Buyers Float",
			amount: "KES 3,000,000",
			status: "Completed",
			statusTone: "success",
			ref: "RB-9921",
		},
		{
			time: "Today 08:30",
			world: "customer",
			action: "Auto-refill",
			from: "Business Wallet",
			to: "Company 2 Float",
			amount: "KES 640,000",
			status: "Completed",
			statusTone: "success",
			ref: "RB-9922",
		},
		{
			time: "Yesterday 16:05",
			world: "customer",
			action: "Payout",
			from: "Land Buyers Float",
			to: "Bank transfer",
			amount: "KES 2,250,000",
			status: "Completed",
			statusTone: "success",
			ref: "RB-9919",
		},
		{
			time: "Yesterday 11:20",
			world: "internal",
			action: "Wallet transfer",
			from: "Business Wallet",
			to: "Virtual Wallet",
			amount: "KES 150,000",
			status: "Completed",
			statusTone: "success",
			ref: "TN-9921",
		},
	],

	/* option lists consumed by the modal forms */
	businesses: ["Land Buyers LTD", "Company 2"],
	businessWallets: [
		"Business Wallet (KES 8.40M)",
		"Virtual Wallet (KES 2.10M)",
	],
	walletsList: ["Business Wallet (KES 8.40M)", "Virtual Wallet (KES 2.10M)"],
};

/* --------------------------------------------------------------------------
 * API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchLiquidityFloat(): Promise<LiquidityContent> {
	const res = await fetch("/api/liquidity-float", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as LiquidityContent;
}

/* --------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------ */
export default function Liquidity({
	initialBusiness,
}: {
	initialBusiness?: "land" | "co2";
}) {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [world, setWorld] = useState<"floats" | "wallets">("floats");
	const [biz, setBiz] = useState(initialBusiness ?? "all");
	const [toasts, setToasts] = useState<
		{ id: number; message: string; variant: "success" | "danger" }[]
	>([]);

	/* keep the business filter in sync when a deep link (e.g. a float-link chip
	 * from the Reconciliation page) changes the ?business= search param while
	 * this page is already mounted (browser back/forward, in-app re-navigation). */
	useEffect(() => {
		setBiz(initialBusiness ?? "all");
	}, [initialBusiness]);
	const openModal = (id: string) =>
		setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) =>
		setModalState((p) => ({ ...p, [id]: false }));

	useEffect(() => {
		if (!toasts.length) return;
		const timer = window.setTimeout(
			() => setToasts((prev) => prev.slice(1)),
			4200,
		);
		return () => window.clearTimeout(timer);
	}, [toasts]);

	const pushToast = (
		message: string,
		variant: "success" | "danger" = "success",
	) =>
		setToasts((prev) => [
			...prev.slice(-4),
			{ id: Date.now() + Math.random(), message, variant },
		]);

	const { data } = useQuery({
		queryKey: ["paymo-liquidity-float"],
		queryFn: fetchLiquidityFloat,
		staleTime: 60_000,
		retry: 1,
	});
	// Falls back to initialMockData so the page never breaks.
	const c = data ?? initialMockData;

	const bizName =
		biz === "land" ? "Land Buyers LTD" : biz === "co2" ? "Company 2" : "";
	const inScope = (b: string) => biz === "all" || b === bizName;
	const bizFloats = c.floats.filter((f) => inScope(f.name));
	const bizMovements = c.movements.filter(
		(m) => m.business === "—" || inScope(m.business),
	);

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
			<div className={s.stack}>
				{/* ---------- executive hero ---------- */}
				<header className={s.heroBanner}>
					<div className={s.heroOrbOne} aria-hidden="true" />
					<div className={s.heroOrbTwo} aria-hidden="true" />
					<div className={s.heroContent}>
						<div className={s.heroCopy}>
							<div className={s.heroEyebrow}>
								<span>
									<i className="bi bi-bank2" aria-hidden="true" /> Liquidity
									&amp; Float
								</span>
								<span className={s.livePill}>
									<span className={s.liveDot} aria-hidden="true" /> 2 floats
									live
								</span>
							</div>
							<h1>Every shilling that fuels your customer settlements.</h1>
							<p>{c.totalFloatSub}</p>
							<div className={s.heroActions}>
								<button
									type="button"
									className={s.heroPrimary}
									onClick={() => openModal("rebalanceModal")}
								>
									<i className="bi bi-arrow-left-right" aria-hidden="true" />{" "}
									Rebalance float
								</button>
								<button
									type="button"
									className={s.heroSecondary}
									onClick={() => openModal("thresholdModal")}
								>
									<i className="bi bi-sliders" aria-hidden="true" /> Float rules
								</button>
								<button
									type="button"
									className={s.heroSecondary}
									onClick={() => openModal("floatAlertModal")}
								>
									<i className="bi bi-bell" aria-hidden="true" /> Alerts
								</button>
								<button
									type="button"
									className={s.heroSecondary}
									onClick={() => openModal("liquidityHealthModal")}
								>
									<i className="bi bi-heart-pulse" aria-hidden="true" /> Health
									check
								</button>
							</div>
						</div>
						<aside className={s.heroSnapshot} aria-label="Float snapshot">
							<span>Float snapshot</span>
							<strong>{c.totalFloat}</strong>
							<p>Held across your 2 linked businesses for auto-settlement.</p>
							<div className={s.heroMetricRow}>
								<div>
									<strong>2 floats</strong>
									<span>Linked businesses</span>
								</div>
								<div>
									<strong>1 at risk</strong>
									<span>Below minimum</span>
								</div>
								<div>
									<strong>2.5 days</strong>
									<span>Worst runway</span>
								</div>
							</div>
						</aside>
					</div>
				</header>

				{/* ---------- breadcrumb ---------- */}
				<div className={s.pageBar}>
					<div className={s.breadcrumb}>
						<Link to="/pm/app">Home</Link> /{" "}
						<Link to="/pm/app/transfers">Transactions Hub</Link> /{" "}
						<strong>Liquidity &amp; Float</strong>
					</div>
					<button
						type="button"
						className={cx(s.btn, s.btnSm)}
						onClick={() => openModal("liquidityReportModal")}
					>
						<i className="bi bi-download" /> Reports
					</button>
				</div>

				{/* ---------- CONNECTION BANNER ---------- */}
				{!c.connected && (
					<div className={s.connBanner}>
						<div className={s.connIcon}>
							<i className="bi bi-lightbulb" />
						</div>
						<div style={{ minWidth: 0 }}>
							<div className={s.connTitle}>{c.connTitle}</div>
							<p className={s.connSub}>{c.connSub}</p>
							<span className={s.connTag}>
								<i className="bi bi-sandwich" /> Sandbox preview
							</span>
						</div>
						<div style={{ marginLeft: "auto" }}>
							<button
								type="button"
								className={cx(s.btn, s.btnSm, s.btnPrimary)}
								onClick={() => openModal("topupBankModal")}
							>
								<i className="bi bi-key" /> Link API Key
							</button>
						</div>
					</div>
				)}

				{/* ---------- WORLD SWITCH + BUSINESS SELECTOR ---------- */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 14,
						flexWrap: "wrap",
					}}
				>
					<div className={s.worldSwitch}>
						<button
							type="button"
							className={cx(s.worldBtn, world === "floats" && s.worldBtnActive)}
							onClick={() => setWorld("floats")}
						>
							<i className="bi bi-bank2" /> Business Floats
						</button>
						<button
							type="button"
							className={cx(
								s.worldBtn,
								world === "wallets" && s.worldBtnActive,
							)}
							onClick={() => setWorld("wallets")}
						>
							<i className="bi bi-wallet2" /> My Liquidity
						</button>
					</div>
					{world === "floats" && (
						<div className={s.bizBar}>
							<span className={s.bizLabel}>Scope</span>
							<div className={s.pills}>
								<button
									type="button"
									className={cx(s.pill, biz === "all" && s.pillActive)}
									onClick={() => setBiz("all")}
								>
									All Floats
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
					)}
				</div>

				{/* ================= WORLD A — BUSINESS FLOATS ================= */}
				{world === "floats" && (
					<>
						{/* ---------- FLOAT HEALTH STATS ---------- */}
						<section
							className={s.dashboardSection}
							aria-label="Float health metrics"
						>
							<div className={s.kpiGrid}>
								{c.worldStats.map((st) => (
									<div className={cx(s.card, s.kpiCard)} key={st.label}>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
											}}
										>
											<p className={s.statLabel} style={{ margin: 0 }}>
												{st.label}
											</p>
											<i
												className={cx("bi", st.icon)}
												style={{ color: "var(--ink-300)", fontSize: 18 }}
											/>
										</div>
										<div className={s.statValue} style={{ margin: "8px 0" }}>
											{st.value}
										</div>
										<span
											className={cx(s.badge, toneBadge[st.badgeTone])}
											style={{ fontSize: 11 }}
										>
											{st.badge}
										</span>
									</div>
								))}
							</div>
						</section>

						{/* ---------- BUSINESS FLOAT CARDS ---------- */}
						<section
							className={s.dashboardSection}
							aria-labelledby="liq-sec-floats"
						>
							<SectionHeading
								index="01"
								id="liq-sec-floats"
								title="Business settlement floats"
								description="Pre-funded tanks that auto-settle each business's customer payments. Rebalance from your wallet to keep them topped up."
							/>
							<div className={s.card}>
								<div className={s.sectionHead}>
									<div>
										<h3 className={s.sectionTitle}>
											<i className="bi bi-bank2" /> Float cards
										</h3>
										<p className={s.sectionSub}>
											{bizFloats.length} of {c.floats.length} business floats in
											scope
										</p>
									</div>
									<div className="d-flex" style={{ gap: 8 }}>
										<button
											type="button"
											className={cx(s.btn, s.btnSm)}
											onClick={() => openModal("thresholdModal")}
										>
											<i className="bi bi-sliders" /> Float Rules
										</button>
										<button
											type="button"
											className={cx(s.btn, s.btnSm, s.btnPrimary)}
											onClick={() => openModal("rebalanceModal")}
										>
											<i className="bi bi-arrow-left-right" /> Rebalance
										</button>
									</div>
								</div>
								<div className="row g-3">
									{bizFloats.map((f) => {
										const pct = Math.round((f.balance / f.minimum) * 100);
										const fillCls =
											pct >= 100
												? s.floatFill
												: pct >= 80
													? s.floatFillLow
													: s.floatFillCritical;
										return (
											<div className="col-lg-6" key={f.id}>
												<div className={s.floatCard}>
													<div className={s.floatHead}>
														<div>
															<h4 className={s.floatName}>{f.name}</h4>
															<div className={s.floatMeta}>{f.type}</div>
														</div>
														<span
															className={cx(s.badge, toneBadge[f.statusTone])}
														>
															<i
																className="bi bi-circle-fill"
																style={{ fontSize: 7 }}
															/>{" "}
															{f.status}
														</span>
													</div>
													<div className={s.floatKpis}>
														<div className={s.floatKpi}>
															<div className={s.floatKpiLabel}>Float</div>
															<div className={s.floatKpiValue}>
																{fmt(f.balance)}
															</div>
														</div>
														<div className={s.floatKpi}>
															<div className={s.floatKpiLabel}>Minimum</div>
															<div className={s.floatKpiValue}>
																{fmt(f.minimum)}
															</div>
														</div>
													</div>
													<div>
														<div className={s.floatMeter}>
															<div
																className={fillCls}
																style={{ width: `${Math.min(pct, 100)}%` }}
															/>
														</div>
														<div className={s.floatPct}>
															<span>
																{pct}% of minimum • {f.runwayDays} runway
															</span>
															<span>
																<i className="bi bi-lightning-charge" />{" "}
																{f.autoRule.trigger === "below-minimum"
																	? "auto-settle ready"
																	: "manual"}
															</span>
														</div>
													</div>
													<div>
														<span className={s.myAccessPill}>
															<i className="bi bi-shield-check" /> My Access:{" "}
															{f.role} · {f.roleLimit}
														</span>
														<div
															className={s.floatMeta}
															style={{ marginTop: 10 }}
														>
															Rails:{" "}
															{f.rails
																.map((r) => `${r.rail} ${r.share}%`)
																.join(" · ")}
														</div>
														<div className={s.floatMeta}>
															Auto-rule: {f.autoRule.source} → top-up{" "}
															{f.autoRule.topUp}
														</div>
													</div>
													<div
														className="d-flex"
														style={{
															gap: 8,
															flexWrap: "wrap",
															marginTop: "auto",
														}}
													>
														<button
															type="button"
															className={cx(s.btn, s.btnSm)}
															onClick={() => openModal("thresholdModal")}
														>
															<i className="bi bi-sliders" /> Float Rules
														</button>
														<button
															type="button"
															className={cx(s.btn, s.btnSm)}
															onClick={() => openModal("topupBankModal")}
														>
															<i className="bi bi-plus-circle" /> Top-up
														</button>
														<button
															type="button"
															className={cx(s.btn, s.btnSm, s.btnPrimary)}
															onClick={() => openModal("rebalanceModal")}
														>
															<i className="bi bi-arrow-left-right" /> Rebalance
														</button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</section>

						{/* ---------- FLOAT MOVEMENTS LEDGER ---------- */}
						<section
							className={s.dashboardSection}
							aria-labelledby="liq-sec-ledger"
						>
							<SectionHeading
								index="02"
								id="liq-sec-ledger"
								title="Float movements ledger"
								description="Every top-up, payout, refund and auto-refill — with the RB- refs that reconcile on the Reconciliation page."
							/>
							<div className={s.card}>
								<div className={s.sectionHead}>
									<div>
										<h3 className={s.sectionTitle}>
											<i className="bi bi-arrow-left-right" /> Movement log
										</h3>
										<p className={s.sectionSub}>
											{bizMovements.length} entries
										</p>
									</div>
									<div className="d-flex" style={{ gap: 8 }}>
										<button
											type="button"
											className={cx(s.btn, s.btnSm)}
											onClick={() => openModal("settlementModal")}
										>
											<i className="bi bi-flag" /> Settlement status
										</button>
										<button
											type="button"
											className={cx(s.btn, s.btnSm)}
											onClick={() => openModal("rebalanceModal")}
										>
											<i className="bi bi-plus-lg" /> New Movement
										</button>
									</div>
								</div>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Ref</th>
												<th>Time</th>
												<th>Business</th>
												<th>Direction</th>
												<th>From</th>
												<th>To</th>
												<th>Amount</th>
												<th>Trigger</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{bizMovements.map((m) => (
												<tr key={m.ref}>
													<td>
														<code>{m.ref}</code>
													</td>
													<td>{m.time}</td>
													<td>
														<strong>{m.business}</strong>
													</td>
													<td>{m.direction}</td>
													<td>{m.from}</td>
													<td>{m.to}</td>
													<td>
														<strong>{m.amount}</strong>
													</td>
													<td>
														<span
															className={cx(
																s.badge,
																m.trigger === "Auto"
																	? s.badgeInfo
																	: s.badgeOutline,
															)}
														>
															{m.trigger}
														</span>
													</td>
													<td>
														<span
															className={cx(s.badge, toneBadge[m.statusTone])}
														>
															{m.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</section>

						{/* ---------- PAYOUT RAIL LIQUIDITY ---------- */}
						<section
							className={s.dashboardSection}
							aria-labelledby="liq-sec-rails"
						>
							<SectionHeading
								index="03"
								id="liq-sec-rails"
								title="Payout rail liquidity"
								description="The sinks of your float — how much each rail (M-Pesa, bank, card, wallet) consumed this week, per business, plus the 48-hour runway forecast."
							/>
							<div className={s.card}>
								<div className="row g-3">
									<div className="col-lg-6">
										{c.rails.map((r) => (
											<div className={s.railRow} key={r.rail}>
												<i
													className="bi bi-diagram-3"
													style={{ color: toneColor(r.tone), fontSize: 18 }}
												/>
												<div style={{ minWidth: 0, flex: 1 }}>
													<div
														style={{
															display: "flex",
															justifyContent: "space-between",
															fontSize: 13,
														}}
													>
														<strong>{r.rail}</strong>
														<span style={{ color: "var(--ink-500)" }}>
															{r.consumed}
														</span>
													</div>
													<div className={s.railBar} style={{ marginTop: 6 }}>
														<div
															className={s.railFill}
															style={{
																width: `${r.share}%`,
																background: toneColor(r.tone),
															}}
														/>
													</div>
													<div className={s.floatMeta}>{r.businesses}</div>
												</div>
											</div>
										))}
									</div>
									<div className="col-lg-6">
										<div className={s.subBlock}>
											<h4 className={s.blockHead}>48-Hour Float Runway</h4>
											<div className={s.chartBars}>
												{c.runwayBars.map((b) => (
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
											<div
												className={cx(s.tile, s.tileDanger, "mt-4")}
												style={{ fontSize: 12 }}
											>
												<i className="bi bi-exclamation-triangle me-1" />{" "}
												<strong>
													Company 2 runway drops below 2 days at +36h
												</strong>{" "}
												— recommend rebalancing KES 640K from Business Wallet
												now.
											</div>
											<div
												className="mt-3 d-flex align-items-center justify-content-between"
												style={{ gap: 8 }}
											>
												<h4 className={s.blockHead} style={{ margin: 0 }}>
													Risk Scenarios
												</h4>
												<button
													type="button"
													className={cx(s.btn, s.btnSm)}
													onClick={() => openModal("scenarioModal")}
												>
													<i className="bi bi-sliders" /> Plan scenario
												</button>
											</div>
											<div>
												{c.scenarios.map((sc) => (
													<div className={s.rowItem} key={sc.title}>
														<div style={{ minWidth: 0 }}>
															<strong>{sc.title}</strong>
															<div className={s.rowSub}>{sc.sub}</div>
														</div>
														<span className={cx(s.badge, toneBadge[sc.tone])}>
															{sc.badge}
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* ---------- MONITORING & ALERTS ---------- */}
						<section
							className={s.dashboardSection}
							aria-labelledby="liq-sec-monitor"
						>
							<SectionHeading
								index="04"
								id="liq-sec-monitor"
								title="Float monitoring & alerts"
								description="Live float levels with per-business thresholds and auto-refill rules."
							/>
							<div className={s.card}>
								<div className={s.sectionHead}>
									<div
										className="d-flex"
										style={{ gap: 8, marginLeft: "auto" }}
									>
										<button
											type="button"
											className={cx(s.btn, s.btnSm)}
											onClick={() => openModal("floatAlertModal")}
										>
											<i className="bi bi-bell" /> Alerts
										</button>
										<button
											type="button"
											className={cx(s.btn, s.btnSm)}
											onClick={() => openModal("thresholdModal")}
										>
											<i className="bi bi-sliders" /> Thresholds
										</button>
									</div>
								</div>
								<div className="row g-3">
									<div className="col-lg-6">
										<div className={s.subBlock}>
											<h4 className={s.blockHead}>Active Alerts</h4>
											{c.activeAlerts.map((a) => (
												<div className={s.rowItem} key={a.title}>
													<div style={{ minWidth: 0 }}>
														<strong>{a.title}</strong>
														<div className={s.rowSub}>{a.sub}</div>
													</div>
													<span className={cx(s.badge, toneBadge[a.tone])}>
														{a.badge}
													</span>
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
														<input
															className="form-check-input"
															type="checkbox"
															defaultChecked={t.on}
															aria-label={t.label}
														/>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</section>
					</>
				)}

				{/* ================= WORLD B — MY LIQUIDITY ================= */}
				{world === "wallets" && (
					<>
						{/* ---------- MY WALLETS ---------- */}
						<section
							className={s.dashboardSection}
							aria-labelledby="liq-sec-wallets"
						>
							<SectionHeading
								index="01"
								id="liq-sec-wallets"
								title="My wallets"
								description="Your Business Wallet and Virtual Wallet — the source of every float top-up and rebalance."
							/>
							<div className="row g-3">
								{c.wallets.map((w) => (
									<div className="col-lg-6" key={w.name}>
										<div className={s.walletCard}>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 12,
													}}
												>
													<div className={s.walletIcon}>
														<i className={cx("bi", w.icon)} />
													</div>
													<div>
														<h4 className={s.floatName} style={{ margin: 0 }}>
															{w.name}
														</h4>
														<div className={s.floatMeta}>{w.purpose}</div>
													</div>
												</div>
												<span className={cx(s.badge, s.badgeSuccess)}>
													Active
												</span>
											</div>
											<div className={s.walletBalance}>{w.balance}</div>
											<div>
												<div className={s.walletRow}>
													<span className={s.walletRowLabel}>Available</span>
													<strong>{w.available}</strong>
												</div>
												<div className={s.walletRow}>
													<span className={s.walletRowLabel}>Pending</span>
													<strong>{w.pending}</strong>
												</div>
												<div className={s.walletRow}>
													<span className={s.walletRowLabel}>Linked</span>
													<strong style={{ fontSize: 12 }}>{w.linked}</strong>
												</div>
											</div>
											<div
												className="d-flex"
												style={{ gap: 8, flexWrap: "wrap", marginTop: "auto" }}
											>
												<button
													type="button"
													className={cx(s.btn, s.btnSm)}
													onClick={() => openModal("internalTransferModal")}
												>
													<i className="bi bi-arrow-left-right" /> Send
												</button>
												<button
													type="button"
													className={cx(s.btn, s.btnSm, s.btnPrimary)}
													onClick={() => openModal("topupBankModal")}
												>
													<i className="bi bi-plus-circle" /> Top Up
												</button>
												<button
													type="button"
													className={cx(s.btn, s.btnSm)}
													onClick={() => openModal("internalTransferModal")}
												>
													<i className="bi bi-bank" /> Withdraw
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</section>

						{/* ---------- FACILITATOR PERMISSIONS ---------- */}
						<section
							className={s.dashboardSection}
							aria-labelledby="liq-sec-permissions"
						>
							<SectionHeading
								index="02"
								id="liq-sec-permissions"
								title="Facilitator permissions"
								description="Your authority over your customers' money and data while it flows through your floats."
							/>
							<div className={s.card}>
								<div className={s.sectionHead}>
									<div
										className="d-flex"
										style={{ gap: 8, marginLeft: "auto" }}
									>
										<button
											type="button"
											className={cx(s.btn, s.btnSm)}
											onClick={() => openModal("governanceModal")}
										>
											<i className="bi bi-arrow-repeat" /> Request Access
										</button>
									</div>
								</div>
								<div className="row g-3">
									{c.facilitatorScopes.map((sc) => (
										<div className="col-lg-4" key={sc.scope}>
											<div className={s.permItem}>
												<i
													className={cx("bi", sc.icon)}
													style={{
														color: sc.granted
															? "var(--success)"
															: "var(--warning)",
														fontSize: 18,
														marginTop: 2,
													}}
												/>
												<div style={{ minWidth: 0, flex: 1 }}>
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
										</div>
									))}
								</div>
							</div>
						</section>
					</>
				)}

				{/* ---------- ATTENTION / SUGGESTIONS / QUICK ACTIONS ---------- */}
				<section
					className={s.dashboardSection}
					aria-labelledby="liq-sec-queues"
				>
					<SectionHeading
						index={world === "floats" ? "05" : "03"}
						id="liq-sec-queues"
						title="Attention, suggestions & quick actions"
						description="Open float items, AI liquidity recommendations and the actions you use most — each opens the matching workflow."
					/>
					<div className={s.queueGrid}>
						<div className={cx(s.card, s.queueCard)}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Attention Required</h3>
								<button
									type="button"
									className={cx(s.btn, s.btnSm)}
									onClick={() => openModal("attentionModal")}
								>
									View all
								</button>
							</div>
							{c.attention.map(renderRow)}
						</div>
						<div className={cx(s.card, s.queueCard)}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Smart Suggestions</h3>
								<span className={cx(s.badge, s.badgePurple)}>
									<i className="bi bi-stars" /> AI
								</span>
							</div>
							{c.suggestions.map(renderRow)}
						</div>
						<div className={cx(s.card, s.queueCard)}>
							<div style={{ marginBottom: 16 }}>
								<h3 className={s.sectionTitle}>Quick Actions</h3>
								<p className={s.sectionSub}>Frequent liquidity workflows</p>
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
				</section>

				{/* ---------- RECENT LIQUIDITY ACTIVITY ---------- */}
				<section
					className={s.dashboardSection}
					aria-labelledby="liq-sec-activity"
				>
					<SectionHeading
						index={world === "floats" ? "06" : "04"}
						id="liq-sec-activity"
						title="Recent liquidity activity"
						description="The unified audit trail across both worlds — business float movements and your own wallet transfers."
					/>
					<div className={s.card}>
						<div className={s.sectionHead}>
							<div className="d-flex" style={{ gap: 8, marginLeft: "auto" }}>
								<button
									type="button"
									className={cx(s.btn, s.btnSm)}
									onClick={() => openModal("liquidityReportModal")}
								>
									Full Audit Log
								</button>
							</div>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Time</th>
										<th>World</th>
										<th>Action</th>
										<th>From</th>
										<th>To</th>
										<th>Amount</th>
										<th>Status</th>
										<th>Ref</th>
									</tr>
								</thead>
								<tbody>
									{c.activity.map((a) => (
										<tr key={a.ref}>
											<td>{a.time}</td>
											<td>
												<span
													className={cx(
														s.flowTag,
														a.world === "customer"
															? s.flowCustomer
															: s.flowInternal,
													)}
												>
													<i
														className={cx(
															"bi",
															a.world === "customer"
																? "bi-people"
																: "bi-wallet2",
														)}
													/>
													{a.world === "customer"
														? "Business Float"
														: "My Liquidity"}
												</span>
											</td>
											<td>{a.action}</td>
											<td>{a.from}</td>
											<td>{a.to}</td>
											<td>
												<strong>{a.amount}</strong>
											</td>
											<td>
												<span className={cx(s.badge, toneBadge[a.statusTone])}>
													{a.status}
												</span>
											</td>
											<td>
												<code>{a.ref}</code>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* ---------- PAGE FOOTER ---------- */}
				<footer className={s.pageFooter}>
					<span>
						Liquidity &amp; Float · Land Buyers LTD &amp; Company 2 · Data
						refreshes every 60s
					</span>
					<div className="d-flex" style={{ gap: 16 }}>
						<Link to="/pm/app/reconciliation">Reconciliation</Link>
						<Link to="/pm/app/settlement" search={{ modal: undefined }}>
							Settlement
						</Link>
						<Link to="/pm/app/payment-rails">Payment Rails</Link>
					</div>
				</footer>
			</div>

			{/* ---------- FLOATING COMMAND BAR ---------- */}
			<div className={s.floatingBar}>
				<button
					type="button"
					className={cx(s.btn, s.btnSm)}
					onClick={() => openModal("floatAlertModal")}
				>
					<i className="bi bi-bell" /> Alerts
				</button>
				<button
					type="button"
					className={cx(s.btn, s.btnSm)}
					onClick={() => openModal("forecastModal")}
				>
					<i className="bi bi-graph-up" /> Forecast
				</button>
				<button
					type="button"
					className={s.floatingPrimary}
					onClick={() => openModal("rebalanceModal")}
				>
					<i className="bi bi-arrow-left-right" /> Rebalance float
				</button>
			</div>

			{/* ---------- TOAST STACK ---------- */}
			{toasts.length > 0 && (
				<div className={s.toastStack} aria-live="polite" aria-atomic="false">
					{toasts.map((t) => (
						<div
							key={t.id}
							className={cx(s.toast, t.variant === "danger" && s.toastDanger)}
						>
							<i
								className={cx(
									"bi",
									t.variant === "danger"
										? "bi-exclamation-triangle"
										: "bi-check-circle",
								)}
							/>
							<span>{t.message}</span>
						</div>
					))}
				</div>
			)}

			{/* ---------- ALL MODALS (state-driven) ---------- */}
			<LiquidityModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={c}
				onToast={pushToast}
			/>
		</div>
	);
}

function SectionHeading({
	index,
	id,
	title,
	description,
}: {
	index: string;
	id: string;
	title: string;
	description: string;
}) {
	return (
		<div className={s.sectionHeading}>
			<span className={s.sectionIndex} aria-hidden="true">
				{index}
			</span>
			<div>
				<h2 id={id}>{title}</h2>
				<p>{description}</p>
			</div>
		</div>
	);
}
