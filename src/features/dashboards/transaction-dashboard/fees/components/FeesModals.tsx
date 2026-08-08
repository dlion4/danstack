import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/fees.module.css";

/* ============================================================================
   Fee & Commission Management — modal layer (legacy page 1.15, 25 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; legacy showLoading 1400ms spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state; labeled steppers:
                          fee(4: Details/Pricing/Conditions/Done)
                          calc(3: Details/Breakdown/Done)
                          waiver(3: Details/Eligibility/Done)
                          settle(3: Select/Review/Done)
     calculateFee/advCalc → controlled inputs + live derived totals below
     cacheAndReset()    → useEffect on close resets flows + results
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

/* ---------- LEGACY BRIDGE: flows map from page JS ---------- */
type FlowKey = "fee" | "calc" | "waiver" | "settle";
const FLOWS: Record<
	FlowKey,
	{ total: number; labels: string[]; modal: string }
> = {
	fee: {
		total: 4,
		labels: ["Details", "Pricing", "Conditions", "Done"],
		modal: "addFeeRuleModal",
	},
	calc: {
		total: 3,
		labels: ["Details", "Breakdown", "Done"],
		modal: "feeCalculatorModal",
	},
	waiver: {
		total: 3,
		labels: ["Details", "Eligibility", "Done"],
		modal: "waiverModal",
	},
	settle: {
		total: 3,
		labels: ["Select", "Review", "Done"],
		modal: "settlementModal",
	},
};

const TXN_TYPES = [
	"M-Pesa collection",
	"Bank transfer payout",
	"International transfer",
	"Card settlement (USD)",
	"FX conversion",
	"Refund",
];
const FEE_TYPES = ["Percentage", "Fixed Amount", "Tiered"];
const WAIVER_TYPES = ["Hardship", "Promotional", "Regulatory", "Bulk discount"];
const SETTLEMENT_TYPES = [
	"Profit delivery — June 2025",
	"Business Wallet sweep",
	"Micro-profit instant delivery",
];
const REPORT_PERIODS = ["June 2025", "Q2 2025", "YTD 2025"];
const FORMATS = ["PDF", "Excel", "CSV"];
const EXEMPTION_TYPES = [
	"Regulatory (CBK)",
	"Government Disbursement",
	"Charity / NGO",
	"Staff Benefit",
];
const PARTNERS = [
	"Business Wallet (KES)",
	"Virtual Wallet (KES)",
	"External M-Pesa (0712…890)",
	"Equity Bank • 01-2345678-0",
];
const SETTLE_FREQS = ["Instant (any amount ≥ KES 2)", "Daily", "Weekly", "Monthly"];
const REGULATORS = [
	"CBK — Central Bank of Kenya",
	"KRA — Kenya Revenue Authority",
	"CAK — Competition Authority",
];
const HARDSHIP_REASONS = [
	"Medical emergency",
	"Job loss",
	"Natural disaster",
	"Other",
];
const ADV_TYPES = ["Money transfer", "International transfer", "Wallet to M-Pesa"];

interface Result {
	msg: string;
	ref?: string;
}

/* ---------- LEGACY BRIDGE: advCalc() — verbatim formula from page JS ----------
   base = amt*0.0085; Instant → 0.45%; Wallet → KES 25 flat; VAT 16%; network KES 50. */
function advCalc(amount: number, type: string) {
	let base = amount * 0.0085;
	if (type.includes("Instant")) base = amount * 0.0045;
	if (type.includes("Wallet")) base = 25;
	const vat = base * 0.16;
	const net = 50;
	return { base, vat, net, total: base + vat + net };
}

const fmt = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

export default function FeesModals({ active, onClose, onOpen }: ModalsProps) {
	/* ---------- doAction / nextFlow / busy state ---------- */
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<FlowKey, number>>({
		fee: 1,
		calc: 1,
		waiver: 1,
		settle: 1,
	});

	/* LEGACY BRIDGE: #advAmount oninput / #advType onchange → advCalc() */
	const [advAmount, setAdvAmount] = useState("500000");
	const [advType, setAdvType] = useState("Inter-bank Transfer");
	const adv = advCalc(parseFloat(advAmount) || 0, advType);

	/* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ fee: 1, calc: 1, waiver: 1, settle: 1 });
			setBusy(null);
			setAdvAmount("500000");
			setAdvType("Inter-bank Transfer");
		}
	}, [active]);

	const busyTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(busyTimer.current), []);

	/* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) — 1400ms as legacy ---------- */
	const doAction = (modalId: string, msg: string, ref?: string) => {
		setBusy(modalId);
		busyTimer.current = window.setTimeout(() => {
			setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }));
			setBusy(null);
		}, 1400);
	};

	/* ---------- LEGACY BRIDGE: nextFlow(key,total) with modalMap close ---------- */
	const nextFlow = (key: FlowKey) => {
		const f = FLOWS[key];
		const cur = flows[key];
		if (cur === f.total - 1) {
			setBusy(f.modal);
			busyTimer.current = window.setTimeout(() => {
				setFlows((prev) => ({ ...prev, [key]: f.total }));
				setBusy(null);
			}, 1400);
			return;
		}
		if (cur >= f.total) {
			onClose();
			return;
		}
		setFlows((prev) => ({ ...prev, [key]: cur + 1 }));
	};

	/* ---------- receipt (exact legacy doAction result body) ---------- */
	const receipt = (id: string) => {
		const r = results[id];
		if (!r) return null;
		return (
			<div className={styles.receipt}>
				<div className={styles.ri}>
					<i className="bi bi-check-lg" />
				</div>
				<h5 className={styles.receiptTitle}>{r.msg}</h5>
				{r.ref && <p className={styles.receiptSub}>Reference: {r.ref}</p>}
				<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
					<button
						className={`${styles.btnPm} ${styles.btnSm}`}
						onClick={() =>
							downloadFile(
								`${r.ref ?? "paymo-receipt"}.txt`,
								`PayMo — Fee & Commission Management\n${r.msg}${r.ref ? `\nReference: ${r.ref}` : ""}\nGenerated: ${new Date().toLocaleString()}`,
							)
						}
					>
						<i className="bi bi-download" /> Save
					</button>
					<button
						className={`${styles.btnPm} ${styles.btnSm}`}
						onClick={onClose}
					>
						<i className="bi bi-share" /> Continue
					</button>
				</div>
			</div>
		);
	};

	const actionBody = (id: string, form: ReactNode) => (
		<div style={{ position: "relative" }}>
			{busy === id && <BusyOverlay />}
			{results[id] ? receipt(id) : form}
		</div>
	);

	const BoxRow = ({
		label,
		value,
		last,
	}: {
		label: string;
		value: ReactNode;
		last?: boolean;
	}) => (
		<div className={`d-flex justify-content-between ${last ? "" : "mb-2"}`}>
			<span className={styles.mutedSmall}>{label}</span>
			<strong>{value}</strong>
		</div>
	);

	const actionFooter = (
		id: string,
		label: ReactNode,
		msg: string,
		ref?: string,
	) =>
		results[id] ? (
			<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
				Done
			</button>
		) : (
			<>
				<button className={styles.btnPm} onClick={onClose}>
					Cancel
				</button>
				<button
					className={`${styles.btnPm} ${styles.btnPmP}`}
					onClick={() => doAction(id, msg, ref)}
				>
					{label}
				</button>
			</>
		);

	/* ---------- flow stepper (legacy renderStepper) ---------- */
	const stepper = (key: FlowKey) => {
		const f = FLOWS[key];
		const cur = flows[key];
		return (
			<div className={styles.stepper}>
				{f.labels.map((l, i) => {
					const n = i + 1;
					return (
						<div key={l} style={{ display: "contents" }}>
							<div
								className={`${styles.step} ${n < cur ? styles.stepDone : ""} ${n === cur ? styles.stepActive : ""}`}
							>
								<div className={styles.stepN}>
									{n < cur ? <i className="bi bi-check" /> : n}
								</div>
								<div className={styles.stepL}>{l}</div>
							</div>
							{i < f.labels.length - 1 && <div className={styles.stepLine} />}
						</div>
					);
				})}
			</div>
		);
	};

	/* ---------- flow footer (legacy Continue → Done) ---------- */
	const flowFooter = (key: FlowKey, cancelLabel = "Cancel") => {
		const f = FLOWS[key];
		const cur = flows[key];
		return (
			<>
				<button className={styles.btnPm} onClick={onClose}>
					{cancelLabel}
				</button>
				<button
					className={`${styles.btnPm} ${styles.btnPmP}`}
					onClick={() => nextFlow(key)}
					disabled={busy === f.modal}
				>
					{cur >= f.total ? (
						"Done"
					) : (
						<>
							Continue <i className="bi bi-arrow-right" />
						</>
					)}
				</button>
			</>
		);
	};

	const complianceTiles = [
		{
			value: "98",
			label: "COMPLIANCE",
			vColor: "var(--pm-accent)",
			bg: "var(--pm-accent-soft)",
			big: true,
		},
		{
			value: "0",
			label: "OPEN ISSUES",
			vColor: "var(--pm-info)",
			bg: "var(--pm-info-soft)",
		},
		{
			value: "3",
			label: "RECOMMENDATIONS",
			vColor: "var(--pm-warning)",
			bg: "var(--pm-warning-soft)",
		},
		{
			value: "18",
			label: "MODELS REVIEWED",
			vColor: "var(--pm-purple)",
			bg: "var(--pm-purple-soft)",
		},
	];
	const complianceRows = [
		["CBK Fee Transparency", "15 Jun 2025", "15 Sep 2025"],
		["KRA Withholding Tax", "01 Jun 2025", "01 Jul 2025"],
		["Consumer Protection Act", "20 Jun 2025", "20 Sep 2025"],
	];
	const leaderboard: [
		string,
		string,
		string,
		string,
		string,
		"badgeS" | "badgeP",
	][] = [
		["1", "Installments (Land Buyers)", "KES 1.08M", "KES 864K", "Top", "badgeS"],
		["2", "Orders (Company 2)", "KES 256K", "KES 178K", "Top", "badgeS"],
		["3", "International transfers", "KES 98.4K", "KES 62.1K", "Rising", "badgeP"],
		["4", "Card settlements (USD)", "KES 176.8K", "KES 41.2K", "Rising", "badgeP"],
		["5", "FX conversions", "KES 86.4K", "KES 24.8K", "Steady", "badgeP"],
	];
	const attentionRows = [
		{
			title: "Profit pot above auto-deliver threshold",
			sub: "KES 25K rule — M-Pesa channel paused",
			label: "Review",
			modal: "partnerPayoutModal",
		},
		{
			title: "Company 2 break-even orders",
			sub: "12 orders covered by 2.0% charge — consider tiered",
			label: "Adjust",
			modal: "addFeeRuleModal",
		},
		{
			title: "International transfer fee rose 8%",
			sub: "1.5% + KES 150 — 24 this month",
			label: "View",
			modal: "feeReportModal",
		},
		{
			title: "Promo budget 78% used",
			sub: "0% fee month for 5 new buyers — consider top-up",
			label: "Adjust",
			modal: "editWaiverModal",
		},
	];
	const notifItems = [
		{
			box: "summaryBoxWarn",
			title: "Profit delivered — KES 84,500",
			sub: "Auto-channelled to Business Wallet.",
		},
		{
			box: "summaryBoxDanger",
			title: "M-Pesa channel paused",
			sub: "External wallet link needs verification.",
		},
		{
			box: "summaryBoxAccent",
			title: "Company 2 break-even orders",
			sub: "12 orders — consider tiered model.",
		},
		{
			box: "summaryBox",
			title: "Promo budget at 78%",
			sub: "Consider top-up.",
		},
	] as const;
	const notifSettingsRows: [string, boolean, boolean, boolean][] = [
		["Profit delivered", true, true, true],
		["PayMo fee changes", true, false, true],
		["Channel rule alerts", true, false, true],
		["Promo budget", true, true, false],
	];
	const tierPerfRows = [
		["Flat — Land Buyers", "3,240", "KES 1.08M", "91%", "+6%"],
		["Percentage — Company 2", "88,410", "KES 256K", "84%", "+11%"],
		["International transfers", "186", "KES 98.4K", "72%", "+8%"],
		["Card settlements (USD)", "4,120", "KES 176.8K", "78%", "+4%"],
	];
	const feeCompareRows: [
		string,
		string,
		string,
		string,
		string,
		"badgeS" | "badgeI" | "badgeW",
		boolean,
	][] = [
		["PayMo", "0.85%", "KES 25", "0.45%", "Best", "badgeS", true],
		["Bank A", "1.2%", "KES 35", "0.8%", "Average", "badgeI", false],
		["Bank B", "1.0%", "KES 30", "0.6%", "Average", "badgeI", false],
		["Mobile Money X", "1.5%", "KES 20", "1.0%", "Higher", "badgeW", false],
	];

	return (
		<>
			{/* ============ M1: New Fee Model (flow: fee, 4 steps) ============ */}
			<MBox
				id="addFeeRuleModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-circle"
							style={{ color: "var(--pm-info)" }}
						/>{" "}
						New Fee Model
					</>
				}
				footer={flowFooter("fee")}
			>
				<div style={{ position: "relative" }}>
					{busy === "addFeeRuleModal" && <BusyOverlay />}
					{stepper("fee")}
					{flows.fee === 1 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 1: Model Details
							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Apply To Business</label>
									<select className={styles.fc}>
										<option>Land Buyers LTD</option>
										<option>Company 2</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Service</label>
									<select className={styles.fc}>
										{TXN_TYPES.map((t) => (
											<option key={t}>{t}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Model Type</label>
									<select className={styles.fc}>
										{FEE_TYPES.map((t) => (
											<option key={t}>{t}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Effective Date</label>
									<input
										type="date"
										className={styles.fc}
										defaultValue="2025-08-01"
									/>
								</div>
							</div>
						</div>
					)}
					{flows.fee === 2 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 2: Your Charge
							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Charge (rate or amount)</label>
									<input className={styles.fc} defaultValue="2.0" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Unit</label>
									<select className={styles.fc}>
										<option>% of transaction</option>
										<option>KES fixed per txn</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Minimum Fee</label>
									<input className={styles.fc} defaultValue="10" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Maximum Fee</label>
									<input className={styles.fc} defaultValue="5000" />
								</div>
							</div>
							<div
								className={`${styles.summaryBoxInfo} mt-3`}
								style={{ fontSize: 12 }}
							>
								<i className="bi bi-info-circle me-1" /> Preview: KES 100,000 order = you charge
								KES 2,000 → PayMo takes KES 1,280 → you keep KES 720
							</div>
						</div>
					)}
					{flows.fee === 3 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 3: Conditions &amp; Delivery
							</h6>
							<div className="mb-3">
								<label className={styles.fl}>Applicable To</label>
								{[
									{ label: "All customers of this business", on: true },
									{ label: "New customers only (promo)", on: false },
									{ label: "Diaspora buyers only", on: false },
								].map((s, i) => (
									<div
										className={`form-check ${i < 2 ? "mb-1" : ""}`}
										key={s.label}
									>
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked={s.on}
											id={`seg-${i}`}
										/>
										<label className="form-check-label" htmlFor={`seg-${i}`}>
											{s.label}
										</label>
									</div>
								))}
							</div>
							<div className="form-check form-switch mb-3">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
									id="fee-approval"
								/>
								<label className="form-check-label" htmlFor="fee-approval">
									Auto-channel profit to my wallet when collected
								</label>
							</div>
						</div>
					)}
					{flows.fee === 4 && (
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Fee Model Applied</h5>
							<p className={styles.receiptSub}>
								Model FM-448 applied to Company 2 — profit auto-channels to your
								wallet.
							</p>
						</div>
					)}
				</div>
			</MBox>

			{/* ============ M2: Edit Fee Rule ============ */}
			<MBox
				id="editFeeRuleModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-pencil" style={{ color: "var(--pm-info)" }} />{" "}
						Edit Fee Rule
					</>
				}
				footer={actionFooter(
					"editFeeRuleModal",
					"Save Changes",
					"Fee rule updated successfully. Changes take effect immediately.",
				)}
			>
				{actionBody(
					"editFeeRuleModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Model</label>
							<input
								className={styles.fc}
								defaultValue="Land Buyers — Flat KES 1,250"
							/>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Rate</label>
								<input className={styles.fc} defaultValue="0.50" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Max Fee</label>
								<input className={styles.fc} defaultValue="2500" />
							</div>
						</div>
						<div className="mb-3 mt-3">
							<label className={styles.fl}>Expiry Date</label>
							<input
								type="date"
								className={styles.fc}
								defaultValue="2025-07-05"
							/>
						</div>
						<div className="form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="fee-active"
							/>
							<label className="form-check-label" htmlFor="fee-active">
								Active
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M3: Fee Calculator (flow: calc, 3 steps) ============ */}
			<MBox
				id="feeCalculatorModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-calculator"
							style={{ color: "var(--pm-info)" }}
						/>{" "}
						Advanced Fee Calculator
					</>
				}
				footer={flowFooter("calc", "Close")}
			>
				<div style={{ position: "relative" }}>
					{busy === "feeCalculatorModal" && <BusyOverlay />}
					{stepper("calc")}
					{flows.calc === 1 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 1: Transaction Details
							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>From Account</label>
									<select className={styles.fc}>
										<option>PayMo Wallet — KES 24,500</option>
										<option>Equity Bank ****4521</option>
										<option>KCB M-Pesa</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>To Account</label>
									<select className={styles.fc}>
										<option>Equity Bank ****7788</option>
										<option>Co-op Bank ****9910</option>
										<option>PayMo Wallet</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Amount (KES)</label>
									{/* LEGACY BRIDGE: #advAmount oninput → advCalc() */}
									<input
										className={styles.fc}
										value={advAmount}
										onChange={(e) => setAdvAmount(e.target.value)}
										inputMode="numeric"
									/>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Transaction Type</label>
									{/* LEGACY BRIDGE: #advType onchange → advCalc() */}
									<select
										className={styles.fc}
										value={advType}
										onChange={(e) => setAdvType(e.target.value)}
									>
										{ADV_TYPES.map((t) => (
											<option key={t}>{t}</option>
										))}
									</select>
								</div>
							</div>
						</div>
					)}
					{flows.calc === 2 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 2: Fee Breakdown
							</h6>
							<div className={`${styles.summaryBox} mb-3`}>
								<div className="d-flex justify-content-between mb-2">
									<span>
										Base Fee (
										{advType.includes("Instant")
											? "0.45"
											: advType.includes("Wallet")
												? "flat"
												: "0.85"}
										%)
									</span>
									<strong>{fmt(adv.base)}</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span>VAT (16%)</span>
									<strong>{fmt(adv.vat)}</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span>Network Fee</span>
									<strong>{fmt(adv.net)}</strong>
								</div>
								<hr className={styles.divider} />
								<div className="d-flex justify-content-between">
									<span className={styles.fwBold13}>Total Cost</span>
									<strong
										className={styles.textAccent}
										style={{ fontSize: 18 }}
									>
										{fmt(adv.total)}
									</strong>
								</div>
							</div>
							<div className={styles.summaryBoxAccent} style={{ fontSize: 12 }}>
								<i className="bi bi-lightbulb me-1" /> You save KES 1,200
								compared to average market rate.
							</div>
						</div>
					)}
					{flows.calc === 3 && (
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Fee Calculated</h5>
							<p className={styles.receiptSub}>
								Transaction cost preview complete. Ready to execute.
							</p>
						</div>
					)}
				</div>
			</MBox>

			{/* ============ M4: Add Tier to Tiered Model ============ */}
			<MBox
				id="addCommissionTierModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-layers" style={{ color: "var(--pm-accent)" }} />{" "}
						Add Tier to Tiered Model
					</>
				}
				footer={actionFooter(
					"addCommissionTierModal",
					"Create Tier",
					"Tier added to the tiered model successfully!",
					"TIER-013",
				)}
			>
				{actionBody(
					"addCommissionTierModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Business / Model</label>
							<select className={styles.fc}>
								<option>Company 2 — Tiered</option>
								<option>Land Buyers LTD — Tiered</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Tier Name</label>
							<input className={styles.fc} defaultValue="Band 2 — orders ≥ KES 50K" />
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Volume Threshold (KES)</label>
								<input className={styles.fc} defaultValue="50000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Charge Rate</label>
								<input className={styles.fc} defaultValue="1.5" />
							</div>
						</div>
						<div className="mb-3 mt-3">
							<label className={styles.fl}>Tier Benefits</label>
							{[
								{ label: "Applies above threshold", on: true },
								{ label: "Shown to customer at checkout", on: true },
								{ label: "Excluded from discount promos", on: false },
							].map((b, i) => (
								<div
									className={`form-check ${i < 2 ? "mb-1" : ""}`}
									key={b.label}
								>
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked={b.on}
										id={`ct-${i}`}
									/>
									<label className="form-check-label" htmlFor={`ct-${i}`}>
										{b.label}
									</label>
								</div>
							))}
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M5: Edit Commission ============ */}
			<MBox
				id="editCommissionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-pencil" style={{ color: "var(--pm-accent)" }} />{" "}
						Edit Commission Tier
					</>
				}
				footer={actionFooter(
					"editCommissionModal",
					"Save Changes",
					"Commission tier updated successfully!",
				)}
			>
				{actionBody(
					"editCommissionModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Tier</label>
							<input className={styles.fc} defaultValue="Band 2 — orders ≥ KES 50K" />
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Volume Threshold</label>
								<input className={styles.fc} defaultValue="2000000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Rate</label>
								<input className={styles.fc} defaultValue="1.4" />
							</div>
						</div>
						<div className="mb-3 mt-3">
							<label className={styles.fl}>Status</label>
							<select className={styles.fc}>
								<option>Active</option>
								<option>Paused</option>
								<option>Archived</option>
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M6: Waiver (flow: waiver, 3 steps) ============ */}
			<MBox
				id="waiverModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gift" style={{ color: "var(--pm-warning)" }} />{" "}
						Create Fee Waiver
					</>
				}
				footer={flowFooter("waiver")}
			>
				<div style={{ position: "relative" }}>
					{busy === "waiverModal" && <BusyOverlay />}
					{stepper("waiver")}
					{flows.waiver === 1 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 1: Waiver Details
							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Waiver Name</label>
									<input
										className={styles.fc}
										defaultValue="0% promo — 5 new buyers"
									/>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Type</label>
									<select className={styles.fc}>
										{WAIVER_TYPES.map((t) => (
											<option key={t}>{t}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Discount</label>
									<input className={styles.fc} defaultValue="100" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Budget (KES)</label>
									<input className={styles.fc} defaultValue="5000000" />
								</div>
							</div>
						</div>
					)}
					{flows.waiver === 2 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 2: Eligibility
							</h6>
							<div className="mb-3">
								<label className={styles.fl}>Eligible Segments</label>
								{[										{ label: "All customers of the business", on: true },
										{ label: "New customers only (promo)", on: false },
										{ label: "Diaspora buyers only", on: false },
								].map((s, i) => (
									<div
										className={`form-check ${i < 2 ? "mb-1" : ""}`}
										key={s.label}
									>
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked={s.on}
											id={`wseg-${i}`}
										/>
										<label className="form-check-label" htmlFor={`wseg-${i}`}>
											{s.label}
										</label>
									</div>
								))}
							</div>
							<div className="mb-3">
								<label className={styles.fl}>Valid Until</label>
								<input
									type="date"
									className={styles.fc}
									defaultValue="2025-09-30"
								/>
							</div>
						</div>
					)}
					{flows.waiver === 3 && (
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Waiver Created</h5>
							<p className={styles.receiptSub}>
								WV-118 — 0% promo for 5 new buyers is now active.
							</p>
						</div>
					)}
				</div>
			</MBox>

			{/* ============ M7: Edit Waiver ============ */}
			<MBox
				id="editWaiverModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-pencil"
							style={{ color: "var(--pm-warning)" }}
						/>{" "}
						Edit Waiver
					</>
				}
				footer={actionFooter(
					"editWaiverModal",
					"Save Changes",
					"Waiver updated successfully!",
				)}
			>
				{actionBody(
					"editWaiverModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Waiver</label>
							<input
								className={styles.fc}
								defaultValue="WV-101 — 0% promo new buyers"
							/>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Discount %</label>
								<input className={styles.fc} defaultValue="100" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Remaining Budget</label>
								<input className={styles.fc} defaultValue="1100000" />
							</div>
						</div>
						<div className="mb-3 mt-3">
							<label className={styles.fl}>Status</label>
							<select className={styles.fc}>
								<option>Active</option>
								<option>Paused</option>
								<option>Expired</option>
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M8: Profit Pot Delivery (flow: settle, 3 steps) ============ */}
			<MBox
				id="settlementModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-cash-stack"
							style={{ color: "var(--pm-purple)" }}
						/>{" "}
						Profit Pot Delivery
					</>
				}
				footer={flowFooter("settle")}
			>
				<div style={{ position: "relative" }}>
					{busy === "settlementModal" && <BusyOverlay />}
					{stepper("settle")}
					{flows.settle === 1 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 1: Select Delivery
							</h6>
							<div className="mb-3">
								<label className={styles.fl}>Delivery Type</label>
								<select className={styles.fc}>
									{SETTLEMENT_TYPES.map((t) => (
										<option key={t}>{t}</option>
									))}
								</select>
							</div>
							<div className={styles.summaryBox}>
								<div className="d-flex justify-content-between mb-2">
									<span>Pot Balance</span>
									<strong>KES 1,342,000</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span>Pending (this batch)</span>
									<strong>KES 84,500</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span>Status</span>
									<span className={`${styles.badge} ${styles.badgeW}`}>
										Ready to deliver
									</span>
								</div>
							</div>
						</div>
					)}
					{flows.settle === 2 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 2: Review &amp; Approve
							</h6>
							<div className="table-responsive">
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Source</th>
											<th>Profit</th>
											<th>Channel</th>
										</tr>
									</thead>
									<tbody>
										{[
											["CHG-4401 — Land Buyers", "KES 18,750", "Business Wallet"],
											["CHG-4403 — Company 2", "KES 241", "Business Wallet"],
											["FX conversions", "KES 24,800", "Business Wallet"],
										].map(([a, v, c]) => (
											<tr key={a}>
												<td>{a}</td>
												<td>{v}</td>
												<td>{c}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="form-check mt-3">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
									id="settle-approve"
								/>
								<label className="form-check-label" htmlFor="settle-approve">
									I approve this profit delivery batch
								</label>
							</div>
						</div>
					)}
					{flows.settle === 3 && (
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Profit Delivered</h5>
							<p className={styles.receiptSub}>
								KES 84,500 delivered to your Business Wallet. Reference:
								POT-20250808-9914
							</p>
						</div>
					)}
				</div>
			</MBox>

			{/* ============ M9: Compliance Check ============ */}
			<MBox
				id="complianceCheckModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-check"
							style={{ color: "var(--pm-accent)" }}
						/>{" "}
						Compliance Health Check
					</>
				}
				footer={actionFooter(
					"complianceCheckModal",
					"Download Report",
					"Full compliance report downloaded.",
				)}
			>
				{actionBody(
					"complianceCheckModal",
					<>
						<div className="row g-3 mb-3">
							{complianceTiles.map((t) => (
								<div className="col-md-3 col-6" key={t.label}>
									<div className={styles.miniStat} style={{ background: t.bg }}>
										<div
											className={t.big ? styles.miniStatBig : undefined}
											style={
												t.big
													? { color: t.vColor }
													: { fontSize: 24, fontWeight: 700, color: t.vColor }
											}
										>
											{t.value}
										</div>
										<div className={styles.miniStatLabel}>{t.label}</div>
									</div>
								</div>
							))}
						</div>
						<div
							className={`${styles.summaryBoxAccent} mb-3`}
							style={{ fontSize: 13 }}
						>
							<i className="bi bi-check-circle me-1" /> All fee disclosure
							requirements met. No regulatory breaches detected.
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Regulation</th>
										<th>Status</th>
										<th>Last Audit</th>
										<th>Next Due</th>
									</tr>
								</thead>
								<tbody>
									{complianceRows.map(([r, l, n]) => (
										<tr key={r}>
											<td>{r}</td>
											<td>
												<span className={`${styles.badge} ${styles.badgeS}`}>
													Compliant
												</span>
											</td>
											<td>{l}</td>
											<td>{n}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M10: Fee Report ============ */}
			<MBox
				id="feeReportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-earmark-bar-graph" /> Fee Revenue Report
					</>
				}
				footer={actionFooter(
					"feeReportModal",
					"Generate Report",
					"Fee revenue report generated and downloading...",
				)}
			>
				{actionBody(
					"feeReportModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Report Period</label>
							<select className={styles.fc}>
								{REPORT_PERIODS.map((p) => (
									<option key={p}>{p}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Format</label>
							<select className={styles.fc}>
								{FORMATS.map((f) => (
									<option key={f}>{f}</option>
								))}
							</select>
						</div>
						<div className={styles.summaryBox} style={{ fontSize: 13 }}>
							<div className="d-flex justify-content-between mb-2">
								<span>Inter-bank Fees</span>
								<strong>KES 7.16M</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Wallet Fees</span>
								<strong>KES 3.12M</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Instant Fees</span>
								<strong>KES 6.84M</strong>
							</div>
							<hr className={styles.divider} />
							<div className="d-flex justify-content-between">
								<span className={styles.fwBold13}>Total Revenue</span>
								<strong className={styles.textAccent}>KES 18.4M</strong>
							</div>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M11: Agent Leaderboard ============ */}
			<MBox
				id="agentLeaderboardModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-trophy"
							style={{ color: "var(--pm-warning)" }}
						/>{" "}
						Profit by Service
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
								<th>Rank</th>
								<th>Service</th>
								<th>Charges</th>
								<th>Profit</th>
								<th>Trend</th>
							</tr>
						</thead>
						<tbody>
							{leaderboard.map(([rk, a, v, c, t, tone]) => (
								<tr key={rk}>
									<td>{rk}</td>
									<td>{a}</td>
									<td>{v}</td>
									<td>{c}</td>
									<td>
										<span className={`${styles.badge} ${styles[tone]}`}>
											{t}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M12: Exemption ============ */}
			<MBox
				id="exemptionModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield" /> Fee Exemptions
					</>
				}
				footer={actionFooter(
					"exemptionModal",
					"Create Exemption",
					"Exemption rule created successfully!",
				)}
			>
				{actionBody(
					"exemptionModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Exemption Type</label>
							<select className={styles.fc}>
								{EXEMPTION_TYPES.map((t) => (
									<option key={t}>{t}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Applicable Transactions</label>
							{[
								{ label: "All government-to-citizen payments", on: true },
								{ label: "Salary disbursements", on: true },
								{ label: "Charity donations", on: false },
							].map((t, i) => (
								<div
									className={`form-check ${i < 2 ? "mb-1" : ""}`}
									key={t.label}
								>
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked={t.on}
										id={`ex-${i}`}
									/>
									<label className="form-check-label" htmlFor={`ex-${i}`}>
										{t.label}
									</label>
								</div>
							))}
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M13: Attention Full ============ */}
			<MBox
				id="attentionFullModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-circle"
							style={{ color: "var(--pm-warning)" }}
						/>{" "}
						All Items Requiring Attention
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				{attentionRows.map((r) => (
					<div className={styles.sr} key={r.title}>
						<div>
							<strong>{r.title}</strong>
							<div className={styles.mutedSmall}>{r.sub}</div>
						</div>
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => onOpen(r.modal)}
						>
							{r.label}
						</button>
					</div>
				))}
			</MBox>

			{/* ============ M14: Fee Notifications ============ */}
			<MBox
				id="feeNotifModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell" /> Fee Notifications (7)
					</>
				}
				footer={
					<>
						<button
							className={styles.btnPm}
							onClick={() => onOpen("notifSettingsModal")}
						>
							Settings
						</button>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
					</>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					{notifItems.map((n) => (
						<div
							key={n.title}
							className={`${styles[n.box]} mb-2`}
							style={{ fontSize: 13 }}
						>
							<strong>{n.title}</strong>
							<div className={styles.mutedSmall}>{n.sub}</div>
						</div>
					))}
				</div>
			</MBox>

			{/* ============ M15: Profile ============ */}
			<MBox
				id="profileModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-circle" /> Profile
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
					<h5
						className={styles.fwBold13}
						style={{ fontSize: 16, marginBottom: 2 }}
					>
						Jckonia Kamau
					</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						james.kamau@paymo.co.ke
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className={styles.mutedSmall}>Role</span>
								<br />
								<strong>Account Holder</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className={styles.mutedSmall}>Fee Rules Managed</span>
								<br />
								<strong>47</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ============ M16: Notification Settings ============ */}
			<MBox
				id="notifSettingsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear" /> Notification Preferences
					</>
				}
				footer={actionFooter(
					"notifSettingsModal",
					"Save",
					"Notification preferences saved!",
				)}
			>
				{actionBody(
					"notifSettingsModal",
					<div className="table-responsive">
						<table className={styles.tbl}>
							<thead>
								<tr>
									<th>Alert Type</th>
									<th>Push</th>
									<th>SMS</th>
									<th>Email</th>
								</tr>
							</thead>
							<tbody>
								{notifSettingsRows.map(([label, push, sms, email]) => (
									<tr key={label}>
										<td>{label}</td>
										{[push, sms, email].map((v, i) => (
											<td key={i}>
												<input
													type="checkbox"
													defaultChecked={v}
													aria-label={`${label} channel ${i + 1}`}
												/>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>,
				)}
			</MBox>

			{/* ============ M17: Policy Config ============ */}
			<MBox
				id="policyConfigModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-earmark-text" /> Fee Policy Configuration
					</>
				}
				footer={actionFooter(
					"policyConfigModal",
					"Save Policy",
					"Policy updated successfully!",
				)}
			>
				{actionBody(
					"policyConfigModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Policy Name</label>
							<input
								className={styles.fc}
								defaultValue="Standard Transaction Fee Policy 2025"
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Effective From</label>
							<input
								type="date"
								className={styles.fc}
								defaultValue="2025-01-01"
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Review Cycle</label>
							<select className={styles.fc}>
								<option>Quarterly</option>
								<option>Bi-annually</option>
								<option>Annually</option>
							</select>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="policy-board"
							/>
							<label className="form-check-label" htmlFor="policy-board">
								Require board approval for changes &gt;10%
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M18: Audit Detail ============ */}
			<MBox
				id="auditDetailModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-text" /> Audit Log Detail
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className={styles.summaryBox} style={{ fontSize: 13 }}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Action ID</span>
						<strong>AUD-20250626-8812</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>User</span>
						<strong>Jckonia K.</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>IP Address</span>
						<strong>102.68.45.112</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Timestamp</span>
						<strong>26 Jun 2025, 14:22 EAT</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Changes</span>
						<strong>FR-415 rate: 0.75% → 0.50%</strong>
					</div>
				</div>
			</MBox>

			{/* ============ M19: Bulk Upload ============ */}
			<MBox
				id="bulkUploadModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-upload" /> Bulk Fee Rule Upload
					</>
				}
				footer={actionFooter(
					"bulkUploadModal",
					"Upload & Validate",
					"47 fee rules imported successfully!",
					"BULK-20250627",
				)}
			>
				{actionBody(
					"bulkUploadModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Upload CSV</label>
							<input type="file" className={styles.fc} />
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> Download template:{" "}
							{/* LEGACY BRIDGE: alert('Template downloaded!') → real CSV download */}
							<button
								className="btn btn-link btn-sm p-0 align-baseline"
								style={{ fontSize: 12 }}
								onClick={() =>
									downloadFile(
										"fee_rules_template.csv",													"model,business,charge,paymo_fee,profit,status\nPercentage,Company 2,2.0%,2.0%,KES 241,Collected",
										"text/csv",
									)
								}
							>
								fee_rules_template.csv
							</button>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M20: Partner Payout ============ */}
			<MBox
				id="partnerPayoutModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-send" /> Channel Profits to Wallet
					</>
				}
				footer={actionFooter(
					"partnerPayoutModal",
					"Save Rule",
					"Profit channel rule saved — profits will auto-deliver.",
				)}
			>
				{actionBody(
					"partnerPayoutModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Deliver To</label>
							<select className={styles.fc}>
								{PARTNERS.map((p) => (
									<option key={p}>{p}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Minimum Profit (KES)</label>
							<input className={styles.fc} defaultValue="2" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Delivery Frequency</label>
							<select className={styles.fc}>
								{SETTLE_FREQS.map((f) => (
									<option key={f}>{f}</option>
								))}
							</select>
						</div>
						<div className={styles.summaryBox} style={{ fontSize: 12 }}>
							<i className="bi bi-lightning-charge me-1" /> Even KES 2 of profit is
							delivered the moment it's earned.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M21: Regulatory Report ============ */}
			<MBox
				id="regulatoryReportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-earmark-check" /> Regulatory Fee Report
					</>
				}
				footer={actionFooter(
					"regulatoryReportModal",
					"Generate & Submit",
					"Regulatory report generated and submitted!",
					"REG-20250627",
				)}
			>
				{actionBody(
					"regulatoryReportModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Report For</label>
							<select className={styles.fc}>
								{REGULATORS.map((r) => (
									<option key={r}>{r}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Period</label>
							<select className={styles.fc}>
								{REPORT_PERIODS.map((p) => (
									<option key={p}>{p}</option>
								))}
							</select>
						</div>
						<div className={styles.summaryBox} style={{ fontSize: 12 }}>
							Report will include: your customer charges, PayMo fees
							deducted, profit delivered, waiver utilization, and fee
							disclosure attestations.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M22: Tier Performance ============ */}
			<MBox
				id="tierPerformanceModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bar-chart-line" /> Tier Performance Analytics
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("addCommissionTierModal")}
						>
							Add New Tier
						</button>
					</>
				}
			>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead>
							<tr>													<th>Model / Business</th>
													<th>Volume</th>
													<th>Revenue</th>
													<th>Adoption</th>
													<th>Growth</th>
							</tr>
						</thead>
						<tbody>
							{tierPerfRows.map(([t, a, v, r, g]) => (
								<tr key={t}>
									<td>{t}</td>
									<td>{a}</td>
									<td>{v}</td>
									<td>{r}</td>
									<td>{g}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M23: Hardship Waiver ============ */}
			<MBox
				id="hardshipWaiverModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-heart" /> Hardship Waiver Request
					</>
				}
				footer={actionFooter(
					"hardshipWaiverModal",
					"Submit Request",
					"Hardship waiver request submitted for review!",
					"HW-20250627",
				)}
			>
				{actionBody(
					"hardshipWaiverModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer ID / Phone</label>
							<input className={styles.fc} defaultValue="0712 345 890" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Reason</label>
							<select className={styles.fc}>
								{HARDSHIP_REASONS.map((r) => (
									<option key={r}>{r}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Requested Discount</label>
							<input className={styles.fc} defaultValue="100" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Supporting Document</label>
							<input type="file" className={styles.fc} />
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M24: Fee Comparison Tool ============ */}
			<MBox
				id="feeCompareModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-arrow-left-right" /> Market Fee Comparison
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
								<th>Provider</th>
								<th>Inter-bank</th>
								<th>Wallet</th>
								<th>Instant</th>
								<th>Overall</th>
							</tr>
						</thead>
						<tbody>
							{feeCompareRows.map(([p, ib, w, inst, overall, tone, strong]) => (
								<tr key={p}>
									<td>{strong ? <strong>{p}</strong> : p}</td>
									<td>{ib}</td>
									<td>{w}</td>
									<td>{inst}</td>
									<td>
										<span className={`${styles.badge} ${styles[tone]}`}>
											{overall}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M25: Final Confirmation ============ */}
			<MBox
				id="finalConfirmModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-check2-circle" /> Confirm Action
					</>
				}
				footer={actionFooter(
					"finalConfirmModal",
					"Confirm & Execute",
					"Action confirmed and executed successfully!",
					"CONF-20250627",
				)}
			>
				{actionBody(
					"finalConfirmModal",
					<div className={styles.summaryBoxAccent}>
						<i className="bi bi-info-circle me-1" /> This action will affect
						your live fee models and KES 2.31M in monthly customer charges.
						Are you sure?
					</div>,
				)}
			</MBox>

			{/* ============ M26: Charge a Customer ============ */}
			<MBox
				id="chargeCustomerModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-receipt me-2"
							style={{ color: "var(--pm-info)" }}
						/>
						Charge a Customer
					</>
				}
				footer={actionFooter(
					"chargeCustomerModal",
					"Apply Charge",
					"Charge applied — KES 277 profit delivered instantly to Business Wallet.",
					"CHG-20250808-4409",
				)}
			>
				{actionBody(
					"chargeCustomerModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Business</label>
							<select className={styles.fc}>
								<option>Land Buyers LTD — Flat KES 1,250</option>
								<option>Company 2 — 2.0%</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Customer / Ref</label>
							<input
								className={styles.fc}
								defaultValue="Order #ORD-8904"
							/>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Transaction Amount (KES)</label>
								<input className={styles.fc} defaultValue="50000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Your Charge</label>
								<input className={styles.fc} defaultValue="2.0% = KES 1,000" />
							</div>
						</div>
						<div className={`${styles.summaryBox} mt-3`} style={{ fontSize: 13 }}>
							<BoxRow label="PayMo fee (deducted)" value="KES 723" />
							<BoxRow label="Your profit" value="KES 277" last />
						</div>
						<div className={`${styles.summaryBoxAccent} mt-3`} style={{ fontSize: 12 }}>
							<i className="bi bi-lightning-charge me-1" /> Profit auto-channels to
							Business Wallet the moment this settles.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M27: Channel Rule ============ */}
			<MBox
				id="channelRuleModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-left-right me-2"
							style={{ color: "var(--pm-accent)" }}
						/>
						Channel Rule
					</>
				}
				footer={actionFooter(
					"channelRuleModal",
					"Save Rule",
					"Channel rule saved — profits deliver on schedule.",
					"CR-012",
				)}
			>
				{actionBody(
					"channelRuleModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Rule Name</label>
							<input
								className={styles.fc}
								defaultValue="Micro-profit instant delivery"
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Deliver To</label>
							<select className={styles.fc}>
								{PARTNERS.map((p) => (
									<option key={p}>{p}</option>
								))}
							</select>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Trigger</label>
								<select className={styles.fc}>
									<option>Instant (any profit ≥ KES 2)</option>
									<option>When pot ≥ threshold</option>
									<option>Weekly schedule</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Threshold (KES)</label>
								<input className={styles.fc} defaultValue="2" />
							</div>
						</div>
						<div className="form-check mt-3">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="cr1"
							/>
							<label className="form-check-label" htmlFor="cr1" style={{ fontSize: 13 }}>
								Active — deliver profits immediately as earned
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M28: Profit Pot Detail ============ */}
			<MBox
				id="potDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-cash-stack me-2"
							style={{ color: "var(--pm-purple)" }}
						/>
						Profit Pot
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("settlementModal")}
						>
							Deliver Now
						</button>
					</>
				}
			>
				<div className={`${styles.summaryBox} mb-3`}>
					<div className="d-flex justify-content-between mb-2">
						<span>Pot balance</span>
						<strong>KES 1,342,000</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span>Pending</span>
						<strong>KES 84,500</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span>Delivered MTD</span>
						<strong style={{ color: "var(--pm-accent)" }}>KES 968,000</strong>
					</div>
				</div>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Time</th>
								<th>Source</th>
								<th>Profit</th>
								<th>Channel</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{[
								["14:32", "CHG-4401 · Land Buyers", "KES 18,750", "Business Wallet", "Delivered"],
								["14:28", "CHG-4403 · Company 2", "KES 241", "Business Wallet", "Delivered"],
								["13:10", "FX conversions", "KES 24,800", "Business Wallet", "Delivered"],
							].map((r) => (
								<tr key={r[0]}>
									{r.map((c, j) => (
										<td key={j}>{c}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M29: Profit Access & Permissions ============ */}
			<MBox
				id="profitAccessModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-check me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						Profit Permissions &amp; Access
					</>
				}
				footer={actionFooter(
					"profitAccessModal",
					"Request Access",
					"Access request submitted — pending approval by Paymo.",
					undefined,
				)}
			>
				{actionBody(
					"profitAccessModal",
					<>
						{(
							[
								["Channel profits to Business Wallet", "Auto-deliver to KES Business Wallet", true],
								["Auto-deliver micro-profits (≥ KES 2)", "Instant delivery on every charge", true],
								["Route profits to external M-Pesa", "Deliver to 0712…890 on schedule", false],
								["Withdraw profit pot to linked bank", "Equity Bank • 01-2345678-0", false],
							] as const
						).map(([scope, desc, granted]) => (
							<div className={styles.sr} key={scope}>
								<div className="d-flex align-items-center gap-2">
									<div
										className={styles.permDot}
										style={{
											background: granted
												? "var(--pm-primary)"
												: "var(--pm-warning)",
										}}
									/>
									<div>
										<strong>{scope}</strong>
										<div className={styles.mutedSmall}>{desc}</div>
									</div>
								</div>
								{granted ? (
									<span className={`${styles.badge} ${styles.badgeS}`}>
										Granted
									</span>
								) : (
									<span className={`${styles.badge} ${styles.badgeW}`}>
										Pending
									</span>
								)}
							</div>
						))}
					</>,
				)}
			</MBox>

			{/* ============ M30: Promo Campaign ============ */}
			<MBox
				id="promoModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-megaphone me-2"
							style={{ color: "var(--pm-warning)" }}
						/>
						Promo &amp; Discount Campaign
					</>
				}
				footer={actionFooter(
					"promoModal",
					"Launch Promo",
					"Promo launched — 0% fees for 5 new buyers this month.",
					"PRM-20250808-2210",
				)}
			>
				{actionBody(
					"promoModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Campaign Name</label>
							<input
								className={styles.fc}
								defaultValue="0% fees — new buyers month"
							/>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Discount</label>
								<select className={styles.fc}>
									<option>0% charge (absorb cost)</option>
									<option>50% off your charge</option>
									<option>Bulk rebate (10+ orders)</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Business</label>
								<select className={styles.fc}>
									<option>Land Buyers LTD</option>
									<option>Company 2</option>
								</select>
							</div>
						</div>
						<div className="mb-3 mt-3">
							<label className={styles.fl}>End Date</label>
							<input type="date" className={styles.fc} defaultValue="2025-08-31" />
						</div>
						<div className={`${styles.summaryBoxInfo} mb-3`} style={{ fontSize: 12 }}>
							<i className="bi bi-graph-up me-1" /> Typical lift: 12% more buyers —
							forecast +KES 210K extra volume this month.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M31: Fee Model Detail ============ */}
			<MBox
				id="feeModelDetailModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-grid-3x3-gap me-2"
							style={{ color: "var(--pm-info)" }}
						/>
						Fee Model — Percentage
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("addFeeRuleModal")}
						>
							Apply to Business
						</button>
					</>
				}
			>
				<div className={`${styles.summaryBox} mb-3`} style={{ fontSize: 13 }}>
					<BoxRow label="How it works" value="% of each transaction" />
					<BoxRow label="Example" value="KES 50,000 order × 2.0% = KES 1,000 charge" />
					<BoxRow label="PayMo fee" value="KES 723 deducted" />
					<BoxRow label="You keep" value="KES 277 delivered instantly" last />
				</div>
				<div className={`${styles.summaryBoxAccent} mb-3`} style={{ fontSize: 12 }}>
					<i className="bi bi-lightbulb me-1" /> Best for low-value, high-volume
					businesses like Company 2 (209 daily orders).
				</div>
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Band</th>
								<th>Rate</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Orders < KES 50K", "2.0%", "Active"],
								["Orders ≥ KES 50K", "1.5%", "Active"],
							].map((r) => (
								<tr key={r[0]}>
									<td>{r[0]}</td>
									<td>{r[1]}</td>
									<td>{r[2]}</td>
									<td>
										<button
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => onOpen("editCommissionModal")}
										>
											Edit
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>
		</>
	);
}
