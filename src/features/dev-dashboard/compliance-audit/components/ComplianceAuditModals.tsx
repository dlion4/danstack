/* ============================================================================
 * 4.12 Compliance, Audit & Regulatory Integration — all 23 modals.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextIsoStep()  (3 steps, loading gate at 2, then chains to isoDetailsModal)
 *   nextCbkStep()  (3 steps, loading gate at 2)
 *      -> both use m.step/go/confirmStep; the ISO chain uses `chain()`
 *   openModal('apiEndpointModal', extraArg) + mapEndpointContent(extraArg)
 *      -> the selected Endpoint object is passed down as a prop (no DOM writes)
 *   selectBox(el) (mutated borderColor/background) -> m.PickBox
 *   switchTab('epTab', …)                          -> m.Tabs
 *   moveFocus(el) (OTP-style auto-advance)         -> ref-scoped effect below
 * ========================================================================== */

import {
	Chk,
	CodeBox,
	Fld,
	Lbl,
	Loading,
	MBox,
	Stepper,
	Sw,
	useModals,
} from "../../_shared/devModalKit";
import type {
	ComplianceAuditContent,
	Endpoint,
} from "../data/complianceAuditData";
import styles from "../styles/complianceAudit.module.css";

const s = styles as Record<string, string>;

const METHOD_CLASS: Record<string, string> = {
	GET: "apiGet",
	POST: "apiPost",
	PUT: "apiPut",
	DEL: "apiDel",
};

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: ComplianceAuditContent;
	endpoint: Endpoint | null;
}

export default function ComplianceAuditModals({
	active,
	onClose,
	onOpen,
	data,
	endpoint,
}: Props) {
	const m = useModals(s, active, onClose);
	const chain = (id: string) => {
		onClose();
		window.setTimeout(() => onOpen(id), 60);
	};

	const isoStep = m.step("isoMessageModal");
	const cbkStep = m.step("simulateCbkModal");

	return (
		<>
			{/* ---------------- 1. API Endpoint Explorer ---------------- */}
			<MBox
				s={s}
				id="apiEndpointModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-code-square" />
						API Endpoint Explorer
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
					<span
						className={`${s.apiMethod} ${s[METHOD_CLASS[endpoint?.method ?? "POST"]]}`}
					>
						{endpoint?.method ?? "POST"}
					</span>
					<code style={{ fontSize: 14, overflowWrap: "anywhere" }}>
						{endpoint?.path ?? "/v1/compliance/..."}
					</code>
				</div>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					{endpoint?.desc ?? "Select an endpoint to inspect its contract."}
				</p>
				<m.Tabs
					k="epTab"
					def="auth"
					opts={[
						{ v: "auth", label: "Auth & Headers" },
						{ v: "req", label: "Request" },
						{ v: "res", label: "Response" },
					]}
				/>
				{m.tab("epTab", "auth") === "auth" && (
					<>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Header</th>
										<th>Required</th>
										<th>Notes</th>
									</tr>
								</thead>
								<tbody>
									{[
										[
											"Authorization",
											"Yes",
											"Bearer sk_live_… (compliance scope)",
										],
										["X-Idempotency-Key", "Yes", "UUID v4 for all POST/PUT"],
										[
											"X-Audit-Reason",
											"Yes",
											"Free-text reason written to the audit log",
										],
									].map(([h, r, n]) => (
										<tr key={h}>
											<td data-label="Header">
												<code>{h}</code>
											</td>
											<td data-label="Required">{r}</td>
											<td data-label="Notes">{n}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className={`${s.note} ${s.noteWarn} mt-3`}>
							<i className="bi bi-shield-lock me-1" /> Every call to a
							compliance endpoint is written to the immutable WORM audit trail.
						</div>
					</>
				)}
				{m.tab("epTab", "auth") === "req" && (
					<>
						<Lbl s={s}>Payload Schema (JSON)</Lbl>
						<CodeBox s={s}>
							{`{
  "transaction_ref": "txn_672b1a9e",
  "amount": 1500000,
  "currency": "KES",
  "party": {
    "name": "Acme Traders Ltd",
    "id_number": "P051234567X"
  },
  "reason": "threshold_exceeded"
}`}
						</CodeBox>
					</>
				)}
				{m.tab("epTab", "auth") === "res" && (
					<>
						<Lbl s={s}>Success Response (201 Created)</Lbl>
						<CodeBox s={s}>
							{`{
  "status": "accepted",
  "filing_ref": "FRC-2026-08812",
  "submitted_at": "2026-06-27T10:41:01Z",
  "audit_hash": "9a8b7c6d5e4f..."
}`}
						</CodeBox>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Code</th>
										<th>Reason</th>
									</tr>
								</thead>
								<tbody>
									{[
										["400", "Schema validation failed"],
										["403", "Token lacks the compliance scope"],
										["409", "Duplicate filing reference"],
										["503", "Regulator gateway unavailable"],
									].map(([c2, r]) => (
										<tr key={c2}>
											<td data-label="Code">{c2}</td>
											<td data-label="Reason">{r}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				)}
			</MBox>

			{/* ---------------- 2. Simulate CBK / AML (3-step) ---------------- */}
			<MBox
				s={s}
				id="simulateCbkModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-exclamation"
							style={{ color: "var(--pm-danger)" }}
						/>
						Simulate CBK / AML Trigger
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{cbkStep === 1 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("simulateCbkModal", 2)}
							>
								Next <i className="bi bi-arrow-right" />
							</button>
						)}
						{cbkStep === 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmD}`}
								onClick={() => m.confirmStep("simulateCbkModal", 3)}
							>
								Trigger Alert <i className="bi bi-shield-exclamation" />
							</button>
						)}
						{cbkStep >= 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={onClose}
							>
								Done
							</button>
						)}
					</>
				}
			>
				{m.busy === "simulateCbkModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Params", "Payload", "Trigger"]}
							current={cbkStep}
						/>
						{cbkStep === 1 && (
							<>
								<div className="row g-3 mb-3">
									<div className="col-md-6">
										<Lbl s={s}>Transaction Amount (KES)</Lbl>
										<Fld s={s} type="number" defaultValue="1500000" />
									</div>
									<div className="col-md-6">
										<Lbl s={s}>Scenario Type</Lbl>
										<Fld
											s={s}
											as="select"
											options={[
												"Large transaction (> KES 1M)",
												"Structuring / smurfing pattern",
												"PEP match",
												"Sanctions list hit",
											]}
										/>
									</div>
								</div>
								<div className="row g-3">
									<div className="col-md-6">
										<Lbl s={s}>Sender Name</Lbl>
										<Fld s={s} defaultValue="Acme Traders Ltd" />
									</div>
									<div className="col-md-6">
										<Lbl s={s}>Destination Country</Lbl>
										<Fld
											s={s}
											as="select"
											options={["Kenya", "Uganda", "UAE", "Nigeria"]}
										/>
									</div>
								</div>
							</>
						)}
						{cbkStep === 2 && (
							<>
								<Lbl s={s}>Generated STR Payload</Lbl>
								<CodeBox s={s}>
									{`{
  "report_type": "large_transaction",
  "amount": 1500000,
  "currency": "KES",
  "party": { "name": "Acme Traders Ltd" },
  "destination_country": "KE",
  "risk_score": 0.82
}`}
								</CodeBox>
								<div className="mb-3">
									<Lbl s={s}>HMAC-SHA256 Signature (Auto-generated)</Lbl>
									<Fld
										s={s}
										mono
										readOnly
										defaultValue="9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d"
									/>
								</div>
								<div className={`${s.note} ${s.noteWarn}`}>
									<i className="bi bi-exclamation-triangle me-1" /> This is a
									sandbox simulation. No report is filed with the FRC.
								</div>
							</>
						)}
						{cbkStep >= 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									AML Alert Triggered
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									Sandbox STR accepted. Filing ref FRC-SIM-08812 · audit hash
									recorded.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 3. KRA e-TIMS ---------------- */}
			<MBox
				s={s}
				id="kraEtimModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-receipt-cutoff"
							style={{ color: "var(--pm-warning)" }}
						/>
						KRA e-TIMS Validator
					</>
				}
				footer={m.footer(
					"kraEtimModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("kraEtimModal", "e-TIMS Mock Generation Successful!")
							}
						>
							Generate Invoice
						</button>,
					),
				)}
			>
				{m.body(
					"kraEtimModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Invoice Number</Lbl>
							<Fld s={s} mono defaultValue="INV-2026-00812" />
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<Lbl s={s}>Gross Amount (KES)</Lbl>
								<Fld s={s} type="number" defaultValue="116000" />
							</div>
							<div className="col-md-6">
								<Lbl s={s}>Tax Category</Lbl>
								<Fld
									s={s}
									as="select"
									options={["VAT 16% (Standard)", "Zero-rated", "Exempt"]}
								/>
							</div>
						</div>
						<div className={`${s.note} ${s.noteMuted}`}>
							Net KES 100,000 · VAT KES 16,000 · Gross KES 116,000. A certified
							QR code and control unit receipt number are returned on success.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 4. DSAR Request ---------------- */}
			<MBox
				s={s}
				id="dsarRequestModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-person-bounding-box"
							style={{ color: "var(--pm-primary)" }}
						/>
						Initiate DSAR (ODPC)
					</>
				}
				footer={m.footer(
					"dsarRequestModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"dsarRequestModal",
									"DSAR compilation job started. Webhook will fire upon completion.",
								)
							}
						>
							Start DSAR
						</button>,
					),
				)}
			>
				{m.body(
					"dsarRequestModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Customer ID or Phone</Lbl>
							<Fld s={s} mono placeholder="cus_9912 or 254712345678" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Request Type</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Access — export all data",
									"Rectification — correct data",
									"Erasure — right to be forgotten",
									"Portability — machine-readable export",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Webhook URL for delivery</Lbl>
							<Fld
								s={s}
								type="url"
								mono
								placeholder="https://api.yourdomain.com/dsar-ready"
							/>
						</div>
						<div className={`${s.note} ${s.noteInfo}`}>
							<i className="bi bi-info-circle me-1" /> The Data Protection Act
							2019 requires a response within 30 days. Financial records under
							statutory retention are excluded from erasure.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 5. Generate Audit Token ---------------- */}
			<MBox
				s={s}
				id="genAuditTokenModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" style={{ color: "var(--pm-warning)" }} />
						Generate Auditor Token
					</>
				}
				footer={m.footer(
					"genAuditTokenModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"genAuditTokenModal",
									"Token Generated! Provide this securely to the auditor.",
									"aud_tk_8f92bd3a41e9",
								)
							}
						>
							Generate Token
						</button>,
					),
				)}
			>
				{m.body(
					"genAuditTokenModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Auditor Name / Firm</Lbl>
							<Fld s={s} placeholder="e.g. KPMG East Africa" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Expiration Date</Lbl>
							<Fld s={s} type="date" defaultValue="2026-09-30" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Allowed Scopes</Lbl>
							{data.auditScopes.map((sc, i) => (
								<Chk key={sc} label={sc} defaultChecked={i < 2} />
							))}
						</div>
						<div className="mb-3">
							<Lbl s={s}>IP Whitelist (Optional)</Lbl>
							<Fld s={s} mono placeholder="197.232.0.0/16" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 6. Audit Logs Explorer ---------------- */}
			<MBox
				s={s}
				id="auditLogsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-journal-text" />
						Immutable Audit Logs Explorer
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("verifyLogModal")}
						>
							Verify Hash
						</button>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("auditReportModal")}
						>
							<i className="bi bi-download" /> Export
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className="d-flex gap-2 mb-3 flex-wrap">
					<Fld s={s} placeholder="Search by event ID, actor or type..." />
					<Fld
						s={s}
						as="select"
						options={[
							"All event types",
							"auth.*",
							"api_key.*",
							"webhook.*",
							"dsar.*",
						]}
						style={{ width: 190 }}
					/>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Timestamp (UTC)</th>
								<th>Event ID</th>
								<th>Event Type</th>
								<th>Actor / Service</th>
								<th>IP Address</th>
								<th>Hash Valid</th>
							</tr>
						</thead>
						<tbody>
							{data.auditLogs.map((l) => (
								<tr key={l.eventId}>
									<td data-label="Timestamp">{l.timestamp}</td>
									<td data-label="Event ID">
										<code>{l.eventId}</code>
									</td>
									<td data-label="Event Type">
										<code>{l.eventType}</code>
									</td>
									<td data-label="Actor">{l.actor}</td>
									<td data-label="IP Address">{l.ip}</td>
									<td data-label="Hash Valid">
										<span
											className={`${s.badge} ${l.hashValid ? s.badgeS : s.badgeD}`}
										>
											{l.hashValid ? "Valid" : "Tampered"}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 7. Verify Log Hash ---------------- */}
			<MBox
				s={s}
				id="verifyLogModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-check-circle"
							style={{ color: "var(--pm-accent)" }}
						/>
						Verify Tamper-Evident Hash
					</>
				}
				footer={m.footer(
					"verifyLogModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"verifyLogModal",
									"Hash verified. The log block is intact and has not been altered.",
								)
							}
						>
							Verify
						</button>,
					),
				)}
			>
				{m.body(
					"verifyLogModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Each audit block is chained with SHA-256. Enter an event ID or
							block hash to recompute and compare against the stored digest.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Event ID or Block Hash</Lbl>
							<Fld s={s} mono defaultValue="evt_9a8b7c" />
						</div>
						<CodeBox s={s} copy={false}>
							{`prev_hash: 7d6c5b4a39281f0e...
data_hash: 9a8b7c6d5e4f3a2b...
block_hash: c4d3e2f1a09b8c7d...`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 8. Third-Party Auditor Portal ---------------- */}
			<MBox
				s={s}
				id="thirdPartyAuditModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-people"
							style={{ color: "var(--pm-primary)" }}
						/>
						Third-Party Auditor Management
					</>
				}
				footer={m.footer(
					"thirdPartyAuditModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("genAuditTokenModal")}
						>
							Issue New Token
						</button>
					</>,
				)}
			>
				{m.body(
					"thirdPartyAuditModal",
					<>
						{[
							[
								"KPMG East Africa",
								"Read-only · expires 04 Jul 2026",
								"Active",
								"badgeS",
							],
							[
								"Deloitte Kenya",
								"Read-only · expired 12 Mar 2026",
								"Expired",
								"badgeNeutral",
							],
						].map(([firm, meta, st, tone]) => (
							<div key={firm} className={s.statusRow}>
								<div style={{ minWidth: 0 }}>
									<strong>{firm}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{meta}
									</div>
								</div>
								<div className="d-flex align-items-center gap-2">
									<span className={`${s.badge} ${s[tone as string]}`}>
										{st}
									</span>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
										onClick={() =>
											m.doAction(
												"thirdPartyAuditModal",
												`${firm} access revoked.`,
											)
										}
									>
										Revoke
									</button>
								</div>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 9. ISO 20022 Validator (3-step) ---------------- */}
			<MBox
				s={s}
				id="isoMessageModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-globe" style={{ color: "var(--pm-info)" }} />
						ISO 20022 Message Validator
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{isoStep === 1 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("isoMessageModal", 2)}
							>
								Next <i className="bi bi-arrow-right" />
							</button>
						)}
						{isoStep === 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("isoMessageModal", 3)}
							>
								Validate <i className="bi bi-check2-circle" />
							</button>
						)}
						{isoStep >= 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => chain("isoDetailsModal")}
							>
								View Output Detail
							</button>
						)}
					</>
				}
			>
				{m.busy === "isoMessageModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Type", "Payload", "Validate"]}
							current={isoStep}
						/>
						{isoStep === 1 && (
							<div className="mb-3">
								<Lbl s={s}>Message Type</Lbl>
								{data.isoMessageTypes.map((t) => (
									<m.PickBox key={t} k="isoType" v={t}>
										<strong style={{ fontSize: 13 }}>{t}</strong>
									</m.PickBox>
								))}
							</div>
						)}
						{isoStep === 2 && (
							<>
								<Lbl s={s}>Paste MX XML Payload</Lbl>
								<Fld
									s={s}
									as="textarea"
									rows={10}
									mono
									defaultValue={`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-2026-0812</MsgId>
      <CreDtTm>2026-06-27T10:41:01</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
  </CstmrCdtTrfInitn>
</Document>`}
								/>
							</>
						)}
						{isoStep >= 3 && (
							<>
								<div className={`${s.note} ${s.noteSuccess} mb-3`}>
									<i className="bi bi-check-circle-fill me-1" /> Message is
									schema-valid with 1 warning.
								</div>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Rule Checked</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{data.isoRules.map((r) => (
												<tr key={r.rule}>
													<td data-label="Rule">{r.rule}</td>
													<td data-label="Status">
														<span className={`${s.badge} ${s[r.tone]}`}>
															{r.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 10. SWIFT Route Check ---------------- */}
			<MBox
				s={s}
				id="swiftRouteModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-send" style={{ color: "var(--pm-primary)" }} />
						SWIFT Routing & BIC Check
					</>
				}
				footer={m.footer(
					"swiftRouteModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"swiftRouteModal",
									"BIC valid. Route: KCBLKENX → CITIUS33 (1 intermediary). Est. 1 business day.",
								)
							}
						>
							Check Route
						</button>,
					),
				)}
			>
				{m.body(
					"swiftRouteModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Destination BIC/SWIFT Code</Lbl>
							<Fld s={s} mono defaultValue="CITIUS33XXX" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Currency</Lbl>
							<Fld s={s} as="select" options={["USD", "EUR", "GBP", "KES"]} />
						</div>
						<div className={`${s.note} ${s.noteMuted}`}>
							Validates the BIC against the SWIFT directory and returns the
							correspondent chain plus estimated settlement time.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 11. SWIFT gpi Tracker ---------------- */}
			<MBox
				s={s}
				id="gpiTrackerModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-geo" style={{ color: "var(--pm-info)" }} />
						SWIFT gpi UETR Tracker
					</>
				}
				footer={m.footer(
					"gpiTrackerModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"gpiTrackerModal",
									"Payment located — credited to beneficiary.",
								)
							}
						>
							Track Payment
						</button>,
					),
				)}
			>
				{m.body(
					"gpiTrackerModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Unique End-to-end Transaction Ref (UETR)</Lbl>
							<Fld
								s={s}
								mono
								defaultValue="97ed4827-7b6f-4491-a06f-b548d5a7512d"
							/>
						</div>
						{[
							["Initiated", "KCB Bank Kenya", "27 Jun 10:41", "badgeS"],
							[
								"In transit",
								"Citibank N.A. (correspondent)",
								"27 Jun 12:08",
								"badgeS",
							],
							["Credited", "Beneficiary bank", "28 Jun 09:15", "badgeS"],
						].map(([stage, bank, when, tone]) => (
							<div key={stage} className={s.statusRow}>
								<div style={{ minWidth: 0 }}>
									<strong>{stage}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{bank}
									</div>
								</div>
								<div className="d-flex align-items-center gap-2">
									<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{when}
									</span>
									<span className={`${s.badge} ${s[tone as string]}`}>
										Done
									</span>
								</div>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 12. Open Banking Consent ---------------- */}
			<MBox
				s={s}
				id="openBankingModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-unlock" style={{ color: "var(--pm-accent)" }} />
						Open Banking Consent API
					</>
				}
				footer={m.footer("openBankingModal", m.closeOnly())}
			>
				{m.body(
					"openBankingModal",
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>TPP Name</th>
									<th>Consent Type</th>
									<th>Status</th>
									<th>Expires</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{data.consents.map((cn) => (
									<tr key={cn.tpp}>
										<td data-label="TPP Name">
											<strong>{cn.tpp}</strong>
										</td>
										<td data-label="Consent Type">{cn.consentType}</td>
										<td data-label="Status">
											<span className={`${s.badge} ${s[cn.tone]}`}>
												{cn.status}
											</span>
										</td>
										<td data-label="Expires">{cn.expires}</td>
										<td data-label="Action">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
												onClick={() =>
													m.doAction(
														"openBankingModal",
														`Consent for ${cn.tpp} revoked.`,
													)
												}
											>
												Revoke
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ---------------- 13. SCA Settings ---------------- */}
			<MBox
				s={s}
				id="scaSettingsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-fingerprint"
							style={{ color: "var(--pm-purple)" }}
						/>
						Strong Customer Auth (SCA) Rules
					</>
				}
				footer={m.footer(
					"scaSettingsModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("scaSettingsModal", "SCA Exemption rules updated!")
							}
						>
							Save Rules
						</button>,
					),
				)}
			>
				{m.body(
					"scaSettingsModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Low Value Exemption Threshold (KES)</Lbl>
							<Fld s={s} type="number" defaultValue="5000" />
						</div>
						<Sw label="Enable trusted beneficiary exemption" defaultChecked />
						<Sw
							label="Enable transaction risk analysis (TRA) exemption"
							defaultChecked
						/>
						<Sw
							label="Require dynamic linking on all card payments"
							defaultChecked
						/>
						<div className={`${s.note} ${s.noteInfo} mt-3`}>
							<i className="bi bi-info-circle me-1" /> Cumulative low-value
							exemptions are capped at 5 consecutive transactions or KES 25,000.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 14. Audit Report Export ---------------- */}
			<MBox
				s={s}
				id="auditReportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-file-pdf"
							style={{ color: "var(--pm-danger)" }}
						/>
						Export Compliance & Audit Report
					</>
				}
				footer={m.footer(
					"auditReportModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"auditReportModal",
									"Report compiled and downloading securely...",
								)
							}
						>
							Generate Report
						</button>,
					),
				)}
			>
				{m.body(
					"auditReportModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Report Category</Lbl>
							<Fld s={s} as="select" options={data.reportCategories} />
						</div>
						<div className="row g-3 mb-3">
							<div className="col-6">
								<Lbl s={s}>Date From</Lbl>
								<Fld s={s} type="date" defaultValue="2026-06-01" />
							</div>
							<div className="col-6">
								<Lbl s={s}>Date To</Lbl>
								<Fld s={s} type="date" defaultValue="2026-06-30" />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Format</Lbl>
							<Fld
								s={s}
								as="select"
								options={["PDF (signed)", "CSV", "JSON Lines"]}
							/>
						</div>
						<Chk label="Include cryptographic hash manifest" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 15. Compliance Dashboard ---------------- */}
			<MBox
				s={s}
				id="complianceDashModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-speedometer"
							style={{ color: "var(--pm-purple)" }}
						/>
						Compliance Command Center Overview
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="row g-3 mb-3">
					{[
						["Compliance Health", "100%", "var(--pm-accent)"],
						["Open Findings", "0", "var(--pm-accent)"],
						["Pending Filings", "2", "var(--pm-warning)"],
						["Audit Entries (30d)", "2.4M", "var(--pm-info)"],
					].map(([l, v, col]) => (
						<div className="col-md-3 col-6" key={l}>
							<div className="p-3 rounded border text-center">
								<div
									style={{
										fontSize: 11,
										fontWeight: 600,
										color: "var(--pm-muted)",
									}}
								>
									{l}
								</div>
								<div style={{ fontSize: 22, fontWeight: 700, color: col }}>
									{v}
								</div>
							</div>
						</div>
					))}
				</div>
				<h6 style={{ fontWeight: 700 }}>Regulatory Filing Calendar</h6>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Regulation / Authority</th>
								<th>Filing Type</th>
								<th>Deadline</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data.filings.map((f) => (
								<tr key={`${f.regulation}-${f.filingType}`}>
									<td data-label="Regulation">
										<strong>{f.regulation}</strong>
									</td>
									<td data-label="Filing Type">{f.filingType}</td>
									<td data-label="Deadline">{f.deadline}</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[f.tone]}`}>
											{f.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 16. Environment Switcher ---------------- */}
			<MBox
				s={s}
				id="envSwitcherModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-hdd-network" />
						Switch Environment
					</>
				}
				footer={m.footer(
					"envSwitcherModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"envSwitcherModal",
									"Environment context switched successfully.",
								)
							}
						>
							Switch
						</button>,
					),
				)}
			>
				{m.body(
					"envSwitcherModal",
					<>
						{data.environments.map((e) => (
							<m.PickBox key={e} k="env" v={e}>
								<div className="d-flex justify-content-between align-items-center">
									<strong>{e}</strong>
									{e === "Production" && (
										<span className={`${s.badge} ${s.badgeS}`}>Current</span>
									)}
								</div>
							</m.PickBox>
						))}
						<div className={`${s.note} ${s.noteWarn} mt-2`}>
							<i className="bi bi-exclamation-triangle me-1" /> Compliance
							filings made in Production are submitted to live regulators.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 17. Audit Alerts ---------------- */}
			<MBox
				s={s}
				id="auditAlertsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" />
						Compliance & Audit Alerts
					</>
				}
				footer={
					<>
						<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
							Mark All Read
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div style={{ maxHeight: 420, overflowY: "auto" }}>
					{data.alerts.map((a) => (
						<div
							key={a.title}
							className="p-3 rounded mb-2"
							style={{ background: a.bg, fontSize: 13 }}
						>
							<strong>{a.title}</strong>
							<div style={{ fontSize: 12, marginTop: 2 }}>{a.text}</div>
							<div
								style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}
							>
								{a.age}
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ---------------- 18. Doc Viewer ---------------- */}
			<MBox
				s={s}
				id="docViewerModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-journal-text" />
						Documentation Viewer
					</>
				}
				footer={
					<>
						{m.closeOnly()}
						<a
							className={`${s.btnPm} ${s.btnPmP}`}
							href="https://docs.paymo.com/compliance"
							target="_blank"
							rel="noreferrer noopener"
						>
							Open Full Docs <i className="bi bi-box-arrow-up-right" />
						</a>
					</>
				}
			>
				<h6 style={{ fontWeight: 700 }}>KYC/AML Implementation Guide</h6>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					This guide covers customer due diligence tiers, PEP and sanctions
					screening, transaction monitoring thresholds, and the STR submission
					workflow required by the Central Bank of Kenya and the Financial
					Reporting Centre.
				</p>
				<h6 style={{ fontWeight: 700, marginTop: 16 }}>Screening call</h6>
				<CodeBox s={s}>
					{`GET /v1/compliance/kyc/pep-screening?id_number=P051234567X
Authorization: Bearer sk_live_...
X-Audit-Reason: onboarding_due_diligence`}
				</CodeBox>
				<div className={`${s.note} ${s.noteMuted}`}>
					Retain screening evidence for 7 years. All screening calls are
					automatically written to the WORM audit trail.
				</div>
			</MBox>

			{/* ---------------- 19. Developer Profile ---------------- */}
			<MBox
				s={s}
				id="devProfileModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-circle" />
						Developer Profile
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="text-center">
					<div
						className={`${s.iconCircle} mx-auto mb-3`}
						style={{
							width: 64,
							height: 64,
							fontSize: 24,
							background: "#1E293B",
							color: "#fff",
						}}
					>
						{data.header.user.initials}
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>
						{data.header.user.name}
					</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						{data.header.user.email}
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Environment</span>
								<br />
								<strong>Production</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Compliance</span>
								<br />
								<strong style={{ color: "var(--pm-accent)" }}>100%</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ---------------- 20. ISO Details ---------------- */}
			<MBox
				s={s}
				id="isoDetailsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-file-earmark-code"
							style={{ color: "var(--pm-info)" }}
						/>
						Detailed ISO 20022 Schema Output
					</>
				}
				footer={
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("isoMessageModal")}
						>
							Validate Another
						</button>
					</>
				}
			>
				<div className={`${s.note} ${s.noteSuccess} mb-3`}>
					<i className="bi bi-check-circle-fill me-1" /> pain.001.001.09 —
					schema valid
				</div>
				<CodeBox s={s}>
					{`{
  "message_type": "pain.001.001.09",
  "msg_id": "MSG-2026-0812",
  "num_transactions": 1,
  "control_sum": 116000.00,
  "validation": {
    "schema": "pass",
    "business_rules": "pass",
    "warnings": [
      "Remittance info truncated to 140 characters"
    ]
  }
}`}
				</CodeBox>
				<div className={s.statusRow}>
					<span>Rules checked</span>
					<strong>{data.isoRules.length}</strong>
				</div>
				<div className={s.statusRow}>
					<span>Warnings</span>
					<strong style={{ color: "var(--pm-warning)" }}>1</strong>
				</div>
			</MBox>
		</>
	);
}
