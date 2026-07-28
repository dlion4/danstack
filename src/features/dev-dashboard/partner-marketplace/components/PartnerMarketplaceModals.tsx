/* ============================================================================
 * 4.9 Partner Program & Marketplace — all 25 modals.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextApplyStep() (3 steps -> receipt)  -> m.step/go + m.doAction at the end
 *   nextAppStep()   (3 steps -> receipt)  -> same pattern
 *   selectBox(card) (classList 'selected') -> m.isPicked / m.setPicked
 *   ROI calculator (was static)            -> live computed state
 *   roadmap vote buttons                   -> local vote tally state
 * ========================================================================== */

import { useState } from "react";
import {
	Chk,
	Fld,
	Lbl,
	MBox,
	Stepper,
	useModals,
} from "../../_shared/devModalKit";
import type { PartnerMarketplaceContent } from "../data/partnerMarketplaceData";
import styles from "../styles/partnerMarketplace.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: PartnerMarketplaceContent;
}

const Stars = ({ n }: { n: number }) => (
	<span className={s.starRow} aria-label={`${n} out of 5 stars`}>
		{"★".repeat(n)}
		{"☆".repeat(5 - n)}
	</span>
);

/** ROI calculator — the legacy version was a static form; now it computes. */
function RoiCalculator({ data }: { data: PartnerMarketplaceContent }) {
	const [vol, setVol] = useState(500000);
	const [count, setCount] = useState(10);
	const [tier, setTier] = useState("Certified");
	const share =
		data.revShare.find((r) => r.tier === tier)?.share.replace("%", "") ?? "10";
	const monthly = (vol * count * (Number(share) / 100) * 0.015) / 1;
	return (
		<>
			<div className="mb-3">
				<Lbl s={s}>Avg Merchant Monthly Volume (KES)</Lbl>
				<input
					className={s.formControl}
					type="number"
					value={vol}
					onChange={(e) => setVol(Number(e.target.value) || 0)}
					aria-label="Average merchant monthly volume"
				/>
			</div>
			<div className="mb-3">
				<Lbl s={s}>Number of Referred Merchants</Lbl>
				<input
					className={s.formControl}
					type="number"
					value={count}
					onChange={(e) => setCount(Number(e.target.value) || 0)}
					aria-label="Number of referred merchants"
				/>
			</div>
			<div className="mb-3">
				<Lbl s={s}>Your Partner Tier</Lbl>
				<select
					className={s.formControl}
					value={tier}
					onChange={(e) => setTier(e.target.value)}
					aria-label="Partner tier"
				>
					{data.revShare.map((r) => (
						<option key={r.tier}>{r.tier}</option>
					))}
				</select>
			</div>
			<div className={`${s.note} ${s.noteSuccess} text-center`}>
				<div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>
					Estimated Monthly Commission
				</div>
				<div className={s.sv} style={{ color: "var(--pm-accent)", marginTop: 4 }}>
					KES{" "}
					{monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
				</div>
				<div style={{ fontSize: 11, marginTop: 4 }}>
					Based on {share}% rev share · {count} merchants
				</div>
			</div>
		</>
	);
}

export default function PartnerMarketplaceModals({
	active,
	onClose,
	onOpen,
	data,
}: Props) {
	const m = useModals(s, active, onClose);
	const [votes, setVotes] = useState<Record<string, number>>({});
	const [copied, setCopied] = useState(false);
	const chain = (id: string) => {
		onClose();
		window.setTimeout(() => onOpen(id), 60);
	};

	const applyStep = m.step("applyPartnerModal");
	const appStep = m.step("submitAppModal");

	return (
		<>
			{/* ---------------- 1. Apply Partner (3-step wizard) ---------------- */}
			<MBox
				s={s}
				id="applyPartnerModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-stars" style={{ color: "var(--pm-primary)" }} />
						Partner Tier Upgrade
					</>
				}
				footer={m.footer(
					"applyPartnerModal",
					<>
						{m.closeOnly("Cancel")}
						{applyStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("applyPartnerModal", applyStep + 1)}
							>
								Continue <i className="bi bi-arrow-right" />
							</button>
						)}
						{applyStep >= 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() =>
									m.doAction(
										"applyPartnerModal",
										"Application for Premium Tier submitted. Under review.",
										"PRT-APP-991",
									)
								}
							>
								Submit Application <i className="bi bi-check" />
							</button>
						)}
					</>,
				)}
			>
				{m.body(
					"applyPartnerModal",
					<>
						<Stepper
							s={s}
							labels={["Select Tier", "Justification", "Verify"]}
							current={applyStep}
						/>
						{applyStep === 1 && (
							<div className="row g-3">
								{data.tiers.map((t) => (
									<div className="col-md-4" key={t.key}>
										<button
											type="button"
											className={`${s.tierCard} ${
												m.isPicked("tier", t.key) ? s.tierCardSelected : ""
											}`}
											onClick={() => m.setPicked("tier", t.key)}
										>
											<i
												className={`bi ${t.icon} d-block mb-2`}
												style={{ fontSize: 26, color: t.color }}
											/>
											<strong>{t.name}</strong>
											<div
												className={s.sv}
												style={{ fontSize: 20, color: t.color, margin: "6px 0" }}
											>
												{t.revShare}
											</div>
											<ul
												style={{
													fontSize: 11,
													color: "var(--pm-muted)",
													paddingLeft: 16,
													textAlign: "left",
													marginBottom: 0,
												}}
											>
												{t.perks.map((p) => (
													<li key={p}>{p}</li>
												))}
											</ul>
										</button>
									</div>
								))}
							</div>
						)}
						{applyStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Company Name</Lbl>
									<Fld s={s} defaultValue="TechCorp Ltd" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Projected Monthly Volume (KES)</Lbl>
									<Fld s={s} type="number" defaultValue="12800000" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Integration Description</Lbl>
									<Fld
										s={s}
										as="textarea"
										rows={4}
										placeholder="Describe your integration, target merchants, and go-to-market plan…"
									/>
								</div>
							</>
						)}
						{applyStep >= 3 && (
							<>
								<div className={`${s.note} ${s.noteInfo} mb-3`}>
									<i className="bi bi-info-circle me-1" /> Review your application before
									submitting. Our partner team responds within 5 business days.
								</div>
								<Chk label="I confirm the information provided is accurate." defaultChecked />
								<Chk label="I accept the PayMo Partner Program Terms." defaultChecked />
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ---------------- 2. Certification Exam ---------------- */}
			<MBox
				s={s}
				id="certExamModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-patch-check" style={{ color: "var(--pm-primary)" }} />
						Technical Certification
					</>
				}
				footer={m.footer(
					"certExamModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("certExamModal", "Redirecting to Exam Portal...")}
						>
							Start Exam
						</button>,
					),
				)}
			>
				{m.body(
					"certExamModal",
					<>
						<div className={s.statusRow}>
							<span>Current Certification</span>
							<span className={`${s.badge} ${s.badgeS}`}>Valid until Dec 2026</span>
						</div>
						<div className={s.statusRow}>
							<span>Exam Duration</span>
							<strong>90 minutes</strong>
						</div>
						<div className={s.statusRow}>
							<span>Passing Score</span>
							<strong>80%</strong>
						</div>
						<div className={s.statusRow}>
							<span>Topics</span>
							<strong>APIs · Webhooks · Security</strong>
						</div>
						<div className={`${s.note} ${s.noteInfo} mt-3`}>
							<i className="bi bi-info-circle me-1" /> Recertification is required every 24
							months to retain Certified Partner benefits.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 3. Security Assessment ---------------- */}
			<MBox
				s={s}
				id="securityAssessmentModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield-check" style={{ color: "var(--pm-accent)" }} />
						Security Assessment
					</>
				}
				footer={m.footer(
					"securityAssessmentModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"securityAssessmentModal",
									"Assessment documents submitted for review.",
								)
							}
						>
							Submit Assessment
						</button>,
					),
				)}
			>
				{m.body(
					"securityAssessmentModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Integration Type</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Hosted checkout (no card data)",
									"Direct API (card data in scope)",
									"Mobile SDK",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>PCI DSS SAQ Level</Lbl>
							<Fld s={s} as="select" options={["SAQ A", "SAQ A-EP", "SAQ D"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Upload Latest Vulnerability Scan</Lbl>
							<Fld s={s} type="file" />
						</div>
						<Chk label="We perform annual penetration testing." defaultChecked />
						<Chk label="We encrypt all data at rest and in transit." defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 4. Performance Benchmark ---------------- */}
			<MBox
				s={s}
				id="perfBenchmarkModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-speedometer2" style={{ color: "var(--pm-warning)" }} />
						Performance Benchmarking
					</>
				}
				footer={m.footer(
					"perfBenchmarkModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("perfBenchmarkModal", "Rate limit increase requested.")
							}
						>
							Request Increase
						</button>,
					),
				)}
			>
				{m.body(
					"perfBenchmarkModal",
					<>
						{[
							["Current Rate Limit", "1,000 req/s"],
							["Peak Usage (30d)", "612 req/s"],
							["Avg Response Time", "142ms"],
							["Load Test Result", "Passed"],
						].map(([k, v]) => (
							<div key={k} className={s.statusRow}>
								<span>{k}</span>
								<strong>{v}</strong>
							</div>
						))}
						<div className="mb-3 mt-3">
							<Lbl s={s}>Request Limit Increase</Lbl>
							<Fld
								s={s}
								as="select"
								options={["2,000 req/s", "5,000 req/s", "10,000 req/s (Enterprise)"]}
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 5. Revenue Share ---------------- */}
			<MBox
				s={s}
				id="revenueShareModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-percent" style={{ color: "var(--pm-accent)" }} />
						Revenue Share Model
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("roiCalculatorModal")}
						>
							ROI Calculator
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Tier</th>
								<th>Rev Share</th>
								<th>Payout Schedule</th>
							</tr>
						</thead>
						<tbody>
							{data.revShare.map((r) => (
								<tr key={r.tier}>
									<td data-label="Tier">{r.tier}</td>
									<td data-label="Rev Share">
										<strong style={{ color: "var(--pm-accent)" }}>{r.share}</strong>
									</td>
									<td data-label="Payout Schedule">{r.schedule}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className={`${s.note} ${s.noteMuted} mt-3`}>
					Revenue share is calculated on PayMo's net processing fee, not on gross
					transaction volume.
				</div>
			</MBox>

			{/* ---------------- 6. Co-Marketing ---------------- */}
			<MBox
				s={s}
				id="coMarketingModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-megaphone" style={{ color: "var(--pm-purple)" }} />
						Co-Marketing Hub
					</>
				}
				footer={m.footer(
					"coMarketingModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("coMarketingModal", "Marketing request submitted to partner team.")
							}
						>
							Submit Request
						</button>,
					),
				)}
			>
				{m.body(
					"coMarketingModal",
					<>
						{[
							["PayMo Logo Pack", "SVG + PNG, light & dark"],
							["Brand Guidelines", "Colour, spacing, usage rules"],
							["Partner Badge", "\"Certified Partner\" web badge"],
						].map(([t, d]) => (
							<div key={t} className={s.statusRow}>
								<div>
									<strong>{t}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{d}</div>
								</div>
								<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
									<i className="bi bi-download" /> Get
								</button>
							</div>
						))}
						<div className="mb-3 mt-3">
							<Lbl s={s}>Request Joint Campaign</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={3}
								placeholder="Describe the campaign, audience and timing…"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 7. Lead Sharing ---------------- */}
			<MBox
				s={s}
				id="leadSharingModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-people" style={{ color: "var(--pm-primary)" }} />
						Partner Lead Sharing Portal
					</>
				}
				footer={m.footer("leadSharingModal", m.closeOnly())}
			>
				{m.body(
					"leadSharingModal",
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Lead Name</th>
									<th>Industry</th>
									<th>Interest</th>
									<th>Date Shared</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{data.leads.map((l) => (
									<tr key={l.name}>
										<td data-label="Lead Name">
											<strong>{l.name}</strong>
										</td>
										<td data-label="Industry">{l.industry}</td>
										<td data-label="Interest">{l.interest}</td>
										<td data-label="Date Shared">{l.date}</td>
										<td data-label="Status">
											<span className={`${s.badge} ${s[l.tone]}`}>{l.status}</span>
										</td>
										<td data-label="Action">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() =>
													m.doAction("leadSharingModal", `Lead "${l.name}" updated.`)
												}
											>
												{l.actionLabel}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ---------------- 8. Submit App (3-step wizard) ---------------- */}
			<MBox
				s={s}
				id="submitAppModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-cloud-upload" style={{ color: "var(--pm-primary)" }} />
						Submit App to Marketplace
					</>
				}
				footer={m.footer(
					"submitAppModal",
					<>
						{m.closeOnly("Cancel")}
						{appStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("submitAppModal", appStep + 1)}
							>
								Continue <i className="bi bi-arrow-right" />
							</button>
						)}
						{appStep >= 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() =>
									m.doAction(
										"submitAppModal",
										"App submitted for Marketplace review. SLA is 5 days.",
										"APP-SUB-221",
									)
								}
							>
								Submit for Review <i className="bi bi-upload" />
							</button>
						)}
					</>,
				)}
			>
				{m.body(
					"submitAppModal",
					<>
						<Stepper s={s} labels={["Details", "Media", "Review"]} current={appStep} />
						{appStep === 1 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>App Name</Lbl>
									<Fld s={s} placeholder="e.g. Shopify Connector" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Short Description</Lbl>
									<Fld s={s} as="textarea" rows={2} placeholder="One-line pitch…" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Category</Lbl>
									<Fld
										s={s}
										as="select"
										options={["E-Commerce", "Payroll & HR", "Accounting", "Logistics"]}
									/>
								</div>
							</>
						)}
						{appStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>App Logo (URL)</Lbl>
									<Fld s={s} type="url" placeholder="https://cdn.yourbrand.com/logo.png" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Demo Video Link</Lbl>
									<Fld s={s} type="url" placeholder="https://youtube.com/watch?v=…" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Support Email</Lbl>
									<Fld s={s} type="email" defaultValue={data.header.user.email} />
								</div>
							</>
						)}
						{appStep >= 3 && (
							<>
								<div className="row g-3 mb-3">
									<div className="col-md-6">
										<Lbl s={s}>Billing Model</Lbl>
										<Fld
											s={s}
											as="select"
											options={["Free", "One-time purchase", "Monthly subscription"]}
										/>
									</div>
									<div className="col-md-6">
										<Lbl s={s}>Price (KES)</Lbl>
										<Fld s={s} type="number" defaultValue="0" />
									</div>
								</div>
								<div className={`${s.note} ${s.noteInfo}`}>
									<i className="bi bi-info-circle me-1" /> Marketplace review takes up to 5
									business days. You'll be notified by email.
								</div>
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ---------------- 9. Edit App ---------------- */}
			<MBox
				s={s}
				id="editAppModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear" />
						Manage App Listing
					</>
				}
				footer={m.footer(
					"editAppModal",
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("appReviewsModal")}
						>
							Reviews
						</button>
						{m.closeOnly("Cancel")}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("editAppModal", "App listing updated successfully.")}
						>
							Save Changes
						</button>
					</>,
				)}
			>
				{m.body(
					"editAppModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Select App</Lbl>
							<Fld s={s} as="select" options={data.marketplaceApps.map((a) => a.name)} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Status</Lbl>
							<Fld s={s} as="select" options={["Published", "Unlisted", "Draft"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Update Version Note</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={3}
								placeholder="What changed in this release?"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 10. App Reviews ---------------- */}
			<MBox
				s={s}
				id="appReviewsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-star" style={{ color: "var(--pm-warning)" }} />
						App Reviews & Ratings
					</>
				}
				footer={m.footer("appReviewsModal", m.closeOnly())}
			>
				{m.body(
					"appReviewsModal",
					<>
						{data.reviews.map((r) => (
							<div key={`${r.author}-${r.date}`} className="p-3 border rounded mb-2">
								<div className="d-flex justify-content-between flex-wrap gap-2">
									<div>
										<strong>{r.author}</strong>{" "}
										<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											· {r.app}
										</span>
									</div>
									<Stars n={r.stars} />
								</div>
								<p style={{ fontSize: 13, margin: "6px 0" }}>{r.text}</p>
								<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
									<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>{r.date}</span>
									{r.replied ? (
										<span className={`${s.badge} ${s.badgeS}`}>Replied</span>
									) : (
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => m.doAction("appReviewsModal", "Reply posted.")}
										>
											Reply
										</button>
									)}
								</div>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 11. ROI Calculator ---------------- */}
			<MBox
				s={s}
				id="roiCalculatorModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-graph-up-arrow" style={{ color: "var(--pm-accent)" }} />
						Partner ROI Calculator
					</>
				}
				footer={m.closeOnly()}
			>
				<RoiCalculator data={data} />
			</MBox>

			{/* ---------------- 12. Referral Link ---------------- */}
			<MBox
				s={s}
				id="referralLinkModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-link-45deg" style={{ color: "var(--pm-primary)" }} />
						Partner Referral Links
					</>
				}
				footer={m.footer(
					"referralLinkModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("referralLinkModal", "Custom tracking link generated.")
							}
						>
							Generate Custom Link
						</button>
					</>,
				)}
			>
				{m.body(
					"referralLinkModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Your Default Referral Link</Lbl>
							<div className="d-flex gap-2">
								<Fld s={s} mono defaultValue={data.referralLink} readOnly />
								<button
									type="button"
									className={s.btnPm}
									onClick={() => {
										setCopied(true);
										window.setTimeout(() => setCopied(false), 1500);
									}}
								>
									{copied ? (
										<>
											<i className="bi bi-check2" /> Copied
										</>
									) : (
										<>
											<i className="bi bi-clipboard" /> Copy
										</>
									)}
								</button>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Campaign Tag (Optional)</Lbl>
							<Fld s={s} placeholder="e.g. summit-2026" />
						</div>
						<div className={`${s.note} ${s.noteMuted}`}>
							Referral attribution lasts 90 days from first click.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 13. Payout History ---------------- */}
			<MBox
				s={s}
				id="payoutHistoryModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-cash-stack" style={{ color: "var(--pm-accent)" }} />
						Commission Payout History
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("exportReportModal")}
						>
							<i className="bi bi-download" /> Export
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Month</th>
								<th>Active Merchants</th>
								<th>Total Volume</th>
								<th>Commission</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data.payouts.map((p) => (
								<tr key={p.month}>
									<td data-label="Month">{p.month}</td>
									<td data-label="Active Merchants">{p.merchants}</td>
									<td data-label="Total Volume">{p.volume}</td>
									<td data-label="Commission">
										<strong>{p.commission}</strong>
									</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[p.tone]}`}>{p.status}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 14. Forum Topic ---------------- */}
			<MBox
				s={s}
				id="forumTopicModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-chat-square-text" style={{ color: "var(--pm-primary)" }} />
						Create Forum Post
					</>
				}
				footer={m.footer(
					"forumTopicModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"forumTopicModal",
									"Forum topic posted successfully! View it in the Community section.",
								)
							}
						>
							Post Topic
						</button>,
					),
				)}
			>
				{m.body(
					"forumTopicModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Topic Category</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Integration Help",
									"Feature Requests",
									"Show & Tell",
									"Announcements",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Title</Lbl>
							<Fld s={s} placeholder="Short, descriptive title" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Content (Markdown supported)</Lbl>
							<Fld s={s} as="textarea" rows={6} placeholder="Write your post…" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 15. Roadmap Vote ---------------- */}
			<MBox
				s={s}
				id="roadmapVoteModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-map" style={{ color: "var(--pm-primary)" }} />
						Product Roadmap Voting
					</>
				}
				footer={m.closeOnly()}
			>
				{data.roadmap.map((r) => {
					const extra = votes[r.title] ?? 0;
					return (
						<div key={r.title} className="p-3 border rounded mb-2">
							<div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
								<div style={{ minWidth: 0, flex: 1 }}>
									<div className="d-flex align-items-center gap-2 flex-wrap">
										<strong>{r.title}</strong>
										<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
									</div>
									<div style={{ fontSize: 12, color: "var(--pm-muted)", marginTop: 4 }}>
										{r.desc}
									</div>
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${extra ? s.btnPmP : ""}`}
									onClick={() =>
										setVotes((p) => ({ ...p, [r.title]: p[r.title] ? 0 : 1 }))
									}
								>
									<i className="bi bi-caret-up-fill" /> {r.votes + extra}
								</button>
							</div>
						</div>
					);
				})}
			</MBox>

			{/* ---------------- 16. Beta Enrollment ---------------- */}
			<MBox
				s={s}
				id="betaEnrollModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bug" style={{ color: "var(--pm-warning)" }} />
						Beta Program Enrollment
					</>
				}
				footer={m.footer(
					"betaEnrollModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("betaEnrollModal", "Enrolled in Beta! Check your email for API keys.")
							}
						>
							Enroll
						</button>,
					),
				)}
			>
				{m.body(
					"betaEnrollModal",
					<>
						{data.betaPrograms.map((b) => (
							<m.PickBox key={b.name} k="beta" v={b.name}>
								<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
									<div>
										<strong>{b.name}</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{b.desc}</div>
									</div>
									<span className={`${s.badge} ${s[b.tone]}`}>{b.status}</span>
								</div>
							</m.PickBox>
						))}
						<Chk label="I accept that beta APIs may change without notice." defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 17. Hackathon ---------------- */}
			<MBox
				s={s}
				id="hackathonModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-laptop" style={{ color: "var(--pm-accent)" }} />
						Hackathon Registration
					</>
				}
				footer={m.footer(
					"hackathonModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("hackathonModal", "Team registered! Check your email for event details.")
							}
						>
							Register Team
						</button>,
					),
				)}
			>
				{m.body(
					"hackathonModal",
					<>
						<div className={`${s.note} ${s.noteInfo} mb-3`}>
							<strong>PayMo BuildAfrica '26</strong>
							<div style={{ fontSize: 12 }}>
								18–20 Sep 2026 · Nairobi · KES 1M prize pool
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Team Name</Lbl>
							<Fld s={s} placeholder="e.g. Team Kilimanjaro" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Track</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Payments Innovation",
									"Financial Inclusion",
									"Developer Tooling",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Team Size</Lbl>
							<Fld s={s} as="select" options={["2", "3", "4", "5"]} />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 18. Newsletter ---------------- */}
			<MBox
				s={s}
				id="newsletterSubscribeModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-envelope" style={{ color: "var(--pm-info)" }} />
						Developer Newsletter
					</>
				}
				footer={m.footer(
					"newsletterSubscribeModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("newsletterSubscribeModal", "Preferences updated.")}
						>
							Save Preferences
						</button>,
					),
				)}
			>
				{m.body(
					"newsletterSubscribeModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Email Address</Lbl>
							<Fld s={s} type="email" defaultValue={data.header.user.email} />
						</div>
						<Lbl s={s}>Topics</Lbl>
						<Chk label="API changelog & deprecations" defaultChecked />
						<Chk label="Engineering blog posts" defaultChecked />
						<Chk label="Partner & marketplace news" defaultChecked />
						<Chk label="Events & hackathons" />
					</>,
				)}
			</MBox>

			{/* ---------------- 19. Office Hours ---------------- */}
			<MBox
				s={s}
				id="officeHoursModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calendar-check" style={{ color: "var(--pm-primary)" }} />
						Book API Office Hours
					</>
				}
				footer={m.footer(
					"officeHoursModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("officeHoursModal", "Session booked! Calendar invite sent.")
							}
						>
							Book Session
						</button>,
					),
				)}
			>
				{m.body(
					"officeHoursModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Topic</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Integration architecture review",
									"Webhook reliability",
									"Go-live readiness",
									"Performance tuning",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Available Slots (EAT)</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Fri 03 Jul · 10:00",
									"Fri 03 Jul · 11:00",
									"Fri 10 Jul · 10:00",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Questions/Context</Lbl>
							<Fld s={s} as="textarea" rows={3} placeholder="What would you like to cover?" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 20. Tech Workshop ---------------- */}
			<MBox
				s={s}
				id="techWorkshopModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-mortarboard" style={{ color: "var(--pm-purple)" }} />
						Technical Workshop RSVP
					</>
				}
				footer={m.footer(
					"techWorkshopModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("techWorkshopModal", "RSVP Confirmed. Zoom link sent.")}
						>
							Confirm RSVP
						</button>,
					),
				)}
			>
				{m.body(
					"techWorkshopModal",
					<>
						<div className={`${s.note} ${s.notePurpleFallback ?? s.noteMuted} mb-3`}>
							<strong>Authentication & Security Deep-Dive</strong>
							<div style={{ fontSize: 12 }}>15 Nov 2026 · 14:00–16:00 EAT · Online</div>
						</div>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Covers OAuth 2.0 flows, HMAC signature verification, idempotency keys and
							certificate pinning, with live code walkthroughs.
						</p>
						<Chk label="Send me the recording afterwards" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 21. Partner Summit ---------------- */}
			<MBox
				s={s}
				id="partnerSummitModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-people-fill" style={{ color: "var(--pm-accent)" }} />
						PayMo Partner Summit '26
					</>
				}
				footer={m.footer(
					"partnerSummitModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("partnerSummitModal", "Ticket confirmed! See you in Nairobi.")
							}
						>
							Confirm Ticket
						</button>,
					),
				)}
			>
				{m.body(
					"partnerSummitModal",
					<>
						<div className={`${s.note} ${s.noteSuccess} mb-3`}>
							<strong>01 Dec 2026 · Nairobi</strong>
							<div style={{ fontSize: 12 }}>
								Keynotes, partner awards, and the 2027 roadmap preview.
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Ticket Type</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Partner (complimentary)",
									"Additional attendee (KES 15,000)",
									"Sponsor booth",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Dietary Requirements</Lbl>
							<Fld s={s} placeholder="e.g. Vegetarian" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 22. Health Check ---------------- */}
			<MBox
				s={s}
				id="healthCheckModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-heart-pulse" style={{ color: "var(--pm-accent)" }} />
						API System Health
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={`${s.note} ${s.noteSuccess} text-center mb-3`}>
					<i className="bi bi-check-circle-fill me-1" /> All Partner Systems Operational
				</div>
				{data.statusServices.map((r) => (
					<div key={r.name} className={s.statusRow}>
						<span>{r.name}</span>
						<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
					</div>
				))}
			</MBox>

			{/* ---------------- 23. Notifications ---------------- */}
			<MBox
				s={s}
				id="notificationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" />
						Developer Alerts
					</>
				}
				footer={
					<>
						<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
							Mark All Read
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div style={{ maxHeight: 420, overflowY: "auto" }}>
					{data.notifications.map((n) => (
						<div
							key={n.title}
							className="p-3 rounded mb-2"
							style={{ background: n.bg, fontSize: 13 }}
						>
							<strong>{n.title}</strong>
							<div style={{ fontSize: 12, marginTop: 2 }}>{n.text}</div>
							<div style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}>
								{n.age}
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ---------------- 24. Partner Profile ---------------- */}
			<MBox
				s={s}
				id="profileModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-circle" />
						Partner Profile
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("exportReportModal")}
						>
							Export Report
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className="text-center">
					<div
						className={`${s.iconCircle} mx-auto mb-3`}
						style={{
							width: 64,
							height: 64,
							fontSize: 24,
							background: "var(--pm-gradient-hero)",
							color: "#fff",
						}}
					>
						{data.header.user.initials}
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>{data.header.user.name}</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						{data.header.user.role} · {data.header.user.email}
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Tier</span>
								<br />
								<strong>{data.hero.tierName}</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Referrals</span>
								<br />
								<strong>{data.referrals.value} active</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Live Apps</span>
								<br />
								<strong>{data.apps.value}</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>This Month</span>
								<br />
								<strong>{data.commissions.value}</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ---------------- 25. Export Report ---------------- */}
			<MBox
				s={s}
				id="exportReportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download" />
						Export Data
					</>
				}
				footer={m.footer(
					"exportReportModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("exportReportModal", "Export generated and downloaded.")
							}
						>
							Generate Export
						</button>,
					),
				)}
			>
				{m.body(
					"exportReportModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Data Set</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Commission payouts",
									"Referred merchants",
									"App install analytics",
									"Lead pipeline",
								]}
							/>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-6">
								<Lbl s={s}>From</Lbl>
								<Fld s={s} type="date" defaultValue="2026-01-01" />
							</div>
							<div className="col-6">
								<Lbl s={s}>To</Lbl>
								<Fld s={s} type="date" defaultValue="2026-06-30" />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Format</Lbl>
							<Fld s={s} as="select" options={["CSV", "Excel", "PDF"]} />
						</div>
					</>,
				)}
			</MBox>
		</>
	);
}
