/* ============================================================================
 * AccountSettings.tsx — Account Settings & Administration (Page 1.18)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.18.html — the personal account settings & admin hub.
 *   This page owns security & authentication, notification preferences,
 *   linked devices & sessions, KYC document vault, API & developer settings,
 *   preferences & localization, privacy & data controls, beneficiaries &
 *   next of kin, account administration (overview / close main / close
 *   business) and the recent security audit trail.
 *
 * Refined surface: rebuilt on the PayMo business-dashboard composition —
 * executive hero with live security-posture snapshot, numbered sections,
 * attention / smart suggestions / quick actions row and footer. Shell chrome
 * is owned by AppShell; this page renders content only. All 23 modal
 * workflows remain reachable from the page (hero, section actions, tables,
 * attention items, suggestions and quick actions).
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query
 * ARCHITECTURE .: Child of routes/app.tsx, renders INSIDE the app shell.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AccountSettingsModals } from "../modals/AccountSettingsModals";
import styles from "../style/accountSettings.module.css";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const sessions = [
	{
		device: "iPhone 15 Pro",
		detail: "iOS 18.5 • App v4.2.1",
		location: "Nairobi, KE",
		lastActive: "Just now",
		ip: "102.68.XX.XX",
		status: "Current",
		current: true,
	},
	{
		device: "MacBook Pro",
		detail: "macOS 15.4 • Safari",
		location: "Nairobi, KE",
		lastActive: "14:22 today",
		ip: "102.68.XX.XX",
		status: "Active",
		current: false,
	},
	{
		device: "Windows PC",
		detail: "Windows 11 • Chrome",
		location: "Nairobi, KE",
		lastActive: "26 Jun 2025",
		ip: "102.68.XX.XX",
		status: "New",
		current: false,
	},
	{
		device: "iPad Air",
		detail: "iPadOS 18.4 • App",
		location: "Mombasa, KE",
		lastActive: "20 Jun 2025",
		ip: "105.XX.XX.XX",
		status: "Active",
		current: false,
	},
];

const auditLog = [
	{
		date: "27 Jun 2025 14:22",
		event: "Login from new device (iPhone 15 Pro)",
		type: "login",
		ip: "102.68.XX.XX",
		device: "iPhone 15 Pro",
	},
	{
		date: "15 Jun 2025 09:10",
		event: "Password changed",
		type: "key",
		ip: "102.68.XX.XX",
		device: "MacBook Pro",
	},
	{
		date: "10 Jun 2025 11:45",
		event: "2FA enabled via Authenticator App",
		type: "shield",
		ip: "102.68.XX.XX",
		device: "MacBook Pro",
	},
	{
		date: "03 Jun 2025 16:20",
		event: "KYC document uploaded (Utility Bill)",
		type: "file",
		ip: "102.68.XX.XX",
		device: "MacBook Pro",
	},
	{
		date: "01 Jun 2025 08:00",
		event: "Session terminated remotely",
		type: "danger",
		ip: "105.XX.XX.XX",
		device: "iPad Air",
	},
];

const authMethods = [
	{
		icon: "bi bi-key",
		bg: "var(--pm-warning-soft)",
		color: "var(--pm-warn)",
		name: "Password",
		desc: "Last changed 89 days ago • expires in 12 days",
		status: { label: "Expiring", variant: "warning" },
		action: "Change",
		modal: "changePasswordModal",
	},
	{
		icon: "bi bi-shield-check",
		bg: "var(--pm-green-soft)",
		color: "var(--pm-green)",
		name: "2FA (Authenticator App)",
		desc: "Google Authenticator • backup codes on file",
		status: { label: "Enabled", variant: "success" },
		action: "Manage",
		modal: "enable2FAModal",
	},
	{
		icon: "bi bi-fingerprint",
		bg: "var(--pm-purple-soft)",
		color: "var(--pm-violet)",
		name: "Biometric Login",
		desc: "Fingerprint + Face ID on trusted devices",
		status: { label: "Enabled", variant: "success" },
		action: "Manage",
		modal: "enable2FAModal",
	},
	{
		icon: "bi bi-question-circle",
		bg: "var(--pm-info-soft)",
		color: "var(--pm-blue)",
		name: "Security Questions",
		desc: "3 questions set for account recovery",
		status: { label: "Set", variant: "success" },
		action: "Edit",
		modal: "securityQuestionsModal",
	},
];

const notifications = [
	{
		name: "Security Alerts",
		detail: "Login, password & 2FA events",
		on: true,
		channels: "4 channels",
	},
	{
		name: "Transaction Alerts",
		detail: "Every debit & credit event",
		on: true,
		channels: "Push",
	},
	{
		name: "Large Transaction Warnings",
		detail: "Above KES 500,000",
		on: true,
		channels: "Push + SMS",
	},
	{
		name: "KYC Document Expiry",
		detail: "45 / 15 day reminders",
		on: true,
		channels: "3 channels",
	},
	{
		name: "Statement Ready",
		detail: "Monthly statements",
		on: false,
		channels: "Off",
	},
	{
		name: "Marketing",
		detail: "Offers & product updates",
		on: false,
		channels: "Off",
	},
];

const kycDocs = [
	{
		name: "National ID",
		type: "Identity",
		status: "Verified",
		uploaded: "12 Jan 2023",
		expiry: "—",
		variant: "success",
	},
	{
		name: "Passport",
		type: "Identity",
		status: "Verified",
		uploaded: "03 Mar 2024",
		expiry: "Mar 2031",
		variant: "success",
	},
	{
		name: "Utility Bill",
		type: "Address",
		status: "Expiring",
		uploaded: "15 May 2025",
		expiry: "15 Aug 2025",
		variant: "warning",
	},
	{
		name: "Selfie",
		type: "Identity",
		status: "Verified",
		uploaded: "12 Jan 2023",
		expiry: "—",
		variant: "success",
	},
	{
		name: "Bank Statement",
		type: "Financial",
		status: "Verified",
		uploaded: "20 Jun 2025",
		expiry: "—",
		variant: "success",
	},
];

const apiKeys = [
	{
		name: "Production",
		key: "pm_live_9xK2••••••••••••",
		lastUsed: "Today, 14:22",
		status: "Active",
		variant: "success",
	},
	{
		name: "Sandbox",
		key: "pm_test_5yQ7••••••••••••",
		lastUsed: "Yesterday, 09:10",
		status: "Active",
		variant: "success",
	},
	{
		name: "Merchant Portal",
		key: "pm_merch_3tR8••••••",
		lastUsed: "20 Jun 2025",
		status: "Revoked",
		variant: "danger",
	},
];

const beneficiaries = [
	{
		id: "1",
		name: "James Kamau",
		relation: "Spouse",
		idNumber: "12345678",
		kraPin: "A001234567P",
		accountType: "PayMo Wallet",
		accountNumber: "PM#31223",
		age: 35,
		status: "Active",
		variant: "success",
	},
	{
		id: "2",
		name: "Grace Wanjiku",
		relation: "Next of Kin",
		idNumber: "87654321",
		kraPin: "A009876543Q",
		accountType: "M-Pesa",
		accountNumber: "0722 456 789",
		age: 42,
		status: "Active",
		variant: "success",
	},
	{
		id: "3",
		name: "David Kamau Jr.",
		relation: "Child",
		idNumber: "—",
		kraPin: "—",
		accountType: "Guardian Account",
		accountNumber: "PM#31223 (Guardian)",
		age: 12,
		status: "Minor",
		variant: "warning",
	},
	{
		id: "4",
		name: "Red Cross Kenya",
		relation: "Charity",
		idNumber: "NGO/001/2020",
		kraPin: "—",
		accountType: "Bank Account",
		accountNumber: "Equity 0123456789",
		age: null,
		status: "Active",
		variant: "success",
	},
];

const fetchSettingsData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return {
		sessions,
		auditLog,
		authMethods,
		notifications,
		kycDocs,
		apiKeys,
		beneficiaries,
	};
};

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ label, variant }: { label: string; variant: string }) {
	const map: Record<string, string> = {
		success: styles.badgeSuccess,
		warning: styles.badgeWarning,
		danger: styles.badgeDanger,
		info: styles.badgeInfo,
		purple: styles.badgePurple,
		outline: styles.badgeOutline,
	};
	const icon =
		variant === "success"
			? "bi-check-circle"
			: variant === "warning"
				? "bi-clock"
				: "bi-dot";
	return (
		<span className={`${styles.badge} ${map[variant] ?? styles.badgeOutline}`}>
			<i className={`bi ${icon}`}></i> {label}
		</span>
	);
}

/* ---------- section heading (business numbered pattern) ---------- */
function SectionHeading({
	index,
	title,
	copy,
	action,
}: {
	index: string;
	title: string;
	copy: string;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.sectionHeading}>
			<div className={styles.sectionHeadingCopy}>
				<span className={styles.sectionIndex} aria-hidden="true">
					{index}
				</span>
				<div>
					<h2>{title}</h2>
					<p>{copy}</p>
				</div>
			</div>
			{action && <div className={styles.sectionAction}>{action}</div>}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AccountSettings() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [adminTab, setAdminTab] = useState(0);

	const openModal = (id: string) =>
		setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) =>
		setModalState((prev) => ({ ...prev, [id]: false }));

	const { data } = useQuery({
		queryKey: ["accountSettingsData"],
		queryFn: fetchSettingsData,
		initialData: {
			sessions,
			auditLog,
			authMethods,
			notifications,
			kycDocs,
			apiKeys,
			beneficiaries,
		},
	});

	const {
		sessions: sess,
		auditLog: audit,
		authMethods: auth,
		notifications: notifs,
		kycDocs: kyc,
		apiKeys: keys,
		beneficiaries: benefs,
	} = data;

	return (
		<div className={styles.settingsPage}>
			{/* ==================== HERO ==================== */}
			<section className={styles.heroBanner}>
				<div className={styles.heroOrbOne} aria-hidden="true" />
				<div className={styles.heroOrbTwo} aria-hidden="true" />
				<div className={styles.heroContent}>
					<div className={styles.heroCopy}>
						<div className={styles.heroEyebrow}>
							<span>
								<i className="bi bi-shield-check" /> Security posture is strong
							</span>
							<span className={styles.heroLive}>
								<span className={styles.dotLive} aria-hidden="true" /> Live
							</span>
						</div>
						<h1>Account Settings &amp; Administration</h1>
						<p>
							Security posture, authentication, devices, KYC documents,
							notifications, privacy controls, developer tools and account
							lifecycle — one comprehensive hub.
						</p>
						<div className={styles.heroActions}>
							<button
								type="button"
								className={styles.heroSecondaryBtn}
								onClick={() => openModal("editProfileModal")}
							>
								<i className="bi bi-person" /> Edit Profile
							</button>
							<button
								type="button"
								className={styles.heroSecondaryBtn}
								onClick={() => openModal("changePasswordModal")}
							>
								<i className="bi bi-key" /> Password
							</button>
							<button
								type="button"
								className={styles.heroPrimaryBtn}
								onClick={() => openModal("enable2FAModal")}
							>
								<i className="bi bi-shield-check" /> 2FA
							</button>
							<button
								type="button"
								className={styles.heroDangerBtn}
								onClick={() => openModal("closeAccountModal")}
							>
								<i className="bi bi-exclamation-triangle" /> Close Account
							</button>
						</div>
					</div>
					<div className={styles.heroSnapshot}>
						<div className={styles.heroSnapshotTop}>
							<span className={styles.heroSnapshotLabel}>Security posture</span>
							<div className={styles.heroSnapshotActions}>
								<button
									type="button"
									className={styles.heroIconBtn}
									onClick={() => openModal("securityAuditModal")}
									aria-label="View security audit log"
									title="Audit"
								>
									<i className="bi bi-shield-check" />
								</button>
								<button
									type="button"
									className={styles.heroIconBtn}
									onClick={() => openModal("sessionModal")}
									aria-label="View active sessions"
									title="Sessions"
								>
									<i className="bi bi-laptop" />
								</button>
								<button
									type="button"
									className={styles.heroIconBtn}
									onClick={() => openModal("securityQuestionsModal")}
									aria-label="Manage security questions"
									title="Questions"
								>
									<i className="bi bi-question-circle" />
								</button>
							</div>
						</div>
						<div className={styles.heroScore}>
							<div className={styles.heroScoreValue}>
								92<span>/100</span>
							</div>
							<div className={styles.heroScoreMeta}>
								2FA enabled • Biometrics active • No open incidents • Audit log
								clean.
							</div>
						</div>
						<div className={styles.heroMetricRow}>
							<div className={styles.heroMetric}>
								<div
									className={styles.heroMetricValue}
									style={{ color: "#41d991" }}
								>
									0
								</div>
								<div className={styles.heroMetricLabel}>Open incidents</div>
							</div>
							<div className={styles.heroMetric}>
								<div
									className={styles.heroMetricValue}
									style={{ color: "#fbbf24" }}
								>
									3
								</div>
								<div className={styles.heroMetricLabel}>Recommendations</div>
							</div>
							<div className={styles.heroMetric}>
								<div
									className={styles.heroMetricValue}
									style={{ color: "#fda29b" }}
								>
									12d
								</div>
								<div className={styles.heroMetricLabel}>Password expiry</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==================== 01 SECURITY & AUTHENTICATION ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="01"
					title="Security & Authentication"
					copy="Password, 2FA, PIN, security questions, login history and trusted devices."
					action={
						<div className={styles.headerButtonRow}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("securityAuditModal")}
							>
								<i className="bi bi-shield-check" /> Audit
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal("enable2FAModal")}
							>
								<i className="bi bi-shield-check" /> 2FA
							</button>
						</div>
					}
				/>
				<div className={styles.card}>
					<div className={styles.methodGrid}>
						{auth.map((method) => (
							<div className={styles.methodCard} key={method.name}>
								<div
									className={styles.methodIcon}
									style={{ background: method.bg, color: method.color }}
								>
									<i className={method.icon}></i>
								</div>
								<div className={styles.methodBody}>
									<div className={styles.methodName}>{method.name}</div>
									<div className={styles.methodDesc}>{method.desc}</div>
									<div className={styles.methodFooter}>
										<StatusBadge
											label={method.status.label}
											variant={method.status.variant}
										/>
										<button
											type="button"
											className={`${styles.button} ${styles.buttonSmall}`}
											onClick={() => openModal(method.modal)}
										>
											{method.action}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ==================== 02 NOTIFICATION PREFERENCES ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="02"
					title="Notification Preferences"
					copy="Control how and when you receive alerts across email, SMS, push and WhatsApp."
					action={
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("notifSettingsModal")}
						>
							<i className="bi bi-sliders" /> Advanced
						</button>
					}
				/>
				<div className={`${styles.card} ${styles.toggleCardGrid}`}>
					{notifs.map((n) => (
						<div
							key={n.name}
							className={styles.toggleCard}
							style={{
								borderColor: n.on ? "var(--pm-green-soft)" : "var(--pm-border)",
								background: n.on
									? "var(--pm-green-soft)"
									: "var(--pm-surface-2)",
							}}
						>
							<div>
								<div className={styles.toggleCardTitle}>{n.name}</div>
								<div className={styles.toggleCardMeta}>{n.detail}</div>
							</div>
							<div className={styles.toggleCardRight}>
								<StatusBadge
									label={n.on ? "On" : "Off"}
									variant={n.on ? "success" : "outline"}
								/>
								<div className={styles.toggleCardChannel}>{n.channels}</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ==================== 03 LINKED DEVICES & ACTIVE SESSIONS ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="03"
					title="Linked Devices & Active Sessions"
					copy="View and manage all devices currently logged into your account."
					action={
						<div className={styles.headerButtonRow}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("sessionModal")}
							>
								<i className="bi bi-list-ul" /> Manage All
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
								onClick={() => openModal("terminateAllSessionsModal")}
							>
								<i className="bi bi-x-circle" /> Terminate All
							</button>
						</div>
					}
				/>
				<div className={styles.card}>
					<div className={styles.countRow}>
						<span className={styles.countValue}>{sess.length}</span>
						<span className={styles.countLabel}>active sessions</span>
						<span className={`${styles.badge} ${styles.badgeWarning}`}>
							<i className="bi bi-exclamation-triangle"></i> 1 new device
						</span>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Device</th>
									<th>Location</th>
									<th>Last Active</th>
									<th>IP</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{sess.map((row) => (
									<tr key={row.device}>
										<td>
											<strong>{row.device}</strong>
											<div className={styles.cellMeta}>{row.detail}</div>
										</td>
										<td>{row.location}</td>
										<td>{row.lastActive}</td>
										<td>{row.ip}</td>
										<td>
											<StatusBadge
												label={row.status}
												variant={row.status === "New" ? "warning" : "success"}
											/>
										</td>
										<td>
											{row.current ? (
												<button
													type="button"
													className={`${styles.button} ${styles.buttonSmall}`}
													disabled
												>
													This device
												</button>
											) : (
												<button
													type="button"
													className={`${styles.button} ${styles.buttonSmall}`}
												>
													Terminate
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* ==================== 04 KYC & DOCUMENT VAULT ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="04"
					title="KYC & Document Vault"
					copy="Upload, view and manage all identity and address verification documents."
					action={
						<div className={styles.headerButtonRow}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("kycModal")}
							>
								<i className="bi bi-upload" /> Upload
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal("kycModal")}
							>
								<i className="bi bi-folder2-open" /> Vault
							</button>
						</div>
					}
				/>
				<div className={styles.kycGrid}>
					<div className={styles.card}>
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Document</th>
										<th>Type</th>
										<th>Status</th>
										<th>Uploaded</th>
										<th>Expiry</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{kyc.map((doc) => (
										<tr key={doc.name}>
											<td>
												<strong>{doc.name}</strong>
											</td>
											<td>{doc.type}</td>
											<td>
												<StatusBadge label={doc.status} variant={doc.variant} />
											</td>
											<td>{doc.uploaded}</td>
											<td>{doc.expiry}</td>
											<td>
												<button
													type="button"
													className={`${styles.button} ${styles.buttonSmall}`}
													onClick={() =>
														openModal(
															doc.status === "Expiring"
																? "kycModal"
																: "viewDocModal",
														)
													}
												>
													{doc.status === "Expiring" ? "Renew" : "View"}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<div className={styles.kycPanel}>
						<h4 className={styles.kycPanelTitle}>Verification Progress</h4>
						<div className={styles.verificationBlock}>
							<div className={styles.verificationRow}>
								<span>Identity</span>
								<span>100%</span>
							</div>
							<div className={styles.progressTrack}>
								<div
									className={styles.progressBar}
									style={{ width: "100%" }}
								></div>
							</div>
						</div>
						<div className={styles.verificationBlock}>
							<div className={styles.verificationRow}>
								<span>Address</span>
								<span>75%</span>
							</div>
							<div className={styles.progressTrack}>
								<div
									className={styles.progressBar}
									style={{ width: "75%", background: "var(--pm-warn)" }}
								></div>
							</div>
						</div>
						<div className={styles.verificationBlock}>
							<div className={styles.verificationRow}>
								<span>Financial</span>
								<span>100%</span>
							</div>
							<div className={styles.progressTrack}>
								<div
									className={styles.progressBar}
									style={{ width: "100%" }}
								></div>
							</div>
						</div>
						<div className={`${styles.alertBox} ${styles.alertSuccess}`}>
							<i className="bi bi-check-circle"></i>
							<span>Full KYC verified — all limits unlocked.</span>
						</div>
					</div>
				</div>
			</section>

			{/* ==================== 05 API & DEVELOPER SETTINGS ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="05"
					title="API & Developer Settings"
					copy="Manage API keys and webhooks for third-party integrations and PSP tooling."
					action={
						<div className={styles.headerButtonRow}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("webhookModal")}
							>
								<i className="bi bi-broadcast" /> Webhooks
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal("apiKeyModal")}
							>
								<i className="bi bi-key" /> Create Key
							</button>
						</div>
					}
				/>
				<div className={styles.card}>
					{keys.map((k) => (
						<div className={styles.apiKeyRow} key={k.name}>
							<div className={styles.apiKeyIcon}>
								<i className="bi bi-key"></i>
							</div>
							<div className={styles.apiKeyInfo}>
								<div className={styles.apiKeyName}>{k.name}</div>
								<div className={styles.apiKeyMeta}>Last used: {k.lastUsed}</div>
							</div>
							<code className={styles.keyValue}>{k.key}</code>
							<StatusBadge label={k.status} variant={k.variant} />
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSmall}`}
								>
									<i className="bi bi-copy" /> Copy
								</button>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSmall}`}
								>
									<i className="bi bi-arrow-counterclockwise" /> Rotate
								</button>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ==================== 06 PREFERENCES & LOCALIZATION ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="06"
					title="Preferences & Localization"
					copy="Language, timezone, currency and interface preferences."
					action={
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("preferencesModal")}
						>
							<i className="bi bi-gear" /> Manage
						</button>
					}
				/>
				<div className={`${styles.card} ${styles.detailGrid}`}>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>
							<i className="bi bi-globe2"></i> Language
						</div>
						<div className={styles.detailValue}>English (UK)</div>
						<div className={styles.detailMeta}>Secondary: Swahili</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>
							<i className="bi bi-clock"></i> Time Zone
						</div>
						<div className={styles.detailValue}>Africa/Nairobi (EAT)</div>
						<div className={styles.detailMeta}>UTC+03:00</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>
							<i className="bi bi-currency-exchange"></i> Default Currency
						</div>
						<div className={styles.detailValue}>KES — Kenyan Shilling</div>
						<div className={styles.detailMeta}>Display only</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>
							<i className="bi bi-palette"></i> Interface Theme
						</div>
						<div className={styles.detailValue}>Emerald Light</div>
						<div className={styles.detailMeta}>System sync enabled</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>
							<i className="bi bi-megaphone"></i> Statement Frequency
						</div>
						<div className={styles.detailValue}>Monthly</div>
						<div className={styles.detailMeta}>Email PDF delivery</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>
							<i className="bi bi-universal-access"></i> Accessibility
						</div>
						<div className={styles.detailValue}>Standard</div>
						<div className={styles.detailMeta}>Reduced motion off</div>
					</div>
				</div>
			</section>

			{/* ==================== 07 PRIVACY & DATA CONTROLS ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="07"
					title="Privacy & Data Controls"
					copy="Manage data sharing, marketing preferences, data export and deletion requests."
					action={
						<div className={styles.headerButtonRow}>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("privacyModal")}
							>
								<i className="bi bi-gear" /> Manage
							</button>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("downloadDataModal")}
							>
								<i className="bi bi-download" /> Export
							</button>
						</div>
					}
				/>
				<div className={`${styles.card} ${styles.privacyGrid}`}>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>Data Sharing</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>
								Anonymized product data
							</span>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								On
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Third-party partners</span>
							<span className={`${styles.badge} ${styles.badgeOutline}`}>
								Off
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Personalized offers</span>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								On
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Credit bureaus</span>
							<span className={`${styles.badge} ${styles.badgeOutline}`}>
								Off
							</span>
						</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>Marketing Preferences</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Email marketing</span>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								On
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>SMS marketing</span>
							<span className={`${styles.badge} ${styles.badgeOutline}`}>
								Off
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Push notifications</span>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								On
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>WhatsApp marketing</span>
							<span className={`${styles.badge} ${styles.badgeOutline}`}>
								Off
							</span>
						</div>
					</div>
					<div className={styles.detailBlock}>
						<div className={styles.detailBlockTitle}>Data Rights</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Download my data</span>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("downloadDataModal")}
							>
								Request
							</button>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Request data deletion</span>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("closeAccountModal")}
							>
								Request
							</button>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Processing log</span>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal("privacyModal")}
							>
								View
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* ==================== 08 BENEFICIARIES & NEXT OF KIN ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="08"
					title="Beneficiaries & Next of Kin"
					copy="Manage family members, next of kin, and charitable organizations for fund distribution."
					action={
						<button
							type="button"
							className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
							onClick={() => openModal("addBeneficiaryModal")}
						>
							<i className="bi bi-plus-lg" /> Add Beneficiary
						</button>
					}
				/>
				<div className={styles.card}>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Name</th>
									<th>Relation</th>
									<th>ID / KRA PIN</th>
									<th>Account Type</th>
									<th>Account Number</th>
									<th>Age</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{benefs.map((ben) => (
									<tr key={ben.id}>
										<td>
											<strong>{ben.name}</strong>
										</td>
										<td>{ben.relation}</td>
										<td>
											<div className={styles.cellMain}>ID: {ben.idNumber}</div>
											<div className={styles.cellMeta}>KRA: {ben.kraPin}</div>
										</td>
										<td>{ben.accountType}</td>
										<td>
											<code className={styles.cellCode}>
												{ben.accountNumber}
											</code>
										</td>
										<td>{ben.age ?? "—"}</td>
										<td>
											<StatusBadge label={ben.status} variant={ben.variant} />
										</td>
										<td>
											<div className={styles.headerButtonRow}>
												<button
													type="button"
													className={`${styles.button} ${styles.buttonSmall}`}
													onClick={() => openModal("editBeneficiaryModal")}
													aria-label={`Edit ${ben.name}`}
												>
													<i className="bi bi-pencil"></i>
												</button>
												<button
													type="button"
													className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
													onClick={() => openModal("deleteBeneficiaryModal")}
													aria-label={`Remove ${ben.name}`}
												>
													<i className="bi bi-trash"></i>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className={styles.infoStrip}>
						<i className="bi bi-info-circle"></i> Beneficiaries are used for
						account closure fund distribution. Children under 18 require a
						guardian account setup.
					</div>
				</div>
			</section>

			{/* ==================== 09 ACCOUNT ADMINISTRATION ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="09"
					title="Account Administration"
					copy="Account status, closure requests, reactivation and full lifecycle management."
				/>
				<div className={styles.card}>
					<div
						className={styles.pills}
						role="tablist"
						aria-label="Account administration views"
					>
						{["Overview", "Close Main Account", "Close Business Accounts"].map(
							(tab, i) => (
								<button
									type="button"
									key={tab}
									role="tab"
									aria-selected={adminTab === i}
									className={`${styles.pill} ${adminTab === i ? styles.pillActive : ""}`}
									onClick={() => setAdminTab(i)}
								>
									{tab}
								</button>
							),
						)}
					</div>

					{adminTab === 0 && (
						<div className={styles.adminOverview}>
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Account Status</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Account Status</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>
										Active
									</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>
										Verification Level
									</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>
										Full KYC
									</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Account Type</span>
									<span className={styles.summaryValue}>
										Individual — Premium
									</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Created</span>
									<span className={styles.summaryValue}>12 January 2023</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Last Login</span>
									<span className={styles.summaryValue}>Today, 14:22 EAT</span>
								</div>
							</div>
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Lifecycle Actions</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>
										Download full account data
									</span>
									<button
										type="button"
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal("downloadDataModal")}
									>
										Export
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>
										Linked accounts &amp; wallets
									</span>
									<button
										type="button"
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal("linkedAccountsModal")}
									>
										Manage
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>
										Request account reactivation
									</span>
									<button
										type="button"
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal("reactivateModal")}
									>
										Request
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>
										Schedule account closure
									</span>
									<button
										type="button"
										className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
										onClick={() => setAdminTab(1)}
									>
										Schedule
									</button>
								</div>
							</div>
						</div>
					)}

					{adminTab === 1 && (
						<div className={styles.adminPanel}>
							<div className={`${styles.alertBox} ${styles.alertDanger}`}>
								<i className="bi bi-exclamation-triangle-fill"></i>
								<span>
									<strong>Close Main Account.</strong> Closing your main account
									is permanent. All balances will be transferred to your
									designated payout account.
								</span>
							</div>
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									Main Account Details
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Account Name</span>
									<span className={styles.summaryValue}>Amina Grace Kamau</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Account Type</span>
									<span className={styles.summaryValue}>
										Individual — Premium
									</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>Current Balance</span>
									<span
										className={styles.summaryValue}
										style={{ color: "var(--pm-green)" }}
									>
										KES 1,284,300
									</span>
								</div>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>
										Linked Business Accounts
									</span>
									<span className={styles.summaryValue}>3 active</span>
								</div>
							</div>
							<div className={styles.adminActions}>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonDanger}`}
									onClick={() => openModal("closeAccountModal")}
								>
									<i className="bi bi-x-circle" /> Close Main Account
								</button>
								<button
									type="button"
									className={styles.button}
									onClick={() => setAdminTab(0)}
								>
									Cancel
								</button>
							</div>
						</div>
					)}

					{adminTab === 2 && (
						<div className={styles.adminPanel}>
							<div className={`${styles.alertBox} ${styles.alertInfo}`}>
								<i className="bi bi-building"></i>
								<span>
									<strong>Close Business Accounts.</strong> Close linked
									business accounts individually. Each closure requires a fund
									payout destination.
								</span>
							</div>
							{[
								{
									name: "TechVentures Ltd",
									detail: "Business Account • KES 2,450,000",
									status: "Active",
									grad: "linear-gradient(135deg,#7c3aed,#5b21b6)",
									letter: "T",
								},
								{
									name: "GreenGrocery Co",
									detail: "Business Account • KES 890,000",
									status: "Active",
									grad: "linear-gradient(135deg,#12b76a,#0b8f52)",
									letter: "G",
								},
								{
									name: "Swift Logistics",
									detail: "Business Account • KES 1,120,000",
									status: "Active",
									grad: "linear-gradient(135deg,#f79009,#d97706)",
									letter: "S",
								},
							].map((biz) => (
								<div className={styles.summaryRow} key={biz.name}>
									<div className={styles.bizLead}>
										<div
											className={styles.bizAvatar}
											style={{ background: biz.grad }}
										>
											{biz.letter}
										</div>
										<div>
											<div className={styles.cellMain}>{biz.name}</div>
											<div className={styles.cellMeta}>{biz.detail}</div>
										</div>
									</div>
									<button
										type="button"
										className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
										onClick={() => openModal("closeBusinessAccountModal")}
									>
										<i className="bi bi-x-circle" /> Close
									</button>
								</div>
							))}
							<div className={styles.adminActions}>
								<button
									type="button"
									className={styles.button}
									onClick={() => setAdminTab(0)}
								>
									Back to Overview
								</button>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* ==================== 10 RECENT SECURITY EVENTS ==================== */}
			<section className={styles.dashboardSection}>
				<SectionHeading
					index="10"
					title="Recent Security Events"
					copy="Latest authentication and compliance events on your account."
					action={
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("securityAuditModal")}
						>
							<i className="bi bi-eye" /> Full Audit Log
						</button>
					}
				/>
				<div className={styles.card}>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Date</th>
									<th>Event</th>
									<th>IP</th>
									<th>Device</th>
								</tr>
							</thead>
							<tbody>
								{audit.map((row) => (
									<tr key={row.date}>
										<td className={styles.cellNowrap}>{row.date}</td>
										<td>{row.event}</td>
										<td>{row.ip}</td>
										<td>{row.device}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* ==================== ATTENTION / SUGGESTIONS / QUICK ACTIONS ==================== */}
			<div className={styles.tripleGrid}>
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<h3 className={styles.cardTitle}>
							<i
								className="bi bi-exclamation-triangle"
								style={{ color: "var(--pm-warn)" }}
							></i>
							Attention Required
						</h3>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("attentionModal")}
						>
							View all
						</button>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							Password expires in 12 days
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("changePasswordModal")}
						>
							Update
						</button>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							Secondary phone not verified
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("editProfileModal")}
						>
							Verify
						</button>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							New login from Windows PC
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("sessionModal")}
						>
							Review
						</button>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							Proof of address expiring
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("kycModal")}
						>
							Renew
						</button>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<h3 className={styles.cardTitle}>
							<i
								className="bi bi-lightbulb"
								style={{ color: "var(--pm-violet)" }}
							></i>
							Smart Suggestions
						</h3>
						<span className={`${styles.badge} ${styles.badgePurple}`}>
							<i className="bi bi-stars"></i> AI
						</span>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							Enable biometric login on mobile
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("enable2FAModal")}
						>
							Enable
						</button>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							Upload updated proof of address
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("kycModal")}
						>
							Upload
						</button>
					</div>
					<div className={styles.summaryRow}>
						<span className={styles.attentionText}>
							Review data sharing preferences
						</span>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("privacyModal")}
						>
							Review
						</button>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.cardTitle}>
								<i
									className="bi bi-bolt"
									style={{ color: "var(--pm-green)" }}
								></i>
								Quick Actions
							</h3>
							<p className={styles.cardKicker}>Frequent management tasks</p>
						</div>
					</div>
					<div className={styles.quickGrid}>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("enable2FAModal")}
						>
							<i
								className="bi bi-shield-check"
								style={{ color: "var(--pm-green)" }}
							></i>{" "}
							2FA
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("changePasswordModal")}
						>
							<i className="bi bi-key" style={{ color: "var(--pm-warn)" }}></i>{" "}
							Password
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("sessionModal")}
						>
							<i
								className="bi bi-laptop"
								style={{ color: "var(--pm-blue)" }}
							></i>{" "}
							Sessions
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("securityQuestionsModal")}
						>
							<i
								className="bi bi-question-circle"
								style={{ color: "var(--pm-violet)" }}
							></i>{" "}
							Questions
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("apiKeyModal")}
						>
							<i
								className="bi bi-code-slash"
								style={{ color: "var(--pm-green)" }}
							></i>{" "}
							API Keys
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("preferencesModal")}
						>
							<i
								className="bi bi-translate"
								style={{ color: "var(--pm-warn)" }}
							></i>{" "}
							Preferences
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("linkedAccountsModal")}
						>
							<i
								className="bi bi-link-45deg"
								style={{ color: "var(--pm-green)" }}
							></i>{" "}
							Linked
						</button>
						<button
							type="button"
							className={styles.quickButton}
							onClick={() => openModal("downloadDataModal")}
						>
							<i
								className="bi bi-download"
								style={{ color: "var(--pm-green)" }}
							></i>{" "}
							Export
						</button>
					</div>
				</div>
			</div>

			{/* ==================== FOOTER ==================== */}
			<footer className={styles.pageFooter}>
				<p>
					<i className="bi bi-shield-lock"></i> Account settings are protected
					by two-factor authentication. Sensitive changes are logged in your
					security audit trail.
				</p>
			</footer>

			{/* ==================== MODALS ==================== */}
			<AccountSettingsModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
			/>
		</div>
	);
}
