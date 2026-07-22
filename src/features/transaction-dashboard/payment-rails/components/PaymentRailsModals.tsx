/* ============================================================================
 * PaymentRailsModals.tsx — all modals for Page 1.4 "Payment Rails & Routing".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.4.html modal blocks (openM/closeM + Bootstrap-JS).
 * Each modal is state-driven via the shared modal primitives.
 * ========================================================================== */
"use client";
import {
	Field,
	FlowModal,
	PinRow,
	ReviewRow,
	SelectField,
	SimpleModal,
	TabbedModal,
} from "../../../../shared/components/modals";
import shared from "../../../../shared/styles/appPage.module.css";
import { cx } from "../../../shell/data/shellData";
import type { PaymentRailsContent } from "../pages/PaymentRails";

const s = shared as Record<string, string>;

export type PaymentRailsData = Pick<PaymentRailsContent, "banks" | "routingRules">;

export interface PaymentRailsModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	data: PaymentRailsData;
}

export function PaymentRailsModals({
	modalState,
	openModal,
	closeModal,
	data,
}: PaymentRailsModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);
	const open = (id: string) => openModal(id);

	return (
		<>
			{/* add bank — flow */}
			<FlowModal
				show={isOpen("addBankModal")}
				onClose={() => close("addBankModal")}
				iconCls="bi bi-plus-circle"
				title="Connect New Bank"
				steps={["Bank", "Rails", "Confirm", "Done"]}
				confirmLabel="Connect Bank"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<Field label="Bank Name" defaultValue="NCBA Bank Kenya" />
								<Field label="API Endpoint" defaultValue="https://api.ncba.co.ke/v2" />
								<SelectField
									label="Integration Type"
									options={["REST API (real-time)", "SFTP batch", "ISO 20022", "Host-to-Host"]}
								/>
							</>
						)}
						{step === 2 && (
							<>
								<div className="mb-3">
									<label className={s.fieldLabel}>Enabled Rails</label>
									{["PesaLink", "RTGS", "ACH", "SWIFT", "Card-to-Bank"].map((r) => (
										<div className="form-check" key={r}>
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={r === "PesaLink" || r === "RTGS"}
												id={`rail-${r}`}
											/>
											<label className="form-check-label" htmlFor={`rail-${r}`} style={{ fontSize: 13 }}>
												{r}
											</label>
										</div>
									))}
								</div>
								<Field label="Settlement Window" defaultValue="09:00 – 16:00" />
							</>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="Bank" value="NCBA Bank Kenya" />
								<ReviewRow label="Rails" value="PesaLink, RTGS" />
								<ReviewRow label="Per-tx limit" value="KES 150M" highlight />
								<div className={`${s.hintBox} ${s.hintBoxSuccess} mt-3`}>
									<i className="bi bi-shield-check" />
									<span>API credentials validated • Sandbox test passed.</span>
								</div>
								<label className={`${s.fieldLabel} mt-3 d-block`}>Authorisation PIN</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>Bank Connected</h5>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									NCBA Bank is now live across 2 rails. Ref BANK-20250627-88291.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* routing rules — tabbed */}
			<TabbedModal
				show={isOpen("routingRulesModal")}
				onClose={() => close("routingRulesModal")}
				iconCls="bi bi-diagram-3"
				title="Routing Rules Engine"
				tabs={[
					{
						key: "active",
						label: "Active Rules",
						render: () => (
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Rule</th>
											<th>Amount</th>
											<th>Rail</th>
											<th>Fallback</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{data.routingRules.map((r) => (
											<tr key={r.name}>
												<td>{r.name}</td>
												<td>{r.amount}</td>
												<td><strong>{r.rail}</strong></td>
												<td>{r.fallback}</td>
												<td>
													<span className={cx(s.badge, r.status === "Active" ? s.badgeSuccess : s.badgeWarn)}>
														{r.status}
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
						key: "new",
						label: "New Rule",
						render: () => (
							<>
								<Field label="Rule Name" defaultValue="High-Value International" />
								<div className="row g-3">
									<div className="col-md-6">
										<Field label="Min Amount (KES)" defaultValue="500000" />
									</div>
									<div className="col-md-6">
										<Field label="Max Amount (KES)" defaultValue="5000000" />
									</div>
								</div>
								<SelectField label="Primary Rail" options={["PesaLink", "RTGS", "SWIFT", "ACH"]} />
								<SelectField label="Fallback Rail" options={["None", "RTGS", "PesaLink", "ACH"]} />
							</>
						),
					},
				]}
			/>

			{/* rail config */}
			<SimpleModal
				show={isOpen("railConfigModal")}
				onClose={() => close("railConfigModal")}
				iconCls="bi bi-gear"
				title="Payment Rail Configuration"
				size="lg"
				submitLabel="Save Configuration"
				successMsg="Rail configuration updated!"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Rail</th>
								<th>Status</th>
								<th>Cut-off</th>
								<th>Per-tx Limit</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>PesaLink Instant</td>
								<td><span className={cx(s.badge, s.badgeSuccess)}>Enabled</span></td>
								<td>16:00</td>
								<td>KES 100M</td>
							</tr>
							<tr>
								<td>RTGS</td>
								<td><span className={cx(s.badge, s.badgeSuccess)}>Enabled</span></td>
								<td>15:30</td>
								<td>KES 500M</td>
							</tr>
							<tr>
								<td>ACH</td>
								<td><span className={cx(s.badge, s.badgeSuccess)}>Enabled</span></td>
								<td>14:00</td>
								<td>KES 50M</td>
							</tr>
							<tr>
								<td>SWIFT</td>
								<td><span className={cx(s.badge, s.badgeWarn)}>Credential expires in 5d</span></td>
								<td>12:00</td>
								<td>USD 1M</td>
							</tr>
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* nostro accounts */}
			<SimpleModal
				show={isOpen("nostroModal")}
				onClose={() => close("nostroModal")}
				iconCls="bi bi-globe2"
				title="Nostro / Vostro Accounts"
				size="lg"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Account</th>
								<th>Bank</th>
								<th>Balance</th>
								<th>Reconciliation</th>
							</tr>
						</thead>
						<tbody>
							{data.banks.slice(0, 4).map((b) => (
								<tr key={b.name}>
									<td>NOSTRO-{b.name.slice(0, 3).toUpperCase()}-001</td>
									<td>{b.name}</td>
									<td><strong>USD {(Math.random() * 2 + 0.5).toFixed(2)}M</strong></td>
									<td>
										<span className={cx(s.badge, s.badgeSuccess)}>Matched</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* fx rebalance — flow */}
			<FlowModal
				show={isOpen("fxRebalanceModal")}
				onClose={() => close("fxRebalanceModal")}
				iconCls="bi bi-arrow-left-right"
				title="Nostro FX Rebalance"
				steps={["Position", "Trade", "Confirm", "Done"]}
				confirmLabel="Execute Rebalance"
			>
				{(step) => (
					<>
						{step === 1 && (
							<>
								<div className={`${s.hintBox} ${s.hintBoxWarn} mb-3`}>
									<i className="bi bi-exclamation-triangle" />
									<span>USD exposure +$142K above target band. Recommend selling USD 100K.</span>
								</div>
								<SelectField label="Source Nostro" options={["Equity USD", "KCB USD", "Stanbic USD"]} />
								<Field label="Amount (USD)" defaultValue="100000" />
							</>
						)}
						{step === 2 && (
							<>
								<SelectField label="Counterparty" options={["Interbank Spot", "CBK Window", "Equity Treasury"]} />
								<Field label="Rate (KES/USD)" defaultValue="129.45" />
								<div className="mt-3">
									<ReviewRow label="Sell USD" value="100,000" />
									<ReviewRow label="Rate" value="129.45" />
									<ReviewRow label="Receive KES" value="12,945,000" highlight />
								</div>
							</>
						)}
						{step === 3 && (
							<>
								<ReviewRow label="Trade" value="Sell USD 100K @ 129.45" />
								<ReviewRow label="Settlement" value="T+0 (instant)" />
								<ReviewRow label="Total" value="KES 12,945,000" highlight />
								<label className={`${s.fieldLabel} mt-3 d-block`}>Authorisation PIN</label>
								<PinRow />
							</>
						)}
						{step === 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={s.receiptTitle}>FX Rebalance Executed</h5>
								<p style={{ fontSize: 14, color: "var(--ink-500)" }}>
									USD 100K sold @ 129.45. Ref FX-20250627-88301.
								</p>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* rail / bank health */}
			<SimpleModal
				show={isOpen("healthCheckModal")}
				onClose={() => close("healthCheckModal")}
				iconCls="bi bi-heart-pulse"
				title="Rail Health Dashboard"
				size="lg"
			>
				<div className="row g-2 mb-3">
					<div className="col-6 col-md-3">
						<div className={cx(s.softBox, s.softBoxSuccess)}>
							<div className={s.softLabel}>Healthy</div>
							<div className={s.softValue}>7</div>
						</div>
					</div>
					<div className="col-6 col-md-3">
						<div className={cx(s.softBox, s.softBoxWarn)}>
							<div className={s.softLabel}>Degraded</div>
							<div className={s.softValue}>1</div>
						</div>
					</div>
					<div className="col-6 col-md-3">
						<div className={cx(s.softBox, s.softBoxInfo)}>
							<div className={s.softLabel}>Avg Latency</div>
							<div className={s.softValue}>312ms</div>
						</div>
					</div>
					<div className="col-6 col-md-3">
						<div className={cx(s.softBox, s.softBoxPurple)}>
							<div className={s.softLabel}>Uptime (30d)</div>
							<div className={s.softValue}>99.94%</div>
						</div>
					</div>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Bank</th>
								<th>Health</th>
								<th>Rails</th>
								<th>Last Sync</th>
							</tr>
						</thead>
						<tbody>
							{data.banks.map((b) => (
								<tr key={b.name}>
									<td>{b.name}</td>
									<td>
										<span
											className={cx(
												s.badge,
												b.health === "healthy"
													? s.badgeSuccess
													: b.health === "degraded"
														? s.badgeWarn
														: s.badgeDanger,
											)}
										>
											{b.health}
										</span>
									</td>
									<td>{b.rails}</td>
									<td>just now</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* bank health (single bank drill-down) */}
			<SimpleModal
				show={isOpen("bankHealthModal")}
				onClose={() => close("bankHealthModal")}
				iconCls="bi bi-bank"
				title="Equity Bank — Health Detail"
			>
				<div className={`${s.hintBox} ${s.hintBoxDanger} mb-3`}>
					<i className="bi bi-exclamation-triangle" />
					<span>API health degraded. Last successful sync 47 minutes ago.</span>
				</div>
				<div className="row g-2">
					<div className="col-6">
						<div className={cx(s.softBox, s.softBoxWarn)}>
							<div className={s.softLabel}>Latency</div>
							<div className={s.softValue}>2,140ms</div>
						</div>
					</div>
					<div className="col-6">
						<div className={cx(s.softBox, s.softBoxDanger)}>
							<div className={s.softLabel}>Error Rate</div>
							<div className={s.softValue}>4.2%</div>
						</div>
					</div>
				</div>
			</SimpleModal>

			{/* performance */}
			<SimpleModal
				show={isOpen("performanceModal")}
				onClose={() => close("performanceModal")}
				iconCls="bi bi-bar-chart-line"
				title="Rail Performance Report"
				size="lg"
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Rail</th>
								<th>Volume</th>
								<th>Success</th>
								<th>Avg Time</th>
								<th>Cost</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>PesaLink</td>
								<td>KES 1.24B</td>
								<td><span className={cx(s.badge, s.badgeSuccess)}>99.4%</span></td>
								<td>4.2s</td>
								<td>KES 55K</td>
							</tr>
							<tr>
								<td>RTGS</td>
								<td>KES 892M</td>
								<td><span className={cx(s.badge, s.badgeSuccess)}>99.1%</span></td>
								<td>42min</td>
								<td>KES 28K</td>
							</tr>
							<tr>
								<td>ACH</td>
								<td>KES 412M</td>
								<td><span className={cx(s.badge, s.badgeWarn)}>96.8%</span></td>
								<td>2h 11m</td>
								<td>KES 18K</td>
							</tr>
							<tr>
								<td>SWIFT</td>
								<td>KES 296M</td>
								<td><span className={cx(s.badge, s.badgeWarn)}>94.1%</span></td>
								<td>4h 12m</td>
								<td>KES 83K</td>
							</tr>
						</tbody>
					</table>
				</div>
			</SimpleModal>

			{/* reconcile */}
			<SimpleModal
				show={isOpen("reconcileModal") || isOpen("auditLogModal")}
				onClose={() => close("auditLogModal")}
				iconCls="bi bi-check2-square"
				title="Rail Reconciliation"
				size="lg"
				submitLabel="Run Reconciliation"
				successMsg="Reconciliation complete — 0 exceptions!"
			>
				<div className="row g-3 mb-3">
					<div className="col-md-6">
						<Field label="From" type="date" defaultValue="2025-06-01" />
					</div>
					<div className="col-md-6">
						<Field label="To" type="date" defaultValue="2025-06-27" />
					</div>
				</div>
				<SelectField label="Rail" options={["All Rails", "PesaLink", "RTGS", "ACH", "SWIFT"]} />
			</SimpleModal>

			{/* export */}
			<SimpleModal
				show={isOpen("exportReportModal")}
				onClose={() => close("exportReportModal")}
				iconCls="bi bi-download"
				title="Export Rail Report"
				submitLabel="Generate Export"
				successMsg="Report generated and downloading!"
			>
				<SelectField
					label="Report Type"
					options={["Rail performance summary", "Bank connectivity log", "Routing rule audit", "Cost analysis"]}
				/>
				<div className="row g-3">
					<div className="col-md-6">
						<Field label="From" type="date" defaultValue="2025-06-01" />
					</div>
					<div className="col-md-6">
						<Field label="To" type="date" defaultValue="2025-06-27" />
					</div>
				</div>
				<SelectField label="Format" options={["PDF", "Excel (XLSX)", "CSV"]} />
			</SimpleModal>

			{/* A/B test */}
			<SimpleModal
				show={isOpen("abTestModal")}
				onClose={() => close("abTestModal")}
				iconCls="bi bi-graph-up"
				title="A/B Test — ACH Routing Rule"
				submitLabel="Start Test"
				successMsg="A/B test started! Results in 7 days."
			>
				<div className={`${s.hintBox} ${s.hintBoxSuccess} mb-3`}>
					<i className="bi bi-lightning-charge" />
					<span>Projected 0.8% cost reduction over 7-day test window.</span>
				</div>
				<SelectField label="Traffic Split" options={["50 / 50", "70 / 30 (control first)", "20 / 80"]} />
				<Field label="Duration (days)" defaultValue="7" />
			</SimpleModal>

			{/* attention */}
			<SimpleModal
				show={isOpen("attentionModal")}
				onClose={() => close("attentionModal")}
				iconCls="bi bi-exclamation-circle"
				title="All Attention Items"
			>
				<div className={s.rowItem}>
					<div><strong>Equity Bank API health degraded</strong></div>
					<button className={cx(s.btn, s.btnSm)} onClick={() => open("bankHealthModal")}>Investigate</button>
				</div>
				<div className={s.rowItem}>
					<div><strong>RTGS cut-off in 42 minutes</strong></div>
					<button className={cx(s.btn, s.btnSm)} onClick={() => open("railConfigModal")}>Manage</button>
				</div>
				<div className={s.rowItem}>
					<div><strong>SWIFT credential expires in 5 days</strong></div>
					<button className={cx(s.btn, s.btnSm)} onClick={() => open("railConfigModal")}>Renew</button>
				</div>
			</SimpleModal>
		</>
	);
}
