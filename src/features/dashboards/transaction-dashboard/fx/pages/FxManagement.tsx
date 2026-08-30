import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import FxModals from "../components/FxModals";
import styles from "../styles/fx.module.css";

/* ============================================================================
   PayMo BaaS — Multi-Currency, Wallets & FX (facilitator edition)
   Three worlds:
     World A — Customer FX & Collections  (diaspora / card settlements → KES → floats)
     World B — My Multi-Currency Wallets  (wallet structure + your own conversions)
     World C — Rates, Locks, Rules & Permissions
   Refined: rebuilt on the PayMo business-dashboard composition (hero banner,
   numbered sections, KPI pulse, action centre, quick actions, table cards,
   floating command bar). Shell chrome is owned by AppShell; this page renders
   content only. All 25 modals remain reachable from the page.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
type BizId = "all" | "land" | "co2";
type World = "cust" | "my";

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

interface SubWallet {
	ccy: string;
	balance: string;
	kes: string;
	change: string;
	source: string;
	status: string;
	tone: BadgeTone;
}

interface DiasporaRow {
	ref: string;
	business: string;
	payer: string;
	from: string;
	kes: string;
	rate: string;
	status: string;
	tone: BadgeTone;
	actionLabel: string;
	actionModal: string;
}

interface FxConfig {
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
		lines?: { text: string; strong?: string; strongColor?: string }[];
		progress?: { label: string; value: string; width: string; color: string };
	}[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	walletTree: {
		name: string;
		value: string;
		meta: string;
		icon: string;
	}[];
	diaspora: DiasporaRow[];
	conversions: {
		ref: string;
		business: string;
		from: string;
		to: string;
		rate: string;
		fee: string;
		status: string;
		tone: BadgeTone;
		dest: string;
		destTone: "float" | "wallet";
	}[];
	businesses: {
		id: "land" | "co2";
		name: string;
		customers: number;
		role: string;
		convLimit: string;
		source: string;
		floatVal: string;
		floatMin: string;
	}[];
	subWallets: SubWallet[];
	crossBorder: {
		ref: string;
		detail: string;
		status: string;
		tone: BadgeTone;
		actionLabel: string;
		actionModal: string;
	}[];
	liveRates: {
		pair: string;
		buy: string;
		sell: string;
		spread: string;
		change: string;
	}[];
	rateAlerts: {
		title: string;
		sub: string;
		badge: { text: string; tone: BadgeTone };
	}[];
	rateLocks: {
		title: string;
		sub: string;
		badge: { text: string; tone: BadgeTone };
	}[];
	lockStrip: { text: string; strong: string; btnLabel: string; modal: string };
	costBars: { height: string; color: string; label: string }[];
	keyMetrics: { label: string; value: string; color: string }[];
	autoRules: {
		title: string;
		sub: string;
		badge: { text: string; tone: BadgeTone };
	}[];
	alertSettings: { title: string; badge: { text: string; tone: BadgeTone } }[];
	walletPrefs: {
		title: string;
		value?: string;
		badge?: { text: string; tone: BadgeTone };
	}[];
	fxAccess: { scope: string; desc: string; granted: boolean }[];
	activity: {
		date: string;
		world: "cust" | "my";
		ref: string;
		activity: string;
		amount: string;
		rate: string;
		fee: string;
		status: string;
		tone: BadgeTone;
	}[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: FxConfig = {
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/" },
			{ label: "BaaS Transactions", to: "/pm/app" },
		],
		current: "Multi-Currency, Wallets & FX",
	},
	pageTitle: "Multi-Currency, Wallets & FX",
	pageSub:
		"Convert customer payments and your own funds across currencies to keep settlements flowing.",
	hero: {
		live: "FX & wallet command center is live",
		value: "KES 11.85M in foreign currency",
		detail:
			"≈ $48.2K USD + €18.4K EUR + £9.1K GBP + R214K ZAR across 4 sub-wallets — diaspora & card settlements.",
		buttons: [
			{ label: "Convert", modal: "convertModal" },
			{ label: "Rate Lock", modal: "hedgeModal" },
			{ label: "New Wallet", modal: "newWalletModal" },
		],
	},
	stats: [
		{
			label: "FOREIGN CURRENCY HELD",
			labelColor: "var(--pm-info)",
			value: "KES 11.85M",
			badge: {
				icon: "bi-currency-dollar",
				text: "4 sub-wallets · USD/EUR/GBP/ZAR",
				tone: "badgeS",
			},
			progress: {
				label: "USD share",
				value: "53%",
				width: "53%",
				color: "var(--pm-info)",
			},
		},
		{
			label: "BEST RATE TODAY",
			labelColor: "var(--pm-accent)",
			value: "1 USD = 129.45 KES",
			badge: {
				icon: "bi-clock",
				text: "Live • Updated 14s ago",
				tone: "badgeS",
			},
			lines: [
				{
					text: "USD/EUR: 0.92 ",
					strong: "+0.4%",
					strongColor: "var(--pm-accent)",
				},
				{
					text: "USD/GBP: 0.78 ",
					strong: "-0.2%",
					strongColor: "var(--pm-danger)",
				},
			],
		},
		{
			label: "DIASPORA → FLOAT (MTD)",
			labelColor: "var(--pm-primary)",
			value: "KES 8.42M",
			badge: {
				icon: "bi-bank2",
				text: "Land Buyers 86% · Company 2 14%",
				tone: "badgeS",
			},
			progress: {
				label: "By source",
				value: "USD 52% · GBP 30% · EUR 18%",
				width: "72%",
				color: "var(--pm-primary)",
			},
		},
		{
			label: "FX FEES PAID (MTD)",
			labelColor: "var(--pm-warning)",
			value: "KES 86,400",
			badge: {
				icon: "bi-piggy-bank",
				text: "0.9% avg cost · smart routing on",
				tone: "badgeS",
			},
		},
		{
			label: "RATE LOCKS ACTIVE",
			labelColor: "var(--pm-purple)",
			value: "2",
			badge: {
				icon: "bi-shield-lock",
				text: "saves ≈ KES 41,200/mo",
				tone: "badgeP",
			},
		},
		{
			label: "AWAITING CONVERSION",
			labelColor: "var(--pm-danger)",
			value: "KES 2.36M",
			badge: {
				icon: "bi-hourglass-split",
				text: "1 diaspora batch · PLT-091",
				tone: "badgeW",
			},
		},
	],
	attention: [
		{
			icon: "bi-hourglass-split",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "PLT-091 diaspora batch awaiting conversion",
			sub: "£14,200 sits in GBP wallet — convert before Friday auto-settle",
			actionLabel: "Convert",
			actionTone: "btnPmD",
			modal: "diasporaConvertModal",
		},
		{
			icon: "bi-lightning-charge",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "USD wallet above auto-convert threshold",
			sub: "$48.2K > $10K rule — 3 auto-converts paused",
			actionLabel: "Review",
			modal: "fxAutomationModal",
		},
		{
			icon: "bi-globe",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "ZAR rate moved 4.2%",
			sub: "Alert triggered • 1 ZAR = 7.12 KES",
			actionLabel: "View",
			modal: "rateAlertsModal",
		},
	],
	suggestions: [
		{
			icon: "bi-shield-lock",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Lock USD/KES at 129.20 for August payouts",
			sub: "Saves ≈ KES 21,000 vs spot for your scheduled payout",
			actionLabel: "Lock",
			modal: "hedgeModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Route Company 2 card settlements to USD wallet",
			sub: "Avoids 1.2% Paymo currency fee on card rail",
			actionLabel: "Enable",
			modal: "fxAutomationModal",
		},
		{
			icon: "bi-wallet2",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Open EUR sub-wallet for Land Buyers diaspora",
			sub: "GBP-only buyers convert 2× cheaper when batched",
			actionLabel: "Create",
			modal: "newWalletModal",
		},
	],
	quickActions: [
		{
			icon: "bi-arrow-left-right",
			label: "Instant Convert",
			color: "var(--pm-primary-light)",
			modal: "convertModal",
		},
		{
			icon: "bi-shield-lock",
			label: "Rate Lock",
			color: "var(--pm-accent)",
			modal: "hedgeModal",
		},
		{
			icon: "bi-collection",
			label: "Bulk FX",
			color: "var(--pm-purple)",
			modal: "bulkFxModal",
		},
		{
			icon: "bi-bell",
			label: "Rate Alerts",
			color: "var(--pm-warning)",
			modal: "rateAlertsModal",
		},
		{
			icon: "bi-send",
			label: "Cross-Border",
			color: "var(--pm-info)",
			modal: "fxTransferModal",
		},
		{
			icon: "bi-download",
			label: "FX Report",
			color: "var(--pm-accent)",
			modal: "fxStatementModal",
		},
		{
			icon: "bi-shuffle",
			label: "Currency Swap",
			color: "var(--pm-danger)",
			modal: "swapModal",
		},
		{
			icon: "bi-diagram-3",
			label: "Wallet Structure",
			color: "var(--pm-primary-light)",
			modal: "walletDetailModal",
		},
	],
	walletTree: [
		{
			name: "Paymo Master",
			value: "KES 124.8M",
			meta: "Platform account",
			icon: "bi-house-gear",
		},
		{
			name: "Business Wallet",
			value: "KES 8.40M",
			meta: "Available 7.95M",
			icon: "bi-briefcase",
		},
		{
			name: "Virtual Wallet",
			value: "KES 1.25M",
			meta: "Your funds",
			icon: "bi-wallet2",
		},
		{
			name: "4 Sub-wallets",
			value: "KES 11.85M",
			meta: "USD · EUR · GBP · ZAR",
			icon: "bi-currency-exchange",
		},
		{
			name: "2 Floats",
			value: "KES 3.84M",
			meta: "Land Buyers · Company 2",
			icon: "bi-bank2",
		},
	],
	diaspora: [
		{
			ref: "PLT-091",
			business: "Land Buyers LTD",
			payer: "Buyer • UK",
			from: "GBP 14,200",
			kes: "KES 2,360,040",
			rate: "166.20",
			status: "Awaiting convert",
			tone: "badgeW",
			actionLabel: "Convert to Float",
			actionModal: "diasporaConvertModal",
		},
		{
			ref: "ORD-8901",
			business: "Company 2",
			payer: "Order #ORD-8901",
			from: "USD 1,840",
			kes: "KES 238,188",
			rate: "129.45",
			status: "Converted 08:12",
			tone: "badgeS",
			actionLabel: "Receipt",
			actionModal: "fxReceiptModal",
		},
		{
			ref: "PLT-084",
			business: "Land Buyers LTD",
			payer: "Buyer • US",
			from: "USD 8,500",
			kes: "KES 1,100,325",
			rate: "129.45",
			status: "Converted 09:30",
			tone: "badgeS",
			actionLabel: "Receipt",
			actionModal: "fxReceiptModal",
		},
		{
			ref: "ORD-8877",
			business: "Company 2",
			payer: "Order #ORD-8877",
			from: "USD 940",
			kes: "KES 121,683",
			rate: "129.45",
			status: "Pending rate check",
			tone: "badgeW",
			actionLabel: "Track",
			actionModal: "rateAlertsModal",
		},
	],
	conversions: [
		{
			ref: "FX-44121",
			business: "Land Buyers LTD",
			from: "USD 28,400",
			to: "KES 3,676,380",
			rate: "129.45",
			fee: "KES 2,900",
			status: "Completed",
			tone: "badgeS",
			dest: "Land Buyers float · RB-9923",
			destTone: "float",
		},
		{
			ref: "FX-44118",
			business: "Land Buyers LTD",
			from: "GBP 14,200",
			to: "KES 2,360,040",
			rate: "166.20",
			fee: "KES 1,980",
			status: "Completed",
			tone: "badgeS",
			dest: "Land Buyers float · RB-9922",
			destTone: "float",
		},
		{
			ref: "FX-44112",
			business: "My Wallets",
			from: "KES 1,525,080",
			to: "ZAR 214,000",
			rate: "7.12",
			fee: "KES 1,200",
			status: "Completed",
			tone: "badgeS",
			dest: "Supplier payout",
			destTone: "wallet",
		},
	],
	businesses: [
		{
			id: "land",
			name: "Land Buyers LTD",
			customers: 30,
			role: "Manager",
			convLimit: "KES 5,000,000 / day",
			source: "Diaspora USD · GBP · EUR installments",
			floatVal: "KES 3.20M",
			floatMin: "min KES 3.00M",
		},
		{
			id: "co2",
			name: "Company 2",
			customers: 209,
			role: "Owner",
			convLimit: "Unlimited (Owner)",
			source: "Card rail USD settlement",
			floatVal: "KES 640K",
			floatMin: "min KES 500K",
		},
	],
	subWallets: [
		{
			ccy: "USD",
			balance: "48,200.00",
			kes: "KES 6,240,900",
			change: "+0.42%",
			source: "Land Buyers diaspora",
			status: "Active",
			tone: "badgeS",
		},
		{
			ccy: "EUR",
			balance: "18,400.00",
			kes: "KES 2,572,320",
			change: "-0.18%",
			source: "Land Buyers diaspora",
			status: "Low",
			tone: "badgeW",
		},
		{
			ccy: "GBP",
			balance: "9,100.00",
			kes: "KES 1,512,420",
			change: "+0.65%",
			source: "Land Buyers diaspora",
			status: "Active",
			tone: "badgeS",
		},
		{
			ccy: "ZAR",
			balance: "214,000.00",
			kes: "KES 1,525,080",
			change: "-1.12%",
			source: "Company 2 card rail",
			status: "Active",
			tone: "badgeS",
		},
	],
	crossBorder: [
		{
			ref: "FXTR-8821",
			detail: "ZAR 214,000 → SA supplier · settles 3 Aug",
			status: "Pending",
			tone: "badgeW",
			actionLabel: "Track",
			actionModal: "fxTransferModal",
		},
		{
			ref: "FXTR-8790",
			detail: "USD 12,000 → China vendor",
			status: "Completed",
			tone: "badgeS",
			actionLabel: "Receipt",
			actionModal: "fxReceiptModal",
		},
		{
			ref: "FXTR-8776",
			detail: "GBP 6,000 → UK buyer refund",
			status: "Completed",
			tone: "badgeS",
			actionLabel: "Receipt",
			actionModal: "fxReceiptModal",
		},
	],
	liveRates: [
		{
			pair: "USD/KES",
			buy: "129.35",
			sell: "129.85",
			spread: "0.50",
			change: "+0.42%",
		},
		{
			pair: "EUR/KES",
			buy: "139.10",
			sell: "139.80",
			spread: "0.70",
			change: "-0.18%",
		},
		{
			pair: "GBP/KES",
			buy: "165.40",
			sell: "166.20",
			spread: "0.80",
			change: "+0.65%",
		},
		{
			pair: "ZAR/KES",
			buy: "7.12",
			sell: "7.22",
			spread: "0.10",
			change: "-1.12%",
		},
	],
	rateAlerts: [
		{
			title: "USD/KES > 130.50",
			sub: "Current: 129.85 • Trigger: 130.50",
			badge: { text: "Active", tone: "badgeS" },
		},
		{
			title: "EUR/KES < 138.00",
			sub: "Current: 139.80 • Trigger: 138.00",
			badge: { text: "Paused", tone: "badgeW" },
		},
		{
			title: "GBP/KES > 167.00",
			sub: "Current: 166.20 • Trigger: 167.00",
			badge: { text: "Active", tone: "badgeS" },
		},
		{
			title: "ZAR/KES < 7.00",
			sub: "Current: 7.12 • Trigger: 7.00",
			badge: { text: "Active", tone: "badgeS" },
		},
	],
	rateLocks: [
		{
			title: "LK-8821 · USD/KES 129.20",
			sub: "$12,000 locked · expires 30 Aug",
			badge: { text: "Active", tone: "badgeS" },
		},
		{
			title: "LK-8819 · GBP/KES 165.90",
			sub: "£8,000 locked · expires 22 Aug",
			badge: { text: "Active", tone: "badgeS" },
		},
		{
			title: "LK-8799 · EUR/KES 139.10",
			sub: "€5,000 locked · settled 15 Jul",
			badge: { text: "Settled", tone: "badgeD" },
		},
	],
	lockStrip: {
		text: "Worth locking: USD/KES",
		strong:
			"129.20 vs spot 129.45 — saves ≈ KES 21,000 on your August payouts.",
		btnLabel: "Lock Now",
		modal: "hedgeModal",
	},
	costBars: [
		{ height: "65%", color: "var(--pm-primary-light)", label: "Jan" },
		{ height: "72%", color: "var(--pm-primary-light)", label: "Feb" },
		{ height: "58%", color: "var(--pm-primary-light)", label: "Mar" },
		{ height: "81%", color: "var(--pm-warning)", label: "Apr" },
		{ height: "67%", color: "var(--pm-primary-light)", label: "May" },
		{ height: "49%", color: "var(--pm-accent)", label: "Jun" },
	],
	keyMetrics: [
		{ label: "Avg Spread", value: "0.48%", color: "var(--pm-accent)" },
		{ label: "Best Execution", value: "99.2%", color: "var(--pm-info)" },
		{
			label: "Rate-Lock Savings",
			value: "KES 41,200",
			color: "var(--pm-purple)",
		},
	],
	autoRules: [
		{
			title: "USD → KES auto-convert",
			sub: "When USD wallet > $10,000 → Business Wallet",
			badge: { text: "Active", tone: "badgeS" },
		},
		{
			title: "Diaspora GBP → Land Buyers float",
			sub: "Every Friday 13:00 before auto-settle",
			badge: { text: "Active", tone: "badgeS" },
		},
		{
			title: "EUR → KES daily 09:00",
			sub: "Business Wallet sweep",
			badge: { text: "Paused", tone: "badgeW" },
		},
	],
	alertSettings: [
		{
			title: "USD/KES > 130.50",
			badge: { text: "SMS + Push", tone: "badgeS" },
		},
		{ title: "EUR/KES < 138.00", badge: { text: "Push", tone: "badgeS" } },
		{
			title: "GBP/KES volatility > 2%",
			badge: { text: "Email", tone: "badgeS" },
		},
	],
	walletPrefs: [
		{ title: "Default display currency", value: "KES" },
		{ title: "Show equivalent in", value: "USD" },
		{
			title: "Auto-hide small balances",
			badge: { text: "On", tone: "badgeS" },
		},
	],
	fxAccess: [
		{
			scope: "Convert customer FX to KES",
			desc: "Turn diaspora & card settlements into float fuel",
			granted: true,
		},
		{
			scope: "Lock rates for scheduled payouts",
			desc: "Create & manage rate locks up to KES 20M",
			granted: true,
		},
		{
			scope: "Open new currency wallets",
			desc: "Create USD/EUR/GBP/ZAR sub-wallets",
			granted: true,
		},
		{
			scope: "Cross-border payouts > KES 1M",
			desc: "Supplier & vendor payments above the limit",
			granted: false,
		},
		{
			scope: "Refund diaspora buyers in their currency",
			desc: "Issue GBP/USD/EUR refunds from sub-wallets",
			granted: false,
		},
	],
	activity: [
		{
			date: "27 Jun",
			world: "cust",
			ref: "FX-44121",
			activity: "USD → KES · Land Buyers float",
			amount: "KES 3,676,380",
			rate: "129.45",
			fee: "KES 2,900",
			status: "Completed",
			tone: "badgeS",
		},
		{
			date: "26 Jun",
			world: "my",
			ref: "FXTR-8790",
			activity: "KES → ZAR supplier payout",
			amount: "ZAR 214,000",
			rate: "7.12",
			fee: "KES 1,200",
			status: "Completed",
			tone: "badgeS",
		},
		{
			date: "25 Jun",
			world: "cust",
			ref: "FX-44118",
			activity: "GBP → KES · PLT-091 diaspora",
			amount: "KES 2,360,040",
			rate: "166.20",
			fee: "KES 1,980",
			status: "Pending",
			tone: "badgeW",
		},
		{
			date: "24 Jun",
			world: "my",
			ref: "FXTR-8776",
			activity: "GBP → UK buyer refund",
			amount: "GBP 6,000",
			rate: "166.20",
			fee: "KES 900",
			status: "Completed",
			tone: "badgeS",
		},
	],
};

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchFx(): Promise<FxConfig> {
	const res = await fetch("/api/fx");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<FxConfig>;
	return { ...initialMockData, ...json };
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
	title?: string;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.ub}>
			{title && (
				<div
					className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
					style={{ gap: 8 }}
				>
					<h4 className={styles.ubTitle} style={{ margin: 0 }}>
						{title}
					</h4>
					{action}
				</div>
			)}
			{children}
		</div>
	);
}

/* ---------- sr row with optional wide bottom button ---------- */
function SrRowList({
	rows,
	wideButton,
	onOpen,
}: {
	rows: {
		title: string;
		sub?: string;
		badge?: { text: string; tone: BadgeTone };
		value?: string;
		action?: { label: string; modal: string };
	}[];
	wideButton?: { label: string; modal: string };
	onOpen: (id: string) => void;
}) {
	return (
		<>
			{rows.map((r) => (
				<div className={styles.sr} key={r.title}>
					<div>
						<strong>{r.title}</strong>
						{r.sub && <div className={styles.mutedSmall}>{r.sub}</div>}
					</div>
					{r.badge ? (
						<span className={`${styles.badge} ${styles[r.badge.tone]}`}>
							{r.badge.text}
						</span>
					) : r.value ? (
						<strong>{r.value}</strong>
					) : r.action ? (
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => {
								if (r.action) onOpen(r.action.modal);
							}}
						>
							{r.action.label}
						</button>
					) : null}
				</div>
			))}
			{wideButton && (
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
					onClick={() => onOpen(wideButton.modal)}
				>
					{wideButton.label}
				</button>
			)}
		</>
	);
}

/* ---------- KPI visual metadata (keyed by stat label) ---------- */
const STAT_META: Record<string, { icon: string; tone: string }> = {
	"FOREIGN CURRENCY HELD": {
		icon: "bi-currency-exchange",
		tone: "kpiIconBlue",
	},
	"BEST RATE TODAY": { icon: "bi-graph-up-arrow", tone: "kpiIconGreen" },
	"DIASPORA → FLOAT (MTD)": { icon: "bi-bank2", tone: "kpiIconGreen" },
	"FX FEES PAID (MTD)": { icon: "bi-piggy-bank", tone: "kpiIconAmber" },
	"RATE LOCKS ACTIVE": { icon: "bi-shield-lock", tone: "kpiIconViolet" },
	"AWAITING CONVERSION": { icon: "bi-hourglass-split", tone: "kpiIconRed" },
};
const STAT_FALLBACK = { icon: "bi-wallet2", tone: "kpiIconBlue" };

export default function FxManagement() {
	const { data, isFetching, error } = useQuery({
		queryKey: ["paymo-fx"],
		queryFn: fetchFx,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [world, setWorld] = useState<World>("cust");
	const [biz, setBiz] = useState<BizId>("all");
	const [diasporaSearch, setDiasporaSearch] = useState("");

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

	const bizName =
		biz === "land" ? BIZ_NAMES.land : biz === "co2" ? BIZ_NAMES.co2 : "";
	const inScope = (b: string) => biz === "all" || b === bizName;
	const scopeTag = biz === "all" ? "All businesses" : bizName;

	const diaspora = config.diaspora.filter((d) => inScope(d.business));
	const conversions = config.conversions.filter((c) => inScope(c.business));
	const crossBorder = config.crossBorder;

	const diasporaQuery = diasporaSearch.trim().toLowerCase();
	const filteredDiaspora = diaspora.filter(
		(d) =>
			!diasporaQuery ||
			d.ref.toLowerCase().includes(diasporaQuery) ||
			d.business.toLowerCase().includes(diasporaQuery) ||
			d.payer.toLowerCase().includes(diasporaQuery) ||
			d.from.toLowerCase().includes(diasporaQuery),
	);

	return (
		<div className={styles.fxPage}>
			<main className={styles.main}>
				<div className={styles.content}>
					{/* ======================= EXECUTIVE HERO ======================= */}
					<section
						className={styles.heroBanner}
						aria-labelledby="fx-page-title"
					>
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-currency-exchange" /> Multi-Currency ·
										Wallets &amp; FX
									</span>
									<span className={styles.heroLive}>
										<span className={styles.dotLive} />{" "}
										{isFetching ? "Refreshing rates" : config.hero.live}
									</span>
								</div>
								<h1 id="fx-page-title">
									Turn foreign currency into settlement fuel.
								</h1>
								<p>{config.pageSub}</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimaryBtn}
										onClick={() => openM("convertModal")}
									>
										<i className="bi bi-arrow-left-right" /> Convert
									</button>
									<button
										type="button"
										className={styles.heroSecondaryBtn}
										onClick={() => openM("hedgeModal")}
									>
										<i className="bi bi-shield-lock" /> Rate Lock
									</button>
									<button
										type="button"
										className={styles.heroSecondaryBtn}
										onClick={() => openM("newWalletModal")}
									>
										<i className="bi bi-plus-lg" /> New Wallet
									</button>
									<button
										type="button"
										className={styles.heroSecondaryBtn}
										onClick={() => openM("fxNotifModal")}
									>
										<i className="bi bi-bell" /> Notifications
									</button>
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="FX command center snapshot"
							>
								<span>Foreign currency held</span>
								<strong>
									{config.hero.value.replace(" in foreign currency", "")}
								</strong>
								<p>{config.hero.detail}</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>4</strong>
										<span>Sub-wallets</span>
									</div>
									<div>
										<strong>129.45</strong>
										<span>Best USD/KES rate</span>
									</div>
									<div>
										<strong>KES 8.42M</strong>
										<span>Converted MTD</span>
									</div>
								</div>
							</aside>
						</div>
					</section>

					{/* ======================= SCOPE BAR ======================= */}
					<div className={`${styles.card} ${styles.scopeBar}`}>
						<span className={styles.scopeBarLabel}>
							<i className="bi bi-diagram-3" /> World
						</span>
						<div className={styles.worldSwitch}>
							<button
								type="button"
								className={`${styles.worldBtn} ${world === "cust" ? styles.worldBtnActive : ""}`}
								onClick={() => setWorld("cust")}
							>
								<i className="bi bi-people" /> Customer FX
							</button>
							<button
								type="button"
								className={`${styles.worldBtn} ${world === "my" ? styles.worldBtnActive : ""}`}
								onClick={() => setWorld("my")}
							>
								<i className="bi bi-wallet2" /> My Wallets &amp; FX
							</button>
						</div>
						{world === "cust" && (
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
										Land Buyers LTD · 30
									</button>
									<button
										type="button"
										className={`${styles.pill} ${biz === "co2" ? styles.pillActive : ""}`}
										onClick={() => setBiz("co2")}
									>
										Company 2 · 209
									</button>
								</div>
							</div>
						)}
						<span className={styles.scopeTag}>
							<i className="bi bi-check-circle" /> {scopeTag}
						</span>
						{!data && (
							<span
								className={styles.scopeTag}
								style={{
									background: "#f2f4f8",
									borderColor: "#e6e9f0",
									color: "#667085",
								}}
							>
								<i className="bi bi-stars" /> Sandbox preview
							</span>
						)}
						<button
							type="button"
							className={styles.scopeAvatar}
							aria-label="Open profile"
							onClick={() => openM("profileModal")}
						>
							JK
						</button>
					</div>

					{error ? (
						<output className={styles.statusNotice}>
							<i className="bi bi-cloud-slash" />
							<span>
								<strong>Live FX data is temporarily unavailable</strong>
								<small>Using the latest local operating snapshot.</small>
							</span>
						</output>
					) : null}

					{/* ======================= 1.1 FX PULSE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="fx-pulse-heading"
					>
						<SectionHeading
							id="fx-pulse-heading"
							index="1.1"
							title="FX pulse"
							description="A concise view of currency held, live rates, conversion fuel and lock protection."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("fxHealthModal")}
									>
										<i className="bi bi-heart-pulse" /> Health check
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("fxAccessModal")}
									>
										<i className="bi bi-shield-check" /> FX access
									</button>
								</div>
							}
						/>
						<div className={styles.kpiGrid}>
							{config.stats.map((stat, index) => {
								const meta = STAT_META[stat.label] ?? STAT_FALLBACK;
								return (
									<article
										key={stat.label}
										className={`${styles.card} ${styles.kpiCard} ${index === 0 ? styles.kpiFeatured : ""} ${index === config.stats.length - 1 ? styles.kpiWarning : ""}`}
									>
										<div className={`${styles.kpiIcon} ${styles[meta.tone]}`}>
											<i className={`bi ${meta.icon}`} />
										</div>
										<div className={styles.kpiMeta}>
											<span>{stat.label}</span>
											<small>Live</small>
										</div>
										<strong className={styles.kpiValue}>{stat.value}</strong>
										{stat.progress && (
											<div className={styles.kpiProgress}>
												<div className={styles.pmProgress}>
													<div
														className={styles.pmProgressBar}
														style={{
															width: stat.progress.width,
															background: stat.progress.color,
														}}
													/>
												</div>
											</div>
										)}
										<div className={styles.kpiFoot}>
											<span
												className={`${styles.badge} ${styles[stat.badge.tone]}`}
											>
												<i className={`bi ${stat.badge.icon}`} />{" "}
												{stat.badge.text}
											</span>
											<span>
												{stat.progress?.value ??
													stat.lines?.[0]?.text ??
													"FX command center"}
											</span>
										</div>
									</article>
								);
							})}
						</div>
					</section>

					{/* ======================= 1.2 ATTENTION & ACTIONS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="fx-attention-heading"
					>
						<SectionHeading
							id="fx-attention-heading"
							index="1.2"
							title="Needs your attention"
							description="Resolve conversion exceptions and act on intelligent FX recommendations without leaving the dashboard."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openM("attentionModal")}
								>
									<i className="bi bi-list-check" /> Review queue
								</button>
							}
						/>
						<div className={styles.attentionGrid}>
							<article className={`${styles.card} ${styles.listCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Action center</span>
										<h3>FX exceptions</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeW}`}>
										{config.attention.length} open
									</span>
								</div>
								<div className={styles.listBody}>
									{config.attention.map((item) => (
										<div key={item.title} className={styles.actionRow}>
											<div className={styles.actionRowMain}>
												<span
													className={styles.iconCircle}
													style={{
														background: item.iconBg,
														color: item.iconColor,
													}}
												>
													<i className={`bi ${item.icon}`} />
												</span>
												<div>
													<strong>{item.title}</strong>
													<span>{item.sub}</span>
												</div>
											</div>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ""}`}
												onClick={() => openM(item.modal)}
											>
												{item.actionLabel}
											</button>
										</div>
									))}
								</div>
							</article>

							<article className={`${styles.card} ${styles.listCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Smart guidance</span>
										<h3>Suggested next moves</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeP}`}>
										<i className="bi bi-stars" /> Insights
									</span>
								</div>
								<div className={styles.listBody}>
									{config.suggestions.map((item) => (
										<div key={item.title} className={styles.actionRow}>
											<div className={styles.actionRowMain}>
												<span
													className={styles.iconCircle}
													style={{
														background: item.iconBg,
														color: item.iconColor,
													}}
												>
													<i className={`bi ${item.icon}`} />
												</span>
												<div>
													<strong>{item.title}</strong>
													<span>{item.sub}</span>
												</div>
											</div>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM(item.modal)}
											>
												{item.actionLabel}
											</button>
										</div>
									))}
								</div>
							</article>
						</div>

						<article className={`${styles.card} ${styles.quickActionCard}`}>
							<div className={styles.quickActionIntro}>
								<span className={styles.cardKicker}>Shortcuts</span>
								<h3>Start a workflow</h3>
								<p>Frequent FX &amp; wallet tasks, one click away.</p>
							</div>
							<div className={styles.quickGrid}>
								{config.quickActions.map((action) => (
									<button
										type="button"
										key={action.label}
										className={styles.quickBtn}
										onClick={() => openM(action.modal)}
									>
										<span style={{ color: action.color }}>
											<i className={`bi ${action.icon}`} />
										</span>
										{action.label}
										<i className="bi bi-arrow-right" />
									</button>
								))}
							</div>
						</article>
					</section>

					{/* ============================================================
					    1.3 WORLD A — CUSTOMER FX & COLLECTIONS
					    ============================================================ */}
					{world === "cust" && (
						<section
							className={styles.dashboardSection}
							aria-labelledby="fx-collections-heading"
						>
							<SectionHeading
								id="fx-collections-heading"
								index="1.3"
								title="Customer FX & collections"
								description={`${scopeTag} — foreign-currency payments from your customers, awaiting or already converted into KES float fuel.`}
								action={
									<div className={styles.headerButtonRow}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnPmP}`}
											onClick={() => openM("diasporaConvertModal")}
										>
											<i className="bi bi-arrow-left-right" /> Convert batch
										</button>
										<button
											type="button"
											className={styles.btnPm}
											onClick={() => openM("bulkFxModal")}
										>
											<i className="bi bi-collection" /> Bulk FX
										</button>
									</div>
								}
							/>

							<article className={`${styles.card} ${styles.tableCard}`}>
								<div className={styles.tableToolbar}>
									<div className={styles.tableTitle}>
										<h3>Diaspora &amp; card settlements</h3>
										<span>Incoming foreign-currency payments per business</span>
									</div>
									<div className={styles.tableTools}>
										<label className={styles.tableSearch}>
											<i className="bi bi-search" />
											<span className={styles.srOnly}>Search settlements</span>
											<input
												value={diasporaSearch}
												onChange={(event) =>
													setDiasporaSearch(event.target.value)
												}
												placeholder="Search reference or payer"
											/>
										</label>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
											onClick={() => openM("diasporaConvertModal")}
										>
											<i className="bi bi-arrow-left-right" /> Convert to float
										</button>
									</div>
								</div>
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Ref</th>
												<th>Business</th>
												<th>Payer / Order</th>
												<th>From</th>
												<th>KES value</th>
												<th>Rate</th>
												<th>Status</th>
												<th>
													<span className={styles.srOnly}>Action</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{filteredDiaspora.map((d) => (
												<tr key={d.ref}>
													<td>
														<code>{d.ref}</code>
													</td>
													<td>{d.business}</td>
													<td>{d.payer}</td>
													<td>
														<strong>{d.from}</strong>
													</td>
													<td>
														<strong>{d.kes}</strong>
													</td>
													<td>{d.rate}</td>
													<td>
														<span
															className={`${styles.badge} ${styles[d.tone]}`}
														>
															{d.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM(d.actionModal)}
														>
															{d.actionLabel}
														</button>
													</td>
												</tr>
											))}
											{diaspora.length === 0 && (
												<tr>
													<td colSpan={8}>
														<div className={styles.emptyState}>
															<i className="bi bi-currency-exchange" />
															<strong>No settlements in this scope</strong>
															<span>
																Switch the business scope to see more
																collections.
															</span>
														</div>
													</td>
												</tr>
											)}
											{diaspora.length > 0 && filteredDiaspora.length === 0 && (
												<tr>
													<td colSpan={8}>
														<div className={styles.emptyState}>
															<i className="bi bi-search" />
															<strong>No matching settlements</strong>
															<span>
																Try a different reference or payer name.
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
										Showing {filteredDiaspora.length} of {diaspora.length}{" "}
										settlements
									</span>
									<button type="button" onClick={() => openM("bulkFxModal")}>
										Bulk convert <i className="bi bi-arrow-right" />
									</button>
								</div>
							</article>

							<article
								className={`${styles.card} ${styles.tableCard}`}
								style={{ marginTop: "1rem" }}
							>
								<div className={styles.tableToolbar}>
									<div className={styles.tableTitle}>
										<h3>Conversion history</h3>
										<span>
											Every conversion and where it landed — float fuel or your
											own wallet.
										</span>
									</div>
									<div className={styles.tableTools}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
											onClick={() => openM("convertModal")}
										>
											<i className="bi bi-arrow-right" /> Convert now
										</button>
									</div>
								</div>
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Ref</th>
												<th>Business</th>
												<th>From → To</th>
												<th>Rate</th>
												<th>Fee</th>
												<th>Destination</th>
												<th>Status</th>
												<th>
													<span className={styles.srOnly}>Action</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{conversions.map((c) => (
												<tr key={c.ref}>
													<td>
														<code>{c.ref}</code>
													</td>
													<td>{c.business}</td>
													<td>
														{c.from} → <strong>{c.to}</strong>
													</td>
													<td>{c.rate}</td>
													<td>{c.fee}</td>
													<td>
														<span
															className={`${styles.destChip} ${c.destTone === "float" ? styles.destChipFloat : styles.destChipWallet}`}
														>
															<i
																className={`bi ${c.destTone === "float" ? "bi-bank2" : "bi-wallet2"}`}
															/>{" "}
															{c.dest}
														</span>
													</td>
													<td>
														<span
															className={`${styles.badge} ${styles[c.tone]}`}
														>
															{c.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM("fxReceiptModal")}
														>
															Receipt
														</button>
													</td>
												</tr>
											))}
											{conversions.length === 0 && (
												<tr>
													<td colSpan={8}>
														<div className={styles.emptyState}>
															<i className="bi bi-clock-history" />
															<strong>No conversions in this scope</strong>
															<span>Converted batches will appear here.</span>
														</div>
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</article>

							<article className={styles.card} style={{ marginTop: "1rem" }}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Role limits</span>
										<h3>Per-business conversion limits</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openM("fxLimitsModal")}
									>
										Edit limits <i className="bi bi-arrow-right" />
									</button>
								</div>
								<div className="row g-3" style={{ paddingTop: "1rem" }}>
									{config.businesses.map((b) => (
										<div className="col-lg-6" key={b.id}>
											<div className={styles.bizSourceCard}>
												<div className="d-flex justify-content-between align-items-center mb-2">
													<div>
														<div className={styles.bizSourceName}>{b.name}</div>
														<div className={styles.bizSourceRole}>
															{b.role} · {b.customers} customers
														</div>
													</div>
													<span
														className={`${styles.badge} ${b.id === "land" ? styles.badgeW : styles.badgeS}`}
													>
														{b.id === "land"
															? "Payouts ≤ KES 5M"
															: "Full access"}
													</span>
												</div>
												<div className={styles.bizSourceRow}>
													<span>Conversion limit</span>
													<strong>{b.convLimit}</strong>
												</div>
												<div className={styles.bizSourceRow}>
													<span>FX source</span>
													<strong>{b.source}</strong>
												</div>
												<div className={styles.bizSourceRow}>
													<span>Settlement float</span>
													<strong>
														{b.floatVal} / {b.floatMin}
													</strong>
												</div>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}
													onClick={() => openM("fxLimitsModal")}
												>
													<i className="bi bi-pencil me-1" /> Edit {b.name}{" "}
													limits
												</button>
											</div>
										</div>
									))}
								</div>
							</article>
						</section>
					)}

					{/* ============================================================
					    1.3 WORLD B — MY MULTI-CURRENCY WALLETS & STRUCTURE
					    ============================================================ */}
					{world === "my" && (
						<section
							className={styles.dashboardSection}
							aria-labelledby="fx-wallets-heading"
						>
							<SectionHeading
								id="fx-wallets-heading"
								index="1.3"
								title="My wallets & structure"
								description="Your money hierarchy — platform master, business wallet, virtual wallet, currency sub-wallets and business floats."
								action={
									<div className={styles.headerButtonRow}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnPmP}`}
											onClick={() => openM("walletTopUpModal")}
										>
											<i className="bi bi-plus-circle" /> Top up wallet
										</button>
										<button
											type="button"
											className={styles.btnPm}
											onClick={() => openM("walletWithdrawModal")}
										>
											<i className="bi bi-box-arrow-up-right" /> Withdraw
										</button>
									</div>
								}
							/>

							<article className={styles.card}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Hierarchy</span>
										<h3>Wallet structure</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeI}`}>
										<i className="bi bi-diagram-3" /> 3 accounts · 4 currencies
									</span>
								</div>
								<div className="row g-3" style={{ paddingTop: "1rem" }}>
									{[
										{
											name: "Paymo Master",
											value: "KES 124.8M",
											meta: "Platform account · all flows route through here",
											icon: "bi-house-gear",
										},
										{
											name: "Business Wallet",
											value: "KES 8.40M",
											meta: "Available KES 7.95M · linked Equity Bank 01-2345678-0",
											icon: "bi-briefcase",
										},
										{
											name: "Virtual Wallet",
											value: "KES 1.25M",
											meta: "Your personal spending balance",
											icon: "bi-wallet2",
										},
									].map((n) => (
										<div className="col-lg-4" key={n.name}>
											<button
												type="button"
												className={`${styles.bizSourceCard} ${styles.bizSourceCardBtn}`}
												onClick={() => openM("walletDetailModal")}
											>
												<span className={styles.walletNodeHead}>
													<i className={`bi ${n.icon}`} /> {n.name}
												</span>
												<span
													className={styles.walletNodeVal}
													style={{ margin: "6px 0", display: "block" }}
												>
													{n.value}
												</span>
												<span className={styles.mutedSmall}>{n.meta}</span>
												<span
													className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}
													style={{
														justifyContent: "center",
														pointerEvents: "none",
													}}
												>
													Manage
												</span>
											</button>
										</div>
									))}
								</div>
								<div className={styles.walletTree}>
									{config.walletTree.map((n, i) => (
										<div
											className="d-flex align-items-stretch"
											style={{ gap: 6 }}
											key={n.name}
										>
											<button
												type="button"
												className={styles.walletNode}
												onClick={() => openM("walletDetailModal")}
											>
												<div className={styles.walletNodeHead}>
													<i className={`bi ${n.icon}`} /> {n.name}
												</div>
												<div className={styles.walletNodeVal}>{n.value}</div>
												<div className={styles.walletNodeMeta}>{n.meta}</div>
											</button>
											{i < config.walletTree.length - 1 && (
												<span className={styles.walletArrow}>
													<i className="bi bi-chevron-right" />
												</span>
											)}
										</div>
									))}
								</div>
								<p className={styles.mutedSmall} style={{ marginTop: 10 }}>
									<i className="bi bi-info-circle me-1" />
									Tap any wallet to manage, top up or withdraw.
								</p>
							</article>

							<article className={styles.card} style={{ marginTop: "1rem" }}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Balances</span>
										<h3>Currency sub-wallets</h3>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("newWalletModal")}
									>
										<i className="bi bi-plus-lg" /> New wallet
									</button>
								</div>
								<div className="row g-3" style={{ paddingTop: "1rem" }}>
									{config.subWallets.map((w) => (
										<div className="col-lg-3 col-md-6" key={w.ccy}>
											<div className={styles.subWalletCard}>
												<div className="d-flex align-items-center gap-3 mb-2">
													<div className={styles.subWalletIcon}>{w.ccy}</div>
													<div>
														<div className={styles.subWalletName}>
															{w.ccy} Wallet
														</div>
														<div className={styles.subWalletSrc}>
															{w.source}
														</div>
													</div>
												</div>
												<div className={styles.subWalletBal}>{w.balance}</div>
												<div className={styles.subWalletKes}>
													{w.kes} ·{" "}
													<span
														style={{
															color: w.change.includes("+")
																? "var(--pm-green)"
																: "var(--pm-danger)",
															fontWeight: 700,
														}}
													>
														{w.change}
													</span>
												</div>
												<div className="mt-2 mb-2">
													<span className={`${styles.badge} ${styles[w.tone]}`}>
														{w.status}
													</span>
												</div>
												<div className="d-flex flex-wrap" style={{ gap: 6 }}>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("convertModal")}
													>
														Convert
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("walletTopUpModal")}
													>
														Top up
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("walletWithdrawModal")}
													>
														Withdraw
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</article>

							<article
								className={`${styles.card} ${styles.tableCard}`}
								style={{ marginTop: "1rem" }}
							>
								<div className={styles.tableToolbar}>
									<div className={styles.tableTitle}>
										<h3>Cross-border payments</h3>
										<span>
											Supplier, vendor and diaspora refund payments from your
											sub-wallets.
										</span>
									</div>
									<div className={styles.tableTools}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
											onClick={() => openM("fxTransferModal")}
										>
											<i className="bi bi-send" /> New transfer
										</button>
									</div>
								</div>
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Ref</th>
												<th>Payment</th>
												<th>Status</th>
												<th>
													<span className={styles.srOnly}>Action</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{crossBorder.map((x) => (
												<tr key={x.ref}>
													<td>
														<code>{x.ref}</code>
													</td>
													<td>{x.detail}</td>
													<td>
														<span
															className={`${styles.badge} ${styles[x.tone]}`}
														>
															{x.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM(x.actionModal)}
														>
															{x.actionLabel}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</article>
						</section>
					)}

					{/* ============================================================
					    1.4 RATES, LOCKS & MARKET
					    ============================================================ */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="fx-rates-heading"
					>
						<SectionHeading
							id="fx-rates-heading"
							index="1.4"
							title="Rates, locks & market"
							description="Real-time rates for your settlement currencies, plus the locks and analytics protecting your float fuel."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("fxMarketModal")}
									>
										<i className="bi bi-globe" /> Market depth
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("hedgeModal")}
									>
										<i className="bi bi-shield-lock" /> New lock
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-7">
									<Ub
										title="Live retail rates (KES)"
										action={
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("rateAlertsModal")}
											>
												<i className="bi bi-bell" /> Alerts
											</button>
										}
									>
										<div className={styles.tableScroll}>
											<table className={styles.tbl} style={{ minWidth: 520 }}>
												<thead>
													<tr>
														<th>Pair</th>
														<th>Buy</th>
														<th>Sell</th>
														<th>Spread</th>
														<th>24h</th>
														<th>
															<span className={styles.srOnly}>Action</span>
														</th>
													</tr>
												</thead>
												<tbody>
													{config.liveRates.map((r) => (
														<tr key={r.pair}>
															<td>
																<strong>{r.pair}</strong>
															</td>
															<td>{r.buy}</td>
															<td>{r.sell}</td>
															<td>{r.spread}</td>
															<td>
																<span
																	style={{
																		color: r.change.includes("+")
																			? "var(--pm-green)"
																			: "var(--pm-danger)",
																		fontWeight: 700,
																	}}
																>
																	{r.change}
																</span>
															</td>
															<td>
																<button
																	type="button"
																	className={`${styles.btnPm} ${styles.btnSm}`}
																	onClick={() => openM("convertModal")}
																>
																	Trade
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</Ub>
								</div>
								<div className="col-lg-5">
									<Ub title="Rate alerts active">
										<SrRowList
											rows={config.rateAlerts}
											wideButton={{
												label: "Manage all alerts",
												modal: "rateAlertsModal",
											}}
											onOpen={openM}
										/>
									</Ub>
								</div>
							</div>
						</div>

						<article className={styles.card} style={{ marginTop: "1rem" }}>
							<div className={styles.cardHeader}>
								<div>
									<span className={styles.cardKicker}>Protection</span>
									<h3>Rate locks &amp; FX analytics</h3>
								</div>
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("fxRiskModal")}
									>
										<i className="bi bi-activity" /> Exposure
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("fxAnalyticsModal")}
									>
										<i className="bi bi-bar-chart" /> Analytics
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("rateLockModal")}
									>
										<i className="bi bi-sliders" /> Manage locks
									</button>
								</div>
							</div>
							<div className={styles.lockStrip} style={{ marginTop: "1rem" }}>
								<i className="bi bi-stars" />
								<div style={{ flex: "1 1 240px", fontSize: 13 }}>
									<strong>{config.lockStrip.text}</strong>{" "}
									<span className={styles.mutedSmall}>
										{config.lockStrip.strong}
									</span>
								</div>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM(config.lockStrip.modal)}
								>
									{config.lockStrip.btnLabel}
								</button>
							</div>
							<div className="row g-3">
								<div className="col-lg-6">
									<Ub title="Active rate locks">
										<SrRowList
											rows={config.rateLocks}
											wideButton={{
												label: "Lock a rate",
												modal: "hedgeModal",
											}}
											onOpen={openM}
										/>
									</Ub>
								</div>
								<div className="col-lg-6">
									<Ub
										title="Monthly FX cost"
										action={
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("fxStatementModal")}
											>
												<i className="bi bi-download me-1" /> Export report
											</button>
										}
									>
										<div className="d-flex gap-4 flex-wrap">
											<div
												className={styles.chartBars}
												style={{ height: 110, flex: "1 1 180px" }}
											>
												{config.costBars.map((b) => (
													<div
														key={b.label}
														className={styles.chartBar}
														style={{
															height: b.height,
															background: b.color,
														}}
													>
														<span className={styles.barLabel}>{b.label}</span>
													</div>
												))}
											</div>
											<div style={{ flex: "1 1 200px" }}>
												<div className="row g-2">
													{config.keyMetrics.map((m) => (
														<div className="col-12" key={m.label}>
															<div className={styles.summaryBox}>
																<div className={styles.mutedSmall}>
																	{m.label}
																</div>
																<div
																	style={{
																		fontSize: 20,
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
											</div>
										</div>
									</Ub>
								</div>
							</div>
						</article>
					</section>

					{/* ============================================================
					    1.5 AUTOMATION, PERMISSIONS & ACTIVITY
					    ============================================================ */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="fx-rules-heading"
					>
						<SectionHeading
							id="fx-rules-heading"
							index="1.5"
							title="Rules, permissions & activity"
							description="Auto-conversion rules, alert channels, wallet preferences, your FX access and the recent ledger of conversions."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("fxAutomationModal")}
									>
										<i className="bi bi-robot" /> Automation
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("fxAccessModal")}
									>
										<i className="bi bi-shield-check" /> FX permissions
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className={styles.panelGrid}>
								<Ub title="Auto-conversion rules">
									<SrRowList
										rows={config.autoRules}
										wideButton={{
											label: "Manage rules",
											modal: "fxAutomationModal",
										}}
										onOpen={openM}
									/>
								</Ub>
								<Ub title="Rate alert settings">
									<SrRowList
										rows={config.alertSettings}
										wideButton={{
											label: "Edit alerts",
											modal: "rateAlertsModal",
										}}
										onOpen={openM}
									/>
								</Ub>
								<Ub title="Wallet preferences">
									<SrRowList
										rows={config.walletPrefs}
										wideButton={{
											label: "Preferences",
											modal: "fxPreferencesModal",
										}}
										onOpen={openM}
									/>
								</Ub>
							</div>
						</div>

						<article className={styles.card} style={{ marginTop: "1rem" }}>
							<div className={styles.cardHeader}>
								<div>
									<span className={styles.cardKicker}>Access</span>
									<h3>FX permissions &amp; access</h3>
								</div>
								<span className={`${styles.badge} ${styles.badgeS}`}>
									<i className="bi bi-shield-check" /> 3 of 5 granted
								</span>
							</div>
							<div style={{ paddingTop: "0.4rem" }}>
								{config.fxAccess.map((p) => (
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
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("fxAccessModal")}
											>
												Request access
											</button>
										)}
									</div>
								))}
							</div>
						</article>

						<article
							className={`${styles.card} ${styles.tableCard}`}
							style={{ marginTop: "1rem" }}
						>
							<div className={styles.tableToolbar}>
								<div className={styles.tableTitle}>
									<h3>Recent FX activity</h3>
									<span>Every conversion, lock and cross-border payment.</span>
								</div>
								<div className={styles.tableTools}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("fxStatementModal")}
									>
										<i className="bi bi-clock-history" /> Full history
									</button>
								</div>
							</div>
							<div className={styles.tableScroll}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Date</th>
											<th>World</th>
											<th>Ref</th>
											<th>Activity</th>
											<th>Amount</th>
											<th>Rate</th>
											<th>Fee</th>
											<th>Status</th>
											<th>
												<span className={styles.srOnly}>Action</span>
											</th>
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
															className={`bi ${a.world === "cust" ? "bi-people" : "bi-wallet2"}`}
														/>{" "}
														{a.world === "cust" ? "Customer FX" : "My Wallets"}
													</span>
												</td>
												<td>
													<code>{a.ref}</code>
												</td>
												<td>{a.activity}</td>
												<td>
													<strong>{a.amount}</strong>
												</td>
												<td>{a.rate}</td>
												<td>{a.fee}</td>
												<td>
													<span className={`${styles.badge} ${styles[a.tone]}`}>
														{a.status}
													</span>
												</td>
												<td>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("fxReceiptModal")}
													>
														Receipt
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
				<nav className={styles.floatingBar} aria-label="Quick FX actions">
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openM("convertModal")}
					>
						<i className="bi bi-arrow-left-right" /> Instant convert
					</button>
					<button type="button" onClick={() => openM("hedgeModal")}>
						<i className="bi bi-shield-lock" /> Rate lock
					</button>
					<button type="button" onClick={() => openM("bulkFxModal")}>
						<i className="bi bi-collection" /> Bulk FX
					</button>
					<button type="button" onClick={() => openM("fxTransferModal")}>
						<i className="bi bi-send" /> Cross-border
					</button>
					<button type="button" onClick={() => openM("rateAlertsModal")}>
						<i className="bi bi-bell" /> Alerts
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
			<FxModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
