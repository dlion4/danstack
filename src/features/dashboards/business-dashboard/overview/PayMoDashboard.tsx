import { useEffect, useState, type ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./paymoDashboard.module.css";
import PayMoModals from "./PayMoModals";
import { BUSINESSES, ORDER, TREND, fmt, shortM } from "./paymoData";
import type { Business, Range, Tone } from "./paymoData";

/* ============================================================================
   PayMo Business — Command Center (legacy page 3.1)
   React + TypeScript, emerald-glass dashboard theme.
   Multi-company switching, date-range switching, presence (offices/analytics).
   ========================================================================== */

/* ---------- shared cell renderer ---------- */
function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
	const map: Record<Tone, string> = {
		success: styles.badgeS, warning: styles.badgeW, danger: styles.badgeD,
		info: styles.badgeI, purple: styles.badgeP, dark: styles.badgeK,
	};
	return <span className={`${styles.badge} ${map[tone]}`}>{children}</span>;
}

/* ---------- section header (1.x pattern) ---------- */
function SectionHead({
	icon, iconColor, title, sub, actions, onOpen,
}: {
	icon: string; iconColor: string; title: string; sub: string;
	actions?: { label: string; icon?: string; modal: string; tone?: "primary" | "danger" }[];
	onOpen: (id: string) => void;
}) {
	return (
		<div className={`d-flex justify-content-between align-items-center mb-3 flex-wrap`} style={{ gap: 8 }}>
			<div>
				<h3 className={styles.st}><i className={`bi ${icon}`} style={{ color: iconColor }} />{title}</h3>
				<p className={styles.ss}>{sub}</p>
			</div>
			{actions && (
				<div className="d-flex" style={{ gap: 8 }}>
					{actions.map(a => (
						<button
							key={a.label}
							className={`${styles.btnPm} ${styles.btnSm} ${a.tone === "primary" ? styles.btnPmP : a.tone === "danger" ? styles.btnPmD : ""}`}
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

/* ---------- trend SVG chart ---------- */
function TrendChart({ b, range }: { b: Business; range: Range }) {
	const tr = TREND(b.kpi.revenue, b.kpi.expenses, range);
	const W = 640, H = 240, pad = 34;
	const all = [...tr.revenue, ...tr.expenses];
	const max = Math.max(...all) * 1.12, min = Math.min(...all) * 0.8;
	const x = (i: number) => (tr.labels.length > 1 ? pad + (i * (W - 2 * pad)) / (tr.labels.length - 1) : W / 2);
	const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);
	const line = (pts: string[]) => pts.map((p, i) => (i ? "L" : "M") + p).join(" ");
	const revPts = tr.revenue.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1));
	const expPts = tr.expenses.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1));
	const revLine = line(revPts), expLine = line(expPts);
	const revArea = revLine + ` L${x(tr.labels.length - 1).toFixed(1)},${H - pad} L${x(0)},${H - pad} Z`;
	const expArea = expLine + ` L${x(tr.labels.length - 1).toFixed(1)},${H - pad} L${x(0)},${H - pad} Z`;
	const revSum = tr.revenue.reduce((a, c) => a + c, 0), expSum = tr.expenses.reduce((a, c) => a + c, 0);
	const rlabel = range === "7d" ? "This Week" : range === "30d" ? "This Month" : range === "90d" ? "This Quarter" : "This Year";
	return (
		<>
			<div className={styles.chartWrap}>
				<svg viewBox="0 0 640 250" preserveAspectRatio="none">
					<defs>
						<linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#10b981" stopOpacity="0.25" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" />
						</linearGradient>
						<linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
						</linearGradient>
					</defs>
					<g stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,4">
						<line x1="0" y1={H - 160} x2={W} y2={H - 160} />
						<line x1="0" y1={H - 115} x2={W} y2={H - 115} />
						<line x1="0" y1={H - 70} x2={W} y2={H - 70} />
						<line x1="0" y1={H - 25} x2={W} y2={H - 25} />
					</g>
					<path d={expArea} fill="url(#expFill)" />
					<path d={revArea} fill="url(#revFill)" />
					<polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={revLine} />
					<polyline fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={expLine} />
					<circle cx={x(tr.labels.length - 1)} cy={y(tr.revenue[tr.revenue.length - 1])} r="4" fill="#10b981" stroke="#fff" strokeWidth="2" />
					<circle cx={x(tr.labels.length - 1)} cy={y(tr.expenses[tr.expenses.length - 1])} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
				</svg>
				<div className="d-flex justify-content-between mt-2" style={{ fontSize: 11, color: "var(--pm-muted)", padding: "0 4px" }}>
					{tr.labels.map(l => <span key={l}>{l}</span>)}
				</div>
			</div>
			<div className="row g-3 mt-1 text-center">
				<div className="col-4"><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Total Inflow</div><div className={styles.sv} style={{ fontSize: 18 }}>KES {shortM(revSum)}</div></div>
				<div className="col-4"><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Total Outflow</div><div className={styles.sv} style={{ fontSize: 18 }}>KES {shortM(expSum)}</div></div>
				<div className="col-4"><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Net {rlabel}</div><div className={styles.sv} style={{ fontSize: 18, color: revSum >= expSum ? "var(--pm-primary)" : "var(--pm-danger)" }}>{revSum >= expSum ? "+" : "−"} KES {shortM(Math.abs(revSum - expSum))}</div></div>
			</div>
		</>
	);
}

/* ---------- revenue mix donut ---------- */
function MixDonut({ b }: { b: Business }) {
	const total = b.revenueMix.reduce((a, x) => a + x.v, 0);
	const pcts = b.revenueMix.map(x => Math.round((x.v / total) * 100));
	let stops: number[] = []; let cum = 0;
	pcts.forEach(p => { cum += p; stops.push(cum); });
	let conic = `conic-gradient(${b.revenueMix[0].c} 0 ${stops[0]}%)`;
	for (let i = 1; i < b.revenueMix.length; i++) conic += `, ${b.revenueMix[i].c} ${stops[i - 1]}% ${stops[i]}%`;
	return (
		<>
			<div className="d-flex align-items-center justify-content-center py-3">
				<div className={styles.donut} style={{ background: conic }}>
					<div className={styles.donutCenter}><span className={styles.donutVal}>KES {shortM(total)}</span><span className={styles.donutLab}>This Period</span></div>
				</div>
			</div>
			<div className="px-2">
				{b.revenueMix.map((x, i) => (
					<div className={styles.sr} key={x.l}>
						<span className="d-flex align-items-center gap-2"><span className={styles.legendDot} style={{ background: x.c }} />{x.l}</span>
						<strong>KES {shortM(x.v)} <span style={{ color: "var(--pm-muted)" }}>· {pcts[i]}%</span></strong>
					</div>
				))}
			</div>
		</>
	);
}

/* ---------- live country clocks ---------- */
function useClock(tz: string) {
	const [t, setT] = useState("--:--");
	useEffect(() => {
		function u() {
			try { setT(new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" })); }
			catch { setT("--:--"); }
		}
		u();
		const id = setInterval(u, 1000);
		return () => clearInterval(id);
	}, [tz]);
	return t;
}

/* ============================================================================ */
export default function PayMoDashboard() {
	const [currentBiz, setCurrentBiz] = useState("techsol");
	const [currentRange, setCurrentRange] = useState<Range>("30d");
	const [presenceMode, setPresenceMode] = useState<"auto" | "offices" | "analytics">("auto");
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const open = (id: string) => setActiveModal(id);
	const close = () => setActiveModal(null);
	const toast = (msg: string) => { setToastMsg(msg); window.setTimeout(() => setToastMsg(null), 2800); };

	const b = BUSINESSES[currentBiz];
	const tr = TREND(b.kpi.revenue, b.kpi.expenses, currentRange);
	const revSum = tr.revenue.reduce((a, c) => a + c, 0);
	const expSum = tr.expenses.reduce((a, c) => a + c, 0);
	const label = currentRange === "7d" ? "7 DAYS" : currentRange === "30d" ? "THIS MONTH" : currentRange === "90d" ? "THIS QUARTER" : "THIS YEAR";
	const typeLabel = b.type === "online" ? "Online" : b.type === "physical" ? "On-the-ground" : "Hybrid";

	// clock
	const [now, setNow] = useState(new Date());
	useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
	const h = now.getHours();
	const greeting = h < 12 ? "Good morning, Amina" : h < 17 ? "Good afternoon, Amina" : "Good evening, Amina";

	// current month calendar
	const mon = now.getMonth(), yr = now.getFullYear();
	const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const first = new Date(yr, mon, 1).getDay();
	const days = new Date(yr, mon + 1, 0).getDate();
	const today = now.getDate();
	const events = [3, 8, 10, 15, 22, 25, 28];
	const calCells: React.ReactNode[] = [];
	for (let i = 0; i < first; i++) calCells.push(<div key={`b${i}`} />);
	for (let d = 1; d <= days; d++) {
		calCells.push(
			<div
				key={d}
				className={`${styles.calD} ${d === today ? styles.calToday : ""} ${events.includes(d) && d !== today ? styles.calEvent : ""}`}
				onClick={events.includes(d) ? () => toast(`Scheduled event on ${names[mon]} ${d}`) : undefined}
			>{d}</div>
		);
	}

	const agingTotal = b.aging.reduce((a, x) => a + x.v, 0);
	const mode = presenceMode === "auto" ? (b.type !== "physical" ? "analytics" : "offices") : presenceMode;

	return (
		<div className={styles.dashboard}>
			{/* ======================= SIDEBAR ======================= */}
		

			<div className={styles.main}>
				{/* ======================= HEADER ======================= */}
				

				{/* ======================= PAGE BAR ======================= */}
				<div className={styles.pageBar}>
					<div>
						<div className={styles.breadcrumb}><a href="#">Business Portal</a> / <strong>Command Center</strong></div>
						{/* <h2 className={styles.pageH2}>Business Overview <Badge tone={typeTone}>{typeLabel}</Badge></h2>
						<p className={styles.pageSub}>One view of cash, performance, people, and what needs your attention.</p> */}
					</div>
					<div className="d-flex gap-2 flex-wrap align-items-center">
						<div className={styles.seg}>
							{(Object.keys(TREND(0, 0, "30d")).length >= 0 ? (["7d", "30d", "90d", "1y"] as Range[]) : []).map(r => (
								<button key={r} className={r === currentRange ? "active" : ""} onClick={() => { setCurrentRange(r); toast("Now viewing " + (r === "7d" ? "7 days" : r === "30d" ? "30 days" : r === "90d" ? "90 days" : "1 year") + " of data"); }}>{r.toUpperCase()}</button>
							))}
						</div>
						<button className={styles.btnPm} onClick={() => open("consolidatedReportModal")}><i className="bi bi-file-earmark-bar-graph" /> Reports</button>
						<button className={styles.btnPm} onClick={() => open("inviteUserModal")}><i className="bi bi-person-plus" /> Add User</button>
						<button className={`${styles.btnPm} ${styles.btnPmDark}`} onClick={() => open("newInvoiceModal")}><i className="bi bi-plus-lg" /> New Invoice</button>
					</div>
				</div>

				<div className={styles.content}>
					{/* ======================= WELCOME ======================= */}
					<div className={styles.welcome}>
						<div>
							<h2>{greeting}</h2>
							<p>Here's what's happening with <strong>{b.name}</strong> today.</p>
						</div>
						<div className="d-flex align-items-center gap-2 flex-wrap">
							<div className={styles.welcomeChip} onClick={() => open("healthCheckModal")}><i className="bi bi-activity" /> Health <strong>{b.health.score}/100</strong></div>
							<div className={styles.welcomeChip} onClick={() => open("cashFlowDetailsModal")}><i className="bi bi-wallet2" /> Cash <strong>KES {shortM(b.kpi.cash)}</strong></div>
						</div>
					</div>

					{/* ======================= KPI ROW ======================= */}
					<div className="row g-3">
						<div className="col-lg-3 col-md-6">
							<div className={`${styles.card} ${styles.cardBiz} ${styles.hoverable}`} onClick={() => open("cashFlowDetailsModal")}>
								<div className="d-flex justify-content-between align-items-start">
									<p className={styles.sl} style={{ color: "rgba(255,255,255,.7)" }}>CASH POSITION</p>
									<Badge tone="dark">+{shortM(b.kpi.cashTransit)} transit</Badge>
								</div>
								<div className={styles.sv} style={{ color: "#fff" }}>KES {shortM(b.kpi.cash)}</div>
								<div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}><i className="bi bi-bank" /> Wallet + {b.currenciesCount} currencies</div>
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={`${styles.card} ${styles.hoverable}`} onClick={() => open("revenueDetailsModal")}>
								<div className="d-flex justify-content-between align-items-start">
									<p className={styles.sl}>REVENUE · {label}</p>
									<span className={styles.textAccent} style={{ fontSize: 12, fontWeight: 600 }}><i className="bi bi-graph-up-arrow" /> +12%</span>
								</div>
								<div className={styles.sv}>KES {shortM(revSum)}</div>
								<div className="mt-2" style={{ fontSize: 11, color: "var(--pm-muted)" }}>Net inflow {currentRange === "7d" ? "this week" : currentRange === "30d" ? "this month" : currentRange === "90d" ? "this quarter" : "this year"}</div>
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={`${styles.card} ${styles.hoverable}`} onClick={() => open("expenseDetailsModal")}>
								<div className="d-flex justify-content-between align-items-start">
									<p className={styles.sl}>EXPENSES · {label}</p>
									<span className={styles.textDanger} style={{ fontSize: 12, fontWeight: 600 }}><i className="bi bi-graph-down-arrow" /> +4%</span>
								</div>
								<div className={styles.sv} style={{ color: "var(--pm-danger)" }}>KES {shortM(expSum)}</div>
								<div className="mt-2" style={{ fontSize: 11, color: "var(--pm-muted)" }}>Outflow {currentRange === "7d" ? "this week" : currentRange === "30d" ? "this month" : currentRange === "90d" ? "this quarter" : "this year"}</div>
							</div>
						</div>
						<div className="col-lg-3 col-md-6">
							<div className={styles.card} style={{ borderLeft: "3px solid var(--pm-warning)" }}>
								<div className="d-flex justify-content-between align-items-start">
									<p className={styles.sl} style={{ color: "var(--pm-warning)" }}>NET MARGIN</p>
									<Badge tone="success">Healthy</Badge>
								</div>
								<div className={styles.sv} style={{ color: "var(--pm-primary)" }}>{b.kpi.margin}%</div>
								<button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => open("pendingApprovalsModal")}><i className="bi bi-inbox" /> 5 Approvals</button>
							</div>
						</div>
					</div>

					{/* ======================= TREND + DONUT ======================= */}
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-graph-up" iconColor="var(--pm-primary)" title="Cash Flow Trend" sub={`Revenue vs expenses — ${label.toLowerCase()}`} actions={undefined} onOpen={open} />
								<TrendChart b={b} range={currentRange} />
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-pie-chart" iconColor="var(--pm-purple)" title="Revenue Mix" sub="Where money comes from" actions={[{ label: "Detail", modal: "revenueDetailsModal" }]} onOpen={open} />
								<MixDonut b={b} />
							</div>
						</div>
					</div>

					{/* ======================= AGING + OBLIGATIONS ======================= */}
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-hourglass-split" iconColor="var(--pm-warning)" title="Receivables & Aging" sub="Outstanding invoices by overdue bucket" actions={[{ label: "Reminders", icon: "bi-envelope", modal: "agingInvoicesModal" }]} onOpen={open} />
								<div className="d-flex gap-2">
									{b.aging.map(x => (
										<div key={x.l} className={styles.ageCard} style={{ background: x.bg }} onClick={() => open("agingInvoicesModal")}>
											<div style={{ fontSize: 11, color: x.t, fontWeight: 600 }}>{x.l}</div>
											<div style={{ fontSize: 20, fontWeight: 700, color: x.t }}>KES {shortM(x.v)}</div>
											<div className="mt-1"><div className={styles.pmProgress}><div className={styles.pmProgressBar} style={{ width: `${Math.round((x.v / agingTotal) * 100)}%`, background: x.c }} /></div></div>
										</div>
									))}
								</div>
								<div className="mt-3 d-flex justify-content-between align-items-center p-2 px-3 rounded" style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}>
									<span style={{ fontSize: 13 }}><strong>Total outstanding:</strong> KES {shortM(agingTotal)}</span>
									<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => open("agingInvoicesModal")}><i className="bi bi-send-check" /> Send Auto-Reminders</button>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-calendar-event" iconColor="var(--pm-info)" title="Upcoming Obligations" sub="Next 14 days — plan your cash" actions={undefined} onOpen={open} />
								{b.oblig.map(o => (
									<div className={styles.obligItem} key={o.t}>
										<div className={styles.iconCircle} style={{ background: o.c, color: o.tc }}><i className={`bi ${o.i}`} /></div>
										<div className={styles.flex1}><div style={{ fontWeight: 600 }}>{o.t}</div><div className={styles.mutedSmall}>{o.d}</div></div>
										<strong style={{ color: o.tc }}>KES {o.v}</strong>
									</div>
								))}
								<button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`} onClick={() => open("schedulePaymentModal")}><i className="bi bi-calendar-plus" /> View Full Payment Calendar</button>
							</div>
						</div>
					</div>

					{/* ======================= TRANSACTIONS + QUICK ACTIONS ======================= */}
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-arrow-left-right" iconColor="var(--pm-primary)" title="Recent Transactions" sub={`Latest activity across all ${b.currenciesCount} currencies`} actions={[{ label: "Statement", icon: "bi-download", modal: "statementModal" }]} onOpen={open} />
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead><tr><th>Description</th><th>Category</th><th>Status</th><th>Date</th><th className="text-end">Amount</th></tr></thead>
										<tbody>
											{b.tx.map((t, i) => (
												<tr key={i} style={{ cursor: "pointer" }} onClick={() => open("transactionDetailsModal")}>
													<td><div className="d-flex align-items-center gap-2"><span className={styles.iconCircle} style={{ width: 30, height: 30, fontSize: 14, background: "var(--pm-surface-2)", color: t.cc }}><i className={`bi ${t.ic}`} /></span><strong>{t.d}</strong></div></td>
													<td>{t.cat}</td>
													<td><Badge tone={t.stc}>{t.st}</Badge></td>
													<td>{t.date}</td>
													<td className="text-end"><strong style={{ color: t.dir === "in" ? "var(--pm-primary)" : "var(--pm-danger)" }}>{t.dir === "in" ? "+" : "−"}KES {shortM(t.amt)}</strong></td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<h3 className={styles.st} style={{ marginBottom: 14 }}>Quick Actions</h3>
								<div className={styles.quickGrid}>
									{[
										{ label: "Invoice", icon: "bi-receipt", color: "var(--pm-primary)", modal: "newInvoiceModal" },
										{ label: "Payroll", icon: "bi-people", color: "var(--pm-primary)", modal: "runPayrollModal" },
										{ label: "Disburse", icon: "bi-send", color: "var(--pm-info)", modal: "disburseFundsModal" },
										{ label: "Transfer", icon: "bi-arrow-left-right", color: "var(--pm-purple)", modal: "interCompanyTransferModal" },
										{ label: "Add Team", icon: "bi-person-plus", color: "var(--pm-warning)", modal: "inviteUserModal" },
										{ label: "KYB", icon: "bi-shield-check", color: "var(--pm-muted)", modal: "kybUploadModal" },
									].map(qa => (
										<button key={qa.label} className={styles.quickBtn} onClick={() => open(qa.modal)}><i className={`bi ${qa.icon}`} style={{ color: qa.color }} />{qa.label}</button>
									))}
								</div>
								<div className="p-3 mt-3 rounded" style={{ background: "var(--pm-accent-soft)", border: "1px solid rgba(16,185,129,.2)" }}>
									<div style={{ fontSize: 12, fontWeight: 700, color: "#047857", marginBottom: 4 }}><i className="bi bi-stars" /> Smart Suggestion</div>
									<div style={{ fontSize: 12, color: "#065F46" }}>You have KES {shortM(Math.round(b.kpi.cash * 0.5))} idle cash. Consider investing to earn ~11% p.a.</div>
									<button className={`${styles.btnPm} ${styles.btnSm} mt-2 w-100`} style={{ background: "#fff", color: "#047857", borderColor: "rgba(16,185,129,.3)" }} onClick={() => open("investmentModal")}><i className="bi bi-graph-up-arrow" /> View Investment Options</button>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= FORECAST + TEAM ======================= */}
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-graph-down" iconColor="var(--pm-ink)" title="Cash Flow Forecast" sub="Projected balance — next 4 weeks" actions={undefined} onOpen={open} />
								<div className="d-flex align-items-end gap-2 w-100" style={{ height: 120, borderBottom: "1px solid var(--pm-border)", paddingTop: 10 }}>
									{b.forecast.weeks.map((w, i) => {
										const hgt = Math.max(18, (Math.abs(w.v) / 2600000) * 100);
										const color = w.v > 0 ? "var(--pm-primary)" : i % 2 === 0 ? "var(--pm-info)" : "var(--pm-primary)";
										return <div key={i} className={styles.flex1} style={{ textAlign: "center" }}><div className="rounded w-100" style={{ height: hgt, background: color, minHeight: 6 }} /><div style={{ fontSize: 10, color: "var(--pm-muted)", marginTop: 4 }}>W{Math.floor(i / 2) + 1}{i % 2 ? "·out" : "·in"}</div></div>;
									})}
								</div>
								<div className="row g-2 text-center mt-1">
									<div className="col-4"><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Start</div><div style={{ fontWeight: 700 }}>{shortM(b.forecast.start)}</div></div>
									<div className="col-4"><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Low Point</div><div style={{ fontWeight: 700, color: "var(--pm-warning)" }}>{shortM(b.forecast.low)}</div></div>
									<div className="col-4"><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>End Balance</div><div style={{ fontWeight: 700, color: "var(--pm-primary)" }}>{shortM(b.forecast.end)}</div></div>
								</div>
								<button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`} onClick={() => open("cashForecastModal")}><i className="bi bi-diagram-3" /> View Full Forecast</button>
							</div>
						</div>
						<div className="col-lg-7">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-people" iconColor="var(--pm-purple)" title="Administrations & Team" sub={`${b.team.users} users · ${b.team.approvers} approvers · ${b.team.mfa} MFA active`} actions={[{ label: "Roles", icon: "bi-shield-lock", modal: "rolePermissionsModal" }]} onOpen={open} />
								<div className="d-flex gap-2 flex-wrap mb-3">
									{[
										{ l: "Users", v: b.team.users, bg: "var(--pm-surface-2)" },
										{ l: "Approvers", v: b.team.approvers, bg: "var(--pm-surface-2)" },
										{ l: "MFA Active", v: `${b.team.mfa}/${b.team.users}`, bg: "var(--pm-accent-soft)" },
										{ l: "Pending Invite", v: b.team.pending, bg: "var(--pm-warning-soft)" },
									].map(c => (
										<div key={c.l} className={`${styles.flex1} ${styles.miniStat}`} style={{ background: c.bg }}><div className={styles.miniStatBig}>{c.v}</div><div className={styles.miniStatLabel}>{c.l}</div></div>
									))}
								</div>
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead><tr><th>User</th><th>Role</th><th>Approval Limit</th><th>MFA</th><th></th></tr></thead>
										<tbody>
											{b.team.rows.map(r => (
												<tr key={r.name}>
													<td><div className="d-flex align-items-center gap-2"><div className={styles.avatar} style={{ width: 28, height: 28, fontSize: 10, background: r.color }}>{r.initials}</div><strong>{r.name}</strong></div></td>
													<td>{r.role}</td>
													<td>{r.limit}</td>
													<td><Badge tone={r.stc}>{r.mfa === "On" ? <><i className="bi bi-phone" /> On</> : <><i className="bi bi-exclamation-circle" /> Pending</>}</Badge></td>
													<td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => open("viewUserModal")}>Edit</button></td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= CLIENTS + PRESENCE ======================= */}
					<div className="row g-3">
						<div className="col-lg-6">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-people-fill" iconColor="var(--pm-primary)" title="My Clients" sub={`${b.clients.total} active accounts · ${b.clients.repeat}% repeat`} actions={[{ label: "View All", icon: "bi-collection", modal: "clientsModal" }]} onOpen={open} />
								<div className="row g-2 text-center mb-2">
									<div className="col-6"><div className={`${styles.miniStat}`} style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}><div className={styles.miniStatBig}>{b.clients.total}</div><div className={styles.miniStatLabel}>Total Clients</div></div></div>
									<div className="col-6"><div className={styles.miniStat} style={{ background: "var(--pm-accent-soft)" }}><div className={styles.miniStatBig} style={{ color: "var(--pm-primary)" }}>{b.clients.repeat}%</div><div className={styles.miniStatLabel}>Repeat Rate</div></div></div>
								</div>
								{b.clients.top.slice(0, 4).map((c, i) => {
									const colors = ["var(--pm-primary)", "var(--pm-info)", "var(--pm-warning)", "var(--pm-purple)"];
									const tone: Tone = c.status === "VIP" ? "purple" : c.status === "Risky" ? "danger" : c.status === "Active" ? "success" : "info";
									return (
										<div className={styles.clientItem} key={c.name}>
											<div className={styles.clientAvatar} style={{ background: colors[i % 4] }}>{c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
											<div className={styles.flex1}><div style={{ fontWeight: 600 }}>{c.name}</div><div className={styles.mutedSmall}>{c.country} · outstanding {c.outstanding > 0 ? "KES " + shortM(c.outstanding) : "nil"}</div></div>
											<Badge tone={tone}>{c.status}</Badge>
										</div>
									);
								})}
							</div>
						</div>
						<div className="col-lg-6">
							<div className={`${styles.card} h-100`}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
									<div>
										<h3 className={styles.st}><i className="bi bi-buildings" style={{ color: "var(--pm-primary)" }} />{mode === "offices" ? "Offices & Branches" : "Online Analytics"}</h3>
										<p className={styles.ss}>{mode === "offices" ? `${b.offices.length} locations across your footprint` : "Digital performance & channels"}</p>
									</div>
									<div className={styles.presenceSwitch}>
										<button className={mode === "offices" ? "active" : ""} onClick={() => setPresenceMode("offices")}><i className="bi bi-buildings" /> Offices</button>
										<button className={mode === "analytics" ? "active" : ""} onClick={() => setPresenceMode("analytics")}><i className="bi bi-bar-chart" /> Analytics</button>
									</div>
								</div>
								{mode === "offices" ? (
									<div className="row g-2">
										{b.offices.map(o => (
											<div className="col-sm-6" key={o.n}><div className={styles.officeCard}>
												<div className={styles.officeTag} style={{ color: "var(--pm-primary)" }}>{o.tag}</div>
												<div style={{ fontWeight: 700, fontSize: 14, margin: "4px 0" }}>{o.n}</div>
												<div style={{ fontSize: 12, color: "var(--pm-muted)" }}><i className="bi bi-geo-alt" /> {o.city} · {o.p}</div>
												<div className="mt-2"><Badge tone="success"><i className="bi bi-check-circle" /> {o.st}</Badge></div>
											</div></div>
										))}
									</div>
								) : (
									<>
										<div className="row g-2 mb-2">
											{[
												{ l: "Visits", v: fmt(b.analytics.visits) },
												{ l: "Sessions", v: fmt(b.analytics.sessions) },
												{ l: "Conversion", v: b.analytics.conversion + "%", c: "var(--pm-primary)" },
												{ l: "Avg Order", v: "KES " + shortM(b.analytics.aov) },
											].map(a => (
												<div className="col-6" key={a.l}><div className={styles.miniStat} style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}><div className={styles.miniStatBig} style={{ color: a.c }}>{a.v}</div><div className={styles.miniStatLabel}>{a.l}</div></div></div>
											))}
										</div>
										<div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Traffic Channels</div>
										{b.analytics.channels.map(ch => (
											<div key={ch[0]} className="mb-1">
												<div className="d-flex justify-content-between" style={{ fontSize: 12 }}><span>{ch[0]}</span><strong>{ch[1]}%</strong></div>
												<div className={styles.pmProgress}><div className={styles.pmProgressBar} style={{ width: ch[1] + "%", background: ch[2] }} /></div>
											</div>
										))}
									</>
								)}
							</div>
						</div>
					</div>

					{/* ======================= REGIONS + CALENDAR ======================= */}
					<div className="row g-3">
						<div className="col-lg-8">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-globe-americas" iconColor="var(--pm-warning)" title="Regions & Countries of Operation" sub={`${b.regions.length} countries · ${b.clients.total} clients regionally`} actions={undefined} onOpen={open} />
								<div className="row g-3">
									{b.regions.map(r => (
										<div className="col-sm-6 col-lg-6" key={r.code}><div className={styles.regionCard} onClick={() => toast(`${r.country} operations opened (demo)`)}>
											<div className="d-flex justify-content-between align-items-start">
												<span style={{ fontSize: 26 }}>{r.flag}</span>
												<Badge tone={r.hq ? "success" : "info"}>{r.hq ? "HQ / Active" : "Active"}</Badge>
											</div>
											<div style={{ fontWeight: 700, fontSize: 15, margin: "4px 0" }}>{r.country} <span style={{ fontSize: 11, color: "var(--pm-muted)" }}>· {r.code}</span></div>
											<div className={styles.mono} style={{ fontWeight: 700, fontSize: 18 }}><RegionClock tz={r.tz} /></div>
											<div className="d-flex justify-content-between mt-2" style={{ fontSize: 12, color: "var(--pm-muted)" }}><span><i className="bi bi-people" /> {r.clients} clients</span><span>Revenue KES {shortM(r.hq ? b.kpi.revenue : r.revenue)}</span></div>
										</div></div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-calendar2-week" iconColor="var(--pm-ink)" title="Operations Calendar" sub={`${names[mon]} ${yr} schedule`} actions={undefined} onOpen={open} />
								<div style={{ fontFamily: "var(--pm-font-display)", fontWeight: 700, marginBottom: 10 }}>{names[mon]} {yr}</div>
								<div className={styles.calGrid}>
									{["S", "M", "T", "W", "T", "F", "S"].map(d => <div className={styles.calH} key={d}>{d}</div>)}
									{calCells}
								</div>
								<div className="mt-3">
									<div className="p-2 rounded d-flex align-items-center gap-2 mb-2" style={{ background: "var(--pm-danger-soft)", fontSize: 12 }}><i className="bi bi-flag-fill text-danger" /> <strong>Payroll due</strong> — in {Math.max(0, 28 - today)} days</div>
									<div className="p-2 rounded d-flex align-items-center gap-2" style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}><i className="bi bi-bank text-warning" /> <strong>KRA filing</strong> — 7 days</div>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= CURRENCIES + BANKS + VIRTUAL ======================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-cash-stack" iconColor="var(--pm-primary)" title="Multi-Currency" sub="Hold, receive & pay globally" actions={undefined} onOpen={open} />
								{b.currencies.map(c => (
									<div className={styles.currencyCard} key={c.code} style={{ marginBottom: 8 }}>
										<div className="d-flex justify-content-between align-items-center">
											<div className="d-flex align-items-center gap-2"><span className={styles.iconCircle} style={{ width: 38, height: 38, fontSize: 16, background: c.primary ? "var(--pm-accent-soft)" : "var(--pm-surface-2)" }}><i className={`bi bi-${c.icon}`} /></span>
												<div><strong>{c.code}</strong><div className={styles.mutedSmall}>{c.name}</div></div></div>
											<div className="text-end"><div className={styles.mono} style={{ fontWeight: 700 }}>{c.primary ? "KES " + fmt(c.bal) : fmt(c.bal)}</div>{c.primary ? <Badge tone="success">Primary</Badge> : <Badge tone="info">Active</Badge>}</div>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-bank" iconColor="var(--pm-ink)" title="Linked Bank Accounts" sub="For payouts & settlements" actions={undefined} onOpen={open} />
								{b.banks.map(x => (
									<div className={styles.bankItem} key={x.name}>
										<div className={styles.bankLogo} style={{ background: x.color }}>{x.short}</div>
										<div className={styles.flex1}><strong>{x.name}</strong><div className={styles.mutedSmall}>{x.acct} · for payouts</div></div>
										<Badge tone={x.tone}>{x.status}</Badge>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-credit-card-2-front" iconColor="var(--pm-info)" title="Virtual Accounts" sub="Collect & receive seamlessly" actions={undefined} onOpen={open} />
								{b.virtual.map(v => (
									<div className={styles.virtualAcct} key={v.id}>
										<div className={styles.iconCircle} style={{ background: "var(--pm-info-soft)", color: "var(--pm-info)" }}><i className="bi bi-credit-card-2-front" /></div>
										<div className={styles.flex1}><strong style={{ fontFamily: "monospace" }}>{v.id}</strong><div className={styles.mutedSmall}>{v.desc}</div></div>
										<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => toast(`Payment link for ${v.id} copied`)}><i className={`bi bi-${v.icon}`} /></button>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* ======================= TOOLS + MULTI-BIZ ======================= */}
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-plug" iconColor="var(--pm-info)" title="Connected Tools & Integrations" sub="Your business tool ecosystem" actions={undefined} onOpen={open} />
								<div className="row g-2">
									{b.tools.map(t => (
										<div className="col-sm-6" key={t.name}><div className={styles.toolChip}>
											<div className={styles.toolIcon} style={{ background: t.color }}><i className={`bi ${t.icon}`} /></div>
											<div className={styles.flex1}><strong style={{ fontSize: 13 }}>{t.name}</strong><div className={styles.mutedSmall}>{t.status === "Connected" ? "Syncing automatically" : "Not connected"}</div></div>
											{t.status === "Connected" ? <Badge tone="success"><i className="bi bi-check-circle" /> Connected</Badge> : <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => open("connectToolModal")}>Connect</button>}
										</div></div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-diagram-3" iconColor="var(--pm-purple)" title="Multi-Business Group" sub="Switch accounts & view consolidated data" actions={[{ label: "Switch", modal: "switchBusinessModal" }]} onOpen={open} />
								<div className="p-3 rounded mb-3 d-flex justify-content-between align-items-center" style={{ background: "var(--pm-purple-soft)" }}>
									<div><div style={{ fontSize: 11, color: "#6D28D9", fontWeight: 700 }}>CONSOLIDATED GROUP CASH</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--pm-purple)" }}>KES {b.groupCash}</div></div>
									<button className={`${styles.btnPm} ${styles.btnSm}`} style={{ borderColor: "var(--pm-purple)", color: "var(--pm-purple)" }} onClick={() => open("consolidatedReportModal")}><i className="bi bi-file-earmark-bar-graph" /> Group Report</button>
								</div>
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead><tr><th>Entity</th><th>Type</th><th>Cash</th><th></th></tr></thead>
										<tbody>
											{ORDER.map(id => {
												const x = BUSINESSES[id];
												const cur = id === currentBiz;
												const t: Tone = x.type === "online" ? "info" : x.type === "physical" ? "success" : "purple";
												return (
													<tr key={id} style={cur ? { background: "var(--pm-surface-2)" } : undefined}>
														<td><div className="d-flex align-items-center gap-2"><div className={styles.avatar} style={{ width: 26, height: 26, fontSize: 10, background: x.color }}>{x.initials}</div><strong>{x.name}</strong>{cur && <Badge tone="info">Viewing</Badge>}</div></td>
														<td><Badge tone={t}>{x.type}</Badge></td>
														<td>{shortM(x.kpi.cash)}</td>
														<td>{cur ? <button className={`${styles.btnPm} ${styles.btnSm}`} disabled>Active</button> : <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => { setCurrentBiz(id); toast("Now viewing " + x.name + " — data refreshed"); }}>View</button>}</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= INVOICES + STATUTORY ======================= */}
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-receipt" iconColor="var(--pm-primary)" title="Invoices & Payables" sub={`${b.clients.total} invoices this period · KES ${shortM(b.kpi.revenue)} billed`} actions={[{ label: "Aging Report", icon: "bi-list-check", modal: "agingInvoicesModal" }]} onOpen={open} />
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
										<tbody>
											{["Paid", "Paid", "Pending", "Overdue"].map((st, i) => {
												const c = b.clients.rows[i % b.clients.rows.length];
												const amt = Math.round(c.outstanding || b.kpi.revenue * 0.1);
												const tone: Tone = st === "Paid" ? "success" : st === "Pending" ? "warning" : "danger";
												return (
													<tr key={i} style={{ cursor: "pointer" }} onClick={() => toast(`Invoice INV-2025-${130 + i} details (demo)`)}>
														<td>INV-2025-{130 + i}</td><td>{c.name}</td><td>KES {fmt(amt)}</td><td><Badge tone={tone}>{st}</Badge></td><td style={{ fontSize: 12, color: "var(--pm-muted)" }}>{i * 3 + 5} days</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-bank2" iconColor="var(--pm-danger)" title="Statutory & Tax" sub="KRA obligations this period" actions={[{ label: "View", icon: "bi-file-earmark-bar-graph", modal: "statutoryModal" }]} onOpen={open} />
								{[
									["VAT (16%) Returns", Math.round(b.kpi.expenses * 0.2), "2 days", "Due soon", "warning"],
									["PAYE (Income Tax)", Math.round(b.kpi.expenses * 0.12), "5 days", "Due", "danger"],
									["NSSF Contributions", Math.round(b.kpi.expenses * 0.04), "12 days", "Scheduled", "info"],
									["SHIF / NHIF", Math.round(b.kpi.expenses * 0.03), "12 days", "Scheduled", "info"],
								].map((o: unknown) => {
									const ob = o as [string, number, string, string, Tone];
									return (
										<div className={styles.obligItem} key={ob[0]}>
											<div className={styles.iconCircle} style={{ background: `var(--pm-${ob[4]}-soft)`, color: `var(--pm-${ob[4]})` }}><i className={`bi ${ob[4] === "danger" ? "bi-shield-exclamation" : ob[4] === "warning" ? "bi-clock" : "bi-file-earmark-text"}`} /></div>
											<div className={styles.flex1}><div style={{ fontWeight: 600 }}>{ob[0]}</div><div className={styles.mutedSmall}>due in {ob[2]}</div></div>
											<div className="text-end"><strong>KES {shortM(ob[1])}</strong><div><Badge tone={ob[4]}>{ob[3]}</Badge></div></div>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* ======================= BUDGET + RECURRING ======================= */}
					<div className="row g-3">
						<div className="col-lg-6">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-pie-chart-fill" iconColor="var(--pm-info)" title="Departments & Budget" sub="Spend vs budget by department" actions={undefined} onOpen={open} />
								{[
									["Engineering", 38, "var(--pm-primary)"],
									["Sales & Marketing", 22, "var(--pm-accent)"],
									["Operations", 27, "var(--pm-warning)"],
									["Administration", 13, "var(--pm-info)"],
								].map(d => (
									<div className="mb-3" key={d[0] as string}>
										<div className="d-flex justify-content-between" style={{ fontSize: 13 }}><strong>{d[0]}</strong><span>KES {shortM(Math.round((b.kpi.expenses * (d[1] as number)) / 100))} <span style={{ color: "var(--pm-muted)" }}>of budget</span></span></div>
										<div className={styles.pmProgress}><div className={styles.pmProgressBar} style={{ width: d[1] + "%", background: d[2] as string }} /></div>
										<div className={styles.mutedSmall} style={{ marginTop: 3 }}>{d[1]}% of departmental budget used</div>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-6">
							<div className={`${styles.card} h-100`}>
								<SectionHead icon="bi-arrow-repeat" iconColor="var(--pm-purple)" title="Recurring Payments" sub="Active subscriptions & standing orders" actions={undefined} onOpen={open} />
								{[
									["AWS Cloud Hosting", "bi-cloud", "var(--pm-info-soft)", "var(--pm-info)", 85000, "Oct 25"],
									["Office 365 / Google Workspace", "bi-microsoft", "var(--pm-purple-soft)", "var(--pm-purple)", 24000, "Oct 28"],
									["QuickBooks Accounting", "bi-journal", "var(--pm-accent-soft)", "var(--pm-primary)", 12000, "Nov 1"],
									["Cybersecurity Suite", "bi-shield-check", "var(--pm-warning-soft)", "var(--pm-warning)", 18000, "Nov 3"],
								].map(it => (
									<div className={styles.obligItem} key={it[0] as string}>
										<div className={styles.iconCircle} style={{ background: it[2] as string, color: it[3] as string }}><i className={`bi ${it[1]}`} /></div>
										<div className={styles.flex1}><div style={{ fontWeight: 600 }}>{it[0]}</div><div className={styles.mutedSmall}>next charge {it[5]}</div></div>
										<strong>KES {shortM(it[4] as number)}</strong>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* ======================= PROFILE ======================= */}
					<div className={styles.card}>
						<SectionHead icon="bi-building-check" iconColor="var(--pm-info)" title="Business Profile & KYB" sub="Corporate details and verification status" actions={[{ label: "", icon: "bi-pencil", modal: "businessSettingsModal" }]} onOpen={open} />
						<div className="row g-2 mb-3">
							{[
								{ l: "Company Name", v: b.name },
								{ l: "KRA PIN", v: b.meta.match(/P\d+[A-Z]/)?.[0] || "—" },
								{ l: "Business Type", v: `${b.sector} · ${typeLabel}` },
								{ l: "Reg. No.", v: b.meta.match(/Reg: ([^·]+)/)?.[1] || "—" },
							].map(c => (
								<div className="col-sm-6" key={c.l}><div className="p-2 border rounded"><div className={styles.mutedSmall}>{c.l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.v}</div></div></div>
							))}
						</div>
						{[
							["Certificate of Incorporation", "Verified", "success"],
							["KRA PIN Certificate", "Verified", "success"],
							["Tax Compliance Certificate", "Valid Dec 2025", "success"],
							["Annual Returns (CR12)", "Missing 2024", "danger"],
						].map(k => (
							<div key={k[0]} className={styles.sr} style={{ padding: "8px 2px" }}><span style={{ fontSize: 13 }}>{k[0]}</span><Badge tone={k[2] as Tone}>{k[1]}</Badge></div>
						))}
						<button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => open("kybUploadModal")}><i className="bi bi-shield-check" /> Manage Documents</button>
					</div>
				</div>{/* content */}
			</div>{/* main */}

			{/* ======================= ALL MODALS ======================= */}
			<PayMoModals
				active={activeModal}
				onClose={close}
				onOpen={open}
				business={b}
				order={ORDER}
				onSwitchBiz={(id) => { setCurrentBiz(id); toast("Now viewing " + BUSINESSES[id].name + " — data refreshed"); }}
			/>

			{/* ======================= TOAST ======================= */}
			{toastMsg && (
				<div className={styles.toast}>
					<i className="bi bi-check-circle-fill" />
					<span>{toastMsg}</span>
				</div>
			)}
		</div>
	);
}

/* small helpers used above */
function RegionClock({ tz }: { tz: string }) {
	const time = useClock(tz);
	return <>{time}</>;
}
