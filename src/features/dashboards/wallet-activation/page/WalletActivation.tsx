"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	AuthConsole,
	AuthPage,
	Badge,
	Button,
	Card,
	Chip,
	cx,
	EmptyState,
	go,
	Hero,
	Input,
	Modal,
	Notice,
	SegTabs,
	s,
	toast,
} from "@/features/authentication/components/AuthKit";
import AttentionDrawer from "../../transaction-dashboard/shared/components/AttentionDrawer";
import AttentionHubFab from "../../transaction-dashboard/shared/components/AttentionHubFab";
import type {
	AttentionItem as DrawerAttentionItem,
	QuickActionItem,
} from "../../transaction-dashboard/shared/data/attentionFeed";
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
	tier: "Verified",
	balance: "KES 1.28M",
	status: "Active",
};

type DashStatus = "Active" | "Pending" | "Off" | "Suspended";

interface Dashboard {
	id: string;
	name: string;
	icon: string;
	c1: string;
	c2: string;
	desc: string;
	status: DashStatus;
	badgeTone: "green" | "amber" | "slate" | "red";
	last: string;
	metrics: Array<[string, string]>;
	route?: string;
	modal?: string;
}

const dashboards: Dashboard[] = [
	{
		id: "tx",
		name: "Transaction Hub",
		icon: "bi-arrow-left-right",
		c1: "#12b76a",
		c2: "#7ee2b0",
		desc: "Payments, P2P and remittances.",
		status: "Active",
		badgeTone: "green",
		last: "Today, 14:22",
		metrics: [
			["KES 1.28M", "balance"],
			["T+0", "settle"],
		],
		route: "/pm/app/transfer-overview",
	},
	{
		id: "biz",
		name: "Business Portal",
		icon: "bi-briefcase",
		c1: "#7a5af8",
		c2: "#b39bff",
		desc: "Collections, payroll and invoices.",
		status: "Pending",
		badgeTone: "amber",
		last: "—",
		metrics: [
			["KES 6.15M", "float"],
			["Consent", "needed"],
		],
		modal: "activateDashboardModal",
	},
	{
		id: "util",
		name: "Utilities Hub",
		icon: "bi-lightning-charge",
		c1: "#f79009",
		c2: "#fdb022",
		desc: "Bills, airtime and subscriptions.",
		status: "Active",
		badgeTone: "green",
		last: "Yesterday",
		metrics: [
			["12", "bills/mo"],
			["T+0", "confirm"],
		],
		route: "/utility",
	},
	{
		id: "dev",
		name: "Developer Portal",
		icon: "bi-code-slash",
		c1: "#2e90fa",
		c2: "#84caff",
		desc: "API keys, webhooks and sandbox.",
		status: "Off",
		badgeTone: "slate",
		last: "—",
		metrics: [
			["Sandbox", "ready"],
			["0", "keys"],
		],
		modal: "activateDashboardModal",
	},
	{
		id: "loans",
		name: "Loans & Credit",
		icon: "bi-cash-stack",
		c1: "#2e90fa",
		c2: "#53b1fd",
		desc: "Personal and business credit.",
		status: "Active",
		badgeTone: "green",
		last: "25 Jun",
		metrics: [
			["KES 0", "drawn"],
			["View", "only"],
		],
		modal: "activeLinksModal",
	},
	{
		id: "save",
		name: "Savings",
		icon: "bi-piggy-bank",
		c1: "#7a5af8",
		c2: "#b39bff",
		desc: "MMF, deposits and SACCO.",
		status: "Active",
		badgeTone: "green",
		last: "24 Jun",
		metrics: [
			["KES 480K", "jar"],
			["In", "only"],
		],
		modal: "activeLinksModal",
	},
	{
		id: "crypto",
		name: "Crypto Center",
		icon: "bi-currency-bitcoin",
		c1: "#f04438",
		c2: "#fda29b",
		desc: "Buy, sell and hold assets.",
		status: "Suspended",
		badgeTone: "red",
		last: "20 Jun",
		metrics: [
			["USD 2.4K", "held"],
			["Revoke", "open"],
		],
		modal: "revokeAllAccessModal",
	},
	{
		id: "cards",
		name: "Cards Center",
		icon: "bi-credit-card-2-front",
		c1: "#101828",
		c2: "#475467",
		desc: "Virtual and physical cards.",
		status: "Active",
		badgeTone: "green",
		last: "Today, 11:05",
		metrics: [
			["5", "cards"],
			["4", "FX"],
		],
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
		title: "Account created",
		meta: "Profile onboarded",
		date: "12 Jan 2023",
		state: "done" as const,
		icon: "bi-person-check",
	},
	{
		title: "KYC verified",
		meta: "ID, address, selfie",
		date: "14 Jan 2023",
		state: "done" as const,
		icon: "bi-patch-check",
	},
	{
		title: "Consents signed",
		meta: "9 / 9 mandatory",
		date: "16 Jan 2023",
		state: "done" as const,
		icon: "bi-file-earmark-check",
	},
	{
		title: "PIN + biometric",
		meta: "Activation gates armed",
		date: "16 Jan 2023",
		state: "done" as const,
		icon: "bi-shield-lock",
	},
	{
		title: "Primary wallet live",
		meta: wallet.accountNumber,
		date: "18 Jan 2023",
		state: "current" as const,
		icon: "bi-wallet2",
	},
	{
		title: "Link more surfaces",
		meta: "4 live · 1 paused",
		date: "Next",
		state: "pending" as const,
		icon: "bi-link-45deg",
	},
];

const primaryActions = [
	{
		modal: "activateDashboardModal",
		icon: "bi-stars",
		tone: "amber" as const,
		label: "Activate",
		sub: "Consent + PIN wizard",
	},
	{
		modal: "linkAccountModal",
		icon: "bi-link-45deg",
		tone: "green" as const,
		label: "Link account",
		sub: "Source, destination, permissions",
	},
	{
		modal: "moneyRelocationModal",
		icon: "bi-arrow-left-right",
		tone: "blue" as const,
		label: "Relocate funds",
		sub: "8-step fund safety protocol",
	},
	{
		modal: "activeLinksModal",
		icon: "bi-layout-three-columns",
		tone: "violet" as const,
		label: "Manage links",
		sub: "Permissions, flow, unlink",
	},
];

const manageItems = [
	{
		modal: "linkPermissionsModal",
		icon: "bi-sliders",
		tone: "violet" as const,
		label: "Permissions",
		sub: "Presets and granular flow",
	},
	{
		modal: "linkNotificationsModal",
		icon: "bi-bell",
		tone: "amber" as const,
		label: "Alert routing",
		sub: "Channels and quiet hours",
	},
	{
		modal: "linkLimitsModal",
		icon: "bi-speedometer2",
		tone: "blue" as const,
		label: "Limits",
		sub: "Daily, monthly, velocity",
	},
	{
		modal: "privacyModal",
		icon: "bi-shield-check",
		tone: "green" as const,
		label: "Privacy",
		sub: "Cross-dashboard consent",
	},
	{
		modal: "preferencesModal",
		icon: "bi-sliders2",
		tone: "slate" as const,
		label: "Preferences",
		sub: "Defaults, PIN, tour",
	},
	{
		modal: "tourGuideModal",
		icon: "bi-signpost-2",
		tone: "green" as const,
		label: "Guided tour",
		sub: "8-step walkthrough",
	},
	{
		modal: "supportHelpModal",
		icon: "bi-headset",
		tone: "blue" as const,
		label: "Support",
		sub: "Guides, FAQ, live chat",
	},
	{
		modal: "revokeAllAccessModal",
		icon: "bi-x-octagon",
		tone: "red" as const,
		label: "Revoke all",
		sub: "Emergency panic button",
	},
];

const activity = [
	{
		icon: "bi-arrow-down-left",
		tone: "green" as const,
		title: "Incoming from Business Acc",
		meta: "Today, 14:22 · Transaction Hub",
		amt: "+KES 240,000",
	},
	{
		icon: "bi-link-45deg",
		tone: "blue" as const,
		title: "Developer Acc linked",
		meta: "20 Aug 2024 · One-Way In",
		amt: "",
	},
	{
		icon: "bi-arrow-up-right",
		tone: "red" as const,
		title: "Relocated to Savings Acc",
		meta: "Yesterday · Relocation wizard",
		amt: "−KES 50,000",
	},
	{
		icon: "bi-shield-check",
		tone: "violet" as const,
		title: "Consent suite renewed",
		meta: "16 Jan 2023 · 9 / 9 signed",
		amt: "",
	},
	{
		icon: "bi-credit-card-2-front",
		tone: "amber" as const,
		title: "Cards Center activated",
		meta: "Today, 11:05 · Virtual card issued",
		amt: "",
	},
];

const COMMANDS = [
	{
		id: "activateDashboardModal",
		label: "Activate dashboard",
		desc: "Consent + PIN wizard",
		icon: "bi-stars",
		group: "Actions",
	},
	{
		id: "linkAccountModal",
		label: "Link account",
		desc: "Connect a dashboard account",
		icon: "bi-link-45deg",
		group: "Actions",
	},
	{
		id: "activeLinksModal",
		label: "Manage links",
		desc: "Permissions, flow, unlink",
		icon: "bi-layout-three-columns",
		group: "Actions",
	},
	{
		id: "moneyRelocationModal",
		label: "Relocate funds",
		desc: "8-step fund movement",
		icon: "bi-arrow-left-right",
		group: "Money",
	},
	{
		id: "linkPermissionsModal",
		label: "Permissions",
		desc: "Presets and granular controls",
		icon: "bi-sliders",
		group: "Controls",
	},
	{
		id: "linkNotificationsModal",
		label: "Alert routing",
		desc: "Channels and quiet hours",
		icon: "bi-bell",
		group: "Controls",
	},
	{
		id: "linkLimitsModal",
		label: "Limits",
		desc: "Daily / monthly caps",
		icon: "bi-speedometer2",
		group: "Controls",
	},
	{
		id: "revokeAllAccessModal",
		label: "Revoke all access",
		desc: "Emergency panic button",
		icon: "bi-shield-exclamation",
		group: "Security",
	},
	{
		id: "privacyModal",
		label: "Privacy",
		desc: "Data consent and visibility",
		icon: "bi-shield-check",
		group: "Security",
	},
	{
		id: "tourGuideModal",
		label: "Replay tour",
		desc: "8-step walkthrough",
		icon: "bi-signpost-2",
		group: "Help",
	},
	{
		id: "supportHelpModal",
		label: "Support",
		desc: "Guides, FAQ, live chat",
		icon: "bi-headset",
		group: "Help",
	},
	{
		id: "go:transactions",
		label: "Transaction Hub",
		desc: "/pm/app/transfer-overview",
		icon: "bi-box-arrow-in-right",
		group: "Navigate",
	},
	{
		id: "go:cards",
		label: "Cards Center",
		desc: "/cards/app",
		icon: "bi-credit-card-2-front",
		group: "Navigate",
	},
	{
		id: "go:utility",
		label: "Utilities Hub",
		desc: "/utility",
		icon: "bi-lightning-charge",
		group: "Navigate",
	},
];

type TabId = "overview" | "dashboards" | "flow" | "manage";
type DashFilter = "all" | DashStatus;

const STATUS_LABEL: Record<DashStatus, string> = {
	Active: "Active",
	Pending: "Pending",
	Off: "Not activated",
	Suspended: "Suspended",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WalletActivation() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [tab, setTab] = useState<TabId>("overview");
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [paletteQ, setPaletteQ] = useState("");
	const [journeyOpen, setJourneyOpen] = useState(false);
	const [preview, setPreview] = useState<Dashboard | null>(null);
	const [dashFilter, setDashFilter] = useState<DashFilter>("all");
	const searchRef = useRef<HTMLInputElement | null>(null);

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
			go(route);
			return;
		}
		setModalState((prev) => ({ ...prev, [id]: true }));
	};
	const closeModal = (id: string) =>
		setModalState((prev) => ({ ...prev, [id]: false }));

	const handleDrawerAction = (modal: string) => {
		if (modal) openModal(modal);
	};

	const journeyTone: Record<
		"done" | "current" | "pending",
		{ iconBg: string; iconColor: string; modal: string; actionLabel: string }
	> = {
		done: {
			iconBg: "var(--success-bg)",
			iconColor: "var(--success)",
			modal: "tourGuideModal",
			actionLabel: "Replay",
		},
		current: {
			iconBg: "var(--info-bg)",
			iconColor: "var(--info)",
			modal: "activeLinksModal",
			actionLabel: "View",
		},
		pending: {
			iconBg: "var(--warning-bg)",
			iconColor: "var(--warning)",
			modal: "activateDashboardModal",
			actionLabel: "Activate",
		},
	};

	const drawerAttention = journeySteps.map((step): DrawerAttentionItem => {
		const tone = journeyTone[step.state];
		return {
			icon: step.icon.replace(/^bi-/, ""),
			iconBg: tone.iconBg,
			iconColor: tone.iconColor,
			title: step.title,
			sub: `${step.meta} · ${step.date}`,
			actionLabel: tone.actionLabel,
			modal: tone.modal,
		};
	});
	const drawerSuggestions = activity.map(
		(item): DrawerAttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: "var(--surface-2)",
			iconColor: "var(--ink-700)",
			title: item.title,
			sub: item.meta,
			actionLabel: "Open",
			modal: "activeLinksModal",
		}),
	);
	const drawerQuickActions = primaryActions.map(
		(action): QuickActionItem => ({
			icon: action.icon.replace(/^bi-/, ""),
			iconColor: "var(--pri)",
			label: action.label,
			modal: action.modal,
		}),
	);

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

	useEffect(() => {
		if (paletteOpen) {
			setPaletteQ("");
			window.setTimeout(() => searchRef.current?.focus(), 40);
		}
	}, [paletteOpen]);

	const copyAccount = async () => {
		try {
			await navigator.clipboard.writeText(wallet.accountNumber);
		} catch {
			/* clipboard unavailable */
		}
		toast.success("Copied", wallet.accountNumber);
	};

	const activeCount = dashboards.filter((d) => d.status === "Active").length;
	const pendingCount = dashboards.filter(
		(d) => d.status === "Pending" || d.status === "Off",
	).length;
	const linkedActive = activeLinks.filter((l) => l.status === "Active").length;

	const filteredDash = useMemo(
		() =>
			dashFilter === "all"
				? dashboards
				: dashboards.filter((d) => d.status === dashFilter),
		[dashFilter],
	);

	const paletteList = useMemo(() => {
		const t = paletteQ.trim().toLowerCase();
		if (!t) return COMMANDS;
		return COMMANDS.filter(
			(c) =>
				c.label.toLowerCase().includes(t) ||
				c.desc.toLowerCase().includes(t) ||
				c.group.toLowerCase().includes(t),
		);
	}, [paletteQ]);

	const paletteGroups = Array.from(new Set(paletteList.map((c) => c.group)));

	const runCommand = (id: string) => {
		setPaletteOpen(false);
		openModal(id);
	};

	const openDash = (d: Dashboard) => {
		if (d.route) {
			toast.success(`Opening ${d.name}`, d.route);
			window.setTimeout(() => go(d.route as string), 400);
			return;
		}
		if (d.modal) openModal(d.modal);
	};

	return (
		<AuthPage>
			<div className={styles.waTokens}>
				<AuthConsole
					crumb="Wallet activation"
					actions={
						<>
							<div style={{ position: "relative", minWidth: 220 }}>
								<Input
									placeholder="Search actions…"
									readOnly
									onFocus={() => setPaletteOpen(true)}
									onClick={() => setPaletteOpen(true)}
								/>
								<span
									className={s.kbd}
									style={{
										position: "absolute",
										right: 8,
										top: 9,
										pointerEvents: "none",
									}}
								>
									⌘K
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								icon="bi-question-circle"
								onClick={() => openModal("supportHelpModal")}
							>
								Help
							</Button>
						</>
					}
				>
					<Hero
						zone="WALLET"
						title="Activate your PayMo surfaces."
						copy={`${wallet.holder} · ${wallet.tier} KYC · ${wallet.accountNumber}`}
						chips={
							<>
								<Badge tone="onDark">{activeCount}/8 live</Badge>
								<Badge tone="onDark">{linkedActive} links</Badge>
							</>
						}
						stats={[
							{ value: wallet.balance, label: "Primary" },
							{
								value: String(pendingCount),
								label: "Pending",
								warn: pendingCount > 0,
							},
							{ value: "9/9", label: "Consents" },
						]}
						actions={
							<>
								<Button
									size="sm"
									icon="bi-stars"
									onClick={() => openModal("activateDashboardModal")}
								>
									Activate
								</Button>
								<Button
									size="sm"
									variant="dark"
									icon="bi-link-45deg"
									onClick={() => openModal("linkAccountModal")}
								>
									Link
								</Button>
							</>
						}
					/>

					<div className={s.spread}>
						<SegTabs
							items={[
								{ id: "overview", label: "Overview", icon: "bi-grid-1x2" },
								{
									id: "dashboards",
									label: "Dashboards",
									icon: "bi-grid-3x3-gap",
									dot: pendingCount > 0,
								},
								{ id: "flow", label: "Live flow", icon: "bi-diagram-3" },
								{ id: "manage", label: "Manage", icon: "bi-shield-lock" },
							]}
							value={tab}
							onChange={setTab}
						/>
						<Button
							size="sm"
							variant="ghost"
							icon="bi-clipboard"
							onClick={copyAccount}
						>
							{wallet.accountNumber}
						</Button>
					</div>

					{tab === "overview" && (
						<div className={s.stackLoose}>
							<div
								className={s.grid}
								style={{ ["--au-min" as string]: "220px" }}
							>
								{primaryActions.map((a) => (
									<Card
										key={a.modal}
										hover
										icon={a.icon}
										tone={a.tone}
										title={a.label}
										sub={a.sub}
										onClick={() => openModal(a.modal)}
									/>
								))}
							</div>

							<div
								className={s.grid}
								style={{ ["--au-min" as string]: "280px" }}
							>
								<Card
									title="Journey"
									sub="Onboarding through live wallet."
									icon="bi-signpost-2"
									tone="green"
									actions={
										<Button
											size="sm"
											variant="subtle"
											onClick={() => setJourneyOpen(true)}
										>
											Details
										</Button>
									}
								>
									<div className={s.stackTight}>
										{journeySteps.slice(-3).map((step) => (
											<div className={s.listRow} key={step.title}>
												<span
													className={cx(
														s.tile,
														s.tileSm,
														step.state === "done"
															? s.tileGreen
															: step.state === "current"
																? s.tileBlue
																: s.tileAmber,
													)}
												>
													<i className={`bi ${step.icon}`} />
												</span>
												<span className={s.grow}>
													<span className={s.optionTitle}>{step.title}</span>
													<span
														className={s.optionSub}
														style={{ display: "block" }}
													>
														{step.meta}
													</span>
												</span>
												<Badge
													tone={
														step.state === "done"
															? "green"
															: step.state === "current"
																? "blue"
																: "amber"
													}
												>
													{step.state === "done"
														? "Done"
														: step.state === "current"
															? "Live"
															: "Next"}
												</Badge>
											</div>
										))}
									</div>
								</Card>

								<Card
									title="Recent activity"
									sub="Last five events on this wallet."
									icon="bi-clock-history"
									tone="slate"
									actions={
										<Button
											size="sm"
											variant="subtle"
											onClick={() => openModal("activeLinksModal")}
										>
											Links
										</Button>
									}
								>
									<div className={s.stackTight}>
										{activity.slice(0, 3).map((row) => (
											<div className={s.listRow} key={row.title}>
												<span
													className={cx(
														s.tile,
														s.tileSm,
														s[
															`tile${row.tone[0].toUpperCase()}${row.tone.slice(1)}`
														],
													)}
												>
													<i className={`bi ${row.icon}`} />
												</span>
												<span className={s.grow}>
													<span className={s.optionTitle}>{row.title}</span>
													<span
														className={s.optionSub}
														style={{ display: "block" }}
													>
														{row.meta}
													</span>
												</span>
												{row.amt && (
													<span className={s.strong} style={{ fontSize: 12 }}>
														{row.amt}
													</span>
												)}
											</div>
										))}
									</div>
								</Card>
							</div>
						</div>
					)}

					{tab === "dashboards" && (
						<div className={s.stackLoose}>
							<div className={cx(s.row, s.rowTight)}>
								{(
									[
										["all", "All"],
										["Active", "Active"],
										["Pending", "Pending"],
										["Off", "Off"],
										["Suspended", "Suspended"],
									] as Array<[DashFilter, string]>
								).map(([id, label]) => (
									<Chip
										key={id}
										on={dashFilter === id}
										onClick={() => setDashFilter(id)}
									>
										{label}
									</Chip>
								))}
							</div>

							{filteredDash.length === 0 ? (
								<Card>
									<EmptyState
										icon="bi-search"
										title="No dashboards match"
										text="Clear the filter to see every surface."
										action={
											<Button
												icon="bi-arrow-counterclockwise"
												onClick={() => setDashFilter("all")}
											>
												Reset
											</Button>
										}
									/>
								</Card>
							) : (
								<div
									className={s.grid}
									style={{ ["--au-min" as string]: "300px" }}
								>
									{filteredDash.map((d) => (
										<Card key={d.id} hover>
											<div className={s.cardHead}>
												<span
													className={s.tile}
													style={{
														background: `linear-gradient(135deg, ${d.c1}, ${d.c2})`,
														color: "#fff",
													}}
												>
													<i className={`bi ${d.icon}`} />
												</span>
												<div className={s.grow}>
													<div className={s.cardTitle}>{d.name}</div>
													<p className={s.cardSub}>{d.desc}</p>
												</div>
												<Badge tone={d.badgeTone}>
													{STATUS_LABEL[d.status]}
												</Badge>
											</div>
											<div
												className={s.row}
												style={{ marginBottom: "0.75rem" }}
											>
												{d.metrics.map(([v, l]) => (
													<span className={s.metaChip} key={l}>
														<b>{v}</b> {l}
													</span>
												))}
											</div>
											<div className={s.spread}>
												<Button
													size="sm"
													variant="subtle"
													icon="bi-eye"
													onClick={() => setPreview(d)}
												>
													Preview
												</Button>
												<div className={cx(s.row, s.rowTight)}>
													{d.status === "Active" && (
														<Button
															size="sm"
															variant="ghost"
															icon="bi-sliders"
															aria-label="Permissions"
															onClick={() => openModal("linkPermissionsModal")}
														/>
													)}
													<Button
														size="sm"
														variant={
															d.status === "Suspended" ? "danger" : "primary"
														}
														icon={
															d.status === "Active"
																? "bi-box-arrow-up-right"
																: d.status === "Suspended"
																	? "bi-x-octagon"
																	: "bi-stars"
														}
														onClick={() => openDash(d)}
													>
														{d.status === "Active"
															? "Open"
															: d.status === "Suspended"
																? "Revoke"
																: "Activate"}
													</Button>
												</div>
											</div>
										</Card>
									))}
								</div>
							)}
						</div>
					)}

					{tab === "flow" && (
						<div className={s.stackLoose}>
							<Notice tone="slate" icon="bi-diagram-3">
								Fund paths between the primary wallet and {activeLinks.length}{" "}
								linked accounts. Unlink or relink from a lane.
							</Notice>
							<AccountFlowChart links={activeLinks} openModal={openModal} />
						</div>
					)}

					{tab === "manage" && (
						<div className={s.stackLoose}>
							<div
								className={s.grid}
								style={{ ["--au-min" as string]: "240px" }}
							>
								{manageItems.map((item) => (
									<Card
										key={item.modal}
										hover
										icon={item.icon}
										tone={item.tone}
										title={item.label}
										sub={item.sub}
										onClick={() => openModal(item.modal)}
									/>
								))}
							</div>
							<div
								className={s.grid}
								style={{ ["--au-min" as string]: "240px" }}
							>
								<Card
									hover
									icon="bi-receipt"
									tone="slate"
									title="Sample receipt"
									sub="Last relocation proof"
									onClick={() => openModal("relocationReceiptModal")}
								/>
								<Card
									hover
									icon="bi-check2-circle"
									tone="green"
									title="Activation proof"
									sub="Certificate for this wallet"
									onClick={() => openModal("activationSuccessModal")}
								/>
							</div>
						</div>
					)}
				</AuthConsole>

				<Modal
					open={paletteOpen}
					onClose={() => setPaletteOpen(false)}
					title="Command palette"
					sub="Jump to any activation action."
					icon="bi-search"
					size="lg"
				>
					<div className={s.stack}>
						<Input
							ref={searchRef}
							placeholder="Activate, link, relocate…"
							value={paletteQ}
							onChange={(e) => setPaletteQ(e.target.value)}
						/>
						{paletteList.length === 0 ? (
							<EmptyState
								icon="bi-search"
								title="No matches"
								text={`Nothing for “${paletteQ}”.`}
							/>
						) : (
							paletteGroups.map((g) => (
								<div className={s.stackTight} key={g}>
									<div className={s.tiny} style={{ fontWeight: 700 }}>
										{g}
									</div>
									{paletteList
										.filter((c) => c.group === g)
										.map((c) => (
											<button
												type="button"
												key={c.id}
												className={s.listRow}
												style={{
													width: "100%",
													textAlign: "left",
													cursor: "pointer",
													fontFamily: "inherit",
												}}
												onClick={() => runCommand(c.id)}
											>
												<span className={cx(s.tile, s.tileSm, s.tileSlate)}>
													<i className={`bi ${c.icon}`} />
												</span>
												<span className={s.grow}>
													<span className={s.optionTitle}>{c.label}</span>
													<span
														className={s.optionSub}
														style={{ display: "block" }}
													>
														{c.desc}
													</span>
												</span>
												<i
													className="bi bi-chevron-right"
													style={{ color: "#98a2b3" }}
												/>
											</button>
										))}
								</div>
							))
						)}
					</div>
				</Modal>

				<Modal
					open={journeyOpen}
					onClose={() => setJourneyOpen(false)}
					title="Activation journey"
					sub="From onboarding to live wallet."
					icon="bi-signpost-2"
					footer={
						<>
							<Button variant="ghost" onClick={() => setJourneyOpen(false)}>
								Close
							</Button>
							<Button
								icon="bi-play-circle"
								onClick={() => {
									setJourneyOpen(false);
									openModal("tourGuideModal");
								}}
							>
								Replay tour
							</Button>
						</>
					}
				>
					<div className={s.stack}>
						{journeySteps.map((step) => (
							<div className={s.listRow} key={step.title}>
								<span
									className={cx(
										s.tile,
										s.tileSm,
										step.state === "done"
											? s.tileGreen
											: step.state === "current"
												? s.tileBlue
												: s.tileAmber,
									)}
								>
									<i className={`bi ${step.icon}`} />
								</span>
								<span className={s.grow}>
									<span className={s.optionTitle}>{step.title}</span>
									<span className={s.optionSub} style={{ display: "block" }}>
										{step.meta} · {step.date}
									</span>
								</span>
								<Badge
									tone={
										step.state === "done"
											? "green"
											: step.state === "current"
												? "blue"
												: "amber"
									}
								>
									{step.state === "done"
										? "Done"
										: step.state === "current"
											? "Live"
											: "Next"}
								</Badge>
							</div>
						))}
					</div>
				</Modal>

				<Modal
					open={!!preview}
					onClose={() => setPreview(null)}
					title={preview?.name ?? ""}
					sub={preview?.desc}
					icon={preview?.icon}
					footer={
						<>
							<Button variant="ghost" onClick={() => setPreview(null)}>
								Close
							</Button>
							{preview && (
								<Button
									icon="bi-box-arrow-up-right"
									onClick={() => {
										const d = preview;
										setPreview(null);
										openDash(d);
									}}
								>
									{preview.status === "Active" ? "Open" : "Continue"}
								</Button>
							)}
						</>
					}
				>
					<div className={s.stack}>
						<div className={s.row}>
							{preview?.metrics.map(([v, l]) => (
								<span className={s.metaChip} key={l}>
									<b>{v}</b> {l}
								</span>
							))}
						</div>
						<Notice tone="slate" icon="bi-clock-history">
							Last touch: {preview?.last}
						</Notice>
					</div>
				</Modal>

				<AttentionHubFab
					onClick={() => setDrawerOpen(true)}
					count={pendingCount}
					label="Action centre"
				/>

				<AttentionDrawer
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					onAction={handleDrawerAction}
					pageName="Wallet activation"
					pageIcon="bi-wallet2"
					attention={drawerAttention}
					suggestions={drawerSuggestions}
					quickActions={drawerQuickActions}
					description="Journey steps, recent events and the four primary actions."
				/>

				<WalletActivationModals
					modalState={modalState}
					openModal={openModal}
					closeModal={closeModal}
				/>
			</div>
		</AuthPage>
	);
}
