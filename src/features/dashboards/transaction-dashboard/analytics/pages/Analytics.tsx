import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import type {
	AttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import AnalyticsModals from "../components/AnalyticsModals";
import styles from "../styles/analytics.module.css";

/* ============================================================================
   PayMo BaaS — Transaction Analytics & Reporting
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.

   Refined surface: rebuilt on the PayMo business-dashboard composition —
   executive hero, numbered sections (pulse → attention → volume & merchant →
   trends → failure analysis → merchant & category → report builder → export),
   KPI pulse, action centre, quick actions, chart/heatmap panels, table cards,
   floating command bar and footer. Shell chrome is owned by AppShell; this
   page renders content only. All 12 modals remain reachable from the page
   (notifModal/profileModal re-wired from the hero snapshot).
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface SrRow {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
}

interface AnalyticsConfig {
	pageTitle: string;
	pageSub: string;
	hero: {
		live: string;
		value: string;
		detail: string;
		actions: { label: string; modal: string }[];
	};
	statCards: {
		key: string;
		label: string;
		labelColor: string;
		value: string;
		badge: { icon: string; text: string; tone: BadgeTone };
		note?: string[];
		progress?: { width: string; color: string };
		bordered?: boolean;
	}[];
	attention: SrRow[];
	suggestions: SrRow[];
	quickActions: { icon: string; label: string; color: string; modal: string }[];
	trendBars: { height: string; color: string; label: string }[];
	trendSummary: { value: string; label: string }[];
	topMerchants: { name: string; sub: string; share: string; tone: BadgeTone }[];
	heatmap: { label: string; value: string; bg: string; color?: string }[];
	weekdays: { label: string; value: string; color: string }[];
	bestDay: { label: string; day: string; note: string };
	seasonal: { label: string; badge: string; tone: BadgeTone }[];
	failureReasons: {
		label: string;
		badge: string;
		tone: BadgeTone;
		count: string;
	}[];
	topFailing: { name: string; badge: string; tone: BadgeTone }[];
	retryPerf: {
		label: string;
		value: string;
		bg: string;
		color: string;
		labelColor: string;
	}[];
	categories: {
		name: string;
		volume: string;
		txns: string;
		success: string;
		successTone: BadgeTone;
		avg: string;
	}[];
	concentration: { title: string; value: string; sub: string; score: string };
	templates: { title: string; sub: string }[];
	recentReports: {
		name: string;
		created: string;
		filters: string;
		status: string;
		tone: BadgeTone;
		action: string;
		modal: string;
	}[];
	scheduled: {
		name: string;
		freq: string;
		next: string;
		recipients: string;
		status: string;
		tone: BadgeTone;
		paused: boolean;
		msg: string;
	}[];
	recentExports: { name: string; meta: string }[];
	exportOptions: { icon: string; label: string; color: string }[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: AnalyticsConfig = {
	pageTitle: "Transaction Analytics & Reporting",
	pageSub:
		"Deep-dive analytics on volumes, success rates, failure patterns, merchant insights, custom report builder and automated delivery.",
	hero: {
		live: "Analytics engine live",
		value: "KES 2.84B analyzed",
		detail:
			"42,891 transactions • 94.7% success rate • 1,284 merchants tracked this month.",
		actions: [
			{ label: "Build Report", modal: "reportBuilderModal" },
			{ label: "Schedule", modal: "scheduledReportsModal" },
			{ label: "Export", modal: "exportModal" },
		],
	},
	statCards: [
		{
			key: "success",
			label: "SUCCESS RATE",
			labelColor: "var(--pm-accent)",
			value: "94.7%",
			badge: {
				icon: "bi-graph-up-arrow",
				text: "+1.8% vs last month",
				tone: "badgeS",
			},
			progress: { width: "94.7%", color: "var(--pm-accent)" },
		},
		{
			key: "avg",
			label: "AVG TRANSACTION VALUE",
			labelColor: "var(--pm-info)",
			value: "KES 66,240",
			badge: { icon: "bi-graph-down-arrow", text: "-4.2% MoM", tone: "badgeI" },
			note: ["Peak day: KES 124.8M", "Peak hour: 10:00–11:00 AM"],
		},
		{
			key: "failed",
			label: "FAILED TRANSACTIONS",
			labelColor: "var(--pm-warning)",
			value: "2,247",
			badge: {
				icon: "bi-exclamation-triangle",
				text: "5.3% failure rate",
				tone: "badgeD",
			},
			note: [
				"Top reason: Insufficient funds (1,124)",
				"Top merchant: KRA iTax (318)",
			],
			bordered: true,
		},
	],
	attention: [
		{
			icon: "bi-x-circle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "KRA iTax failures spike 38%",
			sub: "318 failed • KES 42.1M at risk",
			actionLabel: "Investigate",
			modal: "failureDrillModal",
		},
		{
			icon: "bi-clock",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Report generation delayed",
			sub: "Monthly reconciliation • 4 hours late",
			actionLabel: "Retry",
			modal: "scheduledReportsModal",
		},
		{
			icon: "bi-graph-down",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Merchant concentration risk",
			sub: "Top 3 merchants = 47% volume",
			actionLabel: "Review",
			modal: "merchantDrillModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightbulb",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Enable auto-retry for failed KRA payments",
			sub: "Recover ~KES 18M monthly",
			actionLabel: "Enable",
			modal: "autoRetryModal",
		},
		{
			icon: "bi-clock-history",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Schedule weekly failure analysis",
			sub: "Every Monday 8 AM",
			actionLabel: "Schedule",
			modal: "scheduledReportsModal",
		},
		{
			icon: "bi-pie-chart",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Add merchant risk scoring to dashboard",
			sub: "Proactive concentration alerts",
			actionLabel: "Add",
			modal: "merchantDrillModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-circle",
			label: "New Report",
			color: "var(--pm-primary-light)",
			modal: "reportBuilderModal",
		},
		{
			icon: "bi-download",
			label: "Export CSV/PDF",
			color: "var(--pm-accent)",
			modal: "exportModal",
		},
		{
			icon: "bi-x-circle",
			label: "Failure Analysis",
			color: "var(--pm-danger)",
			modal: "failureDrillModal",
		},
		{
			icon: "bi-shop",
			label: "Merchant Insights",
			color: "var(--pm-warning)",
			modal: "merchantDrillModal",
		},
		{
			icon: "bi-calendar-event",
			label: "Scheduled Reports",
			color: "var(--pm-info)",
			modal: "scheduledReportsModal",
		},
		{
			icon: "bi-graph-up",
			label: "Trend Drill-down",
			color: "var(--pm-purple)",
			modal: "trendModal",
		},
		{
			icon: "bi-heart-pulse",
			label: "Health Check",
			color: "var(--pm-muted)",
			modal: "healthCheckModal",
		},
		{
			icon: "bi-tags",
			label: "Category Analysis",
			color: "var(--pm-accent)",
			modal: "categoryModal",
		},
	],
	trendBars: [
		{ height: "55%", color: "var(--pm-info)", label: "W1" },
		{ height: "68%", color: "var(--pm-info)", label: "W2" },
		{ height: "82%", color: "var(--pm-primary)", label: "W3" },
		{ height: "74%", color: "var(--pm-primary)", label: "W4" },
		{ height: "91%", color: "var(--pm-accent)", label: "W5" },
	],
	trendSummary: [
		{ value: "KES 2.84B", label: "total volume" },
		{ value: "42,891", label: "transactions" },
		{ value: "94.7%", label: "success" },
	],
	topMerchants: [
		{
			name: "KRA iTax",
			sub: "KES 684M • 8,421 txns",
			share: "24.1%",
			tone: "badgeS",
		},
		{
			name: "Equity Bank",
			sub: "KES 412M • 5,882 txns",
			share: "14.5%",
			tone: "badgeI",
		},
		{
			name: "Safaricom M-Pesa",
			sub: "KES 298M • 12,104 txns",
			share: "10.5%",
			tone: "badgeP",
		},
		{
			name: "Co-op Bank",
			sub: "KES 187M • 2,991 txns",
			share: "6.6%",
			tone: "badgeW",
		},
		{
			name: "DTB Kenya",
			sub: "KES 154M • 1,882 txns",
			share: "5.4%",
			tone: "badgeW",
		},
	],
	heatmap: [
		{ label: "6-9AM", value: "18%", bg: "var(--pm-accent-soft)" },
		{
			label: "9AM-12PM",
			value: "32%",
			bg: "linear-gradient(135deg,#2ee6a0,#14b981)",
			color: "#02120a",
		},
		{ label: "12-3PM", value: "24%", bg: "var(--pm-accent-soft)" },
		{ label: "3-6PM", value: "19%", bg: "var(--pm-info-soft)" },
		{ label: "6-9PM", value: "7%", bg: "var(--pm-warning-soft)" },
	],
	weekdays: [
		{ label: "Weekdays", value: "78%", color: "var(--pm-primary-light)" },
		{ label: "Weekends", value: "22%", color: "var(--pm-accent)" },
	],
	bestDay: {
		label: "Best performing day",
		day: "Tuesday",
		note: "+18% above average",
	},
	seasonal: [
		{ label: "End of Month", badge: "+34%", tone: "badgeS" },
		{ label: "Salary Week", badge: "+27%", tone: "badgeI" },
		{ label: "Tax Filing Season", badge: "+41%", tone: "badgeP" },
	],
	failureReasons: [
		{
			label: "Insufficient Funds",
			badge: "50%",
			tone: "badgeD",
			count: "(1,124)",
		},
		{
			label: "Daily Limit Exceeded",
			badge: "18%",
			tone: "badgeW",
			count: "(404)",
		},
		{
			label: "3D Secure Timeout",
			badge: "14%",
			tone: "badgeI",
			count: "(315)",
		},
		{ label: "Invalid Account", badge: "11%", tone: "badgeP", count: "(247)" },
		{ label: "Network/Timeout", badge: "7%", tone: "badgeW", count: "(157)" },
	],
	topFailing: [
		{ name: "KRA iTax", badge: "318 fails", tone: "badgeD" },
		{ name: "Co-op Bank", badge: "142 fails", tone: "badgeW" },
		{ name: "DTB Kenya", badge: "97 fails", tone: "badgeI" },
		{ name: "Equity Bank", badge: "84 fails", tone: "badgeP" },
	],
	retryPerf: [
		{
			label: "AUTO-RETRY SUCCESS",
			value: "67%",
			bg: "var(--pm-accent-soft)",
			color: "var(--pm-accent)",
			labelColor: "#6ee7b7",
		},
		{
			label: "MANUAL RETRY SUCCESS",
			value: "41%",
			bg: "var(--pm-info-soft)",
			color: "var(--pm-info)",
			labelColor: "#93c5fd",
		},
	],
	categories: [
		{
			name: "Government (KRA, NSSF, SHIF)",
			volume: "KES 892M",
			txns: "9,421",
			success: "89.2%",
			successTone: "badgeD",
			avg: "KES 94,600",
		},
		{
			name: "Bank Transfers",
			volume: "KES 684M",
			txns: "12,884",
			success: "97.1%",
			successTone: "badgeS",
			avg: "KES 53,100",
		},
		{
			name: "Utilities & Airtime",
			volume: "KES 412M",
			txns: "18,201",
			success: "98.4%",
			successTone: "badgeS",
			avg: "KES 22,600",
		},
		{
			name: "Business Payments",
			volume: "KES 298M",
			txns: "1,992",
			success: "94.8%",
			successTone: "badgeI",
			avg: "KES 149,600",
		},
	],
	concentration: {
		title: "HIGH CONCENTRATION",
		value: "Top 3 = 47%",
		sub: "KRA + Equity + Safaricom",
		score: "42/100",
	},
	templates: [
		{ title: "Monthly Reconciliation", sub: "All banks • Success + Failed" },
		{ title: "Merchant Performance", sub: "Top 50 merchants by volume" },
		{ title: "Failure Root Cause", sub: "Last 30 days with retry rates" },
		{ title: "Category Trends", sub: "Government, Banks, Utilities" },
	],
	recentReports: [
		{
			name: "Q2 Bank-to-Bank Summary",
			created: "25 Jun 2025",
			filters: "All banks • Success only",
			status: "Delivered",
			tone: "badgeS",
			action: "Download",
			modal: "exportModal",
		},
		{
			name: "KRA Failure Analysis",
			created: "24 Jun 2025",
			filters: "KRA • Last 90 days",
			status: "Scheduled",
			tone: "badgeI",
			action: "Edit",
			modal: "scheduledReportsModal",
		},
		{
			name: "High-Value Transactions",
			created: "20 Jun 2025",
			filters: "> KES 500K • All banks",
			status: "Delivered",
			tone: "badgeS",
			action: "Download",
			modal: "exportModal",
		},
	],
	scheduled: [
		{
			name: "Daily Transaction Summary",
			freq: "Daily 7:00 AM",
			next: "28 Jun 2025",
			recipients: "Finance Team (8)",
			status: "Active",
			tone: "badgeS",
			paused: false,
			msg: "Report paused successfully.",
		},
		{
			name: "Weekly Failure Report",
			freq: "Weekly Monday",
			next: "30 Jun 2025",
			recipients: "Risk Team (3)",
			status: "Active",
			tone: "badgeS",
			paused: false,
			msg: "Report paused successfully.",
		},
		{
			name: "Monthly Merchant Ranking",
			freq: "Monthly 1st",
			next: "01 Jul 2025",
			recipients: "Exec Team (5)",
			status: "Paused",
			tone: "badgeW",
			paused: true,
			msg: "Report resumed. Next delivery 01 Jul.",
		},
	],
	recentExports: [
		{ name: "June_Transactions_Full.csv", meta: "27 Jun • 42.8 MB" },
		{ name: "Q2_Merchant_Ranking.pdf", meta: "25 Jun • 8.2 MB" },
		{ name: "Failure_Analysis_May.xlsx", meta: "20 Jun • 3.1 MB" },
	],
	exportOptions: [
		{
			icon: "bi-file-earmark-spreadsheet",
			label: "CSV / Excel",
			color: "var(--pm-accent)",
		},
		{
			icon: "bi-file-earmark-pdf",
			label: "PDF Report",
			color: "var(--pm-danger)",
		},
		{
			icon: "bi-file-earmark-zip",
			label: "Compressed Archive",
			color: "var(--pm-info)",
		},
	],
};

/* ---------- TanStack Query fetcher ---------- */
async function fetchAnalytics(): Promise<AnalyticsConfig> {
	const res = await fetch("/api/analytics");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<AnalyticsConfig>;
	return { ...initialMockData, ...json };
}

/* ---------- LEGACY BRIDGE: file download ---------- */
function downloadFile(name: string, content: string, type = "text/plain") {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content], { type }));
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}

/* ---------- section heading (business numbered pattern) ---------- */
function SectionHeading({
	id,
	index,
	title,
	description,
	action,
}: {
	id: string;
	index: string;
	title: string;
	description: string;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.sectionHeading}>
			<div className={styles.sectionHeadingCopy}>
				<span className={styles.sectionIndex} aria-hidden="true">
					{index}
				</span>
				<div>
					<h2 id={id}>{title}</h2>
					<p>{description}</p>
				</div>
			</div>
			{action && <div className={styles.sectionAction}>{action}</div>}
		</div>
	);
}

/* ---------- utility box (subtle panel inside cards) ---------- */
function Ub({
	title,
	children,
	action,
}: {
	title: string;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.ub}>
			<div
				className="d-flex justify-content-between align-items-center flex-wrap"
				style={{ gap: 8 }}
			>
				<h4 className={styles.ubTitle} style={{ margin: 0 }}>
					{title}
				</h4>
				{action}
			</div>
			<div style={{ marginTop: 12 }}>{children}</div>
		</div>
	);
}

/* ---------- KPI visual metadata (keyed by stat key) ---------- */
const STAT_META: Record<
	string,
	{
		icon: string;
		bg: string;
		color: string;
		accent?: "kpiFeatured" | "kpiDanger";
	}
> = {
	success: {
		icon: "bi-check2-circle",
		bg: "var(--pm-green-soft)",
		color: "#067647",
		accent: "kpiFeatured",
	},
	avg: {
		icon: "bi-arrow-left-right",
		bg: "var(--pm-info-soft)",
		color: "#175cd3",
	},
	failed: {
		icon: "bi-x-octagon",
		bg: "var(--pm-danger-soft)",
		color: "#b42318",
		accent: "kpiDanger",
	},
};

export default function Analytics() {
	const { data, isFetching, error } = useQuery({
		queryKey: ["paymo-analytics"],
		queryFn: fetchAnalytics,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleDrawerAction = (modal: string) => {
		if (modal) openM(modal);
	};

	const drawerAttention = config.attention.map(
		(item): AttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: item.iconBg,
			iconColor: item.iconColor,
			title: item.title,
			sub: item.sub,
			actionLabel: item.actionLabel,
			modal: item.modal,
		}),
	);
	const drawerSuggestions = config.suggestions.map(
		(item): AttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: item.iconBg,
			iconColor: item.iconColor,
			title: item.title,
			sub: item.sub,
			actionLabel: item.actionLabel,
			modal: item.modal,
		}),
	);
	const drawerQuickActions = config.quickActions.map(
		(action): QuickActionItem => ({
			icon: action.icon.replace(/^bi-/, ""),
			iconColor: action.color,
			label: action.label,
			modal: action.modal,
		}),
	);

	/* Modal hygiene: scroll lock, Escape to close, focus returns to trigger. */
	useEffect(() => {
		if (!activeModal) return;
		const trigger = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setActiveModal(null);
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", closeOnEscape);
			trigger?.focus();
		};
	}, [activeModal]);

	/* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	/* ---------- LEGACY BRIDGE: inline doAction notice (page-level Pause/Resume) ---------- */
	const [notice, setNotice] = useState<string | null>(null);
	const noticeTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(noticeTimer.current), []);
	const notify = (msg: string) => {
		setNotice(msg);
		window.clearTimeout(noticeTimer.current);
		noticeTimer.current = window.setTimeout(() => setNotice(null), 3500);
	};

	const downloadExport = (name: string) =>
		downloadFile(
			name.replace(/\.(pdf|xlsx)$/, ".csv"),
			"date,bank,merchant,amount,status\n2025-06-27,Equity,KRA iTax,45000,Success\n2025-06-27,Co-op,Safaricom,12500,Success\n",
			"text/csv",
		);

	return (
		<div className={styles.analyticsPage}>
			{notice && (
				<output className={styles.pageNotice}>
					<i className="bi bi-check-circle" />
					{notice}
					<button
						type="button"
						className="btn-close"
						aria-label="Dismiss"
						onClick={() => setNotice(null)}
					/>
				</output>
			)}
			<main className={styles.main}>
				<div className={styles.content}>
					{/* ======================= EXECUTIVE HERO ======================= */}
					<section
						className={styles.heroBanner}
						aria-labelledby="analytics-page-title"
					>
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-graph-up" /> Transaction analytics
									</span>
									<span className={styles.heroLive}>
										<span className={styles.dotLive} /> {config.hero.live}
										{isFetching ? (
											<small className={styles.heroRefreshing}>
												Refreshing…
											</small>
										) : null}
									</span>
								</div>
								<h1 id="analytics-page-title">{config.pageTitle}</h1>
								<p>{config.pageSub}</p>
								<div className={styles.heroActions}>
									{config.hero.actions.map((a, i) => (
										<button
											type="button"
											key={a.label}
											className={
												i === 0
													? styles.heroPrimaryBtn
													: styles.heroSecondaryBtn
											}
											onClick={() => openM(a.modal)}
										>
											<i
												className={`bi ${
													i === 0
														? "bi-file-earmark-plus"
														: i === 1
															? "bi-calendar-event"
															: "bi-download"
												}`}
											/>{" "}
											{a.label}
										</button>
									))}
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="Analytics command center snapshot"
							>
								<div className={styles.heroSnapshotTop}>
									<span>Live snapshot</span>
									<div className={styles.heroSnapshotActions}>
										<button
											type="button"
											className={styles.heroIconBtn}
											onClick={() => openM("notifModal")}
											aria-label="Notifications"
											title="Notifications"
										>
											<i className="bi bi-bell" />
										</button>
										<button
											type="button"
											className={styles.heroAvatar}
											onClick={() => openM("profileModal")}
											aria-label="Profile"
											title="Profile"
										>
											AD
										</button>
									</div>
								</div>
								<strong>{config.hero.value}</strong>
								<p>{config.hero.detail}</p>
								<div className={styles.heroMetricRow}>
									{config.trendSummary.map((t) => (
										<div key={t.label}>
											<strong>{t.value}</strong>
											<span>{t.label}</span>
										</div>
									))}
								</div>
							</aside>
						</div>
					</section>

					{error ? (
						<output className={styles.statusNotice}>
							<i className="bi bi-cloud-slash" />
							<span>
								<strong>Live analytics data is temporarily unavailable</strong>
								<small>Using the latest local operating snapshot.</small>
							</span>
						</output>
					) : null}

					{/* ======================= 1.1 ANALYTICS PULSE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-pulse-heading"
					>
						<SectionHeading
							id="analytics-pulse-heading"
							index="1.1"
							title="Analytics pulse"
							description="A concise view of success rates, average values and failure pressure across the month."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("healthCheckModal")}
									>
										<i className="bi bi-heart-pulse" /> Health check
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("reportBuilderModal")}
									>
										<i className="bi bi-file-earmark-plus" /> New report
									</button>
								</div>
							}
						/>
						<div className={styles.kpiGrid}>
							{config.statCards.map((card) => {
								const meta = STAT_META[card.key] ?? {
									icon: "bi-bar-chart",
									bg: "var(--pm-surface-2)",
									color: "#475467",
								};
								return (
									<article
										key={card.key}
										className={`${styles.card} ${styles.kpiCard} ${meta.accent ? styles[meta.accent] : ""}`}
									>
										<div
											className={styles.kpiIcon}
											style={{ background: meta.bg, color: meta.color }}
										>
											<i className={`bi ${meta.icon}`} />
										</div>
										<div className={styles.kpiMeta}>
											<span>{card.label}</span>
											<small>Live</small>
										</div>
										<strong className={styles.kpiValue}>{card.value}</strong>
										<div className={styles.kpiFoot}>
											<span
												className={`${styles.badge} ${styles[card.badge.tone]}`}
											>
												<i className={`bi ${card.badge.icon}`} />{" "}
												{card.badge.text}
											</span>
											{card.progress ? (
												<span
													className={styles.pmProgress}
													style={{ width: 110 }}
												>
													<span
														className={styles.pmProgressBar}
														style={{
															display: "block",
															width: card.progress.width,
															background: card.progress.color,
														}}
													/>
												</span>
											) : null}
										</div>
										{card.note && (
											<div className={styles.kpiLines}>
												{card.note.map((n) => (
													<div key={n} className={styles.kpiLine}>
														<span>{n}</span>
													</div>
												))}
											</div>
										)}
									</article>
								);
							})}
						</div>
					</section>

					{/* ======================= 1.2 ACTION CENTRE ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-attention-heading"
					>
						<SectionHeading
							id="analytics-attention-heading"
							index="1.2"
							title="Action centre"
							description="Resolve exceptions first, then use guided suggestions to improve transfer outcomes."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => setDrawerOpen(true)}
								>
									<i className="bi bi-columns-gap" /> Review queue
								</button>
							}
						/>
						<article className={`${styles.card} ${styles.actionCentreCard}`}>
							<div className={styles.actionCentreIcon}>
								<i className="bi bi-exclamation-octagon" />
							</div>
							<div className={styles.actionCentreCopy}>
								<span className={styles.cardKicker}>Action centre</span>
								<h3>Attention, suggestions &amp; quick actions</h3>
								<p>
									Open operational items, AI routing recommendations and the
									actions treasury uses most — each opens the matching workflow.
								</p>
							</div>
							<div className={styles.actionCentreStats}>
								<div className={styles.actionCentreStat}>
									<strong>{config.attention.length}</strong>
									<span>Attention</span>
								</div>
								<div className={styles.actionCentreStat}>
									<strong>{config.suggestions.length}</strong>
									<span>Suggestions</span>
								</div>
								<div className={styles.actionCentreStat}>
									<strong>{config.quickActions.length}</strong>
									<span>Shortcuts</span>
								</div>
							</div>
							<div className={styles.actionCentreActions}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnPmP}`}
									onClick={() => setDrawerOpen(true)}
								>
									<i className="bi bi-columns-gap" /> Open drawer
								</button>
							</div>
						</article>
					</section>

					{/* ======================= 1.3 VOLUME & MERCHANT OVERVIEW ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-overview-heading"
					>
						<SectionHeading
							id="analytics-overview-heading"
							index="1.3"
							title="Volume & merchant overview"
							description="Real-time KPIs, volume trends, success rates and top merchants at a glance."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("healthCheckModal")}
									>
										<i className="bi bi-heart-pulse" /> Health
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openM("reportBuilderModal")}
									>
										<i className="bi bi-file-earmark-plus" /> Custom report
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className={styles.panelGridWide}>
								<Ub title="30-Day Transaction Volume Trend">
									<div className={styles.chartBars}>
										{config.trendBars.map((b) => (
											<button
												type="button"
												key={b.label}
												className={styles.chartBar}
												style={{ height: b.height, background: b.color }}
												onClick={() => openM("trendModal")}
												aria-label={`${b.label}: open trend drill-down`}
												title="Drill down"
											>
												<span className={styles.barLabel}>{b.label}</span>
											</button>
										))}
									</div>
									<div
										className="d-flex justify-content-between mt-4 flex-wrap"
										style={{ fontSize: 12, gap: 8 }}
									>
										{config.trendSummary.map((t) => (
											<div key={t.label}>
												<strong>{t.value}</strong> {t.label}
											</div>
										))}
									</div>
								</Ub>
								<Ub title="Top 5 Merchants">
									{config.topMerchants.map((m) => (
										<div className={styles.sr} key={m.name}>
											<div>
												<strong>{m.name}</strong>
												<div className={styles.mutedSmall}>{m.sub}</div>
											</div>
											<span className={`${styles.badge} ${styles[m.tone]}`}>
												{m.share}
											</span>
										</div>
									))}
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
										onClick={() => openM("merchantDrillModal")}
									>
										View all merchants
									</button>
								</Ub>
							</div>
						</div>
					</section>

					{/* ======================= 1.4 TRENDS & PATTERNS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-trends-heading"
					>
						<SectionHeading
							id="analytics-trends-heading"
							index="1.4"
							title="Trends & patterns"
							description="Time-series analysis, peak hours, weekend vs weekday and seasonal patterns."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openM("trendModal")}
								>
									<i className="bi bi-search" /> Drill-down
								</button>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-6">
									<Ub title="Hourly Volume Heatmap (Last 7 Days)">
										<div className={styles.heatmapGrid}>
											{config.heatmap.map((h) => (
												<div
													key={h.label}
													className={styles.heatCell}
													style={{ background: h.bg, color: h.color }}
												>
													{h.label}
													<strong>{h.value}</strong>
												</div>
											))}
										</div>
									</Ub>
								</div>
								<div className="col-lg-3">
									<Ub title="Weekday vs Weekend">
										{config.weekdays.map((w) => (
											<div className={styles.sr} key={w.label}>
												<div>
													<strong>{w.label}</strong>
												</div>
												<strong style={{ color: w.color }}>{w.value}</strong>
											</div>
										))}
										<div className={`${styles.summaryBox} mt-2`}>
											<div className={styles.mutedSmall}>
												{config.bestDay.label}
											</div>
											<div style={{ fontWeight: 700 }}>
												{config.bestDay.day}
											</div>
											<div style={{ fontSize: 12, color: "var(--pm-accent)" }}>
												{config.bestDay.note}
											</div>
										</div>
									</Ub>
								</div>
								<div className="col-lg-3">
									<Ub title="Seasonal Trends">
										{config.seasonal.map((s) => (
											<div className={styles.sr} key={s.label}>
												<div>
													<strong>{s.label}</strong>
												</div>
												<span className={`${styles.badge} ${styles[s.tone]}`}>
													{s.badge}
												</span>
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("trendModal")}
										>
											Full analysis
										</button>
									</Ub>
								</div>
							</div>
						</div>
					</section>

					{/* ======================= 1.5 FAILURE & DECLINE ANALYSIS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-failure-heading"
					>
						<SectionHeading
							id="analytics-failure-heading"
							index="1.5"
							title="Failure & decline analysis"
							description="Root cause breakdown, retry success rates and merchant-level failure patterns."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openM("failureDrillModal")}
								>
									<i className="bi bi-x-circle" /> Explore
								</button>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-5">
									<Ub title="Failure Reason Distribution">
										{config.failureReasons.map((f) => (
											<div className={styles.sr} key={f.label}>
												<div>
													<strong>{f.label}</strong>
												</div>
												<div>
													<span className={`${styles.badge} ${styles[f.tone]}`}>
														{f.badge}
													</span>{" "}
													<small className={styles.mutedSmall}>{f.count}</small>
												</div>
											</div>
										))}
									</Ub>
								</div>
								<div className="col-lg-4">
									<Ub title="Top Failing Merchants">
										{config.topFailing.map((m) => (
											<div className={styles.sr} key={m.name}>
												<div>
													<strong>{m.name}</strong>
												</div>
												<span className={`${styles.badge} ${styles[m.tone]}`}>
													{m.badge}
												</span>
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("merchantDrillModal")}
										>
											Merchant failure report
										</button>
									</Ub>
								</div>
								<div className="col-lg-3">
									<Ub title="Retry Performance">
										{config.retryPerf.map((r) => (
											<div
												className={`${styles.miniStat} mb-2`}
												style={{ background: r.bg, textAlign: "left" }}
												key={r.label}
											>
												<div
													style={{
														fontSize: 11,
														color: r.labelColor,
														fontWeight: 700,
													}}
												>
													{r.label}
												</div>
												<div
													style={{
														fontSize: 22,
														fontWeight: 700,
														color: r.color,
													}}
												>
													{r.value}
												</div>
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-1`}
											onClick={() => openM("autoRetryModal")}
										>
											Configure auto-retry
										</button>
									</Ub>
								</div>
							</div>
						</div>
					</section>

					{/* ======================= 1.6 MERCHANT & CATEGORY INSIGHTS ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-merchant-heading"
					>
						<SectionHeading
							id="analytics-merchant-heading"
							index="1.6"
							title="Merchant & category insights"
							description="Concentration risk, category performance and cross-sell opportunities."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("merchantDrillModal")}
									>
										<i className="bi bi-shop" /> Merchant drill
									</button>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openM("categoryModal")}
									>
										<i className="bi bi-tags" /> Category analysis
									</button>
								</div>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-7">
									<Ub title="Category Performance (Last 30 Days)">
										<div className={styles.tableScroll}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														<th>Category</th>
														<th>Volume</th>
														<th>Txns</th>
														<th>Success</th>
														<th>Avg Value</th>
													</tr>
												</thead>
												<tbody>
													{config.categories.map((c) => (
														<tr key={c.name}>
															<td>{c.name}</td>
															<td>{c.volume}</td>
															<td>{c.txns}</td>
															<td>
																<span
																	className={`${styles.badge} ${styles[c.successTone]}`}
																>
																	{c.success}
																</span>
															</td>
															<td>{c.avg}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</Ub>
								</div>
								<div className="col-lg-5">
									<Ub title="Merchant Concentration Risk">
										<div className={`${styles.summaryBoxDanger} mb-2`}>
											<div
												style={{
													fontSize: 11,
													color: "#b42318",
													fontWeight: 700,
												}}
											>
												{config.concentration.title}
											</div>
											<div
												style={{
													fontSize: 20,
													fontWeight: 700,
													color: "var(--pm-danger)",
												}}
											>
												{config.concentration.value}
											</div>
											<div style={{ fontSize: 12, color: "#b42318" }}>
												{config.concentration.sub}
											</div>
										</div>
										<div className={styles.sr}>
											<div>
												<strong>Diversification Score</strong>
											</div>
											<span className={`${styles.badge} ${styles.badgeW}`}>
												{config.concentration.score}
											</span>
										</div>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("merchantDrillModal")}
										>
											Risk mitigation plan
										</button>
									</Ub>
								</div>
							</div>
						</div>
					</section>

					{/* ======================= 1.7 REPORT BUILDER & SCHEDULES ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-reports-heading"
					>
						<SectionHeading
							id="analytics-reports-heading"
							index="1.7"
							title="Report builder & schedules"
							description="Drag-and-drop report creation with filters, groupings, scheduling and delivery."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnPmP}`}
									onClick={() => openM("reportBuilderModal")}
								>
									<i className="bi bi-file-earmark-plus" /> Launch builder
								</button>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-4">
									<Ub title="Quick Templates">
										{config.templates.map((t) => (
											<button
												type="button"
												key={t.title}
												className={`${styles.sr} w-100 text-start`}
												style={{
													cursor: "pointer",
													border: 0,
													background: "transparent",
													fontFamily: "inherit",
												}}
												onClick={() => openM("reportBuilderModal")}
											>
												<span>
													<strong>{t.title}</strong>
													<span className={`${styles.mutedSmall} d-block`}>
														{t.sub}
													</span>
												</span>
												<i
													className="bi bi-chevron-right"
													style={{ color: "var(--pm-muted)" }}
												/>
											</button>
										))}
									</Ub>
								</div>
								<div className="col-lg-8">
									<Ub title="Recent Custom Reports">
										<div className={styles.tableScroll}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														<th>Report Name</th>
														<th>Created</th>
														<th>Filters</th>
														<th>Status</th>
														<th>Action</th>
													</tr>
												</thead>
												<tbody>
													{config.recentReports.map((r) => (
														<tr key={r.name}>
															<td>{r.name}</td>
															<td>{r.created}</td>
															<td>{r.filters}</td>
															<td>
																<span
																	className={`${styles.badge} ${styles[r.tone]}`}
																>
																	{r.status}
																</span>
															</td>
															<td>
																<button
																	type="button"
																	className={`${styles.btnPm} ${styles.btnSm}`}
																	onClick={() => openM(r.modal)}
																>
																	{r.action}
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</Ub>
								</div>
							</div>
						</div>

						<article
							className={`${styles.card} ${styles.tableCard}`}
							style={{ marginTop: "1rem" }}
						>
							<div className={styles.tableToolbar}>
								<div className={styles.tableTitle}>
									<h3>Scheduled & automated reports</h3>
									<span>
										Recurring reports, delivery schedules and recipients.
									</span>
								</div>
								<div className={styles.tableTools}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("scheduledReportsModal")}
									>
										<i className="bi bi-calendar-event" /> Manage all
									</button>
								</div>
							</div>
							<div className={styles.tableScroll}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Report</th>
											<th>Frequency</th>
											<th>Next Run</th>
											<th>Recipients</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{config.scheduled.map((r) => (
											<tr key={r.name}>
												<td>{r.name}</td>
												<td>{r.freq}</td>
												<td>{r.next}</td>
												<td>{r.recipients}</td>
												<td>
													<span className={`${styles.badge} ${styles[r.tone]}`}>
														{r.status}
													</span>
												</td>
												<td>
													<div className="d-flex flex-wrap" style={{ gap: 6 }}>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openM("scheduledReportsModal")}
														>
															Edit
														</button>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm} ${r.paused ? styles.btnPmA : ""}`}
															onClick={() => notify(r.msg)}
														>
															{r.paused ? "Resume" : "Pause"}
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</article>
					</section>

					{/* ======================= 1.8 EXPORT & DELIVERY CENTER ======================= */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="analytics-export-heading"
					>
						<SectionHeading
							id="analytics-export-heading"
							index="1.8"
							title="Export & delivery center"
							description="One-time and bulk exports, format options, compression and delivery methods."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnPmP}`}
									onClick={() => openM("exportModal")}
								>
									<i className="bi bi-download" /> New export
								</button>
							}
						/>
						<div className={styles.card}>
							<div className="row g-3">
								<div className="col-lg-4">
									<Ub title="Recent Exports">
										{config.recentExports.map((e) => (
											<div className={styles.sr} key={e.name}>
												<div>
													<strong>{e.name}</strong>
													<div className={styles.mutedSmall}>{e.meta}</div>
												</div>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => downloadExport(e.name)}
													aria-label={`Download ${e.name}`}
												>
													<i className="bi bi-download" />
												</button>
											</div>
										))}
									</Ub>
								</div>
								<div className="col-lg-8">
									<Ub title="Export Options">
										<div className={styles.exportGrid}>
											{config.exportOptions.map((o) => (
												<button
													type="button"
													key={o.label}
													className={styles.exportTile}
													onClick={() => openM("exportModal")}
												>
													<i
														className={`bi ${o.icon}`}
														style={{ color: o.color }}
													/>
													<strong>{o.label}</strong>
												</button>
											))}
										</div>
									</Ub>
								</div>
							</div>
						</div>
					</section>
				</div>

				{/* ======================= FLOATING COMMAND BAR ======================= */}
				<nav
					className={styles.floatingBar}
					aria-label="Quick analytics actions"
				>
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openM("reportBuilderModal")}
					>
						<i className="bi bi-file-earmark-plus" /> New report
					</button>
					<button type="button" onClick={() => openM("exportModal")}>
						<i className="bi bi-download" /> Export
					</button>
					<button type="button" onClick={() => openM("failureDrillModal")}>
						<i className="bi bi-x-circle" /> Failures
					</button>
					<button type="button" onClick={() => openM("scheduledReportsModal")}>
						<i className="bi bi-calendar-event" /> Schedules
					</button>
					<button type="button" onClick={() => openM("healthCheckModal")}>
						<i className="bi bi-heart-pulse" /> Health
					</button>
				</nav>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-bar-chart-line" /> PayMo transaction analytics
						engine
					</span>
					<nav aria-label="Footer links">
						<a href="/pm/app/support">Support</a>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v1.8.0</span>
					</nav>
				</footer>
			</main>

			{/* ======================= ALL MODALS ======================= */}
			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Analytics"
				pageIcon="bi-bar-chart-line"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<AnalyticsModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
