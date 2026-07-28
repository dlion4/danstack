/* ============================================================================
 * 4.7 Integration Architecture — all 25 modals.
 * ----------------------------------------------------------------------------
 * Legacy -> React mapping:
 *   nextBoilerStep()  (4 steps, loading gate at 3) -> m.step/go/confirmStep
 *   nextSoapStep()    (3 steps, loading gate at 2) -> m.step/go/confirmStep
 *   selectCardOption(el) (mutated el.style.borderColor) -> m.PickBox state
 *   switchTab('simTab'|'checkTab', …)               -> m.Tabs
 *   document.getElementById('simResp').style.display='block' -> local state
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
import type { IntegrationArchitectureContent } from "../data/integrationArchitectureData";
import styles from "../styles/integrationArchitecture.module.css";

const s = styles as Record<string, string>;

interface Props {
	active: string | null;
	onClose: () => void;
	/** Present for API symmetry with the other pages; 4.7 has no chained modals. */
	onOpen?: (id: string) => void;
	data: IntegrationArchitectureContent;
}

/** REST tab of the Integration Simulator — replaces the inline style.display hack. */
function RestSimulator() {
	const [sent, setSent] = useState(false);
	return (
		<>
			<div className="mb-3">
				<Lbl s={s}>Endpoint</Lbl>
				<div className="d-flex gap-2">
					<Fld s={s} as="select" options={["POST", "GET"]} style={{ width: 100 }} />
					<Fld s={s} mono defaultValue="https://sandbox.paymo.com/v1/payments" />
				</div>
			</div>
			<div className="mb-3">
				<Lbl s={s}>Payload</Lbl>
				<Fld
					s={s}
					as="textarea"
					rows={4}
					mono
					defaultValue={`{"amount": 500, "currency": "KES", "msisdn": "254712345678"}`}
				/>
			</div>
			<button
				type="button"
				className={`${s.btnPm} ${s.btnPmP} ${s.btnSm}`}
				onClick={() => setSent(true)}
			>
				Send Request
			</button>
			{sent && (
				<CodeBox s={s} copy={false} style={{ marginTop: 12 }}>
					{`{
  "status": "success",
  "transaction_id": "TXN_SIM_001",
  "message": "Payment initiated"
}`}
				</CodeBox>
			)}
		</>
	);
}

export default function IntegrationArchitectureModals({
	active,
	onClose,
	data,
}: Props) {
	const m = useModals(s, active, onClose);
	const boilerStep = m.step("boilerplateModal");
	const soapStep = m.step("soapTranslatorModal");

	return (
		<>
			{/* ---------------- 1. Architecture Guide ---------------- */}
			<MBox
				s={s}
				id="archGuideModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download" style={{ color: "var(--pm-primary)" }} />
						Download Architecture Guide
					</>
				}
				footer={m.footer(
					"archGuideModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("archGuideModal", "Guide generated successfully! Downloading...")
							}
						>
							Download Package
						</button>,
					),
				)}
			>
				{m.body(
					"archGuideModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Select the architecture topology document tailored for your enterprise.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Format</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"PDF Document",
									"Draw.io Diagram",
									"Lucidchart XML",
									"AWS/Azure Architecture Maps",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Include Sections</Lbl>
							<Chk label="API Data Flow" defaultChecked />
							<Chk label="Security & Authentication" defaultChecked />
							<Chk label="Failover Strategies" defaultChecked />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 2. Generate Boilerplate (4-step) ---------------- */}
			<MBox
				s={s}
				id="boilerplateModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-code-slash" style={{ color: "var(--pm-info)" }} />
						Generate Boilerplate Code
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{boilerStep < 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("boilerplateModal", boilerStep + 1)}
							>
								Next Step <i className="bi bi-arrow-right" />
							</button>
						)}
						{boilerStep === 3 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("boilerplateModal", 4)}
							>
								Generate <i className="bi bi-gear" />
							</button>
						)}
						{boilerStep >= 4 && (
							<button type="button" className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>
								<i className="bi bi-download" /> Download Zip
							</button>
						)}
					</>
				}
			>
				{m.busy === "boilerplateModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper
							s={s}
							labels={["Stack", "Arch", "Features", "Ready"]}
							current={boilerStep}
						/>
						{boilerStep === 1 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 1: Core Stack</h6>
								<div className="row g-2 mt-2">
									{data.stacks.map((st) => (
										<div className="col-4" key={st.key}>
											<m.PickBox k="stack" v={st.key} className="text-center h-100">
												<i
													className={`bi ${st.icon} d-block mb-1`}
													style={{ fontSize: 24, color: st.color }}
												/>
												<strong>{st.label}</strong>
											</m.PickBox>
										</div>
									))}
								</div>
							</>
						)}
						{boilerStep === 2 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 2: Architecture Type</h6>
								<div className="mb-3 mt-3">
									<Lbl s={s}>Deployment Style</Lbl>
									<Fld s={s} as="select" options={data.boilerplateOptions.deployment} />
								</div>
								<div className="mb-3">
									<Lbl s={s}>Database Connector</Lbl>
									<Fld s={s} as="select" options={data.boilerplateOptions.database} />
								</div>
							</>
						)}
						{boilerStep === 3 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 3: Features & Auth</h6>
								<div className="mt-3">
									{data.boilerplateOptions.features.map((f) => (
										<Chk key={f.label} label={f.label} defaultChecked={f.on} />
									))}
								</div>
							</>
						)}
						{boilerStep >= 4 && (
							<div className="text-center py-4">
								<i
									className="bi bi-box-seam"
									style={{ fontSize: 48, color: "var(--pm-primary)" }}
								/>
								<h5 className="mt-3" style={{ fontWeight: 700 }}>
									Ready to Generate!
								</h5>
								<p style={{ color: "var(--pm-muted)" }}>
									Your microservice boilerplate with Webhooks and HMAC auth is ready.
								</p>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 3. Integration Simulator ---------------- */}
			<MBox
				s={s}
				id="testIntegrationModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bug" style={{ color: "var(--pm-warning)" }} />
						Integration Simulator
					</>
				}
				footer={m.footer("testIntegrationModal", m.closeOnly())}
			>
				{m.body(
					"testIntegrationModal",
					<>
						<m.Tabs
							k="simTab"
							def="rest"
							opts={[
								{ v: "rest", label: "REST API" },
								{ v: "hook", label: "Webhooks" },
								{ v: "sdk", label: "SDK Event" },
							]}
						/>
						{m.tab("simTab", "rest") === "rest" && <RestSimulator />}
						{m.tab("simTab", "rest") === "hook" && (
							<>
								<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
									Trigger a test webhook payload to your registered endpoint.
								</p>
								<div className="mb-3">
									<Lbl s={s}>Event Type</Lbl>
									<Fld
										s={s}
										as="select"
										options={["payment.success", "payment.failed", "disbursement.completed"]}
									/>
								</div>
								<button
									type="button"
									className={`${s.btnPm} ${s.btnPmP}`}
									onClick={() =>
										m.doAction(
											"testIntegrationModal",
											"Webhook fired. Check your server logs.",
										)
									}
								>
									Fire Webhook
								</button>
							</>
						)}
						{m.tab("simTab", "rest") === "sdk" && (
							<>
								<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
									Simulate frontend SDK callbacks (e.g. onCheckoutClose).
								</p>
								<button
									type="button"
									className={s.btnPm}
									onClick={() =>
										m.doAction(
											"testIntegrationModal",
											"SDK callback simulated: onCheckoutSuccess fired.",
										)
									}
								>
									Simulate Checkout Success
								</button>
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ---------------- 4. Direct API Config ---------------- */}
			<MBox
				s={s}
				id="directApiModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-hdd-network" style={{ color: "var(--pm-primary)" }} />
						Direct API Configuration
					</>
				}
				footer={m.footer(
					"directApiModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("directApiModal", "API configurations updated", "CONFIG_881")
							}
						>
							Save Settings
						</button>,
					),
				)}
			>
				{m.body(
					"directApiModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>API Version</Lbl>
							<Fld s={s} as="select" options={["v2 (Recommended)", "v1 (Legacy)"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Authentication Method</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"OAuth 2.0 Client Credentials",
									"HMAC-SHA256 Signatures",
									"Static API Key (Sandbox only)",
								]}
							/>
						</div>
						<Chk label="Enforce IP Whitelisting" defaultChecked />
						<CodeBox s={s} style={{ marginTop: 12 }}>
							{`Authorization: Bearer pm_live_xxxxxx...
X-PayMo-Signature: a3f8...`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 5. Webhook Listener Settings ---------------- */}
			<MBox
				s={s}
				id="webhookConfigModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-broadcast" style={{ color: "var(--pm-info)" }} />
						Webhook Listener Settings
					</>
				}
				footer={m.footer(
					"webhookConfigModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("webhookConfigModal", "Webhook endpoint activated!")
							}
						>
							Update Endpoint
						</button>
					</>,
				)}
			>
				{m.body(
					"webhookConfigModal",
					<div className="row g-3">
						<div className="col-12">
							<Lbl s={s}>Endpoint URL</Lbl>
							<Fld
								s={s}
								type="url"
								mono
								defaultValue="https://api.yourdomain.com/paymo/webhooks"
							/>
						</div>
						<div className="col-md-6">
							<Lbl s={s}>Retry Strategy</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Exponential Backoff (Recommended)",
									"Linear (Every 5 mins)",
									"No Retries",
								]}
							/>
						</div>
						<div className="col-md-6">
							<Lbl s={s}>Max Retries</Lbl>
							<Fld s={s} type="number" defaultValue="5" />
						</div>
						<div className="col-12">
							<Lbl s={s}>Subscribed Events</Lbl>
							<div className="d-flex flex-wrap gap-2">
								<span className={`${s.badge} ${s.badgeS}`}>payment.success</span>
								<span className={`${s.badge} ${s.badgeD}`}>payment.failed</span>
								<span className={`${s.badge} ${s.badgeI}`}>payout.completed</span>
							</div>
						</div>
						<div className="col-12">
							<Lbl s={s}>Webhook Secret (for HMAC)</Lbl>
							<div className="d-flex gap-2">
								<Fld s={s} type="password" mono defaultValue="whsec_8849201283894" readOnly />
								<button type="button" className={s.btnPm} aria-label="Reveal secret">
									<i className="bi bi-eye" />
								</button>
							</div>
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 6. Embedded Checkout ---------------- */}
			<MBox
				s={s}
				id="embeddedCheckoutModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-window-sidebar" style={{ color: "var(--pm-accent)" }} />
						Embedded Checkout Setup
					</>
				}
				footer={m.footer(
					"embeddedCheckoutModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("embeddedCheckoutModal", "Checkout settings saved globally.")
							}
						>
							Save Checkout
						</button>
					</>,
				)}
			>
				{m.body(
					"embeddedCheckoutModal",
					<>
						<m.Tabs
							k="checkTab"
							def="style"
							opts={[
								{ v: "style", label: "UI Theme" },
								{ v: "behavior", label: "Behavior" },
								{ v: "code", label: "Embed Code" },
							]}
						/>
						{m.tab("checkTab", "style") === "style" && (
							<div className="row g-3">
								<div className="col-md-6">
									<Lbl s={s}>Primary Color</Lbl>
									<input
										type="color"
										className={s.formControl}
										defaultValue="#4F46E5"
										style={{ height: 42, padding: 4 }}
										aria-label="Primary color"
									/>
								</div>
								<div className="col-md-6">
									<Lbl s={s}>Border Radius</Lbl>
									<select className={s.formControl} defaultValue="Pill (20px)">
										<option>Sharp (0px)</option>
										<option>Rounded (8px)</option>
										<option>Pill (20px)</option>
									</select>
								</div>
								<div className="col-12">
									<Lbl s={s}>Logo URL</Lbl>
									<Fld s={s} type="url" placeholder="https://yourdomain.com/logo.png" />
								</div>
							</div>
						)}
						{m.tab("checkTab", "style") === "behavior" && (
							<>
								<div className="mb-3">
									<Lbl s={s}>Display Mode</Lbl>
									<Fld
										s={s}
										as="select"
										options={["Overlay Popup Modal", "Inline iFrame", "Full Page Redirect"]}
									/>
								</div>
								<Chk label="Enable Guest Checkout" defaultChecked />
								<Chk label="Save card for future payments" defaultChecked />
							</>
						)}
						{m.tab("checkTab", "style") === "code" && (
							<>
								<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
									Place this snippet before the closing <code>&lt;/body&gt;</code> tag.
								</p>
								<CodeBox s={s}>
									{`<script src="https://js.paymo.com/v2/checkout.js"></script>
<script>
  const paymo = new PayMo('pk_live_xxxx');
  paymo.mount('#payment-element');
</script>`}
								</CodeBox>
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ---------------- 7. White-Label ---------------- */}
			<MBox
				s={s}
				id="whiteLabelModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-palette" style={{ color: "var(--pm-purple)" }} />
						White-Label Configuration
					</>
				}
				footer={m.footer(
					"whiteLabelModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"whiteLabelModal",
									"Domain verification initiated. Please check DNS.",
								)
							}
						>
							Verify Domain
						</button>,
					),
				)}
			>
				{m.body(
					"whiteLabelModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Custom Payment Domain</Lbl>
							<div className="input-group">
								<span
									className="input-group-text"
									style={{
										background: "var(--pm-surface-2)",
										borderColor: "var(--pm-border)",
									}}
								>
									https://
								</span>
								<input
									className={s.formControl}
									placeholder="pay.yourbrand.com"
									aria-label="Custom payment domain"
								/>
							</div>
						</div>
						<div className={`${s.note} ${s.noteMuted} mb-3`}>
							<h6 style={{ fontWeight: 700, marginBottom: 6 }}>DNS Instructions</h6>
							Create a CNAME record pointing <code>pay.yourbrand.com</code> to{" "}
							<code>wl.paymo.com</code>. We automatically provision SSL.
						</div>
						<div className="mb-3">
							<Lbl s={s}>Email Sender Name</Lbl>
							<Fld s={s} defaultValue="YourBrand Payments" />
						</div>
						<Chk
							label="Remove 'Powered by PayMo' badge (Enterprise only)"
							defaultChecked
						/>
					</>,
				)}
			</MBox>

			{/* ---------------- 8. Hybrid Sync ---------------- */}
			<MBox
				s={s}
				id="hybridSyncModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shuffle" style={{ color: "var(--pm-accent)" }} />
						Hybrid Sync & Offline Queues
					</>
				}
				footer={m.footer(
					"hybridSyncModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"hybridSyncModal",
									"Hybrid sync parameters deployed to SDK clients.",
								)
							}
						>
							Deploy Strategy
						</button>
					</>,
				)}
			>
				{m.body(
					"hybridSyncModal",
					<>
						<Sw label="Enable Background Sync API" defaultChecked />
						<div className="mb-3 mt-3">
							<Lbl s={s}>Offline Queue Behavior</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Store locally and sync on network connect",
									"Reject transactions when offline",
								]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Bulk Operation Chunk Size</Lbl>
							<Fld s={s} type="number" defaultValue="500" />
						</div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)", margin: 0 }}>
							Ideal for POS devices in low-connectivity areas. SDK handles indexing and
							state reconciliation automatically.
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 9. Service Mesh ---------------- */}
			<MBox
				s={s}
				id="meshConfigModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-boxes" style={{ color: "var(--pm-purple)" }} />
						Service Mesh Proxy
					</>
				}
				footer={m.footer(
					"meshConfigModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("meshConfigModal", "Service mesh manifest downloaded.")
							}
						>
							Download Manifest
						</button>,
					),
				)}
			>
				{m.body(
					"meshConfigModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Proxy Environment</Lbl>
							<Fld s={s} as="select" options={["Istio", "Envoy Native", "Linkerd"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>mTLS Mode</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Strict (Require client certs)", "Permissive"]}
							/>
						</div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
							Download the sidecar injection templates for your Kubernetes cluster to map
							PayMo endpoints internally.
						</p>
						<CodeBox s={s}>
							{`apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: paymo-external...`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 10. gRPC Protocols ---------------- */}
			<MBox
				s={s}
				id="grpcSetupModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-cpu" style={{ color: "var(--pm-info)" }} />
						gRPC Protocols
					</>
				}
				footer={m.footer(
					"grpcSetupModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("grpcSetupModal", "Protobuf specs downloaded.")}
						>
							Download .proto Files
						</button>
					</>,
				)}
			>
				{m.body(
					"grpcSetupModal",
					<>
						<p style={{ color: "var(--pm-muted)", marginBottom: 12, fontSize: 13 }}>
							For ultra-low latency internal microservice communication, use our Protobuf
							specs instead of JSON REST.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Service Spec</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"PaymentInitiationService.proto",
									"DisbursementStream.proto",
									"LedgerSync.proto",
								]}
							/>
						</div>
						<CodeBox s={s} height={160}>
							{`syntax = "proto3";
package paymo.v1;

service PaymentInitiation {
  rpc CreateCharge (ChargeReq) returns (ChargeRes);
}`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 11. Circuit Breaker ---------------- */}
			<MBox
				s={s}
				id="circuitBreakerModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-sign-stop-lights" style={{ color: "var(--pm-danger)" }} />
						Circuit Breaker Rules
					</>
				}
				footer={m.footer(
					"circuitBreakerModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("circuitBreakerModal", "Circuit breaker thresholds updated.")
							}
						>
							Save Thresholds
						</button>,
					),
				)}
			>
				{m.body(
					"circuitBreakerModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Error Threshold (%)</Lbl>
							<Fld s={s} type="number" defaultValue="50" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Timeout (ms)</Lbl>
							<Fld s={s} type="number" defaultValue="3000" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Reset Timeout (seconds)</Lbl>
							<Fld s={s} type="number" defaultValue="60" />
						</div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)", margin: 0 }}>
							If failures to downstream banks exceed threshold, requests will fail fast
							for the reset timeout to prevent cascading failures.
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 12. SOAP Translator (3-step) ---------------- */}
			<MBox
				s={s}
				id="soapTranslatorModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-code" style={{ color: "var(--pm-warning)" }} />
						SOAP to REST Bridge
					</>
				}
				footer={
					<>
						{m.closeOnly("Cancel")}
						{soapStep === 1 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.go("soapTranslatorModal", 2)}
							>
								Next Step <i className="bi bi-arrow-right" />
							</button>
						)}
						{soapStep === 2 && (
							<button
								type="button"
								className={`${s.btnPm} ${s.btnPmP}`}
								onClick={() => m.confirmStep("soapTranslatorModal", 3)}
							>
								Deploy Bridge <i className="bi bi-rocket" />
							</button>
						)}
						{soapStep >= 3 && (
							<button type="button" className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>
								Done
							</button>
						)}
					</>
				}
			>
				{m.busy === "soapTranslatorModal" ? (
					<Loading s={s} />
				) : (
					<>
						<Stepper s={s} labels={["Upload", "Mapping", "Deploy"]} current={soapStep} />
						{soapStep === 1 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 1: Upload WSDL</h6>
								<div className="mb-3 mt-3">
									<Lbl s={s}>Target Core Banking WSDL URL</Lbl>
									<Fld
										s={s}
										type="url"
										mono
										placeholder="http://legacy.bank.internal/Service?wsdl"
									/>
								</div>
								<p className="text-center my-3" style={{ color: "var(--pm-muted)" }}>
									OR
								</p>
								<div className={s.dashedDrop}>
									<i className="bi bi-upload" style={{ fontSize: 28 }} />
									<p className="mb-0 mt-2">Drag and drop .wsdl file here</p>
								</div>
							</>
						)}
						{soapStep === 2 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 2: Method Mapping</h6>
								<div className={`${s.tableWrap} mt-3`}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>SOAP Operation</th>
												<th>REST Endpoint (PayMo)</th>
											</tr>
										</thead>
										<tbody>
											{data.soapMappings.map((mp) => (
												<tr key={mp.operation}>
													<td data-label="SOAP Operation">
														<code>{mp.operation}</code>
													</td>
													<td data-label="REST Endpoint">
														<Fld s={s} as="select" options={mp.rest} />
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</>
						)}
						{soapStep >= 3 && (
							<>
								<h6 style={{ fontWeight: 700 }}>Step 3: Deploy Middleware</h6>
								<div className="mt-3">
									<Chk label="Wrap with basic XML Security signatures" defaultChecked />
									<Chk label="Translate ISO-8601 to legacy YYYYMMDD" defaultChecked />
								</div>
							</>
						)}
					</>
				)}
			</MBox>

			{/* ---------------- 13. SFTP Batch Drops ---------------- */}
			<MBox
				s={s}
				id="fileIntegrationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-folder-symlink" style={{ color: "var(--pm-primary)" }} />
						SFTP Batch Drops
					</>
				}
				footer={m.footer(
					"fileIntegrationModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"fileIntegrationModal",
									"SFTP credentials established and ready for drops.",
								)
							}
						>
							Save SFTP Config
						</button>,
					),
				)}
			>
				{m.body(
					"fileIntegrationModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Drop Zone Host</Lbl>
							<Fld s={s} mono defaultValue="sftp.paymo.com" readOnly />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Authentication</Lbl>
							<Fld
								s={s}
								as="select"
								options={["SSH Key Pair", "Password (Not recommended)"]}
							/>
						</div>
						<div className="mb-3">
							<Lbl s={s}>Upload Public Key</Lbl>
							<Fld s={s} as="textarea" rows={3} mono placeholder="ssh-rsa AAAAB3Nza..." />
						</div>
						<div className="mb-3">
							<Lbl s={s}>File Format Expected</Lbl>
							<Fld
								s={s}
								as="select"
								options={["CSV (comma delimited)", "XML (ISO 20022)", "Fixed-width TXT"]}
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 14. Legacy DB Sync ---------------- */}
			<MBox
				s={s}
				id="legacyDbSyncModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-database" style={{ color: "var(--pm-danger)" }} />
						Database Replication Rules
					</>
				}
				footer={m.footer(
					"legacyDbSyncModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("legacyDbSyncModal", "CDC stream initialized.")}
						>
							Save Replication Config
						</button>,
					),
				)}
			>
				{m.body(
					"legacyDbSyncModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
							Configure CDC (Change Data Capture) or batch sync into your on-premise
							relational database.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Sync Mechanism</Lbl>
							<Fld s={s} as="select" options={["Debezium CDC Stream", "Nightly SQL Dump"]} />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Target Engine</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Oracle DB", "Microsoft SQL Server", "MySQL"]}
							/>
						</div>
						<Chk label="Anonymize PII Data (Mask Names/Phones)" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 15. Tenant Isolation ---------------- */}
			<MBox
				s={s}
				id="tenantIsolationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-layout-wtf" style={{ color: "var(--pm-accent)" }} />
						Tenant Data Policies
					</>
				}
				footer={m.footer(
					"tenantIsolationModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"tenantIsolationModal",
									"Isolation strictness enforced at database level.",
								)
							}
						>
							Update Policies
						</button>
					</>,
				)}
			>
				{m.body(
					"tenantIsolationModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Data Segregation Strategy</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Logical (Row-level security)",
									"Physical (Separate schema per tenant)",
									"Dedicated DB per tenant (Enterprise)",
								]}
							/>
						</div>
						<Sw label="Enforce tenant_id header strictly" defaultChecked />
						<div className="p-3 border rounded mt-3">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<strong>Cross-Tenant Analytics</strong>
								<span className={`${s.badge} ${s.badgeW}`}>Restricted</span>
							</div>
							<p style={{ color: "var(--pm-muted)", margin: 0, fontSize: 12 }}>
								Aggregated reporting across tenants requires specific Master Admin IAM
								roles.
							</p>
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 16. Caching ---------------- */}
			<MBox
				s={s}
				id="cacheStrategyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-memory" style={{ color: "var(--pm-info)" }} />
						Edge Caching Rules
					</>
				}
				footer={m.footer(
					"cacheStrategyModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("cacheStrategyModal", "Redis cache rules pushed to edge.")
							}
						>
							Update Caching
						</button>,
					),
				)}
			>
				{m.body(
					"cacheStrategyModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Static Data TTL (seconds)</Lbl>
							<Fld s={s} type="number" defaultValue="300" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Invalidation Strategy</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Time-based (TTL only)", "Event-driven (Purge on write)"]}
							/>
						</div>
						<Chk label="Cache GET /v1/exchange-rates" defaultChecked />
						<Chk label="Cache GET /v1/wallet/balance (Not recommended)" />
					</>,
				)}
			</MBox>

			{/* ---------------- 17. CDN ---------------- */}
			<MBox
				s={s}
				id="cdnSetupModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-globe" style={{ color: "var(--pm-primary)" }} />
						CDN Asset Distribution
					</>
				}
				footer={m.footer(
					"cdnSetupModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("cdnSetupModal", "CDN purge and remap initiated.")}
						>
							Purge & Map CDN
						</button>
					</>,
				)}
			>
				{m.body(
					"cdnSetupModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Frontend Assets Source</Lbl>
							<Fld s={s} type="url" mono defaultValue="https://assets.yourdomain.com" />
						</div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
							Route your checkout iFrame scripts and CSS through PayMo's globally
							distributed CDN for sub-50ms latency across Africa.
						</p>
						<Sw label="Auto-minify JavaScript/CSS at edge" defaultChecked />
					</>,
				)}
			</MBox>

			{/* ---------------- 18. Rate Limits ---------------- */}
			<MBox
				s={s}
				id="rateLimitModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-sign-stop" style={{ color: "var(--pm-warning)" }} />
						Rate Limiting Parameters
					</>
				}
				footer={m.footer(
					"rateLimitModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() => m.doAction("rateLimitModal", "Rate limits adjusted.")}
						>
							Save Limits
						</button>,
					),
				)}
			>
				{m.body(
					"rateLimitModal",
					<div className="row g-3">
						<div className="col-md-6">
							<Lbl s={s}>Max Requests per Second</Lbl>
							<Fld s={s} type="number" defaultValue="1000" />
						</div>
						<div className="col-md-6">
							<Lbl s={s}>Burst Capacity (Tokens)</Lbl>
							<Fld s={s} type="number" defaultValue="1500" />
						</div>
						<div className="col-12">
							<Lbl s={s}>Backoff Header Injection</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Include Retry-After header", "Standard 429 Too Many Requests"]}
							/>
						</div>
						<div className="col-12">
							<p style={{ color: "var(--pm-muted)", margin: 0, fontSize: 12 }}>
								Current utilization is at 12% of threshold. No throttling events logged in
								last 24h.
							</p>
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 19. HA Failover ---------------- */}
			<MBox
				s={s}
				id="haFailoverModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-activity" style={{ color: "var(--pm-accent)" }} />
						High Availability Tester
					</>
				}
				footer={m.footer(
					"haFailoverModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmD}`}
							onClick={() =>
								m.doAction(
									"haFailoverModal",
									"Failover drill initiated on sandbox environment. Check metrics.",
								)
							}
						>
							Initiate Chaos Drill
						</button>,
					),
				)}
			>
				{m.body(
					"haFailoverModal",
					<>
						<div className={`${s.archDiagram} mb-3`}>
							{data.drRegions.map((r, i) => (
								<Fragment2 key={r.name}>
									<div className={s.archNode} style={{ color: r.tone }}>
										{r.name}
									</div>
									{i < data.drRegions.length - 1 && (
										<div
											className={s.archLink}
											style={
												i === 1 ? { background: "var(--pm-border)" } : undefined
											}
										/>
									)}
								</Fragment2>
							))}
						</div>
						<div className="mb-3">
							<Lbl s={s}>Failover Simulation</Lbl>
							<Fld
								s={s}
								as="select"
								options={[
									"Simulate Nairobi Zone Failure",
									"Simulate Mombasa Zone Failure",
								]}
							/>
						</div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)", margin: 0 }}>
							This will redirect sandbox traffic entirely to the surviving nodes to test
							your application's connection retry logic and latency tolerance.
						</p>
					</>,
				)}
			</MBox>

			{/* ---------------- 20. Load Balancer ---------------- */}
			<MBox
				s={s}
				id="lbIntegrationModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-router" style={{ color: "var(--pm-purple)" }} />
						Load Balancer Routes
					</>
				}
				footer={m.footer(
					"lbIntegrationModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("lbIntegrationModal", "LB rules updated across target groups.")
							}
						>
							Apply Routing
						</button>
					</>,
				)}
			>
				{m.body(
					"lbIntegrationModal",
					<>
						<div className="mb-3">
							<Lbl s={s}>Algorithm</Lbl>
							<Fld
								s={s}
								as="select"
								options={["Round Robin", "Least Connections", "IP Hash (Sticky Sessions)"]}
							/>
						</div>
						<Sw label="Cross-Zone Load Balancing" defaultChecked />
						<div className="mb-3 mt-3">
							<Lbl s={s}>Health Check Path</Lbl>
							<Fld s={s} mono defaultValue="/api/health" />
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 21. DR Monitor ---------------- */}
			<MBox
				s={s}
				id="drMonitorModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield-exclamation" style={{ color: "var(--pm-danger)" }} />
						Disaster Recovery Targets
					</>
				}
				footer={m.footer(
					"drMonitorModal",
					<>
						{m.closeOnly()}
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("drMonitorModal", "DR drill scheduled for next maintenance window.")
							}
						>
							Schedule Drill
						</button>
					</>,
				)}
			>
				{m.body(
					"drMonitorModal",
					<div className="row g-3">
						<div className="col-6">
							<div className="p-3 border rounded text-center">
								<h3 style={{ marginBottom: 4 }}>1s</h3>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
									RPO (Recovery Point)
								</div>
							</div>
						</div>
						<div className="col-6">
							<div className="p-3 border rounded text-center">
								<h3 style={{ marginBottom: 4 }}>5m</h3>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
									RTO (Recovery Time)
								</div>
							</div>
						</div>
						<div className="col-12 mt-3">
							<h6 style={{ fontWeight: 700 }}>Latest DR Drill</h6>
							<p style={{ color: "var(--pm-muted)", margin: 0, fontSize: 13 }}>
								Passed on 12 Jun 2025. Data loss zero. Fallback switch completed within
								target RTO.
							</p>
						</div>
					</div>,
				)}
			</MBox>

			{/* ---------------- 22. Idempotency Tester ---------------- */}
			<MBox
				s={s}
				id="idempotencyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" style={{ color: "var(--pm-warning)" }} />
						Idempotency Tester
					</>
				}
				footer={m.footer(
					"idempotencyModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction(
									"idempotencyModal",
									"Test returned HTTP 409 Conflict. Original response replayed.",
								)
							}
						>
							Replay Request
						</button>,
					),
				)}
			>
				{m.body(
					"idempotencyModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Send the same idempotency key twice to confirm PayMo replays the original
							response instead of double-charging.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Idempotency Key</Lbl>
							<Fld s={s} mono defaultValue="f47ac10b-58cc-4372-a567-0e02b2c3d479" />
						</div>
						<CodeBox s={s} copy={false}>
							{`POST /v1/collections/stk-push
X-Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479`}
						</CodeBox>
					</>,
				)}
			</MBox>

			{/* ---------------- 23. Cert Pinning ---------------- */}
			<MBox
				s={s}
				id="certPinningModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield-lock" style={{ color: "var(--pm-accent)" }} />
						Certificate Pinning
					</>
				}
				footer={m.footer(
					"certPinningModal",
					m.cancelAnd(
						<button
							type="button"
							className={`${s.btnPm} ${s.btnPmP}`}
							onClick={() =>
								m.doAction("certPinningModal", "Certificate pins saved and distributed.")
							}
						>
							Save Pins
						</button>,
					),
				)}
			>
				{m.body(
					"certPinningModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							Pin PayMo's public key hashes in your mobile/SDK clients to defeat
							man-in-the-middle proxies.
						</p>
						<div className="mb-3">
							<Lbl s={s}>Primary Hash (SHA-256)</Lbl>
							<Fld s={s} mono defaultValue="sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" />
						</div>
						<div className="mb-3">
							<Lbl s={s}>Backup Hash</Lbl>
							<Fld s={s} mono defaultValue="sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=" />
						</div>
						<div className={`${s.note} ${s.noteWarn}`}>
							<i className="bi bi-exclamation-triangle me-1" /> Always ship a backup pin.
							Pinning only one certificate will brick clients on rotation.
						</div>
					</>,
				)}
			</MBox>

			{/* ---------------- 24. Profile ---------------- */}
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
							background: "var(--pm-info)",
							color: "#fff",
						}}
					>
						{data.header.user.initials}
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>{data.header.user.name}</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>{data.header.user.role}</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Active Pattern</span>
								<br />
								<strong>Hybrid Sync</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${s.note} ${s.noteMuted}`}>
								<span style={{ color: "var(--pm-muted)" }}>Mesh Nodes</span>
								<br />
								<strong>12 Active</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ---------------- 25. Health Check ---------------- */}
			<MBox
				s={s}
				id="healthCheckModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-heart-pulse" style={{ color: "var(--pm-accent)" }} />
						API Status
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
		</>
	);
}

/* Tiny local fragment helper so the arch diagram can interleave nodes + links. */
function Fragment2({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
