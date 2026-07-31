import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import BusinessOnboardingBody from "../components/BusinessOnboardingBody";
import BusinessOnboardingModals from "../components/BusinessOnboardingModals";
import styles from "../styles/business-onboarding.module.css";

/* ============================================================================
   PayMo BaaS — Business Onboarding & KYB/KYC Center (legacy page 3.12)
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
interface PipelineItem {
	name: string;
	type: string;
	cr12: string;
	progress: number;
	badge: string;
	tone: BadgeTone;
}
interface AppTypeRow {
	label: string;
	count: number;
}
interface AutoValidation {
	label: string;
	value: number;
	bg: string;
	color: string;
	sub: string;
}
interface DocQueueRow {
	business: string;
	document: string;
	status: string;
	statusTone: BadgeTone;
	uploaded: string;
	expiry: string;
	action: string;
	modal: string;
}
interface DocTypeRow {
	label: string;
	count: number;
	tone: BadgeTone;
}
interface UBORow {
	business: string;
	detail: string;
	status: string;
	tone: BadgeTone;
}
interface DirectorRow {
	name: string;
	detail: string;
	status: string;
	tone: BadgeTone;
}
interface StatusRow {
	label: string;
	value: number;
}
interface ApprovalRow {
	level: string;
	count: number;
	tone: BadgeTone;
}
interface AlertRow {
	label: string;
	count: number;
}
interface ActivityRow {
	date: string;
	business: string;
	action: string;
	user: string;
	status: string;
	statusTone: BadgeTone;
	ref: string;
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
interface NotifItem {
	bg: string;
	textColor: string;
	title: string;
	sub: string;
}

interface OnboardConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle: string;
	pageSub: string;
	pipeline: PipelineItem[];
	appTypes: AppTypeRow[];
	autoValidation: AutoValidation[];
	docQueue: DocQueueRow[];
	docTypes: DocTypeRow[];
	uboRows: UBORow[];
	directorRows: DirectorRow[];
	statusRows: StatusRow[];
	approvalRows: ApprovalRow[];
	alertRows: AlertRow[];
	activityRows: ActivityRow[];
	attentionItems: AttentionItem[];
	suggestions: SuggestionItem[];
	quickActions: QuickAction[];
	notifications: NotifItem[];
}

const initialMockData: OnboardConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", title: "Overview" },
		{ icon: "bi-lightning-charge", title: "Payments" },
		{ icon: "bi-briefcase", title: "Onboarding", active: true, dot: true },
		{ icon: "bi-wallet2", title: "Treasury" },
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Business Onboarding & KYB/KYC Center",
	headerSub:
		"Complete KYB/KYC intake, beneficial ownership, director verification, compliance scoring and approval workflows",
	searchPlaceholder:
		"Search businesses, directors, KRA PINs, compliance cases...",
	user: { initials: "JM", name: "James M.", role: "Compliance Lead" },
	breadcrumb: {
		parent: "Business Portal",
		mid: "Compliance",
		current: "Onboarding & KYB/KYC",
	},
	pageTitle: "Business Onboarding & KYB/KYC Center",
	pageSub:
		"Onboard sole proprietors, partnerships, LLCs, SACCOs and NGOs. Manage KYB/KYC intake, beneficial ownership declarations, director verification, compliance scoring and full audit trails.",
	pipeline: [
		{
			name: "Greenfield Logistics Ltd",
			type: "LLC",
			cr12: "CR12-88291",
			progress: 92,
			badge: "Docs Pending",
			tone: "badgeW",
		},
		{
			name: "Shalom SACCO",
			type: "Cooperative",
			cr12: "CR12-99102",
			progress: 78,
			badge: "KYC Review",
			tone: "badgeI",
		},
		{
			name: "Mama Mboga Traders",
			type: "Sole Prop",
			cr12: "CR12-77192",
			progress: 45,
			badge: "Incomplete",
			tone: "badgeD",
		},
		{
			name: "Hope Children NGO",
			type: "NGO",
			cr12: "CR12-44821",
			progress: 100,
			badge: "Approved",
			tone: "badgeS",
		},
		{
			name: "TechNova Solutions",
			type: "LLC",
			cr12: "CR12-99128",
			progress: 65,
			badge: "Director KYC",
			tone: "badgeW",
		},
	],
	appTypes: [
		{ label: "Sole Proprietorship", count: 28 },
		{ label: "Limited Liability Company", count: 19 },
		{ label: "Partnership", count: 11 },
		{ label: "SACCO / Cooperative", count: 7 },
		{ label: "NGO / Trust", count: 4 },
		{ label: "Corporate Group", count: 3 },
		{ label: "Foreign Branch", count: 2 },
	],
	autoValidation: [
		{
			label: "CR12 VERIFIED",
			value: 61,
			bg: "var(--pm-accent-soft)",
			color: "var(--pm-accent)",
			sub: "Businesses matched with BRS",
		},
		{
			label: "KRA PIN VERIFIED",
			value: 57,
			bg: "var(--pm-info-soft)",
			color: "var(--pm-info)",
			sub: "Active tax status confirmed",
		},
		{
			label: "MANUAL REVIEW",
			value: 12,
			bg: "var(--pm-warning-soft)",
			color: "var(--pm-warning)",
			sub: "Ownership structure complex",
		},
	],
	docQueue: [
		{
			business: "Greenfield Logistics",
			document: "TCC (KRA)",
			status: "Pending Review",
			statusTone: "badgeW",
			uploaded: "25 Jun 2025",
			expiry: "30 Jun 2025",
			action: "Review",
			modal: "verifyDocumentModal",
		},
		{
			business: "Shalom SACCO",
			document: "Certificate of Registration",
			status: "Verified",
			statusTone: "badgeS",
			uploaded: "20 Jun 2025",
			expiry: "—",
			action: "View",
			modal: "viewDocumentModal",
		},
		{
			business: "Mama Mboga Traders",
			document: "County Single Business Permit",
			status: "Pending Review",
			statusTone: "badgeW",
			uploaded: "26 Jun 2025",
			expiry: "31 Dec 2025",
			action: "Review",
			modal: "verifyDocumentModal",
		},
		{
			business: "TechNova Solutions",
			document: "Director ID (Huduma)",
			status: "OCR Complete",
			statusTone: "badgeI",
			uploaded: "24 Jun 2025",
			expiry: "—",
			action: "Verify",
			modal: "directorKYCModal",
		},
		{
			business: "Hope Children NGO",
			document: "CR12 Extract",
			status: "Verified",
			statusTone: "badgeS",
			uploaded: "18 Jun 2025",
			expiry: "—",
			action: "View",
			modal: "viewDocumentModal",
		},
	],
	docTypes: [
		{ label: "Certificate of Incorporation", count: 61, tone: "badgeS" },
		{ label: "KRA PIN Certificate", count: 57, tone: "badgeS" },
		{ label: "Tax Compliance Certificate", count: 38, tone: "badgeW" },
		{ label: "County Business Permit", count: 29, tone: "badgeW" },
		{ label: "Director IDs", count: 84, tone: "badgeI" },
		{ label: "Beneficial Ownership Declaration", count: 52, tone: "badgeS" },
		{ label: "CR12 Extract", count: 61, tone: "badgeS" },
	],
	uboRows: [
		{
			business: "Greenfield Logistics Ltd",
			detail: "5 shareholders · 3 UBOs declared",
			status: "Complete",
			tone: "badgeS",
		},
		{
			business: "Shalom SACCO",
			detail: "12 board members · 2 UBOs",
			status: "Pending",
			tone: "badgeW",
		},
		{
			business: "TechNova Solutions",
			detail: "3 shareholders · 2 UBOs",
			status: "Complete",
			tone: "badgeS",
		},
		{
			business: "Hope Children NGO",
			detail: "7 trustees · 1 UBO",
			status: "Complete",
			tone: "badgeS",
		},
	],
	directorRows: [
		{
			name: "Peter Ochieng — Greenfield",
			detail: "Huduma ID uploaded · PEP check passed",
			status: "Verified",
			tone: "badgeS",
		},
		{
			name: "Grace Wanjiku — TechNova",
			detail: "Passport uploaded · Awaiting selfie",
			status: "OCR Done",
			tone: "badgeI",
		},
		{
			name: "John Kamau — Shalom SACCO",
			detail: "No documents received",
			status: "Missing",
			tone: "badgeD",
		},
		{
			name: "Fatima Ali — Hope Children",
			detail: "ID + selfie verified",
			status: "Verified",
			tone: "badgeS",
		},
	],
	statusRows: [
		{ label: "Completed & Active", value: 84 },
		{ label: "Pending Director KYC", value: 7 },
		{ label: "Pending Document Review", value: 11 },
		{ label: "Under Compliance Review", value: 4 },
		{ label: "Rejected / Withdrawn", value: 3 },
	],
	approvalRows: [
		{ level: "Level 1 — Intake Officer", count: 42, tone: "badgeS" },
		{ level: "Level 2 — Compliance Analyst", count: 18, tone: "badgeW" },
		{ level: "Level 3 — Senior Compliance", count: 9, tone: "badgeI" },
		{ level: "Level 4 — Head of Compliance", count: 3, tone: "badgeP" },
		{ level: "Board Approval Required", count: 2, tone: "badgeD" },
	],
	alertRows: [
		{ label: "TCC Expiring (30 days)", count: 7 },
		{ label: "County Permit Expiring", count: 3 },
		{ label: "Director ID Expiring", count: 1 },
		{ label: "PEP Flag Review", count: 2 },
		{ label: "Adverse Media Alert", count: 1 },
	],
	activityRows: [
		{
			date: "27 Jun 2025",
			business: "Greenfield Logistics",
			action: "TCC Upload",
			user: "Compliance Analyst",
			status: "Under Review",
			statusTone: "badgeW",
			ref: "DOC-88291",
			modal: "verifyDocumentModal",
		},
		{
			date: "26 Jun 2025",
			business: "Shalom SACCO",
			action: "Director KYC Verified",
			user: "James M.",
			status: "Verified",
			statusTone: "badgeS",
			ref: "KYC-99102",
			modal: "directorKYCModal",
		},
		{
			date: "26 Jun 2025",
			business: "TechNova Solutions",
			action: "Beneficial Owner Added",
			user: "Compliance Analyst",
			status: "Complete",
			statusTone: "badgeS",
			ref: "UBO-99128",
			modal: "beneficialOwnerModal",
		},
		{
			date: "25 Jun 2025",
			business: "Mama Mboga Traders",
			action: "Application Submitted",
			user: "Self-Service",
			status: "Incomplete",
			statusTone: "badgeD",
			ref: "APP-77192",
			modal: "onboardNewModal",
		},
		{
			date: "24 Jun 2025",
			business: "Hope Children NGO",
			action: "Approved",
			user: "Head of Compliance",
			status: "Active",
			statusTone: "badgeS",
			ref: "APP-44821",
			modal: "viewBusinessModal",
		},
	],
	attentionItems: [
		{
			icon: "bi-building",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Nairobi SACCO — TCC expires in 4 days",
			sub: "KRA-TCC-88291 · Renewal required",
			btnLabel: "Renew",
			modal: "renewTCCModal",
		},
		{
			icon: "bi-person-badge",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Director KYC pending — 7 days",
			sub: "Peter Ochieng · Huduma ID upload",
			btnLabel: "Verify",
			modal: "directorKYCModal",
		},
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Beneficial ownership declaration overdue",
			sub: "Greenfield Logistics · 5 shareholders",
			btnLabel: "Complete",
			modal: "beneficialOwnerModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightning",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Auto-renew 4 expiring TCCs",
			sub: "Prevent compliance gaps",
			btnLabel: "Auto-Renew",
			modal: "bulkRenewalModal",
		},
		{
			icon: "bi-file-earmark-check",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Pre-fill 3 new applications from BRS data",
			sub: "CR12 records available",
			btnLabel: "Pre-fill",
			modal: "preFillModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "High-risk business flagged",
			sub: "Unusual ownership structure",
			btnLabel: "Review",
			modal: "riskAssessmentModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-circle",
			iconColor: "var(--pm-primary)",
			label: "New Business",
			modal: "onboardNewModal",
		},
		{
			icon: "bi-person-badge",
			iconColor: "var(--pm-info)",
			label: "Director KYC",
			modal: "directorKYCModal",
		},
		{
			icon: "bi-people",
			iconColor: "var(--pm-purple)",
			label: "Beneficial Owner",
			modal: "beneficialOwnerModal",
		},
		{
			icon: "bi-upload",
			iconColor: "var(--pm-accent)",
			label: "Upload Docs",
			modal: "uploadDocumentModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconColor: "var(--pm-warning)",
			label: "Risk Assessment",
			modal: "riskAssessmentModal",
		},
		{
			icon: "bi-check2-circle",
			iconColor: "var(--pm-accent)",
			label: "Compliance Check",
			modal: "complianceCheckModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-primary)",
			label: "Renew TCC",
			modal: "renewTCCModal",
		},
		{
			icon: "bi-clock-history",
			iconColor: "var(--pm-accent)",
			label: "Audit Trail",
			modal: "auditTrailModal",
		},
	],
	notifications: [
		{
			bg: "var(--pm-danger-soft)",
			textColor: "#7F1D1D",
			title: "TCC expiring in 4 days",
			sub: "Nairobi SACCO — KRA-TCC-88291",
		},
		{
			bg: "var(--pm-warning-soft)",
			textColor: "#92400E",
			title: "Director KYC pending 7 days",
			sub: "Peter Ochieng — Greenfield Logistics",
		},
		{
			bg: "var(--pm-info-soft)",
			textColor: "#1E40AF",
			title: "Beneficial ownership overdue",
			sub: "Greenfield Logistics — 5 shareholders",
		},
		{
			bg: "var(--pm-accent-soft)",
			textColor: "#065F46",
			title: "Application approved",
			sub: "Hope Children NGO — Full access granted",
		},
		{
			bg: "#fff",
			textColor: "var(--pm-muted)",
			title: "New application received",
			sub: "Mama Mboga Traders — 45% complete",
		},
	],
};

/**
 * Frontend-only demo: no /api/business/business-onboarding backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchOnboardContent(): Promise<OnboardConfig> {
	try {
		const res = await fetch("/api/business/business-onboarding", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as OnboardConfig;
	} catch {
		return initialMockData;
	}
}

export default function BusinessOnboarding() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-shield-check",
				label: "Compliance Check",
				onClick: () => setActiveModal("complianceCheckModal"),
			},
			{
				icon: "bi-list-task",
				label: "Pending Queue",
				onClick: () => setActiveModal("pendingQueueModal"),
			},
			{
				icon: "bi-plus-lg",
				label: "Onboard Business",
				onClick: () => setActiveModal("onboardNewModal"),
			},
			{
				icon: "bi-upload",
				label: "Bulk Onboard",
				tone: "primary",
				onClick: () => setActiveModal("bulkOnboardModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["business-onboarding"],
		queryFn: fetchOnboardContent,
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
				<BusinessOnboardingBody
					onOpen={setActiveModal}
					onAction={() => setActiveModal(null)}
				/>
			</div>
			<BusinessOnboardingModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
