import { Fragment, useEffect, useState, type ReactNode } from "react";
import styles from "./getPaid.module.css";
import {
	CATALOG_ITEMS,
	CUSTOMERS,
	DISPUTES,
	FEE_COMPARE,
	INITIAL_LINE_ITEMS,
	NOTIFICATIONS,
	REMINDER_RECIPIENTS,
	SUBSCRIPTION_HISTORY,
	type Customer,
	type LineItem,
} from "./getPaidData";

/* ============================================================================
   PayMo Business — Get Paid (Money In)
   Modal layer — port of the 29 modals from consolidated/get-paid.html
   (M1 new invoice wizard, M2 quick invoice, M3 new customer, M4 invoice
   detail, M5 templates, M6 item catalog, M7–M11 channel configs, M12 create
   link, M13 QR, M14 bulk reminders, M15 write off, M16 aging report,
   M17 refund, M18 disputes, M19 fee compare, M20 record payment,
   M21 check status, M22 fee check, M23 subscription detail, M24 recurring,
   M25 goal, M26 health, M27 alerts, M28 profile, M29 support).
   ========================================================================== */

interface ModalsProps {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	onToast: (msg: string) => void;
}

type Size = "md" | "lg" | "xl";

/* ---------- modal shell (Bootstrap look, React state driven) ---------- */
function MBox({ id, active, title, size = "md", onClose, children, footer }: {
	id: string;
	active: string | null;
	title: ReactNode;
	size?: Size;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
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

/* ---------- badge ---------- */
function Badge({ tone, children, style }: { tone: "success" | "warning" | "danger" | "info" | "purple" | "dark"; children: ReactNode; style?: React.CSSProperties }) {
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

/* ---------- action receipt (busy → success) ---------- */
function Receipt({ msg, onClose, ref }: { msg: string; onClose: () => void; ref?: string }) {
	return (
		<div className="text-center py-3">
			<div className={`${styles.iconCircle} ${styles.round} mx-auto mb-2`} style={{ width: 64, height: 64, fontSize: 28, background: "var(--pm-accent-soft)", color: "var(--pm-accent)" }}>
				<i className="bi bi-check-lg" />
			</div>
			<h5 style={{ fontWeight: 700 }}>{msg}</h5>
			{ref && <p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Ref: <span className={styles.codeChip}>{ref}</span></p>}
			<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>
		</div>
	);
}

/* ---------- stepper (wizard progress) ---------- */
function Stepper({ labels, current }: { labels: string[]; current: number }) {
	return (
		<div className={styles.stepper}>
			{labels.map((lab, i) => {
				const n = i + 1;
				return (
					<Fragment key={lab}>
						{i > 0 && <div className={styles.stepLine} />}
						<div className={`${styles.step} ${n < current ? styles.stepDone : n === current ? styles.stepActive : ""}`}>
							<div className={styles.stepN}>{n < current ? <i className="bi bi-check" /> : n}</div>
							<div className={styles.stepL}>{lab}</div>
						</div>
					</Fragment>
				);
			})}
		</div>
	);
}

/* ---------- status row ---------- */
function StatusRow({ label, value }: { label: ReactNode; value: ReactNode }) {
	return (
		<div className={styles.statusRow}>
			<span>{label}</span>
			{value}
		</div>
	);
}

/* ---------- fmt helper ---------- */
const fmt = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");

/* ============================================================================ */
export default function GetPaidModals({ active, onClose, onOpen, onToast }: ModalsProps) {
	/* ---------- state ---------- */
	const [results, setResults] = useState<Record<string, string>>({});
	const [refs, setRefs] = useState<Record<string, string>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({ inv: 1 });
	const [tabs, setTabs] = useState<Record<string, string>>({ invDetail: "ov", subDetail: "sch" });

	/* invoice wizard state */
	const [items, setItems] = useState<LineItem[]>(INITIAL_LINE_ITEMS);
	const [cust, setCust] = useState<Customer | null>(null);
	const [noCust, setNoCust] = useState(false);
	const [custEmail, setCustEmail] = useState("billing@acmecorp.com");
	const [country, setCountry] = useState("Kenya");
	const [currency, setCurrency] = useState("KES");
	const [recur, setRecur] = useState(false);
	const [sendOpts, setSendOpts] = useState({ email: true, sms: true, whatsapp: false, link: true });

	/* misc modal state */
	const [qrType, setQrType] = useState<"Dynamic" | "Static">("Dynamic");
	const [feeCheckAmt, setFeeCheckAmt] = useState(50000);
	const [remSel, setRemSel] = useState<boolean[]>(REMINDER_RECIPIENTS.map(r => r.checked));
	const [remChannel, setRemChannel] = useState("SMS + WhatsApp + Email");
	const [remTemplate, setRemTemplate] = useState("Friendly reminder");
	const [linkAmount, setLinkAmount] = useState("50000");
	const [linkDesc, setLinkDesc] = useState("Consulting retainer");
	const [cardBiz, setCardBiz] = useState("TechSolutions Ltd");
	const [cardUrl, setCardUrl] = useState("paymo.biz/tsretail");

	useEffect(() => {
		if (active === null) {
			setResults({});
			setRefs({});
			setBusy(null);
			setFlows({ inv: 1 });
			setTabs({ invDetail: "ov", subDetail: "sch" });
			setItems(INITIAL_LINE_ITEMS);
			setCust(null);
			setNoCust(false);
			setCustEmail("billing@acmecorp.com");
			setCountry("Kenya");
			setCurrency("KES");
			setRecur(false);
			setSendOpts({ email: true, sms: true, whatsapp: false, link: true });
			setQrType("Dynamic");
			setFeeCheckAmt(50000);
			setRemSel(REMINDER_RECIPIENTS.map(r => r.checked));
			setRemChannel("SMS + WhatsApp + Email");
			setRemTemplate("Friendly reminder");
			setLinkAmount("50000");
			setLinkDesc("Consulting retainer");
			setCardBiz("TechSolutions Ltd");
			setCardUrl("paymo.biz/tsretail");
		}
	}, [active]);

	/* ---------- simulate: busy overlay → receipt + toast ---------- */
	const simulate = (id: string, msg: string, ref?: string) => {
		setBusy(id);
		window.setTimeout(() => {
			setResults(prev => ({ ...prev, [id]: msg }));
			if (ref) setRefs(prev => ({ ...prev, [id]: ref }));
			setBusy(null);
			onToast(msg);
		}, 1200);
	};
	const overlay = (id: string) => (
		<>{busy === id && <div className={styles.loadingOv}><div className={styles.spinner} /><p className={styles.loadingLabel}>Processing...</p></div>}</>
	);
	const actionBody = (id: string, children: ReactNode) => (
		<>
			{overlay(id)}
			{results[id] ? <Receipt msg={results[id]} onClose={onClose} /> : children}
		</>
	);
	const actionFooter = (id: string, label: string, msg: string, tone: "primary" | "danger" | "success" = "primary") =>
		results[id]
			? null
			: (
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>Cancel</button>
					<button
						type="button"
						className={`${styles.btnPm} ${tone === "danger" ? styles.btnPmD : styles.btnPmP}`}
						disabled={busy === id}
						onClick={() => simulate(id, msg)}
					>
						{label}
					</button>
				</>
			);

	/* ---------- invoice wizard helpers ---------- */
	const subtotal = items.reduce((s, it) => s + (it.qty || 0) * it.price, 0);
	const vat = items.reduce((s, it) => s + (it.vat === "16% VAT" ? (it.qty || 0) * it.price * 0.16 : 0), 0);
	const total = subtotal + vat;

	const updateItem = (idx: number, patch: Partial<LineItem>) =>
		setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
	const addItem = (it?: LineItem) =>
		setItems(prev => [...prev, it ?? { desc: "", qty: 1, unit: "pcs", price: 0, vat: "16% VAT" }]);
	const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
	const pickItem = (name: string, price: string) => {
		addItem({ desc: name, qty: 1, unit: "pcs", price: parseFloat(price.replace(/,/g, "")) || 0, vat: "16% VAT" });
		onToast(`${name} added to invoice`);
		onOpen("newInvoiceModal");
	};

	const invNext = () => {
		if (flows.inv >= 4) return;
		if (flows.inv === 3) {
			setBusy("inv");
			window.setTimeout(() => {
				setFlows(prev => ({ ...prev, inv: 4 }));
				setBusy(null);
				onToast("Invoice ready to review");
			}, 700);
			return;
		}
		setFlows(prev => ({ ...prev, inv: prev.inv + 1 }));
	};

	const invFooter =
		results.newInvoiceModal ? null : (
			<>
				<button type="button" className={styles.btnPm} onClick={onClose}>Cancel</button>
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnPmP}`}
					disabled={busy === "inv"}
					onClick={() => (flows.inv >= 4 ? simulate("newInvoiceModal", "Invoice created & sent!", "INV-2025-152") : invNext())}
				>
					{flows.inv >= 4 ? (<><i className="bi bi-check-lg" /> Finish</>) : (<>Continue <i className="bi bi-arrow-right" /></>)}
				</button>
			</>
		);

	const billTo = noCust ? "Walk-in customer" : (cust?.name ?? "Acme Corp");
	const billEmail = noCust ? "" : (custEmail || (cust ? `billing@${cust.name.toLowerCase().replace(/\s+/g, "")}com` : "billing@acmecorp.com"));

	return (
		<>
			{/* M1: New Invoice Wizard (multistep 4) */}
			<MBox id="newInvoiceModal" active={active} size="xl" onClose={onClose}
				title={<><i className="bi bi-receipt text-primary me-2" />New Invoice Wizard</>}
				footer={invFooter}>
				{overlay("inv")}
				{results.newInvoiceModal ? (
					<Receipt msg={results.newInvoiceModal} onClose={onClose} ref={refs.newInvoiceModal} />
				) : (
					<>
						<Stepper labels={["Customer", "Line Items", "Details & Terms", "Review & Send"]} current={flows.inv} />

						{/* Step 1: Customer */}
						{flows.inv === 1 && (
							<div className="row g-3">
								<div className="col-md-7">
									<label className={styles.formLabel}>Select Customer</label>
									<div className={styles.headerSearch} style={{ maxWidth: "100%", marginBottom: 8 }}>
										<i className="bi bi-search" />
										<input placeholder="Search customer..." />
									</div>
									{CUSTOMERS.map(c => (
										<div
											key={c.name}
											className={`${styles.selectRow} ${cust?.name === c.name && !noCust ? styles.selectRowSel : ""}`}
											onClick={() => {
												setCust(c);
												setNoCust(false);
												setCustEmail(`billing@${c.name.toLowerCase().replace(/\s+/g, "")}com`);
											}}
										>
											<div className="d-flex align-items-center gap-2">
												<div className={`${styles.iconCircle} ${styles.round}`} style={{ width: 34, height: 34, fontSize: 13, background: c.color, color: "#fff" }}>{c.initials}</div>
												<div>
													<strong>{c.name}</strong>
													<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{c.memo}</div>
												</div>
											</div>
											<i className="bi bi-chevron-right text-muted" />
										</div>
									))}
									<button type="button" className={`${styles.btnPm} ${styles.btnPmSm} mt-2`} style={{ color: "var(--pm-accent)", borderColor: "var(--pm-accent)", background: "var(--pm-accent-soft)" }} onClick={() => onOpen("newCustomerModal")}>
										<i className="bi bi-person-plus" /> New Customer
									</button>
								</div>
								<div className="col-md-5">
									<label className={styles.formLabel}>OR walk-in / no customer</label>
									<div className="form-check mb-2">
										<input className="form-check-input" type="checkbox" id="noCust" checked={noCust} onChange={e => setNoCust(e.target.checked)} />
										<label className="form-check-label" htmlFor="noCust">No customer / generic</label>
									</div>
									{!noCust && (
										<>
											<div className="mb-2">
												<label className={styles.formLabel}>Customer Email</label>
												<input className={styles.formControl} value={billEmail} onChange={e => setCustEmail(e.target.value)} />
											</div>
											<div className="row g-2">
												<div className="col-6">
													<label className={styles.formLabel}>Country</label>
													<select className={styles.formControl} value={country} onChange={e => setCountry(e.target.value)}>
														<option>Kenya</option><option>Uganda</option><option>Tanzania</option>
													</select>
												</div>
												<div className="col-6">
													<label className={styles.formLabel}>Currency</label>
													<select className={styles.formControl} value={currency} onChange={e => setCurrency(e.target.value)}>
														<option>KES</option><option>USD</option>
													</select>
												</div>
											</div>
										</>
									)}
								</div>
							</div>
						)}

						{/* Step 2: Line Items */}
						{flows.inv === 2 && (
							<div className="row g-3">
								<div className="col-lg-8">
									<label className={styles.formLabel}>Line Items</label>
									{items.map((it, i) => (
										<div className="p-2 border rounded mb-2" key={i}>
											<div className="d-flex gap-2 flex-wrap">
												<input className={styles.formControl} style={{ flex: 2, minWidth: 160 }} value={it.desc} placeholder="Description" onChange={e => updateItem(i, { desc: e.target.value })} />
												<input className={styles.formControl} style={{ width: 70 }} type="number" value={it.qty} placeholder="Qty" onChange={e => updateItem(i, { qty: parseFloat(e.target.value) || 0 })} />
												<select className={styles.formControl} style={{ width: 80 }} value={it.unit} onChange={e => updateItem(i, { unit: e.target.value })}>
													<option>hrs</option><option>pcs</option><option>days</option>
												</select>
												<input className={styles.formControl} style={{ width: 100 }} type="number" value={it.price} placeholder="Price" onChange={e => updateItem(i, { price: parseFloat(e.target.value) || 0 })} />
												<select className={styles.formControl} style={{ width: 90 }} value={it.vat} onChange={e => updateItem(i, { vat: e.target.value as LineItem["vat"] })}>
													<option>16% VAT</option><option>Exempt</option><option>0%</option>
												</select>
												<button type="button" className={`${styles.btnPm} ${styles.btnPmSm} ${styles.btnPmD}`} onClick={() => removeItem(i)}><i className="bi bi-trash" /></button>
											</div>
										</div>
									))}
									<div className="d-flex gap-2">
										<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} style={{ background: "var(--pm-accent-soft)", color: "var(--pm-accent)", borderColor: "var(--pm-accent)" }} onClick={() => addItem()}>
											<i className="bi bi-plus-lg" /> Add Line
										</button>
										<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onOpen("itemCatalogModal")}>
											<i className="bi bi-box" /> Pick from Products
										</button>
									</div>
								</div>
								<div className="col-lg-4">
									<div className={styles.wizardSide}>
										<h6 style={{ fontWeight: 700 }}>Running Total</h6>
										<div className={styles.feeRow}><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
										<div className={styles.feeRow}><span>VAT (16%)</span><strong style={{ color: "var(--pm-danger)" }}>{fmt(vat)}</strong></div>
										<div className={styles.feeRow}><span>Discount</span><strong style={{ color: "var(--pm-danger)" }}>KES 0</strong></div>
										<hr className="pm-divider" style={{ borderTop: "1px solid var(--pm-border)", margin: "8px 0" }} />
										<div className={`d-flex justify-content-between ${styles.runningTotal}`}>
											<span style={{ fontWeight: 700 }}>Total</span>
											<strong style={{ color: "var(--pm-primary)", fontSize: 20 }}>{fmt(total)}</strong>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Step 3: Details & Terms */}
						{flows.inv === 3 && (
							<div className="row g-3">
								<div className="col-md-6">
									<div className="mb-3">
										<label className={styles.formLabel}>Invoice Date</label>
										<input type="date" className={styles.formControl} />
									</div>
									<div className="mb-3">
										<label className={styles.formLabel}>Due Date</label>
										<select className={styles.formControl}>
											<option>+30 days</option><option>On receipt</option><option>+15 days</option><option>+60 days</option><option>Custom</option>
										</select>
									</div>
									<div className="mb-3">
										<label className={styles.formLabel}>Purchase Order #</label>
										<input className={styles.formControl} placeholder="Optional" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className={styles.formLabel}>Note to Customer</label>
										<textarea className={styles.formControl} rows={2} defaultValue="Thank you for your business. Please pay via M-Pesa Paybill 247247 with account reference [invoice number]." />
									</div>
									<div className="mb-3">
										<label className={styles.formLabel}>Internal Memo</label>
										<textarea className={styles.formControl} rows={1} placeholder="Only visible to your team" />
									</div>
									<div className="d-flex align-items-center gap-2 mb-3">
										<label className={`${styles.formLabel} mb-0`}>Attachment</label>
										<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onToast("Attach file (demo)")}><i className="bi bi-paperclip" /> Upload</button>
									</div>
									<div className="form-check">
										<input className="form-check-input" type="checkbox" id="recurToggle" checked={recur} onChange={e => setRecur(e.target.checked)} />
										<label className="form-check-label" htmlFor="recurToggle">Make this recurring</label>
									</div>
									{recur && (
										<div className="mt-2 p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
											<div className="row g-2">
												<div className="col-6">
													<label className={styles.formLabel}>Frequency</label>
													<select className={styles.formControl}><option>Monthly</option><option>Weekly</option><option>Quarterly</option></select>
												</div>
												<div className="col-6">
													<label className={styles.formLabel}>End</label>
													<select className={styles.formControl}><option>Until cancelled</option><option>After X</option><option>On date</option></select>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Step 4: Review & Send */}
						{flows.inv >= 4 && (
							<div className="row g-3">
								<div className="col-lg-7">
									<div className="p-3 rounded" style={{ border: "1px solid var(--pm-border)", background: "#fff" }}>
										<div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
											<div>
												<strong style={{ fontFamily: "var(--pm-font-display)", fontSize: 18 }}>INVOICE</strong>
												<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>INV-2025-152</div>
											</div>
											<div style={{ textAlign: "right" }}>
												<strong>TechSolutions Ltd</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>KRA PIN P051234567M</div>
											</div>
										</div>
										<div className="d-flex justify-content-between mb-2">
											<div>
												<strong>Bill To: {billTo}</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{billEmail || "—"}</div>
											</div>
											<div style={{ textAlign: "right", fontSize: 12 }}>
												<div>Issue: 08 Oct 2025</div>
												<div>Due: 07 Nov 2025</div>
											</div>
										</div>
										<table className={styles.table} style={{ marginBottom: 8 }}>
											<thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
											<tbody>
												{items.map((it, i) => (
													<tr key={i}>
														<td>{it.desc || "—"}</td>
														<td>{it.qty}</td>
														<td>{it.price.toLocaleString("en-KE")}</td>
														<td>{(it.qty * it.price).toLocaleString("en-KE")}</td>
													</tr>
												))}
											</tbody>
										</table>
										<div className="text-end">
											<div>Subtotal: {fmt(subtotal)}</div>
											<div>VAT (16%): {fmt(vat)}</div>
											<strong style={{ color: "var(--pm-primary)", fontSize: 16 }}>Total: {fmt(total)}</strong>
										</div>
										<div className="p-2 rounded mt-2" style={{ background: "var(--pm-accent-soft)", fontSize: 11 }}>
											Pay via M-Pesa Paybill 247247 · Ref INV-2025-152 · or paymo.biz/inv152
										</div>
									</div>
								</div>
								<div className="col-lg-5">
									<div className={styles.wizardSide}>
										<h6 style={{ fontWeight: 700 }}>Send Options</h6>
										{(["email", "sms", "whatsapp", "link"] as const).map(k => (
											<div className="form-check mb-1" key={k}>
												<input
													className="form-check-input"
													type="checkbox"
													id={`send-${k}`}
													checked={sendOpts[k]}
													onChange={e => setSendOpts(prev => ({ ...prev, [k]: e.target.checked }))}
												/>
												<label className="form-check-label" htmlFor={`send-${k}`}>
													{k === "email" ? "Email" : k === "sms" ? "SMS" : k === "whatsapp" ? "WhatsApp" : "Copy payment link"}
												</label>
											</div>
										))}
										<div className="d-flex gap-2 mt-3">
											<button type="button" className={`${styles.btnPm} flex-1`} onClick={() => simulate("newInvoiceModal", "Saved as draft", "INV-2025-152")}>Save Draft</button>
											<button type="button" className={`${styles.btnPm} ${styles.btnPmP} flex-1`} onClick={() => simulate("newInvoiceModal", "Invoice created & sent!", "INV-2025-152")}>
												<i className="bi bi-send" /> Save & Send
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</MBox>

			{/* M2: Quick Invoice */}
			<MBox id="quickInvoiceModal" active={active} onClose={onClose}
				title={<><i className="bi bi-receipt me-2" />Quick Invoice</>}
				footer={actionFooter("quickInvoiceModal", "Create", "Quick invoice sent!", "success")}>
				{actionBody("quickInvoiceModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Customer</label>
							<input className={styles.formControl} placeholder="Search or type name" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Description</label>
							<input className={styles.formControl} defaultValue="Consulting services" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Amount (KES)</label>
							<input type="number" className={styles.formControl} defaultValue={100000} />
						</div>
						<div className="row g-2">
							<div className="col-6">
								<label className={styles.formLabel}>Due</label>
								<select className={styles.formControl}><option>+30 days</option><option>On receipt</option></select>
							</div>
							<div className="col-6">
								<label className={styles.formLabel}>Send</label>
								<select className={styles.formControl}><option>Email</option><option>SMS</option><option>WhatsApp</option></select>
							</div>
						</div>
					</>
				))}
			</MBox>

			{/* M3: New Customer */}
			<MBox id="newCustomerModal" active={active} onClose={onClose}
				title={<><i className="bi bi-person-plus me-2" />New Customer</>}
				footer={actionFooter("newCustomerModal", "Create", "Customer created & selected!", "success")}>
				{actionBody("newCustomerModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Name</label>
							<input className={styles.formControl} placeholder="Full name / company" />
						</div>
						<div className="row g-2 mb-3">
							<div className="col-6">
								<label className={styles.formLabel}>Phone</label>
								<input className={styles.formControl} placeholder="07XX XXX XXX" />
							</div>
							<div className="col-6">
								<label className={styles.formLabel}>Email</label>
								<input className={styles.formControl} placeholder="email@company.com" />
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>KRA PIN (optional)</label>
							<input className={styles.formControl} placeholder="P000000000X" />
						</div>
					</>
				))}
			</MBox>

			{/* M4: Invoice Detail */}
			<MBox id="invoiceDetailModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-receipt me-2" />Invoice INV-2025-142</>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						<div className="d-flex gap-2">
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onToast("Invoice duplicated!")}><i className="bi bi-files" /> Duplicate</button>
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onToast("Credit note created!")}><i className="bi bi-file-minus" /> Credit Note</button>
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm} ${styles.btnPmP}`} onClick={() => onToast("Invoice PDF downloaded!")}><i className="bi bi-download" /> PDF</button>
						</div>
					</>
				}>
				<div className={styles.tabRow}>
					{(["ov", "pay", "log"] as const).map(t => (
						<button key={t} type="button" className={`${styles.tabPill} ${tabs.invDetail === t ? styles.tabPillActive : ""}`} onClick={() => setTabs(prev => ({ ...prev, invDetail: t }))}>
							{t === "ov" ? "Overview" : t === "pay" ? "Payment Timeline" : "Activity Log"}
						</button>
					))}
				</div>
				{tabs.invDetail === "ov" && (
					<>
						<StatusRow label="Customer" value={<strong>Acme Corp</strong>} />
						<StatusRow label="Amount" value={<strong style={{ color: "var(--pm-primary)" }}>KES 150,000</strong>} />
						<StatusRow label="Status" value={<Badge tone="success">Paid</Badge>} />
						<StatusRow label="Payment Ref" value={<strong style={{ fontFamily: "monospace" }}>MP-882910</strong>} />
						<StatusRow label="Payment Method" value={<strong>M-Pesa Paybill</strong>} />
					</>
				)}
				{tabs.invDetail === "pay" && (
					<div className={styles.timeline}>
						<div className={styles.tlItem}><strong>Invoice created</strong><div className="pm-muted" style={{ fontSize: 12, color: "var(--pm-muted)" }}>01 Oct, 09:00 · Amina D.</div></div>
						<div className={styles.tlItem}><strong>Sent to customer</strong><div className="pm-muted" style={{ fontSize: 12, color: "var(--pm-muted)" }}>01 Oct, 09:05 · via Email</div></div>
						<div className={styles.tlItem}><strong>Viewed by customer</strong><div className="pm-muted" style={{ fontSize: 12, color: "var(--pm-muted)" }}>02 Oct, 08:12 · open pixel</div></div>
						<div className={styles.tlItem}><strong>Payment received</strong><div className="pm-muted" style={{ fontSize: 12, color: "var(--pm-muted)" }}>05 Oct, 14:22 · KES 150,000 via M-Pesa</div></div>
					</div>
				)}
				{tabs.invDetail === "log" && (
					<div className={styles.timeline}>
						<div className={styles.tlItem}>Created by Amina D.</div>
						<div className={styles.tlItem}>Sent via Email</div>
						<div className={styles.tlItem}>Viewed (2 Oct)</div>
						<div className={styles.tlItem}>Reminder sent (4 Oct)</div>
						<div className={`${styles.tlItem} ${styles.tlCurrent}`}>Paid (5 Oct)</div>
					</div>
				)}
			</MBox>

			{/* M5: Invoice Templates */}
			<MBox id="invoiceTemplatesModal" active={active} onClose={onClose}
				title={<><i className="bi bi-file-earmark me-2" />Invoice Templates</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ borderColor: "var(--pm-primary) !important" }}>
					<div><strong>Professional</strong><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Corporate · default</div></div>
					<Badge tone="success">In use</Badge>
				</div>
				<div className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }}>
					<div><strong>Simple</strong><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Minimal · for small sales</div></div>
					<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onToast("Simple template selected")}>Preview</button>
				</div>
				<div className="p-3 border rounded d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }}>
					<div><strong>Retail</strong><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Bold colors · POS</div></div>
					<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onToast("Retail template selected")}>Preview</button>
				</div>
			</MBox>

			{/* M6: Item Catalog */}
			<MBox id="itemCatalogModal" active={active} onClose={onClose}
				title={<><i className="bi bi-box me-2" />Pick from Products</>}
				footer={<button type="button" className={styles.btnPm} onClick={() => onOpen("newInvoiceModal")}>Done</button>}>
				{CATALOG_ITEMS.map(it => (
					<div key={it.name} className="p-2 border rounded mb-1 d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }} onClick={() => pickItem(it.name, it.price)}>
						<div>
							<strong>{it.name}</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>KES {it.price} · {it.vat}</div>
						</div>
						<i className="bi bi-plus-circle" style={{ color: "var(--pm-primary)" }} />
					</div>
				))}
			</MBox>

			{/* M7: Paybill Config */}
			<MBox id="paybillConfigModal" active={active} onClose={onClose}
				title={<><i className="bi bi-phone me-2" />M-Pesa Paybill Config</>}
				footer={actionFooter("paybillConfigModal", "Save", "Paybill settings saved!")}>
				{actionBody("paybillConfigModal", (
					<>
						<StatusRow label="Paybill" value={<strong>247247</strong>} />
						<StatusRow label="Account Ref Format" value={<strong>INV-{`{number}`}</strong>} />
						<StatusRow label="Callback URL" value={<Badge tone="warning">Not configured</Badge>} />
						<StatusRow label="Fee" value={<strong>You keep KES 99.50 of every KES 100</strong>} />
						<div className="p-3 rounded mt-3" style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}>
							<i className="bi bi-exclamation-triangle" /> Configure the callback URL to enable auto-reconciliation of payments to invoices.
						</div>
					</>
				))}
			</MBox>

			{/* M8: Till Config */}
			<MBox id="tillConfigModal" active={active} onClose={onClose}
				title={<><i className="bi bi-shop me-2" />M-Pesa Till Config</>}
				footer={actionFooter("tillConfigModal", "Save", "Till settings saved!")}>
				{actionBody("tillConfigModal", (
					<>
						<StatusRow label="Till Number" value={<strong>455890</strong>} />
						<StatusRow label="Type" value={<strong>Buy Goods</strong>} />
						<StatusRow label="Status" value={<Badge tone="success">Active</Badge>} />
					</>
				))}
			</MBox>

			{/* M9: PesaLink Config */}
			<MBox id="pesalinkConfigModal" active={active} onClose={onClose}
				title={<><i className="bi bi-bank me-2" />Bank / PesaLink Config</>}
				footer={actionFooter("pesalinkConfigModal", "Save", "Bank settings saved!")}>
				{actionBody("pesalinkConfigModal", (
					<>
						<StatusRow label="Bank" value={<strong>Equity Bank ***4521</strong>} />
						<StatusRow label="PesaLink Routing" value={<strong style={{ fontFamily: "monospace" }}>EQBLKE</strong>} />
						<StatusRow label="Settlement" value={<strong>Instant</strong>} />
					</>
				))}
			</MBox>

			{/* M10: Card Config */}
			<MBox id="cardConfigModal" active={active} onClose={onClose}
				title={<><i className="bi bi-credit-card me-2" />Card Gateway — Complete Setup</>}
				footer={actionFooter("cardConfigModal", "Submit for Review", "Card setup submitted for review!")}>
				{actionBody("cardConfigModal", (
					<>
						<div className="p-3 rounded mb-3" style={{ background: "var(--pm-warning-soft)", fontSize: 13 }}>
							<i className="bi bi-exclamation-triangle" /> Card acceptance is <strong>Pending KYB</strong>. Complete to accept Visa/Mastercard online.
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Business Name (on card)</label>
							<input className={styles.formControl} value={cardBiz} onChange={e => setCardBiz(e.target.value)} />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Website / Store URL</label>
							<input className={styles.formControl} value={cardUrl} onChange={e => setCardUrl(e.target.value)} />
						</div>
						<div className={styles.uploadZone} onClick={() => onToast("Upload KYB doc (demo)")}>
							<i className="bi bi-cloud-arrow-up" style={{ fontSize: 28, color: "var(--pm-primary)" }} />
							<div style={{ fontWeight: 600, marginTop: 6 }}>Upload card KYB document</div>
						</div>
					</>
				))}
			</MBox>

			{/* M11: USSD */}
			<MBox id="ussdModal" active={active} onClose={onClose}
				title={<><i className="bi bi-grid me-2" />Activate USSD</>}
				footer={actionFooter("ussdModal", "Activate", "USSD activated! Code *123#", "success")}>
				{actionBody("ussdModal", (
					<>
						<div className="p-3 rounded mb-3" style={{ background: "var(--pm-info-soft)", fontSize: 13 }}>Reach feature-phone customers with a short code.</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Requested Short Code</label>
							<input className={styles.formControl} defaultValue="*123#" />
						</div>
					</>
				))}
			</MBox>

			{/* M12: Create Payment Link */}
			<MBox id="createLinkModal" active={active} onClose={onClose}
				title={<><i className="bi bi-link-45deg me-2" />Create Payment Link</>}
				footer={actionFooter("createLinkModal", "Create Link", "Payment link created!", "success")}>
				{actionBody("createLinkModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Amount (KES)</label>
							<input className={styles.formControl} value={linkAmount} onChange={e => setLinkAmount(e.target.value)} placeholder="Leave blank for customer to enter" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Description</label>
							<input className={styles.formControl} value={linkDesc} onChange={e => setLinkDesc(e.target.value)} />
						</div>
						<div className="row g-2 mb-3">
							<div className="col-6">
								<label className={styles.formLabel}>Expiry</label>
								<input type="date" className={styles.formControl} />
							</div>
							<div className="col-6">
								<label className={styles.formLabel}>Linked Product</label>
								<select className={styles.formControl}><option>None</option><option>Laptop Pro X</option></select>
							</div>
						</div>
						<div className="p-3 rounded text-center" style={{ background: "var(--pm-surface-2)", border: "1px dashed var(--pm-border-2)" }}>
							<i className="bi bi-box-arrow-up-right mb-1" style={{ fontSize: 20, color: "var(--pm-primary)" }} />
							<br />
							<strong>paymo.biz/pay/tsretail/abc123</strong>
							<br />
							<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>Theme with your logo & colors · auto-reconciles</span>
						</div>
						<div className="d-flex gap-2 mt-3">
							<button type="button" className={`${styles.btnPm} flex-1`} onClick={() => simulate("createLinkModal", "Link copied to clipboard!")}><i className="bi bi-copy" /> Copy</button>
							<button type="button" className={`${styles.btnPm} flex-1`} onClick={() => simulate("createLinkModal", "Link shared to WhatsApp!")}><i className="bi bi-whatsapp" /> Share</button>
						</div>
					</>
				))}
			</MBox>

			{/* M13: Generate QR */}
			<MBox id="generateQRModal" active={active} onClose={onClose}
				title={<><i className="bi bi-qr-code me-2" />Generate QR Code</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{actionBody("generateQRModal", (
					<div className="text-center">
						<div className="mb-3 d-flex gap-2 justify-content-center">
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm} ${qrType === "Dynamic" ? styles.btnPmP : ""}`} onClick={() => { setQrType("Dynamic"); onToast("Dynamic QR selected"); }}>Dynamic</button>
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm} ${qrType === "Static" ? styles.btnPmP : ""}`} onClick={() => { setQrType("Static"); onToast("Static QR selected"); }}>Static</button>
						</div>
						<div className="row g-2 mb-3 text-start">
							<div className="col-6">
								<label className={styles.formLabel}>Amount (dynamic)</label>
								<input className={styles.formControl} defaultValue="50000" />
							</div>
							<div className="col-6">
								<label className={styles.formLabel}>Reference</label>
								<input className={styles.formControl} defaultValue="Counter-01" />
							</div>
						</div>
						<div className={styles.qrBox}><i className={`bi bi-qr-code ${styles.qr}`} /></div>
						<p style={{ fontSize: 12, color: "var(--pm-muted)", marginTop: 8 }}>KEQR-standard · scans in M-Pesa, Airtel, Equitel, bank apps</p>
						<div className="d-flex gap-2">
							<button type="button" className={`${styles.btnPm} flex-1`} onClick={() => simulate("generateQRModal", "QR downloaded as PNG!")}><i className="bi bi-download" /> PNG</button>
							<button type="button" className={`${styles.btnPm} flex-1`} onClick={() => simulate("generateQRModal", "QR downloaded as PDF!")}><i className="bi bi-file-earmark-pdf" /> PDF</button>
						</div>
					</div>
				))}
			</MBox>

			{/* M14: Bulk Reminders */}
			<MBox id="bulkRemindersModal" active={active} onClose={onClose}
				title={<><i className="bi bi-envelope me-2" />Bulk Reminders</>}
				footer={actionFooter("bulkRemindersModal", "Send Reminders", "Reminders sent to 2 customers!", "success")}>
				{actionBody("bulkRemindersModal", (
					<>
						<label className={styles.formLabel}>Select Recipients</label>
						{REMINDER_RECIPIENTS.map((r, i) => (
							<div className="p-2 border rounded mb-1 d-flex justify-content-between align-items-center" key={i}>
								<span>{r.label}</span>
								<input type="checkbox" className="form-check-input" checked={remSel[i]} onChange={e => setRemSel(prev => prev.map((v, j) => (j === i ? e.target.checked : v)))} />
							</div>
						))}
						<label className={styles.formLabel}>Channel</label>
						<select className={`${styles.formControl} mb-2`} value={remChannel} onChange={e => setRemChannel(e.target.value)}>
							<option>SMS + WhatsApp + Email</option><option>SMS only</option><option>WhatsApp only</option><option>Email only</option>
						</select>
						<label className={styles.formLabel}>Template</label>
						<select className={`${styles.formControl} mb-2`} value={remTemplate} onChange={e => setRemTemplate(e.target.value)}>
							<option>Friendly reminder</option><option>Formal notice</option><option>Final demand before action</option>
						</select>
						<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)", fontSize: 12 }}>
							Hi {"{{name}}"}, just a friendly reminder that your invoice INV-{"{{ref}}"} of KES {"{{amount}}"} is {"{{days}}"} days overdue. Please pay via M-Pesa Paybill 247247.
						</div>
					</>
				))}
			</MBox>

			{/* M15: Write Off */}
			<MBox id="writeOffModal" active={active} onClose={onClose}
				title={<><i className="bi bi-file-x me-2" />Write Off Debt</>}
				footer={actionFooter("writeOffModal", "Write Off", "Debt written off & credit note created!", "danger")}>
				{actionBody("writeOffModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Customer</label>
							<select className={styles.formControl}><option>StartUp Inc</option></select>
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Amount</label>
							<input className={styles.formControl} defaultValue="185000" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Reason</label>
							<select className={styles.formControl}><option>Customer insolvent</option><option>Disputed</option><option>Error</option><option>Other</option></select>
						</div>
						<div className="p-3 rounded" style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}>
							Creates a credit note & bad-debt expense in the ledger. Requires accountant review.
						</div>
					</>
				))}
			</MBox>

			{/* M16: Aging Report */}
			<MBox id="agingReportModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-list-check me-2" />Aging Report</>}
				footer={actionFooter("agingReportModal", "Export", "Aging report exported!")}>
				{actionBody("agingReportModal", (
					<div className="table-responsive">
						<table className={`${styles.table}`}>
							<thead><tr><th>Customer</th><th>0-30</th><th>31-60</th><th>61-90</th><th>90+</th><th>Total</th></tr></thead>
							<tbody>
								{[
									{ c: "Retail Chain A", a: "60K", b: "0", c2: "40K", d: "20K", t: "120K", hi: 2, cr: 3 },
									{ c: "StartUp Inc", a: "90K", b: "55K", c2: "40K", d: "0", t: "185K", hi: 1 },
									{ c: "Acme Corp", a: "120K", b: "200K", c2: "100K", d: "0", t: "420K", hi: 2 },
								].map(row => (
									<tr key={row.c}>
										<td>{row.c}</td>
										<td>{row.a}</td>
										<td className={row.hi === 1 ? styles.hi : ""}>{row.b}</td>
										<td className={row.hi === 2 ? styles.hi : ""}>{row.c2}</td>
										<td className={row.cr === 3 ? styles.cr : ""}>{row.d}</td>
										<td><strong>{row.t}</strong></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				))}
			</MBox>

			{/* M17: Refund */}
			<MBox id="refundModal" active={active} onClose={onClose}
				title={<><i className="bi bi-arrow-counterclockwise me-2" />Initiate Refund</>}
				footer={actionFooter("refundModal", "Submit Refund", "Refund submitted for approval!", "primary")}>
				{actionBody("refundModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Original Transaction</label>
							<input className={styles.formControl} defaultValue="MP-882910" placeholder="Search by ID, customer, date" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Refund Amount</label>
							<input className={styles.formControl} defaultValue="25000" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Reason</label>
							<select className={styles.formControl}><option>Duplicate payment</option><option>Overpayment</option><option>Returned goods</option><option>Service not rendered</option><option>Error</option></select>
						</div>
						<div className="p-3 rounded" style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}>
							<i className="bi bi-info-circle" /> Refund above KES 10,000 requires a second approver. This refund will reduce VAT liability.
						</div>
					</>
				))}
			</MBox>

			{/* M18: Disputes */}
			<MBox id="disputesModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-shield-exclamation me-2" />Disputes & Chargebacks</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{actionBody("disputesModal", (
					<div className="table-responsive">
						<table className={styles.table}>
							<thead><tr><th>Dispute ID</th><th>Transaction</th><th>Amount</th><th>Reason</th><th>Deadline</th><th>Status</th><th /></tr></thead>
							<tbody>
								{DISPUTES.map(d => (
									<tr key={d.id}>
										<td>{d.id}</td>
										<td>{d.txn}</td>
										<td>{d.amount}</td>
										<td>{d.reason}</td>
										<td>{d.deadlineTone ? <Badge tone={d.deadlineTone}>{d.deadline}</Badge> : d.deadline}</td>
										<td>{d.status}</td>
										<td>{d.evidence && <button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => simulate("disputesModal", "Evidence builder opened")}>Evidence</button>}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				))}
			</MBox>

			{/* M19: Fee Compare */}
			<MBox id="feeCompareModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-arrow-left-right me-2" />Compare All Methods</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="table-responsive">
					<table className={styles.table}>
						<thead><tr><th>Method</th><th>Fee</th><th>You Receive</th><th>Settlement</th></tr></thead>
						<tbody>
							{FEE_COMPARE.map(f => (
								<tr key={f.method}>
									<td>{f.method} {f.best && <Badge tone="success">Best</Badge>}</td>
									<td>{f.fee}</td>
									<td><strong className={f.best ? "" : ""} style={f.best ? { color: "var(--pm-accent)" } : undefined}>{f.receive}</strong></td>
									<td>{f.settlement}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* M20: Record Payment */}
			<MBox id="recordPaymentModal" active={active} onClose={onClose}
				title={<><i className="bi bi-check2-circle me-2" />Record Payment</>}
				footer={actionFooter("recordPaymentModal", "Record", "Payment recorded & invoice marked paid!", "success")}>
				{actionBody("recordPaymentModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Find Invoice</label>
							<input className={styles.formControl} placeholder="Invoice # or customer" />
						</div>
						<div className="p-2 border rounded mb-2 d-flex justify-content-between align-items-center">
							<div>
								<strong>INV-2025-143</strong>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Global Industries · Balance KES 120K</div>
							</div>
							<Badge tone="info">Selected</Badge>
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Amount Paid</label>
							<input className={styles.formControl} defaultValue="120000" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Payment Method</label>
							<select className={styles.formControl}><option>Cash</option><option>M-Pesa (offline)</option><option>Cheque</option></select>
						</div>
					</>
				))}
			</MBox>

			{/* M21: Check Status */}
			<MBox id="checkStatusModal" active={active} onClose={onClose}
				title={<><i className="bi bi-search me-2" />Check Payment Status</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{actionBody("checkStatusModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Transaction ID or Phone</label>
							<input className={styles.formControl} placeholder="MP-882910 or 0712345890" />
						</div>
						<button type="button" className={`${styles.btnPm} ${styles.btnPmP} w-100`} disabled={busy === "checkStatusModal"} onClick={() => simulate("checkStatusModal", "Payment found: MP-882910 · KES 150,000 · Completed today 14:22")}>
							<i className="bi bi-search" /> Look Up
						</button>
					</>
				))}
			</MBox>

			{/* M22: Fee Check */}
			<MBox id="feeCalcModal" active={active} onClose={onClose}
				title={<><i className="bi bi-calculator me-2" />Fee Check</>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen("feeCompareModal")}>Compare</button>
					</>
				}>
				<div className="mb-3">
					<label className={styles.formLabel}>Amount</label>
					<input type="number" className={styles.formControl} value={feeCheckAmt} onChange={e => setFeeCheckAmt(parseFloat(e.target.value) || 0)} />
				</div>
				<div className="p-3 rounded" style={{ background: "var(--pm-info-soft)", fontSize: 13 }}>
					<StatusRow label="M-Pesa Paybill" value={<strong>{fmt(feeCheckAmt * 0.005)}</strong>} />
					<StatusRow label="PesaLink" value={<strong className="text-success">KES 0</strong>} />
					<StatusRow label="Card" value={<strong>{fmt(feeCheckAmt * 0.025)}</strong>} />
				</div>
			</MBox>

			{/* M23: Subscription Detail */}
			<MBox id="subscriptionDetailModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-arrow-repeat me-2" />Recurring — Apex Retail Ltd</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={styles.tabRow}>
					{(["sch", "hist", "dunn"] as const).map(t => (
						<button key={t} type="button" className={`${styles.tabPill} ${tabs.subDetail === t ? styles.tabPillActive : ""}`} onClick={() => setTabs(prev => ({ ...prev, subDetail: t }))}>
							{t === "sch" ? "Schedule" : t === "hist" ? "Payment History" : "Dunning"}
						</button>
					))}
				</div>
				{tabs.subDetail === "sch" && (
					<>
						<StatusRow label="Amount" value={<strong>KES 5,000 / month</strong>} />
						<StatusRow label="Next Invoice" value={<strong>05 Nov 2025</strong>} />
						<StatusRow label="Lifetime Invoiced" value={<strong>KES 45,000</strong>} />
						<StatusRow label="On-time rate" value={<strong>92%</strong>} />
						<StatusRow label="Status" value={<Badge tone="success">Active</Badge>} />
						<div className="d-flex gap-2 mt-3">
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => onToast("Recurring paused")}>Pause</button>
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm}`} onClick={() => simulate("subscriptionDetailModal", "Customer portal link copied!")}><i className="bi bi-share" /> Customer Portal</button>
							<button type="button" className={`${styles.btnPm} ${styles.btnPmSm} ${styles.btnPmD}`} onClick={() => simulate("subscriptionDetailModal", "Schedule ended")}>End Schedule</button>
						</div>
					</>
				)}
				{tabs.subDetail === "hist" && (
					<div className="table-responsive">
						<table className={styles.table}>
							<thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Status</th></tr></thead>
							<tbody>
								{SUBSCRIPTION_HISTORY.map(h => (
									<tr key={h.invoice}>
										<td>{h.date}</td><td>{h.invoice}</td><td>{h.amount}</td>
										<td><Badge tone={h.tone}>{h.status}</Badge></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{tabs.subDetail === "dunn" && (
					<div className="p-3 rounded" style={{ background: "var(--pm-info-soft)", fontSize: 12 }}>
						Dunning: Day 1 SMS · Day 3 WhatsApp · Day 7 Email with late fee · Day 14 pause service
					</div>
				)}
			</MBox>

			{/* M24: New Recurring */}
			<MBox id="newRecurringModal" active={active} onClose={onClose}
				title={<><i className="bi bi-plus-lg me-2" />Create Recurring Invoice</>}
				footer={actionFooter("newRecurringModal", "Create", "Recurring invoice created!", "success")}>
				{actionBody("newRecurringModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Customer</label>
							<input className={styles.formControl} placeholder="Search customer" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Amount</label>
							<input className={styles.formControl} defaultValue="5000" />
						</div>
						<div className="row g-2 mb-3">
							<div className="col-6">
								<label className={styles.formLabel}>Frequency</label>
								<select className={styles.formControl}><option>Monthly</option><option>Weekly</option><option>Quarterly</option></select>
							</div>
							<div className="col-6">
								<label className={styles.formLabel}>Start Date</label>
								<input type="date" className={styles.formControl} />
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>End Condition</label>
							<select className={styles.formControl}><option>Until cancelled</option><option>After X invoices</option><option>On date</option></select>
						</div>
					</>
				))}
			</MBox>

			{/* M25: Goal */}
			<MBox id="goalModal" active={active} onClose={onClose}
				title={<><i className="bi bi-bullseye me-2" />Set Collection Target</>}
				footer={actionFooter("goalModal", "Save", "Collection target set!")}>
				{actionBody("goalModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel}>Monthly Target (KES)</label>
							<input className={styles.formControl} defaultValue="5000000" />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel}>Period</label>
							<select className={styles.formControl}><option>This month</option><option>Next month</option></select>
						</div>
					</>
				))}
			</MBox>

			{/* M26: Health Check */}
			<MBox id="healthCheckModal" active={active} onClose={onClose}
				title={<><i className="bi bi-activity text-success me-2" />Business Health</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="d-flex justify-content-center mb-3">
					<div style={{ width: 110, height: 110, borderRadius: "50%", border: "7px solid var(--pm-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
						<span style={{ fontSize: 28, fontWeight: 700 }}>92</span>
						<span style={{ fontSize: 10, color: "var(--pm-muted)" }}>SCORE</span>
					</div>
				</div>
				<StatusRow label="Liquidity" value={<Badge tone="success">Excellent</Badge>} />
				<StatusRow label="Collections" value={<Badge tone="warning">Needs Focus</Badge>} />
				<StatusRow label="Compliance" value={<Badge tone="danger">Action Reqd</Badge>} />
			</MBox>

			{/* M27: Notifications */}
			<MBox id="notificationsModal" active={active} onClose={onClose}
				title={<><i className="bi bi-bell me-2" />Alerts <Badge tone="danger">9 new</Badge></>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						<button type="button" className={`${styles.btnPm} ${styles.btnPmP} ${styles.btnPmSm}`} onClick={() => onToast("All marked read")}>Mark all read</button>
					</>
				}>
				<div className={styles.notifyScroll}>
					{NOTIFICATIONS.map((n, i) => (
						<div key={i} className="p-3 rounded mb-2" style={{ background: n.tone === "danger" ? "var(--pm-danger-soft)" : n.tone === "warning" ? "var(--pm-warning-soft)" : "var(--pm-info-soft)", fontSize: 13 }}>
							<strong>{n.title}</strong>{n.desc && <> — {n.desc}</>}
						</div>
					))}
				</div>
			</MBox>

			{/* M28: Profile */}
			<MBox id="profileModal" active={active} onClose={onClose}
				title={<><i className="bi bi-person-badge me-2" />My Profile</>}
				footer={<button type="button" className={`${styles.btnPm} ${styles.btnPmD}`} onClick={onClose}>Log Out</button>}>
				<div className="text-center">
					<div className={`${styles.iconCircle} ${styles.round} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24, background: "var(--pm-primary)", color: "#fff" }}>AD</div>
					<h4 style={{ fontWeight: 700 }}>Amina D.</h4>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>Director (Admin) · TechSolutions Ltd</p>
					<div className="p-3 border rounded text-start mt-3">
						<StatusRow label="Approval Limit" value={<strong>Unlimited</strong>} />
						<StatusRow label="Security" value={<Badge tone="success">MFA Active</Badge>} />
					</div>
				</div>
			</MBox>

			{/* M29: Support */}
			<MBox id="supportModal" active={active} onClose={onClose}
				title={<><i className="bi bi-headset me-2" />Help & Support</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="p-3 border rounded mb-2 d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => onToast("Chat opened (demo)")}>
					<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-primary)", color: "#fff" }}><i className="bi bi-chat-dots" /></div>
					<div><strong>Live Chat</strong><div style={{ fontSize: 11, color: "var(--pm-muted)" }}>avg reply 2 min</div></div>
				</div>
				<div className="p-3 border rounded mb-2 d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => onToast("Help center (demo)")}>
					<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-info)", color: "#fff" }}><i className="bi bi-journal-text" /></div>
					<div><strong>Help Center</strong></div>
				</div>
				<div className="p-3 border rounded d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => onOpen("checkStatusModal")}>
					<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-accent)", color: "#fff" }}><i className="bi bi-search" /></div>
					<div><strong>Check a payment</strong></div>
				</div>
			</MBox>
		</>
	);
}
