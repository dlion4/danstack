/* ============================================================================
 * TransferOverviewModals.tsx — all workflows for the transfer overview page.
 * Uses shared accessible modal primitives from the PayMo transactions workspace.
 * ========================================================================== */

import type { ReactNode } from "react";
import {
	FlowModal,
	PinRow,
	ReviewRow,
	SelectField,
	SimpleModal,
	TabbedModal,
} from "../../shared/components/modals";
import shared from "../../shared/styles/appPage.module.css";

const s = shared as Record<string, string>;

/* ──────────────────────────────────────────────────────────────────────────
   Props
   ────────────────────────────────────────────────────────────────────────── */
interface ModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
}

/* ──────────────────────────────────────────────────────────────────────────
   Static data arrays
   ────────────────────────────────────────────────────────────────────────── */
const BENEFICIARIES = [
	"Grace Kamau — 0712 345 890",
	"Landlord Properties — Bank 0012345678",
	"James Ochieng — 0722 111 222",
	"Equity Bank — 0012345678",
	"New Beneficiary",
];
const TRANSFER_TYPES = ["M-Pesa", "Bank", "Internal", "International"];
const FUNDING_SOURCES = [
	"PayMo Wallet (KES 24,500)",
	"M-Pesa (0712***890)",
	"Equity Bank ****4521",
];
const COUNTRIES = ["United Kingdom", "United States", "Germany"];
const CURRENCIES = ["GBP", "USD", "EUR"];
const PURPOSES = ["Family Support", "Business Payment", "Education"];
const FUND_SOURCES = ["Salary", "Savings", "Business Income"];
const FREQUENCIES = ["Monthly", "Bi-weekly", "Weekly", "One-time"];
const ISSUE_TYPES = [
	"Wrong amount sent",
	"Transfer not received",
	"Wrong beneficiary",
	"Duplicate transfer",
];
const BEN_TYPES = ["M-Pesa", "Bank Account", "PayMo Wallet", "International"];

/* ──────────────────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────────────────────── */
export function TransferOverviewModals({
	modalState,
	openModal,
	closeModal,
}: ModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);

	return (
		<>
			{/* ── M1: Initiate Transfer (4-step flow) ── */}
			<FlowModal
				show={isOpen("initiateTransferModal")}
				onClose={() => close("initiateTransferModal")}
				iconCls="bi bi-send-fill"
				title="Initiate Transfer"
				steps={["Beneficiary", "Amount", "Confirm", "Done"]}
				confirmLabel="Send Money"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<SelectField
									label="Search or Select Beneficiary"
									options={BENEFICIARIES}
								/>
								<div className="mb-3">
									<label className={s.fieldLabel}>Transfer Type</label>
									<div className={s.pills}>
										{TRANSFER_TYPES.map((t) => (
											<button
												type="button"
												key={t}
												className={s.pill}
											>
												{t}
											</button>
										))}
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel} htmlFor="to-amount-1">
										Amount (KES)
									</label>
									<input
										id="to-amount-1"
										className={s.field}
										defaultValue="12500"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.fieldLabel} htmlFor="to-ref-1">
										Reference / Note
									</label>
									<input
										id="to-ref-1"
										className={s.field}
										defaultValue="Rent June 2025"
									/>
								</div>
								<div className="col-12">
									<SelectField
										label="Funding Source"
										options={FUNDING_SOURCES}
									/>
								</div>
							</div>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="To" value="Grace Kamau" />
								<ReviewRow label="Amount" value="KES 12,500" />
								<ReviewRow label="Fee" value="KES 0" />
								<ReviewRow label="Total" value="KES 12,500" highlight />
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h3 className={s.receiptTitle}>Transfer Successful!</h3>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									KES 12,500 sent to Grace Kamau via M-Pesa.
								</p>
								<div className={s.reviewRow}>
									<span className={s.reviewLabel}>Reference</span>
									<strong>TRF-448291</strong>
								</div>
								<div className={s.reviewRow}>
									<span className={s.reviewLabel}>Transaction ID</span>
									<strong>MPESA-9K2M4P</strong>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ── M2: Bulk Transfer (4-step flow) ── */}
			<FlowModal
				show={isOpen("bulkTransferModal")}
				onClose={() => close("bulkTransferModal")}
				iconCls="bi bi-collection-fill"
				title="Bulk Transfer"
				steps={["Upload", "Review", "Pay", "Done"]}
				confirmLabel="Process Bulk"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<label className={s.fieldLabel} htmlFor="to-upload-1">
									Upload CSV
								</label>
								<input
									type="file"
									id="to-upload-1"
									className={s.field}
								/>
								<div className={s.hintBox}>
									<i className="bi bi-info-circle-fill" />
									<span>
										CSV format: Name, Phone/Bank, Amount, Reference
									</span>
								</div>
							</>
						)}
						{step === 2 && (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Name</th>
											<th>Account</th>
											<th>Amount</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Grace Kamau</td>
											<td>0712 345 890</td>
											<td>KES 12,500</td>
										</tr>
										<tr>
											<td>John Otieno</td>
											<td>0722 111 222</td>
											<td>KES 8,000</td>
										</tr>
										<tr>
											<td>Landlord Ltd</td>
											<td>Bank 0012345678</td>
											<td>KES 45,000</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="Total Beneficiaries" value="3" />
								<ReviewRow label="Total Amount" value="KES 65,500" />
								<ReviewRow label="Total Fee" value="KES 0" />
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-all" />
								</div>
								<h3 className={s.receiptTitle}>Bulk Transfer Complete</h3>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									3 transfers processed successfully.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ── M3: Schedule Transfer (3-step flow) ── */}
			<FlowModal
				show={isOpen("scheduleTransferModal")}
				onClose={() => close("scheduleTransferModal")}
				iconCls="bi bi-calendar-event"
				title="Schedule Transfer"
				steps={["Details", "Schedule", "Confirm"]}
				confirmLabel="Create Schedule"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<SelectField
									label="Beneficiary"
									options={["Grace Kamau", "Landlord Properties"]}
								/>
								<div className="row g-3">
									<div className="col-md-6">
										<label className={s.fieldLabel} htmlFor="to-sched-amt">
											Amount
										</label>
										<input
											id="to-sched-amt"
											className={s.field}
											defaultValue="45000"
										/>
									</div>
									<div className="col-md-6">
										<SelectField
											label="Frequency"
											options={FREQUENCIES}
										/>
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel} htmlFor="to-sched-start">
										Start Date
									</label>
									<input
										type="date"
										id="to-sched-start"
										className={s.field}
										defaultValue="2025-07-01"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.fieldLabel} htmlFor="to-sched-end">
										End Date (optional)
									</label>
									<input
										type="date"
										id="to-sched-end"
										className={s.field}
									/>
								</div>
								<div className="col-12">
									<SelectField
										label="Funding Source"
										options={["PayMo Wallet", "M-Pesa", "Bank"]}
									/>
								</div>
							</div>
						)}
						{step === 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h3 className={s.receiptTitle}>Schedule Created</h3>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									Your recurring transfer has been scheduled successfully.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ── M4: Manage Beneficiaries (tabbed) ── */}
			<TabbedModal
				show={isOpen("manageBeneficiariesModal")}
				onClose={() => close("manageBeneficiariesModal")}
				iconCls="bi bi-person-plus"
				title="Manage Beneficiaries"
				tabs={[
					{
						key: "list",
						label: "All",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table} aria-label="All beneficiaries">
									<thead>
										<tr>
											<th>Name</th>
											<th>Account</th>
											<th>Type</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Grace Kamau</td>
											<td>0712 345 890</td>
											<td>M-Pesa</td>
											<td>
												<button
													type="button"
													className={`${s.btn} ${s.btnSm}`}
													onClick={() => openModal("editBeneficiaryModal")}
												>
													Edit
												</button>{" "}
												<button
													type="button"
													className={`${s.btn} ${s.btnSm} ${s.btnPrimary}`}
													onClick={() => openModal("initiateTransferModal")}
												>
													Send
												</button>
											</td>
										</tr>
										<tr>
											<td>Landlord Properties</td>
											<td>Bank 0012345678</td>
											<td>Bank</td>
											<td>
												<button
													type="button"
													className={`${s.btn} ${s.btnSm}`}
													onClick={() => openModal("editBeneficiaryModal")}
												>
													Edit
												</button>{" "}
												<button
													type="button"
													className={`${s.btn} ${s.btnSm} ${s.btnPrimary}`}
													onClick={() => openModal("initiateTransferModal")}
												>
													Send
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "favorites",
						label: "Favorites",
						render: () => (
							<>
								<div className={s.rowItem}>
									<div><strong>Grace Kamau</strong></div>
									<button type="button" className={`${s.btn} ${s.btnSm}`}>
										Remove from Favorites
									</button>
								</div>
								<div className={s.rowItem}>
									<div><strong>Landlord Properties</strong></div>
									<button type="button" className={`${s.btn} ${s.btnSm}`}>
										Remove from Favorites
									</button>
								</div>
							</>
						),
					},
					{
						key: "recent",
						label: "Recent",
						render: () => (
							<div className={s.rowItem}>
								<div><strong>James Ochieng</strong></div>
								<button
									type="button"
									className={`${s.btn} ${s.btnSm} ${s.btnPrimary}`}
									onClick={() => openModal("addBeneficiaryModal")}
								>
									Add to Favorites
								</button>
							</div>
						),
					},
				]}
				footer={
					<>
						<button
							type="button"
							className={`${s.btn} ${s.btnSecondary}`}
							onClick={() => close("manageBeneficiariesModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={`${s.btn} ${s.btnPrimary}`}
							onClick={() => openModal("addBeneficiaryModal")}
						>
							Add New Beneficiary
						</button>
					</>
				}
			/>

			{/* ── M5: Add Beneficiary ── */}
			<SimpleModal
				show={isOpen("addBeneficiaryModal")}
				onClose={() => close("addBeneficiaryModal")}
				iconCls="bi bi-person-plus"
				title="Add Beneficiary"
				successMsg="Beneficiary added successfully!"
			>
				<label className={s.fieldLabel} htmlFor="to-ben-name">
					Name
				</label>
				<input
					id="to-ben-name"
					className={s.field}
					defaultValue="Mary Wanjiku"
				/>
				<label className={s.fieldLabel} htmlFor="to-ben-account">
					Phone / Account
				</label>
				<input
					id="to-ben-account"
					className={s.field}
					defaultValue="0733 222 111"
				/>
				<SelectField label="Type" options={BEN_TYPES} />
			</SimpleModal>

			{/* ── M6: Transfer Detail ── */}
			<SimpleModal
				show={isOpen("transferDetailModal")}
				onClose={() => close("transferDetailModal")}
				iconCls="bi bi-file-earmark-text"
				title="Transfer Details"
				hideFooter
			>
				<ReviewRow label="Reference" value="TRF-448291" />
				<ReviewRow label="Amount" value="KES 12,500" />
				<ReviewRow label="To" value="Grace Kamau" />
				<ReviewRow label="Method" value="M-Pesa" />
				<ReviewRow label="Status" value="Success" />
				<ReviewRow label="Date" value="27 Jun 2025, 14:32" />
				<div className="d-flex justify-content-center gap-2 mt-3">
					<button type="button" className={`${s.btn} ${s.btnSm}`}>
						<i className="bi bi-download" /> Receipt
					</button>
					<button type="button" className={`${s.btn} ${s.btnSm}`}>
						<i className="bi bi-share" /> Share
					</button>
					<button
						type="button"
						className={`${s.btn} ${s.btnSm}`}
						onClick={() => {
							close("transferDetailModal");
							openModal("disputeTransferModal");
						}}
					>
						Report Issue
					</button>
				</div>
			</SimpleModal>

			{/* ── M7: Edit Schedule ── */}
			<SimpleModal
				show={isOpen("editScheduleModal")}
				onClose={() => close("editScheduleModal")}
				iconCls="bi bi-pencil"
				title="Edit Schedule"
				submitLabel="Save Changes"
				successMsg="Schedule updated successfully!"
			>
				<label className={s.fieldLabel} htmlFor="to-edit-amt">
					Amount
				</label>
				<input id="to-edit-amt" className={s.field} defaultValue="45000" />
				<SelectField
					label="Frequency"
					options={["Monthly", "Bi-weekly"]}
				/>
				<div className="form-check form-switch mb-2">
					<input className="form-check-input" type="checkbox" defaultChecked id="to-edit-active" />
					<label className="form-check-label" htmlFor="to-edit-active">
						Active
					</label>
				</div>
				<div className="form-check form-switch">
					<input className="form-check-input" type="checkbox" id="to-edit-notify" />
					<label className="form-check-label" htmlFor="to-edit-notify">
						Notify before execution
					</label>
				</div>
			</SimpleModal>

			{/* ── M8: International Transfer (4-step flow) ── */}
			<FlowModal
				show={isOpen("internationalTransferModal")}
				onClose={() => close("internationalTransferModal")}
				iconCls="bi bi-globe"
				title="International Transfer"
				steps={["Recipient", "Amount", "Compliance", "Done"]}
				confirmLabel="Confirm Transfer"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<SelectField label="Country" options={COUNTRIES} />
								<label className={s.fieldLabel} htmlFor="to-intl-name">
									Recipient Name
								</label>
								<input
									id="to-intl-name"
									className={s.field}
									defaultValue="John Smith"
								/>
								<label className={s.fieldLabel} htmlFor="to-intl-iban">
									Account / IBAN
								</label>
								<input
									id="to-intl-iban"
									className={s.field}
									defaultValue="GB29NWBK60161331926819"
								/>
							</>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel} htmlFor="to-intl-amt">
										Amount (KES)
									</label>
									<input
										id="to-intl-amt"
										className={s.field}
										defaultValue="150000"
									/>
								</div>
								<div className="col-md-6">
									<SelectField label="Currency" options={CURRENCIES} />
								</div>
								<div className="col-12">
									<div className={s.hintBoxWarn}>
										<i className="bi bi-info-circle" />
										<span>
											Estimated fee: KES 2,850 | Exchange rate: 1 KES = 0.0058 GBP
										</span>
									</div>
								</div>
							</div>
						)}
						{step === 3 && (
							<>
								<SelectField label="Purpose of Transfer" options={PURPOSES} />
								<SelectField label="Source of Funds" options={FUND_SOURCES} />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h3 className={s.receiptTitle}>
									International Transfer Initiated
								</h3>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									Your transfer is being processed. Expected delivery: 1-3
									business days.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ── M9: QR Pay ── */}
			<SimpleModal
				show={isOpen("qrPayModal")}
				onClose={() => close("qrPayModal")}
				iconCls="bi bi-qr-code"
				title="QR Pay"
				submitLabel="Generate QR"
				successMsg="QR code generated! Recipient can scan to pay."
			>
				<div className="text-center">
					<div
						className={s.utilityBlock}
						style={{ padding: 24 }}
					>
						<div
							style={{
								width: 180,
								height: 180,
								background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
								margin: "0 auto",
								borderRadius: 12,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#fff",
							}}
						>
							<div>
								<i className="bi bi-qr-code" style={{ fontSize: 80 }} />
								<div style={{ marginTop: 8, fontWeight: 700 }}>Scan to Pay</div>
							</div>
						</div>
					</div>
				</div>
				<label className={s.fieldLabel} htmlFor="to-qr-amt">
					Amount (KES)
				</label>
				<input id="to-qr-amt" className={s.field} defaultValue="2500" />
				<label className={s.fieldLabel} htmlFor="to-qr-ref">
					Reference
				</label>
				<input
					id="to-qr-ref"
					className={s.field}
					defaultValue="Lunch payment"
				/>
			</SimpleModal>

			{/* ── M10: Transfer Limits ── */}
			<SimpleModal
				show={isOpen("transferLimitsModal")}
				onClose={() => close("transferLimitsModal")}
				iconCls="bi bi-sliders"
				title="Transfer Limits & Security"
				submitLabel="Save Limits"
				successMsg="Transfer limits updated successfully!"
			>
				<label className={s.fieldLabel} htmlFor="to-lim-daily">
					Daily Limit
				</label>
				<input id="to-lim-daily" className={s.field} defaultValue="500000" />
				<label className={s.fieldLabel} htmlFor="to-lim-txn">
					Per Transaction Limit
				</label>
				<input id="to-lim-txn" className={s.field} defaultValue="200000" />
				<label className={s.fieldLabel} htmlFor="to-lim-intl">
					International Limit
				</label>
				<input id="to-lim-intl" className={s.field} defaultValue="100000" />
				<div className="form-check form-switch mb-2">
					<input className="form-check-input" type="checkbox" defaultChecked id="to-lim-pin" />
					<label className="form-check-label" htmlFor="to-lim-pin">
						Require PIN for transfers above KES 10,000
					</label>
				</div>
				<div className="form-check form-switch">
					<input className="form-check-input" type="checkbox" defaultChecked id="to-lim-2fa" />
					<label className="form-check-label" htmlFor="to-lim-2fa">
						Require 2FA for international transfers
					</label>
				</div>
			</SimpleModal>

			{/* ── M11: Retry Transfer ── */}
			<SimpleModal
				show={isOpen("retryTransferModal")}
				onClose={() => close("retryTransferModal")}
				iconCls="bi bi-arrow-repeat"
				title="Retry Failed Transfer"
				submitLabel="Retry Now"
				successMsg="Transfer retried successfully!"
			>
				<div className={s.hintBoxWarn} style={{ marginBottom: 12 }}>
					<i className="bi bi-exclamation-circle" />
					<div>
						<strong>Failed Transfer Details</strong>
						<div style={{ fontSize: 14, marginTop: 4 }}>
							Landlord Properties — KES 35,000
						</div>
						<div style={{ fontSize: 12, color: "#92400E" }}>
							Reason: Insufficient funds in M-Pesa
						</div>
					</div>
				</div>
				<SelectField
					label="New Funding Source"
					options={["PayMo Wallet (KES 24,500)", "Equity Bank ****4521"]}
				/>
			</SimpleModal>

			{/* ── M12: Transfer Analytics (tabbed) ── */}
			<TabbedModal
				show={isOpen("transferAnalyticsModal")}
				onClose={() => close("transferAnalyticsModal")}
				iconCls="bi bi-bar-chart-line"
				title="Transfer Analytics"
				size="xl"
				tabs={[
					{
						key: "volume",
						label: "Volume",
						render: () => (
							<div className={s.chartWrap}>
								{[
									{ h: "60%", l: "Jan" },
									{ h: "75%", l: "Feb" },
									{ h: "90%", l: "Mar" },
									{ h: "82%", l: "Apr" },
									{ h: "100%", l: "May" },
									{ h: "95%", l: "Jun" },
								].map((b) => (
									<div key={b.l} className={s.chartCol}>
										<div style={{ height: b.h }} className={s.chartBar} />
										<span>{b.l}</span>
									</div>
								))}
							</div>
						),
					},
					{
						key: "success",
						label: "Success Rate",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table} aria-label="Success rates by channel">
									<thead>
										<tr>
											<th>Channel</th>
											<th>Success Rate</th>
											<th>Failed</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>M-Pesa</td>
											<td><span className={`${s.badge} ${s.badgeSuccess}`}>99.4%</span></td>
											<td>7</td>
										</tr>
										<tr>
											<td>Bank</td>
											<td><span className={`${s.badge} ${s.badgeSuccess}`}>97.8%</span></td>
											<td>12</td>
										</tr>
										<tr>
											<td>International</td>
											<td><span className={`${s.badge} ${s.badgeWarning}`}>94.1%</span></td>
											<td>3</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "recipients",
						label: "Recipients",
						render: () => (
							<>
								<div className={s.rowItem}>
									<div><strong>Grace Kamau</strong></div>
									<strong>24 transfers</strong>
								</div>
								<div className={s.rowItem}>
									<div><strong>Landlord Properties</strong></div>
									<strong>6 transfers</strong>
								</div>
							</>
						),
					},
				]}
			/>

			{/* ── M13: Security Check ── */}
			<SimpleModal
				show={isOpen("securityCheckModal")}
				onClose={() => close("securityCheckModal")}
				iconCls="bi bi-shield-check"
				title="Transfer Security"
				hideFooter
			>
				<div className="row g-3">
					<div className="col-4">
						<div className={`${s.softBox} ${s.softBoxSuccess} text-center`}>
							<div className={s.softValue}>96</div>
							<div className={s.softLabel}>SECURITY SCORE</div>
						</div>
					</div>
					<div className="col-4">
						<div className={`${s.softBox} ${s.softBoxInfo} text-center`}>
							<div className={s.softValue}>2FA</div>
							<div className={s.softLabel}>ENABLED</div>
						</div>
					</div>
					<div className="col-4">
						<div className={`${s.softBox} ${s.softBoxWarn} text-center`}>
							<div className={s.softValue}>14d</div>
							<div className={s.softLabel}>LAST REVIEW</div>
						</div>
					</div>
				</div>
			</SimpleModal>

			{/* ── M14: Transfer Notifications ── */}
			<SimpleModal
				show={isOpen("transferNotifModal")}
				onClose={() => close("transferNotifModal")}
				iconCls="bi bi-bell"
				title="Transfer Notifications"
				hideFooter
			>
				<div className={`${s.softBox} ${s.softBoxDanger}`} style={{ marginBottom: 8 }}>
					<strong>Scheduled transfer failed</strong>
					<div style={{ fontSize: 12, color: "var(--ink-500)" }}>
						Landlord Properties — KES 35,000
					</div>
				</div>
				<div className={`${s.softBox} ${s.softBoxWarn}`} style={{ marginBottom: 8 }}>
					<strong>Large transfer pending approval</strong>
					<div style={{ fontSize: 12, color: "var(--ink-500)" }}>
						KES 450,000 to James Ochieng
					</div>
				</div>
				<div className={`${s.softBox} ${s.softBoxSuccess}`} style={{ marginBottom: 8 }}>
					<strong>Recurring payment executed</strong>
					<div style={{ fontSize: 12, color: "var(--ink-500)" }}>
						Grace Kamau — KES 15,000
					</div>
				</div>
			</SimpleModal>

			{/* ── M15: Profile ── */}
			<SimpleModal
				show={isOpen("profileModal")}
				onClose={() => close("profileModal")}
				iconCls="bi bi-person-circle"
				title="Profile"
				hideFooter
			>
				<div className="text-center">
					<div
						style={{
							width: 64,
							height: 64,
							margin: "0 auto 12px",
							borderRadius: "50%",
							background: "linear-gradient(135deg, #ffb020, #f79009)",
							color: "#fff",
							display: "grid",
							placeItems: "center",
							fontSize: 24,
							fontWeight: 700,
						}}
					>
						JK
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
					<p style={{ fontSize: 13, color: "var(--ink-500)" }}>
						james.k@email.com · +254 712 345 890
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={s.utilityBlock}>
								<span className={s.softLabel}>Transfers</span>
								<div className={s.softValue}>1,248 this month</div>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.softBox} ${s.softBoxSuccess}`}>
								<span className={s.softLabel}>Security</span>
								<div className={s.softValue}>96/100</div>
							</div>
						</div>
					</div>
				</div>
			</SimpleModal>

			{/* ── M16: Attention Review Queue ── */}
			<SimpleModal
				show={isOpen("attentionModal")}
				onClose={() => close("attentionModal")}
				iconCls="bi bi-exclamation-circle"
				title="All Attention Items"
				hideFooter
			>
				<div className={s.rowItem}>
					<div><strong>Scheduled transfer failed</strong></div>
					<button
						type="button"
						className={`${s.btn} ${s.btnSm}`}
						onClick={() => {
							close("attentionModal");
							openModal("retryTransferModal");
						}}
					>
						Retry
					</button>
				</div>
				<div className={s.rowItem}>
					<div><strong>3 recurring payments need funding source</strong></div>
					<button
						type="button"
						className={`${s.btn} ${s.btnSm}`}
						onClick={() => {
							close("attentionModal");
							openModal("manageBeneficiariesModal");
						}}
					>
						Update
					</button>
				</div>
				<div className={s.rowItem}>
					<div><strong>Large transfer pending approval</strong></div>
					<button
						type="button"
						className={`${s.btn} ${s.btnSm} ${s.btnPrimary}`}
						onClick={() => {
							close("attentionModal");
							openModal("initiateTransferModal");
						}}
					>
						Approve
					</button>
				</div>
			</SimpleModal>

			{/* ── M17: Dispute Transfer ── */}
			<SimpleModal
				show={isOpen("disputeTransferModal")}
				onClose={() => close("disputeTransferModal")}
				iconCls="bi bi-exclamation-triangle"
				title="Report Transfer Issue"
				submitLabel="Submit"
				successMsg="Dispute submitted. Reference: DSP-88291"
			>
				<SelectField label="Issue Type" options={ISSUE_TYPES} />
				<label className={s.fieldLabel} htmlFor="to-dispute-desc">
					Description
				</label>
				<textarea
					id="to-dispute-desc"
					className={s.field}
					rows={3}
					defaultValue="The transfer was sent to the wrong number."
				/>
			</SimpleModal>

			{/* ── M18: Edit Beneficiary ── */}
			<SimpleModal
				show={isOpen("editBeneficiaryModal")}
				onClose={() => close("editBeneficiaryModal")}
				iconCls="bi bi-pencil"
				title="Edit Beneficiary"
				submitLabel="Save Changes"
				successMsg="Beneficiary updated successfully!"
			>
				<label className={s.fieldLabel} htmlFor="to-edit-ben-name">
					Name
				</label>
				<input
					id="to-edit-ben-name"
					className={s.field}
					defaultValue="Grace Kamau"
				/>
				<label className={s.fieldLabel} htmlFor="to-edit-ben-account">
					Phone / Account
				</label>
				<input
					id="to-edit-ben-account"
					className={s.field}
					defaultValue="0712 345 890"
				/>
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="to-edit-ben-fav"
					/>
					<label className="form-check-label" htmlFor="to-edit-ben-fav">
						Favorite
					</label>
				</div>
			</SimpleModal>

			{/* ── M19: Fee Calculator ── */}
			<SimpleModal
				show={isOpen("feeCalcModal")}
				onClose={() => close("feeCalcModal")}
				iconCls="bi bi-calculator"
				title="Transfer Fee Calculator"
				hideFooter
			>
				<label className={s.fieldLabel} htmlFor="to-fee-amt">
					Amount (KES)
				</label>
				<input id="to-fee-amt" className={s.field} defaultValue="50000" />
				<SelectField
					label="Method"
					options={["M-Pesa", "Bank Transfer", "International"]}
				/>
				<ReviewRow label="Estimated Fee" value="KES 35" />
			</SimpleModal>

			{/* ── M20: Full Transfer History ── */}
			<TabbedModal
				show={isOpen("transferHistoryModal")}
				onClose={() => close("transferHistoryModal")}
				iconCls="bi bi-clock-history"
				title="Full Transfer History"
				size="xl"
				tabs={[
					{
						key: "all",
						label: "All Transfers",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table} aria-label="Full transfer history">
									<thead>
										<tr>
											<th>Date</th>
											<th>Beneficiary</th>
											<th>Amount</th>
											<th>Method</th>
											<th>Status</th>
											<th>Ref</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>27 Jun</td>
											<td>Grace Kamau</td>
											<td>KES 12,500</td>
											<td>M-Pesa</td>
											<td><span className={`${s.badge} ${s.badgeSuccess}`}>Success</span></td>
											<td>TRF-448291</td>
										</tr>
										<tr>
											<td>26 Jun</td>
											<td>Landlord</td>
											<td>KES 45,000</td>
											<td>Bank</td>
											<td><span className={`${s.badge} ${s.badgeSuccess}`}>Success</span></td>
											<td>TRF-447820</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
				]}
			/>

			{/* ── M21: Quick Send to Favorite ── */}
			<SimpleModal
				show={isOpen("favoritesQuickModal")}
				onClose={() => close("favoritesQuickModal")}
				iconCls="bi bi-star"
				title="Quick Send to Favorite"
				submitLabel="Send Now"
				successMsg="Transfer sent successfully!"
			>
				<label className={s.fieldLabel} htmlFor="to-fav-amt">
					Amount (KES)
				</label>
				<input id="to-fav-amt" className={s.field} defaultValue="5000" />
				<label className={s.fieldLabel} htmlFor="to-fav-note">
					Note
				</label>
				<input
					id="to-fav-note"
					className={s.field}
					defaultValue="Quick payment"
				/>
			</SimpleModal>

			{/* ── M22: Add to Favorites ── */}
			<SimpleModal
				show={isOpen("addToFavoritesModal")}
				onClose={() => close("addToFavoritesModal")}
				iconCls="bi bi-star-fill"
				title="Add to Favorites"
				submitLabel="Add"
				successMsg="Added to favorites!"
			>
				<label className={s.fieldLabel} htmlFor="to-fav-nick">
					Nickname
				</label>
				<input
					id="to-fav-nick"
					className={s.field}
					defaultValue="My Landlord"
				/>
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="to-fav-quick"
					/>
					<label className="form-check-label" htmlFor="to-fav-quick">
						Enable quick-send
					</label>
				</div>
			</SimpleModal>
		</>
	);
}

export default TransferOverviewModals;
