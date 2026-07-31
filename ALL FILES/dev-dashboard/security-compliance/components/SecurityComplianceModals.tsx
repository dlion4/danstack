import type { ReactNode } from "react";
import { useState } from "react";
import {
	BusyOverlay,
	CodeBlock,
	CopyButton,
	downloadText,
	ModalFrame,
	Receipt,
	Stepper,
	useAsyncActions,
} from "../../_shared/DevModalKit-2";
import styles from "../styles/security-compliance.module.css";

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}

type FieldKind =
	| "text"
	| "password"
	| "select"
	| "textarea"
	| "number"
	| "file";
interface FieldDef {
	label: string;
	kind: FieldKind;
	value?: string;
	placeholder?: string;
	options?: string[];
}
interface ActionDef {
	id: string;
	title: string;
	icon: string;
	description: string;
	notice?: string;
	fields?: FieldDef[];
	checks?: string[];
	code?: string;
	action: string;
	result: string;
	danger?: boolean;
	size?: "md" | "lg";
}

const ACTION_DEFS: ActionDef[] = [
	{
		id: "deleteAppModal",
		title: "Revoke Application",
		icon: "bi-exclamation-triangle",
		description:
			"Revoke Mobile iOS App and invalidate every active token issued to it.",
		notice: "This action immediately stops API access for the application.",
		fields: [
			{ label: "Type REVOKE to confirm", kind: "text", placeholder: "REVOKE" },
		],
		action: "Confirm Revocation",
		result: "Application revoked and all active tokens invalidated.",
		danger: true,
	},
	{
		id: "rotateKeysModal",
		title: "Rotate API Keys",
		icon: "bi-arrow-repeat",
		description:
			"Generate a replacement key while applying a grace period to the old credential.",
		notice: "The production secret key expires in five days.",
		fields: [
			{
				label: "Key to rotate",
				kind: "select",
				options: [
					"Production Secret Key (sk_live_***)",
					"Production Public Key (pk_live_***)",
					"Sandbox Secret Key (sk_test_***)",
				],
			},
			{
				label: "Grace period",
				kind: "select",
				options: ["24 hours", "48 hours", "7 days", "Revoke immediately"],
			},
			{ label: "Admin MFA / OTP", kind: "text", placeholder: "123456" },
		],
		action: "Rotate Key",
		result:
			"Key rotated. The old credential remains active for the selected grace period.",
		danger: true,
	},
	{
		id: "webhookSigModal",
		title: "Webhook Signatures (HMAC)",
		icon: "bi-pen",
		description:
			"PayMo signs webhook payloads with HMAC-SHA256. Verify the X-PayMo-Signature header before processing.",
		fields: [
			{
				label: "Endpoint URL",
				kind: "text",
				value: "https://api.merchant.example/paymo/webhooks",
			},
			{
				label: "Webhook Secret",
				kind: "password",
				value: "whsec_live_98a7sd98f7a9s8df7",
			},
		],
		code: "const sig = crypto.createHmac('sha256', secret)\n  .update(rawBody)\n  .digest('hex');\nif (timingSafeEqual(sig, headerSig)) { /* verified */ }",
		action: "Save Endpoint",
		result: "Webhook endpoint and signature settings updated.",
	},
	{
		id: "jwtConfigModal",
		title: "JWT Settings",
		icon: "bi-ticket-detailed",
		description: "Set token lifetimes, revocation behavior, and custom claims.",
		fields: [
			{
				label: "Access token expiration",
				kind: "select",
				options: ["15 minutes", "1 hour", "24 hours"],
			},
			{
				label: "Refresh token expiration",
				kind: "select",
				options: ["7 days", "30 days", "Never (not recommended)"],
			},
		],
		checks: [
			"Enforce strict token revocation",
			"Include merchant_id and branch_id custom claims",
		],
		action: "Save Settings",
		result: "JWT settings applied across authentication servers.",
	},
	{
		id: "pciUploadModal",
		title: "PCI DSS Attestation",
		icon: "bi-shield-check",
		description: "Direct card API users must submit a valid SAQ D each year.",
		notice:
			"Current status: OVERDUE. The previous attestation expired on 15 May 2026.",
		fields: [
			{ label: "SAQ D document (PDF)", kind: "file" },
			{
				label: "QSA name / company",
				kind: "text",
				placeholder: "Leave blank if self-assessed",
			},
		],
		action: "Upload Attestation",
		result: "PCI document submitted for compliance review.",
	},
	{
		id: "encryptionSettingsModal",
		title: "KMS & Encryption at Rest",
		icon: "bi-key-fill",
		description:
			"PayMo uses AES-256 managed keys. Enterprise accounts may bring an AWS or Azure key.",
		fields: [
			{
				label: "Encryption mode",
				kind: "select",
				options: [
					"PayMo Managed Keys",
					"AWS KMS (BYOK)",
					"Azure Key Vault (BYOK)",
				],
			},
			{
				label: "KMS Key ARN",
				kind: "text",
				placeholder: "arn:aws:kms:eu-west-1:…",
			},
			{
				label: "IAM Role Session",
				kind: "text",
				placeholder: "arn:aws:iam::…",
			},
		],
		action: "Save Configuration",
		result: "Encryption configuration updated and validation queued.",
	},
	{
		id: "deviceFingerprintModal",
		title: "Device Fingerprinting Rules",
		icon: "bi-phone",
		description:
			"Control how suspicious mobile and browser devices are evaluated.",
		checks: [
			"Block rooted or jailbroken devices",
			"Block known emulators",
			"Enable behavioral biometrics profiling",
		],
		notice:
			"The pm-device-id header maps a device to historical fraud signals without exposing raw hardware identifiers.",
		action: "Save Rules",
		result: "Device fingerprinting constraints applied.",
	},
	{
		id: "kycWebhookModal",
		title: "KYC / KYB Validation API",
		icon: "bi-person-bounding-box",
		description: "Configure identity, liveness, company, and sanctions checks.",
		fields: [
			{
				label: "IPRS / ID match",
				kind: "select",
				options: ["Strict match (name + DOB)", "Fuzzy match (minor typos)"],
			},
			{
				label: "Liveness",
				kind: "select",
				options: ["Active liveness", "Passive liveness"],
			},
			{
				label: "Result webhook",
				kind: "text",
				value: "https://api.merchant.example/kyc-callbacks",
			},
		],
		checks: ["Automatically decline PEP / sanctions matches"],
		action: "Save Configuration",
		result: "KYC automation and callback settings saved.",
	},
	{
		id: "sandboxTestingModal",
		title: "Sandbox Testing",
		icon: "bi-box",
		description:
			"Switch from production settings to a safe environment for testing failure and success outcomes.",
		notice: "Sandbox keys are active and cannot move real funds.",
		checks: [
			"Preserve existing sandbox fixtures",
			"Notify team members of context switch",
		],
		action: "Switch Context",
		result: "Workspace switched to the sandbox environment.",
	},
	{
		id: "notificationSettingsModal",
		title: "Developer Alerts",
		icon: "bi-bell",
		description:
			"Choose the events that should reach engineering and security teams.",
		checks: [
			"API error rate above 1%",
			"Webhook delivery failures",
			"Security advisories and certificate rotations",
		],
		fields: [
			{
				label: "Slack webhook URL",
				kind: "password",
				value: "https://hooks.example/services/T000/…",
			},
		],
		action: "Save Alerts",
		result: "Developer alert preferences updated.",
	},
	{
		id: "supportEscalationModal",
		title: "Escalate Incident",
		icon: "bi-headset",
		description:
			"Page the platform on-call team for a production-impacting incident.",
		fields: [
			{
				label: "Severity",
				kind: "select",
				options: [
					"SEV1 — Complete outage",
					"SEV2 — Major degradation",
					"SEV3 — Minor issue",
				],
			},
			{
				label: "Description",
				kind: "textarea",
				value: "M-Pesa STK Push requests are timing out after 30 seconds.",
			},
		],
		notice:
			"SEV1 pages the on-call engineer immediately. Use it only for a complete or near-complete outage.",
		action: "Trigger PagerDuty",
		result: "Incident INC-9901 paged and a response room created.",
		danger: true,
	},
];

const OAUTH_APPS = [
	["Main Web App", "app_lv_11a", "Authorization Code", "Active"],
	["Mobile iOS App", "app_lv_22b", "PKCE", "Active"],
];
const CONSENTS = [
	["usr_99812", "Marketing SMS", "12 Jun 2026"],
	["usr_99812", "Financial Profiling", "12 Jun 2026"],
	["usr_44122", "Location Tracking", "01 May 2026"],
];
const SCOPES = [
	["payments:write", "Execute transfers and disbursements", "High", true],
	["customers:pii:read", "Read identity documents and phone", "High", false],
	["invoices:read", "Read invoice data", "Low", true],
	["webhook:config", "Change webhook URLs by API", "Medium", false],
] as const;
const AUDIT_ROWS = [
	[
		"25 Jul 2026 14:32:11",
		"API Key Rotated",
		"Admin Dev",
		"192.168.1.50",
		"Success",
	],
	[
		"25 Jul 2026 10:15:00",
		"Webhook Signature Failed",
		"System",
		"203.0.113.44",
		"Failed",
	],
	[
		"24 Jul 2026 09:00:21",
		"OAuth App Created",
		"Admin Dev",
		"192.168.1.50",
		"Success",
	],
	[
		"23 Jul 2026 22:10:05",
		"Failed Login (Bad MFA)",
		"james@example.test",
		"198.51.100.12",
		"Blocked",
	],
];
const HEALTH_ROWS = [
	["Core APIs (REST)", "p95 120ms", "Operational"],
	["Webhook Delivery", "Average delay 1.2s", "Operational"],
	["M-Pesa STK Gateway", "Upstream Safaricom dependency", "Degraded"],
	["KYC / OCR Engine", "Identity verification", "Operational"],
];

function Field({ field }: { field: FieldDef }) {
	const input =
		field.kind === "select" ? (
			<select className={styles.formControl}>
				{field.options?.map((option) => (
					<option key={option}>{option}</option>
				))}
			</select>
		) : field.kind === "textarea" ? (
			<textarea
				className={styles.formControl}
				defaultValue={field.value}
				placeholder={field.placeholder}
			/>
		) : (
			<input
				className={styles.formControl}
				type={field.kind}
				defaultValue={field.value}
				placeholder={field.placeholder}
				accept={field.kind === "file" ? "application/pdf" : undefined}
			/>
		);
	return (
		<div className={styles.formGroup}>
			<span className={styles.formLabel}>{field.label}</span>
			{input}
		</div>
	);
}

export default function SecurityComplianceModals({
	active,
	onClose,
	onOpen,
}: Props) {
	const s = styles as Record<string, string>;
	const { busyId, results, run, clear } = useAsyncActions();
	const [oauthStep, setOauthStep] = useState(1);
	const [consentTab, setConsentTab] = useState<"active" | "dsar">("active");
	const [ips, setIps] = useState([
		"192.168.1.50",
		"203.0.113.0/24",
		"198.51.100.12",
	]);
	const [newIp, setNewIp] = useState("");
	const [riskDecline, setRiskDecline] = useState(85);
	const [riskChallenge, setRiskChallenge] = useState(60);
	const [rateAlert, setRateAlert] = useState(80);
	const [secretOtp, setSecretOtp] = useState("");
	const [mfaCode, setMfaCode] = useState("");

	const close = () => {
		clear();
		setOauthStep(1);
		setConsentTab("active");
		setNewIp("");
		setSecretOtp("");
		setMfaCode("");
		onClose();
	};

	const bodyFor = (id: string, content: ReactNode) => {
		if (busyId === id)
			return <BusyOverlay styles={s} label="Applying changes…" />;
		if (results[id])
			return (
				<Receipt
					styles={s}
					message={results[id].message}
					reference={results[id].reference}
				/>
			);
		return content;
	};

	const actionFooter = (definition: ActionDef) => (
		<>
			<button type="button" className={s.button} onClick={close}>
				Cancel
			</button>
			<button
				type="button"
				className={`${s.button} ${definition.danger ? s.buttonDanger : s.buttonPrimary}`}
				onClick={() =>
					run(definition.id, {
						message: definition.result,
						reference: `SEC-${Date.now().toString().slice(-6)}`,
					})
				}
			>
				{definition.action}
			</button>
		</>
	);

	const advanceOauth = () => {
		if (oauthStep < 3) setOauthStep((step) => step + 1);
		else if (oauthStep === 3) {
			setOauthStep(4);
			run(
				"oauthRegisterModal",
				{
					message:
						"OAuth application registered. Store the generated secret securely.",
					reference: "app_live_8829fjak290",
				},
				900,
			);
		} else close();
	};

	return (
		<>
			<ModalFrame
				active={active}
				id="oauthRegisterModal"
				title="Register OAuth Application"
				icon="bi-plus-lg"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={advanceOauth}
						>
							{oauthStep < 3
								? "Next Step"
								: oauthStep === 3
									? "Generate Keys"
									: "Done"}{" "}
							<i
								className={`bi ${oauthStep === 3 ? "bi-key" : "bi-arrow-right"}`}
							/>
						</button>
					</>
				}
			>
				<Stepper
					labels={["Details", "Flows", "Scopes", "Done"]}
					current={oauthStep}
					styles={s}
				/>
				{oauthStep === 1 ? (
					<>
						<div className={s.formGroup}>
							<span className={s.formLabel}>Application Name</span>
							<input
								className={s.formControl}
								placeholder="My E-commerce Checkout"
							/>
						</div>
						<div className={s.formGroup}>
							<span className={s.formLabel}>Description</span>
							<textarea className={s.formControl} />
						</div>
						<div className={s.formGroup}>
							<span className={s.formLabel}>App Logo URL</span>
							<input
								className={s.formControl}
								placeholder="https://assets.example/app.svg"
							/>
						</div>
					</>
				) : null}
				{oauthStep === 2 ? (
					<>
						<label className={s.checkboxRow}>
							<input type="checkbox" defaultChecked /> Authorization Code
						</label>
						<label className={s.checkboxRow}>
							<input type="checkbox" defaultChecked /> Client Credentials (M2M)
						</label>
						<label className={s.checkboxRow}>
							<input type="checkbox" /> PKCE (Mobile / SPA)
						</label>
						<div className={`${s.formGroup} mt-3`}>
							<span className={s.formLabel}>Allowed Redirect URIs</span>
							<textarea
								className={s.formControl}
								placeholder="https://app.example/oauth/callback"
							/>
						</div>
					</>
				) : null}
				{oauthStep === 3
					? [
							["payments:write", "Initiate payments and disbursements"],
							["payments:read", "Read transaction history"],
							["customers:read", "Access customer profile data"],
						].map(([scope, detail], index) => (
							<label
								className={`${s.checkboxRow} ${s.utilityBlock}`}
								key={scope}
							>
								<input type="checkbox" defaultChecked={index < 2} />
								<span>
									<strong>{scope}</strong>
									<span className={`${s.feedSub} d-block`}>{detail}</span>
								</span>
							</label>
						))
					: null}
				{oauthStep === 4
					? bodyFor(
							"oauthRegisterModal",
							<div className={s.receipt}>
								<span className={s.receiptIcon}>
									<i className="bi bi-check-lg" />
								</span>
								<h3>App Registered</h3>
								<p>Client ID: app_live_8829fjak290</p>
								<p>Client Secret: sec_live_new_secret</p>
								<CopyButton
									value="sec_live_new_secret"
									styles={s}
									label="Copy Secret"
								/>
							</div>,
						)
					: null}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="oauthManageModal"
				title="Manage OAuth Apps"
				icon="bi-grid"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() => onOpen("oauthRegisterModal")}
						>
							New App
						</button>
					</>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>App Name</th>
								<th>Client ID</th>
								<th>Flow</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{OAUTH_APPS.map((app) => (
								<tr key={app[1]}>
									<td>{app[0]}</td>
									<td>
										<code>{app[1]}</code>
									</td>
									<td>{app[2]}</td>
									<td>
										<span className={`${s.badge} ${s.badgeSuccess}`}>
											{app[3]}
										</span>
									</td>
									<td>
										<div className="d-flex gap-1">
											<button
												type="button"
												className={`${s.button} ${s.buttonSm}`}
												onClick={() => onOpen("oauthRegisterModal")}
											>
												Edit
											</button>
											<button
												type="button"
												className={`${s.button} ${s.buttonSm} ${s.buttonDanger}`}
												onClick={() => onOpen("deleteAppModal")}
											>
												<i className="bi bi-trash" />
												<span className={s.srOnly}>Revoke</span>
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalFrame>

			{ACTION_DEFS.map((definition) => (
				<ModalFrame
					key={definition.id}
					active={active}
					id={definition.id}
					title={definition.title}
					icon={definition.icon}
					size={definition.size}
					onClose={close}
					styles={s}
					footer={actionFooter(definition)}
				>
					{bodyFor(
						definition.id,
						<>
							<p style={{ color: "var(--pm-ink-soft)", fontSize: 13 }}>
								{definition.description}
							</p>
							{definition.notice ? (
								<div
									className={`${s.notice} ${definition.danger ? s.noticeDanger : s.noticeWarning}`}
								>
									{definition.notice}
								</div>
							) : null}
							<div
								className={
									definition.fields && definition.fields.length > 3
										? s.formGrid
										: ""
								}
							>
								{definition.fields?.map((field) => (
									<Field field={field} key={field.label} />
								))}
							</div>
							{definition.checks?.map((check, index) => (
								<label className={s.checkboxRow} key={check}>
									<input type="checkbox" defaultChecked={index < 2} /> {check}
								</label>
							))}
							{definition.code ? (
								<CodeBlock styles={s} code={definition.code} />
							) : null}
						</>,
					)}
				</ModalFrame>
			))}

			<ModalFrame
				active={active}
				id="ipWhitelistModal"
				title="IP Whitelisting"
				icon="bi-hdd-network"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<p className="small text-muted">
					Only approved IPv4, IPv6, or CIDR ranges may use a production secret
					key.
				</p>
				{ips.map((ip) => (
					<div className={s.statusRow} key={ip}>
						<code>{ip}</code>
						<button
							type="button"
							className={`${s.button} ${s.buttonSm}`}
							onClick={() =>
								setIps((current) => current.filter((value) => value !== ip))
							}
						>
							<i className="bi bi-x-lg" /> Remove
						</button>
					</div>
				))}
				<div className="d-flex gap-2 mt-3">
					<input
						className={s.formControl}
						value={newIp}
						onChange={(event) => setNewIp(event.target.value)}
						placeholder="Add IP or CIDR"
					/>
					<button
						type="button"
						className={`${s.button} ${s.buttonPrimary}`}
						disabled={!newIp.trim()}
						onClick={() => {
							setIps((current) => [...current, newIp.trim()]);
							setNewIp("");
						}}
					>
						Add
					</button>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="certPinningModal"
				title="Certificate Pinning (Mobile SDK)"
				icon="bi-file-earmark-lock"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<p className="small text-muted">
					Pin both hashes to avoid downtime during the annual certificate
					rotation.
				</p>
				{[
					[
						"Primary certificate",
						"8A:9B:2C:4D:5E:77:91:AA",
						"Expires 31 Dec 2026",
					],
					[
						"Backup certificate",
						"1F:2A:3B:4C:5D:66:82:BB",
						"Activates during rotation",
					],
				].map(([label, hash, note]) => (
					<div
						className={s.utilityBlock}
						style={{ marginBottom: 10 }}
						key={label}
					>
						<div className={s.formLabel}>{label}</div>
						<div className="d-flex justify-content-between align-items-center gap-2">
							<code style={{ overflowWrap: "anywhere" }}>{hash}</code>
							<CopyButton value={hash} styles={s} />
						</div>
						<div className={s.feedSub}>{note}</div>
					</div>
				))}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="consentViewerModal"
				title="Consent & DSAR Management"
				icon="bi-person-check"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<div className={s.tabs}>
					<button
						type="button"
						className={`${s.tab} ${consentTab === "active" ? s.tabActive : ""}`}
						onClick={() => setConsentTab("active")}
					>
						Active Consents
					</button>
					<button
						type="button"
						className={`${s.tab} ${consentTab === "dsar" ? s.tabActive : ""}`}
						onClick={() => setConsentTab("dsar")}
					>
						Pending DSARs
					</button>
				</div>
				<div className={s.tabPanel}>
					{consentTab === "active" ? (
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>User ID</th>
										<th>Data Type</th>
										<th>Consent Date</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{CONSENTS.map((row) => (
										<tr key={`${row[0]}-${row[1]}`}>
											<td>{row[0]}</td>
											<td>{row[1]}</td>
											<td>{row[2]}</td>
											<td>
												<button
													type="button"
													className={`${s.button} ${s.buttonSm}`}
												>
													Revoke
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<>
							<div className={s.statusRow}>
								<div>
									<strong>Right to Erasure Request</strong>
									<div className={s.feedSub}>usr_77182 · due in 12 days</div>
								</div>
								<button
									type="button"
									className={`${s.button} ${s.buttonSm} ${s.buttonPrimary}`}
									onClick={() => onOpen("supportEscalationModal")}
								>
									Execute Deletion API
								</button>
							</div>
							<div className={s.statusRow}>
								<div>
									<strong>Data Portability Request</strong>
									<div className={s.feedSub}>usr_22910 · export generated</div>
								</div>
								<button
									type="button"
									className={`${s.button} ${s.buttonSm}`}
									onClick={() =>
										downloadText(
											"usr_22910-export.json",
											JSON.stringify(
												{ user: "usr_22910", status: "exported" },
												null,
												2,
											),
											"application/json",
										)
									}
								>
									Download JSON
								</button>
							</div>
						</>
					)}
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="scopeManageModal"
				title="Scope & PII Access Rules"
				icon="bi-eye"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								run("scopeManageModal", {
									message: "Scope defaults saved globally.",
									reference: "SCOPE-2026",
								})
							}
						>
							Save Defaults
						</button>
					</>
				}
			>
				{bodyFor(
					"scopeManageModal",
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Scope</th>
									<th>Description</th>
									<th>Sensitivity</th>
									<th>Default</th>
								</tr>
							</thead>
							<tbody>
								{SCOPES.map((scope) => (
									<tr key={scope[0]}>
										<td>
											<code>{scope[0]}</code>
										</td>
										<td>{scope[1]}</td>
										<td>
											<span
												className={`${s.badge} ${scope[2] === "High" ? s.badgeDanger : scope[2] === "Medium" ? s.badgeWarning : s.badgeInfo}`}
											>
												{scope[2]}
											</span>
										</td>
										<td>
											<input
												type="checkbox"
												defaultChecked={scope[3]}
												aria-label={`Enable ${scope[0]}`}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="riskThresholdsModal"
				title="Risk Scoring Thresholds"
				icon="bi-speedometer2"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								run("riskThresholdsModal", {
									message: `Risk rules saved: challenge above ${riskChallenge}, decline above ${riskDecline}.`,
									reference: "RSK-99",
								})
							}
						>
							Save Rules
						</button>
					</>
				}
			>
				{bodyFor(
					"riskThresholdsModal",
					<>
						<p className="small text-muted">
							Every transaction receives a score from 0 to 100.
						</p>
						<div className={s.formGroup}>
							<span className={s.formLabel}>
								Auto-decline above {riskDecline}
							</span>
							<input
								className="form-range"
								type="range"
								min="50"
								max="100"
								value={riskDecline}
								onChange={(event) => setRiskDecline(Number(event.target.value))}
							/>
						</div>
						<div className={s.formGroup}>
							<span className={s.formLabel}>
								Require 3DS / OTP above {riskChallenge}
							</span>
							<input
								className="form-range"
								type="range"
								min="30"
								max="85"
								value={riskChallenge}
								onChange={(event) =>
									setRiskChallenge(Number(event.target.value))
								}
							/>
						</div>
						<label className={s.checkboxRow}>
							<input type="checkbox" defaultChecked /> Flag velocity spikes
							above ten transactions per minute
						</label>
						<label className={s.checkboxRow}>
							<input type="checkbox" defaultChecked /> Block sanctioned regions
							automatically
						</label>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="dpaModal"
				title="Data Processing Agreement"
				icon="bi-file-earmark-pdf"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								downloadText(
									"PayMo-Signed-DPA.txt",
									"Signed PayMo Data Processing Agreement\nKenya Data Protection Act 2019\nSigned 12 January 2024",
								)
							}
						>
							<i className="bi bi-download" /> Download DPA
						</button>
					</>
				}
			>
				<p className="small text-muted">
					This agreement governs PayMo's processing of customer PII under
					Kenya's Data Protection Act 2019 and GDPR-aligned controls.
				</p>
				<div className={s.statusRow}>
					<div>
						<i className="bi bi-file-pdf text-danger me-2" />{" "}
						<strong>Signed DPA</strong>
						<div className={s.feedSub}>Signed 12 January 2024</div>
					</div>
					<span className={`${s.badge} ${s.badgeSuccess}`}>Active</span>
				</div>
				<label className={s.checkboxRow}>
					<input type="checkbox" checked readOnly /> PayMo acts as a Data
					Processor under this agreement.
				</label>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="rateLimitAlertModal"
				title="Rate Limits & Throttling"
				icon="bi-speedometer"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								run("rateLimitAlertModal", {
									message: `Rate-limit alert saved at ${rateAlert}% usage.`,
									reference: "RATE-ALERT",
								})
							}
						>
							Save Alert
						</button>
					</>
				}
			>
				{bodyFor(
					"rateLimitAlertModal",
					<>
						<div className="row g-2">
							<div className="col-6">
								<div className={s.utilityBlock}>
									<div className={s.feedSub}>Global Rate Limit</div>
									<strong>1,000 req/sec</strong>
								</div>
							</div>
							<div className="col-6">
								<div className={s.utilityBlock}>
									<div className={s.feedSub}>Current Usage</div>
									<strong style={{ color: "var(--pm-info)" }}>
										42 req/sec
									</strong>
								</div>
							</div>
						</div>
						<div className={`${s.formGroup} mt-4`}>
							<span className={s.formLabel}>
								Alert at {rateAlert}% of limit
							</span>
							<input
								className="form-range"
								type="range"
								min="50"
								max="95"
								value={rateAlert}
								onChange={(event) => setRateAlert(Number(event.target.value))}
							/>
						</div>
						<label className={s.checkboxRow}>
							<input type="checkbox" defaultChecked /> Return
							standards-compliant 429 Retry-After headers
						</label>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="auditLogModal"
				title="Security Audit & Access Logs"
				icon="bi-journal-text"
				size="xl"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								downloadText(
									"security-audit.csv",
									[
										"Timestamp,Event,Actor,IP,Status",
										...AUDIT_ROWS.map((row) => row.join(",")),
									].join("\n"),
									"text/csv",
								)
							}
						>
							<i className="bi bi-download" /> Export CSV
						</button>
					</>
				}
			>
				<div className={s.formGrid}>
					<div className={s.formGroup}>
						<span className={s.formLabel}>Search</span>
						<input className={s.formControl} placeholder="Event, user, or IP" />
					</div>
					<div className={s.formGroup}>
						<span className={s.formLabel}>Period</span>
						<select className={s.formControl}>
							<option>Last 7 days</option>
							<option>Last 30 days</option>
							<option>Last 90 days</option>
						</select>
					</div>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Timestamp</th>
								<th>Event</th>
								<th>User / System</th>
								<th>IP Address</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{AUDIT_ROWS.map((row) => (
								<tr key={`${row[0]}-${row[1]}`}>
									{row.map((cell, index) => (
										<td key={cell}>
											{index === 4 ? (
												<span
													className={`${s.badge} ${cell === "Success" ? s.badgeSuccess : s.badgeDanger}`}
												>
													{cell}
												</span>
											) : (
												cell
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="secretRevealModal"
				title="Reveal Client Secret"
				icon="bi-eye"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							disabled={secretOtp.length !== 6}
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								run("secretRevealModal", {
									message:
										"Identity verified. Client secret: sec_live_7f2a91c0",
									reference: "Shown once",
								})
							}
						>
							Verify & Reveal
						</button>
					</>
				}
			>
				{bodyFor(
					"secretRevealModal",
					<>
						<p className="small text-muted">
							Enter the six-digit code sent to the workspace owner.
						</p>
						<input
							className={s.formControl}
							inputMode="numeric"
							maxLength={6}
							value={secretOtp}
							onChange={(event) =>
								setSecretOtp(event.target.value.replace(/\D/g, ""))
							}
							placeholder="000000"
							style={{ textAlign: "center", fontSize: 24, letterSpacing: 8 }}
						/>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="healthCheckModal"
				title="System Status"
				icon="bi-check-circle"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() => onOpen("supportEscalationModal")}
						>
							Report Incident
						</button>
					</>
				}
			>
				{HEALTH_ROWS.map((row) => (
					<div className={s.statusRow} key={row[0]}>
						<div>
							<strong>{row[0]}</strong>
							<div className={s.feedSub}>{row[1]}</div>
						</div>
						<span
							className={`${s.badge} ${row[2] === "Operational" ? s.badgeSuccess : s.badgeWarning}`}
						>
							{row[2]}
						</span>
					</div>
				))}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="profileModal"
				title="Admin Profile"
				icon="bi-person-circle"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<div className="text-center">
					<span
						className={`${s.iconCircle} ${s.badgePurple}`}
						style={{ width: 64, height: 64, fontSize: 22 }}
					>
						AD
					</span>
					<h3 className="h5 fw-bold mt-3 mb-1">Admin Developer</h3>
					<p className="small text-muted">admin.dev@company.example · Owner</p>
					<button
						type="button"
						className={`${s.button} ${s.buttonWide} mt-3`}
						onClick={() => onOpen("mfaSetupModal")}
					>
						<i className="bi bi-shield-lock" /> Set Up MFA / 2FA
					</button>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="mfaSetupModal"
				title="Set Up MFA"
				icon="bi-shield-lock"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							disabled={mfaCode.length !== 6}
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								run("mfaSetupModal", {
									message: "MFA enabled for the administrator account.",
									reference: "MFA-TOTP",
								})
							}
						>
							Enable MFA
						</button>
					</>
				}
			>
				{bodyFor(
					"mfaSetupModal",
					<div className="text-center">
						<p className="small text-muted">
							Scan this setup marker with an authenticator, then enter the
							current code.
						</p>
						<div
							className={s.utilityBlock}
							style={{
								width: 160,
								height: 160,
								display: "grid",
								placeItems: "center",
								margin: "0 auto 16px",
							}}
						>
							<i className="bi bi-qr-code" style={{ fontSize: 95 }} />
						</div>
						<span className={s.formLabel}>Six-digit verification code</span>
						<input
							className={s.formControl}
							inputMode="numeric"
							maxLength={6}
							value={mfaCode}
							onChange={(event) =>
								setMfaCode(event.target.value.replace(/\D/g, ""))
							}
							placeholder="000000"
							style={{ textAlign: "center", fontSize: 22, letterSpacing: 8 }}
						/>
					</div>,
				)}
			</ModalFrame>
		</>
	);
}
