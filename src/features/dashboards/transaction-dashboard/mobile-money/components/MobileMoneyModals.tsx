import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/mobileMoney.module.css";

/* ============================================================================
   Mobile Money & PSP Integration Hub — modal layer (legacy page 1.11, 25 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows legacy showLoading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with labeled stepper + receipt step;
                          confirm-step button labels match legacy exactly
                          (Send Money 🔒 / Execute ✔ / Submit Dispute 📤)
     nf(el) PIN advance → pinRefs focus chain
     sw(prefix,key,btn) → `tabs` state map for pill/panel switching
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

/* ---------- LEGACY BRIDGE: file download helper (receipt "Save" button) ---------- */
function downloadFile(name: string, content: string, type = "text/plain") {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content], { type }));
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}

/* ---------- modal shell (Bootstrap look, React state driven) ---------- */
function MBox({
	id,
	active,
	title,
	size = "md",
	onClose,
	children,
	footer,
}: MBoxProps) {
	if (active !== id) return null;
	return (
		<>
			<div className={styles.backdrop} onClick={onClose} />
			<div
				className={styles.modalWrap}
				role="dialog"
				aria-modal="true"
				aria-label={id}
			>
				<div
					className={`${styles.modalBox} ${size === "lg" ? styles.modalBoxLg : ""} ${
						size === "xl" ? styles.modalBoxXl : ""
					}`}
				>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>{title}</h5>
						<button
							type="button"
							className="btn-close"
							aria-label="Close"
							onClick={onClose}
						/>
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

/* ---------- Mini Confirmation Modal Component ---------- */
interface MiniConfirmProps {
	show: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

function MiniConfirm({ show, title, message, onConfirm, onCancel }: MiniConfirmProps) {
	if (!show) return null;
	return (
		<>
			<div className={styles.miniBackdrop} onClick={onCancel} />
			<div className={styles.miniModalWrap}>
				<div className={styles.miniModalBox}>
					<div className={styles.miniModalHeader}>
						<h6 style={{ margin: 0, fontWeight: 700 }}>{title}</h6>
					</div>
					<div className={styles.miniModalBody}>
						<p style={{ margin: 0, fontSize: 13 }}>{message}</p>
					</div>
					<div className={styles.miniModalFooter}>
						<button className={styles.btnPm} onClick={onCancel}>
							Cancel
						</button>
						<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onConfirm}>
							Confirm
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

/* ---------- static option lists ---------- */
const SEND_FROM = [
	"M-Pesa Business (KES 8.42M)",
	"Airtel Disbursement (KES 2.18M)",
];
const SEND_TO = ["0712 345 890 — James Kamau", "0733 112 445 — Finance Dept"];
const CHARGE_BEARERS = ["Sender pays fee", "Recipient pays fee", "Shared"];
const PROVIDERS = ["M-Pesa", "Airtel Money", "T-Kash", "Pesalink"];
const ACCOUNT_TYPES = [
	"Business Paybill",
	"Personal Till",
	"Disbursement Account",
];
const RECON_WALLETS = [
	"M-Pesa Business",
	"Airtel Disbursement",
	"T-Kash Collections",
];
const KYC_ACCOUNTS = ["45 Partial KYC accounts", "12 Expired KYC accounts"];
const KYC_METHODS = [
	"Send eKYC link via SMS",
	"Send eKYC link via WhatsApp",
	"Require branch visit",
];
const DISPUTE_REASONS = [
	"Amount not received by recipient",
	"Duplicate transfer",
	"Wrong recipient",
	"Fraudulent transaction",
];
const SCHEDULE_FREQS = ["One-time", "Weekly", "Monthly"];
const PAUSE_REASONS = [
	"Security review",
	"Suspicious activity",
	"Compliance hold",
	"Maintenance",
];
const STATEMENT_WALLETS = [
	"All Wallets",
	"M-Pesa Business",
	"Airtel Disbursement",
];
const STATEMENT_FORMATS = ["PDF", "Excel", "CSV"];
const PSP_TYPES = ["B2C Aggregator", "C2B Aggregator", "Bank Switch"];
const PSP_CYCLES = ["T+0", "T+1", "T+2"];
const SUPPORT_SUBJECTS = [
	"API Integration Issue",
	"Settlement Delay",
	"Transaction Failure",
	"Compliance Query",
];

type FlowKey = "send" | "bulk" | "disp";
interface Result {
	msg: string;
	ref?: string;
}

export default function MobileMoneyModals({
	active,
	onClose,
	onOpen,
}: ModalsProps) {
	/* ---------- doAction / nextFlow / busy state ---------- */
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<FlowKey, number>>({
		send: 1,
		bulk: 1,
		disp: 1,
	});
	/* ---------- LEGACY BRIDGE: sw(prefix,key,btn) tab pill state ---------- */
	const [tabs, setTabs] = useState<Record<string, string>>({
		wd: "overview",
		psp: "creds",
		bulkRecipients: "paymo",
	});
	const sw = (prefix: string, key: string) =>
		setTabs((prev) => ({ ...prev, [prefix]: key }));
	
	/* ---------- Mini confirmation modal state ---------- */
	const [miniConfirm, setMiniConfirm] = useState<{
		show: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({ show: false, title: "", message: "", onConfirm: () => {} });

	/* ---------- Manual recipients state ---------- */
	const [manualRecipients, setManualRecipients] = useState<Array<{ name: string; phone: string; amount: string }>>([]);
	/* ---------- LEGACY BRIDGE: nf(el) PIN auto-advance ---------- */
	const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
	const nf = (i: number) => {
		const el = pinRefs.current[i];
		if (el && el.value.length === 1) pinRefs.current[i + 1]?.focus();
	};

	/* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ send: 1, bulk: 1, disp: 1 });
			setBusy(null);
			setTabs({ wd: "overview", psp: "creds" });
		}
	}, [active]);

	const busyTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(busyTimer.current), []);

	/* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) ---------- */
	const doAction = (modalId: string, msg: string, ref?: string) => {
		setBusy(modalId);
		busyTimer.current = window.setTimeout(() => {
			setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }));
			setBusy(null);
		}, 1500);
	};

	/* ---------- LEGACY BRIDGE: nextFlow(key, total) with legacy modalMap ---------- */
	const flowTotals: Record<FlowKey, number> = { send: 4, bulk: 7, disp: 3 };
	const flowLabels: Record<FlowKey, string[]> = {
		send: ["Wallets", "Amount", "Confirm", "Done"],
		bulk: ["Source", "Recipients", "Country", "Review", "Costs", "Process", "Done"],
		disp: ["Transaction", "Evidence", "Done"],
	};
	const flowModals: Record<FlowKey, string> = {
		send: "sendMoneyModal",
		bulk: "bulkTransferModal",
		disp: "disputeModal",
	};
	const nextFlow = (key: FlowKey) => {
		const total = flowTotals[key];
		const current = flows[key];
		if (current >= total) {
			onClose();
			return;
		}
		if (current === total - 1) {
			setBusy(key);
			busyTimer.current = window.setTimeout(() => {
				setFlows((prev) => ({ ...prev, [key]: total }));
				setBusy(null);
			}, 1400);
			return;
		}
		setFlows((prev) => ({ ...prev, [key]: current + 1 }));
	};

	/* ---------- shared UI fragments ---------- */
	const stepper = (key: FlowKey) => {
		const total = flowTotals[key];
		const current = flows[key];
		return (
			<div className={styles.stepper}>
				{flowLabels[key].map((label, i) => {
					const n = i + 1;
					const cls =
						n < current
							? styles.stepDone
							: n === current
								? styles.stepActive
								: "";
					return (
						<div
							key={n}
							className={styles.step}
							style={{ display: "contents" }}
						>
							<div
								className={`${styles.step} ${cls}`}
								style={{ display: "flex" }}
							>
								<div className={styles.stepN}>
									{n < current ? <i className="bi bi-check" /> : n}
								</div>
								<div className={styles.stepL}>{label}</div>
							</div>
							{n < total && <div className={styles.stepLine} />}
						</div>
					);
				})}
			</div>
		);
	};

	/* ---------- receipt body swap (legacy doAction success state) ---------- */
	const receipt = (modalId: string, r: Result) => (
		<div className={styles.receipt}>
			<div className={styles.ri}>
				<i className="bi bi-check-lg" />
			</div>
			<h5 className={styles.receiptTitle}>{r.msg}</h5>
			{r.ref && (
				<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
					Reference: {r.ref}
				</p>
			)}
			<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
				<button
					className={`${styles.btnPm} ${styles.btnSm}`}
					onClick={() =>
						downloadFile(
							`${modalId}-receipt.txt`,
							`${r.msg}${r.ref ? `\nReference: ${r.ref}` : ""}`,
						)
					}
				>
					<i className="bi bi-download" /> Save
				</button>
				<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>
					<i className="bi bi-share" /> Continue
				</button>
			</div>
		</div>
	);

	/* ---------- action modal helper: body/footer swap for doAction ---------- */
	const actionBody = (id: string, children: ReactNode) => (
		<>
			{busy === id && <BusyOverlay />}
			{results[id] ? receipt(id, results[id]) : children}
		</>
	);

	const actionFooter = (
		id: string,
		label: string,
		tone: "btnPmP" | "btnPmD",
		msg: string,
		ref?: string,
		cancelLabel = "Cancel",
	) =>
		results[id] ? (
			<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
				Done
			</button>
		) : (
			<>
				<button className={styles.btnPm} onClick={onClose}>
					{cancelLabel}
				</button>
				<button
					className={`${styles.btnPm} ${styles[tone]}`}
					disabled={busy === id}
					onClick={() => doAction(id, msg, ref)}
				>
					{label}
				</button>
			</>
		);

	/* ---------- LEGACY BRIDGE: legacy confirm-step button labels ---------- */
	const flowFooter = (key: FlowKey) => {
		const total = flowTotals[key];
		const current = flows[key];
		const confirmLabel =
			key === "send" ? (
				<>
					Send Money <i className="bi bi-lock" />
				</>
			) : key === "disp" ? (
				<>
					Submit Dispute <i className="bi bi-send" />
				</>
			) : (
				<>
					Execute <i className="bi bi-check-lg" />
				</>
			);
		return (
			<>
				<button className={styles.btnPm} onClick={onClose}>
					Cancel
				</button>
				<button
					className={`${styles.btnPm} ${styles.btnPmP}`}
					disabled={busy === key}
					onClick={() => nextFlow(key)}
				>
					{current >= total ? (
						"Done"
					) : busy === key ? (
						<>
							<span
								className="spinner-border spinner-border-sm me-1"
								aria-hidden="true"
							/>{" "}
							Processing
						</>
					) : current === total - 1 ? (
						confirmLabel
					) : (
						<>
							Continue <i className="bi bi-arrow-right" />
						</>
					)}
				</button>
			</>
		);
	};

	const showFlow = (key: FlowKey) => active === flowModals[key];

	return (
		<>
			{/* Mini Confirmation Modal */}
			<MiniConfirm
				show={miniConfirm.show}
				title={miniConfirm.title}
				message={miniConfirm.message}
				onConfirm={() => {
					miniConfirm.onConfirm();
					setMiniConfirm({ show: false, title: "", message: "", onConfirm: () => {} });
				}}
				onCancel={() => setMiniConfirm({ show: false, title: "", message: "", onConfirm: () => {} })}
			/>

			{/* ============ M1: Send Money (multi-step + PIN) ============ */}
			<MBox
				id="sendMoneyModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-send me-2"
							style={{ color: "var(--pm-accent)" }}
						/>
						Send Money
					</>
				}
				footer={flowFooter("send")}
			>
				{stepper("send")}
				{busy === "send" && <BusyOverlay />}
				{showFlow("send") && flows.send === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Select Wallets</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>From</label>
								<select className={styles.fc} defaultValue={SEND_FROM[0]}>
									{SEND_FROM.map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>To</label>
								<select className={styles.fc} defaultValue={SEND_TO[0]}>
									{SEND_TO.map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}
				{showFlow("send") && flows.send === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Amount &amp; Reason</h6>
						<div className="mb-3">
							<label className={styles.fl}>Amount (KES)</label>
							<input className={styles.fc} defaultValue="250000" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Reason / Reference</label>
							<input
								className={styles.fc}
								defaultValue="Monthly supplier payment - June"
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Charge Bearer</label>
							<select className={styles.fc} defaultValue={CHARGE_BEARERS[0]}>
								{CHARGE_BEARERS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
					</div>
				)}
				{showFlow("send") && flows.send === 3 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: Confirm &amp; Authorize</h6>
						<div className={styles.summaryBox}>
							<div className="d-flex justify-content-between mb-2">
								<span>From</span>
								<strong>M-Pesa Business</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>To</span>
								<strong>0712 345 890</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Amount</span>
								<strong>KES 250,000</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span>Fee</span>
								<strong>KES 0</strong>
							</div>
						</div>
						<label className={`${styles.fl} mt-3`}>Enter PIN</label>
						<div className={styles.pinRow}>
							{[0, 1, 2, 3].map((i) => (
								<input
									key={i}
									type="password"
									maxLength={1}
									className={styles.pinInput}
									aria-label={`PIN digit ${i + 1}`}
									ref={(el) => {
										pinRefs.current[i] = el;
									}}
									onChange={() => nf(i)}
								/>
							))}
						</div>
					</div>
				)}
				{showFlow("send") && flows.send === 4 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Transfer Successful</h5>
							<p className={styles.receiptSub}>
								KES 250,000 sent to 0712 345 890
							</p>
							<div
								className={`${styles.summaryBox} text-start mt-3`}
								style={{ fontSize: 13 }}
							>
								<div className="d-flex justify-content-between mb-2">
									<span className={styles.mutedSmall}>Reference</span>
									<strong>MP-882910</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span className={styles.mutedSmall}>Time</span>
									<strong>27 Jun 2025, 14:32</strong>
								</div>
							</div>
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M2: Bulk Transfer (multi-step - 7 steps) ============ */}
			<MBox
				id="bulkTransferModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-collection me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						Bulk Transfer
					</>
				}
				footer={flowFooter("bulk")}
			>
				{stepper("bulk")}
				{busy === "bulk" && <BusyOverlay />}
				
				{/* Step 1: Source Account & Amount */}
				{showFlow("bulk") && flows.bulk === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Select Source Account</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Linked Mobile Account</label>
								<select className={styles.fc} defaultValue="mpesa-business">
									<option value="">Select linked account</option>
									<option value="mpesa-business">M-Pesa Business (0712 345 890)</option>
									<option value="airtel-disbursement">Airtel Disbursement (0733 112 445)</option>
									<option value="tkash-collections">T-Kash Collections (0700 998 112)</option>
									<option value="add-new" style={{ color: "var(--pm-primary)" }}>
										+ Add New Account
									</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Available Balance</label>
								<input 
									className={styles.fc} 
									defaultValue="304,700" 
									readOnly
									style={{ background: "#f9fafb" }}
								/>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Mobile PSP Provider</label>
								<select className={styles.fc} defaultValue="mpesa">
									<option value="mpesa">M-Pesa (Safaricom)</option>
									<option value="airtel">Airtel Money</option>
									<option value="tkash">T-Kash (Telkom)</option>
									<option value="equity">Equity Mobile</option>
									<option value="kcb">KCB Mobile</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Amount to Use (KES)</label>
								<input 
									className={styles.fc} 
									defaultValue="304,700"
									placeholder="Enter amount"
								/>
							</div>
						</div>

						{/* Split Account Section for Large Amounts */}
						<div className={`${styles.summaryBoxWarn} mt-3 p-3`} style={{ fontSize: 12 }}>
							<div className="d-flex align-items-start gap-2">
								<i className="bi bi-exclamation-triangle" style={{ marginTop: 2 }} />
								<div>
									<strong>Large Amount Transfer Alert</strong><br/>
									For amounts greater than <strong>KES 500,000</strong>, you need to add multiple linked mobile accounts to split the transfer (split-bill bulk transfer).<br/>
									<span style={{ color: "var(--pm-primary)" }}>
										Example: KES 2,440,223 requires approximately 5 linked accounts
									</span>
								</div>
							</div>
							<div className="mt-3">
								<label className={styles.fl}>Add Split Accounts (Optional)</label>
								<div className="table-responsive" style={{ maxHeight: 150, overflowY: "auto" }}>
									<table className={styles.tbl} style={{ fontSize: 12 }}>
										<thead>
											<tr>
												<th style={{ width: "40px" }}><input type="checkbox" /></th>
												<th>Linked Account</th>
												<th>Balance</th>
												<th>Allocation (KES)</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td><input type="checkbox" defaultChecked /></td>
												<td>M-Pesa Business (0712 345 890)</td>
												<td>KES 304,700</td>
												<td><input className={styles.fc} style={{ width: 100, padding: "4px 8px" }} defaultValue="304,700" /></td>
											</tr>
											<tr>
												<td><input type="checkbox" /></td>
												<td>Airtel Disbursement (0733 112 445)</td>
												<td>KES 218,500</td>
												<td><input className={styles.fc} style={{ width: 100, padding: "4px 8px" }} placeholder="0" /></td>
											</tr>
											<tr>
												<td><input type="checkbox" /></td>
												<td>T-Kash Collections (0700 998 112)</td>
												<td>KES 150,000</td>
												<td><input className={styles.fc} style={{ width: 100, padding: "4px 8px" }} placeholder="0" /></td>
											</tr>
										</tbody>
									</table>
								</div>
								<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmA} mt-2`}>
									<i className="bi bi-plus-circle me-1" /> Add Another Account
								</button>
							</div>
						</div>

						{/* STK Prompt Mode Selection */}
						<div className={`${styles.summaryBox} mt-3 p-3`}>
							<label className={styles.fl} style={{ fontWeight: 600, marginBottom: 8 }}>STK Prompt Mode</label>
							<div className="d-flex gap-3">
								<label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
									<input type="radio" name="stk-mode" defaultChecked />
									<div>
										<strong>Automatic</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>All STK prompts initiated automatically at final step</div>
									</div>
								</label>
								<label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
									<input type="radio" name="stk-mode" />
									<div>
										<strong>Manual</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Initiate each STK push separately at final step</div>
									</div>
								</label>
							</div>
						</div>

						<div className={`${styles.summaryBoxInfo} mt-3`} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> 
							<strong>200 recipients detected • Total KES 4,820,000</strong><br/>
							<span style={{ color: "var(--pm-warning)" }}>
								⚠️ Ensure your mobile account has sufficient balance to avoid STK prompt failures
							</span>
						</div>
					</div>
				)}

				{/* Step 2: Recipients Selection */}
				{showFlow("bulk") && flows.bulk === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Add Recipients</h6>
						<div className={`${styles.pills} mb-3`}>
							<button 
								className={`${styles.pill} ${tabs.bulkRecipients === "paymo" ? styles.pillActive : ""}`}
								onClick={() => sw("bulkRecipients", "paymo")}
							>
								Paymo Users
							</button>
							<button 
								className={`${styles.pill} ${tabs.bulkRecipients === "manual" ? styles.pillActive : ""}`}
								onClick={() => sw("bulkRecipients", "manual")}
							>
								Manual Entry
							</button>
							<button 
								className={`${styles.pill} ${tabs.bulkRecipients === "paste" ? styles.pillActive : ""}`}
								onClick={() => sw("bulkRecipients", "paste")}
							>
								Paste List
							</button>
							<button 
								className={`${styles.pill} ${tabs.bulkRecipients === "csv" ? styles.pillActive : ""}`}
								onClick={() => sw("bulkRecipients", "csv")}
							>
								Upload CSV
							</button>
						</div>
						
						{/* Paymo Users Tab */}
						{tabs.bulkRecipients === "paymo" && (
							<div className="mb-3">
								<label className={styles.fl}>Select from Paymo Account Users</label>
								<div className="table-responsive" style={{ maxHeight: 200, overflowY: "auto" }}>
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th style={{ width: "40px" }}><input type="checkbox" /></th>
												<th>Name</th>
												<th>Phone</th>
												<th>Country</th>
												<th>Select Amount</th>
											</tr>
										</thead>
										<tbody>
											{[
												["John Doe", "0712 345 890", "Kenya"],
												["Jane Smith", "0733 112 445", "Kenya"],
												["Peter Kamau", "0722 556 778", "Kenya"],
												["Mary Wanjiku", "0711 334 556", "Kenya"],
												["James Otieno", "0700 112 334", "Kenya"],
											].map((user, i) => (
												<tr key={i}>
													<td><input type="checkbox" defaultChecked={i < 3} /></td>
													<td>{user[0]}</td>
													<td>{user[1]}</td>
													<td>{user[2]}</td>
													<td>
														<input 
															className={styles.fc} 
															style={{ width: 100, padding: "6px 10px" }}
															defaultValue={i === 0 ? "25,000" : i === 1 ? "18,500" : ""}
															placeholder="Amount"
														/>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Amount Distribution Options */}
								<div className="row g-3 mt-3">
									<div className="col-md-4">
										<label className={styles.fl}>Amount Distribution</label>
										<select className={styles.fc} defaultValue="equal">
											<option value="equal">Equal for Everyone</option>
											<option value="percentage">Percentage of Total</option>
											<option value="custom">Custom per Recipient</option>
										</select>
									</div>
									<div className="col-md-4">
										<label className={styles.fl}>Equal Amount (KES)</label>
										<input className={styles.fc} defaultValue="24,100" />
									</div>
									<div className="col-md-4">
										<label className={styles.fl}>Selected Recipients</label>
										<input 
											className={styles.fc} 
											defaultValue="3" 
											readOnly
											style={{ background: "#f9fafb" }}
										/>
									</div>
								</div>

								<div className={`${styles.summaryBoxAccent} mt-3`} style={{ fontSize: 12 }}>
									<i className="bi bi-check-circle me-1" /> 
									<strong>3 recipients selected • Total: KES 72,300</strong>
								</div>
							</div>
						)}

						{/* Manual Entry Tab */}
						{tabs.bulkRecipients === "manual" && (
							<div className="mb-3">
								<div className={`${styles.summaryBoxInfo} mb-3`} style={{ fontSize: 12 }}>
									<i className="bi bi-info-circle me-1" />
									Add recipients one at a time. Click "Add Recipient" to add more.
								</div>
								
								{/* Manual Recipients List */}
								{manualRecipients.length > 0 && (
									<div className="table-responsive mb-3" style={{ maxHeight: 200, overflowY: "auto" }}>
										<table className={styles.tbl}>
											<thead>
												<tr>
													<th>#</th>
													<th>Name</th>
													<th>Phone</th>
													<th>Amount (KES)</th>
													<th style={{ width: "60px" }}>Action</th>
												</tr>
											</thead>
											<tbody>
												{manualRecipients.map((recipient, i) => (
													<tr key={i}>
														<td>{i + 1}</td>
														<td>{recipient.name}</td>
														<td>{recipient.phone}</td>
														<td><strong>{recipient.amount}</strong></td>
														<td>
															<button 
																className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
																style={{ padding: "4px 8px" }}
																onClick={() => {
																	setManualRecipients(prev => prev.filter((_, idx) => idx !== i));
																}}
															>
																<i className="bi bi-trash" />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}

								{/* Add Recipient Form */}
								<div className={`${styles.summaryBox} p-3`}>
									<div className="row g-2">
										<div className="col-md-4">
											<input 
												className={styles.fc} 
												placeholder="Recipient Name"
												id="manual-name"
											/>
										</div>
										<div className="col-md-4">
											<input 
												className={styles.fc} 
												placeholder="Phone Number"
												id="manual-phone"
											/>
										</div>
										<div className="col-md-4">
											<input 
												className={styles.fc} 
												placeholder="Amount (KES)"
												id="manual-amount"
											/>
										</div>
									</div>
									<button 
										className={`${styles.btnPm} ${styles.btnPmA} mt-2`}
										onClick={() => {
											const name = (document.getElementById("manual-name") as HTMLInputElement)?.value || "";
											const phone = (document.getElementById("manual-phone") as HTMLInputElement)?.value || "";
											const amount = (document.getElementById("manual-amount") as HTMLInputElement)?.value || "";
											if (name && phone && amount) {
												setManualRecipients(prev => [...prev, { name, phone, amount }]);
												(document.getElementById("manual-name") as HTMLInputElement).value = "";
												(document.getElementById("manual-phone") as HTMLInputElement).value = "";
												(document.getElementById("manual-amount") as HTMLInputElement).value = "";
											}
										}}
									>
										<i className="bi bi-plus-circle me-1" /> Add Recipient
									</button>
								</div>

								{manualRecipients.length > 0 && (
									<div className={`${styles.summaryBoxAccent} mt-3`} style={{ fontSize: 12 }}>
										<i className="bi bi-check-circle me-1" /> 
										<strong>{manualRecipients.length} recipients added</strong>
									</div>
								)}
							</div>
						)}

						{/* Paste List Tab */}
						{tabs.bulkRecipients === "paste" && (
							<div className="mb-3">
								<label className={styles.fl}>Paste Recipients List</label>
								<div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 12 }}>
									<i className="bi bi-info-circle me-1" />
									Paste recipients in format: <strong>Name, Phone, Amount</strong> (one per line)
								</div>
								<textarea
									className={styles.fc}
									style={{ minHeight: 150, fontFamily: "monospace", fontSize: 12 }}
									placeholder="John Doe, 0712 345 890, 25000&#10;Jane Smith, 0733 112 445, 18500&#10;Peter Kamau, 0722 556 778, 28800"
								/>
								<div className="d-flex justify-content-between align-items-center mt-2">
									<span className={styles.mutedSmall} style={{ fontSize: 11 }}>
										<i className="bi bi-lightning me-1" /> Auto-detects format
									</span>
									<button className={`${styles.btnPm} ${styles.btnPmP}`}>
										<i className="bi bi-check-circle me-1" /> Parse Recipients
									</button>
								</div>
							</div>
						)}

						{/* Upload CSV Tab */}
						{tabs.bulkRecipients === "csv" && (
							<div className="mb-3">
								<label className={styles.fl}>Upload CSV File</label>
								<div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 12 }}>
									<i className="bi bi-info-circle me-1" />
									CSV format: <strong>Name, Phone, Amount, Reason</strong> • Max file size: 1MB • Max recipients: 500
								</div>
								<div className={`${styles.summaryBox} p-4 text-center`}>
									<i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: 48, color: "var(--pm-primary-light)" }} />
									<div className="mt-2">
										<input type="file" accept=".csv" className={styles.fc} style={{ display: "inline-block" }} />
									</div>
									<div className={styles.mutedSmall} style={{ fontSize: 11, marginTop: 8 }}>
										Drag & drop or click to browse
									</div>
								</div>
								<div className="row g-2 mt-2">
									<div className="col-md-6">
										<div className={styles.summaryBox}>
											<div className={styles.mutedSmall}>File Size Limit</div>
											<strong>1 MB</strong>
										</div>
									</div>
									<div className="col-md-6">
										<div className={styles.summaryBox}>
											<div className={styles.mutedSmall}>Max Recipients</div>
											<strong>500</strong>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Step 3: Country & Purpose */}
				{showFlow("bulk") && flows.bulk === 3 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: Country & Purpose</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Recipient Countries</label>
								<select className={styles.fc} defaultValue="single">
									<option value="single">Single Country</option>
									<option value="multiple">Multiple Countries</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Select Country</label>
								<select className={styles.fc} defaultValue="KE">
									<option value="KE">Kenya</option>
									<option value="UG">Uganda</option>
									<option value="TZ">Tanzania</option>
									<option value="RW">Rwanda</option>
									<option value="NG">Nigeria</option>
									<option value="GH">Ghana</option>
									<option value="ZA">South Africa</option>
								</select>
							</div>
							<div className="col-12">
								<label className={styles.fl}>Purpose of Funds</label>
								<select className={styles.fc} defaultValue="salary">
									<option value="">Select purpose</option>
									<option value="salary">Salary / Wages</option>
									<option value="farm-labour">Farm Labour Payment</option>
									<option value="donations">Donations</option>
									<option value="fare">Fare / Transport</option>
									<option value="pocket-money">Pocket Money</option>
									<option value="school-fees">School Fees</option>
									<option value="medical">Medical Expenses</option>
									<option value="business">Business Payment</option>
									<option value="supplier">Supplier Payment</option>
									<option value="other">Other</option>
								</select>
							</div>
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> 
							All recipients are in <strong>Kenya</strong> • Purpose: <strong>Farm Labour Payment</strong>
						</div>
					</div>
				)}

				{/* Step 4: Review & Fund */}
				{showFlow("bulk") && flows.bulk === 4 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 4: Review & Fund</h6>
						<div className="table-responsive" style={{ maxHeight: 300, overflowY: "auto" }}>
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Phone</th>
										<th>Country</th>
										<th>Amount</th>
										<th style={{ width: "60px" }}>Action</th>
									</tr>
								</thead>
								<tbody>
									{[
										["John Doe", "0712 345 890", "Kenya", "KES 25,000"],
										["Jane Smith", "0733 112 445", "Kenya", "KES 18,500"],
										["Peter Kamau", "0722 556 778", "Kenya", "KES 28,800"],
									].map((recipient, i) => (
										<tr key={i}>
											<td>{recipient[0]}</td>
											<td>{recipient[1]}</td>
											<td>{recipient[2]}</td>
											<td><strong>{recipient[3]}</strong></td>
											<td>
												<button 
													className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`}
													style={{ padding: "4px 8px" }}
												>
													<i className="bi bi-trash" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="row g-3 mt-3">
							<div className="col-md-4">
								<div className={styles.summaryBox}>
									<div className={styles.mutedSmall}>Total Recipients</div>
									<div style={{ fontSize: 20, fontWeight: 700 }}>3</div>
								</div>
							</div>
							<div className="col-md-4">
								<div className={styles.summaryBox}>
									<div className={styles.mutedSmall}>Total Amount</div>
									<div style={{ fontSize: 20, fontWeight: 700, color: "var(--pm-primary)" }}>
										KES 72,300
									</div>
								</div>
							</div>
							<div className="col-md-4">
								<div className={styles.summaryBox}>
									<div className={styles.mutedSmall}>Source Balance</div>
									<div style={{ fontSize: 20, fontWeight: 700 }}>
										KES 304,700
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Step 5: Cost Breakdown */}
				{showFlow("bulk") && flows.bulk === 5 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 5: Cost Breakdown</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<div className={styles.summaryBox}>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Total Transfer Amount</span>
										<strong>KES 72,300</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Transaction Fees (3 recipients × KES 25)</span>
										<strong>KES 75</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>STK Push Fees</span>
										<strong>KES 0</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Tax (16% VAT)</span>
										<strong>KES 12</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Platform Charges</span>
										<strong>KES 10</strong>
									</div>
									<hr className={styles.divider} />
									<div className="d-flex justify-content-between">
										<span className={styles.mutedSmall} style={{ fontWeight: 600 }}>Total to be Prompted</span>
										<strong style={{ fontSize: 18, color: "var(--pm-primary)" }}>
											KES 72,397
										</strong>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className={styles.summaryBoxInfo}>
									<h6 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
										<i className="bi bi-info-circle me-1" /> Fee Breakdown
									</h6>
									<div className="mb-2">
										<span className={styles.mutedSmall}>Per Transaction:</span>
										<strong> KES 25</strong>
									</div>
									<div className="mb-2">
										<span className={styles.mutedSmall}>Bulk Discount:</span>
										<strong> 10% applied</strong>
									</div>
									<div className="mb-2">
										<span className={styles.mutedSmall}>VAT Rate:</span>
										<strong> 16%</strong>
									</div>
									<div>
										<span className={styles.mutedSmall}>Platform Fee:</span>
										<strong> KES 10</strong>
									</div>
								</div>
								<div className={`${styles.summaryBoxWarn} mt-3`} style={{ fontSize: 12 }}>
									<i className="bi bi-exclamation-triangle me-1" />
									<strong>STK Prompt will request KES 72,397 from your phone</strong>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Step 6: Live Processing Log */}
				{showFlow("bulk") && flows.bulk === 6 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 6: Processing Transfers</h6>
						
						{/* PIN Entry Section */}
						<div className={`${styles.summaryBox} mb-3`}>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<span className={styles.mutedSmall}>Enter PIN to Authorize</span>
								<span className={`${styles.badge} ${styles.badgeI}`}>
									<i className="bi bi-shield-lock" /> Secure
								</span>
							</div>
							<div className={styles.pinRow}>
								{[0, 1, 2, 3].map((i) => (
									<input
										key={i}
										type="password"
										maxLength={1}
										className={styles.pinInput}
										aria-label={`PIN digit ${i + 1}`}
										ref={(el) => {
											pinRefs.current[i] = el;
										}}
										onChange={() => nf(i)}
									/>
								))}
							</div>
						</div>

						{/* Live Processing Log */}
						<div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 12 }}>
							<i className="bi bi-activity me-1" />
							<strong>Live Processing Log</strong> • Real-time updates
						</div>
						
						<div className="table-responsive" style={{ maxHeight: 250, overflowY: "auto" }}>
							<table className={styles.tbl} style={{ fontSize: 12 }}>
								<thead>
									<tr>
										<th>#</th>
										<th>Recipient</th>
										<th>Phone</th>
										<th>Amount</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{[
										["John Doe", "0712 345 890", "KES 25,000", "delivered"],
										["Jane Smith", "0733 112 445", "KES 18,500", "delivered"],
										["Peter Kamau", "0722 556 778", "KES 28,800", "processing"],
									].map((item, i) => (
										<tr key={i}>
											<td>{i + 1}</td>
											<td>{item[0]}</td>
											<td>{item[1]}</td>
											<td>{item[2]}</td>
											<td>
												{item[3] === "delivered" ? (
													<span className={`${styles.badge} ${styles.badgeS}`}>
														<i className="bi bi-check-circle" /> Delivered
													</span>
												) : (
													<span className={`${styles.badge} ${styles.badgeW}`}>
														<i className="bi bi-arrow-repeat" /> Processing
													</span>
												)}
											</td>
										</tr>
									))}
									{/* Show more processing items */}
									{Array.from({ length: 6 }).map((_, i) => (
										<tr key={`more-${i}`}>
											<td>{i + 4}</td>
											<td>Recipient {i + 4}</td>
											<td>07XX XXX XXX</td>
											<td>KES {(Math.random() * 20000 + 10000).toFixed(0)}</td>
											<td>
												<span className={`${styles.badge} ${styles.badgeW}`}>
													<i className="bi bi-arrow-repeat" /> Processing
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="row g-3 mt-3">
							<div className="col-md-4">
								<div className={styles.summaryBox}>
									<div className={styles.mutedSmall}>Completed</div>
									<div style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-primary)" }}>
										2/9
									</div>
								</div>
							</div>
							<div className="col-md-4">
								<div className={styles.summaryBox}>
									<div className={styles.mutedSmall}>Processing</div>
									<div style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-warning)" }}>
										7
									</div>
								</div>
							</div>
							<div className="col-md-4">
								<div className={styles.summaryBox}>
									<div className={styles.mutedSmall}>Failed</div>
									<div style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-danger)" }}>
										0
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Step 7: Success/Failure Summary */}
				{showFlow("bulk") && flows.bulk === 7 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-all" />
							</div>
							<h5 className={styles.receiptTitle}>Bulk Transfer Complete</h5>
							<p className={styles.receiptSub}>
								9 transfers processed successfully
							</p>
							
							<div className="row g-3 mt-4">
								<div className="col-md-4">
									<div className={styles.summaryBoxAccent}>
										<div className={styles.mutedSmall}>Successful Transfers</div>
										<div style={{ fontSize: 28, fontWeight: 700, color: "var(--pm-primary)" }}>
											9/9
										</div>
									</div>
								</div>
								<div className="col-md-4">
									<div className={styles.summaryBox}>
										<div className={styles.mutedSmall}>Failed Transfers</div>
										<div style={{ fontSize: 28, fontWeight: 700, color: "var(--pm-danger)" }}>
											0
										</div>
									</div>
								</div>
								<div className="col-md-4">
									<div className={styles.summaryBox}>
										<div className={styles.mutedSmall}>Success Rate</div>
										<div style={{ fontSize: 28, fontWeight: 700, color: "var(--pm-primary)" }}>
											100%
										</div>
									</div>
								</div>
							</div>

							<div className={`${styles.summaryBoxInfo} mt-3`} style={{ fontSize: 12 }}>
								<i className="bi bi-info-circle me-1" />
								<strong>Total Sent: KES 72,300</strong> • Reference: <strong>BULK-20250627-8841</strong>
							</div>

							<div className="d-flex justify-content-center mt-4" style={{ gap: 8 }}>
								<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
									<i className="bi bi-check-circle" /> Complete
								</button>
								<button className={`${styles.btnPm} ${styles.btnPmA}`} onClick={() => {
									setFlows(prev => ({ ...prev, bulk: 1 }));
								}}>
									<i className="bi bi-plus-circle" /> New Transfer
								</button>
							</div>

							{/* Failed transfers section (hidden when 0 failures) */}
							{false && (
								<div className={`${styles.summaryBoxWarn} mt-3`} style={{ fontSize: 12 }}>
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span><i className="bi bi-exclamation-triangle me-1" /> <strong>5 transfers failed</strong></span>
										<div style={{ gap: 4 }}>
											<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}>
												<i className="bi bi-arrow-repeat" /> Retry
											</button>
											<button className={`${styles.btnPm} ${styles.btnSm}`}>
												<i className="bi bi-eye" /> View Reasons
											</button>
										</div>
									</div>
									<div className={styles.mutedSmall}>
										Failed recipients: 0712***890, 0733***112, 0722***556, 0700***998, 0711***334
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M3: Link New Wallet ============ */}
			<MBox
				id="linkWalletModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-circle me-2"
							style={{ color: "var(--pm-info)" }}
						/>
						Link New Mobile Money Wallet
					</>
				}
				footer={actionFooter(
					"linkWalletModal",
					"Link Wallet",
					"btnPmP",
					"Wallet linked successfully! KYC verification in progress.",
				)}
			>
				{actionBody(
					"linkWalletModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Provider</label>
							<select className={styles.fc} defaultValue={PROVIDERS[0]}>
								{PROVIDERS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Phone Number</label>
							<input className={styles.fc} defaultValue="0712 345 890" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Account Type</label>
							<select className={styles.fc} defaultValue={ACCOUNT_TYPES[0]}>
								{ACCOUNT_TYPES.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="lw1"
							/>
							<label className="form-check-label" htmlFor="lw1">
								Enable instant notifications
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="lw2"
							/>
							<label className="form-check-label" htmlFor="lw2">
								Auto-reconcile daily
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M4: Wallet Detail (multi-tab) ============ */}
			<MBox
				id="walletDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-wallet2 me-2" />
						Wallet Details
					</>
				}
				footer={actionFooter(
					"walletDetailModal",
					"Save Changes",
					"btnPmP",
					"Wallet settings updated!",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"walletDetailModal",
					<>
						<div className={`${styles.pills} mb-3`}>
							{(
								[
									["overview", "Overview"],
									["txns", "Transactions"],
									["limits", "Limits"],
									["kyc", "KYC"],
								] as const
							).map(([key, label]) => (
								<button
									key={key}
									className={`${styles.pill} ${tabs.wd === key ? styles.pillActive : ""}`}
									onClick={() => sw("wd", key)}
								>
									{label}
								</button>
							))}
						</div>
						{tabs.wd === "overview" && (
							<div className="row g-3">
								{(
									[
										["Balance", "KES 8,420,500"],
										["24h Volume", "KES 12.4M"],
									] as const
								).map(([k, v]) => (
									<div className="col-md-6" key={k}>
										<div className={styles.summaryBox}>
											<div className={styles.mutedSmall}>{k}</div>
											<div style={{ fontSize: 24, fontWeight: 700 }}>{v}</div>
										</div>
									</div>
								))}
							</div>
						)}
						{tabs.wd === "txns" && (
							<div className="table-responsive">
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Date</th>
											<th>Type</th>
											<th>Amount</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>27 Jun</td>
											<td>B2C Payment</td>
											<td>KES 250,000</td>
											<td>
												<span className={`${styles.badge} ${styles.badgeS}`}>
													Success
												</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
						{tabs.wd === "limits" && (
							<>
								<div className="mb-3">
									<label className={styles.fl}>Daily Limit</label>
									<input className={styles.fc} defaultValue="50000000" />
								</div>
								<div className="mb-3">
									<label className={styles.fl}>Per Transaction</label>
									<input className={styles.fc} defaultValue="1000000" />
								</div>
							</>
						)}
						{tabs.wd === "kyc" && (
							<>
								<div className={styles.sr}>
									<div>
										<strong>KYC Status</strong>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										Full
									</span>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Last Verified</strong>
									</div>
									<strong>12 Mar 2025</strong>
								</div>
							</>
						)}
					</>,
				)}
			</MBox>

			{/* ============ M5: Bulk Retry ============ */}
			<MBox
				id="bulkRetryModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-repeat me-2"
							style={{ color: "var(--pm-warning)" }}
						/>
						Retry Failed Transfers
					</>
				}
				footer={actionFooter(
					"bulkRetryModal",
					"Retry Now",
					"btnPmP",
					"47 transfers queued for retry. ETA: 15 minutes.",
				)}
			>
				{actionBody(
					"bulkRetryModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							47 transfers failed in the last batch. Reason: Insufficient float
							on Airtel Money.
						</p>
						<div className={`${styles.summaryBoxWarn} mb-3`}>
							<div className="d-flex justify-content-between">
								<span>Total Amount</span>
								<strong>KES 1,240,000</strong>
							</div>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="br1"
							/>
							<label className="form-check-label" htmlFor="br1">
								Retry all 47
							</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" id="br2" />
							<label className="form-check-label" htmlFor="br2">
								Skip and notify recipients
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M6: Run Reconciliation ============ */}
			<MBox
				id="reconcileModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-arrow-repeat me-2" />
						Run Reconciliation
					</>
				}
				footer={actionFooter(
					"reconcileModal",
					"Start Reconciliation",
					"btnPmP",
					"Reconciliation started. Report will be emailed in 5 minutes.",
					"REC-20250627-9912",
				)}
			>
				{actionBody(
					"reconcileModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Select Wallets</label>
							<select
								className={styles.fc}
								multiple
								defaultValue={RECON_WALLETS.slice(0, 2)}
							>
								{RECON_WALLETS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Date Range</label>
							<div className="row g-2">
								<div className="col-6">
									<input
										type="date"
										className={styles.fc}
										defaultValue="2025-06-20"
									/>
								</div>
								<div className="col-6">
									<input
										type="date"
										className={styles.fc}
										defaultValue="2025-06-27"
									/>
								</div>
							</div>
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> Reconciliation typically
							takes 2–5 minutes. You will receive a detailed report via email.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M7: PSP Integration Settings (multi-tab) ============ */}
			<MBox
				id="pspSettingsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear me-2" />
						PSP Integration Settings
					</>
				}
				footer={actionFooter(
					"pspSettingsModal",
					"Save Settings",
					"btnPmP",
					"PSP settings updated successfully!",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"pspSettingsModal",
					<>
						<div className={`${styles.pills} mb-3`}>
							{(
								[
									["creds", "Credentials"],
									["limits", "Limits"],
									["webhooks", "Webhooks"],
								] as const
							).map(([key, label]) => (
								<button
									key={key}
									className={`${styles.pill} ${tabs.psp === key ? styles.pillActive : ""}`}
									onClick={() => sw("psp", key)}
								>
									{label}
								</button>
							))}
						</div>
						{tabs.psp === "creds" && (
							<>
								<div className="mb-3">
									<label className={styles.fl}>API Key</label>
									<input
										className={styles.fc}
										defaultValue="sk_live_****************************"
									/>
								</div>
								<div className="mb-3">
									<label className={styles.fl}>Secret</label>
									<input
										className={styles.fc}
										type="password"
										defaultValue="••••••••••••••••"
									/>
								</div>
							</>
						)}
						{tabs.psp === "limits" && (
							<div className="mb-3">
								<label className={styles.fl}>Daily Settlement Cap</label>
								<input className={styles.fc} defaultValue="100000000" />
							</div>
						)}
						{tabs.psp === "webhooks" && (
							<div className="mb-3">
								<label className={styles.fl}>Webhook URL</label>
								<input
									className={styles.fc}
									defaultValue="https://api.paymo.co.ke/webhooks/mpesa"
								/>
							</div>
						)}
					</>,
				)}
			</MBox>

			{/* ============ M8: Bulk KYC Refresh ============ */}
			<MBox
				id="kycBulkModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-person-check me-2"
							style={{ color: "var(--pm-info)" }}
						/>
						Bulk KYC Refresh
					</>
				}
				footer={actionFooter(
					"kycBulkModal",
					"Send Links",
					"btnPmP",
					"eKYC links sent to 57 accounts. Tracking dashboard updated.",
					"KYC-20250627-1128",
				)}
			>
				{actionBody(
					"kycBulkModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Select Accounts</label>
							<select
								className={styles.fc}
								multiple
								defaultValue={[KYC_ACCOUNTS[0]]}
							>
								{KYC_ACCOUNTS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Method</label>
							<select className={styles.fc} defaultValue={KYC_METHODS[0]}>
								{KYC_METHODS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}>
							<i className="bi bi-clock me-1" /> eKYC links expire in 72 hours.
							Recipients must complete within the window.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M9: File Dispute (multi-step) ============ */}
			<MBox
				id="disputeModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-triangle me-2"
							style={{ color: "var(--pm-danger)" }}
						/>
						File Mobile Money Dispute
					</>
				}
				footer={flowFooter("disp")}
			>
				{stepper("disp")}
				{busy === "disp" && <BusyOverlay />}
				{showFlow("disp") && flows.disp === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Transaction</h6>
						<div className="mb-3">
							<label className={styles.fl}>Transaction Reference</label>
							<input className={styles.fc} defaultValue="MP-882910" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Dispute Reason</label>
							<select className={styles.fc} defaultValue={DISPUTE_REASONS[0]}>
								{DISPUTE_REASONS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
					</div>
				)}
				{showFlow("disp") && flows.disp === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Evidence</h6>
						<div className="mb-3">
							<label className={styles.fl}>Description</label>
							<textarea
								className={styles.fc}
								rows={3}
								defaultValue="Recipient claims they never received the funds. Transaction shows successful on our side."
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Upload Screenshot / Proof</label>
							<input type="file" className={styles.fc} />
						</div>
					</div>
				)}
				{showFlow("disp") && flows.disp === 3 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Dispute Filed</h5>
							<p className={styles.receiptSub}>
								Case #MMD-44987 created. Expected resolution: 5–10 business
								days.
							</p>
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M10: Wallet Permissions ============ */}
			<MBox
				id="walletPermissionsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield-lock me-2" />
						Wallet Permissions
					</>
				}
				footer={actionFooter(
					"walletPermissionsModal",
					"Save Permissions",
					"btnPmP",
					"Permissions updated successfully!",
				)}
			>
				{actionBody(
					"walletPermissionsModal",
					<>
						{(
							[
								["Send Money", true],
								["Receive Money", true],
								["Bulk Transfers", true],
								["View Balance", false],
								["Manage Settings", false],
							] as const
						).map(([label, checked], i) => (
							<div className={`form-check ${i < 4 ? "mb-2" : ""}`} key={label}>
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked={checked}
									id={`wp${i}`}
								/>
								<label className="form-check-label" htmlFor={`wp${i}`}>
									{label}
								</label>
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ============ M11: Schedule Transfer ============ */}
			<MBox
				id="scheduleTransferModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calendar-event me-2" />
						Schedule Transfer
					</>
				}
				footer={actionFooter(
					"scheduleTransferModal",
					"Schedule",
					"btnPmP",
					"Transfer scheduled successfully!",
					"SCH-20250701-001",
				)}
			>
				{actionBody(
					"scheduleTransferModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>From</label>
							<select className={styles.fc} defaultValue="M-Pesa Business">
								<option>M-Pesa Business</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>To</label>
							<select className={styles.fc} defaultValue="0712 345 890">
								<option>0712 345 890</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Amount</label>
							<input className={styles.fc} defaultValue="100000" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Schedule Date</label>
							<input
								type="datetime-local"
								className={styles.fc}
								defaultValue="2025-07-01T09:00"
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Frequency</label>
							<select className={styles.fc} defaultValue={SCHEDULE_FREQS[0]}>
								{SCHEDULE_FREQS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M12: PSP Health Dashboard ============ */}
			<MBox
				id="pspHealthModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-heart-pulse me-2" />
						PSP Health Dashboard
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>PSP</th>
								<th>Uptime</th>
								<th>Latency</th>
								<th>Error Rate</th>
								<th>Last Incident</th>
							</tr>
						</thead>
						<tbody>
							{(
								[
									[
										"M-Pesa",
										"99.98%",
										"120ms",
										"0.02%",
										"12 Jun",
										styles.badgeS,
									],
									[
										"Airtel Money",
										"99.71%",
										"180ms",
										"0.12%",
										"25 Jun",
										styles.badgeS,
									],
									[
										"Pesalink",
										"94.2%",
										"450ms",
										"1.8%",
										"27 Jun",
										styles.badgeW,
									],
								] as const
							).map(([psp, uptime, latency, err, incident, tone]) => (
								<tr key={psp}>
									<td>{psp}</td>
									<td>
										<span className={`${styles.badge} ${tone}`}>{uptime}</span>
									</td>
									<td>{latency}</td>
									<td>{err}</td>
									<td>{incident}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M13: Transaction Limits ============ */}
			<MBox
				id="limitSettingsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-sliders me-2" />
						Transaction Limits
					</>
				}
				footer={actionFooter(
					"limitSettingsModal",
					"Save Limits",
					"btnPmP",
					"Limits updated successfully!",
				)}
			>
				{actionBody(
					"limitSettingsModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Per Transaction Limit</label>
							<input className={styles.fc} defaultValue="1000000" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Daily Limit</label>
							<input className={styles.fc} defaultValue="50000000" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Monthly Limit</label>
							<input className={styles.fc} defaultValue="500000000" />
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="ls1"
							/>
							<label className="form-check-label" htmlFor="ls1">
								Require approval for amounts above KES 500,000
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M14: Transfer Receipt ============ */}
			<MBox
				id="transferReceiptModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-receipt me-2" />
						Transfer Receipt
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className={styles.receipt}>
					<div className={styles.ri}>
						<i className="bi bi-check-lg" />
					</div>
					<h5 className={styles.receiptTitle}>Transfer Successful</h5>
					<div
						className={`${styles.summaryBox} text-start mt-3`}
						style={{ fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className={styles.mutedSmall}>Reference</span>
							<strong>MP-882910</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className={styles.mutedSmall}>From</span>
							<strong>M-Pesa Business</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className={styles.mutedSmall}>To</span>
							<strong>0712 345 890</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className={styles.mutedSmall}>Amount</span>
							<strong>KES 250,000</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span className={styles.mutedSmall}>Date</span>
							<strong>27 Jun 2025, 14:32</strong>
						</div>
					</div>
					{/* LEGACY BRIDGE: dead PDF/Share buttons in legacy → real receipt downloads */}
					<div
						className="d-flex justify-content-center mt-3"
						style={{ gap: 8 }}
					>
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() =>
								downloadFile(
									"transfer-receipt-MP-882910.txt",
									"PayMo — Transfer Receipt\nReference: MP-882910\nFrom: M-Pesa Business\nTo: 0712 345 890\nAmount: KES 250,000\nDate: 27 Jun 2025, 14:32\nStatus: Successful",
								)
							}
						>
							<i className="bi bi-download" /> PDF
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() =>
								downloadFile(
									"transfer-share-MP-882910.txt",
									"PayMo transfer of KES 250,000 to 0712 345 890 completed successfully. Ref: MP-882910 (27 Jun 2025, 14:32).",
								)
							}
						>
							<i className="bi bi-whatsapp" /> Share
						</button>
					</div>
				</div>
			</MBox>

			{/* ============ M15: Pause Wallet ============ */}
			<MBox
				id="pauseWalletModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-pause-circle me-2"
							style={{ color: "var(--pm-warning)" }}
						/>
						Pause Wallet
					</>
				}
				footer={actionFooter(
					"pauseWalletModal",
					"Pause Wallet",
					"btnPmP",
					"Wallet paused successfully. All transactions blocked.",
				)}
			>
				{actionBody(
					"pauseWalletModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Reason</label>
							<select className={styles.fc} defaultValue={PAUSE_REASONS[0]}>
								{PAUSE_REASONS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="pw1"
							/>
							<label className="form-check-label" htmlFor="pw1">
								Block all outgoing transfers
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="pw2"
							/>
							<label className="form-check-label" htmlFor="pw2">
								Block all incoming transfers
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M16: Export Statements ============ */}
			<MBox
				id="statementModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download me-2" />
						Export Statements
					</>
				}
				footer={actionFooter(
					"statementModal",
					"Export",
					"btnPmP",
					"Statement generated and downloading...",
				)}
			>
				{actionBody(
					"statementModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Wallet</label>
							<select className={styles.fc} defaultValue={STATEMENT_WALLETS[0]}>
								{STATEMENT_WALLETS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-6">
								<label className={styles.fl}>From</label>
								<input
									type="date"
									className={styles.fc}
									defaultValue="2025-06-01"
								/>
							</div>
							<div className="col-6">
								<label className={styles.fl}>To</label>
								<input
									type="date"
									className={styles.fc}
									defaultValue="2025-06-27"
								/>
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Format</label>
							<select className={styles.fc} defaultValue={STATEMENT_FORMATS[0]}>
								{STATEMENT_FORMATS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M17: Wallet Health Dashboard ============ */}
			<MBox
				id="walletHealthModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-heart-pulse me-2" />
						Wallet Health Dashboard
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className="row g-3">
					{(
						[
							["96", "AVG HEALTH", "var(--pm-accent-soft)", "var(--pm-accent)"],
							["4", "ACTIVE", "var(--pm-info-soft)", "var(--pm-info)"],
							["1", "DEGRADED", "var(--pm-warning-soft)", "var(--pm-warning)"],
						] as const
					).map(([value, label, bg, color]) => (
						<div className="col-md-4" key={label}>
							<div className={styles.miniStat} style={{ background: bg }}>
								<div className={styles.miniStatBig} style={{ color }}>
									{value}
								</div>
								<div className={styles.miniStatLabel} style={{ color }}>
									{label}
								</div>
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ============ M18: Add New PSP ============ */}
			<MBox
				id="addPspModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-plug me-2" />
						Add New PSP
					</>
				}
				footer={actionFooter(
					"addPspModal",
					"Add PSP",
					"btnPmP",
					"PSP added successfully! API credentials required next.",
				)}
			>
				{actionBody(
					"addPspModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>PSP Name</label>
							<input className={styles.fc} placeholder="e.g. Flutterwave" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Type</label>
							<select className={styles.fc} defaultValue={PSP_TYPES[0]}>
								{PSP_TYPES.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>API Endpoint</label>
							<input className={styles.fc} placeholder="https://api.psp.com" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Settlement Cycle</label>
							<select className={styles.fc} defaultValue={PSP_CYCLES[0]}>
								{PSP_CYCLES.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M19: Contact PSP Support ============ */}
			<MBox
				id="contactSupportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-headset me-2" />
						Contact PSP Support
					</>
				}
				footer={actionFooter(
					"contactSupportModal",
					"Send",
					"btnPmP",
					"Support ticket created. Reference: PSP-8821",
				)}
			>
				{actionBody(
					"contactSupportModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Subject</label>
							<select className={styles.fc} defaultValue={SUPPORT_SUBJECTS[0]}>
								{SUPPORT_SUBJECTS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Message</label>
							<textarea
								className={styles.fc}
								rows={4}
								defaultValue="Need assistance with Pesalink integration."
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M20: Mobile Money Health Check ============ */}
			<MBox
				id="healthCheckModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-heart-pulse me-2"
							style={{ color: "var(--pm-danger)" }}
						/>
						Mobile Money Health Check
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("walletHealthModal")}
						>
							View Details
						</button>
					</>
				}
			>
				<div className="row g-3 mb-3">
					{(
						[
							["97", "OVERALL", "var(--pm-accent-soft)", "var(--pm-accent)"],
							["12", "WALLETS", "var(--pm-info-soft)", "var(--pm-info)"],
							["1", "DEGRADED", "var(--pm-warning-soft)", "var(--pm-warning)"],
							["0", "CRITICAL", "var(--pm-purple-soft)", "var(--pm-purple)"],
						] as const
					).map(([value, label, bg, color]) => (
						<div className="col-md-3 col-6" key={label}>
							<div className={styles.miniStat} style={{ background: bg }}>
								<div className={styles.miniStatBig} style={{ color }}>
									{value}
								</div>
								<div className={styles.miniStatLabel} style={{ color }}>
									{label}
								</div>
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ============ M21: All Attention Items ============ */}
			<MBox
				id="attentionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-circle me-2"
							style={{ color: "var(--pm-warning)" }}
						/>
						All Attention Items
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				{(
					[
						["M-Pesa B2C batch failed", "Retry", "bulkRetryModal", true],
						["45 KYC pending", "Start", "kycBulkModal", false],
						["Airtel API token expiring", "Renew", "pspSettingsModal", false],
					] as const
				).map(([title, label, modal, danger]) => (
					<div className={styles.sr} key={title}>
						<div>
							<strong>{title}</strong>
						</div>
						<button
							className={`${styles.btnPm} ${styles.btnSm} ${danger ? styles.btnPmD : ""}`}
							onClick={() => onOpen(modal)}
						>
							{label}
						</button>
					</div>
				))}
			</MBox>

			{/* ============ M22: PSP Comparison ============ */}
			<MBox
				id="pspCompareModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-arrow-left-right me-2" />
						PSP Comparison
					</>
				}
				footer={actionFooter(
					"pspCompareModal",
					"Switch to T-Kash",
					"btnPmP",
					"Recommendation noted. Switching 18% volume to T-Kash.",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"pspCompareModal",
					<div className="table-responsive">
						<table className={styles.tbl}>
							<thead>
								<tr>
									<th>Feature</th>
									<th>M-Pesa</th>
									<th>Airtel Money</th>
									<th>T-Kash</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Fee (KES 10k)</td>
									<td>KES 25</td>
									<td>KES 20</td>
									<td>KES 15</td>
								</tr>
								<tr>
									<td>Success Rate</td>
									<td>99.98%</td>
									<td>99.71%</td>
									<td>99.4%</td>
								</tr>
								<tr>
									<td>Settlement</td>
									<td>T+0</td>
									<td>T+1</td>
									<td>T+0</td>
								</tr>
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ============ M23: Notifications ============ */}
			<MBox
				id="notifModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell me-2" />
						Notifications (14)
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					<div
						className={`${styles.summaryBoxDanger} mb-2`}
						style={{ fontSize: 13 }}
					>
						<strong>M-Pesa B2C batch failed</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							47 transactions • KES 1.24M
						</div>
					</div>
					<div
						className={`${styles.summaryBoxWarn} mb-2`}
						style={{ fontSize: 13 }}
					>
						<strong>Airtel API token expiring</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							Expires in 6 days
						</div>
					</div>
					<div className={styles.summaryBoxInfo} style={{ fontSize: 13 }}>
						<strong>Reconciliation completed</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							0 mismatches found
						</div>
					</div>
				</div>
			</MBox>

			{/* ============ M24: Profile ============ */}
			<MBox
				id="profileModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-circle me-2" />
						Profile
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className="text-center">
					<div
						className={`${styles.avatar} mx-auto mb-3`}
						style={{ width: 64, height: 64, fontSize: 24 }}
					>
						JK
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						james.kamau@email.com
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${styles.summaryBox} p-2`}>
								<span className={styles.mutedSmall}>Wallets</span>
								<br />
								<strong>12 linked</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${styles.summaryBox} p-2`}>
								<span className={styles.mutedSmall}>Health</span>
								<br />
								<strong style={{ color: "var(--pm-accent)" }}>97/100</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ============ M25: Pause Confirmation ============ */}
			<MBox
				id="pauseConfirmModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-pause-circle me-2"
							style={{ color: "var(--pm-warning)" }}
						/>
						Confirm Pause
					</>
				}
				footer={actionFooter(
					"pauseConfirmModal",
					"Pause",
					"btnPmD",
					"Wallet paused successfully.",
				)}
			>
				{actionBody(
					"pauseConfirmModal",
					<p>
						Are you sure you want to pause this wallet? All transfers will be
						blocked until resumed.
					</p>,
				)}
			</MBox>
		</>
	);
}
