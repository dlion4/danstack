import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import BulkDisbursementsBody from "../components/BulkDisbursementsBody";
import BulkDisbursementsExtraModals from "../components/BulkDisbursementsExtraModals";
import BulkDisbursementsModals from "../components/BulkDisbursementsModals";
import styles from "../styles/bulk-disbursements.module.css";

/* ============================================================================
   PayMo BaaS — Bulk Disbursements (legacy page 3.5)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone =
	| "badgeS"
	| "badgeW"
	| "badgeD"
	| "badgeI"
	| "badgeP"
	| "badgeDark";

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
interface BatchRow {
	id: string;
	type: string;
	recipients: number;
	amount: string;
	status: string;
	statusTone: BadgeTone;
	date: string;
	modal: string;
}
interface ActiveBatch {
	id: string;
	type: string;
	recipients: number;
	amount: string;
	status: string;
	statusTone: BadgeTone;
	progress: number;
	modal: string;
}
interface User {
	initials: string;
	name: string;
	role: string;
	avatarBg: string;
}

interface DisbursementsConfig {
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
	batchHistory: BatchRow[];
	activeBatches: ActiveBatch[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: DisbursementsConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-shop", title: "Collections" },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-send", title: "Disbursements", active: true, dot: true },
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Safiri Operations Ltd",
	headerSub: "PayBill 400192 · Disbursement Engine",
	searchPlaceholder: "Search batches, recipients, templates, settlements...",
	user: {
		initials: "SO",
		name: "Sam O.",
		role: "Operations Manager",
		avatarBg: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
	},
	breadcrumb: { parent: "Business Portal", current: "Bulk Disbursements" },
	// // pageTitle: "Bulk Disbursements",
	// pageSub:
	// 	"Manage bulk payments, batch processing, float management, and disbursement analytics.",
	heroStats: [
		{
			key: "engine",
			col: "col-lg-4",
			label: "Disbursement Engine Active",
			labelColor: "rgba(255,255,255,.78)",
			value: "KES 1.8M",
			badge: { icon: "bi-check-circle", text: "Processing", tone: "badgeS" },
		},
		{
			key: "queue",
			col: "col-lg-2 col-md-4 col-6",
			label: "BATCH QUEUE",
			labelColor: "var(--pm-info)",
			value: "3 Pending",
			badge: { icon: "bi-clock", text: "2 scheduled", tone: "badgeI" },
			miniBars: [
				{ height: "40%", color: "var(--pm-info)" },
				{ height: "70%", color: "var(--pm-primary)" },
				{ height: "50%", color: "var(--pm-accent)" },
			],
		},
		{
			key: "success",
			col: "col-lg-3 col-md-4 col-6",
			label: "SUCCESS RATE",
			labelColor: "var(--pm-accent)",
			value: "97.8%",
			badge: {
				icon: "bi-check-circle",
				text: "118 successful",
				tone: "badgeS",
			},
			progress: { percent: 97.8, color: "var(--pm-accent)" },
		},
		{
			key: "float",
			col: "col-lg-3 col-md-4",
			label: "FLOAT MANAGEMENT",
			labelColor: "var(--pm-warning)",
			value: "KES 14.2M",
			badge: { icon: "bi-bank", text: "Buffer OK", tone: "badgeW" },
			progress: { percent: 60, color: "var(--pm-warning)" },
		},
	],
	attentionItems: [
		{
			icon: "bi-check-circle",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Approval Needed: BTH-9922",
			sub: "Emergency Relief batch · KES 450,000 · 120 recipients",
			btnLabel: "Review",
			modal: "approveBatchModal",
		},
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "2 Invalid Accounts Detected",
			sub: "Bank account length mismatch · Batch BTH-9920",
			btnLabel: "Fix",
			btnClass: "btnPmD",
			modal: "recipientValidationModal",
		},
		{
			icon: "bi-bank",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Low Float Warning",
			sub: "Scheduled batches exceed current KES 14.2M float",
			btnLabel: "Top-up",
			modal: "fundWalletModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-circle",
			iconColor: "var(--pm-primary)",
			label: "New Batch",
			modal: "newDisbursementModal",
		},
		{
			icon: "bi-calendar-plus",
			iconColor: "var(--pm-info)",
			label: "Schedule",
			modal: "scheduleDisbursementModal",
		},
		{
			icon: "bi-people",
			iconColor: "var(--pm-accent)",
			label: "Salary",
			modal: "newDisbursementModal",
		},
		{
			icon: "bi-shop",
			iconColor: "var(--pm-purple)",
			label: "Vendor Pay",
			modal: "newDisbursementModal",
		},
		{
			icon: "bi-exclamation-triangle",
			iconColor: "var(--pm-danger)",
			label: "Emergency",
			modal: "emergencyDisbursementModal",
		},
		{
			icon: "bi-wallet2",
			iconColor: "var(--pm-warning)",
			label: "Float Top-up",
			modal: "fundWalletModal",
		},
		{
			icon: "bi-clock-history",
			iconColor: "var(--pm-muted)",
			label: "Audit Trail",
			modal: "auditLogModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-primary)",
			label: "Templates",
			modal: "templateLibraryModal",
		},
	],
	batchHistory: [
		{
			id: "BTH-9920",
			type: "Salary",
			recipients: 118,
			amount: "KES 1,180,000",
			status: "Completed",
			statusTone: "badgeS",
			date: "25 Jun 2025",
			modal: "batchDetailModal",
		},
		{
			id: "BTH-9919",
			type: "Vendor",
			recipients: 42,
			amount: "KES 620,000",
			status: "Completed",
			statusTone: "badgeS",
			date: "22 Jun 2025",
			modal: "batchDetailModal",
		},
		{
			id: "BTH-9918",
			type: "Emergency",
			recipients: 25,
			amount: "KES 375,000",
			status: "Completed",
			statusTone: "badgeS",
			date: "20 Jun 2025",
			modal: "batchDetailModal",
		},
		{
			id: "BTH-9917",
			type: "Salary",
			recipients: 115,
			amount: "KES 1,150,000",
			status: "Completed",
			statusTone: "badgeS",
			date: "28 May 2025",
			modal: "batchDetailModal",
		},
	],
	activeBatches: [
		{
			id: "BTH-9921",
			type: "Vendor",
			recipients: 38,
			amount: "KES 380,000",
			status: "Processing",
			statusTone: "badgeI",
			progress: 65,
			modal: "batchDetailModal",
		},
		{
			id: "BTH-9922",
			type: "Emergency",
			recipients: 120,
			amount: "KES 450,000",
			status: "Awaiting Approval",
			statusTone: "badgeW",
			progress: 0,
			modal: "approveBatchModal",
		},
		{
			id: "BTH-9923",
			type: "Scheduled",
			recipients: 50,
			amount: "KES 500,000",
			status: "Scheduled",
			statusTone: "badgeP",
			progress: 0,
			modal: "batchDetailModal",
		},
	],
};

/* ---------- TanStack Query fetcher ---------- */
/**
 * Frontend-only demo: no /api/business-dashboard/bulk-disbursements backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchDisbursementsData(): Promise<DisbursementsConfig> {
	try {
		const res = await fetch("/api/business-dashboard/bulk-disbursements", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as DisbursementsConfig;
	} catch {
		return initialMockData;
	}
}

export default function BulkDisbursements() {
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
				icon: "bi-plus-circle",
				label: "Add Float",
				onClick: () => setActiveModal("fundWalletModal"),
			},
			{
				icon: "bi-people",
				label: "Directory",
				onClick: () => setActiveModal("beneficiaryDirectoryModal"),
			},
			{
				icon: "bi-send-plus",
				label: "New Bulk Payout",
				tone: "primary",
				onClick: () => setActiveModal("newDisbursementModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["bulk-disbursements"],
		queryFn: fetchDisbursementsData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});

	const config = apiData ?? initialMockData;

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<BulkDisbursementsBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<BulkDisbursementsModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<BulkDisbursementsExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
