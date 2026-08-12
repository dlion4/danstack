import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import React from "react";
import styles from "../styles/command-center.module.css";

/* ============================================================================
   Business Command Center — modal layer (legacy page 3.1, 21 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state
     doAction(id,msg)   → `results` state; shows loading spinner, then receipt
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     cacheAndReset()    → useEffect on close resets flows + results + tabs
   ========================================================================== */

interface ModalsProps {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}

type Size = "md" | "lg" | "xl";

interface MBoxProps {
	id: string;
	active: string | null;
	title: ReactNode;
	size?: Size;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
}

/* ---------- LEGACY BRIDGE: file download helper ---------- */
function downloadFile(name: string, content: string, type = "text/plain") {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content], { type }));
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}

/* ---------- modal shell ---------- */
function MBox({
	id,
	active,
	title,
	size = "md",
	onClose,
	children,
	footer,
}: MBoxProps) {
	const s = styles as Record<string, string>;
	if (active !== id) return null;
	return (
		<>
			<div className={s.backdrop} onClick={onClose} />
			<div
				className={s.modalWrap}
				role="dialog"
				aria-modal="true"
				aria-label={id}
			>
				<div
					className={`${s.modalBox} ${size === "lg" ? s.modalBoxLg : ""} ${size === "xl" ? s.modalBoxXl : ""}`}
				>
					<div className={s.modalHeader}>
						<h5 className={s.modalTitle}>{title}</h5>
						<button
							type="button"
							className="btn-close"
							aria-label="Close"
							onClick={onClose}
						/>
					</div>
					<div className={s.modalBody}>{children}</div>
					{footer && <div className={s.modalFooter}>{footer}</div>}
				</div>
			</div>
		</>
	);
}

function BusyOverlay() {
	const s = styles as Record<string, string>;
	return (
		<div className={s.loadingOv}>
			<div className={s.spinner} />
			<p className={s.loadingLabel}>Processing...</p>
		</div>
	);
}

/* ---------- data arrays ---------- */
const CUSTOMERS = ["Acme Corp", "Global Industries", "+ Add New Customer"];
const DEPARTMENTS = ["Finance", "HR", "Sales", "Operations"];
const ROLES = [
	{ label: "Admin", desc: "Manage settings, approve payments", checked: true },
	{ label: "Finance / Maker", desc: "Create invoices, initiate payments" },
	{ label: "Viewer", desc: "Read-only access to reports" },
];

/* LEGACY BRIDGE: flow definitions - matching original HTML exactly */
const FLOW_DEFS: Record<string, { labels: string[] }> = {
	newInvoice: { labels: ["Details", "Line Items", "Schedule", "Review"] },
	payroll: { labels: ["Employees", "Review", "Deductions", "Funding", "Authorize"] },
	transfer: { labels: ["From/To", "Amount", "FX & Fees", "Reference", "Confirm"] },
	invite: { labels: ["Details", "Role", "Limits", "Security", "Review"] },
};

interface Result {
	msg: string;
	ref?: string;
}

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
	const s = styles as Record<string, string>;
	const def = FLOW_DEFS[flowKey];
	if (!def) return null;
	return (
		<div className={s.stepper}>
			{def.labels.map((label, i) => {
				const stepNum = i + 1;
				const done = stepNum < current;
				const active = stepNum === current;
				return (
					<React.Fragment key={label}>
						<div
							className={`${s.step} ${done ? s.stepDone : ""} ${active ? s.stepActive : ""}`}
						>
							<div className={s.stepN}>
								{done ? <i className="bi bi-check" /> : stepNum}
							</div>
							<div className={s.stepL}>{label}</div>
						</div>
						{i < def.labels.length - 1 && (
							<div
								className={s.stepLine}
								style={{
									...(done ? { background: "var(--pm-accent)" } : {}),
								}}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
}

export default function CommandCenterModals({
	active,
	onClose,
	onOpen,
}: ModalsProps) {
	const s = styles as Record<string, string>;
	const cx = (...cls: (string | false | undefined)[]) =>
		cls.filter(Boolean).join(" ");

	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({
		newInvoice: 1,
		payroll: 1,
		transfer: 1,
		invite: 1,
	});
	const [tabs, setTabs] = useState<Record<string, string>>({});

	/* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ newInvoice: 1, payroll: 1, transfer: 1, invite: 1 });
			setBusy(null);
			setTabs({});
		}
	}, [active]);

	const busyTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(busyTimer.current), []);

	/* LEGACY BRIDGE: doAction(modalId, msg, ref) */
	const doAction = (modalId: string, msg: string, ref?: string) => {
		setBusy(modalId);
		busyTimer.current = window.setTimeout(() => {
			setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }));
			setBusy(null);
		}, 1500);
	};

	/* LEGACY BRIDGE: nextFlow(key, total) */
	const nextFlow = (key: string, total: number) => {
		const cur = flows[key] ?? 1;
		if (cur >= total) {
			onClose();
			return;
		}
		setFlows((prev) => ({ ...prev, [key]: cur + 1 }));
	};

	const switchTab = (prefix: string, key: string) => {
		setTabs((prev) => ({ ...prev, [prefix]: key }));
	};

	/* Receipt renderer */
	const renderReceipt = (r: Result) => (
		<div className={s.receipt}>
			<div className={s.receiptIcon}>
				<i className="bi bi-check-lg" />
			</div>
			<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>{r.msg}</h5>
			{r.ref && (
				<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Ref: {r.ref}</p>
			)}
			<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => downloadFile("receipt.txt", r.msg)}
				>
					<i className="bi bi-download" /> Save
				</button>
				<button className={cx(s.btnPm, s.btnSm)}>
					<i className="bi bi-share" /> Continue
				</button>
			</div>
		</div>
	);

	const renderActionBody = (modalId: string, defaultContent: ReactNode) => {
		if (busy === modalId) return <BusyOverlay />;
		if (results[modalId]) return renderReceipt(results[modalId]);
		return defaultContent;
	};

	/* ==========================================================================
     M1: New Invoice (Multistep, 4 steps)
     ======================================================================== */
	const renderNewInvoice = () => {
		const step = flows.newInvoice;
		return (
			<MBox
				id="newInvoiceModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-receipt text-primary me-2" />
						Create Quick Invoice
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("newInvoice", 4)}
						>
							{step >= 4 ? (
								"Send Invoice"
							) : (
								<>
									Continue <i className="bi bi-arrow-right" />
								</>
							)}
						</button>
					</>
				}
			>
				<Stepper flowKey="newInvoice" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Customer Details</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Customer</label>
							<select className={s.formControl}>
								{CUSTOMERS.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Invoice Date</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-10-28"
							/>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Due Date</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-11-15"
							/>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Line Items</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Description</label>
							<textarea
								className={s.formControl}
								rows={2}
								defaultValue="IT Consulting Services - October 2025"
							/>
						</div>
						<div className="row g-2 mb-3">
							<div className="col-6">
								<label className={s.formLabel}>Quantity</label>
								<input
									type="number"
									className={s.formControl}
									defaultValue="1"
								/>
							</div>
							<div className="col-6">
								<label className={s.formLabel}>Unit Price (KES)</label>
								<input
									type="number"
									className={s.formControl}
									defaultValue="150000"
								/>
							</div>
						</div>
						<div
							className="p-3 rounded mb-2"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<div className="d-flex justify-content-between">
								<span>Subtotal</span>
								<strong>KES 150,000</strong>
							</div>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Schedule & Options</h6>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								Send payment link via Email
							</label>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								Send payment link via SMS
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
							/>
							<label className="form-check-label">
								Enable auto-reminder for overdue invoices
							</label>
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Review & Send</h6>
						<div
							className="p-3 border rounded mb-3"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Customer</span>
								<strong>Acme Corp</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Description</span>
								<strong>IT Consulting Services</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Due Date</span>
								<strong>Nov 15, 2025</strong>
							</div>
							<hr className={s.divider} />
							<div className="d-flex justify-content-between">
								<span>Total Amount</span>
								<strong style={{ color: "var(--pm-primary)" }}>
									KES 150,000
								</strong>
							</div>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								I confirm the invoice details are correct
							</label>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M2: Run Payroll (Multistep, 5 steps)
     ======================================================================== */
	const renderRunPayroll = () => {
		const step = flows.payroll;
		return (
			<MBox
				id="runPayrollModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-people text-success me-2" />
						Run & Approve Payroll
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("payroll", 5)}
						>
							{step >= 5 ? (
								"Execute Payroll"
							) : (
								<>
									Continue <i className="bi bi-arrow-right" />
								</>
							)}
						</button>
					</>
				}
			>
				<Stepper flowKey="payroll" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Select Employees</h6>
						<div className="table-responsive">
							<table className={s.tbl}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Dept</th>
										<th>Gross</th>
										<th>Net</th>
										<th>Method</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td data-label="Name">Amina D.</td>
										<td data-label="Dept">Admin</td>
										<td data-label="Gross">200,000</td>
										<td data-label="Net">155,000</td>
										<td data-label="Method">Bank</td>
									</tr>
									<tr>
										<td data-label="Name">Peter K.</td>
										<td data-label="Dept">Finance</td>
										<td data-label="Gross">150,000</td>
										<td data-label="Net">117,500</td>
										<td data-label="Method">Bank</td>
									</tr>
									<tr>
										<td data-label="Name">Grace M.</td>
										<td data-label="Dept">Eng</td>
										<td data-label="Gross">95,000</td>
										<td data-label="Net">71,200</td>
										<td data-label="Method">Bank</td>
									</tr>
									<tr>
										<td data-label="Name">David O.</td>
										<td data-label="Dept">Sales</td>
										<td data-label="Gross">60,000</td>
										<td data-label="Net">48,500</td>
										<td data-label="Method">M-Pesa</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div
							className="p-2 rounded mt-2"
							style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}
						>
							<i className="bi bi-exclamation-triangle" /> 1 employee missing bank details — will be paid via M-Pesa.
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Review Payroll Summary</h6>
						<div
							className="p-3 border rounded mb-2"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span>Gross Pay</span>
								<strong>KES 620,000</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>PAYE (Income Tax)</span>
								<strong className="text-danger">- KES 98,000</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>NSSF</span>
								<strong className="text-danger">- KES 2,160</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>SHIF</span>
								<strong className="text-danger">- KES 5,400</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Other deductions</span>
								<strong className="text-danger">- KES 63,940</strong>
							</div>
							<hr className={s.divider} />
							<div className="d-flex justify-content-between">
								<span style={{ fontWeight: 700 }}>Net Disbursement</span>
								<strong style={{ color: "var(--pm-accent)" }}>
									KES 450,500
								</strong>
							</div>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Statutory & Deductions</h6>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Auto-file KRA P10, NSSF & SHIF returns
							</label>
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Funding Wallet & FX</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Fund from</label>
							<select className={s.formControl}>
								<option>PayMo Business Wallet (KES 2.45M)</option>
								<option>Equity Bank (KES 8.12M)</option>
							</select>
						</div>
						<div
							className="p-3 rounded mb-3"
							style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
						>
							This run is in <strong>KES</strong>. No FX conversion required.
							<br />
							<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								Balance after run: KES 1.99M
							</span>
						</div>
					</div>
				)}
				{step === 5 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Authorize Execution</h6>
						<div
							className="p-3 rounded mb-3"
							style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
						>
							Disbursing <strong>KES 450,500</strong> to 24 employees. Dual-approval required for amounts over KES 500K.
						</div>
						<label className={s.formLabel} style={{ textAlign: "center" }}>
							Enter Director PIN
						</label>
						<div className={s.pinRow}>
							{[0, 1, 2, 3].map((i) => (
								<input
									key={i}
									type="password"
									maxLength={1}
									className={s.formControl}
									style={{
										width: 50,
										height: 60,
										textAlign: "center",
										fontSize: 24,
										fontWeight: 700,
									}}
								/>
							))}
						</div>
						<div
							className="form-check mt-3 text-center d-flex justify-content-center"
						>
							<input
								className="form-check-input me-2"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 12 }}>
								I authorize this payroll run
							</label>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M3: Inter-Company Transfer (Multistep, 5 steps)
     ======================================================================== */
	const renderInterCompanyTransfer = () => {
		const step = flows.transfer;
		return (
			<MBox
				id="interCompanyTransferModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-left-right me-2"
							style={{ color: "var(--pm-purple)" }}
						/>
						Inter-Company Transfer
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("transfer", 5)}
						>
							{step >= 5 ? "Confirm Transfer" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="transfer" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>From / To Accounts</h6>
						<div className="mb-3">
							<label className={s.formLabel}>From Account</label>
							<select className={s.formControl}>
								<option>TechSolutions Ltd (KES 2.45M)</option>
								<option>TS Logistics (KES 8.10M)</option>
								<option>TechSolutions Foundation (KES 3.20M)</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>To Account</label>
							<select className={s.formControl}>
								<option>TS Logistics & Delivery</option>
								<option>TechSolutions Foundation</option>
								<option>TechSolutions Retail</option>
							</select>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Amount</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Amount (KES)</label>
							<input
								type="number"
								className={s.formControl}
								defaultValue="500000"
							/>
						</div>
						<div
							className="p-3 rounded mb-2"
							style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
						>
							Available in source: <strong>KES 2,450,000</strong>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>FX & Fees</h6>
						<div
							className="p-3 border rounded mb-2"
							style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span>Transfer Amount</span>
								<strong>KES 500,000</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>FX Rate</span>
								<strong>1:1 (Same Currency)</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Processing Fee</span>
								<strong>KES 0 (Internal)</strong>
							</div>
							<hr className={s.divider} />
							<div className="d-flex justify-content-between">
								<span>Total Debit</span>
								<strong style={{ color: "var(--pm-primary)" }}>
									KES 500,000
								</strong>
							</div>
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Reference & Memo</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Reference</label>
							<input
								type="text"
								className={s.formControl}
								defaultValue="TRF-2025-1028"
							/>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Memo / Description</label>
							<textarea
								className={s.formControl}
								rows={2}
								defaultValue="Funds for Q4 logistics expansion"
							/>
						</div>
					</div>
				)}
				{step === 5 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Confirm Transfer</h6>
						<div
							className="p-3 border rounded mb-3"
							style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">From</span>
								<strong>TechSolutions Ltd</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">To</span>
								<strong>TS Logistics & Delivery</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Amount</span>
								<strong style={{ color: "var(--pm-primary)" }}>
									KES 500,000
								</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span className="text-muted">Reference</span>
								<strong>TRF-2025-1028</strong>
							</div>
						</div>
						<label className={s.formLabel} style={{ textAlign: "center" }}>
							Enter Director PIN
						</label>
						<div className={s.pinRow}>
							{[0, 1, 2, 3].map((i) => (
								<input
									key={i}
									type="password"
									maxLength={1}
									className={s.formControl}
									style={{
										width: 50,
										height: 60,
										textAlign: "center",
										fontSize: 24,
										fontWeight: 700,
									}}
								/>
							))}
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M4: Invite User (Multistep, 5 steps)
     ======================================================================== */
	const renderInviteUser = () => {
		const step = flows.invite;
		return (
			<MBox
				id="inviteUserModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-plus me-2" />
						Invite Team Member
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("invite", 5)}
						>
							{step >= 5 ? "Send Invite" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="invite" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Member Details</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Full Name</label>
							<input className={s.formControl} defaultValue="John Mwangi" />
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Email</label>
							<input
								className={s.formControl}
								defaultValue="john@techsol.co.ke"
							/>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Phone (Optional)</label>
							<input
								type="tel"
								className={s.formControl}
								defaultValue="+254 712 345 678"
							/>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Department</label>
							<select className={s.formControl}>
								{DEPARTMENTS.map((d) => (
									<option key={d}>{d}</option>
								))}
							</select>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Assign Role</h6>
						{ROLES.map((r) => (
							<div
								key={r.label}
								className="p-3 border rounded mb-2"
								style={{
									...(r.checked
										? {
												borderColor: "var(--pm-primary)",
												background: "rgba(79,70,229,.04)",
										  }
										: {}),
								}}
							>
								<div className="form-check">
									<input
										className="form-check-input"
										type="radio"
										name="role"
										defaultChecked={r.checked}
									/>
									<label className="form-check-label">
										<strong>{r.label}</strong> - {r.desc}
									</label>
								</div>
							</div>
						))}
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Approval Limits</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Approval Limit (KES)</label>
							<input
								type="number"
								className={s.formControl}
								defaultValue="1000000"
							/>
						</div>
						<div
							className="p-3 rounded mb-2"
							style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
						>
							<i className="bi bi-info-circle" /> Limits apply to single transactions. Requires dual-approval for amounts above limit.
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Security Settings</h6>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								disabled
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Require 2FA/MFA (Enforced for Admin)
							</label>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Allow access to multi-business switcher
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Require IP whitelist for login
							</label>
						</div>
					</div>
				)}
				{step === 5 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Review & Send Invite</h6>
						<div
							className="p-3 border rounded mb-3"
							style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Name</span>
								<strong>John Mwangi</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Email</span>
								<strong>john@techsol.co.ke</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Role</span>
								<strong>Admin</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted">Approval Limit</span>
								<strong>KES 1,000,000</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span className="text-muted">MFA</span>
								<span className={cx(s.badge, s.badgeS)}>Required</span>
							</div>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 12 }}>
								I confirm the invitation details are correct
							</label>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M5: KYB Upload Modal
     ======================================================================== */
	const renderKybUpload = () => (
		<MBox
			id="kybUploadModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-check text-secondary me-2" />
					KYB Document Upload
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction(
								"kybUploadModal",
								"Document uploaded and sent for verification.",
								"KYB-99120",
							)
						}
					>
						Submit for Verification
					</button>
				</>
			}
		>
			{renderActionBody(
				"kybUploadModal",
				<>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-danger-soft)", fontSize: 13 }}
					>
						<i className="bi bi-exclamation-triangle text-danger" /> Missing
						Annual Returns (CR12). Limit restrictions will apply in 5 days.
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Document Type</label>
						<select className={s.formControl} disabled>
							<option>CR12 / Annual Returns</option>
						</select>
					</div>
					<div className={s.uploadZone}>
						<i
							className="bi bi-cloud-arrow-up"
							style={{ fontSize: 32, color: "var(--pm-primary)" }}
						/>
						<div style={{ fontWeight: 600, marginTop: 8 }}>
							Click to browse or drag file here
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							PDF, JPG, PNG (Max 5MB)
						</div>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M6: Business Settings Modal (with tabs)
     ======================================================================== */
	const renderBusinessSettings = () => {
		const currentTab = tabs.bizSettings ?? "general";
		return (
			<MBox
				id="businessSettingsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear me-2" />
						Business Settings
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"businessSettingsModal",
									"Settings updated successfully!",
								)
							}
						>
							Save Changes
						</button>
					</>
				}
			>
				{renderActionBody(
					"businessSettingsModal",
					<>
						<div className={cx(s.pills, "mb-3")}>
							<button
								className={cx(s.pill, currentTab === "general" && s.pillActive)}
								onClick={() => switchTab("bizSettings", "general")}
							>
								General
							</button>
							<button
								className={cx(s.pill, currentTab === "address" && s.pillActive)}
								onClick={() => switchTab("bizSettings", "address")}
							>
								Address & Contacts
							</button>
							<button
								className={cx(
									s.pill,
									currentTab === "signatories" && s.pillActive,
								)}
								onClick={() => switchTab("bizSettings", "signatories")}
							>
								Signatories
							</button>
						</div>
						{currentTab === "general" && (
							<div className="row g-3 mt-2">
								<div className="col-md-6">
									<label className={s.formLabel}>Trading Name</label>
									<input
										type="text"
										className={s.formControl}
										defaultValue="TechSolutions Ltd"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Industry Sector</label>
									<select className={s.formControl}>
										<option>Information Technology</option>
										<option>Retail</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Support Email</label>
									<input
										type="email"
										className={s.formControl}
										defaultValue="support@techsol.co.ke"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Support Phone</label>
									<input
										type="text"
										className={s.formControl}
										defaultValue="+254 700 000 000"
									/>
								</div>
							</div>
						)}
						{currentTab === "address" && (
							<div className="row g-3 mt-2">
								<div className="col-md-6">
									<label className={s.formLabel}>Physical Address</label>
									<input
										className={s.formControl}
										defaultValue="123 Westlands Rd, Nairobi"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Postal Code</label>
									<input className={s.formControl} defaultValue="00100" />
								</div>
							</div>
						)}
						{currentTab === "signatories" && (
							<div className="mt-2">
								<div
									className="p-3 border rounded mb-2"
									style={{ fontSize: 13 }}
								>
									<strong>Amina D.</strong> — Director (Primary)
									<br />
									<span className="text-muted">
										ID: 29123456 · Signature captured
									</span>
								</div>
							</div>
						)}
					</>,
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M7: Switch Business Modal
     ======================================================================== */
	const renderSwitchBusiness = () => (
		<MBox
			id="switchBusinessModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-diagram-3 me-2" />
					Switch Business Account
				</>
			}
		>
			<div className={cx(s.headerSearch, "mb-3")} style={{ maxWidth: "100%" }}>
				<i className="bi bi-search" />
				<input type="text" placeholder="Search businesses..." />
			</div>
			<div
				className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center"
				style={{
					borderColor: "var(--pm-primary)",
					background: "rgba(79,70,229,.04)",
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<div className={s.avatar} style={{ background: "var(--pm-ink)" }}>
						TS
					</div>
					<div>
						<div style={{ fontWeight: 600, fontSize: 14 }}>
							TechSolutions Ltd
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							Owner · Current
						</div>
					</div>
				</div>
				<i className="bi bi-check-circle-fill text-primary" />
			</div>
			<div
				className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() =>
					doAction("switchBusinessModal", "Switched to TS Logistics!")
				}
			>
				<div className="d-flex align-items-center gap-2">
					<div className={s.avatar} style={{ background: "var(--pm-danger)" }}>
						TL
					</div>
					<div>
						<div style={{ fontWeight: 600, fontSize: 14 }}>
							TS Logistics & Delivery
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Owner</div>
					</div>
				</div>
			</div>
			<div
				className="p-3 border rounded d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() =>
					doAction("switchBusinessModal", "Switched to Foundation!")
				}
			>
				<div className="d-flex align-items-center gap-2">
					<div className={s.avatar} style={{ background: "var(--pm-info)" }}>
						TF
					</div>
					<div>
						<div style={{ fontWeight: 600, fontSize: 14 }}>
							TechSolutions Foundation
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Admin</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M8: Cash Flow Details
     ======================================================================== */
	const renderCashFlow = () => (
		<MBox
			id="cashFlowDetailsModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bank me-2" />
					Cash Position & Liquidity
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="row g-3">
				<div className="col-md-6">
					<div className="p-3 border rounded h-100">
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							PAYMO BUSINESS WALLET
						</div>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-primary)",
							}}
						>
							KES 2,450,000
						</div>
						<button
							className={cx(s.btnPm, s.btnSm, "mt-2 w-100")}
							onClick={() => onOpen("interCompanyTransferModal")}
						>
							Transfer Funds
						</button>
					</div>
				</div>
				<div className="col-md-6">
					<div className="p-3 border rounded h-100">
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							LINKED ACCOUNTS (EQUITY BANK)
						</div>
						<div style={{ fontSize: 24, fontWeight: 700 }}>KES 8,120,500</div>
						<button
							className={cx(s.btnPm, s.btnSm, "mt-2 w-100")}
							onClick={() => onOpen("connectBankModal")}
						>
							Manage Connections
						</button>
					</div>
				</div>
			</div>
			<h6 style={{ fontWeight: 700, marginTop: 20 }}>
				Pending Settlements (T+1)
			</h6>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Source</th>
							<th>Amount</th>
							<th>Expected Date</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td data-label="Source">M-Pesa Till (Buy Goods)</td>
							<td data-label="Amount">KES 450,000</td>
							<td data-label="Expected Date">Tomorrow, 8:00 AM</td>
						</tr>
						<tr>
							<td data-label="Source">Visa/Mastercard Gateway</td>
							<td data-label="Amount">KES 400,000</td>
							<td data-label="Expected Date">Tomorrow, 2:00 PM</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M9: Aging Invoices Modal
     ======================================================================== */
	const renderAgingInvoices = () => (
		<MBox
			id="agingInvoicesModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-receipt me-2" />
					Outstanding Invoices (Aging Report)
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction(
								"agingInvoicesModal",
								"Reminders sent to all overdue customers via Email & SMS.",
							)
						}
					>
						<i className="bi bi-envelope-check" /> Send Batch Reminders
					</button>
				</>
			}
		>
			<div className={cx(s.pills, "mb-3")}>
				<button className={cx(s.pill, s.pillActive)}>All (750K)</button>
				<button className={s.pill}>0-30 Days (420K)</button>
				<button className={s.pill}>31-60 Days (185K)</button>
				<button className={s.pill} style={{ color: "var(--pm-danger)" }}>
					61-90+ Days (145K)
				</button>
			</div>
			<div className="table-responsive mt-3">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Invoice</th>
							<th>Customer</th>
							<th>Amount</th>
							<th>Days Overdue</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td data-label="Invoice">INV-2025-081</td>
							<td data-label="Customer">Acme Corp</td>
							<td data-label="Amount">KES 85,000</td>
							<td data-label="Days Overdue">
								<span className={cx(s.badge, s.badgeD)}>72 days</span>
							</td>
							<td data-label="Actions">
								<button className={cx(s.btnPm, s.btnSm)}>Remind</button>
							</td>
						</tr>
						<tr>
							<td data-label="Invoice">INV-2025-084</td>
							<td data-label="Customer">Global Industries</td>
							<td data-label="Amount">KES 60,000</td>
							<td data-label="Days Overdue">
								<span className={cx(s.badge, s.badgeD)}>65 days</span>
							</td>
							<td data-label="Actions">
								<button className={cx(s.btnPm, s.btnSm)}>Remind</button>
							</td>
						</tr>
						<tr>
							<td data-label="Invoice">INV-2025-092</td>
							<td data-label="Customer">StartUp Inc</td>
							<td data-label="Amount">KES 185,000</td>
							<td data-label="Days Overdue">
								<span className={cx(s.badge, s.badgeW)}>45 days</span>
							</td>
							<td data-label="Actions">
								<button className={cx(s.btnPm, s.btnSm)}>Remind</button>
							</td>
						</tr>
						<tr>
							<td data-label="Invoice">INV-2025-104</td>
							<td data-label="Customer">Retail Chain A</td>
							<td data-label="Amount">KES 420,000</td>
							<td data-label="Days Overdue">
								<span className={cx(s.badge, s.badgeI)}>15 days</span>
							</td>
							<td data-label="Actions">
								<button className={cx(s.btnPm, s.btnSm)}>View</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M10: View User Modal
     ======================================================================== */
	const renderViewUser = () => (
		<MBox
			id="viewUserModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-person me-2" />
					Edit User: Peter K.
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() => doAction("viewUserModal", "User settings updated!")}
					>
						Save
					</button>
				</>
			}
		>
			{renderActionBody(
				"viewUserModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Role</label>
						<select className={s.formControl}>
							<option>Admin</option>
							<option selected>Finance Admin</option>
							<option>HR Manager</option>
							<option>Viewer</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Approval Limit (KES)</label>
						<input
							type="number"
							className={s.formControl}
							defaultValue="1000000"
						/>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label">MFA Enforced</label>
					</div>
					<div className="form-check">
						<input className="form-check-input" type="checkbox" />
						<label className="form-check-label text-danger">
							Suspend Account
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M11: Disburse Funds Modal
     ======================================================================== */
	const renderDisburseFunds = () => (
		<MBox
			id="disburseFundsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-send text-info me-2" />
					Disburse Funds
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction(
								"disburseFundsModal",
								"Disbursement initiated! Ref: DSP-44829",
								"DSP-44829",
							)
						}
					>
						Disburse
					</button>
				</>
			}
		>
			{renderActionBody(
				"disburseFundsModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Disbursement Type</label>
						<select className={s.formControl}>
							<option>Single Vendor Payment</option>
							<option>Bulk CSV Upload (M-Pesa B2C)</option>
							<option>Expense Reimbursement</option>
						</select>
					</div>
					<div className="p-3 border rounded text-center mb-3">
						<i
							className="bi bi-file-earmark-excel mb-2"
							style={{ fontSize: 24, color: "var(--pm-accent)" }}
						/>
						<br />
						<strong>Upload Beneficiary CSV</strong>
						<br />
						<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							Format: Name, Phone, Account, Amount
						</span>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M12: Revenue Details
     ======================================================================== */
	const renderRevenueDetails = () => (
		<MBox
			id="revenueDetailsModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-graph-up-arrow text-success me-2" />
					Revenue Breakdown
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<>
				<div className="table-responsive">
					<table className={s.tbl}>
						<thead>
							<tr>
								<th>Source</th>
								<th>Amount</th>
								<th>% of Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td data-label="Source">Invoices Paid</td>
								<td data-label="Amount">
									<strong>KES 1.20M</strong>
								</td>
								<td data-label="% of Total">66%</td>
							</tr>
							<tr>
								<td data-label="Source">M-Pesa</td>
								<td data-label="Amount">
									<strong>KES 420K</strong>
								</td>
								<td data-label="% of Total">23%</td>
							</tr>
							<tr>
								<td data-label="Source">Payment Links</td>
								<td data-label="Amount">
									<strong>KES 200K</strong>
								</td>
								<td data-label="% of Total">11%</td>
							</tr>
						</tbody>
						<tfoot>
							<tr style={{ fontWeight: 700 }}>
								<td data-label="Source">Total</td>
								<td data-label="Amount">
									<strong>KES 1.82M</strong>
								</td>
								<td data-label="% of Total">100%</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</>
		</MBox>
	);

	/* ==========================================================================
     M13: Expense Details
     ======================================================================== */
	const renderExpenseDetails = () => (
		<MBox
			id="expenseDetailsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-graph-down-arrow text-danger me-2" />
					Expense Breakdown
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<>
				<div className="table-responsive">
					<table className={s.tbl}>
						<thead>
							<tr>
								<th>Category</th>
								<th>Amount</th>
								<th>% of Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td data-label="Category">Payroll</td>
								<td data-label="Amount">
									<strong>KES 450K</strong>
								</td>
								<td data-label="% of Total">48%</td>
							</tr>
							<tr>
								<td data-label="Category">Supplier Payments</td>
								<td data-label="Amount">
									<strong>KES 320K</strong>
								</td>
								<td data-label="% of Total">34%</td>
							</tr>
							<tr>
								<td data-label="Category">KRA / Statutory</td>
								<td data-label="Amount">
									<strong>KES 120K</strong>
								</td>
								<td data-label="% of Total">13%</td>
							</tr>
							<tr>
								<td data-label="Category">Utilities & Operating</td>
								<td data-label="Amount">
									<strong>KES 50K</strong>
								</td>
								<td data-label="% of Total">5%</td>
							</tr>
						</tbody>
						<tfoot>
							<tr style={{ fontWeight: 700 }}>
								<td data-label="Category">Total</td>
								<td data-label="Amount">
									<strong>KES 940K</strong>
								</td>
								<td data-label="% of Total">100%</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</>
		</MBox>
	);

	/* ==========================================================================
     M14: Pending Approvals
     ======================================================================== */
	const renderPendingApprovals = () => (
		<MBox
			id="pendingApprovalsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-exclamation-circle text-warning me-2" />
					Pending Approvals
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<>
				<div className="table-responsive">
					<table className={s.tbl}>
						<thead>
							<tr>
								<th>Request</th>
								<th>Maker</th>
								<th>Amount</th>
								<th>Timestamp</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td data-label="Request">Payroll Run: Oct 2025</td>
								<td data-label="Maker">Grace M.</td>
								<td data-label="Amount">
									<strong>KES 4,200,000</strong>
								</td>
								<td data-label="Timestamp">26 Jun 14:20</td>
								<td data-label="Action">
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => onOpen("runPayrollModal")}
									>
										Review
									</button>
								</td>
							</tr>
							<tr>
								<td data-label="Request">Supplier: OfficeMart Stationers</td>
								<td data-label="Maker">James K.</td>
								<td data-label="Amount">
									<strong>KES 120,000</strong>
								</td>
								<td data-label="Timestamp">26 Jun 13:45</td>
								<td data-label="Action">
									<button className={cx(s.btnPm, s.btnSm)}>Approve</button>
								</td>
							</tr>
							<tr>
								<td data-label="Request">Supplier: AWS Hosting</td>
								<td data-label="Maker">Amina D.</td>
								<td data-label="Amount">
									<strong>KES 85,000</strong>
								</td>
								<td data-label="Timestamp">26 Jun 12:30</td>
								<td data-label="Action">
									<button className={cx(s.btnPm, s.btnSm)}>Approve</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</>
		</MBox>
	);

	/* ==========================================================================
     M15: Consolidated Report
     ======================================================================== */
	const renderConsolidatedReport = () => (
		<MBox
			id="consolidatedReportModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-bar-graph me-2" />
					Consolidated Group Report
				</>
			}
			footer={
				<>
					<button className={cx(s.btnPm, s.btnSm)}>
						<i className="bi bi-download" /> Export PDF
					</button>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
				</>
			}
		>
			<>
				<div className="mb-3">
					<label className={s.formLabel}>Report Type</label>
					<select className={s.formControl}>
						<option>Daily SLA Performance</option>
						<option>Weekly Trend Analysis</option>
						<option>Monthly Summary</option>
						<option>Group Consolidated</option>
						<option>Chargeback Win Rate Report</option>
					</select>
				</div>
				<div className="row g-3 mb-3">
					<div className="col-6">
						<label className={s.formLabel}>From</label>
						<input
							type="date"
							className={s.formControl}
							defaultValue="2025-06-01"
						/>
					</div>
					<div className="col-6">
						<label className={s.formLabel}>To</label>
						<input
							type="date"
							className={s.formControl}
							defaultValue="2025-06-27"
						/>
					</div>
				</div>
				<div className="mb-3">
					<label className={s.formLabel}>Format</label>
					<select className={s.formControl}>
						<option>PDF</option>
						<option>Excel</option>
					</select>
				</div>
			</>
		</MBox>
	);

	/* ==========================================================================
     M16: Health Check
     ======================================================================== */
	const renderHealthCheck = () => (
		<MBox
			id="healthCheckModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-activity text-success me-2" />
					Business Health Check
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<>
				<div className="text-center mb-4">
					<div
						style={{
							fontSize: 48,
							fontWeight: 800,
							color: "var(--pm-accent)",
							fontFamily: "var(--pm-font-display)",
						}}
					>
						92
					</div>
					<div
						style={{ fontSize: 12, color: "var(--pm-muted)", fontWeight: 600 }}
					>
						HEALTH SCORE
					</div>
				</div>
				<div className={s.statusRow}>
					<div>
						<strong>Liquidity Ratio</strong>
					</div>
					<span className={cx(s.badge, s.badgeS)}>Excellent</span>
				</div>
				<div className={s.statusRow}>
					<div>
						<strong>Collections Rate</strong>
					</div>
					<span className={cx(s.badge, s.badgeD)}>Needs Focus</span>
				</div>
				<div className={s.statusRow}>
					<div>
						<strong>Compliance</strong>
					</div>
					<span className={cx(s.badge, s.badgeW)}>Action Reqd</span>
				</div>
			</>
		</MBox>
	);

	/* ==========================================================================
     M17: Notifications
     ======================================================================== */
	const renderNotifications = () => (
		<MBox
			id="notificationsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bell me-2" />
					Business Alerts
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div
				className="p-3 rounded mb-2"
				style={{ background: "var(--pm-danger-soft)" }}
			>
				<strong>Payroll requires approval</strong>
				<div style={{ fontSize: 11 }}>October payroll — KES 450,500</div>
			</div>
			<div
				className="p-3 rounded mb-2"
				style={{ background: "var(--pm-warning-soft)" }}
			>
				<strong>KYB Update overdue</strong>
				<div style={{ fontSize: 11 }}>CR12 missing — 5 days remaining</div>
			</div>
			<div
				className="p-3 rounded mb-2"
				style={{ background: "var(--pm-info-soft)" }}
			>
				<strong>3 invoices aging {">"}60 days</strong>
				<div style={{ fontSize: 11 }}>KES 145,000 outstanding</div>
			</div>
			<div
				className="p-3 rounded"
				style={{ background: "var(--pm-accent-soft)" }}
			>
				<strong>Revenue milestone reached!</strong>
				<div style={{ fontSize: 11 }}>KES 1.82M this month — 12% growth</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M18: Role Permissions Matrix
     ======================================================================== */
	const renderRolePermissions = () => (
		<MBox
			id="rolePermissionsModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-lock me-2" />
					Roles & Permissions Matrix
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() => doAction("savePermissions", "Permissions saved successfully")}
					>
						<i className="bi bi-check-lg" /> Save Changes
					</button>
				</>
			}
		>
			<div className="row g-4">
				<div className="col-lg-8">
					<div className={s.card} style={{ padding: "16px", marginBottom: "16px" }}>
						<h5 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>
							<i className="bi bi-grid-3x3-gap me-2" /> Permission Matrix
						</h5>
						<div className="table-responsive">
							<table className={s.tbl}>
								<thead>
									<tr>
										<th>Permission</th>
										<th>Admin</th>
										<th>Finance</th>
										<th>HR</th>
										<th>Viewer</th>
										<th>Custom</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Create Invoice</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Generate and send invoices</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeI)}>Partial</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Approve Payments</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Authorize transactions</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Unlimited</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeW)}>⚠️ ≤1M</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeI)}>Payroll</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeW)}>≤500K</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Run Payroll</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Execute payroll runs</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>View Reports</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Access financial reports</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeI)}>Limited</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeI)}>Limited</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Manage Users</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Add/edit team members</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Configure Roles</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Edit role permissions</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Bank Integration</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Connect bank accounts</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeD)}>❌ None</span></td>
									</tr>
									<tr>
										<td data-label="Permission">
											<div>
												<strong>Export Data</strong>
												<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Download statements</div>
											</div>
										</td>
										<td data-label="Admin"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="Finance"><span className={cx(s.badge, s.badgeS)}>✅ Full</span></td>
										<td data-label="HR"><span className={cx(s.badge, s.badgeI)}>Limited</span></td>
										<td data-label="Viewer"><span className={cx(s.badge, s.badgeI)}>Limited</span></td>
										<td data-label="Custom"><span className={cx(s.badge, s.badgeI)}>Limited</span></td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					<div className={s.card} style={{ padding: "16px", marginBottom: "16px" }}>
						<h5 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>
							<i className="bi bi-sliders me-2" /> Approval Limits
						</h5>
						<div style={{ fontSize: 12, marginBottom: "12px", color: "var(--pm-muted)" }}>
							Set transaction approval thresholds per role
						</div>
						{[
							{ role: "Admin", limit: "Unlimited", color: "var(--pm-accent)" },
							{ role: "Finance", limit: "KES 1,000,000", color: "var(--pm-primary)" },
							{ role: "HR", limit: "KES 500,000", color: "var(--pm-warning)" },
							{ role: "Viewer", limit: "KES 0", color: "var(--pm-danger)" },
							{ role: "Custom", limit: "KES 500,000", color: "var(--pm-purple)" },
						].map((item) => (
							<div
								key={item.role}
								className="d-flex justify-content-between align-items-center p-2 mb-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span style={{ fontWeight: 600, fontSize: 12 }}>{item.role}</span>
								<span
									className={cx(s.badge)}
									style={{ background: `${item.color}20`, color: item.color }}
								>
									{item.limit}
								</span>
							</div>
						))}
						<button
							className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
							onClick={() => onOpen("inviteUserModal")}
						>
							<i className="bi bi-plus-lg" /> Add Custom Role
						</button>
					</div>

					<div className={s.card} style={{ padding: "16px" }}>
						<h5 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>
							<i className="bi bi-shield-check me-2" /> Security Settings
						</h5>
						<div className={s.statusRow}>
							<div>
								<div style={{ fontWeight: 600, fontSize: 12 }}>MFA Required</div>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>For all roles</div>
							</div>
							<span className={cx(s.badge, s.badgeS)}>Enabled</span>
						</div>
						<div className={s.statusRow}>
							<div>
								<div style={{ fontWeight: 600, fontSize: 12 }}>Session Timeout</div>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Auto-logout after</div>
							</div>
							<span className={cx(s.badge, s.badgeI)}>30 min</span>
						</div>
						<div className={s.statusRow}>
							<div>
								<div style={{ fontWeight: 600, fontSize: 12 }}>IP Whitelist</div>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Restrict access</div>
							</div>
							<span className={cx(s.badge, s.badgeW)}>Optional</span>
						</div>
						<div className={s.statusRow}>
							<div>
								<div style={{ fontWeight: 600, fontSize: 12 }}>Audit Log</div>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Track all actions</div>
							</div>
							<span className={cx(s.badge, s.badgeS)}>Active</span>
						</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M19: Collection Target
     ======================================================================== */
	const renderCollectionTarget = () => (
		<MBox
			id="collectionTargetModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bullseye text-primary me-2" />
					Set Collection Targets
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction("collectionTargetModal", "Targets updated for November!")
						}
					>
						Save Targets
					</button>
				</>
			}
		>
			{renderActionBody(
				"collectionTargetModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Target Month</label>
						<select className={s.formControl}>
							<option>November 2025</option>
							<option>December 2025</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Gross Revenue Target (KES)</label>
						<input
							type="number"
							className={s.formControl}
							defaultValue="2500000"
						/>
					</div>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
					>
						Setting targets updates the dashboard charts for the entire team to
						track progress.
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M20: Business Profile Modal
     ======================================================================== */
	const renderBusinessProfile = () => (
		<MBox
			id="businessProfileModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-person-badge text-primary me-2" />
					My Profile
				</>
			}
			footer={
				<button className={cx(s.btnPm, s.btnPmD, "w-100")} onClick={onClose}>
					Log Out
				</button>
			}
		>
			<div className="text-center">
				<div
					className={cx(s.avatar, "mx-auto mb-3")}
					style={{
						width: 64,
						height: 64,
						fontSize: 24,
						background: "var(--pm-primary)",
					}}
				>
					AD
				</div>
				<h4 style={{ fontWeight: 700, marginBottom: 4 }}>Amina D.</h4>
				<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
					Director (Admin) · TechSolutions Ltd
				</p>
				<div className="p-3 border rounded text-start mt-3">
					<div
						className="d-flex justify-content-between mb-2"
						style={{ fontSize: 13 }}
					>
						<span className="text-muted">Approval Limit</span>
						<strong>Unlimited</strong>
					</div>
					<div
						className="d-flex justify-content-between mb-2"
						style={{ fontSize: 13 }}
					>
						<span className="text-muted">Security</span>
						<span className={cx(s.badge, s.badgeS)}>MFA Active</span>
					</div>
					<div
						className="d-flex justify-content-between"
						style={{ fontSize: 13 }}
					>
						<span className="text-muted">Connected Entities</span>
						<strong>3 Businesses</strong>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M21: Transaction Details
     ======================================================================== */
	const renderTransactionDetails = () => (
		<MBox
			id="transactionDetailsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-receipt-cutoff me-2" />
					Transaction Details
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="text-center mb-3">
				<div
					className={cx(s.iconCircle, "mx-auto mb-2 round")}
					style={{
						width: 56,
						height: 56,
						fontSize: 24,
						background: "var(--pm-accent-soft)",
						color: "var(--pm-accent)",
					}}
				>
					<i className="bi bi-arrow-down-left" />
				</div>
				<div
					style={{
						fontSize: 26,
						fontWeight: 700,
						fontFamily: "var(--pm-font-display)",
					}}
				>
					+ KES 85,000
				</div>
				<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
					Invoice Payment from Acme Corp
				</div>
			</div>
			<div className={s.statusRow}>
				<span className="text-muted">Business</span>
				<strong>TechSolutions Ltd</strong>
			</div>
			<div className={s.statusRow}>
				<span className="text-muted">Category</span>
				<strong>Invoice Payment</strong>
			</div>
			<div className={s.statusRow}>
				<span className="text-muted">Status</span>
				<span className={cx(s.badge, s.badgeS)}>Completed</span>
			</div>
			<div className={s.statusRow}>
				<span className="text-muted">Date</span>
				<strong>Oct 28, 2025</strong>
			</div>
			<div className={s.statusRow}>
				<span className="text-muted">Reference</span>
				<strong style={{ fontFamily: "monospace" }}>TX-2900000</strong>
			</div>
			<div className={s.statusRow}>
				<span className="text-muted">Payment Method</span>
				<strong>Bank Transfer</strong>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M22: Connect Tool
     ======================================================================== */
	const renderConnectTool = () => (
		<MBox
			id="connectToolModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-plugin me-2" />
					Connect External Tool
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction(
								"connectToolModal",
								"Tool connection initiated. Check your email for authorization link.",
								"AUTH-88291",
							)
						}
					>
						Connect
					</button>
				</>
			}
		>
			{renderActionBody(
				"connectToolModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Select Tool</label>
						<select className={s.formControl}>
							<option>QuickBooks Accounting</option>
							<option>Xero</option>
							<option>Salesforce CRM</option>
							<option>HubSpot</option>
							<option>Shopify</option>
						</select>
					</div>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
					>
						<i className="bi bi-info-circle" /> You will be redirected to the tool's
						authorization page to grant PayMo access to your data.
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 12 }}>
							Allow automatic data sync (recommended)
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M23: Statement Modal
     ======================================================================== */
	const renderStatement = () => (
		<MBox
			id="statementModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-text me-2" />
					Download Statement
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmDark)}
						onClick={() =>
							doAction(
								"statementModal",
								"Statement generated & sent to your email.",
								"STMT-0091",
							)
						}
					>
						<i className="bi bi-envelope-arrow-down" /> Email Statement
					</button>
				</>
			}
		>
			<div className="mb-3">
				<label className={s.formLabel}>Account / Wallet</label>
				<select className={s.formControl}>
					<option>PayMo Business Wallet</option>
					<option>Equity Bank (Linked)</option>
				</select>
			</div>
			<div className="row g-2 mb-3">
				<div className="col-6">
					<label className={s.formLabel}>From</label>
					<input type="date" className={s.formControl} />
				</div>
				<div className="col-6">
					<label className={s.formLabel}>To</label>
					<input type="date" className={s.formControl} />
				</div>
			</div>
			<div className="mb-3">
				<label className={s.formLabel}>Format</label>
				<div className="d-flex gap-2">
					<button className={s.btnPm} style={{ flex: 1 }}>
						<i className="bi bi-filetype-pdf text-danger" /> PDF
					</button>
					<button className={cx(s.btnPm, s.btnPmP)} style={{ flex: 1 }}>
						<i className="bi bi-filetype-xlsx text-success" /> Excel
					</button>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M24: Schedule Payment Modal
     ======================================================================== */
	const renderSchedulePayment = () => (
		<MBox
			id="schedulePaymentModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-calendar-event me-2" />
					Schedule a Payment
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction(
								"schedulePaymentModal",
								"Payment scheduled successfully!",
								"SCH-203",
							)
						}
					>
						<i className="bi bi-check-lg" /> Schedule
					</button>
				</>
			}
		>
			<div className="mb-3">
				<label className={s.formLabel}>Pay To</label>
				<input
					className={s.formControl}
					defaultValue="OfficeMart Supplies Ltd"
				/>
			</div>
			<div className="mb-3">
				<label className={s.formLabel}>Amount (KES)</label>
				<input type="number" className={s.formControl} defaultValue="120000" />
			</div>
			<div className="row g-2 mb-3">
				<div className="col-6">
					<label className={s.formLabel}>Schedule Date</label>
					<input type="date" className={s.formControl} />
				</div>
				<div className="col-6">
					<label className={s.formLabel}>Recurrence</label>
					<select className={s.formControl}>
						<option>One-time</option>
						<option>Monthly</option>
						<option>Weekly</option>
					</select>
				</div>
			</div>
			<div
				className="p-3 rounded"
				style={{ background: "var(--pm-accent-soft)", fontSize: 12 }}
			>
				<i className="bi bi-info-circle" /> Scheduled payments appear in your
				Upcoming Obligations for easy cash planning.
			</div>
		</MBox>
	);

	/* ==========================================================================
     M25: Cash Forecast Modal
     ======================================================================== */
	const renderCashForecast = () => (
		<MBox
			id="cashForecastModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-graph-down me-2" />
					Cash Flow Forecast <span className={cx(s.badge, s.badgeI)}>AI</span>
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button className={s.btnPm} onClick={() => {}}>
						<i className="bi bi-download" /> Export
					</button>
				</>
			}
		>
			<div
				className="p-3 rounded mb-3"
				style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
			>
				<i className="bi bi-stars" /> Based on your 6-month history and scheduled
				obligations, PayMo projects a comfortable end-of-month balance with no
				liquidity risk.
			</div>
			<div className="row g-2 text-center mb-3">
				<div className="col-3">
					<div
						className="p-2 rounded"
						style={{ background: "var(--pm-accent-soft)" }}
					>
						<div style={{ fontSize: 11, color: "#047857" }}>Week 1</div>
						<div style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
							+KES 280K
						</div>
					</div>
				</div>
				<div className="col-3">
					<div
						className="p-2 rounded"
						style={{ background: "var(--pm-danger-soft)" }}
					>
						<div style={{ fontSize: 11, color: "#991B1B" }}>Week 2</div>
						<div style={{ fontWeight: 700, color: "var(--pm-danger)" }}>
							-KES 310K
						</div>
					</div>
				</div>
				<div className="col-3">
					<div
						className="p-2 rounded"
						style={{ background: "var(--pm-accent-soft)" }}
					>
						<div style={{ fontSize: 11, color: "#047857" }}>Week 3</div>
						<div style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
							+KES 340K
						</div>
					</div>
				</div>
				<div className="col-3">
					<div
						className="p-2 rounded"
						style={{ background: "var(--pm-danger-soft)" }}
					>
						<div style={{ fontSize: 11, color: "#991B1B" }}>Week 4</div>
						<div style={{ fontWeight: 700, color: "var(--pm-danger)" }}>
							-KES 450K
						</div>
					</div>
				</div>
			</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Week</th>
							<th>Inflows</th>
							<th>Outflows</th>
							<th>End Balance</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Week 1</td>
							<td>KES 820K</td>
							<td>KES 540K</td>
							<td>KES 2.73M</td>
						</tr>
						<tr>
							<td>Week 2</td>
							<td>KES 510K</td>
							<td>KES 820K</td>
							<td>KES 2.42M</td>
						</tr>
						<tr>
							<td>Week 3</td>
							<td>KES 760K</td>
							<td>KES 420K</td>
							<td>KES 2.76M</td>
						</tr>
						<tr>
							<td>Week 4</td>
							<td>KES 410K</td>
							<td>KES 860K</td>
							<td>KES 2.31M</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M26: Statutory Modal
     ======================================================================== */
	const renderStatutory = () => (
		<MBox
			id="statutoryModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bank2 text-danger me-2" />
					Statutory & Tax Obligations
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button className={s.btnPm} onClick={() => {}}>
						<i className="bi bi-bell" /> Set Reminders
					</button>
				</>
			}
		>
			<div
				className="p-3 rounded mb-3"
				style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}
			>
				<i className="bi bi-exclamation-triangle" /> 2 obligations due within 7
				days.
			</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Obligation</th>
							<th>Amount</th>
							<th>Due</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>PAYE (Income Tax)</td>
							<td>KES 98,000</td>
							<td>Nov 5, 2025</td>
							<td>
								<span className={cx(s.badge, s.badgeW)}>Due Soon</span>
							</td>
						</tr>
						<tr>
							<td>NSSF Contribution</td>
							<td>KES 2,160</td>
							<td>Nov 9, 2025</td>
							<td>
								<span className={cx(s.badge, s.badgeW)}>Due Soon</span>
							</td>
						</tr>
						<tr>
							<td>SHIF Contribution</td>
							<td>KES 5,400</td>
							<td>Nov 9, 2025</td>
							<td>
								<span className={cx(s.badge, s.badgeW)}>Due Soon</span>
							</td>
						</tr>
						<tr>
							<td>VAT Return</td>
							<td>KES 64,000</td>
							<td>Nov 20, 2025</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>On Track</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M27: Support Modal
     ======================================================================== */
	const renderSupport = () => (
		<MBox
			id="supportModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-headset me-2" />
					Help & Support
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div
				className="p-3 border rounded mb-3 d-flex align-items-center gap-3"
				style={{ cursor: "pointer" }}
			>
				<div
					className={cx(s.iconCircle, "round")}
					style={{ background: "var(--pm-primary)", color: "#fff" }}
				>
					<i className="bi bi-chat-dots" />
				</div>
				<div>
					<strong>Live Chat</strong>
					<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
						Business support · avg reply 2 min
					</div>
				</div>
			</div>
			<div
				className="p-3 border rounded mb-3 d-flex align-items-center gap-3"
				style={{ cursor: "pointer" }}
			>
				<div
					className={cx(s.iconCircle, "round")}
					style={{ background: "var(--pm-accent)", color: "#fff" }}
				>
					<i className="bi bi-telephone" />
				</div>
				<div>
					<strong>Call Us</strong>
					<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
						+254 700 000 000 · Mon-Sat 8am-8pm
					</div>
				</div>
			</div>
			<div
				className="p-3 border rounded d-flex align-items-center gap-3"
				style={{ cursor: "pointer" }}
			>
				<div
					className={cx(s.iconCircle, "round")}
					style={{ background: "var(--pm-info)", color: "#fff" }}
				>
					<i className="bi bi-journal-text" />
				</div>
				<div>
					<strong>Help Center</strong>
					<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
						Guides, FAQs & API docs
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M28: Investment Modal
     ======================================================================== */
	const renderInvestment = () => (
		<MBox
			id="investmentModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-graph-up-arrow text-success me-2" />
					Put idle cash to work
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmSuccess)}
						onClick={() =>
							doAction(
								"investmentModal",
								"KES 500,000 swept to Money Market Fund!",
								"INV-77001",
							)
						}
					>
						<i className="bi bi-graph-up-arrow" /> Invest 500K
					</button>
				</>
			}
		>
			<div
				className="p-3 rounded mb-2 d-flex justify-content-between align-items-center"
				style={{ background: "var(--pm-accent-soft)" }}
			>
				<div>
					<strong>PayMo Money Market Fund</strong>
					<div style={{ fontSize: 11, color: "#065F46" }}>
						Liquid · redeem anytime
					</div>
				</div>
				<div className="text-end">
					<div style={{ fontWeight: 700, color: "var(--pm-accent)" }}>~11% p.a.</div>
					<div style={{ fontSize: 11, color: "#047857" }}>
						KES 5,500/mo est.
					</div>
				</div>
			</div>
			<div
				className="p-3 rounded mb-2 d-flex justify-content-between align-items-center"
				style={{ background: "var(--pm-info-soft)" }}
			>
				<div>
					<strong>90-Day Fixed Deposit</strong>
					<div style={{ fontSize: 11, color: "#1D4ED8" }}>
						Locked for higher yield
					</div>
				</div>
				<div className="text-end">
					<div style={{ fontWeight: 700, color: "var(--pm-info)" }}>~13% p.a.</div>
					<div style={{ fontSize: 11, color: "#1D4ED8" }}>
						KES 6,500/mo est.
					</div>
				</div>
			</div>
			<div
				className="p-3 rounded d-flex justify-content-between align-items-center"
				style={{ background: "var(--pm-warning-soft)" }}
			>
				<div>
					<strong>Treasury Bills (T-Bills)</strong>
					<div style={{ fontSize: 11, color: "#92400E" }}>
						91-day government paper
					</div>
				</div>
				<div className="text-end">
					<div style={{ fontWeight: 700, color: "var(--pm-warning)" }}>
						~12% p.a.
					</div>
					<div style={{ fontSize: 11, color: "#92400E" }}>
						KES 6,000/mo est.
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M29: Clients Modal
     ======================================================================== */
	const renderClients = () => (
		<MBox
			id="clientsModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-people text-primary me-2" />
					Clients
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button className={s.btnPm} onClick={() => {}}>
						<i className="bi bi-download" /> Export Clients
					</button>
				</>
			}
		>
			<div className="mb-3">
				<div style={{ position: "relative" }}>
					<i
						className="bi bi-search"
						style={{
							position: "absolute",
							left: 14,
							top: "50%",
							transform: "translateY(-50%)",
							color: "var(--pm-muted)",
						}}
					/>
					<input
						className={s.formControl}
						style={{ paddingLeft: 40 }}
						placeholder="Search clients..."
					/>
				</div>
			</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Client</th>
							<th>Country</th>
							<th>Outstanding</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Acme Corp</td>
							<td>KE</td>
							<td>KES 420,000</td>
							<td>
								<span className={cx(s.badge, s.badgeD)}>Risky</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>View</button>
							</td>
						</tr>
						<tr>
							<td>Global Industries</td>
							<td>UG</td>
							<td>KES 185,000</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>View</button>
							</td>
						</tr>
						<tr>
							<td>StartUp Inc</td>
							<td>KE</td>
							<td>KES 145,000</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>View</button>
							</td>
						</tr>
						<tr>
							<td>Retail Chain A</td>
							<td>TZ</td>
							<td>KES 60,000</td>
							<td>
								<span className={cx(s.badge, s.badgeI)}>New</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>View</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M30: Currency Modal
     ======================================================================== */
	const renderCurrency = () => (
		<MBox
			id="currencyModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-cash-coin me-2" />
					Open a Currency Account
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button className={s.btnPm} onClick={() => {}}>
						<i className="bi bi-arrow-repeat" /> Refresh Rates
					</button>
				</>
			}
		>
			<div
				className="p-3 rounded mb-3"
				style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
			>
				<i className="bi bi-info-circle" /> You hold multi-currency balances for
				receiving and paying globally. FX auto-converted at live rates.
			</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Currency</th>
							<th>Balance</th>
							<th>Rate (KES)</th>
							<th>Virtual Acct</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>KES</td>
							<td>KES 2,450,000</td>
							<td>1.00</td>
							<td>VA-88421</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
						</tr>
						<tr>
							<td>USD</td>
							<td>USD 12,400</td>
							<td>129.50</td>
							<td>VA-77012</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
						</tr>
						<tr>
							<td>UGX</td>
							<td>UGX 28,000,000</td>
							<td>0.035</td>
							<td>VA-55108</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
						</tr>
						<tr>
							<td>EUR</td>
							<td>EUR 9,200</td>
							<td>142.30</td>
							<td>VA-44010</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M31: Virtual Account Modal
     ======================================================================== */
	const renderVirtualAccount = () => (
		<MBox
			id="virtualAccountModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-credit-card-2-front me-2" />
					Create Virtual Account
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button className={s.btnPm} onClick={() => {}}>
						<i className="bi bi-share" /> Share Payment Links
					</button>
				</>
			}
		>
			<div
				className="p-3 rounded mb-3"
				style={{ background: "var(--pm-accent-soft)", fontSize: 12 }}
			>
				<i className="bi bi-check-circle" /> These virtual accounts collect
				payments automatically and settle into your wallet.
			</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Account</th>
							<th>Channel</th>
							<th>Collected (this month)</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>VA-88421</td>
							<td>KES · M-Pesa Till</td>
							<td>KES 450,000</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>Share</button>
							</td>
						</tr>
						<tr>
							<td>VA-77012</td>
							<td>USD · Card Gateway</td>
							<td>USD 8,200</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>Share</button>
							</td>
						</tr>
						<tr>
							<td>VA-55108</td>
							<td>UGX · Paybill</td>
							<td>UGX 12,000,000</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>Share</button>
							</td>
						</tr>
						<tr>
							<td>VA-66203</td>
							<td>KES · Paybill</td>
							<td>KES 180,000</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Active</span>
							</td>
							<td>
								<button className={cx(s.btnPm, s.btnSm)}>Share</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M32: Connect Bank
     ======================================================================== */
	const renderConnectBank = () => (
		<MBox
			id="connectBankModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bank2 me-2" />
					Connect Bank Account
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div
				className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center"
				style={{
					borderColor: "var(--pm-primary)",
					background: "rgba(79,70,229,.04)",
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<div
						className={s.iconCircle}
						style={{
							background: "var(--pm-info-soft)",
							color: "var(--pm-info)",
						}}
					>
						<i className="bi bi-building" />
					</div>
					<div>
						<strong>Equity Bank</strong>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							****4521 · Connected
						</div>
					</div>
				</div>
				<i className="bi bi-check-circle-fill text-primary" />
			</div>
			<button
				className={cx(s.btnPm, s.btnSm, "w-100 mt-2")}
				onClick={() =>
					doAction("connectBankModal", "New bank account connection initiated.")
				}
			>
				<i className="bi bi-plus-lg" /> Add New Bank
			</button>
		</MBox>
	);

	/* ==========================================================================
     Render all modals
     ======================================================================== */
	return (
		<>
			{renderNewInvoice()}
			{renderRunPayroll()}
			{renderInterCompanyTransfer()}
			{renderInviteUser()}
			{renderKybUpload()}
			{renderBusinessSettings()}
			{renderSwitchBusiness()}
			{renderCashFlow()}
			{renderAgingInvoices()}
			{renderViewUser()}
			{renderDisburseFunds()}
			{renderRevenueDetails()}
			{renderExpenseDetails()}
			{renderPendingApprovals()}
			{renderConsolidatedReport()}
			{renderHealthCheck()}
			{renderNotifications()}
			{renderRolePermissions()}
			{renderCollectionTarget()}
			{renderBusinessProfile()}
			{renderTransactionDetails()}
			{renderConnectTool()}
			{renderStatement()}
			{renderSchedulePayment()}
			{renderCashForecast()}
			{renderStatutory()}
			{renderSupport()}
			{renderInvestment()}
			{renderClients()}
			{renderCurrency()}
			{renderVirtualAccount()}
			{renderConnectBank()}
		</>
	);
}
