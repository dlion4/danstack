import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useBusinessPageActions } from "@/features/Layouts/dashboard-business-layout/data/businessLayoutContext";
import CommandCenterModals from "../components/CommandCenterModals";
import styles from "../styles/command-center.module.css";

/* ============================================================================
   PayMo BaaS — Business Command Center (legacy page 3.1)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone =
	| "badgeS"
	| "badgeW"
	| "badgeD"
	| "badgeI"
	| "badgeP"
	| "badgeDark"
	| "badgePurple";

interface NavItem {
	icon: string;
	title: string;
	active?: boolean;
	dot?: boolean;
}
interface StatCard {
	key: string;
	col: string;
	label: string;
	labelColor?: string;
	value: string;
	valueColor?: string;
	badge?: { icon: string; text: string; tone: BadgeTone };
	badgeExtra?: string;
	progress?: { percent: number; color: string; lines: string[] };
	borderColor?: string;
	modal: string;
	extraContent?: string;
}
interface FeedItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	btnLabel: string;
	btnClass: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	iconColor: string;
	label: string;
	modal: string;
}
interface ChartBar {
	month: string;
	target: number;
	actual: number;
	color: string;
}
interface AgingBlock {
	range: string;
	amount: string;
	color: string;
	bgColor: string;
	textColor: string;
}
interface ProfileField {
	label: string;
	value: string;
	mono?: boolean;
}
interface KybItem {
	name: string;
	badge: { icon: string; text: string; tone: BadgeTone };
}
interface EntityRow {
	name: string;
	isCurrent?: boolean;
	role: string;
	balance: string;
	actionLabel: string;
	actionModal: string;
	actionDisabled?: boolean;
}
interface TeamRow {
	initials: string;
	name: string;
	email: string;
	avatarBg: string;
	roleBadge: {
		text: string;
		tone?: BadgeTone;
		customBg?: string;
		customColor?: string;
	};
	approvalLimit: string;
	mfa: { icon: string; text: string; tone: BadgeTone };
	lastActive: string;
	actionLabel: string;
	actionModal: string;
}
interface User {
	initials: string;
	name: string;
	role: string;
	avatarBg: string;
}

interface CommandCenterConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; current: string };
	pageTitle?: string;
	pageSub?: string;
	statCards: StatCard[];
	attentionItems: FeedItem[];
	quickActions: QuickAction[];
	suggestion: {
		icon: string;
		title: string;
		text: string;
		btnLabel: string;
		modal: string;
	};
	chartBars: ChartBar[];
	agingBlocks: AgingBlock[];
	profileFields: ProfileField[];
	kybItems: KybItem[];
	entities: EntityRow[];
	teamRows: TeamRow[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: CommandCenterConfig = {
	nav: [
		{ icon: "bi-grid-1x2", title: "Command Center", active: true, dot: true },
		{ icon: "bi-shop", title: "Collections & Merchants" },
		{ icon: "bi-receipt", title: "Invoicing" },
		{ icon: "bi-people", title: "Payroll" },
		{ icon: "bi-send", title: "Disbursements" },
		{ icon: "bi-box-arrow-right", title: "Payables" },
		{ icon: "bi-gear", title: "Business Settings" },
	],
	headerTitle: "TechSolutions Ltd",
	headerSub: "KRA PIN: P051234567M · Reg: PVT-2022/10492",
	searchPlaceholder: "Search invoices, employees, payments, customers...",
	user: {
		initials: "AD",
		name: "Amina D.",
		role: "Director (Admin)",
		avatarBg: "var(--pm-primary)",
	},
	breadcrumb: { parent: "Business Portal", current: "Command Center" },
	// // pageTitle: "Business Command Center",
	// pageSub:
	// 	"Consolidated overview of collections, payroll, invoices, and business health.",
	statCards: [
		{
			key: "users",
			col: "col-lg-3 col-md-6",
			label: "ACTIVE USERS",
			value: "12",
			borderColor: "var(--pm-primary)",
			badge: { icon: "bi-person-check", text: "4 Admins", tone: "badgeI" },
			badgeExtra: "8 Members",
			modal: "rolePermissionsModal",
			extraContent: "Manage Users",
		},
		{
			key: "roles",
			col: "col-lg-3 col-md-6",
			label: "CUSTOM ROLES",
			value: "6",
			borderColor: "var(--pm-purple)",
			badge: { icon: "bi-shield-lock", text: "3 Active", tone: "badgePurple" },
			badgeExtra: "3 Draft",
			modal: "rolePermissionsModal",
			extraContent: "Configure Roles",
		},
		{
			key: "approvals",
			col: "col-lg-3 col-md-6",
			label: "APPROVAL LIMITS",
			value: "8 Configured",
			borderColor: "var(--pm-accent)",
			badge: { icon: "bi-check-circle", text: "All Active", tone: "badgeS" },
			modal: "rolePermissionsModal",
			extraContent: "Edit Limits",
		},
		{
			key: "pending",
			col: "col-lg-3 col-md-6",
			label: "PENDING REQUESTS",
			value: "3 Actionable",
			borderColor: "var(--pm-warning)",
			modal: "pendingApprovalsModal",
			extraContent: "Review Queue",
		},
	],
	attentionItems: [
		{
			icon: "bi-person-plus",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "New User Invitation Pending Approval",
			sub: "John Kamau · Role: Finance Manager · Maker: HR Dept",
			btnLabel: "Review & Approve",
			btnClass: "btnPmP",
			modal: "inviteUserModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Role Permission Update Required",
			sub: "Finance Manager role needs elevated access for audit compliance",
			btnLabel: "Update Permissions",
			btnClass: "btnPmD",
			modal: "rolePermissionsModal",
		},
		{
			icon: "bi-clock-history",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "3 Approval Requests Expiring Soon",
			sub: "Requests will auto-reject in 24 hours if not reviewed",
			btnLabel: "Review Queue",
			btnClass: "",
			modal: "pendingApprovalsModal",
		},
	],
	quickActions: [
		{
			icon: "bi-person-plus",
			iconColor: "var(--pm-primary)",
			label: "Invite User",
			modal: "inviteUserModal",
		},
		{
			icon: "bi-shield-lock",
			iconColor: "var(--pm-accent)",
			label: "Roles",
			modal: "rolePermissionsModal",
		},
		{
			icon: "bi-sliders",
			iconColor: "var(--pm-info)",
			label: "Limits",
			modal: "rolePermissionsModal",
		},
		{
			icon: "bi-people",
			iconColor: "var(--pm-purple)",
			label: "Team",
			modal: "rolePermissionsModal",
		},
		{
			icon: "bi-check-circle",
			iconColor: "var(--pm-warning)",
			label: "Approvals",
			modal: "pendingApprovalsModal",
		},
		{
			icon: "bi-gear",
			iconColor: "var(--pm-muted)",
			label: "Settings",
			modal: "businessSettingsModal",
		},
	],
	suggestion: {
		icon: "bi-stars",
		title: "Smart Suggestion",
		text: "Consider implementing role-based approval workflows for transactions above KES 100K to improve security.",
		btnLabel: "Configure Workflows",
		modal: "rolePermissionsModal",
	},
	chartBars: [
		{ month: "May", target: 60, actual: 55, color: "var(--pm-muted)" },
		{ month: "Jun", target: 65, actual: 60, color: "var(--pm-muted)" },
		{ month: "Jul", target: 70, actual: 75, color: "var(--pm-accent)" },
		{ month: "Aug", target: 75, actual: 68, color: "var(--pm-warning)" },
		{ month: "Sep", target: 80, actual: 85, color: "var(--pm-accent)" },
		{ month: "Oct", target: 85, actual: 95, color: "var(--pm-primary)" },
	],
	agingBlocks: [
		{
			range: "0-30 Days",
			amount: "KES 420K",
			color: "#047857",
			bgColor: "var(--pm-accent-soft)",
			textColor: "#065F46",
		},
		{
			range: "31-60 Days",
			amount: "KES 185K",
			color: "#B45309",
			bgColor: "var(--pm-warning-soft)",
			textColor: "#92400E",
		},
		{
			range: "61-90+ Days",
			amount: "KES 145K",
			color: "#DC2626",
			bgColor: "var(--pm-danger-soft)",
			textColor: "#991B1B",
		},
	],
	profileFields: [
		{ label: "Company Name", value: "TechSolutions Ltd" },
		{ label: "KRA PIN", value: "P051234567M", mono: true },
		{ label: "Registration Number", value: "PVT-2022/10492" },
		{ label: "Business Type / Sector", value: "LLC · IT Services" },
	],
	kybItems: [
		{
			name: "Certificate of Incorporation",
			badge: { icon: "bi-check-circle", text: "Verified", tone: "badgeS" },
		},
		{
			name: "KRA PIN Certificate",
			badge: { icon: "bi-check-circle", text: "Verified", tone: "badgeS" },
		},
		{
			name: "Tax Compliance Certificate",
			badge: {
				icon: "bi-check-circle",
				text: "Valid till Dec 2025",
				tone: "badgeS",
			},
		},
		{
			name: "Annual Returns (CR12)",
			badge: {
				icon: "bi-exclamation-circle",
				text: "Missing 2024",
				tone: "badgeD",
			},
		},
	],
	entities: [
		{
			name: "TechSolutions Ltd",
			isCurrent: true,
			role: "Owner",
			balance: "2.45M",
			actionLabel: "Active",
			actionModal: "",
			actionDisabled: true,
		},
		{
			name: "TS Logistics & Delivery",
			role: "Owner",
			balance: "8.10M",
			actionLabel: "Transfer",
			actionModal: "interCompanyTransferModal",
		},
		{
			name: "TechSolutions Foundation",
			role: "Admin",
			balance: "2.25M",
			actionLabel: "Switch",
			actionModal: "switchBusinessModal",
		},
	],
	teamRows: [
		{
			initials: "AD",
			name: "Amina D.",
			email: "amina@techsol.co.ke",
			avatarBg: "var(--pm-primary)",
			roleBadge: { text: "Owner", customBg: "#1E293B", customColor: "#fff" },
			approvalLimit: "Unlimited",
			mfa: { icon: "bi-phone", text: "Enforced", tone: "badgeS" },
			lastActive: "Today, 09:41 AM",
			actionLabel: "Edit",
			actionModal: "viewUserModal",
		},
		{
			initials: "PK",
			name: "Peter K.",
			email: "peter.k@techsol.co.ke",
			avatarBg: "var(--pm-info)",
			roleBadge: { text: "Finance Admin", tone: "badgeI" },
			approvalLimit: "KES 1,000,000",
			mfa: { icon: "bi-phone", text: "Enforced", tone: "badgeS" },
			lastActive: "Today, 08:15 AM",
			actionLabel: "Edit",
			actionModal: "viewUserModal",
		},
		{
			initials: "SW",
			name: "Sarah W.",
			email: "sarah.hr@techsol.co.ke",
			avatarBg: "var(--pm-warning)",
			roleBadge: { text: "HR Manager", tone: "badgeW" },
			approvalLimit: "KES 5,000,000 (Payroll)",
			mfa: { icon: "bi-phone", text: "Enforced", tone: "badgeS" },
			lastActive: "Yesterday",
			actionLabel: "Edit",
			actionModal: "viewUserModal",
		},
		{
			initials: "JM",
			name: "John M.",
			email: "john@techsol.co.ke",
			avatarBg: "var(--pm-muted)",
			roleBadge: {
				text: "Sales (Invoicing)",
				customBg: "#f1f5f9",
				customColor: "var(--pm-ink-soft)",
			},
			approvalLimit: "None (Maker only)",
			mfa: {
				icon: "bi-exclamation-circle",
				text: "Pending Setup",
				tone: "badgeD",
			},
			lastActive: "Never (Invited)",
			actionLabel: "Manage",
			actionModal: "viewUserModal",
		},
	],
};

/* ---------- TanStack Query fetcher (backend-ready) ---------- */
/**
 * Frontend-only demo: no /api/business/command-center backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchCommandCenterContent(): Promise<CommandCenterConfig> {
	try {
		const res = await fetch("/api/business/command-center", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as CommandCenterConfig;
	} catch {
		return initialMockData;
	}
}

export default function CommandCenter() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	/* ---------- LEGACY BRIDGE: pm-page-bar action buttons ----------------
	 * The legacy HTML rendered these next to the page title with
	 * onclick="openModal('…')". The shell owns the page bar now, so the
	 * page publishes them and BusinessPageBar renders them. */
	useBusinessPageActions(
		[
			{
				icon: "bi-file-earmark-bar-graph",
				label: "Reports",
				onClick: () => setActiveModal("consolidatedReportModal"),
			},
			{
				icon: "bi-person-plus",
				label: "Add User",
				onClick: () => setActiveModal("inviteUserModal"),
			},
			{
				icon: "bi-plus-lg",
				label: "New Invoice",
				tone: "dark",
				onClick: () => setActiveModal("newInvoiceModal"),
			},
		],
		[setActiveModal],
	);

	/* ---------- TanStack Query ---------- */
	const { data: apiData } = useQuery({
		queryKey: ["business-command-center"],
		queryFn: fetchCommandCenterContent,
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
				{/* WELCOME SECTION */}
				<div className={s.card} style={{ background: "var(--pm-gradient-hero)", color: "#fff", position: "relative", overflow: "hidden", padding: "26px 30px", borderRadius: "var(--pm-r-xl)" }}>
					<div style={{ position: "absolute", top: "-120px", right: "-60px", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(255,255,255,.14) 0%, transparent 70%)", borderRadius: "50%" }}></div>
					<div>
						<h2 style={{ fontFamily: "var(--pm-font-display)", fontWeight: 700, fontSize: "23px", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
							Good morning, Amina
						</h2>
						<p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
							Here's what's happening with <strong>TechSolutions Ltd</strong> permissions today.
						</p>
					</div>
					<div className="d-flex gap-2 flex-wrap">
						<div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)", padding: "8px 14px", borderRadius: "var(--pm-r-pill)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }} onClick={() => setActiveModal("rolePermissionsModal")}>
							<i className="bi bi-shield-lock" /> Permissions <strong>12 Active</strong>
						</div>
						<div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)", padding: "8px 14px", borderRadius: "var(--pm-r-pill)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }} onClick={() => setActiveModal("healthCheckModal")}>
							<i className="bi bi-activity" /> Health <strong>92/100</strong>
						</div>
					</div>
				</div>

				{/* HERO ROW: Key Metrics - Permission Focused */}
				<div className="row g-3">
					{config.statCards.map((sc) => (
						<div key={sc.key} className={sc.col}>
							<div
								className={cx(s.card, sc.key === "cash" && s.cardBiz)}
								style={{
									...(sc.borderColor
										? { borderLeft: `3px solid ${sc.borderColor}` }
										: {}),
								}}
							>
								<div className={s.sl}>{sc.label}</div>
								<div className={s.sv} style={sc.valueColor ? { color: sc.valueColor } : {}}>
									{sc.value}
								</div>
								{sc.badge && (
									<div
										className="d-flex align-items-center justify-content-between mt-2"
										style={{
											fontSize: 12,
											...(sc.key === "cash"
												? { color: "rgba(255,255,255,.7)" }
												: {}),
										}}
									>
										<span className={cx(s.badge, s[sc.badge.tone])}>
											<i className={`bi ${sc.badge.icon}`} /> {sc.badge.text}
										</span>
										{sc.badgeExtra && (
											<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{sc.badgeExtra}
											</span>
										)}
									</div>
								)}
								{sc.progress && (
									<div className="mt-2">
										<div
											className="d-flex justify-content-between mb-1"
											style={{ fontSize: 11, color: "var(--pm-muted)" }}
										>
											{sc.progress.lines.map((l, i) => (
												<span key={i}>{l}</span>
											))}
										</div>
										<div className={s.progress}>
											<div
												className={s.progressBar}
												style={{
													width: `${sc.progress.percent}%`,
													background: sc.progress.color,
												}}
											/>
										</div>
									</div>
								)}
								{sc.extraContent && (
									<div className="d-flex gap-2 mt-2">
										<button
											className={cx(s.btnPm, s.btnSm)}
											style={{ flex: 1 }}
											onClick={() => setActiveModal(sc.modal)}
										>
											{sc.extraContent}
										</button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{/* ATTENTION & QUICK ACTIONS */}
				<div className="row g-3">
					<div className="col-lg-8">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h3 className={s.st}>Permission Alerts & Actions</h3>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("notificationsModal")}
								>
									View all
								</button>
							</div>
							{config.attentionItems.map((item) => (
								<div key={item.title} className={s.feedItem}>
									<div
										className={s.iconCircle}
										style={{ background: item.iconBg, color: item.iconColor }}
									>
										<i className={`bi ${item.icon}`} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontWeight: 600, fontSize: 14 }}>
											{item.title}
										</div>
										<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
											{item.sub}
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm, s[item.btnClass])}
										onClick={() => setActiveModal(item.modal)}
									>
										{item.btnLabel}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<h3 className={cx(s.st, "mb-3")}>Quick Actions</h3>
							<div className={s.quickGrid}>
								{config.quickActions.map((qa) => (
									<div
										key={qa.label}
										className={s.quickBtn}
										onClick={() => setActiveModal(qa.modal)}
									>
										<i
											className={`bi ${qa.icon}`}
											style={{ color: qa.iconColor }}
										/>
										{qa.label}
									</div>
								))}
							</div>
							<div className={s.suggestionBox} style={{ marginTop: 12 }}>
								<div
									style={{
										fontSize: 12,
										fontWeight: 700,
										color: "#047857",
										marginBottom: 4,
									}}
								>
									<i className={`bi ${config.suggestion.icon}`} />{" "}
									{config.suggestion.title}
								</div>
								<div style={{ fontSize: 12, color: "#065F46" }}>
									{config.suggestion.text}
								</div>
								<button
									className={cx(s.btnPm, s.btnSm, "mt-2 w-100")}
									style={{
										background: "#fff",
										color: "#047857",
										borderColor: "rgba(16,185,129,.3)",
									}}
									onClick={() => setActiveModal(config.suggestion.modal)}
								>
									{config.suggestion.btnLabel}
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.1.1: Permission Dashboard */}
				<div className={s.card}>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<div>
							<h3 className={cx(s.st, "text-primary")}>
								<i
									className="bi bi-shield-lock"
									style={{ color: "var(--pm-primary)" }}
								/>{" "}
								Permission Management Dashboard
							</h3>
							<p className={s.ss}>
								Roles, approval limits, access control & security settings.
							</p>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => setActiveModal("rolePermissionsModal")}
						>
							<i className="bi bi-sliders" /> Configure Permissions
						</button>
					</div>
					<div className="row g-4">
						<div className="col-lg-6">
							<div className={s.statusBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}
								>
									Role Distribution (Last 6 Months)
								</h4>
								<div className={s.chartContainer}>
									{config.chartBars.map((cb) => (
										<div
											key={cb.month}
											className={s.chartBarWrapper}
											onClick={() => setActiveModal("rolePermissionsModal")}
										>
											<div
												style={{
													position: "relative",
													width: 40,
													height: "100%",
													margin: "0 auto",
												}}
											>
												<div
													style={{
														width: "60%",
														height: `${cb.target}%`,
														background: "var(--pm-border-2)",
														borderRadius: "4px 4px 0 0",
														position: "absolute",
														bottom: 0,
														zIndex: 1,
													}}
												/>
												<div
													className={s.chartBarActual}
													style={{
														height: `${cb.actual}%`,
														background: cb.color,
														width: "100%",
														borderRadius: "4px 4px 0 0",
														position: "absolute",
														bottom: 0,
														zIndex: 2,
													}}
												/>
											</div>
											<div className={s.chartLabel}>{cb.month}</div>
										</div>
									))}
								</div>
								<div
									className="d-flex justify-content-center gap-3 mt-3"
									style={{ fontSize: 11 }}
								>
									<span className="d-flex align-items-center gap-1">
										<div
											style={{
												width: 10,
												height: 10,
												background: "var(--pm-border-2)",
												borderRadius: 2,
											}}
										/>{" "}
										Target
									</span>
									<span className="d-flex align-items-center gap-1">
										<div
											style={{
												width: 10,
												height: 10,
												background: "var(--pm-primary)",
												borderRadius: 2,
											}}
										/>{" "}
										Actual
									</span>
								</div>
							</div>
						</div>
						<div className="col-lg-6">
							<div className={s.statusBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Permission Categories
								</h4>
								<div className="d-flex gap-2 h-100">
									{config.agingBlocks.map((ab) => (
										<div
											key={ab.range}
											className={s.agingBlock}
											style={{ background: ab.bgColor, cursor: "pointer" }}
											onClick={() => setActiveModal("rolePermissionsModal")}
										>
											<div
												style={{
													fontSize: 12,
													color: ab.color,
													fontWeight: 600,
												}}
											>
												{ab.range}
											</div>
											<div
												style={{
													fontSize: 18,
													fontWeight: 700,
													color: ab.textColor,
												}}
											>
												{ab.amount}
											</div>
										</div>
									))}
								</div>
								<div className="mt-3">
									<button
										className={cx(s.btnPm, s.btnSm, "w-100")}
										onClick={() => setActiveModal("rolePermissionsModal")}
									>
										<i className="bi bi-shield-lock" /> View All Permissions
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ROW: PROFILE & MULTI-BIZ */}
				<div className="row g-3">
					{/* SECTION 3.1.2: Business Profile */}
					<div className="col-lg-6">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-info")}>
										<i
											className="bi bi-building-check"
											style={{ color: "var(--pm-info)" }}
										/>{" "}
										Business Profile & Settings
									</h3>
									<p className={s.ss}>KYC/KYB status and corporate details.</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("businessSettingsModal")}
								>
									<i className="bi bi-pencil" />
								</button>
							</div>
							<div className="row g-2 mb-3">
								{config.profileFields.map((pf) => (
									<div key={pf.label} className="col-sm-6">
										<div className={s.profileField}>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{pf.label}
											</div>
											<div
												style={{
													fontSize: 13,
													fontWeight: 600,
													...(pf.mono ? { fontFamily: "monospace" } : {}),
												}}
											>
												{pf.value}
											</div>
										</div>
									</div>
								))}
							</div>
							<h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>
								Verification & KYB Status
							</h4>
							{config.kybItems.map((ki) => (
								<div
									key={ki.name}
									className="d-flex justify-content-between align-items-center p-2 border-bottom"
									style={{ fontSize: 13 }}
								>
									<span>{ki.name}</span>
									<span className={cx(s.badge, s[ki.badge.tone])}>
										<i className={`bi ${ki.badge.icon}`} /> {ki.badge.text}
									</span>
								</div>
							))}
							<button
								className={cx(s.btnPm, s.btnSm, "mt-2")}
								onClick={() => setActiveModal("kybUploadModal")}
							>
								Manage Documents
							</button>
						</div>
					</div>

					{/* SECTION 3.1.3: Multi-Business */}
					<div className="col-lg-6">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-purple)" }}>
										<i
											className="bi bi-diagram-3"
											style={{ color: "var(--pm-purple)" }}
										/>{" "}
										Multi-Business Management
									</h3>
									<p className={s.ss}>
										Switch accounts, view consolidated data, inter-company
										transfers.
									</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("switchBusinessModal")}
								>
									Switch
								</button>
							</div>
							<div
								className="p-3 rounded mb-3"
								style={{ background: "var(--pm-purple-soft)" }}
							>
								<div
									style={{ fontSize: 11, color: "#6D28D9", fontWeight: 700 }}
								>
									CONSOLIDATED GROUP CASH (3 ENTITIES)
								</div>
								<div
									style={{
										fontSize: 24,
										fontWeight: 700,
										color: "var(--pm-purple)",
									}}
								>
									KES 12.8M
								</div>
								<div className="mt-2 d-flex gap-2">
									<button
										className={cx(s.btnPm, s.btnSm)}
										style={{
											borderColor: "var(--pm-purple)",
											color: "var(--pm-purple)",
										}}
										onClick={() => setActiveModal("consolidatedReportModal")}
									>
										View Group Report
									</button>
								</div>
							</div>
							<div className="table-responsive">
								<table className={s.tbl}>
									<thead>
										<tr>
											<th>Entity Name</th>
											<th>Role</th>
											<th>Cash Bal</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{config.entities.map((e) => (
											<tr
												key={e.name}
												style={
													e.isCurrent
														? { background: "var(--pm-surface-2)" }
														: {}
												}
											>
												<td data-label="Entity Name">
													<strong>{e.name}</strong>
													{e.isCurrent ? " (Current)" : ""}
												</td>
												<td data-label="Role">{e.role}</td>
												<td data-label="Cash Bal">{e.balance}</td>
												<td data-label="Action">
													<button
														className={cx(s.btnPm, s.btnSm)}
														onClick={() => setActiveModal(e.actionModal)}
														disabled={e.actionDisabled}
													>
														{e.actionLabel}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.1.4: Team & User Management */}
				<div className={s.card}>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<div>
							<h3 className={cx(s.st, "text-success")}>
								<i
									className="bi bi-people"
									style={{ color: "var(--pm-accent)" }}
								/>{" "}
								Team & User Management
							</h3>
							<p className={s.ss}>
								Manage roles, permissions, approval limits, and MFA
								requirements.
							</p>
						</div>
						<div className="d-flex gap-2">
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("rolePermissionsModal")}
							>
								<i className="bi bi-shield-lock" /> View Roles Matrix
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("inviteUserModal")}
							>
								<i className="bi bi-person-plus" /> Invite User
							</button>
						</div>
					</div>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>User</th>
									<th>Role / Dept</th>
									<th>Approval Limit</th>
									<th>MFA Status</th>
									<th>Last Active</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{config.teamRows.map((tr) => (
									<tr key={tr.email}>
										<td data-label="User">
											<div className="d-flex align-items-center gap-2">
												<div
													className={s.avatar}
													style={{
														width: 28,
														height: 28,
														fontSize: 10,
														background: tr.avatarBg,
													}}
												>
													{tr.initials}
												</div>
												<div>
													<strong>{tr.name}</strong>
													<div
														style={{ fontSize: 11, color: "var(--pm-muted)" }}
													>
														{tr.email}
													</div>
												</div>
											</div>
										</td>
										<td data-label="Role / Dept">
											<span
												className={cx(s.badge, s[tr.roleBadge.tone ?? ""])}
												style={{
													...(tr.roleBadge.customBg
														? {
															background: tr.roleBadge.customBg,
															color: tr.roleBadge.customColor,
														}
														: {}),
												}}
											>
												{tr.roleBadge.text}
											</span>
										</td>
										<td data-label="Approval Limit">{tr.approvalLimit}</td>
										<td data-label="MFA Status">
											<span className={cx(s.badge, s[tr.mfa.tone])}>
												<i className={`bi ${tr.mfa.icon}`} /> {tr.mfa.text}
											</span>
										</td>
										<td data-label="Last Active">{tr.lastActive}</td>
										<td data-label="Actions">
											<button
												className={cx(s.btnPm, s.btnSm)}
												onClick={() => setActiveModal(tr.actionModal)}
											>
												{tr.actionLabel}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* TREND CHART & REVENUE MIX */}
				<div className="row g-3">
					<div className="col-lg-7">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-primary")}>
										<i className="bi bi-graph-up" /> Cash Flow Trend
									</h3>
									<p className={s.ss}>Revenue vs Expenses (Last 30 days)</p>
								</div>
								<div className="d-flex gap-1">
									<button className={cx(s.btnPm, s.btnSm, s.btnPmP)}>7d</button>
									<button className={cx(s.btnPm, s.btnSm)}>30d</button>
									<button className={cx(s.btnPm, s.btnSm)}>90d</button>
									<button className={cx(s.btnPm, s.btnSm)}>1y</button>
								</div>
							</div>
							<div style={{ height: 200, position: "relative" }}>
								<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 8 }}>
									<div style={{ flex: 1, background: "var(--pm-primary)", height: "60%", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
									<div style={{ flex: 1, background: "var(--pm-primary)", height: "75%", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
									<div style={{ flex: 1, background: "var(--pm-primary)", height: "85%", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
									<div style={{ flex: 1, background: "var(--pm-primary)", height: "95%", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
								</div>
							</div>
							<div className="d-flex gap-3 mt-2" style={{ fontSize: 11 }}>
								<span className="d-flex align-items-center gap-1">
									<div style={{ width: 10, height: 10, background: "var(--pm-primary)", borderRadius: 2 }} /> Revenue
								</span>
								<span className="d-flex align-items-center gap-1">
									<div style={{ width: 10, height: 10, background: "var(--pm-danger)", borderRadius: 2 }} /> Expenses
								</span>
							</div>
						</div>
					</div>
					<div className="col-lg-5">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-info")}>
										<i className="bi bi-pie-chart" /> Revenue Mix
									</h3>
									<p className={s.ss}>By source</p>
								</div>
							</div>
							<div className="d-flex gap-2">
								<div className="flex-1 p-3 rounded" style={{ background: "var(--pm-primary-soft)" }}>
									<div style={{ fontSize: 11, color: "var(--pm-primary)" }}>Invoices Paid</div>
									<div style={{ fontSize: 18, fontWeight: 700 }}>KES 1.2M</div>
								</div>
								<div className="flex-1 p-3 rounded" style={{ background: "var(--pm-accent-soft)" }}>
									<div style={{ fontSize: 11, color: "var(--pm-accent)" }}>M-Pesa Till</div>
									<div style={{ fontSize: 18, fontWeight: 700 }}>KES 420K</div>
								</div>
							</div>
							<div className="p-3 rounded mt-2" style={{ background: "var(--pm-warning-soft)" }}>
								<div style={{ fontSize: 11, color: "var(--pm-warning)" }}>Payment Links</div>
								<div style={{ fontSize: 18, fontWeight: 700 }}>KES 200K</div>
							</div>
						</div>
					</div>
				</div>

				{/* AGING INVOICES & OBLIGATIONS */}
				<div className="row g-3">
					<div className="col-lg-7">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-warning")}>
										<i className="bi bi-receipt" /> Aging Receivables
									</h3>
									<p className={s.ss}>Outstanding invoices by days overdue</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm, s.btnPmP)}
									onClick={() => setActiveModal("agingInvoicesModal")}
								>
									<i className="bi bi-send-check" /> Send Auto-Reminders
								</button>
							</div>
							<div className="d-flex gap-2 h-100">
								{config.agingBlocks.map((ab) => (
									<div
										key={ab.range}
										className={s.agingBlock}
										style={{ background: ab.bgColor, cursor: "pointer" }}
										onClick={() => setActiveModal("agingInvoicesModal")}
									>
										<div style={{ fontSize: 12, color: ab.color, fontWeight: 600 }}>
											{ab.range}
										</div>
										<div style={{ fontSize: 18, fontWeight: 700, color: ab.textColor }}>
											{ab.amount}
										</div>
									</div>
								))}
							</div>
							<div className="mt-3">
								<span style={{ fontSize: 13 }}>
									<strong>Total outstanding:</strong> KES 750K
								</span>
							</div>
						</div>
					</div>
					<div className="col-lg-5">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-info")}>
										<i className="bi bi-calendar-event" /> Upcoming Obligations
									</h3>
									<p className={s.ss}>Next 14 days — plan your cash</p>
								</div>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded" style={{ background: "var(--pm-danger-soft)" }}>
									<div className="d-flex justify-content-between">
										<span style={{ fontSize: 12, fontWeight: 600 }}>Payroll Run — October</span>
										<span style={{ fontSize: 12, color: "var(--pm-danger)" }}>KES 450.5K</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>due in 3 days</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-warning-soft)" }}>
									<div className="d-flex justify-content-between">
										<span style={{ fontSize: 12, fontWeight: 600 }}>KRA VAT + PAYE Filing</span>
										<span style={{ fontSize: 12, color: "var(--pm-warning)" }}>KES 169.5K</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>due in 7 days</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-info-soft)" }}>
									<div className="d-flex justify-content-between">
										<span style={{ fontSize: 12, fontWeight: 600 }}>Supplier: OfficeMart</span>
										<span style={{ fontSize: 12, color: "var(--pm-info)" }}>KES 120K</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>due in 10 days</div>
								</div>
							</div>
							<button
								className={cx(s.btnPm, s.btnSm, "mt-3 w-100")}
								onClick={() => setActiveModal("schedulePaymentModal")}
							>
								<i className="bi bi-calendar-plus" /> View Full Payment Calendar
							</button>
						</div>
					</div>
				</div>

				{/* TRANSACTIONS + QUICK ACTIONS */}
				<div className="row g-3">
					<div className="col-lg-8">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-success")}>
										<i className="bi bi-arrow-left-right" /> Recent Transactions
									</h3>
									<p className={s.ss}>Latest activity across all accounts</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("statementModal")}
								>
									<i className="bi bi-download" /> Statement
								</button>
							</div>
							<div className="table-responsive">
								<table className={s.tbl}>
									<thead>
										<tr>
											<th>Description</th>
											<th>Category</th>
											<th>Status</th>
											<th>Date</th>
											<th className="text-end">Amount</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Acme Corp — INV-2025-142</td>
											<td>Invoice</td>
											<td>
												<span className={cx(s.badge, s.badgeS)}>Paid</span>
											</td>
											<td>Today</td>
											<td className="text-end" style={{ color: "var(--pm-accent)" }}>
												+KES 150,000
											</td>
										</tr>
										<tr>
											<td>M-Pesa Till (Buy Goods)</td>
											<td>Collections</td>
											<td>
												<span className={cx(s.badge, s.badgeI)}>Settling</span>
											</td>
											<td>Today</td>
											<td className="text-end" style={{ color: "var(--pm-accent)" }}>
												+KES 450,000
											</td>
										</tr>
										<tr>
											<td>Supplier: AWS Hosting</td>
											<td>Expense</td>
											<td>
												<span className={cx(s.badge, s.badgeW)}>
													Pending Approval
												</span>
											</td>
											<td>Yesterday</td>
											<td className="text-end" style={{ color: "var(--pm-danger)" }}>
												-KES 85,000
											</td>
										</tr>
										<tr>
											<td>Money Market Fund Deposit</td>
											<td>Investment</td>
											<td>
												<span className={cx(s.badge, s.badgePurple)}>Sweep</span>
											</td>
											<td>Yesterday</td>
											<td className="text-end" style={{ color: "var(--pm-danger)" }}>
												-KES 500,000
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<h3 className={cx(s.st, "mb-3")}>Quick Actions</h3>
							<div className={s.quickGrid}>
								{config.quickActions.map((qa) => (
									<div
										key={qa.label}
										className={s.quickBtn}
										onClick={() => setActiveModal(qa.modal)}
									>
										<i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
										{qa.label}
									</div>
								))}
							</div>
							<div className={s.suggestionBox} style={{ marginTop: 12 }}>
								<div style={{ fontSize: 12, fontWeight: 700, color: "#047857", marginBottom: 4 }}>
									<i className={`bi ${config.suggestion.icon}`} /> {config.suggestion.title}
								</div>
								<div style={{ fontSize: 12, color: "#065F46" }}>{config.suggestion.text}</div>
								<button
									className={cx(s.btnPm, s.btnSm, "mt-2 w-100")}
									style={{ background: "#fff", color: "#047857", borderColor: "rgba(16,185,129,.3)" }}
									onClick={() => setActiveModal("investmentModal")}
								>
									<i className="bi bi-graph-up-arrow" /> View Investment Options
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* FORECAST + TEAM */}
				<div className="row g-3">
					<div className="col-lg-5">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st}>
										<i className="bi bi-graph-down" /> Cash Flow Forecast
									</h3>
									<p className={s.ss}>Projected balance — next 4 weeks</p>
								</div>
								<span className={cx(s.badge, s.badgeI)}>AI Projection</span>
							</div>
							<div className="d-flex align-items-end gap-3 py-3" style={{ height: 120, borderBottom: "1px solid var(--pm-border)", paddingTop: 10 }}>
								<div style={{ flex: 1, background: "var(--pm-accent)", height: "60%", borderRadius: "4px 4px 0 0" }} />
								<div style={{ flex: 1, background: "var(--pm-danger)", height: "70%", borderRadius: "4px 4px 0 0" }} />
								<div style={{ flex: 1, background: "var(--pm-accent)", height: "80%", borderRadius: "4px 4px 0 0" }} />
								<div style={{ flex: 1, background: "var(--pm-danger)", height: "90%", borderRadius: "4px 4px 0 0" }} />
							</div>
							<div className="row g-2 text-center mt-1">
								<div className="col-3">
									<div style={{ fontSize: 11 }}>Week 1</div>
									<div style={{ fontWeight: 700, color: "var(--pm-accent)" }}>+280K</div>
								</div>
								<div className="col-3">
									<div style={{ fontSize: 11 }}>Week 2</div>
									<div style={{ fontWeight: 700, color: "var(--pm-danger)" }}>-310K</div>
								</div>
								<div className="col-3">
									<div style={{ fontSize: 11 }}>Week 3</div>
									<div style={{ fontWeight: 700, color: "var(--pm-accent)" }}>+340K</div>
								</div>
								<div className="col-3">
									<div style={{ fontSize: 11 }}>Week 4</div>
									<div style={{ fontWeight: 700, color: "var(--pm-danger)" }}>-450K</div>
								</div>
							</div>
							<button
								className={cx(s.btnPm, s.btnSm, "mt-3 w-100")}
								onClick={() => setActiveModal("cashForecastModal")}
							>
								<i className="bi bi-diagram-3" /> View Full Forecast
							</button>
						</div>
					</div>
					<div className="col-lg-7">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-purple)" }}>
										<i className="bi bi-people" /> Administrations & Team
									</h3>
									<p className={s.ss}>Roles, approval limits & security</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("rolePermissionsModal")}
								>
									<i className="bi bi-shield-lock" /> Roles
								</button>
							</div>
							<div className="d-flex gap-2 flex-wrap mb-3">
								<span className={cx(s.badge, s.badgeS)}>4 Users</span>
								<span className={cx(s.badge, s.badgeI)}>2 Approvers</span>
								<span className={cx(s.badge, s.badgeW)}>1 Pending</span>
							</div>
							<div className="table-responsive">
								<table className={s.tbl}>
									<thead>
										<tr>
											<th>User</th>
											<th>Role</th>
											<th>Approval Limit</th>
											<th>MFA</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{config.teamRows.slice(0, 3).map((tr) => (
											<tr key={tr.email}>
												<td>
													<div className="d-flex align-items-center gap-2">
														<div className={s.avatar} style={{ width: 24, height: 24, fontSize: 10, background: tr.avatarBg }}>
															{tr.initials}
														</div>
														<strong>{tr.name}</strong>
													</div>
												</td>
												<td>
													<span className={cx(s.badge, s[tr.roleBadge.tone ?? ""])} style={{ ...(tr.roleBadge.customBg ? { background: tr.roleBadge.customBg, color: tr.roleBadge.customColor } : {}) }}>
														{tr.roleBadge.text}
													</span>
												</td>
												<td>{tr.approvalLimit}</td>
												<td>
													<span className={cx(s.badge, s[tr.mfa.tone])}>
														<i className={`bi ${tr.mfa.icon}`} /> {tr.mfa.text}
													</span>
												</td>
												<td>
													<button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(tr.actionModal)}>
														Edit
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				{/* CLIENTS + PRESENCE */}
				<div className="row g-3">
					<div className="col-lg-6">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-primary")}>
										<i className="bi bi-people-fill" /> My Clients
									</h3>
									<p className={s.ss}>Active accounts & top clients</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("clientsModal")}
								>
									<i className="bi bi-collection" /> View All
								</button>
							</div>
							<div className="row g-2 text-center mb-2">
								<div className="col-4">
									<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
										<div style={{ fontSize: 18, fontWeight: 700 }}>28</div>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Total</div>
									</div>
								</div>
								<div className="col-4">
									<div className="p-2 rounded" style={{ background: "var(--pm-accent-soft)" }}>
										<div style={{ fontSize: 18, fontWeight: 700, color: "var(--pm-accent)" }}>64%</div>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Repeat</div>
									</div>
								</div>
								<div className="col-4">
									<div className="p-2 rounded" style={{ background: "var(--pm-warning-soft)" }}>
										<div style={{ fontSize: 18, fontWeight: 700, color: "var(--pm-warning)" }}>3</div>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Risky</div>
									</div>
								</div>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded border" style={{ cursor: "pointer" }} onClick={() => setActiveModal("clientsModal")}>
									<div className="d-flex justify-content-between">
										<strong>Acme Corp</strong>
										<span style={{ color: "var(--pm-accent)" }}>KES 420K</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>KE · Active</div>
								</div>
								<div className="p-2 rounded border" style={{ cursor: "pointer" }} onClick={() => setActiveModal("clientsModal")}>
									<div className="d-flex justify-content-between">
										<strong>Global Industries</strong>
										<span style={{ color: "var(--pm-accent)" }}>KES 185K</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>UG · Active</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-6">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-accent)" }}>
										<i className="bi bi-buildings" /> Offices & Branches
									</h3>
									<p className={s.ss}>Your physical footprint</p>
								</div>
								<div className="d-flex gap-1">
									<button className={cx(s.btnPm, s.btnSm, s.btnPmP)}>Offices</button>
									<button className={cx(s.btnPm, s.btnSm)}>Analytics</button>
								</div>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>Nairobi HQ</strong>
										<span className={cx(s.badge, s.badgeS)}>Head Office</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Full team · Active</div>
								</div>
								<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>Innovation Lab</strong>
										<span className={cx(s.badge, s.badgeI)}>Engineering</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>12 engineers · Active</div>
								</div>
								<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>Sales Hub</strong>
										<span className={cx(s.badge, s.badgeI)}>Sales</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>4 sales · Active</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* REGIONS + CALENDAR */}
				<div className="row g-3">
					<div className="col-lg-8">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-warning")}>
										<i className="bi bi-globe-americas" /> Regions & Countries of Operation
									</h3>
									<p className={s.ss}>Where you have clients & live market clocks</p>
								</div>
							</div>
							<div className="row g-3">
								<div className="col-md-6">
									<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
										<div className="d-flex align-items-center gap-2 mb-2">
											<span style={{ fontSize: 24 }}>🇰🇪</span>
											<div>
												<strong>Kenya</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>12 clients · KES 420K</div>
											</div>
										</div>
										<div className="d-flex justify-content-between" style={{ fontSize: 11 }}>
											<span>Time: 09:41 AM</span>
											<span className={cx(s.badge, s.badgeS)}>HQ</span>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
										<div className="d-flex align-items-center gap-2 mb-2">
											<span style={{ fontSize: 24 }}>🇺🇬</span>
											<div>
												<strong>Uganda</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>8 clients · KES 185K</div>
											</div>
										</div>
										<div className="d-flex justify-content-between" style={{ fontSize: 11 }}>
											<span>Time: 10:41 AM</span>
											<span className={cx(s.badge, s.badgeI)}>Active</span>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
										<div className="d-flex align-items-center gap-2 mb-2">
											<span style={{ fontSize: 24 }}>🇹🇿</span>
											<div>
												<strong>Tanzania</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>5 clients · KES 145K</div>
											</div>
										</div>
										<div className="d-flex justify-content-between" style={{ fontSize: 11 }}>
											<span>Time: 10:41 AM</span>
											<span className={cx(s.badge, s.badgeI)}>Active</span>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
										<div className="d-flex align-items-center gap-2 mb-2">
											<span style={{ fontSize: 24 }}>🇳🇬</span>
											<div>
												<strong>Nigeria</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>3 clients · KES 60K</div>
											</div>
										</div>
										<div className="d-flex justify-content-between" style={{ fontSize: 11 }}>
											<span>Time: 09:41 AM</span>
											<span className={cx(s.badge, s.badgeI)}>Active</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st}>
										<i className="bi bi-calendar2-week" /> Operations Calendar
									</h3>
									<p className={s.ss}>Payments, payroll & filings</p>
								</div>
							</div>
							<div style={{ fontFamily: "var(--pm-font-display)", fontWeight: 700, marginBottom: 10 }}>
								October 2025
							</div>
							<div className="d-flex gap-1 flex-wrap mb-3">
								{Array.from({ length: 31 }, (_, i) => (
									<div
										key={i}
										className="p-2 rounded text-center"
										style={{
											width: 32,
											height: 32,
											fontSize: 11,
											background: i === 28 ? "var(--pm-primary)" : "var(--pm-surface-2)",
											color: i === 28 ? "#fff" : "var(--pm-ink)",
											cursor: "pointer",
										}}
									>
										{i + 1}
									</div>
								))}
							</div>
							<div className="mt-3">
								<div className="p-2 rounded d-flex align-items-center gap-2 mb-2" style={{ background: "var(--pm-danger-soft)", fontSize: 12 }}>
									<i className="bi bi-flag-fill text-danger" />
									<strong>Payroll due</strong> — 3 days
								</div>
								<div className="p-2 rounded d-flex align-items-center gap-2" style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}>
									<i className="bi bi-bank text-warning" />
									<strong>KRA filing</strong> — 7 days
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* CURRENCIES + BANKS + VIRTUAL */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-success")}>
										<i className="bi bi-cash-stack" /> Multi-Currency
									</h3>
									<p className={s.ss}>Hold, receive & pay globally</p>
								</div>
								<span className={cx(s.badge, s.badgeI)}>3</span>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>KES</strong>
										<span>KES 2.45M</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Kenyan Shilling · Primary</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>USD</strong>
										<span>USD 12,400</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>US Dollar · Active</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>UGX</strong>
										<span>UGX 28M</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Ugandan Shilling · Active</div>
								</div>
							</div>
							<button
								className={cx(s.btnPm, s.btnSm, "mt-3 w-100")}
								onClick={() => setActiveModal("currencyModal")}
							>
								Manage Currencies
							</button>
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st}>
										<i className="bi bi-bank" /> Linked Bank Accounts
									</h3>
									<p className={s.ss}>For payouts & settlements</p>
								</div>
								<span className={cx(s.badge, s.badgeI)}>4</span>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>Equity Bank</strong>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>***4521 · KES 8.12M</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>KCB Bank</strong>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>***2088 · KES 2.1M</div>
								</div>
							</div>
							<button
								className={cx(s.btnPm, s.btnSm, "mt-3 w-100")}
								onClick={() => setActiveModal("connectBankModal")}
							>
								Manage Banks
							</button>
						</div>
					</div>
					<div className="col-lg-4">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-info)" }}>
										<i className="bi bi-credit-card-2-front" /> Virtual Accounts
									</h3>
									<p className={s.ss}>Collect & receive seamlessly</p>
								</div>
								<span className={cx(s.badge, s.badgeI)}>5</span>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>VA-88421</strong>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>KES · M-Pesa Till</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-surface-2)" }}>
									<div className="d-flex justify-content-between">
										<strong>VA-77012</strong>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>USD · Card Gateway</div>
								</div>
							</div>
							<button
								className={cx(s.btnPm, s.btnSm, "mt-3 w-100")}
								onClick={() => setActiveModal("virtualAccountModal")}
							>
								Manage Virtual Accts
							</button>
						</div>
					</div>
				</div>

				{/* TOOLS + MULTI-BIZ */}
				<div className="row g-3">
					<div className="col-lg-7">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-info")}>
										<i className="bi bi-plug" /> Connected Tools & Integrations
									</h3>
									<p className={s.ss}>Your business tool ecosystem</p>
								</div>
							</div>
							<div className="row g-2">
								{[
									{ name: "WhatsApp", icon: "bi-whatsapp", color: "#25D366", status: "Connected" },
									{ name: "Instagram", icon: "bi-instagram", color: "#E1306C", status: "Connected" },
									{ name: "Facebook", icon: "bi-facebook", color: "#1877F2", status: "Connected" },
									{ name: "QuickBooks", icon: "bi-journal", color: "#2CA01C", status: "Connected" },
									{ name: "Shopify", icon: "bi-bag", color: "#95BF47", status: "Connected" },
									{ name: "Google Analytics", icon: "bi-graph-up", color: "#E37400", status: "Connected" },
								].map((tool) => (
									<div key={tool.name} className="col-md-4">
										<div className="p-2 rounded border text-center" style={{ cursor: "pointer" }} onClick={() => setActiveModal("connectToolModal")}>
											<i className={`bi ${tool.icon}`} style={{ fontSize: 20, color: tool.color }} />
											<div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{tool.name}</div>
											<span className={cx(s.badge, s.badgeS)} style={{ fontSize: 10 }}>{tool.status}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="col-lg-5">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-purple)" }}>
										<i className="bi bi-diagram-3" /> Multi-Business Group
									</h3>
									<p className={s.ss}>Switch accounts & view consolidated data</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("switchBusinessModal")}
								>
									Switch
								</button>
							</div>
							<div className="p-3 rounded mb-3 d-flex justify-content-between align-items-center" style={{ background: "var(--pm-purple-soft)" }}>
								<div>
									<div style={{ fontSize: 11, color: "#6D28D9", fontWeight: 700 }}>CONSOLIDATED GROUP CASH</div>
									<div style={{ fontSize: 22, fontWeight: 700, color: "var(--pm-purple)" }}>KES 14.6M</div>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{ borderColor: "var(--pm-purple)", color: "var(--pm-purple)" }}
									onClick={() => setActiveModal("consolidatedReportModal")}
								>
									<i className="bi bi-file-earmark-bar-graph" /> Group Report
								</button>
							</div>
							<div className="table-responsive">
								<table className={s.tbl}>
									<thead>
										<tr>
											<th>Entity</th>
											<th>Type</th>
											<th>Cash</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{config.entities.map((e) => (
											<tr key={e.name} style={e.isCurrent ? { background: "var(--pm-surface-2)" } : {}}>
												<td><strong>{e.name}</strong></td>
												<td>{e.role}</td>
												<td>{e.balance}</td>
												<td>
													<button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(e.actionModal)} disabled={e.actionDisabled}>
														{e.actionLabel}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				{/* INVOICES + STATUTORY */}
				<div className="row g-3">
					<div className="col-lg-7">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-primary")}>
										<i className="bi bi-receipt" /> Invoices & Payables
									</h3>
									<p className={s.ss}>Recent invoices & payment status</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("agingInvoicesModal")}
								>
									<i className="bi bi-list-check" /> Aging Report
								</button>
							</div>
							<div className="table-responsive">
								<table className={s.tbl}>
									<thead>
										<tr>
											<th>Invoice</th>
											<th>Client</th>
											<th>Amount</th>
											<th>Status</th>
											<th>Due</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>INV-2025-142</td>
											<td>Acme Corp</td>
											<td>KES 150,000</td>
											<td><span className={cx(s.badge, s.badgeS)}>Paid</span></td>
											<td>Oct 25</td>
										</tr>
										<tr>
											<td>INV-2025-141</td>
											<td>Global Industries</td>
											<td>KES 185,000</td>
											<td><span className={cx(s.badge, s.badgeW)}>Overdue</span></td>
											<td>Oct 20</td>
										</tr>
										<tr>
											<td>INV-2025-140</td>
											<td>StartUp Inc</td>
											<td>KES 145,000</td>
											<td><span className={cx(s.badge, s.badgeW)}>Overdue</span></td>
											<td>Oct 15</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className="col-lg-5">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={cx(s.st, "text-danger")}>
										<i className="bi bi-bank2" /> Statutory & Tax
									</h3>
									<p className={s.ss}>KRA obligations this period</p>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("statutoryModal")}
								>
									<i className="bi bi-file-earmark-bar-graph" /> View
								</button>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded" style={{ background: "var(--pm-danger-soft)" }}>
									<div className="d-flex justify-content-between">
										<span style={{ fontSize: 12, fontWeight: 600 }}>PAYE (Income Tax)</span>
										<span style={{ fontSize: 12, color: "var(--pm-danger)" }}>KES 98,000</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Due: Nov 5, 2025</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-warning-soft)" }}>
									<div className="d-flex justify-content-between">
										<span style={{ fontSize: 12, fontWeight: 600 }}>NSSF Contribution</span>
										<span style={{ fontSize: 12, color: "var(--pm-warning)" }}>KES 2,160</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Due: Nov 9, 2025</div>
								</div>
								<div className="p-2 rounded" style={{ background: "var(--pm-warning-soft)" }}>
									<div className="d-flex justify-content-between">
										<span style={{ fontSize: 12, fontWeight: 600 }}>SHIF Contribution</span>
										<span style={{ fontSize: 12, color: "var(--pm-warning)" }}>KES 5,400</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Due: Nov 9, 2025</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* BUDGET + RECURRING */}
				<div className="row g-3">
					<div className="col-lg-6">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-info)" }}>
										<i className="bi bi-pie-chart-fill" /> Departments & Budget
									</h3>
									<p className={s.ss}>Spend vs budget by department</p>
								</div>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded">
									<div className="d-flex justify-content-between mb-1">
										<strong>Engineering</strong>
										<span>KES 420K / KES 500K</span>
									</div>
									<div className={s.progress} style={{ height: 6 }}>
										<div className={s.progressBar} style={{ width: "84%", background: "var(--pm-accent)" }} />
									</div>
								</div>
								<div className="p-2 rounded">
									<div className="d-flex justify-content-between mb-1">
										<strong>Sales</strong>
										<span>KES 280K / KES 300K</span>
									</div>
									<div className={s.progress} style={{ height: 6 }}>
										<div className={s.progressBar} style={{ width: "93%", background: "var(--pm-warning)" }} />
									</div>
								</div>
								<div className="p-2 rounded">
									<div className="d-flex justify-content-between mb-1">
										<strong>Operations</strong>
										<span>KES 180K / KES 200K</span>
									</div>
									<div className={s.progress} style={{ height: 6 }}>
										<div className={s.progressBar} style={{ width: "90%", background: "var(--pm-info)" }} />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-6">
						<div className={cx(s.card, "h-100")}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h3 className={s.st} style={{ color: "var(--pm-purple)" }}>
										<i className="bi bi-arrow-repeat" /> Recurring Payments
									</h3>
									<p className={s.ss}>Active subscriptions & standing orders</p>
								</div>
							</div>
							<div className="d-flex flex-column gap-2">
								<div className="p-2 rounded border">
									<div className="d-flex justify-content-between">
										<strong>AWS Hosting</strong>
										<span>KES 85,000/mo</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Next: Nov 1, 2025</div>
								</div>
								<div className="p-2 rounded border">
									<div className="d-flex justify-content-between">
										<strong>Office Rent</strong>
										<span>KES 120,000/mo</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Next: Nov 1, 2025</div>
								</div>
								<div className="p-2 rounded border">
									<div className="d-flex justify-content-between">
										<strong>Software Licenses</strong>
										<span>KES 45,000/mo</span>
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Next: Nov 5, 2025</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* PROFILE */}
				<div className={s.card}>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<div>
							<h3 className={cx(s.st, "text-info")}>
								<i className="bi bi-building-check" /> Business Profile & KYB
							</h3>
							<p className={s.ss}>Corporate details and verification status</p>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => setActiveModal("businessSettingsModal")}
						>
							<i className="bi bi-pencil" />
						</button>
					</div>
					<div className="row g-2 mb-3">
						{config.profileFields.map((pf) => (
							<div key={pf.label} className="col-sm-6">
								<div className={s.profileField}>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{pf.label}</div>
									<div style={{ fontSize: 13, fontWeight: 600, ...(pf.mono ? { fontFamily: "monospace" } : {}) }}>
										{pf.value}
									</div>
								</div>
							</div>
						))}
					</div>
					{config.kybItems.map((ki) => (
						<div key={ki.name} className="d-flex justify-content-between align-items-center p-2 border-bottom" style={{ fontSize: 13 }}>
							<span>{ki.name}</span>
							<span className={cx(s.badge, s[ki.badge.tone])}>
								<i className={`bi ${ki.badge.icon}`} /> {ki.badge.text}
							</span>
						</div>
					))}
				</div>

			</div>

			{/* MODALS */}
			<CommandCenterModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
