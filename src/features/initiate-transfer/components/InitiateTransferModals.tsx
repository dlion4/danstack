/* ============================================================================
 * InitiateTransferModals.tsx — all modals for the Initiate Transfer page (1.2).
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.2.html modal blocks + the vanilla openM()/closeM()
 * helpers. Every modal is state-driven via the shared modal primitives (no
 * Bootstrap-JS, no innerHTML). The page owns modalState; each modal reads its
 * `show` flag and closes through closeModal(id).
 * ========================================================================== */
"use client";
import {
	FlowModal,
	PinRow,
	ReviewRow,
	SelectField,
	SimpleModal,
	TabbedModal,
} from "../../../shared/components/modals";
import shared from "../../../shared/styles/appPage.module.css";
 
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
			{/* New Transfer — multi-step flow */}
			<FlowModal
				show={isOpen("newTransferModal")}
				onClose={() => close("newTransferModal")}
				iconCls="bi bi-send"
				title="New Transfer"
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
								<label className={`${s.fieldLabel} mt-3 d-block`}>Enter PIN</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
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
 
			{/* Bulk upload */}
			<SimpleModal
				show={isOpen("bulkUploadModal")}
				onClose={() => close("bulkUploadModal")}
				iconCls="bi bi-upload"
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
					<i className="bi bi-info-circle" />
					<span>Columns: Name, Account/Phone, Bank, Amount, Reference.</span>
				</div>
			</SimpleModal>
 
			{/* Templates */}
			<TabbedModal
				show={isOpen("templateModal")}
				onClose={() => close("templateModal")}
				iconCls="bi bi-file-earmark-plus"
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
								No shared templates yet. Templates shared by your team appear
								here.
							</p>
						),
					},
				]}
			/>
 
			{/* Rail health */}
			<SimpleModal
				show={isOpen("railHealthModal")}
				onClose={() => close("railHealthModal")}
				iconCls="bi bi-heart-pulse"
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
											Operational
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>
 
			{/* Fee calculator */}
			<SimpleModal
				show={isOpen("feeCalcModal")}
				onClose={() => close("feeCalcModal")}
				iconCls="bi bi-calculator"
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
 
			{/* Rail comparison */}
			<SimpleModal
				show={isOpen("railCompareModal")}
				onClose={() => close("railCompareModal")}
				iconCls="bi bi-bar-chart"
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
 
			{/* Add source account */}
			<SimpleModal
				show={isOpen("addAccountModal")}
				onClose={() => close("addAccountModal")}
				iconCls="bi bi-plus-circle"
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
 
			{/* Beneficiary address book */}
			<TabbedModal
				show={isOpen("beneficiaryModal")}
				onClose={() => close("beneficiaryModal")}
				iconCls="bi bi-people"
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
 
			{/* Verify account name */}
			<SimpleModal
				show={isOpen("verifyAccountModal")}
				onClose={() => close("verifyAccountModal")}
				iconCls="bi bi-patch-check"
				title="Account Verification"
			>
				<div className={`${s.hintBoxSuccess} ${s.hintBox}`}>
					<i className="bi bi-check-circle" />
					<span>
						Account 1234567890 resolves to <strong>GRACE WANJIKU</strong>.
					</span>
				</div>
			</SimpleModal>
 
			{/* Upload supporting document */}
			<SimpleModal
				show={isOpen("uploadDocModal")}
				onClose={() => close("uploadDocModal")}
				iconCls="bi bi-file-earmark-arrow-up"
				title="Upload Supporting Document"
				submitLabel="Upload"
				successMsg="Document uploaded!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Document (PDF / image)</label>
					<input type="file" className={s.field} />
				</div>
				<div className={s.hintBox}>
					<i className="bi bi-info-circle" />
					<span>Max 10 MB. Invoices, contracts and KYC docs accepted.</span>
				</div>
			</SimpleModal>
 
			{/* Terms */}
			<SimpleModal
				show={isOpen("termsModal")}
				onClose={() => close("termsModal")}
				iconCls="bi bi-file-text"
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
 
			{/* Submit success */}
			<SimpleModal
				show={isOpen("submitSuccessModal")}
				onClose={() => close("submitSuccessModal")}
				iconCls="bi bi-check-circle"
				title="Transfer Submitted"
			>
				<div className={s.receipt}>
					<div className={s.receiptIcon}>
						<i className="bi bi-check-lg" />
					</div>
					<h5 className={s.receiptTitle}>Transfer Submitted for Approval</h5>
					<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
						Ref PAY-20250627-8841 — KES 250,000 to James K. Mwangi (KCB) via
						PesaLink. Awaiting maker-checker approval.
					</p>
				</div>
			</SimpleModal>
 
			{/* Draft saved */}
			<SimpleModal
				show={isOpen("draftSavedModal")}
				onClose={() => close("draftSavedModal")}
				iconCls="bi bi-save"
				title="Draft Saved"
			>
				<div className={`${s.hintBoxSuccess} ${s.hintBox}`}>
					<i className="bi bi-check-circle" />
					<span>Your transfer draft has been saved and can be resumed later.</span>
				</div>
			</SimpleModal>
		</>
	);
}