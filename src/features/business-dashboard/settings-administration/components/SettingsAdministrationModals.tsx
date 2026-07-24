import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/settings-administration.module.css";

/* ============================================================================
   Settings, Account & Administration — modal layer (legacy page 3.14)
   ========================================================================== */

/**
 * Badge tone keys resolved against the CSS module (`s[tone]`). Mirrors the
 * BadgeTone union in ../pages/SettingsAdministration, plus '' for rows that
 * intentionally render no badge (e.g. not-yet-connected integrations).
 */
type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP" | "";

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
	kyc: { labels: ["Type", "Upload", "Done"] },
	invite: { labels: ["Details", "Permissions", "Done"] },
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
				const lineStyle: React.CSSProperties = {
					position: "absolute",
					top: 14,
					left: "-50%",
					width: "100%",
				};
				if (done) lineStyle.background = "var(--pm-accent)";
				return (
					<div
						key={label}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
							position: "relative",
							zIndex: 2,
						}}
					>
						{i > 0 && <div className={s.stepLine} style={lineStyle} />}
						<div
							className={`${s.step} ${done ? s.stepDone : ""} ${isActive ? s.stepActive : ""}`}
						>
							<div className={s.stepN}>
								{done ? <i className="bi bi-check" /> : stepNum}
							</div>
							<div className={s.stepL}>{label}</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default function SettingsAdministrationModals({
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
		kyc: 1,
		invite: 1,
	});
	const [tabs, setTabs] = useState<Record<string, string>>({});

	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ kyc: 1, invite: 1 });
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

	/* M1: Edit Profile */
	const renderEditProfile = () => (
		<MBox
			id="editProfileModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-building me-2" />
					Edit Business Profile
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
								"editProfileModal",
								"Business profile updated successfully!",
								"",
							)
						}
					>
						Save Changes
					</button>
				</>
			}
		>
			{renderActionBody(
				"editProfileModal",
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Legal Name</label>
							<input
								className={s.formControl}
								defaultValue="J.K. Holdings Limited"
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Trading Name</label>
							<input className={s.formControl} defaultValue="JK Holdings" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>KRA PIN</label>
							<input className={s.formControl} defaultValue="A001234567X" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Registration No.</label>
							<input className={s.formControl} defaultValue="PVT-XYZ12345A" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Industry</label>
							<select className={s.formControl}>
								<option>Wholesale & Retail Trade</option>
								<option>Manufacturing</option>
								<option>Services</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Business Size</label>
							<select className={s.formControl}>
								<option>Medium (47 employees)</option>
								<option>Small (11-50)</option>
								<option>Large (250+)</option>
							</select>
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Physical Address</label>
							<textarea
								className={s.formControl}
								rows={2}
								defaultValue="Westlands Business Park, Nairobi"
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Phone</label>
							<input
								className={s.formControl}
								defaultValue="+254 20 123 4567"
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Email</label>
							<input
								className={s.formControl}
								defaultValue="info@jkholdings.co.ke"
							/>
						</div>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M2: KYC Upload (3-step) */
	const renderKyc = () => {
		const step = flows.kyc;
		return (
			<MBox
				id="kycModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-file-earmark-text me-2" />
						Upload KYC/KYB Documents
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("kyc", 3)}
						>
							{step >= 3 ? "Done" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="kyc" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Document Type</h6>
						<div className="row g-2">
							{[
								"Certificate of Incorporation",
								"KRA PIN Certificate",
								"Tax Compliance Certificate",
								"Director ID",
								"Beneficial Ownership",
								"Annual Returns",
							].map((d) => (
								<div key={d} className="col-md-4">
									<button className={cx(s.quickBtn, "w-100")}>
										<i
											className="bi bi-file-earmark"
											style={{ fontSize: 22, color: "var(--pm-primary)" }}
										/>
										<strong style={{ fontSize: 12 }}>{d}</strong>
									</button>
								</div>
							))}
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Upload</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Document</label>
							<input type="file" className={s.formControl} />
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Expiry Date</label>
							<input type="date" className={s.formControl} />
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Notes</label>
							<textarea
								className={s.formControl}
								rows={2}
								defaultValue="Renewal application submitted 20 Jun 2025."
							/>
						</div>
					</div>
				)}
				{step === 3 &&
					renderActionBody(
						"kycModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"kycModal",
										"Document uploaded successfully!",
										"DOC-20250627",
									)
								}
							>
								Complete Upload <i className="bi bi-check-lg" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M3: User Invite (3-step) */
	const renderUserInvite = () => {
		const step = flows.invite;
		return (
			<MBox
				id="userInviteModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-plus me-2" />
						Invite New User
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("invite", 3)}
						>
							{step >= 3 ? "Done" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="invite" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: User Details</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>Full Name</label>
								<input className={s.formControl} defaultValue="Brian Ochieng" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Email</label>
								<input
									className={s.formControl}
									defaultValue="brian.ochieng@jkholdings.co.ke"
								/>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Role</label>
								<select className={s.formControl}>
									<option>Accountant</option>
									<option>Finance Manager</option>
									<option>Sales Manager</option>
									<option>HR Manager</option>
									<option>Procurement Officer</option>
									<option>Viewer</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Department</label>
								<select className={s.formControl}>
									<option>Finance</option>
									<option>Sales</option>
									<option>HR</option>
									<option>Procurement</option>
									<option>Operations</option>
								</select>
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Permissions</h6>
						<div className="mb-3">
							<label className={s.formLabel}>Approval Limit</label>
							<input className={s.formControl} defaultValue="100,000" />
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Accessible Businesses</label>
							<div className="form-check mb-1">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
								/>
								<label className="form-check-label">J.K. Holdings Ltd</label>
							</div>
							<div className="form-check mb-1">
								<input className="form-check-input" type="checkbox" />
								<label className="form-check-label">
									JK Retail Mombasa Ltd
								</label>
							</div>
							<div className="form-check">
								<input className="form-check-input" type="checkbox" />
								<label className="form-check-label">JK Agri Solutions</label>
							</div>
						</div>
						<div className="form-check form-switch mb-2">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">Require MFA</label>
						</div>
						<div className="form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label">
								Email notifications enabled
							</label>
						</div>
					</div>
				)}
				{step === 3 &&
					renderActionBody(
						"userInviteModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"userInviteModal",
										"Invitation sent to brian.ochieng@jkholdings.co.ke",
										"INV-20250627",
									)
								}
							>
								Send Invitation <i className="bi bi-send" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M4: Security Settings (tabbed) */
	const renderSecurity = () => {
		const tab = tabs.sec ?? "policy";
		return (
			<MBox
				id="securityModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-shield-lock me-2" />
						Security Settings
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
									"securityModal",
									"Security settings updated successfully!",
									"",
								)
							}
						>
							Save Settings
						</button>
					</>
				}
			>
				{renderActionBody(
					"securityModal",
					<>
						<div className={cx(s.pills, "mb-3")}>
							<button
								className={cx(s.pill, tab === "policy" && s.pillActive)}
								onClick={() => switchTab("sec", "policy")}
							>
								Policy
							</button>
							<button
								className={cx(s.pill, tab === "mfa" && s.pillActive)}
								onClick={() => switchTab("sec", "mfa")}
							>
								MFA
							</button>
							<button
								className={cx(s.pill, tab === "session" && s.pillActive)}
								onClick={() => switchTab("sec", "session")}
							>
								Sessions
							</button>
							<button
								className={cx(s.pill, tab === "ip" && s.pillActive)}
								onClick={() => switchTab("sec", "ip")}
							>
								IP Rules
							</button>
						</div>
						{tab === "policy" && (
							<div>
								<div className="mb-3">
									<label className={s.formLabel}>Minimum Password Length</label>
									<select className={s.formControl}>
										<option>12 characters</option>
										<option>10 characters</option>
										<option>8 characters</option>
									</select>
								</div>
								<div className="form-check mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Require uppercase, lowercase, number and special character
									</label>
								</div>
								<div className="form-check mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Password rotation every 90 days
									</label>
								</div>
								<div className="form-check">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Prevent password reuse (last 5 passwords)
									</label>
								</div>
							</div>
						)}
						{tab === "mfa" && (
							<div>
								<div className="form-check form-switch mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Enforce MFA for all users
									</label>
								</div>
								<div className="form-check form-switch mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Allow authenticator app (TOTP)
									</label>
								</div>
								<div className="form-check form-switch mb-2">
									<input className="form-check-input" type="checkbox" />
									<label className="form-check-label">
										Allow SMS OTP fallback
									</label>
								</div>
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Require MFA for high-value actions
									</label>
								</div>
							</div>
						)}
						{tab === "session" && (
							<div>
								<div className="mb-3">
									<label className={s.formLabel}>Session Timeout</label>
									<select className={s.formControl}>
										<option>15 minutes</option>
										<option selected>30 minutes</option>
										<option>60 minutes</option>
										<option>Never</option>
									</select>
								</div>
								<div className="form-check form-switch mb-2">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Allow concurrent sessions
									</label>
								</div>
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Email alert on new device login
									</label>
								</div>
							</div>
						)}
						{tab === "ip" && (
							<div>
								<div className="mb-3">
									<label className={s.formLabel}>Allowed IP Ranges</label>
									<textarea
										className={s.formControl}
										rows={3}
										defaultValue={"192.168.1.0/24\n10.0.0.0/8\n41.204.0.0/16"}
									/>
								</div>
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
									/>
									<label className="form-check-label">
										Block login from unknown countries
									</label>
								</div>
							</div>
						)}
					</>,
				)}
			</MBox>
		);
	};

	/* M5: API Keys (tabbed) */
	const renderApiKey = () => {
		const tab = tabs.api ?? "keys";
		return (
			<MBox
				id="apiKeyModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-key me-2" />
						API Key Management
					</>
				}
				footer={
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
				}
			>
				<div className={cx(s.pills, "mb-3")}>
					<button
						className={cx(s.pill, tab === "keys" && s.pillActive)}
						onClick={() => switchTab("api", "keys")}
					>
						Keys
					</button>
					<button
						className={cx(s.pill, tab === "webhooks" && s.pillActive)}
						onClick={() => switchTab("api", "webhooks")}
					>
						Webhooks
					</button>
					<button
						className={cx(s.pill, tab === "sandbox" && s.pillActive)}
						onClick={() => switchTab("api", "sandbox")}
					>
						Sandbox
					</button>
				</div>
				{tab === "keys" && (
					<div>
						<div className="table-responsive">
							<table className={s.tbl}>
								<thead>
									<tr>
										<th>Key Name</th>
										<th>Environment</th>
										<th>Created</th>
										<th>Last Used</th>
										<th>Status</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Production Key</td>
										<td>
											<span className={cx(s.badge, s.badgeD)}>Live</span>
										</td>
										<td>12 Jan 2025</td>
										<td>Today 08:45</td>
										<td>
											<span className={cx(s.badge, s.badgeS)}>Active</span>
										</td>
										<td>
											<button
												className={cx(s.btnPm, s.btnSm)}
												onClick={() =>
													doAction(
														"apiKeyModal",
														"Key revoked successfully.",
														"",
													)
												}
											>
												Revoke
											</button>
										</td>
									</tr>
									<tr>
										<td>Sandbox Key</td>
										<td>
											<span className={cx(s.badge, s.badgeI)}>Test</span>
										</td>
										<td>12 Jan 2025</td>
										<td>26 Jun 14:20</td>
										<td>
											<span className={cx(s.badge, s.badgeS)}>Active</span>
										</td>
										<td>
											<button
												className={cx(s.btnPm, s.btnSm)}
												onClick={() =>
													doAction(
														"apiKeyModal",
														"Key revoked successfully.",
														"",
													)
												}
											>
												Revoke
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm, "mt-2")}
							onClick={() =>
								doAction(
									"apiKeyModal",
									"New API key generated. Please copy it now.",
									"",
								)
							}
						>
							Generate New Key
						</button>
					</div>
				)}
				{tab === "webhooks" && (
					<div>
						<div className="mb-3">
							<label className={s.formLabel}>Webhook URL</label>
							<input
								className={s.formControl}
								defaultValue="https://api.jkholdings.co.ke/webhooks/paymo"
							/>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Subscribed Events</label>
							<div className="form-check mb-1">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
								/>
								<label className="form-check-label" style={{ fontSize: 13 }}>
									Payment Success
								</label>
							</div>
							<div className="form-check mb-1">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
								/>
								<label className="form-check-label" style={{ fontSize: 13 }}>
									Payment Failed
								</label>
							</div>
							<div className="form-check mb-1">
								<input className="form-check-input" type="checkbox" />
								<label className="form-check-label" style={{ fontSize: 13 }}>
									Disbursement Completed
								</label>
							</div>
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
								/>
								<label className="form-check-label" style={{ fontSize: 13 }}>
									Invoice Paid
								</label>
							</div>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() =>
								doAction("apiKeyModal", "Webhook configuration saved!", "")
							}
						>
							Save Webhook
						</button>
					</div>
				)}
				{tab === "sandbox" && (
					<div>
						<div
							className="p-3 rounded"
							style={{ background: "var(--pm-info-soft)" }}
						>
							<div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>
								Sandbox Endpoint
							</div>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: 13,
									color: "var(--pm-info)",
								}}
							>
								https://sandbox.api.paymo.co.ke/v2
							</div>
							<div className="mt-2">
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() =>
										doAction("apiKeyModal", "Sandbox environment reset.", "")
									}
								>
									Reset Sandbox
								</button>
							</div>
						</div>
					</div>
				)}
			</MBox>
		);
	};

	/* M6: Integration Marketplace */
	const renderIntegration = () => (
		<MBox
			id="integrationModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-plug me-2" />
					Integration Marketplace
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="row g-3">
				{[
					{ name: "Xero", status: "Connected", tone: "badgeS" as BadgeTone },
					{
						name: "QuickBooks Online",
						status: "Connected",
						tone: "badgeS" as BadgeTone,
					},
					{ name: "Workday", status: "Connected", tone: "badgeI" as BadgeTone },
					{
						name: "Sage 300",
						status: "Reconnect",
						tone: "badgeW" as BadgeTone,
					},
					{ name: "Shopify", status: "", tone: "" as BadgeTone },
					{ name: "Slack", status: "", tone: "" as BadgeTone },
				].map((i) => (
					<div key={i.name} className="col-md-4">
						<div className="p-3 border rounded">
							<div className="d-flex justify-content-between">
								<strong>{i.name}</strong>
								{i.status && (
									<span className={cx(s.badge, s[i.tone])}>{i.status}</span>
								)}
							</div>
							<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
								{i.tone ? "Accounting • Synced" : "Available"}
							</div>
							<button
								className={cx(s.btnPm, s.btnSm, "mt-2")}
								onClick={() =>
									doAction(
										"integrationModal",
										`${i.name} ${i.status ? "sync refreshed!" : "connected!"}`,
										"",
									)
								}
							>
								{i.status ? "Manage" : "Connect"}
							</button>
						</div>
					</div>
				))}
			</div>
		</MBox>
	);

	/* M7-M25: Simple modals */
	const renderSimple = (
		id: string,
		title: ReactNode,
		content: ReactNode,
		action?: string,
		actionMsg?: string,
		actionRef?: string,
		size: Size = "md",
	) => (
		<MBox
			id={id}
			active={active}
			size={size}
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

	const renderPinInputs = () => (
		<div className="d-flex gap-2 justify-content-center">
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<input
					key={i}
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
			))}
		</div>
	);

	return (
		<>
			{renderEditProfile()}
			{renderKyc()}
			{renderUserInvite()}
			{renderSecurity()}
			{renderApiKey()}
			{renderIntegration()}
			{renderSimple(
				"bankAccountModal",
				<>
					<i className="bi bi-bank me-2" />
					Bank Account Management
				</>,
				<>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Bank</th>
									<th>Account No.</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Equity Bank</td>
									<td>0123456789</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Verified</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("bankAccountModal", "Account removed.", "")
											}
										>
											Remove
										</button>
									</td>
								</tr>
								<tr>
									<td>KCB Bank</td>
									<td>9876543210</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Verified</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("bankAccountModal", "Account removed.", "")
											}
										>
											Remove
										</button>
									</td>
								</tr>
								<tr>
									<td>Co-op Bank</td>
									<td>4567890123</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>Pending</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction(
													"bankAccountModal",
													"Verification initiated.",
													"",
												)
											}
										>
											Verify
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<button
						className={cx(s.btnPm, s.btnSm, "mt-2")}
						onClick={() =>
							doAction("bankAccountModal", "New bank account added.", "")
						}
					>
						Add Bank Account
					</button>
				</>,
				undefined,
				undefined,
				undefined,
				"lg",
			)}
			{renderSimple(
				"complianceModal",
				<>
					<i className="bi bi-calendar-event me-2" />
					Compliance Calendar & Regulatory Reporting
				</>,
				<>
					<div className={cx(s.pills, "mb-3")}>
						<button className={cx(s.pill, s.pillActive)}>Calendar</button>
						<button className={s.pill}>Reports</button>
						<button className={s.pill}>Score</button>
					</div>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Deadline</th>
									<th>Regulator</th>
									<th>Report</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>05 Jul 2025</td>
									<td>KRA</td>
									<td>TCC Renewal</td>
									<td>
										<span className={cx(s.badge, s.badgeD)}>9 days</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("kycModal")}
										>
											Upload
										</button>
									</td>
								</tr>
								<tr>
									<td>10 Jul 2025</td>
									<td>NSSF</td>
									<td>Monthly Return</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>14 days</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction(
													"complianceModal",
													"NSSF return generated.",
													"",
												)
											}
										>
											Generate
										</button>
									</td>
								</tr>
								<tr>
									<td>31 Jul 2025</td>
									<td>NITA</td>
									<td>Annual Return</td>
									<td>
										<span className={cx(s.badge, s.badgeI)}>25 days</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction(
													"complianceModal",
													"NITA return generated.",
													"",
												)
											}
										>
											Generate
										</button>
									</td>
								</tr>
								<tr>
									<td>31 Dec 2025</td>
									<td>Nairobi County</td>
									<td>Business Permit</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>6 months</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("complianceModal", "Reminder set.", "")
											}
										>
											Set Reminder
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
				"Export Full Report",
				"Compliance report exported successfully.",
				undefined,
				"xl",
			)}
			{renderSimple(
				"auditLogModal",
				<>
					<i className="bi bi-clock-history me-2" />
					Audit Log
				</>,
				<>
					<div className="d-flex gap-2 mb-3">
						<select className={s.formControl} style={{ width: "auto" }}>
							<option>All Users</option>
							<option>James K.</option>
							<option>Grace W.</option>
						</select>
						<select className={s.formControl} style={{ width: "auto" }}>
							<option>Last 30 days</option>
							<option>Last 7 days</option>
						</select>
						<input
							className={s.formControl}
							style={{ width: 200 }}
							placeholder="Search action..."
						/>
					</div>
					<div
						className="table-responsive"
						style={{ maxHeight: 400, overflowY: "auto" }}
					>
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Timestamp</th>
									<th>User</th>
									<th>Action</th>
									<th>Details</th>
									<th>IP</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>27 Jun 09:15</td>
									<td>James K.</td>
									<td>Profile Updated</td>
									<td>Trading name changed</td>
									<td>41.204.12.45</td>
								</tr>
								<tr>
									<td>27 Jun 08:45</td>
									<td>Grace W.</td>
									<td>Payroll Approved</td>
									<td>June 2025 payroll • KES 2.4M</td>
									<td>41.204.18.22</td>
								</tr>
								<tr>
									<td>26 Jun 14:30</td>
									<td>Peter O.</td>
									<td>Invoice Created</td>
									<td>INV-2025-0842 • KES 185,000</td>
									<td>41.204.5.11</td>
								</tr>
								<tr>
									<td>25 Jun 16:05</td>
									<td>Grace W.</td>
									<td>API Key Created</td>
									<td>Production key • pk_live_8f3a</td>
									<td>41.204.18.22</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
				"Export CSV",
				"Audit log exported successfully.",
				undefined,
				"xl",
			)}
			{renderSimple(
				"supportModal",
				<>
					<i className="bi bi-headset me-2" />
					Create Support Ticket
				</>,
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Category</label>
							<select className={s.formControl}>
								<option>Technical / API</option>
								<option>Billing & Payments</option>
								<option>Payroll & HR</option>
								<option>Compliance & KYC</option>
								<option>Security</option>
								<option>General Enquiry</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Priority</label>
							<select className={s.formControl}>
								<option>Normal</option>
								<option>High</option>
								<option>Critical</option>
							</select>
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Subject</label>
							<input
								className={s.formControl}
								defaultValue="API webhook timeout issue"
							/>
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Description</label>
							<textarea
								className={s.formControl}
								rows={4}
								defaultValue="Our webhook endpoint is receiving timeout errors intermittently."
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Attachment</label>
							<input type="file" className={s.formControl} />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Preferred Contact</label>
							<select className={s.formControl}>
								<option>In-app chat</option>
								<option>Email</option>
								<option>Phone callback</option>
							</select>
						</div>
					</div>
				</>,
				"Submit Ticket",
				"Support ticket #SUP-8834 created. A specialist will respond within 2 hours.",
				"SUP-8834",
				"lg",
			)}
			{renderSimple(
				"roleModal",
				<>
					<i className="bi bi-sliders me-2" />
					Role & Permission Management
				</>,
				<>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Role</th>
									<th>Description</th>
									<th>Approval Limit</th>
									<th>Users</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<strong>Owner</strong>
									</td>
									<td>Full access</td>
									<td>Unlimited</td>
									<td>1</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("roleModal", "Role permissions updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>
										<strong>Finance Manager</strong>
									</td>
									<td>Collections, disbursements, payroll</td>
									<td>KES 500,000</td>
									<td>2</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("roleModal", "Role permissions updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>
										<strong>Accountant</strong>
									</td>
									<td>Bookkeeping, reconciliation</td>
									<td>KES 100,000</td>
									<td>3</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("roleModal", "Role permissions updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>
										<strong>HR Manager</strong>
									</td>
									<td>Payroll, employee data</td>
									<td>KES 50,000</td>
									<td>1</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("roleModal", "Role permissions updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
				"Create Custom Role",
				"New custom role created successfully.",
				undefined,
				"lg",
			)}
			{renderSimple(
				"branchModal",
				<>
					<i className="bi bi-geo-alt me-2" />
					Branch Management
				</>,
				<>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Branch</th>
									<th>Location</th>
									<th>Manager</th>
									<th>Employees</th>
									<th>Collections MTD</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<strong>Head Office</strong>
									</td>
									<td>Westlands, Nairobi</td>
									<td>James K.</td>
									<td>28</td>
									<td>KES 12.4M</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("branchModal", "Branch updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>
										<strong>Mombasa Branch</strong>
									</td>
									<td>Mombasa CBD</td>
									<td>Grace W.</td>
									<td>12</td>
									<td>KES 4.8M</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("branchModal", "Branch updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>
										<strong>Kisumu Branch</strong>
									</td>
									<td>Kisumu CBD</td>
									<td>Peter O.</td>
									<td>5</td>
									<td>KES 1.9M</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Active</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("branchModal", "Branch updated.", "")
											}
										>
											Edit
										</button>
									</td>
								</tr>
								<tr>
									<td>
										<strong>Nakuru Branch</strong>
									</td>
									<td>Nakuru Town</td>
									<td>—</td>
									<td>2</td>
									<td>KES 680K</td>
									<td>
										<span className={cx(s.badge, s.badgeI)}>Setup</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() =>
												doAction("branchModal", "Branch activated.", "")
											}
										>
											Activate
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<button
						className={cx(s.btnPm, s.btnSm, "mt-2")}
						onClick={() => doAction("branchModal", "New branch created.", "")}
					>
						Add Branch
					</button>
				</>,
				undefined,
				undefined,
				undefined,
				"lg",
			)}
			{renderSimple(
				"transferModal",
				<>
					<i className="bi bi-arrow-left-right me-2" />
					Inter-Company Transfer
				</>,
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>From Business</label>
							<select className={s.formControl}>
								<option>J.K. Holdings Ltd</option>
								<option>JK Retail Mombasa Ltd</option>
								<option>JK Agri Solutions</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>To Business</label>
							<select className={s.formControl}>
								<option>JK Retail Mombasa Ltd</option>
								<option>J.K. Holdings Ltd</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Amount (KES)</label>
							<input className={s.formControl} defaultValue="500000" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Purpose</label>
							<select className={s.formControl}>
								<option>Working capital</option>
								<option>Inventory purchase</option>
								<option>Payroll support</option>
							</select>
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Description</label>
							<textarea
								className={s.formControl}
								rows={2}
								defaultValue="Monthly working capital transfer as per board resolution."
							/>
						</div>
					</div>
				</>,
				"Initiate Transfer",
				"Transfer of KES 500,000 initiated.",
				"TRF-20250627-1122",
				"lg",
			)}
			{renderSimple(
				"webhookModal",
				<>
					<i className="bi bi-link-45deg me-2" />
					Webhook Configuration
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Endpoint URL</label>
						<input
							className={s.formControl}
							defaultValue="https://api.jkholdings.co.ke/webhooks/paymo"
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Secret Key</label>
						<input
							className={s.formControl}
							defaultValue="whsec_8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c"
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Subscribed Events</label>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								payment.success
							</label>
						</div>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								payment.failed
							</label>
						</div>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								disbursement.completed
							</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" />
							<label className="form-check-label" style={{ fontSize: 13 }}>
								invoice.paid
							</label>
						</div>
					</div>
				</>,
				"Save & Test",
				"Webhook configuration saved and test payload sent!",
				undefined,
				"lg",
			)}
			{renderSimple(
				"addBusinessModal",
				<>
					<i className="bi bi-plus-circle me-2" />
					Add New Business
				</>,
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Legal Name</label>
							<input className={s.formControl} placeholder="Company Limited" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Trading Name</label>
							<input className={s.formControl} placeholder="Brand Name" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>KRA PIN</label>
							<input className={s.formControl} placeholder="A00XXXXXX" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Registration No.</label>
							<input className={s.formControl} placeholder="PVT-XXXXXX" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Industry</label>
							<select className={s.formControl}>
								<option>Wholesale & Retail</option>
								<option>Manufacturing</option>
								<option>Services</option>
								<option>Agriculture</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Location</label>
							<input className={s.formControl} placeholder="City, County" />
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Description</label>
							<textarea
								className={s.formControl}
								rows={2}
								placeholder="Brief description of business activities"
							/>
						</div>
					</div>
				</>,
				"Create Business",
				"New business entity created! KYC upload required within 7 days.",
				undefined,
				"lg",
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
						james@jkholdings.co.ke · +254 712 345 890
					</p>
					<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Businesses</span>
								<br />
								<strong>3 entities</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Compliance</span>
								<br />
								<strong style={{ color: "var(--pm-accent)" }}>91/100</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Team Size</span>
								<br />
								<strong>47 users</strong>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-2 rounded"
								style={{ background: "var(--pm-surface-2)" }}
							>
								<span className="text-muted">Last Login</span>
								<br />
								<strong>Today 09:12</strong>
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
							<strong>KRA TCC expires in 9 days</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								Renew before 05 Jul
							</div>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("kycModal")}
						>
							Renew
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>2 users pending MFA activation</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								Security risk flagged
							</div>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("userInviteModal")}
						>
							Manage
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>Bank account verification pending</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								Equity Bank • KES 2.4M
							</div>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => onOpen("bankAccountModal")}
						>
							Verify
						</button>
					</div>
					<div className={s.statusRow}>
						<div>
							<strong>5 payroll approvals pending</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
								June 2025 payroll • KES 2.4M
							</div>
						</div>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() =>
								doAction(
									"attentionFullModal",
									"All payroll approvals processed.",
									"",
								)
							}
						>
							Approve All
						</button>
					</div>
				</>,
			)}
			{renderSimple(
				"reportModal",
				<>
					<i className="bi bi-file-earmark-arrow-down me-2" />
					Generate Regulatory Report
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Report Type</label>
						<select className={s.formControl}>
							<option>KRA iTax PAYE (P10)</option>
							<option>NSSF Monthly Return</option>
							<option>SHIF Monthly Contribution</option>
							<option>CBK STR/CTR</option>
							<option>ODPC Data Audit</option>
						</select>
					</div>
					<div className="row g-3 mb-3">
						<div className="col-6">
							<label className={s.formLabel}>Period From</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-06-01"
							/>
						</div>
						<div className="col-6">
							<label className={s.formLabel}>Period To</label>
							<input
								type="date"
								className={s.formControl}
								defaultValue="2025-06-30"
							/>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Format</label>
						<select className={s.formControl}>
							<option>PDF</option>
							<option>Excel</option>
							<option>iTax XML</option>
						</select>
					</div>
				</>,
				"Generate Report",
				"Report generated and downloading...",
				undefined,
				"lg",
			)}
			{renderSimple(
				"transferApprovalModal",
				<>
					<i className="bi bi-check2-circle me-2" />
					Approve Inter-Company Transfer
				</>,
				<>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-surface-2)" }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">From</span>
							<strong>J.K. Holdings Ltd</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">To</span>
							<strong>JK Retail Mombasa Ltd</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Amount</span>
							<strong>KES 500,000</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span className="text-muted">Purpose</span>
							<strong>Working capital</strong>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Approval Note</label>
						<textarea
							className={s.formControl}
							rows={2}
							defaultValue="Approved as per board resolution dated 15 Jun 2025."
						/>
					</div>
				</>,
				"Approve & Execute",
				"Transfer approved and executed!",
				"TRF-20250627-1122",
				"lg",
			)}
			{renderSimple(
				"feeCalcModal",
				<>
					<i className="bi bi-calculator me-2" />
					Transaction Fee Calculator
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Transaction Type</label>
						<select className={s.formControl}>
							<option>M-Pesa B2C Disbursement</option>
							<option>Bank Transfer (PesaLink)</option>
							<option>Card Payment (MDR)</option>
							<option>International FX</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Amount (KES)</label>
						<input className={s.formControl} defaultValue="100000" />
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Base Fee</span>
							<strong>KES 25</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Percentage Fee</span>
							<strong>KES 500 (0.5%)</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span style={{ fontWeight: 700 }}>Total Fee</span>
							<strong style={{ color: "var(--pm-primary)" }}>KES 525</strong>
						</div>
					</div>
				</>,
			)}
			{renderSimple(
				"changePasswordModal",
				<>
					<i className="bi bi-key me-2" />
					Change Password
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Current Password</label>
						<input type="password" className={s.formControl} />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>New Password</label>
						<input type="password" className={s.formControl} />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Confirm New Password</label>
						<input type="password" className={s.formControl} />
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
					>
						<i className="bi bi-info-circle me-1" /> Password must be at least
						12 characters with uppercase, lowercase, number and special
						character.
					</div>
				</>,
				"Change Password",
				"Password changed successfully!",
				undefined,
				"lg",
			)}
			{renderSimple(
				"securityPinModal",
				<>
					<i className="bi bi-shield-lock me-2" />
					Security PIN Verification
				</>,
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Action</label>
						<select className={s.formControl}>
							<option>Approve high-value transaction</option>
							<option>Change security settings</option>
							<option>Generate API key</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Enter 2FA Code</label>
						{renderPinInputs()}
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Log this action for audit
						</label>
					</div>
				</>,
				"Authorize",
				"Action authorized and logged.",
				"SEC-20250627-8841",
				"lg",
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
									<th>SMS</th>
									<th>Email</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Document Expiry</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
								</tr>
								<tr>
									<td>New User Invited</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input type="checkbox" className="form-check-input" />
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
								</tr>
								<tr>
									<td>Compliance Deadline</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
								</tr>
								<tr>
									<td>Security Alert</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
									<td>
										<input
											type="checkbox"
											className="form-check-input"
											defaultChecked
										/>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
				"Save",
				"Notification preferences saved.",
				undefined,
				"lg",
			)}
			{renderSimple(
				"addBranchModal",
				<>
					<i className="bi bi-geo-alt me-2" />
					Add New Branch
				</>,
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Branch Name</label>
							<input className={s.formControl} placeholder="Eldoret Branch" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Location</label>
							<input
								className={s.formControl}
								placeholder="Eldoret Town, Uasin Gishu"
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Manager</label>
							<select className={s.formControl}>
								<option>Assign later</option>
								<option>James K.</option>
								<option>Grace W.</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Phone</label>
							<input className={s.formControl} placeholder="+254 700 000 000" />
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Address</label>
							<textarea
								className={s.formControl}
								rows={2}
								placeholder="Full physical address"
							/>
						</div>
					</div>
				</>,
				"Create Branch",
				"New branch created successfully!",
				undefined,
				"lg",
			)}
		</>
	);
}
