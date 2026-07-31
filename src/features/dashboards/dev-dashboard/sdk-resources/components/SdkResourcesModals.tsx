import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
import styles from "../styles/sdk-resources.module.css";

interface Props {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}

interface InstallDef {
	id: string;
	title: string;
	icon: string;
	intro: string;
	codes: string[];
	note?: string;
}

const INSTALL_DEFS: InstallDef[] = [
	{
		id: "installJsSdkModal",
		title: "Install Node.js / Browser SDK",
		icon: "bi-filetype-js",
		intro:
			"Choose the package that matches your runtime. Each option uses the same typed PayMo client.",
		codes: [
			"npm install @paymo/paymo-node\n# or\nyarn add @paymo/paymo-node",
			"import { PayMoClient } from '@paymo/paymo-node';\nconst paymo = new PayMoClient({ apiKey: process.env.PAYMO_SECRET_KEY });",
			"npm install @paymo/paymo-react\nimport { PayMoProvider, CheckoutElement } from '@paymo/paymo-react';",
		],
		note: "Browser builds are also available from the package's ESM export. Keep secret keys on the server.",
	},
	{
		id: "installPythonSdkModal",
		title: "Install Python SDK",
		icon: "bi-filetype-py",
		intro:
			"Python 3.7+ is supported, including an aiohttp-based asynchronous client.",
		codes: [
			"pip install paymo-python",
			"from paymo.async_client import AsyncPayMo\n\nclient = AsyncPayMo(api_key='sk_test_123')\nres = await client.collections.mpesa_push(phone='254712345678', amount=500)",
		],
	},
	{
		id: "installPhpSdkModal",
		title: "Install PHP SDK",
		icon: "bi-filetype-php",
		intro: "Install the PHP 7.4+/8.x client with Composer.",
		codes: [
			"composer require paymo/paymo-php",
			"$paymo = new \\PayMo\\Client('sk_test_123');\n$balance = $paymo->wallet->getBalance();\necho $balance->available_kes;",
		],
	},
	{
		id: "installJavaSdkModal",
		title: "Install Java SDK",
		icon: "bi-filetype-java",
		intro: "Use Maven or Gradle with Java 11 and later.",
		codes: [
			"<dependency>\n  <groupId>com.paymo</groupId>\n  <artifactId>paymo-java</artifactId>\n  <version>2.1.0</version>\n</dependency>",
			"implementation 'com.paymo:paymo-java:2.1.0'",
		],
	},
	{
		id: "installFlutterSdkModal",
		title: "Install Flutter Plugin",
		icon: "bi-phone",
		intro:
			"Add the drop-in Flutter checkout package to your mobile application.",
		codes: ["flutter pub add paymo_flutter"],
		note: "Android minSdkVersion must be 21 or later. iOS deployment target must be 13 or later.",
	},
	{
		id: "installAndroidSdkModal",
		title: "Android SDK (Kotlin / Java)",
		icon: "bi-android2",
		intro:
			"Add the core package and optional UI components to your app-level Gradle file.",
		codes: [
			"dependencies {\n  implementation 'com.paymo.android:core:3.0.1'\n  implementation 'com.paymo.android:ui:3.0.1'\n}",
		],
	},
	{
		id: "installIosSdkModal",
		title: "iOS SDK (Swift)",
		icon: "bi-apple",
		intro: "Install using CocoaPods or Swift Package Manager.",
		codes: [
			"pod 'PayMoSDK', '~> 2.0'",
			"https://github.com/paymo/paymo-ios.git",
		],
	},
];

const RELEASE_NOTES = [
	{
		title: "Node.js SDK v3.2.0",
		date: "20 June 2026",
		detail:
			"Added exponential backoff for rate-limited endpoints and corrected Disbursement types.",
	},
	{
		title: "Flutter SDK Beta 2",
		date: "15 June 2026",
		detail:
			"Improved keyboard avoidance on iOS and added dark-mode checkout support.",
	},
	{
		title: "Webhook Signature Requirement",
		date: "10 June 2026",
		detail:
			"HMAC-SHA256 verification is now available for every webhook endpoint.",
	},
];

const REPOSITORIES = [
	{
		name: "paymo-node",
		description: "Official Node.js and TypeScript SDK",
		command: "npm install @paymo/paymo-node",
	},
	{
		name: "paymo-python",
		description: "Official synchronous and async Python SDK",
		command: "pip install paymo-python",
	},
	{
		name: "woocommerce-paymo",
		description: "WooCommerce payment gateway plugin",
		command: "wp plugin install paymo-woocommerce",
	},
	{
		name: "nextjs-ecommerce-template",
		description: "Full-stack storefront starter",
		command: "npx create-next-app -e paymo/nextjs-ecommerce-template",
	},
];

const CHANGELOG = [
	"vAdded maxRetries option and complete Disbursement types.",
	"vFixed client timeout behavior on slow networks.",
	"vAdded PesaLink bank-transfer APIs.",
	"vTypeScript rewrite with new client initialization.",
];

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className={styles.formGroup}>
			<span className={styles.formLabel}>{label}</span>
			{children}
		</div>
	);
}

export default function SdkResourcesModals({ active, onClose, onOpen }: Props) {
	const s = styles as Record<string, string>;
	const { busyId, results, run, clear } = useAsyncActions();
	const [wooStep, setWooStep] = useState(1);
	const [webhookTab, setWebhookTab] = useState<"node" | "php">("node");
	const [playgroundResponse, setPlaygroundResponse] = useState(
		"// Select Send Request to run this sandbox call.",
	);
	const [sending, setSending] = useState(false);
	const playgroundTimer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(playgroundTimer.current), []);

	const close = () => {
		clear();
		setWooStep(1);
		setWebhookTab("node");
		setPlaygroundResponse("// Select Send Request to run this sandbox call.");
		setSending(false);
		onClose();
	};

	const bodyFor = (id: string, body: ReactNode) => {
		if (busyId === id) return <BusyOverlay styles={s} />;
		if (results[id])
			return (
				<Receipt
					styles={s}
					message={results[id].message}
					reference={results[id].reference}
				/>
			);
		return body;
	};

	const footer = (id: string, actionLabel?: string, result?: string) => (
		<>
			<button type="button" className={s.button} onClick={close}>
				{actionLabel ? "Cancel" : "Close"}
			</button>
			{actionLabel && result ? (
				<button
					type="button"
					className={`${s.button} ${s.buttonPrimary}`}
					onClick={() =>
						run(id, {
							message: result,
							reference: `DEV-${Date.now().toString().slice(-6)}`,
						})
					}
				>
					{actionLabel}
				</button>
			) : null}
		</>
	);

	const sendPlayground = () => {
		setSending(true);
		playgroundTimer.current = window.setTimeout(() => {
			setSending(false);
			setPlaygroundResponse(
				JSON.stringify(
					{
						status: "success",
						message: "STK Push initiated successfully",
						data: {
							transaction_id: "WS_1029384756",
							merchant_request_id: "12345-67890-1",
							checkout_request_id: "ws_CO_25072026143200",
							customer_message: "Request accepted for processing",
						},
					},
					null,
					2,
				),
			);
		}, 650);
	};

	const webhookCode =
		webhookTab === "node"
			? `const crypto = require('crypto');\napp.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {\n  const hash = crypto.createHmac('sha256', process.env.PAYMO_WH_SECRET)\n    .update(req.body).digest('hex');\n  if (hash !== req.headers['x-paymo-signature']) return res.sendStatus(401);\n  res.sendStatus(200);\n});`
			: `$payload = file_get_contents('php://input');\n$signature = $_SERVER['HTTP_X_PAYMO_SIGNATURE'] ?? '';\n$hash = hash_hmac('sha256', $payload, getenv('PAYMO_WH_SECRET'));\nif (!hash_equals($hash, $signature)) { http_response_code(401); exit; }`;

	return (
		<>
			{INSTALL_DEFS.map((definition) => (
				<ModalFrame
					key={definition.id}
					active={active}
					id={definition.id}
					title={definition.title}
					icon={definition.icon}
					size="lg"
					onClose={close}
					styles={s}
					footer={footer(definition.id)}
				>
					<p style={{ color: "var(--pm-ink-soft)", fontSize: 13 }}>
						{definition.intro}
					</p>
					{definition.codes.map((code) => (
						<CodeBlock key={code} code={code} styles={s} />
					))}
					{definition.note ? (
						<div className={s.notice}>
							<i className="bi bi-info-circle me-1" /> {definition.note}
						</div>
					) : null}
				</ModalFrame>
			))}

			<ModalFrame
				active={active}
				id="woocommercePluginModal"
				title="WooCommerce Integration"
				icon="bi-wordpress"
				size="lg"
				onClose={close}
				styles={s}
				footer={
					<>
						<button type="button" className={s.button} onClick={close}>
							Close
						</button>
						{wooStep < 3 ? (
							<button
								type="button"
								className={`${s.button} ${s.buttonPrimary}`}
								onClick={() => setWooStep((step) => Math.min(3, step + 1))}
							>
								{wooStep === 1 ? "Download & Continue" : "Next Step"}
							</button>
						) : (
							<button
								type="button"
								className={`${s.button} ${s.buttonAccent}`}
								onClick={() =>
									run("woocommercePluginModal", {
										message:
											"WooCommerce keys saved. The payment method is ready for sandbox checkout.",
										reference: "WOO-4.1.2",
									})
								}
							>
								Save Configuration
							</button>
						)}
					</>
				}
			>
				{bodyFor(
					"woocommercePluginModal",
					<>
						<Stepper
							labels={["Download", "Upload", "Keys"]}
							current={wooStep}
							styles={s}
						/>
						{wooStep === 1 ? (
							<div className="text-center">
								<span className={`${s.iconCircle} ${s.badgePurple}`}>
									<i className="bi bi-file-zip" />
								</span>
								<h3 className="h6 fw-bold mt-3">
									paymo-woocommerce-v4.1.2.zip
								</h3>
								<p className="text-muted small">
									Verified package · SHA-256 manifest included
								</p>
								<button
									type="button"
									className={s.button}
									onClick={() =>
										downloadText(
											"paymo-woocommerce-install.txt",
											"Mock plugin package manifest for PayMo WooCommerce v4.1.2",
										)
									}
								>
									<i className="bi bi-download" /> Download Package Manifest
								</button>
							</div>
						) : null}
						{wooStep === 2 ? (
							<ol style={{ color: "var(--pm-ink-soft)", lineHeight: 1.9 }}>
								<li>Open WordPress Admin and select Plugins → Add New.</li>
								<li>Choose Upload Plugin and select the downloaded package.</li>
								<li>
									Install, activate, then open WooCommerce payment settings.
								</li>
							</ol>
						) : null}
						{wooStep === 3 ? (
							<>
								<Field label="Public Key">
									<input
										className={s.formControl}
										defaultValue="pk_test_a8b9c0"
									/>
								</Field>
								<Field label="Secret Key">
									<input
										type="password"
										className={s.formControl}
										defaultValue="sk_test_12345"
									/>
								</Field>
								<label className={s.checkboxRow}>
									<input type="checkbox" defaultChecked /> Enable sandbox mode
									until certification is complete.
								</label>
							</>
						) : null}
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="shopifyPluginModal"
				title="Shopify App"
				icon="bi-bag-fill"
				onClose={close}
				styles={s}
				footer={footer(
					"shopifyPluginModal",
					"Prepare Installation",
					"Shopify authorization package prepared. Review the generated installation manifest in your partner portal.",
				)}
			>
				{bodyFor(
					"shopifyPluginModal",
					<div className="text-center">
						<i
							className="bi bi-shop"
							style={{ color: "#699529", fontSize: 52 }}
						/>
						<p className="mt-3" style={{ color: "var(--pm-ink-soft)" }}>
							The PayMo gateway uses Shopify's approved app authorization flow.
							This demo prepares a safe installation manifest without opening an
							unverified URL.
						</p>
					</div>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="magentoPluginModal"
				title="Magento 2 Extension"
				icon="bi-box-fill"
				onClose={close}
				styles={s}
				footer={footer("magentoPluginModal")}
			>
				<p className="small">
					Run these commands from the Magento root directory.
				</p>
				<CodeBlock
					styles={s}
					code={
						"composer require paymo/module-magento2\nphp bin/magento setup:upgrade\nphp bin/magento setup:di:compile\nphp bin/magento cache:clean"
					}
				/>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="apiPlaygroundModal"
				title="Interactive API Playground"
				icon="bi-braces"
				size="xl"
				onClose={close}
				styles={s}
				footer={
					<button type="button" className={s.button} onClick={close}>
						Close Playground
					</button>
				}
			>
				<div className="row g-3">
					<div className="col-md-4">
						<Field label="Environment">
							<select className={s.formControl}>
								<option>Sandbox (sk_test_…)</option>
								<option disabled>Production requires MFA</option>
							</select>
						</Field>
						<Field label="Endpoint">
							<select className={s.formControl}>
								<option>POST /v1/mpesa/stkpush</option>
								<option>GET /v1/transactions/:id</option>
								<option>POST /v1/disbursements</option>
							</select>
						</Field>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary} ${s.buttonWide}`}
							disabled={sending}
							onClick={sendPlayground}
						>
							{sending ? (
								<>
									<span className="spinner-border spinner-border-sm" /> Sending…
								</>
							) : (
								<>
									<i className="bi bi-send" /> Send Request
								</>
							)}
						</button>
					</div>
					<div className="col-md-4">
						<Field label="Request body">
							<textarea
								className={s.formControl}
								rows={13}
								defaultValue={
									'{\n  "amount": 100,\n  "phone": "254712345678",\n  "reference": "TEST-100",\n  "callback_url": "https://example.test/webhook"\n}'
								}
							/>
						</Field>
					</div>
					<div className="col-md-4">
						<Field label="Response">
							<textarea
								className={s.formControl}
								rows={13}
								readOnly
								value={playgroundResponse}
								style={{ color: "#047857", fontFamily: "monospace" }}
							/>
						</Field>
					</div>
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="githubAccessModal"
				title="PayMo Open Source Repositories"
				icon="bi-github"
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
							className={s.button}
							onClick={() => onOpen("installJsSdkModal")}
						>
							<i className="bi bi-box-seam" /> Open Node Guide
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary}`}
							onClick={() =>
								downloadText(
									"paymo-repositories.json",
									JSON.stringify(REPOSITORIES, null, 2),
									"application/json",
								)
							}
						>
							<i className="bi bi-download" /> Download Catalog
						</button>
					</>
				}
			>
				<div className={s.feedList}>
					{REPOSITORIES.map((repository) => (
						<div className={s.feedItem} key={repository.name}>
							<span className={`${s.iconCircle} ${s.badgePurple}`}>
								<i className="bi bi-github" />
							</span>
							<div className={s.feedText}>
								<div className={s.feedTitle}>{repository.name}</div>
								<div className={s.feedSub}>{repository.description}</div>
							</div>
							<CopyButton
								value={repository.command}
								styles={s}
								label="Copy install"
							/>
						</div>
					))}
				</div>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="ecommerceStarterModal"
				title="Full-Stack E-Commerce Template"
				icon="bi-shop-window"
				onClose={close}
				styles={s}
				footer={footer(
					"ecommerceStarterModal",
					"Create Project",
					"E-commerce starter manifest generated with checkout and webhook examples.",
				)}
			>
				{bodyFor(
					"ecommerceStarterModal",
					<>
						<p className="small text-muted">
							Next.js App Router, Prisma, PayMo Node SDK, M-Pesa STK Push, and
							card checkout.
						</p>
						<CodeBlock
							styles={s}
							code="npx create-next-app -e paymo/nextjs-ecommerce-template"
						/>
					</>,
				)}
			</ModalFrame>
			<ModalFrame
				active={active}
				id="saasBillingStarterModal"
				title="SaaS Subscription Billing Template"
				icon="bi-arrow-repeat"
				onClose={close}
				styles={s}
				footer={footer(
					"saasBillingStarterModal",
					"Create Project",
					"Django subscription starter manifest generated with retry and dunning jobs.",
				)}
			>
				{bodyFor(
					"saasBillingStarterModal",
					<>
						<p className="small text-muted">
							Django application demonstrating tiers, tokenization, renewal
							jobs, and dunning retries.
						</p>
						<CodeBlock
							styles={s}
							code="git clone paymo/django-saas-billing\ncd django-saas-billing\npip install -r requirements.txt"
						/>
					</>,
				)}
			</ModalFrame>
			<ModalFrame
				active={active}
				id="payrollStarterModal"
				title="Payroll & Bulk Disbursement"
				icon="bi-people"
				onClose={close}
				styles={s}
				footer={footer(
					"payrollStarterModal",
					"Create Project",
					"Laravel payroll starter manifest generated with CSV parsing and B2C tracking.",
				)}
			>
				{bodyFor(
					"payrollStarterModal",
					<>
						<p className="small text-muted">
							Laravel payroll and bulk disbursement starter with KRA-ready
							report hooks.
						</p>
						<CodeBlock
							styles={s}
							code="composer create-project paymo/laravel-payroll-starter my-app"
						/>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="posIntegrationModal"
				title="POS & CMS Integrations"
				icon="bi-printer"
				onClose={close}
				styles={s}
				footer={footer(
					"posIntegrationModal",
					"Generate Setup Guide",
					"A setup guide was generated for PrestaShop, OpenCart, Wix, and Android POS terminals.",
				)}
			>
				{bodyFor(
					"posIntegrationModal",
					<>
						<div className="text-center">
							<i
								className="bi bi-tools"
								style={{ fontSize: 48, color: "var(--pm-muted)" }}
							/>
						</div>
						<Field label="Platform">
							<select className={s.formControl}>
								<option>PrestaShop 1.7</option>
								<option>OpenCart 4</option>
								<option>Wix App</option>
								<option>Android POS</option>
							</select>
						</Field>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="sdkReleaseNotesModal"
				title="SDK & Developer Updates"
				icon="bi-bell"
				onClose={close}
				styles={s}
				footer={footer("sdkReleaseNotesModal")}
			>
				{RELEASE_NOTES.map((note) => (
					<article className={s.statusRow} key={note.title}>
						<div>
							<strong>{note.title}</strong>
							<div className={s.feedSub}>{note.date}</div>
							<div className="small mt-1">{note.detail}</div>
						</div>
					</article>
				))}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="reportBugModal"
				title="Report an SDK / API Bug"
				icon="bi-bug"
				onClose={close}
				styles={s}
				footer={footer(
					"reportBugModal",
					"Submit Bug",
					"Bug report submitted to the engineering triage queue.",
				)}
			>
				{bodyFor(
					"reportBugModal",
					<>
						<Field label="Component">
							<select className={s.formControl}>
								<option>Node.js SDK</option>
								<option>Python SDK</option>
								<option>REST API</option>
								<option>WooCommerce Plugin</option>
								<option>Other</option>
							</select>
						</Field>
						<Field label="Title">
							<input
								className={s.formControl}
								placeholder="Brief issue summary"
							/>
						</Field>
						<Field label="Steps to reproduce">
							<textarea
								className={s.formControl}
								placeholder="Include expected and actual behavior"
							/>
						</Field>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="requestSdkFeatureModal"
				title="Request a Feature"
				icon="bi-lightbulb"
				onClose={close}
				styles={s}
				footer={footer(
					"requestSdkFeatureModal",
					"Submit Request",
					"Feature request added to the public roadmap voting queue.",
				)}
			>
				{bodyFor(
					"requestSdkFeatureModal",
					<>
						<Field label="Category">
							<select className={s.formControl}>
								<option>New SDK Language</option>
								<option>New CMS Plugin</option>
								<option>API Endpoint Enhancement</option>
								<option>Webhook Event Type</option>
							</select>
						</Field>
						<Field label="Description">
							<textarea
								className={s.formControl}
								placeholder="Describe the use case and expected benefit"
							/>
						</Field>
					</>,
				)}
			</ModalFrame>

			<ModalFrame
				active={active}
				id="webhookSnippetModal"
				title="Webhook Signature Migration"
				icon="bi-shield-check"
				size="lg"
				onClose={close}
				styles={s}
				footer={footer("webhookSnippetModal")}
			>
				<p className="small text-muted">
					Verify the x-paymo-signature header before processing any event.
				</p>
				<div className={s.tabs}>
					<button
						type="button"
						className={`${s.tab} ${webhookTab === "node" ? s.tabActive : ""}`}
						onClick={() => setWebhookTab("node")}
					>
						Node.js Express
					</button>
					<button
						type="button"
						className={`${s.tab} ${webhookTab === "php" ? s.tabActive : ""}`}
						onClick={() => setWebhookTab("php")}
					>
						PHP
					</button>
				</div>
				<CodeBlock styles={s} code={webhookCode} />
			</ModalFrame>

			<ModalFrame
				active={active}
				id="checkoutWidgetModal"
				title="Drop-in Checkout Widget"
				icon="bi-window-sidebar"
				size="lg"
				onClose={close}
				styles={s}
				footer={footer("checkoutWidgetModal")}
			>
				<p className="small text-muted">
					Embed a secure payment form without handling sensitive card data.
				</p>
				<CodeBlock
					styles={s}
					code={`<script src="https://js.paymo.example/v1/widget.js"></script>\n<button type="button" id="pay-btn">Pay KES 1,500</button>\n<script>\n  const widget = PayMoWidget({ publicKey: 'pk_test_12345', amount: 1500, currency: 'KES' });\n  document.getElementById('pay-btn').onclick = () => widget.open();\n</script>`}
				/>
			</ModalFrame>

			<ModalFrame
				active={active}
				id="npmChangelogModal"
				title="Node SDK Changelog"
				icon="bi-filetype-js"
				onClose={close}
				styles={s}
				footer={footer("npmChangelogModal")}
			>
				<ul style={{ color: "var(--pm-ink-soft)", lineHeight: 1.8 }}>
					{CHANGELOG.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</ModalFrame>
		</>
	);
}
