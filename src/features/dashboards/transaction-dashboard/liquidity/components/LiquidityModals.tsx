/* ============================================================================
 * LiquidityModals.tsx — 15 modals for Page 1.5 "Liquidity & Float".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.5.html modal blocks (openM/closeM + Bootstrap-JS).
 * Every modal is state-driven (no global openM()/closeM()/innerHTML):
 *
 *   rebal flow ................... flows{} + renderStepper() + nextFlow()
 *                                  became <FlowModal>
 *   doAction() loading+success .. <SimpleModal> phase state (form→loading→done)
 *   sw() pill tab switching ..... <TabbedModal> active-key state
 *   cacheAndReset() 420 restores  React remounts each modal cleanly on open
 *   nf() PIN auto-advance ....... <PinRow> focus chaining
 *
 * Modals that open other modals (legacy stacked Bootstrap instances) now close
 * the current modal and open the next — same destination, no backdrop pile-up.
 *
 * VISUAL REFINEMENT (this pass): the standalone agent/agent-pool/partner/
 * bulk-topup/emergency-line/profile/quick-rebalance modals from the old
 * bank-treasury console were removed (0 inbound triggers after the
 * LIQUIDITY_REBUILD_PLAN.md reframe to a payment-facilitator float
 * workspace) — see ../DESIGN-BLUEPRINT.md Modal Inventory for the full
 * keep/delete rationale. The remaining 15 modals all run on the shared
 * SimpleModal / FlowModal / TabbedModal / ModalShell primitives and accept
 * an optional onToast() callback to surface a page-level toast on submit.
 * ========================================================================== */
"use client";
import { useState } from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import {
	FlowModal,
	ModalShell,
	PinRow,
	ReviewRow,
	SimpleModal,
	TabbedModal,
	// } from "../../shared/components/modals.tsx";
} from "../../shared/components/modals";
import styles from "../styles/liquidity.module.css";

const s = styles as Record<string, string>;

/* --------------------------------------------------------------------------
 * Data the page injects (mirrors GET /api/liquidity-float).
 * ------------------------------------------------------------------------ */
export interface FacilitatorScope {
	icon: string;
	scope: string;
	desc: string;
	granted: boolean;
}

export interface LiquidityData {
	businesses: string[];
	businessWallets: string[];
	walletsList: string[];
	facilitatorScopes: FacilitatorScope[];
}

export interface LiquidityModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	data: LiquidityData;
	onToast?: (message: string, variant?: "success" | "danger") => void;
}

/* --------------------------------------------------------------------------
 * Small local helpers (styled by THIS page's stylesheet)
 * ------------------------------------------------------------------------ */
function Field({
	label,
	defaultValue,
	type = "text",
	placeholder,
}: {
	label: string;
	defaultValue?: string;
	type?: string;
	placeholder?: string;
}) {
	return (
		<div className="mb-3">
			<label className={s.fieldLabel}>{label}</label>
			<input
				type={type}
				className={s.field}
				defaultValue={defaultValue}
				placeholder={placeholder}
			/>
		</div>
	);
}

function SelectField({
	label,
	options,
	className = "",
}: {
	label: string;
	options: string[];
	className?: string;
}) {
	return (
		<div className={className || "mb-3"}>
			<label className={s.fieldLabel}>{label}</label>
			<select className={cx(s.field, s.select)}>
				{options.map((o) => (
					<option key={o}>{o}</option>
				))}
			</select>
		</div>
	);
}

/* ==========================================================================
 * Public component — renders every modal driven by the page's modalState map.
 * ======================================================================== */
export function LiquidityModals({
	modalState,
	openModal,
	closeModal,
	data,
	onToast,
}: LiquidityModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);
	const notify = (message: string, variant?: "success" | "danger") =>
		onToast?.(message, variant);
	/** close current modal then open the next (legacy stacked instances) */
	const swap = (from: string, to: string) => {
		closeModal(from);
		openModal(to);
	};

	return (
		<>
			{/* ============ M1: Rebalance (multi-step flow) ============ */}
			<FlowModal
				show={isOpen("rebalanceModal")}
				onClose={() => close("rebalanceModal")}
				iconCls="bi bi-arrow-left-right"
				title="Float Rebalance"
				steps={["Source", "Amount", "Approve", "Done"]}
				confirmLabel="Execute"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<h6 style={{ fontWeight: 700 }}>
									Step 1: Select Source &amp; Destination
								</h6>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField
											label="From (Source Wallet)"
											options={data.walletsList}
										/>
									</div>
									<div className="col-md-6">
										<SelectField
											label="To (Business Float)"
											options={data.businesses}
										/>
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 2: Amount &amp; Reason</h6>
								<Field label="Amount (KES)" defaultValue="640000" />
								<SelectField
									label="Reason"
									options={[
										"Below-minimum top-up",
										"Friday batch preparation",
										"Scheduled refill",
										"Manual rebalance",
									]}
								/>
								<div className="mb-3">
									<label className={s.fieldLabel}>Notes</label>
									<textarea
										className={s.field}
										rows={2}
										defaultValue="Top-up Company 2 float to minimum + 25% before daily auto-settle."
									/>
								</div>
							</>
						)}
						{step === 3 && (
							<>
								<h6 style={{ fontWeight: 700 }}>
									Step 3: Approval &amp; Execution
								</h6>
								<div className={cx(s.reviewBox, "mb-3")}>
									<ReviewRow label="Amount" value="KES 640,000" />
									<ReviewRow label="Fee" value="KES 0 (internal)" />
									<div className="d-flex justify-content-between">
										<span style={{ fontWeight: 700 }}>Total Movement</span>
										<strong style={{ fontSize: 18, color: "var(--pri)" }}>
											KES 640,000
										</strong>
									</div>
								</div>
								<label className={cx(s.fieldLabel, "d-block text-center")}>
									Enter Approval PIN
								</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>
									Rebalance Executed Successfully
								</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>
									KES 640,000 transferred from Business Wallet to Company 2
									Float. New balance: KES 1.28M.
								</p>
								<div className={cx(s.reviewBox, "text-start mt-3")}>
									<ReviewRow label="Reference" value="RB-9924" />
									<ReviewRow label="Executed" value="Today, 09:15" />
									<ReviewRow label="Approved by" value="You (Manual)" />
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>
			{/* ============ M2: Top-up Bank ============ */}
			<SimpleModal
				show={isOpen("topupBankModal")}
				onClose={() => close("topupBankModal")}
				iconCls="bi bi-bank"
				title="Top-up Business Float"
				submitLabel="Execute Top-up"
				successMsg="Business float topped up successfully! Reference: TP-44292"
				onSubmit={() => notify("Business float topped up. Reference TP-44292.")}
			>
				<SelectField label="Business Float" options={data.businesses} />
				<Field label="Amount (KES)" defaultValue="640000" />
				<SelectField label="Source" options={data.walletsList} />
				<SelectField
					label="Reason"
					options={[
						"Below-minimum top-up",
						"Scheduled top-up",
						"Friday batch preparation",
					]}
				/>
			</SimpleModal>
			{/* ============ M7: Forecast (tabbed + apply action) ============ */}
			<ModalShell
				show={isOpen("forecastModal")}
				onClose={() => close("forecastModal")}
				size="lg"
				iconCls="bi bi-graph-up"
				title="Liquidity Forecast & Recommendations"
				footer={
					<>
						<button
							type="button"
							className={cx(s.btn, s.btnSecondary)}
							onClick={() => close("forecastModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnPrimary)}
							onClick={() => swap("forecastModal", "forecastApplyModal")}
						>
							Apply Recommendations
						</button>
					</>
				}
			>
				<ForecastTabs />
			</ModalShell>
			{/* ============ M8: Settlement (tabbed) ============ */}
			<TabbedModal
				show={isOpen("settlementModal")}
				onClose={() => close("settlementModal")}
				iconCls="bi bi-clock-history"
				title="Settlement Management"
				tabs={[
					{
						key: "today",
						label: "Today",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Batch</th>
											<th>Counterparty</th>
											<th>Amount</th>
											<th>Status</th>
											<th>Time</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>SB-44291</td>
											<td>Equity Bank</td>
											<td>KES 87.4M</td>
											<td>
												<span className={cx(s.badge, s.badgeWarn)}>
													Variance
												</span>
											</td>
											<td>14:22</td>
											<td>
												<button
													type="button"
													className={cx(s.btn, s.btnSm)}
													onClick={() =>
														swap("settlementModal", "reconciliationModal")
													}
												>
													Investigate
												</button>
											</td>
										</tr>
										<tr>
											<td>SB-44290</td>
											<td>KCB Bank</td>
											<td>KES 112.6M</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>
													Matched
												</span>
											</td>
											<td>11:45</td>
											<td>
												<button
													type="button"
													className={cx(s.btn, s.btnSm)}
													onClick={() =>
														swap("settlementModal", "settlementDetailModal")
													}
												>
													View
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "pending",
						label: "Pending",
						render: () => (
							<>
								<div className={s.rowItem}>
									<div style={{ minWidth: 0 }}>
										<div className={s.rowTitle}>SB-44292 — Co-op Bank</div>
										<div className={s.rowSub}>KES 54.2M • Scheduled 16:00</div>
									</div>
									<span className={cx(s.badge, s.badgeInfo)}>Queued</span>
								</div>
								<div className={s.rowItem}>
									<div style={{ minWidth: 0 }}>
										<div className={s.rowTitle}>SB-44293 — Absa Bank</div>
										<div className={s.rowSub}>KES 67.9M • Scheduled 18:00</div>
									</div>
									<span className={cx(s.badge, s.badgeInfo)}>Queued</span>
								</div>
							</>
						),
					},
					{
						key: "history",
						label: "History",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Date</th>
											<th>Batch</th>
											<th>Amount</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>26 Jun</td>
											<td>SB-44280</td>
											<td>KES 94.2M</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>
													Completed
												</span>
											</td>
										</tr>
										<tr>
											<td>25 Jun</td>
											<td>SB-44271</td>
											<td>KES 118.9M</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>
													Completed
												</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
				]}
			/>
			{/* ============ M9: Reconciliation Investigation ============ */}
			<SimpleModal
				show={isOpen("reconciliationModal")}
				onClose={() => close("reconciliationModal")}
				iconCls="bi bi-search"
				title="Reconciliation Investigation"
				size="lg"
				submitLabel="Save Resolution"
				successMsg="Reconciliation case updated. Variance resolution logged. Reference: REC-44291"
			>
				<SelectField
					label="Batch"
					options={[
						"RB-9919 — Land Buyers payout (KES 2.25M)",
						"RB-9921 — Land Buyers refill (KES 3M)",
					]}
				/>
				<div className={cx(s.tile, s.tileWarn, "mb-3")}>
					<div
						style={{
							fontSize: 13,
							fontWeight: 700,
							color: "var(--warning-mid)",
						}}
					>
						Variance Detected: KES 2,250,000
					</div>
					<div style={{ fontSize: 12 }}>
						Expected: KES 2,250,000 | Received: not on statement
					</div>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel}>Investigation Notes</label>
					<textarea
						className={s.field}
						rows={3}
						defaultValue="Land Buyers payout RB-9919 not yet reflected on the bank statement. Awaiting confirmation before Friday batch."
					/>
				</div>
				<SelectField
					label="Resolution"
					options={[
						"Accept variance and adjust float",
						"Request manual adjustment from bank",
						"Raise dispute with network",
						"Schedule full reconciliation meeting",
					]}
				/>
			</SimpleModal>{" "}
			{/* ============ M10: Float Rules (editable, per business) ============ */}
			<SimpleModal
				show={isOpen("thresholdModal")}
				onClose={() => close("thresholdModal")}
				iconCls="bi bi-sliders"
				title="Float Rules & Thresholds"
				submitLabel="Save Rules"
				successMsg="Float rules updated successfully!"
				onSubmit={() => notify("Float rules saved for this business.")}
			>
				<SelectField label="Business" options={data.businesses} />
				<Field label="Minimum Float (KES)" defaultValue="500000" />
				<Field label="Top-up To (KES)" defaultValue="625000" />
				<SelectField
					label="Auto-rebalance trigger"
					options={[
						"Below minimum",
						"Scheduled daily 06:00",
						"Scheduled weekly Friday 15:00",
						"Manual only",
					]}
				/>
				<SelectField label="Source Wallet" options={data.walletsList} />
				<SelectField
					label="Alert when below % of minimum"
					options={["80%", "70%", "60%"]}
				/>
				<div className="form-check mb-2">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="liqNotify"
					/>
					<label
						className="form-check-label"
						style={{ fontSize: 13 }}
						htmlFor="liqNotify"
					>
						Auto-notify on threshold breach
					</label>
				</div>
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="liqReplenish"
					/>
					<label
						className="form-check-label"
						style={{ fontSize: 13 }}
						htmlFor="liqReplenish"
					>
						Auto-refill float when below minimum
					</label>
				</div>
			</SimpleModal>
			{/* ============ M11: Scenario Planning ============ */}
			<SimpleModal
				show={isOpen("scenarioModal")}
				onClose={() => close("scenarioModal")}
				iconCls="bi bi-sliders"
				title="Scenario Planning"
				size="lg"
				submitLabel="Save Scenario"
				successMsg="Scenario plan saved and added to your rebalance calendar."
				onSubmit={() => notify("Scenario plan saved.")}
			>
				<SelectField
					label="Scenario"
					options={[
						"Land Buyers weekly batch due Fri",
						"Company 2 weekend surge",
						"M-Pesa payout rail delay",
						"Bank holiday (all banks closed)",
					]}
				/>
				<div className={cx(s.tile, s.tileInfo, "mb-3")}>
					<div
						style={{ fontSize: 13, fontWeight: 700, color: "var(--info-mid)" }}
					>
						Impact Analysis
					</div>
					<div style={{ fontSize: 12 }}>
						Land Buyers LTD float requirement rises to KES 3.2M for this
						scenario. Recommended pre-emptive top-up: KES 400K.
					</div>
				</div>
				<SelectField
					label="Pre-emptive Action"
					options={[
						"Top-up Land Buyers LTD float by KES 400K",
						"Top-up Company 2 float by KES 200K",
						"Tighten auto-rebalance trigger to daily 06:00",
						"No action — monitor only",
					]}
				/>
			</SimpleModal>
			{/* ============ M12: Governance (tabbed) ============ */}
			<ModalShell
				show={isOpen("governanceModal")}
				onClose={() => close("governanceModal")}
				size="lg"
				iconCls="bi bi-shield-check"
				title="My Access & Permissions"
				footer={
					<>
						<button
							type="button"
							className={cx(s.btn, s.btnSecondary)}
							onClick={() => close("governanceModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnPrimary)}
							onClick={() => close("governanceModal")}
						>
							Request Access
						</button>
					</>
				}
			>
				{(data.facilitatorScopes ?? []).map((sc) => (
					<div className={s.permItem} key={sc.scope}>
						<i
							className={cx("bi", sc.icon)}
							style={{
								color: sc.granted ? "var(--success)" : "var(--warning)",
								fontSize: 18,
								marginTop: 2,
							}}
						/>
						<div style={{ minWidth: 0, flex: 1 }}>
							<div className={s.permTitle}>{sc.scope}</div>
							<div className={s.permSub}>{sc.desc}</div>
						</div>
						<span
							className={cx(s.badge, sc.granted ? s.badgeSuccess : s.badgeWarn)}
						>
							{sc.granted ? "Granted" : "Pending"}
						</span>
					</div>
				))}
			</ModalShell>
			{/* ============ M13: Liquidity Health ============ */}
			<ModalShell
				show={isOpen("liquidityHealthModal")}
				onClose={() => close("liquidityHealthModal")}
				size="lg"
				iconCls="bi bi-heart-pulse"
				title="Liquidity Health Check"
				footer={
					<>
						<button
							type="button"
							className={cx(s.btn, s.btnSecondary)}
							onClick={() => close("liquidityHealthModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnPrimary)}
							onClick={() => swap("liquidityHealthModal", "rebalanceModal")}
						>
							Fix Issues
						</button>
					</>
				}
			>
				<div className="row g-3 mb-3">
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileSuccess, s.tileCenter)}>
							<div className={s.tileValue}>87</div>
							<div className={s.tileTitle}>Health Score</div>
						</div>
					</div>
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileInfo, s.tileCenter)}>
							<div className={s.tileValue}>9/12</div>
							<div className={s.tileTitle}>Banks OK</div>
						</div>
					</div>
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileWarn, s.tileCenter)}>
							<div className={s.tileValue}>3</div>
							<div className={s.tileTitle}>Warning</div>
						</div>
					</div>
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileDanger, s.tileCenter)}>
							<div className={s.tileValue}>1</div>
							<div className={s.tileTitle}>Critical</div>
						</div>
					</div>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Entity</th>
								<th>Float</th>
								<th>Health</th>
								<th>Risk</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Land Buyers LTD Float</td>
								<td>KES 8.40M</td>
								<td>
									<span className={cx(s.badge, s.badgeDanger)}>Critical</span>
								</td>
								<td>High — Friday batch due</td>
							</tr>
							<tr>
								<td>Company 2 Float</td>
								<td>KES 2.10M</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>Warning</span>
								</td>
								<td>Medium — weekend surge</td>
							</tr>
							<tr>
								<td>M-Pesa payout rail</td>
								<td>KES 5.20M consumed</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>Warning</span>
								</td>
								<td>Medium — payout delay risk</td>
							</tr>
							<tr>
								<td>Bank transfer rail</td>
								<td>KES 3.60M consumed</td>
								<td>
									<span className={cx(s.badge, s.badgeSuccess)}>Healthy</span>
								</td>
								<td>Low</td>
							</tr>
						</tbody>
					</table>
				</div>
			</ModalShell>
			{/* ============ M14: Float Alerts (notification list) ============ */}
			<ModalShell
				show={isOpen("floatAlertModal")}
				onClose={() => close("floatAlertModal")}
				iconCls="bi bi-bell"
				title="Float Alerts (14)"
				footer={
					<>
						<button
							type="button"
							className={cx(s.btn, s.btnSecondary)}
							onClick={() => swap("floatAlertModal", "thresholdModal")}
						>
							Configure
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnPrimary)}
							onClick={() => close("floatAlertModal")}
						>
							Close
						</button>
					</>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					<div className={cx(s.tile, s.tileDanger, "mb-2")}>
						<strong>Company 2 float below minimum</strong>
						<div className={s.tileSub}>
							KES 640K / KES 500K min • auto-settle at risk
						</div>
					</div>
					<div className={cx(s.tile, s.tileWarn, "mb-2")}>
						<strong>Land Buyers weekly payout due Friday</strong>
						<div className={s.tileSub}>
							Projected draw KES 2.8M • float short by KES 2.8M
						</div>
					</div>
					<div className={cx(s.tile, s.tileInfo, "mb-2")}>
						<strong>Auto-refill rule paused</strong>
						<div className={s.tileSub}>
							Land Buyers • manual top-up required
						</div>
					</div>
					<div className={cx(s.tile, "mb-2")}>
						<strong>Float movement RB-9919 unmatched</strong>
						<div className={s.rowSub}>
							KES 2.25M payout awaiting reconciliation
						</div>
					</div>
				</div>
			</ModalShell>
			{/* ============ M15: Internal Transfer ============ */}
			<SimpleModal
				show={isOpen("internalTransferModal")}
				onClose={() => close("internalTransferModal")}
				iconCls="bi bi-arrow-left-right"
				title="Wallet Transfer"
				submitLabel="Execute Transfer"
				successMsg="Wallet transfer completed successfully! Reference: TN-9924"
				onSubmit={() => notify("Wallet transfer completed. Reference TN-9924.")}
			>
				<SelectField label="From Wallet" options={data.walletsList} />
				<SelectField label="To Wallet" options={data.walletsList} />
				<Field label="Amount (KES)" defaultValue="2000000" />
				<SelectField
					label="Reason"
					options={[
						"Fund business float",
						"Personal withdrawal",
						"Move to savings",
					]}
				/>
			</SimpleModal>
			{/* ============ M17: Liquidity Report ============ */}
			<SimpleModal
				show={isOpen("liquidityReportModal")}
				onClose={() => close("liquidityReportModal")}
				iconCls="bi bi-download"
				title="Export Liquidity Report"
				submitLabel="Generate Report"
				successMsg="Report generated and downloading…"
				onSubmit={() => notify("Liquidity report generated.")}
			>
				<SelectField
					label="Report Type"
					options={[
						"Full liquidity snapshot",
						"Float movement history",
						"Agent float report",
						"Settlement reconciliation",
						"Emergency activation log",
					]}
				/>
				<div className="row g-3 mb-3">
					<div className="col-6">
						<label className={s.fieldLabel}>From</label>
						<input type="date" className={s.field} defaultValue="2025-06-01" />
					</div>
					<div className="col-6">
						<label className={s.fieldLabel}>To</label>
						<input type="date" className={s.field} defaultValue="2025-06-27" />
					</div>
				</div>
				<SelectField label="Format" options={["PDF", "Excel", "CSV"]} />
			</SimpleModal>
			{/* ============ M18: All Attention Items ============ */}
			<ModalShell
				show={isOpen("attentionModal")}
				onClose={() => close("attentionModal")}
				iconCls="bi bi-exclamation-circle"
				title="All Attention Items"
				footer={
					<button
						type="button"
						className={cx(s.btn, s.btnSecondary)}
						onClick={() => close("attentionModal")}
					>
						Close
					</button>
				}
			>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Company 2 float below minimum</div>
						<div className={s.rowSub}>KES 640K / min KES 500K</div>
					</div>
					<button
						type="button"
						className={cx(s.btn, s.btnSm, s.btnDangerGhost)}
						onClick={() => swap("attentionModal", "rebalanceModal")}
					>
						Rebalance
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>
							Land Buyers payout batch due Friday
						</div>
						<div className={s.rowSub}>Projected draw KES 2.8M</div>
					</div>
					<button
						type="button"
						className={cx(s.btn, s.btnSm)}
						onClick={() => swap("attentionModal", "topupBankModal")}
					>
						Top-up
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Auto-refill rule paused</div>
						<div className={s.rowSub}>Land Buyers • manual top-up needed</div>
					</div>
					<button
						type="button"
						className={cx(s.btn, s.btnSm)}
						onClick={() => swap("attentionModal", "thresholdModal")}
					>
						Enable
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Float movement RB-9919 unmatched</div>
						<div className={s.rowSub}>KES 2.25M payout awaiting recon</div>
					</div>
					<button
						type="button"
						className={cx(s.btn, s.btnSm)}
						onClick={() => swap("attentionModal", "reconciliationModal")}
					>
						Investigate
					</button>
				</div>
			</ModalShell>
			{/* ============ M21: Forecast Apply ============ */}
			<SimpleModal
				show={isOpen("forecastApplyModal")}
				onClose={() => close("forecastApplyModal")}
				iconCls="bi bi-graph-up"
				title="Apply Forecast Recommendations"
				submitLabel="Apply All"
				successMsg="Recommendations applied to your task list!"
				onSubmit={() => notify("Forecast recommendations applied.")}
			>
				<div className={cx(s.tile, s.tileInfo, "mb-3")}>
					<div
						style={{ fontSize: 13, fontWeight: 700, color: "var(--info-mid)" }}
					>
						Recommended Actions:
					</div>
					<ul style={{ fontSize: 12, margin: "8px 0 0", paddingLeft: 18 }}>
						<li>Top-up Stanbic Bank by KES 50M before 18:00</li>
						<li>Increase Agent Pool buffer by KES 30M</li>
						<li>Schedule weekend rebalance for Saturday 06:00</li>
					</ul>
				</div>
			</SimpleModal>
			{/* ============ M22: Settlement Detail ============ */}
			<ModalShell
				show={isOpen("settlementDetailModal")}
				onClose={() => close("settlementDetailModal")}
				iconCls="bi bi-file-earmark-text"
				title="Settlement Details"
				footer={
					<>
						<button
							type="button"
							className={cx(s.btn, s.btnSecondary)}
							onClick={() => close("settlementDetailModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(s.btn, s.btnPrimary)}
							onClick={() =>
								swap("settlementDetailModal", "reconciliationModal")
							}
						>
							Investigate Variance
						</button>
					</>
				}
			>
				<div className={s.reviewBox}>
					<ReviewRow label="Batch" value="SB-44291" />
					<ReviewRow label="Counterparty" value="Equity Bank" />
					<ReviewRow label="Amount" value="KES 87,420,000" />
					<ReviewRow label="Received" value="KES 85,600,000" />
					<div className="d-flex justify-content-between">
						<span style={{ color: "var(--ink-500)" }}>Variance</span>
						<strong style={{ color: "var(--danger)" }}>KES 1,820,000</strong>
					</div>
				</div>
			</ModalShell>
		</>
	);
}

/* --------------------------------------------------------------------------
 * ForecastTabs — legacy M7 sw('fore', …) pill switching (48h / 7d / 30d).
 * ------------------------------------------------------------------------ */
function ForecastTabs() {
	const [tab, setTab] = useState<"48h" | "7d" | "30d">("48h");
	return (
		<>
			<div className={s.pills} style={{ marginBottom: 20 }}>
				{(
					[
						{ key: "48h", label: "48-Hour" },
						{ key: "7d", label: "7-Day" },
						{ key: "30d", label: "30-Day" },
					] as const
				).map((t) => (
					<button
						key={t.key}
						type="button"
						className={cx(s.pill, tab === t.key && s.pillActive)}
						onClick={() => setTab(t.key)}
					>
						{t.label}
					</button>
				))}
			</div>
			{tab === "48h" && (
				<>
					<div className={s.chartBars}>
						{[
							{ h: 75, c: "var(--pri)", l: "Now" },
							{ h: 68, c: "var(--pri)", l: "+6h" },
							{ h: 55, c: "var(--warning)", l: "+12h" },
							{ h: 42, c: "var(--danger)", l: "+24h" },
							{ h: 38, c: "var(--danger)", l: "+36h" },
							{ h: 52, c: "var(--warning)", l: "+48h" },
						].map((b) => (
							<div
								key={b.l}
								className={s.chartBar}
								style={{ height: `${b.h}%`, background: b.c }}
							>
								<span className={s.barLabel}>{b.l}</span>
							</div>
						))}
					</div>
					<div className="mt-4 pt-2" style={{ fontSize: 13 }}>
						<strong>Key Insight:</strong> Critical shortfall of KES 87.5M
						predicted at +36h. Recommended action: Top-up KES 120M before 06:00
						tomorrow.
					</div>
				</>
			)}
			{tab === "7d" && (
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Day</th>
								<th>Projected Float</th>
								<th>Risk Level</th>
								<th>Recommended Action</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Day 1</td>
								<td>KES 1.72B</td>
								<td>
									<span className={cx(s.badge, s.badgeSuccess)}>Low</span>
								</td>
								<td>Monitor</td>
							</tr>
							<tr>
								<td>Day 3</td>
								<td>KES 1.45B</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>Medium</span>
								</td>
								<td>Rebalance</td>
							</tr>
							<tr>
								<td>Day 5</td>
								<td>KES 1.12B</td>
								<td>
									<span className={cx(s.badge, s.badgeDanger)}>High</span>
								</td>
								<td>Emergency top-up</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}
			{tab === "30d" && (
				<div className={cx(s.tile, s.tileInfo)}>
					Monthly forecast shows recurring pattern of low float every 3rd
					weekend. Recommendation: Increase minimum float buffer by 25% during
					salary run periods.
				</div>
			)}
		</>
	);
}

export default LiquidityModals;
