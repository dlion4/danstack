"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import AttentionHubFab from "../../shared/components/AttentionHubFab";
import type {
	AttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import KraGovernmentModals from "../components/KraGovernmentModals";
import styles from "../styles/kraGovernment.module.css";

/* ============================================================================
   PayMo BaaS — KRA & Government Integration
   Business-dashboard design language (navy/emerald, Sora + Inter, 16px cards).
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

interface SrItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	actionTone?: "btnPmD";
	modal: string;
}

interface QuickAction {
	icon: string;
	label: string;
	color: string;
	modal: string;
}

interface TableCol {
	key: string;
	label: string;
}

interface CellAction {
	label: string;
	modal: string;
	tone?: "btnPmD" | "btnPmP";
}

type Cell =
	| string
	| { badge: string; tone: BadgeTone }
	| { actions: CellAction[] };

interface GovService {
	icon: string;
	iconBg: string;
	iconColor: string;
	provider: string;
	title: string;
	sub: string;
	price: string;
	actionLabel: string;
	modal: string;
}

interface KraConfig {
	hero: {
		live: string;
		value: string;
		detail: string;
	};
	entities: { key: string; label: string; pin: string }[];
	kpis: {
		label: string;
		value: string;
		icon: string;
		iconCls: string;
		sub: string;
		tone: BadgeTone;
	}[];
	obligations: { label: string; n: number; pct: string; c: string }[];
	attention: SrItem[];
	suggestions: SrItem[];
	quickActions: QuickAction[];
	kraPins: { cols: TableCol[]; rows: Cell[][] };
	taxPosition: {
		label: string;
		value: string;
		valueColor?: string;
		badge?: { text: string; tone: BadgeTone };
		small?: boolean;
	}[];
	itaxActivity: { cols: TableCol[]; rows: Cell[][] };
	clientPins: { cols: TableCol[]; rows: Cell[][] };
	payMethods: {
		title: string;
		sub: string;
		badge?: { text: string; tone: BadgeTone };
		actionLabel?: string;
	}[];
	scheduled: { title: string; sub: string; status: string; tone: BadgeTone }[];
	govServices: GovService[];
	govActivity: { cols: TableCol[]; rows: Cell[][] };
	activity: { cols: TableCol[]; rows: Cell[][] };
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: KraConfig = {
	hero: {
		live: "KRA integration live",
		value: "4 KRA PINs linked",
		detail:
			"Personal, business, rental portfolio and investment company obligations managed with real-time iTax sync.",
	},
	entities: [
		{ key: "all", label: "All PINs", pin: "" },
		{ key: "personal", label: "Personal", pin: "A012345678Y" },
		{ key: "holdings", label: "JK Holdings", pin: "P987654321Z" },
		{ key: "rental", label: "Rental Portfolio", pin: "R445566778X" },
		{ key: "investments", label: "JK Investments", pin: "C112233445W" },
	],
	kpis: [
		{
			label: "Due in 7 days",
			value: "KES 184,200",
			icon: "bi-clock",
			iconCls: styles.kpiIconRed,
			sub: "5 obligations · PAYE, VAT, TOT",
			tone: "badgeD",
		},
		{
			label: "Compliance score",
			value: "94",
			icon: "bi-shield-check",
			iconCls: styles.kpiIconGreen,
			sub: "Excellent · 18 months clean",
			tone: "badgeS",
		},
		{
			label: "Savings this year",
			value: "KES 47,800",
			icon: "bi-piggy-bank",
			iconCls: styles.kpiIconGreen,
			sub: "Early filing + reliefs",
			tone: "badgeS",
		},
		{
			label: "Open obligations",
			value: "12",
			icon: "bi-list-check",
			iconCls: styles.kpiIconBlue,
			sub: "Synced from iTax",
			tone: "badgeI",
		},
		{
			label: "Penalties (18m)",
			value: "0",
			icon: "bi-patch-check",
			iconCls: styles.kpiIconSlate,
			sub: "Zero late filings",
			tone: "badgeS",
		},
		{
			label: "Avg filing lead",
			value: "6 days",
			icon: "bi-hourglass-split",
			iconCls: styles.kpiIconPurple,
			sub: "Before deadline",
			tone: "badgeI",
		},
	],
	obligations: [
		{ label: "Filed", n: 7, pct: "58%", c: "var(--pm-accent)" },
		{ label: "Due soon", n: 3, pct: "25%", c: "var(--pm-warning)" },
		{ label: "Overdue", n: 2, pct: "17%", c: "var(--pm-danger)" },
	],
	attention: [
		{
			icon: "bi-receipt-cutoff",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "VAT return due in 2 days",
			sub: "KRA PIN P987654321Z · KES 84,200",
			actionLabel: "File",
			actionTone: "btnPmD",
			modal: "fileReturnModal",
		},
		{
			icon: "bi-bank",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "CGT on property sale pending",
			sub: "KES 62,000 due 15 Jul",
			actionLabel: "Pay",
			modal: "payKRAModal",
		},
		{
			icon: "bi-globe",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Passport renewal ready to pay",
			sub: "P-449281 · KES 4,500",
			actionLabel: "Pay",
			modal: "payECitizenModal",
		},
	],
	suggestions: [
		{
			icon: "bi-calendar-check",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "File PAYE early for 5-day relief",
			sub: "Save KES 8,400 in penalties",
			actionLabel: "File Early",
			modal: "fileReturnModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Claim additional rental income relief",
			sub: "KES 124,000 unclaimed",
			actionLabel: "Claim",
			modal: "taxOptimizerModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Sync iTax for new obligations",
			sub: "Last sync 27 Jun 09:14",
			actionLabel: "Sync",
			modal: "syncItaxModal",
		},
	],
	quickActions: [
		{
			icon: "bi-receipt-cutoff",
			label: "Pay Tax",
			color: "var(--pm-danger)",
			modal: "payKRAModal",
		},
		{
			icon: "bi-file-earmark-text",
			label: "File Return",
			color: "var(--pm-primary-light)",
			modal: "fileReturnModal",
		},
		{
			icon: "bi-person-badge",
			label: "Link KRA PIN",
			color: "var(--pm-info)",
			modal: "addKRAModal",
		},
		{
			icon: "bi-collection",
			label: "Bulk File",
			color: "var(--pm-purple)",
			modal: "bulkTaxModal",
		},
		{
			icon: "bi-lightbulb",
			label: "Optimizer",
			color: "var(--pm-accent)",
			modal: "taxOptimizerModal",
		},
		{
			icon: "bi-heart-pulse",
			label: "Health Check",
			color: "var(--pm-primary-light)",
			modal: "complianceHealthModal",
		},
		{
			icon: "bi-calendar-event",
			label: "Schedule",
			color: "var(--pm-info)",
			modal: "scheduleTaxModal",
		},
		{
			icon: "bi-download",
			label: "Tax History",
			color: "var(--pm-muted)",
			modal: "taxHistoryModal",
		},
	],
	kraPins: {
		cols: [
			{ key: "pin", label: "PIN" },
			{ key: "entity", label: "Entity" },
			{ key: "status", label: "Status" },
			{ key: "due", label: "Next Due" },
			{ key: "amount", label: "Amount" },
			{ key: "actions", label: "Actions" },
		],
		rows: [
			[
				"C:A012345678Y",
				"James Kamau (Personal)",
				{ badge: "Compliant", tone: "badgeS" },
				"15 Jul — PAYE",
				"KES 42,800",
				{
					actions: [
						{ label: "Pay", modal: "payKRAModal" },
						{ label: "File", modal: "fileReturnModal" },
					],
				},
			],
			[
				"C:P987654321Z",
				"JK Holdings Ltd",
				{ badge: "Due Soon", tone: "badgeW" },
				"05 Jul — VAT",
				"KES 84,200",
				{
					actions: [
						{ label: "File", modal: "fileReturnModal", tone: "btnPmD" },
						{ label: "Pay", modal: "payKRAModal" },
					],
				},
			],
			[
				"C:R445566778X",
				"Rental Portfolio",
				{ badge: "Compliant", tone: "badgeS" },
				"20 Jul — TOT",
				"KES 18,600",
				{
					actions: [
						{ label: "Pay", modal: "payKRAModal" },
						{ label: "File", modal: "fileReturnModal" },
					],
				},
			],
			[
				"C:C112233445W",
				"JK Investments",
				{ badge: "Overdue", tone: "badgeD" },
				"25 Jun — CGT",
				"KES 62,000",
				{
					actions: [
						{ label: "Pay", modal: "payKRAModal", tone: "btnPmD" },
						{ label: "Dispute", modal: "disputeKRAModal" },
					],
				},
			],
		],
	},
	taxPosition: [
		{
			label: "Total Outstanding",
			value: "KES 184,200",
			valueColor: "var(--pm-danger)",
		},
		{
			label: "Refunds Due",
			value: "KES 31,450",
			valueColor: "var(--pm-accent)",
		},
		{
			label: "Compliance Score",
			value: "",
			badge: { text: "94/100", tone: "badgeS" },
		},
		{ label: "Last iTax Sync", value: "27 Jun 2025, 09:14", small: true },
	],
	itaxActivity: {
		cols: [
			{ key: "date", label: "Date" },
			{ key: "pin", label: "PIN" },
			{ key: "type", label: "Type" },
			{ key: "amount", label: "Amount" },
			{ key: "status", label: "Status" },
			{ key: "ref", label: "Ref" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"25 Jun",
				"A012345678Y",
				"PAYE",
				"KES 42,800",
				{ badge: "Paid", tone: "badgeS" },
				"C:ITX-882341",
				{ actions: [{ label: "Receipt", modal: "taxReceiptModal" }] },
			],
			[
				"22 Jun",
				"P987654321Z",
				"VAT",
				"KES 84,200",
				{ badge: "Filed", tone: "badgeW" },
				"C:ITX-881902",
				{ actions: [{ label: "View", modal: "fileReturnModal" }] },
			],
			[
				"18 Jun",
				"C112233445W",
				"CGT",
				"KES 62,000",
				{ badge: "Overdue", tone: "badgeD" },
				"C:ITX-880117",
				{
					actions: [{ label: "Pay", modal: "payKRAModal", tone: "btnPmD" }],
				},
			],
		],
	},
	clientPins: {
		cols: [
			{ key: "entity", label: "Client / Entity" },
			{ key: "country", label: "Country" },
			{ key: "authority", label: "Authority" },
			{ key: "pin", label: "PIN / TIN" },
			{ key: "format", label: "Format" },
			{ key: "status", label: "Status" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"James Kamau (Personal)",
				"Kenya",
				"KRA",
				"C:A012345678Y",
				"Letter + 9 digits + letter",
				{ badge: "Compliant", tone: "badgeS" },
				{ actions: [{ label: "Manage", modal: "addKRAModal" }] },
			],
			[
				"JK Holdings Ltd",
				"Kenya",
				"KRA",
				"C:P987654321Z",
				"Letter + 9 digits + letter",
				{ badge: "Compliant", tone: "badgeS" },
				{ actions: [{ label: "Manage", modal: "addKRAModal" }] },
			],
			[
				"Grace Akinyi Traders",
				"Uganda",
				"URA TIN",
				"C:1234567890",
				"10 digits",
				{ badge: "Synced", tone: "badgeI" },
				{ actions: [{ label: "Manage", modal: "addKRAModal" }] },
			],
			[
				"Serengeti Coffee Exports",
				"Tanzania",
				"TRA TIN",
				"C:123-456-789",
				"9 digits (3-3-3)",
				{ badge: "Synced", tone: "badgeI" },
				{ actions: [{ label: "Manage", modal: "addKRAModal" }] },
			],
			[
				"Accra Imports Ltd",
				"Ghana",
				"GRA TIN",
				"C:C0001234567890",
				"Letter + 12 digits",
				{ badge: "Synced", tone: "badgeI" },
				{ actions: [{ label: "Manage", modal: "addKRAModal" }] },
			],
			[
				"Lagos Retail Co.",
				"Nigeria",
				"FIRS TIN",
				"C:1234567-001",
				"8 digits + 4 digits",
				{ badge: "Needs Attention", tone: "badgeW" },
				{ actions: [{ label: "Manage", modal: "addKRAModal" }] },
			],
		],
	},
	payMethods: [
		{
			title: "PayMo Wallet",
			sub: "Balance: KES 124,500",
			badge: { text: "Default", tone: "badgeS" },
		},
		{ title: "M-Pesa", sub: "0712***890", actionLabel: "Use" },
		{ title: "Equity Bank", sub: "Acc ***4521", actionLabel: "Use" },
		{ title: "KCB Bank", sub: "Acc ***7782", actionLabel: "Use" },
	],
	scheduled: [
		{
			title: "PAYE — Personal",
			sub: "Monthly · 15th · Auto from Wallet",
			status: "Active",
			tone: "badgeS",
		},
		{
			title: "VAT — JK Holdings",
			sub: "Monthly · 5th · M-Pesa",
			status: "Active",
			tone: "badgeS",
		},
		{
			title: "TOT — Rental Portfolio",
			sub: "Quarterly · Next: 20 Jul",
			status: "Paused",
			tone: "badgeW",
		},
	],
	govServices: [
		{
			icon: "bi-globe",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			provider: "eCitizen",
			title: "National Government Services",
			sub: "Passports, licences, certificates & registration",
			price: "From KES 1,000",
			actionLabel: "Pay Service",
			modal: "payECitizenModal",
		},
		{
			icon: "bi-building",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			provider: "County",
			title: "County Revenue Services",
			sub: "Business permits, land rates & health certificates",
			price: "From KES 4,200",
			actionLabel: "Pay County",
			modal: "payCountyModal",
		},
		{
			icon: "bi-map",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			provider: "Ardhisasa",
			title: "Land Services",
			sub: "Title deeds, stamp duty, leases & change of user",
			price: "From KES 15,200",
			actionLabel: "Pay Ardhisasa",
			modal: "payArdhisasaModal",
		},
	],
	govActivity: {
		cols: [
			{ key: "date", label: "Date" },
			{ key: "service", label: "Service" },
			{ key: "provider", label: "Provider" },
			{ key: "amount", label: "Amount" },
			{ key: "status", label: "Status" },
			{ key: "ref", label: "Ref" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"18 Jun",
				"Passport Renewal",
				"eCitizen",
				"KES 4,500",
				{ badge: "Processing", tone: "badgeI" },
				"C:P-449281",
				{ actions: [{ label: "Track", modal: "trackGovModal" }] },
			],
			[
				"15 Jun",
				"Land Rates",
				"Nairobi County",
				"KES 42,300",
				{ badge: "Paid", tone: "badgeS" },
				"C:CCN-772910",
				{ actions: [{ label: "Receipt", modal: "govReceiptModal" }] },
			],
			[
				"10 Jun",
				"Title Deed Search",
				"Ardhisasa",
				"KES 1,200",
				{ badge: "Paid", tone: "badgeS" },
				"C:ARD-119204",
				{ actions: [{ label: "Receipt", modal: "govReceiptModal" }] },
			],
		],
	},
	activity: {
		cols: [
			{ key: "date", label: "Date" },
			{ key: "service", label: "Service" },
			{ key: "provider", label: "Provider" },
			{ key: "amount", label: "Amount" },
			{ key: "method", label: "Method" },
			{ key: "status", label: "Status" },
			{ key: "ref", label: "Ref" },
			{ key: "action", label: "Action" },
		],
		rows: [
			[
				"25 Jun",
				"PAYE",
				"KRA",
				"KES 42,800",
				"M-Pesa",
				{ badge: "Success", tone: "badgeS" },
				"C:ITX-882341",
				{ actions: [{ label: "Receipt", modal: "taxReceiptModal" }] },
			],
			[
				"22 Jun",
				"VAT Return",
				"KRA",
				"KES 84,200",
				"Wallet",
				{ badge: "Filed", tone: "badgeS" },
				"C:ITX-881902",
				{ actions: [{ label: "View", modal: "fileReturnModal" }] },
			],
			[
				"20 Jun",
				"Rental Income Tax (TOT)",
				"KRA",
				"KES 18,600",
				"Wallet",
				{ badge: "Paid", tone: "badgeS" },
				"C:ITX-882102",
				{ actions: [{ label: "Receipt", modal: "taxReceiptModal" }] },
			],
			[
				"15 Jun",
				"Capital Gains Tax",
				"KRA",
				"KES 62,000",
				"M-Pesa",
				{ badge: "Overdue", tone: "badgeD" },
				"C:ITX-880117",
				{ actions: [{ label: "Pay", modal: "payKRAModal" }] },
			],
		],
	},
};

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchKra(): Promise<KraConfig> {
	const res = await fetch("/api/kra-government", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
	return (await res.json()) as KraConfig;
}

/* ---------- cell renderer for data tables ---------- */
const TONES: Record<string, string> = {
	s: styles.badgeS,
	w: styles.badgeW,
	d: styles.badgeD,
	i: styles.badgeI,
	p: styles.badgeP,
};

/* ---------- PIN / TIN format validation per country ---------- */
const PIN_PATTERNS: Record<string, RegExp> = {
	Kenya: /^[A-Za-z]\d{9}[A-Za-z]$/,
	Uganda: /^\d{10}$/,
	Tanzania: /^\d{3}-\d{3}-\d{3}$/,
	Ghana: /^[A-Za-z]\d{12}$/,
	Nigeria: /^\d{8}-\d{4}$/,
};

/** Validate a client PIN/TIN against its country's expected format. */
function validatePin(country: string, pin: string): boolean {
	const pattern = PIN_PATTERNS[country];
	return pattern ? pattern.test(pin.trim()) : true;
}

function CellValue({
	cell,
	onOpen,
}: {
	cell: Cell;
	onOpen: (id: string) => void;
}) {
	if (typeof cell === "string") {
		if (cell.startsWith("C:")) return <code>{cell.slice(2)}</code>;
		if (cell.startsWith("B:")) {
			const [, tone, text] = cell.split(":");
			return (
				<span className={`${styles.badge} ${TONES[tone] ?? styles.badgeS}`}>
					{text}
				</span>
			);
		}
		if (cell.startsWith("STR:")) return <strong>{cell.slice(4)}</strong>;
		return <>{cell}</>;
	}
	if ("badge" in cell)
		return (
			<span className={`${styles.badge} ${styles[cell.tone]}`}>
				{cell.badge}
			</span>
		);
	return (
		<div className="d-flex" style={{ gap: 4 }}>
			{cell.actions.map((a) => (
				<button
					type="button"
					key={a.label}
					className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ""}`}
					onClick={() => onOpen(a.modal)}
				>
					{a.label}
				</button>
			))}
		</div>
	);
}

/* ---------- numbered section heading (business-dashboard language) ---------- */
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

export default function KraGovernment() {
	const { data } = useQuery({
		queryKey: ["paymo-kra-government"],
		queryFn: fetchKra,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [entity, setEntity] = useState("all");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	const handleDrawerAction = (modal: string) => {
		if (modal) openM(modal);
	};

	const drawerAttention = config.attention.map(
		(item): AttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: item.iconBg,
			iconColor: item.iconColor,
			title: item.title,
			sub: item.sub,
			actionLabel: item.actionLabel,
			modal: item.modal,
		}),
	);
	const drawerSuggestions = config.suggestions.map(
		(item): AttentionItem => ({
			icon: item.icon.replace(/^bi-/, ""),
			iconBg: item.iconBg,
			iconColor: item.iconColor,
			title: item.title,
			sub: item.sub,
			actionLabel: item.actionLabel,
			modal: item.modal,
		}),
	);
	const drawerQuickActions = config.quickActions.map(
		(action): QuickActionItem => ({
			icon: action.icon.replace(/^bi-/, ""),
			iconColor: action.color,
			label: action.label,
			modal: action.modal,
		}),
	);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const modalId = params.get("modal");
		if (modalId) setActiveModal(modalId);
	}, []);

	const entityCfg = config.entities.find((e) => e.key === entity);
	const scopeNote =
		entity === "all"
			? "All KRA PINs in view"
			: `${entityCfg?.pin} · ${entityCfg?.label} in view`;

	const filteredPins = config.kraPins.rows.filter(
		(r) => entity === "all" || String(r[0]).includes(entityCfg?.pin ?? ""),
	);
	const filteredItax = config.itaxActivity.rows.filter(
		(r) => entity === "all" || r[1] === entityCfg?.pin,
	);
	const filteredScheduled = config.scheduled.filter(
		(s) =>
			entity === "all" ||
			s.title.toLowerCase().includes(entityCfg?.label.toLowerCase() ?? ""),
	);

	return (
		<div className={styles.kraGovernmentPage}>
			<div className={styles.main}>
				<header className={styles.heroBanner}>
					<div className={styles.heroOrbOne} aria-hidden="true" />
					<div className={styles.heroOrbTwo} aria-hidden="true" />
					<div className={styles.heroContent}>
						<div className={styles.heroCopy}>
							<div className={styles.heroEyebrow}>
								<span>
									<i className="bi bi-bank2" aria-hidden="true" /> KRA &amp;
									Government
								</span>
								<span className={styles.livePill}>
									<span className={styles.liveDot} aria-hidden="true" />{" "}
									{config.hero.live}
								</span>
							</div>
							<h1 id="kra-title">
								Every obligation filed, every tax paid, every PIN synced.
							</h1>
							<p>{config.hero.detail}</p>
							<div className={styles.heroActions}>
								<button
									type="button"
									className={styles.heroPrimaryBtn}
									onClick={() => openM("payKRAModal")}
								>
									<i className="bi bi-receipt-cutoff" aria-hidden="true" /> Pay
									Tax
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("fileReturnModal")}
								>
									<i className="bi bi-file-earmark-text" aria-hidden="true" />{" "}
									File Return
								</button>
								<button
									type="button"
									className={styles.heroSecondaryBtn}
									onClick={() => openM("complianceHealthModal")}
								>
									<i className="bi bi-heart-pulse" aria-hidden="true" /> Health
									Check
								</button>
							</div>
						</div>
						<aside
							className={styles.heroSnapshot}
							aria-label="Tax compliance snapshot"
						>
							<span>Linked identities</span>
							<strong>{config.hero.value}</strong>
							<p>{config.hero.detail}</p>
							<div className={styles.heroPinChips}>
								{config.kraPins.rows.map((r) => (
									<span className={styles.pinChip} key={String(r[0])}>
										<i className="bi bi-check-circle-fill" aria-hidden="true" />{" "}
										{String(r[0]).replace("C:", "")}
									</span>
								))}
							</div>
							<div className={styles.heroMeter}>
								<div className={styles.heroMeterHead}>
									<span>Obligations this month</span>
									<span>
										<strong>5</strong> · 65% met
									</span>
								</div>
								<div className={styles.heroMeterTrack} aria-hidden="true">
									{[0, 1, 2, 3, 4].map((i) => (
										<span
											key={i}
											className={`${styles.heroMeterSeg} ${i < 3 ? styles.heroMeterOn : ""}`}
										/>
									))}
								</div>
							</div>
							<div className={styles.heroMetricRow}>
								<div>
									<strong>KES 184.2k</strong>
									<span>Due in 7 days</span>
								</div>
								<div>
									<strong>94/100</strong>
									<span>Compliance score</span>
								</div>
								<div>
									<strong>KES 47.8k</strong>
									<span>Savings this year</span>
								</div>
							</div>
						</aside>
					</div>
				</header>

				<div className={styles.controlStrip}>
					<div className={styles.controlGroup}>
						<span className={styles.controlLabel}>
							<i className="bi bi-person-badge" aria-hidden="true" /> Entity
						</span>
						<div className={styles.filterPills}>
							{config.entities.map((e) => (
								<button
									type="button"
									key={e.key}
									className={entity === e.key ? styles.filterActive : ""}
									onClick={() => setEntity(e.key)}
								>
									{e.label}
								</button>
							))}
						</div>
					</div>
					<div className={styles.headerButtonRow}>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => openM("bulkTaxModal")}
						>
							<i className="bi bi-collection" aria-hidden="true" /> Bulk File
						</button>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
							onClick={() => openM("addKRAModal")}
						>
							<i className="bi bi-plus" aria-hidden="true" /> Link KRA PIN
						</button>
					</div>
					<span className={styles.scopeNote}>
						<i className="bi bi-funnel" aria-hidden="true" /> {scopeNote}
					</span>
				</div>

				<div className={styles.content}>
					<section
						className={styles.dashboardSection}
						aria-labelledby="kra-sec-pulse"
					>
						<SectionHeading
							index="1.1"
							id="kra-sec-pulse"
							title="Compliance pulse"
							description={`${scopeNote} — headline figures across linked tax identities.`}
						/>
						<div className={styles.kpiGrid}>
							{config.kpis.map((kpi) => (
								<div className={styles.kpiCard} key={kpi.label}>
									<div
										className={`${styles.kpiIcon} ${kpi.iconCls}`}
										aria-hidden="true"
									>
										<i className={`bi ${kpi.icon}`} />
									</div>
									<div
										style={{
											fontSize: "0.72rem",
											fontWeight: 600,
											color: "var(--pm-muted)",
											textTransform: "uppercase",
											letterSpacing: "0.06em",
										}}
									>
										{kpi.label}
									</div>
									<div className={styles.kpiValue}>{kpi.value}</div>
									<div className={styles.kpiMeta}>
										<span className={`${styles.badge} ${styles[kpi.tone]}`}>
											{kpi.sub}
										</span>
									</div>
								</div>
							))}
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="kra-sec-hub"
					>
						<SectionHeading
							index="1.3"
							id="kra-sec-hub"
							title="KRA iTax integration hub"
							description="Linked KRA PINs, obligations, real-time tax position and iTax activity across personal and business entities."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("addKRAModal")}
									>
										<i className="bi bi-plus" aria-hidden="true" /> Link PIN
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("syncItaxModal")}
									>
										<i className="bi bi-arrow-repeat" aria-hidden="true" /> Sync
										iTax
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-7">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-person-badge" aria-hidden="true" />{" "}
											Linked KRA PINs &amp; Obligations
										</h4>
										<div className={styles.tableWrap}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														{config.kraPins.cols.map((c) => (
															<th key={c.key}>{c.label}</th>
														))}
													</tr>
												</thead>
												<tbody>
													{filteredPins.map((row) => (
														<tr key={String(row[0])}>
															{row.map((cell) => (
																<td key={JSON.stringify(cell)}>
																	<CellValue cell={cell} onOpen={openM} />
																</td>
															))}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div className="col-lg-5">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-clipboard-data" aria-hidden="true" />{" "}
											Tax Position Snapshot
										</h4>
										{config.taxPosition.map((r) => (
											<div className={styles.sr} key={r.label}>
												<div>
													<strong>{r.label}</strong>
												</div>
												{r.badge ? (
													<span
														className={`${styles.badge} ${styles[r.badge.tone]}`}
													>
														{r.badge.text}
													</span>
												) : (
													<strong
														style={{
															color: r.valueColor,
															fontSize: r.small ? 12 : undefined,
														}}
													>
														{r.value}
													</strong>
												)}
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("syncItaxModal")}
										>
											<i className="bi bi-arrow-repeat" aria-hidden="true" />{" "}
											Force Full Sync
										</button>
									</div>
								</div>
								<div className="col-12">
									<div className={styles.panel}>
										<div className={styles.listCardHeader}>
											<h4 className={styles.panelTitle}>
												<i className="bi bi-activity" aria-hidden="true" />{" "}
												Recent iTax Activity
											</h4>
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => openM("taxHistoryModal")}
											>
												Full History
											</button>
										</div>
										<div className={styles.tableWrap}>
											<table className={styles.tbl}>
												<thead>
													<tr>
														{config.itaxActivity.cols.map((c) => (
															<th key={c.key}>{c.label}</th>
														))}
													</tr>
												</thead>
												<tbody>
													{filteredItax.map((row) => (
														<tr key={String(row[5])}>
															{row.map((cell) => (
																<td key={JSON.stringify(cell)}>
																	<CellValue cell={cell} onOpen={openM} />
																</td>
															))}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="kra-sec-clients"
					>
						<SectionHeading
							index="1.4"
							id="kra-sec-clients"
							title="Client tax PINs & formats"
							description="Tax identities for your clients across countries and authorities — every PIN/TIN is checked against its country's expected format."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("addKRAModal")}
									>
										<i className="bi bi-plus" aria-hidden="true" /> Link PIN
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className={styles.tableWrap}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											{config.clientPins.cols.slice(0, 5).map((c) => (
												<th key={c.key}>{c.label}</th>
											))}
											<th>Validation</th>
											{config.clientPins.cols.slice(5).map((c) => (
												<th key={c.key}>{c.label}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{config.clientPins.rows.map((row) => {
											const pinStr = String(row[3]).replace(/^C:/, "");
											const country = String(row[1]);
											const valid = validatePin(country, pinStr);
											return (
												<tr key={pinStr}>
													{row.slice(0, 5).map((cell) => (
														<td key={JSON.stringify(cell)}>
															<CellValue cell={cell} onOpen={openM} />
														</td>
													))}
													<td>
														<span
															className={`${styles.badge} ${valid ? styles.badgeS : styles.badgeD}`}
															title={`Expected format: ${PIN_PATTERNS[country]?.source ?? "No rule for this country"}`}
														>
															<i
																className={`bi ${valid ? "bi-check-lg" : "bi-x-lg"}`}
																aria-hidden="true"
															/>{" "}
															{valid ? "Valid" : "Invalid"}
														</span>
													</td>
													{row.slice(5).map((cell) => (
														<td key={JSON.stringify(cell)}>
															<CellValue cell={cell} onOpen={openM} />
														</td>
													))}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="kra-sec-payments"
					>
						<SectionHeading
							index="1.5"
							id="kra-sec-payments"
							title="Tax payment execution & scheduling"
							description="Execute single or bulk tax payments, set recurring schedules, and manage payment plans with full audit trails."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("bulkTaxModal")}
									>
										<i className="bi bi-collection" aria-hidden="true" /> Bulk
										Pay
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("payKRAModal")}
									>
										<i className="bi bi-receipt-cutoff" aria-hidden="true" />{" "}
										Pay Now
									</button>
								</div>
							}
						/>
						<div className={styles.tableCard}>
							<div className="row g-3">
								<div className="col-lg-5">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-wallet2" aria-hidden="true" /> Payment
											Methods &amp; Sources
										</h4>
										{config.payMethods.map((m) => (
											<div className={styles.sr} key={m.title}>
												<div>
													<strong>{m.title}</strong>
													<div className={styles.mutedSmall}>{m.sub}</div>
												</div>
												{m.badge ? (
													<span
														className={`${styles.badge} ${styles[m.badge.tone]}`}
													>
														{m.badge.text}
													</span>
												) : (
													<button
														type="button"
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() => openM("payKRAModal")}
													>
														{m.actionLabel}
													</button>
												)}
											</div>
										))}
									</div>
								</div>
								<div className="col-lg-7">
									<div className={styles.panel}>
										<h4 className={styles.panelTitle}>
											<i className="bi bi-calendar-event" aria-hidden="true" />{" "}
											Scheduled &amp; Recurring Payments
										</h4>
										{filteredScheduled.map((sched) => (
											<div className={styles.sr} key={sched.title}>
												<div>
													<strong>{sched.title}</strong>
													<div className={styles.mutedSmall}>{sched.sub}</div>
												</div>
												<span
													className={`${styles.badge} ${styles[sched.tone]}`}
												>
													{sched.status}
												</span>
											</div>
										))}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
											onClick={() => openM("scheduleTaxModal")}
										>
											<i className="bi bi-plus" aria-hidden="true" /> Schedule
											New Payment
										</button>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="kra-sec-gov"
					>
						<SectionHeading
							index="1.6"
							id="kra-sec-gov"
							title="Government services & payments"
							description="Pay eCitizen, county and Ardhisasa land services, and track application progress — all from one console."
							action={
								<div className={styles.headerButtonRow}>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("trackGovModal")}
									>
										<i className="bi bi-truck" aria-hidden="true" /> Track
									</button>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
										onClick={() => openM("govHistoryModal")}
									>
										<i className="bi bi-clock-history" aria-hidden="true" />{" "}
										History
									</button>
								</div>
							}
						/>
						<div className={styles.govGrid}>
							{config.govServices.map((g) => (
								<div className={styles.govCard} key={g.provider}>
									<div className={styles.govCardTop}>
										<div
											className={styles.govCardIcon}
											style={{ background: g.iconBg, color: g.iconColor }}
											aria-hidden="true"
										>
											<i className={`bi ${g.icon}`} />
										</div>
										<span className={`${styles.badge} ${styles.badgeI}`}>
											{g.provider}
										</span>
									</div>
									<h4>{g.title}</h4>
									<p className={styles.govCardSub}>{g.sub}</p>
									<div className={styles.govCardPrice}>{g.price}</div>
									<div className={styles.govCardActions}>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}
											onClick={() => openM(g.modal)}
										>
											{g.actionLabel}
										</button>
									</div>
								</div>
							))}
						</div>
						<div className={`${styles.tableCard} mt-3`}>
							<div className={styles.panel}>
								<div className={styles.listCardHeader}>
									<h4 className={styles.panelTitle}>
										<i className="bi bi-globe2" aria-hidden="true" /> Recent
										Government Service Payments
									</h4>
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("govHistoryModal")}
									>
										View All
									</button>
								</div>
								<div className={styles.tableWrap}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												{config.govActivity.cols.map((c) => (
													<th key={c.key}>{c.label}</th>
												))}
											</tr>
										</thead>
										<tbody>
											{config.govActivity.rows.map((row) => (
												<tr key={String(row[5])}>
													{row.map((cell) => (
														<td key={JSON.stringify(cell)}>
															<CellValue cell={cell} onOpen={openM} />
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="kra-sec-activity"
					>
						<SectionHeading
							index="1.7"
							id="kra-sec-activity"
							title="Recent tax & filing activity"
							description="Payments, filings and receipts across linked PINs, most recent first."
							action={
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => openM("govHistoryModal")}
								>
									<i className="bi bi-clock-history" aria-hidden="true" /> View
									All
								</button>
							}
						/>
						<div className={styles.tableCard}>
							<div className={styles.tableWrap}>
								<table className={styles.tbl}>
									<thead>
										<tr>
											{config.activity.cols.map((c) => (
												<th key={c.key}>{c.label}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{config.activity.rows.map((row) => (
											<tr key={String(row[6])}>
												{row.map((cell) => (
													<td key={JSON.stringify(cell)}>
														<CellValue cell={cell} onOpen={openM} />
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				</div>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-bank2" aria-hidden="true" /> KRA &amp;
						Government · {config.hero.value} · Data refreshes every run
					</span>
					<nav aria-label="Footer links">
						<Link to="/pm/app/disputes" search={{ modal: undefined }}>
							Disputes
						</Link>
						<Link to="/pm/app/settlement" search={{ modal: undefined }}>
							Settlements
						</Link>
						<Link to="/pm/app/fees">Fees</Link>
					</nav>
				</footer>
			</div>

			<nav className={styles.floatingBar} aria-label="Quick tax actions">
				<button type="button" onClick={() => openM("attentionModal")}>
					<i className="bi bi-exclamation-circle" aria-hidden="true" />{" "}
					Attention
				</button>
				<button type="button" onClick={() => openM("syncItaxModal")}>
					<i className="bi bi-arrow-repeat" aria-hidden="true" /> Sync
				</button>
				<button type="button" onClick={() => openM("complianceHealthModal")}>
					<i className="bi bi-heart-pulse" aria-hidden="true" /> Health
				</button>
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => openM("payKRAModal")}
				>
					<i className="bi bi-receipt-cutoff" aria-hidden="true" /> Pay Tax
				</button>
			</nav>

			<AttentionHubFab
				count={drawerAttention.length}
				hidden={drawerOpen}
				onClick={() => setDrawerOpen(true)}
			/>

			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="KRA & government"
				pageIcon="bi-building"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<KraGovernmentModals
				active={activeModal}
				onClose={closeM}
				onOpen={openM}
			/>
		</div>
	);
}
