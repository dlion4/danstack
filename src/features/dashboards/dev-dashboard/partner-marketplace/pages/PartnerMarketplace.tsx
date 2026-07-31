/* ============================================================================
 * Partner Program & Marketplace
 *       (route: /dev-dashboard/partner-marketplace)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: uploads/4.9.html (430 lines, 25 modals).
 *
 *  - Hero + 3 KPI cards, the 5-row onboarding checklist, the marketplace app
 *    listings, the 4 community tiles and the 3 upcoming events were all
 *    repeated hand-written blocks; every one is now a `.map()` over
 *    `initialMockData`.
 *  - `selectBox(card)` (which toggled a `.selected` class by walking
 *    parentElement.parentElement) is replaced by picked-state in the modal kit.
 *  - Bootstrap grid (`row g-3`, `col-lg-4`, `col-lg-2 col-md-4 col-6`) intact.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import PartnerMarketplaceModals from "../components/PartnerMarketplaceModals";
import {
	fetchPartnerMarketplace,
	initialMockData,
} from "../data/partnerMarketplaceData";
import styles from "../styles/partnerMarketplace.module.css";

const s = styles as Record<string, string>;

export default function PartnerMarketplace() {
	const { data } = useQuery({
		queryKey: ["dev-partner-marketplace-4-9"],
		queryFn: fetchPartnerMarketplace,
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
								<div className="d-flex justify-content-between align-items-start gap-2">
									<div style={{ minWidth: 0 }}>
										<p
											style={{
												margin: 0,
												fontSize: 12,
												color: "rgba(255,255,255,.78)",
											}}
										>
											{c.hero.statusLabel}{" "}
											<span style={{ color: "#86efac" }}>
												{c.hero.statusValue}
											</span>
										</p>
										<div
											className={s.sv}
											style={{ margin: "8px 0", color: "#fff" }}
										>
											{c.hero.tierName}
										</div>
										<p
											style={{
												margin: 0,
												fontSize: 12,
												color: "rgba(255,255,255,.78)",
											}}
										>
											{c.hero.benefits}
										</p>
									</div>
									<div
										className={s.iconCircle}
										style={{
											background: "rgba(255,255,255,.2)",
											color: "#fff",
											width: 48,
											height: 48,
											minWidth: 48,
											fontSize: 20,
										}}
									>
										<i className={`bi ${c.hero.icon}`} />
									</div>
								</div>
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

						{/* Active referrals */}
						<div className="col-lg-2 col-md-4 col-6">
							<div className={s.card} style={{ minHeight: 170 }}>
								<p className={s.sl} style={{ color: "var(--pm-info)" }}>
									{c.referrals.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.referrals.value}
								</div>
								<span className={`${s.badge} ${s.badgeS}`}>
									<i className="bi bi-arrow-up" /> {c.referrals.badge}
								</span>
								<div className="mt-3">
									<div
										className="d-flex justify-content-between mb-1"
										style={{ fontSize: 11, color: "var(--pm-muted)" }}
									>
										<span>{c.referrals.target}</span>
										<span>{c.referrals.pct}%</span>
									</div>
									<div className={s.progress}>
										<div
											className={s.progressBar}
											style={{
												width: `${c.referrals.pct}%`,
												background: "var(--pm-info)",
											}}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Monthly commissions */}
						<div className="col-lg-3 col-md-4 col-6">
							<div className={s.card} style={{ minHeight: 170 }}>
								<p className={s.sl} style={{ color: "var(--pm-accent)" }}>
									{c.commissions.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.commissions.value}
								</div>
								<span className={`${s.badge} ${s.badgeS}`}>
									<i className="bi bi-check-circle" /> {c.commissions.badge}
								</span>
								<div className="mt-3">
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} w-100`}
										onClick={() => open(c.commissions.modal)}
									>
										{c.commissions.actionLabel}
									</button>
								</div>
							</div>
						</div>

						{/* Marketplace apps */}
						<div className="col-lg-3 col-md-4">
							<div
								className={s.card}
								style={{
									minHeight: 170,
									borderLeft: "3px solid var(--pm-purple)",
								}}
							>
								<p className={s.sl} style={{ color: "var(--pm-purple)" }}>
									{c.apps.label}
								</p>
								<div className={s.sv} style={{ margin: "6px 0" }}>
									{c.apps.value}
								</div>
								<span className={`${s.badge} ${s.badgeP}`}>
									<i
										className="bi bi-star-fill"
										style={{ color: "var(--pm-warning)" }}
									/>{" "}
									{c.apps.badge}
								</span>
								<div
									className="mt-2"
									style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
								>
									<div>
										Active installs: <strong>{c.apps.installs}</strong>
									</div>
									<div>
										Reviews pending reply:{" "}
										<strong>{c.apps.pendingReviews}</strong>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ================= THREE SECTION COLUMNS ================= */}
					<div className="row g-3">
						{/* ---------- 4.9.1 Partner Onboarding ---------- */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-diagram-3"
											style={{ color: "var(--pm-primary)" }}
										/>{" "}
										4.9.1 Partner Onboarding
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("applyPartnerModal")}
									>
										Tiers
									</button>
								</div>
								<p className={`${s.sectionSub} mb-3`}>
									Manage your partner status, complete certifications, and
									access tier benefits.
								</p>
								{c.onboarding.map((o) => (
									<div key={o.title} className={s.statusRow}>
										<div style={{ minWidth: 0 }}>
											<strong>{o.title}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{o.sub}
											</div>
										</div>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm} ${
												o.primary ? s.btnPmP : s.btnOutline
											}`}
											onClick={() => open(o.modal)}
										>
											{o.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>

						{/* ---------- 4.9.2 Marketplace Integration ---------- */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-shop"
											style={{ color: "var(--pm-warning)" }}
										/>{" "}
										4.9.2 Marketplace Integration
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("submitAppModal")}
									>
										Add App
									</button>
								</div>
								<p className={`${s.sectionSub} mb-3`}>
									List your apps, track referrals, and showcase industry
									solutions.
								</p>
								{c.marketplaceApps.map((a) => (
									<div key={a.name} className={`${s.infoBlock} mb-3`}>
										<div className="d-flex align-items-center justify-content-between mb-2 gap-2">
											<div
												className="d-flex align-items-center gap-2"
												style={{ minWidth: 0 }}
											>
												<div
													className={s.iconCircle}
													style={{
														width: 32,
														height: 32,
														minWidth: 32,
														background: a.iconBg,
														color: a.iconColor,
														fontSize: 14,
													}}
												>
													<i className={`bi ${a.icon}`} />
												</div>
												<strong>{a.name}</strong>
											</div>
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => open("editAppModal")}
											>
												Manage
											</button>
										</div>
										<div
											className="d-flex justify-content-between align-items-center gap-2"
											style={{ fontSize: 12 }}
										>
											<span className={`${s.badge} ${s[a.statusTone]}`}>
												{a.status}
											</span>
											<span>{a.installs}</span>
										</div>
									</div>
								))}
								<div className="d-flex gap-2 flex-wrap">
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} flex-fill`}
										onClick={() => open("appReviewsModal")}
									>
										<i className="bi bi-star" /> App Reviews
									</button>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} flex-fill`}
										onClick={() => open("roiCalculatorModal")}
									>
										<i className="bi bi-graph-up-arrow" /> ROI Calc
									</button>
								</div>
							</div>
						</div>

						{/* ---------- 4.9.3 Community & Collaboration ---------- */}
						<div className="col-lg-4">
							<div className={`${s.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 gap-2">
									<h3 className={s.sectionTitle}>
										<i
											className="bi bi-people"
											style={{ color: "var(--pm-accent)" }}
										/>{" "}
										4.9.3 Community & Collab
									</h3>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => open("forumTopicModal")}
									>
										Post
									</button>
								</div>
								<p className={`${s.sectionSub} mb-3`}>
									Engage with engineers, vote on roadmaps, and join dev events.
								</p>
								<div className={`${s.quickActionGrid} mb-3`}>
									{c.communityTiles.map((t) => (
										<button
											key={t.label}
											type="button"
											className={s.quickActionBtn}
											style={{ flexDirection: "column", gap: 4 }}
											onClick={() => open(t.modal)}
										>
											<i
												className={`bi ${t.icon} d-block`}
												style={{ color: t.color, fontSize: 18 }}
											/>
											<span>{t.label}</span>
										</button>
									))}
								</div>
								<div className={s.infoBlock}>
									<h4
										style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}
									>
										Upcoming Events
									</h4>
									{c.events.map((e) => (
										<div
											key={e.title}
											className="d-flex justify-content-between align-items-center mb-2 gap-2"
											style={{ fontSize: 12 }}
										>
											<span style={{ minWidth: 0 }}>
												<strong>{e.title}</strong>
												<br />
												<span style={{ color: "var(--pm-muted)" }}>
													{e.when}
												</span>
											</span>
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => open(e.modal)}
											>
												{e.actionLabel}
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ================= ALL 25 MODALS ================= */}
			<PartnerMarketplaceModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={open}
				data={c}
			/>
		</div>
	);
}
