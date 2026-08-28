"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	type TouchEvent as ReactTouchEvent,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import { InitiateTransferModals } from "../components/InitiateTransferModals";
import styles from "../styles/initiateTransfer.module.css";

/* ──────────────────────────────────────────────────────────────────────────
   Mock data (unchanged)
   ────────────────────────────────────────────────────────────────────────── */
const initialMockData = {
	heroStats: [
		{
			id: 1,
			label: "Transfer engine live",
			value: "KES 124.7M",
			description:
				"Processed today across 12 rails • 98.9% success rate • 4.2s avg settlement",
			isAccent: true,
			buttons: [
				{ label: "Rails", action: "railHealth" },
				{ label: "Fees", action: "feeCalc" },
				{ label: "New", action: "newTransfer" },
			],
		},
		{
			id: 2,
			label: "TODAY'S TRANSFERS",
			value: "2,841",
			badge: { text: "2,812 completed", variant: "success" as const },
			description: "29 in progress • 0 failed",
			labelColor: "success" as const,
		},
		{
			id: 3,
			label: "AVG SETTLEMENT",
			value: "4.2s",
			badge: { text: "-0.8s vs yesterday", variant: "info" as const },
			description: "PesaLink: 3.4s • RTGS: 8.7s",
			labelColor: "info" as const,
		},
		{
			id: 4,
			label: "PENDING APPROVAL",
			value: "14",
			badge: { text: "7 high-value", variant: "warning" as const },
			description: "KES 48.3M awaiting maker-checker",
			labelColor: "warning" as const,
			borderLeft: true,
		},
	],
	transferTypes: [
		{ id: "single", label: "Single" },
		{ id: "bulk", label: "Bulk" },
		{ id: "recurring", label: "Recurring" },
	],
	sourceAccounts: [
		{ id: 1, name: "PayMo KES Float (M-Pesa)", balance: "KES 124.7M" },
		{ id: 2, name: "PayMo KES Nostro (KCB)", balance: "KES 89.4M" },
		{ id: 3, name: "PayMo USD Nostro", balance: "USD 2.8M" },
		{ id: 4, name: "Client Segregated", balance: "KES 31.2M" },
	],
	beneficiaryTypes: [
		{ id: "bank", label: "Bank" },
		{ id: "mobile", label: "Mobile Money" },
		{ id: "wallet", label: "Wallet" },
	],
	banks: [
		"KCB Bank Kenya",
		"Equity Bank",
		"Co-operative Bank",
		"Stanbic Bank",
		"NCBA Bank",
		"ABSA Bank Kenya",
	],
	mobileNetworks: ["Safaricom M-Pesa", "Airtel Money", "Telkom T-Kash"],
	currencies: ["KES", "USD", "EUR", "UGX", "TZS"],
	purposeCodes: [
		"Salary / Wages",
		"Supplier Payment",
		"Loan Disbursement",
		"Dividend",
		"Refund",
		"Tax Payment",
		"Other",
	],
	rails: [
		{
			id: "pesalink",
			name: "PesaLink",
			time: "3.4s",
			fee: "KES 50",
			success: "99.4%",
			recommended: true,
		},
		{
			id: "mpesa",
			name: "M-Pesa STK",
			time: "2.1s",
			fee: "KES 35",
			success: "99.7%",
			fastest: true,
		},
		{
			id: "rtgs",
			name: "RTGS",
			time: "8.7s",
			fee: "KES 200",
			success: "99.9%",
			highValue: true,
		},
		{
			id: "swift",
			name: "SWIFT",
			time: "1-3d",
			fee: "KES 2,500",
			success: "97.8%",
			international: true,
		},
	],
};

const fetchInitiateTransferData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 800));
	return initialMockData;
};

/* ──────────────────────────────────────────────────────────────────────────
   Guided transfer workflow
   ────────────────────────────────────────────────────────────────────────── */
interface StepDef {
	id: number;
	title: string;
	shortTitle: string;
	icon: string;
	description: string;
}

const STEPS: StepDef[] = [
	{
		id: 1,
		title: "Transfer type",
		shortTitle: "Type",
		icon: "bi-arrow-left-right",
		description: "Choose a single, bulk or recurring payment.",
	},
	{
		id: 2,
		title: "Sender account",
		shortTitle: "Sender",
		icon: "bi-bank",
		description: "Select the funded account that will be debited.",
	},
	{
		id: 3,
		title: "Receiver",
		shortTitle: "Receiver",
		icon: "bi-person-plus",
		description: "Add or select the person or business receiving funds.",
	},
	{
		id: 4,
		title: "Amount and currency",
		shortTitle: "Amount",
		icon: "bi-cash-coin",
		description: "Set the transfer value and review estimated fees.",
	},
	{
		id: 5,
		title: "Payment rail",
		shortTitle: "Rail",
		icon: "bi-diagram-3",
		description: "Let PayMo optimise the route or choose one manually.",
	},
	{
		id: 6,
		title: "Purpose and compliance",
		shortTitle: "Purpose",
		icon: "bi-file-earmark-check",
		description: "Add the business context and supporting evidence.",
	},
	{
		id: 7,
		title: "Authorization",
		shortTitle: "Authorize",
		icon: "bi-shield-lock",
		description: "Confirm approval routing, execution time and 2FA.",
	},
	{
		id: 8,
		title: "Review and submit",
		shortTitle: "Review",
		icon: "bi-check2-circle",
		description: "Check every detail before the transfer is released.",
	},
];

interface TransactionSummary {
	transferType?: string;
	transferMode?: string;
	sourceAccount?: string;
	sourceBalance?: string;
	receiverType?: string;
	receiverName?: string;
	receiverBank?: string;
	receiverAccount?: string;
	receiverNetwork?: string;
	amount?: string;
	currency?: string;
	fee?: string;
	totalDebit?: string;
	rail?: string;
	railTime?: string;
	railFee?: string;
	purpose?: string;
	reference?: string;
	schedule?: string;
}

const kpiIcons = [
	"bi-wallet2",
	"bi-send-check",
	"bi-stopwatch",
	"bi-person-check",
];
const kpiTones = ["Green", "Blue", "Violet", "Amber"] as const;
const amountFormatter = new Intl.NumberFormat("en-KE", {
	maximumFractionDigits: 2,
});

function parseCompactBalance(balance?: string) {
	const match = balance?.match(/([\d.]+)\s*([KMB])?$/i);
	if (!match) return 0;
	const multiplier =
		match[2]?.toUpperCase() === "B"
			? 1_000_000_000
			: match[2]?.toUpperCase() === "M"
				? 1_000_000
				: match[2]?.toUpperCase() === "K"
					? 1_000
					: 1;
	return Number(match[1]) * multiplier;
}

function parseFee(fee?: string) {
	return Number(fee?.replace(/[^\d.]/g, "") ?? 0);
}

function SectionHeading({
	index,
	id,
	title,
	description,
}: {
	index: string;
	id: string;
	title: string;
	description: string;
}) {
	return (
		<div className={styles.sectionHeading}>
			<span className={styles.sectionIndex} aria-hidden="true">
				{index}
			</span>
			<div>
				<h2 id={id}>{title}</h2>
				<p>{description}</p>
			</div>
		</div>
	);
}

function SummaryRow({
	icon,
	label,
	value,
	detail,
}: {
	icon: string;
	label: string;
	value: string;
	detail?: string;
}) {
	return (
		<div className={styles.summaryRow}>
			<span className={styles.summaryIcon}>
				<i className={`bi ${icon}`} aria-hidden="true" />
			</span>
			<div className={styles.summaryCopy}>
				<span>{label}</span>
				<strong>{value}</strong>
				{detail ? <small>{detail}</small> : null}
			</div>
		</div>
	);
}

export function InitiateTransfer() {
	const [activeType, setActiveType] = useState("single");
	const [settlementMode, setSettlementMode] = useState("standard");
	const [activeSourceId, setActiveSourceId] = useState(1);
	const [activeReceiver, setActiveReceiver] = useState("bank");
	const [transferAmount, setTransferAmount] = useState("250000");
	const [activeCurrency, setActiveCurrency] = useState("KES");
	const [activeRail, setActiveRail] = useState("smart");
	const [selectedRailId, setSelectedRailId] = useState("pesalink");
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [currentStep, setCurrentStep] = useState(1);
	const swipeStart = useRef<{ x: number; y: number } | null>(null);

	const {
		data: remoteData,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["initiateTransferData"],
		queryFn: fetchInitiateTransferData,
		initialData: initialMockData,
	});
	const data = remoteData ?? initialMockData;
	const selectedSource =
		data.sourceAccounts.find((account) => account.id === activeSourceId) ??
		data.sourceAccounts[0];
	const recommendedRail =
		data.rails.find((rail) => rail.recommended) ?? data.rails[0];
	const selectedRail =
		data.rails.find((rail) => rail.id === selectedRailId) ?? recommendedRail;
	const effectiveRail = activeRail === "smart" ? recommendedRail : selectedRail;
	const numericAmount = Number(transferAmount.replace(/,/g, "")) || 0;
	const availableBalance = parseCompactBalance(selectedSource?.balance);
	const sourceCurrency = selectedSource?.balance.split(" ")[0] ?? "KES";
	const dailyLimit = sourceCurrency === "USD" ? 5_000_000 : 500_000_000;
	const limitUsage = Math.min(100, (availableBalance / dailyLimit) * 100);
	const platformFee = 125;
	const railFee = parseFee(effectiveRail?.fee);
	const totalFee = platformFee + railFee;
	const formattedAmount = amountFormatter.format(numericAmount);
	const totalDebit = amountFormatter.format(numericAmount + totalFee);

	const openModal = (modalId: string) => setModalState({ [modalId]: true });
	const closeModal = (modalId: string) =>
		setModalState((current) => ({ ...current, [modalId]: false }));

	const goToStep = useCallback((step: number) => {
		if (step >= 1 && step <= STEPS.length) setCurrentStep(step);
	}, []);
	const nextStep = () => goToStep(currentStep + 1);
	const prevStep = () => goToStep(currentStep - 1);

	const summary = useMemo<TransactionSummary>(() => {
		const next: TransactionSummary = {
			transferType:
				data.transferTypes.find((type) => type.id === activeType)?.label ??
				"Single",
			transferMode:
				activeType === "single"
					? settlementMode === "instant"
						? "Instant · real-time settlement"
						: "Standard · same or next day"
					: activeType === "bulk"
						? "Bulk upload"
						: "Recurring instruction",
		};
		if (currentStep >= 2) {
			next.sourceAccount = selectedSource?.name;
			next.sourceBalance = selectedSource?.balance;
		}
		if (currentStep >= 3) {
			next.receiverType = data.beneficiaryTypes.find(
				(type) => type.id === activeReceiver,
			)?.label;
			if (activeReceiver === "bank") {
				next.receiverName = "James K. Mwangi";
				next.receiverBank = data.banks[0];
				next.receiverAccount = "•••• 7890";
			} else if (activeReceiver === "mobile") {
				next.receiverName = "+254 712 345 678";
				next.receiverNetwork = data.mobileNetworks[0];
			} else {
				next.receiverName = "PayMo Wallet";
			}
		}
		if (currentStep >= 4) {
			next.amount = formattedAmount;
			next.currency = activeCurrency;
			next.fee = `KES ${amountFormatter.format(totalFee)}`;
			next.totalDebit =
				activeCurrency === "KES"
					? `KES ${totalDebit}`
					: `${activeCurrency} ${formattedAmount} + KES ${amountFormatter.format(totalFee)}`;
		}
		if (currentStep >= 5 && effectiveRail) {
			next.rail =
				activeRail === "smart"
					? `Smart routing · ${effectiveRail.name}`
					: effectiveRail.name;
			next.railTime = effectiveRail.time;
			next.railFee = effectiveRail.fee;
		}
		if (currentStep >= 6) {
			next.purpose = data.purposeCodes[0];
			next.reference = "August 2026 operations";
		}
		if (currentStep >= 7) next.schedule = "28 Aug 2026 · 14:00 EAT";
		return next;
	}, [
		activeCurrency,
		activeRail,
		activeReceiver,
		activeType,
		currentStep,
		data,
		effectiveRail,
		formattedAmount,
		selectedSource,
		settlementMode,
		totalDebit,
		totalFee,
	]);

	const progressPercent = Math.round((currentStep / STEPS.length) * 100);
	const activeStep = STEPS[currentStep - 1];

	const handleStepperKeys = (event: ReactKeyboardEvent<HTMLOListElement>) => {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const targetStep =
			event.key === "Home"
				? 1
				: event.key === "End"
					? STEPS.length
					: event.key === "ArrowRight"
						? Math.min(STEPS.length, currentStep + 1)
						: Math.max(1, currentStep - 1);
		goToStep(targetStep);
		window.requestAnimationFrame(() =>
			document.getElementById(`transfer-step-${targetStep}`)?.focus(),
		);
	};

	const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		const startsOnControl = target.closest(
			"button, input, select, textarea, a, label, [contenteditable='true'], [role='button']",
		);
		const touch = event.touches[0];
		swipeStart.current =
			event.touches.length === 1 && !startsOnControl && touch
				? { x: touch.clientX, y: touch.clientY }
				: null;
	};

	const handleTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
		const start = swipeStart.current;
		const touch = event.changedTouches[0];
		swipeStart.current = null;
		if (!start || !touch) return;

		const deltaX = touch.clientX - start.x;
		const deltaY = touch.clientY - start.y;
		if (Math.abs(deltaX) < 60 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25)
			return;
		if (deltaX < 0) nextStep();
		else prevStep();
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className={styles.stepContent} key="transfer-type">
						<fieldset className={styles.fieldset}>
							<legend>How are you sending these funds?</legend>
							<div className={styles.choiceGrid}>
								{data.transferTypes.map((type) => {
									const icon =
										type.id === "single"
											? "bi-person"
											: type.id === "bulk"
												? "bi-people"
												: "bi-arrow-repeat";
									const description =
										type.id === "single"
											? "One receiver"
											: type.id === "bulk"
												? "Many receivers"
												: "Repeat on a schedule";
									return (
										<button
											type="button"
											key={type.id}
											className={`${styles.choiceCard} ${activeType === type.id ? styles.choiceActive : ""}`}
											aria-pressed={activeType === type.id}
											onClick={() => setActiveType(type.id)}
										>
											<i className={`bi ${icon}`} aria-hidden="true" />
											<strong>{type.label}</strong>
											<span>{description}</span>
										</button>
									);
								})}
							</div>
						</fieldset>

						{activeType === "single" ? (
							<fieldset className={styles.fieldset}>
								<legend>Settlement preference</legend>
								<div className={styles.radioGrid}>
									<label
										className={styles.radioCard}
										htmlFor="transfer-standard"
									>
										<input
											id="transfer-standard"
											type="radio"
											name="transfer-mode"
											checked={settlementMode === "standard"}
											onChange={() => setSettlementMode("standard")}
										/>
										<span className={styles.radioIcon}>
											<i className="bi bi-clock" />
										</span>
										<span>
											<strong>Standard</strong>
											<small>Same-day or next-day settlement</small>
										</span>
									</label>
									<label
										className={styles.radioCard}
										htmlFor="transfer-instant"
									>
										<input
											id="transfer-instant"
											type="radio"
											name="transfer-mode"
											checked={settlementMode === "instant"}
											onChange={() => setSettlementMode("instant")}
										/>
										<span className={styles.radioIcon}>
											<i className="bi bi-lightning-charge" />
										</span>
										<span>
											<strong>Instant</strong>
											<small>Real-time processing when available</small>
										</span>
									</label>
								</div>
							</fieldset>
						) : null}

						{activeType === "bulk" ? (
							<div className={styles.inlinePanel}>
								<div>
									<span className={styles.panelIcon}>
										<i className="bi bi-file-earmark-spreadsheet" />
									</span>
									<div>
										<strong>Prepare a payment file</strong>
										<p>
											Upload CSV, Excel or ISO 20022 and validate every row
											before release.
										</p>
									</div>
								</div>
								<button
									type="button"
									className={styles.btn}
									onClick={() => openModal("bulkUploadModal")}
								>
									<i className="bi bi-cloud-arrow-up" /> Upload file
								</button>
							</div>
						) : null}

						{activeType === "recurring" ? (
							<div className={styles.formGrid}>
								<div className={styles.fieldGroup}>
									<label htmlFor="recurring-frequency">Frequency</label>
									<select id="recurring-frequency" className={styles.control}>
										<option>Weekly</option>
										<option>Monthly</option>
										<option>Quarterly</option>
									</select>
								</div>
								<div className={styles.fieldGroup}>
									<label htmlFor="recurring-end">End date</label>
									<input
										id="recurring-end"
										type="date"
										className={styles.control}
										defaultValue="2026-12-31"
									/>
								</div>
							</div>
						) : null}
						<div className={styles.hintBox}>
							<i className="bi bi-lightbulb" />
							<span>
								Select the transfer structure. You can save the completed setup
								as a reusable template.
							</span>
						</div>
					</div>
				);
			case 2:
				return (
					<div className={styles.stepContent} key="sender">
						<div className={styles.contentToolbar}>
							<div>
								<span className={styles.kicker}>Funding source</span>
								<h4>Select sender account</h4>
							</div>
							<button
								type="button"
								className={styles.btn}
								onClick={() => openModal("addAccountModal")}
							>
								<i className="bi bi-plus-lg" /> Add account
							</button>
						</div>
						<div className={styles.fieldGroup}>
							<label htmlFor="source-account">Source account</label>
							<select
								id="source-account"
								className={styles.control}
								value={activeSourceId}
								onChange={(event) => {
									const accountId = Number(event.target.value);
									const account = data.sourceAccounts.find(
										(item) => item.id === accountId,
									);
									setActiveSourceId(accountId);
									const accountCurrency = account?.balance.split(" ")[0];
									if (
										accountCurrency &&
										data.currencies.includes(accountCurrency)
									) {
										setActiveCurrency(accountCurrency);
									}
								}}
							>
								{data.sourceAccounts.map((account) => (
									<option key={account.id} value={account.id}>
										{account.name} · {account.balance}
									</option>
								))}
							</select>
						</div>
						<div className={styles.accountPanel}>
							<div className={styles.accountLead}>
								<span className={styles.accountMark}>
									<i
										className={`bi ${selectedSource?.name.includes("M-Pesa") ? "bi-phone" : "bi-bank"}`}
									/>
								</span>
								<div>
									<small>Available balance</small>
									<strong>{selectedSource?.balance}</strong>
									<span>{selectedSource?.name}</span>
								</div>
							</div>
							<div className={styles.accountMetrics}>
								<div>
									<span>Daily limit</span>
									<strong>
										{sourceCurrency} {sourceCurrency === "USD" ? "5M" : "500M"}
									</strong>
									<small>{limitUsage.toFixed(1)}% used</small>
								</div>
								<div>
									<span>Currency</span>
									<strong>{sourceCurrency}</strong>
									<small>Account currency</small>
								</div>
								<div>
									<span>Verification</span>
									<strong className={styles.goodText}>Verified</strong>
									<small>Ready to send</small>
								</div>
							</div>
						</div>
						<div className={styles.hintBox}>
							<i className="bi bi-shield-check" />
							<span>
								PayMo checks balance, account state and daily limits before
								continuing.
							</span>
						</div>
					</div>
				);
			case 3:
				return (
					<div className={styles.stepContent} key="receiver">
						<div className={styles.contentToolbar}>
							<div>
								<span className={styles.kicker}>Destination</span>
								<h4>Who should receive the funds?</h4>
							</div>
							<button
								type="button"
								className={styles.btn}
								onClick={() => openModal("beneficiaryModal")}
							>
								<i className="bi bi-person-lines-fill" /> Address book
							</button>
						</div>
						<fieldset className={styles.fieldset}>
							<legend>Beneficiary type</legend>
							<div className={styles.segmented}>
								{data.beneficiaryTypes.map((type) => (
									<button
										type="button"
										key={type.id}
										className={
											activeReceiver === type.id ? styles.segmentActive : ""
										}
										aria-pressed={activeReceiver === type.id}
										onClick={() => setActiveReceiver(type.id)}
									>
										<i
											className={`bi ${type.id === "bank" ? "bi-bank" : type.id === "mobile" ? "bi-phone" : "bi-wallet2"}`}
										/>{" "}
										{type.label}
									</button>
								))}
							</div>
						</fieldset>
						{activeReceiver === "bank" ? (
							<div className={styles.formGrid}>
								<div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
									<label htmlFor="receiver-bank">Bank</label>
									<select id="receiver-bank" className={styles.control}>
										{data.banks.map((bank) => (
											<option key={bank}>{bank}</option>
										))}
									</select>
								</div>
								<div className={styles.fieldGroup}>
									<label htmlFor="receiver-account">Account number</label>
									<input
										id="receiver-account"
										className={styles.control}
										inputMode="numeric"
										defaultValue="1234567890"
									/>
								</div>
								<div className={styles.fieldGroup}>
									<span className={styles.labelText}>Account verification</span>
									<button
										type="button"
										className={`${styles.btn} ${styles.verifyButton}`}
										onClick={() => openModal("verifyAccountModal")}
									>
										<i className="bi bi-search" /> Check account name
									</button>
								</div>
							</div>
						) : null}
						{activeReceiver === "mobile" ? (
							<div className={styles.formGrid}>
								<div className={styles.fieldGroup}>
									<label htmlFor="receiver-network">Mobile network</label>
									<select id="receiver-network" className={styles.control}>
										{data.mobileNetworks.map((network) => (
											<option key={network}>{network}</option>
										))}
									</select>
								</div>
								<div className={styles.fieldGroup}>
									<label htmlFor="receiver-phone">Phone number</label>
									<input
										id="receiver-phone"
										className={styles.control}
										type="tel"
										defaultValue="0712345678"
										placeholder="2547XXXXXXXX"
									/>
								</div>
							</div>
						) : null}
						{activeReceiver === "wallet" ? (
							<div className={styles.fieldGroup}>
								<label htmlFor="receiver-wallet">PayMo wallet or email</label>
								<input
									id="receiver-wallet"
									className={styles.control}
									placeholder="wallet ID or email"
								/>
							</div>
						) : null}
						<label className={styles.checkboxRow} htmlFor="save-beneficiary">
							<input id="save-beneficiary" type="checkbox" defaultChecked />
							<span>
								<strong>Save to address book</strong>
								<small>
									Make this recipient available for future transfers.
								</small>
							</span>
						</label>
						<div className={styles.hintBox}>
							<i className="bi bi-person-check" />
							<span>
								Confirm destination details carefully. Completed transfers may
								not be reversible.
							</span>
						</div>
					</div>
				);
			case 4:
				return (
					<div className={styles.stepContent} key="amount">
						<div className={styles.contentToolbar}>
							<div>
								<span className={styles.kicker}>Transfer value</span>
								<h4>Set amount and currency</h4>
							</div>
							<button
								type="button"
								className={styles.btn}
								onClick={() => openModal("feeCalcModal")}
							>
								<i className="bi bi-calculator" /> Fee calculator
							</button>
						</div>
						<div className={styles.formGrid}>
							<div className={styles.fieldGroup}>
								<label htmlFor="transfer-amount">Amount</label>
								<div className={styles.amountControl}>
									<span>{activeCurrency}</span>
									<input
										id="transfer-amount"
										inputMode="decimal"
										value={transferAmount}
										onChange={(event) => {
											const nextAmount = event.target.value.replace(/,/g, "");
											if (/^\d*(\.\d{0,2})?$/.test(nextAmount)) {
												setTransferAmount(nextAmount);
											}
										}}
										aria-describedby="amount-help"
									/>
								</div>
								<small id="amount-help">
									Available: {selectedSource?.balance}
								</small>
							</div>
							<div className={styles.fieldGroup}>
								<label htmlFor="transfer-currency">Currency</label>
								<select
									id="transfer-currency"
									className={styles.control}
									value={activeCurrency}
									onChange={(event) => setActiveCurrency(event.target.value)}
								>
									{data.currencies.map((currency) => (
										<option key={currency}>{currency}</option>
									))}
								</select>
							</div>
						</div>
						<fieldset className={styles.amountPresets}>
							<legend className={styles.srOnly}>Amount shortcuts</legend>
							<button
								type="button"
								onClick={() =>
									setTransferAmount(String(Math.floor(availableBalance * 0.1)))
								}
							>
								10% of balance
							</button>
							<button
								type="button"
								onClick={() =>
									setTransferAmount(String(Math.floor(availableBalance * 0.25)))
								}
							>
								25% of balance
							</button>
							<button
								type="button"
								onClick={() => setTransferAmount(String(availableBalance))}
							>
								Use available balance
							</button>
						</fieldset>
						<div className={styles.feePanel}>
							<div>
								<span>Transfer amount</span>
								<strong>
									{activeCurrency} {formattedAmount}
								</strong>
							</div>
							<div>
								<span>Platform fee</span>
								<strong>KES {amountFormatter.format(platformFee)}</strong>
							</div>
							<div>
								<span>Rail fee</span>
								<strong>{effectiveRail?.fee ?? "Calculated next"}</strong>
							</div>
							<div>
								<span>FX spread</span>
								<strong>
									{activeCurrency === "KES" ? "KES 0" : "At confirmation"}
								</strong>
							</div>
							<div className={styles.totalRow}>
								<span>Estimated total debit</span>
								<strong>
									{activeCurrency === "KES"
										? `KES ${totalDebit}`
										: `${activeCurrency} ${formattedAmount} + KES ${amountFormatter.format(totalFee)}`}
								</strong>
							</div>
						</div>
						<div className={styles.hintBox}>
							<i className="bi bi-info-circle" />
							<span>
								Fees are estimates until the payment rail is confirmed in the
								next step.
							</span>
						</div>
					</div>
				);
			case 5:
				return (
					<div className={styles.stepContent} key="rail">
						<div className={styles.contentToolbar}>
							<div>
								<span className={styles.kicker}>Routing</span>
								<h4>Select a payment rail</h4>
							</div>
							<button
								type="button"
								className={styles.btn}
								onClick={() => openModal("railCompareModal")}
							>
								<i className="bi bi-bar-chart" /> Compare rails
							</button>
						</div>
						<fieldset className={styles.segmented}>
							<legend className={styles.srOnly}>Payment routing mode</legend>
							<button
								type="button"
								className={activeRail === "smart" ? styles.segmentActive : ""}
								aria-pressed={activeRail === "smart"}
								onClick={() => setActiveRail("smart")}
							>
								<i className="bi bi-stars" /> Smart route
							</button>
							<button
								type="button"
								className={activeRail === "manual" ? styles.segmentActive : ""}
								aria-pressed={activeRail === "manual"}
								onClick={() => setActiveRail("manual")}
							>
								<i className="bi bi-sliders" /> Manual
							</button>
						</fieldset>
						{activeRail === "smart" ? (
							<div className={styles.recommendation}>
								<div className={styles.recommendationHead}>
									<div>
										<span className={styles.cardKicker}>
											PayMo recommendation
										</span>
										<h4>{recommendedRail?.name ?? "Best available rail"}</h4>
										<p>
											Best balance of speed, success rate and cost for this
											transfer.
										</p>
									</div>
									<span className={`${styles.badge} ${styles.badgeSuccess}`}>
										<i className="bi bi-star-fill" /> Best route
									</span>
								</div>
								<div className={styles.railMetrics}>
									<div>
										<span>Settlement</span>
										<strong>{recommendedRail?.time}</strong>
									</div>
									<div>
										<span>Fee</span>
										<strong>{recommendedRail?.fee}</strong>
									</div>
									<div>
										<span>Success</span>
										<strong>{recommendedRail?.success}</strong>
									</div>
								</div>
							</div>
						) : null}
						<div className={styles.railGrid}>
							{data.rails.map((rail) => {
								const isSelected =
									activeRail === "smart"
										? rail.id === recommendedRail?.id
										: rail.id === selectedRail?.id;
								return (
									<button
										type="button"
										key={rail.id}
										className={`${styles.railCard} ${isSelected ? styles.railSelected : ""}`}
										aria-pressed={isSelected}
										onClick={() => {
											setSelectedRailId(rail.id);
											setActiveRail("manual");
										}}
									>
										<span>
											<i
												className={`bi ${rail.id === "pesalink" ? "bi-lightning-charge" : rail.id === "mpesa" ? "bi-phone" : rail.id === "rtgs" ? "bi-bank" : "bi-globe2"}`}
											/>
										</span>
										<strong>{rail.name}</strong>
										<small>
											{rail.time} · {rail.fee}
										</small>
										<em>{rail.success} success</em>
									</button>
								);
							})}
						</div>
						<div className={styles.hintBox}>
							<i className="bi bi-diagram-3" />
							<span>
								Smart routing monitors live health and can fail over before
								funds leave the source account.
							</span>
						</div>
					</div>
				);
			case 6:
				return (
					<div className={styles.stepContent} key="purpose">
						<div className={styles.formGrid}>
							<div className={styles.fieldGroup}>
								<label htmlFor="purpose-code">Purpose code</label>
								<select id="purpose-code" className={styles.control}>
									{data.purposeCodes.map((code) => (
										<option key={code}>{code}</option>
									))}
								</select>
							</div>
							<div className={styles.fieldGroup}>
								<label htmlFor="payment-reference">
									Reference or narration
								</label>
								<input
									id="payment-reference"
									className={styles.control}
									defaultValue="August 2026 operations"
								/>
							</div>
						</div>
						<div className={styles.inlinePanel}>
							<div>
								<span className={styles.panelIcon}>
									<i className="bi bi-paperclip" />
								</span>
								<div>
									<strong>Supporting documents</strong>
									<p>
										Attach an invoice, payroll file or approval note when
										required.
									</p>
								</div>
							</div>
							<button
								type="button"
								className={styles.btn}
								onClick={() => openModal("uploadDocModal")}
							>
								<i className="bi bi-cloud-arrow-up" /> Upload
							</button>
						</div>
						<label className={styles.checkboxRow} htmlFor="urgent-transfer">
							<input id="urgent-transfer" type="checkbox" />
							<span>
								<strong>Urgent or critical priority</strong>
								<small>
									Route this transfer for immediate operational attention.
								</small>
							</span>
						</label>
						<div className={`${styles.hintBox} ${styles.successHint}`}>
							<i className="bi bi-shield-check" />
							<span>
								AML and sanctions pre-checks passed for the selected beneficiary
								and corridor.
							</span>
						</div>
					</div>
				);
			case 7:
				return (
					<div className={styles.stepContent} key="authorization">
						<div className={styles.approvalFlow}>
							<div>
								<span className={styles.approvalAvatar}>JK</span>
								<div>
									<small>Maker</small>
									<strong>James K. · You</strong>
									<span>Creates and submits</span>
								</div>
								<i className="bi bi-check-circle-fill" />
							</div>
							<div>
								<span className={styles.approvalAvatar}>GW</span>
								<div>
									<small>Checker</small>
									<strong>Grace W. · Finance</strong>
									<span>Validates transfer details</span>
								</div>
								<i className="bi bi-clock" />
							</div>
							<div>
								<span className={styles.approvalAvatar}>PO</span>
								<div>
									<small>Approver</small>
									<strong>Peter O. · Treasury</strong>
									<span>Releases high-value funds</span>
								</div>
								<i className="bi bi-clock" />
							</div>
						</div>
						<div className={styles.fieldGroup}>
							<label htmlFor="execution-time">Schedule execution</label>
							<input
								id="execution-time"
								type="datetime-local"
								className={styles.control}
								defaultValue="2026-08-28T14:00"
							/>
						</div>
						<label className={styles.checkboxRow} htmlFor="require-2fa">
							<input id="require-2fa" type="checkbox" defaultChecked />
							<span>
								<strong>Require 2FA on submit</strong>
								<small>
									Challenge the maker before this instruction enters approval.
								</small>
							</span>
						</label>
						<div className={styles.hintBox}>
							<i className="bi bi-lock" />
							<span>
								This amount follows the three-level maker-checker approval
								policy.
							</span>
						</div>
					</div>
				);
			default:
				return (
					<div className={styles.stepContent} key="review">
						<div className={styles.reviewGrid}>
							<div className={styles.reviewCard}>
								<span className={styles.cardKicker}>Transfer instruction</span>
								<div>
									<span>From</span>
									<strong>{selectedSource?.name}</strong>
								</div>
								<div>
									<span>To</span>
									<strong>James K. Mwangi · KCB</strong>
								</div>
								<div>
									<span>Amount</span>
									<strong>
										{activeCurrency} {formattedAmount}
									</strong>
								</div>
								<div>
									<span>Estimated total debit</span>
									<strong>
										{activeCurrency === "KES"
											? `KES ${totalDebit}`
											: `${activeCurrency} ${formattedAmount} + KES ${amountFormatter.format(totalFee)}`}
									</strong>
								</div>
							</div>
							<div className={`${styles.reviewCard} ${styles.reviewSuccess}`}>
								<span className={styles.cardKicker}>Execution assurance</span>
								<div>
									<span>Rail</span>
									<strong>{effectiveRail?.name}</strong>
								</div>
								<div>
									<span>ETA</span>
									<strong>{effectiveRail?.time}</strong>
								</div>
								<div>
									<span>Reference</span>
									<strong>PAY-20260828-8841</strong>
								</div>
								<div>
									<span>Risk score</span>
									<strong className={styles.goodText}>Low · 12</strong>
								</div>
							</div>
						</div>
						<div className={styles.assuranceStrip}>
							<div>
								<i className="bi bi-shield-check" />
								<span>
									<strong>Compliance passed</strong>
									<small>AML, sanctions and beneficiary checks</small>
								</span>
							</div>
							<div>
								<i className="bi bi-person-check" />
								<span>
									<strong>3 approvals</strong>
									<small>Maker, checker and treasury</small>
								</span>
							</div>
							<div>
								<i className="bi bi-lightning-charge" />
								<span>
									<strong>Rail healthy</strong>
									<small>{effectiveRail?.success} recent success</small>
								</span>
							</div>
						</div>
						<label className={styles.checkboxRow} htmlFor="accept-terms">
							<input id="accept-terms" type="checkbox" defaultChecked />
							<span>
								<strong>I confirm these transfer details</strong>
								<small>
									I accept the{" "}
									<button
										type="button"
										className={styles.inlineLink}
										onClick={() => openModal("termsModal")}
									>
										transfer terms and conditions
									</button>
									.
								</small>
							</span>
						</label>
						<div className={styles.submitRow}>
							<button
								type="button"
								className={styles.btn}
								onClick={() => openModal("draftSavedModal")}
							>
								<i className="bi bi-floppy" /> Save draft
							</button>
							<button
								type="button"
								className={`${styles.btn} ${styles.btnPrimary}`}
								onClick={() => openModal("submitSuccessModal")}
							>
								<i className="bi bi-check2" /> Submit for approval
							</button>
						</div>
					</div>
				);
		}
	};

	return (
		<div className={styles.initiatePage}>
			<main className={styles.main}>
				<div className={styles.content}>
					<section
						className={styles.heroBanner}
						aria-labelledby="initiate-title"
					>
						<div className={styles.heroOrbOne} />
						<div className={styles.heroOrbTwo} />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-send" /> Guided transfer
									</span>
									<span className={styles.livePill}>
										<span className={styles.liveDot} />{" "}
										{isFetching ? "Checking rails" : "Engine live"}
									</span>
								</div>
								<h1 id="initiate-title">
									Send with confidence. Every detail checked before money moves.
								</h1>
								<p>
									Build a compliant transfer in eight clear steps. PayMo checks
									funding, recipient details, fees, rail health and approval
									policy as you go.
								</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimary}
										onClick={() => openModal("newTransferModal")}
									>
										<i className="bi bi-lightning-charge" /> Quick transfer
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => openModal("templateModal")}
									>
										<i className="bi bi-file-earmark-text" /> Templates
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => openModal("bulkUploadModal")}
									>
										<i className="bi bi-cloud-arrow-up" /> Bulk upload
									</button>
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="Transfer engine snapshot"
							>
								<span>Processed today</span>
								<strong>{data.heroStats[0].value}</strong>
								<p>Across 12 active rails · 98.9% successful</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>2,841</strong>
										<span>Transfers</span>
									</div>
									<div>
										<strong>4.2s</strong>
										<span>Avg settlement</span>
									</div>
									<div>
										<strong>14</strong>
										<span>Awaiting approval</span>
									</div>
								</div>
							</aside>
						</div>
					</section>

					{error ? (
						<output className={styles.statusNotice}>
							<i className="bi bi-cloud-slash" />
							<span>
								<strong>Live transfer data is temporarily unavailable</strong>
								<small>Using the latest local operating snapshot.</small>
							</span>
						</output>
					) : null}

					<section
						className={styles.dashboardSection}
						aria-labelledby="readiness-heading"
					>
						<SectionHeading
							index="01"
							id="readiness-heading"
							title="Transfer readiness"
							description="Live capacity, settlement performance and approval workload before you begin."
						/>
						<div className={styles.kpiGrid}>
							{data.heroStats.map((stat, index) => (
								<article
									className={`${styles.card} ${styles.kpiCard}`}
									key={stat.id}
								>
									<span
										className={`${styles.kpiIcon} ${styles[`icon${kpiTones[index]}`]}`}
									>
										<i className={`bi ${kpiIcons[index]}`} />
									</span>
									<div className={styles.kpiMeta}>
										<span>{stat.label}</span>
										<small>
											{stat.badge?.text ?? "Live operating balance"}
										</small>
									</div>
									<strong className={styles.kpiValue}>{stat.value}</strong>
									<div className={styles.kpiFoot}>
										<span
											className={`${styles.badge} ${index === 3 ? styles.badgeWarn : index === 2 ? styles.badgeInfo : styles.badgeSuccess}`}
										>
											{index === 3 ? "Action needed" : "Within target"}
										</span>
										<span>{stat.description}</span>
									</div>
								</article>
							))}
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="builder-heading"
					>
						<SectionHeading
							index="02"
							id="builder-heading"
							title="Build transfer instruction"
							description="Complete the guided workflow in sequence or revisit any completed section before submission."
						/>
						<div className={styles.builderCard}>
							<div className={styles.builderProgress}>
								<div className={styles.progressHeading}>
									<div>
										<span>Transfer progress</span>
										<strong>{progressPercent}% complete</strong>
									</div>
									<span>
										Step {currentStep} of {STEPS.length}
									</span>
								</div>
								<div
									className={styles.progressTrack}
									role="progressbar"
									aria-label="Transfer setup progress"
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={progressPercent}
								>
									<span style={{ width: `${progressPercent}%` }} />
								</div>
								<div className={styles.stepTrack}>
									<ol
										onKeyDown={handleStepperKeys}
										aria-label="Transfer setup steps"
									>
										{STEPS.map((step) => (
											<li
												key={step.id}
												className={`${styles.stepItem} ${step.id < currentStep ? styles.stepDone : ""} ${step.id === currentStep ? styles.stepCurrent : ""}`}
											>
												<button
													id={`transfer-step-${step.id}`}
													type="button"
													tabIndex={step.id === currentStep ? 0 : -1}
													aria-current={
														step.id === currentStep ? "step" : undefined
													}
													onClick={() => goToStep(step.id)}
												>
													<span>
														{step.id < currentStep ? (
															<i className="bi bi-check-lg" />
														) : (
															step.id
														)}
													</span>
													<small>{step.shortTitle}</small>
												</button>
											</li>
										))}
									</ol>
								</div>
							</div>

							<div className={styles.builderGrid}>
								<section
									className={styles.formPanel}
									aria-label="Active transfer step"
									onTouchStart={handleTouchStart}
									onTouchEnd={handleTouchEnd}
									onTouchCancel={() => {
										swipeStart.current = null;
									}}
								>
									<header className={styles.formHeader}>
										<span className={styles.stepHeroIcon}>
											<i className={`bi ${activeStep.icon}`} />
										</span>
										<div>
											<span>
												Step {currentStep} of {STEPS.length}
											</span>
											<h3>{activeStep.title}</h3>
											<p>{activeStep.description}</p>
										</div>
									</header>
									<div className={styles.formBody}>{renderStepContent()}</div>
									<div className={styles.formFooter}>
										<button
											type="button"
											className={styles.btn}
											onClick={prevStep}
											disabled={currentStep === 1}
										>
											<i className="bi bi-arrow-left" /> Back
										</button>
										<span>
											{currentStep === STEPS.length
												? "Ready for final confirmation"
												: `Next: ${STEPS[currentStep]?.title}`}
										</span>
										{currentStep < STEPS.length ? (
											<button
												type="button"
												className={`${styles.btn} ${styles.btnPrimary}`}
												onClick={nextStep}
											>
												Continue <i className="bi bi-arrow-right" />
											</button>
										) : (
											<button
												type="button"
												className={`${styles.btn} ${styles.btnPrimary}`}
												onClick={() => openModal("submitSuccessModal")}
											>
												Submit <i className="bi bi-check2" />
											</button>
										)}
									</div>
								</section>

								<aside
									className={styles.summaryPanel}
									aria-label="Live transfer summary"
									aria-live="polite"
								>
									<div className={styles.summaryHeader}>
										<div>
											<span className={styles.cardKicker}>Live review</span>
											<h3>Transfer summary</h3>
										</div>
										<span className={`${styles.badge} ${styles.badgeNeutral}`}>
											Draft
										</span>
									</div>
									<div className={styles.summaryBody}>
										{summary.transferType ? (
											<SummaryRow
												icon="bi-arrow-left-right"
												label="Transfer type"
												value={summary.transferType}
												detail={summary.transferMode}
											/>
										) : null}
										{summary.sourceAccount ? (
											<SummaryRow
												icon="bi-bank"
												label="Sender"
												value={summary.sourceAccount}
												detail={summary.sourceBalance}
											/>
										) : null}
										{summary.receiverType ? (
											<SummaryRow
												icon="bi-person"
												label="Receiver"
												value={summary.receiverName ?? summary.receiverType}
												detail={[
													summary.receiverBank ?? summary.receiverNetwork,
													summary.receiverAccount,
												]
													.filter(Boolean)
													.join(" · ")}
											/>
										) : null}
										{summary.amount ? (
											<SummaryRow
												icon="bi-cash-coin"
												label="Amount"
												value={`${summary.currency} ${summary.amount}`}
												detail={`${summary.fee} total fees`}
											/>
										) : null}
										{summary.rail ? (
											<SummaryRow
												icon="bi-diagram-3"
												label="Payment rail"
												value={summary.rail}
												detail={`${summary.railTime} · ${summary.railFee}`}
											/>
										) : null}
										{summary.purpose ? (
											<SummaryRow
												icon="bi-file-earmark-check"
												label="Purpose"
												value={summary.purpose}
												detail={summary.reference}
											/>
										) : null}
										{summary.schedule ? (
											<SummaryRow
												icon="bi-calendar3"
												label="Execution"
												value={summary.schedule}
											/>
										) : null}
									</div>
									<div className={styles.summaryTotal}>
										<span>Estimated total debit</span>
										<strong>
											{summary.totalDebit ?? "Calculated at amount"}
										</strong>
										<small>Final amount is confirmed before release.</small>
									</div>
									<div className={styles.summarySecurity}>
										<i className="bi bi-shield-check" />
										<span>
											<strong>Protected transfer</strong>
											<small>Encrypted · monitored · approval controlled</small>
										</span>
									</div>
								</aside>
							</div>
						</div>
					</section>

					<section
						className={styles.dashboardSection}
						aria-labelledby="controls-heading"
					>
						<SectionHeading
							index="03"
							id="controls-heading"
							title="Built-in control checks"
							description="Operational safeguards remain visible before the instruction enters approval."
						/>
						<div className={styles.controlGrid}>
							<article className={styles.controlCard}>
								<span className={`${styles.controlIcon} ${styles.iconGreen}`}>
									<i className="bi bi-activity" />
								</span>
								<div>
									<span className={styles.cardKicker}>Rail assurance</span>
									<h3>12 rails monitored live</h3>
									<p>
										Availability, settlement speed and success rate inform smart
										routing.
									</p>
								</div>
								<button
									type="button"
									className={styles.textButton}
									onClick={() => openModal("railHealthModal")}
								>
									View rail health <i className="bi bi-arrow-right" />
								</button>
							</article>
							<article className={styles.controlCard}>
								<span className={`${styles.controlIcon} ${styles.iconBlue}`}>
									<i className="bi bi-person-check" />
								</span>
								<div>
									<span className={styles.cardKicker}>Recipient assurance</span>
									<h3>Verified destinations first</h3>
									<p>
										Account-name checks and saved beneficiaries reduce avoidable
										errors.
									</p>
								</div>
								<button
									type="button"
									className={styles.textButton}
									onClick={() => openModal("addRecipientModal")}
								>
									Add recipient <i className="bi bi-arrow-right" />
								</button>
							</article>
							<article className={styles.controlCard}>
								<span className={`${styles.controlIcon} ${styles.iconViolet}`}>
									<i className="bi bi-shield-lock" />
								</span>
								<div>
									<span className={styles.cardKicker}>Approval policy</span>
									<h3>Maker-checker enforced</h3>
									<p>
										High-value instructions route through finance and treasury
										approval.
									</p>
								</div>
								<button
									type="button"
									className={styles.textButton}
									onClick={() => goToStep(7)}
								>
									Review authorization <i className="bi bi-arrow-right" />
								</button>
							</article>
						</div>
					</section>
				</div>

				<nav className={styles.floatingBar} aria-label="Transfer shortcuts">
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openModal("newTransferModal")}
					>
						<i className="bi bi-lightning-charge" /> Quick transfer
					</button>
					<button type="button" onClick={() => openModal("templateModal")}>
						<i className="bi bi-file-earmark-text" /> Templates
					</button>
					<button type="button" onClick={() => openModal("bulkUploadModal")}>
						<i className="bi bi-cloud-arrow-up" /> Bulk
					</button>
					<button type="button" onClick={() => openModal("addRecipientModal")}>
						<i className="bi bi-person-plus" /> Recipient
					</button>
				</nav>
				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-check" /> Protected by PayMo approval and
						compliance controls
					</span>
					<nav aria-label="Footer links">
						<a href="/pm/app/support">Support</a>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v2.4.0</span>
					</nav>
				</footer>
			</main>

			<InitiateTransferModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={data}
				submission={{
					amount: `${activeCurrency} ${formattedAmount}`,
					rail: effectiveRail?.name ?? "Best available rail",
					source: selectedSource?.name ?? "Selected source account",
				}}
			/>
		</div>
	);
}
