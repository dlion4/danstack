/* ============================================================================
 * 4.8 Monitoring & Incident Management — all 24 modals.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   processAction(id,msg,ref)              -> m.doAction
 *   switchTab('healthTab', …)              -> m.Tabs
 *   modal-body innerHTML reset on hide     -> useModals auto-reset
 *   the war-room chat "Post" button        -> local message state
 * ========================================================================== */

import { useState } from "react";
import {
	Chk,
	CodeBox,
	Fld,
	Lbl,
	MBox,
	Sw,
	useModals,
} from "../../_shared/devModalKit";
import type { MonitoringIncidentsContent } from "../data/monitoringIncidentsData";
import styles from "../styles/monitoringIncidents.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: MonitoringIncidentsContent;
}

/** War-room chat — replaces the static feed + "Post" button. */
function WarRoomChat() {
	const [msgs, setMsgs] = useState([
		{ who: "John D.", text: "Confirmed elevated STK timeouts from Daraja.", t: "10:42" },
		{ who: "Sarah W.", text: "Failing over to secondary Daraja pool.", t: "10:45" },
		{ who: "PayMo Bot", text: "Error rate dropped to 0.6%.", t: "10:51" },
	]);
	const [draft, setDraft] = useState("");
	return (
		<>
			<div
				className="p-3 rounded mb-3"
				style={{ background: "var(--pm-surface-2)", maxHeight: 260, overflowY: "auto" }}
			>
				{msgs.map((mm) => (
					<div key={`${mm.who}-${mm.t}`} className="mb-2">
						<div className="d-flex justify-content-between" style={{ fontSize: 11 }}>
							<strong>{mm.who}</strong>
							<span style={{ color: "var(--pm-muted)" }}>{mm.t}</span>
						</div>
						<div style={{ fontSize: 13 }}>{mm.text}</div>
					</div>
				))}
			</div>
			<div className="d-flex gap-2">
				<input
					className={s.formControl}
					placeholder="Post a status update…"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					aria-label="War room message"
				/>
				<button
					type="button"
					className={`${s.btnPm} ${s.btnPmP}`}
					onClick={() => {
						if (!draft.trim()) return;
						setMsgs((p) => [
							...p,
							{
								who: "You",
								text: draft.trim(),
								t: new Date().toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								}),
							},
						]);
						setDraft("");
					}}
				>
					Post
				</button>
			</div>
		</>
	);
}

export default function MonitoringIncidentsModals({
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

	return (
		<>
			{/* ---------------- 1. Public System Status ---------------- */}
			<MBox
				s={s}
				id="systemStatusModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-globe" style={{ color: "var(--pm-accent)" }} />
						Public System Status
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("statusSubscriptionModal")}
						>
							Subscribe to updates
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className={`${s.note} ${s.noteSuccess} text-center mb-3`}>
					<i className="bi bi-check-circle-fill" style={{ fontSize: 28 }} />
					<br />
					<strong style={{ fontSize: 16 }}>All Core Systems Operational</strong>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Service</th>
								<th>Current Status</th>
								<th>Uptime</th>
							</tr>
						</thead>
						<tbody>
							{data.statusServices.map((r) => (
								<tr key={r.name}>
									<td data-label="Service">{r.name}</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
									</td>
									<td data-label="Uptime">{r.uptime}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 2. Post-Mortems ---------------- */}
			<MBox
				s={s}
				id="incidentPostmortemModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-earmark-text" />
						Incident Post-Mortems
					</>
				}
				footer={m.footer(
					"incidentPostmortemModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("incidentPostmortemModal", "Post-mortem exported as PDF.")
							}
						>
							<i className="bi bi-download" /> Export PDF
						</button>
					</>,
				)}
			>
				{m.body(
					"incidentPostmortemModal",
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Incident</th>
									<th>Title</th>
									<th>Date</th>
									<th>Severity</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{data.incidents.map((i) => (
									<tr key={i.id}>
										<td data-label="Incident">
											<code>{i.id}</code>
										</td>
										<td data-label="Title">{i.title}</td>
										<td data-label="Date">{i.date}</td>
										<td data-label="Severity">{i.severity}</td>
										<td data-label="Status">
											<span className={`${s.badge} ${s[i.tone]}`}>{i.status}</span>
										</td>
										<td data-label="Action">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() => chain("postIncidentReviewModal")}
											>
												RCA
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ---------------- 3. Schedule Maintenance ---------------- */}
			<MBox
				s={s}
				id="scheduleMaintenanceModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calendar-event" />
						Schedule Maintenance Notice
					</>
				}
				footer={m.footer(
					"scheduleMaintenanceModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"scheduleMaintenanceModal",
									"Maintenance scheduled and notifications queued.",
								)
							}
						>
							Schedule
						</button>,
					),
				)}
			>
				{m.body(
					"scheduleMaintenanceModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Title</Lbl>
							<Fld s={s} placeholder="e.g. Database failover drill" />
						</div>
						<div className="row g-3 mb-3">
							<div className="col-sm-6">
								<Lbl s={s}>Start Time</Lbl>
								<Fld s={s} type="datetime-local" defaultValue="2025-07-05T02:00" />
							</div>
							<div className="col-sm-6">
								<Lbl s={s}>End Time</Lbl>
								<Fld s={s} type="datetime-local" defaultValue="2025-07-05T04:00" />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Impact Level</Lbl>
							<Fld
								s={s}
								as="select"
								options={["No impact expected", "Degraded performance", "Full downtime"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Description for Status Page</Lbl>
							<Fld s={s} as="textarea" rows={3} placeholder="Customer-facing summary…" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 4. API Health Metrics ---------------- */}
			<MBox
				s={s}
				id="apiHealthMetricsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-speedometer2" />
						API Health Metrics Deep-Dive
					</>
				}
				footer={m.closeOnly()}
			>
				<m.Tabs
					k="healthTab"
					def="latency"
					opts={[
						{ v: "latency", label: "Latency" },
						{ v: "errors", label: "Errors" },
						{ v: "throughput", label: "Throughput" },
					]}
				/>
				{m.tab("healthTab", "latency") === "latency" && (
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Endpoint</th>
									<th>Method</th>
									<th>p95 Latency</th>
								</tr>
							</thead>
							<tbody>
								{[
									["/v2/collections/stk", "POST", "142ms"],
									["/v1/disbursements/b2c", "POST", "185ms"],
									["/v1/accounts/balance", "GET", "45ms"],
									["/v1/identity/verify-id", "POST", "890ms"],
								].map(([e, mm, l]) => (
									<tr key={e}>
										<td data-label="Endpoint">
											<code>{e}</code>
										</td>
										<td data-label="Method">{mm}</td>
										<td data-label="p95 Latency">{l}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{m.tab("healthTab", "latency") === "errors" && (
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>HTTP Status</th>
									<th>Count (24h)</th>
									<th>% of Traffic</th>
								</tr>
							</thead>
							<tbody>
								{[
									["200 OK", "1,284,991", "99.42%"],
									["429 Rate limited", "5,120", "0.40%"],
									["500 Internal", "1,842", "0.14%"],
									["503 Upstream", "512", "0.04%"],
								].map(([st, ct, p]) => (
									<tr key={st}>
										<td data-label="HTTP Status">{st}</td>
										<td data-label="Count">{ct}</td>
										<td data-label="% of Traffic">{p}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{m.tab("healthTab", "latency") === "throughput" && (
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Primary Endpoint</th>
									<th>Count (24h)</th>
									<th>% of Traffic</th>
								</tr>
							</thead>
							<tbody>
								{[
									["/v2/collections/stk", "812,004", "63%"],
									["/v1/accounts/balance", "298,112", "23%"],
									["/v1/disbursements/b2c", "142,880", "11%"],
									["Other", "38,120", "3%"],
								].map(([e, ct, p]) => (
									<tr key={e}>
										<td data-label="Endpoint">
											<code>{e}</code>
										</td>
										<td data-label="Count">{ct}</td>
										<td data-label="% of Traffic">{p}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</MBox>

			{/* ---------------- 5. Dependency Health ---------------- */}
			<MBox
				s={s}
				id="dependencyHealthModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-diagram-2" />
						Dependency Health Check
					</>
				}
				footer={m.closeOnly()}
			>
				{data.dependencies.map((d) => (
					<div key={d.name} className={s.statusRow}>
						<div style={{ minWidth: 0 }}>
							<strong>{d.name}</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{d.sub}</div>
						</div>
						<span className={`${s.badge} ${s[d.tone]}`}>{d.status}</span>
					</div>
				))}
			</MBox>

			{/* ---------------- 6. Add/Edit Alert Rule ---------------- */}
			<MBox
				s={s}
				id="addAlertRuleModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell-fill" style={{ color: "var(--pm-warning)" }} />
						Configure Alert Rule
					</>
				}
				footer={m.footer(
					"addAlertRuleModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"addAlertRuleModal",
									"Alert rule saved successfully. Evaluator activated.",
								)
							}
						>
							Save Rule
						</button>,
					),
				)}
			>
				{m.body(
					"addAlertRuleModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Rule Name</Lbl>
							<Fld s={s} placeholder="e.g. High 5xx Error Rate" />
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<Lbl s={s}>Metric</Lbl>
								<Fld
									s={s}
									as="select"
									options={[
										"HTTP 5xx rate",
										"p95 latency",
										"Webhook failure rate",
										"Throughput (req/s)",
									]}
								/>
							</div>
							<div className="col-md-6">
								<Lbl s={s}>Condition</Lbl>
								<Fld s={s} placeholder="> 1%" />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Evaluation Window</Lbl>
							<Fld s={s} as="select" options={["1 minute", "5 minutes", "15 minutes", "1 hour"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Severity Level</Lbl>
							<Fld s={s} as="select" options={["Critical", "Warning", "Info"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Notification Channels</Lbl>
							<Chk label="PagerDuty (on-call phone)" defaultChecked />
							<Chk label="Slack #paymo-alerts" defaultChecked />
							<Chk label="Email devops@company.com" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 7. Notification Channels ---------------- */}
			<MBox
				s={s}
				id="notificationChannelsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-plug" />
						Alerting Channels
					</>
				}
				footer={m.footer(
					"notificationChannelsModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("notificationChannelsModal", "Channel settings saved.")
							}
						>
							Save Channels
						</button>
					</>,
				)}
			>
				{m.body(
					"notificationChannelsModal",
					<>
						{data.channels.map((ch) => (
							<div key={ch.name} className={s.statusRow}>
								<div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
									<i className={`bi ${ch.icon}`} style={{ color: ch.color, fontSize: 18 }} />
									<div>
										<strong>{ch.name}</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											{ch.detail}
										</div>
									</div>
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnSm} ${ch.connected ? "" : s.btnPmP}`}
									onClick={() =>
										ch.name === "PagerDuty"
											? chain("pagerDutySetupModal")
											: m.doAction(
													"notificationChannelsModal",
													`${ch.name} ${ch.connected ? "disconnected" : "connected"}.`,
												)
									}
								>
									{ch.connected ? "Disconnect" : "Add"}
								</button>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 8. PagerDuty Setup ---------------- */}
			<MBox
				s={s}
				id="pagerDutySetupModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-telephone-outbound" style={{ color: "var(--pm-danger)" }} />
						PagerDuty Integration
					</>
				}
				footer={m.footer(
					"pagerDutySetupModal",
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() =>
								m.doAction("pagerDutySetupModal", "Test alert sent to PagerDuty. Check your phone!")
							}
						>
							Send Test
						</button>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("pagerDutySetupModal", "PagerDuty settings updated.")
							}
						>
							Save
						</button>
					</>,
				)}
			>
				{m.body(
					"pagerDutySetupModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Integration Key (Routing Key)</Lbl>
							<Fld s={s} mono defaultValue="R02ABCD1234EFGH5678IJKL9c21" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Trigger Rules</Lbl>
							<Chk label="Page on Critical alerts" defaultChecked />
							<Chk label="Page on Warning alerts" />
							<Chk label="Auto-resolve when metric recovers" defaultChecked />
						</div>
						<div className={`${s.note} ${s.noteInfo}`}>
							<i className="bi bi-info-circle me-1" /> Events are sent to the PagerDuty
							Events API v2.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 9. Escalation Policy ---------------- */}
			<MBox
				s={s}
				id="escalationPolicyModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-arrow-up-right-square" style={{ color: "var(--pm-accent)" }} />
						Escalation Policy
					</>
				}
				footer={m.footer(
					"escalationPolicyModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("escalationPolicyModal", "Escalation policy saved.")}
						>
							Save Policy
						</button>,
					),
				)}
			>
				{m.body(
					"escalationPolicyModal",
					<>
						{[
							["Level 1 — Immediately", data.onCall.l1, "0 min"],
							["Level 2 — If unacknowledged", data.onCall.l2, "10 min"],
							["Level 3 — Engineering Manager", "Peter M.", "25 min"],
						].map(([lvl, who, delay]) => (
							<div key={lvl} className="p-3 border rounded mb-2">
								<div className="d-flex justify-content-between flex-wrap gap-2">
									<strong>{lvl}</strong>
									<span className={`${s.badge} ${s.badgeNeutral}`}>{delay}</span>
								</div>
								<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
									Notify: {who}
								</div>
							</div>
						))}
						<Sw label="Repeat escalation until acknowledged" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 10. Incident War Room ---------------- */}
			<MBox
				s={s}
				id="incidentWarRoomModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-exclamation-triangle" style={{ color: "var(--pm-danger)" }} />
						Incident War Room
					</>
				}
				footer={m.footer(
					"incidentWarRoomModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("postIncidentReviewModal")}
						>
							Resolve & Write RCA
						</button>
					</>,
				)}
			>
				{m.body(
					"incidentWarRoomModal",
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={`${s.note} ${s.noteDanger} mb-3`}>
								<strong>SEV-2 · M-Pesa STK Timeouts</strong>
								<div style={{ fontSize: 12 }}>Started 10:38 EAT · 24 min ago</div>
							</div>
							<div className={s.statusRow}>
								<span>Incident Commander</span>
								<strong>{data.onCall.l1}</strong>
							</div>
							<div className={s.statusRow}>
								<span>Comms Lead</span>
								<strong>{data.onCall.l2}</strong>
							</div>
							<div className={s.statusRow}>
								<span>Affected Service</span>
								<span className={`${s.badge} ${s.badgeW}`}>Collections API</span>
							</div>
							<div className={s.statusRow}>
								<span>Customer Impact</span>
								<span className={`${s.badge} ${s.badgeD}`}>Partial outage</span>
							</div>
						</div>
						<div className="col-lg-7">
							<h6 style={{ fontWeight: 700 }}>Timeline</h6>
							<WarRoomChat />
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 11. Post Incident Review ---------------- */}
			<MBox
				s={s}
				id="postIncidentReviewModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-clipboard-check" />
						Post-Incident Review (RCA)
					</>
				}
				footer={m.footer(
					"postIncidentReviewModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("postIncidentReviewModal", "Incident resolved and RCA published!")
							}
						>
							Publish RCA
						</button>,
					),
				)}
			>
				{m.body(
					"postIncidentReviewModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Root Cause Summary</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={3}
								placeholder="What actually caused the incident?"
							/>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-sm-6">
								<Lbl s={s}>Time to Detect (TTD)</Lbl>
								<Fld s={s} defaultValue="4 minutes" />
							</div>
							<div className="col-sm-6">
								<Lbl s={s}>Time to Resolve (TTR)</Lbl>
								<Fld s={s} defaultValue="38 minutes" />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Action Items (Prevention)</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={3}
								placeholder="1. Add circuit breaker on Daraja pool…"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 12. Centralized Log Explorer ---------------- */}
			<MBox
				s={s}
				id="centralizedLogModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-journal-code" />
						Centralized Log Explorer (ELK)
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("logRetentionModal")}
						>
							Retention Settings
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className="d-flex gap-2 mb-3 flex-wrap">
					<Fld s={s} mono placeholder='level:ERROR AND svc:"mpesa-bridge"' />
					<Fld
						s={s}
						as="select"
						options={["Last 15 min", "Last 1 hour", "Last 24 hours", "Last 7 days"]}
						style={{ width: 170 }}
					/>
					<button type="button" className={`${s.btnPm} ${s.btnPmP}`}>
						Search
					</button>
				</div>
				<div className={s.logTail}>
					{data.logLines.map((l) => (
						<div
							key={l.text}
							className={`${s.logLine} ${
								l.level === "warn" ? s.logWarn : l.level === "error" ? s.logError : ""
							}`}
						>
							{l.text}
						</div>
					))}
				</div>
			</MBox>

			{/* ---------------- 13. Log Retention ---------------- */}
			<MBox
				s={s}
				id="logRetentionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-archive" style={{ color: "var(--pm-info)" }} />
						Log Retention Policies
					</>
				}
				footer={m.footer(
					"logRetentionModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("logRetentionModal", "Log retention policies updated successfully.")
							}
						>
							Save Policies
						</button>,
					),
				)}
			>
				{m.body(
					"logRetentionModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Hot Storage (Elasticsearch)</Lbl>
							<Fld s={s} as="select" options={["7 days", "30 days", "90 days"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Warm Storage</Lbl>
							<Fld s={s} as="select" options={["90 days", "180 days", "1 year"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Cold Archive (S3 / Glacier)</Lbl>
							<Fld s={s} as="select" options={["1 year", "3 years", "7 years"]} />
						</div>
						<div className={`${s.note} ${s.noteWarn}`}>
							<i className="bi bi-exclamation-triangle me-1" /> CBK regulations require a
							minimum 7-year archive for financial transaction logs.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 14. Trace Visualization ---------------- */}
			<MBox
				s={s}
				id="traceVisualizationModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-diagram-3" style={{ color: "var(--pm-purple)" }} />
						Distributed Tracing (OpenTelemetry)
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("openTelemetryModal")}
						>
							OTEL Config
						</button>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("bottleneckDetailsModal")}
						>
							Bottlenecks
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className="mb-3">
					<Lbl s={s}>Trace ID</Lbl>
					<Fld s={s} mono defaultValue="tx-99128c" />
				</div>
				<h6 style={{ fontWeight: 700 }}>Span Waterfall</h6>
				{data.spans.map((sp) => (
					<div key={sp.span} className="mb-2">
						<div
							className="d-flex justify-content-between flex-wrap"
							style={{ fontSize: 12, gap: 8 }}
						>
							<span style={{ fontFamily: "var(--pm-font-mono)" }}>{sp.span}</span>
							<strong>{sp.duration}</strong>
						</div>
						<div className={`${s.progress} mt-1`}>
							<div
								className={s.progressBar}
								style={{
									width: sp.pct,
									background:
										sp.tone === "badgeD"
											? "var(--pm-danger)"
											: sp.tone === "badgeW"
												? "var(--pm-warning)"
												: "var(--pm-accent)",
								}}
							/>
						</div>
					</div>
				))}
			</MBox>

			{/* ---------------- 15. Bottleneck Details ---------------- */}
			<MBox
				s={s}
				id="bottleneckDetailsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-graph-down-arrow" style={{ color: "var(--pm-danger)" }} />
						Performance Regression Analysis
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Span / Operation</th>
								<th>Avg Duration</th>
								<th>% of Total Time</th>
								<th>Impact</th>
							</tr>
						</thead>
						<tbody>
							{data.spans.map((sp) => (
								<tr key={sp.span}>
									<td data-label="Span">
										<code>{sp.span}</code>
									</td>
									<td data-label="Avg Duration">{sp.duration}</td>
									<td data-label="% of Total">{sp.pct}</td>
									<td data-label="Impact">
										<span className={`${s.badge} ${s[sp.tone]}`}>{sp.impact}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 16. OpenTelemetry ---------------- */}
			<MBox
				s={s}
				id="openTelemetryModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-broadcast-pin" style={{ color: "var(--pm-purple)" }} />
						OpenTelemetry Configuration
					</>
				}
				footer={m.footer(
					"openTelemetryModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"openTelemetryModal",
									"OTEL configuration saved. Traces will begin exporting within 60 seconds.",
								)
							}
						>
							Save Config
						</button>,
					),
				)}
			>
				{m.body(
					"openTelemetryModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>OTLP Endpoint URL</Lbl>
							<Fld s={s} mono defaultValue="https://otel.company.com:4317" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Protocol</Lbl>
							<Fld s={s} as="select" options={["gRPC (recommended)", "HTTP/protobuf"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Auth Header (Optional)</Lbl>
							<Fld s={s} mono placeholder="Authorization: Bearer …" />
						</div>
						<CodeBox s={s}>
							{`OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.company.com:4317
OTEL_SERVICE_NAME=paymo-integration
OTEL_TRACES_SAMPLER=parentbased_traceidratio`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 17. Prometheus Export ---------------- */}
			<MBox
				s={s}
				id="prometheusExportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-box-arrow-up" style={{ color: "var(--pm-warning)" }} />
						Prometheus Metrics Export
					</>
				}
				footer={m.footer(
					"prometheusExportModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("prometheusExportModal", "Scrape endpoint enabled and secured.")
							}
						>
							Enable Scrape Endpoint
						</button>
					</>,
				)}
			>
				{m.body(
					"prometheusExportModal",
					<>
						<CodeBox s={s} copy>
							{`scrape_configs:
  - job_name: 'paymo'
    scheme: https
    static_configs:
      - targets: ['metrics.paymo.co.ke']`}
						</CodeBox>
						<div className="mb-3 mt-3">
							<Lbl s={s}>IP Whitelist (Recommended)</Lbl>
							<Fld s={s} mono placeholder="10.0.0.0/24" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Included Metrics</Lbl>
							<Chk label="paymo_request_duration_seconds" defaultChecked />
							<Chk label="paymo_requests_total" defaultChecked />
							<Chk label="paymo_webhook_delivery_failures_total" defaultChecked />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 18. Grafana Dashboards ---------------- */}
			<MBox
				s={s}
				id="grafanaDashboardModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bar-chart" style={{ color: "var(--pm-warning)" }} />
						Grafana Dashboard Templates
					</>
				}
				footer={m.footer(
					"grafanaDashboardModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("grafanaDashboardModal", "Dashboard JSON downloaded.")
							}
						>
							Download JSON
						</button>
					</>,
				)}
			>
				{m.body(
					"grafanaDashboardModal",
					<>
						{[
							["API Golden Signals", "Latency, traffic, errors, saturation"],
							["Webhook Delivery Health", "Success rate, retries, DLQ depth"],
							["Business Conversion Funnel", "STK initiated → completed"],
						].map(([t, d]) => (
							<div key={t} className={s.statusRow}>
								<div>
									<strong>{t}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{d}</div>
								</div>
								<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
									Import
								</button>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 19. Business Metrics ---------------- */}
			<MBox
				s={s}
				id="businessMetricModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-funnel" style={{ color: "var(--pm-primary)" }} />
						Business Metric Tracking
					</>
				}
				footer={m.footer(
					"businessMetricModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("businessMetricModal", "Business metric preferences updated.")
							}
						>
							Save
						</button>,
					),
				)}
			>
				{m.body(
					"businessMetricModal",
					<>
						{[
							["STK Success Rate", "94.2%", "var(--pm-accent)"],
							["Avg Basket Value", "KES 2,480", "var(--pm-primary)"],
							["Checkout Abandonment", "5.8%", "var(--pm-warning)"],
						].map(([l, v, col]) => (
							<div key={l} className={s.statusRow}>
								<span>{l}</span>
								<strong style={{ color: col }}>{v}</strong>
							</div>
						))}
						<div className="mb-3 mt-3">
							<Lbl s={s}>Custom Metric Definition</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={3}
								mono
								placeholder="sum(rate(paymo_requests_total[5m])) by (status)"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 20. Project Selector ---------------- */}
			<MBox
				s={s}
				id="projectSelectorModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-layers" />
						Switch Project Environment
					</>
				}
				footer={m.footer("projectSelectorModal", m.closeOnly())}
			>
				{m.body(
					"projectSelectorModal",
					<>
						{data.header.projects
							.filter((p) => !p.startsWith("+"))
							.map((p) => (
								<m.PickBox key={p} k="project" v={p}>
									<strong>{p}</strong>
								</m.PickBox>
							))}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP} w-100 mt-2`}
							onClick={() =>
								m.doAction("projectSelectorModal", "Environment switched successfully.")
							}
						>
							Switch Environment
						</button>
					</>,
				)}
			</MBox>

			{/* ---------------- 21. Status Subscription ---------------- */}
			<MBox
				s={s}
				id="statusSubscriptionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-envelope-paper" />
						Subscribe to Status Updates
					</>
				}
				footer={m.footer(
					"statusSubscriptionModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"statusSubscriptionModal",
									"Subscription confirmed. You will receive an email shortly.",
								)
							}
						>
							Subscribe
						</button>,
					),
				)}
			>
				{m.body(
					"statusSubscriptionModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Email Address</Lbl>
							<Fld s={s} type="email" defaultValue={data.header.user.email} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>SMS / Phone</Lbl>
							<Fld s={s} placeholder="+254 7XX XXX XXX" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Webhook URL (For automated bots)</Lbl>
							<Fld s={s} type="url" mono placeholder="https://hooks.slack.com/…" />
						</div>
						<Chk label="Notify on incidents only (skip maintenance)" />
					</>,
				)}
			</MBox>

			{/* ---------------- 22. Webhook DLQ ---------------- */}
			<MBox
				s={s}
				id="webhookRetryModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-arrow-repeat" style={{ color: "var(--pm-warning)" }} />
						Webhook Dead Letter Queue (DLQ)
					</>
				}
				footer={m.footer(
					"webhookRetryModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"webhookRetryModal",
									"All DLQ events have been queued for immediate replay.",
								)
							}
						>
							Replay All
						</button>
					</>,
				)}
			>
				{m.body(
					"webhookRetryModal",
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Event ID</th>
									<th>Event Type</th>
									<th>Attempts</th>
									<th>Last Error</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{data.dlqRows.map((r) => (
									<tr key={r.eventId}>
										<td data-label="Event ID">
											<code>{r.eventId}</code>
										</td>
										<td data-label="Event Type">{r.type}</td>
										<td data-label="Attempts">{r.attempts}</td>
										<td data-label="Last Error">{r.lastError}</td>
										<td data-label="Action">
											<button
												type="button"
												className={`${s.btnPm} ${s.btnSm}`}
												onClick={() =>
													m.doAction("webhookRetryModal", `Event ${r.eventId} replayed.`)
												}
											>
												Replay
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ---------------- 23. Developer Alerts ---------------- */}
			<MBox
				s={s}
				id="developerAlertsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" />
						Recent Alert History
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
					{data.alertHistory.map((a) => (
						<div
							key={a.title}
							className="p-3 rounded mb-2"
							style={{ background: a.bg, fontSize: 13 }}
						>
							<strong>{a.title}</strong>
							<div style={{ fontSize: 12, marginTop: 2 }}>{a.text}</div>
							<div style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}>
								{a.age}
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ---------------- 24. Global Profile ---------------- */}
			<MBox
				s={s}
				id="globalProfileModal"
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
						className={`${s.btnPm} ${s.btnSm} w-100`}
						style={{ color: "var(--pm-danger)", borderColor: "var(--pm-danger)" }}
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
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>{data.header.user.name}</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						{data.header.user.role} · {data.header.user.email}
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>On-Call</span>
								<br />
								<strong>Primary (L1)</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Alert Rules</span>
								<br />
								<strong>{data.alertRules.length} configured</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>
		</>
	);
}
