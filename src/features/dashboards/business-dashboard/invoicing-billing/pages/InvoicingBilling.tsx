import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import InvoicingBillingBody from "../components/InvoicingBillingBody";
import InvoicingBillingExtraModals from "../components/InvoicingBillingExtraModals";
import InvoicingBillingModals from "../components/InvoicingBillingModals";
import styles from "../styles/invoicing-billing.module.css";

/* ============================================================================
   PayMo BaaS — Invoicing & Billing (legacy page 3.3)
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
	agingBar?: { segments: { width: string; color: string; label: string }[] };
	miniBars?: { height: string; color: string }[];
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
interface InvoiceRow {
	id: string;
	customer: string;
	amount: string;
	dueDate: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface LinkCard {
	key: string;
	name: string;
	amount: string;
	views: number;
	conversions: number;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface AgingBlock {
	range: string;
	amount: string;
	color: string;
	bgColor: string;
	textColor: string;
}
interface PlanCard {
	key: string;
	name: string;
	price: string;
	subscribers: number;
	mrr: string;
	badge: { text: string; tone: BadgeTone };
	modal: string;
}
interface SubscriberRow {
	name: string;
	plan: string;
	amount: string;
	nextBill: string;
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

interface InvoicingConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; current: string };
	pageTitle?: string;
	pageSub?: string;
	heroStats: HeroStat[];
	attentionItems: FeedItem[];
	suggestions: FeedItem[];
	quickActions: QuickAction[];
	invoices: InvoiceRow[];
	linkCards: LinkCard[];
	agingBlocks: AgingBlock[];
	planCards: PlanCard[];
	subscriberRows: SubscriberRow[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: InvoicingConfig = {
	nav: [
		{ icon: "bi-house", title: "Business Home" },
		{ icon: "bi-shop", title: "Collections" },
		{ icon: "bi-receipt", title: "Invoicing", active: true, dot: true },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-send", title: "Disbursements" },
		{ icon: "bi-gear", title: "Business Settings" },
	],
	headerTitle: "Apex Retail Ltd",
	headerSub: "KRA PIN: P051***49G",
	searchPlaceholder: "Search invoices, links, subscriptions, customers...",
	user: {
		initials: "AP",
		name: "Sarah A.",
		role: "Finance Admin",
		avatarBg: "linear-gradient(135deg, #DDD6FE 0%, #A78BFA 100%)",
	},
	breadcrumb: { parent: "Business Portal", current: "Invoicing & Billing" },
	// // pageTitle: "Invoicing & Billing",
	// pageSub:
	// 	"Manage invoices, payment links, collections tracking, and recurring subscriptions.",
	heroStats: [
		{
			key: "outstanding",
			col: "col-lg-3 col-md-6",
			label: "TOTAL OUTSTANDING",
			value: "KES 482,500",
			agingBar: {
				segments: [
					{ width: "55%", color: "var(--pm-accent)", label: "0-30" },
					{ width: "24%", color: "var(--pm-warning)", label: "31-60" },
					{ width: "21%", color: "var(--pm-danger)", label: "61+" },
				],
			},
			badge: { icon: "bi-clock", text: "Aging tracked", tone: "badgeI" },
		},
		{
			key: "monthly",
			col: "col-lg-3 col-md-6",
			label: "MONTHLY INVOICED",
			value: "KES 1.2M",
			badge: {
				icon: "bi-graph-up-arrow",
				text: "82% collection rate",
				tone: "badgeS",
			},
			extra: [
				{ label: "Paid", value: "KES 984K" },
				{ label: "Pending", value: "KES 216K" },
			],
		},
		{
			key: "mrr",
			col: "col-lg-3 col-md-6",
			label: "MRR (SUBSCRIPTIONS)",
			value: "KES 345,000",
			badge: { icon: "bi-people", text: "124 Active Subs", tone: "badgeP" },
		},
		{
			key: "dso",
			col: "col-lg-3 col-md-6",
			label: "DSO",
			value: "28 Days",
			badge: { icon: "bi-check-circle", text: "Healthy", tone: "badgeS" },
			miniBars: [
				{ height: "40%", color: "var(--pm-accent)" },
				{ height: "65%", color: "var(--pm-primary)" },
				{ height: "55%", color: "var(--pm-accent)" },
				{ height: "80%", color: "var(--pm-primary)" },
				{ height: "45%", color: "var(--pm-warning)" },
			],
		},
	],
	attentionItems: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Overdue Invoice: INV-2025-042",
			sub: "Global Exporters · KES 145,000 · 14 days overdue",
			btnLabel: "Send Reminder",
			btnClass: "btnPmD",
			modal: "recordPaymentModal",
		},
		{
			icon: "bi-credit-card",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Subscription Payment Failed",
			sub: "Coast Logistics · KES 25,000/month · M-Pesa timeout",
			btnLabel: "Retry",
			modal: "subscriptionDetailModal",
		},
		{
			icon: "bi-link-45deg",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "High-Value Link Abandoned",
			sub: "KES 340,000 link viewed 3x but not paid",
			btnLabel: "Resend",
			modal: "linkAnalyticsModal",
		},
	],
	suggestions: [
		{
			icon: "bi-envelope",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Enable Auto-Reminders",
			sub: "2 invoices due this week · Reduce DSO by 5 days",
			btnLabel: "Setup",
			modal: "reminderSettingsModal",
		},
		{
			icon: "bi-percent",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Offer Early Payment Discount",
			sub: "2% discount for 5-day payment could improve collections 15%",
			btnLabel: "Configure",
			modal: "invoiceDetailModal",
		},
		{
			icon: "bi-shield-check",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Update Withholding Tax Settings",
			sub: "New KRA WHT API integration available",
			btnLabel: "Update",
			modal: "taxSettingsModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-circle",
			iconColor: "var(--pm-primary)",
			label: "New Invoice",
			modal: "newInvoiceModal",
		},
		{
			icon: "bi-link-45deg",
			iconColor: "var(--pm-info)",
			label: "Payment Link",
			modal: "newPaymentLinkModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconColor: "var(--pm-purple)",
			label: "Subscription",
			modal: "newSubscriptionModal",
		},
		{
			icon: "bi-file-earmark-minus",
			iconColor: "var(--pm-danger)",
			label: "Credit Note",
			modal: "creditNoteModal",
		},
		{
			icon: "bi-cash-coin",
			iconColor: "var(--pm-accent)",
			label: "Record Pay",
			modal: "recordPaymentModal",
		},
		{
			icon: "bi-bell",
			iconColor: "var(--pm-warning)",
			label: "Reminders",
			modal: "reminderSettingsModal",
		},
		{
			icon: "bi-person-lines-fill",
			iconColor: "var(--pm-muted)",
			label: "Customers",
			modal: "customerSelectModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-primary)",
			label: "Templates",
			modal: "invoiceTemplatesModal",
		},
	],
	invoices: [
		{
			id: "INV-2025-042",
			customer: "Global Exporters",
			amount: "KES 145,000",
			dueDate: "15 Jun 2025",
			status: "Overdue",
			statusTone: "badgeD",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-2025-041",
			customer: "Coast Logistics",
			amount: "KES 140,000",
			dueDate: "28 Jun 2025",
			status: "Paid",
			statusTone: "badgeS",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-2025-040",
			customer: "Nairobi Distributors",
			amount: "KES 98,500",
			dueDate: "30 Jun 2025",
			status: "Pending",
			statusTone: "badgeW",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-2025-039",
			customer: "Mombasa Traders",
			amount: "KES 75,000",
			dueDate: "5 Jul 2025",
			status: "Draft",
			statusTone: "badgeI",
			modal: "invoiceDetailModal",
		},
		{
			id: "INV-2025-038",
			customer: " Rift Valley Co.",
			amount: "KES 24,000",
			dueDate: "10 Jul 2025",
			status: "Sent",
			statusTone: "badgeP",
			modal: "invoiceDetailModal",
		},
	],
	linkCards: [
		{
			key: "link1",
			name: "Global Exporters — USD Invoice",
			amount: "USD 1,200",
			views: 12,
			conversions: 0,
			status: "Viewed",
			statusTone: "badgeI",
			modal: "linkAnalyticsModal",
		},
		{
			key: "link2",
			name: "Coast Logistics — KES 140K",
			amount: "KES 140,000",
			views: 8,
			conversions: 1,
			status: "Paid",
			statusTone: "badgeS",
			modal: "linkAnalyticsModal",
		},
		{
			key: "link3",
			name: "Nairobi Distributors",
			amount: "KES 98,500",
			views: 5,
			conversions: 0,
			status: "Active",
			statusTone: "badgeP",
			modal: "linkAnalyticsModal",
		},
	],
	agingBlocks: [
		{
			range: "0-30 Days",
			amount: "KES 265K",
			color: "#047857",
			bgColor: "var(--pm-accent-soft)",
			textColor: "#065F46",
		},
		{
			range: "31-60 Days",
			amount: "KES 117K",
			color: "#B45309",
			bgColor: "var(--pm-warning-soft)",
			textColor: "#92400E",
		},
		{
			range: "61-90+ Days",
			amount: "KES 100K",
			color: "#DC2626",
			bgColor: "var(--pm-danger-soft)",
			textColor: "#991B1B",
		},
	],
	planCards: [
		{
			key: "basic",
			name: "Basic Plan",
			price: "KES 2,500/mo",
			subscribers: 68,
			mrr: "KES 170,000",
			badge: { text: "Active", tone: "badgeS" },
			modal: "subscriptionDetailModal",
		},
		{
			key: "pro",
			name: "Pro Plan",
			price: "KES 5,000/mo",
			subscribers: 42,
			mrr: "KES 210,000",
			badge: { text: "Active", tone: "badgeP" },
			modal: "subscriptionDetailModal",
		},
		{
			key: "enterprise",
			name: "Enterprise Plan",
			price: "KES 12,500/mo",
			subscribers: 14,
			mrr: "KES 175,000",
			badge: { text: "Premium", tone: "badgeI" },
			modal: "subscriptionDetailModal",
		},
	],
	subscriberRows: [
		{
			name: "Coast Logistics",
			plan: "Pro Plan",
			amount: "KES 5,000",
			nextBill: "1 Jul 2025",
			status: "Active",
			statusTone: "badgeS",
			modal: "subscriptionDetailModal",
		},
		{
			name: "Nairobi Distributors",
			plan: "Basic Plan",
			amount: "KES 2,500",
			nextBill: "1 Jul 2025",
			status: "Active",
			statusTone: "badgeS",
			modal: "subscriptionDetailModal",
		},
		{
			name: "Rift Valley Co.",
			plan: "Enterprise",
			amount: "KES 12,500",
			nextBill: "1 Jul 2025",
			status: "Failed",
			statusTone: "badgeD",
			modal: "subscriptionDetailModal",
		},
		{
			name: "Mombasa Traders",
			plan: "Pro Plan",
			amount: "KES 5,000",
			nextBill: "1 Jul 2025",
			status: "Active",
			statusTone: "badgeS",
			modal: "subscriptionDetailModal",
		},
	],
};

/* ---------- TanStack Query fetcher ---------- */
/**
 * Frontend-only demo: no /api/business-dashboard/invoicing-billing backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchInvoicingData(): Promise<InvoicingConfig> {
	try {
		const res = await fetch("/api/business-dashboard/invoicing-billing", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as InvoicingConfig;
	} catch {
		return initialMockData;
	}
}

export default function InvoicingBilling() {
	const s = styles as Record<string, string>;

	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-link-45deg",
				label: "Payment Link",
				onClick: () => setActiveModal("newPaymentLinkModal"),
			},
			{
				icon: "bi-arrow-repeat",
				label: "Subscription",
				onClick: () => setActiveModal("newSubscriptionModal"),
			},
			{
				icon: "bi-plus-lg",
				label: "New Invoice",
				tone: "primary",
				onClick: () => setActiveModal("newInvoiceModal"),
			},
		],
		[setActiveModal],
	);

	useQuery({
		queryKey: ["invoicing-billing"],
		queryFn: fetchInvoicingData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});


	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<InvoicingBillingBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<InvoicingBillingModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<InvoicingBillingExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
