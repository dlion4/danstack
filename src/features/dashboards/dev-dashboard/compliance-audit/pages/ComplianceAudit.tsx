/* ============================================================================
 * Compliance, Audit & Regulatory Integration
 *        (route: /dev-dashboard/compliance-audit)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: uploads/4.12.html (1,064 lines, 23 modals).
 *
 *  - The three regulatory tabs (CBK/AML, KRA, ODPC) each held hand-written
 *    endpoint cards; they are now one `regTabs` array rendered with nested
 *    `.map()` loops.
 *  - `openModal('apiEndpointModal', 'cbkLarge')` + `mapEndpointContent(arg)`
 *    (which rewrote #apiModalTitle / #apiModalUrl / #apiModalMethod via the
 *    DOM) is replaced by React state holding the selected Endpoint object.
 *  - Endpoint cards become real <button>s so they are keyboard reachable.
 *  - Bootstrap grid (`row g-3`, `col-lg-8` / `col-lg-4`, `col-lg-3 col-md-6`)
 *    preserved verbatim.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ComplianceAuditModals from "../components/ComplianceAuditModals";
import type { Endpoint } from "../data/complianceAuditData";
import {
	fetchComplianceAudit,
	initialMockData,
} from "../data/complianceAuditData";
import styles from "../styles/complianceAudit.module.css";

const s = styles as Record<string, string>;

const METHOD_CLASS: Record<string, string> = {
	GET: "apiGet",
	POST: "apiPost",
	PUT: "apiPut",
	DEL: "apiDel",
};

export default function ComplianceAudit() {
	const { data } = useQuery({
		queryKey: ["dev-compliance-audit-4-12"],
		queryFn: fetchComplianceAudit,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [regTab, setRegTab] = useState(c.regTabs[0]?.key ?? "cbk");
	/** Replaces the legacy `mapEndpointContent(extraArg)` DOM rewrite. */
	const [endpoint, setEndpoint] = useState<Endpoint | null>(null);

	const open = (id: string) => setActiveModal(id);
	const openEndpoint = (e: Endpoint) => {
		if (e.modal) {
			setActiveModal(e.modal);
			return;
		}
		setEndpoint(e);
		setActiveModal("apiEndpointModal");
	};

	useEffect(() => {
		if (!activeModal) return;
		const onKey = (ev: KeyboardEvent) => {
			if (ev.key === "Escape") setActiveModal(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [activeModal]);

	const tab = c.regTabs.find((t) => t.key === regTab) ?? c.regTabs[0];

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
							onClick={() => open("devProfileModal")}
						>
							<span
								className={s.iconCircle}
								style={{
									width: 24,
									height: 24,
									minWidth: 24,
									fontSize: 10,
									background: "#1E293B",
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
									className={`${s.card} ${h.dark ? s.cardDark : ""}`}
									style={{
										minHeight: 140,
										...(h.accentBorder
											? { borderLeft: `4px solid ${h.accentBorder}` }
											: {}),
									}}
								>
									<p
										className={s.sl}
										style={{
											color: h.dark ? "rgba(255,255,255,0.7)" : h.labelColor,
										}}
									>
										{h.label}
									</p>
									<div
										className={s.sv}
										style={{
											margin: "6px 0",
											color: h.dark
												? "#fff"
												: (h.valueColor ?? "var(--pm-ink)"),
										}}
									>
										{h.value}
									</div>
									<span className={`${s.badge} ${s[h.badge.tone]}`}>
										<i className={`bi ${h.badge.icon}`} /> {h.badge.text}
									</span>
									{h.note && (
										<div
											style={{
												fontSize: 11,
												color: "var(--pm-muted)",
												marginTop: 8,
											}}
										>
											{h.note}
										</div>
									)}
									{h.meter && (
										<div className={`${s.progress} mt-2`}>
											<div
												className={s.progressBar}
												style={{
													width: `${h.meter.pct}%`,
													background: h.meter.color,
												}}
											/>
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ================= 4.12.1 + Quick Tools ================= */}
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-bank"
											style={{ color: "var(--pm-primary)" }}
										/>{" "}
										Regulatory Reporting APIs
									</h3>
									<div className={s.tabPills}>
										{c.regTabs.map((t) => (
											<button
												key={t.key}
												type="button"
												className={`${s.tabPill} ${regTab === t.key ? s.tabPillActive : ""}`}
												onClick={() => setRegTab(t.key)}
											>
												{t.label}
											</button>
										))}
									</div>
								</div>

								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									{tab?.blurb}
								</p>

								{tab?.endpoints.map((e) => (
									<button
										key={e.id}
										type="button"
										className={`${s.endpointCard} mb-2`}
										onClick={() => openEndpoint(e)}
									>
										<div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
											<div style={{ minWidth: 0 }}>
												<div className="d-flex align-items-center mb-1 flex-wrap">
													<span
														className={`${s.apiMethod} ${s[METHOD_CLASS[e.method]]}`}
													>
														{e.method}
													</span>
													<strong
														style={{
															fontFamily: "var(--pm-font-mono)",
															overflowWrap: "anywhere",
														}}
													>
														{e.path}
													</strong>
												</div>
												<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
													{e.desc}
												</div>
											</div>
											<span className={`${s.badge} ${s[e.tone]}`}>
												{e.status}
											</span>
										</div>
									</button>
								))}

								{tab?.action && (
									<div className="mt-3 text-end">
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open(tab.action?.modal as string)}
										>
											{tab.action.label}
										</button>
									</div>
								)}
							</div>
						</div>

						{/* quick tools + docs */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<h3 className={`${s.sectionTitle} mb-3`}>Quick Tools</h3>
								<div className={`${s.quickActionGrid} mb-4`}>
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
								<div className={s.utilityBlock}>
									<h4
										style={{
											fontSize: 13,
											fontWeight: 700,
											margin: "0 0 10px",
										}}
									>
										Documentation Hub
									</h4>
									{c.docLinks.map((d) => (
										<div key={d.title} className={s.feedItem}>
											<i
												className="bi bi-journal-text"
												style={{ color: "var(--pm-muted)" }}
											/>
											<button
												type="button"
												style={{
													border: "none",
													background: "none",
													padding: 0,
													fontSize: 13,
													fontWeight: 500,
													color: "var(--pm-primary)",
													cursor: "pointer",
													textAlign: "left",
												}}
												onClick={() => open(d.modal)}
											>
												{d.title}
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ================= 4.12.2 + 4.12.3 ================= */}
					<div className="row g-3">
						{/* audit tools */}
						<div className="col-lg-6">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-shield-check"
											style={{ color: "var(--pm-accent)" }}
										/>{" "}
										Audit & Compliance Tools
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("auditLogsModal")}
									>
										View Logs
									</button>
								</div>
								<div
									className="p-3 border rounded mb-3"
									style={{ background: "var(--pm-surface-2)" }}
								>
									<div className="d-flex align-items-center justify-content-between mb-2 gap-2">
										<div style={{ fontWeight: 600, fontSize: 14 }}>
											Immutable Audit Trail (WORM)
										</div>
										<span className={`${s.badge} ${s.badgeS}`}>Active</span>
									</div>
									<p
										style={{
											fontSize: 12,
											color: "var(--pm-muted)",
											marginBottom: 12,
										}}
									>
										All transaction states, configuration changes, and access
										logs are written to a Write-Once-Read-Many datastore.
										Tamper-evident verification is available via API.
									</p>
									<div className="d-flex gap-2 flex-wrap">
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("verifyLogModal")}
										>
											<i className="bi bi-check-circle" /> Verify Hash
										</button>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => open("thirdPartyAuditModal")}
										>
											<i className="bi bi-people" /> Auditor Portal
										</button>
									</div>
								</div>
								<h4
									style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}
								>
									Recent System Audit Events
								</h4>
								{c.auditEvents.map((ev) => (
									<div key={ev.title} className={s.feedItem}>
										<div
											className={s.iconCircle}
											style={{
												width: 32,
												height: 32,
												minWidth: 32,
												background: ev.bg,
												color: ev.color,
											}}
										>
											<i className={`bi ${ev.icon}`} style={{ fontSize: 14 }} />
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontWeight: 600, fontSize: 12 }}>
												{ev.title}
											</div>
											<div
												style={{
													fontSize: 11,
													color: "var(--pm-muted)",
													overflowWrap: "anywhere",
												}}
											>
												{ev.meta}
											</div>
										</div>
										<div
											style={{
												fontSize: 11,
												color: "var(--pm-muted)",
												flexShrink: 0,
											}}
										>
											{ev.age}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* international standards */}
						<div className="col-lg-6">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-globe2"
											style={{ color: "var(--pm-info)" }}
										/>{" "}
										International Standards
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} ${s.btnDark}`}
										onClick={() => open("complianceDashModal")}
									>
										Dashboard
									</button>
								</div>
								{c.standards.map((st) => (
									<div key={st.name} className={s.statusRow}>
										<div style={{ minWidth: 0 }}>
											<strong>{st.name}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{st.sub}
											</div>
										</div>
										<div className="d-flex align-items-center gap-2 flex-shrink-0">
											<span className={`${s.badge} ${s[st.tone]}`}>
												{st.status}
											</span>
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => open(st.modal)}
											>
												{st.actionLabel}
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 23 MODALS ================= */}
			<ComplianceAuditModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
				endpoint={endpoint}
			/>
		</div>
	);
}
