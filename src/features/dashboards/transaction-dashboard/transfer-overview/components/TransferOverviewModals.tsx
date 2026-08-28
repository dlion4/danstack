import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/transfer-overview.module.css";

/* ============================================================================
   Transfer Overview Command Center — modal layer (legacy page 1.1, 23 modals)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows loading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     selectBox(el)      → pill selector within a group
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
	const closeRef = useRef<HTMLButtonElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const titleId = `${id}-title`;

	useEffect(() => {
		if (active !== id) return;
		const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
		return () => window.cancelAnimationFrame(frame);
	}, [active, id]);

	const keepFocusInDialog = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Tab") return;
		const focusable = boxRef.current?.querySelectorAll<HTMLElement>(
			'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
		);
		if (!focusable?.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	if (active !== id) return null;
	return (
		<>
			<div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
			<div className={styles.modalWrap}>
				<div
					ref={boxRef}
					className={`${styles.modalBox} ${size === "lg" ? styles.modalBoxLg : ""} ${size === "xl" ? styles.modalBoxXl : ""}`}
					role="dialog"
					onKeyDown={keepFocusInDialog}
					aria-modal="true"
					aria-labelledby={titleId}
				>
					<div className={styles.modalHeader}>
						<h2 id={titleId} className={styles.modalTitle}>
							{title}
						</h2>
						<button
							ref={closeRef}
							type="button"
							className={styles.modalClose}
							aria-label="Close dialog"
							onClick={onClose}
						>
							<i className="bi bi-x-lg" aria-hidden="true" />
						</button>
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

/* ---------- data arrays ---------- */
const BENEFICIARIES = [
	"Grace Kamau — 0712 345 890",
	"Landlord Properties — Bank 0012345678",
	"James Ochieng — 0722 111 222",
	"Equity Bank — 0012345678",
	"New Beneficiary",
];
const TRANSFER_TYPES = ["M-Pesa", "Bank", "Internal", "International"];
const FUNDING_SOURCES = [
	"PayMo Wallet (KES 24,500)",
	"M-Pesa (0712***890)",
	"Equity Bank ****4521",
];
const COUNTRIES = ["United Kingdom", "United States", "Germany"];
const CURRENCIES = ["GBP", "USD", "EUR"];
const PURPOSES = ["Family Support", "Business Payment", "Education"];
const FUND_SOURCES = ["Salary", "Savings", "Business Income"];
const FREQUENCIES = ["Monthly", "Bi-weekly", "Weekly", "One-time"];
const ISSUE_TYPES = [
	"Wrong amount sent",
	"Transfer not received",
	"Wrong beneficiary",
	"Duplicate transfer",
];
const METHODS = ["M-Pesa", "Bank Transfer", "International"];
const BEN_TYPES = ["M-Pesa", "Bank Account", "PayMo Wallet", "International"];

/* LEGACY BRIDGE: flow definitions */
const FLOW_DEFS: Record<string, { labels: string[] }> = {
	init: { labels: ["Beneficiary", "Amount", "Confirm", "Done"] },
	bulk: { labels: ["Upload", "Review", "Pay", "Done"] },
	sched: { labels: ["Details", "Schedule", "Confirm"] },
	intl: { labels: ["Recipient", "Amount", "Compliance", "Done"] },
};

interface Result {
	msg: string;
	ref?: string;
}

function Pills({
	prefix,
	tabs,
	tabsState,
	onSwitch,
}: {
	prefix: string;
	tabs: { key: string; label: string }[];
	tabsState: Record<string, string>;
	onSwitch: (prefix: string, key: string) => void;
}) {
	const current = tabsState[prefix] ?? tabs[0].key;
	return (
		<div className={`${styles.pills} mb-3`}>
			{tabs.map((t) => (
				<button
					type="button"
					key={t.key}
					className={`${styles.pill} ${current === t.key ? styles.pillActive : ""}`}
					onClick={() => onSwitch(prefix, t.key)}
				>
					{t.label}
				</button>
			))}
		</div>
	);
}

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
	const def = FLOW_DEFS[flowKey];
	if (!def) return null;
	return (
		<ol
			className={styles.stepper}
			aria-label={`Step ${current} of ${def.labels.length}`}
		>
			{def.labels.map((label, i) => {
				const stepNum = i + 1;
				const done = stepNum < current;
				const active = stepNum === current;
				return (
					<li
						key={label}
						className={`${styles.stepSegment} ${done ? styles.stepSegmentDone : ""}`}
					>
						<div
							className={`${styles.step} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}
						>
							<div
								className={styles.stepN}
								aria-current={active ? "step" : undefined}
							>
								{done ? (
									<i className="bi bi-check" aria-hidden="true" />
								) : (
									stepNum
								)}
							</div>
							<div className={styles.stepL}>{label}</div>
						</div>
						{i < def.labels.length - 1 && <div className={styles.stepLine} />}
					</li>
				);
			})}
		</ol>
	);
}

export default function TransferOverviewModals({
	active,
	onClose,
	onOpen,
}: ModalsProps) {
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({
		init: 1,
		bulk: 1,
		sched: 1,
		intl: 1,
	});
	const [tabs, setTabs] = useState<Record<string, string>>({});
	const [initType, setInitType] = useState("M-Pesa");

	/* LEGACY BRIDGE: cacheAndReset → fresh state on next open */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ init: 1, bulk: 1, sched: 1, intl: 1 });
			setBusy(null);
			setTabs({});
			setInitType("M-Pesa");
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

	/* PIN auto-focus */
	const pinRef = useRef<(HTMLInputElement | null)[]>([]);
	const handlePinInput = (idx: number) => {
		const el = pinRef.current[idx];
		if (el && el.value.length === 1 && idx < 3) {
			pinRef.current[idx + 1]?.focus();
		}
	};

	/* Receipt renderer (legacy bridge) */
	const renderReceipt = (r: Result) => (
		<div className={styles.receipt}>
			<div className={styles.receiptIcon}>
				<i className="bi bi-check-lg" />
			</div>
			<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>{r.msg}</h5>
			{r.ref && (
				<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
					Reference: {r.ref}
				</p>
			)}
			<div
				className={`${styles.flex} ${styles.justifyCenter} ${styles.mt3}`}
				style={{ gap: 8 }}
			>
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnSm}`}
					onClick={() => downloadFile("receipt.txt", r.msg)}
				>
					<i className="bi bi-download" /> Save
				</button>
				<button type="button" className={`${styles.btnPm} ${styles.btnSm}`}>
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
     M1: Initiate Transfer (Multi-step, 4 steps)
     ======================================================================== */
	const renderInitiateTransfer = () => {
		const step = flows.init;
		return (
			<MBox
				id="initiateTransferModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className={`bi bi-send ${styles.iconGreen} ${styles.modalIcon}`}
						/>
						Initiate Transfer
					</>
				}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => nextFlow("init", 4)}
						>
							{step >= 4 ? (
								"Done"
							) : step === 3 ? (
								<>
									Send Money <i className="bi bi-send" />
								</>
							) : (
								<>
									Continue <i className="bi bi-arrow-right" />
								</>
							)}
						</button>
					</>
				}
			>
				<Stepper flowKey="init" current={step} />
				{step === 1 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 1: Select Beneficiary</h6>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-01">
								Search or Select
							</label>
							<select className={styles.formControl} id="transfer-field-01">
								{BENEFICIARIES.map((b) => (
									<option key={b}>{b}</option>
								))}
							</select>
						</div>
						<div className={styles.mb3}>
							<div className={styles.formLabel}>Transfer Type</div>
							<div className={styles.pills}>
								{TRANSFER_TYPES.map((t) => (
									<button
										type="button"
										key={t}
										className={`${styles.pill} ${initType === t ? styles.pillActive : ""}`}
										onClick={() => setInitType(t)}
									>
										{t}
									</button>
								))}
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 2: Amount & Details</h6>
						<div className={styles.row3}>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-02">
									Amount (KES)
								</label>
								<input
									className={styles.formControl}
									defaultValue="12500"
									id="transfer-field-02"
								/>
							</div>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-03">
									Reference / Note
								</label>
								<input
									className={styles.formControl}
									defaultValue="Rent June 2025"
									id="transfer-field-03"
								/>
							</div>
						</div>
						<div className={styles.mt3}>
							<label className={styles.formLabel} htmlFor="transfer-field-04">
								Funding Source
							</label>
							<select className={styles.formControl} id="transfer-field-04">
								{FUNDING_SOURCES.map((f) => (
									<option key={f}>{f}</option>
								))}
							</select>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 3: Review & Confirm</h6>
						<div className={styles.reviewBox}>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>To</span>
								<strong>Grace Kamau</strong>
							</div>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>Amount</span>
								<strong>KES 12,500</strong>
							</div>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>Fee</span>
								<strong>KES 0</strong>
							</div>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>Total</span>
								<strong style={{ color: "var(--pm-primary)" }}>
									KES 12,500
								</strong>
							</div>
						</div>
						<div className={`${styles.formLabel} mt-3`}>Enter PIN</div>
						<div className={styles.pinRow}>
							{[0, 1, 2, 3].map((i) => (
								<input
									key={i}
									ref={(el) => {
										pinRef.current[i] = el;
									}}
									type="password"
									maxLength={1}
									onChange={() => handlePinInput(i)}
								/>
							))}
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.receiptIcon}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
								Transfer Successful!
							</h5>
							<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
								KES 12,500 sent to Grace Kamau via M-Pesa.
							</p>
							<div
								className={`${styles.p3} ${styles.rounded} ${styles.textStart} ${styles.mt3}`}
								style={{ background: "#fff", fontSize: 13 }}
							>
								<div
									className={`${styles.flex} ${styles.justifyBetween} ${styles.mb2}`}
								>
									<span className={styles.textMuted}>Reference</span>
									<strong>TRF-448291</strong>
								</div>
								<div
									className={`${styles.flex} ${styles.justifyBetween} ${styles.mb2}`}
								>
									<span className={styles.textMuted}>Transaction ID</span>
									<strong>MPESA-9K2M4P</strong>
								</div>
								<div className={`${styles.flex} ${styles.justifyBetween}`}>
									<span className={styles.textMuted}>Time</span>
									<strong>27 Jun 2025, 14:32</strong>
								</div>
							</div>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M2: Bulk Transfer (Multi-step, 4 steps)
     ======================================================================== */
	const renderBulkTransfer = () => {
		const step = flows.bulk;
		return (
			<MBox
				id="bulkTransferModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className={`bi bi-collection ${styles.iconBlue} ${styles.modalIcon}`}
						/>
						Bulk Transfer
					</>
				}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => nextFlow("bulk", 4)}
						>
							{step >= 4 ? (
								"Done"
							) : (
								<>
									Continue <i className="bi bi-arrow-right" />
								</>
							)}
						</button>
					</>
				}
			>
				<Stepper flowKey="bulk" current={step} />
				{step === 1 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 1: Upload Beneficiaries</h6>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-05">
								Upload CSV
							</label>
							<input
								type="file"
								className={styles.formControl}
								id="transfer-field-05"
							/>
						</div>
						<div className={styles.infoCallout}>
							<i className="bi bi-info-circle me-1" /> CSV format: Name,
							Phone/Bank, Amount, Reference
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 2: Review List</h6>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Account</th>
										<th>Amount</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Grace Kamau</td>
										<td>0712 345 890</td>
										<td>KES 12,500</td>
									</tr>
									<tr>
										<td>John Otieno</td>
										<td>0722 111 222</td>
										<td>KES 8,000</td>
									</tr>
									<tr>
										<td>Landlord Ltd</td>
										<td>Bank 0012345678</td>
										<td>KES 45,000</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 3: Confirm & Pay</h6>
						<div className={styles.reviewBox}>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>Total Beneficiaries</span>
								<strong>3</strong>
							</div>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>Total Amount</span>
								<strong>KES 65,500</strong>
							</div>
							<div className={styles.reviewRow}>
								<span className={styles.reviewLabel}>Total Fee</span>
								<strong>KES 0</strong>
							</div>
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.receiptIcon}>
								<i className="bi bi-check-all" />
							</div>
							<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
								Bulk Transfer Complete
							</h5>
							<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
								3 transfers processed successfully.
							</p>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M3: Schedule Transfer (Multi-step, 3 steps)
     ======================================================================== */
	const renderScheduleTransfer = () => {
		const step = flows.sched;
		return (
			<MBox
				id="scheduleTransferModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className={`bi bi-calendar-event ${styles.iconGreen} ${styles.modalIcon}`}
						/>
						Schedule Transfer
					</>
				}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => nextFlow("sched", 3)}
						>
							{step >= 3 ? (
								"Done"
							) : (
								<>
									Continue <i className="bi bi-arrow-right" />
								</>
							)}
						</button>
					</>
				}
			>
				<Stepper flowKey="sched" current={step} />
				{step === 1 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 1: Beneficiary & Amount</h6>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-06">
								Beneficiary
							</label>
							<select className={styles.formControl} id="transfer-field-06">
								<option>Grace Kamau</option>
								<option>Landlord Properties</option>
							</select>
						</div>
						<div className={styles.row3}>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-07">
									Amount
								</label>
								<input
									className={styles.formControl}
									defaultValue="45000"
									id="transfer-field-07"
								/>
							</div>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-08">
									Frequency
								</label>
								<select className={styles.formControl} id="transfer-field-08">
									{FREQUENCIES.map((f) => (
										<option key={f}>{f}</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 2: Schedule Details</h6>
						<div className={styles.row3}>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-09">
									Start Date
								</label>
								<input
									type="date"
									className={styles.formControl}
									defaultValue="2025-07-01"
									id="transfer-field-09"
								/>
							</div>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-10">
									End Date (optional)
								</label>
								<input
									type="date"
									className={styles.formControl}
									id="transfer-field-10"
								/>
							</div>
						</div>
						<div className={`${styles.mb3} ${styles.mt3}`}>
							<label className={styles.formLabel} htmlFor="transfer-field-11">
								Funding Source
							</label>
							<select className={styles.formControl} id="transfer-field-11">
								<option>PayMo Wallet</option>
								<option>M-Pesa</option>
								<option>Bank</option>
							</select>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.receiptIcon}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
								Schedule Created
							</h5>
							<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
								Your recurring transfer has been scheduled successfully.
							</p>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M4: Manage Beneficiaries (pill tabs)
     ======================================================================== */
	const renderManageBeneficiaries = () => (
		<MBox
			id="manageBeneficiariesModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-person-plus ${styles.iconAmber} ${styles.modalIcon}`}
					/>
					Manage Beneficiaries
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Close
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() => onOpen("addBeneficiaryModal")}
					>
						Add New Beneficiary
					</button>
				</>
			}
		>
			<Pills
				prefix="ben"
				tabs={[
					{ key: "list", label: "All" },
					{ key: "favorites", label: "Favorites" },
					{ key: "recent", label: "Recent" },
				]}
				tabsState={tabs}
				onSwitch={switchTab}
			/>
			{(tabs.ben ?? "list") === "list" && (
				<div className={styles.tpanelActive}>
					<div className="table-responsive">
						<table className={styles.tbl}>
							<thead>
								<tr>
									<th>Name</th>
									<th>Account</th>
									<th>Type</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Grace Kamau</td>
									<td>0712 345 890</td>
									<td>M-Pesa</td>
									<td>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => onOpen("editBeneficiaryModal")}
										>
											Edit
										</button>{" "}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => onOpen("initiateTransferModal")}
										>
											Send
										</button>
									</td>
								</tr>
								<tr>
									<td>Landlord Properties</td>
									<td>Bank 0012345678</td>
									<td>Bank</td>
									<td>
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => onOpen("editBeneficiaryModal")}
										>
											Edit
										</button>{" "}
										<button
											type="button"
											className={`${styles.btnPm} ${styles.btnSm}`}
											onClick={() => onOpen("initiateTransferModal")}
										>
											Send
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			)}
			{tabs.ben === "favorites" && (
				<div className={styles.tpanelActive}>
					<div className={styles.sr}>
						<div>
							<strong>Grace Kamau</strong>
						</div>
						<button type="button" className={`${styles.btnPm} ${styles.btnSm}`}>
							Remove from Favorites
						</button>
					</div>
					<div className={styles.sr}>
						<div>
							<strong>Landlord Properties</strong>
						</div>
						<button type="button" className={`${styles.btnPm} ${styles.btnSm}`}>
							Remove from Favorites
						</button>
					</div>
				</div>
			)}
			{tabs.ben === "recent" && (
				<div className={styles.tpanelActive}>
					<div className={styles.sr}>
						<div>
							<strong>James Ochieng</strong>
						</div>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnSm}`}
							onClick={() => onOpen("addBeneficiaryModal")}
						>
							Add to Favorites
						</button>
					</div>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
     M5: Add Beneficiary
     ======================================================================== */
	const renderAddBeneficiary = () => (
		<MBox
			id="addBeneficiaryModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-person-plus ${styles.iconGreen} ${styles.modalIcon}`}
					/>
					Add Beneficiary
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction("addBeneficiaryModal", "Beneficiary added successfully!")
						}
					>
						Add Beneficiary
					</button>
				</>
			}
		>
			{renderActionBody(
				"addBeneficiaryModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-12">
							Name
						</label>
						<input
							className={styles.formControl}
							defaultValue="Mary Wanjiku"
							id="transfer-field-12"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-13">
							Phone / Account
						</label>
						<input
							className={styles.formControl}
							defaultValue="0733 222 111"
							id="transfer-field-13"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-14">
							Type
						</label>
						<select className={styles.formControl} id="transfer-field-14">
							{BEN_TYPES.map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
							id="transfer-check-01"
						/>
						<label
							className="form-check-label"
							style={{ fontSize: 13 }}
							htmlFor="transfer-check-01"
						>
							Add to Favorites
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M6: Transfer Detail
     ======================================================================== */
	const renderTransferDetail = () => (
		<MBox
			id="transferDetailModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-text me-2" />
					Transfer Details
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={`${styles.reviewBox} mb-3`}>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>Reference</span>
					<strong>TRF-448291</strong>
				</div>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>Amount</span>
					<strong>KES 12,500</strong>
				</div>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>To</span>
					<strong>Grace Kamau</strong>
				</div>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>Method</span>
					<strong>M-Pesa</strong>
				</div>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>Status</span>
					<span className={`${styles.badge} ${styles.badgeS}`}>Success</span>
				</div>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>Date</span>
					<strong>27 Jun 2025, 14:32</strong>
				</div>
			</div>
			<div className={`${styles.flex} ${styles.justifyCenter} ${styles.gap2}`}>
				<button type="button" className={`${styles.btnPm} ${styles.btnSm}`}>
					<i className="bi bi-download" /> Receipt
				</button>
				<button type="button" className={`${styles.btnPm} ${styles.btnSm}`}>
					<i className="bi bi-share" /> Share
				</button>
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnSm}`}
					onClick={() => onOpen("disputeTransferModal")}
				>
					Report Issue
				</button>
			</div>
		</MBox>
	);

	/* ==========================================================================
     M7: Edit Schedule
     ======================================================================== */
	const renderEditSchedule = () => (
		<MBox
			id="editScheduleModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-pencil me-2" />
					Edit Schedule
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction("editScheduleModal", "Schedule updated successfully!")
						}
					>
						Save Changes
					</button>
				</>
			}
		>
			{renderActionBody(
				"editScheduleModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-15">
							Amount
						</label>
						<input
							className={styles.formControl}
							defaultValue="45000"
							id="transfer-field-15"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-16">
							Frequency
						</label>
						<select className={styles.formControl} id="transfer-field-16">
							<option>Monthly</option>
							<option>Bi-weekly</option>
						</select>
					</div>
					<div className="form-check form-switch mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
							id="transfer-check-02"
						/>
						<label className="form-check-label" htmlFor="transfer-check-02">
							Active
						</label>
					</div>
					<div className="form-check form-switch">
						<input
							className="form-check-input"
							type="checkbox"
							id="transfer-check-03"
						/>
						<label className="form-check-label" htmlFor="transfer-check-03">
							Notify before execution
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M8: International Transfer (Multi-step, 4 steps)
     ======================================================================== */
	const renderInternationalTransfer = () => {
		const step = flows.intl;
		return (
			<MBox
				id="internationalTransferModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className={`bi bi-globe ${styles.iconRed} ${styles.modalIcon}`}
						/>
						International Transfer
					</>
				}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							type="button"
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => nextFlow("intl", 4)}
						>
							{step >= 4 ? (
								"Done"
							) : step === 3 ? (
								<>
									Confirm Transfer <i className="bi bi-globe" />
								</>
							) : (
								<>
									Continue <i className="bi bi-arrow-right" />
								</>
							)}
						</button>
					</>
				}
			>
				<Stepper flowKey="intl" current={step} />
				{step === 1 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 1: Recipient Details</h6>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-17">
								Country
							</label>
							<select className={styles.formControl} id="transfer-field-17">
								{COUNTRIES.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-18">
								Recipient Name
							</label>
							<input
								className={styles.formControl}
								defaultValue="John Smith"
								id="transfer-field-18"
							/>
						</div>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-19">
								Account / IBAN
							</label>
							<input
								className={styles.formControl}
								defaultValue="GB29NWBK60161331926819"
								id="transfer-field-19"
							/>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 2: Amount & Fees</h6>
						<div className={styles.row3}>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-20">
									Amount (KES)
								</label>
								<input
									className={styles.formControl}
									defaultValue="150000"
									id="transfer-field-20"
								/>
							</div>
							<div className={styles.colMd6}>
								<label className={styles.formLabel} htmlFor="transfer-field-21">
									Currency
								</label>
								<select className={styles.formControl} id="transfer-field-21">
									{CURRENCIES.map((c) => (
										<option key={c}>{c}</option>
									))}
								</select>
							</div>
						</div>
						<div className={`${styles.warnCallout} mt-3`}>
							<i className="bi bi-info-circle me-1" /> Estimated fee: KES 2,850
							| Exchange rate: 1 KES = 0.0058 GBP
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={styles.fstepActive}>
						<h6 className={styles.stepTitle}>Step 3: Compliance</h6>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-22">
								Purpose of Transfer
							</label>
							<select className={styles.formControl} id="transfer-field-22">
								{PURPOSES.map((p) => (
									<option key={p}>{p}</option>
								))}
							</select>
						</div>
						<div className={styles.mb3}>
							<label className={styles.formLabel} htmlFor="transfer-field-23">
								Source of Funds
							</label>
							<select className={styles.formControl} id="transfer-field-23">
								{FUND_SOURCES.map((s) => (
									<option key={s}>{s}</option>
								))}
							</select>
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={styles.fstepActive}>
						<div className={styles.receipt}>
							<div className={styles.receiptIcon}>
								<i className="bi bi-check-lg" />
							</div>
							<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
								International Transfer Initiated
							</h5>
							<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
								Your transfer is being processed. Expected delivery: 1-3
								business days.
							</p>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
     M9: QR Pay
     ======================================================================== */
	const renderQrPay = () => (
		<MBox
			id="qrPayModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-qr-code ${styles.iconGreen} ${styles.modalIcon}`}
					/>
					QR Pay
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction(
								"qrPayModal",
								"QR code generated! Recipient can scan to pay.",
							)
						}
					>
						Generate QR
					</button>
				</>
			}
		>
			{renderActionBody(
				"qrPayModal",
				<div className={styles.textCenter}>
					<div className={`${styles.reviewBox} mb-3`} style={{ padding: 24 }}>
						<div
							style={{
								width: 180,
								height: 180,
								background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
								margin: "0 auto",
								borderRadius: 12,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#fff",
							}}
						>
							<div>
								<i className="bi bi-qr-code" style={{ fontSize: 80 }} />
								<div style={{ marginTop: 8, fontWeight: 700 }}>Scan to Pay</div>
							</div>
						</div>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-24">
							Amount (KES)
						</label>
						<input
							className={styles.formControl}
							defaultValue="2500"
							id="transfer-field-24"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-25">
							Reference
						</label>
						<input
							className={styles.formControl}
							defaultValue="Lunch payment"
							id="transfer-field-25"
						/>
					</div>
				</div>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M10: Transfer Limits
     ======================================================================== */
	const renderTransferLimits = () => (
		<MBox
			id="transferLimitsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-sliders me-2" />
					Transfer Limits & Security
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction(
								"transferLimitsModal",
								"Transfer limits updated successfully!",
							)
						}
					>
						Save Limits
					</button>
				</>
			}
		>
			{renderActionBody(
				"transferLimitsModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-26">
							Daily Limit
						</label>
						<input
							className={styles.formControl}
							defaultValue="500000"
							id="transfer-field-26"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-27">
							Per Transaction Limit
						</label>
						<input
							className={styles.formControl}
							defaultValue="200000"
							id="transfer-field-27"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-28">
							International Limit
						</label>
						<input
							className={styles.formControl}
							defaultValue="100000"
							id="transfer-field-28"
						/>
					</div>
					<div className="form-check form-switch mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
							id="transfer-check-04"
						/>
						<label className="form-check-label" htmlFor="transfer-check-04">
							Require PIN for transfers above KES 10,000
						</label>
					</div>
					<div className="form-check form-switch">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
							id="transfer-check-05"
						/>
						<label className="form-check-label" htmlFor="transfer-check-05">
							Require 2FA for international transfers
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M11: Retry Transfer
     ======================================================================== */
	const renderRetryTransfer = () => (
		<MBox
			id="retryTransferModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-arrow-repeat ${styles.iconAmber} ${styles.modalIcon}`}
					/>
					Retry Failed Transfer
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction("retryTransferModal", "Transfer retried successfully!")
						}
					>
						Retry Now
					</button>
				</>
			}
		>
			{renderActionBody(
				"retryTransferModal",
				<>
					<div className={`${styles.warnCallout} mb-3`}>
						<div className={styles.notifTitle} style={{ color: "#B45309" }}>
							Failed Transfer Details
						</div>
						<div style={{ fontSize: 14, marginTop: 4 }}>
							Landlord Properties — KES 35,000
						</div>
						<div className={styles.notifDesc} style={{ color: "#92400E" }}>
							Reason: Insufficient funds in M-Pesa
						</div>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-29">
							New Funding Source
						</label>
						<select className={styles.formControl} id="transfer-field-29">
							<option>PayMo Wallet (KES 24,500)</option>
							<option>Equity Bank ****4521</option>
						</select>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     M12: Transfer Analytics (XL, pill tabs)
     ======================================================================== */
	const renderTransferAnalytics = () => (
		<MBox
			id="transferAnalyticsModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bar-chart-line me-2" />
					Transfer Analytics
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<Pills
				prefix="an"
				tabs={[
					{ key: "volume", label: "Volume" },
					{ key: "success", label: "Success Rate" },
					{ key: "recipients", label: "Recipients" },
				]}
				tabsState={tabs}
				onSwitch={switchTab}
			/>
			{(tabs.an ?? "volume") === "volume" && (
				<div className={styles.tpanelActive}>
					<div className={styles.chartBars} style={{ height: 120 }}>
						{[
							{ h: "60%", c: "var(--pm-primary)", l: "Jan" },
							{ h: "75%", c: "var(--pm-primary)", l: "Feb" },
							{ h: "90%", c: "var(--pm-warning)", l: "Mar" },
							{ h: "82%", c: "var(--pm-primary)", l: "Apr" },
							{ h: "100%", c: "var(--pm-accent)", l: "May" },
							{ h: "95%", c: "var(--pm-primary)", l: "Jun" },
						].map((b) => (
							<div
								key={b.l}
								className={styles.chartBar}
								style={{ height: b.h, background: b.c }}
							>
								<span className={styles.barLabel}>{b.l}</span>
							</div>
						))}
					</div>
				</div>
			)}
			{tabs.an === "success" && (
				<div className={styles.tpanelActive}>
					<div className="table-responsive">
						<table className={styles.tbl}>
							<thead>
								<tr>
									<th>Channel</th>
									<th>Success Rate</th>
									<th>Failed</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>M-Pesa</td>
									<td>
										<span className={`${styles.badge} ${styles.badgeS}`}>
											99.4%
										</span>
									</td>
									<td>7</td>
								</tr>
								<tr>
									<td>Bank</td>
									<td>
										<span className={`${styles.badge} ${styles.badgeS}`}>
											97.8%
										</span>
									</td>
									<td>12</td>
								</tr>
								<tr>
									<td>International</td>
									<td>
										<span className={`${styles.badge} ${styles.badgeW}`}>
											94.1%
										</span>
									</td>
									<td>3</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			)}
			{tabs.an === "recipients" && (
				<div className={styles.tpanelActive}>
					<div className={styles.sr}>
						<div>
							<strong>Grace Kamau</strong>
						</div>
						<strong>24 transfers</strong>
					</div>
					<div className={styles.sr}>
						<div>
							<strong>Landlord Properties</strong>
						</div>
						<strong>6 transfers</strong>
					</div>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
     M13–M23: Simple modals
     ======================================================================== */
	const renderSecurityCheck = () => (
		<MBox
			id="securityCheckModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-shield-check ${styles.iconGreen} ${styles.modalIcon}`}
					/>
					Transfer Security
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={styles.row3}>
				<div className={styles.colMd4}>
					<div
						className={`${styles.p3} ${styles.rounded} ${styles.textCenter}`}
						style={{ background: "var(--pm-accent-soft)" }}
					>
						<div
							style={{
								fontSize: 28,
								fontWeight: 800,
								color: "var(--pm-accent)",
							}}
						>
							96
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#047857" }}>
							SECURITY SCORE
						</div>
					</div>
				</div>
				<div className={styles.colMd4}>
					<div
						className={`${styles.p3} ${styles.rounded} ${styles.textCenter}`}
						style={{ background: "var(--pm-info-soft)" }}
					>
						<div
							style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-info)" }}
						>
							2FA
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8" }}>
							ENABLED
						</div>
					</div>
				</div>
				<div className={styles.colMd4}>
					<div
						className={`${styles.p3} ${styles.rounded} ${styles.textCenter}`}
						style={{ background: "var(--pm-warning-soft)" }}
					>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-warning)",
							}}
						>
							14d
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#B45309" }}>
							LAST REVIEW
						</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	const renderTransferNotif = () => (
		<MBox
			id="transferNotifModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bell me-2" />
					Transfer Notifications
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div
				className={`${styles.notifCard} mb-2`}
				style={{ background: "var(--pm-danger-soft)" }}
			>
				<div className={styles.notifTitle}>Scheduled transfer failed</div>
				<div className={styles.notifDesc}>Landlord Properties — KES 35,000</div>
			</div>
			<div
				className={`${styles.notifCard} mb-2`}
				style={{ background: "var(--pm-warning-soft)" }}
			>
				<div className={styles.notifTitle}>Large transfer pending approval</div>
				<div className={styles.notifDesc}>KES 450,000 to James Ochieng</div>
			</div>
			<div
				className={`${styles.notifCard} mb-2`}
				style={{ background: "var(--pm-accent-soft)" }}
			>
				<div className={styles.notifTitle}>Recurring payment executed</div>
				<div className={styles.notifDesc}>Grace Kamau — KES 15,000</div>
			</div>
		</MBox>
	);

	const renderProfile = () => (
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
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={styles.textCenter}>
				<div
					className={`${styles.avatar} mx-auto mb-3`}
					style={{ width: 64, height: 64, fontSize: 24 }}
				>
					JK
				</div>
				<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
				<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
					james.k@email.com · +254 712 345 890
				</p>
				<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
					<div className="col-6">
						<div className={styles.reviewBox}>
							<span className={styles.reviewLabel}>Transfers</span>
							<br />
							<strong>1,248 this month</strong>
						</div>
					</div>
					<div className="col-6">
						<div className={styles.reviewBox}>
							<span className={styles.reviewLabel}>Security</span>
							<br />
							<strong style={{ color: "var(--pm-accent)" }}>96/100</strong>
						</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	const renderAttention = () => (
		<MBox
			id="attentionModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-exclamation-circle ${styles.iconAmber} ${styles.modalIcon}`}
					/>
					All Attention Items
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={styles.sr}>
				<div>
					<strong>Scheduled transfer failed</strong>
				</div>
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnSm}`}
					onClick={() => onOpen("retryTransferModal")}
				>
					Retry
				</button>
			</div>
			<div className={styles.sr}>
				<div>
					<strong>3 recurring payments need funding source</strong>
				</div>
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnSm}`}
					onClick={() => onOpen("manageBeneficiariesModal")}
				>
					Update
				</button>
			</div>
			<div className={styles.sr}>
				<div>
					<strong>Large transfer pending approval</strong>
				</div>
				<button
					type="button"
					className={`${styles.btnPm} ${styles.btnSm}`}
					onClick={() => onOpen("initiateTransferModal")}
				>
					Approve
				</button>
			</div>
		</MBox>
	);

	const renderDispute = () => (
		<MBox
			id="disputeTransferModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i
						className={`bi bi-exclamation-triangle ${styles.iconRed} ${styles.modalIcon}`}
					/>
					Report Transfer Issue
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction(
								"disputeTransferModal",
								"Dispute submitted. Reference: DSP-88291",
								"DSP-88291",
							)
						}
					>
						Submit
					</button>
				</>
			}
		>
			{renderActionBody(
				"disputeTransferModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-30">
							Issue Type
						</label>
						<select className={styles.formControl} id="transfer-field-30">
							{ISSUE_TYPES.map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-31">
							Description
						</label>
						<textarea
							className={styles.formControl}
							rows={3}
							defaultValue="The transfer was sent to the wrong number."
							id="transfer-field-31"
						/>
					</div>
				</>,
			)}
		</MBox>
	);

	const renderEditBeneficiary = () => (
		<MBox
			id="editBeneficiaryModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-pencil me-2" />
					Edit Beneficiary
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction(
								"editBeneficiaryModal",
								"Beneficiary updated successfully!",
							)
						}
					>
						Save Changes
					</button>
				</>
			}
		>
			{renderActionBody(
				"editBeneficiaryModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-32">
							Name
						</label>
						<input
							className={styles.formControl}
							defaultValue="Grace Kamau"
							id="transfer-field-32"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-33">
							Phone / Account
						</label>
						<input
							className={styles.formControl}
							defaultValue="0712 345 890"
							id="transfer-field-33"
						/>
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
							id="transfer-check-06"
						/>
						<label
							className="form-check-label"
							style={{ fontSize: 13 }}
							htmlFor="transfer-check-06"
						>
							Favorite
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	const renderFeeCalc = () => (
		<MBox
			id="feeCalcModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-calculator me-2" />
					Transfer Fee Calculator
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={styles.mb3}>
				<label className={styles.formLabel} htmlFor="transfer-field-34">
					Amount (KES)
				</label>
				<input
					className={styles.formControl}
					defaultValue="50000"
					id="transfer-field-34"
				/>
			</div>
			<div className={styles.mb3}>
				<label className={styles.formLabel} htmlFor="transfer-field-35">
					Method
				</label>
				<select className={styles.formControl} id="transfer-field-35">
					{METHODS.map((m) => (
						<option key={m}>{m}</option>
					))}
				</select>
			</div>
			<div className={styles.reviewBox}>
				<div className={styles.reviewRow}>
					<span className={styles.reviewLabel}>Estimated Fee</span>
					<strong>KES 35</strong>
				</div>
			</div>
		</MBox>
	);

	const renderTransferHistory = () => (
		<MBox
			id="transferHistoryModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-clock-history me-2" />
					Full Transfer History
				</>
			}
			footer={
				<button type="button" className={styles.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={`${styles.flex} ${styles.gap2} ${styles.mb3}`}>
				<select className={styles.formControl} style={{ width: "auto" }}>
					<option>All Methods</option>
					<option>M-Pesa</option>
					<option>Bank</option>
				</select>
				<input
					className={styles.formControl}
					style={{ width: 200 }}
					placeholder="Search reference"
				/>
			</div>
			<div className="table-responsive">
				<table className={styles.tbl}>
					<thead>
						<tr>
							<th>Date</th>
							<th>Beneficiary</th>
							<th>Amount</th>
							<th>Method</th>
							<th>Status</th>
							<th>Ref</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>27 Jun</td>
							<td>Grace Kamau</td>
							<td>KES 12,500</td>
							<td>M-Pesa</td>
							<td>
								<span className={`${styles.badge} ${styles.badgeS}`}>
									Success
								</span>
							</td>
							<td>TRF-448291</td>
						</tr>
						<tr>
							<td>26 Jun</td>
							<td>Landlord</td>
							<td>KES 45,000</td>
							<td>Bank</td>
							<td>
								<span className={`${styles.badge} ${styles.badgeS}`}>
									Success
								</span>
							</td>
							<td>TRF-447820</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	const renderFavoritesQuick = () => (
		<MBox
			id="favoritesQuickModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-star me-2" />
					Quick Send to Favorite
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction("favoritesQuickModal", "Transfer sent successfully!")
						}
					>
						Send Now
					</button>
				</>
			}
		>
			{renderActionBody(
				"favoritesQuickModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-36">
							Amount (KES)
						</label>
						<input
							className={styles.formControl}
							defaultValue="5000"
							id="transfer-field-36"
						/>
					</div>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-37">
							Note
						</label>
						<input
							className={styles.formControl}
							defaultValue="Quick payment"
							id="transfer-field-37"
						/>
					</div>
				</>,
			)}
		</MBox>
	);

	const renderAddToFavorites = () => (
		<MBox
			id="addToFavoritesModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-star me-2" />
					Add to Favorites
				</>
			}
			footer={
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btnPm} ${styles.btnPmP}`}
						onClick={() =>
							doAction("addToFavoritesModal", "Added to favorites!")
						}
					>
						Add
					</button>
				</>
			}
		>
			{renderActionBody(
				"addToFavoritesModal",
				<>
					<div className={styles.mb3}>
						<label className={styles.formLabel} htmlFor="transfer-field-38">
							Nickname
						</label>
						<input
							className={styles.formControl}
							defaultValue="My Landlord"
							id="transfer-field-38"
						/>
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
							id="transfer-check-07"
						/>
						<label
							className="form-check-label"
							style={{ fontSize: 13 }}
							htmlFor="transfer-check-07"
						>
							Enable quick-send
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* ==========================================================================
     Render all modals
     ======================================================================== */
	return (
		<>
			{renderInitiateTransfer()}
			{renderBulkTransfer()}
			{renderScheduleTransfer()}
			{renderManageBeneficiaries()}
			{renderAddBeneficiary()}
			{renderTransferDetail()}
			{renderEditSchedule()}
			{renderInternationalTransfer()}
			{renderQrPay()}
			{renderTransferLimits()}
			{renderRetryTransfer()}
			{renderTransferAnalytics()}
			{renderSecurityCheck()}
			{renderTransferNotif()}
			{renderProfile()}
			{renderAttention()}
			{renderDispute()}
			{renderEditBeneficiary()}
			{renderFeeCalc()}
			{renderTransferHistory()}
			{renderFavoritesQuick()}
			{renderAddToFavorites()}
		</>
	);
}