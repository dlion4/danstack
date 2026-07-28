/* ============================================================================
 * 4.10 API Governance & Roadmap — all 21 modals.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextReleaseStep() (4 steps, loading gate at 3) -> m.step/go/confirmStep
 *   nextDepStep()     (4 steps, loading gate at 3) -> same
 *   selectRadioCard(card) (mutated borderColor + radio.checked) -> m.PickBox
 *   switchTab('migTab', …)                          -> m.Tabs
 *   openModal() closing any '.modal.show' first     -> single-active-modal state
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
import type { ApiGovernanceContent } from "../data/apiGovernanceData";
import styles from "../styles/apiGovernance.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: ApiGovernanceContent;
}

export default function ApiGovernanceModals({
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

	const relStep = m.step("publishReleaseModal");
	const depStep = m.step("deprecateVersionModal");

	return (
		<>
			{/* ---------------- 1. Publish Release (4-step) ---------------- */}
			<MBox
				s={s}
				id="publishReleaseModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-rocket-takeoff" style={{ color: "var(--pm-primary)" }} />
						Publish API Release
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{relStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("publishReleaseModal", relStep + 1)}
							>
								Next Step <i className="bi bi-arrow-right" />
							</button>
						)}
						{relStep === 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("publishReleaseModal", 4)}
							>
								Publish <i className="bi bi-rocket" />
							</button>
						)}
						{relStep >= 4 && (
							<button type="button" className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>
								Done
							</button>
						)}
					</>
				}
			>
				{m.busy === "publishReleaseModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Details", "Changelog", "Notify", "Done"]}
							current={relStep}
						/>
						{relStep === 1 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Version Number (Semantic)</Lbl>
									<Fld s={s} mono defaultValue="v2.5.0" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Release Type</Lbl>
									<Fld
										s={s}
										as="select"
										options={[
											"Minor (backward compatible)",
											"Patch (bug fixes only)",
											"Major (breaking changes)",
										]}
									/>
								</div>
								<div className={`${s.note} ${s.noteInfo}`}>
									<i className="bi bi-info-circle me-1" /> Semantic versioning is enforced.
									A major bump requires a 6-month deprecation notice for the prior version.
								</div>
							</>
						)}
						{relStep === 2 && (
							<div className="mb-3">
								<Lbl s={s}>Changelog Notes (Markdown)</Lbl>
								<Fld
									s={s}
									as="textarea"
									rows={8}
									mono
									defaultValue={`### Added
- Bulk disbursement endpoint

### Fixed
- Pagination cursor stability`}
								/>
							</div>
						)}
						{relStep === 3 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Developer Notification</Lbl>
									<Chk label="Email all registered developers" defaultChecked />
									<Chk label="Post to the changelog RSS feed" defaultChecked />
									<Chk label="Announce in the community Slack" />
								</div>
								<div className={`${s.note} ${s.noteWarn}`}>
									<i className="bi bi-exclamation-triangle me-1" /> Publishing is
									irreversible. The spec will be frozen and served from the gateway
									immediately.
								</div>
							</>
						)}
						{relStep >= 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									Release Published
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									v2.5.0 is live on the gateway and developers have been notified.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 2. Deprecate Version (4-step) ---------------- */}
			<MBox
				s={s}
				id="deprecateVersionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calendar-x" style={{ color: "var(--pm-warning)" }} />
						Deprecate API Version
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{depStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("deprecateVersionModal", depStep + 1)}
							>
								Next Step <i className="bi bi-arrow-right" />
							</button>
						)}
						{depStep === 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmW}`}
								onClick={() => m.confirmStep("deprecateVersionModal", 4)}
							>
								Schedule Deprecation
							</button>
						)}
						{depStep >= 4 && (
							<button type="button" className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>
								Done
							</button>
						)}
					</>
				}
			>
				{m.busy === "deprecateVersionModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Version", "Dates", "Actions", "Done"]}
							current={depStep}
						/>
						{depStep === 1 && (
							<div className="mb-3">
								<Lbl s={s}>Select Version to Deprecate</Lbl>
								<Fld s={s} as="select" options={data.versionOptions} />
							</div>
						)}
						{depStep === 2 && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Sunset Date (Minimum 6 months)</Lbl>
									<Fld s={s} type="date" defaultValue="2026-12-31" />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Replacement Version</Lbl>
									<Fld s={s} as="select" options={["v2.4.1 (Current)", "v3.0.0-beta"]} />
								</div>
							</>
						)}
						{depStep === 3 && (
							<div className="mb-3">
								<Lbl s={s}>Automated Actions</Lbl>
								<Chk label="Emit Sunset + Deprecation response headers" defaultChecked />
								<Chk label="Email affected consumers monthly" defaultChecked />
								<Chk label="Show a banner in the developer portal" defaultChecked />
								<Chk label="Block new API key creation for this version" />
							</div>
						)}
						{depStep >= 4 && (
							<div className={s.receipt}>
								<div className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
									Deprecation Scheduled
								</h5>
								<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
									Sunset headers are now active. Consumers will be notified monthly.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 3. Migration Guides ---------------- */}
			<MBox
				s={s}
				id="migrationGuideModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-journal-code" style={{ color: "var(--pm-info)" }} />
						Migration Guides
					</>
				}
				footer={m.closeOnly()}
			>
				<m.Tabs
					k="migTab"
					def="v1v2"
					opts={[
						{ v: "v1v2", label: "v1 → v2" },
						{ v: "v2v3", label: "v2 → v3 (beta)" },
					]}
				/>
				{m.tab("migTab", "v1v2") === "v1v2" ? (
					<>
						<h6 style={{ fontWeight: 700 }}>Breaking changes</h6>
						<ul style={{ fontSize: 13, color: "var(--pm-ink-soft)", paddingLeft: 18 }}>
							<li>
								<code className={s.codeInline}>receipt_number</code> replaced by{" "}
								<code className={s.codeInline}>transaction_ref</code>
							</li>
							<li>
								<code className={s.codeInline}>bank_code</code> is now required on bank
								disbursements
							</li>
							<li>Cursor-based pagination replaces page/offset</li>
						</ul>
						<CodeBox s={s}>
							{`- POST /v1/charges       { "receipt_number": "..." }
+ POST /v2/collections   { "transaction_ref": "..." }`}
						</CodeBox>
					</>
				) : (
					<>
						<h6 style={{ fontWeight: 700 }}>What's new in v3</h6>
						<ul style={{ fontSize: 13, color: "var(--pm-ink-soft)", paddingLeft: 18 }}>
							<li>GraphQL endpoint at <code className={s.codeInline}>/v3/graphql</code></li>
							<li>gRPC streaming for high-throughput ledger sync</li>
							<li>Idempotency keys enforced on all mutations</li>
						</ul>
						<CodeBox s={s}>
							{`query { balance(currency: "KES") { available pending } }`}
						</CodeBox>
					</>
				)}
			</MBox>

			{/* ---------------- 4. Changelog Detail ---------------- */}
			<MBox
				s={s}
				id="changelogDetailModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-list-stars" />
						Release Notes: v2.4.1
					</>
				}
				footer={
					<>
						<button
							type="button"
							className={`${s.btnPm} ${s.btnSm}`}
							onClick={() => chain("migrationGuideModal")}
						>
							Migration Guide
						</button>
						{m.closeOnly()}
					</>
				}
			>
				{data.changelog.map((c) => (
					<div key={c.text} className="d-flex gap-2 mb-2 align-items-start">
						<span className={`${s.badge} ${s[c.tone]}`} style={{ flexShrink: 0 }}>
							{c.type}
						</span>
						<span style={{ fontSize: 13 }}>{c.text}</span>
					</div>
				))}
			</MBox>

			{/* ---------------- 5. Run Linter ---------------- */}
			<MBox
				s={s}
				id="runLinterModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bug" style={{ color: "var(--pm-warning)" }} />
						API Governance Linter
					</>
				}
				footer={m.footer(
					"runLinterModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("runLinterModal", "Lint run complete. Report sent to CI.")
							}
						>
							Re-run Linter
						</button>
					</>,
				)}
			>
				{m.body(
					"runLinterModal",
					<>
						<div className={`${s.note} ${s.noteWarn} mb-3`}>
							<i className="bi bi-exclamation-triangle me-1" />{" "}
							{data.linterFindings.length} findings across the current spec.
						</div>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Rule</th>
										<th>Severity</th>
										<th>Path</th>
										<th>Message</th>
									</tr>
								</thead>
								<tbody>
									{data.linterFindings.map((f) => (
										<tr key={f.rule}>
											<td data-label="Rule">
												<code>{f.rule}</code>
											</td>
											<td data-label="Severity">
												<span className={`${s.badge} ${s[f.tone]}`}>{f.severity}</span>
											</td>
											<td data-label="Path">
												<code>{f.path}</code>
											</td>
											<td data-label="Message">{f.message}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 6. Export Spec ---------------- */}
			<MBox
				s={s}
				id="exportSpecModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download" style={{ color: "var(--pm-primary)" }} />
						Export API Specification
					</>
				}
				footer={m.footer(
					"exportSpecModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("exportSpecModal", "Specification downloaded successfully.")
							}
						>
							Download
						</button>,
					),
				)}
			>
				{m.body(
					"exportSpecModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Select API Version</Lbl>
							<Fld s={s} as="select" options={data.versionOptions} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Export Format</Lbl>
							<Fld s={s} as="select" options={data.specFormats} />
						</div>
						<Chk label="Include deprecated endpoints" />
						<Chk label="Include example payloads" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 7. Submit Feature Request ---------------- */}
			<MBox
				s={s}
				id="submitFeatureModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-lightbulb" style={{ color: "var(--pm-warning)" }} />
						Submit Feature Request
					</>
				}
				footer={m.footer(
					"submitFeatureModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("submitFeatureModal", "Feature request submitted for review!")
							}
						>
							Submit Request
						</button>,
					),
				)}
			>
				{m.body(
					"submitFeatureModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Feature Title</Lbl>
							<Fld s={s} placeholder="e.g. Webhook replay API" />
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<Lbl s={s}>Category</Lbl>
								<Fld
									s={s}
									as="select"
									options={["API Design", "SDKs", "Webhooks", "Payments", "Tooling", "Docs"]}
								/>
							</div>
							<div className="col-md-6">
								<Lbl s={s}>Business Priority</Lbl>
								<Fld
									s={s}
									as="select"
									options={["Nice to have", "Important", "Blocking our launch"]}
								/>
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Use Case / Problem Statement</Lbl>
							<Fld s={s} as="textarea" rows={3} placeholder="What problem does this solve?" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Proposed Solution (Optional)</Lbl>
							<Fld s={s} as="textarea" rows={2} placeholder="How might it work?" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 8. Feature Detail & Vote ---------------- */}
			<MBox
				s={s}
				id="featureDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-chat-square-text" style={{ color: "var(--pm-purple)" }} />
						Feature Request
					</>
				}
				footer={m.footer(
					"featureDetailModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("featureDetailModal", "Your vote has been recorded. Thank you!")
							}
						>
							<i className="bi bi-arrow-up" /> Upvote
						</button>
					</>,
				)}
			>
				{m.body(
					"featureDetailModal",
					<>
						<div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
							<div>
								<h5 style={{ fontWeight: 700, margin: 0 }}>GraphQL API Support</h5>
								<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
									Submitted by 24 organisations · API Design
								</div>
							</div>
							<span className={`${s.badge} ${s.badgeP}`}>Under Review</span>
						</div>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Mobile clients over-fetch on the REST balance and transaction endpoints. A
							GraphQL layer would let each screen request exactly the fields it needs,
							cutting payload size and battery use on low-end Android devices.
						</p>
						<div className={`${s.note} ${s.noteMuted} mb-3`}>
							<strong>PayMo response:</strong> On the v3 roadmap. A closed beta is planned
							for Q4 2026 alongside the gRPC ledger stream.
						</div>
						<div className={s.statusRow}>
							<span>Current votes</span>
							<strong>89</strong>
						</div>
						<div className={s.statusRow}>
							<span>Target release</span>
							<strong>v3.0.0</strong>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 9. Roadmap Item ---------------- */}
			<MBox
				s={s}
				id="roadmapItemModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-map" style={{ color: "var(--pm-info)" }} />
						Roadmap Details
					</>
				}
				footer={m.footer(
					"roadmapItemModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"roadmapItemModal",
									"You are now following this roadmap item. You will be notified of changes.",
								)
							}
						>
							Follow Item
						</button>
					</>,
				)}
			>
				{m.body(
					"roadmapItemModal",
					<>
						<div className={s.statusRow}>
							<span>Target quarter</span>
							<span className={`${s.badge} ${s.badgeI}`}>Q3 2026</span>
						</div>
						<div className={s.statusRow}>
							<span>Status</span>
							<strong>In design</strong>
						</div>
						<div className={s.statusRow}>
							<span>Owner</span>
							<strong>Platform Team</strong>
						</div>
						<div className="mt-3">
							<Lbl s={s}>Progress</Lbl>
							<div className={s.progress}>
								<div
									className={s.progressBar}
									style={{ width: "15%", background: "var(--pm-info)" }}
								/>
							</div>
						</div>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)", marginTop: 12 }}>
							Follow this item to receive an email whenever the status, scope or target
							quarter changes.
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 10. Enroll Beta ---------------- */}
			<MBox
				s={s}
				id="enrollBetaModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-flask" style={{ color: "var(--pm-purple)" }} />
						Join Beta Program
					</>
				}
				footer={m.footer(
					"enrollBetaModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"enrollBetaModal",
									"Successfully enrolled in Beta! Credentials have been sent to your email.",
								)
							}
						>
							Enroll
						</button>,
					),
				)}
			>
				{m.body(
					"enrollBetaModal",
					<>
						<div className={`${s.note} ${s.noteInfo} mb-3`}>
							<strong>v3.0.0-beta</strong>
							<div style={{ fontSize: 12 }}>GraphQL + gRPC · 2% adoption</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Select Sandbox Environment</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Sandbox — Test Env", "Staging — Pre-prod mirror"]}
							/>
						</div>
						<Chk
							label="I accept that beta APIs may introduce breaking changes without notice."
							defaultChecked
						/>
					</>,
				)}
			</MBox>

			{/* ---------------- 11. Performance Benchmarks ---------------- */}
			<MBox
				s={s}
				id="performanceBenchmarkModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-speedometer2" style={{ color: "var(--pm-primary)" }} />
						API Performance Benchmarks
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Service</th>
								<th>Throughput (TPS)</th>
								<th>Error Rate</th>
								<th>Uptime (30d)</th>
							</tr>
						</thead>
						<tbody>
							{data.benchmarks.map((b) => (
								<tr key={b.service}>
									<td data-label="Service">
										<strong>{b.service}</strong>
									</td>
									<td data-label="Throughput">{b.throughput}</td>
									<td data-label="Error Rate">{b.errorRate}</td>
									<td data-label="Uptime">{b.uptime}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 12. Configure Deprecation Headers ---------------- */}
			<MBox
				s={s}
				id="configureDeprecationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-sliders" style={{ color: "var(--pm-warning)" }} />
						Configure Deprecation Headers
					</>
				}
				footer={m.footer(
					"configureDeprecationModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"configureDeprecationModal",
									"Headers applied immediately to API Gateway.",
								)
							}
						>
							Apply Headers
						</button>,
					),
				)}
			>
				{m.body(
					"configureDeprecationModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Sunset Date/Time</Lbl>
							<Fld s={s} type="datetime-local" defaultValue="2026-12-31T23:59" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Link Header (URI to migration guide)</Lbl>
							<Fld s={s} mono defaultValue="https://docs.paymo.com/migrate/v1-to-v2" />
						</div>
						<Sw label="Emit Deprecation: true header" defaultChecked />
						<CodeBox s={s} copy={false} style={{ marginTop: 12 }}>
							{`Deprecation: true
Sunset: Thu, 31 Dec 2026 23:59:00 GMT
Link: <https://docs.paymo.com/migrate/v1-to-v2>; rel="deprecation"`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 13. Broadcast Breaking Change ---------------- */}
			<MBox
				s={s}
				id="broadcastChangeModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-broadcast" style={{ color: "var(--pm-danger)" }} />
						Broadcast Breaking Change Notice
					</>
				}
				footer={m.footer(
					"broadcastChangeModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"broadcastChangeModal",
									"Emails queued for delivery. Compliance log updated.",
								)
							}
						>
							Send Broadcast
						</button>,
					),
				)}
			>
				{m.body(
					"broadcastChangeModal",
					<>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<Lbl s={s}>Target Audience</Lbl>
								<Fld
									s={s}
									as="select"
									options={[
										"All registered developers",
										"v1 consumers only",
										"Enterprise partners only",
									]}
								/>
							</div>
							<div className="col-md-6">
								<Lbl s={s}>Notice Period</Lbl>
								<Fld s={s} as="select" options={["30 days", "90 days", "180 days"]} />
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Subject Line</Lbl>
							<Fld s={s} defaultValue="Action required: PayMo API v1 sunset" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Email Body (Markdown)</Lbl>
							<Fld
								s={s}
								as="textarea"
								rows={5}
								defaultValue="We are retiring API v1 on 31 Dec 2026. Please migrate to v2..."
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 14. Governance Audit ---------------- */}
			<MBox
				s={s}
				id="apiGovernanceAuditModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield-check" style={{ color: "var(--pm-accent)" }} />
						Governance Compliance Checklist
					</>
				}
				footer={m.footer(
					"apiGovernanceAuditModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("apiGovernanceAuditModal", "Audit report exported as PDF.")
							}
						>
							<i className="bi bi-download" /> Export Report
						</button>
					</>,
				)}
			>
				{m.body(
					"apiGovernanceAuditModal",
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Rule</th>
									<th>Description</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{data.auditRules.map((r) => (
									<tr key={r.rule}>
										<td data-label="Rule">
											<code>{r.rule}</code>
										</td>
										<td data-label="Description">{r.description}</td>
										<td data-label="Status">
											<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ---------------- 15. Test Automation Config ---------------- */}
			<MBox
				s={s}
				id="testAutomationConfigModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear-wide-connected" style={{ color: "var(--pm-info)" }} />
						Test Automation & CI/CD
					</>
				}
				footer={m.footer(
					"testAutomationConfigModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("testAutomationConfigModal", "CI/CD hooks updated successfully.")
							}
						>
							Save Config
						</button>,
					),
				)}
			>
				{m.body(
					"testAutomationConfigModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Contract Testing Framework</Lbl>
							<Fld s={s} as="select" options={["Pact", "Dredd", "Schemathesis", "Custom"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Trigger tests on</Lbl>
							<Chk label="Every spec commit" defaultChecked />
							<Chk label="Pre-release only" />
							<Chk label="Nightly schedule" defaultChecked />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Webhook URL for test results</Lbl>
							<Fld s={s} type="url" mono placeholder="https://ci.company.com/hooks/paymo" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 16. SDK Generation ---------------- */}
			<MBox
				s={s}
				id="sdkGenerationModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-box-seam" style={{ color: "var(--pm-primary)" }} />
						Generate Client SDKs
					</>
				}
				footer={m.footer(
					"sdkGenerationModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"sdkGenerationModal",
									"SDK generation initiated. You will receive an email when completed.",
								)
							}
						>
							Generate SDKs
						</button>,
					),
				)}
			>
				{m.body(
					"sdkGenerationModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Target Version</Lbl>
							<Fld s={s} as="select" options={data.versionOptions} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Languages / Frameworks</Lbl>
							<div className="row g-1">
								{data.sdkLanguages.map((l, i) => (
									<div className="col-sm-6" key={l}>
										<Chk label={l} defaultChecked={i < 3} />
									</div>
								))}
							</div>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Publishing Action</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Download as ZIP only",
									"Publish to package registries",
									"Open a PR on the SDK repos",
								]}
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 17. Developer Alerts ---------------- */}
			<MBox
				s={s}
				id="developerAlertsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" />
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
				<div style={{ maxHeight: 420, overflowY: "auto" }}>
					{data.alerts.map((a) => (
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

			{/* ---------------- 18. Profile ---------------- */}
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
								<span style={{ color: "var(--pm-muted)" }}>Owned APIs</span>
								<br />
								<strong>3 versions</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Compliance</span>
								<br />
								<strong>98.5%</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ---------------- 19. Health Check ---------------- */}
			<MBox
				s={s}
				id="healthCheckModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-activity" style={{ color: "var(--pm-accent)" }} />
						System Status
					</>
				}
				footer={m.closeOnly()}
			>
				<div className={`${s.note} ${s.noteSuccess} text-center mb-3`}>
					<i className="bi bi-check-circle-fill me-1" /> All Systems Operational
				</div>
				{data.statusServices.map((r) => (
					<div key={r.name} className={s.statusRow}>
						<div style={{ minWidth: 0 }}>
							<strong>{r.name}</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{r.sub}</div>
						</div>
						<span className={`${s.badge} ${s[r.tone]}`}>{r.status}</span>
					</div>
				))}
			</MBox>

			{/* ---------------- 20. All Feature Requests ---------------- */}
			<MBox
				s={s}
				id="featureListModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-list-ul" />
						All Feature Requests
					</>
				}
				footer={
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => chain("submitFeatureModal")}
						>
							<i className="bi bi-plus-lg" /> Submit Idea
						</button>
					</>
				}
			>
				<Fld s={s} placeholder="Search requests..." className="mb-3" />
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Votes</th>
								<th>Feature</th>
								<th>Category</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data.featureRequests.map((f) => (
								<tr key={f.feature}>
									<td data-label="Votes">
										<strong>{f.votes}</strong>
									</td>
									<td data-label="Feature">{f.feature}</td>
									<td data-label="Category">{f.category}</td>
									<td data-label="Status">
										<span className={`${s.badge} ${s[f.tone]}`}>{f.status}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ---------------- 21. Version Actions ---------------- */}
			<MBox
				s={s}
				id="versionActionModal"
				active={active}
				size="sm"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-three-dots-vertical" />
						Version Actions
					</>
				}
				footer={m.closeOnly()}
			>
				<div className="d-flex flex-column gap-2">
					{[
						["Publish new release", "bi-rocket-takeoff", "publishReleaseModal"],
						["Deprecate a version", "bi-calendar-x", "deprecateVersionModal"],
						["Configure sunset headers", "bi-sliders", "configureDeprecationModal"],
						["Broadcast breaking change", "bi-broadcast", "broadcastChangeModal"],
						["Export specification", "bi-download", "exportSpecModal"],
					].map(([label, icon, modal]) => (
						<button
							key={label}
							type="button"
							className={`${s.btnPm} w-100`}
							style={{ justifyContent: "flex-start" }}
							onClick={() => chain(modal)}
						>
							<i className={`bi ${icon}`} /> {label}
						</button>
					))}
				</div>
			</MBox>
		</>
	);
}
