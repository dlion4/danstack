/* ============================================================================
 * Integration Architecture & Patterns
 *       (route: /dev-dashboard/integration-architecture)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: uploads/4.7.html (465 lines, 25 modals).
 *
 *  - The four pattern tiles, three enterprise topology panels and the
 *    performance table were repeated hand-written blocks; they are now `.map()`
 *    loops over `initialMockData`.
 *  - The page-bar H2 in the original carried `color:#fff`, a leftover from a
 *    dark-theme draft that rendered the title invisible on the cream surface.
 *    That single declaration is dropped so the heading inherits `--pm-ink`
 *    (this is the "font colour crash" guard you asked for).
 *  - Bootstrap grid classes are preserved verbatim.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import IntegrationArchitectureModals from "../components/IntegrationArchitectureModals";
import {
	fetchIntegrationArchitecture,
	initialMockData,
} from "../data/integrationArchitectureData";
import styles from "../styles/integrationArchitecture.module.css";

const s = styles as Record<string, string>;

export default function IntegrationArchitecture() {
	const { data } = useQuery({
		queryKey: ["dev-integration-architecture-4-7"],
		queryFn: fetchIntegrationArchitecture,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
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
							{c.pageTitle}
						</h2>
						<p className={s.pageSub}>{c.pageSub}</p>
					</div>
					<div
						className="d-flex flex-wrap align-items-center"
						style={{ gap: 8 }}
					>
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
							onClick={() => open("profileModal")}
						>
							<span
								className={s.iconCircle}
								style={{
									width: 24,
									height: 24,
									minWidth: 24,
									fontSize: 10,
									background: "var(--pm-info)",
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
					{/* ================= TOP STATS ================= */}
					<div className="row g-3">
						{c.kpis.map((k) => (
							<div key={k.key} className={k.col}>
								<div
									className={`${s.card} ${k.accent ? s.cardAccent : ""}`}
									style={{ minHeight: 140 }}
								>
									<p className={s.sl} style={{ color: k.labelColor }}>
										{k.label}
									</p>
									<div
										className={s.sv}
										style={{
											margin: "6px 0",
											...(k.valueSize ? { fontSize: k.valueSize } : {}),
											...(k.accent ? { color: "#fff" } : {}),
										}}
									>
										{k.value}
									</div>
									<span className={`${s.badge} ${s[k.badge.tone]}`}>
										<i className={`bi ${k.badge.icon}`} /> {k.badge.text}
									</span>
									{k.meter && (
										<div className={`${s.progress} mt-2`}>
											<div
												className={s.progressBar}
												style={{
													width: `${k.meter.pct}%`,
													background: k.meter.color,
												}}
											/>
										</div>
									)}
									{k.note && (
										<div
											style={{
												fontSize: 11,
												color: k.accent
													? "rgba(255,255,255,.75)"
													: "var(--pm-muted)",
												marginTop: 8,
											}}
										>
											{k.note}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ============ Integration Patterns ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-puzzle"
										style={{ color: "var(--pm-primary)" }}
									/>{" "}
									Integration Patterns
								</h3>
								<p className={s.sectionSub}>
									Select and configure how your application frontend and backend
									interface with PayMo.
								</p>
							</div>
						</div>
						<div className="row g-3">
							{c.patterns.map((p) => (
								<div className="col-md-6 col-lg-3" key={p.key}>
									<div className={s.integrationCard}>
										<div
											className={`${s.iconCircle} mb-3`}
											style={{ background: p.iconBg, color: "#fff" }}
										>
											<i className={`bi ${p.icon}`} />
										</div>
										<h6 style={{ fontWeight: 700 }}>{p.title}</h6>
										<p
											style={{
												fontSize: 12,
												color: "var(--pm-ink-soft)",
												flex: 1,
											}}
										>
											{p.desc}
										</p>
										<div className="d-flex gap-2 flex-wrap mt-auto">
											{p.actions.map((a) => (
												<button
													key={a.label}
													type="button"
													className={`${s.btnPm} ${s.btnSm} flex-fill`}
													onClick={() => open(a.modal)}
												>
													{a.label}
												</button>
											))}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* ============ Enterprise Architecture ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-building"
										style={{ color: "var(--pm-warning)" }}
									/>{" "}
									Enterprise Architecture
								</h3>
								<p className={s.sectionSub}>
									Topology mapping for complex infrastructures including legacy
									cores and multi-tenant SaaS.
								</p>
							</div>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnSm}`}
								onClick={() => open("idempotencyModal")}
							>
								<i
									className="bi bi-key"
									style={{ color: "var(--pm-warning)" }}
								/>{" "}
								Idempotency Keys
							</button>
						</div>
						<div className="row g-3">
							{c.topology.map((t) => (
								<div className="col-lg-4" key={t.key}>
									<div className={s.panelBlock}>
										<h6 style={{ fontWeight: 700, color: t.titleColor }}>
											<i className={`bi ${t.icon}`} /> {t.title}
										</h6>
										<p
											style={{
												fontSize: 12,
												color: "var(--pm-ink-soft)",
												marginBottom: 12,
											}}
										>
											{t.desc}
										</p>
										{t.rows.map((r) => (
											<div
												key={r.label}
												className="d-flex justify-content-between align-items-center pb-2 mb-2"
												style={{
													borderBottom: "1px solid var(--pm-border)",
													gap: 8,
												}}
											>
												<span style={{ fontSize: 12 }}>{r.label}</span>
												{r.strong ? (
													<strong style={{ fontSize: 14 }}>{r.value}</strong>
												) : (
													<span
														className={`${s.badge} ${s[r.tone ?? "badgeNeutral"]}`}
													>
														{r.value}
													</span>
												)}
											</div>
										))}
										<div className="d-flex gap-2 flex-wrap mt-3">
											{t.actions
												.filter((a) => !a.full)
												.map((a) => (
													<button
														key={a.label}
														type="button"
														className={`${s.btnPm} ${s.btnSm} flex-fill`}
														onClick={() => open(a.modal)}
													>
														{a.label}
													</button>
												))}
										</div>
										{t.actions
											.filter((a) => a.full)
											.map((a) => (
												<button
													key={a.label}
													type="button"
													className={`${s.btnPm} ${s.btnSm} w-100 mt-2`}
													onClick={() => open(a.modal)}
												>
													{a.label}
												</button>
											))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* ============ Performance & Scalability ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-speedometer"
										style={{ color: "var(--pm-accent)" }}
									/>{" "}
									Performance & Scalability
								</h3>
								<p className={s.sectionSub}>
									Manage rate limits, setup edge caching, and configure
									failovers for high-traffic environments.
								</p>
							</div>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
								onClick={() => open("haFailoverModal")}
							>
								<i className="bi bi-activity" /> HA Tester
							</button>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Component</th>
										<th>Strategy / Tool</th>
										<th>Status</th>
										<th>Throughput / Rule</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{c.perfRows.map((r) => (
										<tr key={r.component}>
											<td data-label="Component">
												<i
													className={`bi ${r.icon} me-2`}
													style={{ color: r.iconColor }}
												/>{" "}
												{r.component}
											</td>
											<td data-label="Strategy">{r.strategy}</td>
											<td data-label="Status">
												<span className={`${s.badge} ${s[r.statusTone]}`}>
													{r.status}
												</span>
											</td>
											<td data-label="Throughput">{r.throughput}</td>
											<td data-label="Action">
												<div className="d-flex gap-2 justify-content-end justify-content-md-start flex-wrap">
													{r.actions.map((a) => (
														<button
															key={a.label}
															type="button"
															className={`${s.btnPm} ${s.btnSm}`}
															onClick={() => open(a.modal)}
														>
															{a.label}
														</button>
													))}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 25 MODALS ================= */}
			<IntegrationArchitectureModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
