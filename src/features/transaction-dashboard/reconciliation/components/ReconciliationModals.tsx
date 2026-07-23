/* ============================================================================
 * ReconciliationModals.tsx — all modals for Page 1.6 "Reconciliation Center".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.6.html modal blocks (openM/closeM + Bootstrap-JS).
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   flows.match / disc / bulk ....... <FlowModal> (Select→Confirm→Done stepper)
 *   flows.rule (inside sw() tabs) ... <RuleEngineModal> below — tab state +
 *                                     step state composed in one component
 *   sw(prefix,key,btn) tabs ......... useState active-key switching
 *   doAction() loading + receipt .... <SimpleModal> phase (form→loading→done)
 *   cacheAndReset() innerHTML 420 ... React remounts each modal on open
 *   duplicate legacy #filterModal ... consolidated into ONE Advanced Filters
 *                                     modal (both legacy versions merged)
 *
 * Modals that open other modals (legacy stacked Bootstrap instances) now close
 * the current modal and open the next — same destination, no backdrop pile-up.
 * ========================================================================== */
"use client";
import { useEffect, useState } from "react";
import { FlowModal, ModalShell, ReviewRow, SimpleModal } from "../../../../shared/components/modals";
import { cx } from "../../../shell/data/shellData";
import styles from "../styles/reconciliation.module.css";

const s = styles as Record<string, string>;

/* --------------------------------------------------------------------------
 * Data the page injects (mirrors GET /api/reconciliation-center).
 * ------------------------------------------------------------------------ */
export interface ReconciliationData {
	banks: string[];
}

export interface ReconciliationModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	data: ReconciliationData;
}

/* --------------------------------------------------------------------------
 * Small local helpers (styled by THIS page's stylesheet)
 * ------------------------------------------------------------------------ */
function Field({
	label,
	defaultValue,
	type = "text",
	placeholder,
	className = "mb-3",
}: {
	label?: string;
	defaultValue?: string;
	type?: string;
	placeholder?: string;
	className?: string;
}) {
	return (
		<div className={className}>
			{label && <label className={s.fieldLabel}>{label}</label>}
			<input type={type} className={s.field} defaultValue={defaultValue} placeholder={placeholder} />
		</div>
	);
}

function SelectField({
	label,
	options,
	className = "mb-3",
}: {
	label: string;
	options: string[];
	className?: string;
}) {
	return (
		<div className={className}>
			<label className={s.fieldLabel}>{label}</label>
			<select className={cx(s.field, s.select)}>
				{options.map((o) => (
					<option key={o}>{o}</option>
				))}
			</select>
		</div>
	);
}

function StepTitle({ children }: { children: string }) {
	return <h6 style={{ fontWeight: 700 }}>{children}</h6>;
}

/* ==========================================================================
 * BulkItemPicker — legacy M4 Step 1 checkbox rows with a live selected total.
 * ======================================================================== */
const BULK_ITEMS = [
	{ ref: "EQ-882910", amount: "KES 2,800,000", match: "96% match", tone: s.badgeSuccess, checked: true },
	{ ref: "KCB-991028", amount: "KES 2,800,000", match: "94% match", tone: s.badgeSuccess, checked: true },
	{ ref: "COOP-77102", amount: "KES 450,000", match: "72% match", tone: s.badgeWarn, checked: false },
];

function BulkItemPicker() {
	const [selected, setSelected] = useState<boolean[]>(BULK_ITEMS.map((i) => i.checked));
	const count = selected.filter(Boolean).length;
	const total = BULK_ITEMS.filter((_, i) => selected[i])
		.map((i) => Number(i.amount.replace(/[^\d]/g, "")))
		.reduce((a, b) => a + b, 0);
	return (
		<>
			<StepTitle>Step 1: Select Items</StepTitle>
			{BULK_ITEMS.map((item, i) => (
				<label key={item.ref} className={s.checkRow}>
					<input
						className="form-check-input"
						type="checkbox"
						checked={selected[i]}
						onChange={() => setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
					/>
					<span className={s.checkRowLabel}>
						<span>
							{item.ref} • {item.amount}
						</span>
						<span className={cx(s.badge, item.tone)}>{item.match}</span>
					</span>
				</label>
			))}
			<div className="mt-2">
				<strong>
					Selected: {count} items • Total KES {total.toLocaleString("en-US")}
				</strong>
			</div>
		</>
	);
}

/* ==========================================================================
 * RuleEngineModal — legacy M3: sw() tabs + flows.rule combined.
 *   Create Rule : 4-step wizard (Basics → Conditions → Actions → Done)
 *   Active Rules: table of live rules
 *   Test Rule   : sample inputs + Run Test (doAction)
 * ======================================================================== */
function RuleEngineModal({
	show,
	onClose,
	openPerformance,
}: {
	show: boolean;
	onClose: () => void;
	openPerformance: () => void;
}) {
	const [tab, setTab] = useState<"create" | "list" | "test">("create");
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [testDone, setTestDone] = useState(false);

	const labels = ["Basics", "Conditions", "Actions", "Done"];
	const total = labels.length;

	// reset when (re)opened — replaces legacy cacheAndReset()
	useEffect(() => {
		if (show) {
			setTab("create");
			setStep(1);
			setLoading(false);
			setTestDone(false);
		}
	}, [show]);

	const isLast = step === total;
	const next = () => {
		if (step === total - 1) {
			setLoading(true);
			setTimeout(() => {
				setLoading(false);
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

	const runTest = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setTestDone(true);
		}, 1500);
	};

	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="xl"
			iconCls="bi bi-magic"
			title="Auto-Reconciliation Rules Engine"
			footer={
				<>
					<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={onClose}>
						Close
					</button>
					{tab === "create" && (
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={next}>
							{isLast ? "Done" : step === total - 1 ? "Create Rule" : "Continue"} {!isLast && <i className="bi bi-arrow-right" />}
						</button>
					)}
					{tab === "test" && !testDone && (
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={runTest}>
							Run Test
						</button>
					)}
				</>
			}
		>
			<div style={{ position: "relative", minHeight: 200 }}>
				<div className={s.pills} style={{ marginBottom: 20 }}>
					{(
						[
							{ key: "create", label: "Create Rule" },
							{ key: "list", label: "Active Rules" },
							{ key: "test", label: "Test Rule" },
						] as const
					).map((t) => (
						<button key={t.key} type="button" className={cx(s.pill, tab === t.key && s.pillActive)} onClick={() => setTab(t.key)}>
							{t.label}
						</button>
					))}
				</div>

				{tab === "create" && (
					<>
						{!isLast && (
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
						)}
						{step === 1 && (
							<>
								<StepTitle>Step 1: Rule Basics</StepTitle>
								<div className="row g-3">
									<div className="col-md-6">
										<Field label="Rule Name" defaultValue="Payroll Auto-Match v2" className="" />
									</div>
									<div className="col-md-6">
										<SelectField label="Applies To" options={["Equity → KCB", "All Banks", "M-Pesa B2B"]} className="" />
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<>
								<StepTitle>Step 2: Matching Conditions</StepTitle>
								<div className="row g-3">
									<div className="col-md-4">
										<Field label="Amount Tolerance" defaultValue="± KES 500" className="" />
									</div>
									<div className="col-md-4">
										<SelectField label="Date Window" options={["± 1 day", "± 3 days", "Same day only"]} className="" />
									</div>
									<div className="col-md-4">
										<Field label="Reference Prefix" defaultValue="PAY-" className="" />
									</div>
								</div>
								<div className="mt-3">
									<label className={s.fieldLabel}>Additional Conditions</label>
									<div className="form-check mb-1">
										<input className="form-check-input" type="checkbox" defaultChecked id="condCredit" />
										<label className="form-check-label" style={{ fontSize: 13 }} htmlFor="condCredit">
											Must be credit on receiving bank
										</label>
									</div>
									<div className="form-check">
										<input className="form-check-input" type="checkbox" defaultChecked id="condDesc" />
										<label className="form-check-label" style={{ fontSize: 13 }} htmlFor="condDesc">
											Description contains "payroll"
										</label>
									</div>
								</div>
							</>
						)}
						{step === 3 && (
							<>
								<StepTitle>Step 3: Actions &amp; Notifications</StepTitle>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField label="On Match" options={["Auto-confirm", "Require review", "Notify team"]} className="" />
									</div>
									<div className="col-md-6">
										<SelectField label="Notify On" options={["Match success", "Match failure", "Both"]} className="" />
									</div>
								</div>
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>Rule Created Successfully</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>Payroll Auto-Match v2 will run on every incoming statement.</p>
							</div>
						)}
					</>
				)}

				{tab === "list" && (
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Rule</th>
									<th>Conditions</th>
									<th>Match Rate</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Payroll Auto-Match v2</td>
									<td>Amount ±500, Ref PAY-</td>
									<td>99.2%</td>
									<td>
										<span className={cx(s.badge, s.badgeSuccess)}>Active</span>
									</td>
									<td>
										<button type="button" className={cx(s.btn, s.btnSm)} onClick={openPerformance}>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>Supplier Invoice</td>
									<td>Amount ±2%, 3-day window</td>
									<td>97.8%</td>
									<td>
										<span className={cx(s.badge, s.badgeSuccess)}>Active</span>
									</td>
									<td>
										<button type="button" className={cx(s.btn, s.btnSm)} onClick={openPerformance}>
											Edit
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				{tab === "test" && !testDone && (
					<div className={s.reviewBox}>
						<StepTitle>Test Rule Against Sample</StepTitle>
						<div className="row g-3 mt-2">
							<div className="col-md-6">
								<Field label="Test Amount" defaultValue="2,800,500" className="" />
							</div>
							<div className="col-md-6">
								<Field label="Test Reference" defaultValue="PAY-2025-0627-001" className="" />
							</div>
						</div>
					</div>
				)}
				{tab === "test" && testDone && (
					<div className={s.receipt}>
						<div className={s.receiptIcon}>
							<i className="bi bi-check-lg" />
						</div>
						<h5 className={s.receiptTitle}>Rule test passed! Match confidence 98%.</h5>
					</div>
				)}

				{loading && (
					<div className={s.loadingOverlay}>
						<div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem" }} />
						<p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--pri)" }}>Processing…</p>
					</div>
				)}
			</div>
		</ModalShell>
	);
}

/* ==========================================================================
 * Public component — renders every modal driven by the page's modalState map.
 * ======================================================================== */
export function ReconciliationModals({ modalState, openModal, closeModal, data }: ReconciliationModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);
	/** close current modal then open the next (legacy stacked instances) */
	const swap = (from: string, to: string) => {
		closeModal(from);
		openModal(to);
	};

	return (
		<>
			{/* ============ M1: Manual Match (multi-step, xl) ============ */}
			<FlowModal
				show={isOpen("manualMatchModal")}
				onClose={() => close("manualMatchModal")}
				iconCls="bi bi-hand-index"
				title="Manual Transaction Match"
				steps={["Select", "Confirm", "Done"]}
				confirmLabel="Confirm Match"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<StepTitle>Step 1: Select Unmatched Items</StepTitle>
								<div className="row g-3">
									<div className="col-md-6">
										<div className="p-3 border rounded" style={{ borderColor: "var(--border)" }}>
											<h6 style={{ fontSize: 13, fontWeight: 700 }}>Debit (Equity Bank)</h6>
											<div className={s.rowItem} style={{ borderBottom: "none", padding: "8px 0 0" }}>
												<div style={{ minWidth: 0 }}>
													<strong>EQ-882910</strong>
													<div className={s.rowSub}>27 Jun • Payroll transfer</div>
												</div>
												<strong>KES 2,800,000</strong>
											</div>
										</div>
									</div>
									<div className="col-md-6">
										<div className="p-3 border rounded" style={{ borderColor: "var(--border)" }}>
											<h6 style={{ fontSize: 13, fontWeight: 700 }}>Credit (KCB Bank)</h6>
											<div className={s.rowItem} style={{ borderBottom: "none", padding: "8px 0 0" }}>
												<div style={{ minWidth: 0 }}>
													<strong>KCB-991028</strong>
													<div className={s.rowSub}>27 Jun • Incoming transfer</div>
												</div>
												<strong>KES 2,800,000</strong>
											</div>
										</div>
									</div>
								</div>
								<div className="mt-3">
									<label className={s.fieldLabel}>Match Confidence</label>
									<div className={s.progress}>
										<div className={s.progressBar} style={{ width: "96%", background: "var(--success)" }} />
									</div>
									<div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>96% — Amount, date and reference prefix match</div>
								</div>
							</>
						)}
						{step === 2 && (
							<>
								<StepTitle>Step 2: Confirm Details &amp; Notes</StepTitle>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField label="Match Type" options={["Exact match", "Amount tolerance match", "Reference similarity match"]} className="" />
									</div>
									<div className="col-md-6">
										<Field label="Internal Reference" defaultValue="PAY-2025-0627-001" className="" />
									</div>
									<div className="col-12">
										<label className={s.fieldLabel}>Notes</label>
										<textarea className={s.field} rows={3} defaultValue="Payroll transfer from Equity to KCB for June salaries. Approved by Finance on 26 Jun." />
									</div>
								</div>
							</>
						)}
						{step === 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>Match Confirmed</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>Transaction EQ-882910 successfully matched to KCB-991028.</p>
								<div className={cx(s.reviewBox, "text-start mt-3")}>
									<ReviewRow label="Match ID" value="MATCH-20250627-88291" />
									<ReviewRow label="Amount" value="KES 2,800,000" />
									<ReviewRow label="Matched By" value="James K. (Manual)" />
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============ M2: Discrepancy / Exception (multi-step) ============ */}
			<FlowModal
				show={isOpen("discrepancyModal")}
				onClose={() => close("discrepancyModal")}
				iconCls="bi bi-exclamation-triangle"
				title="Flag Discrepancy / Exception"
				steps={["Details", "Issue", "Done"]}
				confirmLabel="Create Exception"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<StepTitle>Step 1: Transaction Details</StepTitle>
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField label="Bank" options={data.banks} className="" />
									</div>
									<div className="col-md-6">
										<Field label="Reference" defaultValue="EQ-991022" className="" />
									</div>
									<div className="col-md-6">
										<Field label="Amount" defaultValue="1,450,000" className="" />
									</div>
									<div className="col-md-6">
										<Field label="Date" type="date" defaultValue="2025-06-26" className="" />
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<>
								<StepTitle>Step 2: Issue &amp; Priority</StepTitle>
								<SelectField label="Issue Type" options={["Amount mismatch", "Duplicate transaction", "Missing reference", "FX rate difference", "Timing difference"]} />
								<div className="row g-3">
									<div className="col-md-6">
										<SelectField label="Priority" options={["High", "Medium", "Low"]} className="" />
									</div>
									<div className="col-md-6">
										<SelectField label="Assigned To" options={["James K.", "Grace M.", "Auto-assign"]} className="" />
									</div>
								</div>
								<div className="mb-3 mt-3">
									<label className={s.fieldLabel}>Description</label>
									<textarea
										className={s.field}
										rows={3}
										defaultValue="Amount on statement is KES 1,450,000 but expected was KES 1,500,000. Difference of KES 50,000 needs investigation."
									/>
								</div>
							</>
						)}
						{step === 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-flag" />
								</div>
								<h5 className={s.receiptTitle}>Exception Created</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>Exception EXC-20250627-9910 has been logged and assigned.</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============ M3: Rule Engine (tabs + wizard) ============ */}
			<RuleEngineModal
				show={isOpen("ruleEngineModal")}
				onClose={() => close("ruleEngineModal")}
				openPerformance={() => swap("ruleEngineModal", "rulePerformanceModal")}
			/>

			{/* ============ M4: Bulk Match (multi-step) ============ */}
			<FlowModal
				show={isOpen("bulkMatchModal")}
				onClose={() => close("bulkMatchModal")}
				iconCls="bi bi-collection"
				title="Bulk Transaction Matching"
				steps={["Select", "Review", "Done"]}
				confirmLabel="Confirm Match"
			>
				{(step) => (
					<>
						{step === 1 && <BulkItemPicker />}
						{step === 2 && (
							<>
								<StepTitle>Step 2: Review &amp; Confirm</StepTitle>
								<div className={cx(s.tile, s.tileSuccess)}>
									<div className="d-flex justify-content-between mb-1">
										<span>Items to match</span>
										<strong>2</strong>
									</div>
									<div className="d-flex justify-content-between mb-1">
										<span>Estimated time</span>
										<strong>12 seconds</strong>
									</div>
									<div className="d-flex justify-content-between">
										<span>Confidence</span>
										<strong>95%+</strong>
									</div>
								</div>
							</>
						)}
						{step === 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check2-all" />
								</div>
								<h5 className={s.receiptTitle}>Bulk Match Complete</h5>
								<p style={{ fontSize: 13, color: "var(--ink-500)" }}>2 transactions matched successfully. 0 exceptions created.</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============ M5: Upload Statement ============ */}
			<SimpleModal
				show={isOpen("uploadStatementModal")}
				onClose={() => close("uploadStatementModal")}
				iconCls="bi bi-upload"
				title="Upload Bank Statement"
				submitLabel="Upload & Process"
				successMsg="Statement uploaded and queued for processing. You will be notified when reconciliation is ready. Reference: STMT-20250627-001"
			>
				<SelectField label="Bank" options={data.banks} />
				<div className="mb-3">
					<label className={s.fieldLabel}>Statement Date Range</label>
					<div className="row g-3">
						<div className="col-6">
							<input type="date" className={s.field} defaultValue="2025-06-01" />
						</div>
						<div className="col-6">
							<input type="date" className={s.field} defaultValue="2025-06-27" />
						</div>
					</div>
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel}>Upload File (PDF / CSV / MT940)</label>
					<input type="file" className={s.field} />
				</div>
				<div className={cx(s.hintBox)}>
					<i className="bi bi-info-circle" />
					<span>Supported formats: PDF (Equity, KCB), CSV (Co-op), MT940 (Stanbic, international).</span>
				</div>
			</SimpleModal>

			{/* ============ M6: FX Rate Resolution ============ */}
			<SimpleModal
				show={isOpen("fxRateModal")}
				onClose={() => close("fxRateModal")}
				iconCls="bi bi-currency-exchange"
				title="Resolve FX Rate Difference"
				submitLabel="Resolve"
				successMsg="FX discrepancy resolved. Case logged for audit. Reference: FX-20250627-001"
			>
				<div className={cx(s.tile, s.tileDanger, "mb-3")}>
					<div className="d-flex justify-content-between mb-1">
						<span style={{ color: "var(--ink-500)" }}>Transaction</span>
						<strong>SWIFT-IN-88291</strong>
					</div>
					<div className="d-flex justify-content-between mb-1">
						<span style={{ color: "var(--ink-500)" }}>Amount</span>
						<strong>USD 125,000</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span style={{ color: "var(--ink-500)" }}>Expected Rate</span>
						<strong>129.45 KES/USD</strong>
					</div>
				</div>
				<Field label="Actual Rate Applied" defaultValue="128.80" />
				<div className="mb-3">
					<label className={s.fieldLabel}>Difference</label>
					<div className={cx(s.tile, s.tileWarn)}>
						<strong>KES 81,250 difference</strong> — Bank used lower rate
					</div>
				</div>
				<SelectField label="Resolution Action" options={["Accept bank rate (write-off)", "Dispute with bank", "Adjust internal records", "Request rate correction"]} />
			</SimpleModal>

			{/* ============ M7: Export Report ============ */}
			<SimpleModal
				show={isOpen("exportReportModal")}
				onClose={() => close("exportReportModal")}
				iconCls="bi bi-download"
				title="Export Reconciliation Report"
				submitLabel="Generate Export"
				successMsg="Report generated and downloading… Reference: RPT-20250627-001"
			>
				<SelectField
					label="Report Type"
					options={["Daily Reconciliation Summary", "Monthly Reconciliation Report", "Exception & Discrepancy Report", "Audit Trail Export", "Bank Reconciliation Certificate"]}
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
				<SelectField label="Format" options={["PDF (Signed)", "Excel (.xlsx)", "CSV", "MT940"]} />
				<SelectField label="Delivery" options={["Download now", "Email to finance@company.co.ke", "WhatsApp link"]} />
			</SimpleModal>

			{/* ============ M8: Audit Log (xl) ============ */}
			<SimpleModal
				show={isOpen("auditLogModal")}
				onClose={() => close("auditLogModal")}
				iconCls="bi bi-clock-history"
				title="Full Audit Trail"
				size="xl"
				submitLabel="Export Log"
				successMsg="Audit log exported to PDF."
			>
				<div className="d-flex gap-2 mb-3 flex-wrap">
					<select className={cx(s.field, s.select)} style={{ width: "auto" }}>
						<option>All Users</option>
						<option>James K.</option>
						<option>Grace M.</option>
						<option>System</option>
					</select>
					<select className={cx(s.field, s.select)} style={{ width: "auto" }}>
						<option>All Actions</option>
						<option>Match</option>
						<option>Flag</option>
						<option>Rule Run</option>
					</select>
					<input className={s.field} style={{ width: 220 }} placeholder="Search reference..." />
				</div>
				<div className={s.tableWrap} style={{ maxHeight: 400, overflowY: "auto" }}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Timestamp</th>
								<th>User</th>
								<th>Action</th>
								<th>Item</th>
								<th>Details</th>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>27 Jun 14:32</td>
								<td>James K.</td>
								<td>Manual Match</td>
								<td>EQ-882910</td>
								<td>Matched to KCB-991028</td>
								<td>
									<span className={cx(s.badge, s.badgeSuccess)}>Success</span>
								</td>
							</tr>
							<tr>
								<td>27 Jun 14:28</td>
								<td>System</td>
								<td>Auto-Rule</td>
								<td>47 items</td>
								<td>Payroll rule applied</td>
								<td>
									<span className={cx(s.badge, s.badgeSuccess)}>Success</span>
								</td>
							</tr>
							<tr>
								<td>27 Jun 13:55</td>
								<td>Grace M.</td>
								<td>Flag Exception</td>
								<td>KCB-99102</td>
								<td>Amount mismatch KES 50k</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>Flagged</span>
								</td>
							</tr>
							<tr>
								<td>27 Jun 12:10</td>
								<td>System</td>
								<td>Statement Upload</td>
								<td>Equity 27 Jun</td>
								<td>1,284 transactions</td>
								<td>
									<span className={cx(s.badge, s.badgeSuccess)}>Processed</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ============ M9: Rule Performance ============ */}
			<ModalShell
				show={isOpen("rulePerformanceModal")}
				onClose={() => close("rulePerformanceModal")}
				size="lg"
				iconCls="bi bi-graph-up"
				title="Rule Performance Dashboard"
				footer={
					<>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("rulePerformanceModal")}>
							Close
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => swap("rulePerformanceModal", "ruleEngineModal")}>
							Edit Rule
						</button>
					</>
				}
			>
				<div className="row g-3 mb-3">
					<div className="col-md-4">
						<div className={cx(s.tile, s.tileSuccess)}>
							<div className={s.tileTitle}>Match Rate</div>
							<div className={s.tileValue} style={{ fontSize: 28 }}>99.2%</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className={cx(s.tile, s.tileInfo)}>
							<div className={s.tileTitle}>Items Processed</div>
							<div className={s.tileValue} style={{ fontSize: 28 }}>12,481</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className={cx(s.tile, s.tileWarn)}>
							<div className={s.tileTitle}>False Positives</div>
							<div className={s.tileValue} style={{ fontSize: 28 }}>0.8%</div>
						</div>
					</div>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Week</th>
								<th>Matches</th>
								<th>Exceptions</th>
								<th>Accuracy</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Week 26</td>
								<td>2,841</td>
								<td>12</td>
								<td>99.6%</td>
							</tr>
							<tr>
								<td>Week 25</td>
								<td>2,712</td>
								<td>18</td>
								<td>99.3%</td>
							</tr>
							<tr>
								<td>Week 24</td>
								<td>2,654</td>
								<td>21</td>
								<td>99.2%</td>
							</tr>
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============ M10: Matched Filter ============ */}
			<SimpleModal
				show={isOpen("matchedFilterModal")}
				onClose={() => close("matchedFilterModal")}
				iconCls="bi bi-funnel"
				title="Filter Matched Items"
				submitLabel="Apply"
				successMsg="Filters applied."
			>
				<div className="row g-3">
					<div className="col-md-6">
						<SelectField label="Bank Pair" options={["All Pairs", "Equity ↔ KCB", "KCB ↔ M-Pesa"]} className="" />
					</div>
					<div className="col-md-6">
						<SelectField label="Matched By" options={["All", "System", "Manual"]} className="" />
					</div>
				</div>
			</SimpleModal>

			{/* ============ M11: Reconciliation Notifications ============ */}
			<ModalShell
				show={isOpen("reconcileNotifModal")}
				onClose={() => close("reconcileNotifModal")}
				iconCls="bi bi-bell"
				title="Reconciliation Notifications (14)"
				footer={
					<>
						<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => swap("reconcileNotifModal", "reconSettingsModal")}>
							Settings
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary)} onClick={() => close("reconcileNotifModal")}>
							Close
						</button>
					</>
				}
			>
				<div style={{ maxHeight: 400, overflowY: "auto" }}>
					<div className={cx(s.tile, s.tileDanger, "mb-2")}>
						<strong>High-value exception flagged</strong>
						<div className={s.tileSub}>KES 2.8M • EQ-882910</div>
					</div>
					<div className={cx(s.tile, s.tileWarn, "mb-2")}>
						<strong>Auto-recon completed</strong>
						<div className={s.tileSub}>42 items matched • 5 exceptions</div>
					</div>
					<div className={cx(s.tile, s.tileSuccess, "mb-2")}>
						<strong>Statement processed</strong>
						<div className={s.tileSub}>Equity Bank • 1,284 transactions</div>
					</div>
				</div>
			</ModalShell>

			{/* ============ M12: Reconciliation Settings ============ */}
			<SimpleModal
				show={isOpen("reconSettingsModal")}
				onClose={() => close("reconSettingsModal")}
				iconCls="bi bi-sliders"
				title="Reconciliation Settings"
				submitLabel="Save Settings"
				successMsg="Settings saved successfully."
			>
				<Field label="Default Amount Tolerance" defaultValue="KES 500" />
				<SelectField label="Default Date Window" options={["± 3 days", "± 1 day", "Same day"]} />
				<div className="form-check form-switch mb-2">
					<input className="form-check-input" type="checkbox" defaultChecked id="reconAuto" />
					<label className="form-check-label" style={{ fontSize: 13 }} htmlFor="reconAuto">
						Auto-run on statement upload
					</label>
				</div>
				<div className="form-check form-switch">
					<input className="form-check-input" type="checkbox" defaultChecked id="reconEmail" />
					<label className="form-check-label" style={{ fontSize: 13 }} htmlFor="reconEmail">
						Email daily summary
					</label>
				</div>
			</SimpleModal>

			{/* ============ M13: Team Access ============ */}
			<SimpleModal
				show={isOpen("teamAccessModal")}
				onClose={() => close("teamAccessModal")}
				iconCls="bi bi-people"
				title="Team Access & Permissions"
				submitLabel="Save Changes"
				successMsg="Permissions updated."
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>User</th>
								<th>Role</th>
								<th>Access</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>James K.</td>
								<td>Finance Manager</td>
								<td>
									<span className={cx(s.badge, s.badgeSuccess)}>Full</span>
								</td>
								<td>
									<button type="button" className={cx(s.btn, s.btnSm)}>Edit</button>
								</td>
							</tr>
							<tr>
								<td>Grace M.</td>
								<td>Reconciliation Lead</td>
								<td>
									<span className={cx(s.badge, s.badgeInfo)}>Match + Flag</span>
								</td>
								<td>
									<button type="button" className={cx(s.btn, s.btnSm)}>Edit</button>
								</td>
							</tr>
							<tr>
								<td>Auditor Team</td>
								<td>External Auditors</td>
								<td>
									<span className={cx(s.badge, s.badgeWarn)}>View Only</span>
								</td>
								<td>
									<button type="button" className={cx(s.btn, s.btnSm)}>Edit</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ============ M14: Dispute ============ */}
			<SimpleModal
				show={isOpen("disputeModal")}
				onClose={() => close("disputeModal")}
				iconCls="bi bi-flag"
				title="Raise Bank Dispute"
				submitLabel="Submit Dispute"
				successMsg="Dispute filed with bank. Ticket #DISP-88291 created."
			>
				<SelectField label="Bank" options={["Equity Bank", "KCB Bank"]} />
				<Field label="Reference" defaultValue="EQ-882910" />
				<SelectField label="Dispute Reason" options={["Incorrect amount", "Duplicate debit", "Failed credit", "FX error"]} />
				<div className="mb-3">
					<label className={s.fieldLabel}>Description</label>
					<textarea className={s.field} rows={3} defaultValue="Bank debited KES 2,800,000 but only KES 2,750,000 was authorized." />
				</div>
			</SimpleModal>

			{/* ============ M15: Advanced Filters (both legacy #filterModal merged) ============ */}
			<SimpleModal
				show={isOpen("filterModal")}
				onClose={() => close("filterModal")}
				iconCls="bi bi-funnel"
				title="Advanced Filters"
				submitLabel="Apply Filters"
				successMsg="Filters applied to workbench."
			>
				<div className="row g-3">
					<div className="col-md-6">
						<SelectField label="Status" options={["All", "Unmatched", "Exception"]} className="" />
					</div>
					<div className="col-md-6">
						<SelectField label="Priority" options={["All", "High", "Medium"]} className="" />
					</div>
					<div className="col-md-6">
						<SelectField label="Bank" options={["All Banks", "Equity", "KCB", "Co-op", "Stanbic"]} className="" />
					</div>
					<div className="col-md-6">
						<Field label="Amount Range" placeholder="Min - Max" className="" />
					</div>
					<div className="col-md-6">
						<Field label="Date From" type="date" className="" />
					</div>
					<div className="col-md-6">
						<Field label="Date To" type="date" className="" />
					</div>
				</div>
			</SimpleModal>

			{/* ============ Run Auto-Reconciliation ============ */}
			<SimpleModal
				show={isOpen("runAutoReconModal")}
				onClose={() => close("runAutoReconModal")}
				iconCls="bi bi-magic"
				title="Run Auto-Reconciliation"
				submitLabel="Start Auto-Recon"
				successMsg="Auto-reconciliation completed. 42 items matched, 5 exceptions created. Reference: AUTO-20250627-001"
			>
				<p style={{ fontSize: 14 }}>Auto-reconciliation will process all pending items using active rules.</p>
				<div className={cx(s.tile, s.tileSuccess)}>
					<div className="d-flex justify-content-between mb-1">
						<span>Items to process</span>
						<strong>47</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span>Estimated time</span>
						<strong>45 seconds</strong>
					</div>
				</div>
			</SimpleModal>

			{/* ============ Attention (full list) ============ */}
			<ModalShell
				show={isOpen("attentionFullModal")}
				onClose={() => close("attentionFullModal")}
				iconCls="bi bi-exclamation-circle"
				title="All Items Requiring Attention"
				footer={
					<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("attentionFullModal")}>
						Close
					</button>
				}
			>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>Equity credit not matched</div>
						<div className={s.rowSub}>KES 2.8M</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("attentionFullModal", "manualMatchModal")}>
						Match
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>KCB debit duplicate</div>
						<div className={s.rowSub}>KES 450k</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("attentionFullModal", "discrepancyModal")}>
						Review
					</button>
				</div>
				<div className={s.rowItem}>
					<div style={{ minWidth: 0 }}>
						<div className={s.rowTitle}>SWIFT FX rate pending</div>
						<div className={s.rowSub}>USD 125k</div>
					</div>
					<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => swap("attentionFullModal", "fxRateModal")}>
						Resolve
					</button>
				</div>
			</ModalShell>

			{/* ============ Health Check ============ */}
			<ModalShell
				show={isOpen("healthCheckModal")}
				onClose={() => close("healthCheckModal")}
				size="lg"
				iconCls="bi bi-heart-pulse"
				title="Reconciliation Health Check"
				footer={
					<button type="button" className={cx(s.btn, s.btnSecondary)} onClick={() => close("healthCheckModal")}>
						Close
					</button>
				}
			>
				<div className="row g-3 mb-3">
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileSuccess, s.tileCenter)}>
							<div className={s.tileValue}>94.7</div>
							<div className={s.tileTitle}>Match Rate</div>
						</div>
					</div>
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileInfo, s.tileCenter)}>
							<div className={s.tileValue}>6</div>
							<div className={s.tileTitle}>Banks</div>
						</div>
					</div>
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tileWarn, s.tileCenter)}>
							<div className={s.tileValue}>47</div>
							<div className={s.tileTitle}>Exceptions</div>
						</div>
					</div>
					<div className="col-md-3 col-6">
						<div className={cx(s.tile, s.tilePurple, s.tileCenter)}>
							<div className={s.tileValue}>14m</div>
							<div className={s.tileTitle}>Avg Resolve</div>
						</div>
					</div>
				</div>
				<div className={cx(s.tile, s.tileSuccess)} style={{ fontSize: 12 }}>
					<i className="bi bi-check-circle me-1" /> All systems operational. Last full reconciliation completed successfully at 14:12.
				</div>
			</ModalShell>

			{/* ============ Profile ============ */}
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
					<p style={{ fontSize: 13, color: "var(--ink-500)" }}>james.k@email.com · +254 712 345 890</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={s.softBox}>
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>Role</span>
								<br />
								<strong>Finance Manager</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={s.softBox}>
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>Reconciliations</span>
								<br />
								<strong>124,892</strong>
							</div>
						</div>
					</div>
				</div>
			</ModalShell>
		</>
	);
}

export default ReconciliationModals;
