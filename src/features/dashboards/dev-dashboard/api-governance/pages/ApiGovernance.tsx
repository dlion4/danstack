/* ============================================================================
 * API Governance, Versioning & Roadmap
 *        (route: /dev-dashboard/api-governance)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: uploads/4.10.html (847 lines, 21 modals).
 *
 *  - The version lifecycle table, the four governance metric tiles and the
 *    three-column kanban roadmap board were repeated hand-written markup; each
 *    is now a `.map()` over `initialMockData`.
 *  - `onclick="event.stopPropagation();openModal('enrollBetaModal')"` on the
 *    nested "Join Beta" button becomes a real nested <button> whose handler
 *    calls e.stopPropagation() — the card itself stays keyboard-accessible.
 *  - Bootstrap grid (`row g-3`, `col-lg-6`, `col-md-4`, `col-lg-2 col-md-4
 *    col-6`) preserved verbatim.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ApiGovernanceModals from "../components/ApiGovernanceModals";
import { fetchApiGovernance, initialMockData } from "../data/apiGovernanceData";
import styles from "../styles/apiGovernance.module.css";

const s = styles as Record<string, string>;

export default function ApiGovernance() {
	const { data } = useQuery({
		queryKey: ["dev-api-governance-4-10"],
		queryFn: fetchApiGovernance,
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
							{c.pageCode} — {c.pageTitle}
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
								{a.counter ? (
									<span className={`${s.badge} ${s.badgeD}`}>{a.counter}</span>
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
								<i className={`bi ${a.icon}`} /> {a.label}
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
					{/* ================= HERO STATS ================= */}
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
									{c.hero.status} <span style={{ color: "#86efac" }}>●</span>
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

						{/* active versions */}
						<div className="col-lg-2 col-md-4 col-6">
							<div className={s.card} style={{ minHeight: 170 }}>
								<p className={s.sl} style={{ color: "var(--pm-info)" }}>
									{c.versionsCard.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.versionsCard.value}
								</div>
								<span className={`${s.badge} ${s.badgeI}`}>
									<i className="bi bi-diagram-2" /> {c.versionsCard.badge}
								</span>
								<div
									className="mt-3"
									style={{ fontSize: 11, color: "var(--pm-muted)" }}
								>
									{c.versionsCard.bars.map((b) => (
										<div key={b.label} className="mb-2">
											<div className="d-flex justify-content-between mb-1">
												<span>{b.label}</span>
												<span>{b.pct}%</span>
											</div>
											<div className={s.progress}>
												<div
													className={s.progressBar}
													style={{ width: `${b.pct}%`, background: b.color }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* governance compliance */}
						<div className="col-lg-3 col-md-4 col-6">
							<div className={s.card} style={{ minHeight: 170 }}>
								<p className={s.sl} style={{ color: "var(--pm-warning)" }}>
									{c.governanceCard.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.governanceCard.value}
								</div>
								<span className={`${s.badge} ${s.badgeS}`}>
									<i className="bi bi-shield-check" /> {c.governanceCard.badge}
								</span>
								<div
									className="mt-2"
									style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
								>
									{c.governanceCard.facts.map((f) => (
										<div
											key={f.label}
											className="d-flex justify-content-between mb-1 gap-2"
										>
											<span>{f.label}</span>
											<strong style={{ color: f.color }}>{f.value}</strong>
										</div>
									))}
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} w-100 mt-2`}
										onClick={() => open(c.governanceCard.modal)}
									>
										{c.governanceCard.actionLabel}
									</button>
								</div>
							</div>
						</div>

						{/* community feedback */}
						<div className="col-lg-3 col-md-4">
							<div
								className={s.card}
								style={{
									minHeight: 170,
									borderLeft: "3px solid var(--pm-purple)",
								}}
							>
								<p className={s.sl} style={{ color: "var(--pm-purple)" }}>
									{c.feedbackCard.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.feedbackCard.value}
								</div>
								<span className={`${s.badge} ${s.badgeP}`}>
									<i className="bi bi-chat-text" /> {c.feedbackCard.badge}
								</span>
								<div
									className="mt-2"
									style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
								>
									<div>
										Highest voted: <strong>{c.feedbackCard.topVoted}</strong>
									</div>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} w-100 mt-2`}
										onClick={() => open(c.feedbackCard.modal)}
									>
										{c.feedbackCard.actionLabel}
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* ============ 4.10.1 + 4.10.2 ============ */}
					<div className="row g-3">
						{/* --- 4.10.1 lifecycle --- */}
						<div className="col-lg-6">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<div>
										<h3 className={s.sectionTitle}>
											<i
												className="bi bi-arrow-repeat"
												style={{ color: "var(--pm-primary)" }}
											/>{" "}
											API Lifecycle & Versions
										</h3>
										<p className={s.sectionSub}>
											Manage version rollouts, deprecation policies, and
											backward compatibility.
										</p>
									</div>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("versionActionModal")}
									>
										<i className="bi bi-three-dots-vertical" /> Actions
									</button>
								</div>
								<div className={s.tableWrap}>
									<table className={`${s.table} ${s.versionTable}`}>
										<thead>
											<tr>
												<th>Version</th>
												<th>Status</th>
												<th>Adoption</th>
												<th>Sunset Date</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{c.versions.map((v) => (
												<tr key={v.version}>
													<td data-label="Version">
														<strong style={{ fontSize: 14 }}>
															{v.version}
														</strong>
														<div
															style={{ fontSize: 10, color: "var(--pm-muted)" }}
														>
															{v.sub}
														</div>
													</td>
													<td data-label="Status">
														<span className={`${s.badge} ${s[v.tone]}`}>
															{v.status}
														</span>
													</td>
													<td data-label="Adoption">
														<div
															className={s.progress}
															style={{ width: 50, display: "inline-flex" }}
														>
															<div
																className={s.progressBar}
																style={{
																	width: `${v.adoption}%`,
																	background: v.adoptionColor,
																}}
															/>
														</div>{" "}
														<span style={{ fontSize: 10 }}>{v.adoption}%</span>
													</td>
													<td data-label="Sunset Date">
														{v.sunsetDanger ? (
															<strong
																style={{
																	color: "var(--pm-danger)",
																	fontSize: 12,
																}}
															>
																{v.sunset}
															</strong>
														) : (
															v.sunset
														)}
													</td>
													<td data-label="Actions">
														<button
															type="button"
															className={`${s.btnPm} ${s.btnSm}`}
															onClick={() => open(v.modal)}
														>
															{v.actionLabel}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className="d-flex gap-2 mt-3 flex-wrap">
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} ${s.btnOutline}`}
										onClick={() => open("broadcastChangeModal")}
									>
										<i className="bi bi-broadcast" /> Notify Devs
									</button>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} ${s.btnOutline}`}
										onClick={() => open("migrationGuideModal")}
									>
										<i className="bi bi-journal-code" /> Migration Guides
									</button>
								</div>
							</div>
						</div>

						{/* --- 4.10.2 governance --- */}
						<div className="col-lg-6">
							<div className={`${s.card} h-100`}>
								<div className="mb-3">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-shield-check"
											style={{ color: "var(--pm-accent)" }}
										/>{" "}
										API Governance & Standards
									</h3>
									<p className={s.sectionSub}>
										Enforce REST principles, documentation quality, and
										performance targets.
									</p>
								</div>
								<div className="row g-2 mb-3">
									{c.govTiles.map((t) =>
										t.modal ? (
											<div className="col-6" key={t.label}>
												<button
													type="button"
													className={`${s.utilityBlock} ${s.tileBtn} text-center w-100`}
													style={{ padding: 12 }}
													onClick={() => open(t.modal as string)}
												>
													<div
														style={{
															fontSize: 11,
															color: "var(--pm-muted)",
															fontWeight: 700,
														}}
													>
														{t.label}
													</div>
													<div
														style={{
															fontSize: 20,
															fontWeight: 700,
															color: t.color,
														}}
													>
														{t.icon && <i className={`bi ${t.icon}`} />}{" "}
														{t.value}
													</div>
												</button>
											</div>
										) : (
											<div className="col-6" key={t.label}>
												<div
													className={`${s.utilityBlock} text-center`}
													style={{ padding: 12 }}
												>
													<div
														style={{
															fontSize: 11,
															color: "var(--pm-muted)",
															fontWeight: 700,
														}}
													>
														{t.label}
													</div>
													<div
														style={{
															fontSize: 20,
															fontWeight: 700,
															color: t.color,
														}}
													>
														{t.icon && <i className={`bi ${t.icon}`} />}{" "}
														{t.value}
													</div>
												</div>
											</div>
										),
									)}
								</div>
								<div className="d-flex gap-2 flex-wrap">
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("apiGovernanceAuditModal")}
									>
										View Audit Checklist
									</button>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("testAutomationConfigModal")}
									>
										Test Config
									</button>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("sdkGenerationModal")}
									>
										Generate SDKs
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* ============ 4.10.3 roadmap kanban ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-map"
										style={{ color: "var(--pm-warning)" }}
									/>{" "}
									Product Roadmap & Developer Feedback
								</h3>
								<p className={s.sectionSub}>
									Public tracking of planned API features, beta programs, and
									community voting.
								</p>
							</div>
							<div className="d-flex gap-2 flex-wrap">
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("featureListModal")}
								>
									<i className="bi bi-list-ul" /> All Requests
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
									onClick={() => open("submitFeatureModal")}
								>
									<i className="bi bi-plus-lg" /> Submit Idea
								</button>
							</div>
						</div>
						<div className="row g-3">
							{c.kanban.map((col) => (
								<div className="col-md-4" key={col.key}>
									<div className={s.kanbanCol}>
										<h6
											className={s.kanbanHead}
											style={{ borderBottomColor: col.accent }}
										>
											{col.title}
										</h6>
										{col.cards.map((card) => (
											<button
												key={card.title}
												type="button"
												className={s.roadmapCard}
												onClick={() => open(card.modal)}
											>
												<div className="d-flex justify-content-between gap-2">
													<strong>{card.title}</strong>
													<span
														className={`${s.badge} ${
															card.badgeTone
																? s[card.badgeTone]
																: s.badgeNeutral
														}`}
													>
														{card.votes !== undefined && (
															<i className="bi bi-arrow-up" />
														)}{" "}
														{card.badge}
													</span>
												</div>
												<div
													style={{
														fontSize: 11,
														color: "var(--pm-muted)",
														marginTop: 4,
													}}
												>
													{card.desc}
												</div>
												{card.progress !== undefined && (
													<div className={`${s.progress} mt-2`}>
														<div
															className={s.progressBar}
															style={{
																width: `${card.progress}%`,
																background: card.progressColor,
															}}
														/>
													</div>
												)}
												{card.joinBeta && (
													<button
														type="button"
														className={`${s.btnPm} ${s.btnSm} ${s.btnOutline} w-100 mt-2`}
														onClick={(e) => {
															e.stopPropagation();
															open("enrollBetaModal");
														}}
													>
														Join Beta
													</button>
												)}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 21 MODALS ================= */}
			<ApiGovernanceModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
