import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { TransferOverviewModals } from "../components/TransferOverviewModals";
import styles from "../styles/transfer-overview.module.css";

/* ──────────────────────────────────────────────────────────────────────────
   Mock data (unchanged)
   ────────────────────────────────────────────────────────────────────────── */
type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface NavItem {
	icon: string;
	to: string;
	label: string;
	active?: boolean;
	dot?: boolean;
}
interface SrItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	iconColor: string;
	label: string;
	modal: string;
}
interface TransferRow {
	date: string;
	beneficiary: string;
	amount: string;
	method: string;
	status: string;
	statusTone: BadgeTone;
	ref: string;
	actionLabel: string;
	actionModal: string;
}
interface ChannelRow {
	name: string;
	transfers: string;
	amount: string;
}
interface ScheduledRow {
	schedule: string;
	beneficiary: string;
	amount: string;
	frequency: string;
	nextRun: string;
	status: string;
	statusTone: BadgeTone;
	actionLabel: string;
}
interface Favorite {
	name: string;
	account: string;
	type: string;
	color: string;
}
interface TopRecipient {
	name: string;
	amount: string;
}
interface SuccessRate {
	channel: string;
	rate: string;
	tone: BadgeTone;
}
interface TrendBar {
	month: string;
	height: string;
	color: string;
}

interface TransferConfig {
	hero: {
		live: string;
		value: string;
		detail: string;
		actions: { label: string; modal: string }[];
	};
	statCards: {
		key: string;
		col: string;
		label: string;
		labelColor: string;
		value: string;
		badge: { icon: string; text: string; tone: BadgeTone };
		lines: string[];
		warnBorder?: boolean;
	}[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	recentTransfers: TransferRow[];
	channels: ChannelRow[];
	favorites: Favorite[];
	scheduled: ScheduledRow[];
	topRecipients: TopRecipient[];
	successRates: SuccessRate[];
	trendBars: TrendBar[];
}

const initialMockData: TransferConfig = {
	hero: {
		live: "Transfer center is live",
		value: "KES 2.84M transferred",
		detail: "This month across 1,248 transactions. 98.7% success rate.",
		actions: [
			{ label: "Send", modal: "initiateTransferModal" },
			{ label: "Bulk", modal: "bulkTransferModal" },
			{ label: "Schedule", modal: "scheduleTransferModal" },
		],
	},
	statCards: [
		{
			key: "completed",
			col: "col-lg-2 col-md-4 col-6",
			label: "COMPLETED",
			labelColor: "var(--pm-accent)",
			value: "1,189",
			badge: { icon: "bi-check-circle", text: "98.7%", tone: "badgeS" },
			lines: ["Avg time: 12 seconds"],
		},
		{
			key: "pending",
			col: "col-lg-3 col-md-4 col-6",
			label: "PENDING / SCHEDULED",
			labelColor: "var(--pm-info)",
			value: "47",
			badge: { icon: "bi-clock", text: "32 today", tone: "badgeI" },
			lines: ["Next execution: Today 3:00 PM"],
		},
		{
			key: "failed",
			col: "col-lg-3 col-md-4",
			label: "FAILED / REJECTED",
			labelColor: "var(--pm-warning)",
			value: "12",
			badge: { icon: "bi-exclamation-triangle", text: "1.0%", tone: "badgeW" },
			lines: ["Most common: Insufficient funds"],
			warnBorder: true,
		},
	],
	attention: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "Scheduled transfer to landlord failed",
			sub: "KES 35,000 · Insufficient funds",
			actionLabel: "Retry",
			modal: "retryTransferModal",
		},
		{
			icon: "bi-clock",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "3 recurring payments need funding source update",
			sub: "M-Pesa number changed",
			actionLabel: "Update",
			modal: "manageBeneficiariesModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Large transfer (KES 450,000) pending approval",
			sub: "Requires 2FA confirmation",
			actionLabel: "Approve",
			modal: "initiateTransferModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightning-charge",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Set up auto-pay for 4 recurring bills",
			sub: "Save 3 hours/month",
			actionLabel: "Setup",
			modal: "scheduleTransferModal",
		},
		{
			icon: "bi-people",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Add 6 frequent contacts as favorites",
			sub: "Faster transfers",
			actionLabel: "Add",
			modal: "manageBeneficiariesModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Your rent transfer is due in 4 days",
			sub: "KES 45,000 to Landlord",
			actionLabel: "Pay Early",
			modal: "initiateTransferModal",
		},
	],
	quickActions: [
		{ icon: "bi-send", iconColor: "var(--pm-primary)", label: "Send Money", modal: "initiateTransferModal" },
		{ icon: "bi-collection", iconColor: "var(--pm-info)", label: "Bulk Transfer", modal: "bulkTransferModal" },
		{ icon: "bi-calendar-event", iconColor: "var(--pm-accent)", label: "Schedule", modal: "scheduleTransferModal" },
		{ icon: "bi-person-plus", iconColor: "var(--pm-warning)", label: "Beneficiaries", modal: "manageBeneficiariesModal" },
		{ icon: "bi-clock-history", iconColor: "var(--pm-purple)", label: "History", modal: "transferHistoryModal" },
		{ icon: "bi-sliders", iconColor: "var(--pm-accent)", label: "Limits", modal: "transferLimitsModal" },
	],
	recentTransfers: [
		{ date: "27 Jun", beneficiary: "Grace Kamau", amount: "KES 12,500", method: "M-Pesa", status: "Success", statusTone: "badgeS", ref: "TRF-448291", actionLabel: "Details", actionModal: "transferDetailModal" },
		{ date: "26 Jun", beneficiary: "Landlord Properties", amount: "KES 45,000", method: "Bank", status: "Success", statusTone: "badgeS", ref: "TRF-447820", actionLabel: "Details", actionModal: "transferDetailModal" },
		{ date: "25 Jun", beneficiary: "James Ochieng", amount: "KES 8,200", method: "Internal", status: "Success", statusTone: "badgeS", ref: "TRF-447103", actionLabel: "Details", actionModal: "transferDetailModal" },
		{ date: "24 Jun", beneficiary: "Equity Bank", amount: "KES 120,000", method: "Bank", status: "Pending", statusTone: "badgeI", ref: "TRF-446991", actionLabel: "Track", actionModal: "retryTransferModal" },
		{ date: "23 Jun", beneficiary: "Safaricom", amount: "KES 1,500", method: "M-Pesa", status: "Success", statusTone: "badgeS", ref: "TRF-446450", actionLabel: "Details", actionModal: "transferDetailModal" },
	],
	channels: [
		{ name: "M-Pesa", transfers: "612 transfers", amount: "KES 1.24M" },
		{ name: "Bank Transfer", transfers: "298 transfers", amount: "KES 892K" },
		{ name: "Internal Wallet", transfers: "187 transfers", amount: "KES 412K" },
		{ name: "International", transfers: "51 transfers", amount: "KES 296K" },
	],
	favorites: [
		{ name: "Grace Kamau", account: "0712 345 890", type: "M-Pesa", color: "#10B981" },
		{ name: "Landlord Properties", account: "Bank 0012345678", type: "Bank", color: "#3B82F6" },
		{ name: "James Ochieng", account: "0722 111 222", type: "M-Pesa", color: "#10B981" },
		{ name: "Equity Bank", account: "0012345678", type: "Bank", color: "#3B82F6" },
	],
	scheduled: [
		{ schedule: "Rent", beneficiary: "Landlord Properties", amount: "KES 45,000", frequency: "Monthly", nextRun: "01 Jul 2025", status: "Active", statusTone: "badgeS", actionLabel: "Edit" },
		{ schedule: "Salary Advance", beneficiary: "Grace Kamau", amount: "KES 15,000", frequency: "Bi-weekly", nextRun: "28 Jun 2025", status: "Active", statusTone: "badgeS", actionLabel: "Edit" },
		{ schedule: "Internet Bill", beneficiary: "Safaricom Fibre", amount: "KES 5,999", frequency: "Monthly", nextRun: "01 Jul 2025", status: "Paused", statusTone: "badgeW", actionLabel: "Resume" },
	],
	topRecipients: [
		{ name: "Grace Kamau", amount: "KES 187,500" },
		{ name: "Landlord Properties", amount: "KES 135,000" },
		{ name: "Equity Bank", amount: "KES 120,000" },
		{ name: "Safaricom", amount: "KES 42,000" },
	],
	successRates: [
		{ channel: "M-Pesa", rate: "99.4%", tone: "badgeS" },
		{ channel: "Bank Transfer", rate: "97.8%", tone: "badgeS" },
		{ channel: "Internal", rate: "100%", tone: "badgeS" },
		{ channel: "International", rate: "94.1%", tone: "badgeW" },
	],
	trendBars: [
		{ month: "Jan", height: "55%", color: "var(--pm-primary)" },
		{ month: "Feb", height: "68%", color: "var(--pm-primary)" },
		{ month: "Mar", height: "82%", color: "var(--pm-warning)" },
		{ month: "Apr", height: "75%", color: "var(--pm-primary)" },
		{ month: "May", height: "90%", color: "var(--pm-accent)" },
		{ month: "Jun", height: "100%", color: "var(--pm-primary)" },
	],
};

/* ──────────────────────────────────────────────────────────────────────────
   Data fetch
   ────────────────────────────────────────────────────────────────────────── */
async function fetchTransferOverview(): Promise<TransferConfig> {
	const res = await fetch("/api/transfer-overview", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
	return (await res.json()) as TransferConfig;
}

/* ──────────────────────────────────────────────────────────────────────────
   Section heading
   ────────────────────────────────────────────────────────────────────────── */
function SectionHeading({
	id,
	index,
	title,
	description,
	action,
}: {
	id: string;
	index: string;
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
			{action && <div className={styles.sectionAction}>{action}</div>}
		</div>
	);
}

/* ──────────────────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────────────────────── */
export function TransferOverview() {
	const { data } = useQuery({
		queryKey: ["paymo-transfer-overview"],
		queryFn: fetchTransferOverview,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [transferSearch, setTransferSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"All" | "Success" | "Pending">("All");

	const openModal = (id: string) => setModalState({ [id]: true });
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	const filteredTransfers = useMemo(() => {
		const query = transferSearch.trim().toLowerCase();
		return config.recentTransfers.filter((transfer) => {
			const matchesStatus = statusFilter === "All" || transfer.status === statusFilter;
			const matchesSearch =
				!query ||
				transfer.beneficiary.toLowerCase().includes(query) ||
				transfer.ref.toLowerCase().includes(query) ||
				transfer.method.toLowerCase().includes(query);
			return matchesStatus && matchesSearch;
		});
	}, [config.recentTransfers, statusFilter, transferSearch]);

	const statIcons: Record<string, string> = {
		completed: "bi-check2-circle",
		pending: "bi-clock-history",
		failed: "bi-exclamation-triangle",
	};
	const channelShares = [44, 31, 15, 10];

	return (
		<div className={styles.transferPage}>
			<main className={styles.main}>
				<div className={styles.content}>
					{/* Executive hero */}
					<section className={styles.heroBanner} aria-labelledby="transfer-overview-title">
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-lightning-charge-fill" />{" "}
										Transaction banking · Overview
									</span>
									<span className={styles.heroLive}>
										<span className={styles.dotLive} /> {config.hero.live}
									</span>
								</div>
								<h1 id="transfer-overview-title">
									Move money with complete visibility.
								</h1>
								<p>
									Initiate instant transfers, schedule recurring payments, manage
									beneficiaries, and monitor all money movement across M-Pesa,
									banks, and internal wallets.
								</p>
								<div className={styles.heroActions}>
									{config.hero.actions.map((action, index) => (
										<button
											type="button"
											key={action.label}
											className={
												index === 0
													? styles.heroPrimaryBtn
													: styles.heroSecondaryBtn
											}
											onClick={() => openModal(action.modal)}
										>
											<i
												className={`bi ${
													index === 0
														? "bi-send-fill"
														: index === 1
															? "bi-collection-fill"
															: "bi-calendar2-check-fill"
												}`}
											/>
											{action.label}
										</button>
									))}
								</div>
							</div>
							<div className={styles.heroSnapshot}>
								<span>This month</span>
								<strong>
									{config.hero.value.replace(" transferred", "")}
								</strong>
								<p>{config.hero.detail}</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>98.7%</strong>
										<span>Success</span>
									</div>
									<div>
										<strong>12 sec</strong>
										<span>Avg. time</span>
									</div>
									<div>
										<strong>47</strong>
										<span>Queued</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* 1.1 Transaction pulse */}
					<section className={styles.dashboardSection} aria-labelledby="pulse-heading">
						<SectionHeading
							id="pulse-heading"
							index="1.1"
							title="Transaction pulse"
							description="A concise view of volume, completion and operational exceptions."
						/>
						<div className={styles.kpiGrid}>
							<article className={`${styles.card} ${styles.kpiCard} ${styles.kpiFeatured}`}>
								<div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
									<i className="bi bi-arrow-left-right" />
								</div>
								<div className={styles.kpiMeta}>
									<span>Total transferred</span>
									<small>Jun 2025</small>
								</div>
								<strong className={styles.kpiValue}>
									{config.hero.value.replace(" transferred", "")}
								</strong>
								<div className={styles.kpiFoot}>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										<i className="bi bi-arrow-up-right" /> 12.4%
									</span>
									<span>vs last month</span>
								</div>
							</article>
							{config.statCards.map((stat) => (
								<article
									key={stat.key}
									className={`${styles.card} ${styles.kpiCard} ${stat.warnBorder ? styles.kpiWarning : ""}`}
								>
									<div
										className={`${styles.kpiIcon} ${
											stat.key === "completed"
												? styles.kpiIconGreen
												: stat.key === "pending"
													? styles.kpiIconBlue
													: styles.kpiIconAmber
										}`}
									>
										<i className={`bi ${statIcons[stat.key] ?? "bi-wallet2"}`} />
									</div>
									<div className={styles.kpiMeta}>
										<span>{stat.label}</span>
										<small>Live count</small>
									</div>
									<strong className={styles.kpiValue}>{stat.value}</strong>
									<div className={styles.kpiFoot}>
										<span className={`${styles.badge} ${styles[stat.badge.tone]}`}>
											<i className={`bi ${stat.badge.icon}`} /> {stat.badge.text}
										</span>
										<span>{stat.lines[0]}</span>
									</div>
								</article>
							))}
						</div>
					</section>

					{/* 1.2 Needs your attention */}
					<section className={styles.dashboardSection} aria-labelledby="attention-heading">
						<SectionHeading
							id="attention-heading"
							index="1.2"
							title="Needs your attention"
							description="Resolve exceptions and act on intelligent recommendations without leaving the dashboard."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("attentionModal")}
								>
									<i className="bi bi-list-check" /> Review queue
								</button>
							}
						/>
						<div className={styles.attentionGrid}>
							<article className={`${styles.card} ${styles.listCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Action center</span>
										<h3>Transfer exceptions</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeW}`}>
										{config.attention.length} open
									</span>
								</div>
								<div className={styles.listBody}>
									{config.attention.map((item) => (
										<div key={item.title} className={styles.actionRow}>
											<div className={styles.actionRowMain}>
												<span
													className={styles.iconCircle}
													style={{ background: item.iconBg, color: item.iconColor }}
												>
													<i className={`bi ${item.icon}`} />
												</span>
												<div>
													<strong>{item.title}</strong>
													<span>{item.sub}</span>
												</div>
											</div>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openModal(item.modal)}
											>
												{item.actionLabel}
											</button>
										</div>
									))}
								</div>
							</article>

							<article className={`${styles.card} ${styles.listCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Smart guidance</span>
										<h3>Suggested next moves</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeP}`}>
										<i className="bi bi-stars" /> Insights
									</span>
								</div>
								<div className={styles.listBody}>
									{config.suggestions.map((item) => (
										<div key={item.title} className={styles.actionRow}>
											<div className={styles.actionRowMain}>
												<span
													className={styles.iconCircle}
													style={{ background: item.iconBg, color: item.iconColor }}
												>
													<i className={`bi ${item.icon}`} />
												</span>
												<div>
													<strong>{item.title}</strong>
													<span>{item.sub}</span>
												</div>
											</div>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openModal(item.modal)}
											>
												{item.actionLabel}
											</button>
										</div>
									))}
								</div>
							</article>
						</div>

						<article className={`${styles.card} ${styles.quickActionCard}`}>
							<div className={styles.quickActionIntro}>
								<span className={styles.cardKicker}>Shortcuts</span>
								<h3>Start a workflow</h3>
								<p>Frequent transaction tasks, one click away.</p>
							</div>
							<div className={styles.quickGrid}>
								{config.quickActions.map((action) => (
									<button
										type="button"
										key={action.label}
										className={styles.quickBtn}
										onClick={() => openModal(action.modal)}
									>
										<span style={{ color: action.iconColor }}>
											<i className={`bi ${action.icon}`} />
										</span>
										{action.label}
										<i className="bi bi-arrow-right" />
									</button>
								))}
							</div>
						</article>
					</section>

					{/* 1.3 Transfer portfolio */}
					<section className={styles.dashboardSection} aria-labelledby="portfolio-heading">
						<SectionHeading
							id="portfolio-heading"
							index="1.3"
							title="Transfer portfolio"
							description="Search and monitor recent money movement across every connected rail."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={styles.btnPm}
										onClick={() => openModal("transferAnalyticsModal")}
									>
										<i className="bi bi-bar-chart" /> Analytics
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnPmP}`}
										onClick={() => openModal("initiateTransferModal")}
									>
										<i className="bi bi-plus-lg" /> New transfer
									</button>
								</div>
							}
						/>
						<div className={styles.portfolioGrid}>
							<article className={`${styles.card} ${styles.tableCard}`}>
								<div className={styles.tableToolbar}>
									<div className={styles.tableTitle}>
										<h3>Recent transfers</h3>
										<span>Latest activity across linked accounts</span>
									</div>
									<div className={styles.tableTools}>
										<label className={styles.tableSearch}>
											<i className="bi bi-search" />
											<span className={styles.srOnly}>Search transfers</span>
											<input
												value={transferSearch}
												onChange={(e) => setTransferSearch(e.target.value)}
												placeholder="Search name or reference"
											/>
										</label>
										<fieldset className={styles.filterPills}>
											<legend className={styles.srOnly}>Filter transfer status</legend>
											{(["All", "Success", "Pending"] as const).map((filter) => (
												<button
													type="button"
													key={filter}
													className={statusFilter === filter ? styles.filterActive : ""}
													onClick={() => setStatusFilter(filter)}
												>
													{filter}
												</button>
											))}
										</fieldset>
									</div>
								</div>
								<div className={styles.tableScroll}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Date</th>
												<th>Beneficiary</th>
												<th>Amount</th>
												<th>Rail</th>
												<th>Status</th>
												<th>Reference</th>
												<th><span className={styles.srOnly}>Action</span></th>
											</tr>
										</thead>
										<tbody>
											{filteredTransfers.map((transfer) => (
												<tr key={transfer.ref}>
													<td>{transfer.date}</td>
													<td>
														<div className={styles.beneficiaryCell}>
															<span>{transfer.beneficiary.slice(0, 1)}</span>
															<strong>{transfer.beneficiary}</strong>
														</div>
													</td>
													<td><strong>{transfer.amount}</strong></td>
													<td>{transfer.method}</td>
													<td>
														<span className={`${styles.badge} ${styles[transfer.statusTone]}`}>
															{transfer.status}
														</span>
													</td>
													<td><code>{transfer.ref}</code></td>
													<td>
														<button
															type="button"
															className={styles.iconButton}
															aria-label={`${transfer.actionLabel} for ${transfer.ref}`}
															onClick={() => openModal(transfer.actionModal)}
														>
															<i className="bi bi-arrow-up-right" />
														</button>
													</td>
												</tr>
											))}
											{filteredTransfers.length === 0 && (
												<tr>
													<td colSpan={7}>
														<div className={styles.emptyState}>
															<i className="bi bi-search" />
															<strong>No transfers found</strong>
															<span>Try a different search or status filter.</span>
														</div>
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
								<div className={styles.tableFooter}>
									<span>
										Showing {filteredTransfers.length} of{" "}
										{config.recentTransfers.length} transfers
									</span>
									<button
										type="button"
										onClick={() => openModal("transferHistoryModal")}
									>
										View full history <i className="bi bi-arrow-right" />
									</button>
								</div>
							</article>

							<aside className={`${styles.card} ${styles.channelCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Rail mix</span>
										<h3>Transfer channels</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>Healthy</span>
								</div>
								<div className={styles.channelList}>
									{config.channels.map((channel, index) => (
										<div key={channel.name} className={styles.channelRow}>
											<div className={styles.channelTop}>
												<div>
													<strong>{channel.name}</strong>
													<span>{channel.transfers}</span>
												</div>
												<strong>{channel.amount}</strong>
											</div>
											<div className={styles.progressTrack}>
												<span style={{ width: `${channelShares[index] ?? 10}%` }} />
											</div>
										</div>
									))}
								</div>
								<div className={styles.channelInsight}>
									<i className="bi bi-lightbulb" />
									<div>
										<strong>M-Pesa leads volume</strong>
										<span>44% of transfers use the mobile rail.</span>
									</div>
								</div>
							</aside>
						</div>
					</section>

					{/* 1.4 Recipients & schedules */}
					<section className={styles.dashboardSection} aria-labelledby="relationships-heading">
						<SectionHeading
							id="relationships-heading"
							index="1.4"
							title="Recipients & schedules"
							description="Keep frequent payees close and recurring transfers predictable."
						/>
						<div className={styles.relationshipGrid}>
							<article className={`${styles.card} ${styles.favoriteCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Beneficiaries</span>
										<h3>Favourites</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openModal("manageBeneficiariesModal")}
									>
										Manage <i className="bi bi-arrow-right" />
									</button>
								</div>
								<div className={styles.favoriteGrid}>
									{config.favorites.map((favorite) => (
										<button
											type="button"
											key={favorite.name}
											className={styles.favoriteTile}
											onClick={() => openModal("initiateTransferModal")}
										>
											<span
												className={styles.favoriteAvatar}
												style={{
													background: `${favorite.color}18`,
													color: favorite.color,
												}}
											>
												{favorite.name
													.split(" ")
													.map((part) => part[0])
													.join("")
													.slice(0, 2)}
											</span>
											<strong>{favorite.name}</strong>
											<small>{favorite.account}</small>
											<span
												className={`${styles.badge} ${
													favorite.type === "M-Pesa" ? styles.badgeS : styles.badgeI
												}`}
											>
												{favorite.type}
											</span>
										</button>
									))}
								</div>
							</article>

							<article className={`${styles.card} ${styles.scheduleCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Automation</span>
										<h3>Scheduled transfers</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openModal("scheduleTransferModal")}
									>
										Add schedule <i className="bi bi-plus-lg" />
									</button>
								</div>
								<div className={styles.scheduleList}>
									{config.scheduled.map((schedule) => (
										<div key={schedule.schedule} className={styles.scheduleRow}>
											<span className={styles.scheduleDate}>
												<strong>{schedule.nextRun.split(" ")[0]}</strong>
												<small>{schedule.nextRun.split(" ")[1]}</small>
											</span>
											<div className={styles.scheduleName}>
												<strong>{schedule.schedule}</strong>
												<span>
													{schedule.beneficiary} · {schedule.frequency}
												</span>
											</div>
											<div className={styles.scheduleAmount}>
												<strong>{schedule.amount}</strong>
												<span className={`${styles.badge} ${styles[schedule.statusTone]}`}>
													{schedule.status}
												</span>
											</div>
											<button
												type="button"
												className={styles.iconButton}
												aria-label={`${schedule.actionLabel} ${schedule.schedule}`}
												onClick={() => openModal("editScheduleModal")}
											>
												<i className="bi bi-three-dots" />
											</button>
										</div>
									))}
								</div>
							</article>
						</div>
					</section>

					{/* 1.5 Transfer analytics */}
					<section className={styles.dashboardSection} aria-labelledby="analytics-heading">
						<SectionHeading
							id="analytics-heading"
							index="1.5"
							title="Transfer analytics"
							description="Patterns that help your team optimise timing, rails and recipient concentration."
							action={
								<button
									type="button"
									className={styles.btnPm}
									onClick={() => openModal("transferAnalyticsModal")}
								>
									Open analytics <i className="bi bi-arrow-up-right" />
								</button>
							}
						/>
						<div className={styles.analyticsGrid}>
							<article className={`${styles.card} ${styles.analyticsCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Volume</span>
										<h3>Six-month trend</h3>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										<i className="bi bi-arrow-up" /> 12.4%
									</span>
								</div>
								<div className={styles.chartBars}>
									{config.trendBars.map((bar) => (
										<div key={bar.month} className={styles.chartBar}>
											<i style={{ height: bar.height, background: bar.color }} />
											<span className={styles.barLabel}>{bar.month}</span>
										</div>
									))}
								</div>
							</article>
							<article className={`${styles.card} ${styles.analyticsCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Concentration</span>
										<h3>Top recipients</h3>
									</div>
								</div>
								<div className={styles.rankedList}>
									{config.topRecipients.map((recipient, index) => (
										<div key={recipient.name}>
											<span>{index + 1}</span>
											<strong>{recipient.name}</strong>
											<b>{recipient.amount}</b>
										</div>
									))}
								</div>
							</article>
							<article className={`${styles.card} ${styles.analyticsCard}`}>
								<div className={styles.cardHeader}>
									<div>
										<span className={styles.cardKicker}>Reliability</span>
										<h3>Success by rail</h3>
									</div>
								</div>
								<div className={styles.rateList}>
									{config.successRates.map((rate) => (
										<div key={rate.channel}>
											<span>{rate.channel}</span>
											<span className={`${styles.badge} ${styles[rate.tone]}`}>
												{rate.rate}
											</span>
										</div>
									))}
								</div>
								<div className={styles.analyticsNote}>
									<i className="bi bi-shield-check" /> All rails operating within target.
								</div>
							</article>
						</div>
					</section>
				</div>

				{/* Floating command bar */}
				<nav className={styles.floatingBar} aria-label="Quick transaction actions">
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openModal("initiateTransferModal")}
					>
						<i className="bi bi-send-fill" /> New transfer
					</button>
					<button type="button" onClick={() => openModal("bulkTransferModal")}>
						<i className="bi bi-collection" /> Bulk
					</button>
					<button type="button" onClick={() => openModal("scheduleTransferModal")}>
						<i className="bi bi-calendar2-check" /> Schedule
					</button>
					<button type="button" onClick={() => openModal("manageBeneficiariesModal")}>
						<i className="bi bi-people" /> Beneficiaries
					</button>
				</nav>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-check" /> Protected by PayMo secure
						transaction controls
					</span>
					<nav aria-label="Footer links">
						<Link to="/pm/app/support">Support</Link>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v2.4.0</span>
					</nav>
				</footer>
			</main>

			<TransferOverviewModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
			/>
		</div>
	);
}

export default TransferOverview;
