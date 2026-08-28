/**
 * PayMo Business — Mobile Money & PSP Integration Hub.
 *
 * Mobile wallet command center: M-Pesa, Airtel Money, T-Kash and PesaLink
 * wallets plus 20+ PSP integrations — single & bulk disbursements, linked
 * accounts, KYC compliance, reconciliation, fee comparison and support.
 *
 * Rebuilt in the navy/emerald PayMo blueprint: executive hero snapshot,
 * numbered business sections, semantic tables, floating command bar and
 * fully data-driven modal workflows (see DESIGN-BLUEPRINT.md).
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import MobileMoneyModals, {
	type MobileMoneyData,
} from "../components/MobileMoneyModals";
import styles from "../styles/mobileMoney.module.css";

type BadgeTone =
	| "badgeSuccess"
	| "badgeWarn"
	| "badgeDanger"
	| "badgeInfo"
	| "badgeViolet"
	| "badgeNeutral";
type IconTone =
	| "iconGreen"
	| "iconBlue"
	| "iconViolet"
	| "iconAmber"
	| "iconDanger";

interface HeroSnapshot {
	live: string;
	value: string;
	detail: string;
	buttons: { label: string; icon: string; modal: string }[];
	metrics: { value: string; label: string }[];
}

interface KpiCard {
	id: string;
	icon: string;
	iconTone: IconTone;
	label: string;
	meta: string;
	value: string;
	foot: string;
}

interface AttentionItem {
	id: string;
	severity: "danger" | "warn" | "info";
	title: string;
	detail: string;
	actionLabel: string;
	modal: string;
}

interface Suggestion {
	id: string;
	priority: "high" | "medium" | "low";
	icon: string;
	title: string;
	detail: string;
	actionLabel: string;
	modal: string;
}

interface QuickAction {
	id: string;
	icon: string;
	label: string;
	detail: string;
	modal: string;
}

interface Wallet {
	id: string;
	name: string;
	provider: string;
	providerTone: BadgeTone;
	balance: string;
	dailyLimit: string;
	health: number;
	txns24h: string;
}

interface SnapshotBox {
	id: string;
	label: string;
	value: string;
	tone: "statAccent" | "statInfo" | "statWarn";
}

interface LinkedWallet {
	id: string;
	number: string;
	provider: string;
	owner: string;
	kyc: string;
	kycTone: BadgeTone;
	status: string;
	statusTone: BadgeTone;
	perms: string;
}

interface TransferRow {
	id: string;
	date: string;
	route: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
	ref: string;
	actionLabel: string;
	modal: string;
}

interface PspRow {
	id: string;
	name: string;
	type: string;
	status: string;
	statusTone: BadgeTone;
	uptime: string;
	uptimeTone: BadgeTone;
	settlement: string;
}

interface KycStat {
	label: string;
	count: string;
	tone: BadgeTone;
}

interface LimitRow {
	label: string;
	value: string;
}

interface TrendBar {
	label: string;
	height: number;
	highlight?: boolean;
}

interface SupportContact {
	label: string;
	value: string;
	icon: string;
}

interface AlertSetting {
	label: string;
	checked: boolean;
}

interface IntegrationHealth {
	label: string;
	status: string;
	tone: BadgeTone;
}

export interface MobileMoneyConfig {
	hero: HeroSnapshot;
	kpis: KpiCard[];
	attention: AttentionItem[];
	suggestions: Suggestion[];
	quickActions: QuickAction[];
	wallets: Wallet[];
	snapshot: SnapshotBox[];
	linkedWallets: LinkedWallet[];
	recentTransfers: TransferRow[];
	psps: PspRow[];
	kycStatus: KycStat[];
	txnLimits: LimitRow[];
	trendBars: TrendBar[];
	reconciliation: { label: string; value: string; sub: string };
	supportContacts: SupportContact[];
	alertSettings: AlertSetting[];
	integrationHealth: IntegrationHealth[];
}

const initialMockData: MobileMoneyConfig = {
	hero: {
		live: "Mobile money command center live",
		value: "12 wallets linked",
		detail:
			"M-Pesa, Airtel Money, T-Kash, PesaLink, 8 PSPs and 3 bank integrations — all reconciled in real time.",
		buttons: [
			{ label: "Send Money", icon: "bi-send", modal: "sendMoneyModal" },
			{
				label: "Bulk Transfer",
				icon: "bi-collection",
				modal: "bulkTransferModal",
			},
			{
				label: "Link Wallet",
				icon: "bi-plus-circle",
				modal: "linkWalletModal",
			},
		],
		metrics: [
			{ value: "KES 18.4M", label: "Today's volume" },
			{ value: "99.2%", label: "Success rate" },
			{ value: "12 wallets", label: "Connected" },
		],
	},
	kpis: [
		{
			id: "pending",
			icon: "bi-clock-history",
			iconTone: "iconAmber",
			label: "Pending settlement",
			meta: "Batches awaiting auto-settle",
			value: "KES 4.82M",
			foot: "7 batches · next auto-settle today at 6 PM",
		},
		{
			id: "volume",
			icon: "bi-graph-up-arrow",
			iconTone: "iconBlue",
			label: "Today's volume",
			meta: "Across all mobile rails",
			value: "KES 18.4M",
			foot: "+31% vs yesterday · 99.2% success rate",
		},
		{
			id: "balance",
			icon: "bi-wallet2",
			iconTone: "iconGreen",
			label: "Total mobile balance",
			meta: "All connected wallets",
			value: "KES 24.05M",
			foot: "Net flow today +KES 3.82M",
		},
		{
			id: "compliance",
			icon: "bi-shield-check",
			iconTone: "iconViolet",
			label: "Compliance health",
			meta: "KYC & audit posture",
			value: "98.7",
			foot: "45 KYC refreshes due · last audit 12 Jun",
		},
	],
	attention: [
		{
			id: "att-batch",
			severity: "danger",
			title: "M-Pesa B2C batch failed (47 txns)",
			detail: "KES 1.24M — retry or send to manual review",
			actionLabel: "Retry",
			modal: "bulkRetryModal",
		},
		{
			id: "att-kyc",
			severity: "warn",
			title: "KYC refresh required (45 accounts)",
			detail: "Due by 30 Jun 2025 to keep wallets active",
			actionLabel: "Start",
			modal: "kycBulkModal",
		},
		{
			id: "att-token",
			severity: "info",
			title: "Airtel Money API token expiring",
			detail: "In 6 days — renew PSP credentials now",
			actionLabel: "Renew",
			modal: "pspSettingsModal",
		},
	],
	suggestions: [
		{
			id: "sug-b2b",
			priority: "high",
			icon: "bi-lightning-charge",
			title: "Enable instant M-Pesa B2B for 3 suppliers",
			detail: "Save 2–4 hours per payment cycle on recurring disbursements.",
			actionLabel: "Enable",
			modal: "pspSettingsModal",
		},
		{
			id: "sug-tkash",
			priority: "high",
			icon: "bi-graph-down",
			title: "Switch 18% of volume to T-Kash",
			detail: "Lower fees on small disbursements — compare fee tables.",
			actionLabel: "Compare",
			modal: "pspCompareModal",
		},
		{
			id: "sug-recon",
			priority: "medium",
			icon: "bi-shield-check",
			title: "Run daily reconciliation at 10 PM",
			detail: "Catches 99.8% of wallet mismatches automatically overnight.",
			actionLabel: "Schedule",
			modal: "reconcileModal",
		},
	],
	quickActions: [
		{
			id: "qa-send",
			icon: "bi-send",
			label: "Send Money",
			detail: "Single mobile transfer",
			modal: "sendMoneyModal",
		},
		{
			id: "qa-bulk",
			icon: "bi-collection",
			label: "Bulk Transfer",
			detail: "Batch disbursements",
			modal: "bulkTransferModal",
		},
		{
			id: "qa-link",
			icon: "bi-plus-circle",
			label: "Link Wallet",
			detail: "Connect a new mobile account",
			modal: "linkWalletModal",
		},
		{
			id: "qa-recon",
			icon: "bi-arrow-repeat",
			label: "Reconcile",
			detail: "Match wallet statements",
			modal: "reconcileModal",
		},
		{
			id: "qa-dispute",
			icon: "bi-exclamation-triangle",
			label: "Dispute",
			detail: "File a transaction dispute",
			modal: "disputeModal",
		},
		{
			id: "qa-psp",
			icon: "bi-gear",
			label: "PSP Settings",
			detail: "Credentials & webhooks",
			modal: "pspSettingsModal",
		},
		{
			id: "qa-kyc",
			icon: "bi-person-check",
			label: "KYC Refresh",
			detail: "Bulk eKYC outreach",
			modal: "kycBulkModal",
		},
		{
			id: "qa-statement",
			icon: "bi-download",
			label: "Statements",
			detail: "Export wallet reports",
			modal: "statementModal",
		},
	],
	wallets: [
		{
			id: "w1",
			name: "Business Paybill",
			provider: "M-Pesa",
			providerTone: "badgeSuccess",
			balance: "KES 8,420,500",
			dailyLimit: "KES 50M",
			health: 98,
			txns24h: "1,842",
		},
		{
			id: "w2",
			name: "Disbursement Till",
			provider: "Airtel Money",
			providerTone: "badgeInfo",
			balance: "KES 2,184,000",
			dailyLimit: "KES 20M",
			health: 94,
			txns24h: "892",
		},
		{
			id: "w3",
			name: "Collections Till",
			provider: "T-Kash",
			providerTone: "badgeWarn",
			balance: "KES 941,200",
			dailyLimit: "KES 10M",
			health: 87,
			txns24h: "312",
		},
		{
			id: "w4",
			name: "Payroll Float",
			provider: "Pesalink",
			providerTone: "badgeViolet",
			balance: "KES 12,500,000",
			dailyLimit: "KES 100M",
			health: 99,
			txns24h: "48",
		},
	],
	snapshot: [
		{
			id: "s1",
			label: "Total mobile balance",
			value: "KES 24.05M",
			tone: "statAccent",
		},
		{
			id: "s2",
			label: "Today's net flow",
			value: "+ KES 3.82M",
			tone: "statInfo",
		},
		{
			id: "s3",
			label: "Pending settlement",
			value: "KES 4.82M",
			tone: "statWarn",
		},
	],
	linkedWallets: [
		{
			id: "lw1",
			number: "0712 345 890",
			provider: "M-Pesa",
			owner: "James Kamau",
			kyc: "Full",
			kycTone: "badgeSuccess",
			status: "Active",
			statusTone: "badgeSuccess",
			perms: "Send, Receive, Bulk",
		},
		{
			id: "lw2",
			number: "0733 112 445",
			provider: "Airtel Money",
			owner: "Finance Dept",
			kyc: "Full",
			kycTone: "badgeSuccess",
			status: "Active",
			statusTone: "badgeSuccess",
			perms: "Send, Bulk",
		},
		{
			id: "lw3",
			number: "0700 998 112",
			provider: "T-Kash",
			owner: "Procurement",
			kyc: "Partial",
			kycTone: "badgeWarn",
			status: "Pending KYC",
			statusTone: "badgeWarn",
			perms: "Receive only",
		},
	],
	recentTransfers: [
		{
			id: "t1",
			date: "27 Jun",
			route: "M-Pesa → 0712***890",
			amount: "KES 250,000",
			status: "Success",
			statusTone: "badgeSuccess",
			ref: "MP-882910",
			actionLabel: "Receipt",
			modal: "transferReceiptModal",
		},
		{
			id: "t2",
			date: "27 Jun",
			route: "Airtel → 200 suppliers",
			amount: "KES 4,820,000",
			status: "Partial",
			statusTone: "badgeWarn",
			ref: "AT-991203",
			actionLabel: "Retry 47",
			modal: "bulkRetryModal",
		},
		{
			id: "t3",
			date: "26 Jun",
			route: "T-Kash → 0733***445",
			amount: "KES 85,000",
			status: "Success",
			statusTone: "badgeSuccess",
			ref: "TK-774501",
			actionLabel: "Receipt",
			modal: "transferReceiptModal",
		},
	],
	psps: [
		{
			id: "psp1",
			name: "Safaricom M-Pesa",
			type: "B2C / C2B",
			status: "Live",
			statusTone: "badgeSuccess",
			uptime: "99.98%",
			uptimeTone: "badgeSuccess",
			settlement: "T+0",
		},
		{
			id: "psp2",
			name: "Airtel Money",
			type: "B2C / C2B",
			status: "Live",
			statusTone: "badgeSuccess",
			uptime: "99.71%",
			uptimeTone: "badgeSuccess",
			settlement: "T+1",
		},
		{
			id: "psp3",
			name: "Pesalink",
			type: "Bank transfer",
			status: "Live",
			statusTone: "badgeSuccess",
			uptime: "100%",
			uptimeTone: "badgeSuccess",
			settlement: "Real-time",
		},
		{
			id: "psp4",
			name: "Cellulant",
			type: "PSP aggregator",
			status: "Maintenance",
			statusTone: "badgeWarn",
			uptime: "94.2%",
			uptimeTone: "badgeWarn",
			settlement: "T+1",
		},
	],
	kycStatus: [
		{ label: "Full KYC", count: "187 accounts", tone: "badgeSuccess" },
		{ label: "Partial KYC", count: "45 accounts", tone: "badgeWarn" },
		{ label: "Expired KYC", count: "12 accounts", tone: "badgeDanger" },
	],
	txnLimits: [
		{ label: "Per transaction", value: "KES 1,000,000" },
		{ label: "Daily limit", value: "KES 50,000,000" },
		{ label: "Monthly limit", value: "KES 500,000,000" },
	],
	trendBars: [
		{ label: "Mon", height: 65 },
		{ label: "Tue", height: 78 },
		{ label: "Wed", height: 92 },
		{ label: "Thu", height: 71 },
		{ label: "Fri", height: 85 },
		{ label: "Sat", height: 100, highlight: true },
		{ label: "Sun", height: 88 },
	],
	reconciliation: {
		label: "Last reconciliation",
		value: "27 Jun 2025, 06:00",
		sub: "0 mismatches · 100% matched",
	},
	supportContacts: [
		{ label: "Phone", value: "+254 800 723 001", icon: "bi-telephone" },
		{ label: "WhatsApp", value: "+254 712 000 001", icon: "bi-whatsapp" },
		{ label: "Email", value: "psp@paymo.co.ke", icon: "bi-envelope" },
	],
	alertSettings: [
		{ label: "Failed transactions", checked: true },
		{ label: "API downtime", checked: true },
		{ label: "Settlement delays", checked: true },
		{ label: "KYC expiry", checked: false },
	],
	integrationHealth: [
		{ label: "M-Pesa API", status: "Healthy", tone: "badgeSuccess" },
		{ label: "Airtel API", status: "Healthy", tone: "badgeSuccess" },
		{ label: "Pesalink", status: "Degraded", tone: "badgeWarn" },
	],
};

async function fetchMobileMoney(): Promise<MobileMoneyConfig> {
	const res = await fetch("/api/mobile-money-hub");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	return res.json();
}

const cx = (...parts: Array<string | false | null | undefined>) =>
	parts.filter(Boolean).join(" ");

const severityMeta: Record<
	AttentionItem["severity"],
	{ icon: string; cls: IconTone }
> = {
	danger: { icon: "bi-exclamation-octagon-fill", cls: "iconDanger" },
	warn: { icon: "bi-exclamation-triangle-fill", cls: "iconAmber" },
	info: { icon: "bi-link-45deg", cls: "iconBlue" },
};

const priorityMeta: Record<
	Suggestion["priority"],
	{ label: string; badge: string }
> = {
	high: { label: "High priority", badge: styles.badgeDanger },
	medium: { label: "Medium priority", badge: styles.badgeWarn },
	low: { label: "Low priority", badge: styles.badgeInfo },
};

export default function MobileMoney() {
	const { data: remoteData, error } = useQuery({
		queryKey: ["paymo-mobile-money"],
		queryFn: fetchMobileMoney,
		initialData: initialMockData,
		staleTime: 60_000,
		retry: 1,
	});
	const c = remoteData ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [toasts, setToasts] = useState<
		Array<{ id: number; message: string; danger?: boolean }>
	>([]);
	const [walletQuery, setWalletQuery] = useState("");

	useEffect(() => {
		if (!toasts.length) return;
		const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 4200);
		return () => clearTimeout(timer);
	}, [toasts]);

	const pushToast = (message: string, danger = false) =>
		setToasts((prev) => [
			...prev.slice(-4),
			{ id: Date.now() + Math.random(), message, danger },
		]);

	const go = (modalId: string | null) => setActiveModal(modalId);

	const scrollTo = (sectionId: string) => {
		document
			.getElementById(sectionId)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const filteredWallets = useMemo(() => {
		const q = walletQuery.trim().toLowerCase();
		if (!q) return c.wallets;
		return c.wallets.filter(
			(w) =>
				w.name.toLowerCase().includes(q) ||
				w.provider.toLowerCase().includes(q),
		);
	}, [c.wallets, walletQuery]);

	const modalData: MobileMoneyData = {
		...c,
		activeModal,
		setActiveModal: go,
		onToast: pushToast,
	};

	return (
		<div className={styles.mmPage}>
			<main className={styles.main} id="main-content">
				<div className={styles.content}>
					{/* ── Executive hero ─────────────────────────────────── */}
					<header className={styles.heroBanner}>
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi-phone" aria-hidden="true" /> Mobile Money
										&amp; PSP Hub
									</span>
									<span className={styles.livePill}>
										<span className={styles.liveDot} aria-hidden="true" />{" "}
										{c.hero.live}
									</span>
								</div>
								<h1>Every mobile wallet, one command center.</h1>
								<p>
									Send and collect across M-Pesa, Airtel Money, T-Kash and
									PesaLink, manage 20+ PSP integrations, run bulk disbursements
									and reconcile every wallet in real time — with KYC compliance
									built in.
								</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimary}
										onClick={() => go("sendMoneyModal")}
									>
										<i className="bi-send" aria-hidden="true" /> Send money
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => go("bulkTransferModal")}
									>
										<i className="bi-collection" aria-hidden="true" /> Bulk
										transfer
									</button>
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="Mobile money snapshot"
							>
								<span>Network snapshot</span>
								<strong>{c.hero.value}</strong>
								<p>{c.hero.detail}</p>
								<div className={styles.heroMetricRow}>
									{c.hero.metrics.map((m) => (
										<div key={m.label}>
											<strong>{m.value}</strong>
											<span>{m.label}</span>
										</div>
									))}
								</div>
							</aside>
						</div>
					</header>

					{error && (
						<div
							className={styles.statusNotice}
							role="alert"
							style={{
								borderColor: "#fda29b",
								background: "#fef3f2",
								color: "#b42318",
							}}
						>
							<i className="bi-cloud-slash" aria-hidden="true" />
							<div>
								<strong>Live mobile money service is unreachable.</strong>
								<small style={{ color: "#b42318" }}>
									Showing the last cached wallet snapshot — actions are queued
									locally.
								</small>
							</div>
						</div>
					)}

					{/* ── KPI row ────────────────────────────────────────── */}
					<section
						className={styles.dashboardSection}
						aria-label="Mobile money metrics"
					>
						<div className={styles.kpiGrid}>
							{c.kpis.map((kpi) => (
								<div className={cx(styles.card, styles.kpiCard)} key={kpi.id}>
									<span className={cx(styles.kpiIcon, styles[kpi.iconTone])}>
										<i className={`bi ${kpi.icon}`} aria-hidden="true" />
									</span>
									<div className={styles.kpiMeta}>
										<span>{kpi.label}</span>
										<small>{kpi.meta}</small>
									</div>
									<div className={styles.kpiValue}>{kpi.value}</div>
									<div className={styles.kpiFoot}>
										<span>
											<i className="bi-info-circle" aria-hidden="true" />
										</span>
										<span>{kpi.foot}</span>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* ── Section 01 — Queues ────────────────────────────── */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="mm-sec-queues"
					>
						<SectionHeading
							index="01"
							id="mm-sec-queues"
							title="Attention, suggestions & quick actions"
							description="Open operational items, AI cost-saving recommendations and the mobile money workflows teams use most."
						/>
						<div className={styles.queueGrid}>
							<div className={cx(styles.card, styles.queueCard)}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Operations queue</span>
										<h3>
											<i
												className="bi-exclamation-triangle"
												aria-hidden="true"
											/>{" "}
											Attention required
										</h3>
										<p>{c.attention.length} items need a decision today.</p>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => go("attentionModal")}
									>
										View all <i className="bi-arrow-right" aria-hidden="true" />
									</button>
								</div>
								{c.attention.map((item) => {
									const sev = severityMeta[item.severity];
									return (
										<div className={styles.actionRow} key={item.id}>
											<div className={styles.actionLead}>
												<span
													className={cx(styles.actionIcon, styles[sev.cls])}
												>
													<i className={`bi ${sev.icon}`} aria-hidden="true" />
												</span>
												<div>
													<div className={styles.actionTitle}>{item.title}</div>
													<div className={styles.actionSub}>{item.detail}</div>
												</div>
											</div>
											<button
												type="button"
												className={styles.textButton}
												onClick={() => go(item.modal)}
											>
												{item.actionLabel}{" "}
												<i className="bi-arrow-right" aria-hidden="true" />
											</button>
										</div>
									);
								})}
							</div>

							<div className={cx(styles.card, styles.queueCard)}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>
											AI money-movement copilot
										</span>
										<h3>
											<i className="bi-stars" aria-hidden="true" /> Smart
											suggestions
										</h3>
										<p>Routing-engine tips based on today's fees and flow.</p>
									</div>
									<span className={cx(styles.badge, styles.badgeViolet)}>
										<i className="bi-stars" aria-hidden="true" /> AI
									</span>
								</div>
								{c.suggestions.map((sug) => (
									<div className={styles.actionRow} key={sug.id}>
										<div className={styles.actionLead}>
											<span className={cx(styles.actionIcon, styles.iconGreen)}>
												<i className={`bi ${sug.icon}`} aria-hidden="true" />
											</span>
											<div>
												<div className={styles.actionTitle}>
													<span
														className={cx(
															styles.badge,
															priorityMeta[sug.priority].badge,
														)}
														style={{ marginRight: 6 }}
													>
														{priorityMeta[sug.priority].label}
													</span>
													{sug.title}
												</div>
												<div className={styles.actionSub}>{sug.detail}</div>
											</div>
										</div>
										<button
											type="button"
											className={styles.textButton}
											onClick={() => go(sug.modal)}
										>
											{sug.actionLabel}{" "}
											<i className="bi-check2" aria-hidden="true" />
										</button>
									</div>
								))}
							</div>

							<div className={cx(styles.card, styles.queueCard)}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Workspace</span>
										<h3>
											<i className="bi-lightning-charge" aria-hidden="true" />{" "}
											Quick actions
										</h3>
										<p>Jump straight into a mobile money workflow.</p>
									</div>
								</div>
								<div className={styles.qaGrid}>
									{c.quickActions.map((qa) => (
										<button
											type="button"
											key={qa.id}
											className={styles.qaBtn}
											onClick={() => go(qa.modal)}
										>
											<i className={`bi ${qa.icon}`} aria-hidden="true" />
											{qa.label}
											<small>{qa.detail}</small>
										</button>
									))}
								</div>
							</div>
						</div>
					</section>

					{/* ── Section 02 — Portfolio overview ────────────────── */}
					<section
						className={styles.dashboardSection}
						id="mm-portfolio"
						aria-labelledby="mm-sec-portfolio"
					>
						<SectionHeading
							index="02"
							id="mm-sec-portfolio"
							title="Mobile money portfolio overview"
							description="Real-time balances, daily limits, health scores and transaction velocity across every connected mobile wallet."
						/>
						<div className={styles.card}>
							<div className={styles.toolbar}>
								<div className={styles.searchBox}>
									<i className="bi-search" aria-hidden="true" />
									<label htmlFor="mm-wallet-search" className={styles.srOnly}>
										Search wallets
									</label>
									<input
										id="mm-wallet-search"
										type="search"
										placeholder="Search wallets or providers…"
										value={walletQuery}
										onChange={(e) => setWalletQuery(e.target.value)}
									/>
								</div>
								<div className={styles.toolbarTools}>
									<button
										type="button"
										className={styles.btn}
										onClick={() => go("walletHealthModal")}
									>
										<i className="bi-heart-pulse" aria-hidden="true" /> Health
									</button>
									<button
										type="button"
										className={cx(styles.btn, styles.btnPrimary)}
										onClick={() => go("linkWalletModal")}
									>
										<i className="bi-plus-lg" aria-hidden="true" /> Link wallet
									</button>
								</div>
							</div>
							<div className={styles.tableWrap}>
								<table className={styles.table}>
									<caption className={styles.srOnly}>
										{filteredWallets.length} of {c.wallets.length} connected
										wallets
									</caption>
									<thead>
										<tr>
											<th scope="col">Wallet</th>
											<th scope="col">Balance</th>
											<th scope="col">Daily limit</th>
											<th scope="col">Health</th>
											<th scope="col">24h txns</th>
											<th scope="col">
												<span className={styles.srOnly}>Actions</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredWallets.map((w) => (
											<tr key={w.id}>
												<td>
													<div className={styles.walletCell}>
														<span
															className={styles.walletMark}
															aria-hidden="true"
														>
															<i className="bi-phone" />
														</span>
														<div>
															<strong>{w.name}</strong>
															<div className={styles.actionSub}>
																<span
																	className={cx(
																		styles.badge,
																		styles[w.providerTone],
																	)}
																>
																	{w.provider}
																</span>
															</div>
														</div>
													</div>
												</td>
												<td className={styles.cellStrong}>{w.balance}</td>
												<td>{w.dailyLimit}</td>
												<td>
													<span className={styles.miniBar} aria-hidden="true">
														<span
															style={{
																width: `${w.health}%`,
																background:
																	w.health >= 95
																		? "var(--mm-green)"
																		: "var(--mm-warning)",
															}}
														/>
													</span>
													<strong style={{ fontSize: "0.72rem" }}>
														{w.health}%
													</strong>
												</td>
												<td>{w.txns24h}</td>
												<td>
													<button
														type="button"
														className={styles.textButton}
														onClick={() => go("walletDetailModal")}
													>
														Manage{" "}
														<i className="bi-arrow-right" aria-hidden="true" />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{!filteredWallets.length && (
									<div className={styles.emptyState}>
										<i className="bi-phone" aria-hidden="true" />
										No wallets match this search.
									</div>
								)}
							</div>
							<div className={styles.statGrid} style={{ marginTop: "1rem" }}>
								{c.snapshot.map((s) => (
									<div
										key={s.id}
										className={cx(styles.statBox, styles[s.tone])}
									>
										<span>{s.label}</span>
										<strong>{s.value}</strong>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* ── Section 03 — Linked wallets & transfer hub ─────── */}
					<section
						className={styles.dashboardSection}
						id="mm-linked"
						aria-labelledby="mm-sec-linked"
					>
						<SectionHeading
							index="03"
							id="mm-sec-linked"
							title="Linked wallets & transfer hub"
							description="Connected mobile accounts with KYC status and permissions, plus quick and recent single/bulk transfers."
						/>
						<div className={styles.card} style={{ marginBottom: "1rem" }}>
							<div className={styles.cardHead}>
								<div>
									<span className={styles.cardKicker}>Connected accounts</span>
									<h3>
										<i className="bi-link-45deg" aria-hidden="true" /> Linked
										wallets &amp; accounts
									</h3>
								</div>
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									onClick={() => go("linkWalletModal")}
								>
									<i className="bi-plus-lg" aria-hidden="true" /> Link new
									wallet
								</button>
							</div>
							<div className={styles.tableWrap}>
								<table className={styles.table}>
									<caption className={styles.srOnly}>
										Linked mobile money accounts
									</caption>
									<thead>
										<tr>
											<th scope="col">Wallet</th>
											<th scope="col">Provider</th>
											<th scope="col">Owner</th>
											<th scope="col">KYC</th>
											<th scope="col">Status</th>
											<th scope="col">Permissions</th>
											<th scope="col">
												<span className={styles.srOnly}>Actions</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{c.linkedWallets.map((lw) => (
											<tr key={lw.id}>
												<td className={styles.cellStrong}>{lw.number}</td>
												<td>{lw.provider}</td>
												<td>{lw.owner}</td>
												<td>
													<span
														className={cx(styles.badge, styles[lw.kycTone])}
													>
														{lw.kyc}
													</span>
												</td>
												<td>
													<span
														className={cx(styles.badge, styles[lw.statusTone])}
													>
														{lw.status}
													</span>
												</td>
												<td
													style={{
														color: "var(--mm-muted)",
														fontSize: "0.72rem",
													}}
												>
													{lw.perms}
												</td>
												<td>
													<div style={{ display: "inline-flex", gap: 8 }}>
														{lw.status === "Pending KYC" ? (
															<button
																type="button"
																className={styles.textButton}
																onClick={() => go("kycBulkModal")}
															>
																Complete KYC{" "}
																<i
																	className="bi-arrow-right"
																	aria-hidden="true"
																/>
															</button>
														) : (
															<>
																<button
																	type="button"
																	className={styles.textButton}
																	onClick={() => go("walletPermissionsModal")}
																>
																	Perms
																</button>
																<button
																	type="button"
																	className={styles.textButton}
																	onClick={() => go("pauseWalletModal")}
																>
																	Pause
																</button>
															</>
														)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						<div className={styles.queueGrid}>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Move money</span>
										<h3>
											<i className="bi-send" aria-hidden="true" /> Quick
											transfer
										</h3>
									</div>
								</div>
								<div style={{ display: "grid", gap: 12 }}>
									<label className={styles.srOnly} htmlFor="mm-quick-from">
										From
									</label>
									<select
										id="mm-quick-from"
										className="mmField"
										defaultValue="M-Pesa Business (KES 8.42M)"
										style={fieldStyle}
									>
										<option>M-Pesa Business (KES 8.42M)</option>
										<option>Airtel Disbursement (KES 2.18M)</option>
									</select>
									<label className={styles.srOnly} htmlFor="mm-quick-to">
										To
									</label>
									<select
										id="mm-quick-to"
										defaultValue="0712 345 890 — James Kamau"
										style={fieldStyle}
									>
										<option>0712 345 890 — James Kamau</option>
										<option>0733 112 445 — Finance</option>
										<option>0700 998 112 — Procurement</option>
									</select>
									<label className={styles.srOnly} htmlFor="mm-quick-amount">
										Amount
									</label>
									<input
										id="mm-quick-amount"
										defaultValue="250000"
										style={fieldStyle}
									/>
									<div style={{ display: "flex", gap: 8 }}>
										<button
											type="button"
											className={cx(styles.btn, styles.btnPrimary)}
											onClick={() => go("sendMoneyModal")}
										>
											<i className="bi-send" aria-hidden="true" /> Send now
										</button>
										<button
											type="button"
											className={styles.btn}
											onClick={() => go("scheduleTransferModal")}
										>
											<i className="bi-calendar-event" aria-hidden="true" />{" "}
											Schedule
										</button>
									</div>
								</div>
							</div>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Activity</span>
										<h3>
											<i className="bi-clock-history" aria-hidden="true" />{" "}
											Recent transfers
										</h3>
									</div>
								</div>
								<div className={styles.tableWrap}>
									<table className={styles.table}>
										<caption className={styles.srOnly}>
											Recent mobile money transfers
										</caption>
										<thead>
											<tr>
												<th scope="col">Route</th>
												<th scope="col">Amount</th>
												<th scope="col">Status</th>
												<th scope="col">
													<span className={styles.srOnly}>Action</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{c.recentTransfers.map((t) => (
												<tr key={t.id}>
													<td style={{ whiteSpace: "normal" }}>
														<div className={styles.cellStrong}>{t.route}</div>
														<div className={styles.actionSub}>
															{t.date} · {t.ref}
														</div>
													</td>
													<td className={styles.cellStrong}>{t.amount}</td>
													<td>
														<span
															className={cx(styles.badge, styles[t.statusTone])}
														>
															{t.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={styles.textButton}
															onClick={() => go(t.modal)}
														>
															{t.actionLabel}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</section>

					{/* ── Section 04 — PSP integrations ──────────────────── */}
					<section
						className={styles.dashboardSection}
						id="mm-psp"
						aria-labelledby="mm-sec-psp"
					>
						<SectionHeading
							index="04"
							id="mm-sec-psp"
							title="PSP integration management"
							description="Connect, monitor and manage payment service providers — API health, credentials, webhooks and settlement cycles."
						/>
						<div className={styles.card}>
							<div className={styles.cardHead}>
								<div>
									<span className={styles.cardKicker}>Providers</span>
									<h3>
										<i className="bi-plug" aria-hidden="true" /> Connected PSPs
									</h3>
								</div>
								<div style={{ display: "flex", gap: 8 }}>
									<button
										type="button"
										className={styles.btn}
										onClick={() => go("pspHealthModal")}
									>
										<i className="bi-heart-pulse" aria-hidden="true" /> Health
										dashboard
									</button>
									<button
										type="button"
										className={cx(styles.btn, styles.btnPrimary)}
										onClick={() => go("addPspModal")}
									>
										<i className="bi-plus-lg" aria-hidden="true" /> Add PSP
									</button>
								</div>
							</div>
							<div className={styles.tableWrap}>
								<table className={styles.table}>
									<caption className={styles.srOnly}>
										Payment service provider integrations
									</caption>
									<thead>
										<tr>
											<th scope="col">PSP</th>
											<th scope="col">Type</th>
											<th scope="col">Status</th>
											<th scope="col">API health</th>
											<th scope="col">Settlement</th>
											<th scope="col">
												<span className={styles.srOnly}>Actions</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{c.psps.map((p) => (
											<tr key={p.id}>
												<td className={styles.cellStrong}>
													<i
														className="bi-plug"
														style={{
															color: "var(--mm-green-dark)",
															marginRight: 6,
														}}
														aria-hidden="true"
													/>
													{p.name}
												</td>
												<td>{p.type}</td>
												<td>
													<span
														className={cx(styles.badge, styles[p.statusTone])}
													>
														{p.status}
													</span>
												</td>
												<td>
													<span
														className={cx(styles.badge, styles[p.uptimeTone])}
													>
														{p.uptime}
													</span>
												</td>
												<td>{p.settlement}</td>
												<td>
													<div style={{ display: "inline-flex", gap: 10 }}>
														<button
															type="button"
															className={styles.textButton}
															onClick={() => go("pspSettingsModal")}
														>
															Settings
														</button>
														<button
															type="button"
															className={styles.textButton}
															onClick={() => go("pspHealthModal")}
														>
															Health
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>

					{/* ── Section 05 — Compliance & limits ───────────────── */}
					<section
						className={styles.dashboardSection}
						id="mm-compliance"
						aria-labelledby="mm-sec-compliance"
					>
						<SectionHeading
							index="05"
							id="mm-sec-compliance"
							title="Compliance, KYC & limits"
							description="KYC status across linked accounts, transaction limits and the regulatory posture for all mobile money activity."
						/>
						<div className={styles.queueGrid}>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>KYC register</span>
										<h3>
											<i className="bi-person-check" aria-hidden="true" /> KYC
											status
										</h3>
									</div>
								</div>
								{c.kycStatus.map((k) => (
									<div className={styles.listRow} key={k.label}>
										<strong>{k.label}</strong>
										<span className={cx(styles.badge, styles[k.tone])}>
											{k.count}
										</span>
									</div>
								))}
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									style={{ marginTop: 10, width: "100%" }}
									onClick={() => go("kycBulkModal")}
								>
									<i className="bi-send-check" aria-hidden="true" /> Refresh 45
									partial + 12 expired
								</button>
							</div>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Controls</span>
										<h3>
											<i className="bi-sliders" aria-hidden="true" />{" "}
											Transaction limits
										</h3>
									</div>
								</div>
								{c.txnLimits.map((l) => (
									<div className={styles.listRow} key={l.label}>
										<strong>{l.label}</strong>
										<strong style={{ color: "var(--mm-ink)" }}>
											{l.value}
										</strong>
									</div>
								))}
								<button
									type="button"
									className={cx(styles.btn)}
									style={{ marginTop: 10, width: "100%" }}
									onClick={() => go("limitSettingsModal")}
								>
									<i className="bi-gear" aria-hidden="true" /> Adjust limits
								</button>
							</div>
						</div>
					</section>

					{/* ── Section 06 — Analytics & reconciliation ───────── */}
					<section
						className={styles.dashboardSection}
						id="mm-analytics"
						aria-labelledby="mm-sec-analytics"
					>
						<SectionHeading
							index="06"
							id="mm-sec-analytics"
							title="Analytics, reconciliation & reporting"
							description="Seven-day volume trend, the reconciliation engine and downloadable regulatory reports."
						/>
						<div className={styles.queueGrid}>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Trend</span>
										<h3>
											<i className="bi-bar-chart-line" aria-hidden="true" />{" "}
											7-day volume trend
										</h3>
									</div>
								</div>
								<div
									className={styles.trendWrap}
									role="img"
									aria-label="Seven day mobile money volume trend, peaking Saturday"
								>
									{c.trendBars.map((b) => (
										<div
											key={b.label}
											className={styles.trendBar}
											title={`${b.label}: ${b.height}% of peak volume`}
											style={{
												height: `${b.height}%`,
												background: b.highlight
													? "linear-gradient(180deg, var(--mm-green-dark), var(--mm-green))"
													: undefined,
											}}
										/>
									))}
								</div>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginTop: 26,
										color: "var(--mm-subtle)",
										fontSize: "0.62rem",
										fontWeight: 650,
									}}
								>
									{c.trendBars.map((b) => (
										<span key={b.label}>{b.label}</span>
									))}
								</div>
							</div>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Reconciliation</span>
										<h3>
											<i className="bi-arrow-repeat" aria-hidden="true" />{" "}
											Wallet reconciliation
										</h3>
									</div>
								</div>
								<div className={cx(styles.statBox, styles.statAccent)}>
									<span>{c.reconciliation.label}</span>
									<strong style={{ fontSize: "1.05rem" }}>
										{c.reconciliation.value}
									</strong>
									<div
										style={{
											fontSize: "0.7rem",
											color: "var(--mm-muted)",
											marginTop: 4,
										}}
									>
										{c.reconciliation.sub}
									</div>
								</div>
								<div style={{ display: "grid", gap: 8, marginTop: 12 }}>
									<button
										type="button"
										className={cx(styles.btn, styles.btnPrimary)}
										onClick={() => go("reconcileModal")}
									>
										<i className="bi-arrow-repeat" aria-hidden="true" /> Run
										reconciliation
									</button>
									<button
										type="button"
										className={styles.btn}
										onClick={() => go("statementModal")}
									>
										<i
											className="bi-file-earmark-spreadsheet"
											aria-hidden="true"
										/>{" "}
										Export reports
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* ── Section 07 — Support, alerts & health ──────────── */}
					<section
						className={styles.dashboardSection}
						id="mm-support"
						aria-labelledby="mm-sec-support"
					>
						<SectionHeading
							index="07"
							id="mm-sec-support"
							title="Support, alerts & integration health"
							description="24/7 PSP support contacts, alert preferences and live integration monitoring."
						/>
						<div
							className={styles.queueGrid}
							style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
						>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>24/7 support</span>
										<h3>
											<i className="bi-headset" aria-hidden="true" /> Contacts
										</h3>
									</div>
								</div>
								{c.supportContacts.map((contact) => (
									<div className={styles.listRow} key={contact.label}>
										<div
											style={{ display: "flex", alignItems: "center", gap: 8 }}
										>
											<span
												className={cx(styles.actionIcon, styles.iconGreen)}
												style={{
													width: 30,
													height: 30,
													flex: "0 0 30px",
													fontSize: "0.8rem",
												}}
											>
												<i
													className={`bi ${contact.icon}`}
													aria-hidden="true"
												/>
											</span>
											<strong>{contact.label}</strong>
										</div>
										<span style={{ fontSize: "0.7rem", fontWeight: 650 }}>
											{contact.value}
										</span>
									</div>
								))}
								<button
									type="button"
									className={cx(styles.btn)}
									style={{ marginTop: 10, width: "100%" }}
									onClick={() => go("contactSupportModal")}
								>
									<i className="bi-chat-dots" aria-hidden="true" /> Start in-app
									chat
								</button>
							</div>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Preferences</span>
										<h3>
											<i className="bi-bell" aria-hidden="true" /> Alert
											settings
										</h3>
									</div>
								</div>
								{c.alertSettings.map((alert, i) => (
									<div className={styles.listRow} key={alert.label}>
										<strong>{alert.label}</strong>
										<div
											className="form-check form-switch"
											style={{ margin: 0 }}
										>
											<input
												className="form-check-input"
												type="checkbox"
												role="switch"
												id={`mm-alert-${i}`}
												defaultChecked={alert.checked}
												aria-checked={alert.checked}
												aria-label={alert.label}
											/>
											<label
												className="form-check-label"
												htmlFor={`mm-alert-${i}`}
											>
												<span className={styles.srOnly}>{alert.label}</span>
											</label>
										</div>
									</div>
								))}
							</div>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Monitoring</span>
										<h3>
											<i className="bi-heart-pulse" aria-hidden="true" />{" "}
											Integration health
										</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => go("pspHealthModal")}
									>
										View all <i className="bi-arrow-right" aria-hidden="true" />
									</button>
								</div>
								{c.integrationHealth.map((h) => (
									<div className={styles.listRow} key={h.label}>
										<strong>{h.label}</strong>
										<span className={cx(styles.badge, styles[h.tone])}>
											<i
												className={`bi ${h.tone === "badgeSuccess" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}
												aria-hidden="true"
											/>
											{h.status}
										</span>
									</div>
								))}
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									style={{ marginTop: 10, width: "100%" }}
									onClick={() => go("healthCheckModal")}
								>
									<i className="bi-heart-pulse" aria-hidden="true" /> Run health
									check
								</button>
							</div>
						</div>
					</section>

					{/* ── Footer ────────────────────────────────────────── */}
					<footer className={styles.pageFooter}>
						<span>
							<i className="bi-shield-lock" aria-hidden="true" /> PayMo Business
							· Mobile money &amp; PSP hub
						</span>
						<nav aria-label="Workspace sections">
							<button type="button" onClick={() => scrollTo("mm-portfolio")}>
								Wallets
							</button>
							<button type="button" onClick={() => scrollTo("mm-linked")}>
								Transfers
							</button>
							<button type="button" onClick={() => scrollTo("mm-psp")}>
								PSPs
							</button>
							<button type="button" onClick={() => scrollTo("mm-analytics")}>
								Reconciliation
							</button>
							<button
								type="button"
								onClick={() => go("notifModal")}
								aria-label="Notifications"
							>
								<i className="bi bi-bell" aria-hidden="true" /> Alerts
							</button>
							<button
								type="button"
								onClick={() => go("profileModal")}
								aria-label="Profile"
							>
								<i className="bi bi-person-circle" aria-hidden="true" /> Profile
							</button>
						</nav>
					</footer>
				</div>
			</main>

			{/* ── Floating command bar ─────────────────────────────── */}
			<div
				className={styles.floatingBar}
				role="toolbar"
				aria-label="Mobile money quick actions"
			>
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => go("sendMoneyModal")}
				>
					<i className="bi-send" aria-hidden="true" /> Send
				</button>
				<button type="button" onClick={() => go("bulkTransferModal")}>
					<i className="bi-collection" aria-hidden="true" /> Bulk
				</button>
				<button type="button" onClick={() => go("linkWalletModal")}>
					<i className="bi-plus-lg" aria-hidden="true" /> Link
				</button>
				<button type="button" onClick={() => go("reconcileModal")}>
					<i className="bi-arrow-repeat" aria-hidden="true" /> Reconcile
				</button>
				<button type="button" onClick={() => go("statementModal")}>
					<i className="bi-download" aria-hidden="true" /> Export
				</button>
			</div>

			{/* ── Toasts ───────────────────────────────────────────── */}
			<div className={styles.toastStack} aria-live="polite" aria-atomic="false">
				{toasts.map((toast) => (
					<output
						key={toast.id}
						className={cx(styles.toast, toast.danger && styles.toastDanger)}
					>
						<i
							className={`bi ${toast.danger ? "bi-x-circle-fill" : "bi-check-circle-fill"}`}
							aria-hidden="true"
						/>
						<span>{toast.message}</span>
					</output>
				))}
			</div>

			<MobileMoneyModals data={modalData} />
		</div>
	);
}

/* ── Local helpers ─────────────────────────────────────────────────────── */

const fieldStyle: React.CSSProperties = {
	width: "100%",
	minHeight: 40,
	padding: "0.5rem 0.75rem",
	border: "1px solid var(--mm-border)",
	borderRadius: 10,
	fontSize: "0.78rem",
	background: "#fff",
	color: "var(--mm-ink)",
};

function SectionHeading({
	index,
	id,
	title,
	description,
}: {
	index: string;
	id: string;
	title: string;
	description: string;
}) {
	return (
		<div className={styles.sectionHeading}>
			<span className={styles.sectionIndex} aria-hidden="true">
				{index}
			</span>
			<div>
				<h2 id={id}>{title}</h2>
				<p>{description}</p>
			</div>
		</div>
	);
}
