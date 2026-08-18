import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import OpenBankingBody from "../components/OpenBankingBody";
import OpenBankingExtraModals from "../components/OpenBankingExtraModals";
import OpenBankingExtraSections from "../components/OpenBankingExtraSections";
import OpenBankingModals from "../components/OpenBankingModals";
import styles from "../styles/open-banking.module.css";

/* ============================================================================
   PayMo BaaS — Open Banking & Account Aggregation (legacy page 3.10)
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
interface BankAccount {
	bank: string;
	account: string;
	type: string;
	balance: string;
	status: string;
	statusTone: BadgeTone;
	consent: string;
	sync: string;
	color: string;
}
interface TransferRow {
	date: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
	ref: string;
}
interface StandingOrder {
	label: string;
	detail: string;
	modal: string;
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
interface ReconMatch {
	desc: string;
	amount: string;
	bank: string;
	confidence: number;
	status: string;
	statusTone: BadgeTone;
}
interface NotifItem {
	bg: string;
	textColor: string;
	title: string;
	sub: string;
}

interface OBConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle?: string;
	pageSub?: string;
	bankAccounts: BankAccount[];
	transferRows: TransferRow[];
	standingOrders: StandingOrder[];
	attentionItems: AttentionItem[];
	suggestions: SuggestionItem[];
	quickActions: QuickAction[];
	reconMatches: ReconMatch[];
	notifications: NotifItem[];
}

const initialMockData: OBConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", title: "Overview" },
		{ icon: "bi-lightning-charge", title: "Payments" },
		{ icon: "bi-wallet2", title: "Treasury" },
		{ icon: "bi-credit-card-2-front", title: "Cards" },
		{ icon: "bi-bank2", title: "Open Banking", active: true, dot: true },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Open Banking & Account Aggregation",
	headerSub:
		"Linked bank accounts, consolidated cash view, PesaLink transfers, transaction analytics and reconciliation",
	searchPlaceholder:
		"Search linked accounts, banks, transactions, reconciliation...",
	user: { initials: "JK", name: "James K.", role: "Treasury Manager" },
	breadcrumb: {
		parent: "Business Portal",
		mid: "Treasury",
		current: "Open Banking",
	},
	// // pageTitle: "Open Banking & Account Aggregation",
	// pageSub:
	// 	"Connect bank accounts via PesaLink, view consolidated cash positions, execute instant transfers, reconcile transactions, and analyse multi-bank cash flow — all within a single secure dashboard.",
	bankAccounts: [
		{
			bank: "Equity Bank",
			account: "****4521",
			type: "Business Current",
			balance: "KES 4,250,000",
			status: "Active",
			statusTone: "badgeS",
			consent: "Valid",
			sync: "Live",
			color: "var(--pm-danger)",
		},
		{
			bank: "KCB Bank",
			account: "****7782",
			type: "Business Current",
			balance: "KES 42,100",
			status: "Active",
			statusTone: "badgeW",
			consent: "Valid",
			sync: "Live",
			color: "var(--pm-accent)",
		},
		{
			bank: "Co-op Bank",
			account: "****3390",
			type: "Savings",
			balance: "KES 8,900,000",
			status: "Active",
			statusTone: "badgeS",
			consent: "Expiring",
			sync: "Live",
			color: "var(--pm-info)",
		},
		{
			bank: "Stanbic Bank",
			account: "****9912",
			type: "Business Current",
			balance: "KES 1,850,000",
			status: "Active",
			statusTone: "badgeS",
			consent: "Valid",
			sync: "Live",
			color: "var(--pm-purple)",
		},
		{
			bank: "NCBA Bank",
			account: "****1128",
			type: "Call Deposit",
			balance: "KES 2,400,000",
			status: "Active",
			statusTone: "badgeS",
			consent: "Valid",
			sync: "Live",
			color: "var(--pm-warning)",
		},
		{
			bank: "Family Bank",
			account: "****5543",
			type: "Business Current",
			balance: "KES 0",
			status: "Link Expired",
			statusTone: "badgeD",
			consent: "Expired",
			sync: "Paused",
			color: "var(--pm-muted)",
		},
		{
			bank: "I&M Bank",
			account: "****6671",
			type: "Foreign Currency",
			balance: "USD 12,500",
			status: "Active",
			statusTone: "badgeS",
			consent: "Valid",
			sync: "Live",
			color: "var(--pm-accent)",
		},
	],
	transferRows: [
		{
			date: "27 Jun 14:32",
			from: "Equity",
			to: "KCB",
			amount: "KES 850,000",
			status: "Instant",
			statusTone: "badgeS",
			ref: "PL-442189",
		},
		{
			date: "27 Jun 11:04",
			from: "Co-op",
			to: "Equity",
			amount: "KES 1,200,000",
			status: "Instant",
			statusTone: "badgeS",
			ref: "PL-442155",
		},
		{
			date: "26 Jun 16:55",
			from: "Stanbic",
			to: "NCBA",
			amount: "KES 320,000",
			status: "Instant",
			statusTone: "badgeS",
			ref: "PL-441902",
		},
		{
			date: "26 Jun 09:12",
			from: "Equity",
			to: "Family",
			amount: "KES 500,000",
			status: "Pending",
			statusTone: "badgeI",
			ref: "PL-441784",
		},
	],
	standingOrders: [
		{
			label: "Payroll to KCB",
			detail: "KES 2.4M • Every 25th",
			modal: "scheduleTransferModal",
		},
		{
			label: "Rent to NCBA",
			detail: "KES 185K • Monthly 1st",
			modal: "scheduleTransferModal",
		},
		{
			label: "Utilities to Equity",
			detail: "KES 320K • Auto",
			modal: "scheduleTransferModal",
		},
		{
			label: "Insurance to Stanbic",
			detail: "KES 92K • Quarterly",
			modal: "scheduleTransferModal",
		},
	],
	attentionItems: [
		{
			icon: "bi-bank",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "KCB account balance below minimum",
			sub: "KES 42,100 · minimum KES 50,000",
			btnLabel: "Top-up",
			modal: "transferModal",
		},
		{
			icon: "bi-list-check",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "14 unreconciled transactions",
			sub: "Equity & Stanbic accounts",
			btnLabel: "Reconcile",
			modal: "reconcileModal",
		},
		{
			icon: "bi-clock",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Co-op consent expires in 7 days",
			sub: "Re-authenticate before 04 Jul",
			btnLabel: "Renew",
			modal: "connectBankModal",
		},
		{
			icon: "bi-exclamation-diamond",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Family Bank link expired",
			sub: "Reconnect to resume sync",
			btnLabel: "Reconnect",
			modal: "reauthModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightbulb",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Close 3 low-activity accounts",
			sub: "Save KES 18,200/year in fees",
			btnLabel: "Optimize",
			modal: "optimizeModal",
		},
		{
			icon: "bi-shield-check",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Enable auto-reconciliation",
			sub: "Match 94% of transactions automatically",
			btnLabel: "Enable",
			modal: "obSettingsModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Consolidate idle balances",
			sub: "KES 2.1M in low-interest accounts",
			btnLabel: "Move",
			modal: "transferModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Schedule bulk transfers",
			sub: "Save 2 hours/week on recurring payments",
			btnLabel: "Setup",
			modal: "scheduleTransferModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-lg",
			iconColor: "var(--pm-primary)",
			label: "Connect Bank",
			modal: "connectBankModal",
		},
		{
			icon: "bi-arrow-left-right",
			iconColor: "var(--pm-accent)",
			label: "Transfer",
			modal: "transferModal",
		},
		{
			icon: "bi-list-check",
			iconColor: "var(--pm-info)",
			label: "Reconcile",
			modal: "reconcileModal",
		},
		{
			icon: "bi-clock",
			iconColor: "var(--pm-warning)",
			label: "Schedule",
			modal: "scheduleTransferModal",
		},
		{
			icon: "bi-download",
			iconColor: "var(--pm-purple)",
			label: "Export",
			modal: "exportStatementModal",
		},
		{
			icon: "bi-gear",
			iconColor: "var(--pm-muted)",
			label: "Settings",
			modal: "obSettingsModal",
		},
	],
	reconMatches: [
		{
			desc: "Invoice INV-4421 • ABC Ltd",
			amount: "KES 1,850,000",
			bank: "Equity",
			confidence: 98,
			status: "Matched",
			statusTone: "badgeS",
		},
		{
			desc: "Supplier payment • XYZ Corp",
			amount: "KES 425,000",
			bank: "Co-op",
			confidence: 95,
			status: "Matched",
			statusTone: "badgeS",
		},
		{
			desc: "Unknown credit",
			amount: "KES 120,000",
			bank: "Stanbic",
			confidence: 45,
			status: "Unmatched",
			statusTone: "badgeW",
		},
		{
			desc: "Duplicate debit",
			amount: "KES 85,000",
			bank: "Equity",
			confidence: 0,
			status: "Exception",
			statusTone: "badgeD",
		},
	],
	notifications: [
		{
			bg: "var(--pm-danger-soft)",
			textColor: "#7F1D1D",
			title: "KCB balance below minimum",
			sub: "KES 42,100 (min KES 50,000)",
		},
		{
			bg: "var(--pm-warning-soft)",
			textColor: "#92400E",
			title: "Co-op consent expires in 7 days",
			sub: "Re-authenticate before 04 Jul",
		},
		{
			bg: "var(--pm-info-soft)",
			textColor: "#1E40AF",
			title: "14 transactions unmatched",
			sub: "Requires reconciliation review",
		},
		{
			bg: "var(--pm-accent-soft)",
			textColor: "#065F46",
			title: "Transfer PL-442189 completed",
			sub: "KES 850,000 to KCB ****7782",
		},
		{
			bg: "#fff",
			textColor: "var(--pm-muted)",
			title: "Family Bank link expired",
			sub: "Reconnect to resume sync",
		},
	],
};

/**
 * Frontend-only demo: no /api/business/open-banking backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchOBContent(): Promise<OBConfig> {
	try {
		const res = await fetch("/api/business/open-banking", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as OBConfig;
	} catch {
		return initialMockData;
	}
}

export default function OpenBanking() {
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
				onClick: () => setActiveModal("healthCheckModal"),
			},
			{
				icon: "bi-bell",
				label: "Alerts",
				onClick: () => setActiveModal("notifModal"),
			},
			{
				icon: "bi-arrow-left-right",
				label: "Transfer",
				onClick: () => setActiveModal("transferModal"),
			},
			{
				icon: "bi-plus-lg",
				label: "Connect Bank",
				tone: "primary",
				onClick: () => setActiveModal("connectBankModal"),
			},
		],
		[setActiveModal],
	);

	useQuery({
		queryKey: ["business-open-banking"],
		queryFn: fetchOBContent,
		staleTime: 5 * 60_000,
		retry: 1,
	});

	const s = styles as Record<string, string>;

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<OpenBankingBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
				<OpenBankingExtraSections onOpen={setActiveModal} />
			</div>

			{/* MODALS */}
			<OpenBankingModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<OpenBankingExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
