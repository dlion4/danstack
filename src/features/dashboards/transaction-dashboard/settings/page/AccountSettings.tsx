'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AccountSettingsModals } from '../modals/AccountSettingsModals';
import styles from '../style/accountSettings.module.css';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const sessions = [
	{ device: 'iPhone 15 Pro', detail: 'iOS 18.5 • App v4.2.1', location: 'Nairobi, KE', lastActive: 'Just now', ip: '102.68.XX.XX', status: 'Current', current: true },
	{ device: 'MacBook Pro', detail: 'macOS 15.4 • Safari', location: 'Nairobi, KE', lastActive: '14:22 today', ip: '102.68.XX.XX', status: 'Active', current: false },
	{ device: 'Windows PC', detail: 'Windows 11 • Chrome', location: 'Nairobi, KE', lastActive: '26 Jun 2025', ip: '102.68.XX.XX', status: 'New', current: false },
	{ device: 'iPad Air', detail: 'iPadOS 18.4 • App', location: 'Mombasa, KE', lastActive: '20 Jun 2025', ip: '105.XX.XX.XX', status: 'Active', current: false },
];

const auditLog = [
	{ date: '27 Jun 2025 14:22', event: 'Login from new device (iPhone 15 Pro)', type: 'login', ip: '102.68.XX.XX', device: 'iPhone 15 Pro' },
	{ date: '15 Jun 2025 09:10', event: 'Password changed', type: 'key', ip: '102.68.XX.XX', device: 'MacBook Pro' },
	{ date: '10 Jun 2025 11:45', event: '2FA enabled via Authenticator App', type: 'shield', ip: '102.68.XX.XX', device: 'MacBook Pro' },
	{ date: '03 Jun 2025 16:20', event: 'KYC document uploaded (Utility Bill)', type: 'file', ip: '102.68.XX.XX', device: 'MacBook Pro' },
	{ date: '01 Jun 2025 08:00', event: 'Session terminated remotely', type: 'danger', ip: '105.XX.XX.XX', device: 'iPad Air' },
];

const authMethods = [
	{
		icon: 'bi bi-key',
		bg: 'var(--warning-bg)',
		color: 'var(--warning)',
		name: 'Password',
		desc: 'Last changed 89 days ago • expires in 12 days',
		status: { label: 'Expiring', variant: 'warning' },
		action: 'Change',
		modal: 'changePasswordModal',
	},
	{
		icon: 'bi bi-shield-check',
		bg: 'var(--success-bg)',
		color: 'var(--success)',
		name: '2FA (Authenticator App)',
		desc: 'Google Authenticator • backup codes on file',
		status: { label: 'Enabled', variant: 'success' },
		action: 'Manage',
		modal: 'enable2FAModal',
	},
	{
		icon: 'bi bi-fingerprint',
		bg: 'var(--purple-bg)',
		color: 'var(--purple)',
		name: 'Biometric Login',
		desc: 'Fingerprint + Face ID on trusted devices',
		status: { label: 'Enabled', variant: 'success' },
		action: 'Manage',
		modal: 'enable2FAModal',
	},
	{
		icon: 'bi bi-question-circle',
		bg: 'var(--info-bg)',
		color: 'var(--info)',
		name: 'Security Questions',
		desc: '3 questions set for account recovery',
		status: { label: 'Set', variant: 'success' },
		action: 'Edit',
		modal: 'securityQuestionsModal',
	},
];

const notifications = [
	{ name: 'Security Alerts', detail: 'Login, password & 2FA events', on: true, channels: '4 channels' },
	{ name: 'Transaction Alerts', detail: 'Every debit & credit event', on: true, channels: 'Push' },
	{ name: 'Large Transaction Warnings', detail: 'Above KES 500,000', on: true, channels: 'Push + SMS' },
	{ name: 'KYC Document Expiry', detail: '45 / 15 day reminders', on: true, channels: '3 channels' },
	{ name: 'Statement Ready', detail: 'Monthly statements', on: false, channels: 'Off' },
	{ name: 'Marketing', detail: 'Offers & product updates', on: false, channels: 'Off' },
];

const kycDocs = [
	{ name: 'National ID', type: 'Identity', status: 'Verified', uploaded: '12 Jan 2023', expiry: '—', variant: 'success' },
	{ name: 'Passport', type: 'Identity', status: 'Verified', uploaded: '03 Mar 2024', expiry: 'Mar 2031', variant: 'success' },
	{ name: 'Utility Bill', type: 'Address', status: 'Expiring', uploaded: '15 May 2025', expiry: '15 Aug 2025', variant: 'warning' },
	{ name: 'Selfie', type: 'Identity', status: 'Verified', uploaded: '12 Jan 2023', expiry: '—', variant: 'success' },
	{ name: 'Bank Statement', type: 'Financial', status: 'Verified', uploaded: '20 Jun 2025', expiry: '—', variant: 'success' },
];

const apiKeys = [
	{ name: 'Production', key: 'pm_live_9xK2••••••••••••', lastUsed: 'Today, 14:22', status: 'Active', variant: 'success' },
	{ name: 'Sandbox', key: 'pm_test_5yQ7••••••••••••', lastUsed: 'Yesterday, 09:10', status: 'Active', variant: 'success' },
	{ name: 'Merchant Portal', key: 'pm_merch_3tR8••••••', lastUsed: '20 Jun 2025', status: 'Revoked', variant: 'danger' },
];

const fetchSettingsData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { sessions, auditLog, authMethods, notifications, kycDocs, apiKeys };
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
	const icon = variant === 'success' ? 'bi-check-circle' : variant === 'warning' ? 'bi-clock' : 'bi-dot';
	return (
		<span className={`${styles.badge} ${map[variant] ?? styles.badgeOutline}`}>
			<i className={`bi ${icon}`}></i> {label}
		</span>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AccountSettings() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});

	const openModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	const { data } = useQuery({
		queryKey: ['accountSettingsData'],
		queryFn: fetchSettingsData,
		initialData: { sessions, auditLog, authMethods, notifications, kycDocs, apiKeys },
	});

	const { sessions: sess, auditLog: audit, authMethods: auth, notifications: notifs, kycDocs: kyc, apiKeys: keys } = data;

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Account</a> /{' '}
						<strong>Settings & Administration</strong>
					</div>
					<h1 className={styles.pageTitle}>Account Settings & Administration</h1>
					<p className={styles.pageDescription}>
						Security posture, authentication, devices, KYC documents, notifications, privacy
						controls, developer tools and account lifecycle — one comprehensive hub.
					</p>
				</div>
				<div className={styles.pageActions}>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('editProfileModal')}
					>
						<i className="bi bi-person"></i> Edit Profile
					</button>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('changePasswordModal')}
					>
						<i className="bi bi-key"></i> Password
					</button>
					<button
						className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
						onClick={() => openModal('enable2FAModal')}
					>
						<i className="bi bi-shield-check"></i> 2FA
					</button>
					<button
						className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
						onClick={() => openModal('closeAccountModal')}
					>
						<i className="bi bi-exclamation-triangle"></i> Close Account
					</button>
				</div>
			</div>

			{/* ==================== CONTENT ==================== */}
			<div className={styles.contentGrid}>
				{/* ---------- HERO STATS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
							<p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>
								Security posture is strong <span style={{ color: '#86efac' }}>●</span>
							</p>
							<div className={styles.statValue} style={{ color: '#fff', margin: '8px 0' }}>
								92/100
							</div>
							<p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>
								2FA enabled • Biometrics active • No open incidents • Audit log clean.
							</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button
									className={`${styles.button} ${styles.buttonSmall}`}
									style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff' }}
									onClick={() => openModal('securityAuditModal')}
								>
									Audit
								</button>
								<button
									className={`${styles.button} ${styles.buttonSmall}`}
									style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff' }}
									onClick={() => openModal('sessionModal')}
								>
									Sessions
								</button>
								<button
									className={`${styles.button} ${styles.buttonSmall}`}
									style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff' }}
									onClick={() => openModal('securityQuestionsModal')}
								>
									Questions
								</button>
							</div>
						</div>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<div className={`${styles.card} ${styles.statCard}`}>
							<p className={styles.statLabel} style={{ color: 'var(--success)' }}>
								OPEN INCIDENTS
							</p>
							<div className={styles.statValue}>0</div>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}>
								<i className="bi bi-check-circle"></i> Clean
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: 'var(--ink-700)' }}>
								Last incident: none
								<br />
								in 18 months
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<div className={`${styles.card} ${styles.statCard}`}>
							<p className={styles.statLabel} style={{ color: 'var(--warning)' }}>
								RECOMMENDATIONS
							</p>
							<div className={styles.statValue}>3</div>
							<span className={`${styles.badge} ${styles.badgeWarning}`}>
								<i className="bi bi-lightbulb"></i> Actionable
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: 'var(--ink-700)' }}>
								Renew POA • Review sharing
								<br />
								Upgrade password
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4">
						<div className={`${styles.card} ${styles.statCard}`} style={{ borderLeft: '3px solid var(--danger)' }}>
							<p className={styles.statLabel} style={{ color: 'var(--danger)' }}>
								PASSWORD EXPIRY
							</p>
							<div className={styles.statValue}>12 days</div>
							<span className={`${styles.badge} ${styles.badgeDanger}`}>
								<i className="bi bi-clock"></i> Renew soon
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: 'var(--ink-700)' }}>
								Last changed 89 days ago
								<br />
								Policy: 90-day rotation
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 18.3 SECURITY & AUTHENTICATION ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-shield-lock" style={{ color: 'var(--danger)' }}></i>
								Security & Authentication
							</h3>
							<p className={styles.sectionSubtitle}>
								Password, 2FA, PIN, security questions, login history and trusted devices.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('securityAuditModal')}
							>
								<i className="bi bi-shield-check"></i> Audit
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('enable2FAModal')}
							>
								<i className="bi bi-shield-check"></i> 2FA
							</button>
						</div>
					</div>
					<div className={styles.methodsGrid}>
						{auth.map((method) => (
							<div className={styles.methodCard} key={method.name}>
								<div className={styles.methodIcon} style={{ background: method.bg, color: method.color }}>
									<i className={method.icon}></i>
								</div>
								<div className={styles.methodBody}>
									<div className={styles.methodName}>{method.name}</div>
									<div className={styles.methodDesc}>{method.desc}</div>
									<div className={styles.methodFooter}>
										<StatusBadge label={method.status.label} variant={method.status.variant} />
										<button
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

				{/* ---------- 18.4 NOTIFICATION PREFERENCES ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-bell" style={{ color: 'var(--warning)' }}></i>
								Notification Preferences
							</h3>
							<p className={styles.sectionSubtitle}>
								Control how and when you receive alerts across email, SMS, push and WhatsApp.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('notifSettingsModal')}
						>
							<i className="bi bi-sliders"></i> Advanced
						</button>
					</div>
					<div className="row g-3">
						{notifs.map((n) => (
							<div className="col-lg-4 col-md-6" key={n.name}>
								<div
									style={{
										background: 'var(--surface-2)',
										border: `1px solid ${n.on ? 'var(--success)' : 'var(--border)'}`,
										borderRadius: 'var(--radius-md)',
										padding: '14px 16px',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										gap: 12,
										height: '100%',
									}}
								>
									<div>
										<div style={{ fontWeight: 600, fontSize: 13 }}>{n.name}</div>
										<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{n.detail}</div>
									</div>
									<div style={{ textAlign: 'right', flexShrink: 0 }}>
										<StatusBadge
											label={n.on ? 'On' : 'Off'}
											variant={n.on ? 'success' : 'outline'}
										/>
										<div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 4 }}>
											{n.channels}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ---------- 18.5 LINKED DEVICES & SESSIONS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-laptop" style={{ color: 'var(--purple)' }}></i>
								Linked Devices & Active Sessions
							</h3>
							<p className={styles.sectionSubtitle}>
								View and manage all devices currently logged into your account.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('sessionModal')}
							>
								<i className="bi bi-list-ul"></i> Manage All
							</button>
							<button
								className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
								onClick={() => openModal('terminateAllSessionsModal')}
							>
								Terminate All
							</button>
						</div>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
						<span className={styles.statValue} style={{ fontSize: 22 }}>
							{sess.length}
						</span>
						<span style={{ fontSize: 13, color: 'var(--ink-700)' }}>active sessions</span>
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
											<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{row.detail}</div>
										</td>
										<td>{row.location}</td>
										<td>{row.lastActive}</td>
										<td>{row.ip}</td>
										<td>
											<StatusBadge
												label={row.status}
												variant={row.status === 'New' ? 'warning' : 'success'}
											/>
										</td>
										<td>
											{row.current ? (
												<button className={`${styles.button} ${styles.buttonSmall}`} disabled>
													This device
												</button>
											) : (
												<button className={`${styles.button} ${styles.buttonSmall}`}>Terminate</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- 18.6 KYC & DOCUMENT VAULT ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-file-earmark-check" style={{ color: 'var(--success)' }}></i>
								KYC & Document Vault
							</h3>
							<p className={styles.sectionSubtitle}>
								Upload, view and manage all identity and address verification documents.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('kycModal')}
							>
								<i className="bi bi-upload"></i> Upload
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('kycModal')}
							>
								Vault
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-8">
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
													<StatusBadge
														label={doc.status}
														variant={doc.variant}
													/>
												</td>
												<td>{doc.uploaded}</td>
												<td>{doc.expiry}</td>
												<td>
													<button
														className={`${styles.button} ${styles.buttonSmall}`}
														onClick={() => openModal(doc.status === 'Expiring' ? 'kycModal' : 'viewDocModal')}
													>
														{doc.status === 'Expiring' ? 'Renew' : 'View'}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
						<div className="col-lg-4">
							<div
								style={{
									background: 'var(--surface-2)',
									border: '1px solid var(--border)',
									borderRadius: 'var(--radius-md)',
									padding: 16,
									height: '100%',
								}}
							>
								<h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
									Verification Progress
								</h4>
								<div style={{ marginBottom: 12 }}>
									<div className={styles.verificationRow}>
										<span>Identity</span>
										<span>100%</span>
									</div>
									<div className={styles.progressTrack}>
										<div className={styles.progressBar} style={{ width: '100%' }}></div>
									</div>
								</div>
								<div style={{ marginBottom: 12 }}>
									<div className={styles.verificationRow}>
										<span>Address</span>
										<span>75%</span>
									</div>
									<div className={styles.progressTrack}>
										<div className={styles.progressBar} style={{ width: '75%', background: 'var(--warning)' }}></div>
									</div>
								</div>
								<div style={{ marginBottom: 12 }}>
									<div className={styles.verificationRow}>
										<span>Financial</span>
										<span>100%</span>
									</div>
									<div className={styles.progressTrack}>
										<div className={styles.progressBar} style={{ width: '100%' }}></div>
									</div>
								</div>
								<div className={styles.alertBox + ' ' + styles.alertSuccess}>
									<i className="bi bi-check-circle"></i>
									<span>Full KYC verified — all limits unlocked.</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- API & DEVELOPER SETTINGS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-code-slash" style={{ color: 'var(--info)' }}></i>
								API & Developer Settings
							</h3>
							<p className={styles.sectionSubtitle}>
								Manage API keys and webhooks for third-party integrations and PSP tooling.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('webhookModal')}
							>
								<i className="bi bi-broadcast"></i> Webhooks
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('apiKeyModal')}
							>
								<i className="bi bi-key"></i> Create Key
							</button>
						</div>
					</div>
					<div>
						{keys.map((k) => (
							<div className={styles.apiKeyRow} key={k.name}>
								<div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
									<i className="bi bi-key"></i>
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div className={styles.apiKeyName}>{k.name}</div>
									<div className={styles.apiKeyMeta}>
										Last used: {k.lastUsed}
									</div>
								</div>
								<code className={styles.keyValue}>{k.key}</code>
								<StatusBadge label={k.status} variant={k.variant} />
								<div className="d-flex" style={{ gap: 6 }}>
									<button className={`${styles.button} ${styles.buttonSmall}`}>Copy</button>
									<button className={`${styles.button} ${styles.buttonSmall}`}>Rotate</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ---------- PREFERENCES & LOCALIZATION ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-translate" style={{ color: 'var(--purple)' }}></i>
								Preferences & Localization
							</h3>
							<p className={styles.sectionSubtitle}>
								Language, timezone, currency and interface preferences.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('preferencesModal')}
						>
							<i className="bi bi-gear"></i> Manage
						</button>
					</div>
					<div className="row g-3">
						<div className="col-md-4 col-sm-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									<i className="bi bi-globe2"></i> Language
								</div>
								<div style={{ fontWeight: 600 }}>English (UK)</div>
								<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Secondary: Swahili</div>
							</div>
						</div>
						<div className="col-md-4 col-sm-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									<i className="bi bi-clock"></i> Time Zone
								</div>
								<div style={{ fontWeight: 600 }}>Africa/Nairobi (EAT)</div>
								<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>UTC+03:00</div>
							</div>
						</div>
						<div className="col-md-4 col-sm-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									<i className="bi bi-currency-exchange"></i> Default Currency
								</div>
								<div style={{ fontWeight: 600 }}>KES — Kenyan Shilling</div>
								<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Display only</div>
							</div>
						</div>
						<div className="col-md-4 col-sm-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									<i className="bi bi-palette"></i> Interface Theme
								</div>
								<div style={{ fontWeight: 600 }}>Emerald Light</div>
								<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>System sync enabled</div>
							</div>
						</div>
						<div className="col-md-4 col-sm-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									<i className="bi bi-megaphone"></i> Statement Frequency
								</div>
								<div style={{ fontWeight: 600 }}>Monthly</div>
								<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Email PDF delivery</div>
							</div>
						</div>
						<div className="col-md-4 col-sm-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>
									<i className="bi bi-universal-access"></i> Accessibility
								</div>
								<div style={{ fontWeight: 600 }}>Standard</div>
								<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Reduced motion off</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 18.7 PRIVACY & DATA CONTROLS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-lock" style={{ color: 'var(--purple)' }}></i>
								Privacy & Data Controls
							</h3>
							<p className={styles.sectionSubtitle}>
								Manage data sharing, marketing preferences, data export and deletion requests.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('privacyModal')}
							>
								<i className="bi bi-gear"></i> Manage
							</button>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('downloadDataModal')}
							>
								<i className="bi bi-download"></i> Export
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Data Sharing</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Anonymized product data</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>On</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Third-party partners</span>
									<span className={`${styles.badge} ${styles.badgeOutline}`}>Off</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Personalized offers</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>On</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Credit bureaus</span>
									<span className={`${styles.badge} ${styles.badgeOutline}`}>Off</span>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Marketing Preferences</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Email marketing</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>On</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>SMS marketing</span>
									<span className={`${styles.badge} ${styles.badgeOutline}`}>Off</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Push notifications</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>On</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>WhatsApp marketing</span>
									<span className={`${styles.badge} ${styles.badgeOutline}`}>Off</span>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Data Rights</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Download my data</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('downloadDataModal')}>
										Request
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Request data deletion</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('closeAccountModal')}>
										Request
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Processing log</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('privacyModal')}>
										View
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 18.8 ACCOUNT ADMINISTRATION ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-gear-wide-connected" style={{ color: 'var(--danger)' }}></i>
								Account Administration
							</h3>
							<p className={styles.sectionSubtitle}>
								Account status, closure requests, reactivation and full lifecycle management.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
							onClick={() => openModal('closeAccountModal')}
						>
							Close Account
						</button>
					</div>
					<div className="row g-3">
						<div className="col-lg-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Account Status</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Account Status</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Verification Level</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>Full KYC</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Account Type</span>
									<span style={{ fontWeight: 600, fontSize: 13 }}>Individual — Premium</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Created</span>
									<span style={{ fontWeight: 600, fontSize: 13 }}>12 January 2023</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Last Login</span>
									<span style={{ fontWeight: 600, fontSize: 13 }}>Today, 14:22 EAT</span>
								</div>
							</div>
						</div>
						<div className="col-lg-6">
							<div className={styles.detailBlock}>
								<div className={styles.detailBlockTitle}>Lifecycle Actions</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Download full account data</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('downloadDataModal')}>
										Export
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Linked accounts & wallets</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('linkedAccountsModal')}>
										Manage
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Request account reactivation</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('reactivateModal')}>
										Request
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Schedule account closure</span>
									<button className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`} onClick={() => openModal('closeAccountModal')}>
										Schedule
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- AUDIT LOG ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-list-check" style={{ color: 'var(--info)' }}></i>
								Recent Security Events
							</h3>
							<p className={styles.sectionSubtitle}>
								Latest authentication and compliance events on your account.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('securityAuditModal')}
						>
							<i className="bi bi-eye"></i> Full Audit Log
						</button>
					</div>
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
										<td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
										<td>{row.event}</td>
										<td>{row.ip}</td>
										<td>{row.device}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- ATTENTION / SUGGESTIONS / QUICK ACTIONS ---------- */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={styles.card}>
							<div className={styles.cardHeader}>
								<h3 className={styles.sectionTitle}>
									<i className="bi bi-exclamation-triangle" style={{ color: 'var(--warning)' }}></i>
									Attention Required
								</h3>
								<button
									className={`${styles.button} ${styles.buttonSmall}`}
									onClick={() => openModal('attentionModal')}
								>
									View all
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Password expires in 12 days</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('changePasswordModal')}>
									Update
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Secondary phone not verified</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('editProfileModal')}>
									Verify
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>New login from Windows PC</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('sessionModal')}>
									Review
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Proof of address expiring</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('kycModal')}>
									Renew
								</button>
							</div>
						</div>
					</div>

					<div className="col-lg-4">
						<div className={styles.card}>
							<div className={styles.cardHeader}>
								<h3 className={styles.sectionTitle}>
									<i className="bi bi-lightbulb" style={{ color: 'var(--purple)' }}></i>
									Smart Suggestions
								</h3>
								<span className={`${styles.badge} ${styles.badgePurple}`}>
									<i className="bi bi-stars"></i> AI
								</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Enable biometric login on mobile</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('enable2FAModal')}>
									Enable
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Upload updated proof of address</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('kycModal')}>
									Upload
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Review data sharing preferences</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('privacyModal')}>
									Review
								</button>
							</div>
						</div>
					</div>

					<div className="col-lg-4">
						<div className={styles.card}>
							<div className={styles.cardHeader}>
								<div>
									<h3 className={styles.sectionTitle}>
										<i className="bi bi-bolt" style={{ color: 'var(--acc)' }}></i>
										Quick Actions
									</h3>
									<p className={styles.sectionSubtitle}>Frequent management tasks</p>
								</div>
							</div>
							<div className={styles.quickGrid}>
								<button className={styles.quickButton} onClick={() => openModal('enable2FAModal')}>
									<i className="bi bi-shield-check" style={{ color: 'var(--success)' }}></i> 2FA
								</button>
								<button className={styles.quickButton} onClick={() => openModal('changePasswordModal')}>
									<i className="bi bi-key" style={{ color: 'var(--warning)' }}></i> Password
								</button>
								<button className={styles.quickButton} onClick={() => openModal('sessionModal')}>
									<i className="bi bi-laptop" style={{ color: 'var(--info)' }}></i> Sessions
								</button>
								<button className={styles.quickButton} onClick={() => openModal('securityQuestionsModal')}>
									<i className="bi bi-question-circle" style={{ color: 'var(--purple)' }}></i> Questions
								</button>
								<button className={styles.quickButton} onClick={() => openModal('apiKeyModal')}>
									<i className="bi bi-code-slash" style={{ color: 'var(--pri)' }}></i> API Keys
								</button>
								<button className={styles.quickButton} onClick={() => openModal('preferencesModal')}>
									<i className="bi bi-translate" style={{ color: 'var(--acc)' }}></i> Preferences
								</button>
								<button className={styles.quickButton} onClick={() => openModal('linkedAccountsModal')}>
									<i className="bi bi-link-45deg" style={{ color: 'var(--success)' }}></i> Linked
								</button>
								<button className={styles.quickButton} onClick={() => openModal('downloadDataModal')}>
									<i className="bi bi-download" style={{ color: 'var(--pri)' }}></i> Export
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ==================== MODALS ==================== */}
			<AccountSettingsModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
			/>
		</div>
	);
}
