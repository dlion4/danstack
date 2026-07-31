/* ============================================================================
 * Webhooks, Events & Real-Time Integration
 *       (route: /dev-dashboard/webhooks-events)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: dev-dashboard/BAAS DEV✅/4.3.html (2,267 lines — the largest
 * of the three, 845 lines of CSS and 23 modals).
 *
 * Notable conversions:
 *  - The quick-action tiles used inline `onmouseover="this.style.borderColor=…"`
 *    handlers. Those are now a real CSS `:hover` rule (`.tileBtn:hover`), which
 *    is both cheaper and keeps hover colour correct on touch/mobile.
 *  - The SSE console was a static block of coloured spans; it is now driven by
 *    `content.sse.lines` and given a ref-scoped effect that keeps the view
 *    pinned to the newest line — the one place real DOM access is warranted,
 *    and it is sandboxed inside useRef + useEffect per the architecture rules.
 *  - The external Kafka/AWS logos are kept, with an onError fallback to a
 *    Bootstrap icon so a blocked CDN can never render a broken image.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import WebhooksEventsModals from "../components/WebhooksEventsModals";
import {
	fetchWebhooksEvents,
	initialMockData,
} from "../data/webhooksEventsData";
import styles from "../styles/webhooksEvents.module.css";

const s = styles as Record<string, string>;

export default function WebhooksEvents() {
	const { data } = useQuery({
		queryKey: ["dev-webhooks-events-4-3"],
		queryFn: fetchWebhooksEvents,
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

	/* ---------------------------------------------------------------------
	 * LEGACY BRIDGE — the live SSE console.
	 * The original page painted stream lines straight into the DOM. Here the
	 * lines are React-rendered from data, and this ref-scoped effect performs
	 * the one imperative behaviour that genuinely needs a node: auto-scrolling
	 * to the newest line. Scoped to the ref, cleaned up on unmount, no global
	 * selectors — DOM mutation stays inside its sandbox.
	 * ------------------------------------------------------------------- */
	const streamRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const node = streamRef.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	}, []);

	/** External logo with a guaranteed non-broken fallback. */
	const [logoFailed, setLogoFailed] = useState<Record<string, boolean>>({});

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
									background: "var(--pm-gradient-slate)",
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
						{c.heroStats.map((st) => (
							<div key={st.key} className={st.col}>
								<div
									className={st.variant === "code" ? s.cardCode : s.card}
									style={{
										minHeight: 140,
										...(st.key === "subs"
											? { borderLeft: "3px solid var(--pm-primary)" }
											: {}),
									}}
								>
									<p
										className={st.variant === "code" ? undefined : s.sl}
										style={
											st.variant === "code"
												? {
														margin: 0,
														fontSize: 11,
														color: "var(--pm-muted)",
														textTransform: "uppercase",
														letterSpacing: "0.05em",
													}
												: { color: st.labelColor }
										}
									>
										{st.label}
									</p>
									<div
										className={s.sv}
										style={{
											margin: "6px 0",
											...(st.variant === "code" ? { color: "#fff" } : {}),
										}}
									>
										{st.value}
									</div>

									{st.badge && (
										<span
											className={`${s.badge} ${
												st.badge.tone !== "custom" ? s[st.badge.tone] : ""
											}`}
											style={
												st.badge.tone === "custom"
													? { background: st.badge.bg, color: st.badge.color }
													: undefined
											}
										>
											{st.badge.icon && <i className={`bi ${st.badge.icon}`} />}{" "}
											{st.badge.text}
										</span>
									)}

									{st.live && (
										<div
											className="mt-3 d-flex align-items-center gap-2"
											style={{ fontSize: 12, color: "var(--pm-muted)" }}
										>
											<span className={s.blinkingDot} /> {st.live}
										</div>
									)}

									{st.meter && (
										<>
											<div className={`${s.progress} mt-2 mb-2`}>
												<div
													className={s.progressBar}
													style={{
														width: `${st.meter.pct}%`,
														background: st.meter.color,
													}}
												/>
											</div>
											<div
												className="d-flex justify-content-between flex-wrap"
												style={{
													fontSize: 11,
													color: "var(--pm-muted)",
													gap: 8,
												}}
											>
												<span>{st.meter.left}</span>
												<span>{st.meter.right}</span>
											</div>
										</>
									)}

									{st.note && (
										<div
											className="mt-2"
											style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}
										>
											{st.note.text}
											<br />
											{st.note.linkLabel && st.note.modal && (
												<button
													type="button"
													style={{
														border: "none",
														background: "none",
														padding: 0,
														color: "var(--pm-primary)",
														cursor: "pointer",
														fontSize: 11,
														fontWeight: 600,
													}}
													onClick={() => open(st.note?.modal as string)}
												>
													{st.note.linkLabel}
												</button>
											)}
										</div>
									)}

									{st.chips && (
										<div className="mt-2 d-flex flex-wrap gap-1">
											{st.chips.map((chip) => (
												<span
													key={chip}
													className={`${s.badge} ${s.badgeNeutral}`}
												>
													{chip}
												</span>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ================= ATTENTION & QUICK ACTIONS ================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={s.sectionTitle}>Attention & Alerts</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("webhooksNotifModal")}
									>
										All Alerts
									</button>
								</div>
								{c.attention.map((a) => (
									<div key={a.tag} className={s.feedItem}>
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
											<div
												style={{
													fontSize: 11,
													color: "var(--pm-muted)",
													overflowWrap: "anywhere",
												}}
											>
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

						<div className="col-lg-8">
							<div className={`${s.card} h-100`}>
								<div className="mb-3">
									<h3 className={s.sectionTitle}>Developer Quick Actions</h3>
									<p className={s.sectionSub}>
										Frequent integration and debugging workflows
									</p>
								</div>
								<div className="row g-2">
									{c.quickTiles.map((t) => (
										<div className="col-md-3 col-6" key={t.label}>
											<button
												type="button"
												className={s.tileBtn}
												onClick={() => open(t.modal)}
											>
												<i
													className={`bi ${t.icon} d-block mb-2`}
													style={{ fontSize: 20, color: t.color }}
												/>
												<strong style={{ fontSize: 12 }}>{t.label}</strong>
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ============ Webhook Configuration & Delivery Logs ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-link-45deg"
										style={{ color: "var(--pm-primary)" }}
									/>{" "}
									Webhook Configuration & Delivery Logs
								</h3>
								<p className={s.sectionSub}>
									Manage endpoint URLs, event subscriptions, payload delivery,
									and view real-time HTTP response logs.
								</p>
							</div>
							<div className="d-flex gap-2 flex-wrap">
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("exportLogsModal")}
								>
									<i className="bi bi-download" /> Export Logs
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
									onClick={() => open("addEndpointModal")}
								>
									<i className="bi bi-plus-lg" /> Add Webhook
								</button>
							</div>
						</div>

						<div className="row g-3">
							{/* registered endpoints */}
							<div className="col-lg-6">
								<div
									className="p-3 rounded h-100"
									style={{ background: "var(--pm-surface-2)" }}
								>
									<h4
										style={{
											fontSize: 14,
											fontWeight: 700,
											margin: "0 0 12px",
										}}
									>
										Registered Endpoints
									</h4>
									{c.endpoints.map((e) => (
										<div key={e.url} className={s.statusRow}>
											<div style={{ minWidth: 0, flex: 1 }}>
												<div className="d-flex align-items-center gap-2 flex-wrap">
													<strong>{e.name}</strong>
													<span className={`${s.badge} ${s[e.tone]}`}>
														{e.status}
													</span>
												</div>
												<div
													style={{
														fontSize: 11,
														color: "var(--pm-muted)",
														fontFamily: "var(--pm-font-mono)",
														margin: "4px 0",
														overflowWrap: "anywhere",
													}}
												>
													{e.url}
												</div>
												<div
													style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}
												>
													<i
														className={`bi ${e.metaIcon}`}
														style={{ color: e.metaIconColor }}
													/>{" "}
													{e.meta}
												</div>
											</div>
											<div className="d-flex flex-column gap-1">
												{e.actions.map((a) => (
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
										</div>
									))}
								</div>
							</div>

							{/* delivery logs */}
							<div className="col-lg-6">
								<div
									className="p-3 rounded h-100"
									style={{ background: "var(--pm-surface-2)" }}
								>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
											Recent Delivery Logs
										</h4>
										<button
											type="button"
											style={{
												border: "none",
												background: "none",
												fontSize: 12,
												color: "var(--pm-primary)",
												cursor: "pointer",
												fontWeight: 600,
											}}
											onClick={() => open("searchEventsModal")}
										>
											View all logs <i className="bi bi-arrow-right" />
										</button>
									</div>
									<div className={s.tableWrap}>
										<table className={s.table}>
											<thead>
												<tr>
													<th>Event ID / Type</th>
													<th>Status</th>
													<th>Latency</th>
													<th>Action</th>
												</tr>
											</thead>
											<tbody>
												{c.deliveryLogs.map((l) => (
													<tr key={l.eventId}>
														<td data-label="Event">
															<div
																style={{
																	fontFamily: "var(--pm-font-mono)",
																	fontSize: 11,
																}}
															>
																{l.eventId}
															</div>
															<div
																style={{
																	fontSize: 11,
																	color: "var(--pm-muted)",
																}}
															>
																{l.type}
															</div>
														</td>
														<td data-label="Status">
															<span className={`${s.badge} ${s[l.tone]}`}>
																{l.status}
															</span>
														</td>
														<td data-label="Latency">{l.latency}</td>
														<td data-label="Action">
															<button
																type="button"
																className={`${s.btnPm} ${s.btnSm}`}
																onClick={() => open(l.modal)}
															>
																Payload
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
					</div>

					{/* ============ Event Streaming & Message Queues ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-hdd-network"
										style={{ color: "var(--pm-accent)" }}
									/>{" "}
									Event Streaming & Message Queues
								</h3>
								<p className={s.sectionSub}>
									Connect directly to enterprise message buses (Kafka/SQS) and
									manage Server-Sent Events (SSE) for high-throughput streaming.
								</p>
							</div>
						</div>

						<div className="row g-3">
							{c.streams.map((st) => (
								<div className="col-lg-4" key={st.kind}>
									<div
										className="p-4 rounded border text-center h-100"
										style={{
											background: "#fff",
											borderColor: "var(--pm-border)",
										}}
									>
										{logoFailed[st.kind] ? (
											<i
												className={`bi ${
													st.kind === "kafka" ? "bi-diagram-3" : "bi-cloud"
												} d-block mb-3`}
												style={{ fontSize: 34, color: "var(--pm-primary)" }}
											/>
										) : (
											<img
												src={st.logo}
												height={st.logoHeight}
												alt={st.alt}
												className={`${s.brandLogo} mb-3`}
												onError={() =>
													setLogoFailed((p) => ({ ...p, [st.kind]: true }))
												}
											/>
										)}
										<h4 style={{ fontSize: 15, fontWeight: 700 }}>
											{st.title}
										</h4>
										<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
											{st.desc}
										</p>
										<div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
											<span className={`${s.badge} ${s[st.statusTone]}`}>
												{st.status}
											</span>
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm} ${
													st.actionPrimary ? s.btnPmP : ""
												}`}
												onClick={() => open(st.modal)}
											>
												{st.actionLabel}
											</button>
										</div>
									</div>
								</div>
							))}

							{/* SSE live stream */}
							<div className="col-lg-4">
								<div className={`${s.cardCode} h-100`}>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<h4
											style={{
												fontSize: 14,
												fontWeight: 700,
												margin: 0,
												color: "#fff",
											}}
										>
											<i className="bi bi-broadcast me-2" />
											SSE Live Stream
										</h4>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											style={{
												background: "rgba(255,255,255,0.1)",
												color: "#fff",
												border: "none",
											}}
											onClick={() => open("sseSettingsModal")}
											aria-label="SSE settings"
										>
											<i className="bi bi-gear" />
										</button>
									</div>
									<div
										ref={streamRef}
										className={s.codeBlock}
										style={{ height: 120, background: "#000", border: "none" }}
									>
										<span className={s.streamLine} style={{ color: "#10B981" }}>
											Connected to {c.sse.endpoint}
										</span>
										{c.sse.lines.map((l) => (
											<span key={l.time} className={s.streamLine}>
												<span style={{ color: "#60A5FA" }}>[{l.time}]</span>{" "}
												{l.text}
											</span>
										))}
										<span className={s.blinkingDot} />
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ============ Idempotency, Reliability & DLQ ============ */}
					<div className={s.card}>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-shield-check"
										style={{ color: "var(--pm-warning)" }}
									/>{" "}
									Idempotency, Reliability & Dead Letter Queue (DLQ)
								</h3>
								<p className={s.sectionSub}>
									Configure retry patterns, manage exactly-once delivery
									guarantees, and recover permanently failed payloads.
								</p>
							</div>
							<div className="d-flex gap-2 flex-wrap">
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("idempotencySettingsModal")}
								>
									<i className="bi bi-sliders" /> Idempotency Rules
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
									onClick={() => open("dlqManagerModal")}
								>
									<i className="bi bi-envelope-x" /> Open DLQ Manager
								</button>
							</div>
						</div>

						<div className="row g-3">
							{c.reliability.map((r) => (
								<div className="col-lg-3 col-6" key={r.label}>
									<div
										className="p-3 rounded border text-center"
										style={{ background: "#fff" }}
									>
										<div
											style={{
												fontSize: 11,
												fontWeight: 600,
												color: "var(--pm-muted)",
											}}
										>
											{r.label}
										</div>
										<div
											style={{
												fontSize: 24,
												fontWeight: 700,
												color: r.valueColor,
											}}
										>
											{r.value}
										</div>
										<div style={{ fontSize: 11, color: r.subColor }}>
											{r.sub}
										</div>
									</div>
								</div>
							))}

							<div className="col-lg-6">
								<div
									className="p-3 rounded h-100"
									style={{ background: "var(--pm-surface-2)" }}
								>
									<h4
										style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}
									>
										Retry Policy Details
									</h4>
									<p
										style={{
											fontSize: 12,
											color: "var(--pm-ink-soft)",
											marginBottom: 8,
										}}
									>
										{c.retryBlurb}
									</p>
									<div className={s.retryChain}>
										{c.retryChain.map((step, i) => (
											<span
												key={step}
												className="d-inline-flex align-items-center gap-1"
											>
												<span
													className={`${s.retryChip} ${
														i === c.retryChain.length - 1 ? s.retryChipEnd : ""
													}`}
												>
													{step}
												</span>
												{i < c.retryChain.length - 1 && <span>➔</span>}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 23 MODALS ================= */}
			<WebhooksEventsModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
