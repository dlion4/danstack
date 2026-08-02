import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import FinancialReportingBody from "../components/FinancialReportingBody";
import FinancialReportingModals from "../components/FinancialReportingModals";
import styles from "../styles/financial-reporting.module.css";

/* ============================================================================
   PayMo BaaS — Financial Reporting, Audit & Analytics (legacy page 3.8)
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
	miniBars?: { height: string; color: string }[];
	extra?: { label: string; value: string }[];
	accentButtons?: { label: string; icon: string; modal: string }[];
}
interface FeedItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	initials?: string;
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
interface ReportRow {
	name: string;
	type: string;
	generatedBy: string;
	date: string;
	format: string;
	modal: string;
}
interface AuditRow {
	timestamp: string;
	user: string;
	action: string;
	ip: string;
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

interface FRConfig {
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
	insightItems: FeedItem[];
	quickActions: QuickAction[];
	reports: ReportRow[];
	auditLogs: AuditRow[];
}

const initialMockData: FRConfig = {
	nav: [
		{ icon: "bi-speedometer2", title: "Command Center" },
		{ icon: "bi-wallet2", title: "Collections" },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-send-check", title: "Bulk Pay" },
		{
			icon: "bi-bar-chart-line",
			title: "Reporting & Audit",
			active: true,
			dot: true,
		},
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Financial Reporting & Analytics",
	headerSub:
		"Audit trails, standard reports, business intelligence & tax readiness",
	searchPlaceholder: "Search reports, audit logs, transactions, metrics...",
	user: {
		initials: "TG",
		name: "Titus G.",
		role: "Finance Director",
		avatarBg: "linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)",
	},
	breadcrumb: {
		parent: "Business Portal",
		current: "Financial Reporting, Audit & Analytics",
	},
	// // pageTitle: "Financial Reporting, Audit & Analytics",
	// pageSub:
	// 	"Generate compliance-ready financial statements, drill down into BI metrics, review immutable audit trails, and prepare statutory KRA/NSSF tax extracts.",
	heroStats: [
		{
			key: "liquidity",
			col: "col-lg-4",
			label: "LIQUIDITY POSITION",
			labelColor: "rgba(255,255,255,.78)",
			value: "KES 12,450,800",
			badge: { icon: "bi-check-circle", text: "Consolidated", tone: "badgeS" },
			accentButtons: [
				{
					label: "Forecast",
					icon: "bi-graph-up",
					modal: "cashFlowForecastModal",
				},
				{
					label: "Statements",
					icon: "bi-download",
					modal: "downloadStatementModal",
				},
			],
		},
		{
			key: "revenue",
			col: "col-lg-2 col-md-4 col-6",
			label: "YTD REVENUE",
			labelColor: "var(--pm-primary)",
			value: "KES 48.2M",
			badge: { icon: "bi-graph-up-arrow", text: "14% YoY", tone: "badgeS" },
			miniBars: [
				{ height: "45%", color: "var(--pm-primary)" },
				{ height: "55%", color: "var(--pm-info)" },
				{ height: "62%", color: "var(--pm-primary)" },
				{ height: "75%", color: "var(--pm-info)" },
				{ height: "88%", color: "var(--pm-primary)" },
				{ height: "95%", color: "var(--pm-accent)" },
			],
		},
		{
			key: "recon",
			col: "col-lg-3 col-md-4 col-6",
			label: "PENDING RECONCILIATIONS",
			labelColor: "var(--pm-warning)",
			value: "4 Items",
			badge: {
				icon: "bi-exclamation-triangle",
				text: "Action Required",
				tone: "badgeW",
			},
			progress: { percent: 12, color: "var(--pm-warning)" },
			extra: [{ label: "Amount unmatched", value: "KES 142,500" }],
		},
		{
			key: "compliance",
			col: "col-lg-3 col-md-4",
			label: "COMPLIANCE & AUDIT SCORE",
			labelColor: "var(--pm-accent)",
			value: "98 / 100",
			badge: { icon: "bi-shield-check", text: "Audit Ready", tone: "badgeS" },
			extra: [
				{ label: "Next KRA VAT Due", value: "20 Jul 2025" },
				{ label: "e-TIMS invoices matched", value: "100%" },
			],
		},
	],
	attentionItems: [
		{
			icon: "bi-exclamation-triangle",
			initials: "RC",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "4 Unmatched Bank Deposits",
			sub: "Totaling KES 142,500 · Require manual allocation",
			btnLabel: "Match",
			modal: "reconciliationExceptionsModal",
		},
		{
			icon: "bi-bank",
			initials: "TX",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "PAYE Return (P10) Due Soon",
			sub: "Due in 3 days · KES 450,200 pending extract",
			btnLabel: "Extract",
			btnClass: "btnPmP",
			modal: "statutoryDeductionsModal",
		},
		{
			icon: "bi-person-lock",
			initials: "AU",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Auditor access expiring",
			sub: "KPMG Audit Team · Expires in 48 hrs",
			btnLabel: "Extend",
			modal: "inviteAuditorModal",
		},
	],
	insightItems: [
		{
			icon: "bi-stars",
			initials: "CS",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Top 5 clients driving 62% of revenue",
			sub: "High concentration risk identified",
			btnLabel: "Analyze",
			modal: "customerSpendAnalyticsModal",
		},
		{
			icon: "bi-graph-up-arrow",
			initials: "EX",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Software subscriptions up 18%",
			sub: "Unused SaaS licenses detected",
			btnLabel: "Review",
			modal: "vendorExpenseAnalyticsModal",
		},
		{
			icon: "bi-cash-stack",
			initials: "CF",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Cash flow dip predicted next Friday",
			sub: "Payroll + supplier runs overlap",
			btnLabel: "Forecast",
			modal: "cashFlowForecastModal",
		},
	],
	quickActions: [
		{
			icon: "bi-file-earmark-plus",
			iconColor: "var(--pm-primary)",
			label: "Custom Report",
			modal: "generateCustomReportModal",
		},
		{
			icon: "bi-calendar2-check",
			iconColor: "var(--pm-accent)",
			label: "Month-End",
			modal: "runMonthEndModal",
		},
		{
			icon: "bi-bank",
			iconColor: "var(--pm-warning)",
			label: "KRA VAT Extract",
			modal: "exportKRAVATModal",
		},
		{
			icon: "bi-shield-lock",
			iconColor: "var(--pm-purple)",
			label: "Audit Trail",
			modal: "viewAuditLogModal",
		},
		{
			icon: "bi-graph-up-arrow",
			iconColor: "var(--pm-info)",
			label: "P&L Snapshot",
			modal: "plSnapshotModal",
		},
		{
			icon: "bi-file-spreadsheet",
			iconColor: "var(--pm-danger)",
			label: "Trial Balance",
			modal: "exportTrialBalanceModal",
		},
		{
			icon: "bi-receipt",
			iconColor: "var(--pm-muted)",
			label: "e-TIMS Recon",
			modal: "eTimsReconciliationModal",
		},
		{
			icon: "bi-sliders",
			iconColor: "var(--pm-primary)",
			label: "Dashboards",
			modal: "configureDashboardsModal",
		},
	],
	reports: [
		{
			name: "Q2 Income Statement",
			type: "Financial",
			generatedBy: "Titus G.",
			date: "28 Jun 2025",
			format: "PDF",
			modal: "downloadStatementModal",
		},
		{
			name: "May Payroll Extract",
			type: "Operational",
			generatedBy: "System (Auto)",
			date: "01 Jun 2025",
			format: "CSV",
			modal: "downloadStatementModal",
		},
		{
			name: "Trial Balance (YTD)",
			type: "Financial",
			generatedBy: "Grace M.",
			date: "15 Jun 2025",
			format: "Excel",
			modal: "exportTrialBalanceModal",
		},
		{
			name: "Supplier Aging Summary",
			type: "Operational",
			generatedBy: "Titus G.",
			date: "10 Jun 2025",
			format: "PDF",
			modal: "downloadStatementModal",
		},
	],
	auditLogs: [
		{
			timestamp: "28 Jun, 14:32:01",
			user: "Titus G. (Admin)",
			action: "Approved Bulk Disbursement (ID: 9921)",
			ip: "197.232.14.8",
			status: "Success",
			statusTone: "badgeS",
			modal: "userActivityLogModal",
		},
		{
			timestamp: "28 Jun, 10:15:44",
			user: "System Automation",
			action: "Generated VAT Extract (June)",
			ip: "Internal",
			status: "Success",
			statusTone: "badgeS",
			modal: "userActivityLogModal",
		},
		{
			timestamp: "27 Jun, 16:45:12",
			user: "Grace M. (Finance)",
			action: "Initiated Payroll Run (June)",
			ip: "197.232.14.8",
			status: "Pending Approval",
			statusTone: "badgeI",
			modal: "userActivityLogModal",
		},
		{
			timestamp: "27 Jun, 09:12:33",
			user: "James K. (Sales)",
			action: "Voided Invoice #INV-2041",
			ip: "105.161.88.2",
			status: "Logged",
			statusTone: "badgeW",
			modal: "disputeAuditModal",
		},
		{
			timestamp: "26 Jun, 23:55:01",
			user: "System Automation",
			action: "Daily EOD Ledger Lock",
			ip: "Internal",
			status: "Success",
			statusTone: "badgeS",
			modal: "userActivityLogModal",
		},
	],
};

/**
 * Frontend-only demo: no /api/business-dashboard/financial-reporting backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchFRData(): Promise<FRConfig> {
	try {
		const res = await fetch("/api/business-dashboard/financial-reporting", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as FRConfig;
	} catch {
		return initialMockData;
	}
}

export default function FinancialReporting() {
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
				icon: "bi-person-lock",
				label: "Auditor Access",
				onClick: () => setActiveModal("inviteAuditorModal"),
			},
			{
				icon: "bi-calendar2-check",
				label: "Month-End Close",
				onClick: () => setActiveModal("runMonthEndModal"),
			},
			{
				icon: "bi-file-earmark-plus",
				label: "Create Report",
				tone: "primary",
				onClick: () => setActiveModal("generateCustomReportModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["financial-reporting"],
		queryFn: fetchFRData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
	const config = apiData ?? initialMockData;

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<FinancialReportingBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<FinancialReportingModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
