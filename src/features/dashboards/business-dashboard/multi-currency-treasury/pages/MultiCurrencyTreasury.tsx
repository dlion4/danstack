import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import MultiCurrencyTreasuryBody from "../components/MultiCurrencyTreasuryBody";
import MultiCurrencyTreasuryExtraModals from "../components/MultiCurrencyTreasuryExtraModals";

import MultiCurrencyTreasuryModals from "../components/MultiCurrencyTreasuryModals";
import styles from "../styles/multi-currency-treasury.module.css";

/* ============================================================================
   PayMo BaaS — Multi-Currency Treasury & Forex (legacy page 3.11)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface NavItem {
	icon: string;
	title: string;
	active?: boolean;
	dot?: boolean;
}
interface User {
	initials: string;
	name: string;
	role: string;
}
interface CurrencyRow {
	code: string;
	symbol: string;
	balance: string;
	change: string;
	changeTone: BadgeTone;
	volume: string;
	progress: number;
	progressColor: string;
}
interface FXRate {
	pair: string;
	rate: string;
	change: string;
	spread: string;
	bidAsk: string;
}
interface ContractRow {
	id: string;
	pair: string;
	amount: string;
	rate: string;
	value: string;
	expiry: string;
	pnl: string;
	pnlTone: BadgeTone;
}
interface TransferRow {
	date: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
}
interface AttentionItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	btnLabel: string;
	modal: string;
}
interface SuggestionItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	btnLabel: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	iconColor: string;
	label: string;
	modal: string;
}
interface Settlement {
	label: string;
	detail: string;
	status: string;
	statusTone: BadgeTone;
}
interface ComplianceRow {
	area: string;
	status: string;
	tone: BadgeTone;
	filing: string;
	deadline: string;
}

interface FXConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle: string;
	pageSub: string;
	currencies: CurrencyRow[];
	fxRates: FXRate[];
	contracts: ContractRow[];
	transferRows: TransferRow[];
	attentionItems: AttentionItem[];
	suggestions: SuggestionItem[];
	quickActions: QuickAction[];
	settlements: Settlement[];
	compliance: ComplianceRow[];
}

const initialMockData: FXConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", title: "Overview" },
		{ icon: "bi-credit-card", title: "Cards" },
		{ icon: "bi-cash-stack", title: "Payments" },
		{
			icon: "bi-currency-exchange",
			title: "Treasury",
			active: true,
			dot: true,
		},
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Multi-Currency Treasury & Forex",
	headerSub:
		"FX accounts, live rates, transfers, hedging, compliance, reconciliation and reporting",
	searchPlaceholder: "Search currencies, rates, transfers, FX contracts...",
	user: { initials: "JK", name: "James K.", role: "Treasury Manager" },
	breadcrumb: {
		parent: "Business Portal",
		mid: "Treasury",
		current: "Multi-Currency",
	},
	pageTitle: "Multi-Currency Treasury & Forex Operations",
	pageSub:
		"Manage multi-currency accounts, execute live FX trades, set hedging contracts, monitor exposure, ensure regulatory compliance and reconcile treasury positions.",
	currencies: [
		{
			code: "KES",
			symbol: "KSh",
			balance: "48,240,000",
			change: "+2.4%",
			changeTone: "badgeS",
			volume: "12.4M",
			progress: 62,
			progressColor: "var(--pm-accent)",
		},
		{
			code: "USD",
			symbol: "$",
			balance: "318,400",
			change: "+1.8%",
			changeTone: "badgeS",
			volume: "2.8M",
			progress: 78,
			progressColor: "var(--pm-primary)",
		},
		{
			code: "EUR",
			symbol: "€",
			balance: "142,800",
			change: "-0.3%",
			changeTone: "badgeW",
			volume: "1.2M",
			progress: 45,
			progressColor: "var(--pm-info)",
		},
		{
			code: "GBP",
			symbol: "£",
			balance: "84,200",
			change: "+0.4%",
			changeTone: "badgeS",
			volume: "850K",
			progress: 38,
			progressColor: "var(--pm-purple)",
		},
		{
			code: "UGX",
			symbol: "USh",
			balance: "245,000,000",
			change: "-1.2%",
			changeTone: "badgeD",
			volume: "3.2M",
			progress: 55,
			progressColor: "var(--pm-warning)",
		},
		{
			code: "AED",
			symbol: "د.إ",
			balance: "84,200",
			change: "+0.2%",
			changeTone: "badgeS",
			volume: "200K",
			progress: 42,
			progressColor: "var(--pm-info)",
		},
	],
	fxRates: [
		{
			pair: "USD/KES",
			rate: "129.42",
			change: "-0.08",
			spread: "0.15",
			bidAsk: "129.35 - 129.50",
		},
		{
			pair: "EUR/KES",
			rate: "139.80",
			change: "+0.22",
			spread: "0.30",
			bidAsk: "139.65 - 139.95",
		},
		{
			pair: "GBP/KES",
			rate: "167.90",
			change: "-0.45",
			spread: "0.40",
			bidAsk: "167.70 - 168.10",
		},
		{
			pair: "USD/EUR",
			rate: "0.926",
			change: "-0.001",
			spread: "0.002",
			bidAsk: "0.925 - 0.927",
		},
		{
			pair: "USD/UGX",
			rate: "3,712",
			change: "+8",
			spread: "14",
			bidAsk: "3,705 - 3,719",
		},
		{
			pair: "USD/TZS",
			rate: "2,705",
			change: "-3",
			spread: "14",
			bidAsk: "2,698 - 2,712",
		},
	],
	contracts: [
		{
			id: "FX-8821",
			pair: "USD/KES",
			amount: "USD 120,000",
			rate: "129.35",
			value: "KES 15.5M",
			expiry: "27 Jun",
			pnl: "+KES 42,000",
			pnlTone: "badgeS",
		},
		{
			id: "FX-8819",
			pair: "EUR/KES",
			amount: "EUR 85,000",
			rate: "139.50",
			value: "KES 11.9M",
			expiry: "14 Jul",
			pnl: "-KES 12,500",
			pnlTone: "badgeD",
		},
		{
			id: "FX-8815",
			pair: "GBP/KES",
			amount: "GBP 45,000",
			rate: "167.80",
			value: "KES 7.6M",
			expiry: "30 Jun",
			pnl: "+KES 8,400",
			pnlTone: "badgeS",
		},
		{
			id: "FX-8810",
			pair: "USD/KES",
			amount: "USD 200,000",
			rate: "128.90",
			value: "KES 25.8M",
			expiry: "15 Jul",
			pnl: "+KES 106,000",
			pnlTone: "badgeS",
		},
	],
	transferRows: [
		{
			date: "27 Jun",
			from: "USD Account",
			to: "KES Account",
			amount: "USD 50,000 → KES 6.47M",
			status: "Settled",
			statusTone: "badgeS",
		},
		{
			date: "26 Jun",
			from: "EUR Account",
			to: "GBP Account",
			amount: "EUR 25,000 → GBP 16,600",
			status: "Settled",
			statusTone: "badgeS",
		},
		{
			date: "25 Jun",
			from: "KES Account",
			to: "UGX Account",
			amount: "KES 5M → UGX 18.6M",
			status: "Pending",
			statusTone: "badgeI",
		},
		{
			date: "24 Jun",
			from: "USD Account",
			to: "EUR Account",
			amount: "USD 85,000 → EUR 78,800",
			status: "Settled",
			statusTone: "badgeS",
		},
	],
	attentionItems: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "USD 45K forward expires today",
			sub: "Contract FX-8821 · action required",
			btnLabel: "Roll",
			modal: "rollContractModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "STR report due for large USD inflow",
			sub: "KES 12.4M from US client",
			btnLabel: "File",
			modal: "complianceModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "GBP volatility alert",
			sub: "1.8% move in 4 hours",
			btnLabel: "Hedge",
			modal: "hedgeModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Hedge ratio below target",
			sub: "68% hedged vs 75% target",
			btnLabel: "Adjust",
			modal: "hedgeModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightbulb",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Lock in USD/KES above 129",
			sub: "Forward rate favourable for 30d",
			btnLabel: "Lock",
			modal: "hedgeModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Roll expiring contracts",
			sub: "2 contracts expiring this week",
			btnLabel: "Roll",
			modal: "rollContractModal",
		},
		{
			icon: "bi-shield-check",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Increase EUR hedge",
			sub: "EUR exposure growing 12% MoM",
			btnLabel: "Hedge",
			modal: "hedgeModal",
		},
		{
			icon: "bi-graph-up-arrow",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "FX P&L trending positive",
			sub: "+KES 184K today • +1.8%",
			btnLabel: "View",
			modal: "marketCommentModal",
		},
	],
	quickActions: [
		{
			icon: "bi-currency-exchange",
			iconColor: "var(--pm-primary)",
			label: "Trade FX",
			modal: "tradeModal",
		},
		{
			icon: "bi-shield",
			iconColor: "var(--pm-accent)",
			label: "Hedge",
			modal: "hedgeModal",
		},
		{
			icon: "bi-arrow-left-right",
			iconColor: "var(--pm-info)",
			label: "Transfer",
			modal: "transferModal",
		},
		{
			icon: "bi-bell",
			iconColor: "var(--pm-warning)",
			label: "Rate Alert",
			modal: "rateAlertModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-purple)",
			label: "Compliance",
			modal: "complianceModal",
		},
		{
			icon: "bi-download",
			iconColor: "var(--pm-muted)",
			label: "Export",
			modal: "reportExportModal",
		},
	],
	settlements: [
		{
			label: "USD 85,000 incoming",
			detail: "From US client • Value date 28 Jun",
			status: "T+2",
			statusTone: "badgeI",
		},
		{
			label: "EUR 42,000 outgoing",
			detail: "Supplier payment • Value date 27 Jun",
			status: "Pending",
			statusTone: "badgeW",
		},
		{
			label: "GBP 18,500 incoming",
			detail: "UK subsidiary • Value date 29 Jun",
			status: "Confirmed",
			statusTone: "badgeS",
		},
		{
			label: "UGX 45M outgoing",
			detail: "Uganda branch payroll • Value date 30 Jun",
			status: "Pending",
			statusTone: "badgeW",
		},
	],
	compliance: [
		{
			area: "USD Exposure",
			status: "Healthy",
			tone: "badgeS",
			filing: "68% hedged",
			deadline: "—",
		},
		{
			area: "GBP Volatility",
			status: "Watch",
			tone: "badgeW",
			filing: "1.8% volatility",
			deadline: "Increase hedge",
		},
		{
			area: "Compliance",
			status: "Action",
			tone: "badgeW",
			filing: "STR pending",
			deadline: "File today",
		},
		{
			area: "Reconciliation",
			status: "Healthy",
			tone: "badgeS",
			filing: "1 exception resolved",
			deadline: "—",
		},
	],
};

/**
 * Frontend-only demo: no /api/business/multi-currency-treasury backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchFXContent(): Promise<FXConfig> {
	try {
		const res = await fetch("/api/business/multi-currency-treasury", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as FXConfig;
	} catch {
		return initialMockData;
	}
}

export default function MultiCurrencyTreasury() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-heart-pulse",
				label: "Health Check",
				onClick: () => setActiveModal("fxHealthModal"),
			},
			{
				icon: "bi-list-check",
				label: "Reconcile",
				onClick: () => setActiveModal("reportExportModal"),
			},
			{
				icon: "bi-arrow-left-right",
				label: "Transfer",
				onClick: () => setActiveModal("transferModal"),
			},
			{
				icon: "bi-currency-exchange",
				label: "Trade FX",
				tone: "primary",
				onClick: () => setActiveModal("tradeModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["business-multi-currency-treasury"],
		queryFn: fetchFXContent,
		staleTime: 5 * 60_000,
		retry: 1,
	});
	const config = apiData ?? initialMockData;

	const s = styles as Record<string, string>;
	const cx = (...cls: (string | false | undefined)[]) =>
		cls.filter(Boolean).join(" ");

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<MultiCurrencyTreasuryBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<MultiCurrencyTreasuryModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<MultiCurrencyTreasuryExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
