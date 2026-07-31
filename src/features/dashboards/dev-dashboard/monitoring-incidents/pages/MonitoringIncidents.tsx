/* ============================================================================
 * Monitoring, Alerting & Incident Management
 *       (route: /dev-dashboard/monitoring-incidents)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: uploads/4.8.html (424 lines, 24 modals).
 *
 *  - The header's project <select onchange="openModal('projectSelectorModal')">
 *    is now a controlled React select that opens the modal on change.
 *  - The observability tool tiles used inline onmouseover/onmouseout handlers
 *    to swap borderColor; that is now the `.tileBtn:hover` CSS rule, so the
 *    hover colour also behaves correctly on touch devices.
 *  - The live log tail keeps its dark surface but the per-level colours are now
 *    real classes (.logWarn/.logError) instead of undefined legacy ones, so
 *    WARN/ERROR lines are actually legible (contrast fix).
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import MonitoringIncidentsModals from "../components/MonitoringIncidentsModals";
import {
	fetchMonitoringIncidents,
	initialMockData,
} from "../data/monitoringIncidentsData";
import styles from "../styles/monitoringIncidents.module.css";

const s = styles as Record<string, string>;

const TREND_ICON: Record<string, { icon: string; color: string }> = {
	flat: { icon: "bi-arrow-right", color: "var(--pm-muted)" },
	down: { icon: "bi-arrow-down-right", color: "var(--pm-accent)" },
	up: { icon: "bi-arrow-up-right", color: "var(--pm-danger)" },
};

export default function MonitoringIncidents() {
	const { data } = useQuery({
		queryKey: ["dev-monitoring-incidents-4-8"],
		queryFn: fetchMonitoringIncidents,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [project, setProject] = useState(c.header.projects[0]);
	const open = (id: string) => setActiveModal(id);

	useEffect(() => {
		if (!activeModal) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setActiveModal(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [activeModal]);

	return (
		<div className={s.devPage}>
			<div className={s.main}>
				{/* ================= PAGE BAR ================= */}
				<div className={s.pageBar}>
					<div>
						<div className={s.breadcrumb}>
							{c.breadcrumb.parents.map((p) => (
								<span key={p.label}>
									{p.to ? <Link to={p.to}>{p.label}</Link> : p.label} /{" "}
								</span>
							))}
							<strong>{c.breadcrumb.current}</strong>
						</div>
						<h2 className={s.pageH2}>
							{c.pageCode} — {c.pageTitle}
						</h2>
						<p className={s.pageSub}>{c.pageSub}</p>
					</div>
					<div
						className="d-flex flex-wrap align-items-center"
						style={{ gap: 8 }}
					>
						{/* project switcher (legacy header <select onchange=openModal>) */}
						<select
							className={s.projectSelect}
							style={{ width: "auto", minWidth: 190 }}
							value={project}
							aria-label="Switch project environment"
							onChange={(e) => {
								setProject(e.target.value);
								open("projectSelectorModal");
							}}
						>
							{c.header.projects.map((p) => (
								<option key={p}>{p}</option>
							))}
						</select>
						{c.header.actions.map((a) => (
							<button
								key={a.modal}
								type="button"
								className={s.btnPm}
								title={a.title}
								onClick={() => open(a.modal)}
							>
								<i className={`bi ${a.icon}`} />
								<span className="d-none d-sm-inline">{a.title}</span>
								{a.counter ? (
									<span
										className={s.badge}
										style={{
											background: a.counterColor ?? "var(--pm-danger)",
											color: "#fff",
										}}
									>
										{a.counter}
									</span>
								) : null}
							</button>
						))}
						{c.pageActions.map((a) => (
							<button
								key={a.modal}
								type="button"
								className={`${s.btnPm} ${a.primary ? s.btnPmP : ""}`}
								onClick={() => open(a.modal)}
							>
								<i className={`bi ${a.icon}`} style={{ color: a.iconColor }} />{" "}
								{a.label}
							</button>
						))}
						<button
							type="button"
							className={s.btnPm}
							onClick={() => open("globalProfileModal")}
						>
							<span
								className={s.iconCircle}
								style={{
									width: 24,
									height: 24,
									minWidth: 24,
									fontSize: 10,
									background: "var(--pm-gradient-hero)",
									color: "#fff",
								}}
							>
								{c.header.user.initials}
							</span>
							<span className="d-none d-md-inline">{c.header.user.name}</span>
						</button>
					</div>
				</div>

				<div className={s.content}>
					{/* ================= HERO KPIs ================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div
								className={`${s.card} ${s.cardAccent}`}
								style={{ minHeight: 170 }}
							>
								<p
									style={{
										margin: 0,
										fontSize: 12,
										color: "rgba(255,255,255,.78)",
									}}
								>
									{c.hero.status}
								</p>
								<div
									className={s.sv}
									style={{ margin: "8px 0", color: "#fff" }}
								>
									{c.hero.value}
								</div>
								<p
									style={{
										margin: 0,
										fontSize: 12,
										color: "rgba(255,255,255,.78)",
									}}
								>
									{c.hero.detail}
								</p>
								<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
									{c.hero.actions.map((a) => (
										<button
											key={a.label}
											type="button"
											className={`${s.btnPm} ${s.btnSm} ${s.btnGhostLight}`}
											onClick={() => open(a.modal)}
										>
											{a.label}
										</button>
									))}
								</div>
							</div>
						</div>

						{c.heroStats.map((st) => (
							<div key={st.key} className={st.col}>
								<div
									className={s.card}
									style={{
										minHeight: 170,
										...(st.accentBorder
											? { borderLeft: `3px solid ${st.accentBorder}` }
											: {}),
									}}
								>
									<p className={s.sl} style={{ color: st.labelColor }}>
										{st.label}
									</p>
									<div className={s.sv} style={{ margin: "6px 0" }}>
										{st.value}{" "}
										{st.unit && (
											<span style={{ fontSize: 14, color: "var(--pm-muted)" }}>
												{st.unit}
											</span>
										)}
									</div>
									<span className={`${s.badge} ${s[st.badge.tone]}`}>
										<i className={`bi ${st.badge.icon}`} /> {st.badge.text}
									</span>
									{st.miniBars && (
										<div className={`${s.miniBars} mt-3`}>
											{st.miniBars.map((b, i) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: static sparkline
													key={i}
													className={s.miniBar}
													style={{ height: b.height, background: b.color }}
												/>
											))}
										</div>
									)}
									{st.meter && (
										<div className="mt-2">
											<div
												className="d-flex justify-content-between"
												style={{ fontSize: 11, color: "var(--pm-muted)" }}
											>
												<span>{st.meter.label}</span>
												<span>{st.meter.value}</span>
											</div>
											<div className={`${s.progress} mt-1`}>
												<div
													className={s.progressBar}
													style={{
														width: `${st.meter.pct}%`,
														background: st.meter.color,
													}}
												/>
											</div>
										</div>
									)}
									{st.facts && (
										<div
											className="mt-2"
											style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
										>
											{st.facts.map((f) => (
												<div key={f.label}>
													{f.label}: <strong>{f.value}</strong>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ================= TOP ACTION ROW ================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={s.sectionTitle}>Active Alerts</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("developerAlertsModal")}
									>
										View all
									</button>
								</div>
								{c.activeAlerts.map((a) => (
									<div key={a.title} className={s.feedItem}>
										<div
											className={s.iconCircle}
											style={{ background: a.bg, color: a.color, fontSize: 12 }}
										>
											{a.tag}
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{a.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{a.sub}
											</div>
										</div>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm} ${a.danger ? s.btnPmD : ""}`}
											onClick={() => open(a.modal)}
										>
											{a.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={s.sectionTitle}>Recent Incidents</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("incidentPostmortemModal")}
									>
										History
									</button>
								</div>
								{c.recentIncidents.map((i) => (
									<div key={i.title} className={s.feedItem}>
										<div
											className={s.iconCircle}
											style={{ background: i.bg, color: i.color, fontSize: 12 }}
										>
											<i className={`bi ${i.icon}`} />
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{i.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{i.sub}
											</div>
										</div>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open(i.modal)}
										>
											{i.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="mb-3">
									<h3 className={s.sectionTitle}>Quick Actions</h3>
									<p className={s.sectionSub}>
										Observability & Incident commands
									</p>
								</div>
								<div className={s.quickActionGrid}>
									{c.quickActions.map((q) => (
										<button
											key={q.label}
											type="button"
											className={s.quickActionBtn}
											onClick={() => open(q.modal)}
										>
											<i
												className={`bi ${q.icon}`}
												style={{ color: q.color }}
											/>{" "}
											{q.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ============ System Health & Status ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-heart-pulse-fill"
										style={{ color: "var(--pm-accent)" }}
									/>{" "}
									System Health & Status
								</h3>
								<p className={s.sectionSub}>
									Real-time status of APIs, uptime SLAs, external dependencies,
									and maintenance windows.
								</p>
							</div>
							<div className="d-flex flex-wrap" style={{ gap: 8 }}>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("apiHealthMetricsModal")}
								>
									<i className="bi bi-speedometer2" /> Advanced Metrics
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
									onClick={() => open("systemStatusModal")}
								>
									<i className="bi bi-globe" /> Public Status Page
								</button>
							</div>
						</div>
						<div className="row g-3">
							<div className="col-lg-7">
								<div className={s.utilityBlock}>
									<h4
										style={{
											fontSize: 14,
											fontWeight: 700,
											margin: "0 0 12px",
										}}
									>
										Core API Subsystems
									</h4>
									<div className={s.tableWrap}>
										<table className={s.table}>
											<thead>
												<tr>
													<th>Service</th>
													<th>Status</th>
													<th>Uptime (30d)</th>
													<th>Avg Latency</th>
													<th>Trend</th>
												</tr>
											</thead>
											<tbody>
												{c.subsystems.map((r) => (
													<tr key={r.name}>
														<td data-label="Service">
															<strong>{r.name}</strong>
														</td>
														<td data-label="Status">
															<span className={`${s.badge} ${s[r.tone]}`}>
																{r.status}
															</span>
														</td>
														<td data-label="Uptime">{r.uptime}</td>
														<td data-label="Avg Latency">{r.latency}</td>
														<td data-label="Trend">
															<i
																className={`bi ${TREND_ICON[r.trend].icon}`}
																style={{ color: TREND_ICON[r.trend].color }}
															/>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
							<div className="col-lg-5">
								<div className={s.utilityBlock}>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
											External Dependencies
										</h4>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("dependencyHealthModal")}
										>
											Details
										</button>
									</div>
									{c.dependencies.map((d) => (
										<div key={d.name} className={s.statusRow}>
											<div style={{ minWidth: 0 }}>
												<strong>{d.name}</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
													{d.sub}
												</div>
											</div>
											<span className={`${s.badge} ${s[d.tone]}`}>
												{d.status}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ============ Developer Alerting & On-Call ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-bell-fill"
										style={{ color: "var(--pm-warning)" }}
									/>{" "}
									Developer Alerting & On-Call
								</h3>
								<p className={s.sectionSub}>
									Manage custom alert rules, escalation policies,
									PagerDuty/Slack routing, and incident war rooms.
								</p>
							</div>
							<div className="d-flex flex-wrap" style={{ gap: 8 }}>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("notificationChannelsModal")}
								>
									<i className="bi bi-plug" /> Channels
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
									onClick={() => open("addAlertRuleModal")}
								>
									<i className="bi bi-plus-lg" /> Add Rule
								</button>
							</div>
						</div>
						<div className="row g-3">
							<div className="col-lg-8">
								<div className={s.utilityBlock}>
									<h4
										style={{
											fontSize: 14,
											fontWeight: 700,
											margin: "0 0 12px",
										}}
									>
										Configured Alert Rules
									</h4>
									<div className={s.tableWrap}>
										<table className={s.table}>
											<thead>
												<tr>
													<th>Rule Name</th>
													<th>Condition</th>
													<th>Severity</th>
													<th>Channels</th>
													<th>Status</th>
													<th>Action</th>
												</tr>
											</thead>
											<tbody>
												{c.alertRules.map((r) => (
													<tr key={r.name}>
														<td data-label="Rule Name">{r.name}</td>
														<td data-label="Condition">{r.condition}</td>
														<td data-label="Severity">
															<span
																className={`${s.badge} ${s[r.severityTone]}`}
															>
																{r.severity}
															</span>
														</td>
														<td data-label="Channels">
															<i
																className={`bi ${r.channelIcon}`}
																style={{ color: r.channelColor, fontSize: 16 }}
															/>
														</td>
														<td data-label="Status">
															<span className={`${s.badge} ${s[r.statusTone]}`}>
																{r.status}
															</span>
														</td>
														<td data-label="Action">
															<button
																type="button"
																className={`${s.btnPm} ${s.btnSm}`}
																onClick={() => open("addAlertRuleModal")}
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
							</div>
							<div className="col-lg-4">
								<div className={s.utilityBlock}>
									<h4
										style={{
											fontSize: 14,
											fontWeight: 700,
											margin: "0 0 12px",
										}}
									>
										On-Call & Escalation
									</h4>
									<div
										className="p-3 rounded mb-3"
										style={{ background: "var(--pm-surface)" }}
									>
										<div className="d-flex justify-content-between mb-2 gap-2">
											<span style={{ color: "var(--pm-muted)" }}>
												Current On-Call (L1)
											</span>
											<strong>{c.onCall.l1}</strong>
										</div>
										<div className="d-flex justify-content-between mb-2 gap-2">
											<span style={{ color: "var(--pm-muted)" }}>
												Secondary (L2)
											</span>
											<strong>{c.onCall.l2}</strong>
										</div>
										<div className="d-flex justify-content-between gap-2">
											<span style={{ color: "var(--pm-muted)" }}>
												PagerDuty Sync
											</span>
											<span className={`${s.badge} ${s.badgeS}`}>
												{c.onCall.pagerDuty}
											</span>
										</div>
									</div>
									<div className="d-flex flex-column gap-2">
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("pagerDutySetupModal")}
										>
											<i
												className="bi bi-telephone-outbound"
												style={{ color: "var(--pm-danger)" }}
											/>{" "}
											Manage PagerDuty Sync
										</button>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("escalationPolicyModal")}
										>
											<i
												className="bi bi-arrow-up-right-square"
												style={{ color: "var(--pm-accent)" }}
											/>{" "}
											Edit Escalation Policy
										</button>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
											onClick={() => open("incidentWarRoomModal")}
										>
											<i className="bi bi-exclamation-triangle" /> Activate War
											Room
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ============ Log Management & Observability ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-diagram-3-fill"
										style={{ color: "var(--pm-primary)" }}
									/>{" "}
									Log Management & Observability
								</h3>
								<p className={s.sectionSub}>
									Centralized logging (ELK), OpenTelemetry distributed tracing,
									and Prometheus/Grafana metric exports.
								</p>
							</div>
							<div className="d-flex flex-wrap" style={{ gap: 8 }}>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("prometheusExportModal")}
								>
									<i className="bi bi-box-arrow-up" /> Export Metrics
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
									onClick={() => open("grafanaDashboardModal")}
								>
									<i className="bi bi-bar-chart" /> Dashboards
								</button>
							</div>
						</div>
						<div className="row g-3">
							<div className="col-lg-6">
								<div className={s.logTail}>
									<div className="d-flex justify-content-between align-items-center mb-2 gap-2">
										<h4
											style={{
												fontSize: 12,
												fontWeight: 700,
												margin: 0,
												color: "rgba(255,255,255,.7)",
											}}
										>
											Live Request Logs (Tail)
										</h4>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											style={{
												background: "transparent",
												color: "#fff",
												borderColor: "rgba(255,255,255,.3)",
											}}
											onClick={() => open("centralizedLogModal")}
										>
											<i className="bi bi-search" /> Search Logs
										</button>
									</div>
									{c.logLines.map((l) => (
										<div
											key={l.text}
											className={`${s.logLine} ${
												l.level === "warn"
													? s.logWarn
													: l.level === "error"
														? s.logError
														: ""
											}`}
										>
											{l.text}
										</div>
									))}
								</div>
							</div>
							<div className="col-lg-6">
								<div className={s.utilityBlock}>
									<h4
										style={{
											fontSize: 14,
											fontWeight: 700,
											margin: "0 0 12px",
										}}
									>
										Observability Tools
									</h4>
									<div className="row g-2">
										{c.tools.map((t) => (
											<div className="col-sm-6" key={t.title}>
												<button
													type="button"
													className={s.tileBtn}
													onClick={() => open(t.modal)}
												>
													<i
														className={`bi ${t.icon} d-block mb-2`}
														style={{ fontSize: 24, color: t.color }}
													/>
													<strong style={{ fontSize: 13 }}>{t.title}</strong>
													<div
														style={{ fontSize: 11, color: "var(--pm-muted)" }}
													>
														{t.sub}
													</div>
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 24 MODALS ================= */}
			<MonitoringIncidentsModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
