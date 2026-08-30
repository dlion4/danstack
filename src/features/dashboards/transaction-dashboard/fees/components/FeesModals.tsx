/* ============================================================================
 * FeesModals.tsx — all workflows for Fees, Charges & Profit Channeling.
 * ----------------------------------------------------------------------------
 * Every dialog uses the shared accessible modal primitives (ModalShell,
 * SimpleModal, FlowModal) from shared/components/modals.tsx so the fees page
 * inherits the PayMo transaction shell behaviour: labelled dialogs, focus
 * trap, Escape-to-close, body scroll lock, bottom sheets on mobile and the
 * emerald business visual language. In-modal navigation (e.g. Profit Pot →
 * Deliver Now) is preserved through the onOpen callback.
 * ========================================================================== */
import { useState } from "react";
import {
	FlowModal,
	ModalShell,
	ReviewRow,
	SelectField,
	SimpleModal,
} from "../../shared/components/modals.tsx";
import shared from "../../shared/styles/appPage.module.css";
import styles from "../styles/fees.module.css";

const s = shared as Record<string, string>;

interface ModalsProps {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}

/* ---------- file download helper (receipts, templates, reports) ---------- */
function downloadFile(name: string, content: string, type = "text/plain") {
	const anchor = document.createElement("a");
	anchor.href = URL.createObjectURL(new Blob([content], { type }));
	anchor.download = name;
	anchor.click();
	URL.revokeObjectURL(anchor.href);
}

/* ---------- shared option lists ---------- */
const TXN_TYPES = [
	"M-Pesa collection",
	"Bank transfer payout",
	"International transfer",
	"Card settlement (USD)",
	"FX conversion",
	"Refund",
];
const FEE_TYPES = ["Percentage", "Fixed Amount", "Tiered"];
const WAIVER_TYPES = ["Hardship", "Promotional", "Regulatory", "Bulk discount"];
const SETTLEMENT_TYPES = [
	"Profit delivery — June 2025",
	"Business Wallet sweep",
	"Micro-profit instant delivery",
];
const REPORT_PERIODS = ["June 2025", "Q2 2025", "YTD 2025"];
const FORMATS = ["PDF", "Excel", "CSV"];
const EXEMPTION_TYPES = [
	"Regulatory (CBK)",
	"Government Disbursement",
	"Charity / NGO",
	"Staff Benefit",
];
const PARTNERS = [
	"Business Wallet (KES)",
	"Virtual Wallet (KES)",
	"External M-Pesa (0712…890)",
	"Equity Bank • 01-2345678-0",
];
const SETTLE_FREQS = [
	"Instant (any amount ≥ KES 2)",
	"Daily",
	"Weekly",
	"Monthly",
];
const REGULATORS = [
	"CBK — Central Bank of Kenya",
	"KRA — Kenya Revenue Authority",
	"CAK — Competition Authority",
];
const HARDSHIP_REASONS = [
	"Medical emergency",
	"Job loss",
	"Natural disaster",
	"Other",
];
const ADV_TYPES = [
	"Money transfer",
	"International transfer",
	"Wallet to M-Pesa",
];

/* ---------- advanced calculator formula (base + VAT + network fee) ---------- */
function advCalc(amount: number, type: string) {
	let base = amount * 0.0085;
	if (type.includes("Instant")) base = amount * 0.0045;
	if (type.includes("Wallet")) base = 25;
	const vat = base * 0.16;
	const net = 50;
	return { base, vat, net, total: base + vat + net };
}

const fmt = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

export default function FeesModals({ active, onClose, onOpen }: ModalsProps) {
	const [advAmount, setAdvAmount] = useState("500000");
	const [advType, setAdvType] = useState("Money transfer");
	const [instantDelivery, setInstantDelivery] = useState(true);
	const [approveBatch, setApproveBatch] = useState(true);
	const adv = advCalc(parseFloat(advAmount) || 0, advType);
	const calcBasePct = advType.includes("Instant")
		? "0.45"
		: advType.includes("Wallet")
			? "flat"
			: "0.85";

	const isOpen = (id: string) => active === id;

	/* ========================================================================
	   1. NEW FEE MODEL — 4-step wizard (Details → Pricing → Conditions → Done)
	   ======================================================================== */
	return (
		<>
			<FlowModal
				show={isOpen("addFeeRuleModal")}
				onClose={onClose}
				iconCls="bi bi-plus-circle"
				title="New Fee Model"
				steps={["Details", "Pricing", "Conditions", "Done"]}
				confirmLabel="Apply Model"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>Step 1: Model details</p>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField
											label="Apply To Business"
											options={["Land Buyers LTD", "Company 2"]}
										/>
									</div>
									<div className="col-md-6">
										<SelectField label="Service" options={TXN_TYPES} />
									</div>
									<div className="col-md-6">
										<SelectField label="Model Type" options={FEE_TYPES} />
									</div>
									<div className="col-md-6">
										<label
											className={s.fieldLabel}
											htmlFor="fee-effective-date"
										>
											Effective Date
										</label>
										<input
											id="fee-effective-date"
											type="date"
											className={s.field}
											defaultValue="2025-08-01"
										/>
									</div>
								</div>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>Step 2: Your charge</p>
								<div className="row g-3">
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="fee-charge-rate">
											Charge (rate or amount)
										</label>
										<input
											id="fee-charge-rate"
											className={s.field}
											defaultValue="2.0"
										/>
									</div>
									<div className="col-md-6">
										<SelectField
											label="Unit"
											options={["% of transaction", "KES fixed per txn"]}
										/>
									</div>
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="fee-min">
											Minimum Fee
										</label>
										<input id="fee-min" className={s.field} defaultValue="10" />
									</div>
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="fee-max">
											Maximum Fee
										</label>
										<input
											id="fee-max"
											className={s.field}
											defaultValue="5000"
										/>
									</div>
								</div>
								<div className={`${s.hintBox} mt-3`}>
									<i className="bi bi-info-circle" />
									<span>
										Preview: KES 100,000 order = you charge KES 2,000 → PayMo
										takes KES 1,280 → you keep KES 720.
									</span>
								</div>
							</div>
						)}
						{step === 3 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>
									Step 3: Conditions &amp; delivery
								</p>
								<div className="mb-3">
									<span className={s.fieldLabel}>Applicable to</span>
									{[
										{ label: "All customers of this business", on: true },
										{ label: "New customers only (promo)", on: false },
										{ label: "Diaspora buyers only", on: false },
									].map((option, index) => (
										<div className="form-check mb-1" key={option.label}>
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={option.on}
												id={`fee-segment-${index}`}
											/>
											<label
												className="form-check-label"
												htmlFor={`fee-segment-${index}`}
											>
												{option.label}
											</label>
										</div>
									))}
								</div>
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="fee-auto-channel"
									/>
									<label
										className="form-check-label"
										htmlFor="fee-auto-channel"
									>
										Auto-channel profit to my wallet when collected
									</label>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ====================================================================
			   2. EDIT FEE RULE
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("editFeeRuleModal")}
				onClose={onClose}
				iconCls="bi bi-pencil"
				title="Edit Fee Rule"
				submitLabel="Save Changes"
				successMsg="Fee rule updated successfully. Changes take effect immediately."
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="edit-fee-model">
						Model
					</label>
					<input
						id="edit-fee-model"
						className={s.field}
						defaultValue="Land Buyers — Flat KES 1,250"
					/>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="edit-fee-rate">
							Rate
						</label>
						<input id="edit-fee-rate" className={s.field} defaultValue="0.50" />
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="edit-fee-max">
							Max Fee
						</label>
						<input id="edit-fee-max" className={s.field} defaultValue="2500" />
					</div>
				</div>
				<div className="mb-3 mt-3">
					<label className={s.fieldLabel} htmlFor="edit-fee-expiry">
						Expiry Date
					</label>
					<input
						id="edit-fee-expiry"
						type="date"
						className={s.field}
						defaultValue="2025-07-05"
					/>
				</div>
				<div className="form-check form-switch">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="edit-fee-active"
					/>
					<label className="form-check-label" htmlFor="edit-fee-active">
						Active
					</label>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   3. ADVANCED FEE CALCULATOR — 3-step flow with live math
			   ==================================================================== */}
			<FlowModal
				show={isOpen("feeCalculatorModal")}
				onClose={onClose}
				iconCls="bi bi-calculator"
				title="Advanced Fee Calculator"
				steps={["Details", "Breakdown", "Done"]}
				confirmLabel="Preview Fee"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>
									Step 1: Transaction details
								</p>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField
											label="From Account"
											options={[
												"PayMo Wallet — KES 24,500",
												"Equity Bank ****4521",
												"KCB M-Pesa",
											]}
										/>
									</div>
									<div className="col-md-6">
										<SelectField
											label="To Account"
											options={[
												"Equity Bank ****7788",
												"Co-op Bank ****9910",
												"PayMo Wallet",
											]}
										/>
									</div>
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="calc-amount">
											Amount (KES)
										</label>
										<input
											id="calc-amount"
											className={s.field}
											value={advAmount}
											onChange={(event) => setAdvAmount(event.target.value)}
											inputMode="numeric"
										/>
									</div>
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="calc-type">
											Transaction Type
										</label>
										<select
											id="calc-type"
											className={s.field}
											value={advType}
											onChange={(event) => setAdvType(event.target.value)}
										>
											{ADV_TYPES.map((type) => (
												<option key={type}>{type}</option>
											))}
										</select>
									</div>
								</div>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>Step 2: Fee breakdown</p>
								<div className={styles.summaryBox}>
									<ReviewRow
										label={`Base Fee (${calcBasePct}%)`}
										value={fmt(adv.base)}
									/>
									<ReviewRow label="VAT (16%)" value={fmt(adv.vat)} />
									<ReviewRow label="Network Fee" value={fmt(adv.net)} />
									<hr className={styles.divider} />
									<div className="d-flex justify-content-between">
										<span className={styles.fwBold13}>Total Cost</span>
										<strong
											className={styles.textAccent}
											style={{ fontSize: 18 }}
										>
											{fmt(adv.total)}
										</strong>
									</div>
								</div>
								<div className={`${s.hintBox} ${s.hintBoxSuccess} mt-3`}>
									<i className="bi bi-lightbulb" />
									<span>
										You save KES 1,200 compared to the average market rate.
									</span>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ====================================================================
			   4. ADD TIER TO TIERED MODEL
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("addCommissionTierModal")}
				onClose={onClose}
				iconCls="bi bi-layers"
				title="Add Tier to Tiered Model"
				submitLabel="Create Tier"
				successMsg="Tier TIER-013 added to the tiered model successfully!"
			>
				<div className="mb-3">
					<SelectField
						label="Business / Model"
						options={["Company 2 — Tiered", "Land Buyers LTD — Tiered"]}
					/>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="tier-name">
						Tier Name
					</label>
					<input
						id="tier-name"
						className={s.field}
						defaultValue="Band 2 — orders ≥ KES 50K"
					/>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="tier-threshold">
							Volume Threshold (KES)
						</label>
						<input
							id="tier-threshold"
							className={s.field}
							defaultValue="50000"
						/>
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="tier-rate">
							Charge Rate
						</label>
						<input id="tier-rate" className={s.field} defaultValue="1.5" />
					</div>
				</div>
				<div className="mb-3 mt-3">
					<span className={s.fieldLabel}>Tier benefits</span>
					{[
						{ label: "Applies above threshold", on: true },
						{ label: "Shown to customer at checkout", on: true },
						{ label: "Excluded from discount promos", on: false },
					].map((benefit, index) => (
						<div className="form-check mb-1" key={benefit.label}>
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked={benefit.on}
								id={`tier-benefit-${index}`}
							/>
							<label
								className="form-check-label"
								htmlFor={`tier-benefit-${index}`}
							>
								{benefit.label}
							</label>
						</div>
					))}
				</div>
			</SimpleModal>

			{/* ====================================================================
			   5. EDIT COMMISSION TIER
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("editCommissionModal")}
				onClose={onClose}
				iconCls="bi bi-pencil"
				title="Edit Commission Tier"
				submitLabel="Save Changes"
				successMsg="Commission tier updated successfully!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="edit-tier-name">
						Tier
					</label>
					<input
						id="edit-tier-name"
						className={s.field}
						defaultValue="Band 2 — orders ≥ KES 50K"
					/>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="edit-tier-threshold">
							Volume Threshold
						</label>
						<input
							id="edit-tier-threshold"
							className={s.field}
							defaultValue="2000000"
						/>
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="edit-tier-rate">
							Rate
						</label>
						<input id="edit-tier-rate" className={s.field} defaultValue="1.4" />
					</div>
				</div>
				<div className="mb-3 mt-3">
					<SelectField
						label="Status"
						options={["Active", "Paused", "Archived"]}
					/>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   6. CREATE FEE WAIVER — 3-step flow
			   ==================================================================== */}
			<FlowModal
				show={isOpen("waiverModal")}
				onClose={onClose}
				iconCls="bi bi-gift"
				title="Create Fee Waiver"
				steps={["Details", "Eligibility", "Done"]}
				confirmLabel="Create Waiver"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>Step 1: Waiver details</p>
								<div className="row g-3">
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="waiver-name">
											Waiver Name
										</label>
										<input
											id="waiver-name"
											className={s.field}
											defaultValue="0% promo — 5 new buyers"
										/>
									</div>
									<div className="col-md-6">
										<SelectField label="Type" options={WAIVER_TYPES} />
									</div>
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="waiver-discount">
											Discount
										</label>
										<input
											id="waiver-discount"
											className={s.field}
											defaultValue="100"
										/>
									</div>
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="waiver-budget">
											Budget (KES)
										</label>
										<input
											id="waiver-budget"
											className={s.field}
											defaultValue="5000000"
										/>
									</div>
								</div>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>Step 2: Eligibility</p>
								<div className="mb-3">
									<span className={s.fieldLabel}>Eligible segments</span>
									{[
										{ label: "All customers of the business", on: true },
										{ label: "New customers only (promo)", on: false },
										{ label: "Diaspora buyers only", on: false },
									].map((segment, index) => (
										<div className="form-check mb-1" key={segment.label}>
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={segment.on}
												id={`waiver-segment-${index}`}
											/>
											<label
												className="form-check-label"
												htmlFor={`waiver-segment-${index}`}
											>
												{segment.label}
											</label>
										</div>
									))}
								</div>
								<div className="mb-3">
									<label className={s.fieldLabel} htmlFor="waiver-valid-until">
										Valid Until
									</label>
									<input
										id="waiver-valid-until"
										type="date"
										className={s.field}
										defaultValue="2025-09-30"
									/>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ====================================================================
			   7. EDIT WAIVER
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("editWaiverModal")}
				onClose={onClose}
				iconCls="bi bi-pencil"
				title="Edit Waiver"
				submitLabel="Save Changes"
				successMsg="Waiver updated successfully!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="edit-waiver-name">
						Waiver
					</label>
					<input
						id="edit-waiver-name"
						className={s.field}
						defaultValue="WV-101 — 0% promo new buyers"
					/>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="edit-waiver-discount">
							Discount %
						</label>
						<input
							id="edit-waiver-discount"
							className={s.field}
							defaultValue="100"
						/>
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="edit-waiver-budget">
							Remaining Budget
						</label>
						<input
							id="edit-waiver-budget"
							className={s.field}
							defaultValue="1100000"
						/>
					</div>
				</div>
				<div className="mb-3 mt-3">
					<SelectField
						label="Status"
						options={["Active", "Paused", "Expired"]}
					/>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   8. PROFIT POT DELIVERY — 3-step flow (Select → Review → Done)
			   ==================================================================== */}
			<FlowModal
				show={isOpen("settlementModal")}
				onClose={onClose}
				iconCls="bi bi-cash-stack"
				title="Profit Pot Delivery"
				steps={["Select", "Review", "Done"]}
				confirmLabel="Approve & Deliver"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>
									Step 1: Select delivery
								</p>
								<div className="mb-3">
									<SelectField
										label="Delivery Type"
										options={SETTLEMENT_TYPES}
									/>
								</div>
								<div className={styles.summaryBox}>
									<ReviewRow label="Pot Balance" value="KES 1,342,000" />
									<ReviewRow label="Pending (this batch)" value="KES 84,500" />
									<div className="d-flex justify-content-between">
										<span className="text-muted">Status</span>
										<span className={`${s.badge} ${s.badgeWarning}`}>
											Ready to deliver
										</span>
									</div>
								</div>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${s.fieldLabel} mb-3`}>
									Step 2: Review &amp; approve
								</p>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Source</th>
												<th>Profit</th>
												<th>Channel</th>
											</tr>
										</thead>
										<tbody>
											{[
												[
													"CHG-4401 — Land Buyers",
													"KES 18,750",
													"Business Wallet",
												],
												["CHG-4403 — Company 2", "KES 241", "Business Wallet"],
												["FX conversions", "KES 24,800", "Business Wallet"],
											].map(([source, profit, channel]) => (
												<tr key={source}>
													<td>{source}</td>
													<td>{profit}</td>
													<td>{channel}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className="form-check mt-3">
									<input
										className="form-check-input"
										type="checkbox"
										checked={approveBatch}
										onChange={(event) => setApproveBatch(event.target.checked)}
										id="settle-approve"
									/>
									<label className="form-check-label" htmlFor="settle-approve">
										I approve this profit delivery batch
									</label>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ====================================================================
			   9. COMPLIANCE HEALTH CHECK
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("complianceCheckModal")}
				onClose={onClose}
				iconCls="bi bi-shield-check"
				title="Compliance Health Check"
				size="lg"
				submitLabel="Download Report"
				successMsg="Full compliance report downloaded."
			>
				<div className="row g-3 mb-3">
					{[
						{ value: "98", label: "Compliance", color: "var(--pm-accent)" },
						{ value: "0", label: "Open Issues", color: "var(--pm-info)" },
						{
							value: "3",
							label: "Recommendations",
							color: "var(--pm-warning)",
						},
						{
							value: "18",
							label: "Models Reviewed",
							color: "var(--pm-purple)",
						},
					].map((tile) => (
						<div className="col-md-3 col-6" key={tile.label}>
							<div
								className={styles.miniStat}
								style={{ background: "var(--pm-surface-2)" }}
							>
								<div
									className={styles.miniStatBig}
									style={{ color: tile.color }}
								>
									{tile.value}
								</div>
								<div className={styles.miniStatLabel}>{tile.label}</div>
							</div>
						</div>
					))}
				</div>
				<div className={`${s.hintBox} ${s.hintBoxSuccess} mb-3`}>
					<i className="bi bi-check-circle" />
					<span>
						All fee disclosure requirements met. No regulatory breaches
						detected.
					</span>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Regulation</th>
								<th>Status</th>
								<th>Last Audit</th>
								<th>Next Due</th>
							</tr>
						</thead>
						<tbody>
							{[
								["CBK Fee Transparency", "15 Jun 2025", "15 Sep 2025"],
								["KRA Withholding Tax", "01 Jun 2025", "01 Jul 2025"],
								["Consumer Protection Act", "20 Jun 2025", "20 Sep 2025"],
							].map(([regulation, lastAudit, nextDue]) => (
								<tr key={regulation}>
									<td>{regulation}</td>
									<td>
										<span className={`${s.badge} ${s.badgeSuccess}`}>
											Compliant
										</span>
									</td>
									<td>{lastAudit}</td>
									<td>{nextDue}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   10. FEE REVENUE REPORT
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("feeReportModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-bar-graph"
				title="Fee Revenue Report"
				submitLabel="Generate Report"
				successMsg="Fee revenue report generated and downloading…"
				onSubmit={() =>
					downloadFile(
						"fee_revenue_report.txt",
						"PayMo — Fee & Profit Report\nJune 2025\nInter-bank fees: KES 7.16M\nWallet fees: KES 3.12M\nInstant fees: KES 6.84M\nTotal revenue: KES 18.4M",
					)
				}
			>
				<div className="mb-3">
					<SelectField label="Report Period" options={REPORT_PERIODS} />
				</div>
				<div className="mb-3">
					<SelectField label="Format" options={FORMATS} />
				</div>
				<div className={styles.summaryBox}>
					<ReviewRow label="Inter-bank Fees" value="KES 7.16M" />
					<ReviewRow label="Wallet Fees" value="KES 3.12M" />
					<ReviewRow label="Instant Fees" value="KES 6.84M" />
					<hr className={styles.divider} />
					<div className="d-flex justify-content-between">
						<span className={styles.fwBold13}>Total Revenue</span>
						<strong className={styles.textAccent}>KES 18.4M</strong>
					</div>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   11. PROFIT BY SERVICE (leaderboard)
			   ==================================================================== */}
			<ModalShell
				show={isOpen("agentLeaderboardModal")}
				onClose={onClose}
				iconCls="bi bi-trophy"
				title="Profit by Service"
				size="lg"
				footer={
					<button
						type="button"
						className={`${s.btn} ${s.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Rank</th>
								<th>Service</th>
								<th>Charges</th>
								<th>Profit</th>
								<th>Trend</th>
							</tr>
						</thead>
						<tbody>
							{[
								[
									"1",
									"Installments (Land Buyers)",
									"KES 1.08M",
									"KES 864K",
									"Top",
									"badgeSuccess",
								],
								[
									"2",
									"Orders (Company 2)",
									"KES 256K",
									"KES 178K",
									"Top",
									"badgeSuccess",
								],
								[
									"3",
									"International transfers",
									"KES 98.4K",
									"KES 62.1K",
									"Rising",
									"badgePurple",
								],
								[
									"4",
									"Card settlements (USD)",
									"KES 176.8K",
									"KES 41.2K",
									"Rising",
									"badgePurple",
								],
								[
									"5",
									"FX conversions",
									"KES 86.4K",
									"KES 24.8K",
									"Steady",
									"badgePurple",
								],
							].map(([rank, service, charges, profit, trend, tone]) => (
								<tr key={rank}>
									<td>{rank}</td>
									<td>{service}</td>
									<td>{charges}</td>
									<td>{profit}</td>
									<td>
										<span className={`${s.badge} ${s[tone]}`}>{trend}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ====================================================================
			   12. FEE EXEMPTIONS
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("exemptionModal")}
				onClose={onClose}
				iconCls="bi bi-shield"
				title="Fee Exemptions"
				submitLabel="Create Exemption"
				successMsg="Exemption rule created successfully!"
			>
				<div className="mb-3">
					<SelectField label="Exemption Type" options={EXEMPTION_TYPES} />
				</div>
				<div className="mb-3">
					<span className={s.fieldLabel}>Applicable transactions</span>
					{[
						{ label: "All government-to-citizen payments", on: true },
						{ label: "Salary disbursements", on: true },
						{ label: "Charity donations", on: false },
					].map((option, index) => (
						<div className="form-check mb-1" key={option.label}>
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked={option.on}
								id={`exemption-option-${index}`}
							/>
							<label
								className="form-check-label"
								htmlFor={`exemption-option-${index}`}
							>
								{option.label}
							</label>
						</div>
					))}
				</div>
			</SimpleModal>

			{/* ====================================================================
			   13. FULL ATTENTION QUEUE (cross-modal navigation)
			   ==================================================================== */}
			<ModalShell
				show={isOpen("attentionFullModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-circle"
				title="All Items Requiring Attention"
				footer={
					<button
						type="button"
						className={`${s.btn} ${s.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				{[
					{
						title: "Profit pot above auto-deliver threshold",
						sub: "KES 25K rule — M-Pesa channel paused",
						label: "Review",
						modal: "partnerPayoutModal",
					},
					{
						title: "Company 2 break-even orders",
						sub: "12 orders covered by 2.0% charge — consider tiered",
						label: "Adjust",
						modal: "addFeeRuleModal",
					},
					{
						title: "International transfer fee rose 8%",
						sub: "1.5% + KES 150 — 24 this month",
						label: "View",
						modal: "feeReportModal",
					},
					{
						title: "Promo budget 78% used",
						sub: "0% fee month for 5 new buyers — consider top-up",
						label: "Adjust",
						modal: "editWaiverModal",
					},
				].map((item) => (
					<div className={styles.sr} key={item.title}>
						<div>
							<strong>{item.title}</strong>
							<div className={styles.mutedSmall}>{item.sub}</div>
						</div>
						<button
							type="button"
							className={`${s.btn} ${s.btnSm}`}
							onClick={() => onOpen(item.modal)}
						>
							{item.label}
						</button>
					</div>
				))}
			</ModalShell>

			{/* ====================================================================
			   14. FEE NOTIFICATIONS (→ settings)
			   ==================================================================== */}
			<ModalShell
				show={isOpen("feeNotifModal")}
				onClose={onClose}
				iconCls="bi bi-bell"
				title="Fee Notifications (7)"
				footer={
					<>
						<button
							type="button"
							className={`${s.btn} ${s.btnSecondary}`}
							onClick={() => onOpen("notifSettingsModal")}
						>
							Settings
						</button>
						<button
							type="button"
							className={`${s.btn} ${s.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
					</>
				}
			>
				<div className={s.tableWrap}>
					{[
						{
							box: styles.summaryBoxAccent,
							title: "Profit delivered — KES 84,500",
							sub: "Auto-channelled to Business Wallet.",
						},
						{
							box: styles.summaryBoxDanger,
							title: "M-Pesa channel paused",
							sub: "External wallet link needs verification.",
						},
						{
							box: styles.summaryBoxWarn,
							title: "Company 2 break-even orders",
							sub: "12 orders — consider tiered model.",
						},
						{
							box: styles.summaryBox,
							title: "Promo budget at 78%",
							sub: "Consider top-up.",
						},
					].map((notification) => (
						<div
							key={notification.title}
							className={`${notification.box} mb-2`}
						>
							<strong className={styles.fwBold13}>{notification.title}</strong>
							<div className={styles.mutedSmall}>{notification.sub}</div>
						</div>
					))}
				</div>
			</ModalShell>

			{/* ====================================================================
			   15. NOTIFICATION PREFERENCES
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("notifSettingsModal")}
				onClose={onClose}
				iconCls="bi bi-gear"
				title="Notification Preferences"
				submitLabel="Save"
				successMsg="Notification preferences saved!"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Alert Type</th>
								<th>Push</th>
								<th>SMS</th>
								<th>Email</th>
							</tr>
						</thead>
						<tbody>
							{(
								[
									["Profit delivered", true, true, true],
									["PayMo fee changes", true, false, true],
									["Channel rule alerts", true, false, true],
									["Promo budget", true, true, false],
								] as Array<[string, boolean, boolean, boolean]>
							).map(([label, push, sms, email]) => (
								<tr key={label}>
									<td>{label}</td>
									{["Push", "SMS", "Email"].map((channel, index) => (
										<td key={channel}>
											<input
												type="checkbox"
												defaultChecked={[push, sms, email][index]}
												aria-label={`${label} ${channel.toLowerCase()} notifications`}
											/>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   16. FEE POLICY CONFIGURATION
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("policyConfigModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-text"
				title="Fee Policy Configuration"
				submitLabel="Save Policy"
				successMsg="Policy updated successfully!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="policy-name">
						Policy Name
					</label>
					<input
						id="policy-name"
						className={s.field}
						defaultValue="Standard Transaction Fee Policy 2025"
					/>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="policy-effective">
						Effective From
					</label>
					<input
						id="policy-effective"
						type="date"
						className={s.field}
						defaultValue="2025-01-01"
					/>
				</div>
				<div className="mb-3">
					<SelectField
						label="Review Cycle"
						options={["Quarterly", "Bi-annually", "Annually"]}
					/>
				</div>
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="policy-board"
					/>
					<label className="form-check-label" htmlFor="policy-board">
						Require board approval for changes &gt;10%
					</label>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   17. AUDIT LOG DETAIL
			   ==================================================================== */}
			<ModalShell
				show={isOpen("auditDetailModal")}
				onClose={onClose}
				iconCls="bi bi-file-text"
				title="Audit Log Detail"
				footer={
					<button
						type="button"
						className={`${s.btn} ${s.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={styles.summaryBox}>
					<ReviewRow label="Action ID" value="AUD-20250626-8812" />
					<ReviewRow label="User" value="Jckonia K." />
					<ReviewRow label="IP Address" value="102.68.45.112" />
					<ReviewRow label="Timestamp" value="26 Jun 2025, 14:22 EAT" />
					<ReviewRow label="Changes" value="FR-415 rate: 0.75% → 0.50%" />
				</div>
			</ModalShell>

			{/* ====================================================================
			   18. BULK FEE RULE UPLOAD
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("bulkUploadModal")}
				onClose={onClose}
				iconCls="bi bi-upload"
				title="Bulk Fee Rule Upload"
				submitLabel="Upload & Validate"
				successMsg="47 fee rules imported successfully! Ref BULK-20250627"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="bulk-fee-csv">
						Upload CSV
					</label>
					<input id="bulk-fee-csv" type="file" className={s.field} />
				</div>
				<div className={`${s.hintBox} ${s.hintBoxWarn}`}>
					<i className="bi bi-info-circle" />
					<span>
						Download template:{" "}
						<button
							type="button"
							className="btn btn-link btn-sm p-0 align-baseline"
							style={{ fontSize: 12 }}
							onClick={() =>
								downloadFile(
									"fee_rules_template.csv",
									"model,business,charge,paymo_fee,profit,status\nPercentage,Company 2,2.0%,2.0%,KES 241,Collected",
									"text/csv",
								)
							}
						>
							fee_rules_template.csv
						</button>
					</span>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   19. CHANNEL PROFITS TO WALLET (partner payout)
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("partnerPayoutModal")}
				onClose={onClose}
				iconCls="bi bi-send"
				title="Channel Profits to Wallet"
				submitLabel="Save Rule"
				successMsg="Profit channel rule saved — profits will auto-deliver."
			>
				<div className="mb-3">
					<SelectField label="Deliver To" options={PARTNERS} />
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="payout-min-profit">
						Minimum Profit (KES)
					</label>
					<input id="payout-min-profit" className={s.field} defaultValue="2" />
				</div>
				<div className="mb-3">
					<SelectField label="Delivery Frequency" options={SETTLE_FREQS} />
				</div>
				<div className={`${s.hintBox} ${s.hintBoxSuccess}`}>
					<i className="bi bi-lightning-charge" />
					<span>
						Even KES 2 of profit is delivered the moment it is earned.
					</span>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   20. REGULATORY FEE REPORT
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("regulatoryReportModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-check"
				title="Regulatory Fee Report"
				submitLabel="Generate & Submit"
				successMsg="Regulatory report generated and submitted! Ref REG-20250627"
			>
				<div className="mb-3">
					<SelectField label="Report For" options={REGULATORS} />
				</div>
				<div className="mb-3">
					<SelectField label="Period" options={REPORT_PERIODS} />
				</div>
				<div className={`${s.hintBox} mb-0`}>
					<i className="bi bi-info-circle" />
					<span>
						Report includes: your customer charges, PayMo fees deducted, profit
						delivered, waiver utilization and fee disclosure attestations.
					</span>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   21. TIER PERFORMANCE ANALYTICS
			   ==================================================================== */}
			<ModalShell
				show={isOpen("tierPerformanceModal")}
				onClose={onClose}
				iconCls="bi bi-bar-chart-line"
				title="Tier Performance Analytics"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${s.btn} ${s.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${s.btn} ${s.btnPrimary}`}
							onClick={() => onOpen("addCommissionTierModal")}
						>
							Add New Tier
						</button>
					</>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Model / Business</th>
								<th>Volume</th>
								<th>Revenue</th>
								<th>Adoption</th>
								<th>Growth</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Flat — Land Buyers", "3,240", "KES 1.08M", "91%", "+6%"],
								["Percentage — Company 2", "88,410", "KES 256K", "84%", "+11%"],
								["International transfers", "186", "KES 98.4K", "72%", "+8%"],
								["Card settlements (USD)", "4,120", "KES 176.8K", "78%", "+4%"],
							].map(([model, volume, revenue, adoption, growth]) => (
								<tr key={model}>
									<td>{model}</td>
									<td>{volume}</td>
									<td>{revenue}</td>
									<td>{adoption}</td>
									<td>{growth}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ====================================================================
			   22. HARDSHIP WAIVER REQUEST
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("hardshipWaiverModal")}
				onClose={onClose}
				iconCls="bi bi-heart"
				title="Hardship Waiver Request"
				submitLabel="Submit Request"
				successMsg="Hardship waiver request submitted for review! Ref HW-20250627"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="hardship-customer">
						Customer ID / Phone
					</label>
					<input
						id="hardship-customer"
						className={s.field}
						defaultValue="0712 345 890"
					/>
				</div>
				<div className="mb-3">
					<SelectField label="Reason" options={HARDSHIP_REASONS} />
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="hardship-discount">
						Requested Discount
					</label>
					<input
						id="hardship-discount"
						className={s.field}
						defaultValue="100"
					/>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="hardship-document">
						Supporting Document
					</label>
					<input id="hardship-document" type="file" className={s.field} />
				</div>
			</SimpleModal>

			{/* ====================================================================
			   23. MARKET FEE COMPARISON
			   ==================================================================== */}
			<ModalShell
				show={isOpen("feeCompareModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-left-right"
				title="Market Fee Comparison"
				size="lg"
				footer={
					<button
						type="button"
						className={`${s.btn} ${s.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Provider</th>
								<th>Inter-bank</th>
								<th>Wallet</th>
								<th>Instant</th>
								<th>Overall</th>
							</tr>
						</thead>
						<tbody>
							{(
								[
									[
										"PayMo",
										"0.85%",
										"KES 25",
										"0.45%",
										"Best",
										"badgeSuccess",
										true,
									],
									[
										"Bank A",
										"1.2%",
										"KES 35",
										"0.8%",
										"Average",
										"badgeInfo",
										false,
									],
									[
										"Bank B",
										"1.0%",
										"KES 30",
										"0.6%",
										"Average",
										"badgeInfo",
										false,
									],
									[
										"Mobile Money X",
										"1.5%",
										"KES 20",
										"1.0%",
										"Higher",
										"badgeWarning",
										false,
									],
								] as Array<
									[string, string, string, string, string, string, boolean]
								>
							).map(
								([
									provider,
									interbank,
									wallet,
									instant,
									overall,
									tone,
									strong,
								]) => (
									<tr key={provider}>
										<td>{strong ? <strong>{provider}</strong> : provider}</td>
										<td>{interbank}</td>
										<td>{wallet}</td>
										<td>{instant}</td>
										<td>
											<span className={`${s.badge} ${s[tone]}`}>{overall}</span>
										</td>
									</tr>
								),
							)}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ====================================================================
			   24. FINAL CONFIRMATION
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("finalConfirmModal")}
				onClose={onClose}
				iconCls="bi bi-check2-circle"
				title="Confirm Action"
				submitLabel="Confirm & Execute"
				successMsg="Action confirmed and executed successfully! Ref CONF-20250627"
			>
				<div className={`${s.hintBox} ${s.hintBoxWarn}`}>
					<i className="bi bi-exclamation-triangle" />
					<span>
						This action affects your live fee models and KES 2.31M in monthly
						customer charges. Are you sure?
					</span>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   25. CHARGE A CUSTOMER
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("chargeCustomerModal")}
				onClose={onClose}
				iconCls="bi bi-receipt"
				title="Charge a Customer"
				submitLabel="Apply Charge"
				successMsg="Charge applied — KES 277 profit delivered instantly. Ref CHG-20250808-4409"
			>
				<div className="mb-3">
					<SelectField
						label="Business"
						options={["Land Buyers LTD — Flat KES 1,250", "Company 2 — 2.0%"]}
					/>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="charge-customer-ref">
						Customer / Ref
					</label>
					<input
						id="charge-customer-ref"
						className={s.field}
						defaultValue="Order #ORD-8904"
					/>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="charge-amount">
							Transaction Amount (KES)
						</label>
						<input
							id="charge-amount"
							className={s.field}
							defaultValue="50000"
						/>
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="charge-rate">
							Your Charge
						</label>
						<input
							id="charge-rate"
							className={s.field}
							defaultValue="2.0% = KES 1,000"
						/>
					</div>
				</div>
				<div className={`${styles.summaryBox} mt-3`}>
					<ReviewRow label="PayMo fee (deducted)" value="KES 723" />
					<ReviewRow label="Your profit" value="KES 277" />
				</div>
				<div className={`${s.hintBox} ${s.hintBoxSuccess} mt-3`}>
					<i className="bi bi-lightning-charge" />
					<span>
						Profit auto-channels to Business Wallet the moment this settles.
					</span>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   26. CHANNEL RULE
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("channelRuleModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-left-right"
				title="Channel Rule"
				submitLabel="Save Rule"
				successMsg="Channel rule saved — profits deliver on schedule. Ref CR-012"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="rule-name">
						Rule Name
					</label>
					<input
						id="rule-name"
						className={s.field}
						defaultValue="Micro-profit instant delivery"
					/>
				</div>
				<div className="mb-3">
					<SelectField label="Deliver To" options={PARTNERS} />
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<SelectField
							label="Trigger"
							options={[
								"Instant (any profit ≥ KES 2)",
								"When pot ≥ threshold",
								"Weekly schedule",
							]}
						/>
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel} htmlFor="rule-threshold">
							Threshold (KES)
						</label>
						<input id="rule-threshold" className={s.field} defaultValue="2" />
					</div>
				</div>
				<div className="d-flex align-items-center justify-content-between mt-3">
					<div>
						<div className={styles.fwBold13}>Active</div>
						<div className={styles.mutedSmall}>
							Deliver profits immediately as earned
						</div>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={instantDelivery}
						className={`${s.toggle} ${instantDelivery ? s.toggleOn : ""}`}
						onClick={() => setInstantDelivery(!instantDelivery)}
					>
						<span className={s.toggleKnob} />
					</button>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   27. PROFIT POT DETAIL
			   ==================================================================== */}
			<ModalShell
				show={isOpen("potDetailModal")}
				onClose={onClose}
				iconCls="bi bi-cash-stack"
				title="Profit Pot"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${s.btn} ${s.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${s.btn} ${s.btnPrimary}`}
							onClick={() => onOpen("settlementModal")}
						>
							Deliver Now
						</button>
					</>
				}
			>
				<div className={`${styles.summaryBox} mb-3`}>
					<ReviewRow label="Pot balance" value="KES 1,342,000" />
					<ReviewRow label="Pending" value="KES 84,500" />
					<ReviewRow label="Delivered MTD" value="KES 968,000" />
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Time</th>
								<th>Source</th>
								<th>Profit</th>
								<th>Channel</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{[
								[
									"14:32",
									"CHG-4401 · Land Buyers",
									"KES 18,750",
									"Business Wallet",
									"Delivered",
								],
								[
									"14:28",
									"CHG-4403 · Company 2",
									"KES 241",
									"Business Wallet",
									"Delivered",
								],
								[
									"13:10",
									"FX conversions",
									"KES 24,800",
									"Business Wallet",
									"Delivered",
								],
							].map(([time, source, profit, channel, status]) => (
								<tr key={source}>
									<td>{time}</td>
									<td>{source}</td>
									<td>{profit}</td>
									<td>{channel}</td>
									<td>
										<span className={`${s.badge} ${s.badgeSuccess}`}>
											{status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ====================================================================
			   28. PROFIT PERMISSIONS & ACCESS
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("profitAccessModal")}
				onClose={onClose}
				iconCls="bi bi-shield-check"
				title="Profit Permissions & Access"
				submitLabel="Request Access"
				successMsg="Access request submitted — pending approval by Paymo."
			>
				{(
					[
						[
							"Channel profits to Business Wallet",
							"Auto-deliver to KES Business Wallet",
							true,
						],
						[
							"Auto-deliver micro-profits (≥ KES 2)",
							"Instant delivery on every charge",
							true,
						],
						[
							"Route profits to external M-Pesa",
							"Deliver to 0712…890 on schedule",
							false,
						],
						[
							"Withdraw profit pot to linked bank",
							"Equity Bank • 01-2345678-0",
							false,
						],
					] as const
				).map(([scope, desc, granted]) => (
					<div className={styles.sr} key={scope}>
						<div className="d-flex align-items-center gap-2">
							<span
								className={`${styles.permDot} ${
									granted ? styles.permOk : styles.permPending
								}`}
							/>
							<div>
								<strong>{scope}</strong>
								<div className={styles.mutedSmall}>{desc}</div>
							</div>
						</div>
						{granted ? (
							<span className={`${s.badge} ${s.badgeSuccess}`}>Granted</span>
						) : (
							<span className={`${s.badge} ${s.badgeWarning}`}>Pending</span>
						)}
					</div>
				))}
			</SimpleModal>

			{/* ====================================================================
			   29. PROMO & DISCOUNT CAMPAIGN
			   ==================================================================== */}
			<SimpleModal
				show={isOpen("promoModal")}
				onClose={onClose}
				iconCls="bi bi-megaphone"
				title="Promo & Discount Campaign"
				submitLabel="Launch Promo"
				successMsg="Promo launched — 0% fees for 5 new buyers this month. Ref PRM-20250808-2210"
			>
				<div className="mb-3">
					<label className={s.fieldLabel} htmlFor="promo-name">
						Campaign Name
					</label>
					<input
						id="promo-name"
						className={s.field}
						defaultValue="0% fees — new buyers month"
					/>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<SelectField
							label="Discount"
							options={[
								"0% charge (absorb cost)",
								"50% off your charge",
								"Bulk rebate (10+ orders)",
							]}
						/>
					</div>
					<div className="col-md-6">
						<SelectField
							label="Business"
							options={["Land Buyers LTD", "Company 2"]}
						/>
					</div>
				</div>
				<div className="mb-3 mt-3">
					<label className={s.fieldLabel} htmlFor="promo-end">
						End Date
					</label>
					<input
						id="promo-end"
						type="date"
						className={s.field}
						defaultValue="2025-08-31"
					/>
				</div>
				<div className={`${s.hintBox} ${s.hintBoxSuccess}`}>
					<i className="bi bi-graph-up" />
					<span>
						Typical lift: 12% more buyers — forecast +KES 210K extra volume.
					</span>
				</div>
			</SimpleModal>

			{/* ====================================================================
			   30. FEE MODEL DETAIL
			   ==================================================================== */}
			<ModalShell
				show={isOpen("feeModelDetailModal")}
				onClose={onClose}
				iconCls="bi bi-grid-3x3-gap"
				title="Fee Model — Percentage"
				footer={
					<>
						<button
							type="button"
							className={`${s.btn} ${s.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${s.btn} ${s.btnPrimary}`}
							onClick={() => onOpen("addFeeRuleModal")}
						>
							Apply to Business
						</button>
					</>
				}
			>
				<div className={`${styles.summaryBox} mb-3`}>
					<ReviewRow label="How it works" value="% of each transaction" />
					<ReviewRow
						label="Example"
						value="KES 50,000 order × 2.0% = KES 1,000 charge"
					/>
					<ReviewRow label="PayMo fee" value="KES 723 deducted" />
					<ReviewRow label="You keep" value="KES 277 delivered instantly" />
				</div>
				<div className={`${s.hintBox} ${s.hintBoxSuccess} mb-3`}>
					<i className="bi bi-lightbulb" />
					<span>
						Best for low-value, high-volume businesses like Company 2 (209 daily
						orders).
					</span>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Band</th>
								<th>Rate</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Orders < KES 50K", "2.0%", "Active"],
								["Orders ≥ KES 50K", "1.5%", "Active"],
							].map(([band, rate, status]) => (
								<tr key={band}>
									<td>{band}</td>
									<td>{rate}</td>
									<td>{status}</td>
									<td>
										<button
											type="button"
											className={`${s.btn} ${s.btnSm}`}
											onClick={() => onOpen("editCommissionModal")}
										>
											Edit
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>
		</>
	);
}
