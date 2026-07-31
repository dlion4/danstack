import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import TreasuryCashBody from "../components/TreasuryCashBody";
import TreasuryCashExtraModals from "../components/TreasuryCashExtraModals";
import TreasuryCashModals from "../components/TreasuryCashModals";
import styles from "../styles/treasury-cash.module.css";

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
interface NavItem {
	icon: string;
	title: string;
	active?: boolean;
	dot?: boolean;
}
interface HeroStat {
	key: string;
	col: string;
	label: string;
	labelColor?: string;
	value: string;
	badge?: { icon: string; text: string; tone: BadgeTone };
	progress?: { percent: number; color: string };
	miniBars?: { height: string; color: string }[];
	extra?: { label: string; value: string }[];
}
interface FeedItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	btnLabel: string;
	btnClass?: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	iconColor: string;
	label: string;
	modal: string;
}
interface AccountRow {
	bank: string;
	account: string;
	balance: string;
	type: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface TransferRow {
	id: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface FXRow {
	pair: string;
	rate: string;
	exposure: string;
	direction: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface InvestmentRow {
	type: string;
	amount: string;
	yieldRate: string;
	maturity: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface User {
	initials: string;
	name: string;
	role: string;
	avatarBg: string;
}
interface TreasuryConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; current: string };
	pageTitle: string;
	pageSub: string;
	heroStats: HeroStat[];
	attentionItems: FeedItem[];
	quickActions: QuickAction[];
	accounts: AccountRow[];
	transfers: TransferRow[];
	fxPositions: FXRow[];
	investments: InvestmentRow[];
}

const initialMockData: TreasuryConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-shop", title: "Collections" },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-send", title: "Disbursements" },
		{ icon: "bi-file-earmark-minus", title: "Accounts Payable" },
		{ icon: "bi-bank", title: "Treasury", active: true, dot: true },
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Corporate Solutions Ltd",
	headerSub: "6 Managed Accounts · Treasury Engine",
	searchPlaceholder: "Search accounts, transfers, FX positions, investments...",
	user: {
		initials: "EA",
		name: "Esther A.",
		role: "CFO / Treasury",
		avatarBg: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
	},
	breadcrumb: { parent: "Business Portal", current: "Treasury & Cash" },
	pageTitle: "PAGE 3.7 — Treasury, Cash Management & Forex",
	pageSub:
		"Manage cash positions, inter-account transfers, FX, and investment portfolio.",
	heroStats: [
		{
			key: "cash",
			col: "col-lg-4",
			label: "CASH POSITION",
			labelColor: "rgba(255,255,255,.78)",
			value: "KES 8.45M",
			badge: { icon: "bi-bank", text: "6 accounts", tone: "badgeI" },
			progress: { percent: 55, color: "var(--pm-accent)" },
		},
		{
			key: "mmf",
			col: "col-lg-2 col-md-4 col-6",
			label: "MMF POSITION",
			value: "KES 3.2M",
			badge: { icon: "bi-graph-up", text: "+11% yield", tone: "badgeS" },
		},
		{
			key: "fx",
			col: "col-lg-3 col-md-4 col-6",
			label: "FX EXPOSURE",
			labelColor: "var(--pm-warning)",
			value: "USD 42K",
			badge: { icon: "bi-arrow-down", text: "KES 129.10", tone: "badgeW" },
			miniBars: [
				{ height: "40%", color: "var(--pm-primary)" },
				{ height: "70%", color: "var(--pm-warning)" },
				{ height: "55%", color: "var(--pm-accent)" },
			],
		},
		{
			key: "sweep",
			col: "col-lg-3 col-md-4",
			label: "AUTO-SWEEP STATUS",
			value: "Active",
			badge: { icon: "bi-check-circle", text: "Running daily", tone: "badgeS" },
		},
	],
	attentionItems: [
		{
			icon: "bi-shield-lock",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "3 Sweeps Require Approval",
			sub: "KES 4.2M target balancing transfers",
			btnLabel: "Review",
			modal: "approvalQueueModal",
		},
		{
			icon: "bi-graph-down-arrow",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "USD/KES Dropped to 129.10",
			sub: "Hit target alert for vendor payment",
			btnLabel: "Trade",
			modal: "bookFXModal",
		},
		{
			icon: "bi-calendar-check",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "T-Bill Maturity Tomorrow",
			sub: "KES 5.0M principal + interest",
			btnLabel: "Action",
			modal: "investmentPortfolioModal",
		},
		{
			icon: "bi-arrow-left-right",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Unreconciled Bank Statement",
			sub: "Equity Bank main op account",
			btnLabel: "Fix",
			modal: "reconciliationModal",
		},
	],
	quickActions: [
		{
			icon: "bi-arrow-left-right",
			iconColor: "var(--pm-primary)",
			label: "Transfer",
			modal: "transferFundsModal",
		},
		{
			icon: "bi-plus-circle",
			iconColor: "var(--pm-accent)",
			label: "Add Account",
			modal: "addAccountModal",
		},
		{
			icon: "bi-currency-exchange",
			iconColor: "var(--pm-warning)",
			label: "Book FX",
			modal: "bookFXModal",
		},
		{
			icon: "bi-globe2",
			iconColor: "var(--pm-info)",
			label: "Cross Border",
			modal: "crossBorderModal",
		},
		{
			icon: "bi-graph-up-arrow",
			iconColor: "var(--pm-purple)",
			label: "Invest",
			modal: "investCashModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconColor: "var(--pm-accent)",
			label: "Sweep",
			modal: "sweepSetupModal",
		},
		{
			icon: "bi-arrow-left-right",
			iconColor: "var(--pm-muted)",
			label: "Reconcile",
			modal: "reconciliationModal",
		},
		{
			icon: "bi-clock-history",
			iconColor: "var(--pm-primary)",
			label: "Auto-Sweep",
			modal: "autoSweepModal",
		},
	],
	accounts: [
		{
			bank: "Equity Bank",
			account: "Main Operations",
			balance: "KES 4.2M",
			type: "Operating",
			status: "Healthy",
			statusTone: "badgeS",
			modal: "accountDetailModal",
		},
		{
			bank: "KCB",
			account: "Business Savings",
			balance: "KES 2.8M",
			type: "Savings",
			status: "Healthy",
			statusTone: "badgeS",
			modal: "accountDetailModal",
		},
		{
			bank: "NCBA",
			account: "Payroll Disbursement",
			balance: "KES 1.45M",
			type: "Payroll",
			status: "Healthy",
			statusTone: "badgeS",
			modal: "accountDetailModal",
		},
		{
			bank: "Co-op Bank",
			account: "FX Reserve",
			balance: "USD 42K",
			type: "FX",
			status: "Alert",
			statusTone: "badgeW",
			modal: "accountDetailModal",
		},
	],
	transfers: [
		{
			id: "TRF-0041",
			from: "Equity → KCB",
			to: "Savings",
			amount: "KES 500K",
			status: "Completed",
			statusTone: "badgeS",
			modal: "accountDetailModal",
		},
		{
			id: "TRF-0040",
			from: "KCB → NCBA",
			to: "Payroll",
			amount: "KES 1.4M",
			status: "Pending",
			statusTone: "badgeW",
			modal: "approvalQueueModal",
		},
		{
			id: "TRF-0039",
			from: "Co-op → Equity",
			to: "FX Settlement",
			amount: "USD 10K",
			status: "Completed",
			statusTone: "badgeS",
			modal: "accountDetailModal",
		},
	],
	fxPositions: [
		{
			pair: "USD/KES",
			rate: "129.10",
			exposure: "USD 42K",
			direction: "Short USD",
			status: "Active",
			statusTone: "badgeW",
			modal: "bookFXModal",
		},
		{
			pair: "EUR/KES",
			rate: "140.25",
			exposure: "EUR 5K",
			direction: "Neutral",
			status: "No exposure",
			statusTone: "badgeI",
			modal: "bookFXModal",
		},
		{
			pair: "GBP/KES",
			rate: "162.80",
			exposure: "GBP 2K",
			direction: "Long GBP",
			status: "Profit",
			statusTone: "badgeS",
			modal: "bookFXModal",
		},
	],
	investments: [
		{
			type: "MMF (CIC)",
			amount: "KES 3.2M",
			yieldRate: "11% p.a.",
			maturity: "Open",
			status: "Active",
			statusTone: "badgeS",
			modal: "investmentPortfolioModal",
		},
		{
			type: "T-Bill 182-day",
			amount: "KES 5.0M",
			yieldRate: "12.5%",
			maturity: "Tomorrow",
			status: "Maturing",
			statusTone: "badgeW",
			modal: "investmentPortfolioModal",
		},
		{
			type: "Fixed Deposit",
			amount: "KES 2.0M",
			yieldRate: "9%",
			maturity: "30 Aug 2025",
			status: "Locked",
			statusTone: "badgeI",
			modal: "investmentPortfolioModal",
		},
	],
};

/**
 * Frontend-only demo: no /api/business-dashboard/treasury-cash backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchTreasuryData(): Promise<TreasuryConfig> {
	try {
		const res = await fetch("/api/business-dashboard/treasury-cash", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as TreasuryConfig;
	} catch {
		return initialMockData;
	}
}

export default function TreasuryCash() {
	const s = styles as Record<string, string>;
	const cx = (...cls: (string | false | undefined)[]) =>
		cls.filter(Boolean).join(" ");
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-ui-checks",
				label: "Pending Approvals",
				onClick: () => setActiveModal("approvalQueueModal"),
			},
			{
				icon: "bi-graph-up",
				label: "Forecast",
				onClick: () => setActiveModal("cashflowForecastModal"),
			},
			{
				icon: "bi-arrow-left-right",
				label: "Internal Transfer",
				onClick: () => setActiveModal("transferFundsModal"),
			},
			{
				icon: "bi-currency-exchange",
				label: "Book FX Trade",
				tone: "primary",
				onClick: () => setActiveModal("bookFXModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["treasury-cash"],
		queryFn: fetchTreasuryData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
	const config = apiData ?? initialMockData;

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<TreasuryCashBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<TreasuryCashModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<TreasuryCashExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
