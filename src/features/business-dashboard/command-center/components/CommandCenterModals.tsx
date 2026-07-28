import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/command-center.module.css";

/* ============================================================================
   Business Command Center — modal layer (legacy page 3.1, 21 modals)
   REBUILT from original 3.1.html to retain 100% functionality and visuals.
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

/* ---------- modal shell ---------- */
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
			<div
				className={s.modalWrap}
				role="dialog"
				aria-modal="true"
				aria-label={id}
			>
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
			<p className={s.loadingLabel} style={{ marginTop: 12, fontWeight: 600 }}>
				Processing...
			</p>
		</div>
	);
}

export default function CommandCenterModals({
	active,
	onClose,
	onOpen,
}: ModalsProps) {
	const s = styles as Record<string, string>;
	const cx = (...cls: (string | false | undefined)[]) =>
		cls.filter(Boolean).join(" ");

	const [results, setResults] = useState<Record<string, { msg: string; ref?: string }>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({
		payroll: 1,
		transfer: 1,
		invite: 1,
	});
	const [tabs, setTabs] = useState<Record<string, string>>({
		bizSettings: "general",
		aging: "all",
		roleMatrix: "owner",
	});

	/* Reset state on close */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ payroll: 1, transfer: 1, invite: 1 });
			setBusy(null);
			setTabs({ bizSettings: "general", aging: "all", roleMatrix: "owner" });
		}
	}, [active]);

	const busyTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(busyTimer.current), []);

	const doAction = (modalId: string, msg: string, ref?: string) => {
		setBusy(modalId);
		busyTimer.current = window.setTimeout(() => {
			setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }));
			setBusy(null);
		}, 1200);
	};

	const nextFlow = (key: string, total: number, msg?: string, ref?: string) => {
		const cur = flows[key] ?? 1;
		if (cur >= total) {
			if (msg) doAction(`${key}Modal`, msg, ref);
			else onClose();
			return;
		}
		setFlows((prev) => ({ ...prev, [key]: cur + 1 }));
	};

	const switchTab = (prefix: string, key: string) => {
		setTabs((prev) => ({ ...prev, [prefix]: key }));
	};

	const renderReceipt = (res: { msg: string; ref?: string }) => (
		<div className="text-center p-4">
			<div
				className={cx(s.iconCircle, "mx-auto mb-3")}
				style={{
					width: 64,
					height: 64,
					fontSize: 28,
					background: "var(--pm-accent-soft)",
					color: "var(--pm-accent)",
				}}
			>
				<i className="bi bi-check-lg" />
			</div>
			<h5 style={{ fontWeight: 700 }}>{res.msg}</h5>
			{res.ref && (
				<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Ref: {res.ref}</p>
			)}
		</div>
	);

	const renderBody = (id: string, content: ReactNode) => {
		if (busy === id) return <BusyOverlay />;
		if (results[id]) return renderReceipt(results[id]);
		return content;
	};

	/* ==========================================================================
	 M1: New Invoice
	 ======================================================================== */
	const renderNewInvoice = () => (
		<MBox
			id="newInvoiceModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-receipt text-primary me-2" />
					Create Quick Invoice
				</>
			}
			footer={
				!results.newInvoiceModal && (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"newInvoiceModal",
									"Invoice #INV-2025-142 created & sent successfully!",
									"INV-2025-142",
								)
							}
						>
							Create Invoice
						</button>
					</>
				)
			}
		>
			{renderBody(
				"newInvoiceModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Customer</label>
						<select className={s.formControl}>
							<option>Acme Corp</option>
							<option>Global Industries</option>
							<option>+ Add New Customer</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Amount (KES)</label>
						<input
							type="number"
							className={s.formControl}
							defaultValue="150000"
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Description</label>
						<textarea
							className={s.formControl}
							rows={2}
							defaultValue="IT Consulting Services - October 2025"
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Due Date</label>
						<input
							type="date"
							className={s.formControl}
							defaultValue="2025-11-15"
						/>
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label">
							Send payment link via Email/SMS
						</label>
					</div>
				</>,
			)}
			{results.newInvoiceModal && (
				<div className={s.modalFooter}>
					<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
						Done
					</button>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
	 M2: Run Payroll
	 ======================================================================== */
	const renderRunPayroll = () => {
		const step = flows.payroll;
		const id = "runPayrollModal";
		return (
			<MBox
				id={id}
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-people text-success me-2" />
						Run & Approve Payroll
					</>
				}
				footer={
					!results[id] && (
						<>
							<button className={s.btnPm} onClick={onClose}>
								Cancel
							</button>
							<button
								className={cx(s.btnPm, s.btnPmP)}
								onClick={() =>
									nextFlow(
										"payroll",
										3,
										"Payroll executed successfully! KES 450,500 disbursed.",
										"PAY-10029",
									)
								}
							>
								{step === 3 ? (
									<>
										Approve & Execute <i className="bi bi-lock" />
									</>
								) : (
									<>
										Continue <i className="bi bi-arrow-right" />
									</>
								)}
							</button>
						</>
					)
				}
			>
				{renderBody(
					id,
					<>
						<div className={s.stepper}>
							{[1, 2, 3].map((n) => (
								<div
									key={n}
									className={cx(
										s.step,
										step === n && s.stepActive,
										step > n && s.stepDone,
									)}
								>
									<div className={s.stepN}>{step > n ? <i className="bi bi-check" /> : n}</div>
									<div className={s.stepL}>
										{n === 1 ? "Select" : n === 2 ? "Review" : "Approve"}
									</div>
								</div>
							))}
						</div>
						{step === 1 && (
							<div className={s.fstepActive}>
								<h6 style={{ fontWeight: 700 }}>Select Payroll Period</h6>
								<div className="row g-3 mt-1">
									<div className="col-md-6">
										<label className={s.formLabel}>Month</label>
										<select className={s.formControl}>
											<option>October 2025</option>
											<option>September 2025</option>
										</select>
									</div>
									<div className="col-md-6">
										<label className={s.formLabel}>Department / Group</label>
										<select className={s.formControl}>
											<option>All Employees (24)</option>
											<option>Management (4)</option>
											<option>Engineering (12)</option>
										</select>
									</div>
									<div className="col-12">
										<div
											className="p-3 border rounded"
											style={{ background: "var(--pm-surface-2)" }}
										>
											<div className="d-flex justify-content-between mb-2">
												<span>Gross Pay</span>
												<strong>KES 620,000</strong>
											</div>
											<div className="d-flex justify-content-between mb-2">
												<span className="text-danger">PAYE & Statutory</span>
												<strong className="text-danger">- KES 169,500</strong>
											</div>
											<hr className={s.divider} />
											<div className="d-flex justify-content-between">
												<span style={{ fontWeight: 700 }}>Net Disbursement</span>
												<strong style={{ color: "var(--pm-success)" }}>
													KES 450,500
												</strong>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
						{step === 2 && (
							<div className={s.fstepActive}>
								<h6 style={{ fontWeight: 700 }}>Review Discrepancies</h6>
								<div
									className="p-3 rounded mb-3"
									style={{
										background: "var(--pm-warning-soft)",
										fontSize: 13,
									}}
								>
									<i className="bi bi-exclamation-triangle" /> 1 employee banking
									detail missing. They will be paid via M-Pesa.
								</div>
								<div className="table-responsive">
									<table className={s.tbl}>
										<thead>
											<tr>
												<th>Employee</th>
												<th>Gross</th>
												<th>Net</th>
												<th>Method</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>James K.</td>
												<td>120,000</td>
												<td>86,400</td>
												<td>Bank Transfer</td>
											</tr>
											<tr>
												<td>Grace M.</td>
												<td>95,000</td>
												<td>71,200</td>
												<td>Bank Transfer</td>
											</tr>
											<tr>
												<td>David O.</td>
												<td>60,000</td>
												<td>48,500</td>
												<td>M-Pesa B2C</td>
											</tr>
											<tr>
												<td colSpan={4} className="text-center text-muted">
													... 21 more rows
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						)}
						{step === 3 && (
							<div className={s.fstepActive}>
								<h6 style={{ fontWeight: 700 }}>Authorize Execution</h6>
								<div
									className="p-3 rounded mb-3"
									style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
								>
									Authorization required for <strong>KES 450,500</strong>{" "}
									disbursement to 24 employees. Funds will be deducted from
									TechSolutions Ltd main wallet.
								</div>
								<label className="formLabel text-center d-block">
									Enter your Director PIN
								</label>
								<div className={cx(s.pinRow, "mt-2")}>
									<input type="password" maxLength={1} />
									<input type="password" maxLength={1} />
									<input type="password" maxlength={1} />
									<input type="password" maxlength={1} />
								</div>
								<div className="form-check mt-4 text-center d-flex justify-content-center">
									<input
										className="form-check-input me-2"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label" style={{ fontSize: 12 }}>
										Auto-file KRA P10, NSSF, and SHIF returns
									</label>
								</div>
							</div>
						)}
					</>,
				)}
				{results[id] && (
					<div className={s.modalFooter}>
						<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
							Done
						</button>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
	 M3: Inter-Company Transfer
	 ======================================================================== */
	const renderInterCompanyTransfer = () => {
		const step = flows.transfer;
		const id = "interCompanyTransferModal";
		return (
			<MBox
				id={id}
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-arrow-left-right text-purple me-2" />
						Inter-Company Fund Transfer
					</>
				}
				footer={
					!results[id] && (
						<>
							<button className={s.btnPm} onClick={onClose}>
								Cancel
							</button>
							<button
								className={cx(s.btnPm, s.btnPmP)}
								onClick={() =>
									nextFlow(
										"transfer",
										3,
										"Transfer of KES 500,000 completed instantly.",
										"TRF-59001",
									)
								}
							>
								{step === 3 ? "Authorize <i class=\"bi bi-lock\"></i>" : "Continue"}
							</button>
						</>
					)
				}
			>
				{renderBody(
					id,
					<>
						<div className={s.stepper}>
							{[1, 2, 3].map((n) => (
								<div
									key={n}
									className={cx(
										s.step,
										step === n && s.stepActive,
										step > n && s.stepDone,
									)}
								>
									<div className={s.stepN}>{step > n ? <i className="bi bi-check" /> : n}</div>
									<div className={s.stepL}>
										{n === 1 ? "Details" : n === 2 ? "Review" : "Authorize"}
									</div>
								</div>
							))}
						</div>
						{step === 1 && (
							<div className={s.fstepActive}>
								<div className="mb-3">
									<label className={s.formLabel}>From Account (Debit)</label>
									<select className={s.formControl}>
										<option>TechSolutions Ltd (KES 2.45M)</option>
										<option>TS Logistics (KES 8.10M)</option>
									</select>
								</div>
								<div className="mb-3">
									<label className={s.formLabel}>To Account (Credit)</label>
									<select className={s.formControl}>
										<option>TS Logistics & Delivery</option>
										<option>TechSolutions Foundation</option>
									</select>
								</div>
								<div className="mb-3">
									<label className={s.formLabel}>Amount to Transfer (KES)</label>
									<input
										type="number"
										className={s.formControl}
										defaultValue="500000"
									/>
								</div>
							</div>
						)}
						{step === 2 && (
							<div className={s.fstepActive}>
								<h6 style={{ fontWeight: 700 }}>Confirm Transfer</h6>
								<div
									className="p-3 border rounded"
									style={{ background: "var(--pm-surface-2)" }}
								>
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted">Source</span>
										<strong>TechSolutions Ltd</strong>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted">Destination</span>
										<strong>TS Logistics & Delivery</strong>
									</div>
									<hr className={s.divider} />
									<div className="d-flex justify-content-between">
										<span className="text-muted">Transfer Amount</span>
										<strong style={{ color: "var(--pm-primary)" }}>
											KES 500,000.00
										</strong>
									</div>
								</div>
							</div>
						)}
						{step === 3 && (
							<div className={s.fstepActive}>
								<div
									className="p-3 rounded mb-3"
									style={{ background: "var(--pm-warning-soft)", fontSize: 13 }}
								>
									Confirm authorization for <strong>KES 500,000</strong> internal
									transfer. This action is processed instantly.
								</div>
								<label className="formLabel text-center d-block">
									Enter Director PIN
								</label>
								<div className={cx(s.pinRow, "mt-2")}>
									<input type="password" maxLength={1} />
									<input type="password" maxLength={1} />
									<input type="password" maxlength={1} />
									<input type="password" maxlength={1} />
								</div>
							</div>
						)}
					</>,
				)}
				{results[id] && (
					<div className={s.modalFooter}>
						<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
							Done
						</button>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
	 M4: Invite User
	 ======================================================================== */
	const renderInviteUser = () => {
		const step = flows.invite;
		const id = "inviteUserModal";
		return (
			<MBox
				id={id}
				active={active}
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-plus text-warning me-2" />
						Invite New Team Member
					</>
				}
				footer={
					!results[id] && (
						<>
							<button className={s.btnPm} onClick={onClose}>
								Cancel
							</button>
							<button
								className={cx(s.btnPm, s.btnPmP)}
								onClick={() =>
									nextFlow(
										"invite",
										3,
										"Invitation sent! They will receive an email to set up MFA.",
									)
								}
							>
								{step === 3 ? "Send Invite <i class=\"bi bi-envelope\"></i>" : "Continue"}
							</button>
						</>
					)
				}
			>
				{renderBody(
					id,
					<>
						<div className={s.stepper}>
							{[1, 2, 3].map((n) => (
								<div
									key={n}
									className={cx(
										s.step,
										step === n && s.stepActive,
										step > n && s.stepDone,
									)}
								>
									<div className={s.stepN}>{step > n ? <i className="bi bi-check" /> : n}</div>
									<div className={s.stepL}>
										{n === 1 ? "Details" : n === 2 ? "Role" : "Limits"}
									</div>
								</div>
							))}
						</div>
						{step === 1 && (
							<div className={s.fstepActive}>
								<div className="mb-3">
									<label className={s.formLabel}>Full Name</label>
									<input
										className={s.formControl}
										placeholder="e.g. John Doe"
									/>
								</div>
								<div className="mb-3">
									<label className={s.formLabel}>Work Email</label>
									<input
										type="email"
										className={s.formControl}
										placeholder="john@company.com"
									/>
								</div>
								<div className="mb-3">
									<label className={s.formLabel}>Department</label>
									<select className={s.formControl}>
										<option>Finance</option>
										<option>Operations</option>
										<option>Sales / Invoicing</option>
										<option>Human Resources</option>
									</select>
								</div>
							</div>
						)}
						{step === 2 && (
							<div className={s.fstepActive}>
								<h6 style={{ fontWeight: 700 }}>Assign User Role</h6>
								<div className="p-3 border rounded mb-2">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="userRole"
											defaultChecked
										/>
										<label className="form-check-label">
											<strong>Admin</strong> - Full access to all features
										</label>
									</div>
								</div>
								<div className="p-3 border rounded mb-2">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="userRole"
										/>
										<label className="form-check-label">
											<strong>Maker / Finance</strong> - Create payments but cannot
											approve
										</label>
									</div>
								</div>
								<div className="p-3 border rounded">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="userRole"
										/>
										<label className="form-check-label">
											<strong>Viewer</strong> - Read-only access to reports
										</label>
									</div>
								</div>
							</div>
						)}
						{step === 3 && (
							<div className={s.fstepActive}>
								<h6 style={{ fontWeight: 700 }}>Set Approval Limits</h6>
								<div className="mb-3">
									<label className={s.formLabel}>Daily Limit (KES)</label>
									<input
										type="number"
										className={s.formControl}
										defaultValue="500000"
									/>
								</div>
								<div className="form-check">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Require MFA for all logins
									</label>
								</div>
							</div>
						)}
					</>,
				)}
				{results[id] && (
					<div className={s.modalFooter}>
						<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
							Done
						</button>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
	 M5: KYB Upload
	 ======================================================================== */
	const renderKybUpload = () => (
		<MBox
			id="kybUploadModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-check text-secondary me-2" />
					KYB Document Upload
				</>
			}
			footer={
				!results.kybUploadModal && (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"kybUploadModal",
									"Document uploaded and sent for verification.",
									"KYB-99120",
								)
							}
						>
							Submit for Verification
						</button>
					</>
				)
			}
		>
			{renderBody(
				"kybUploadModal",
				<>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-danger-soft)", fontSize: 13 }}
					>
						<i className="bi bi-exclamation-triangle"></i> Missing Annual
						Returns (CR12). Limit restrictions will apply in 5 days.
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Document Type</label>
						<select className={s.formControl}>
							<option>CR12 / Annual Returns</option>
							<option>Business Permit (2025)</option>
							<option>VAT / Tax Compliance Certificate</option>
						</select>
					</div>
					<div className={s.uploadZone}>
						<i
							className="bi bi-cloud-arrow-up"
							style={{ fontSize: 32, color: "var(--pm-primary)" }}
						/>
						<div style={{ fontWeight: 600, marginTop: 8 }}>
							Click to browse or drag file here
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							PDF, JPG, PNG (Max 5MB)
						</div>
					</div>
				</>,
			)}
			{results.kybUploadModal && (
				<div className={s.modalFooter}>
					<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
						Done
					</button>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
	 M6: Business Settings
	 ======================================================================== */
	const renderBusinessSettings = () => {
		const tab = tabs.bizSettings;
		const id = "businessSettingsModal";
		return (
			<MBox
				id={id}
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-gear me-2" />
						Business Settings
					</>
				}
				footer={
					!results[id] && (
						<>
							<button className={s.btnPm} onClick={onClose}>
								Close
							</button>
							<button
								className={cx(s.btnPm, s.btnPmP)}
								onClick={() =>
									doAction(id, "Settings updated successfully!")
								}
							>
								Save Changes
							</button>
						</>
					)
				}
			>
				{renderBody(
					id,
					<>
						<div className={s.pills}>
							<button
								className={cx(s.pill, tab === "general" && s.pillActive)}
								onClick={() => switchTab("bizSettings", "general")}
							>
								General
							</button>
							<button
								className={cx(s.pill, tab === "address" && s.pillActive)}
								onClick={() => switchTab("bizSettings", "address")}
							>
								Address & Contacts
							</button>
							<button
								className={cx(s.pill, tab === "signatories" && s.pillActive)}
								onClick={() => switchTab("bizSettings", "signatories")}
							>
								Signatories
							</button>
						</div>
						{tab === "general" && (
							<div className="row g-3 mt-2">
								<div className="col-md-6">
									<label className={s.formLabel}>Trading Name</label>
									<input
										type="text"
										className={s.formControl}
										defaultValue="TechSolutions Ltd"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Industry Sector</label>
									<select className={s.formControl}>
										<option>Information Technology</option>
										<option>Retail</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Support Email</label>
									<input
										type="email"
										className={s.formControl}
										defaultValue="support@techsol.co.ke"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>Support Phone</label>
									<input
										type="text"
										className={s.formControl}
										defaultValue="+254 700 000 000"
									/>
								</div>
							</div>
						)}
						{tab === "address" && (
							<div className="row g-3 mt-2">
								<div className="col-md-12">
									<label className={s.formLabel}>Physical Address</label>
									<input
										className={s.formControl}
										defaultValue="123 Westlands Road, Nairobi"
									/>
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>City / Town</label>
									<input className={s.formControl} defaultValue="Nairobi" />
								</div>
								<div className="col-md-6">
									<label className={s.formLabel}>KRA PIN</label>
									<input
										className={s.formControl}
										defaultValue="P051234567M"
										disabled
									/>
								</div>
							</div>
						)}
						{tab === "signatories" && (
							<div className="mt-2">
								<div className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center">
									<div>
										<strong>Amina D.</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Director · Primary Signatory
										</div>
									</div>
									<span className={cx(s.badge, s.badgeS)}>Verified</span>
								</div>
								<button className={cx(s.btnPm, s.btnSm)}>
									<i className="bi bi-plus-lg" /> Add Signatory
								</button>
							</div>
						)}
					</>,
				)}
				{results[id] && (
					<div className={s.modalFooter}>
						<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
							Done
						</button>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
	 M7: Switch Business
	 ======================================================================== */
	const renderSwitchBusiness = () => (
		<MBox
			id="switchBusinessModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-diagram-3 me-2" />
					Switch Business Account
				</>
			}
		>
			<div className={cx(s.headerSearch, "mb-3")} style={{ maxWidth: "100%" }}>
				<i className="bi bi-search" />
				<input type="text" placeholder="Search businesses..." />
			</div>
			<div
				className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center"
				style={{
					borderColor: "var(--pm-primary)",
					background: "rgba(79,70,229,.04)",
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<div className={s.avatar}>TS</div>
					<div>
						<div style={{ fontWeight: 600, fontSize: 14 }}>
							TechSolutions Ltd
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							Owner · Current
						</div>
					</div>
				</div>
				<i className="bi bi-check-circle-fill text-primary" />
			</div>
			<div
				className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() =>
					doAction("switchBusinessModal", "Switched to TS Logistics!")
				}
			>
				<div className="d-flex align-items-center gap-2">
					<div className={s.avatar} style={{ background: "var(--pm-danger)" }}>
						TL
					</div>
					<div>
						<div style={{ fontWeight: 600, fontSize: 14 }}>
							TS Logistics & Delivery
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Owner</div>
					</div>
				</div>
			</div>
			<div
				className="p-3 border rounded d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() =>
					doAction("switchBusinessModal", "Switched to Foundation!")
				}
			>
				<div className="d-flex align-items-center gap-2">
					<div className={s.avatar} style={{ background: "var(--pm-info)" }}>
						TF
					</div>
					<div>
						<div style={{ fontWeight: 600, fontSize: 14 }}>
							TechSolutions Foundation
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Admin</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M8: Cash Flow Details
	 ======================================================================== */
	const renderCashFlow = () => (
		<MBox
			id="cashFlowDetailsModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bank me-2" />
					Cash Position & Liquidity
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="row g-3">
				<div className="col-md-6">
					<div className="p-3 border rounded h-100">
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							PAYMO BUSINESS WALLET
						</div>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-primary)",
							}}
						>
							KES 2,450,000
						</div>
						<button
							className={cx(s.btnPm, s.btnSm, "mt-2 w-100")}
							onClick={() => onOpen("interCompanyTransferModal")}
						>
							Transfer Funds
						</button>
					</div>
				</div>
				<div className="col-md-6">
					<div className="p-3 border rounded h-100">
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							LINKED ACCOUNTS (EQUITY BANK)
						</div>
						<div style={{ fontSize: 24, fontWeight: 700 }}>KES 8,120,500</div>
						<button
							className={cx(s.btnPm, s.btnSm, "mt-2 w-100")}
							onClick={() => onOpen("connectBankModal")}
						>
							Manage Connections
						</button>
					</div>
				</div>
			</div>
			<h6 style={{ fontWeight: 700, marginTop: 20 }}>
				Pending Settlements (T+1)
			</h6>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Source</th>
							<th>Amount</th>
							<th>Expected Date</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td data-label="Source">M-Pesa Till (Buy Goods)</td>
							<td data-label="Amount">KES 450,000</td>
							<td data-label="Expected Date">Tomorrow, 8:00 AM</td>
						</tr>
						<tr>
							<td data-label="Source">Visa/Mastercard Gateway</td>
							<td data-label="Amount">KES 400,000</td>
							<td data-label="Expected Date">Tomorrow, 2:00 PM</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M9: Aging Invoices
	 ======================================================================== */
	const renderAgingInvoices = () => {
		const tab = tabs.aging;
		const id = "agingInvoicesModal";
		return (
			<MBox
				id={id}
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-receipt me-2" />
						Outstanding Invoices (Aging Report)
					</>
				}
				footer={
					!results[id] && (
						<>
							<button className={s.btnPm} onClick={onClose}>
								Close
							</button>
							<button
								className={cx(s.btnPm, s.btnPmP)}
								onClick={() =>
									doAction(
										id,
										"Reminders sent to all overdue customers via Email & SMS.",
									)
								}
							>
								<i className="bi bi-envelope-check" /> Send Batch Reminders
							</button>
						</>
					)
				}
			>
				{renderBody(
					id,
					<>
						<div className={s.pills}>
							<button
								className={cx(s.pill, tab === "all" && s.pillActive)}
								onClick={() => switchTab("aging", "all")}
							>
								All (750K)
							</button>
							<button
								className={cx(s.pill, tab === "0-30" && s.pillActive)}
								onClick={() => switchTab("aging", "0-30")}
							>
								0-30 Days (420K)
							</button>
							<button
								className={cx(s.pill, tab === "31-60" && s.pillActive)}
								onClick={() => switchTab("aging", "31-60")}
							>
								31-60 Days (185K)
							</button>
							<button
								className={cx(s.pill, tab === "61+" && s.pillActive)}
								style={{ color: "var(--pm-danger)" }}
								onClick={() => switchTab("aging", "61+")}
							>
								61-90+ Days (145K)
							</button>
						</div>
						<div className="table-responsive mt-3">
							<table className={s.tbl}>
								<thead>
									<tr>
										<th>Invoice</th>
										<th>Customer</th>
										<th>Amount</th>
										<th>Days Overdue</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>INV-2025-081</td>
										<td>Acme Corp</td>
										<td>KES 85,000</td>
										<td>
											<span className={cx(s.badge, s.badgeD)}>72 days</span>
										</td>
										<td>
											<button className={cx(s.btnPm, s.btnSm)}>Remind</button>
										</td>
									</tr>
									<tr>
										<td>INV-2025-084</td>
										<td>Global Industries</td>
										<td>KES 60,000</td>
										<td>
											<span className={cx(s.badge, s.badgeD)}>65 days</span>
										</td>
										<td>
											<button className={cx(s.btnPm, s.btnSm)}>Remind</button>
										</td>
									</tr>
									<tr>
										<td>INV-2025-092</td>
										<td>StartUp Inc</td>
										<td>KES 185,000</td>
										<td>
											<span className={cx(s.badge, s.badgeW)}>45 days</span>
										</td>
										<td>
											<button className={cx(s.btnPm, s.btnSm)}>Remind</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</>,
				)}
				{results[id] && (
					<div className={s.modalFooter}>
						<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
							Done
						</button>
					</div>
				)}
			</MBox>
		);
	};

	/* ==========================================================================
	 M10: View User
	 ======================================================================== */
	const renderViewUser = () => (
		<MBox
			id="viewUserModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-person me-2" />
					Edit User: Peter K.
				</>
			}
			footer={
				!results.viewUserModal && (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => doAction("viewUserModal", "User settings updated!")}
						>
							Save
						</button>
					</>
				)
			}
		>
			{renderBody(
				"viewUserModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Role</label>
						<select className={s.formControl}>
							<option>Admin</option>
							<option selected>Finance Admin</option>
							<option>HR Manager</option>
							<option>Viewer</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Approval Limit (KES)</label>
						<input
							type="number"
							className={s.formControl}
							defaultValue="1000000"
						/>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label">MFA Enforced</label>
					</div>
					<div className="form-check">
						<input className="form-check-input" type="checkbox" />
						<label className="form-check-label text-danger">
							Suspend Account
						</label>
					</div>
				</>,
			)}
			{results.viewUserModal && (
				<div className={s.modalFooter}>
					<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
						Done
					</button>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
	 M11: Disburse Funds
	 ======================================================================== */
	const renderDisburseFunds = () => (
		<MBox
			id="disburseFundsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-send text-info me-2" />
					Disburse Funds
				</>
			}
			footer={
				!results.disburseFundsModal && (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"disburseFundsModal",
									"Disbursement initiated! Ref: DSP-44829",
									"DSP-44829",
								)
							}
						>
							Disburse
						</button>
					</>
				)
			}
		>
			{renderBody(
				"disburseFundsModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Disbursement Type</label>
						<select className={s.formControl}>
							<option>Single Vendor Payment</option>
							<option>Bulk CSV Upload (M-Pesa B2C)</option>
							<option>Expense Reimbursement</option>
						</select>
					</div>
					<div className="p-3 border rounded text-center mb-3">
						<i
							className="bi bi-file-earmark-excel mb-2"
							style={{ fontSize: 24, color: "var(--pm-accent)" }}
						/>
						<br />
						<strong>Upload Beneficiary CSV</strong>
						<br />
						<span style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							Format: Name, Phone, Account, Amount
						</span>
					</div>
				</>,
			)}
			{results.disburseFundsModal && (
				<div className={s.modalFooter}>
					<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
						Done
					</button>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
	 M12: Pending Approvals
	 ======================================================================== */
	const renderPendingApprovals = () => (
		<MBox
			id="pendingApprovalsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-exclamation-circle text-warning me-2" />
					Pending Approvals
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={s.feedItem}>
				<div
					className={s.iconCircle}
					style={{
						background: "var(--pm-warning-soft)",
						color: "var(--pm-warning)",
					}}
				>
					<i className="bi bi-people" />
				</div>
				<div style={{ flex: 1 }}>
					<strong>Payroll Run: October 2025</strong>
					<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
						KES 450,500 · 24 Employees
					</div>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("runPayrollModal")}
				>
					Approve
				</button>
			</div>
			<div className={s.feedItem}>
				<div
					className={s.iconCircle}
					style={{ background: "var(--pm-info-soft)", color: "var(--pm-info)" }}
				>
					<i className="bi bi-receipt" />
				</div>
				<div style={{ flex: 1 }}>
					<strong>Invoice INV-2025-104</strong>
					<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
						KES 420,000 · Retail Chain A
					</div>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("agingInvoicesModal")}
				>
					View
				</button>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M13: Consolidated Report
	 ======================================================================== */
	const renderConsolidatedReport = () => (
		<MBox
			id="consolidatedReportModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-bar-graph me-2" />
					Export Business Reports
				</>
			}
			footer={
				!results.consolidatedReportModal && (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"consolidatedReportModal",
									"Report generated and downloaded.",
								)
							}
						>
							Download
						</button>
					</>
				)
			}
		>
			{renderBody(
				"consolidatedReportModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Report Type</label>
						<select className={s.formControl}>
							<option>Consolidated Cash Flow</option>
							<option>Group Revenue Summary</option>
							<option>Payroll Audit Trail</option>
							<option>Tax / Statutory Deductions</option>
						</select>
					</div>
					<div className="row g-2 mb-3">
						<div className="col-6">
							<label className={s.formLabel}>From</label>
							<input type="date" className={s.formControl} />
						</div>
						<div className="col-6">
							<label className={s.formLabel}>To</label>
							<input type="date" className={s.formControl} />
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Format</label>
						<select className={s.formControl}>
							<option>PDF</option>
							<option>Excel</option>
						</select>
					</div>
				</>,
			)}
			{results.consolidatedReportModal && (
				<div className={s.modalFooter}>
					<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
						Done
					</button>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
	 M14: Notifications
	 ======================================================================== */
	const renderNotifications = () => (
		<MBox
			id="notificationsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bell me-2" />
					Business Alerts
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div
				className="modal-body"
				style={{ maxHeight: 400, overflowY: "auto", padding: 0 }}
			>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-warning-soft)", fontSize: 13 }}
				>
					<strong>Payroll Approval Required</strong>
					<br />
					Sarah W. initiated Oct Payroll.{" "}
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							onOpen("runPayrollModal");
						}}
					>
						Review
					</a>
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-danger-soft)", fontSize: 13 }}
				>
					<strong>KYB Expiring</strong>
					<br />
					Annual returns due in 5 days.{" "}
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							onOpen("kybUploadModal");
						}}
					>
						Upload
					</a>
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-info-soft)", fontSize: 13 }}
				>
					<strong>Settlement Completed</strong>
					<br />
					KES 850K settled to Equity Bank.
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{
						background: "var(--pm-surface-2)",
						border: "1px solid var(--pm-border)",
						fontSize: 13,
					}}
				>
					<strong>New User Invite Accepted</strong>
					<br />
					John M. joined as Sales.
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M15: Role Permissions Matrix
	 ======================================================================== */
	const renderRolePermissions = () => (
		<MBox
			id="rolePermissionsModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-lock me-2" />
					Role Permissions Matrix
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="table-responsive">
				<table className={cx(s.tbl, "text-center")}>
					<thead>
						<tr>
							<th className="text-start">Feature</th>
							<th>Owner</th>
							<th>Admin</th>
							<th>Fin/HR</th>
							<th>Sales</th>
							<th>Viewer</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="text-start">Multi-Business Toggle</td>
							<td>✅</td>
							<td>❌</td>
							<td>❌</td>
							<td>❌</td>
							<td>❌</td>
						</tr>
						<tr>
							<td className="text-start">Manage Team</td>
							<td>✅</td>
							<td>✅</td>
							<td>❌</td>
							<td>❌</td>
							<td>❌</td>
						</tr>
						<tr>
							<td className="text-start">Approve Payroll</td>
							<td>✅</td>
							<td>✅</td>
							<td>❌</td>
							<td>❌</td>
							<td>❌</td>
						</tr>
						<tr>
							<td className="text-start">Initiate Payments</td>
							<td>✅</td>
							<td>✅</td>
							<td>✅</td>
							<td>❌</td>
							<td>❌</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M16: Health Check
	 ======================================================================== */
	const renderHealthCheck = () => (
		<MBox
			id="healthCheckModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-activity text-success me-2" />
					Business Health Audit
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="text-center mb-4">
				<div
					className={s.sv}
					style={{ fontSize: 42, color: "var(--pm-primary)" }}
				>
					92/100
				</div>
				<div style={{ fontWeight: 600, color: "var(--pm-muted)" }}>
					Good Health Score
				</div>
			</div>
			<div
				className="p-3 rounded mb-2 d-flex justify-content-between align-items-center"
				style={{ background: "var(--pm-surface-2)" }}
			>
				<span>KYC/KYB Compliance</span>
				<span className={cx(s.badge, s.badgeS)}>Verified</span>
			</div>
			<div
				className="p-3 rounded mb-2 d-flex justify-content-between align-items-center"
				style={{ background: "var(--pm-surface-2)" }}
			>
				<span>Tax Compliance</span>
				<span className={cx(s.badge, s.badgeS)}>Active</span>
			</div>
			<div
				className="p-3 rounded d-flex justify-content-between align-items-center"
				style={{ background: "var(--pm-surface-2)" }}
			>
				<span>MFA Enforcement</span>
				<span className={cx(s.badge, s.badgeS)}>Enforced</span>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M17: Revenue Details
	 ======================================================================== */
	const renderRevenueDetails = () => (
		<MBox
			id="revenueDetailsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-graph-up text-primary me-2" />
					Revenue Breakdown
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={cx(s.sv, "text-center mb-4")}>KES 1.82M</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Source</th>
							<th>Amount</th>
							<th>% of Total</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Invoices Paid</td>
							<td>KES 1.20M</td>
							<td>66%</td>
						</tr>
						<tr>
							<td>M-Pesa Till (Walk-in)</td>
							<td>KES 420K</td>
							<td>23%</td>
						</tr>
						<tr>
							<td>Payment Links</td>
							<td>KES 200K</td>
							<td>11%</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M18: Expense Details
	 ======================================================================== */
	const renderExpenseDetails = () => (
		<MBox
			id="expenseDetailsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-graph-down text-danger me-2" />
					Expense Breakdown
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={cx(s.sv, "text-center mb-4 text-danger")}>KES 940K</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Category</th>
							<th>Amount</th>
							<th>% of Total</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Payroll & Salaries</td>
							<td>KES 450K</td>
							<td>48%</td>
						</tr>
						<tr>
							<td>Supplier Payments</td>
							<td>KES 320K</td>
							<td>34%</td>
						</tr>
						<tr>
							<td>KRA Taxes & Levies</td>
							<td>KES 120K</td>
							<td>13%</td>
						</tr>
						<tr>
							<td>Other OpEx</td>
							<td>KES 50K</td>
							<td>5%</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M19: Collection Target
	 ======================================================================== */
	const renderCollectionTarget = () => (
		<MBox
			id="collectionTargetModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-sliders text-primary me-2" />
					Edit Collection Targets
				</>
			}
			footer={
				!results.collectionTargetModal && (
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() =>
								doAction(
									"collectionTargetModal",
									"Monthly targets updated successfully!",
								)
							}
						>
							Save Targets
						</button>
					</>
				)
			}
		>
			{renderBody(
				"collectionTargetModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Target Month</label>
						<select className={s.formControl}>
							<option>November 2025</option>
							<option>December 2025</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Gross Revenue Target (KES)</label>
						<input
							type="number"
							className={s.formControl}
							defaultValue="2500000"
						/>
					</div>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
					>
						Setting targets updates the dashboard charts for the entire team to
						track progress.
					</div>
				</>,
			)}
			{results.collectionTargetModal && (
				<div className={s.modalFooter}>
					<button className={cx(s.btnPm, s.btnPmP)} onClick={onClose}>
						Done
					</button>
				</div>
			)}
		</MBox>
	);

	/* ==========================================================================
	 M20: Business Profile
	 ======================================================================== */
	const renderBusinessProfile = () => (
		<MBox
			id="businessProfileModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-person-badge text-primary me-2" />
					My Profile
				</>
			}
			footer={
				<button className={cx(s.btnPm, s.btnPmD, "w-100")} onClick={onClose}>
					Log Out
				</button>
			}
		>
			<div className="text-center">
				<div
					className={cx(s.avatar, "mx-auto mb-3")}
					style={{
						width: 64,
						height: 64,
						fontSize: 24,
						background: "var(--pm-primary)",
					}}
				>
					AD
				</div>
				<h4 style={{ fontWeight: 700, marginBottom: 4 }}>Amina D.</h4>
				<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
					Director (Admin) · TechSolutions Ltd
				</p>
				<div className="p-3 border rounded text-start mt-3">
					<div
						className="d-flex justify-content-between mb-2"
						style={{ fontSize: 13 }}
					>
						<span className="text-muted">Approval Limit</span>
						<strong>Unlimited</strong>
					</div>
					<div
						className="d-flex justify-content-between mb-2"
						style={{ fontSize: 13 }}
					>
						<span className="text-muted">Security</span>
						<span className={cx(s.badge, s.badgeS)}>MFA Active</span>
					</div>
					<div
						className="d-flex justify-content-between"
						style={{ fontSize: 13 }}
					>
						<span className="text-muted">Connected Entities</span>
						<strong>3 Businesses</strong>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* ==========================================================================
	 M21: Connect Bank
	 ======================================================================== */
	const renderConnectBank = () => (
		<MBox
			id="connectBankModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bank2 text-primary me-2" />
					Connect Bank Account
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div
				className="p-3 border rounded mb-3 d-flex justify-content-between align-items-center"
				style={{
					borderColor: "var(--pm-primary)",
					background: "rgba(79,70,229,.04)",
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<div
						className={s.iconCircle}
						style={{
							background: "var(--pm-info-soft)",
							color: "var(--pm-info)",
						}}
					>
						<i className="bi bi-building" />
					</div>
					<div>
						<strong>Equity Bank</strong>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
							****4521 · Connected
						</div>
					</div>
				</div>
				<i className="bi bi-check-circle-fill text-primary" />
			</div>
			<button
				className={cx(s.btnPm, s.btnSm, "w-100")}
				onClick={() =>
					doAction("connectBankModal", "Bank account connection initiated.")
				}
			>
				<i className="bi bi-plus-lg" /> Add New Bank Account
			</button>
		</MBox>
	);

	return (
		<>
			{renderNewInvoice()}
			{renderRunPayroll()}
			{renderInterCompanyTransfer()}
			{renderInviteUser()}
			{renderKybUpload()}
			{renderBusinessSettings()}
			{renderSwitchBusiness()}
			{renderCashFlow()}
			{renderAgingInvoices()}
			{renderViewUser()}
			{renderDisburseFunds()}
			{renderPendingApprovals()}
			{renderConsolidatedReport()}
			{renderNotifications()}
			{renderRolePermissions()}
			{renderHealthCheck()}
			{renderRevenueDetails()}
			{renderExpenseDetails()}
			{renderCollectionTarget()}
			{renderBusinessProfile()}
			{renderConnectBank()}
		</>
	);
}
