import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import KraGovernmentModals from "../components/KraGovernmentModals";
import styles from "../styles/kraGovernment.module.css";

/* ============================================================================
   PayMo BaaS — KRA & Government Integration (legacy page 1.12)
   React + TypeScript + TanStack Query, emerald-glass dashboard theme.
   ========================================================================== */

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
	actionTone?: "btnPmD" | "btnPmP";
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

interface StatCardK {
	key: string;
	colClass: string;
	label: string;
	labelColor: string;
	value: string;
	valueSuffix?: string;
	badge: { icon: string; text: string; tone: BadgeTone };
	lines: string[];
	progress?: { width: string; color: string; note: string };
	bordered?: boolean;
}

interface KraConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: {
		initials: string;
		name: string;
		role: string;
		headerInitials: string;
	};
	breadcrumb: { parents: { label: string; to: string }[]; current: string };
	pageCode: string;
	pageTitle: string;
	pageSub: string;
	hero: {
		live: string;
		value: string;
		detail: string;
		buttons: { label: string; modal: string }[];
	};
	statCards: StatCardK[];
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
	payMethods: {
		title: string;
		sub: string;
		badge?: { text: string; tone: BadgeTone };
		actionLabel?: string;
	}[];
	scheduled: { title: string; sub: string; status: string; tone: BadgeTone }[];
	clientPins: { cols: TableCol[]; rows: Cell[][] };
	activity: { cols: TableCol[]; rows: Cell[][] };
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: KraConfig = {
	nav: [
		{ icon: "bi-house", to: "/dashboard", label: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", to: "/select-dashboard", label: "Hubs" },
		{
			icon: "bi-lightning-charge",
			to: "/initiate-transfer",
			label: "Transfers",
		},
		{
			icon: "bi-bank2",
			to: "/kra-government",
			label: "KRA & Government",
			active: true,
			dot: true,
		},
		{ icon: "bi-receipt-cutoff", to: "/transactions", label: "Transactions" },
		{ icon: "bi-geo-alt", to: "/locations", label: "Locations" },
		{ icon: "bi-gear", to: "/settings", label: "Settings" },
	],
	headerTitle: "KRA & Government Integration",
	headerSub: "iTax integration, tax payments, filings & compliance",
	searchPlaceholder: "Search KRA PIN, tax types, obligations, returns...",
	user: {
		initials: "JK",
		name: "James K.",
		role: "Tax & Compliance Manager",
		headerInitials: "MN",
	},
	breadcrumb: {
		parents: [
			{ label: "Home", to: "/" },
			{ label: "Services Hub", to: "/select-dashboard" },
		],
		current: "KRA & Government",
	},
	pageCode: "",
	pageTitle: "KRA & Government Integration",
	pageSub:
		"Link multiple KRA PINs, sync obligations, file returns, pay taxes, and manage client tax identities across countries and authorities.",
	hero: {
		live: "KRA integration live",
		value: "4 KRA PINs linked",
		detail:
			"Personal, business, rental portfolio and investment company obligations managed with real-time iTax sync.",
		buttons: [
			{ label: "Pay Tax", modal: "payKRAModal" },
			{ label: "File Return", modal: "fileReturnModal" },
			{ label: "Health Check", modal: "complianceHealthModal" },
		],
	},
	statCards: [
		{
			key: "due",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "DUE IN 7 DAYS",
			labelColor: "var(--pm-danger)",
			value: "KES 184,200",
			badge: { icon: "bi-clock", text: "5 obligations", tone: "badgeD" },
			lines: [],
			progress: {
				width: "65%",
				color: "var(--pm-danger)",
				note: "PAYE, VAT, TOT, CGT, SHIF",
			},
		},
		{
			key: "score",
			colClass: "col-lg-3 col-md-4 col-6",
			label: "COMPLIANCE SCORE",
			labelColor: "var(--pm-info)",
			value: "94",
			valueSuffix: "/100",
			badge: { icon: "bi-shield-check", text: "Excellent", tone: "badgeS" },
			lines: ["All returns filed on time", "Zero penalties in 18 months"],
		},
		{
			key: "savings",
			colClass: "col-lg-3 col-md-4",
			label: "SAVINGS THIS YEAR",
			labelColor: "var(--pm-accent)",
			value: "KES 47,800",
			badge: {
				icon: "bi-piggy-bank",
				text: "Via early filing + reliefs",
				tone: "badgeS",
			},
			lines: ["PAYE relief: KES 31,200", "Investment deductions: KES 16,600"],
			bordered: true,
		},
	],
	attention: [
		{
			icon: "bi-receipt-cutoff",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "VAT return due in 2 days",
			sub: "KRA PIN A012345678Y · KES 84,200",
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
						{
							label: "File",
							modal: "fileReturnModal",
							tone: "btnPmD" as const,
						},
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
						{ label: "Pay", modal: "payKRAModal", tone: "btnPmD" as const },
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
					actions: [
						{ label: "Pay", modal: "payKRAModal", tone: "btnPmD" as const },
					],
				},
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
			sub: "Monthly • 15th • Auto from Wallet",
			status: "Active",
			tone: "badgeS",
		},
		{
			title: "VAT — JK Holdings",
			sub: "Monthly • 5th • M-Pesa",
			status: "Active",
			tone: "badgeS",
		},
		{
			title: "TOT — Rental Portfolio",
			sub: "Quarterly • Next: 20 Jul",
			status: "Paused",
			tone: "badgeW",
		},
	],
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
	const res = await fetch("/api/kra-government");
	if (!res.ok) throw new Error(`Request failed with ${res.status}`);
	const json = (await res.json()) as Partial<KraConfig>;
	return { ...initialMockData, ...json };
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

/* ---------- section header (1.12.x pattern) ---------- */
function SectionHead({
	icon,
	iconColor,
	title,
	sub,
	actions,
	onOpen,
}: {
	icon: string;
	iconColor: string;
	title: string;
	sub: string;
	actions: {
		label: string;
		icon?: string;
		modal: string;
		tone?: "btnPmP" | "btnPmD";
	}[];
	onOpen: (id: string) => void;
}) {
	return (
		<div
			className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
			style={{ gap: 8 }}
		>
			<div>
				<h3 className={styles.st}>
					<i className={`bi ${icon}`} style={{ color: iconColor }} />
					{title}
				</h3>
				<p className={styles.ss}>{sub}</p>
			</div>
			<div className="d-flex" style={{ gap: 8 }}>
				{actions.map((a) => (
					<button
						key={a.label}
						className={`${styles.btnPm} ${styles.btnSm} ${a.tone ? styles[a.tone] : ""}`}
						onClick={() => onOpen(a.modal)}
					>
						{a.icon && <i className={`bi ${a.icon}`} />} {a.label}
					</button>
				))}
			</div>
		</div>
	);
}

/* ---------- inner card with title ---------- */
function Ub({
	title,
	children,
	action,
}: {
	title?: string;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className={styles.ub}>
			{title && (
				<div
					className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
					style={{ gap: 8 }}
				>
					<h4 className={styles.ubTitle} style={{ margin: 0 }}>
						{title}
					</h4>
					{action}
				</div>
			)}
			{children}
		</div>
	);
}

function RingGauge({
	pct,
	color,
	track,
}: {
	pct: number;
	color: string;
	track: string;
}) {
	const r = 20;
	const c = 2 * Math.PI * r;
	return (
		<svg
			width="52"
			height="52"
			viewBox="0 0 52 52"
			className={styles.ring}
			aria-hidden="true"
		>
			<circle
				cx="26"
				cy="26"
				r={r}
				fill="none"
				stroke={track}
				strokeWidth="5"
			/>
			<circle
				cx="26"
				cy="26"
				r={r}
				fill="none"
				stroke={color}
				strokeWidth="5"
				strokeLinecap="round"
				strokeDasharray={`${(pct / 100) * c} ${c}`}
				transform="rotate(-90 26 26)"
			/>
		</svg>
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

	/* ---------- LEGACY BRIDGE: openM(id) / closeM() ---------- */
	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	return (
		<div className={styles.kraGovernmentPage}>
			<div className={styles.main}>
				{/* ======================= PAGE BAR ======================= */}
				<div className={styles.pageBar}>
					<div>
						<div className={styles.breadcrumb}>
							{config.breadcrumb.parents.map((p) => (
								<span key={p.label}>
									<Link to={p.to}>{p.label}</Link> /{" "}
								</span>
							))}
							<strong>{config.breadcrumb.current}</strong>
						</div>
						{/* <h2 className={styles.pageH2}>
							{config.pageTitle}
						</h2>
						<p className={styles.pageSub}>{config.pageSub}</p> */}
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button
							className={styles.btnPm}
							onClick={() => openM("complianceHealthModal")}
						>
							<i className="bi bi-heart-pulse" /> Compliance Health
						</button>
						<button
							className={styles.btnPm}
							onClick={() => openM("bulkTaxModal")}
						>
							<i className="bi bi-collection" /> Bulk File
						</button>
						<button
							className={styles.btnPm}
							onClick={() => openM("payKRAModal")}
						>
							<i className="bi bi-credit-card" /> Pay Tax
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => openM("addKRAModal")}
						>
							<i className="bi bi-plus-lg" /> Link KRA PIN
						</button>
					</div>
				</div>

				<div className={styles.content}>
					{/* ======================= HERO STATS ======================= */}
					<div className="row g-3">
						<div className="col-lg-4">
						<div className={styles.heroClip}>
							<div className={styles.heroLedger}>
								<i
									className={`bi bi-bank2 ${styles.heroMark}`}
									aria-hidden="true"
								/>
								<div className={styles.livePillRow}>
									<span className={styles.livePill}>
										<span className={styles.liveDot} />
										{config.hero.live}
									</span>
									<span className={styles.heroEta}>iTax sync · 27 Jun 09:14</span>
								</div>
								<div className={styles.heroValue}>{config.hero.value}</div>
								<p className={styles.heroDetail}>{config.hero.detail}</p>

								{/* linked KRA PIN chips */}
								<div className={styles.pinChips}>
									{config.kraPins.rows.map((r, i) => (
										<span key={i} className={styles.pinChip}>
											{String(r[0]).replace("C:", "")}
										</span>
									))}
								</div>

								{/* obligations meter */}
								<div className={styles.meterWrap}>
									<div className={styles.meterHead}>
										<span>Obligations this month</span>
										<span>5 · 65% met</span>
									</div>
									<div className={styles.meter}>
										{[0, 1, 2, 3, 4].map((i) => (
											<span
												key={i}
												className={i < 3.25 ? styles.meterOn : styles.meterOff}
											/>
										))}
									</div>
								</div>

								<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
									{config.hero.buttons.map((b) => (
										<button
											key={b.label}
											className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`}
											onClick={() => openM(b.modal)}
										>
											{b.label}
										</button>
									))}
								</div>
							</div>
						</div>
						</div>
						{config.statCards.map((card) => {
							const isDial = card.key === "score";
							const shapeCls = isDial
								? styles.shapeDial
								: card.key === "due"
									? styles.shapeCut
									: styles.shapeStack;
							return (
								<div className={card.colClass} key={card.key}>
									<div
										className={`${styles.card} ${styles.statCard} ${shapeCls}`}
										style={{
											minHeight: 196,
											borderTop: `3px solid ${card.labelColor}`,
										}}
									>
										{isDial && (
											<div className={styles.dialMedal}>
												<RingGauge
													pct={94}
													color="var(--pm-accent)"
													track="var(--pm-accent-soft)"
												/>
											</div>
										)}
										<div className={styles.statTopRow}>
											<p className={styles.sl} style={{ color: card.labelColor }}>
												{card.label}
											</p>
											<span
													className={styles.statChip}
													style={{ background: card.labelColor, color: "#fff" }}
												>
													<i className={`bi ${card.badge.icon}`} />
												</span>
										</div>
										<div className={styles.statMainRow}>
											<div className={styles.sv} style={{ fontSize: 30 }}>
												{card.value}
												{card.valueSuffix && (
													<span className={styles.statSuffix}>
														{card.valueSuffix}
													</span>
												)}
											</div>
											{card.key === "savings" && (
												<div className={styles.spark}>
													{[30, 45, 40, 62, 55, 74, 90, 82].map((h, i) => (
														<i key={i} style={{ height: `${h}%` }} />
													))}
												</div>
											)}
										</div>
										<span
											className={`${styles.badge} ${styles[card.badge.tone]}`}
										>
											<i className={`bi ${card.badge.icon}`} /> {card.badge.text}
										</span>
										{card.progress && (
											<div className={styles.progressBlock}>
												<div className={styles.pmProgress}>
													<div
															className={styles.pmProgressBar}
															style={{
																width: card.progress.width,
																background: card.progress.color,
															}}
														/>
													</div>
													<div className={styles.progressNote}>
														{card.progress.note}
													</div>
												</div>
											)}
										{card.lines.length > 0 && (
											<div className={styles.statFoot}>
												{card.lines.map((li) => (
													<span key={li}>{li}</span>
												))}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* ======================= ATTENTION / SUGGESTIONS / QUICK ACTIONS ======================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.st}>Attention Required</h3>
									<button
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => openM("attentionModal")}
									>
										View all
									</button>
								</div>
								{config.attention.map((item) => (
									<div className={styles.sr} key={item.title}>
										<div className="d-flex align-items-center gap-3">
											<div
												className={styles.iconCircle}
												style={{
													background: item.iconBg,
													color: item.iconColor,
													fontSize: 12,
												}}
											>
												<i className={`bi ${item.icon}`} />
											</div>
											<div>
												<div className={styles.fwBold13}>{item.title}</div>
												<div className={styles.mutedSmall}>{item.sub}</div>
											</div>
										</div>
										<button
											className={`${styles.btnPm} ${styles.btnSm} ${item.actionTone ? styles[item.actionTone] : ""}`}
											onClick={() => openM(item.modal)}
										>
											{item.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h3 className={styles.st}>Smart Suggestions</h3>
									<span className={`${styles.badge} ${styles.badgeP}`}>
										<i className="bi bi-stars" /> AI
									</span>
								</div>
								{config.suggestions.map((item) => (
									<div className={styles.sr} key={item.title}>
										<div className="d-flex align-items-center gap-3">
											<div
												className={styles.iconCircle}
												style={{
													background: item.iconBg,
													color: item.iconColor,
													fontSize: 12,
												}}
											>
												<i className={`bi ${item.icon}`} />
											</div>
											<div>
												<div className={styles.fwBold13}>{item.title}</div>
												<div className={styles.mutedSmall}>{item.sub}</div>
											</div>
										</div>
										<button
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM(item.modal)}
										>
											{item.actionLabel}
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<div className="mb-3">
									<h3 className={styles.st}>Quick Actions</h3>
									<p className={styles.ss}>
										Frequent government payment workflows
									</p>
								</div>
								<div className={styles.quickGrid}>
									{config.quickActions.map((qa) => (
										<button
											key={qa.label}
											className={styles.quickBtn}
											onClick={() => openM(qa.modal)}
										>
											<i
												className={`bi ${qa.icon} me-1`}
												style={{ color: qa.color }}
											/>{" "}
											{qa.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ======================= SECTION KRA iTax Integration Hub ======================= */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-bank2"
							iconColor="var(--pm-primary)"
							title="KRA iTax Integration Hub"
							sub="Link multiple KRA PINs, sync obligations, view real-time tax position, and manage filings across personal and business entities."
							actions={[
								{ label: "Link PIN", icon: "bi-plus-lg", modal: "addKRAModal" },
								{
									label: "Sync iTax",
									icon: "bi-arrow-repeat",
									modal: "syncItaxModal",
									tone: "btnPmP",
								},
							]}
							onOpen={openM}
						/>
						<div className="row g-3">
							<div className="col-lg-7">
								<Ub title="Linked KRA PINs & Obligations">
									<div className="table-responsive">
										<table className={styles.tbl}>
											<thead>
												<tr>
													{config.kraPins.cols.map((c) => (
														<th key={c.key}>{c.label}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{config.kraPins.rows.map((row, i) => (
													<tr key={i}>
														{row.map((cell, j) => (
															<td key={j}>
																<CellValue cell={cell} onOpen={openM} />
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</Ub>
							</div>
							<div className="col-lg-5">
								<Ub title="Tax Position Snapshot">
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
									<div className="mt-3">
										<button
											className={`${styles.btnPm} ${styles.btnSm} w-100`}
											onClick={() => openM("syncItaxModal")}
										>
											<i className="bi bi-arrow-repeat" /> Force Full Sync
										</button>
									</div>
								</Ub>
							</div>
							<div className="col-12">
								<Ub
									title="Recent iTax Activity"
									action={
										<button
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => openM("taxHistoryModal")}
										>
											Full History
										</button>
									}
								>
									<div className="table-responsive">
										<table className={styles.tbl}>
											<thead>
												<tr>
													{config.itaxActivity.cols.map((c) => (
														<th key={c.key}>{c.label}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{config.itaxActivity.rows.map((row, i) => (
													<tr key={i}>
														{row.map((cell, j) => (
															<td key={j}>
																<CellValue cell={cell} onOpen={openM} />
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</Ub>
							</div>
						</div>
					</div>

					{/* ======================= SECTION Client Tax PINs & Formats ======================= */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-person-badge"
							iconColor="var(--pm-warning)"
							title="Client Tax PINs & Formats"
							sub="Tax identities for your clients across countries and authorities — every PIN/TIN is checked against its country's expected format."
							actions={[
								{ label: "Link PIN", icon: "bi-plus-lg", modal: "addKRAModal" },
								{
									label: "Sync iTax",
									icon: "bi-arrow-repeat",
									modal: "syncItaxModal",
									tone: "btnPmP",
								},
							]}
							onOpen={openM}
						/>
						<div className="table-responsive">
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
							{config.clientPins.rows.map((row, i) => {
								const pinStr = String(row[3]).replace(/^C:/, "");
								const country = String(row[1]);
								const valid = validatePin(country, pinStr);
								return (
									<tr key={i}>
										{row.slice(0, 5).map((cell, j) => (
											<td key={j}>
												<CellValue cell={cell} onOpen={openM} />
											</td>
										))}
										<td>
											<span
													className={`${styles.badge} ${
														valid ? styles.badgeS : styles.badgeD
													}`}
													title={`Expected format: ${PIN_PATTERNS[country]?.source ?? "No rule for this country"}`}
												>
													<i
														className={`bi ${valid ? "bi-check-lg" : "bi-x-lg"}`}
													/>{" "}
													{valid ? "Valid" : "Invalid"}
												</span>
											</td>
											{row.slice(5).map((cell, j) => (
												<td key={j + 5}>
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

					{/* ======================= SECTION Tax Payment Execution & Scheduling ======================= */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-credit-card"
							iconColor="var(--pm-info)"
							title="Tax Payment Execution & Scheduling"
							sub="Execute single or bulk tax payments, set recurring schedules, and manage payment plans with full audit trails."
							actions={[
								{
									label: "Bulk Pay",
									icon: "bi-collection",
									modal: "bulkTaxModal",
								},
								{ label: "Pay Now", modal: "payKRAModal", tone: "btnPmP" },
							]}
							onOpen={openM}
						/>
						<div className="row g-3">
							<div className="col-lg-5">
								<Ub title="Payment Methods & Sources">
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
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => openM("payKRAModal")}
												>
													{m.actionLabel}
												</button>
											)}
										</div>
									))}
								</Ub>
							</div>
							<div className="col-lg-7">
								<Ub title="Scheduled & Recurring Payments">
									{config.scheduled.map((s) => (
										<div className={styles.sr} key={s.title}>
											<div>
												<strong>{s.title}</strong>
												<div className={styles.mutedSmall}>{s.sub}</div>
											</div>
											<span className={`${styles.badge} ${styles[s.tone]}`}>
												{s.status}
											</span>
										</div>
									))}
									<div className="mt-3">
										<button
											className={`${styles.btnPm} ${styles.btnSm} w-100`}
											onClick={() => openM("scheduleTaxModal")}
										>
											<i className="bi bi-plus-lg" /> Schedule New Payment
										</button>
									</div>
								</Ub>
							</div>
						</div>
					</div>

					{/* ======================= SECTION Recent Tax & Filing Activity ======================= */}
					<div className={styles.card}>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<div>
								<h3 className={styles.st}>
									<i
										className="bi bi-clock-history"
										style={{ color: "var(--pm-muted)" }}
									/>{" "}
									Recent Tax & Filing Activity
								</h3>
								<p className={styles.ss}>Payments, filings and receipts across linked PINs</p>
							</div>
							<button
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => openM("govHistoryModal")}
							>
								View All
							</button>
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										{config.activity.cols.map((c) => (
											<th key={c.key}>{c.label}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{config.activity.rows.map((row, i) => (
										<tr key={i}>
											{row.map((cell, j) => (
												<td key={j}>
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
				{/* content */}
			</div>
			{/* main */}

			{/* ======================= ALL 21 MODALS ======================= */}
			<KraGovernmentModals
				active={activeModal}
				onClose={closeM}
				onOpen={openM}
			/>
		</div>
	);
}
