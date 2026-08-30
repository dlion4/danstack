"use client";

import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useMemo, useRef, useState } from "react";
import AccountFlowChart from "../components/AccountFlowChart";
import { WalletActivationModals } from "../modals/WalletActivationModals";
import styles from "../styles/walletActivation.module.css";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
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
		route: "/cards/app",
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
		name: "Crypto Acc",
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
		origin: "Developer Portal",
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
		meta: "4 links active · 1 paused — expand your hub",
		date: "Next step",
		state: "pending",
		icon: "bi bi-link-45deg",
	},
];

const features = [
	{
		modal: "activateDashboardModal",
		icon: "bi bi-stars",
		label: "Activate Dashboard",
		desc: "Consent + PIN activation wizard",
		color: "var(--acc)",
	},
	{
		modal: "linkAccountModal",
		icon: "bi bi-link-45deg",
		label: "Link Account",
		desc: "Choose account + permission wizard",
		color: "var(--success)",
	},
	{
		modal: "activeLinksModal",
		icon: "bi bi-layout-three-columns",
		label: "Manage Links",
		desc: "All linked accounts & sync status",
		color: "var(--info)",
	},
	{
		modal: "moneyRelocationModal",
		icon: "bi bi-arrow-left-right",
		label: "Relocate Funds",
		desc: "8-step safe fund movement",
		color: "var(--warning)",
	},
	{
		modal: "linkPermissionsModal",
		icon: "bi bi-sliders",
		label: "Permissions",
		desc: "Presets & granular controls",
		color: "var(--purple)",
	},
	{
		modal: "linkNotificationsModal",
		icon: "bi bi-bell",
		label: "Alert Routing",
		desc: "Channels & quiet hours",
		color: "var(--danger)",
	},
	{
		modal: "linkLimitsModal",
		icon: "bi bi-speedometer2",
		label: "Limits",
		desc: "Daily / monthly caps & velocity",
		color: "var(--info)",
	},
	{
		modal: "tourGuideModal",
		icon: "bi bi-signpost-2",
		label: "Guided Tour",
		desc: "8-step dashboard walkthrough",
		color: "var(--pri)",
	},
];

const utilities = [
	{
		modal: "privacyModal",
		icon: "bi bi-shield-check",
		label: "Privacy Center",
		desc: "Data consent & visibility",
		color: "var(--success)",
	},
	{
		modal: "preferencesModal",
		icon: "bi bi-sliders2",
		label: "Preferences",
		desc: "Activation defaults & notifications",
		color: "var(--info)",
	},
	{
		modal: "supportHelpModal",
		icon: "bi bi-headset",
		label: "Support & Help",
		desc: "Guides, FAQ, live chat & emergency",
		color: "var(--purple)",
	},
	{
		modal: "relocationReceiptModal",
		icon: "bi bi-receipt",
		label: "Sample Receipt",
		desc: "View a relocation receipt",
		color: "var(--info)",
	},
	{
		modal: "activationSuccessModal",
		icon: "bi bi-check2-circle",
		label: "Activation Proof",
		desc: "Your activation certificate",
		color: "var(--success)",
	},
	{
		modal: "revokeAllAccessModal",
		icon: "bi bi-x-octagon",
		label: "Revoke All",
		desc: "Emergency panic button",
		color: "var(--danger)",
	},
];

const activity = [
	{
		icon: "bi bi-arrow-down-left",
		bg: "var(--success-bg)",
		color: "var(--success)",
		title: "Incoming transfer from Business Acc",
		meta: ["Today, 14:22", "Transaction Hub"],
		amt: "+KES 240,000",
		dir: "in",
	},
	{
		icon: "bi bi-link-45deg",
		bg: "var(--info-bg)",
		color: "var(--info)",
		title: "Developer Acc linked (One-Way In)",
		meta: ["20 Aug 2024", "Permissions set"],
		amt: "",
		dir: "",
	},
	{
		icon: "bi bi-arrow-up-right",
		bg: "var(--danger-bg)",
		color: "var(--danger)",
		title: "Funds relocated to Savings Acc",
		meta: ["Yesterday, 18:30", "Relocation wizard"],
		amt: "−KES 50,000",
		dir: "out",
	},
	{
		icon: "bi bi-shield-check",
		bg: "var(--purple-bg)",
		color: "var(--purple)",
		title: "Consent suite renewed",
		meta: ["16 Jan 2023", "9 / 9 signed"],
		amt: "",
		dir: "",
	},
	{
		icon: "bi bi-credit-card-2-front",
		bg: "var(--warning-bg)",
		color: "var(--warning)",
		title: "Cards Center activated",
		meta: ["Today, 11:05", "Virtual card issued"],
		amt: "",
		dir: "",
	},
];

/* ------------------------------------------------------------------ */
/*  Motion helper                                                      */
/* ------------------------------------------------------------------ */

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
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return (
		<div
			ref={ref}
			className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${className}`}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Command palette (⌘K)                                               */
/* ------------------------------------------------------------------ */

interface Command {
	id: string;
	label: string;
	desc: string;
	icon: string;
	group: string;
	color: string;
	run: () => void;
	keys?: string;
}

function CommandPalette({
	open,
	onClose,
	onCommand,
}: {
	open: boolean;
	onClose: () => void;
	onCommand: (id: string) => void;
}) {
	const [q, setQ] = useState("");
	const [active, setActive] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const commands: Command[] = useMemo(
		() =>
			[
				{
					id: "activateDashboardModal",
					label: "Activate Dashboard",
					desc: "Consent + PIN activation wizard",
					icon: "bi bi-stars",
					group: "Actions",
					color: "#f79009",
				},
				{
					id: "linkAccountModal",
					label: "Link Account",
					desc: "Connect a dashboard account",
					icon: "bi bi-link-45deg",
					group: "Actions",
					color: "#12b76a",
				},
				{
					id: "activeLinksModal",
					label: "Manage Links",
					desc: "All linked accounts & sync status",
					icon: "bi bi-layout-three-columns",
					group: "Actions",
					color: "#2e90fa",
				},
				{
					id: "moneyRelocationModal",
					label: "Relocate Funds",
					desc: "8-step safe fund movement",
					icon: "bi bi-arrow-left-right",
					group: "Money",
					color: "#f79009",
				},
				{
					id: "linkPermissionsModal",
					label: "Permissions",
					desc: "Presets & granular controls",
					icon: "bi bi-sliders",
					group: "Controls",
					color: "#7a5af8",
				},
				{
					id: "linkNotificationsModal",
					label: "Alert Routing",
					desc: "Channels & quiet hours",
					icon: "bi bi-bell",
					group: "Controls",
					color: "#f04438",
				},
				{
					id: "linkLimitsModal",
					label: "Cross-Dashboard Limits",
					desc: "Daily / monthly caps & velocity",
					icon: "bi bi-speedometer2",
					group: "Controls",
					color: "#2e90fa",
				},
				{
					id: "revokeAllAccessModal",
					label: "Revoke All Access",
					desc: "Emergency panic button",
					icon: "bi bi-shield-exclamation",
					group: "Security",
					color: "#f04438",
				},
				{
					id: "privacyModal",
					label: "Privacy Center",
					desc: "Data consent & visibility",
					icon: "bi bi-shield-check",
					group: "Security",
					color: "#12b76a",
				},
				{
					id: "tourGuideModal",
					label: "Replay Guided Tour",
					desc: "8-step dashboard walkthrough",
					icon: "bi bi-signpost-2",
					group: "Help",
					color: "#12b76a",
				},
				{
					id: "supportHelpModal",
					label: "Support & Help",
					desc: "Guides, FAQ, live chat & emergency",
					icon: "bi bi-headset",
					group: "Help",
					color: "#2e90fa",
				},
				{
					id: "go:transactions",
					label: "Go to Transaction Hub",
					desc: "/pm/app/transfer-overview",
					icon: "bi bi-box-arrow-in-right",
					group: "Navigate",
					color: "#12b76a",
					keys: "G T",
				},
				{
					id: "go:cards",
					label: "Go to Cards Center",
					desc: "/cards/app",
					icon: "bi bi-credit-card-2-front",
					group: "Navigate",
					color: "#2e90fa",
					keys: "G C",
				},
				{
					id: "go:utility",
					label: "Go to Utilities Hub",
					desc: "/utility",
					icon: "bi bi-lightning-charge",
					group: "Navigate",
					color: "#f79009",
					keys: "G U",
				},
			].map((c) => ({ ...c, run: () => onCommand(c.id) })),
		[onCommand],
	);

	const filtered = useMemo(() => {
		const t = q.trim().toLowerCase();
		if (!t) return commands;
		return commands.filter(
			(c) =>
				c.label.toLowerCase().includes(t) ||
				c.desc.toLowerCase().includes(t) ||
				c.group.toLowerCase().includes(t),
		);
	}, [q, commands]);

	useEffect(() => {
		if (open) {
			setQ("");
			setActive(0);
			window.setTimeout(() => inputRef.current?.focus(), 40);
		}
	}, [open]);
	useEffect(() => setActive(0));

	if (!open) return null;

	const choose = (c: Command) => {
		c.run();
		onClose();
	};
	const onKey = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((a) => Math.min(a + 1, filtered.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((a) => Math.max(a - 1, 0));
		} else if (e.key === "Enter" && filtered[active]) choose(filtered[active]);
		else if (e.key === "Escape") onClose();
	};

	const groups = Array.from(new Set(filtered.map((c) => c.group)));

	return (
		<div className={styles.paletteOverlay}>
			<button
				type="button"
				className={styles.paletteBackdrop}
				tabIndex={-1}
				aria-label="Close search"
				onClick={onClose}
			/>
			<div className={styles.palette}>
				<div className={styles.paletteHead}>
					<i className="bi bi-search"></i>
					<input
						ref={inputRef}
						className={styles.paletteInput}
						placeholder="Search actions, dashboards, settings…"
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={onKey}
					/>
					<span className={styles.paletteKbd}>ESC</span>
				</div>
				<div className={styles.paletteList}>
					{filtered.length === 0 && (
						<div
							style={{
								padding: 24,
								textAlign: "center",
								color: "var(--ink-500)",
								fontSize: 13,
							}}
						>
							No matches for "{q}"
						</div>
					)}
					{groups.map((g) => (
						<div key={g}>
							<div className={styles.paletteGroup}>{g}</div>
							{filtered
								.filter((c) => c.group === g)
								.map((c) => {
									const idx = filtered.indexOf(c);
									return (
										<button
											type="button"
											key={c.id}
											className={`${styles.paletteItem} ${idx === active ? styles.paletteItemActive : ""}`}
											onMouseEnter={() => setActive(idx)}
											onClick={() => choose(c)}
										>
											<span
												className={styles.paletteIcon}
												style={{ background: `${c.color}1a`, color: c.color }}
											>
												<i className={c.icon}></i>
											</span>
											<span className={styles.paletteLabel}>
												<span className={styles.paletteName}>{c.label}</span>
												<span className={styles.paletteDesc}>{c.desc}</span>
											</span>
											{c.keys && (
												<span className={styles.paletteShort}>{c.keys}</span>
											)}
										</button>
									);
								})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WalletActivation() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [copied, setCopied] = useState(false);
	const [tab, setTab] = useState<"overview" | "flow" | "dashboards" | "manage">(
		"overview",
	);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [toast, setToast] = useState<string | null>(null);

	// ?modal= deep link support (used by route tests & shared links)
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const modalId = params.get("modal");
		if (modalId) setModalState((prev) => ({ ...prev, [modalId]: true }));
	}, []);

	const openModal = (id: string) => {
		if (id.startsWith("go:")) {
			const route =
				id === "go:transactions"
					? "/pm/app/transfer-overview"
					: id === "go:cards"
						? "/cards/app"
						: "/utility";
			window.location.href = route;
			return;
		}
		setModalState((prev) => ({ ...prev, [id]: true }));
	};
	const closeModal = (id: string) =>
		setModalState((prev) => ({ ...prev, [id]: false }));

	const flash = (msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 2200);
	};

	// ⌘K shortcut
	useEffect(() => {
		const h = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, []);

	const copyAccount = async () => {
		try {
			await navigator.clipboard.writeText(wallet.accountNumber);
		} catch {
			/* clipboard unavailable */
		}
		setCopied(true);
		flash("Account number copied");
		window.setTimeout(() => setCopied(false), 1600);
	};

	const activeCount = dashboards.filter((d) => d.status === "Active").length;
	const pendingCount = dashboards.filter(
		(d) => d.status === "Activation Pending" || d.status === "Not Activated",
	).length;
	const linkedActive = activeLinks.filter((l) => l.status === "Active").length;

	const tabs: Array<{
		id: "overview" | "flow" | "dashboards" | "manage";
		label: string;
		icon: string;
		count?: number;
	}> = [
		{ id: "overview", label: "Overview", icon: "bi bi-grid-1x2" },
		{
			id: "flow",
			label: "Live Flow",
			icon: "bi bi-diagram-3",
			count: activeLinks.length,
		},
		{
			id: "dashboards",
			label: "Dashboards",
			icon: "bi bi-grid-3x3-gap",
			count: dashboards.length,
		},
		{ id: "manage", label: "Manage", icon: "bi bi-shield-lock" },
	];

	return (
		<div className={styles.waPage}>
			{/* ==================== CONSOLE ==================== */}
			<div className={styles.waConsole}>
				<div className={styles.waCrumb}>
					<i className="bi bi-wallet2"></i> PayMo{" "}
					<span className={styles.waCrumbSep}>/</span>{" "}
					<strong>Wallet Activation Hub</strong>
				</div>
				<div className={styles.waConsoleActions}>
					<button
						type="button"
						className={styles.waSearch}
						onClick={() => setPaletteOpen(true)}
					>
						<i className="bi bi-search"></i>
						<span>Search actions, dashboards, settings…</span>
						<span className={styles.waKbd}>⌘K</span>
					</button>
					<button
						type="button"
						className={styles.waIconBtn}
						title="Support & Help"
						onClick={() => openModal("supportHelpModal")}
					>
						<i className="bi bi-question-circle"></i>
					</button>
				</div>
			</div>

			{/* ==================== HERO ==================== */}
			<Reveal>
				<section className={styles.hero}>
					<div className={styles.heroOrbs}></div>
					<div className={styles.heroTop}>
						<span className={styles.heroZone}>
							<i className="bi bi-stars"></i> WALLET ACTIVATION HUB
						</span>
						<span className={styles.heroLive}>
							<i className="bi bi-check-circle-fill"></i> {wallet.status}
						</span>
					</div>
					<h1 className={styles.heroTitle}>
						Activate, link & move money across every PayMo dashboard.
					</h1>
					<p className={styles.heroCopy}>
						One command centre for every surface your wallet powers — activate a
						dashboard, link accounts, set permissions and relocate funds safely
						between them.
					</p>
					<div className={styles.heroChips}>
						<span className={styles.heroChip}>
							<i className="bi bi-patch-check"></i> {wallet.tier} KYC
						</span>
						<span className={styles.heroChip}>
							<i className="bi bi-link-45deg"></i> {linkedActive} links live
						</span>
						<span className={styles.heroChip}>
							<i className="bi bi-grid-3x3-gap"></i> {activeCount}/
							{dashboards.length} dashboards active
						</span>
						<span className={styles.heroChip}>
							<i className="bi bi-globe2"></i> {wallet.currencies.length}{" "}
							currencies
						</span>
					</div>
					<div className={styles.heroStats}>
						<div className={styles.heroStat}>
							<span className={styles.heroStatLabel}>Available balance</span>
							<span className={styles.heroStatValue}>{wallet.balance}</span>
						</div>
						<div className={styles.heroStat}>
							<span className={styles.heroStatLabel}>Consent health</span>
							<span className={styles.heroStatValue}>
								9/9 <small>renews Jan 2027</small>
							</span>
						</div>
						<div className={styles.heroStat}>
							<span className={styles.heroStatLabel}>Pending activations</span>
							<span className={styles.heroStatValue}>
								{pendingCount} <small>need action</small>
							</span>
						</div>
						<div className={styles.heroStat}>
							<span className={styles.heroStatLabel}>Linked balance</span>
							<span className={styles.heroStatValue}>KES 8.4M</span>
						</div>
					</div>
					<div className={styles.heroActions}>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonMd}`}
							onClick={() => openModal("activateDashboardModal")}
						>
							<i className="bi bi-stars"></i> Activate Dashboard
						</button>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonGhost} ${styles.buttonMd}`}
							onClick={() => openModal("linkAccountModal")}
						>
							<i className="bi bi-link-45deg"></i> Link Account
						</button>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonGhost} ${styles.buttonMd}`}
							onClick={() => openModal("moneyRelocationModal")}
						>
							<i className="bi bi-arrow-left-right"></i> Relocate Funds
						</button>
					</div>
					<div className={styles.heroAccount}>
						<span className={styles.heroAccountLabel}>Primary account</span>
						<span className={styles.heroAccountNum}>
							{wallet.accountNumber}
							<button
								type="button"
								className={styles.heroCopyBtn}
								title="Copy account number"
								onClick={copyAccount}
							>
								<i
									className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`}
								></i>
							</button>
						</span>
						<span className={styles.heroAccountMeta}>
							<i className="bi bi-person"></i> {wallet.holder} ·{" "}
							<i className="bi bi-qr-code"></i> {wallet.walletId}
						</span>
					</div>
				</section>
			</Reveal>

			{/* ==================== TABS ==================== */}
			<div className={styles.tabs} role="tablist">
				{tabs.map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={tab === t.id}
						className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
						onClick={() => setTab(t.id)}
					>
						<i className={t.icon}></i> {t.label}
						{t.count !== undefined && (
							<span className={styles.tabCount}>{t.count}</span>
						)}
					</button>
				))}
			</div>

			{/* ==================== OVERVIEW ==================== */}
			{tab === "overview" && (
				<div className={styles.tabBody}>
					<Reveal>
						<section className={styles.section}>
							<div className={styles.sectionHead}>
								<div>
									<h3 className={styles.sectionTitle}>
										<span className={styles.sectionIndex}>01</span>
										<i
											className="bi bi-stars"
											style={{ color: "var(--pri)" }}
										></i>{" "}
										Quick Actions
									</h3>
									<p className={styles.sectionSub}>
										Everything launches as a guided modal — no scrolling, no
										clutter.
									</p>
								</div>
							</div>
							<div className={styles.featureGrid}>
								{features.map((f) => (
									<button
										type="button"
										key={f.modal}
										className={styles.featureCard}
										onClick={() => openModal(f.modal)}
									>
										<span
											className={styles.featureIcon}
											style={{ background: `${f.color}1a`, color: f.color }}
										>
											<i className={f.icon}></i>
										</span>
										<span className={styles.featureBody}>
											<span className={styles.featureLabel}>{f.label}</span>
											<span className={styles.featureDesc}>{f.desc}</span>
										</span>
										<i
											className={`bi bi-chevron-right ${styles.featureArrow}`}
										></i>
									</button>
								))}
							</div>
						</section>
					</Reveal>

					<Reveal delay={60}>
						<section className={styles.section}>
							<div className={styles.sectionHead}>
								<div>
									<h3 className={styles.sectionTitle}>
										<span className={styles.sectionIndex}>02</span>
										<i
											className="bi bi-signpost-split"
											style={{ color: "var(--success)" }}
										></i>{" "}
										Activation Journey
									</h3>
									<p className={styles.sectionSub}>
										Every milestone your wallet passed on the way to anchoring
										your hub.
									</p>
								</div>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSm}`}
									onClick={() => openModal("tourGuideModal")}
								>
									<i className="bi bi-play-circle"></i> Replay Tour
								</button>
							</div>
							<div className={styles.journeyStrip}>
								{journeySteps.map((step, i) => (
									<div
										key={step.title}
										className={`${styles.journeyItem} ${step.state === "done" ? styles.journeyDone : step.state === "current" ? styles.journeyCurrent : styles.journeyPending}`}
									>
										<span className={styles.journeyDot}>
											<i
												className={`bi ${step.state === "pending" ? "bi-dot" : step.icon}`}
											></i>
										</span>
										{step.state === "current" && (
											<span className={styles.journeyPulse}></span>
										)}
										{i < journeySteps.length - 1 && (
											<span className={styles.journeyLine}></span>
										)}
										<div className={styles.journeyItemBody}>
											<span className={styles.journeyTitle}>
												{step.title}
												{step.state === "current" && (
													<span className={styles.journeyTag}>
														<i className="bi bi-arrow-repeat"></i> In progress
													</span>
												)}
												{step.state === "pending" && (
													<span className={styles.journeyTag}>
														<i className="bi bi-hourglass-split"></i> Up next
													</span>
												)}
											</span>
											<span className={styles.journeyMeta}>{step.meta}</span>
											<span className={styles.journeyDate}>{step.date}</span>
										</div>
									</div>
								))}
							</div>
						</section>
					</Reveal>

					<Reveal delay={120}>
						<section className={styles.section}>
							<div className={styles.sectionHead}>
								<div>
									<h3 className={styles.sectionTitle}>
										<span className={styles.sectionIndex}>03</span>
										<i
											className="bi bi-clock-history"
											style={{ color: "var(--info)" }}
										></i>{" "}
										Recent Activity
									</h3>
									<p className={styles.sectionSub}>
										Latest events across your linked dashboards.
									</p>
								</div>
							</div>
							<div className={styles.activityCard}>
								{activity.map((a) => (
									<div className={styles.activityRow} key={a.title}>
										<span
											className={styles.activityIcon}
											style={{ background: a.bg, color: a.color }}
										>
											<i className={a.icon}></i>
										</span>
										<span className={styles.activityBody}>
											<span className={styles.activityTitle}>{a.title}</span>
											<span className={styles.activityMeta}>
												{a.meta.join(" · ")}
											</span>
										</span>
										{a.amt && (
											<span
												className={`${styles.activityAmt} ${a.dir === "in" ? styles.activityIn : styles.activityOut}`}
											>
												{a.amt}
											</span>
										)}
									</div>
								))}
							</div>
						</section>
					</Reveal>
				</div>
			)}

			{/* ==================== LIVE FLOW ==================== */}
			{tab === "flow" && (
				<Reveal>
					<AccountFlowChart links={activeLinks} openModal={openModal} />
				</Reveal>
			)}

			{/* ==================== DASHBOARDS ==================== */}
			{tab === "dashboards" && (
				<Reveal>
					<section className={styles.section}>
						<div className={styles.sectionHead}>
							<div>
								<h3 className={styles.sectionTitle}>
									<span className={styles.sectionIndex}>04</span>
									<i
										className="bi bi-grid-3x3-gap"
										style={{ color: "var(--pri)" }}
									></i>{" "}
									Your Dashboards
								</h3>
								<p className={styles.sectionSub}>
									{activeCount} active · {pendingCount} waiting on activation ·
									1 suspended
								</p>
							</div>
						</div>
						<div className={styles.dashGrid}>
							{dashboards.map((d) => (
								<div className={styles.dashCard} key={d.id}>
									<div className={styles.dashTop}>
										<span
											className={styles.dashIcon}
											style={{ background: d.bg, color: d.color }}
										>
											<i className={d.icon}></i>
										</span>
										{d.notify ? (
											<span
												className={styles.notifDot}
												title="Action needed"
											></span>
										) : (
											<span className={styles.dashLast}>
												<i className="bi bi-clock-history"></i> {d.last}
											</span>
										)}
									</div>
									<div className={styles.dashName}>{d.name}</div>
									<div className={styles.dashDesc}>{d.desc}</div>
									<span
										className={`${styles.badge} ${d.variant === "success" ? styles.badgeSuccess : d.variant === "warning" ? styles.badgeWarning : d.variant === "danger" ? styles.badgeDanger : styles.badgeGrey}`}
									>
										<i
											className={`bi ${d.variant === "success" ? "bi-check-circle" : d.variant === "warning" ? "bi-hourglass-split" : d.variant === "danger" ? "bi-exclamation-octagon" : "bi-circle"}`}
										></i>
										{d.status}
									</span>
									<div className={styles.dashActions}>
										{"route" in d && d.route ? (
											<a
												href={d.route}
												className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSm}`}
											>
												<i className="bi bi-box-arrow-in-right"></i> Enter
											</a>
										) : (
											<button
												type="button"
												className={`${styles.button} ${d.action === "Revoke" ? styles.buttonDanger : styles.buttonPrimary} ${styles.buttonSm}`}
												onClick={() => {
													if (d.modal) openModal(d.modal);
												}}
											>
												<i
													className={`bi ${d.action === "Revoke" ? "bi-x-octagon" : d.action === "Activate" ? "bi-stars" : "bi-box-arrow-in-right"}`}
												></i>{" "}
												{d.action}
											</button>
										)}
										{d.status === "Active" && (
											<button
												type="button"
												className={`${styles.button} ${styles.buttonSm}`}
												title="Permissions"
												onClick={() => openModal("linkPermissionsModal")}
											>
												<i className="bi bi-sliders"></i>
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</section>
				</Reveal>
			)}

			{/* ==================== MANAGE ==================== */}
			{tab === "manage" && (
				<div className={styles.tabBody}>
					<Reveal>
						<section className={styles.section}>
							<div className={styles.sectionHead}>
								<div>
									<h3 className={styles.sectionTitle}>
										<span className={styles.sectionIndex}>05</span>
										<i
											className="bi bi-shield-lock"
											style={{ color: "var(--purple)" }}
										></i>{" "}
										Security, Privacy & Support
									</h3>
									<p className={styles.sectionSub}>
										Account controls, consents and help — always one tap away.
									</p>
								</div>
							</div>
							<div className={styles.featureGrid}>
								{utilities.map((u) => (
									<button
										type="button"
										key={u.modal}
										className={`${styles.featureCard} ${u.modal === "revokeAllAccessModal" ? styles.featureCardDanger : ""}`}
										onClick={() => openModal(u.modal)}
									>
										<span
											className={styles.featureIcon}
											style={{ background: `${u.color}1a`, color: u.color }}
										>
											<i className={u.icon}></i>
										</span>
										<span className={styles.featureBody}>
											<span className={styles.featureLabel}>{u.label}</span>
											<span className={styles.featureDesc}>{u.desc}</span>
										</span>
										<i
											className={`bi bi-chevron-right ${styles.featureArrow}`}
										></i>
									</button>
								))}
							</div>
						</section>
					</Reveal>
				</div>
			)}

			{/* ==================== COMMAND PALETTE ==================== */}
			<CommandPalette
				open={paletteOpen}
				onClose={() => setPaletteOpen(false)}
				onCommand={openModal}
			/>

			{/* ==================== TOAST ==================== */}
			{toast && (
				<div className={styles.toast}>
					<i className="bi bi-check-circle-fill"></i> {toast}
				</div>
			)}

			{/* ==================== MODALS ==================== */}
			<WalletActivationModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
			/>
		</div>
	);
}
