/* ============================================================================
 * InitiateTransferModals.tsx — all modals for the Initiate Transfer page.
 * ----------------------------------------------------------------------------
 * MIGRATED & ENHANCED: All original modals retained, enhanced with Font
 * Awesome icons and emerald theme styling. Modal primitives (FlowModal,
 * SimpleModal, TabbedModal, SelectField, ReviewRow, PinRow) are preserved.
 * ========================================================================== */
"use client";

import shared from "../../shared/styles/appPage.module.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
	FlowModal,
	PinRow,
	ReviewRow,
	SelectField,
	SimpleModal,
	TabbedModal,
} from "../../shared/components/modals.tsx";

const s = shared as Record<string, string>;

interface RailRow {
	id: string;
	name: string;
	time: string;
	fee: string;
	success: string;
}

export interface InitiateTransferModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	data: {
		banks: string[];
		rails: RailRow[];
		sourceAccounts: { id: number; name: string; balance: string }[];
		purposeCodes: string[];
	};
}

export function InitiateTransferModals({
	modalState,
	closeModal,
	data,
}: InitiateTransferModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);

	return (
		<>
			{/* ── New Transfer — multi-step flow ── */}
			<FlowModal
				show={isOpen("newTransferModal")}
				onClose={() => close("newTransferModal")}
				iconCls="fa-solid fa-paper-plane"
				title="Quick Transfer"
				steps={["Beneficiary", "Amount", "Confirm", "Done"]}
				confirmLabel="Send Transfer"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<SelectField
									label="Beneficiary"
									options={[
										"Grace Wanjiku — Equity 0123456789",
										"ABC Suppliers Ltd — KCB 0987654321",
										"New beneficiary",
									]}
								/>
								<SelectField label="Bank" options={data.banks} />
							</>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel}>Amount (KES)</label>
									<input className={s.field} defaultValue="250000" />
								</div>
								<div className="col-md-6">
									<label className={s.fieldLabel}>Rail</label>
									<select className={s.field}>
										{data.rails.map((r) => (
											<option key={r.id}>
												{r.name} • {r.time} • {r.fee}
											</option>
										))}
									</select>
								</div>
								<div className="col-12">
									<label className={s.fieldLabel}>Reference / Narration</label>
									<input className={s.field} defaultValue="June 2025 Payroll" />
								</div>
							</div>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="To" value="Grace Wanjiku (Equity)" />
								<ReviewRow label="Amount" value="KES 250,000" />
								<ReviewRow label="Fee" value="KES 175" />
								<ReviewRow label="Total debit" value="KES 250,175" highlight />
								<label className={`${s.fieldLabel} mt-3 d-block`}>
									<i className="fa-solid fa-key"></i> Enter PIN
								</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="fa-solid fa-check" />
								</div>
								<h5 className={s.receiptTitle}>Transfer Submitted</h5>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									KES 250,000 queued to Grace Wanjiku via PesaLink.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ── Bulk upload ── */}
			<SimpleModal
				show={isOpen("bulkUploadModal")}
				onClose={() => close("bulkUploadModal")}
				iconCls="fa-solid fa-cloud-arrow-up"
				title="Bulk Transfer Upload"
				size="lg"
				submitLabel="Process File"
				successMsg="Bulk file queued for processing!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Upload CSV / Excel / ISO 20022</label>
					<input type="file" className={s.field} />
				</div>
				<div className={s.hintBox}>
					<i className="fa-solid fa-circle-info" />
					<span>Columns: Name, Account/Phone, Bank, Amount, Reference.</span>
				</div>
			</SimpleModal>

			{/* ── Templates ── */}
			<TabbedModal
				show={isOpen("templateModal")}
				onClose={() => close("templateModal")}
				iconCls="fa-regular fa-file-lines"
				title="Transfer Templates"
				tabs={[
					{
						key: "saved",
						label: "Saved",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Template</th>
											<th>Beneficiary</th>
											<th>Amount</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Monthly Payroll</td>
											<td>42 staff</td>
											<td>KES 2.8M</td>
										</tr>
										<tr>
											<td>Office Rent</td>
											<td>Property Mgmt Ltd</td>
											<td>KES 65,000</td>
										</tr>
										<tr>
											<td>Supplier — ABC</td>
											<td>ABC Suppliers Ltd</td>
											<td>KES 420,000</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "shared",
						label: "Shared",
						render: () => (
							<p className="text-muted mb-0">
								No shared templates yet. Templates shared by your team appear here.
							</p>
						),
					},
				]}
			/>

			{/* ── Rail health ── */}
			<SimpleModal
				show={isOpen("railHealthModal")}
				onClose={() => close("railHealthModal")}
				iconCls="fa-solid fa-heart-pulse"
				title="Rail Health"
				size="lg"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Rail</th>
								<th>Avg time</th>
								<th>Fee</th>
								<th>Success</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data.rails.map((r) => (
								<tr key={r.id}>
									<td>
										<strong>{r.name}</strong>
									</td>
									<td>{r.time}</td>
									<td>{r.fee}</td>
									<td>{r.success}</td>
									<td>
										<span className={`${s.badge} ${s.badgeSuccess}`}>
											<i className="fa-solid fa-circle-check"></i> Operational
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ─ Fee calculator ── */}
			<SimpleModal
				show={isOpen("feeCalcModal")}
				onClose={() => close("feeCalcModal")}
				iconCls="fa-solid fa-calculator"
				title="Transfer Fee Calculator"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Amount (KES)</label>
					<input className={s.field} defaultValue="250000" />
				</div>
				<SelectField
					label="Rail"
					options={data.rails.map((r) => `${r.name} (${r.fee})`)}
				/>
				<div className={`${s.softBox} d-flex justify-content-between`}>
					<span>Estimated fee</span>
					<strong>KES 175</strong>
				</div>
			</SimpleModal>

			{/* ── Rail comparison ─ */}
			<SimpleModal
				show={isOpen("railCompareModal")}
				onClose={() => close("railCompareModal")}
				iconCls="fa-solid fa-chart-bar"
				title="Compare Payment Rails"
				size="lg"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Rail</th>
								<th>Speed</th>
								<th>Fee</th>
								<th>Success</th>
							</tr>
						</thead>
						<tbody>
							{data.rails.map((r) => (
								<tr key={r.id}>
									<td>
										<strong>{r.name}</strong>
									</td>
									<td>{r.time}</td>
									<td>{r.fee}</td>
									<td>{r.success}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* ── Add source account ─ */}
			<SimpleModal
				show={isOpen("addAccountModal")}
				onClose={() => close("addAccountModal")}
				iconCls="fa-solid fa-plus-circle"
				title="Add Source Account"
				submitLabel="Add Account"
				successMsg="Source account added!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Account Name</label>
					<input className={s.field} placeholder="e.g. PayMo USD Nostro" />
				</div>
				<div className="mb-3">
					<label className={s.fieldLabel}>Account Number</label>
					<input className={s.field} placeholder="Account number" />
				</div>
				<SelectField label="Bank" options={data.banks} />
			</SimpleModal>

			{/* ── Beneficiary address book ── */}
			<TabbedModal
				show={isOpen("beneficiaryModal")}
				onClose={() => close("beneficiaryModal")}
				iconCls="fa-solid fa-address-book"
				title="Beneficiary Address Book"
				tabs={[
					{
						key: "all",
						label: "All",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Name</th>
											<th>Bank</th>
											<th>Account</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Grace Wanjiku</td>
											<td>Equity Bank</td>
											<td>0123456789</td>
										</tr>
										<tr>
											<td>ABC Suppliers Ltd</td>
											<td>KCB Bank</td>
											<td>0987654321</td>
										</tr>
										<tr>
											<td>James Otieno</td>
											<td>Co-op Bank</td>
											<td>0456123789</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
					{
						key: "fav",
						label: "Favorites",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Name</th>
											<th>Bank</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Grace Wanjiku</td>
											<td>Equity Bank</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
				]}
			/>

			{/* ── Verify account name ─ */}
			<SimpleModal
				show={isOpen("verifyAccountModal")}
				onClose={() => close("verifyAccountModal")}
				iconCls="fa-solid fa-patch-check"
				title="Account Verification"
			>
				<div className={`${s.hintBoxSuccess} ${s.hintBox}`}>
					<i className="fa-solid fa-circle-check" />
					<span>
						Account 1234567890 resolves to <strong>GRACE WANJIKU</strong>.
					</span>
				</div>
			</SimpleModal>

			{/* ── Upload supporting document ── */}
			<SimpleModal
				show={isOpen("uploadDocModal")}
				onClose={() => close("uploadDocModal")}
				iconCls="fa-solid fa-cloud-arrow-up"
				title="Upload Supporting Document"
				submitLabel="Upload"
				successMsg="Document uploaded!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Document (PDF / image)</label>
					<input type="file" className={s.field} />
				</div>
				<div className={s.hintBox}>
					<i className="fa-solid fa-circle-info" />
					<span>Max 10 MB. Invoices, contracts and KYC docs accepted.</span>
				</div>
			</SimpleModal>

			{/* ─ Terms ── */}
			<SimpleModal
				show={isOpen("termsModal")}
				onClose={() => close("termsModal")}
				iconCls="fa-regular fa-file-lines"
				title="Terms & Conditions"
				size="lg"
			>
				<div style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.7 }}>
					<p>
						By submitting a transfer you confirm that the beneficiary details are
						correct and that funds are for a lawful purpose.
					</p>
					<p>
						Transfers are subject to AML/CFT screening, maker-checker approval and
						applicable daily and single-transaction limits.
					</p>
					<p className="mb-0">
						Completed transfers cannot be reversed. Fees are non-refundable once a
						transfer settles on the selected rail.
					</p>
				</div>
			</SimpleModal>

			{/* ── Submit success ── */}
			<SimpleModal
				show={isOpen("submitSuccessModal")}
				onClose={() => close("submitSuccessModal")}
				iconCls="fa-solid fa-circle-check"
				title="Transfer Submitted"
			>
				<div className={s.receipt}>
					<div className={s.receiptIcon}>
						<i className="fa-solid fa-check" />
					</div>
					<h5 className={s.receiptTitle}>Transfer Submitted for Approval</h5>
					<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
						Ref PAY-20250627-8841 — KES 250,000 to James K. Mwangi (KCB) via
						PesaLink. Awaiting maker-checker approval.
					</p>
				</div>
			</SimpleModal>

			{/* ── Draft saved ── */}
			<SimpleModal
				show={isOpen("draftSavedModal")}
				onClose={() => close("draftSavedModal")}
				iconCls="fa-regular fa-floppy-disk"
				title="Draft Saved"
			>
				<div className={`${s.hintBoxSuccess} ${s.hintBox}`}>
					<i className="fa-solid fa-circle-check" />
					<span>
						Your transfer draft has been saved and can be resumed later.
					</span>
				</div>
			</SimpleModal>

			{/* ── Add Recipient (Drafts) - multi-step flow ── */}
			<FlowModal
				show={isOpen("addRecipientModal")}
				onClose={() => close("addRecipientModal")}
				iconCls="fa-solid fa-user-plus"
				title="Add Recipient to Address Book"
				steps={["User Details", "Paymo Wallet", "External Wallets", "Confirm", "Done"]}
				confirmLabel="Save Recipient"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel}>Name / Nickname</label>
									<input className={s.field} placeholder="Enter recipient name" />
								</div>
								<div className="col-md-6">
									<label className={s.fieldLabel}>Country</label>
									<select className={s.field}>
										<option value="">Select country</option>
										<option value="KE">Kenya</option>
										<option value="UG">Uganda</option>
										<option value="TZ">Tanzania</option>
										<option value="NG">Nigeria</option>
										<option value="GH">Ghana</option>
										<option value="ZA">South Africa</option>
										<option value="RW">Rwanda</option>
										<option value="ET">Ethiopia</option>
										<option value="CI">Côte d'Ivoire</option>
										<option value="SN">Senegal</option>
										<option value="CM">Cameroon</option>
										<option value="MZ">Mozambique</option>
										<option value="ZM">Zambia</option>
										<option value="ZW">Zimbabwe</option>
										<option value="MW">Malawi</option>
										<option value="BF">Burkina Faso</option>
										<option value="ML">Mali</option>
										<option value="NE">Niger</option>
										<option value="CD">DR Congo</option>
										<option value="AO">Angola</option>
									</select>
								</div>
								<div className="col-12">
									<label className={s.fieldLabel}>Relationship</label>
									<select className={s.field}>
										<option value="">Select relationship</option>
										<option value="family">Family</option>
										<option value="friend">Friend</option>
										<option value="colleague">Colleague</option>
										<option value="business">Business Partner</option>
										<option value="supplier">Supplier</option>
										<option value="employee">Employee</option>
										<option value="customer">Customer</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div className={s.hintBox}>
									<i className="fa-solid fa-circle-info" />
									<span>Add the recipient's basic information to help you identify them.</span>
								</div>
							</div>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-12">
									<label className={s.fieldLabel}>Paymo Wallet ID</label>
									<input className={s.field} defaultValue="PM-20250627-8841" readOnly />
									<div className="mt-2">
										<span className={`${s.badge} ${s.badgeSuccess}`}>
											<i className="fa-solid fa-circle-check"></i> Verified
										</span>
									</div>
								</div>
								<div className="col-12">
									<div className="form-check">
										<input className="form-check-input" type="checkbox" id="usePaymoWallet" />
										<label className="form-check-label" htmlFor="usePaymoWallet">
											<i className="fa-solid fa-wallet"></i> Use this Paymo wallet for transfers
										</label>
									</div>
								</div>
								<div className={s.hintBox}>
									<i className="fa-solid fa-circle-info" />
									<span>The recipient's Paymo wallet is verified and ready for transfers.</span>
								</div>
							</div>
						)}
						{step === 3 && (
							<div className="row g-3">
								<div className="col-12">
									<h6 className="mb-3">
										<i className="fa-solid fa-building-columns"></i> Bank Accounts (up to 3)
									</h6>
								</div>
								{[1, 2, 3].map((num) => (
									<div key={num} className="col-12 mb-3">
										<div className={`${s.softBox} p-3`}>
											<div className="row g-2">
												<div className="col-md-4">
													<label className={s.fieldLabel} style={{ fontSize: 12 }}>
														Bank {num}
													</label>
													<select className={s.field}>
														<option value="">Select bank</option>
														{data.banks.map((bank) => (
															<option key={bank}>{bank}</option>
														))}
													</select>
												</div>
												<div className="col-md-4">
													<label className={s.fieldLabel} style={{ fontSize: 12 }}>
														Account Number {num}
													</label>
													<input className={s.field} placeholder={`Account ${num}`} />
												</div>
												<div className="col-md-4">
													<label className={s.fieldLabel} style={{ fontSize: 12 }}>
														Account Name {num}
													</label>
													<input className={s.field} placeholder={`Account holder ${num}`} />
												</div>
											</div>
										</div>
									</div>
								))}
								<div className="col-12 mt-4">
									<h6 className="mb-3">
										<i className="fa-solid fa-mobile-screen"></i> Mobile Money Accounts
									</h6>
								</div>
								{[1, 2, 3].map((num) => (
									<div key={`mobile-${num}`} className="col-12 mb-3">
										<div className={`${s.softBox} p-3`}>
											<div className="row g-2">
												<div className="col-md-4">
													<label className={s.fieldLabel} style={{ fontSize: 12 }}>
														Provider {num}
													</label>
													<select className={s.field}>
														<option value="">Select provider</option>
														<option value="mpesa">M-Pesa (Safaricom)</option>
														<option value="airtel">Airtel Money</option>
														<option value="telkom">Telkom T-Kash</option>
														<option value="mtn">MTN Mobile Money</option>
														<option value="vodacom">Vodacom M-Pesa</option>
														<option value="airtel_ug">Airtel Money Uganda</option>
														<option value="mtn_ug">MTN Mobile Money Uganda</option>
														<option value="tigo">Tigo Pesa</option>
														<option value="halotel">Halotel Cash</option>
														<option value="zantel">Zantel Ezy Pesa</option>
														<option value="mtn_rw">MTN Mobile Money Rwanda</option>
														<option value="airtel_rw">Airtel Money Rwanda</option>
														<option value="mtn_gh">MTN Mobile Money Ghana</option>
														<option value="airtel_gh">AirtelTigo Money Ghana</option>
														<option value="vodacom_gh">Vodafone Cash Ghana</option>
														<option value="momo">MTN MoMo Nigeria</option>
														<option value="airtel_ng">Airtel Money Nigeria</option>
														<option value="9mobile">9mobile Money</option>
														<option value="gtbank">GTBank 737</option>
														<option value="mtn_zm">MTN Mobile Money Zambia</option>
														<option value="airtel_zm">Airtel Money Zambia</option>
														<option value="zamtel">Zamtel Money</option>
														<option value="mtn_ci">MTN Mobile Money Côte d'Ivoire</option>
														<option value="orange_ci">Orange Money Côte d'Ivoire</option>
														<option value="moov_ci">Moov Money Côte d'Ivoire</option>
														<option value="wave">Wave Senegal</option>
														<option value="orange_sn">Orange Money Senegal</option>
														<option value="free_sn">Free Money Senegal</option>
														<option value="mtn_cm">MTN Mobile Money Cameroon</option>
														<option value="orange_cm">Orange Money Cameroon</option>
														<option value="mtn_ml">MTN Mobile Money Mali</option>
														<option value="orange_ml">Orange Money Mali</option>
														<option value="moov_ml">Moov Money Mali</option>
													</select>
												</div>
												<div className="col-md-4">
													<label className={s.fieldLabel} style={{ fontSize: 12 }}>
														Phone Number {num}
													</label>
													<input className={s.field} placeholder={`2547XXXXXXXX`} />
												</div>
												<div className="col-md-4">
													<label className={s.fieldLabel} style={{ fontSize: 12 }}>
														Account Name {num}
													</label>
													<input className={s.field} placeholder={`Account holder ${num}`} />
												</div>
											</div>
										</div>
									</div>
								))}
								<div className={s.hintBox}>
									<i className="fa-solid fa-circle-info" />
									<span>Add bank accounts and mobile money wallets for different African countries.</span>
								</div>
							</div>
						)}
						{step === 4 && (
							<div className="row g-3">
								<div className="col-12">
									<div className="form-check mb-3">
										<input className="form-check-input" type="checkbox" id="confirmSave" />
										<label className="form-check-label" htmlFor="confirmSave">
											<i className="fa-solid fa-check-circle"></i> I confirm the recipient details are correct
										</label>
									</div>
									<div className="form-check mb-3">
										<input className="form-check-input" type="checkbox" id="quickTransfer" defaultChecked />
										<label className="form-check-label" htmlFor="quickTransfer">
											<i className="fa-solid fa-bolt"></i> Enable quick transfers for this recipient
										</label>
									</div>
									<div className="form-check mb-3">
										<input className="form-check-input" type="checkbox" id="addToFavorites" />
										<label className="form-check-label" htmlFor="addToFavorites">
											<i className="fa-solid fa-star"></i> Add to favorites
										</label>
									</div>
								</div>
								<div className={s.hintBox}>
									<i className="fa-solid fa-circle-info" />
									<span>Review and confirm before saving to your address book.</span>
								</div>
							</div>
						)}
						{step === 5 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="fa-solid fa-check" />
								</div>
								<h5 className={s.receiptTitle}>Successfully Saved</h5>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									Recipient has been added to your address book or favorites.
								</p>
								<button
									className={`${s.button} ${s.buttonPrimary} mt-3`}
									onClick={() => {
										close("addRecipientModal");
										setTimeout(() => openModal("addRecipientModal"), 100);
									}}
								>
									<i className="fa-solid fa-plus"></i> Add Another Recipient
								</button>
							</div>
						)}
					</>
				)}
			</FlowModal>
		</>
	);
}
