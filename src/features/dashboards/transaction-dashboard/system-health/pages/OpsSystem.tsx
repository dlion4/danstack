/* ============================================================================
 * OpsSystem.tsx — System Health & Operations (Page 1.17)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.17.html — the B2B operations command center.
 *   This page owns platform uptime monitoring, transaction health, API
 *   performance, settlement reconciliation, fraud detection, infrastructure
 *   scaling, and support ticket queues — all in real time.
 *
 * Refined surface: rebuilt on the PayMo business-dashboard composition —
 * executive hero with live status snapshot, numbered sections (system status,
 * attention centre, transaction health, API & integrations, settlement,
 * fraud operations, infrastructure, operations queue & audit), floating
 * command bar and footer. Shell chrome is owned by AppShell; this page
 * renders content only. All 30 modals remain reachable from the page
 * (8 orphaned shells re-wired through hero snapshot, attention, quick
 * actions and section actions).
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query
 * ARCHITECTURE .: Child of routes/app.tsx, renders INSIDE the app shell.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import OpsSystemModals, {
	initialModalsState,
	type ModalKey,
} from "../components/OpsSystemModals";
import styles from "../styles/systemHealth.module.css";

/* ============================================================
   MOCK DATA — extracted from the legacy HTML template
   ============================================================ */
interface ServiceHealth {
	name: string;
	status: "Healthy" | "Degraded";
	uptime: string;
	latency: string;
	errorRate: string;
	lastIncident: string;
}

interface Corridor {
	name: string;
	count: string;
	success: string;
	avgTime: string;
}

interface FraudRule {
	name: string;
	triggered: number;
	blocked: number;
	fpRate: string;
}

interface InfraComponent {
	name: string;
	cpu: string;
	memory: string;
	disk: string;
	status: string;
}

interface Ticket {
	id: string;
	type: string;
	priority: string;
	assignee: string;
	sla: string;
	status: string;
}

interface SettlementBatch {
	id: string;
	corridor: string;
	amount: string;
	status: string;
	progress: number;
	eta: string;
}

interface OpsData {
	platformUptime: string;
	platformStatus: string;
	incidents30d: number;
	criticalOutages: number;
	txnSuccess: string;
	txnCount: string;
	txnFailed: string;
	txnFailedPct: string;
	apiP95: string;
	apiLoad: string;
	apiPeak: string;
	openIncidents: number;
	highPriority: number;
	settlementDelay: number;
	fraudSpike: number;
	apiDegradation: number;
	services: ServiceHealth[];
	regions: { name: string; status: string }[];
	corridors: Corridor[];
	failureReasons: { reason: string; count: number; pct: number }[];
	partnerApis: {
		name: string;
		status: string;
		latency: string;
		success: string;
	}[];
	webhookDelivered: number;
	webhookFailed: number;
	webhookRetry: number;
	fraudAlerts: number;
	blockedTxns: number;
	fraudRules: FraudRule[];
	manualReviewHigh: number;
	manualReviewMedium: number;
	manualReviewLow: number;
	infra: InfraComponent[];
	scalingEvents: { component: string; count: string }[];
	tickets: Ticket[];
	reconciliationMatched: number;
	reconciliationUnmatched: number;
	reconciliationDisputed: number;
	settlementBatches: SettlementBatch[];
}

const initialMockData: OpsData = {
	platformUptime: "99.97%",
	platformStatus: "All systems operational",
	incidents30d: 4,
	criticalOutages: 0,
	txnSuccess: "99.4%",
	txnCount: "1.24M",
	txnFailed: "7,412",
	txnFailedPct: "0.6%",
	apiP95: "187ms",
	apiLoad: "42,800 req/min",
	apiPeak: "68,200 req/min",
	openIncidents: 7,
	highPriority: 2,
	settlementDelay: 2,
	fraudSpike: 1,
	apiDegradation: 4,
	services: [
		{
			name: "Transaction Engine",
			status: "Healthy",
			uptime: "99.98%",
			latency: "142ms",
			errorRate: "0.12%",
			lastIncident: "12 Jun 2025",
		},
		{
			name: "Settlement Engine",
			status: "Degraded",
			uptime: "99.71%",
			latency: "890ms",
			errorRate: "1.84%",
			lastIncident: "27 Jun 2025",
		},
		{
			name: "API Gateway",
			status: "Healthy",
			uptime: "99.99%",
			latency: "187ms",
			errorRate: "0.08%",
			lastIncident: "19 Jun 2025",
		},
		{
			name: "Fraud Detection",
			status: "Degraded",
			uptime: "99.82%",
			latency: "310ms",
			errorRate: "4.2% FP",
			lastIncident: "27 Jun 2025",
		},
		{
			name: "Reconciliation Service",
			status: "Healthy",
			uptime: "99.95%",
			latency: "420ms",
			errorRate: "0.31%",
			lastIncident: "25 Jun 2025",
		},
		{
			name: "Notification Service",
			status: "Healthy",
			uptime: "99.97%",
			latency: "89ms",
			errorRate: "0.05%",
			lastIncident: "20 Jun 2025",
		},
	],
	regions: [
		{ name: "Kenya (Primary)", status: "All Green" },
		{ name: "Uganda", status: "All Green" },
		{ name: "Tanzania", status: "API Degraded" },
		{ name: "Rwanda", status: "All Green" },
		{ name: "Nigeria", status: "Settlement Delayed" },
		{ name: "Ghana", status: "All Green" },
	],
	corridors: [
		{
			name: "Kenya → Uganda",
			count: "8,421",
			success: "99.7%",
			avgTime: "1.8s",
		},
		{
			name: "Kenya → Tanzania",
			count: "6,112",
			success: "99.2%",
			avgTime: "2.4s",
		},
		{
			name: "Uganda → Kenya",
			count: "5,890",
			success: "99.5%",
			avgTime: "1.6s",
		},
		{
			name: "Nigeria → Ghana",
			count: "3,421",
			success: "98.1%",
			avgTime: "4.2s",
		},
	],
	failureReasons: [
		{ reason: "Insufficient Funds", count: 2841, pct: 42 },
		{ reason: "Invalid Account", count: 1102, pct: 18 },
		{ reason: "Network Timeout", count: 892, pct: 14 },
		{ reason: "Fraud Block", count: 421, pct: 9 },
		{ reason: "Daily Limit Exceeded", count: 312, pct: 7 },
		{ reason: "Other", count: 844, pct: 10 },
	],
	partnerApis: [
		{
			name: "Equity Bank",
			status: "Healthy",
			latency: "98ms",
			success: "99.9%",
		},
		{ name: "KCB Bank", status: "Healthy", latency: "112ms", success: "99.8%" },
		{
			name: "Stanbic Bank",
			status: "Degraded",
			latency: "420ms",
			success: "97.1%",
		},
		{
			name: "Co-op Bank",
			status: "Healthy",
			latency: "76ms",
			success: "99.9%",
		},
	],
	webhookDelivered: 184291,
	webhookFailed: 312,
	webhookRetry: 1842,
	fraudAlerts: 1842,
	blockedTxns: 421,
	fraudRules: [
		{ name: "Velocity Check", triggered: 892, blocked: 312, fpRate: "2.1%" },
		{ name: "Geo Anomaly", triggered: 421, blocked: 89, fpRate: "4.8%" },
		{ name: "Device Mismatch", triggered: 312, blocked: 18, fpRate: "1.2%" },
	],
	manualReviewHigh: 87,
	manualReviewMedium: 214,
	manualReviewLow: 312,
	infra: [
		{
			name: "Transaction DB Primary",
			cpu: "42%",
			memory: "68%",
			disk: "54%",
			status: "Healthy",
		},
		{
			name: "API Gateway Cluster",
			cpu: "71%",
			memory: "82%",
			disk: "39%",
			status: "Warning",
		},
		{
			name: "Redis Cache",
			cpu: "18%",
			memory: "44%",
			disk: "12%",
			status: "Healthy",
		},
		{
			name: "Kafka Brokers",
			cpu: "55%",
			memory: "61%",
			disk: "47%",
			status: "Healthy",
		},
	],
	scalingEvents: [
		{ component: "API Gateway", count: "+12 nodes" },
		{ component: "Worker Nodes", count: "+8 nodes" },
		{ component: "DB Read Replicas", count: "+3 replicas" },
	],
	tickets: [
		{
			id: "OP-44291",
			type: "Partner Integration",
			priority: "High",
			assignee: "James K.",
			sla: "2h remaining",
			status: "In Progress",
		},
		{
			id: "OP-44288",
			type: "Settlement Dispute",
			priority: "Medium",
			assignee: "Grace M.",
			sla: "18h remaining",
			status: "Waiting Partner",
		},
		{
			id: "OP-44285",
			type: "API Key Request",
			priority: "Low",
			assignee: "Auto",
			sla: "48h remaining",
			status: "Resolved",
		},
	],
	reconciliationMatched: 1241892,
	reconciliationUnmatched: 4812,
	reconciliationDisputed: 187,
	settlementBatches: [
		{
			id: "S-88219",
			corridor: "KE → UG",
			amount: "KES 184.2M",
			status: "Delayed",
			progress: 67,
			eta: "+2h 14m",
		},
		{
			id: "S-88220",
			corridor: "KE → TZ",
			amount: "KES 92.4M",
			status: "Processing",
			progress: 89,
			eta: "41m",
		},
		{
			id: "S-88221",
			corridor: "UG → KE",
			amount: "KES 67.8M",
			status: "Completed",
			progress: 100,
			eta: "—",
		},
	],
};

async function fetchOpsData(): Promise<OpsData> {
	const response = await fetch("/api/ops-system");
	if (!response.ok) throw new Error("Failed to fetch operations data");
	return response.json();
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

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
	uptime: {
		icon: "bi-shield-check",
		bg: "var(--pm-green-soft)",
		color: "#067647",
		accent: "kpiFeatured",
	},
	success: {
		icon: "bi-check2-circle",
		bg: "var(--pm-green-soft)",
		color: "#067647",
	},
	p95: {
		icon: "bi-speedometer2",
		bg: "var(--pm-info-soft)",
		color: "#175cd3",
	},
	incidents: {
		icon: "bi-exclamation-triangle",
		bg: "var(--pm-danger-soft)",
		color: "#b42318",
		accent: "kpiDanger",
	},
};

export default function OpsSystem() {
	const [modals, setModals] = useState(initialModalsState);

	const openModal = useCallback((key: ModalKey) => {
		setModals((prev: typeof initialModalsState) => ({ ...prev, [key]: true }));
	}, []);

	const closeModal = useCallback((key: ModalKey) => {
		setModals((prev: typeof initialModalsState) => ({ ...prev, [key]: false }));
	}, []);

	const { data, isFetching, error } = useQuery<OpsData>({
		queryKey: ["paymo-ops-system"],
		queryFn: fetchOpsData,
		staleTime: 30_000,
		retry: 1,
		initialData: initialMockData,
	});
	const config = data ?? initialMockData;

	/* Modal hygiene: scroll lock, Escape to close, focus returns to trigger. */
	const anyModalOpen = Object.values(modals).some(Boolean);
	useEffect(() => {
		if (!anyModalOpen) return;
		const trigger = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setModals(initialModalsState);
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", closeOnEscape);
			trigger?.focus();
		};
	}, [anyModalOpen]);

	return (
		<div className={styles.systemHealthPage}>
			<div className={styles.content}>
				{/* ======================= EXECUTIVE HERO ======================= */}
				<section
					className={styles.heroBanner}
					aria-labelledby="ops-health-page-title"
				>
					<div className={styles.heroOrbOne} aria-hidden="true" />
					<div className={styles.heroOrbTwo} aria-hidden="true" />
					<div className={styles.heroContent}>
						<div className={styles.heroCopy}>
							<div className={styles.heroEyebrow}>
								<span>
									<i className="bi bi-activity" /> Operations command center
								</span>
								<span className={styles.heroLive}>
									<span className={styles.dotLive} /> {config.platformStatus}
									{isFetching ? (
										<small className={styles.heroRefreshing}>Refreshing…</small>
									) : null}
								</span>
							</div>
							<h1 id="ops-health-page-title">System Health &amp; Operations</h1>
							<p>
								Real-time platform uptime, transaction health, API performance,
								settlement reconciliation, fraud operations, infrastructure
								scaling and support queues — all in one command center.
							</p>
							<div className={styles.heroActions}>
								<button
									type="button"
									className={styles.heroPrimaryBtn}
									onClick={() => openModal("runHealthCheck")}
								>
									<i className="bi bi-play-circle" /> Run health check
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openModal("globalStatus")}
								>
									<i className="bi bi-globe" /> Global status
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openModal("createIncident")}
								>
									<i className="bi bi-plus-circle" /> Create incident
								</button>
							</div>
						</div>
						<aside
							className={styles.heroSnapshot}
							aria-label="Operations live status snapshot"
						>
							<div className={styles.heroSnapshotTop}>
								<span>Live snapshot</span>
								<div className={styles.heroSnapshotActions}>
									<button
										type="button"
										className={styles.heroIconBtn}
										onClick={() => openModal("opsNotif")}
										aria-label="Operations notifications"
										title="Operations notifications"
									>
										<i className="bi bi-bell" />
									</button>
									<button
										type="button"
										className={styles.heroIconBtn}
										onClick={() => openModal("notifSettings")}
										aria-label="Notification settings"
										title="Notification settings"
									>
										<i className="bi bi-gear" />
									</button>
									<button
										type="button"
										className={styles.heroAvatar}
										onClick={() => openModal("profile")}
										aria-label="Profile"
										title="Profile"
									>
										MN
									</button>
								</div>
							</div>
							<strong>{config.platformUptime}</strong>
							<p>
								Uptime · Last 30 days — {config.incidents30d} minor incidents
								resolved, {config.criticalOutages} critical outages
							</p>
							<div className={styles.heroMetricRow}>
								<div>
									<strong>{config.txnSuccess}</strong>
									<span>Success rate</span>
								</div>
								<div>
									<strong>{config.apiP95}</strong>
									<span>API P95</span>
								</div>
								<div>
									<strong>{config.openIncidents}</strong>
									<span>Open incidents</span>
								</div>
							</div>
						</aside>
					</div>
				</section>

				{error ? (
					<output className={styles.statusNotice}>
						<i className="bi bi-cloud-slash" />
						<span>
							<strong>Live operations data is temporarily unavailable</strong>
							<small>Using the latest local operating snapshot.</small>
						</span>
					</output>
				) : null}

				{/* ======================= 1.1 SYSTEM STATUS & UPTIME ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-status-heading"
				>
					<SectionHeading
						id="ops-status-heading"
						index="1.1"
						title="System status & uptime"
						description="Real-time health of every B2B transaction service, API, settlement engine and fraud system."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("uptimeHistory")}
								>
									<i className="bi bi-clock-history" /> History
								</button>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("slaReport")}
								>
									<i className="bi bi-file-earmark-bar-graph" /> SLA report
								</button>
							</div>
						}
					/>
					<div className={styles.kpiGrid}>
						{[
							{
								key: "uptime",
								label: "Platform uptime",
								value: config.platformUptime,
								badge: {
									tone: "badgeS",
									icon: "bi-check-circle",
									text: "Operational",
								},
								progress: { width: "99.97%", color: "var(--pm-green)" },
								note: [
									`${config.incidents30d} minor incidents (30d)`,
									"0 critical outages",
								],
							},
							{
								key: "success",
								label: "Transaction success",
								value: config.txnSuccess,
								badge: {
									tone: "badgeS",
									icon: "bi-check2-circle",
									text: `${config.txnCount} txns today`,
								},
								progress: { width: "99.4%", color: "var(--pm-green)" },
								note: [`${config.txnFailed} failed (${config.txnFailedPct})`],
							},
							{
								key: "p95",
								label: "API response (P95)",
								value: config.apiP95,
								badge: {
									tone: "badgeI",
									icon: "bi-speedometer2",
									text: "Within SLA",
								},
								note: [`Load ${config.apiLoad}`, `Peak ${config.apiPeak}`],
							},
							{
								key: "incidents",
								label: "Open incidents",
								value: String(config.openIncidents),
								badge: {
									tone: "badgeW",
									icon: "bi-exclamation-triangle",
									text: `${config.highPriority} high priority`,
								},
								note: [
									`${config.settlementDelay} settlement delays`,
									`${config.fraudSpike} fraud spike`,
									`${config.apiDegradation} API degradations`,
								],
							},
						].map((card) => {
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

					<div className={`${styles.card} mt-3`}>
						<div className={styles.panelGridWide}>
							<Ub title="Service health overview">
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Service</th>
												<th>Status</th>
												<th>Uptime</th>
												<th>Latency (P95)</th>
												<th>Error Rate</th>
												<th>Last Incident</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{config.services.map((svc) => (
												<tr key={svc.name}>
													<td>
														<strong>{svc.name}</strong>
													</td>
													<td>
														<span
															className={`${styles.badge} ${svc.status === "Healthy" ? styles.badgeS : styles.badgeW}`}
														>
															<i
																className={`bi ${svc.status === "Healthy" ? "bi-check-circle" : "bi-exclamation-triangle"}`}
															/>
															{svc.status}
														</span>
													</td>
													<td>{svc.uptime}</td>
													<td>{svc.latency}</td>
													<td>{svc.errorRate}</td>
													<td>{svc.lastIncident}</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openModal("serviceDetail")}
														>
															Details
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Ub>
							<Ub title="Regional status">
								{config.regions.map((region) => (
									<div className={styles.sr} key={region.name}>
										<div>
											<strong>{region.name}</strong>
										</div>
										<span
											className={`${styles.badge} ${region.status === "All Green" ? styles.badgeS : styles.badgeW}`}
										>
											{region.status}
										</span>
									</div>
								))}
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
									onClick={() => openModal("globalStatus")}
								>
									<i className="bi bi-globe" /> Global view
								</button>
							</Ub>
						</div>
					</div>
				</section>

				{/* ======================= 1.2 NEEDS YOUR ATTENTION ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-attention-heading"
				>
					<SectionHeading
						id="ops-attention-heading"
						index="1.2"
						title="Needs your attention"
						description="Resolve operational anomalies and act on smart recommendations without leaving the command center."
						action={
							<button
								type="button"
								className={styles.btnPm}
								onClick={() => openModal("incidentQueue")}
							>
								<i className="bi bi-list-check" /> Incident queue
							</button>
						}
					/>
					<div className={styles.attentionGrid}>
						<article className={`${styles.card} ${styles.listCard}`}>
							<div className={styles.cardHeader}>
								<div>
									<span className={styles.cardKicker}>Action center</span>
									<h3>Attention required</h3>
								</div>
								<span className={`${styles.badge} ${styles.badgeD}`}>
									3 open
								</span>
							</div>
							<div className={styles.listBody}>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-danger-soft)",
												color: "var(--pm-danger)",
											}}
										>
											<i className="bi bi-exclamation-triangle" />
										</span>
										<div>
											<strong>Settlement batch #S-88219 delayed</strong>
											<span>2h 14m behind SLA · KES 184M</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
										onClick={() => openModal("settlementDetail")}
									>
										Investigate
									</button>
								</div>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-warning-soft)",
												color: "var(--pm-warning)",
											}}
										>
											<i className="bi bi-graph-up" />
										</span>
										<div>
											<strong>Fraud detection false positive rate 4.2%</strong>
											<span>Above threshold (2.5%)</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("fraudModel")}
									>
										Tune model
									</button>
								</div>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-info-soft)",
												color: "var(--pm-info)",
											}}
										>
											<i className="bi bi-server" />
										</span>
										<div>
											<strong>API Gateway P99 latency 420ms</strong>
											<span>SLA breach risk (SLA: 300ms)</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("apiPerformance")}
									>
										Scale
									</button>
								</div>
							</div>
						</article>

						<article className={`${styles.card} ${styles.listCard}`}>
							<div className={styles.cardHeader}>
								<div>
									<span className={styles.cardKicker}>Smart guidance</span>
									<h3>Smart suggestions</h3>
								</div>
								<span className={`${styles.badge} ${styles.badgeP}`}>
									<i className="bi bi-stars" /> AI
								</span>
							</div>
							<div className={styles.listBody}>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-accent-soft)",
												color: "var(--pm-accent)",
											}}
										>
											<i className="bi bi-lightning-charge" />
										</span>
										<div>
											<strong>Enable auto-scaling on API Gateway</strong>
											<span>Reduce P99 latency by 35%</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("infraScaling")}
									>
										Enable
									</button>
								</div>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-purple-soft)",
												color: "var(--pm-purple)",
											}}
										>
											<i className="bi bi-shield-check" />
										</span>
										<div>
											<strong>Update fraud rules for weekend patterns</strong>
											<span>Reduce false positives by 1.8%</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("fraudModel")}
									>
										Apply
									</button>
								</div>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-warning-soft)",
												color: "var(--pm-warning)",
											}}
										>
											<i className="bi bi-clock-history" />
										</span>
										<div>
											<strong>Schedule reconciliation catch-up job</strong>
											<span>Clear 4 pending settlement batches</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("reconciliation")}
									>
										Schedule
									</button>
								</div>
								<div className={styles.actionRow}>
									<div className={styles.actionRowMain}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-danger-soft)",
												color: "var(--pm-danger)",
											}}
										>
											<i className="bi bi-bug" />
										</span>
										<div>
											<strong>Incident INC-88219 awaiting owner action</strong>
											<span>Settlement engine degraded · escalated</span>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("incidentDetail")}
									>
										Open
									</button>
								</div>
							</div>
						</article>
					</div>

					<article className={`${styles.card} ${styles.quickActionCard}`}>
						<div className={styles.quickActionIntro}>
							<span className={styles.cardKicker}>Shortcuts</span>
							<h3>Start a workflow</h3>
							<p>Frequent operations tasks, one click away.</p>
						</div>
						<div className={styles.quickGrid}>
							{[
								{
									label: "Run health check",
									icon: "bi-play-circle",
									color: "var(--pm-accent)",
									modal: "runHealthCheck",
								},
								{
									label: "View incidents",
									icon: "bi-exclamation-triangle",
									color: "var(--pm-danger)",
									modal: "incidentQueue",
								},
								{
									label: "Settlement status",
									icon: "bi-bank",
									color: "var(--pm-info)",
									modal: "settlementDetail",
								},
								{
									label: "Fraud console",
									icon: "bi-shield-exclamation",
									color: "var(--pm-warning)",
									modal: "fraudModel",
								},
								{
									label: "API metrics",
									icon: "bi-speedometer2",
									color: "var(--pm-info)",
									modal: "apiPerformance",
								},
								{
									label: "Audit logs",
									icon: "bi-file-earmark-text",
									color: "var(--pm-purple)",
									modal: "auditLog",
								},
								{
									label: "Support queue",
									icon: "bi-headset",
									color: "var(--pm-accent)",
									modal: "ticketDetail",
								},
								{
									label: "Scale services",
									icon: "bi-server",
									color: "var(--pm-info)",
									modal: "infraScaling",
								},
							].map((action) => (
								<button
									type="button"
									key={action.label}
									className={styles.quickBtn}
									onClick={() => openModal(action.modal as ModalKey)}
								>
									<span style={{ color: action.color }}>
										<i className={`bi ${action.icon}`} />
									</span>
									{action.label}
									<i className="bi bi-arrow-right" />
								</button>
							))}
						</div>
					</article>
				</section>

				{/* ======================= 1.3 TRANSACTION HEALTH MONITOR ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-transactions-heading"
				>
					<SectionHeading
						id="ops-transactions-heading"
						index="1.3"
						title="Transaction health monitor"
						description="Live transaction volume, success rates, failure reasons and corridor performance."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("liveTransactionFeed")}
								>
									<i className="bi bi-broadcast" /> Live feed
								</button>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("failureAnalysis")}
								>
									<i className="bi bi-search" /> Failure analysis
								</button>
							</div>
						}
					/>
					<div className={styles.card}>
						<div className={styles.metricTiles}>
							<div
								className={`${styles.miniStat} mb-2`}
								style={{
									background: "var(--pm-accent-soft)",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: 22,
										fontWeight: 700,
										color: "var(--pm-accent)",
									}}
								>
									42,811
								</div>
								<div
									style={{
										fontSize: 11,
										fontWeight: 600,
										color: "#047857",
									}}
								>
									Transactions (last 60 min)
								</div>
							</div>
							<div
								className={`${styles.miniStat} mb-2`}
								style={{
									background: "var(--pm-info-soft)",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: 22,
										fontWeight: 700,
										color: "var(--pm-info)",
									}}
								>
									KES 8.42B
								</div>
								<div
									style={{
										fontSize: 11,
										fontWeight: 600,
										color: "#1D4ED8",
									}}
								>
									Volume (last 60 min)
								</div>
							</div>
							<div
								className={`${styles.miniStat} mb-2`}
								style={{
									background: "var(--pm-purple-soft)",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: 22,
										fontWeight: 700,
										color: "var(--pm-purple)",
									}}
								>
									99.41%
								</div>
								<div
									style={{
										fontSize: 11,
										fontWeight: 600,
										color: "#6D28D9",
									}}
								>
									Success rate (last 60 min)
								</div>
							</div>
						</div>
						<div className={styles.panelGridWide} style={{ marginTop: 12 }}>
							<Ub title="Corridor performance">
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Corridor</th>
												<th>Count</th>
												<th>Success</th>
												<th>Avg Time</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{config.corridors.map((cor) => (
												<tr key={cor.name}>
													<td>{cor.name}</td>
													<td>{cor.count}</td>
													<td>{cor.success}</td>
													<td>{cor.avgTime}</td>
													<td>
														<div
															className="d-flex flex-wrap"
															style={{ gap: 6 }}
														>
															<button
																type="button"
																className={`${styles.btnPm} ${styles.btnSm}`}
																onClick={() => openModal("corridorDetail")}
															>
																View
															</button>
															<button
																type="button"
																className={`${styles.btnPm} ${styles.btnSm}`}
																onClick={() => openModal("corridorPerformance")}
															>
																Perf
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Ub>
							<Ub title="Failure breakdown (last hour)">
								{config.failureReasons.map((reason) => (
									<div className={styles.sr} key={reason.reason}>
										<div>
											<strong>{reason.reason}</strong>
										</div>
										<div>
											<span
												className={`${styles.badge} ${reason.pct > 20 ? styles.badgeD : reason.pct > 10 ? styles.badgeW : styles.badgeI}`}
											>
												{reason.count.toLocaleString()}
											</span>{" "}
											<small className={styles.mutedSmall}>{reason.pct}%</small>
										</div>
									</div>
								))}
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
									onClick={() => openModal("failureAnalysis")}
								>
									Explore failures
								</button>
							</Ub>
						</div>
					</div>
				</section>

				{/* ======================= 1.4 API & INTEGRATION HEALTH ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-api-heading"
				>
					<SectionHeading
						id="ops-api-heading"
						index="1.4"
						title="API & integration health"
						description="Partner API performance, webhook delivery, integration status and rate limiting."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("apiPerformance")}
								>
									<i className="bi bi-speedometer2" /> Performance
								</button>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("webhookMonitor")}
								>
									<i className="bi bi-broadcast" /> Webhooks
								</button>
							</div>
						}
					/>
					<div className={styles.card}>
						<div className={styles.panelGridWide}>
							<Ub title="Partner API status">
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Partner</th>
												<th>Status</th>
												<th>Latency</th>
												<th>Success</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{config.partnerApis.map((api) => (
												<tr key={api.name}>
													<td>
														<strong>{api.name}</strong>
													</td>
													<td>
														<span
															className={`${styles.badge} ${api.status === "Healthy" ? styles.badgeS : styles.badgeW}`}
														>
															{api.status}
														</span>
													</td>
													<td>{api.latency}</td>
													<td>{api.success}</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openModal("partnerApiDetail")}
														>
															Logs
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Ub>
							<Ub title="Webhook delivery">
								<div className={styles.sr}>
									<div>
										<strong>Delivered (last 24h)</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeS}`}>
											{config.webhookDelivered.toLocaleString()}
										</span>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Failed (retries exhausted)</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeD}`}>
											{config.webhookFailed.toLocaleString()}
										</span>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Pending retry queue</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeW}`}>
											{config.webhookRetry.toLocaleString()}
										</span>
									</div>
								</div>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
									onClick={() => openModal("webhookMonitor")}
								>
									Monitor queue
								</button>
							</Ub>
						</div>
					</div>
				</section>

				{/* ======================= 1.5 SETTLEMENT & RECONCILIATION ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-settlement-heading"
				>
					<SectionHeading
						id="ops-settlement-heading"
						index="1.5"
						title="Settlement & reconciliation"
						description="Real-time settlement status, batch reconciliation, pending items and dispute resolution."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("settlementDetail")}
								>
									<i className="bi bi-bank2" /> Settlement batches
								</button>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("reconciliation")}
								>
									<i className="bi bi-arrow-repeat" /> Run reconciliation
								</button>
							</div>
						}
					/>
					<div className={styles.card}>
						<div className={styles.panelGridWide}>
							<Ub title="Active settlement batches">
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Batch ID</th>
												<th>Corridor</th>
												<th>Amount</th>
												<th>Status</th>
												<th>Progress</th>
												<th>ETA</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{config.settlementBatches.map((batch) => (
												<tr key={batch.id}>
													<td>
														<code>{batch.id}</code>
													</td>
													<td>{batch.corridor}</td>
													<td>{batch.amount}</td>
													<td>
														<span
															className={`${styles.badge} ${batch.status === "Delayed" ? styles.badgeW : styles.badgeS}`}
														>
															{batch.status}
														</span>
													</td>
													<td>
														<div className={styles.pmProgress}>
															<div
																className={styles.pmProgressBar}
																style={{
																	width: `${batch.progress}%`,
																	background:
																		batch.status === "Delayed"
																			? "var(--pm-warning)"
																			: "var(--pm-accent)",
																}}
															/>
														</div>
													</td>
													<td>{batch.eta}</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}${batch.status === "Delayed" ? ` ${styles.btnPmD}` : ""}`}
															onClick={() => openModal("settlementDetail")}
														>
															{batch.status === "Delayed"
																? "Investigate"
																: batch.status === "Completed"
																	? "Receipt"
																	: "Details"}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Ub>
							<Ub title="Reconciliation summary">
								<div className={styles.sr}>
									<div>
										<strong>Matched today</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeS}`}>
											{config.reconciliationMatched.toLocaleString()}
										</span>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Unmatched</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeW}`}>
											{config.reconciliationUnmatched.toLocaleString()}
										</span>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Disputed items</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeD}`}>
											{config.reconciliationDisputed.toLocaleString()}
										</span>
									</div>
								</div>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
									onClick={() => openModal("reconciliation")}
								>
									Run full reconciliation
								</button>
							</Ub>
						</div>
					</div>
				</section>

				{/* ======================= 1.6 FRAUD & SECURITY OPERATIONS ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-fraud-heading"
				>
					<SectionHeading
						id="ops-fraud-heading"
						index="1.6"
						title="Fraud & security operations"
						description="Real-time fraud detection, alert queue, model performance and manual review cases."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("fraudModel")}
								>
									<i className="bi bi-sliders" /> Model console
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnPmD}`}
									onClick={() => openModal("fraudAlertQueue")}
								>
									<i className="bi bi-bell-slash" /> Alert queue
								</button>
							</div>
						}
					/>
					<div className={styles.card}>
						<div className={styles.panelGridWide}>
							<Ub title="Fraud detection performance">
								<div className={styles.metricTiles}>
									<div
										className={`${styles.miniStat} mb-2`}
										style={{
											background: "var(--pm-danger-soft)",
											textAlign: "center",
										}}
									>
										<div
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: "#991B1B",
											}}
										>
											ALERTS TODAY
										</div>
										<div
											style={{
												fontSize: 26,
												fontWeight: 700,
												color: "var(--pm-danger)",
											}}
										>
											{config.fraudAlerts.toLocaleString()}
										</div>
									</div>
									<div
										className={`${styles.miniStat} mb-2`}
										style={{
											background: "var(--pm-accent-soft)",
											textAlign: "center",
										}}
									>
										<div
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: "#047857",
											}}
										>
											BLOCKED TRANSACTIONS
										</div>
										<div
											style={{
												fontSize: 26,
												fontWeight: 700,
												color: "var(--pm-accent)",
											}}
										>
											{config.blockedTxns.toLocaleString()}
										</div>
									</div>
									<div
										className={`${styles.miniStat} mb-2`}
										style={{
											background: "var(--pm-purple-soft)",
											textAlign: "center",
										}}
									>
										<div
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: "#6D28D9",
											}}
										>
											REVIEW QUEUE
										</div>
										<div
											style={{
												fontSize: 26,
												fontWeight: 700,
												color: "var(--pm-purple)",
											}}
										>
											{config.manualReviewHigh +
												config.manualReviewMedium +
												config.manualReviewLow}
										</div>
									</div>
								</div>
								<div className={styles.tableScroll} style={{ marginTop: 12 }}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Rule</th>
												<th>Triggered</th>
												<th>Blocked</th>
												<th>FP Rate</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{config.fraudRules.map((rule) => (
												<tr key={rule.name}>
													<td>{rule.name}</td>
													<td>{rule.triggered.toLocaleString()}</td>
													<td>{rule.blocked.toLocaleString()}</td>
													<td>{rule.fpRate}</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openModal("fraudModel")}
														>
															Tune
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Ub>
							<Ub title="Manual review queue">
								<div className={styles.sr}>
									<div>
										<strong>High risk cases</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeD}`}>
											{config.manualReviewHigh}
										</span>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Medium risk cases</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeW}`}>
											{config.manualReviewMedium}
										</span>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Low risk cases</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeI}`}>
											{config.manualReviewLow}
										</span>
									</div>
								</div>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2 ${styles.btnPmD}`}
									onClick={() => openModal("fraudReview")}
								>
									Review queue
								</button>
							</Ub>
						</div>
					</div>
				</section>

				{/* ======================= 1.7 INFRASTRUCTURE & UPTIME ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-infra-heading"
				>
					<SectionHeading
						id="ops-infra-heading"
						index="1.7"
						title="Infrastructure & uptime"
						description="Server health, database performance, queue depths, auto-scaling events and capacity planning."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("infraScaling")}
								>
									<i className="bi bi-arrows-expand" /> Scaling
								</button>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("capacityPlanning")}
								>
									<i className="bi bi-graph-up-arrow" /> Capacity
								</button>
							</div>
						}
					/>
					<div className={styles.card}>
						<div className={styles.panelGridWide}>
							<Ub title="Infrastructure metrics">
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Component</th>
												<th>CPU</th>
												<th>Memory</th>
												<th>Disk</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{config.infra.map((comp) => (
												<tr key={comp.name}>
													<td>
														<strong>{comp.name}</strong>
													</td>
													<td>{comp.cpu}</td>
													<td>{comp.memory}</td>
													<td>{comp.disk}</td>
													<td>
														<span
															className={`${styles.badge} ${comp.status === "Healthy" ? styles.badgeS : styles.badgeW}`}
														>
															{comp.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={`${styles.btnPm} ${styles.btnSm}`}
															onClick={() => openModal("infraDetail")}
														>
															Metrics
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Ub>
							<Ub title="Auto-scaling events (24h)">
								{config.scalingEvents.map((evt) => (
									<div className={styles.sr} key={evt.component}>
										<div>
											<strong>{evt.component}</strong>
										</div>
										<div>
											<span className={`${styles.badge} ${styles.badgeI}`}>
												{evt.count}
											</span>
										</div>
									</div>
								))}
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
									onClick={() => openModal("infraScaling")}
								>
									Manage scaling policies
								</button>
							</Ub>
						</div>
					</div>
				</section>

				{/* ======================= 1.8 OPERATIONS QUEUE, SUPPORT & AUDIT ======================= */}
				<section
					className={styles.dashboardSection}
					aria-labelledby="ops-queue-heading"
				>
					<SectionHeading
						id="ops-queue-heading"
						index="1.8"
						title="Operations queue, support & audit"
						description="Internal operations tickets, partner support requests, SLA tracking, escalation and audit trails."
						action={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("ticketDetail")}
								>
									<i className="bi bi-headset" /> Support queue
								</button>
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("escalation")}
								>
									<i className="bi bi-arrow-up-circle" /> Escalations
								</button>
							</div>
						}
					/>
					<article className={`${styles.card} ${styles.tableCard}`}>
						<div className={styles.tableToolbar}>
							<div className={styles.tableTitle}>
								<h3>Operations ticket queue</h3>
								<span>
									Internal tickets, partner requests and SLA tracking.
								</span>
							</div>
							<div className={styles.tableTools}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openModal("ticketDetail")}
								>
									<i className="bi bi-plus-lg" /> New ticket
								</button>
							</div>
						</div>
						<div className={styles.tableScroll}>
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Ticket</th>
										<th>Type</th>
										<th>Priority</th>
										<th>Assignee</th>
										<th>SLA</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{config.tickets.map((ticket) => (
										<tr key={ticket.id}>
											<td>
												<code>{ticket.id}</code>
											</td>
											<td>{ticket.type}</td>
											<td>
												<span
													className={`${styles.badge} ${ticket.priority === "High" ? styles.badgeD : ticket.priority === "Medium" ? styles.badgeW : styles.badgeI}`}
												>
													{ticket.priority}
												</span>
											</td>
											<td>{ticket.assignee}</td>
											<td>{ticket.sla}</td>
											<td>
												<span
													className={`${styles.badge} ${ticket.status === "Resolved" ? styles.badgeS : ticket.status === "In Progress" ? styles.badgeW : styles.badgeI}`}
												>
													{ticket.status}
												</span>
											</td>
											<td>
												<div className="d-flex flex-wrap" style={{ gap: 6 }}>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openModal("ticketDetail")}
													>
														Open
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openModal("escalation")}
													>
														Escalate
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</article>

					<div className={`${styles.card} mt-3`}>
						<div className={styles.panelGridWide}>
							<Ub title="System audit log">
								<p className={styles.mutedSmall} style={{ margin: 0 }}>
									Full audit trail of operations actions — incidents, scaling
									events, reconciliation runs, model changes and configuration
									updates.
								</p>
								<div
									className="d-flex flex-wrap"
									style={{ gap: 8, marginTop: 12 }}
								>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("auditLog")}
									>
										<i className="bi bi-file-earmark-text" /> View logs
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openModal("caseExport")}
									>
										<i className="bi bi-download" /> Export logs
									</button>
								</div>
							</Ub>
							<Ub title="Notification preferences">
								<div className={styles.sr}>
									<div>
										<strong>Ops alerts</strong>
									</div>
									<div>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openModal("notifSettings")}
										>
											Configure
										</button>
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>On-call rotation</strong>
									</div>
									<div>
										<span className={`${styles.badge} ${styles.badgeS}`}>
											<i className="bi bi-phone" /> Active
										</span>
									</div>
								</div>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
									onClick={() => openModal("opsNotif")}
								>
									View operations notifications
								</button>
							</Ub>
						</div>
					</div>
				</section>
			</div>

			{/* ======================= FLOATING COMMAND BAR ======================= */}
			<nav className={styles.floatingBar} aria-label="Quick operations actions">
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => openModal("runHealthCheck")}
				>
					<i className="bi bi-play-circle" /> Run health check
				</button>
				<button type="button" onClick={() => openModal("incidentQueue")}>
					<i className="bi bi-exclamation-triangle" /> Incidents
				</button>
				<button type="button" onClick={() => openModal("liveTransactionFeed")}>
					<i className="bi bi-broadcast" /> Live feed
				</button>
				<button type="button" onClick={() => openModal("fraudAlertQueue")}>
					<i className="bi bi-bell-slash" /> Fraud queue
				</button>
				<button type="button" onClick={() => openModal("auditLog")}>
					<i className="bi bi-file-earmark-text" /> Audit log
				</button>
			</nav>

			<footer className={styles.pageFooter}>
				<span>
					<i className="bi bi-activity" /> PayMo operations command center
				</span>
				<nav aria-label="Footer links">
					<a href="/pm/app/support">Support</a>
					<Link to="/pm/app/settings">Preferences</Link>
					<span>v1.17.0</span>
				</nav>
			</footer>

			{/* ======================= ALL MODALS ======================= */}
			<OpsSystemModals state={modals} onClose={closeModal} />
		</div>
	);
}
