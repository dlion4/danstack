/* ============================================================================
 * TransferManagementModals.tsx — all modals for Page 1.3 "Transfer Management".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.3.html modal blocks (openM/closeM + Bootstrap-JS).
 * Each modal is state-driven via the shared modal primitives.
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
 
export interface TransferManagementData {
	banks: string[];
}
 
export interface TransferManagementModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	data: TransferManagementData;
}
 
export function TransferManagementModals({
	modalState,
	closeModal,
	data,
}: TransferManagementModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);
 
	return (
		<>
			{/* initiate domestic transfer — flow */}
			<FlowModal
				show={isOpen("initiateTransferModal")}
				onClose={() => close("initiateTransferModal")}
				iconCls="bi bi-arrow-left-right"
				title="New Domestic Transfer"
				steps={["Beneficiary", "Amount", "Confirm", "Done"]}
				confirmLabel="Send Transfer"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<SelectField label="Bank" options={data.banks} />
								<div className="row g-3">
									<div className="col-md-7">
										<label className={s.fieldLabel}>Account Number</label>
										<input className={s.field} defaultValue="0123456789" />
									</div>
									<div className="col-md-5">
										<label className={s.fieldLabel}>Rail</label>
										<select className={s.field}>
											<option>PesaLink (instant)</option>
											<option>EFT (same-day)</option>
											<option>RTGS (real-time)</option>
										</select>
									</div>
								</div>
							</>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel}>Amount (KES)</label>
									<input className={s.field} defaultValue="85000" />
								</div>
								<div className="col-md-6">
									<label className={s.fieldLabel}>Reference</label>
									<input className={s.field} defaultValue="Invoice #4821" />
								</div>
							</div>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="Beneficiary" value="Grace Wanjiku (Equity)" />
								<ReviewRow label="Amount" value="KES 85,000" />
								<ReviewRow label="Fee (PesaLink)" value="KES 50" />
								<ReviewRow label="Total debit" value="KES 85,050" highlight />
								<label className={`${s.fieldLabel} mt-3 d-block`}>Enter PIN</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>Transfer Sent</h5>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									KES 85,000 sent to Grace Wanjiku via PesaLink. Ref
									TRF-20250627-88399.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>
 
			{/* international transfer — flow */}
			<FlowModal
				show={isOpen("internationalModal")}
				onClose={() => close("internationalModal")}
				iconCls="bi bi-globe"
				title="New International Transfer"
				steps={["Recipient", "Amount & FX", "Confirm", "Done"]}
				confirmLabel="Send Abroad"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<SelectField
									label="Destination"
									options={[
										"Uganda (UGX)",
										"Tanzania (TZS)",
										"United Kingdom (GBP)",
										"United States (USD)",
									]}
								/>
								<SelectField
									label="Method"
									options={["SWIFT", "Wave", "Remitly", "WorldRemit"]}
								/>
							</>
						)}
						{step === 2 && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={s.fieldLabel}>Send Amount (USD)</label>
									<input className={s.field} defaultValue="2500" />
								</div>
								<div className="col-md-6">
									<label className={s.fieldLabel}>FX Rate</label>
									<input className={s.field} defaultValue="1 USD = 3,680 UGX" readOnly />
								</div>
							</div>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="Recipient gets" value="UGX 9,200,000" />
								<ReviewRow label="Fee" value="USD 12.00" />
								<ReviewRow label="Total debit" value="USD 2,512.00" highlight />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>International Transfer Queued</h5>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									USD 2,500 to Uganda via Wave. Compliance screening in progress.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>
 
			{/* schedule transfer */}
			<SimpleModal
				show={isOpen("scheduleTransferModal")}
				onClose={() => close("scheduleTransferModal")}
				iconCls="bi bi-calendar-event"
				title="Schedule a Transfer"
				submitLabel="Schedule"
				successMsg="Transfer scheduled!"
			>
				<SelectField label="Bank" options={data.banks} />
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel}>Amount (KES)</label>
						<input className={s.field} defaultValue="65000" />
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel}>Send Date</label>
						<input type="date" className={s.field} defaultValue="2025-07-01" />
					</div>
				</div>
			</SimpleModal>
 
			{/* recurring */}
			<SimpleModal
				show={isOpen("recurringModal")}
				onClose={() => close("recurringModal")}
				iconCls="bi bi-arrow-repeat"
				title="Set Up Recurring Transfer"
				submitLabel="Create Recurring"
				successMsg="Recurring transfer created!"
			>
				<SelectField label="Bank" options={data.banks} />
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel}>Amount (KES)</label>
						<input className={s.field} defaultValue="5999" />
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel}>Frequency</label>
						<select className={s.field}>
							<option>Weekly</option>
							<option>Monthly</option>
							<option>Quarterly</option>
							<option>Termly</option>
						</select>
					</div>
				</div>
			</SimpleModal>
 
			{/* edit recurring */}
			<SimpleModal
				show={isOpen("editRecurringModal")}
				onClose={() => close("editRecurringModal")}
				iconCls="bi bi-pencil-square"
				title="Edit Recurring Transfer"
				submitLabel="Save Changes"
				successMsg="Schedule updated!"
			>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel}>Amount (KES)</label>
						<input className={s.field} defaultValue="65000" />
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel}>Next Run</label>
						<input type="date" className={s.field} defaultValue="2025-07-01" />
					</div>
				</div>
			</SimpleModal>
 
			{/* bulk transfer */}
			<SimpleModal
				show={isOpen("bulkTransferModal")}
				onClose={() => close("bulkTransferModal")}
				iconCls="bi bi-collection"
				title="Bulk Transfer"
				size="lg"
				submitLabel="Process Batch"
				successMsg="Bulk batch queued!"
			>
				<div className="mb-3">
					<label className={s.fieldLabel}>Upload CSV / Excel / ISO 20022</label>
					<input type="file" className={s.field} />
				</div>
				<div className={s.hintBox}>
					<i className="bi bi-info-circle" />
					<span>Columns: Name, Account, Bank, Amount, Reference. Max 5,000 rows.</span>
				</div>
			</SimpleModal>
 
			{/* health check */}
			<SimpleModal
				show={isOpen("transferHealthModal")}
				onClose={() => close("transferHealthModal")}
				iconCls="bi bi-heart-pulse"
				title="Transfer Engine Health"
				size="lg"
			>
				<div className="row g-3">
					{[
						{ label: "PesaLink", value: "99.7%", tone: s.softBoxSuccess },
						{ label: "RTGS", value: "99.9%", tone: s.softBoxInfo },
						{ label: "SWIFT", value: "96.4%", tone: s.softBoxWarn },
						{ label: "EFT", value: "99.1%", tone: s.softBoxSuccess },
					].map((m) => (
						<div className="col-6 col-md-3" key={m.label}>
							<div className={`${s.softBox} ${m.tone}`}>
								<div className={s.softLabel}>{m.label}</div>
								<div className={s.softValue}>{m.value}</div>
							</div>
						</div>
					))}
				</div>
			</SimpleModal>
 
			{/* attention (all) */}
			<SimpleModal
				show={isOpen("attentionModal")}
				onClose={() => close("attentionModal")}
				iconCls="bi bi-exclamation-triangle"
				title="Items Needing Attention"
				size="lg"
			>
				<div className={`${s.hintBox} ${s.hintBoxDanger}`}>
					<i className="bi bi-exclamation-octagon" />
					<span>KES 12.5M transfer failed AML compliance (Equity → KCB).</span>
				</div>
				<div className={`${s.hintBox} ${s.hintBoxWarn}`} style={{ marginTop: 10 }}>
					<i className="bi bi-clock" />
					<span>3 recurring salary transfers need re-authorisation before 28 Jun.</span>
				</div>
				<div className={s.hintBox} style={{ marginTop: 10 }}>
					<i className="bi bi-bank" />
					<span>Co-op Bank maintenance tonight 02:00 – 04:00 EAT.</span>
				</div>
			</SimpleModal>
 
			{/* compliance review */}
			<SimpleModal
				show={isOpen("complianceModal")}
				onClose={() => close("complianceModal")}
				iconCls="bi bi-shield-check"
				title="Compliance Review"
				size="lg"
				submitLabel="Escalate to Officer"
				successMsg="Escalated to compliance officer!"
			>
				<div className={`${s.hintBox} ${s.hintBoxDanger}`}>
					<i className="bi bi-exclamation-octagon" />
					<span>AML flag: unusual pattern on Equity → KCB transfer of KES 12.5M.</span>
				</div>
				<div className="mt-3">
					<ReviewRow label="Rule triggered" value="Velocity + threshold" />
					<ReviewRow label="Risk score" value="High (82/100)" />
					<ReviewRow label="Status" value="Held for review" />
				</div>
			</SimpleModal>
 
			{/* bank status */}
			<SimpleModal
				show={isOpen("bankStatusModal")}
				onClose={() => close("bankStatusModal")}
				iconCls="bi bi-bank"
				title="Bank Connectivity Status"
				size="lg"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Bank</th>
								<th>Rails</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data.banks.map((b, i) => (
								<tr key={b}>
									<td>
										<strong>{b}</strong>
									</td>
									<td>PesaLink • RTGS • EFT</td>
									<td>
										<span className={`${s.badge} ${i === 2 ? s.badgeWarn : s.badgeSuccess}`}>
											{i === 2 ? "Maintenance" : "Online"}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>
 
			{/* bank directory */}
			<SimpleModal
				show={isOpen("bankDirectoryModal")}
				onClose={() => close("bankDirectoryModal")}
				iconCls="bi bi-list-ul"
				title="Bank Directory"
				size="lg"
			>
				<div className="mb-3">
					<input className={s.field} placeholder="Search 47+ banks…" />
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Bank</th>
								<th>SWIFT / BIC</th>
								<th>Supported Rails</th>
							</tr>
						</thead>
						<tbody>
							{data.banks.map((b) => (
								<tr key={b}>
									<td>{b}</td>
									<td>{b.slice(0, 4).toUpperCase()}KENX</td>
									<td>PesaLink • RTGS • EFT</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>
 
			{/* beneficiaries */}
			<TabbedModal
				show={isOpen("beneficiaryModal")}
				onClose={() => close("beneficiaryModal")}
				iconCls="bi bi-people"
				title="Beneficiaries"
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
						key: "intl",
						label: "International",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Name</th>
											<th>Country</th>
											<th>Method</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Peter Ochieng</td>
											<td>Uganda</td>
											<td>Wave</td>
										</tr>
										<tr>
											<td>Tech Solutions Ltd</td>
											<td>United Kingdom</td>
											<td>SWIFT</td>
										</tr>
									</tbody>
								</table>
							</div>
						),
					},
				]}
			/>
 
			{/* approvals queue */}
			<SimpleModal
				show={isOpen("approvalQueueModal")}
				onClose={() => close("approvalQueueModal")}
				iconCls="bi bi-check2-square"
				title="Approval Queue"
				size="lg"
				submitLabel="Approve Selected"
				successMsg="Selected transfers approved!"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Reference</th>
								<th>Beneficiary</th>
								<th>Amount</th>
								<th>Tier</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>TRF-88342</td>
								<td>ABC Suppliers Ltd</td>
								<td>KES 420,000</td>
								<td>Director + Finance</td>
							</tr>
							<tr>
								<td>PAY-77219</td>
								<td>Staff Salaries (42)</td>
								<td>KES 2.8M</td>
								<td>CFO + Board</td>
							</tr>
						</tbody>
					</table>
				</div>
			</SimpleModal>
 
			{/* history / export */}
			<SimpleModal
				show={isOpen("transferHistoryModal")}
				onClose={() => close("transferHistoryModal")}
				iconCls="bi bi-clock-history"
				title="Export Transfer History"
				submitLabel="Export CSV"
				successMsg="Export ready — download starting!"
			>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel}>From</label>
						<input type="date" className={s.field} defaultValue="2025-06-01" />
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel}>To</label>
						<input type="date" className={s.field} defaultValue="2025-06-30" />
					</div>
				</div>
				<SelectField label="Format" options={["CSV", "Excel (XLSX)", "PDF", "ISO 20022"]} />
			</SimpleModal>
 
			{/* reconciliation */}
			<SimpleModal
				show={isOpen("reconciliationModal")}
				onClose={() => close("reconciliationModal")}
				iconCls="bi bi-check2-square"
				title="Reconcile Transfers"
				size="lg"
				submitLabel="Run Reconciliation"
				successMsg="Reconciliation complete — 0 exceptions!"
			>
				<div className={s.hintBox}>
					<i className="bi bi-info-circle" />
					<span>Match ledger entries against bank statements for the selected period.</span>
				</div>
				<div className="mt-3">
					<ReviewRow label="Transfers in period" value="2,841" />
					<ReviewRow label="Auto-matched" value="2,838" />
					<ReviewRow label="Exceptions" value="3" />
				</div>
			</SimpleModal>
 
			{/* limits */}
			<SimpleModal
				show={isOpen("limitsModal")}
				onClose={() => close("limitsModal")}
				iconCls="bi bi-sliders"
				title="Transfer Limits"
				submitLabel="Request Change"
				successMsg="Limit change request submitted!"
			>
				<div className="row g-3">
					<div className="col-md-6">
						<label className={s.fieldLabel}>Daily Limit (KES)</label>
						<input className={s.field} defaultValue="5000000" />
					</div>
					<div className="col-md-6">
						<label className={s.fieldLabel}>Single Transfer (KES)</label>
						<input className={s.field} defaultValue="2000000" />
					</div>
				</div>
				<div className={s.hintBox} style={{ marginTop: 12 }}>
					<i className="bi bi-info-circle" />
					<span>Limit increases require CFO approval and updated KYC.</span>
				</div>
			</SimpleModal>
 
			{/* fx rates */}
			<SimpleModal
				show={isOpen("fxRatesModal")}
				onClose={() => close("fxRatesModal")}
				iconCls="bi bi-currency-exchange"
				title="Live FX Rates (KES)"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Currency</th>
								<th>Buy</th>
								<th>Sell</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>USD</td>
								<td>129.10</td>
								<td>129.45</td>
							</tr>
							<tr>
								<td>GBP</td>
								<td>164.40</td>
								<td>164.80</td>
							</tr>
							<tr>
								<td>EUR</td>
								<td>139.85</td>
								<td>140.20</td>
							</tr>
						</tbody>
					</table>
				</div>
			</SimpleModal>
 
			{/* receipts / tracking */}
			<SimpleModal
				show={isOpen("transferReceiptModal")}
				onClose={() => close("transferReceiptModal")}
				iconCls="bi bi-receipt"
				title="Transfer Receipt"
			>
				<div className={s.receipt}>
					<div className={s.receiptIcon}>
						<i className="bi bi-check-lg" />
					</div>
					<h5 className={s.receiptTitle}>Transfer Completed</h5>
					<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
						KES 85,000 to Grace Wanjiku (Equity) via PesaLink.
					</p>
				</div>
				<div className="mt-3">
					<ReviewRow label="Reference" value="TRF-20250627-88341" />
					<ReviewRow label="Fee" value="KES 50" />
					<ReviewRow label="Settled" value="27 Jun 2025, 10:42" />
				</div>
			</SimpleModal>
 
			<SimpleModal
				show={isOpen("intlReceiptModal")}
				onClose={() => close("intlReceiptModal")}
				iconCls="bi bi-receipt"
				title="International Receipt"
			>
				<div className={s.receipt}>
					<div className={s.receiptIcon}>
						<i className="bi bi-check-lg" />
					</div>
					<h5 className={s.receiptTitle}>Delivered</h5>
					<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
						USD 2,500 → UGX 9,200,000 to Peter Ochieng via Wave.
					</p>
				</div>
				<div className="mt-3">
					<ReviewRow label="FX rate" value="1 USD = 3,680 UGX" />
					<ReviewRow label="Fee" value="USD 12.00" />
				</div>
			</SimpleModal>
 
			<SimpleModal
				show={isOpen("trackTransferModal")}
				onClose={() => close("trackTransferModal")}
				iconCls="bi bi-geo-alt"
				title="Track Transfer"
			>
				<div className="mt-2">
					<ReviewRow label="Submitted" value="Done" />
					<ReviewRow label="Compliance" value="Passed" />
					<ReviewRow label="At bank" value="Processing" highlight />
					<ReviewRow label="Settled" value="Pending" />
				</div>
			</SimpleModal>
 
			<SimpleModal
				show={isOpen("trackIntlModal")}
				onClose={() => close("trackIntlModal")}
				iconCls="bi bi-geo-alt"
				title="Track International Transfer"
			>
				<div className="mt-2">
					<ReviewRow label="Submitted" value="Done" />
					<ReviewRow label="Compliance / sanctions" value="Passed" />
					<ReviewRow label="In transit (SWIFT)" value="In progress" highlight />
					<ReviewRow label="Delivered" value="Pending" />
				</div>
			</SimpleModal>
		</>
	);
}