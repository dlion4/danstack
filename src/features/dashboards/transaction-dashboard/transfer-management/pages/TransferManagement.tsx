/* ============================================================================
 * TransferManagement.tsx — Page 1.3 "Transfer Management".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.3.html (single-file HTML/CSS/JS, ~2,700 LOC).
 *   - Operational datasets remain in `initialMockData` and render as typed,
 *     responsive cards, tables, queues and governance controls.
 *   - TanStack Query retains the bundled `data ?? initialMockData` fallback so
 *     the workspace remains useful when its API is unavailable.
 *   - Legacy openM()/closeM() workflows are React state-driven and retain their
 *     existing modal IDs through TransferManagementModals.
 * ========================================================================== */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import AttentionHubFab from "../../shared/components/AttentionHubFab";
import type {
	AttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import {
	type TransferManagementData,
	TransferManagementModals,
} from "../components/TransferManagementModals";
import styles from "../styles/transfer-management.module.css";

type Tone = "success" | "warn" | "danger" | "info" | "purple" | "neutral";

interface StatCard {
	label: string;
	value: string;
	badge?: { text: string; icon: string; tone: Tone };
	sub?: string;
	labelTone: Tone;
	edge?: Tone;
}
interface Row {
	icon: string;
	tone: Tone;
	title: string;
	sub: string;
	action: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	tone: Tone;
	label: string;
	modal: string;
}
interface TxnRow {
	date: string;
	beneficiary: string;
	bank: string;
	amount: string;
	method: string;
	status: string;
	statusTone: Tone;
	action: { label: string; modal: string };
}
interface IntlRow {
	date: string;
	beneficiary: string;
	dest: string;
	amount: string;
	fx: string;
	method: string;
	status: string;
	statusTone: Tone;
	action: { label: string; modal: string };
}
interface BankStatus {
	name: string;
	rails: string;
	status: string;
	tone: Tone;
}
interface FxRate {
	code: string;
	rate: string;
	delta: string;
	up: boolean;
}
interface Schedule {
	name: string;
	beneficiary: string;
	amount: string;
	frequency: string;
	next: string;
	status: string;
	statusTone: Tone;
	action: { label: string; modal: string };
}
interface HistoryRow {
	date: string;
	ref: string;
	beneficiary: string;
	bank: string;
	amount: string;
	method: string;
	status: string;
	statusTone: Tone;
	action: { label: string; modal: string };
}
interface KV {
	label: string;
	value: string;
}
interface ApprovalRow {
	label: string;
	badge: string;
	tone: Tone;
}
interface ComplianceBox {
	label: string;
	value: string;
	tone: Tone;
}

export interface TransferManagementContent extends TransferManagementData {
	heroTitle: string;
	heroValue: string;
	heroSub: string;
	stats: StatCard[];
	attention: Row[];
	suggestions: Row[];
	quickActions: QuickAction[];
	domestic: TxnRow[];
	bankStatus: BankStatus[];
	intl: IntlRow[];
	fxRates: FxRate[];
	schedules: Schedule[];
	history: HistoryRow[];
	limits: KV[];
	approvals: ApprovalRow[];
	compliance: ComplianceBox[];
}

const initialMockData: TransferManagementContent = {
	heroTitle: "Transfer engine is live",
	heroValue: "KES 184.7M transferred today",
	heroSub:
		"Domestic (PesaLink / EFT / RTGS) + International (SWIFT / Remit) across 47 banks and 12 African corridors.",
	stats: [
		{
			label: "PENDING APPROVAL",
			value: "47",
			badge: { text: "KES 38.2M", icon: "bi-clock", tone: "warn" },
			sub: "12 high-value transfers awaiting maker-checker approval",
			labelTone: "warn",
			edge: "warn",
		},
		{
			label: "SUCCESS RATE (30D)",
			value: "98.7%",
			badge: {
				text: "+0.4% vs last month",
				icon: "bi-graph-up-arrow",
				tone: "success",
			},
			sub: "Domestic 99.1% • International 96.4%",
			labelTone: "info",
		},
		{
			label: "AVERAGE SETTLEMENT",
			value: "18s",
			badge: {
				text: "PesaLink instant",
				icon: "bi-lightning-charge",
				tone: "success",
			},
			sub: "RTGS 42 min avg • SWIFT 4.2 hrs avg",
			labelTone: "success",
			edge: "success",
		},
	],
	attention: [
		{
			icon: "bi-exclamation-triangle",
			tone: "danger",
			title: "KES 12.5M transfer failed compliance",
			sub: "AML flag on Equity → KCB",
			action: "Review",
			modal: "complianceModal",
		},
		{
			icon: "bi-clock",
			tone: "warn",
			title: "3 recurring transfers need re-authorisation",
			sub: "Salary runs — 28 Jun",
			action: "Approve",
			modal: "recurringModal",
		},
		{
			icon: "bi-bank",
			tone: "info",
			title: "Co-op Bank maintenance window",
			sub: "Tonight 02:00 – 04:00 EAT",
			action: "Details",
			modal: "bankStatusModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightning-charge",
			tone: "warn",
			title: "Switch 8 beneficiaries to PesaLink",
			sub: "Save KES 1,600 in fees this month",
			action: "Switch",
			modal: "beneficiaryModal",
		},
		{
			icon: "bi-calendar-event",
			tone: "warn",
			title: "Pre-schedule July salary run",
			sub: "Avoid last-minute approval rush",
			action: "Schedule",
			modal: "scheduleTransferModal",
		},
		{
			icon: "bi-globe",
			tone: "purple",
			title: "Optimise USD corridor via Wave",
			sub: "Better FX rate than SWIFT",
			action: "Compare",
			modal: "internationalModal",
		},
	],
	quickActions: [
		{
			icon: "bi-arrow-left-right",
			tone: "success",
			label: "Domestic Transfer",
			modal: "initiateTransferModal",
		},
		{
			icon: "bi-globe",
			tone: "info",
			label: "International",
			modal: "internationalModal",
		},
		{
			icon: "bi-calendar-event",
			tone: "success",
			label: "Schedule",
			modal: "scheduleTransferModal",
		},
		{
			icon: "bi-arrow-repeat",
			tone: "purple",
			label: "Recurring",
			modal: "recurringModal",
		},
		{
			icon: "bi-people",
			tone: "warn",
			label: "Beneficiaries",
			modal: "beneficiaryModal",
		},
		{
			icon: "bi-collection",
			tone: "success",
			label: "Bulk Transfer",
			modal: "bulkTransferModal",
		},
		{
			icon: "bi-check2-square",
			tone: "danger",
			label: "Approvals",
			modal: "approvalQueueModal",
		},
		{
			icon: "bi-clock-history",
			tone: "neutral",
			label: "History",
			modal: "transferHistoryModal",
		},
	],
	domestic: [
		{
			date: "27 Jun",
			beneficiary: "Grace Wanjiku",
			bank: "Equity Bank",
			amount: "KES 85,000",
			method: "PesaLink",
			status: "Instant",
			statusTone: "success",
			action: { label: "Receipt", modal: "transferReceiptModal" },
		},
		{
			date: "27 Jun",
			beneficiary: "ABC Suppliers Ltd",
			bank: "KCB Bank",
			amount: "KES 420,000",
			method: "RTGS",
			status: "Processing",
			statusTone: "info",
			action: { label: "Track", modal: "trackTransferModal" },
		},
		{
			date: "26 Jun",
			beneficiary: "James Otieno",
			bank: "Co-op Bank",
			amount: "KES 12,500",
			method: "EFT",
			status: "Completed",
			statusTone: "success",
			action: { label: "Receipt", modal: "transferReceiptModal" },
		},
		{
			date: "26 Jun",
			beneficiary: "Property Management",
			bank: "NCBA",
			amount: "KES 185,000",
			method: "PesaLink",
			status: "Instant",
			statusTone: "success",
			action: { label: "Receipt", modal: "transferReceiptModal" },
		},
	],
	bankStatus: [
		{
			name: "Equity Bank",
			rails: "PesaLink • RTGS • EFT",
			status: "Online",
			tone: "success",
		},
		{
			name: "KCB Bank",
			rails: "PesaLink • RTGS • EFT",
			status: "Online",
			tone: "success",
		},
		{
			name: "Co-op Bank",
			rails: "PesaLink • EFT",
			status: "Maintenance",
			tone: "warn",
		},
		{
			name: "NCBA",
			rails: "PesaLink • RTGS",
			status: "Online",
			tone: "success",
		},
		{
			name: "Family Bank",
			rails: "PesaLink only",
			status: "Online",
			tone: "success",
		},
	],
	intl: [
		{
			date: "26 Jun",
			beneficiary: "Peter Ochieng",
			dest: "Uganda (UGX)",
			amount: "USD 2,500",
			fx: "1 USD = 3,680 UGX",
			method: "Wave",
			status: "Delivered",
			statusTone: "success",
			action: { label: "Receipt", modal: "intlReceiptModal" },
		},
		{
			date: "25 Jun",
			beneficiary: "Tech Solutions Ltd",
			dest: "UK (GBP)",
			amount: "USD 18,400",
			fx: "1 USD = 0.78 GBP",
			method: "SWIFT",
			status: "In Transit",
			statusTone: "info",
			action: { label: "Track", modal: "trackIntlModal" },
		},
		{
			date: "24 Jun",
			beneficiary: "Mary Njeri",
			dest: "Tanzania (TZS)",
			amount: "USD 850",
			fx: "1 USD = 2,680 TZS",
			method: "Remitly",
			status: "Delivered",
			statusTone: "success",
			action: { label: "Receipt", modal: "intlReceiptModal" },
		},
	],
	fxRates: [
		{ code: "USD", rate: "129.45", delta: "-0.12", up: false },
		{ code: "GBP", rate: "164.80", delta: "+0.45", up: true },
		{ code: "EUR", rate: "140.20", delta: "-0.08", up: false },
		{ code: "UGX", rate: "0.035", delta: "-0.001", up: false },
		{ code: "TZS", rate: "0.048", delta: "-0.002", up: false },
	],
	schedules: [
		{
			name: "Monthly Rent",
			beneficiary: "Property Mgmt Ltd",
			amount: "KES 65,000",
			frequency: "Monthly",
			next: "01 Jul 2025",
			status: "Active",
			statusTone: "success",
			action: { label: "Edit", modal: "editRecurringModal" },
		},
		{
			name: "Staff Salaries",
			beneficiary: "Payroll Run (42 staff)",
			amount: "KES 2.8M",
			frequency: "Monthly",
			next: "28 Jun 2025",
			status: "Approval Pending",
			statusTone: "warn",
			action: { label: "Approve", modal: "approvalQueueModal" },
		},
		{
			name: "Internet Bill",
			beneficiary: "Safaricom Fibre",
			amount: "KES 5,999",
			frequency: "Monthly",
			next: "01 Jul 2025",
			status: "Active",
			statusTone: "success",
			action: { label: "Edit", modal: "editRecurringModal" },
		},
		{
			name: "School Fees",
			beneficiary: "Strathmore University",
			amount: "KES 185,000",
			frequency: "Termly",
			next: "15 Aug 2025",
			status: "Active",
			statusTone: "success",
			action: { label: "Edit", modal: "editRecurringModal" },
		},
	],
	history: [
		{
			date: "27 Jun",
			ref: "TRF-20250627-88341",
			beneficiary: "Grace Wanjiku",
			bank: "Equity Bank",
			amount: "KES 85,000",
			method: "PesaLink",
			status: "Success",
			statusTone: "success",
			action: { label: "View", modal: "transferReceiptModal" },
		},
		{
			date: "27 Jun",
			ref: "TRF-20250627-88342",
			beneficiary: "ABC Suppliers Ltd",
			bank: "KCB Bank",
			amount: "KES 420,000",
			method: "RTGS",
			status: "Processing",
			statusTone: "info",
			action: { label: "Track", modal: "trackTransferModal" },
		},
		{
			date: "26 Jun",
			ref: "TRF-20250626-77219",
			beneficiary: "Peter Ochieng",
			bank: "Wave (Uganda)",
			amount: "USD 2,500",
			method: "Wave",
			status: "Delivered",
			statusTone: "success",
			action: { label: "View", modal: "intlReceiptModal" },
		},
		{
			date: "26 Jun",
			ref: "TRF-20250626-77220",
			beneficiary: "James Otieno",
			bank: "Co-op Bank",
			amount: "KES 12,500",
			method: "EFT",
			status: "Success",
			statusTone: "success",
			action: { label: "View", modal: "transferReceiptModal" },
		},
	],
	limits: [
		{ label: "Daily Transfer Limit", value: "KES 5,000,000" },
		{ label: "Single Transfer Limit", value: "KES 2,000,000" },
		{ label: "Weekly Limit", value: "KES 15,000,000" },
		{ label: "International Monthly", value: "USD 50,000" },
	],
	approvals: [
		{ label: "Up to KES 100K", badge: "Auto-approved", tone: "success" },
		{ label: "KES 100K – 500K", badge: "Manager approval", tone: "info" },
		{ label: "KES 500K – 2M", badge: "Director + Finance", tone: "warn" },
		{ label: "Above KES 2M", badge: "CFO + Board", tone: "danger" },
	],
	compliance: [
		{ label: "AML SCREENING", value: "Clean", tone: "success" },
		{ label: "SANCTIONS CHECK", value: "Pass", tone: "info" },
		{ label: "KYC STATUS", value: "Verified", tone: "warn" },
	],
	banks: ["Equity Bank", "KCB Bank", "Co-op Bank", "NCBA", "Family Bank"],
};

async function fetchTransferManagement(): Promise<TransferManagementContent> {
	const res = await fetch("/api/transfer-management");
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as TransferManagementContent;
}

const toneBadge: Record<Tone, string> = {
	success: styles.badgeSuccess,
	info: styles.badgeInfo,
	warn: styles.badgeWarn,
	danger: styles.badgeDanger,
	purple: styles.badgePurple,
	neutral: styles.badgeNeutral,
};

const toneBg: Record<Tone, string> = {
	success: "var(--tm-green-soft)",
	info: "var(--tm-info-soft)",
	warn: "var(--tm-warning-soft)",
	danger: "var(--tm-danger-soft)",
	purple: "var(--tm-violet-soft)",
	neutral: "#f2f4f8",
};

const toneColor: Record<Tone, string> = {
	success: "#067647",
	info: "#175cd3",
	warn: "#93370d",
	danger: "#b42318",
	purple: "#5925dc",
	neutral: "#475467",
};

const toAttention = (row: Row): AttentionItem => ({
	icon: row.icon.replace(/^bi-/, ""),
	iconBg: toneBg[row.tone],
	iconColor: toneColor[row.tone],
	title: row.title,
	sub: row.sub,
	actionLabel: row.action,
	modal: row.modal,
});

const toQuickAction = (action: QuickAction): QuickActionItem => ({
	icon: action.icon.replace(/^bi-/, ""),
	iconColor: toneColor[action.tone],
	label: action.label,
	modal: action.modal,
});

const kpiIcons = [
	"bi-send-check",
	"bi-speedometer2",
	"bi-hourglass-split",
	"bi-shield-check",
];
const kpiIconTones = [
	styles.iconGreen,
	styles.iconBlue,
	styles.iconAmber,
	styles.iconViolet,
];

function SectionHeading({
	index,
	id,
	title,
	description,
	action,
}: {
	index: string;
	id: string;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className={styles.sectionHeading}>
			<div className={styles.sectionHeadingCopy}>
				<span className={styles.sectionIndex} aria-hidden="true">
					{index}
				</span>
				<div>
					<h2 id={id}>{title}</h2>
					<p>{description}</p>
				</div>
			</div>
			{action ? <div className={styles.sectionAction}>{action}</div> : null}
		</div>
	);
}

export default function TransferManagement() {
	const {
		data: remoteData,
		isFetching,
		isError,
	} = useQuery({
		queryKey: ["paymo-transfer-management"],
		queryFn: fetchTransferManagement,
		staleTime: 60_000,
		retry: 1,
	});
	const data = remoteData ?? initialMockData;
	const content = useMemo(
		() => ({
			...data,
			stats: [
				{
					title: "Transferred today",
					value: data.heroValue.replace(" transferred today", ""),
					label: "Live volume",
					foot: data.heroSub,
					labelTone: "success" as Tone,
				},
				...data.stats.map((stat) => ({
					title: stat.label,
					value: stat.value,
					label: stat.badge?.text ?? "Live",
					foot: stat.sub ?? "Current transfer performance",
					labelTone: stat.labelTone,
				})),
			],
			recentTransfers: data.domestic.map((transfer, index) => ({
				...transfer,
				ref: `TRF-${transfer.date.replace(" ", "").toUpperCase()}-${88341 + index}`,
			})),
			banks: data.bankStatus.map((bank) => ({ ...bank, note: bank.rails })),
			international: data.intl,
			limits: {
				daily: data.limits[0]?.value ?? "—",
				monthly: data.limits[2]?.value ?? "—",
				perTransfer: data.limits[1]?.value ?? "—",
				international: data.limits[3]?.value ?? "—",
				action: { modal: "limitsModal" },
			},
			approvals: {
				items: data.approvals.map((approval) => ({
					label: approval.label,
					value: approval.badge,
					tone: approval.tone,
				})),
				action: { modal: "approvalQueueModal" },
			},
		}),
		[data],
	);
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [historyQuery, setHistoryQuery] = useState("");
	const [historyStatus, setHistoryStatus] = useState("all");

	const openModal = (id: string) => setModalState({ [id]: true });
	const closeModal = (id: string) =>
		setModalState((current) => ({ ...current, [id]: false }));

	const handleDrawerAction = (modal: string) => {
		if (modal) openModal(modal);
	};

	const drawerAttention = content.attention.map(toAttention);
	const drawerSuggestions = content.suggestions.map(toAttention);
	const drawerQuickActions = content.quickActions.map(toQuickAction);

	const filteredHistory = useMemo(() => {
		const query = historyQuery.trim().toLowerCase();
		return content.history.filter((transfer) => {
			const matchesQuery =
				!query ||
				[
					transfer.ref,
					transfer.beneficiary,
					transfer.bank,
					transfer.amount,
					transfer.method,
				]
					.join(" ")
					.toLowerCase()
					.includes(query);
			const matchesStatus =
				historyStatus === "all" ||
				transfer.status.toLowerCase() === historyStatus;
			return matchesQuery && matchesStatus;
		});
	}, [content.history, historyQuery, historyStatus]);

	useEffect(() => {
		const onShortcut = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setModalState({ initiateTransferModal: true });
			}
		};
		window.addEventListener("keydown", onShortcut);
		return () => window.removeEventListener("keydown", onShortcut);
	}, []);

	return (
		<div className={styles.managementPage}>
			<main className={styles.main}>
				<div className={styles.content}>
					<section
						className={styles.heroBanner}
						aria-labelledby="management-title"
					>
						<div className={styles.heroOrbOne} />
						<div className={styles.heroOrbTwo} />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-diagram-3" /> Transfer control
									</span>
									<span className={styles.livePill}>
										<span className={styles.liveDot} aria-hidden="true" />
										{isFetching ? "Refreshing" : "Rails online"}
									</span>
								</div>
								<h1 id="management-title">
									Move money at scale, without losing control.
								</h1>
								<p>
									Initiate, approve and reconcile domestic or international
									transfers from one governed workspace. Every rail, beneficiary
									and exception stays visible.
								</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimary}
										onClick={() => openModal("initiateTransferModal")}
									>
										<i className="bi bi-plus-lg" /> New transfer
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => openModal("internationalModal")}
									>
										<i className="bi bi-globe2" /> International
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => openModal("bulkTransferModal")}
									>
										<i className="bi bi-collection" /> Bulk upload
									</button>
								</div>
							</div>

							<aside
								className={styles.heroSnapshot}
								aria-label="Monthly transfer snapshot"
							>
								<span>August transfer value</span>
								<strong>KES 184.7M</strong>
								<p>Across local and cross-border rails · 8.4% above July</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>47</strong>
										<span>Kenyan banks</span>
									</div>
									<div>
										<strong>12</strong>
										<span>FX corridors</span>
									</div>
									<div>
										<strong>99.7%</strong>
										<span>Rail uptime</span>
									</div>
								</div>
							</aside>
						</div>
					</section>

					{isError ? (
						<output className={`${styles.card} ${styles.healthSummary}`}>
							<i className="bi bi-cloud-slash" />
							<div>
								<strong>Live transfer feed is temporarily unavailable</strong>
								<span>
									Showing the latest locally available operating snapshot.
								</span>
							</div>
						</output>
					) : null}

					<section
						className={styles.dashboardSection}
						aria-labelledby="pulse-heading"
					>
						<SectionHeading
							index="01"
							id="pulse-heading"
							title="Operational pulse"
							description="Today’s transfer volume, service quality and approval workload at a glance."
						/>
						<div className={styles.kpiGrid}>
							{content.stats.map((stat, index) => (
								<article
									key={stat.title}
									className={`${styles.card} ${styles.kpiCard} ${
										index === 0
											? styles.kpiFeatured
											: index === 2
												? styles.kpiWarn
												: ""
									}`}
								>
									<span className={`${styles.kpiIcon} ${kpiIconTones[index]}`}>
										<i className={`bi ${kpiIcons[index]}`} aria-hidden="true" />
									</span>
									<div className={styles.kpiMeta}>
										<span>{stat.title}</span>
										<small>{stat.label}</small>
									</div>
									<strong className={styles.kpiValue}>{stat.value}</strong>
									<div className={styles.kpiFoot}>
										<span
											className={`${styles.badge} ${toneBadge[stat.labelTone]}`}
										>
											{stat.label}
										</span>
										<span>{stat.foot}</span>
									</div>
								</article>
							))}
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="domestic-heading"
					>
						<SectionHeading
							index="03"
							id="domestic-heading"
							title="Domestic transfer rails"
							description="Manage PesaLink, EFT and RTGS transfers alongside real-time bank connectivity."
							action={
								<button
									type="button"
									className={`${styles.btn} ${styles.btnPrimary}`}
									onClick={() => openModal("initiateTransferModal")}
								>
									<i className="bi bi-plus-lg" /> New domestic transfer
								</button>
							}
						/>
						<div className={styles.domesticGrid}>
							<article className={`${styles.card} ${styles.tableCard}`}>
								<div className={styles.tableToolbar}>
									<div className={styles.tableTitle}>
										<h3>Recent domestic transfers</h3>
										<span>Latest activity across connected Kenyan banks</span>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openModal("transferHistoryModal")}
									>
										View history <i className="bi bi-arrow-right" />
									</button>
								</div>
								<div className={styles.tableScroll}>
									<table className={styles.table}>
										<caption className={styles.srOnly}>
											Recent domestic bank transfers
										</caption>
										<thead>
											<tr>
												<th scope="col">Reference</th>
												<th scope="col">Beneficiary</th>
												<th scope="col">Bank</th>
												<th scope="col">Amount</th>
												<th scope="col">Rail</th>
												<th scope="col">Status</th>
												<th scope="col">
													<span className={styles.srOnly}>Actions</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{content.recentTransfers.map((transfer) => (
												<tr key={transfer.ref}>
													<td>
														<code>{transfer.ref}</code>
													</td>
													<td>
														<div className={styles.beneficiaryCell}>
															<span>
																{transfer.beneficiary
																	.split(" ")
																	.map((part) => part[0])
																	.join("")
																	.slice(0, 2)}
															</span>
															<strong>{transfer.beneficiary}</strong>
														</div>
													</td>
													<td>{transfer.bank}</td>
													<td>
														<strong>{transfer.amount}</strong>
													</td>
													<td>{transfer.method}</td>
													<td>
														<span
															className={`${styles.badge} ${toneBadge[transfer.statusTone]}`}
														>
															{transfer.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={styles.iconButton}
															aria-label={`${transfer.action.label} ${transfer.ref}`}
															onClick={() => openModal(transfer.action.modal)}
														>
															<i className="bi bi-three-dots" />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className={styles.tableFooter}>
									<span>
										Showing {content.recentTransfers.length} latest transfers
									</span>
									<span>All times EAT</span>
								</div>
							</article>

							<aside className={`${styles.card} ${styles.bankCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Live status</span>
										<h3>Bank connectivity</h3>
									</div>
									<button
										type="button"
										className={styles.iconButton}
										aria-label="Open connected bank directory"
										onClick={() => openModal("bankDirectoryModal")}
									>
										<i className="bi bi-bank" aria-hidden="true" />
									</button>
								</div>
								<div className={styles.bankList}>
									{content.banks.map((bank) => (
										<div className={styles.bankRow} key={bank.name}>
											<div className={styles.bankIdentity}>
												<strong>{bank.name}</strong>
												<span>{bank.note}</span>
											</div>
											<span
												className={`${styles.badge} ${toneBadge[bank.tone]}`}
											>
												{bank.status}
											</span>
										</div>
									))}
								</div>
								<button
									type="button"
									className={`${styles.healthSummary} ${styles.healthButton}`}
									onClick={() => openModal("transferHealthModal")}
								>
									<i className="bi bi-check-circle-fill" aria-hidden="true" />
									<span>
										<strong>Rail health is within target</strong>
										<span>
											47 institutions reachable · RTGS closes 16:00 EAT
										</span>
									</span>
								</button>
							</aside>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="international-heading"
					>
						<SectionHeading
							index="04"
							id="international-heading"
							title="International and FX desk"
							description="Track SWIFT transfers, corridor status and indicative foreign exchange rates in one view."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btn}
										onClick={() => openModal("fxRatesModal")}
									>
										<i className="bi bi-calculator" /> FX calculator
									</button>
									<button
										type="button"
										className={`${styles.btn} ${styles.btnPrimary}`}
										onClick={() => openModal("internationalModal")}
									>
										<i className="bi bi-globe2" /> Send internationally
									</button>
								</div>
							}
						/>
						<div className={styles.internationalGrid}>
							<article className={`${styles.card} ${styles.tableCard}`}>
								<div className={styles.tableToolbar}>
									<div className={styles.tableTitle}>
										<h3>Cross-border transfers</h3>
										<span>SWIFT and regional corridor activity</span>
									</div>
									<span className={`${styles.badge} ${styles.badgeInfo}`}>
										12 active corridors
									</span>
								</div>
								<div className={styles.tableScroll}>
									<table className={styles.table}>
										<caption className={styles.srOnly}>
											International bank transfers
										</caption>
										<thead>
											<tr>
												<th scope="col">Date</th>
												<th scope="col">Beneficiary</th>
												<th scope="col">Destination</th>
												<th scope="col">Amount</th>
												<th scope="col">FX rate</th>
												<th scope="col">Method</th>
												<th scope="col">Status</th>
												<th scope="col">
													<span className={styles.srOnly}>Actions</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{content.international.map((transfer) => (
												<tr key={`${transfer.date}-${transfer.beneficiary}`}>
													<td>{transfer.date}</td>
													<td>
														<strong>{transfer.beneficiary}</strong>
													</td>
													<td>{transfer.dest}</td>
													<td>
														<strong>{transfer.amount}</strong>
													</td>
													<td>{transfer.fx}</td>
													<td>{transfer.method}</td>
													<td>
														<span
															className={`${styles.badge} ${toneBadge[transfer.statusTone]}`}
														>
															{transfer.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={styles.iconButton}
															aria-label={`${transfer.action.label} transfer to ${transfer.beneficiary}`}
															onClick={() => openModal(transfer.action.modal)}
														>
															<i className="bi bi-arrow-up-right" />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</article>

							<aside className={`${styles.card} ${styles.fxPanel}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Indicative rates</span>
										<h3>KES exchange desk</h3>
									</div>
									<i className="bi bi-graph-up-arrow" aria-hidden="true" />
								</div>
								<div className={styles.fxList}>
									{content.fxRates.map((rate) => (
										<div className={styles.fxRow} key={rate.code}>
											<div className={styles.fxCurrency}>
												<span>{rate.code}</span>
												<strong>{rate.code} / KES</strong>
											</div>
											<div className={styles.fxValue}>
												<strong>{rate.rate}</strong>
												<span
													className={
														rate.up ? styles.deltaUp : styles.deltaDown
													}
												>
													{rate.delta}
												</span>
											</div>
										</div>
									))}
								</div>
								<button
									type="button"
									className={styles.btn}
									onClick={() => openModal("fxRatesModal")}
								>
									<i className="bi bi-bell" /> Manage rate alerts
								</button>
							</aside>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="schedule-heading"
					>
						<SectionHeading
							index="05"
							id="schedule-heading"
							title="Scheduled and recurring transfers"
							description="Control future-dated supplier payments and repeat obligations before their next execution."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btn}
										onClick={() => openModal("scheduleTransferModal")}
									>
										<i className="bi bi-calendar-plus" /> New schedule
									</button>
									<button
										type="button"
										className={styles.btn}
										onClick={() => openModal("recurringModal")}
									>
										<i className="bi bi-arrow-repeat" /> Recurring rule
									</button>
								</div>
							}
						/>
						<article className={`${styles.card} ${styles.scheduleCard}`}>
							<div className={styles.cardHeader}>
								<div>
									<span className={styles.cardKicker}>Execution calendar</span>
									<h3>Upcoming runs</h3>
								</div>
								<span className={`${styles.badge} ${styles.badgeSuccess}`}>
									{content.schedules.length} active
								</span>
							</div>
							<div className={styles.scheduleList}>
								{content.schedules.map((schedule) => {
									const [day, month] = schedule.next.split(" ");
									return (
										<div className={styles.scheduleRow} key={schedule.name}>
											<div className={styles.scheduleDate}>
												<strong>{day}</strong>
												<small>{month}</small>
											</div>
											<div className={styles.scheduleName}>
												<strong>{schedule.name}</strong>
												<span>{schedule.beneficiary}</span>
											</div>
											<div className={styles.scheduleMeta}>
												<strong>{schedule.frequency}</strong>
												<span>Frequency</span>
											</div>
											<strong className={styles.scheduleAmount}>
												{schedule.amount}
											</strong>
											<span
												className={`${styles.badge} ${toneBadge[schedule.statusTone]}`}
											>
												{schedule.status}
											</span>
											<button
												type="button"
												className={styles.iconButton}
												aria-label={`${schedule.action.label} ${schedule.name}`}
												onClick={() => openModal(schedule.action.modal)}
											>
												<i className="bi bi-pencil" />
											</button>
										</div>
									);
								})}
							</div>
						</article>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="history-heading"
					>
						<SectionHeading
							index="06"
							id="history-heading"
							title="History and reconciliation"
							description="Search the audit trail, reopen receipts and export evidence for finance operations."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btn}
										onClick={() => openModal("reconciliationModal")}
									>
										<i className="bi bi-check2-square" /> Reconcile
									</button>
									<button
										type="button"
										className={styles.btn}
										onClick={() => openModal("transferHistoryModal")}
									>
										<i className="bi bi-download" /> Export
									</button>
								</div>
							}
						/>
						<article className={`${styles.card} ${styles.tableCard}`}>
							<div className={styles.tableToolbar}>
								<div className={styles.tableTitle}>
									<h3>Transfer register</h3>
									<span>
										{filteredHistory.length} of {content.history.length} records
										shown
									</span>
								</div>
								<div className={styles.tableTools}>
									<label className={styles.tableSearch}>
										<span className={styles.srOnly}>
											Search transfer history
										</span>
										<i className="bi bi-search" />
										<input
											type="search"
											value={historyQuery}
											onChange={(event) => setHistoryQuery(event.target.value)}
											placeholder="Search history"
										/>
									</label>
									<fieldset className={styles.filterPills}>
										<legend className={styles.srOnly}>
											Filter transfer history by status
										</legend>
										{["all", "success", "processing", "delivered"].map(
											(status) => (
												<button
													type="button"
													key={status}
													className={
														historyStatus === status ? styles.filterActive : ""
													}
													aria-pressed={historyStatus === status}
													onClick={() => setHistoryStatus(status)}
												>
													{status === "all" ? "All" : status}
												</button>
											),
										)}
									</fieldset>
								</div>
							</div>
							{filteredHistory.length ? (
								<div className={styles.tableScroll}>
									<table className={styles.table}>
										<caption className={styles.srOnly}>
											Searchable transfer history
										</caption>
										<thead>
											<tr>
												<th scope="col">Date</th>
												<th scope="col">Reference</th>
												<th scope="col">Beneficiary</th>
												<th scope="col">Bank</th>
												<th scope="col">Amount</th>
												<th scope="col">Method</th>
												<th scope="col">Status</th>
												<th scope="col">Receipt</th>
											</tr>
										</thead>
										<tbody>
											{filteredHistory.map((transfer) => (
												<tr key={transfer.ref}>
													<td>{transfer.date}</td>
													<td>
														<code>{transfer.ref}</code>
													</td>
													<td>
														<strong>{transfer.beneficiary}</strong>
													</td>
													<td>{transfer.bank}</td>
													<td>
														<strong>{transfer.amount}</strong>
													</td>
													<td>{transfer.method}</td>
													<td>
														<span
															className={`${styles.badge} ${toneBadge[transfer.statusTone]}`}
														>
															{transfer.status}
														</span>
													</td>
													<td>
														<button
															type="button"
															className={styles.textButton}
															onClick={() => openModal(transfer.action.modal)}
														>
															{transfer.action.label}{" "}
															<i className="bi bi-arrow-up-right" />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className={styles.emptyState}>
									<i className="bi bi-search" />
									<strong>No matching transfers</strong>
									<span>Adjust the search or status filter.</span>
								</div>
							)}
							<div className={styles.tableFooter}>
								<span>
									Audit records reflect the current workspace snapshot
								</span>
								<button
									type="button"
									className={styles.textButton}
									onClick={() => {
										setHistoryQuery("");
										setHistoryStatus("all");
									}}
								>
									Reset filters
								</button>
							</div>
						</article>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="governance-heading"
					>
						<SectionHeading
							index="07"
							id="governance-heading"
							title="Limits, approvals and compliance"
							description="Keep maker-checker controls, rail limits and regulatory screening visible to operators."
						/>
						<div className={styles.governanceGrid}>
							<article className={`${styles.card} ${styles.governanceCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Policy</span>
										<h3>Transfer limits</h3>
									</div>
									<button
										type="button"
										className={styles.iconButton}
										aria-label="Manage transfer limits"
										onClick={() => openModal(content.limits.action.modal)}
									>
										<i className="bi bi-sliders" />
									</button>
								</div>
								<div className={styles.metricList}>
									<div className={styles.metricRow}>
										<span>Daily remaining</span>
										<strong>{content.limits.daily}</strong>
									</div>
									<div className={styles.metricRow}>
										<span>Monthly remaining</span>
										<strong>{content.limits.monthly}</strong>
									</div>
									<div className={styles.metricRow}>
										<span>Per transfer</span>
										<strong>{content.limits.perTransfer}</strong>
									</div>
									<div className={styles.metricRow}>
										<span>International</span>
										<strong>{content.limits.international}</strong>
									</div>
								</div>
							</article>

							<article className={`${styles.card} ${styles.governanceCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Maker-checker</span>
										<h3>Approval rules</h3>
									</div>
									<button
										type="button"
										className={styles.iconButton}
										aria-label="Manage approval workflows"
										onClick={() => openModal(content.approvals.action.modal)}
									>
										<i className="bi bi-person-check" />
									</button>
								</div>
								<div className={styles.approvalList}>
									{content.approvals.items.map((approval) => (
										<div className={styles.approvalRow} key={approval.label}>
											<span>{approval.label}</span>
											<span
												className={`${styles.badge} ${toneBadge[approval.tone]}`}
											>
												{approval.value}
											</span>
										</div>
									))}
								</div>
							</article>

							<article className={`${styles.card} ${styles.governanceCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Assurance</span>
										<h3>Compliance controls</h3>
									</div>
									<button
										type="button"
										className={styles.iconButton}
										aria-label="Open compliance controls"
										onClick={() => openModal("complianceModal")}
									>
										<i className="bi bi-shield-check" />
									</button>
								</div>
								<div className={styles.complianceGrid}>
									{content.compliance.map((item) => (
										<div className={styles.complianceTile} key={item.label}>
											<div>
												<i className="bi bi-check-circle-fill" />
												<span>{item.label}</span>
											</div>
											<strong>{item.value}</strong>
										</div>
									))}
								</div>
							</article>
						</div>
					</section>
				</div>

				<nav className={styles.floatingBar} aria-label="Transfer shortcuts">
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openModal("initiateTransferModal")}
					>
						<i className="bi bi-plus-lg" /> New transfer
					</button>
					<button
						type="button"
						onClick={() => openModal("scheduleTransferModal")}
					>
						<i className="bi bi-calendar3" /> Schedule
					</button>
					<button type="button" onClick={() => openModal("bulkTransferModal")}>
						<i className="bi bi-collection" /> Bulk upload
					</button>
					<button type="button" onClick={() => openModal("beneficiaryModal")}>
						<i className="bi bi-people" /> Beneficiaries
					</button>
				</nav>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-check" /> Protected by PayMo approval and
						compliance controls
					</span>
					<nav aria-label="Footer links">
						<a href="/pm/app/support">Support</a>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v2.4.0</span>
					</nav>
				</footer>
			</main>

			<AttentionHubFab
				count={drawerAttention.length}
				hidden={drawerOpen}
				onClick={() => setDrawerOpen(true)}
			/>

			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Transfer management"
				pageIcon="bi-arrow-repeat"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>

			<TransferManagementModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={{ banks: data.banks }}
			/>
		</div>
	);
}
