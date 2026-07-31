/* ============================================================================
 * 4.3 Webhooks & Events — all 23 modals, incl. the 4-step Add Endpoint wizard,
 * the DLQ manager, the event-catalog accordion and the endpoint health board.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextAddWebStep()        -> m.step/go/confirmStep (step 3 keeps the 1.2s gate)
 *   toggleAllEvents(chk)    -> controlled `allEvents` state fanning out to the
 *                              per-event checkbox map (was a querySelectorAll
 *                              loop mutating .checked on live DOM nodes)
 *   accordion data-bs-*     -> local `openPanel` state
 *   processAction(id,msg)   -> m.doAction(id,msg)
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
	useModals,
} from "../../_shared/devModalKit";
import type { WebhooksEventsContent } from "../data/webhooksEventsData";
import styles from "../styles/webhooksEvents.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: WebhooksEventsContent;
}

/* ---------------------------------------------------------------------------
 * Event subscription list — replaces toggleAllEvents(chk) + querySelectorAll.
 * ------------------------------------------------------------------------- */
function EventPicker({ options }: { options: string[] }) {
	const [checked, setChecked] = useState<Record<string, boolean>>(() => ({
		[options[0]]: true,
		[options[1]]: true,
	}));
	const all = options.every((o) => checked[o]);
	return (
		<>
			<div className="mb-2">
				<Fld s={s} placeholder="Search events..." />
			</div>
			<div
				className="border rounded p-3"
				style={{
					maxHeight: 220,
					overflowY: "auto",
					background: "var(--pm-surface-2)",
				}}
			>
				<Chk
					label="Select All Events"
					bold
					checked={all}
					onChange={(v) =>
						setChecked(Object.fromEntries(options.map((o) => [o, v])))
					}
				/>
				<hr className={s.divider} />
				{options.map((o) => (
					<Chk
						key={o}
						label={o}
						checked={!!checked[o]}
						onChange={(v) => setChecked((p) => ({ ...p, [o]: v }))}
					/>
				))}
			</div>
		</>
	);
}

/* Event catalog accordion — replaces Bootstrap collapse plugin. */
function Catalog({ data }: { data: WebhooksEventsContent }) {
	const [open, setOpen] = useState<string | null>(
		data.catalog[0]?.event ?? null,
	);
	const [q, setQ] = useState("");
	const rows = data.catalog.filter((c) =>
		c.event.toLowerCase().includes(q.toLowerCase()),
	);
	return (
		<>
			<div className="mb-3">
				<input
					className={s.formControl}
					placeholder="Search dictionary..."
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
			</div>
			{rows.length === 0 && (
				<div className="p-4 text-center" style={{ color: "var(--pm-muted)" }}>
					<i className="bi bi-search d-block mb-2" style={{ fontSize: 24 }} />
					No events match "{q}".
				</div>
			)}
			{rows.map((c) => {
				const isOpen = open === c.event;
				return (
					<div key={c.event} className={s.accordionItem}>
						<button
							type="button"
							className={`${s.accordionBtn} ${isOpen ? s.accordionBtnOpen : ""}`}
							onClick={() => setOpen(isOpen ? null : c.event)}
						>
							{c.event}
							<i
								className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
							/>
						</button>
						{isOpen && (
							<div className={s.accordionBody}>
								{c.desc}
								{c.sample && (
									<>
										<br />
										<br />
										<code>{c.sample}</code>
									</>
								)}
							</div>
						)}
					</div>
				);
			})}
		</>
	);
}

export default function WebhooksEventsModals({
	active,
	onClose,
	onOpen,
	data,
}: Props) {
	const m = useModals(s, active, onClose);
	const chain = (id: string) => {
		onClose();
		window.setTimeout(() => onOpen(id), 60);
	};

	const addStep = m.step("addEndpointModal");

	return (
		<>
			{/* ---------------- 1. Add Endpoint (4-step wizard) ---------------- */}
			<MBox
				s={s}
				id="addEndpointModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-circle"
							style={{ color: "var(--pm-primary)" }}
						/>
						Add Webhook Endpoint
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{addStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("addEndpointModal", addStep + 1)}
							>
								Continue <i className="bi bi-arrow-right" />
							</button>
						)}
						{addStep === 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("addEndpointModal", 4)}
							>
								Verify & Save <i className="bi bi-check2" />
							</button>
						)}
						{addStep >= 4 && (
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
				{m.busy === "addEndpointModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["URL", "Events", "Security", "Done"]}
							current={addStep}
						/>

						{addStep === 1 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 1: Endpoint URL</h6>
								<div className="mb-3">
									<Lbl s={s}>Webhook URL</Lbl>
									<Fld
										s={s}
										type="url"
										mono
										placeholder="https://api.yourdomain.com/paymo-events"
									/>
								</div>
								<div className="mb-3">
									<Lbl s={s}>Environment</Lbl>
									<Fld s={s} as="select" options={["Production", "Sandbox"]} />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Description / Name</Lbl>
									<Fld s={s} placeholder="e.g., Main billing processor" />
								</div>
								<div className={`${s.note} ${s.noteInfo}`}>
									<i className="bi bi-lock me-1" /> HTTPS is strictly required.
									TLS 1.2+ minimum.
								</div>
							</>
						)}

						{addStep === 2 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 2: Subscribed Events</h6>
								<EventPicker options={data.eventOptions} />
							</>
						)}

						{addStep === 3 && (
							<>
								<h6 style={{ fontWeight: 700 }}>
									Step 3: Security & Verification
								</h6>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									PayMo signs all webhook payloads using HMAC-SHA256. Use this
									secret to verify signatures.
								</p>
								<div
									className="p-3 border rounded mb-3"
									style={{ background: "#fff" }}
								>
									<div
										style={{
											fontSize: 11,
											color: "var(--pm-muted)",
											marginBottom: 4,
										}}
									>
										Webhook Secret
									</div>
									<div className="d-flex align-items-center gap-2">
										<Fld
											s={s}
											defaultValue="whsec_8f92bd3a41e976c11f4d"
											readOnly
											mono
										/>
										<button
											type="button"
											className={`${s.btnPm} ${s.btnSm}`}
											aria-label="Copy secret"
										>
											<i className="bi bi-clipboard" />
										</button>
									</div>
								</div>
								<Chk
									label="Require Challenge-Response validation on save"
									defaultChecked
								/>
							</>
						)}

						{addStep >= 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									Endpoint Verified & Added
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									PayMo successfully verified your endpoint. It is now active
									and listening for events.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 2. Edit Endpoint ---------------- */}
			<MBox
				s={s}
				id="editEndpointModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-pencil" />
						Edit Endpoint
					</>
				}
				footer={m.footer(
					"editEndpointModal",
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD} me-auto`}
							onClick={() => chain("deleteEndpointModal")}
						>
							Delete
						</button>
						{m.closeOnly("Cancel")}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"editEndpointModal",
									"Endpoint updated successfully.",
								)
							}
						>
							Save Changes
						</button>
					</>,
				)}
			>
				{m.body(
					"editEndpointModal",
					<>
						<m.Tabs
							k="editEp"
							def="general"
							opts={[
								{ v: "general", label: "General" },
								{ v: "events", label: "Events" },
								{ v: "security", label: "Security" },
							]}
						/>
						{m.tab("editEp", "general") === "general" && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Endpoint URL</Lbl>
									<Fld
										s={s}
										type="url"
										mono
										defaultValue="https://hr.merchant.com/api/paymo-events"
									/>
								</div>
								<div className="mb-3">
									<Lbl s={s}>Status</Lbl>
									<select
										className={s.formControl}
										defaultValue="Failing (Auto-paused)"
									>
										<option>Active</option>
										<option>Failing (Auto-paused)</option>
										<option>Paused manually</option>
									</select>
								</div>
							</>
						)}
						{m.tab("editEp", "general") === "events" && (
							<div
								className="border rounded p-3"
								style={{
									maxHeight: 220,
									overflowY: "auto",
									background: "var(--pm-surface-2)",
								}}
							>
								<Chk label="payroll.completed" defaultChecked />
								<Chk label="payroll.failed" defaultChecked />
								<Chk label="employee.added" />
							</div>
						)}
						{m.tab("editEp", "general") === "security" && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Current Secret</Lbl>
									<Fld s={s} defaultValue="whsec_p4yR0LL992k" readOnly mono />
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmD}`}
									onClick={() => chain("generateSecretModal")}
								>
									Rotate Secret
								</button>
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ---------------- 3. Test Webhook ---------------- */}
			<MBox
				s={s}
				id="testWebhookModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bug" style={{ color: "var(--pm-accent)" }} />
						Test Webhook Delivery
					</>
				}
				footer={m.footer(
					"testWebhookModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"testWebhookModal",
									"Test event sent. Received 200 OK (84ms)",
								)
							}
						>
							Send Test Event
						</button>,
					),
				)}
			>
				{m.body(
					"testWebhookModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Select Endpoint</Lbl>
							<Fld s={s} as="select" options={data.endpointOptions} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Event to Simulate</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"payment.success",
									"payment.failed",
									"invoice.paid",
									"kyc.verified",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Payload Preview</Lbl>
							<CodeBox s={s} copy={false} height={140}>
								{`{
  "id": "evt_test_12345",
  "type": "payment.success",
  "created": "2025-06-27T14:45:00Z",
  "data": {
    "amount": 5000,
    "currency": "KES"
  }
}`}
							</CodeBox>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 4. View Payload / Delivery Log ---------------- */}
			<MBox
				s={s}
				id="viewPayloadModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-earmark-code" />
						Delivery Log: evt_2b3c4d
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="row g-3 mb-3">
					{[
						["Status", null],
						["Latency", "2004ms"],
						["Timestamp", "14:10:02 EAT"],
						["Attempts", "3/5"],
					].map(([label, value]) => (
						<div className="col-6 col-md-3" key={label as string}>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								{label}
							</div>
							{value ? (
								<strong>{value}</strong>
							) : (
								<span className={`${s.badge} ${s.badgeD}`}>503 ERR</span>
							)}
						</div>
					))}
				</div>
				<m.Tabs
					k="payloadTab"
					def="req"
					opts={[
						{ v: "req", label: "Request" },
						{ v: "res", label: "Response" },
					]}
				/>
				{m.tab("payloadTab", "req") === "req" ? (
					<CodeBox s={s} copy={false} height={250}>
						{`POST /api/paymo-events HTTP/1.1
Host: hr.merchant.com
PayMo-Signature: t=1687864202,v1=9a8b7c6d...

{
  "id": "evt_2b3c4d",
  "type": "payroll.completed",
  "data": {
    "batch_id": "batch_9921",
    "total_amount": 450000,
    "success_count": 42
  }
}`}
					</CodeBox>
				) : (
					<CodeBox s={s} copy={false} height={250}>
						{`HTTP/1.1 503 Service Unavailable
Content-Type: text/html

<html>
<body>
<h1>503 Service Temporarily Unavailable</h1>
<p>The server is currently unable to handle the request.</p>
</body>
</html>`}
					</CodeBox>
				)}
			</MBox>

			{/* ---------------- 5. DLQ Manager ---------------- */}
			<MBox
				s={s}
				id="dlqManagerModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-envelope-x"
							style={{ color: "var(--pm-danger)" }}
						/>
						Dead Letter Queue (DLQ) Manager
					</>
				}
				footer={m.footer("dlqManagerModal", m.closeOnly())}
			>
				{m.body(
					"dlqManagerModal",
					<>
						<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
							<div className="d-flex gap-2 flex-wrap">
								<Fld
									s={s}
									as="select"
									options={["All Endpoints", "Payroll Sync"]}
									style={{ width: "auto" }}
								/>
								<Fld
									s={s}
									as="select"
									options={["All Event Types", "payment.success"]}
									style={{ width: "auto" }}
								/>
							</div>
							<div className="d-flex gap-2 flex-wrap">
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm}`}
									onClick={() => chain("clearDlqModal")}
								>
									<i className="bi bi-trash" /> Clear All
								</button>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${s.btnPmP}`}
									onClick={() =>
										m.doAction(
											"dlqManagerModal",
											`Bulk replay initiated. Processing ${data.dlqSize} payloads.`,
										)
									}
								>
									<i className="bi bi-arrow-repeat" /> Replay All
								</button>
							</div>
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>
											<input type="checkbox" aria-label="Select all DLQ rows" />
										</th>
										<th>Event ID</th>
										<th>Type</th>
										<th>Failed Endpoint</th>
										<th>Last Attempt</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{data.dlqRows.map((r) => (
										<tr key={r.eventId}>
											<td data-label="Select">
												<input
													type="checkbox"
													aria-label={`Select ${r.eventId}`}
												/>
											</td>
											<td data-label="Event ID">
												<code>{r.eventId}</code>
											</td>
											<td data-label="Type">{r.type}</td>
											<td data-label="Failed Endpoint">{r.endpoint}</td>
											<td data-label="Last Attempt">{r.lastAttempt}</td>
											<td data-label="Action">
												<button
													type="button"
													className={`${s.btnPm} ${s.btnSm}`}
													onClick={() => chain("replayPayloadModal")}
												>
													Replay
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

			{/* ---------------- 6. Replay Payload ---------------- */}
			<MBox
				s={s}
				id="replayPayloadModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-repeat"
							style={{ color: "var(--pm-primary)" }}
						/>
						Replay Event
					</>
				}
				footer={m.footer(
					"replayPayloadModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"replayPayloadModal",
									"Event successfully replayed and received 200 OK.",
								)
							}
						>
							Replay Now
						</button>,
					),
				)}
			>
				{m.body(
					"replayPayloadModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							You are about to manually replay event <strong>evt_2b3c4d</strong>
							. You can send it to its original endpoint or route it to an
							alternate one.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Destination</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Original: https://hr.merchant.com/api...",
									"Alternative: https://staging.merchant.com/webhook",
								]}
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 7. Endpoint Health ---------------- */}
			<MBox
				s={s}
				id="endpointHealthModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-heart-pulse"
							style={{ color: "var(--pm-accent)" }}
						/>
						Endpoint Health & Metrics
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="mb-3">
					<Fld
						s={s}
						as="select"
						options={["Core Payment Processor", "Payroll Status Sync"]}
						style={{ maxWidth: 280 }}
					/>
				</div>
				<div className="row g-3">
					{data.healthMetrics.map((h) => (
						<div className="col-md-4 col-6" key={h.label}>
							<div className="p-3 rounded border text-center">
								<div
									style={{
										fontSize: 11,
										fontWeight: 600,
										color: "var(--pm-muted)",
									}}
								>
									{h.label}
								</div>
								<div style={{ fontSize: 24, fontWeight: 700, color: h.color }}>
									{h.value}
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="mt-4">
					<h6 style={{ fontWeight: 700 }}>Response Status Distribution</h6>
					<div
						className={`${s.progress} mt-2`}
						style={{ height: 12, borderRadius: 6 }}
					>
						<div
							className={s.progressBar}
							style={{ width: "95%", background: "var(--pm-accent)" }}
						/>
						<div
							className={s.progressBar}
							style={{ width: "4%", background: "var(--pm-warning)" }}
						/>
						<div
							className={s.progressBar}
							style={{ width: "1%", background: "var(--pm-danger)" }}
						/>
					</div>
					<div
						className="d-flex justify-content-between mt-2"
						style={{ fontSize: 11, color: "var(--pm-muted)" }}
					>
						<span>2xx (95%)</span>
						<span>4xx (4%)</span>
						<span>5xx (1%)</span>
					</div>
				</div>
			</MBox>

			{/* ---------------- 8. Kafka Integration ---------------- */}
			<MBox
				s={s}
				id="kafkaIntegrationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-hdd-network"
							style={{ color: "var(--pm-purple)" }}
						/>
						Kafka Configuration
					</>
				}
				footer={m.footer(
					"kafkaIntegrationModal",
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD} me-auto`}
							onClick={() => chain("reconnectKafkaModal")}
						>
							Disconnect
						</button>
						{m.closeOnly("Cancel")}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"kafkaIntegrationModal",
									"Kafka configuration updated and tested successfully.",
								)
							}
						>
							Save & Test
						</button>
					</>,
				)}
			>
				{m.body(
					"kafkaIntegrationModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Bootstrap Servers</Lbl>
							<Fld
								s={s}
								mono
								defaultValue="b-1.paymokafka.amazonaws.com:9092,b-2..."
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Topic Name</Lbl>
							<Fld s={s} mono defaultValue="paymo-events-prod" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Authentication Protocol</Lbl>
							<Fld
								s={s}
								as="select"
								options={["SASL_SSL (SCRAM-SHA-512)", "SASL_PLAINTEXT", "mTLS"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Username</Lbl>
							<Fld s={s} mono defaultValue="paymo_producer_svc" />
						</div>
						<div className={`${s.note} ${s.noteWarn}`}>
							<i className="bi bi-exclamation-triangle me-1" /> Consumer group
							'payroll-events' is currently lagging by 4,200 offset. Ensure your
							consumers are scaled.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 9. SQS Integration ---------------- */}
			<MBox
				s={s}
				id="sqsIntegrationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-box" style={{ color: "var(--pm-warning)" }} />
						AWS SQS Integration
					</>
				}
				footer={m.footer(
					"sqsIntegrationModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"sqsIntegrationModal",
									"SQS successfully connected via IAM role assumption.",
								)
							}
						>
							Connect SQS
						</button>,
					),
				)}
			>
				{m.body(
					"sqsIntegrationModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							PayMo will assume an IAM role in your AWS account to publish
							events directly to your SQS queue.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Queue URL</Lbl>
							<Fld
								s={s}
								mono
								placeholder="https://sqs.af-south-1.amazonaws.com/123456789/paymo-q"
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>IAM Role ARN</Lbl>
							<Fld
								s={s}
								mono
								placeholder="arn:aws:iam::123456789:role/PayMo-SQS-Publisher"
							/>
						</div>
						<CodeBox s={s} copy={false}>
							{`# Required IAM Policy:
{
  "Effect": "Allow",
  "Action": "sqs:SendMessage",
  "Resource": "YOUR_QUEUE_ARN"
}`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 10. SSE Settings ---------------- */}
			<MBox
				s={s}
				id="sseSettingsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-broadcast" />
						Server-Sent Events (SSE) Settings
					</>
				}
				footer={m.footer(
					"sseSettingsModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"sseSettingsModal",
									"SSE stream settings updated. Clients will reconnect.",
								)
							}
						>
							Save Settings
						</button>,
					),
				)}
			>
				{m.body(
					"sseSettingsModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Connection Heartbeat</Lbl>
							<select className={s.formControl} defaultValue="30 seconds">
								<option>15 seconds</option>
								<option>30 seconds</option>
								<option>60 seconds</option>
							</select>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Replay Window (Last-Event-ID)</Lbl>
							<select className={s.formControl} defaultValue="24 Hours">
								<option>1 Hour</option>
								<option>24 Hours</option>
								<option>7 Days</option>
							</select>
						</div>
						<Chk label="Enable auto-reconnect fallback" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 11. Idempotency Settings ---------------- */}
			<MBox
				s={s}
				id="idempotencySettingsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-repeat"
							style={{ color: "var(--pm-info)" }}
						/>
						Idempotency Rules
					</>
				}
				footer={m.footer(
					"idempotencySettingsModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"idempotencySettingsModal",
									"Idempotency retention window updated.",
								)
							}
						>
							Save
						</button>,
					),
				)}
			>
				{m.body(
					"idempotencySettingsModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Configure how PayMo handles API requests bearing an existing{" "}
							<code>Idempotency-Key</code> header.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Key Retention Window</Lbl>
							<select className={s.formControl} defaultValue="24 Hours">
								<option>12 Hours</option>
								<option>24 Hours</option>
								<option>48 Hours</option>
								<option>7 Days</option>
							</select>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Conflict Behavior</Lbl>
							<select
								className={s.formControl}
								defaultValue="Return original HTTP response (200 OK)"
							>
								<option>Return original HTTP response (200 OK)</option>
								<option>Return 409 Conflict</option>
							</select>
						</div>
						<div className={`${s.note} ${s.noteMuted}`}>
							<i className="bi bi-info-circle me-1" /> Idempotency is enforced
							for all POST/PUT mutating operations automatically.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 12. Rotate Secret ---------------- */}
			<MBox
				s={s}
				id="generateSecretModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-lock"
							style={{ color: "var(--pm-purple)" }}
						/>
						Rotate Webhook Secret
					</>
				}
				footer={m.footer(
					"generateSecretModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={() =>
								m.doAction(
									"generateSecretModal",
									"Secret rotated. New Secret: whsec_NEW789xyz (copy this now).",
								)
							}
						>
							Rotate Secret Now
						</button>,
					),
				)}
			>
				{m.body(
					"generateSecretModal",
					<>
						<p
							style={{
								fontSize: 13,
								color: "var(--pm-danger)",
								fontWeight: 600,
							}}
						>
							<i className="bi bi-exclamation-triangle" /> Warning: Immediate
							Action Required
						</p>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Rotating this secret will immediately invalidate the old secret.
							Your server must be updated simultaneously or signature validation
							will fail.
						</p>
						<Chk label="I understand this breaks existing signature validation." />
					</>,
				)}
			</MBox>

			{/* ---------------- 13. Event Catalog ---------------- */}
			<MBox
				s={s}
				id="eventCatalogModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-book" />
						Event Catalog & Reference
					</>
				}
				footer={m.closeOnly()}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					<Catalog data={data} />
				</div>
			</MBox>

			{/* ---------------- 14. Alert Settings ---------------- */}
			<MBox
				s={s}
				id="alertSettingsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-bell-fill"
							style={{ color: "var(--pm-warning)" }}
						/>
						Event Alert Rules
					</>
				}
				footer={m.footer(
					"alertSettingsModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("alertSettingsModal", "Alert thresholds saved.")
							}
						>
							Save Rules
						</button>,
					),
				)}
			>
				{m.body(
					"alertSettingsModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Alert me when DLQ exceeds:</Lbl>
							<Fld s={s} type="number" defaultValue="1000" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Alert me when Endpoint Error Rate (15m) exceeds:</Lbl>
							<div className="input-group">
								<input
									className={s.formControl}
									type="number"
									defaultValue="5"
									aria-label="Error rate threshold"
								/>
								<span
									className="input-group-text"
									style={{
										background: "var(--pm-surface-2)",
										borderColor: "var(--pm-border)",
									}}
								>
									%
								</span>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Channels</Lbl>
							<Chk label="Email to Developer Team" defaultChecked />
							<Chk label="Slack / Teams Webhook" defaultChecked />
							<Chk label="PagerDuty / Opsgenie" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 15. Export Logs ---------------- */}
			<MBox
				s={s}
				id="exportLogsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download" />
						Export Delivery Logs
					</>
				}
				footer={m.footer(
					"exportLogsModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"exportLogsModal",
									"Logs exported successfully. Download starting...",
								)
							}
						>
							Export Now
						</button>,
					),
				)}
			>
				{m.body(
					"exportLogsModal",
					<>
						<div className="row g-3 mb-3">
							<div className="col-sm-6">
								<Lbl s={s}>From</Lbl>
								<Fld
									s={s}
									type="datetime-local"
									defaultValue="2025-06-20T00:00"
								/>
							</div>
							<div className="col-sm-6">
								<Lbl s={s}>To</Lbl>
								<Fld
									s={s}
									type="datetime-local"
									defaultValue="2025-06-27T23:59"
								/>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Status Filter</Lbl>
							<Fld
								s={s}
								as="select"
								options={["All Statuses", "Failed (4xx, 5xx) Only"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Format</Lbl>
							<Fld s={s} as="select" options={["CSV", "JSON Lines (.jsonl)"]} />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 16. Profile ---------------- */}
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
				footer={m.closeOnly()}
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
						{data.header.user.role} · {data.header.user.org}
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						{[
							["Role", "System Admin", undefined],
							["API Keys", "2 Active", undefined],
							["Env", "Production", undefined],
							["MFA", "Enabled", "var(--pm-accent)"],
						].map(([k, v, color]) => (
							<div className="col-6" key={k as string}>
								<div className="p-2 rounded border">
									<span style={{ color: "var(--pm-muted)" }}>{k}</span>
									<br />
									<strong style={{ color: color as string }}>{v}</strong>
								</div>
							</div>
						))}
					</div>
				</div>
			</MBox>

			{/* ---------------- 17. Simulate Event ---------------- */}
			<MBox
				s={s}
				id="simulateEventModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-play-circle"
							style={{ color: "var(--pm-warning)" }}
						/>
						Simulate Event
					</>
				}
				footer={m.footer(
					"simulateEventModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmW}`}
							onClick={() =>
								m.doAction(
									"simulateEventModal",
									"Mock event injected across all streams.",
								)
							}
						>
							Fire Event
						</button>,
					),
				)}
			>
				{m.body(
					"simulateEventModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Inject a mock event directly into your streams. It will hit
							Webhooks, SSE, and Kafka topics simultaneously.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Event Type</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"payment.success",
									"payment.failed",
									"refund.processed",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Mock Payload Overrides (JSON)</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={4}
								mono
								defaultValue={`{
  "amount": 1000,
  "currency": "KES"
}`}
								style={{
									background: "#1E293B",
									color: "#e2e8f0",
									border: "none",
								}}
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 18. Pause Endpoint ---------------- */}
			<MBox
				s={s}
				id="pauseEndpointModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-pause-circle"
							style={{ color: "var(--pm-warning)" }}
						/>
						Pause Endpoint
					</>
				}
				footer={m.footer(
					"pauseEndpointModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmW}`}
							onClick={() =>
								m.doAction(
									"pauseEndpointModal",
									"Endpoint paused. Events are now queueing.",
								)
							}
						>
							Pause Delivery
						</button>,
					),
				)}
			>
				{m.body(
					"pauseEndpointModal",
					<p style={{ fontSize: 13, color: "var(--pm-ink-soft)", margin: 0 }}>
						Pausing this endpoint will stop all event deliveries immediately.
						Payloads will queue up according to your retention policy (up to 7
						days) and will be delivered once resumed.
					</p>,
				)}
			</MBox>

			{/* ---------------- 19. Delete Endpoint ---------------- */}
			<MBox
				s={s}
				id="deleteEndpointModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-trash" style={{ color: "var(--pm-danger)" }} />
						Delete Endpoint
					</>
				}
				footer={m.footer(
					"deleteEndpointModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={() =>
								m.doAction(
									"deleteEndpointModal",
									"Endpoint deleted permanently.",
								)
							}
						>
							Confirm Delete
						</button>,
					),
				)}
			>
				{m.body(
					"deleteEndpointModal",
					<>
						<p
							style={{
								fontSize: 13,
								color: "var(--pm-danger)",
								fontWeight: 600,
							}}
						>
							This action is irreversible.
						</p>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)", margin: 0 }}>
							Deleting this endpoint will permanently drop its queued events.
							Are you sure?
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 20. Clear DLQ ---------------- */}
			<MBox
				s={s}
				id="clearDlqModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-trash" style={{ color: "var(--pm-danger)" }} />
						Clear DLQ
					</>
				}
				footer={m.footer(
					"clearDlqModal",
					<>
						<button
							type="button"
							className={s.btnPm}
							onClick={() => chain("exportLogsModal")}
						>
							Export First
						</button>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={() =>
								m.doAction("clearDlqModal", "DLQ purged successfully.")
							}
						>
							Purge DLQ
						</button>
					</>,
				)}
			>
				{m.body(
					"clearDlqModal",
					<>
						<p
							style={{
								fontSize: 13,
								color: "var(--pm-danger)",
								fontWeight: 600,
							}}
						>
							You are about to purge {data.dlqSize} payloads.
						</p>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)", margin: 0 }}>
							These events will be lost forever and cannot be replayed. Export
							them first if you need an audit trail.
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 21. Search Events ---------------- */}
			<MBox
				s={s}
				id="searchEventsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-search" />
						Search Delivery Logs
					</>
				}
				footer={m.footer("searchEventsModal", m.closeOnly())}
			>
				{m.body(
					"searchEventsModal",
					<>
						<div className="d-flex gap-2 mb-3 flex-wrap">
							<Fld s={s} placeholder="Event ID, URL, or Payload keyword..." />
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() =>
									m.doAction(
										"searchEventsModal",
										"Search complete — 12 matching deliveries found in the last 30 days.",
									)
								}
							>
								Search
							</button>
						</div>
						<div
							className="p-5 text-center"
							style={{ color: "var(--pm-muted)" }}
						>
							<i
								className="bi bi-journal-text mb-2 d-block"
								style={{ fontSize: 32 }}
							/>
							Enter a query to search across the last 30 days of delivery logs.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 22. Disconnect Kafka ---------------- */}
			<MBox
				s={s}
				id="reconnectKafkaModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-power" style={{ color: "var(--pm-danger)" }} />
						Disconnect Kafka
					</>
				}
				footer={m.footer(
					"reconnectKafkaModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={() =>
								m.doAction(
									"reconnectKafkaModal",
									"Kafka integration disconnected.",
								)
							}
						>
							Disconnect
						</button>,
					),
				)}
			>
				{m.body(
					"reconnectKafkaModal",
					<p style={{ fontSize: 13, color: "var(--pm-ink-soft)", margin: 0 }}>
						Disconnecting Kafka will immediately drop the producer connection.
						Streaming will stop.
					</p>,
				)}
			</MBox>

			{/* ---------------- 23. Webhooks Notifications ---------------- */}
			<MBox
				s={s}
				id="webhooksNotifModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" />
						Developer Alerts ({data.alerts.length})
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
				{data.alerts.map((a) => (
					<div
						key={a.title}
						className="p-3 rounded mb-2"
						style={{ background: a.bg, fontSize: 13 }}
					>
						<i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} />{" "}
						<strong>{a.title}</strong> — {a.text}
						<div
							style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}
						>
							{a.age}
						</div>
					</div>
				))}
			</MBox>
		</>
	);
}
