/* ============================================================================
 * 4.1 Developer Dashboard — all 21 modals.
 * ----------------------------------------------------------------------------
 * One component per legacy `<div class="modal fade resettable" id="...">`.
 * Behaviour parity with the vanilla original:
 *   processDevAction(id,msg) -> m.doAction(id,msg)  (1.2s spinner -> receipt)
 *   switchTab(prefix,key,el) -> m.Tabs / m.tab
 *   openModal('x')           -> onOpen('x')   (chained modals still work)
 *   data-bs-dismiss="modal"  -> onClose
 * Content comes from the injected `data` object, never from inline literals.
 * ========================================================================== */

import {
	Chk,
	CodeBox,
	Fld,
	Lbl,
	MBox,
	Sw,
	useModals,
} from "../../_shared/devModalKit";
import type { DeveloperDashboardContent } from "../data/developerDashboardData";
import styles from "../styles/developerDashboard.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: DeveloperDashboardContent;
}

export default function DeveloperDashboardModals({
	active,
	onClose,
	onOpen,
	data,
}: Props) {
	const m = useModals(s, active, onClose);

	/** Close the current modal and open another (legacy chained onclick). */
	const chain = (id: string) => {
		onClose();
		window.setTimeout(() => onOpen(id), 60);
	};

	return (
		<>
			{/* ---------------- 1. Generate New API Key ---------------- */}
			<MBox
				s={s}
				id="generateKeyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" style={{ color: "var(--pm-primary)" }} />
						Generate API Key
					</>
				}
				footer={m.footer(
					"generateKeyModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"generateKeyModal",
									"API Key Generated. Secret: sk_test_new_a1b2c3... (Store this safely!)",
								)
							}
						>
							Generate Key
						</button>,
					),
				)}
			>
				{m.body(
					"generateKeyModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Key Name / Description</Lbl>
							<Fld s={s} placeholder="e.g. Mobile App Prod Key" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Environment</Lbl>
							<select className={s.formControl} defaultValue="Test">
								<option>Test</option>
								<option disabled>Live (Requires Go-Live approval)</option>
							</select>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Expiration (Optional)</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Never", "30 Days", "90 Days", "1 Year"]}
							/>
						</div>
						<div className={`${s.note} ${s.noteWarn}`}>
							<i className="bi bi-shield-lock me-1" /> Once generated, the
							secret key will only be shown once. Be prepared to copy it to a
							secure vault.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 2. Roll API Key ---------------- */}
			<MBox
				s={s}
				id="rollKeyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-repeat"
							style={{ color: "var(--pm-warning)" }}
						/>
						Roll API Key
					</>
				}
				footer={m.footer(
					"rollKeyModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmW}`}
							onClick={() =>
								m.doAction(
									"rollKeyModal",
									"Key rolled successfully. Old key expires in 12 hours.",
								)
							}
						>
							Roll Key Now
						</button>,
					),
				)}
			>
				{m.body(
					"rollKeyModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Rolling an API key generates a new secret key and schedules the
							old one for deletion. This is useful if a key is compromised.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Key to Roll</Lbl>
							<Fld
								s={s}
								defaultValue="Test Secret Key (sk_test_8f92...)"
								disabled
								mono
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Old Key Expiration</Lbl>
							<select className={s.formControl} defaultValue="In 12 hours">
								<option>Immediately (Dangerous)</option>
								<option>In 12 hours</option>
								<option>In 24 hours</option>
								<option>In 7 days</option>
							</select>
						</div>
						<Chk label="I understand that API requests using the old key will fail after expiration." />
					</>,
				)}
			</MBox>

			{/* ---------------- 3. Create New Project ---------------- */}
			<MBox
				s={s}
				id="createProjectModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-folder-plus"
							style={{ color: "var(--pm-primary)" }}
						/>
						Create New Project
					</>
				}
				footer={m.footer(
					"createProjectModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"createProjectModal",
									"Project created successfully. Switch to new project?",
								)
							}
						>
							Create Project
						</button>,
					),
				)}
			>
				{m.body(
					"createProjectModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Project Name</Lbl>
							<Fld s={s} placeholder="e.g. E-Commerce Website" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Primary Currency</Lbl>
							<Fld
								s={s}
								as="select"
								options={["KES - Kenyan Shilling", "USD - US Dollar"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Associated Business Entity</Lbl>
							<Fld
								s={s}
								as="select"
								options={["JengaPay Limited", "Create new business profile..."]}
							/>
						</div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)", margin: 0 }}>
							Projects allow you to isolate API keys, webhooks, and analytics
							for different applications within the same business.
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 4. Invite Team Member ---------------- */}
			<MBox
				s={s}
				id="projectTeamModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-person-plus"
							style={{ color: "var(--pm-info)" }}
						/>
						Invite Team Member
					</>
				}
				footer={m.footer(
					"projectTeamModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"projectTeamModal",
									"Invitation sent to developer@example.com",
								)
							}
						>
							Send Invite
						</button>,
					),
				)}
			>
				{m.body(
					"projectTeamModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Email Address</Lbl>
							<Fld s={s} type="email" placeholder="developer@example.com" />
						</div>
						<Lbl s={s}>Project Role</Lbl>
						{[
							{
								v: "Developer",
								d: "Can view test data, manage test API keys, and view logs.",
							},
							{
								v: "Admin",
								d: "Can manage live keys, team members, and settings.",
							},
							{ v: "Support", d: "Can view logs and transaction data only." },
						].map((r) => (
							<m.PickBox key={r.v} k="inviteRole" v={r.v}>
								<strong>{r.v}</strong>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
									{r.d}
								</div>
							</m.PickBox>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 5. Member Access Controls ---------------- */}
			<MBox
				s={s}
				id="memberAccessModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-lock"
							style={{ color: "var(--pm-purple)" }}
						/>
						Edit Member Access
					</>
				}
				footer={m.footer(
					"memberAccessModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"memberAccessModal",
									"Member access updated successfully",
								)
							}
						>
							Save Changes
						</button>,
					),
				)}
			>
				{m.body(
					"memberAccessModal",
					<>
						<div className="d-flex align-items-center gap-3 mb-4">
							<div
								className={s.iconCircle}
								style={{ background: "var(--pm-gradient-blue)", color: "#fff" }}
							>
								SO
							</div>
							<div>
								<strong>Sarah O.</strong>
								<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
									sarah@jenga.com
								</div>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Change Role</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Developer", "Admin", "Support"]}
							/>
						</div>
						<Sw
							label="Require Multi-Factor Authentication (MFA)"
							defaultChecked
						/>
						<Sw label="Account Active" defaultChecked />
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm} ${s.btnPmD} w-100 mt-2`}
							onClick={() =>
								m.doAction(
									"memberAccessModal",
									"Member removed from the project.",
								)
							}
						>
							Remove Member from Project
						</button>
					</>,
				)}
			</MBox>

			{/* ---------------- 6. Webhook Delivery Logs ---------------- */}
			<MBox
				s={s}
				id="webhookLogsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-broadcast"
							style={{ color: "var(--pm-info)" }}
						/>
						Webhook Delivery Logs
					</>
				}
				footer={m.closeOnly()}
			>
				<div
					className="d-flex justify-content-between mb-3 flex-wrap"
					style={{ gap: 8 }}
				>
					<Fld
						s={s}
						as="select"
						options={["All Endpoints", "https://api.jenga.com/hooks"]}
						style={{ width: "auto" }}
					/>
					<Fld
						s={s}
						as="select"
						options={["All Statuses", "Success (2xx)", "Failed (4xx/5xx)"]}
						style={{ width: "auto" }}
					/>
					<button
						type="button"
						className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
						onClick={() => chain("addWebhookModal")}
					>
						Add Endpoint
					</button>
				</div>
				<div
					className={s.tableWrap}
					style={{ maxHeight: 400, overflowY: "auto" }}
				>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Event ID</th>
								<th>Event Type</th>
								<th>Endpoint</th>
								<th>Status</th>
								<th>Timestamp</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{data.webhookLogs.map((w) => (
								<tr key={w.eventId}>
									<td data-label="Event ID">
										<code>{w.eventId}</code>
									</td>
									<td data-label="Event Type">
										<code>{w.type}</code>
									</td>
									<td data-label="Endpoint">
										<code>{w.endpoint}</code>
									</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[w.tone]}`}>
											{w.status}
										</span>
									</td>
									<td data-label="Timestamp">{w.time}</td>
									<td data-label="Action">
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											onClick={() => chain(w.modal)}
										>
											{w.actionLabel}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 7. Add Webhook Endpoint ---------------- */}
			<MBox
				s={s}
				id="addWebhookModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-circle"
							style={{ color: "var(--pm-info)" }}
						/>
						Add Webhook Endpoint
					</>
				}
				footer={m.footer(
					"addWebhookModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"addWebhookModal",
									"Webhook endpoint created. Secret: whsec_test_a1b2...",
								)
							}
						>
							Add Endpoint
						</button>,
					),
				)}
			>
				{m.body(
					"addWebhookModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Endpoint URL</Lbl>
							<Fld
								s={s}
								type="url"
								placeholder="https://your-domain.com/webhooks"
								mono
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Events to Subscribe</Lbl>
							<Chk label="charge.success" defaultChecked />
							<Chk label="charge.failed" defaultChecked />
							<Chk label="transfer.success" />
							<Chk label="customer.created" />
							<Chk label="invoice.paid" />
						</div>
						<div className={`${s.note} ${s.noteMuted}`}>
							PayMo requires HTTPS endpoints. A webhook signing secret will be
							generated upon creation to verify event payloads.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 8. Test Webhook Delivery ---------------- */}
			<MBox
				s={s}
				id="testWebhookModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-lightning-charge"
							style={{ color: "var(--pm-accent)" }}
						/>
						Test Webhook Delivery
					</>
				}
				footer={m.footer("testWebhookModal", m.closeOnly())}
			>
				{m.body(
					"testWebhookModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Endpoint</Lbl>
							<Fld
								s={s}
								as="select"
								options={["https://api.jenga.com/hooks"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Event Type to Simulate</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"charge.success",
									"charge.failed",
									"transfer.success",
								]}
							/>
						</div>
						<CodeBox s={s} copy={false} style={{ marginBottom: 16 }}>
							{`{
  "id": "evt_test_123",
  "type": "charge.success",
  "data": {
    "object": {
      "id": "ch_test_abc",
      "amount": 5000,
      "currency": "KES",
      "status": "successful"
    }
  }
}`}
						</CodeBox>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm} ${s.btnPmA} w-100`}
							onClick={() =>
								m.doAction(
									"testWebhookModal",
									"Test event sent. Received 200 OK response.",
								)
							}
						>
							Send Test Event
						</button>
					</>,
				)}
			</MBox>

			{/* ---------------- 9. API Request Logs ---------------- */}
			<MBox
				s={s}
				id="apiLogsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-terminal"
							style={{ color: "var(--pm-purple)" }}
						/>
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
								m.doAction("apiLogsModal", "Logs exported to CSV.")
							}
						>
							<i className="bi bi-download" /> Export Logs
						</button>
					</>,
				)}
			>
				{m.body(
					"apiLogsModal",
					<>
						<div
							className="d-flex justify-content-between mb-3 flex-wrap"
							style={{ gap: 8 }}
						>
							<div className="d-flex gap-2 flex-wrap">
								<Fld
									s={s}
									as="select"
									options={["All Requests", "POST /charges", "GET /balance"]}
									style={{ width: "auto" }}
								/>
								<Fld
									s={s}
									as="select"
									options={[
										"All Statuses",
										"200 OK",
										"400 Bad Request",
										"401 Unauthorized",
									]}
									style={{ width: "auto" }}
								/>
							</div>
							<Fld s={s} placeholder="Search Request ID (req_...)" mono />
						</div>
						<div
							className={s.tableWrap}
							style={{ maxHeight: 400, overflowY: "auto" }}
						>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Method</th>
										<th>Endpoint</th>
										<th>Status</th>
										<th>Timestamp</th>
										<th>IP Address</th>
										<th>Source</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{data.apiLogs.map((l) => (
										<tr key={`${l.method}-${l.endpoint}-${l.time}`}>
											<td data-label="Method">
												<span className={`${s.badge} ${s[l.methodTone]}`}>
													{l.method}
												</span>
											</td>
											<td data-label="Endpoint">
												<code>{l.endpoint}</code>
											</td>
											<td data-label="Status">
												<span className={`${s.badge} ${s[l.statusTone]}`}>
													{l.status}
												</span>
											</td>
											<td data-label="Timestamp">{l.time}</td>
											<td data-label="IP Address">{l.ip}</td>
											<td data-label="Source">{l.source}</td>
											<td data-label="Action">
												<button
													type="button"
													className={`${s.btnPm} ${s.btnSm}`}
													onClick={() => chain("requestDetailModal")}
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

			{/* ---------------- 10. API Request Detail ---------------- */}
			<MBox
				s={s}
				id="requestDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-search" />
						Request Details: req_8f7b...
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="row mb-3" style={{ fontSize: 13 }}>
					<div className="col-sm-6 mb-2">
						<span style={{ color: "var(--pm-muted)" }}>Status:</span>{" "}
						<span className={`${s.badge} ${s.badgeD}`}>400 Bad Request</span>
					</div>
					<div className="col-sm-6 mb-2">
						<span style={{ color: "var(--pm-muted)" }}>Time:</span> 10:38:22 AM
						EAT
					</div>
					<div className="col-sm-6 mb-2">
						<span style={{ color: "var(--pm-muted)" }}>Method:</span> POST
						/v1/disbursements
					</div>
					<div className="col-sm-6 mb-2">
						<span style={{ color: "var(--pm-muted)" }}>IP:</span> 192.168.1.102
					</div>
					<div className="col-sm-6">
						<span style={{ color: "var(--pm-muted)" }}>API Version:</span>{" "}
						v2025-01-01
					</div>
					<div className="col-sm-6">
						<span style={{ color: "var(--pm-muted)" }}>Source:</span>{" "}
						paymo-python/2.1.0
					</div>
				</div>
				<m.Tabs
					k="reqDetail"
					def="payload"
					opts={[
						{ v: "payload", label: "Request Payload" },
						{ v: "response", label: "Response Body" },
					]}
				/>
				{m.tab("reqDetail", "payload") === "payload" ? (
					<CodeBox s={s} copy={false} height={250}>
						{`{
  "amount": 50000,
  "currency": "KES",
  "destination": {
    "type": "bank_account",
    "account_number": "12345678"
    // Missing required field: bank_code
  },
  "description": "Supplier Payment"
}`}
					</CodeBox>
				) : (
					<CodeBox s={s} copy={false} height={250} style={{ color: "#fca5a5" }}>
						{`{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_missing",
    "message": "The parameter 'destination.bank_code' is required for bank_account transfers.",
    "param": "destination.bank_code"
  }
}`}
					</CodeBox>
				)}
			</MBox>

			{/* ---------------- 11. Rate Limits ---------------- */}
			<MBox
				s={s}
				id="rateLimitModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-speedometer2"
							style={{ color: "var(--pm-danger)" }}
						/>
						Rate Limits & Throttling
					</>
				}
				footer={m.footer(
					"rateLimitModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("rateLimitModal", "Rate limit alert settings saved.")
							}
						>
							Save Settings
						</button>,
					),
				)}
			>
				{m.body(
					"rateLimitModal",
					<>
						<div className={`${s.note} ${s.noteMuted} mb-3`}>
							<div className="d-flex justify-content-between mb-1">
								<span>Current Tier</span>
								<strong>{data.rateLimits.tier}</strong>
							</div>
							<div className="d-flex justify-content-between mb-1">
								<span>Read Limit</span>
								<strong>{data.rateLimits.read}</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span>Write Limit</span>
								<strong>{data.rateLimits.write}</strong>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Alert me when requests reach:</Lbl>
							<Fld
								s={s}
								as="select"
								options={["75% of limit", "90% of limit", "100% (Throttled)"]}
							/>
						</div>
						<Chk
							defaultChecked
							label="Automatically retry requests handling HTTP 429 using exponential backoff in SDKs"
						/>
					</>,
				)}
			</MBox>

			{/* ---------------- 12. IP Whitelisting ---------------- */}
			<MBox
				s={s}
				id="whitelistIpModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-lock"
							style={{ color: "var(--pm-accent)" }}
						/>
						IP Whitelisting
					</>
				}
				footer={m.footer(
					"whitelistIpModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"whitelistIpModal",
									"IP Whitelist updated. Allow up to 5 mins for propagation.",
								)
							}
						>
							Save Restrictions
						</button>
					</>,
				)}
			>
				{m.body(
					"whitelistIpModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							For enhanced security, restrict API requests using your Live
							Secret Key to specific IP addresses or CIDR blocks.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Add IP or CIDR</Lbl>
							<div className="d-flex gap-2">
								<Fld s={s} placeholder="e.g. 192.168.1.1/24" mono />
								<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
									Add
								</button>
							</div>
						</div>
						<Lbl s={s}>Whitelisted IPs</Lbl>
						{data.whitelist.map((ip) => (
							<div
								key={ip}
								className="p-2 border rounded mb-1 d-flex justify-content-between align-items-center"
							>
								<code>{ip}</code>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									style={{ padding: "2px 8px", color: "var(--pm-danger)" }}
									aria-label={`Remove ${ip}`}
								>
									<i className="bi bi-x" />
								</button>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 13. API Version Upgrade ---------------- */}
			<MBox
				s={s}
				id="apiVersionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-box-arrow-up-right"
							style={{ color: "var(--pm-info)" }}
						/>
						API Version Upgrade
					</>
				}
				footer={m.footer(
					"apiVersionModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"apiVersionModal",
									`API Version upgraded to ${data.versionInfo.latest}!`,
								)
							}
						>
							Upgrade Version
						</button>,
					),
				)}
			>
				{m.body(
					"apiVersionModal",
					<>
						<div className={`${s.note} ${s.noteMuted} mb-3`}>
							<div className="d-flex justify-content-between mb-1">
								<span>Current Version</span>
								<strong>{data.versionInfo.current}</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span>Latest Version</span>
								<strong style={{ color: "var(--pm-primary)" }}>
									{data.versionInfo.latest}
								</strong>
							</div>
						</div>
						<h6 style={{ fontWeight: 700 }}>
							What's new in {data.versionInfo.latest}:
						</h6>
						<ul
							style={{
								fontSize: 12,
								color: "var(--pm-ink-soft)",
								paddingLeft: 16,
							}}
						>
							{data.versionInfo.changes.map((c) => (
								<li key={c}>{c}</li>
							))}
						</ul>
						<Chk
							tone="var(--pm-danger)"
							label="I have updated my code to handle breaking changes."
						/>
					</>,
				)}
			</MBox>

			{/* ---------------- 14. Developer Alerts ---------------- */}
			<MBox
				s={s}
				id="apiAlertsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" style={{ color: "var(--pm-warning)" }} />
						Developer Alerts
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
				<div style={{ maxHeight: 450, overflowY: "auto" }}>
					{data.alerts.map((a) => (
						<div
							key={a.title}
							className="p-3 rounded mb-2"
							style={{
								background: a.bg,
								fontSize: 13,
								border:
									a.bg === "var(--pm-surface-2)"
										? "1px solid var(--pm-border)"
										: undefined,
							}}
						>
							<i
								className={`bi ${a.icon} me-1`}
								style={{ color: a.iconColor }}
							/>{" "}
							<strong>{a.title}</strong> — {a.text}{" "}
							{a.linkLabel && a.linkModal && (
								<button
									type="button"
									className={s.btnLinkInline}
									style={{
										border: "none",
										background: "none",
										color: "var(--pm-primary)",
										padding: 0,
										textDecoration: "underline",
										cursor: "pointer",
										fontSize: 13,
									}}
									onClick={() => chain(a.linkModal as string)}
								>
									{a.linkLabel}
								</button>
							)}
							<div
								style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}
							>
								{a.age}
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ---------------- 15. SDK Download ---------------- */}
			<MBox
				s={s}
				id="sdkDownloadModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-download"
							style={{ color: "var(--pm-primary)" }}
						/>
						Download SDKs & Plugins
					</>
				}
				footer={m.closeOnly()}
			>
				<m.Tabs
					k="sdkTab"
					def="backend"
					opts={[
						{ v: "backend", label: "Backend" },
						{ v: "mobile", label: "Mobile" },
						{ v: "plugins", label: "Plugins" },
					]}
				/>
				{data.sdks
					.filter((k) => k.group === m.tab("sdkTab", "backend"))
					.map((k) => (
						<div
							key={k.name}
							className="d-flex justify-content-between align-items-center p-2 border-bottom gap-2"
						>
							<div style={{ minWidth: 0 }}>
								<strong>{k.name}</strong>
								<div
									style={{
										fontSize: 11,
										color: "var(--pm-muted)",
										fontFamily: "var(--pm-font-mono)",
										overflowWrap: "anywhere",
									}}
								>
									{k.sub}
								</div>
							</div>
							<button
								type="button"
								className={`${s.btnPm} ${s.btnSm}`}
								onClick={() => k.modal && chain(k.modal)}
							>
								<i className={`bi ${k.actionIcon}`} />
								{k.actionLabel ? ` ${k.actionLabel}` : ""}
							</button>
						</div>
					))}
			</MBox>

			{/* ---------------- 16. API Quota & Billing ---------------- */}
			<MBox
				s={s}
				id="quotaBillingModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-wallet2"
							style={{ color: "var(--pm-ink-soft)" }}
						/>
						API Quota & Billing
					</>
				}
				footer={m.footer(
					"quotaBillingModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"quotaBillingModal",
									"Upgrade request sent. Sales will contact you.",
								)
							}
						>
							Upgrade Tier
						</button>
					</>,
				)}
			>
				{m.body(
					"quotaBillingModal",
					<>
						<div className={`${s.note} ${s.noteMuted} mb-3`}>
							<h6 style={{ fontWeight: 700 }}>{data.quota.plan}</h6>
							<div className="mt-2">
								<div
									className="d-flex justify-content-between"
									style={{ fontSize: 12, color: "var(--pm-muted)" }}
								>
									<span>Free API Calls Used</span>
									<span>{data.quota.usedLabel}</span>
								</div>
								<div className={`${s.progress} mt-1`}>
									<div
										className={s.progressBar}
										style={{
											width: `${data.quota.usedPct}%`,
											background: "var(--pm-primary)",
										}}
									/>
								</div>
							</div>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Service</th>
										<th>Usage</th>
										<th>Cost</th>
									</tr>
								</thead>
								<tbody>
									{data.quota.rows.map((r) => (
										<tr key={r.service}>
											<td data-label="Service">{r.service}</td>
											<td data-label="Usage">{r.usage}</td>
											<td data-label="Cost">{r.cost}</td>
										</tr>
									))}
									<tr>
										<td data-label="Service" style={{ fontWeight: 700 }}>
											Est. Total
										</td>
										<td data-label="Usage">—</td>
										<td data-label="Cost">
											<strong style={{ color: "var(--pm-primary)" }}>
												{data.quota.total}
											</strong>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 17. Go Live Checklist ---------------- */}
			<MBox
				s={s}
				id="goLiveChecklistModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-rocket" style={{ color: "var(--pm-accent)" }} />
						Go Live & Production Readiness
					</>
				}
				footer={m.footer(
					"goLiveChecklistModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"goLiveChecklistModal",
									"Submitted for Production Approval. Please wait 24h.",
								)
							}
						>
							Request Production Access
						</button>
					</>,
				)}
			>
				{m.body(
					"goLiveChecklistModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Complete the following checklist to unlock Live API Keys and
							process real transactions.
						</p>
						{data.checklist.map((c) => (
							<div
								key={c.title}
								className="p-3 border rounded mb-2 d-flex align-items-center gap-3 flex-wrap"
							>
								<i
									className={`bi ${c.done ? "bi-check-circle-fill" : "bi-circle"}`}
									style={{
										fontSize: 20,
										color: c.done ? "var(--pm-accent)" : "var(--pm-muted)",
									}}
								/>
								<div style={{ flex: 1, minWidth: 180 }}>
									<strong>{c.title}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{c.sub}
									</div>
								</div>
								{c.actionLabel && c.modal && (
									<button
										type="button"
										className={`${s.btnPm} ${s.btnSm}`}
										onClick={() => chain(c.modal as string)}
									>
										{c.actionLabel}
									</button>
								)}
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 18. API Health Status ---------------- */}
			<MBox
				s={s}
				id="healthStatusModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-activity"
							style={{ color: "var(--pm-accent)" }}
						/>
						PayMo API Systems Health
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={`${s.note} ${s.noteSuccess} mb-3 text-center`}>
					<i className="bi bi-check-circle-fill me-1" /> All Systems Operational
				</div>
				{data.systemStatus.map((r) => (
					<div key={r.name} className={s.statusRow}>
						<div style={{ minWidth: 0 }}>
							<strong>{r.name}</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								{r.sub}
							</div>
						</div>
						<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
					</div>
				))}
				<p
					style={{
						fontSize: 11,
						color: "var(--pm-muted)",
						marginTop: 12,
						textAlign: "center",
					}}
				>
					Visit{" "}
					<a
						href="https://status.paymo.com"
						target="_blank"
						rel="noreferrer noopener"
						style={{ color: "var(--pm-primary)" }}
					>
						status.paymo.com
					</a>{" "}
					for historical uptime.
				</p>
			</MBox>

			{/* ---------------- 19. Copy Snippet confirmation ---------------- */}
			<MBox
				s={s}
				id="copySnippetModal"
				active={active}
				size="sm"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-clipboard-check"
							style={{ color: "var(--pm-accent)" }}
						/>
						Copied
					</>
				}
				footer={m.closeOnly("Dismiss")}
			>
				<div className="text-center">
					<div
						className={`${s.iconCircle} mx-auto mb-3`}
						style={{
							width: 56,
							height: 56,
							fontSize: 24,
							background: "var(--pm-accent-soft)",
							color: "var(--pm-accent)",
						}}
					>
						<i className="bi bi-clipboard-check" />
					</div>
					<h5 style={{ fontWeight: 700 }}>Copied to Clipboard!</h5>
					<p
						style={{
							fontSize: 13,
							color: "var(--pm-ink-soft)",
							marginBottom: 0,
						}}
					>
						The code snippet or key is now in your clipboard.
					</p>
				</div>
			</MBox>

			{/* ---------------- 20. Developer Profile ---------------- */}
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
				footer={
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={onClose}
						>
							Sign Out
						</button>
					</>
				}
			>
				<div className="text-center">
					<div
						className={`${s.iconCircle} mx-auto mb-3`}
						style={{
							width: 64,
							height: 64,
							fontSize: 24,
							background: "var(--pm-gradient-slate)",
							color: "#fff",
						}}
					>
						{data.header.user.initials}
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>
						{data.header.user.name}
					</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						{data.header.user.email} · {data.header.user.role}
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Projects</span>
								<br />
								<strong>3 Active</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Security</span>
								<br />
								<strong>MFA Enabled</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ---------------- 21. Documentation Explorer ---------------- */}
			<MBox
				s={s}
				id="docsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-book" style={{ color: "var(--pm-primary)" }} />
						API Documentation Explorer
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="row g-3">
					<div className="col-md-4">
						<div className="list-group" style={{ fontSize: 13 }}>
							{data.docsTopics.map((t) => {
								const on = m.tab("docsTopic", data.docsTopics[0]) === t;
								return (
									<button
										key={t}
										type="button"
										className="list-group-item list-group-item-action border-0"
										style={{
											background: on ? "var(--pm-primary)" : "transparent",
											color: on ? "#fff" : "var(--pm-ink)",
											borderRadius: 8,
											marginBottom: 2,
										}}
										onClick={() => m.setTab("docsTopic", t)}
									>
										{t}
									</button>
								);
							})}
						</div>
					</div>
					<div className="col-md-8 border-start px-md-4">
						<h6 style={{ fontWeight: 700 }}>
							{m.tab("docsTopic", data.docsTopics[0])}
						</h6>
						<p style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}>
							PayMo uses API keys to authenticate requests. You can view and
							manage your API keys in the Dashboard.
						</p>
						<CodeBox s={s} copy={false} style={{ margin: "8px 0 12px" }}>
							Authorization: Bearer sk_test_...
						</CodeBox>
						<p style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}>
							Test mode secret keys have the prefix <code>sk_test_</code> and
							Live mode secret keys have the prefix <code>sk_live_</code>. Your
							API requests must be made over HTTPS.
						</p>
						<a
							className={`${s.btnPm} ${s.btnSm}`}
							href="https://docs.paymo.com"
							target="_blank"
							rel="noreferrer noopener"
						>
							Open Full Docs <i className="bi bi-box-arrow-up-right" />
						</a>
					</div>
				</div>
			</MBox>
		</>
	);
}
