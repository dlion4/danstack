import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { CodeBlock } from "../../_shared/DevModalKit-2";
import SdkResourcesModals from "../components/SdkResourcesModals";
import styles from "../styles/sdk-resources.module.css";

type Tone = "success" | "warning" | "danger" | "info" | "purple";

interface SdkTab {
	key: string;
	label: string;
	icon: string;
	color: string;
	title: string;
	description: string;
	install: string;
	sample: string;
	modal: string;
}

interface SdkResourcesData {
	updates: Array<{
		badge: string;
		tone: Tone;
		title: string;
		detail: string;
		action: string;
		modal: string;
	}>;
	support: Array<{
		icon: string;
		tone: Tone;
		title: string;
		detail: string;
		action: string;
		modal: string;
	}>;
	toolkit: Array<{ label: string; icon: string; color: string; modal: string }>;
	sdkTabs: SdkTab[];
	plugins: Array<{
		name: string;
		meta: string;
		icon: string;
		color: string;
		action: string;
		modal: string;
	}>;
	starters: Array<{
		title: string;
		stack: string;
		description: string;
		icon: string;
		tone: Tone;
		modal: string;
	}>;
}

export const initialMockData: SdkResourcesData = {
	updates: [
		{
			badge: "V3",
			tone: "purple",
			title: "Node.js SDK v3.2.0 released",
			detail: "Enhanced error handling and retries",
			action: "Notes",
			modal: "npmChangelogModal",
		},
		{
			badge: "FL",
			tone: "info",
			title: "Flutter Plugin Beta 2",
			detail: "Seamless STK Push overlays",
			action: "Get SDK",
			modal: "installFlutterSdkModal",
		},
		{
			badge: "WH",
			tone: "warning",
			title: "Webhook Signature Update",
			detail: "Migration guidance is available",
			action: "Guide",
			modal: "webhookSnippetModal",
		},
	],
	support: [
		{
			icon: "bi-bug",
			tone: "danger",
			title: "Found an issue in an SDK?",
			detail: "Report bugs directly to engineering",
			action: "Report",
			modal: "reportBugModal",
		},
		{
			icon: "bi-lightbulb",
			tone: "success",
			title: "Need a specific feature?",
			detail: "Request an endpoint or SDK capability",
			action: "Request",
			modal: "requestSdkFeatureModal",
		},
		{
			icon: "bi-github",
			tone: "purple",
			title: "Contribute to PayMo Open Source",
			detail: "Review contribution guidelines and repos",
			action: "View",
			modal: "githubAccessModal",
		},
	],
	toolkit: [
		{
			label: "Node SDK",
			icon: "bi-filetype-js",
			color: "#d97706",
			modal: "installJsSdkModal",
		},
		{
			label: "Python SDK",
			icon: "bi-filetype-py",
			color: "#2563eb",
			modal: "installPythonSdkModal",
		},
		{
			label: "PHP SDK",
			icon: "bi-filetype-php",
			color: "#4f46e5",
			modal: "installPhpSdkModal",
		},
		{
			label: "Java SDK",
			icon: "bi-filetype-java",
			color: "#dc2626",
			modal: "installJavaSdkModal",
		},
		{
			label: "Android SDK",
			icon: "bi-android2",
			color: "#059669",
			modal: "installAndroidSdkModal",
		},
		{
			label: "iOS SDK",
			icon: "bi-apple",
			color: "#111827",
			modal: "installIosSdkModal",
		},
		{
			label: "Drop-in Widget",
			icon: "bi-window-sidebar",
			color: "#7c3aed",
			modal: "checkoutWidgetModal",
		},
		{
			label: "Interactive API",
			icon: "bi-braces",
			color: "#059669",
			modal: "apiPlaygroundModal",
		},
	],
	sdkTabs: [
		{
			key: "node",
			label: "Node.js / TypeScript",
			icon: "bi-filetype-js",
			color: "#d97706",
			title: "PayMo Node.js SDK",
			description:
				"Fully typed with TypeScript; Promise-based; browser and Node environments supported.",
			install: "npm install @paymo/paymo-node",
			sample: `import { PayMoClient } from '@paymo/paymo-node';\n\nconst paymo = new PayMoClient({\n  apiKey: process.env.PAYMO_SECRET_KEY,\n  environment: 'sandbox'\n});\n\nconst response = await paymo.collections.requestMpesaPayment({\n  amount: 1500,\n  phoneNumber: '254712345678',\n  reference: 'INV-2025-001',\n  description: 'Payment for web services'\n});\n\nconsole.log(response.transactionId);`,
			modal: "installJsSdkModal",
		},
		{
			key: "python",
			label: "Python",
			icon: "bi-filetype-py",
			color: "#2563eb",
			title: "PayMo Python SDK",
			description:
				"Python 3.7+ support with synchronous and asynchronous clients.",
			install: "pip install paymo-python",
			sample: `from paymo import PayMoClient\n\npaymo = PayMoClient(api_key="sk_test_12345")\ntransfer = paymo.disbursements.create(\n    amount=50000, currency="KES",\n    destination={"bank_code": "068", "account_number": "0123456789"},\n    purpose="Salary payment"\n)\nprint(transfer.status)`,
			modal: "installPythonSdkModal",
		},
		{
			key: "php",
			label: "PHP",
			icon: "bi-filetype-php",
			color: "#4f46e5",
			title: "PayMo PHP SDK",
			description:
				"PHP 7.4+ and 8.x compatible. A Laravel package is also available.",
			install: "composer require paymo/paymo-php",
			sample: `$paymo = new \\PayMo\\PayMoClient('sk_test_12345');\n$invoice = $paymo->invoices->create([\n  'customer' => ['name' => 'John Doe', 'email' => 'john@example.com'],\n  'items' => [['name' => 'Consulting', 'amount' => 10000]],\n  'due_date' => '2026-08-01'\n]);\necho $invoice->payment_url;`,
			modal: "installPhpSdkModal",
		},
		{
			key: "flutter",
			label: "Flutter / Dart",
			icon: "bi-phone",
			color: "#0284c7",
			title: "PayMo Flutter Plugin",
			description: "Drop-in payment UI for iOS and Android apps.",
			install: "flutter pub add paymo_flutter",
			sample: `await PayMoCheckout.start(\n  context,\n  config: PayMoConfig(\n    publicKey: 'pk_test_12345',\n    amount: 1500,\n    currency: 'KES'\n  ),\n  onSuccess: (result) => print(result.reference),\n);`,
			modal: "installFlutterSdkModal",
		},
		{
			key: "java",
			label: "Java / Spring",
			icon: "bi-filetype-java",
			color: "#dc2626",
			title: "PayMo Java SDK",
			description: "Java 11+ compatible with Maven and Gradle support.",
			install: "implementation 'com.paymo:paymo-java:2.1.0'",
			sample: `PayMoClient client = PayMoClient.builder()\n  .apiKey(System.getenv("PAYMO_SECRET_KEY"))\n  .environment(Environment.SANDBOX)\n  .build();`,
			modal: "installJavaSdkModal",
		},
	],
	plugins: [
		{
			name: "WooCommerce",
			meta: "v4.1.2 · 50k+ installs",
			icon: "bi-wordpress",
			color: "#7f54b3",
			action: "Configure",
			modal: "woocommercePluginModal",
		},
		{
			name: "Shopify",
			meta: "Official App Store",
			icon: "bi-bag-fill",
			color: "#699529",
			action: "Install App",
			modal: "shopifyPluginModal",
		},
		{
			name: "Magento 2",
			meta: "v2.3 and v2.4",
			icon: "bi-box-fill",
			color: "#f26322",
			action: "Download",
			modal: "magentoPluginModal",
		},
		{
			name: "PrestaShop",
			meta: "v1.7 module",
			icon: "bi-cart",
			color: "#3b82f6",
			action: "Configure",
			modal: "posIntegrationModal",
		},
		{
			name: "Wix App",
			meta: "Marketplace package",
			icon: "bi-browser-edge",
			color: "#111827",
			action: "Install App",
			modal: "posIntegrationModal",
		},
		{
			name: "Custom Widget",
			meta: "Drop-in HTML/JS UI",
			icon: "bi-code-slash",
			color: "#4f46e5",
			action: "Get Code",
			modal: "checkoutWidgetModal",
		},
	],
	starters: [
		{
			title: "Full-Stack E-Commerce",
			stack: "Next.js + Tailwind",
			description:
				"Storefront with cart, checkout, M-Pesa STK Push, and webhook reconciliation.",
			icon: "bi-shop-window",
			tone: "purple",
			modal: "ecommerceStarterModal",
		},
		{
			title: "SaaS Subscription Billing",
			stack: "Python + Django",
			description:
				"Tiered plans, retry dunning logic, and card tokenization examples.",
			icon: "bi-arrow-repeat",
			tone: "warning",
			modal: "saasBillingStarterModal",
		},
		{
			title: "Payroll & Bulk Disbursement",
			stack: "PHP + Laravel",
			description:
				"CSV payroll parsing, B2C bulk payments, and comprehensive tracking.",
			icon: "bi-people",
			tone: "success",
			modal: "payrollStarterModal",
		},
	],
};

async function fetchSdkResources(): Promise<SdkResourcesData> {
	try {
		const response = await fetch("/api/developer/sdk-resources", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return (await response.json()) as SdkResourcesData;
	} catch {
		return initialMockData;
	}
}

const toneClass: Record<Tone, string> = {
	success: styles.badgeSuccess,
	warning: styles.badgeWarning,
	danger: styles.badgeDanger,
	info: styles.badgeInfo,
	purple: styles.badgePurple,
};

export default function SdkResources() {
	const { data } = useQuery({
		queryKey: ["developer", "sdk-resources"],
		queryFn: fetchSdkResources,
		staleTime: 5 * 60_000,
	});
	const config = data ?? initialMockData;
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [activeSdk, setActiveSdk] = useState("node");
	const sdk =
		config.sdkTabs.find((item) => item.key === activeSdk) ?? config.sdkTabs[0];

	return (
		<div className={styles.page}>
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<Link className={styles.breadcrumbLink} to="/dev">
							Developer Portal
						</Link>{" "}
						/ Integration / <strong>SDKs & Plugins</strong>
					</div>
					{/* // <h1 className={styles.pageTitle}>SDKs, Plugins & Code Resources</h1>
					<p className={styles.pageSub}>
						Official libraries, e-commerce extensions, sample applications, and
						interactive tools for integrating PayMo into your stack.
					</p> */}
				</div>
				<div className={styles.pageActions}>
					<button
						type="button"
						className={styles.button}
						onClick={() => setActiveModal("apiPlaygroundModal")}
					>
						<i className="bi bi-code-slash" /> API Sandbox
					</button>
					<button
						type="button"
						className={styles.button}
						onClick={() => setActiveModal("githubAccessModal")}
					>
						<i className="bi bi-github" /> Repositories
					</button>
					<button
						type="button"
						className={`${styles.button} ${styles.buttonPrimary}`}
						onClick={() => setActiveModal("installJsSdkModal")}
					>
						<i className="bi bi-download" /> Get Node SDK
					</button>
				</div>
			</div>

			<div className={styles.content}>
				<div className="row g-3">
					<div className="col-lg-4">
						<section
							className={`${styles.card} ${styles.cardAccent} ${styles.minHero}`}
						>
							<p className={styles.heroEyebrow}>
								SDK distribution is live{" "}
								<span style={{ color: "#86efac" }}>●</span>
							</p>
							<div className={styles.heroValue}>2.4M+ Downloads</div>
							<p className={styles.heroCopy}>
								Join thousands of developers building fast, compliant African
								payments with our official SDKs.
							</p>
							<div className={styles.heroButtons}>
								{[
									{
										label: "Node.js",
										icon: "bi-filetype-js",
										modal: "installJsSdkModal",
									},
									{
										label: "Python",
										icon: "bi-filetype-py",
										modal: "installPythonSdkModal",
									},
									{
										label: "PHP",
										icon: "bi-filetype-php",
										modal: "installPhpSdkModal",
									},
								].map((item) => (
									<button
										type="button"
										key={item.label}
										className={`${styles.button} ${styles.buttonSm} ${styles.buttonDark}`}
										onClick={() => setActiveModal(item.modal)}
									>
										<i className={`bi ${item.icon}`} /> {item.label}
									</button>
								))}
							</div>
						</section>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<section className={`${styles.card} ${styles.minHero}`}>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-info)" }}
							>
								Active Plugins
							</p>
							<div className={styles.statValue}>12</div>
							<span className={`${styles.badge} ${styles.badgeInfo}`}>
								<i className="bi bi-plugin" /> CMS & E-comm
							</span>
							<p
								className="mt-3 mb-0"
								style={{ color: "var(--pm-muted)", fontSize: 11 }}
							>
								WooCommerce, Shopify, Magento, OpenCart, and more.
							</p>
						</section>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<section className={`${styles.card} ${styles.minHero}`}>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-accent)" }}
							>
								Community Rating
							</p>
							<div className={styles.statValue}>4.9/5</div>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								<i className="bi bi-github" /> 18k Stars
							</span>
							<div className="mt-3">
								<div
									className="d-flex justify-content-between"
									style={{ color: "var(--pm-muted)", fontSize: 11 }}
								>
									<span>Uptime SLA</span>
									<span>99.99%</span>
								</div>
								<div className={styles.progress}>
									<div
										className={styles.progressBar}
										style={{ width: "99.9%", background: "var(--pm-accent)" }}
									/>
								</div>
							</div>
						</section>
					</div>
					<div className="col-lg-3 col-md-4">
						<section
							className={`${styles.card} ${styles.minHero}`}
							style={{ borderLeft: "3px solid var(--pm-warning)" }}
						>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-warning)" }}
							>
								Starter Templates
							</p>
							<div className={styles.statValue}>25+</div>
							<span className={`${styles.badge} ${styles.badgeWarning}`}>
								<i className="bi bi-code" /> Ready to deploy
							</span>
							<p
								className="mt-3 mb-0"
								style={{ color: "var(--pm-ink-soft)", fontSize: 12 }}
							>
								Payroll, SaaS, e-commerce, and M-Pesa collection projects.
							</p>
						</section>
					</div>
				</div>

				<div className="row g-3">
					<div className="col-lg-4">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<h2 className={styles.sectionTitle}>Developer Updates</h2>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal("sdkReleaseNotesModal")}
								>
									View all
								</button>
							</div>
							<div className={styles.feedList}>
								{config.updates.map((item) => (
									<div className={styles.feedItem} key={item.title}>
										<span
											className={`${styles.iconCircle} ${toneClass[item.tone]}`}
										>
											{item.badge}
										</span>
										<div className={styles.feedText}>
											<div className={styles.feedTitle}>{item.title}</div>
											<div className={styles.feedSub}>{item.detail}</div>
										</div>
										<button
											type="button"
											className={`${styles.button} ${styles.buttonSm}`}
											onClick={() => setActiveModal(item.modal)}
										>
											{item.action}
										</button>
									</div>
								))}
							</div>
						</section>
					</div>
					<div className="col-lg-4">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<h2 className={styles.sectionTitle}>Community & Support</h2>
								<span className={`${styles.badge} ${styles.badgePurple}`}>
									<i className="bi bi-people" /> Live
								</span>
							</div>
							<div className={styles.feedList}>
								{config.support.map((item) => (
									<div className={styles.feedItem} key={item.title}>
										<span
											className={`${styles.iconCircle} ${toneClass[item.tone]}`}
										>
											<i className={`bi ${item.icon}`} />
										</span>
										<div className={styles.feedText}>
											<div className={styles.feedTitle}>{item.title}</div>
											<div className={styles.feedSub}>{item.detail}</div>
										</div>
										<button
											type="button"
											className={`${styles.button} ${styles.buttonSm}`}
											onClick={() => setActiveModal(item.modal)}
										>
											{item.action}
										</button>
									</div>
								))}
							</div>
						</section>
					</div>
					<div className="col-lg-4">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<div>
									<h2 className={styles.sectionTitle}>Quick Toolkit</h2>
									<p className={styles.sectionSub}>
										Direct access to tools and libraries
									</p>
								</div>
							</div>
							<div className={styles.quickGrid}>
								{config.toolkit.map((item) => (
									<button
										type="button"
										className={styles.quickButton}
										key={item.label}
										onClick={() => setActiveModal(item.modal)}
									>
										<i
											className={`bi ${item.icon}`}
											style={{ color: item.color }}
										/>{" "}
										{item.label}
									</button>
								))}
							</div>
						</section>
					</div>
				</div>

				<section className={styles.card}>
					<div className={styles.sectionHeader}>
						<div>
							<h2 className={styles.sectionTitle}>
								<i
									className="bi bi-box"
									style={{ color: "var(--pm-primary)" }}
								/>{" "}
								Official SDKs
							</h2>
							<p className={styles.sectionSub}>
								Language-specific libraries for fast, type-safe API integration.
							</p>
						</div>
						<div className={styles.sectionActions}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm}`}
								onClick={() => setActiveModal("checkoutWidgetModal")}
							>
								<i className="bi bi-code-square" /> CDN Links
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm} ${styles.buttonPrimary}`}
								onClick={() => setActiveModal("githubAccessModal")}
							>
								<i className="bi bi-github" /> Browse Repos
							</button>
						</div>
					</div>
					<div className="row g-4">
						<div className="col-lg-3 col-md-4">
							<div
								className={styles.tabs}
								style={{ flexDirection: "column" }}
								role="tablist"
								aria-label="SDK language"
							>
								{config.sdkTabs.map((item) => (
									<button
										type="button"
										key={item.key}
										className={`${styles.tab} ${activeSdk === item.key ? styles.tabActive : ""}`}
										style={{ textAlign: "left" }}
										onClick={() => setActiveSdk(item.key)}
										role="tab"
										aria-selected={activeSdk === item.key}
									>
										<i
											className={`bi ${item.icon} me-2`}
											style={{ color: item.color }}
										/>{" "}
										{item.label}
									</button>
								))}
							</div>
						</div>
						<div className="col-lg-9 col-md-8">
							<div className={styles.tabPanel}>
								<div className={styles.sectionHeader}>
									<div>
										<h3 className={styles.sectionTitle}>{sdk.title}</h3>
										<p className={styles.sectionSub}>{sdk.description}</p>
									</div>
									<button
										type="button"
										className={`${styles.button} ${styles.buttonSm} ${styles.buttonPrimary}`}
										onClick={() => setActiveModal(sdk.modal)}
									>
										Install Guide
									</button>
								</div>
								<CodeBlock
									code={sdk.install}
									styles={styles as Record<string, string>}
								/>
								<CodeBlock
									code={sdk.sample}
									styles={styles as Record<string, string>}
								/>
							</div>
						</div>
					</div>
				</section>

				<section className={styles.card}>
					<div className={styles.sectionHeader}>
						<div>
							<h2 className={styles.sectionTitle}>
								<i
									className="bi bi-shop"
									style={{ color: "var(--pm-accent)" }}
								/>{" "}
								E-Commerce & CMS Plugins
							</h2>
							<p className={styles.sectionSub}>
								No-code integrations for popular platforms accepting M-Pesa,
								cards, and PesaLink.
							</p>
						</div>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSm}`}
							onClick={() => setActiveModal("posIntegrationModal")}
						>
							<i className="bi bi-printer" /> POS Integrations
						</button>
					</div>
					<div className={styles.pluginGrid}>
						{config.plugins.map((plugin) => (
							<button
								type="button"
								className={styles.pluginCard}
								key={plugin.name}
								onClick={() => setActiveModal(plugin.modal)}
							>
								<span
									className={styles.pluginIcon}
									style={{ color: plugin.color }}
								>
									<i className={`bi ${plugin.icon}`} />
								</span>
								<h4>{plugin.name}</h4>
								<p>{plugin.meta}</p>
								<span className={`${styles.button} ${styles.buttonSm}`}>
									{plugin.action}
								</span>
							</button>
						))}
					</div>
				</section>

				<section className={styles.card}>
					<div className={styles.sectionHeader}>
						<div>
							<h2 className={styles.sectionTitle}>
								<i
									className="bi bi-folder-symlink"
									style={{ color: "var(--pm-info)" }}
								/>{" "}
								Code Samples & Starter Projects
							</h2>
							<p className={styles.sectionSub}>
								Clone production-ready examples to jumpstart your integration.
							</p>
						</div>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSm} ${styles.buttonPrimary}`}
							onClick={() => setActiveModal("githubAccessModal")}
						>
							<i className="bi bi-github" /> Repository Catalog
						</button>
					</div>
					<div className={styles.starterGrid}>
						{config.starters.map((starter) => (
							<article className={styles.starterCard} key={starter.title}>
								<div className="d-flex justify-content-between gap-2">
									<span
										className={`${styles.iconCircle} ${toneClass[starter.tone]}`}
									>
										<i className={`bi ${starter.icon}`} />
									</span>
									<span
										className={`${styles.badge} ${toneClass[starter.tone]}`}
									>
										{starter.stack}
									</span>
								</div>
								<h4>{starter.title}</h4>
								<p>{starter.description}</p>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal(starter.modal)}
								>
									Clone Project
								</button>
							</article>
						))}
					</div>
					<div
						className={`${styles.card} ${styles.cardAccent} mt-4 text-center`}
					>
						<h3 className={styles.heroValue} style={{ fontSize: 21 }}>
							Test APIs in the Browser
						</h3>
						<p className={styles.heroCopy}>
							Build payloads, inject test keys, and inspect live JSON responses
							without writing local code.
						</p>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonPrimary} mt-3`}
							onClick={() => setActiveModal("apiPlaygroundModal")}
						>
							<i className="bi bi-braces" /> Launch Interactive Sandbox
						</button>
					</div>
				</section>
			</div>

			<SdkResourcesModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
