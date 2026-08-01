/* ============================================================================
 * Developer Dashboard  (route: /dev-dashboard/dashboard)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: dev-dashboard/BAAS DEV✅/4.1.html (791 lines of HTML + inline
 * CSS + vanilla JS driving 21 Bootstrap modals).
 *
 * WHAT CHANGED (and what deliberately did not)
 *  - Layout: every Bootstrap grid class (`row g-3`, `col-lg-4`, `col-md-4 col-6`
 *    …) is preserved exactly, so the visual composition is unchanged.
 *  - class= -> className=, style="a:b" -> style={{ a: "b" }}.
 *  - All repeating hardcoded blocks (stat cards, attention feed, snippets,
 *    quick actions, key rows, team rows, log rows) now come from
 *    `initialMockData` via TanStack Query and render through `.map()`.
 *  - The page-level chrome (fixed sidebar + header) is NOT re-implemented here:
 *    it is the shared DevShell this route renders inside, exactly like the
 *    utility deep-dive pages. The legacy in-page env-toggle and header buttons
 *    are kept in the page bar so no functionality is lost.
 *  - Vanilla JS is bridged: openModal -> setActiveModal, switchTab -> useState,
 *    toggleEnv -> React state that still pops the Go-Live checklist on LIVE.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import DeveloperDashboardModals from "../components/DeveloperDashboardModals";
import {
	fetchDeveloperDashboard,
	initialMockData,
} from "../data/developerDashboardData";
import styles from "../styles/developerDashboard.module.css";

const s = styles as Record<string, string>;

export default function DeveloperDashboard() {
	const { data } = useQuery({
		queryKey: ["dev-dashboard-4-1"],
		queryFn: fetchDeveloperDashboard,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [snippetTab, setSnippetTab] = useState(c.snippets[0]?.key ?? "curl");
	const [env, setEnv] = useState<"test" | "live">("test");
	const open = (id: string) => setActiveModal(id);

	/* ---------------------------------------------------------------------
	 * LEGACY BRIDGE — toggleEnv('live', btn)
	 * The original snapped the pill back to TEST and popped the checklist after
	 * 200ms. Same behaviour, expressed as an effect on the env state.
	 * ------------------------------------------------------------------- */
	useEffect(() => {
		if (env !== "live") return;
		const t = window.setTimeout(() => {
			open("goLiveChecklistModal");
			setEnv("test");
		}, 200);
		return () => window.clearTimeout(t);
	}, [env]);

	/* ---------------------------------------------------------------------
	 * LEGACY BRIDGE — Escape closes the topmost modal (Bootstrap did this for
	 * free). Kept in a ref-free effect because it is a window-level listener.
	 * ------------------------------------------------------------------- */
	useEffect(() => {
		if (!activeModal) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setActiveModal(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [activeModal]);

	/* ---------------------------------------------------------------------
	 * LEGACY BRIDGE — the one genuinely imperative bit on this page.
	 * `showLoading(target, cb)` used to appendChild an overlay into a live DOM
	 * node. Modal loading is now declarative, but the hero card still gets a
	 * scoped ref so any future imperative widget (charts, canvas sparklines)
	 * mounts inside a sandbox instead of touching document.getElementById.
	 * ------------------------------------------------------------------- */
	const heroRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const node = heroRef.current;
		if (!node) return;
		node.dataset.env = env;
		return () => {
			delete node.dataset.env;
		};
	}, [env]);

	const activeSnippet =
		c.snippets.find((x) => x.key === snippetTab) ?? c.snippets[0];

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
						{/* env toggle (legacy .env-toggle) */}
						<div className={s.envToggle}>
							<button
								type="button"
								className={`${s.envBtn} ${env === "test" ? s.envBtnActive : ""}`}
								onClick={() => setEnv("test")}
							>
								TEST
							</button>
							<button
								type="button"
								className={`${s.envBtn} ${s.envBtnLive} ${env === "live" ? s.envBtnActive : ""
									}`}
								onClick={() => setEnv("live")}
							>
								LIVE
							</button>
						</div>
						{c.header.actions.map((a) => (
							<button
								key={a.modal}
								type="button"
								className={s.btnPm}
								title={a.title}
								onClick={() => open(a.modal)}
								style={{ position: "relative" }}
							>
								<i className={`bi ${a.icon}`} style={{ color: a.color }} />
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
							onClick={() => open("devProfileModal")}
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
						<div className="col-lg-4">
							<div
								ref={heroRef}
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
									{c.hero.projectLabel}{" "}
									<strong style={{ color: "#fff" }}>
										{c.hero.projectName}
									</strong>{" "}
									<span className="ms-2" style={{ color: "#fcd34d" }}>
										{c.hero.modeLabel}
									</span>
								</p>
								<div
									className={s.sv}
									style={{ margin: "8px 0", color: "#fff" }}
								>
									{c.hero.value}{" "}
									<span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>
										{c.hero.valueUnit}
									</span>
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

						{c.statCards.map((st) => (
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
													// biome-ignore lint/suspicious/noArrayIndexKey: static decorative sparkline
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
													{f.label}: <strong>{f.value}</strong>{" "}
													{f.modal && f.actionLabel && (
														<button
															type="button"
															className={`${s.btnPm} ${s.btnSm} ms-1`}
															style={{ padding: "2px 8px", fontSize: 10 }}
															onClick={() => open(f.modal as string)}
														>
															{f.actionLabel}
														</button>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ================= MAIN GRID ================= */}
					<div className="row g-3">
						{/* Requires Attention */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={s.sectionTitle}>Requires Attention</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("apiAlertsModal")}
									>
										View all
									</button>
								</div>
								{c.attention.map((f) => (
									<div key={f.id} className={s.feedItem}>
										<div
											className={s.iconCircle}
											style={{
												background: f.iconBg,
												color: f.iconColor,
												fontSize: 12,
											}}
										>
											<i className={`bi ${f.icon}`} />
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{f.title}
											</div>
											<div
												style={{
													fontSize: 11,
													color: "var(--pm-muted)",
													overflowWrap: "anywhere",
												}}
											>
												{f.sub}
											</div>
										</div>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm} ${f.primary ? s.btnPmP : ""}`}
											onClick={() => open(f.modal)}
										>
											{f.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Integration Quickstart */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={s.sectionTitle}>Integration Quickstart</h3>
									<span className={`${s.badge} ${s.badgeP}`}>
										<i className="bi bi-code" />
									</span>
								</div>
								<p
									style={{
										fontSize: 12,
										color: "var(--pm-ink-soft)",
										marginTop: -8,
										marginBottom: 12,
									}}
								>
									Get started quickly with PayMo SDKs.
								</p>
								<div className={`${s.tabPills} mb-2`}>
									{c.snippets.map((sn) => (
										<button
											key={sn.key}
											type="button"
											className={`${s.tabPill} ${snippetTab === sn.key ? s.tabPillActive : ""
												}`}
											onClick={() => setSnippetTab(sn.key)}
										>
											{sn.label}
										</button>
									))}
								</div>
								<div className={s.codeBlock} style={{ minHeight: 190 }}>
									<button
										type="button"
										className={s.copyBtn}
										onClick={() => open("copySnippetModal")}
									>
										<i className="bi bi-clipboard" /> Copy
									</button>
									{activeSnippet?.code}
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} w-100 mt-2`}
									onClick={() => open("sdkDownloadModal")}
								>
									<i className="bi bi-download" /> Download Full SDKs
								</button>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="mb-3">
									<h3 className={s.sectionTitle}>Quick Actions</h3>
									<p className={s.sectionSub}>Developer tools & settings</p>
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

					{/* ============ API Keys & Authentication ============ */}
					<div className={s.card}>
						<div
							className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
							style={{ gap: 8 }}
						>
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-key-fill"
										style={{ color: "var(--pm-warning)" }}
									/>{" "}
									API Keys & Authentication
								</h3>
								<p className={s.sectionSub}>
									Manage your secret and publishable keys for environments.
									Never share your secret keys.
								</p>
							</div>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
								onClick={() => open("generateKeyModal")}
							>
								<i className="bi bi-plus-lg" /> Create Key
							</button>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Key Name / Environment</th>
										<th>Key Token</th>
										<th>Created</th>
										<th>Last Used</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{c.apiKeys.map((k) => (
										<tr key={k.name}>
											<td data-label="Key Name">
												<div>
													<strong>{k.name}</strong>
												</div>
												<span
													className={s.badge}
													style={{
														background:
															k.envTone === "live"
																? "var(--pm-accent-soft)"
																: "var(--pm-warning-soft)",
														color: k.envTone === "live" ? "#047857" : "#B45309",
														fontSize: 9,
													}}
												>
													{k.envTag}
												</span>
											</td>
											<td data-label="Key Token">
												<code>{k.token}</code>
											</td>
											<td data-label="Created">{k.created}</td>
											<td data-label="Last Used">{k.lastUsed}</td>
											<td data-label="Status">
												<span className={`${s.badge} ${s[k.statusTone]}`}>
													{k.status}
												</span>
											</td>
											<td data-label="Actions">
												<button
													type="button"
													className={`${s.btnPm} ${s.btnSm}`}
													onClick={() => open(k.modal)}
												>
													{k.actionLabel}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* ============ Project Team & Access ============ */}
					<div className={s.card}>
						<div
							className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
							style={{ gap: 8 }}
						>
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-people-fill"
										style={{ color: "var(--pm-info)" }}
									/>{" "}
									Project Team & Access Control
								</h3>
								<p className={s.sectionSub}>
									Manage developers, admins, and support staff access to this
									project.
								</p>
							</div>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnSm}`}
								onClick={() => open("projectTeamModal")}
							>
								<i className="bi bi-person-plus" /> Invite Member
							</button>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>User</th>
										<th>Email</th>
										<th>Role</th>
										<th>MFA Status</th>
										<th>Last Login</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{c.team.map((t) => (
										<tr key={t.email}>
											<td data-label="User">
												<div className="d-flex align-items-center gap-2 justify-content-end justify-content-md-start">
													<div
														className={s.iconCircle}
														style={{
															width: 24,
															height: 24,
															minWidth: 24,
															fontSize: 10,
															background:
																t.avatarBg ?? "var(--pm-gradient-hero)",
															color: "#fff",
														}}
													>
														{t.initials}
													</div>
													<strong>{t.name}</strong>
												</div>
											</td>
											<td data-label="Email">{t.email}</td>
											<td data-label="Role">
												<span className={`${s.badge} ${s[t.roleTone]}`}>
													{t.role}
												</span>
											</td>
											<td data-label="MFA Status">
												<span className={`${s.badge} ${s[t.mfaTone]}`}>
													{t.mfaIcon && <i className={`bi ${t.mfaIcon}`} />}{" "}
													{t.mfa}
												</span>
											</td>
											<td data-label="Last Login">{t.lastLogin}</td>
											<td data-label="Actions">
												{t.editable ? (
													<button
														type="button"
														className={`${s.btnPm} ${s.btnSm}`}
														onClick={() => open("memberAccessModal")}
													>
														Edit
													</button>
												) : (
													"—"
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* ============ Integration Status & Recent Logs ============ */}
					<div className={s.card}>
						<div
							className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
							style={{ gap: 8 }}
						>
							<div>
								<h3 className={s.sectionTitle}>
									<i
										className="bi bi-terminal-fill"
										style={{ color: "var(--pm-accent)" }}
									/>{" "}
									Integration Status & Recent Logs
								</h3>
								<p className={s.sectionSub}>
									Real-time view of API requests, responses, and webhook
									deliveries.
								</p>
							</div>
							<div className="d-flex gap-2 flex-wrap">
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("webhookLogsModal")}
								>
									<i className="bi bi-broadcast" /> Webhooks
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => open("apiLogsModal")}
								>
									<i className="bi bi-list" /> Full Logs
								</button>
							</div>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Method / Endpoint</th>
										<th>Status</th>
										<th>Time</th>
										<th>IP Address</th>
										<th>Latency</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{c.logs.map((l) => (
										<tr key={`${l.method}-${l.endpoint}-${l.time}`}>
											<td data-label="Method / Endpoint">
												<span className={`${s.badge} ${s[l.methodTone]}`}>
													{l.method}
												</span>{" "}
												<code>{l.endpoint}</code>
											</td>
											<td data-label="Status">
												<span className={`${s.badge} ${s[l.statusTone]}`}>
													{l.status}
												</span>
											</td>
											<td data-label="Time">{l.time}</td>
											<td data-label="IP Address">{l.ip}</td>
											<td data-label="Latency">{l.latency}</td>
											<td data-label="Action">
												<button
													type="button"
													className={`${s.btnPm} ${s.btnSm}`}
													onClick={() => open(l.modal)}
												>
													Inspect
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

			{/* ================= ALL 21 MODALS ================= */}
			<DeveloperDashboardModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
