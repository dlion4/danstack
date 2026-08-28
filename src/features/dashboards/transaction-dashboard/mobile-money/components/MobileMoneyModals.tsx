/**
 * MobileMoneyModals — every dialog reachable from the Mobile Money & PSP Hub.
 *
 * All 25 workflows are rebuilt on the shared PayMo modal primitives
 * (SimpleModal / FlowModal / TabbedModal / ModalShell) with focus
 * management, Escape/backdrop close and the navy/emerald token set.
 * Multi-step wizards (Send Money, Bulk Transfer, Dispute, Reconciliation)
 * preserve every original screen: recipient tabs, PIN auto-advance,
 * live processing logs, fee breakdowns and success receipts.
 */
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cx } from "../../../../Layouts/shell/data/shellData";
import {
	FlowModal,
	ModalShell,
	SimpleModal,
	TabbedModal,
} from "../../shared/components/modals";
import s from "../../shared/styles/appPage.module.css";
import type { MobileMoneyConfig } from "../pages/MobileMoney";

const styles = s as Record<string, string>;

export type MobileMoneyData = MobileMoneyConfig & {
	activeModal: string | null;
	setActiveModal: (modal: string | null) => void;
	onToast: (message: string, danger?: boolean) => void;
};

export default function MobileMoneyModals({ data }: { data: MobileMoneyData }) {
	const close = () => data.setActiveModal(null);
	const is = (modal: string) => data.activeModal === modal;
	const nav = (modal: string) => data.setActiveModal(modal);
	const notify = (message: string, danger = false) =>
		data.onToast(message, danger);

	return (
		<>
			<SendMoneyModal show={is("sendMoneyModal")} onClose={close} />
			<BulkTransferModal show={is("bulkTransferModal")} onClose={close} />
			<LinkWalletModal
				show={is("linkWalletModal")}
				onClose={close}
				onDone={() => notify("Wallet linked — KYC verification started.")}
			/>
			<WalletDetailModal
				show={is("walletDetailModal")}
				onClose={close}
				data={data}
			/>
			<BulkRetryModal
				show={is("bulkRetryModal")}
				onClose={close}
				onDone={() => notify("47 transfers queued for retry — ETA 15 minutes.")}
			/>
			<ReconcileModal
				show={is("reconcileModal")}
				onClose={close}
				onDone={() =>
					notify(
						"Reconciliation started — report will be emailed in 5 minutes.",
					)
				}
			/>
			<PspSettingsModal
				show={is("pspSettingsModal")}
				onClose={close}
				onDone={() => notify("PSP settings saved.")}
			/>
			<KycBulkModal
				show={is("kycBulkModal")}
				onClose={close}
				onDone={() => notify("eKYC links sent to 57 accounts.")}
			/>
			<DisputeModal show={is("disputeModal")} onClose={close} />
			<WalletPermissionsModal
				show={is("walletPermissionsModal")}
				onClose={close}
				onDone={() => notify("Wallet permissions updated.")}
			/>
			<ScheduleTransferModal
				show={is("scheduleTransferModal")}
				onClose={close}
				onDone={() => notify("Transfer scheduled.")}
			/>
			<PspHealthModal show={is("pspHealthModal")} onClose={close} data={data} />
			<LimitSettingsModal
				show={is("limitSettingsModal")}
				onClose={close}
				onDone={() => notify("Transaction limits updated.")}
			/>
			<TransferReceiptModal show={is("transferReceiptModal")} onClose={close} />
			<PauseWalletModal
				show={is("pauseWalletModal")}
				onClose={close}
				onConfirm={() => nav("pauseConfirmModal")}
				onDone={() => notify("Wallet paused — all transfers blocked.")}
			/>
			<StatementModal
				show={is("statementModal")}
				onClose={close}
				onDone={() => notify("Statement generated and downloading.")}
			/>
			<WalletHealthModal
				show={is("walletHealthModal")}
				onClose={close}
				data={data}
			/>
			<AddPspModal
				show={is("addPspModal")}
				onClose={close}
				onDone={() => notify("PSP added — API credentials required next.")}
			/>
			<ContactSupportModal
				show={is("contactSupportModal")}
				onClose={close}
				onDone={() => notify("Support ticket created — ref PSP-8821.")}
			/>
			<HealthCheckModal
				show={is("healthCheckModal")}
				onClose={close}
				onOpen={nav}
				data={data}
			/>
			<AttentionModal
				show={is("attentionModal")}
				onClose={close}
				onOpen={nav}
				data={data}
			/>
			<PspCompareModal
				show={is("pspCompareModal")}
				onClose={close}
				data={data}
				onDone={() =>
					notify("Recommendation noted — switching 18% of volume to T-Kash.")
				}
			/>
			<NotifModal show={is("notifModal")} onClose={close} />
			<ProfileModal show={is("profileModal")} onClose={close} />
			<PauseConfirmModal
				show={is("pauseConfirmModal")}
				onClose={close}
				onDone={() => notify("Wallet paused successfully.", true)}
			/>
		</>
	);
}

/* ── Shared option lists (preserved from legacy) ───────────────────────── */

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

const kickerStyle = {
	display: "block",
	color: "#0b8f52",
	fontSize: "0.62rem",
	fontWeight: 750,
	letterSpacing: "0.09em",
	textTransform: "uppercase",
} as const;
function Kicker({ children }: { children: ReactNode }) {
	return <span style={kickerStyle}>{children}</span>;
}

function Hint({
	children,
	tone = "info",
}: {
	children: ReactNode;
	tone?: "info" | "warn";
}) {
	return (
		<p
			className={styles.hintBox}
			style={tone === "warn" ? { borderLeftColor: "#f79009" } : undefined}
		>
			<i
				className={`bi ${tone === "warn" ? "bi-exclamation-triangle" : "bi-info-circle"}`}
				aria-hidden="true"
			/>{" "}
			{children}
		</p>
	);
}

function MiniStat({ label, value }: { label: string; value: string }) {
	return (
		<div
			style={{
				padding: 12,
				border: "1px solid #e6e9f0",
				borderRadius: 12,
				background: "#fafbfd",
			}}
		>
			<Kicker>{label}</Kicker>
			<strong
				style={{
					display: "block",
					marginTop: 4,
					fontSize: "1.1rem",
					color: "#101828",
				}}
			>
				{value}
			</strong>
		</div>
	);
}

function SummaryRow({
	label,
	value,
	strong,
}: {
	label: string;
	value: ReactNode;
	strong?: boolean;
}) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				gap: 12,
				padding: "8px 12px",
				border: "1px solid #e6e9f0",
				borderRadius: 10,
				marginBottom: 6,
				fontSize: "0.78rem",
			}}
		>
			<span style={{ color: "#667085" }}>{label}</span>
			<strong style={strong ? { color: "#067647" } : undefined}>{value}</strong>
		</div>
	);
}

/* ════════════════════════════════════════════════════════════════════════
 * M1 — Send Money (6-step wizard, condensed to 4 FlowModal steps that
 * preserve every original screen: source, recipient (3 tabs), review+costs,
 * authorize (PIN + STK log).
 * ═══════════════════════════════════════════════════════════════════════ */
function SendMoneyModal({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
}) {
	const [recipientTab, setRecipientTab] = useState<
		"phone" | "till" | "paybill"
	>("phone");
	const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
	useEffect(() => {
		if (show) {
			setRecipientTab("phone");
			pinRefs.current = [];
		}
	}, [show]);
	const advancePin = (i: number) => {
		const el = pinRefs.current[i];
		if (el && el.value.length === 1) pinRefs.current[i + 1]?.focus();
	};

	return (
		<FlowModal
			show={show}
			onClose={onClose}
			iconCls="bi-send"
			title="Send Money"
			steps={["Source", "Recipient", "Review & costs", "Authorize"]}
			confirmLabel="Send Money"
		>
			{(step) =>
				step === 1 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<label className={styles.fieldLabel} htmlFor="mm-send-source-type">
							Source type
							<select
								id="mm-send-source-type"
								className={styles.field}
								defaultValue="linked"
							>
								<option value="linked">Linked mobile account</option>
								<option value="new">Add new mobile number</option>
							</select>
						</label>
						<label className={styles.fieldLabel} htmlFor="mm-send-provider">
							Mobile PSP provider
							<select
								id="mm-send-provider"
								className={styles.field}
								defaultValue="mpesa"
							>
								<option value="mpesa">M-Pesa (Safaricom)</option>
								<option value="airtel">Airtel Money</option>
								<option value="tkash">T-Kash (Telkom)</option>
								<option value="equity">Equity Mobile</option>
								<option value="kcb">KCB Mobile</option>
							</select>
						</label>
						<label className={styles.fieldLabel} htmlFor="mm-send-account">
							Linked account
							<select
								id="mm-send-account"
								className={styles.field}
								defaultValue="mpesa-business"
							>
								<option value="">Select linked account</option>
								<option value="mpesa-business">
									M-Pesa Business (0712 345 890)
								</option>
								<option value="airtel-disbursement">
									Airtel Disbursement (0733 112 445)
								</option>
								<option value="tkash-collections">
									T-Kash Collections (0700 998 112)
								</option>
							</select>
						</label>
						<label className={styles.fieldLabel} htmlFor="mm-send-balance">
							Available balance (KES)
							<input
								id="mm-send-balance"
								className={styles.field}
								defaultValue="8,420,000"
							/>
						</label>
						<label
							className="form-check"
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								fontSize: "0.78rem",
							}}
						>
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
								id="mm-send-save"
							/>
							<span className="form-check-label">
								Save this account for future mobile transfers
							</span>
						</label>
						<Hint>
							<strong>Balance is editable</strong> — enter your current mobile
							wallet balance.
						</Hint>
					</div>
				) : step === 2 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<div
							className={styles.chipRow ?? ""}
							role="tablist"
							aria-label="Recipient type"
							style={{
								display: "inline-flex",
								gap: 3,
								padding: 3,
								borderRadius: 10,
								background: "#f2f4f8",
								width: "fit-content",
							}}
						>
							{(
								[
									["phone", "Phone number"],
									["till", "Till number"],
									["paybill", "Paybill"],
								] as const
							).map(([key, label]) => (
								<button
									key={key}
									type="button"
									role="tab"
									aria-selected={recipientTab === key}
									onClick={() => setRecipientTab(key)}
									className={styles.chip}
									style={{
										border: 0,
										borderRadius: 8,
										padding: "0.4rem 0.8rem",
										fontSize: "0.72rem",
										fontWeight: 650,
										cursor: "pointer",
										background: recipientTab === key ? "#fff" : "transparent",
										color: recipientTab === key ? "#0b8f52" : "#667085",
										boxShadow:
											recipientTab === key
												? "0 1px 3px rgba(16,24,40,.1)"
												: "none",
									}}
								>
									{label}
								</button>
							))}
						</div>
						{recipientTab === "phone" && (
							<div style={{ display: "grid", gap: 12 }}>
								<label className={styles.fieldLabel} htmlFor="mm-send-phone">
									Recipient phone number
									<input
										id="mm-send-phone"
										className={styles.field}
										placeholder="07XX XXX XXX"
										defaultValue="0712 345 890"
									/>
								</label>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 12,
									}}
								>
									<label className={styles.fieldLabel} htmlFor="mm-send-name">
										Recipient name (optional)
										<input
											id="mm-send-name"
											className={styles.field}
											placeholder="Enter recipient name"
										/>
									</label>
									<label className={styles.fieldLabel} htmlFor="mm-send-amount">
										Amount (KES)
										<input
											id="mm-send-amount"
											className={styles.field}
											defaultValue="250,000"
										/>
									</label>
								</div>
							</div>
						)}
						{recipientTab === "till" && (
							<div style={{ display: "grid", gap: 12 }}>
								<label className={styles.fieldLabel} htmlFor="mm-send-till">
									Till number
									<input
										id="mm-send-till"
										className={styles.field}
										placeholder="Enter till number"
										defaultValue="123456"
									/>
								</label>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 12,
									}}
								>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-send-till-name"
									>
										Till name (optional)
										<input
											id="mm-send-till-name"
											className={styles.field}
											placeholder="Enter till name"
										/>
									</label>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-send-till-amount"
									>
										Amount (KES)
										<input
											id="mm-send-till-amount"
											className={styles.field}
											defaultValue="250,000"
										/>
									</label>
								</div>
							</div>
						)}
						{recipientTab === "paybill" && (
							<div style={{ display: "grid", gap: 12 }}>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 12,
									}}
								>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-send-paybill"
									>
										Paybill number
										<input
											id="mm-send-paybill"
											className={styles.field}
											placeholder="Enter paybill number"
											defaultValue="174379"
										/>
									</label>
									<label className={styles.fieldLabel} htmlFor="mm-send-acc">
										Account number
										<input
											id="mm-send-acc"
											className={styles.field}
											placeholder="Enter account number"
										/>
									</label>
								</div>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 12,
									}}
								>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-send-paybill-amount"
									>
										Amount (KES)
										<input
											id="mm-send-paybill-amount"
											className={styles.field}
											defaultValue="250,000"
										/>
									</label>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-send-acc-name"
									>
										Account name (optional)
										<input
											id="mm-send-acc-name"
											className={styles.field}
											placeholder="Enter account name"
										/>
									</label>
								</div>
							</div>
						)}
						<label className={styles.fieldLabel} htmlFor="mm-send-country">
							Recipient country
							<select
								id="mm-send-country"
								className={styles.field}
								defaultValue="KE"
							>
								{[
									["KE", "Kenya"],
									["UG", "Uganda"],
									["TZ", "Tanzania"],
									["RW", "Rwanda"],
									["NG", "Nigeria"],
									["GH", "Ghana"],
									["ZA", "South Africa"],
								].map(([code, name]) => (
									<option key={code} value={code}>
										{name}
									</option>
								))}
							</select>
						</label>
					</div>
				) : step === 3 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<SummaryRow
							label="Source account"
							value="M-Pesa Business (0712 345 890)"
						/>
						<SummaryRow label="Source balance" value="KES 8,420,000" />
						<SummaryRow label="Recipient type" value="Phone number" />
						<SummaryRow label="Recipient" value="0712 345 890" />
						<SummaryRow label="Recipient country" value="Kenya" />
						<SummaryRow label="Amount" value="KES 250,000" strong />
						<SummaryRow
							label="Reason / reference"
							value="Monthly supplier payment"
						/>
						<div
							style={{
								padding: 12,
								border: "1px solid #e6e9f0",
								borderRadius: 12,
								background: "#fafbfd",
								fontSize: "0.78rem",
							}}
						>
							<Kicker>Fee breakdown</Kicker>
							<div style={{ display: "grid", gap: 6, marginTop: 8 }}>
								<SummaryRow
									label="Transaction fee"
									value="KES 0 (Business Paybill)"
								/>
								<SummaryRow label="Platform charges" value="KES 5" />
								<SummaryRow label="Tax (16% VAT)" value="KES 0" />
								<SummaryRow
									label="Total to be prompted"
									value="KES 250,005"
									strong
								/>
							</div>
						</div>
						<Hint tone="warn">
							<strong>
								STK prompt will request KES 250,005 from your phone.
							</strong>
						</Hint>
					</div>
				) : (
					<div style={{ display: "grid", gap: 14 }}>
						<div>
							<Kicker>Processing option</Kicker>
							<div style={{ display: "flex", gap: 18, marginTop: 8 }}>
								<label
									style={{
										display: "flex",
										gap: 8,
										alignItems: "center",
										cursor: "pointer",
										fontSize: "0.78rem",
									}}
								>
									<input type="radio" name="mm-process-option" defaultChecked />{" "}
									<strong>Send now</strong>
								</label>
								<label
									style={{
										display: "flex",
										gap: 8,
										alignItems: "center",
										cursor: "pointer",
										fontSize: "0.78rem",
									}}
								>
									<input type="radio" name="mm-process-option" />{" "}
									<strong>Schedule for later</strong>
								</label>
							</div>
						</div>
						<div
							style={{
								padding: 14,
								border: "1px solid #e6e9f0",
								borderRadius: 12,
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: 10,
								}}
							>
								<span style={{ fontSize: "0.78rem", color: "#667085" }}>
									Enter PIN to authorize
								</span>
								<span className={cx(styles.badge, styles.badgeInfo)}>
									<i className="bi bi-shield-lock" aria-hidden="true" /> Secure
								</span>
							</div>
							<div
								style={{ display: "flex", gap: 10, justifyContent: "center" }}
							>
								{[0, 1, 2, 3].map((i) => (
									<input
										key={i}
										type="password"
										maxLength={1}
										aria-label={`PIN digit ${i + 1}`}
										ref={(el) => {
											pinRefs.current[i] = el;
										}}
										onChange={() => advancePin(i)}
										style={{
											width: 52,
											height: 56,
											textAlign: "center",
											fontSize: "1.2rem",
											border: "1px solid #d0d5dd",
											borderRadius: 12,
										}}
									/>
								))}
							</div>
						</div>
						<Hint>
							<strong>STK push live log</strong> — prompt sent, PIN confirmed,
							transaction processing in real time.
						</Hint>
					</div>
				)
			}
		</FlowModal>
	);
}

/* ════════════════════════════════════════════════════════════════════════
 * M2 — Bulk Transfer (5 FlowModal steps preserving all 7 legacy screens:
 * source & STK mode, recipients with 4 input tabs, country/purpose,
 * costs, authorize with PIN + live processing table).
 * ═══════════════════════════════════════════════════════════════════════ */
function BulkTransferModal({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
}) {
	const [recipientTab, setRecipientTab] = useState<
		"paymo" | "manual" | "paste" | "csv"
	>("paymo");
	const [manualRecipients, setManualRecipients] = useState<
		Array<{ id: number; name: string; phone: string; amount: string }>
	>([]);
	const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (show) {
			setRecipientTab("paymo");
			setManualRecipients([]);
			pinRefs.current = [];
		}
	}, [show]);

	const addManual = () => {
		const name =
			(document.getElementById("mm-manual-name") as HTMLInputElement)?.value ??
			"";
		const phone =
			(document.getElementById("mm-manual-phone") as HTMLInputElement)?.value ??
			"";
		const amount =
			(document.getElementById("mm-manual-amount") as HTMLInputElement)
				?.value ?? "";
		if (name && phone && amount) {
			setManualRecipients((prev) => [
				...prev,
				{ id: Date.now(), name, phone, amount },
			]);
			for (const id of [
				"mm-manual-name",
				"mm-manual-phone",
				"mm-manual-amount",
			]) {
				const el = document.getElementById(id) as HTMLInputElement | null;
				if (el) el.value = "";
			}
		}
	};

	const tabs: Array<["paymo" | "manual" | "paste" | "csv", string]> = [
		["paymo", "Paymo users"],
		["manual", "Manual entry"],
		["paste", "Paste list"],
		["csv", "Upload CSV"],
	];

	return (
		<FlowModal
			show={show}
			onClose={onClose}
			iconCls="bi-collection"
			title="Bulk Transfer"
			steps={[
				"Source",
				"Recipients",
				"Country & purpose",
				"Costs",
				"Authorize",
			]}
			confirmLabel="Execute batch"
		>
			{(step) =>
				step === 1 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12,
							}}
						>
							<label className={styles.fieldLabel} htmlFor="mm-bulk-account">
								Linked mobile account
								<select
									id="mm-bulk-account"
									className={styles.field}
									defaultValue="mpesa-business"
								>
									<option value="">Select linked account</option>
									<option value="mpesa-business">
										M-Pesa Business (0712 345 890)
									</option>
									<option value="airtel-disbursement">
										Airtel Disbursement (0733 112 445)
									</option>
									<option value="tkash-collections">
										T-Kash Collections (0700 998 112)
									</option>
									<option value="add-new" style={{ color: "#0b8f52" }}>
										+ Add new account
									</option>
								</select>
							</label>
							<label className={styles.fieldLabel} htmlFor="mm-bulk-provider">
								Mobile PSP provider
								<select
									id="mm-bulk-provider"
									className={styles.field}
									defaultValue="mpesa"
								>
									<option value="mpesa">M-Pesa (Safaricom)</option>
									<option value="airtel">Airtel Money</option>
									<option value="tkash">T-Kash (Telkom)</option>
									<option value="equity">Equity Mobile</option>
									<option value="kcb">KCB Mobile</option>
								</select>
							</label>
						</div>
						<Hint tone="warn">
							<strong>Large amount alert:</strong> amounts above{" "}
							<strong>KES 500,000</strong> need multiple linked accounts to
							split the batch (e.g. KES 2,440,223 ≈ 5 linked accounts).
						</Hint>
						<div>
							<Kicker>STK prompt mode</Kicker>
							<div style={{ display: "flex", gap: 18, marginTop: 8 }}>
								<label
									style={{
										display: "flex",
										gap: 8,
										cursor: "pointer",
										fontSize: "0.78rem",
									}}
								>
									<input type="radio" name="mm-stk-mode" defaultChecked />
									<span>
										<strong>Automatic</strong>
										<br />
										<small style={{ color: "#667085" }}>
											All STK prompts fire at the final step
										</small>
									</span>
								</label>
								<label
									style={{
										display: "flex",
										gap: 8,
										cursor: "pointer",
										fontSize: "0.78rem",
									}}
								>
									<input type="radio" name="mm-stk-mode" />
									<span>
										<strong>Manual</strong>
										<br />
										<small style={{ color: "#667085" }}>
											Initiate each STK push separately
										</small>
									</span>
								</label>
							</div>
						</div>
						<Hint>
							<strong>200 recipients detected • Total KES 4,820,000.</strong>{" "}
							Ensure sufficient float to avoid STK failures.
						</Hint>
					</div>
				) : step === 2 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<div
							role="tablist"
							aria-label="Recipient source"
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 3,
								padding: 3,
								borderRadius: 10,
								background: "#f2f4f8",
							}}
						>
							{tabs.map(([key, label]) => (
								<button
									key={key}
									type="button"
									role="tab"
									aria-selected={recipientTab === key}
									onClick={() => setRecipientTab(key)}
									style={{
										border: 0,
										borderRadius: 8,
										padding: "0.4rem 0.8rem",
										fontSize: "0.72rem",
										fontWeight: 650,
										cursor: "pointer",
										background: recipientTab === key ? "#fff" : "transparent",
										color: recipientTab === key ? "#0b8f52" : "#667085",
										boxShadow:
											recipientTab === key
												? "0 1px 3px rgba(16,24,40,.1)"
												: "none",
									}}
								>
									{label}
								</button>
							))}
						</div>

						{recipientTab === "paymo" && (
							<div style={{ display: "grid", gap: 12 }}>
								<div
									style={{
										overflowX: "auto",
										maxHeight: 240,
										border: "1px solid #e6e9f0",
										borderRadius: 12,
									}}
								>
									<table className={styles.table}>
										<thead>
											<tr>
												<th>
													<span className={styles.srOnly}>Select</span>
												</th>
												<th>Name</th>
												<th>Phone</th>
												<th>Country</th>
												<th>Amount</th>
											</tr>
										</thead>
										<tbody>
											{[
												["John Doe", "0712 345 890", "Kenya", "25,000"],
												["Jane Smith", "0733 112 445", "Kenya", "18,500"],
												["Peter Kamau", "0722 556 778", "Kenya", "28,800"],
												["Mary Wanjiku", "0711 334 556", "Kenya", ""],
												["James Otieno", "0700 112 334", "Kenya", ""],
											].map(([name, phone, country, amount], i) => (
												<tr key={phone}>
													<td>
														<input
															type="checkbox"
															defaultChecked={i < 3}
															aria-label={`Select ${name}`}
														/>
													</td>
													<td>{name}</td>
													<td>{phone}</td>
													<td>{country}</td>
													<td>
														<input
															className={styles.field}
															style={{ width: 110, padding: "4px 8px" }}
															defaultValue={amount}
															placeholder="Amount"
															aria-label={`Amount for ${name}`}
														/>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr",
										gap: 12,
									}}
								>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-bulk-distribution"
									>
										Amount distribution
										<select
											id="mm-bulk-distribution"
											className={styles.field}
											defaultValue="equal"
										>
											<option value="equal">Equal for everyone</option>
											<option value="percentage">Percentage of total</option>
											<option value="custom">Custom per recipient</option>
										</select>
									</label>
									<label className={styles.fieldLabel} htmlFor="mm-bulk-equal">
										Equal amount (KES)
										<input
											id="mm-bulk-equal"
											className={styles.field}
											defaultValue="24,100"
										/>
									</label>
									<div className={styles.fieldLabel}>
										Selected recipients
										<input
											className={styles.field}
											defaultValue="3"
											readOnly
											style={{ background: "#f9fafb" }}
										/>
									</div>
								</div>
								<Hint>
									<i className="bi bi-check-circle" aria-hidden="true" />{" "}
									<strong>3 recipients selected • Total: KES 72,300.</strong>
								</Hint>
							</div>
						)}

						{recipientTab === "manual" && (
							<div style={{ display: "grid", gap: 12 }}>
								<Hint>
									Add recipients one at a time — click “Add recipient” to append
									them to the batch.
								</Hint>
								{manualRecipients.length > 0 && (
									<div
										style={{
											overflowX: "auto",
											border: "1px solid #e6e9f0",
											borderRadius: 12,
										}}
									>
										<table className={styles.table}>
											<thead>
												<tr>
													<th>#</th>
													<th>Name</th>
													<th>Phone</th>
													<th>Amount</th>
													<th>
														<span className={styles.srOnly}>Remove</span>
													</th>
												</tr>
											</thead>
											<tbody>
												{manualRecipients.map((r, i) => (
													<tr key={r.id}>
														<td>{i + 1}</td>
														<td>{r.name}</td>
														<td>{r.phone}</td>
														<td>
															<strong>{r.amount}</strong>
														</td>
														<td>
															<button
																type="button"
																className={cx(styles.btn, styles.btnSecondary)}
																style={{ padding: "4px 8px" }}
																onClick={() =>
																	setManualRecipients((prev) =>
																		prev.filter((_, idx) => idx !== i),
																	)
																}
																aria-label={`Remove ${r.name}`}
															>
																<i className="bi bi-trash" aria-hidden="true" />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr auto",
										gap: 8,
										alignItems: "end",
										padding: 12,
										border: "1px solid #e6e9f0",
										borderRadius: 12,
									}}
								>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-manual-name"
										style={{ margin: 0 }}
									>
										Name
										<input
											id="mm-manual-name"
											className={styles.field}
											placeholder="Recipient name"
										/>
									</label>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-manual-phone"
										style={{ margin: 0 }}
									>
										Phone
										<input
											id="mm-manual-phone"
											className={styles.field}
											placeholder="Phone number"
										/>
									</label>
									<label
										className={styles.fieldLabel}
										htmlFor="mm-manual-amount"
										style={{ margin: 0 }}
									>
										Amount
										<input
											id="mm-manual-amount"
											className={styles.field}
											placeholder="Amount (KES)"
										/>
									</label>
									<button
										type="button"
										className={cx(styles.btn, styles.btnPrimary)}
										onClick={addManual}
									>
										<i className="bi bi-plus-circle" aria-hidden="true" /> Add
									</button>
								</div>
								{manualRecipients.length > 0 && (
									<Hint>
										<strong>{manualRecipients.length} recipients added.</strong>
									</Hint>
								)}
							</div>
						)}

						{recipientTab === "paste" && (
							<div style={{ display: "grid", gap: 10 }}>
								<Hint>
									Paste recipients as <strong>Name, Phone, Amount</strong> — one
									per line. Format auto-detected.
								</Hint>
								<label className={styles.fieldLabel} htmlFor="mm-bulk-paste">
									Recipients list
									<textarea
										id="mm-bulk-paste"
										className={styles.field}
										style={{
											minHeight: 150,
											fontFamily: "monospace",
											fontSize: "0.72rem",
										}}
										placeholder={
											"John Doe, 0712 345 890, 25000\nJane Smith, 0733 112 445, 18500"
										}
									/>
								</label>
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									style={{ justifySelf: "end" }}
								>
									<i className="bi bi-check-circle" aria-hidden="true" /> Parse
									recipients
								</button>
							</div>
						)}

						{recipientTab === "csv" && (
							<div style={{ display: "grid", gap: 12 }}>
								<Hint>
									CSV format: <strong>Name, Phone, Amount, Reason</strong> · max
									1MB · max 500 recipients.
								</Hint>
								<div
									style={{
										padding: 28,
										border: "1px dashed #d0d5dd",
										borderRadius: 12,
										textAlign: "center",
									}}
								>
									<i
										className="bi bi-file-earmark-spreadsheet"
										style={{ fontSize: 40, color: "#0b8f52" }}
										aria-hidden="true"
									/>
									<div style={{ marginTop: 8 }}>
										<input
											type="file"
											accept=".csv"
											className={styles.field}
											style={{ display: "inline-block" }}
											aria-label="Upload CSV file"
										/>
									</div>
									<small style={{ color: "#98a2b3" }}>
										Drag &amp; drop or click to browse
									</small>
								</div>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 12,
									}}
								>
									<MiniStat label="File size limit" value="1 MB" />
									<MiniStat label="Max recipients" value="500" />
								</div>
							</div>
						)}
					</div>
				) : step === 3 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12,
							}}
						>
							<label
								className={styles.fieldLabel}
								htmlFor="mm-bulk-country-mode"
							>
								Recipient countries
								<select
									id="mm-bulk-country-mode"
									className={styles.field}
									defaultValue="single"
								>
									<option value="single">Single country</option>
									<option value="multiple">Multiple countries</option>
								</select>
							</label>
							<label className={styles.fieldLabel} htmlFor="mm-bulk-country">
								Select country
								<select
									id="mm-bulk-country"
									className={styles.field}
									defaultValue="KE"
								>
									{[
										"Kenya",
										"Uganda",
										"Tanzania",
										"Rwanda",
										"Nigeria",
										"Ghana",
										"South Africa",
									].map((c) => (
										<option key={c}>{c}</option>
									))}
								</select>
							</label>
						</div>
						<label className={styles.fieldLabel} htmlFor="mm-bulk-purpose">
							Purpose of funds
							<select
								id="mm-bulk-purpose"
								className={styles.field}
								defaultValue="salary"
							>
								{[
									"Salary / Wages",
									"Farm labour payment",
									"Donations",
									"Fare / transport",
									"Pocket money",
									"School fees",
									"Medical expenses",
									"Business payment",
									"Supplier payment",
									"Other",
								].map((p) => (
									<option key={p} value={p.toLowerCase()}>
										{p}
									</option>
								))}
							</select>
						</label>
						<Hint>
							All recipients are in <strong>Kenya</strong> · purpose:{" "}
							<strong>Farm labour payment</strong>.
						</Hint>
					</div>
				) : step === 4 ? (
					<div style={{ display: "grid", gap: 12 }}>
						<div
							style={{
								overflowX: "auto",
								border: "1px solid #e6e9f0",
								borderRadius: 12,
								maxHeight: 220,
							}}
						>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Phone</th>
										<th>Country</th>
										<th>Amount</th>
									</tr>
								</thead>
								<tbody>
									{[
										["John Doe", "0712 345 890", "Kenya", "KES 25,000"],
										["Jane Smith", "0733 112 445", "Kenya", "KES 18,500"],
										["Peter Kamau", "0722 556 778", "Kenya", "KES 28,800"],
									].map(([name, phone, country, amount]) => (
										<tr key={phone}>
											<td>{name}</td>
											<td>{phone}</td>
											<td>{country}</td>
											<td>
												<strong>{amount}</strong>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr 1fr",
								gap: 10,
							}}
						>
							<MiniStat label="Total recipients" value="3" />
							<MiniStat label="Total amount" value="KES 72,300" />
							<MiniStat label="Total prompted" value="KES 72,397" />
						</div>
						<SummaryRow
							label="Transaction fees (3 × KES 25, bulk 10% off)"
							value="KES 75"
						/>
						<SummaryRow label="Tax (16% VAT)" value="KES 12" />
						<SummaryRow label="Platform charges" value="KES 10" />
						<Hint tone="warn">
							<strong>STK prompts will request KES 72,397 total.</strong>
						</Hint>
					</div>
				) : (
					<div style={{ display: "grid", gap: 14 }}>
						<div
							style={{
								padding: 14,
								border: "1px solid #e6e9f0",
								borderRadius: 12,
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: 10,
								}}
							>
								<span style={{ fontSize: "0.78rem", color: "#667085" }}>
									Enter PIN to authorize the batch
								</span>
								<span className={cx(styles.badge, styles.badgeInfo)}>
									<i className="bi bi-shield-lock" aria-hidden="true" /> Secure
								</span>
							</div>
							<div
								style={{ display: "flex", gap: 10, justifyContent: "center" }}
							>
								{[0, 1, 2, 3].map((i) => (
									<input
										key={i}
										type="password"
										maxLength={1}
										aria-label={`PIN digit ${i + 1}`}
										ref={(el) => {
											pinRefs.current[i] = el;
										}}
										onChange={() => {
											const el = pinRefs.current[i];
											if (el && el.value.length === 1)
												pinRefs.current[i + 1]?.focus();
										}}
										style={{
											width: 52,
											height: 56,
											textAlign: "center",
											fontSize: "1.2rem",
											border: "1px solid #d0d5dd",
											borderRadius: 12,
										}}
									/>
								))}
							</div>
						</div>
						<Hint>
							<strong>Live processing log</strong> — STK prompts are firing;
							delivered recipients update in the batch table in real time.
						</Hint>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr 1fr",
								gap: 10,
							}}
						>
							<MiniStat label="Completed" value="2/9" />
							<MiniStat label="Processing" value="7" />
							<MiniStat label="Failed" value="0" />
						</div>
					</div>
				)
			}
		</FlowModal>
	);
}

/* ════════════════════════════════════════════════════════════════════════
 * Simple action modals
 * ═══════════════════════════════════════════════════════════════════════ */

function LinkWalletModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-plus-circle"
			title="Link new mobile money wallet"
			successMsg="Wallet linked — KYC verification started"
			onSubmit={onDone}
			submitLabel="Link wallet"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<Hint>
					New wallets go through KYC verification before transfers are enabled.
				</Hint>
				<label className={styles.fieldLabel} htmlFor="mm-lw-provider">
					Provider
					<select
						id="mm-lw-provider"
						className={styles.field}
						defaultValue={PROVIDERS[0]}
					>
						{PROVIDERS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-lw-phone">
					Phone number
					<input
						id="mm-lw-phone"
						className={styles.field}
						defaultValue="0712 345 890"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-lw-type">
					Account type
					<select
						id="mm-lw-type"
						className={styles.field}
						defaultValue={ACCOUNT_TYPES[0]}
					>
						{ACCOUNT_TYPES.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				{[
					["lw1", "Enable instant notifications", true],
					["lw2", "Auto-reconcile daily", true],
				].map(([id, label, checked]) => (
					<div className="form-check" key={id as string}>
						<input
							className="form-check-input"
							type="checkbox"
							id={`mm-${id}`}
							defaultChecked={checked as boolean}
						/>
						<label className="form-check-label" htmlFor={`mm-${id}`}>
							{label}
						</label>
					</div>
				))}
			</div>
		</SimpleModal>
	);
}

function WalletDetailModal({
	show,
	onClose,
	data,
}: {
	show: boolean;
	onClose: () => void;
	data: MobileMoneyData;
}) {
	const wallet = data.wallets[0];

	return (
		<TabbedModal
			show={show}
			onClose={onClose}
			iconCls="bi-wallet2"
			title={`Wallet details — ${wallet?.name ?? ""}`}
			size="lg"
			tabs={[
				{
					key: "overview",
					label: "Overview",
					render: () => (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12,
							}}
						>
							<MiniStat label="Balance" value={wallet?.balance ?? "—"} />
							<MiniStat label="24h volume" value="KES 12.4M" />
							<MiniStat label="Daily limit" value={wallet?.dailyLimit ?? "—"} />
							<MiniStat
								label="Health score"
								value={`${wallet?.health ?? 0}%`}
							/>
						</div>
					),
				},
				{
					key: "txns",
					label: "Transactions",
					render: () => (
						<div style={{ overflowX: "auto" }}>
							<table className={styles.table}>
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
										<td>B2C payment</td>
										<td>KES 250,000</td>
										<td>
											<span className={cx(styles.badge, styles.badgeSuccess)}>
												Success
											</span>
										</td>
									</tr>
									<tr>
										<td>27 Jun</td>
										<td>C2B collection</td>
										<td>KES 48,200</td>
										<td>
											<span className={cx(styles.badge, styles.badgeSuccess)}>
												Success
											</span>
										</td>
									</tr>
									<tr>
										<td>26 Jun</td>
										<td>B2C payment</td>
										<td>KES 85,000</td>
										<td>
											<span className={cx(styles.badge, styles.badgeSuccess)}>
												Success
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					),
				},
				{
					key: "limits",
					label: "Limits",
					render: () => (
						<div style={{ display: "grid", gap: 14 }}>
							<label className={styles.fieldLabel} htmlFor="mm-wd-daily">
								Daily limit
								<input
									id="mm-wd-daily"
									className={styles.field}
									defaultValue="50000000"
								/>
							</label>
							<label className={styles.fieldLabel} htmlFor="mm-wd-per">
								Per transaction
								<input
									id="mm-wd-per"
									className={styles.field}
									defaultValue="1000000"
								/>
							</label>
						</div>
					),
				},
				{
					key: "kyc",
					label: "KYC",
					render: () => (
						<div style={{ display: "grid", gap: 10 }}>
							<div className={styles.switchRow}>
								<div className={styles.switchLabel}>
									<strong>KYC status</strong>
									<span className={styles.switchDescription}>
										Business verification tier
									</span>
								</div>
								<span className={cx(styles.badge, styles.badgeSuccess)}>
									Full
								</span>
							</div>
							<div className={styles.switchRow}>
								<div className={styles.switchLabel}>
									<strong>Last verified</strong>
									<span className={styles.switchDescription}>
										Most recent eKYC confirmation
									</span>
								</div>
								<strong>12 Mar 2025</strong>
							</div>
						</div>
					),
				},
			]}
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={onClose}
					>
						<i className="bi bi-check-lg" aria-hidden="true" /> Save changes
					</button>
				</>
			}
		/>
	);
}

function BulkRetryModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-arrow-repeat"
			title="Retry failed transfers"
			successMsg="47 transfers queued for retry"
			onSubmit={onDone}
			submitLabel="Retry now"
		>
			<p style={{ fontSize: "0.8rem", color: "#344054" }}>
				47 transfers failed in the last batch. Reason: insufficient float on
				Airtel Money.
			</p>
			<SummaryRow label="Total amount" value="KES 1,240,000" strong />
			<div className="form-check mb-2">
				<input
					className="form-check-input"
					type="checkbox"
					defaultChecked
					id="mm-br1"
				/>
				<label className="form-check-label" htmlFor="mm-br1">
					Retry all 47
				</label>
			</div>
			<div className="form-check">
				<input className="form-check-input" type="checkbox" id="mm-br2" />
				<label className="form-check-label" htmlFor="mm-br2">
					Skip and notify recipients
				</label>
			</div>
		</SimpleModal>
	);
}

function PspSettingsModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<TabbedModal
			show={show}
			onClose={onClose}
			iconCls="bi-gear"
			title="PSP integration settings"
			size="lg"
			tabs={[
				{
					key: "creds",
					label: "Credentials",
					render: () => (
						<div style={{ display: "grid", gap: 14 }}>
							<Hint tone="warn">
								<i className="bi bi-shield-exclamation" aria-hidden="true" />{" "}
								Airtel Money API token expires in 6 days — renew to avoid
								downtime.
							</Hint>
							<label className={styles.fieldLabel} htmlFor="mm-psp-key">
								API key
								<input
									id="mm-psp-key"
									className={styles.field}
									defaultValue="sk_live_****************************"
								/>
							</label>
							<label className={styles.fieldLabel} htmlFor="mm-psp-secret">
								Secret
								<input
									id="mm-psp-secret"
									className={styles.field}
									type="password"
									defaultValue="••••••••••••••••"
								/>
							</label>
						</div>
					),
				},
				{
					key: "limits",
					label: "Limits",
					render: () => (
						<label className={styles.fieldLabel} htmlFor="mm-psp-cap">
							Daily settlement cap
							<input
								id="mm-psp-cap"
								className={styles.field}
								defaultValue="100000000"
							/>
						</label>
					),
				},
				{
					key: "webhooks",
					label: "Webhooks",
					render: () => (
						<label className={styles.fieldLabel} htmlFor="mm-psp-webhook">
							Webhook URL
							<input
								id="mm-psp-webhook"
								className={styles.field}
								defaultValue="https://api.paymo.co.ke/webhooks/mpesa"
							/>
						</label>
					),
				},
			]}
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={() => {
							onDone();
							onClose();
						}}
					>
						<i className="bi bi-check-lg" aria-hidden="true" /> Save settings
					</button>
				</>
			}
		/>
	);
}

function KycBulkModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-person-check"
			title="Bulk KYC refresh"
			successMsg="eKYC links sent to 57 accounts"
			onSubmit={onDone}
			submitLabel="Send links"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-kyc-accounts">
					Select accounts
					<select
						id="mm-kyc-accounts"
						className={styles.field}
						multiple
						defaultValue={[KYC_ACCOUNTS[0]]}
						style={{ minHeight: 90 }}
					>
						{KYC_ACCOUNTS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-kyc-method">
					Method
					<select
						id="mm-kyc-method"
						className={styles.field}
						defaultValue={KYC_METHODS[0]}
					>
						{KYC_METHODS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<Hint tone="warn">
					<i className="bi bi-clock" aria-hidden="true" /> eKYC links expire in
					72 hours — recipients must complete within the window.
				</Hint>
			</div>
		</SimpleModal>
	);
}

function WalletPermissionsModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	const perms: Array<[string, boolean]> = [
		["Send money", true],
		["Receive money", true],
		["Bulk transfers", true],
		["View balance", false],
		["Manage settings", false],
	];
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-shield-lock"
			title="Wallet permissions"
			successMsg="Permissions updated"
			onSubmit={onDone}
			submitLabel="Save permissions"
		>
			<div style={{ display: "grid", gap: 10 }}>
				{perms.map(([label, checked], i) => (
					<div className={styles.switchRow} key={label}>
						<div className={styles.switchLabel}>
							<strong>{label}</strong>
							<span className={styles.switchDescription}>
								Grant this role access to {label.toLowerCase()}
							</span>
						</div>
						<div className="form-check form-switch">
							<input
								id={`mm-wp-${i}`}
								className="form-check-input"
								type="checkbox"
								role="switch"
								defaultChecked={checked}
								aria-checked={checked}
								aria-label={label}
							/>
						</div>
					</div>
				))}
			</div>
		</SimpleModal>
	);
}

function ScheduleTransferModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-calendar-event"
			title="Schedule transfer"
			successMsg="Transfer scheduled"
			onSubmit={onDone}
			submitLabel="Schedule"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-sch-from">
					From
					<select
						id="mm-sch-from"
						className={styles.field}
						defaultValue="M-Pesa Business"
					>
						<option>M-Pesa Business</option>
					</select>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-sch-to">
					To
					<select
						id="mm-sch-to"
						className={styles.field}
						defaultValue="0712 345 890"
					>
						<option>0712 345 890</option>
					</select>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-sch-amount">
					Amount
					<input
						id="mm-sch-amount"
						className={styles.field}
						defaultValue="100000"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-sch-date">
					Schedule date &amp; time
					<input
						id="mm-sch-date"
						className={styles.field}
						type="datetime-local"
						defaultValue="2025-07-01T09:00"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-sch-freq">
					Frequency
					<select
						id="mm-sch-freq"
						className={styles.field}
						defaultValue={SCHEDULE_FREQS[0]}
					>
						{SCHEDULE_FREQS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
			</div>
		</SimpleModal>
	);
}

function LimitSettingsModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-sliders"
			title="Transaction limits"
			successMsg="Limits updated"
			onSubmit={onDone}
			submitLabel="Save limits"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-lim-per">
					Per transaction limit
					<input
						id="mm-lim-per"
						className={styles.field}
						defaultValue="1000000"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-lim-day">
					Daily limit
					<input
						id="mm-lim-day"
						className={styles.field}
						defaultValue="50000000"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-lim-month">
					Monthly limit
					<input
						id="mm-lim-month"
						className={styles.field}
						defaultValue="500000000"
					/>
				</label>
				<div className="form-check form-switch">
					<input
						id="mm-lim-approve"
						className="form-check-input"
						type="checkbox"
						role="switch"
						defaultChecked
						aria-checked
						aria-label="Require approval above KES 500,000"
					/>
					<label className="form-check-label" htmlFor="mm-lim-approve">
						Require approval for amounts above KES 500,000
					</label>
				</div>
			</div>
		</SimpleModal>
	);
}

function StatementModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-download"
			title="Export statements"
			successMsg="Statement generated and downloading"
			onSubmit={onDone}
			submitLabel="Export"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-st-wallet">
					Wallet
					<select
						id="mm-st-wallet"
						className={styles.field}
						defaultValue={STATEMENT_WALLETS[0]}
					>
						{STATEMENT_WALLETS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
				>
					<label className={styles.fieldLabel} htmlFor="mm-st-from">
						From
						<input
							id="mm-st-from"
							className={styles.field}
							type="date"
							defaultValue="2025-06-01"
						/>
					</label>
					<label className={styles.fieldLabel} htmlFor="mm-st-to">
						To
						<input
							id="mm-st-to"
							className={styles.field}
							type="date"
							defaultValue="2025-06-27"
						/>
					</label>
				</div>
				<label className={styles.fieldLabel} htmlFor="mm-st-format">
					Format
					<select
						id="mm-st-format"
						className={styles.field}
						defaultValue={STATEMENT_FORMATS[0]}
					>
						{STATEMENT_FORMATS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
			</div>
		</SimpleModal>
	);
}

function AddPspModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-plug"
			title="Add new PSP"
			successMsg="PSP added — API credentials required next"
			onSubmit={onDone}
			submitLabel="Add PSP"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-psp-name">
					PSP name
					<input
						id="mm-psp-name"
						className={styles.field}
						placeholder="e.g. Flutterwave"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-psp-type">
					Type
					<select
						id="mm-psp-type"
						className={styles.field}
						defaultValue={PSP_TYPES[0]}
					>
						{PSP_TYPES.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-psp-endpoint">
					API endpoint
					<input
						id="mm-psp-endpoint"
						className={styles.field}
						placeholder="https://api.psp.com"
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-psp-cycle">
					Settlement cycle
					<select
						id="mm-psp-cycle"
						className={styles.field}
						defaultValue={PSP_CYCLES[0]}
					>
						{PSP_CYCLES.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
			</div>
		</SimpleModal>
	);
}

function ContactSupportModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-headset"
			title="Contact PSP support"
			successMsg="Support ticket created — ref PSP-8821"
			onSubmit={onDone}
			submitLabel="Send"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-supp-subject">
					Subject
					<select
						id="mm-supp-subject"
						className={styles.field}
						defaultValue={SUPPORT_SUBJECTS[0]}
					>
						{SUPPORT_SUBJECTS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<label className={styles.fieldLabel} htmlFor="mm-supp-message">
					Message
					<textarea
						id="mm-supp-message"
						className={styles.field}
						rows={4}
						defaultValue="Need assistance with Pesalink integration."
					/>
				</label>
			</div>
		</SimpleModal>
	);
}

function PauseWalletModal({
	show,
	onClose,
	onConfirm,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onConfirm: () => void;
	onDone: () => void;
}) {
	// The legacy flow required an explicit confirmation before pausing; the
	// submit routes to the confirmation dialog, and completion is toasted there.
	void onDone;
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-pause-circle"
			title="Pause wallet"
			onSubmit={onConfirm}
			submitLabel="Continue"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="mm-pw-reason">
					Reason
					<select
						id="mm-pw-reason"
						className={styles.field}
						defaultValue={PAUSE_REASONS[0]}
					>
						{PAUSE_REASONS.map((o) => (
							<option key={o}>{o}</option>
						))}
					</select>
				</label>
				<div className="form-check mb-2">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="mm-pw1"
					/>
					<label className="form-check-label" htmlFor="mm-pw1">
						Block all outgoing transfers
					</label>
				</div>
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						defaultChecked
						id="mm-pw2"
					/>
					<label className="form-check-label" htmlFor="mm-pw2">
						Block all incoming transfers
					</label>
				</div>
			</div>
		</SimpleModal>
	);
}

function PauseConfirmModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-pause-circle"
			title="Confirm pause"
			successMsg="Wallet paused — all transfers blocked"
			onSubmit={onDone}
			submitLabel="Pause wallet"
			submitPrimary={false}
		>
			<p style={{ fontSize: "0.8rem", color: "#344054" }}>
				Are you sure you want to pause this wallet? All transfers will be
				blocked until the wallet is resumed.
			</p>
		</SimpleModal>
	);
}

/* ════════════════════════════════════════════════════════════════════════
 * Multi-step modals on FlowModal
 * ═══════════════════════════════════════════════════════════════════════ */

function DisputeModal({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
}) {
	return (
		<FlowModal
			show={show}
			onClose={onClose}
			iconCls="bi-exclamation-triangle"
			title="File mobile money dispute"
			steps={["Transaction", "Evidence", "Review"]}
			confirmLabel="Submit dispute"
		>
			{(step) =>
				step === 1 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<label className={styles.fieldLabel} htmlFor="mm-disp-ref">
							Transaction reference
							<input
								id="mm-disp-ref"
								className={styles.field}
								defaultValue="MP-882910"
							/>
						</label>
						<label className={styles.fieldLabel} htmlFor="mm-disp-reason">
							Dispute reason
							<select
								id="mm-disp-reason"
								className={styles.field}
								defaultValue={DISPUTE_REASONS[0]}
							>
								{DISPUTE_REASONS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</label>
					</div>
				) : step === 2 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<label className={styles.fieldLabel} htmlFor="mm-disp-desc">
							Description
							<textarea
								id="mm-disp-desc"
								className={styles.field}
								rows={3}
								defaultValue="Recipient claims they never received the funds. Transaction shows successful on our side."
							/>
						</label>
						<label className={styles.fieldLabel} htmlFor="mm-disp-proof">
							Upload screenshot / proof
							<input id="mm-disp-proof" type="file" className={styles.field} />
						</label>
					</div>
				) : (
					<div style={{ display: "grid", gap: 10 }}>
						<SummaryRow label="Reference" value="MP-882910" />
						<SummaryRow label="Reason" value={DISPUTE_REASONS[0]} />
						<SummaryRow
							label="Evidence"
							value="Screenshot + description attached"
						/>
						<Hint>
							Case will be created as <strong>#MMD-44987</strong>. Expected
							resolution: 5–10 business days.
						</Hint>
					</div>
				)
			}
		</FlowModal>
	);
}

function ReconcileModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<FlowModal
			show={show}
			onClose={() => {
				onDone();
				onClose();
			}}
			iconCls="bi-arrow-repeat"
			title="Run reconciliation"
			steps={["Configure & review", "Run"]}
			confirmLabel="Start reconciliation"
		>
			{(step) =>
				step === 1 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<label className={styles.fieldLabel} htmlFor="mm-recon-wallets">
							Select wallets
							<select
								id="mm-recon-wallets"
								className={styles.field}
								multiple
								defaultValue={RECON_WALLETS.slice(0, 2)}
								style={{ minHeight: 100 }}
							>
								{RECON_WALLETS.map((o) => (
									<option key={o}>{o}</option>
								))}
							</select>
						</label>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12,
							}}
						>
							<label className={styles.fieldLabel} htmlFor="mm-recon-from">
								From
								<input
									id="mm-recon-from"
									type="date"
									className={styles.field}
									defaultValue="2025-06-20"
								/>
							</label>
							<label className={styles.fieldLabel} htmlFor="mm-recon-to">
								To
								<input
									id="mm-recon-to"
									type="date"
									className={styles.field}
									defaultValue="2025-06-27"
								/>
							</label>
						</div>
						<Hint>
							Reconciliation typically takes 2–5 minutes. A detailed report is
							emailed on completion.
						</Hint>
					</div>
				) : (
					<div style={{ display: "grid", gap: 10 }}>
						<SummaryRow label="Wallets" value="3 mobile wallets" />
						<SummaryRow label="Date range" value="20–27 Jun 2025" />
						<SummaryRow
							label="Expected mismatches"
							value="Auto-flagged in report"
						/>
						<SummaryRow
							label="Report reference"
							value="REC-20250627-9912"
							strong
						/>
					</div>
				)
			}
		</FlowModal>
	);
}

/* ════════════════════════════════════════════════════════════════════════
 * Read-only / shell modals
 * ═══════════════════════════════════════════════════════════════════════ */

function PspHealthModal({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
	data: MobileMoneyData;
}) {
	const rows: Array<[string, string, string, string, string, string]> = [
		["M-Pesa", "99.98%", "120ms", "0.02%", "12 Jun", styles.badgeSuccess],
		["Airtel Money", "99.71%", "180ms", "0.12%", "25 Jun", styles.badgeSuccess],
		["Pesalink", "94.2%", "450ms", "1.8%", "27 Jun", styles.badgeWarn],
	];
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-heart-pulse"
			title="PSP health dashboard"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Close
				</button>
			}
		>
			<div style={{ overflowX: "auto" }}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>PSP</th>
							<th>Uptime</th>
							<th>Latency</th>
							<th>Error rate</th>
							<th>Last incident</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(([psp, uptime, latency, err, incident, tone]) => (
							<tr key={psp}>
								<td>
									<strong>{psp}</strong>
								</td>
								<td>
									<span className={cx(styles.badge, tone)}>{uptime}</span>
								</td>
								<td>{latency}</td>
								<td>{err}</td>
								<td style={{ color: "#667085" }}>{incident}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ModalShell>
	);
}

function TransferReceiptModal({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			iconCls="bi-receipt"
			title="Transfer receipt"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Close
				</button>
			}
		>
			<div style={{ display: "grid", gap: 10 }}>
				<SummaryRow label="Reference" value="MP-882910" />
				<SummaryRow label="From" value="M-Pesa Business" />
				<SummaryRow label="To" value="0712 345 890" />
				<SummaryRow label="Amount" value="KES 250,000" strong />
				<SummaryRow label="Date" value="27 Jun 2025, 14:32" />
				<SummaryRow
					label="Status"
					value={
						<span className={cx(styles.badge, styles.badgeSuccess)}>
							<i className="bi bi-check-circle-fill" aria-hidden="true" />{" "}
							Completed
						</span>
					}
				/>
			</div>
		</ModalShell>
	);
}

function WalletHealthModal({
	show,
	onClose,
	data,
}: {
	show: boolean;
	onClose: () => void;
	data: MobileMoneyData;
}) {
	const stats = [
		{ label: "Avg health", value: "96", tone: styles.badgeSuccess },
		{
			label: "Active wallets",
			value: String(data.wallets.length),
			tone: styles.badgeInfo,
		},
		{ label: "Degraded", value: "1", tone: styles.badgeWarn },
	];
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-heart-pulse"
			title="Wallet health dashboard"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Close
				</button>
			}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: 12,
				}}
			>
				{stats.map((s) => (
					<MiniStat key={s.label} label={s.label} value={s.value} />
				))}
			</div>
			<div style={{ marginTop: 14, overflowX: "auto" }}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Wallet</th>
							<th>Provider</th>
							<th>Health</th>
							<th>24h txns</th>
						</tr>
					</thead>
					<tbody>
						{data.wallets.map((w) => (
							<tr key={w.id}>
								<td>
									<strong>{w.name}</strong>
								</td>
								<td>
									<span className={cx(styles.badge, styles[w.providerTone])}>
										{w.provider}
									</span>
								</td>
								<td>
									<span
										style={{
											display: "inline-block",
											width: 64,
											height: 6,
											borderRadius: 99,
											background: "#e9edf2",
											overflow: "hidden",
											verticalAlign: "middle",
											marginRight: 8,
										}}
									>
										<span
											style={{
												display: "block",
												height: "100%",
												width: `${w.health}%`,
												background: w.health >= 95 ? "#12b76a" : "#f79009",
											}}
										/>
									</span>
									{w.health}%
								</td>
								<td>{w.txns24h}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ModalShell>
	);
}

function HealthCheckModal({
	show,
	onClose,
	onOpen,
	data,
}: {
	show: boolean;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: MobileMoneyData;
}) {
	const stats = [
		{ label: "Overall", value: "97" },
		{ label: "Wallets", value: String(data.wallets.length * 3) },
		{ label: "Degraded", value: "1" },
		{ label: "Critical", value: "0" },
	];
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-heart-pulse"
			title="Mobile money health check"
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={() => onOpen("walletHealthModal")}
					>
						View details <i className="bi bi-arrow-right" aria-hidden="true" />
					</button>
				</>
			}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: 12,
				}}
			>
				{stats.map((s) => (
					<MiniStat key={s.label} label={s.label} value={s.value} />
				))}
			</div>
			<Hint>
				Last full scan: today 06:00 EAT — {data.wallets.length} business wallets
				reachable, 1 provider degraded (Pesalink).
			</Hint>
		</ModalShell>
	);
}

function AttentionModal({
	show,
	onClose,
	onOpen,
	data,
}: {
	show: boolean;
	onClose: () => void;
	onOpen: (id: string) => void;
	data: MobileMoneyData;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-exclamation-circle"
			title="All attention items"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Done
				</button>
			}
		>
			<div style={{ display: "grid", gap: 10 }}>
				{data.attention.map((item) => (
					<div className={styles.switchRow} key={item.id}>
						<div className={styles.switchLabel}>
							<strong>
								<span
									className={cx(
										styles.badge,
										item.severity === "danger"
											? styles.badgeDanger
											: item.severity === "warn"
												? styles.badgeWarn
												: styles.badgeInfo,
									)}
									style={{ marginRight: 8 }}
								>
									{item.severity === "danger"
										? "Critical"
										: item.severity === "warn"
											? "Warning"
											: "Info"}
								</span>
								{item.title}
							</strong>
							<span className={styles.switchDescription}>{item.detail}</span>
						</div>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => onOpen(item.modal)}
						>
							{item.actionLabel}{" "}
							<i className="bi bi-arrow-right" aria-hidden="true" />
						</button>
					</div>
				))}
			</div>
		</ModalShell>
	);
}

function PspCompareModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	data: MobileMoneyData;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-arrow-left-right"
			title="PSP fee comparison"
			successMsg="Recommendation noted — switching 18% of volume to T-Kash"
			onSubmit={onDone}
			submitLabel="Switch to T-Kash"
			size="lg"
		>
			<div style={{ overflowX: "auto" }}>
				<table className={styles.table}>
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
							<td>
								<strong style={{ color: "#067647" }}>KES 15</strong>
							</td>
						</tr>
						<tr>
							<td>Success rate</td>
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
			</div>
		</SimpleModal>
	);
}

function NotifModal({ show, onClose }: { show: boolean; onClose: () => void }) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			iconCls="bi-bell"
			title="Notifications"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Close
				</button>
			}
		>
			<div style={{ display: "grid", gap: 8 }}>
				<div
					style={{
						padding: 12,
						borderRadius: 12,
						background: "#fee4e2",
						border: "1px solid #fecdca",
						fontSize: "0.8rem",
					}}
				>
					<strong style={{ color: "#b42318" }}>M-Pesa B2C batch failed</strong>
					<div style={{ fontSize: "0.7rem", color: "#b42318" }}>
						47 transactions • KES 1.24M
					</div>
				</div>
				<div
					style={{
						padding: 12,
						borderRadius: 12,
						background: "#fef0c7",
						border: "1px solid #fedf89",
						fontSize: "0.8rem",
					}}
				>
					<strong style={{ color: "#93370d" }}>
						Airtel API token expiring
					</strong>
					<div style={{ fontSize: "0.7rem", color: "#93370d" }}>
						Expires in 6 days
					</div>
				</div>
				<div
					style={{
						padding: 12,
						borderRadius: 12,
						background: "#e8f1fe",
						border: "1px solid #b2ddff",
						fontSize: "0.8rem",
					}}
				>
					<strong style={{ color: "#175cd3" }}>Reconciliation completed</strong>
					<div style={{ fontSize: "0.7rem", color: "#175cd3" }}>
						0 mismatches found
					</div>
				</div>
			</div>
		</ModalShell>
	);
}

function ProfileModal({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			iconCls="bi-person-circle"
			title="Profile"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Close
				</button>
			}
		>
			<div style={{ textAlign: "center" }}>
				<div
					style={{
						width: 64,
						height: 64,
						margin: "0 auto 12px",
						borderRadius: "50%",
						display: "grid",
						placeItems: "center",
						background: "var(--pm-accent-soft, #e7f8ef)",
						color: "#067647",
						fontWeight: 750,
						fontSize: "1.4rem",
					}}
				>
					JK
				</div>
				<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
				<p style={{ fontSize: "0.8rem", color: "#667085" }}>
					james.kamau@email.com
				</p>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 10,
						textAlign: "left",
						marginTop: 16,
					}}
				>
					<MiniStat label="Wallets" value="12 linked" />
					<MiniStat label="Health" value="97/100" />
				</div>
			</div>
		</ModalShell>
	);
}
