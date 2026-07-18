/* ============================================================================
 * LiquidityModals.tsx — all 25 modals for Page 1.5 "Liquidity & Float".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.5.html modal blocks (openM/closeM + Bootstrap-JS).
 * Every modal is state-driven (no global openM()/closeM()/innerHTML):
 *
 *   rebal / emerg flows ......... flows{} + renderStepper() + nextFlow() became
 *                                 <FlowModal> (and a danger-styled flow for the
 *                                 emergency activation, which had a red header)
 *   doAction() loading+success .. <SimpleModal> phase state (form→loading→done)
 *   sw() pill tab switching ..... <TabbedModal> active-key state
 *   cacheAndReset() 420 restores  React remounts each modal cleanly on open
 *   nf() PIN auto-advance ....... <PinRow> focus chaining
 *
 * Modals that open other modals (legacy stacked Bootstrap instances) now close
 * the current modal and open the next — same destination, no backdrop pile-up.
 * ========================================================================== */
"use client";
import { useEffect, useState } from "react";
import {
	FlowModal,
	ModalShell,
	PinRow,
	ReviewRow,
	SimpleModal,
	TabbedModal,
	useReactModal,
} from "../../../shared/components/modals";
import { cx } from "../../shell/data/shellData";
import styles from "../styles/liquidity.module.css";

const s = styles as Record<string, string>;

/* --------------------------------------------------------------------------
 * Data the page injects (mirrors GET /api/liquidity-float).
 * ------------------------------------------------------------------------ */
export interface LiquidityData {
	banks: string[];
	pools: string[];
	agents: string[];
	partners: string[];
}

export interface LiquidityModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	data: LiquidityData;
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
			<input type={type} className={s.field} defaultValue={defaultValue} placeholder={placeholder} />
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

function SwitchRow({ label, sub, defaultChecked = true }: { label: string; sub: string; defaultChecked?: boolean }) {
	return (
		<div className={s.switchRow}>
			<div style={{ minWidth: 0 }}>
				<div className={s.rowTitle}>{label}</div>
				<div className={s.rowSub}>{sub}</div>
			</div>
			<div className="form-check form-switch">
				<input className="form-check-input" type="checkbox" defaultChecked={defaultChecked} aria-label={label} />
			</div>
		</div>
	);
}

/* ==========================================================================
 * DangerFlowModal — the legacy Emergency Liquidity wizard (red header).
 * Legacy: flows.emerg + nextFlow('emerg', 4) inside #emergencyLiquidityModal.
 * ======================================================================== */
function DangerFlowModal({
	show,
	onClose,
	children,
}: {
	show: boolean;
	onClose: () => void;
	children: (step: number) => React.ReactNode;
}) {
	const mounted = useReactModal(show, onClose);
	const labels = ["Facility", "Amount", "Approve", "Done"];
	const total = labels.length;
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	// reset whenever (re)opened — replaces legacy cacheAndReset()
	useEffect(() => {
		if (show) {
			setStep(1);
			setLoading(false);
			setDone(false);
		}
	}, [show]);

	if (!mounted || !show) return null;

	const isLast = step === total;
	const next = () => {
		if (step === total - 1) {
			setLoading(true);
			setTimeout(() => {
				setLoading(false);
				setDone(true);
				setStep(total);
			}, 1500);
			return;
		}
		if (isLast) {
			onClose();
			return;
		}
		setStep((p) => Math.min(total, p + 1));
	};

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 9999,
				padding: 16,
				backdropFilter: "blur(4px)",
				overflowY: "auto",
			}}
			onClick={onClose}
		>
			<div style={{ width: "100%", maxWidth: 800, margin: "auto", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
				<div
					style={{
						background: "var(--surface-elev)",
						borderRadius: "var(--radius-lg)",
						color: "var(--ink-900)",
						boxShadow: "var(--shadow-xl)",
						maxHeight: "90vh",
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
						animation: "modalSlideIn 0.3s ease-out",
					}}
				>
					{/* legacy red danger header */}
					<div
						style={{
							background: "var(--danger)",
							color: "#fff",
							padding: "20px 24px",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexShrink: 0,
							gap: 12,
						}}
					>
						<h5 style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 10, fontSize: 18, margin: 0 }}>
							<i className="bi bi-lightning-charge" /> Emergency Liquidity Activation
						</h5>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							style={{
								width: 36,
								height: 36,
								border: "none",
								background: "transparent",
								borderRadius: 8,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								color: "#fff",
							}}
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
					<div style={{ padding: 24, overflowY: "auto", flex: 1, minHeight: 0, position: "relative" }}>
						{!done && (
							<>
								<div className={s.stepper}>
									{labels.map((label, i) => {
										const n = i + 1;
										const state = n < step ? "stepDone" : n === step ? "stepActive" : "";
										return (
											<div className={cx(s.step, s[state])} key={label}>
												<div className={s.stepNum}>{n < step ? <i className="bi bi-check" /> : n}</div>
												<div className={s.stepLabel}>{label}</div>
												{i < labels.length - 1 && <div className={s.stepLine} />}
											</div>
										);
									})}
								</div>
								{children(step)}
							</>
						)}
						{done && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-shield-check" />
								</div>
								<h5 className={s.receiptTitle}>Emergency Liquidity Activated</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>
									KES 120M credited to Stanbic Bank from Standby Line. Full audit trail recorded.
								</p>
								<div className={cx(s.reviewBox, "text-start mt-3")}>
									<ReviewRow label="Reference" value="EM-44279" />
									<ReviewRow label="Activated" value="27 Jun 2025, 14:45" />
									<ReviewRow label="Approved by" value="CFO + CEO (Dual)" />
								</div>
							</div>
						)}
						{loading && (
							<div className={s.loadingOverlay}>
								<div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem" }} />
								<p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--pri)" }}>Processing…</p>
							</div>
						)}
					</div>
					<div
						style={{
							borderTop: "1px solid var(--border)",
							padding: "16px 24px",
							display: "flex",
							justifyContent: "flex-end",
							gap: 10,
							flexShrink: 0,
							flexWrap: "wrap",
						}}
					>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={onClose}>
							Cancel
						</button>
						<button type="button" className={cx(s.btn, s.btnDanger)} onClick={next}>
							{isLast ? "Done" : step === total - 1 ? "Activate Emergency" : "Continue"}{" "}
							{!isLast && <i className={step === total - 1 ? "bi bi-lightning-charge" : "bi bi-arrow-right"} />}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ==========================================================================
 * FacilityPicker — legacy emergency Step 1 radio cards (checked = red border).
 * ======================================================================== */
function FacilityPicker() {
	const [choice, setChoice] = useState<"standby" | "partner">("standby");
	return (
		<>
			<h6 style={{ fontWeight: 700 }}>Step 1: Select Facility</h6>
			<label className={cx(s.radioCard, choice === "standby" && s.radioCardChecked)}>
				<input type="radio" name="emerg" checked={choice === "standby"} onChange={() => setChoice("standby")} />
				<strong>Standby Line — KES 200M</strong>
				<div className={s.radioCardSub}>Pre-approved • Instant activation • 0% fee</div>
			</label>
			<label className={cx(s.radioCard, choice === "partner" && s.radioCardChecked)}>
				<input type="radio" name="emerg" checked={choice === "partner"} onChange={() => setChoice("partner")} />
				<strong>Partner Credit Line — KES 150M</strong>
				<div className={s.radioCardSub}>Equity Bank • 2-hour activation • 2% fee</div>
			</label>
		</>
	);
}

/* ==========================================================================
 * Public component — renders every modal driven by the page's modalState map.
 * ======================================================================== */
export function LiquidityModals({ modalState, openModal, closeModal, data }: LiquidityModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);
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
								<h6 style={{ fontWeight: 700 }}>Step 1: Select Source &amp; Destination</h6>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField label="From (Source)" options={[...data.pools, ...data.banks]} />
									</div>
									<div className="col-md-6">
										<SelectField label="To (Destination)" options={["Stanbic Bank (KES 12.4M)", "Co-op Bank (KES 41.2M)", "Agent Float Pool (KES 119.3M)"]} />
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 2: Amount &amp; Reason</h6>
								<Field label="Amount (KES)" defaultValue="25000000" />
								<SelectField
									label="Reason"
									options={["Critical float replenishment", "Weekend surge preparation", "Partner settlement requirement", "Scheduled rebalancing"]}
								/>
								<div className="mb-3">
									<label className={s.fieldLabel}>Notes</label>
									<textarea
										className={s.field}
										rows={2}
										defaultValue="Emergency top-up for Stanbic due to unexpected salary run volume."
									/>
								</div>
							</>
						)}
						{step === 3 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 3: Approval &amp; Execution</h6>
								<div className={cx(s.reviewBox, "mb-3")}>
									<ReviewRow label="Amount" value="KES 25,000,000" />
									<ReviewRow label="Fee" value="KES 0 (internal)" />
									<div className="d-flex justify-content-between">
										<span style={{ fontWeight: 700 }}>Total Movement</span>
										<strong style={{ fontSize: 18, color: "var(--pri)" }}>KES 25,000,000</strong>
									</div>
								</div>
								<label className={cx(s.fieldLabel, "d-block text-center")}>Enter Approval PIN</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>Rebalance Executed Successfully</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>
									KES 25M transferred from PayMo Main Pool to Stanbic Bank. New balance: KES 37.4M.
								</p>
								<div className={cx(s.reviewBox, "text-start mt-3")}>
									<ReviewRow label="Reference" value="RB-44291" />
									<ReviewRow label="Executed" value="27 Jun 2025, 14:22" />
									<ReviewRow label="Approved by" value="System (Auto)" />
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
				title="Top-up Bank Float"
				submitLabel="Execute Top-up"
				successMsg="Bank float topped up successfully! Reference: TP-44292"
			>
				<SelectField label="Bank" options={["Stanbic Bank (KES 12.4M)", "Co-op Bank (KES 41.2M)", "Equity Bank (KES 98.4M)"]} />
				<Field label="Amount (KES)" defaultValue="25000000" />
				<SelectField label="Source" options={["PayMo Main Pool", "Emergency Reserve", "KCB Bank"]} />
				<SelectField label="Reason" options={["Critical float replenishment", "Scheduled top-up", "Partner request"]} />
			</SimpleModal>

			{/* ============ M3: Agent Float (tabbed) ============ */}
			<TabbedModal
				show={isOpen("agentFloatModal")}
				onClose={() => close("agentFloatModal")}
				iconCls="bi bi-people"
				title="Agent Float Management"
				tabs={[
					{
						key: "low",
						label: "Low Float",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Agent</th>
											<th>Location</th>
											<th>Current</th>
											<th>Min</th>
											<th>Status</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>
												<button type="button" className={s.btnLink} onClick={() => swap("agentFloatModal", "agentDetailModal")}>
													John's M-Pesa
												</button>
											</td>
											<td>Kawangware</td>
											<td>KES 18,400</td>
											<td>KES 50,000</td>
											<td>
												<span className={cx(s.badge, s.badgeDanger)}>Critical</span>
											</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm, s.btnDangerGhost)} onClick={() => swap("agentFloatModal", "agentTopupModal")}>
													Top-up
												</button>
											</td>
										</tr>
										<tr>
											<td>
												<button type="button" className={s.btnLink} onClick={() => swap("agentFloatModal", "agentDetailModal")}>
													Peter Agent
												</button>
											</td>
											<td>Embakasi</td>
											<td>KES 12,800</td>
											<td>KES 35,000</td>
											<td>
												<span className={cx(s.badge, s.badgeDanger)}>Critical</span>
											</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm, s.btnDangerGhost)} onClick={() => swap("agentFloatModal", "agentTopupModal")}>
													Top-up
												</button>
											</td>
										</tr>
										<tr>
											<td>
												<button type="button" className={s.btnLink} onClick={() => swap("agentFloatModal", "agentDetailModal")}>
													Grace Kiosk
												</button>
											</td>
											<td>Kayole</td>
											<td>KES 29,100</td>
											<td>KES 40,000</td>
											<td>
												<span className={cx(s.badge, s.badgeWarn)}>Low</span>
											</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("agentFloatModal", "agentTopupModal")}>
													Top-up
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "rules",
						label: "Auto Rules",
						render: () => (
							<>
								<SwitchRow label="Auto top-up when below" sub="KES 30,000" />
								<SwitchRow label="Top-up amount" sub="KES 50,000" />
								<SwitchRow label="Max daily top-ups per agent" sub="3" />
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
											<th>Time</th>
											<th>Agent</th>
											<th>Amount</th>
											<th>Method</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>27 Jun 09:10</td>
											<td>John's M-Pesa</td>
											<td>KES 50,000</td>
											<td>Auto</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>Success</span>
											</td>
										</tr>
										<tr>
											<td>26 Jun 18:45</td>
											<td>Peter Agent</td>
											<td>KES 35,000</td>
											<td>Manual</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>Success</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
				]}
			/>

			{/* ============ M4: Agent Top-up ============ */}
			<SimpleModal
				show={isOpen("agentTopupModal")}
				onClose={() => close("agentTopupModal")}
				iconCls="bi bi-people"
				title="Top-up Agent Float"
				submitLabel="Top-up Agent"
				successMsg="Agent float topped up successfully! Reference: AG-44293"
			>
				<SelectField label="Agent" options={data.agents} />
				<Field label="Amount (KES)" defaultValue="50000" />
				<SelectField label="Method" options={["Auto (from Agent Pool)", "Manual from PayMo Main", "From Partner Float"]} />
			</SimpleModal>

			{/* ============ M5: Bulk Top-up ============ */}
			<SimpleModal
				show={isOpen("bulkTopupModal")}
				onClose={() => close("bulkTopupModal")}
				iconCls="bi bi-upload"
				title="Bulk Float Top-up"
				size="lg"
				submitLabel="Execute Bulk Top-up"
				successMsg="Bulk top-up of 47 agents completed successfully! Reference: BLK-44294"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Upload CSV (Agent ID, Amount)</label>
					<input type="file" className={s.field} />
				</div>
				<div className={s.reviewBox} style={{ fontSize: 12 }}>
					<strong>Preview (first 5 rows):</strong>
					<br />
					AG-001,50000
					<br />
					AG-007,35000
					<br />
					AG-012,50000
					<br />
					AG-019,25000
					<br />
					AG-023,50000
				</div>
				<div className="mt-3">
					<label className={s.fieldLabel}>Total Agents: 47 | Total Amount: KES 1,875,000</label>
				</div>
			</SimpleModal>

			{/* ============ M6: Emergency Liquidity (danger multi-step) ============ */}
			<DangerFlowModal show={isOpen("emergencyLiquidityModal")} onClose={() => close("emergencyLiquidityModal")}>
				{(step) => (
					<>
						{step === 1 && <FacilityPicker />}
						{step === 2 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 2: Amount &amp; Destination</h6>
								<Field label="Amount (KES)" defaultValue="120000000" />
								<SelectField label="Destination" options={["Stanbic Bank Float", "Co-op Bank Float", "Agent Float Pool"]} />
								<div className="mb-3">
									<label className={s.fieldLabel}>Justification</label>
									<textarea
										className={s.field}
										rows={2}
										defaultValue="Critical shortfall predicted at +36h due to weekend salary run. Immediate action required to prevent agent outages."
									/>
								</div>
							</>
						)}
						{step === 3 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 3: Executive Approval</h6>
								<div className={cx(s.hintBox, s.hintBoxDanger, "mb-3")}>
									<i className="bi bi-exclamation-triangle" />
									<span>
										<strong>Emergency activation requires CFO + CEO dual approval.</strong> System will notify both executives immediately.
									</span>
								</div>
								<label className={cx(s.fieldLabel, "d-block text-center")}>Enter Executive PIN</label>
								<PinRow />
							</>
						)}
					</>
				)}
			</DangerFlowModal>

			{/* ============ M7: Forecast (tabbed + apply action) ============ */}
			<ModalShell
				show={isOpen("forecastModal")}
				onClose={() => close("forecastModal")}
				size="lg"
				iconCls="bi bi-graph-up"
				title="Liquidity Forecast & Recommendations"
				footer={
					<>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("forecastModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => swap("forecastModal", "forecastApplyModal")}>
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
												<span className={cx(s.badge, s.badgeWarn)}>Variance</span>
											</td>
											<td>14:22</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("settlementModal", "reconciliationModal")}>
													Investigate
												</button>
											</td>
										</tr>
										<tr>
											<td>SB-44290</td>
											<td>KCB Bank</td>
											<td>KES 112.6M</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>Matched</span>
											</td>
											<td>11:45</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("settlementModal", "settlementDetailModal")}>
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
												<span className={cx(s.badge, s.badgeSuccess)}>Completed</span>
											</td>
										</tr>
										<tr>
											<td>25 Jun</td>
											<td>SB-44271</td>
											<td>KES 118.9M</td>
											<td>
												<span className={cx(s.badge, s.badgeSuccess)}>Completed</span>
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
				<SelectField label="Batch" options={["SB-44291 — Equity Bank (KES 87.4M)", "SB-44292 — Co-op Bank (KES 54.2M)"]} />
				<div className={cx(s.tile, s.tileWarn, "mb-3")}>
					<div style={{ fontSize: 13, fontWeight: 700, color: "var(--warning-mid)" }}>Variance Detected: KES 1,820,000</div>
					<div style={{ fontSize: 12 }}>Expected: KES 87,420,000 | Received: KES 85,600,000</div>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel}>Investigation Notes</label>
					<textarea
						className={s.field}
						rows={3}
						defaultValue="Discrepancy likely due to failed transaction reversal on 26 Jun. Awaiting confirmation from Equity Bank operations team."
					/>
				</div>
				<SelectField
					label="Resolution"
					options={["Accept variance and adjust float", "Request manual adjustment from bank", "Raise dispute with network", "Schedule full reconciliation meeting"]}
				/>
			</SimpleModal>

			{/* ============ M10: Threshold Config ============ */}
			<SimpleModal
				show={isOpen("thresholdModal")}
				onClose={() => close("thresholdModal")}
				iconCls="bi bi-sliders"
				title="Float Threshold Configuration"
				submitLabel="Save Thresholds"
				successMsg="Thresholds updated successfully!"
			>
				<Field label="Bank Float Minimum" defaultValue="25000000" />
				<Field label="Agent Float Minimum" defaultValue="30000" />
				<Field label="Partner Float Minimum" defaultValue="50000000" />
				<SelectField label="Alert when below % of minimum" options={["80%", "70%", "60%"]} />
				<div className="form-check mb-2">
					<input className="form-check-input" type="checkbox" defaultChecked id="liqNotify" />
					<label className="form-check-label" style={{ fontSize: 13 }} htmlFor="liqNotify">
						Auto-notify on threshold breach
					</label>
				</div>
				<div className="form-check">
					<input className="form-check-input" type="checkbox" defaultChecked id="liqReplenish" />
					<label className="form-check-label" style={{ fontSize: 13 }} htmlFor="liqReplenish">
						Auto-replenish when possible
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
				successMsg="Scenario plan saved and added to calendar."
			>
				<SelectField
					label="Scenario"
					options={["Weekend salary run (+40% volume)", "Partner outage (Safaricom)", "Bank holiday (all banks closed)", "Black Friday surge (+80% volume)"]}
				/>
				<div className={cx(s.tile, s.tileInfo, "mb-3")}>
					<div style={{ fontSize: 13, fontWeight: 700, color: "var(--info-mid)" }}>Impact Analysis</div>
					<div style={{ fontSize: 12 }}>Float requirement increases to KES 2.45B. Recommended buffer: KES 450M.</div>
				</div>
				<SelectField
					label="Pre-emptive Action"
					options={["Increase all bank float by 25%", "Activate emergency line", "Notify all agents of possible delays", "Schedule manual rebalancing"]}
				/>
			</SimpleModal>

			{/* ============ M12: Governance (tabbed) ============ */}
			<ModalShell
				show={isOpen("governanceModal")}
				onClose={() => close("governanceModal")}
				size="lg"
				iconCls="bi bi-file-earmark-check"
				title="Governance & Audit"
				footer={
					<>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("governanceModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => close("governanceModal")}>
							Export Audit
						</button>
					</>
				}
			>
				<GovernanceTabs />
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
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("liquidityHealthModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => swap("liquidityHealthModal", "rebalanceModal")}>
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
								<td>Stanbic Bank</td>
								<td>KES 12.4M</td>
								<td>
									<span className={cx(s.badge, s.badgeDanger)}>Critical</span>
								</td>
								<td>High</td>
							</tr>
							<tr>
								<td>Co-op Bank</td>
								<td>KES 41.2M</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>Warning</span>
								</td>
								<td>Medium</td>
							</tr>
							<tr>
								<td>Agent Pool</td>
								<td>KES 119.3M</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>Warning</span>
								</td>
								<td>Medium</td>
							</tr>
							<tr>
								<td>KCB Bank</td>
								<td>KES 142.8M</td>
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
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => swap("floatAlertModal", "thresholdModal")}>
							Configure
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => close("floatAlertModal")}>
							Close
						</button>
					</>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					<div className={cx(s.tile, s.tileDanger, "mb-2")}>
						<strong>Stanbic Bank critical</strong>
						<div className={s.tileSub}>12.4M / 25M threshold • 2h ago</div>
					</div>
					<div className={cx(s.tile, s.tileWarn, "mb-2")}>
						<strong>Co-op Bank warning</strong>
						<div className={s.tileSub}>41.2M / 45M threshold • 4h ago</div>
					</div>
					<div className={cx(s.tile, s.tileInfo, "mb-2")}>
						<strong>12 agents below minimum</strong>
						<div className={s.tileSub}>Auto-replenishment failed • 6h ago</div>
					</div>
					<div className={cx(s.tile, "mb-2")}>
						<strong>Settlement variance detected</strong>
						<div className={s.rowSub}>Equity Bank batch • 8h ago</div>
					</div>
				</div>
			</ModalShell>

			{/* ============ M15: Internal Transfer ============ */}
			<SimpleModal
				show={isOpen("internalTransferModal")}
				onClose={() => close("internalTransferModal")}
				iconCls="bi bi-arrow-left-right"
				title="Internal Float Transfer"
				submitLabel="Execute Transfer"
				successMsg="Internal transfer completed successfully! Reference: IT-44295"
			>
				<SelectField label="From Pool" options={data.pools} />
				<SelectField label="To Pool" options={["Agent Float Pool (KES 119.3M)", "Partner Settlement (KES 67.8M)", "PayMo Main Pool (KES 284.6M)"]} />
				<Field label="Amount (KES)" defaultValue="50000000" />
				<SelectField label="Reason" options={["Agent replenishment", "Partner settlement", "Internal rebalancing"]} />
			</SimpleModal>

			{/* ============ M16: Partner Top-up ============ */}
			<SimpleModal
				show={isOpen("partnerTopupModal")}
				onClose={() => close("partnerTopupModal")}
				iconCls="bi bi-building"
				title="Partner Float Top-up"
				submitLabel="Top-up Partner"
				successMsg="Partner float topped up successfully! Reference: PT-44296"
			>
				<SelectField label="Partner" options={data.partners} />
				<Field label="Amount (KES)" defaultValue="100000000" />
				<SelectField label="Source" options={["PayMo Main Pool", "Emergency Reserve"]} />
			</SimpleModal>

			{/* ============ M17: Liquidity Report ============ */}
			<SimpleModal
				show={isOpen("liquidityReportModal")}
				onClose={() => close("liquidityReportModal")}
				iconCls="bi bi-download"
				title="Export Liquidity Report"
				submitLabel="Generate Report"
				successMsg="Report generated and downloading…"
			>
				<SelectField
					label="Report Type"
					options={["Full liquidity snapshot", "Float movement history", "Agent float report", "Settlement reconciliation", "Emergency activation log"]}
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
					<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("attentionModal")}>
						Close
					</button>
				}
			>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Stanbic Bank critical</div>
						<div className={s.rowSub}>KES 12.4M remaining</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm, s.btnDangerGhost)} onClick={() => swap("attentionModal", "emergencyLiquidityModal")}>
						Emergency
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Co-op Bank warning</div>
						<div className={s.rowSub}>KES 41.2M remaining</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("attentionModal", "topupBankModal")}>
						Top-up
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>47 agents below minimum</div>
						<div className={s.rowSub}>Auto-replenishment failed</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("attentionModal", "agentFloatModal")}>
						Review
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Settlement variance</div>
						<div className={s.rowSub}>KES 1.8M mismatch</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("attentionModal", "reconciliationModal")}>
						Investigate
					</button>
				</div>
			</ModalShell>

			{/* ============ M19: Profile ============ */}
			<ModalShell
				show={isOpen("profileModal")}
				onClose={() => close("profileModal")}
				iconCls="bi bi-person-circle"
				title="Profile"
				footer={
					<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("profileModal")}>
						Close
					</button>
				}
			>
				<div className="text-center">
					<div className={cx(s.avatar, s.avatarLg)}>JK</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
					<p style={{ fontSize: 13, color: "var(--ink-500)" }}>james.kamau@email.com · +254 712 345 890</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={s.softBox}>
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>Float Managed</span>
								<br />
								<strong>KES 1.84B</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={s.softBox}>
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>Health Score</span>
								<br />
								<strong style={{ color: "var(--pri)" }}>87/100</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={s.softBox}>
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>Alerts Today</span>
								<br />
								<strong>14</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={s.softBox}>
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>Rebalances</span>
								<br />
								<strong>23 this week</strong>
							</div>
						</div>
					</div>
				</div>
			</ModalShell>

			{/* ============ M20: Quick Agent Top-up ============ */}
			<SimpleModal
				show={isOpen("agentTopupQuickModal")}
				onClose={() => close("agentTopupQuickModal")}
				iconCls="bi bi-people"
				title="Quick Agent Top-up"
				submitLabel="Top-up"
				successMsg="Agent topped up successfully! Reference: AG-44297"
			>
				<SelectField label="Agent" options={["John's M-Pesa (KES 18,400)", "Peter Agent (KES 12,800)"]} />
				<Field label="Amount (KES)" defaultValue="50000" />
			</SimpleModal>

			{/* ============ M21: Forecast Apply ============ */}
			<SimpleModal
				show={isOpen("forecastApplyModal")}
				onClose={() => close("forecastApplyModal")}
				iconCls="bi bi-graph-up"
				title="Apply Forecast Recommendations"
				submitLabel="Apply All"
				successMsg="Recommendations applied to your task list!"
			>
				<div className={cx(s.tile, s.tileInfo, "mb-3")}>
					<div style={{ fontSize: 13, fontWeight: 700, color: "var(--info-mid)" }}>Recommended Actions:</div>
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
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("settlementDetailModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => swap("settlementDetailModal", "reconciliationModal")}>
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

			{/* ============ M23: Quick Rebalance ============ */}
			<SimpleModal
				show={isOpen("quickRebalanceModal")}
				onClose={() => close("quickRebalanceModal")}
				iconCls="bi bi-arrow-left-right"
				title="Quick Rebalance"
				submitLabel="Execute"
				successMsg="Quick rebalance completed! Reference: QR-44298"
			>
				<SelectField label="From" options={["PayMo Main Pool", "KCB Bank"]} />
				<SelectField label="To" options={["Stanbic Bank", "Co-op Bank"]} />
				<Field label="Amount (KES)" defaultValue="25000000" />
			</SimpleModal>

			{/* ============ M24: Agent Detail ============ */}
			<ModalShell
				show={isOpen("agentDetailModal")}
				onClose={() => close("agentDetailModal")}
				iconCls="bi bi-person-badge"
				title="Agent Detail"
				footer={
					<>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("agentDetailModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => swap("agentDetailModal", "agentTopupModal")}>
							Top-up Now
						</button>
					</>
				}
			>
				<div className={s.reviewBox}>
					<ReviewRow label="Agent" value="John's M-Pesa" />
					<ReviewRow label="Location" value="Kawangware" />
					<ReviewRow label="Current Float" value="KES 18,400" />
					<ReviewRow label="Minimum" value="KES 50,000" />
					<ReviewRow label="Last Top-up" value="26 Jun 2025" />
				</div>
			</ModalShell>

			{/* ============ M25: Internal Pool Detail ============ */}
			<ModalShell
				show={isOpen("internalPoolModal")}
				onClose={() => close("internalPoolModal")}
				iconCls="bi bi-droplet"
				title="Internal Pool Detail"
				footer={
					<>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("internalPoolModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => swap("internalPoolModal", "internalTransferModal")}>
							Transfer
						</button>
					</>
				}
			>
				<div className={s.reviewBox}>
					<ReviewRow label="Pool" value="PayMo Main Pool" />
					<ReviewRow label="Current Balance" value="KES 284,600,000" />
					<ReviewRow label="Reserved" value="KES 45,000,000" />
					<ReviewRow label="Available" value="KES 239,600,000" />
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
					<button key={t.key} type="button" className={cx(s.pill, tab === t.key && s.pillActive)} onClick={() => setTab(t.key)}>
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
							<div key={b.l} className={s.chartBar} style={{ height: `${b.h}%`, background: b.c }}>
								<span className={s.barLabel}>{b.l}</span>
							</div>
						))}
					</div>
					<div className="mt-4 pt-2" style={{ fontSize: 13 }}>
						<strong>Key Insight:</strong> Critical shortfall of KES 87.5M predicted at +36h. Recommended action: Top-up KES 120M before 06:00
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
					Monthly forecast shows recurring pattern of low float every 3rd weekend. Recommendation: Increase minimum float buffer by 25% during
					salary run periods.
				</div>
			)}
		</>
	);
}

/* --------------------------------------------------------------------------
 * GovernanceTabs — legacy M12 sw('gov', …) (Actions / Approvals / Audit Log).
 * ------------------------------------------------------------------------ */
function GovernanceTabs() {
	const [tab, setTab] = useState<"actions" | "approvals" | "audit">("actions");
	return (
		<>
			<div className={s.pills} style={{ marginBottom: 20 }}>
				{(
					[
						{ key: "actions", label: "Actions" },
						{ key: "approvals", label: "Approvals" },
						{ key: "audit", label: "Audit Log" },
					] as const
				).map((t) => (
					<button key={t.key} type="button" className={cx(s.pill, tab === t.key && s.pillActive)} onClick={() => setTab(t.key)}>
						{t.label}
					</button>
				))}
			</div>
			{tab === "actions" && (
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Action</th>
								<th>Amount</th>
								<th>Initiator</th>
								<th>Approver</th>
								<th>Time</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Emergency top-up</td>
								<td>KES 80M</td>
								<td>System</td>
								<td>CFO (auto)</td>
								<td>26 Jun 22:14</td>
							</tr>
							<tr>
								<td>Float rebalance override</td>
								<td>KES 45M</td>
								<td>Liquidity Mgr</td>
								<td>Treasurer</td>
								<td>25 Jun 14:02</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}
			{tab === "approvals" && (
				<>
					<div className={s.rowItem}>
						<div style={{ minWidth: 0 }}>
							<div className={s.rowTitle}>Threshold change request</div>
							<div className={s.rowSub}>Ops Lead → Risk Committee</div>
						</div>
						<span className={cx(s.badge, s.badgeSuccess)}>Approved</span>
					</div>
					<div className={s.rowItem}>
						<div style={{ minWidth: 0 }}>
							<div className={s.rowTitle}>Emergency line activation</div>
							<div className={s.rowSub}>CFO + CEO (Dual)</div>
						</div>
						<span className={cx(s.badge, s.badgeSuccess)}>Approved</span>
					</div>
				</>
			)}
			{tab === "audit" && (
				<div className={s.reviewBox} style={{ fontSize: 12 }}>
					Full audit trail available for download. All actions are immutable and timestamped with digital signatures.
				</div>
			)}
		</>
	);
}

export default LiquidityModals;
