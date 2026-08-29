import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/customers.module.css";

/* ============================================================================
   Customers, Billing & Reminders — modal layer (facilitator edition)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; shows legacy showLoading spinner,
                          then swaps body to a receipt (exact legacy behavior)
     nextFlow(key,total)→ `flows` state with stepper + receipt last step
     sw(prefix,key,btn) → `tabs` state (pill switcher)
     selectBox(el)      → `onboardType` state (customer type picker)
     cacheAndReset()    → useEffect on close resets flows + results + tabs
   ========================================================================== */

interface ModalsProps {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	onToast?: (message: string, variant?: "success" | "danger") => void;
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

const CUSTOMERS = [
	"John Ochieng (CUS-0001)",
	"Amina Hassan (CUS-0002)",
	"Nia Textiles (CUS-0101)",
	"Zawadi Beauty (CUS-0103)",
];
const DECISIONS = [
	"Approve — Auto-verified",
	"Approve — Manual override",
	"Request more documents",
	"Reject — Fraud suspected",
	"Reject — Incomplete",
];
const BILLING_MODELS = [
	"One-off payment",
	"Recurring plan (weekly)",
	"Recurring plan (monthly)",
	"Recurring plan (quarterly)",
	"Auto-bill (open-ended)",
];
const FREQUENCIES = ["Weekly", "Monthly", "Quarterly"];
const CLOSE_REASONS = [
	"Customer request",
	"Plan completed (final installment)",
	"Non-payment (3+ failed attempts)",
	"Duplicate plan",
	"Customer switched to one-off",
];
const SETTLE_DESTS = [
	"M-Pesa 0712***678 (original method)",
	"PayMo Business Wallet",
	"External Bank (Equity ****4521)",
];
const TICKET_CATEGORIES = [
	"KYC / Onboarding",
	"Billing / Payment",
	"Refund",
	"Reminder / Communication",
	"Technical Issue",
];
const TICKET_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const REPORT_TYPES = [
	"Customer Directory (CSV)",
	"Billing & Recurring Plans",
	"Reminder Delivery Log",
	"Refund Ledger",
	"KYC Status Summary",
];
const FORMATS = ["PDF", "Excel", "CSV"];
const SEGMENTS = ["Land Buyers LTD", "Company 2", "All customers"];
const SOURCES_OF_FUNDS = [
	"Salary / Employment",
	"Business Income",
	"Rental / Installment income",
	"Savings",
	"Other",
];
const NATIONALITIES = ["Kenyan", "Ugandan", "Tanzanian", "Other"];
const REMIND_CHANNELS = ["SMS", "Email", "WhatsApp"];
const REMIND_TEMPLATES = [
	"Subscription / installment due",
	"Payment failed — insufficient funds",
	"Payment method expiring",
	"Custom message",
];
const REFUND_REASONS = [
	"Duplicate charge",
	"Wrong amount charged",
	"Order cancellation",
	"Hardship waiver",
	"Partial order return",
];

/* Facilitator: 8-step adaptive onboarding wizard */
const ONBOARD_LABELS = [
	"Type",
	"Identity",
	"KYC & Docs",
	"Location",
	"Payment",
	"Billing",
	"Permissions",
	"Review",
];
const ONBOARD_TYPES = [
	{ icon: "bi-person", label: "Individual", color: "var(--pm-primary-light)" },
	{ icon: "bi-building", label: "Business", color: "var(--pm-info)" },
	{ icon: "bi-credit-card-2-front", label: "PSP / Merchant", color: "var(--pm-warning)" },
	{ icon: "bi-house-door", label: "Tenant / Recurring", color: "var(--pm-accent)" },
];
/* Deep-submission types need directors, compliance Q, settlement bank */
const DEEP_KYC_TYPES = ["PSP / Merchant", "Business"];

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
	const currentTab = tabsState[prefix] ?? tabs[0].key;
	return (
		<div className={`${styles.pills} mb-3`}>
			{tabs.map((t) => (
				<button
					key={t.key}
					className={`${styles.pill} ${currentTab === t.key ? styles.pillActive : ""}`}
					onClick={() => onSwitch(prefix, t.key)}
				>
					{t.label}
				</button>
			))}
		</div>
	);
}

export default function CustomersModals({
	active,
	onClose,
	onOpen,
	onToast,
}: ModalsProps) {
	/* ---------- doAction / nextFlow / busy state ---------- */
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flow, setFlow] = useState(1);
	const [tabs, setTabs] = useState<Record<string, string>>({});
	const [onboardType, setOnboardType] = useState("Individual");
	const [wizGps, setWizGps] = useState("");

	/* ---------- LEGACY BRIDGE: cacheAndReset → fresh state on next open ---------- */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlow(1);
			setBusy(null);
			setTabs({});
			setOnboardType("Individual");
			setWizGps("");
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
			onToast?.(msg, "success");
		}, 1500);
	};

	/* ---------- LEGACY BRIDGE: nextFlow('onboard', 4) ---------- */
	const nextFlow = () => {
		if (flow === ONBOARD_LABELS.length - 1) {
			setBusy("onboardCustomerModal");
			busyTimer.current = window.setTimeout(() => {
				setFlow(ONBOARD_LABELS.length);
				setBusy(null);
				onToast?.("Customer onboarded successfully.", "success");
			}, 1500);
			return;
		}
		if (flow >= ONBOARD_LABELS.length) {
			onClose();
			return;
		}
		setFlow((f) => f + 1);
	};

	/* ---------- LEGACY BRIDGE: sw(prefix,key,btn) ---------- */
	const sw = (prefix: string, key: string) =>
		setTabs((prev) => ({ ...prev, [prefix]: key }));
	const tabOf = (prefix: string, first: string) => tabs[prefix] ?? first;

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
								`PayMo — Customers, Billing & Reminders\n${r.msg}${r.ref ? `\nReference: ${r.ref}` : ""}\nGenerated: ${new Date().toLocaleString()}`,
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

	/* ---------- action body wrapper: receipt OR form (legacy doAction body swap) ---------- */
	const actionBody = (id: string, form: ReactNode) => (
		<div style={{ position: "relative" }}>
			{busy === id && <BusyOverlay />}
			{results[id] ? receipt(id) : form}
		</div>
	);

	const actionFooter = (
		id: string,
		label: ReactNode,
		msg: string,
		ref?: string,
		tone: "btnPmP" | "btnPmD" | "" = "btnPmP",
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
					className={`${styles.btnPm} ${tone ? styles[tone] : ""}`}
					onClick={() => doAction(id, msg, ref)}
				>
					{label}
				</button>
			</>
		);

	/* ---------- flow stepper (legacy renderStepper) ---------- */
	const stepper = (
		<div className={styles.stepper}>
			{ONBOARD_LABELS.map((l, i) => {
				const n = i + 1;
				return (
					<div
						className={
							styles.step +
							" " +
							(n < flow ? styles.stepDone : n === flow ? styles.stepActive : "")
						}
						key={l}
						style={{ display: "contents" }}
					>
						<div
							className={`${styles.step} ${n < flow ? styles.stepDone : ""} ${n === flow ? styles.stepActive : ""}`}
						>
							<div className={styles.stepN}>
								{n < flow ? <i className="bi bi-check" /> : n}
							</div>
							<div className={styles.stepL}>{l}</div>
						</div>
						{i < ONBOARD_LABELS.length - 1 && (
							<div className={styles.stepLine} />
						)}
					</div>
				);
			})}
		</div>
	);

	const kycHealthTiles = [
		{
			value: "98.4",
			label: "COMPLETION %",
			vColor: "var(--pm-accent)",
			bg: "var(--pm-accent-soft)",
			big: true,
		},
		{
			value: "47",
			label: "PENDING",
			vColor: "var(--pm-info)",
			bg: "var(--pm-info-soft)",
		},
		{
			value: "24",
			label: "REJECTED",
			vColor: "var(--pm-warning)",
			bg: "var(--pm-warning-soft)",
		},
		{
			value: "18",
			label: "PEP/SANCTIONS",
			vColor: "var(--pm-purple)",
			bg: "var(--pm-purple-soft)",
		},
	];
	const kycHealthRows: [
		string,
		string,
		string,
		"badgeS" | "badgeW" | "badgeD",
	][] = [
		["Avg KYC processing time", "4.2 hours", "-12%", "badgeS"],
		["Auto-approval rate", "78%", "+5%", "badgeS"],
		["Document rejection rate", "4.9%", "+1%", "badgeD"],
		["PEP screening hits", "18 this month", "Stable", "badgeW"],
	];
	const profileStats: [string, string, boolean?][] = [
		["Customers Managed", "847"],
		["Tickets Resolved", "1,284"],
		["Avg Response", "18 min"],
		["SLA Compliance", "99.2%", true],
	];
	const apiKeys = [
		{
			key: "prod-8821",
			sub: "Created 12 Mar • Last used today",
			status: "Active",
			tone: "badgeS" as const,
		},
		{
			key: "prod-9914",
			sub: "Created 02 Feb • Last used 10 Jun",
			status: "Revoked",
			tone: "badgeD" as const,
		},
	];
	const attentionRows = [
		{
			title: "KYC rejected — 3 cases",
			sub: "Missing documents or mismatch",
			label: "Review",
			modal: "kycReviewModal",
		},
		{
			title: "Plan end pending — 7 customers",
			sub: "Final invoices ready to issue",
			label: "Process",
			modal: "closeAccountModal",
		},
		{
			title: "AML flag — 2 high-risk profiles",
			sub: "Manual review required",
			label: "Investigate",
			modal: "amlReviewModal",
		},
		{
			title: "5 support tickets overdue",
			sub: "SLA breach risk",
			label: "Respond",
			modal: "supportTicketsModal",
		},
		{
			title: "24 customers with expiring consent",
			sub: "KYC documents expiring in 30 days",
			label: "Renew",
			modal: "linkExternalModal",
		},
	];
	const tixRows = [
		{
			t: "TKT-8821",
			c: "Peter Njoroge",
			s: "KYC document rejected",
			p: "Medium",
			pTone: "badgeW" as const,
			st: "In Progress",
			stTone: "badgeI" as const,
			a: "You",
		},
		{
			t: "TKT-8834",
			c: "Zawadi Beauty",
			s: "Statement for June not received",
			p: "Low",
			pTone: "badgeS" as const,
			st: "Open",
			stTone: "badgeS" as const,
			a: "Unassigned",
		},
		{
			t: "TKT-8847",
			c: "Sunrise Restaurant",
			s: "Third payment attempt failed",
			p: "High",
			pTone: "badgeD" as const,
			st: "Awaiting Customer",
			stTone: "badgeW" as const,
			a: "You",
		},
	];
	const timelineRows = [
		["26 Jun 09:12", "Ticket created by system"],
		["26 Jun 10:05", "Assigned to you (facilitator)"],
		["26 Jun 14:30", "Message sent to customer requesting new ID"],
		["27 Jun 11:45", "Customer uploaded new document"],
	];
	const commRows: [string, boolean, boolean, boolean, boolean][] = [
		["Email", true, true, true, true],
		["SMS", false, true, true, false],
		["Push", true, true, true, true],
		["WhatsApp", false, false, true, false],
	];

	return (
		<>
			{/* ============ M1: Onboard Customer (multi-step flow) ============ */}
			<MBox
				id="onboardCustomerModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-person-plus"
							style={{ color: "var(--pm-accent)" }}
						/>{" "}
						Onboard New Customer
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={nextFlow}
							disabled={busy === "onboardCustomerModal"}
						>
							{flow >= ONBOARD_LABELS.length ? (
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
				<div style={{ position: "relative" }}>
					{busy === "onboardCustomerModal" && <BusyOverlay />}
					{stepper}						{/* Step 1: Customer Type — adaptive wizard */}
						{flow === 1 && (
							<div>
								<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
									Step 1: Customer Type
								</h6>
								<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>
									Depth adapts to type — a PSP/merchant submits many documents, a
									retail customer submits almost nothing.
								</p>
								<div className="row g-2">
								{ONBOARD_TYPES.map((t) => (
									<div className="col-md-3 col-6" key={t.label}>
										<div
											className="p-3 border rounded text-center"
											role="button"
											tabIndex={0}
											style={{
												cursor: "pointer",
												borderColor:
													onboardType === t.label
														? "var(--pm-primary)"
														: undefined,
												background:
													onboardType === t.label
														? "rgba(46,230,160,.06)"
														: undefined,
											}}
											onClick={() => setOnboardType(t.label)}
											onKeyDown={(e) =>
												e.key === "Enter" && setOnboardType(t.label)
											}
										>
											<i
												className={`bi ${t.icon} d-block mb-1`}
												style={{ fontSize: 22, color: t.color }}
											/>
											<strong style={{ fontSize: 12 }}>{t.label}</strong>
										</div>
									</div>
								))}
							</div>
							<div className="row g-2 mt-3">
								<div className="col-md-6">
									<label className={styles.fl}>Belongs to business</label>
									<select className={styles.fc}>
										<option>Land Buyers LTD (30 customers)</option>
										<option>Company 2 (209 customers)</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>KYC depth needed</label>
									<select className={styles.fc}>
										<option>
											{DEEP_KYC_TYPES.includes(onboardType)
													? "Deep — directors, compliance Q, settlement bank"
													: "Shallow — national ID + selfie"}
										</option>
									</select>
								</div>
							</div>
						</div>
					)}
					{/* Step 2: Identity */}
					{flow === 2 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>									Step 2: Identity

							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Full Name / Company</label>
									<input className={styles.fc} placeholder="Enter name" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>ID / Registration Number</label>
									<input
										className={styles.fc}
										placeholder="National ID / CR12"
									/>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Phone</label>
									<input className={styles.fc} placeholder="+254 7XX XXX XXX" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Email</label>
									<input
										className={styles.fc}
										placeholder="email@example.com"
									/>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>
										Date of Birth / Incorporation
									</label>
									<input type="date" className={styles.fc} />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Nationality</label>
									<select className={styles.fc}>
										{NATIONALITIES.map((n) => (
											<option key={n}>{n}</option>
										))}
									</select>
								</div>
							</div>
						</div>
					)}
					{/* Step 3: KYC & Documents — adaptive */}
					{flow === 3 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 3: KYC &amp; Documents
							</h6>
							<div className={styles.summaryBoxInfo} style={{ fontSize: 12, marginBottom: 12 }}>
								<i className="bi bi-info-circle me-1" />
								{DEEP_KYC_TYPES.includes(onboardType)
									? `Deep submission for ${onboardType} — directors, compliance questionnaire and settlement bank required.`
									: "Shallow submission — national ID and selfie are enough for this customer type."}
							</div>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Upload ID / Passport</label>
									<input type="file" className={styles.fc} />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Selfie / Company Stamp</label>
									<input type="file" className={styles.fc} />
								</div>
								{DEEP_KYC_TYPES.includes(onboardType) && (
									<>
										<div className="col-md-6">
											<label className={styles.fl}>CR12 / Directors List</label>
											<input type="file" className={styles.fc} />
										</div>
										<div className="col-md-6">
											<label className={styles.fl}>Ownership % (directors)</label>
											<input className={styles.fc} placeholder="e.g. 60 / 40" />
										</div>
										<div className="col-md-6">
											<label className={styles.fl}>Compliance Questionnaire</label>
											<select className={styles.fc}>
												<option>Low risk — standard</option>
												<option>Medium risk — enhanced checks</option>
												<option>High risk — full CDD</option>
											</select>
										</div>
										<div className="col-md-6">
											<label className={styles.fl}>Settlement Bank Reference</label>
											<input className={styles.fc} placeholder="Bank letter / statement" />
										</div>
									</>
								)}
								<div className="col-md-6">
									<label className={styles.fl}>Source of Funds</label>
									<select className={styles.fc}>
										{SOURCES_OF_FUNDS.map((s) => (
											<option key={s}>{s}</option>
										))}
									</select>
								</div>
							</div>
						</div>
					)}
					{/* Step 4: Location */}
					{flow === 4 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 4: Location
							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>County</label>
									<input className={styles.fc} placeholder="e.g. Kiambu" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Town</label>
									<input className={styles.fc} placeholder="e.g. Ruiru" />
								</div>
								<div className="col-12">
									<label className={styles.fl}>Physical Address</label>
									<input
										className={styles.fc}
										placeholder="Street, building, plot"
									/>
								</div>
								<div className="col-md-8">
									<label className={styles.fl}>GPS Pin</label>
									<input
										className={styles.fc}
										value={wizGps}
										onChange={(e) => setWizGps(e.target.value)}
										placeholder="-1.2481, 36.9042"
									/>
								</div>
								<div className="col-md-4 d-flex align-items-end">
									<button
										type="button"
										className={`${styles.btnPm} ${styles.btnSm}`}
										onClick={() => setWizGps("-1.2481, 36.9042")}
									>
										<i className="bi bi-crosshair" /> Use current location
									</button>
								</div>
							</div>
						</div>
					)}
					{/* Step 5: Payment Method */}
					{flow === 5 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 5: Payment Method(s)
							</h6>
							<div className="row g-2">
								{[
									{ icon: "bi-phone", label: "M-Pesa", sub: "+254 7XX XXX XXX · Verify" },
									{ icon: "bi-credit-card", label: "Card", sub: "Visa / Mastercard" },
									{ icon: "bi-bank", label: "Bank Account", sub: "Equity / KCB / Co-op" },
									{ icon: "bi-wallet2", label: "PayMo Wallet", sub: "Internal wallet" },
								].map((m, i) => (
									<div className="col-md-6" key={m.label}>
										<div
											className="p-3 border rounded"
											style={{ cursor: "pointer", borderColor: i === 0 ? "var(--pm-accent)" : undefined }}
										>
											<div className="d-flex align-items-center" style={{ gap: 8 }}>
												<i className={`bi ${m.icon}`} style={{ color: "var(--pm-info)" }} />
												<strong style={{ fontSize: 12.5 }}>{m.label}</strong>
												{i === 0 && (
													<span
														className={`${styles.badge} ${styles.badgeS}`}
														style={{ marginLeft: "auto" }}
													>
														<i className="bi bi-check2" /> Primary
													</span>
												)}
											</div>
											<div style={{ fontSize: 11.5, color: "var(--pm-muted)", marginTop: 4 }}>
												{m.sub}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
					{/* Step 6: Billing Model */}
					{flow === 6 && (
						<div>
							<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
								Step 6: Billing Model
							</h6>
							<div className="row g-3">
								<div className="col-md-6">
									<label className={styles.fl}>Billing model</label>
									<select className={styles.fc}>
										{BILLING_MODELS.map((b) => (
											<option key={b}>{b}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Amount per billing</label>
									<input className={styles.fc} placeholder="KES 1,250" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Frequency</label>
									<select className={styles.fc}>
										{FREQUENCIES.map((f) => (
											<option key={f}>{f}</option>
										))}
									</select>
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>Duration</label>
									<input className={styles.fc} placeholder="e.g. 12 weeks" />
								</div>
								<div className="col-md-6">
									<label className={styles.fl}>End date (recurring)</label>
									<input type="date" className={styles.fc} />
								</div>
								<div className="col-md-6 d-flex align-items-end">
									<div className="form-check">
										<input
												className="form-check-input"
												type="checkbox"
												id="wizAutoBill"
												defaultChecked
											/>
										<label
												className="form-check-label"
												style={{ fontSize: 12.5 }}
												htmlFor="wizAutoBill"
											>
												Auto-bill on next due date
											</label>
										</div>
									</div>
								</div>
							</div>
						)}
						{/* Step 7: Permissions & Preferences */}
						{flow === 7 && (
							<div>
								<h6 className={styles.fwBold13} style={{ fontSize: 14 }}>
									Step 7: Permissions &amp; Preferences
								</h6>
								<div className="row g-3">
									<div className="col-md-6">
										<label className={styles.fl}>Customer self-service</label>
										<select className={styles.fc}>
											<option>Full — portal, statements, receipts</option>
											<option>Statements &amp; receipts only</option>
											<option>None — you manage everything</option>
										</select>
									</div>
									<div className="col-md-6">
										<label className={styles.fl}>Preferred language</label>
										<select className={styles.fc}>
											<option>English</option>
											<option>Swahili</option>
										</select>
									</div>
									<div className="col-12">
										<label className={styles.fl}>Communication channels</label>
										<div className="d-flex flex-wrap" style={{ gap: 8 }}>
											{REMIND_CHANNELS.map((ch) => (
												<span key={ch} className={`${styles.channelPill} ${ch === "SMS" ? styles.channelSms : ch === "WhatsApp" ? styles.channelWa : styles.channelMail}`}>
													<i
														className={`bi ${ch === "SMS" ? "bi-chat-left-text" : ch === "WhatsApp" ? "bi-whatsapp" : "bi-envelope"}`}
													/>{" "}
													{ch} <i className="bi bi-check2" />
												</span>
											))}
										</div>
									</div>
								</div>
							</div>
						)}
						{/* Step 8: Review & Onboard */}
						{flow === 8 && (
							<div className={styles.receipt}>
								<div className={styles.ri}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={styles.receiptTitle}>
									Customer Onboarded Successfully
								</h5>
								<p className={styles.receiptSub}>
									KYC verification initiated and billing plan scheduled. Welcome
									message sent on the customer's preferred channel.
								</p>
								<div
									className={`${styles.summaryBox} text-start mt-3`}
									style={{ fontSize: 13 }}
								>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Customer ID</span>
										<strong>CUS-20250729-8841</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Type</span>
										<strong>{onboardType}</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Billing plan</span>
										<strong>Weekly · KES 1,250 · 12 weeks</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>KYC Status</span>
										<span className={`${styles.badge} ${styles.badgeW}`}>
											Pending Review
										</span>
									</div>
									<div className="d-flex justify-content-between">
										<span className={styles.mutedSmall}>Welcome SMS</span>
										<strong>Sent</strong>
									</div>
								</div>
							</div>
						)}
				</div>
			</MBox>

			{/* ============ M2: KYC Review ============ */}
			<MBox
				id="kycReviewModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-check"
							style={{ color: "var(--pm-info)" }}
						/>{" "}
						KYC Document Review
					</>
				}
				footer={actionFooter(
					"kycReviewModal",
					"Approve KYC",
					"KYC approved successfully. Customer notified via SMS and email.",
					"KYC-20250627-9914",
				)}
			>
				{actionBody(
					"kycReviewModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								{CUSTOMERS.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="row g-3">
							{[
								{
									label: "National ID",
									value: "12345678",
									btn: "View Document",
									icon: "bi-eye",
								},
								{
									label: "Utility Bill",
									value: "Nairobi Water — May 2025",
									btn: "View Document",
									icon: "bi-eye",
								},
								{
									label: "Selfie",
									value: "Face match: 98%",
									btn: "View Photo",
									icon: "bi-eye",
								},
							].map((d) => (
								<div className="col-md-6" key={d.label}>
									<div className="p-3 border rounded">
										<div className={styles.mutedSmall}>{d.label}</div>
										<div className={styles.fwBold13}>{d.value}</div>
										<div className="mt-2">
											<button className={`${styles.btnPm} ${styles.btnSm}`}>
												<i className={`bi ${d.icon}`} /> {d.btn}
											</button>
										</div>
									</div>
								</div>
							))}
							<div className="col-md-6">
								<div className="p-3 border rounded">
									<div className={styles.mutedSmall}>Risk Score</div>
									<div
										className={styles.fwBold13}
										style={{ color: "var(--pm-accent)" }}
									>
										Low (12/100)
									</div>
								</div>
							</div>
						</div>
						<div className="mt-3">
							<label className={styles.fl}>Decision</label>
							<select className={styles.fc}>
								{DECISIONS.map((d) => (
									<option key={d}>{d}</option>
								))}
							</select>
						</div>
						<div className="mt-3">
							<label className={styles.fl}>Internal Notes</label>
							<textarea
								className={styles.fc}
								rows={2}
								defaultValue="All documents clear. Face match excellent. Address matches ID."
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M3: Open Account ============ */}
			<MBox
				id="openAccountModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calendar-check" style={{ color: "var(--pm-info)" }} />{" "}
						New Billing Plan
					</>
				}
				footer={actionFooter(
					"openAccountModal",
					"Create Plan",
					"Billing plan created. First charge scheduled on the next due date.",
					"PLN-20250729-4482",
				)}
			>
				{actionBody(
					"openAccountModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								{CUSTOMERS.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={styles.fl}>Billing Model</label>
								<select className={styles.fc}>
									{BILLING_MODELS.map((t) => (
										<option key={t}>{t}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Amount per billing</label>
								<input className={styles.fc} defaultValue="KES 1,250" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Frequency</label>
								<select className={styles.fc}>
									{FREQUENCIES.map((f) => (
										<option key={f}>{f}</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Duration / End</label>
								<input className={styles.fc} placeholder="e.g. 12 weeks or a date" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>First charge date</label>
								<input type="date" className={styles.fc} />
							</div>
							<div className="col-md-6 d-flex align-items-end">
								<div className="form-check">
									<input className="form-check-input" type="checkbox" id="planAutoBill" defaultChecked />
									<label className="form-check-label" style={{ fontSize: 12.5 }} htmlFor="planAutoBill">
										Auto-bill on every due date
									</label>
								</div>
							</div>
							<div className="col-12">
								<div className={styles.summaryBox} style={{ fontSize: 12 }}>
									<i className="bi bi-info-circle me-1" /> Auto-charge from the
									customer's primary method; failed attempts auto-trigger a
									reminder. Charges settle into the business float.
								</div>
							</div>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M4: Close Account ============ */}
			<MBox
				id="closeAccountModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-pause-circle"
							style={{ color: "var(--pm-warning)" }}
						/>{" "}
						Pause / End Billing Plan
					</>
				}
				footer={actionFooter(
					"closeAccountModal",
					"Pause Plan",
					"Billing plan paused. No further charges will be attempted.",
					"PSD-20250729-9914",
				)}
			>
				{actionBody(
					"closeAccountModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Billing Plan</label>
							<select className={styles.fc}>
								<option>John Ochieng — Weekly · KES 1,250</option>
								<option>Amina Hassan — Monthly · KES 18,500</option>
								<option>Nia Textiles — Daily · KES 214,300</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Action</label>
							<select className={styles.fc}>
								<option>Pause temporarily</option>
								<option>End plan (final invoice)</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Reason</label>
							<select className={styles.fc}>
								{CLOSE_REASONS.map((r) => (
									<option key={r}>{r}</option>
								))}
							</select>
						</div>
						<div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}>
							<i className="bi bi-exclamation-triangle me-1" /> Pausing stops
							all future charges. Ending the plan issues a final invoice for
							outstanding installments and refunds any prepaid balance to the
							original payment method.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M5: Permission / Role ============ */}
			<MBox
				id="permissionModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" style={{ color: "var(--pm-warning)" }} />{" "}
						Manage Permissions &amp; Roles
					</>
				}
				footer={actionFooter(
					"permissionModal",
					"Save Changes",
					"Role and permissions saved successfully.",
				)}
			>
				{actionBody(
					"permissionModal",
					<>
						<Pills
							prefix="perm"
							tabs={[
								{ key: "roles", label: "Roles" },
								{ key: "users", label: "Users" },
								{ key: "api", label: "API Keys" },
							]}
							tabsState={tabs}
							onSwitch={sw}
						/>
						{tabOf("perm", "roles") === "roles" && (
							<div>
								<div className="mb-3">
									<label className={styles.fl}>Role Name</label>
									<input className={styles.fc} defaultValue="Plan Manager" />
								</div>
								<div className="mb-3">
									<label className={styles.fl}>Permissions</label>
									{[
										{ label: "View customer profile & KYC", on: true },
										{ label: "Edit billing plans & schedules", on: true },
										{ label: "Approve refunds", on: false },
										{ label: "Send reminders & statements", on: false },
									].map((p, i) => (
										<div
											className={`form-check ${i < 3 ? "mb-1" : ""}`}
											key={p.label}
										>
											<input
												className="form-check-input"
												type="checkbox"
												defaultChecked={p.on}
												id={`perm-${i}`}
											/>
											<label
												className="form-check-label"
												style={{ fontSize: 13 }}
												htmlFor={`perm-${i}`}
											>
												{p.label}
											</label>
										</div>
									))}
								</div>
							</div>
						)}
						{tabOf("perm", "roles") === "users" && (
							<div className="table-responsive">
								<table className={styles.tbl}>
									<thead>
										<tr>
											<th>User</th>
											<th>Role</th>
											<th>Last Login</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{[
											["Grace Kamau", "Joint Signatory", "26 Jun 2025"],
											["Brian Ochieng", "Viewer Only", "20 Jun 2025"],
										].map(([u, r, l]) => (
											<tr key={u}>
												<td>{u}</td>
												<td>{r}</td>
												<td>{l}</td>
												<td>
													<button
														className={`${styles.btnPm} ${styles.btnSm}`}
														onClick={() =>
															doAction(
																"permissionModal",
																`Permissions updated for ${u}`,
																"",
															)
														}
													>
														Edit
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						{tabOf("perm", "roles") === "api" && (
							<div>
								{apiKeys.map((k) => (
									<div className={styles.sr} key={k.key}>
										<div>
											<strong>API Key • {k.key}</strong>
											<div className={styles.mutedSmall}>{k.sub}</div>
										</div>
										<span className={`${styles.badge} ${styles[k.tone]}`}>
											{k.status}
										</span>
									</div>
								))}
								<button
									className={`${styles.btnPm} ${styles.btnSm} w-100 mt-3`}
									onClick={() =>
										doAction(
											"permissionModal",
											"New API key generated and copied to clipboard.",
											"",
										)
									}
								>
									Generate New Key
								</button>
							</div>
						)}
					</>,
				)}
			</MBox>

			{/* ============ M6: Statement ============ */}
			<MBox
				id="statementModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-file-earmark-text"
							style={{ color: "var(--pm-accent)" }}
						/>{" "}
						Generate Statements
					</>
				}
				footer={actionFooter(
					"statementModal",
					"Generate",
					"Statement generated successfully. Download started.",
				)}
			>
				{actionBody(
					"statementModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								<option>John Ochieng — Land Buyers LTD</option>
								<option>Amina Hassan — Land Buyers LTD</option>
								<option>Nia Textiles — Company 2</option>
							</select>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-6">
								<label className={styles.fl}>From</label>
								<input
									type="date"
									className={styles.fc}
									defaultValue="2025-05-01"
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
							<select className={styles.fc}>
								{FORMATS.map((f) => (
									<option key={f}>{f}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Delivery</label>
							<select className={styles.fc}>
								<option>Download now</option>
								<option>Email to customer</option>
								<option>WhatsApp link</option>
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M7: Support Tickets ============ */}
			<MBox
				id="supportTicketsModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-headset" /> Support Ticket Center
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("createTicketModal")}
						>
							Create New Ticket
						</button>
					</>
				}
			>
				<Pills
					prefix="tix"
					tabs={[
						{ key: "open", label: "Open (14)" },
						{ key: "closed", label: "Closed" },
						{ key: "sla", label: "SLA Breach" },
					]}
					tabsState={tabs}
					onSwitch={sw}
				/>
				{tabOf("tix", "open") === "open" && (
					<div className="table-responsive">
						<table className={styles.tbl}>
							<thead>
								<tr>
									<th>Ticket</th>
									<th>Customer</th>
									<th>Subject</th>
									<th>Priority</th>
									<th>Status</th>
									<th>Assigned</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{tixRows.map((r) => (
									<tr key={r.t}>
										<td>{r.t}</td>
										<td>{r.c}</td>
										<td>{r.s}</td>
										<td>
											<span className={`${styles.badge} ${styles[r.pTone]}`}>
												{r.p}
											</span>
										</td>
										<td>
											<span className={`${styles.badge} ${styles[r.stTone]}`}>
												{r.st}
											</span>
										</td>
										<td>{r.a}</td>
										<td>
											<button
												className={`${styles.btnPm} ${styles.btnSm}`}
												onClick={() => onOpen("ticketDetailModal")}
											>
												Open
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{tabOf("tix", "open") === "closed" && (
					<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
						Last 7 days: 47 tickets resolved. Average resolution time: 4.2
						hours.
					</p>
				)}
				{tabOf("tix", "open") === "sla" && (
					<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
						5 tickets currently at risk of SLA breach. Immediate attention
						required.
					</p>
				)}
			</MBox>

			{/* ============ M8: Ticket Detail ============ */}
			<MBox
				id="ticketDetailModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-ticket-perforated" /> Ticket TKT-8821
					</>
				}
				footer={actionFooter(
					"ticketDetailModal",
					"Resolve Ticket",
					"Ticket status updated to Resolved.",
				)}
			>
				{actionBody(
					"ticketDetailModal",
					<>
						<Pills
							prefix="td"
							tabs={[
								{ key: "details", label: "Details" },
								{ key: "timeline", label: "Timeline" },
								{ key: "notes", label: "Notes" },
							]}
							tabsState={tabs}
							onSwitch={sw}
						/>
						{tabOf("td", "details") === "details" && (
							<div className="row g-3">
								<div className="col-md-6">
									<strong>Customer:</strong> Peter Ochieng
									<br />
									<strong>Subject:</strong> KYC document rejected
									<br />
									<strong>Priority:</strong> Medium
									<br />
									<strong>Status:</strong> In Progress
									<br />
									<strong>Assigned:</strong> You (facilitator)
								</div>
								<div className="col-md-6">
									<strong>Opened:</strong> 26 Jun 2025, 09:12
									<br />
									<strong>Last Update:</strong> 27 Jun 2025, 11:45
									<br />
									<strong>SLA:</strong> 48 hours (12h remaining)
								</div>
							</div>
						)}
						{tabOf("td", "details") === "timeline" && (
							<div>
								{timelineRows.map(([t, e]) => (
									<div className={styles.sr} key={t}>
										<div>
											<strong>{t}</strong> — {e}
										</div>
									</div>
								))}
							</div>
						)}
						{tabOf("td", "details") === "notes" && (
							<div>
								<textarea
									className={styles.fc}
									rows={4}
									placeholder="Add internal note..."
								/>
								<button
									className={`${styles.btnPm} ${styles.btnSm} mt-2`}
									onClick={() =>
										doAction(
											"ticketDetailModal",
											"Note added to ticket TKT-8821",
											"",
										)
									}
								>
									Add Note
								</button>
							</div>
						)}
					</>,
				)}
			</MBox>

			{/* ============ M9: Bulk Upload ============ */}
			<MBox
				id="bulkUploadModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-upload" style={{ color: "var(--pm-info)" }} />{" "}
						Bulk Customer Import
					</>
				}
				footer={actionFooter(
					"bulkUploadModal",
					"Start Import",
					"Bulk import started. 124 customers queued for processing.",
					"BULK-20250627-1122",
				)}
			>
				{actionBody(
					"bulkUploadModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Upload CSV / Excel</label>
							<input type="file" className={styles.fc} />
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> Download{" "}
							{/* LEGACY BRIDGE: dead template link → real CSV download */}
							<button
								className="btn btn-link btn-sm p-0 align-baseline"
								style={{ fontSize: 12 }}
								onClick={() =>
									downloadFile(
										"paymo-customer-import-template.csv",
										'Name,ID,Phone,Email,Business,Type,BillingModel\nJane Doe,12345678,+254712345678,jane@example.com,"Land Buyers LTD",Individual,Weekly',
										"text/csv",
									)
								}
							>
								template
							</button>
							. Required columns: Name, ID, Phone, Email, Business, Type,
							BillingModel.
						</div>
						<div className="mt-3">
							<label className={styles.fl}>Import Options</label>
							{[
								"Send welcome SMS & email",
								"Trigger eKYC for supported IDs",
							].map((o, i) => (
								<div className={`form-check ${i === 0 ? "mb-1" : ""}`} key={o}>
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id={`imp-${i}`}
									/>
									<label
										className="form-check-label"
										style={{ fontSize: 13 }}
										htmlFor={`imp-${i}`}
									>
										{o}
									</label>
								</div>
							))}
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M10: AML Review ============ */}
			<MBox
				id="amlReviewModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-exclamation-triangle"
							style={{ color: "var(--pm-danger)" }}
						/>{" "}
						AML / Sanctions Review
					</>
				}
				footer={actionFooter(
					"amlReviewModal",
					"Escalate",
					"Case escalated to Compliance Officer. Ticket AML-20250627-0003 created.",
					"AML-20250627-0003",
					"btnPmD",
				)}
			>
				{actionBody(
					"amlReviewModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								<option>Samuel Kipchoge (High Risk — PEP)</option>
								<option>John Kamau (High Risk — Sanctions Match)</option>
							</select>
						</div>
						<div className={`${styles.summaryBoxDanger} mb-3`}>
							<div
								style={{
									fontSize: 12,
									fontWeight: 700,
									color: "var(--pm-danger)",
								}}
							>
								SANCTIONS MATCH DETECTED
							</div>
							<div style={{ fontSize: 13 }}>
								Name matches OFAC / UN sanctions list. Manual review required
								before onboarding.
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Decision</label>
							<select className={styles.fc}>
								<option>Escalate to Compliance Officer</option>
								<option>Reject — Sanctions match</option>
								<option>Proceed with enhanced due diligence</option>
								<option>False positive — Approve</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Notes</label>
							<textarea
								className={styles.fc}
								rows={3}
								defaultValue="Name similarity 92%. Date of birth does not match sanctions record. Recommend EDD."
							/>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M11: Link External Account ============ */}
			<MBox
				id="linkExternalModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-link-45deg"
							style={{ color: "var(--pm-info)" }}
						/>{" "}
						Link External Wallet
					</>
				}
				footer={actionFooter(
					"linkExternalModal",
					"Link Wallet",
					"External wallet linked. Refunds and payouts can now route to it.",
					"LNK-20250729-4482",
				)}
			>
				{actionBody(
					"linkExternalModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
							<option>John Ochieng (CUS-0001)</option>
							<option>Grace Wanjiku Ltd (CUS-0005)</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={styles.fl}>Wallet Type</label>
						<select className={styles.fc}>
							<option>M-Pesa (Till / Paybill)</option>
							<option>External Bank (Equity / KCB / Co-op)</option>
							<option>PayMo Business Wallet</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={styles.fl}>Account / Till Number</label>
						<input className={styles.fc} placeholder="Enter number" />
					</div>
					<div className="mb-3">
						<label className={styles.fl}>Valid Until</label>
						<input
							type="date"
							className={styles.fc}
							defaultValue="2025-12-31"
						/>
					</div>
					<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
						<i className="bi bi-info-circle me-1" /> Refunds and payouts to
						this customer can now route here. Keep the number verified.
					</div>
					</>,
				)}
			</MBox>

			{/* ============ M12: API Key ============ */}
			<MBox
				id="apiKeyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" style={{ color: "var(--pm-muted)" }} />{" "}
						Manage API Keys
					</>
				}
				footer={
					results.apiKeyModal ? (
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={onClose}
						>
							Done
						</button>
					) : (
						<>
							<button className={styles.btnPm} onClick={onClose}>
								Close
							</button>
							<button
								className={`${styles.btnPm} ${styles.btnPmP}`}
								onClick={() =>
									doAction(
										"apiKeyModal",
										"New API key generated: prod-20250627-1122 (copied to clipboard)",
										"",
									)
								}
							>
								Generate Key
							</button>
						</>
					)
				}
			>
				{actionBody(
					"apiKeyModal",
					<>
						{apiKeys.map((k) => (
							<div className={styles.sr} key={k.key}>
								<div>
									<strong>{k.key}</strong>
									<div className={styles.mutedSmall}>{k.sub}</div>
								</div>
								<span className={`${styles.badge} ${styles[k.tone]}`}>
									{k.status}
								</span>
							</div>
						))}
						<div className="mt-3">
							<label className={styles.fl}>New Key Label</label>
							<input className={styles.fc} placeholder="e.g. Mobile App v2" />
						</div>
						<div className="mt-3">
							<label className={styles.fl}>Permissions</label>
							{[
							{ label: "Read customer directory & KYC", on: true },
							{ label: "Create billing plans & charges", on: false },
							{ label: "Send reminders (SMS / WhatsApp)", on: false },
							].map((p, i) => (
								<div
									className={`form-check ${i < 2 ? "mb-1" : ""}`}
									key={p.label}
								>
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked={p.on}
										id={`ak-${i}`}
									/>
									<label
										className="form-check-label"
										style={{ fontSize: 13 }}
										htmlFor={`ak-${i}`}
									>
										{p.label}
									</label>
								</div>
							))}
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M13: Create Ticket ============ */}
			<MBox
				id="createTicketModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-plus-circle" /> Create Support Ticket
					</>
				}
				footer={actionFooter(
					"createTicketModal",
					"Create Ticket",
					"Ticket TKT-8859 created and assigned to support team.",
					"TKT-8859",
				)}
			>
				{actionBody(
					"createTicketModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								<option>Peter Ochieng</option>
								<option>Grace Wanjiku Ltd</option>
								<option>Samuel Kipchoge</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Subject</label>
							<input
								className={styles.fc}
								placeholder="Brief description of issue"
							/>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Category</label>
							<select className={styles.fc}>
								{TICKET_CATEGORIES.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Priority</label>
							<select className={styles.fc}>
								{TICKET_PRIORITIES.map((p) => (
									<option key={p}>{p}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Description</label>
							<textarea className={styles.fc} rows={3} />
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M14: Report ============ */}
			<MBox
				id="reportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-graph-up" style={{ color: "var(--pm-info)" }} />{" "}
						Generate Report
					</>
				}
				footer={actionFooter(
					"reportModal",
					"Generate Report",
					"Report generated and downloading...",
				)}
			>
				{actionBody(
					"reportModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Report Type</label>
							<select className={styles.fc}>
								{REPORT_TYPES.map((r) => (
									<option key={r}>{r}</option>
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
							<select className={styles.fc}>
								{FORMATS.map((f) => (
									<option key={f}>{f}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Delivery</label>
							<select className={styles.fc}>
								<option>Download now</option>
								<option>Email to me</option>
								<option>Schedule recurring</option>
							</select>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M15: Communication Preferences ============ */}
			<MBox
				id="commModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-envelope" /> Communication Preferences
					</>
				}
				footer={actionFooter(
					"commModal",
					"Save Preferences",
					"Communication preferences updated for segment.",
				)}
			>
				{actionBody(
					"commModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Segment</label>
							<select className={styles.fc}>
								{SEGMENTS.map((s) => (
									<option key={s}>{s}</option>
								))}
							</select>
						</div>
						<div className="table-responsive">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Channel</th>
										<th>Marketing</th>
										<th>Transactional</th>
										<th>Security</th>
										<th>Statements</th>
									</tr>
								</thead>
								<tbody>
									{commRows.map(([ch, m, t, sec, st]) => (
										<tr key={ch}>
											<td>{ch}</td>
											{[m, t, sec, st].map((v, i) => (
												<td key={i}>
													<input
														type="checkbox"
														defaultChecked={v}
														aria-label={`${ch} col ${i + 1}`}
													/>
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M16: Attention ============ */}
			<MBox
				id="attentionModal"
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

			{/* ============ M17: KYC Health ============ */}
			<MBox
				id="kycHealthModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i
							className="bi bi-shield-check"
							style={{ color: "var(--pm-accent)" }}
						/>{" "}
						KYC Health Dashboard
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={`${styles.btnPm} ${styles.btnPmP}`}
							onClick={() => onOpen("kycReviewModal")}
						>
							Review Pending Queue
						</button>
					</>
				}
			>
				<div className="row g-3 mb-3">
					{kycHealthTiles.map((t) => (
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
				<div className="table-responsive">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Metric</th>
								<th>Value</th>
								<th>Trend</th>
							</tr>
						</thead>
						<tbody>
							{kycHealthRows.map(([m, v, tr, tone]) => (
								<tr key={m}>
									<td>{m}</td>
									<td>{v}</td>
									<td>
										<span className={`${styles.badge} ${styles[tone]}`}>
											{tr}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ M18: Profile ============ */}
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
						Jckonia K.
					</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						jckonia@paymo.co.ke · Paymo member · 2 businesses
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						{profileStats.map(([l, v, accent]) => (
							<div className="col-6" key={l}>
								<div
									className="p-2 rounded"
									style={{ background: "var(--pm-surface-2)" }}
								>
									<span className={styles.mutedSmall}>{l}</span>
									<br />
									<strong
										style={accent ? { color: "var(--pm-accent)" } : undefined}
									>
										{v}
									</strong>
								</div>
							</div>
						))}
					</div>
				</div>
			</MBox>

			{/* ============ M19: Bulk KYC Approve ============ */}
			<MBox
				id="bulkKycApproveModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-check2-all" /> Bulk KYC Approval
					</>
				}
				footer={actionFooter(
					"bulkKycApproveModal",
					"Approve All",
					"18 customers approved automatically.",
					"BULK-KYC-20250627",
				)}
			>
				{actionBody(
					"bulkKycApproveModal",
					<>
						<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
							18 low-risk customers (confidence &gt; 95%) are eligible for
							automatic approval.
						</p>
						<div className={styles.summaryBoxAccent} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> This action will approve
							all 18 customers and send welcome notifications.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ M20: API Key Management (legacy placeholder duplicate) ============ */}
			<MBox
				id="apiKeyModal2"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key" /> API Key Management
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className={styles.sr}>
					<div>
						<strong>prod-8821</strong>
						<div className={styles.mutedSmall}>Active • Last used today</div>
					</div>
					<span className={`${styles.badge} ${styles.badgeS}`}>Active</span>
				</div>
			</MBox>

			{/* ============ M21: Ticket Details (legacy placeholder duplicate) ============ */}
			<MBox
				id="ticketDetailModal2"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-ticket-perforated" /> Ticket Details
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<p style={{ fontSize: 13, color: "var(--pm-ink-soft)" }}>
					Full ticket conversation and resolution notes would appear here.
				</p>
			</MBox>

			{/* ============ M22: Case Export ============ */}
			<MBox
				id="caseExportModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-download" /> Export Cases
					</>
				}
				footer={actionFooter("caseExportModal", "Export", "Export generated.")}
			>
				{actionBody(
					"caseExportModal",
					<div className="mb-3">
						<label className={styles.fl}>Format</label>
						<select className={styles.fc}>
							<option>PDF</option>
							<option>Excel</option>
						</select>
					</div>,
				)}
			</MBox>

			{/* ============ M23: Fee Calculator ============ */}
			<MBox
				id="feeCalcModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-calculator" /> Fee Calculator
					</>
				}
				footer={
					<button className={styles.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className="mb-3">
					<label className={styles.fl}>Action</label>
					<select className={styles.fc}>
						<option>Onboarding a new customer</option>
						<option>Recurring billing plan</option>
						<option>Issue a refund</option>
					</select>
				</div>
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between">
						<span>Fee</span>
						<strong>KES 500</strong>
					</div>
				</div>
			</MBox>

			{/* ============ N1: Customer Detail ============ */}
			<MBox
				id="customerDetailModal"
				active={active}
				onClose={onClose}
				size="lg"
				title={
					<>
						<i className="bi bi-person-badge" style={{ color: "var(--pm-accent)" }} />{" "}
						John Ochieng — CUS-0001
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen("sendReminderModal")}>
							<i className="bi bi-bell" /> Send Reminder
						</button>
					</>
				}
			>
				<div className="row g-3">
					<div className="col-md-4">
						<div className={styles.summaryBox} style={{ fontSize: 12.5 }}>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Business</span>
								<strong>Land Buyers LTD</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Phone</span>
								<strong>+254 712 345 678</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Email</span>
								<strong>john.o@gmail.com</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>WhatsApp</span>
								<strong>+254 712 345 678</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span className={styles.mutedSmall}>Location</span>
								<strong>Ruiru, Kiambu</strong>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className={styles.summaryBox} style={{ fontSize: 12.5 }}>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Billing model</span>
								<strong>Weekly installment</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Amount</span>
								<strong>KES 1,250</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Next due</span>
								<strong>Fri 01 Aug</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Payment</span>
								<strong>M-Pesa •••678</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span className={styles.mutedSmall}>Refs</span>
								<strong>PLT-082 · PLT-077</strong>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className={styles.summaryBox} style={{ fontSize: 12.5 }}>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>KYC</span>
								<span className={`${styles.badge} ${styles.badgeS}`}>Verified · L2</span>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Documents</span>
								<strong>ID Front · ID Back</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Expiry</span>
								<strong>Mar 2027</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Last reminder</span>
								<strong>27 Jun · SMS</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span className={styles.mutedSmall}>Payment health</span>
								<span className={`${styles.badge} ${styles.badgeS}`}>Healthy</span>
							</div>
						</div>
					</div>
				</div>
				<div className="table-responsive mt-3">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Date</th>
								<th>Activity</th>
								<th>Amount</th>
							</tr>
						</thead>
						<tbody>
							<tr><td>26 Jun</td><td>Installment PLT-082 collected</td><td style={{ fontWeight: 700 }}>KES 1,250</td></tr>
							<tr><td>19 Jun</td><td>Installment PLT-077 collected</td><td style={{ fontWeight: 700 }}>KES 1,250</td></tr>
							<tr><td>12 Jun</td><td>Reminder sent (SMS)</td><td>—</td></tr>
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ N2: Send Reminder ============ */}
			<MBox
				id="sendReminderModal"
				active={active}
				onClose={onClose}
				size="lg"
				title={
					<>
						<i className="bi bi-bell" style={{ color: "var(--pm-warning)" }} />{" "}
						Send Reminder
					</>
				}
				footer={actionFooter(
					"sendReminderModal",
					"Send",
					"Reminder sent to the selected customers.",
					"RMD-20250729-1176",
				)}
			>
				{actionBody(
					"sendReminderModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Recipients</label>
							<select className={styles.fc}>
								<option>Peter Njoroge — failed payment (KES 2,400)</option>
								<option>John Ochieng — installment due Fri</option>
								<option>All 30 Land Buyers LTD customers</option>
								<option>All 209 Company 2 customers</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Template</label>
							<select className={styles.fc}>
								{REMIND_TEMPLATES.map((t) => (
									<option key={t}>{t}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Channel</label>
							<div className="d-flex flex-wrap" style={{ gap: 8 }}>
								{REMIND_CHANNELS.map((ch) => (
									<span key={ch} className={`${styles.channelPill} ${ch === "SMS" ? styles.channelSms : ch === "WhatsApp" ? styles.channelWa : styles.channelMail}`}>
										<i className={`bi ${ch === "SMS" ? "bi-chat-left-text" : ch === "WhatsApp" ? "bi-whatsapp" : "bi-envelope"}`} />{" "}
										{ch}
									</span>
								))}
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Message preview</label>
							<textarea className={styles.fc} rows={3} defaultValue={"Hi Peter, your installment of KES 2,400 is still pending. Please top up your M-Pesa and we will retry. — Land Buyers LTD"} />
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> Delivered via the
							customer's preferred channel. Failed sends log to the
							communication history.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ N3: Add Payment Method ============ */}
			<MBox
				id="newPaymentMethodModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-credit-card-2-front" style={{ color: "var(--pm-info)" }} />{" "}
						Add Payment Method
					</>
				}
				footer={actionFooter(
					"newPaymentMethodModal",
					"Add & Verify",
					"Payment method added and verification initiated.",
					"PMT-20250729-3310",
				)}
			>
				{actionBody(
					"newPaymentMethodModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								{CUSTOMERS.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Method type</label>
							<select className={styles.fc}>
								<option>M-Pesa number</option>
								<option>Card (Visa / Mastercard)</option>
								<option>Bank account</option>
								<option>PayMo virtual wallet</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Details</label>
							<input className={styles.fc} placeholder="+254 7XX XXX XXX / card / account" />
						</div>
						<div className="mb-3 form-check">
							<input className="form-check-input" type="checkbox" id="makePrimaryPmt" defaultChecked />
							<label className="form-check-label" style={{ fontSize: 12.5 }} htmlFor="makePrimaryPmt">
								Make this the primary method for auto-billing
							</label>
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> We'll send a KES 1
							verification charge (auto-reversed) to confirm ownership.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ N4: Issue Refund ============ */}
			<MBox
				id="issueRefundModal"
				active={active}
				onClose={onClose}
				size="lg"
				title={
					<>
						<i className="bi bi-arrow-counterclockwise" style={{ color: "var(--pm-purple)" }} />{" "}
						Issue Refund
					</>
				}
				footer={actionFooter(
					"issueRefundModal",
					"Process Refund",
					"Refund processed back to the original payment method.",
					"RF-2211",
				)}
			>
				{actionBody(
					"issueRefundModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Original payment</label>
							<select className={styles.fc}>
								<option>PLT-077 · John Ochieng · KES 1,250 · 19 Jun</option>
								<option>ORD-8890 · Zawadi Beauty · KES 48,200 · 30 Jun</option>
								<option>ORD-8863 · Malik Foodstuff · KES 22,800 · 25 Jun</option>
							</select>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<label className={styles.fl}>Refund type</label>
								<select className={styles.fc}>
									<option>Full refund</option>
									<option>Partial refund</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>Amount</label>
								<input className={styles.fc} defaultValue="KES 1,250" />
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Reason</label>
							<select className={styles.fc}>
								{REFUND_REASONS.map((r) => (
									<option key={r}>{r}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Return to</label>
							<select className={styles.fc}>
								{SETTLE_DESTS.map((d) => (
									<option key={d}>{d}</option>
								))}
							</select>
						</div>
						<div className={styles.summaryBoxWarn} style={{ fontSize: 12 }}>
							<i className="bi bi-exclamation-triangle me-1" /> Refunds reduce
							your Fees-page profit by the refunded amount plus the PayMo
							fee on the original transaction.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ N5: Billing Plan Detail ============ */}
			<MBox
				id="billingPlanDetailModal"
				active={active}
				onClose={onClose}
				size="lg"
				title={
					<>
						<i className="bi bi-calendar-check" style={{ color: "var(--pm-info)" }} />{" "}
						Billing Plan — John Ochieng
					</>
				}
				footer={
					<>
						<button className={styles.btnPm} onClick={onClose}>
							Close
						</button>
						<button className={styles.btnPm} onClick={() => onOpen("closeAccountModal")}>
							<i className="bi bi-pause" /> Pause / End
						</button>
					</>
				}
			>
				<div className="row g-3">
					<div className="col-md-6">
						<div className={styles.summaryBox} style={{ fontSize: 12.5 }}>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Amount</span>
								<strong>KES 1,250 / week</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Duration</span>
								<strong>12 weeks · ends Oct</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Next due</span>
								<strong>Fri 01 Aug</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span className={styles.mutedSmall}>Method</span>
								<strong>M-Pesa •••678</strong>
							</div>
						</div>
					</div>
					<div className="col-md-6">
						<div className={styles.summaryBox} style={{ fontSize: 12.5 }}>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Collected</span>
								<strong>KES 7,500 (6 of 12)</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Failed attempts</span>
								<strong className="text-danger">0</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Status</span>
								<span className={`${styles.badge} ${styles.badgeS}`}>Active</span>
							</div>
							<div className="d-flex justify-content-between">
								<span className={styles.mutedSmall}>Reminders</span>
								<strong>3 sent · SMS</strong>
							</div>
						</div>
					</div>
				</div>
				<div className="table-responsive mt-3">
					<table className={styles.tbl}>
						<thead>
							<tr>
								<th>Due</th>
								<th>Ref</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							<tr><td>26 Jun</td><td>PLT-082</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Collected</span></td></tr>
							<tr><td>19 Jun</td><td>PLT-077</td><td><span className={`${styles.badge} ${styles.badgeS}`}>Collected</span></td></tr>
							<tr><td>12 Jun</td><td>PLT-072</td><td><span className={`${styles.badge} ${styles.badgeW}`}>Reminder sent</span></td></tr>
						</tbody>
					</table>
				</div>
			</MBox>

			{/* ============ N6: KYC Record ============ */}
			<MBox
				id="kycRecordModal"
				active={active}
				onClose={onClose}
				size="lg"
				title={
					<>
						<i className="bi bi-shield-check" style={{ color: "var(--pm-info)" }} />{" "}
						KYC Record — Customer
					</>
				}
				footer={actionFooter(
					"kycRecordModal",
					"Request Re-upload",
					"Re-upload requested from the customer.",
					"KYC-REUP-8841",
				)}
			>
				{actionBody(
					"kycRecordModal",
					<>
						<div className="row g-3">
							<div className="col-md-6">
								<div className={styles.summaryBox} style={{ fontSize: 12.5 }}>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Verification level</span>
										<span className={`${styles.badge} ${styles.badgeS}`}>Level 2</span>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Status</span>
										<strong>Verified</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className={styles.mutedSmall}>Submitted</span>
										<strong>27 Jun</strong>
									</div>
									<div className="d-flex justify-content-between">
										<span className={styles.mutedSmall}>Documents expire</span>
										<strong>Mar 2027</strong>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className={styles.kycDoc}>
									<i className="bi bi-file-earmark-person" />
									<div>
										<div style={{ fontSize: 13, fontWeight: 700 }}>National ID — Front</div>
										<div style={{ fontSize: 11.5, color: "var(--pm-muted)" }}>Verified via eKYC</div>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`} style={{ marginLeft: "auto" }}>OK</span>
								</div>
								<div className={styles.kycDoc}>
									<i className="bi bi-file-earmark-person" />
									<div>
										<div style={{ fontSize: 13, fontWeight: 700 }}>National ID — Back</div>
										<div style={{ fontSize: 11.5, color: "var(--pm-muted)" }}>Verified via eKYC</div>
									</div>
									<span className={`${styles.badge} ${styles.badgeS}`} style={{ marginLeft: "auto" }}>OK</span>
								</div>
							</div>
						</div>
					</>,
				)}
			</MBox>

			{/* ============ N7: Location Verify ============ */}
			<MBox
				id="locationVerifyModal"
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-geo-alt" style={{ color: "var(--pm-accent)" }} />{" "}
						Verify Location
					</>
				}
				footer={actionFooter(
					"locationVerifyModal",
					"Mark Verified",
					"Location verified and attached to the customer record.",
					"LOC-20250729-5581",
				)}
			>
				{actionBody(
					"locationVerifyModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								<option>John Ochieng — Plot 14, Kamiti Rd, Ruiru</option>
								<option>Amina Hassan — Apartment 3B, Links Rd, Nyali</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>GPS Coordinates</label>
							<input className={styles.fc} defaultValue="-1.2481, 36.9042" />
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Address note</label>
							<input className={styles.fc} placeholder="Landmark, floor, gate number" />
						</div>
						<div className={styles.summaryBoxInfo} style={{ fontSize: 12 }}>
							<i className="bi bi-info-circle me-1" /> Verified locations power
							delivery, collections and KYC confidence scoring.
						</div>
					</>,
				)}
			</MBox>

			{/* ============ N8: Customer Report / Receipt ============ */}
			<MBox
				id="customerReportModal"
				active={active}
				onClose={onClose}
				size="lg"
				title={
					<>
						<i className="bi bi-file-earmark-text" style={{ color: "var(--pm-info)" }} />{" "}
						Generate Report / Receipt
					</>
				}
				footer={actionFooter(
					"customerReportModal",
					"Generate",
					"Report generated and ready for download.",
					"RPT-20250729-0092",
				)}
			>
				{actionBody(
					"customerReportModal",
					<>
						<div className="mb-3">
							<label className={styles.fl}>Report type</label>
							<select className={styles.fc}>
								<option>Transaction receipt</option>
								<option>Customer statement (period)</option>
								<option>Billing plan summary</option>
								<option>Refund audit trail</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Customer</label>
							<select className={styles.fc}>
								{CUSTOMERS.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<label className={styles.fl}>From</label>
								<input type="date" className={styles.fc} defaultValue="2025-06-01" />
							</div>
							<div className="col-md-6">
								<label className={styles.fl}>To</label>
								<input type="date" className={styles.fc} defaultValue="2025-07-29" />
							</div>
						</div>
						<div className="mb-3">
							<label className={styles.fl}>Delivery</label>
							<div className="d-flex flex-wrap" style={{ gap: 8 }}>
								{["Download PDF", "Email to customer", "WhatsApp to customer"].map((d) => (
									<span key={d} className={`${styles.channelPill} ${styles.channelMail}`}>
										<i className="bi bi-check2" /> {d}
									</span>
								))}
							</div>
						</div>
					</>,
				)}
			</MBox>
		</>
	);
}
