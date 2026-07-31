import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SandboxTestingModals from "../components/SandboxTestingModals";
import styles from "../styles/sandbox-testing.module.css";

type Tone = "success" | "warning" | "danger" | "info" | "purple";

interface SandboxData {
	simulators: Array<{
		title: string;
		detail: string;
		icon: string;
		tone: Tone;
		modal: string;
	}>;
	dataSets: Array<{
		type: string;
		description: string;
		generated: string;
		icon: string;
		action: string;
		modal: string;
	}>;
	scenarios: Array<{
		number: number;
		title: string;
		detail: string;
		modal: string;
	}>;
	diagnostics: Array<{ label: string; icon: string; modal: string }>;
}

export const initialMockData: SandboxData = {
	simulators: [
		{
			title: "M-Pesa STK Simulator",
			detail: "Trigger push and callbacks",
			icon: "bi-phone",
			tone: "success",
			modal: "simMpesaModal",
		},
		{
			title: "Bank Transfer (PesaLink)",
			detail: "Simulate EFT and RTGS flows",
			icon: "bi-bank",
			tone: "info",
			modal: "simBankModal",
		},
		{
			title: "Card Payment Simulator",
			detail: "Test 3DS and chargebacks",
			icon: "bi-credit-card",
			tone: "purple",
			modal: "simCardModal",
		},
		{
			title: "FX Rate Simulator",
			detail: "Mock multi-currency spreads",
			icon: "bi-currency-exchange",
			tone: "warning",
			modal: "simFxModal",
		},
	],
	dataSets: [
		{
			type: "Customers",
			description: "100 users with valid KE phone numbers (07XX)",
			generated: "Today, 10:45 AM",
			icon: "bi-people",
			action: "Generate New",
			modal: "genCustomersModal",
		},
		{
			type: "Invoices",
			description: "50 active invoices with mixed aging states",
			generated: "Yesterday, 2:10 PM",
			icon: "bi-receipt",
			action: "Generate New",
			modal: "genInvoicesModal",
		},
		{
			type: "Payroll",
			description: "Dummy payroll run with 200 employees and KRA logic",
			generated: "24 Jul 2026",
			icon: "bi-cash-stack",
			action: "Simulate Run",
			modal: "runPayrollTestModal",
		},
	],
	scenarios: [
		{
			number: 1,
			title: "Successful End-to-End Payment",
			detail: "Initiation → Auth → Capture → Webhook",
			modal: "scenarioE2eModal",
		},
		{
			number: 2,
			title: "Failed Payment with Retry",
			detail: "Insufficient funds, then success",
			modal: "scenarioFailedModal",
		},
		{
			number: 3,
			title: "Partial Refund Processing",
			detail: "Refunds 50% of a captured transaction",
			modal: "scenarioRefundModal",
		},
		{
			number: 4,
			title: "Subscription Upgrade & Proration",
			detail: "Mid-cycle tier change validation",
			modal: "scenarioSubModal",
		},
		{
			number: 5,
			title: "Bulk Disbursement with Mixed Results",
			detail: "10 txns: 8 success, 2 failed callbacks",
			modal: "scenarioBulkModal",
		},
	],
	diagnostics: [
		{ label: "Copy cURL", icon: "bi-terminal", modal: "curlExportModal" },
		{ label: "Payload Diff", icon: "bi-file-diff", modal: "payloadDiffModal" },
		{ label: "Error Codes", icon: "bi-journal-code", modal: "errorCodeModal" },
		{
			label: "Support Ticket",
			icon: "bi-headset",
			modal: "supportTicketModal",
		},
	],
};

async function fetchSandboxTesting(): Promise<SandboxData> {
	try {
		const response = await fetch("/api/developer/sandbox-testing", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return (await response.json()) as SandboxData;
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

const requestLog = `// Request Payload
{
  "amount": 1500,
  "phone_number": "254712345678",
  "reference": "INV-2026-001",
  "description": "Payment for services",
  "callback_url": "https://api.merchant.example/webhook"
}

// Response Payload
{
  "status": "success",
  "data": {
    "transaction_id": "txn_98f2a1b",
    "merchant_request_id": "req_4412",
    "checkout_request_id": "chk_8821",
    "customer_message": "Request accepted for processing"
  }
}`;

export default function SandboxTesting() {
	const { data } = useQuery({
		queryKey: ["developer", "sandbox-testing"],
		queryFn: fetchSandboxTesting,
		staleTime: 3 * 60_000,
	});
	const config = data ?? initialMockData;
	const [activeModal, setActiveModal] = useState<string | null>(null);

	return (
		<div className={styles.page}>
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<Link className={styles.breadcrumbLink} to="/dev">
							Developer Portal
						</Link>{" "}
						/ Integration / <strong>Sandbox & Simulation</strong>
					</div>
					<h1 className={styles.pageTitle}>Sandbox, Testing & Simulation</h1>
					<p className={styles.pageSub}>
						Safely test integrations without moving real money. Generate dummy
						data, simulate PSP responses, run automated scenarios, and debug
						payloads.
					</p>
				</div>
				<div className={styles.pageActions}>
					<button
						type="button"
						className={styles.button}
						onClick={() => setActiveModal("resetSandboxModal")}
					>
						<i
							className="bi bi-arrow-counterclockwise"
							style={{ color: "var(--pm-danger)" }}
						/>{" "}
						Reset Env
					</button>
					<button
						type="button"
						className={styles.button}
						onClick={() => setActiveModal("certificationModal")}
					>
						<i
							className="bi bi-patch-check"
							style={{ color: "var(--pm-accent)" }}
						/>{" "}
						Go-Live Checklist
					</button>
					<button
						type="button"
						className={`${styles.button} ${styles.buttonPrimary}`}
						onClick={() => setActiveModal("generateTestDataModal")}
					>
						<i className="bi bi-magic" /> Generate Data
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
								Sandbox environment is active{" "}
								<span style={{ color: "#fcd34d" }}>●</span>
							</p>
							<div className={styles.heroValue}>24,592</div>
							<p className={styles.heroCopy}>
								Test API requests processed this month. Rate limit: 500 requests
								per second.
							</p>
							<div className={styles.heroButtons}>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm} ${styles.buttonDark}`}
									onClick={() => setActiveModal("sandboxCredsModal")}
								>
									<i className="bi bi-key" /> Credentials
								</button>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm} ${styles.buttonDark}`}
									onClick={() => setActiveModal("liveLogsModal")}
								>
									<i className="bi bi-terminal" /> Live Logs
								</button>
							</div>
						</section>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<section className={`${styles.card} ${styles.minHero}`}>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-info)" }}
							>
								API Success Rate
							</p>
							<div className={styles.statValue}>94.2%</div>
							<span className={`${styles.badge} ${styles.badgeInfo}`}>
								<i className="bi bi-check-circle" /> 1,420 success
							</span>
							<div
								className="mt-3"
								style={{ color: "var(--pm-muted)", fontSize: 11 }}
							>
								<div className="d-flex justify-content-between">
									<span>4xx Errors</span>
									<span style={{ color: "var(--pm-warning)" }}>4.8%</span>
								</div>
								<div className="d-flex justify-content-between">
									<span>5xx Errors</span>
									<span style={{ color: "var(--pm-danger)" }}>1.0%</span>
								</div>
							</div>
						</section>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<section className={`${styles.card} ${styles.minHero}`}>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-purple)" }}
							>
								Active Webhooks
							</p>
							<div className={styles.statValue}>8 / 12</div>
							<span className={`${styles.badge} ${styles.badgePurple}`}>
								<i className="bi bi-diagram-3" /> Events subscribed
							</span>
							<div className="mt-3">
								<div
									className="d-flex justify-content-between"
									style={{ color: "var(--pm-muted)", fontSize: 11 }}
								>
									<span>Delivery latency</span>
									<span>~140ms</span>
								</div>
								<div className={styles.progress}>
									<div
										className={styles.progressBar}
										style={{ width: "85%", background: "var(--pm-purple)" }}
									/>
								</div>
							</div>
						</section>
					</div>
					<div className="col-lg-3 col-md-4">
						<section
							className={`${styles.card} ${styles.minHero}`}
							style={{ borderLeft: "3px solid var(--pm-accent)" }}
						>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-accent)" }}
							>
								Go-Live Readiness
							</p>
							<div className={styles.statValue}>85%</div>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								<i className="bi bi-shield-check" /> Scenarios passing
							</span>
							<div
								className="mt-3"
								style={{ color: "var(--pm-ink-soft)", fontSize: 12 }}
							>
								<div>
									Contract tests:{" "}
									<strong style={{ color: "var(--pm-accent)" }}>Passed</strong>
								</div>
								<div>
									Security scan:{" "}
									<strong style={{ color: "var(--pm-warning)" }}>
										Pending
									</strong>
								</div>
							</div>
						</section>
					</div>
				</div>

				<section className={styles.card}>
					<div className={styles.sectionHeader}>
						<div>
							<h2 className={styles.sectionTitle}>
								<i
									className="bi bi-box-seam"
									style={{ color: "var(--pm-warning)" }}
								/>{" "}
								Sandbox Environment & Simulators
							</h2>
							<p className={styles.sectionSub}>
								Generate mock data and simulate M-Pesa, bank, card, and FX
								responses to test edge cases.
							</p>
						</div>
						<div className={styles.sectionActions}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm}`}
								onClick={() => setActiveModal("sandboxCredsModal")}
							>
								<i className="bi bi-key" /> Keys
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm} ${styles.buttonPrimary}`}
								onClick={() => setActiveModal("generateTestDataModal")}
							>
								<i className="bi bi-magic" /> Generate Data
							</button>
						</div>
					</div>
					<div className="row g-3">
						{config.simulators.map((simulator) => (
							<div className="col-lg-3 col-sm-6" key={simulator.title}>
								<button
									type="button"
									className={`${styles.feedItem} ${styles.feedItemClickable}`}
									onClick={() => setActiveModal(simulator.modal)}
								>
									<span
										className={`${styles.iconCircle} ${toneClass[simulator.tone]}`}
									>
										<i className={`bi ${simulator.icon}`} />
									</span>
									<span className={styles.feedText}>
										<span className={styles.feedTitle}>{simulator.title}</span>
										<span className={`${styles.feedSub} d-block`}>
											{simulator.detail}
										</span>
									</span>
									<i className="bi bi-chevron-right" aria-hidden="true" />
								</button>
							</div>
						))}
					</div>
					<div className={`${styles.utilityBlock} mt-3`}>
						<h3 className={styles.utilityTitle}>Test Data Generation Sets</h3>
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Data Type</th>
										<th>Description</th>
										<th>Last Generated</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{config.dataSets.map((item) => (
										<tr key={item.type}>
											<td>
												<i className={`bi ${item.icon} me-2`} /> {item.type}
											</td>
											<td>{item.description}</td>
											<td>{item.generated}</td>
											<td>
												<button
													type="button"
													className={`${styles.button} ${styles.buttonSm}`}
													onClick={() => setActiveModal(item.modal)}
												>
													{item.action}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				<div className="row g-3">
					<div className="col-lg-6">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<h2 className={styles.sectionTitle}>
									<i
										className="bi bi-check2-all"
										style={{ color: "var(--pm-accent)" }}
									/>{" "}
									Test Scenarios
								</h2>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal("certificationModal")}
								>
									Checklist
								</button>
							</div>
							<p className={styles.sectionSub}>
								Execute pre-built integration scenarios to validate asynchronous
								event handling.
							</p>
							<div className={`${styles.feedList} mt-3`}>
								{config.scenarios.map((scenario) => (
									<div className={styles.feedItem} key={scenario.number}>
										<span
											className={styles.iconCircle}
											style={{
												background: "var(--pm-surface-2)",
												fontWeight: 800,
											}}
										>
											{scenario.number}
										</span>
										<div className={styles.feedText}>
											<div className={styles.feedTitle}>{scenario.title}</div>
											<div className={styles.feedSub}>{scenario.detail}</div>
										</div>
										<button
											type="button"
											className={`${styles.button} ${styles.buttonSm} ${styles.buttonPrimary}`}
											onClick={() => setActiveModal(scenario.modal)}
										>
											Run
										</button>
									</div>
								))}
							</div>
							<div className="mt-3 pt-3 border-top">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.utilityTitle} style={{ margin: 0 }}>
										Automated Testing
									</h3>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>
										Passing
									</span>
								</div>
								<div className={styles.quickGrid}>
									<button
										type="button"
										className={styles.quickButton}
										onClick={() => setActiveModal("apiContractModal")}
									>
										API Contracts
									</button>
									<button
										type="button"
										className={styles.quickButton}
										onClick={() => setActiveModal("testSuiteModal")}
									>
										Integration Suite
									</button>
									<button
										type="button"
										className={styles.quickButton}
										onClick={() => setActiveModal("owaspReportModal")}
									>
										OWASP Scan
									</button>
									<button
										type="button"
										className={styles.quickButton}
										onClick={() => setActiveModal("slackIntegrationModal")}
									>
										Alert Channels
									</button>
								</div>
							</div>
						</section>
					</div>
					<div className="col-lg-6">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<h2 className={styles.sectionTitle}>
									<i
										className="bi bi-bug"
										style={{ color: "var(--pm-danger)" }}
									/>{" "}
									Debugging & Diagnostics
								</h2>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal("liveLogsModal")}
								>
									<i className="bi bi-arrows-fullscreen" /> Full View
								</button>
							</div>
							<p className={styles.sectionSub}>
								Live HTTP request and response logs from the sandbox
								environment.
							</p>
							<div className={`${styles.logPanel} mt-3 mb-3`}>
								<div className={styles.logHeader}>
									<strong style={{ color: "#34d399" }}>POST 200 OK</strong>
									<span>/v1/payments/stk-push</span>
									<span>142ms</span>
								</div>
								<pre>{requestLog}</pre>
							</div>
							<div className={styles.quickGrid}>
								{config.diagnostics.map((item) => (
									<button
										type="button"
										className={styles.quickButton}
										key={item.label}
										onClick={() => setActiveModal(item.modal)}
									>
										<i className={`bi ${item.icon}`} /> {item.label}
									</button>
								))}
							</div>
						</section>
					</div>
				</div>
			</div>

			<SandboxTestingModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
