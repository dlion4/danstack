import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import FeesModals from "../components/FeesModals";
import styles from "../styles/fees.module.css";

/* ============================================================================
   PayMo BaaS — Fees, Charges & Profit Channeling (facilitator edition)
   Two directions:
     Direction 1 — what PayMo charges you (your costs per service)
     Direction 2 — what you charge your customers (your fee models)
   Signature: Profit Pot auto-channels net profit to your wallets instantly.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
type BizId = "all" | "land" | "co2";
type World = "charges" | "profit";

const BIZ_NAMES: Record<"land" | "co2", string> = {
	land: "Land Buyers LTD",
	co2: "Company 2",
};

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

interface FeesConfig {
	breadcrumb: { parents: { label: string; to: string }[]; current: string };
	pageTitle: string;
	pageSub: string;
	hero: {
		live: string;
		value: string;
		detail: string;
		buttons: { label: string; modal: string }[];
	};
	stats: {
		label: string;
		labelColor: string;
		value: string;
		badge: { icon: string; text: string; tone: BadgeTone };
	}[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	models: {
		name: string;
		example: string;
		biz: string;
		state: string;
		tone: BadgeTone;
	}[];
	businesses: {
		id: "land" | "co2";
		name: string;
		model: string;
		charge: string;
		paymoFee: string;
		profit: string;
		status: string;
	}[];
	charges: {
		ref: string;
		business: string;
		customer: string;
		service: string;
		charged: string;
		paymoFee: string;
		profit: string;
		status: string;
		tone: BadgeTone;
	}[];
	paymoCosts: {
		service: string;
		rate: string;
		paidMTD: string;
	}[];
	profitPot: {
		balance: string;
		pending: string;
		deliveredMTD: string;
	};
	channelRules: {
		title: string;
		sub: string;
		badge: { text: string; tone: BadgeTone };
		modal: string;
	}[];
	deliveries: {
		time: string;
		source: string;
		profit: string;
		channel: string;
		status: string;
		tone: BadgeTone;
	}[];
	costBars: { height: string; color: string; label: string }[];
	keyMetrics: { label: string; value: string; color: string }[];
	waivers: {
		id: string;
		name: string;
		type: string;
		discount: string;
		used: string;
		actionLabel: string;
	}[];
	compliance: { label: string; status: string; tone: BadgeTone }[];
	profitAccess: { scope: string; desc: string; granted: boolean }[];
	activity: {
		date: string;
		world: "cust" | "my";
		ref: string;
		activity: string;
		amount: string;
		status: string;
		tone: BadgeTone;
	}[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: FeesConfig = {
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/" },
			{ label: "BaaS Transactions", to: "/pm/app" },
		],
		current: "Fees, Charges & Profit",
	},
	pageTitle: "Fees, Charges & Profit Channeling",
	pageSub:
		"What PayMo charges you, what you charge your customers, and where your profit lands.",
	hero: {
		live: "Profit engine is live",
		value: "KES 1.34M profit in your pot",
		detail:
			"This month: KES 18.4M collected · your charges KES 2.31M · PayMo fees KES 968K · net delivered KES 1.34M.",
		buttons: [
			{ label: "Calculator", modal: "feeCalculatorModal" },
			{ label: "Profit Pot", modal: "potDetailModal" },
			{ label: "New Fee Model", modal: "addFeeRuleModal" },
		],
	},
	stats: [
		{
			label: "PROFIT IN POT",
			labelColor: "var(--pm-primary)",
			value: "KES 1.34M",
			badge: {
				icon: "bi-lightning-charge",
				text: "auto-delivering · next KES 84,500",
				tone: "badgeS",
			},
		},
		{
			label: "YOUR CHARGES (MTD)",
			labelColor: "var(--pm-info)",
			value: "KES 2.31M",
			badge: {
				icon: "bi-receipt",
				text: "avg 1.75% on customer money",
				tone: "badgeS",
			},
		},
		{
			label: "PAYMO FEES (MTD)",
			labelColor: "var(--pm-warning)",
			value: "KES 968K",
			badge: {
				icon: "bi-wallet2",
				text: "1.42% blended cost",
				tone: "badgeW",
			},
		},
		{
			label: "NET PROFIT (MTD)",
			labelColor: "var(--pm-accent)",
			value: "KES 1.34M",
			badge: {
				icon: "bi-bank2",
				text: "delivered to Business Wallet",
				tone: "badgeS",
			},
		},
		{
			label: "DELIVERY RULES",
			labelColor: "var(--pm-purple)",
			value: "3",
			badge: {
				icon: "bi-arrow-left-right",
				text: "2 active · 1 paused",
				tone: "badgeP",
			},
		},
		{
			label: "AVG FEE RATE",
			labelColor: "var(--pm-danger)",
			value: "1.75%",
			badge: {
				icon: "bi-percent",
				text: "Land Buyers flat · Company 2 %",
				tone: "badgeS",
			},
		},
	],
	attention: [
		{
			icon: "bi-lightning-charge",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Profit pot above auto-deliver threshold",
			sub: "KES 25K rule — M-Pesa channel paused",
			actionLabel: "Review",
			modal: "partnerPayoutModal",
		},
		{
			icon: "bi-percent",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Company 2 break-even orders",
			sub: "12 orders covered by 2.0% charge — consider tiered",
			actionLabel: "Adjust",
			actionTone: "btnPmD",
			modal: "addFeeRuleModal",
		},
		{
			icon: "bi-globe",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "International transfer fee rose 8%",
			sub: "1.5% + KES 150 — 24 this month",
			actionLabel: "View",
			modal: "feeReportModal",
		},
	],
	suggestions: [
		{
			icon: "bi-layers",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Move Company 2 to tiered model",
			sub: "1.0 / 1.5% recovers ≈ KES 46K/mo",
			actionLabel: "Apply",
			modal: "addCommissionTierModal",
		},
		{
			icon: "bi-lightning-charge",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Turn on instant micro-profit delivery",
			sub: "Even KES 2 lands in your wallet",
			actionLabel: "Enable",
			modal: "channelRuleModal",
		},
		{
			icon: "bi-megaphone",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Offer 0% promo to 5 new Land Buyers buyers",
			sub: "Typical 12% conversion lift",
			actionLabel: "Create",
			modal: "promoModal",
		},
	],
	quickActions: [
		{
			icon: "bi-calculator",
			label: "Fee Calculator",
			color: "var(--pm-info)",
			modal: "feeCalculatorModal",
		},
		{
			icon: "bi-plus-circle",
			label: "New Fee Model",
			color: "var(--pm-primary-light)",
			modal: "addFeeRuleModal",
		},
		{
			icon: "bi-cash-stack",
			label: "Profit Pot",
			color: "var(--pm-purple)",
			modal: "potDetailModal",
		},
		{
			icon: "bi-arrow-left-right",
			label: "Channel Rules",
			color: "var(--pm-accent)",
			modal: "channelRuleModal",
		},
		{
			icon: "bi-receipt",
			label: "Charge a Customer",
			color: "var(--pm-warning)",
			modal: "chargeCustomerModal",
		},
		{
			icon: "bi-download",
			label: "Fee Report",
			color: "var(--pm-accent)",
			modal: "feeReportModal",
		},
		{
			icon: "bi-tag",
			label: "Waivers & Promos",
			color: "var(--pm-danger)",
			modal: "waiverModal",
		},
		{
			icon: "bi-trophy",
			label: "Profit by Service",
			color: "var(--pm-info)",
			modal: "agentLeaderboardModal",
		},
	],
	models: [
		{
			name: "Flat amount",
			example: "KES 1,250 per installment",
			biz: "Land Buyers LTD",
			state: "In use",
			tone: "badgeS",
		},
		{
			name: "Percentage",
			example: "2.0% of order value",
			biz: "Company 2",
			state: "In use",
			tone: "badgeS",
		},
		{
			name: "Tiered",
			example: "1.0% < 50K · 1.5% ≥ 50K",
			biz: "—",
			state: "Available",
			tone: "badgeI",
		},
		{
			name: "Cap + floor",
			example: "min KES 20 · max KES 5,000",
			biz: "—",
			state: "Available",
			tone: "badgeI",
		},
		{
			name: "Discount / bonus",
			example: "0% fees in promo month",
			biz: "—",
			state: "Available",
			tone: "badgeI",
		},
		{
			name: "Zero-fee",
			example: "absorb cost to win customers",
			biz: "—",
			state: "Available",
			tone: "badgeI",
		},
	],
	businesses: [
		{
			id: "land",
			name: "Land Buyers LTD",
			model: "Flat amount",
			charge: "KES 1,250 per installment",
			paymoFee: "1.25%",
			profit: "KES 864K",
			status: "Active",
		},
		{
			id: "co2",
			name: "Company 2",
			model: "Percentage",
			charge: "2.0% per order",
			paymoFee: "2.0%",
			profit: "KES 256K",
			status: "Active",
		},
	],
	charges: [
		{
			ref: "CHG-4401",
			business: "Land Buyers LTD",
			customer: "Plot #PLT-091",
			service: "Installment",
			charged: "KES 1,250",
			paymoFee: "KES 56,250",
			profit: "KES 18,750",
			status: "Collected",
			tone: "badgeS",
		},
		{
			ref: "CHG-4402",
			business: "Company 2",
			customer: "Order #ORD-8901",
			service: "Order",
			charged: "2.0% = KES 248",
			paymoFee: "KES 248",
			profit: "KES 0",
			status: "Break-even",
			tone: "badgeW",
		},
		{
			ref: "CHG-4403",
			business: "Company 2",
			customer: "Order #ORD-8899",
			service: "Order",
			charged: "2.0% = KES 964",
			paymoFee: "KES 723",
			profit: "KES 241",
			status: "Collected",
			tone: "badgeS",
		},
		{
			ref: "CHG-4404",
			business: "Land Buyers LTD",
			customer: "Buyer • UK · PLT-088",
			service: "Diaspora installment",
			charged: "KES 1,250",
			paymoFee: "KES 28,125",
			profit: "KES 9,375",
			status: "Collected",
			tone: "badgeS",
		},
	],
	paymoCosts: [
		{ service: "M-Pesa collection", rate: "0.75% · min KES 5", paidMTD: "KES 412,300" },
		{ service: "Bank transfer payout", rate: "KES 25 flat", paidMTD: "KES 61,200" },
		{ service: "International transfer", rate: "1.5% + KES 150", paidMTD: "KES 98,400" },
		{ service: "Card settlement (USD)", rate: "2.2% + FX 1.2%", paidMTD: "KES 176,800" },
		{ service: "FX conversion", rate: "0.9%", paidMTD: "KES 86,400" },
		{ service: "Refund (reverse)", rate: "KES 10", paidMTD: "KES 3,400" },
	],
	profitPot: {
		balance: "KES 1,342,000",
		pending: "KES 84,500",
		deliveredMTD: "KES 968,000",
	},
	channelRules: [
		{
			title: "Micro-profit instant delivery",
			sub: "Any profit ≥ KES 2 → Business Wallet instantly",
			badge: { text: "Active", tone: "badgeS" },
			modal: "channelRuleModal",
		},
		{
			title: "Weekly bulk → Virtual Wallet",
			sub: "Friday 18:00 sweep of balances < KES 5K",
			badge: { text: "Active", tone: "badgeS" },
			modal: "channelRuleModal",
		},
		{
			title: "External M-Pesa top-up",
			sub: "Auto-send KES 10K to 0712…890 when pot ≥ KES 25K",
			badge: { text: "Paused", tone: "badgeW" },
			modal: "partnerPayoutModal",
		},
	],
	deliveries: [
		{
			time: "14:32",
			source: "CHG-4401 · Land Buyers",
			profit: "KES 18,750",
			channel: "Business Wallet",
			status: "Delivered",
			tone: "badgeS",
		},
		{
			time: "14:28",
			source: "CHG-4403 · Company 2",
			profit: "KES 241",
			channel: "Business Wallet",
			status: "Delivered",
			tone: "badgeS",
		},
		{
			time: "13:10",
			source: "FX conversions",
			profit: "KES 24,800",
			channel: "Business Wallet",
			status: "Delivered",
			tone: "badgeS",
		},
	],
	costBars: [
		{ height: "65%", color: "var(--pm-primary-light)", label: "Jan" },
		{ height: "72%", color: "var(--pm-primary-light)", label: "Feb" },
		{ height: "58%", color: "var(--pm-primary-light)", label: "Mar" },
		{ height: "81%", color: "var(--pm-warning)", label: "Apr" },
		{ height: "67%", color: "var(--pm-primary-light)", label: "May" },
		{ height: "49%", color: "var(--pm-accent)", label: "Jun" },
	],
	keyMetrics: [
		{ label: "Blended Cost", value: "1.42%", color: "var(--pm-warning)" },
		{ label: "Profit Share", value: "58%", color: "var(--pm-accent)" },
		{ label: "Profit Delivered", value: "72%", color: "var(--pm-info)" },
	],
	waivers: [
		{
			id: "WV-101",
			name: "0% fee promo — 5 new Land Buyers buyers",
			type: "Promotional",
			discount: "100% off",
			used: "3 / 5",
			actionLabel: "Edit",
		},
		{
			id: "WV-102",
			name: "Hardship waiver — Company 2 order #ORD-8899",
			type: "Hardship",
			discount: "Full charge waived",
			used: "1 / 1",
			actionLabel: "Edit",
		},
		{
			id: "WV-103",
			name: "Bulk discount — top diaspora buyer",
			type: "Bulk discount",
			discount: "20% off charge",
			used: "12 / 20",
			actionLabel: "Edit",
		},
	],
	compliance: [
		{ label: "CBK Fee Transparency", status: "Filed", tone: "badgeS" },
		{ label: "KRA Withholding Tax", status: "Due 01 Jul", tone: "badgeW" },
		{ label: "Consumer Protection Act", status: "Filed", tone: "badgeS" },
	],
	profitAccess: [
		{
			scope: "Channel profits to Business Wallet",
			desc: "Auto-deliver net profit to your KES Business Wallet",
			granted: true,
		},
		{
			scope: "Auto-deliver micro-profits (≥ KES 2)",
			desc: "Instant delivery on every charge, even KES 2",
			granted: true,
		},
		{
			scope: "Route profits to external M-Pesa",
			desc: "Deliver to 0712…890 on schedule",
			granted: false,
		},
		{
			scope: "Withdraw profit pot to linked bank",
			desc: "Equity Bank • 01-2345678-0",
			granted: false,
		},
	],
	activity: [
		{
			date: "27 Jun",
			world: "cust",
			ref: "CHG-4401",
			activity: "Land Buyers charge · installment PLT-091",
			amount: "KES 1,250",
			status: "Profit KES 18,750",
			tone: "badgeS",
		},
		{
			date: "26 Jun",
			world: "my",
			ref: "POT-9914",
			activity: "Profit delivered → Business Wallet",
			amount: "KES 84,500",
			status: "Delivered",
			tone: "badgeS",
		},
		{
			date: "25 Jun",
			world: "my",
			ref: "COST-221",
			activity: "PayMo fee debited · card settlements",
			amount: "KES 176,800",
			status: "Deducted",
			tone: "badgeW",
		},
		{
			date: "24 Jun",
			world: "cust",
			ref: "CHG-4403",
			activity: "Company 2 charge · order ORD-8899",
			amount: "KES 964",
			status: "Profit KES 241",
			tone: "badgeS",
		},
	],
};

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchFees(): Promise<FeesConfig> {
	const res = await fetch("/api/fees");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<FeesConfig>;
	return { ...initialMockData, ...json };
}

/* ---------- section header ---------- */
function SectionHead({
	icon,
	iconColor,
	title,
	sub,
	actions,
	onOpen,
}: {
	icon: string;
	iconColor: string;
	title: string;
	sub: string;
	actions: {
		label: string;
		icon?: string;
		modal: string;
		tone?: "btnPmP" | "btnPmD";
	}[];
	onOpen: (id: string) => void;
}) {
	return (
		<div
			className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
			style={{ gap: 8 }}
		>
			<div>
				<h3 className={styles.st}>
					<i className={`bi ${icon}`} style={{ color: iconColor }} />
					{title}
				</h3>
				<p className={styles.ss}>{sub}</p>
			</div>
			<div className="d-flex flex-wrap" style={{ gap: 8 }}>
				{actions.map((a) => (
					<button
						key={a.label}
						className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ""}`}
						onClick={() => onOpen(a.modal)}
					>
						{a.icon && <i className={`bi ${a.icon}`} />} {a.label}
					</button>
				))}
			</div>
		</div>
	);
}

export default function Fees() {
	const { data } = useQuery({
		queryKey: ["paymo-fees"],
		queryFn: fetchFees,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [world, setWorld] = useState<World>("charges");
	const [biz, setBiz] = useState<BizId>("all");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	const bizName = biz === "land" ? BIZ_NAMES.land : biz === "co2" ? BIZ_NAMES.co2 : "";
	const inScope = (b: string) => biz === "all" || b === bizName;
	const scopeTag = biz === "all" ? "All businesses" : bizName;

	const charges = config.charges.filter((c) => inScope(c.business));

	return (
		<div className={styles.feesPage}>
			<div className={styles.main}>
				{/* ======================= PAGE BAR ======================= */}
				<div className={styles.pageBar}>
					<div>
						<div className={styles.breadcrumb}>
							{config.breadcrumb.parents.map((p) => (
								<span key={p.label}>
									<Link to={p.to}>{p.label}</Link> /{" "}
								</span>
							))}
							<strong>{config.breadcrumb.current}</strong>
						</div>
						{/* <h2 className={styles.pageH2}>{config.pageTitle}</h2>
						<p className={styles.pageSub}>{config.pageSub}</p> */}
						<div className={styles.bizBar} style={{ marginTop: 10 }}>
							<span className={styles.bizLabel}>
								<i className="bi bi-arrow-left-right me-1" />
								Direction
							</span>
							<div className={styles.worldSwitch}>
								<button
									type="button"
									className={`${styles.worldBtn} ${world === "charges" ? styles.worldBtnActive : ""}`}
									onClick={() => setWorld("charges")}
								>
									<i className="bi bi-receipt me-1" /> Customer Charges
								</button>
								<button
									type="button"
									className={`${styles.worldBtn} ${world === "profit" ? styles.worldBtnActive : ""}`}
									onClick={() => setWorld("profit")}
								>
									<i className="bi bi-bank2 me-1" /> My Costs &amp; Profit
								</button>
							</div>
							{world === "charges" && (
								<div className={styles.bizBar}>
									<span className={styles.bizLabel}>Scope</span>
									<div className={styles.pills}>
										<button
											type="button"
											className={`${styles.pill} ${biz === "all" ? styles.pillActive : ""}`}
											onClick={() => setBiz("all")}
										>
											All
										</button>
										<button
											type="button"
											className={`${styles.pill} ${biz === "land" ? styles.pillActive : ""}`}
											onClick={() => setBiz("land")}
										>
											Land Buyers LTD <span className="ms-1">30</span>
										</button>
										<button
											type="button"
											className={`${styles.pill} ${biz === "co2" ? styles.pillActive : ""}`}
											onClick={() => setBiz("co2")}
										>
											Company 2 <span className="ms-1">209</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button className={styles.btnPm} onClick={() => openM("feeCalculatorModal")}>
							<i className="bi bi-calculator" /> Calculator
						</button>
						<button className={styles.btnPm} onClick={() => openM("potDetailModal")}>
							<i className="bi bi-cash-stack" /> Profit Pot
						</button>
						<button className={styles.btnPm} onClick={() => openM("profitAccessModal")}>
							<i className="bi bi-shield-check" /> Profit Access
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => openM("addFeeRuleModal")}
						>
							<i className="bi bi-plus-lg" /> New Fee Model
						</button>
						<button className={styles.btnPm} onClick={() => openM("profileModal")}>
							<i className="bi bi-person-circle me-1" /> JK
						</button>
					</div>
				</div>

				<div className={styles.content}>
					{/* ======================= CONNECTION BANNER ======================= */}
					<div className={styles.connBanner}>
						<div className={styles.connIcon}>
							<i className="bi bi-plug" />
						</div>
						<div style={{ flex: "1 1 260px" }}>
							<div className={styles.connTitle}>
								Paymo not connected yet
							</div>
							<div className={styles.connSub}>
								Link your API key to start charging customers and receiving
								your profit instantly. You're currently viewing preview data.
							</div>
						</div>
						<div className="d-flex align-items-center" style={{ gap: 10 }}>
							<button
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("feeNotifModal")}
							>
								<i className="bi bi-bell" /> Notifications
							</button>
							<span className={styles.connTag}>Sandbox preview</span>
						</div>
					</div>

					{/* ======================= HERO ======================= */}
					<div className="row g-3">
						<div className="col-lg-7">
							<div
								className={`${styles.card} ${styles.cardAccent}`}
								style={{ minHeight: 190 }}
							>
								<p
									style={{
										margin: 0,
										fontSize: 12,
										color: "rgba(255,255,255,.82)",
									}}
								>
									{config.hero.live} <span style={{ color: "#86efac" }}>●</span>
								</p>
								<div
									className={styles.sv}
									style={{ margin: "8px 0", color: "#fff", fontSize: 24 }}
								>
									{config.hero.value}
								</div>
								<p
									style={{
										margin: 0,
										fontSize: 12,
										color: "rgba(255,255,255,.82)",
									}}
								>
									{config.hero.detail}
								</p>
								<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
									{config.hero.buttons.map((b) => (
										<button
											key={b.label}
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
											onClick={() => openM(b.modal)}
										>
											{b.label}
										</button>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={styles.card} style={{ minHeight: 190 }}>
								<p className={styles.sl} style={{ color: "var(--pm-muted)" }}>
									PROFIT CHANNEL
								</p>
								<div className={styles.channelFlow}>
									<span className={styles.flowNode}>
										<i className="bi bi-people" /> Customer pays
									</span>
									<span className={styles.flowArrow}>
										<i className="bi bi-arrow-right" />
									</span>
									<span className={styles.flowNode}>
										<i className="bi bi-receipt" /> Your charge
									</span>
									<span className={styles.flowArrow}>
										<i className="bi bi-arrow-right" />
									</span>
									<span className={styles.flowNode}>
										<i className="bi bi-wallet2" /> PayMo fee
									</span>
									<span className={styles.flowArrow}>
										<i className="bi bi-arrow-right" />
									</span>
									<span className={styles.flowNode}>
										<i className="bi bi-lightning-charge" /> Profit →
										Wallet
									</span>
								</div>
								<div
									className={`${styles.summaryBox} mt-3`}
									style={{ fontSize: 12.5 }}
								>
									<div className="d-flex justify-content-between mb-2">
										<span>Customer pays (KES 50,000 order)</span>
										<strong>KES 51,000</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span>PayMo fee (deducted)</span>
										<strong style={{ color: "var(--pm-warning)" }}>
											− KES 723
										</strong>
									</div>
									<div className="d-flex justify-content-between">
										<span>Your profit → delivered instantly</span>
										<strong style={{ color: "var(--pm-accent)" }}>
											+ KES 277
										</strong>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= STATS ======================= */}
					<div className="row g-3 mt-1">
						{config.stats.map((card) => (
							<div className="col-lg-2 col-md-4 col-6" key={card.label}>
								<div className={styles.card} style={{ minHeight: 150 }}>
									<p className={styles.sl} style={{ color: card.labelColor }}>
										{card.label}
									</p>
									<div
										className={styles.sv}
										style={{ margin: "6px 0", fontSize: 18 }}
									>
										{card.value}
									</div>
									<span
										className={`${styles.badge} ${styles[card.badge.tone]}`}
									>
										<i className={`bi ${card.badge.icon}`} /> {card.badge.text}
									</span>
								</div>
							</div>
						))}
					</div>

					{/* ======================= ATTENTION / SUGGESTIONS / QUICK ACTIONS ======================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.st}>Attention Required</h3>
									<button
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("attentionFullModal")}
									>
										View all
									</button>
								</div>
								{config.attention.map((item) => (
									<div className={styles.sr} key={item.title}>
										<div className="d-flex align-items-center gap-3">
											<div
												className={styles.iconCircle}
												style={{
													background: item.iconBg,
													color: item.iconColor,
													fontSize: 12,
												}}
											>
												<i className={`bi ${item.icon}`} />
											</div>
											<div>
												<div className={styles.fwBold13}>{item.title}</div>
												<div className={styles.mutedSmall}>{item.sub}</div>
											</div>
										</div>
										<button
											className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ""}`}
											onClick={() => openM(item.modal)}
										>
											{item.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.st}>Smart Suggestions</h3>
									<span className={`${styles.badge} ${styles.badgeP}`}>
										<i className="bi bi-stars" /> AI
									</span>
								</div>
								{config.suggestions.map((item) => (
									<div className={styles.sr} key={item.title}>
										<div className="d-flex align-items-center gap-3">
											<div
												className={styles.iconCircle}
												style={{
													background: item.iconBg,
													color: item.iconColor,
													fontSize: 12,
												}}
											>
												<i className={`bi ${item.icon}`} />
											</div>
											<div>
												<div className={styles.fwBold13}>{item.title}</div>
												<div className={styles.mutedSmall}>{item.sub}</div>
											</div>
										</div>
										<button
											className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ""}`}
											onClick={() => openM(item.modal)}
										>
											{item.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="mb-3">
									<h3 className={styles.st}>Quick Actions</h3>
									<p className={styles.ss}>Frequent fee &amp; profit workflows</p>
								</div>
								<div className={styles.quickGrid}>
									{config.quickActions.map((qa) => (
										<button
											key={qa.label}
											className={styles.quickBtn}
											onClick={() => openM(qa.modal)}
										>
											<i
												className={`bi ${qa.icon} me-1`}
												style={{ color: qa.color }}
											/>{" "}
											{qa.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ============================================================
					    WORLD A — CUSTOMER CHARGES (your revenue)
					    ============================================================ */}
					{world === "charges" && (
						<>
							<div className={styles.card}>
								<SectionHead
									icon="bi-grid-3x3-gap"
									iconColor="var(--pm-info)"
									title="Fee Models & Business Pricing"
									sub="Pick the model that works for your business — flat, percentage, tiered, discounts or zero-fee."
									actions={[
										{
											label: "New Model",
											icon: "bi-plus-lg",
											modal: "addFeeRuleModal",
											tone: "btnPmP",
										},
										{
											label: "Add Tier",
											icon: "bi-layers",
											modal: "addCommissionTierModal",
										},
									]}
									onOpen={openM}
								/>
								<div className="row g-3 mb-3">
									{config.models.map((m) => (
										<div className="col-lg-2 col-md-4 col-6" key={m.name}>
											<div
												className={styles.modelCard}
												onClick={() => openM("feeModelDetailModal")}
											>
												<div className="d-flex justify-content-between align-items-start">
													<div className={styles.modelName}>{m.name}</div>
													<span className={`${styles.badge} ${styles[m.tone]}`}>
														{m.state}
													</span>
												</div>
												<div className={styles.modelExample}>{m.example}</div>
												{m.biz !== "—" && (
													<div className={styles.mutedSmall} style={{ marginTop: 6 }}>
														<i className="bi bi-briefcase me-1" />
														{m.biz}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Business</th>
												<th>Model</th>
												<th>Your Charge</th>
												<th>PayMo Fee</th>
												<th>Profit (MTD)</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{config.businesses
												.filter((b) => inScope(b.name))
												.map((b) => (
													<tr key={b.id}>
														<td>
															<strong>{b.name}</strong>
														</td>
														<td>
															<span className={`${styles.badge} ${styles.badgeI}`}>
																{b.model}
															</span>
														</td>
														<td>{b.charge}</td>
														<td>{b.paymoFee}</td>
														<td>
															<strong>{b.profit}</strong>
														</td>
														<td>
															<span className={`${styles.badge} ${styles.badgeS}`}>
																{b.status}
															</span>
														</td>
														<td>
															<div className="d-flex" style={{ gap: 4 }}>
																<button
																	className={`${styles.btnPm} ${styles.btnSm}`}
																	onClick={() => openM("editFeeRuleModal")}
																>
																	Edit
																</button>
																<button
																	className={`${styles.btnPm} ${styles.btnSm}`}
																	onClick={() => openM("feeCompareModal")}
																>
																	Compare
																</button>
															</div>
														</td>
													</tr>
												))}
										</tbody>
									</table>
								</div>
							</div>

							<div className={styles.card}>
								<SectionHead
									icon="bi-receipt"
									iconColor="var(--pm-primary)"
									title="Customer Charges Ledger"
									sub={`${scopeTag} — what you bill vs what PayMo keeps vs what you profit.`}
									actions={[
										{
											label: "Charge a Customer",
											icon: "bi-receipt",
											modal: "chargeCustomerModal",
											tone: "btnPmP",
										},
										{
											label: "Bulk Upload",
											icon: "bi-upload",
											modal: "bulkUploadModal",
										},
									]}
									onOpen={openM}
								/>
								<div className={styles.chargePreview} style={{ marginBottom: 14 }}>
									<i className="bi bi-lightbulb me-1" />
									<strong>How it works:</strong> Charge a customer KES 50,000
									→ you bill 2.0% = KES 1,000 → PayMo takes KES 723 →{" "}
									<strong>you keep KES 277, delivered instantly</strong>.
								</div>
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Ref</th>
												<th>Business</th>
												<th>Customer</th>
												<th>Service</th>
												<th>You Charged</th>
												<th>PayMo Fee</th>
												<th>Your Profit</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{charges.map((c) => (
												<tr key={c.ref}>
													<td>
														<strong>{c.ref}</strong>
													</td>
													<td>{c.business}</td>
													<td>{c.customer}</td>
													<td>{c.service}</td>
													<td>{c.charged}</td>
													<td>{c.paymoFee}</td>
													<td>
														<strong style={{ color: "var(--pm-accent)" }}>
															{c.profit}
														</strong>
													</td>
													<td>
														<span className={`${styles.badge} ${styles[c.tone]}`}>
															{c.status}
														</span>
													</td>
													<td>
														<div className="d-flex" style={{ gap: 4 }}>
															<button
																className={`${styles.btnPm} ${styles.btnSm}`}
																onClick={() => openM("chargeCustomerModal")}
															>
																Receipt
															</button>
															<button
																className={`${styles.btnPm} ${styles.btnSm}`}
																onClick={() => openM("waiverModal")}
															>
																Waive
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</>
					)}

					{/* ============================================================
					    WORLD B — MY COSTS & PROFIT (Direction 1 + Pot)
					    ============================================================ */}
					{world === "profit" && (
						<>
							<div className="row g-3">
								<div className="col-lg-4">
									<div className={styles.potCard}>
										<p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
											<i className="bi bi-cash-stack me-1" /> PROFIT POT
										</p>
										<div className={styles.potValue}>{config.profitPot.balance}</div>
										<div className={styles.potRow}>
											<span>Pending (this batch)</span>
											<strong>{config.profitPot.pending}</strong>
										</div>
										<div className={styles.potRow}>
											<span>Delivered MTD</span>
											<strong>{config.profitPot.deliveredMTD}</strong>
										</div>
								<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
									<button
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
										onClick={() => openM("settlementModal")}
									>
										<i className="bi bi-send" /> Deliver Now
									</button>
									<button
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
										onClick={() => openM("potDetailModal")}
									>
										<i className="bi bi-eye" /> Detail
									</button>
									<button
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
										onClick={() => openM("finalConfirmModal")}
									>
										<i className="bi bi-check2-square" /> Approve Batch
									</button>
								</div>
									</div>
								</div>
								<div className="col-lg-8">
									<div className={styles.card} style={{ height: "100%" }}>
										<div className="d-flex justify-content-between align-items-center mb-2">
											<h3 className={styles.st}>Channel Rules</h3>
											<button
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("channelRuleModal")}
											>
												<i className="bi bi-plus-lg me-1" /> New Rule
											</button>
										</div>
										{config.channelRules.map((r) => (
											<div className={styles.sr} key={r.title}>
												<div>
													<strong>{r.title}</strong>
													<div className={styles.mutedSmall}>{r.sub}</div>
												</div>
												<div className="d-flex align-items-center" style={{ gap: 8 }}>
													<span className={`${styles.badge} ${styles[r.badge.tone]}`}>
														{r.badge.text}
													</span>
													<button
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM(r.modal)}
													>
														Edit
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className={styles.card}>
								<SectionHead
									icon="bi-wallet2"
									iconColor="var(--pm-warning)"
									title="What PayMo Charges You"
									sub="Your per-service cost schedule — deducted from customer settlements."
									actions={[
										{
											label: "Fee Report",
											icon: "bi-download",
											modal: "feeReportModal",
										},
									]}
									onOpen={openM}
								/>
								<div className="row g-3">
									{config.paymoCosts.map((c) => (
										<div className="col-lg-4 col-md-6" key={c.service}>
											<div className={styles.costRow}>
												<span>
													<i className="bi bi-arrow-right-circle me-1" />
													{c.service}
												</span>
												<strong>{c.rate}</strong>
											</div>
											<div className={styles.mutedSmall} style={{ marginTop: 2 }}>
												Paid MTD: <strong>{c.paidMTD}</strong>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className={styles.card}>
								<SectionHead
									icon="bi-truck"
									iconColor="var(--pm-primary)"
									title="Profit Delivery History"
									sub="Every delivery — even KES 2 — recorded and traceable to the charge that earned it."
									actions={[
										{
											label: "Deliver Now",
											icon: "bi-send",
											modal: "settlementModal",
											tone: "btnPmP",
										},
									]}
									onOpen={openM}
								/>
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Time</th>
												<th>Source</th>
												<th>Profit</th>
												<th>Channel</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{config.deliveries.map((d) => (
												<tr key={`${d.time}-${d.source}`}>
													<td>{d.time}</td>
													<td>{d.source}</td>
													<td>
														<strong>{d.profit}</strong>
													</td>
													<td>
														<span className={styles.deliveryTag + " " + styles.deliveryOk}>
															<i className="bi bi-wallet2" /> {d.channel}
														</span>
													</td>
													<td>
														<span className={`${styles.badge} ${styles[d.tone]}`}>
															{d.status}
														</span>
													</td>
													<td>
														<button
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM("potDetailModal")}
														>
															Receipt
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</>
					)}

					{/* ============================================================
					    WORLD C — REPORTS, WAIVERS & COMPLIANCE (shared)
					    ============================================================ */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-bar-chart-line"
							iconColor="var(--pm-info)"
							title="Fee Analytics & Reports"
							sub="Monthly fee costs, profit share and delivery performance."
							actions={[
								{
									label: "Export",
									icon: "bi-download",
									modal: "feeReportModal",
								},
								{
									label: "Profit by Service",
									icon: "bi-trophy",
									modal: "agentLeaderboardModal",
								},
								{
									label: "Model Performance",
									icon: "bi-speedometer2",
									modal: "tierPerformanceModal",
								},
							]}
							onOpen={openM}
						/>
						<div className="row g-3">
							<div className="col-lg-5">
								<div className={styles.chartBars} style={{ height: 100 }}>
									{config.costBars.map((b) => (
										<div
											key={b.label}
											className={styles.chartBar}
											style={{ height: b.height, background: b.color }}
										>
											<span className={styles.barLabel}>{b.label}</span>
										</div>
									))}
								</div>
								<p className={styles.mutedSmall} style={{ marginTop: 8 }}>
									Monthly fees paid to PayMo (KES)
								</p>
							</div>
							<div className="col-lg-7">
								<div className="row g-3">
									{config.keyMetrics.map((m) => (
										<div className="col-md-4" key={m.label}>
											<div className={styles.summaryBox}>
												<div className={styles.mutedSmall}>{m.label}</div>
												<div
													style={{
														fontSize: 22,
														fontWeight: 700,
														color: m.color,
														fontFamily: "var(--pm-font-display)",
													}}
												>
													{m.value}
												</div>
											</div>
										</div>
									))}
								</div>
								<div className={`${styles.summaryBoxInfo} mt-3`} style={{ fontSize: 12.5 }}>
									<i className="bi bi-stars me-1" />
									Moving Company 2 to a tiered model adds ≈{" "}
									<strong>KES 46K/mo</strong> in recovered profit.
								</div>
							</div>
						</div>
					</div>

					<div className={styles.card}>
						<SectionHead
							icon="bi-tag"
							iconColor="var(--pm-warning)"
							title="Waivers, Discounts & Promos"
							sub="Waive a charge, run a 0% promo month, or give a bulk rebate to win customers."
							actions={[
								{ label: "New Waiver", icon: "bi-plus-lg", modal: "waiverModal" },
								{
									label: "New Promo",
									icon: "bi-megaphone",
									modal: "promoModal",
									tone: "btnPmP",
								},
								{ label: "Hardship", icon: "bi-heart", modal: "hardshipWaiverModal" },
								{ label: "Exemptions", icon: "bi-shield", modal: "exemptionModal" },
							]}
							onOpen={openM}
						/>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Ref</th>
										<th>Name</th>
										<th>Type</th>
										<th>Discount</th>
										<th>Used</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{config.waivers.map((w) => (
										<tr key={w.id}>
											<td>
												<strong>{w.id}</strong>
											</td>
											<td>{w.name}</td>
											<td>{w.type}</td>
											<td>{w.discount}</td>
											<td>{w.used}</td>
											<td>
												<button
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("editWaiverModal")}
												>
													{w.actionLabel}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className={styles.card}>
						<SectionHead
							icon="bi-shield-check"
							iconColor="var(--pm-purple)"
							title="Compliance, Audit & Profit Access"
							sub="Fee disclosure filings, audit trail of your charge edits, and what you may do with your profit."
							actions={[
								{
									label: "Compliance Check",
									icon: "bi-clipboard-check",
									modal: "complianceCheckModal",
								},
								{
									label: "Regulatory Report",
									icon: "bi-file-earmark-check",
									modal: "regulatoryReportModal",
								},
								{
									label: "Audit Log",
									icon: "bi-clock-history",
									modal: "auditDetailModal",
								},
								{
									label: "Policy Config",
									icon: "bi-file-earmark-text",
									modal: "policyConfigModal",
								},
							]}
							onOpen={openM}
						/>
						<div className="row g-3">
							<div className="col-lg-4">
								<h4 className={styles.ubTitle} style={{ marginBottom: 10 }}>
									Filings
								</h4>
								{config.compliance.map((c) => (
									<div className={styles.sr} key={c.label}>
										<strong>{c.label}</strong>
										<span className={`${styles.badge} ${styles[c.tone]}`}>
											{c.status}
										</span>
									</div>
								))}
							</div>
							<div className="col-lg-8">
								<h4 className={styles.ubTitle} style={{ marginBottom: 10 }}>
									Profit Permissions &amp; Access
								</h4>
								{config.profitAccess.map((p) => (
									<div className={styles.permItem} key={p.scope}>
										<div
											className={`${styles.permDot} ${p.granted ? styles.permOk : styles.permPending}`}
										/>
										<div style={{ flex: "1 1 auto" }}>
											<div className={styles.permTitle}>{p.scope}</div>
											<div className={styles.permSub}>{p.desc}</div>
										</div>
										{p.granted ? (
											<span className={`${styles.badge} ${styles.badgeS}`}>
												<i className="bi bi-check-lg" /> Granted
											</span>
										) : (
											<button
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("profitAccessModal")}
											>
												Request Access
											</button>
										)}
									</div>
								))}
							</div>
						</div>
					</div>

					{/* ======================= RECENT FEE ACTIVITY ======================= */}
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h3 className={styles.st}>
								<i
									className="bi bi-clock-history"
									style={{ color: "var(--pm-muted)" }}
								/>{" "}
								Recent Fee Activity
							</h3>
							<button
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("feeNotifModal")}
							>
								Notifications
							</button>
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Date</th>
										<th>World</th>
										<th>Ref</th>
										<th>Activity</th>
										<th>Amount</th>
										<th>Result</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{config.activity.map((a) => (
										<tr key={a.ref}>
											<td>{a.date}</td>
											<td>
												<span
													className={`${styles.worldTag} ${a.world === "cust" ? styles.worldTagCust : styles.worldTagMy}`}
												>
													<i
														className={`bi ${a.world === "cust" ? "bi-receipt" : "bi-bank2"}`}
													/>{" "}
													{a.world === "cust" ? "Customer Charge" : "My Profit"}
												</span>
											</td>
											<td>
												<strong>{a.ref}</strong>
											</td>
											<td>{a.activity}</td>
											<td>
												<strong>{a.amount}</strong>
											</td>
											<td>
												<span className={`${styles.badge} ${styles[a.tone]}`}>
													{a.status}
												</span>
											</td>
											<td>
												<button
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("potDetailModal")}
												>
													Receipt
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
				{/* content */}
			</div>
			{/* main */}

			{/* ======================= ALL MODALS ======================= */}
			<FeesModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
