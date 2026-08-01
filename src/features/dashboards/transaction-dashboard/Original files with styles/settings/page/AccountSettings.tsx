'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AccountSettingsModals } from '../modals/AccountSettingsModals';
import styles from '../style/accountSettings.module.css';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const sessions = [
	{ device: 'iPhone 15 Pro', location: 'Nairobi, KE', lastActive: 'Just now', ip: '102.68.XX.XX', current: true },
	{ device: 'MacBook Pro', location: 'Nairobi, KE', lastActive: '14:22', ip: '102.68.XX.XX', current: false },
	{ device: 'Windows PC', location: 'Nairobi, KE', lastActive: '26 Jun', ip: '102.68.XX.XX', current: false },
	{ device: 'iPad Air', location: 'Mombasa, KE', lastActive: '20 Jun', ip: '105.XX.XX.XX', current: false },
];

const auditLog = [
	{ date: '27 Jun 2025 14:22', event: 'Login from new device (iPhone 15 Pro)', ip: '102.68.XX.XX', device: 'iPhone 15 Pro' },
	{ date: '15 Jun 2025 09:10', event: 'Password changed', ip: '102.68.XX.XX', device: 'MacBook Pro' },
	{ date: '10 Jun 2025 11:45', event: '2FA enabled via Authenticator App', ip: '102.68.XX.XX', device: 'MacBook Pro' },
	{ date: '03 Jun 2025 16:20', event: 'KYC document uploaded (Utility Bill)', ip: '102.68.XX.XX', device: 'MacBook Pro' },
	{ date: '01 Jun 2025 08:00', event: 'Session terminated remotely', ip: '105.XX.XX.XX', device: 'iPad Air' },
];

const fetchSettingsData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { sessions, auditLog };
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AccountSettings() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});

	const openModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	useQuery({
		queryKey: ['accountSettingsData'],
		queryFn: fetchSettingsData,
		initialData: { sessions, auditLog },
	});

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Account</a> / <strong>Settings &amp; Administration</strong>
					</div>
					<h1 className={styles.pageTitle}>Account Settings</h1>
					<p className={styles.pageDescription}>
						Security posture, KYC documents, active sessions, notification preferences and account administration.
					</p>
				</div>
				<div className="d-flex flex-wrap" style={{ gap: 8 }}>
					<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('editProfileModal')}>
						<i className="bi bi-person-pen"></i> Edit Profile
					</button>
					<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('changePasswordModal')}>
						<i className="bi bi-key"></i> Change Password
					</button>
					<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('enable2FAModal')}>
						<i className="bi bi-shield-lock"></i> 2FA
					</button>
					<button className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`} onClick={() => openModal('closeAccountModal')}>
						<i className="bi bi-x-circle"></i> Close Account
					</button>
				</div>
			</div>

			{/* ==================== CONTENT GRID ==================== */}
			<div className={styles.contentGrid}>

				{/* ---------- SECTION 18.3: Security & Authentication ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-shield-check" style={{ color: 'var(--pri)' }}></i>
						Security &amp; Authentication
					</h2>
					<p className={styles.sectionSubtitle}>Manage two-factor authentication, password policy and security questions.</p>
					<hr className={styles.divider} />
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Two-Factor Authentication</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Enabled</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('enable2FAModal')}>Manage</button>
						</div>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Password</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeWarning}`}><i className="bi bi-clock"></i> Expires 12 days</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('changePasswordModal')}>Change</button>
						</div>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Security Questions</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Set</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('securityQuestionsModal')}>Manage</button>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 18.4: Notification Preferences ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-bell" style={{ color: 'var(--info)' }}></i>
						Notification Preferences
					</h2>
					<p className={styles.sectionSubtitle}>Control which alerts and notifications you receive across channels.</p>
					<hr className={styles.divider} />
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Security Alerts</span>
						<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> On (4 channels)</span>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Transaction Alerts</span>
						<span className={`${styles.badge} ${styles.badgeInfo}`}><i className="bi bi-bell"></i> Push only</span>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Marketing</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeOutline}`}>Off</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('notifSettingsModal')}>Advanced Settings</button>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 18.5: Linked Devices & Sessions ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-laptop" style={{ color: 'var(--info)' }}></i>
						Linked Devices &amp; Sessions
					</h2>
					<p className={styles.sectionSubtitle}>Review and manage all devices currently authorised to access your account.</p>
					<hr className={styles.divider} />
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
						<span className={styles.statValue}>{sessions.length}</span>
						<span style={{ fontSize: 13, color: 'var(--ink-700)' }}>sessions</span>
						<span className={`${styles.badge} ${styles.badgeWarning}`}><i className="bi bi-exclamation-triangle"></i> 1 new device</span>
					</div>
					<div className={styles.quickGrid}>
						<button className={styles.quickButton} onClick={() => openModal('changePasswordModal')}>
							<i className="bi bi-key" style={{ color: 'var(--pri)' }}></i>
							<br />
							Password
						</button>
						<button className={styles.quickButton} onClick={() => openModal('enable2FAModal')}>
							<i className="bi bi-shield-check" style={{ color: 'var(--pri)' }}></i>
							<br />
							2FA
						</button>
						<button className={styles.quickButton} onClick={() => openModal('sessionModal')}>
							<i className="bi bi-laptop" style={{ color: 'var(--info)' }}></i>
							<br />
							Sessions
						</button>
						<button className={styles.quickButton} onClick={() => openModal('securityQuestionsModal')}>
							<i className="bi bi-question-circle" style={{ color: 'var(--acc)' }}></i>
							<br />
							Security Questions
						</button>
					</div>
				</div>

				{/* ---------- SECTION 18.6: KYC & Document Vault ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-file-earmark-check" style={{ color: 'var(--success)' }}></i>
						KYC &amp; Document Vault
					</h2>
					<p className={styles.sectionSubtitle}>Upload and verify identity documents required for regulatory compliance.</p>
					<hr className={styles.divider} />
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>National ID</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Verified</span>
							<span style={{ fontSize: 12, color: 'var(--ink-500)' }}>12 Jan 2023</span>
						</div>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Passport</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Verified</span>
							<span style={{ fontSize: 12, color: 'var(--ink-500)' }}>03 Mar 2024</span>
						</div>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Utility Bill</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeWarning}`}><i className="bi bi-clock"></i> Expiring</span>
							<span style={{ fontSize: 12, color: 'var(--ink-500)' }}>15 May 2025</span>
						</div>
					</div>
					<div style={{ marginTop: 12 }}>
						<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('kycModal')}>
							<i className="bi bi-folder2-open"></i> Manage Documents
						</button>
					</div>
				</div>

				{/* ---------- SECTION 18.7: Privacy & Data Controls ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-lock" style={{ color: 'var(--danger)' }}></i>
						Privacy &amp; Data Controls
					</h2>
					<p className={styles.sectionSubtitle}>Control how your data is shared, stored and displayed across the platform.</p>
					<hr className={styles.divider} />
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Data Sharing</span>
						<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Off</span>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Marketing Communications</span>
						<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Off</span>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Public Profile</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeDanger}`}><i className="bi bi-eye"></i> Visible</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('privacyModal')}>Review Settings</button>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 18.8: Account Administration ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-gear" style={{ color: 'var(--ink-500)' }}></i>
						Account Administration
					</h2>
					<p className={styles.sectionSubtitle}>Manage account lifecycle, linked accounts and data export.</p>
					<hr className={styles.divider} />
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Account Status</span>
						<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Active</span>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Linked Accounts</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span style={{ fontSize: 13, color: 'var(--ink-700)' }}>3 linked</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('linkedAccountsModal')}>Manage</button>
						</div>
					</div>
					<div className={styles.summaryRow}>
						<span style={{ fontSize: 14 }}>Data Export</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<span className={`${styles.badge} ${styles.badgeInfo}`}><i className="bi bi-download"></i> Available</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('downloadDataModal')}>Export</button>
						</div>
					</div>
				</div>

				{/* ---------- Attention / Suggestions / Quick Actions ---------- */}
				<div className={styles.attentionGrid}>

					{/* Card 1 — Attention Required */}
					<div className={`${styles.card} ${styles.attentionCard}`}>
						<h3 className={styles.sectionTitle}>
							<i className="bi bi-exclamation-triangle" style={{ color: 'var(--warning)' }}></i>
							Attention Required
						</h3>
						<p className={styles.sectionSubtitle}>Action needed to maintain your account security and compliance.</p>
						<hr className={styles.divider} />
						<div className={styles.summaryRow}>
							<span style={{ fontSize: 13 }}>Password expires in 12 days</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('changePasswordModal')}>Update</button>
						</div>
						<div className={styles.summaryRow}>
							<span style={{ fontSize: 13 }}>Secondary phone not verified</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('editProfileModal')}>Verify</button>
						</div>
					</div>

					{/* Card 2 — Smart Suggestions */}
					<div className={`${styles.card} ${styles.suggestionCard}`}>
						<h3 className={styles.sectionTitle}>
							<i className="bi bi-lightbulb" style={{ color: 'var(--purple)' }}></i>
							Smart Suggestions
						</h3>
						<p className={styles.sectionSubtitle}>Personalised recommendations to improve your experience.</p>
						<hr className={styles.divider} />
						<div className={styles.summaryRow}>
							<span style={{ fontSize: 13 }}>Enable biometric login for faster access</span>
							<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('enable2FAModal')}>Enable</button>
						</div>
					</div>

					{/* Card 3 — Quick Actions */}
					<div className={styles.card}>
						<h3 className={styles.sectionTitle}>
							<i className="bi bi-bolt" style={{ color: 'var(--pri)' }}></i>
							Quick Actions
						</h3>
						<p className={styles.sectionSubtitle}>Frequent account management workflows.</p>
						<hr className={styles.divider} />
						<div className={styles.quickGrid}>
							<button className={styles.quickButton} onClick={() => openModal('sessionModal')}>
								<i className="bi bi-laptop" style={{ color: 'var(--info)' }}></i>
								<br />
								Sessions
							</button>
							<button className={styles.quickButton} onClick={() => openModal('privacyModal')}>
								<i className="bi bi-lock" style={{ color: 'var(--danger)' }}></i>
								<br />
								Privacy
							</button>
							<button className={styles.quickButton} onClick={() => openModal('linkedAccountsModal')}>
								<i className="bi bi-link-45deg" style={{ color: 'var(--acc)' }}></i>
								<br />
								Linked Accounts
							</button>
							<button className={styles.quickButton} onClick={() => openModal('downloadDataModal')}>
								<i className="bi bi-download" style={{ color: 'var(--pri)' }}></i>
								<br />
								Download Data
							</button>
						</div>
					</div>

				</div>

			</div>

			{/* ==================== MODALS ==================== */}
			<AccountSettingsModals modalState={modalState} openModal={openModal} closeModal={closeModal} />
		</div>
	);
}
