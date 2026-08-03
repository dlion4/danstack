'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { WalletActivationModals } from '../modals/WalletActivationModals';
import AccountFlowChart from '../components/AccountFlowChart';
import HowItWorks from '../components/HowItWorks';
import ManagementHub from '../components/ManagementHub';
import styles from '../styles/walletActivation.module.css';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const wallet = {
	accountNumber: 'PM-4521-8830-1024',
	walletId: 'WLT-8H2K-9XQ4',
	holder: 'Oscar K. Kasongo',
	initials: 'OS',
	tier: 'Verified',
	balance: 'KES 1,284,300',
	status: 'Active',
	opened: '12 January 2023',
	age: '2 years 7 months',
	currencies: ['KES', 'USD', 'EUR', 'GBP'],


};



const dashboards = [
	{ id: 1, name: 'Transaction Hub', icon: 'bi bi-arrow-left-right', bg: 'var(--success-bg)', color: 'var(--success)', desc: 'Payments, P2P & remittances', status: 'Active', variant: 'success', last: 'Today, 14:22', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 2, name: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', desc: 'Merchant payments, collections & payroll', status: 'Activation Pending', variant: 'warning', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: true },
	{ id: 3, name: 'Utilities Hub', icon: 'bi bi-lightning-charge', bg: 'var(--warning-bg)', color: 'var(--warning)', desc: 'Pay bills, airtime & subscriptions', status: 'Active', variant: 'success', last: 'Yesterday, 18:30', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 4, name: 'Developer Portal', icon: 'bi bi-code-slash', bg: 'var(--info-bg)', color: 'var(--info)', desc: 'API keys, webhooks & sandbox', status: 'Not Activated', variant: 'grey', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: false },
	{ id: 5, name: 'Loans & Credit', icon: 'bi bi-cash-stack', bg: 'var(--info-bg)', color: 'var(--info)', desc: 'Personal & business loans', status: 'Active', variant: 'success', last: '25 Jun, 09:12', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 6, name: 'Savings & Investments', icon: 'bi bi-piggy-bank', bg: 'var(--purple-bg)', color: 'var(--purple)', desc: 'MMF, fixed deposits & SACCO', status: 'Active', variant: 'success', last: '24 Jun, 11:45', action: 'Enter', modal: 'walletHealthModal', notify: false },
	{ id: 7, name: 'Crypto Center', icon: 'bi bi-currency-bitcoin', bg: 'var(--danger-bg)', color: 'var(--danger)', desc: 'Buy, sell & hold digital assets', status: 'Suspended', variant: 'danger', last: '20 Jun, 08:00', action: 'Revoke', modal: 'accessLogsModal', notify: true },
	{ id: 8, name: 'Cards Center', icon: 'bi bi-credit-card-2-front', bg: 'var(--info-bg)', color: 'var(--info)', desc: 'Virtual & physical cards', status: 'Active', variant: 'success', last: 'Today, 11:05', action: 'Enter', modal: 'walletHealthModal', notify: false },
	// { id: 9, name: 'Insurance Hub', icon: 'bi bi-shield-plus', bg: 'var(--success-bg)', color: 'var(--success)', desc: 'Motor, health & device cover', status: 'Not Activated', variant: 'grey', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: false },
	// { id: 10, name: 'Government Services', icon: 'bi bi-building', bg: 'var(--warning-bg)', color: 'var(--warning)', desc: 'Rates, licences & eCitizen', status: 'Activation Pending', variant: 'warning', last: '—', action: 'Activate', modal: 'activateDashboardModal', notify: true },
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
	{ id: 1, name: 'PayMo Wallet Acc', origin: 'Transaction Hub', icon: 'bi bi-wallet2', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 5530', balance: 'KES 1,284,300', status: 'Linked', variant: 'success' },
	{ id: 2, name: 'Business Acc', origin: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', number: '•••• 2207', balance: 'KES 6,150,000', status: 'Linked', variant: 'success' },
	{ id: 3, name: 'Utility Acc', origin: 'Savings & Investments', icon: 'bi bi-piggy-bank', bg: 'var(--warning-bg)', color: 'var(--warning)', number: '•••• 7793', balance: 'KES 480,000', status: 'Linked', variant: 'success' },
	{ id: 4, name: 'Loan Acc', origin: 'Loans & Credit', icon: 'bi bi-cash-stack', bg: 'var(--info-bg)', color: 'var(--info)', number: '•••• 8910', balance: 'KES 0', status: 'Link Revoked', variant: 'danger' },
	{ id: 5, name: 'Developer Acc', origin: 'Crypto Center', icon: 'bi bi-currency-bitcoin', bg: 'var(--danger-bg)', color: 'var(--danger)', number: '•••• 0042', balance: 'USD 2,410', status: 'Link Requested', variant: 'warning' },
];

const activeLinks = [
	{ id: 1, name: 'PayMo Wallet Acc', origin: 'Transaction Hub', icon: 'bi bi-wallet2', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 5530', linked: '12 Jan 2023', balance: 'KES 1,284,300', status: 'Active', permission: 'Full Control', full: true },
	{ id: 2, name: 'Business Acc', origin: 'Business Portal', icon: 'bi bi-briefcase', bg: 'var(--purple-bg)', color: 'var(--purple)', number: '•••• 2207', linked: '03 Feb 2024', balance: 'KES 6,150,000', status: 'Active', permission: 'Full Control', full: true },
	{ id: 3, name: 'Savings Acc', origin: 'Savings & Investments', icon: 'bi bi-piggy-bank', bg: 'var(--warning-bg)', color: 'var(--warning)', number: '•••• 7793', linked: '15 Mar 2024', balance: 'KES 480,000', status: 'Active', permission: 'View + Transfer In', full: false },
	{ id: 4, name: 'Loan Acc', origin: 'Loans & Credit', icon: 'bi bi-cash-stack', bg: 'var(--info-bg)', color: 'var(--info)', number: '•••• 8910', linked: '02 Apr 2025', balance: 'KES 0', status: 'Paused', permission: 'View Only', full: false },
	{ id: 5, name: 'utility Acc', origin: 'Crypto Center', icon: 'bi bi-currency-bitcoin', bg: 'var(--danger-bg)', color: 'var(--danger)', number: '•••• 0042', linked: '12 Jun 2025', balance: 'USD 2,410', status: 'Active', permission: 'View + Transfer In', full: false },
	{ id: 6, name: 'Developer Acc', origin: 'Savings & Investments', icon: 'bi bi-graph-up', bg: 'var(--success-bg)', color: 'var(--success)', number: '•••• 9091', linked: '20 Aug 2024', balance: 'KES 2,100,000', status: 'Active', permission: 'One-Way In', full: false },
];




const fetchWalletData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { wallet, dashboards, consentItems, linkableAccounts, activeLinks, };
};

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
		initialData: { wallet, dashboards, consentItems, linkableAccounts, activeLinks, },
	});

	const { wallet: w, activeLinks: actLinks } = data;

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Account</a> /{' '}
						<strong>Wallet Activation & Cross-Dashboard Hub</strong>
					</div>
					{/* // <h1 className={styles.pageTitle}>Wallet Activation & Cross-Dashboard Hub</h1> */}

				</div>
				<div className={styles.pageActions}>
					{/* <button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('walletCardModal')}
					>
						<i className="bi bi-wallet2"></i> My Wallet
					</button> */}
					{/* <button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('linkAccountModal')}
					>
						<i className="bi bi-link-45deg"></i> Link Account
					</button> */}
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


						<ManagementHub openModal={openModal} />



					</div>

					{/* Right half — how it works (video + FAQ) */}
					<HowItWorks openModal={openModal} />
				</div>

				{/* ---------- LIVE ACCOUNT FLOW (dynamic left-to-right visualizer) ---------- */}
				<AccountFlowChart links={actLinks} openModal={openModal} />

				{/* ---------- MANAGEMENT HUB (everything else lives in modals/wizards) ---------- */}


				{/* ---------- QUICK ACTIONS STRIP ---------- */}
				{/* <div className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h3 className={styles.sectionTitle}>
								<i className="bi bi-bolt" style={{ color: 'var(--acc)' }}></i>
								Quick Actions
							</h3>
							<p className={styles.sectionSubtitle}>Frequent hub tasks — one tap, no navigation</p>
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
				</div> */}
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
