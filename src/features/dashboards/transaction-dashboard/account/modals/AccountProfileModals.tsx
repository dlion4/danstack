/* ============================================================================
 * account/modals/AccountProfileModals.tsx
 * ----------------------------------------------------------------------------
 * All modals for the Account Profile & Digital Bank page, rebuilt on the
 * SHARED modal primitives (ModalShell / SimpleModal / FlowModal / TabbedModal)
 * from transaction-dashboard/shared/components/modals.tsx — no legacy MBox,
 * no Bootstrap-JS, no innerHTML. Every rendered modal is reachable: 25 via
 * page triggers, 9 via in-modal navigation (onOpen): profileSaved (edit →
 * save), docUploaded (KYC upload), viewDoc (KYC table), changePassword +
 * session (attention rows), terminateAllSessions (sessions), enable2FA
 * (suggestion), receipt (activity detail), virtualCard (linked accounts).
 * Legacy orphan privacyModal was cut; dead virtualCardModal reference now
 * implemented.
 * ========================================================================== */
"use client";

import { useId, useState } from "react";
import {
	InfoBox,
	ModalShell,
	ReviewRow,
	SelectField,
	SimpleModal,
	TabbedModal,
	Toggle,
} from "../../shared/components/modals";
import shared from "../../shared/styles/appPage.module.css";
import styles from "../styles/accountProfile.module.css";

const s = shared as Record<string, string>;

/* ---------------------------------------------------------------------------
 * Local labelled-field helpers (label + control paired via htmlFor/useId so
 * no label floats without its control).
 * ------------------------------------------------------------------------- */
function GridField({
	label,
	type = "text",
	defaultValue,
	placeholder,
	span2,
}: {
	label: string;
	type?: string;
	defaultValue?: string;
	placeholder?: string;
	span2?: boolean;
}) {
	const id = useId();
	return (
		<div style={span2 ? { gridColumn: "1 / -1" } : undefined}>
			<label className={s.formLabel} htmlFor={id}>
				{label}
			</label>
			<input
				id={id}
				type={type}
				className={s.formControl}
				defaultValue={defaultValue}
				placeholder={placeholder}
			/>
		</div>
	);
}

function GridSelect({
	label,
	options,
	defaultValue,
	span2,
}: {
	label: string;
	options: string[];
	defaultValue?: string;
	span2?: boolean;
}) {
	const id = useId();
	return (
		<div style={span2 ? { gridColumn: "1 / -1" } : undefined}>
			<label className={s.formLabel} htmlFor={id}>
				{label}
			</label>
			<select id={id} className={s.formControl} defaultValue={defaultValue}>
				{options.map((option) => (
					<option key={option}>{option}</option>
				))}
			</select>
		</div>
	);
}

const fieldGrid: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	gap: "16px",
};

function Pills({
	items,
	active,
	onSelect,
}: {
	items: string[];
	active: number;
	onSelect: (index: number) => void;
}) {
	return (
		<div className={s.pills} style={{ marginBottom: 20 }}>
			{items.map((item, index) => (
				<button
					type="button"
					key={item}
					className={`${s.pill} ${active === index ? s.pillActive : ""}`}
					onClick={() => onSelect(index)}
				>
					{item}
				</button>
			))}
		</div>
	);
}

function ReceiptBody({
	icon,
	title,
	msg,
	refId,
}: {
	icon: string;
	title: string;
	msg: string;
	refId?: string;
}) {
	return (
		<div className={s.receipt}>
			<div className={s.receiptIcon}>
				<i className={`bi ${icon}`} aria-hidden="true" />
			</div>
			<h3 className={s.receiptTitle}>{title}</h3>
			<p className={s.receiptMsg}>{msg}</p>
			{refId ? <div className={s.receiptRef}>{refId}</div> : null}
		</div>
	);
}

export default function AccountProfileModals({
	active,
	onClose,
	onOpen,
}: {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
}) {
	const isOpen = (id: string) => active === id;

	const [editTab, setEditTab] = useState(0);
	const [kycTab, setKycTab] = useState(0);
	const [accTab, setAccTab] = useState(0);
	const [extTab, setExtTab] = useState(0);
	const [notifTab, setNotifTab] = useState(0);
	const [limitTab, setLimitTab] = useState(0);
	const [tierTab, setTierTab] = useState(0);

	return (
		<>
			{/* ============================================================
			   M1. PROFILE OVERVIEW (full view)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("profileModal")}
				onClose={onClose}
				iconCls="bi bi-person-badge"
				title="Profile Overview"
				submitLabel="Close"
			>
				<div className={styles.profileHero} style={{ marginBottom: 16 }}>
					<div className={styles.profileAvatar}>AK</div>
					<div className={styles.profileInfo}>
						<p className={styles.profileName}>Amina Grace Kamau</p>
						<p className={styles.profileMeta}>amina.kamau@personal.co.ke</p>
						<div className={styles.profileBadges}>
							<span className={`${s.badge} ${s.badgeSuccess}`}>
								<i className="bi bi-gem" aria-hidden="true" /> Premium Member
							</span>
							<span className={`${s.badge} ${s.badgePurple}`}>
								<i className="bi bi-calendar-check" aria-hidden="true" /> Since
								Jan 2023
							</span>
						</div>
					</div>
				</div>
				<div className={styles.summaryBox} style={{ marginBottom: 12 }}>
					<span className={styles.mutedSmall}>Full Legal Name</span>
					<strong>Amina Grace Kamau</strong>
				</div>
				<div className={styles.summaryBox} style={{ marginBottom: 12 }}>
					<span className={styles.mutedSmall}>Date of Birth</span>
					<strong>14 Mar 1992</strong>
				</div>
				<div className={styles.summaryBox} style={{ marginBottom: 12 }}>
					<span className={styles.mutedSmall}>National ID</span>
					<strong>32****891 · National ID</strong>
				</div>
				<div className={styles.summaryBox} style={{ marginBottom: 12 }}>
					<span className={styles.mutedSmall}>Address</span>
					<strong>Apt 3A, Lavington Green, Nairobi</strong>
				</div>
				<div className={styles.summaryBox}>
					<span className={styles.mutedSmall}>Language &amp; Timezone</span>
					<strong>English · Africa/Nairobi (EAT)</strong>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M2. EDIT PROFILE (tabbed wizard → profileSaved)
			   ============================================================ */}
			<ModalShell
				show={isOpen("editProfileModal")}
				onClose={onClose}
				iconCls="bi bi-person-gear"
				title="Edit Profile"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${s.button} ${s.buttonSmall}`}
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary} ${s.buttonSmall}`}
							onClick={() => onOpen("profileSavedModal")}
						>
							<i className="bi bi-check-lg" aria-hidden="true" /> Save Changes
						</button>
					</>
				}
			>
				<Pills
					items={["Personal", "Contact", "Address"]}
					active={editTab}
					onSelect={setEditTab}
				/>
				{editTab === 0 && (
					<div style={fieldGrid}>
						<GridField
							label="Full Legal Name"
							defaultValue="Amina Grace Kamau"
						/>
						<GridField label="Preferred Name" defaultValue="Amina K." />
						<GridField
							label="Date of Birth"
							type="date"
							defaultValue="1992-03-14"
						/>
						<GridSelect
							label="Gender"
							options={["Female", "Male", "Prefer not to say"]}
							defaultValue="Female"
						/>
						<GridSelect
							label="Nationality"
							options={["Kenyan", "Ugandan", "Tanzanian", "Rwandan"]}
							defaultValue="Kenyan"
						/>
						<GridField label="ID Number" defaultValue="32****891" />
						<GridField label="ID Type" defaultValue="National ID" />
					</div>
				)}
				{editTab === 1 && (
					<div style={fieldGrid}>
						<GridField
							label="Primary Email"
							type="email"
							defaultValue="amina.kamau@personal.co.ke"
							span2
						/>
						<GridField
							label="Work Email"
							type="email"
							defaultValue="amina@company.co.ke"
							span2
						/>
						<GridField label="Primary Phone" defaultValue="+254 712 345 890" />
						<GridField
							label="Secondary Phone"
							placeholder="Add secondary phone"
						/>
					</div>
				)}
				{editTab === 2 && (
					<div style={fieldGrid}>
						<GridField
							label="Home Address"
							defaultValue="Apt 3A, Lavington Green, Nairobi"
							span2
						/>
						<GridField
							label="Postal Address"
							defaultValue="P.O. Box 4521-00100, Nairobi"
							span2
						/>
						<GridSelect
							label="Language"
							options={["English", "Swahili", "French"]}
							defaultValue="English"
						/>
						<GridSelect
							label="Timezone"
							options={["Africa/Nairobi (EAT)", "UTC", "GMT"]}
							defaultValue="Africa/Nairobi (EAT)"
						/>
					</div>
				)}
			</ModalShell>

			{/* ============================================================
			   M3. PROFILE SAVED (receipt — opened from edit profile)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("profileSavedModal")}
				onClose={onClose}
				iconCls="bi bi-person-check"
				title="Profile Updated"
				submitLabel="Done"
			>
				<ReceiptBody
					icon="bi-check-circle"
					title="Profile saved successfully!"
					msg="Your profile details have been updated and synced across all devices."
					refId="PRF-20250627-8810"
				/>
			</SimpleModal>

			{/* ============================================================
			   M4. KYC & DOCUMENTS (tabbed wizard → docUploaded / viewDoc)
			   ============================================================ */}
			<ModalShell
				show={isOpen("kycModal")}
				onClose={onClose}
				iconCls="bi bi-patch-check"
				title="KYC & Documents"
				size="lg"
				footer={
					<button
						type="button"
						className={`${s.button} ${s.buttonSmall}`}
						onClick={onClose}
					>
						Close
					</button>
				}
			>
				<Pills
					items={["Upload", "View Documents", "Status"]}
					active={kycTab}
					onSelect={setKycTab}
				/>
				{kycTab === 0 && (
					<div style={fieldGrid}>
						<GridSelect
							label="Document Type"
							options={[
								"National ID",
								"Passport",
								"Utility Bill",
								"Bank Statement",
								"Selfie",
							]}
							defaultValue="National ID"
							span2
						/>
						<GridField label="Expiry Date (if applicable)" type="date" />
						<div style={{ gridColumn: "1 / -1" }}>
							<label className={s.formLabel} htmlFor="kyc-upload-file">
								Upload File
							</label>
							<input
								id="kyc-upload-file"
								className={s.formControl}
								type="file"
								accept=".pdf,.jpg,.png"
							/>
							<div
								style={{
									border: "2px dashed var(--pm-border)",
									borderRadius: 12,
									padding: "28px",
									textAlign: "center",
									background: "var(--pm-surface-2)",
									marginTop: 12,
								}}
							>
								<i
									className="bi bi-cloud-arrow-up"
									aria-hidden="true"
									style={{
										fontSize: 30,
										color: "var(--pm-muted)",
										display: "block",
										marginBottom: 8,
									}}
								/>
								<p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>
									Click to upload or drag and drop
								</p>
								<p
									style={{ fontSize: 12, color: "var(--pm-muted)", margin: 0 }}
								>
									PDF, JPG, PNG — max 10 MB
								</p>
								<button
									type="button"
									className={`${s.button} ${s.buttonPrimary} ${s.buttonSmall}`}
									style={{ marginTop: 14 }}
									onClick={() => onOpen("docUploadedModal")}
								>
									<i className="bi bi-upload" aria-hidden="true" /> Upload
									Document
								</button>
							</div>
						</div>
					</div>
				)}
				{kycTab === 1 && (
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Document</th>
									<th>Type</th>
									<th>Status</th>
									<th>Uploaded</th>
									<th>Expiry</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										name: "National ID",
										type: "Identity",
										status: "Verified",
										uploaded: "12 Jan 2023",
										expiry: "—",
										warn: false,
									},
									{
										name: "Passport",
										type: "Identity",
										status: "Verified",
										uploaded: "03 Mar 2024",
										expiry: "Mar 2031",
										warn: false,
									},
									{
										name: "Utility Bill",
										type: "Address",
										status: "Expiring",
										uploaded: "15 May 2025",
										expiry: "15 Aug 2025",
										warn: true,
									},
									{
										name: "Selfie",
										type: "Identity",
										status: "Verified",
										uploaded: "12 Jan 2023",
										expiry: "—",
										warn: false,
									},
									{
										name: "Bank Statement",
										type: "Financial",
										status: "Verified",
										uploaded: "20 Jun 2025",
										expiry: "—",
										warn: false,
									},
								].map((doc) => (
									<tr key={doc.name}>
										<td>
											<strong>{doc.name}</strong>
										</td>
										<td>{doc.type}</td>
										<td>
											<span
												className={`${s.badge} ${
													doc.warn ? s.badgeWarning : s.badgeSuccess
												}`}
											>
												{doc.status}
											</span>
										</td>
										<td>{doc.uploaded}</td>
										<td>{doc.expiry}</td>
										<td>
											<button
												type="button"
												className={`${s.button} ${s.buttonSmall}`}
												onClick={() => onOpen("viewDocModal")}
											>
												{doc.warn ? "Renew" : "View"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{kycTab === 2 && (
					<div>
						<div
							style={{
								background: "var(--pm-green-soft)",
								borderRadius: 12,
								padding: 18,
								marginBottom: 16,
								display: "flex",
								alignItems: "center",
								gap: 12,
							}}
						>
							<i
								className="bi bi-check-circle-fill"
								aria-hidden="true"
								style={{ fontSize: 26, color: "var(--pm-green-dark)" }}
							/>
							<div>
								<div
									style={{
										fontWeight: 700,
										color: "var(--pm-green-dark)",
										fontSize: 14,
									}}
								>
									Verification Status: FULLY VERIFIED
								</div>
								<div style={{ fontSize: 12, color: "#065f46" }}>
									All required documents approved. Account limits fully
									unlocked.
								</div>
							</div>
						</div>
						{[
							{ name: "Identity", pct: 100 },
							{ name: "Address", pct: 75, warn: true },
							{ name: "Financial", pct: 100 },
						].map((row) => (
							<div key={row.name} style={{ marginBottom: 12 }}>
								<div
									className="d-flex justify-content-between mb-1"
									style={{ fontSize: 12 }}
								>
									<span>{row.name}</span>
									<span>{row.pct}%</span>
								</div>
								<div className={s.progressTrack}>
									<div
										className={s.progressBar}
										style={{
											width: `${row.pct}%`,
											background: row.warn ? "var(--pm-warning)" : undefined,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</ModalShell>

			{/* ============================================================
			   M5. DOCUMENT UPLOADED (receipt — opened from KYC upload)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("docUploadedModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark-check"
				title="Document Uploaded"
				submitLabel="Done"
			>
				<ReceiptBody
					icon="bi-check-circle"
					title="Document uploaded successfully!"
					msg="Your document has been submitted for verification. You will be notified within 24 hours."
					refId="KYC-20250627-8812"
				/>
			</SimpleModal>

			{/* ============================================================
			   M6. DOCUMENT VIEWER (opened from KYC table)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("viewDocModal")}
				onClose={onClose}
				iconCls="bi bi-file-earmark"
				title="Document Viewer"
				submitLabel="Download PDF"
			>
				<div
					style={{
						padding: "28px",
						textAlign: "center",
						background: "var(--pm-surface-2)",
						borderRadius: 12,
					}}
				>
					<div
						style={{
							width: 84,
							height: 84,
							borderRadius: 16,
							background: "var(--pm-blue-soft)",
							color: "var(--pm-blue)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 40,
							margin: "0 auto 16px",
						}}
					>
						<i className="bi bi-file-earmark-text" aria-hidden="true" />
					</div>
					<div style={{ fontWeight: 700 }}>National ID — 32****891</div>
					<div style={{ fontSize: 12, color: "var(--pm-muted)", marginTop: 4 }}>
						Verified on 12 Jan 2023
					</div>
					<div className="mt-2">
						<span className={`${s.badge} ${s.badgeSuccess}`}>
							<i className="bi bi-shield-check" aria-hidden="true" /> Authentic
							document
						</span>
					</div>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M7. ALL ATTENTION ITEMS (nested: changePassword / edit /
			   session / kyc)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("attentionModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-triangle"
				title="All Attention Items"
				submitLabel="Close"
			>
				<div>
					{[
						{
							title: "Password expires in 12 days",
							sub: "Last changed 89 days ago",
							label: "Update",
							target: "changePasswordModal",
						},
						{
							title: "Secondary phone not verified",
							sub: "Profile completeness at 98%",
							label: "Verify",
							target: "editProfileModal",
						},
						{
							title: "New login from Windows PC",
							sub: "Nairobi · 26 Jun 2025",
							label: "Review",
							target: "sessionModal",
						},
						{
							title: "Proof of address expiring",
							sub: "Utility bill expires in 45 days",
							label: "Renew",
							target: "kycModal",
						},
						{
							title: "Upgrade to Platinum tier",
							sub: "Higher limits, lower fees, priority support",
							label: "Review",
							target: "bankAccountModal",
						},
					].map((item) => (
						<div className={s.summaryRow} key={item.title}>
							<div>
								<div style={{ fontWeight: 600, fontSize: 13 }}>
									{item.title}
								</div>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
									{item.sub}
								</div>
							</div>
							<button
								type="button"
								className={`${s.button} ${s.buttonSmall}`}
								onClick={() => onOpen(item.target)}
							>
								{item.label}
							</button>
						</div>
					))}
				</div>
			</SimpleModal>

			{/* ============================================================
			   M8. CARD DETAILS (custom footer: Freeze / Copy)
			   ============================================================ */}
			<ModalShell
				show={isOpen("cardDetailsModal")}
				onClose={onClose}
				iconCls="bi bi-credit-card-2-front"
				title="Card Details"
				footer={
					<>
						<button
							type="button"
							className={`${s.button} ${s.buttonSmall}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonDanger} ${s.buttonSmall}`}
						>
							<i className="bi bi-snow" aria-hidden="true" /> Freeze Card
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonPrimary} ${s.buttonSmall}`}
						>
							<i className="bi bi-copy" aria-hidden="true" /> Copy Details
						</button>
					</>
				}
			>
				<div
					style={{
						background:
							"linear-gradient(135deg, #1e293b, #334155 60%, #10b981)",
						borderRadius: 16,
						padding: 24,
						color: "#fff",
						marginBottom: 16,
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 28,
						}}
					>
						<div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
							PAYMO
						</div>
						<div
							style={{
								width: 34,
								height: 24,
								background: "linear-gradient(135deg, #fbbf24, #d97706)",
								borderRadius: 6,
							}}
						/>
					</div>
					<div
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: 18,
							letterSpacing: 3,
							marginBottom: 20,
						}}
					>
						•••• •••• •••• 4412
					</div>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<div>
							<div
								style={{
									fontSize: 9,
									textTransform: "uppercase",
									opacity: 0.7,
								}}
							>
								Card Holder
							</div>
							<div style={{ fontSize: 13, fontWeight: 600 }}>AMINA KAMAU</div>
						</div>
						<div>
							<div
								style={{
									fontSize: 9,
									textTransform: "uppercase",
									opacity: 0.7,
								}}
							>
								Expires
							</div>
							<div style={{ fontSize: 13, fontWeight: 600 }}>08/27</div>
						</div>
						<div>
							<div
								style={{
									fontSize: 9,
									textTransform: "uppercase",
									opacity: 0.7,
								}}
							>
								CVV
							</div>
							<div style={{ fontSize: 13, fontWeight: 600 }}>•••</div>
						</div>
					</div>
				</div>
				<div className={s.summaryRow}>
					<span style={{ color: "var(--pm-ink)" }}>Status</span>
					<span className={`${s.badge} ${s.badgeSuccess}`}>Active</span>
				</div>
				<div className={s.summaryRow}>
					<span style={{ color: "var(--pm-ink)" }}>Spent this month</span>
					<strong>KES 48,200 / 100,000</strong>
				</div>
				<div className={s.summaryRow}>
					<span style={{ color: "var(--pm-ink)" }}>Used in</span>
					<strong>12 merchants</strong>
				</div>
			</ModalShell>

			{/* ============================================================
			   M9. LINKED ACCOUNTS & WALLETS (tabbed → cardDetails /
			   virtualCard)
			   ============================================================ */}
			<TabbedModal
				show={isOpen("linkedAccountsModal")}
				onClose={onClose}
				iconCls="bi bi-link-45deg"
				title="Linked Accounts & Wallets"
				tabs={[
					{
						key: "accounts",
						label: "Accounts",
						render: () => (
							<div>
								{[
									{
										name: "M-Pesa",
										detail: "0712 345 890",
										grad: "linear-gradient(135deg,#4CAF50,#2E7D32)",
										letter: "M",
										linked: true,
									},
									{
										name: "Equity Bank",
										detail: "Account ****4521",
										grad: "linear-gradient(135deg,#FF6F00,#E65100)",
										letter: "E",
										linked: true,
									},
									{
										name: "KCB Bank",
										detail: "Account ****7782",
										grad: "linear-gradient(135deg,#1565C0,#0D47A1)",
										letter: "K",
										linked: false,
									},
									{
										name: "Airtel Money",
										detail: "0733 981 204",
										grad: "linear-gradient(135deg,#D32F2F,#B71C1C)",
										letter: "A",
										linked: false,
									},
								].map((acc) => (
									<div className={s.summaryRow} key={acc.name}>
										<div
											style={{ display: "flex", alignItems: "center", gap: 10 }}
										>
											<div
												style={{
													width: 36,
													height: 36,
													borderRadius: 10,
													background: acc.grad,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: "#fff",
													fontSize: 14,
													fontWeight: 700,
												}}
											>
												{acc.letter}
											</div>
											<div>
												<div style={{ fontWeight: 600, fontSize: 14 }}>
													{acc.name}
												</div>
												<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
													{acc.detail}
												</div>
											</div>
										</div>
										{acc.linked ? (
											<span className={`${s.badge} ${s.badgeSuccess}`}>
												Linked
											</span>
										) : (
											<button
												type="button"
												className={`${s.button} ${s.buttonSmall} ${s.buttonPrimary}`}
												onClick={() => onOpen("linkExternalModal")}
											>
												Link
											</button>
										)}
									</div>
								))}
							</div>
						),
					},
					{
						key: "cards",
						label: "Cards",
						render: () => (
							<div>
								<div className={s.summaryRow}>
									<div
										style={{ display: "flex", alignItems: "center", gap: 10 }}
									>
										<div
											style={{
												width: 36,
												height: 36,
												borderRadius: 10,
												background: "#eef0f4",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 14,
											}}
										>
											<i className="bi bi-credit-card" aria-hidden="true" />
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 14 }}>
												Visa Debit •••• 4412
											</div>
											<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
												Virtual · expires 08/27
											</div>
										</div>
									</div>
									<button
										type="button"
										className={`${s.button} ${s.buttonSmall}`}
										onClick={() => onOpen("cardDetailsModal")}
									>
										View
									</button>
								</div>
								<div className={s.summaryRow}>
									<div
										style={{ display: "flex", alignItems: "center", gap: 10 }}
									>
										<div
											style={{
												width: 36,
												height: 36,
												borderRadius: 10,
												background: "#eef0f4",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 14,
											}}
										>
											<i className="bi bi-credit-card" aria-hidden="true" />
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 14 }}>
												Mastercard •••• 8820
											</div>
											<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>
												Physical · expires 05/28
											</div>
										</div>
									</div>
									<span className={`${s.badge} ${s.badgeWarning}`}>Frozen</span>
								</div>
								<div style={{ marginTop: 12 }}>
									<button
										type="button"
										className={`${s.button} ${s.buttonPrimary}`}
										onClick={() => onOpen("virtualCardModal")}
									>
										<i className="bi bi-plus-lg" aria-hidden="true" /> Create
										Virtual Card
									</button>
								</div>
							</div>
						),
					},
				]}
			/>

			{/* ============================================================
			   M10. CREATE VIRTUAL CARD (opened from linked accounts)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("virtualCardModal")}
				onClose={onClose}
				iconCls="bi bi-plus-circle"
				title="Create Virtual Card"
				submitLabel="Create Card"
				successMsg="Virtual card created successfully!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridField label="Card Name" defaultValue="Personal Spending" />
						<GridSelect
							label="Linked Account"
							options={[
								"PayMo KES Wallet",
								"PayMo USD Account",
								"PayMo Business Account",
							]}
							defaultValue="PayMo KES Wallet"
						/>
						<GridField
							label="Monthly Limit (KES)"
							type="number"
							defaultValue="100000"
						/>
						<GridSelect
							label="Card Type"
							options={["Visa Virtual", "Mastercard Virtual"]}
							defaultValue="Visa Virtual"
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Freeze if suspicious activity detected"
						description="Auto-freeze on unusual merchant patterns"
					/>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Virtual cards
						are issued instantly and can be frozen from the Cards tab at any
						time.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M11. ACTIVITY DETAIL (nested: receipt)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("activityDetailModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-left-right"
				title="Transaction Details"
				submitLabel="Download Receipt"
			>
				<div
					style={{
						textAlign: "center",
						padding: "12px 0 20px",
						borderBottom: "1px solid var(--pm-border)",
						marginBottom: 12,
					}}
				>
					<div style={{ fontSize: 13, color: "var(--pm-muted)" }}>Amount</div>
					<div
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: 30,
							fontWeight: 700,
							color: "var(--pm-green-dark)",
						}}
					>
						+KES 125,000
					</div>
					<span className={`${s.badge} ${s.badgeSuccess}`}>Completed</span>
				</div>
				<ReviewRow label="Reference" value="PAY-20250627-8841" />
				<ReviewRow label="From" value="PayMo KES Wallet" />
				<ReviewRow label="To" value="Amina Grace Kamau" />
				<ReviewRow label="Date" value="27 Jun 2025, 14:22 EAT" />
				<ReviewRow label="Rail" value="PesaLink" />
				<ReviewRow label="Fee" value="KES 50" />
				<ReviewRow label="Narration" value="Salary disbursement" />
				<button
					type="button"
					className={`${s.button} ${s.buttonPrimary} ${s.buttonSmall}`}
					style={{ width: "100%", marginTop: 8 }}
					onClick={() => onOpen("receiptModal")}
				>
					<i className="bi bi-receipt" aria-hidden="true" /> Download Receipt
				</button>
			</SimpleModal>

			{/* ============================================================
			   M12. PAYMENT RECEIPT (opened from activity detail)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("receiptModal")}
				onClose={onClose}
				iconCls="bi bi-receipt"
				title="Payment Receipt"
				submitLabel="Done"
			>
				<div className={s.receipt}>
					<div className={s.receiptIcon}>
						<i className="bi bi-check-lg" aria-hidden="true" />
					</div>
					<h3 className={s.receiptTitle}>KES 125,000</h3>
					<p className={s.receiptMsg}>To Amina Grace Kamau</p>
					<div className={s.receiptRef}>RCT-20250627-8841</div>
				</div>
				<hr style={{ borderColor: "var(--pm-border)" }} />
				<ReviewRow label="Ref" value="PAY-20250627-8841" />
				<ReviewRow label="Date" value="27 Jun 2025" />
				<ReviewRow label="Rail" value="PesaLink" />
				<ReviewRow label="Fee" value="KES 50" />
			</SimpleModal>

			{/* ============================================================
			   M13. CHANGE PASSWORD (opened from attention)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("changePasswordModal")}
				onClose={onClose}
				iconCls="bi bi-key"
				title="Change Password"
				submitLabel="Change Password"
				successMsg="Password changed successfully!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<GridField
						label="Current Password"
						type="password"
						placeholder="Enter current password"
					/>
					<GridField
						label="New Password"
						type="password"
						placeholder="Min 12 characters"
					/>
					<GridField
						label="Confirm New Password"
						type="password"
						placeholder="Confirm new password"
					/>
					<InfoBox variant="info">
						<i className="bi bi-info-circle" aria-hidden="true" /> Must be at
						least 12 characters with uppercase, number and symbol. Cannot reuse
						your last 3 passwords.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M14. ACTIVE SESSIONS (opened from attention; nested:
			   terminateAllSessions)
			   ============================================================ */}
			<ModalShell
				show={isOpen("sessionModal")}
				onClose={onClose}
				iconCls="bi bi-laptop"
				title="Active Sessions"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={`${s.button} ${s.buttonSmall}`}
							onClick={onClose}
						>
							Close
						</button>
						<button
							type="button"
							className={`${s.button} ${s.buttonDanger} ${s.buttonSmall}`}
							onClick={() => onOpen("terminateAllSessionsModal")}
						>
							<i className="bi bi-x-circle" aria-hidden="true" /> Terminate All
							Other Sessions
						</button>
					</>
				}
			>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Device</th>
								<th>Location</th>
								<th>Last Active</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{[
								{
									device: "iPhone 15 Pro",
									detail: "iOS 18.5 • App v4.2.1",
									location: "Nairobi, KE",
									active: "Just now",
									status: "Current",
									current: true,
								},
								{
									device: "MacBook Pro",
									detail: "macOS 15.4 • Safari",
									location: "Nairobi, KE",
									active: "14:22 today",
									status: "Active",
									current: false,
								},
								{
									device: "Windows PC",
									detail: "Windows 11 • Chrome",
									location: "Nairobi, KE",
									active: "26 Jun 2025",
									status: "New",
									current: false,
								},
								{
									device: "iPad Air",
									detail: "iPadOS 18.4 • App",
									location: "Mombasa, KE",
									active: "20 Jun 2025",
									status: "Active",
									current: false,
								},
							].map((row) => (
								<tr key={row.device}>
									<td>
										<strong>{row.device}</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											{row.detail}
										</div>
									</td>
									<td>{row.location}</td>
									<td>{row.active}</td>
									<td>
										<span
											className={`${s.badge} ${
												row.status === "New" ? s.badgeWarning : s.badgeSuccess
											}`}
										>
											{row.status}
										</span>
									</td>
									<td>
										{row.current ? (
											<button
												type="button"
												className={`${s.button} ${s.buttonSmall}`}
												disabled
											>
												This device
											</button>
										) : (
											<button
												type="button"
												className={`${s.button} ${s.buttonSmall}`}
											>
												Terminate
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>

			{/* ============================================================
			   M15. TERMINATE ALL SESSIONS (confirm — opened from sessions)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("terminateAllSessionsModal")}
				onClose={onClose}
				iconCls="bi bi-exclamation-triangle"
				title="Terminate All Sessions?"
				submitLabel="Terminate All"
				successMsg="All sessions terminated!"
			>
				<InfoBox variant="warning">
					<i className="bi bi-exclamation-triangle" aria-hidden="true" /> This
					will log you out from all other devices. You will need to sign in
					again on each device.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   M16. ENABLE 2FA (opened from suggestions)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("enable2FAModal")}
				onClose={onClose}
				iconCls="bi bi-shield-check"
				title="Two-Factor Authentication"
				submitLabel="Enable 2FA"
				successMsg="2FA enabled!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div
						style={{
							width: 160,
							height: 160,
							background: "#fff",
							border: "1px solid var(--pm-border)",
							borderRadius: 12,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto",
						}}
					>
						<i
							className="bi bi-qr-code"
							aria-hidden="true"
							style={{ fontSize: 80, color: "var(--pm-green)" }}
						/>
					</div>
					<div style={{ textAlign: "center" }}>
						<code
							style={{
								fontSize: 12,
								background: "var(--pm-surface-2)",
								padding: "6px 12px",
								borderRadius: 6,
							}}
						>
							JBSW Y3DP EHPK 3PXP
						</code>
					</div>
					<p
						style={{
							fontSize: 12,
							color: "var(--pm-muted)",
							textAlign: "center",
							margin: 0,
						}}
					>
						Scan the QR code with Google Authenticator, Authy or your preferred
						app, then enter the 6-digit code to confirm.
					</p>
					<InfoBox variant="success">
						<i className="bi bi-shield-check" aria-hidden="true" /> Backup codes
						will be generated once 2FA is active — store them safely.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M17. DOWNLOAD YOUR DATA
			   ============================================================ */}
			<SimpleModal
				show={isOpen("downloadDataModal")}
				onClose={onClose}
				iconCls="bi bi-download"
				title="Download Your Data"
				submitLabel="Request Export"
				successMsg="Export requested!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<SelectField
						label="Data Range"
						options={[
							"All data (Jan 2023 – Present)",
							"Last 12 months",
							"Last 3 months",
						]}
					/>
					<SelectField
						label="Format"
						options={["JSON (complete)", "CSV (transactions)", "PDF (summary)"]}
					/>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Your export
						includes profile, transactions, documents and activity logs. Large
						exports may take up to 24 hours. Ref: DATA-20250627-9914.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M18. CONFIGURE TRANSACTION LIMITS
			   ============================================================ */}
			<SimpleModal
				show={isOpen("transactionLimitsModal")}
				onClose={onClose}
				iconCls="bi bi-sliders"
				title="Configure Transaction Limits"
				submitLabel="Save Limits"
				successMsg="Limits updated successfully!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<Pills
						items={[
							"PayMo KES Wallet",
							"Utility Account",
							"Services Account",
							"USD Account",
						]}
						active={limitTab}
						onSelect={setLimitTab}
					/>
					<div style={fieldGrid}>
						<GridField
							label="Daily Limit (KES)"
							type="number"
							defaultValue="500000"
						/>
						<GridField
							label="Monthly Limit (KES)"
							type="number"
							defaultValue="2000000"
						/>
						<GridField
							label="Per Transaction Limit (KES)"
							type="number"
							defaultValue="100000"
						/>
						<GridField
							label="Weekly Limit (KES)"
							type="number"
							defaultValue="1000000"
						/>
						<GridField
							label="Limit Reset Time"
							type="time"
							defaultValue="18:00"
						/>
						<GridSelect
							label="Timezone"
							options={["EAT (Africa/Nairobi)", "UTC", "GMT"]}
							defaultValue="EAT (Africa/Nairobi)"
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Allow limit override with OTP"
						description="Request OTP confirmation when exceeding limits"
					/>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> PayMo to
						PayMo transfers are FREE and unlimited. These limits apply to
						external transfers only. Ref: TLIM-20250627-7732.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M19. BUSINESS ACCOUNT LIMITS
			   ============================================================ */}
			<SimpleModal
				show={isOpen("businessLimitsModal")}
				onClose={onClose}
				iconCls="bi bi-building"
				title="Business Account Limits"
				submitLabel="Save Changes"
				successMsg="Business limits updated successfully!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div
						className={styles.summaryBox}
						style={{ display: "flex", justifyContent: "space-between" }}
					>
						<span className={styles.mutedSmall}>Selected Business</span>
						<strong>TechVentures Ltd</strong>
					</div>
					<div style={fieldGrid}>
						<GridField
							label="Daily Limit (KES)"
							type="number"
							defaultValue="5000000"
						/>
						<GridField
							label="Monthly Limit (KES)"
							type="number"
							defaultValue="15000000"
						/>
						<GridField
							label="Per Transaction Limit (KES)"
							type="number"
							defaultValue="1000000"
						/>
						<GridField
							label="International Limit (USD)"
							type="number"
							defaultValue="50000"
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Require approval for high-value transfers"
						description="Transfers above KES 1,000,000 require secondary approval"
					/>
					<Toggle
						checked={false}
						onChange={() => {}}
						label="Allow employee access"
						description="Grant limited access to designated employees"
					/>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M20. LINK BUSINESS
			   ============================================================ */}
			<SimpleModal
				show={isOpen("linkBusinessModal")}
				onClose={onClose}
				iconCls="bi bi-building-add"
				title="Link Business Account"
				submitLabel="Link Account"
				successMsg="Business linked successfully!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridField
							label="Business Registration Number"
							placeholder="Enter business registration number"
							span2
						/>
						<GridField
							label="Business Name"
							placeholder="Enter registered business name"
							span2
						/>
						<GridField label="KRA PIN" placeholder="Enter KRA PIN" />
						<GridSelect
							label="Business Type"
							options={[
								"Limited Company",
								"Sole Proprietorship",
								"Partnership",
								"NGO/CBO",
							]}
						/>
					</div>
					<InfoBox variant="warning">
						<i className="bi bi-exclamation-triangle" aria-hidden="true" /> You
						will need to upload business registration documents for verification
						after linking.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M21. UNLINK BUSINESS (confirm)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("unlinkBusinessModal")}
				onClose={onClose}
				iconCls="bi bi-x-circle"
				title="Unlink Business Account?"
				submitLabel="Unlink Account"
				successMsg="Business account unlinked!"
			>
				<InfoBox variant="warning">
					<i className="bi bi-exclamation-triangle" aria-hidden="true" />{" "}
					<strong>TechVentures Ltd</strong> will lose access to this PayMo
					account. Scheduled transfers to this business will be paused.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   M22. LINK EXTERNAL ACCOUNT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("linkExternalModal")}
				onClose={onClose}
				iconCls="bi bi-link-45deg"
				title="Link External Account"
				submitLabel="Link Account"
				successMsg="External account linked successfully!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridSelect
							label="Account Type"
							options={["Bank Account", "Mobile Money", "Crypto Wallet"]}
							span2
						/>
						<GridSelect
							label="Bank / Provider"
							options={[
								"Equity Bank",
								"KCB Bank",
								"Standard Chartered",
								"Cooperative Bank",
								"ABSA Bank",
								"M-Pesa",
								"Airtel Money",
							]}
							span2
						/>
						<GridField
							label="Account Number / Phone"
							placeholder="Enter account number or phone"
						/>
						<GridSelect
							label="Currency"
							options={["KES", "USD", "EUR", "GBP"]}
							defaultValue="KES"
						/>
						<GridField
							label="Account Name"
							placeholder="Registered account name"
							span2
						/>
					</div>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Small test
						deposits verify ownership before the account becomes active.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M23. UNLINK EXTERNAL ACCOUNT (confirm)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("unlinkExternalModal")}
				onClose={onClose}
				iconCls="bi bi-x-circle"
				title="Unlink External Account?"
				submitLabel="Unlink Account"
				successMsg="External account unlinked!"
			>
				<InfoBox variant="warning">
					<i className="bi bi-exclamation-triangle" aria-hidden="true" /> This
					account will be removed from your external payouts. Scheduled
					transfers to it will be paused.
				</InfoBox>
			</SimpleModal>

			{/* ============================================================
			   M24. MANAGE EXTERNAL ACCOUNTS
			   ============================================================ */}
			<SimpleModal
				show={isOpen("externalAccountsModal")}
				onClose={onClose}
				iconCls="bi bi-link-45deg"
				title="Manage External Accounts"
				submitLabel="Save Changes"
				successMsg="External account settings updated!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<Pills
						items={["Bank Accounts", "Mobile Money", "Crypto Wallets"]}
						active={extTab}
						onSelect={setExtTab}
					/>
					{extTab === 0 && (
						<div style={fieldGrid}>
							<GridSelect
								label="Bank Name"
								options={[
									"Equity Bank",
									"KCB Bank",
									"Standard Chartered",
									"Cooperative Bank",
									"ABSA Bank",
									"Other",
								]}
								span2
							/>
							<GridField
								label="Account Number"
								placeholder="Enter account number"
								span2
							/>
							<GridSelect
								label="Account Type"
								options={["Savings", "Current", "Fixed Deposit"]}
							/>
							<GridSelect
								label="Currency"
								options={["KES", "USD", "EUR", "GBP"]}
								defaultValue="KES"
							/>
						</div>
					)}
					{extTab === 1 && (
						<div style={fieldGrid}>
							<GridSelect
								label="Mobile Money Provider"
								options={["M-Pesa", "Airtel Money", "T-Kash"]}
							/>
							<GridField label="Phone Number" placeholder="07XX XXX XXX" />
							<GridField
								label="Account Name"
								placeholder="Registered account name"
								span2
							/>
						</div>
					)}
					{extTab === 2 && (
						<div style={fieldGrid}>
							<GridField
								label="Wallet Address"
								placeholder="0x… or bc1…"
								span2
							/>
							<GridSelect
								label="Network"
								options={["Ethereum (ERC-20)", "Bitcoin", "USDT (TRC-20)"]}
								span2
							/>
						</div>
					)}
					<Toggle
						checked
						onChange={() => {}}
						label="Set as default payout account"
						description="This account will be used for automatic payouts"
					/>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M25. CREATE AUTO PAYOUT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("createPayoutModal")}
				onClose={onClose}
				iconCls="bi bi-plus-circle"
				title="New Auto Payout Schedule"
				submitLabel="Create Schedule"
				successMsg="Auto payout scheduled!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridField
							label="Schedule Name"
							placeholder="e.g., Daily Sweep to Equity"
							span2
						/>
						<GridSelect
							label="Payout Type"
							options={[
								"Daily",
								"Weekly",
								"Monthly",
								"Instant (Real-time)",
								"Custom",
							]}
						/>
						<GridField label="Amount" placeholder="KES amount or %" />
						<GridSelect
							label="Destination Account"
							options={[
								"Equity Bank •••• 4521",
								"KCB Bank •••• 7782",
								"M-Pesa 0712 345 890",
								"Airtel Money 0733 456 789",
							]}
							span2
						/>
						<GridField label="Schedule Time" type="time" defaultValue="18:00" />
						<GridField
							label="Day of Week / Month"
							placeholder="e.g., Monday / 1st"
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Minimum balance threshold"
						description="Only payout if balance exceeds KES 50,000"
					/>
					<InfoBox>
						<i className="bi bi-lightning-charge" aria-hidden="true" /> Instant
						payouts automatically transfer funds when money is collected from
						clients in real-time.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M26. AUTO PAYOUT SCHEDULING (configure existing)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("autoPayoutsModal")}
				onClose={onClose}
				iconCls="bi bi-arrow-repeat"
				title="Configure Auto Payout"
				submitLabel="Save Schedule"
				successMsg="Auto payout schedule saved!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridField
							label="Schedule Name"
							defaultValue="Daily Sweep to Equity"
							span2
						/>
						<GridSelect
							label="Payout Type"
							options={[
								"Daily",
								"Weekly",
								"Monthly",
								"Instant (Real-time)",
								"Custom",
							]}
							defaultValue="Daily"
						/>
						<GridField label="Amount" defaultValue="KES 100,000" />
						<GridSelect
							label="Destination Account"
							options={[
								"Equity Bank •••• 4521",
								"KCB Bank •••• 7782",
								"M-Pesa 0712 345 890",
								"Airtel Money 0733 456 789",
							]}
							defaultValue="Equity Bank •••• 4521"
							span2
						/>
						<GridField label="Schedule Time" type="time" defaultValue="18:00" />
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Minimum balance threshold"
						description="Only payout if balance exceeds KES 50,000"
					/>
					<InfoBox>
						<i className="bi bi-lightning-charge" aria-hidden="true" /> Instant
						payouts automatically transfer funds when money is collected from
						clients in real-time.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M27. SECURITY LIMITS & OTP
			   ============================================================ */}
			<SimpleModal
				show={isOpen("securityLimitsModal")}
				onClose={onClose}
				iconCls="bi bi-shield-lock"
				title="Security Limits & OTP Verification"
				submitLabel="Save Security Rules"
				successMsg="Security limits updated!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<Pills
						items={[
							"Internal Transfers",
							"External Bank",
							"Mobile Money",
							"International",
							"Bill Payment",
						]}
						active={accTab}
						onSelect={setAccTab}
					/>
					<div style={fieldGrid}>
						<GridField
							label="OTP Threshold (KES)"
							type="number"
							defaultValue="500000"
						/>
						<GridSelect
							label="OTP Method"
							options={[
								"SMS",
								"WhatsApp",
								"Email",
								"SMS + WhatsApp",
								"SMS + WhatsApp + Email",
							]}
							defaultValue="WhatsApp"
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Require OTP for this transfer type"
						description="Enable OTP verification for transfers above threshold"
					/>
					<Toggle
						checked={false}
						onChange={() => {}}
						label="Biometric verification (mobile only)"
						description="Use fingerprint or face recognition for additional security"
					/>
					<InfoBox variant="danger">
						<i className="bi bi-exclamation-triangle" aria-hidden="true" /> OTP
						verification protects against unauthorized transfers. Set
						appropriate thresholds based on your risk tolerance.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M28. COUNTRY RESTRICTIONS & VERIFICATION
			   ============================================================ */}
			<SimpleModal
				show={isOpen("countryRestrictionsModal")}
				onClose={onClose}
				iconCls="bi bi-globe"
				title="Country Restrictions & Verification"
				submitLabel="Save Restrictions"
				successMsg="Country restrictions updated!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridSelect
							label="Country"
							options={[
								"Kenya (KE) - National",
								"Uganda (UG)",
								"Tanzania (TZ)",
								"Rwanda (RW)",
								"United States (US)",
								"United Kingdom (GB)",
								"United Arab Emirates (AE)",
								"Other",
							]}
							span2
						/>
						<GridSelect
							label="Status"
							options={["Allowed", "Restricted", "Blocked"]}
							defaultValue="Allowed"
						/>
						<GridField
							label="Transfer Limit (KES)"
							type="number"
							placeholder="0 for blocked"
						/>
						<GridSelect
							label="Verification Required"
							options={[
								"None",
								"KYC Required",
								"Enhanced KYC",
								"Enhanced KYC + KRA",
								"Manual Compliance Review",
							]}
							span2
						/>
					</div>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Transfers to
						Kenya (your national country) are free and unlimited. International
						transfers may require enhanced verification.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M29. RISK MITIGATION RULES
			   ============================================================ */}
			<SimpleModal
				show={isOpen("riskMitigationModal")}
				onClose={onClose}
				iconCls="bi bi-shield-check"
				title="Risk Mitigation Rules"
				submitLabel="Save Rules"
				successMsg="Risk mitigation rules updated!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridField
							label="Threshold (KES)"
							type="number"
							defaultValue="1000000"
						/>
						<GridSelect
							label="Requirement"
							options={[
								"KYC Verification",
								"KRA PIN Verification",
								"Source of Funds Declaration",
								"Manual Compliance Review",
								"Enhanced Due Diligence",
							]}
						/>
						<GridSelect
							label="Applies To"
							options={[
								"All transfers",
								"Business transfers only",
								"International transfers only",
								"High-risk countries only",
							]}
							span2
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Auto-hold suspicious transactions"
						description="Transactions requiring review will be held for manual approval"
					/>
					<InfoBox variant="warning">
						<i className="bi bi-exclamation-triangle" aria-hidden="true" />{" "}
						Transactions above KES 1,000,000 automatically trigger KYC
						verification. Business transfers above KES 1,000,000 also require
						KRA PIN verification.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M30. TRANSACTION FEE STRUCTURE (static reference)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("feeStructureModal")}
				onClose={onClose}
				iconCls="bi bi-cash-coin"
				title="Transaction Fee Structure"
				submitLabel="Close"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					{[
						{
							type: "PayMo to PayMo",
							fee: "FREE",
							desc: "Instant transfers between PayMo accounts",
							highlight: true,
						},
						{
							type: "PayMo to M-Pesa",
							fee: "KES 25",
							desc: "Standard mobile money withdrawal",
						},
						{
							type: "PayMo to Airtel Money",
							fee: "KES 25",
							desc: "Standard mobile money withdrawal",
						},
						{
							type: "PayMo to Bank (Local)",
							fee: "KES 50",
							desc: "Instant bank transfer (PesaLink)",
						},
						{
							type: "PayMo to Bank (International)",
							fee: "1.5%",
							desc: "SWIFT transfer (min KES 500)",
						},
						{
							type: "Bill Payment",
							fee: "KES 10",
							desc: "Utility and service bill payments",
						},
						{
							type: "Card Purchase",
							fee: "0.5%",
							desc: "Virtual/physical card transactions",
						},
					].map((item) => (
						<div
							key={item.type}
							className={s.summaryRow}
							style={{
								background: item.highlight
									? "var(--pm-green-soft)"
									: "var(--pm-surface-2)",
								padding: "12px 16px",
								borderRadius: 8,
							}}
						>
							<div style={{ flex: 1 }}>
								<strong style={{ fontSize: 13 }}>{item.type}</strong>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
									{item.desc}
								</div>
							</div>
							<span
								style={{
									fontWeight: 700,
									color: item.highlight
										? "var(--pm-green-dark)"
										: "var(--pm-green)",
									fontSize: 14,
								}}
							>
								{item.fee}
							</span>
						</div>
					))}
					<InfoBox variant="success">
						<i className="bi bi-check-circle" aria-hidden="true" />{" "}
						<strong>PayMo to PayMo transfers are FREE</strong> — Send money
						instantly between PayMo accounts at no cost.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M31. ACCOUNT HIERARCHY & FUND FLOW (static reference)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("accountHierarchyModal")}
				onClose={onClose}
				iconCls="bi bi-diagram-3"
				title="Account Hierarchy & Fund Flow"
				submitLabel="Close"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div className={styles.summaryBoxAccent}>
						<span className={styles.mutedSmall}>
							<i className="bi bi-diagram-3" aria-hidden="true" /> Primary
							Wallet
						</span>
						<strong>PayMo KES Wallet · KES 1,284,300</strong>
					</div>
					<div style={{ textAlign: "center" }}>
						<i
							className="bi bi-arrow-down"
							aria-hidden="true"
							style={{ fontSize: 20, color: "var(--pm-muted)" }}
						/>
					</div>
					<div className={styles.summaryBox}>
						<span className={styles.mutedSmall}>
							<i className="bi bi-diagram-2" aria-hidden="true" /> Sub-Accounts
							(Auto-draw)
						</span>
						<strong>Utility Account · KES 150,000</strong>
					</div>
					<div className={styles.summaryBox}>
						<span className={styles.mutedSmall}>Services Account</span>
						<strong>KES 85,000</strong>
					</div>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Sub-accounts
						automatically draw funds from the primary wallet when needed. Set up
						utility and services accounts for better expense tracking.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M32. CREATE SUB-ACCOUNT
			   ============================================================ */}
			<SimpleModal
				show={isOpen("createSubAccountModal")}
				onClose={onClose}
				iconCls="bi bi-plus-circle"
				title="Create Sub-Account"
				submitLabel="Create Account"
				successMsg="Sub-account created and linked to the primary wallet!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={fieldGrid}>
						<GridField
							label="Account Name"
							placeholder="e.g., Utility Account, Services Account"
							span2
						/>
						<GridSelect
							label="Account Type"
							options={[
								"Utility Account",
								"Services Account",
								"Expense Account",
								"Savings Account",
								"Custom",
							]}
						/>
						<GridSelect
							label="Parent Account"
							options={["PayMo KES Wallet", "PayMo USD Account"]}
							defaultValue="PayMo KES Wallet"
						/>
						<GridField
							label="Daily Limit (KES)"
							type="number"
							defaultValue="200000"
						/>
						<GridField
							label="Initial Balance (KES)"
							type="number"
							defaultValue="0"
						/>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Auto-draw from parent account"
						description="Automatically transfer funds from parent when balance is low"
					/>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Sub-accounts
						automatically draw funds from the primary wallet when needed.
						Perfect for expense tracking and budgeting.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M33. ADVANCED TRANSACTION NOTIFICATIONS
			   ============================================================ */}
			<SimpleModal
				show={isOpen("transactionNotificationsModal")}
				onClose={onClose}
				iconCls="bi bi-bell"
				title="Transaction Notifications"
				submitLabel="Save Preferences"
				successMsg="Notification preferences saved!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<Pills
						items={[
							"All Transactions",
							"High-Value",
							"International",
							"Failed",
							"Security",
						]}
						active={notifTab}
						onSelect={setNotifTab}
					/>
					<div
						style={{
							background: "var(--pm-surface-2)",
							borderRadius: 12,
							padding: 16,
						}}
					>
						<div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
							Notification Channels
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							{[
								{ label: "SMS Notifications", icon: "bi-phone" },
								{ label: "Email Notifications", icon: "bi-envelope" },
								{ label: "WhatsApp Notifications", icon: "bi-whatsapp" },
								{ label: "Push Notifications", icon: "bi-bell" },
							].map((channel) => (
								<Toggle
									key={channel.label}
									checked
									onChange={() => {}}
									label={channel.label}
									description={`Receive ${channel.label.toLowerCase()}`}
								/>
							))}
						</div>
					</div>
					<Toggle
						checked
						onChange={() => {}}
						label="Real-time alerts"
						description="Receive instant notifications for all transaction activities"
					/>
					<InfoBox>
						<i className="bi bi-info-circle" aria-hidden="true" /> Configure
						notifications for all transaction events, security alerts, and limit
						warnings via SMS, Email, WhatsApp, and Push.
					</InfoBox>
				</div>
			</SimpleModal>

			{/* ============================================================
			   M34. UPGRADE ACCOUNT LIMITS (bankAccountModal)
			   ============================================================ */}
			<SimpleModal
				show={isOpen("bankAccountModal")}
				onClose={onClose}
				iconCls="bi bi-graph-up-arrow"
				title="Upgrade Account Limits"
				submitLabel="Upgrade Tier"
				successMsg="Upgrade request submitted!"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<Pills
						items={["Premium", "Platinum", "Business Elite"]}
						active={tierTab}
						onSelect={setTierTab}
					/>
					<div
						className={styles.summaryBox}
						style={{ display: "flex", justifyContent: "space-between" }}
					>
						<span className={styles.mutedSmall}>Current Tier</span>
						<strong>Premium</strong>
					</div>
					{[
						{
							label: "Monthly transfer limit",
							value: "KES 2,000,000 → KES 10,000,000",
						},
						{
							label: "Per transaction limit",
							value: "KES 100,000 → KES 1,000,000",
						},
						{ label: "International transfers", value: "Enhanced KYC + KRA" },
						{ label: "Support", value: "Priority 24/7 desk" },
					].map((row) => (
						<div className={s.summaryRow} key={row.label}>
							<span style={{ color: "var(--pm-ink)" }}>{row.label}</span>
							<strong>{row.value}</strong>
						</div>
					))}
					<InfoBox variant="info">
						<i className="bi bi-info-circle" aria-hidden="true" /> Platinum
						reviews are completed within 1 business day. Business Elite requires
						KRA PIN verification and a compliance call.
					</InfoBox>
				</div>
			</SimpleModal>
		</>
	);
}
