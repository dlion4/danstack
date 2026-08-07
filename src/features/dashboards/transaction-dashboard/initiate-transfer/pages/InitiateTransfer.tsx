"use client";

import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { InitiateTransferModals } from "../components/InitiateTransferModals";
import styles from "../styles/initiateTransfer.module.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
   STEP DEFINITIONS
   ────────────────────────────────────────────────────────────────────────── */
interface StepDef {
	id: number;
	title: string;
	icon: string;
	summaryIcon: string;
}

const STEPS: StepDef[] = [
	{ id: 1, title: "Transfer Type", icon: "fa-solid fa-arrows-split-up-and-left", summaryIcon: "fa-solid fa-type" },
	{ id: 2, title: "Sender", icon: "fa-solid fa-paper-plane", summaryIcon: "fa-solid fa-building-columns" },
	{ id: 3, title: "Receiver", icon: "fa-solid fa-user-plus", summaryIcon: "fa-solid fa-user" },
	{ id: 4, title: "Amount", icon: "fa-solid fa-coins", summaryIcon: "fa-solid fa-coins" },
	{ id: 5, title: "Payment Rail", icon: "fa-solid fa-route", summaryIcon: "fa-solid fa-route" },
	{ id: 6, title: "Purpose", icon: "fa-solid fa-file-shield", summaryIcon: "fa-solid fa-file-shield" },
	{ id: 7, title: "Authorization", icon: "fa-solid fa-lock", summaryIcon: "fa-solid fa-shield-halved" },
	{ id: 8, title: "Review & Submit", icon: "fa-solid fa-circle-check", summaryIcon: "fa-solid fa-circle-check" },
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
	receiverPhone?: string;
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

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
export const InitiateTransfer: React.FC = () => {
	const [activeType, setActiveType] = useState("single");
	const [activeReceiver, setActiveReceiver] = useState("bank");
	const [activeRail, setActiveRail] = useState("smart");
	const [modalState, setModalState] = useState<{ [key: string]: boolean }>({});
	const [currentStep, setCurrentStep] = useState(1);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [dragOffset, setDragOffset] = useState(0);
	const [summary, setSummary] = useState<TransactionSummary>({});
	const carouselRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: ["initiateTransferData"],
		queryFn: fetchInitiateTransferData,
		initialData: initialMockData,
	});

	const openModal = (modalId: string) => setModalState((p) => ({ ...p, [modalId]: true }));
	const closeModal = (modalId: string) => setModalState((p) => ({ ...p, [modalId]: false }));

	/* ── Step Navigation ── */
	const goToStep = useCallback(
		(step: number) => {
			if (step < 1 || step > STEPS.length || step === currentStep || isTransitioning) return;
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStep(step);
				setIsTransitioning(false);
			}, 200);
		},
		[currentStep, isTransitioning]
	);

	const nextStep = () => goToStep(currentStep + 1);
	const prevStep = () => goToStep(currentStep - 1);

	/* ── Keyboard Navigation ── */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") nextStep();
			if (e.key === "ArrowLeft") prevStep();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	});

	/* ── Touch / Swipe ─ */
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.touches[0].clientX);
	};
	const handleTouchMove = (e: React.TouchEvent) => {
		if (touchStart === null) return;
		const diff = touchStart - e.touches[0].clientX;
		setDragOffset(diff);
	};
	const handleTouchEnd = () => {
		if (dragOffset > 60) nextStep();
		else if (dragOffset < -60) prevStep();
		setTouchStart(null);
		setDragOffset(0);
	};

	/* ── Auto-update summary from form values ── */
	useEffect(() => {
		const newSummary: TransactionSummary = { ...summary };
		if (currentStep >= 1) {
			const t = data.transferTypes.find((x) => x.id === activeType);
			newSummary.transferType = t?.label || "Single";
			newSummary.transferMode = activeType === "single" ? "Standard (T+0/T+1)" : activeType === "bulk" ? "Bulk Upload" : "Recurring";
		}
		if (currentStep >= 2) {
			newSummary.sourceAccount = "PayMo KES Float (M-Pesa)";
			newSummary.sourceBalance = "KES 124,700,000";
		}
		if (currentStep >= 3) {
			newSummary.receiverType = data.beneficiaryTypes.find((x) => x.id === activeReceiver)?.label || "Bank";
			if (activeReceiver === "bank") {
				newSummary.receiverName = "James K. Mwangi";
				newSummary.receiverBank = "KCB Bank Kenya";
				newSummary.receiverAccount = "1234567890";
			} else if (activeReceiver === "mobile") {
				newSummary.receiverName = "0712345678";
				newSummary.receiverNetwork = "Safaricom M-Pesa";
			} else {
				newSummary.receiverName = "PayMo Wallet";
			}
		}
		if (currentStep >= 4) {
			newSummary.amount = "250,000";
			newSummary.currency = "KES";
			newSummary.fee = "KES 175";
			newSummary.totalDebit = "KES 250,175";
		}
		if (currentStep >= 5) {
			newSummary.rail = "PesaLink";
			newSummary.railTime = "3.4s";
			newSummary.railFee = "KES 50";
		}
		if (currentStep >= 6) {
			newSummary.purpose = "Salary / Wages";
			newSummary.reference = "June 2025 Payroll";
		}
		if (currentStep >= 7) {
			newSummary.schedule = "2025-06-27 14:00";
		}
		setSummary(newSummary);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep, activeType, activeReceiver]);

	/* ── Render helpers ── */
	if (isLoading) {
		return (
			<div className={styles.pageRoot}>
				<div className={styles.loadingOverlay}>
					<div className={styles.spinner}></div>
					<p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "var(--pri)" }}>
						Loading transfer data...
					</p>
				</div>
			</div>
		);
	}
	if (error) {
		return (
			<div className={styles.pageRoot}>
				<div className={styles.alert + " " + styles.alertDanger}>
					Failed to load transfer data. Please try again.
				</div>
			</div>
		);
	}

	const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

	/* ───────────────────────────────────────────────────────────────────
	   RENDER
	   ─────────────────────────────────────────────────────────────────── */
	return (
		<div className={styles.pageRoot}>
			{/* ── Page Bar ─── */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Transactions</a> /{" "}
						<strong>Initiate Transfer</strong>
					</div>
				</div>
				<div className="d-flex flex-wrap" style={{ gap: 8 }}>
					<button
						className={styles.button + " " + styles.buttonSmall}
						onClick={() => openModal("templateModal")}
					>
						<i className="fa-regular fa-file-lines"></i> Templates
					</button>
					<button
						className={styles.button + " " + styles.buttonSmall}
						onClick={() => openModal("bulkUploadModal")}
					>
						<i className="fa-solid fa-cloud-arrow-up"></i> Bulk Upload
					</button>
					<button
						className={styles.button + " " + styles.buttonPrimary + " " + styles.buttonSmall}
						onClick={() => openModal("newTransferModal")}
					>
						<i className="fa-solid fa-plus"></i> Quick Transfer
					</button>
				</div>
			</div>

			{/* ─── Hero Stats (first section – unchanged) ─── */}
			<div className={styles.heroSection}>
				<div className={styles.heroHeader}>
					<div className={styles.heroHeaderLeft}>
						<span className={styles.heroLiveDot}></span>
						<h2 className={styles.heroTitle}>Transfer engine live</h2>
					</div>
					<div className={styles.heroHeaderRight}>
						<button className={styles.heroChip} onClick={() => openModal("railHealthModal")}>
							<i className="fa-solid fa-heart-pulse"></i> Rails
						</button>
						<button className={styles.heroChip} onClick={() => openModal("feeCalcModal")}>
							<i className="fa-solid fa-calculator"></i> Fees
						</button>
						<button
							className={styles.heroChip + " " + styles.heroChipPrimary}
							onClick={() => openModal("addRecipientModal")}
						>
							<i className="fa-solid fa-user-plus"></i> Add Recipient
						</button>
					</div>
				</div>
				<div className={styles.heroAmount}>KES 124.7M</div>
				<p className={styles.heroDescription}>
					Processed today across 12 rails • 98.9% success rate • 4.2s avg settlement
				</p>
				<div className={styles.heroStatsRow}>
					<div className={styles.heroStatCard}>
						<span className={styles.heroStatLabel}>TODAY'S TRANSFERS</span>
						<div className={styles.heroStatValue}>2,841</div>
						<span className={`${styles.badge} ${styles.badgeSuccess}`}>
							<i className="fa-solid fa-circle-check"></i> 2,812 completed
						</span>
						<p className={styles.heroStatDesc}>29 in progress • 0 failed</p>
					</div>
					<div className={styles.heroStatCard}>
						<span className={styles.heroStatLabel}>AVG SETTLEMENT</span>
						<div className={styles.heroStatValue}>4.2s</div>
						<span className={`${styles.badge} ${styles.badgeInfo}`}>
							<i className="fa-solid fa-bolt"></i> -0.8s vs yesterday
						</span>
						<p className={styles.heroStatDesc}>PesaLink: 3.4s • RTGS: 8.7s</p>
					</div>
					<div className={styles.heroStatCard + " " + styles.heroStatCardWarning}>
						<span className={styles.heroStatLabel}>PENDING APPROVAL</span>
						<div className={styles.heroStatValue}>14</div>
						<span className={`${styles.badge} ${styles.badgeWarning}`}>
							<i className="fa-solid fa-clock"></i> 7 high-value
						</span>
						<p className={styles.heroStatDesc}>KES 48.3M awaiting maker-checker</p>
					</div>
				</div>
			</div>

			{/* ─── CAROUSEL (3-Cards Layout) ─── */}
			<div className={styles.carouselContainer}>
				{/* ─── CARD A — Step Navigator (left) ─── */}
				<div className={styles.cardA}>
					<div className={styles.cardAHeader}>
						<i className="fa-solid fa-list-check"></i>
						<span>Steps</span>
					</div>
					<div className={styles.cardABody}>
						{/* Progress bar */}
						<div className={styles.progressTrack}>
							<div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
						</div>
						{/* Step list */}
						<ul className={styles.stepList}>
							{STEPS.map((step) => {
								const isActive = step.id === currentStep;
								const isDone = step.id < currentStep;
								const isNext = step.id === currentStep + 1;
								const isUpcoming = step.id > currentStep + 1;
								return (
									<li
										key={step.id}
										className={`
											${styles.stepItem}
											${isActive ? styles.stepActive : ""}
											${isDone ? styles.stepDone : ""}
											${isNext ? styles.stepNext : ""}
											${isUpcoming ? styles.stepUpcoming : ""}
										`}
										onClick={() => goToStep(step.id)}
									>
										<div className={styles.stepIcon}>
											{isDone ? (
												<i className="fa-solid fa-check"></i>
											) : (
												<i className={step.icon}></i>
											)}
										</div>
										<div className={styles.stepInfo}>
											<span className={styles.stepLabel}>{step.title}</span>
											{isActive && <span className={styles.stepHint}>Current</span>}
											{isNext && <span className={styles.stepNextHint}>Next</span>}
										</div>
									</li>
								);
							})}
						</ul>
						{/* Navigation buttons */}
						<div className={styles.stepNav}>
							<button
								className={styles.stepNavBtn + " " + styles.stepNavPrev}
								onClick={prevStep}
								disabled={currentStep <= 1}
							>
								<i className="fa-solid fa-arrow-left"></i>
								<span>Back</span>
							</button>
							<button
								className={styles.stepNavBtn + " " + styles.stepNavNext}
								onClick={nextStep}
								disabled={currentStep >= STEPS.length}
							>
								<span>Next</span>
								<i className="fa-solid fa-arrow-right"></i>
							</button>
						</div>
					</div>
				</div>

				{/* ─── CARD B — Current Step Content (center) ─── */}
				<div
					className={styles.cardB}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					style={{ transform: `translateX(${-dragOffset * 0.3}px)` }}
				>
					<div className={styles.cardBHeader}>
						<div className={styles.cardBHeaderLeft}>
							<span className={styles.cardBStepBadge}>
								Step {currentStep} of {STEPS.length}
							</span>
							<h3 className={styles.cardBTitle}>
								<i className={`fa-solid ${STEPS[currentStep - 1].icon}`}></i>
								{STEPS[currentStep - 1].title}
							</h3>
						</div>
						<div className={styles.cardBHeaderDots}>
							{STEPS.map((s) => (
								<span
									key={s.id}
									className={`${styles.carouselDot} ${s.id === currentStep ? styles.carouselDotActive : s.id < currentStep ? styles.carouselDotDone : ""}`}
									onClick={() => goToStep(s.id)}
								/>
							))}
						</div>
					</div>

					<div
						className={`${styles.cardBBody} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
					>
						{/* ── STEP 1: Transfer Type ── */}
						{currentStep === 1 && (
							<div className={styles.stepContent}>
								<div className={styles.pills + " mb-3"}>
									{data.transferTypes.map((type: any) => (
										<button
											key={type.id}
											className={`${styles.pill} ${activeType === type.id ? styles.pillActive : ""}`}
											onClick={() => setActiveType(type.id)}
										>
											<i
												className={`fa-solid ${
													type.id === "single" ? "fa-user" : type.id === "bulk" ? "fa-users" : "fa-repeat"
												}`}
											></i>
											{type.label}
										</button>
									))}
								</div>
								{activeType === "single" && (
									<div className={styles.radioGroup}>
										<div className="form-check mb-2">
											<input
												className="form-check-input"
												type="radio"
												name="transferMode"
												defaultChecked
											/>
											<label className="form-check-label">
												<i className="fa-solid fa-clock"></i> Standard (T+0 / T+1)
											</label>
										</div>
										<div className="form-check">
											<input
												className="form-check-input"
												type="radio"
												name="transferMode"
											/>
											<label className="form-check-label">
												<i className="fa-solid fa-bolt"></i> Instant (Real-time)
											</label>
										</div>
									</div>
								)}
								{activeType === "bulk" && (
									<div className={styles.quickGrid}>
										<button
											className={styles.quickButton}
											onClick={() => openModal("bulkUploadModal")}
										>
											<i className="fa-solid fa-cloud-arrow-up"></i>
											<span>CSV / Excel</span>
										</button>
										<button
											className={styles.quickButton}
											onClick={() => openModal("bulkUploadModal")}
										>
											<i className="fa-solid fa-file-excel"></i>
											<span>ISO 20022</span>
										</button>
									</div>
								)}
								{activeType === "recurring" && (
									<div className="row g-2">
										<div className="col-6">
											<label className={styles.formLabel} style={{ fontSize: 10 }}>
												Frequency
											</label>
											<select className={styles.formControl}>
												<option>Weekly</option>
												<option>Monthly</option>
												<option>Quarterly</option>
											</select>
										</div>
										<div className="col-6">
											<label className={styles.formLabel} style={{ fontSize: 10 }}>
												End Date
											</label>
											<input
												type="date"
												className={styles.formControl}
												defaultValue="2025-12-31"
											/>
										</div>
									</div>
								)}
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-lightbulb"></i>
									<span>Choose how you want to send this transfer.</span>
								</div>
							</div>
						)}

						{/* ── STEP 2: Sender ─ */}
						{currentStep === 2 && (
							<div className={styles.stepContent}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={styles.sectionTitle}>
										<i className="fa-solid fa-building-columns"></i> Sender
									</h3>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal("addAccountModal")}
									>
										<i className="fa-solid fa-plus"></i> Account
									</button>
								</div>
								<div className="mb-3">
									<label className={styles.formLabel}>Source Account</label>
									<select className={styles.formControl}>
										{data.sourceAccounts.map((account: any) => (
											<option key={account.id}>
												{account.name} • {account.balance}
											</option>
										))}
									</select>
								</div>
								<div className={styles.accountInfoBox}>
									<div className={styles.accountInfoRow}>
										<span className="text-muted">Available</span>
										<strong>KES 124,700,000</strong>
									</div>
									<div className={styles.accountInfoRow}>
										<span className="text-muted">Daily Limit</span>
										<strong>KES 500,000,000 (24.9% used)</strong>
									</div>
									<div className={styles.accountInfoRow}>
										<span className="text-muted">Verification</span>
										<span className={`${styles.badge} ${styles.badgeSuccess}`}>
											<i className="fa-solid fa-circle-check"></i> Verified
										</span>
									</div>
									<div className={styles.accountInfoRow}>
										<span className="text-muted">Currency</span>
										<strong>KES</strong>
									</div>
								</div>
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-info-circle"></i>
									<span>Select the account you'll be sending funds from.</span>
								</div>
							</div>
						)}

						{/* ── STEP 3: Receiver ── */}
						{currentStep === 3 && (
							<div className={styles.stepContent}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={styles.sectionTitle}>
										<i className="fa-solid fa-user-plus"></i> Receiver
									</h3>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal("beneficiaryModal")}
									>
										<i className="fa-solid fa-address-book"></i> Address Book
									</button>
								</div>
								<div className="mb-3">
									<label className={styles.formLabel}>Beneficiary Type</label>
									<div className={styles.pills}>
										{data.beneficiaryTypes.map((type: any) => (
											<button
												key={type.id}
												className={`${styles.pill} ${
													activeReceiver === type.id ? styles.pillActive : ""
												}`}
												onClick={() => setActiveReceiver(type.id)}
											>
												<i
													className={`fa-solid ${
														type.id === "bank"
															? "fa-building-columns"
															: type.id === "mobile"
															? "fa-mobile-screen"
															: "fa-wallet"
													}`}
												></i>
												{type.label}
											</button>
										))}
									</div>
								</div>
								{activeReceiver === "bank" && (
									<div>
										<div className="mb-2">
											<label className={styles.formLabel}>Bank</label>
											<select className={styles.formControl}>
												{data.banks.map((bank: string, idx: number) => (
													<option key={idx}>{bank}</option>
												))}
											</select>
										</div>
										<div className="row g-2">
											<div className="col-7">
												<label className={styles.formLabel}>Account Number</label>
												<input
													className={styles.formControl}
													defaultValue="1234567890"
												/>
											</div>
											<div className="col-5">
												<label className={styles.formLabel}>Verify</label>
												<button
													className={`${styles.button} ${styles.buttonSmall} w-100`}
													onClick={() => openModal("verifyAccountModal")}
												>
													<i className="fa-solid fa-magnifying-glass"></i> Check Name
												</button>
											</div>
										</div>
									</div>
								)}
								{activeReceiver === "mobile" && (
									<div>
										<div className="mb-2">
											<label className={styles.formLabel}>Network</label>
											<select className={styles.formControl}>
												{data.mobileNetworks.map((network: string, idx: number) => (
													<option key={idx}>{network}</option>
												))}
											</select>
										</div>
										<div className="mb-2">
											<label className={styles.formLabel}>Phone Number</label>
											<input
												className={styles.formControl}
												defaultValue="0712345678"
												placeholder="2547XXXXXXXX"
											/>
										</div>
									</div>
								)}
								{activeReceiver === "wallet" && (
									<div className="mb-2">
										<label className={styles.formLabel}>PayMo Wallet / PayPal</label>
										<input
											className={styles.formControl}
											placeholder="wallet ID or email"
										/>
									</div>
								)}
								<div className="form-check mt-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label" style={{ fontSize: 13 }}>
										<i className="fa-regular fa-bookmark"></i> Save to address book
									</label>
								</div>
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-user-shield"></i>
									<span>Enter the beneficiary details accurately.</span>
								</div>
							</div>
						)}

						{/* ── STEP 4: Amount & Currency ── */}
						{currentStep === 4 && (
							<div className={styles.stepContent}>
								<h3 className={`${styles.sectionTitle} mb-3`}>
									<i className="fa-solid fa-coins"></i> Amount & Currency
								</h3>
								<div className="row g-2 mb-3">
									<div className="col-7">
										<label className={styles.formLabel}>Amount</label>
										<input className={styles.formControl} defaultValue="250000" />
									</div>
									<div className="col-5">
										<label className={styles.formLabel}>Currency</label>
										<select className={styles.formControl}>
											{data.currencies.map((currency: string, idx: number) => (
												<option key={idx}>{currency}</option>
											))}
										</select>
									</div>
								</div>
								<div className={styles.feeBreakdown}>
									<div className={styles.feeRow}>
										<span>Platform Fee</span>
										<strong>KES 125</strong>
									</div>
									<div className={styles.feeRow}>
										<span>Rail Fee</span>
										<strong>KES 50</strong>
									</div>
									<div className={styles.feeRow}>
										<span>FX Spread</span>
										<strong>KES 0</strong>
									</div>
									<hr className={styles.divider} />
									<div className={styles.feeRow + " " + styles.feeTotal}>
										<span>Total Debit</span>
										<strong style={{ color: "var(--pri)" }}>KES 250,175</strong>
									</div>
								</div>
								<div className={styles.quickGrid}>
									<button className={styles.quickButton}>
										<i className="fa-solid fa-percent"></i>
										<span>10% of balance</span>
									</button>
									<button className={styles.quickButton}>
										<i className="fa-solid fa-percent"></i>
										<span>25% of balance</span>
									</button>
								</div>
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-coins"></i>
									<span>Enter the transfer amount. Fees shown are estimates.</span>
								</div>
							</div>
						)}

						{/* ── STEP 5: Payment Rail ── */}
						{currentStep === 5 && (
							<div className={styles.stepContent}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className={styles.sectionTitle}>
										<i className="fa-solid fa-route"></i> Payment Rail
									</h3>
									<button
										className={`${styles.button} ${styles.buttonSmall}`}
										onClick={() => openModal("railCompareModal")}
									>
										<i className="fa-solid fa-chart-bar"></i> Compare
									</button>
								</div>
								<div className={`${styles.pills} mb-3`}>
									<button
										className={`${styles.pill} ${activeRail === "smart" ? styles.pillActive : ""}`}
										onClick={() => setActiveRail("smart")}
									>
										<i className="fa-solid fa-wand-magic-sparkles"></i> Smart
									</button>
									<button
										className={`${styles.pill} ${activeRail === "manual" ? styles.pillActive : ""}`}
										onClick={() => setActiveRail("manual")}
									>
										<i className="fa-solid fa-sliders"></i> Manual
									</button>
								</div>
								{activeRail === "smart" && (
									<div>
										<div className={styles.railRecommended}>
											<div className={styles.railRecHeader}>
												<div>
													<strong>PesaLink</strong>
													<div style={{ fontSize: 11, color: "#047857" }}>
														Recommended • 3.4s • KES 50
													</div>
												</div>
												<span className={`${styles.badge} ${styles.badgeSuccess}`}>
													<i className="fa-solid fa-star"></i> Best
												</span>
											</div>
										</div>
										<div className="row g-2">
											{data.rails.slice(0, 3).map((rail: any) => (
												<div key={rail.id} className="col-4">
													<div
														className={styles.railMiniCard}
														style={{
															borderColor: rail.recommended ? "var(--pri)" : "",
														}}
													>
														<strong>{rail.name}</strong>
														<div style={{ fontSize: 10, color: "var(--ink-500)" }}>
															{rail.time}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
								{activeRail === "manual" && (
									<select className={styles.formControl}>
										{data.rails.map((rail: any) => (
											<option key={rail.id}>
												{rail.name} ({rail.fee} • {rail.time})
											</option>
										))}
									</select>
								)}
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-route"></i>
									<span>Choose how the money travels. Smart picks the best rail automatically.</span>
								</div>
							</div>
						)}

						{/* ── STEP 6: Purpose & Compliance ── */}
						{currentStep === 6 && (
							<div className={styles.stepContent}>
								<h3 className={`${styles.sectionTitle} mb-3`}>
									<i className="fa-solid fa-file-shield"></i> Purpose & Compliance
								</h3>
								<div className="mb-3">
									<label className={styles.formLabel}>Purpose Code</label>
									<select className={styles.formControl}>
										{data.purposeCodes.map((code: string, idx: number) => (
											<option key={idx}>{code}</option>
										))}
									</select>
								</div>
								<div className="mb-3">
									<label className={styles.formLabel}>Reference / Narration</label>
									<input
										className={styles.formControl}
										defaultValue="June 2025 Payroll - Engineering"
									/>
								</div>
								<div className="mb-3">
									<label className={styles.formLabel}>Supporting Documents</label>
									<div className="d-flex gap-2">
										<button
											className={`${styles.button} ${styles.buttonSmall}`}
											onClick={() => openModal("uploadDocModal")}
										>
											<i className="fa-solid fa-cloud-arrow-up"></i> Upload
										</button>
									</div>
								</div>
								<div className="form-check">
									<input className="form-check-input" type="checkbox" />
									<label className="form-check-label" style={{ fontSize: 13 }}>
										<i className="fa-solid fa-bolt"></i> Urgent / Critical priority
									</label>
								</div>
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-shield-halved"></i>
									<span>Compliance fields help prevent transaction blocks.</span>
								</div>
							</div>
						)}

						{/* ─ STEP 7: Authorization ── */}
						{currentStep === 7 && (
							<div className={styles.stepContent}>
								<h3 className={`${styles.sectionTitle} mb-3`}>
									<i className="fa-solid fa-lock"></i> Authorization
								</h3>
								<div className={styles.authBox}>
									<div className={styles.authRow}>
										<span>
											<i className="fa-solid fa-pen"></i> Maker
										</span>
										<strong>James K. (You)</strong>
									</div>
									<div className={styles.authRow}>
										<span>
											<i className="fa-solid fa-eye"></i> Checker
										</span>
										<strong>Grace W. (Finance)</strong>
									</div>
									<div className={styles.authRow}>
										<span>
											<i className="fa-solid fa-stamp"></i> Approver
										</span>
										<strong>Peter O. (Treasury)</strong>
									</div>
								</div>
								<div className="mb-3">
									<label className={styles.formLabel}>Schedule Execution</label>
									<input
										type="datetime-local"
										className={styles.formControl}
										defaultValue="2025-06-27T14:00"
									/>
								</div>
								<div className="form-check">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label" style={{ fontSize: 13 }}>
										<i className="fa-solid fa-fingerprint"></i> Require 2FA on submit
									</label>
								</div>
								<div className={styles.stepHintBox}>
									<i className="fa-solid fa-lock"></i>
									<span>Multi-signature authorization workflow for high-value transfers.</span>
								</div>
							</div>
						)}

						{/* ── STEP 8: Review & Submit ─ */}
						{currentStep === 8 && (
							<div className={styles.stepContent}>
								<h3 className={`${styles.sectionTitle} mb-3`}>
									<i className="fa-solid fa-circle-check"></i> Review & Submit
								</h3>
								<div className={styles.reviewGrid}>
									<div className={styles.reviewCard}>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-building-columns"></i> From
											</span>
											<strong>PayMo KES Float</strong>
										</div>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-user"></i> To
											</span>
											<strong>James K. Mwangi (KCB)</strong>
										</div>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-coins"></i> Amount
											</span>
											<strong>KES 250,000</strong>
										</div>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-receipt"></i> Total Debit
											</span>
											<strong>KES 250,175</strong>
										</div>
									</div>
									<div className={styles.reviewCard + " " + styles.reviewCardSuccess}>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-route"></i> Rail
											</span>
											<strong>PesaLink</strong>
										</div>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-clock"></i> ETA
											</span>
											<strong>3.4 seconds</strong>
										</div>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-hashtag"></i> Ref
											</span>
											<strong>PAY-20250627-8841</strong>
										</div>
										<div className={styles.reviewRow}>
											<span className="text-muted">
												<i className="fa-solid fa-shield-halved"></i> Risk Score
											</span>
											<span className={`${styles.badge} ${styles.badgeSuccess}`}>
												Low (12)
											</span>
										</div>
									</div>
								</div>
								<div className="form-check mt-3">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label" style={{ fontSize: 13 }}>
										I accept the{" "}
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												openModal("termsModal");
											}}
										>
											terms and conditions
										</a>
									</label>
								</div>
								<div className={styles.submitButtons}>
									<button
										className={`${styles.button} ${styles.buttonAccent} flex-fill`}
										onClick={() => openModal("submitSuccessModal")}
									>
										<i className="fa-solid fa-check"></i> Submit Transfer
									</button>
									<button
										className={`${styles.button} flex-fill`}
										onClick={() => openModal("draftSavedModal")}
									>
										<i className="fa-regular fa-floppy-disk"></i> Save Draft
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Bottom nav arrows for card B */}
					<div className={styles.cardBNav}>
						<button
							className={styles.cardBNavBtn}
							onClick={prevStep}
							disabled={currentStep <= 1}
						>
							<i className="fa-solid fa-arrow-left"></i>
						</button>
						<span className={styles.cardBNavInfo}>
							{currentStep === STEPS.length ? "Ready to submit" : "Swipe or tap arrows to navigate"}
						</span>
						<button
							className={styles.cardBNavBtn + " " + styles.cardBNavBtnNext}
							onClick={nextStep}
							disabled={currentStep >= STEPS.length}
						>
							<i className="fa-solid fa-arrow-right"></i>
						</button>
					</div>
				</div>

				{/* ─── CARD C — Transaction Summary (right) ─── */}
				<div className={styles.cardC}>
					<div className={styles.cardCHeader}>
						<i className="fa-solid fa-receipt"></i>
						<span>Transaction Summary</span>
					</div>
					<div className={styles.cardCBody}>
						{Object.keys(summary).length === 0 && (
							<div className={styles.summaryEmpty}>
								<i className="fa-solid fa-inbox"></i>
								<p>Start filling in the steps to see your summary here.</p>
							</div>
						)}
						{summary.transferType && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-arrows-split-up-and-left"></i>
									<span>Transfer Type</span>
								</div>
								<div className={styles.summaryRowValue}>
									{summary.transferType}
									{summary.transferMode && (
										<span className={styles.summaryRowSub}>{summary.transferMode}</span>
									)}
								</div>
							</div>
						)}
						{summary.sourceAccount && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-building-columns"></i>
									<span>Sender</span>
								</div>
								<div className={styles.summaryRowValue}>
									{summary.sourceAccount}
									<span className={styles.summaryRowSub}>{summary.sourceBalance}</span>
								</div>
							</div>
						)}
						{summary.receiverType && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-user"></i>
									<span>Receiver</span>
								</div>
								<div className={styles.summaryRowValue}>
									{summary.receiverName}
									<span className={styles.summaryRowSub}>
										{summary.receiverBank || summary.receiverNetwork || ""}
										{summary.receiverAccount ? ` • ${summary.receiverAccount}` : ""}
									</span>
								</div>
							</div>
						)}
						{summary.amount && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-coins"></i>
									<span>Amount</span>
								</div>
								<div className={styles.summaryRowValue}>
									{summary.currency} {summary.amount}
									<span className={styles.summaryRowSub}>{summary.fee} fees</span>
								</div>
							</div>
						)}
						{summary.rail && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-route"></i>
									<span>Payment Rail</span>
								</div>
								<div className={styles.summaryRowValue}>
									{summary.rail}
									<span className={styles.summaryRowSub}>
										{summary.railTime} • {summary.railFee}
									</span>
								</div>
							</div>
						)}
						{summary.purpose && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-file-shield"></i>
									<span>Purpose</span>
								</div>
								<div className={styles.summaryRowValue}>
									{summary.purpose}
									<span className={styles.summaryRowSub}>{summary.reference}</span>
								</div>
							</div>
						)}
						{summary.schedule && (
							<div className={styles.summaryRow}>
								<div className={styles.summaryRowLabel}>
									<i className="fa-solid fa-calendar-clock"></i>
									<span>Schedule</span>
								</div>
								<div className={styles.summaryRowValue}>{summary.schedule}</div>
							</div>
						)}

						{/* Approximate total */}
						<div className={styles.summaryTotal}>
							<span>
								<i className="fa-solid fa-equals"></i> Approximate Total
							</span>
							<strong>$100</strong>
						</div>

						{/* Visual connector animation */}
						<div className={styles.summaryPulse}>
							<div className={styles.summaryPulseDot}></div>
						</div>
					</div>
				</div>
			</div>

			{/* ─── Mobile Carousel Pagination ─── */}
			<div className={styles.mobilePagination}>
				{STEPS.map((s) => (
					<button
						key={s.id}
						className={`${styles.mobilePagDot} ${s.id === currentStep ? styles.mobilePagActive : ""}`}
						onClick={() => goToStep(s.id)}
						aria-label={`Go to step ${s.id}: ${s.title}`}
					/>
				))}
			</div>

			{/* ─── Modals (all retained) ─── */}
			<InitiateTransferModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				data={data}
			/>
		</div>
	);
};
