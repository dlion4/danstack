import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import CollectionsMerchantBody from "../components/CollectionsMerchantBody";
import CollectionsMerchantModals from "../components/CollectionsMerchantModals";
import styles from "../styles/collections-merchant.module.css";

/* ============================================================================
   PayMo BaaS — Collections & Merchant Services (legacy page 3.2)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

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
	miniBars?: { height: string; color: string }[];
	progress?: { percent: number; color: string };
	extra?: { label: string; value: string }[];
}
interface FeedItem {
	initials: string;
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
interface MethodCard {
	key: string;
	icon: string;
	iconBg: string;
	iconColor: string;
	badge: { text: string; tone: BadgeTone };
	title: string;
	desc: string;
	mdr: string;
	modal: string;
}
interface TxnRow {
	time: string;
	customer: string;
	ref: string;
	method: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface ChartBar {
	label: string;
	height: string;
	color: string;
	pct: string;
}
interface SettlementRow {
	label: string;
	sub: string;
	amount: string;
}
interface CustomerStat {
	label: string;
	value: string;
}
interface CustomerRow {
	name: string;
	phone: string;
	segment: string;
	segmentTone: BadgeTone;
	ltv: string;
	last: string;
	modal: string;
}
interface DisputeItem {
	border: string;
	title: string;
	sub: string;
	amount: string;
	badge: { text: string; tone: BadgeTone };
}
interface User {
	initials: string;
	name: string;
	role: string;
	avatarBg: string;
}

interface CollectionsConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle: string;
	pageSub: string;
	heroStats: HeroStat[];
	attentionItems: FeedItem[];
	suggestions: FeedItem[];
	quickActions: QuickAction[];
	methods: MethodCard[];
	txnFeed: TxnRow[];
	chartBars: ChartBar[];
	settlements: SettlementRow[];
	customerStats: CustomerStat[];
	customerRows: CustomerRow[];
	disputes: DisputeItem[];
	refunds: DisputeItem[];
}

const initialMockData: CollectionsConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-shop", title: "Collections", active: true, dot: true },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-cash-coin", title: "Disbursements" },
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Collections & Merchant Services",
	headerSub: "Omnichannel payments, settlements, customers, and disputes",
	searchPlaceholder: "Search transactions, customers, dispute IDs, refunds...",
	user: {
		initials: "JD",
		name: "Jane Doe",
		role: "Finance Admin",
		avatarBg: "var(--pm-gradient-slate)",
	},
	breadcrumb: {
		parent: "Business Portal",
		mid: "Commerce",
		current: "Collections",
	},
	pageTitle: "PAGE 3.2 — Collections & Merchant Services",
	pageSub:
		"Manage your PayBill, Till, Card, and PesaLink collections. Track real-time settlements, handle refunds, and manage customer payment data.",
	heroStats: [
		{
			key: "collected",
			col: "col-lg-4",
			label: "Collections engine is live",
			labelColor: "rgba(255,255,255,.78)",
			value: "KES 412,500",
			badge: undefined,
			extra: undefined,
		},
		{
			key: "pending",
			col: "col-lg-2 col-md-4 col-6",
			label: "PENDING SETTLEMENT",
			labelColor: "var(--pm-info)",
			value: "KES 89,200",
			badge: { icon: "bi-bank", text: "T+1 schedule", tone: "badgeI" },
			miniBars: [
				{ height: "40%", color: "var(--pm-info)" },
				{ height: "70%", color: "var(--pm-primary)" },
				{ height: "50%", color: "var(--pm-info)" },
				{ height: "85%", color: "var(--pm-primary)" },
				{ height: "60%", color: "var(--pm-info)" },
			],
		},
		{
			key: "success",
			col: "col-lg-3 col-md-4 col-6",
			label: "SUCCESS RATE (TODAY)",
			labelColor: "var(--pm-accent)",
			value: "98.4%",
			badge: {
				icon: "bi-check-circle",
				text: "181 successful",
				tone: "badgeS",
			},
			progress: { percent: 98.4, color: "var(--pm-accent)" },
		},
		{
			key: "disputes",
			col: "col-lg-3 col-md-4",
			label: "DISPUTES & REFUNDS",
			labelColor: "var(--pm-warning)",
			value: "4 Active",
			badge: {
				icon: "bi-exclamation-triangle",
				text: "Needs attention",
				tone: "badgeW",
			},
			extra: [
				{ label: "Pending Refunds", value: "2" },
				{ label: "Open Disputes", value: "2" },
			],
		},
	],
	attentionItems: [
		{
			initials: "CB",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Chargeback received",
			sub: "Visa ***4112 · KES 12,500",
			btnLabel: "Defend",
			btnClass: "btnPmD",
			modal: "disputeModal",
		},
		{
			initials: "RF",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Refund approval needed",
			sub: "Customer: John Mark · KES 3,400",
			btnLabel: "Review",
			modal: "refundModal",
		},
		{
			initials: "KYC",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "PayBill KYC update required",
			sub: "Upload CR12 for PB 512234",
			btnLabel: "Upload",
			modal: "paybillConfigModal",
		},
		{
			initials: "API",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "LNMO API token expires soon",
			sub: "Rotate keys in 3 days",
			btnLabel: "Rotate",
			modal: "apiConfigModal",
		},
	],
	suggestions: [
		{
			initials: "QR",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Deploy Dynamic QR for delivery",
			sub: "Reduce manual entry errors by 40%",
			btnLabel: "Setup",
			modal: "generateQRModal",
		},
		{
			initials: "PR",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Send reminders to 14 customers",
			sub: "Invoices due this week · KES 142k",
			btnLabel: "Remind",
			modal: "sendReminderModal",
		},
		{
			initials: "TK",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Enable card tokenization",
			sub: "Increase repeat purchase checkout speed",
			btnLabel: "Enable",
			modal: "cardConfigModal",
		},
		{
			initials: "SG",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "New VIP segment detected",
			sub: "24 customers have spent >KES 50k",
			btnLabel: "View",
			modal: "customerSegmentModal",
		},
	],
	quickActions: [
		{
			icon: "bi-wallet2",
			iconColor: "var(--pm-primary)",
			label: "Collect Pay",
			modal: "receivePaymentModal",
		},
		{
			icon: "bi-qr-code",
			iconColor: "var(--pm-info)",
			label: "New QR",
			modal: "generateQRModal",
		},
		{
			icon: "bi-arrow-return-left",
			iconColor: "var(--pm-warning)",
			label: "Refund",
			modal: "refundModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconColor: "var(--pm-danger)",
			label: "Dispute",
			modal: "disputeModal",
		},
		{
			icon: "bi-code-slash",
			iconColor: "var(--pm-purple)",
			label: "API Keys",
			modal: "apiConfigModal",
		},
		{
			icon: "bi-chat-dots",
			iconColor: "var(--pm-accent)",
			label: "Reminder",
			modal: "sendReminderModal",
		},
		{
			icon: "bi-calculator",
			iconColor: "var(--pm-muted)",
			label: "Calculate Fees",
			modal: "feeCalculatorModal",
		},
		{
			icon: "bi-file-earmark-spreadsheet",
			iconColor: "var(--pm-primary)",
			label: "Export Data",
			modal: "exportReportModal",
		},
	],
	methods: [
		{
			key: "paybill",
			icon: "bi-phone",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			badge: { text: "Active", tone: "badgeS" },
			title: "M-Pesa PayBill",
			desc: "Shortcode 512234. Supports LNMO, STK Push & account validation.",
			mdr: "1.5%",
			modal: "paybillConfigModal",
		},
		{
			key: "till",
			icon: "bi-shop",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			badge: { text: "Active", tone: "badgeS" },
			title: "M-Pesa Till (Buy Goods)",
			desc: "Till number 882001. Ideal for in-person POS transactions.",
			mdr: "1.0%",
			modal: "tillConfigModal",
		},
		{
			key: "card",
			icon: "bi-credit-card",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			badge: { text: "Active", tone: "badgeS" },
			title: "Card Payments",
			desc: "Visa/Mastercard with 3D Secure. Tokenization ready.",
			mdr: "2.9%",
			modal: "cardConfigModal",
		},
		{
			key: "pesalink",
			icon: "bi-bank",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			badge: { text: "Pending", tone: "badgeW" },
			title: "PesaLink Collections",
			desc: "Real-time collections from 50+ banks. Awaiting KYC approval.",
			mdr: "Fixed KES 45",
			modal: "pesalinkConfigModal",
		},
	],
	txnFeed: [
		{
			time: "14:32",
			customer: "Alice W.",
			ref: "TXN-892110",
			method: "PayBill",
			amount: "KES 4,500",
			status: "Success",
			statusTone: "badgeS",
			modal: "txnDetailModal",
		},
		{
			time: "14:15",
			customer: "John M.",
			ref: "TXN-892109",
			method: "Till",
			amount: "KES 1,200",
			status: "Success",
			statusTone: "badgeS",
			modal: "txnDetailModal",
		},
		{
			time: "13:40",
			customer: "Sarah K.",
			ref: "TXN-892108",
			method: "Visa",
			amount: "KES 8,500",
			status: "Success",
			statusTone: "badgeS",
			modal: "txnDetailModal",
		},
		{
			time: "13:12",
			customer: "David O.",
			ref: "TXN-892107",
			method: "PayBill",
			amount: "KES 2,000",
			status: "Failed",
			statusTone: "badgeD",
			modal: "txnDetailModal",
		},
		{
			time: "12:55",
			customer: "Mary J.",
			ref: "TXN-892106",
			method: "Till",
			amount: "KES 550",
			status: "Success",
			statusTone: "badgeS",
			modal: "txnDetailModal",
		},
	],
	chartBars: [
		{ label: "PayBill", height: "85%", color: "var(--pm-accent)", pct: "62%" },
		{ label: "Till", height: "60%", color: "var(--pm-info)", pct: "24%" },
		{ label: "Card", height: "40%", color: "var(--pm-purple)", pct: "11%" },
		{ label: "PesaLink", height: "15%", color: "var(--pm-warning)", pct: "3%" },
	],
	settlements: [
		{ label: "T+0 (Today)", sub: "M-Pesa balance", amount: "KES 304,100" },
		{
			label: "T+1 (Tomorrow)",
			sub: "Card & Bank batches",
			amount: "KES 89,200",
		},
	],
	customerStats: [
		{ label: "VIP (>KES 50k)", value: "142" },
		{ label: "Regular", value: "810" },
		{ label: "New (30 days)", value: "252" },
	],
	customerRows: [
		{
			name: "Alice Wanjiku",
			phone: "0722 *** 112",
			segment: "VIP",
			segmentTone: "badgeP",
			ltv: "KES 142,500",
			last: "Today",
			modal: "sendReminderModal",
		},
		{
			name: "John Mark",
			phone: "0711 *** 443",
			segment: "Regular",
			segmentTone: "badgeS",
			ltv: "KES 12,400",
			last: "Today",
			modal: "sendReminderModal",
		},
		{
			name: "Sarah K.",
			phone: "0733 *** 991",
			segment: "VIP",
			segmentTone: "badgeP",
			ltv: "KES 85,000",
			last: "Yesterday",
			modal: "sendReminderModal",
		},
		{
			name: "David O.",
			phone: "0721 *** 220",
			segment: "Churn Risk",
			segmentTone: "badgeD",
			ltv: "KES 8,000",
			last: "45 days ago",
			modal: "sendReminderModal",
		},
		{
			name: "Mary J.",
			phone: "0755 *** 881",
			segment: "New",
			segmentTone: "badgeI",
			ltv: "KES 550",
			last: "Today",
			modal: "sendReminderModal",
		},
	],
	disputes: [
		{
			border: "var(--pm-danger)",
			title: "Visa Chargeback",
			sub: "TXN-892108 · Reason: Service not provided",
			amount: "KES 8,500",
			badge: { text: "14d to respond", tone: "badgeD" },
		},
		{
			border: "var(--pm-warning)",
			title: "M-Pesa Dispute",
			sub: "Customer claims wrong amount",
			amount: "KES 2,000",
			badge: { text: "Under review", tone: "badgeW" },
		},
	],
	refunds: [
		{
			border: "var(--pm-info)",
			title: "Partial refund pending",
			sub: "John Mark · TXN-892109",
			amount: "KES 3,400",
			badge: { text: "Awaiting approval", tone: "badgeI" },
		},
		{
			border: "var(--pm-accent)",
			title: "Full refund completed",
			sub: "Alice Wanjiku · TXN-892050",
			amount: "KES 1,200",
			badge: { text: "Done", tone: "badgeS" },
		},
	],
};

/**
 * Frontend-only demo: no /api/business/collections-merchant backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchCollectionsContent(): Promise<CollectionsConfig> {
	try {
		const res = await fetch("/api/business/collections-merchant", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as CollectionsConfig;
	} catch {
		return initialMockData;
	}
}

export default function CollectionsMerchant() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-qr-code",
				label: "Generate QR",
				onClick: () => setActiveModal("generateQRModal"),
			},
			{
				icon: "bi-clock-history",
				label: "Settlements",
				onClick: () => setActiveModal("settlementModal"),
			},
			{
				icon: "bi-plus-lg",
				label: "Collect Payment",
				tone: "primary",
				onClick: () => setActiveModal("receivePaymentModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["business-collections-merchant"],
		queryFn: fetchCollectionsContent,
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
				<CollectionsMerchantBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<CollectionsMerchantModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
