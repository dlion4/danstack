"use client";

import { useState } from "react";
import {
	Field,
	FlowModal,
	InfoBox,
	ModalShell,
	SelectField,
	SimpleModal,
	TabbedModal,
} from "../../shared/components/modals";
import s from "../../shared/styles/appPage.module.css";
import styles from "../styles/disputes.module.css";

/* ============================================================================
   Dispute & Chargeback Management — modal layer on the SHARED primitives
   (ModalShell / SimpleModal / FlowModal / TabbedModal). No legacy MBox.
   19 modals, all reachable (17 via page triggers — incl. caseNotifModal bell —
   + 2 nested-only via in-modal onOpen navigation: feeCalcModal, securityCheckModal).
   Legacy dead/duplicate ids removed: profileModal (shell chrome),
   disputeRulesModal2 (duplicate stub), branchSupportModal (no consumer nav);
   feeCalcModal re-homed under arbitration, securityCheckModal under health check.
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
const CARDS = ["Visa ****4521", "MC ****3392", "Prepaid ****8890"];
const DISPUTE_TXNS = [
	"12 Jun 2025 — Amazon Kenya — KES 87,400 — Ref: AMZ-882910",
	"10 Jun 2025 — Jumia Pay — KES 23,150 — Ref: JM-441029",
	"08 Jun 2025 — Booking.com — KES 124,800 — Ref: BK-991022",
];
const REASON_CODES = [
	"01 — Unauthorised Transaction",
	"02 — Goods Not Received",
	"03 — Goods Not as Described",
	"04 — Duplicate Charge",
	"05 — Cancelled Recurring",
	"06 — Refund Not Processed",
];
const EV_CASES = [
	"CDP-44892 — Visa — KES 1,850,000",
	"CB-99102 — MC — KES 87,400",
	"CDP-44915 — PesaLink — KES 124,800",
];
const EV_TYPES = [
	"Receipt / Invoice",
	"Police Report",
	"Delivery Proof",
	"Contract / Agreement",
	"Bank Statement",
	"Other",
];
const CB_LIST = [
	"CB-99102 — Visa — KES 87,400 — Representment due 27 Jun",
	"CB-99087 — MC — KES 312,000 — Pre-Arbitration",
];
const CB_RESPONSE_TYPES = [
	"Representment (provide evidence)",
	"Accept chargeback",
	"Pre-arbitration response",
	"Arbitration filing",
];
const BULK_ACTIONS = [
	"Upload evidence to all",
	"Request extension",
	"Accept chargebacks",
	"Escalate to arbitration",
];
const EXPORT_TYPES = [
	"Full dispute & chargeback report",
	"Win/loss analysis",
	"Merchant performance",
	"Reason code effectiveness",
	"Monthly resolution summary",
];
const FORMATS = ["PDF", "Excel", "CSV"];

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

export default function DisputesModals({
	active,
	onClose,
	onOpen,
}: {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}) {
	const isOpen = (id: string) => active === id;

	const [druleTab, setDruleTab] = useState("auto");
	const [druleSaved, setDruleSaved] = useState(false);
	const [riskNote, setRiskNote] = useState("");

	return (
		<>
			{/* ============================================================
			   FILE NEW DISPUTE (4-step wizard)
			   ============================================================ */}
			<FlowModal
				show={isOpen("disputeModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-plus"
				title="File New Dispute"
				steps={["Select", "Reason", "Evidence", "Done"]}
				confirmLabel="File Dispute"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Select the card and transaction in dispute
								</p>
								<SelectField label="Card / Account" options={CARDS} />
								<SelectField label="Transaction" options={DISPUTE_TXNS} />
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Reason &amp; details
								</p>
								<SelectField
									label="Reason Code"
									options={REASON_CODES}
									defaultValue="01 — Unauthorised Transaction"
								/>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="disp-desc">
										Description
									</label>
									<textarea
										id="disp-desc"
										className={`${shared.field} form-control`}
										rows={3}
										defaultValue="I did not authorise this transaction. Card was in my possession at all times."
									/>
								</div>
								<Field label="Requested Amount (KES)" defaultValue="87400" />
							</div>
						)}
						{step === 3 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 3: Initial evidence
								</p>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="disp-files">
										Upload Supporting Documents
									</label>
									<input
										id="disp-files"
										type="file"
										multiple
										className={`${shared.field} form-control`}
									/>
								</div>
								<div className="form-check mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="disp-police"
									/>
									<label
										className="form-check-label"
										style={{ fontSize: 13 }}
										htmlFor="disp-police"
									>
										Police report will be uploaded within 48 hours
									</label>
								</div>
								<div className="form-check mb-3">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="disp-id"
									/>
									<label
										className="form-check-label"
										style={{ fontSize: 13 }}
										htmlFor="disp-id"
									>
										ID verification attached
									</label>
								</div>
								<div className={styles.summaryBoxInfo}>
									<div className="d-flex justify-content-between mb-1">
										<span className={styles.mutedSmall}>New case</span>
										<strong>CDP-44923</strong>
									</div>
									<div className="d-flex justify-content-between mb-1">
										<span className={styles.mutedSmall}>Amount</span>
										<strong>KES 87,400</strong>
									</div>
									<div className="d-flex justify-content-between">
										<span className={styles.mutedSmall}>Network deadline</span>
										<strong>11 Jul 2025</strong>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   UPLOAD EVIDENCE PACKAGE (3-step wizard)
			   ============================================================ */}
			<FlowModal
				show={isOpen("evidenceUploadModal")}
				onClose={onClose}
				iconCls="bi bi-upload"
				title="Upload Evidence Package"
				steps={["Select", "Files", "Done"]}
				confirmLabel="Upload"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Select the case and evidence type
								</p>
								<SelectField label="Case" options={EV_CASES} />
								<SelectField
									label="Evidence Type"
									options={EV_TYPES}
									defaultValue="Receipt / Invoice"
								/>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Upload files
								</p>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="ev-files">
										Files
									</label>
									<input
										id="ev-files"
										type="file"
										multiple
										className={`${shared.field} form-control`}
									/>
								</div>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="ev-notes">
										Description / Notes
									</label>
									<textarea
										id="ev-notes"
										className={`${shared.field} form-control`}
										rows={2}
										defaultValue="Receipt from merchant dated 12 Jun 2025 showing full payment."
									/>
								</div>
								<InfoBox>
									<i className="bi bi-info-circle" aria-hidden="true" />{" "}
									Accepted formats: PDF, JPG, PNG, DOCX. Max 10MB per file.
								</InfoBox>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   RESPOND TO CHARGEBACK
			   ============================================================ */}
			<SimpleModal
				show={isOpen("chargebackResponseModal")}
				onClose={onClose}
				iconCls="bi bi-reply"
				title="Respond to Chargeback"
				size="lg"
				submitLabel="Submit Response"
				successMsg="Chargeback response submitted successfully. Case updated to Pre-Arbitration stage."
			>
				<SelectField label="Chargeback" options={CB_LIST} />
				<SelectField
					label="Response Type"
					options={CB_RESPONSE_TYPES}
					defaultValue="Representment (provide evidence)"
				/>
				<div className="mb-3">
					<label className={shared.fieldLabel} htmlFor="cb-notes">
						Evidence / Notes
					</label>
					<textarea
						id="cb-notes"
						className={`${shared.field} form-control`}
						rows={4}
						defaultValue="Merchant provided signed delivery confirmation and CCTV footage showing cardholder at pickup location."
					/>
				</div>
				<div className="mb-3">
					<label className={shared.fieldLabel} htmlFor="cb-files">
						Additional Files
					</label>
					<input
						id="cb-files"
						type="file"
						multiple
						className={`${shared.field} form-control`}
					/>
				</div>
			</SimpleModal>

			{/* ============================================================
			   BULK DISPUTE ACTIONS (3-step wizard)
			   ============================================================ */}
			<FlowModal
				show={isOpen("bulkDisputeModal")}
				onClose={onClose}
				iconCls="bi bi-collection"
				title="Bulk Dispute Actions"
				steps={["Select", "Action", "Done"]}
				confirmLabel="Run Bulk Action"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Select cases
								</p>
								{[
									{
										id: "bulk-c1",
										label: "CDP-44892",
										sub: "Visa — KES 1.85M",
										badge: "Expiring",
										tone: shared.badgeDanger,
										checked: true,
									},
									{
										id: "bulk-c2",
										label: "CB-99087",
										sub: "MC — KES 312k",
										badge: "Pre-Arbitration",
										tone: shared.badgeInfo,
										checked: false,
									},
								].map((c) => (
									<div
										className="form-check p-3 border rounded mb-2"
										key={c.id}
									>
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked={c.checked}
											id={c.id}
										/>
										<label
											className="form-check-label ms-2 d-flex justify-content-between w-100"
											htmlFor={c.id}
										>
											<span>
												<strong>{c.label}</strong> — {c.sub}
											</span>
											<span className={`${shared.badge} ${c.tone}`}>
												{c.badge}
											</span>
										</label>
									</div>
								))}
								<div className="d-flex justify-content-between">
									<span className={shared.fieldLabel}>Selected</span>
									<strong>2 cases</strong>
								</div>
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Choose the bulk action
								</p>
								<SelectField
									label="Bulk Action"
									options={BULK_ACTIONS}
									defaultValue="Upload evidence to all"
								/>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="bulk-notes">
										Notes (applies to all)
									</label>
									<textarea
										id="bulk-notes"
										className={`${shared.field} form-control`}
										rows={3}
										defaultValue="Bulk evidence package attached for all selected cases."
									/>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   EVIDENCE PACKAGE MANAGER (tabs)
			   ============================================================ */}
			<TabbedModal
				show={isOpen("evidencePackageModal")}
				onClose={onClose}
				iconCls="bi bi-archive"
				title="Evidence Package Manager"
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
							onClick={() => onOpen("evidenceUploadModal")}
						>
							<i className="bi bi-upload" aria-hidden="true" /> Upload More
						</button>
					</>
				}
				tabs={[
					{
						key: "all",
						label: "All Files",
						render: () => (
							<div className={shared.tableWrap}>
								<table className={shared.table}>
									<thead>
										<tr>
											<th>File</th>
											<th>Case</th>
											<th>Type</th>
											<th>Uploaded</th>
											<th>Size</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{[
											[
												"receipt_amz.pdf",
												"CDP-44892",
												"Receipt",
												"27 Jun",
												"1.2 MB",
											],
											[
												"police_88291.pdf",
												"CDP-44892",
												"Police",
												"26 Jun",
												"3.4 MB",
											],
											["id_jk.jpg", "CDP-44915", "ID", "25 Jun", "0.8 MB"],
										].map((row) => (
											<tr key={row[0]}>
												{row.map((cell) => (
													<td key={cell}>{cell}</td>
												))}
												<td>
													<button
														type="button"
														className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
														onClick={() =>
															downloadFile(
																"evidence.txt",
																`PayMo evidence file: ${row[0]} (${row[4]}, uploaded ${row[3]})`,
															)
														}
													>
														Download
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "receipt",
						label: "Receipts",
						render: () => (
							<div>
								{[
									["receipt_amz.pdf", "CDP-44892 · 1.2 MB"],
									["receipt_jumia.pdf", "CB-99102 · 0.9 MB"],
								].map(([file, sub]) => (
									<div className={styles.sr} key={file}>
										<div>
											<strong>{file}</strong>
											<div className={styles.mutedSmall}>{sub}</div>
										</div>
										<button
											type="button"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
											onClick={() =>
												downloadFile(file, `PayMo evidence: ${file}`)
											}
										>
											Download
										</button>
									</div>
								))}
							</div>
						),
					},
					{
						key: "police",
						label: "Police",
						render: () => (
							<div className={styles.sr}>
								<div>
									<strong>police_88291.pdf</strong>
									<div className={styles.mutedSmall}>CDP-44892 · 3.4 MB</div>
								</div>
								<button
									type="button"
									className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
									onClick={() =>
										downloadFile(
											"police_88291.pdf",
											"PayMo police report: CDP-44892",
										)
									}
								>
									Download
								</button>
							</div>
						),
					},
					{
						key: "delivery",
						label: "Delivery",
						render: () => (
							<div className={styles.sr}>
								<div>
									<strong>delivery_booking.jpg</strong>
									<div className={styles.mutedSmall}>CDP-44915 · 2.1 MB</div>
								</div>
								<button
									type="button"
									className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
									onClick={() =>
										downloadFile(
											"delivery_booking.jpg",
											"PayMo delivery proof: CDP-44915",
										)
									}
								>
									Download
								</button>
							</div>
						),
					},
				]}
			/>

			{/* ============================================================
			   MERCHANT RISK MANAGEMENT (tabs)
			   ============================================================ */}
			<TabbedModal
				show={isOpen("merchantRiskModal")}
				onClose={onClose}
				iconCls="bi bi-building"
				title="Merchant Risk Management"
				size="lg"
				tabs={[
					{
						key: "high",
						label: "High Risk",
						render: () => (
							<div>
								{riskNote && (
									<div
										className={`${shared.badge} ${shared.badgeSuccess}`}
										style={{
											display: "flex",
											marginBottom: 10,
											padding: "8px 10px",
										}}
									>
										<i className="bi bi-check-circle" aria-hidden="true" />{" "}
										{riskNote}
									</div>
								)}
								<div className={shared.tableWrap}>
									<table className={shared.table}>
										<thead>
											<tr>
												<th>Merchant</th>
												<th>Cases (30d)</th>
												<th>Win Rate</th>
												<th>Risk Score</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>Local Vendor X</td>
												<td>6</td>
												<td>17%</td>
												<td>
													<span
														className={`${shared.badge} ${shared.badgeDanger}`}
													>
														94
													</span>
												</td>
												<td>
													<button
														type="button"
														className={`${shared.btn} ${shared.btnSm} ${shared.btnDanger}`}
														onClick={() =>
															setRiskNote(
																"Merchant blacklisted. All future transactions will be blocked.",
															)
														}
													>
														Blacklist
													</button>
												</td>
											</tr>
											<tr>
												<td>Booking.com</td>
												<td>9</td>
												<td>44%</td>
												<td>
													<span
														className={`${shared.badge} ${shared.badgeWarning}`}
													>
														72
													</span>
												</td>
												<td>
													<button
														type="button"
														className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
														onClick={() =>
															setRiskNote(
																"Merchant flagged for review. Monitoring enabled.",
															)
														}
													>
														Monitor
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						),
					},
					{
						key: "repeat",
						label: "Repeat Offenders",
						render: () => (
							<div>
								{[
									{ name: "Amazon Kenya", sub: "18 cases · 61% win rate" },
									{ name: "Jumia Pay", sub: "12 cases · 75% win rate" },
								].map((m) => (
									<div className={styles.sr} key={m.name}>
										<div>
											<strong>{m.name}</strong>
											<div className={styles.mutedSmall}>{m.sub}</div>
										</div>
										<button
											type="button"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
											onClick={() =>
												setRiskNote(
													"Merchant flagged for review. Monitoring enabled.",
												)
											}
										>
											Monitor
										</button>
									</div>
								))}
							</div>
						),
					},
					{
						key: "blacklist",
						label: "Blacklist",
						render: () => (
							<div>
								{[
									{ name: "Local Vendor X", sub: "Blacklisted 24 Jun 2025" },
									{ name: "Scam Merchant Y", sub: "Blacklisted 12 May 2025" },
								].map((m) => (
									<div className={styles.sr} key={m.name}>
										<div>
											<strong>{m.name}</strong>
											<div className={styles.mutedSmall}>{m.sub}</div>
										</div>
										<button
											type="button"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
											onClick={() =>
												setRiskNote(
													"Merchant removed from blacklist. Transactions will be allowed.",
												)
											}
										>
											Remove
										</button>
									</div>
								))}
							</div>
						),
					},
				]}
			/>

			{/* ============================================================
			   RESOLUTION ANALYTICS DASHBOARD (tabs, xl)
			   ============================================================ */}
			<TabbedModal
				show={isOpen("resolutionAnalyticsModal")}
				onClose={onClose}
				iconCls="bi bi-graph-up-arrow"
				title="Resolution Analytics Dashboard"
				size="xl"
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
							onClick={() => onOpen("exportReportModal")}
						>
							<i className="bi bi-download" aria-hidden="true" /> Export Report
						</button>
					</>
				}
				tabs={[
					{
						key: "win",
						label: "Win Rate",
						render: () => (
							<div className="row g-3">
								{[
									{
										value: "68%",
										label: "OVERALL WIN RATE",
										color: "var(--pm-accent)",
										bg: "var(--pm-accent-soft)",
										big: true,
									},
									{
										value: "41 days",
										label: "AVG RESOLUTION",
										color: "var(--pm-info)",
										bg: "var(--pm-info-soft)",
									},
									{
										value: "KES 129k",
										label: "AVG RECOVERED",
										color: "var(--pm-purple)",
										bg: "var(--pm-purple-soft)",
									},
								].map((t) => (
									<div className="col-md-4" key={t.label}>
										<div
											className={styles.miniStat}
											style={{ background: t.bg }}
										>
											<div
												className={t.big ? styles.miniStatBig : undefined}
												style={
													t.big
														? { color: t.color }
														: { fontSize: 24, fontWeight: 700, color: t.color }
												}
											>
												{t.value}
											</div>
											<div className={styles.miniStatLabel}>{t.label}</div>
										</div>
									</div>
								))}
							</div>
						),
					},
					{
						key: "merchant",
						label: "Merchant",
						render: () => (
							<div className={shared.tableWrap}>
								<table className={shared.table}>
									<thead>
										<tr>
											<th>Merchant</th>
											<th>Cases</th>
											<th>Win Rate</th>
											<th>Avg Amount</th>
											<th>Trend</th>
										</tr>
									</thead>
									<tbody>
										{[
											["Amazon Kenya", "18", "61%", "KES 87k", "↑", "badgeS"],
											["Jumia Pay", "12", "75%", "KES 23k", "↑", "badgeS"],
											["Booking.com", "9", "44%", "KES 125k", "↓", "badgeW"],
										].map((row) => (
											<tr key={row[0]}>
												<td>{row[0]}</td>
												<td>{row[1]}</td>
												<td>{row[2]}</td>
												<td>{row[3]}</td>
												<td>
													<span
														className={`${shared.badge} ${toneBadge(row[5])}`}
													>
														{row[4]}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "reason",
						label: "Reason Code",
						render: () => (
							<div className={shared.tableWrap}>
								<table className={shared.table}>
									<thead>
										<tr>
											<th>Reason Code</th>
											<th>Cases</th>
											<th>Win Rate</th>
											<th>Avg Days</th>
										</tr>
									</thead>
									<tbody>
										{[
											["Unauthorised", "16", "82%", "32"],
											["Not Received", "9", "71%", "48"],
											["Duplicate", "7", "89%", "21"],
										].map((row) => (
											<tr key={row[0]}>
												{row.map((cell) => (
													<td key={cell}>{cell}</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "time",
						label: "Time to Resolve",
						render: () => (
							<div className={styles.summaryBox}>
								<div className={styles.fwBold13}>
									Resolution Time Distribution
								</div>
								{[
									["0-30 days", "42%", "badgeS"],
									["31-60 days", "38%", "badgeW"],
									["61-90 days", "15%", "badgeI"],
									["90+ days", "5%", "badgeD"],
								].map(([range, pct, tone], i) => (
									<div
										className={`${styles.sr} ${i === 0 ? "mt-2" : ""}`}
										key={range}
									>
										<div>{range}</div>
										<div>
											<span className={`${shared.badge} ${toneBadge(tone)}`}>
												{pct}
											</span>
										</div>
									</div>
								))}
							</div>
						),
					},
				]}
			/>

			{/* ============================================================
			   DISPUTE AUTOMATION RULES (tabs + toggles + save receipt)
			   ============================================================ */}
			<ModalShell
				show={isOpen("disputeRulesModal")}
				onClose={onClose}
				iconCls="bi bi-sliders"
				title="Dispute Automation Rules"
				size="lg"
				footer={
					druleSaved ? (
						<button
							type="button"
							className={`${shared.btn} ${shared.btnPrimary}`}
							onClick={onClose}
						>
							Done
						</button>
					) : (
						<>
							<button
								type="button"
								className={`${shared.btn} ${shared.btnSecondary}`}
								onClick={onClose}
							>
								Cancel
							</button>
							<button
								type="button"
								className={`${shared.btn} ${shared.btnPrimary}`}
								onClick={() => setDruleSaved(true)}
							>
								Save Rules
							</button>
						</>
					)
				}
			>
				{druleSaved ? (
					<output className={shared.receipt}>
						<div className={shared.receiptIcon}>
							<i className="bi bi-check-lg" aria-hidden="true" />
						</div>
						<h3 className={shared.receiptTitle}>Automation rules updated</h3>
						<p className={shared.receiptMsg}>
							Changes take effect immediately.
						</p>
					</output>
				) : (
					<>
						<div className={`${shared.pills} mb-3`}>
							{(["auto", "evidence", "merchant"] as const).map((tab) => (
								<button
									type="button"
									key={tab}
									className={`${shared.pill} ${druleTab === tab ? shared.pillActive : ""}`}
									onClick={() => setDruleTab(tab)}
								>
									{tab === "auto"
										? "Auto-Escalation"
										: tab === "evidence"
											? "Evidence Rules"
											: "Merchant Rules"}
								</button>
							))}
						</div>
						{druleTab === "auto" && (
							<div>
								{[
									{
										label: "Auto-escalate disputes > KES 500,000",
										sub: "Current: Disabled",
										on: false,
									},
									{
										label: "Auto-file chargeback if no response in 10 days",
										on: true,
									},
									{
										label: "Auto-blacklist merchant after 5 lost cases",
										on: false,
									},
								].map((r) => (
									<div className={styles.sr} key={r.label}>
										<div>
											<strong>{r.label}</strong>
											{"sub" in r && r.sub && (
												<div className={styles.mutedSmall}>{r.sub}</div>
											)}
										</div>
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={r.on}
												aria-label={r.label}
											/>
										</div>
									</div>
								))}
							</div>
						)}
						{druleTab === "evidence" && (
							<div>
								{[
									{
										label: "Require police report for unauthorised > KES 100k",
										on: true,
									},
									{
										label: 'Require delivery proof for "not received"',
										on: true,
									},
								].map((r) => (
									<div className={styles.sr} key={r.label}>
										<div>
											<strong>{r.label}</strong>
										</div>
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={r.on}
												aria-label={r.label}
											/>
										</div>
									</div>
								))}
							</div>
						)}
						{druleTab === "merchant" && (
							<div>
								{[
									{
										label: "Auto-flag merchants with win rate < 40%",
										on: true,
									},
									{
										label: "Auto-block transactions from blacklisted merchants",
										on: true,
									},
								].map((r) => (
									<div className={styles.sr} key={r.label}>
										<div>
											<strong>{r.label}</strong>
										</div>
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={r.on}
												aria-label={r.label}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</ModalShell>

			{/* ============================================================
			   ARBITRATION MANAGEMENT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("arbitrationModal")}
				onClose={onClose}
				iconCls="bi bi-gavel"
				title="Arbitration Management"
				size="lg"
				submitLabel="Save"
				successMsg="Arbitration notes saved. Case updated."
			>
				<SelectField
					label="Case"
					options={["CB-99065 — Visa — KES 1,240,000 — Arbitration"]}
				/>
				<div className={styles.summaryBox} style={{ marginBottom: 12 }}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Stage</span>
						<strong>Arbitration Filed</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Network</span>
						<strong>Visa</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Decision Due</span>
						<strong>15 Aug 2025</strong>
					</div>
				</div>
				<div className="mb-3">
					<label className={shared.fieldLabel} htmlFor="arb-notes">
						Notes
					</label>
					<textarea
						id="arb-notes"
						className={`${shared.field} form-control`}
						rows={3}
						defaultValue="Strong evidence package submitted. Merchant has poor compliance history."
					/>
				</div>
				<InfoBox>
					<i className="bi bi-calculator" aria-hidden="true" /> Arbitration
					filing fee applies.{" "}
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() => onOpen("feeCalcModal")}
						style={{ marginLeft: 4 }}
					>
						Calculate Fee
					</button>
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   DISPUTE FEE CALCULATOR
			   ============================================================ */}
			<SimpleModal
				show={isOpen("feeCalcModal")}
				onClose={onClose}
				iconCls="bi bi-calculator"
				title="Dispute Fee Calculator"
				submitLabel="Calculate Fee"
				successMsg="Estimated fee: KES 1,500 — dispute filing fee."
			>
				<SelectField
					label="Action"
					options={[
						"Dispute filing fee",
						"Arbitration filing fee",
						"Evidence courier / notarisation",
					]}
					defaultValue="Dispute filing fee"
				/>
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between">
						<span>Fee</span>
						<strong>KES 1,500</strong>
					</div>
				</div>
			</SimpleModal>

			{/* ============================================================
			   EXPORT DISPUTE REPORT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("exportReportModal")}
				onClose={onClose}
				iconCls="bi bi-download"
				title="Export Dispute Report"
				submitLabel="Generate"
				successMsg="Report generated and downloading..."
				onSubmit={() =>
					downloadFile(
						"paymo-disputes-report.csv",
						"case,network,stage,amount,status\nCDP-44923,Visa,Under Review,87400,Open\nCB-99102,Visa,Representment,87400,Due 27 Jun\nCDP-44915,PesaLink,Resolved,124800,Won\n",
						"text/csv",
					)
				}
			>
				<SelectField label="Report Type" options={EXPORT_TYPES} />
				<div className="mb-3">
					<span className={shared.fieldLabel}>Date Range</span>
					<div className="row g-2 mt-1">
						<div className="col-6">
							<input
								type="date"
								className={`${shared.field} form-control`}
								defaultValue="2025-01-01"
							/>
						</div>
						<div className="col-6">
							<input
								type="date"
								className={`${shared.field} form-control`}
								defaultValue="2025-06-27"
							/>
						</div>
					</div>
				</div>
				<SelectField label="Format" options={FORMATS} />
			</SimpleModal>

			{/* ============================================================
			   DISPUTE HEALTH CHECK
			   ============================================================ */}
			<ModalShell
				show={isOpen("healthCheckModal")}
				onClose={onClose}
				iconCls="bi bi-heart-pulse"
				title="Dispute Health Check"
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
							className={`${shared.btn} ${shared.btnSecondary}`}
							onClick={() => onOpen("securityCheckModal")}
						>
							<i className="bi bi-shield-check" aria-hidden="true" /> Security
							Check
						</button>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnPrimary}`}
							onClick={() => onOpen("disputeRulesModal")}
						>
							<i className="bi bi-sliders" aria-hidden="true" /> Improve Score
						</button>
					</>
				}
			>
				<div className="row g-3 mb-1">
					{[
						{
							value: "84",
							label: "HEALTH SCORE",
							bg: "var(--pm-accent-soft)",
							color: "var(--pm-accent)",
							big: true,
						},
						{
							value: "11",
							label: "EXPIRING",
							bg: "var(--pm-warning-soft)",
							color: "var(--pm-warning)",
						},
						{
							value: "41d",
							label: "AVG TIME",
							bg: "var(--pm-info-soft)",
							color: "var(--pm-info)",
						},
						{
							value: "68%",
							label: "WIN RATE",
							bg: "var(--pm-purple-soft)",
							color: "var(--pm-purple)",
						},
					].map((t) => (
						<div className="col-md-3 col-6" key={t.label}>
							<div className={styles.miniStat} style={{ background: t.bg }}>
								<div
									className={t.big ? styles.miniStatBig : undefined}
									style={
										t.big
											? { color: t.color }
											: { fontSize: 24, fontWeight: 700, color: t.color }
									}
								>
									{t.value}
								</div>
								<div className={styles.miniStatLabel}>{t.label}</div>
							</div>
						</div>
					))}
				</div>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Metric</th>
								<th>Current</th>
								<th>Target</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Evidence completeness", "78%", "95%", "Below", "badgeW"],
								["On-time filing", "94%", "100%", "Good", "badgeS"],
								["Merchant blacklisting", "3", "5", "Below", "badgeW"],
								["Arbitration win rate", "52%", "65%", "Below", "badgeW"],
							].map((row) => (
								<tr key={row[0]}>
									<td>{row[0]}</td>
									<td>{row[1]}</td>
									<td>{row[2]}</td>
									<td>
										<span className={`${shared.badge} ${toneBadge(row[4])}`}>
											{row[3]}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============================================================
			   DISPUTE SECURITY CHECK
			   ============================================================ */}
			<ModalShell
				show={isOpen("securityCheckModal")}
				onClose={onClose}
				iconCls="bi bi-shield-check"
				title="Dispute Security Check"
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
				<div
					className={`${styles.summaryBoxAccent} mb-3`}
					style={{ fontSize: 13 }}
				>
					<i className="bi bi-check-circle me-1" aria-hidden="true" /> All
					dispute workflows pass security validation. Evidence files are
					encrypted at rest and in transit.
				</div>
				{[
					["Evidence encryption (AES-256)", "Enabled"],
					["Two-person rule for arbitration filings", "Enabled"],
					["Network webhook signature validation", "Passing"],
				].map(([label, value]) => (
					<div className={styles.sr} key={label}>
						<div>
							<strong>{label}</strong>
						</div>
						<span className={`${shared.badge} ${shared.badgeSuccess}`}>
							{value}
						</span>
					</div>
				))}
			</ModalShell>

			{/* ============================================================
			   CASE NOTIFICATIONS
			   ============================================================ */}
			<ModalShell
				show={isOpen("caseNotifModal")}
				onClose={onClose}
				iconCls="bi bi-bell"
				title="Dispute Notifications (14)"
				footer={
					<>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSecondary}`}
							onClick={() => onOpen("disputeRulesModal")}
						>
							<i className="bi bi-sliders" aria-hidden="true" /> Automation
						</button>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
					</>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					{[
						{
							box: "summaryBoxDanger",
							title: "CDP-44892 evidence deadline in 2 days",
							sub: "Upload remaining documents before 29 Jun.",
						},
						{
							box: "summaryBoxWarn",
							title: "CB-99102 representment response due today",
							sub: "Visa deadline: 27 Jun 2025.",
						},
						{
							box: "summaryBoxInfo",
							title: "CDP-44923 evidence package complete",
							sub: "Submitted to Visa successfully.",
						},
						{
							box: "summaryBoxAccent",
							title: "CDP-44915 resolved — won",
							sub: "KES 124,800 recovered.",
						},
						{
							box: "summaryBox",
							title: "Merchant blacklisting applied",
							sub: "Local Vendor X — 3 new disputes prevented.",
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

			{/* ============================================================
			   FULL ACTIVITY LOG
			   ============================================================ */}
			<ModalShell
				show={isOpen("activityLogModal")}
				onClose={onClose}
				iconCls="bi bi-clock-history"
				title="Full Activity Log"
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
				<div className="d-flex gap-2 mb-3 flex-wrap">
					<select
						className={`${shared.field} form-control`}
						style={{ width: "auto" }}
						aria-label="Filter by case"
						defaultValue="All Cases"
					>
						<option>All Cases</option>
						<option>CDP-44892</option>
						<option>CB-99102</option>
					</select>
					<input
						className={`${shared.field} form-control`}
						style={{ width: 200 }}
						placeholder="Search activity..."
						aria-label="Search activity"
					/>
				</div>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Timestamp</th>
								<th>Case</th>
								<th>Action</th>
								<th>User</th>
								<th>Details</th>
							</tr>
						</thead>
						<tbody>
							{[
								[
									"27 Jun 14:32",
									"CDP-44923",
									"Evidence uploaded",
									"James K.",
									"receipt_amz.pdf, police_88291.pdf",
								],
								[
									"27 Jun 11:15",
									"CB-99102",
									"Representment filed",
									"Grace M.",
									"Response submitted to Visa",
								],
								[
									"26 Jun 09:40",
									"CDP-44892",
									"Merchant flagged",
									"System",
									"Local Vendor X — risk score 94",
								],
								[
									"25 Jun 16:20",
									"CDP-44915",
									"Case resolved — won",
									"James K.",
									"KES 124,800 recovered",
								],
							].map((row) => (
								<tr key={row[1] + row[0]}>
									{row.map((cell) => (
										<td key={cell}>{cell}</td>
									))}
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
						title: "CDP-44892 evidence due in 2 days",
						sub: "KES 1.85M — 4 files remaining",
						label: "Upload",
						modal: "evidenceUploadModal",
						danger: false,
					},
					{
						title: "CB-99102 representment due today",
						sub: "Visa — KES 87,400",
						label: "Respond",
						modal: "chargebackResponseModal",
						danger: false,
					},
					{
						title: "Local Vendor X blacklisting review",
						sub: "6 cases — 17% win rate",
						label: "Blacklist",
						modal: "merchantRiskModal",
						danger: true,
					},
					{
						title: "CDP-44923 evidence package complete",
						sub: "Ready for submission",
						label: "Submit",
						modal: "disputeDetailModal",
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
			   QUICK DISPUTE
			   ============================================================ */}
			<SimpleModal
				show={isOpen("quickDisputeModal")}
				onClose={onClose}
				iconCls="bi bi-lightning-charge"
				title="Quick Dispute"
				submitLabel="File Dispute"
				successMsg="Quick dispute filed successfully. Case CDP-44924 created."
			>
				<SelectField
					label="Transaction"
					options={[
						"Amazon Kenya — KES 87,400 — 12 Jun",
						"Jumia Pay — KES 23,150 — 10 Jun",
					]}
				/>
				<SelectField
					label="Reason"
					options={["Unauthorised", "Not Received", "Duplicate"]}
					defaultValue="Unauthorised"
				/>
				<Field label="Amount (KES)" defaultValue="87400" />
			</SimpleModal>

			{/* ============================================================
			   DISPUTE DETAILS
			   ============================================================ */}
			<ModalShell
				show={isOpen("disputeDetailModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-text"
				title="Dispute Details"
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
							onClick={() => onOpen("evidenceUploadModal")}
						>
							<i className="bi bi-upload" aria-hidden="true" /> Upload Evidence
						</button>
					</>
				}
			>
				<div className={`${styles.summaryBox} mb-3`}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Case ID</span>
						<strong>CDP-44923</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Status</span>
						<span className={`${shared.badge} ${shared.badgeInfo}`}>
							Under Review
						</span>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Amount</span>
						<strong>KES 87,400</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Network Deadline</span>
						<strong>11 Jul 2025</strong>
					</div>
				</div>
				<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
					Timeline
				</h6>
				<div className={styles.sr}>
					<div>27 Jun 14:32</div>
					<div>Evidence uploaded</div>
				</div>
				<div className={styles.sr}>
					<div>27 Jun 09:15</div>
					<div>Dispute filed</div>
				</div>
			</ModalShell>

			{/* ============================================================
			   CHARGEBACK TRACKER
			   ============================================================ */}
			<ModalShell
				show={isOpen("chargebackTrackerModal")}
				onClose={onClose}
				iconCls="bi bi-graph-up"
				title="Chargeback Tracker"
				size="lg"
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
				<div className={`${styles.summaryBox} mb-3`}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>CB-99102</span>
						<span className={`${shared.badge} ${shared.badgeWarning}`}>
							Representment
						</span>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Progress</span>
						<strong>Visa → Pre-Arbitration</strong>
					</div>
				</div>
				<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
					Stage Timeline
				</h6>
				<div className={styles.sr}>
					<div>20 Jun</div>
					<div>First chargeback filed</div>
				</div>
				<div className={styles.sr}>
					<div>25 Jun</div>
					<div>Representment submitted</div>
				</div>
				<div className={styles.sr}>
					<div>27 Jun</div>
					<div>Response due</div>
				</div>
			</ModalShell>
		</>
	);
}
