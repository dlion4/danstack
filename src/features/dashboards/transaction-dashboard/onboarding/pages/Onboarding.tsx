/* ============================================================================
 * Onboarding.tsx — Business Onboarding & Verification Center.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: onboarding_full.html (single-file HTML/CSS/JS, 1,676 LOC) and
 * REBUILT as a state-driven React page following the shared /app/* pattern:
 *
 *   - Hero + progress overview, per-business-type progress metric (freelancer
 *     needs different docs than a sole proprietor — each type has its own
 *     document matrix and its own "percent complete").
 *   - Verification status cards (Basic / Enhanced / Certified), benefits &
 *     limits comparisons, a document checklist with real statuses (verified /
 *     pending / rejected / not submitted), AI recommendations, and an activity
 *     log.
 *   - The 9-step wizard (Type → Identity → Owner → Contact → Docs → Banking →
 *     Ops → Compliance → Review) lives in OnboardingModals.tsx. Every step has
 *     comprehensive fields; the draft persists to localStorage so a user can
 *     save and return later. Skipped steps stay unlocked, and rejected/pending
 *     documents can be re-uploaded.
 *   - A dormant-account notice: ~1 month after onboarding we re-check KYC to
 *     confirm the user still needs the service; 90+ day inactive accounts are
 *     flagged dormant.
 *
 * STYLES: ../styles/onboarding.module.css (emerald theme = shared tokens).
 * ========================================================================== */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import {
	ActivityTable,
	BIZ_TYPES,
	DEFAULT_ACTIVITY,
	docProgress,
	FullChecklistBody,
	getBizType,
	loadDraft,
	type OnboardingData,
	OnboardingModals,
	saveDraft,
	type WizardDraft,
} from "../components/OnboardingModals";
import s from "../styles/onboarding.module.css";

const styles = s as Record<string, string>;

/* --------------------------------------------------------------------------
 * initialMockData — page content (GET /api/onboarding should return this).
 * ------------------------------------------------------------------------ */
const initialMockData: OnboardingData = {
	bizTypes: BIZ_TYPES,
	activity: DEFAULT_ACTIVITY,
};

async function fetchOnboarding(): Promise<OnboardingData> {
	const res = await fetch("/api/onboarding", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as OnboardingData;
}

/* --------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------ */
export default function Onboarding() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [draft, setDraft] = useState<WizardDraft>(() => loadDraft());
	const [toasts, setToasts] = useState<
		{ id: number; msg: string; danger?: boolean }[]
	>([]);

	const openModal = (id: string) =>
		setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) =>
		setModalState((p) => ({ ...p, [id]: false }));

	const toast = (msg: string, danger?: boolean) => {
		const id = Date.now() + Math.random();
		setToasts((p) => [...p, { id, msg, danger }]);
		setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
	};

	const updateDraft = (d: WizardDraft) => {
		setDraft(d);
		saveDraft(d);
	};

	const { data } = useQuery({
		queryKey: ["paymo-onboarding"],
		queryFn: fetchOnboarding,
		staleTime: 60_000,
		retry: 1,
	});
	const activity = data?.activity ?? initialMockData.activity;

	const prog = docProgress(draft);
	const type = getBizType(draft.bizType || "small-scale");

	/* auto-open the wizard when a returning user has a saved draft and clicks
	 * "Continue" — handled by the hero buttons directly, nothing needed here. */

	return (
		<div className={styles.pageRoot} style={{ position: "relative" }}>
			<div className={styles.stack}>
				{/* ---------- page bar ---------- */}
				<div className={styles.pageBar}>
					<div>
						<div className={styles.breadcrumb}>
							<Link to="/pm/app">Home</Link> /{" "}
							<Link to="/pm/app/transfers">Transactions Hub</Link> /{" "}
							<strong>Onboarding</strong>
						</div>
						{/* <h1 className={styles.pageTitle}>Business Onboarding</h1> */}
						{/* <p className={styles.pageCopy}>
							Start your business journey in minutes. Submit documents
							progressively, unlock features as you grow, and resume anytime.
						</p> */}
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSm)}
							onClick={() => openModal("statusModal")}
						>
							<i className="bi bi-shield-check" /> View Status
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSm)}
							onClick={() => openModal("checklistModal")}
						>
							<i className="bi bi-clipboard-check" /> Full Checklist
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary, styles.btnSm)}
							onClick={() => openModal("wizardModal")}
						>
							<i className="bi bi-rocket-takeoff" /> Start Onboarding
						</button>
					</div>
				</div>

				{/* ---------- saved-draft resume banner ---------- */}
				{draft.bizType && !draft.submitted && (
					<div className={styles.kycNote}>
						<i className="bi bi-arrow-counterclockwise" />
						<div style={{ flex: 1 }}>
							<strong>
								Draft saved {new Date(draft.lastVisited).toLocaleDateString()}.
							</strong>{" "}
							You're {prog.pct}% complete for {type.name}. Return anytime —
							skipped sections stay open.
						</div>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary, styles.btnSm)}
							onClick={() => openModal("wizardModal")}
						>
							Resume
						</button>
					</div>
				)}

				{/* ---------- HERO ---------- */}
				<div className={styles.hero}>
					<div className="row align-items-center">
						<div className="col-lg-8">
							<h1 className={styles.heroTitle}>
								<i className="bi bi-rocket-takeoff" /> Welcome to Danstack
								Business Onboarding
							</h1>
							<p className={styles.heroSubtitle}>
								No heavy paperwork — begin with what you have, grow as you grow.
								Submit documents progressively and unlock more features. We'll
								check in with you about a month after onboarding to confirm
								you're still using the service (dormant accounts are paused to
								protect you).
							</p>
							<div className={styles.heroActions}>
								<button
									type="button"
									className={cx(styles.btn, styles.btnWhiteAccent, "btn-lg")}
									onClick={() => openModal("wizardModal")}
								>
									<i className="bi bi-play-fill" /> Start Onboarding
								</button>
								<button
									type="button"
									className={cx(styles.btn, styles.btnGhostAccent, "btn-lg")}
									onClick={() => openModal("statusModal")}
								>
									<i className="bi bi-graph-up-arrow" /> View Status
								</button>
							</div>
						</div>
						<div className="col-lg-4 text-center d-none d-lg-block">
							<div className={styles.heroIcon}>
								<i className="bi bi-building" />
							</div>
						</div>
					</div>
				</div>

				{/* ---------- PROGRESS OVERVIEW ---------- */}
				<div className="row g-3 mb-1">
					<div className="col-12">
						<div className={styles.card}>
							<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
								<div>
									<h2 className={styles.cardTitle}>
										<i className="bi bi-shield-check" /> Your Verification
										Progress
									</h2>
									<p className={cx(styles.cardSubtitle, "mb-0")}>
										Track your journey from Basic to Certified status
										{draft.bizType && (
											<>
												{" "}
												• <strong>{type.name}</strong> profile
											</>
										)}
									</p>
								</div>
								<button
									type="button"
									className={cx(styles.btn, styles.btnSecondary, styles.btnSm)}
									onClick={() => openModal("checklistModal")}
								>
									<i className="bi bi-clipboard-check" /> Full Checklist
								</button>
							</div>
							<div className={styles.progressBar}>
								<div
									className={styles.progressFill}
									style={{ width: `${prog.pct}%` }}
								/>
							</div>
							<div className={styles.progressRow} style={{ marginTop: 8 }}>
								<span>
									{prog.done} of {prog.required} required{" "}
									{prog.required === 1 ? "document" : "documents"} uploaded
									{draft.bizType ? ` (for ${type.name})` : ""}
								</span>
								<span>
									<strong style={{ color: "var(--pri)" }}>{prog.pct}%</strong>{" "}
									Complete
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- STATUS CARDS ---------- */}
				<div className="row g-3">
					<div className="col-md-4">
						<div className={styles.statusCard}>
							<div className={styles.statusIcon}>🟢</div>
							<div className={styles.statusLabel}>Basic</div>
							<div className={styles.statusProgress}>40% Complete</div>
							<span className={cx(styles.docBadge, styles.badgeSuccess)}>
								Active
							</span>
						</div>
					</div>
					<div className="col-md-4">
						<div
							className={cx(styles.statusCard, styles.statusCardCurrent)}
							role="button"
							tabIndex={0}
							onClick={() => openModal("statusModal")}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ")
									openModal("statusModal");
							}}
						>
							<div className={styles.statusIcon}>🟡</div>
							<div className={styles.statusLabel}>Enhanced</div>
							<div className={styles.statusProgress}>
								{prog.pct}% Complete • current level
							</div>
							<span className={cx(styles.docBadge, styles.badgeWarn)}>
								Current Level
							</span>
						</div>
					</div>
					<div className="col-md-4">
						<div
							className={cx(styles.statusCard, styles.statusCardLocked)}
							role="button"
							tabIndex={0}
							onClick={() => openModal("upgradeModal")}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ")
									openModal("upgradeModal");
							}}
						>
							<div className={styles.statusIcon}>🔵</div>
							<div className={styles.statusLabel}>Certified</div>
							<div className={styles.statusProgress}>100% Complete</div>
							<span className={cx(styles.docBadge, styles.badgeInfo)}>
								{prog.required - prog.done}{" "}
								{prog.required - prog.done === 1 ? "doc" : "docs"} to unlock
							</span>
						</div>
					</div>
				</div>

				{/* ---------- BENEFITS ---------- */}
				<div className={styles.card}>
					<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
						<div>
							<h2 className={styles.cardTitle}>
								<i className="bi bi-gift" /> Unlock Features as You Grow
							</h2>
							<p className={cx(styles.cardSubtitle, "mb-0")}>
								Progressive verification unlocks more powerful features and
								higher limits
							</p>
						</div>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary, styles.btnSm)}
							onClick={() => openModal("benefitsModal")}
						>
							<i className="bi bi-info-circle" /> Details
						</button>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={styles.benefitCard}>
								<div className={styles.benefitLevel}>🟢 Basic</div>
								<div className={styles.benefitName}>Starter</div>
								<p className={styles.benefitDesc}>Get started in minutes</p>
								<ul className={styles.benefitFeatures}>
									<li>
										<i className="bi bi-check-lg" />
										Create business profile
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Accept mobile money
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Send up to KES 50K/day
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Basic transaction history
									</li>
									<li>
										<i className="bi bi-check-lg" />3 beneficiaries
									</li>
									<li>
										<i className="bi bi-x-lg" />
										Bulk payments
									</li>
									<li>
										<i className="bi bi-x-lg" />
										API access
									</li>
								</ul>
								<button
									type="button"
									className={cx(styles.btn, "w-100", styles.btnSm)}
									onClick={() => openModal("limitsModal")}
								>
									View Limits
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={cx(styles.benefitCard, styles.benefitFeatured)}>
								<div className={styles.benefitLevel}>🟡 Enhanced</div>
								<div className={styles.benefitName}>Growing</div>
								<p className={styles.benefitDesc}>For scaling businesses</p>
								<ul className={styles.benefitFeatures}>
									<li>
										<i className="bi bi-check-lg" />
										Everything in Basic
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Send up to KES 500K/day
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Bulk payments (50 recipients)
									</li>
									<li>
										<i className="bi bi-check-lg" />
										20 beneficiaries
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Basic analytics
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Payment links &amp; invoices
									</li>
									<li>
										<i className="bi bi-x-lg" />
										API access
									</li>
								</ul>
								<button
									type="button"
									className={cx(
										styles.btn,
										styles.btnPrimary,
										"w-100",
										styles.btnSm,
									)}
									onClick={() => openModal("upgradeModal")}
								>
									Upgrade to Certified
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={styles.benefitCard}>
								<div className={styles.benefitLevel}>🔵 Certified</div>
								<div className={styles.benefitName}>Professional</div>
								<p className={styles.benefitDesc}>Full power unlocked</p>
								<ul className={styles.benefitFeatures}>
									<li>
										<i className="bi bi-check-lg" />
										Everything in Enhanced
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Send up to KES 5M/day
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Unlimited bulk payments
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Unlimited beneficiaries
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Full analytics &amp; reporting
									</li>
									<li>
										<i className="bi bi-check-lg" />
										API access
									</li>
									<li>
										<i className="bi bi-check-lg" />
										International transfers
									</li>
									<li>
										<i className="bi bi-check-lg" />
										Lower fees (0.8%)
									</li>
								</ul>
								<button
									type="button"
									className={cx(styles.btn, "w-100", styles.btnSm)}
									onClick={() => openModal("limitsModal")}
								>
									View Limits
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- LIMITS ---------- */}
				<div className={styles.card}>
					<h2 className={styles.cardTitle}>
						<i className="bi bi-speedometer2" /> Your Current Limits &amp;
						Privileges
					</h2>
					<p className={styles.cardSubtitle}>
						Transaction limits scale with your verification level
					</p>
					<div className="row g-3">
						<div className="col-md-4">
							<div
								className={styles.limitCard}
								role="button"
								tabIndex={0}
								onClick={() => openModal("limitsModal")}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ")
										openModal("limitsModal");
								}}
							>
								<div className={styles.limitLabel}>🟢 Basic</div>
								<div className={styles.limitValue}>KES 50,000</div>
								<div className={styles.limitFoot}>Daily Limit</div>
							</div>
						</div>
						<div className="col-md-4">
							<div
								className={cx(styles.limitCard, styles.limitCardCurrent)}
								role="button"
								tabIndex={0}
								onClick={() => openModal("statusModal")}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ")
										openModal("statusModal");
								}}
							>
								<div className={styles.limitLabel}>🟡 Enhanced (Current)</div>
								<div className={styles.limitValue}>KES 500,000</div>
								<div className={styles.limitFoot}>Daily Limit</div>
							</div>
						</div>
						<div className="col-md-4">
							<div
								className={styles.limitCard}
								role="button"
								tabIndex={0}
								onClick={() => openModal("upgradeModal")}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ")
										openModal("upgradeModal");
								}}
							>
								<div className={styles.limitLabel}>🔵 Certified</div>
								<div className={styles.limitValue}>KES 5,000,000</div>
								<div className={styles.limitFoot}>Daily Limit</div>
							</div>
						</div>
					</div>
					<div className={styles.upgradeBanner}>
						<strong>💡 Upgrade to Certified</strong> to unlock{" "}
						<strong>10x higher limits</strong>, <strong>0.8% fees</strong> (save
						40%), API access, and international transfers.
						<button
							type="button"
							className={cx(
								styles.btn,
								styles.btnPrimary,
								styles.btnSm,
								"ms-2",
							)}
							onClick={() => openModal("upgradeModal")}
						>
							Upgrade Now
						</button>
					</div>
				</div>

				{/* ---------- DOCUMENT CHECKLIST (per business type) ---------- */}
				<div className={styles.card}>
					<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
						<div>
							<h2 className={styles.cardTitle}>
								<i className="bi bi-clipboard-check" /> Document Checklist
							</h2>
							<p className={cx(styles.cardSubtitle, "mb-0")}>
								Upload what you have now, complete the rest later — the required
								list adapts to your business type
							</p>
						</div>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary, styles.btnSm)}
							onClick={() =>
								draft.bizType
									? openModal("uploadModal")
									: openModal("bizTypeModal")
							}
						>
							<i className="bi bi-upload" /> Upload Documents
						</button>
					</div>

					{/* business-type switch drives which docs are shown */}
					<div className={styles.pills} style={{ marginBottom: 16 }}>
						{BIZ_TYPES.map((b) => (
							<button
								key={b.key}
								type="button"
								className={cx(
									styles.pill,
									draft.bizType === b.key && styles.pillActive,
								)}
								onClick={() => updateDraft({ ...draft, bizType: b.key })}
							>
								<i className={cx("bi me-1", b.icon)} /> {b.name}
							</button>
						))}
					</div>

					<div className={styles.progressBar} style={{ marginBottom: 16 }}>
						<div
							className={styles.progressFill}
							style={{ width: `${prog.pct}%` }}
						/>
					</div>

					<FullChecklistBody draft={draft} openModal={openModal} />
				</div>

				{/* ---------- AI SUGGESTIONS ---------- */}
				<div className={styles.aiSection}>
					<div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
						<div className={styles.aiIconBox}>
							<i className="bi bi-robot" />
						</div>
						<div style={{ flex: 1, minWidth: 220 }}>
							<h2 className={styles.cardTitle} style={{ margin: 0 }}>
								AI Document Recommendations
							</h2>
							<p style={{ fontSize: 13, color: "var(--ink-500)", margin: 0 }}>
								Based on your business type ({type.name}), here's what to get
								next
							</p>
						</div>
						<button
							type="button"
							className={cx(
								styles.btn,
								styles.btnSecondary,
								styles.btnSm,
								"ms-auto",
							)}
							onClick={() => openModal("aiModal")}
						>
							<i className="bi bi-stars" /> Full Analysis
						</button>
					</div>
					<div className="row">
						<div className="col-lg-6">
							<div className={styles.suggestionItem}>
								<div
									className={cx(styles.suggestionPriority, styles.priorityHigh)}
								>
									1
								</div>
								<div className={styles.suggestionContent}>
									<div className={styles.suggestionTitle}>
										Business Registration Certificate
									</div>
									<div className={styles.suggestionMeta}>
										📍 eCitizen portal • 💰 ~KES 1,000 • ⏱️ 3-5 days
									</div>
								</div>
								<div className={styles.suggestionImpact}>+KES 4.5M limit</div>
							</div>
							<div className={styles.suggestionItem}>
								<div
									className={cx(styles.suggestionPriority, styles.priorityHigh)}
								>
									2
								</div>
								<div className={styles.suggestionContent}>
									<div className={styles.suggestionTitle}>
										KRA PIN Certificate
									</div>
									<div className={styles.suggestionMeta}>
										📍 itax.kra.go.ke • 💰 Free • ⏱️ Instant
									</div>
								</div>
								<div className={styles.suggestionImpact}>Tax compliance</div>
							</div>
						</div>
						<div className="col-lg-6">
							<div className={styles.suggestionItem}>
								<div
									className={cx(
										styles.suggestionPriority,
										styles.priorityMedium,
									)}
								>
									3
								</div>
								<div className={styles.suggestionContent}>
									<div className={styles.suggestionTitle}>
										County Business Permit
									</div>
									<div className={styles.suggestionMeta}>
										📍 County office • 💰 ~KES 5,000-15,000/yr • ⏱️ 1-2 weeks
									</div>
								</div>
								<div className={styles.suggestionImpact}>Physical location</div>
							</div>
							<div className={styles.suggestionItem}>
								<div
									className={cx(styles.suggestionPriority, styles.priorityLow)}
								>
									4
								</div>
								<div className={styles.suggestionContent}>
									<div className={styles.suggestionTitle}>
										Recent Bank Statement (3 months)
									</div>
									<div className={styles.suggestionMeta}>
										📍 Your bank • 💰 Free • ⏱️ Same day
									</div>
								</div>
								<div className={styles.suggestionImpact}>Builds trust</div>
							</div>
						</div>
					</div>
					<div className="mt-3 d-flex gap-2 flex-wrap">
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary, styles.btnSm)}
							onClick={() => openModal("aiModal")}
						>
							<i className="bi bi-stars" /> Get Started with AI Guide
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSm)}
							onClick={() => openModal("howToModal")}
						>
							<i className="bi bi-mortarboard" /> Show Me How
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSm)}
							onClick={() =>
								toast(
									"We'll remind you later. Tip: 30-day KYC check keeps your account active.",
								)
							}
						>
							<i className="bi bi-bell" /> Remind Me Later
						</button>
					</div>
				</div>

				{/* ---------- RECENT ACTIVITY ---------- */}
				<div className={styles.card}>
					<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
						<div>
							<h2 className={styles.cardTitle}>
								<i className="bi bi-clock-history" /> Recent Onboarding Activity
							</h2>
							<p className={cx(styles.cardSubtitle, "mb-0")}>
								Your progress over the last 7 days
							</p>
						</div>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary, styles.btnSm)}
							onClick={() => openModal("activityModal")}
						>
							<i className="bi bi-list" /> Full Log
						</button>
					</div>
					<ActivityTable compact rows={activity} />
				</div>

				{/* ---------- FOOTER CTA ---------- */}
				<div className="text-center py-4">
					<h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
						Ready to grow your business?
					</h2>
					<p style={{ color: "var(--ink-500)", marginBottom: 24 }}>
						Complete your onboarding and start transacting today
					</p>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary, "btn-lg")}
						style={{ padding: "14px 36px", fontSize: 16 }}
						onClick={() => openModal("wizardModal")}
					>
						<i className="bi bi-rocket-takeoff" /> Continue Onboarding
					</button>
				</div>
			</div>

			{/* ---------- ALL MODALS (state-driven) ---------- */}
			<OnboardingModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				draft={draft}
				setDraft={updateDraft}
				onToast={toast}
				activity={activity}
				onSubmitted={() =>
					toast(
						"Application submitted! We'll review your documents within 24-48 hours.",
					)
				}
			/>

			{/* ---------- TOASTS ---------- */}
			{toasts.length > 0 && (
				<div className={styles.toastWrap}>
					{toasts.map((t) => (
						<div
							key={t.id}
							className={cx(styles.toast, t.danger && styles.toastDanger)}
						>
							<i
								className={cx(
									"bi",
									t.danger ? "bi-exclamation-triangle" : "bi-check-circle",
								)}
							/>
							{t.msg}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
