/* ============================================================================
 * PaymentRails.tsx — Page 1.4 "Payment Rails & Routing".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.4.html. The legacy vanilla renderBanks/renderRoutingRules/
 * renderRailConfigs/renderNostro innerHTML functions are replaced by typed
 * `initialMockData` arrays rendered with .map(). Data flows through TanStack
 * Query (fetchPaymentRails) with a bundled fallback; Bootstrap spinner + alert
 * cover loading/error. openM/closeM Bootstrap-JS modals → React state modals.
 * ========================================================================== */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cx } from "../../shell/data/shellData";
import s from "../../../shared/styles/appPage.module.css";
import {
	PaymentRailsModals,
	type PaymentRailsData,
} from "../components/PaymentRailsModals";
 
type Tone = "success" | "warn" | "danger" | "info" | "purple" | "neutral";
 
const toneBadge: Record<Tone, string> = {
	success: s.badgeSuccess,
	warn: s.badgeWarn,
	danger: s.badgeDanger,
	info: s.badgeInfo,
	purple: s.badgePurple,
	neutral: s.badgeOutline,
};
const toneIcon: Record<Tone, string> = {
	success: s.toneSuccess,
	warn: s.toneWarn,
	danger: s.toneDanger,
	info: s.toneInfo,
	purple: s.tonePurple,
	neutral: s.toneNeutral,
};
 
interface StatCard {
	label: string;
	value: string;
	badge: { text: string; icon: string; tone: Tone };
	sub: string;
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
	label: string;
	modal: string;
}
interface Bank {
	name: string;
	status: "active" | "paused";
	health: "healthy" | "degraded" | "paused";
	rails: string;
	settle: string;
	limit: string;
}
interface RoutingRule {
	name: string;
	amount: string;
	rail: string;
	fallback: string;
	priority: number;
	status: "Active" | "Paused";
}
interface RailConfig {
	name: string;
	enabled: boolean;
	cutoff: string;
	perTx: string;
}
interface Nostro {
	name: string;
	bank: string;
	balance: string;
	status: "Matched" | "Investigate";
}
interface PerfRow {
	rail: string;
	volume: string;
	success: string;
	avgTime: string;
	cost: string;
	tone: Tone;
}
interface AuditRow {
	time: string;
	actor: string;
	action: string;
	target: string;
}
 
export interface PaymentRailsContent extends PaymentRailsData {
	heroTitle: string;
	heroValue: string;
	heroSub: string;
	stats: StatCard[];
	attention: Row[];
	suggestions: Row[];
	quickActions: QuickAction[];
	banks: Bank[];
	routingRules: RoutingRule[];
	railConfigs: RailConfig[];
	nostro: Nostro[];
	performance: PerfRow[];
	audit: AuditRow[];
}
 
const initialMockData: PaymentRailsContent = {
	heroTitle: "Payment infrastructure live",
	heroValue: "18 banks connected",
	heroSub:
		"All major Kenyan & regional banks linked with real-time API health monitoring across 7 payment rails.",
	stats: [
		{
			label: "AVG SUCCESS RATE",
			value: "98.7%",
			badge: { text: "+1.2% MoM", icon: "bi-graph-up-arrow", tone: "success" },
			sub: "PesaLink 99.4% • RTGS 99.1%",
			labelTone: "success",
			edge: "success",
		},
		{
			label: "AVG SETTLEMENT TIME",
			value: "14m 32s",
			badge: { text: "-8% vs last month", icon: "bi-clock", tone: "info" },
			sub: "Instant rails 4.2s • ACH 2h 11m",
			labelTone: "info",
		},
		{
			label: "MONTHLY RAIL COST",
			value: "KES 184,200",
			badge: { text: "3 rails optimized", icon: "bi-currency-exchange", tone: "warn" },
			sub: "Potential savings: KES 31,400",
			labelTone: "warn",
			edge: "warn",
		},
	],
	attention: [
		{ icon: "bi-bank", tone: "danger", title: "Equity Bank API health degraded", sub: "Last sync: 47 min ago", action: "Investigate", modal: "bankHealthModal" },
		{ icon: "bi-exclamation-triangle", tone: "warn", title: "RTGS cut-off in 42 minutes", sub: "KES 12.4M queued for today", action: "Manage", modal: "railConfigModal" },
		{ icon: "bi-link-45deg", tone: "info", title: "SWIFT credential expires in 5 days", sub: "Certificate renewal required", action: "Renew", modal: "railConfigModal" },
	],
	suggestions: [
		{ icon: "bi-lightning-charge", tone: "warn", title: "Route KES 8.2M to PesaLink", sub: "Save KES 4,100 vs RTGS today", action: "Apply", modal: "routingRulesModal" },
		{ icon: "bi-graph-up", tone: "info", title: "A/B test new ACH rule", sub: "Projected 0.8% cost reduction", action: "Start Test", modal: "abTestModal" },
		{ icon: "bi-currency-exchange", tone: "warn", title: "Rebalance USD nostro position", sub: "Current FX exposure: +$142K", action: "Rebalance", modal: "nostroModal" },
	],
	quickActions: [
		{ icon: "bi-plus-circle", label: "Add Bank", modal: "addBankModal" },
		{ icon: "bi-diagram-3", label: "Routing Rules", modal: "routingRulesModal" },
		{ icon: "bi-gear", label: "Rail Config", modal: "railConfigModal" },
		{ icon: "bi-globe2", label: "Nostro", modal: "nostroModal" },
		{ icon: "bi-heart-pulse", label: "Rail Health", modal: "railHealthModal" },
		{ icon: "bi-bar-chart-line", label: "Performance", modal: "performanceModal" },
		{ icon: "bi-check2-square", label: "Reconcile", modal: "reconcileModal" },
		{ icon: "bi-download", label: "Export", modal: "exportReportModal" },
	],
	banks: [
		{ name: "Equity Bank", status: "active", health: "degraded", rails: "PesaLink, RTGS, ACH", settle: "09:00-16:00", limit: "KES 100M" },
		{ name: "KCB Bank", status: "active", health: "healthy", rails: "PesaLink, RTGS, ACH, Card", settle: "08:00-17:00", limit: "KES 200M" },
		{ name: "Co-operative Bank", status: "active", health: "healthy", rails: "PesaLink, RTGS, ACH", settle: "09:00-16:00", limit: "KES 150M" },
		{ name: "Absa Bank", status: "active", health: "healthy", rails: "PesaLink, RTGS, SWIFT", settle: "08:30-16:30", limit: "KES 250M" },
		{ name: "Stanbic Bank", status: "active", health: "healthy", rails: "PesaLink, RTGS, ACH, SWIFT", settle: "09:00-17:00", limit: "KES 300M" },
		{ name: "Family Bank", status: "paused", health: "paused", rails: "PesaLink, ACH", settle: "09:00-15:00", limit: "KES 50M" },
		{ name: "DTB Bank", status: "active", health: "healthy", rails: "PesaLink, RTGS, Card", settle: "08:00-16:00", limit: "KES 120M" },
		{ name: "I&M Bank", status: "active", health: "healthy", rails: "PesaLink, RTGS, ACH", settle: "09:00-16:00", limit: "KES 180M" },
	],
	routingRules: [
		{ name: "High-Value Instant", amount: "KES 1M–50M", rail: "PesaLink", fallback: "RTGS", priority: 1, status: "Active" },
		{ name: "Salary Batch", amount: "KES 500K+", rail: "ACH", fallback: "PesaLink", priority: 2, status: "Active" },
		{ name: "International USD", amount: "USD 10K+", rail: "SWIFT", fallback: "—", priority: 3, status: "Paused" },
		{ name: "Low-Value Fast", amount: "KES 1–100K", rail: "Card-to-Bank", fallback: "PesaLink", priority: 1, status: "Active" },
	],
	railConfigs: [
		{ name: "PesaLink Instant", enabled: true, cutoff: "16:00", perTx: "KES 100M" },
		{ name: "RTGS", enabled: true, cutoff: "15:30", perTx: "KES 500M" },
		{ name: "ACH", enabled: true, cutoff: "14:00", perTx: "KES 50M" },
		{ name: "SWIFT", enabled: false, cutoff: "12:00", perTx: "USD 1M" },
		{ name: "Card-to-Bank", enabled: true, cutoff: "23:59", perTx: "KES 500K" },
	],
	nostro: [
		{ name: "Nostro USD", bank: "Standard Chartered NY", balance: "$2,847,500", status: "Matched" },
		{ name: "Nostro EUR", bank: "Deutsche Bank Frankfurt", balance: "€1,204,800", status: "Matched" },
		{ name: "Nostro GBP", bank: "Barclays London", balance: "£892,400", status: "Investigate" },
		{ name: "Vostro KES", bank: "PayMo Settlement", balance: "KES 184.2M", status: "Matched" },
	],
	performance: [
		{ rail: "PesaLink", volume: "KES 1.24B", success: "99.4%", avgTime: "4.2s", cost: "KES 50/tx", tone: "success" },
		{ rail: "RTGS", volume: "KES 842M", success: "99.1%", avgTime: "42 min", cost: "KES 200/tx", tone: "success" },
		{ rail: "ACH", volume: "KES 318M", success: "98.2%", avgTime: "2h 11m", cost: "KES 15/tx", tone: "info" },
		{ rail: "SWIFT", volume: "USD 4.2M", success: "96.4%", avgTime: "4.2 hrs", cost: "USD 25/tx", tone: "warn" },
	],
	audit: [
		{ time: "27 Jun 10:42", actor: "j.mwangi", action: "Enabled rail", target: "Card-to-Bank" },
		{ time: "27 Jun 09:18", actor: "system", action: "Health check failed", target: "Equity Bank API" },
		{ time: "26 Jun 16:05", actor: "a.kamau", action: "Updated routing rule", target: "High-Value Instant" },
		{ time: "26 Jun 11:30", actor: "f.otieno", action: "Rebalanced nostro", target: "Nostro USD" },
	],
};
 
async function fetchPaymentRails(): Promise<PaymentRailsContent> {
	const res = await fetch("/api/payment-rails");
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as PaymentRailsContent;
}
 
const healthTone: Record<Bank["health"], Tone> = {
	healthy: "success",
	degraded: "warn",
	paused: "neutral",
};
 
export default function PaymentRails() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const openModal = (id: string) => setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) => setModalState((p) => ({ ...p, [id]: false }));
 
	const { data, error, isLoading } = useQuery({
		queryKey: ["paymo-payment-rails"],
		queryFn: fetchPaymentRails,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;
 
	return (
		<div className={s.pageRoot} style={{ position: "relative" }}>
			{isLoading && (
				<div className={s.qLoading} role="status" aria-live="polite">
					<div className="spinner-border" style={{ width: "3rem", height: "3rem" }} />
					<span>Loading payment rails…</span>
				</div>
			)}
			{error && (
				<div className={cx("alert alert-danger", s.qError)} role="alert">
					<strong>
						<i className="bi bi-exclamation-triangle me-2" />
						Rails data unavailable
					</strong>
					<div className="small mt-1">
						<code>/api/payment-rails</code> — {(error as Error).message}. Showing bundled
						sample data.
					</div>
				</div>
			)}
 
			<div className={s.stack}>
				<div className={s.pageBar}>
					<div>
						<div className={s.breadcrumb}>
							<Link to="/app">Home</Link> / <Link to="/app/transfers">Payments</Link> /{" "}
							<strong>Payment Rails &amp; Routing</strong>
						</div>
						<h1 className={s.pageTitle}>Payment Rails &amp; Routing</h1>
						<p className={s.pageCopy}>
							Connected banks, smart routing, rail performance, configuration &amp;
							nostro/vostro mapping.
						</p>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("healthCheckModal")}>
							<i className="bi bi-heart-pulse" /> Health Check
						</button>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("railConfigModal")}>
							<i className="bi bi-gear" /> Rail Config
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("addBankModal")}>
							<i className="bi bi-plus-lg" /> Add Bank
						</button>
					</div>
				</div>
 
				{/* hero + stats */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={cx(s.card, s.cardAccent)} style={{ minHeight: 180 }}>
							<p style={{ margin: 0, fontSize: 13 }}>
								{c.heroTitle} <span style={{ color: "#86efac" }}>●</span>
							</p>
							<div className={s.statValue} style={{ margin: "10px 0" }}>
								{c.heroValue}
							</div>
							<p style={{ margin: 0, fontSize: 13 }}>{c.heroSub}</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("railConfigModal")}>
									Rails
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("routingRulesModal")}>
									Rules
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("nostroModal")}>
									Nostro
								</button>
							</div>
						</div>
					</div>
					{c.stats.map((stat) => (
						<div className="col-lg-4 col-md-6" key={stat.label}>
							<div className={cx(s.card, stat.edge === "warn" && s.cardWarnEdge, stat.edge === "success" && s.cardAccentEdge)} style={{ minHeight: 180 }}>
								<p className={s.statLabel}>{stat.label}</p>
								<div className={s.statValue}>{stat.value}</div>
								<span className={cx(s.badge, toneBadge[stat.badge.tone])}>
									<i className={cx("bi", stat.badge.icon)} /> {stat.badge.text}
								</span>
								<div className={s.statSub}>{stat.sub}</div>
							</div>
						</div>
					))}
				</div>
 
				{/* attention / suggestions / quick actions */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Attention Required</h3>
								<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("attentionModal")}>
									View all
								</button>
							</div>
							{c.attention.map((item) => (
								<div className={s.rowItem} key={item.title}>
									<div className={s.rowLead}>
										<div className={cx(s.rowIcon, toneIcon[item.tone])}>
											<i className={cx("bi", item.icon)} />
										</div>
										<div>
											<div className={s.rowTitle}>{item.title}</div>
											<div className={s.rowSub}>{item.sub}</div>
										</div>
									</div>
									<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(item.modal)}>
										{item.action}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>Smart Suggestions</h3>
								<span className={cx(s.badge, s.badgePurple)}>
									<i className="bi bi-stars" /> AI
								</span>
							</div>
							{c.suggestions.map((item) => (
								<div className={s.rowItem} key={item.title}>
									<div className={s.rowLead}>
										<div className={cx(s.rowIcon, toneIcon[item.tone])}>
											<i className={cx("bi", item.icon)} />
										</div>
										<div>
											<div className={s.rowTitle}>{item.title}</div>
											<div className={s.rowSub}>{item.sub}</div>
										</div>
									</div>
									<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(item.modal)}>
										{item.action}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
							<div style={{ marginBottom: 16 }}>
								<h3 className={s.sectionTitle}>Quick Actions</h3>
								<p className={s.sectionSub}>Rail &amp; routing workflows</p>
							</div>
							<div className={s.quickGrid}>
								{c.quickActions.map((qa) => (
									<button type="button" className={s.quickBtn} key={qa.label} onClick={() => openModal(qa.modal)}>
										<i className={cx("bi", qa.icon)} />
										{qa.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
 
				{/* 1.4.1 connected banks */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-bank2" /> Connected Banks Directory
							</h3>
							<p className={s.sectionSub}>Real-time API health, supported rails, settlement windows and limits.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("addBankModal")}>
								<i className="bi bi-plus-lg" /> Add Bank
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("bankHealthModal")}>
								<i className="bi bi-heart-pulse" /> Health
							</button>
						</div>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Bank</th>
									<th>Status</th>
									<th>Health</th>
									<th>Rails</th>
									<th>Settlement</th>
									<th>Limit</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{c.banks.map((b) => (
									<tr key={b.name}>
										<td>
											<strong>{b.name}</strong>
										</td>
										<td>
											<span className={cx(s.badge, b.status === "active" ? s.badgeSuccess : s.badgeOutline)}>
												{b.status === "active" ? "Active" : "Paused"}
											</span>
										</td>
										<td>
											<span className={cx(s.badge, toneBadge[healthTone[b.health]])}>
												{b.health.charAt(0).toUpperCase() + b.health.slice(1)}
											</span>
										</td>
										<td>
											<small>{b.rails}</small>
										</td>
										<td>
											<small>{b.settle}</small>
										</td>
										<td>
											<strong>{b.limit}</strong>
										</td>
										<td>
											<div className="d-flex" style={{ gap: 4 }}>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("bankHealthModal")} aria-label="Bank health">
													<i className="bi bi-heart-pulse" />
												</button>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("railConfigModal")} aria-label="Configure">
													<i className="bi bi-gear" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
 
				{/* 1.4.2 routing rules + 1.4.4 rail config */}
				<div className="row g-3">
					<div className="col-lg-6">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>
									<i className="bi bi-diagram-3" style={{ color: "var(--acc)" }} /> Routing Rules Engine
								</h3>
								<div className="d-flex" style={{ gap: 8 }}>
									<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("routingRulesModal")}>
										<i className="bi bi-plus-lg" /> New Rule
									</button>
									<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("abTestModal")}>
										<i className="bi bi-graph-up" /> A/B Test
									</button>
								</div>
							</div>
							{c.routingRules.map((r) => (
								<div className={s.rowItem} key={r.name}>
									<div>
										<div className={s.rowTitle}>
											{r.name} <span className={cx(s.badge, s.badgeOutline)}>P{r.priority}</span>
										</div>
										<div className={s.rowSub}>
											{r.amount} → {r.rail} (fallback: {r.fallback})
										</div>
									</div>
									<span className={cx(s.badge, r.status === "Active" ? s.badgeSuccess : s.badgeWarn)}>{r.status}</span>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-6">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>
									<i className="bi bi-gear-fill" style={{ color: "var(--warning)" }} /> Rail Configuration
								</h3>
								<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("railConfigModal")}>
									<i className="bi bi-gear" /> Manage Rails
								</button>
							</div>
							{c.railConfigs.map((r) => (
								<div className={s.rowItem} key={r.name}>
									<div>
										<div className={s.rowTitle}>{r.name}</div>
										<div className={s.rowSub}>
											Cutoff: {r.cutoff} · Per Tx: {r.perTx}
										</div>
									</div>
									<div className="d-flex align-items-center" style={{ gap: 8 }}>
										<span className={cx(s.badge, r.enabled ? s.badgeSuccess : s.badgeOutline)}>
											{r.enabled ? "Enabled" : "Disabled"}
										</span>
										<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("railConfigModal")} aria-label="Configure rail">
											<i className="bi bi-gear" />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
 
				{/* 1.4.3 rail performance */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-bar-chart-line" style={{ color: "var(--info)" }} /> Rail Performance Analytics
							</h3>
							<p className={s.sectionSub}>Volume, success rate, average settlement time and cost per rail.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("performanceModal")}>
								<i className="bi bi-graph-up-arrow" /> Full Analytics
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("exportReportModal")}>
								<i className="bi bi-download" /> Export
							</button>
						</div>
					</div>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Rail</th>
									<th>Volume (30d)</th>
									<th>Success</th>
									<th>Avg Time</th>
									<th>Cost</th>
								</tr>
							</thead>
							<tbody>
								{c.performance.map((p) => (
									<tr key={p.rail}>
										<td>
											<strong>{p.rail}</strong>
										</td>
										<td>{p.volume}</td>
										<td>
											<span className={cx(s.badge, toneBadge[p.tone])}>{p.success}</span>
										</td>
										<td>{p.avgTime}</td>
										<td>{p.cost}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
 
				{/* 1.4.5 nostro + 1.4.6 audit */}
				<div className="row g-3">
					<div className="col-lg-5">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>
									<i className="bi bi-globe2" /> Nostro / Vostro Accounts
								</h3>
								<div className="d-flex" style={{ gap: 8 }}>
									<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("nostroModal")}>
										<i className="bi bi-plus-lg" /> Add
									</button>
									<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("fxRebalanceModal")}>
										<i className="bi bi-arrow-left-right" /> Rebalance
									</button>
								</div>
							</div>
							{c.nostro.map((n) => (
								<div className={s.rowItem} key={n.name}>
									<div>
										<div className={s.rowTitle}>{n.name}</div>
										<div className={s.rowSub}>{n.bank}</div>
									</div>
									<div className="text-end">
										<div className={s.rowAmount}>{n.balance}</div>
										<span className={cx(s.badge, n.status === "Matched" ? s.badgeSuccess : s.badgeWarn)}>{n.status}</span>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-7">
						<div className={s.card}>
							<div className={s.sectionHead}>
								<h3 className={s.sectionTitle}>
									<i className="bi bi-clock-history" style={{ color: "var(--ink-500)" }} /> Rail Audit &amp; Compliance Log
								</h3>
								<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("auditLogModal")}>
									<i className="bi bi-file-earmark-text" /> Full Log
								</button>
							</div>
							<div className={s.tableWrap}>
								<table className={s.table}>
									<thead>
										<tr>
											<th>Time</th>
											<th>Actor</th>
											<th>Action</th>
											<th>Target</th>
										</tr>
									</thead>
									<tbody>
										{c.audit.map((a) => (
											<tr key={`${a.time}-${a.action}`}>
												<td>{a.time}</td>
												<td>{a.actor}</td>
												<td>{a.action}</td>
												<td>{a.target}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
 
			<PaymentRailsModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={c}
			/>
		</div>
	);
}