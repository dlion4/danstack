import { useState, type ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./getPaid.module.css";
import {
	AGING_ROWS,
	AGING_TOTALS,
	CHANNELS,
	CHANNEL_TABS,
	FEE_METHODS,
	FEE_SCHEDULE,
	INVOICES,
	INVOICE_TABS,
	PAYMENT_LINKS,
	QRS,
	REFUNDS,
	SUBSCRIPTIONS,
	type ChannelTier,
	type InvoiceStatus,
	type Tone,
} from "./getPaidData";
import GetPaidModals from "./GetPaidModals";

/* ============================================================================
   PayMo Business — Get Paid (Money In)
   React + TypeScript, emerald-glass dashboard theme.
   Port of consolidated/get-paid.html — all sections, filters, live fee
   calculator, quick actions and the 29 modals.
   ========================================================================== */

/* ---------- shared badge component ---------- */
function Badge({ tone, children, style }: { tone: Tone; children: ReactNode; style?: React.CSSProperties }) {
	const map: Record<string, string> = {
		success: styles.badgeS,
		warning: styles.badgeW,
		danger: styles.badgeD,
		info: styles.badgeI,
		purple: styles.badgeP,
		dark: styles.badgeK,
	};
	return <span className={`${styles.badge} ${map[tone]}`} style={style}>{children}</span>;
}

/* ---------- section header component ---------- */
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
	actions?: { label: string; icon?: string; modal: string; tone?: "primary" | "danger" }[];
	onOpen: (id: string) => void;
}) {
	return (
		<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
			<div>
				<h3 className={styles.st}>
					<i className={`bi ${icon}`} style={{ color: iconColor }} />
					{title}
				</h3>
				<p className={styles.ss}>{sub}</p>
			</div>
			{actions && (
				<div className="d-flex" style={{ gap: 8 }}>
					{actions.map(a => (
						<button
							key={a.label}
							className={`${styles.btnPm} ${styles.btnPmSm} ${a.tone === "primary" ? styles.btnPmP : a.tone === "danger" ? styles.btnPmD : ""}`}
							onClick={() => onOpen(a.modal)}
						>
							{a.icon && <i className={`bi ${a.icon}`} />} {a.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

/* ---------- summary item ---------- */
function SumItem({ lab, val, valColor, trend, trendTone }: { lab: string; val: string; valColor?: string; trend?: string; trendTone?: string }) {
	return (
		<div className={styles.sumItem}>
			<div className={styles.lab}>{lab}</div>
			<div className={styles.val} style={valColor ? { color: valColor } : undefined}>{val}</div>
			{trend && <span className={`${styles.trendArrow} text-${trendTone ?? "success"}`}><i className="bi bi-arrow-up-right" /> {trend}</span>}
		</div>
	);
}

const fmt = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");

/* ============================================================================ */
export default function GetPaid() {
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const [channelTier, setChannelTier] = useState<ChannelTier | "all">("all");
	const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | "all">("all");
	const [invoiceSearch, setInvoiceSearch] = useState("");
	const [filterOpen, setFilterOpen] = useState(false);
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const [feeAmount, setFeeAmount] = useState(50000);
	const [feeMethod, setFeeMethod] = useState("0.5");
	const [segRange, setSegRange] = useState("7d");

	const open = (id: string) => setActiveModal(id);
	const close = () => setActiveModal(null);
	const toast = (msg: string) => {
		setToastMsg(msg);
		window.setTimeout(() => setToastMsg(null), 2800);
	};

	/* ---------- derived data ---------- */
	const channelCount = (tier: ChannelTier | "all") => tier === "all" ? CHANNELS.length : CHANNELS.filter(c => c.tier === tier).length;
	const filteredChannels = CHANNELS.filter(c => channelTier === "all" || c.tier === channelTier);

	const invoiceCount = (status: InvoiceStatus | "all") => status === "all" ? INVOICES.length : INVOICES.filter(i => i.status === status).length;
	const filteredInvoices = INVOICES.filter(inv => {
		const matchesStatus = invoiceStatus === "all" || inv.status === invoiceStatus;
		const q = invoiceSearch.toLowerCase().trim();
		const matchesSearch = q === "" || inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q) || inv.amount.toLowerCase().includes(q);
		return matchesStatus && matchesSearch;
	});

	const rate = parseFloat(feeMethod) || 0;
	const fee = Math.round((feeAmount || 0) * rate / 100);
	const feeNet = (feeAmount || 0) - fee;
	const settlement = FEE_METHODS.find(m => m.value === feeMethod)?.settlement ?? "T+1";

	const toggleAll = (checked: boolean) => {
		if (checked) setSelected(new Set(filteredInvoices.map(i => i.id)));
		else setSelected(new Set());
	};
	const toggleRow = (id: string) =>
		setSelected(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className={styles.getPaid}>
			{/* Main Content — sidebar/header rendered by BusinessShell */}

			{/* Page Bar */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="/business-dashboard">Business Portal</a> / <strong>Get Paid</strong>
					</div>
					<h2>Get Paid — Money In</h2>
					<p className={styles.sectionSub}>Everything about how money comes into your business — every channel, customer, and invoice.</p>
				</div>
				<div className="d-flex gap-2 flex-wrap">
					<button className={styles.btnPm} onClick={() => open("recordPaymentModal")}>
						<i className="bi bi-check2-circle" /> Record Payment
					</button>
					<button className={styles.btnPm} onClick={() => open("feeCalcModal")}>
						<i className="bi bi-calculator" /> Fee Check
					</button>
					<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => open("newInvoiceModal")}>
						<i className="bi bi-plus-lg" /> New Invoice
					</button>
				</div>
			</div>

			{/* Content */}
			<div className={styles.content}>
				{/* SECTION 1.1 Payment Methods Hub */}
				<div className={styles.card}>
					<SectionHead
						icon="bi-shop"
						iconColor="var(--pm-accent)"
						title="Payment Methods Hub"
						sub="Which numbers can your customers pay to?"
						actions={[
							{ label: "Fee Calc", icon: "bi-calculator", modal: "feeCalcModal" },
							{ label: "QR", icon: "bi-qr-code", modal: "generateQRModal" },
						]}
						onOpen={open}
					/>
					<div className={styles.invTabbar}>
						{CHANNEL_TABS.map(t => (
							<button
								key={t.key}
								className={`${styles.invTab} ${channelTier === t.key ? styles.invActive : ""}`}
								onClick={() => setChannelTier(t.key)}
							>
								{t.label} <span className={styles.cnt}>{channelCount(t.key)}</span>
							</button>
						))}
					</div>
					<div className="row g-3">
						{filteredChannels.map(c => (
							<div className="col-lg-4 col-md-6" key={c.id}>
								<div className={`${styles.channelCard} ${c.tier === "pending" ? styles.channelPending : c.tier === "available" ? styles.channelAvailable : ""}`}>
									<div className="d-flex justify-content-between align-items-start">
										<div className="d-flex align-items-center gap-3">
											<div className={styles.channelIcon} style={{ background: c.iconBg, color: c.iconColor }}>
												<i className={`bi ${c.icon}`} />
											</div>
											<div>
												<strong>{c.name}</strong>
												<div className={styles.sectionSub}>{c.sub}</div>
											</div>
										</div>
										<Badge tone={c.badgeTone}>{c.badge}</Badge>
									</div>
									{c.spark ? (
										<svg className={`${styles.channelSpark} mt-2`} viewBox="0 0 200 26" preserveAspectRatio="none">
											<polyline fill="none" stroke={c.sparkColor} strokeWidth="2" points={c.spark} />
										</svg>
									) : (
										<div className="mt-2 text-muted" style={{ fontSize: 12 }}>{c.note}</div>
									)}
									{c.collected && (
										<div className="d-flex justify-content-between mt-2" style={{ fontSize: 12 }}>
											<span className={styles.sectionSub}>Collected (mo)</span>
											<strong>{c.collected}</strong>
										</div>
									)}
									<div className="d-flex gap-2 mt-2 align-items-center">
										{c.successRate && <Badge tone={c.successTone}>{c.successRate}</Badge>}
										<button
											className={`${styles.btnPm} ${styles.btnPmSm} ${c.primaryAction ? styles.btnPmP : ""} ms-auto`}
											onClick={() => open(c.modal)}
										>
											{c.action}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* SECTION 1.2 Invoice Center */}
				<div className={styles.card}>
					<SectionHead
						icon="bi-receipt"
						iconColor="var(--pm-primary)"
						title="Invoice Center"
						sub="Create, manage, and track every invoice"
						actions={[
							{ label: "Templates", icon: "bi-file-earmark", modal: "invoiceTemplatesModal" },
							{ label: "Quick Invoice", modal: "quickInvoiceModal" },
						]}
						onOpen={open}
					/>
					<div className={`${styles.summaryStrip} mb-3`}>
						<SumItem lab="Invoiced (mo)" val="KES 482.5K" trend="+18%" />
						<SumItem lab="Collected (mo)" val="KES 415K" valColor="var(--pm-accent)" trend="+12%" />
						<SumItem lab="Outstanding" val="KES 750K" valColor="var(--pm-warning)" trend="+5%" trendTone="warning" />
						<SumItem lab="Overdue" val="KES 145K" valColor="var(--pm-danger)" trend="+8%" trendTone="danger" />
					</div>
					<div className={styles.invTabbar}>
						{INVOICE_TABS.map(t => (
							<button
								key={t.key}
								className={`${styles.invTab} ${invoiceStatus === t.key ? styles.invActive : ""}`}
								onClick={() => setInvoiceStatus(t.key)}
							>
								{t.label} <span className={styles.cnt}>{invoiceCount(t.key)}</span>
							</button>
						))}
					</div>
					<div className="d-flex gap-2 mb-2 flex-wrap">
						<div className={styles.headerSearch} style={{ maxWidth: 300 }}>
							<i className="bi bi-search" />
							<input
								placeholder="Search invoice #, customer, amount..."
								value={invoiceSearch}
								onChange={e => setInvoiceSearch(e.target.value)}
							/>
						</div>
						<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => setFilterOpen(v => !v)}>
							<i className="bi bi-funnel" /> Filters
						</button>
						{selected.size > 0 && (
							<div className="ms-auto d-flex gap-2 align-items-center">
								<Badge tone="info">{selected.size} selected</Badge>
								<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => toast("Selected invoices sent!")}>Send</button>
								<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => toast("Selected invoices exported!")}>Export CSV</button>
								<button className={`${styles.btnPm} ${styles.btnPmSm} ${styles.btnPmD}`} onClick={() => toast("Selected drafts deleted!")}>Delete</button>
							</div>
						)}
					</div>
					{filterOpen && (
						<div className="p-3 rounded mb-2" style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}>
							<div className="row g-2">
								<div className="col-md-3">
									<label className={styles.formLabel}>Date From</label>
									<input type="date" className={styles.formControl} />
								</div>
								<div className="col-md-3">
									<label className={styles.formLabel}>Date To</label>
									<input type="date" className={styles.formControl} />
								</div>
								<div className="col-md-2">
									<label className={styles.formLabel}>Min Amount</label>
									<input type="number" className={styles.formControl} placeholder="0" />
								</div>
								<div className="col-md-2">
									<label className={styles.formLabel}>Max Amount</label>
									<input type="number" className={styles.formControl} placeholder="0" />
								</div>
								<div className="col-md-2">
									<label className={styles.formLabel}>Customer</label>
									<select className={styles.formControl}>
										<option>All</option><option>Acme Corp</option><option>Global Industries</option><option>StartUp Inc</option>
									</select>
								</div>
								<div className="col-12 d-flex justify-content-end gap-2">
									<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => setFilterOpen(false)}>Cancel</button>
									<button className={`${styles.btnPm} ${styles.btnPmSm} ${styles.btnPmP}`} onClick={() => toast("Filters applied!")}>Apply</button>
								</div>
							</div>
						</div>
					)}
					<div className="table-responsive">
						<table className={styles.table}>
							<thead>
								<tr>
									<th style={{ width: 30 }}>
										<input
											type="checkbox"
											className="form-check-input"
											checked={filteredInvoices.length > 0 && filteredInvoices.every(i => selected.has(i.id))}
											onChange={e => toggleAll(e.target.checked)}
										/>
									</th>
									<th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th><th>Issue</th><th>Due</th><th>Balance</th><th />
								</tr>
							</thead>
							<tbody>
								{filteredInvoices.map(inv => (
									<tr key={inv.id}>
										<td>
											<input
												type="checkbox"
												className="form-check-input"
												checked={selected.has(inv.id)}
												onChange={() => toggleRow(inv.id)}
											/>
										</td>
										<td>
											<strong>{inv.id}</strong>{" "}
											{inv.viewed && <i className="bi bi-eye text-success" title="Viewed by customer" />}
										</td>
										<td>{inv.customer}</td>
										<td>{inv.amount}</td>
										<td><Badge tone={inv.statusTone}>{inv.statusLabel}</Badge></td>
										<td>{inv.issue}</td>
										<td>{inv.due}</td>
										<td>{inv.balance}</td>
										<td>
											<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open(inv.status === "draft" ? "newInvoiceModal" : "invoiceDetailModal")}>
												{inv.status === "draft" ? "Edit" : "View"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* SECTION 1.4 Recurring & Subscriptions */}
				<div className={styles.card}>
					<SectionHead
						icon="bi-arrow-repeat"
						iconColor="var(--pm-purple)"
						title="Recurring Invoices & Subscriptions"
						sub="Your predictable, automated income"
						actions={[{ label: "Create Recurring", icon: "bi-plus-lg", modal: "newRecurringModal", tone: "primary" }]}
						onOpen={open}
					/>
					<div className="row g-2 mb-3">
						<div className="col-6 col-lg-3"><SumItem lab="MRR" val="KES 1.2M" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="ARR" val="KES 14.4M" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Churn" val="3.2%" valColor="var(--pm-danger)" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Net New MRR" val="+KES 85K" valColor="var(--pm-accent)" /></div>
					</div>
					<div className="table-responsive">
						<table className={styles.table}>
							<thead>
								<tr><th>Customer</th><th>Amount</th><th>Frequency</th><th>Next Invoice</th><th>Lifetime</th><th>Status</th><th>Action</th></tr>
							</thead>
							<tbody>
								{SUBSCRIPTIONS.map(s => (
									<tr key={s.customer}>
										<td><strong>{s.customer}</strong></td>
										<td>{s.amount}</td>
										<td>{s.frequency}</td>
										<td>{s.next}</td>
										<td>{s.lifetime}</td>
										<td><Badge tone={s.status === "Active" ? "success" : "warning"}>{s.status}</Badge></td>
										<td>
											<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open("subscriptionDetailModal")}>{s.action}</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* SECTION 1.5 Receivables & Aging */}
				<div className="row g-3">
					<div className="col-lg-8">
						<div className={`${styles.card} h-100`}>
							<SectionHead
								icon="bi-hourglass-split"
								iconColor="var(--pm-warning)"
								title="Receivables & Aging"
								sub="Who owes you, how much, how late"
								actions={[{ label: "Bulk Reminders", icon: "bi-envelope", modal: "bulkRemindersModal" }]}
								onOpen={open}
							/>
							<div className="table-responsive">
								<table className={styles.table}>
									<thead>
										<tr><th>Customer</th><th>0-30</th><th>31-60</th><th>61-90</th><th>90+</th><th>Total</th></tr>
									</thead>
									<tbody>
										{AGING_ROWS.map(row => (
											<tr key={row.customer}>
												<td><strong>{row.customer}</strong></td>
												<td>{row.b030}</td>
												<td className={row.hi === 1 ? styles.hi : ""}>{row.b3160}</td>
												<td className={row.hi === 2 ? styles.hi : ""}>{row.b6190}</td>
												<td className={row.cr === 3 ? styles.cr : ""}>{row.b90}</td>
												<td><strong>{row.total}</strong></td>
											</tr>
										))}
										<tr style={{ background: "var(--pm-surface-2)", fontWeight: 700 }}>
											<td>Totals</td>
											<td>{AGING_TOTALS.b030}</td>
											<td>{AGING_TOTALS.b3160}</td>
											<td>{AGING_TOTALS.b6190}</td>
											<td>{AGING_TOTALS.b90}</td>
											<td>{AGING_TOTALS.total}</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div className={styles.agingBar}>
								<div style={{ height: "100%", background: "var(--pm-accent)", opacity: 0.8 }} title="0-30: 690K" />
								<div style={{ height: "62%", background: "var(--pm-info)" }} title="31-60: 255K" />
								<div style={{ height: "44%", background: "var(--pm-warning)" }} title="61-90: 180K" />
								<div style={{ height: "22%", background: "var(--pm-danger)" }} title="90+: 20K" />
							</div>
							<div className="d-flex gap-3 mt-1" style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								<span>▮ 0-30</span>
								<span style={{ color: "var(--pm-info)" }}>▮ 31-60</span>
								<span style={{ color: "var(--pm-warning)" }}>▮ 61-90</span>
								<span style={{ color: "var(--pm-danger)" }}>▮ 90+</span>
							</div>
							<div className="p-3 rounded mt-3" style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}>
								<div className={styles.statusRow}>
									<span>DSO (Days Sales Outstanding)</span>
									<strong>28 Days <span className={styles.sectionSub}>(industry avg 42)</span></strong>
								</div>
								<div className={styles.statusRow}>
									<span>Collection Rate</span>
									<strong>86% <span className={styles.sectionSub}>this month</span></strong>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-4">
						<div className={`${styles.card} h-100`}>
							<SectionHead icon="bi-lightning-charge" iconColor="var(--pm-info)" title="Priority Actions" sub="" onOpen={open} />
							<div className="d-flex align-items-center gap-2 mb-2">
								<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-danger-soft)", color: "var(--pm-danger)" }}>
									<i className="bi bi-exclamation-triangle" />
								</div>
								<div className={styles.flex1}>
									<div style={{ fontWeight: 600 }}>3 overdue invoices</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>KES 245K needing action</div>
								</div>
								<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open("bulkRemindersModal")}>Act</button>
							</div>
							<div className="d-flex align-items-center gap-2 mb-2">
								<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-warning-soft)", color: "var(--pm-warning)" }}>
									<i className="bi bi-people" />
								</div>
								<div className={styles.flex1}>
									<div style={{ fontWeight: 600 }}>2 at-risk customers</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Aging worsened MoM</div>
								</div>
								<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open("agingReportModal")}>View</button>
							</div>
							<div className="d-flex align-items-center gap-2 mb-2">
								<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-info-soft)", color: "var(--pm-info)" }}>
									<i className="bi bi-trophy" />
								</div>
								<div className={styles.flex1}>
									<div style={{ fontWeight: 600 }}>Largest outstanding</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Acme Corp · KES 420K</div>
								</div>
								<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open("agingReportModal")}>View</button>
							</div>
							<div className="d-flex align-items-center gap-2 mb-2">
								<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-accent-soft)", color: "var(--pm-accent)" }}>
									<i className="bi bi-stars" />
								</div>
								<div className={styles.flex1}>
									<div style={{ fontWeight: 600 }}>3 suggested reminders</div>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Due today based on behavior</div>
								</div>
								<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open("bulkRemindersModal")}>Send</button>
							</div>
							<div className="p-3 rounded mt-2" style={{ background: "var(--pm-danger-soft)", fontSize: 12 }}>
								<i className="bi bi-file-x" /> <strong>Write off uncollectible debt?</strong> Requires reason & creates credit note.
							</div>
							<button className={`${styles.btnPm} ${styles.btnPmD} w-100 mt-2`} onClick={() => open("writeOffModal")}>
								<i className="bi bi-file-x" /> Write Off Debt
							</button>
						</div>
					</div>
				</div>

				{/* SECTION 1.6 QR & Payment Links */}
				<div className="row g-3">
					<div className="col-lg-6">
						<div className={`${styles.card} h-100`}>
							<SectionHead
								icon="bi-qr-code"
								iconColor="var(--pm-pink)"
								title="QR Payments"
								sub="KEQR-standard · all wallets"
								actions={[{ label: "New QR", icon: "bi-plus-lg", modal: "generateQRModal", tone: "primary" }]}
								onOpen={open}
							/>
							<div className="table-responsive">
								<table className={styles.table}>
									<thead><tr><th>Type</th><th>Amount</th><th>Scans</th><th>Collected</th><th>Status</th></tr></thead>
									<tbody>
										{QRS.map(q => (
											<tr key={q.a}>
												<td>{q.a}</td><td>{q.b}</td><td>{q.c}</td><td>{q.d}</td>
												<td><Badge tone={q.statusTone}>{q.status}</Badge></td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className="col-lg-6">
						<div className={`${styles.card} h-100`}>
							<SectionHead
								icon="bi-link-45deg"
								iconColor="var(--pm-info)"
								title="Payment Links"
								sub="Share · embed · track"
								actions={[{ label: "New Link", icon: "bi-plus-lg", modal: "createLinkModal", tone: "primary" }]}
								onOpen={open}
							/>
							<div className="table-responsive">
								<table className={styles.table}>
									<thead><tr><th>Link</th><th>Amount</th><th>Visits</th><th>Paid</th><th>Status</th></tr></thead>
									<tbody>
										{PAYMENT_LINKS.map(l => (
											<tr key={l.a}>
												<td><Badge tone={l.statusTone === "danger" ? "dark" : "info"}>{l.a}</Badge></td>
												<td>{l.b}</td><td>{l.c}</td><td>{l.d}</td>
												<td><Badge tone={l.statusTone}>{l.status}</Badge></td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 1.7 Refunds & Disputes */}
				<div className={styles.card}>
					<SectionHead
						icon="bi-arrow-counterclockwise"
						iconColor="var(--pm-danger)"
						title="Refunds & Disputes"
						sub="Handle money going back, fast"
						actions={[
							{ label: "New Refund", icon: "bi-arrow-counterclockwise", modal: "refundModal" },
							{ label: "Disputes", icon: "bi-shield-exclamation", modal: "disputesModal" },
						]}
						onOpen={open}
					/>
					<div className="row g-2 mb-3">
						<div className="col-6 col-lg-3"><SumItem lab="Refunded (mo)" val="KES 42K" valColor="var(--pm-danger)" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Refund Rate" val="2.1%" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Open Disputes" val="3" valColor="var(--pm-warning)" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Avg. Resolution" val="1.5 days" /></div>
					</div>
					<div className="table-responsive">
						<table className={styles.table}>
							<thead>
								<tr><th>Refund ID</th><th>Original Txn</th><th>Customer</th><th>Amount</th><th>Reason</th><th>Status</th><th>Action</th></tr>
							</thead>
							<tbody>
								{REFUNDS.map(r => (
									<tr key={r.id}>
										<td>{r.id}</td><td>{r.txn}</td><td>{r.customer}</td><td>{r.amount}</td><td>{r.reason}</td>
										<td><Badge tone={r.statusTone}>{r.status}</Badge></td>
										<td>
											<button className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => open("refundModal")}>{r.action}</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* SECTION 1.8 Fee Calculator + Schedule */}
				<div className="row g-3">
					<div className="col-lg-5">
						<div className={`${styles.card} h-100`}>
							<SectionHead icon="bi-calculator" iconColor="var(--pm-accent)" title="Fee Calculator" sub="Know exactly what you keep" onOpen={open} />
							<div className="mb-3">
								<label className={styles.formLabel}>Amount (KES)</label>
								<input type="number" className={styles.formControl} value={feeAmount} onChange={e => setFeeAmount(parseFloat(e.target.value) || 0)} />
							</div>
							<div className="mb-3">
								<label className={styles.formLabel}>Method</label>
								<select className={styles.formControl} value={feeMethod} onChange={e => setFeeMethod(e.target.value)}>
									{FEE_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
								</select>
							</div>
							<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}>
								<div className={styles.feeRow}><span>Customer Pays</span><strong>{fmt(feeAmount)}</strong></div>
								<div className={styles.feeRow}><span>Platform Fee</span><strong style={{ color: "var(--pm-danger)" }}>{fmt(fee)}</strong></div>
								<div className={styles.feeRow}><span>Effective Rate</span><strong>{rate}%</strong></div>
								<div className={styles.feeRow}><span>Settlement</span><strong>{settlement}</strong></div>
								<hr style={{ borderTop: "1px solid var(--pm-border)", margin: "8px 0" }} />
								<div className={styles.feeRow}>
									<strong>You Receive</strong>
									<strong style={{ color: "var(--pm-accent)", fontSize: 18 }}>{fmt(feeNet)}</strong>
								</div>
							</div>
							<button className={`${styles.btnPm} ${styles.btnPmSm} w-100 mt-2`} onClick={() => open("feeCompareModal")}>
								<i className="bi bi-arrow-left-right" /> Compare All Methods
							</button>
						</div>
					</div>
					<div className="col-lg-7">
						<div className={`${styles.card} h-100`}>
							<SectionHead icon="bi-table" iconColor="var(--pm-info)" title="Fee Schedule" sub="Transparent pricing by method" onOpen={open} />
							<div className="table-responsive">
								<table className={styles.table}>
									<thead><tr><th>Method</th><th>Fee</th><th>Min/Max</th><th>Settlement</th><th>Why?</th></tr></thead>
									<tbody>
										{FEE_SCHEDULE.map(f => (
											<tr key={f.method}>
												<td>{f.method}</td>
												<td>{f.fee}</td>
												<td>{f.minmax}</td>
												<td>{f.settlement}</td>
												<td>
													<span
														className={styles.badge}
														style={{ background: "var(--pm-info-soft)", color: "#1d4ed8", cursor: "pointer" }}
														onClick={() => toast(f.why)}
													>
														ⓘ
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="p-3 rounded mt-3" style={{ background: "var(--pm-accent-soft)", fontSize: 12 }}>
								<i className="bi bi-bullseye" /> <strong>Optimization:</strong> 20% of collections are via Card at 2.5%. Shifting those to PesaLink at 0% would save you <strong>KES 25,000/mo</strong>.
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 1.9 Collection Analytics */}
				<div className={styles.card}>
					<SectionHead
						icon="bi-graph-up-arrow"
						iconColor="var(--pm-purple)"
						title="Collection Analytics"
						sub="Understand how you collect"
						actions={[{ label: "Export", icon: "bi-download", modal: "" }]}
						onOpen={id => (id === "" ? toast("Analytics exported to CSV!") : open(id))}
					/>
					<div className="d-flex gap-2 mb-3">
						<div className={styles.seg}>
							{["7d", "30d", "3m", "1y"].map(r => (
								<button
									key={r}
									type="button"
									className={`${styles.segBtn} ${segRange === r ? styles.segActive : ""}`}
									onClick={() => { setSegRange(r); toast(`Viewing ${r} analytics`); }}
								>
									{r.toUpperCase()}
								</button>
							))}
						</div>
					</div>
					<div className="row g-2 mb-3">
						<div className="col-6 col-lg-3"><SumItem lab="Total Collected" val="KES 415K" trend="+12%" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Avg Transaction" val="KES 24.1K" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Transactions" val="274" /></div>
						<div className="col-6 col-lg-3"><SumItem lab="Failure Rate" val="1.6%" valColor="var(--pm-accent)" /></div>
					</div>
					<div className="row g-3">
						<div className="col-lg-6">
							<svg viewBox="0 0 640 180" preserveAspectRatio="none" style={{ width: "100%", height: 180 }}>
								<defs>
									<linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#4F46E5" stopOpacity=".25" />
										<stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
									</linearGradient>
								</defs>
								<path d="M0,150 C40,145 60,120 120,110 C180,100 220,80 280,70 C340,60 380,55 440,45 C500,35 560,40 640,25 L640,180 L0,180 Z" fill="url(#collGrad)" />
								<polyline fill="none" stroke="#4F46E5" strokeWidth="2.5" points="0,150 120,110 280,70 440,45 640,25" />
								<line x1="0" y1="90" x2="640" y2="90" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,4" />
							</svg>
							<div style={{ fontSize: 11, color: "var(--pm-muted)", textAlign: "center" }}>Daily collections · dashed line = target</div>
						</div>
						<div className="col-lg-6">
							<div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
								<div
									style={{
										width: 140, height: 140, borderRadius: "50%",
										background: "conic-gradient(var(--pm-primary) 0 70%, var(--pm-info) 70% 90%, var(--pm-accent) 90% 100%)",
										display: "flex", alignItems: "center", justifyContent: "center",
									}}
								>
									<div style={{ width: 96, height: 96, borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
										<span style={{ fontWeight: 700, fontSize: 18 }}>70%</span>
										<span style={{ fontSize: 10, color: "var(--pm-muted)" }}>M-Pesa</span>
									</div>
								</div>
								<div style={{ minWidth: 140 }}>
									<div className={styles.statusRow}><span className="d-flex align-items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--pm-primary)", display: "inline-block" }} /> M-Pesa</span><strong>70%</strong></div>
									<div className={styles.statusRow}><span className="d-flex align-items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--pm-info)", display: "inline-block" }} /> Card</span><strong>20%</strong></div>
									<div className={styles.statusRow}><span className="d-flex align-items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--pm-accent)", display: "inline-block" }} /> Bank</span><strong>10%</strong></div>
								</div>
							</div>
						</div>
					</div>
					<div className="row g-3 mt-1">
						<div className="col-md-6">
							<h6 style={{ fontWeight: 700 }}>Collection Goal</h6>
							<div className="d-flex justify-content-between" style={{ fontSize: 12 }}>
								<span>KES 2.3M of KES 5M target</span>
								<strong>46%</strong>
							</div>
							<div className={`${styles.progressTrack} mt-1`}>
								<div className={styles.progressFill} style={{ width: "46%", background: "var(--pm-primary)" }} />
							</div>
							<div style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}>12 days remaining · projected end-of-month: KES 4.8M</div>
							<button className={`${styles.btnPm} ${styles.btnPmSm} mt-2`} onClick={() => open("goalModal")}>
								<i className="bi bi-bullseye" /> Set Target
							</button>
						</div>
						<div className="col-md-6">
							<h6 style={{ fontWeight: 700 }}>Day-of-Week Heatmap</h6>
							<div className="d-flex gap-1">
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-info-soft)", color: "var(--pm-info)" }}>M</div>
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-primary-light)", color: "#fff" }}>T</div>
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-primary-light)", color: "#fff" }}>W</div>
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-primary)", color: "#fff" }}>T</div>
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-primary-dark)", color: "#fff" }}>F</div>
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-info)", color: "#fff" }}>S</div>
								<div className={`${styles.heatCell} flex-1`} style={{ background: "var(--pm-info-soft)", color: "var(--pm-info)" }}>S</div>
							</div>
							<div style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 4 }}>Peaks Fri/Sat · best time to send reminders: 8-10 AM & 5-7 PM</div>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions Bar */}
			<div className={styles.quickBar}>
				<div className={styles.qb} onClick={() => open("newInvoiceModal")}>
					<i className="bi bi-receipt text-primary" /> New Invoice
				</div>
				<div className={styles.qb} onClick={() => open("createLinkModal")}>
					<i className="bi bi-link-45deg text-info" /> Payment Link
				</div>
				<div className={styles.qb} onClick={() => open("generateQRModal")}>
					<i className="bi bi-qr-code" style={{ color: "var(--pm-pink)" }} /> Generate QR
				</div>
				<div className={`${styles.qb} position-relative`} onClick={() => open("bulkRemindersModal")}>
					<i className="bi bi-envelope text-warning" /> Send Reminder <span className={styles.qbadge}>3</span>
				</div>
				<div className={styles.qb} onClick={() => open("recordPaymentModal")}>
					<i className="bi bi-check2-circle text-success" /> Record Payment
				</div>
				<div className={styles.qb} onClick={() => open("checkStatusModal")}>
					<i className="bi bi-search text-secondary" /> Check Status
				</div>
				<div className={styles.qb} onClick={() => open("feeCalcModal")}>
					<i className="bi bi-calculator text-danger" /> Fee Check
				</div>
			</div>

			{/* Modals (port of get-paid.html M1–M29) */}
			<GetPaidModals active={activeModal} onClose={close} onOpen={open} onToast={toast} />

			{/* Toast */}
			{toastMsg && (
				<div className={styles.toast}>
					<i className="bi bi-check-circle-fill" />
					<span>{toastMsg}</span>
				</div>
			)}
		</div>
	);
}
