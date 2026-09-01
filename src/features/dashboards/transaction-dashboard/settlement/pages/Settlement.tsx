"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import AttentionHubFab from "../../shared/components/AttentionHubFab";
import type {
	AttentionItem as DrawerAttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import SettlementModals from "../components/SettlementModals";
import styles from "../styles/settlement.module.css";

/* ============================================================================
   PayMo Settlement & Clearing — payment-facilitator settlement workspace
   Two worlds: CUSTOMER SETTLEMENTS and MY INTERNAL WALLETS.
   Business-dashboard design language (navy/emerald, Sora + Inter, 16px cards).
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

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
	pageTitle: string;
	pageSub: string;
	heroTag: string;
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
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
	collections: [
		"Ref",
		"Business",
		"Customer",
		"Method",
		"Amount",
		"Status",
		"Action",
	],
	payouts: ["Ref", "Business", "To", "Amount", "Fee", "Status", "Action"],
	refunds: ["Ref", "Business", "Customer", "Txn", "Amount", "Status", "Action"],
};

function perms(...statuses: PermStatus[]): BizPermission[] {
	const defs = [
		[
			"Business KYC & onboarding docs",
			"Registration, directors and tax PIN verified by Paymo",
		],
		[
			"API / integration scopes",
			"Create payment links, read transactions, trigger payouts",
		],
		[
			"Settlement account ownership",
			"Bank / M-Pesa account name matches business registration",
		],
		["Fee agreement", "Accepted transaction fee applied to every collection"],
		["Payout schedule consent", "Agreed payout frequency and cut-off times"],
		[
			"Auto-settle float rule",
			"Float rebalance threshold and funding source approved",
		],
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
	paymoConnected: false,
	pageTitle: "Settlement & Clearing",
	pageSub:
		"Collections, payouts, refunds and internal wallets across your linked businesses.",
	heroTag: "Preview mode",
	attention: [
		{
			icon: "bi bi-file-earmark-x",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Land Buyers LTD missing KYC doc",
			sub: "Settlement account verification pending • payouts paused",
			actionLabel: "Review",
			actionTone: "btnPmD",
			modal: "businessDetailModal",
		},
		{
			icon: "bi bi-plug",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Paymo API key not linked",
			sub: "Customer payments can't settle until you connect",
			actionLabel: "Link",
			modal: "linkApiModal",
		},
		{
			icon: "bi bi-exclamation-triangle",
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
			icon: "bi bi-calendar-check",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Auto-settle Land Buyers LTD on Fridays",
			sub: "Cuts payout fees by 18% vs instant payouts",
			actionLabel: "Enable",
			modal: "autoRulesModal",
		},
		{
			icon: "bi bi-arrow-counterclockwise",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Enable instant refunds for Company 2",
			sub: "209 customers • auto-approve refunds under KES 5K",
			actionLabel: "Enable",
			modal: "refundModal",
		},
		{
			icon: "bi bi-graph-up",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Schedule daily float top-up at 6 AM",
			sub: "Avoids auto-settle pauses during peak hours",
			actionLabel: "Schedule",
			modal: "internalTransferModal",
		},
	],
	quickActions: [
		{
			icon: "bi bi-plug",
			label: "Link Paymo API",
			color: "var(--pm-primary)",
			modal: "linkApiModal",
		},
		{
			icon: "bi bi-send",
			label: "New Payout",
			color: "var(--pm-info)",
			modal: "payoutModal",
		},
		{
			icon: "bi bi-arrow-clockwise",
			label: "Rebalance Float",
			color: "var(--pm-accent)",
			modal: "rebalanceModal",
		},
		{
			icon: "bi bi-arrow-counterclockwise",
			label: "Issue Refund",
			color: "var(--pm-warning)",
			modal: "refundModal",
		},
		{
			icon: "bi bi-wallet2",
			label: "My Wallets",
			color: "var(--pm-purple)",
			modal: "internalTransferModal",
		},
		{
			icon: "bi bi-building",
			label: "Businesses",
			color: "var(--pm-primary-light)",
			modal: "businessDetailModal",
		},
		{
			icon: "bi bi-download",
			label: "Statements",
			color: "var(--pm-muted)",
			modal: "generateReportModal",
		},
		{
			icon: "bi bi-gear",
			label: "Auto Rules",
			color: "var(--pm-purple)",
			modal: "autoRulesModal",
		},
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
			permission: perms(
				"granted",
				"granted",
				"pending",
				"granted",
				"granted",
				"granted",
				"granted",
				"granted",
			),
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
			icon: "bi bi-briefcase",
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
			icon: "bi bi-wallet2",
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
		{
			ref: "#SET-44892",
			sub: "Co-op vs KCB • KES 2.1M",
			modal: "disputeModal",
		},
		{
			ref: "#SET-44889",
			sub: "Equity vs Absa • KES 1.8M",
			modal: "disputeModal",
		},
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

function ledgerTone(status: string): BadgeTone {
	if (status === "Paid Out" || status === "Collected" || status === "Completed")
		return "badgeS";
	if (
		status === "Pending" ||
		status === "Scheduled" ||
		status === "Pending Approval"
	)
		return "badgeW";
	return "badgeI";
}

function cellKey(cell: Cell): string {
	if (typeof cell === "string") return cell;
	if ("badge" in cell) return `b:${cell.badge}`;
	return `a:${cell.action}`;
}

function CellValue({
	cell,
	onOpen,
}: {
	cell: Cell;
	onOpen: (id: string) => void;
}) {
	if (typeof cell === "string") {
		if (cell.startsWith("W:")) {
			const isCustomer = cell === "W:C";
			return (
				<span
					className={`${styles.flowTag} ${isCustomer ? styles.flowCustomer : styles.flowInternal}`}
				>
					<i
						className={`bi ${isCustomer ? "bi-people" : "bi-wallet2"}`}
						aria-hidden="true"
					/>
					{isCustomer ? "Customer" : "Internal"}
				</span>
			);
		}
		if (cell.startsWith("C:")) return <code>{cell.slice(2)}</code>;
		if (cell.startsWith("B:")) {
			const [, tone, text] = cell.split(":");
			const toneClass =
				tone === "s"
					? styles.badgeS
					: tone === "w"
						? styles.badgeW
						: tone === "d"
							? styles.badgeD
							: tone === "i"
								? styles.badgeI
								: styles.badgeP;
			return <span className={`${styles.badge} ${toneClass}`}>{text}</span>;
		}
		if (cell.startsWith("STR:")) return <strong>{cell.slice(4)}</strong>;
		return <>{cell}</>;
	}
	if ("badge" in cell)
		return (
			<span className={`${styles.badge} ${styles[cell.tone]}`}>
				{cell.badge}
			</span>
		);
	return (
		<button
			type="button"
			className={`${styles.btnPm} ${styles.btnSm} ${cell.tone ? styles[cell.tone as "btnPmD"] : ""}`}
			onClick={() => onOpen(cell.modal)}
		>
			{cell.action}
		</button>
	);
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

export default function Settlement() {
	const { data } = useQuery({
		queryKey: ["paymo-settlement"],
		queryFn: fetchSettlement,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [world, setWorld] = useState<"customers" | "internal">("customers");
	const [biz, setBiz] = useState<string>("all");
	const [ledgerTab, setLedgerTab] = useState<
		"collections" | "payouts" | "refunds"
	>("collections");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);
	const handleDrawerAction = (modal: string) => {
		if (modal) openM(modal);
	};
	const toDrawerItem = (item: SrItem): DrawerAttentionItem => ({
		icon: item.icon.replace(/^bi-/, ""),
		iconBg: item.iconBg,
		iconColor: item.iconColor,
		title: item.title,
		sub: item.sub,
		actionLabel: item.actionLabel,
		modal: item.modal,
	});
	const drawerAttention = config.attention.map(toDrawerItem);
	const drawerSuggestions = config.suggestions.map(toDrawerItem);
	const drawerQuickActions = config.quickActions.map(
		(action): QuickActionItem => ({
			icon: action.icon.replace(/^bi-/, ""),
			iconColor: action.color,
			label: action.label,
			modal: action.modal,
		}),
	);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const modalId = params.get("modal");
		if (modalId) setActiveModal(modalId);
	}, []);

	const bizData =
		biz === "all"
			? config.businesses
			: config.businesses.filter((b) => b.id === biz);
	const bizLabel = biz === "all" ? "All businesses" : (bizData[0]?.name ?? "");
	const sum = (k: keyof Business) =>
		bizData.reduce(
			(a, b) => a + (typeof b[k] === "number" ? (b[k] as number) : 0),
			0,
		);
	const totalCustomers = bizData.reduce((a, b) => a + b.customers, 0);

	const worldStats: {
		label: string;
		color: string;
		value: string;
		icon: string;
		iconCls: string;
		sub: string;
		tone: BadgeTone;
	}[] =
		world === "customers"
			? [
					{
						label: "Collected (recovered)",
						color: "var(--pm-accent)",
						value: fmtKES(sum("collected")),
						icon: "bi-arrow-down",
						iconCls: styles.kpiIconGreen,
						sub: `${bizLabel} · ${totalCustomers} customers`,
						tone: "badgeS",
					},
					{
						label: "Paid out to businesses",
						color: "var(--pm-info)",
						value: fmtKES(sum("payouts")),
						icon: "bi-send",
						iconCls: styles.kpiIconBlue,
						sub: `next ${fmtKES(sum("pending"))}`,
						tone: "badgeI",
					},
					{
						label: "Refunds issued",
						color: "var(--pm-warning)",
						value: fmtKES(sum("refunds")),
						icon: "bi-arrow-counterclockwise",
						iconCls: styles.kpiIconAmber,
						sub: `${config.refunds.length} recent`,
						tone: "badgeW",
					},
					{
						label: "Net earned (fees)",
						color: "var(--pm-primary)",
						value: fmtKES(sum("fees")),
						icon: "bi-piggy-bank",
						iconCls: styles.kpiIconGreen,
						sub: "your earnings MTD",
						tone: "badgeS",
					},
					{
						label: "Pending payout",
						color: "var(--pm-purple)",
						value: fmtKES(sum("pending")),
						icon: "bi-hourglass-split",
						iconCls: styles.kpiIconPurple,
						sub: `${bizData.length} business(es)`,
						tone: "badgeP",
					},
					{
						label: "Float available",
						color: "var(--pm-warning)",
						value: fmtKES(sum("float")),
						icon: "bi-droplet",
						iconCls: styles.kpiIconAmber,
						sub: "auto-settle ready",
						tone: "badgeS",
					},
				]
			: [
					{
						label: "Total wallet balance",
						color: "var(--pm-accent)",
						value: fmtKES(config.wallets.reduce((a, w) => a + w.balance, 0)),
						icon: "bi-wallet2",
						iconCls: styles.kpiIconGreen,
						sub: "Business + Virtual",
						tone: "badgeS",
					},
					{
						label: "Available now",
						color: "var(--pm-info)",
						value: fmtKES(config.wallets.reduce((a, w) => a + w.available, 0)),
						icon: "bi-check-circle",
						iconCls: styles.kpiIconBlue,
						sub: "no holds",
						tone: "badgeS",
					},
					{
						label: "Pending settlement",
						color: "var(--pm-warning)",
						value: fmtKES(config.wallets.reduce((a, w) => a + w.pending, 0)),
						icon: "bi-hourglass-split",
						iconCls: styles.kpiIconAmber,
						sub: "clearing",
						tone: "badgeW",
					},
					{
						label: "Float committed",
						color: "var(--pm-purple)",
						value: fmtKES(sum("float")),
						icon: "bi-droplet",
						iconCls: styles.kpiIconPurple,
						sub: `${config.businesses.length} businesses`,
						tone: "badgeP",
					},
					{
						label: "Transfers (MTD)",
						color: "var(--pm-primary)",
						value: `${config.transfers.length + 15}`,
						icon: "bi-arrow-left-right",
						iconCls: styles.kpiIconGreen,
						sub: "KES 4.2M moved",
						tone: "badgeS",
					},
					{
						label: "Withdrawals (MTD)",
						color: "var(--pm-muted)",
						value: "3",
						icon: "bi-bank",
						iconCls: styles.kpiIconSlate,
						sub: "KES 620K to bank",
						tone: "badgeI",
					},
				];

	const ledgerRows = (
		{
			collections: [
				[
					"C:COL-5501",
					"Land Buyers LTD",
					"Plot #PLT-091",
					"Bank transfer",
					"KES 4,500,000",
					"Collected",
					"settlementDetailModal",
					"View",
				],
				[
					"C:COL-5502",
					"Company 2",
					"Order #ORD-8901",
					"M-Pesa",
					"KES 12,400",
					"Collected",
					"settlementDetailModal",
					"View",
				],
				[
					"C:COL-5503",
					"Company 2",
					"Order #ORD-8899",
					"Card",
					"KES 48,200",
					"Pending",
					"settlementDetailModal",
					"View",
				],
				[
					"C:COL-5504",
					"Land Buyers LTD",
					"Installment • PLT-088",
					"Bank transfer",
					"KES 2,250,000",
					"Collected",
					"settlementDetailModal",
					"View",
				],
			],
			payouts: [
				[
					"PO-9920",
					"Land Buyers LTD",
					"Equity • 01-2345678-0",
					"KES 41,200,000",
					"KES 515,000",
					"Paid Out",
					"payoutModal",
					"Receipt",
				],
				[
					"PO-9919",
					"Company 2",
					"PayMo Wallet BIZ-88213",
					"KES 1,240,000",
					"KES 24,800",
					"Paid Out",
					"payoutModal",
					"Receipt",
				],
				[
					"PO-9918",
					"Company 2",
					"PayMo Wallet BIZ-88213",
					"KES 1,180,000",
					"KES 23,600",
					"Scheduled",
					"payoutModal",
					"View",
				],
				[
					"PO-9917",
					"Land Buyers LTD",
					"Equity • 01-2345678-0",
					"KES 40,000,000",
					"KES 500,000",
					"Paid Out",
					"payoutModal",
					"Receipt",
				],
			],
			refunds: [
				[
					"RF-4412",
					"Company 2",
					"J. Otieno",
					"ORD-8834",
					"KES 12,400",
					"Completed",
					"refundModal",
					"View",
				],
				[
					"RF-4411",
					"Land Buyers LTD",
					"Plot #PLT-117",
					"INV-7742",
					"KES 1,050,000",
					"Pending Approval",
					"refundModal",
					"Approve",
				],
				[
					"RF-4410",
					"Company 2",
					"A. Mwangi",
					"ORD-8791",
					"KES 4,800",
					"Completed",
					"refundModal",
					"View",
				],
			],
		} as Record<"collections" | "payouts" | "refunds", string[][]>
	)[ledgerTab].filter(
		(r) => biz === "all" || r[1] === (bizData[0]?.name ?? ""),
	);

	const kpiToneClass = (tone: BadgeTone) =>
		tone === "badgeS"
			? styles.badgeS
			: tone === "badgeW"
				? styles.badgeW
				: tone === "badgeD"
					? styles.badgeD
					: tone === "badgeI"
						? styles.badgeI
						: styles.badgeP;

	return (
		<div className={styles.settlementPage}>
			<div className={styles.main}>
				<header className={styles.heroBanner}>
					<div className={styles.heroOrbOne} aria-hidden="true" />
					<div className={styles.heroOrbTwo} aria-hidden="true" />
					<div className={styles.heroContent}>
						<div className={styles.heroCopy}>
							<div className={styles.heroEyebrow}>
								<span>
									<i className="bi bi-arrow-left-right" aria-hidden="true" />{" "}
									Settlement &amp; Clearing
								</span>
								<span className={styles.livePill}>
									<span className={styles.liveDot} aria-hidden="true" />{" "}
									{config.heroTag}
								</span>
							</div>
							<h1 id="settlement-title">
								Every collection, payout and refund settled with full
								traceability.
							</h1>
							<p>{config.pageSub}</p>
							<div className={styles.heroActions}>
								<button
									type="button"
									className={styles.heroPrimaryBtn}
									onClick={() => openM("payoutModal")}
								>
									<i className="bi bi-send" aria-hidden="true" /> New Payout
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("linkApiModal")}
								>
									<i className="bi bi-plug" aria-hidden="true" /> Link API
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("generateReportModal")}
								>
									<i className="bi bi-download" aria-hidden="true" /> Statements
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("rebalanceModal")}
								>
									<i className="bi bi-arrow-clockwise" aria-hidden="true" />{" "}
									Rebalance
								</button>
							</div>
						</div>
						<aside
							className={styles.heroSnapshot}
							aria-label="Settlement snapshot"
						>
							<span>Collected this month</span>
							<strong>{fmtKES(sum("collected"))}</strong>
							<p>
								Across {config.businesses.length} linked businesses, {bizLabel}{" "}
								in view.
							</p>
							<div className={styles.heroMetricRow}>
								<div>
									<strong>{fmtKES(sum("payouts"))}</strong>
									<span>Paid out</span>
								</div>
								<div>
									<strong>{fmtKES(sum("refunds"))}</strong>
									<span>Refunds issued</span>
								</div>
								<div>
									<strong>{fmtKES(sum("float"))}</strong>
									<span>Float available</span>
								</div>
							</div>
						</aside>
					</div>
				</header>

				<div className={styles.controlStrip}>
					<div className={styles.controlGroup}>
						<span className={styles.controlLabel}>
							<i className="bi bi-layers" aria-hidden="true" /> View
						</span>
						<div className={styles.segmented}>
							<button
								type="button"
								className={world === "customers" ? styles.segmentActive : ""}
								onClick={() => setWorld("customers")}
							>
								<i className="bi bi-people" aria-hidden="true" /> Customer
								Settlements
							</button>
							<button
								type="button"
								className={world === "internal" ? styles.segmentActive : ""}
								onClick={() => setWorld("internal")}
							>
								<i className="bi bi-wallet2" aria-hidden="true" /> My Wallets
								&amp; Internal
							</button>
						</div>
					</div>
					{world === "customers" && (
						<div className={styles.controlGroup}>
							<span className={styles.controlLabel}>
								<i className="bi bi-building" aria-hidden="true" /> Business
							</span>
							<div className={styles.filterPills}>
								<button
									type="button"
									className={biz === "all" ? styles.filterActive : ""}
									onClick={() => setBiz("all")}
								>
									All Businesses <span className={styles.bizCount}>2</span>
								</button>
								{config.businesses.map((b) => (
									<button
										type="button"
										key={b.id}
										className={biz === b.id ? styles.filterActive : ""}
										onClick={() => setBiz(b.id)}
									>
										{b.name}{" "}
										<span className={styles.bizCount}>{b.customers}</span>
									</button>
								))}
							</div>
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("businessDetailModal")}
							>
								<i className="bi bi-plus" aria-hidden="true" /> Link Business
							</button>
						</div>
					)}
					<span className={styles.scopeNote}>
						<i className="bi bi-funnel" aria-hidden="true" /> {bizLabel} in view
					</span>
				</div>

				<div className={styles.content}>
					{!config.paymoConnected && (
						<div className={styles.connBanner}>
							<div className={styles.connIcon}>
								<i className="bi bi-plug" aria-hidden="true" />
							</div>
							<div className={styles.connText}>
								<div className={styles.connTitle}>Paymo not connected yet</div>
								<div className={styles.connSub}>
									Link your API key to start collecting and settling customer
									payments. You're currently viewing preview data.
								</div>
							</div>
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm} ${styles.heroSecondaryBtn}`}
								onClick={() => openM("linkApiModal")}
							>
								<i className="bi bi-key" aria-hidden="true" /> Link API Key
							</button>
							<span className={styles.connTag}>
								<i className="bi bi-circle-fill" aria-hidden="true" /> Sandbox
								preview
							</span>
						</div>
					)}

					<section
						className={styles.dashboardSection}
						aria-labelledby="set-sec-pulse"
					>
						<SectionHeading
							index="1.1"
							id="set-sec-pulse"
							title={
								world === "customers"
									? "Settlement pulse"
									: "Internal wallet pulse"
							}
							description={`${bizLabel} — headline figures for the current settlement cycle.`}
						/>
						<div className={styles.kpiGrid}>
							{worldStats.map((stat) => (
								<div className={styles.kpiCard} key={stat.label}>
									<div
										className={`${styles.kpiIcon} ${stat.iconCls}`}
										aria-hidden="true"
									>
										<i className={`bi ${stat.icon}`} />
									</div>
									<div
										style={{
											fontSize: "0.72rem",
											fontWeight: 600,
											color: "var(--pm-muted)",
											textTransform: "uppercase",
											letterSpacing: "0.06em",
										}}
									>
										{stat.label}
									</div>
									<div className={styles.kpiValue}>{stat.value}</div>
									<div className={styles.kpiMeta}>
										<span
											className={`${styles.badge} ${kpiToneClass(stat.tone)}`}
										>
											{stat.sub}
										</span>
									</div>
								</div>
							))}
						</div>
					</section>

					{world === "customers" && (
						<section
							className={styles.dashboardSection}
							aria-labelledby="set-sec-businesses"
						>
							<SectionHeading
								index="1.3"
								id="set-sec-businesses"
								title="Linked businesses"
								description={`${config.businesses.length} businesses collecting through your Paymo account. Manage customers, permissions and ledgers.`}
								action={
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("businessDetailModal")}
									>
										<i className="bi bi-plus" aria-hidden="true" /> Link New
										Business
									</button>
								}
							/>
							<div className="row g-3">
								{config.businesses.map((b) => {
									const granted = b.permission.filter(
										(p) => p.status === "granted",
									).length;
									const permPct = Math.round(
										(granted / b.permission.length) * 100,
									);
									const floatPct = Math.min(
										100,
										Math.round((b.float / b.minFloat) * 100),
									);
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
													<span
														className={`${styles.badge} ${lowFloat ? styles.badgeW : styles.badgeS}`}
													>
														<i
															className={`bi ${lowFloat ? "bi-exclamation-triangle" : "bi-check-circle"}`}
															aria-hidden="true"
														/>{" "}
														{b.status}
													</span>
												</div>
												<div className={styles.bizKpis}>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Collected</div>
														<div
															className={styles.bizKpiValue}
															style={{ color: "var(--pm-accent)" }}
														>
															{fmtKES(b.collected)}
														</div>
													</div>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Paid Out</div>
														<div
															className={styles.bizKpiValue}
															style={{ color: "var(--pm-info)" }}
														>
															{fmtKES(b.payouts)}
														</div>
													</div>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>Refunds</div>
														<div
															className={styles.bizKpiValue}
															style={{ color: "var(--pm-warning)" }}
														>
															{fmtKES(b.refunds)}
														</div>
													</div>
													<div className={styles.bizKpi}>
														<div className={styles.bizKpiLabel}>
															Fee ({b.feePct})
														</div>
														<div
															className={styles.bizKpiValue}
															style={{ color: "var(--pm-primary)" }}
														>
															{fmtKES(b.fees)}
														</div>
													</div>
												</div>
												<div className={styles.permTrack}>
													<i
														className="bi bi-shield-check"
														style={{ color: "var(--pm-primary)" }}
														aria-hidden="true"
													/>
													<span>
														Permissions {granted}/{b.permission.length}
													</span>
													<div className={styles.permBar}>
														<div
															className={styles.permFill}
															style={{ width: `${permPct}%` }}
														/>
													</div>
												</div>
												<div className={styles.floatMeter}>
													<i
														className="bi bi-droplet"
														style={{ color: "var(--pm-info)" }}
														aria-hidden="true"
													/>
													<span>
														Float {fmtKES(b.float)} / min {fmtKES(b.minFloat)}
													</span>
													<div className={styles.permBar}>
														<div
															className={`${styles.floatFill} ${lowFloat ? styles.floatLow : ""}`}
															style={{ width: `${floatPct}%` }}
														/>
													</div>
												</div>
												<div className="d-flex flex-wrap" style={{ gap: 8 }}>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("businessDetailModal")}
													>
														<i className="bi bi-eye" aria-hidden="true" />{" "}
														Manage
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("payoutModal")}
													>
														<i className="bi bi-send" aria-hidden="true" />{" "}
														Payout
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
														onClick={() => openM("rebalanceModal")}
													>
														<i
															className="bi bi-arrow-clockwise"
															aria-hidden="true"
														/>{" "}
														Rebalance
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</section>
					)}

					{world === "customers" && (
						<section
							className={styles.dashboardSection}
							aria-labelledby="set-sec-ledger"
						>
							<SectionHeading
								index="1.4"
								id="set-sec-ledger"
								title="Collections, payouts & refunds"
								description={`${bizLabel} — clear split between money recovered from customers and money sent to your businesses.`}
								action={
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("refundModal")}
									>
										<i
											className="bi bi-arrow-counterclockwise"
											aria-hidden="true"
										/>{" "}
										Issue Refund
									</button>
								}
							/>
							<div className={styles.tableCard}>
								<div className={styles.tableToolbar}>
									<div>
										<h3 className={styles.tableTitle}>
											<i
												className="bi bi-arrow-left-right"
												aria-hidden="true"
											/>{" "}
											Collections, Payouts &amp; Refunds
										</h3>
										<p className={styles.tableSub}>
											{bizLabel} — every movement, traceable.
										</p>
									</div>
									<div className={styles.pills}>
										{(["collections", "payouts", "refunds"] as const).map(
											(tab) => (
												<button
													type="button"
													key={tab}
													className={`${styles.pill} ${ledgerTab === tab ? styles.pillActive : ""}`}
													onClick={() => setLedgerTab(tab)}
												>
													{tab.charAt(0).toUpperCase() + tab.slice(1)}
												</button>
											),
										)}
									</div>
								</div>
								<div className={styles.tableWrap}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												{LEDGER_COLS[ledgerTab].map((c) => (
													<th key={c}>{c}</th>
												))}
											</tr>
										</thead>
										<tbody>
											{ledgerRows.map((r) => (
												<tr key={r[0]}>
													<td>{r[0]}</td>
													<td>{r[1]}</td>
													<td>{r[2]}</td>
													<td>{r[3]}</td>
													<td>
														<strong>{r[4]}</strong>
													</td>
													<td>
														<span
															className={`${styles.badge} ${styles[ledgerTone(r[5])]}`}
														>
															{r[5]}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM(r[6])}
														>
															{r[7]}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className={styles.tableFooter}>
									<span>{ledgerRows.length} rows in view</span>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("generateReportModal")}
									>
										<i className="bi bi-download" aria-hidden="true" /> Export
										Ledger
									</button>
								</div>
							</div>
						</section>
					)}

					{world === "customers" && (
						<section
							className={styles.dashboardSection}
							aria-labelledby="set-sec-rebalance"
						>
							<SectionHeading
								index="1.5"
								id="set-sec-rebalance"
								title="Rebalance & float"
								description="Fund auto-settlement — move money from your wallets into each business's settlement float."
								action={
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("rebalanceModal")}
									>
										<i className="bi bi-arrow-clockwise" aria-hidden="true" />{" "}
										Rebalance Now
									</button>
								}
							/>
							<div className={styles.tableCard}>
								<div className="row g-3">
									<div className="col-lg-7">
										<div className={styles.panel}>
											<h4 className={styles.panelTitle}>
												<i className="bi bi-droplet" aria-hidden="true" /> Float
												Levels
											</h4>
											{config.businesses.map((b) => {
												const floatPct = Math.min(
													100,
													Math.round((b.float / b.minFloat) * 100),
												);
												const low = b.float <= b.minFloat * 1.1;
												return (
													<div className={styles.floatRow} key={b.id}>
														<div className={styles.floatRowMain}>
															<strong>{b.name}</strong>
															<div
																className={styles.floatMeter}
																style={{ marginTop: 6 }}
															>
																<div className={styles.permBar}>
																	<div
																		className={`${styles.floatFill} ${low ? styles.floatLow : ""}`}
																		style={{ width: `${floatPct}%` }}
																	/>
																</div>
																<span>
																	{fmtKES(b.float)} / {fmtKES(b.minFloat)}
																</span>
															</div>
														</div>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm} ${low ? styles.btnPmD : ""}`}
															onClick={() => openM("rebalanceModal")}
														>
															<i
																className="bi bi-arrow-clockwise"
																aria-hidden="true"
															/>{" "}
															Rebalance
														</button>
													</div>
												);
											})}
										</div>
									</div>
									<div className="col-lg-5">
										<div className={styles.panel}>
											<h4 className={styles.panelTitle}>
												<i className="bi bi-clock-history" aria-hidden="true" />{" "}
												Recent Rebalances
											</h4>
											{config.rebalances.map((r) => (
												<div className={styles.floatRow} key={r.time + r.biz}>
													<div className={styles.floatRowMain}>
														<strong>{r.biz}</strong>
														<div className={styles.mutedSmall}>
															{r.from} • {r.trigger} • {r.time}
														</div>
													</div>
													<div className={styles.floatRowValue}>
														<strong>{r.amount}</strong>
														<div>
															<span
																className={`${styles.badge} ${styles[r.tone]}`}
															>
																{r.status}
															</span>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</section>
					)}

					{world === "internal" && (
						<section
							className={styles.dashboardSection}
							aria-labelledby="set-sec-wallets"
						>
							<SectionHeading
								index="1.3"
								id="set-sec-wallets"
								title="My wallets & internal transfers"
								description="Your own money on PayMo — fund floats, pay yourself, or withdraw to your bank."
								action={
									<div className={styles.headerButtonRow}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("walletTopUpModal")}
										>
											<i className="bi bi-plus" aria-hidden="true" /> Top Up
										</button>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
											onClick={() => openM("internalTransferModal")}
										>
											<i className="bi bi-send" aria-hidden="true" /> Send Money
										</button>
									</div>
								}
							/>
							<div className="row g-3 mb-3">
								{config.wallets.map((w) => (
									<div className="col-lg-6" key={w.id}>
										<div
											className={`${styles.card} ${styles.walletCard} h-100`}
										>
											<div className={styles.bizHead}>
												<div className="d-flex align-items-center gap-3">
													<div
														className={styles.walletIcon}
														style={{
															background: "var(--pm-accent-soft)",
															color: w.color,
														}}
														aria-hidden="true"
													>
														<i className={w.icon} />
													</div>
													<div>
														<h4
															className={styles.bizName}
															style={{ margin: 0 }}
														>
															{w.name}
														</h4>
														<p className={styles.bizType} style={{ margin: 0 }}>
															{w.type} • {w.purpose}
														</p>
													</div>
												</div>
												<span className={`${styles.badge} ${styles.badgeS}`}>
													<i
														className="bi bi-check-circle"
														aria-hidden="true"
													/>{" "}
													Active
												</span>
											</div>
											<div className={styles.walletBalance}>
												{fmtKES(w.balance)}
											</div>
											<div className={styles.walletRow}>
												<span>Available</span>
												<strong>{fmtKES(w.available)}</strong>
											</div>
											<div className={styles.walletRow}>
												<span>Pending settlement</span>
												<strong>{fmtKES(w.pending)}</strong>
											</div>
											<div className="d-flex flex-wrap" style={{ gap: 8 }}>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("walletTopUpModal")}
												>
													<i className="bi bi-plus" aria-hidden="true" /> Top Up
												</button>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("internalTransferModal")}
												>
													<i className="bi bi-send" aria-hidden="true" /> Send
												</button>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("internalTransferModal")}
												>
													<i className="bi bi-bank" aria-hidden="true" />{" "}
													Withdraw
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className={styles.tableCard}>
								<div className={styles.tableToolbar}>
									<h3 className={styles.tableTitle}>
										<i className="bi bi-arrow-left-right" aria-hidden="true" />{" "}
										Internal Transfers
									</h3>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("internalTransferModal")}
									>
										<i className="bi bi-plus" aria-hidden="true" /> New Transfer
									</button>
								</div>
								<div className={styles.tableWrap}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Time</th>
												<th>From</th>
												<th>To</th>
												<th>Amount</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{config.transfers.map((t) => (
												<tr key={t.time + t.from}>
													<td>{t.time}</td>
													<td>{t.from}</td>
													<td>{t.to}</td>
													<td>
														<strong>{t.amount}</strong>
													</td>
													<td>
														<span
															className={`${styles.badge} ${styles[t.tone]}`}
														>
															{t.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</section>
					)}

					<section
						className={styles.dashboardSection}
						aria-labelledby="set-sec-recon"
					>
						<SectionHeading
							index="1.6"
							id="set-sec-recon"
							title="Reconciliation & dispute resolution"
							description="Match collections against payouts, handle exceptions, and manage the full dispute lifecycle."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("reconciliationWizardModal")}
									>
										<i className="bi bi-list-check" aria-hidden="true" /> Start
										Reconciliation
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("disputeModal")}
									>
										<i
											className="bi bi-exclamation-triangle"
											aria-hidden="true"
										/>{" "}
										New Dispute
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-7">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-list-check" aria-hidden="true" />{" "}
											Reconciliation Summary
										</h4>
										<div className={styles.tableWrap}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														{config.reconRows.cols.map((c) => (
															<th key={c.key}>{c.label}</th>
														))}
													</tr>
												</thead>
												<tbody>
													{config.reconRows.rows.map((row) => (
														<tr key={cellKey(row[0])}>
															{row.map((cell) => (
																<td key={cellKey(cell)}>
																	<CellValue cell={cell} onOpen={openM} />
																</td>
															))}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div className="col-lg-5">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i
												className="bi bi-shield-exclamation"
												aria-hidden="true"
											/>{" "}
											Open Disputes
										</h4>
										{config.openDisputes.map((d) => (
											<div className={styles.floatRow} key={d.ref}>
												<div className={styles.floatRowMain}>
													<strong>{d.ref}</strong>
													<div className={styles.mutedSmall}>{d.sub}</div>
												</div>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM(d.modal)}
												>
													Resolve
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="set-sec-reports"
					>
						<SectionHeading
							index="1.7"
							id="set-sec-reports"
							title="Settlement reports & analytics"
							description="Per-business statements, fee earnings, refund analysis and rebalance history."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("generateReportModal")}
								>
									<i className="bi bi-download" aria-hidden="true" /> Generate
									Report
								</button>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-8">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-bar-chart" aria-hidden="true" /> 7-Day
											Settlement Trend
										</h4>
										<div className={styles.chartBars}>
											{config.trendBars.map((b) => (
												<div
													key={b.label}
													className={styles.chartBar}
													style={{ height: b.height, background: b.color }}
												>
													<span className={styles.barLabel}>{b.label}</span>
												</div>
											))}
										</div>
									</div>
								</div>
								<div className="col-lg-4">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-speedometer2" aria-hidden="true" />{" "}
											Key Metrics
										</h4>
										{config.keyMetrics.map((m) => (
											<div className={styles.floatRow} key={m.label}>
												<div className={styles.floatRowMain}>
													<strong>{m.label}</strong>
												</div>
												<strong>{m.value}</strong>
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("complianceReportModal")}
										>
											<i
												className="bi bi-file-earmark-check"
												aria-hidden="true"
											/>{" "}
											View Compliance
										</button>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="set-sec-rules"
					>
						<SectionHeading
							index="1.8"
							id="set-sec-rules"
							title="Automated settlement rules"
							description="Auto-settle payouts, rebalance floats, and route refunds — per business."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("autoRulesModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Manage Rules
								</button>
							}
						/>
						<div className={styles.tableCard}>
							<h3 className={styles.tableTitle} style={{ marginBottom: 12 }}>
								<i className="bi bi-gear" aria-hidden="true" /> Active
								Automation Rules
							</h3>
							{config.autoRules.map((r) => (
								<div className={styles.floatRow} key={r.title}>
									<div className={styles.floatRowMain}>
										<strong>{r.title}</strong>
										<div className={styles.mutedSmall}>{r.sub}</div>
									</div>
									<span className={`${styles.badge} ${styles[r.tone]}`}>
										{r.status}
									</span>
								</div>
							))}
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="set-sec-onboarding"
					>
						<SectionHeading
							index="1.9"
							id="set-sec-onboarding"
							title="Business onboarding & permissions"
							description="Track what every linked business must grant before settlement runs for their customers."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("businessDetailModal")}
								>
									<i className="bi bi-eye" aria-hidden="true" /> View
									Permissions
								</button>
							}
						/>
						<div className={styles.tableCard}>
							<div className={styles.tableWrap}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Business</th>
											<th>Customers</th>
											<th>KYC Docs</th>
											<th>Permissions</th>
											<th>Settlement Account</th>
											<th>Fee</th>
											<th>Schedule</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{config.businesses.map((b) => {
											const granted = b.permission.filter(
												(p) => p.status === "granted",
											).length;
											const permPct = Math.round(
												(granted / b.permission.length) * 100,
											);
											const kyc =
												b.permission[0].status === "granted"
													? "Verified"
													: "Pending";
											return (
												<tr key={b.id}>
													<td>
														<strong>{b.name}</strong>
													</td>
													<td>{b.customers}</td>
													<td>
														<span
															className={`${styles.badge} ${kyc === "Verified" ? styles.badgeS : styles.badgeW}`}
														>
															{kyc}
														</span>
													</td>
													<td style={{ minWidth: 140 }}>
														<div className="d-flex align-items-center gap-2">
															<div
																className={styles.permBar}
																style={{ width: 70 }}
															>
																<div
																	className={styles.permFill}
																	style={{ width: `${permPct}%` }}
																/>
															</div>
															<span className={styles.mutedSmall}>
																{granted}/{b.permission.length}
															</span>
														</div>
													</td>
													<td className={styles.mutedSmall}>{b.account}</td>
													<td>{b.feePct}</td>
													<td>{b.schedule}</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM("businessDetailModal")}
														>
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
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="set-sec-activity"
					>
						<SectionHeading
							index="1.10"
							id="set-sec-activity"
							title="Recent settlement activity"
							description="Every settlement action across customer and internal flows, most recent first."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("activityLogModal")}
								>
									<i className="bi bi-clock-history" aria-hidden="true" /> Full
									Log
								</button>
							}
						/>
						<div className={styles.tableCard}>
							<div className={styles.tableWrap}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											{config.activity.cols.map((c) => (
												<th key={c.key}>{c.label}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{config.activity.rows.map((row) => (
											<tr key={cellKey(row[0])}>
												{row.map((cell) => (
													<td key={cellKey(cell)}>
														<CellValue cell={cell} onOpen={openM} />
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				</div>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-arrow-left-right" aria-hidden="true" />{" "}
						Settlement &amp; Clearing · {config.businesses.length} linked
						businesses · Data refreshes every run
					</span>
					<nav aria-label="Footer links">
						<Link to="/pm/app/liquidity">Liquidity &amp; Float</Link>
						<Link to="/pm/app/reconciliation">Reconciliation</Link>
						<Link to="/pm/app/payment-rails">Payment Rails</Link>
					</nav>
				</footer>
			</div>

			<nav className={styles.floatingBar} aria-label="Quick settlement actions">
				<button type="button" onClick={() => openM("attentionModal")}>
					<i className="bi bi-exclamation-circle" aria-hidden="true" />{" "}
					Attention
				</button>
				<button type="button" onClick={() => openM("activityLogModal")}>
					<i className="bi bi-clock-history" aria-hidden="true" /> Activity
				</button>
				<button type="button" onClick={() => openM("healthCheckModal")}>
					<i className="bi bi-heart-pulse" aria-hidden="true" /> Health
				</button>
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => openM("payoutModal")}
				>
					<i className="bi bi-send" aria-hidden="true" /> New Payout
				</button>
			</nav>

			<AttentionHubFab
				count={drawerAttention.length}
				hidden={drawerOpen}
				onClick={() => setDrawerOpen(true)}
			/>

			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Settlement"
				pageIcon="bi-bank"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<SettlementModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
