import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import PayrollHrBody from "../components/PayrollHrBody";
import PayrollHrExtraModals from "../components/PayrollHrExtraModals";
import PayrollHrModals from "../components/PayrollHrModals";
import styles from "../styles/payroll-hr.module.css";

/* ============================================================================
   PayMo BaaS — Payroll & HR (legacy page 3.4)
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
	extra?: { label: string; value: string }[];
	progress?: { percent: number; color: string };
	avatarGroup?: { initials: string[]; bg: string };
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
interface ComplianceAlert {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	tone: BadgeTone;
}
interface EmployeeRow {
	name: string;
	department: string;
	position: string;
	salary: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface BatchRow {
	id: string;
	period: string;
	employees: number;
	totalCost: string;
	status: string;
	statusTone: BadgeTone;
	modal: string;
}
interface ActionCard {
	key: string;
	icon: string;
	iconColor: string;
	title: string;
	desc: string;
	modal: string;
}
interface RequestRow {
	name: string;
	type: string;
	dates: string;
	amount: string;
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

interface PayrollConfig {
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
	complianceAlerts: ComplianceAlert[];
	quickActions: QuickAction[];
	employees: EmployeeRow[];
	batches: BatchRow[];
	actionCards: ActionCard[];
	requests: RequestRow[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: PayrollConfig = {
	nav: [
		{ icon: "bi-house", title: "Business Overview" },
		{ icon: "bi-shop", title: "Collections" },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll", active: true, dot: true },
		{ icon: "bi-send", title: "Bulk Disbursements" },
		{ icon: "bi-cash-coin", title: "Accounts Payable" },
		{ icon: "bi-gear", title: "Business Settings" },
	],
	headerTitle: "Acme Corp Ltd",
	headerSub: "142 Active Employees · KRA: P051234567M",
	searchPlaceholder: "Search employees, payroll runs, payslips, compliance...",
	user: {
		initials: "A",
		name: "Admin",
		role: "HR Manager",
		avatarBg: "linear-gradient(135deg, #A7F3D0 0%, #34D399 100%)",
	},
	breadcrumb: { parent: "Business Portal", current: "Payroll & HR" },
	// // pageTitle: "Payroll & Salary Disbursement",
	// pageSub:
	// 	"Manage employees, run payroll, generate payslips, and ensure statutory compliance.",
	heroStats: [
		{
			key: "nextPayroll",
			col: "col-lg-3 col-md-6",
			label: "NEXT PAYROLL",
			value: "28 Jun 2025",
			badge: { icon: "bi-calendar", text: "Regular Run", tone: "badgeI" },
			extra: [
				{ label: "Type", value: "Monthly" },
				{ label: "Approver", value: "CFO" },
			],
		},
		{
			key: "totalCost",
			col: "col-lg-3 col-md-6",
			label: "EST. TOTAL COST",
			value: "KES 4.2M",
			badge: {
				icon: "bi-graph-up-arrow",
				text: "Within budget",
				tone: "badgeS",
			},
			progress: { percent: 78, color: "var(--pm-accent)" },
			extra: [
				{ label: "Budget", value: "KES 5.4M" },
				{ label: "Utilized", value: "78%" },
			],
		},
		{
			key: "employees",
			col: "col-lg-3 col-md-6",
			label: "ACTIVE EMPLOYEES",
			value: "142",
			badge: { icon: "bi-plus-circle", text: "+3 this month", tone: "badgeS" },
			avatarGroup: {
				initials: ["JM", "AK", "SW", "PK", "AD"],
				bg: "var(--pm-accent-soft)",
			},
		},
		{
			key: "compliance",
			col: "col-lg-3 col-md-6",
			label: "COMPLIANCE STATUS",
			value: "Updating",
			badge: { icon: "bi-shield-check", text: "KRA P10 Ready", tone: "badgeS" },
			extra: [
				{ label: "SHIF/NSSF", value: "Updating" },
				{ label: "Housing Levy", value: "Compliant" },
			],
		},
	],
	attentionItems: [
		{
			icon: "bi-calendar-x",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "4 Leave Requests Pending",
			sub: "John M. (3 days), Mary K. (2 days), 2 others",
			btnLabel: "Review",
			btnClass: "",
			modal: "leaveApprovalModal",
		},
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Missing KRA PINs for 3 Employees",
			sub: "Required before next payroll run on 28 Jun",
			btnLabel: "Fix Now",
			btnClass: "btnPmD",
			modal: "editEmployeeModal",
		},
		{
			icon: "bi-cash-coin",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "2 Expense Claims Submitted",
			sub: "Mary K. KES 4,500 · Ali O. KES 2,800",
			btnLabel: "Approve",
			modal: "expenseApprovalModal",
		},
		{
			icon: "bi-bank",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "2 Invalid Bank Accounts",
			sub: "Wanjiku N. & Grace T. — account length mismatch",
			btnLabel: "Fix",
			btnClass: "btnPmD",
			modal: "editEmployeeModal",
		},
	],
	complianceAlerts: [
		{
			icon: "bi-file-earmark-text",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "P9A Certificates Ready",
			sub: "Download and distribute to all 142 employees",
			tone: "badgeS",
		},
		{
			icon: "bi-shield-check",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "SHIF Deduction Updated",
			sub: "New rate: 2.75% effective July 2025",
			tone: "badgeI",
		},
		{
			icon: "bi-building",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Housing Levy Compliance",
			sub: "1.5% employer + 1.5% employee contribution",
			tone: "badgeW",
		},
		{
			icon: "bi-calendar-check",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "File May Statutory Returns",
			sub: "Deadline: 9 Jul 2025 · KES 312K total",
			tone: "badgeD",
		},
	],
	quickActions: [
		{
			icon: "bi-people",
			iconColor: "var(--pm-primary)",
			label: "Run Payroll",
			modal: "runPayrollModal",
		},
		{
			icon: "bi-person-plus",
			iconColor: "var(--pm-accent)",
			label: "Add Employee",
			modal: "addEmployeeModal",
		},
		{
			icon: "bi-check-circle",
			iconColor: "var(--pm-info)",
			label: "Approve Run",
			modal: "approvePayrollModal",
		},
		{
			icon: "bi-send",
			iconColor: "var(--pm-purple)",
			label: "B2C Disburse",
			modal: "payMpesaBulkModal",
		},
		{
			icon: "bi-sliders",
			iconColor: "var(--pm-warning)",
			label: "Components",
			modal: "salaryComponentsModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-danger)",
			label: "Tax Reports",
			modal: "generateReportsModal",
		},
		{
			icon: "bi-envelope",
			iconColor: "var(--pm-info)",
			label: "Send Payslips",
			modal: "sendPayslipsModal",
		},
		{
			icon: "bi-laptop",
			iconColor: "var(--pm-muted)",
			label: "ESS Portal",
			modal: "employeeSelfServiceModal",
		},
	],
	employees: [
		{
			name: "John Mwangi",
			department: "Finance",
			position: "Senior Accountant",
			salary: "KES 85,000",
			status: "Active",
			statusTone: "badgeS",
			modal: "editEmployeeModal",
		},
		{
			name: "Mary Kamau",
			department: "HR",
			position: "HR Manager",
			salary: "KES 95,000",
			status: "Active",
			statusTone: "badgeS",
			modal: "editEmployeeModal",
		},
		{
			name: "Ali Omondi",
			department: "Operations",
			position: "Ops Supervisor",
			salary: "KES 72,000",
			status: "New",
			statusTone: "badgeI",
			modal: "editEmployeeModal",
		},
		{
			name: "Wanjiku Njeri",
			department: "Sales",
			position: "Sales Lead",
			salary: "KES 68,000",
			status: "Bank Issue",
			statusTone: "badgeD",
			modal: "editEmployeeModal",
		},
	],
	batches: [
		{
			id: "PRL-2025-06-REG",
			period: "June 2025",
			employees: 142,
			totalCost: "KES 4.2M",
			status: "Pending Approval",
			statusTone: "badgeW",
			modal: "approvePayrollModal",
		},
		{
			id: "PRL-2025-05-REG",
			period: "May 2025",
			employees: 139,
			totalCost: "KES 4.05M",
			status: "Completed",
			statusTone: "badgeS",
			modal: "disbursementTrackingModal",
		},
		{
			id: "PRL-2025-04-REG",
			period: "April 2025",
			employees: 137,
			totalCost: "KES 3.95M",
			status: "Completed",
			statusTone: "badgeS",
			modal: "disbursementTrackingModal",
		},
	],
	actionCards: [
		{
			key: "payslips",
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-primary)",
			title: "Generate Payslips",
			desc: "PDF payslips for all 142 employees",
			modal: "sendPayslipsModal",
		},
		{
			key: "p10",
			icon: "bi-shield-check",
			iconColor: "var(--pm-accent)",
			title: "P10 Tax Return",
			desc: "Monthly KRA tax filing",
			modal: "generateReportsModal",
		},
		{
			key: "shif",
			icon: "bi-heart-pulse",
			iconColor: "var(--pm-info)",
			title: "SHIF/NSSF Filing",
			desc: "Statutory deductions filing",
			modal: "generateReportsModal",
		},
		{
			key: "annual",
			icon: "bi-calendar-check",
			iconColor: "var(--pm-warning)",
			title: "Annual P9A",
			desc: "Year-end tax certificates",
			modal: "annualP9Modal",
		},
	],
	requests: [
		{
			name: "John Mwangi",
			type: "Annual Leave",
			dates: "28 Jun – 2 Jul",
			amount: "3 days",
			status: "Pending",
			statusTone: "badgeW",
			modal: "leaveApprovalModal",
		},
		{
			name: "Mary Kamau",
			type: "Expense Claim",
			dates: "20 Jun",
			amount: "KES 4,500",
			status: "Submitted",
			statusTone: "badgeI",
			modal: "expenseApprovalModal",
		},
		{
			name: "Ali Omondi",
			type: "Expense Claim",
			dates: "19 Jun",
			amount: "KES 2,800",
			status: "Submitted",
			statusTone: "badgeI",
			modal: "expenseApprovalModal",
		},
		{
			name: "Grace T.",
			type: "Annual Leave",
			dates: "5-7 Jul",
			amount: "2 days",
			status: "Pending",
			statusTone: "badgeW",
			modal: "leaveApprovalModal",
		},
	],
};

/* ---------- TanStack Query fetcher ---------- */
/**
 * Frontend-only demo: no /api/business-dashboard/payroll-hr backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchPayrollData(): Promise<PayrollConfig> {
	try {
		const res = await fetch("/api/business-dashboard/payroll-hr", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as PayrollConfig;
	} catch {
		return initialMockData;
	}
}

export default function PayrollHr() {
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
				icon: "bi-shield-check",
				label: "Compliance Hub",
				onClick: () => setActiveModal("complianceAlertsModal"),
			},
			{
				icon: "bi-file-earmark-excel",
				label: "Import Roster",
				onClick: () => setActiveModal("importEmployeesModal"),
			},
			{
				icon: "bi-person-plus",
				label: "Add Employee",
				tone: "accent",
				onClick: () => setActiveModal("addEmployeeModal"),
			},
			{
				icon: "bi-play-circle",
				label: "Run Payroll",
				tone: "primary",
				onClick: () => setActiveModal("runPayrollModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["payroll-hr"],
		queryFn: fetchPayrollData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});

	const config = apiData ?? initialMockData;

	return (
		<div className={s.bizPage}>
			<div className={s.content}>
				<PayrollHrBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<PayrollHrModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<PayrollHrExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
