"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/settlement.module.css";

/* ============================================================================
   Settlement & Clearing — modal layer (v2 with Font Awesome icons)
   All modals fully functional, responsive, no dead ends
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

function downloadFile(name: string, content: string, type = "text/plain") {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content], { type }));
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}

function MBox({ id, active, title, size = "md", onClose, children, footer }: MBoxProps) {
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

const BANKS_DEBIT = ["Equity Bank", "Co-operative Bank", "KCB Bank", "Absa Bank"];
const BANKS_CREDIT = ["KCB Bank", "Equity Bank", "NCBA", "Stanbic Bank"];
const PURPOSES = ["Interbank transfer", "Salary disbursement", "Supplier payment", "Government disbursement"];
const PRIORITIES = ["Normal", "Urgent (extra fee)", "Same-day guaranteed"];
const EXEC_TIMES = ["Immediate", "Next 30 minutes", "End of day", "Scheduled"];
const RETRY_REASONS = ["Network timeout", "Insufficient liquidity", "Technical error at receiving bank", "Other"];
const DISPUTE_REASONS = ["Amount mismatch", "Wrong beneficiary", "Duplicate settlement", "Failed but debited"];
const REPORT_TYPES = ["Daily Settlement Summary", "Weekly Performance", "Monthly Regulatory Return", "Fee Analysis"];
const REPORT_FORMATS = ["PDF", "Excel", "CSV"];
const RTGS_REASONS = ["Government disbursement deadline", "Salary payment deadline", "Regulatory deadline"];
const RULE_TYPES = ["Retry", "Escalation", "Deferral", "Routing", "Cut-off"];
const RULE_CHANNELS = ["RTGS", "PesaLink", "EFT / ACH", "SWIFT", "All channels"];
const RULE_HISTORY = [
	{ time: "27 Jun 14:02", rule: "Auto-retry failed RTGS", change: "Max attempts 3 → 5", user: "James K.", status: "Applied", tone: "badgeS" as BadgeTone },
	{ time: "26 Jun 09:30", rule: "Weekend batch deferral", change: "Paused by operator", user: "Grace M.", status: "Paused", tone: "badgeW" as BadgeTone },
	{ time: "25 Jun 17:12", rule: "Auto-escalate high-value disputes", change: "Threshold KES 5M → KES 10M", user: "James K.", status: "Applied", tone: "badgeS" as BadgeTone },
	{ time: "24 Jun 11:45", rule: "Auto-retry failed RTGS", change: "Rule created", user: "System", status: "Applied", tone: "badgeS" as BadgeTone },
	{ time: "23 Jun 08:20", rule: "Weekend batch deferral", change: "Hold window 06:00 → 08:00", user: "Ops Lead", status: "Applied", tone: "badgeS" as BadgeTone },
	{ time: "22 Jun 16:05", rule: "Cut-off auto-urgent flag", change: "Removed by operator", user: "Grace M.", status: "Removed", tone: "badgeD" as BadgeTone },
];

type ModalPermStatus = "granted" | "pending" | "required";
interface ModalBiz {
	id: string;
	name: string;
	type: string;
	customers: number;
	account: string;
	schedule: string;
	fee: string;
	avg: string;
	mix: string;
	float: number;
	minFloat: number;
	perms: { label: string; detail: string; status: ModalPermStatus }[];
}

const MODAL_BIZ: ModalBiz[] = [
	{
		id: "land",
		name: "Land Buyers LTD",
		type: "Real Estate",
		customers: 30,
		account: "Equity Bank • 01-2345678-0",
		schedule: "Weekly · Friday",
		fee: "1.25%",
		avg: "KES 1.9M",
		mix: "Bank 60% · M-Pesa 40%",
		float: 3200000,
		minFloat: 3000000,
		perms: [
			{ label: "Business KYC & onboarding docs", detail: "Registration, directors, tax PIN", status: "granted" },
			{ label: "API / integration scopes", detail: "Payment links, transactions, payouts", status: "granted" },
			{ label: "Settlement account ownership", detail: "Bank account name matches registration", status: "pending" },
			{ label: "Fee agreement", detail: "1.25% per transaction accepted", status: "granted" },
			{ label: "Payout schedule consent", detail: "Weekly · Friday cut-off", status: "granted" },
			{ label: "Auto-settle float rule", detail: "Refill when below KES 3M", status: "granted" },
			{ label: "Refund authority", detail: "Owner + 1 approver, max KES 2M", status: "granted" },
			{ label: "Data visibility scope", detail: "Customer statements & payment history", status: "granted" },
		],
	},
	{
		id: "company2",
		name: "Company 2",
		type: "Retail",
		customers: 209,
		account: "PayMo Wallet • BIZ-88213",
		schedule: "Daily",
		fee: "2.0%",
		avg: "KES 1,900",
		mix: "M-Pesa 78% · Card 22%",
		float: 640000,
		minFloat: 500000,
		perms: [
			{ label: "Business KYC & onboarding docs", detail: "Registration, directors, tax PIN", status: "granted" },
			{ label: "API / integration scopes", detail: "Payment links, transactions, payouts", status: "granted" },
			{ label: "Settlement account ownership", detail: "PayMo wallet verified", status: "granted" },
			{ label: "Fee agreement", detail: "2.0% per transaction accepted", status: "granted" },
			{ label: "Payout schedule consent", detail: "Daily automatic", status: "granted" },
			{ label: "Auto-settle float rule", detail: "Refill when below KES 500K", status: "granted" },
			{ label: "Refund authority", detail: "Auto-approve under KES 5K", status: "granted" },
			{ label: "Data visibility scope", detail: "Customer statements & payment history", status: "granted" },
		],
	},
];

type FlowKey = "init" | "recon" | "disp";
interface Result {
	msg: string;
	ref?: string;
}

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";

export default function SettlementModals({ active, onClose, onOpen }: ModalsProps) {
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<FlowKey, number>>({ init: 1, recon: 1, disp: 1 });
	const [channel, setChannel] = useState("RTGS");
	const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

	const [apiEnv, setApiEnv] = useState("Sandbox");
	const [bizSel, setBizSel] = useState("land");
	const [bizTab, setBizTab] = useState<"overview" | "perms" | "ledger">("overview");
	const [requested, setRequested] = useState<Record<string, boolean>>({});
	const [payoutWhen, setPayoutWhen] = useState("Now");

	const [initSourceType, setInitSourceType] = useState("Main Bank Accounts");
	const [initDestType, setInitDestType] = useState("External Bank Account");
	const [initAmount, setInitAmount] = useState("45000000");
	const [initRef, setInitRef] = useState("");
	const [initPurpose, setInitPurpose] = useState(PURPOSES[0]);

	const SOURCE_OPTIONS: Record<string, string[]> = {
		"Main Bank Accounts": BANKS_DEBIT,
		"Virtual Accounts": ["Agent Float VA", "Operations VA", "Payroll VA"],
		"Linked Cards": ["Corporate Visa ...4421", "Expense Card ...1102"],
		"Credit Lines": ["Overdraft Facility (KES 10M)", "Standby Line (KES 200M)"],
	};

	const DEST_OPTIONS: Record<string, string[]> = {
		"Internal PayMo Account": ["Main PayMo Pool", "Settlement Reserve", "Agent Commission Pool"],
		"External Bank Account": ["KCB Nostro", "Equity Vostro", "Stanbic Corporate"],
		"External PSP / Developer": ["Stripe API Gateway", "Cellulant Hub", "Dev Webhook Endpoint"],
	};

	const [rulesTab, setRulesTab] = useState<"active" | "create" | "history">("active");
	const [rules, setRules] = useState<{ id: number; name: string; type: string; channel: string; attempts: string; interval: string; threshold: string; on: boolean }[]>([
		{ id: 1, name: "Auto-retry failed RTGS", type: "Retry", channel: "RTGS", attempts: "3", interval: "15", threshold: "1,000,000", on: true },
		{ id: 2, name: "Auto-escalate high-value disputes", type: "Escalation", channel: "All channels", attempts: "1", interval: "0", threshold: "5,000,000", on: true },
		{ id: 3, name: "Weekend batch deferral", type: "Deferral", channel: "EFT / ACH", attempts: "1", interval: "0", threshold: "0", on: false },
	]);
	const [newRuleNote, setNewRuleNote] = useState("");

	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ init: 1, recon: 1, disp: 1 });
			setBusy(null);
			setChannel("RTGS");
			setRulesTab("active");
			setNewRuleNote("");
			setBizSel("land");
			setBizTab("overview");
			setRequested({});
			setApiEnv("Sandbox");
			setPayoutWhen("Now");
		}
	}, [active]);

	const busyTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(busyTimer.current), []);

	const doAction = (modalId: string, msg: string, ref?: string) => {
		setBusy(modalId);
		busyTimer.current = window.setTimeout(() => {
			setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }));
			setBusy(null);
		}, 1500);
	};

	const flowTotals: Record<FlowKey, number> = { init: 5, recon: 4, disp: 3 };
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

	const nf = (i: number) => {
		const el = pinRefs.current[i];
		if (el && el.value.length === 1) pinRefs.current[i + 1]?.focus();
	};

	const stepper = (key: FlowKey) => {
		const total = flowTotals[key];
		const current = flows[key];
		return (
			<div className={styles.stepper}>
				{Array.from({ length: total }, (_, i) => {
					const n = i + 1;
					const cls = n < current ? styles.stepDone : n === current ? styles.stepActive : "";
					return (
						<div key={n} className={styles.step} style={{ display: "contents" }}>
							<div className={`${styles.step} ${cls}`} style={{ display: "flex" }}>
								<div className={styles.stepN}>{n < current ? <i className="fa-solid fa-check" /> : n}</div>
								<div className={styles.stepL}>Step {n}</div>
							</div>
							{n < total && <div className={styles.stepLine} />}
						</div>
					);
				})}
			</div>
		);
	};

	const receipt = (modalId: string, r: Result) => (
		<div className={styles.receipt}>
			<div className={styles.ri}><i className="fa-solid fa-check" /></div>
			<h5 className={styles.receiptTitle}>{r.msg}</h5>
			{r.ref && <p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Reference: {r.ref}</p>}
			<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
				<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => downloadFile(`${modalId}-receipt.txt`, `${r.msg}${r.ref ? `\nReference: ${r.ref}` : ""}`)}>
					<i className="fa-solid fa-download" /> Save
				</button>
				<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>
					<i className="fa-solid fa-share-nodes" /> Continue
				</button>
			</div>
		</div>
	);

	const actionBody = (id: string, children: ReactNode) => <>{busy === id && <BusyOverlay />}{results[id] ? receipt(id, results[id]) : children}</>;

	const actionFooter = (id: string, label: string, tone: "btnPmP" | "btnPmD", msg: string, ref?: string) =>
		results[id] ? (
			<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
				Done
			</button>
		) : (
			<>
				<button className={styles.btnPm} onClick={onClose}>Cancel</button>
				<button className={`${styles.btnPm} ${styles[tone]}`} disabled={busy === id} onClick={() => doAction(id, msg, ref)}>
					{label}
				</button>
			</>
		);

	const flowFooter = (key: FlowKey) => (
		<>
			<button className={styles.btnPm} onClick={onClose}>Cancel</button>
			<button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === key} onClick={() => nextFlow(key)}>
				{flows[key] >= flowTotals[key] ? "Done" : busy === key ? (<><span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> Processing</>) : (<><>Continue</> <i className="fa-solid fa-arrow-right" /></>)}
			</button>
		</>
	);

	return (
		<>
			{/* M1: Initiate Settlement */}
			<MBox id="initiateSettlementModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-circle-plus me-2" style={{ color: "var(--pm-primary-light)" }} />Initiate Settlement</>} footer={flowFooter("init")}>
				{stepper("init")}
				{busy === "init" && <BusyOverlay />}
				{flows.init === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Source of Funds</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Funding Source Type</label>
								<select className={styles.fc} value={initSourceType} onChange={(e) => setInitSourceType(e.target.value)}>
									{Object.keys(SOURCE_OPTIONS).map((t) => <option key={t}>{t}</option>)}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Select Source</label>
								<select className={styles.fc}>{SOURCE_OPTIONS[initSourceType]?.map((o) => <option key={o}>{o}</option>)}</select>
							</div>
						</div>
					</div>
				)}
				{flows.init === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Destination & Amount</h6>
						<div className="row g-3">
							<div className="col-md-12">
								<label className={styles.fl}>Destination Routing</label>
								<div className={styles.pills}>
									{Object.keys(DEST_OPTIONS).map((type) => (
										<button key={type} className={`${styles.pill} ${initDestType === type ? styles.pillActive : ""}`} onClick={() => setInitDestType(type)}>{type}</button>
									))}
								</div>
							</div>
							<div className="col-md-12">
								<label className={styles.fl}>Select Receiver</label>
								<select className={styles.fc}>{DEST_OPTIONS[initDestType]?.map((o) => <option key={o}>{o}</option>)}</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Amount (KES)</label>
								<input className={styles.fc} value={initAmount} onChange={(e) => setInitAmount(e.target.value)} />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Developer / External Ref (Optional)</label>
								<input className={styles.fc} placeholder="e.g., ext-tx-9921" value={initRef} onChange={(e) => setInitRef(e.target.value)} />
							</div>
						</div>
					</div>
				)}
				{flows.init === 3 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: Purpose & Timing</h6>
						<div className="mb-3">
							<label className={styles.fl}>Settlement Channel</label>
							<div className={styles.pills}>
								{["RTGS", "PesaLink", "EFT", "Internal Ledger"].map((c) => (
									<button key={c} className={`${styles.pill} ${channel === c ? styles.pillActive : ""}`} onClick={() => setChannel(c)} disabled={initDestType === "Internal PayMo Account" && c !== "Internal Ledger"}>{c}</button>
								))}
							</div>
							{initDestType === "Internal PayMo Account" && <small style={{ color: "var(--pm-muted)", display: "block", marginTop: 4 }}>Internal accounts automatically default to Internal Ledger transfer.</small>}
						</div>
						<div className="row g-3">
							<div className="col-md-12">
								<label className={styles.fl}>Purpose</label>
								<select className={styles.fc} value={initPurpose} onChange={(e) => setInitPurpose(e.target.value)}>
									{PURPOSES.map((p) => <option key={p}>{p}</option>)}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Priority</label>
								<select className={styles.fc} defaultValue={PRIORITIES[0]}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Execution Time</label>
								<select className={styles.fc} defaultValue={EXEC_TIMES[0]}>{EXEC_TIMES.map((t) => <option key={t}>{t}</option>)}</select>
							</div>
						</div>
					</div>
				)}
				{flows.init === 4 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 4: Confirmation & Security</h6>
						<div className={`${styles.summaryBox} mb-3`}>
							{[["Source", initSourceType], ["Destination", initDestType], ["Amount", `KES ${Number(initAmount).toLocaleString()}`], ["Channel", initDestType === "Internal PayMo Account" ? "Internal Ledger" : channel], ["External Ref", initRef || "—"]].map(([k, v]) => (
								<div className="d-flex justify-content-between mb-1" key={k}><span>{k}</span><strong>{v}</strong></div>
							))}
						</div>
						<label className={styles.fl}>Authorizer PIN</label>
						<div className={styles.pinRow}>
							{[0, 1, 2, 3].map((i) => <input key={i} ref={(el) => { pinRefs.current[i] = el; }} type="password" maxLength={1} className={styles.pinInput} onInput={() => nf(i)} />)}
						</div>
					</div>
				)}
				{flows.init >= 5 && (
					<div className={`${styles.receipt} ${styles.fstepActive}`}>
						<div className={styles.ri}><i className="fa-solid fa-check" /></div>
						<h5 className={styles.receiptTitle}>Settlement Initiated</h5>
						<p className={styles.receiptSub}>Reference: <strong>SET-88424</strong> • Expected completion: 14:47 EAT</p>
					</div>
				)}
			</MBox>

			{/* M2: Settlement Detail */}
			<MBox id="settlementDetailModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-regular fa-file-lines me-2" />Settlement Details — SET-88421</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen("retrySettlementModal")}>Retry if Failed</button></>}>
				<div className="row g-3">
					<div className="col-md-6">
						<div className={styles.summaryBox}>
							{[["Reference", "SET-88421"], ["From", "Equity Bank"], ["To", "KCB Bank"], ["Amount", "KES 45,000,000"], ["Channel", "RTGS"]].map(([k, v]) => (
								<div className="d-flex justify-content-between mb-2" key={k}><span className={styles.mutedSmall}>{k}</span><strong>{v}</strong></div>
							))}
						</div>
					</div>
					<div className="col-md-6">
						<div className={styles.summaryBoxInfo}>
							<div className="d-flex justify-content-between mb-2"><span className={styles.mutedSmall}>Status</span><span className={`${styles.badge} ${styles.badgeI}`}>In Progress</span></div>
							{[["Initiated", "14:18 EAT"], ["ETA", "14:47 EAT"], ["Fee", "KES 2,250"]].map(([k, v]) => (
								<div className="d-flex justify-content-between mb-2" key={k}><span className={styles.mutedSmall}>{k}</span><strong>{v}</strong></div>
							))}
						</div>
					</div>
				</div>
				<div className="mt-3">
					<h6 style={{ fontWeight: 700 }}>Timeline</h6>
					{[["14:18", "Instruction received"], ["14:19", "Validation passed"], ["14:22", "Sent to CBK RTGS"], ["14:47 (expected)", "Settlement complete"]].map(([t, d]) => (
						<div className={styles.sr} key={t}><div><strong>{t}</strong> — {d}</div></div>
					))}
				</div>
			</MBox>

			{/* M3: Retry Settlement */}
			<MBox id="retrySettlementModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-rotate me-2" style={{ color: "var(--pm-warning)" }} />Retry Failed Settlement</>} footer={actionFooter("retrySettlementModal", "Retry Now", "btnPmP", "Retry initiated for 1 settlement. New reference: SET-88425", "SET-88425")}>
				{actionBody("retrySettlementModal", <>
					<div className="mb-3">
						<label className={styles.fl}>Select Failed Settlements</label>
						{[{ label: "SET-88423 • KES 8.4M • Absa → NCBA", checked: true }, { label: "SET-88419 • KES 12.1M • Co-op → Equity", checked: false }].map((c) => (
							<div className="form-check mb-2" key={c.label}><input className="form-check-input" type="checkbox" defaultChecked={c.checked} id={`retry-${c.label}`} /><label className="form-check-label" htmlFor={`retry-${c.label}`}>{c.label}</label></div>
						))}
					</div>
					<div className="mb-3">
						<label className={styles.fl}>Retry Reason</label>
						<select className={styles.fc} defaultValue={RETRY_REASONS[0]}>{RETRY_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
					</div>
					<div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}><i className="fa-solid fa-circle-info me-1" /> Retry will incur additional RTGS fee of KES 2,250 per transaction.</div>
				</>)}
			</MBox>

			{/* M4: Reconciliation Wizard */}
			<MBox id="reconciliationWizardModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-list-check me-2" style={{ color: "var(--pm-accent)" }} />Reconciliation Wizard</>} footer={flowFooter("recon")}>
				{stepper("recon")}
				{busy === "recon" && <BusyOverlay />}
				{flows.recon === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Select Batches</h6>
						{[{ label: "BAT-21092 • Equity Clearing • KES 184.2M", checked: true }, { label: "BAT-21093 • KCB Clearing • KES 67.8M", checked: true }, { label: "BAT-21094 • Co-op Clearing • KES 41.5M", checked: false }].map((c) => (
							<div className="form-check mb-2" key={c.label}><input className="form-check-input" type="checkbox" defaultChecked={c.checked} id={`recon-${c.label}`} /><label className="form-check-label" htmlFor={`recon-${c.label}`}>{c.label}</label></div>
						))}
					</div>
				)}
				{flows.recon === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Run Matching</h6>
						<div className={styles.summaryBoxInfo} style={{ background: "var(--pm-info-soft)" }}>
							<div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>Matching Engine Running...</div>
							<div className="progress mt-2" style={{ height: 6 }}><div className="progress-bar" style={{ width: "78%" }} /></div>
						</div>
						<div className={styles.sr}><div><strong>Matched</strong></div><strong>1,142 / 1,189</strong></div>
						<div className={styles.sr}><div><strong>Exceptions</strong></div><strong>47 items</strong></div>
					</div>
				)}
				{flows.recon === 3 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: Resolve Exceptions</h6>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead><tr><th>Item</th><th>Variance</th><th>Action</th></tr></thead>
								<tbody>
									<tr><td>TRX-99182</td><td>KES 12,400</td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("disputeModal")}>Create Dispute</button></td></tr>
									<tr><td>TRX-99183</td><td>KES 8,900</td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("partialSettlementModal")}>Partial Accept</button></td></tr>
								</tbody>
							</table>
						</div>
					</div>
				)}
				{flows.recon >= 4 && (
					<div className={`${styles.receipt} ${styles.fstepActive}`}>
						<div className={styles.ri}><i className="fa-solid fa-check" /></div>
						<h5 className={styles.receiptTitle}>Reconciliation Complete</h5>
						<p className={styles.receiptSub}>1,142 matched • 47 exceptions resolved • Report generated.</p>
					</div>
				)}
			</MBox>

			{/* M5: Dispute */}
			<MBox id="disputeModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-triangle-exclamation me-2" style={{ color: "var(--pm-warning)" }} />Raise Settlement Dispute</>} footer={flowFooter("disp")}>
				{stepper("disp")}
				{flows.disp === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Details</h6>
						<div className="row g-3">
							<div className="col-md-6"><label className={styles.fl}>Settlement Ref</label><input className={styles.fc} defaultValue="SET-88419" /></div>
							<div className="col-md-6"><label className={styles.fl}>Dispute Amount</label><input className={styles.fc} defaultValue="2700000" /></div>
							<div className="col-12"><label className={styles.fl}>Reason</label><select className={styles.fc} defaultValue={DISPUTE_REASONS[0]}>{DISPUTE_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
						</div>
					</div>
				)}
				{flows.disp === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Evidence</h6>
						<div className="mb-3"><label className={styles.fl}>Description</label><textarea className={styles.fc} rows={3} defaultValue="Expected credit of KES 67.8M but only KES 65.1M received. Difference of KES 2.7M." /></div>
						<div className="mb-3"><label className={styles.fl}>Upload Evidence</label><input type="file" className={styles.fc} /></div>
					</div>
				)}
				{flows.disp >= 3 && (
					<div className={`${styles.receipt} ${styles.fstepActive}`}>
						<div className={styles.ri}><i className="fa-solid fa-check" /></div>
						<h5 className={styles.receiptTitle}>Dispute Filed</h5>
						<p className={styles.receiptSub}>Case #SET-44901 created. Counterparty notified.</p>
					</div>
				)}
			</MBox>

			{/* M6: Batch Inbox */}
			<MBox id="batchInboxModal" active={active} size="xl" onClose={onClose} title={<><i className="fa-solid fa-inbox me-2" />Settlement Batch Inbox (47)</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={`${styles.pills} mb-3`}>
					{["All", "RTGS", "PesaLink", "EFT", "Urgent"].map((p, i) => <button key={p} className={`${styles.pill} ${i === 0 ? styles.pillActive : ""}`}>{p}</button>)}
				</div>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead><tr><th>Batch</th><th>Channel</th><th>Items</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
						<tbody>
							<tr><td>BAT-21092</td><td>RTGS</td><td>184</td><td>KES 184.2M</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Ready</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("initiateSettlementModal")}>Submit</button></td></tr>
							<tr><td>BAT-21093</td><td>PesaLink</td><td>892</td><td>KES 67.8M</td><td><span className={`${styles.badge} ${styles.badgeW}`}>Exception</span></td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("reconciliationWizardModal")}>Reconcile</button></td></tr>
						</tbody>
					</table>
				</div>
			</MBox>

			{/* M7: Auto Rules */}
			<MBox id="autoRulesModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-gear me-2" style={{ color: "var(--pm-warning)" }} />Automated Settlement Rules</>} footer={actionFooter("autoRulesModal", "Save Rules", "btnPmP", "Automation rules updated successfully.")}>
				{actionBody("autoRulesModal", <>
					<div className={`${styles.pills} mb-3`}>
						<button className={`${styles.pill} ${rulesTab === "active" ? styles.pillActive : ""}`} onClick={() => setRulesTab("active")}>Active Rules ({rules.length})</button>
						<button className={`${styles.pill} ${rulesTab === "create" ? styles.pillActive : ""}`} onClick={() => { setRulesTab("create"); setNewRuleNote(""); }}>Create New</button>
						<button className={`${styles.pill} ${rulesTab === "history" ? styles.pillActive : ""}`} onClick={() => setRulesTab("history")}>History</button>
					</div>
					{rulesTab === "active" && (
						<div>{rules.map((r) => (
							<div key={r.id} className={styles.ub} style={{ marginBottom: 10 }}>
								<div className="d-flex justify-content-between align-items-center mb-2 flex-wrap" style={{ gap: 8 }}><strong style={{ fontSize: 13 }}>{r.name}</strong><span className={`${styles.badge} ${r.on ? styles.badgeS : styles.badgeW}`}>{r.on ? "Active" : "Paused"}</span></div>
								<div className="row g-2">
									<div className="col-md-3"><label className={styles.fl} style={{ fontSize: 10 }}>Rule Type</label><select className={styles.fc} defaultValue={r.type}>{RULE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
									<div className="col-md-3"><label className={styles.fl} style={{ fontSize: 10 }}>Channel</label><select className={styles.fc} defaultValue={r.channel}>{RULE_CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
									<div className="col-md-2"><label className={styles.fl} style={{ fontSize: 10 }}>Max Attempts</label><input type="number" className={styles.fc} defaultValue={r.attempts} min={1} max={10} /></div>
									<div className="col-md-2"><label className={styles.fl} style={{ fontSize: 10 }}>Interval (min)</label><input type="number" className={styles.fc} defaultValue={r.interval} min={0} /></div>
									<div className="col-md-2"><label className={styles.fl} style={{ fontSize: 10 }}>Threshold (KES)</label><input className={styles.fc} defaultValue={r.threshold} /></div>
								</div>
								<div className="form-check form-switch mt-2"><input className="form-check-input" type="checkbox" defaultChecked={r.on} id={`rule-on-${r.id}`} /><label className="form-check-label" htmlFor={`rule-on-${r.id}`} style={{ fontSize: 12 }}>Enable rule</label></div>
							</div>
						))}</div>
					)}
					{rulesTab === "create" && (
						<form onSubmit={(e) => {
							e.preventDefault();
							const fd = new FormData(e.currentTarget);
							const name = String(fd.get("ruleName") || "Untitled rule");
							const type = String(fd.get("ruleType") || "Retry");
							const channel = String(fd.get("ruleChannel") || "RTGS");
							const threshold = String(fd.get("ruleThreshold") || "0");
							const attempts = String(fd.get("ruleAttempts") || "1");
							const interval = String(fd.get("ruleInterval") || "0");
							setRules((prev) => [...prev, { id: Date.now(), name, type, channel, attempts, interval, threshold, on: true }]);
							setNewRuleNote(`Rule "${name}" added to Active Rules. Click Save Rules to persist.`);
							setRulesTab("active");
						}}>
							<div className="row g-3">
								<div className="col-md-6"><label className={styles.fl}>Rule Name</label><input name="ruleName" className={styles.fc} placeholder="e.g. Auto-route failed RTGS to PesaLink" /></div>
								<div className="col-md-6"><label className={styles.fl}>Rule Type</label><select name="ruleType" className={styles.fc} defaultValue="Retry">{RULE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
								<div className="col-md-6"><label className={styles.fl}>Trigger Channel</label><select name="ruleChannel" className={styles.fc} defaultValue="RTGS">{RULE_CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
								<div className="col-md-6"><label className={styles.fl}>Min Amount Threshold (KES)</label><input name="ruleThreshold" className={styles.fc} placeholder="e.g. 1,000,000" /></div>
								<div className="col-md-4"><label className={styles.fl}>Max Attempts</label><input name="ruleAttempts" type="number" className={styles.fc} defaultValue={3} min={1} /></div>
								<div className="col-md-4"><label className={styles.fl}>Retry Interval (min)</label><input name="ruleInterval" type="number" className={styles.fc} defaultValue={15} min={0} /></div>
								<div className="col-md-4"><label className={styles.fl}>Action On Trigger</label><select className={styles.fc} defaultValue="Retry transaction"><option>Retry transaction</option><option>Escalate to Treasury Manager</option><option>Defer to next window</option><option>Route to PesaLink</option><option>Flag for manual review</option></select></div>
								<div className="col-12 d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 8 }}>
									<div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" defaultChecked id="rule-enable-new" /><label className="form-check-label" htmlFor="rule-enable-new" style={{ fontSize: 12 }}>Enable immediately</label></div>
									<button type="submit" className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`}><i className="fa-solid fa-plus" /> Add Rule</button>
								</div>
							</div>
						</form>
					)}
					{rulesTab === "history" && (
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead><tr><th>Time</th><th>Rule</th><th>Change</th><th>User</th><th>Status</th></tr></thead>
								<tbody>{RULE_HISTORY.map((h) => <tr key={h.time + h.rule}><td>{h.time}</td><td>{h.rule}</td><td>{h.change}</td><td>{h.user}</td><td><span className={`${styles.badge} ${styles[h.tone]}`}>{h.status}</span></td></tr>)}</tbody>
							</table>
						</div>
					)}
				</>)}
			</MBox>

			{/* M8: Nostro */}
			<MBox id="nostroModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-globe me-2" />Nostro/Vostro Account Management</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead><tr><th>Account</th><th>Bank</th><th>Currency</th><th>Balance</th><th>Last Movement</th><th>Action</th></tr></thead>
						<tbody>
							{[{ acct: "Nostro USD", bank: "Citibank NY", ccy: "USD", bal: "8,420,000", mov: "26 Jun 2025", action: "FX Settle", modal: "fxSettlementModal" }, { acct: "Nostro EUR", bank: "Deutsche Bank", ccy: "EUR", bal: "3,210,000", mov: "25 Jun 2025", action: "FX Settle", modal: "fxSettlementModal" }, { acct: "Vostro KES", bank: "Standard Chartered", ccy: "KES", bal: "124,500,000", mov: "27 Jun 2025", action: "Transfer", modal: "nostroTransferModal" }].map((n) => (
								<tr key={n.acct}><td>{n.acct}</td><td>{n.bank}</td><td>{n.ccy}</td><td><strong>{n.bal}</strong></td><td>{n.mov}</td><td><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen(n.modal)}>{n.action}</button></td></tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* M9: Compliance Report */}
			<MBox id="complianceReportModal" active={active} onClose={onClose} title={<><i className="fa-regular fa-file-lines me-2" />Regulatory Compliance Reports</>} footer={results.complianceReportModal ? (<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>) : (<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === "complianceReportModal"} onClick={() => doAction("complianceReportModal", "Report generated and submitted to CBK.", "CBK-20250627-001")}>Submit Pending Reports</button></>)}>
				{actionBody("complianceReportModal", <>
					{[{ title: "CBK Daily Settlement Return", sub: "27 Jun 2025 • Submitted 09:12", tone: styles.badgeS, status: "Submitted" }, { title: "KRA Withholding Tax", sub: "Due 29 Jun 2025", tone: styles.badgeW, status: "Pending" }, { title: "AML Large Transaction Report", sub: "26 Jun 2025 • Submitted", tone: styles.badgeS, status: "Submitted" }, { title: "FX Position Report", sub: "Monthly • Due 30 Jun", tone: styles.badgeW, status: "Pending" }].map((r) => (
						<div className={styles.sr} key={r.title}><div><strong>{r.title}</strong><div className={styles.mutedSmall}>{r.sub}</div></div><span className={`${styles.badge} ${r.tone}`}>{r.status}</span></div>
					))}
				</>)}
			</MBox>

			{/* Settlement Calendar */}
			<MBox id="settlementCalendarModal" active={active} onClose={onClose} title={<><i className="fa-regular fa-calendar me-2" />Settlement Calendar</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>June 2025 — RTGS cut-off 15:00 daily • PesaLink 24/7 • Weekend deferral active for non-urgent batches.</p>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead><tr><th>Date</th><th>RTGS</th><th>PesaLink</th><th>Notes</th></tr></thead>
						<tbody>
							<tr><td>27 Jun</td><td><span className={`${styles.badge} ${styles.badgeW}`}>Closing 47m</span></td><td>Open</td><td>High volume day</td></tr>
							<tr><td>28 Jun</td><td>Open</td><td>Open</td><td>Weekend deferral starts 18:00</td></tr>
						</tbody>
					</table>
				</div>
			</MBox>

			{/* FX Settlement */}
			<MBox id="fxSettlementModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-money-bill-transfer me-2" />FX Settlement</>} footer={actionFooter("fxSettlementModal", "Execute FX Settlement", "btnPmP", "FX settlement executed. KES 64,725,000 credited.", "FX-20250627-8841")}>
				{actionBody("fxSettlementModal", <>
					<div className="mb-3"><label className={styles.fl}>From Nostro</label><select className={styles.fc} defaultValue="USD Nostro (Citibank) — 8.42M"><option>USD Nostro (Citibank) — 8.42M</option></select></div>
					<div className="mb-3"><label className={styles.fl}>To KES Account</label><select className={styles.fc} defaultValue="PayMo KES Treasury"><option>PayMo KES Treasury</option></select></div>
					<div className="mb-3"><label className={styles.fl}>Amount (USD)</label><input className={styles.fc} defaultValue="500000" /></div>
					<div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}>Rate: 129.45 • Expected KES credit: 64,725,000</div>
				</>)}
			</MBox>

			{/* Health Check */}
			<MBox id="healthCheckModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-heart-pulse me-2" style={{ color: "var(--pm-danger)" }} />Settlement Health Check</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="row g-3 mb-1">
					{[{ value: "97", label: "HEALTH SCORE", bg: "var(--pm-accent-soft)", color: "var(--pm-accent)", labelColor: "#6ee7b7", big: true }, { value: "99.7%", label: "SUCCESS", bg: "var(--pm-info-soft)", color: "var(--pm-info)", labelColor: "#93c5fd" }, { value: "3", label: "EXCEPTIONS", bg: "var(--pm-warning-soft)", color: "var(--pm-warning)", labelColor: "#fcd34d" }, { value: "14", label: "BATCHES", bg: "var(--pm-purple-soft)", color: "var(--pm-purple)", labelColor: "#c4b5fd" }].map((t) => (
						<div className="col-md-3 col-6" key={t.label}><div className={styles.miniStat} style={{ background: t.bg }}><div className={styles.miniStatBig} style={{ color: t.color, fontSize: t.big ? 28 : 24 }}>{t.value}</div><div className={styles.miniStatLabel} style={{ color: t.labelColor }}>{t.label}</div></div></div>
					))}
				</div>
			</MBox>

			{/* Partial Settlement */}
			<MBox id="partialSettlementModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-scissors me-2" />Partial Settlement Resolution</>} footer={actionFooter("partialSettlementModal", "Accept Partial", "btnPmP", "Partial settlement accepted. Remaining KES 2.7M scheduled for tomorrow.")}>
				{actionBody("partialSettlementModal", <>
					<div className="mb-3"><label className={styles.fl}>Accept Partial Amount</label><input className={styles.fc} defaultValue="65100000" /></div>
					<div className="mb-3"><label className={styles.fl}>Reason for Partial</label><textarea className={styles.fc} rows={2} defaultValue="Receiving bank liquidity constraint. Balance to be settled tomorrow." /></div>
				</>)}
			</MBox>

			{/* Generate Report */}
			<MBox id="generateReportModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-download me-2" />Generate Settlement Report</>} footer={results.generateReportModal ? (<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>) : (<><button className={styles.btnPm} onClick={onClose}>Cancel</button><button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === "generateReportModal"} onClick={() => { downloadFile("paymo-settlement-report.csv", "ref,from,to,amount,channel,status\nSET-88421,Equity,KCB,45000000,RTGS,In Progress\nSET-88422,Co-op,Stanbic,12800000,PesaLink,Settled\nSET-88423,Absa,NCBA,8400000,RTGS,Retry\n", "text/csv"); doAction("generateReportModal", "Report generated successfully. Download started."); }}>Generate</button></>)}>
				{actionBody("generateReportModal", <>
					<div className="mb-3"><label className={styles.fl}>Report Type</label><select className={styles.fc} defaultValue={REPORT_TYPES[0]}>{REPORT_TYPES.map((r) => <option key={r}>{r}</option>)}</select></div>
					<div className="mb-3"><label className={styles.fl}>Date Range</label><div className="row g-2"><div className="col-6"><input type="date" className={styles.fc} defaultValue="2025-06-01" /></div><div className="col-6"><input type="date" className={styles.fc} defaultValue="2025-06-27" /></div></div></div>
					<div className="mb-3"><label className={styles.fl}>Format</label><select className={styles.fc} defaultValue={REPORT_FORMATS[0]}>{REPORT_FORMATS.map((f) => <option key={f}>{f}</option>)}</select></div>
				</>)}
			</MBox>

			{/* Engine Config */}
			<MBox id="engineConfigModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-microchip me-2" />Settlement Engine Configuration</>} footer={actionFooter("engineConfigModal", "Save Config", "btnPmP", "Engine configuration saved. Changes effective immediately.")}>
				{actionBody("engineConfigModal", <>
					<div className="mb-3"><label className={styles.fl}>Max Concurrent Settlements</label><input className={styles.fc} defaultValue="500" /></div>
					<div className="mb-3"><label className={styles.fl}>Auto-retry Attempts</label><input className={styles.fc} defaultValue="3" /></div>
					{["Enable weekend deferral", "Enable smart channel routing"].map((c) => (
						<div className="form-check mb-2" key={c}><input className="form-check-input" type="checkbox" defaultChecked id={`eng-${c}`} /><label className="form-check-label" htmlFor={`eng-${c}`}>{c}</label></div>
					))}
				</>)}
			</MBox>

			{/* Activity Log */}
			<MBox id="activityLogModal" active={active} size="xl" onClose={onClose} title={<><i className="fa-solid fa-clock-rotate-left me-2" />Full Settlement Activity Log</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead><tr><th>Time</th><th>Ref</th><th>Action</th><th>User</th><th>Result</th></tr></thead>
						<tbody>
							{[["14:32", "SET-88422", "Settlement completed", "System", "Success"], ["14:28", "SET-88421", "Submitted to RTGS", "James K.", "In Progress"], ["14:15", "BAT-21093", "Exception detected", "System", "Flagged"]].map((row) => (
								<tr key={row[1] + row[0]}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* PesaLink */}
			<MBox id="pesaLinkModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-link me-2" />PesaLink Clearing Management</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				{actionBody("pesaLinkModal", <>
					<div className={styles.sr}><div><strong>Current Window</strong></div><span className={`${styles.badge} ${styles.badgeS}`}>Open (Closes 17:00)</span></div>
					<div className={styles.sr}><div><strong>Transactions Processed</strong></div><strong>892 / 920</strong></div>
					<div className={styles.sr}><div><strong>Net Position</strong></div><strong className={styles.textAccent}>+KES 184M</strong></div>
					<div className="mb-1 mt-3"><label className={styles.fl}>Force Close Window</label><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD} w-100`} disabled={busy === "pesaLinkModal"} onClick={() => doAction("pesaLinkModal", "PesaLink window forced closed. Remaining 28 transactions moved to next window.")}>Force Close</button></div>
				</>)}
			</MBox>

			{/* RTGS Urgent */}
			<MBox id="rtgsUrgentModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-triangle-exclamation me-2" style={{ color: "var(--pm-danger)" }} />RTGS Urgent Submission</>} footer={actionFooter("rtgsUrgentModal", "Submit All Urgent", "btnPmD", "14 batches submitted with urgent flag. Additional fee: KES 31,500")}>
				{actionBody("rtgsUrgentModal", <>
					<div className={styles.summaryBoxDanger} style={{ marginBottom: 16 }}>
						<div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>RTGS cut-off in 47 minutes</div>
						<div style={{ fontSize: 12, color: "#dc2626" }}>14 batches (KES 92M) still pending submission.</div>
					</div>
					<div className="mb-3"><label className={styles.fl}>Priority Reason</label><select className={styles.fc} defaultValue={RTGS_REASONS[0]}>{RTGS_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
				</>)}
			</MBox>

			{/* Clearing Status */}
			<MBox id="clearingStatusModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-tower-broadcast me-2" />Live Clearing House Status</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				{[{ name: "PesaLink", status: "Operational", tone: styles.badgeS }, { name: "RTGS (CBK)", status: "Operational", tone: styles.badgeS }, { name: "ACH / EFT", status: "Degraded (High volume)", tone: styles.badgeW }, { name: "SWIFT", status: "Operational", tone: styles.badgeS }].map((c) => (
					<div className={styles.sr} key={c.name}><div><strong>{c.name}</strong></div><span className={`${styles.badge} ${c.tone}`}>{c.status}</span></div>
				))}
			</MBox>

			{/* Reconciliation Detail */}
			<MBox id="reconciliationDetailModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-list-check me-2" />Reconciliation Details — BAT-21092</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between mb-2"><span className={styles.mutedSmall}>Expected Credits</span><strong>184</strong></div>
					<div className="d-flex justify-content-between mb-2"><span className={styles.mutedSmall}>Actual Credits</span><strong>184</strong></div>
					<div className="d-flex justify-content-between"><span className={styles.mutedSmall}>Variance</span><span className={`${styles.badge} ${styles.badgeS}`}>0</span></div>
				</div>
			</MBox>

			{/* Profile */}
			<MBox id="profileModal" active={active} onClose={onClose} title={<><i className="fa-regular fa-user me-2" />Profile</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="text-center">
					<div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>james.kamau@paymo.co.ke · Treasury</p>
				</div>
			</MBox>

			{/* Attention */}
			<MBox id="attentionModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-circle-exclamation me-2" style={{ color: "var(--pm-warning)" }} />All Attention Items</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={styles.sr}><div><strong>High-value settlement failed</strong></div><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => onOpen("retrySettlementModal")}>Retry</button></div>
				<div className={styles.sr}><div><strong>RTGS cut-off in 47 minutes</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("rtgsUrgentModal")}>Prioritize</button></div>
				<div className={styles.sr}><div><strong>Dispute awaiting evidence</strong></div><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("disputeModal")}>Respond</button></div>
			</MBox>

			{/* Notifications */}
			<MBox id="notifModal" active={active} onClose={onClose} title={<><i className="fa-regular fa-bell me-2" />Notifications (7)</>} footer={<button className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={styles.summaryBoxDanger} style={{ fontSize: 13, marginBottom: 8 }}><strong>High-value settlement failed</strong><div style={{ fontSize: 11, color: "#fecaca" }}>SET-88423 • KES 8.4M</div></div>
				<div className={styles.summaryBoxWarn} style={{ fontSize: 13, marginBottom: 8 }}><strong>RTGS cut-off approaching</strong><div style={{ fontSize: 11, color: "#fde68a" }}>47 minutes remaining</div></div>
				<div className={styles.summaryBoxInfo} style={{ fontSize: 13, marginBottom: 8 }}><strong>Dispute evidence requested</strong><div style={{ fontSize: 11, color: "#93c5fd" }}>#SET-44892</div></div>
			</MBox>

			{/* Batch Upload */}
			<MBox id="batchUploadModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-upload me-2" />Bulk Settlement Upload</>} footer={actionFooter("batchUploadModal", "Upload & Validate", "btnPmP", "478 settlements uploaded and validated. Ready for submission.")}>
				{actionBody("batchUploadModal", <>
					<div className="mb-3"><label className={styles.fl}>Upload CSV/Excel</label><input type="file" className={styles.fc} /></div>
					<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}><i className="fa-solid fa-circle-info me-1" /> Template: Bank Code, Amount, Purpose, Reference. Max 500 rows per upload.</div>
				</>)}
			</MBox>

			{/* Nostro Transfer */}
			<MBox id="nostroTransferModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-arrows-left-right me-2" />Nostro Internal Transfer</>} footer={actionFooter("nostroTransferModal", "Execute Transfer", "btnPmP", "Internal transfer of USD 500,000 executed.", "NT-20250627-001")}>
				{actionBody("nostroTransferModal", <>
					<div className="mb-3"><label className={styles.fl}>From Account</label><select className={styles.fc} defaultValue="USD Nostro (Citibank) — 8.42M"><option>USD Nostro (Citibank) — 8.42M</option></select></div>
					<div className="mb-3"><label className={styles.fl}>To Account</label><select className={styles.fc} defaultValue="KES Treasury Account"><option>KES Treasury Account</option></select></div>
					<div className="mb-3"><label className={styles.fl}>Amount</label><input className={styles.fc} defaultValue="500000" /></div>
				</>)}
			</MBox>

			{/* Link Paymo API */}
			<MBox id="linkApiModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-plug me-2" style={{ color: "var(--pm-primary)" }} />Link Paymo API</>} footer={actionFooter("linkApiModal", "Save & Connect", "btnPmP", "Paymo connected successfully. Webhook verified.", "PYM-KEY-8841")}>
				{actionBody("linkApiModal", <>
					<div className="mb-3"><label className={styles.fl}>API Key</label><input className={styles.fc} type="password" placeholder="sk_live_••••••••••••••••" /></div>
					<div className="mb-3"><label className={styles.fl}>Environment</label><div className={styles.pills}>{["Sandbox", "Production"].map((e) => <button key={e} className={`${styles.pill} ${apiEnv === e ? styles.pillActive : ""}`} onClick={() => setApiEnv(e)}>{e}</button>)}</div></div>
					<div className="mb-3"><label className={styles.fl}>Webhook URL</label><input className={styles.fc} defaultValue="https://paymo.example.com/webhooks/settlement" /></div>
					<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}><i className="fa-solid fa-shield-halved me-1" /> Connecting enables: collecting customer payments, automated payouts, refunds and float rebalancing.</div>
				</>)}
			</MBox>

			{/* Linked Business Detail */}
			<MBox id="businessDetailModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-building me-2" style={{ color: "var(--pm-primary-light)" }} />Linked Business Details</>} footer={<><button className={styles.btnPm} onClick={onClose}>Close</button><button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("payoutModal")}><i className="fa-solid fa-paper-plane" /> New Payout</button><button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => onOpen("rebalanceModal")}><i className="fa-solid fa-rotate" /> Rebalance</button></>}>
				{(() => {
					const biz = MODAL_BIZ.find((b) => b.id === bizSel) ?? MODAL_BIZ[0];
					const granted = biz.perms.filter((p) => p.status === "granted" || requested[p.label]).length;
					const ledgerRows = biz.id === "land" ? [["Today 14:05", "Collection", "Installment • PLT-091", "KES 4,500,000", "Collected", "badgeS"], ["Today 13:20", "Refund", "Deposit • PLT-117", "KES 1,050,000", "Pending Approval", "badgeW"], ["Today 09:15", "Payout", "Weekly batch • WB-441", "KES 41,200,000", "Paid Out", "badgeS"]] : [["Today 14:32", "Collection", "Order • ORD-8901", "KES 12,400", "Collected", "badgeS"], ["Today 14:05", "Refund", "Order • ORD-8834", "KES 12,400", "Completed", "badgeS"], ["Today 08:30", "Payout", "Daily batch • DB-112", "KES 1,240,000", "Paid Out", "badgeS"]];
					return (
						<>
							<div className={`${styles.pills} mb-3`}>{MODAL_BIZ.map((b) => <button key={b.id} className={`${styles.pill} ${bizSel === b.id ? styles.pillActive : ""}`} onClick={() => setBizSel(b.id)}>{b.name} ({b.customers})</button>)}</div>
							<div className={`${styles.pills} mb-3`}>{(["overview", "perms", "ledger"] as const).map((t) => <button key={t} className={`${styles.pill} ${bizTab === t ? styles.pillActive : ""}`} onClick={() => setBizTab(t)}>{t === "overview" ? "Overview" : t === "perms" ? `Permissions (${granted}/8)` : "Ledger"}</button>)}</div>
							{bizTab === "overview" && (
								<div>
									<div className={`${styles.summaryBox} mb-3`}>
										{[["Business", biz.name], ["Type", biz.type], ["Customers", String(biz.customers)], ["Settlement account", biz.account], ["Payout schedule", biz.schedule], ["Fee", biz.fee], ["Avg transaction", biz.avg], ["Payment mix", biz.mix]].map(([k, v]) => (
											<div className="d-flex justify-content-between mb-1" key={k}><span className={styles.mutedSmall}>{k}</span><strong style={{ fontSize: 12 }}>{v}</strong></div>
										))}
									</div>
									<div className={styles.floatMeter}><span>Float</span><div className={styles.permBar}><div className={styles.floatFill} style={{ width: `${Math.min(100, (biz.float / biz.minFloat) * 100)}%` }} /></div><span>KES {(biz.float / 1e6).toFixed(2)}M / min KES {(biz.minFloat / 1e6).toFixed(1)}M</span></div>
								</div>
							)}
							{bizTab === "perms" && (
								<div>
									{biz.perms.map((p) => {
										const st = requested[p.label] ? "requested" : p.status;
										return (
											<div className={styles.permItem} key={p.label}>
												<span className={`${styles.permDot} ${st === "granted" ? styles.permOk : styles.permPending}`} />
												<div style={{ flex: 1 }}><div className={styles.fwBold13}>{p.label}</div><div className={styles.mutedSmall}>{p.detail}</div></div>
												{st === "granted" ? (<span className={`${styles.badge} ${styles.badgeS}`}>Granted</span>) : st === "requested" ? (<span className={`${styles.badge} ${styles.badgeI}`}>Requested</span>) : (<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => setRequested((prev) => ({ ...prev, [p.label]: true }))}>Request</button>)}
											</div>
										);
									})}
									<div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}><i className="fa-solid fa-circle-info me-1" /> {granted}/8 granted — the business is notified by email when you request a permission.</div>
								</div>
							)}
							{bizTab === "ledger" && (
								<div className="table-responsive">
									<table className={styles.tbl}>
										<thead><tr><th>Time</th><th>Type</th><th>Customer / Ref</th><th>Amount</th><th>Status</th></tr></thead>
										<tbody>{ledgerRows.map((r) => <tr key={r[0] + r[1]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><strong>{r[3]}</strong></td><td><span className={`${styles.badge} ${styles[r[4] as BadgeTone]}`}>{r[4]}</span></td></tr>)}</tbody>
									</table>
								</div>
							)}
						</>
					);
				})()}
			</MBox>

			{/* Rebalance Float */}
			<MBox id="rebalanceModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-rotate me-2" style={{ color: "var(--pm-accent)" }} />Rebalance Float</>} footer={actionFooter("rebalanceModal", "Rebalance Now", "btnPmP", "Rebalance initiated — float credited for auto-settlement.", "RB-102")}>
				{actionBody("rebalanceModal", <>
					<div className="mb-3"><label className={styles.fl}>Business</label><select className={styles.fc} defaultValue="Land Buyers LTD"><option>Land Buyers LTD</option><option>Company 2</option></select></div>
					<div className="mb-3"><label className={styles.fl}>Source Wallet</label><select className={styles.fc} defaultValue="Business Wallet — KES 4,820,000"><option>Business Wallet — KES 4,820,000</option><option>Virtual Wallet — KES 1,240,000</option></select></div>
					<div className="mb-3"><label className={styles.fl}>Amount (KES)</label><input className={styles.fc} defaultValue="3000000" /></div>
					<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}><i className="fa-solid fa-bolt me-1" /> Auto-settle uses this float to pay your customers instantly. Min float for Land Buyers LTD: KES 3,000,000.</div>
				</>)}
			</MBox>

			{/* Internal Transfer */}
			<MBox id="internalTransferModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-wallet me-2" style={{ color: "var(--pm-purple)" }} />My Wallets — Internal Transfer</>} footer={actionFooter("internalTransferModal", "Send Money", "btnPmP", "Internal transfer completed successfully.", "TW-9922")}>
				{actionBody("internalTransferModal", <>
					<div className="mb-3"><label className={styles.fl}>From Wallet</label><select className={styles.fc} defaultValue="Business Wallet — KES 4,820,000"><option>Business Wallet — KES 4,820,000</option><option>Virtual Wallet — KES 1,240,000</option></select></div>
					<div className="mb-3"><label className={styles.fl}>To</label><select className={styles.fc} defaultValue="Virtual Wallet"><option>Virtual Wallet</option><option>Business Float — Land Buyers LTD</option><option>Business Float — Company 2</option><option>Equity Bank • 01-2345678-0</option></select></div>
					<div className="row g-3 mb-3"><div className="col-md-7"><label className={styles.fl}>Amount (KES)</label><input className={styles.fc} defaultValue="150000" /></div><div className="col-md-5"><label className={styles.fl}>Reference</label><input className={styles.fc} placeholder="e.g. float top-up" /></div></div>
					<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}><i className="fa-solid fa-circle-info me-1" /> Transfers between your own wallets are instant and free. Bank transfers settle in 1–2 business days.</div>
				</>)}
			</MBox>

			{/* Wallet Top-Up */}
			<MBox id="walletTopUpModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-circle-plus me-2" style={{ color: "var(--pm-primary-light)" }} />Top Up Wallet</>} footer={actionFooter("walletTopUpModal", "Top Up", "btnPmP", "Wallet topped up. Funds available instantly.", "TU-552")}>
				{actionBody("walletTopUpModal", <>
					<div className="mb-3"><label className={styles.fl}>Wallet</label><select className={styles.fc} defaultValue="Business Wallet"><option>Business Wallet</option><option>Virtual Wallet</option></select></div>
					<div className="mb-3"><label className={styles.fl}>Amount (KES)</label><input className={styles.fc} defaultValue="500000" /></div>
					<div className="mb-3"><label className={styles.fl}>Funds From</label><select className={styles.fc} defaultValue="Linked Bank Account"><option>Linked Bank Account</option><option>Corporate Card •••• 4421</option></select></div>
					<div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}><i className="fa-solid fa-bolt me-1" /> Available immediately for payouts and float rebalancing.</div>
				</>)}
			</MBox>

			{/* Issue Refund */}
			<MBox id="refundModal" active={active} onClose={onClose} title={<><i className="fa-solid fa-rotate-left me-2" style={{ color: "var(--pm-warning)" }} />Issue Refund</>} footer={actionFooter("refundModal", "Issue Refund", "btnPmD", "Refund submitted for approval.", "RF-4413")}>
				{actionBody("refundModal", <>
					<div className="mb-3"><label className={styles.fl}>Business</label><select className={styles.fc} defaultValue="Company 2"><option>Company 2</option><option>Land Buyers LTD</option></select></div>
					<div className="row g-3 mb-3"><div className="col-md-6"><label className={styles.fl}>Customer</label><input className={styles.fc} placeholder="e.g. J. Otieno" /></div><div className="col-md-6"><label className={styles.fl}>Transaction Ref</label><input className={styles.fc} placeholder="e.g. ORD-8890" /></div></div>
					<div className="row g-3 mb-3"><div className="col-md-6"><label className={styles.fl}>Amount (KES)</label><input className={styles.fc} defaultValue="12400" /></div><div className="col-md-6"><label className={styles.fl}>Reason</label><select className={styles.fc} defaultValue="Customer returned item"><option>Customer returned item</option><option>Wrong item shipped</option><option>Service not provided</option><option>Duplicate charge</option><option>Other</option></select></div></div>
					<div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}><i className="fa-solid fa-circle-info me-1" /> Refunds over KES 5,000 require a second approver for this business.</div>
				</>)}
			</MBox>

			{/* New Payout */}
			<MBox id="payoutModal" active={active} size="lg" onClose={onClose} title={<><i className="fa-solid fa-paper-plane me-2" style={{ color: "var(--pm-info)" }} />New Payout</>} footer={actionFooter("payoutModal", "Schedule Payout", "btnPmP", "Payout scheduled. Receipt sent to the business.", "PO-9921")}>
				{actionBody("payoutModal", <>
					<div className="mb-3"><label className={styles.fl}>Business</label><select className={styles.fc} defaultValue="Land Buyers LTD"><option>Land Buyers LTD — KES 5,200,000 pending</option><option>Company 2 — KES 1,200,000 pending</option></select></div>
					<div className="mb-3"><label className={styles.fl}>When</label><div className={styles.pills}>{["Now", "Today", "Weekly"].map((w) => <button key={w} className={`${styles.pill} ${payoutWhen === w ? styles.pillActive : ""}`} onClick={() => setPayoutWhen(w)}>{w}</button>)}</div></div>
					<div className="row g-3 mb-3"><div className="col-md-6"><label className={styles.fl}>Amount (KES)</label><input className={styles.fc} defaultValue="5200000" /></div><div className="col-md-6"><label className={styles.fl}>Settlement Account</label><select className={styles.fc} defaultValue="Equity Bank • 01-2345678-0"><option>Equity Bank • 01-2345678-0</option><option>PayMo Wallet • BIZ-88213</option></select></div></div>
					<div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}>Fee 1.25% (KES 65,000) • Business receives KES 5,135,000</div>
				</>)}
			</MBox>
		</>
	);
}
