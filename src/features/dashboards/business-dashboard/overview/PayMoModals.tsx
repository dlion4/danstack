import { useEffect, useState, type ReactNode } from "react";
import styles from "./paymoDashboard.module.css";
import { BUSINESSES, ORDER, CUR_RATES, fmt, shortM } from "./paymoData";
import type { Business, Tone } from "./paymoData";

/* ============================================================================
   PayMo Business — Command Center (legacy page 3.1)
   Modal layer — 31 modals, multi-step flows (payroll/transfer/invite/invoice),
   action modals with busy→receipt, tabbed detail modals.
   ========================================================================== */

interface ModalsProps {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	business: Business;
	order: string[];
	onSwitchBiz: (id: string) => void;
}

/* ---------- option lists ---------- */
const _PROVIDERS = ["M-Pesa", "Airtel Money", "T-Kash", "Pesalink", "Equity Mobile"];
void _PROVIDERS;
const PAY_METHODS = ["Payment Link (Email/SMS)", "Bank Transfer", "M-Pesa Till", "Card Gateway"];
const CURRENCIES = ["KES", "USD", "UGX", "EUR", "GBP"];
const COUNTRY = ["Kenya", "Uganda", "Tanzania", "Rwanda", "Nigeria", "Ghana", "South Africa"];
const ROLES = ["Admin", "Finance Admin", "HR Manager", "Sales", "Viewer"];
const DOC_TYPES = ["CR12 / Annual Returns", "Certificate of Incorporation", "Tax Compliance"];

/* ============================================================================ */
/* Modal shell (Bootstrap look, React state driven)                            */
/* ============================================================================ */
type Size = "md" | "lg" | "xl";
function MBox({ id, active, title, size = "md", onClose, children, footer }: {
	id: string; active: string | null; title: ReactNode; size?: Size;
	onClose: () => void; children: ReactNode; footer?: ReactNode;
}) {
	if (active !== id) return null;
	return (
		<>
			<div className={styles.backdrop} onClick={onClose} />
			<div className={styles.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
				<div className={`${styles.modalBox} ${size === "lg" ? styles.modalBoxLg : ""} ${size === "xl" ? styles.modalBoxXl : ""}`}>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>{title}</h5>
						<button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
					</div>
					<div className={styles.modalBody}>{children}</div>
					{footer && <div className={styles.modalFooter}>{footer}</div>}
				</div>
			</div>
		</>
	);
}

function BusyOverlay() {
	return (
		<div className={styles.loadingOv}>
			<div className={styles.spinner} />
			<p className={styles.loadingLabel}>Processing...</p>
		</div>
	);
}

/* ---------- badges / buttons reuse ---------- */
function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
	const map: Record<Tone, string> = { success: styles.badgeS, warning: styles.badgeW, danger: styles.badgeD, info: styles.badgeI, purple: styles.badgeP, dark: styles.badgeK };
	return <span className={`${styles.badge} ${map[tone]}`}>{children}</span>;
}

/* ============================================================================ */
export default function PayMoModals({ active, onClose, onOpen, business: b, order, onSwitchBiz }: ModalsProps) {
	/* ---------- state ---------- */
	const [results, setResults] = useState<Record<string, { msg: string; ref?: string }>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({ pay: 1, trans: 1, invite: 1, inv: 1 });
	const [tabs, setTabs] = useState<Record<string, string>>({ ws: "gen", wd: "overview" });
	const [pin, setPin] = useState<Record<number, string>>({});
	const sw = (prefix: string, key: string) => setTabs(prev => ({ ...prev, [prefix]: key }));

	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ pay: 1, trans: 1, invite: 1, inv: 1 });
			setBusy(null);
			setTabs({ ws: "gen", wd: "overview" });
		}
	}, [active]);

	/* ---------- legacy action (busy → receipt) ---------- */
	const doAction = (id: string, msg: string, ref?: string) => {
		setBusy(id);
		window.setTimeout(() => { setResults(prev => ({ ...prev, [id]: { msg, ref } })); setBusy(null); }, 1400);
	};
	const actionBody = (id: string, children: ReactNode) => (<>{busy === id && <BusyOverlay />}{results[id] ? receipt(id, results[id]) : children}</>);
	const actionFooter = (id: string, label: string, tone: "primary" | "danger", msg: string, ref?: string, cancelLabel = "Cancel") =>
		results[id] ? <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>
			: (<><button className={styles.btnPm} onClick={onClose}>{cancelLabel}</button><button className={`${styles.btnPm} ${tone === "danger" ? styles.btnPmD : styles.btnPmP}`} disabled={busy === id} onClick={() => doAction(id, msg, ref)}>{label}</button></>);

	/* ---------- flow engine (labels + totals) ---------- */
	const flowTotals: Record<string, number> = { pay: 5, trans: 5, invite: 5, inv: 4 };
	const flowLabels: Record<string, string[]> = {
		pay: ["Period", "Employees", "Statutory", "Funding", "Authorize"],
		trans: ["From/To", "Amount", "FX & Fees", "Reference", "Confirm"],
		invite: ["Details", "Role", "Limits", "Security", "Review"],
		inv: ["Customer", "Items", "Payment", "Review"],
	};
	const flowModals: Record<string, string> = { pay: "runPayrollModal", trans: "interCompanyTransferModal", invite: "inviteUserModal", inv: "newInvoiceModal" };
	const nextFlow = (key: string) => {
		const total = flowTotals[key], current = flows[key];
		if (current >= total) { onClose(); return; }
		if (current === total - 1) { setBusy(key); window.setTimeout(() => { setFlows(prev => ({ ...prev, [key]: total })); setBusy(null); }, 1300); return; }
		setFlows(prev => ({ ...prev, [key]: current + 1 }));
	};
	const stepper = (key: string) => (
		<div className={styles.stepper}>
			{flowLabels[key].map((lab, i) => {
				const n = i + 1, cur = flows[key];
				const cls = n < cur ? styles.stepDone : n === cur ? styles.stepActive : "";
				return (
					<div className={styles.step} key={lab} style={{ display: "flex" }}>
						<div className={`${styles.stepN} ${cls}`}>{n < cur ? <i className="bi bi-check" /> : n}</div>
						<div className={`${styles.stepL} ${cls}`}>{lab}</div>
						{n < flowTotals[key] && <div className={styles.stepLine} />}
					</div>
				);
			})}
		</div>
	);
	const flowFooter = (key: string, confirmLabel: ReactNode) => {
		const total = flowTotals[key], cur = flows[key];
		return (
			<>
				<button className={styles.btnPm} onClick={onClose}>Cancel</button>
				<button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === key} onClick={() => nextFlow(key)}>
					{cur >= total ? "Done" : busy === key ? (<><span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> Processing</>) : cur === total - 1 ? confirmLabel : (<><span>Continue</span> <i className="bi bi-arrow-right" /></>)}
				</button>
			</>
		);
	};
	const showFlow = (key: string) => active === flowModals[key];

	/* ---------- receipt ---------- */
	const receipt = (_id: string, r: { msg: string; ref?: string }) => (
		<div className={styles.receipt}>
			<div className={styles.ri}><i className="bi bi-check-lg" /></div>
			<h5 className={styles.receiptTitle}>{r.msg}</h5>
			{r.ref && <p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Reference: {r.ref}</p>}
			<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
				<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}><i className="bi bi-check-circle" /> Done</button>
			</div>
		</div>
	);

	const PinInput = () => (
		<div className={styles.pinRow}>
			{[0, 1, 2, 3].map(i => (
				<input
					key={i}
					type="password"
					maxLength={1}
					className={styles.pinInput}
					value={pin[i] ?? ""}
					onChange={e => {
						setPin(prev => ({ ...prev, [i]: e.target.value }));
						const next = e.currentTarget.nextElementSibling as HTMLInputElement | null;
						if (e.target.value && next) next.focus();
					}}
				/>
			))}
		</div>
	);

	/* ============================ MODALS ============================ */
	return (
		<>
			{/* ===== 1. Switch Business ===== */}
			<MBox id="switchBusinessModal" active={active} onClose={onClose} title={<><i className="bi bi-diagram-3 me-2" />Switch Business Account</>}>
				<div className={styles.headerSearch} style={{ maxWidth: "100%", marginBottom: 12 }}><i className="bi bi-search" /><input type="text" placeholder="Search businesses..." /></div>
				{order.map(id => {
					const x = BUSINESSES[id]; const cur = id === b.key;
					const t: Tone = x.type === "online" ? "info" : x.type === "physical" ? "success" : "purple";
					return (
						<div key={id} className={`${styles.switchBiz} ${cur ? styles.switchBizCurrent : ""}`} onClick={() => { if (!cur) { onSwitchBiz(id); onClose(); } }}>
							<div className="d-flex align-items-center gap-3">
								<div className={styles.avatar} style={{ width: 40, height: 40, fontSize: 14, background: x.color }}>{x.initials}</div>
								<div><div style={{ fontWeight: 600, fontSize: 14 }}>{x.name} {cur && <Badge tone="info">Viewing</Badge>}</div>
									<div className={styles.mutedSmall}>{x.sector} · <Badge tone={t}>{x.type}</Badge> · KES {shortM(x.kpi.cash)}</div></div>
							</div>
							{cur ? <i className="bi bi-check-circle-fill text-primary" /> : <i className="bi bi-chevron-right text-muted" />}
						</div>
					);
				})}
			</MBox>

			{/* ===== 2. New Invoice (multistep) ===== */}
			<MBox id="newInvoiceModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-receipt text-primary me-2" />Create Invoice</>} footer={flowFooter("inv", <>Send Invoice <i className="bi bi-send" /></>)}>
				{stepper("inv")}
				{busy === "inv" && <BusyOverlay />}
				{showFlow("inv") && flows.inv === 1 && (
					<>
						<div className="mb-3"><label className={styles.fl}>Select Client</label><select className={styles.fc}>{b.clients.rows.map(c => <option key={c.name}>{c.name}</option>)}<option>+ Add New Client</option></select></div>
						<div className="mb-3"><label className={styles.fl}>Client Email</label><input className={styles.fc} defaultValue="billing@client.com" /></div>
						<div className="row g-2"><div className="col-6"><label className={styles.fl}>Country</label><select className={styles.fc}>{COUNTRY.map(c => <option key={c}>{c}</option>)}</select></div><div className="col-6"><label className={styles.fl}>Currency</label><select className={styles.fc}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></div></div>
					</>
				)}
				{showFlow("inv") && flows.inv === 2 && (
					<>
						<div className="p-3 border rounded mb-2"><div className="d-flex gap-2"><input className={`${styles.fc} ${styles.flex1}`} defaultValue="Consulting Services" /><input className={styles.fc} style={{ width: 120 }} defaultValue="150,000" /></div></div>
						<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmA}`} onClick={() => undefined}><i className="bi bi-plus-lg" /> Add line item</button>
						<div className={`${styles.summaryBox} mt-3`}><div className="d-flex justify-content-between"><span>Subtotal</span><strong>KES 150,000</strong></div><div className="d-flex justify-content-between"><span>VAT (16%)</span><strong>KES 24,000</strong></div><hr className={styles.divider} /><div className="d-flex justify-content-between"><strong>Total</strong><strong>KES 174,000</strong></div></div>
					</>
				)}
				{showFlow("inv") && flows.inv === 3 && (
					<>
						<div className="row g-2 mb-3">
							<div className="col-6"><label className={styles.fl}>Due Date</label><input type="date" className={styles.fc} defaultValue="2025-11-15" /></div>
							<div className="col-6"><label className={styles.fl}>Payment Method</label><select className={styles.fc}>{PAY_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
						</div>
						<div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Send payment link via Email/SMS</label></div>
						<div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Enable automatic late-fee (1.5%/month)</label></div>
					</>
				)}
				{showFlow("inv") && flows.inv === 4 && (
					<div className={`${styles.summaryBoxAccent} p-3 text-center`}>
						<div className={styles.ri} style={{ margin: "0 auto 10px" }}><i className="bi bi-file-earmark-check" /></div>
						<h5 style={{ fontWeight: 700 }}>Ready to send</h5>
						<p style={{ fontSize: 13, margin: 0 }}>Acme Corp · KES 174,000 · due 15 Nov 2025</p>
					</div>
				)}
			</MBox>

			{/* ===== 3. Run Payroll (multistep) ===== */}
			<MBox id="runPayrollModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-people text-success me-2" />Run & Approve Payroll</>} footer={flowFooter("pay", <>Approve & Execute <i className="bi bi-lock" /></>)}>
				{stepper("pay")}
				{busy === "pay" && <BusyOverlay />}
				{showFlow("pay") && flows.pay === 1 && (
					<><h6 style={{ fontWeight: 700 }}>Select Payroll Period</h6>
						<div className="row g-3 mt-1">
							<div className="col-md-6"><label className={styles.fl}>Month</label><select className={styles.fc}><option>October 2025</option><option>September 2025</option></select></div>
							<div className="col-md-6"><label className={styles.fl}>Department</label><select className={styles.fc}><option>All Employees ({b.team.users})</option></select></div>
							<div className="col-md-6"><label className={styles.fl}>Payment Date</label><input type="date" className={styles.fc} defaultValue="2025-10-28" /></div>
							<div className="col-md-6"><label className={styles.fl}>Payout Method</label><select className={styles.fc}><option>Bank Transfer (default)</option><option>M-Pesa B2C</option></select></div>
						</div></>
				)}
				{showFlow("pay") && flows.pay === 2 && (
					<><h6 style={{ fontWeight: 700 }}>Review Employees ({b.team.users})</h6>
						<div className="table-responsive" style={{ maxHeight: 200, overflowY: "auto" }}><table className={styles.tbl}><thead><tr><th>Employee</th><th>Dept</th><th>Gross</th><th>Net</th></tr></thead><tbody>
							{b.team.rows.slice(0, 3).map(r => <tr key={r.name}><td>{r.name}</td><td>{r.role}</td><td>KES 120,000</td><td>KES 86,400</td></tr>)}
							<tr><td colSpan={4} className="text-center text-muted">... more employees</td></tr>
						</tbody></table></div>
						<div className="p-2 rounded mt-2" style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}><i className="bi bi-exclamation-triangle" /> 1 employee missing bank details — paid via M-Pesa.</div></>
				)}
				{showFlow("pay") && flows.pay === 3 && (
					<><h6 style={{ fontWeight: 700 }}>Statutory & Deductions</h6>
						<div className={`${styles.summaryBox} mb-2`}>
							<div className="d-flex justify-content-between mb-2"><span>Gross Pay</span><strong>KES 620,000</strong></div>
							<div className="d-flex justify-content-between mb-2"><span className={styles.textDanger}>PAYE</span><strong className={styles.textDanger}>- KES 98,000</strong></div>
							<div className="d-flex justify-content-between mb-2"><span className={styles.textDanger}>NSSF</span><strong className={styles.textDanger}>- KES 2,160</strong></div>
							<div className="d-flex justify-content-between mb-2"><span className={styles.textDanger}>SHIF</span><strong className={styles.textDanger}>- KES 5,400</strong></div>
							<hr className={styles.divider} />
							<div className="d-flex justify-content-between"><strong>Net Disbursement</strong><strong style={{ color: "var(--pm-primary)" }}>KES 450,500</strong></div>
						</div>
						<div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Auto-file KRA P10, NSSF & SHIF returns</label></div></>
				)}
				{showFlow("pay") && flows.pay === 4 && (
					<><h6 style={{ fontWeight: 700 }}>Funding Wallet & FX</h6>
						<div className="mb-3"><label className={styles.fl}>Fund from</label><select className={styles.fc}><option>PayMo Business Wallet (KES {shortM(b.kpi.cash)})</option></select></div>
						<div className={`${styles.summaryBoxInfo}`} style={{ fontSize: 13 }}>This run is in <strong>KES</strong>. No FX conversion required.<br /><span className={styles.mutedSmall}>Balance after run: KES {shortM(b.kpi.cash - 450500)}</span></div></>
				)}
				{showFlow("pay") && flows.pay === 5 && (
					<><h6 style={{ fontWeight: 700 }}>Authorize Execution</h6>
						<div className={`${styles.summaryBox} mb-3`} style={{ fontSize: 13 }}>Disbursing <strong>KES 450,500</strong> to {b.team.users} employees. Dual-approval required for amounts over KES 500K.</div>
						<label className={styles.fl} style={{ textAlign: "center" }}>Enter Director PIN</label>
						<PinInput /></>
				)}
			</MBox>

			{/* ===== 4. Inter-Company Transfer (multistep) ===== */}
			<MBox id="interCompanyTransferModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-arrow-left-right text-purple me-2" />Inter-Company Transfer</>} footer={flowFooter("trans", <>Authorize <i className="bi bi-lock" /></>)}>
				{stepper("trans")}
				{busy === "trans" && <BusyOverlay />}
				{showFlow("trans") && flows.trans === 1 && (
					<><div className="mb-3"><label className={styles.fl}>Transfer From</label><select className={styles.fc}><option>{b.name} (KES {shortM(b.kpi.cash)})</option></select></div>
						<div className="mb-3 text-center"><i className="bi bi-arrow-down" style={{ fontSize: 20, color: "var(--pm-muted)" }} /></div>
						<div className="mb-3"><label className={styles.fl}>Transfer To</label><select className={styles.fc}>{order.filter(id => id !== b.key).map(id => <option key={id}>{BUSINESSES[id].name} (KES {shortM(BUSINESSES[id].kpi.cash)})</option>)}<option>PayMo Money Market Fund (Yield 11%)</option></select></div></>
				)}
				{showFlow("trans") && flows.trans === 2 && (
					<><div className="mb-3"><label className={styles.fl}>Amount</label><input type="number" className={styles.fc} defaultValue="500000" /></div>
						<div className="mb-3"><label className={styles.fl}>Source Currency</label><select className={styles.fc}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></div>
						<div className={`${styles.summaryBoxInfo}`} style={{ fontSize: 12 }}>Available balance: KES {shortM(b.kpi.cash)} · You can transfer up to {fmt(b.kpi.cash)}.</div></>
				)}
				{showFlow("trans") && flows.trans === 3 && (
					<><div className={`${styles.summaryBox} mb-2`}>
							<div className="d-flex justify-content-between mb-2"><span>Exchange Rate</span><strong>1.00 KES → KES</strong></div>
							<div className="d-flex justify-content-between mb-2"><span>Transfer Fee</span><strong className={styles.textAccent}>KES 0.00</strong></div>
							<div className="d-flex justify-content-between"><strong>Total Debit</strong><strong>KES 500,000</strong></div>
						</div>
						<div className={`${styles.summaryBoxAccent}`} style={{ fontSize: 12 }}><i className="bi bi-check-circle" /> Inter-company transfers settle instantly. Zero fees applied.</div></>
				)}
				{showFlow("trans") && flows.trans === 4 && (
					<><div className="mb-3"><label className={styles.fl}>Reference / Reason</label><input className={styles.fc} defaultValue="Fleet expansion capital" /></div>
						<div className="mb-3"><label className={styles.fl}>Attach Note (optional)</label><textarea className={styles.fc} rows={2}>Funding for Q4 expansion</textarea></div></>
				)}
				{showFlow("trans") && flows.trans === 5 && (
					<div className="text-center">
						<h4 style={{ fontWeight: 700 }}>Confirm Transfer</h4>
						<p style={{ fontSize: 24, color: "var(--pm-purple)", fontWeight: 700, margin: "10px 0" }}>KES 500,000</p>
						<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>To {order.filter(id => id !== b.key)[0] ? BUSINESSES[order.filter(id => id !== b.key)[0]].name : "another entity"}</p>
						<div className="mt-4"><PinInput /></div>
						<div className="form-check mt-3 text-center d-flex justify-content-center"><input className="form-check-input me-2" type="checkbox" /><label className="form-check-label" style={{ fontSize: 12 }}>Use OTP to authorize this transfer</label></div>
					</div>
				)}
			</MBox>

			{/* ===== 5. Invite User (multistep) ===== */}
			<MBox id="inviteUserModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-person-plus text-warning me-2" />Invite Team Member</>} footer={flowFooter("invite", <>Send Invite <i className="bi bi-envelope" /></>)}>
				{stepper("invite")}
				{busy === "invite" && <BusyOverlay />}
				{showFlow("invite") && flows.invite === 1 && (
					<><div className="mb-3"><label className={styles.fl}>Full Name</label><input className={styles.fc} placeholder="e.g. Jane Doe" /></div>
						<div className="mb-3"><label className={styles.fl}>Work Email</label><input className={styles.fc} placeholder="jane@company.co.ke" /></div>
						<div className="row g-2"><div className="col-6"><label className={styles.fl}>Department</label><select className={styles.fc}><option>Finance</option><option>HR</option><option>Sales</option><option>Operations</option></select></div>
							<div className="col-6"><label className={styles.fl}>Branch / Region</label><select className={styles.fc}><option>Head Office</option><option>Nairobi</option><option>Kampala</option></select></div></div></>
				)}
				{showFlow("invite") && flows.invite === 2 && (
					<><label className={styles.fl}>Assign Role</label>
						{ROLES.map((r, i) => (
							<div key={r} className={`p-3 border rounded mb-2 ${i === 0 ? "" : ""}`} style={i === 0 ? { borderColor: "var(--pm-primary)", background: "rgba(16,185,129,.04)" } : undefined}>
								<div className="form-check"><input className="form-check-input" type="radio" name="role" defaultChecked={i === 0} /><label className="form-check-label"><strong>{r}</strong></label></div>
							</div>
						))}</>
				)}
				{showFlow("invite") && flows.invite === 3 && (
					<><div className="mb-3"><label className={styles.fl}>Approval Limit (KES)</label><input type="number" className={styles.fc} defaultValue="1000000" /></div>
						<div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Can approve payroll runs</label></div>
						<div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Can initiate inter-company transfers</label></div></>
				)}
				{showFlow("invite") && flows.invite === 4 && (
					<><div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked disabled /><label className="form-check-label">Require 2FA/MFA (enforced for Admin)</label></div>
						<div className="mb-3"><label className={styles.fl}>Login method</label><select className={styles.fc}><option>Email OTP</option><option>Authenticator App</option><option>SMS OTP</option></select></div>
						<div className={`${styles.summaryBoxWarn}`} style={{ fontSize: 12 }}><i className="bi bi-shield-lock" /> MFA is mandatory for roles with approval permissions.</div></>
				)}
				{showFlow("invite") && flows.invite === 5 && (
					<div className={`${styles.summaryBoxAccent} p-3 text-center`}>
						<div className={styles.ri} style={{ margin: "0 auto 10px" }}><i className="bi bi-envelope-check" /></div>
						<h5 style={{ fontWeight: 700 }}>Send invitation</h5>
						<p style={{ fontSize: 13, margin: 0 }}>Admin · Limit KES 1,000,000</p>
					</div>
				)}
			</MBox>

			{/* ===== 6. KYB Upload ===== */}
			<MBox id="kybUploadModal" active={active} onClose={onClose} title={<><i className="bi bi-shield-check text-secondary me-2" />KYB Document Upload</>} footer={actionFooter("kybUploadModal", "Submit for Verification", "primary", "Document uploaded and sent for verification.", "KYB-99120")}>
				{actionBody("kybUploadModal", <>
					<div className={`${styles.summaryBoxDanger} mb-3`} style={{ fontSize: 13 }}><i className="bi bi-exclamation-triangle text-danger" /> Missing Annual Returns (CR12). Limit restrictions apply in 5 days.</div>
					<div className="mb-3"><label className={styles.fl}>Document Type</label><select className={styles.fc}>{DOC_TYPES.map(d => <option key={d}>{d}</option>)}</select></div>
					<div className={styles.summaryBox} style={{ border: "2px dashed var(--pm-border-2)", padding: 28, textAlign: "center" }}>
						<i className="bi bi-cloud-arrow-up" style={{ fontSize: 32, color: "var(--pm-primary)" }} />
						<div style={{ fontWeight: 600, marginTop: 8 }}>Click to browse or drag file here</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>PDF, JPG, PNG (Max 5MB)</div>
					</div>
				</>)}
			</MBox>

			{/* ===== 7. Business Settings (tabs) ===== */}
			<MBox id="businessSettingsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-gear me-2" />Business Settings</>} footer={actionFooter("businessSettingsModal", "Save Changes", "primary", "Settings updated successfully!")}>
				{actionBody("businessSettingsModal", <>
					<div className={styles.pills} style={{ marginBottom: 16 }}>
						{([["ws", "gen", "General"], ["ws", "addr", "Address & Contacts"], ["ws", "biztype", "Business Type"], ["ws", "sig", "Signatories"]] as const).map(([p, k, lab]) => (
							<button key={lab} className={`${styles.pill} ${tabs[p] === k ? styles.pillActive : ""}`} onClick={() => sw(p, k)}>{lab}</button>
						))}
					</div>
					{tabs.ws === "gen" && <div className="row g-3">
						<div className="col-md-6"><label className={styles.fl}>Trading Name</label><input className={styles.fc} defaultValue={b.name} /></div>
						<div className="col-md-6"><label className={styles.fl}>Industry Sector</label><input className={styles.fc} defaultValue={b.sector} /></div>
						<div className="col-md-6"><label className={styles.fl}>Support Email</label><input className={styles.fc} defaultValue="support@paymo.co.ke" /></div>
						<div className="col-md-6"><label className={styles.fl}>Support Phone</label><input className={styles.fc} defaultValue="+254 700 000 000" /></div>
					</div>}
					{tabs.ws === "addr" && <div className="row g-3">
						<div className="col-md-6"><label className={styles.fl}>Registered Address</label><input className={styles.fc} defaultValue="Westlands, Nairobi" /></div>
						<div className="col-md-6"><label className={styles.fl}>Country</label><select className={styles.fc}><option>Kenya</option><option>Uganda</option></select></div>
						<div className="col-12"><label className={styles.fl}>Postal Code</label><input className={styles.fc} defaultValue="00100" /></div>
					</div>}
					{tabs.ws === "biztype" && <div>
						{(["online", "physical", "hybrid"] as const).map(t => (
							<div key={t} className="p-3 border rounded mb-2" style={t === b.type ? { borderColor: "var(--pm-primary)", background: "rgba(16,185,129,.04)" } : undefined}>
								<div className="form-check"><input className="form-check-input" type="radio" name="bt" defaultChecked={t === b.type} /><label className="form-check-label"><strong>{t === "online" ? "Online / Digital" : t === "physical" ? "Physical / On-the-ground" : "Hybrid"}</strong></label></div>
							</div>
						))}
					</div>}
					{tabs.ws === "sig" && <div className={`${styles.summaryBoxInfo}`} style={{ fontSize: 13 }}><i className="bi bi-info-circle" /> Authorized signatories manage approval limits and payments.</div>}
				</>)}
			</MBox>

			{/* ===== 8. Cash Flow Details ===== */}
			<MBox id="cashFlowDetailsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-bank me-2" />Cash Position & Liquidity</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="row g-3">
					<div className="col-md-6"><div className={`${styles.summaryBox} h-100`}><div className={styles.mutedSmall}>PAYMO BUSINESS WALLET</div><div style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-primary)" }}>KES {fmt(b.kpi.cash)}</div><button className={`${styles.btnPm} ${styles.btnSm} mt-2 w-100`} onClick={() => onOpen("interCompanyTransferModal")}>Transfer Funds</button></div></div>
					<div className="col-md-6"><div className={`${styles.summaryBox} h-100`}><div className={styles.mutedSmall}>LINKED ACCOUNTS</div><div style={{ fontSize: 24, fontWeight: 700 }}>KES {fmt(b.bankCash)}</div><button className={`${styles.btnPm} ${styles.btnSm} mt-2 w-100`} onClick={() => onOpen("connectBankModal")}>Manage Connections</button></div></div>
				</div>
				<h6 style={{ fontWeight: 700, marginTop: 20 }}>Pending Settlements (T+1)</h6>
				<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Source</th><th>Amount</th><th>Expected Date</th></tr></thead><tbody>
					<tr><td>M-Pesa Till (Buy Goods)</td><td>KES {shortM(Math.round(b.kpi.cashTransit * 0.53))}</td><td>Tomorrow, 8:00 AM</td></tr>
					<tr><td>Visa/Mastercard Gateway</td><td>KES {shortM(Math.round(b.kpi.cashTransit * 0.47))}</td><td>Tomorrow, 2:00 PM</td></tr>
				</tbody></table></div>
			</MBox>

			{/* ===== 9. Aging Invoices ===== */}
			<MBox id="agingInvoicesModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-receipt me-2" />Outstanding Invoices (Aging Report)</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction("agingInvoicesModal", "Reminders sent to all overdue customers via Email & SMS.")}><i className="bi bi-envelope-check" /> Send Batch Reminders</button></>}>
				{actionBody("agingInvoicesModal", <div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Days Overdue</th><th>Actions</th></tr></thead><tbody>
					{b.clients.rows.slice(0, 4).map((c, i) => <tr key={c.name}><td>INV-2025-{80 + i}</td><td>{c.name}</td><td>KES {shortM(c.outstanding || 60000)}</td><td><Badge tone={i === 2 ? "warning" : "danger"}>{i === 2 ? "45" : "72"} days</Badge></td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => doAction("agingInvoicesModal", "Reminder sent to " + c.name)}>Remind</button></td></tr>)}
				</tbody></table></div>)}
			</MBox>

			{/* ===== 10. View User ===== */}
			<MBox id="viewUserModal" active={active} onClose={onClose} title={<><i className="bi bi-person me-2" />Edit User</>} footer={actionFooter("viewUserModal", "Save", "primary", "User settings updated!")}>
				{actionBody("viewUserModal", <>
					<div className="mb-3"><label className={styles.fl}>Role</label><select className={styles.fc}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
					<div className="mb-3"><label className={styles.fl}>Approval Limit (KES)</label><input type="number" className={styles.fc} defaultValue="1000000" /></div>
					<div className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">MFA Enforced</label></div>
					<div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label text-danger">Suspend Account</label></div>
				</>)}
			</MBox>

			{/* ===== 11. Disburse Funds ===== */}
			<MBox id="disburseFundsModal" active={active} onClose={onClose} title={<><i className="bi bi-send text-info me-2" />Disburse Funds</>} footer={actionFooter("disburseFundsModal", "Upload & Validate", "primary", "CSV Uploaded. Sent to Maker/Checker queue.")}>
				{actionBody("disburseFundsModal", <>
					<div className="mb-3"><label className={styles.fl}>Disbursement Type</label><select className={styles.fc}><option>Single Vendor Payment</option><option>Bulk CSV Upload (M-Pesa B2C)</option><option>Expense Reimbursement</option><option>International SWIFT Payout</option></select></div>
					<div className={`${styles.summaryBox} text-center mb-3`}><i className="bi bi-file-earmark-excel mb-2" style={{ fontSize: 24, color: "var(--pm-primary)" }} /><br /><strong>Upload Beneficiary CSV</strong><br /><span className={styles.mutedSmall}>Format: Name, Phone, Account, Amount, Currency</span><br /><button className={`${styles.btnPm} ${styles.btnSm} mt-2`}>Browse File</button></div>
				</>)}
			</MBox>

			{/* ===== 12. Pending Approvals ===== */}
			<MBox id="pendingApprovalsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-shield-lock text-warning me-2" />Approval Queue</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Request</th><th>Maker</th><th>Amount</th><th>Action</th></tr></thead><tbody>
					<tr><td>Payroll Run Oct</td><td>HR Dept</td><td>KES 450,500</td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => { onClose(); onOpen("runPayrollModal"); }}>Review</button></td></tr>
					<tr><td>Supplier: OfficeMart</td><td>Finance</td><td>KES 120,000</td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => doAction("pendingApprovalsModal", "Payment approved!")}>Approve</button></td></tr>
					<tr><td>Vendor: AWS Hosting</td><td>Finance</td><td>KES 85,000</td><td><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => doAction("pendingApprovalsModal", "Payment approved!")}>Approve</button></td></tr>
				</tbody></table></div>
			</MBox>

			{/* ===== 13. Consolidated Report ===== */}
			<MBox id="consolidatedReportModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-bar-graph me-2" />Export Business Reports</>} footer={actionFooter("consolidatedReportModal", "Download", "primary", "Report generated and downloaded.", "RPT-2025-088")}>
				{actionBody("consolidatedReportModal", <>
					<div className="mb-3"><label className={styles.fl}>Report Type</label><select className={styles.fc}><option>Consolidated Cash Flow</option><option>Group Revenue Summary</option><option>Payroll Audit Trail</option><option>Region Performance</option></select></div>
					<div className="row g-2 mb-3"><div className="col-6"><label className={styles.fl}>From</label><input type="date" className={styles.fc} /></div><div className="col-6"><label className={styles.fl}>To</label><input type="date" className={styles.fc} /></div></div>
					<div className="mb-3"><label className={styles.fl}>Format</label><select className={styles.fc}><option>PDF</option><option>Excel (CSV)</option></select></div>
				</>)}
			</MBox>

			{/* ===== 14. Notifications ===== */}
			<MBox id="notificationsModal" active={active} onClose={onClose} title={<><i className="bi bi-bell me-2" />Business Alerts <Badge tone="danger">7 new</Badge></>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div style={{ maxHeight: 400, overflowY: "auto" }}>
					<div className={`${styles.summaryBoxWarn} mb-2`} style={{ fontSize: 13 }}><strong>Payroll Approval Required</strong><br />{b.name} payroll needs review.</div>
					<div className={`${styles.summaryBoxDanger} mb-2`} style={{ fontSize: 13 }}><strong>KYB Expiring</strong><br />Annual returns due in 5 days.</div>
					<div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 13 }}><strong>Settlement Completed</strong><br />KES {shortM(b.kpi.cashTransit)} settled.</div>
					<div className={`${styles.summaryBoxAccent}`} style={{ fontSize: 13 }}><strong>Investment Yield</strong><br />Money Market Fund paid interest this month.</div>
				</div>
			</MBox>

			{/* ===== 15. Role Permissions ===== */}
			<MBox id="rolePermissionsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-shield-lock me-2" />Role Permissions Matrix</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="table-responsive"><table className={styles.tbl} style={{ textAlign: "center" }}><thead><tr><th className="text-start">Feature</th><th>Owner</th><th>Admin</th><th>Fin/HR</th><th>Sales</th><th>Viewer</th></tr></thead><tbody>
					{[
						["Multi-Business Toggle", "✅", "❌", "❌", "❌", "❌"],
						["Manage Team", "✅", "✅", "❌", "❌", "❌"],
						["Approve Payroll", "✅", "✅", "❌", "❌", "❌"],
						["Initiate Payments", "✅", "✅", "✅", "❌", "❌"],
						["Create Invoices", "✅", "✅", "✅", "✅", "❌"],
						["Manage Connected Tools", "✅", "✅", "✅", "❌", "❌"],
						["View Reports", "✅", "✅", "✅", "✅", "✅"],
					].map(row => <tr key={row[0]}><td className="text-start">{row[0]}</td>{row.slice(1).map((c, i) => <td key={i}>{c}</td>)}</tr>)}
				</tbody></table></div>
			</MBox>

			{/* ===== 16. Connect Bank ===== */}
			<MBox id="connectBankModal" active={active} onClose={onClose} title={<><i className="bi bi-bank text-info me-2" />Manage Linked Banks</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction("connectBankModal", "Bank sync refreshed")}><i className="bi bi-arrow-repeat" /> Re-sync Balances</button></>}>
				{actionBody("connectBankModal", <div className={`${styles.summaryBoxInfo} mb-3`} style={{ fontSize: 13 }}><i className="bi bi-info-circle" /> Linked banks are used for payouts, settlements and treasury sweeps.</div>)}
			</MBox>

			{/* ===== 17. Health Check ===== */}
			<MBox id="healthCheckModal" active={active} onClose={onClose} title={<><i className="bi bi-activity text-success me-2" />Business Health Snapshot</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="d-flex justify-content-center mb-4"><div style={{ width: 120, height: 120, borderRadius: "50%", border: "8px solid var(--pm-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}><span style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--pm-font-display)" }}>{b.health.score}</span><span style={{ fontSize: 11, color: "var(--pm-muted)" }}>SCORE</span></div></div>
				{b.health.rows.map(r => <div className={styles.sr} key={r[0]}><div><strong>{r[0]}</strong></div><Badge tone={r[2]}>{r[1]}</Badge></div>)}
			</MBox>

			{/* ===== 18. Revenue Details ===== */}
			<MBox id="revenueDetailsModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-up text-primary me-2" />Revenue Breakdown</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={styles.sv} style={{ textAlign: "center", marginBottom: 16 }}>KES {shortM(b.revenueMix.reduce((a, x) => a + x.v, 0))}</div>
				<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Source</th><th>Amount</th><th>% of Total</th></tr></thead><tbody>
					{b.revenueMix.map(x => <tr key={x.l}><td>{x.l}</td><td>KES {shortM(x.v)}</td><td>{Math.round((x.v / b.revenueMix.reduce((a, y) => a + y.v, 0)) * 100)}%</td></tr>)}
				</tbody></table></div>
			</MBox>

			{/* ===== 19. Expense Details ===== */}
			<MBox id="expenseDetailsModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-down text-danger me-2" />Expense Breakdown</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={styles.sv} style={{ textAlign: "center", marginBottom: 16, color: "var(--pm-danger)" }}>KES {shortM(b.kpi.expenses)}</div>
				<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Category</th><th>Amount</th><th>% of Total</th></tr></thead><tbody>
					{[
						["Payroll & Salaries", Math.round(b.kpi.expenses * 0.48)],
						["Supplier Payments", Math.round(b.kpi.expenses * 0.34)],
						["KRA Taxes & Levies", Math.round(b.kpi.expenses * 0.13)],
						["Utilities & Internet", Math.round(b.kpi.expenses * 0.05)],
					].map(x => <tr key={x[0] as string}><td>{x[0]}</td><td>KES {shortM(x[1] as number)}</td><td>{Math.round((x[1] as number / b.kpi.expenses) * 100)}%</td></tr>)}
				</tbody></table></div>
			</MBox>

			{/* ===== 20. Business Profile ===== */}
			<MBox id="businessProfileModal" active={active} onClose={onClose} title={<><i className="bi bi-person-badge text-primary me-2" />My Profile</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmD}`} onClick={onClose}><i className="bi bi-box-arrow-right" /> Log Out</button></>}>
				<div className="text-center">
					<div className={styles.avatar} style={{ width: 64, height: 64, fontSize: 24, margin: "0 auto 12px" }}>AD</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>Amina D.</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>Director (Admin) · {b.name}</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6"><div className={`${styles.summaryBox} p-2`}><span className={styles.mutedSmall}>Approval Limit</span><br /><strong>Unlimited</strong></div></div>
						<div className="col-6"><div className={`${styles.summaryBox} p-2`}><span className={styles.mutedSmall}>Security</span><br /><strong style={{ color: "var(--pm-primary)" }}>MFA Active</strong></div></div>
						<div className="col-12"><div className={`${styles.summaryBox} p-2`}><span className={styles.mutedSmall}>Connected Entities</span><br /><strong>{ORDER.length} Businesses</strong></div></div>
					</div>
				</div>
			</MBox>

			{/* ===== 21. Transaction Details ===== */}
			<MBox id="transactionDetailsModal" active={active} onClose={onClose} title={<><i className="bi bi-receipt me-2" />Transaction Details</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="text-center mb-3">
					<div className={styles.ri} style={{ margin: "0 auto 10px" }}><i className="bi bi-check-lg" /></div>
					<div style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--pm-font-display)" }}>+ KES 150,000</div>
					<div className={styles.mutedSmall}>{b.tx[0]?.d ?? "Transaction"}</div>
				</div>
				<div className={styles.sr}><span className="text-muted">Transaction ID</span><strong style={{ fontFamily: "monospace" }}>TX-2294801</strong></div>
				<div className={styles.sr}><span className="text-muted">Status</span><Badge tone="success">Completed</Badge></div>
				<div className={styles.sr}><span className="text-muted">Category</span><strong>{b.tx[0]?.cat ?? "—"}</strong></div>
			</MBox>

			{/* ===== 22. Statement ===== */}
			<MBox id="statementModal" active={active} onClose={onClose} title={<><i className="bi bi-file-earmark-text me-2" />Download Statement</>} footer={actionFooter("statementModal", "Email Statement", "primary", "Statement generated & sent to your email.", "STMT-0091")}>
				{actionBody("statementModal", <>
					<div className="mb-3"><label className={styles.fl}>Account / Wallet</label><select className={styles.fc}><option>PayMo Business Wallet</option><option>Linked Bank</option></select></div>
					<div className="row g-2 mb-3"><div className="col-6"><label className={styles.fl}>From</label><input type="date" className={styles.fc} /></div><div className="col-6"><label className={styles.fl}>To</label><input type="date" className={styles.fc} /></div></div>
					<div className="mb-3"><label className={styles.fl}>Format</label><div className="d-flex gap-2"><button className={`${styles.btnPm} ${styles.flex1}`}><i className="bi bi-filetype-pdf text-danger" /> PDF</button><button className={`${styles.btnPm} ${styles.flex1} ${styles.btnPmP}`}><i className="bi bi-filetype-xlsx" /> Excel</button></div></div>
				</>)}
			</MBox>

			{/* ===== 23. Schedule Payment ===== */}
			<MBox id="schedulePaymentModal" active={active} onClose={onClose} title={<><i className="bi bi-calendar-event me-2" />Schedule a Payment</>} footer={actionFooter("schedulePaymentModal", "Schedule", "primary", "Payment scheduled successfully!", "SCH-203")}>
				{actionBody("schedulePaymentModal", <>
					<div className="mb-3"><label className={styles.fl}>Pay To</label><input className={styles.fc} defaultValue="OfficeMart Supplies Ltd" /></div>
					<div className="mb-3"><label className={styles.fl}>Amount (KES)</label><input type="number" className={styles.fc} defaultValue="120000" /></div>
					<div className="row g-2 mb-3"><div className="col-6"><label className={styles.fl}>Schedule Date</label><input type="date" className={styles.fc} /></div><div className="col-6"><label className={styles.fl}>Recurrence</label><select className={styles.fc}><option>One-time</option><option>Monthly</option><option>Weekly</option></select></div></div>
					<div className={`${styles.summaryBoxAccent}`} style={{ fontSize: 12 }}><i className="bi bi-info-circle" /> Scheduled payments appear in your Upcoming Obligations.</div>
				</>)}
			</MBox>

			{/* ===== 24. Cash Forecast ===== */}
			<MBox id="cashForecastModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-graph-down me-2" />Cash Flow Forecast <Badge tone="info">AI</Badge></>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={`${styles.summaryBoxInfo} mb-3`} style={{ fontSize: 13 }}><i className="bi bi-stars" /> Based on history and scheduled obligations, PayMo projects an end-of-period balance of <strong>{shortM(b.forecast.end)}</strong>.</div>
				<div className="row g-2 text-center mb-3">
					<div className="col-4"><div className={styles.summaryBox}><div className={styles.mutedSmall}>Starting Balance</div><div style={{ fontWeight: 700 }}>{shortM(b.forecast.start)}</div></div></div>
					<div className="col-4"><div className={styles.summaryBox}><div className={styles.mutedSmall}>Projected Inflows</div><div style={{ fontWeight: 700, color: "var(--pm-primary)" }}>+{shortM(b.forecast.weeks.filter(w => w.v > 0).reduce((a, w) => a + w.v, 0))}</div></div></div>
					<div className="col-4"><div className={styles.summaryBox}><div className={styles.mutedSmall}>Projected Outflows</div><div style={{ fontWeight: 700, color: "var(--pm-danger)" }}>−{shortM(Math.abs(b.forecast.weeks.filter(w => w.v < 0).reduce((a, w) => a + w.v, 0)))}</div></div></div>
				</div>
				<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Week</th><th>Inflows</th><th>Outflows</th><th>End Balance</th></tr></thead><tbody>
					{[0, 1, 2, 3].map(w => {
						const inflow = b.forecast.weeks[w * 2].v, outflow = Math.abs(b.forecast.weeks[w * 2 + 1].v);
						let bal = b.forecast.start;
						for (let i = 0; i <= w; i++) bal = bal + b.forecast.weeks[i * 2].v - Math.abs(b.forecast.weeks[i * 2 + 1].v);
						return <tr key={w}><td>Week {w + 1}</td><td style={{ color: "var(--pm-primary)" }}>+KES {shortM(inflow)}</td><td style={{ color: "var(--pm-danger)" }}>−KES {shortM(outflow)}</td><td>{shortM(bal)}</td></tr>;
					})}
				</tbody></table></div>
			</MBox>

			{/* ===== 25. Statutory ===== */}
			<MBox id="statutoryModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-bank2 text-danger me-2" />Statutory & Tax Obligations</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={`${styles.summaryBoxWarn} mb-3`} style={{ fontSize: 13 }}><i className="bi bi-exclamation-triangle" /> 2 obligations due within 7 days.</div>
				<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Obligation</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>
					{[
						["VAT (16%) Returns", Math.round(b.kpi.expenses * 0.2), "2 days", "Due soon", "warning"],
						["PAYE (Income Tax)", Math.round(b.kpi.expenses * 0.12), "5 days", "Due", "danger"],
						["NSSF Contributions", Math.round(b.kpi.expenses * 0.04), "12 days", "Scheduled", "info"],
						["Corporate Tax Installment", Math.round(b.kpi.expenses * 0.25), "28 days", "Upcoming", "success"],
					].map(x => <tr key={x[0] as string}><td>{x[0]}</td><td>KES {shortM(x[1] as number)}</td><td>{x[2]}</td><td><Badge tone={x[4] as Tone}>{x[3] as string}</Badge></td></tr>)}
				</tbody></table></div>
			</MBox>

			{/* ===== 26. Support ===== */}
			<MBox id="supportModal" active={active} onClose={onClose} title={<><i className="bi bi-headset me-2" />Help & Support</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				{[
					["Live Chat", "bi-chat-dots", "var(--pm-primary)", "Business support · avg reply 2 min"],
					["Call Us", "bi-telephone", "var(--pm-primary)", "+254 700 000 000 · Mon-Sat 8am-8pm"],
					["Help Center", "bi-journal-text", "var(--pm-info)", "Guides, FAQs & API docs"],
				].map(c => (
					<div key={c[0] as string} className="p-3 border rounded mb-3 d-flex align-items-center gap-3" style={{ cursor: "pointer" }}>
						<div className={styles.iconCircle} style={{ background: c[2] as string, color: "#fff" }}><i className={`bi ${c[1]}`} /></div>
						<div><strong>{c[0]}</strong><div style={{ fontSize: 12, color: "var(--pm-muted)" }}>{c[3]}</div></div>
					</div>
				))}
			</MBox>

			{/* ===== 27. Investment ===== */}
			<MBox id="investmentModal" active={active} onClose={onClose} title={<><i className="bi bi-graph-up-arrow text-success me-2" />Put idle cash to work</>} footer={actionFooter("investmentModal", "Invest 500K", "primary", "KES 500,000 swept to Money Market Fund!", "INV-77001")}>
				{actionBody("investmentModal", <>
					{[
						["PayMo Money Market Fund", "Liquid · redeem anytime", "~11% p.a.", "KES 5,500/mo est.", "var(--pm-accent-soft)"],
						["90-Day Fixed Deposit", "Locked for higher yield", "~13% p.a.", "KES 6,500/mo est.", "var(--pm-info-soft)"],
						["Treasury Bills (T-Bills)", "91-day government paper", "~12% p.a.", "KES 6,000/mo est.", "var(--pm-warning-soft)"],
					].map(x => (
						<div key={x[0] as string} className="p-3 rounded mb-2 d-flex justify-content-between align-items-center" style={{ background: x[4] as string }}>
							<div><strong>{x[0]}</strong><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{x[1]}</div></div>
							<div className="text-end"><div style={{ fontWeight: 700, color: "var(--pm-primary)" }}>{x[2]}</div><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{x[3]}</div></div>
						</div>
					))}
				</>)}
			</MBox>

			{/* ===== 28. Clients ===== */}
			<MBox id="clientsModal" active={active} size="lg" onClose={onClose} title={<><i className="bi bi-people text-primary me-2" />Clients</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction("clientsModal", "Client list exported to Excel.")}><i className="bi bi-download" /> Export Clients</button></>}>
				{actionBody("clientsModal", <div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Client</th><th>Country</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>
					{b.clients.rows.map(c => <tr key={c.name}><td><strong>{c.name}</strong></td><td>{c.country}</td><td>KES {shortM(c.outstanding)}</td><td><Badge tone={c.status === "VIP" ? "purple" : c.status === "Risky" ? "danger" : "success"}>{c.status}</Badge></td></tr>)}
				</tbody></table></div>)}
			</MBox>

			{/* ===== 29. Currency ===== */}
			<MBox id="currencyModal" active={active} onClose={onClose} title={<><i className="bi bi-cash-coin me-2" />Multi-Currency Accounts</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction("currencyModal", "Currency positions refreshed")}><i className="bi bi-arrow-repeat" /> Refresh Rates</button></>}>
				{actionBody("currencyModal", <div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Currency</th><th>Balance</th><th>Rate (KES)</th><th>Status</th></tr></thead><tbody>
					{b.currencies.map(c => <tr key={c.code}><td><strong>{c.code}</strong> <span className={styles.mutedSmall}>{c.name}</span></td><td>{fmt(c.bal)}</td><td className={styles.mono}>{CUR_RATES[c.code]?.toFixed(2) ?? "—"}</td><td>{c.primary ? <Badge tone="success">Primary</Badge> : <Badge tone="info">Active</Badge>}</td></tr>)}
				</tbody></table></div>)}
			</MBox>

			{/* ===== 30. Virtual Account ===== */}
			<MBox id="virtualAccountModal" active={active} onClose={onClose} title={<><i className="bi bi-credit-card-2-front me-2" />Virtual Accounts</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => doAction("virtualAccountModal", "Share links prepared.")}><i className="bi bi-share" /> Share Payment Links</button></>}>
				{actionBody("virtualAccountModal", <>
					<div className={`${styles.summaryBoxAccent} mb-3`} style={{ fontSize: 13 }}><i className="bi bi-check-circle" /> These virtual accounts collect payments automatically and settle into your wallet.</div>
					<div className="table-responsive"><table className={styles.tbl}><thead><tr><th>Account</th><th>Channel</th><th>Status</th></tr></thead><tbody>
						{b.virtual.map(v => <tr key={v.id}><td style={{ fontFamily: "monospace" }}><strong>{v.id}</strong></td><td>{v.desc}</td><td><Badge tone="success">Active</Badge></td></tr>)}
					</tbody></table></div>
				</>)}
			</MBox>

			{/* ===== 31. Connect Tool (external) ===== */}
			<MBox id="connectToolModal" active={active} onClose={onClose} title={<><i className="bi bi-plug me-2" />Connect Business Tool</>} footer={<>
				<button className={styles.btnPm} onClick={onClose}>Cancel</button>
				<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => { window.open("https://www.whatsapp.com/business/", "_blank"); onClose(); }}>Continue <i className="bi bi-box-arrow-up-right" /></button>
			</>}>
				<div className="text-center">
					<i className="bi bi-box-arrow-up-right mb-2" style={{ fontSize: 40, color: "var(--pm-primary)" }} />
					<h5 style={{ fontWeight: 700 }}>You're leaving PayMo</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>You'll be redirected to the tool's official site to authorize the connection.</p>
				</div>
			</MBox>
		</>
	);
}
