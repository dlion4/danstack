/* ============================================================================
 * 4.11 Support, Escalation & SLAs — all 22 modals.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextMultiStep('ticket', 4)   -> m.step/go/confirmStep ("Submit Ticket" gate)
 *   nextMultiStep('incident', 3) -> same, with the danger-styled confirm button
 *   selectTierCard(card)         -> m.isPicked / m.setPicked
 *   switchTab('supportTab', …)   -> m.Tabs (used on the page, not here)
 *   troubleshooting wizard       -> local branching state
 *   chat support                 -> local message state
 * ========================================================================== */

import { useState } from "react";
import {
	Chk,
	Fld,
	Lbl,
	Loading,
	MBox,
	Stepper,
	Sw,
	useModals,
} from "../../_shared/devModalKit";
import type { SupportSlasContent } from "../data/supportSlasData";
import styles from "../styles/supportSlas.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: SupportSlasContent;
}

/** AI troubleshooting wizard — branching Q&A, was a static panel. */
function Troubleshooter() {
	const [step, setStep] = useState(0);
	const [pick, setPick] = useState<string | null>(null);
	const options = [
		{
			v: "401",
			label: "Getting 401 Unauthorized",
			fix: "Your Bearer token is likely from the wrong environment. Sandbox keys start with sk_test_ and cannot call production endpoints. Regenerate the key under API Keys and confirm the Authorization header format.",
		},
		{
			v: "webhook",
			label: "Webhooks not arriving",
			fix: "Check that your endpoint returns HTTP 2xx within 10 seconds and serves a valid TLS 1.2+ certificate. Deliveries that time out are retried 5 times before landing in the DLQ.",
		},
		{
			v: "timeout",
			label: "STK push times out",
			fix: "Safaricom Daraja typically responds in under 3s. If you see repeated timeouts, check the dependency board — and always reconcile via the status callback rather than the synchronous response.",
		},
		{
			v: "429",
			label: "Hitting rate limits (429)",
			fix: "You are exceeding 1,000 req/s on this token. Implement exponential backoff honouring the Retry-After header, or request a limit increase via a support ticket.",
		},
	];
	const chosen = options.find((o) => o.v === pick);

	if (step === 0)
		return (
			<>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					Describe the problem and the assistant will suggest the most likely
					fix before you open a ticket.
				</p>
				{options.map((o) => (
					<button
						key={o.v}
						type="button"
						className={`${s.ticketItem}`}
						onClick={() => {
							setPick(o.v);
							setStep(1);
						}}
					>
						<span>{o.label}</span>
						<i
							className="bi bi-chevron-right"
							style={{ color: "var(--pm-muted)" }}
						/>
					</button>
				))}
			</>
		);

	return (
		<>
			<div className={`${s.note} ${s.noteInfo} mb-3`}>
				<strong>{chosen?.label}</strong>
			</div>
			<h6 style={{ fontWeight: 700 }}>Suggested fix</h6>
			<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>{chosen?.fix}</p>
			<button
				type="button"
				className={`${s.btnPm} ${s.btnSm}`}
				onClick={() => {
					setStep(0);
					setPick(null);
				}}
			>
				<i className="bi bi-arrow-left" /> Try another problem
			</button>
		</>
	);
}

/** Live chat — replaces the static transcript. */
function ChatPanel() {
	const [msgs, setMsgs] = useState([
		{
			who: "PayMo Support",
			text: "Hi John, how can we help today?",
			me: false,
		},
	]);
	const [draft, setDraft] = useState("");
	const send = () => {
		if (!draft.trim()) return;
		const text = draft.trim();
		setMsgs((p) => [...p, { who: "You", text, me: true }]);
		setDraft("");
		window.setTimeout(
			() =>
				setMsgs((p) => [
					...p,
					{
						who: "PayMo Support",
						text: "Thanks — an engineer is reviewing this now. Average reply time is under 4 minutes.",
						me: false,
					},
				]),
			900,
		);
	};
	return (
		<>
			<div
				className="p-3 rounded mb-3"
				style={{
					background: "var(--pm-surface-2)",
					height: 260,
					overflowY: "auto",
				}}
			>
				{msgs.map((mm, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: append-only chat log
						key={i}
						className="mb-2"
						style={{ textAlign: mm.me ? "right" : "left" }}
					>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							{mm.who}
						</div>
						<div
							style={{
								display: "inline-block",
								padding: "8px 12px",
								borderRadius: 12,
								fontSize: 13,
								maxWidth: "85%",
								background: mm.me ? "var(--pm-primary)" : "#fff",
								color: mm.me ? "#fff" : "var(--pm-ink)",
								border: mm.me ? "none" : "1px solid var(--pm-border)",
							}}
						>
							{mm.text}
						</div>
					</div>
				))}
			</div>
			<div className="d-flex gap-2">
				<input
					className={s.formControl}
					placeholder="Type your message…"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && send()}
					aria-label="Chat message"
				/>
				<button
					type="button"
					className={`${s.btnPm} ${s.btnPmP}`}
					onClick={send}
				>
					Send
				</button>
			</div>
		</>
	);
}

export default function SupportSlasModals({
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

	const ticketStep = m.step("submitTicketModal");
	const incStep = m.step("declareIncidentModal");

	return (
		<>
			{/* ---------------- 1. Submit Ticket (4-step) ---------------- */}
			<MBox
				s={s}
				id="submitTicketModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-ticket-detailed"
							style={{ color: "var(--pm-primary)" }}
						/>
						Submit Support Ticket
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{ticketStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("submitTicketModal", ticketStep + 1)}
							>
								Continue <i className="bi bi-arrow-right" />
							</button>
						)}
						{ticketStep === 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("submitTicketModal", 4)}
							>
								Submit Ticket <i className="bi bi-send" />
							</button>
						)}
						{ticketStep >= 4 && (
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
				{m.busy === "submitTicketModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Category", "Details", "Data", "Done"]}
							current={ticketStep}
						/>
						{ticketStep === 1 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Category</Lbl>
									<Fld s={s} as="select" options={data.ticketCategories} />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Severity Level</Lbl>
									{data.sevBlocks.map((sv) => (
										<m.PickBox key={sv.key} k="ticketSev" v={sv.key}>
											<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
												<div>
													<strong style={{ fontSize: 13 }}>{sv.level}</strong>
													<div
														style={{ fontSize: 11, color: "var(--pm-muted)" }}
													>
														{sv.desc}
													</div>
												</div>
												<span className={`${s.badge} ${s[sv.tone]}`}>
													{sv.sla}
												</span>
											</div>
										</m.PickBox>
									))}
								</div>
							</>
						)}
						{ticketStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Subject</Lbl>
									<Fld s={s} placeholder="Brief summary of the issue" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Description</Lbl>
									<Fld
										s={s}
										as="textarea"
										rows={5}
										placeholder="Steps to reproduce, expected vs actual behaviour…"
									/>
								</div>
							</>
						)}
						{ticketStep === 3 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>API Endpoint / URL</Lbl>
									<Fld s={s} mono placeholder="/v2/collections/stk-push" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Request ID / Correlation ID (if applicable)</Lbl>
									<Fld s={s} mono placeholder="req_88f2a1b9c8" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Attach Logs / Screenshots</Lbl>
									<Fld s={s} type="file" />
								</div>
								<Chk
									label="Include my recent API logs automatically"
									defaultChecked
								/>
							</>
						)}
						{ticketStep >= 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									Ticket Submitted
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									Reference TIC-8901. Premium SLA applies — first response
									within 4 hours.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 2. Declare Incident (3-step) ---------------- */}
			<MBox
				s={s}
				id="declareIncidentModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-triangle"
							style={{ color: "var(--pm-danger)" }}
						/>
						Declare Production Incident
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{incStep < 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("declareIncidentModal", incStep + 1)}
							>
								Continue <i className="bi bi-arrow-right" />
							</button>
						)}
						{incStep === 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmD}`}
								onClick={() => m.confirmStep("declareIncidentModal", 3)}
							>
								Declare Incident <i className="bi bi-exclamation-triangle" />
							</button>
						)}
						{incStep >= 3 && (
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
				{m.busy === "declareIncidentModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Severity", "Details", "Declare"]}
							current={incStep}
						/>
						{incStep === 1 && (
							<div className="mb-3">
								<Lbl s={s}>Incident Severity</Lbl>
								{data.sevBlocks.slice(0, 3).map((sv) => (
									<m.PickBox key={sv.key} k="incSev" v={sv.key}>
										<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
											<div>
												<strong style={{ fontSize: 13 }}>{sv.level}</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
													{sv.desc}
												</div>
											</div>
											<span className={`${s.badge} ${s[sv.tone]}`}>
												{sv.sla}
											</span>
										</div>
									</m.PickBox>
								))}
							</div>
						)}
						{incStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Affected Service</Lbl>
									<Fld s={s} as="select" options={data.affectedServices} />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Estimated Impact</Lbl>
									<Fld
										s={s}
										as="select"
										options={[
											"All customers affected",
											"Subset of customers",
											"Single integration",
										]}
									/>
								</div>
								<div className="mb-3">
									<Lbl s={s}>Symptoms / Error Codes</Lbl>
									<Fld
										s={s}
										as="textarea"
										rows={4}
										placeholder="e.g. 503 from /v2/collections since 10:38 EAT"
									/>
								</div>
							</>
						)}
						{incStep >= 3 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									Incident Declared
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									INC-2312 raised. The on-call engineer has been paged and a war
									room is open.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 3. Upgrade Tier ---------------- */}
			<MBox
				s={s}
				id="upgradeTierModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-up-circle"
							style={{ color: "var(--pm-primary)" }}
						/>
						Upgrade Support Tier
					</>
				}
				footer={m.footer(
					"upgradeTierModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"upgradeTierModal",
									"Upgrade request sent. Our team will contact you shortly.",
								)
							}
						>
							Request Upgrade
						</button>,
					),
				)}
			>
				{m.body(
					"upgradeTierModal",
					<div className="row g-3">
						{data.tiers.map((t) => (
							<div className="col-md-4" key={t.key}>
								<button
									type="button"
									className={`${s.tierCard} ${
										m.isPicked("tier", t.key) ||
										(!m.isPicked("tier", "") && t.current)
											? s.tierCardActive
											: ""
									}`}
									onClick={() => m.setPicked("tier", t.key)}
								>
									<div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
										<strong>{t.name}</strong>
										{t.current && (
											<span className={`${s.badge} ${s.badgeP}`}>Current</span>
										)}
									</div>
									<div
										className={s.sv}
										style={{
											fontSize: 18,
											margin: "8px 0",
											color: "var(--pm-primary)",
										}}
									>
										{t.price}
									</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{t.sla}
									</div>
									<ul
										style={{
											fontSize: 11,
											color: "var(--pm-ink-soft)",
											paddingLeft: 16,
											marginTop: 8,
											marginBottom: 0,
										}}
									>
										{t.perks.map((p) => (
											<li key={p}>{p}</li>
										))}
									</ul>
								</button>
							</div>
						))}
					</div>,
				)}
			</MBox>

			{/* ---------------- 4. AI Troubleshooter ---------------- */}
			<MBox
				s={s}
				id="troubleshootingWizardModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-magic" style={{ color: "var(--pm-purple)" }} />
						AI Troubleshooting Wizard
					</>
				}
				footer={
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("submitTicketModal")}
						>
							Still stuck — open a ticket
						</button>
					</>
				}
			>
				<Troubleshooter />
			</MBox>

			{/* ---------------- 5. SLA Report ---------------- */}
			<MBox
				s={s}
				id="viewSlaReportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-file-earmark-bar-graph"
							style={{ color: "var(--pm-accent)" }}
						/>
						Monthly SLA Report
					</>
				}
				footer={m.footer(
					"viewSlaReportModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"viewSlaReportModal",
									"Report generated and downloading...",
								)
							}
						>
							<i className="bi bi-download" /> Download PDF
						</button>,
					),
				)}
			>
				{m.body(
					"viewSlaReportModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Select Month</Lbl>
							<Fld
								s={s}
								as="select"
								options={["June 2026", "May 2026", "April 2026", "March 2026"]}
							/>
						</div>
						{data.slaRows.map((r) => (
							<div key={r.metric} className={s.statusRow}>
								<div style={{ minWidth: 0 }}>
									<strong>{r.metric}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{r.target}
									</div>
								</div>
								<span className={`${s.badge} ${s[r.tone]}`}>{r.actual}</span>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 6. View RCAs ---------------- */}
			<MBox
				s={s}
				id="viewRcaModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-clipboard-check" />
						Post-Incident Reviews (RCAs)
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Date</th>
								<th>Incident</th>
								<th>Impact</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{data.rcas.map((r) => (
								<tr key={r.incident}>
									<td data-label="Date">{r.date}</td>
									<td data-label="Incident">{r.incident}</td>
									<td data-label="Impact">{r.impact}</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[r.tone]}`}>
											{r.status}
										</span>
									</td>
									<td data-label="Action">
										<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
											Read
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 7. Contact TAM ---------------- */}
			<MBox
				s={s}
				id="contactAmModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-person-badge"
							style={{ color: "var(--pm-primary)" }}
						/>
						Contact Technical Account Manager
					</>
				}
				footer={m.footer(
					"contactAmModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"contactAmModal",
									"Message sent to Sarah. She will reply within 4 hours.",
								)
							}
						>
							Send Message
						</button>,
					),
				)}
			>
				{m.body(
					"contactAmModal",
					<>
						<div className="d-flex align-items-center gap-3 mb-3">
							<div
								className={s.iconCircle}
								style={{ background: "var(--pm-gradient-hero)", color: "#fff" }}
							>
								SN
							</div>
							<div>
								<strong>{data.tam.name}</strong>
								<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
									{data.tam.email} · {data.tam.hours}
								</div>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Message Subject</Lbl>
							<Fld s={s} placeholder="What would you like to discuss?" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Message</Lbl>
							<Fld s={s} as="textarea" rows={4} />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 8. Escalation Matrix ---------------- */}
			<MBox
				s={s}
				id="escalationMatrixModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-ladder"
							style={{ color: "var(--pm-warning)" }}
						/>
						Escalation Matrix
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Level</th>
								<th>Role</th>
								<th>Contact</th>
								<th>Response</th>
							</tr>
						</thead>
						<tbody>
							{data.escalation.map((e) => (
								<tr key={e.level}>
									<td data-label="Level">
										<strong>{e.level}</strong>
									</td>
									<td data-label="Role">{e.role}</td>
									<td data-label="Contact">{e.contact}</td>
									<td data-label="Response">
										<span className={`${s.badge} ${s.badgeNeutral}`}>
											{e.responseTime}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 9. SLA Exclusions ---------------- */}
			<MBox
				s={s}
				id="slaExclusionsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-circle"
							style={{ color: "var(--pm-muted)" }}
						/>
						SLA Exclusions
					</>
				}
				footer={m.closeOnly()}
			>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					The following are excluded when calculating monthly SLA credits:
				</p>
				<ul
					style={{ fontSize: 13, color: "var(--pm-ink-soft)", paddingLeft: 18 }}
				>
					{data.slaExclusions.map((x) => (
						<li key={x} style={{ marginBottom: 6 }}>
							{x}
						</li>
					))}
				</ul>
			</MBox>

			{/* ---------------- 10. Maintenance Calendar ---------------- */}
			<MBox
				s={s}
				id="maintenanceCalendarModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-calendar-event"
							style={{ color: "var(--pm-info)" }}
						/>
						Scheduled Maintenance Calendar
					</>
				}
				footer={m.footer(
					"maintenanceCalendarModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"maintenanceCalendarModal",
									"Subscribed to maintenance alerts.",
								)
							}
						>
							Subscribe to Alerts
						</button>
					</>,
				)}
			>
				{m.body(
					"maintenanceCalendarModal",
					<>
						{data.maintenance.map((w) => (
							<div key={w.window} className={s.statusRow}>
								<div style={{ minWidth: 0 }}>
									<strong>{w.service}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{w.window}
									</div>
								</div>
								<span className={`${s.badge} ${s[w.tone]}`}>{w.impact}</span>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 11. Ticket Detail ---------------- */}
			<MBox
				s={s}
				id="ticketDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-ticket-detailed" />
						Ticket: TIC-8821
					</>
				}
				footer={m.footer(
					"ticketDetailModal",
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD} me-auto`}
							onClick={() =>
								m.doAction(
									"ticketDetailModal",
									"Ticket escalated to L3 Platform Engineering.",
								)
							}
						>
							Escalate
						</button>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("ticketDetailModal", "Reply sent successfully.")
							}
						>
							Send Reply
						</button>
					</>,
				)}
			>
				{m.body(
					"ticketDetailModal",
					<>
						<div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
							<div>
								<h6 style={{ fontWeight: 700, margin: 0 }}>
									Webhook payloads dropping occasionally
								</h6>
								<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
									Opened 2 days ago · Webhooks · Assignee: Sarah N.
								</div>
							</div>
							<span className={`${s.badge} ${s.badgeW}`}>Awaiting Reply</span>
						</div>
						<div
							className="p-3 rounded mb-3"
							style={{
								background: "var(--pm-surface-2)",
								maxHeight: 220,
								overflowY: "auto",
							}}
						>
							{[
								[
									"You",
									"About 2% of payment.success events never reach our endpoint.",
								],
								[
									"Sarah N. (PayMo)",
									"Thanks — I can see 14 deliveries timed out at 10s. Can you confirm your endpoint's p99 response time?",
								],
								[
									"You",
									"Our p99 is around 4s, so that shouldn't be the trigger.",
								],
							].map(([who, text]) => (
								<div key={text} className="mb-2">
									<div style={{ fontSize: 11, fontWeight: 700 }}>{who}</div>
									<div style={{ fontSize: 13 }}>{text}</div>
								</div>
							))}
						</div>
						<div className="mb-3">
							<Lbl s={s}>Reply</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={3}
								placeholder="Type your reply…"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 12. Incident History ---------------- */}
			<MBox
				s={s}
				id="incidentHistoryModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-clock-history" />
						Incident History
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("viewRcaModal")}
						>
							View RCAs
						</button>
						{m.closeOnly()}
					</>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Incident ID</th>
								<th>Date</th>
								<th>Severity</th>
								<th>Description</th>
								<th>Duration</th>
							</tr>
						</thead>
						<tbody>
							{data.incidents.map((i) => (
								<tr key={i.id}>
									<td data-label="Incident ID">
										<code>{i.id}</code>
									</td>
									<td data-label="Date">{i.date}</td>
									<td data-label="Severity">
										<span className={`${s.badge} ${s[i.tone]}`}>
											{i.severity}
										</span>
									</td>
									<td data-label="Description">{i.description}</td>
									<td data-label="Duration">{i.duration}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 13. Community Forum ---------------- */}
			<MBox
				s={s}
				id="communityForumModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-people" style={{ color: "var(--pm-info)" }} />
						Developer Community Forum
					</>
				}
				footer={m.footer(
					"communityForumModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"communityForumModal",
									"Your question has been posted to the forum.",
								)
							}
						>
							Ask a Question
						</button>
					</>,
				)}
			>
				{m.body(
					"communityForumModal",
					<>
						<Fld s={s} placeholder="Search the forum..." className="mb-3" />
						{data.forumThreads.map((t) => (
							<div key={t.title} className={s.statusRow}>
								<div style={{ minWidth: 0 }}>
									<strong style={{ fontSize: 13 }}>{t.title}</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										by {t.author} · {t.replies} replies
									</div>
								</div>
								<span className={`${s.badge} ${s[t.tone]}`}>{t.tag}</span>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ---------------- 14. Slack Integration ---------------- */}
			<MBox
				s={s}
				id="slackIntegrationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-slack" style={{ color: "var(--pm-purple)" }} />
						Setup Dedicated Slack Channel
					</>
				}
				footer={m.footer(
					"slackIntegrationModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("upgradeTierModal")}
						>
							Upgrade to Enterprise
						</button>
					</>,
				)}
			>
				{m.body(
					"slackIntegrationModal",
					<>
						<div className={`${s.note} ${s.noteWarn} mb-3`}>
							<i className="bi bi-lock me-1" /> Shared Slack Connect channels
							are an Enterprise tier benefit.
						</div>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Enterprise customers get a private Slack Connect channel staffed
							by PayMo engineers 24/7, with a 15-minute acknowledgement target
							for SEV1 issues.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Your Slack Workspace</Lbl>
							<Fld s={s} placeholder="company.slack.com" disabled />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 15. Architecture Review ---------------- */}
			<MBox
				s={s}
				id="requestArchitectureReviewModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-diagram-3"
							style={{ color: "var(--pm-info)" }}
						/>
						Request Architecture Review
					</>
				}
				footer={m.footer(
					"requestArchitectureReviewModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"requestArchitectureReviewModal",
									"Review session requested. An invite will be sent shortly.",
								)
							}
						>
							Request Session
						</button>,
					),
				)}
			>
				{m.body(
					"requestArchitectureReviewModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Main Topic / Focus Area</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Scaling for peak load",
									"Webhook reliability",
									"Idempotency & retries",
									"Security & key management",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Preferred Date & Time</Lbl>
							<Fld
								s={s}
								type="datetime-local"
								defaultValue="2026-07-10T10:00"
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Attendees (Emails)</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={2}
								placeholder="one email per line"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 16. QBR ---------------- */}
			<MBox
				s={s}
				id="quarterlyBusinessReviewModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-calendar-check"
							style={{ color: "var(--pm-warning)" }}
						/>
						Schedule QBR
					</>
				}
				footer={m.footer(
					"quarterlyBusinessReviewModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"quarterlyBusinessReviewModal",
									"QBR Scheduling request sent to your TAM.",
								)
							}
						>
							Request QBR
						</button>,
					),
				)}
			>
				{m.body(
					"quarterlyBusinessReviewModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Preferred Week</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Week of 05 Oct", "Week of 12 Oct", "Week of 19 Oct"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Discussion Points to Add</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={4}
								placeholder="Volume forecast, new products, SLA performance…"
							/>
						</div>
						<Chk label="Include a technical deep-dive session" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 17. Status Page Subscribe ---------------- */}
			<MBox
				s={s}
				id="statusPageSubscribeModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-activity"
							style={{ color: "var(--pm-accent)" }}
						/>
						Status Page Notifications
					</>
				}
				footer={m.footer(
					"statusPageSubscribeModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"statusPageSubscribeModal",
									"Status page subscription updated successfully.",
								)
							}
						>
							Save Subscription
						</button>,
					),
				)}
			>
				{m.body(
					"statusPageSubscribeModal",
					<>
						<Chk label="Email me on incidents" defaultChecked />
						<Chk label="Email me on scheduled maintenance" defaultChecked />
						<Chk label="SMS for SEV1 only" />
						<div className="mb-3 mt-3">
							<Lbl s={s}>Webhook URL for Status Updates</Lbl>
							<Fld
								s={s}
								type="url"
								mono
								placeholder="https://hooks.slack.com/services/…"
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 18. Custom Integration ---------------- */}
			<MBox
				s={s}
				id="customIntegrationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-tools" style={{ color: "var(--pm-primary)" }} />
						Custom Integration Assistance
					</>
				}
				footer={m.footer(
					"customIntegrationModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"customIntegrationModal",
									"Request received. A solutions engineer will reach out within 2 business days.",
								)
							}
						>
							Request Assistance
						</button>,
					),
				)}
			>
				{m.body(
					"customIntegrationModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Our solutions engineers can build or review a bespoke integration
							— legacy core banking bridges, custom reconciliation, or
							high-volume batch flows.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Integration Type</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Legacy core banking bridge",
									"Custom reconciliation pipeline",
									"High-volume batch processing",
									"Other",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Describe your requirement</Lbl>
							<Fld s={s} as="textarea" rows={4} />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 19. Uptime Methodology ---------------- */}
			<MBox
				s={s}
				id="uptimeCalcMethodologyModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calculator" />
						Uptime Calculation Methodology
					</>
				}
				footer={m.closeOnly()}
			>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					Monthly uptime is measured per API family from synthetic probes fired
					every 30 seconds from three independent regions.
				</p>
				<div className={`${s.note} ${s.noteMuted} mb-3`}>
					<code>
						Uptime % = (Total minutes − Downtime minutes) / Total minutes × 100
					</code>
				</div>
				<h6 style={{ fontWeight: 700 }}>What counts as downtime</h6>
				<ul
					style={{ fontSize: 13, color: "var(--pm-ink-soft)", paddingLeft: 18 }}
				>
					<li>Two consecutive failed probes from at least two regions</li>
					<li>HTTP 5xx rate above 5% sustained for 60 seconds</li>
					<li>p95 latency above 10× the published target for 5 minutes</li>
				</ul>
				<h6 style={{ fontWeight: 700 }}>SLA credits</h6>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Monthly Uptime</th>
								<th>Credit</th>
							</tr>
						</thead>
						<tbody>
							{[
								["< 99.9% but ≥ 99.0%", "10% of monthly fee"],
								["< 99.0% but ≥ 95.0%", "25% of monthly fee"],
								["< 95.0%", "50% of monthly fee"],
							].map(([u, cr]) => (
								<tr key={u}>
									<td data-label="Monthly Uptime">{u}</td>
									<td data-label="Credit">{cr}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 20. On-Site Support ---------------- */}
			<MBox
				s={s}
				id="onSiteSupportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-geo-alt"
							style={{ color: "var(--pm-danger)" }}
						/>
						On-Site Support
					</>
				}
				footer={m.footer(
					"onSiteSupportModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("upgradeTierModal")}
						>
							Upgrade to Enterprise
						</button>
					</>,
				)}
			>
				{m.body(
					"onSiteSupportModal",
					<>
						<div className={`${s.note} ${s.noteWarn} mb-3`}>
							<i className="bi bi-lock me-1" /> On-site engineering visits are
							an Enterprise tier benefit.
						</div>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Enterprise customers can request an engineer on-site in Nairobi,
							Mombasa or Kisumu for go-live support, migration weekends, or
							incident command.
						</p>
						<div className={s.statusRow}>
							<span>Lead time</span>
							<strong>5 business days</strong>
						</div>
						<div className={s.statusRow}>
							<span>Included visits</span>
							<strong>2 per year</strong>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 21. Manage Support Contacts ---------------- */}
			<MBox
				s={s}
				id="manageSupportContactsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-lines-fill" />
						Manage Support Contacts
					</>
				}
				footer={m.footer(
					"manageSupportContactsModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"manageSupportContactsModal",
									"Support contacts updated.",
								)
							}
						>
							Save Contacts
						</button>
					</>,
				)}
			>
				{m.body(
					"manageSupportContactsModal",
					<>
						{data.contacts.map((ct) => (
							<div key={ct.email} className={s.statusRow}>
								<div style={{ minWidth: 0 }}>
									<strong>{ct.name}</strong>
									{ct.primary && (
										<span className={`${s.badge} ${s.badgeP} ms-2`}>
											Primary
										</span>
									)}
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										{ct.email} · {ct.role}
									</div>
								</div>
								<button type="button" className={`${s.btnPm} ${s.btnSm}`}>
									Edit
								</button>
							</div>
						))}
						<div className="mt-3">
							<Lbl s={s}>Add a contact</Lbl>
							<div className="d-flex gap-2">
								<Fld s={s} type="email" placeholder="name@company.com" />
								<button type="button" className={`${s.btnPm} ${s.btnPmP}`}>
									Add
								</button>
							</div>
						</div>
						<Sw label="Notify all contacts on SEV1 incidents" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 22. Live Chat ---------------- */}
			<MBox
				s={s}
				id="chatSupportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-chat-dots"
							style={{ color: "var(--pm-primary)" }}
						/>
						Live Chat Support
					</>
				}
				footer={
					<>
						{m.closeOnly("End Chat")}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("submitTicketModal")}
						>
							Convert to Ticket
						</button>
					</>
				}
			>
				<ChatPanel />
			</MBox>
		</>
	);
}
