"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SettlementModals from "../components/SettlementModals";
import styles from "../styles/settlement.module.css";

/* ============================================================================
   PayMo Settlement & Clearing — merchant settlement workspace (v2)
   Two worlds: CUSTOMER SETTLEMENTS and MY INTERNAL WALLETS
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface NavItem {
	icon: string;
	to: string;
	label: string;
	active?: boolean;
	dot?: boolean;
}

interface StatCard {
	key: string;
	label: string;
	labelColor: string;
	value: string;
	badge: { icon: string; text: string; tone: BadgeTone };
	kind: "bars" | "progress" | "list" | "bordered";
	bars?: { height: string; color: string }[];
	progress?: { label: string; value: string; width: string; color: string }[];
	list?: { label: string; value: string }[];
}

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

interface TableCol {
	key: string;
	label: string;
}

type PermStatus = "granted" | "pending" | "required";

interface BizPermission {
	id: string;
	label: string;
	detail: string;
	status: PermStatus;
}

interface Business {
	id: string;
	name: string;
	type: string;
	status: "Active" | "Pending Setup" | "Suspended";
	customers: number;
	currency: string;
	collected: number;
	payouts: number;
	refunds: number;
	fees: number;
	pending: number;
	float: number;
	minFloat: number;
	feePct: string;
	schedule: string;
	account: string;
	avgTxn: string;
	mix: string;
	permission: BizPermission[];
}

interface Wallet {
	id: string;
	name: string;
	type: string;
	balance: number;
	available: number;
	pending: number;
	icon: string;
	color: string;
	purpose: string;
}

interface TransferRow {
	time: string;
	from: string;
	to: string;
	amount: string;
	status: string;
	tone: BadgeTone;
}

interface RefundRow {
	time: string;
	biz: string;
	customer: string;
	txn: string;
	amount: string;
	reason: string;
	status: string;
	tone: BadgeTone;
}

interface RebalanceRow {
	time: string;
	biz: string;
	from: string;
	amount: string;
	trigger: string;
	status: string;
	tone: BadgeTone;
}

interface SettlementConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: {
		initials: string;
		name: string;
		role: string;
		headerInitials: string;
	};
	breadcrumb: { parents: { label: string; to: string }[]; current: string };
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	hero: { live: string; value: string; detail: string };
	statCards: StatCard[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	channels: { cols: TableCol[]; rows: string[][] };
	exceptionQueue: {
		title: string;
		sub: string;
		actionLabel: string;
		modal: string;
	}[];
	engineHealth: { label: string; value: string }[];
	clearing: {
		title: string;
		windowLabel: string;
		windowStatus: { text: string; tone: BadgeTone };
		cleared: string;
		net: string;
		actionLabel: string;
		actionTone?: "btnPmD";
		modal: string;
	}[];
	reconRows: {
		cols: TableCol[];
		rows: (
			| string
			| { badge: string; tone: BadgeTone }
			| { action: string; modal: string }
		)[][];
	};
	openDisputes: { ref: string; sub: string; modal: string }[];
	trendBars: { height: string; color: string; label: string }[];
	keyMetrics: { label: string; value: string }[];
	autoRules: { title: string; sub: string; status: string; tone: BadgeTone }[];
	nostroPositions: { label: string; value: string }[];
	regReports: { label: string; status: string; tone: BadgeTone }[];
	activity: {
		cols: TableCol[];
		rows: (
			| string
			| { badge: string; tone: BadgeTone }
			| { action: string; modal: string }
		)[][];
	};
	paymoConnected: boolean;
	businesses: Business[];
	wallets: Wallet[];
	transfers: TransferRow[];
	refunds: RefundRow[];
	rebalances: RebalanceRow[];
}

/* ---------- helpers ---------- */
function fmtKES(n: number) {
	if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(2)}B`;
	if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`;
	return `KES ${n.toLocaleString()}`;
}

const LEDGER_COLS: Record<"collections" | "payouts" | "refunds", string[]> = {
	collections: ["Ref", "Business", "Customer", "Method", "Amount", "Status", "Action"],
	payouts: ["Ref", "Business", "To", "Amount", "Fee", "Status", "Action"],
	refunds: ["Ref", "Business", "Customer", "Txn", "Amount", "Status", "Action"],
};

function perms(...statuses: PermStatus[]): BizPermission[] {
	const defs = [
		["Business KYC & onboarding docs", "Registration, directors and tax PIN verified by Paymo"],
		["API / integration scopes", "Create payment links, read transactions, trigger payouts"],
		["Settlement account ownership", "Bank / M-Pesa account name matches business registration"],
		["Fee agreement", "Accepted transaction fee applied to every collection"],
		["Payout schedule consent", "Agreed payout frequency and cut-off times"],
		["Auto-settle float rule", "Float rebalance threshold and funding source approved"],
		["Refund authority", "Who can initiate refunds and the maximum per refund"],
		["Data visibility scope", "What customer data the business can access"],
	] as const;
	return defs.map(([label, detail], i) => ({
		id: `perm-${i + 1}`,
		label,
		detail,
		status: statuses[i] ?? "granted",
	}));
}

/* ---------- typed mock data ---------- */
const initialMockData: SettlementConfig = {
	nav: [
		{ icon: "fa-solid fa-house", to: "/dashboard", label: "Dashboard" },
		{ icon: "fa-solid fa-grid-3", to: "/select-dashboard", label: "Hubs" },
		{ icon: "fa-solid fa-bolt", to: "/initiate-transfer", label: "Transfers" },
		{ icon: "fa-solid fa-wallet", to: "/wallets", label: "Wallets" },
		{ icon: "fa-solid fa-credit-card", to: "/cards", label: "Cards" },
		{ icon: "fa-solid fa-building-columns", to: "/banking", label: "Banking" },
		{
			icon: "fa-solid fa-arrows-left-right",
			to: "/settlement",
			label: "Settlement & Clearing",
			active: true,
			dot: true,
		},
		{ icon: "fa-solid fa-gear", to: "/settings", label: "Settings" },
	],
	headerTitle: "Settlement & Clearing",
	headerSub: "Collections, payouts, refunds and internal wallets across your linked businesses",
	searchPlaceholder: "Search businesses, payouts, refunds, transactions...",
	user: {
		initials: "JK",
		name: "James K.",
		role: "Platform Member",
		headerInitials: "MN",
	},
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/" },
			{ label: "BaaS Transactions", to: "/select-dashboard" },
		],
		current: "Settlement & Clearing",
	},
	pageCode: "",
	paymoConnected: false,
	pageTitle: "Settlement & Clearing",
	pageSub: "Collections, payouts, refunds and internal wallets across your linked businesses.",
	hero: {
		live: "Preview mode",
		value: "KES 0 settled yet",
		detail: "Link your Paymo API key to start processing customer payments.",
	},
	statCards: [
		{
			key: "collected",
			label: "COLLECTED (MTD)",
			labelColor: "var(--pm-accent)",
			value: "KES 99.2M",
			badge: { icon: "fa-solid fa-arrow-down", text: "239 txns", tone: "badgeS" },
			kind: "bars",
			bars: [
				{ height: "85%", color: "var(--pm-primary)" },
				{ height: "60%", color: "var(--pm-info)" },
				{ height: "92%", color: "var(--pm-primary)" },
				{ height: "45%", color: "var(--pm-info)" },
				{ height: "78%", color: "var(--pm-primary)" },
			],
		},
		{
			key: "paid",
			label: "PAID OUT (MTD)",
			labelColor: "var(--pm-info)",
			value: "KES 92.8M",
			badge: { icon: "fa-solid fa-paper-plane", text: "12 batches", tone: "badgeI" },
			kind: "progress",
			progress: [
				{ label: "Land Buyers LTD", value: "KES 81.2M", width: "87%", color: "var(--pm-info)" },
				{ label: "Company 2", value: "KES 11.6M", width: "38%", color: "var(--pm-accent)" },
			],
		},
		{
			key: "refunds",
			label: "REFUNDS & EXCEPTIONS",
			labelColor: "var(--pm-warning)",
			value: "KES 1.96M",
			badge: { icon: "fa-solid fa-rotate-left", text: "3 recent", tone: "badgeW" },
			kind: "list",
			list: [
				{ label: "Pending approval:", value: "1" },
				{ label: "Auto-approved:", value: "2" },
				{ label: "Float low:", value: "1 business" },
			],
		},
	],
	attention: [
		{
			icon: "fa-solid fa-file-circle-xmark",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Land Buyers LTD missing KYC doc",
			sub: "Settlement account verification pending • payouts paused",
			actionLabel: "Review",
			actionTone: "btnPmD",
			modal: "businessDetailModal",
		},
		{
			icon: "fa-solid fa-plug",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Paymo API key not linked",
			sub: "Customer payments can't settle until you connect",
			actionLabel: "Link",
			modal: "linkApiModal",
		},
		{
			icon: "fa-solid fa-triangle-exclamation",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Company 2 float below minimum",
			sub: "KES 640K available • KES 500K min • auto-settle at risk",
			actionLabel: "Rebalance",
			modal: "rebalanceModal",
		},
	],
	suggestions: [
		{
			icon: "fa-solid fa-calendar-check",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Auto-settle Land Buyers LTD on Fridays",
			sub: "Cuts payout fees by 18% vs instant payouts",
			actionLabel: "Enable",
			modal: "autoRulesModal",
		},
		{
			icon: "fa-solid fa-rotate-left",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Enable instant refunds for Company 2",
			sub: "209 customers • auto-approve refunds under KES 5K",
			actionLabel: "Enable",
			modal: "refundModal",
		},
		{
			icon: "fa-solid fa-chart-line",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Schedule daily float top-up at 6 AM",
			sub: "Avoids auto-settle pauses during peak hours",
			actionLabel: "Schedule",
			modal: "internalTransferModal",
		},
	],
	quickActions: [
		{ icon: "fa-solid fa-plug", label: "Link Paymo API", color: "var(--pm-primary)", modal: "linkApiModal" },
		{ icon: "fa-solid fa-paper-plane", label: "New Payout", color: "var(--pm-info)", modal: "payoutModal" },
		{ icon: "fa-solid fa-rotate", label: "Rebalance Float", color: "var(--pm-accent)", modal: "rebalanceModal" },
		{ icon: "fa-solid fa-rotate-left", label: "Issue Refund", color: "var(--pm-warning)", modal: "refundModal" },
		{ icon: "fa-solid fa-wallet", label: "My Wallets", color: "var(--pm-purple)", modal: "internalTransferModal" },
		{ icon: "fa-solid fa-building", label: "Businesses", color: "var(--pm-primary-light)", modal: "businessDetailModal" },
		{ icon: "fa-solid fa-download", label: "Statements", color: "var(--pm-muted)", modal: "generateReportModal" },
		{ icon: "fa-solid fa-gear", label: "Auto Rules", color: "var(--pm-purple)", modal: "autoRulesModal" },
	],
	businesses: [
		{
			id: "land",
			name: "Land Buyers LTD",
			type: "Real Estate",
			status: "Active",
			customers: 30,
			currency: "KES",
			collected: 86400000,
			payouts: 81200000,
			refunds: 1100000,
			fees: 1080000,
			pending: 5200000,
			float: 3200000,
			minFloat: 3000000,
			feePct: "1.25%",
			schedule: "Weekly · Fri",
			account: "Equity Bank • 01-2345678-0",
			avgTxn: "KES 1.9M",
			mix: "Bank 60% · M-Pesa 40%",
			permission: perms("granted", "granted", "pending", "granted", "granted", "granted", "granted", "granted"),
		},
		{
			id: "company2",
			name: "Company 2",
			type: "Retail",
			status: "Active",
			customers: 209,
			currency: "KES",
			collected: 12800000,
			payouts: 11600000,
			refunds: 860000,
			fees: 256000,
			pending: 1200000,
			float: 640000,
			minFloat: 500000,
			feePct: "2.0%",
			schedule: "Daily",
			account: "PayMo Wallet • BIZ-88213",
			avgTxn: "KES 1,900",
			mix: "M-Pesa 78% · Card 22%",
			permission: perms(),
		},
	],
	wallets: [
		{
			id: "biz",
			name: "Business Wallet",
			type: "Operational",
			balance: 4820000,
			available: 4820000,
			pending: 1150000,
			icon: "fa-solid fa-briefcase",
			color: "var(--pm-primary)",
			purpose: "Funds payouts and business float",
		},
		{
			id: "virt",
			name: "Virtual Wallet",
			type: "Personal",
			balance: 1240000,
			available: 1240000,
			pending: 0,
			icon: "fa-solid fa-wallet",
			color: "var(--pm-purple)",
			purpose: "Your money — withdraw or transfer anytime",
		},
	],
	transfers: [
		{
			time: "Today 09:12",
			from: "Business Wallet",
			to: "Virtual Wallet",
			amount: "KES 150,000",
			status: "Completed",
			tone: "badgeS",
		},
		{
			time: "Today 08:45",
			from: "Virtual Wallet",
			to: "Equity Bank",
			amount: "KES 90,000",
			status: "Completed",
			tone: "badgeS",
		},
		{
			time: "Today 08:02",
			from: "Business Wallet",
			to: "Land Buyers Float",
			amount: "KES 3,000,000",
			status: "In Progress",
			tone: "badgeI",
		},
	],
	refunds: [
		{
			time: "Today 14:05",
			biz: "Company 2",
			customer: "J. Otieno",
			txn: "ORD-8834",
			amount: "KES 12,400",
			reason: "Customer returned item",
			status: "Completed",
			tone: "badgeS",
		},
		{
			time: "Today 13:20",
			biz: "Land Buyers LTD",
			customer: "Plot #PLT-117",
			txn: "INV-7742",
			amount: "KES 1,050,000",
			reason: "Plot cancelled — deposit refund",
			status: "Pending Approval",
			tone: "badgeW",
		},
		{
			time: "Today 11:48",
			biz: "Company 2",
			customer: "A. Mwangi",
			txn: "ORD-8791",
			amount: "KES 4,800",
			reason: "Wrong item shipped",
			status: "Completed",
			tone: "badgeS",
		},
	],
	rebalances: [
		{
			time: "Today 09:15",
			biz: "Land Buyers LTD",
			from: "Business Wallet",
			amount: "KES 3,000,000",
			trigger: "Manual",
			status: "Completed",
			tone: "badgeS",
		},
		{
			time: "Today 08:30",
			biz: "Company 2",
			from: "Business Wallet",
			amount: "KES 640,000",
			trigger: "Auto (below KES 500K)",
			status: "Completed",
			tone: "badgeS",
		},
	],
	channels: {
		cols: [
			{ key: "channel", label: "Channel" },
			{ key: "volume", label: "Volume Today" },
			{ key: "success", label: "Success" },
			{ key: "pending", label: "Pending" },
			{ key: "avg", label: "Avg Time" },
			{ key: "status", label: "Status" },
		],
		rows: [
			["RTGS (KES)", "KES 1.42B", "B:s:99.4%", "KES 92M", "42m", "B:s:Healthy"],
			["PesaLink", "KES 984M", "B:s:99.9%", "KES 41M", "8s", "B:s:Healthy"],
			["EFT / ACH", "KES 312M", "B:w:98.1%", "KES 51M", "3.2h", "B:w:Delayed"],
			["SWIFT (Cross-border)", "USD 4.8M", "B:s:100%", "USD 0.2M", "4.1h", "B:s:Healthy"],
		],
	},
	exceptionQueue: [
		{ title: "Failed settlements", sub: "14 items • KES 18.4M", actionLabel: "Retry All", modal: "retrySettlementModal" },
		{ title: "Partial settlements", sub: "8 items • KES 6.2M", actionLabel: "Resolve", modal: "partialSettlementModal" },
		{ title: "Compliance holds", sub: "3 items • KES 42M", actionLabel: "Review", modal: "complianceReportModal" },
		{ title: "Duplicate detections", sub: "2 items • KES 1.8M", actionLabel: "Investigate", modal: "disputeModal" },
	],
	engineHealth: [
		{ label: "Throughput", value: "184 tx/min" },
		{ label: "Queue Depth", value: "47 pending" },
		{ label: "Auto-retry Success", value: "94.2%" },
		{ label: "Manual Intervention", value: "3 cases" },
	],
	clearing: [
		{
			title: "PesaLink Clearing",
			windowLabel: "Closes in 2h 14m",
			windowStatus: { text: "Open", tone: "badgeS" },
			cleared: "892 / 920",
			net: "+KES 184M",
			actionLabel: "Manage PesaLink",
			modal: "pesaLinkModal",
		},
		{
			title: "RTGS Clearing",
			windowLabel: "Closes in 47m",
			windowStatus: { text: "Closing Soon", tone: "badgeW" },
			cleared: "214 / 261",
			net: "-KES 92M",
			actionLabel: "Urgent Submit",
			actionTone: "btnPmD",
			modal: "rtgsUrgentModal",
		},
	],
	reconRows: {
		cols: [
			{ key: "batch", label: "Batch" },
			{ key: "expected", label: "Expected" },
			{ key: "actual", label: "Actual" },
			{ key: "variance", label: "Variance" },
			{ key: "status", label: "Status" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"C:BAT-21092",
				"KES 184.2M",
				"KES 184.2M",
				{ badge: "0", tone: "badgeS" },
				{ badge: "Matched", tone: "badgeS" },
				{ action: "View", modal: "reconciliationDetailModal" },
			],
			[
				"C:BAT-21093",
				"KES 67.8M",
				"KES 65.1M",
				{ badge: "-KES 2.7M", tone: "badgeD" },
				{ badge: "Exception", tone: "badgeW" },
				{ action: "Investigate", modal: "disputeModal" },
			],
		],
	},
	openDisputes: [
		{ ref: "#SET-44892", sub: "Co-op vs KCB • KES 2.1M", modal: "disputeModal" },
		{ ref: "#SET-44889", sub: "Equity vs Absa • KES 1.8M", modal: "disputeModal" },
	],
	trendBars: [
		{ height: "65%", color: "var(--pm-primary)", label: "Mon" },
		{ height: "78%", color: "var(--pm-primary)", label: "Tue" },
		{ height: "92%", color: "var(--pm-accent)", label: "Wed" },
		{ height: "85%", color: "var(--pm-primary)", label: "Thu" },
		{ height: "70%", color: "var(--pm-info)", label: "Fri" },
		{ height: "55%", color: "var(--pm-warning)", label: "Sat" },
		{ height: "48%", color: "var(--pm-info)", label: "Sun" },
	],
	keyMetrics: [
		{ label: "Total Settled (MTD)", value: "KES 41.2B" },
		{ label: "Average Fee per txn", value: "KES 42" },
		{ label: "Failed Rate", value: "0.31%" },
		{ label: "Regulatory Reports Filed", value: "28 / 31" },
	],
	autoRules: [
		{
			title: "Auto-settle Land Buyers LTD payouts",
			sub: "Weekly • Friday 15:00 • min float KES 3M",
			status: "Active",
			tone: "badgeS",
		},
		{
			title: "Auto-rebalance float below minimum",
			sub: "Refill from Business Wallet • all businesses",
			status: "Active",
			tone: "badgeS",
		},
		{
			title: "Instant refunds under KES 5K",
			sub: "Company 2 • no manual approval needed",
			status: "Paused",
			tone: "badgeW",
		},
	],
	nostroPositions: [
		{ label: "USD Nostro (Citibank NY)", value: "USD 8.4M" },
		{ label: "EUR Nostro (Deutsche Bank)", value: "EUR 3.2M" },
		{ label: "GBP Nostro (HSBC London)", value: "GBP 1.1M" },
	],
	regReports: [
		{ label: "CBK Daily Settlement Return", status: "Submitted", tone: "badgeS" },
		{ label: "KRA Withholding Tax", status: "Due in 2 days", tone: "badgeW" },
		{ label: "AML Large Transaction Report", status: "Submitted", tone: "badgeS" },
	],
	activity: {
		cols: [
			{ key: "time", label: "Time" },
			{ key: "world", label: "World" },
			{ key: "ref", label: "Ref" },
			{ key: "activity", label: "Activity" },
			{ key: "amount", label: "Amount" },
			{ key: "status", label: "Status" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"14:32",
				"W:C",
				"C:SET-88422",
				"Company 2 payout → M-Pesa",
				"STR:KES 1,240,000",
				{ badge: "Paid Out", tone: "badgeS" },
				{ action: "Receipt", modal: "settlementDetailModal" },
			],
			[
				"14:28",
				"W:I",
				"C:TW-9921",
				"Business Wallet → Virtual Wallet",
				"STR:KES 150,000",
				{ badge: "Completed", tone: "badgeS" },
				{ action: "View", modal: "settlementDetailModal" },
			],
			[
				"14:15",
				"W:C",
				"C:SET-88421",
				"Land Buyers collection → float",
				"STR:KES 4,500,000",
				{ badge: "Collected", tone: "badgeI" },
				{ action: "Track", modal: "settlementDetailModal" },
			],
		],
	},
};

type Cell =
	| string
	| { badge: string; tone: BadgeTone }
	| { action: string; modal: string; tone?: string };

async function fetchSettlement(): Promise<SettlementConfig> {
	const res = await fetch("/api/settlement");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<SettlementConfig>;
	return { ...initialMockData, ...json };
}

function CellValue({ cell, onOpen }: { cell: Cell; onOpen: (id: string) => void }) {
	if (typeof cell === "string") {
		if (cell.startsWith("W:")) {
			const isCustomer = cell === "W:C";
			return (
				<span className={`${styles.flowTag} ${isCustomer ? styles.flowCustomer : styles.flowInternal}`}>
					<i className={`fa-solid ${isCustomer ? "fa-users" : "fa-wallet"}`} />
					{isCustomer ? "Customer" : "Internal"}
				</span>
			);
		}
		if (cell.startsWith("C:")) return <code>{cell.slice(2)}</code>;
		if (cell.startsWith("B:")) {
			const [, tone, text] = cell.split(":");
			const toneClass =
				tone === "s" ? styles.badgeS : tone === "w" ? styles.badgeW : tone === "d" ? styles.badgeD : tone === "i" ? styles.badgeI : styles.badgeP;
			return <span className={`${styles.badge} ${toneClass}`}>{text}</span>;
		}
		if (cell.startsWith("STR:")) return <strong>{cell.slice(4)}</strong>;
		return <>{cell}</>;
	}
	if ("badge" in cell) return <span className={`${styles.badge} ${styles[cell.tone]}`}>{cell.badge}</span>;
	return (
		<button className={`${styles.btnPm} ${styles.btnSm} ${cell.tone ? styles[cell.tone as "btnPmD"] : ""}`} onClick={() => onOpen(cell.modal)}>
			{cell.action}
		</button>
	);
}

export default function Settlement() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["paymo-settlement"],
		queryFn: fetchSettlement,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [errorDismissed, setErrorDismissed] = useState(false);
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [world, setWorld] = useState<"customers" | "internal">("customers");
	const [biz, setBiz] = useState<string>("all");
	const [ledgerTab, setLedgerTab] = useState<"collections" | "payouts" | "refunds">("collections");

	const bizData = biz === "all" ? config.businesses : config.businesses.filter((b) => b.id === biz);
	const bizLabel = biz === "all" ? "All businesses" : (bizData[0]?.name ?? "");
	const sum = (k: keyof Business) => bizData.reduce((a, b) => a + (typeof b[k] === "number" ? (b[k] as number) : 0), 0);
	const totalCustomers = bizData.reduce((a, b) => a + b.customers, 0);

	const worldStats: { label: string; color: string; value: string; icon: string; sub: string; tone: BadgeTone }[] =
		world === "customers"
			? [
					{ label: "COLLECTED (RECOVERED)", color: "var(--pm-accent)", value: fmtKES(sum("collected")), icon: "fa-solid fa-arrow-down", sub: `${bizLabel} · ${totalCustomers} customers`, tone: "badgeS" },
					{ label: "PAID OUT TO BUSINESSES", color: "var(--pm-info)", value: fmtKES(sum("payouts")), icon: "fa-solid fa-paper-plane", sub: `next ${fmtKES(sum("pending"))}`, tone: "badgeI" },
					{ label: "REFUNDS ISSUED", color: "var(--pm-warning)", value: fmtKES(sum("refunds")), icon: "fa-solid fa-rotate-left", sub: `${config.refunds.length} recent`, tone: "badgeW" },
					{ label: "NET EARNED (FEES)", color: "var(--pm-primary)", value: fmtKES(sum("fees")), icon: "fa-solid fa-piggy-bank", sub: "your earnings MTD", tone: "badgeS" },
					{ label: "PENDING PAYOUT", color: "var(--pm-purple)", value: fmtKES(sum("pending")), icon: "fa-solid fa-hourglass-half", sub: `${bizData.length} business(es)`, tone: "badgeP" },
					{ label: "FLOAT AVAILABLE", color: "var(--pm-warning)", value: fmtKES(sum("float")), icon: "fa-solid fa-droplet", sub: "auto-settle ready", tone: "badgeS" },
				]
			: [
					{ label: "TOTAL WALLET BALANCE", color: "var(--pm-accent)", value: fmtKES(config.wallets.reduce((a, w) => a + w.balance, 0)), icon: "fa-solid fa-wallet", sub: "Business + Virtual", tone: "badgeS" },
					{ label: "AVAILABLE NOW", color: "var(--pm-info)", value: fmtKES(config.wallets.reduce((a, w) => a + w.available, 0)), icon: "fa-solid fa-circle-check", sub: "no holds", tone: "badgeS" },
					{ label: "PENDING SETTLEMENT", color: "var(--pm-warning)", value: fmtKES(config.wallets.reduce((a, w) => a + w.pending, 0)), icon: "fa-solid fa-hourglass-half", sub: "clearing", tone: "badgeW" },
					{ label: "FLOAT COMMITTED", color: "var(--pm-purple)", value: fmtKES(sum("float")), icon: "fa-solid fa-droplet", sub: `${config.businesses.length} businesses`, tone: "badgeP" },
					{ label: "TRANSFERS (MTD)", color: "var(--pm-primary)", value: `${config.transfers.length + 15}`, icon: "fa-solid fa-arrows-left-right", sub: "KES 4.2M moved", tone: "badgeS" },
					{ label: "WITHDRAWALS (MTD)", color: "var(--pm-muted)", value: "3", icon: "fa-solid fa-building-columns", sub: "KES 620K to bank", tone: "badgeI" },
				];

	const ledgerRows = ({
		collections: [
			["C:COL-5501", "Land Buyers LTD", "Plot #PLT-091", "Bank transfer", "KES 4,500,000", "Collected", "settlementDetailModal", "View"],
			["C:COL-5502", "Company 2", "Order #ORD-8901", "M-Pesa", "KES 12,400", "Collected", "settlementDetailModal", "View"],
			["C:COL-5503", "Company 2", "Order #ORD-8899", "Card", "KES 48,200", "Pending", "settlementDetailModal", "View"],
			["C:COL-5504", "Land Buyers LTD", "Installment • PLT-088", "Bank transfer", "KES 2,250,000", "Collected", "settlementDetailModal", "View"],
		],
		payouts: [
			["PO-9920", "Land Buyers LTD", "Equity • 01-2345678-0", "KES 41,200,000", "KES 515,000", "Paid Out", "payoutModal", "Receipt"],
			["PO-9919", "Company 2", "PayMo Wallet BIZ-88213", "KES 1,240,000", "KES 24,800", "Paid Out", "payoutModal", "Receipt"],
			["PO-9918", "Company 2", "PayMo Wallet BIZ-88213", "KES 1,180,000", "KES 23,600", "Scheduled", "payoutModal", "View"],
			["PO-9917", "Land Buyers LTD", "Equity • 01-2345678-0", "KES 40,000,000", "KES 500,000", "Paid Out", "payoutModal", "Receipt"],
		],
		refunds: [
			["RF-4412", "Company 2", "J. Otieno", "ORD-8834", "KES 12,400", "Completed", "refundModal", "View"],
			["RF-4411", "Land Buyers LTD", "Plot #PLT-117", "INV-7742", "KES 1,050,000", "Pending Approval", "refundModal", "Approve"],
			["RF-4410", "Company 2", "A. Mwangi", "ORD-8791", "KES 4,800", "Completed", "refundModal", "View"],
		],
	} as Record<"collections" | "payouts" | "refunds", string[][]>)[ledgerTab].filter((r) => biz === "all" || r[1] === (bizData[0]?.name ?? ""));

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const modalId = params.get("modal");
		if (modalId) openM(modalId);
	}, []);

	return (
		<div className={styles.settlementPage}>
			{error && !errorDismissed && (
				<div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
					<strong>Could not load settlement data.</strong> Showing the built-in defaults.{" "}
					<span className="text-decoration-underline">{String((error as Error).message ?? "")}</span>
					<button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
				</div>
			)}
			{isLoading && (
				<div className={styles.loadingOverlay}>
					<div className={styles.loadingBox}>
						<div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
						Loading settlement workspace…
					</div>
				</div>
			)}
			<div className={styles.main}>
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
						<h2 className={styles.pageH2}>{config.pageTitle}</h2>
						<p className={styles.pageSub}>{config.pageSub}</p>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button className={styles.btnPm} onClick={() => openM("linkApiModal")}>
							<i className="fa-solid fa-plug" /> Link API
						</button>
						<button className={styles.btnPm} onClick={() => openM("generateReportModal")}>
							<i className="fa-solid fa-download" /> Statements
						</button>
						<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM("payoutModal")}>
							<i className="fa-solid fa-plus" /> New Payout
						</button>
					</div>
				</div>
				<div className={styles.content}>
					{!config.paymoConnected && (
						<div className={styles.connBanner}>
							<div className={styles.connIcon}>
								<i className="fa-solid fa-plug" />
							</div>
							<div className={styles.connText}>
								<div className={styles.connTitle}>Paymo not connected yet</div>
								<div className={styles.connSub}>
									Link your API key to start collecting and settling customer payments. You're currently viewing preview data.
								</div>
							</div>
							<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => openM("linkApiModal")}>
								<i className="fa-solid fa-key" /> Link API Key
							</button>
							<span className={styles.connTag}>
								<i className="fa-solid fa-circle" style={{ fontSize: 8, color: "#86efac" }} /> Sandbox preview
							</span>
						</div>
					)}
					<div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 12 }}>
						<div className={styles.worldSwitch}>
							<button className={`${styles.worldBtn} ${world === "customers" ? styles.worldBtnActive : ""}`} onClick={() => setWorld("customers")}>
								<i className="fa-solid fa-users" /> Customer Settlements
							</button>
							<button className={`${styles.worldBtn} ${world === "internal" ? styles.worldBtnActive : ""}`} onClick={() => setWorld("internal")}>
								<i className="fa-solid fa-wallet" /> My Wallets & Internal
							</button>
						</div>
						{world === "customers" && (
							<div className={styles.bizBar}>
								<button className={`${styles.bizPill} ${biz === "all" ? styles.bizPillActive : ""}`} onClick={() => setBiz("all")}>
									All Businesses <span className={styles.bizCount}>2</span>
								</button>
								{config.businesses.map((b) => (
									<button key={b.id} className={`${styles.bizPill} ${biz === b.id ? styles.bizPillActive : ""}`} onClick={() => setBiz(b.id)}>
										{b.name} <span className={styles.bizCount}>{b.customers}</span>
									</button>
								))}
								<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("businessDetailModal")}>
									<i className="fa-solid fa-plus" /> Link Business
								</button>
							</div>
						)}
					</div>
					<div className="row g-3">
						{worldStats.map((s) => (
							<div className="col-lg-2 col-md-4 col-6" key={s.label}>
								<div className={styles.card} style={{ minHeight: 128 }}>
									<p className={styles.sl} style={{ color: s.color }}>
										{s.label}
									</p>
									<div className={styles.sv} style={{ margin: "6px 0", fontSize: 18 }}>
										{s.value}
									</div>
									<span className={`${styles.badge} ${styles[s.tone]}`}>
										<i className={s.icon} /> {s.sub}
									</span>
								</div>
							</div>
						))}
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.st}>
										<i className="fa-solid fa-exclamation-circle" style={{ color: "var(--pm-warning)" }} /> Attention Required
									</h3>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("attentionModal")}>
										View all
									</button>
								</div>
								{config.attention.map((item) => (
									<div className={styles.sr} key={item.title}>
										<div className="d-flex align-items-center gap-3">
											<div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
												<i className={item.icon} />
											</div>
											<div>
												<div className={styles.fwBold13}>{item.title}</div>
												<div className={styles.mutedSmall}>{item.sub}</div>
											</div>
										</div>
										<button className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ""}`} onClick={() => openM(item.modal)}>
											{item.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.st}>
										<i className="fa-solid fa-lightbulb" style={{ color: "var(--pm-primary)" }} /> Smart Suggestions
									</h3>
									<span className={`${styles.badge} ${styles.badgeP}`}>
										<i className="fa-solid fa-sparkles" /> AI
									</span>
								</div>
								{config.suggestions.map((item) => (
									<div className={styles.sr} key={item.title}>
										<div className="d-flex align-items-center gap-3">
											<div className={styles.iconCircle} style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
												<i className={item.icon} />
											</div>
											<div>
												<div className={styles.fwBold13}>{item.title}</div>
												<div className={styles.mutedSmall}>{item.sub}</div>
											</div>
										</div>
										<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(item.modal)}>
											{item.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="mb-3">
									<h3 className={styles.st}>
										<i className="fa-solid fa-bolt" style={{ color: "var(--pm-accent)" }} /> Quick Actions
									</h3>
									<p className={styles.ss}>Frequent settlement workflows</p>
								</div>
								<div className={styles.qaGrid}>
									{config.quickActions.map((qa) => (
										<button className={styles.qaBtn} key={qa.label} onClick={() => openM(qa.modal)}>
											<i className={qa.icon} style={{ color: qa.color }} />
											<span>{qa.label}</span>
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
					{world === "customers" && (
						<div className={styles.card}>
							<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
								<div>
									<h3 className={styles.st}>
										<i className="fa-solid fa-building" style={{ color: "var(--pm-primary-light)" }} /> Linked Businesses
									</h3>
									<p className={styles.ss}>
										{config.businesses.length} businesses collecting through your Paymo account. Manage customers, permissions and ledgers.
									</p>
								</div>
								<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM("businessDetailModal")}>
									<i className="fa-solid fa-plus" /> Link New Business
								</button>
							</div>
							<div className="row g-3">
								{config.businesses.map((b) => {
									const granted = b.permission.filter((p) => p.status === "granted").length;
									const permPct = Math.round((granted / b.permission.length) * 100);
									const floatPct = Math.min(100, Math.round((b.float / b.minFloat) * 100));
									const lowFloat = b.float <= b.minFloat * 1.1;
									return (
										<div className="col-lg-6" key={b.id}>
											<div className={`${styles.card} ${styles.bizCard} h-100`}>
												<div className={styles.bizHead}>
													<div>
														<h4 className={styles.bizName}>{b.name}</h4>
														<p className={styles.bizType}>
															{b.type} • {b.customers} customers • {b.schedule}
														</p>
													</div>
													<span className={`${styles.badge} ${lowFloat ? styles.badgeW : styles.badgeS}`}>
														<i className={`fa-solid ${lowFloat ? "fa-triangle-exclamation" : "fa-circle-check"}`} /> {b.status}
													</span>
												</div>
												<div className={styles.bizKpis}>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Collected</div>
														<div className={styles.bizKpiValue} style={{ color: "var(--pm-accent)" }}>
															{fmtKES(b.collected)}
														</div>
													</div>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Paid Out</div>
														<div className={styles.bizKpiValue} style={{ color: "var(--pm-info)" }}>
															{fmtKES(b.payouts)}
														</div>
													</div>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Refunds</div>
														<div className={styles.bizKpiValue} style={{ color: "var(--pm-warning)" }}>
															{fmtKES(b.refunds)}
														</div>
													</div>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Fee ({b.feePct})</div>
														<div className={styles.bizKpiValue} style={{ color: "var(--pm-primary)" }}>
															{fmtKES(b.fees)}
														</div>
													</div>
												</div>
												<div className={styles.permTrack}>
													<i className="fa-solid fa-shield-halved" style={{ color: "var(--pm-primary)" }} />
													<span>Permissions {granted}/{b.permission.length}</span>
													<div className={styles.permBar}>
														<div className={styles.permFill} style={{ width: `${permPct}%` }} />
													</div>
												</div>
												<div className={styles.floatMeter}>
													<i className="fa-solid fa-droplet" style={{ color: "var(--pm-info)" }} />
													<span>Float {fmtKES(b.float)} / min {fmtKES(b.minFloat)}</span>
													<div className={styles.permBar}>
														<div className={`${styles.floatFill} ${lowFloat ? styles.floatLow : ""}`} style={{ width: `${floatPct}%` }} />
													</div>
												</div>
												<div className="d-flex flex-wrap" style={{ gap: 8 }}>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("businessDetailModal")}>
														<i className="fa-solid fa-eye" /> Manage
													</button>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("payoutModal")}>
														<i className="fa-solid fa-paper-plane" /> Payout
													</button>
													<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM("rebalanceModal")}>
														<i className="fa-solid fa-rotate" /> Rebalance
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
					{world === "customers" && (
						<div className={styles.card}>
							<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
								<div>
									<h3 className={styles.st}>
										<i className="fa-solid fa-arrows-left-right" style={{ color: "var(--pm-info)" }} /> Collections, Payouts & Refunds
									</h3>
									<p className={styles.ss}>
										{bizLabel} — clear split between money recovered from customers and money sent to your businesses.
									</p>
								</div>
								<div className={styles.pills}>
									{(["collections", "payouts", "refunds"] as const).map((t) => (
										<button key={t} className={`${styles.pill} ${ledgerTab === t ? styles.pillActive : ""}`} onClick={() => setLedgerTab(t)}>
											{t.charAt(0).toUpperCase() + t.slice(1)}
										</button>
									))}
								</div>
							</div>
							<div className="table-responsive">
								<table className={styles.tbl}>
									<thead>
										<tr>{LEDGER_COLS[ledgerTab].map((c) => <th key={c}>{c}</th>)}</tr>
									</thead>
									<tbody>
										{ledgerRows.map((r, i) => (
											<tr key={i}>
												<td>{r[0]}</td>
												<td>{r[1]}</td>
												<td>{r[2]}</td>
												<td>{r[3]}</td>
												<td><strong>{r[4]}</strong></td>
												<td><span className={`${styles.badge} ${styles[r[5] as BadgeTone]}`}>{r[5]}</span></td>
												<td>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(r[6])}>
														{r[7]}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
					{world === "customers" && (
						<div className={styles.card}>
							<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
								<div>
									<h3 className={styles.st}>
										<i className="fa-solid fa-droplet" style={{ color: "var(--pm-info)" }} /> Rebalance & Float
									</h3>
									<p className={styles.ss}>Fund auto-settlement — move money from your wallets into each business's settlement float.</p>
								</div>
								<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM("rebalanceModal")}>
									<i className="fa-solid fa-rotate" /> Rebalance Now
								</button>
							</div>
							<div className="row g-3">
								<div className="col-lg-7">
									<div className={styles.ub}>
										<h4 className={styles.ubTitle}>Float Levels</h4>
										{config.businesses.map((b) => {
											const floatPct = Math.min(100, Math.round((b.float / b.minFloat) * 100));
											const low = b.float <= b.minFloat * 1.1;
											return (
												<div className={styles.sr} key={b.id}>
													<div style={{ flex: 1 }}>
														<strong>{b.name}</strong>
														<div className={styles.floatMeter} style={{ marginTop: 6 }}>
															<div className={styles.permBar}>
																<div className={`${styles.floatFill} ${low ? styles.floatLow : ""}`} style={{ width: `${floatPct}%` }} />
															</div>
															<span>{fmtKES(b.float)} / {fmtKES(b.minFloat)}</span>
														</div>
													</div>
													<button className={`${styles.btnPm} ${styles.btnSm} ${low ? styles.btnPmD : ""}`} onClick={() => openM("rebalanceModal")}>
														<i className="fa-solid fa-rotate" /> Rebalance
													</button>
												</div>
											);
										})}
									</div>
								</div>
								<div className="col-lg-5">
									<div className={styles.ub}>
										<h4 className={styles.ubTitle}>Recent Rebalances</h4>
										{config.rebalances.map((r) => (
											<div className={styles.sr} key={r.time + r.biz}>
												<div>
													<strong>{r.biz}</strong>
													<div className={styles.mutedSmall}>
														{r.from} • {r.trigger} • {r.time}
													</div>
												</div>
												<div style={{ textAlign: "right" }}>
													<strong>{r.amount}</strong>
													<div>
														<span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					)}
					{world === "internal" && (
						<>
							<div className={styles.card}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
									<div>
										<h3 className={styles.st}>
											<i className="fa-solid fa-wallet" style={{ color: "var(--pm-purple)" }} /> My Wallets
										</h3>
										<p className={styles.ss}>Your own money on Paymo — fund floats, pay yourself, or withdraw to your bank.</p>
									</div>
									<div className="d-flex" style={{ gap: 8 }}>
										<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("walletTopUpModal")}>
											<i className="fa-solid fa-plus" /> Top Up
										</button>
										<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => openM("internalTransferModal")}>
											<i className="fa-solid fa-paper-plane" /> Send Money
										</button>
									</div>
								</div>
								<div className="row g-3">
									{config.wallets.map((w) => (
										<div className="col-lg-6" key={w.id}>
											<div className={`${styles.card} ${styles.walletCard} h-100`}>
												<div className={styles.bizHead}>
													<div className="d-flex align-items-center gap-3">
														<div className={styles.walletIcon} style={{ background: "var(--pm-accent-soft)", color: w.color }}>
															<i className={w.icon} />
														</div>
														<div>
															<h4 className={styles.bizName} style={{ margin: 0 }}>{w.name}</h4>
															<p className={styles.bizType} style={{ margin: 0 }}>
																{w.type} • {w.purpose}
															</p>
														</div>
													</div>
													<span className={`${styles.badge} ${styles.badgeS}`}>
														<i className="fa-solid fa-circle-check" /> Active
													</span>
												</div>
												<div className={styles.walletBalance}>{fmtKES(w.balance)}</div>
												<div className={styles.walletRow}>
													<span>Available</span>
													<strong>{fmtKES(w.available)}</strong>
												</div>
												<div className={styles.walletRow}>
													<span>Pending settlement</span>
													<strong>{fmtKES(w.pending)}</strong>
												</div>
												<div className="d-flex flex-wrap" style={{ gap: 8 }}>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("walletTopUpModal")}>
														<i className="fa-solid fa-plus" /> Top Up
													</button>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("internalTransferModal")}>
														<i className="fa-solid fa-paper-plane" /> Send
													</button>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("internalTransferModal")}>
														<i className="fa-solid fa-building-columns" /> Withdraw
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
							<div className={styles.card}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={styles.st}>
										<i className="fa-solid fa-arrows-left-right" style={{ color: "var(--pm-info)" }} /> Internal Transfers
									</h3>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("internalTransferModal")}>
										<i className="fa-solid fa-plus" /> New Transfer
									</button>
								</div>
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead>
											<tr><th>Time</th><th>From</th><th>To</th><th>Amount</th><th>Status</th></tr>
										</thead>
										<tbody>
											{config.transfers.map((t) => (
												<tr key={t.time + t.from}>
													<td>{t.time}</td>
													<td>{t.from}</td>
													<td>{t.to}</td>
													<td><strong>{t.amount}</strong></td>
													<td><span className={`${styles.badge} ${styles[t.tone]}`}>{t.status}</span></td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</>
					)}
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
							<div>
								<h3 className={styles.st}>
									<i className="fa-solid fa-list-check" style={{ color: "var(--pm-purple)" }} /> Reconciliation & Dispute Resolution
								</h3>
								<p className={styles.ss}>Match collections against payouts, handle exceptions, and manage the full dispute lifecycle.</p>
							</div>
							<div className="d-flex" style={{ gap: 8 }}>
								<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("reconciliationWizardModal")}>
									Start Reconciliation
								</button>
								<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("disputeModal")}>
									New Dispute
								</button>
							</div>
						</div>
						<div className="row g-3">
							<div className="col-lg-7">
								<div className={styles.ub}>
									<h4 className={styles.ubTitle}>Reconciliation Summary</h4>
									<div className="table-responsive">
										<table className={styles.tbl}>
											<thead>
												<tr>{config.reconRows.cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
											</thead>
											<tbody>
												{config.reconRows.rows.map((row, i) => (
													<tr key={i}>
														{row.map((cell, j) => (
															<td key={j}><CellValue cell={cell} onOpen={openM} /></td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
							<div className="col-lg-5">
								<div className={styles.ub}>
									<h4 className={styles.ubTitle}>Open Disputes</h4>
									{config.openDisputes.map((d) => (
										<div className={styles.sr} key={d.ref}>
											<div>
												<strong>{d.ref}</strong>
												<div className={styles.mutedSmall}>{d.sub}</div>
											</div>
											<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(d.modal)}>
												Resolve
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
							<div>
								<h3 className={styles.st}>
									<i className="fa-solid fa-chart-bar" style={{ color: "var(--pm-info)" }} /> Settlement Reports & Analytics
								</h3>
								<p className={styles.ss}>Per-business statements, fee earnings, refund analysis and rebalance history.</p>
							</div>
							<div className="d-flex" style={{ gap: 8 }}>
								<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("generateReportModal")}>
									Generate Report
								</button>
							</div>
						</div>
						<div className="row g-3">
							<div className="col-lg-8">
								<div className={styles.ub}>
									<h4 className={styles.ubTitle}>7-Day Settlement Trend</h4>
									<div className={styles.chartBars}>
										{config.trendBars.map((b) => (
											<div key={b.label} className={styles.chartBar} style={{ height: b.height, background: b.color }}>
												<span className={styles.barLabel}>{b.label}</span>
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="col-lg-4">
								<div className={styles.ub}>
									<h4 className={styles.ubTitle}>Key Metrics</h4>
									{config.keyMetrics.map((m) => (
										<div className={styles.sr} key={m.label}>
											<div><strong>{m.label}</strong></div>
											<strong>{m.value}</strong>
										</div>
									))}
									<button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => openM("complianceReportModal")}>
										View Compliance
									</button>
								</div>
							</div>
						</div>
					</div>
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
							<div>
								<h3 className={styles.st}>
									<i className="fa-solid fa-gear" style={{ color: "var(--pm-warning)" }} /> Automated Settlement Rules
								</h3>
								<p className={styles.ss}>Auto-settle payouts, rebalance floats, and route refunds — per business.</p>
							</div>
							<div className="d-flex" style={{ gap: 8 }}>
								<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("autoRulesModal")}>
									Manage Rules
								</button>
							</div>
						</div>
						<div className="row g-3">
							<div className="col-12">
								<div className={styles.ub}>
									<h4 className={styles.ubTitle}>Active Automation Rules</h4>
									{config.autoRules.map((r) => (
										<div className={styles.sr} key={r.title}>
											<div>
												<strong>{r.title}</strong>
												<div className={styles.mutedSmall}>{r.sub}</div>
											</div>
											<span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
							<div>
								<h3 className={styles.st}>
									<i className="fa-solid fa-shield-halved" style={{ color: "var(--pm-purple)" }} /> Business Onboarding & Permissions
								</h3>
								<p className={styles.ss}>Track what every linked business must grant before settlement runs for their customers.</p>
							</div>
							<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("businessDetailModal")}>
								<i className="fa-solid fa-eye" /> View Permissions
							</button>
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr><th>Business</th><th>Customers</th><th>KYC Docs</th><th>Permissions</th><th>Settlement Account</th><th>Fee</th><th>Schedule</th><th>Action</th></tr>
								</thead>
								<tbody>
									{config.businesses.map((b) => {
										const granted = b.permission.filter((p) => p.status === "granted").length;
										const permPct = Math.round((granted / b.permission.length) * 100);
										const kyc = b.permission[0].status === "granted" ? "Verified" : "Pending";
										return (
											<tr key={b.id}>
												<td><strong>{b.name}</strong></td>
												<td>{b.customers}</td>
												<td><span className={`${styles.badge} ${kyc === "Verified" ? styles.badgeS : styles.badgeW}`}>{kyc}</span></td>
												<td style={{ minWidth: 140 }}>
													<div className="d-flex align-items-center gap-2">
														<div className={styles.permBar} style={{ width: 70 }}>
															<div className={styles.permFill} style={{ width: `${permPct}%` }} />
														</div>
														<span className={styles.mutedSmall}>{granted}/{b.permission.length}</span>
													</div>
												</td>
												<td className={styles.mutedSmall}>{b.account}</td>
												<td>{b.feePct}</td>
												<td>{b.schedule}</td>
												<td>
													<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("businessDetailModal")}>
														Manage
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h3 className={styles.st}>
								<i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--pm-muted)" }} /> Recent Settlement Activity
							</h3>
							<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("activityLogModal")}>
								Full Log
							</button>
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>{config.activity.cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
								</thead>
								<tbody>
									{config.activity.rows.map((row, i) => (
										<tr key={i}>
											{row.map((cell, j) => (
												<td key={j}><CellValue cell={cell} onOpen={openM} /></td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<SettlementModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
