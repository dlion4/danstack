/* ============================================================================
 * 4.2 API Reference — all 23 modals, including the two multistep wizards
 * (API Keys 3-step, Create App 3-step) and the interactive Test Console.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextKeyStep() / nextAppStep()  -> m.step() + m.go() + m.confirmStep()
 *   renderStepper('keyStepper',..) -> <Stepper labels current/>
 *   showFlow('keyStep', n, 3)      -> conditional render on m.step(id)
 *   runApiTest()                   -> local state in <TestConsoleBody/>
 *   openEndpointModal(path,title)  -> `endpoint` prop passed down from page
 * ========================================================================== */

import { useState } from "react";
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
import type { ApiReferenceContent, Endpoint } from "../data/apiReferenceData";
import styles from "../styles/apiReference.module.css";

const s = styles as Record<string, string>;

const METHOD_CLASS: Record<string, string> = {
	GET: "apiGet",
	POST: "apiPost",
	PUT: "apiPut",
	DELETE: "apiDelete",
};

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: ApiReferenceContent;
	endpoint: Endpoint | null;
}

/* ---------------------------------------------------------------------------
 * Test console body — replaces runApiTest() + innerHTML response painting.
 * ------------------------------------------------------------------------- */
function TestConsoleBody() {
	const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
	return (
		<div className="row g-3">
			<div className="col-lg-5">
				<div className="mb-3">
					<Lbl s={s}>Endpoint</Lbl>
					<div className="d-flex gap-2">
						<Fld
							s={s}
							as="select"
							options={["POST", "GET", "PUT", "DELETE"]}
							style={{ width: 110, fontWeight: 700 }}
						/>
						<Fld s={s} defaultValue="/v1/collections/stk-push" mono />
					</div>
				</div>
				<div className="mb-3">
					<Lbl s={s}>Environment</Lbl>
					<Fld
						s={s}
						as="select"
						options={[
							"Sandbox (api.sandbox.paymo.co.ke)",
							"Production (api.paymo.co.ke)",
						]}
					/>
				</div>
				<div className="mb-3">
					<Lbl s={s}>Request Body (JSON)</Lbl>
					<Fld
						s={s}
						as="textarea"
						rows={8}
						mono
						defaultValue={`{
  "amount": 100,
  "phone_number": "254712345678",
  "reference": "TEST-001"
}`}
						style={{
							background: "var(--code-bg)",
							color: "var(--code-fg)",
							fontSize: 12,
						}}
					/>
				</div>
				<button
					type="button"
					className={`${s.btnPm} ${s.btnPmP} w-100`}
					onClick={() => {
						setPhase("running");
						window.setTimeout(() => setPhase("done"), 1500);
					}}
				>
					<i className="bi bi-play-fill" /> Send Request
				</button>
			</div>
			<div className="col-lg-7">
				<Lbl s={s}>Response</Lbl>
				<div
					className={s.apiCodeBlock}
					style={{ height: 340, overflowY: "auto", marginTop: 6 }}
				>
					{phase === "idle" && (
						<span style={{ color: "var(--pm-muted)" }}>
							// Click "Send Request" to see the API response...
						</span>
					)}
					{phase === "running" && (
						<span style={{ color: "var(--code-num)" }}>
							// Sending request…
						</span>
					)}
					{phase === "done" && (
						<pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
							<span style={{ color: "var(--code-key)" }}>{"{"}</span>
							{"\n  "}
							<span style={{ color: "var(--code-key)" }}>"status"</span>:{" "}
							<span style={{ color: "var(--code-str)" }}>"success"</span>,
							{"\n  "}
							<span style={{ color: "var(--code-key)" }}>"data"</span>: {"{"}
							{"\n    "}
							<span style={{ color: "var(--code-key)" }}>"transaction_id"</span>
							:{" "}
							<span style={{ color: "var(--code-str)" }}>"txn_mock_9921"</span>
							{"\n  }"}
							{"\n}"}
						</pre>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ApiReferenceModals({
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

	/* ----- wizard drivers (nextKeyStep / nextAppStep) ----- */
	const keyStep = m.step("apiKeysModal");
	const appStep = m.step("createAppModal");

	return (
		<>
			{/* ---------------- 1. Endpoint Detail ---------------- */}
			<MBox
				s={s}
				id="endpointDetailModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-code-square" />
						{endpoint?.title ?? "Endpoint"}
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
					<span
						className={`${s.apiMethod} ${s[METHOD_CLASS[endpoint?.method ?? "POST"]]}`}
					>
						{endpoint?.method ?? "POST"}
					</span>
					<code style={{ fontSize: 15, overflowWrap: "anywhere" }}>
						{endpoint?.path ?? "/v1/path"}
					</code>
				</div>
				<div className="row g-4">
					<div className="col-lg-6">
						<h6 style={{ fontWeight: 700 }}>Description</h6>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							{endpoint?.desc ??
								"This endpoint is used for the selected operation. Please see the required parameters below."}
						</p>
						<h6 style={{ fontWeight: 700, marginTop: 16 }}>Headers</h6>
						<div className={s.tableWrap}>
							<table className={`${s.table} mb-3`}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Required</th>
										<th>Type</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td data-label="Name">
											<code>Authorization</code>
										</td>
										<td data-label="Required">Yes</td>
										<td data-label="Type">Bearer Token</td>
									</tr>
									<tr>
										<td data-label="Name">
											<code>X-Idempotency-Key</code>
										</td>
										<td data-label="Required">Yes (POST)</td>
										<td data-label="Type">UUID v4</td>
									</tr>
									<tr>
										<td data-label="Name">
											<code>Content-Type</code>
										</td>
										<td data-label="Required">Yes</td>
										<td data-label="Type">application/json</td>
									</tr>
								</tbody>
							</table>
						</div>
						<h6 style={{ fontWeight: 700 }}>Request Body Schema</h6>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Parameter</th>
										<th>Type</th>
										<th>Required</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{[
										[
											"amount",
											"Integer",
											"Yes",
											"Amount in KES to charge. Minimum 10.",
										],
										["phone_number", "String", "Yes", "Format: 2547XXXXXXXX"],
										[
											"reference",
											"String",
											"Yes",
											"Your internal system reference. Max 30 chars.",
										],
										[
											"callback_url",
											"String",
											"No",
											"URL to receive the async result. Overrides default.",
										],
									].map(([p, t, r, d]) => (
										<tr key={p}>
											<td data-label="Parameter">
												<code>{p}</code>
											</td>
											<td data-label="Type">{t}</td>
											<td data-label="Required">{r}</td>
											<td data-label="Description">{d}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<div className="col-lg-6">
						<h6 style={{ fontWeight: 700 }}>Example Request (cURL)</h6>
						<CodeBox s={s} api>
							{`curl -X ${endpoint?.method ?? "POST"} https://api.sandbox.paymo.co.ke${endpoint?.path ?? "/v1/..."} \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500,
    "phone_number": "254712345678",
    "reference": "INV-2025-001"
  }'`}
						</CodeBox>
						<h6 style={{ fontWeight: 700 }}>Example Response (200 OK)</h6>
						<CodeBox s={s} api>
							{`{
  "status": "success",
  "message": "STK Push initiated successfully",
  "data": {
    "transaction_id": "txn_672b1a9e",
    "merchant_request_id": "12345-67890-1",
    "checkout_request_id": "ws_CO_27062025123000"
  }
}`}
						</CodeBox>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm} w-100`}
							onClick={() => chain("testConsoleModal")}
						>
							<i className="bi bi-play-fill" /> Test in API Console
						</button>
					</div>
				</div>
			</MBox>

			{/* ---------------- 2. API Keys Management (multistep) ---------------- */}
			<MBox
				s={s}
				id="apiKeysModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" />
						API Keys Management
					</>
				}
				footer={
					<>
						{m.closeOnly()}
						{keyStep === 1 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("apiKeysModal", 2)}
							>
								<i className="bi bi-plus" /> Generate New Key
							</button>
						)}
						{keyStep === 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("apiKeysModal", 3)}
							>
								Generate Key
							</button>
						)}
						{keyStep === 3 && (
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
				{m.busy === "apiKeysModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["View Keys", "Generate", "Save Secret"]}
							current={keyStep}
						/>

						{keyStep === 1 && (
							<>
								<div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
									<h6 style={{ fontWeight: 700, margin: 0 }}>Active Keys</h6>
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => m.go("apiKeysModal", 2)}
									>
										<i className="bi bi-plus" /> Generate New Key
									</button>
								</div>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Name</th>
												<th>Environment</th>
												<th>Prefix</th>
												<th>Created</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{data.keys.map((k) => (
												<tr key={k.prefix}>
													<td data-label="Name">{k.name}</td>
													<td data-label="Environment">
														<span className={`${s.badge} ${s[k.envTone]}`}>
															{k.env}
														</span>
													</td>
													<td data-label="Prefix">
														<code>{k.prefix}</code>
													</td>
													<td data-label="Created">{k.created}</td>
													<td data-label="Status">
														<span className={`${s.badge} ${s[k.statusTone]}`}>
															{k.status}
														</span>
													</td>
													<td data-label="Actions">
														<button
															type="button"
															className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
															onClick={() => chain("revokeKeyModal")}
														>
															Revoke
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className={`${s.note} ${s.noteWarn} mt-3`}>
									<i className="bi bi-exclamation-triangle me-1" /> Warning:
									Never expose your Secret Key (sk_live_...) in client-side code
									like JavaScript or mobile apps. Use Public Keys for frontend
									tokenization only.
								</div>
							</>
						)}

						{keyStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Key Name / Description</Lbl>
									<Fld s={s} placeholder="e.g., Mobile App v2 Production" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Environment</Lbl>
									<Fld
										s={s}
										as="select"
										options={["Sandbox (Test Mode)", "Production (Live Mode)"]}
									/>
								</div>
								<div className="mb-3">
									<Lbl s={s}>Permissions</Lbl>
									<Chk
										label="Standard (Collections & Reports)"
										defaultChecked
									/>
									<Chk label="Disbursements (Requires MFA)" />
									<Chk label="Admin (Manage other keys & webhooks)" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Verify Password</Lbl>
									<Fld
										s={s}
										type="password"
										placeholder="Enter your account password"
									/>
								</div>
							</>
						)}

						{keyStep === 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-shield-check" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									Key Generated Successfully
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									Please copy your Secret Key now. It will not be shown again.
								</p>
								<div className="text-start mt-3">
									<Lbl s={s}>Public Key</Lbl>
									<CodeBox s={s} api style={{ padding: 12 }}>
										<span style={{ color: "#E2E8F0" }}>
											pk_test_48a9b2c7e1f0d3a56b8c9d0e1f2a3b4c
										</span>
									</CodeBox>
									<Lbl s={s}>
										Secret Key{" "}
										<span style={{ color: "var(--pm-danger)" }}>*</span>
									</Lbl>
									<CodeBox
										s={s}
										api
										style={{
											padding: 12,
											border: "1px solid var(--pm-danger)",
										}}
									>
										<span style={{ color: "#FCA5A5" }}>
											sk_test_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0
										</span>
									</CodeBox>
								</div>
								<div className="mt-3 text-start">
									<Chk label="I have saved my secret key securely." />
								</div>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 3. Webhook Setup ---------------- */}
			<MBox
				s={s}
				id="webhookSetupModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-broadcast"
							style={{ color: "var(--pm-info)" }}
						/>
						Webhook Endpoints
					</>
				}
				footer={m.footer("webhookSetupModal", m.closeOnly())}
			>
				{m.body(
					"webhookSetupModal",
					<>
						<m.Tabs
							k="wh"
							def="list"
							opts={[
								{ v: "list", label: "Endpoints" },
								{ v: "add", label: "Add New" },
								{ v: "verify", label: "Signature Verification" },
							]}
						/>
						{m.tab("wh", "list") === "list" &&
							data.webhookEndpoints.map((w) => (
								<div key={w.url} className={s.endpointRow}>
									<div style={{ minWidth: 0 }}>
										<strong>{w.name}</strong>
										<br />
										<code style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											{w.url}
										</code>
									</div>
									<div className="d-flex align-items-center gap-2">
										<span className={`${s.badge} ${s[w.tone]}`}>
											{w.status}
										</span>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => chain("webhookLogsModal")}
										>
											Logs
										</button>
									</div>
								</div>
							))}

						{m.tab("wh", "list") === "add" && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Endpoint URL</Lbl>
									<Fld
										s={s}
										type="url"
										mono
										placeholder="https://your-domain.com/webhook/endpoint"
									/>
								</div>
								<div className="mb-3">
									<Lbl s={s}>Events to listen for</Lbl>
									<Chk label="payment.success" defaultChecked />
									<Chk label="payment.failed" defaultChecked />
									<Chk label="disbursement.completed" />
									<Chk label="invoice.paid" />
									<Chk label="subscription.renewed" />
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnPmP}`}
									onClick={() =>
										m.doAction(
											"webhookSetupModal",
											"Webhook endpoint added successfully. PayMo will now send a ping event to verify it.",
										)
									}
								>
									Add Endpoint
								</button>
							</>
						)}

						{m.tab("wh", "list") === "verify" && (
							<>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									PayMo signs all webhook payloads using HMAC-SHA256. Verify
									this signature in the <code>X-PayMo-Signature</code> header
									using your webhook secret.
								</p>
								<Lbl s={s}>Your Webhook Secret</Lbl>
								<CodeBox s={s} api style={{ padding: 10 }}>
									whsec_88f2a1b9c8d7e6f5...
								</CodeBox>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
									onClick={() =>
										m.doAction(
											"webhookSetupModal",
											"Webhook secret rotated. Update your server immediately.",
										)
									}
								>
									Rotate Secret
								</button>
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ---------------- 4. Webhook Delivery Logs ---------------- */}
			<MBox
				s={s}
				id="webhookLogsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-list-nested" />
						Webhook Delivery Logs
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Timestamp</th>
								<th>Event</th>
								<th>URL</th>
								<th>Status</th>
								<th>Response</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{data.webhookLogs.map((w) => (
								<tr key={`${w.time}-${w.event}`}>
									<td data-label="Timestamp">{w.time}</td>
									<td data-label="Event">{w.event}</td>
									<td data-label="URL">{w.url}</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[w.tone]}`}>
											{w.status}
										</span>
									</td>
									<td data-label="Response">{w.response}</td>
									<td data-label="Actions">
										<div className="d-flex gap-1 justify-content-end justify-content-md-start flex-wrap">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => chain("logDetailModal")}
											>
												View
											</button>
											{w.retry && (
												<button
													type="button"
													className={`${s.btnPm} ${s.btnSm}`}
												>
													Retry
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 5. IP Whitelisting ---------------- */}
			<MBox
				s={s}
				id="ipWhitelistModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-check"
							style={{ color: "var(--pm-accent)" }}
						/>
						IP Whitelisting
					</>
				}
				footer={m.footer(
					"ipWhitelistModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"ipWhitelistModal",
									"IP Whitelist settings updated successfully.",
								)
							}
						>
							Save Settings
						</button>
					</>,
				)}
			>
				{m.body(
					"ipWhitelistModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							For enhanced security, restrict API key usage to specific IP
							addresses or CIDR blocks. This is highly recommended for
							production keys.
						</p>
						<Sw label="Enable IP Restrictions" defaultChecked />
						<div className="mb-3 mt-3">
							<Lbl s={s}>Add IP Address or CIDR</Lbl>
							<div className="d-flex gap-2">
								<Fld
									s={s}
									mono
									placeholder="e.g. 192.168.1.50 or 10.0.0.0/24"
								/>
								<button type="button" className={`${s.btnPm} ${s.btnPmP}`}>
									Add
								</button>
							</div>
						</div>
						<h6 style={{ fontWeight: 700 }}>Whitelisted IPs</h6>
						{data.ipWhitelist.map((r) => (
							<div
								key={r.ip}
								className={s.endpointRow}
								style={{ cursor: "default" }}
							>
								<div>
									<code>{r.ip}</code>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{r.label}
									</div>
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
									aria-label={`Remove ${r.ip}`}
								>
									<i className="bi bi-trash" />
								</button>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 6. Test Console ---------------- */}
			<MBox
				s={s}
				id="testConsoleModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-terminal"
							style={{ color: "var(--pm-purple)" }}
						/>
						API Test Console
					</>
				}
				footer={m.closeOnly()}
			>
				<TestConsoleBody />
			</MBox>

			{/* ---------------- 7. Error Codes ---------------- */}
			<MBox
				s={s}
				id="errorCodesModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bug" style={{ color: "var(--pm-danger)" }} />
						API Error Codes
					</>
				}
				footer={m.closeOnly()}
			>
				<Fld s={s} placeholder="Search error codes..." className="mb-3" />
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>HTTP</th>
								<th>Code</th>
								<th>Description</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{data.errorCodes.map((e) => (
								<tr key={e.code}>
									<td data-label="HTTP">{e.http}</td>
									<td data-label="Code">
										<code>{e.code}</code>
									</td>
									<td data-label="Description">{e.desc}</td>
									<td data-label="Action">{e.action}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 8. SDKs ---------------- */}
			<MBox
				s={s}
				id="sdkModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-box-seam"
							style={{ color: "var(--pm-primary)" }}
						/>
						Official SDKs & Libraries
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="row g-3">
					{data.sdkCards.map((k) => (
						<div className="col-md-6" key={k.name}>
							<div className={s.endpointRow} style={{ cursor: "default" }}>
								<div style={{ minWidth: 0 }}>
									<strong style={{ fontSize: 14 }}>
										<i
											className={`bi ${k.icon}`}
											style={{ color: k.iconColor }}
										/>{" "}
										{k.name}
									</strong>
									<div
										style={{
											fontSize: 11,
											color: "var(--pm-muted)",
											marginTop: 4,
											fontFamily: "var(--pm-font-mono)",
											overflowWrap: "anywhere",
										}}
									>
										{k.install}
									</div>
								</div>
								<a
									className={`${s.btnPm} ${s.btnSm}`}
									href="https://docs.paymo.com/sdks"
									target="_blank"
									rel="noreferrer noopener"
								>
									Docs
								</a>
							</div>
						</div>
					))}
				</div>
				<h6 style={{ fontWeight: 700, marginTop: 24 }}>E-Commerce Plugins</h6>
				<div className="d-flex gap-2 flex-wrap">
					{data.plugins.map((p) => (
						<span
							key={p.label}
							className={`${s.badge} ${s.badgeDark}`}
							style={{ padding: "6px 12px", fontSize: 12 }}
						>
							<i className={`bi ${p.icon}`} /> {p.label}
						</span>
					))}
				</div>
			</MBox>

			{/* ---------------- 9. Create App (multistep) ---------------- */}
			<MBox
				s={s}
				id="createAppModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-lg"
							style={{ color: "var(--pm-primary)" }}
						/>
						Create New App
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{appStep === 1 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("createAppModal", 2)}
							>
								Next <i className="bi bi-arrow-right" />
							</button>
						)}
						{appStep === 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("createAppModal", 3)}
							>
								Create App
							</button>
						)}
						{appStep >= 3 && (
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
				{m.busy === "createAppModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Details", "Settings", "Done"]}
							current={appStep}
						/>
						{appStep === 1 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>App Name</Lbl>
									<Fld s={s} placeholder="e.g. NextGen Payroll System" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Description</Lbl>
									<Fld
										s={s}
										as="textarea"
										rows={2}
										placeholder="What does this app do?"
									/>
								</div>
								<div className="mb-3">
									<Lbl s={s}>Category</Lbl>
									<Fld
										s={s}
										as="select"
										options={[
											"E-Commerce",
											"Payroll",
											"SaaS Billing",
											"Internal Tools",
										]}
									/>
								</div>
							</>
						)}
						{appStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Required Scopes</Lbl>
									<Chk label="Collections (Read/Write)" defaultChecked />
									<Chk label="Disbursements (Write)" />
									<Chk label="KYC Verification (Read)" defaultChecked />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Default Webhook URL</Lbl>
									<Fld s={s} type="url" mono placeholder="https://..." />
								</div>
							</>
						)}
						{appStep >= 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									App Created!
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									Your app workspace and sandbox API keys have been generated.
								</p>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => chain("apiKeysModal")}
								>
									View API Keys
								</button>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 10. Log Detail ---------------- */}
			<MBox
				s={s}
				id="logDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-code" />
						Log Inspector
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("testConsoleModal")}
						>
							<i className="bi bi-arrow-clockwise" /> Replay in Console
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className="row mb-3 g-2">
					<div className="col-sm-4">
						<span style={{ color: "var(--pm-muted)", fontSize: 11 }}>
							Request ID
						</span>
						<br />
						<strong>req_88f2a1b9c8</strong>
					</div>
					<div className="col-sm-4">
						<span style={{ color: "var(--pm-muted)", fontSize: 11 }}>Date</span>
						<br />
						<strong>27 Jun 2025, 14:32:01 EAT</strong>
					</div>
					<div className="col-sm-4">
						<span style={{ color: "var(--pm-muted)", fontSize: 11 }}>
							Status
						</span>
						<br />
						<span className={`${s.badge} ${s.badgeS}`}>200 OK</span>
					</div>
				</div>
				<h6 style={{ fontWeight: 700 }}>Request Payload</h6>
				<CodeBox s={s} api>
					{`POST /v1/collections/stk-push HTTP/1.1
Host: api.paymo.co.ke
Content-Type: application/json

{
  "amount": 500,
  "phone_number": "254712345678",
  "reference": "INV-2025-001"
}`}
				</CodeBox>
				<h6 style={{ fontWeight: 700 }}>Response Payload</h6>
				<CodeBox s={s} api>
					{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": {
    "transaction_id": "txn_672b1a9e"
  }
}`}
				</CodeBox>
			</MBox>

			{/* ---------------- 11. API Logs ---------------- */}
			<MBox
				s={s}
				id="apiLogsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-list-task" />
						API Request Logs
					</>
				}
				footer={m.footer(
					"apiLogsModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("apiLogsModal", "Logs exported to CSV successfully!")
							}
						>
							Export Logs
						</button>
					</>,
				)}
			>
				{m.body(
					"apiLogsModal",
					<>
						<div className="d-flex gap-2 mb-3 flex-wrap">
							<Fld
								s={s}
								as="select"
								options={["All Methods", "POST", "GET"]}
								style={{ width: 150 }}
							/>
							<Fld
								s={s}
								as="select"
								options={["All Status", "200 OK", "400 Bad Req", "500 Error"]}
								style={{ width: 150 }}
							/>
							<Fld
								s={s}
								placeholder="Search by Req ID, path, or reference..."
							/>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Time</th>
										<th>Method</th>
										<th>Path</th>
										<th>Status</th>
										<th>Latency</th>
										<th>IP</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{data.apiLogs.map((l) => (
										<tr key={`${l.time}-${l.path}`}>
											<td data-label="Time">{l.time}</td>
											<td data-label="Method">{l.method}</td>
											<td data-label="Path">
												<code>{l.path}</code>
											</td>
											<td data-label="Status">
												<span className={`${s.badge} ${s[l.tone]}`}>
													{l.status}
												</span>
											</td>
											<td data-label="Latency">{l.latency}</td>
											<td data-label="IP">{l.ip}</td>
											<td data-label="Action">
												<button
													type="button"
													className={`${s.btnPm} ${s.btnSm}`}
													onClick={() => chain("logDetailModal")}
												>
													Inspect
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 12. Support Ticket ---------------- */}
			<MBox
				s={s}
				id="supportTicketModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-ticket-detailed" />
						Open Support Ticket
					</>
				}
				footer={m.footer(
					"supportTicketModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"supportTicketModal",
									"Ticket #SUP-4921 submitted. Our Developer Success team will reply shortly.",
									"SUP-4921",
								)
							}
						>
							Submit Ticket
						</button>,
					),
				)}
			>
				{m.body(
					"supportTicketModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Issue Category</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Integration Help (Code/SDK)",
									"API Errors (5xx, 4xx)",
									"Webhook Delivery",
									"Rate Limits / Quotas",
									"Authentication / Keys",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Subject</Lbl>
							<Fld s={s} placeholder="Brief summary of the issue" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Request ID (Optional)</Lbl>
							<Fld s={s} mono placeholder="e.g. req_88f2a1b9c8" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Description</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={4}
								placeholder="Include endpoints called, exact error messages, and steps to reproduce."
							/>
						</div>
						<div className={`${s.note} ${s.noteInfo}`}>
							Premium support SLA guarantees a response within 4 hours.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 13. Env Toggle ---------------- */}
			<MBox
				s={s}
				id="envToggleModal"
				active={active}
				size="sm"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-toggle-on"
							style={{ color: "var(--pm-accent)" }}
						/>
						Environment Toggle
					</>
				}
				footer={m.footer("envToggleModal", m.closeOnly())}
			>
				{m.body(
					"envToggleModal",
					<div className="text-center">
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Switching environment updates the dashboard data, active API keys,
							and endpoint references.
						</p>
						<div className="d-flex justify-content-center gap-3 mt-4 mb-2 flex-wrap">
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmA}`}
								onClick={() =>
									m.doAction("envToggleModal", "Environment set to Sandbox.")
								}
							>
								<i className="bi bi-bug" /> Sandbox
							</button>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnOutline}`}
								onClick={() =>
									m.doAction(
										"envToggleModal",
										"Production requires go-live approval. Request submitted.",
									)
								}
							>
								<i className="bi bi-rocket" /> Production
							</button>
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 14. Postman ---------------- */}
			<MBox
				s={s}
				id="postmanModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-box-arrow-in-down"
							style={{ color: "var(--pm-primary)" }}
						/>
						Postman Collection
					</>
				}
				footer={m.footer("postmanModal", m.closeOnly())}
			>
				{m.body(
					"postmanModal",
					<div className="text-center">
						<div
							className={`${s.iconCircle} mx-auto mb-3`}
							style={{
								width: 64,
								height: 64,
								background: "var(--pm-surface-2)",
								color: "#FF6C37",
								fontSize: 32,
							}}
						>
							<i className="bi bi-p-square" />
						</div>
						<h6 style={{ fontWeight: 700 }}>
							Download the Official Postman Collection
						</h6>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Includes pre-configured requests, authentication helpers, and
							environment variables for Sandbox and Production.
						</p>
						<div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() =>
									m.doAction(
										"postmanModal",
										"Postman Collection JSON downloaded successfully!",
									)
								}
							>
								<i className="bi bi-download" /> Download JSON
							</button>
							<a
								className={`${s.btnPm} ${s.btnOutline}`}
								href="https://www.postman.com/paymo"
								target="_blank"
								rel="noreferrer noopener"
							>
								<i className="bi bi-cloud-arrow-down" /> Run in Postman Web
							</a>
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 15. Analytics Export ---------------- */}
			<MBox
				s={s}
				id="analyticsExportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download" />
						Export API Data
					</>
				}
				footer={m.footer(
					"analyticsExportModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"analyticsExportModal",
									"Data export started. You will receive an email when it is ready.",
								)
							}
						>
							Generate Export
						</button>,
					),
				)}
			>
				{m.body(
					"analyticsExportModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Data Set</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Transaction History (Collections & Payouts)",
									"API Request Logs",
									"Webhook Delivery Logs",
									"Settlement & Reconciliation",
								]}
							/>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-6">
								<Lbl s={s}>From</Lbl>
								<Fld s={s} type="date" defaultValue="2025-06-01" />
							</div>
							<div className="col-6">
								<Lbl s={s}>To</Lbl>
								<Fld s={s} type="date" defaultValue="2025-06-27" />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Format</Lbl>
							<Fld s={s} as="select" options={["CSV", "JSON", "Excel"]} />
						</div>
						<Chk label="Include metadata & request bodies" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 16. KYC Simulator ---------------- */}
			<MBox
				s={s}
				id="kycSimModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-magic" style={{ color: "var(--pm-purple)" }} />
						KYC Verification Simulator
					</>
				}
				footer={m.closeOnly()}
			>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					Test identity verification flows in the sandbox environment using
					these magic values.
				</p>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Magic ID Number</th>
								<th>Simulated Result</th>
							</tr>
						</thead>
						<tbody>
							{data.kycMagic.map((k) => (
								<tr key={k.id}>
									<td data-label="Magic ID">
										<code>{k.id}</code>
									</td>
									<td data-label="Result">
										<strong style={{ color: k.tone }}>{k.result}</strong>{" "}
										{k.note}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<button
					type="button"
					className={`${s.btnPm} ${s.btnSm} w-100 mt-3`}
					onClick={() => chain("testConsoleModal")}
				>
					Try in API Console
				</button>
			</MBox>

			{/* ---------------- 17. Auth Guide ---------------- */}
			<MBox
				s={s}
				id="authGuideModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-lock"
							style={{ color: "var(--pm-primary)" }}
						/>
						Authentication Guide
					</>
				}
				footer={
					<button
						type="button"
						className={`${s.btnPm} ${s.btnPmP}`}
						onClick={onClose}
					>
						Got it
					</button>
				}
			>
				<h6 style={{ fontWeight: 700 }}>Bearer Token (OAuth 2.0 / API Keys)</h6>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					Most Server-to-Server requests require a Secret Key passed as a Bearer
					token in the Authorization header.
				</p>
				<CodeBox s={s} api>
					Authorization: Bearer sk_live_your_secret_key_here
				</CodeBox>
				<h6 style={{ fontWeight: 700 }}>Idempotency</h6>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					To prevent double-charging in case of network timeouts, pass a unique
					UUIDv4 in the <code>X-Idempotency-Key</code> header on all POST
					requests.
				</p>
				<CodeBox s={s} api>
					X-Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479
				</CodeBox>
				<h6 style={{ fontWeight: 700 }}>Client-Side Auth</h6>
				<p
					style={{ fontSize: 13, color: "var(--pm-ink-soft)", marginBottom: 0 }}
				>
					For mobile apps or single-page apps (SPAs) collecting card details,
					use your Public Key. The Public Key can only tokenize cards, it cannot
					charge them or disburse funds.
				</p>
			</MBox>

			{/* ---------------- 18. Revoke Key ---------------- */}
			<MBox
				s={s}
				id="revokeKeyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-triangle"
							style={{ color: "var(--pm-danger)" }}
						/>
						Revoke API Key
					</>
				}
				footer={m.footer(
					"revokeKeyModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={() =>
								m.doAction("revokeKeyModal", "API Key successfully revoked.")
							}
						>
							Revoke Key
						</button>,
					),
				)}
			>
				{m.body(
					"revokeKeyModal",
					<>
						<div className={`${s.note} ${s.noteDanger} text-center mb-3`}>
							<i className="bi bi-shield-x" style={{ fontSize: 32 }} />
							<br />
							<strong>Warning: This action cannot be undone.</strong>
						</div>
						<p style={{ fontSize: 13 }}>
							Revoking this API key will immediately break any integrations
							currently using it. Any in-flight requests will be rejected with a{" "}
							<code>401 Unauthorized</code> error.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Type "REVOKE" to confirm</Lbl>
							<Fld s={s} placeholder="REVOKE" mono />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 19. Architecture Review ---------------- */}
			<MBox
				s={s}
				id="archReviewModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-diagram-3"
							style={{ color: "var(--pm-primary)" }}
						/>
						Request Architecture Review
					</>
				}
				footer={m.footer(
					"archReviewModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"archReviewModal",
									"Review request sent! An architect will email you within 48 hours to schedule a call.",
								)
							}
						>
							Submit Request
						</button>,
					),
				)}
			>
				{m.body(
					"archReviewModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							For high-volume or complex financial flows, our Solutions
							Architects can review your design for security, scalability, and
							idempotency best practices.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Project Type</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Lending & Credit App",
									"E-Commerce Marketplace",
									"Payroll / HR System",
									"ERP Integration",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Estimated Monthly Volume</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"< 10,000 txns",
									"10,000 - 100,000 txns",
									"100k - 1M txns",
									"> 1M txns",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Link to Architecture Diagram (Optional)</Lbl>
							<Fld
								s={s}
								type="url"
								placeholder="https://figma.com/... , https://miro.com/..."
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 20. Slack Community ---------------- */}
			<MBox
				s={s}
				id="slackCommunityModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-slack" style={{ color: "var(--pm-primary)" }} />
						PayMo Developer Community
					</>
				}
				footer={m.footer(
					"slackCommunityModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"slackCommunityModal",
									"Invitation sent! Check your inbox to join the workspace.",
								)
							}
						>
							Send Invitation
						</button>,
					),
				)}
			>
				{m.body(
					"slackCommunityModal",
					<div className="text-center">
						<div
							className={`${s.iconCircle} mx-auto mb-3`}
							style={{
								width: 64,
								height: 64,
								background: "var(--pm-info-soft)",
								color: "var(--pm-info)",
								fontSize: 32,
							}}
						>
							<i className="bi bi-people" />
						</div>
						<h6 style={{ fontWeight: 700 }}>Join 5,000+ African Developers</h6>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Connect directly with PayMo engineers, get early access to beta
							APIs, and share integration patterns with other developers.
						</p>
						<div className="p-3 border rounded text-start mt-3 mb-3">
							{data.slackChannels.map((ch) => (
								<div key={ch} className="d-flex align-items-center gap-2 mb-2">
									<i
										className="bi bi-hash"
										style={{ color: "var(--pm-muted)" }}
									/>{" "}
									<strong>{ch}</strong>
								</div>
							))}
						</div>
						<div className="mb-3 text-start">
							<Lbl s={s}>Email to invite</Lbl>
							<Fld s={s} type="email" defaultValue="james.kamau@email.com" />
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 21. Profile ---------------- */}
			<MBox
				s={s}
				id="profileModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-circle" />
						Developer Profile
					</>
				}
				footer={
					<button
						type="button"
						className={`${s.btnPm} ${s.btnOutline} ${s.btnSm} w-100`}
						style={{
							color: "var(--pm-danger)",
							borderColor: "var(--pm-danger)",
						}}
						onClick={onClose}
					>
						Logout
					</button>
				}
			>
				<div className="text-center">
					<div
						className={`${s.iconCircle} mx-auto mb-3`}
						style={{
							width: 64,
							height: 64,
							fontSize: 24,
							background: "var(--pm-gradient-hero)",
							color: "#fff",
						}}
					>
						{data.header.user.initials}
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>
						{data.header.user.name}
					</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						{data.header.user.role} · {data.header.user.email}
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Role</span>
								<br />
								<strong>Admin</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>MFA Status</span>
								<br />
								<strong style={{ color: "var(--pm-accent)" }}>Enabled</strong>
							</div>
						</div>
						<div className="col-12">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Active Keys</span>
								<br />
								<strong>2 Production, 1 Sandbox</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ---------------- 22. System Health ---------------- */}
			<MBox
				s={s}
				id="healthStatusModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-activity"
							style={{ color: "var(--pm-accent)" }}
						/>
						PayMo System Status
					</>
				}
				footer={
					<>
						<a
							className={`${s.btnPm} ${s.btnSm}`}
							href="https://status.paymo.com"
							target="_blank"
							rel="noreferrer noopener"
						>
							View full status page
						</a>
						{m.closeOnly()}
					</>
				}
			>
				<div className={`${s.note} ${s.noteSuccess} text-center mb-4`}>
					<i className="bi bi-check-circle-fill" style={{ fontSize: 32 }} />
					<br />
					<strong style={{ fontSize: 16 }}>All Systems Operational</strong>
				</div>
				{data.systemStatus.map((g) => (
					<div key={g.group}>
						<h6 style={{ fontWeight: 700, marginTop: 20 }}>{g.group}</h6>
						{g.rows.map((r) => (
							<div key={r.name} className={s.statusRow}>
								<div>{r.name}</div>
								<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
							</div>
						))}
					</div>
				))}
			</MBox>

			{/* ---------------- 23. Notifications ---------------- */}
			<MBox
				s={s}
				id="notificationsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" />
						Developer Notifications
					</>
				}
				footer={
					<button
						type="button"
						className={`${s.btnPm} w-100`}
						onClick={onClose}
					>
						Mark all as read
					</button>
				}
			>
				<div style={{ maxHeight: 400, overflowY: "auto" }}>
					{data.notifications.map((n) => (
						<div
							key={n.title}
							className="p-3 rounded mb-2"
							style={{ background: n.bg, fontSize: 13 }}
						>
							<strong>{n.title}</strong>
							<div style={{ fontSize: 11, color: n.color, marginTop: 4 }}>
								{n.text}
							</div>
						</div>
					))}
				</div>
			</MBox>
		</>
	);
}
