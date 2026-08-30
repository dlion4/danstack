"use client";

import { useState } from "react";
import {
	Field,
	FlowModal,
	InfoBox,
	ModalShell,
	SelectField,
	SimpleModal,
	Toggle,
} from "../../shared/components/modals";
import s from "../../shared/styles/appPage.module.css";
import styles from "../styles/settlement.module.css";

/* ============================================================================
   SettlementModals — all settlement workflows on the SHARED modal primitives
   (ModalShell / SimpleModal / FlowModal). No legacy MBox markup.
   Bank-grade clearing concepts (RTGS/PesaLink/Nostro/engine) were phased out
   with the payment-facilitator reframe — see DESIGN-BLUEPRINT.md.
   ========================================================================== */

const shared = s as Record<string, string>;

function downloadFile(name: string, content: string, type = "text/plain") {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

/* ---------- option lists ---------- */
const BIZ_OPTIONS = ["Land Buyers LTD", "Company 2"];
const WALLET_SOURCES = [
	"Business Wallet — KES 4,820,000",
	"Virtual Wallet — KES 1,240,000",
];
const PAYOUT_WHEN = ["Now", "Today", "Weekly"];
const SETTLE_ACCOUNTS = [
	"Equity Bank • 01-2345678-0",
	"PayMo Wallet • BIZ-88213",
];
const RETRY_REASONS = [
	"Network timeout",
	"Insufficient liquidity",
	"Technical error at receiving bank",
	"Other",
];
const DISPUTE_REASONS = [
	"Amount mismatch",
	"Wrong beneficiary",
	"Duplicate settlement",
	"Failed but debited",
];
const REPORT_TYPES = [
	"Daily Settlement Summary",
	"Weekly Performance",
	"Monthly Regulatory Return",
	"Fee Analysis",
];
const REPORT_FORMATS = ["PDF", "Excel", "CSV"];
const PRIORITY_REASONS = [
	"Government disbursement deadline",
	"Salary payment deadline",
	"Regulatory deadline",
];
const REFUND_REASONS = [
	"Customer returned item",
	"Wrong item shipped",
	"Service not provided",
	"Duplicate charge",
	"Other",
];
const RULE_TYPES = ["Retry", "Escalation", "Deferral", "Routing", "Cut-off"];
const RULE_CHANNELS = [
	"M-Pesa",
	"Bank transfer",
	"PayMo wallet",
	"Card",
	"All channels",
];
const RULE_ACTIONS = [
	"Retry transaction",
	"Escalate to settlement manager",
	"Defer to next window",
	"Route to M-Pesa",
	"Flag for manual review",
];
const RULE_HISTORY = [
	{
		time: "27 Jun 14:02",
		rule: "Auto-retry failed payouts",
		change: "Max attempts 3 → 5",
		user: "James K.",
		status: "Applied",
		tone: "badgeS",
	},
	{
		time: "26 Jun 09:30",
		rule: "Weekend batch deferral",
		change: "Paused by operator",
		user: "Grace M.",
		status: "Paused",
		tone: "badgeW",
	},
	{
		time: "25 Jun 17:12",
		rule: "Auto-escalate high-value disputes",
		change: "Threshold KES 5M → KES 10M",
		user: "James K.",
		status: "Applied",
		tone: "badgeS",
	},
	{
		time: "24 Jun 11:45",
		rule: "Auto-retry failed payouts",
		change: "Rule created",
		user: "System",
		status: "Applied",
		tone: "badgeS",
	},
	{
		time: "23 Jun 08:20",
		rule: "Weekend batch deferral",
		change: "Hold window 06:00 → 08:00",
		user: "Ops Lead",
		status: "Applied",
		tone: "badgeS",
	},
	{
		time: "22 Jun 16:05",
		rule: "Cut-off auto-urgent flag",
		change: "Removed by operator",
		user: "Grace M.",
		status: "Removed",
		tone: "badgeD",
	},
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
			{
				label: "Business KYC & onboarding docs",
				detail: "Registration, directors, tax PIN",
				status: "granted",
			},
			{
				label: "API / integration scopes",
				detail: "Payment links, transactions, payouts",
				status: "granted",
			},
			{
				label: "Settlement account ownership",
				detail: "Bank account name matches registration",
				status: "pending",
			},
			{
				label: "Fee agreement",
				detail: "1.25% per transaction accepted",
				status: "granted",
			},
			{
				label: "Payout schedule consent",
				detail: "Weekly · Friday cut-off",
				status: "granted",
			},
			{
				label: "Auto-settle float rule",
				detail: "Refill when below KES 3M",
				status: "granted",
			},
			{
				label: "Refund authority",
				detail: "Owner + 1 approver, max KES 2M",
				status: "granted",
			},
			{
				label: "Data visibility scope",
				detail: "Customer statements & payment history",
				status: "granted",
			},
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
			{
				label: "Business KYC & onboarding docs",
				detail: "Registration, directors, tax PIN",
				status: "granted",
			},
			{
				label: "API / integration scopes",
				detail: "Payment links, transactions, payouts",
				status: "granted",
			},
			{
				label: "Settlement account ownership",
				detail: "PayMo wallet verified",
				status: "granted",
			},
			{
				label: "Fee agreement",
				detail: "2.0% per transaction accepted",
				status: "granted",
			},
			{
				label: "Payout schedule consent",
				detail: "Daily automatic",
				status: "granted",
			},
			{
				label: "Auto-settle float rule",
				detail: "Refill when below KES 500K",
				status: "granted",
			},
			{
				label: "Refund authority",
				detail: "Auto-approve under KES 5K",
				status: "granted",
			},
			{
				label: "Data visibility scope",
				detail: "Customer statements & payment history",
				status: "granted",
			},
		],
	},
];

const toneBadge = (tone: string) =>
	tone === "badgeS"
		? shared.badgeSuccess
		: tone === "badgeW"
			? shared.badgeWarning
			: tone === "badgeD"
				? shared.badgeDanger
				: tone === "badgeI"
					? shared.badgeInfo
					: shared.badgePurple;

export default function SettlementModals({
	active,
	onClose,
	onOpen,
}: {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}) {
	const isOpen = (id: string) => active === id;

	const [apiEnv, setApiEnv] = useState("Sandbox");
	const [payoutWhen, setPayoutWhen] = useState("Now");
	const [bizSel, setBizSel] = useState("land");
	const [bizTab, setBizTab] = useState<"overview" | "perms" | "ledger">(
		"overview",
	);
	const [requested, setRequested] = useState<Record<string, boolean>>({});
	const [rulesTab, setRulesTab] = useState<"active" | "create" | "history">(
		"active",
	);
	const [rules, setRules] = useState<
		{
			id: number;
			name: string;
			type: string;
			channel: string;
			attempts: string;
			interval: string;
			threshold: string;
			on: boolean;
		}[]
	>([
		{
			id: 1,
			name: "Auto-retry failed payouts",
			type: "Retry",
			channel: "M-Pesa",
			attempts: "3",
			interval: "15",
			threshold: "1,000,000",
			on: true,
		},
		{
			id: 2,
			name: "Auto-escalate high-value disputes",
			type: "Escalation",
			channel: "All channels",
			attempts: "1",
			interval: "0",
			threshold: "5,000,000",
			on: true,
		},
		{
			id: 3,
			name: "Weekend batch deferral",
			type: "Deferral",
			channel: "Bank transfer",
			attempts: "1",
			interval: "0",
			threshold: "0",
			on: false,
		},
	]);
	const [newRuleNote, setNewRuleNote] = useState("");
	const [rulesSaved, setRulesSaved] = useState(false);

	const biz = MODAL_BIZ.find((b) => b.id === bizSel) ?? MODAL_BIZ[0];
	const granted = biz.perms.filter(
		(p) => p.status === "granted" || requested[p.label],
	).length;

	const ledgerRows =
		biz.id === "land"
			? [
					[
						"Today 14:05",
						"Collection",
						"Installment • PLT-091",
						"KES 4,500,000",
						"Collected",
						"badgeS",
					],
					[
						"Today 13:20",
						"Refund",
						"Deposit • PLT-117",
						"KES 1,050,000",
						"Pending Approval",
						"badgeW",
					],
					[
						"Today 09:15",
						"Payout",
						"Weekly batch • WB-441",
						"KES 41,200,000",
						"Paid Out",
						"badgeS",
					],
				]
			: [
					[
						"Today 14:32",
						"Collection",
						"Order • ORD-8901",
						"KES 12,400",
						"Collected",
						"badgeS",
					],
					[
						"Today 14:05",
						"Refund",
						"Order • ORD-8834",
						"KES 12,400",
						"Completed",
						"badgeS",
					],
					[
						"Today 08:30",
						"Payout",
						"Daily batch • DB-112",
						"KES 1,240,000",
						"Paid Out",
						"badgeS",
					],
				];

	return (
		<>
			{/* ============================================================
			   LINK PAYMO API
			   ============================================================ */}
			<SimpleModal
				show={isOpen("linkApiModal")}
				onClose={onClose}
				iconCls="bi bi-plug"
				title="Link Paymo API"
				submitLabel="Save & Connect"
				successMsg="Paymo connected successfully. Webhook verified."
			>
				<Field
					label="API Key"
					type="password"
					placeholder="sk_live_••••••••••••••••"
				/>
				<div className="mb-3">
					<span className={shared.fieldLabel}>Environment</span>
					<div className={shared.pills} style={{ marginTop: 6 }}>
						{["Sandbox", "Production"].map((env) => (
							<button
								type="button"
								key={env}
								className={`${shared.pill} ${apiEnv === env ? shared.pillActive : ""}`}
								onClick={() => setApiEnv(env)}
							>
								{env}
							</button>
						))}
					</div>
				</div>
				<Field
					label="Webhook URL"
					defaultValue="https://paymo.example.com/webhooks/settlement"
				/>
				<InfoBox>
					<i className="bi bi-shield-check" aria-hidden="true" /> Connecting
					enables: collecting customer payments, automated payouts, refunds and
					float rebalancing.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   NEW PAYOUT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("payoutModal")}
				onClose={onClose}
				iconCls="bi bi-send"
				title="New Payout"
				submitLabel="Schedule Payout"
				successMsg="Payout scheduled · Ref PO-9921 — receipt sent to the business."
			>
				<SelectField
					label="Business"
					options={[
						"Land Buyers LTD — KES 5,200,000 pending",
						"Company 2 — KES 1,200,000 pending",
					]}
				/>
				<div className="mb-3">
					<span className={shared.fieldLabel}>When</span>
					<div className={shared.pills} style={{ marginTop: 6 }}>
						{PAYOUT_WHEN.map((when) => (
							<button
								type="button"
								key={when}
								className={`${shared.pill} ${payoutWhen === when ? shared.pillActive : ""}`}
								onClick={() => setPayoutWhen(when)}
							>
								{when}
							</button>
						))}
					</div>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<Field label="Amount (KES)" defaultValue="5200000" />
					</div>
					<div className="col-md-6">
						<SelectField label="Settlement Account" options={SETTLE_ACCOUNTS} />
					</div>
				</div>
				<div className={styles.summaryBoxAccent}>
					Fee 1.25% (KES 65,000) • Business receives KES 5,135,000
				</div>
			</SimpleModal>

			{/* ============================================================
			   REBALANCE FLOAT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("rebalanceModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-clockwise"
				title="Rebalance Float"
				submitLabel="Rebalance Now"
				successMsg="Rebalance initiated — float credited for auto-settlement · Ref RB-102."
			>
				<SelectField label="Business" options={BIZ_OPTIONS} />
				<SelectField label="Source Wallet" options={WALLET_SOURCES} />
				<Field label="Amount (KES)" defaultValue="3000000" />
				<InfoBox>
					<i className="bi bi-lightning-charge" aria-hidden="true" />{" "}
					Auto-settle uses this float to pay your customers instantly. Min float
					for Land Buyers LTD: KES 3,000,000.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   INTERNAL TRANSFER
			   ============================================================ */}
			<SimpleModal
				show={isOpen("internalTransferModal")}
				onClose={onClose}
				iconCls="bi bi-wallet2"
				title="My Wallets — Internal Transfer"
				submitLabel="Send Money"
				successMsg="Internal transfer completed · Ref TW-9922."
			>
				<SelectField label="From Wallet" options={WALLET_SOURCES} />
				<SelectField
					label="To"
					options={[
						"Virtual Wallet",
						"Business Float — Land Buyers LTD",
						"Business Float — Company 2",
						"Equity Bank • 01-2345678-0",
					]}
				/>
				<div className="row g-3">
					<div className="col-md-7">
						<Field label="Amount (KES)" defaultValue="150000" />
					</div>
					<div className="col-md-5">
						<Field label="Reference" placeholder="e.g. float top-up" />
					</div>
				</div>
				<InfoBox>
					<i className="bi bi-info-circle" aria-hidden="true" /> Transfers
					between your own wallets are instant and free. Bank transfers settle
					in 1–2 business days.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   WALLET TOP-UP
			   ============================================================ */}
			<SimpleModal
				show={isOpen("walletTopUpModal")}
				onClose={onClose}
				iconCls="bi bi-plus-circle"
				title="Top Up Wallet"
				submitLabel="Top Up"
				successMsg="Wallet topped up. Funds available instantly · Ref TU-552."
			>
				<SelectField
					label="Wallet"
					options={["Business Wallet", "Virtual Wallet"]}
				/>
				<Field label="Amount (KES)" defaultValue="500000" />
				<SelectField
					label="Funds From"
					options={["Linked Bank Account", "Corporate Card •••• 4421"]}
				/>
				<div className={styles.summaryBoxAccent}>
					<i className="bi bi-lightning-charge" aria-hidden="true" /> Available
					immediately for payouts and float rebalancing.
				</div>
			</SimpleModal>

			{/* ============================================================
			   ISSUE REFUND
			   ============================================================ */}
			<SimpleModal
				show={isOpen("refundModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-counterclockwise"
				title="Issue Refund"
				submitLabel="Issue Refund"
				submitPrimary={false}
				successMsg="Refund submitted for approval · Ref RF-4413."
			>
				<SelectField
					label="Business"
					options={["Company 2", "Land Buyers LTD"]}
				/>
				<div className="row g-3">
					<div className="col-md-6">
						<Field label="Customer" placeholder="e.g. J. Otieno" />
					</div>
					<div className="col-md-6">
						<Field label="Transaction Ref" placeholder="e.g. ORD-8890" />
					</div>
				</div>
				<div className="row g-3">
					<div className="col-md-6">
						<Field label="Amount (KES)" defaultValue="12400" />
					</div>
					<div className="col-md-6">
						<SelectField label="Reason" options={REFUND_REASONS} />
					</div>
				</div>
				<InfoBox variant="warning">
					<i className="bi bi-info-circle" aria-hidden="true" /> Refunds over
					KES 5,000 require a second approver for this business.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   RETRY FAILED SETTLEMENT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("retrySettlementModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-clockwise"
				title="Retry Failed Settlement"
				submitLabel="Retry Now"
				successMsg="Retry initiated for 1 settlement · New reference SET-88425."
			>
				<div className="mb-3">
					<span className={shared.fieldLabel}>Select Failed Settlements</span>
					{[
						{ label: "SET-88423 • KES 8.4M • Absa → NCBA", checked: true },
						{ label: "SET-88419 • KES 12.1M • Co-op → Equity", checked: false },
					].map((item) => (
						<div className="form-check mb-2" key={item.label}>
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked={item.checked}
								id={`retry-${item.label.replace(/\W/g, "-")}`}
							/>
							<label
								className="form-check-label"
								htmlFor={`retry-${item.label.replace(/\W/g, "-")}`}
							>
								{item.label}
							</label>
						</div>
					))}
				</div>
				<SelectField label="Retry Reason" options={RETRY_REASONS} />
				<InfoBox variant="warning">
					<i className="bi bi-info-circle" aria-hidden="true" /> Retry will
					incur an additional payout fee of KES 2,250 per transaction.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   PARTIAL SETTLEMENT RESOLUTION
			   ============================================================ */}
			<SimpleModal
				show={isOpen("partialSettlementModal")}
				onClose={onClose}
				iconCls="bi bi-scissors"
				title="Partial Settlement Resolution"
				submitLabel="Accept Partial"
				successMsg="Partial settlement accepted — remaining KES 2.7M scheduled for tomorrow."
			>
				<Field label="Accept Partial Amount" defaultValue="65100000" />
				<div className="mb-3">
					<label className={shared.fieldLabel} htmlFor="partial-reason">
						Reason for Partial
					</label>
					<textarea
						id="partial-reason"
						className={`${shared.field} form-control`}
						rows={2}
						defaultValue="Receiving bank liquidity constraint. Balance to be settled tomorrow."
					/>
				</div>
			</SimpleModal>

			{/* ============================================================
			   SETTLEMENT DETAILS
			   ============================================================ */}
			<ModalShell
				show={isOpen("settlementDetailModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-text"
				title="Settlement Details — SET-88421"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnPrimary}`}
							onClick={() => onOpen("retrySettlementModal")}
						>
							<i className="bi bi-arrow-clockwise" aria-hidden="true" /> Retry
							if Failed
						</button>
					</>
				}
			>
				<div className="row g-3">
					<div className="col-md-6">
						<div className={styles.summaryBox}>
							{[
								["Reference", "SET-88421"],
								["From", "Business Wallet"],
								["To", "Equity Bank • 01-2345678-0"],
								["Amount", "KES 45,000,000"],
								["Channel", "Bank transfer"],
							].map(([k, v]) => (
								<div className="d-flex justify-content-between mb-2" key={k}>
									<span className={styles.mutedSmall}>{k}</span>
									<strong>{v}</strong>
								</div>
							))}
						</div>
					</div>
					<div className="col-md-6">
						<div className={styles.summaryBoxInfo}>
							<div className="d-flex justify-content-between mb-2">
								<span className={styles.mutedSmall}>Status</span>
								<span className={`${shared.badge} ${shared.badgeInfo}`}>
									In Progress
								</span>
							</div>
							{[
								["Initiated", "14:18 EAT"],
								["ETA", "14:47 EAT"],
								["Fee", "KES 2,250"],
							].map(([k, v]) => (
								<div className="d-flex justify-content-between mb-2" key={k}>
									<span className={styles.mutedSmall}>{k}</span>
									<strong>{v}</strong>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="mt-3">
					<h6 style={{ fontWeight: 700 }}>Timeline</h6>
					{[
						["14:18", "Instruction received"],
						["14:19", "Validation passed"],
						["14:22", "Sent to settlement engine"],
						["14:47 (expected)", "Settlement complete"],
					].map(([t, d]) => (
						<div className={styles.sr} key={t}>
							<div>
								<strong>{t}</strong> — {d}
							</div>
						</div>
					))}
				</div>
			</ModalShell>

			{/* ============================================================
			   RECONCILIATION DETAILS
			   ============================================================ */}
			<ModalShell
				show={isOpen("reconciliationDetailModal")}
				onClose={onClose}
				iconCls="bi bi-list-check"
				title="Reconciliation Details — BAT-21092"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={styles.summaryBox}>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Expected Credits</span>
						<strong>184</strong>
					</div>
					<div className="d-flex justify-content-between mb-2">
						<span className={styles.mutedSmall}>Actual Credits</span>
						<strong>184</strong>
					</div>
					<div className="d-flex justify-content-between">
						<span className={styles.mutedSmall}>Variance</span>
						<span className={`${shared.badge} ${shared.badgeSuccess}`}>0</span>
					</div>
				</div>
			</ModalShell>

			{/* ============================================================
			   RECONCILIATION WIZARD (stepper)
			   ============================================================ */}
			<FlowModal
				show={isOpen("reconciliationWizardModal")}
				onClose={onClose}
				iconCls="bi bi-list-check"
				title="Reconciliation Wizard"
				steps={["Select", "Match", "Resolve", "Done"]}
				confirmLabel="Reconcile"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 1: Select batches to reconcile
								</p>
								{[
									{
										label: "BAT-21092 • Equity Clearing • KES 184.2M",
										checked: true,
									},
									{
										label: "BAT-21093 • KCB Clearing • KES 67.8M",
										checked: true,
									},
									{
										label: "BAT-21094 • Co-op Clearing • KES 41.5M",
										checked: false,
									},
								].map((item) => (
									<div className="form-check mb-2" key={item.label}>
										<input
											className="form-check-input"
											type="checkbox"
											defaultChecked={item.checked}
											id={`recon-${item.label.replace(/\W/g, "-")}`}
										/>
										<label
											className="form-check-label"
											htmlFor={`recon-${item.label.replace(/\W/g, "-")}`}
										>
											{item.label}
										</label>
									</div>
								))}
							</div>
						)}
						{step === 2 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 2: Run matching
								</p>
								<div className={`${styles.summaryBoxInfo} mb-3`}>
									<div
										style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}
									>
										Matching Engine Running…
									</div>
									<div className="progress mt-2" style={{ height: 6 }}>
										<div className="progress-bar" style={{ width: "78%" }} />
									</div>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Matched</strong>
									</div>
									<strong>1,142 / 1,189</strong>
								</div>
								<div className={styles.sr}>
									<div>
										<strong>Exceptions</strong>
									</div>
									<strong>47 items</strong>
								</div>
							</div>
						)}
						{step === 3 && (
							<div>
								<p className={`${shared.fieldLabel} mb-3`}>
									Step 3: Resolve exceptions
								</p>
								<div className={shared.tableWrap}>
									<table className={shared.table}>
										<thead>
											<tr>
												<th>Item</th>
												<th>Variance</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>TRX-99182</td>
												<td>KES 12,400</td>
												<td>
													<button
														type="button"
														className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
														onClick={() => onOpen("disputeModal")}
													>
														Create Dispute
													</button>
												</td>
											</tr>
											<tr>
												<td>TRX-99183</td>
												<td>KES 8,900</td>
												<td>
													<button
														type="button"
														className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
														onClick={() => onOpen("partialSettlementModal")}
													>
														Partial Accept
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   RAISE SETTLEMENT DISPUTE (stepper)
			   ============================================================ */}
			<FlowModal
				show={isOpen("disputeModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-triangle"
				title="Raise Settlement Dispute"
				steps={["Details", "Evidence", "Done"]}
				confirmLabel="Submit"
			>
				{(step) => (
					<>
						{step === 1 && (
							<div className="row g-3">
								<div className="col-md-6">
									<Field label="Settlement Ref" defaultValue="SET-88419" />
								</div>
								<div className="col-md-6">
									<Field label="Dispute Amount" defaultValue="2700000" />
								</div>
								<div className="col-12">
									<SelectField label="Reason" options={DISPUTE_REASONS} />
								</div>
							</div>
						)}
						{step === 2 && (
							<div>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="dispute-desc">
										Description
									</label>
									<textarea
										id="dispute-desc"
										className={`${shared.field} form-control`}
										rows={3}
										defaultValue="Expected credit of KES 67.8M but only KES 65.1M received. Difference of KES 2.7M."
									/>
								</div>
								<div className="mb-3">
									<label className={shared.fieldLabel} htmlFor="dispute-file">
										Upload Evidence
									</label>
									<input
										id="dispute-file"
										type="file"
										className={`${shared.field} form-control`}
									/>
								</div>
							</div>
						)}
					</>
				)}
			</FlowModal>

			{/* ============================================================
			   AUTOMATED SETTLEMENT RULES (tabs)
			   ============================================================ */}
			<ModalShell
				show={isOpen("autoRulesModal")}
				onClose={onClose}
				iconCls="bi bi-gear"
				title="Automated Settlement Rules"
				size="lg"
				footer={
					rulesSaved ? (
						<button
							type="button"
							className={`${shared.btn} ${shared.btnPrimary}`}
							onClick={onClose}
						>
							Done
						</button>
					) : (
						<>
							<button
								type="button"
								className={`${shared.btn} ${shared.btnSecondary}`}
								onClick={onClose}
							>
								Cancel
							</button>
							<button
								type="button"
								className={`${shared.btn} ${shared.btnPrimary}`}
								onClick={() => setRulesSaved(true)}
							>
								Save Rules
							</button>
						</>
					)
				}
			>
				{rulesSaved ? (
					<output className={shared.receipt}>
						<div className={shared.receiptIcon}>
							<i className="bi bi-check-lg" aria-hidden="true" />
						</div>
						<h3 className={shared.receiptTitle}>Automation rules updated</h3>
						<p className={shared.receiptMsg}>
							Your settlement rules are now live.
						</p>
					</output>
				) : (
					<>
						<div className={`${shared.pills} mb-3`}>
							{(["active", "create", "history"] as const).map((tab) => (
								<button
									type="button"
									key={tab}
									className={`${shared.pill} ${rulesTab === tab ? shared.pillActive : ""}`}
									onClick={() => {
										setRulesTab(tab);
										if (tab === "create") setNewRuleNote("");
									}}
								>
									{tab === "active"
										? `Active Rules (${rules.length})`
										: tab === "create"
											? "Create New"
											: "History"}
								</button>
							))}
						</div>
						{rulesTab === "active" && (
							<div>
								{newRuleNote && (
									<div
										className={`${shared.badge} ${shared.badgeSuccess}`}
										style={{
											display: "flex",
											marginBottom: 10,
											padding: "8px 10px",
										}}
									>
										<i className="bi bi-check-circle" aria-hidden="true" />{" "}
										{newRuleNote}
									</div>
								)}
								{rules.map((rule) => (
									<div
										className={styles.summaryBox}
										style={{ marginBottom: 10 }}
										key={rule.id}
									>
										<div
											className="d-flex justify-content-between align-items-center mb-2 flex-wrap"
											style={{ gap: 8 }}
										>
											<strong style={{ fontSize: 13 }}>{rule.name}</strong>
											<span
												className={`${shared.badge} ${rule.on ? shared.badgeSuccess : shared.badgeWarning}`}
											>
												{rule.on ? "Active" : "Paused"}
											</span>
										</div>
										<div className="row g-2">
											<div className="col-md-3">
												<SelectField
													label="Rule Type"
													options={RULE_TYPES}
													defaultValue={rule.type}
												/>
											</div>
											<div className="col-md-3">
												<SelectField
													label="Channel"
													options={RULE_CHANNELS}
													defaultValue={rule.channel}
												/>
											</div>
											<div className="col-md-2">
												<Field
													label="Max Attempts"
													defaultValue={rule.attempts}
													type="number"
												/>
											</div>
											<div className="col-md-2">
												<Field
													label="Interval (min)"
													defaultValue={rule.interval}
													type="number"
												/>
											</div>
											<div className="col-md-2">
												<Field
													label="Threshold (KES)"
													defaultValue={rule.threshold}
												/>
											</div>
										</div>
										<Toggle
											checked={rule.on}
											label="Enable rule"
											onChange={(next) =>
												setRules((prev) =>
													prev.map((r) =>
														r.id === rule.id ? { ...r, on: next } : r,
													),
												)
											}
										/>
									</div>
								))}
							</div>
						)}
						{rulesTab === "create" && (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const fd = new FormData(e.currentTarget);
									const name = String(fd.get("ruleName") || "Untitled rule");
									const type = String(fd.get("ruleType") || "Retry");
									const channel = String(fd.get("ruleChannel") || "M-Pesa");
									const threshold = String(fd.get("ruleThreshold") || "0");
									const attempts = String(fd.get("ruleAttempts") || "1");
									const interval = String(fd.get("ruleInterval") || "0");
									setRules((prev) => [
										...prev,
										{
											id: Date.now(),
											name,
											type,
											channel,
											attempts,
											interval,
											threshold,
											on: true,
										},
									]);
									setNewRuleNote(
										`Rule "${name}" added to Active Rules. Click Save Rules to persist.`,
									);
									setRulesTab("active");
								}}
							>
								<div className="row g-3">
									<div className="col-md-6">
										<label className={shared.fieldLabel} htmlFor="rule-name">
											Rule Name
										</label>
										<input
											id="rule-name"
											name="ruleName"
											className={`${shared.field} form-control`}
											placeholder="e.g. Auto-route failed payouts"
										/>
									</div>
									<div className="col-md-6">
										<SelectField
											label="Rule Type"
											options={RULE_TYPES}
											defaultValue="Retry"
										/>
									</div>
									<div className="col-md-6">
										<SelectField
											label="Trigger Channel"
											options={RULE_CHANNELS}
											defaultValue="M-Pesa"
										/>
									</div>
									<div className="col-md-6">
										<label
											className={shared.fieldLabel}
											htmlFor="rule-threshold"
										>
											Min Amount Threshold (KES)
										</label>
										<input
											id="rule-threshold"
											name="ruleThreshold"
											className={`${shared.field} form-control`}
											placeholder="e.g. 1,000,000"
										/>
									</div>
									<div className="col-md-4">
										<label
											className={shared.fieldLabel}
											htmlFor="rule-attempts"
										>
											Max Attempts
										</label>
										<input
											id="rule-attempts"
											name="ruleAttempts"
											type="number"
											className={`${shared.field} form-control`}
											defaultValue="3"
											min={1}
										/>
									</div>
									<div className="col-md-4">
										<label
											className={shared.fieldLabel}
											htmlFor="rule-interval"
										>
											Retry Interval (min)
										</label>
										<input
											id="rule-interval"
											name="ruleInterval"
											type="number"
											className={`${shared.field} form-control`}
											defaultValue="15"
											min={0}
										/>
									</div>
									<div className="col-md-4">
										<SelectField
											label="Action On Trigger"
											options={RULE_ACTIONS}
										/>
									</div>
									<div
										className="col-12 d-flex align-items-center justify-content-between flex-wrap"
										style={{ gap: 8 }}
									>
										<Toggle
											checked
											label="Enable immediately"
											onChange={() => undefined}
										/>
										<button
											type="submit"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnPrimary}`}
										>
											<i className="bi bi-plus" aria-hidden="true" /> Add Rule
										</button>
									</div>
								</div>
							</form>
						)}
						{rulesTab === "history" && (
							<div className={shared.tableWrap}>
								<table className={shared.table}>
									<thead>
										<tr>
											<th>Time</th>
											<th>Rule</th>
											<th>Change</th>
											<th>User</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{RULE_HISTORY.map((h) => (
											<tr key={h.time + h.rule}>
												<td>{h.time}</td>
												<td>{h.rule}</td>
												<td>{h.change}</td>
												<td>{h.user}</td>
												<td>
													<span
														className={`${shared.badge} ${toneBadge(h.tone)}`}
													>
														{h.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</>
				)}
			</ModalShell>

			{/* ============================================================
			   REGULATORY COMPLIANCE REPORTS
			   ============================================================ */}
			<SimpleModal
				show={isOpen("complianceReportModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-check"
				title="Regulatory Compliance Reports"
				submitLabel="Submit Pending Reports"
				successMsg="Report generated and submitted · Ref CBK-20250627-001."
			>
				{[
					{
						title: "CBK Daily Settlement Return",
						sub: "27 Jun 2025 • Submitted 09:12",
						tone: shared.badgeSuccess,
						status: "Submitted",
					},
					{
						title: "KRA Withholding Tax",
						sub: "Due 29 Jun 2025",
						tone: shared.badgeWarning,
						status: "Pending",
					},
					{
						title: "AML Large Transaction Report",
						sub: "26 Jun 2025 • Submitted",
						tone: shared.badgeSuccess,
						status: "Submitted",
					},
					{
						title: "Fee & Settlement Position Report",
						sub: "Monthly • Due 30 Jun",
						tone: shared.badgeWarning,
						status: "Pending",
					},
				].map((r) => (
					<div className={styles.sr} key={r.title}>
						<div>
							<strong>{r.title}</strong>
							<div className={styles.mutedSmall}>{r.sub}</div>
						</div>
						<span className={`${shared.badge} ${r.tone}`}>{r.status}</span>
					</div>
				))}
			</SimpleModal>

			{/* ============================================================
			   GENERATE SETTLEMENT REPORT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("generateReportModal")}
				onClose={onClose}
				iconCls="bi bi-download"
				title="Generate Settlement Report"
				submitLabel="Generate"
				successMsg="Report generated successfully. Download started."
				onSubmit={() =>
					downloadFile(
						"paymo-settlement-report.csv",
						"ref,from,to,amount,channel,status\nSET-88421,Equity,KCB,45000000,RTGS,In Progress\nSET-88422,Co-op,Stanbic,12800000,PesaLink,Settled\nSET-88423,Absa,NCBA,8400000,RTGS,Retry\n",
						"text/csv",
					)
				}
			>
				<SelectField label="Report Type" options={REPORT_TYPES} />
				<div className="mb-3">
					<span className={shared.fieldLabel}>Date Range</span>
					<div className="row g-2 mt-1">
						<div className="col-6">
							<input
								type="date"
								className={`${shared.field} form-control`}
								defaultValue="2025-06-01"
							/>
						</div>
						<div className="col-6">
							<input
								type="date"
								className={`${shared.field} form-control`}
								defaultValue="2025-06-27"
							/>
						</div>
					</div>
				</div>
				<SelectField label="Format" options={REPORT_FORMATS} />
			</SimpleModal>

			{/* ============================================================
			   SETTLEMENT HEALTH CHECK
			   ============================================================ */}
			<ModalShell
				show={isOpen("healthCheckModal")}
				onClose={onClose}
				iconCls="bi bi-heart-pulse"
				title="Settlement Health Check"
				size="lg"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className="row g-3 mb-1">
					{[
						{
							value: "97",
							label: "HEALTH SCORE",
							bg: "var(--pm-accent-soft)",
							color: "var(--pm-accent)",
						},
						{
							value: "99.7%",
							label: "SUCCESS",
							bg: "var(--pm-info-soft)",
							color: "var(--pm-info)",
						},
						{
							value: "3",
							label: "EXCEPTIONS",
							bg: "var(--pm-warning-soft)",
							color: "var(--pm-warning)",
						},
						{
							value: "14",
							label: "BATCHES",
							bg: "var(--pm-purple-soft)",
							color: "var(--pm-purple)",
						},
					].map((t) => (
						<div className="col-md-3 col-6" key={t.label}>
							<div className={styles.miniStat} style={{ background: t.bg }}>
								<div className={styles.miniStatBig} style={{ color: t.color }}>
									{t.value}
								</div>
								<div className={styles.miniStatLabel}>{t.label}</div>
							</div>
						</div>
					))}
				</div>
				<div className={styles.sr}>
					<div>
						<strong>High-value settlement failed</strong>
					</div>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnDanger}`}
						onClick={() => onOpen("retrySettlementModal")}
					>
						Retry
					</button>
				</div>
				<div className={styles.sr}>
					<div>
						<strong>Payout cut-off in 47 minutes</strong>
					</div>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() => onOpen("rtgsUrgentModal")}
					>
						Prioritize
					</button>
				</div>
				<div className={styles.sr}>
					<div>
						<strong>Dispute awaiting evidence</strong>
					</div>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() => onOpen("disputeModal")}
					>
						Respond
					</button>
				</div>
			</ModalShell>

			{/* ============================================================
			   PRIORITY PAYOUT SUBMISSION
			   ============================================================ */}
			<SimpleModal
				show={isOpen("rtgsUrgentModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-triangle"
				title="Priority Payout Submission"
				submitLabel="Submit All Urgent"
				successMsg="14 batches submitted with urgent flag. Additional fee: KES 31,500."
			>
				<div className={`${styles.summaryBoxDanger} mb-3`}>
					<div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
						Payout cut-off in 47 minutes
					</div>
					<div style={{ fontSize: 12, color: "#dc2626" }}>
						14 batches (KES 92M) still pending submission.
					</div>
				</div>
				<SelectField label="Priority Reason" options={PRIORITY_REASONS} />
			</SimpleModal>

			{/* ============================================================
			   FULL SETTLEMENT ACTIVITY LOG
			   ============================================================ */}
			<ModalShell
				show={isOpen("activityLogModal")}
				onClose={onClose}
				iconCls="bi bi-clock-history"
				title="Full Settlement Activity Log"
				size="xl"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={shared.tableWrap}>
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Time</th>
								<th>Ref</th>
								<th>Action</th>
								<th>User</th>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							{[
								[
									"14:32",
									"SET-88422",
									"Settlement completed",
									"System",
									"Success",
								],
								[
									"14:28",
									"SET-88421",
									"Submitted to payout rail",
									"James K.",
									"In Progress",
								],
								[
									"14:15",
									"BAT-21093",
									"Exception detected",
									"System",
									"Flagged",
								],
							].map((row) => (
								<tr key={row[1] + row[0]}>
									{row.map((cell) => (
										<td key={cell}>{cell}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============================================================
			   ALL ATTENTION ITEMS
			   ============================================================ */}
			<ModalShell
				show={isOpen("attentionModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-circle"
				title="All Attention Items"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={styles.sr}>
					<div>
						<strong>High-value settlement failed</strong>
					</div>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnDanger}`}
						onClick={() => onOpen("retrySettlementModal")}
					>
						Retry
					</button>
				</div>
				<div className={styles.sr}>
					<div>
						<strong>Payout cut-off in 47 minutes</strong>
					</div>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() => onOpen("rtgsUrgentModal")}
					>
						Prioritize
					</button>
				</div>
				<div className={styles.sr}>
					<div>
						<strong>Dispute awaiting evidence</strong>
					</div>
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
						onClick={() => onOpen("disputeModal")}
					>
						Respond
					</button>
				</div>
			</ModalShell>

			{/* ============================================================
			   NOTIFICATIONS
			   ============================================================ */}
			<ModalShell
				show={isOpen("notifModal")}
				onClose={onClose}
				iconCls="bi bi-bell"
				title="Notifications (7)"
				footer={
					<button
						type="button"
						className={`${shared.btn} ${shared.btnSecondary}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<div className={`${styles.summaryBoxDanger} mb-2`}>
					<strong>High-value settlement failed</strong>
					<div className={styles.mutedSmall} style={{ marginTop: 2 }}>
						SET-88423 • KES 8.4M
					</div>
				</div>
				<div className={`${styles.summaryBoxWarn} mb-2`}>
					<strong>Payout cut-off approaching</strong>
					<div className={styles.mutedSmall} style={{ marginTop: 2 }}>
						47 minutes remaining
					</div>
				</div>
				<div className={styles.summaryBoxInfo}>
					<strong>Dispute evidence requested</strong>
					<div className={styles.mutedSmall} style={{ marginTop: 2 }}>
						#SET-44892
					</div>
				</div>
			</ModalShell>

			{/* ============================================================
			   LINKED BUSINESS DETAILS (tabs + permissions)
			   ============================================================ */}
			<ModalShell
				show={isOpen("businessDetailModal")}
				onClose={onClose}
				iconCls="bi bi-building"
				title="Linked Business Details"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSecondary}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSm} ${shared.btnSecondary}`}
							onClick={() => onOpen("payoutModal")}
						>
							<i className="bi bi-send" aria-hidden="true" /> New Payout
						</button>
						<button
							type="button"
							className={`${shared.btn} ${shared.btnSm} ${shared.btnPrimary}`}
							onClick={() => onOpen("rebalanceModal")}
						>
							<i className="bi bi-arrow-clockwise" aria-hidden="true" />{" "}
							Rebalance
						</button>
					</>
				}
			>
				<div className={`${shared.pills} mb-3`}>
					{MODAL_BIZ.map((b) => (
						<button
							type="button"
							key={b.id}
							className={`${shared.pill} ${bizSel === b.id ? shared.pillActive : ""}`}
							onClick={() => {
								setBizSel(b.id);
								setBizTab("overview");
								setRequested({});
							}}
						>
							{b.name} ({b.customers})
						</button>
					))}
				</div>
				<div className={`${shared.pills} mb-3`}>
					{(["overview", "perms", "ledger"] as const).map((tab) => (
						<button
							type="button"
							key={tab}
							className={`${shared.pill} ${bizTab === tab ? shared.pillActive : ""}`}
							onClick={() => setBizTab(tab)}
						>
							{tab === "overview"
								? "Overview"
								: tab === "perms"
									? `Permissions (${granted}/8)`
									: "Ledger"}
						</button>
					))}
				</div>
				{bizTab === "overview" && (
					<div>
						<div className={`${styles.summaryBox} mb-3`}>
							{[
								["Business", biz.name],
								["Type", biz.type],
								["Customers", String(biz.customers)],
								["Settlement account", biz.account],
								["Payout schedule", biz.schedule],
								["Fee", biz.fee],
								["Avg transaction", biz.avg],
								["Payment mix", biz.mix],
							].map(([k, v]) => (
								<div className="d-flex justify-content-between mb-1" key={k}>
									<span className={styles.mutedSmall}>{k}</span>
									<strong style={{ fontSize: 12 }}>{v}</strong>
								</div>
							))}
						</div>
						<div className={styles.floatMeter}>
							<span>Float</span>
							<div className={styles.permBar}>
								<div
									className={styles.floatFill}
									style={{
										width: `${Math.min(100, (biz.float / biz.minFloat) * 100)}%`,
									}}
								/>
							</div>
							<span>
								KES {(biz.float / 1e6).toFixed(2)}M / min KES{" "}
								{(biz.minFloat / 1e6).toFixed(1)}M
							</span>
						</div>
					</div>
				)}
				{bizTab === "perms" && (
					<div>
						{biz.perms.map((p) => {
							const st = requested[p.label] ? "requested" : p.status;
							return (
								<div className={styles.permItem} key={p.label}>
									<span
										className={`${styles.permDot} ${st === "granted" ? styles.permOk : styles.permPending}`}
									/>
									<div style={{ flex: 1 }}>
										<div className={styles.fwBold13}>{p.label}</div>
										<div className={styles.mutedSmall}>{p.detail}</div>
									</div>
									{st === "granted" ? (
										<span className={`${shared.badge} ${shared.badgeSuccess}`}>
											Granted
										</span>
									) : st === "requested" ? (
										<span className={`${shared.badge} ${shared.badgeInfo}`}>
											Requested
										</span>
									) : (
										<button
											type="button"
											className={`${shared.btn} ${shared.btnSm} ${shared.btnDanger}`}
											onClick={() =>
												setRequested((prev) => ({
													...prev,
													[p.label]: true,
												}))
											}
										>
											Request
										</button>
									)}
								</div>
							);
						})}
						<div className={`${styles.summaryBoxWarn} mt-3`}>
							<i className="bi bi-info-circle" aria-hidden="true" /> {granted}/8
							granted — the business is notified by email when you request a
							permission.
						</div>
					</div>
				)}
				{bizTab === "ledger" && (
					<div className={shared.tableWrap}>
						<table className={shared.table}>
							<thead>
								<tr>
									<th>Time</th>
									<th>Type</th>
									<th>Customer / Ref</th>
									<th>Amount</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{ledgerRows.map((r) => (
									<tr key={r[0] + r[1]}>
										<td>{r[0]}</td>
										<td>{r[1]}</td>
										<td>{r[2]}</td>
										<td>
											<strong>{r[3]}</strong>
										</td>
										<td>
											<span className={`${shared.badge} ${toneBadge(r[5])}`}>
												{r[4]}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</ModalShell>
		</>
	);
}
