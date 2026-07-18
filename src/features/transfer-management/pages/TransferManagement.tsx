/* ============================================================================
 * TransferManagement.tsx — Page 1.3 "Transfer Management".
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.3.html (single-file HTML/CSS/JS, ~2,700 LOC).
 *   - All repeating blocks (stats, attention/suggestions, tables, FX, limits…)
 *     are extracted into `initialMockData` and rendered with .map().
 *   - Data is loaded through TanStack Query (fetchTransferManagement) with a
 *     bundled fallback so the page never breaks; a Bootstrap spinner shows while
 *     loading and a Bootstrap alert surfaces query errors.
 *   - Legacy openM()/closeM() + Bootstrap-JS modals become React state driven
 *     modals (see TransferManagementModals).
 * ========================================================================== */
"use client";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cx } from "../../shell/data/shellData";
import s from "../../../shared/styles/appPage.module.css";
import {
	TransferManagementModals,
	type TransferManagementData,
} from "../components/TransferManagementModals";
 
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
			badge: { text: "+0.4% vs last month", icon: "bi-graph-up-arrow", tone: "success" },
			sub: "Domestic 99.1% • International 96.4%",
			labelTone: "info",
		},
		{
			label: "AVERAGE SETTLEMENT",
			value: "18s",
			badge: { text: "PesaLink instant", icon: "bi-lightning-charge", tone: "success" },
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
		{ icon: "bi-arrow-left-right", tone: "success", label: "Domestic Transfer", modal: "initiateTransferModal" },
		{ icon: "bi-globe", tone: "info", label: "International", modal: "internationalModal" },
		{ icon: "bi-calendar-event", tone: "success", label: "Schedule", modal: "scheduleTransferModal" },
		{ icon: "bi-arrow-repeat", tone: "purple", label: "Recurring", modal: "recurringModal" },
		{ icon: "bi-people", tone: "warn", label: "Beneficiaries", modal: "beneficiaryModal" },
		{ icon: "bi-collection", tone: "success", label: "Bulk Transfer", modal: "bulkTransferModal" },
		{ icon: "bi-check2-square", tone: "danger", label: "Approvals", modal: "approvalQueueModal" },
		{ icon: "bi-clock-history", tone: "neutral", label: "History", modal: "transferHistoryModal" },
	],
	domestic: [
		{ date: "27 Jun", beneficiary: "Grace Wanjiku", bank: "Equity Bank", amount: "KES 85,000", method: "PesaLink", status: "Instant", statusTone: "success", action: { label: "Receipt", modal: "transferReceiptModal" } },
		{ date: "27 Jun", beneficiary: "ABC Suppliers Ltd", bank: "KCB Bank", amount: "KES 420,000", method: "RTGS", status: "Processing", statusTone: "info", action: { label: "Track", modal: "trackTransferModal" } },
		{ date: "26 Jun", beneficiary: "James Otieno", bank: "Co-op Bank", amount: "KES 12,500", method: "EFT", status: "Completed", statusTone: "success", action: { label: "Receipt", modal: "transferReceiptModal" } },
		{ date: "26 Jun", beneficiary: "Property Management", bank: "NCBA", amount: "KES 185,000", method: "PesaLink", status: "Instant", statusTone: "success", action: { label: "Receipt", modal: "transferReceiptModal" } },
	],
	bankStatus: [
		{ name: "Equity Bank", rails: "PesaLink • RTGS • EFT", status: "Online", tone: "success" },
		{ name: "KCB Bank", rails: "PesaLink • RTGS • EFT", status: "Online", tone: "success" },
		{ name: "Co-op Bank", rails: "PesaLink • EFT", status: "Maintenance", tone: "warn" },
		{ name: "NCBA", rails: "PesaLink • RTGS", status: "Online", tone: "success" },
		{ name: "Family Bank", rails: "PesaLink only", status: "Online", tone: "success" },
	],
	intl: [
		{ date: "26 Jun", beneficiary: "Peter Ochieng", dest: "Uganda (UGX)", amount: "USD 2,500", fx: "1 USD = 3,680 UGX", method: "Wave", status: "Delivered", statusTone: "success", action: { label: "Receipt", modal: "intlReceiptModal" } },
		{ date: "25 Jun", beneficiary: "Tech Solutions Ltd", dest: "UK (GBP)", amount: "USD 18,400", fx: "1 USD = 0.78 GBP", method: "SWIFT", status: "In Transit", statusTone: "info", action: { label: "Track", modal: "trackIntlModal" } },
		{ date: "24 Jun", beneficiary: "Mary Njeri", dest: "Tanzania (TZS)", amount: "USD 850", fx: "1 USD = 2,680 TZS", method: "Remitly", status: "Delivered", statusTone: "success", action: { label: "Receipt", modal: "intlReceiptModal" } },
	],
	fxRates: [
		{ code: "USD", rate: "129.45", delta: "-0.12", up: false },
		{ code: "GBP", rate: "164.80", delta: "+0.45", up: true },
		{ code: "EUR", rate: "140.20", delta: "-0.08", up: false },
		{ code: "UGX", rate: "0.035", delta: "-0.001", up: false },
		{ code: "TZS", rate: "0.048", delta: "-0.002", up: false },
	],
	schedules: [
		{ name: "Monthly Rent", beneficiary: "Property Mgmt Ltd", amount: "KES 65,000", frequency: "Monthly", next: "01 Jul 2025", status: "Active", statusTone: "success", action: { label: "Edit", modal: "editRecurringModal" } },
		{ name: "Staff Salaries", beneficiary: "Payroll Run (42 staff)", amount: "KES 2.8M", frequency: "Monthly", next: "28 Jun 2025", status: "Approval Pending", statusTone: "warn", action: { label: "Approve", modal: "approvalQueueModal" } },
		{ name: "Internet Bill", beneficiary: "Safaricom Fibre", amount: "KES 5,999", frequency: "Monthly", next: "01 Jul 2025", status: "Active", statusTone: "success", action: { label: "Edit", modal: "editRecurringModal" } },
		{ name: "School Fees", beneficiary: "Strathmore University", amount: "KES 185,000", frequency: "Termly", next: "15 Aug 2025", status: "Active", statusTone: "success", action: { label: "Edit", modal: "editRecurringModal" } },
	],
	history: [
		{ date: "27 Jun", ref: "TRF-20250627-88341", beneficiary: "Grace Wanjiku", bank: "Equity Bank", amount: "KES 85,000", method: "PesaLink", status: "Success", statusTone: "success", action: { label: "View", modal: "transferReceiptModal" } },
		{ date: "27 Jun", ref: "TRF-20250627-88342", beneficiary: "ABC Suppliers Ltd", bank: "KCB Bank", amount: "KES 420,000", method: "RTGS", status: "Processing", statusTone: "info", action: { label: "Track", modal: "trackTransferModal" } },
		{ date: "26 Jun", ref: "TRF-20250626-77219", beneficiary: "Peter Ochieng", bank: "Wave (Uganda)", amount: "USD 2,500", method: "Wave", status: "Delivered", statusTone: "success", action: { label: "View", modal: "intlReceiptModal" } },
		{ date: "26 Jun", ref: "TRF-20250626-77220", beneficiary: "James Otieno", bank: "Co-op Bank", amount: "KES 12,500", method: "EFT", status: "Success", statusTone: "success", action: { label: "View", modal: "transferReceiptModal" } },
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
 
const softTone: Record<Tone, string> = {
	success: s.softBoxSuccess,
	warn: s.softBoxWarn,
	danger: s.softBoxDanger,
	info: s.softBoxInfo,
	purple: s.softBoxPurple,
	neutral: s.softBox,
};
 
export default function TransferManagement() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const openModal = (id: string) => setModalState((p) => ({ ...p, [id]: true }));
	const closeModal = (id: string) => setModalState((p) => ({ ...p, [id]: false }));
 
	const { data, error, isLoading } = useQuery({
		queryKey: ["paymo-transfer-management"],
		queryFn: fetchTransferManagement,
		staleTime: 60_000,
		retry: 1,
	});
	const c = data ?? initialMockData;
 
	return (
		<div className={s.pageRoot} style={{ position: "relative" }}>
			{isLoading && (
				<div className={s.qLoading} role="status" aria-live="polite">
					<div className="spinner-border" style={{ width: "3rem", height: "3rem" }} />
					<span>Loading transfer management…</span>
				</div>
			)}
			{error && (
				<div className={cx("alert alert-danger", s.qError)} role="alert">
					<strong>
						<i className="bi bi-exclamation-triangle me-2" />
						Transfer data unavailable
					</strong>
					<div className="small mt-1">
						<code>/api/transfer-management</code> — {(error as Error).message}. Showing
						bundled sample data.
					</div>
				</div>
			)}
 
			<div className={s.stack}>
				{/* page bar */}
				<div className={s.pageBar}>
					<div>
						<div className={s.breadcrumb}>
							<Link to="/app">Home</Link> / <Link to="/app/transfers">Transactions</Link> /{" "}
							<strong>Transfer Management</strong>
						</div>
						<h1 className={s.pageTitle}>Transfer Management</h1>
						<p className={s.pageCopy}>
							Domestic, international, scheduled, recurring &amp; compliance-controlled
							bank transfers.
						</p>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("transferHealthModal")}>
							<i className="bi bi-heart-pulse" /> Health Check
						</button>
						<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("bulkTransferModal")}>
							<i className="bi bi-collection" /> Bulk Transfer
						</button>
						<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("initiateTransferModal")}>
							<i className="bi bi-plus-lg" /> New Transfer
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
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("initiateTransferModal")}>
									New Transfer
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("scheduleTransferModal")}>
									Schedule
								</button>
								<button type="button" className={cx(s.btn, s.btnSm, s.btnGlassOnAccent)} onClick={() => openModal("bulkTransferModal")}>
									Bulk
								</button>
							</div>
						</div>
					</div>
					{c.stats.map((stat) => (
						<div className="col-lg-4 col-md-6" key={stat.label}>
							<div className={cx(s.card, stat.edge === "warn" && s.cardWarnEdge, stat.edge === "success" && s.cardAccentEdge)} style={{ minHeight: 180 }}>
								<p className={s.statLabel}>{stat.label}</p>
								<div className={s.statValue}>{stat.value}</div>
								{stat.badge && (
									<span className={cx(s.badge, toneBadge[stat.badge.tone])}>
										<i className={cx("bi", stat.badge.icon)} /> {stat.badge.text}
									</span>
								)}
								{stat.sub && <div className={s.statSub}>{stat.sub}</div>}
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
								<p className={s.sectionSub}>Frequent transfer workflows</p>
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
 
				{/* 1.3.1 domestic */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-bank2" /> Domestic Bank Transfers (PesaLink, EFT, RTGS)
							</h3>
							<p className={s.sectionSub}>
								Instant PesaLink, same-day EFT and real-time RTGS to 47+ Kenyan banks.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("bankDirectoryModal")}>
								<i className="bi bi-list-ul" /> Bank Directory
							</button>
							<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("initiateTransferModal")}>
								<i className="bi bi-plus-lg" /> New Transfer
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Recent Domestic Transfers</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Date</th>
												<th>Beneficiary</th>
												<th>Bank</th>
												<th>Amount</th>
												<th>Method</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{c.domestic.map((r) => (
												<tr key={`${r.date}-${r.beneficiary}`}>
													<td>{r.date}</td>
													<td>{r.beneficiary}</td>
													<td>{r.bank}</td>
													<td>
														<strong>{r.amount}</strong>
													</td>
													<td>{r.method}</td>
													<td>
														<span className={cx(s.badge, toneBadge[r.statusTone])}>{r.status}</span>
													</td>
													<td>
														<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(r.action.modal)}>
															{r.action.label}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Bank Status (Live)</h4>
								{c.bankStatus.map((b) => (
									<div className={s.rowItem} key={b.name}>
										<div>
											<div className={s.rowTitle}>{b.name}</div>
											<div className={s.rowSub}>{b.rails}</div>
										</div>
										<span className={cx(s.badge, toneBadge[b.tone])}>{b.status}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
 
				{/* 1.3.2 international */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-globe" style={{ color: "var(--info)" }} /> International Transfers &amp; Remittances
							</h3>
							<p className={s.sectionSub}>
								SWIFT, Wave, Remitly, WorldRemit &amp; regional corridors with live FX and compliance screening.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("fxRatesModal")}>
								<i className="bi bi-currency-exchange" /> FX Rates
							</button>
							<button type="button" className={cx(s.btn, s.btnPrimary, s.btnSm)} onClick={() => openModal("internationalModal")}>
								<i className="bi bi-plus-lg" /> New International
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Recent International Transfers</h4>
								<div className={s.tableWrap}>
									<table className={s.table}>
										<thead>
											<tr>
												<th>Date</th>
												<th>Beneficiary</th>
												<th>Destination</th>
												<th>Amount</th>
												<th>FX Rate</th>
												<th>Method</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{c.intl.map((r) => (
												<tr key={`${r.date}-${r.beneficiary}`}>
													<td>{r.date}</td>
													<td>{r.beneficiary}</td>
													<td>{r.dest}</td>
													<td>
														<strong>{r.amount}</strong>
													</td>
													<td>{r.fx}</td>
													<td>{r.method}</td>
													<td>
														<span className={cx(s.badge, toneBadge[r.statusTone])}>{r.status}</span>
													</td>
													<td>
														<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(r.action.modal)}>
															{r.action.label}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Live FX Rates (KES)</h4>
								{c.fxRates.map((f) => (
									<div className={s.rowItem} key={f.code}>
										<strong>{f.code}</strong>
										<div>
											<strong>{f.rate}</strong>{" "}
											<span style={{ fontSize: 12, color: f.up ? "var(--danger)" : "var(--pri)" }}>{f.delta}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
 
				{/* 1.3.3 scheduled & recurring */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-arrow-repeat" style={{ color: "var(--purple)" }} /> Scheduled &amp; Recurring Transfers
							</h3>
							<p className={s.sectionSub}>
								One-time future transfers and recurring payments with approval workflows and failure handling.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("scheduleTransferModal")}>
								<i className="bi bi-plus-lg" /> New Schedule
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("recurringModal")}>
								<i className="bi bi-arrow-repeat" /> Recurring
							</button>
						</div>
					</div>
					<div className={s.subBlock}>
						<h4 className={s.blockHead}>Active Schedules &amp; Recurring Runs</h4>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Beneficiary</th>
										<th>Amount</th>
										<th>Frequency</th>
										<th>Next Run</th>
										<th>Status</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{c.schedules.map((r) => (
										<tr key={r.name}>
											<td>{r.name}</td>
											<td>{r.beneficiary}</td>
											<td>{r.amount}</td>
											<td>{r.frequency}</td>
											<td>{r.next}</td>
											<td>
												<span className={cx(s.badge, toneBadge[r.statusTone])}>{r.status}</span>
											</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(r.action.modal)}>
													{r.action.label}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
 
				{/* 1.3.4 history */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-clock-history" style={{ color: "var(--ink-500)" }} /> Transfer History &amp; Reconciliation
							</h3>
							<p className={s.sectionSub}>Full audit trail, receipt vault, reconciliation tools and export options.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("reconciliationModal")}>
								<i className="bi bi-check2-square" /> Reconcile
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("transferHistoryModal")}>
								<i className="bi bi-download" /> Export
							</button>
						</div>
					</div>
					<div className={s.subBlock}>
						<div className={s.tableWrap}>
							<table className={s.table}>
								<thead>
									<tr>
										<th>Date</th>
										<th>Reference</th>
										<th>Beneficiary</th>
										<th>Bank</th>
										<th>Amount</th>
										<th>Method</th>
										<th>Status</th>
										<th>Receipt</th>
									</tr>
								</thead>
								<tbody>
									{c.history.map((r) => (
										<tr key={r.ref}>
											<td>{r.date}</td>
											<td>{r.ref}</td>
											<td>{r.beneficiary}</td>
											<td>{r.bank}</td>
											<td>{r.amount}</td>
											<td>{r.method}</td>
											<td>
												<span className={cx(s.badge, toneBadge[r.statusTone])}>{r.status}</span>
											</td>
											<td>
												<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal(r.action.modal)}>
													{r.action.label}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
 
				{/* 1.3.5 limits / approvals / compliance */}
				<div className={s.card}>
					<div className={s.sectionHead}>
						<div>
							<h3 className={s.sectionTitle}>
								<i className="bi bi-shield-check" style={{ color: "var(--danger)" }} /> Transfer Limits, Approvals &amp; Compliance
							</h3>
							<p className={s.sectionSub}>Limits, maker-checker approval workflows, AML screening and regulatory reporting.</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("limitsModal")}>
								<i className="bi bi-sliders" /> Limits
							</button>
							<button type="button" className={cx(s.btn, s.btnSm)} onClick={() => openModal("approvalQueueModal")}>
								<i className="bi bi-check2-square" /> Approvals
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Current Limits</h4>
								{c.limits.map((l) => (
									<div className={s.rowItem} key={l.label}>
										<strong>{l.label}</strong>
										<strong>{l.value}</strong>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Approval Workflow</h4>
								{c.approvals.map((a) => (
									<div className={s.rowItem} key={a.label}>
										<strong>{a.label}</strong>
										<span className={cx(s.badge, toneBadge[a.tone])}>{a.badge}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.subBlock}>
								<h4 className={s.blockHead}>Compliance Status</h4>
								{c.compliance.map((cb) => (
									<div className={cx(s.softBox, softTone[cb.tone])} style={{ marginBottom: 8 }} key={cb.label}>
										<div className={s.softLabel}>{cb.label}</div>
										<div className={s.softValue}>{cb.value}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
 
			<TransferManagementModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={c}
			/>
		</div>
	);
}