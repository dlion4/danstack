import type { ReactNode } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import styles from "../styles/support-disputes.module.css";

/* ============================================================================
   Support, Disputes & Refunds — modal layer (legacy page 3.13)
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
interface Result {
	msg: string;
	ref?: string;
}

function downloadFile(name: string, content: string, type = "text/plain") {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content], { type }));
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}

function MBox({
	id,
	active,
	title,
	size = "md",
	onClose,
	children,
	footer,
}: MBoxProps) {
	const s = styles as Record<string, string>;
	if (active !== id) return null;
	return (
		<>
			<div className={s.backdrop} onClick={onClose} />
			<div className={s.modalWrap} role="dialog" aria-modal="true">
				<div
					className={`${s.modalBox} ${size === "lg" ? s.modalBoxLg : ""} ${size === "xl" ? s.modalBoxXl : ""}`}
				>
					<div className={s.modalHeader}>
						<h5 className={s.modalTitle}>{title}</h5>
						<button
							type="button"
							className="btn-close"
							aria-label="Close"
							onClick={onClose}
						/>
					</div>
					<div className={s.modalBody}>{children}</div>
					{footer && <div className={s.modalFooter}>{footer}</div>}
				</div>
			</div>
		</>
	);
}

function BusyOverlay() {
	const s = styles as Record<string, string>;
	return (
		<div className={s.loadingOv}>
			<div className={s.spinner} />
			<p className={s.loadingLabel}>Processing...</p>
		</div>
	);
}

const FLOW_DEFS: Record<string, { labels: string[] }> = {
	cb: { labels: ["Details", "Evidence", "Submit", "Done"] },
	rf: { labels: ["Details", "Approval", "Done"] },
	brf: { labels: ["Select", "Review", "Done"] },
};

function Stepper({ flowKey, current }: { flowKey: string; current: number }) {
	const s = styles as Record<string, string>;
	const def = FLOW_DEFS[flowKey];
	if (!def) return null;
	return (
		<div className={s.stepper}>
			{def.labels.map((label, i) => {
				const stepNum = i + 1;
				const done = stepNum < current;
				const isActive = stepNum === current;
				const lineColor = done ? "var(--pm-accent)" : undefined;
				return (
					<Fragment key={label}>
						{i > 0 && (
							<div
								className={s.stepLine}
								style={lineColor ? { background: lineColor } : undefined}
							/>
						)}
						<div
							className={`${s.step} ${done ? s.stepDone : ""} ${isActive ? s.stepActive : ""}`}
						>
							<div className={s.stepN}>
								{done ? <i className="bi bi-check" /> : stepNum}
							</div>
							<div className={s.stepL}>{label}</div>
						</div>
					</Fragment>
				);
			})}
		</div>
	);
}

export default function SupportDisputesModals({
	active,
	onClose,
	onOpen,
}: ModalsProps) {
	const s = styles as Record<string, string>;
	const cx = (...cls: (string | false | undefined)[]) =>
		cls.filter(Boolean).join(" ");
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({
		cb: 1,
		rf: 1,
		brf: 1,
	});
	const [tabs, setTabs] = useState<Record<string, string>>({});

	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ cb: 1, rf: 1, brf: 1 });
			setBusy(null);
			setTabs({});
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

	const nextFlow = (key: string, total: number) => {
		const cur = flows[key] ?? 1;
		if (cur >= total) {
			onClose();
			return;
		}
		setFlows((prev) => ({ ...prev, [key]: cur + 1 }));
	};
	const switchTab = (prefix: string, key: string) =>
		setTabs((prev) => ({ ...prev, [prefix]: key }));

	const renderReceipt = (r: Result) => (
		<div className={s.receipt}>
			<div className={s.receiptIcon}>
				<i className="bi bi-check-lg" />
			</div>
			<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>{r.msg}</h5>
			{r.ref && (
				<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Ref: {r.ref}</p>
			)}
			<div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => downloadFile("receipt.txt", r.msg)}
				>
					<i className="bi bi-download" /> Save
				</button>
				<button className={cx(s.btnPm, s.btnSm)}>
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

	/* M1: New Ticket */
	const renderNewTicket = () => (
		<MBox
			id="newTicketModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-ticket-detailed me-2" />
					Create New Ticket
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Cancel
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() =>
							doAction(
								"newTicketModal",
								"Ticket #T-8834 created and assigned to Support Team.",
								"T-8834",
							)
						}
					>
						Create Ticket
					</button>
				</>
			}
		>
			{renderActionBody(
				"newTicketModal",
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Ticket Type</label>
							<select className={s.formControl}>
								<option>Customer Support</option>
								<option>Merchant Dispute</option>
								<option>Chargeback</option>
								<option>Refund Request</option>
								<option>Technical Issue</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Priority</label>
							<select className={s.formControl}>
								<option>Critical</option>
								<option>High</option>
								<option>Medium</option>
								<option>Low</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Customer / Merchant</label>
							<input className={s.formControl} defaultValue="Grace Wanjiku" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Related Transaction</label>
							<input className={s.formControl} placeholder="TXN-XXXXXX" />
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Subject</label>
							<input
								className={s.formControl}
								defaultValue="Failed delivery of order #ORD-88291"
							/>
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Description</label>
							<textarea
								className={s.formControl}
								rows={4}
								defaultValue="Customer reports that order was not delivered despite payment confirmation."
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Assign To</label>
							<select className={s.formControl}>
								<option>Support Team — General</option>
								<option>Disputes Team</option>
								<option>Chargeback Specialist</option>
								<option>Finance — Refunds</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>SLA Target</label>
							<select className={s.formControl}>
								<option>4 hours (Critical)</option>
								<option>24 hours (High)</option>
								<option>48 hours (Medium)</option>
								<option>72 hours (Low)</option>
							</select>
						</div>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M2: Ticket Detail (tabbed) */
	const renderTicketDetail = () => {
		const tab = tabs.tkt ?? "details";
		return (
			<MBox
				id="ticketDetailModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-ticket-detailed me-2" />
						Ticket #T-8821 — VIP Customer
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Close
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"ticketDetailModal",
									"Ticket updated successfully.",
									"",
								)
							}
						>
							Save Changes
						</button>
					</>
				}
			>
				<div className={cx(s.pills, "mb-3")}>
					<button
						className={cx(s.pill, tab === "details" && s.pillActive)}
						onClick={() => switchTab("tkt", "details")}
					>
						Details
					</button>
					<button
						className={cx(s.pill, tab === "timeline" && s.pillActive)}
						onClick={() => switchTab("tkt", "timeline")}
					>
						Timeline
					</button>
					<button
						className={cx(s.pill, tab === "chat" && s.pillActive)}
						onClick={() => switchTab("tkt", "chat")}
					>
						Chat
					</button>
					<button
						className={cx(s.pill, tab === "actions" && s.pillActive)}
						onClick={() => switchTab("tkt", "actions")}
					>
						Actions
					</button>
				</div>
				{tab === "details" && (
					<div className="row g-3">
						<div className="col-md-6">
							<div
								className="p-3 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<div className="d-flex justify-content-between mb-2">
									<span className="text-muted">Customer</span>
									<strong>Grace Wanjiku (VIP)</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span className="text-muted">Priority</span>
									<span className={cx(s.badge, s.badgeD)}>Critical</span>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span className="text-muted">SLA</span>
									<strong>4h (2h remaining)</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span className="text-muted">Assigned</span>
									<strong>James K. — Support</strong>
								</div>
							</div>
						</div>
						<div className="col-md-6">
							<div
								className="p-3 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<div className="d-flex justify-content-between mb-2">
									<span className="text-muted">Transaction</span>
									<strong>TXN-884291</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span className="text-muted">Amount</span>
									<strong>KES 47,800</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span className="text-muted">Merchant</span>
									<strong>Fashion Hub</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span className="text-muted">Payment</span>
									<strong>M-Pesa</strong>
								</div>
							</div>
						</div>
						<div className="col-12">
							<div
								className="p-3 rounded"
								style={{ background: "var(--pm-warning-soft)" }}
							>
								Customer reports that order #ORD-88291 was not delivered.
								Tracking shows delivered but customer claims otherwise.
							</div>
						</div>
					</div>
				)}
				{tab === "timeline" && (
					<div>
						<div className={s.statusRow}>
							<div>
								<strong>26 Jun 14:32</strong> — Ticket created
							</div>
						</div>
						<div className={s.statusRow}>
							<div>
								<strong>26 Jun 14:45</strong> — Assigned to James K.
							</div>
						</div>
						<div className={s.statusRow}>
							<div>
								<strong>26 Jun 15:10</strong> — Chat opened with customer
							</div>
						</div>
						<div className={s.statusRow}>
							<div>
								<strong>26 Jun 16:22</strong> — Merchant contacted
							</div>
						</div>
						<div className={s.statusRow}>
							<div>
								<strong>27 Jun 09:15</strong> — Evidence uploaded
							</div>
						</div>
					</div>
				)}
				{tab === "chat" && (
					<div>
						<div
							className="p-3 rounded mb-2"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
								Grace Wanjiku — 26 Jun 15:10
							</div>
							<div>Hi, my order still hasn&apos;t arrived.</div>
						</div>
						<div
							className="p-3 rounded mb-2"
							style={{ background: "var(--pm-info-soft)" }}
						>
							<div style={{ fontSize: 12, color: "#1D4ED8" }}>
								James K. — 26 Jun 15:12
							</div>
							<div>
								Thank you for reaching out. I&apos;m escalating this to our
								disputes team.
							</div>
						</div>
					</div>
				)}
				{tab === "actions" && (
					<div className="row g-3">
						<div className="col-md-6">
							<button
								className={cx(s.quickBtn, "w-100 mb-2")}
								onClick={() => onOpen("contactCustomerModal")}
							>
								Contact Customer
							</button>
							<button
								className={cx(s.quickBtn, "w-100 mb-2")}
								onClick={() => onOpen("evidenceUploadModal")}
							>
								Upload Evidence
							</button>
							<button
								className={cx(s.quickBtn, "w-100 mb-2")}
								onClick={() => onOpen("escalateModal")}
							>
								Escalate
							</button>
						</div>
						<div className="col-md-6">
							<button
								className={cx(s.quickBtn, "w-100 mb-2")}
								onClick={() => onOpen("refundModal")}
							>
								Issue Refund
							</button>
							<button
								className={cx(s.quickBtn, "w-100 mb-2")}
								onClick={() =>
									doAction(
										"ticketDetailModal",
										"Ticket marked as resolved.",
										"",
									)
								}
							>
								Mark Resolved
							</button>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* M3: Chargeback (4-step) */
	const renderChargeback = () => {
		const step = flows.cb;
		return (
			<MBox
				id="chargebackModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-credit-card text-danger me-2" />
						Chargeback Management
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("cb", 4)}
						>
							{step >= 4
								? "Done"
								: step === 3
									? "Submit to Network"
									: "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="cb" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Case Details</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>Case ID</label>
								<input className={s.formControl} defaultValue="CB-9912" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Network</label>
								<select className={s.formControl}>
									<option>Visa</option>
									<option>Mastercard</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Card</label>
								<input className={s.formControl} defaultValue="****4521" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Amount</label>
								<input className={s.formControl} defaultValue="124,000" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Merchant</label>
								<input
									className={s.formControl}
									defaultValue="Online Store XYZ"
								/>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Reason Code</label>
								<select className={s.formControl}>
									<option>Fraud</option>
									<option>Card not present</option>
									<option>Merchandise not received</option>
								</select>
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Evidence</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Upload Evidence</label>
							<input type="file" className={s.formControl} />
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Merchant Response</label>
							<textarea
								className={s.formControl}
								rows={3}
								defaultValue="Merchant claims goods were delivered. Tracking number: TRK-882910"
							/>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Our Position</label>
							<textarea
								className={s.formControl}
								rows={3}
								defaultValue="Customer has provided police report and delivery address confirmation showing no receipt."
							/>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: Network Submission</h6>
						<div
							className="p-3 rounded mb-3"
							style={{ background: "var(--pm-info-soft)" }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span>Case ID</span>
								<strong>CB-9912</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Network</span>
								<strong>Visa</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Amount</span>
								<strong>KES 124,000</strong>
							</div>
							<div className="d-flex justify-content-between">
								<span>Deadline</span>
								<strong>8 hours remaining</strong>
							</div>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								Format for Visa network
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">Include all evidence</label>
						</div>
					</div>
				)}
				{step === 4 &&
					renderActionBody(
						"chargebackModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"chargebackModal",
										"Chargeback response submitted to Visa network.",
										"CB-9912-VISA",
									)
								}
							>
								Submit Response <i className="bi bi-send" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M4: Refund (3-step) */
	const renderRefund = () => {
		const step = flows.rf;
		return (
			<MBox
				id="refundModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-cash text-success me-2" />
						Process Refund
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("rf", 3)}
						>
							{step >= 3 ? "Done" : step === 2 ? "Execute Refund" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="rf" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Refund Details</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>Original Transaction</label>
								<input className={s.formControl} defaultValue="TXN-884291" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Customer</label>
								<input className={s.formControl} defaultValue="Grace Wanjiku" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Refund Amount</label>
								<input className={s.formControl} defaultValue="47,800" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Refund Type</label>
								<select className={s.formControl}>
									<option>Full refund</option>
									<option>Partial refund</option>
									<option>Goodwill gesture</option>
								</select>
							</div>
							<div className="col-12">
								<label className={s.formLabel}>Reason</label>
								<textarea
									className={s.formControl}
									rows={2}
									defaultValue="Order not delivered per customer report. Merchant unresponsive."
								/>
							</div>
						</div>
					</div>
				)}
				{step === 2 &&
					renderActionBody(
						"refundModal",
						<div className={s.fstepActive}>
							<h6 style={{ fontWeight: 700 }}>Step 2: Approval</h6>
							<div
								className="p-3 rounded mb-3"
								style={{ background: "var(--pm-warning-soft)" }}
							>
								<div className="d-flex justify-content-between mb-2">
									<span>Amount</span>
									<strong>KES 47,800</strong>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span>Refund Method</span>
									<strong>Original (M-Pesa)</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span>Approval Required</span>
									<span className={cx(s.badge, s.badgeW)}>Finance Manager</span>
								</div>
							</div>
							<div className="mb-3">
								<label className={s.formLabel}>Approver Notes</label>
								<textarea
									className={s.formControl}
									rows={2}
									defaultValue="Approved for refund due to delivery failure and merchant non-response."
								/>
							</div>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"refundModal",
										"Refund Processed Successfully — KES 47,800 refunded",
										"RF-20250627-4421",
									)
								}
							>
								Execute Refund <i className="bi bi-check-lg" />
							</button>
						</div>,
					)}
				{step === 3 &&
					renderActionBody(
						"refundModal",
						<div className={s.fstepActive}>
							<div
								className="text-center p-3"
								style={{
									background: "var(--pm-accent-soft)",
									borderRadius: 12,
								}}
							>
								<strong>Refund Complete!</strong>
							</div>
						</div>,
					)}
			</MBox>
		);
	};

	/* M5: Bulk Refund (3-step) */
	const renderBulkRefund = () => {
		const step = flows.brf;
		return (
			<MBox
				id="bulkRefundModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-collection me-2" />
						Bulk Refund Processing
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("brf", 3)}
						>
							{step >= 3 ? "Done" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="brf" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Select Refunds</h6>
						<div className="form-check p-3 border rounded mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								RF-4421 — Grace Wanjiku · KES 47,800
							</label>
						</div>
						<div className="form-check p-3 border rounded mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								RF-4408 — David Kimani · KES 23,400
							</label>
						</div>
						<div className="mt-3">
							<div className="d-flex justify-content-between">
								<span style={{ fontWeight: 700 }}>Selected Total</span>
								<strong style={{ fontSize: 18, color: "var(--pm-primary)" }}>
									KES 71,200
								</strong>
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Review & Execute</h6>
						<div
							className="p-3 rounded mb-3"
							style={{ background: "var(--pm-info-soft)" }}
						>
							<div className="d-flex justify-content-between mb-2">
								<span>Refunds Selected</span>
								<strong>2</strong>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span>Total Amount</span>
								<strong>KES 71,200</strong>
							</div>
						</div>
						<div className="form-check mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								Auto-approve low-value refunds (&lt;KES 5,000)
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								Send customer notifications
							</label>
						</div>
					</div>
				)}
				{step === 3 &&
					renderActionBody(
						"bulkRefundModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"bulkRefundModal",
										"Bulk Refund Completed — 2 refunds processed",
										"BRF-20250627",
									)
								}
							>
								Execute <i className="bi bi-arrow-right" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M6-M30: Simple modals */
	const renderSimple = (
		id: string,
		title: ReactNode,
		content: ReactNode,
		action?: string,
		actionMsg?: string,
		actionRef?: string,
	) => (
		<MBox
			id={id}
			active={active}
			onClose={onClose}
			title={title}
			footer={
				action ? (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => doAction(id, actionMsg || "Completed!", actionRef)}
						>
							{action}
						</button>
					</>
				) : (
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
				)
			}
		>
			{action ? renderActionBody(id, content) : content}
		</MBox>
	);

	return (
		<>
			{renderNewTicket()}
			{renderTicketDetail()}
			{renderChargeback()}
			{renderRefund()}
			{renderBulkRefund()}
			{renderSimple(
				"evidenceUploadModal",
				<>
					<i className="bi bi-upload me-2" />
					Upload Evidence
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Case / Ticket</label>
						<select className={s.formControl}>
							<option>CB-9912 — Chargeback</option>
							<option>T-8821 — Ticket</option>
							<option>RF-4421 — Refund</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Evidence Type</label>
						<select className={s.formControl}>
							<option>Receipt / Invoice</option>
							<option>Delivery Proof</option>
							<option>Chat / Email Log</option>
							<option>Bank Statement</option>
							<option>Police Report</option>
							<option>Other</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>File Upload</label>
						<input type="file" className={s.formControl} />
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Run OCR for text extraction
						</label>
					</div>
				</>,
				"Upload Evidence",
				"Evidence uploaded and verified. OCR extraction complete.",
				"EVD-20250627-9912",
			)}
			{renderSimple(
				"slaHealthModal",
				<>
					<i className="bi bi-heart-pulse me-2" />
					SLA Health Dashboard
				</>,
				<>
					<div className="row g-3 mb-3">
						<div className="col-md-3 col-6">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-accent-soft)" }}
							>
								<div
									style={{
										fontSize: 28,
										fontWeight: 800,
										color: "#047857",
										fontFamily: "var(--pm-font-display)",
									}}
								>
									94.8
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#047857" }}
								>
									OVERALL SLA
								</div>
							</div>
						</div>
						<div className="col-md-3 col-6">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-warning-soft)" }}
							>
								<div
									style={{ fontSize: 24, fontWeight: 700, color: "#F59E0B" }}
								>
									9
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#B45309" }}
								>
									BREACHED
								</div>
							</div>
						</div>
						<div className="col-md-3 col-6">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-info-soft)" }}
							>
								<div
									style={{ fontSize: 24, fontWeight: 700, color: "#3B82F6" }}
								>
									14
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8" }}
								>
									AT RISK
								</div>
							</div>
						</div>
						<div className="col-md-3 col-6">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-purple-soft)" }}
							>
								<div
									style={{ fontSize: 24, fontWeight: 700, color: "#8B5CF6" }}
								>
									26h
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#6D28D9" }}
								>
									AVG RESOLUTION
								</div>
							</div>
						</div>
					</div>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Category</th>
									<th>Target</th>
									<th>Actual</th>
									<th>Breaches</th>
									<th>Trend</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td data-label="Category">Customer Tickets</td>
									<td data-label="Target">98%</td>
									<td data-label="Actual">97.2%</td>
									<td data-label="Breaches">11</td>
									<td data-label="Trend">
										<span className={cx(s.badge, s.badgeS)}>↑ 1.2%</span>
									</td>
								</tr>
								<tr>
									<td data-label="Category">Merchant Disputes</td>
									<td data-label="Target">95%</td>
									<td data-label="Actual">93.4%</td>
									<td data-label="Breaches">19</td>
									<td data-label="Trend">
										<span className={cx(s.badge, s.badgeD)}>↓ 0.8%</span>
									</td>
								</tr>
								<tr>
									<td data-label="Category">Chargebacks</td>
									<td data-label="Target">90%</td>
									<td data-label="Actual">89.1%</td>
									<td data-label="Breaches">8</td>
									<td data-label="Trend">
										<span className={cx(s.badge, s.badgeW)}>↓ 2.1%</span>
									</td>
								</tr>
								<tr>
									<td data-label="Category">Refunds</td>
									<td data-label="Target">97%</td>
									<td data-label="Actual">96.8%</td>
									<td data-label="Breaches">4</td>
									<td data-label="Trend">
										<span className={cx(s.badge, s.badgeS)}>↑ 0.5%</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
			)}
			{renderSimple(
				"bulkEvidenceModal",
				<>
					<i className="bi bi-upload me-2" />
					Bulk Evidence Upload
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Select Cases</label>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								CB-9912, CB-9908, CB-9901
							</label>
						</div>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">T-8821, T-8803</label>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Upload Files (multiple)</label>
						<input type="file" className={s.formControl} multiple />
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Auto-format for network submission
						</label>
					</div>
				</>,
				"Upload All",
				"Bulk evidence uploaded for 5 cases.",
				"EVD-BULK-20250627",
			)}
			{renderSimple(
				"escalateModal",
				<>
					<i className="bi bi-arrow-up-circle me-2" />
					Escalate Ticket
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Ticket</label>
						<select className={s.formControl}>
							<option>T-8821 — VIP Customer</option>
							<option>CB-9912 — High-value chargeback</option>
							<option>T-8803 — Merchant settlement</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Escalate To</label>
						<select className={s.formControl}>
							<option>Senior Support Manager</option>
							<option>Disputes Team Lead</option>
							<option>Finance Director</option>
							<option>Legal & Compliance</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Escalation Reason</label>
						<textarea
							className={s.formControl}
							rows={3}
							defaultValue="Complex fraud pattern detected. Multiple similar cases in last 48 hours."
						/>
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Notify customer of escalation
						</label>
					</div>
				</>,
				"Escalate",
				"Ticket escalated to Senior Support Manager.",
				"ESC-20250627-1128",
			)}
			{renderSimple(
				"evidenceRequestModal",
				<>
					<i className="bi bi-file-earmark me-2" />
					Request Evidence from Merchant
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Merchant</label>
						<select className={s.formControl}>
							<option>Online Store XYZ</option>
							<option>TechHub KE</option>
							<option>Fashion Hub</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Case</label>
						<select className={s.formControl}>
							<option>CB-9912 — Chargeback</option>
							<option>T-8821 — Delivery dispute</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Requested Documents</label>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Delivery receipt / tracking
							</label>
						</div>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Customer communication log
							</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" />
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Refund policy document
							</label>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Deadline</label>
						<input
							type="date"
							className={s.formControl}
							defaultValue="2025-06-30"
						/>
					</div>
				</>,
				"Send Request",
				"Evidence request sent to merchant.",
				"EVR-20250627-9912",
			)}
			{renderSimple(
				"duplicateCheckModal",
				<>
					<i className="bi bi-exclamation-diamond text-warning me-2" />
					Duplicate Refund Detected
				</>,
				<>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-warning-soft)" }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span>Customer</span>
							<strong>David Kimani</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span>Original Transaction</span>
							<strong>TXN-883105</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span>Duplicate Refunds</span>
							<strong>RF-4408 & RF-4419</strong>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Action</label>
						<select className={s.formControl}>
							<option>Cancel duplicate (RF-4419)</option>
							<option>Merge into single refund</option>
							<option>Investigate further</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Notes</label>
						<textarea
							className={s.formControl}
							rows={2}
							defaultValue="Same customer, same transaction, two refund requests submitted 2 hours apart."
						/>
					</div>
				</>,
				"Resolve",
				"Duplicate refund RF-4419 cancelled.",
				"RF-4419-CANCEL",
			)}
			{renderSimple(
				"assignModal",
				<>
					<i className="bi bi-people me-2" />
					Bulk Assign Tickets
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Select Tickets</label>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								T-8821, T-8803, T-8799, T-8794, T-8788
							</label>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Assign To</label>
						<select className={s.formControl}>
							<option>Disputes Team (5 specialists)</option>
							<option>Chargeback Team (3 specialists)</option>
							<option>Technical Support</option>
							<option>Finance Team</option>
						</select>
					</div>
				</>,
				"Assign",
				"5 tickets assigned to Disputes Team.",
				"",
			)}
			{renderSimple(
				"contactCustomerModal",
				<>
					<i className="bi bi-chat-dots me-2" />
					Contact Customer
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Customer</label>
						<input className={s.formControl} defaultValue="Grace Wanjiku" />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Channel</label>
						<select className={s.formControl}>
							<option>WhatsApp (preferred)</option>
							<option>SMS</option>
							<option>Email</option>
							<option>Phone call</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Message</label>
						<textarea
							className={s.formControl}
							rows={4}
							defaultValue="Dear Grace, we have escalated your delivery issue to our senior team. A specialist will contact you within 1 hour."
						/>
					</div>
				</>,
				"Send Message",
				"Message sent via WhatsApp.",
				"MSG-20250627-8821",
			)}
			{renderSimple(
				"slaReportModal",
				<>
					<i className="bi bi-graph-up me-2" />
					Generate SLA Report
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Report Type</label>
						<select className={s.formControl}>
							<option>Daily SLA Performance</option>
							<option>Weekly Trend Analysis</option>
							<option>Monthly Summary</option>
							<option>Chargeback Win Rate Report</option>
							<option>Team Performance</option>
						</select>
					</div>
					<div className="row g-3 mb-3">
						<div className="col-6">
							<label className={s.formLabel}>From</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-06-01"
							/>
						</div>
						<div className="col-6">
							<label className={s.formLabel}>To</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-06-27"
							/>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Format</label>
						<select className={s.formControl}>
							<option>PDF</option>
							<option>Excel</option>
							<option>Dashboard Link</option>
						</select>
					</div>
				</>,
				"Generate Report",
				"SLA report generated and emailed.",
				"RPT-SLA-20250627",
			)}
			{renderSimple(
				"bulkAssignModal",
				<>
					<i className="bi bi-people me-2" />
					Bulk Ticket Assignment
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Filter Tickets</label>
						<select className={s.formControl}>
							<option>All unassigned (47)</option>
							<option>High priority only (12)</option>
							<option>Customer tickets (28)</option>
							<option>Merchant disputes (19)</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Assign To Team</label>
						<select className={s.formControl}>
							<option>Disputes Team</option>
							<option>Chargeback Specialists</option>
							<option>General Support</option>
							<option>Finance Team</option>
						</select>
					</div>
				</>,
				"Assign All",
				"47 tickets assigned to Disputes Team.",
				"",
			)}
			{renderSimple(
				"activityLogModal",
				<>
					<i className="bi bi-clock-history me-2" />
					Full Activity Log
				</>,
				<>
					<div
						className="table-responsive"
						style={{ maxHeight: 400, overflowY: "auto" }}
					>
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Time</th>
									<th>User</th>
									<th>Action</th>
									<th>Case</th>
									<th>Result</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td data-label="Time">14:45</td>
									<td data-label="User">Finance — Grace</td>
									<td data-label="Action">Refund approved</td>
									<td data-label="Case">RF-4421</td>
									<td data-label="Result">
										<span className={cx(s.badge, s.badgeS)}>Success</span>
									</td>
								</tr>
								<tr>
									<td data-label="Time">14:32</td>
									<td data-label="User">Merchant — XYZ</td>
									<td data-label="Action">Evidence uploaded</td>
									<td data-label="Case">CB-9912</td>
									<td data-label="Result">
										<span className={cx(s.badge, s.badgeS)}>Verified</span>
									</td>
								</tr>
								<tr>
									<td data-label="Time">14:18</td>
									<td data-label="User">Support — James</td>
									<td data-label="Action">Ticket assigned</td>
									<td data-label="Case">T-8821</td>
									<td data-label="Result">
										<span className={cx(s.badge, s.badgeI)}>Assigned</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
			)}
			{renderSimple(
				"profileModal",
				<>
					<i className="bi bi-person-circle me-2" />
					Profile
				</>,
				<div className="text-center">
					<div
						className={cx(s.avatar, "mx-auto mb-3")}
						style={{ width: 64, height: 64, fontSize: 24 }}
					>
						JK
					</div>
					<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
						james.kamau@paymo.co.ke
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Tickets Resolved</span>
								<br />
								<strong>1,284</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Avg Resolution</span>
								<br />
								<strong>18h</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">SLA Score</span>
								<br />
								<strong style={{ color: "var(--pm-accent)" }}>97.2%</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Team</span>
								<br />
								<strong>Support — Senior</strong>
							</div>
						</div>
					</div>
				</div>,
			)}
			{renderSimple(
				"attentionFullModal",
				<>
					<i className="bi bi-exclamation-circle text-warning me-2" />
					All Items Requiring Attention
				</>,
				<>
					<div className={s.statusRow}>
						<div>
							<strong>CB-9912 — Evidence due in 8h</strong>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm, s.btnPmD)}
							onClick={() => onOpen("chargebackModal")}
						>
							Respond
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>RF-4421 — Awaiting approval</strong>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("refundModal")}
						>
							Review
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>T-8821 — SLA breach risk (2h)</strong>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("ticketDetailModal")}
						>
							Open
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>RF-4408 & RF-4419 — Duplicate detected</strong>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("duplicateCheckModal")}
						>
							Investigate
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>CB-9908 — Network response pending</strong>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("chargebackModal")}
						>
							Track
						</button>
					</div>
				</>,
			)}
			{renderSimple(
				"emergencyEscalationModal",
				<>
					<i className="bi bi-exclamation-triangle me-2" />
					Emergency Escalation
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Case</label>
						<select className={s.formControl}>
							<option>CB-9912 — KES 124,000 fraud chargeback</option>
							<option>T-8821 — VIP customer delivery failure</option>
							<option>Multiple — Coordinated fraud pattern</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Escalate To</label>
						<select className={s.formControl}>
							<option>Executive Team</option>
							<option>Legal & Compliance</option>
							<option>CEO / CFO</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Emergency Notes</label>
						<textarea
							className={s.formControl}
							rows={3}
							defaultValue="Coordinated fraud pattern detected across 12 accounts."
						/>
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-danger-soft)", fontSize: 12 }}
					>
						<i className="bi bi-shield-exclamation me-1" /> This action will
						trigger 24/7 incident response protocol.
					</div>
				</>,
				"Trigger Escalation",
				"Emergency escalation triggered.",
				"INC-20250627-001",
			)}
			{renderSimple(
				"ticketNotifModal",
				<>
					<i className="bi bi-bell me-2" />
					Support Notifications (14)
				</>,
				<div style={{ maxHeight: 500, overflowY: "auto" }}>
					<div
						className="p-3 rounded mb-2"
						style={{ background: "var(--pm-danger-soft)", fontSize: 13 }}
					>
						<strong>CB-9912 evidence deadline in 8h</strong>
					</div>
					<div
						className="p-3 rounded mb-2"
						style={{ background: "var(--pm-warning-soft)", fontSize: 13 }}
					>
						<strong>T-8821 SLA breach risk (2h remaining)</strong>
					</div>
					<div
						className="p-3 rounded mb-2"
						style={{ background: "var(--pm-info-soft)", fontSize: 13 }}
					>
						<strong>RF-4421 approved by Finance</strong>
					</div>
					<div
						className="p-3 rounded mb-2"
						style={{ background: "var(--pm-accent-soft)", fontSize: 13 }}
					>
						<strong>5 new tickets assigned to your queue</strong>
					</div>
					<div
						className="p-3 rounded mb-2"
						style={{
							background: "#fff",
							border: "1px solid var(--pm-border)",
							fontSize: 13,
						}}
					>
						<strong>Weekly SLA report ready</strong>
					</div>
				</div>,
			)}
			{renderSimple(
				"disputeModal",
				<>
					<i className="bi bi-shield-exclamation text-warning me-2" />
					Dispute Management
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Dispute Type</label>
						<select className={s.formControl}>
							<option>Merchant Dispute</option>
							<option>Customer Dispute</option>
							<option>Network Dispute</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Case ID</label>
						<input className={s.formControl} defaultValue="DSP-2025-8821" />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Amount in Dispute</label>
						<input className={s.formControl} defaultValue="85,000" />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Description</label>
						<textarea
							className={s.formControl}
							rows={3}
							defaultValue="Merchant claims delivery but customer denies receipt. Awaiting evidence from both parties."
						/>
					</div>
				</>,
				"Submit Dispute",
				"Dispute filed and sent to resolution team.",
				"DSP-2025-8821",
			)}
			{renderSimple(
				"feeCalcModal",
				<>
					<i className="bi bi-calculator me-2" />
					Refund Fee Calculator
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Refund Amount</label>
						<input className={s.formControl} defaultValue="47800" />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Refund Method</label>
						<select className={s.formControl}>
							<option>M-Pesa (original)</option>
							<option>Bank Transfer</option>
							<option>PayMo Wallet</option>
						</select>
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span>Processing Fee</span>
							<strong>KES 0</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span>Network Fee</span>
							<strong>KES 25</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span style={{ fontWeight: 700 }}>Total Cost</span>
							<strong>KES 25</strong>
						</div>
					</div>
				</>,
			)}
			{renderSimple(
				"securityCheckModal",
				<>
					<i className="bi bi-shield-check me-2" />
					Security Verification
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Action</label>
						<select className={s.formControl}>
							<option>Approve high-value refund</option>
							<option>Release chargeback evidence</option>
							<option>Escalate to legal</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Enter 2FA Code</label>
						<div className="d-flex gap-2 justify-content-center">
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
						</div>
					</div>
				</>,
				"Authorize",
				"Action authorized and logged.",
				"SEC-20250627-8841",
			)}
			{renderSimple(
				"contactSupportModal",
				<>
					<i className="bi bi-headset me-2" />
					Contact Internal Support
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Department</label>
						<select className={s.formControl}>
							<option>Legal & Compliance</option>
							<option>Finance</option>
							<option>Technical Platform</option>
							<option>Executive Office</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Subject</label>
						<input
							className={s.formControl}
							defaultValue="Complex fraud pattern — executive escalation"
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Message</label>
						<textarea
							className={s.formControl}
							rows={4}
							defaultValue="Requesting immediate executive review of coordinated fraud pattern."
						/>
					</div>
				</>,
				"Send",
				"Message sent to Legal & Compliance.",
				"",
			)}
			{renderSimple(
				"caseExportModal",
				<>
					<i className="bi bi-download me-2" />
					Export Cases
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Report Type</label>
						<select className={s.formControl}>
							<option>All open cases</option>
							<option>Chargeback history</option>
							<option>Refund audit trail</option>
							<option>Full support log</option>
						</select>
					</div>
					<div className="row g-3 mb-3">
						<div className="col-6">
							<label className={s.formLabel}>From</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-01-01"
							/>
						</div>
						<div className="col-6">
							<label className={s.formLabel}>To</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-06-27"
							/>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Format</label>
						<select className={s.formControl}>
							<option>PDF</option>
							<option>Excel</option>
							<option>CSV</option>
						</select>
					</div>
				</>,
				"Export",
				"Report generated and downloading...",
				"",
			)}
			{renderSimple(
				"notifSettingsModal",
				<>
					<i className="bi bi-gear me-2" />
					Notification Preferences
				</>,
				<>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Alert Type</th>
									<th>Push</th>
									<th>Email</th>
									<th>SMS</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td data-label="Alert Type">SLA breach risk</td>
									<td data-label="Push">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td data-label="Email">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td data-label="SMS">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
								</tr>
								<tr>
									<td data-label="Alert Type">New high-priority ticket</td>
									<td data-label="Push">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td data-label="Email">
										<input type="checkbox" className="form-check-input" />
									</td>
									<td data-label="SMS">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
								</tr>
								<tr>
									<td data-label="Alert Type">Evidence deadline</td>
									<td data-label="Push">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td data-label="Email">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td data-label="SMS">
										<input type="checkbox" className="form-check-input" />
									</td>
								</tr>
								<tr>
									<td data-label="Alert Type">Refund approved</td>
									<td data-label="Push">
										<input type="checkbox" className="form-check-input" />
									</td>
									<td data-label="Email">
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td data-label="SMS">
										<input type="checkbox" className="form-check-input" />
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
				"Save",
				"Notification preferences saved.",
				"",
			)}
			{renderSimple(
				"refundFeeModal",
				<>
					<i className="bi bi-calculator me-2" />
					Refund Cost Calculator
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Refund Amount</label>
						<input className={s.formControl} defaultValue="47800" />
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span>Processing Fee</span>
							<strong>KES 0</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span style={{ fontWeight: 700 }}>Net Customer Receives</span>
							<strong>KES 47,800</strong>
						</div>
					</div>
				</>,
			)}
			{renderSimple(
				"chargebackFeeModal",
				<>
					<i className="bi bi-calculator me-2" />
					Chargeback Cost Calculator
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Chargeback Amount</label>
						<input className={s.formControl} defaultValue="124000" />
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span>Network Fee</span>
							<strong>KES 2,500</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span>Admin Fee</span>
							<strong>KES 1,000</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span style={{ fontWeight: 700 }}>Total Cost if Lost</span>
							<strong>KES 3,500</strong>
						</div>
					</div>
				</>,
			)}
			{renderSimple(
				"binLookupModal",
				<>
					<i className="bi bi-search me-2" />
					BIN Lookup
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Enter BIN (first 6-8 digits)</label>
						<input className={s.formControl} defaultValue="452167" />
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Network</span>
							<strong>Visa</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Type</span>
							<strong>Debit</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Issuer</span>
							<strong>PayMo Digital Bank</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span className="text-muted">Country</span>
							<strong>Kenya</strong>
						</div>
					</div>
				</>,
			)}
			{renderSimple(
				"contactMerchantModal",
				<>
					<i className="bi bi-building me-2" />
					Contact Merchant
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Merchant</label>
						<input className={s.formControl} defaultValue="Online Store XYZ" />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Channel</label>
						<select className={s.formControl}>
							<option>Email</option>
							<option>Portal Message</option>
							<option>Phone</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Message</label>
						<textarea
							className={s.formControl}
							rows={4}
							defaultValue="Dear Merchant, we have received a chargeback request for order #ORD-88291. Please provide delivery proof within 48 hours."
						/>
					</div>
				</>,
				"Send",
				"Message sent to Online Store XYZ.",
				"",
			)}
			{renderSimple(
				"refundSecurityModal",
				<>
					<i className="bi bi-shield-check me-2" />
					Security Verification — Refund
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Refund ID</label>
						<input className={s.formControl} defaultValue="RF-4421" />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Enter 2FA Code</label>
						<div className="d-flex gap-2 justify-content-center">
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
							<input
								type="password"
								maxLength={1}
								className={s.formControl}
								style={{
									width: 48,
									height: 56,
									textAlign: "center",
									fontSize: 24,
									fontWeight: 700,
								}}
							/>
						</div>
					</div>
				</>,
				"Authorize Refund",
				"Refund authorized.",
				"SEC-20250627-4421",
			)}
		</>
	);
}
