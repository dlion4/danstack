/* ============================================================================
 * API Reference & Documentation  (route: /dev-dashboard/api-reference)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: dev-dashboard/BAAS DEV✅/4.2.html (875 lines, 23 modals).
 *
 *  - Every endpoint row used to be a hand-written <div class="endpoint-row"
 *    onclick="openEndpointModal('POST /v1/...','Title','api-post')">. They are
 *    now three data-driven sections rendered with nested `.map()` loops; the
 *    click sets React state that the detail modal reads, replacing the legacy
 *    `document.getElementById('epPath').innerText = ...` DOM writes.
 *  - Bootstrap grid (`row g-3`, `col-lg-8` / `col-lg-4`, `col-lg-2 col-md-4
 *    col-6`) is preserved exactly so the two-column reference layout is intact.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ApiReferenceModals from "../components/ApiReferenceModals";
import type { Endpoint } from "../data/apiReferenceData";
import { fetchApiReference, initialMockData } from "../data/apiReferenceData";
import styles from "../styles/apiReference.module.css";

const s = styles as Record<string, string>;

const METHOD_CLASS: Record<string, string> = {
	GET: "apiGet",
	POST: "apiPost",
	PUT: "apiPut",
	DELETE: "apiDelete",
};

export default function ApiReference() {
	const { data } = useQuery({
		queryKey: ["dev-api-reference-4-2"],
		queryFn: fetchApiReference,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	/** Replaces the legacy `openEndpointModal(path,title,cls)` DOM injection. */
	const [endpoint, setEndpoint] = useState<Endpoint | null>(null);

	const open = (id: string) => setActiveModal(id);
	const openEndpoint = (e: Endpoint) => {
		setEndpoint(e);
		setActiveModal("endpointDetailModal");
	};

	useEffect(() => {
		if (!activeModal) return;
		const onKey = (ev: KeyboardEvent) => {
			if (ev.key === "Escape") setActiveModal(null);
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
					{/* ================= HERO STATS ROW ================= */}
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

						{/* Active apps */}
						<div className="col-lg-2 col-md-4 col-6">
							<div className={s.card} style={{ minHeight: 170 }}>
								<p className={s.sl} style={{ color: "var(--pm-info)" }}>
									{c.activeApps.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.activeApps.value}
								</div>
								<span className={`${s.badge} ${s.badgeI}`}>
									<i className="bi bi-check-circle" /> {c.activeApps.badge}
								</span>
								<div
									className="mt-3"
									style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
								>
									{c.activeApps.rows.map((r) => (
										<div
											key={r.name}
											className="d-flex justify-content-between mb-1 gap-2"
										>
											<span>{r.name}</span>
											<span
												style={{
													color:
														r.tone === "live"
															? "var(--pm-accent)"
															: "var(--pm-warning)",
													fontWeight: 600,
												}}
											>
												{r.status}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Error rate */}
						<div className="col-lg-3 col-md-4 col-6">
							<div className={s.card} style={{ minHeight: 170 }}>
								<p className={s.sl} style={{ color: "var(--pm-purple)" }}>
									{c.errorRate.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.errorRate.value}
								</div>
								<span className={`${s.badge} ${s.badgeS}`}>
									<i className="bi bi-graph-down-arrow" /> {c.errorRate.badge}
								</span>
								<div className="mt-2">
									<div
										className="d-flex justify-content-between"
										style={{ fontSize: 11, color: "var(--pm-muted)" }}
									>
										<span>{c.errorRate.meterLabel}</span>
										<span>{c.errorRate.meterValue}</span>
									</div>
									<div className={`${s.progress} mt-1`}>
										<div
											className={s.progressBar}
											style={{
												width: `${c.errorRate.pct}%`,
												background: "var(--pm-purple)",
											}}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Webhook delivery */}
						<div className="col-lg-3 col-md-4">
							<div
								className={s.card}
								style={{
									minHeight: 170,
									borderLeft: "3px solid var(--pm-warning)",
								}}
							>
								<p className={s.sl} style={{ color: "var(--pm-warning)" }}>
									{c.webhookHealth.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.webhookHealth.value}
								</div>
								<span className={`${s.badge} ${s.badgeW}`}>
									<i className="bi bi-exclamation-triangle" />{" "}
									{c.webhookHealth.badge}
								</span>
								<div
									className="mt-2"
									style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
								>
									{c.webhookHealth.facts.map((f) => (
										<div key={f.label}>
											{f.label}: <strong>{f.value}</strong>
										</div>
									))}
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} mt-2 w-100`}
									onClick={() => open(c.webhookHealth.modal)}
								>
									{c.webhookHealth.actionLabel}
								</button>
							</div>
						</div>
					</div>

					{/* ================= TWO-COLUMN BODY ================= */}
					<div className="row g-3">
						{/* ---------- left: endpoint sections ---------- */}
						<div className="col-lg-8">
							{c.sections.map((sec) => (
								<div key={sec.id} className={`${s.card} mb-3`}>
									<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
										<div>
											<h3 className={s.sectionTitle}>
												<i
													className={`bi ${sec.icon}`}
													style={{ color: sec.iconColor }}
												/>{" "}
												{sec.title}
											</h3>
											<p className={s.sectionSub}>{sec.sub}</p>
										</div>
										{sec.action && (
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => open(sec.action?.modal as string)}
											>
												<i className={`bi ${sec.action.icon}`} />{" "}
												{sec.action.label}
											</button>
										)}
									</div>
									<div className={s.apiBlock}>
										{sec.endpoints.map((e) => (
											<button
												key={e.path}
												type="button"
												className={s.endpointRow}
												onClick={() => openEndpoint(e)}
											>
												<div style={{ minWidth: 0 }}>
													<span
														className={`${s.apiMethod} ${s[METHOD_CLASS[e.method]]}`}
													>
														{e.method}
													</span>{" "}
													<code
														style={{ fontSize: 13, color: "var(--pm-ink)" }}
													>
														{e.path}
													</code>
													<div
														style={{
															fontSize: 11,
															color: "var(--pm-muted)",
															marginTop: 4,
														}}
													>
														{e.desc}
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
							))}
						</div>

						{/* ---------- right: tools, logs, support ---------- */}
						<div className="col-lg-4">
							<div className={`${s.card} mb-3`}>
								<h3 className={`${s.sectionTitle} mb-3`}>Quick Tools</h3>
								<div className={s.quickActionGrid}>
									{c.quickTools.map((q) => (
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

							<div className={`${s.card} mb-3`}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={s.sectionTitle}>Recent API Logs</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("apiLogsModal")}
									>
										View all
									</button>
								</div>
								{c.recentLogs.map((l) => (
									<div key={`${l.code}-${l.title}`} className={s.feedItem}>
										<div
											className={s.iconCircle}
											style={{
												background: l.codeBg,
												color: l.codeColor,
												fontSize: 12,
											}}
										>
											{l.code}
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													fontWeight: 600,
													fontSize: 13,
													overflowWrap: "anywhere",
												}}
											>
												{l.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{l.sub}
											</div>
										</div>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open(l.modal)}
										>
											Inspect
										</button>
									</div>
								))}
							</div>

							<div className={s.card}>
								<h3 className={`${s.sectionTitle} mb-2`}>{c.support.title}</h3>
								<p style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}>
									{c.support.blurb}
								</p>
								<div className="d-flex flex-column gap-2 mt-3">
									{c.support.actions.map((a) => (
										<button
											key={a.label}
											type="button"
											className={`${s.btnPm} w-100`}
											onClick={() => open(a.modal)}
										>
											<i
												className={`bi ${a.icon}`}
												style={{ color: a.color }}
											/>{" "}
											{a.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 23 MODALS ================= */}
			<ApiReferenceModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
				endpoint={endpoint}
			/>
		</div>
	);
}
