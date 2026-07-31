/* ============================================================================
 * 4.11 — Support, Escalation & SLAs
 *        (route: /dev-dashboard/support-slas)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: uploads/4.11.html (1,131 lines, 22 modals).
 *
 *  - The 4 hero cards, plan comparison table, severity blocks, SLA table and
 *    ticket list were repeated hand-written markup; all are `.map()` loops now.
 *  - `switchTab('supportTab', …)` becomes local React state driving the three
 *    plan tabs (Overview / Premium Benefits / Enterprise Add-ons).
 *  - The clickable `.ticket-item` divs become real <button>s so they are
 *    keyboard reachable, keeping the same hover treatment via CSS.
 *  - Bootstrap grid preserved verbatim.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SupportSlasModals from "../components/SupportSlasModals";
import { fetchSupportSlas, initialMockData } from "../data/supportSlasData";
import styles from "../styles/supportSlas.module.css";

const s = styles as Record<string, string>;

export default function SupportSlas() {
	const { data } = useQuery({
		queryKey: ["dev-support-slas-4-11"],
		queryFn: fetchSupportSlas,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [supportTab, setSupportTab] = useState<
		"overview" | "premium" | "enterprise"
	>("overview");
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
								<i className={`bi ${a.icon}`} style={{ color: a.iconColor }} />{" "}
								{a.label}
							</button>
						))}
						<button
							type="button"
							className={s.btnPm}
							onClick={() => open("manageSupportContactsModal")}
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
					{/* ================= HERO STATS ================= */}
					<div className="row g-3">
						{c.heroCards.map((h) => (
							<div className="col-lg-3 col-md-6" key={h.key}>
								<div
									className={`${s.card} h-100`}
									style={
										h.accentBorder
											? { borderLeft: `3px solid ${h.accentBorder}` }
											: undefined
									}
								>
									<p className={s.sl} style={{ color: h.labelColor }}>
										{h.label}
									</p>
									<div
										className={s.sv}
										style={{
											margin: "6px 0",
											fontSize: h.valueSize ?? 26,
											color: h.valueColor,
										}}
									>
										{h.value}
									</div>
									{h.badges && (
										<div className="d-flex flex-wrap gap-1 mt-2">
											{h.badges.map((b) => (
												<span
													key={b.text}
													className={`${s.badge} ${s[b.tone]}`}
												>
													{b.text}
												</span>
											))}
										</div>
									)}
									{h.note && (
										<div
											className="d-flex align-items-center gap-2 mt-2"
											style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
										>
											{h.noteIcon && (
												<i
													className={`bi ${h.noteIcon}`}
													style={{ color: h.noteIconColor }}
												/>
											)}
											{h.note}
										</div>
									)}
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} mt-3 w-100`}
										onClick={() => open(h.modal)}
									>
										{h.actionLabel}
									</button>
								</div>
							</div>
						))}
					</div>

					{/* ================= MAIN SECTIONS ================= */}
					<div className="row g-3">
						{/* ---------- 4.11.1 Technical Support ---------- */}
						<div className="col-lg-6">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-headset"
											style={{ color: "var(--pm-primary)" }}
										/>{" "}
										4.11.1 — Technical Support
									</h3>
									<div className="d-flex gap-2 flex-wrap">
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("chatSupportModal")}
										>
											<i className="bi bi-chat-dots" /> Live Chat
										</button>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("contactAmModal")}
										>
											<i className="bi bi-person-badge" /> Contact TAM
										</button>
									</div>
								</div>

								<div className={`${s.tabPills} mb-3`}>
									{(
										[
											["overview", "Plan Overview"],
											["premium", "Premium Benefits"],
											["enterprise", "Enterprise Add-ons"],
										] as const
									).map(([v, label]) => (
										<button
											key={v}
											type="button"
											className={`${s.tabPill} ${supportTab === v ? s.tabPillActive : ""}`}
											onClick={() => setSupportTab(v)}
										>
											{label}
										</button>
									))}
								</div>

								{supportTab === "overview" && (
									<>
										<div className={s.tableWrap}>
											<table className={s.table}>
												<thead>
													<tr>
														<th>Feature</th>
														<th>Standard</th>
														<th>
															<span className={`${s.badge} ${s.badgeP}`}>
																Premium (Current)
															</span>
														</th>
														<th>Enterprise</th>
													</tr>
												</thead>
												<tbody>
													{c.planRows.map((r) => (
														<tr key={r.feature}>
															<td data-label="Feature">{r.feature}</td>
															<td data-label="Standard">{r.standard}</td>
															<td data-label="Premium">
																<strong>{r.premium}</strong>
															</td>
															<td data-label="Enterprise">{r.enterprise}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
										<div className="mt-3 text-center">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm} ${s.btnOutline}`}
												onClick={() => open("upgradeTierModal")}
											>
												Compare All Plans
											</button>
										</div>
									</>
								)}

								{supportTab === "premium" && (
									<div className="row g-2">
										{c.premiumBenefits.map((b) => (
											<div
												className={b.full ? "col-12" : "col-md-6"}
												key={b.title}
											>
												<div
													className={`p-3 border rounded h-100 ${
														b.full
															? "d-flex justify-content-between align-items-center flex-wrap gap-2"
															: ""
													}`}
													style={{ background: "var(--pm-surface-2)" }}
												>
													<div>
														<h6 style={{ fontSize: 13, fontWeight: 700 }}>
															<i
																className={`bi ${b.icon}`}
																style={{ color: b.iconColor }}
															/>{" "}
															{b.title}
														</h6>
														<p
															style={{
																fontSize: 11,
																color: "var(--pm-muted)",
																marginBottom: b.full ? 0 : 8,
															}}
														>
															{b.desc || b.sub}
														</p>
													</div>
													<button
														type="button"
														className={`${s.btnPm} ${s.btnSm} ${b.full ? "" : "w-100"}`}
														onClick={() => open(b.modal)}
													>
														{b.actionLabel}
													</button>
												</div>
											</div>
										))}
									</div>
								)}

								{supportTab === "enterprise" && (
									<div
										className="p-3 border rounded text-center"
										style={{ background: "var(--pm-surface-2)" }}
									>
										<i
											className="bi bi-rocket-takeoff"
											style={{ fontSize: 24, color: "var(--pm-purple)" }}
										/>
										<h6 style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>
											Unlock Enterprise Features
										</h6>
										<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
											Upgrade to Enterprise to access 24/7 dedicated support,
											shared Slack channels, and on-site assistance.
										</p>
										<div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => open("slackIntegrationModal")}
											>
												<i className="bi bi-lock" /> Setup Slack
											</button>
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => open("onSiteSupportModal")}
											>
												<i className="bi bi-lock" /> On-Site Support
											</button>
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
												onClick={() => open("upgradeTierModal")}
											>
												Upgrade Now
											</button>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* ---------- 4.11.2 + 4.11.3 ---------- */}
						<div className="col-lg-6">
							{/* incident management */}
							<div className={`${s.card} mb-3`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-exclamation-triangle"
											style={{ color: "var(--pm-warning)" }}
										/>{" "}
										4.11.2 — Incident Management
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("escalationMatrixModal")}
									>
										<i className="bi bi-ladder" /> Escalation Matrix
									</button>
								</div>
								<div className="row g-2 mb-3">
									{c.sevBlocks.slice(0, 2).map((sv) => (
										<div className="col-md-6" key={sv.key}>
											<div className={`${s.sevBlock} ${s[sv.key]}`}>
												<div className="d-flex justify-content-between align-items-center gap-2">
													<strong style={{ fontSize: 12 }}>{sv.level}</strong>
													<span className={`${s.badge} ${s[sv.tone]}`}>
														{sv.sla}
													</span>
												</div>
												<p
													style={{
														fontSize: 11,
														margin: "4px 0 0",
														color: "var(--pm-muted)",
													}}
												>
													{sv.desc}
												</p>
											</div>
										</div>
									))}
								</div>
								<div className="d-flex gap-2 flex-wrap">
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} flex-fill`}
										onClick={() => open("declareIncidentModal")}
									>
										Declare Incident
									</button>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} flex-fill`}
										onClick={() => open("viewRcaModal")}
									>
										View Recent RCAs
									</button>
								</div>
							</div>

							{/* SLAs */}
							<div className={s.card}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-shield-check"
											style={{ color: "var(--pm-accent)" }}
										/>{" "}
										4.11.3 — Service Level Agreements
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("slaExclusionsModal")}
									>
										Exclusions
									</button>
								</div>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<tbody>
											{c.slaRows.map((r) => (
												<tr key={r.metric}>
													<td data-label="Metric">
														<strong>{r.metric}</strong>
													</td>
													<td data-label="Target">{r.target}</td>
													<td data-label="Actual">
														<span className={`${s.badge} ${s[r.tone]}`}>
															{r.actual}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className="d-flex gap-2 mt-3 flex-wrap">
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("uptimeCalcMethodologyModal")}
									>
										Uptime Methodology
									</button>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("maintenanceCalendarModal")}
									>
										Maintenance Calendar
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* ================= RECENT TICKETS ================= */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<h3 className={s.sectionTitle}>
								<i
									className="bi bi-ticket-detailed"
									style={{ color: "var(--pm-muted)" }}
								/>{" "}
								Recent Support Tickets
							</h3>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
								onClick={() => open("submitTicketModal")}
							>
								New Ticket
							</button>
						</div>
						{c.tickets.map((t) => (
							<button
								key={t.id}
								type="button"
								className={s.ticketItem}
								style={t.dim ? { opacity: 0.7 } : undefined}
								onClick={() => open("ticketDetailModal")}
							>
								<div style={{ minWidth: 0 }}>
									<div className="d-flex align-items-center gap-2 flex-wrap">
										<span className={`${s.badge} ${s[t.tone]}`}>
											{t.status}
										</span>
										<strong style={{ fontSize: 14 }}>
											[{t.id}] {t.title}
										</strong>
									</div>
									<div
										style={{
											fontSize: 11,
											color: "var(--pm-muted)",
											marginTop: 4,
										}}
									>
										{t.meta}
									</div>
								</div>
								<i
									className="bi bi-chevron-right"
									style={{ color: "var(--pm-muted)" }}
								/>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* ================= ALL 22 MODALS ================= */}
			<SupportSlasModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
