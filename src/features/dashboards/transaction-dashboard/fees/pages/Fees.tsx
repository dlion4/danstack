import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import type {
	AttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import FeesModals from "../components/FeesModals";
import styles from "../styles/fees.module.css";

/* ============================================================================
   PayMo BaaS — Fees, Charges & Profit Channeling (facilitator edition)
   Two directions:
     Direction 1 — what PayMo charges you (your costs per service)
     Direction 2 — what you charge your customers (your fee models)
   Signature: Profit Pot auto-channels net profit to your wallets instantly.
   Rebuilt on the shared PayMo business-dashboard visual language.
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
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	hero: {
		live: string;
		value: string;
		detail: string;
		buttons: { label: string; modal: string }[];
	};
	stats: {
		key: string;
		label: string;
		value: string;
		badge: { icon: string; text: string; tone: BadgeTone };
		line: string;
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
	profitLeaders: {
		name: string;
		value: string;
		trend: string;
		tone: BadgeTone;
	}[];
	waivers: {
		id: string;
		name: string;
		type: string;
		discount: string;
		used: string;
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
	pageCode: "Transaction banking · Fees & profit",
	pageTitle: "Fees, Charges & Profit Channeling",
	pageSub:
		"What PayMo charges you, what you charge your customers, and where your profit lands — with every net shilling auto-delivered to your wallet.",
	hero: {
		live: "Profit engine is live",
		value: "KES 1.34M profit",
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
			key: "pot",
			label: "Profit in pot",
			value: "KES 1.34M",
			badge: {
				icon: "bi-lightning-charge",
				text: "auto-delivering · next KES 84,500",
				tone: "badgeS",
			},
			line: "2 active · 1 paused rule",
		},
		{
			key: "charges",
			label: "Your charges (MTD)",
			value: "KES 2.31M",
			badge: {
				icon: "bi-receipt",
				text: "avg 1.75% on customer money",
				tone: "badgeS",
			},
			line: "across 2 businesses",
		},
		{
			key: "paymo",
			label: "PayMo fees (MTD)",
			value: "KES 968K",
			badge: {
				icon: "bi-wallet2",
				text: "1.42% blended cost",
				tone: "badgeW",
			},
			line: "6 services billed",
		},
		{
			key: "net",
			label: "Net profit (MTD)",
			value: "KES 1.34M",
			badge: {
				icon: "bi-bank2",
				text: "delivered to Business Wallet",
				tone: "badgeS",
			},
			line: "58% profit share",
		},
		{
			key: "rules",
			label: "Delivery rules",
			value: "3",
			badge: {
				icon: "bi-arrow-left-right",
				text: "2 active · 1 paused",
				tone: "badgeP",
			},
			line: "instant + weekly + external",
		},
		{
			key: "rate",
			label: "Avg fee rate",
			value: "1.75%",
			badge: {
				icon: "bi-percent",
				text: "Land Buyers flat · Company 2 %",
				tone: "badgeS",
			},
			line: "2 models in use",
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
			color: "var(--pm-primary)",
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
		{
			service: "M-Pesa collection",
			rate: "0.75% · min KES 5",
			paidMTD: "KES 412,300",
		},
		{
			service: "Bank transfer payout",
			rate: "KES 25 flat",
			paidMTD: "KES 61,200",
		},
		{
			service: "International transfer",
			rate: "1.5% + KES 150",
			paidMTD: "KES 98,400",
		},
		{
			service: "Card settlement (USD)",
			rate: "2.2% + FX 1.2%",
			paidMTD: "KES 176,800",
		},
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
		{ height: "65%", color: "var(--pm-primary)", label: "Jan" },
		{ height: "72%", color: "var(--pm-primary)", label: "Feb" },
		{ height: "58%", color: "var(--pm-primary)", label: "Mar" },
		{ height: "81%", color: "var(--pm-warning)", label: "Apr" },
		{ height: "67%", color: "var(--pm-primary)", label: "May" },
		{ height: "49%", color: "var(--pm-accent)", label: "Jun" },
	],
	keyMetrics: [
		{ label: "Blended Cost", value: "1.42%", color: "var(--pm-warning)" },
		{ label: "Profit Share", value: "58%", color: "var(--pm-accent)" },
		{ label: "Profit Delivered", value: "72%", color: "var(--pm-info)" },
	],
	profitLeaders: [
		{
			name: "Installments (Land Buyers)",
			value: "KES 864K",
			trend: "Top",
			tone: "badgeS",
		},
		{
			name: "Orders (Company 2)",
			value: "KES 178K",
			trend: "Rising",
			tone: "badgeP",
		},
		{
			name: "International transfers",
			value: "KES 62K",
			trend: "Rising",
			tone: "badgeP",
		},
	],
	waivers: [
		{
			id: "WV-101",
			name: "0% fee promo — 5 new Land Buyers buyers",
			type: "Promotional",
			discount: "100% off",
			used: "3 / 5",
		},
		{
			id: "WV-102",
			name: "Hardship waiver — Company 2 order #ORD-8899",
			type: "Hardship",
			discount: "Full charge waived",
			used: "1 / 1",
		},
		{
			id: "WV-103",
			name: "Bulk discount — top diaspora buyer",
			type: "Bulk discount",
			discount: "20% off charge",
			used: "12 / 20",
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
	const res = await fetch("/api/fees", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<FeesConfig>;
	return { ...initialMockData, ...json };
}

/* ---------- numbered section heading (business-dashboard language) ---------- */
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
	action?: ReactNode;
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

export default function Fees() {
	const { data } = useQuery({
		queryKey: ["paymo-fees"],
		queryFn: fetchFees,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [world, setWorld] = useState<World>("charges");
	const [biz, setBiz] = useState<BizId>("all");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

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

	const bizName =
		biz === "land" ? BIZ_NAMES.land : biz === "co2" ? BIZ_NAMES.co2 : "";
	const scopeTag = biz === "all" ? "All businesses" : bizName;

	const charges = useMemo(
		() =>
			config.charges.filter(
				(c) =>
					biz === "all" ||
					c.business === (biz === "land" ? BIZ_NAMES.land : BIZ_NAMES.co2),
			),
		[config.charges, biz],
	);
	const businesses = useMemo(
		() =>
			config.businesses.filter(
				(b) =>
					biz === "all" ||
					b.name === (biz === "land" ? BIZ_NAMES.land : BIZ_NAMES.co2),
			),
		[config.businesses, biz],
	);

	const statIcon: Record<string, string> = {
		pot: "bi-lightning-charge",
		charges: "bi-receipt",
		paymo: "bi-wallet2",
		net: "bi-bank2",
		rules: "bi-arrow-left-right",
		rate: "bi-percent",
	};
	const statTone: Record<string, string> = {
		pot: styles.kpiIconGreen,
		charges: styles.kpiIconBlue,
		paymo: styles.kpiIconAmber,
		net: styles.kpiIconGreen,
		rules: styles.kpiIconPurple,
		rate: styles.kpiIconRed,
	};

	return (
		<div className={styles.feesPage}>
			<main className={styles.main}>
				<div className={styles.content}>
					{/* ======================= EXECUTIVE HERO ======================= */}
					<section className={styles.heroBanner} aria-labelledby="fees-title">
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-lightning-charge-fill" />{" "}
										{config.pageCode}
									</span>
									<span className={styles.heroLive}>
										<span className={styles.dotLive} /> {config.hero.live}
									</span>
								</div>
								<h1 id="fees-title">
									Every charge. Every cost. Your profit, delivered.
								</h1>
								<p>{config.pageSub}</p>
								<div className={styles.heroActions}>
									{config.hero.buttons.map((action, index) => (
										<button
											type="button"
											key={action.label}
											className={
												index === 2
													? styles.heroPrimaryBtn
													: styles.heroSecondaryBtn
											}
											onClick={() => openM(action.modal)}
										>
											<i
												className={`bi ${index === 0 ? "bi-calculator" : index === 1 ? "bi-cash-stack" : "bi-plus-lg"}`}
											/>
											{action.label}
										</button>
									))}
								</div>
							</div>
							<div className={styles.heroSnapshot}>
								<span>This month</span>
								<strong>{config.hero.value}</strong>
								<p>{config.hero.detail}</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>KES 18.4M</strong>
										<span>Collected</span>
									</div>
									<div>
										<strong>KES 2.31M</strong>
										<span>Your charges</span>
									</div>
									<div>
										<strong>KES 968K</strong>
										<span>PayMo fees</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* ======================= DIRECTION + SCOPE CONTROL ======================= */}
					<section
						className={styles.controlStrip}
						aria-label="Fee workspace controls"
					>
						<div className={styles.controlGroup}>
							<span className={styles.controlLabel}>
								<i className="bi bi-arrow-left-right" /> Direction
							</span>
							<fieldset className={styles.segmented}>
								<legend className={styles.srOnly}>Fee money direction</legend>
								<button
									type="button"
									className={world === "charges" ? styles.segmentActive : ""}
									onClick={() => setWorld("charges")}
								>
									<i className="bi bi-receipt" /> Customer Charges
								</button>
								<button
									type="button"
									className={world === "profit" ? styles.segmentActive : ""}
									onClick={() => setWorld("profit")}
								>
									<i className="bi bi-bank2" /> My Costs &amp; Profit
								</button>
							</fieldset>
						</div>
						{world === "charges" && (
							<div className={styles.controlGroup}>
								<span className={styles.controlLabel}>
									<i className="bi bi-briefcase" /> Scope
								</span>
								<fieldset className={styles.filterPills}>
									<legend className={styles.srOnly}>Business scope</legend>
									<button
										type="button"
										className={biz === "all" ? styles.filterActive : ""}
										onClick={() => setBiz("all")}
									>
										All
									</button>
									<button
										type="button"
										className={biz === "land" ? styles.filterActive : ""}
										onClick={() => setBiz("land")}
									>
										Land Buyers LTD <span className="ms-1">30</span>
									</button>
									<button
										type="button"
										className={biz === "co2" ? styles.filterActive : ""}
										onClick={() => setBiz("co2")}
									>
										Company 2 <span className="ms-1">209</span>
									</button>
								</fieldset>
							</div>
						)}
						<span className={styles.scopeNote}>
							<i className="bi bi-shield-check" /> {scopeTag} · sandbox preview
							data
						</span>
					</section>

					{/* ======================= 1.1 FEE PULSE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="pulse-heading"
					>
						<SectionHeading
							id="pulse-heading"
							index="1.1"
							title="Fee pulse"
							description="What you collect, what PayMo keeps, and what lands in your pot."
						/>
						<div className={styles.kpiGrid}>
							{config.stats.map((stat) => (
								<article
									key={stat.key}
									className={`${styles.card} ${styles.kpiCard} ${
										stat.key === "pot" ? styles.kpiFeatured : ""
									} ${stat.key === "paymo" ? styles.kpiWarning : ""}`}
								>
									<div
										className={`${styles.kpiIcon} ${statTone[stat.key] ?? styles.kpiIconGreen}`}
									>
										<i className={`bi ${statIcon[stat.key] ?? "bi-wallet2"}`} />
									</div>
									<div className={styles.kpiMeta}>
										<span>{stat.label}</span>
										<small>Live · MTD</small>
									</div>
									<strong className={styles.kpiValue}>{stat.value}</strong>
									<div className={styles.kpiFoot}>
										<span
											className={`${styles.badge} ${styles[stat.badge.tone]}`}
										>
											<i className={`bi ${stat.badge.icon}`} />{" "}
											{stat.badge.text}
										</span>
										<span>{stat.line}</span>
									</div>
								</article>
							))}
						</div>
					</section>

					{/* ======================= 1.2 ACTION CENTRE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="attention-heading"
					>
						<SectionHeading
							id="attention-heading"
							index="1.2"
							title="Action centre"
							description="Resolve exceptions first, then use guided suggestions to improve transfer outcomes."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => setDrawerOpen(true)}
								>
									<i className="bi bi-columns-gap" /> Review queue
								</button>
							}
						/>
						<article className={`${styles.card} ${styles.actionCentreCard}`}>
							<div className={styles.actionCentreIcon}>
								<i className="bi bi-exclamation-octagon" />
							</div>
							<div className={styles.actionCentreCopy}>
								<span className={styles.cardKicker}>Action centre</span>
								<h3>Attention, suggestions &amp; quick actions</h3>
								<p>
									Open operational items, AI routing recommendations and the
									actions treasury uses most — each opens the matching workflow.
								</p>
							</div>
							<div className={styles.actionCentreStats}>
								<div className={styles.actionCentreStat}>
									<strong>{config.attention.length}</strong>
									<span>Attention</span>
								</div>
								<div className={styles.actionCentreStat}>
									<strong>{config.suggestions.length}</strong>
									<span>Suggestions</span>
								</div>
								<div className={styles.actionCentreStat}>
									<strong>{config.quickActions.length}</strong>
									<span>Shortcuts</span>
								</div>
							</div>
							<div className={styles.actionCentreActions}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnPmP}`}
									onClick={() => setDrawerOpen(true)}
								>
									<i className="bi bi-columns-gap" /> Open drawer
								</button>
							</div>
						</article>
					</section>

					{/* ================================================================
					    WORLD A — CUSTOMER CHARGES (your revenue)
					    ================================================================ */}
					{world === "charges" && (
						<>
							<section
								className={styles.dashboardSection}
								aria-labelledby="models-heading"
							>
								<SectionHeading
									id="models-heading"
									index="1.3"
									title="Fee models & business pricing"
									description="Pick the model that works for each business — flat, percentage, tiered, discounts or zero-fee."
									action={
										<div className={styles.headerButtonRow}>
											<button
												type="button"
												className={styles.btnPm}
												onClick={() => openM("addCommissionTierModal")}
											>
												<i className="bi bi-layers" /> Add Tier
											</button>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnPmP}`}
												onClick={() => openM("addFeeRuleModal")}
											>
												<i className="bi bi-plus-lg" /> New Model
											</button>
										</div>
									}
								/>
								<div className={styles.modelGrid}>
									{config.models.map((model) => (
										<button
											type="button"
											key={model.name}
											className={styles.modelTile}
											onClick={() => openM("feeModelDetailModal")}
										>
											<div className={styles.modelTileTop}>
												<span className={styles.modelName}>{model.name}</span>
												<span
													className={`${styles.badge} ${styles[model.tone]}`}
												>
													{model.state}
												</span>
											</div>
											<span className={styles.modelExample}>
												{model.example}
											</span>
											{model.biz !== "—" && (
												<span className={styles.modelBiz}>
													<i className="bi bi-briefcase" /> {model.biz}
												</span>
											)}
										</button>
									))}
								</div>
								<article className={`${styles.card} ${styles.tableCard}`}>
									<div className={styles.tableToolbar}>
										<div className={styles.tableTitle}>
											<h3>Pricing by business</h3>
											<span>
												{scopeTag} — your charge vs the PayMo fee vs your
												profit.
											</span>
										</div>
										<div className={styles.tableTools}>
											<span className={`${styles.badge} ${styles.badgeI}`}>
												<i className="bi bi-graph-up" /> {businesses.length}{" "}
												active models
											</span>
										</div>
									</div>
									<div className={styles.tableScroll}>
										<table className={styles.tbl}>
											<thead>
												<tr>
													<th>Business</th>
													<th>Model</th>
													<th>Your Charge</th>
													<th>PayMo Fee</th>
													<th>Profit (MTD)</th>
													<th>Status</th>
													<th>
														<span className={styles.srOnly}>Action</span>
													</th>
												</tr>
											</thead>
											<tbody>
												{businesses.map((b) => (
													<tr key={b.id}>
														<td>
															<div className={styles.beneficiaryCell}>
																<span>
																	{b.name
																		.split(" ")
																		.map((part) => part[0])
																		.join("")
																		.slice(0, 2)}
																</span>
																<strong>{b.name}</strong>
															</div>
														</td>
														<td>
															<span
																className={`${styles.badge} ${styles.badgeI}`}
															>
																{b.model}
															</span>
														</td>
														<td>{b.charge}</td>
														<td>{b.paymoFee}</td>
														<td>
															<strong>{b.profit}</strong>
														</td>
														<td>
															<span
																className={`${styles.badge} ${styles.badgeS}`}
															>
																{b.status}
															</span>
														</td>
														<td>
															<div className="d-flex" style={{ gap: 4 }}>
																<button
																	type="button"
																	className={`${styles.btnPm} ${styles.btnSm}`}
																	onClick={() => openM("editFeeRuleModal")}
																>
																	Edit
																</button>
																<button
																	type="button"
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
								</article>
							</section>

							<section
								className={styles.dashboardSection}
								aria-labelledby="ledger-heading"
							>
								<SectionHeading
									id="ledger-heading"
									index="1.4"
									title="Customer charges ledger"
									description={`${scopeTag} — what you bill vs what PayMo keeps vs what you profit.`}
									action={
										<div className={styles.headerButtonRow}>
											<button
												type="button"
												className={styles.btnPm}
												onClick={() => openM("bulkUploadModal")}
											>
												<i className="bi bi-upload" /> Bulk Upload
											</button>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnPmP}`}
												onClick={() => openM("chargeCustomerModal")}
											>
												<i className="bi bi-receipt" /> Charge a Customer
											</button>
										</div>
									}
								/>
								<article className={`${styles.card} ${styles.tableCard}`}>
									<div className={styles.chargePreview}>
										<i className="bi bi-lightbulb" />
										<span>
											<strong>How it works:</strong> Charge a customer KES
											50,000 → you bill 2.0% = KES 1,000 → PayMo takes KES 723 →{" "}
											<strong>you keep KES 277, delivered instantly</strong>.
										</span>
									</div>
									<div className={styles.tableScroll} style={{ marginTop: 14 }}>
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
													<th>
														<span className={styles.srOnly}>Action</span>
													</th>
												</tr>
											</thead>
											<tbody>
												{charges.map((c) => (
													<tr key={c.ref}>
														<td>
															<code>{c.ref}</code>
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
															<span
																className={`${styles.badge} ${styles[c.tone]}`}
															>
																{c.status}
															</span>
														</td>
														<td>
															<div className="d-flex" style={{ gap: 4 }}>
																<button
																	type="button"
																	className={styles.iconButton}
																	aria-label={`Receipt for ${c.ref}`}
																	onClick={() => openM("chargeCustomerModal")}
																>
																	<i className="bi bi-receipt" />
																</button>
																<button
																	type="button"
																	className={styles.iconButton}
																	aria-label={`Waive charge ${c.ref}`}
																	onClick={() => openM("waiverModal")}
																>
																	<i className="bi bi-tag" />
																</button>
															</div>
														</td>
													</tr>
												))}
												{charges.length === 0 && (
													<tr>
														<td colSpan={9}>
															<div className={styles.emptyState}>
																<i className="bi bi-inbox" />
																<strong>No charges found</strong>
																<span>Try a different business scope.</span>
															</div>
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
									<div className={styles.tableFooter}>
										<span>
											Showing {charges.length} of {config.charges.length}{" "}
											charges · {scopeTag}
										</span>
										<button
											type="button"
											onClick={() => openM("feeReportModal")}
										>
											Full fee report <i className="bi bi-arrow-right" />
										</button>
									</div>
								</article>
							</section>
						</>
					)}

					{/* ================================================================
					    WORLD B — MY COSTS & PROFIT (Direction 1 + Pot)
					    ================================================================ */}
					{world === "profit" && (
						<>
							<section
								className={styles.dashboardSection}
								aria-labelledby="pot-heading"
							>
								<SectionHeading
									id="pot-heading"
									index="1.3"
									title="Profit pot & channeling"
									description="Every net shilling accumulates here, then auto-delivers to your wallets on your rules."
									action={
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnPmP}`}
											onClick={() => openM("channelRuleModal")}
										>
											<i className="bi bi-plus-lg" /> New Rule
										</button>
									}
								/>
								<div className={styles.potGrid}>
									<article className={styles.potCard}>
										<span className={styles.potKicker}>
											<i className="bi bi-cash-stack" /> Profit pot
										</span>
										<div className={styles.potValue}>
											{config.profitPot.balance}
										</div>
										<div className={styles.potRow}>
											<span>Pending (this batch)</span>
											<strong>{config.profitPot.pending}</strong>
										</div>
										<div className={styles.potRow}>
											<span>Delivered MTD</span>
											<strong>{config.profitPot.deliveredMTD}</strong>
										</div>
										<div className={styles.potActions}>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
												onClick={() => openM("settlementModal")}
											>
												<i className="bi bi-send" /> Deliver Now
											</button>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
												onClick={() => openM("potDetailModal")}
											>
												<i className="bi bi-eye" /> Detail
											</button>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
												onClick={() => openM("finalConfirmModal")}
											>
												<i className="bi bi-check2-square" /> Approve Batch
											</button>
										</div>
									</article>
									<article className={`${styles.card}`}>
										<div className={styles.cardHeader}>
											<div>
												<span className={styles.cardKicker}>Automation</span>
												<h3>Channel rules</h3>
											</div>
											<span className={`${styles.badge} ${styles.badgeS}`}>
												<i className="bi bi-arrow-repeat" /> 2 active
											</span>
										</div>
										<div className={styles.channelList}>
											{config.channelRules.map((rule) => (
												<div key={rule.title} className={styles.channelRow}>
													<div className={styles.channelRowMain}>
														<div>
															<strong>{rule.title}</strong>
															<span>{rule.sub}</span>
														</div>
													</div>
													<div className={styles.channelRowActions}>
														<span
															className={`${styles.badge} ${styles[rule.badge.tone]}`}
														>
															{rule.badge.text}
														</span>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM(rule.modal)}
														>
															Edit
														</button>
													</div>
												</div>
											))}
										</div>
										<div className={styles.channelInsight}>
											<i className="bi bi-lightning-charge" />
											<div>
												<strong>Instant micro-profit delivery</strong>
												<span>
													Even KES 2 of profit lands the moment it is earned.
												</span>
											</div>
										</div>
									</article>
								</div>
							</section>

							<section
								className={styles.dashboardSection}
								aria-labelledby="costs-heading"
							>
								<SectionHeading
									id="costs-heading"
									index="1.4"
									title="What PayMo charges you"
									description="Your per-service cost schedule — deducted from customer settlements before profit is delivered."
									action={
										<button
											type="button"
											className={styles.btnPm}
											onClick={() => openM("feeReportModal")}
										>
											<i className="bi bi-download" /> Fee Report
										</button>
									}
								/>
								<div className={styles.costGrid}>
									{config.paymoCosts.map((cost) => (
										<div className={styles.costRow} key={cost.service}>
											<div className={styles.costRowTop}>
												<span className={styles.costName}>
													<i className="bi bi-arrow-right-circle" />{" "}
													{cost.service}
												</span>
												<span className={styles.costRate}>{cost.rate}</span>
											</div>
											<div className={styles.costPaid}>
												Paid MTD: <strong>{cost.paidMTD}</strong>
											</div>
										</div>
									))}
								</div>
								<article className={`${styles.card} ${styles.tableCard}`}>
									<div className={styles.tableToolbar}>
										<div className={styles.tableTitle}>
											<h3>Delivery history</h3>
											<span>
												Every delivery — even KES 2 — traced to its charge.
											</span>
										</div>
										<div className={styles.tableTools}>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
												onClick={() => openM("settlementModal")}
											>
												<i className="bi bi-send" /> Deliver Now
											</button>
										</div>
									</div>
									<div className={styles.tableScroll}>
										<table className={styles.tbl}>
											<thead>
												<tr>
													<th>Time</th>
													<th>Source</th>
													<th>Profit</th>
													<th>Channel</th>
													<th>Status</th>
													<th>
														<span className={styles.srOnly}>Action</span>
													</th>
												</tr>
											</thead>
											<tbody>
												{config.deliveries.map((delivery) => (
													<tr key={`${delivery.time}-${delivery.source}`}>
														<td>{delivery.time}</td>
														<td>{delivery.source}</td>
														<td>
															<strong>{delivery.profit}</strong>
														</td>
														<td>
															<span
																className={`${styles.deliveryTag} ${styles.deliveryOk}`}
															>
																<i className="bi bi-wallet2" />{" "}
																{delivery.channel}
															</span>
														</td>
														<td>
															<span
																className={`${styles.badge} ${styles[delivery.tone]}`}
															>
																{delivery.status}
															</span>
														</td>
														<td>
															<button
																type="button"
																className={styles.iconButton}
																aria-label={`Receipt for ${delivery.source}`}
																onClick={() => openM("potDetailModal")}
															>
																<i className="bi bi-receipt" />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</article>
							</section>
						</>
					)}

					{/* ======================= 1.5 FEE ANALYTICS & REPORTS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-heading"
					>
						<SectionHeading
							id="analytics-heading"
							index="1.5"
							title="Fee analytics & reports"
							description="Monthly fee costs, profit share and delivery performance."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("tierPerformanceModal")}
									>
										<i className="bi bi-speedometer2" /> Model Performance
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("agentLeaderboardModal")}
									>
										<i className="bi bi-trophy" /> Profit by Service
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("feeReportModal")}
									>
										<i className="bi bi-download" /> Export
									</button>
								</div>
							}
						/>
						<div className={styles.analyticsGrid}>
							<article className={`${styles.card} ${styles.analyticsCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Cost trend</span>
										<h3>Six-month fees paid to PayMo</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										<i className="bi bi-arrow-down" /> −8.2%
									</span>
								</div>
								<div className={styles.chartBars}>
									{config.costBars.map((bar) => (
										<div key={bar.label} className={styles.chartBar}>
											<i
												style={{ height: bar.height, background: bar.color }}
											/>
											<span className={styles.barLabel}>{bar.label}</span>
										</div>
									))}
								</div>
							</article>
							<article className={`${styles.card} ${styles.analyticsCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Efficiency</span>
										<h3>Key metrics</h3>
									</div>
								</div>
								<div className={styles.rankedList}>
									{config.keyMetrics.map((metric) => (
										<div key={metric.label} className={styles.metricBox}>
											<div className={styles.metricLabel}>{metric.label}</div>
											<div
												className={styles.metricValue}
												style={{ color: metric.color }}
											>
												{metric.value}
											</div>
										</div>
									))}
								</div>
								<div className={styles.analyticsNote}>
									<i className="bi bi-stars" />
									<span>
										Moving Company 2 to a tiered model recovers ≈{" "}
										<strong>KES 46K/mo</strong>.
									</span>
								</div>
							</article>
							<article className={`${styles.card} ${styles.analyticsCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Profit leaders</span>
										<h3>Top services</h3>
									</div>
								</div>
								<div className={styles.rankedList}>
									{config.profitLeaders.map((leader, index) => (
										<div key={leader.name} className={styles.metricBox}>
											<div className={styles.metricLabel}>
												{index + 1}. {leader.name}
											</div>
											<div className={styles.metricValue}>{leader.value}</div>
											<span
												className={`${styles.badge} ${styles[leader.tone]}`}
											>
												{leader.trend}
											</span>
										</div>
									))}
								</div>
							</article>
						</div>
					</section>

					{/* ======================= 1.6 WAIVERS, DISCOUNTS & PROMOS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="waivers-heading"
					>
						<SectionHeading
							id="waivers-heading"
							index="1.6"
							title="Waivers, discounts & promos"
							description="Waive a charge, run a 0% promo month, or give a bulk rebate to win customers."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("exemptionModal")}
									>
										<i className="bi bi-shield" /> Exemptions
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("hardshipWaiverModal")}
									>
										<i className="bi bi-heart" /> Hardship
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("waiverModal")}
									>
										<i className="bi bi-plus-lg" /> New Waiver
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("promoModal")}
									>
										<i className="bi bi-megaphone" /> New Promo
									</button>
								</div>
							}
						/>
						<article className={`${styles.card} ${styles.tableCard}`}>
							<div className={styles.tableScroll}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Ref</th>
											<th>Name</th>
											<th>Type</th>
											<th>Discount</th>
											<th>Used</th>
											<th>
												<span className={styles.srOnly}>Action</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{config.waivers.map((waiver) => (
											<tr key={waiver.id}>
												<td>
													<code>{waiver.id}</code>
												</td>
												<td>{waiver.name}</td>
												<td>
													<span className={`${styles.badge} ${styles.badgeI}`}>
														{waiver.type}
													</span>
												</td>
												<td>{waiver.discount}</td>
												<td>{waiver.used}</td>
												<td>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("editWaiverModal")}
													>
														Edit
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</article>
					</section>

					{/* ======================= 1.7 COMPLIANCE, AUDIT & PROFIT ACCESS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="compliance-heading"
					>
						<SectionHeading
							id="compliance-heading"
							index="1.7"
							title="Compliance, audit & profit access"
							description="Fee disclosure filings, an audit trail of your charge edits, and what you may do with your profit."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("policyConfigModal")}
									>
										<i className="bi bi-file-earmark-text" /> Policy Config
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("auditDetailModal")}
									>
										<i className="bi bi-clock-history" /> Audit Log
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("regulatoryReportModal")}
									>
										<i className="bi bi-file-earmark-check" /> Regulatory Report
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("complianceCheckModal")}
									>
										<i className="bi bi-clipboard-check" /> Compliance Check
									</button>
								</div>
							}
						/>
						<div className={styles.complianceGrid}>
							<article className={`${styles.card} ${styles.listCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Filings</span>
										<h3>Compliance status</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										<i className="bi bi-check-lg" /> On track
									</span>
								</div>
								<div className={styles.listBody}>
									{config.compliance.map((item) => (
										<div key={item.label} className={styles.actionRow}>
											<div className={styles.actionRowMain}>
												<div>
													<strong>{item.label}</strong>
													<span>Regulatory fee disclosure</span>
												</div>
											</div>
											<span className={`${styles.badge} ${styles[item.tone]}`}>
												{item.status}
											</span>
										</div>
									))}
								</div>
							</article>
							<article className={`${styles.card}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Permissions</span>
										<h3>Profit permissions &amp; access</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openM("profitAccessModal")}
									>
										Manage <i className="bi bi-arrow-right" />
									</button>
								</div>
								<div style={{ paddingTop: "0.4rem" }}>
									{config.profitAccess.map((permission) => (
										<div className={styles.permItem} key={permission.scope}>
											<span
												className={`${styles.permDot} ${
													permission.granted
														? styles.permOk
														: styles.permPending
												}`}
											/>
											<div className={styles.permCopy}>
												<div className={styles.permTitle}>
													{permission.scope}
												</div>
												<div className={styles.permSub}>{permission.desc}</div>
											</div>
											{permission.granted ? (
												<span className={`${styles.badge} ${styles.badgeS}`}>
													<i className="bi bi-check-lg" /> Granted
												</span>
											) : (
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("profitAccessModal")}
												>
													Request Access
												</button>
											)}
										</div>
									))}
								</div>
							</article>
						</div>
					</section>

					{/* ======================= 1.8 RECENT FEE ACTIVITY ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="activity-heading"
					>
						<SectionHeading
							id="activity-heading"
							index="1.8"
							title="Recent fee activity"
							description="Customer charges and profit deliveries — every movement, traceable."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openM("feeNotifModal")}
								>
									<i className="bi bi-bell" /> Notifications
								</button>
							}
						/>
						<article className={`${styles.card} ${styles.tableCard}`}>
							<div className={styles.tableScroll}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Date</th>
											<th>World</th>
											<th>Ref</th>
											<th>Activity</th>
											<th>Amount</th>
											<th>Result</th>
											<th>
												<span className={styles.srOnly}>Action</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{config.activity.map((entry) => (
											<tr key={entry.ref}>
												<td>{entry.date}</td>
												<td>
													<span
														className={`${styles.worldTag} ${
															entry.world === "cust"
																? styles.worldTagCust
																: styles.worldTagMy
														}`}
													>
														<i
															className={`bi ${
																entry.world === "cust"
																	? "bi-receipt"
																	: "bi-bank2"
															}`}
														/>{" "}
														{entry.world === "cust"
															? "Customer Charge"
															: "My Profit"}
													</span>
												</td>
												<td>
													<code>{entry.ref}</code>
												</td>
												<td>{entry.activity}</td>
												<td>
													<strong>{entry.amount}</strong>
												</td>
												<td>
													<span
														className={`${styles.badge} ${styles[entry.tone]}`}
													>
														{entry.status}
													</span>
												</td>
												<td>
													<button
														type="button"
														className={styles.iconButton}
														aria-label={`Receipt for ${entry.ref}`}
														onClick={() => openM("potDetailModal")}
													>
														<i className="bi bi-receipt" />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</article>
					</section>
				</div>

				{/* ======================= FLOATING COMMAND BAR ======================= */}
				<nav className={styles.floatingBar} aria-label="Quick fee actions">
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openM("addFeeRuleModal")}
					>
						<i className="bi bi-plus-circle" /> New model
					</button>
					<button type="button" onClick={() => openM("feeCalculatorModal")}>
						<i className="bi bi-calculator" /> Calculator
					</button>
					<button type="button" onClick={() => openM("chargeCustomerModal")}>
						<i className="bi bi-receipt" /> Charge
					</button>
					<button type="button" onClick={() => openM("potDetailModal")}>
						<i className="bi bi-cash-stack" /> Profit pot
					</button>
				</nav>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-check" /> Protected by PayMo secure
						transaction controls
					</span>
					<nav aria-label="Footer links">
						<Link to="/pm/app/support">Support</Link>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v2.4.0</span>
					</nav>
				</footer>
			</main>

			{/* ======================= ALL MODALS ======================= */}
			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Fees"
				pageIcon="bi-percent"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<FeesModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
