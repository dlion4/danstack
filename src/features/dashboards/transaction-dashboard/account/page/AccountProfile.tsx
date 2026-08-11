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

const transactionLimits = [
	{ id: 1, account: 'PayMo KES Wallet', type: 'Primary', dailyLimit: 500000, dailyUsed: 320000, monthlyLimit: 2000000, monthlyUsed: 1284300, status: 'Active' },
	{ id: 2, account: 'Utility Account', type: 'Sub-account', dailyLimit: 200000, dailyUsed: 45000, monthlyLimit: 800000, monthlyUsed: 320000, status: 'Active' },
	{ id: 3, account: 'Services Account', type: 'Sub-account', dailyLimit: 300000, dailyUsed: 180000, monthlyLimit: 1200000, monthlyUsed: 540000, status: 'Active' },
	{ id: 4, account: 'PayMo USD Account', type: 'Multi-currency', dailyLimit: 10000, dailyUsed: 1200, monthlyLimit: 50000, monthlyUsed: 8500, status: 'Active' },
];

const businessAccounts = [
	{ id: 1, name: 'TechVentures Ltd', accountNumber: '•••• 4521', balance: 'KES 2,450,000', dailyLimit: 5000000, dailyUsed: 1200000, status: 'Active', tier: 'Business Plus' },
	{ id: 2, name: 'GreenGrocery Co', accountNumber: '•••• 8832', balance: 'KES 890,000', dailyLimit: 2000000, dailyUsed: 450000, status: 'Active', tier: 'Business Standard' },
	{ id: 3, name: 'Swift Logistics', accountNumber: '•••• 2210', balance: 'KES 1,120,000', dailyLimit: 3000000, dailyUsed: 890000, status: 'Active', tier: 'Business Plus' },
];

const externalAccounts = [
	{ id: 1, type: 'Bank', name: 'Equity Bank', accountNumber: '•••• 4521', currency: 'KES', status: 'Verified', lastUsed: 'Today, 14:22', isDefault: true },
	{ id: 2, type: 'Bank', name: 'KCB Bank', accountNumber: '•••• 7782', currency: 'KES', status: 'Verified', lastUsed: '25 Jun 2025', isDefault: false },
	{ id: 3, type: 'Mobile Money', name: 'M-Pesa', accountNumber: '0712 345 890', currency: 'KES', status: 'Verified', lastUsed: 'Yesterday, 09:10', isDefault: false },
	{ id: 4, type: 'Mobile Money', name: 'Airtel Money', accountNumber: '0733 456 789', currency: 'KES', status: 'Verified', lastUsed: '20 Jun 2025', isDefault: false },
	{ id: 5, type: 'Bank', name: 'Standard Chartered', accountNumber: '•••• 9932', currency: 'USD', status: 'Pending', lastUsed: 'Never', isDefault: false },
];

const autoPayouts = [
	{ id: 1, name: 'Daily Sweep to Equity', type: 'Daily', amount: 'KES 100,000', destination: 'Equity Bank •••• 4521', status: 'Active', nextRun: 'Today, 18:00' },
	{ id: 2, name: 'Weekly Business Transfer', type: 'Weekly', amount: 'KES 250,000', destination: 'TechVentures Ltd', status: 'Active', nextRun: 'Monday, 09:00' },
	{ id: 3, name: 'Instant Client Payouts', type: 'Instant', amount: '100% of collections', destination: 'M-Pesa 0712 345 890', status: 'Active', nextRun: 'Real-time' },
	{ id: 4, name: 'Monthly Savings', type: 'Monthly', amount: 'KES 50,000', destination: 'PayMo Savings Goal', status: 'Paused', nextRun: 'Paused' },
];

const securityLimits = [
	{ id: 1, transferType: 'Internal PayMo Transfer', threshold: 500000, requiresOTP: true, otpMethod: 'WhatsApp', status: 'Active' },
	{ id: 2, transferType: 'External Bank Transfer', threshold: 100000, requiresOTP: true, otpMethod: 'SMS + WhatsApp', status: 'Active' },
	{ id: 3, transferType: 'Mobile Money Transfer', threshold: 50000, requiresOTP: true, otpMethod: 'SMS', status: 'Active' },
	{ id: 4, transferType: 'International Transfer', threshold: 10000, requiresOTP: true, otpMethod: 'SMS + WhatsApp + Email', status: 'Active' },
	{ id: 5, transferType: 'Bill Payment', threshold: 200000, requiresOTP: false, otpMethod: '—', status: 'Disabled' },
];

const countryRestrictions = [
	{ id: 1, country: 'Kenya', code: 'KE', status: 'Allowed', verification: 'None', transferLimit: 'Unlimited' },
	{ id: 2, country: 'Uganda', code: 'UG', status: 'Allowed', verification: 'KYC Required', transferLimit: 'KES 500,000' },
	{ id: 3, country: 'Tanzania', code: 'TZ', status: 'Allowed', verification: 'KYC Required', transferLimit: 'KES 500,000' },
	{ id: 4, country: 'Rwanda', code: 'RW', status: 'Allowed', verification: 'KYC Required', transferLimit: 'KES 300,000' },
	{ id: 5, country: 'United States', code: 'US', status: 'Restricted', verification: 'Enhanced KYC + KRA', transferLimit: 'KES 1,000,000' },
	{ id: 6, country: 'United Kingdom', code: 'GB', status: 'Restricted', verification: 'Enhanced KYC + KRA', transferLimit: 'KES 1,000,000' },
	{ id: 7, country: 'United Arab Emirates', code: 'AE', status: 'Blocked', verification: 'Not permitted', transferLimit: 'KES 0' },
];

const riskMitigation = [
	{ id: 1, threshold: 1000000, currency: 'KES', requirement: 'KYC Verification', status: 'Active', appliesTo: 'All transfers' },
	{ id: 2, threshold: 1000000, currency: 'KES', requirement: 'KRA PIN Verification', status: 'Active', appliesTo: 'Business transfers' },
	{ id: 3, threshold: 5000000, currency: 'KES', requirement: 'Source of Funds Declaration', status: 'Active', appliesTo: 'International transfers' },
	{ id: 4, threshold: 10000000, currency: 'KES', requirement: 'Manual Compliance Review', status: 'Active', appliesTo: 'All transfers' },
];

const transactionNotifications = [
	{ id: 1, event: 'All Transactions', channels: ['SMS', 'Email', 'WhatsApp', 'Push'], status: 'Enabled' },
	{ id: 2, event: 'High-Value Transfers (>KES 100,000)', channels: ['SMS', 'WhatsApp', 'Email'], status: 'Enabled' },
	{ id: 3, event: 'International Transfers', channels: ['SMS', 'Email'], status: 'Enabled' },
	{ id: 4, event: 'Failed Transactions', channels: ['SMS', 'Email', 'Push'], status: 'Enabled' },
	{ id: 5, event: 'Limit Reached Warnings', channels: ['Push', 'Email'], status: 'Enabled' },
	{ id: 6, event: 'Security Alerts', channels: ['SMS', 'WhatsApp', 'Email', 'Push'], status: 'Enabled' },
];

const feeStructure = [
	{ id: 1, type: 'PayMo to PayMo', fee: 'FREE', description: 'Instant transfers between PayMo accounts' },
	{ id: 2, type: 'PayMo to M-Pesa', fee: 'KES 25', description: 'Standard mobile money withdrawal' },
	{ id: 3, type: 'PayMo to Airtel Money', fee: 'KES 25', description: 'Standard mobile money withdrawal' },
	{ id: 4, type: 'PayMo to Bank (Local)', fee: 'KES 50', description: 'Instant bank transfer (PesaLink)' },
	{ id: 5, type: 'PayMo to Bank (International)', fee: '1.5%', description: 'SWIFT transfer (min KES 500)' },
	{ id: 6, type: 'Bill Payment', fee: 'KES 10', description: 'Utility and service bill payments' },
	{ id: 7, type: 'Card Purchase', fee: '0.5%', description: 'Virtual/physical card transactions' },
];

const accountHierarchy = [
	{ id: 1, name: 'PayMo KES Wallet (Primary)', balance: 'KES 1,284,300', type: 'Primary', children: ['Utility Account', 'Services Account'] },
	{ id: 2, name: 'Utility Account', balance: 'KES 150,000', type: 'Sub-account', parent: 'PayMo KES Wallet', fundingSource: 'Auto-draw from primary' },
	{ id: 3, name: 'Services Account', balance: 'KES 85,000', type: 'Sub-account', parent: 'PayMo KES Wallet', fundingSource: 'Auto-draw from primary' },
	{ id: 4, name: 'PayMo USD Account', balance: 'USD 2,410.80', type: 'Multi-currency', children: [], fundingSource: 'Manual funding' },
	{ id: 5, name: 'PayMo Business Account', balance: 'KES 6,150,000', type: 'Business', children: [], fundingSource: 'Independent' },
];

const linkedBusinesses = [
	{
		id: 1,
		name: 'TechVentures Ltd',
		type: 'Online Business',
		domain: 'techventures.co.ke',
		dateRegistered: '15 Jan 2023',
		documents: ['Certificate of Incorporation', 'KRA PIN Certificate', 'Director IDs', 'Business Permit'],
		region: 'Nairobi (Westlands)',
		status: 'Verified',
		tier: 'Business Plus',
	},
	{
		id: 2,
		name: 'GreenGrocery Co',
		type: 'Local Shop',
		domain: 'N/A',
		dateRegistered: '08 Mar 2023',
		documents: ['Business Registration', 'KRA PIN Certificate', 'Trade License', 'Health Certificate'],
		region: 'Nairobi (Kilimani)',
		status: 'Verified',
		tier: 'Business Standard',
	},
	{
		id: 3,
		name: 'Swift Logistics',
		type: 'Transport Services',
		domain: 'swiftlogistics.ke',
		dateRegistered: '22 May 2023',
		documents: ['Certificate of Incorporation', 'KRA PIN Certificate', 'NTSA License', 'Insurance Certificate'],
		region: 'Nairobi (Industrial Area)',
		status: 'Verified',
		tier: 'Business Plus',
	},
	{
		id: 4,
		name: 'All Furniture Kenya',
		type: 'Local Shop',
		domain: 'allfurniture.co.ke',
		dateRegistered: '10 Sep 2023',
		documents: ['Business Registration', 'KRA PIN Certificate', 'Trade License', 'Fire Safety Certificate'],
		region: 'Mombasa (Nyali)',
		status: 'Verified',
		tier: 'Business Standard',
	},
];

const fetchProfileData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { profile, accounts, cards, activity, transactionLimits, businessAccounts, externalAccounts, autoPayouts, securityLimits, countryRestrictions, riskMitigation, transactionNotifications, feeStructure, accountHierarchy, linkedBusinesses };
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
		initialData: { profile, accounts, cards, activity, transactionLimits, businessAccounts, externalAccounts, autoPayouts, securityLimits, countryRestrictions, riskMitigation, transactionNotifications, feeStructure, accountHierarchy, linkedBusinesses },
	});

	const { profile: p, accounts: accs, cards: cardsList, activity: act, transactionLimits: limits = [], businessAccounts: biz = [], externalAccounts: ext = [], autoPayouts: payouts = [], securityLimits: secLimits = [], countryRestrictions: countries = [], riskMitigation: risks = [], transactionNotifications: notifs = [], feeStructure: fees = [], accountHierarchy: hierarchy = [], linkedBusinesses: businesses = [] } = data;

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
									icon: 'bi bi-exclamation-circle',
									bg: 'var(--danger-bg)',
									color: 'var(--danger)',
									title: 'Daily limit 64% used',
									desc: 'KES 320,000 / 500,000 • 18:00 reset',
									action: 'Manage',
									modal: 'transactionLimitsModal',
								},
								{
									icon: 'bi bi-clock',
									bg: 'var(--warning-bg)',
									color: 'var(--warning)',
									title: 'External account pending',
									desc: 'Standard Chartered USD awaiting verification',
									action: 'Verify',
									modal: 'externalAccountsModal',
								},
								{
									icon: 'bi bi-shield-exclamation',
									bg: 'var(--info-bg)',
									color: 'var(--info)',
									title: 'OTP threshold review',
									desc: 'International transfers set at KES 10,000',
									action: 'Adjust',
									modal: 'securityLimitsModal',
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
									icon: 'bi bi-lightning-charge',
									bg: 'var(--success-bg)',
									color: 'var(--success)',
									title: 'Enable instant client payouts',
									desc: 'Auto-deposit collections to linked accounts',
									action: 'Setup',
									modal: 'autoPayoutsModal',
								},
								{
									icon: 'bi bi-graph-up-arrow',
									bg: 'var(--pri-bg)',
									color: 'var(--pri)',
									title: 'Increase business limits',
									desc: 'TechVentures at 24% of daily limit',
									action: 'Upgrade',
									modal: 'businessLimitsModal',
								},
								{
									icon: 'bi bi-shield-check',
									bg: 'var(--warning-bg)',
									color: 'var(--warning)',
									title: 'Add OTP for bill payments',
									desc: 'Currently disabled • recommended for security',
									action: 'Enable',
									modal: 'securityLimitsModal',
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
									<p className={styles.sectionSubtitle}>Money & account tasks</p>
								</div>
							</div>
							<div className={styles.quickGrid}>
								<button className={styles.quickButton} onClick={() => openModal('transactionLimitsModal')}>
									<i className="bi bi-sliders" style={{ color: 'var(--pri)' }}></i> Limits
								</button>
								<button className={styles.quickButton} onClick={() => openModal('externalAccountsModal')}>
									<i className="bi bi-link-45deg" style={{ color: 'var(--success)' }}></i> Link Account
								</button>
								<button className={styles.quickButton} onClick={() => openModal('autoPayoutsModal')}>
									<i className="bi bi-arrow-repeat" style={{ color: 'var(--info)' }}></i> Auto Payout
								</button>
								<button className={styles.quickButton} onClick={() => openModal('securityLimitsModal')}>
									<i className="bi bi-shield-lock" style={{ color: 'var(--danger)' }}></i> Security
								</button>
								<button className={styles.quickButton} onClick={() => openModal('countryRestrictionsModal')}>
									<i className="bi bi-globe" style={{ color: 'var(--purple)' }}></i> Countries
								</button>
								<button className={styles.quickButton} onClick={() => openModal('feeStructureModal')}>
									<i className="bi bi-cash-coin" style={{ color: 'var(--warning)' }}></i> Fees
								</button>
								<button className={styles.quickButton} onClick={() => openModal('businessLimitsModal')}>
									<i className="bi bi-building" style={{ color: 'var(--acc)' }}></i> Business
								</button>
								<button className={styles.quickButton} onClick={() => openModal('accountHierarchyModal')}>
									<i className="bi bi-diagram-3" style={{ color: 'var(--pri)' }}></i> Hierarchy
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

				{/* ---------- LINKED BUSINESSES ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-building" style={{ color: 'var(--pri)' }}></i> Linked
								Businesses
							</h3>
							<p className={styles.sectionSubtitle}>
								All verified businesses linked to your account with registration details and documents.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('linkBusinessModal')}
							>
								<i className="bi bi-plus-lg"></i> Link Business
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Business Name</th>
									<th>Type</th>
									<th>Domain</th>
									<th>Date Registered</th>
									<th>Documents</th>
									<th>Region</th>
									<th>Status</th>
									<th>Tier</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{businesses.map((business) => (
									<tr key={business.id}>
										<td>
											<strong>{business.name}</strong>
										</td>
										<td>
											<span className={`${styles.badge} ${
												business.type === 'Online Business' ? styles.badgeInfo :
												business.type === 'Local Shop' ? styles.badgeSuccess :
												styles.badgePurple
											}`}>
												{business.type}
											</span>
										</td>
										<td>{business.domain}</td>
										<td>{business.dateRegistered}</td>
										<td>
											<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
												{business.documents.length} documents
											</div>
										</td>
										<td>{business.region}</td>
										<td>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												<i className="bi bi-check-circle"></i> {business.status}
											</span>
										</td>
										<td>{business.tier}</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('businessLimitsModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- TRANSACTION LIMITS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-sliders" style={{ color: 'var(--pri)' }}></i>
								Transaction Limits
							</h3>
							<p className={styles.sectionSubtitle}>
								Daily and monthly limits for your PayMo accounts and sub-accounts.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('transactionLimitsModal')}
							>
								<i className="bi bi-gear"></i> Configure
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('transactionLimitsModal')}
							>
								<i className="bi bi-plus-lg"></i> Add Limit
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Account</th>
									<th>Type</th>
									<th>Daily Limit</th>
									<th>Daily Used</th>
									<th>Monthly Limit</th>
									<th>Monthly Used</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{limits.map((limit) => (
									<tr key={limit.id}>
										<td>
											<strong>{limit.account}</strong>
										</td>
										<td>{limit.type}</td>
										<td>KES {limit.dailyLimit.toLocaleString()}</td>
										<td>
											<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
												<div style={{ flex: 1, minWidth: 60 }}>
													<div className={styles.progressTrack} style={{ height: 6 }}>
														<div
															className={styles.progressBar}
															style={{
																width: `${(limit.dailyUsed / limit.dailyLimit) * 100}%`,
																background: (limit.dailyUsed / limit.dailyLimit) > 0.8 ? 'var(--warning)' : 'var(--pri)',
															}}
														></div>
													</div>
												</div>
												<span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((limit.dailyUsed / limit.dailyLimit) * 100)}%</span>
											</div>
										</td>
										<td>KES {limit.monthlyLimit.toLocaleString()}</td>
										<td>
											<span style={{ fontSize: 13, fontWeight: 600 }}>KES {limit.monthlyUsed.toLocaleString()}</span>
										</td>
										<td>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												<i className="bi bi-check-circle"></i> {limit.status}
											</span>
										</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('transactionLimitsModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--success-bg)', borderRadius: 8, fontSize: 12, color: '#047857' }}>
						<i className="bi bi-info-circle"></i> PayMo to PayMo transfers are FREE and unlimited. Limits apply to external transfers only.
					</div>
				</div>

				{/* ---------- LINKED BUSINESS ACCOUNTS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-building" style={{ color: 'var(--purple)' }}></i>
								Linked Business Accounts
							</h3>
							<p className={styles.sectionSubtitle}>
								Manage limits and access for your linked business accounts.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('businessLimitsModal')}
							>
								<i className="bi bi-sliders"></i> Limits
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('linkBusinessModal')}
							>
								<i className="bi bi-plus-lg"></i> Link Business
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Business Name</th>
									<th>Account Number</th>
									<th>Balance</th>
									<th>Daily Limit</th>
									<th>Daily Used</th>
									<th>Tier</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{biz.map((business) => (
									<tr key={business.id}>
										<td>
											<strong>{business.name}</strong>
										</td>
										<td>{business.accountNumber}</td>
										<td style={{ fontWeight: 600, color: 'var(--pri)' }}>{business.balance}</td>
										<td>KES {business.dailyLimit.toLocaleString()}</td>
										<td>
											<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
												<div style={{ flex: 1, minWidth: 60 }}>
													<div className={styles.progressTrack} style={{ height: 6 }}>
														<div
															className={styles.progressBar}
															style={{
																width: `${(business.dailyUsed / business.dailyLimit) * 100}%`,
																background: (business.dailyUsed / business.dailyLimit) > 0.8 ? 'var(--warning)' : 'var(--pri)',
															}}
														></div>
													</div>
												</div>
												<span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((business.dailyUsed / business.dailyLimit) * 100)}%</span>
											</div>
										</td>
										<td>{business.tier}</td>
										<td>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												<i className="bi bi-check-circle"></i> {business.status}
											</span>
										</td>
										<td>
											<div className="d-flex" style={{ gap: 6 }}>
												<button
													className={`${styles.button} ${styles.buttonSmall}`}
													onClick={() => openModal('businessLimitsModal')}
												>
													<i className="bi bi-sliders"></i>
												</button>
												<button
													className={`${styles.button} ${styles.buttonSmall}`}
													onClick={() => openModal('unlinkBusinessModal')}
												>
													<i className="bi bi-link-unlink"></i>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* ---------- LINKED EXTERNAL ACCOUNTS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-link-45deg" style={{ color: 'var(--success)' }}></i>
								Linked External Accounts
							</h3>
							<p className={styles.sectionSubtitle}>
								Bank accounts and mobile money wallets for external transfers.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('externalAccountsModal')}
							>
								<i className="bi bi-gear"></i> Manage
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('linkExternalModal')}
							>
								<i className="bi bi-plus-lg"></i> Link Account
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Type</th>
									<th>Bank / Wallet</th>
									<th>Account Number</th>
									<th>Currency</th>
									<th>Status</th>
									<th>Last Used</th>
									<th>Default</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{ext.map((account) => (
									<tr key={account.id}>
										<td>
											<span className={`${styles.badge} ${account.type === 'Bank' ? styles.badgeInfo : styles.badgePurple}`}>
												{account.type}
											</span>
										</td>
										<td>
											<strong>{account.name}</strong>
										</td>
										<td>
											<code style={{ fontSize: 12, background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 4 }}>
												{account.accountNumber}
											</code>
										</td>
										<td>{account.currency}</td>
										<td>
											<span className={`${styles.badge} ${account.status === 'Verified' ? styles.badgeSuccess : styles.badgeWarning}`}>
												<i className={`bi ${account.status === 'Verified' ? 'bi-check-circle' : 'bi-clock'}`}></i> {account.status}
											</span>
										</td>
										<td style={{ fontSize: 13 }}>{account.lastUsed}</td>
										<td>
											{account.isDefault ? (
												<span className={`${styles.badge} ${styles.badgeSuccess}`}>
													<i className="bi bi-star-fill"></i> Default
												</span>
											) : (
												<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('externalAccountsModal')}>
													Set Default
												</button>
											)}
										</td>
										<td>
											<div className="d-flex" style={{ gap: 6 }}>
												<button
													className={`${styles.button} ${styles.buttonSmall}`}
													onClick={() => openModal('externalAccountsModal')}
												>
													<i className="bi bi-pencil"></i>
												</button>
												<button
													className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
													onClick={() => openModal('unlinkExternalModal')}
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
				</div>

				{/* ---------- AUTO PAYOUT SCHEDULING ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-arrow-repeat" style={{ color: 'var(--info)' }}></i>
								Auto Payout Scheduling
							</h3>
							<p className={styles.sectionSubtitle}>
								Automate transfers to external accounts on schedule or instantly.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('autoPayoutsModal')}
							>
								<i className="bi bi-gear"></i> Configure
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('createPayoutModal')}
							>
								<i className="bi bi-plus-lg"></i> New Schedule
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Schedule Name</th>
									<th>Type</th>
									<th>Amount</th>
									<th>Destination</th>
									<th>Status</th>
									<th>Next Run</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{payouts.map((payout) => (
									<tr key={payout.id}>
										<td>
											<strong>{payout.name}</strong>
										</td>
										<td>
											<span className={`${styles.badge} ${payout.type === 'Instant' ? styles.badgeSuccess : styles.badgeInfo}`}>
												{payout.type}
											</span>
										</td>
										<td style={{ fontWeight: 600, color: 'var(--pri)' }}>{payout.amount}</td>
										<td>{payout.destination}</td>
										<td>
											<span className={`${styles.badge} ${payout.status === 'Active' ? styles.badgeSuccess : styles.badgeWarning}`}>
												<i className={`bi ${payout.status === 'Active' ? 'bi-check-circle' : 'bi-pause-circle'}`}></i> {payout.status}
											</span>
										</td>
										<td style={{ fontSize: 13 }}>{payout.nextRun}</td>
										<td>
											<div className="d-flex" style={{ gap: 6 }}>
												<button
													className={`${styles.button} ${styles.buttonSmall}`}
													onClick={() => openModal('autoPayoutsModal')}
												>
													<i className="bi bi-pencil"></i>
												</button>
												<button
													className={`${styles.button} ${styles.buttonSmall} ${payout.status === 'Active' ? styles.buttonDanger : styles.buttonPrimary}`}
													onClick={() => openModal('autoPayoutsModal')}
												>
													<i className={`bi ${payout.status === 'Active' ? 'bi-pause' : 'bi-play'}`}></i>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--info-bg)', borderRadius: 8, fontSize: 12, color: '#1e40af' }}>
						<i className="bi bi-lightning-charge"></i> Instant payouts automatically transfer funds when money is collected from clients. Perfect for real-time cash flow management.
					</div>
				</div>

				{/* ---------- SECURITY LIMITS & OTP ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-shield-lock" style={{ color: 'var(--danger)' }}></i>
								Security Limits & OTP Verification
							</h3>
							<p className={styles.sectionSubtitle}>
								Protect against unauthorized transfers with OTP thresholds.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('securityLimitsModal')}
							>
								<i className="bi bi-gear"></i> Configure
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('securityLimitsModal')}
							>
								<i className="bi bi-plus-lg"></i> Add Rule
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Transfer Type</th>
									<th>Threshold</th>
									<th>Requires OTP</th>
									<th>OTP Method</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{secLimits.map((limit) => (
									<tr key={limit.id}>
										<td>
											<strong>{limit.transferType}</strong>
										</td>
										<td style={{ fontWeight: 600, color: 'var(--pri)' }}>KES {limit.threshold.toLocaleString()}</td>
										<td>
											<span className={`${styles.badge} ${limit.requiresOTP ? styles.badgeSuccess : styles.badgeWarning}`}>
												<i className={`bi ${limit.requiresOTP ? 'bi-check-circle' : 'bi-x-circle'}`}></i> {limit.requiresOTP ? 'Yes' : 'No'}
											</span>
										</td>
										<td>{limit.otpMethod}</td>
										<td>
											<span className={`${styles.badge} ${limit.status === 'Active' ? styles.badgeSuccess : styles.badgeOutline}`}>
												{limit.status}
											</span>
										</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('securityLimitsModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--danger-bg)', borderRadius: 8, fontSize: 12, color: '#7f1d1d' }}>
						<i className="bi bi-exclamation-triangle"></i> OTP verification adds an extra layer of security. Transfers above your set threshold will require confirmation via SMS, WhatsApp, or Email.
					</div>
				</div>

				{/* ---------- COUNTRY RESTRICTIONS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-globe" style={{ color: 'var(--purple)' }}></i>
								Country Restrictions & Verification
							</h3>
							<p className={styles.sectionSubtitle}>
								Control which countries you can transfer to and verification requirements.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('countryRestrictionsModal')}
							>
								<i className="bi bi-gear"></i> Configure
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('countryRestrictionsModal')}
							>
								<i className="bi bi-plus-lg"></i> Add Country
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Country</th>
									<th>Code</th>
									<th>Status</th>
									<th>Verification Required</th>
									<th>Transfer Limit</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{countries.map((country) => (
									<tr key={country.id}>
										<td>
											<strong>{country.country}</strong>
										</td>
										<td>
											<code style={{ fontSize: 12, background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 4 }}>
												{country.code}
											</code>
										</td>
										<td>
											<span className={`${styles.badge} ${
												country.status === 'Allowed' ? styles.badgeSuccess :
												country.status === 'Restricted' ? styles.badgeWarning :
												styles.badgeDanger
											}`}>
												<i className={`bi ${
													country.status === 'Allowed' ? 'bi-check-circle' :
													country.status === 'Restricted' ? 'bi-exclamation-circle' :
													'bi-x-circle'
												}`}></i> {country.status}
											</span>
										</td>
										<td style={{ fontSize: 13 }}>{country.verification}</td>
										<td style={{ fontWeight: 600 }}>{country.transferLimit}</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('countryRestrictionsModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--info-bg)', borderRadius: 8, fontSize: 12, color: '#1e40af' }}>
						<i className="bi bi-info-circle"></i> Transfers to Kenya (your national country) are free and unlimited. International transfers may require enhanced KYC and KRA verification.
					</div>
				</div>

				{/* ---------- RISK MITIGATION ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-shield-check" style={{ color: 'var(--warning)' }}></i>
								Risk Mitigation & High-Value Verification
							</h3>
							<p className={styles.sectionSubtitle}>
								Automatic verification requirements for high-value transactions.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('riskMitigationModal')}
							>
								<i className="bi bi-gear"></i> Configure
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Threshold</th>
									<th>Currency</th>
									<th>Requirement</th>
									<th>Applies To</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{risks.map((risk) => (
									<tr key={risk.id}>
										<td style={{ fontWeight: 600, color: 'var(--pri)' }}>KES {risk.threshold.toLocaleString()}</td>
										<td>{risk.currency}</td>
										<td>
											<strong>{risk.requirement}</strong>
										</td>
										<td style={{ fontSize: 13 }}>{risk.appliesTo}</td>
										<td>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												<i className="bi bi-check-circle"></i> {risk.status}
											</span>
										</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('riskMitigationModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--warning-bg)', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
						<i className="bi bi-exclamation-triangle"></i> Transactions above KES 1,000,000 require KYC verification. Business transfers above KES 1,000,000 also require KRA PIN verification.
					</div>
				</div>

				{/* ---------- TRANSACTION FEE STRUCTURE ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-cash-coin" style={{ color: 'var(--acc)' }}></i>
								Transaction Fee Structure
							</h3>
							<p className={styles.sectionSubtitle}>
								Fees for different transfer types and payment methods.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('feeStructureModal')}
							>
								<i className="bi bi-info-circle"></i> Details
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Transfer Type</th>
									<th>Fee</th>
									<th>Description</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{fees.map((fee) => (
									<tr key={fee.id}>
										<td>
											<strong>{fee.type}</strong>
										</td>
										<td>
											<span style={{ fontWeight: 700, color: fee.fee === 'FREE' ? 'var(--success)' : 'var(--pri)' }}>
												{fee.fee}
											</span>
										</td>
										<td style={{ fontSize: 13 }}>{fee.description}</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('feeStructureModal')}
											>
												<i className="bi bi-info-circle"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--success-bg)', borderRadius: 8, fontSize: 12, color: '#047857' }}>
						<i className="bi bi-check-circle"></i> <strong>PayMo to PayMo transfers are FREE</strong> — Send money instantly between PayMo accounts at no cost.
					</div>
				</div>

				{/* ---------- ACCOUNT HIERARCHY & FUND FLOW ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-diagram-3" style={{ color: 'var(--pri)' }}></i>
								Account Hierarchy & Fund Flow
							</h3>
							<p className={styles.sectionSubtitle}>
								Primary wallet, sub-accounts, and automatic funding relationships.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('accountHierarchyModal')}
							>
								<i className="bi bi-diagram-3"></i> Visual View
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('createSubAccountModal')}
							>
								<i className="bi bi-plus-lg"></i> Sub-Account
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Account Name</th>
									<th>Balance</th>
									<th>Type</th>
									<th>Parent Account</th>
									<th>Funding Source</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{hierarchy.map((acc) => (
									<tr key={acc.id}>
										<td>
											<strong>{acc.name}</strong>
											{acc.children && acc.children.length > 0 && (
												<div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>
													<i className="bi bi-diagram-2"></i> Sub-accounts: {acc.children.join(', ')}
												</div>
											)}
										</td>
										<td style={{ fontWeight: 600, color: 'var(--pri)' }}>{acc.balance}</td>
										<td>
											<span className={`${styles.badge} ${
												acc.type === 'Primary' ? styles.badgeSuccess :
												acc.type === 'Sub-account' ? styles.badgeInfo :
												acc.type === 'Multi-currency' ? styles.badgePurple :
												styles.badgeWarning
											}`}>
												{acc.type}
											</span>
										</td>
										<td>{acc.parent || '—'}</td>
										<td style={{ fontSize: 13 }}>{acc.fundingSource}</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('accountHierarchyModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--info-bg)', borderRadius: 8, fontSize: 12, color: '#1e40af' }}>
						<i className="bi bi-info-circle"></i> Sub-accounts automatically draw funds from the primary wallet when needed. Set up utility and services accounts for better expense tracking.
					</div>
				</div>

				{/* ---------- ADVANCED TRANSACTION NOTIFICATIONS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-bell" style={{ color: 'var(--info)' }}></i>
								Advanced Transaction Notifications
							</h3>
							<p className={styles.sectionSubtitle}>
								Configure real-time alerts for all transaction events via multiple channels.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('transactionNotificationsModal')}
							>
								<i className="bi bi-gear"></i> Configure
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('transactionNotificationsModal')}
							>
								<i className="bi bi-plus-lg"></i> Add Rule
							</button>
						</div>
					</div>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Event</th>
									<th>Notification Channels</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{notifs.map((notif) => (
									<tr key={notif.id}>
										<td>
											<strong>{notif.event}</strong>
										</td>
										<td>
											<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
												{(notif.channels || []).map((channel) => (
													<span key={channel} className={`${styles.badge} ${styles.badgeInfo}`} style={{ fontSize: 10 }}>
														{channel}
													</span>
												))}
											</div>
										</td>
										<td>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												<i className="bi bi-check-circle"></i> {notif.status}
											</span>
										</td>
										<td>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('transactionNotificationsModal')}
											>
												<i className="bi bi-pencil"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--success-bg)', borderRadius: 8, fontSize: 12, color: '#047857' }}>
						<i className="bi bi-check-circle"></i> Receive instant notifications via SMS, Email, WhatsApp, and Push for all transaction activities, security alerts, and limit warnings.
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
