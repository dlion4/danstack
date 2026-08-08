import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/fx.module.css";

/* ============================================================================
   Multi-Currency & FX Management — modal layer (legacy page 1.13, 23 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; legacy showLoading spinner → receipt
     nextFlow(key,total)→ `flows` state ("Step N" steppers, unlabeled in legacy);
                          confirm-step label kept: 'Confirm ✔'
     sw(prefix,key,btn) → `tabs` state map for pill/panel switching
     nf(el) PIN advance → pinRefs focus chain
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
					className={`${styles.modalBox} ${size === "lg" ? styles.modalBoxLg : ""} ${size === "xl" ? styles.modalBoxXl : ""}`}
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

/* ---------- static option lists ---------- */
const CONV_FROM = [
	"USD Wallet (48,200.00) — Land Buyers diaspora",
	"EUR Wallet (18,400.00) — Land Buyers diaspora",
	"GBP Wallet (9,100.00) — Land Buyers diaspora",
	"ZAR Wallet (214,000.00) — Company 2 card rail",
];
const CONV_TO = [
	"Business Wallet (KES 8.40M)",
	"Virtual Wallet (KES 1.25M)",
	"Land Buyers float (KES 3.20M)",
	"Company 2 float (KES 640K)",
];
const HEDGE_PAIRS = ["USD/KES", "GBP/KES", "EUR/KES"];
const LOCK_PERIODS = ["30 days", "60 days", "90 days"];
const CURRENCIES = [
	"USD — United States Dollar",
	"EUR — Euro",
	"GBP — British Pound",
	"ZAR — South African Rand",
	"UGX — Ugandan Shilling",
	"TZS — Tanzanian Shilling",
	"GHS — Ghanaian Cedi",
	"NGN — Nigerian Naira",
	"AED — UAE Dirham",
];
const FX_FROM = [
	"USD Wallet (48,200)",
	"GBP Wallet (9,100)",
	"ZAR Wallet (214,000)",
	"Business Wallet (KES 8.40M)",
];
const FX_TO = [
	"External Bank (South Africa)",
	"External Bank (UK)",
	"External Bank (USA)",
	"Business Wallet (KES)",
];
const FX_PURPOSES = ["Supplier Payment", "Diaspora Refund", "Salary", "Vendor Invoice"];
const RATE_CONDITIONS = ["Rate above", "Rate below", "Volatility %"];
const AUTO_RUNTIMES = [
	"Daily 09:00 EAT",
	"Friday 13:00 EAT (before auto-settle)",
	"Every 4 hours",
];
const PREF_SHOW = ["USD", "KES"];
const STATEMENT_TYPES = [
	"Full FX Activity",
	"Conversion History",
	"Rate Locks",
	"Fees & Savings",
];
const FORMATS = ["PDF", "Excel", "CSV"];
const SWAP_WALLETS = ["USD Wallet", "GBP Wallet", "EUR Wallet", "ZAR Wallet"];

type FlowKey = "conv" | "hedge" | "fxTrans";
interface Result {
	msg: string;
	ref?: string;
}

export default function FxModals({ active, onClose, onOpen }: ModalsProps) {
	/* ---------- doAction / nextFlow / busy state ---------- */
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<FlowKey, number>>({
		conv: 1,
		hedge: 1,
		fxTrans: 1,
	});
	/* ---------- LEGACY BRIDGE: sw(prefix,key,btn) tab pill state ---------- */
	const [tabs, setTabs] = useState<Record<string, string>>({
		rate: "active",
		fxa: "perf",
		auto: "rules",
	});
	const sw = (prefix: string, key: string) =>
		setTabs((prev) => ({ ...prev, [prefix]: key }));
	const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

	/* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ conv: 1, hedge: 1, fxTrans: 1 });
			setBusy(null);
			setTabs({ rate: "active", fxa: "perf", auto: "rules" });
		}
	}, [active]);

	const busyTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(busyTimer.current), []);

	/* ---------- LEGACY BRIDGE: nf(el) PIN auto-advance ---------- */
	const nf = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value.length === 1) pinRefs.current[i + 1]?.focus();
	};

	/* ---------- LEGACY BRIDGE: doAction(modalId, msg, ref) ---------- */
	const doAction = (modalId: string, msg: string, ref?: string) => {
		setBusy(modalId);
		busyTimer.current = window.setTimeout(() => {
			setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }));
			setBusy(null);
		}, 1500);
	};

	/* ---------- LEGACY BRIDGE: nextFlow(key, total) ---------- */
	const flowTotals: Record<FlowKey, number> = { conv: 4, hedge: 3, fxTrans: 3 };
	const flowModals: Record<FlowKey, string> = {
		conv: "convertModal",
		hedge: "hedgeModal",
		fxTrans: "fxTransferModal",
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
				{Array.from({ length: total }, (_, i) => {
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

	const actionBody = (id: string, children: ReactNode) => (
		<>
			{busy === id && <BusyOverlay />}
			{results[id] ? receipt(id, results[id]) : children}
		</>
	);

	const actionFooter = (
		id: string,
		label: string,
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
					className={`${styles.btnPm} ${styles.btnPmP}`}
					disabled={busy === id}
					onClick={() => doAction(id, msg, ref)}
				>
					{label}
				</button>
			</>
		);

	const flowFooter = (key: FlowKey) => (
		<>
			<button className={styles.btnPm} onClick={onClose}>
				Cancel
			</button>
			<button
				className={`${styles.btnPm} ${styles.btnPmP}`}
				disabled={busy === key}
				onClick={() => nextFlow(key)}
			>
				{flows[key] >= flowTotals[key] ? (
					"Done"
				) : busy === key ? (
					<>
						<span
							className="spinner-border spinner-border-sm me-1"
							aria-hidden="true"
						/>{" "}
						Processing
					</>
				) : flows[key] === flowTotals[key] - 1 ? (
					<>
						Confirm <i className="bi bi-check-lg" />
					</>
				) : (
					<>
						Continue <i className="bi bi-arrow-right" />
					</>
				)}
			</button>
		</>
	);

	const showFlow = (key: FlowKey) => active === flowModals[key];

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

	return (
		<>
			{/* ============ M1: Instant Currency Conversion (multi-step) ============ */}
			<MBox
				id="convertModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-arrow-left-right me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						Instant Currency Conversion
					</>
				}
				footer={flowFooter("conv")}
			>
				{stepper("conv")}
				{busy === "conv" && <BusyOverlay />}
				{showFlow("conv") && flows.conv === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Select Wallets</h6>
						<div className="mb-3">
							<label className={styles.fl}>For Business</label>
							<select className={styles.fc} defaultValue={"Land Buyers LTD"}>
								{["Land Buyers LTD", "Company 2", "My Wallets (own funds)"].map(
									(b) => (
										<option key={b}>{b}</option>
									),
								)}
							</select>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>From Wallet</label>
								<select className={styles.fc} defaultValue={CONV_FROM[0]}>
									{CONV_FROM.map((w) => (
										<option key={w}>{w}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>To Wallet</label>
								<select className={styles.fc} defaultValue={CONV_TO[0]}>
									{CONV_TO.map((w) => (
										<option key={w}>{w}</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}
				{showFlow("conv") && flows.conv === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Amount &amp; Rate</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Amount to Convert</label>
								<input className={styles.fc} defaultValue="5000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Live Rate</label>
								<div className={styles.summaryBox}>
									<strong>1 USD = 129.45 KES</strong>
									<div className={styles.mutedSmall}>
										Spread: 0.50 • Updated 14s ago
									</div>
								</div>
							</div>
						</div>
						<div className={`${styles.summaryBoxAccent} mt-3`}>
							<div className="d-flex justify-content-between">
								<span>You will receive</span>
								<strong>KES 647,250</strong>
							</div>
						</div>
					</div>
				)}
				{showFlow("conv") && flows.conv === 3 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: Confirmation</h6>
						<div className={styles.summaryBox}>
							<BoxRow label="From" value="USD 5,000.00" />
							<BoxRow label="To" value="KES 647,250.00" />
							<BoxRow label="Rate" value="129.45" />
							<BoxRow label="Fee" value="KES 1,200" last />
						</div>
						<label className={`${styles.fl} mt-3`}>Enter PIN</label>
						<div className={styles.pinRow}>
							{[0, 1, 2, 3].map((i) => (
								<input
									key={i}
									ref={(el) => {
										pinRefs.current[i] = el;
									}}
									type="password"
									maxLength={1}
									onChange={nf(i)}
									className={styles.pinInput}
									aria-label={`PIN digit ${i + 1}`}
								/>
							))}
						</div>
					</div>
				)}
				{showFlow("conv") && flows.conv === 4 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Conversion Successful</h5>
							<p className={styles.receiptSub}>
								KES 647,250 credited to your Business Wallet.
							</p>
							<div
								className={`${styles.summaryBox} text-start mt-3`}
								style={{ fontSize: 13 }}
							>
								<BoxRow label="Reference" value="FX-20250627-9912" />
								<BoxRow label="Destination" value="Business Wallet" />
								<BoxRow label="Completed" value="27 Jun 2025, 14:41 EAT" last />
							</div>
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M2: Create Rate Lock (multi-step, replaces forward contract) ============ */}
			<MBox
				id="hedgeModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-lock me-2"
							style={{ color: "var(--pm-accent)" }}
						/>
						Create Rate Lock
					</>
				}
				footer={flowFooter("hedge")}
			>
				{stepper("hedge")}
				{busy === "hedge" && <BusyOverlay />}
				{showFlow("hedge") && flows.hedge === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Lock Details</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Currency Pair</label>
								<select className={styles.fc} defaultValue={HEDGE_PAIRS[0]}>
									{HEDGE_PAIRS.map((p) => (
										<option key={p}>{p}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Amount to Lock</label>
								<input className={styles.fc} defaultValue="12000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Lock Period</label>
								<select className={styles.fc} defaultValue={LOCK_PERIODS[1]}>
									{LOCK_PERIODS.map((t) => (
										<option key={t}>{t}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Scheduled Payout Date</label>
								<input
									type="date"
									className={styles.fc}
									defaultValue="2025-08-30"
								/>
							</div>
						</div>
					</div>
				)}
				{showFlow("hedge") && flows.hedge === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Rate &amp; Savings</h6>
						<div className={`${styles.summaryBox} mb-3`}>
							<BoxRow label="Locked Rate" value="129.20" />
							<BoxRow label="Current Spot" value="129.45" />
							<BoxRow label="You Save" value="KES 21,000" last />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Accept Rate</label>
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
									id="hdg1"
								/>
								<label className="form-check-label" htmlFor="hdg1">
									I accept the locked rate for my scheduled payout
								</label>
							</div>
						</div>
					</div>
				)}
				{showFlow("hedge") && flows.hedge >= 3 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Rate Lock Created</h5>
							<p className={styles.receiptSub}>
								Rate lock LK-8892 locked at 129.20 for USD 12,000, valid until
								30 Aug.
							</p>
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M3: Open New Currency Wallet ============ */}
			<MBox
				id="newWalletModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-circle me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						Open New Currency Wallet
					</>
				}
				footer={actionFooter(
					"newWalletModal",
					"Create Wallet",
					"New USD wallet created successfully!",
					"WAL-20250627-4421",
				)}
			>
				{actionBody(
					"newWalletModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Currency</label>
							<select className={styles.fc} defaultValue={CURRENCIES[0]}>
								{CURRENCIES.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Wallet Nickname</label>
							<input className={styles.fc} defaultValue="Business USD" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Initial Funding</label>
							<input className={styles.fc} defaultValue="10000" />
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="nw1"
							/>
							<label
								className="form-check-label"
								htmlFor="nw1"
								style={{ fontSize: 13 }}
							>
								Enable rate alerts for this wallet
							</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" id="nw2" />
							<label
								className="form-check-label"
								htmlFor="nw2"
								style={{ fontSize: 13 }}
							>
								Auto-convert incoming funds to KES
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M4: FX Rate Alerts (multi-tab) ============ */}
			<MBox
				id="rateAlertsModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-bell me-2"
							style={{ color: "var(--pm-warning)" }}
						/>
						FX Rate Alerts
					</>
				}
				footer={actionFooter(
					"rateAlertsModal",
					"Create Alert",
					"Rate alert created successfully!",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"rateAlertsModal",
					<>
						<div className={`${styles.pills} mb-3`}>
							{(
								[
									["active", "Active"],
									["history", "History"],
									["create", "Create New"],
								] as const
							).map(([key, label]) => (
								<button
									key={key}
									className={`${styles.pill} ${tabs.rate === key ? styles.pillActive : ""}`}
									onClick={() => sw("rate", key)}
								>
									{label}
								</button>
							))}
						</div>
						{tabs.rate === "active" && (
							<>
								{(
									[
										[
											"USD/KES > 130.50",
											"Notify when rate exceeds 130.50",
											"Active",
											styles.badgeS,
										],
										[
											"EUR/KES < 138.00",
											"Notify when rate drops below 138.00",
											"Active",
											styles.badgeS,
										],
										[
											"GBP/KES volatility > 2%",
											"Daily volatility alert",
											"Paused",
											styles.badgeW,
										],
									] as const
								).map(([title, sub, badge, tone]) => (
									<div className={styles.sr} key={title}>
										<div>
											<strong>{title}</strong>
											<div className={styles.mutedSmall}>{sub}</div>
										</div>
										<span className={`${styles.badge} ${tone}`}>{badge}</span>
									</div>
								))}
							</>
						)}
						{tabs.rate === "history" && (
							<div className="table-responsive">
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Alert</th>
											<th>Triggered</th>
											<th>Rate</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>{"USD/KES > 130.00"}</td>
											<td>25 Jun 09:12</td>
											<td>130.12</td>
											<td>
												<button
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => onOpen("convertModal")}
												>
													Convert
												</button>
											</td>
										</tr>
										<tr>
											<td>{"EUR/KES < 139.00"}</td>
											<td>22 Jun 14:45</td>
											<td>138.85</td>
											<td>
												<button
													className={`${styles.btnPm} ${styles.btnSm}`}
													onClick={() => onOpen("hedgeModal")}
												>
													Hedge
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
						{tabs.rate === "create" && (
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Currency Pair</label>
									<select className={styles.fc} defaultValue={HEDGE_PAIRS[0]}>
										{HEDGE_PAIRS.map((p) => (
											<option key={p}>{p}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Condition</label>
									<select
										className={styles.fc}
										defaultValue={RATE_CONDITIONS[0]}
									>
										{RATE_CONDITIONS.map((c) => (
											<option key={c}>{c}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Threshold</label>
									<input className={styles.fc} defaultValue="130.50" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Channels</label>
									<div className="form-check form-check-inline">
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked
											id="ra1"
										/>
										<label className="form-check-label" htmlFor="ra1">
											Push
										</label>
									</div>
									<div className="form-check form-check-inline">
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked
											id="ra2"
										/>
										<label className="form-check-label" htmlFor="ra2">
											SMS
										</label>
									</div>
								</div>
							</div>
						)}
					</>,
				)}
			</MBox>

			{/* ============ M5: Cross-Border FX Transfer (multi-step) ============ */}
			<MBox
				id="fxTransferModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-send me-2"
							style={{ color: "var(--pm-info)" }}
						/>
						Cross-Border FX Transfer
					</>
				}
				footer={flowFooter("fxTrans")}
			>
				{stepper("fxTrans")}
				{busy === "fxTrans" && <BusyOverlay />}
				{showFlow("fxTrans") && flows.fxTrans === 1 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Transfer Details</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>From Wallet</label>
								<select className={styles.fc} defaultValue={FX_FROM[0]}>
									{FX_FROM.map((w) => (
										<option key={w}>{w}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>To Wallet / Beneficiary</label>
								<select className={styles.fc} defaultValue={FX_TO[0]}>
									{FX_TO.map((w) => (
										<option key={w}>{w}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Amount</label>
								<input className={styles.fc} defaultValue="10000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Purpose</label>
								<select className={styles.fc} defaultValue={FX_PURPOSES[0]}>
									{FX_PURPOSES.map((p) => (
										<option key={p}>{p}</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}
				{showFlow("fxTrans") && flows.fxTrans === 2 && (
					<div className={styles.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Review &amp; Fees</h6>
						<div className={styles.summaryBox}>
							<BoxRow label="Transfer Amount" value="USD 10,000" />
							<BoxRow label="FX Rate" value="18.42 ZAR per USD" />
							<BoxRow label="Fee" value="USD 25" />
							<BoxRow label="Recipient Gets" value="ZAR 184,175" last />
						</div>
					</div>
				)}
				{showFlow("fxTrans") && flows.fxTrans >= 3 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.ri}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 className={styles.receiptTitle}>Transfer Initiated</h5>
							<p className={styles.receiptSub}>Reference: FXTR-20250627-8821</p>
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M6: Bulk FX Conversion ============ */}
			<MBox
				id="bulkFxModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-collection me-2"
							style={{ color: "var(--pm-purple)" }}
						/>
						Bulk FX Conversion
					</>
				}
				footer={actionFooter(
					"bulkFxModal",
					"Execute Batch",
					"Bulk FX batch submitted! 3 conversions queued.",
					"BULK-FX-20250627-1122",
				)}
			>
				{actionBody(
					"bulkFxModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Upload CSV or select multiple</label>
							<input type="file" className={styles.fc} />
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>From</th>
										<th>To</th>
										<th>Amount</th>
										<th>Est. Received</th>
									</tr>
								</thead>
								<tbody>
									{(
										[
											["USD", "KES", "25,000", "KES 3,236,250"],
											["EUR", "KES", "12,000", "KES 1,677,600"],
											["GBP", "KES", "8,000", "KES 1,329,600"],
										] as const
									).map((row) => (
										<tr key={row[0]}>
											{row.map((cell, j) => (
												<td key={j}>{cell}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M7: FX Transaction Receipt ============ */}
			<MBox
				id="fxReceiptModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-receipt me-2" />
						FX Transaction Receipt
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
					<h5 className={styles.receiptTitle}>Transaction Confirmed</h5>
					<div
						className={`${styles.summaryBox} text-start mt-3`}
						style={{ fontSize: 13 }}
					>
						<BoxRow label="Reference" value="FX-20250627-9912" />
						<BoxRow label="From" value="USD 5,000.00" />
						<BoxRow label="To" value="KES 647,250.00" />
						<BoxRow label="Rate" value="129.45" />
						<BoxRow label="Completed" value="27 Jun 2025, 14:41 EAT" last />
					</div>
					<div
						className="d-flex justify-content-center mt-3"
						style={{ gap: 8 }}
					>
						{/* LEGACY BRIDGE: dead PDF/Share buttons in legacy → real file download */}
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() =>
								downloadFile(
									"FX-Receipt-FX-20250627-9912.txt",
									"FX Transaction Receipt\nReference: FX-20250627-9912\nFrom: USD 5,000.00\nTo: KES 647,250.00\nRate: 129.45\nCompleted: 27 Jun 2025, 14:41 EAT",
								)
							}
						>
							<i className="bi bi-download" /> PDF
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() =>
								downloadFile(
									"FX-Receipt-FX-20250627-9912-share.txt",
									"FX conversion FX-20250627-9912 — USD 5,000 → KES 647,250 @ 129.45 via PayMo.",
								)
							}
						>
							<i className="bi bi-whatsapp" /> Share
						</button>
					</div>
				</div>
			</MBox>

			{/* ============ M8: FX Analytics Dashboard (multi-tab) ============ */}
			<MBox
				id="fxAnalyticsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bar-chart-line me-2" />
						FX Analytics Dashboard
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("fxStatementModal")}
						>
							Export Full Report
						</button>
					</>
				}
			>
				<div className={`${styles.pills} mb-3`}>
					{(
						[
							["perf", "Performance"],
							["cost", "Cost Analysis"],
							["predict", "Predictions"],
						] as const
					).map(([key, label]) => (
						<button
							key={key}
							className={`${styles.pill} ${tabs.fxa === key ? styles.pillActive : ""}`}
							onClick={() => sw("fxa", key)}
						>
							{label}
						</button>
					))}
				</div>
				{tabs.fxa === "perf" && (
					<div className={styles.chartBars} style={{ height: 110 }}>
						{(
							[
								["55%", "var(--pm-primary)", "Jan"],
								["68%", "var(--pm-primary)", "Feb"],
								["49%", "var(--pm-primary)", "Mar"],
								["82%", "var(--pm-warning)", "Apr"],
								["71%", "var(--pm-primary)", "May"],
								["90%", "var(--pm-accent)", "Jun"],
							] as const
						).map(([h, c, l]) => (
							<div
								key={l}
								className={styles.chartBar}
								style={{ height: h, background: c }}
							>
								<span className={styles.barLabel}>{l}</span>
							</div>
						))}
					</div>
				)}
				{tabs.fxa === "cost" && (
					<div className="table-responsive">
						<table className={styles.tbl}>
							<thead>
								<tr>
									<th>Month</th>
									<th>Volume</th>
									<th>Fees</th>
									<th>Avg Spread</th>
								</tr>
							</thead>
							<tbody>
								{(
									[
										["June", "KES 124.8M", "KES 312,400", "0.48%"],
										["May", "KES 98.2M", "KES 289,100", "0.51%"],
									] as const
								).map((row) => (
									<tr key={row[0]}>
										{row.map((cell, j) => (
											<td key={j}>{cell}</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{tabs.fxa === "predict" && (
					<div className={styles.summaryBoxInfo}>
						<div style={{ fontSize: 13 }}>
							Next 30 days forecast: <strong>KES 14.2M conversions</strong> with
							expected savings of <strong>KES 84,000</strong> if your current
							rate-lock strategy continues.
						</div>
					</div>
				)}
			</MBox>

			{/* ============ M9: FX Exposure (simple — balances vs float needs) ============ */}
			<MBox
				id="fxRiskModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-exclamation me-2"
							style={{ color: "var(--pm-danger)" }}
						/>
						FX Exposure &amp; Float Needs
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("hedgeModal")}
						>
							Lock a Rate
						</button>
					</>
				}
			>
				<div className="row g-3">
					{(
						[
							["FOREIGN HELD", "KES 11.85M", "var(--pm-info-soft)", "var(--pm-info)"],
							["FLOAT NEED (30D)", "KES 6.4M", "var(--pm-warning-soft)", "var(--pm-warning)"],
							[
								"COVER RATIO",
								"1.85×",
								"var(--pm-accent-soft)",
								"var(--pm-accent)",
							],
						] as const
					).map(([label, value, bg, color]) => (
						<div className="col-md-4" key={label}>
							<div className={styles.miniStat} style={{ background: bg }}>
								<div className={styles.miniStatLabel} style={{ color }}>
									{label}
								</div>
								<div
									className={styles.miniStatBig}
									style={{ color, fontSize: 24 }}
								>
									{value}
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="table-responsive mt-3">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Currency</th>
								<th>Held</th>
								<th>KES Value</th>
								<th>Float Need</th>
								<th>Worth Locking</th>
							</tr>
						</thead>
						<tbody>
							{(
								[
									["USD", "48,200", "KES 6.24M", "KES 3.2M", "Yes — 129.20"],
									["GBP", "9,100", "KES 1.51M", "KES 1.2M", "Yes — 165.90"],
									["EUR", "18,400", "KES 2.57M", "KES 1.8M", "No — holding"],
									["ZAR", "214,000", "KES 1.53M", "KES 640K", "No — settled"],
								] as const
							).map((row) => (
								<tr key={row[0]}>
									{row.map((cell, j) => (
										<td key={j}>{cell}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M10: FX Automation Rules (multi-tab) ============ */}
			<MBox
				id="fxAutomationModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-robot me-2" />
						FX Automation Rules
					</>
				}
				footer={actionFooter(
					"fxAutomationModal",
					"Save Rule",
					"Automation rule saved!",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"fxAutomationModal",
					<>
						<div className={`${styles.pills} mb-3`}>
							{(
								[
									["rules", "Rules"],
									["schedule", "Schedule"],
									["history", "History"],
								] as const
							).map(([key, label]) => (
								<button
									key={key}
									className={`${styles.pill} ${tabs.auto === key ? styles.pillActive : ""}`}
									onClick={() => sw("auto", key)}
								>
									{label}
								</button>
							))}
						</div>
						{tabs.auto === "rules" && (
							<>
								<div className={styles.sr}>
									<div>
										<strong>{"USD → KES when > $10,000"}</strong>
										<div className={styles.mutedSmall}>
											Convert surplus USD to Business Wallet
										</div>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										Active
									</span>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Diaspora GBP → Land Buyers float</strong>
										<div className={styles.mutedSmall}>
											Every Friday 13:00 before auto-settle
										</div>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`}>
										Active
									</span>
								</div>
							</>
						)}
						{tabs.auto === "schedule" && (
							<div className="mb-3">
								<label className={styles.fl}>Run Time</label>
								<select className={styles.fc} defaultValue={AUTO_RUNTIMES[0]}>
									{AUTO_RUNTIMES.map((r) => (
										<option key={r}>{r}</option>
									))}
								</select>
							</div>
						)}
						{tabs.auto === "history" && (
							<div className="table-responsive">
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>Rule</th>
											<th>Last Run</th>
											<th>Result</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>USD → KES</td>
											<td>27 Jun 09:00</td>
											<td>KES 1,294,500</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
					</>,
				)}
			</MBox>

			{/* ============ M11: FX Preferences ============ */}
			<MBox
				id="fxPreferencesModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear me-2" />
						FX Preferences
					</>
				}
				footer={actionFooter(
					"fxPreferencesModal",
					"Save",
					"Preferences saved!",
				)}
			>
				{actionBody(
					"fxPreferencesModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Default Display Currency</label>
							<select className={styles.fc} defaultValue="KES">
								{["KES", "USD", "EUR"].map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Show Equivalent In</label>
							<select className={styles.fc} defaultValue={PREF_SHOW[0]}>
								{PREF_SHOW.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="fp1"
							/>
							<label
								className="form-check-label"
								htmlFor="fp1"
								style={{ fontSize: 13 }}
							>
								Auto-hide balances below KES 10,000
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="fp2"
							/>
							<label
								className="form-check-label"
								htmlFor="fp2"
								style={{ fontSize: 13 }}
							>
								Show live rate ticker
							</label>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M12: Export FX Statement ============ */}
			<MBox
				id="fxStatementModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download me-2" />
						Export FX Statement
					</>
				}
				footer={actionFooter(
					"fxStatementModal",
					"Generate",
					"FX statement generated and downloading...",
				)}
			>
				{actionBody(
					"fxStatementModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Report Type</label>
							<select className={styles.fc} defaultValue={STATEMENT_TYPES[0]}>
								{STATEMENT_TYPES.map((t) => (
									<option key={t}>{t}</option>
								))}
							</select>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-6">
								<label className={styles.fl}>From</label>
								<input
									type="date"
									className={styles.fc}
									defaultValue="2025-01-01"
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
							<select className={styles.fc} defaultValue={FORMATS[0]}>
								{FORMATS.map((f) => (
									<option key={f}>{f}</option>
								))}
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M13: Market Depth ============ */}
			<MBox
				id="fxMarketModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-globe me-2" />
						Market Depth — USD/KES
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
								<th>Bid</th>
								<th>Amount</th>
								<th>Ask</th>
								<th>Amount</th>
							</tr>
						</thead>
						<tbody>
							{(
								[
									["129.35", "USD 250,000", "129.85", "USD 180,000"],
									["129.30", "USD 420,000", "129.90", "USD 310,000"],
								] as const
							).map((row, i) => (
								<tr key={i}>
									{row.map((cell, j) => (
										<td key={j}>{cell}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M14: Currency Swap ============ */}
			<MBox
				id="swapModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shuffle me-2"
							style={{ color: "var(--pm-danger)" }}
						/>
						Currency Swap
					</>
				}
				footer={actionFooter(
					"swapModal",
					"Execute Swap",
					"Currency swap executed successfully!",
					"SWAP-20250627-7712",
				)}
			>
				{actionBody(
					"swapModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Swap From</label>
							<select className={styles.fc} defaultValue={SWAP_WALLETS[0]}>
								{SWAP_WALLETS.map((w) => (
									<option key={w}>{w}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Swap To</label>
							<select className={styles.fc} defaultValue={SWAP_WALLETS[1]}>
								{[...SWAP_WALLETS].reverse().map((w) => (
									<option key={w}>{w}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Amount</label>
							<input className={styles.fc} defaultValue="10000" />
						</div>
						<div className={styles.summaryBox}>
							<div className="d-flex justify-content-between">
								<span>Estimated Received</span>
								<strong>EUR 9,200</strong>
							</div>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M15: All Items Requiring Attention ============ */}
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
						All Items Requiring Attention
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
						[
							"PLT-091 diaspora batch awaiting conversion",
							"Convert",
							"diasporaConvertModal",
						],
						[
							"USD wallet above auto-convert threshold",
							"Review",
							"fxAutomationModal",
						],
						["ZAR rate alert triggered", "View", "rateAlertsModal"],
					] as const
				).map(([title, label, modal]) => (
					<div className={styles.sr} key={title}>
						<div>
							<strong>{title}</strong>
						</div>
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => onOpen(modal)}
						>
							{label}
						</button>
					</div>
				))}
			</MBox>

			{/* ============ M16: FX Portfolio Health Check ============ */}
			<MBox
				id="fxHealthModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-heart-pulse me-2"
							style={{ color: "var(--pm-danger)" }}
						/>
						FX Portfolio Health Check
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("fxRiskModal")}
						>
							View Risk Dashboard
						</button>
					</>
				}
			>
				<div className="row g-3 mb-3">
					{(
						[
							[
								"91",
								"HEALTH SCORE",
								"var(--pm-accent-soft)",
								"var(--pm-accent)",
							],
							[
								"4/5",
								"SUB-WALLETS HEALTHY",
								"var(--pm-info-soft)",
								"var(--pm-info)",
							],
							[
								"3",
								"NEED ACTION",
								"var(--pm-warning-soft)",
								"var(--pm-warning)",
							],
							["5", "AUTO RULES", "var(--pm-purple-soft)", "var(--pm-purple)"],
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
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Wallet</th>
								<th>Status</th>
								<th>Issue</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
						<tr>
							<td>EUR Wallet</td>
							<td>
								<span className={`${styles.badge} ${styles.badgeW}`}>
									Low
								</span>
							</td>
							<td>Below target for Land Buyers diaspora</td>
							<td>
								<button
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => onOpen("walletTopUpModal")}
								>
									Top-up
								</button>
							</td>
						</tr>
						<tr>
							<td>PLT-091 batch</td>
							<td>
								<span className={`${styles.badge} ${styles.badgeW}`}>
									Pending
								</span>
							</td>
							<td>GBP 14,200 awaiting convert → float</td>
							<td>
								<button
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => onOpen("diasporaConvertModal")}
								>
									Convert
								</button>
							</td>
						</tr>
						<tr>
							<td>Rate Lock LK-8821</td>
							<td>
								<span className={`${styles.badge} ${styles.badgeD}`}>
									Expiring
								</span>
							</td>
							<td>30 Aug 2025 · USD/KES 129.20</td>
							<td>
								<button
									className={`${styles.btnPm} ${styles.btnSm}`}
									onClick={() => onOpen("rateLockModal")}
								>
									Extend
								</button>
							</td>
						</tr>
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M17: FX Notifications ============ */}
			<MBox
				id="fxNotifModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-bell me-2" />
						FX Notifications (14)
					</>
				}
				footer={
					<>
						<button
							className={styles.btnPm}
							onClick={() => onOpen("rateAlertsModal")}
						>
							Manage Alerts
						</button>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
					</>
				}
			>
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					<div
						className={`${styles.summaryBoxDanger} mb-2`}
						style={{ fontSize: 13 }}
					>
						<strong>Rate lock LK-8821 expiring soon</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							USD/KES 129.20 • expires 30 Aug
						</div>
					</div>
					<div
						className={`${styles.summaryBoxWarn} mb-2`}
						style={{ fontSize: 13 }}
					>
						<strong>GBP balance below target</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							£9,100 held · £12,000 needed for August payouts
						</div>
					</div>
					<div
						className={`${styles.summaryBoxInfo} mb-2`}
						style={{ fontSize: 13 }}
					>
						<strong>PLT-091 awaiting conversion</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							GBP 14,200 → Land Buyers float before Friday
						</div>
					</div>
					<div className={styles.summaryBoxAccent} style={{ fontSize: 13 }}>
						<strong>Auto-conversion executed</strong>
						<div style={{ fontSize: 11, color: "var(--pm-ink-soft)" }}>
							USD 10,000 → KES 1,294,500 → Business Wallet
						</div>
					</div>
				</div>
			</MBox>

			{/* ============ M18: Profile ============ */}
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
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>Jckonia Kamau</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						jckonia@paymo.co · +254 712 345 890
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div className={`${styles.summaryBox} p-2`}>
								<span className={styles.mutedSmall}>FX Sub-Wallets</span>
								<br />
								<strong>4 active</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${styles.summaryBox} p-2`}>
								<span className={styles.mutedSmall}>FX Score</span>
								<br />
								<strong style={{ color: "var(--pm-accent)" }}>91/100</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${styles.summaryBox} p-2`}>
								<span className={styles.mutedSmall}>Member Since</span>
								<br />
								<strong>Mar 2022</strong>
							</div>
						</div>
						<div className="col-6">
							<div className={`${styles.summaryBox} p-2`}>
								<span className={styles.mutedSmall}>Rate Locks</span>
								<br />
								<strong>2 active</strong>
							</div>
						</div>
					</div>
				</div>
			</MBox>

			{/* ============ M19: Wallet Detail & Structure ============ */}
			<MBox
				id="walletDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-diagram-3 me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						Wallet Structure
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("newWalletModal")}
						>
							New Wallet
						</button>
					</>
				}
			>
				{(
					[
						["Paymo Master", "KES 124.8M", "Platform account — all flows route through here", "bi-house-gear"],
						["Business Wallet", "KES 8.40M", "Available KES 7.95M · linked Equity Bank 01-2345678-0", "bi-briefcase"],
						["Virtual Wallet", "KES 1.25M", "Your personal spending balance", "bi-wallet2"],
						["USD / EUR / GBP / ZAR sub-wallets", "KES 11.85M", "Diaspora & card-rail holdings — manage each below", "bi-currency-exchange"],
						["Land Buyers float · Company 2 float", "KES 3.84M", "Auto-settlement fuel per business", "bi-bank2"],
					] as const
				).map(([name, value, meta, icon]) => (
					<div className={styles.sr} key={name}>
						<div className="d-flex align-items-center gap-3">
							<div className={styles.iconCircle} style={{ fontSize: 12 }}>
								<i className={`bi ${icon}`} />
							</div>
							<div>
								<strong>{name}</strong>
								<div className={styles.mutedSmall}>
									{value} · {meta}
								</div>
							</div>
						</div>
						<button
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => onOpen("walletTopUpModal")}
						>
							Manage
						</button>
					</div>
				))}
				<div className={`${styles.summaryBoxAccent} mt-3`} style={{ fontSize: 13 }}>
					<i className="bi bi-info-circle me-1" />
					Sub-wallets convert into float fuel — converting to a float links the
					transaction to the Liquidity page (RB- ref).
				</div>
			</MBox>

			{/* ============ M20: Top Up Currency Wallet ============ */}
			<MBox
				id="walletTopUpModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-plus-circle me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						Top Up Currency Wallet
					</>
				}
				footer={actionFooter(
					"walletTopUpModal",
					"Top Up",
					"USD wallet topped up — KES 1,294,500 converted to USD 10,000.",
					"WAL-20250808-4412",
				)}
			>
				{actionBody(
					"walletTopUpModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Fund From</label>
							<select className={styles.fc} defaultValue={"Business Wallet (KES 8.40M)"}>
								{[
									"Business Wallet (KES 8.40M)",
									"Virtual Wallet (KES 1.25M)",
									"Land Buyers float (KES 3.20M)",
									"Company 2 float (KES 640K)",
								].map((w) => (
									<option key={w}>{w}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>To Currency Wallet</label>
							<select className={styles.fc} defaultValue={CONV_FROM[0]}>
								{CONV_FROM.slice(0, 4).map((w) => (
									<option key={w}>{w}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Amount (KES)</label>
							<input className={styles.fc} defaultValue="1294500" />
						</div>
						<div className={styles.summaryBox}>
							<div className="d-flex justify-content-between">
								<span>You receive</span>
								<strong>USD 10,000 @ 129.45</strong>
							</div>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M21: Withdraw from Currency Wallet ============ */}
			<MBox
				id="walletWithdrawModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-box-arrow-up-right me-2"
							style={{ color: "var(--pm-danger)" }}
						/>
						Withdraw from Currency Wallet
					</>
				}
				footer={actionFooter(
					"walletWithdrawModal",
					"Withdraw",
					"Withdrawal initiated — USD 5,000 to Equity Bank 01-2345678-0.",
					"WD-20250808-3341",
				)}
			>
				{actionBody(
					"walletWithdrawModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>From Currency Wallet</label>
							<select className={styles.fc} defaultValue={CONV_FROM[0]}>
								{CONV_FROM.slice(0, 4).map((w) => (
									<option key={w}>{w}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Withdraw To</label>
							<select className={styles.fc} defaultValue={"Equity Bank • 01-2345678-0"}>
								{[
									"Equity Bank • 01-2345678-0",
									"Business Wallet (KES)",
									"Virtual Wallet (KES)",
								].map((w) => (
									<option key={w}>{w}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Amount</label>
							<input className={styles.fc} defaultValue="5000" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Purpose</label>
							<select className={styles.fc} defaultValue={"Withdraw to bank"}>
								{["Withdraw to bank", "Rebalance to float", "Internal transfer"].map(
									(p) => (
										<option key={p}>{p}</option>
									),
								)}
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M22: Manage Rate Locks ============ */}
			<MBox
				id="rateLockModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-lock me-2"
							style={{ color: "var(--pm-purple)" }}
						/>
						Manage Rate Locks
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("hedgeModal")}
						>
							Create New Lock
						</button>
					</>
				}
			>
				{(
					[
						["LK-8821 · USD/KES 129.20", "$12,000 · expires 30 Aug", "Active", styles.badgeS, "hedgeModal", "Extend"],
						["LK-8819 · GBP/KES 165.90", "£8,000 · expires 22 Aug", "Active", styles.badgeS, "hedgeModal", "Extend"],
						["LK-8799 · EUR/KES 139.10", "€5,000 · settled 15 Jul", "Settled", styles.badgeD, "fxStatementModal", "Receipt"],
					] as const
				).map(([title, sub, badge, tone, modal, btn]) => (
					<div className={styles.sr} key={title}>
						<div>
							<strong>{title}</strong>
							<div className={styles.mutedSmall}>{sub}</div>
						</div>
						<div className="d-flex align-items-center" style={{ gap: 8 }}>
							<span className={`${styles.badge} ${tone}`}>{badge}</span>
							<button
								className={`${styles.btnPm} ${styles.btnSm}`}
								onClick={() => onOpen(modal)}
							>
								{btn}
							</button>
						</div>
					</div>
				))}
			</MBox>

			{/* ============ M23: Per-Business FX Limits ============ */}
			<MBox
				id="fxLimitsModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-sliders me-2"
							style={{ color: "var(--pm-purple)" }}
						/>
						Per-Business Conversion Limits
					</>
				}
				footer={actionFooter(
					"fxLimitsModal",
					"Save Limits",
					"Conversion limits updated for Land Buyers LTD.",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"fxLimitsModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Business</label>
							<select className={styles.fc} defaultValue={"Land Buyers LTD"}>
								{["Land Buyers LTD", "Company 2"].map((b) => (
									<option key={b}>{b}</option>
								))}
							</select>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Daily Conversion Limit (KES)</label>
								<input className={styles.fc} defaultValue="5000000" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Max Single Conversion (KES)</label>
								<input className={styles.fc} defaultValue="2500000" />
							</div>
						</div>
						<div className="mt-3">
							<div className="form-check mb-2">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
									id="fxlim1"
								/>
								<label
									className="form-check-label"
									htmlFor="fxlim1"
									style={{ fontSize: 13 }}
								>
									Auto-convert diaspora funds to float (recommended)
								</label>
							</div>
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									id="fxlim2"
								/>
								<label
									className="form-check-label"
									htmlFor="fxlim2"
									style={{ fontSize: 13 }}
								>
									Require PIN for conversions above KES 1M
								</label>
							</div>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M24: FX Access & Permissions ============ */}
			<MBox
				id="fxAccessModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-check me-2"
							style={{ color: "var(--pm-primary-light)" }}
						/>
						FX Permissions &amp; Access
					</>
				}
				footer={actionFooter(
					"fxAccessModal",
					"Request Access",
					"Access request submitted — pending approval by Paymo.",
					undefined,
					"Close",
				)}
			>
				{actionBody(
					"fxAccessModal",
					<>
						{(
							[
								[
									"Convert customer FX to KES",
									"Turn diaspora & card settlements into float fuel",
									true,
								],
								[
									"Lock rates for scheduled payouts",
									"Create & manage rate locks up to KES 20M",
									true,
								],
								[
									"Open new currency wallets",
									"Create USD/EUR/GBP/ZAR sub-wallets",
									true,
								],
								[
									"Cross-border payouts > KES 1M",
									"Supplier & vendor payments above the limit",
									false,
								],
								[
									"Refund diaspora buyers in their currency",
									"Issue GBP/USD/EUR refunds from sub-wallets",
									false,
								],
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

			{/* ============ M25: Convert Diaspora Batch → Float ============ */}
			<MBox
				id="diasporaConvertModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-people me-2"
							style={{ color: "var(--pm-info)" }}
						/>
						Convert Diaspora Batch to Float
					</>
				}
				footer={actionFooter(
					"diasporaConvertModal",
					"Convert & Fund Float",
					"PLT-091 converted to KES 2,360,040 — Land Buyers float funded (RB-9922).",
					"FX-20250808-9922",
				)}
			>
				{actionBody(
					"diasporaConvertModal",
					<>
						<div className={`${styles.summaryBox} mb-3`}>
							<BoxRow label="Batch" value="PLT-091 · Land Buyers LTD" />
							<BoxRow label="Payer" value="Buyer • UK (installment PLT-091)" />
							<BoxRow label="Amount Held" value="GBP 14,200" />
							<BoxRow label="Live Rate" value="166.20 GBP/KES" />
							<BoxRow label="You Receive" value="KES 2,360,040" last />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Destination</label>
							<select className={styles.fc} defaultValue={"Land Buyers float (KES 3.20M / min 3.00M)"}>
								{[
									"Land Buyers float (KES 3.20M / min 3.00M)",
									"Business Wallet (KES 8.40M)",
									"Virtual Wallet (KES 1.25M)",
								].map((d) => (
									<option key={d}>{d}</option>
								))}
							</select>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="dc1"
							/>
							<label
								className="form-check-label"
								htmlFor="dc1"
								style={{ fontSize: 13 }}
							>
								Funds count toward Land Buyers float top-up (RB- ref linked)
							</label>
						</div>
					</>,
				)}
			</MBox>
		</>
	);
}
