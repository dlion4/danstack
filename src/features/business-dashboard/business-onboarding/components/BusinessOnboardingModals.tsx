import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/business-onboarding.module.css";

/* ============================================================================
   Business Onboarding & KYB/KYC — modal layer (legacy page 3.12)
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
	onboard: { labels: ["Identity", "Ownership", "Documents", "UBO", "Done"] },
	kyc: { labels: ["Details", "Documents", "Screening", "Done"] },
	bulk: { labels: ["Upload", "Validate", "Done"] },
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

export default function BusinessOnboardingModals({
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
		onboard: 1,
		kyc: 1,
		bulk: 1,
	});
	const [tabs, setTabs] = useState<Record<string, string>>({});

	useEffect(() => {
		if (active === null) {
			setResults({});
			setFlows({ onboard: 1, kyc: 1, bulk: 1 });
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

	/* M1: Onboard New Business (5-step) */
	const renderOnboardNew = () => {
		const step = flows.onboard;
		return (
			<MBox
				id="onboardNewModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-plus-circle text-primary me-2" />
						Business Onboarding Application
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("onboard", 5)}
						>
							{step >= 5 ? "Done" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="onboard" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Business Identity</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>Legal Business Name</label>
								<input
									className={s.formControl}
									defaultValue="Greenfield Logistics Limited"
								/>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Trading Name</label>
								<input
									className={s.formControl}
									defaultValue="Greenfield Logistics"
								/>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Business Type</label>
								<select className={s.formControl}>
									<option>Limited Liability Company</option>
									<option>Sole Proprietorship</option>
									<option>Partnership</option>
									<option>SACCO / Cooperative</option>
									<option>NGO / Trust</option>
									<option>Foreign Branch</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>
									Registration Number (CR12)
								</label>
								<input className={s.formControl} defaultValue="PVT-88291" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>KRA PIN</label>
								<input className={s.formControl} defaultValue="P051234567A" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>County of Operation</label>
								<select className={s.formControl}>
									<option>Nairobi</option>
									<option>Kiambu</option>
									<option>Nakuru</option>
									<option>Mombasa</option>
								</select>
							</div>
							<div className="col-12">
								<label className={s.formLabel}>Business Address</label>
								<input
									className={s.formControl}
									defaultValue="P.O. Box 1234-00100, Nairobi, Kenya"
								/>
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Ownership & Directors</h6>
						<div className="mb-3">
							<label className={s.formLabel}>
								Number of Shareholders/Directors
							</label>
							<select className={s.formControl}>
								<option>1 (Sole Proprietor)</option>
								<option>2</option>
								<option>3</option>
								<option>4</option>
								<option>5+</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>Upload CR12 Extract</label>
							<input type="file" className={s.formControl} />
						</div>
						<div className="mb-3">
							<label className={s.formLabel}>
								Upload Certificate of Incorporation
							</label>
							<input type="file" className={s.formControl} />
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 3: KYC/KYB Documents</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>KRA PIN Certificate</label>
								<input type="file" className={s.formControl} />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>
									Tax Compliance Certificate (TCC)
								</label>
								<input type="file" className={s.formControl} />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>
									County Single Business Permit
								</label>
								<input type="file" className={s.formControl} />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>
									Company Bank Statement (3 months)
								</label>
								<input type="file" className={s.formControl} />
							</div>
						</div>
					</div>
				)}
				{step === 4 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 4: Beneficial Ownership</h6>
						<div className="mb-3">
							<label className={s.formLabel}>
								Ultimate Beneficial Owner (25%+)
							</label>
							<div className={s.statusRow}>
								<div>
									<strong>Peter Ochieng</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										45% ownership
									</div>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => onOpen("beneficialOwnerModal")}
								>
									Edit
								</button>
							</div>
							<div className={s.statusRow}>
								<div>
									<strong>Grace Wanjiku</strong>
									<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
										30% ownership
									</div>
								</div>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => onOpen("beneficialOwnerModal")}
								>
									Edit
								</button>
							</div>
						</div>
					</div>
				)}
				{step === 5 &&
					renderActionBody(
						"onboardNewModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"onboardNewModal",
										"Application submitted! Reference: APP-20250627-88291",
										"APP-20250627-88291",
									)
								}
							>
								Submit Application <i className="bi bi-send" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M2: Director KYC (4-step) */
	const renderDirectorKYC = () => {
		const step = flows.kyc;
		return (
			<MBox
				id="directorKYCModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-person-badge text-info me-2" />
						Director / UBO KYC Verification
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("kyc", 4)}
						>
							{step >= 4 ? "Done" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="kyc" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Personal Details</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>Full Name</label>
								<input className={s.formControl} defaultValue="Peter Ochieng" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>ID Type</label>
								<select className={s.formControl}>
									<option>Huduma Namba</option>
									<option>Kenyan Passport</option>
									<option>Foreign Passport</option>
								</select>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>ID Number</label>
								<input className={s.formControl} defaultValue="31245678" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Date of Birth</label>
								<input
									type="date"
									className={s.formControl}
									defaultValue="1985-04-12"
								/>
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Phone</label>
								<input className={s.formControl} defaultValue="0712 345 890" />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Email</label>
								<input
									className={s.formControl}
									defaultValue="peter@greenfield.co.ke"
								/>
							</div>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Document Upload</h6>
						<div className="row g-3">
							<div className="col-md-6">
								<label className={s.formLabel}>ID / Passport Front</label>
								<input type="file" className={s.formControl} />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>ID / Passport Back</label>
								<input type="file" className={s.formControl} />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Selfie with ID</label>
								<input type="file" className={s.formControl} />
							</div>
							<div className="col-md-6">
								<label className={s.formLabel}>Proof of Address</label>
								<input type="file" className={s.formControl} />
							</div>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>
							Step 3: PEP & Sanctions Screening
						</h6>
						<div
							className="p-3 rounded mb-3"
							style={{ background: "var(--pm-accent-soft)" }}
						>
							<div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
								PEP SCREENING
							</div>
							<div
								style={{
									fontSize: 18,
									fontWeight: 700,
									color: "var(--pm-accent)",
								}}
							>
								Clear — No matches
							</div>
						</div>
						<div
							className="p-3 rounded mb-3"
							style={{ background: "var(--pm-accent-soft)" }}
						>
							<div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
								SANCTIONS LIST
							</div>
							<div
								style={{
									fontSize: 18,
									fontWeight: 700,
									color: "var(--pm-accent)",
								}}
							>
								Clear — No matches
							</div>
						</div>
						<div
							className="p-3 rounded"
							style={{ background: "var(--pm-accent-soft)" }}
						>
							<div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
								ADVERSE MEDIA
							</div>
							<div
								style={{
									fontSize: 18,
									fontWeight: 700,
									color: "var(--pm-accent)",
								}}
							>
								Clear — No matches
							</div>
						</div>
					</div>
				)}
				{step === 4 &&
					renderActionBody(
						"directorKYCModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"directorKYCModal",
										"KYC Verification Complete — Director Peter Ochieng verified",
										"KYC-20250627-44821",
									)
								}
							>
								Complete Verification <i className="bi bi-check-lg" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M3: Beneficial Owner */
	const renderBeneficialOwner = () => (
		<MBox
			id="beneficialOwnerModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-people text-purple me-2" />
					Beneficial Ownership Declaration
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
								"beneficialOwnerModal",
								"Beneficial owner declaration saved and linked.",
								"UBO-20250627-88291",
							)
						}
					>
						Save UBO
					</button>
				</>
			}
		>
			{renderActionBody(
				"beneficialOwnerModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Business</label>
						<select className={s.formControl}>
							<option>Greenfield Logistics Limited</option>
							<option>TechNova Solutions</option>
							<option>Shalom SACCO</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Full Name</label>
						<input className={s.formControl} defaultValue="Peter Ochieng" />
					</div>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Ownership Percentage</label>
							<input className={s.formControl} defaultValue="45" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Relationship</label>
							<select className={s.formControl}>
								<option>Director & Shareholder</option>
								<option>Shareholder only</option>
								<option>Trustee</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>ID Type</label>
							<select className={s.formControl}>
								<option>Huduma Namba</option>
								<option>Passport</option>
							</select>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>ID Number</label>
							<input className={s.formControl} defaultValue="31245678" />
						</div>
					</div>
					<div className="mb-3 mt-3">
						<label className={s.formLabel}>Address</label>
						<input
							className={s.formControl}
							defaultValue="P.O. Box 1234-00100, Nairobi"
						/>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							This UBO is a PEP
						</label>
					</div>
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							This UBO has control over the business
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M4: Verify Document */
	const renderVerifyDocument = () => (
		<MBox
			id="verifyDocumentModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-check me-2" />
					Document Verification
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
								"verifyDocumentModal",
								"Document verified and marked as compliant.",
								"DOC-88291",
							)
						}
					>
						Approve
					</button>
				</>
			}
		>
			{renderActionBody(
				"verifyDocumentModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Document</label>
						<select className={s.formControl}>
							<option>TCC — KRA-TCC-88291 (Greenfield Logistics)</option>
							<option>County Permit — Nairobi (Mama Mboga)</option>
						</select>
					</div>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-surface-2)", fontSize: 13 }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">File Name</span>
							<strong>TCC_Greenfield_2025.pdf</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Uploaded</span>
							<strong>25 Jun 2025, 14:32</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span className="text-muted">OCR Status</span>
							<span className={cx(s.badge, s.badgeS)}>Extracted</span>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Verification Result</label>
						<div
							className="p-3 rounded"
							style={{ background: "var(--pm-accent-soft)" }}
						>
							<div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
								AUTO-VERIFIED
							</div>
							<div
								style={{
									fontSize: 16,
									fontWeight: 700,
									color: "var(--pm-accent)",
								}}
							>
								KRA Database Match — Valid until 30 Jun 2025
							</div>
						</div>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Notes</label>
						<textarea
							className={s.formControl}
							rows={3}
							defaultValue="Document appears authentic. Expiry date confirmed with KRA portal."
						/>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M5: View Document */
	const renderViewDocument = () => (
		<MBox
			id="viewDocumentModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-text me-2" />
					Document Viewer
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
								"viewDocumentModal",
								"Document downloaded successfully.",
								"",
							)
						}
					>
						Download
					</button>
				</>
			}
		>
			<div
				className="p-3 rounded mb-3"
				style={{ background: "var(--pm-surface-2)" }}
			>
				<div className="d-flex justify-content-between mb-2">
					<span className="text-muted">Document</span>
					<strong>CR12_Extract_ShalomSACCO.pdf</strong>
				</div>
				<div className="d-flex justify-content-between mb-2">
					<span className="text-muted">Verified</span>
					<span className={cx(s.badge, s.badgeS)}>20 Jun 2025</span>
				</div>
				<div className="d-flex justify-content-between">
					<span className="text-muted">Expiry</span>
					<strong>—</strong>
				</div>
			</div>
			<div
				className="text-center p-5"
				style={{
					background: "#f8f9fa",
					border: "2px dashed var(--pm-border)",
					borderRadius: 8,
				}}
			>
				<i
					className="bi bi-file-earmark-pdf"
					style={{ fontSize: 48, color: "var(--pm-primary)" }}
				/>
				<div
					className="mt-2"
					style={{ fontSize: 13, color: "var(--pm-muted)" }}
				>
					PDF preview would render here in production
				</div>
			</div>
		</MBox>
	);

	/* M6: Upload Document */
	const renderUploadDocument = () => (
		<MBox
			id="uploadDocumentModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-upload me-2" />
					Upload Document
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
								"uploadDocumentModal",
								"Document uploaded and queued for verification.",
								"DOC-20250627-9912",
							)
						}
					>
						Upload
					</button>
				</>
			}
		>
			{renderActionBody(
				"uploadDocumentModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Business</label>
						<select className={s.formControl}>
							<option>Greenfield Logistics Limited</option>
							<option>TechNova Solutions</option>
							<option>Shalom SACCO</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Document Type</label>
						<select className={s.formControl}>
							<option>Tax Compliance Certificate (TCC)</option>
							<option>Certificate of Incorporation</option>
							<option>County Business Permit</option>
							<option>Director ID</option>
							<option>Beneficial Ownership Declaration</option>
							<option>CR12 Extract</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>File</label>
						<input type="file" className={s.formControl} />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Expiry Date</label>
						<input type="date" className={s.formControl} />
					</div>
				</>,
			)}
		</MBox>
	);

	/* M7: Bulk Onboard (3-step) */
	const renderBulkOnboard = () => {
		const step = flows.bulk;
		return (
			<MBox
				id="bulkOnboardModal"
				active={active}
				size="lg"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-upload me-2" />
						Bulk Business Onboarding
					</>
				}
				footer={
					<>
						<button className={s.btnPm} onClick={onClose}>
							Cancel
						</button>
						<button
							className={cx(s.btnPm, s.btnPmP)}
							onClick={() => nextFlow("bulk", 3)}
						>
							{step >= 3 ? "Done" : "Continue"}
						</button>
					</>
				}
			>
				<Stepper flowKey="bulk" current={step} />
				{step === 1 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 1: Upload File</h6>
						<div className="mb-3">
							<label className={s.formLabel}>CSV / Excel File</label>
							<input type="file" className={s.formControl} />
						</div>
						<div
							className="p-3 rounded"
							style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
						>
							<i className="bi bi-info-circle me-1" /> Required columns: Legal
							Name, Trading Name, Type, CR12, KRA PIN, County, Director Name,
							Director ID, Ownership %
						</div>
					</div>
				)}
				{step === 2 && (
					<div className={s.fstepActive}>
						<h6 style={{ fontWeight: 700 }}>Step 2: Validation Results</h6>
						<div className="table-responsive">
							<table className={s.tbl}>
								<thead>
									<tr>
										<th>Business</th>
										<th>Status</th>
										<th>Issues</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>ABC Traders Ltd</td>
										<td>
											<span className={cx(s.badge, s.badgeS)}>Valid</span>
										</td>
										<td>—</td>
									</tr>
									<tr>
										<td>XYZ SACCO</td>
										<td>
											<span className={cx(s.badge, s.badgeW)}>Warning</span>
										</td>
										<td>Director ID mismatch</td>
									</tr>
									<tr>
										<td>Delta Logistics</td>
										<td>
											<span className={cx(s.badge, s.badgeS)}>Valid</span>
										</td>
										<td>—</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}
				{step === 3 &&
					renderActionBody(
						"bulkOnboardModal",
						<div className={s.fstepActive}>
							<button
								className={cx(s.btnPm, s.btnPmP, "w-100")}
								onClick={() =>
									doAction(
										"bulkOnboardModal",
										"Bulk Import Complete — 47 businesses imported",
										"BULK-20250627",
									)
								}
							>
								Import Now <i className="bi bi-upload" />
							</button>
						</div>,
					)}
			</MBox>
		);
	};

	/* M8: Compliance Check */
	const renderComplianceCheck = () => (
		<MBox
			id="complianceCheckModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-check text-success me-2" />
					Business Compliance Health Check
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() => onOpen("pendingQueueModal")}
					>
						Review Pending Items
					</button>
				</>
			}
		>
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
							87
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#047857" }}>
							COMPLIANCE SCORE
						</div>
					</div>
				</div>
				<div className="col-md-3 col-6">
					<div
						className="p-3 rounded text-center"
						style={{ background: "var(--pm-info-soft)" }}
					>
						<div
							style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-info)" }}
						>
							61/84
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8" }}>
							TCC VALID
						</div>
					</div>
				</div>
				<div className="col-md-3 col-6">
					<div
						className="p-3 rounded text-center"
						style={{ background: "var(--pm-warning-soft)" }}
					>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-warning)",
							}}
						>
							11
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#B45309" }}>
							EXPIRING
						</div>
					</div>
				</div>
				<div className="col-md-3 col-6">
					<div
						className="p-3 rounded text-center"
						style={{ background: "var(--pm-purple-soft)" }}
					>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-purple)",
							}}
						>
							94%
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#6D28D9" }}>
							UBO DECLARED
						</div>
					</div>
				</div>
			</div>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Business</th>
							<th>TCC</th>
							<th>Permit</th>
							<th>UBO</th>
							<th>Directors</th>
							<th>Score</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Greenfield Logistics</td>
							<td>
								<span className={cx(s.badge, s.badgeW)}>Expires 4d</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Valid</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>3/3</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>4/4</span>
							</td>
							<td>
								<strong>82</strong>
							</td>
						</tr>
						<tr>
							<td>Shalom SACCO</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Valid</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Valid</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeW)}>1/2</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>12/12</span>
							</td>
							<td>
								<strong>91</strong>
							</td>
						</tr>
						<tr>
							<td>TechNova Solutions</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Valid</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>Valid</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>2/2</span>
							</td>
							<td>
								<span className={cx(s.badge, s.badgeS)}>3/3</span>
							</td>
							<td>
								<strong>96</strong>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* M9: Pending Queue (tabbed) */
	const renderPendingQueue = () => {
		const tab = tabs.queue ?? "all";
		return (
			<MBox
				id="pendingQueueModal"
				active={active}
				size="xl"
				onClose={onClose}
				title={
					<>
						<i className="bi bi-list-task me-2" />
						Pending Onboarding Queue
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
						className={cx(s.pill, tab === "all" && s.pillActive)}
						onClick={() => switchTab("queue", "all")}
					>
						All (18)
					</button>
					<button
						className={cx(s.pill, tab === "kyc" && s.pillActive)}
						onClick={() => switchTab("queue", "kyc")}
					>
						Director KYC (7)
					</button>
					<button
						className={cx(s.pill, tab === "docs" && s.pillActive)}
						onClick={() => switchTab("queue", "docs")}
					>
						Docs Review (11)
					</button>
				</div>
				{tab === "all" && (
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Business</th>
									<th>Type</th>
									<th>Stage</th>
									<th>Days Open</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Greenfield Logistics</td>
									<td>LLC</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>Director KYC</span>
									</td>
									<td>7</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("directorKYCModal")}
										>
											Continue
										</button>
									</td>
								</tr>
								<tr>
									<td>Shalom SACCO</td>
									<td>Cooperative</td>
									<td>
										<span className={cx(s.badge, s.badgeI)}>Docs Review</span>
									</td>
									<td>3</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("verifyDocumentModal")}
										>
											Review
										</button>
									</td>
								</tr>
								<tr>
									<td>TechNova Solutions</td>
									<td>LLC</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>Director KYC</span>
									</td>
									<td>5</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("directorKYCModal")}
										>
											Continue
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}
				{tab === "kyc" && (
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Director</th>
									<th>Business</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Peter Ochieng</td>
									<td>Greenfield Logistics</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>
											Pending Selfie
										</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("directorKYCModal")}
										>
											Upload
										</button>
									</td>
								</tr>
								<tr>
									<td>Grace Wanjiku</td>
									<td>TechNova Solutions</td>
									<td>
										<span className={cx(s.badge, s.badgeI)}>OCR Complete</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("directorKYCModal")}
										>
											Verify
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}
				{tab === "docs" && (
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Document</th>
									<th>Business</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>TCC</td>
									<td>Greenfield Logistics</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>
											Pending Review
										</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("verifyDocumentModal")}
										>
											Review
										</button>
									</td>
								</tr>
								<tr>
									<td>County Permit</td>
									<td>Mama Mboga Traders</td>
									<td>
										<span className={cx(s.badge, s.badgeW)}>
											Pending Review
										</span>
									</td>
									<td>
										<button
											className={cx(s.btnPm, s.btnSm)}
											onClick={() => onOpen("verifyDocumentModal")}
										>
											Review
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}
			</MBox>
		);
	};

	/* M10: Approval Queue */
	const renderApprovalQueue = () => (
		<MBox
			id="approvalQueueModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-check2-all me-2" />
					Approval Workflow Queue
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="table-responsive">
				<table className={s.tbl}>
					<thead>
						<tr>
							<th>Business</th>
							<th>Level</th>
							<th>Submitted</th>
							<th>Approver</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Greenfield Logistics</td>
							<td>
								<span className={cx(s.badge, s.badgeI)}>Level 2</span>
							</td>
							<td>25 Jun 2025</td>
							<td>James M.</td>
							<td>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => onOpen("approveBusinessModal")}
								>
									Review
								</button>
							</td>
						</tr>
						<tr>
							<td>Shalom SACCO</td>
							<td>
								<span className={cx(s.badge, s.badgeP)}>Level 3</span>
							</td>
							<td>22 Jun 2025</td>
							<td>Sarah K.</td>
							<td>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => onOpen("approveBusinessModal")}
								>
									Review
								</button>
							</td>
						</tr>
						<tr>
							<td>TechNova Solutions</td>
							<td>
								<span className={cx(s.badge, s.badgeD)}>Board</span>
							</td>
							<td>20 Jun 2025</td>
							<td>Board</td>
							<td>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => onOpen("approveBusinessModal")}
								>
									Review
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</MBox>
	);

	/* M11: Approve Business */
	const renderApproveBusiness = () => (
		<MBox
			id="approveBusinessModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-check2-circle me-2" />
					Business Approval
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
								"approveBusinessModal",
								"Business approved and activated. Welcome email sent.",
								"APP-20250627-88291",
							)
						}
					>
						Approve
					</button>
				</>
			}
		>
			{renderActionBody(
				"approveBusinessModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Business</label>
						<input
							className={s.formControl}
							defaultValue="Greenfield Logistics Limited"
							disabled
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Approval Decision</label>
						<select className={s.formControl}>
							<option>Approve — Full access granted</option>
							<option>Conditional — Director KYC required within 7 days</option>
							<option>Reject — Incomplete application</option>
							<option>Escalate — Board review required</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Comments</label>
						<textarea
							className={s.formControl}
							rows={3}
							defaultValue="Application complete. All directors verified. Recommend approval with standard monitoring."
						/>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Enable enhanced transaction monitoring
						</label>
					</div>
					<div className="form-check">
						<input className="form-check-input" type="checkbox" />
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Require quarterly compliance review
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M12: Risk Assessment */
	const renderRiskAssessment = () => (
		<MBox
			id="riskAssessmentModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-exclamation text-warning me-2" />
					Business Risk Assessment
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
								"riskAssessmentModal",
								"Risk assessment saved. Enhanced monitoring enabled.",
								"RISK-20250627-88291",
							)
						}
					>
						Save Assessment
					</button>
				</>
			}
		>
			{renderActionBody(
				"riskAssessmentModal",
				<>
					<div className="row g-3 mb-3">
						<div className="col-md-4">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-warning-soft)" }}
							>
								<div
									style={{
										fontSize: 28,
										fontWeight: 800,
										color: "#F59E0B",
										fontFamily: "var(--pm-font-display)",
									}}
								>
									42
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#B45309" }}
								>
									RISK SCORE
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-danger-soft)" }}
							>
								<div
									style={{
										fontSize: 24,
										fontWeight: 700,
										color: "var(--pm-danger)",
									}}
								>
									Medium
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#991B1B" }}
								>
									RISK LEVEL
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div
								className="p-3 rounded text-center"
								style={{ background: "var(--pm-info-soft)" }}
							>
								<div
									style={{
										fontSize: 24,
										fontWeight: 700,
										color: "var(--pm-info)",
									}}
								>
									Enhanced
								</div>
								<div
									style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8" }}
								>
									MONITORING
								</div>
							</div>
						</div>
					</div>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-surface-2)" }}
					>
						<h6 style={{ fontWeight: 700 }}>Risk Factors Identified:</h6>
						<ul
							style={{
								fontSize: 13,
								color: "var(--pm-ink-soft)",
								margin: "8px 0 0",
								paddingLeft: 18,
							}}
						>
							<li>
								Complex ownership structure (5 shareholders across 3
								jurisdictions)
							</li>
							<li>One UBO flagged as PEP (former county official)</li>
							<li>Recent adverse media mention (unrelated to business)</li>
							<li>High cash transaction volume in first month</li>
						</ul>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Recommended Actions</label>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Enhanced transaction monitoring
							</label>
						</div>
						<div className="form-check mb-1">
							<input
								className="form-check-input"
								type="checkbox"
								defaultChecked
							/>
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Quarterly compliance review
							</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" />
							<label className="form-check-label" style={{ fontSize: 13 }}>
								Source of funds verification
							</label>
						</div>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M13: Renew TCC */
	const renderRenewTCC = () => (
		<MBox
			id="renewTCCModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-text me-2" />
					Renew Tax Compliance Certificate
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
								"renewTCCModal",
								"TCC renewed successfully. Compliance score updated.",
								"TCC-20250627-88291",
							)
						}
					>
						Renew TCC
					</button>
				</>
			}
		>
			{renderActionBody(
				"renewTCCModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Business</label>
						<select className={s.formControl}>
							<option>Greenfield Logistics Limited</option>
							<option>Shalom SACCO</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Current TCC Expiry</label>
						<input
							className={s.formControl}
							defaultValue="30 Jun 2025"
							disabled
						/>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Upload New TCC</label>
						<input type="file" className={s.formControl} />
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>New Expiry Date</label>
						<input
							type="date"
							className={s.formControl}
							defaultValue="2026-06-30"
						/>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M14: Bulk Renewal */
	const renderBulkRenewal = () => (
		<MBox
			id="bulkRenewalModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-lightning me-2" />
					Bulk TCC Auto-Renewal
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
								"bulkRenewalModal",
								"4 TCCs renewed automatically via KRA portal integration.",
								"BULK-TCC-20250627",
							)
						}
					>
						Execute Bulk Renewal
					</button>
				</>
			}
		>
			{renderActionBody(
				"bulkRenewalModal",
				<>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-accent-soft)" }}
					>
						<div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
							AUTO-RENEWAL ELIGIBLE
						</div>
						<div
							style={{
								fontSize: 22,
								fontWeight: 700,
								color: "var(--pm-accent)",
							}}
						>
							4 businesses
						</div>
					</div>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Business</th>
									<th>Current Expiry</th>
									<th>New Expiry</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Greenfield Logistics</td>
									<td>30 Jun 2025</td>
									<td>30 Jun 2026</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Ready</span>
									</td>
								</tr>
								<tr>
									<td>Shalom SACCO</td>
									<td>15 Jul 2025</td>
									<td>15 Jul 2026</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Ready</span>
									</td>
								</tr>
								<tr>
									<td>TechNova Solutions</td>
									<td>22 Jul 2025</td>
									<td>22 Jul 2026</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Ready</span>
									</td>
								</tr>
								<tr>
									<td>Hope Children NGO</td>
									<td>05 Aug 2025</td>
									<td>05 Aug 2026</td>
									<td>
										<span className={cx(s.badge, s.badgeS)}>Ready</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M15: View Business */
	const renderViewBusiness = () => (
		<MBox
			id="viewBusinessModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-building me-2" />
					Business Profile
				</>
			}
			footer={
				<>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
					<button
						className={cx(s.btnPm, s.btnPmP)}
						onClick={() => onOpen("editBusinessModal")}
					>
						Edit
					</button>
				</>
			}
		>
			<div className="row g-3">
				<div className="col-md-6">
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)" }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Business Name</span>
							<strong>Hope Children NGO</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Type</span>
							<strong>NGO</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">CR12</span>
							<strong>CR12-44821</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span className="text-muted">Status</span>
							<span className={cx(s.badge, s.badgeS)}>Active</span>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-surface-2)" }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">Compliance Score</span>
							<strong>96/100</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">TCC Expiry</span>
							<strong>05 Aug 2026</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span className="text-muted">UBO Declared</span>
							<strong>1/1</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span className="text-muted">Directors Verified</span>
							<strong>7/7</strong>
						</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* M16: Edit Business */
	const renderEditBusiness = () => (
		<MBox
			id="editBusinessModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-pencil me-2" />
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
								"editBusinessModal",
								"Business profile updated successfully.",
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
				"editBusinessModal",
				<>
					<div className="row g-3">
						<div className="col-md-6">
							<label className={s.formLabel}>Legal Name</label>
							<input
								className={s.formControl}
								defaultValue="Hope Children NGO"
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Trading Name</label>
							<input className={s.formControl} defaultValue="Hope Children" />
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Email</label>
							<input
								className={s.formControl}
								defaultValue="info@hopechildren.or.ke"
							/>
						</div>
						<div className="col-md-6">
							<label className={s.formLabel}>Phone</label>
							<input className={s.formControl} defaultValue="0700 123 456" />
						</div>
						<div className="col-12">
							<label className={s.formLabel}>Address</label>
							<input
								className={s.formControl}
								defaultValue="P.O. Box 5678-00100, Nairobi"
							/>
						</div>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M17: Audit Trail */
	const renderAuditTrail = () => (
		<MBox
			id="auditTrailModal"
			active={active}
			size="xl"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-clock-history me-2" />
					Full Audit Trail
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
								"auditTrailModal",
								"Audit trail exported successfully.",
								"",
							)
						}
					>
						Export CSV
					</button>
				</>
			}
		>
			{renderActionBody(
				"auditTrailModal",
				<>
					<div className="d-flex gap-2 mb-3">
						<input
							className={s.formControl}
							style={{ width: 220 }}
							placeholder="Search audit log"
						/>
						<select className={s.formControl} style={{ width: "auto" }}>
							<option>All Actions</option>
							<option>Upload</option>
							<option>Verify</option>
							<option>Approve</option>
							<option>Edit</option>
						</select>
					</div>
					<div
						className="table-responsive"
						style={{ maxHeight: 400, overflowY: "auto" }}
					>
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Timestamp</th>
									<th>Business</th>
									<th>Action</th>
									<th>User</th>
									<th>IP</th>
									<th>Details</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>27 Jun 14:32</td>
									<td>Greenfield Logistics</td>
									<td>TCC Upload</td>
									<td>Compliance Analyst</td>
									<td>102.134.45.12</td>
									<td>Document DOC-88291 uploaded</td>
								</tr>
								<tr>
									<td>27 Jun 11:45</td>
									<td>Shalom SACCO</td>
									<td>Director KYC Verified</td>
									<td>James M.</td>
									<td>102.134.45.12</td>
									<td>Peter Ochieng verified</td>
								</tr>
								<tr>
									<td>26 Jun 16:20</td>
									<td>TechNova Solutions</td>
									<td>UBO Added</td>
									<td>Compliance Analyst</td>
									<td>102.134.45.12</td>
									<td>Grace Wanjiku added (30%)</td>
								</tr>
								<tr>
									<td>25 Jun 09:15</td>
									<td>Hope Children NGO</td>
									<td>Approved</td>
									<td>Head of Compliance</td>
									<td>102.134.45.12</td>
									<td>Full access granted</td>
								</tr>
							</tbody>
						</table>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M18: Pre-fill */
	const renderPreFill = () => (
		<MBox
			id="preFillModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-file-earmark-check me-2" />
					Pre-fill from BRS Data
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
								"preFillModal",
								"Application pre-filled with BRS data. 3 directors imported.",
								"BRS-20250627-99128",
							)
						}
					>
						Pre-fill Application
					</button>
				</>
			}
		>
			{renderActionBody(
				"preFillModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>CR12 Number</label>
						<input className={s.formControl} defaultValue="PVT-99128" />
					</div>
					<div
						className="p-3 rounded mb-3"
						style={{ background: "var(--pm-accent-soft)" }}
					>
						<div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
							DATA RETRIEVED FROM BRS
						</div>
						<div
							style={{
								fontSize: 14,
								fontWeight: 700,
								color: "var(--pm-accent)",
							}}
						>
							TechNova Solutions Limited
						</div>
						<div style={{ fontSize: 12, color: "#065F46" }}>
							CR12: PVT-99128 · KRA PIN: P051234567A · 3 Directors
						</div>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Legal name, registration number, directors
						</label>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="checkbox"
							defaultChecked
						/>
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Shareholding structure
						</label>
					</div>
					<div className="form-check">
						<input className="form-check-input" type="checkbox" />
						<label className="form-check-label" style={{ fontSize: 13 }}>
							Registered address
						</label>
					</div>
				</>,
			)}
		</MBox>
	);

	/* M19: Bulk Document */
	const renderBulkDocument = () => (
		<MBox
			id="bulkDocumentModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-files me-2" />
					Bulk Document Upload
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
								"bulkDocumentModal",
								"5 documents uploaded and queued for verification.",
								"BULK-DOC-20250627",
							)
						}
					>
						Upload All
					</button>
				</>
			}
		>
			{renderActionBody(
				"bulkDocumentModal",
				<>
					<div className="mb-3">
						<label className={s.formLabel}>Business</label>
						<select className={s.formControl}>
							<option>Greenfield Logistics Limited</option>
							<option>TechNova Solutions</option>
						</select>
					</div>
					<div className="mb-3">
						<label className={s.formLabel}>Upload Multiple Files</label>
						<input type="file" className={s.formControl} multiple />
					</div>
					<div
						className="p-3 rounded"
						style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
					>
						<i className="bi bi-info-circle me-1" /> Supported: PDF, JPG, PNG.
						Max 10MB per file.
					</div>
				</>,
			)}
		</MBox>
	);

	/* M20: Attention Full */
	const renderAttentionFull = () => (
		<MBox
			id="attentionFullModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-exclamation-circle text-warning me-2" />
					All Items Requiring Attention
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className={s.statusRow}>
				<div>
					<strong>Nairobi SACCO — TCC expires in 4 days</strong>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("renewTCCModal")}
				>
					Renew
				</button>
			</div>
			<div className={s.statusRow}>
				<div>
					<strong>Peter Ochieng — Director KYC pending 7 days</strong>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("directorKYCModal")}
				>
					Verify
				</button>
			</div>
			<div className={s.statusRow}>
				<div>
					<strong>Greenfield Logistics — Beneficial ownership overdue</strong>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("beneficialOwnerModal")}
				>
					Complete
				</button>
			</div>
			<div className={s.statusRow}>
				<div>
					<strong>TechNova Solutions — Director ID expires in 12 days</strong>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("directorKYCModal")}
				>
					Update
				</button>
			</div>
			<div className={s.statusRow}>
				<div>
					<strong>Shalom SACCO — PEP flag requires review</strong>
				</div>
				<button
					className={cx(s.btnPm, s.btnSm)}
					onClick={() => onOpen("riskAssessmentModal")}
				>
					Review
				</button>
			</div>
		</MBox>
	);

	/* M21: Security Check */
	const renderSecurityCheck = () => (
		<MBox
			id="securityCheckModal"
			active={active}
			size="lg"
			onClose={onClose}
			title={
				<>
					<i className="bi bi-shield-check text-success me-2" />
					KYB/KYC Security Posture
				</>
			}
			footer={
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
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
							87
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#047857" }}>
							COMPLIANCE
						</div>
					</div>
				</div>
				<div className="col-md-3 col-6">
					<div
						className="p-3 rounded text-center"
						style={{ background: "var(--pm-info-soft)" }}
					>
						<div
							style={{ fontSize: 24, fontWeight: 700, color: "var(--pm-info)" }}
						>
							94%
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8" }}>
							UBO COVERAGE
						</div>
					</div>
				</div>
				<div className="col-md-3 col-6">
					<div
						className="p-3 rounded text-center"
						style={{ background: "var(--pm-warning-soft)" }}
					>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-warning)",
							}}
						>
							11
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#B45309" }}>
							EXPIRING
						</div>
					</div>
				</div>
				<div className="col-md-3 col-6">
					<div
						className="p-3 rounded text-center"
						style={{ background: "var(--pm-purple-soft)" }}
					>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: "var(--pm-purple)",
							}}
						>
							2
						</div>
						<div style={{ fontSize: 10, fontWeight: 700, color: "#6D28D9" }}>
							PEP FLAGS
						</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* M22: Profile */
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
				<button className={s.btnPm} onClick={onClose}>
					Close
				</button>
			}
		>
			<div className="text-center">
				<div
					className={cx(s.avatar, "mx-auto mb-3")}
					style={{ width: 64, height: 64, fontSize: 24 }}
				>
					JM
				</div>
				<h5 style={{ fontWeight: 700, marginBottom: 2 }}>James M.</h5>
				<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>
					james.m@paymo.co.ke · +254 700 123 456
				</p>
				<div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
					<div className="col-6">
						<div
							className="p-2 rounded"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<span className="text-muted">Role</span>
							<br />
							<strong>Head of Compliance</strong>
						</div>
					</div>
					<div className="col-6">
						<div
							className="p-2 rounded"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<span className="text-muted">Businesses Managed</span>
							<br />
							<strong>84</strong>
						</div>
					</div>
					<div className="col-6">
						<div
							className="p-2 rounded"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<span className="text-muted">Member Since</span>
							<br />
							<strong>Mar 2022</strong>
						</div>
					</div>
					<div className="col-6">
						<div
							className="p-2 rounded"
							style={{ background: "var(--pm-surface-2)" }}
						>
							<span className="text-muted">Cases Resolved</span>
							<br />
							<strong>1,248</strong>
						</div>
					</div>
				</div>
			</div>
		</MBox>
	);

	/* M23: Notifications */
	const renderNotif = () => (
		<MBox
			id="onboardNotifModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-bell me-2" />
					KYB/KYC Notifications (12)
				</>
			}
			footer={
				<>
					<button
						className={s.btnPm}
						onClick={() => onOpen("notifSettingsModal")}
					>
						Settings
					</button>
					<button className={s.btnPm} onClick={onClose}>
						Close
					</button>
				</>
			}
		>
			<div style={{ maxHeight: 500, overflowY: "auto" }}>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-danger-soft)", fontSize: 13 }}
				>
					<strong>TCC expiring in 4 days</strong>
					<div style={{ fontSize: 11, color: "#7F1D1D" }}>
						Nairobi SACCO — KRA-TCC-88291
					</div>
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-warning-soft)", fontSize: 13 }}
				>
					<strong>Director KYC pending 7 days</strong>
					<div style={{ fontSize: 11, color: "#92400E" }}>
						Peter Ochieng — Greenfield Logistics
					</div>
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-info-soft)", fontSize: 13 }}
				>
					<strong>Beneficial ownership overdue</strong>
					<div style={{ fontSize: 11, color: "#1E40AF" }}>
						Greenfield Logistics — 5 shareholders
					</div>
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{ background: "var(--pm-accent-soft)", fontSize: 13 }}
				>
					<strong>Application approved</strong>
					<div style={{ fontSize: 11, color: "#065F46" }}>
						Hope Children NGO — Full access granted
					</div>
				</div>
				<div
					className="p-3 rounded mb-2"
					style={{
						background: "#fff",
						border: "1px solid var(--pm-border)",
						fontSize: 13,
					}}
				>
					<strong>New application received</strong>
					<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
						Mama Mboga Traders — 45% complete
					</div>
				</div>
			</div>
		</MBox>
	);

	/* M24: Notif Settings */
	const renderNotifSettings = () => (
		<MBox
			id="notifSettingsModal"
			active={active}
			onClose={onClose}
			title={
				<>
					<i className="bi bi-gear me-2" />
					Notification Preferences
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
								"notifSettingsModal",
								"Notification preferences saved.",
								"",
							)
						}
					>
						Save Preferences
					</button>
				</>
			}
		>
			{renderActionBody(
				"notifSettingsModal",
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
									<td>TCC Expiry (30/14/7/1 days)</td>
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
									<td>Director KYC Pending (7/3/1 days)</td>
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
									<td>Beneficial Ownership Overdue</td>
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
									<td>New Application Received</td>
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
										<input type="checkbox" className="form-check-input" />
									</td>
								</tr>
								<tr>
									<td>Application Approved / Rejected</td>
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
			)}
		</MBox>
	);

	return (
		<>
			{renderOnboardNew()}
			{renderDirectorKYC()}
			{renderBeneficialOwner()}
			{renderVerifyDocument()}
			{renderViewDocument()}
			{renderUploadDocument()}
			{renderBulkOnboard()}
			{renderComplianceCheck()}
			{renderPendingQueue()}
			{renderApprovalQueue()}
			{renderApproveBusiness()}
			{renderRiskAssessment()}
			{renderRenewTCC()}
			{renderBulkRenewal()}
			{renderViewBusiness()}
			{renderEditBusiness()}
			{renderAuditTrail()}
			{renderPreFill()}
			{renderBulkDocument()}
			{renderAttentionFull()}
			{renderSecurityCheck()}
			{renderProfile()}
			{renderNotif()}
			{renderNotifSettings()}
		</>
	);
}
