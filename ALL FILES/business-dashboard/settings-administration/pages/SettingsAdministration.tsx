import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import SettingsAdministrationModals from "../components/SettingsAdministrationModals";
import styles from "../styles/settings-administration.module.css";

/* ============================================================================
   PayMo BaaS — Settings, Account & Administration (legacy page 3.14)
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
interface KycItem {
	label: string;
	detail: string;
	status: string;
	tone: BadgeTone;
}
interface UserTypeRow {
	name: string;
	role: string;
	roleTone: BadgeTone;
	dept: string;
	limit: string;
	mfa: string;
	mfaTone: BadgeTone;
	lastLogin: string;
}
interface SecurityRow {
	label: string;
	detail: string;
	status: string;
	tone: BadgeTone;
}
interface SessionRow {
	label: string;
	detail: string;
	canEnd?: boolean;
}
interface EventRow {
	label: string;
	detail: string;
}
interface IntegrationRow {
	name: string;
	detail: string;
	status: string;
	tone: BadgeTone;
}
interface ApiKeyRow {
	name: string;
	env: string;
	envTone: BadgeTone;
	created: string;
	lastUsed: string;
	status: string;
	statusTone: BadgeTone;
}
interface DeadlineRow {
	label: string;
	detail: string;
	days: string;
	tone: BadgeTone;
}
interface SupportRow {
	id: string;
	detail: string;
	status: string;
	tone: BadgeTone;
}
interface DocRow {
	label: string;
	detail: string;
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

interface SettingsConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle: string;
	pageSub: string;
	kycItems: KycItem[];
	userRows: UserTypeRow[];
	securityRows: SecurityRow[];
	sessionRows: SessionRow[];
	eventRows: EventRow[];
	integrationRows: IntegrationRow[];
	apiKeyRows: ApiKeyRow[];
	deadlineRows: DeadlineRow[];
	supportRows: SupportRow[];
	docRows: DocRow[];
	attentionItems: AttentionItem[];
	suggestions: SuggestionItem[];
	quickActions: QuickAction[];
	activityRows: ActivityRow[];
}

const initialMockData: SettingsConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", title: "Overview" },
		{ icon: "bi-briefcase", title: "Services" },
		{ icon: "bi-wallet2", title: "Treasury" },
		{ icon: "bi-credit-card", title: "Cards" },
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings", active: true, dot: true },
	],
	headerTitle: "Settings, Account & Administration",
	headerSub:
		"Business profile, KYC, users, security, compliance, integrations and support",
	searchPlaceholder: "Search settings, users, documents, compliance...",
	user: { initials: "JK", name: "James K.", role: "Business Owner" },
	breadcrumb: {
		parent: "Business Portal",
		mid: "Administration",
		current: "Settings",
	},
	pageTitle: "PAGE 3.14 — Settings, Account Details & Administration",
	pageSub:
		"Manage business identity, KYC/KYB documents, multi-business switching, user roles & permissions, security policies, integrations, compliance calendar and support tickets.",
	kycItems: [
		{
			label: "Certificate of Incorporation",
			detail: "Verified • 12 Mar 2022",
			status: "Verified",
			tone: "badgeS",
		},
		{
			label: "KRA PIN Certificate",
			detail: "Verified • 12 Mar 2022",
			status: "Verified",
			tone: "badgeS",
		},
		{
			label: "Tax Compliance Certificate",
			detail: "Expires 05 Jul 2025",
			status: "Renew",
			tone: "badgeW",
		},
		{
			label: "Director ID Verification",
			detail: "James K. • Verified",
			status: "Verified",
			tone: "badgeS",
		},
		{
			label: "Beneficial Ownership",
			detail: "3 beneficiaries declared",
			status: "Complete",
			tone: "badgeS",
		},
		{
			label: "Annual Returns",
			detail: "Filed 15 Jan 2025",
			status: "Filed",
			tone: "badgeS",
		},
		{
			label: "Business Permit (Nairobi)",
			detail: "Expires 31 Dec 2025",
			status: "Active",
			tone: "badgeI",
		},
	],
	userRows: [
		{
			name: "James Kamau",
			role: "Owner",
			roleTone: "badgeP",
			dept: "—",
			limit: "Unlimited",
			mfa: "On",
			mfaTone: "badgeS",
			lastLogin: "Today 09:12",
		},
		{
			name: "Grace Wanjiku",
			role: "Finance Manager",
			roleTone: "badgeI",
			dept: "Finance",
			limit: "KES 500,000",
			mfa: "On",
			mfaTone: "badgeS",
			lastLogin: "Today 08:45",
		},
		{
			name: "Peter Ochieng",
			role: "Accountant",
			roleTone: "badgeS",
			dept: "Finance",
			limit: "KES 100,000",
			mfa: "On",
			mfaTone: "badgeS",
			lastLogin: "26 Jun",
		},
		{
			name: "Fatima Ali",
			role: "HR Manager",
			roleTone: "badgeW",
			dept: "HR",
			limit: "KES 50,000",
			mfa: "Pending",
			mfaTone: "badgeW",
			lastLogin: "25 Jun",
		},
		{
			name: "Samuel Kiptoo",
			role: "Procurement Officer",
			roleTone: "badgeS",
			dept: "Procurement",
			limit: "KES 250,000",
			mfa: "On",
			mfaTone: "badgeS",
			lastLogin: "27 Jun",
		},
	],
	securityRows: [
		{
			label: "2FA Enforcement",
			detail: "All users except 2 pending",
			status: "95%",
			tone: "badgeS",
		},
		{
			label: "Password Policy",
			detail: "Min 12 chars, special, rotation 90d",
			status: "Active",
			tone: "badgeS",
		},
		{
			label: "Session Timeout",
			detail: "30 minutes of inactivity",
			status: "Active",
			tone: "badgeS",
		},
		{
			label: "IP Whitelisting",
			detail: "Head office + 3 branches",
			status: "Enabled",
			tone: "badgeI",
		},
		{
			label: "Login Alerts",
			detail: "Email + SMS on new device",
			status: "On",
			tone: "badgeS",
		},
	],
	sessionRows: [
		{ label: "James K. — Chrome (Nairobi)", detail: "Today 09:12 • Current" },
		{
			label: "Grace W. — Safari (Mombasa)",
			detail: "Today 08:45",
			canEnd: true,
		},
		{
			label: "Peter O. — Firefox (Nakuru)",
			detail: "26 Jun 14:30",
			canEnd: true,
		},
	],
	eventRows: [
		{ label: "New device login", detail: "James • 27 Jun 09:12" },
		{ label: "Password changed", detail: "Grace • 25 Jun" },
		{ label: "Failed login attempt", detail: "Unknown • 24 Jun" },
	],
	integrationRows: [
		{
			name: "Xero Accounting",
			detail: "Synced • Last: 27 Jun 08:00",
			status: "Active",
			tone: "badgeS",
		},
		{
			name: "QuickBooks Online",
			detail: "Synced • Last: 26 Jun 22:15",
			status: "Active",
			tone: "badgeS",
		},
		{
			name: "Workday HR",
			detail: "Payroll sync • Last: 25 Jun",
			status: "Active",
			tone: "badgeI",
		},
		{
			name: "Sage 300",
			detail: "Connected • Last: 20 Jun",
			status: "Reconnect",
			tone: "badgeW",
		},
	],
	apiKeyRows: [
		{
			name: "Production Key",
			env: "Live",
			envTone: "badgeD",
			created: "12 Jan",
			lastUsed: "Today 08:45",
			status: "Active",
			statusTone: "badgeS",
		},
		{
			name: "Sandbox Key",
			env: "Test",
			envTone: "badgeI",
			created: "12 Jan",
			lastUsed: "26 Jun 14:20",
			status: "Active",
			statusTone: "badgeS",
		},
	],
	deadlineRows: [
		{
			label: "KRA TCC Renewal",
			detail: "Due 05 Jul 2025",
			days: "9 days",
			tone: "badgeD",
		},
		{
			label: "NSSF Monthly Return",
			detail: "Due 10 Jul 2025",
			days: "14 days",
			tone: "badgeW",
		},
		{
			label: "SHIF Contribution",
			detail: "Due 10 Jul 2025",
			days: "14 days",
			tone: "badgeW",
		},
		{
			label: "NITA Annual Return",
			detail: "Due 31 Jul 2025",
			days: "25 days",
			tone: "badgeI",
		},
		{
			label: "County Business Permit",
			detail: "Due 31 Dec 2025",
			days: "6 months",
			tone: "badgeS",
		},
	],
	supportRows: [
		{
			id: "#SUP-8821",
			detail: "API webhook timeout",
			status: "Open",
			tone: "badgeW",
		},
		{
			id: "#SUP-8794",
			detail: "Payroll reconciliation",
			status: "In Progress",
			tone: "badgeI",
		},
		{
			id: "#SUP-8755",
			detail: "Card limit increase",
			status: "Resolved",
			tone: "badgeS",
		},
	],
	docRows: [
		{
			label: "Business Portal User Guide",
			detail: "Comprehensive user manual",
		},
		{ label: "API Reference v2.4", detail: "Full API documentation" },
		{ label: "Regulatory Compliance Guide", detail: "KYC/KYB requirements" },
		{
			label: "Security & Data Protection",
			detail: "Privacy & security whitepaper",
		},
	],
	attentionItems: [
		{
			icon: "bi-file-earmark",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "KRA TCC expires in 9 days",
			sub: "Renew before 05 Jul",
			btnLabel: "Renew",
			modal: "kycModal",
		},
		{
			icon: "bi-people",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "2 users pending MFA activation",
			sub: "Security risk flagged",
			btnLabel: "Manage",
			modal: "userInviteModal",
		},
		{
			icon: "bi-bank",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Bank account verification pending",
			sub: "Equity Bank • KES 2.4M",
			btnLabel: "Verify",
			modal: "bankAccountModal",
		},
	],
	suggestions: [
		{
			icon: "bi-shield",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Enable 2FA for all finance users",
			sub: "Improve compliance score by 4 pts",
			btnLabel: "Enable",
			modal: "securityModal",
		},
		{
			icon: "bi-plug",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Connect Xero accounting",
			sub: "Auto-reconciliation & reports",
			btnLabel: "Connect",
			modal: "integrationModal",
		},
		{
			icon: "bi-calendar",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Schedule compliance review",
			sub: "Next quarter audit in 45 days",
			btnLabel: "Schedule",
			modal: "complianceModal",
		},
	],
	quickActions: [
		{
			icon: "bi-building",
			iconColor: "var(--pm-primary)",
			label: "Edit Profile",
			modal: "editProfileModal",
		},
		{
			icon: "bi-person-plus",
			iconColor: "var(--pm-info)",
			label: "Invite User",
			modal: "userInviteModal",
		},
		{
			icon: "bi-file-earmark-text",
			iconColor: "var(--pm-warning)",
			label: "Upload KYC",
			modal: "kycModal",
		},
		{
			icon: "bi-shield-lock",
			iconColor: "var(--pm-purple)",
			label: "Security",
			modal: "securityModal",
		},
		{
			icon: "bi-bank",
			iconColor: "var(--pm-accent)",
			label: "Bank Accounts",
			modal: "bankAccountModal",
		},
		{
			icon: "bi-key",
			iconColor: "var(--pm-danger)",
			label: "API Keys",
			modal: "apiKeyModal",
		},
		{
			icon: "bi-plug",
			iconColor: "var(--pm-primary)",
			label: "Integrations",
			modal: "integrationModal",
		},
		{
			icon: "bi-headset",
			iconColor: "var(--pm-accent)",
			label: "Support",
			modal: "supportModal",
		},
	],
	activityRows: [
		{
			date: "27 Jun 2025",
			business: "J.K. Holdings",
			action: "Profile Updated",
			user: "James K.",
			status: "Success",
			statusTone: "badgeS",
			ref: "AUD-001",
			modal: "auditLogModal",
		},
		{
			date: "26 Jun 2025",
			business: "J.K. Holdings",
			action: "User Invited",
			user: "James K.",
			status: "Pending",
			statusTone: "badgeW",
			ref: "AUD-002",
			modal: "userInviteModal",
		},
		{
			date: "25 Jun 2025",
			business: "J.K. Holdings",
			action: "API Key Created",
			user: "Grace W.",
			status: "Active",
			statusTone: "badgeS",
			ref: "AUD-003",
			modal: "apiKeyModal",
		},
		{
			date: "24 Jun 2025",
			business: "J.K. Holdings",
			action: "Role Changed",
			user: "James K.",
			status: "Updated",
			statusTone: "badgeI",
			ref: "AUD-004",
			modal: "roleModal",
		},
	],
};

/**
 * Frontend-only demo: no /api/business/settings-administration backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchSettingsContent(): Promise<SettingsConfig> {
	try {
		const res = await fetch("/api/business/settings-administration", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as SettingsConfig;
	} catch {
		return initialMockData;
	}
}

export default function SettingsAdministration() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-building",
				label: "Edit Profile",
				onClick: () => setActiveModal("editProfileModal"),
			},
			{
				icon: "bi-person-plus",
				label: "Invite User",
				onClick: () => setActiveModal("userInviteModal"),
			},
			{
				icon: "bi-file-earmark-check",
				label: "Compliance",
				onClick: () => setActiveModal("complianceModal"),
			},
			{
				icon: "bi-key",
				label: "API Keys",
				tone: "primary",
				onClick: () => setActiveModal("apiKeyModal"),
			},
		],
		[setActiveModal],
	);

	const { data: apiData } = useQuery({
		queryKey: ["business-settings-administration"],
		queryFn: fetchSettingsContent,
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
				{/* HERO STATS */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div
							className={cx(s.card, s.cardAccent)}
							style={{ minHeight: 170 }}
						>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									color: "rgba(255,255,255,.78)",
								}}
							>
								Business command center{" "}
								<span style={{ color: "#86efac" }}>●</span>
							</p>
							<div className={s.sv} style={{ margin: "8px 0", color: "#fff" }}>
								J.K. Holdings Ltd
							</div>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									color: "rgba(255,255,255,.78)",
								}}
							>
								LLC • KRA A001234567X • 47 employees • 3 branches • 4 active
								bank accounts • 91% compliance score
							</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{
										background: "rgba(255,255,255,.12)",
										borderColor: "rgba(255,255,255,.22)",
										color: "#fff",
									}}
									onClick={() => setActiveModal("editProfileModal")}
								>
									Profile
								</button>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{
										background: "rgba(255,255,255,.12)",
										borderColor: "rgba(255,255,255,.22)",
										color: "#fff",
									}}
									onClick={() => setActiveModal("kycModal")}
								>
									KYC
								</button>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{
										background: "rgba(255,255,255,.12)",
										borderColor: "rgba(255,255,255,.22)",
										color: "#fff",
									}}
									onClick={() => setActiveModal("userInviteModal")}
								>
									Team
								</button>
							</div>
						</div>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.sl} style={{ color: "var(--pm-accent)" }}>
								COMPLIANCE SCORE
							</p>
							<div className={s.sv} style={{ margin: "6px 0" }}>
								91
								<span style={{ fontSize: 14, color: "var(--pm-muted)" }}>
									/100
								</span>
							</div>
							<span className={cx(s.badge, s.badgeS)}>
								<i className="bi bi-shield-check" /> Excellent
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
							>
								All filings current
								<br />
								Next deadline: 05 Jul
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.sl} style={{ color: "var(--pm-info)" }}>
								OPEN SUPPORT TICKETS
							</p>
							<div className={s.sv} style={{ margin: "6px 0" }}>
								3
							</div>
							<span className={cx(s.badge, s.badgeW)}>
								<i className="bi bi-clock" /> 1 awaiting reply
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
							>
								API integration issue
								<br />
								Payroll reconciliation
								<br />
								Card limit increase
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4">
						<div
							className={s.card}
							style={{
								minHeight: 170,
								borderLeft: "3px solid var(--pm-warning)",
							}}
						>
							<p className={s.sl} style={{ color: "var(--pm-warning)" }}>
								PENDING APPROVALS
							</p>
							<div className={s.sv} style={{ margin: "6px 0" }}>
								7
							</div>
							<span className={cx(s.badge, s.badgeD)}>
								<i className="bi bi-exclamation-triangle" /> Action required
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
							>
								5 payroll approvals
								<br />2 disbursements
							</div>
						</div>
					</div>
				</div>

				{/* ATTENTION / SUGGESTIONS / QUICK ACTIONS */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={s.card}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h3 className={s.st}>Attention Required</h3>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("attentionFullModal")}
								>
									View all
								</button>
							</div>
							{config.attentionItems.map((item) => (
								<div key={item.title} className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: item.iconBg, color: item.iconColor }}
										>
											<i className={`bi ${item.icon}`} />
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{item.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{item.sub}
											</div>
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal(item.modal)}
									>
										{item.btnLabel}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h3 className={s.st}>Smart Suggestions</h3>
								<span className={cx(s.badge, s.badgeP)}>
									<i className="bi bi-stars" /> AI
								</span>
							</div>
							{config.suggestions.map((item) => (
								<div key={item.title} className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: item.iconBg, color: item.iconColor }}
										>
											<i className={`bi ${item.icon}`} />
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{item.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{item.sub}
											</div>
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal(item.modal)}
									>
										{item.btnLabel}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
							<div className="mb-3">
								<h3 className={s.st}>Quick Actions</h3>
								<p className={s.ss}>Frequent administration workflows</p>
							</div>
							<div className={s.quickGrid}>
								{config.quickActions.map((qa) => (
									<button
										key={qa.label}
										className={s.quickBtn}
										onClick={() => setActiveModal(qa.modal)}
									>
										<i
											className={`bi ${qa.icon}`}
											style={{ color: qa.iconColor }}
										/>
										{qa.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.14.1: Business Profile & KYC/KYB Center */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-building-fill"
									style={{ color: "var(--pm-primary)" }}
								/>{" "}
								3.14.1 — Business Profile & KYC/KYB Center
							</h3>
							<p className={s.ss}>
								Manage legal entity details, KRA PIN, registration documents,
								beneficial ownership, compliance certificates and verification
								status.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("editProfileModal")}
							>
								<i className="bi bi-pencil" /> Edit
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("kycModal")}
							>
								<i className="bi bi-upload" /> Upload Docs
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Company Identity
								</h4>
								<div className={s.statusRow}>
									<div>
										<strong>Legal Name</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											J.K. Holdings Limited
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Trading Name</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											JK Holdings
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Registration No.</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											PVT-XYZ12345A
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>KRA PIN</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											A001234567X
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Industry</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Wholesale & Retail Trade
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Size</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Medium (47 employees)
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Head Office</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Westlands, Nairobi
										</div>
									</div>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Branches</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											3 (Mombasa, Kisumu, Nakuru)
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									KYC/KYB Verification
								</h4>
								{config.kycItems.map((k) => (
									<div key={k.label} className={s.statusRow}>
										<div>
											<strong>{k.label}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{k.detail}
											</div>
										</div>
										<span className={cx(s.badge, s[k.tone])}>{k.status}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Compliance Score
								</h4>
								<div className="text-center mb-3">
									<div
										style={{
											fontSize: 42,
											fontWeight: 800,
											color: "var(--pm-accent)",
											fontFamily: "var(--pm-font-display)",
										}}
									>
										91
									</div>
									<div
										style={{ fontSize: 11, fontWeight: 700, color: "#047857" }}
									>
										EXCELLENT
									</div>
								</div>
								<div className="mb-2">
									<div
										className="d-flex justify-content-between mb-1"
										style={{ fontSize: 12 }}
									>
										<span>KYC Complete</span>
										<span>100%</span>
									</div>
									<div className={s.progress}>
										<div
											className={s.progressBar}
											style={{ width: "100%", background: "var(--pm-accent)" }}
										/>
									</div>
								</div>
								<div className="mb-2">
									<div
										className="d-flex justify-content-between mb-1"
										style={{ fontSize: 12 }}
									>
										<span>Filings Current</span>
										<span>95%</span>
									</div>
									<div className={s.progress}>
										<div
											className={s.progressBar}
											style={{ width: "95%", background: "var(--pm-info)" }}
										/>
									</div>
								</div>
								<div>
									<div
										className="d-flex justify-content-between mb-1"
										style={{ fontSize: 12 }}
									>
										<span>Bank Verification</span>
										<span>75%</span>
									</div>
									<div className={s.progress}>
										<div
											className={s.progressBar}
											style={{ width: "75%", background: "var(--pm-warning)" }}
										/>
									</div>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-3")}
									onClick={() => setActiveModal("complianceModal")}
								>
									View Compliance Calendar
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.14.2: Multi-Business & Branch Management */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-people-fill"
									style={{ color: "var(--pm-accent)" }}
								/>{" "}
								3.14.2 — Multi-Business & Branch Management
							</h3>
							<p className={s.ss}>
								Switch between multiple companies, view consolidated group
								reports, manage branches and inter-company transfers.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("addBusinessModal")}
							>
								<i className="bi bi-plus-lg" /> Add Business
							</button>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("branchModal")}
							>
								<i className="bi bi-geo-alt" /> Branches
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Business Portfolio
								</h4>
								<div className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: "var(--pm-primary)", color: "#fff" }}
										>
											<i className="bi bi-building" />
										</div>
										<div>
											<strong>J.K. Holdings Ltd</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												LLC • Nairobi HQ • 47 employees
											</div>
										</div>
									</div>
									<span className={cx(s.badge, s.badgeS)}>Active</span>
								</div>
								<div className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: "var(--pm-info)", color: "#fff" }}
										>
											<i className="bi bi-building" />
										</div>
										<div>
											<strong>JK Retail Mombasa Ltd</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												LLC • Mombasa • 12 employees
											</div>
										</div>
									</div>
									<span className={cx(s.badge, s.badgeS)}>Active</span>
								</div>
								<div className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: "var(--pm-warning)", color: "#fff" }}
										>
											<i className="bi bi-building" />
										</div>
										<div>
											<strong>JK Agri Solutions</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												Sole Prop • Nakuru • 8 employees
											</div>
										</div>
									</div>
									<span className={cx(s.badge, s.badgeI)}>Pending</span>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Inter-Company Transfers
								</h4>
								<div className={s.statusRow}>
									<div>
										<strong>JK Holdings → JK Retail Mombasa</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											KES 1,200,000 • 24 Jun
										</div>
									</div>
									<span className={cx(s.badge, s.badgeS)}>Completed</span>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>JK Retail → JK Agri Solutions</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											KES 450,000 • 20 Jun
										</div>
									</div>
									<span className={cx(s.badge, s.badgeS)}>Completed</span>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("transferModal")}
								>
									New Transfer
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.14.3: Team, Roles & Permissions */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-person-badge-fill"
									style={{ color: "var(--pm-purple)" }}
								/>{" "}
								3.14.3 — Team, Roles & Permissions
							</h3>
							<p className={s.ss}>
								Invite users, assign roles, set approval limits, enforce MFA and
								monitor sessions.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("userInviteModal")}
							>
								<i className="bi bi-person-plus" /> Invite
							</button>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("roleModal")}
							>
								<i className="bi bi-sliders" /> Roles
							</button>
						</div>
					</div>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Name</th>
									<th>Role</th>
									<th>Department</th>
									<th>Limit</th>
									<th>MFA</th>
									<th>Last Login</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{config.userRows.map((u) => (
									<tr key={u.name}>
										<td data-label="Name">
											<strong>{u.name}</strong>
										</td>
										<td data-label="Role">
											<span className={cx(s.badge, s[u.roleTone])}>
												{u.role}
											</span>
										</td>
										<td data-label="Department">{u.dept}</td>
										<td data-label="Limit">{u.limit}</td>
										<td data-label="MFA">
											<span className={cx(s.badge, s[u.mfaTone])}>{u.mfa}</span>
										</td>
										<td data-label="Last Login">{u.lastLogin}</td>
										<td data-label="Actions">
											<button
												className={cx(s.btnPm, s.btnSm)}
												onClick={() => setActiveModal("userInviteModal")}
											>
												Edit
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* SECTION 3.14.4: Security, MFA & Session Management */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-shield-lock-fill"
									style={{ color: "var(--pm-danger)" }}
								/>{" "}
								3.14.4 — Security, MFA & Session Management
							</h3>
							<p className={s.ss}>
								Enforce 2FA, password policies, session controls, audit logs and
								security alerts.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("securityModal")}
							>
								<i className="bi bi-shield-lock" /> Security
							</button>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("auditLogModal")}
							>
								<i className="bi bi-clock-history" /> Audit Log
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Security Posture
								</h4>
								{config.securityRows.map((sr) => (
									<div key={sr.label} className={s.statusRow}>
										<div>
											<strong>{sr.label}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{sr.detail}
											</div>
										</div>
										<span className={cx(s.badge, s[sr.tone])}>{sr.status}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Active Sessions
								</h4>
								{config.sessionRows.map((sr) => (
									<div key={sr.label} className={s.statusRow}>
										<div>
											<strong>{sr.label}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{sr.detail}
											</div>
										</div>
										{sr.canEnd && (
											<button
												className={cx(s.btnPm, s.btnSm)}
												onClick={() => setActiveModal("securityModal")}
											>
												End
											</button>
										)}
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Recent Security Events
								</h4>
								{config.eventRows.map((er) => (
									<div key={er.label} className={s.statusRow}>
										<div>
											<strong>{er.label}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{er.detail}
											</div>
										</div>
									</div>
								))}
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("auditLogModal")}
								>
									View Full Log
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.14.5: Integrations, API Keys & Webhooks */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-plug-fill"
									style={{ color: "var(--pm-info)" }}
								/>{" "}
								3.14.5 — Integrations, API Keys & Webhooks
							</h3>
							<p className={s.ss}>
								Connect accounting, HR, ERP systems, manage API keys, configure
								webhooks and sandbox testing.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("integrationModal")}
							>
								<i className="bi bi-plug" /> Connect
							</button>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("apiKeyModal")}
							>
								<i className="bi bi-key" /> API Keys
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Connected Integrations
								</h4>
								{config.integrationRows.map((ir) => (
									<div key={ir.name} className={s.statusRow}>
										<div>
											<strong>{ir.name}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{ir.detail}
											</div>
										</div>
										<span className={cx(s.badge, s[ir.tone])}>{ir.status}</span>
									</div>
								))}
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("integrationModal")}
								>
									Browse Marketplace
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									API Keys
								</h4>
								{config.apiKeyRows.map((ak) => (
									<div key={ak.name} className={s.statusRow}>
										<div>
											<strong>{ak.name}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												Created {ak.created}
											</div>
										</div>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => setActiveModal("apiKeyModal")}
										>
											Manage
										</button>
									</div>
								))}
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("webhookModal")}
								>
									Configure Webhooks
								</button>
							</div>
						</div>
						<div className="col-lg-3">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Sandbox & Testing
								</h4>
								<div className={s.statusRow}>
									<div>
										<strong>Sandbox Environment</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Fully isolated test data
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal("integrationModal")}
									>
										Reset
									</button>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>Test Webhook</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Send sample payload
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal("webhookModal")}
									>
										Test
									</button>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("apiKeyModal")}
								>
									View Documentation
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.14.6: Compliance Calendar */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-file-earmark-check-fill"
									style={{ color: "var(--pm-warning)" }}
								/>{" "}
								3.14.6 — Compliance Calendar & Regulatory Reporting
							</h3>
							<p className={s.ss}>
								Track KRA, NSSF, SHIF, NITA, county permits, CBK filings and
								generate regulatory reports.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("complianceModal")}
							>
								<i className="bi bi-calendar-event" /> Calendar
							</button>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("reportModal")}
							>
								<i className="bi bi-file-earmark-arrow-down" /> Reports
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Upcoming Deadlines
								</h4>
								{config.deadlineRows.map((d) => (
									<div key={d.label} className={s.statusRow}>
										<div>
											<strong>{d.label}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{d.detail}
											</div>
										</div>
										<span className={cx(s.badge, s[d.tone])}>{d.days}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Regulatory Reports
								</h4>
								<div className={s.statusRow}>
									<div>
										<strong>KRA iTax PAYE (P10)</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Monthly
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal("reportModal")}
									>
										Generate
									</button>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>CBK STR/CTR</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											As needed
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal("reportModal")}
									>
										Generate
									</button>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>ODPC Data Audit</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Quarterly
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal("reportModal")}
									>
										Generate
									</button>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("complianceModal")}
								>
									View Full Calendar
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.14.7: Support, Audit Logs & Documentation */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-headset"
									style={{ color: "var(--pm-accent)" }}
								/>{" "}
								3.14.7 — Support, Audit Logs & Documentation
							</h3>
							<p className={s.ss}>
								Raise support tickets, view audit logs, access documentation and
								manage knowledge base.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("supportModal")}
							>
								<i className="bi bi-headset" /> Support
							</button>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("auditLogModal")}
							>
								<i className="bi bi-clock-history" /> Audit
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Support Tickets
								</h4>
								{config.supportRows.map((sr) => (
									<div key={sr.id} className={s.statusRow}>
										<div>
											<strong>{sr.id}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{sr.detail}
											</div>
										</div>
										<span className={cx(s.badge, s[sr.tone])}>{sr.status}</span>
									</div>
								))}
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("supportModal")}
								>
									New Ticket
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Audit Log Summary
								</h4>
								{config.activityRows.slice(0, 4).map((a) => (
									<div key={a.ref} className={s.statusRow}>
										<div>
											<strong>{a.action}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{a.user} • {a.date}
											</div>
										</div>
									</div>
								))}
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("auditLogModal")}
								>
									View Full Log
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Documentation
								</h4>
								{config.docRows.map((d) => (
									<div
										key={d.label}
										className={s.statusRow}
										style={{ cursor: "pointer" }}
										onClick={() => setActiveModal("supportModal")}
									>
										<div>
											<strong>{d.label}</strong>
										</div>
										<i className="bi bi-box-arrow-up-right text-muted" />
									</div>
								))}
								<button
									className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
									onClick={() => setActiveModal("supportModal")}
								>
									Knowledge Base
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* MODALS */}
			<SettingsAdministrationModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
