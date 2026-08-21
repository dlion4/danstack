"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import AccountFlowChart from "../components/AccountFlowChart";
import HowItWorks from "../components/HowItWorks";
import ManagementHub from "../components/ManagementHub";
import { WalletActivationModals } from "../modals/WalletActivationModals";
import styles from "../styles/walletActivation.module.css";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const wallet = {
	accountNumber: "PM-4521-8830-1024",
	walletId: "WLT-8H2K-9XQ4",
	holder: "Oscar K. Kasongo",
	initials: "OS",
	tier: "Verified",
	balance: "KES 1,284,300",
	status: "Active",
	opened: "12 January 2023",
	age: "2 years 7 months",
	currencies: ["KES", "USD", "EUR", "GBP"],
};

const dashboards = [
	{
		id: 1,
		name: "Transaction Hub",
		icon: "bi bi-arrow-left-right",
		bg: "var(--success-bg)",
		color: "var(--success)",
		desc: "Payments, P2P & remittances",
		status: "Active",
		variant: "success",
		last: "Today, 14:22",
		action: "Enter",
		modal: "walletHealthModal",
		notify: false,
		route: "/pm/app/transfer-overview",
	},
	{
		id: 2,
		name: "Business Portal",
		icon: "bi bi-briefcase",
		bg: "var(--purple-bg)",
		color: "var(--purple)",
		desc: "Merchant payments, collections & payroll",
		status: "Activation Pending",
		variant: "warning",
		last: "—",
		action: "Activate",
		modal: "activateDashboardModal",
		notify: true,
	},
	{
		id: 3,
		name: "Utilities Hub",
		icon: "bi bi-lightning-charge",
		bg: "var(--warning-bg)",
		color: "var(--warning)",
		desc: "Pay bills, airtime & subscriptions",
		status: "Active",
		variant: "success",
		last: "Yesterday, 18:30",
		action: "Enter",
		modal: "walletHealthModal",
		notify: false,
		route: "/utility",
	},
	{
		id: 4,
		name: "Developer Portal",
		icon: "bi bi-code-slash",
		bg: "var(--info-bg)",
		color: "var(--info)",
		desc: "API keys, webhooks & sandbox",
		status: "Not Activated",
		variant: "grey",
		last: "—",
		action: "Activate",
		modal: "activateDashboardModal",
		notify: false,
	},
	{
		id: 5,
		name: "Loans & Credit",
		icon: "bi bi-cash-stack",
		bg: "var(--info-bg)",
		color: "var(--info)",
		desc: "Personal & business loans",
		status: "Active",
		variant: "success",
		last: "25 Jun, 09:12",
		action: "Enter",
		modal: "activeLinksModal",
		notify: false,
	},
	{
		id: 6,
		name: "Savings & Investments",
		icon: "bi bi-piggy-bank",
		bg: "var(--purple-bg)",
		color: "var(--purple)",
		desc: "MMF, fixed deposits & SACCO",
		status: "Active",
		variant: "success",
		last: "24 Jun, 11:45",
		action: "Enter",
		modal: "activeLinksModal",
		notify: false,
	},
	{
		id: 7,
		name: "Crypto Center",
		icon: "bi bi-currency-bitcoin",
		bg: "var(--danger-bg)",
		color: "var(--danger)",
		desc: "Buy, sell & hold digital assets",
		status: "Suspended",
		variant: "danger",
		last: "20 Jun, 08:00",
		action: "Revoke",
		modal: "revokeAllAccessModal",
		notify: true,
	},
	{
		id: 8,
		name: "Cards Center",
		icon: "bi bi-credit-card-2-front",
		bg: "var(--info-bg)",
		color: "var(--info)",
		desc: "Virtual & physical cards",
		status: "Active",
		variant: "success",
		last: "Today, 11:05",
		action: "Enter",
		modal: "walletHealthModal",
		notify: false,
		route: "/cards/app",
	},
];

const consentItems = [
	{
		name: "Terms of Service",
		desc: "General terms governing use of this PayMo dashboard.",
	},
	{
		name: "Acceptable Use Policy (AUP)",
		desc: "What you can and cannot do with dashboard features.",
	},
	{
		name: "AML Compliance Declaration",
		desc: "You confirm funds are from legitimate sources.",
	},
	{
		name: "CTF Acknowledgment",
		desc: "You agree to flag suspicious transactions.",
	},
	{
		name: "Data Sharing Consent",
		desc: "Allows cross-dashboard balance visibility for linked accounts.",
	},
	{
		name: "Cross-Dashboard Transaction Authorization",
		desc: "Permits transfers between your linked dashboards.",
	},
	{
		name: "Regulatory Compliance Attestation",
		desc: "CBK / KRA / sector-specific compliance confirmation.",
	},
	{
		name: "Fee Schedule & Pricing Acknowledgment",
		desc: "You accept the published fees for this dashboard.",
	},
	{
		name: "Privacy Policy Addendum",
		desc: "Dashboard-specific data processing addendum.",
	},
	{
		name: "Marketing & Promotional Consent (optional)",
		desc: "Optional — not mandatory for activation.",
	},
];

const linkableAccounts = [
	{
		id: 1,
		name: "PayMo Wallet Acc",
		origin: "Transaction Hub",
		icon: "bi bi-wallet2",
		bg: "var(--success-bg)",
		color: "var(--success)",
		number: "•••• 5530",
		balance: "KES 1,284,300",
		status: "Linked",
		variant: "success",
	},
	{
		id: 2,
		name: "Business Acc",
		origin: "Business Portal",
		icon: "bi bi-briefcase",
		bg: "var(--purple-bg)",
		color: "var(--purple)",
		number: "•••• 2207",
		balance: "KES 6,150,000",
		status: "Linked",
		variant: "success",
	},
	{
		id: 3,
		name: "Utility Acc",
		origin: "Savings & Investments",
		icon: "bi bi-piggy-bank",
		bg: "var(--warning-bg)",
		color: "var(--warning)",
		number: "•••• 7793",
		balance: "KES 480,000",
		status: "Linked",
		variant: "success",
	},
	{
		id: 4,
		name: "Loan Acc",
		origin: "Loans & Credit",
		icon: "bi bi-cash-stack",
		bg: "var(--info-bg)",
		color: "var(--info)",
		number: "•••• 8910",
		balance: "KES 0",
		status: "Link Revoked",
		variant: "danger",
	},
	{
		id: 5,
		name: "Developer Acc",
		origin: "Crypto Center",
		icon: "bi bi-currency-bitcoin",
		bg: "var(--danger-bg)",
		color: "var(--danger)",
		number: "•••• 0042",
		balance: "USD 2,410",
		status: "Link Requested",
		variant: "warning",
	},
];

const activeLinks = [
	{
		id: 1,
		name: "PayMo Wallet Acc",
		origin: "Transaction Hub",
		icon: "bi bi-wallet2",
		bg: "var(--success-bg)",
		color: "var(--success)",
		number: "•••• 5530",
		linked: "12 Jan 2023",
		balance: "KES 1,284,300",
		status: "Active" as const,
		permission: "Full Control",
		full: true,
	},
	{
		id: 2,
		name: "Business Acc",
		origin: "Business Portal",
		icon: "bi bi-briefcase",
		bg: "var(--purple-bg)",
		color: "var(--purple)",
		number: "•••• 2207",
		linked: "03 Feb 2024",
		balance: "KES 6,150,000",
		status: "Active" as const,
		permission: "Full Control",
		full: true,
	},
	{
		id: 3,
		name: "Savings Acc",
		origin: "Savings & Investments",
		icon: "bi bi-piggy-bank",
		bg: "var(--warning-bg)",
		color: "var(--warning)",
		number: "•••• 7793",
		linked: "15 Mar 2024",
		balance: "KES 480,000",
		status: "Active" as const,
		permission: "View + Transfer In",
		full: false,
	},
	{
		id: 4,
		name: "Loan Acc",
		origin: "Loans & Credit",
		icon: "bi bi-cash-stack",
		bg: "var(--info-bg)",
		color: "var(--info)",
		number: "•••• 8910",
		linked: "02 Apr 2025",
		balance: "KES 0",
		status: "Paused" as const,
		permission: "View Only",
		full: false,
	},
	{
		id: 5,
		name: "utility Acc",
		origin: "Crypto Center",
		icon: "bi bi-currency-bitcoin",
		bg: "var(--danger-bg)",
		color: "var(--danger)",
		number: "•••• 0042",
		linked: "12 Jun 2025",
		balance: "USD 2,410",
		status: "Active" as const,
		permission: "View + Transfer In",
		full: false,
	},
	{
		id: 6,
		name: "Developer Acc",
		origin: "Savings & Investments",
		icon: "bi bi-graph-up",
		bg: "var(--success-bg)",
		color: "var(--success)",
		number: "•••• 9091",
		linked: "20 Aug 2024",
		balance: "KES 2,100,000",
		status: "Active" as const,
		permission: "One-Way In",
		full: false,
	},
];

const journeySteps = [
	{
		title: "Account Created",
		meta: "PayMo profile onboarded with identity documents",
		date: "12 Jan 2023",
		state: "done",
		icon: "bi bi-person-check",
	},
	{
		title: "KYC Verification",
		meta: "Verified tier — government ID, proof of address & selfie match",
		date: "14 Jan 2023",
		state: "done",
		icon: "bi bi-patch-check",
	},
	{
		title: "Consent Suite Accepted",
		meta: "9 / 9 mandatory consents signed (Terms, AML, CTF, Privacy…)",
		date: "16 Jan 2023",
		state: "done",
		icon: "bi bi-file-earmark-check",
	},
	{
		title: "PIN Confirmed",
		meta: "4-digit PIN + biometric enabled on all activation gates",
		date: "16 Jan 2023",
		state: "done",
		icon: "bi bi-shield-lock",
	},
	{
		title: "Primary Wallet Live",
		meta: "PM-4521-8830-1024 funded & receiving across 4 currencies",
		date: "18 Jan 2023",
		state: "current",
		icon: "bi bi-wallet2",
	},
	{
		title: "Link More Dashboards",
		meta: "4 links active · 2 paused · 1 requested — expand your hub",
		date: "Next step",
		state: "pending",
		icon: "bi bi-link-45deg",
	},
];

const quickActions = [
	{
		modal: "activateDashboardModal",
		icon: "bi bi-stars",
		label: "Activate",
		color: "var(--acc)",
	},
	{
		modal: "linkAccountModal",
		icon: "bi bi-link-45deg",
		label: "Link Account",
		color: "var(--success)",
	},
	{
		modal: "activeLinksModal",
		icon: "bi bi-layout-three-columns",
		label: "Manage Links",
		color: "var(--info)",
	},
	{
		modal: "moneyRelocationModal",
		icon: "bi bi-arrow-left-right",
		label: "Relocate Funds",
		color: "var(--warning)",
	},
	{
		modal: "linkPermissionsModal",
		icon: "bi bi-sliders",
		label: "Permissions",
		color: "var(--purple)",
	},
	{
		modal: "linkNotificationsModal",
		icon: "bi bi-bell",
		label: "Alert Routing",
		color: "var(--danger)",
	},
	{
		modal: "linkLimitsModal",
		icon: "bi bi-speedometer2",
		label: "Limits",
		color: "var(--info)",
	},
	{
		modal: "tourGuideModal",
		icon: "bi bi-signpost-2",
		label: "Guided Tour",
		color: "var(--pri)",
	},
];

const utilActions = [
	{
		modal: "privacyModal",
		icon: "bi bi-shield-check",
		label: "Privacy Center",
	},
	{ modal: "preferencesModal", icon: "bi bi-sliders2", label: "Preferences" },
	{ modal: "supportHelpModal", icon: "bi bi-headset", label: "Support & Help" },
	{
		modal: "relocationReceiptModal",
		icon: "bi bi-receipt",
		label: "Sample Receipt",
	},
	{
		modal: "revokeAllAccessModal",
		icon: "bi bi-x-octagon",
		label: "Revoke All",
	},
	{
		modal: "activationSuccessModal",
		icon: "bi bi-check2-circle",
		label: "Activation Proof",
	},
];

const fetchWalletData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { wallet, dashboards, consentItems, linkableAccounts, activeLinks };
};

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

/** Reveals children with a soft rise-in when they scroll into view. */
function Reveal({
	children,
	className = "",
	delay = 0,
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${className}`}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
		>
			{children}
		</div>
	);
}

/** Counts from 0 → target once visible. */
function useCountUp(target: number, active: boolean, duration = 1100) {
	const [value, setValue] = useState(0);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		if (!active) return;
		const start = performance.now();
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - (1 - t) ** 3;
			setValue(target * eased);
			if (t < 1) rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [active, target, duration]);

	return value;
}

function StatCard({
	label,
	icon,
	iconBg,
	iconColor,
	delta,
	deltaClass,
	format,
	value,
	progress,
	children,
}: {
	label: string;
	icon: string;
	iconBg: string;
	iconColor: string;
	delta: string;
	deltaClass: string;
	format: (v: number) => string;
	value: number;
	progress?: number;
	children?: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);
	const count = useCountUp(value, inView);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.3 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className={styles.statCard}>
			<div className={styles.statCardTop}>
				<div
					className={styles.statCardIcon}
					style={{ background: iconBg, color: iconColor }}
				>
					<i className={icon}></i>
				</div>
				<span className={`${styles.statCardDelta} ${styles[deltaClass] || ""}`}>
					{delta}
				</span>
			</div>
			<p className={styles.statValue}>{format(inView ? count : 0)}</p>
			<p className={styles.statLabel}>{label}</p>
			{children}
			{progress !== undefined && (
				<div className={styles.statCardFoot}>
					<div className={styles.statCardProgress}>
						<div
							className={styles.statCardProgressFill}
							style={inView ? { width: `${progress}%` } : undefined}
						></div>
					</div>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WalletActivation() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [copied, setCopied] = useState(false);

	const openModal = (id: string) =>
		setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) =>
		setModalState((prev) => ({ ...prev, [id]: false }));

	const { data } = useQuery({
		queryKey: ["walletActivationData"],
		queryFn: fetchWalletData,
		initialData: {
			wallet,
			dashboards,
			consentItems,
			linkableAccounts,
			activeLinks,
		},
	});

	const { wallet: w, dashboards: dashList, activeLinks: actLinks } = data;

	const copyAccount = async () => {
		try {
			await navigator.clipboard.writeText(w.accountNumber);
		} catch {
			/* clipboard unavailable — still show feedback */
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	};

	const activeCount = dashList.filter((d) => d.status === "Active").length;
	const pendingCount = dashList.filter(
		(d) => d.status === "Activation Pending" || d.status === "Not Activated",
	).length;
	const suspendedCount = dashList.filter(
		(d) => d.status === "Suspended",
	).length;
	const linkedActive = actLinks.filter((l) => l.status === "Active").length;

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<Link to="/pm/app/transfer-overview">Transactions</Link> /{" "}
						<Link to="/auth/hub">Account</Link> /{" "}
						<strong>Wallet Activation & Cross-Dashboard Hub</strong>
					</div>
					<h1 className={styles.pageTitle}>
						Wallet Activation & Cross-Dashboard Hub
					</h1>
					<p className={styles.pageDescription}>
						Your primary PayMo wallet is the anchor of every dashboard you use.
						Activate services, link accounts, control permissions and move money
						between hubs — all from one command center.
					</p>
				</div>
				<div className={styles.pageActions}>
					<Link
						to="/pm/app/transfer-overview"
						className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
					>
						<i className="bi bi-stars"></i> Go to Dashboard
					</Link>
					<Link
						to="/auth/hub"
						className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
					>
						<i className="bi bi-shield-exclamation"></i> Switch Account
					</Link>
				</div>
			</div>

			{/* ==================== CONTENT ==================== */}
			<div className={styles.contentGrid}>
				{/* ---------- 01 · HERO: WALLET IDENTITY | HOW IT WORKS ---------- */}
				<Reveal>
					<div className={styles.bannerSplit}>
						{/* Left half — wallet identity */}
						<div className={styles.bannerWallet}>
							<div className={styles.bannerWalletGrid}></div>
							<div className={styles.bannerSheen}></div>
							<div className={styles.bannerBubbles}>
								<span
									className={styles.bannerBubble}
									style={{
										width: 46,
										height: 46,
										right: "18%",
										top: "42%",
										animationDelay: "0s",
									}}
								></span>
								<span
									className={styles.bannerBubble}
									style={{
										width: 26,
										height: 26,
										right: "30%",
										top: "58%",
										animationDelay: "1.6s",
									}}
								></span>
								<span
									className={styles.bannerBubble}
									style={{
										width: 14,
										height: 14,
										right: "12%",
										top: "68%",
										animationDelay: "3.1s",
									}}
								></span>
								<span
									className={styles.bannerBubble}
									style={{
										width: 20,
										height: 20,
										right: "24%",
										top: "30%",
										animationDelay: "4.4s",
									}}
								></span>
							</div>

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

							<div className={styles.bannerWalletNumberLabel}>
								Primary Account Number
							</div>
							<div className={styles.bannerWalletNumber}>
								{w.accountNumber}
								<button
									type="button"
									className={styles.bannerWalletCopy}
									title="Copy account number"
									onClick={copyAccount}
								>
									<i
										className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`}
									></i>
								</button>
								{copied && (
									<span className={styles.bannerWalletCopied}>Copied!</span>
								)}
							</div>
							<div className={styles.bannerWalletHolder}>
								<span
									className={styles.badge}
									style={{
										background: "rgba(255,255,255,0.16)",
										color: "#fff",
									}}
								>
									<i className="bi bi-gem"></i> {w.tier} KYC
								</span>
								<span>{w.holder}</span>
								<span className={styles.bannerWalletMeta}>
									<i className="bi bi-qr-code"></i> {w.walletId}
								</span>
							</div>

							<div className={styles.bannerWalletBalanceLabel}>
								Available Balance • {w.currencies.join(" · ")} wallets
							</div>
							<div className={styles.bannerWalletBalance}>{w.balance}</div>

							<div className={styles.bannerWalletActions}>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
									onClick={() => openModal("activateDashboardModal")}
								>
									<i className="bi bi-stars"></i> Activate Dashboard
								</button>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
									onClick={() => openModal("linkAccountModal")}
								>
									<i className="bi bi-link-45deg"></i> Link Account
								</button>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
									onClick={() => openModal("activeLinksModal")}
								>
									<i className="bi bi-layout-three-columns"></i> Manage Links
								</button>
							</div>

							<div className={styles.bannerWalletStats}>
								<div className={styles.bannerWalletStat}>
									Opened<strong>{w.opened}</strong>
								</div>
								<div className={styles.bannerWalletStat}>
									Age<strong>{w.age}</strong>
								</div>
								<div className={styles.bannerWalletStat}>
									Currencies<strong>{w.currencies.length} active</strong>
								</div>
								<div className={styles.bannerWalletStat}>
									KYC Tier<strong>{w.tier}</strong>
								</div>
							</div>
						</div>

						{/* Right half — how it works (video + FAQ) */}
						<HowItWorks openModal={openModal} />
					</div>
				</Reveal>

				{/* ---------- 02 · WALLET PULSE — animated KPI stats ---------- */}
				<Reveal>
					<div className={styles.panel}>
						<div className={styles.panelHead}>
							<div className={styles.panelNo}>01</div>
							<h3 className={styles.panelTitle}>
								<i className="bi bi-activity"></i> Wallet Pulse
							</h3>
							<p className={styles.panelSub}>
								Live snapshot of your activation coverage, cross-dashboard links
								and combined balance.
							</p>
						</div>
						<div className={styles.statsRow}>
							<StatCard
								label="Activated Dashboards"
								icon="bi bi-grid-3x3-gap"
								iconBg="var(--success-bg)"
								iconColor="var(--pri-600)"
								delta={`${activeCount} of ${dashList.length}`}
								deltaClass="deltaUp"
								format={(v) => `${Math.round(v)}`}
								value={activeCount}
								progress={(activeCount / dashList.length) * 100}
							>
								<span className={styles.statCardMeta}>
									{pendingCount} pending · {suspendedCount} suspended
								</span>
							</StatCard>
							<StatCard
								label="Linked Accounts"
								icon="bi bi-link-45deg"
								iconBg="var(--info-bg)"
								iconColor="var(--info)"
								delta={`${linkedActive} active`}
								deltaClass="deltaInfo"
								format={(v) => `${Math.round(v)}`}
								value={actLinks.length}
								progress={(linkedActive / actLinks.length) * 100}
							>
								<span className={styles.statCardMeta}>
									{actLinks.length - linkedActive} paused / requested
								</span>
							</StatCard>
							<StatCard
								label="Combined Linked Balance"
								icon="bi bi-bank"
								iconBg="var(--purple-bg)"
								iconColor="var(--purple)"
								delta="+12% this month"
								deltaClass="deltaUp"
								format={(v) => `KES ${v.toFixed(1)}M`}
								value={8.4}
								progress={86}
							>
								<span className={styles.statCardMeta}>
									Across 6 linked accounts
								</span>
							</StatCard>
							<StatCard
								label="Consent Suite Health"
								icon="bi bi-shield-check"
								iconBg="var(--warning-bg)"
								iconColor="var(--acc)"
								delta="Renews Jan 2027"
								deltaClass="deltaWarn"
								format={(v) => `${Math.round(v)} / 9`}
								value={9}
								progress={100}
							>
								<span className={styles.statCardMeta}>
									All mandatory consents current
								</span>
							</StatCard>
						</div>
					</div>
				</Reveal>

				{/* ---------- 03 · DASHBOARD ACCESS MATRIX ---------- */}
				<Reveal>
					<div className={styles.panel}>
						<div className={styles.panelHead}>
							<div className={styles.panelNo}>02</div>
							<h3 className={styles.panelTitle}>
								<i className="bi bi-grid-1x2"></i> Dashboards & Services
							</h3>
							<p className={styles.panelSub}>
								Every PayMo surface your wallet can power. Activate the ones you
								need, enter the ones already live, and revoke access instantly
								when a service is suspended.
							</p>
							<div className={styles.panelActions}>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
									onClick={() => openModal("activateDashboardModal")}
								>
									<i className="bi bi-plus-lg"></i> Activate New
								</button>
							</div>
						</div>

						<div className={styles.dashboardGrid}>
							{dashList.map((d) => (
								<div className={styles.dashboardCard} key={d.id}>
									<div className={styles.dashboardTop}>
										<div
											className={styles.dashboardIcon}
											style={{ background: d.bg, color: d.color }}
										>
											<i className={d.icon}></i>
										</div>
										{d.notify ? (
											<span
												className={styles.notifDot}
												title="Action needed"
											></span>
										) : (
											<span className={styles.dashboardLast}>
												<i className="bi bi-clock-history"></i> {d.last}
											</span>
										)}
									</div>
									<div className={styles.dashboardName}>{d.name}</div>
									<div className={styles.dashboardDesc}>{d.desc}</div>
									<span
										className={`${styles.dashboardStatus} ${
											d.variant === "success"
												? styles.badgeSuccess
												: d.variant === "warning"
													? styles.badgeWarning
													: d.variant === "danger"
														? styles.badgeDanger
														: styles.badgeGrey
										}`}
									>
										<i
											className={`bi ${
												d.variant === "success"
													? "bi-check-circle"
													: d.variant === "warning"
														? "bi-hourglass-split"
														: d.variant === "danger"
															? "bi-exclamation-octagon"
															: "bi-circle"
											}`}
										></i>
										{d.status}
									</span>
									<div className={styles.dashboardActions}>
										{d.route && d.status === "Active" ? (
											<Link
												to={d.route}
												className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
											>
												<i className="bi bi-box-arrow-in-right"></i> Enter
											</Link>
										) : (
											<button
												type="button"
												className={`${styles.button} ${
													d.action === "Revoke"
														? styles.buttonDanger
														: styles.buttonPrimary
												} ${styles.buttonSmall}`}
												onClick={() => openModal(d.modal)}
											>
												<i
													className={`bi ${
														d.action === "Revoke"
															? "bi-x-octagon"
															: d.action === "Activate"
																? "bi-stars"
																: "bi-box-arrow-in-right"
													}`}
												></i>
												{d.action}
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</Reveal>

				{/* ---------- 04 · LIVE ACCOUNT FLOW (animated left-to-right visualizer) ---------- */}
				<Reveal>
					<AccountFlowChart links={actLinks} openModal={openModal} />
				</Reveal>

				{/* ---------- 05 · MANAGEMENT HUB ---------- */}
				<Reveal>
					<div className={styles.panel}>
						<div className={styles.panelHead}>
							<div className={styles.panelNo}>04</div>
							<h3 className={styles.panelTitle}>
								<i className="bi bi-grid-3x3-gap"></i> Management Hub
							</h3>
							<p className={styles.panelSub}>
								Every cross-dashboard task opens as a modal or guided wizard —
								pick one below and the full experience launches instantly. No
								scrolling needed.
							</p>
						</div>
						<ManagementHub openModal={openModal} />
					</div>
				</Reveal>

				{/* ---------- 06 · ACTIVATION JOURNEY (animated timeline) ---------- */}
				<JourneySection openModal={openModal} />

				{/* ---------- 07 · QUICK ACTIONS ---------- */}
				<Reveal>
					<div className={styles.panel}>
						<div className={styles.panelHead}>
							<div className={styles.panelNo}>06</div>
							<h3 className={styles.panelTitle}>
								<i className="bi bi-lightning-charge"></i> Quick Actions
							</h3>
							<p className={styles.panelSub}>
								Frequent hub tasks — one tap, no navigation.
							</p>
						</div>
						<div className={styles.quickGrid}>
							{quickActions.map((qa) => (
								<button
									type="button"
									key={qa.modal}
									className={styles.quickButton}
									onClick={() => openModal(qa.modal)}
								>
									<i className={qa.icon} style={{ color: qa.color }}></i>{" "}
									{qa.label}
								</button>
							))}
						</div>
					</div>
				</Reveal>

				{/* ---------- 08 · SECURITY, PRIVACY & SUPPORT ---------- */}
				<Reveal>
					<div className={styles.panel}>
						<div className={styles.panelHead}>
							<div className={styles.panelNo}>07</div>
							<h3 className={styles.panelTitle}>
								<i className="bi bi-shield-lock"></i> Security, Privacy &
								Support
							</h3>
							<p className={styles.panelSub}>
								Your activation consents, preferences, limits and support
								channels — everything that keeps the hub safe, in one strip.
							</p>
						</div>
						<div className={styles.utilStrip}>
							{utilActions.map((u) => (
								<button
									type="button"
									key={u.modal}
									className={styles.utilItem}
									onClick={() => openModal(u.modal)}
								>
									<i className={u.icon}></i> {u.label}
								</button>
							))}
						</div>
					</div>
				</Reveal>
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

/* ------------------------------------------------------------------ */
/*  Activation Journey — animated timeline                             */
/* ------------------------------------------------------------------ */

function JourneySection({ openModal }: { openModal: (id: string) => void }) {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<Reveal>
			<div
				ref={ref}
				className={`${styles.panel} ${styles.journeyCard} ${inView ? styles.journeyInView : ""}`}
			>
				<div className={styles.panelHead}>
					<div className={styles.panelNo}>05</div>
					<h3 className={styles.panelTitle}>
						<i className="bi bi-signpost-split"></i> Activation Journey
					</h3>
					<p className={styles.panelSub}>
						Every milestone your wallet has passed on the way to becoming the
						anchor of your cross-dashboard hub.
					</p>
					<div className={styles.panelActions}>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonSmall}`}
							onClick={() => openModal("tourGuideModal")}
						>
							<i className="bi bi-play-circle"></i> Replay
						</button>
					</div>
				</div>

				<div className={styles.journeyTrack}>
					{journeySteps.map((step) => (
						<div
							key={step.title}
							className={`${styles.journeyStep} ${
								step.state === "done"
									? styles.journeyStepDone
									: step.state === "current"
										? styles.journeyStepCurrent
										: styles.journeyStepPending
							}`}
						>
							<span className={styles.journeyDot}>
								<i
									className={`bi ${step.state === "pending" ? "bi-dot" : step.icon}`}
								></i>
							</span>
							<div className={styles.journeyStepBody}>
								<div>
									<div className={styles.journeyStepTitle}>
										{step.title}
										{step.state === "current" && (
											<span
												className={styles.journeyStepChip}
												style={{
													background: "var(--success-bg)",
													color: "var(--pri-700)",
												}}
											>
												<i className="bi bi-arrow-repeat"></i> In progress
											</span>
										)}
										{step.state === "pending" && (
											<span
												className={styles.journeyStepChip}
												style={{
													background: "var(--ink-100)",
													color: "var(--ink-500)",
												}}
											>
												<i className="bi bi-hourglass-split"></i> Up next
											</span>
										)}
									</div>
									<div className={styles.journeyStepMeta}>{step.meta}</div>
								</div>
								<span className={styles.journeyStepDate}>{step.date}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</Reveal>
	);
}
