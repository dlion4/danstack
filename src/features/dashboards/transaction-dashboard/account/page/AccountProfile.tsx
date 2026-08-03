'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AccountProfileModals } from '../modals/AccountProfileModals';
import styles from '../styles/accountProfile.module.css';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const profile = {
	fullName: 'Amina Grace Kamau',
	preferredName: 'Amina K.',
	initials: 'AK',
	dob: '14 Mar 1992',
	gender: 'Female',
	nationality: 'Kenyan',
	idNumber: '32****891',
	idType: 'National ID',
	memberSince: 'Jan 2023',
	joined: '12 January 2023',
	primaryEmail: 'amina.kamau@personal.co.ke',
	workEmail: 'amina@company.co.ke',
	primaryPhone: '+254 712 345 890',
	secondaryPhone: null,
	address: 'Apt 3A, Lavington Green, Nairobi',
	postal: 'P.O. Box 4521-00100, Nairobi',
	language: 'English',
	timeZone: 'Africa/Nairobi (EAT)',
	tier: 'Premium',
	profileCompletion: 98,
	healthScore: 92,
};

const accounts = [
	{
		id: 1,
		name: 'PayMo KES Wallet',
		number: '•••• 8842',
		balance: 'KES 1,284,300',
		currency: 'KES',
		letter: 'P',
		gradient: 'linear-gradient(135deg,#10b981,#059669)',
		status: 'Active',
		verified: true,
		dailyUsed: 64,
	},
	{
		id: 2,
		name: 'PayMo USD Account',
		number: '•••• 5510',
		balance: 'USD 2,410.80',
		currency: 'USD',
		letter: '$',
		gradient: 'linear-gradient(135deg,#1e293b,#334155)',
		status: 'Active',
		verified: true,
		dailyUsed: 12,
	},
	{
		id: 3,
		name: 'PayMo Business Account',
		number: '•••• 2207',
		balance: 'KES 6,150,000',
		currency: 'KES',
		letter: 'B',
		gradient: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
		status: 'Active',
		verified: true,
		dailyUsed: 38,
	},
	{
		id: 4,
		name: 'PayMo Savings Goal',
		number: '•••• 7793',
		balance: 'KES 480,000',
		currency: 'KES',
		letter: 'S',
		gradient: 'linear-gradient(135deg,#b45309,#f59e0b)',
		status: 'Frozen',
		verified: false,
		dailyUsed: 0,
	},
];

const cards = [
	{
		id: 1,
		number: '•••• •••• •••• 4412',
		holder: 'AMINA KAMAU',
		expiry: '08/27',
		variant: 'cardGradient1',
		type: 'Visa Virtual',
		status: 'Active',
	},
	{
		id: 2,
		number: '•••• •••• •••• 8820',
		holder: 'AMINA KAMAU',
		expiry: '05/28',
		variant: 'cardGradient2',
		type: 'Mastercard Physical',
		status: 'Frozen',
	},
	{
		id: 3,
		number: '•••• •••• •••• 3305',
		holder: 'AMINA KAMAU',
		expiry: '11/26',
		variant: 'cardGradient3',
		type: 'Visa Business',
		status: 'Active',
	},
	{
		id: 4,
		number: '•••• •••• •••• 9908',
		holder: 'AMINA KAMAU',
		expiry: '03/27',
		variant: 'cardGradient4',
		type: 'Prepaid Travel',
		status: 'Active',
	},
];

const activity = [
	{
		icon: 'bi bi-arrow-down-left',
		iconBg: 'var(--success-bg)',
		iconColor: 'var(--success)',
		title: 'Received KES 125,000',
		desc: 'From PayMo KES Wallet • PesaLink',
		time: 'Today, 14:22',
		amount: '+KES 125,000',
	},
	{
		icon: 'bi bi-credit-card',
		iconBg: 'var(--info-bg)',
		iconColor: 'var(--info)',
		title: 'Virtual card purchase',
		desc: 'Netflix subscription • Card •••• 4412',
		time: 'Today, 11:05',
		amount: '-KES 1,200',
	},
	{
		icon: 'bi bi-shield-check',
		iconBg: 'var(--purple-bg)',
		iconColor: 'var(--purple)',
		title: '2FA backup codes regenerated',
		desc: 'Security event • 2FA authenticator',
		time: 'Yesterday, 18:40',
		amount: '',
	},
	{
		icon: 'bi bi-arrow-up-right',
		iconBg: 'var(--warning-bg)',
		iconColor: 'var(--warning)',
		title: 'Sent KES 25,000',
		desc: 'To Equity Bank •••• 4521',
		time: '25 Jun, 09:12',
		amount: '-KES 25,000',
	},
	{
		icon: 'bi bi-phone',
		iconBg: 'var(--danger-bg)',
		iconColor: 'var(--danger)',
		title: 'New device login',
		desc: 'Windows PC • Chrome • Nairobi',
		time: '26 Jun, 07:58',
		amount: '',
	},
];

const fetchProfileData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { profile, accounts, cards, activity };
};

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function StatCard({
	label,
	value,
	badge,
	badgeVariant = 'success',
	children,
	accent,
}: {
	label: string;
	value: React.ReactNode;
	badge?: string;
	badgeVariant?: 'success' | 'warning' | 'info' | 'purple' | 'danger';
	children?: React.ReactNode;
	accent?: boolean;
}) {
	return (
		<div className={`${styles.card} ${styles.statCard} ${accent ? styles.cardAccent : ''}`}>
			<p
				className={styles.statLabel}
				style={accent ? { color: 'rgba(255,255,255,0.78)' } : {}}
			>
				{label}
			</p>
			<div className={styles.statValue} style={accent ? { color: '#fff' } : {}}>
				{value}
			</div>
			{badge && (
				<span
					className={styles.badge}
					style={
						accent
							? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
							: {}
					}
				>
					<i className="bi bi-check-circle" /> {badge}
				</span>
			)}
			<div
				className="mt-2"
				style={{
					fontSize: 12,
					color: accent ? 'rgba(255,255,255,0.78)' : 'var(--ink-700)',
					lineHeight: 1.6,
				}}
			>
				{children}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AccountProfile() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});

	const openModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	const { data } = useQuery({
		queryKey: ['accountProfileData'],
		queryFn: fetchProfileData,
		initialData: { profile, accounts, cards, activity },
	});

	const { profile: p, accounts: accs, cards: cardsList, activity: act } = data;

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Account</a> /{' '}
						<strong>Profile & Digital Bank</strong>
					</div>
					{/* // <h1 className={styles.pageTitle}>Account Profile & Digital Bank</h1>
					<p className={styles.pageDescription}>
						Your identity, digital bank accounts, cards, verification status and account
						activity — all managed from one modern hub.
					</p> */}
				</div>
				<div className={styles.pageActions}>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('profileModal')}
					>
						<i className="bi bi-eye"></i> View Profile
					</button>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('editProfileModal')}
					>
						<i className="bi bi-pencil-square"></i> Edit Profile
					</button>
					<button
						className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
						onClick={() => openModal('downloadDataModal')}
					>
						<i className="bi bi-download"></i> Export Data
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
								Account health is excellent <span style={{ color: '#86efac' }}>●</span>
							</p>
							<div className={styles.statValue} style={{ color: '#fff', margin: '8px 0' }}>
								{p.healthScore}/100
							</div>
							<p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>
								Profile {p.profileCompletion}% complete • 2FA enabled • KYC verified • No
								incidents in 18 months.
							</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button
									className={`${styles.button} ${styles.buttonSmall} ${styles.buttonGhost}`}
									onClick={() => openModal('attentionModal')}
								>
									Audit
								</button>
								<button
									className={`${styles.button} ${styles.buttonSmall} ${styles.buttonGhost}`}
									onClick={() => openModal('kycModal')}
								>
									KYC
								</button>
								<button
									className={`${styles.button} ${styles.buttonSmall} ${styles.buttonGhost}`}
									onClick={() => openModal('editProfileModal')}
								>
									Update
								</button>
							</div>
						</div>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<StatCard
							label="PROFILE COMPLETENESS"
							value={`${p.profileCompletion}%`}
							badge="Verified"
						>
							Missing: Secondary phone
							<br />
							Next review: 12 Sep 2025
						</StatCard>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<StatCard
							label="ACTIVE SESSIONS"
							value={4}
							badge="1 new device"
							badgeVariant="warning"
						>
							iPhone 15 • MacBook Pro
							<br />
							Windows PC • iPad
						</StatCard>
					</div>
					<div className="col-lg-3 col-md-4">
						<div className={`${styles.card} ${styles.statCard}`} style={{ borderLeft: '3px solid var(--purple)' }}>
							<p className={styles.statLabel} style={{ color: 'var(--purple)' }}>
								DOCUMENTS ON FILE
							</p>
							<div className={styles.statValue}>7</div>
							<span className={`${styles.badge} ${styles.badgePurple}`}>
								<i className="bi bi-file-earmark-check"></i> All valid
							</span>
							<div className="mt-2" style={{ fontSize: 12, color: 'var(--ink-700)', lineHeight: 1.6 }}>
								National ID • Passport
								<br />
								Proof of Address • Selfie
							</div>
						</div>
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
							{[
								{
									icon: 'bi bi-clock',
									bg: 'var(--warning-bg)',
									color: 'var(--warning)',
									title: 'Password expires in 12 days',
									desc: 'Last changed 89 days ago',
									action: 'Update',
									modal: 'changePasswordModal',
								},
								{
									icon: 'bi bi-phone',
									bg: 'var(--danger-bg)',
									color: 'var(--danger)',
									title: 'Secondary phone not verified',
									desc: 'Profile completeness at 98%',
									action: 'Verify',
									modal: 'editProfileModal',
								},
								{
									icon: 'bi bi-laptop',
									bg: 'var(--info-bg)',
									color: 'var(--info)',
									title: 'New login from Windows PC',
									desc: 'Nairobi • 26 Jun 2025',
									action: 'Review',
									modal: 'sessionModal',
								},
							].map((item) => (
								<div className={styles.summaryRow} key={item.title}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
										<div
											style={{
												width: 36,
												height: 36,
												borderRadius: '50%',
												background: item.bg,
												color: item.color,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: 14,
												flexShrink: 0,
											}}
										>
											<i className={item.icon}></i>
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
											<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.desc}</div>
										</div>
									</div>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal(item.modal)}
									>
										{item.action}
									</button>
								</div>
							))}
						</div>
					</div>

					<div className="col-lg-4">
						<div className={styles.card}>
							<div className={styles.cardHeader}>
								<h3 className={styles.sectionTitle}>
									<i className="bi bi-stars" style={{ color: 'var(--purple)' }}></i>
									Smart Suggestions
								</h3>
								<span className={`${styles.badge} ${styles.badgePurple}`}>
									<i className="bi bi-stars"></i> AI
								</span>
							</div>
							{[
								{
									icon: 'bi bi-shield-check',
									bg: 'var(--success-bg)',
									color: 'var(--success)',
									title: 'Enable biometric login on mobile',
									desc: 'Faster & more secure than PIN',
									action: 'Enable',
									modal: 'enable2FAModal',
								},
								{
									icon: 'bi bi-file-earmark',
									bg: 'var(--purple-bg)',
									color: 'var(--purple)',
									title: 'Upload updated proof of address',
									desc: 'Current document expires in 45 days',
									action: 'Upload',
									modal: 'kycModal',
								},
								{
									icon: 'bi bi-globe',
									bg: 'var(--warning-bg)',
									color: 'var(--warning)',
									title: 'Review data sharing preferences',
									desc: 'Last updated 11 months ago',
									action: 'Review',
									modal: 'privacyModal',
								},
							].map((item) => (
								<div className={styles.summaryRow} key={item.title}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
										<div
											style={{
												width: 36,
												height: 36,
												borderRadius: '50%',
												background: item.bg,
												color: item.color,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: 14,
												flexShrink: 0,
											}}
										>
											<i className={item.icon}></i>
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
											<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.desc}</div>
										</div>
									</div>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal(item.modal)}
									>
										{item.action}
									</button>
								</div>
							))}
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
									<p className={styles.sectionSubtitle}>Frequent account tasks</p>
								</div>
							</div>
							<div className={styles.quickGrid}>
								<button className={styles.quickButton} onClick={() => openModal('editProfileModal')}>
									<i className="bi bi-person" style={{ color: 'var(--pri)' }}></i> Edit Profile
								</button>
								<button className={styles.quickButton} onClick={() => openModal('changePasswordModal')}>
									<i className="bi bi-key" style={{ color: 'var(--warning)' }}></i> Password
								</button>
								<button className={styles.quickButton} onClick={() => openModal('bankAccountModal')}>
									<i className="bi bi-bank" style={{ color: 'var(--success)' }}></i> New Account
								</button>
								<button className={styles.quickButton} onClick={() => openModal('virtualCardModal')}>
									<i className="bi bi-credit-card" style={{ color: 'var(--info)' }}></i> New Card
								</button>
								<button className={styles.quickButton} onClick={() => openModal('linkedAccountsModal')}>
									<i className="bi bi-link-45deg" style={{ color: 'var(--purple)' }}></i> Linked
								</button>
								<button className={styles.quickButton} onClick={() => openModal('kycModal')}>
									<i className="bi bi-file-earmark-check" style={{ color: 'var(--acc)' }}></i> KYC
								</button>
								<button className={styles.quickButton} onClick={() => openModal('sessionModal')}>
									<i className="bi bi-laptop" style={{ color: 'var(--danger)' }}></i> Sessions
								</button>
								<button className={styles.quickButton} onClick={() => openModal('downloadDataModal')}>
									<i className="bi bi-download" style={{ color: 'var(--pri)' }}></i> Export
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 18.1 PROFILE OVERVIEW ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-person-circle" style={{ color: 'var(--pri)' }}></i>
								Profile Overview
							</h3>
							<p className={styles.sectionSubtitle}>
								Your core identity, verification status, membership tier and quick snapshot.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('editProfileModal')}
							>
								<i className="bi bi-pencil"></i> Edit
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('profileModal')}
							>
								<i className="bi bi-eye"></i> Full View
							</button>
						</div>
					</div>

					<div className="row g-3">
						<div className="col-lg-5">
							<div className={styles.profileHero}>
								<div className={styles.profileAvatar}>{p.initials}</div>
								<div className={styles.profileInfo}>
									<div style={{ fontWeight: 600, color: 'var(--ink-500)', fontSize: 12 }}>
										Account Owner
									</div>
									<p className={styles.profileName}>{p.fullName}</p>
									<div style={{ color: 'var(--ink-500)', fontSize: 13 }}>{p.primaryEmail}</div>
									<div className="mt-1" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
										<span className={`${styles.badge} ${styles.badgeSuccess}`}>
											<i className="bi bi-gem"></i> Premium Member
										</span>
										<span className={`${styles.badge} ${styles.badgePurple}`}>
											Since {p.memberSince}
										</span>
									</div>
								</div>
							</div>
							<div className={styles.profileStatsRow}>
								<div className={styles.profileStat}>
									<div className={styles.profileStatLabel}>Nationality</div>
									<div className={styles.profileStatValue}>{p.nationality}</div>
								</div>
								<div className={styles.profileStat}>
									<div className={styles.profileStatLabel}>ID Number</div>
									<div className={styles.profileStatValue}>{p.idNumber}</div>
								</div>
								<div className={styles.profileStat}>
									<div className={styles.profileStatLabel}>Date of Birth</div>
									<div className={styles.profileStatValue}>{p.dob}</div>
								</div>
								<div className={styles.profileStat}>
									<div className={styles.profileStatLabel}>Gender</div>
									<div className={styles.profileStatValue}>{p.gender}</div>
								</div>
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
									Verification Status
								</h4>
								{[
									{ name: 'Email', detail: p.primaryEmail, status: 'Verified' },
									{ name: 'Phone', detail: p.primaryPhone, status: 'Verified' },
									{ name: 'National ID', detail: 'Uploaded & verified', status: 'Verified' },
									{ name: 'Passport', detail: 'Valid until 2031', status: 'Verified' },
									{ name: 'Proof of Address', detail: 'Expires in 45 days', status: 'Renew' },
								].map((item) => (
									<div className={styles.summaryRow} key={item.name}>
										<div>
											<strong style={{ fontSize: 13 }}>{item.name}</strong>
											<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.detail}</div>
										</div>
										<span
											className={`${styles.badge} ${item.status === 'Renew' ? styles.badgeWarning : styles.badgeSuccess}`}
										>
											{item.status}
										</span>
									</div>
								))}
							</div>
						</div>

						<div className="col-lg-3">
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
									Membership & Limits
								</h4>
								<div
									className="p-3 rounded mb-2"
									style={{ background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)' }}
								>
									<div style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>TIER</div>
									<div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>
										{p.tier}
									</div>
									<div style={{ fontSize: 12, color: '#065F46' }}>
										Monthly limit: KES 2,000,000
									</div>
								</div>
								<div
									className="p-3 rounded"
									style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
								>
									<div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 700 }}>
										CURRENT USAGE
									</div>
									<div style={{ fontSize: 18, fontWeight: 700 }}>
										KES 1,284,300{' '}
										<span style={{ fontSize: 12, color: 'var(--ink-500)' }}>/ 2M</span>
									</div>
									<div className={styles.progressTrack} style={{ marginTop: 8 }}>
										<div className={styles.progressBar} style={{ width: '64%' }}></div>
									</div>
								</div>
								<button
									className={`${styles.button} ${styles.buttonSmall} w-100 mt-2`}
									onClick={() => openModal('bankAccountModal')}
								>
									<i className="bi bi-plus-lg"></i> Upgrade Limits
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- DIGITAL BANK ACCOUNTS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-bank" style={{ color: 'var(--success)' }}></i>
								Digital Bank Accounts
							</h3>
							<p className={styles.sectionSubtitle}>
								Your PayMo virtual accounts, balances, limits and linked rails.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('linkedAccountsModal')}
							>
								<i className="bi bi-link-45deg"></i> Linked Accounts
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('bankAccountModal')}
							>
								<i className="bi bi-plus-lg"></i> Open Account
							</button>
						</div>
					</div>
					<div className={styles.bankAccountGrid}>
						{accs.map((acc) => (
							<div className={styles.bankAccount} key={acc.id}>
								<div className={styles.bankAccountTop}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
										<div className={styles.bankLogo} style={{ background: acc.gradient }}>
											{acc.letter}
										</div>
										<div>
											<div className={styles.bankName}>{acc.name}</div>
											<div className={styles.bankMeta}>
												Account {acc.number} • {acc.currency}
											</div>
										</div>
									</div>
									<span
										className={`${styles.badge} ${acc.status === 'Frozen' ? styles.badgeWarning : styles.badgeSuccess}`}
									>
										{acc.status}
									</span>
								</div>
								<div>
									<div className={styles.bankBalanceLabel}>Available Balance</div>
									<div className={styles.bankBalance}>{acc.balance}</div>
								</div>
								<div className={styles.limitUsage}>
									<div className="d-flex justify-content-between" style={{ fontSize: 12, marginBottom: 4 }}>
										<span style={{ color: 'var(--ink-500)' }}>Daily limit usage</span>
										<span>{acc.dailyUsed}%</span>
									</div>
									<div className={styles.progressTrack}>
										<div
											className={styles.progressBar}
											style={{
												width: `${acc.dailyUsed}%`,
												background: acc.dailyUsed > 80 ? 'var(--warning)' : 'var(--pri)',
											}}
										></div>
									</div>
								</div>
								<div className={styles.bankFooter}>
									<div className={styles.bankStatus}>
										<i
											className={`bi ${acc.verified ? 'bi-shield-check' : 'bi-shield-exclamation'}`}
											style={{ color: acc.verified ? 'var(--success)' : 'var(--warning)' }}
										></i>
										{acc.verified ? 'Fully verified' : 'Verification pending'}
									</div>
									<div className="d-flex" style={{ gap: 6 }}>
										<button className={`${styles.button} ${styles.buttonSmall}`}>Statements</button>
										<button className={`${styles.button} ${styles.buttonSmall}`}>Details</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ---------- CARDS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-credit-card-2-front" style={{ color: 'var(--info)' }}></i>
								Cards & Wallets
							</h3>
							<p className={styles.sectionSubtitle}>
								Virtual and physical cards linked to your PayMo accounts.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
							onClick={() => openModal('virtualCardModal')}
						>
							<i className="bi bi-plus-lg"></i> Create Virtual Card
						</button>
					</div>
					<div className={styles.cardsGrid}>
						{cardsList.map((card) => (
							<button
								key={card.id}
								className={`${styles.paymentCard} ${styles[card.variant]}`}
								onClick={() => openModal('cardDetailsModal')}
							>
								<div className={styles.cardTop}>
									<span style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
										PAYMO
									</span>
									<div className={styles.cardChip}></div>
								</div>
								<div className={styles.cardNumber}>{card.number}</div>
								<div className={styles.cardBottom}>
									<div>
										<div className={styles.cardLabel}>Card Holder</div>
										<div className={styles.cardValue}>{card.holder}</div>
									</div>
									<div>
										<div className={styles.cardLabel}>Expires</div>
										<div className={styles.cardValue}>{card.expiry}</div>
									</div>
									<div
										style={{
											fontSize: 10,
											padding: '2px 8px',
											borderRadius: 999,
											background: card.status === 'Active' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)',
											color: '#fff',
										}}
									>
										{card.status}
									</div>
								</div>
								<div
									style={{
										position: 'absolute',
										top: 12,
										right: 12,
										opacity: 0.9,
										fontSize: 10,
										color: 'rgba(255,255,255,0.7)',
									}}
								>
									{card.type}
								</div>
							</button>
						))}
					</div>
				</div>

				{/* ---------- 18.2 PERSONAL & CONTACT DETAILS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-person-lines-fill" style={{ color: 'var(--info)' }}></i>
								Personal & Contact Details
							</h3>
							<p className={styles.sectionSubtitle}>
								Update names, addresses, phone numbers, emails and emergency contacts.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('editProfileModal')}
						>
							<i className="bi bi-pencil"></i> Edit All
						</button>
					</div>
					<div className={styles.detailsGrid}>
						<div className={styles.detailBlock}>
							<div className={styles.detailBlockTitle}>
								<i className="bi bi-person" style={{ color: 'var(--info)' }}></i> Personal
								Information
							</div>
							{[
								{ name: 'Full Legal Name', value: 'Amina Grace Kamau' },
								{ name: 'Preferred Name', value: 'Amina K.' },
								{ name: 'National ID', value: '32890127', view: 'kycModal' },
								{ name: 'Passport Number', value: 'AK392184', view: 'kycModal' },
								{ name: 'Date of Birth', value: '14 March 1992' },
								{ name: 'Gender', value: 'Female' },
							].map((item) => (
								<div className={styles.summaryRow} key={item.name}>
									<div>
										<strong style={{ fontSize: 13 }}>{item.name}</strong>
										<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.value}</div>
									</div>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => (item.view ? openModal(item.view) : openModal('editProfileModal'))}
									>
										{item.view ? 'View' : 'Edit'}
									</button>
								</div>
							))}
						</div>

						<div className={styles.detailBlock}>
							<div className={styles.detailBlockTitle}>
								<i className="bi bi-telephone" style={{ color: 'var(--success)' }}></i> Contact
								Information
							</div>
							{[
								{ name: 'Primary Phone', value: '+254 712 345 890' },
								{ name: 'Secondary Phone', value: 'Not added', add: true },
								{ name: 'Primary Email', value: 'amina.kamau@personal.co.ke' },
								{ name: 'Work Email', value: 'amina@company.co.ke' },
								{ name: 'Residential Address', value: 'Apt 3A, Lavington Green, Nairobi' },
								{ name: 'Postal Address', value: 'P.O. Box 4521-00100, Nairobi' },
							].map((item) => (
								<div className={styles.summaryRow} key={item.name}>
									<div>
										<strong style={{ fontSize: 13 }}>{item.name}</strong>
										<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.value}</div>
									</div>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal('editProfileModal')}
									>
										{item.add ? 'Add' : 'Edit'}
									</button>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ---------- RECENT ACTIVITY ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-clock-history" style={{ color: 'var(--purple)' }}></i>
								Recent Account Activity
							</h3>
							<p className={styles.sectionSubtitle}>
								A chronological view of payments, logins and security events.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('activityDetailModal')}
						>
							<i className="bi bi-filter"></i> Filter
						</button>
					</div>
					<div className={styles.activityTimeline}>
						{act.map((item) => (
							<div
								className={styles.activityItem}
								key={item.title}
								style={{ cursor: 'pointer' }}
								onClick={() => openModal('activityDetailModal')}
							>
								<div
									className={styles.activityIcon}
									style={{ background: item.iconBg, color: item.iconColor }}
								>
									<i className={item.icon}></i>
								</div>
								<div className={styles.activityBody}>
									<div className={styles.activityTitle}>{item.title}</div>
									<div className={styles.activityDesc}>{item.desc}</div>
								</div>
								<div className={styles.activityTime}>
									{item.time}
									{item.amount && (
										<div
											style={{
												fontWeight: 700,
												color: item.amount.startsWith('+') ? 'var(--success)' : 'var(--ink-900)',
												textAlign: 'right',
											}}
										>
											{item.amount}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ==================== MODALS ==================== */}
			<AccountProfileModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
			/>
		</div>
	);
}
