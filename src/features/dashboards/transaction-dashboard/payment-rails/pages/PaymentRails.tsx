/**
 * PayMo Business — Payment Rails & Routing (Control Tower).
 *
 * Multi-rail payment operations workspace (PesaLink, RTGS, ACH, SWIFT,
 * card-to-bank): connected banks directory, intelligent routing rules,
 * rail configuration/health, nostro & vostro positions, performance
 * analytics and the audit trail.
 *
 * Rebuilt in the navy/emerald PayMo blueprint: executive hero snapshot,
 * numbered business sections, semantic tables, floating command bar and
 * fully data-driven modal workflows (see DESIGN-BLUEPRINT.md).
 */

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import AttentionDrawer from "../../shared/components/AttentionDrawer";
import AttentionHubFab from "../../shared/components/AttentionHubFab";
import type {
	AttentionItem as DrawerAttentionItem,
	QuickActionItem,
} from "../../shared/data/attentionFeed";
import {
	type PaymentRailsData,
	PaymentRailsModals,
} from "../components/PaymentRailsModals";
import styles from "../styles/paymentRails.module.css";

type RailStatus = "healthy" | "degraded" | "paused" | "disabled";
type BankStatus = "active" | "degraded" | "paused";
type Currency = "KES" | "USD" | "GBP" | "EUR";
type Priority = "high" | "medium" | "low";
type SuggestionAction = "railConfigModal" | "routingRulesModal" | "nostroModal";
type AttentionAction = "nostroModal" | "railConfigModal" | "bankHealthModal";

interface Bank {
	id: string;
	name: string;
	shortName: string;
	rails: string[];
	currencies: Currency[];
	status: BankStatus;
	health: number;
	latencyMs: number;
	monthlyCost: number;
}

interface RoutingRule {
	id: string;
	priority: number;
	name: string;
	condition: string;
	preferredRail: string;
	status: "active" | "paused";
	trafficShare: number;
	monthlyVolume: string;
}

interface RailConfig {
	id: string;
	rail: string;
	type: string;
	enabled: boolean;
	cutoff: string;
	costPerTx: number;
	slaMinutes: number;
	latencyMs: number;
	failureRate: number;
	limit: string;
	statusNote: string;
}

interface NostroAccount {
	id: string;
	accountName: string;
	bank: string;
	currency: Currency;
	balance: string;
	balanceNumeric: number;
	utilization: number;
	status: "healthy" | "low" | "investigate" | "paused";
}

interface RailPerformance {
	id: string;
	rail: string;
	slaTarget: number;
	uptime: number;
	txs: string;
	avgLatency: string;
	failureRate: number;
}

interface AuditEntry {
	id: string;
	action: string;
	rail: string;
	user: string;
	timestamp: string;
}

interface HealthCheckSummary {
	progress: number;
	total: number;
	issues: number;
	lastRun: string;
	banks: Record<string, BankStatus>;
}

interface AiSuggestion {
	id: string;
	priority: Priority;
	title: string;
	recommendation: string;
	savings: string;
	rail?: string;
	action: SuggestionAction;
}

interface AttentionItem {
	id: string;
	severity: "warn" | "danger" | "info";
	title: string;
	detail: string;
	action: AttentionAction;
	bank?: string;
}

interface QuickAction {
	id: string;
	icon: string;
	label: string;
	detail: string;
	modal: string;
}

interface HeroSnapshot {
	railsConfigured: number;
	activeBanks: number;
	monthlyVolume: string;
	successRate: string;
}

export interface PaymentRailsContent {
	hero: HeroSnapshot;
	stats: {
		activeRails: string;
		activeBanks: string;
		monthlyCost: string;
		attentionCount: number;
	};
	attention: AttentionItem[];
	suggestions: AiSuggestion[];
	quickActions: QuickAction[];
	banks: Bank[];
	routingRules: RoutingRule[];
	rails: RailConfig[];
	nostro: NostroAccount[];
	performance: RailPerformance[];
	auditTrail: AuditEntry[];
	healthCheck: HealthCheckSummary;
}

const initialMockData: PaymentRailsContent = {
	hero: {
		railsConfigured: 8,
		activeBanks: 6,
		monthlyVolume: "KES 42.8B",
		successRate: "99.4%",
	},
	stats: {
		activeRails: "5 of 5 live",
		activeBanks: "6 of 8",
		monthlyCost: "KES 18.6M",
		attentionCount: 3,
	},
	attention: [
		{
			id: "att-swift",
			severity: "danger",
			title: "SWIFT MT103 credentials expire in 3 days",
			detail:
				"Credential rotation for the SWIFT correspondent channel is overdue.",
			action: "railConfigModal",
		},
		{
			id: "att-usd",
			severity: "warn",
			title: "USD nostro utilization at 87%",
			detail: "Above the 80% rebalance threshold — top up or reroute USD flow.",
			action: "nostroModal",
		},
		{
			id: "att-family",
			severity: "warn",
			title: "Family Bank integration paused",
			detail:
				"Rail is paused pending certificate renewal; traffic rerouted to Equity.",
			action: "bankHealthModal",
			bank: "Family Bank",
		},
	],
	suggestions: [
		{
			id: "sug-1",
			priority: "high",
			title: "Reroute KES 50–500K via RTGS after 15:00",
			recommendation:
				"PesaLink cutoff misses 18% of afternoon business payments. RTGS same-day settlement is still open until 17:00.",
			savings: "Save est. 4.2 hrs settlement delay",
			rail: "RTGS",
			action: "routingRulesModal",
		},
		{
			id: "sug-2",
			priority: "high",
			title: "Shift USD flows to Stanbic nostro",
			recommendation:
				"Stanbic USD nostro has 23% utilization vs Equity at 87%. Rebalancing avoids a funding gap this week.",
			savings: "Avoid ~$2.1M overdraft cost",
			rail: "SWIFT",
			action: "nostroModal",
		},
		{
			id: "sug-3",
			priority: "medium",
			title: "Enable card-to-bank for sub-KES 30K",
			recommendation:
				"Card-to-bank success rate improved to 98.9% after the May network upgrade — safe to widen the threshold.",
			savings: "~12% lower per-tx cost on retail rail",
			rail: "Card-to-Bank",
			action: "railConfigModal",
		},
	],
	quickActions: [
		{
			id: "qa-bank",
			icon: "bi-bank2",
			label: "Add Bank",
			detail: "Onboard a new counterparty bank",
			modal: "addBankModal",
		},
		{
			id: "qa-routing",
			icon: "bi-signpost-split",
			label: "Routing Rules",
			detail: "Edit smart routing priorities",
			modal: "routingRulesModal",
		},
		{
			id: "qa-rail",
			icon: "bi-train-front",
			label: "Rail Config",
			detail: "Configure rail connections",
			modal: "railConfigModal",
		},
		{
			id: "qa-nostro",
			icon: "bi-wallet2",
			label: "Nostro / Vostro",
			detail: "Manage correspondent accounts",
			modal: "nostroModal",
		},
		{
			id: "qa-fx",
			icon: "bi-cash-coin",
			label: "FX Rebalance",
			detail: "Rebalance currency liquidity",
			modal: "fxRebalanceModal",
		},
		{
			id: "qa-health",
			icon: "bi-heart-pulse",
			label: "Health Check",
			detail: "Test all rail connections",
			modal: "healthCheckModal",
		},
		{
			id: "qa-export",
			icon: "bi-file-earmark-spreadsheet",
			label: "Export Report",
			detail: "Download operations report",
			modal: "exportReportModal",
		},
		{
			id: "qa-reconcile",
			icon: "bi-clipboard2-check",
			label: "Reconcile",
			detail: "Reconcile nostro balances",
			modal: "reconcileModal",
		},
	],
	banks: [
		{
			id: "eq",
			name: "Equity Bank",
			shortName: "EQTY",
			rails: ["PesaLink", "RTGS", "SWIFT", "ACH"],
			currencies: ["KES", "USD", "GBP", "EUR"],
			status: "degraded",
			health: 82,
			latencyMs: 842,
			monthlyCost: 4_850_000,
		},
		{
			id: "kcb",
			name: "KCB Bank",
			shortName: "KCB",
			rails: ["PesaLink", "RTGS", "SWIFT", "ACH"],
			currencies: ["KES", "USD", "EUR"],
			status: "active",
			health: 99,
			latencyMs: 312,
			monthlyCost: 3_200_000,
		},
		{
			id: "coop",
			name: "Co-operative Bank",
			shortName: "COOP",
			rails: ["PesaLink", "RTGS", "ACH"],
			currencies: ["KES", "USD"],
			status: "active",
			health: 97,
			latencyMs: 298,
			monthlyCost: 2_750_000,
		},
		{
			id: "absa",
			name: "Absa Bank Kenya",
			shortName: "ABSA",
			rails: ["PesaLink", "RTGS", "SWIFT"],
			currencies: ["KES", "USD", "GBP"],
			status: "active",
			health: 98,
			latencyMs: 276,
			monthlyCost: 2_400_000,
		},
		{
			id: "stanbic",
			name: "Stanbic Bank",
			shortName: "STAN",
			rails: ["PesaLink", "RTGS", "SWIFT"],
			currencies: ["KES", "USD", "GBP", "EUR"],
			status: "active",
			health: 99,
			latencyMs: 245,
			monthlyCost: 2_150_000,
		},
		{
			id: "family",
			name: "Family Bank",
			shortName: "FAML",
			rails: ["PesaLink", "ACH"],
			currencies: ["KES"],
			status: "paused",
			health: 0,
			latencyMs: 0,
			monthlyCost: 850_000,
		},
		{
			id: "dtb",
			name: "Diamond Trust Bank",
			shortName: "DTB",
			rails: ["PesaLink", "RTGS"],
			currencies: ["KES", "USD"],
			status: "active",
			health: 96,
			latencyMs: 334,
			monthlyCost: 1_350_000,
		},
		{
			id: "im",
			name: "I&M Bank",
			shortName: "IM",
			rails: ["PesaLink", "SWIFT"],
			currencies: ["KES", "USD", "EUR"],
			status: "active",
			health: 98,
			latencyMs: 268,
			monthlyCost: 1_050_000,
		},
	],
	routingRules: [
		{
			id: "r1",
			priority: 1,
			name: "High-Value Instant",
			condition: "amount > 500,000 AND currency = KES AND time < 15:00",
			preferredRail: "PesaLink",
			status: "active",
			trafficShare: 34,
			monthlyVolume: "KES 14.6B",
		},
		{
			id: "r2",
			priority: 2,
			name: "Salary Batch",
			condition: "type = payroll AND amount < 100,000",
			preferredRail: "ACH",
			status: "active",
			trafficShare: 28,
			monthlyVolume: "KES 9.2B",
		},
		{
			id: "r3",
			priority: 3,
			name: "International USD",
			condition: "currency != KES AND counterparty = bank",
			preferredRail: "SWIFT",
			status: "paused",
			trafficShare: 0,
			monthlyVolume: "USD 0 (paused)",
		},
		{
			id: "r4",
			priority: 4,
			name: "Low-Value Fast",
			condition: "amount < 30,000 AND channel = mobile",
			preferredRail: "Card-to-Bank",
			status: "active",
			trafficShare: 38,
			monthlyVolume: "KES 6.8B",
		},
	],
	rails: [
		{
			id: "pesalink",
			rail: "PesaLink",
			type: "Instant",
			enabled: true,
			cutoff: "15:00 EAT",
			costPerTx: 35,
			slaMinutes: 1,
			latencyMs: 210,
			failureRate: 0.4,
			limit: "KES 999,999 / tx",
			statusNote: "Operational — within SLA",
		},
		{
			id: "rtgs",
			rail: "RTGS",
			type: "High-value",
			enabled: true,
			cutoff: "17:00 EAT",
			costPerTx: 250,
			slaMinutes: 120,
			latencyMs: 14_800,
			failureRate: 0.2,
			limit: "Unlimited (same-day settlement)",
			statusNote: "Operational — settlement window open",
		},
		{
			id: "ach",
			rail: "ACH",
			type: "Batch",
			enabled: true,
			cutoff: "13:00 EAT (T+1)",
			costPerTx: 12,
			slaMinutes: 1440,
			latencyMs: 0,
			failureRate: 0.7,
			limit: "Bulk files to 50,000 items",
			statusNote: "Operational — next-day settlement",
		},
		{
			id: "swift",
			rail: "SWIFT",
			type: "International",
			enabled: false,
			cutoff: "14:00 EAT",
			costPerTx: 1_850,
			slaMinutes: 2880,
			latencyMs: 0,
			failureRate: 2.1,
			limit: "FX-limit governed per correspondent",
			statusNote: "Disabled — MT103 credentials expire in 3 days",
		},
		{
			id: "card2bank",
			rail: "Card-to-Bank",
			type: "Card scheme",
			enabled: true,
			cutoff: "24/7",
			costPerTx: 22,
			slaMinutes: 5,
			latencyMs: 1_150,
			failureRate: 1.1,
			limit: "KES 150,000 / tx",
			statusNote: "Operational — 24/7 availability",
		},
	],
	nostro: [
		{
			id: "n-usd",
			accountName: "USD Nostro",
			bank: "Equity Bank",
			currency: "USD",
			balance: "$12.4M",
			balanceNumeric: 12_400_000,
			utilization: 87,
			status: "investigate",
		},
		{
			id: "n-eur",
			accountName: "EUR Nostro",
			bank: "Stanbic Bank",
			currency: "EUR",
			balance: "€3.8M",
			balanceNumeric: 3_800_000,
			utilization: 41,
			status: "healthy",
		},
		{
			id: "n-gbp",
			accountName: "GBP Nostro",
			bank: "Absa Bank Kenya",
			currency: "GBP",
			balance: "£2.1M",
			balanceNumeric: 2_100_000,
			utilization: 54,
			status: "investigate",
		},
		{
			id: "v-kes",
			accountName: "Vostro KES (Stanbic)",
			bank: "Stanbic Bank",
			currency: "KES",
			balance: "KES 840M",
			balanceNumeric: 840_000_000,
			utilization: 32,
			status: "healthy",
		},
	],
	performance: [
		{
			id: "p-pesalink",
			rail: "PesaLink",
			slaTarget: 99.5,
			uptime: 99.8,
			txs: "184,204",
			avgLatency: "210ms",
			failureRate: 0.4,
		},
		{
			id: "p-rtgs",
			rail: "RTGS",
			slaTarget: 99.9,
			uptime: 100,
			txs: "12,860",
			avgLatency: "14.8s",
			failureRate: 0.2,
		},
		{
			id: "p-ach",
			rail: "ACH",
			slaTarget: 99.0,
			uptime: 99.6,
			txs: "2.4M",
			avgLatency: "T+1",
			failureRate: 0.7,
		},
		{
			id: "p-card",
			rail: "Card-to-Bank",
			slaTarget: 98.5,
			uptime: 98.9,
			txs: "64,310",
			avgLatency: "1.15s",
			failureRate: 1.1,
		},
	],
	auditTrail: [
		{
			id: "a1",
			action: "Automated FX rebalance executed",
			rail: "SWIFT",
			user: "Routing Engine",
			timestamp: "2026-08-29 09:42",
		},
		{
			id: "a2",
			action: "Routing rule updated: High-Value Instant threshold to KES 500K",
			rail: "PesaLink",
			user: "operations@paymo",
			timestamp: "2026-08-28 16:18",
		},
		{
			id: "a3",
			action: "Bank credentials rotated",
			rail: "KCB Bank",
			user: "treasury@paymo",
			timestamp: "2026-08-27 11:05",
		},
		{
			id: "a4",
			action: "Health check passed — 7 of 8 banks reachable",
			rail: "All rails",
			user: "System",
			timestamp: "2026-08-27 06:00",
		},
	],
	healthCheck: {
		progress: 100,
		total: 8,
		issues: 1,
		lastRun: "Today, 06:00 EAT",
		banks: {
			"Equity Bank": "degraded",
			"KCB Bank": "active",
			"Co-operative Bank": "active",
			"Absa Bank Kenya": "active",
			"Stanbic Bank": "active",
			"Family Bank": "paused",
			"Diamond Trust Bank": "active",
			"I&M Bank": "active",
		},
	},
};

async function fetchPaymentRails(): Promise<PaymentRailsContent> {
	const res = await fetch("/api/payment-rails");
	if (!res.ok) throw new Error(`Payment rails API error: ${res.status}`);
	return res.json();
}

const cx = (...parts: Array<string | false | null | undefined>) =>
	parts.filter(Boolean).join(" ");

const railStatusMeta: Record<
	RailStatus,
	{ label: string; badge: string; dot: string }
> = {
	healthy: {
		label: "Healthy",
		badge: styles.badgeSuccess,
		dot: "bi-check-circle-fill",
	},
	degraded: {
		label: "Degraded",
		badge: styles.badgeWarn,
		dot: "bi-exclamation-triangle-fill",
	},
	paused: {
		label: "Paused",
		badge: styles.badgeNeutral,
		dot: "bi-pause-circle-fill",
	},
	disabled: {
		label: "Disabled",
		badge: styles.badgeDanger,
		dot: "bi-x-circle-fill",
	},
};

const bankStatusMeta: Record<BankStatus, { label: string; badge: string }> = {
	active: { label: "Active", badge: styles.badgeSuccess },
	degraded: { label: "Degraded", badge: styles.badgeWarn },
	paused: { label: "Paused", badge: styles.badgeNeutral },
};

const nostroStatusMeta: Record<
	NostroAccount["status"],
	{ label: string; badge: string }
> = {
	healthy: { label: "Healthy", badge: styles.badgeSuccess },
	low: { label: "Low balance", badge: styles.badgeWarn },
	investigate: { label: "Investigate", badge: styles.badgeWarn },
	paused: { label: "Paused", badge: styles.badgeNeutral },
};

function railStatusOf(rail: RailConfig): RailStatus {
	if (!rail.enabled) return "disabled";
	if (rail.failureRate >= 2) return "degraded";
	return "healthy";
}

export default function PaymentRails() {
	const { data: remoteData, error } = useQuery({
		queryKey: ["paymo-payment-rails"],
		queryFn: fetchPaymentRails,
		initialData: initialMockData,
		staleTime: 60_000,
		retry: 1,
	});
	const c = remoteData ?? initialMockData;
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [activeBank, setActiveBank] = useState<string | null>(null);
	const [activeRail, setActiveRail] = useState<string | null>(null);
	const [toasts, setToasts] = useState<
		Array<{ id: number; message: string; variant: "success" | "danger" }>
	>([]);
	const [bankQuery, setBankQuery] = useState("");
	const [bankFilter, setBankFilter] = useState<"all" | BankStatus>("all");
	const [railView, setRailView] = useState<"rules" | "rails">("rules");

	useEffect(() => {
		if (!toasts.length) return;
		const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 4200);
		return () => clearTimeout(timer);
	}, [toasts]);

	const pushToast = (
		message: string,
		variant: "success" | "danger" = "success",
	) =>
		setToasts((prev) => [
			...prev.slice(-4),
			{ id: Date.now() + Math.random(), message, variant },
		]);

	const go = (modalId: string | null) => setActiveModal(modalId);

	const openBankHealth = (bankName: string) => {
		setActiveBank(bankName);
		go("bankHealthModal");
	};
	const openRailConfig = (railId: string) => {
		setActiveRail(railId);
		go("railConfigModal");
	};

	const applySuggestion = (sug: AiSuggestion) => {
		if (sug.action === "nostroModal") {
			setActiveBank(null);
			go("nostroModal");
		} else {
			go(sug.action);
		}
		pushToast(`Applied suggestion: ${sug.title}`);
	};

	const handleDrawerAction = (modal: string) => {
		if (!modal) return;
		if (modal.startsWith("suggestion:")) {
			const suggestion = c.suggestions.find(
				(sug) => sug.action === modal.slice("suggestion:".length),
			);
			if (suggestion) applySuggestion(suggestion);
			return;
		}
		if (modal.startsWith("attention:bank:")) {
			openBankHealth(modal.slice("attention:bank:".length));
			return;
		}
		if (modal === "attention:rail") {
			setActiveRail("swift");
			go("railConfigModal");
			return;
		}
		if (modal === "attention:nostro") {
			setActiveRail(null);
			go("nostroModal");
			return;
		}
		go(modal);
	};

	const severityAttention: Record<
		AttentionItem["severity"],
		{ icon: string; iconBg: string; iconColor: string }
	> = {
		danger: {
			icon: "bi-exclamation-octagon-fill",
			iconBg: "var(--pr-danger-soft)",
			iconColor: "var(--pr-danger)",
		},
		warn: {
			icon: "bi-exclamation-triangle-fill",
			iconBg: "var(--pr-warning-soft)",
			iconColor: "var(--pr-warning)",
		},
		info: {
			icon: "bi-info-circle-fill",
			iconBg: "var(--pr-info-soft)",
			iconColor: "var(--pr-info)",
		},
	};
	const drawerAttention = c.attention.map((item): DrawerAttentionItem => {
		const sev = severityAttention[item.severity];
		const modal =
			item.action === "bankHealthModal"
				? `attention:bank:${item.bank ?? ""}`
				: item.action === "railConfigModal"
					? "attention:rail"
					: item.action === "nostroModal"
						? "attention:nostro"
						: "attentionModal";
		return {
			icon: sev.icon.replace(/^bi-/, ""),
			iconBg: sev.iconBg,
			iconColor: sev.iconColor,
			title: item.title,
			sub: item.detail,
			actionLabel: "Resolve",
			modal,
		};
	});
	const drawerSuggestions = c.suggestions.map(
		(sug): DrawerAttentionItem => ({
			icon: "lightbulb",
			iconBg: "var(--pr-green-soft)",
			iconColor: "var(--pr-green-dark)",
			title: sug.title,
			sub: `${sug.recommendation} · ${sug.savings}`,
			actionLabel: "Apply",
			modal: `suggestion:${sug.action}`,
		}),
	);
	const drawerQuickActions = c.quickActions.map(
		(action): QuickActionItem => ({
			icon: action.icon.replace(/^bi-/, ""),
			iconColor: "var(--pr-green)",
			label: action.label,
			modal: action.modal,
		}),
	);

	const scrollTo = (sectionId: string) => {
		document
			.getElementById(sectionId)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const filteredBanks = useMemo(() => {
		const q = bankQuery.trim().toLowerCase();
		return c.banks.filter((b) => {
			const matchesFilter = bankFilter === "all" || b.status === bankFilter;
			const matchesQuery =
				!q ||
				b.name.toLowerCase().includes(q) ||
				b.shortName.toLowerCase().includes(q) ||
				b.rails.some((r) => r.toLowerCase().includes(q));
			return matchesFilter && matchesQuery;
		});
	}, [c.banks, bankQuery, bankFilter]);

	const swiftRail = c.rails.find((r) => r.id === "swift");
	const degradedBank = c.banks.find((b) => b.status === "degraded");
	const pausedBank = c.banks.find((b) => b.status === "paused");
	const activeBankCount = c.banks.filter((b) => b.status === "active").length;
	const healthyRails = c.rails.filter((r) => r.enabled).length;

	const modalData: PaymentRailsData = {
		...c,
		activeModal,
		setActiveModal: go,
		activeBank,
		setActiveBank,
		activeRail,
		setActiveRail,
		onToast: pushToast,
	};

	return (
		<div className={styles.railsPage}>
			<main className={styles.main} id="main-content">
				<div className={styles.content}>
					{/* ── Executive hero ─────────────────────────────────────── */}
					<header className={styles.heroBanner}>
						<div className={styles.heroOrbOne} aria-hidden="true" />
						<div className={styles.heroOrbTwo} aria-hidden="true" />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi-bank2" aria-hidden="true" /> Payment Rails
										&amp; Routing
									</span>
									<span className={styles.livePill}>
										<span className={styles.liveDot} aria-hidden="true" />{" "}
										{healthyRails} rails live
									</span>
								</div>
								<h1>Routing control tower for every payment rail.</h1>
								<p>
									Monitor bank connections, steer intelligent routing rules and
									keep nostro liquidity balanced across PesaLink, RTGS, ACH,
									SWIFT and card-to-bank — with automated health checks and AI
									routing advice.
								</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimary}
										onClick={() => go("healthCheckModal")}
									>
										<i className="bi-heart-pulse" aria-hidden="true" /> Run rail
										health check
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => go("addBankModal")}
									>
										<i className="bi-plus-circle" aria-hidden="true" /> Add bank
										connection
									</button>
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="Rail network snapshot"
							>
								<span>Network snapshot</span>
								<strong>{c.hero.monthlyVolume}</strong>
								<p>
									Monthly volume routed across {c.hero.railsConfigured} rail
									configurations · {c.hero.successRate} success
								</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>{c.hero.activeBanks} banks</strong>
										<span>Connected</span>
									</div>
									<div>
										<strong>{c.healthCheck.issues} issue</strong>
										<span>Needs attention</span>
									</div>
									<div>
										<strong>{c.hero.successRate}</strong>
										<span>SLA success</span>
									</div>
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
								<strong>Live rail service is unreachable.</strong>
								<small style={{ color: "#b42318" }}>
									Showing the last cached control-tower snapshot — actions are
									queued locally.
								</small>
							</div>
						</div>
					)}

					{swiftRail && !swiftRail.enabled && (
						<output className={styles.statusNotice}>
							<i className="bi-shield-exclamation" aria-hidden="true" />
							<div>
								<strong>{swiftRail.statusNote}.</strong>
								<small>
									International USD routing is paused until credentials are
									rotated and the channel re-enabled.
								</small>
							</div>
							<button
								type="button"
								className={styles.textButton}
								onClick={() => openRailConfig("swift")}
							>
								Review rail <i className="bi-arrow-right" aria-hidden="true" />
							</button>
						</output>
					)}

					{/* ── KPI row ────────────────────────────────────────────── */}
					<section
						className={styles.dashboardSection}
						aria-label="Rail operations metrics"
					>
						<div className={styles.kpiGrid}>
							<KpiCard
								icon="bi-train-front"
								iconCls={styles.iconGreen}
								label="Active payment rails"
								meta="Live channels"
								value={`${healthyRails} / ${c.rails.length}`}
								foot={`${c.stats.activeRails} · cutoffs in EAT`}
							/>
							<KpiCard
								icon="bi-bank2"
								iconCls={styles.iconBlue}
								label="Connected banks"
								meta="Counterparties"
								value={`${activeBankCount} / ${c.banks.length}`}
								foot={
									degradedBank
										? `${degradedBank.name} degraded${pausedBank ? ` · ${pausedBank.name} paused` : ""}`
										: "All banks healthy"
								}
							/>
							<KpiCard
								icon="bi-graph-down-arrow"
								iconCls={styles.iconViolet}
								label="Monthly rail cost"
								meta="All banks & rails"
								value={c.stats.monthlyCost}
								foot="12% lower vs last quarter after ACH batching"
							/>
							<KpiCard
								icon="bi-bell"
								iconCls={styles.iconAmber}
								label="Needs attention"
								meta="Open items"
								value={String(c.stats.attentionCount)}
								foot={`Last health scan ${c.healthCheck.lastRun.toLowerCase()}`}
							/>
						</div>
					</section>

					{/* ── Section 01 — Queues ────────────────────────────────── */}

					{/* ── Section 02 — Banks directory ──────────────────────── */}
					<section
						className={styles.dashboardSection}
						id="rails-banks"
						aria-labelledby="rails-sec-banks"
					>
						<SectionHeading
							index="02"
							id="rails-sec-banks"
							title="Connected banks directory"
							description="Every counterparty bank, the rails it is wired to, live health and latency. Drill into a bank for its health history."
						/>
						<div className={styles.card}>
							<div className={styles.toolbar}>
								<div className={styles.searchBox}>
									<i className="bi-search" aria-hidden="true" />
									<label htmlFor="rails-bank-search" className={styles.srOnly}>
										Search banks
									</label>
									<input
										id="rails-bank-search"
										type="search"
										placeholder="Search banks or rails…"
										value={bankQuery}
										onChange={(e) => setBankQuery(e.target.value)}
									/>
								</div>
								<div className={styles.toolbarTools}>
									<div
										className={styles.chipRow}
										role="toolbar"
										aria-label="Filter banks by status"
									>
										{(["all", "active", "degraded", "paused"] as const).map(
											(f) => (
												<button
													type="button"
													key={f}
													className={cx(
														styles.chip,
														bankFilter === f && styles.chipActive,
													)}
													onClick={() => setBankFilter(f)}
													aria-pressed={bankFilter === f}
												>
													{f === "all" ? "All banks" : bankStatusMeta[f].label}
												</button>
											),
										)}
									</div>
									<button
										type="button"
										className={styles.btn}
										onClick={() => go("healthCheckModal")}
									>
										<i className="bi-heart-pulse" aria-hidden="true" /> Health
										check
									</button>
									<button
										type="button"
										className={cx(styles.btn, styles.btnPrimary)}
										onClick={() => go("addBankModal")}
									>
										<i className="bi-plus-lg" aria-hidden="true" /> Add bank
									</button>
								</div>
							</div>
							<div className={styles.tableWrap}>
								<table className={styles.table}>
									<caption className={styles.srOnly}>
										{filteredBanks.length} of {c.banks.length} connected banks
									</caption>
									<thead>
										<tr>
											<th scope="col">Bank</th>
											<th scope="col">Rails enabled</th>
											<th scope="col">Currencies</th>
											<th scope="col">Status</th>
											<th scope="col">Health</th>
											<th scope="col">Latency</th>
											<th scope="col">Monthly cost</th>
											<th scope="col">
												<span className={styles.srOnly}>Actions</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredBanks.map((bank) => {
											const meta = bankStatusMeta[bank.status];
											return (
												<tr key={bank.id}>
													<td>
														<div className={styles.bankCell}>
															<span
																className={styles.bankMark}
																aria-hidden="true"
															>
																<i className="bi-bank" />
															</span>
															<div>
																<strong>{bank.name}</strong>
																<div className={styles.actionSub}>
																	{bank.shortName}
																</div>
															</div>
														</div>
													</td>
													<td>
														{bank.rails.map((rail) => (
															<span
																key={rail}
																className={cx(
																	styles.badge,
																	styles.badgeNeutral,
																)}
																style={{ marginRight: 4 }}
															>
																{rail}
															</span>
														))}
													</td>
													<td>{bank.currencies.join(", ")}</td>
													<td>
														<span className={cx(styles.badge, meta.badge)}>
															{meta.label}
														</span>
													</td>
													<td>
														{bank.status === "paused" ? (
															<span className={styles.actionSub}>
																— paused —
															</span>
														) : (
															<span
																style={{
																	display: "inline-flex",
																	alignItems: "center",
																	gap: 8,
																}}
															>
																<span
																	style={{
																		width: 64,
																		height: 6,
																		borderRadius: 99,
																		background: "#e9edf2",
																		overflow: "hidden",
																		display: "inline-block",
																	}}
																>
																	<span
																		style={{
																			display: "block",
																			height: "100%",
																			width: `${bank.health}%`,
																			borderRadius: 99,
																			background:
																				bank.health >= 95
																					? "var(--pr-green)"
																					: "var(--pr-warning)",
																		}}
																	/>
																</span>
																<strong style={{ fontSize: "0.72rem" }}>
																	{bank.health}%
																</strong>
															</span>
														)}
													</td>
													<td>
														{bank.status === "paused"
															? "—"
															: `${bank.latencyMs}ms`}
													</td>
													<td>KES {bank.monthlyCost.toLocaleString()}</td>
													<td>
														<button
															type="button"
															className={styles.textButton}
															onClick={() => openBankHealth(bank.name)}
														>
															Details{" "}
															<i
																className="bi-arrow-right"
																aria-hidden="true"
															/>
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{!filteredBanks.length && (
									<div className={styles.emptyState}>
										<i className="bi-bank2" aria-hidden="true" />
										No banks match this search or filter.
									</div>
								)}
							</div>
						</div>
					</section>

					{/* ── Section 03 — Routing rules & rail config ──────────── */}
					<section
						className={styles.dashboardSection}
						id="rails-routing"
						aria-labelledby="rails-sec-routing"
					>
						<SectionHeading
							index="03"
							id="rails-sec-routing"
							title="Routing rules & rail configuration"
							description="Priority order the routing engine evaluates, plus live configuration for each rail — cutoffs, cost, SLA and credentials."
						/>
						<div className={styles.card}>
							<div className={styles.toolbar}>
								<div
									className={styles.chipRow}
									role="tablist"
									aria-label="Routing view"
								>
									<button
										type="button"
										role="tab"
										aria-selected={railView === "rules"}
										className={cx(
											styles.chip,
											railView === "rules" && styles.chipActive,
										)}
										onClick={() => setRailView("rules")}
									>
										<i className="bi-signpost-split" aria-hidden="true" />{" "}
										Routing rules
									</button>
									<button
										type="button"
										role="tab"
										aria-selected={railView === "rails"}
										className={cx(
											styles.chip,
											railView === "rails" && styles.chipActive,
										)}
										onClick={() => setRailView("rails")}
									>
										<i className="bi-train-front" aria-hidden="true" /> Rail
										config
									</button>
								</div>
								<div className={styles.toolbarTools}>
									{railView === "rules" ? (
										<>
											<button
												type="button"
												className={styles.btn}
												onClick={() => go("abTestModal")}
											>
												<i className="bi-bar-chart" aria-hidden="true" /> A/B
												test
											</button>
											<button
												type="button"
												className={cx(styles.btn, styles.btnPrimary)}
												onClick={() => go("routingRulesModal")}
											>
												<i className="bi-pencil-square" aria-hidden="true" />{" "}
												Edit rules
											</button>
										</>
									) : (
										<button
											type="button"
											className={cx(styles.btn, styles.btnPrimary)}
											onClick={() => go("railConfigModal")}
										>
											<i className="bi-gear" aria-hidden="true" /> Configure
											rails
										</button>
									)}
								</div>
							</div>

							{railView === "rules" ? (
								<div>
									{c.routingRules.map((rule) => (
										<div className={styles.ruleRow} key={rule.id}>
											<span className={styles.priorityBadge} aria-hidden="true">
												{rule.priority}
											</span>
											<div className={styles.ruleBody}>
												<div className={styles.ruleTitle}>
													{rule.name}
													<span
														className={cx(
															styles.badge,
															rule.status === "active"
																? styles.badgeSuccess
																: styles.badgeNeutral,
														)}
													>
														{rule.status === "active" ? "Active" : "Paused"}
													</span>
													<span className={cx(styles.badge, styles.badgeInfo)}>
														{rule.trafficShare}% traffic
													</span>
												</div>
												<div className={styles.ruleSub}>
													If {rule.condition} → route via{" "}
													<span className={styles.railTag}>
														<i
															className="bi-lightning-charge"
															aria-hidden="true"
														/>{" "}
														{rule.preferredRail}
													</span>
													{" · "}
													{rule.monthlyVolume} / month
												</div>
											</div>
											<button
												type="button"
												className={styles.textButton}
												onClick={() => go("routingRulesModal")}
											>
												Edit{" "}
												<i className="bi-chevron-right" aria-hidden="true" />
											</button>
										</div>
									))}
								</div>
							) : (
								<div className={styles.tableWrap}>
									<table className={styles.table}>
										<caption className={styles.srOnly}>
											Rail connection configuration
										</caption>
										<thead>
											<tr>
												<th scope="col">Rail</th>
												<th scope="col">Type</th>
												<th scope="col">Status</th>
												<th scope="col">Cutoff</th>
												<th scope="col">Cost / tx</th>
												<th scope="col">SLA</th>
												<th scope="col">Failure rate</th>
												<th scope="col">
													<span className={styles.srOnly}>Actions</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{c.rails.map((rail) => {
												const rs = railStatusOf(rail);
												const meta = railStatusMeta[rs];
												return (
													<tr key={rail.id}>
														<td>
															<strong style={{ color: "var(--pr-ink)" }}>
																<i
																	className="bi-train-front"
																	style={{
																		color: "var(--pr-green-dark)",
																		marginRight: 6,
																	}}
																	aria-hidden="true"
																/>
																{rail.rail}
															</strong>
															<div className={styles.actionSub}>
																{rail.limit}
															</div>
														</td>
														<td>{rail.type}</td>
														<td>
															<span className={cx(styles.badge, meta.badge)}>
																<i className={meta.dot} aria-hidden="true" />{" "}
																{meta.label}
															</span>
														</td>
														<td>{rail.cutoff}</td>
														<td>KES {rail.costPerTx.toLocaleString()}</td>
														<td>
															≤{" "}
															{rail.slaMinutes < 60
																? `${rail.slaMinutes} min`
																: `${Math.round(rail.slaMinutes / 60)} hr`}
														</td>
														<td>
															<span
																style={{
																	color:
																		rail.failureRate >= 2
																			? "var(--pr-danger)"
																			: "var(--pr-ink-soft)",
																	fontWeight: 650,
																}}
															>
																{rail.failureRate}%
															</span>
														</td>
														<td>
															<button
																type="button"
																className={styles.textButton}
																onClick={() => openRailConfig(rail.id)}
															>
																Configure{" "}
																<i
																	className="bi-chevron-right"
																	aria-hidden="true"
																/>
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</section>

					{/* ── Section 04 — Rail performance ─────────────────────── */}
					<section
						className={styles.dashboardSection}
						id="rails-performance"
						aria-labelledby="rails-sec-perf"
					>
						<SectionHeading
							index="04"
							id="rails-sec-perf"
							title="Rail performance analytics"
							description="Uptime against SLA, throughput and latency for the last 30 days. Open the full report for trends and breach history."
						/>
						<div className={styles.perfGrid}>
							{c.performance.map((perf) => {
								const meetsSla = perf.uptime >= perf.slaTarget;
								return (
									<div className={styles.perfCard} key={perf.id}>
										<div className={styles.perfHead}>
											<span className={styles.perfName}>
												<i className="bi-speedometer2" aria-hidden="true" />{" "}
												{perf.rail}
											</span>
											<span
												className={cx(
													styles.badge,
													meetsSla ? styles.badgeSuccess : styles.badgeWarn,
												)}
											>
												{meetsSla ? "Within SLA" : "SLA watch"}
											</span>
										</div>
										<div
											className={cx(styles.perfBar, !meetsSla && styles.warn)}
										>
											<span
												style={{ width: `${Math.min(perf.uptime, 100)}%` }}
											/>
										</div>
										<div className={styles.perfStats}>
											<div>
												<span>Uptime</span>
												<strong>{perf.uptime}%</strong>
											</div>
											<div>
												<span>Volume</span>
												<strong>{perf.txs}</strong>
											</div>
											<div>
												<span>Avg latency</span>
												<strong>{perf.avgLatency}</strong>
											</div>
										</div>
									</div>
								);
							})}
						</div>
						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								marginTop: "0.9rem",
							}}
						>
							<button
								type="button"
								className={cx(styles.btn, styles.btnPrimary)}
								onClick={() => go("performanceModal")}
							>
								<i className="bi-file-earmark-bar-graph" aria-hidden="true" />{" "}
								View full performance report
							</button>
						</div>
					</section>

					{/* ── Section 05 — Nostro / vostro ──────────────────────── */}
					<section
						className={styles.dashboardSection}
						id="rails-nostro"
						aria-labelledby="rails-sec-nostro"
					>
						<SectionHeading
							index="05"
							id="rails-sec-nostro"
							title="Nostro & vostro liquidity"
							description="Correspondent account balances and utilization across currencies. Rebalance before utilization breaches the 80% threshold."
						/>
						<div
							className={styles.queueGrid}
							style={{
								gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, 0.65fr)",
							}}
						>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>
											Correspondent accounts
										</span>
										<h3>
											<i className="bi-wallet2" aria-hidden="true" /> Nostro
											&amp; vostro positions
										</h3>
									</div>
								</div>
								{c.nostro.map((account) => {
									const meta = nostroStatusMeta[account.status];
									return (
										<div className={styles.nostroRow} key={account.id}>
											<span
												className={cx(styles.actionIcon, styles.iconViolet)}
											>
												<i className="bi-cash-stack" aria-hidden="true" />
											</span>
											<div className={styles.nostroBody}>
												<div className={styles.nostroName}>
													{account.accountName}{" "}
													<span
														className={cx(styles.badge, meta.badge)}
														style={{ marginLeft: 6 }}
													>
														{meta.label}
													</span>
												</div>
												<div className={styles.nostroBank}>
													{account.bank} · {account.currency} · utilization{" "}
													{account.utilization}%
												</div>
												<div
													style={{
														marginTop: 6,
														height: 5,
														maxWidth: 320,
														borderRadius: 99,
														background: "#e9edf2",
														overflow: "hidden",
													}}
												>
													<span
														style={{
															display: "block",
															height: "100%",
															width: `${account.utilization}%`,
															borderRadius: 99,
															background:
																account.utilization >= 80
																	? "var(--pr-warning)"
																	: "var(--pr-green)",
														}}
													/>
												</div>
											</div>
											<div className={styles.nostroBalance}>
												{account.balance}
											</div>
										</div>
									);
								})}
							</div>
							<div className={styles.card}>
								<div className={styles.cardHead}>
									<div>
										<span className={styles.cardKicker}>Liquidity actions</span>
										<h3>
											<i className="bi-cash-coin" aria-hidden="true" /> Treasury
											tools
										</h3>
										<p>Keep every currency funded and reconciled.</p>
									</div>
								</div>
								<div className={styles.qaGrid}>
									<button
										type="button"
										className={styles.qaBtn}
										onClick={() => go("fxRebalanceModal")}
									>
										<i className="bi-cash-coin" aria-hidden="true" /> FX
										rebalance
										<small>Move funds between nostro accounts</small>
									</button>
									<button
										type="button"
										className={styles.qaBtn}
										onClick={() => go("nostroModal")}
									>
										<i className="bi-wallet2" aria-hidden="true" /> Manage
										accounts
										<small>View & edit correspondent accounts</small>
									</button>
									<button
										type="button"
										className={styles.qaBtn}
										onClick={() => go("reconcileModal")}
									>
										<i className="bi-clipboard2-check" aria-hidden="true" />{" "}
										Reconcile
										<small>Match nostro balances to statements</small>
									</button>
									<button
										type="button"
										className={styles.qaBtn}
										onClick={() => go("exportReportModal")}
									>
										<i
											className="bi-file-earmark-spreadsheet"
											aria-hidden="true"
										/>{" "}
										Export report
										<small>Download liquidity position</small>
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* ── Section 06 — Audit trail ──────────────────────────── */}
					<section
						className={styles.dashboardSection}
						id="rails-audit"
						aria-labelledby="rails-sec-audit"
					>
						<SectionHeading
							index="06"
							id="rails-sec-audit"
							title="Configuration audit trail"
							description="Every routing change, credential rotation and automated action is logged for compliance."
						/>
						<div className={styles.card}>
							<div className={styles.cardHead}>
								<div>
									<span className={styles.cardKicker}>Compliance</span>
									<h3>
										<i className="bi-journal-text" aria-hidden="true" /> Recent
										activity
									</h3>
								</div>
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									onClick={() => go("auditLogModal")}
								>
									<i className="bi-list-ul" aria-hidden="true" /> View full
									audit log
								</button>
							</div>
							<div className={styles.tableWrap}>
								<table className={styles.table}>
									<thead>
										<tr>
											<th scope="col">Action</th>
											<th scope="col">Rail / bank</th>
											<th scope="col">Actor</th>
											<th scope="col">Timestamp</th>
										</tr>
									</thead>
									<tbody>
										{c.auditTrail.map((entry) => (
											<tr key={entry.id}>
												<td style={{ whiteSpace: "normal" }}>
													<i
														className="bi-journal-check"
														style={{
															color: "var(--pr-green-dark)",
															marginRight: 8,
														}}
														aria-hidden="true"
													/>
													{entry.action}
												</td>
												<td>
													<span
														className={cx(styles.badge, styles.badgeNeutral)}
													>
														{entry.rail}
													</span>
												</td>
												<td>{entry.user}</td>
												<td style={{ color: "var(--pr-muted)" }}>
													{entry.timestamp}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>

					{/* ── Footer ────────────────────────────────────────────── */}
					<footer className={styles.pageFooter}>
						<span>
							<i className="bi-shield-lock" aria-hidden="true" /> PayMo Business
							· Payment rails workspace
						</span>
						<nav aria-label="Workspace sections">
							<button
								type="button"
								className={styles.textButton}
								onClick={() => scrollTo("rails-banks")}
							>
								Banks
							</button>
							<button
								type="button"
								className={styles.textButton}
								onClick={() => scrollTo("rails-routing")}
							>
								Routing
							</button>
							<button
								type="button"
								className={styles.textButton}
								onClick={() => scrollTo("rails-performance")}
							>
								Performance
							</button>
							<button
								type="button"
								className={styles.textButton}
								onClick={() => scrollTo("rails-nostro")}
							>
								Nostro
							</button>
						</nav>
					</footer>
				</div>
			</main>

			{/* ── Floating command bar ─────────────────────────────────── */}
			<div
				className={styles.floatingBar}
				role="toolbar"
				aria-label="Rail quick actions"
			>
				<button
					type="button"
					className={styles.floatingPrimary}
					onClick={() => go("addBankModal")}
				>
					<i className="bi-plus-lg" aria-hidden="true" /> Add bank
				</button>
				<button type="button" onClick={() => go("healthCheckModal")}>
					<i className="bi-heart-pulse" aria-hidden="true" /> Health check
				</button>
				<button type="button" onClick={() => go("routingRulesModal")}>
					<i className="bi-signpost-split" aria-hidden="true" /> Routing
				</button>
				<button type="button" onClick={() => go("exportReportModal")}>
					<i className="bi-file-earmark-spreadsheet" aria-hidden="true" />{" "}
					Export
				</button>
				<button type="button" onClick={() => go("reconcileModal")}>
					<i className="bi-clipboard2-check" aria-hidden="true" /> Reconcile
				</button>
			</div>

			{/* ── Toasts ───────────────────────────────────────────────── */}
			<div className={styles.toastStack} aria-live="polite" aria-atomic="false">
				{toasts.map((toast) => (
					<output
						key={toast.id}
						className={cx(
							styles.toast,
							toast.variant === "danger" && styles.toastDanger,
						)}
					>
						<i
							className={`bi ${toast.variant === "danger" ? "bi-x-circle-fill" : "bi-check-circle-fill"}`}
							aria-hidden="true"
						/>
						<span>{toast.message}</span>
					</output>
				))}
			</div>

			<AttentionHubFab
				count={drawerAttention.length}
				hidden={drawerOpen}
				onClick={() => setDrawerOpen(true)}
			/>

			<AttentionDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onAction={handleDrawerAction}
				pageName="Payment rails"
				pageIcon="bi-diagram-3"
				attention={drawerAttention}
				suggestions={drawerSuggestions}
				quickActions={drawerQuickActions}
				description="Open operational items, AI routing recommendations and the actions treasury uses most — each opens the matching workflow."
			/>
			<PaymentRailsModals data={modalData} />
		</div>
	);
}

/* ── Local presentational helpers ─────────────────────────────────────── */

function KpiCard({
	icon,
	iconCls,
	label,
	meta,
	value,
	foot,
}: {
	icon: string;
	iconCls: string;
	label: string;
	meta: string;
	value: string;
	foot: string;
}) {
	return (
		<div className={cx(styles.card, styles.kpiCard)}>
			<span className={cx(styles.kpiIcon, iconCls)}>
				<i className={icon} aria-hidden="true" />
			</span>
			<div className={styles.kpiMeta}>
				<span>{label}</span>
				<small>{meta}</small>
			</div>
			<div className={styles.kpiValue}>{value}</div>
			<div className={styles.kpiFoot}>
				<span>
					<i className="bi-info-circle" aria-hidden="true" />
				</span>
				<span>{foot}</span>
			</div>
		</div>
	);
}

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
			<span className={styles.sectionIndex} aria-hidden="true">
				{index}
			</span>
			<div>
				<h2 id={id}>{title}</h2>
				<p>{description}</p>
			</div>
			{action ? <div className={styles.sectionAction}>{action}</div> : null}
		</div>
	);
}
