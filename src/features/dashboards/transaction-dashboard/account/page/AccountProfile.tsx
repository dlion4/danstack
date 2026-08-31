"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import type {
	AttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import AccountProfileModals from "../modals/AccountProfileModals";
import styles from "../styles/accountProfile.module.css";

/* ============================================================================
   PayMo BaaS — Account Profile & Digital Bank
   Business-dashboard design language (navy/emerald, Sora + Inter, 16px cards).
   The shared AppShell owns sidebar/topbar/breadcrumb/profile — this page only
   renders its own hero + sections + modals.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

/* ---------------------------------------------------------------------------
   Mock data — identical shape to the legacy page (kept for content parity)
   ------------------------------------------------------------------------- */
const profile = {
	fullName: "Amina Grace Kamau",
	preferredName: "Amina K.",
	initials: "AK",
	dob: "14 Mar 1992",
	gender: "Female",
	nationality: "Kenyan",
	idNumber: "32****891",
	idType: "National ID",
	memberSince: "Jan 2023",
	joined: "12 January 2023",
	primaryEmail: "amina.kamau@personal.co.ke",
	workEmail: "amina@company.co.ke",
	primaryPhone: "+254 712 345 890",
	secondaryPhone: null,
	address: "Apt 3A, Lavington Green, Nairobi",
	postal: "P.O. Box 4521-00100, Nairobi",
	language: "English",
	timeZone: "Africa/Nairobi (EAT)",
	tier: "Premium",
	profileCompletion: 98,
	healthScore: 92,
};

const accounts = [
	{
		id: 1,
		name: "PayMo KES Wallet",
		number: "•••• 8842",
		balance: "KES 1,284,300",
		currency: "KES",
		letter: "P",
		gradient: "linear-gradient(135deg,#10b981,#059669)",
		status: "Active",
		verified: true,
		dailyUsed: 64,
		group: "KES",
	},
	{
		id: 2,
		name: "PayMo USD Account",
		number: "•••• 5510",
		balance: "USD 2,410.80",
		currency: "USD",
		letter: "$",
		gradient: "linear-gradient(135deg,#1e293b,#334155)",
		status: "Active",
		verified: true,
		dailyUsed: 12,
		group: "USD",
	},
	{
		id: 3,
		name: "PayMo Business Account",
		number: "•••• 2207",
		balance: "KES 6,150,000",
		currency: "KES",
		letter: "B",
		gradient: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
		status: "Active",
		verified: true,
		dailyUsed: 38,
		group: "Business",
	},
	{
		id: 4,
		name: "PayMo Savings Goal",
		number: "•••• 7793",
		balance: "KES 480,000",
		currency: "KES",
		letter: "S",
		gradient: "linear-gradient(135deg,#b45309,#f59e0b)",
		status: "Frozen",
		verified: false,
		dailyUsed: 0,
		group: "KES",
	},
];

const cards = [
	{
		id: 1,
		number: "•••• •••• •••• 4412",
		holder: "AMINA KAMAU",
		expiry: "08/27",
		variant: "cardGradient1",
		type: "Visa Virtual",
		status: "Active",
	},
	{
		id: 2,
		number: "•••• •••• •••• 8820",
		holder: "AMINA KAMAU",
		expiry: "05/28",
		variant: "cardGradient2",
		type: "Mastercard Physical",
		status: "Frozen",
	},
	{
		id: 3,
		number: "•••• •••• •••• 3305",
		holder: "AMINA KAMAU",
		expiry: "11/26",
		variant: "cardGradient3",
		type: "Visa Business",
		status: "Active",
	},
	{
		id: 4,
		number: "•••• •••• •••• 9908",
		holder: "AMINA KAMAU",
		expiry: "03/27",
		variant: "cardGradient4",
		type: "Prepaid Travel",
		status: "Active",
	},
];

const activity = [
	{
		icon: "bi-arrow-down-left",
		iconBg: "var(--pm-green-soft)",
		iconColor: "var(--pm-green-dark)",
		title: "Received KES 125,000",
		desc: "From PayMo KES Wallet • PesaLink",
		time: "Today, 14:22",
		amount: "+KES 125,000",
	},
	{
		icon: "bi-credit-card",
		iconBg: "var(--pm-blue-soft)",
		iconColor: "var(--pm-blue)",
		title: "Virtual card purchase",
		desc: "Netflix subscription • Card •••• 4412",
		time: "Today, 11:05",
		amount: "-KES 1,200",
	},
	{
		icon: "bi-shield-check",
		iconBg: "var(--pm-violet-soft)",
		iconColor: "var(--pm-violet)",
		title: "2FA backup codes regenerated",
		desc: "Security event • 2FA authenticator",
		time: "Yesterday, 18:40",
		amount: "",
	},
	{
		icon: "bi-arrow-up-right",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "#b54708",
		title: "Sent KES 25,000",
		desc: "To Equity Bank •••• 4521",
		time: "25 Jun, 09:12",
		amount: "-KES 25,000",
	},
	{
		icon: "bi-phone",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "New device login",
		desc: "Windows PC • Chrome • Nairobi",
		time: "26 Jun, 07:58",
		amount: "",
	},
];

const transactionLimits = [
	{
		id: 1,
		account: "PayMo KES Wallet",
		type: "Primary",
		dailyLimit: 500000,
		dailyUsed: 320000,
		monthlyLimit: 2000000,
		monthlyUsed: 1284300,
		status: "Active",
	},
	{
		id: 2,
		account: "Utility Account",
		type: "Sub-account",
		dailyLimit: 200000,
		dailyUsed: 45000,
		monthlyLimit: 800000,
		monthlyUsed: 320000,
		status: "Active",
	},
	{
		id: 3,
		account: "Services Account",
		type: "Sub-account",
		dailyLimit: 300000,
		dailyUsed: 180000,
		monthlyLimit: 1200000,
		monthlyUsed: 540000,
		status: "Active",
	},
	{
		id: 4,
		account: "PayMo USD Account",
		type: "Multi-currency",
		dailyLimit: 10000,
		dailyUsed: 1200,
		monthlyLimit: 50000,
		monthlyUsed: 8500,
		status: "Active",
	},
];

const businessAccounts = [
	{
		id: 1,
		name: "TechVentures Ltd",
		accountNumber: "•••• 4521",
		balance: "KES 2,450,000",
		dailyLimit: 5000000,
		dailyUsed: 1200000,
		status: "Active",
		tier: "Business Plus",
	},
	{
		id: 2,
		name: "GreenGrocery Co",
		accountNumber: "•••• 8832",
		balance: "KES 890,000",
		dailyLimit: 2000000,
		dailyUsed: 450000,
		status: "Active",
		tier: "Business Standard",
	},
	{
		id: 3,
		name: "Swift Logistics",
		accountNumber: "•••• 2210",
		balance: "KES 1,120,000",
		dailyLimit: 3000000,
		dailyUsed: 890000,
		status: "Active",
		tier: "Business Plus",
	},
];

const externalAccounts = [
	{
		id: 1,
		type: "Bank",
		name: "Equity Bank",
		accountNumber: "•••• 4521",
		currency: "KES",
		status: "Verified",
		lastUsed: "Today, 14:22",
		isDefault: true,
	},
	{
		id: 2,
		type: "Bank",
		name: "KCB Bank",
		accountNumber: "•••• 7782",
		currency: "KES",
		status: "Verified",
		lastUsed: "25 Jun 2025",
		isDefault: false,
	},
	{
		id: 3,
		type: "Mobile Money",
		name: "M-Pesa",
		accountNumber: "0712 345 890",
		currency: "KES",
		status: "Verified",
		lastUsed: "Yesterday, 09:10",
		isDefault: false,
	},
	{
		id: 4,
		type: "Mobile Money",
		name: "Airtel Money",
		accountNumber: "0733 456 789",
		currency: "KES",
		status: "Verified",
		lastUsed: "20 Jun 2025",
		isDefault: false,
	},
	{
		id: 5,
		type: "Bank",
		name: "Standard Chartered",
		accountNumber: "•••• 9932",
		currency: "USD",
		status: "Pending",
		lastUsed: "Never",
		isDefault: false,
	},
];

const autoPayouts = [
	{
		id: 1,
		name: "Daily Sweep to Equity",
		type: "Daily",
		amount: "KES 100,000",
		destination: "Equity Bank •••• 4521",
		status: "Active",
		nextRun: "Today, 18:00",
	},
	{
		id: 2,
		name: "Weekly Business Transfer",
		type: "Weekly",
		amount: "KES 250,000",
		destination: "TechVentures Ltd",
		status: "Active",
		nextRun: "Monday, 09:00",
	},
	{
		id: 3,
		name: "Instant Client Payouts",
		type: "Instant",
		amount: "100% of collections",
		destination: "M-Pesa 0712 345 890",
		status: "Active",
		nextRun: "Real-time",
	},
	{
		id: 4,
		name: "Monthly Savings",
		type: "Monthly",
		amount: "KES 50,000",
		destination: "PayMo Savings Goal",
		status: "Paused",
		nextRun: "Paused",
	},
];

const securityLimits = [
	{
		id: 1,
		transferType: "Internal PayMo Transfer",
		threshold: 500000,
		requiresOTP: true,
		otpMethod: "WhatsApp",
		status: "Active",
	},
	{
		id: 2,
		transferType: "External Bank Transfer",
		threshold: 100000,
		requiresOTP: true,
		otpMethod: "SMS + WhatsApp",
		status: "Active",
	},
	{
		id: 3,
		transferType: "Mobile Money Transfer",
		threshold: 50000,
		requiresOTP: true,
		otpMethod: "SMS",
		status: "Active",
	},
	{
		id: 4,
		transferType: "International Transfer",
		threshold: 10000,
		requiresOTP: true,
		otpMethod: "SMS + WhatsApp + Email",
		status: "Active",
	},
	{
		id: 5,
		transferType: "Bill Payment",
		threshold: 200000,
		requiresOTP: false,
		otpMethod: "—",
		status: "Disabled",
	},
];

const countryRestrictions = [
	{
		id: 1,
		country: "Kenya",
		code: "KE",
		status: "Allowed",
		verification: "None",
		transferLimit: "Unlimited",
	},
	{
		id: 2,
		country: "Uganda",
		code: "UG",
		status: "Allowed",
		verification: "KYC Required",
		transferLimit: "KES 500,000",
	},
	{
		id: 3,
		country: "Tanzania",
		code: "TZ",
		status: "Allowed",
		verification: "KYC Required",
		transferLimit: "KES 500,000",
	},
	{
		id: 4,
		country: "Rwanda",
		code: "RW",
		status: "Allowed",
		verification: "KYC Required",
		transferLimit: "KES 300,000",
	},
	{
		id: 5,
		country: "United States",
		code: "US",
		status: "Restricted",
		verification: "Enhanced KYC + KRA",
		transferLimit: "KES 1,000,000",
	},
	{
		id: 6,
		country: "United Kingdom",
		code: "GB",
		status: "Restricted",
		verification: "Enhanced KYC + KRA",
		transferLimit: "KES 1,000,000",
	},
	{
		id: 7,
		country: "United Arab Emirates",
		code: "AE",
		status: "Blocked",
		verification: "Not permitted",
		transferLimit: "KES 0",
	},
];

const riskMitigation = [
	{
		id: 1,
		threshold: 1000000,
		currency: "KES",
		requirement: "KYC Verification",
		status: "Active",
		appliesTo: "All transfers",
	},
	{
		id: 2,
		threshold: 1000000,
		currency: "KES",
		requirement: "KRA PIN Verification",
		status: "Active",
		appliesTo: "Business transfers",
	},
	{
		id: 3,
		threshold: 5000000,
		currency: "KES",
		requirement: "Source of Funds Declaration",
		status: "Active",
		appliesTo: "International transfers",
	},
	{
		id: 4,
		threshold: 10000000,
		currency: "KES",
		requirement: "Manual Compliance Review",
		status: "Active",
		appliesTo: "All transfers",
	},
];

const transactionNotifications = [
	{
		id: 1,
		event: "All Transactions",
		channels: ["SMS", "Email", "WhatsApp", "Push"],
		status: "Enabled",
	},
	{
		id: 2,
		event: "High-Value Transfers (>KES 100,000)",
		channels: ["SMS", "WhatsApp", "Email"],
		status: "Enabled",
	},
	{
		id: 3,
		event: "International Transfers",
		channels: ["SMS", "Email"],
		status: "Enabled",
	},
	{
		id: 4,
		event: "Failed Transactions",
		channels: ["SMS", "Email", "Push"],
		status: "Enabled",
	},
	{
		id: 5,
		event: "Limit Reached Warnings",
		channels: ["Push", "Email"],
		status: "Enabled",
	},
	{
		id: 6,
		event: "Security Alerts",
		channels: ["SMS", "WhatsApp", "Email", "Push"],
		status: "Enabled",
	},
];

const feeStructure = [
	{
		id: 1,
		type: "PayMo to PayMo",
		fee: "FREE",
		description: "Instant transfers between PayMo accounts",
	},
	{
		id: 2,
		type: "PayMo to M-Pesa",
		fee: "KES 25",
		description: "Standard mobile money withdrawal",
	},
	{
		id: 3,
		type: "PayMo to Airtel Money",
		fee: "KES 25",
		description: "Standard mobile money withdrawal",
	},
	{
		id: 4,
		type: "PayMo to Bank (Local)",
		fee: "KES 50",
		description: "Instant bank transfer (PesaLink)",
	},
	{
		id: 5,
		type: "PayMo to Bank (International)",
		fee: "1.5%",
		description: "SWIFT transfer (min KES 500)",
	},
	{
		id: 6,
		type: "Bill Payment",
		fee: "KES 10",
		description: "Utility and service bill payments",
	},
	{
		id: 7,
		type: "Card Purchase",
		fee: "0.5%",
		description: "Virtual/physical card transactions",
	},
];

const accountHierarchy = [
	{
		id: 1,
		name: "PayMo KES Wallet (Primary)",
		balance: "KES 1,284,300",
		type: "Primary",
		children: ["Utility Account", "Services Account"],
	},
	{
		id: 2,
		name: "Utility Account",
		balance: "KES 150,000",
		type: "Sub-account",
		parent: "PayMo KES Wallet",
		fundingSource: "Auto-draw from primary",
	},
	{
		id: 3,
		name: "Services Account",
		balance: "KES 85,000",
		type: "Sub-account",
		parent: "PayMo KES Wallet",
		fundingSource: "Auto-draw from primary",
	},
	{
		id: 4,
		name: "PayMo USD Account",
		balance: "USD 2,410.80",
		type: "Multi-currency",
		parent: "—",
		fundingSource: "Manual funding",
	},
	{
		id: 5,
		name: "PayMo Business Account",
		balance: "KES 6,150,000",
		type: "Business",
		parent: "—",
		fundingSource: "Independent",
	},
];

const linkedBusinesses = [
	{
		id: 1,
		name: "TechVentures Ltd",
		type: "Online Business",
		domain: "techventures.co.ke",
		dateRegistered: "15 Jan 2023",
		documents: [
			"Certificate of Incorporation",
			"KRA PIN Certificate",
			"Director IDs",
			"Business Permit",
		],
		region: "Nairobi (Westlands)",
		status: "Verified",
		tier: "Business Plus",
	},
	{
		id: 2,
		name: "GreenGrocery Co",
		type: "Local Shop",
		domain: "N/A",
		dateRegistered: "08 Mar 2023",
		documents: [
			"Business Registration",
			"KRA PIN Certificate",
			"Trade License",
			"Health Certificate",
		],
		region: "Nairobi (Kilimani)",
		status: "Verified",
		tier: "Business Standard",
	},
	{
		id: 3,
		name: "Swift Logistics",
		type: "Transport Services",
		domain: "swiftlogistics.ke",
		dateRegistered: "22 May 2023",
		documents: [
			"Certificate of Incorporation",
			"KRA PIN Certificate",
			"NTSA License",
			"Insurance Certificate",
		],
		region: "Nairobi (Industrial Area)",
		status: "Verified",
		tier: "Business Plus",
	},
	{
		id: 4,
		name: "All Furniture Kenya",
		type: "Local Shop",
		domain: "allfurniture.co.ke",
		dateRegistered: "10 Sep 2023",
		documents: [
			"Business Registration",
			"KRA PIN Certificate",
			"Trade License",
			"Fire Safety Certificate",
		],
		region: "Mombasa (Nyali)",
		status: "Verified",
		tier: "Business Standard",
	},
];

const fetchProfileData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return {
		profile,
		accounts,
		cards,
		activity,
		transactionLimits,
		businessAccounts,
		externalAccounts,
		autoPayouts,
		securityLimits,
		countryRestrictions,
		riskMitigation,
		transactionNotifications,
		feeStructure,
		accountHierarchy,
		linkedBusinesses,
	};
};

/* ---------------------------------------------------------------------------
   Small presentational helpers
   ------------------------------------------------------------------------- */
function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
	return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

function SectionHeading({
	index,
	title,
	sub,
	actions,
}: {
	index: string;
	title: string;
	sub: string;
	actions?: ReactNode;
}) {
	return (
		<div className={styles.sectionHeading}>
			<div className={styles.sectionHeadingCopy}>
				<span className={styles.sectionIndex} aria-hidden="true">
					{index}
				</span>
				<div>
					<h2>{title}</h2>
					<p>{sub}</p>
				</div>
			</div>
			{actions ? <div className={styles.sectionAction}>{actions}</div> : null}
		</div>
	);
}

/* ---------------------------------------------------------------------------
   Action centre data
   ------------------------------------------------------------------------- */
const accountAttention: AttentionItem[] = [
	{
		icon: "bi-exclamation-circle",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "Daily limit 64% used",
		sub: "KES 320,000 / 500,000 · 18:00 reset",
		actionLabel: "Manage",
		modal: "transactionLimitsModal",
	},
	{
		icon: "bi-clock",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "#b54708",
		title: "External account pending",
		sub: "Standard Chartered USD awaiting verification",
		actionLabel: "Verify",
		modal: "externalAccountsModal",
	},
	{
		icon: "bi-shield-exclamation",
		iconBg: "var(--pm-blue-soft)",
		iconColor: "var(--pm-blue)",
		title: "OTP threshold review",
		sub: "International transfers set at KES 10,000",
		actionLabel: "Adjust",
		modal: "securityLimitsModal",
	},
];

const accountSuggestions: AttentionItem[] = [
	{
		icon: "bi-lightning-charge",
		iconBg: "var(--pm-green-soft)",
		iconColor: "var(--pm-green-dark)",
		title: "Enable instant client payouts",
		sub: "Auto-deposit collections to linked accounts",
		actionLabel: "Setup",
		modal: "autoPayoutsModal",
	},
	{
		icon: "bi-graph-up-arrow",
		iconBg: "var(--pm-blue-soft)",
		iconColor: "var(--pm-blue)",
		title: "Increase business limits",
		sub: "TechVentures at 24% of daily limit",
		actionLabel: "Upgrade",
		modal: "businessLimitsModal",
	},
	{
		icon: "bi-shield-check",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "#b54708",
		title: "Add OTP for bill payments",
		sub: "Currently disabled · recommended for security",
		actionLabel: "Enable",
		modal: "securityLimitsModal",
	},
	{
		icon: "bi-shield-lock",
		iconBg: "var(--pm-violet-soft)",
		iconColor: "var(--pm-violet)",
		title: "Turn on 2FA on new devices",
		sub: "Protect logins from unrecognised devices",
		actionLabel: "Enable",
		modal: "enable2FAModal",
	},
];

const accountQuickActions: QuickActionItem[] = [
	{
		icon: "bi-sliders",
		iconColor: "var(--pm-green)",
		label: "Limits",
		modal: "transactionLimitsModal",
	},
	{
		icon: "bi-link-45deg",
		iconColor: "var(--pm-green-dark)",
		label: "Link Account",
		modal: "externalAccountsModal",
	},
	{
		icon: "bi-arrow-repeat",
		iconColor: "var(--pm-blue)",
		label: "Auto Payout",
		modal: "autoPayoutsModal",
	},
	{
		icon: "bi-shield-lock",
		iconColor: "var(--pm-danger)",
		label: "Security",
		modal: "securityLimitsModal",
	},
	{
		icon: "bi-globe",
		iconColor: "var(--pm-violet)",
		label: "Countries",
		modal: "countryRestrictionsModal",
	},
	{
		icon: "bi-cash-coin",
		iconColor: "#b54708",
		label: "Fees",
		modal: "feeStructureModal",
	},
	{
		icon: "bi-building",
		iconColor: "var(--pm-violet)",
		label: "Business",
		modal: "businessLimitsModal",
	},
	{
		icon: "bi-diagram-3",
		iconColor: "var(--pm-green)",
		label: "Hierarchy",
		modal: "accountHierarchyModal",
	},
];

/* ---------------------------------------------------------------------------
   Page
   ------------------------------------------------------------------------- */
export default function AccountProfile() {
	const { data } = useQuery({
		queryKey: ["accountProfileData"],
		queryFn: fetchProfileData,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? {
		profile,
		accounts,
		cards,
		activity,
		transactionLimits,
		businessAccounts,
		externalAccounts,
		autoPayouts,
		securityLimits,
		countryRestrictions,
		riskMitigation,
		transactionNotifications,
		feeStructure,
		accountHierarchy,
		linkedBusinesses,
	};

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [filter, setFilter] = useState("all");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	const handleDrawerAction = (modal: string) => {
		if (modal) openM(modal);
	};

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const modalId = params.get("modal");
		if (modalId) setActiveModal(modalId);
	}, []);

	const p = config.profile;
	const accs = config.accounts;
	const cardsList = config.cards;
	const act = config.activity;
	const limits = config.transactionLimits;
	const biz = config.businessAccounts;
	const ext = config.externalAccounts;
	const payouts = config.autoPayouts;
	const secLimits = config.securityLimits;
	const countries = config.countryRestrictions;
	const risks = config.riskMitigation;
	const notifs = config.transactionNotifications;
	const fees = config.feeStructure;
	const hierarchy = config.accountHierarchy;
	const businesses = config.linkedBusinesses;

	const filteredAccounts =
		filter === "all"
			? accs
			: accs.filter((a: { group: string }) => a.group === filter);
	const scopeNote =
		filter === "all"
			? `All ${accs.length} accounts in view`
			: `${filteredAccounts.length} ${filter} account${
					filteredAccounts.length === 1 ? "" : "s"
				} in view`;

	const verificationRows = [
		{ name: "Email", detail: p.primaryEmail, status: "Verified", warn: false },
		{ name: "Phone", detail: p.primaryPhone, status: "Verified", warn: false },
		{
			name: "National ID",
			detail: "Uploaded & verified",
			status: "Verified",
			warn: false,
		},
		{
			name: "Passport",
			detail: "Valid until 2031",
			status: "Verified",
			warn: false,
		},
		{
			name: "Proof of Address",
			detail: "Expires in 45 days",
			status: "Renew",
			warn: true,
		},
	];

	return (
		<div className={styles.accountProfilePage}>
			<div className={styles.main}>
				{/* ==================== HERO ==================== */}
				<header className={styles.heroBanner}>
					<div className={styles.heroOrbOne} aria-hidden="true" />
					<div className={styles.heroOrbTwo} aria-hidden="true" />
					<div className={styles.heroContent}>
						<div className={styles.heroCopy}>
							<div className={styles.heroEyebrow}>
								<span>
									<i className="bi bi-person-badge" aria-hidden="true" />{" "}
									Account Profile &amp; Digital Bank
								</span>
								<span className={styles.livePill}>
									<span className={styles.liveDot} aria-hidden="true" /> Banking
									live
								</span>
							</div>
							<h1 id="account-title">One identity, one bank, total control.</h1>
							<p>
								Your profile, digital accounts, cards, limits and security — all
								managed from one modern hub. {p.profileCompletion}% complete,
								KYC verified, no incidents in 18 months.
							</p>
							<div className={styles.heroActions}>
								<button
									type="button"
									className={styles.heroPrimaryBtn}
									onClick={() => openM("editProfileModal")}
								>
									<i className="bi bi-pencil-square" aria-hidden="true" /> Edit
									Profile
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("downloadDataModal")}
								>
									<i className="bi bi-download" aria-hidden="true" /> Export
									Data
								</button>
							</div>
						</div>
						<div className={styles.heroSnapshot}>
							<span>Account Health</span>
							<strong>
								{p.healthScore}/100{" "}
								<i className="bi bi-heart-pulse" aria-hidden="true" />
							</strong>
							<p>
								Profile {p.profileCompletion}% complete · 2FA enabled · KYC
								verified · No incidents in 18 months.
							</p>
							<div className={styles.heroMetricRow}>
								<div>
									<strong>{p.profileCompletion}%</strong>
									<span>Profile complete</span>
								</div>
								<div>
									<strong>4</strong>
									<span>Active sessions</span>
								</div>
								<div>
									<strong>7</strong>
									<span>Documents on file</span>
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* ==================== CONTROL STRIP ==================== */}
				<div className={styles.controlStrip}>
					<div className={styles.controlGroup}>
						<span className={styles.controlLabel}>
							<i className="bi bi-funnel" aria-hidden="true" /> Accounts
						</span>
						<div className={styles.filterPills}>
							{[
								{ key: "all", label: "All" },
								{ key: "KES", label: "KES Wallets" },
								{ key: "USD", label: "USD" },
								{ key: "Business", label: "Business" },
							].map((pill) => (
								<button
									type="button"
									key={pill.key}
									className={filter === pill.key ? styles.filterActive : ""}
									onClick={() => setFilter(pill.key)}
								>
									{pill.label}
								</button>
							))}
						</div>
					</div>
					<span className={styles.scopeNote}>{scopeNote}</span>
				</div>

				{/* ==================== KPI ROW ==================== */}
				<div className={styles.dashboardSection}>
					<div className={styles.kpiGrid}>
						<div className={styles.kpiCard}>
							<div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
								<i className="bi bi-heart-pulse" aria-hidden="true" />
							</div>
							<div className={styles.kpiValue}>{p.healthScore}/100</div>
							<div className={styles.kpiMeta}>
								<span className={`${styles.badge} ${styles.badgeS}`}>
									<i className="bi bi-check-circle" aria-hidden="true" />{" "}
									Excellent
								</span>
								Account health
							</div>
						</div>
						<div className={styles.kpiCard}>
							<div className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
								<i className="bi bi-person-check" aria-hidden="true" />
							</div>
							<div className={styles.kpiValue}>{p.profileCompletion}%</div>
							<div className={styles.kpiMeta}>
								<span className={`${styles.badge} ${styles.badgeS}`}>
									<i className="bi bi-check-circle" aria-hidden="true" />{" "}
									Verified
								</span>
								Missing: secondary phone
							</div>
						</div>
						<div className={styles.kpiCard}>
							<div className={`${styles.kpiIcon} ${styles.kpiIconAmber}`}>
								<i className="bi bi-laptop" aria-hidden="true" />
							</div>
							<div className={styles.kpiValue}>4</div>
							<div className={styles.kpiMeta}>
								<span className={`${styles.badge} ${styles.badgeW}`}>
									<i className="bi bi-exclamation-circle" aria-hidden="true" />{" "}
									1 new device
								</span>
								iPhone · MacBook · Windows · iPad
							</div>
						</div>
						<div className={styles.kpiCard}>
							<div className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
								<i className="bi bi-file-earmark-check" aria-hidden="true" />
							</div>
							<div className={styles.kpiValue}>7</div>
							<div className={styles.kpiMeta}>
								<span className={`${styles.badge} ${styles.badgeP}`}>
									<i className="bi bi-shield-check" aria-hidden="true" /> All
									valid
								</span>
								ID · Passport · Address · Selfie
							</div>
						</div>
					</div>
				</div>

				{/* ==================== ACTION CENTRE ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="0.1"
						title="Action centre"
						sub="Resolve exceptions first, then use guided suggestions to improve transfer outcomes."
						actions={
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => setDrawerOpen(true)}
							>
								<i className="bi bi-columns-gap" aria-hidden="true" /> Open
								drawer
							</button>
						}
					/>
					<div className={styles.listCard}>
						<div className={styles.listCardHeader}>
							<div className={styles.listCardTitle}>
								<i className="bi bi-exclamation-octagon" aria-hidden="true" />{" "}
								Attention, suggestions &amp; quick actions
							</div>
							<span className={styles.smartBadge}>
								<i className="bi bi-stars" aria-hidden="true" />{" "}
								{accountAttention.length + accountSuggestions.length} open
							</span>
						</div>
						<div className={styles.listCardSub}>
							Open operational items, AI routing recommendations and the actions
							treasury uses most — each opens the matching workflow.
						</div>
						<div className={styles.actionCentreStats}>
							<div className={styles.actionCentreStat}>
								<strong>{accountAttention.length}</strong>
								<span>Attention</span>
							</div>
							<div className={styles.actionCentreStat}>
								<strong>{accountSuggestions.length}</strong>
								<span>Suggestions</span>
							</div>
							<div className={styles.actionCentreStat}>
								<strong>{accountQuickActions.length}</strong>
								<span>Shortcuts</span>
							</div>
						</div>
						<div className={styles.actionCentreActions}>
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => setDrawerOpen(true)}
							>
								<i className="bi bi-columns-gap" aria-hidden="true" /> Review
								queue
							</button>
						</div>
					</div>
				</div>

				{/* ==================== 1.1 PROFILE OVERVIEW ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.1"
						title="Profile Overview"
						sub="Your core identity, verification status, membership tier and quick snapshot."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("editProfileModal")}
								>
									<i className="bi bi-pencil" aria-hidden="true" /> Edit
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("profileModal")}
								>
									<i className="bi bi-eye" aria-hidden="true" /> Full View
								</button>
							</div>
						}
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1.1fr 1fr 0.9fr",
							gap: "1rem",
							alignItems: "stretch",
						}}
					>
						<div>
							<div className={styles.profileHero}>
								<div className={styles.profileAvatar}>{p.initials}</div>
								<div className={styles.profileInfo}>
									<div
										style={{
											fontWeight: 600,
											color: "var(--pm-muted)",
											fontSize: 12,
										}}
									>
										Account Owner
									</div>
									<p className={styles.profileName}>{p.fullName}</p>
									<p className={styles.profileMeta}>{p.primaryEmail}</p>
									<div className={styles.profileBadges}>
										<Badge tone="badgeS">
											<i className="bi bi-gem" aria-hidden="true" /> Premium
											Member
										</Badge>
										<Badge tone="badgeP">
											<i className="bi bi-calendar-check" aria-hidden="true" />{" "}
											Since {p.memberSince}
										</Badge>
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
						<div className={styles.verificationBox}>
							<h4
								style={{
									fontFamily: "Sora, Inter, sans-serif",
									fontSize: 14,
									fontWeight: 700,
									margin: "0 0 0.4rem",
								}}
							>
								Verification Status
							</h4>
							{verificationRows.map((item) => (
								<div className={styles.actionRow} key={item.name}>
									<div className={styles.actionRowMain}>
										<div className={styles.actionRowTitle}>{item.name}</div>
										<div className={styles.actionRowSub}>{item.detail}</div>
									</div>
									{item.warn ? (
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("kycModal")}
										>
											Renew
										</button>
									) : (
										<Badge tone="badgeS">
											<i className="bi bi-check-circle" aria-hidden="true" />{" "}
											{item.status}
										</Badge>
									)}
								</div>
							))}
						</div>
						<div className={styles.membershipBox}>
							<h4
								style={{
									fontFamily: "Sora, Inter, sans-serif",
									fontSize: 14,
									fontWeight: 700,
									margin: "0 0 0.4rem",
								}}
							>
								Membership &amp; Limits
							</h4>
							<div className={styles.tierCard}>
								<div className={styles.tierLabel}>TIER</div>
								<div className={styles.tierName}>{p.tier}</div>
								<div className={styles.tierSub}>
									Monthly limit: KES 2,000,000
								</div>
							</div>
							<div className={styles.usageBox}>
								<div className={styles.usageHead}>Current Usage</div>
								<div className={styles.usageValue}>
									KES 1,284,300{" "}
									<span style={{ fontSize: 12, color: "var(--pm-muted)" }}>
										/ 2M
									</span>
								</div>
								<div className={styles.usageTrack}>
									<div className={styles.usageFill} style={{ width: "64%" }} />
								</div>
							</div>
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnPmP}`}
								style={{ width: "100%", marginTop: "auto" }}
								onClick={() => openM("bankAccountModal")}
							>
								<i className="bi bi-graph-up-arrow" aria-hidden="true" />{" "}
								Upgrade Limits
							</button>
						</div>
					</div>
				</div>

				{/* ==================== 1.2 DIGITAL BANK ACCOUNTS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.2"
						title="Digital Bank Accounts"
						sub="Your PayMo virtual accounts, balances, limits and linked rails."
						actions={
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("linkedAccountsModal")}
							>
								<i className="bi bi-link-45deg" aria-hidden="true" /> Linked
								Accounts
							</button>
						}
					/>
					<div className={styles.bankGrid}>
						{filteredAccounts.map((acc: (typeof accounts)[number]) => (
							<div className={styles.bankCard} key={acc.id}>
								<div className={styles.bankCardTop}>
									<div
										style={{ display: "flex", alignItems: "center", gap: 12 }}
									>
										<div
											className={styles.bankLogo}
											style={{ background: acc.gradient }}
										>
											{acc.letter}
										</div>
										<div>
											<div className={styles.bankName}>{acc.name}</div>
											<div className={styles.bankMeta}>
												Account {acc.number} · {acc.currency}
											</div>
										</div>
									</div>
									{acc.status === "Frozen" ? (
										<Badge tone="badgeW">{acc.status}</Badge>
									) : (
										<Badge tone="badgeS">{acc.status}</Badge>
									)}
								</div>
								<div>
									<div className={styles.bankBalanceLabel}>
										Available Balance
									</div>
									<div className={styles.bankBalance}>{acc.balance}</div>
								</div>
								<div>
									<div className={styles.bankLimitHead}>
										<span>Daily limit usage</span>
										<span>{acc.dailyUsed}%</span>
									</div>
									<div className={styles.bankLimitTrack}>
										<div
											className={styles.bankLimitFill}
											style={{
												width: `${acc.dailyUsed}%`,
												background:
													acc.dailyUsed > 80 ? "var(--pm-warning)" : undefined,
											}}
										/>
									</div>
								</div>
								<div className={styles.bankCardFooter}>
									{acc.verified ? (
										<span className={styles.bankVerified}>
											<i className="bi bi-shield-check" aria-hidden="true" />{" "}
											Fully verified
										</span>
									) : (
										<span className={styles.bankVerifiedWarn}>
											<i
												className="bi bi-shield-exclamation"
												aria-hidden="true"
											/>{" "}
											Verification pending
										</span>
									)}
									<div className={styles.headerButtonRow}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("downloadDataModal")}
										>
											<i className="bi bi-receipt" aria-hidden="true" />{" "}
											Statement
										</button>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("transactionLimitsModal")}
										>
											Details
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ==================== 1.3 CARDS & WALLETS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.3"
						title="Cards & Wallets"
						sub="Virtual and physical cards linked to your PayMo accounts."
					/>
					<div className={styles.cardsGrid}>
						{cardsList.map((card) => (
							<button
								type="button"
								key={card.id}
								className={`${styles.paymentCard} ${styles[card.variant]}`}
								onClick={() => openM("cardDetailsModal")}
							>
								<div className={styles.cardTop}>
									<span
										style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}
									>
										PAYMO
									</span>
									<div className={styles.cardChip} aria-hidden="true" />
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
									<span
										style={{
											fontSize: 10,
											padding: "2px 8px",
											borderRadius: 999,
											background:
												card.status === "Active"
													? "rgba(16,185,129,0.25)"
													: "rgba(245,158,11,0.25)",
											color: "#fff",
										}}
									>
										{card.status}
									</span>
								</div>
								<div className={styles.cardType}>{card.type}</div>
							</button>
						))}
					</div>
				</div>

				{/* ==================== 1.4 LINKED BUSINESSES ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.4"
						title="Linked Businesses"
						sub="All verified businesses linked to your account with registration details and documents."
						actions={
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
								onClick={() => openM("linkBusinessModal")}
							>
								<i className="bi bi-plus-lg" aria-hidden="true" /> Link Business
							</button>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<Badge
													tone={
														business.type === "Online Business"
															? "badgeI"
															: business.type === "Local Shop"
																? "badgeS"
																: "badgeP"
													}
												>
													{business.type}
												</Badge>
											</td>
											<td>{business.domain}</td>
											<td>{business.dateRegistered}</td>
											<td>
												<div className={styles.mutedSmall}>
													{business.documents.length} documents
												</div>
											</td>
											<td>{business.region}</td>
											<td>
												<Badge tone="badgeS">
													<i
														className="bi bi-check-circle"
														aria-hidden="true"
													/>{" "}
													{business.status}
												</Badge>
											</td>
											<td>{business.tier}</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("businessLimitsModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* ==================== 1.5 TRANSACTION LIMITS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.5"
						title="Transaction Limits"
						sub="Daily and monthly limits for your PayMo accounts and sub-accounts."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("transactionLimitsModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Configure
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("transactionLimitsModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Add Limit
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 8,
													}}
												>
													<div style={{ flex: 1, minWidth: 60 }}>
														<div className={styles.bankLimitTrack}>
															<div
																className={styles.bankLimitFill}
																style={{
																	width: `${(limit.dailyUsed / limit.dailyLimit) * 100}%`,
																	background:
																		limit.dailyUsed / limit.dailyLimit > 0.8
																			? "var(--pm-warning)"
																			: undefined,
																}}
															/>
														</div>
													</div>
													<span style={{ fontSize: 12, fontWeight: 600 }}>
														{Math.round(
															(limit.dailyUsed / limit.dailyLimit) * 100,
														)}
														%
													</span>
												</div>
											</td>
											<td>KES {limit.monthlyLimit.toLocaleString()}</td>
											<td>
												<span style={{ fontSize: 13, fontWeight: 600 }}>
													KES {limit.monthlyUsed.toLocaleString()}
												</span>
											</td>
											<td>
												<Badge tone="badgeS">
													<i
														className="bi bi-check-circle"
														aria-hidden="true"
													/>{" "}
													{limit.status}
												</Badge>
											</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("transactionLimitsModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className={styles.summaryBox} style={{ marginTop: "0.9rem" }}>
							<span className={styles.mutedSmall}>
								<i className="bi bi-info-circle" aria-hidden="true" /> PayMo to
								PayMo transfers are FREE and unlimited. Limits apply to external
								transfers only.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.6 LINKED BUSINESS ACCOUNTS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.6"
						title="Linked Business Accounts"
						sub="Manage limits and access for your linked business accounts."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("businessLimitsModal")}
								>
									<i className="bi bi-sliders" aria-hidden="true" /> Limits
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("linkBusinessModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Link
									Business
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
											<td
												style={{
													fontWeight: 600,
													color: "var(--pm-green-dark)",
												}}
											>
												{business.balance}
											</td>
											<td>KES {business.dailyLimit.toLocaleString()}</td>
											<td>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 8,
													}}
												>
													<div style={{ flex: 1, minWidth: 60 }}>
														<div className={styles.bankLimitTrack}>
															<div
																className={styles.bankLimitFill}
																style={{
																	width: `${(business.dailyUsed / business.dailyLimit) * 100}%`,
																	background:
																		business.dailyUsed / business.dailyLimit >
																		0.8
																			? "var(--pm-warning)"
																			: undefined,
																}}
															/>
														</div>
													</div>
													<span style={{ fontSize: 12, fontWeight: 600 }}>
														{Math.round(
															(business.dailyUsed / business.dailyLimit) * 100,
														)}
														%
													</span>
												</div>
											</td>
											<td>{business.tier}</td>
											<td>
												<Badge tone="badgeS">
													<i
														className="bi bi-check-circle"
														aria-hidden="true"
													/>{" "}
													{business.status}
												</Badge>
											</td>
											<td>
												<div className={styles.headerButtonRow}>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("businessLimitsModal")}
													>
														<i className="bi bi-sliders" aria-hidden="true" />
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
														onClick={() => openM("unlinkBusinessModal")}
													>
														<i className="bi bi-x-circle" aria-hidden="true" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* ==================== 1.7 LINKED EXTERNAL ACCOUNTS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.7"
						title="Linked External Accounts"
						sub="Bank accounts and mobile money wallets for external transfers."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("externalAccountsModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Manage
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("linkExternalModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Link
									Account
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<Badge
													tone={account.type === "Bank" ? "badgeI" : "badgeP"}
												>
													{account.type}
												</Badge>
											</td>
											<td>
												<strong>{account.name}</strong>
											</td>
											<td>
												<code
													style={{
														fontSize: 12,
														background: "#f2f4f7",
														padding: "2px 6px",
														borderRadius: 4,
													}}
												>
													{account.accountNumber}
												</code>
											</td>
											<td>{account.currency}</td>
											<td>
												{account.status === "Verified" ? (
													<Badge tone="badgeS">
														<i
															className="bi bi-check-circle"
															aria-hidden="true"
														/>{" "}
														{account.status}
													</Badge>
												) : (
													<Badge tone="badgeW">
														<i className="bi bi-clock" aria-hidden="true" />{" "}
														{account.status}
													</Badge>
												)}
											</td>
											<td style={{ fontSize: 13 }}>{account.lastUsed}</td>
											<td>
												{account.isDefault ? (
													<Badge tone="badgeS">
														<i className="bi bi-star-fill" aria-hidden="true" />{" "}
														Default
													</Badge>
												) : (
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("externalAccountsModal")}
													>
														Set Default
													</button>
												)}
											</td>
											<td>
												<div className={styles.headerButtonRow}>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("externalAccountsModal")}
													>
														<i className="bi bi-pencil" aria-hidden="true" />
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
														onClick={() => openM("unlinkExternalModal")}
													>
														<i className="bi bi-trash" aria-hidden="true" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* ==================== 1.8 AUTO PAYOUT SCHEDULING ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.8"
						title="Auto Payout Scheduling"
						sub="Automate transfers to external accounts on schedule or instantly."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("autoPayoutsModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Configure
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("createPayoutModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> New
									Schedule
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<Badge
													tone={payout.type === "Instant" ? "badgeS" : "badgeI"}
												>
													{payout.type}
												</Badge>
											</td>
											<td
												style={{
													fontWeight: 600,
													color: "var(--pm-green-dark)",
												}}
											>
												{payout.amount}
											</td>
											<td>{payout.destination}</td>
											<td>
												{payout.status === "Active" ? (
													<Badge tone="badgeS">
														<i
															className="bi bi-check-circle"
															aria-hidden="true"
														/>{" "}
														{payout.status}
													</Badge>
												) : (
													<Badge tone="badgeW">
														<i
															className="bi bi-pause-circle"
															aria-hidden="true"
														/>{" "}
														{payout.status}
													</Badge>
												)}
											</td>
											<td style={{ fontSize: 13 }}>{payout.nextRun}</td>
											<td>
												<div className={styles.headerButtonRow}>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("autoPayoutsModal")}
													>
														<i className="bi bi-pencil" aria-hidden="true" />
													</button>
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm} ${
															payout.status === "Active"
																? styles.btnPmD
																: styles.btnPmP
														}`}
														onClick={() => openM("autoPayoutsModal")}
													>
														<i
															className={`bi ${
																payout.status === "Active"
																	? "bi-pause"
																	: "bi-play"
															}`}
															aria-hidden="true"
														/>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							className={styles.summaryBoxInfo}
							style={{ marginTop: "0.9rem" }}
						>
							<span className={styles.mutedSmall}>
								<i className="bi bi-lightning-charge" aria-hidden="true" />{" "}
								Instant payouts automatically transfer funds when money is
								collected from clients. Perfect for real-time cash flow
								management.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.9 SECURITY LIMITS & OTP ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.9"
						title="Security Limits & OTP Verification"
						sub="Protect against unauthorized transfers with OTP thresholds."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("securityLimitsModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Configure
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("securityLimitsModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Add Rule
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
											<td
												style={{
													fontWeight: 600,
													color: "var(--pm-green-dark)",
												}}
											>
												KES {limit.threshold.toLocaleString()}
											</td>
											<td>
												{limit.requiresOTP ? (
													<Badge tone="badgeS">
														<i
															className="bi bi-check-circle"
															aria-hidden="true"
														/>{" "}
														Yes
													</Badge>
												) : (
													<Badge tone="badgeW">
														<i className="bi bi-x-circle" aria-hidden="true" />{" "}
														No
													</Badge>
												)}
											</td>
											<td>{limit.otpMethod}</td>
											<td>
												<Badge
													tone={limit.status === "Active" ? "badgeS" : "badgeW"}
												>
													{limit.status}
												</Badge>
											</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("securityLimitsModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							className={styles.summaryBoxDanger}
							style={{ marginTop: "0.9rem" }}
						>
							<span className={styles.mutedSmall}>
								<i className="bi bi-exclamation-triangle" aria-hidden="true" />{" "}
								OTP verification adds an extra layer of security. Transfers
								above your set threshold will require confirmation via SMS,
								WhatsApp, or Email.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.10 COUNTRY RESTRICTIONS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.10"
						title="Country Restrictions & Verification"
						sub="Control which countries you can transfer to and verification requirements."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("countryRestrictionsModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Configure
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("countryRestrictionsModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Add Country
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<code
													style={{
														fontSize: 12,
														background: "#f2f4f7",
														padding: "2px 6px",
														borderRadius: 4,
													}}
												>
													{country.code}
												</code>
											</td>
											<td>
												{country.status === "Allowed" ? (
													<Badge tone="badgeS">
														<i
															className="bi bi-check-circle"
															aria-hidden="true"
														/>{" "}
														{country.status}
													</Badge>
												) : country.status === "Restricted" ? (
													<Badge tone="badgeW">
														<i
															className="bi bi-exclamation-circle"
															aria-hidden="true"
														/>{" "}
														{country.status}
													</Badge>
												) : (
													<Badge tone="badgeD">
														<i className="bi bi-x-circle" aria-hidden="true" />{" "}
														{country.status}
													</Badge>
												)}
											</td>
											<td style={{ fontSize: 13 }}>{country.verification}</td>
											<td style={{ fontWeight: 600 }}>
												{country.transferLimit}
											</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("countryRestrictionsModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							className={styles.summaryBoxInfo}
							style={{ marginTop: "0.9rem" }}
						>
							<span className={styles.mutedSmall}>
								<i className="bi bi-info-circle" aria-hidden="true" /> Transfers
								to Kenya (your national country) are free and unlimited.
								International transfers may require enhanced KYC and KRA
								verification.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.11 RISK MITIGATION ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.11"
						title="Risk Mitigation & High-Value Verification"
						sub="Automatic verification requirements for high-value transactions."
						actions={
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("riskMitigationModal")}
							>
								<i className="bi bi-gear" aria-hidden="true" /> Configure
							</button>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
											<td
												style={{
													fontWeight: 600,
													color: "var(--pm-green-dark)",
												}}
											>
												KES {risk.threshold.toLocaleString()}
											</td>
											<td>{risk.currency}</td>
											<td>
												<strong>{risk.requirement}</strong>
											</td>
											<td style={{ fontSize: 13 }}>{risk.appliesTo}</td>
											<td>
												<Badge tone="badgeS">
													<i
														className="bi bi-check-circle"
														aria-hidden="true"
													/>{" "}
													{risk.status}
												</Badge>
											</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("riskMitigationModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							className={styles.summaryBoxWarn}
							style={{ marginTop: "0.9rem" }}
						>
							<span className={styles.mutedSmall}>
								<i className="bi bi-exclamation-triangle" aria-hidden="true" />{" "}
								Transactions above KES 1,000,000 require KYC verification.
								Business transfers above KES 1,000,000 also require KRA PIN
								verification.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.12 TRANSACTION FEE STRUCTURE ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.12"
						title="Transaction Fee Structure"
						sub="Fees for different transfer types and payment methods."
						actions={
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("feeStructureModal")}
							>
								<i className="bi bi-info-circle" aria-hidden="true" /> Details
							</button>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<span
													style={{
														fontWeight: 700,
														color:
															fee.fee === "FREE"
																? "var(--pm-green-dark)"
																: "var(--pm-green)",
													}}
												>
													{fee.fee}
												</span>
											</td>
											<td style={{ fontSize: 13 }}>{fee.description}</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("feeStructureModal")}
												>
													<i className="bi bi-info-circle" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className={styles.summaryBox} style={{ marginTop: "0.9rem" }}>
							<span className={styles.mutedSmall}>
								<i className="bi bi-check-circle" aria-hidden="true" />{" "}
								<strong>PayMo to PayMo transfers are FREE</strong> — Send money
								instantly between PayMo accounts at no cost.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.13 ACCOUNT HIERARCHY ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.13"
						title="Account Hierarchy & Fund Flow"
						sub="Primary wallet, sub-accounts, and automatic funding relationships."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("accountHierarchyModal")}
								>
									<i className="bi bi-diagram-3" aria-hidden="true" /> Visual
									View
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("createSubAccountModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Sub-Account
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												{"children" in acc &&
													acc.children &&
													acc.children.length > 0 && (
														<div
															className={styles.mutedSmall}
															style={{ marginTop: 4 }}
														>
															<i
																className="bi bi-diagram-2"
																aria-hidden="true"
															/>{" "}
															Sub-accounts: {acc.children.join(", ")}
														</div>
													)}
											</td>
											<td
												style={{
													fontWeight: 600,
													color: "var(--pm-green-dark)",
												}}
											>
												{acc.balance}
											</td>
											<td>
												<Badge
													tone={
														acc.type === "Primary"
															? "badgeS"
															: acc.type === "Sub-account"
																? "badgeI"
																: acc.type === "Multi-currency"
																	? "badgeP"
																	: "badgeW"
													}
												>
													{acc.type}
												</Badge>
											</td>
											<td>{acc.parent || "—"}</td>
											<td style={{ fontSize: 13 }}>{acc.fundingSource}</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("accountHierarchyModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							className={styles.summaryBoxInfo}
							style={{ marginTop: "0.9rem" }}
						>
							<span className={styles.mutedSmall}>
								<i className="bi bi-info-circle" aria-hidden="true" />{" "}
								Sub-accounts automatically draw funds from the primary wallet
								when needed. Set up utility and services accounts for better
								expense tracking.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.14 ADVANCED NOTIFICATIONS ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.14"
						title="Advanced Transaction Notifications"
						sub="Configure real-time alerts for all transaction events via multiple channels."
						actions={
							<div className={styles.headerButtonRow}>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("transactionNotificationsModal")}
								>
									<i className="bi bi-gear" aria-hidden="true" /> Configure
								</button>
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
									onClick={() => openM("transactionNotificationsModal")}
								>
									<i className="bi bi-plus-lg" aria-hidden="true" /> Add Rule
								</button>
							</div>
						}
					/>
					<div className={styles.tableCard}>
						<div className={styles.tableWrap}>
							<table className={styles.tbl}>
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
												<div
													style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
												>
													{notif.channels.map((channel) => (
														<span className={styles.channelChip} key={channel}>
															<i className="bi bi-bell" aria-hidden="true" />{" "}
															{channel}
														</span>
													))}
												</div>
											</td>
											<td>
												<Badge tone="badgeS">
													<i
														className="bi bi-check-circle"
														aria-hidden="true"
													/>{" "}
													{notif.status}
												</Badge>
											</td>
											<td>
												<button
													type="button"
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("transactionNotificationsModal")}
												>
													<i className="bi bi-pencil" aria-hidden="true" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className={styles.summaryBox} style={{ marginTop: "0.9rem" }}>
							<span className={styles.mutedSmall}>
								<i className="bi bi-check-circle" aria-hidden="true" /> Receive
								instant notifications via SMS, Email, WhatsApp, and Push for all
								transaction activities, security alerts, and limit warnings.
							</span>
						</div>
					</div>
				</div>

				{/* ==================== 1.15 RECENT ACTIVITY ==================== */}
				<div className={styles.dashboardSection}>
					<SectionHeading
						index="1.15"
						title="Recent Account Activity"
						sub="A chronological view of payments, logins and security events."
						actions={
							<button
								type="button"
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("activityDetailModal")}
							>
								<i className="bi bi-funnel" aria-hidden="true" /> Filter
							</button>
						}
					/>
					<div className={styles.activityTimeline}>
						{act.map((item) => (
							<button
								type="button"
								className={styles.activityItem}
								key={item.title}
								onClick={() => openM("activityDetailModal")}
							>
								<div
									className={styles.activityIcon}
									style={{ background: item.iconBg, color: item.iconColor }}
								>
									<i className={`bi ${item.icon}`} aria-hidden="true" />
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
												color: item.amount.startsWith("+")
													? "var(--pm-green-dark)"
													: "var(--pm-ink)",
												textAlign: "right",
											}}
										>
											{item.amount}
										</div>
									)}
								</div>
							</button>
						))}
					</div>
				</div>

				{/* ==================== FOOTER ==================== */}
				<div className={styles.pageFooter}>
					<div>PayMo Account Hub · {p.joined} · Data refreshed just now</div>
					<div className={styles.headerButtonRow}>
						<Link to="/pm/app/fees">Fee structure</Link>
						<Link to="/pm/app/settlement" search={{ modal: undefined }}>
							Settlement centre
						</Link>
						<Link to="/pm/app/disputes" search={{ modal: undefined }}>
							Disputes centre
						</Link>
					</div>
				</div>
			</div>

			{/* ==================== FLOATING BAR ==================== */}
			<div className={styles.floatingBar}>
				<button type="button" onClick={() => openM("downloadDataModal")}>
					<i className="bi bi-download" aria-hidden="true" /> Download Data
				</button>
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => openM("editProfileModal")}
				>
					<i className="bi bi-pencil-square" aria-hidden="true" /> Edit Profile
				</button>
			</div>

			{/* ==================== MODALS ==================== */}
			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Account"
				pageIcon="bi-person-badge"
				attention={accountAttention}
				suggestions={accountSuggestions}
				quickActions={accountQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<AccountProfileModals
				active={activeModal}
				onClose={closeM}
				onOpen={openM}
			/>
		</div>
	);
}
