import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
	BusyOverlay,
	CodeBlock,
	CopyButton,
	downloadText,
	ModalFrame,
	Receipt,
	useAsyncActions,
} from "../../_shared/DevModalKit-2";
import styles from "../styles/sandbox-testing.module.css";

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}

type FieldKind = "text" | "number" | "select" | "textarea" | "password";
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
	fields?: FieldDef[];
	checks?: string[];
	notice?: string;
	action: string;
	result: string;
	size?: "md" | "lg";
}

const ACTION_MODALS: ActionDef[] = [
	{
		id: "genCustomersModal",
		title: "Generate Mock Customers",
		icon: "bi-people",
		description: "Create realistic but non-sensitive Kenyan customer fixtures.",
		fields: [
			{ label: "Number of records", kind: "number", value: "50" },
			{
				label: "Phone prefix format",
				kind: "select",
				options: [
					"Random (Safaricom, Airtel, Telkom)",
					"Safaricom only (071X, 072X)",
					"Airtel only (073X)",
				],
			},
		],
		checks: [
			"Include dummy KYC document IDs",
			"Include Nairobi-region physical addresses",
		],
		action: "Generate Customers",
		result: "50 test customers generated and added to the sandbox.",
	},
	{
		id: "genInvoicesModal",
		title: "Generate Mock Invoices",
		icon: "bi-receipt",
		description: "Generate invoices across payment and aging states.",
		fields: [
			{ label: "Volume", kind: "number", value: "20" },
			{
				label: "State distribution",
				kind: "select",
				options: ["Mixed (paid, unpaid, overdue)", "All overdue", "All draft"],
			},
			{ label: "Minimum amount (KES)", kind: "number", value: "500" },
			{ label: "Maximum amount (KES)", kind: "number", value: "50000" },
		],
		action: "Generate Invoices",
		result: "20 mixed-state invoices generated.",
	},
	{
		id: "simMpesaModal",
		title: "M-Pesa STK Simulator",
		icon: "bi-phone",
		description: "Trigger deterministic M-Pesa STK outcomes and callbacks.",
		fields: [
			{
				label: "Simulate condition",
				kind: "select",
				options: [
					"0 — Success",
					"1 — Insufficient funds",
					"1032 — Cancelled by user",
					"1037 — PIN timeout",
					"2001 — Invalid PIN",
				],
			},
			{ label: "Target phone number", kind: "text", value: "254712345678" },
			{ label: "Amount", kind: "number", value: "1000" },
		],
		checks: ["Fire webhook callback automatically"],
		action: "Trigger Simulator",
		result:
			"M-Pesa callback fired. Inspect your webhook receiver and live logs.",
	},
	{
		id: "simBankModal",
		title: "Bank Transfer Simulator",
		icon: "bi-bank",
		description: "Inject a PesaLink, EFT, or RTGS event into the sandbox.",
		fields: [
			{
				label: "Transaction type",
				kind: "select",
				options: [
					"Inbound EFT collection",
					"Outbound RTGS disbursement",
					"PesaLink real-time",
				],
			},
			{
				label: "Bank code",
				kind: "select",
				options: [
					"068 — Equity Bank",
					"001 — KCB",
					"011 — Co-op Bank",
					"003 — Absa",
				],
			},
			{ label: "Account number", kind: "text", value: "0681234567" },
			{ label: "Amount", kind: "number", value: "50000" },
			{
				label: "Result payload",
				kind: "select",
				options: [
					"Success — Settled",
					"Failed — Invalid account",
					"Failed — KYC block",
					"Pending — Manual review",
				],
			},
		],
		action: "Simulate Transfer",
		result: "Bank-transfer mock event injected into the sandbox.",
		size: "lg",
	},
	{
		id: "simCardModal",
		title: "Card Payment Simulator",
		icon: "bi-credit-card",
		description: "Magic card fixtures produce stable gateway and 3DS outcomes.",
		fields: [
			{
				label: "Magic card",
				kind: "select",
				options: [
					"4242 4242 4242 4242 — Success",
					"4000 0000 0000 0005 — Insufficient funds",
					"4000 0000 0000 0012 — Fraud decline",
					"4000 0000 0000 3D00 — 3DS challenge",
				],
			},
			{ label: "Currency", kind: "select", options: ["KES", "USD", "EUR"] },
			{ label: "Amount", kind: "number", value: "2500" },
		],
		action: "Process Test Card",
		result: "Card-gateway payload simulated and stored in the live log.",
	},
	{
		id: "simFxModal",
		title: "FX Rate Simulator",
		icon: "bi-currency-exchange",
		description: "Mock exchange-rate behavior to validate pricing logic.",
		fields: [
			{
				label: "Pair",
				kind: "select",
				options: ["USD/KES", "EUR/KES", "GBP/KES"],
			},
			{
				label: "Behavior",
				kind: "select",
				options: ["Static (130.50)", "Volatile (+/- 5%)", "Depreciating KES"],
			},
			{ label: "Spread margin (%)", kind: "number", value: "1.5" },
		],
		action: "Apply Mock Rates",
		result: "FX simulation updated for new sandbox transactions.",
	},
	{
		id: "scenarioE2eModal",
		title: "Run: End-to-End Payment",
		icon: "bi-play-circle",
		description:
			"Initiates a KES 500 payment, simulates customer PIN entry, captures it, and fires the success webhook.",
		notice: "Target webhook: https://api.merchant.example/v1/webhooks/paymo",
		action: "Execute Scenario",
		result:
			"End-to-end scenario completed. Three webhook events were delivered.",
	},
	{
		id: "scenarioFailedModal",
		title: "Run: Failed Payment + Retry",
		icon: "bi-play-circle",
		description:
			"Emits payment.failed for insufficient funds, applies the configured retry delay, and then emits a successful capture.",
		action: "Execute Scenario",
		result:
			"Retry scenario completed. Inspect the event sequence in live logs.",
	},
	{
		id: "scenarioRefundModal",
		title: "Run: Partial Refund",
		icon: "bi-play-circle",
		description:
			"Creates a successful KES 2,000 charge and issues a KES 500 partial refund with refund.processed.",
		action: "Execute Scenario",
		result: "Partial-refund sequence executed successfully.",
	},
	{
		id: "scenarioSubModal",
		title: "Run: Subscription Upgrade",
		icon: "bi-play-circle",
		description:
			"Creates a Basic subscription, advances time by 15 days, upgrades to Premium, and bills the prorated difference.",
		action: "Execute Scenario",
		result:
			"Time-travel subscription upgrade completed with expected proration.",
	},
	{
		id: "scenarioBulkModal",
		title: "Run: Bulk Disbursement",
		icon: "bi-play-circle",
		description:
			"Injects ten payouts: eight successful M-Pesa B2C transfers, one invalid phone, and one MNO timeout.",
		action: "Execute Scenario",
		result:
			"Batch payout simulated with eight successes and two expected failures.",
	},
	{
		id: "runPayrollTestModal",
		title: "Simulate Payroll Run",
		icon: "bi-cash-stack",
		description:
			"Runs dummy employee data through PAYE, NSSF, SHIF, and Housing Levy calculations.",
		action: "Run Engine",
		result: "Payroll calculation engine validated and reports generated.",
	},
	{
		id: "testSuiteModal",
		title: "Download CI/CD Integration Suite",
		icon: "bi-code-slash",
		description:
			"Generate a preconfigured suite for GitHub Actions, GitLab CI, or a local runner.",
		fields: [
			{
				label: "Format",
				kind: "select",
				options: [
					"Postman Collection v2.1",
					"Jest / TypeScript",
					"Python PyTest",
				],
			},
		],
		action: "Generate Suite",
		result: "Integration suite generated and ready for download.",
	},
	{
		id: "owaspReportModal",
		title: "Security Validation (OWASP)",
		icon: "bi-shield-lock",
		description:
			"Scan webhook receivers for signature validation, replay protection, and TLS 1.2+ compliance.",
		notice:
			"The scan is non-destructive and runs only against the sandbox callback URLs you registered.",
		action: "Start Scan",
		result:
			"Security scan started. Results will be available in approximately five minutes.",
	},
	{
		id: "supportTicketModal",
		title: "Technical Support Escalation",
		icon: "bi-headset",
		description:
			"Open a developer ticket and attach relevant sandbox diagnostics.",
		fields: [
			{
				label: "Issue category",
				kind: "select",
				options: [
					"API Error / Bug",
					"Webhook Delivery",
					"Go-Live Certification",
					"Account Limits",
				],
			},
			{
				label: "Environment",
				kind: "select",
				options: ["Sandbox", "Production"],
			},
			{
				label: "Description",
				kind: "textarea",
				value:
					"Webhook requests to our staging receiver occasionally time out.",
			},
		],
		checks: ["Attach failed request logs from the last hour"],
		action: "Submit Ticket",
		result:
			"Ticket TK-9921 created. A technical account manager will respond within four hours.",
		size: "lg",
	},
	{
		id: "slackIntegrationModal",
		title: "Configure Alert Integration",
		icon: "bi-slack",
		description:
			"Send real-time developer alerts to a team collaboration channel.",
		fields: [
			{
				label: "Platform",
				kind: "select",
				options: ["Slack", "Microsoft Teams", "Discord", "Generic Webhook"],
			},
			{
				label: "Incoming webhook URL",
				kind: "password",
				placeholder: "https://hooks.example/…",
			},
		],
		checks: [
			"API error rate above 1%",
			"Webhook delivery failures",
			"Sandbox reset events",
		],
		action: "Connect Workspace",
		result: "Alert integration saved and a test notification queued.",
	},
];

const CONTRACT_ROWS = [
	["/v1/payments", "POST", "Yes", "Passed"],
	["/v1/disbursements", "POST", "Yes", "Passed"],
	["/v1/customers/{id}", "GET", "Yes", "Passed"],
	["/v1/webhooks", "POST", "Yes", "Passed"],
];

const ERROR_ROWS = [
	[
		"err_validation",
		"400",
		"Payload schema violation",
		"Check the details array for the invalid field.",
	],
	[
		"err_unauthorized",
		"401",
		"Invalid or expired API key",
		"Use a valid Bearer token for this environment.",
	],
	[
		"err_idempotency_conflict",
		"409",
		"Duplicate idempotency key",
		"Use a new UUID for a distinct request.",
	],
	[
		"err_insufficient_funds",
		"422",
		"Customer balance too low",
		"Prompt for another payment method.",
	],
	[
		"err_timeout",
		"504",
		"Downstream PSP timeout",
		"Query transaction status after 60 seconds.",
	],
];

const LIVE_LOGS = [
	"POST 200  10:45:01  /v1/payments  145ms",
	"WEBHOOK 200  10:45:06  payment.success → merchant callback  42ms",
	"POST 400  10:48:12  /v1/disbursements  Validation Error",
	"POST 409  10:48:13  /v1/disbursements  Duplicate Idempotency Key",
	"GET 200  10:50:00  /v1/customers/cu_9182  60ms",
];

const CURL = `curl -X POST "https://sandbox.paymo.example/v1/payments" \\
-H "Authorization: Bearer sbx_sk_..." \\
-H "Content-Type: application/json" \\
-H "Idempotency-Key: idemp_8812" \\
-d '{"amount":1500,"phone":"254712345678"}'`;

function Field({ field }: { field: FieldDef }) {
	const control =
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
			/>
		);
	return (
		<div className={styles.formGroup}>
			<span className={styles.formLabel}>{field.label}</span>
			{control}
		</div>
	);
}

export default function SandboxTestingModals({
	active,
	onClose,
	onOpen,
}: Props) {
	const s = styles as Record<string, string>;
	const { busyId, results, run, clear } = useAsyncActions();
	const [secretVisible, setSecretVisible] = useState(false);
	const [resetConfirm, setResetConfirm] = useState("");
	const [errorSearch, setErrorSearch] = useState("");

	const close = () => {
		clear();
		setSecretVisible(false);
		setResetConfirm("");
		setErrorSearch("");
		onClose();
	};

	const actionBody = (id: string, content: ReactNode) => {
		if (busyId === id) return <BusyOverlay styles={s} />;
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
				className={`${s.button} ${s.buttonPrimary}`}
				onClick={() =>
					run(definition.id, {
						message: definition.result,
						reference: `SBX-${Date.now().toString().slice(-6)}`,
					})
				}
			>
				{definition.action}
			</button>
		</>
	);

	const filteredErrors = useMemo(() => {
		const term = errorSearch.trim().toLowerCase();
		return term
			? ERROR_ROWS.filter((row) => row.join(" ").toLowerCase().includes(term))
			: ERROR_ROWS;
	}, [errorSearch]);

	return (
		<>
			<ModalFrame
				active={active}
				id="sandboxCredsModal"
				title="Sandbox Credentials"
				icon="bi-key"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonDanger}`}
							onClick={() =>
								run("sandboxCredsModal", {
									message:
										"Keys rotated successfully. Update your environment variables.",
									reference: "KEY-ROT-8821",
								})
							}
						>
							<i className="bi bi-arrow-repeat" /> Rotate Keys
						</button>
					</>
				}
			>
				{actionBody(
					"sandboxCredsModal",
					<>
						<p className="small text-muted">
							Use these keys only in the sandbox. They cannot move real funds.
						</p>
						<div className={s.formGroup}>
							<span className={s.formLabel}>Client ID</span>
							<div className="d-flex gap-2">
								<input
									className={s.formControl}
									readOnly
									value="sbx_pk_9a8b7c6d5e4f3g2h1i0j"
								/>
								<CopyButton value="sbx_pk_9a8b7c6d5e4f3g2h1i0j" styles={s} />
							</div>
						</div>
						<div className={s.formGroup}>
							<span className={s.formLabel}>Client Secret</span>
							<div className="d-flex gap-2">
								<input
									className={s.formControl}
									readOnly
									type={secretVisible ? "text" : "password"}
									value="sbx_sk_z9y8x7w6v5u4t3s2r1q0"
								/>
								<button
									type="button"
									className={s.button}
									onClick={() => setSecretVisible((value) => !value)}
								>
									<i
										className={`bi ${secretVisible ? "bi-eye-slash" : "bi-eye"}`}
									/>
									<span className={s.srOnly}>Toggle secret</span>
								</button>
								<CopyButton value="sbx_sk_z9y8x7w6v5u4t3s2r1q0" styles={s} />
							</div>
						</div>
						<div className={`${s.notice} ${s.noticeWarning}`}>
							<i className="bi bi-exclamation-triangle me-1" /> Keys were
							rotated 45 days ago. Recommended rotation is every 90 days.
						</div>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="resetSandboxModal"
				title="Reset Sandbox Environment"
				icon="bi-exclamation-octagon"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Cancel
						</button>
						<button
							type="button"
							disabled={resetConfirm !== "RESET"}
							className={`${s.button} ${s.buttonDanger}`}
							onClick={() =>
								run("resetSandboxModal", {
									message:
										"Sandbox fixtures and logs were cleared successfully.",
									reference: "RESET-2026",
								})
							}
						>
							Wipe Data
						</button>
					</>
				}
			>
				{actionBody(
					"resetSandboxModal",
					<>
						<div className={`${s.notice} ${s.noticeDanger}`}>
							This deletes all test customers, mock transactions, invoices, and
							webhook history. Production data is never affected.
						</div>
						<div className={`${s.formGroup} mt-3`}>
							<span className={s.formLabel}>Type RESET to confirm</span>
							<input
								className={s.formControl}
								value={resetConfirm}
								onChange={(event) => setResetConfirm(event.target.value)}
								placeholder="RESET"
							/>
						</div>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="generateTestDataModal"
				title="Generate Mock Data"
				icon="bi-magic"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<div className="row g-3">
					{[
						[
							"Customers",
							"Phones, names, addresses",
							"bi-people",
							"genCustomersModal",
						],
						[
							"Invoices",
							"Paid, partial, and overdue",
							"bi-receipt",
							"genInvoicesModal",
						],
						[
							"Transactions",
							"Mixed card and M-Pesa history",
							"bi-arrow-left-right",
							"scenarioE2eModal",
						],
						[
							"Subscriptions",
							"Recurring billing lifecycles",
							"bi-calendar-check",
							"scenarioSubModal",
						],
					].map(([title, detail, icon, modal]) => (
						<div className="col-sm-6" key={title}>
							<button
								type="button"
								className={`${s.feedItem} ${s.feedItemClickable}`}
								onClick={() => onOpen(modal)}
							>
								<span className={`${s.iconCircle} ${s.badgeInfo}`}>
									<i className={`bi ${icon}`} />
								</span>
								<span className={s.feedText}>
									<span className={s.feedTitle}>{title}</span>
									<span className={`${s.feedSub} d-block`}>{detail}</span>
								</span>
								<i className="bi bi-chevron-right" />
							</button>
						</div>
					))}
				</div>
			</ModalFrame>

			{ACTION_MODALS.map((definition) => (
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
					{actionBody(
						definition.id,
						<>
							<p style={{ color: "var(--pm-ink-soft)", fontSize: 13 }}>
								{definition.description}
							</p>
							{definition.notice ? (
								<div className={s.notice}>{definition.notice}</div>
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
							{definition.checks?.map((label) => (
								<label className={s.checkboxRow} key={label}>
									<input type="checkbox" defaultChecked /> {label}
								</label>
							))}
						</>,
					)}
				</ModalFrame>
			))}

			<ModalFrame
				active={active}
				id="apiContractModal"
				title="API Contract Validation"
				icon="bi-shield-check"
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
							onClick={() =>
								downloadText(
									"paymo-contract-report.json",
									JSON.stringify(
										{ coverage: "100%", endpoints: CONTRACT_ROWS },
										null,
										2,
									),
									"application/json",
								)
							}
						>
							<i className="bi bi-download" /> JSON Report
						</button>
					</>
				}
			>
				<div className="d-flex justify-content-between mb-3">
					<strong>OpenAPI v3.1 Spec Coverage</strong>
					<span className={`${s.badge} ${s.badgeSuccess}`}>100% Passed</span>
				</div>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Endpoint</th>
								<th>Method</th>
								<th>Schema Valid</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{CONTRACT_ROWS.map((row) => (
								<tr key={row[0]}>
									{row.map((cell, index) => (
										<td key={cell}>
											{index === 3 ? (
												<span className={`${s.badge} ${s.badgeSuccess}`}>
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
				id="certificationModal"
				title="Go-Live Certification Checklist"
				icon="bi-patch-check"
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
							onClick={() => onOpen("owaspReportModal")}
						>
							Complete Security Scan
						</button>
					</>
				}
			>
				<div className={s.progress}>
					<div
						className={s.progressBar}
						style={{ width: "85%", background: "var(--pm-accent)" }}
					/>
				</div>
				<div className="mt-3">
					{[
						[
							"API Authentication Verified",
							true,
							"OAuth 2.0 and API keys accepted",
						],
						[
							"Idempotency Implemented",
							true,
							"Duplicate requests return 409 Conflict",
						],
						[
							"Webhook Signatures Validated",
							true,
							"HMAC-SHA256 headers verified",
						],
						[
							"Security Scan Passed",
							false,
							"Requires zero critical or high findings",
						],
						[
							"Business KYC Approved",
							false,
							"Company and director documents reviewed",
						],
					].map(([label, checked, detail]) => (
						<label className={s.checkboxRow} key={String(label)}>
							<input type="checkbox" checked={Boolean(checked)} readOnly />{" "}
							<span>
								<strong>{label}</strong>
								<span className={`${s.feedSub} d-block`}>{detail}</span>
							</span>
						</label>
					))}
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="liveLogsModal"
				title="Live HTTP Logs (Sandbox)"
				icon="bi-terminal"
				size="fullscreen"
				onClose={close}
				styles={s}
				footer={
					<>
						<button
							type="button"
							className={s.button}
							onClick={() =>
								downloadText(
									"sandbox-logs.har",
									JSON.stringify({ log: { entries: LIVE_LOGS } }, null, 2),
									"application/json",
								)
							}
						>
							<i className="bi bi-download" /> Export HAR
						</button>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
					</>
				}
			>
				<div className={s.formGroup}>
					<span className={s.formLabel}>Filter logs</span>
					<input
						className={s.formControl}
						placeholder="Endpoint, status, or reference"
					/>
				</div>
				<div
					className={s.logPanel}
					style={{ maxHeight: "calc(94vh - 260px)", minHeight: 320 }}
				>
					<pre>{LIVE_LOGS.join("\n\n")}</pre>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="curlExportModal"
				title="Export Request"
				icon="bi-file-earmark-code"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<CopyButton value={CURL} styles={s} label="Copy cURL" />
					</>
				}
			>
				<p className="small text-muted">
					Reproduce the selected request locally with this redacted command.
				</p>
				<CodeBlock styles={s} code={CURL} />
				<button
					type="button"
					className={`${s.button} ${s.buttonWide}`}
					onClick={() =>
						downloadText(
							"paymo-request.har",
							JSON.stringify({ request: CURL }, null, 2),
							"application/json",
						)
					}
				>
					<i className="bi bi-download" /> Download HAR
				</button>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="payloadDiffModal"
				title="Payload Comparator"
				icon="bi-file-diff"
				size="xl"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<p className="small text-muted">
					Compare a failed payload with the OpenAPI schema expectation.
				</p>
				<div className="row g-3">
					<div className="col-md-6">
						<h3 className="h6 text-danger fw-bold">Failed Request (400)</h3>
						<CodeBlock
							styles={s}
							code={
								'{\n  "amount": 1500,\n  "phoneNumber": "0712345678",\n  "currency": "KES"\n}'
							}
						/>
					</div>
					<div className="col-md-6">
						<h3 className="h6 text-success fw-bold">Schema Expectation</h3>
						<CodeBlock
							styles={s}
							code={
								'{\n  "amount": 1500,\n  "phone_number": "254712345678",\n  "currency": "KES"\n}'
							}
						/>
					</div>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="errorCodeModal"
				title="Error Code Reference"
				icon="bi-journal-code"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close
					</button>
				}
			>
				<input
					className={`${s.formControl} mb-3`}
					value={errorSearch}
					onChange={(event) => setErrorSearch(event.target.value)}
					placeholder="Search code, status, or description"
				/>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Code</th>
								<th>HTTP</th>
								<th>Description</th>
								<th>Resolution</th>
							</tr>
						</thead>
						<tbody>
							{filteredErrors.map((row) => (
								<tr key={row[0]}>
									{row.map((cell, index) => (
										<td key={cell}>
											{index === 0 ? <code>{cell}</code> : cell}
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
				id="emergencyHotlineModal"
				title="Emergency Hotline (SEV1)"
				icon="bi-telephone-fill"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						<CopyButton
							value="+254 800 720 000, PIN 4892"
							styles={s}
							label="Copy Number"
						/>
					</>
				}
			>
				<div className="text-center">
					<p className="small text-muted">
						Use only for critical production outages where payment processing is
						fully halted.
					</p>
					<div className={`${s.notice} ${s.noticeDanger}`}>
						<strong style={{ fontSize: 23 }}>+254 800 720 000</strong>
						<div>Enterprise support PIN: 4892</div>
					</div>
					<button
						type="button"
						className={`${s.button} mt-3`}
						onClick={() => onOpen("supportTicketModal")}
					>
						Open Standard Ticket Instead
					</button>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="devProfileModal"
				title="Developer Profile"
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
						className={`${s.iconCircle} ${s.badgeInfo}`}
						style={{ width: 64, height: 64, fontSize: 22 }}
					>
						AD
					</span>
					<h3 className="h5 fw-bold mt-3 mb-1">Alex Dev</h3>
					<p className="small text-muted">
						alex.dev@merchant.example · API Admin
					</p>
					<div className="row g-2 text-start">
						<div className="col-6">
							<div className={s.utilityBlock}>
								<span className={s.feedSub}>Account Tier</span>
								<strong className="d-block">Enterprise</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={s.utilityBlock}>
								<span className={s.feedSub}>Rate Limit</span>
								<strong className="d-block">500 req/sec</strong>
							</div>
						</div>
					</div>
					<button
						type="button"
						className={`${s.button} ${s.buttonWide} mt-3`}
						onClick={() => onOpen("slackIntegrationModal")}
					>
						<i className="bi bi-slack" /> Manage Alert Integrations
					</button>
				</div>
			</ModalFrame>
		</>
	);
}
