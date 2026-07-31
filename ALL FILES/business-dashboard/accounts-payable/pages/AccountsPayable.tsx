import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import AccountsPayableBody from "../components/AccountsPayableBody";
import AccountsPayableExtraModals from "../components/AccountsPayableExtraModals";
import AccountsPayableModals from "../components/AccountsPayableModals";
import styles from "../styles/accounts-payable.module.css";

/* ============================================================================
   PayMo BaaS — Accounts Payable & Supplier Management (legacy page 3.6)
   React + TypeScript + TanStack Query, cream + indigo/emerald dashboard theme.
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
interface SupplierRow {
	name: string;
	category: string;
	invoices: number;
	outstanding: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface InvoiceRow {
	id: string;
	supplier: string;
	amount: string;
	dueDate: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface DiscountRow {
	supplier: string;
	discount: string;
	terms: string;
	savings: string;
	expires: string;
	expiresTone: BadgeTone;
	modal: string;
}
interface User {
	initials: string;
	name: string;
	role: string;
	avatarBg: string;
}

interface APConfig {
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
	suppliers: SupplierRow[];
	invoices: InvoiceRow[];
	discounts: DiscountRow[];
}

const initialMockData: APConfig = {
	nav: [
		{ icon: "bi-house", title: "Business Home" },
		{ icon: "bi-shop", title: "Collections" },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-send", title: "Disbursements" },
		{
			icon: "bi-file-earmark-minus",
			title: "Accounts Payable",
			active: true,
			dot: true,
		},
		{ icon: "bi-gear", title: "Business Settings" },
	],
	headerTitle: "Corporate Solutions Ltd",
	headerSub: "18 Active Suppliers · KRA PIN: P051***28G",
	searchPlaceholder: "Search suppliers, invoices, payments, discounts...",
	user: {
		initials: "AO",
		name: "Amina O.",
		role: "Head of Procurement · AP Admin",
		avatarBg: "linear-gradient(135deg, #FECDD3 0%, #FB7185 100%)",
	},
	breadcrumb: { parent: "Business Portal", current: "Accounts Payable" },
	pageTitle: "PAGE 3.6 — Accounts Payable & Supplier Management",
	pageSub:
		"Manage supplier invoices, approval workflows, payment execution, and discount tracking.",
	heroStats: [
		{
			key: "payables",
			col: "col-lg-3 col-md-6",
			label: "TOTAL PAYABLES",
			value: "KES 2.4M",
			badge: {
				icon: "bi-file-earmark-minus",
				text: "18 suppliers",
				tone: "badgeI",
			},
		},
		{
			key: "dueWeek",
			col: "col-lg-3 col-md-6",
			label: "DUE THIS WEEK",
			labelColor: "var(--pm-warning)",
			value: "KES 450K",
			badge: { icon: "bi-clock", text: "5 invoices", tone: "badgeW" },
		},
		{
			key: "overdue",
			col: "col-lg-3 col-md-6",
			label: "OVERDUE",
			labelColor: "var(--pm-danger)",
			value: "KES 120K",
			badge: {
				icon: "bi-exclamation-triangle",
				text: "2 invoices",
				tone: "badgeD",
			},
		},
		{
			key: "savings",
			col: "col-lg-3 col-md-6",
			label: "DISCOUNTS CAPTURED",
			value: "KES 38K",
			badge: { icon: "bi-percent", text: "This month", tone: "badgeS" },
		},
	],
	attentionItems: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "2 Overdue Invoices",
			sub: "INV-8822 CreativeHub KES 45,000 & INV-0092 Global Logistics KES 75,000",
			btnLabel: "Take Action",
			btnClass: "btnPmD",
			modal: "approvalQueueModal",
		},
		{
			icon: "bi-clock",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "5 Invoices Due This Week",
			sub: "Total KES 450,000 · OfficeMart, DesignWorks, CloudServe +2",
			btnLabel: "Review",
			modal: "approvalQueueModal",
		},
		{
			icon: "bi-percent",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "OfficeMart 2% Discount Expires Tomorrow",
			sub: "Pay early to save KES 250 on KES 12,500 invoice",
			btnLabel: "Pay Now",
			modal: "earlyPaymentCalcModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Failed PesaLink Transfer",
			sub: "INV-0092 to Global Logistics · Invalid account length",
			btnLabel: "Retry",
			modal: "paymentDetailModal",
		},
	],
	quickActions: [
		{
			icon: "bi-person-plus",
			iconColor: "var(--pm-primary)",
			label: "Add Supplier",
			modal: "addSupplierModal",
		},
		{
			icon: "bi-file-earmark-plus",
			iconColor: "var(--pm-info)",
			label: "Process Invoice",
			modal: "processInvoiceModal",
		},
		{
			icon: "bi-people",
			iconColor: "var(--pm-accent)",
			label: "Bulk Pay",
			modal: "bulkPaySuppliersModal",
		},
		{
			icon: "bi-check2-square",
			iconColor: "var(--pm-warning)",
			label: "Approve",
			modal: "approvalQueueModal",
		},
		{
			icon: "bi-calendar-check",
			iconColor: "var(--pm-purple)",
			label: "Schedule Pay",
			modal: "schedulePaymentModal",
		},
		{
			icon: "bi-graph-up",
			iconColor: "var(--pm-danger)",
			label: "View Aging",
			modal: "agingReportModal",
		},
		{
			icon: "bi-arrow-left-right",
			iconColor: "var(--pm-muted)",
			label: "Reconcile",
			modal: "reconciliationModal",
		},
		{
			icon: "bi-file-earmark-spreadsheet",
			iconColor: "var(--pm-primary)",
			label: "Export AP",
			modal: "exportAPModal",
		},
	],
	suppliers: [
		{
			name: "OfficeMart",
			category: "Office Supplies",
			invoices: 3,
			outstanding: "KES 12,500",
			status: "Active",
			statusTone: "badgeS",
			modal: "supplierDetailModal",
		},
		{
			name: "CreativeHub",
			category: "Design & Marketing",
			invoices: 2,
			outstanding: "KES 45,000",
			status: "Overdue",
			statusTone: "badgeD",
			modal: "supplierDetailModal",
		},
		{
			name: "CloudServe",
			category: "Cloud & IT Services",
			invoices: 4,
			outstanding: "KES 128,000",
			status: "Active",
			statusTone: "badgeS",
			modal: "supplierDetailModal",
		},
		{
			name: "Global Logistics",
			category: "Transport & Freight",
			invoices: 2,
			outstanding: "KES 75,000",
			status: "Payment Failed",
			statusTone: "badgeD",
			modal: "supplierDetailModal",
		},
		{
			name: "DesignWorks Agency",
			category: "Creative Services",
			invoices: 1,
			outstanding: "KES 28,000",
			status: "Pending",
			statusTone: "badgeW",
			modal: "supplierDetailModal",
		},
	],
	invoices: [
		{
			id: "INV-4419",
			supplier: "OfficeMart",
			amount: "KES 12,500",
			dueDate: "28 Jun 2025",
			status: "Pending Approval",
			statusTone: "badgeW",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-8822",
			supplier: "CreativeHub",
			amount: "KES 45,000",
			dueDate: "15 Jun 2025",
			status: "Overdue",
			statusTone: "badgeD",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-0092",
			supplier: "Global Logistics",
			amount: "KES 75,000",
			dueDate: "20 Jun 2025",
			status: "Payment Failed",
			statusTone: "badgeD",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-3410",
			supplier: "CloudServe",
			amount: "KES 128,000",
			dueDate: "5 Jul 2025",
			status: "Approved",
			statusTone: "badgeS",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-5510",
			supplier: "DesignWorks",
			amount: "KES 28,000",
			dueDate: "10 Jul 2025",
			status: "Draft",
			statusTone: "badgeI",
			modal: "invoiceDetailModal",
		},
	],
	discounts: [
		{
			supplier: "OfficeMart",
			discount: "2%",
			terms: "Net 10 / 2% early pay",
			savings: "KES 250",
			expires: "Tomorrow",
			expiresTone: "badgeW",
			modal: "discountTrackingModal",
		},
		{
			supplier: "CloudServe",
			discount: "1.5%",
			terms: "Net 15 / 1.5%",
			savings: "KES 1,920",
			expires: "3 days",
			expiresTone: "badgeW",
			modal: "discountTrackingModal",
		},
		{
			supplier: "Global Logistics",
			discount: "3%",
			terms: "Net 7 / 3% rush",
			savings: "KES 2,250",
			expires: "Expired",
			expiresTone: "badgeD",
			modal: "discountTrackingModal",
		},
	],
};

/**
 * Frontend-only demo: no /api/business-dashboard/accounts-payable backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchAPData(): Promise<APConfig> {
	try {
		const res = await fetch("/api/business-dashboard/accounts-payable", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as APConfig;
	} catch {
		return initialMockData;
	}
}

export default function AccountsPayable() {
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
				icon: "bi-cloud-arrow-up",
				label: "Upload Invoice",
				onClick: () => setActiveModal("uploadInvoiceModal"),
			},
			{
				icon: "bi-collection-play",
				label: "Bulk Run",
				onClick: () => setActiveModal("bulkPaySuppliersModal"),
			},
			{
				icon: "bi-person-plus",
				label: "Add Supplier",
				tone: "primary",
				onClick: () => setActiveModal("addSupplierModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["accounts-payable"],
		queryFn: fetchAPData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
	const config = apiData ?? initialMockData;

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<AccountsPayableBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<AccountsPayableModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<AccountsPayableExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
