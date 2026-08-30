"use client";

import {
	Field,
	FlowModal,
	InfoBox,
	ModalShell,
	PinRow,
	SelectField,
	SimpleModal,
} from "../../shared/components/modals";
import s from "../../shared/styles/appPage.module.css";
import styles from "../styles/kraGovernment.module.css";

/* ============================================================================
   KRA & Government — modal layer on the SHARED primitives
   (ModalShell / SimpleModal / FlowModal / TabbedModal). No legacy MBox.
   19 modals, all reachable from the page (18 via direct triggers — incl.
   govNotifModal bell — + govReceiptModal via government-service rows);
   cross-modal navigation via onOpen (health → pay, optimizer → file,
   history → receipt/track, attention → file/pay/eCitizen).
   Legacy dead/duplicate ids removed: profileModal (shell chrome),
   taxOptimizerModal2 (duplicate stub of taxOptimizerModal); orphaned legacy
   payECitizen / payCounty / payArdhisasa / trackGov / govReceipt / govNotif
   modals are now wired into page workflows.
   ========================================================================== */

const shared = s as Record<string, string>;

function downloadFile(name: string, content: string, type = "text/plain") {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

/* ---------- option lists ---------- */
const KRA_ENTITIES = [
	"A012345678Y — James Kamau (PAYE)",
	"P987654321Z — JK Holdings (VAT)",
	"R445566778X — Rental Portfolio (TOT)",
	"C112233445W — JK Investments (CGT)",
];
const TAX_TYPES = ["PAYE", "VAT", "TOT", "CGT", "Withholding Tax"];
const PAY_METHODS = [
	"PayMo Wallet (KES 124,500)",
	"M-Pesa (0712***890)",
	"Equity Bank ***4521",
];
const PAY_SCHEDULES = [
	"Pay immediately",
	"Schedule for 10 Jul",
	"Recurring monthly",
];
const FILE_PINS = [
	"P987654321Z — JK Holdings Ltd (VAT)",
	"A012345678Y — James Kamau (PAYE)",
];
const RETURN_PERIODS = ["June 2025", "May 2025", "April 2025"];
const ECITIZEN_SERVICES = [
	"Passport Renewal — KES 4,500",
	"Driving Licence Renewal — KES 3,200",
	"Police Clearance — KES 1,000",
	"Good Conduct Certificate — KES 1,000",
	"Business Registration — KES 12,500",
];
const ECITIZEN_METHODS = ["M-Pesa", "PayMo Wallet", "Bank Transfer"];
const COUNTIES = [
	"Nairobi City County",
	"Kiambu County",
	"Nakuru County",
	"Mombasa County",
];
const COUNTY_SERVICES = [
	"Single Business Permit — KES 18,500",
	"Land Rates — KES 42,300",
	"Health Permit — KES 7,800",
	"Fire Safety Certificate — KES 4,200",
];
const ARDHISASA_SERVICES = [
	"Title Deed Processing — KES 28,500",
	"Stamp Duty — KES 124,000",
	"Lease Renewal — KES 15,200",
	"Change of User — KES 45,000",
];
const ARD_METHODS = ["PayMo Wallet", "Bank Transfer"];
const SCHED_TYPES = ["P987654321Z — VAT", "A012345678Y — PAYE"];
const FREQUENCIES = ["Monthly", "Quarterly", "Annual"];
const ENTITY_TYPES = ["Individual", "Company", "Partnership", "Trust"];
const LINK_SOURCES = ["PayMo Wallet", "M-Pesa", "Bank"];

const toneBadge = (tone: string) =>
	tone === "badgeS"
		? shared.badgeSuccess
		: tone === "badgeW"
			? shared.badgeWarning
			: tone === "badgeD"
				? shared.badgeDanger
				: tone === "badgeI"
					? shared.badgeInfo
					: shared.badgePurple;

export default function KraGovernmentModals({
	active,
	onClose,
	onOpen,
}: {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}) {
	const isOpen = (id: string) => active === id;

	return (
		<>
			{/* ============================================================
			   PAY KRA TAX (4-step wizard)
			   ============================================================ */}
			<FlowModal
				show={isOpen("payKRAModal")}
				onClose={onClose}
				iconCls="bi bi-receipt-cutoff"
				title="Pay KRA Tax"
				steps={["Obligation", "Details", "Confirm", "Done"]}
				confirmLabel="Pay Now"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Select the obligation to settle
								</p>
								<SelectField label="KRA PIN / Entity" options={KRA_ENTITIES} />
								<SelectField label="Tax Type" options={TAX_TYPES} />
								<InfoBox>
									<i className="bi bi-info-circle" aria-hidden="true" /> Current
									due: <strong>KES 42,800</strong> · Due date: 15 Jul 2025
								</InfoBox>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Payment details
								</p>
								<Field label="Amount (KES)" defaultValue="42800" />
								<SelectField label="Payment Method" options={PAY_METHODS} />
								<SelectField
									label="Schedule"
									options={PAY_SCHEDULES}
									defaultValue="Pay immediately"
								/>
							</div>
						)}
						{step === 3 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 3: Confirm &amp; pay
								</p>
								<div className={styles.summaryBox} style={{ marginBottom: 12 }}>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Tax Type</span>
										<strong>PAYE</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Amount</span>
										<strong>KES 42,800</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Method</span>
										<strong>Wallet</strong>
									</div>
									<div className="d-flex justify-content-between">
										<span className={styles.mutedSmall}>Fee</span>
										<strong>KES 0</strong>
									</div>
								</div>
								<span className={shared.fieldLabel}>Enter Wallet PIN</span>
								<PinRow />
							</div>
						)}
						{step === 4 && (
							<div className={styles.summaryBox} style={{ marginTop: 8 }}>
								<div className="d-flex justify-content-between mb-2">
									<span className={styles.mutedSmall}>KRA PIN</span>
									<strong>A012345678Y</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span className={styles.mutedSmall}>Amount</span>
									<strong>KES 42,800</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span className={styles.mutedSmall}>iTax Ref</span>
									<strong>ITX-883421</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span className={styles.mutedSmall}>Date</span>
									<strong>27 Jun 2025, 14:32</strong>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   FILE TAX RETURN (4-step wizard)
			   ============================================================ */}
			<FlowModal
				show={isOpen("fileReturnModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-text"
				title="File Tax Return"
				steps={["Select", "Upload", "Submit", "Done"]}
				confirmLabel="Submit & Pay"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Select the return to file
								</p>
								<SelectField label="KRA PIN" options={FILE_PINS} />
								<SelectField
									label="Return Period"
									options={RETURN_PERIODS}
									defaultValue="June 2025"
								/>
								<InfoBox variant="warning">
									<i className="bi bi-clock" aria-hidden="true" /> Due in{" "}
									<strong>2 days</strong>. File early to avoid late penalties.
								</InfoBox>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Upload &amp; review
								</p>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="fr-upload">
										Upload Supporting Documents
									</label>
									<input
										id="fr-upload"
										type="file"
										multiple
										className={`${shared.field} form-control`}
									/>
								</div>
								<div className={styles.summaryBox}>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Gross Sales</span>
										<strong>KES 4,200,000</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Input VAT</span>
										<strong>KES 672,000</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Output VAT</span>
										<strong>KES 756,200</strong>
									</div>
									<hr className="my-2" />
									<div className="d-flex justify-content-between">
										<span className={styles.fwBold13}>Net VAT Payable</span>
										<strong className={styles.textDanger}>KES 84,200</strong>
									</div>
								</div>
							</div>
						)}
						{step === 3 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 3: Submit &amp; pay
								</p>
								<div className={`${styles.summaryBoxAccent} mb-3`}>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Return Type</span>
										<strong>VAT — June 2025</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Amount Due</span>
										<strong>KES 84,200</strong>
									</div>
									<div className="d-flex justify-content-between">
										<span className={styles.mutedSmall}>iTax Confirmation</span>
										<strong>Will be emailed</strong>
									</div>
								</div>
								<div className="form-check mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="fr-pay-now"
									/>
									<label
										className="form-check-label"
										style={{ fontSize: 13 }}
										htmlFor="fr-pay-now"
									>
										Pay immediately after filing
									</label>
								</div>
								<div className="form-check">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="fr-auto-next"
									/>
									<label
										className="form-check-label"
										style={{ fontSize: 13 }}
										htmlFor="fr-auto-next"
									>
										Auto-file next month
									</label>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   BULK TAX FILING (3-step wizard)
			   ============================================================ */}
			<FlowModal
				show={isOpen("bulkTaxModal")}
				onClose={onClose}
				iconCls="bi bi-collection"
				title="Bulk Tax Filing & Payment"
				steps={["Upload", "Validate", "Done"]}
				confirmLabel="Execute"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Upload the bulk file
								</p>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="bulk-file">
										Upload CSV/Excel
									</label>
									<input
										id="bulk-file"
										type="file"
										className={`${shared.field} form-control`}
									/>
								</div>
								<InfoBox>
									<i className="bi bi-info-circle" aria-hidden="true" />{" "}
									Download template:{" "}
									<button
										type="button"
										className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
										style={{ marginLeft: 4 }}
										onClick={() =>
											downloadFile(
												"KRA_Bulk_Template.csv",
												"kra_pin,tax_type,period,amount,method\nA012345678Y,PAYE,2025-06,42800,wallet\n",
												"text/csv",
											)
										}
									>
										<i className="bi bi-download" aria-hidden="true" /> Template
									</button>
								</InfoBox>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Preview &amp; validate
								</p>
								<div className={shared.tableWrap}>
									<table className={shared.table}>
										<thead>
											<tr>
												<th>PIN</th>
												<th>Tax Type</th>
												<th>Amount</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{[
												[
													"A012345678Y",
													"PAYE",
													"KES 42,800",
													"Valid",
													"badgeS",
												],
												["P987654321Z", "VAT", "KES 84,200", "Valid", "badgeS"],
												[
													"R445566778X",
													"TOT",
													"KES 18,600",
													"Warning",
													"badgeW",
												],
											].map((row) => (
												<tr key={row[0]}>
													{row.slice(0, 3).map((cell) => (
														<td key={cell}>{cell}</td>
													))}
													<td>
														<span
															className={`${shared.badge} ${toneBadge(row[4])}`}
														>
															{row[3]}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   PAY eCITIZEN SERVICE
			   ============================================================ */}
			<SimpleModal
				show={isOpen("payECitizenModal")}
				onClose={onClose}
				iconCls="bi bi-globe"
				title="Pay eCitizen Service"
				submitLabel="Pay KES 4,500"
				successMsg="eCitizen payment successful! Receipt sent to your email."
			>
				<SelectField
					label="Service"
					options={ECITIZEN_SERVICES}
					defaultValue="Passport Renewal — KES 4,500"
				/>
				<Field label="Application / Ref Number" defaultValue="P-449281" />
				<SelectField label="Payment Method" options={ECITIZEN_METHODS} />
				<InfoBox>
					<i className="bi bi-info-circle" aria-hidden="true" /> Payment is
					processed instantly. You will receive a confirmation SMS and email
					with the receipt.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   PAY COUNTY REVENUE
			   ============================================================ */}
			<SimpleModal
				show={isOpen("payCountyModal")}
				onClose={onClose}
				iconCls="bi bi-building"
				title="Pay County Revenue"
				submitLabel="Pay Now"
				successMsg="County payment successful! Permit updated in your records."
			>
				<SelectField label="County" options={COUNTIES} />
				<SelectField
					label="Service / Permit"
					options={COUNTY_SERVICES}
					defaultValue="Single Business Permit — KES 18,500"
				/>
				<Field label="Account / Plot Number" defaultValue="NCC-882910" />
				<SelectField
					label="Payment Method"
					options={ECITIZEN_METHODS.filter((m) => m !== "Bank Transfer")}
				/>
			</SimpleModal>

			{/* ============================================================
			   PAY ARDHISASA LAND SERVICES
			   ============================================================ */}
			<SimpleModal
				show={isOpen("payArdhisasaModal")}
				onClose={onClose}
				iconCls="bi bi-map"
				title="Pay Ardhisasa Land Services"
				submitLabel="Pay Now"
				successMsg="Ardhisasa payment successful! Receipt and confirmation sent."
			>
				<SelectField
					label="Service"
					options={ARDHISASA_SERVICES}
					defaultValue="Title Deed Processing — KES 28,500"
				/>
				<Field label="LR / Plot Number" defaultValue="LR-209/881" />
				<SelectField label="Payment Method" options={ARD_METHODS} />
				<InfoBox>
					<i className="bi bi-info-circle" aria-hidden="true" /> Payments are
					processed through the Ministry of Lands portal. You will receive an
					official receipt.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   SCHEDULE TAX PAYMENT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("scheduleTaxModal")}
				onClose={onClose}
				iconCls="bi bi-calendar-event"
				title="Schedule Tax Payment"
				submitLabel="Schedule"
				successMsg="Tax payment scheduled successfully!"
			>
				<SelectField label="KRA PIN / Tax Type" options={SCHED_TYPES} />
				<Field label="Amount" defaultValue="84200" />
				<SelectField label="Frequency" options={FREQUENCIES} />
				<div className="mb-3">
					<span className={shared.fieldLabel}>Start Date</span>
					<input
						type="date"
						className={`${shared.field} form-control mt-1`}
						defaultValue="2025-07-05"
					/>
				</div>
				<SelectField
					label="Payment Method"
					options={["PayMo Wallet", "M-Pesa"]}
				/>
			</SimpleModal>

			{/* ============================================================
			   TAX OPTIMIZER
			   ============================================================ */}
			<SimpleModal
				show={isOpen("taxOptimizerModal")}
				onClose={onClose}
				iconCls="bi bi-lightbulb"
				title="Tax Optimizer"
				size="lg"
				submitLabel="Claim All"
				successMsg="All identified reliefs and deductions submitted to KRA."
			>
				<div className={`${styles.summaryBoxAccent} mb-3`}>
					<div
						style={{
							fontSize: 11,
							fontWeight: 700,
							color: "var(--pm-accent)",
							textTransform: "uppercase",
							letterSpacing: "0.08em",
						}}
					>
						Potential Savings Identified
					</div>
					<div
						style={{
							fontSize: 28,
							fontWeight: 800,
							color: "var(--pm-accent)",
							fontFamily: "var(--pm-font-display)",
						}}
					>
						KES 47,800
					</div>
				</div>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Opportunity</th>
								<th>Estimated Saving</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Claim additional rental income relief", "KES 31,200"],
								["Investment deduction (solar)", "KES 12,400"],
								["Early filing penalty avoidance", "KES 4,200"],
							].map((row) => (
								<tr key={row[0]}>
									<td>{row[0]}</td>
									<td>
										<strong>{row[1]}</strong>
									</td>
									<td>
										{row[0].startsWith("Early filing") ? (
											<button
												type="button"
												className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
												onClick={() => onOpen("fileReturnModal")}
											>
												File Early
											</button>
										) : (
											<span
												className={`${shared.badge} ${shared.badgeSuccess}`}
											>
												<i className="bi bi-check-lg" aria-hidden="true" />{" "}
												Ready
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ============================================================
			   LINK NEW KRA PIN
			   ============================================================ */}
			<SimpleModal
				show={isOpen("addKRAModal")}
				onClose={onClose}
				iconCls="bi bi-plus-circle"
				title="Link New KRA PIN"
				submitLabel="Link PIN"
				successMsg="KRA PIN linked successfully! Syncing obligations..."
			>
				<Field label="KRA PIN" placeholder="A012345678Y" />
				<SelectField label="Entity Type" options={ENTITY_TYPES} />
				<Field label="Entity Name" placeholder="Company or Individual Name" />
				<SelectField label="Default Payment Source" options={LINK_SOURCES} />
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="ak-auto-sync"
					/>
					<label
						className="form-check-label"
						style={{ fontSize: 13 }}
						htmlFor="ak-auto-sync"
					>
						Enable auto-sync with iTax
					</label>
				</div>
			</SimpleModal>

			{/* ============================================================
			   SYNC WITH iTax
			   ============================================================ */}
			<SimpleModal
				show={isOpen("syncItaxModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-repeat"
				title="Sync with iTax"
				submitLabel="Sync Now"
				successMsg="iTax sync completed successfully! 3 new obligations found."
			>
				<div className={`${styles.summaryBoxInfo} mb-3`}>
					<div className="d-flex justify-content-between mb-1">
						<span className={styles.mutedSmall}>Last sync</span>
						<strong>27 Jun 2025, 09:14</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Obligations synced</span>
						<strong>12</strong>
					</div>
				</div>
				<div className="form-check mb-2">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="sy-full"
					/>
					<label
						className="form-check-label"
						style={{ fontSize: 13 }}
						htmlFor="sy-full"
					>
						Full obligation sync
					</label>
				</div>
				<div className="form-check mb-2">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="sy-history"
					/>
					<label
						className="form-check-label"
						style={{ fontSize: 13 }}
						htmlFor="sy-history"
					>
						Payment history
					</label>
				</div>
				<div className="form-check">
					<input className="form-check-input" type="checkbox" id="sy-refunds" />
					<label
						className="form-check-label"
						style={{ fontSize: 13 }}
						htmlFor="sy-refunds"
					>
						Refund status
					</label>
				</div>
			</SimpleModal>

			{/* ============================================================
			   TAX PAYMENT RECEIPT
			   ============================================================ */}
			<ModalShell
				show={isOpen("taxReceiptModal")}
				onClose={onClose}
				iconCls="bi bi-receipt"
				title="Tax Payment Receipt"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>KRA PIN</span>
						<strong>A012345678Y</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Tax Type</span>
						<strong>PAYE</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Amount</span>
						<strong>KES 42,800</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>iTax Ref</span>
						<strong>ITX-882341</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Date</span>
						<strong>27 Jun 2025</strong>
					</div>
				</div>
				<div className="d-flex justify-content-center gap-2 mt-3">
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() =>
							downloadFile(
								"KRA-Receipt-ITX-882341.txt",
								"KRA Tax Payment Receipt\nPIN: A012345678Y\nType: PAYE\nAmount: KES 42,800\niTax Ref: ITX-882341\nDate: 27 Jun 2025",
							)
						}
					>
						<i className="bi bi-download" aria-hidden="true" /> PDF
					</button>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() =>
							downloadFile(
								"KRA-Receipt-ITX-882341-share.txt",
								"KRA receipt ITX-882341 — KES 42,800 PAYE paid 27 Jun 2025 via PayMo.",
							)
						}
					>
						<i className="bi bi-whatsapp" aria-hidden="true" /> Share
					</button>
				</div>
			</ModalShell>

			{/* ============================================================
			   GOVERNMENT SERVICE RECEIPT (nested-only)
			   ============================================================ */}
			<ModalShell
				show={isOpen("govReceiptModal")}
				onClose={onClose}
				iconCls="bi bi-receipt"
				title="Government Service Receipt"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Service</span>
						<strong>Passport Renewal</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Ref</span>
						<strong>P-449281</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Amount</span>
						<strong>KES 4,500</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Date</span>
						<strong>27 Jun 2025</strong>
					</div>
				</div>
			</ModalShell>

			{/* ============================================================
			   TRACK GOVERNMENT SERVICE
			   ============================================================ */}
			<SimpleModal
				show={isOpen("trackGovModal")}
				onClose={onClose}
				iconCls="bi bi-truck"
				title="Track Government Service"
				submitLabel="Refresh Status"
				successMsg="Status refreshed: Biometric Verification — est. completion 02 Jul 2025."
			>
				<Field label="Application Ref" defaultValue="P-449281" />
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Status</span>
						<span className={`${shared.badge} ${shared.badgeInfo}`}>
							Under Processing
						</span>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Stage</span>
						<strong>Biometric Verification</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Est. Completion</span>
						<strong>02 Jul 2025</strong>
					</div>
				</div>
			</SimpleModal>

			{/* ============================================================
			   COMPLIANCE HEALTH DASHBOARD
			   ============================================================ */}
			<ModalShell
				show={isOpen("complianceHealthModal")}
				onClose={onClose}
				iconCls="bi bi-heart-pulse"
				title="Compliance Health Dashboard"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnPrimary}`}
							onClick={() => onOpen("payKRAModal")}
						>
							<i className="bi bi-receipt-cutoff" aria-hidden="true" /> Resolve
							Issues
						</button>
					</>
				}
			>
				<div className="row g-3 mb-3">
					{[
						["94", "COMPLIANCE", "var(--pm-accent-soft)", "var(--pm-accent)"],
						["0", "PENALTIES", "var(--pm-info-soft)", "var(--pm-info)"],
						["2", "RETURNS DUE", "var(--pm-warning-soft)", "var(--pm-warning)"],
						["18", "MONTHS CLEAN", "var(--pm-purple-soft)", "var(--pm-purple)"],
					].map(([value, label, bg, color]) => (
						<div className="col-md-3 col-6" key={label}>
							<div className={styles.miniStat} style={{ background: bg }}>
								<div className={styles.miniStatBig} style={{ color }}>
									{value}
								</div>
								<div className={styles.miniStatLabel} style={{ color }}>
									{label}
								</div>
							</div>
						</div>
					))}
				</div>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Entity</th>
								<th>Score</th>
								<th>Issues</th>
								<th>Next Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								["James Kamau", "98", "None", "PAYE 15 Jul", "badgeS"],
								["JK Holdings", "92", "VAT due soon", "File 05 Jul", "badgeS"],
								[
									"JK Investments",
									"78",
									"CGT overdue",
									"Pay immediately",
									"badgeW",
								],
							].map((row) => (
								<tr key={row[0]}>
									<td>{row[0]}</td>
									<td>
										<span className={`${shared.badge} ${toneBadge(row[4])}`}>
											{row[1]}
										</span>
									</td>
									<td>{row[2]}</td>
									<td>
										<strong>{row[3]}</strong>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============================================================
			   ALL ITEMS REQUIRING ATTENTION
			   ============================================================ */}
			<ModalShell
				show={isOpen("attentionModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-circle"
				title="All Items Requiring Attention"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				{[
					{
						title: "VAT return due in 2 days",
						sub: "P987654321Z · KES 84,200",
						label: "File",
						modal: "fileReturnModal",
						danger: true,
					},
					{
						title: "CGT overdue",
						sub: "C112233445W · KES 62,000",
						label: "Pay",
						modal: "payKRAModal",
						danger: true,
					},
					{
						title: "Passport renewal ready",
						sub: "P-449281 · KES 4,500",
						label: "Pay",
						modal: "payECitizenModal",
						danger: false,
					},
				].map((r) => (
					<div className={styles.sr} key={r.title}>
						<div>
							<strong>{r.title}</strong>
							<div className={styles.mutedSmall}>{r.sub}</div>
						</div>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSm} ${r.danger ? shared.btnDanger : shared.btnSecondary}`}
							onClick={() => onOpen(r.modal)}
						>
							{r.label}
						</button>
					</div>
				))}
			</ModalShell>

			{/* ============================================================
			   FULL TAX PAYMENT HISTORY
			   ============================================================ */}
			<ModalShell
				show={isOpen("taxHistoryModal")}
				onClose={onClose}
				iconCls="bi bi-clock-history"
				title="Full Tax Payment History"
				size="xl"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Date</th>
								<th>PIN</th>
								<th>Type</th>
								<th>Amount</th>
								<th>Method</th>
								<th>Status</th>
								<th>Ref</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								{
									date: "25 Jun",
									pin: "A012345678Y",
									type: "PAYE",
									amount: "KES 42,800",
									method: "M-Pesa",
									status: "Paid",
									tone: "badgeS",
									ref: "ITX-882341",
									action: ["Receipt", "taxReceiptModal"],
								},
								{
									date: "22 Jun",
									pin: "P987654321Z",
									type: "VAT",
									amount: "KES 84,200",
									method: "Wallet",
									status: "Filed",
									tone: "badgeS",
									ref: "ITX-881902",
									action: ["View", "fileReturnModal"],
								},
								{
									date: "15 Jun",
									pin: "R445566778X",
									type: "TOT",
									amount: "KES 18,600",
									method: "Bank",
									status: "Paid",
									tone: "badgeS",
									ref: "ITX-880991",
									action: ["Receipt", "taxReceiptModal"],
								},
							].map((row) => (
								<tr key={row.ref}>
									<td>{row.date}</td>
									<td>{row.pin}</td>
									<td>{row.type}</td>
									<td>{row.amount}</td>
									<td>{row.method}</td>
									<td>
										<span className={`${shared.badge} ${toneBadge(row.tone)}`}>
											{row.status}
										</span>
									</td>
									<td>{row.ref}</td>
									<td>
										<button
											type="button"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
											onClick={() => onOpen(row.action[1])}
										>
											{row.action[0]}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============================================================
			   GOVERNMENT SERVICES HISTORY
			   ============================================================ */}
			<ModalShell
				show={isOpen("govHistoryModal")}
				onClose={onClose}
				iconCls="bi bi-clock-history"
				title="Government Services History"
				size="xl"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Date</th>
								<th>Service</th>
								<th>Provider</th>
								<th>Amount</th>
								<th>Status</th>
								<th>Ref</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								{
									date: "18 Jun",
									service: "Passport Renewal",
									provider: "eCitizen",
									amount: "KES 4,500",
									status: "Processing",
									tone: "badgeI",
									ref: "P-449281",
									action: ["Track", "trackGovModal"],
								},
								{
									date: "15 Jun",
									service: "Land Rates",
									provider: "Nairobi County",
									amount: "KES 42,300",
									status: "Paid",
									tone: "badgeS",
									ref: "CCN-772910",
									action: ["Receipt", "govReceiptModal"],
								},
							].map((row) => (
								<tr key={row.ref}>
									<td>{row.date}</td>
									<td>{row.service}</td>
									<td>{row.provider}</td>
									<td>{row.amount}</td>
									<td>
										<span className={`${shared.badge} ${toneBadge(row.tone)}`}>
											{row.status}
										</span>
									</td>
									<td>{row.ref}</td>
									<td>
										<button
											type="button"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
											onClick={() => onOpen(row.action[1])}
										>
											{row.action[0]}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============================================================
			   DISPUTE KRA ASSESSMENT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("disputeKRAModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-triangle"
				title="Dispute KRA Assessment"
				submitLabel="Submit Dispute"
				successMsg="Dispute filed successfully. Case #KRA-DSP-99182 created."
			>
				<SelectField
					label="KRA PIN"
					options={["C112233445W — JK Investments"]}
				/>
				<Field label="Assessment Ref" defaultValue="CGT-2025-6621" />
				<div className="mb-3">
					<label className={shared.fieldLabel} htmlFor="dk-reason">
						Dispute Reason
					</label>
					<textarea
						id="dk-reason"
						className={`${shared.field} form-control`}
						rows={3}
						defaultValue="The capital gains calculation does not account for improvement costs of KES 1.2M incurred in 2023."
					/>
				</div>
				<div className="mb-3">
					<label className={shared.fieldLabel} htmlFor="dk-files">
						Upload Supporting Documents
					</label>
					<input
						id="dk-files"
						type="file"
						multiple
						className={`${shared.field} form-control`}
					/>
				</div>
			</SimpleModal>

			{/* ============================================================
			   GOVERNMENT NOTIFICATIONS
			   ============================================================ */}
			<ModalShell
				show={isOpen("govNotifModal")}
				onClose={onClose}
				iconCls="bi bi-bell"
				title="Government Notifications (9)"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					{[
						{
							box: "summaryBoxDanger",
							title: "VAT return due in 2 days",
							sub: "P987654321Z · File before 05 Jul",
						},
						{
							box: "summaryBoxWarn",
							title: "CGT overdue",
							sub: "C112233445W · Pay immediately",
						},
						{
							box: "summaryBoxInfo",
							title: "Passport application update",
							sub: "P-449281 · Biometric stage",
						},
						{
							box: "summaryBoxAccent",
							title: "Land rates payment confirmed",
							sub: "Nairobi County · Receipt available",
						},
					].map((n) => (
						<div
							key={n.title}
							className={`${styles[n.box as "summaryBox"]} mb-2`}
							style={{ fontSize: 13 }}
						>
							<strong>{n.title}</strong>
							<div className={styles.mutedSmall}>{n.sub}</div>
						</div>
					))}
				</div>
			</ModalShell>
		</>
	);
}
