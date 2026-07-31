import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import VirtualAccountsBody from "../components/VirtualAccountsBody";
import VirtualAccountsExtraModals from "../components/VirtualAccountsExtraModals";
import VirtualAccountsModals from "../components/VirtualAccountsModals";
import styles from "../styles/virtual-accounts.module.css";

/* ============================================================================
   PayMo BaaS — Virtual Accounts & Sub-Accounts (legacy page 3.9)
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
interface VARow {
	id: string;
	name: string;
	type: string;
	balance: string;
	subs: number;
	status: string;
	rules: number;
}
interface SubRow {
	id: string;
	name: string;
	parent: string;
	balance: string;
	limit: string;
	status: string;
}
interface FundingRow {
	date: string;
	va: string;
	desc: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
}
interface ReconRow {
	va: string;
	book: string;
	bank: string;
	diff: string;
	status: string;
	statusTone: BadgeTone;
	action?: string;
}
interface LimitRow {
	label: string;
	value: string;
	tone: BadgeTone;
}
interface RuleRow {
	label: string;
	status: string;
	tone: BadgeTone;
}
interface SweepRow {
	label: string;
	status: string;
	tone: BadgeTone;
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
interface HealthRow {
	account: string;
	score: number;
	issues: string;
	status: string;
	tone: BadgeTone;
}
interface ApprovalRow {
	label: string;
	level: string;
	tone: BadgeTone;
}

interface VAConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle: string;
	pageSub: string;
	attentionItems: AttentionItem[];
	suggestions: SuggestionItem[];
	quickActions: QuickAction[];
	vaRows: VARow[];
	subRows: SubRow[];
	fundingRows: FundingRow[];
	reconRows: ReconRow[];
	limits: LimitRow[];
	approvalMatrix: ApprovalRow[];
	rules: RuleRow[];
	sweeps: SweepRow[];
	healthRows: HealthRow[];
}

const initialMockData: VAConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", title: "Overview" },
		{ icon: "bi-lightning-charge", title: "Payments" },
		{ icon: "bi-briefcase", title: "Services" },
		{ icon: "bi-wallet2", title: "Treasury" },
		{ icon: "bi-diagram-3", title: "Virtual Accts", active: true, dot: true },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Virtual Accounts & Sub-Accounts",
	headerSub:
		"Business virtual accounts, sub-account hierarchy, funding, reconciliation & automation",
	searchPlaceholder:
		"Search virtual accounts, sub-accounts, transactions, rules...",
	user: { initials: "BK", name: "Business Owner", role: "Finance Director" },
	breadcrumb: {
		parent: "Business Portal",
		mid: "Treasury",
		current: "Virtual Accounts",
	},
	pageTitle: "PAGE 3.9 — Virtual Accounts & Sub-Accounts",
	pageSub:
		"Create, manage and reconcile business virtual accounts and sub-accounts with full funding controls, hierarchy, automation rules and audit trails.",
	attentionItems: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Unmatched credit KES 1.2M",
			sub: "VA-003 • 26 Jun",
			btnLabel: "Resolve",
			modal: "reconModal",
		},
		{
			icon: "bi-clock",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Sub-account limit breach",
			sub: "Payroll Sub • KES 450K over",
			btnLabel: "Adjust",
			modal: "subLimitModal",
		},
		{
			icon: "bi-pause-circle",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Auto-sweep rule paused",
			sub: "Collections VA • 3 days",
			btnLabel: "Resume",
			modal: "autoSweepModal",
		},
		{
			icon: "bi-exclamation-diamond",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Bank error ticket open",
			sub: "Duplicate debit KES 125K",
			btnLabel: "Track",
			modal: "bankErrorModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightbulb",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Consolidate 3 inactive VAs",
			sub: "Save KES 12,500/year in fees",
			btnLabel: "Review",
			modal: "consolidateModal",
		},
		{
			icon: "bi-shield-check",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Enable dual approval",
			sub: "For sub-accounts > KES 500K",
			btnLabel: "Enable",
			modal: "approvalRulesModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Optimize sweep rules",
			sub: "3 rules could reduce idle balances",
			btnLabel: "Optimize",
			modal: "autoSweepModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Monthly reconciliation report ready",
			sub: "June 2025 • 99.2% match rate",
			btnLabel: "View",
			modal: "exportReportModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-lg",
			iconColor: "var(--pm-primary)",
			label: "New VA",
			modal: "createVA",
		},
		{
			icon: "bi-diagram-3",
			iconColor: "var(--pm-accent)",
			label: "New Sub",
			modal: "createSub",
		},
		{
			icon: "bi-cash-stack",
			iconColor: "var(--pm-warning)",
			label: "Fund VA",
			modal: "fundVA",
		},
		{
			icon: "bi-list-check",
			iconColor: "var(--pm-info)",
			label: "Reconcile",
			modal: "reconModal",
		},
		{
			icon: "bi-upload",
			iconColor: "var(--pm-purple)",
			label: "Bulk Upload",
			modal: "bulkFundModal",
		},
		{
			icon: "bi-file-earmark-spreadsheet",
			iconColor: "var(--pm-danger)",
			label: "Export",
			modal: "exportReportModal",
		},
	],
	vaRows: [
		{
			id: "VA-001",
			name: "Operations",
			type: "General",
			balance: "8.9M",
			subs: 3,
			status: "Active",
			rules: 2,
		},
		{
			id: "VA-003",
			name: "Client Collections",
			type: "Collections",
			balance: "12.4M",
			subs: 8,
			status: "Active",
			rules: 3,
		},
		{
			id: "VA-007",
			name: "Payroll",
			type: "Restricted",
			balance: "22.1M",
			subs: 5,
			status: "Active",
			rules: 1,
		},
		{
			id: "VA-009",
			name: "Marketing",
			type: "Project",
			balance: "3.2M",
			subs: 4,
			status: "Active",
			rules: 2,
		},
		{
			id: "VA-012",
			name: "Old Project Reserve",
			type: "Reserve",
			balance: "1.2M",
			subs: 0,
			status: "Active",
			rules: 0,
		},
	],
	subRows: [
		{
			id: "SUB-0142",
			name: "Project Alpha",
			parent: "VA-003",
			balance: "2.1M",
			limit: "2.5M",
			status: "active",
		},
		{
			id: "SUB-0143",
			name: "Project Beta",
			parent: "VA-003",
			balance: "1.8M",
			limit: "2.0M",
			status: "active",
		},
		{
			id: "SUB-0144",
			name: "Project Gamma",
			parent: "VA-003",
			balance: "2.45M",
			limit: "2.0M",
			status: "warning",
		},
		{
			id: "SUB-0071",
			name: "June Salaries",
			parent: "VA-007",
			balance: "8.9M",
			limit: "10M",
			status: "active",
		},
		{
			id: "SUB-0121",
			name: "Campaign Q2",
			parent: "VA-009",
			balance: "450K",
			limit: "500K",
			status: "active",
		},
	],
	fundingRows: [
		{
			date: "27 Jun",
			va: "VA-003",
			desc: "Client payment",
			amount: "KES 2.45M",
			status: "Success",
			statusTone: "badgeS",
		},
		{
			date: "26 Jun",
			va: "VA-007",
			desc: "Payroll funding",
			amount: "KES 8.5M",
			status: "Success",
			statusTone: "badgeS",
		},
		{
			date: "25 Jun",
			va: "SUB-012",
			desc: "Campaign top-up",
			amount: "KES 450K",
			status: "Success",
			statusTone: "badgeS",
		},
	],
	reconRows: [
		{
			va: "VA-003",
			book: "KES 12.4M",
			bank: "KES 12.4M",
			diff: "0",
			status: "Cleared",
			statusTone: "badgeS",
		},
		{
			va: "VA-001",
			book: "KES 8.9M",
			bank: "KES 8.775M",
			diff: "KES 125K",
			status: "Bank error",
			statusTone: "badgeD",
			action: "Track",
		},
		{
			va: "VA-007",
			book: "KES 22.1M",
			bank: "KES 22.1M",
			diff: "0",
			status: "Cleared",
			statusTone: "badgeS",
		},
	],
	limits: [
		{ label: "VA-003 Daily", value: "KES 5M", tone: "badgeS" },
		{ label: "VA-007 Daily", value: "KES 10M", tone: "badgeS" },
		{ label: "SUB-0142 Daily", value: "KES 500K", tone: "badgeW" },
	],
	approvalMatrix: [
		{ label: "Up to KES 100K", level: "Auto", tone: "badgeS" },
		{ label: "KES 100K – 500K", level: "Manager", tone: "badgeI" },
		{ label: "KES 500K – 2M", level: "Director", tone: "badgeW" },
		{ label: "Above KES 2M", level: "CFO + Board", tone: "badgeD" },
	],
	rules: [
		{ label: "Auto-sweep", status: "Active", tone: "badgeS" },
		{ label: "Low balance alert", status: "Active", tone: "badgeS" },
		{ label: "Dual approval", status: "Paused", tone: "badgeW" },
	],
	sweeps: [
		{ label: "Collections → Treasury", status: "Active", tone: "badgeS" },
		{ label: "Operations → Reserve", status: "Active", tone: "badgeS" },
	],
	healthRows: [
		{
			account: "VA-003",
			score: 98,
			issues: "None",
			status: "Healthy",
			tone: "badgeS",
		},
		{
			account: "VA-007",
			score: 91,
			issues: "1 limit breach",
			status: "Warning",
			tone: "badgeW",
		},
		{
			account: "SUB-0144",
			score: 72,
			issues: "Over limit, no rule",
			status: "Critical",
			tone: "badgeD",
		},
	],
};

/**
 * Frontend-only demo: no /api/business/virtual-accounts backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchVAContent(): Promise<VAConfig> {
	try {
		const res = await fetch("/api/business/virtual-accounts", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as VAConfig;
	} catch {
		return initialMockData;
	}
}

export default function VirtualAccounts() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-heart-pulse",
				label: "Health",
				onClick: () => setActiveModal("healthCheckModal"),
			},
			{
				icon: "bi-list-check",
				label: "Reconcile",
				onClick: () => setActiveModal("reconModal"),
			},
			{
				icon: "bi-plus-lg",
				label: "New VA",
				onClick: () => setActiveModal("createVA"),
			},
			{
				icon: "bi-diagram-3",
				label: "New Sub-Account",
				tone: "primary",
				onClick: () => setActiveModal("createSub"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["business-virtual-accounts"],
		queryFn: fetchVAContent,
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
				<VirtualAccountsBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>

			{/* MODALS */}
			<VirtualAccountsModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
			{/* Modals ported from the original HTML that the first pass missed */}
			<VirtualAccountsExtraModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
