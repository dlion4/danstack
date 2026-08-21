"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
	{ id: 1, name: "Transaction Hub", icon: "bi bi-arrow-left-right", bg: "var(--success-bg)", color: "var(--success)", desc: "Payments, P2P & remittances", status: "Active", variant: "success", last: "Today, 14:22", action: "Enter", modal: "walletHealthModal", notify: false, route: "/pm/app/transfer-overview" },
	{ id: 2, name: "Business Portal", icon: "bi bi-briefcase", bg: "var(--purple-bg)", color: "var(--purple)", desc: "Merchant payments, collections & payroll", status: "Activation Pending", variant: "warning", last: "—", action: "Activate", modal: "activateDashboardModal", notify: true },
	{ id: 3, name: "Utilities Hub", icon: "bi bi-lightning-charge", bg: "var(--warning-bg)", color: "var(--warning)", desc: "Pay bills, airtime & subscriptions", status: "Active", variant: "success", last: "Yesterday, 18:30", action: "Enter", modal: "walletHealthModal", notify: false, route: "/utility" },
	{ id: 4, name: "Developer Portal", icon: "bi bi-code-slash", bg: "var(--info-bg)", color: "var(--info)", desc: "API keys, webhooks & sandbox", status: "Not Activated", variant: "grey", last: "—", action: "Activate", modal: "activateDashboardModal", notify: false },
	{ id: 5, name: "Loans & Credit", icon: "bi bi-cash-stack", bg: "var(--info-bg)", color: "var(--info)", desc: "Personal & business loans", status: "Active", variant: "success", last: "25 Jun, 09:12", action: "Enter", modal: "activeLinksModal", notify: false },
	{ id: 6, name: "Savings & Investments", icon: "bi bi-piggy-bank", bg: "var(--purple-bg)", color: "var(--purple)", desc: "MMF, fixed deposits & SACCO", status: "Active", variant: "success", last: "24 Jun, 11:45", action: "Enter", modal: "activeLinksModal", notify: false },
	{ id: 7, name: "Crypto Center", icon: "bi bi-currency-bitcoin", bg: "var(--danger-bg)", color: "var(--danger)", desc: "Buy, sell & hold digital assets", status: "Suspended", variant: "danger", last: "20 Jun, 08:00", action: "Revoke", modal: "revokeAllAccessModal", notify: true },
	{ id: 8, name: "Cards Center", icon: "bi bi-credit-card-2-front", bg: "var(--info-bg)", color: "var(--info)", desc: "Virtual & physical cards", status: "Active", variant: "success", last: "Today, 11:05", action: "Enter", modal: "walletHealthModal", notify: false, route: "/cards/app" },
];

const consentItems = [
	{ name: "Terms of Service", desc: "General terms governing use of this PayMo dashboard." },
	{ name: "Acceptable Use Policy (AUP)", desc: "What you can and cannot do with dashboard features." },
	{ name: "AML Compliance Declaration", desc: "You confirm funds are from legitimate sources." },
	{ name: "CTF Acknowledgment", desc: "You agree to flag suspicious transactions." },
	{ name: "Data Sharing Consent", desc: "Allows cross-dashboard balance visibility for linked accounts." },
	{ name: "Cross-Dashboard Transaction Authorization", desc: "Permits transfers between your linked dashboards." },
	{ name: "Regulatory Compliance Attestation", desc: "CBK / KRA / sector-specific compliance confirmation." },
	{ name: "Fee Schedule & Pricing Acknowledgment", desc: "You accept the published fees for this dashboard." },
	{ name: "Privacy Policy Addendum", desc: "Dashboard-specific data processing addendum." },
	{ name: "Marketing & Promotional Consent (optional)", desc: "Optional — not mandatory for activation." },
];

const activeLinks = [
	{ id: 1, name: "PayMo Wallet Acc", origin: "Transaction Hub", icon: "bi bi-wallet2", bg: "var(--success-bg)", color: "var(--success)", number: "•••• 5530", linked: "12 Jan 2023", balance: "KES 1,284,300", status: "Active" as const, permission: "Full Control", full: true },
	{ id: 2, name: "Business Acc", origin: "Business Portal", icon: "bi bi-briefcase", bg: "var(--purple-bg)", color: "var(--purple)", number: "•••• 2207", linked: "03 Feb 2024", balance: "KES 6,150,000", status: "Active" as const, permission: "Full Control", full: true },
	{ id: 3, name: "Savings Acc", origin: "Savings & Investments", icon: "bi bi-piggy-bank", bg: "var(--warning-bg)", color: "var(--warning)", number: "•••• 7793", linked: "15 Mar 2024", balance: "KES 480,000", status: "Active" as const, permission: "View + Transfer In", full: false },
	{ id: 4, name: "Loan Acc", origin: "Loans & Credit", icon: "bi bi-cash-stack", bg: "var(--info-bg)", color: "var(--info)", number: "•••• 8910", linked: "02 Apr 2025", balance: "KES 0", status: "Paused" as const, permission: "View Only", full: false },
	{ id: 5, name: "Crypto Acc", origin: "Crypto Center", icon: "bi bi-currency-bitcoin", bg: "var(--danger-bg)", color: "var(--danger)", number: "•••• 0042", linked: "12 Jun 2025", balance: "USD 2,410", status: "Active" as const, permission: "View + Transfer In", full: false },
	{ id: 6, name: "Developer Acc", origin: "Developer Portal", icon: "bi bi-graph-up", bg: "var(--success-bg)", color: "var(--success)", number: "•••• 9091", linked: "20 Aug 2024", balance: "KES 2,100,000", status: "Active" as const, permission: "One-Way In", full: false },
];

const journeySteps = [
	{ title: "Account Created", meta: "PayMo profile onboarded with identity documents", date: "12 Jan 2023", state: "done", icon: "bi bi-person-check" },
	{ title: "KYC Verification", meta: "Verified tier — government ID, proof of address & selfie match", date: "14 Jan 2023", state: "done", icon: "bi bi-patch-check" },
	{ title: "Consent Suite Accepted", meta: "9 / 9 mandatory consents signed (Terms, AML, CTF, Privacy…)", date: "16 Jan 2023", state: "done", icon: "bi bi-file-earmark-check" },
	{ title: "PIN Confirmed", meta: "4-digit PIN + biometric enabled on all activation gates", date: "16 Jan 2023", state: "done", icon: "bi bi-shield-lock" },
	{ title: "Primary Wallet Live", meta: "PM-4521-8830-1024 funded & receiving across 4 currencies", date: "18 Jan 2023", state: "current", icon: "bi bi-wallet2" },
	{ title: "Link More Dashboards", meta: "4 links active · 1 paused — expand your hub", date: "Next step", state: "pending", icon: "bi bi-link-45deg" },
];

const quickActions = [
	{ modal: "activateDashboardModal", icon: "bi bi-stars", label: "Activate", color: "var(--acc)" },
	{ modal: "linkAccountModal", icon: "bi bi-link-45deg", label: "Link Account", color: "var(--success)" },
	{ modal: "activeLinksModal", icon: "bi bi-layout-three-columns", label: "Manage Links", color: "var(--info)" },
	{ modal: "moneyRelocationModal", icon: "bi bi-arrow-left-right", label: "Relocate Funds", color: "var(--warning)" },
	{ modal: "linkPermissionsModal", icon: "bi bi-sliders", label: "Permissions", color: "var(--purple)" },
	{ modal: "linkNotificationsModal", icon: "bi bi-bell", label: "Alert Routing", color: "var(--danger)" },
	{ modal: "linkLimitsModal", icon: "bi bi-speedometer2", label: "Limits", color: "var(--info)" },
	{ modal: "tourGuideModal", icon: "bi bi-signpost-2", label: "Guided Tour", color: "var(--pri)" },
];

const utilActions = [
	{ modal: "privacyModal", icon: "bi bi-shield-check", label: "Privacy Center" },
	{ modal: "preferencesModal", icon: "bi bi-sliders2", label: "Preferences" },
	{ modal: "supportHelpModal", icon: "bi bi-headset", label: "Support & Help" },
	{ modal: "relocationReceiptModal", icon: "bi bi-receipt", label: "Sample Receipt" },
	{ modal: "revokeAllAccessModal", icon: "bi bi-x-octagon", label: "Revoke All" },
	{ modal: "activationSuccessModal", icon: "bi bi-check2-circle", label: "Activation Proof" },
];

const activity = [
	{ icon: "bi bi-arrow-down-left", bg: "var(--success-bg)", color: "var(--success)", title: "Incoming transfer from Business Acc", meta: ["Today, 14:22", "Transaction Hub"], amt: "+KES 240,000", dir: "in" },
	{ icon: "bi bi-link-45deg", bg: "var(--info-bg)", color: "var(--info)", title: "Developer Acc linked (One-Way In)", meta: ["20 Aug 2024", "Permissions set"], amt: "", dir: "" },
	{ icon: "bi bi-arrow-up-right", bg: "var(--danger-bg)", color: "var(--danger)", title: "Funds relocated to Savings Acc", meta: ["Yesterday, 18:30", "Relocation wizard"], amt: "−KES 50,000", dir: "out" },
	{ icon: "bi bi-shield-check", bg: "var(--purple-bg)", color: "var(--purple)", title: "Consent suite renewed", meta: ["16 Jan 2023", "9 / 9 signed"], amt: "", dir: "" },
	{ icon: "bi bi-credit-card-2-front", bg: "var(--warning-bg)", color: "var(--warning)", title: "Cards Center activated", meta: ["Today, 11:05", "Virtual card issued"], amt: "", dir: "" },
];

const fetchWalletData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return { wallet, dashboards, consentItems, activeLinks };
};

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) { setVisible(true); observer.disconnect(); } },
			{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return (
		<div ref={ref} className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
			{children}
		</div>
	);
}

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
		return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
	}, [active, target, duration]);
	return value;
}

function StatCard({ label, icon, iconBg, iconColor, delta, deltaClass, format, value, progress, children }: {
	label: string; icon: string; iconBg: string; iconColor: string; delta: string; deltaClass: string;
	format: (v: number) => string; value: number; progress?: number; children?: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);
	const count = useCountUp(value, inView);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) { setInView(true); observer.disconnect(); } },
			{ threshold: 0.3 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return (
		<div ref={ref} className={styles.statCard}>
			<div className={styles.statCardTop}>
				<div className={styles.statCardIcon} style={{ background: iconBg, color: iconColor }}><i className={icon}></i></div>
				<span className={`${styles.statCardDelta} ${(styles as Record<string, string>)[deltaClass] || ""}`}>{delta}</span>
			</div>
			<p className={styles.statValue}>{format(inView ? count : 0)}</p>
			<p className={styles.statLabel}>{label}</p>
			{children}
			{progress !== undefined && (
				<div className={styles.statCardFoot}>
					<div className={styles.statCardProgress}>
						<div className={styles.statCardProgressFill} style={inView ? { width: `${progress}%` } : undefined}></div>
					</div>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Command palette (⌘K)                                               */
/* ------------------------------------------------------------------ */

interface Command { id: string; label: string; desc: string; icon: string; group: string; color: string; run: () => void; keys?: string }

function CommandPalette({ open, onClose, onCommand }: { open: boolean; onClose: () => void; onCommand: (id: string) => void }) {
	const [q, setQ] = useState("");
	const [active, setActive] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const commands: Command[] = useMemo(() => [
		{ id: "activateDashboardModal", label: "Activate Dashboard", desc: "Consent + PIN activation wizard", icon: "bi bi-stars", group: "Actions", color: "#f79009" },
		{ id: "linkAccountModal", label: "Link Account", desc: "Connect a dashboard account", icon: "bi bi-link-45deg", group: "Actions", color: "#12b76a" },
		{ id: "activeLinksModal", label: "Manage Links", desc: "All linked accounts & sync status", icon: "bi bi-layout-three-columns", group: "Actions", color: "#2e90fa" },
		{ id: "moneyRelocationModal", label: "Relocate Funds", desc: "8-step safe fund movement", icon: "bi bi-arrow-left-right", group: "Money", color: "#f79009" },
		{ id: "linkPermissionsModal", label: "Permissions", desc: "Presets & granular controls", icon: "bi bi-sliders", group: "Controls", color: "#7a5af8" },
		{ id: "linkNotificationsModal", label: "Alert Routing", desc: "Channels & quiet hours", icon: "bi bi-bell", group: "Controls", color: "#f04438" },
		{ id: "linkLimitsModal", label: "Cross-Dashboard Limits", desc: "Daily / monthly caps & velocity", icon: "bi bi-speedometer2", group: "Controls", color: "#2e90fa" },
		{ id: "revokeAllAccessModal", label: "Revoke All Access", desc: "Emergency panic button", icon: "bi bi-shield-exclamation", group: "Security", color: "#f04438" },
		{ id: "privacyModal", label: "Privacy Center", desc: "Data consent & visibility", icon: "bi bi-shield-check", group: "Security", color: "#12b76a" },
		{ id: "tourGuideModal", label: "Replay Guided Tour", desc: "8-step dashboard walkthrough", icon: "bi bi-signpost-2", group: "Help", color: "#12b76a" },
		{ id: "supportHelpModal", label: "Support & Help", desc: "Live chat, guides & emergency", icon: "bi bi-headset", group: "Help", color: "#2e90fa" },
		{ id: "go:transactions", label: "Go to Transaction Hub", desc: "/pm/app/transfer-overview", icon: "bi bi-box-arrow-in-right", group: "Navigate", color: "#12b76a", keys: "G T" },
		{ id: "go:cards", label: "Go to Cards Center", desc: "/cards/app", icon: "bi bi-credit-card-2-front", group: "Navigate", color: "#2e90fa", keys: "G C" },
		{ id: "go:utility", label: "Go to Utilities Hub", desc: "/utility", icon: "bi bi-lightning-charge", group: "Navigate", color: "#f79009", keys: "G U" },
	].map((c) => ({ ...c, run: () => onCommand(c.id) })), [onCommand]);

	const filtered = useMemo(() => {
		const t = q.trim().toLowerCase();
		if (!t) return commands;
		return commands.filter((c) => c.label.toLowerCase().includes(t) || c.desc.toLowerCase().includes(t) || c.group.toLowerCase().includes(t));
	}, [q, commands]);

	useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);
	useEffect(() => { setActive(0); }, [q]);

	if (!open) return null;

	const choose = (c: Command) => { c.run(); onClose(); };
	const onKey = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
		else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
		else if (e.key === "Enter" && filtered[active]) choose(filtered[active]);
		else if (e.key === "Escape") onClose();
	};

	const groups = Array.from(new Set(filtered.map((c) => c.group)));

	return (
		<div className={styles.paletteOverlay} onClick={onClose}>
			<div className={styles.palette} onClick={(e) => e.stopPropagation()}>
				<div className={styles.paletteHead}>
					<i className="bi bi-search"></i>
					<input ref={inputRef} className={styles.paletteInput} placeholder="Search actions, dashboards, settings…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
					<span className={styles.paletteKbd}>ESC</span>
				</div>
				<div className={styles.paletteList}>
					{filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--ink-500)", fontSize: 13 }}>No matches for "{q}"</div>}
					{groups.map((g) => (
						<div key={g}>
							<div className={styles.paletteGroup}>{g}</div>
							{filtered.filter((c) => c.group === g).map((c) => {
								const idx = filtered.indexOf(c);
								return (
									<button key={c.id} className={`${styles.paletteItem} ${idx === active ? styles.active : ""}`} onMouseEnter={() => setActive(idx)} onClick={() => choose(c)}>
										<span className={styles.paletteIcon} style={{ background: `${c.color}1a`, color: c.color }}><i className={c.icon}></i></span>
										<span className={styles.paletteLabel}>
											<span className={styles.paletteName}>{c.label}</span>
											<span className={styles.paletteDesc}>{c.desc}</span>
										</span>
										{c.keys && <span className={styles.paletteShort}>{c.keys}</span>}
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
	const [tab, setTab] = useState<"overview" | "dashboards" | "flow" | "hub" | "journey">("overview");
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [fabOpen, setFabOpen] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const [moreOpen, setMoreOpen] = useState(false);
	const moreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!moreOpen) return;
		const onDown = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false); };
		document.addEventListener("mousedown", onDown);
		return () => document.removeEventListener("mousedown", onDown);
	}, [moreOpen]);

	const openModal = (id: string) => {
		if (id.startsWith("go:")) {
			const route = id === "go:transactions" ? "/pm/app/transfer-overview" : id === "go:cards" ? "/cards/app" : "/utility";
			window.location.href = route;
			return;
		}
		setModalState((prev) => ({ ...prev, [id]: true }));
		setFabOpen(false);
	};
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 2200); };

	const { data } = useQuery({
		queryKey: ["walletActivationData"],
		queryFn: fetchWalletData,
		initialData: { wallet, dashboards, consentItems, activeLinks },
	});
	const { wallet: w, dashboards: dashList, activeLinks: actLinks } = data;

	// ⌘K shortcut
	useEffect(() => {
		const h = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
			if (e.key === "Escape") setFabOpen(false);
		};
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, []);

	const copyAccount = async () => {
		try { await navigator.clipboard.writeText(w.accountNumber); } catch { /* clipboard unavailable */ }
		setCopied(true);
		flash("Account number copied");
		window.setTimeout(() => setCopied(false), 1600);
	};

	const activeCount = dashList.filter((d) => d.status === "Active").length;
	const pendingCount = dashList.filter((d) => d.status === "Activation Pending" || d.status === "Not Activated").length;
	const suspendedCount = dashList.filter((d) => d.status === "Suspended").length;
	const linkedActive = actLinks.filter((l) => l.status === "Active").length;
	const health = 92;

	const tabs = [
		{ id: "overview", label: "Overview", icon: "bi bi-grid-1x2", count: undefined },
		{ id: "dashboards", label: "Dashboards", icon: "bi bi-grid-3x3-gap", count: dashList.length },
		{ id: "flow", label: "Live Flow", icon: "bi bi-diagram-3", count: actLinks.length },
		{ id: "hub", label: "Hub & Actions", icon: "bi bi-stars", count: undefined },
		{ id: "journey", label: "Journey", icon: "bi bi-signpost-split", count: undefined },
	] as const;

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<Link to="/pm/app/transfer-overview">Transactions</Link> /{" "}
						<Link to="/auth/hub">Account</Link> /{" "}
						<strong>Wallet Activation Hub</strong>
					</div>
					<h1 className={styles.pageTitle}>Wallet Activation & Cross-Dashboard Hub</h1>
					<p className={styles.pageDescription}>
						One command center for every PayMo surface your wallet powers — activate, link, set permissions and move money between dashboards.
					</p>
				</div>
				<div className={styles.pageActions}>
					<Link to="/pm/app/transfer-overview" className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}>
						<i className="bi bi-stars"></i> Go to Dashboard
					</Link>
					<div className={styles.popoverWrap} ref={moreRef}>
						<button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => setMoreOpen((o) => !o)}>
							<i className="bi bi-three-dots"></i> More
						</button>
						{moreOpen && (
							<>
								<div className={styles.popover} onMouseLeave={() => setMoreOpen(false)}>
									<button className={styles.popItem} onClick={() => { setMoreOpen(false); openModal("privacyModal"); }}><i className="bi bi-shield-check"></i> Privacy Center</button>
									<button className={styles.popItem} onClick={() => { setMoreOpen(false); openModal("preferencesModal"); }}><i className="bi bi-sliders2"></i> Preferences</button>
									<button className={styles.popItem} onClick={() => { setMoreOpen(false); openModal("supportHelpModal"); }}><i className="bi bi-headset"></i> Support & Help</button>
									<div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
									<button className={`${styles.popItem} ${styles.danger}`} onClick={() => { setMoreOpen(false); openModal("revokeAllAccessModal"); }}><i className="bi bi-shield-exclamation"></i> Revoke All Access</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* ==================== HERO — WALLET + HOW IT WORKS ==================== */}
			<Reveal>
				<div className={styles.bannerSplit}>
					<div className={styles.bannerWallet}>
						<div className={styles.bannerWalletGrid}></div>
						<div className={styles.bannerSheen}></div>
						<div className={styles.bannerBubbles}>
							{[ { s: 46, r: "18%", t: "42%", d: "0s" }, { s: 26, r: "30%", t: "58%", d: "1.6s" }, { s: 14, r: "12%", t: "68%", d: "3.1s" }, { s: 20, r: "24%", t: "30%", d: "4.4s" } ].map((b, i) => (
								<span key={i} className={styles.bannerBubble} style={{ width: b.s, height: b.s, right: b.r, top: b.t, animationDelay: b.d }}></span>
							))}
						</div>
						<div className={styles.bannerWalletTop}>
							<div className={styles.bannerWalletBrand}>
								<div className={styles.bannerWalletBrandLogo}><i className="bi bi-wallet2"></i></div>PAYMO WALLET
							</div>
							<span className={styles.bannerWalletChip}><i className="bi bi-check-circle"></i> {w.status}</span>
						</div>
						<div className={styles.bannerWalletNumberLabel}>Primary Account Number</div>
						<div className={styles.bannerWalletNumber}>
							{w.accountNumber}
							<button type="button" className={styles.bannerWalletCopy} title="Copy account number" onClick={copyAccount}>
								<i className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`}></i>
							</button>
							{copied && <span className={styles.bannerWalletCopied}>Copied!</span>}
						</div>
						<div className={styles.bannerWalletHolder}>
							<span className={styles.badge} style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}><i className="bi bi-gem"></i> {w.tier} KYC</span>
							<span>{w.holder}</span>
							<span className={styles.bannerWalletMeta}><i className="bi bi-qr-code"></i> {w.walletId}</span>
						</div>
						<div className={styles.bannerWalletBalanceLabel}>Available Balance • {w.currencies.join(" · ")} wallets</div>
						<div className={styles.bannerWalletBalance}>{w.balance}</div>
						<div className={styles.bannerWalletActions}>
							<button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => openModal("activateDashboardModal")}><i className="bi bi-stars"></i> Activate</button>
							<button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => openModal("linkAccountModal")}><i className="bi bi-link-45deg"></i> Link Account</button>
							<button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => openModal("activeLinksModal")}><i className="bi bi-layout-three-columns"></i> Manage Links</button>
						</div>
						<div className={styles.bannerWalletStats}>
							<div className={styles.bannerWalletStat}>Opened<strong>{w.opened}</strong></div>
							<div className={styles.bannerWalletStat}>Age<strong>{w.age}</strong></div>
							<div className={styles.bannerWalletStat}>Currencies<strong>{w.currencies.length} active</strong></div>
							<div className={styles.bannerWalletStat}>KYC Tier<strong>{w.tier}</strong></div>
						</div>
					</div>
					<HowItWorks openModal={openModal} />
				</div>
			</Reveal>

			{/* ==================== COMMAND BAR (sticky) ==================== */}
			<div className={styles.cmdBar}>
				<button type="button" className={styles.cmdSearch} onClick={() => setPaletteOpen(true)}>
					<i className="bi bi-search"></i>
					<span>Search actions, dashboards, settings…</span>
					<span className={styles.cmdKbd}>⌘K</span>
				</button>
				<div className={styles.cmdChips}>
					<button className={styles.cmdChip} onClick={() => openModal("activateDashboardModal")}><i className="bi bi-stars" style={{ color: "var(--acc)" }}></i> Activate</button>
					<button className={styles.cmdChip} onClick={() => openModal("linkAccountModal")}><i className="bi bi-link-45deg" style={{ color: "var(--success)" }}></i> Link</button>
					<button className={styles.cmdChip} onClick={() => openModal("moneyRelocationModal")}><i className="bi bi-arrow-left-right" style={{ color: "var(--warning)" }}></i> Relocate</button>
					<button className={styles.cmdChip} onClick={() => openModal("tourGuideModal")}><i className="bi bi-play-circle" style={{ color: "var(--info)" }}></i> Tour</button>
					<button className={`${styles.cmdChip} ${styles.cmdChipDanger}`} onClick={() => openModal("revokeAllAccessModal")}><i className="bi bi-shield-exclamation"></i> Revoke All</button>
				</div>
			</div>

			{/* ==================== LIVE TICKER ==================== */}
			<div className={styles.ticker}>
				<span className={styles.tickerLive}>Live</span>
				<div className={styles.tickerTrack}>
					<div className={styles.tickerMove}>
						<span><i className="bi bi-check-circle"></i> <b>{activeCount}/{dashList.length}</b> dashboards active</span>
						<span><i className="bi bi-link-45deg"></i> <b>{linkedActive}</b> links live · <b>{actLinks.length - linkedActive}</b> paused</span>
						<span><i className="bi bi-bank"></i> Combined balance <b>KES 8.4M</b></span>
						<span><i className="bi bi-shield-check"></i> Consent health <b>9/9</b> · renews Jan 2027</span>
						<span><i className="bi bi-lightning-charge"></i> Last sync <b>just now</b></span>
						{/* duplicate for seamless loop */}
						<span><i className="bi bi-check-circle"></i> <b>{activeCount}/{dashList.length}</b> dashboards active</span>
						<span><i className="bi bi-link-45deg"></i> <b>{linkedActive}</b> links live · <b>{actLinks.length - linkedActive}</b> paused</span>
						<span><i className="bi bi-bank"></i> Combined balance <b>KES 8.4M</b></span>
						<span><i className="bi bi-shield-check"></i> Consent health <b>9/9</b> · renews Jan 2027</span>
						<span><i className="bi bi-lightning-charge"></i> Last sync <b>just now</b></span>
					</div>
				</div>
			</div>

			{/* ==================== TABbed COMMAND CENTER ==================== */}
			<Reveal>
				<div className={styles.panel}>
					<div className={styles.panelHead}>
						<div className={styles.panelNo}>⌘</div>
						<div>
							<h3 className={styles.panelTitle}><i className="bi bi-command"></i> Command Center</h3>
							<p className={styles.panelSub}>Every hub capability lives behind a tab — no scrolling, no clutter. Switch, act, done.</p>
						</div>
						<div className={styles.panelActions}>
							<button type="button" className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`} onClick={() => openModal("activateDashboardModal")}>
								<i className="bi bi-plus-lg"></i> Activate New
							</button>
						</div>
					</div>

					<div className={styles.tabs} role="tablist">
						{tabs.map((t) => (
							<button key={t.id} role="tab" aria-selected={tab === t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`} onClick={() => setTab(t.id)}>
								<i className={t.icon}></i> {t.label}
								{t.count !== undefined && <span className={styles.tabCount}>{t.count}</span>}
							</button>
						))}
					</div>

					<div className={styles.tabPanel} key={tab}>
						{tab === "overview" && (
							<div>
								<div className={styles.statsRow}>
									<StatCard label="Activated Dashboards" icon="bi bi-grid-3x3-gap" iconBg="var(--success-bg)" iconColor="var(--pri-600)" delta={`${activeCount} of ${dashList.length}`} deltaClass="deltaUp" format={(v) => `${Math.round(v)}`} value={activeCount} progress={(activeCount / dashList.length) * 100}>
										<span className={styles.statCardMeta}>{pendingCount} pending · {suspendedCount} suspended</span>
									</StatCard>
									<StatCard label="Linked Accounts" icon="bi bi-link-45deg" iconBg="var(--info-bg)" iconColor="var(--info)" delta={`${linkedActive} active`} deltaClass="deltaInfo" format={(v) => `${Math.round(v)}`} value={actLinks.length} progress={(linkedActive / actLinks.length) * 100}>
										<span className={styles.statCardMeta}>{actLinks.length - linkedActive} paused / requested</span>
									</StatCard>
									<StatCard label="Combined Linked Balance" icon="bi bi-bank" iconBg="var(--purple-bg)" iconColor="var(--purple)" delta="+12% this month" deltaClass="deltaUp" format={(v) => `KES ${v.toFixed(1)}M`} value={8.4} progress={86}>
										<span className={styles.statCardMeta}>Across {actLinks.length} linked accounts</span>
									</StatCard>
									<StatCard label="Consent Suite Health" icon="bi bi-shield-check" iconBg="var(--warning-bg)" iconColor="var(--acc)" delta="Renews Jan 2027" deltaClass="deltaWarn" format={(v) => `${Math.round(v)} / 9`} value={9} progress={100}>
										<span className={styles.statCardMeta}>All mandatory consents current</span>
									</StatCard>
								</div>

								<div className={styles.widgetGrid} style={{ marginTop: 14 }}>
									<div>
										<div className={styles.miniHead}>
											<span className={styles.miniTitle}><i className="bi bi-activity"></i> Recent Activity</span>
											<button className={styles.miniLink} onClick={() => openModal("activeLinksModal")}>View all →</button>
										</div>
										<div className={styles.feed}>
											{activity.map((a, i) => (
												<div className={styles.feedItem} key={i} onClick={() => openModal("activeLinksModal")}>
													<span className={styles.feedDot} style={{ background: a.bg, color: a.color }}><i className={a.icon}></i></span>
													<div className={styles.feedBody}>
														<div className={styles.feedTitle}>{a.title}</div>
														<div className={styles.feedMeta}>{a.meta.map((m, j) => <span key={j}>{m}</span>)}</div>
													</div>
													{a.amt && <span className={`${styles.feedAmt} ${a.dir}`}>{a.amt}</span>}
												</div>
											))}
										</div>
									</div>
									<div>
										<div className={styles.miniHead}>
											<span className={styles.miniTitle}><i className="bi bi-heart-pulse"></i> Hub Health</span>
										</div>
										<div className={styles.healthCard}>
											<div className={styles.ring}>
												<svg width="64" height="64" viewBox="0 0 64 64">
													<circle className={styles.ringTrack} cx="32" cy="32" r="27" fill="none" strokeWidth="6" />
													<circle className={styles.ringFill} cx="32" cy="32" r="27" fill="none" strokeWidth="6" strokeDasharray={2 * Math.PI * 27} strokeDashoffset={2 * Math.PI * 27 * (1 - health / 100)} />
												</svg>
												<div className={styles.ringVal}>{health}<small>/ 100</small></div>
											</div>
											<div>
												<div style={{ fontSize: 13, fontWeight: 700 }}>Excellent</div>
												<div style={{ fontSize: 12, color: "var(--ink-500)", lineHeight: 1.5 }}>All systems linked and consent-current. {suspendedCount} dashboard needs attention.</div>
												<button className={styles.miniLink} style={{ marginTop: 6 }} onClick={() => openModal("supportHelpModal")}>Run health check →</button>
											</div>
										</div>

										<div className={styles.miniHead} style={{ marginTop: 16 }}>
											<span className={styles.miniTitle}><i className="bi bi-lightning-charge"></i> Quick Actions</span>
										</div>
										<div className={styles.quickGrid}>
											{quickActions.slice(0, 4).map((qa) => (
												<button type="button" key={qa.modal} className={styles.quickButton} onClick={() => openModal(qa.modal)}>
													<i className={qa.icon} style={{ color: qa.color }}></i> {qa.label}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{tab === "dashboards" && (
							<div>
								<div className={styles.dashboardGrid}>
									{dashList.map((d) => (
										<div className={styles.dashboardCard} key={d.id}>
											<div className={styles.dashboardTop}>
												<div className={styles.dashboardIcon} style={{ background: d.bg, color: d.color }}><i className={d.icon}></i></div>
												{d.notify ? <span className={styles.notifDot} title="Action needed"></span> : <span className={styles.dashboardLast}><i className="bi bi-clock-history"></i> {d.last}</span>}
											</div>
											<div className={styles.dashboardName}>{d.name}</div>
											<div className={styles.dashboardDesc}>{d.desc}</div>
											<span className={`${styles.dashboardStatus} ${d.variant === "success" ? styles.badgeSuccess : d.variant === "warning" ? styles.badgeWarning : d.variant === "danger" ? styles.badgeDanger : styles.badgeGrey}`}>
												<i className={`bi ${d.variant === "success" ? "bi-check-circle" : d.variant === "warning" ? "bi-hourglass-split" : d.variant === "danger" ? "bi-exclamation-octagon" : "bi-circle"}`}></i>
												{d.status}
											</span>
											<div className={styles.dashboardActions}>
												{d.route && d.status === "Active" ? (
													<Link to={d.route} className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}><i className="bi bi-box-arrow-in-right"></i> Enter</Link>
												) : (
													<button type="button" className={`${styles.button} ${d.action === "Revoke" ? styles.buttonDanger : styles.buttonPrimary} ${styles.buttonSmall}`} onClick={() => openModal(d.modal)}>
														<i className={`bi ${d.action === "Revoke" ? "bi-x-octagon" : d.action === "Activate" ? "bi-stars" : "bi-box-arrow-in-right"}`}></i> {d.action}
													</button>
												)}
												{d.status === "Active" && <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal("linkPermissionsModal")} title="Permissions"><i className="bi bi-sliders"></i></button>}
											</div>
										</div>
									))}
								</div>
								<div className={styles.trustStrip} style={{ marginTop: 14 }}>
									<div className={styles.trustItem}><i className="bi bi-shield-lock" style={{ background: "var(--success-bg)", color: "var(--success)" }}></i><span>Bank-grade encryption<small>AES-256 at rest · TLS 1.3 in transit</small></span></div>
									<div className={styles.trustItem}><i className="bi bi-patch-check" style={{ background: "var(--info-bg)", color: "var(--info)" }}></i><span>CBK regulated<small>Licensed Payment Service Provider</small></span></div>
									<div className={styles.trustItem}><i className="bi bi-arrow-counterclockwise" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}></i><span>Instant reversal<small>Failed transfers auto-refund</small></span></div>
								</div>
							</div>
						)}

						{tab === "flow" && <AccountFlowChart links={actLinks} openModal={openModal} />}

						{tab === "hub" && (
							<div>
								<ManagementHub openModal={openModal} />
								<div className={styles.miniHead} style={{ marginTop: 16 }}>
									<span className={styles.miniTitle}><i className="bi bi-lightning-charge-fill"></i> All Quick Actions</span>
								</div>
								<div className={styles.quickGrid}>
									{quickActions.map((qa) => (
										<button type="button" key={qa.modal} className={styles.quickButton} onClick={() => openModal(qa.modal)}>
											<i className={qa.icon} style={{ color: qa.color }}></i> {qa.label}
										</button>
									))}
								</div>
								<div className={styles.miniHead} style={{ marginTop: 16 }}>
									<span className={styles.miniTitle}><i className="bi bi-shield-lock"></i> Security, Privacy & Support</span>
								</div>
								<div className={styles.utilStrip}>
									{utilActions.map((u) => (
										<button type="button" key={u.modal} className={styles.utilItem} onClick={() => openModal(u.modal)}>
											<i className={u.icon}></i> {u.label}
										</button>
									))}
								</div>
							</div>
						)}

						{tab === "journey" && <JourneySection openModal={openModal} />}
					</div>
				</div>
			</Reveal>

			{/* ==================== COMMAND PALETTE ==================== */}
			<CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onCommand={openModal} />

			{/* ==================== FAB ==================== */}
			<div className={styles.fab}>
				{fabOpen && (
					<div className={styles.fabMenu}>
						{[
							{ modal: "activateDashboardModal", icon: "bi bi-stars", label: "Activate Dashboard", bg: "var(--acc)" },
							{ modal: "linkAccountModal", icon: "bi bi-link-45deg", label: "Link Account", bg: "var(--success)" },
							{ modal: "moneyRelocationModal", icon: "bi bi-arrow-left-right", label: "Relocate Funds", bg: "var(--warning)" },
							{ modal: "supportHelpModal", icon: "bi bi-headset", label: "Get Support", bg: "var(--info)" },
						].map((f, i) => (
							<button key={f.modal} className={styles.fabItem} style={{ animationDelay: `${i * 40}ms` }} onClick={() => openModal(f.modal)}>
								{f.label}<i style={{ background: f.bg }}><i className={f.icon}></i></i>
							</button>
						))}
					</div>
				)}
				<button type="button" className={styles.fabBtn} onClick={() => setFabOpen((o) => !o)} aria-label="Quick actions" style={{ transform: fabOpen ? "rotate(45deg)" : undefined }}>
					<i className={`bi ${fabOpen ? "bi-x-lg" : "bi-plus-lg"}`}></i>
				</button>
			</div>

			{/* ==================== TOAST ==================== */}
			{toast && <div className={styles.toast}><i className="bi bi-check-circle-fill"></i> {toast}</div>}

			{/* ==================== MODALS ==================== */}
			<WalletActivationModals modalState={modalState} openModal={openModal} closeModal={closeModal} />
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
			(entries) => { if (entries[0].isIntersecting) { setInView(true); observer.disconnect(); } },
			{ threshold: 0.15 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className={`${styles.journeyCard} ${inView ? styles.journeyInView : ""}`}>
			<div className={styles.miniHead}>
				<span className={styles.miniTitle} style={{ fontSize: 15 }}><i className="bi bi-signpost-split"></i> Activation Journey</span>
				<button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal("tourGuideModal")}><i className="bi bi-play-circle"></i> Replay Tour</button>
			</div>
			<p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: "0 0 14px" }}>Every milestone your wallet has passed on the way to becoming the anchor of your cross-dashboard hub.</p>
			<div className={styles.journeyTrack}>
				{journeySteps.map((step) => (
					<div key={step.title} className={`${styles.journeyStep} ${step.state === "done" ? styles.journeyStepDone : step.state === "current" ? styles.journeyStepCurrent : styles.journeyStepPending}`}>
						<span className={styles.journeyDot}><i className={`bi ${step.state === "pending" ? "bi-dot" : step.icon}`}></i></span>
						<div className={styles.journeyStepBody}>
							<div>
								<div className={styles.journeyStepTitle}>
									{step.title}
									{step.state === "current" && (
										<span className={styles.journeyStepChip} style={{ background: "var(--success-bg)", color: "var(--pri-700)" }}><i className="bi bi-arrow-repeat"></i> In progress</span>
									)}
									{step.state === "pending" && (
										<span className={styles.journeyStepChip} style={{ background: "var(--ink-100)", color: "var(--ink-500)" }}><i className="bi bi-hourglass-split"></i> Up next</span>
									)}
								</div>
								<div className={styles.journeyStepMeta}>{step.meta}</div>
							</div>
							<span className={styles.journeyStepDate}>{step.date}</span>
						</div>
					</div>
				))}
			</div>
			<div className={styles.trustStrip} style={{ marginTop: 16 }}>
				<div className={styles.trustItem}><i className="bi bi-shield-check" style={{ background: "var(--success-bg)", color: "var(--success)" }}></i><span>PIN + biometric gates<small>Every action authenticated</small></span></div>
				<div className={styles.trustItem}><i className="bi bi-journal-check" style={{ background: "var(--info-bg)", color: "var(--info)" }}></i><span>Full audit trail<small>Timestamp + IP + device logged</small></span></div>
				<div className={styles.trustItem}><i className="bi bi-bell" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}></i><span>Real-time alerts<small>Push · SMS · Email · WhatsApp</small></span></div>
			</div>
		</div>
	);
}
