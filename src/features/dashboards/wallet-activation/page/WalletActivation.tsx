'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { WalletActivationModals } from '../modals/WalletActivationModals';
import AccountFlowChart from '../components/AccountFlowChart';
import HowItWorks from '../components/HowItWorks';
import styles from '../styles/walletActivation.module.css';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const wallet = {
	accountNumber: 'PM-4521-8830-1024',
	walletId: 'WLT-8H2K-9XQ4',
	holder: 'Amina Grace Kamau',
	initials: 'AK',
	tier: 'Premium',
	balance: 'KES 1,284,300',
	status: 'Active',
	opened: '12 January 2023',
	age: '2 years 7 months',
	currencies: ['KES', 'USD', 'EUR', 'GBP'],
	linkedDashboards: 6,
	pendingIncoming: 'KES 45,000',
	pendingOutgoing: 'KES 12,500',
	consolidated: 'KES 2,412,800',
	security: { pin: true, biometric: true, twoFA: true, sessions: 4 },
};

const healthFeed = [
	{
		icon: 'bi bi-arrow-down-left',
		bg: 'var(--success-bg)',
		color: 'var(--success)',
		title: 'Received KES 125,000',
		desc: 'PayMo KES Wallet → Transaction Hub',
		time: 'Today, 14:22',
		amount: '+KES 125,000',
	},
	{
		icon: 'bi bi-arrow-up-right',
		bg: 'var(--warning-bg)',
		color: 'var(--warning)',
		title: 'Sent KES 25,000',
		desc: 'Business Float → Utilities Hub',
		time: '25 Jun, 09:12',
		amount: '-KES 25,000',
	},
	{
		icon: 'bi bi-piggy-bank',
		bg: 'var(--purple-bg)',
		color: 'var(--purple)',
		title: 'Auto-sweep KES 180,000',
		desc: 'Business Float → Savings Jar',
		time: '24 Jun, 11:45',
		amount: '-KES 180,000',
	},
];

const dashboards = [
	{ id: 1, name: 'Transaction Hub', icon: 'bi bi-arrow-left-right', bg: 'var(--success-bg)', color: 'var(--success)', desc: 'Payments, P2P & remittances', status: 'Active', variant: 'success', last: 'Today, 14:22', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 2, name: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', desc: 'Merchant payments, collections & payroll', status: 'Activation Pending', variant: 'warning', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: true },
	{ id: 3, name: 'Utilities Hub', icon: 'bi bi-lightning-charge', bg: 'var(--warning-bg)', color: 'var(--warning)', desc: 'Pay bills, airtime & subscriptions', status: 'Active', variant: 'success', last: 'Yesterday, 18:30', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 4, name: 'Developer Portal', icon: 'bi bi-code-slash', bg: 'var(--info-bg)', color: 'var(--info)', desc: 'API keys, webhooks & sandbox', status: 'Not Activated', variant: 'grey', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: false },
	{ id: 5, name: 'Loans & Credit', icon: 'bi bi-cash-stack', bg: 'var(--info-bg)', color: 'var(--info)', desc: 'Personal & business loans', status: 'Active', variant: 'success', last: '25 Jun, 09:12', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 6, name: 'Savings & Investments', icon: 'bi bi-piggy-bank', bg: 'var(--purple-bg)', color: 'var(--purple)', desc: 'MMF, fixed deposits & SACCO', status: 'Active', variant: 'success', last: '24 Jun, 11:45', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 7, name: 'Crypto Center', icon: 'bi bi-currency-bitcoin', bg: 'var(--danger-bg)', color: 'var(--danger)', desc: 'Buy, sell & hold digital assets', status: 'Suspended', variant: 'danger', last: '20 Jun, 08:00', action: 'Revoke', modal: 'accessLogsModal', notify: true },
	{ id: 8, name: 'Cards Center', icon: 'bi bi-credit-card-2-front', bg: 'var(--info-bg)', color: 'var(--info)', desc: 'Virtual & physical cards', status: 'Active', variant: 'success', last: 'Today, 11:05', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 9, name: 'Insurance Hub', icon: 'bi bi-shield-plus', bg: 'var(--success-bg)', color: 'var(--success)', desc: 'Motor, health & device cover', status: 'Not Activated', variant: 'grey', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: false },
	{ id: 10, name: 'Government Services', icon: 'bi bi-building', bg: 'var(--warning-bg)', color: 'var(--warning)', desc: 'Rates, licences & eCitizen', status: 'Activation Pending', variant: 'warning', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: true },
];

const consentItems = [
	{ name: 'Terms of Service', desc: 'General terms governing use of this PayMo dashboard.' },
	{ name: 'Acceptable Use Policy (AUP)', desc: 'What you can and cannot do with dashboard features.' },
	{ name: 'AML Compliance Declaration', desc: 'You confirm funds are from legitimate sources.' },
	{ name: 'CTF Acknowledgment', desc: 'You agree to flag suspicious transactions.' },
	{ name: 'Data Sharing Consent', desc: 'Allows cross-dashboard balance visibility for linked accounts.' },
	{ name: 'Cross-Dashboard Transaction Authorization', desc: 'Permits transfers between your linked dashboards.' },
	{ name: 'Regulatory Compliance Attestation', desc: 'CBK / KRA / sector-specific compliance confirmation.' },
	{ name: 'Fee Schedule & Pricing Acknowledgment', desc: 'You accept the published fees for this dashboard.' },
	{ name: 'Privacy Policy Addendum', desc: 'Dashboard-specific data processing addendum.' },
	{ name: 'Marketing & Promotional Consent (optional)', desc: 'Optional — not mandatory for activation.' },
];

const linkableAccounts = [
	{ id: 1, name: 'PayMo KES Wallet', origin: 'Transaction Hub', icon: 'bi bi-wallet2', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 5530', balance: 'KES 1,284,300', status: 'Linked', variant: 'success' },
	{ id: 2, name: 'Business Float', origin: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', number: '•••• 2207', balance: 'KES 6,150,000', status: 'Linked', variant: 'success' },
	{ id: 3, name: 'Savings Jar', origin: 'Savings & Investments', icon: 'bi bi-piggy-bank', bg: 'var(--warning-bg)', color: 'var(--warning)', number: '•••• 7793', balance: 'KES 480,000', status: 'Linked', variant: 'success' },
	{ id: 4, name: 'Loan Disbursement', origin: 'Loans & Credit', icon: 'bi bi-cash-stack', bg: 'var(--info-bg)', color: 'var(--info)', number: '•••• 8910', balance: 'KES 0', status: 'Link Revoked', variant: 'danger' },
	{ id: 5, name: 'Fiat On-ramp', origin: 'Crypto Center', icon: 'bi bi-currency-bitcoin', bg: 'var(--danger-bg)', color: 'var(--danger)', number: '•••• 0042', balance: 'USD 2,410', status: 'Link Requested', variant: 'warning' },
	{ id: 6, name: 'Old Collection Float', origin: 'Business Portal', icon: 'bi bi-collection', bg: 'var(--info-bg)', color: 'var(--info)', number: '•••• 3310', balance: 'KES 0', status: 'Unlinked', variant: 'grey' },
	{ id: 7, name: 'MMF Account', origin: 'Savings & Investments', icon: 'bi bi-graph-up', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 9091', balance: 'KES 2,100,000', status: 'Linked', variant: 'success' },
	{ id: 8, name: 'Credit Line Wallet', origin: 'Loans & Credit', icon: 'bi bi-bank', bg: 'var(--purple-bg)', color: 'var(--purple)', number: '•••• 1187', balance: 'KES 750,000', status: 'Link Requested', variant: 'warning' },
	{ id: 9, name: 'Stablecoin Wallet', origin: 'Crypto Center', icon: 'bi bi-coin', bg: 'var(--warning-bg)', color: 'var(--warning)', number: '•••• 6642', balance: 'USDT 4,200', status: 'Unlinked', variant: 'grey' },
];

const activeLinks = [
	{ id: 1, name: 'PayMo KES Wallet', origin: 'Transaction Hub', icon: 'bi bi-wallet2', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 5530', linked: '12 Jan 2023', balance: 'KES 1,284,300', status: 'Active', permission: 'Full Control', full: true },
	{ id: 2, name: 'Business Float', origin: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', number: '•••• 2207', linked: '03 Feb 2024', balance: 'KES 6,150,000', status: 'Active', permission: 'Full Control', full: true },
	{ id: 3, name: 'Savings Jar', origin: 'Savings & Investments', icon: 'bi bi-piggy-bank', bg: 'var(--warning-bg)', color: 'var(--warning)', number: '•••• 7793', linked: '15 Mar 2024', balance: 'KES 480,000', status: 'Active', permission: 'View + Transfer In', full: false },
	{ id: 4, name: 'Loan Disbursement', origin: 'Loans & Credit', icon: 'bi bi-cash-stack', bg: 'var(--info-bg)', color: 'var(--info)', number: '•••• 8910', linked: '02 Apr 2025', balance: 'KES 0', status: 'Paused', permission: 'View Only', full: false },
	{ id: 5, name: 'Fiat On-ramp', origin: 'Crypto Center', icon: 'bi bi-currency-bitcoin', bg: 'var(--danger-bg)', color: 'var(--danger)', number: '•••• 0042', linked: '12 Jun 2025', balance: 'USD 2,410', status: 'Active', permission: 'View + Transfer In', full: false },
	{ id: 6, name: 'MMF Account', origin: 'Savings & Investments', icon: 'bi bi-graph-up', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 9091', linked: '20 Aug 2024', balance: 'KES 2,100,000', status: 'Active', permission: 'One-Way In', full: false },
];

const autoRules = [
	{ id: 1, name: 'Balance sweep', desc: 'IF Business Float > KES 3M THEN move 50% to KES Wallet', tag: 'Threshold', tagCls: 'var(--warning-bg)', tagColor: '#b45309', active: true },
	{ id: 2, name: 'Salary split', desc: 'On salary credit, auto-distribute 40% to Savings Jar', tag: 'Schedule', tagCls: 'var(--info-bg)', tagColor: '#1d4ed8', active: true },
	{ id: 3, name: 'Round-up', desc: 'Round transactions to nearest 100 KES → Savings', tag: 'Round-up', tagCls: 'var(--purple-bg)', tagColor: '#6d28d9', active: true },
	{ id: 4, name: 'Bill top-up', desc: 'On bill due, auto-pull KES 15,000 to Utilities', tag: 'Trigger', tagCls: 'var(--success-bg)', tagColor: '#047857', active: false },
];

const sessions = [
	{ device: 'iPhone 15 Pro', detail: 'iOS 18.5 • App v4.2.1', location: 'Nairobi, KE', dash: '6 dashboards', lastActive: 'Just now', ip: '102.68.XX.XX', status: 'Current', current: true },
	{ device: 'MacBook Pro', detail: 'macOS 15.4 • Safari', location: 'Nairobi, KE', dash: '6 dashboards', lastActive: '14:22 today', ip: '102.68.XX.XX', status: 'Active', current: false },
	{ device: 'Windows PC', detail: 'Windows 11 • Chrome', location: 'Nairobi, KE', dash: '3 dashboards', lastActive: '26 Jun 2025', ip: '102.68.XX.XX', status: 'New', current: false },
	{ device: 'iPad Air', detail: 'iPadOS 18.4 • App', location: 'Mombasa, KE', dash: '2 dashboards', lastActive: '20 Jun 2025', ip: '105.XX.XX.XX', status: 'Active', current: false },
];

const accessLogs = [
	{ date: '27 Jun 2025 14:22', action: 'Dashboard activated (Business Portal)', dash: 'Business', ip: '102.68.XX.XX', device: 'iPhone 15 Pro', status: 'Success', variant: 'success' },
	{ date: '27 Jun 2025 14:21', action: 'Account linked (Business Float)', dash: 'Business', ip: '102.68.XX.XX', device: 'iPhone 15 Pro', status: 'Success', variant: 'success' },
	{ date: '26 Jun 2025 07:58', action: 'New device login (Windows PC)', dash: 'All', ip: '102.68.XX.XX', device: 'Windows PC', status: 'Review', variant: 'warning' },
	{ date: '20 Jun 2025 08:00', action: 'Crypto Center access revoked', dash: 'Crypto', ip: '105.XX.XX.XX', device: 'iPad Air', status: 'Revoked', variant: 'danger' },
	{ date: '15 Jun 2025 09:10', action: 'Permission changed (Savings Jar)', dash: 'Savings', ip: '102.68.XX.XX', device: 'MacBook Pro', status: 'Success', variant: 'success' },
];

const fetchWalletData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { wallet, healthFeed, dashboards, consentItems, linkableAccounts, activeLinks, autoRules, sessions, accessLogs };
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
		grey: styles.badgeGrey,
	};
	const icon =
		variant === 'success'
			? 'bi-check-circle'
			: variant === 'warning'
				? 'bi-clock'
				: variant === 'danger'
					? 'bi-x-circle'
					: variant === 'grey'
						? 'bi-lock'
						: 'bi-dot';
	return (
		<span className={`${styles.badge} ${map[variant] ?? styles.badgeOutline}`}>
			<i className={`bi ${icon}`}></i> {label}
		</span>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WalletActivation() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});

	const openModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	const { data } = useQuery({
		queryKey: ['walletActivationData'],
		queryFn: fetchWalletData,
		initialData: { wallet, healthFeed, dashboards, consentItems, linkableAccounts, activeLinks, autoRules, sessions, accessLogs },
	});

	const { wallet: w, healthFeed: feed, dashboards: dbs, consentItems: consent, linkableAccounts: links, activeLinks: actLinks, autoRules: rules, sessions: sess, accessLogs: logs } = data;

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Account</a> /{' '}
						<strong>Wallet Activation & Cross-Dashboard Hub</strong>
					</div>
					<h1 className={styles.pageTitle}>Wallet Activation & Cross-Dashboard Hub</h1>
					<p className={styles.pageDescription}>
						Your central gateway for activating dashboards, linking accounts across PayMo, managing
						inter-dashboard permissions, relocation safety, sessions, security and advanced
						automation — the consent layer between your primary wallet and every dashboard.
					</p>
				</div>
				<div className={styles.pageActions}>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('walletCardModal')}
					>
						<i className="bi bi-wallet2"></i> My Wallet
					</button>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('linkAccountModal')}
					>
						<i className="bi bi-link-45deg"></i> Link Account
					</button>
					<button
						className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
						onClick={() => openModal('activateDashboardModal')}
					>
						<i className="bi bi-stars"></i> Activate Dashboard
					</button>
					<button
						className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
						onClick={() => openModal('revokeAllAccessModal')}
					>
						<i className="bi bi-shield-exclamation"></i> Revoke All
					</button>
				</div>
			</div>

			{/* ==================== CONTENT ==================== */}
			<div className={styles.contentGrid}>
				{/* ---------- TOP BANNER: WALLET ID | HOW IT WORKS ---------- */}
				<div className={styles.bannerSplit}>
					{/* Left half — wallet identity */}
					<div className={styles.bannerWallet}>
						<div className={styles.bannerWalletTop}>
							<div className={styles.bannerWalletBrand}>
								<div className={styles.bannerWalletBrandLogo}>
									<i className="bi bi-wallet2"></i>
								</div>
								PAYMO WALLET
							</div>
							<span className={styles.bannerWalletChip}>
								<i className="bi bi-check-circle"></i> {w.status}
							</span>
						</div>

						<div className={styles.bannerWalletNumberLabel}>Primary Account Number</div>
						<div className={styles.bannerWalletNumber}>
							{w.accountNumber}
							<button
								className={styles.bannerWalletCopy}
								title="Copy account number"
								onClick={() => openModal('shareQRModal')}
							>
								<i className="bi bi-clipboard"></i>
							</button>
						</div>
						<div className={styles.bannerWalletHolder}>
							<span className={styles.badge} style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}>
								<i className="bi bi-gem"></i> {w.tier} KYC
							</span>
							<span>{w.holder}</span>
							<span className={styles.bannerWalletMeta}>
								<i className="bi bi-qr-code"></i> {w.walletId}
							</span>
						</div>

						<div className={styles.bannerWalletBalanceLabel}>
							Available Balance • {w.currencies.join(' · ')} wallets
						</div>
						<div className={styles.bannerWalletBalance}>{w.balance}</div>

						<div className={styles.bannerWalletStats}>
							<div className={styles.bannerWalletStat}>
								Linked Dashboards
								<strong>{w.linkedDashboards} active</strong>
							</div>
							<div className={styles.bannerWalletStat}>
								Pending In
								<strong style={{ color: '#6ee7b7' }}>{w.pendingIncoming}</strong>
							</div>
							<div className={styles.bannerWalletStat}>
								Pending Out
								<strong style={{ color: '#fcd34d' }}>{w.pendingOutgoing}</strong>
							</div>
							<div className={styles.bannerWalletStat}>
								Consolidated
								<strong>{w.consolidated}</strong>
							</div>
						</div>

						<div className={styles.bannerWalletActions}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
								onClick={() => openModal('walletCardModal')}
							>
								<i className="bi bi-wallet2"></i> Full Wallet
							</button>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
								onClick={() => openModal('shareQRModal')}
							>
								<i className="bi bi-qr-code"></i> Share QR
							</button>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								style={{ background: '#fff', border: 'none', color: '#047857' }}
								onClick={() => openModal('downloadAccountDetailsModal')}
							>
								<i className="bi bi-download"></i> PDF
							</button>
						</div>
					</div>

					{/* Right half — how it works (video + FAQ) */}
					<HowItWorks openModal={openModal} />
				</div>

				{/* ---------- LIVE ACCOUNT FLOW (dynamic left-to-right visualizer) ---------- */}
				<AccountFlowChart links={actLinks} openModal={openModal} />

				{/* ---------- 20.1 PRIMARY WALLET & IDENTITY ANCHOR ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-wallet2" style={{ color: 'var(--pri)' }}></i>
								20.1 — Primary Wallet & Identity Anchor
							</h3>
							<p className={styles.sectionSubtitle}>
								Your primary PayMo wallet identity, wallet health snapshot and cross-dashboard
								access matrix.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('walletHealthModal')}
							>
								<i className="bi bi-heart-pulse"></i> Health
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('walletCardModal')}
							>
								<i className="bi bi-eye"></i> Full Wallet
							</button>
						</div>
					</div>

					<div className={styles.walletHero}>
						{/* -------- Primary wallet card -------- */}
						<div className={styles.walletCard}>
							<div className={styles.walletCardTop}>
								<div className={styles.walletBrand}>
									<div className={styles.walletBrandLogo}>
										<i className="bi bi-wallet2"></i>
									</div>
									PAYMO WALLET
								</div>
								<span className={styles.walletStatusChip}>
									<i className="bi bi-check-circle"></i> {w.status}
								</span>
							</div>

							<div className={styles.walletAccountRow}>
								<div className={styles.walletAccountLabel}>Primary Account Number</div>
								<div className={styles.walletAccountNumber}>
									{w.accountNumber}
									<button
										className={styles.walletCopyBtn}
										title="Copy account number"
										onClick={() => openModal('shareQRModal')}
									>
										<i className="bi bi-clipboard"></i>
									</button>
								</div>
								<div className={styles.walletHolderRow}>
									<span className={styles.walletHolderName}>{w.holder}</span>
									<span
										className={styles.badge}
										style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}
									>
										<i className="bi bi-gem"></i> {w.tier} KYC
									</span>
									<span className={styles.walletMeta}>
										Opened {w.opened} • {w.age}
									</span>
								</div>
							</div>

							<div className={styles.walletBalanceBlock}>
								<div className={styles.walletBalanceLabel}>
									Available Balance • {w.currencies.join(' · ')} wallets
								</div>
								<div className={styles.walletBalance}>{w.balance}</div>
							</div>

							<div className={styles.walletQuickActions}>
								<button className={styles.walletQuickBtn} onClick={() => openModal('shareQRModal')}>
									<i className="bi bi-clipboard"></i> Copy Number
								</button>
								<button className={styles.walletQuickBtn} onClick={() => openModal('shareQRModal')}>
									<i className="bi bi-qr-code"></i> Share QR
								</button>
								<button className={styles.walletQuickBtn} onClick={() => openModal('downloadAccountDetailsModal')}>
									<i className="bi bi-download"></i> Account PDF
								</button>
							</div>
						</div>

						{/* -------- Wallet health snapshot -------- */}
						<div className={styles.walletSide}>
							<div className={styles.healthCard}>
								<div className={styles.healthTitle}>
									<i className="bi bi-clock-history"></i> Latest Consolidated Activity
								</div>
								<div className={styles.healthFeed}>
									{feed.map((item) => (
										<div className={styles.healthItem} key={item.title}>
											<div className={styles.healthIcon} style={{ background: item.bg, color: item.color }}>
												<i className={item.icon}></i>
											</div>
											<div className={styles.healthBody}>
												<div style={{ fontWeight: 600, fontSize: 12 }}>{item.title}</div>
												<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.desc}</div>
											</div>
											<div>
												<div className={styles.healthAmount} style={{ color: item.amount.startsWith('+') ? 'var(--success)' : 'var(--ink-900)' }}>
													{item.amount}
												</div>
												<div className={styles.healthTime}>{item.time}</div>
											</div>
										</div>
									))}
								</div>
								<button
									className={`${styles.button} ${styles.buttonSmall} mt-1`}
									onClick={() => openModal('walletHealthModal')}
								>
									View full snapshot
								</button>
							</div>

							<div className={styles.healthCard}>
								<div className={styles.healthTitle}>
									<i className="bi bi-shield-check"></i> Security Status
								</div>
								<div className={styles.securityRow}>
									<span>PIN set</span>
									<span style={{ color: 'var(--success)' }}>
										<i className="bi bi-check-circle"></i> Enabled
									</span>
								</div>
								<div className={styles.securityRow}>
									<span>Biometric</span>
									<span style={{ color: 'var(--success)' }}>
										<i className="bi bi-check-circle"></i> Enabled
									</span>
								</div>
								<div className={styles.securityRow}>
									<span>2FA status</span>
									<span style={{ color: 'var(--success)' }}>Active</span>
								</div>
								<div className={styles.securityRow}>
									<span>Active sessions</span>
									<span style={{ fontWeight: 600 }}>{w.security.sessions} devices</span>
								</div>
								<div className={styles.securityRow}>
									<span>Pending incoming / outgoing</span>
									<span style={{ fontWeight: 600 }}>
										<span style={{ color: 'var(--success)' }}>{w.pendingIncoming}</span> /{' '}
										<span style={{ color: 'var(--warning)' }}>{w.pendingOutgoing}</span>
									</span>
								</div>
								<button
									className={`${styles.button} ${styles.buttonSmall} mt-1`}
									onClick={() => openModal('activeSessionsModal')}
								>
									Manage sessions
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 20.1.2 DASHBOARD ACCESS MATRIX ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-grid-3x3-gap" style={{ color: 'var(--purple)' }}></i>
								20.1.2 — Dashboard Access Matrix
							</h3>
							<p className={styles.sectionSubtitle}>
								Every dashboard available to your account, its activation status, last access and
								quick actions. Grey = locked, Amber = pending activation, Green = active, Red =
								revoked.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('activateDashboardModal')}
						>
							<i className="bi bi-plus-lg"></i> Activate New
						</button>
					</div>
					<div className={styles.dashboardGrid}>
						{dbs.map((d) => (
							<div className={styles.dashboardCard} key={d.id}>
								<div className={styles.dashboardTop}>
									<div className={styles.dashboardIcon} style={{ background: d.bg, color: d.color }}>
										<i className={d.icon}></i>
									</div>
									{d.notify && <span className={styles.notifDot} title="Requires attention"></span>}
								</div>
								<div>
									<div className={styles.dashboardName}>{d.name}</div>
									<div className={styles.dashboardDesc}>{d.desc}</div>
								</div>
								<StatusBadge label={d.status} variant={d.variant} />
								<div className={styles.dashboardMeta}>
									Last accessed: {d.last}
								</div>
								<div className={styles.dashboardActions}>
									{d.action === 'Activate' ? (
										<button
											className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
											onClick={() => openModal(d.modal)}
										>
											<i className="bi bi-stars"></i> {d.action}
										</button>
									) : d.action === 'Revoke' ? (
										<button
											className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
											onClick={() => openModal(d.modal)}
										>
											<i className="bi bi-shield-exclamation"></i> {d.action}
										</button>
									) : (
										<>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal(d.modal)}
											>
												{d.action}
											</button>
											<button
												className={`${styles.button} ${styles.buttonSmall}`}
												onClick={() => openModal('activeLinksModal')}
											>
												Links
											</button>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ---------- 20.2 DASHBOARD ACTIVATION GATEWAY ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-stars" style={{ color: 'var(--acc)' }}></i>
								20.2 — Dashboard Activation Gateway
							</h3>
							<p className={styles.sectionSubtitle}>
								First-entry consent suite, PIN confirmation gate, post-activation success state and
								the interactive tour guide.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('tourGuideModal')}
							>
								<i className="bi bi-play-circle"></i> Tour
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('activateDashboardModal')}
							>
								<i className="bi bi-stars"></i> Start Activation
							</button>
						</div>
					</div>

					<div className="row g-3">
						<div className="col-lg-5">
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
									Activation Queue
								</h4>
								{[
									{ name: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', note: 'Consent expires in 7 days' },
									{ name: 'Government Services', icon: 'bi bi-building', bg: 'var(--warning-bg)', color: 'var(--warning)', note: 'Awaiting your consent' },
									{ name: 'Developer Portal', icon: 'bi bi-code-slash', bg: 'var(--info-bg)', color: 'var(--info)', note: 'Not started' },
									{ name: 'Insurance Hub', icon: 'bi bi-shield-plus', bg: 'var(--success-bg)', color: 'var(--success)', note: 'Not started' },
								].map((q) => (
									<div className={styles.summaryRow} key={q.name}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<div className={styles.sectionIcon} style={{ background: q.bg, color: q.color }}>
												<i className={q.icon}></i>
											</div>
											<div>
												<div style={{ fontWeight: 600, fontSize: 13 }}>{q.name}</div>
												<div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{q.note}</div>
											</div>
										</div>
										<button
											className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
											onClick={() => openModal('activateDashboardModal')}
										>
											Activate
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="col-lg-7">
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
									Mandatory Consent Suite — 10 items
								</h4>
								<div className={styles.consentList}>
									{consent.slice(0, 7).map((item, i) => (
										<div className={styles.consentItem} key={item.name}>
											<div className={`${styles.consentCheck} ${styles.checked}`}>
												<i className="bi bi-check"></i>
											</div>
											<div className={styles.consentBody}>
												<div className={styles.consentName}>
													{item.name}
													{i === 6 && (
														<span style={{ fontSize: 10, fontWeight: 600, marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: 'var(--purple-bg)', color: '#6d28d9' }}>
															Optional
														</span>
													)}
												</div>
												<div className={styles.consentDesc}>{item.desc}</div>
											</div>
										</div>
									))}
									<button
										className={`${styles.button} ${styles.buttonSmall} mt-2`}
										onClick={() => openModal('activateDashboardModal')}
									>
										<i className="bi bi-eye"></i> View full consent suite
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="row g-3 mt-1">
						<div className="col-lg-4">
							<div className={styles.detailBlock} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, height: '100%' }}>
								<div className={styles.detailBlockTitle} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-shield-lock"></i> Security Confirmation Gate
								</div>
								<p style={{ fontSize: 12, color: 'var(--ink-700)', margin: 0, lineHeight: 1.6 }}>
									4-6 digit PIN entry with masked input, biometric fallback, 3 attempts before a
									15-minute lockout and SMS OTP fallback after 2 failed attempts. Confirmation
									message: "You are activating [Dashboard]. This requires PIN confirmation."
								</p>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('activateDashboardModal')}>
									PIN Gate Preview
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={styles.detailBlock} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, height: '100%' }}>
								<div className={styles.detailBlockTitle} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-check-circle"></i> Post-Activation Success
								</div>
								<p style={{ fontSize: 12, color: 'var(--ink-700)', margin: 0, lineHeight: 1.6 }}>
									Success checkmark, personalized welcome, quick-start buttons (Tour, Link
									Accounts, Go to Dashboard, Set Preferences), timestamped activation certificate
									and auto-triggered welcome notification.
								</p>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('activationSuccessModal')}>
									Success Preview
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={styles.detailBlock} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, height: '100%' }}>
								<div className={styles.detailBlockTitle} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-signpost-2"></i> Tour Guide Launcher
								</div>
								<p style={{ fontSize: 12, color: 'var(--ink-700)', margin: 0, lineHeight: 1.6 }}>
									8-step interactive onboarding with section-by-section preview, hotspot
									annotations, progress tracker, skip with "Remind me later" and a 200-point
									tour completion reward.
								</p>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('tourGuideModal')}>
									<i className="bi bi-play-circle"></i> Launch Tour
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 20.3 CROSS-DASHBOARD ACCOUNT LINKAGE ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-link-45deg" style={{ color: 'var(--success)' }}></i>
								20.3 — Cross-Dashboard Account Linkage
							</h3>
							<p className={styles.sectionSubtitle}>
								Linkable accounts directory, active links panel, granular permission controls,
								notification routing and the link / unlink / revoke action center.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('linkPermissionsModal')}
							>
								<i className="bi bi-sliders"></i> Permissions
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('linkAccountModal')}
							>
								<i className="bi bi-plus-lg"></i> Link Account
							</button>
						</div>
					</div>

					<h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 10px' }}>
						20.3.1 — Linkable Accounts Directory
					</h4>
					<div className={styles.linkableGrid}>
						{links.map((acc) => (
							<div className={styles.linkableCard} key={acc.id}>
								<div className={styles.linkableTop}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<div className={styles.linkLogo} style={{ background: acc.bg, color: acc.color }}>
											<i className={acc.icon}></i>
										</div>
										<div>
											<div className={styles.linkName}>{acc.name}</div>
											<div className={styles.linkMeta}>{acc.origin}</div>
										</div>
									</div>
									<StatusBadge label={acc.status} variant={acc.variant} />
								</div>
								<div className={styles.linkMeta}>{acc.number}</div>
								<div className={styles.linkFooter}>
									<span className={styles.linkBalance}>{acc.balance}</span>
									{acc.status === 'Linked' ? (
										<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('linkPermissionsModal')}>
											Manage
										</button>
									) : acc.status === 'Unlinked' ? (
										<button className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`} onClick={() => openModal('linkAccountModal')}>
											Link
										</button>
									) : acc.status === 'Link Revoked' ? (
										<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('relinkAccountModal')}>
											Relink
										</button>
									) : (
										<button className={`${styles.button} ${styles.buttonSmall} ${styles.buttonAccent}`} onClick={() => openModal('linkAccountModal')}>
											Approve
										</button>
									)}
								</div>
							</div>
						))}
					</div>

					<hr className={styles.divider} />

					<div className={styles.cardHeader}>
						<div>
							<h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
								20.3.2 — Active Links Management Panel
							</h4>
							<p className={styles.sectionSubtitle} style={{ marginTop: 2 }}>
								Currently linked accounts across all dashboards with permissions and sync status.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('activeLinksModal')}
						>
							<i className="bi bi-layout-three-columns"></i> Manage All
						</button>
					</div>
					<div className={styles.activeLinkGrid}>
						{actLinks.map((acc) => (
							<div className={styles.activeLinkCard} key={acc.id}>
								<div className={styles.activeLinkHeader}>
									<div>
										<div className={styles.activeLinkName}>{acc.name}</div>
										<div className={styles.activeLinkOrigin}>
											<i className={acc.icon} style={{ color: acc.color }}></i> {acc.origin}
										</div>
									</div>
									<span className={`${styles.badge} ${acc.status === 'Paused' ? styles.badgeWarning : styles.badgeSuccess}`}>
										{acc.status}
									</span>
								</div>
								<span
									className={acc.full ? `${styles.permissionBadge} ${styles.permissionBadgeFull}` : styles.permissionBadge}
								>
									<i className="bi bi-shield-check"></i> {acc.permission}
								</span>
								<div className={styles.activeLinkMeta}>
									<span>{acc.number}</span>
									<span>Linked {acc.linked}</span>
								</div>
								<div className={styles.linkBalance}>{acc.balance}</div>
								<div className={styles.activeLinkFooter}>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('linkPermissionsModal')}>
										Permissions
									</button>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('linkNotificationsModal')}>
										Alerts
									</button>
									<button className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`} onClick={() => openModal('unlinkAccountModal')}>
										Unlink
									</button>
								</div>
							</div>
						))}
					</div>

					<hr className={styles.divider} />

					<div className="row g-3">
						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, height: '100%' }}>
								<div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-sliders"></i> 20.3.3 — Permission Controls
								</div>
								<div className={styles.presetRow} style={{ borderColor: 'var(--pri)', background: 'var(--success-bg)' }}>
									<i className="bi bi-check-circle-fill" style={{ color: 'var(--pri)', fontSize: 15 }}></i>
									<div>
										<div className={styles.presetName}>Full Inter-Dashboard Access</div>
										<div className={styles.presetDesc}>Enables all visibility & transfer toggles</div>
									</div>
								</div>
								<div className={styles.presetRow}>
									<i className="bi bi-circle" style={{ color: 'var(--ink-300)', fontSize: 15 }}></i>
									<div>
										<div className={styles.presetName}>View Only</div>
										<div className={styles.presetDesc}>Balance visible, no transfers</div>
									</div>
								</div>
								<div className={styles.presetRow}>
									<i className="bi bi-circle" style={{ color: 'var(--ink-300)', fontSize: 15 }}></i>
									<div>
										<div className={styles.presetName}>One-Way In / One-Way Out</div>
										<div className={styles.presetDesc}>Restricted directional transfers</div>
									</div>
								</div>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('linkPermissionsModal')}>
									<i className="bi bi-gear"></i> Customize Presets
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, height: '100%' }}>
								<div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-bell"></i> 20.3.4 — Notification Routing
								</div>
								<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
									<div className={styles.securityRow}>
										<span>Notify on money received</span>
										<span style={{ color: 'var(--success)' }}>On</span>
									</div>
									<div className={styles.securityRow}>
										<span>Balance drop alerts</span>
										<span style={{ color: 'var(--success)' }}>On</span>
									</div>
									<div className={styles.securityRow}>
										<span>Failed transaction alerts</span>
										<span style={{ color: 'var(--ink-500)' }}>Off</span>
									</div>
									<div className={styles.securityRow}>
										<span>Preferred channel</span>
										<span style={{ fontWeight: 600 }}>Push</span>
									</div>
									<div className={styles.securityRow}>
										<span>Quiet hours</span>
										<span style={{ fontWeight: 600 }}>22:00 – 07:00</span>
									</div>
								</div>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('linkNotificationsModal')}>
									<i className="bi bi-sliders"></i> Configure Alerts
								</button>
							</div>
						</div>
						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, height: '100%' }}>
								<div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-unlink"></i> 20.3.5 — Link / Unlink Action Center
								</div>
								<div className={styles.summaryRow}>
									<div>
										<div style={{ fontWeight: 600, fontSize: 12 }}>Unlink account</div>
										<div style={{ fontSize: 10, color: 'var(--ink-500)' }}>Reason + PIN + 24h grace period</div>
									</div>
									<button className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`} onClick={() => openModal('unlinkAccountModal')}>
										Unlink
									</button>
								</div>
								<div className={styles.summaryRow}>
									<div>
										<div style={{ fontWeight: 600, fontSize: 12 }}>Relink recent</div>
										<div style={{ fontSize: 10, color: 'var(--ink-500)' }}>Instant if within 30 days</div>
									</div>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('relinkAccountModal')}>
										Relink
									</button>
								</div>
								<div className={styles.summaryRow}>
									<div>
										<div style={{ fontWeight: 600, fontSize: 12, color: 'var(--danger)' }}>Revoke all access</div>
										<div style={{ fontSize: 10, color: 'var(--ink-500)' }}>PIN + OTP • 72h cooldown</div>
									</div>
									<button className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`} onClick={() => openModal('revokeAllAccessModal')}>
										Revoke
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 20.4 MONEY RELOCATION WIZARD ---------- */}
				<div className={styles.relocationBanner}>
					<div>
						<div className={styles.relocationBannerTitle}>
							<i className="bi bi-arrow-left-right"></i> 20.4 — Money Relocation Wizard
						</div>
						<p className={styles.relocationBannerText}>
							Unlink or revoke an account with a non-zero balance? The 8-step relocation protocol
							moves funds safely: intent → destination → allocation → review & fees → security
							verification → beneficiary check → execution → receipt. Irreversible after
							confirmation.
						</p>
					</div>
					<div className={styles.relocationBannerActions}>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
							onClick={() => openModal('relocationReceiptModal')}
						>
							<i className="bi bi-receipt"></i> Sample Receipt
						</button>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							style={{ background: '#fff', border: 'none', color: '#b45309' }}
							onClick={() => openModal('moneyRelocationModal')}
						>
							<i className="bi bi-arrow-left-right"></i> Launch Wizard
						</button>
					</div>
				</div>

				{/* ---------- 20.5 ACCOUNT SECURITY & SESSION MANAGEMENT ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-shield-lock" style={{ color: 'var(--danger)' }}></i>
								20.5 — Account Security & Session Management
							</h3>
							<p className={styles.sectionSubtitle}>
								Active sessions across dashboards, immutable access logs and cross-dashboard PIN
								& biometric management.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('accessLogsModal')}
							>
								<i className="bi bi-list-check"></i> Logs
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('activeSessionsModal')}
							>
								<i className="bi bi-laptop"></i> Sessions
							</button>
						</div>
					</div>

					<div className="row g-3">
						<div className="col-lg-8">
							<div
								style={{
									background: 'var(--surface-2)',
									border: '1px solid var(--border)',
									borderRadius: 'var(--radius-md)',
									padding: 16,
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
									<h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>20.5.1 — Active Sessions & Devices</h4>
									<span className={`${styles.badge} ${styles.badgeWarning}`}>
										<i className="bi bi-exclamation-triangle"></i> 1 new device
									</span>
								</div>
								<div className={styles.tableWrap}>
									<table className={styles.table}>
										<thead>
											<tr>
												<th>Device</th>
												<th>Dashboard Access</th>
												<th>Last Active</th>
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
													<td>{row.dash}</td>
													<td>{row.lastActive}</td>
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
															<button className={`${styles.button} ${styles.buttonSmall}`}>End Session</button>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div
								style={{
									background: 'var(--surface-2)',
									border: '1px solid var(--border)',
									borderRadius: 'var(--radius-md)',
									padding: 16,
									marginTop: 16,
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
									<h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>20.5.2 — Dashboard Access Logs</h4>
									<span className={`${styles.badge} ${styles.badgeInfo}`}>
										<i className="bi bi-shield-lock"></i> Immutable
									</span>
								</div>
								<div className={styles.tableWrap}>
									<table className={styles.table}>
										<thead>
											<tr>
												<th>Timestamp</th>
												<th>Action</th>
												<th>Dashboard</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{logs.map((row) => (
												<tr key={row.date}>
													<td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
													<td>{row.action}</td>
													<td>{row.dash}</td>
													<td>
														<StatusBadge label={row.status} variant={row.variant} />
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<button
									className={`${styles.button} ${styles.buttonSmall} mt-2`}
									onClick={() => openModal('accessLogsModal')}
								>
									<i className="bi bi-eye"></i> Full Audit Log
								</button>
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
									20.5.3 — PIN & Biometric Management
								</h4>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Cross-dashboard PIN</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>
										<i className="bi bi-check-circle"></i> Set
									</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Biometric activation</span>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>Enabled</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Per-dashboard biometric</span>
									<span className={`${styles.badge} ${styles.badgeOutline}`}>Off</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Emergency (duress) PIN</span>
									<span className={`${styles.badge} ${styles.badgeWarning}`}>Not set</span>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>PIN attempts</span>
									<span style={{ fontWeight: 600, fontSize: 13 }}>0 failed</span>
								</div>
								<div className="mt-2 d-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('changePinModal')}>
										<i className="bi bi-key"></i> Change PIN
									</button>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('pinManagementModal')}>
										<i className="bi bi-fingerprint"></i> Biometrics
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 20.6 USER PROFILE & ACCOUNT CONTROLS ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-person-circle" style={{ color: 'var(--info)' }}></i>
								20.6 — User Profile & Account Controls
							</h3>
							<p className={styles.sectionSubtitle}>
								Profile quick view, logout & session controls, dashboard lifecycle and the
								contextual support & help center.
							</p>
						</div>
						<button
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal('profileQuickViewModal')}
						>
							<i className="bi bi-eye"></i> View Profile
						</button>
					</div>

					<div className="row g-3">
						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, height: '100%' }}>
								<h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
									20.6.1 — Profile Quick View
								</h4>
								<div className={styles.profileStrip}>
									<div className={styles.profileStripAvatar}>AK</div>
									<div>
										<div style={{ fontWeight: 700, fontSize: 15 }}>Amina Grace Kamau</div>
										<div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
											+254 712 345 890 • amina.kamau@personal.co.ke
										</div>
										<div className="mt-1" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												<i className="bi bi-patch-check"></i> Premium
											</span>
											<span className={`${styles.badge} ${styles.badgeInfo}`}>KRA A00•••••89</span>
										</div>
									</div>
								</div>
								<div className={styles.securityRow}>
									<span>Language</span>
									<span style={{ fontWeight: 600 }}>English (UK)</span>
								</div>
								<div className={styles.securityRow}>
									<span>Time zone</span>
									<span style={{ fontWeight: 600 }}>Africa/Nairobi (EAT)</span>
								</div>
								<div className={styles.securityRow}>
									<span>Address</span>
									<span style={{ fontWeight: 600 }}>Lavington Green, Nairobi</span>
								</div>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('profileQuickViewModal')}>
									Full profile
								</button>
							</div>
						</div>

						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, height: '100%' }}>
								<h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
									20.6.2 — Logout & Account Controls
								</h4>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Logout current dashboard</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('logoutCurrentModal')}>
										Logout
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Logout from all dashboards</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('logoutAllModal')}>
										Logout All
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Disable dashboard</span>
									<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('disableDashboardModal')}>
										Disable
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13, color: 'var(--danger)' }}>Close dashboard</span>
									<button className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`} onClick={() => openModal('closeDashboardModal')}>
										Close
									</button>
								</div>
								<div className={styles.summaryRow}>
									<span style={{ fontSize: 13 }}>Auto-logout timer</span>
									<span style={{ fontWeight: 600, fontSize: 13 }}>30 min</span>
								</div>
							</div>
						</div>

						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, height: '100%' }}>
								<h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
									20.6.3 — Support & Help
								</h4>
								<div className={styles.supportItem} onClick={() => openModal('supportHelpModal')}>
									<div className={styles.supportIcon} style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
										<i className="bi bi-link-45deg"></i>
									</div>
									<div style={{ fontSize: 13, fontWeight: 600 }}>Understanding Dashboard Linking</div>
								</div>
								<div className={styles.supportItem} onClick={() => openModal('supportHelpModal')}>
									<div className={styles.supportIcon} style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
										<i className="bi bi-arrow-left-right"></i>
									</div>
									<div style={{ fontSize: 13, fontWeight: 600 }}>How Inter-Dashboard Transfers Work</div>
								</div>
								<div className={styles.supportItem} onClick={() => openModal('supportHelpModal')}>
									<div className={styles.supportIcon} style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
										<i className="bi bi-shield-exclamation"></i>
									</div>
									<div style={{ fontSize: 13, fontWeight: 600 }}>What Happens When I Revoke Access?</div>
								</div>
								<div className={styles.supportItem} onClick={() => openModal('supportHelpModal')}>
									<div className={styles.supportIcon} style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>
										<i className="bi bi-chat-dots"></i>
									</div>
									<div style={{ fontSize: 13, fontWeight: 600 }}>Live chat & emergency hotline</div>
								</div>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('supportHelpModal')}>
									<i className="bi bi-life-preserver"></i> Help Center
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- 20.7 ADVANCED LINKAGE CONFIGURATION ---------- */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-gear-wide-connected" style={{ color: 'var(--purple)' }}></i>
								20.7 — Advanced Linkage Configuration
							</h3>
							<p className={styles.sectionSubtitle}>
								Auto-transfer rules engine, linked account naming & organization and
								cross-dashboard limits & controls.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('accountNamingModal')}
							>
								<i className="bi bi-tags"></i> Naming
							</button>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => openModal('linkLimitsModal')}
							>
								<i className="bi bi-speedometer2"></i> Limits
							</button>
							<button
								className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
								onClick={() => openModal('autoTransferRulesModal')}
							>
								<i className="bi bi-robot"></i> Rules
							</button>
						</div>
					</div>

					<div className="row g-3">
						<div className="col-lg-5">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, height: '100%' }}>
								<div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-robot"></i> 20.7.1 — Auto-Transfer Rules Engine
								</div>
								{rules.map((r) => (
									<div className={styles.ruleCard} key={r.id}>
										<div>
											<div className={styles.ruleName}>
												<i className="bi bi-gear" style={{ color: 'var(--pri)' }}></i>
												{r.name}
												<span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: r.tagCls, color: r.tagColor }}>
													{r.tag}
												</span>
											</div>
											<div className={styles.ruleDesc}>{r.desc}</div>
										</div>
										<span className={`${styles.badge} ${r.active ? styles.badgeSuccess : styles.badgeOutline}`}>
											{r.active ? 'Active' : 'Paused'}
										</span>
									</div>
								))}
								<button className={`${styles.button} ${styles.buttonSmall} mt-1`} onClick={() => openModal('autoTransferRulesModal')}>
									<i className="bi bi-plus-lg"></i> Manage Rules
								</button>
							</div>
						</div>

						<div className="col-lg-3">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, height: '100%' }}>
								<div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-tags"></i> 20.7.2 — Naming & Organization
								</div>
								<div className={styles.securityRow}>
									<span>My Biz Float</span>
									<span style={{ color: 'var(--purple)' }}>
										<i className="bi bi-circle-fill"></i>
									</span>
								</div>
								<div className={styles.securityRow}>
									<span>Rent Savings</span>
									<span style={{ color: 'var(--warning)' }}>
										<i className="bi bi-circle-fill"></i>
									</span>
								</div>
								<div className={styles.securityRow}>
									<span>Main Wallet</span>
									<span style={{ color: 'var(--success)' }}>
										<i className="bi bi-circle-fill"></i>
									</span>
								</div>
								<div className={styles.securityRow}>
									<span>Group</span>
									<span style={{ fontWeight: 600 }}>Business</span>
								</div>
								<div className={styles.securityRow}>
									<span>Priority</span>
									<span style={{ fontWeight: 600 }}>1 — Main Wallet</span>
								</div>
								<button className={`${styles.button} ${styles.buttonSmall} mt-2`} onClick={() => openModal('accountNamingModal')}>
									<i className="bi bi-pencil"></i> Organize
								</button>
							</div>
						</div>

						<div className="col-lg-4">
							<div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, height: '100%' }}>
								<div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', marginBottom: 10 }}>
									<i className="bi bi-speedometer2"></i> 20.7.3 — Cross-Dashboard Limits
								</div>
								<div className={styles.limitBlock}>
									<div className={styles.limitRow}>
										<span>Daily transfer (in/out)</span>
										<span>KES 2M</span>
									</div>
									<div className={styles.progressTrack}>
										<div className={styles.progressBar} style={{ width: '34%' }}></div>
									</div>
								</div>
								<div className={styles.limitBlock}>
									<div className={styles.limitRow}>
										<span>Per-transaction max</span>
										<span>KES 1M</span>
									</div>
									<div className={styles.progressTrack}>
										<div className={styles.progressBar} style={{ width: '22%' }}></div>
									</div>
								</div>
								<div className={styles.limitBlock}>
									<div className={styles.limitRow}>
										<span>Monthly cumulative</span>
										<span>KES 12M</span>
									</div>
									<div className={styles.progressTrack}>
										<div className={styles.progressBar} style={{ width: '41%' }}></div>
									</div>
								</div>
								<div className={styles.limitBlock} style={{ marginBottom: 6 }}>
									<div className={styles.limitRow}>
										<span>Velocity limit</span>
										<span>50 tx / hour</span>
									</div>
								</div>
								<button className={`${styles.button} ${styles.buttonSmall} mt-1`} onClick={() => openModal('linkLimitsModal')}>
									<i className="bi bi-arrow-up"></i> Manage Limits
								</button>
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
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>2 dashboards awaiting activation</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('activateDashboardModal')}>
									Activate
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Crypto Center access suspended</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('accessLogsModal')}>
									Review
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Business Float above threshold</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('autoTransferRulesModal')}>
									Optimize
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Suspicious login — Windows PC</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('activeSessionsModal')}>
									Review
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
								<span style={{ fontSize: 13, fontWeight: 600 }}>Enable balance sweep to savings</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('autoTransferRulesModal')}>
									Enable
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Set per-dashboard biometric for Business</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('pinManagementModal')}>
									Set up
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Review data sharing consent</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('privacyModal')}>
									Review
								</button>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 13, fontWeight: 600 }}>Replay tour for new features</span>
								<button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('tourGuideModal')}>
									Tour
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
									<p className={styles.sectionSubtitle}>Frequent hub tasks</p>
								</div>
							</div>
							<div className={styles.quickGrid}>
								<button className={styles.quickButton} onClick={() => openModal('activateDashboardModal')}>
									<i className="bi bi-stars" style={{ color: 'var(--acc)' }}></i> Activate
								</button>
								<button className={styles.quickButton} onClick={() => openModal('linkAccountModal')}>
									<i className="bi bi-link-45deg" style={{ color: 'var(--success)' }}></i> Link
								</button>
								<button className={styles.quickButton} onClick={() => openModal('activeLinksModal')}>
									<i className="bi bi-layout-three-columns" style={{ color: 'var(--info)' }}></i> Links
								</button>
								<button className={styles.quickButton} onClick={() => openModal('moneyRelocationModal')}>
									<i className="bi bi-arrow-left-right" style={{ color: 'var(--warning)' }}></i> Relocate
								</button>
								<button className={styles.quickButton} onClick={() => openModal('activeSessionsModal')}>
									<i className="bi bi-laptop" style={{ color: 'var(--danger)' }}></i> Sessions
								</button>
								<button className={styles.quickButton} onClick={() => openModal('accessLogsModal')}>
									<i className="bi bi-list-check" style={{ color: 'var(--info)' }}></i> Logs
								</button>
								<button className={styles.quickButton} onClick={() => openModal('autoTransferRulesModal')}>
									<i className="bi bi-robot" style={{ color: 'var(--purple)' }}></i> Rules
								</button>
								<button className={styles.quickButton} onClick={() => openModal('tourGuideModal')}>
									<i className="bi bi-signpost-2" style={{ color: 'var(--pri)' }}></i> Tour
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ==================== MODALS ==================== */}
			<WalletActivationModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
			/>
		</div>
	);
}
