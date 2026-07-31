import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SecurityComplianceModals from "../components/SecurityComplianceModals";
import styles from "../styles/security-compliance.module.css";

type Tone = "success" | "warning" | "danger" | "info" | "purple";
interface ConfigItem {
	title: string;
	detail: string;
	badge?: string;
	badgeTone?: Tone;
	action: string;
	modal: string;
}
interface SecurityData {
	authItems: ConfigItem[];
	privacyItems: ConfigItem[];
	riskCards: Array<{
		title: string;
		detail: string;
		icon: string;
		tone: Tone;
		action: string;
		modal: string;
	}>;
}

export const initialMockData: SecurityData = {
	authItems: [
		{
			title: "OAuth 2.0 Applications",
			detail: "Manage Authorization Code, Client Credentials, and PKCE flows",
			action: "Manage (2)",
			modal: "oauthManageModal",
		},
		{
			title: "API Request Signing (HMAC-SHA256)",
			detail: "Verify payload integrity using your secret key",
			action: "Configure",
			modal: "webhookSigModal",
		},
		{
			title: "JWT Token Management",
			detail: "Expiration, refresh limits, revocation, and custom claims",
			action: "Settings",
			modal: "jwtConfigModal",
		},
		{
			title: "IP Whitelisting",
			detail: "Restrict secret-key access to approved server addresses",
			badge: "Enabled (3 IPs)",
			badgeTone: "success",
			action: "Edit IPs",
			modal: "ipWhitelistModal",
		},
		{
			title: "Certificate Pinning",
			detail: "Prevent MITM attacks in mobile SDK clients",
			action: "Get Certs",
			modal: "certPinningModal",
		},
	],
	privacyItems: [
		{
			title: "PCI DSS Compliance",
			detail: "SAQ validation and tokenization rules",
			badge: "SAQ D Overdue",
			badgeTone: "warning",
			action: "Upload SAQ",
			modal: "pciUploadModal",
		},
		{
			title: "Consent Management API",
			detail: "Handle user consents and DSARs programmatically",
			action: "View Consents",
			modal: "consentViewerModal",
		},
		{
			title: "Encryption Keys (Data at Rest)",
			detail: "AES-256 KMS integration and bring-your-own-key",
			badge: "PayMo KMS Managed",
			badgeTone: "success",
			action: "Manage KMS",
			modal: "encryptionSettingsModal",
		},
		{
			title: "Scopes & PII Access",
			detail: "Granular read and write permissions for integrators",
			action: "Manage Scopes",
			modal: "scopeManageModal",
		},
	],
	riskCards: [
		{
			title: "Real-Time Risk Scoring",
			detail:
				"Score transactions from 0–100 using velocity, location, and behavior; automatically require 3DS or OTP.",
			icon: "bi-speedometer2",
			tone: "danger",
			action: "Configure Thresholds",
			modal: "riskThresholdsModal",
		},
		{
			title: "Device Fingerprinting",
			detail:
				"Detect rooted devices and emulators while correlating browser and mobile fingerprints.",
			icon: "bi-phone",
			tone: "info",
			action: "Detection Rules",
			modal: "deviceFingerprintModal",
		},
		{
			title: "KYC / KYB Verification API",
			detail: "ID OCR, liveness, PEP screening, and CR12 business validation.",
			icon: "bi-person-bounding-box",
			tone: "purple",
			action: "Verification Settings",
			modal: "kycWebhookModal",
		},
	],
};

async function fetchSecurityCompliance(): Promise<SecurityData> {
	try {
		const response = await fetch("/api/developer/security-compliance", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return (await response.json()) as SecurityData;
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

export default function SecurityCompliance() {
	const { data } = useQuery({
		queryKey: ["developer", "security-compliance"],
		queryFn: fetchSecurityCompliance,
		staleTime: 5 * 60_000,
	});
	const config = data ?? initialMockData;
	const [activeModal, setActiveModal] = useState<string | null>(null);

	const renderConfig = (items: ConfigItem[]) =>
		items.map((item) => (
			<div className={styles.configRow} key={item.title}>
				<div className={styles.configCopy}>
					<div className={styles.configTitle}>{item.title}</div>
					<div className={styles.configSub}>{item.detail}</div>
					{item.badge && item.badgeTone ? (
						<span
							className={`${styles.badge} ${toneClass[item.badgeTone]} mt-2`}
						>
							{item.badge}
						</span>
					) : null}
				</div>
				<button
					type="button"
					className={`${styles.button} ${styles.buttonSm}`}
					onClick={() => setActiveModal(item.modal)}
				>
					{item.action}
				</button>
			</div>
		));

	return (
		<div className={styles.page}>
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<Link className={styles.breadcrumbLink} to="/dev">
							Developer Portal
						</Link>{" "}
						/ Operations / <strong>Security & Compliance</strong>
					</div>
					<h1 className={styles.pageTitle}>
						Security, Authentication & Compliance
					</h1>
					<p className={styles.pageSub}>
						Manage OAuth apps, API security keys, data-protection compliance,
						and advanced fraud and risk controls.
					</p>
				</div>
				<div className={styles.pageActions}>
					<button
						type="button"
						className={styles.button}
						onClick={() => setActiveModal("auditLogModal")}
					>
						<i className="bi bi-journal-text" /> Audit Logs
					</button>
					<button
						type="button"
						className={styles.button}
						onClick={() => setActiveModal("sandboxTestingModal")}
					>
						<i className="bi bi-box" /> Sandbox
					</button>
					<button
						type="button"
						className={`${styles.button} ${styles.buttonPrimary}`}
						onClick={() => setActiveModal("oauthRegisterModal")}
					>
						<i className="bi bi-plus-lg" /> New OAuth App
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
								Security posture{" "}
								<span style={{ color: "#34d399" }}>● Secure</span>
							</p>
							<div className={styles.heroValue}>92 / 100</div>
							<p className={styles.heroCopy}>
								Your integration meets 11 of 12 critical production security
								requirements.
							</p>
							<div className={styles.heroButtons}>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm} ${styles.buttonDark}`}
									onClick={() => setActiveModal("pciUploadModal")}
								>
									<i className="bi bi-upload" /> Upload PCI Attestation
								</button>
							</div>
						</section>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<section className={`${styles.card} ${styles.minHero}`}>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-warning)" }}
							>
								Active API Keys
							</p>
							<div className={styles.statValue}>4</div>
							<span className={`${styles.badge} ${styles.badgeWarning}`}>
								<i className="bi bi-exclamation-triangle" /> 1 expiring
							</span>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm} ${styles.buttonWide} mt-3`}
								onClick={() => setActiveModal("rotateKeysModal")}
							>
								Rotate Keys
							</button>
						</section>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<section className={`${styles.card} ${styles.minHero}`}>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-info)" }}
							>
								Blocked Requests
							</p>
							<div className={styles.statValue}>142</div>
							<span className={`${styles.badge} ${styles.badgeInfo}`}>
								<i className="bi bi-shield-x" /> Invalid sig / IP
							</span>
							<p
								className="my-2"
								style={{ color: "var(--pm-muted)", fontSize: 11 }}
							>
								Last 24 hours. Limits enforced on two endpoints.
							</p>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm} ${styles.buttonWide}`}
								onClick={() => setActiveModal("rateLimitAlertModal")}
							>
								Rate Limits
							</button>
						</section>
					</div>
					<div className="col-lg-3 col-md-4">
						<section
							className={`${styles.card} ${styles.minHero}`}
							style={{ borderLeft: "3px solid var(--pm-danger)" }}
						>
							<p
								className={styles.statLabel}
								style={{ color: "var(--pm-danger)" }}
							>
								Fraud Risk Detected
							</p>
							<div className={styles.statValue}>0.05%</div>
							<span className={`${styles.badge} ${styles.badgeDanger}`}>
								<i className="bi bi-graph-up" /> 3 flagged tx
							</span>
							<p
								className="my-2"
								style={{ color: "var(--pm-muted)", fontSize: 11 }}
							>
								High-risk scores blocked by active rules.
							</p>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSm} ${styles.buttonWide}`}
								onClick={() => setActiveModal("riskThresholdsModal")}
							>
								Risk Scoring
							</button>
						</section>
					</div>
				</div>

				<div className="row g-4">
					<div className="col-lg-6">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<div>
									<h2 className={styles.sectionTitle}>
										<i
											className="bi bi-key-fill"
											style={{ color: "var(--pm-primary)" }}
										/>{" "}
										Authentication & Authorization
									</h2>
									<p className={styles.sectionSub}>
										OAuth 2.0, JWT, request signing, network restrictions, and
										mobile certificate trust.
									</p>
								</div>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal("oauthRegisterModal")}
								>
									<i className="bi bi-plus" /> App
								</button>
							</div>
							{renderConfig(config.authItems)}
						</section>
					</div>
					<div className="col-lg-6">
						<section className={styles.card}>
							<div className={styles.sectionHeader}>
								<div>
									<h2 className={styles.sectionTitle}>
										<i
											className="bi bi-shield-lock-fill"
											style={{ color: "var(--pm-accent)" }}
										/>{" "}
										Data Protection & Privacy
									</h2>
									<p className={styles.sectionSub}>
										PCI DSS, Kenya Data Protection Act 2019, consent, scopes,
										and encryption.
									</p>
								</div>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal("dpaModal")}
								>
									<i className="bi bi-file-earmark-pdf" /> DPA
								</button>
							</div>
							{renderConfig(config.privacyItems)}
						</section>
					</div>
				</div>

				<section className={styles.card}>
					<div className={styles.sectionHeader}>
						<div>
							<h2 className={styles.sectionTitle}>
								<i
									className="bi bi-radar"
									style={{ color: "var(--pm-danger)" }}
								/>{" "}
								Fraud Prevention & Risk APIs
							</h2>
							<p className={styles.sectionSub}>
								Real-time scoring, device fingerprinting, and automated KYC /
								KYB controls.
							</p>
						</div>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSm}`}
							onClick={() => setActiveModal("kycWebhookModal")}
						>
							<i className="bi bi-plug" /> KYC Webhooks
						</button>
					</div>
					<div className={styles.riskGrid}>
						{config.riskCards.map((item) => (
							<article className={styles.riskCard} key={item.title}>
								<span
									className={`${styles.iconCircle} ${toneClass[item.tone]}`}
								>
									<i className={`bi ${item.icon}`} />
								</span>
								<h4>{item.title}</h4>
								<p>{item.detail}</p>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => setActiveModal(item.modal)}
								>
									{item.action}
								</button>
							</article>
						))}
					</div>
				</section>
			</div>

			<SecurityComplianceModals
				active={activeModal}
				onClose={() => setActiveModal(null)}
				onOpen={setActiveModal}
			/>
		</div>
	);
}
