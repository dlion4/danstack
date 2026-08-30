"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import DisputesModals from "../components/DisputesModals";
import styles from "../styles/disputes.module.css";

/* ============================================================================
   PayMo Dispute & Chargeback — end-to-end dispute lifecycle console
   Business-dashboard design language (navy/emerald, Sora + Inter, 16px cards).
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface SrItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	actionTone?: "btnPmD";
	modal: string;
}

interface QuickAction {
	icon: string;
	label: string;
	color: string;
	modal: string;
}

interface MiniBox {
	box:
		| "summaryBoxDanger"
		| "summaryBoxWarn"
		| "summaryBoxAccent"
		| "summaryBoxInfo"
		| "summaryBox";
	label: string;
	labelColor: string;
	value: string;
	valueColor: string;
	valueSize: number;
}

interface DisputesConfig {
	pageTitle: string;
	pageSub: string;
	hero: {
		live: string;
		value: string;
		detail: string;
		actions: { label: string; modal: string }[];
	};
	networks: { key: string; label: string; count: number }[];
	kpis: {
		label: string;
		value: string;
		icon: string;
		iconCls: string;
		sub: string;
		tone: BadgeTone;
	}[];
	funnel: { label: string; n: number; pct: string; c: string }[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	eligibleTxns: { merchant: string; sub: string }[];
	reasonQuickSelect: QuickAction[];
	filingStats: MiniBox[];
	evidenceReqs: {
		caseId: string;
		network: string;
		deadline: string;
		dangerDeadline?: boolean;
		needed: string;
		status: string;
		tone: BadgeTone;
		actionLabel: string;
		modal: string;
	}[];
	evidenceLibrary: { name: string; count: string }[];
	chargebacks: {
		cb: string;
		caseId: string;
		network: string;
		stage: string;
		tone: BadgeTone;
		amount: string;
		due: string;
		actionLabel: string;
		modal: string;
	}[];
	stageSummary: { label: string; value: string; tone: BadgeTone }[];
	winRates: { label: string; pct: string; tone: BadgeTone }[];
	topMerchants: { name: string; sub: string; badge: string; tone: BadgeTone }[];
	recovery: MiniBox[];
	activity: {
		date: string;
		caseId: string;
		type: string;
		merchant: string;
		amount: string;
		status: string;
		tone: BadgeTone;
		actionLabel: string;
		modal: string;
	}[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: DisputesConfig = {
	pageTitle: "Dispute & Chargeback",
	pageSub:
		"Initiate disputes, manage evidence, track chargeback workflows, resolve cases and analyse resolution performance across every payment rail.",
	hero: {
		live: "Dispute command center live",
		value: "142 open cases",
		detail:
			"38 disputes filed this month, 67 chargebacks in progress, 37 resolved in the last 7 days across Visa, Mastercard and PesaLink rails.",
		actions: [
			{ label: "File Dispute", modal: "disputeModal" },
			{ label: "Upload Evidence", modal: "evidenceUploadModal" },
			{ label: "Bulk Action", modal: "bulkDisputeModal" },
		],
	},
	networks: [
		{ key: "all", label: "All Networks", count: 142 },
		{ key: "visa", label: "Visa", count: 61 },
		{ key: "mc", label: "Mastercard", count: 38 },
		{ key: "pesalink", label: "PesaLink", count: 24 },
	],
	kpis: [
		{
			label: "Win rate (90d)",
			value: "68%",
			icon: "bi-trophy",
			iconCls: styles.kpiIconGreen,
			sub: "+4% vs last quarter",
			tone: "badgeS",
		},
		{
			label: "Open cases",
			value: "142",
			icon: "bi-shield-shaded",
			iconCls: styles.kpiIconSlate,
			sub: "38 filed this month",
			tone: "badgeI",
		},
		{
			label: "At risk / pending",
			value: "29",
			icon: "bi-clock",
			iconCls: styles.kpiIconAmber,
			sub: "11 expiring in 7 days",
			tone: "badgeW",
		},
		{
			label: "Monthly savings",
			value: "KES 4.2M",
			icon: "bi-piggy-bank",
			iconCls: styles.kpiIconGreen,
			sub: "Chargeback recovery",
			tone: "badgeS",
		},
		{
			label: "Recovered (30d)",
			value: "KES 18.4M",
			icon: "bi-cash-coin",
			iconCls: styles.kpiIconPurple,
			sub: "KES 129.6k avg per case",
			tone: "badgeS",
		},
		{
			label: "Avg resolution",
			value: "41 days",
			icon: "bi-hourglass-split",
			iconCls: styles.kpiIconBlue,
			sub: "5 cases won this week",
			tone: "badgeI",
		},
	],
	funnel: [
		{ label: "Filed", n: 38, pct: "27%", c: "var(--pm-info)" },
		{ label: "In progress", n: 67, pct: "47%", c: "var(--pm-warning)" },
		{ label: "Won", n: 37, pct: "26%", c: "var(--pm-accent)" },
	],
	attention: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "High-value dispute expiring",
			sub: "CDP-44892 · KES 1.85M · 4 days left",
			actionLabel: "Upload",
			actionTone: "btnPmD",
			modal: "evidenceUploadModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Merchant repeat offender",
			sub: "4 cases this month · Blacklist review",
			actionLabel: "Review",
			modal: "merchantRiskModal",
		},
		{
			icon: "bi-clock",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Chargeback response due today",
			sub: "CB-99102 · Visa · KES 87,400",
			actionLabel: "Respond",
			modal: "chargebackResponseModal",
		},
	],
	suggestions: [
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Increase evidence bundle for online disputes",
			sub: "+18% win rate improvement",
			actionLabel: "Apply",
			modal: "evidenceUploadModal",
		},
		{
			icon: "bi-building",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Blacklist 3 high-risk merchants",
			sub: "Prevent 12 future disputes",
			actionLabel: "Blacklist",
			modal: "merchantRiskModal",
		},
		{
			icon: "bi-clock-history",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Enable auto-escalation for >KES 500k",
			sub: "Reduce SLA breach risk",
			actionLabel: "Enable",
			modal: "disputeRulesModal",
		},
	],
	quickActions: [
		{
			icon: "bi-plus-circle",
			label: "File Dispute",
			color: "var(--pm-info)",
			modal: "disputeModal",
		},
		{
			icon: "bi-upload",
			label: "Upload Evidence",
			color: "var(--pm-accent)",
			modal: "evidenceUploadModal",
		},
		{
			icon: "bi-reply",
			label: "Respond to CB",
			color: "var(--pm-info)",
			modal: "chargebackResponseModal",
		},
		{
			icon: "bi-collection",
			label: "Bulk Action",
			color: "var(--pm-purple)",
			modal: "bulkDisputeModal",
		},
		{
			icon: "bi-building",
			label: "Merchant Risk",
			color: "var(--pm-warning)",
			modal: "merchantRiskModal",
		},
		{
			icon: "bi-bar-chart-line",
			label: "Analytics",
			color: "var(--pm-accent)",
			modal: "resolutionAnalyticsModal",
		},
		{
			icon: "bi-sliders",
			label: "Rules",
			color: "var(--pm-primary-light)",
			modal: "disputeRulesModal",
		},
		{
			icon: "bi-download",
			label: "Export Report",
			color: "var(--pm-muted)",
			modal: "exportReportModal",
		},
	],
	eligibleTxns: [
		{ merchant: "Amazon Kenya", sub: "Visa ****4521 · KES 87,400 · 12 Jun" },
		{ merchant: "Jumia Pay", sub: "MC ****3392 · KES 23,150 · 10 Jun" },
		{ merchant: "Booking.com", sub: "Visa ****4521 · KES 124,800 · 08 Jun" },
		{ merchant: "Uber Eats", sub: "Prepaid ****8890 · KES 4,200 · 05 Jun" },
	],
	reasonQuickSelect: [
		{
			icon: "bi-person-x",
			label: "Unauthorised",
			color: "var(--pm-danger)",
			modal: "quickDisputeModal",
		},
		{
			icon: "bi-box-arrow-left",
			label: "Not Received",
			color: "var(--pm-warning)",
			modal: "quickDisputeModal",
		},
		{
			icon: "bi-exclamation-octagon",
			label: "Not Described",
			color: "var(--pm-info)",
			modal: "quickDisputeModal",
		},
		{
			icon: "bi-copy",
			label: "Duplicate",
			color: "var(--pm-purple)",
			modal: "quickDisputeModal",
		},
		{
			icon: "bi-x-circle",
			label: "Cancelled",
			color: "var(--pm-danger)",
			modal: "quickDisputeModal",
		},
		{
			icon: "bi-arrow-counterclockwise",
			label: "Refund Issue",
			color: "var(--pm-accent)",
			modal: "quickDisputeModal",
		},
	],
	filingStats: [
		{
			box: "summaryBoxDanger",
			label: "FILED",
			labelColor: "var(--pm-danger)",
			value: "38",
			valueColor: "var(--pm-danger)",
			valueSize: 24,
		},
		{
			box: "summaryBoxWarn",
			label: "AVG VALUE",
			labelColor: "var(--pm-warning)",
			value: "KES 124,800",
			valueColor: "var(--pm-warning)",
			valueSize: 20,
		},
		{
			box: "summaryBoxAccent",
			label: "TOP REASON",
			labelColor: "var(--pm-accent)",
			value: "Unauthorised (42%)",
			valueColor: "var(--pm-accent)",
			valueSize: 18,
		},
	],
	evidenceReqs: [
		{
			caseId: "CDP-44892",
			network: "Visa",
			deadline: "29 Jun",
			dangerDeadline: true,
			needed: "Receipt, Police report, ID",
			status: "4/6 uploaded",
			tone: "badgeW",
			actionLabel: "Upload",
			modal: "evidenceUploadModal",
		},
		{
			caseId: "CB-99102",
			network: "Mastercard",
			deadline: "27 Jun",
			dangerDeadline: true,
			needed: "Invoice, Delivery proof",
			status: "2/5 uploaded",
			tone: "badgeD",
			actionLabel: "Upload",
			modal: "evidenceUploadModal",
		},
		{
			caseId: "CDP-44915",
			network: "PesaLink",
			deadline: "02 Jul",
			needed: "Contract, Bank statement",
			status: "Complete",
			tone: "badgeS",
			actionLabel: "Review",
			modal: "evidencePackageModal",
		},
	],
	evidenceLibrary: [
		{ name: "Receipts", count: "124 files" },
		{ name: "Police Reports", count: "38 files" },
		{ name: "Delivery Proof", count: "67 files" },
		{ name: "Contracts", count: "19 files" },
	],
	chargebacks: [
		{
			cb: "CB-99102",
			caseId: "CDP-44892",
			network: "Visa",
			stage: "Representment",
			tone: "badgeW",
			amount: "KES 87,400",
			due: "27 Jun",
			actionLabel: "Respond",
			modal: "chargebackResponseModal",
		},
		{
			cb: "CB-99087",
			caseId: "CDP-44710",
			network: "MC",
			stage: "Pre-Arbitration",
			tone: "badgeI",
			amount: "KES 312,000",
			due: "02 Jul",
			actionLabel: "Track",
			modal: "chargebackTrackerModal",
		},
		{
			cb: "CB-99065",
			caseId: "CDP-44655",
			network: "Visa",
			stage: "Arbitration",
			tone: "badgeP",
			amount: "KES 1,240,000",
			due: "15 Jul",
			actionLabel: "View",
			modal: "arbitrationModal",
		},
	],
	stageSummary: [
		{ label: "First Chargeback", value: "48 cases", tone: "badgeS" },
		{ label: "Representment", value: "29 cases", tone: "badgeW" },
		{ label: "Pre-Arbitration", value: "12 cases", tone: "badgeI" },
		{ label: "Arbitration", value: "7 cases", tone: "badgeD" },
		{ label: "Resolved (30d)", value: "67 cases", tone: "badgeS" },
	],
	winRates: [
		{ label: "Unauthorised", pct: "82%", tone: "badgeS" },
		{ label: "Not Received", pct: "71%", tone: "badgeS" },
		{ label: "Not Described", pct: "54%", tone: "badgeW" },
		{ label: "Duplicate", pct: "89%", tone: "badgeS" },
		{ label: "Cancelled", pct: "63%", tone: "badgeI" },
	],
	topMerchants: [
		{
			name: "Amazon Kenya",
			sub: "18 cases · 61% win",
			badge: "Review",
			tone: "badgeW",
		},
		{
			name: "Jumia Pay",
			sub: "12 cases · 75% win",
			badge: "OK",
			tone: "badgeS",
		},
		{
			name: "Booking.com",
			sub: "9 cases · 44% win",
			badge: "High Risk",
			tone: "badgeD",
		},
		{
			name: "Uber Eats",
			sub: "7 cases · 86% win",
			badge: "OK",
			tone: "badgeS",
		},
		{
			name: "Local Vendor X",
			sub: "6 cases · 17% win",
			badge: "Blacklist",
			tone: "badgeD",
		},
	],
	recovery: [
		{
			box: "summaryBoxAccent",
			label: "TOTAL RECOVERED",
			labelColor: "var(--pm-accent)",
			value: "KES 18.4M",
			valueColor: "var(--pm-accent)",
			valueSize: 22,
		},
		{
			box: "summaryBoxInfo",
			label: "AVG PER CASE",
			labelColor: "var(--pm-info)",
			value: "KES 129,600",
			valueColor: "var(--pm-info)",
			valueSize: 18,
		},
		{
			box: "summaryBox",
			label: "MERCHANT CLAWBACKS",
			labelColor: "var(--pm-purple)",
			value: "KES 4.7M",
			valueColor: "var(--pm-purple)",
			valueSize: 18,
		},
	],
	activity: [
		{
			date: "27 Jun",
			caseId: "CDP-44923",
			type: "Dispute",
			merchant: "Amazon Kenya",
			amount: "KES 87,400",
			status: "Under Review",
			tone: "badgeI",
			actionLabel: "View",
			modal: "disputeDetailModal",
		},
		{
			date: "26 Jun",
			caseId: "CB-99102",
			type: "Chargeback",
			merchant: "Jumia Pay",
			amount: "KES 23,150",
			status: "Representment",
			tone: "badgeW",
			actionLabel: "Respond",
			modal: "chargebackResponseModal",
		},
		{
			date: "25 Jun",
			caseId: "CDP-44915",
			type: "Dispute",
			merchant: "Booking.com",
			amount: "KES 124,800",
			status: "Resolved - Won",
			tone: "badgeS",
			actionLabel: "View",
			modal: "disputeDetailModal",
		},
		{
			date: "24 Jun",
			caseId: "CDP-44892",
			type: "Dispute",
			merchant: "Local Vendor X",
			amount: "KES 1,850,000",
			status: "Evidence Pending",
			tone: "badgeW",
			actionLabel: "Upload",
			modal: "evidenceUploadModal",
		},
	],
};

/* ---------- data fetch (falls back to mock on error) ---------- */
async function fetchDisputes(): Promise<DisputesConfig> {
	const res = await fetch("/api/disputes", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
	return (await res.json()) as DisputesConfig;
}

function MiniStatBox({ b }: { b: MiniBox }) {
	return (
		<div className={`${styles[b.box]} mb-2`}>
			<div style={{ fontSize: 11, fontWeight: 700, color: b.labelColor }}>
				{b.label}
			</div>
			<div
				style={{ fontSize: b.valueSize, fontWeight: 700, color: b.valueColor }}
			>
				{b.value}
			</div>
		</div>
	);
}

/* ---------- numbered section heading (business-dashboard language) ---------- */
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
	action?: ReactNode;
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

export default function Disputes() {
	const { data } = useQuery({
		queryKey: ["paymo-disputes"],
		queryFn: fetchDisputes,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [network, setNetwork] = useState("all");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const modalId = params.get("modal");
		if (modalId) setActiveModal(modalId);
	}, []);

	const netLabel =
		config.networks.find((n) => n.key === network)?.label ?? "All Networks";
	const filteredReqs = config.evidenceReqs.filter(
		(r) => network === "all" || r.network.toLowerCase() === network,
	);
	const filteredCbs = config.chargebacks.filter(
		(c) =>
			network === "all" ||
			c.network.toLowerCase() === network ||
			(network === "mc" && c.network === "MC"),
	);

	const kpiToneClass = (tone: BadgeTone) =>
		tone === "badgeS"
			? styles.badgeS
			: tone === "badgeW"
				? styles.badgeW
				: tone === "badgeD"
					? styles.badgeD
					: tone === "badgeI"
						? styles.badgeI
						: styles.badgeP;

	return (
		<div className={styles.disputesPage}>
			<div className={styles.main}>
				<header className={styles.heroBanner}>
					<div className={styles.heroOrbOne} aria-hidden="true" />
					<div className={styles.heroOrbTwo} aria-hidden="true" />
					<div className={styles.heroContent}>
						<div className={styles.heroCopy}>
							<div className={styles.heroEyebrow}>
								<span>
									<i className="bi bi-shield-shaded" aria-hidden="true" />{" "}
									Dispute &amp; Chargeback
								</span>
								<span className={styles.livePill}>
									<span className={styles.liveDot} aria-hidden="true" />{" "}
									{config.hero.live}
								</span>
							</div>
							<h1 id="disputes-title">
								Every dispute filed, every chargeback answered, every case
								tracked to resolution.
							</h1>
							<p>{config.pageSub}</p>
							<div className={styles.heroActions}>
								<button
									type="button"
									className={styles.heroPrimaryBtn}
									onClick={() => openM("disputeModal")}
								>
									<i className="bi bi-plus-circle" aria-hidden="true" /> File
									Dispute
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("evidenceUploadModal")}
								>
									<i className="bi bi-upload" aria-hidden="true" /> Upload
									Evidence
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("bulkDisputeModal")}
								>
									<i className="bi bi-collection" aria-hidden="true" /> Bulk
									Action
								</button>
							</div>
						</div>
						<aside
							className={styles.heroSnapshot}
							aria-label="Dispute triage snapshot"
						>
							<span>Open cases now</span>
							<strong>{config.hero.value}</strong>
							<p>{config.hero.detail}</p>
							<div className={styles.funnel} aria-hidden="true">
								{config.funnel.map((f) => (
									<div
										key={f.label}
										className={styles.funnelSeg}
										style={{ width: f.pct, background: f.c }}
									/>
								))}
							</div>
							<div className={styles.funnelLegend}>
								{config.funnel.map((f) => (
									<span key={f.label}>
										<i style={{ background: f.c }} aria-hidden="true" />{" "}
										{f.label} · {f.n}
									</span>
								))}
							</div>
							<div className={styles.heroMetricRow}>
								<div>
									<strong>38</strong>
									<span>Filed this month</span>
								</div>
								<div>
									<strong>67</strong>
									<span>In progress</span>
								</div>
								<div>
									<strong>37</strong>
									<span>Resolved · 7d</span>
								</div>
							</div>
						</aside>
					</div>
				</header>

				<div className={styles.controlStrip}>
					<div className={styles.controlGroup}>
						<span className={styles.controlLabel}>
							<i className="bi bi-diagram-3" aria-hidden="true" /> Network
						</span>
						<div className={styles.filterPills}>
							{config.networks.map((n) => (
								<button
									type="button"
									key={n.key}
									className={network === n.key ? styles.filterActive : ""}
									onClick={() => setNetwork(n.key)}
								>
									{n.label} <span className={styles.countChip}>{n.count}</span>
								</button>
							))}
						</div>
					</div>
					<div className={styles.headerButtonRow}>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => openM("healthCheckModal")}
						>
							<i className="bi bi-heart-pulse" aria-hidden="true" /> Health
							Check
						</button>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
							onClick={() => openM("disputeModal")}
						>
							<i className="bi bi-plus" aria-hidden="true" /> New Dispute
						</button>
					</div>
					<span className={styles.scopeNote}>
						<i className="bi bi-funnel" aria-hidden="true" /> {netLabel} in view
					</span>
				</div>

				<div className={styles.content}>
					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-pulse"
					>
						<SectionHeading
							index="1.1"
							id="dis-sec-pulse"
							title="Dispute pulse"
							description={`${netLabel} — headline figures for the current dispute cycle.`}
						/>
						<div className={styles.kpiGrid}>
							{config.kpis.map((kpi) => (
								<div className={styles.kpiCard} key={kpi.label}>
									<div
										className={`${styles.kpiIcon} ${kpi.iconCls}`}
										aria-hidden="true"
									>
										<i className={`bi ${kpi.icon}`} />
									</div>
									<div
										style={{
											fontSize: "0.72rem",
											fontWeight: 600,
											color: "var(--pm-muted)",
											textTransform: "uppercase",
											letterSpacing: "0.06em",
										}}
									>
										{kpi.label}
									</div>
									<div className={styles.kpiValue}>{kpi.value}</div>
									<div className={styles.kpiMeta}>
										<span
											className={`${styles.badge} ${kpiToneClass(kpi.tone)}`}
										>
											{kpi.sub}
										</span>
									</div>
								</div>
							))}
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-queue"
					>
						<SectionHeading
							index="1.2"
							id="dis-sec-queue"
							title="Needs your attention"
							description="Resolve expiring cases and act on smart recommendations without leaving the dashboard."
						/>
						<div className={styles.attentionGrid}>
							<div className={styles.listCard}>
								<div className={styles.listCardHeader}>
									<h3 className={styles.listCardTitle}>
										<i
											className="bi bi-exclamation-circle"
											aria-hidden="true"
										/>{" "}
										Attention Required
									</h3>
									<div className={styles.headerButtonRow}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("caseNotifModal")}
											aria-label="Dispute notifications"
										>
											<i className="bi bi-bell" aria-hidden="true" />
										</button>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("attentionModal")}
										>
											View all
										</button>
									</div>
								</div>
								{config.attention.map((item) => (
									<div className={styles.actionRow} key={item.title}>
										<div
											className={styles.iconCircle}
											style={{
												background: item.iconBg,
												color: item.iconColor,
											}}
											aria-hidden="true"
										>
											<i className={`bi ${item.icon}`} />
										</div>
										<div className={styles.actionRowMain}>
											<div className={styles.actionRowTitle}>{item.title}</div>
											<div className={styles.actionRowSub}>{item.sub}</div>
										</div>
										<div className={styles.actionRowActions}>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ""}`}
												onClick={() => openM(item.modal)}
											>
												{item.actionLabel}
											</button>
										</div>
									</div>
								))}
							</div>
							<div className={styles.listCard}>
								<div className={styles.listCardHeader}>
									<h3 className={styles.listCardTitle}>
										<i className="bi bi-lightbulb" aria-hidden="true" /> Smart
										Suggestions
									</h3>
									<span className={`${styles.badge} ${styles.badgeP}`}>
										<i className="bi bi-stars" aria-hidden="true" /> AI
									</span>
								</div>
								{config.suggestions.map((item) => (
									<div className={styles.actionRow} key={item.title}>
										<div
											className={styles.iconCircle}
											style={{
												background: item.iconBg,
												color: item.iconColor,
											}}
											aria-hidden="true"
										>
											<i className={`bi ${item.icon}`} />
										</div>
										<div className={styles.actionRowMain}>
											<div className={styles.actionRowTitle}>{item.title}</div>
											<div className={styles.actionRowSub}>{item.sub}</div>
										</div>
										<div className={styles.actionRowActions}>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM(item.modal)}
											>
												{item.actionLabel}
											</button>
										</div>
									</div>
								))}
							</div>
							<div className={styles.listCard}>
								<h3 className={styles.listCardTitle}>
									<i className="bi bi-lightning-charge" aria-hidden="true" />{" "}
									Quick Actions
								</h3>
								<p className={styles.listCardSub}>Frequent dispute workflows</p>
								<div className={styles.quickGrid}>
									{config.quickActions.map((qa) => (
										<button
											type="button"
											className={styles.quickActionCard}
											key={qa.label}
											onClick={() => openM(qa.modal)}
										>
											<i
												className={`bi ${qa.icon}`}
												style={{ color: qa.color }}
											/>
											<span>{qa.label}</span>
										</button>
									))}
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-filing"
					>
						<SectionHeading
							index="1.3"
							id="dis-sec-filing"
							title="Dispute initiation & filing"
							description="Create new disputes, select transactions, choose reason codes, attach initial evidence and route to the correct workflow."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("disputeModal")}
									>
										<i className="bi bi-plus" aria-hidden="true" /> New Dispute
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("bulkDisputeModal")}
									>
										<i className="bi bi-collection" aria-hidden="true" /> Bulk
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-5">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-receipt" aria-hidden="true" /> Recent
											Transactions Eligible for Dispute
										</h4>
										{config.eligibleTxns.map((t) => (
											<div className={styles.sr} key={t.merchant}>
												<div>
													<strong>{t.merchant}</strong>
													<div className={styles.mutedSmall}>{t.sub}</div>
												</div>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("disputeModal")}
												>
													Dispute
												</button>
											</div>
										))}
									</div>
								</div>
								<div className="col-lg-4">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-tags" aria-hidden="true" /> Dispute
											Reason Quick Select
										</h4>
										<div className={styles.quickGrid}>
											{config.reasonQuickSelect.map((r) => (
												<button
													type="button"
													className={styles.quickActionCard}
													key={r.label}
													onClick={() => openM(r.modal)}
												>
													<i
														className={`bi ${r.icon}`}
														style={{ color: r.color }}
													/>
													<span>{r.label}</span>
												</button>
											))}
										</div>
									</div>
								</div>
								<div className="col-lg-3">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-clipboard-data" aria-hidden="true" />{" "}
											Filing Stats (30d)
										</h4>
										{config.filingStats.map((b) => (
											<MiniStatBox key={b.label} b={b} />
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-evidence"
					>
						<SectionHeading
							index="1.4"
							id="dis-sec-evidence"
							title="Evidence management & submission"
							description="Upload, organise and submit evidence packages to networks with deadline tracking and compliance checks."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("evidenceUploadModal")}
									>
										<i className="bi bi-upload" aria-hidden="true" /> Upload
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("evidencePackageModal")}
									>
										<i className="bi bi-archive" aria-hidden="true" /> Packages
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-8">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i
												className="bi bi-file-earmark-check"
												aria-hidden="true"
											/>{" "}
											Active Evidence Requirements
										</h4>
										<div className={styles.tableWrap}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														<th>Case</th>
														<th>Network</th>
														<th>Deadline</th>
														<th>Evidence Needed</th>
														<th>Status</th>
														<th>Action</th>
													</tr>
												</thead>
												<tbody>
													{filteredReqs.map((r) => (
														<tr key={r.caseId}>
															<td>
																<code>{r.caseId}</code>
															</td>
															<td>{r.network}</td>
															<td
																className={
																	r.dangerDeadline
																		? styles.textDanger
																		: undefined
																}
															>
																{r.deadline}
															</td>
															<td>{r.needed}</td>
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
																	{r.actionLabel}
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div className="col-lg-4">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-folder2-open" aria-hidden="true" />{" "}
											Evidence Library
										</h4>
										{config.evidenceLibrary.map((l) => (
											<div className={styles.sr} key={l.name}>
												<div>
													<strong>{l.name}</strong>
													<div className={styles.mutedSmall}>{l.count}</div>
												</div>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("evidencePackageModal")}
												>
													Browse
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-chargebacks"
					>
						<SectionHeading
							index="1.5"
							id="dis-sec-chargebacks"
							title="Chargeback workflow & tracking"
							description="Track the chargeback lifecycle, respond to representments and manage pre-arbitration and arbitration stages."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("chargebackResponseModal")}
									>
										<i className="bi bi-reply" aria-hidden="true" /> Respond
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("chargebackTrackerModal")}
									>
										<i className="bi bi-graph-up" aria-hidden="true" /> Tracker
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-7">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-arrow-repeat" aria-hidden="true" />{" "}
											Active Chargebacks
										</h4>
										<div className={styles.tableWrap}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														<th>CB ID</th>
														<th>Case</th>
														<th>Network</th>
														<th>Stage</th>
														<th>Amount</th>
														<th>Due</th>
														<th>Action</th>
													</tr>
												</thead>
												<tbody>
													{filteredCbs.map((c) => (
														<tr key={c.cb}>
															<td>
																<code>{c.cb}</code>
															</td>
															<td>{c.caseId}</td>
															<td>{c.network}</td>
															<td>
																<span
																	className={`${styles.badge} ${styles[c.tone]}`}
																>
																	{c.stage}
																</span>
															</td>
															<td>{c.amount}</td>
															<td>{c.due}</td>
															<td>
																<button
																	type="button"
																	className={`${styles.btnPm} ${styles.btnSm}`}
																	onClick={() => openM(c.modal)}
																>
																	{c.actionLabel}
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div className="col-lg-5">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-diagram-3" aria-hidden="true" /> Stage
											Summary
										</h4>
										{config.stageSummary.map((s) => (
											<div className={styles.sr} key={s.label}>
												<div>
													<strong>{s.label}</strong>
												</div>
												<span className={`${styles.badge} ${styles[s.tone]}`}>
													{s.value}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-analytics"
					>
						<SectionHeading
							index="1.6"
							id="dis-sec-analytics"
							title="Resolution analytics & insights"
							description="Analyse win/loss rates, merchant performance, reason code effectiveness and financial recovery metrics."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("resolutionAnalyticsModal")}
									>
										<i className="bi bi-graph-up-arrow" aria-hidden="true" />{" "}
										Deep Analytics
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("exportReportModal")}
									>
										<i className="bi bi-download" aria-hidden="true" /> Export
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-5">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-trophy" aria-hidden="true" /> Win Rate
											by Reason Code
										</h4>
										{config.winRates.map((w) => (
											<div className={styles.sr} key={w.label}>
												<div>
													<strong>{w.label}</strong>
												</div>
												<span className={`${styles.badge} ${styles[w.tone]}`}>
													{w.pct}
												</span>
											</div>
										))}
									</div>
								</div>
								<div className="col-lg-4">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-building" aria-hidden="true" /> Top 5
											Merchants by Disputes
										</h4>
										{config.topMerchants.map((m) => (
											<div className={styles.sr} key={m.name}>
												<div>
													<strong>{m.name}</strong>
													<div className={styles.mutedSmall}>{m.sub}</div>
												</div>
												<span className={`${styles.badge} ${styles[m.tone]}`}>
													{m.badge}
												</span>
											</div>
										))}
									</div>
								</div>
								<div className="col-lg-3">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-cash-coin" aria-hidden="true" />{" "}
											Recovery Summary (30d)
										</h4>
										{config.recovery.map((b) => (
											<MiniStatBox key={b.label} b={b} />
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="dis-sec-activity"
					>
						<SectionHeading
							index="1.7"
							id="dis-sec-activity"
							title="Recent dispute activity"
							description="Every filing, response and resolution across your dispute queue, most recent first."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("activityLogModal")}
								>
									<i className="bi bi-clock-history" aria-hidden="true" /> Full
									Log
								</button>
							}
						/>
						<div className={styles.tableCard}>
							<div className={styles.tableWrap}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Date</th>
											<th>Case</th>
											<th>Type</th>
											<th>Merchant</th>
											<th>Amount</th>
											<th>Status</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{config.activity.map((a) => (
											<tr key={a.caseId}>
												<td>{a.date}</td>
												<td>
													<code>{a.caseId}</code>
												</td>
												<td>{a.type}</td>
												<td>{a.merchant}</td>
												<td>{a.amount}</td>
												<td>
													<span className={`${styles.badge} ${styles[a.tone]}`}>
														{a.status}
													</span>
												</td>
												<td>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM(a.modal)}
													>
														{a.actionLabel}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				</div>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-shaded" aria-hidden="true" /> Dispute
						&amp; Chargeback · {config.hero.value} · Data refreshes every run
					</span>
					<nav aria-label="Footer links">
						<Link to="/pm/app/liquidity">Liquidity &amp; Float</Link>
						<Link to="/pm/app/reconciliation">Reconciliation</Link>
						<Link to="/pm/app/payment-rails">Payment Rails</Link>
					</nav>
				</footer>
			</div>

			<nav className={styles.floatingBar} aria-label="Quick dispute actions">
				<button type="button" onClick={() => openM("attentionModal")}>
					<i className="bi bi-exclamation-circle" aria-hidden="true" />{" "}
					Attention
				</button>
				<button type="button" onClick={() => openM("activityLogModal")}>
					<i className="bi bi-clock-history" aria-hidden="true" /> Activity
				</button>
				<button type="button" onClick={() => openM("healthCheckModal")}>
					<i className="bi bi-heart-pulse" aria-hidden="true" /> Health
				</button>
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => openM("disputeModal")}
				>
					<i className="bi bi-plus-circle" aria-hidden="true" /> New Dispute
				</button>
			</nav>

			<DisputesModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
