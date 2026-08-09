/* ============================================================================
 * OnboardingModals.tsx — all modals for the Business Onboarding page.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: onboarding_full.html modal blocks (Bootstrap data-api + inline
 * JS) and REBUILT as state-driven React modals on the shared modal primitives.
 *
 * MODALS
 *   wizardModal ....... 9-step adaptive onboarding wizard (Type → Identity →
 *                        Owner → Contact → Docs → Banking → Ops → Compliance →
 *                        Review). Every step has real, comprehensive fields;
 *                        the DOCS step is driven by the selected business type
 *                        (freelancer ≠ sole proprietor ≠ small-scale). Draft is
 *                        persisted to localStorage so a user can save and
 *                        return later; skipped steps stay unlocked and can be
 *                        revisited. Submitting documents keeps a per-doc status
 *                        (verified / pending / rejected / not submitted) and
 *                        rejected/pending docs can be re-uploaded later.
 *   bizTypeModal ...... quick business-type picker (used as the wizard's step 1
 *                        alternative from the hero when no type chosen yet).
 *   uploadModal ....... document upload tray w/ drag & drop + statuses.
 *   aiModal ........... AI document analysis (priority-ranked next steps).
 *   limitsModal ....... transaction-limit comparison table.
 *   upgradeModal ...... upgrade-to-certified checklist.
 *   statusModal ....... verification status overview.
 *   checklistModal .... full document checklist.
 *   benefitsModal ..... benefits comparison table.
 *   activityModal ..... full activity log.
 *   howToModal ........ guide to obtaining each document.
 *   successModal ...... post-submission confirmation.
 *
 * STYLES: ../styles/onboarding.module.css (emerald theme = shared tokens).
 * ========================================================================== */
"use client";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import {
	ModalShell,
	SimpleModal,
	TabbedModal,
} from "../../shared/components/modals";
import s from "../styles/onboarding.module.css";

const styles = s as Record<string, string>;

/* --------------------------------------------------------------------------
 * Types + content model (mirrors GET /api/onboarding).
 * ------------------------------------------------------------------------ */
export type DocStatus = "verified" | "pending" | "rejected" | "not-submitted";

export interface DocDef {
	key: string;
	label: string;
	hint: string;
	required: boolean;
}

export interface BizTypeDef {
	key: string;
	name: string;
	icon: string;
	desc: string;
	docs: DocDef[];
}

export interface UploadedFile {
	name: string;
	size: string;
	status: DocStatus;
	rejectedReason?: string;
}

export interface WizardDraft {
	bizType: string;
	step: number;
	lastVisited: string;
	fields: Record<string, string>;
	docs: Record<string, UploadedFile>;
	completedSteps: number[];
	submitted: boolean;
}

export interface OnboardingData {
	bizTypes: BizTypeDef[];
	activity: {
		time: string;
		action: string;
		doc: string;
		status: string;
		tone: "success" | "warn" | "pending";
	}[];
}

/* --------------------------------------------------------------------------
 * Business-type-specific document matrices. A freelance business does NOT
 * need a county permit; a sole proprietor does not need a portfolio. Each
 * type's required documents drive its own progress metric + checklist.
 * ------------------------------------------------------------------------ */
export const BIZ_TYPES: BizTypeDef[] = [
	{
		key: "small-scale",
		name: "Small Scale",
		icon: "bi-shop",
		desc: "Unregistered local shop / kiosk",
		docs: [
			{
				key: "national-id",
				label: "Owner's National ID (Front & Back)",
				hint: "JPG, PNG or PDF • Max 10MB",
				required: true,
			},
			{
				key: "business-photo",
				label: "Business Photo / Logo",
				hint: "JPG or PNG • Max 10MB",
				required: true,
			},
			{
				key: "phone-verify",
				label: "Phone Number Verification",
				hint: "M-Pesa or Airtel line in your name",
				required: true,
			},
			{
				key: "utility-bill",
				label: "Utility Bill (Proof of Address)",
				hint: "KPLC / water bill under 3 months",
				required: false,
			},
		],
	},
	{
		key: "startup",
		name: "Startup",
		icon: "bi-rocket-takeoff",
		desc: "Early stage, pre-revenue",
		docs: [
			{
				key: "national-id",
				label: "Founder's National ID (Front & Back)",
				hint: "JPG, PNG or PDF • Max 10MB",
				required: true,
			},
			{
				key: "business-photo",
				label: "Business Logo / Brand Asset",
				hint: "JPG or PNG • Max 10MB",
				required: true,
			},
			{
				key: "kra-pin",
				label: "KRA PIN Certificate",
				hint: "itax.kra.go.ke • Free • Instant",
				required: true,
			},
			{
				key: "bank-statement",
				label: "Bank Statement (3 months)",
				hint: "PDF • same day from online banking",
				required: true,
			},
		],
	},
	{
		key: "solo-proprietor",
		name: "Solo Proprietor",
		icon: "bi-person-badge",
		desc: "One-person registered business",
		docs: [
			{
				key: "national-id",
				label: "Owner's National ID (Front & Back)",
				hint: "JPG, PNG or PDF • Max 10MB",
				required: true,
			},
			{
				key: "business-photo",
				label: "Business Photo / Logo",
				hint: "JPG or PNG • Max 10MB",
				required: true,
			},
			{
				key: "kra-pin",
				label: "KRA PIN Certificate",
				hint: "itax.kra.go.ke • Free • Instant",
				required: true,
			},
			{
				key: "registration",
				label: "Business Registration Certificate",
				hint: "eCitizen • ~KES 1,000 • 3-5 days",
				required: true,
			},
			{
				key: "county-permit",
				label: "County Business Permit",
				hint: "County office • KES 5,000-15,000/yr",
				required: true,
			},
			{
				key: "bank-statement",
				label: "Bank Statement (3 months)",
				hint: "PDF • same day from online banking",
				required: true,
			},
		],
	},
	{
		key: "freelance",
		name: "Freelance",
		icon: "bi-laptop",
		desc: "Remote work, gig economy",
		docs: [
			{
				key: "national-id",
				label: "Your National ID (Front & Back)",
				hint: "JPG, PNG or PDF • Max 10MB",
				required: true,
			},
			{
				key: "business-photo",
				label: "Profile Photo / Personal Brand",
				hint: "JPG or PNG • Max 10MB",
				required: true,
			},
			{
				key: "portfolio",
				label: "Portfolio / Sample Work",
				hint: "PDF or images showing recent work",
				required: true,
			},
			{
				key: "bank-statement",
				label: "Bank or Mobile-Money Statement",
				hint: "3 months • shows your name",
				required: false,
			},
		],
	},
	{
		key: "creative",
		name: "Creative",
		icon: "bi-palette",
		desc: "Design, writing, consulting",
		docs: [
			{
				key: "national-id",
				label: "Your National ID (Front & Back)",
				hint: "JPG, PNG or PDF • Max 10MB",
				required: true,
			},
			{
				key: "business-photo",
				label: "Brand / Studio Logo",
				hint: "JPG or PNG • Max 10MB",
				required: true,
			},
			{
				key: "portfolio",
				label: "Portfolio / Published Samples",
				hint: "PDF or images • Behance/Dribbble link OK",
				required: true,
			},
			{
				key: "kra-pin",
				label: "KRA PIN Certificate",
				hint: "itax.kra.go.ke • Free • Instant",
				required: true,
			},
		],
	},
	{
		key: "other",
		name: "Other",
		icon: "bi-three-dots",
		desc: "Something else",
		docs: [
			{
				key: "national-id",
				label: "Owner's National ID (Front & Back)",
				hint: "JPG, PNG or PDF • Max 10MB",
				required: true,
			},
			{
				key: "business-photo",
				label: "Business Photo / Logo",
				hint: "JPG or PNG • Max 10MB",
				required: true,
			},
			{
				key: "utility-bill",
				label: "Utility Bill (Proof of Address)",
				hint: "KPLC / water bill under 3 months",
				required: false,
			},
		],
	},
];

export function getBizType(key: string): BizTypeDef {
	return BIZ_TYPES.find((b) => b.key === key) ?? BIZ_TYPES[0];
}

export function emptyDraft(): WizardDraft {
	return {
		bizType: "",
		step: 1,
		lastVisited: new Date().toISOString(),
		fields: {},
		docs: {},
		completedSteps: [],
		submitted: false,
	};
}

const DRAFT_KEY = "paymo-onboarding-draft";

export function loadDraft(): WizardDraft {
	try {
		const raw = localStorage.getItem(DRAFT_KEY);
		if (!raw) return emptyDraft();
		const parsed = JSON.parse(raw) as Partial<WizardDraft>;
		return {
			...emptyDraft(),
			...parsed,
			fields: parsed.fields ?? {},
			docs: parsed.docs ?? {},
		};
	} catch {
		return emptyDraft();
	}
}

export function saveDraft(draft: WizardDraft) {
	try {
		localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
	} catch {
		/* storage full / unavailable — ignore in demo */
	}
}

export function clearDraft() {
	try {
		localStorage.removeItem(DRAFT_KEY);
	} catch {
		/* ignore */
	}
}

/* --------------------------------------------------------------------------
 * Progress metrics — each business type has its OWN doc requirement set, so
 * "percent complete" is computed against that type's docs, not a global list.
 * ------------------------------------------------------------------------ */
export function docProgress(draft: WizardDraft): {
	done: number;
	required: number;
	total: number;
	pct: number;
} {
	const type = getBizType(draft.bizType || "small-scale");
	const docs = type.docs;
	let done = 0;
	let required = 0;
	docs.forEach((d) => {
		const f = draft.docs[d.key];
		if (d.required) {
			required += 1;
			if (f && (f.status === "verified" || f.status === "pending")) done += 1;
		} else if (f && (f.status === "verified" || f.status === "pending")) {
			done += 1;
		}
	});
	const pct = required === 0 ? 100 : Math.round((done / required) * 100);
	return { done, required, total: docs.length, pct };
}

/* --------------------------------------------------------------------------
 * Small helpers
 * ------------------------------------------------------------------------ */
function WField({
	label,
	value,
	onChange,
	placeholder,
	required,
	type = "text",
	half,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	required?: boolean;
	type?: string;
	half?: boolean;
}) {
	return (
		<div className={half ? "col-md-6" : "col-12"}>
			<div className="mb-3">
				<label className={styles.fieldLabel} htmlFor={`wf-${label}`}>
					{label}{" "}
					{required && <span style={{ color: "var(--danger)" }}> *</span>}
				</label>
				<input
					id={`wf-${label}`}
					type={type}
					className={styles.field}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
				/>
			</div>
		</div>
	);
}

function WSelect({
	label,
	value,
	onChange,
	options,
	required,
	half,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	options: string[];
	required?: boolean;
	half?: boolean;
}) {
	return (
		<div className={half ? "col-md-6" : "col-12"}>
			<div className="mb-3">
				<label className={styles.fieldLabel} htmlFor={`ws-${label}`}>
					{label}{" "}
					{required && <span style={{ color: "var(--danger)" }}> *</span>}
				</label>
				<select
					id={`ws-${label}`}
					className={cx(styles.field, styles.select)}
					value={value}
					onChange={(e) => onChange(e.target.value)}
				>
					<option value="">— Select —</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

const TONE_BADGE: Record<
	DocStatus,
	{ cls: string; label: string; icon: string }
> = {
	verified: {
		cls: styles.badgeSuccess,
		label: "Verified",
		icon: "bi-check-circle",
	},
	pending: { cls: styles.badgeWarn, label: "Pending", icon: "bi-clock" },
	rejected: { cls: styles.badgeDanger, label: "Rejected", icon: "bi-x-circle" },
	"not-submitted": {
		cls: styles.badgeOutline,
		label: "Not submitted",
		icon: "bi-upload",
	},
};

function fmtBytes(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ==========================================================================
 * Document upload row — shared by the wizard Docs step + upload modal.
 * Supports re-uploading rejected/pending docs and removing files.
 * ======================================================================== */
function UploadRow({
	doc,
	file,
	onFile,
	onRemove,
}: {
	doc: DocDef;
	file?: UploadedFile;
	onFile: (f: UploadedFile) => void;
	onRemove: () => void;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [dragover, setDragover] = useState(false);
	const [busy, setBusy] = useState(false);

	const accept = (list: FileList | null) => {
		if (!list || list.length === 0) return;
		const f = list[0];
		setBusy(true);
		// Simulated upload → "pending review"
		setTimeout(() => {
			onFile({
				name: f.name,
				size: fmtBytes(f.size),
				status: "pending",
			});
			setBusy(false);
		}, 900);
	};

	const tone = file ? TONE_BADGE[file.status] : TONE_BADGE["not-submitted"];

	return (
		<div
			className={cx(styles.checklistItem, dragover && styles.uploadDragover)}
			style={{ cursor: "pointer" }}
			role="button"
			tabIndex={0}
			onClick={() => inputRef.current?.click()}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
			}}
			onDragEnter={(e) => {
				e.preventDefault();
				setDragover(true);
			}}
			onDragOver={(e) => e.preventDefault()}
			onDragLeave={(e) => {
				e.preventDefault();
				setDragover(false);
			}}
			onDrop={(e) => {
				e.preventDefault();
				setDragover(false);
				accept(e.dataTransfer.files);
			}}
		>
			<div className={styles.checklistIcon}>
				<i
					className={cx(
						"bi",
						file?.status === "verified"
							? "bi-check"
							: file?.status === "rejected"
								? "bi-exclamation"
								: file?.status === "pending"
									? "bi-clock"
									: "bi-upload",
					)}
				/>
			</div>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div className={styles.checklistLabel}>
					{doc.label}{" "}
					{doc.required && <span style={{ color: "var(--danger)" }}>*</span>}
				</div>
				{file ? (
					<div
						className="d-flex align-items-center gap-2 flex-wrap"
						style={{ fontSize: 12, color: "var(--ink-500)" }}
					>
						<i
							className={cx("bi", "bi-file-earmark")}
							style={{ color: "var(--pri)" }}
						/>
						<strong style={{ color: "var(--ink-700)" }}>{file.name}</strong>
						<span>• {file.size}</span>
						{file.rejectedReason && (
							<span
								className={styles.badgeDanger}
								style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999 }}
							>
								{file.rejectedReason}
							</span>
						)}
					</div>
				) : (
					<div style={{ fontSize: 12, color: "var(--ink-500)" }}>
						{doc.hint}
					</div>
				)}
			</div>
			<span className={cx(styles.docBadge, tone.cls)}>
				<i className={cx("bi me-1", tone.icon)} />
				{tone.label}
			</span>
			{file && file.status !== "verified" && (
				<button
					type="button"
					className={cx(styles.btn, styles.btnSm)}
					onClick={(e) => {
						e.stopPropagation();
						inputRef.current?.click();
					}}
				>
					<i className="bi bi-arrow-repeat" /> Re-upload
				</button>
			)}
			{!file && (
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary, styles.btnSm)}
					onClick={(e) => {
						e.stopPropagation();
						inputRef.current?.click();
					}}
					disabled={busy}
				>
					{busy ? (
						<span className="spinner-border spinner-border-sm" role="status" />
					) : (
						<i className="bi bi-upload" />
					)}{" "}
					Upload
				</button>
			)}
			{file && file.status === "rejected" && (
				<button
					type="button"
					className={cx(styles.btn, styles.btnSm)}
					onClick={onRemove}
					title="Remove file"
				>
					<i className="bi bi-trash" />
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				style={{ display: "none" }}
				accept=".jpg,.jpeg,.png,.pdf"
				onChange={(e) => accept(e.target.files)}
			/>
		</div>
	);
}

/* ==========================================================================
 * Wizard step bodies
 * ======================================================================== */
function StepType({
	draft,
	setField,
	setBizType,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
	setBizType: (key: string) => void;
}) {
	return (
		<div>
			<p className={styles.stepHint}>
				Choose the category that best describes your business. The documents
				required in Step 5 and your progress metric adapt to this choice.
			</p>
			<div className="row g-3">
				{BIZ_TYPES.map((b) => {
					const reqCount = b.docs.filter((d) => d.required).length;
					return (
						<div className="col-md-4 col-sm-6" key={b.key}>
							<div
								className={cx(
									styles.bizTypeCard,
									draft.bizType === b.key && styles.bizTypeSelected,
								)}
								onClick={() => setBizType(b.key)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ")
										setBizType(b.key);
								}}
							>
								<div className={styles.bizTypeIcon}>
									<i className={cx("bi", b.icon)} />
								</div>
								<div className={styles.bizTypeName}>{b.name}</div>
								<div className={styles.bizTypeDesc}>{b.desc}</div>
								<div className={styles.bizTypeDocs}>
									<span className={styles.docCount}>
										{reqCount} required {reqCount === 1 ? "doc" : "docs"}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function StepIdentity({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	return (
		<div className="row g-3">
			<div className="col-12">
				<div className={styles.kycNote} style={{ marginBottom: 16 }}>
					<i className="bi bi-info-circle" />
					<span>
						This is who Paymo verifies. Legal names must match your KRA and
						registration records exactly.
					</span>
				</div>
			</div>
			<WField
				label="Business Legal Name"
				value={f("id.legalName")}
				onChange={(v) => setField("id.legalName", v)}
				placeholder="e.g. Kamau Traders"
				required
			/>
			<WSelect
				label="Legal Structure"
				value={f("id.structure")}
				onChange={(v) => setField("id.structure", v)}
				options={[
					"Sole Proprietorship",
					"Partnership",
					"Private Limited Company",
					"Cooperative",
					"Unregistered / Informal",
				]}
				required
				half
			/>
			<WField
				label="Year Established"
				value={f("id.year")}
				onChange={(v) => setField("id.year", v)}
				placeholder="e.g. 2021"
				half
			/>
			<WField
				label="Registration / Certificate Number"
				value={f("id.regNo")}
				onChange={(v) => setField("id.regNo", v)}
				placeholder="If registered (leave blank for informal)"
				half
			/>
			<WField
				label="KRA PIN"
				value={f("id.kraPin")}
				onChange={(v) => setField("id.kraPin", v)}
				placeholder="e.g. A00XXXXXXP"
				half
			/>
			<WSelect
				label="Sector / Industry"
				value={f("id.sector")}
				onChange={(v) => setField("id.sector", v)}
				options={[
					"Retail & Trade",
					"Agriculture",
					"Transport & Logistics",
					"Professional Services",
					"Technology",
					"Hospitality",
					"Construction",
					"Health",
					"Education",
					"Other",
				]}
				half
			/>
		</div>
	);
}

function StepOwner({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	return (
		<div className="row g-3">
			<WField
				label="Full Legal Name"
				value={f("owner.name")}
				onChange={(v) => setField("owner.name", v)}
				placeholder="e.g. John Kamau Mwangi"
				required
			/>
			<WField
				label="National ID / Passport Number"
				value={f("owner.idNo")}
				onChange={(v) => setField("owner.idNo", v)}
				placeholder="e.g. 12345678"
				required
				half
			/>
			<WSelect
				label="ID Type"
				value={f("owner.idType")}
				onChange={(v) => setField("owner.idType", v)}
				options={["National ID", "Passport", "Alien Card", "Driving License"]}
				half
			/>
			<WField
				label="Date of Birth"
				value={f("owner.dob")}
				onChange={(v) => setField("owner.dob", v)}
				type="date"
				half
			/>
			<WField
				label="Nationality"
				value={f("owner.nationality")}
				onChange={(v) => setField("owner.nationality", v)}
				placeholder="Kenyan"
				half
			/>
			<div className="col-md-6">
				<div className="mb-3">
					<label className={styles.fieldLabel} htmlFor="owner-phone">
						Phone Number <span style={{ color: "var(--danger)" }}> *</span>
					</label>
					<div className="input-group">
						<span className="input-group-text">+254</span>
						<input
							id="owner-phone"
							className={styles.field}
							value={f("owner.phone")}
							onChange={(e) => setField("owner.phone", e.target.value)}
							placeholder="712 345 890"
						/>
					</div>
				</div>
			</div>
			<WField
				label="Email Address"
				value={f("owner.email")}
				onChange={(v) => setField("owner.email", v)}
				type="email"
				placeholder="you@example.com"
				required
				half
			/>
			<WField
				label="Physical Address"
				value={f("owner.address")}
				onChange={(v) => setField("owner.address", v)}
				placeholder="e.g. Kawangware, Nairobi"
			/>
		</div>
	);
}

function StepContact({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	return (
		<div className="row g-3">
			<WField
				label="Business Phone"
				value={f("contact.phone")}
				onChange={(v) => setField("contact.phone", v)}
				placeholder="e.g. 0712 345 890"
				required
				half
			/>
			<WField
				label="Business Email"
				value={f("contact.email")}
				onChange={(v) => setField("contact.email", v)}
				type="email"
				placeholder="hello@business.co.ke"
				required
				half
			/>
			<WField
				label="Website / Social Handle"
				value={f("contact.web")}
				onChange={(v) => setField("contact.web", v)}
				placeholder="e.g. kamautraders.co.ke or @kamautraders"
			/>
			<WField
				label="Business Physical Address"
				value={f("contact.address")}
				onChange={(v) => setField("contact.address", v)}
				placeholder="Street, building, estate"
				required
				half
			/>
			<WSelect
				label="County"
				value={f("contact.county")}
				onChange={(v) => setField("contact.county", v)}
				options={[
					"Nairobi",
					"Mombasa",
					"Kisumu",
					"Nakuru",
					"Uasin Gishu",
					"Kiambu",
					"Machakos",
					"Other",
				]}
				half
			/>
			<WField
				label="PO Box"
				value={f("contact.pobox")}
				onChange={(v) => setField("contact.pobox", v)}
				placeholder="e.g. 12345-00100 Nairobi"
				half
			/>
			<WField
				label="Preferred Contact Time"
				value={f("contact.hours")}
				onChange={(v) => setField("contact.hours", v)}
				placeholder="e.g. Weekdays 9am – 5pm"
				half
			/>
		</div>
	);
}

function StepDocs({
	draft,
	setDoc,
	removeDoc,
}: {
	draft: WizardDraft;
	setDoc: (key: string, f: UploadedFile) => void;
	removeDoc: (key: string) => void;
}) {
	const type = getBizType(draft.bizType || "small-scale");
	return (
		<div>
			<div className={styles.kycNote} style={{ marginBottom: 16 }}>
				<i className="bi bi-lightbulb" />
				<span>
					Upload what you have now — you can always return later.{" "}
					<strong>{type.name}</strong> requires{" "}
					{type.docs.filter((d) => d.required).length} documents to unlock your
					full limits. Rejected or pending documents can be re-uploaded.
				</span>
			</div>
			{type.docs.map((d) => (
				<UploadRow
					key={d.key}
					doc={d}
					file={draft.docs[d.key]}
					onFile={(f) => setDoc(d.key, f)}
					onRemove={() => removeDoc(d.key)}
				/>
			))}
		</div>
	);
}

function StepBanking({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	return (
		<div className="row g-3">
			<div className="col-12">
				<div className={styles.kycNote} style={{ marginBottom: 16 }}>
					<i className="bi bi-shield-lock" />
					<span>
						Bank details are used for settlements and are verified against your
						KRA records. Mobile-money lines are optional for personal
						withdrawals.
					</span>
				</div>
			</div>
			<WSelect
				label="Bank"
				value={f("bank.name")}
				onChange={(v) => setField("bank.name", v)}
				options={[
					"Equity Bank",
					"KCB",
					"Co-operative Bank",
					"Stanbic",
					"Absa",
					"NCBA",
					"Family Bank",
					"M-PESA Paybill",
				]}
				required
				half
			/>
			<WField
				label="Account Name"
				value={f("bank.acctName")}
				onChange={(v) => setField("bank.acctName", v)}
				placeholder="Must match legal name"
				required
				half
			/>
			<WField
				label="Account Number"
				value={f("bank.acctNo")}
				onChange={(v) => setField("bank.acctNo", v)}
				placeholder="e.g. 0123456789"
				required
				half
			/>
			<WField
				label="Branch"
				value={f("bank.branch")}
				onChange={(v) => setField("bank.branch", v)}
				placeholder="e.g. Kenyatta Avenue"
				half
			/>
			<WField
				label="M-Pesa Paybill / Till"
				value={f("bank.paybill")}
				onChange={(v) => setField("bank.paybill", v)}
				placeholder="Optional — for receiving payments"
				half
			/>
			<WSelect
				label="Settlement Currency"
				value={f("bank.currency")}
				onChange={(v) => setField("bank.currency", v)}
				options={["KES", "USD", "EUR", "GBP"]}
				half
			/>
		</div>
	);
}

function StepOps({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	return (
		<div className="row g-3">
			<WSelect
				label="Expected Monthly Volume"
				value={f("ops.volume")}
				onChange={(v) => setField("ops.volume", v)}
				options={[
					"Under KES 50K",
					"KES 50K – 500K",
					"KES 500K – 2M",
					"KES 2M – 10M",
					"Over KES 10M",
				]}
				required
				half
			/>
			<WSelect
				label="Average Transaction Size"
				value={f("ops.avgTxn")}
				onChange={(v) => setField("ops.avgTxn", v)}
				options={[
					"Under KES 1K",
					"KES 1K – 5K",
					"KES 5K – 50K",
					"KES 50K – 500K",
					"Over KES 500K",
				]}
				half
			/>
			<WSelect
				label="Primary Use Case"
				value={f("ops.useCase")}
				onChange={(v) => setField("ops.useCase", v)}
				options={[
					"Collect customer payments",
					"Pay suppliers",
					"Pay staff / contractors",
					"Marketplace settlement",
					"Personal business banking",
				]}
				required
			/>
			<WSelect
				label="Payout Preference"
				value={f("ops.payout")}
				onChange={(v) => setField("ops.payout", v)}
				options={["Daily", "Weekly", "Bi-weekly", "Monthly"]}
				half
			/>
			<WField
				label="Number of Locations"
				value={f("ops.locations")}
				onChange={(v) => setField("ops.locations", v)}
				placeholder="e.g. 1"
				half
			/>
			<WField
				label="Peak Business Hours"
				value={f("ops.peak")}
				onChange={(v) => setField("ops.peak", v)}
				placeholder="e.g. 8am – 9pm"
				half
			/>
			<div className="col-12">
				<div className={styles.kycNote}>
					<i className="bi bi-clock-history" />
					<span>
						<strong>Keep your account active.</strong> About one month after
						onboarding we will request a light KYC progress check to confirm
						you're actively using the service and still need it. Accounts with
						no activity for 90+ days are flagged as dormant and paused to
						protect you. Keeping your profile current avoids disruption.
					</span>
				</div>
			</div>
		</div>
	);
}

function StepCompliance({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	const check = (label: string) =>
		(draft.fields[`comp.${label}`] ?? "") === "yes";
	const toggle = (label: string) =>
		setField(`comp.${label}`, check(label) ? "" : "yes");
	return (
		<div className="row g-3">
			<div className="col-12">
				<div className={styles.kycNote} style={{ marginBottom: 16 }}>
					<i className="bi bi-shield-check" />
					<span>
						Compliance steps protect both you and Paymo. All declarations are
						legally binding under Kenyan law (POCAMLA, 2009).
					</span>
				</div>
			</div>
			<WField
				label="Beneficial Owner / Signatory Name"
				value={f("comp.beneficial")}
				onChange={(v) => setField("comp.beneficial", v)}
				placeholder="Person(s) who control the account"
				required
			/>
			<WSelect
				label="Source of Funds"
				value={f("comp.sources")}
				onChange={(v) => setField("comp.sources", v)}
				options={[
					"Sales revenue",
					"Personal savings",
					"Investor capital",
					"Loans / credit",
					"Mixed",
				]}
				required
				half
			/>
			<WField
				label="Expected Monthly Turnover"
				value={f("comp.turnover")}
				onChange={(v) => setField("comp.turnover", v)}
				placeholder="e.g. KES 250,000"
				half
			/>
			<div className="col-12">
				<div className="d-flex flex-column gap-2">
					{[
						{
							key: "aml",
							label:
								"I confirm the business funds are from legitimate sources and comply with AML rules.",
						},
						{
							key: "sanctions",
							label:
								"I consent to sanctions & PEP screening of the business and its owners.",
						},
						{
							key: "kyc",
							label:
								"I agree to periodic KYC re-verification (first check ~1 month after onboarding) and to update records when my details change.",
						},
						{
							key: "dormant",
							label:
								"I understand dormant accounts (no activity for 90+ days) may be paused and can be reactivated with a fresh KYC check.",
						},
						{
							key: "accurate",
							label:
								"I confirm all information provided is true, accurate and complete.",
						},
					].map((c) => (
						<div
							key={c.key}
							className={styles.checklistItem}
							onClick={() => toggle(c.key)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") toggle(c.key);
							}}
							style={{
								cursor: "pointer",
								background: check(c.key) ? "var(--success-bg)" : undefined,
							}}
						>
							<div className={styles.checklistIcon}>
								<i
									className={cx("bi", check(c.key) ? "bi-check" : "bi-circle")}
								/>
							</div>
							<div className={styles.checklistLabel} style={{ fontSize: 13 }}>
								{c.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function StepReview({
	draft,
	goTo,
}: {
	draft: WizardDraft;
	goTo: (step: number) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	const type = getBizType(draft.bizType || "small-scale");
	const prog = docProgress(draft);
	const rows: { label: string; value: string; step: number }[] = [
		{ label: "Business type", value: type.name, step: 1 },
		{ label: "Legal name", value: f("id.legalName") || "—", step: 2 },
		{ label: "Structure", value: f("id.structure") || "—", step: 2 },
		{ label: "KRA PIN", value: f("id.kraPin") || "—", step: 2 },
		{ label: "Owner", value: f("owner.name") || "—", step: 3 },
		{ label: "Owner ID", value: f("owner.idNo") || "—", step: 3 },
		{ label: "Contact phone", value: f("contact.phone") || "—", step: 4 },
		{ label: "Business email", value: f("contact.email") || "—", step: 4 },
		{ label: "County", value: f("contact.county") || "—", step: 4 },
		{ label: "Bank", value: f("bank.name") || "—", step: 6 },
		{ label: "Account", value: f("bank.acctNo") || "—", step: 6 },
		{ label: "Monthly volume", value: f("ops.volume") || "—", step: 7 },
	];
	return (
		<div>
			<div className={styles.kycNote} style={{ marginBottom: 16 }}>
				<i className="bi bi-clipboard-check" />
				<span>
					<strong>
						{prog.done} of {prog.required} required documents
					</strong>{" "}
					submitted ({prog.pct}%). You can submit now and finish the rest later,
					or return to any section.
				</span>
			</div>
			{rows.map((r) => (
				<div className={styles.reviewRow} key={r.label}>
					<span className={styles.reviewLabel}>{r.label}</span>
					<strong
						className={cx(
							styles.reviewValue,
							r.value === "—" && styles.reviewMissing,
						)}
					>
						{r.value}
					</strong>
					<button
						type="button"
						className={styles.btnLink}
						onClick={() => goTo(r.step)}
					>
						Edit
					</button>
				</div>
			))}
		</div>
	);
}

/* ==========================================================================
 * THE 9-STEP WIZARD MODAL
 * ======================================================================== */
const STEP_LABELS = [
	"Type",
	"Identity",
	"Owner",
	"Contact",
	"Docs",
	"Banking",
	"Ops",
	"Compliance",
	"Review",
];

function OnboardingWizard({
	show,
	onClose,
	draft,
	setDraft,
	onToast,
	onSubmitted,
}: {
	show: boolean;
	onClose: () => void;
	draft: WizardDraft;
	setDraft: (d: WizardDraft) => void;
	onToast: (msg: string, danger?: boolean) => void;
	onSubmitted: () => void;
}) {
	const [savedFlash, setSavedFlash] = useState(false);

	useEffect(() => {
		if (show) setSavedFlash(false);
	}, [show]);

	if (!show) return null;

	const step = draft.step;
	const setField = (k: string, v: string) =>
		setDraft({ ...draft, fields: { ...draft.fields, [k]: v } });
	const setBizType = (key: string) =>
		setDraft({ ...draft, bizType: key });
	const setDoc = (key: string, file: UploadedFile) =>
		setDraft({ ...draft, docs: { ...draft.docs, [key]: file } });
	const removeDoc = (key: string) => {
		const docs = { ...draft.docs };
		delete docs[key];
		setDraft({ ...draft, docs });
	};

	const markDone = () => {
		if (!draft.completedSteps.includes(step)) {
			setDraft({ ...draft, completedSteps: [...draft.completedSteps, step] });
		}
	};

	const goTo = (n: number) => {
		if (n < 1 || n > STEP_LABELS.length) return;
		const completed = draft.completedSteps.includes(step)
			? draft.completedSteps
			: [...draft.completedSteps, step];
		setDraft({
			...draft,
			step: n,
			completedSteps: completed,
			lastVisited: new Date().toISOString(),
		});
	};

	const saveAndClose = () => {
		saveDraft({ ...draft, lastVisited: new Date().toISOString() });
		onToast("Progress saved — resume anytime from where you left off.");
		onClose();
	};

	const submit = () => {
		const final = {
			...draft,
			submitted: true,
			completedSteps: STEP_LABELS.map((_, i) => i + 1),
			lastVisited: new Date().toISOString(),
		};
		saveDraft(final);
		setDraft(final);
		onSubmitted();
		onClose();
	};

	const isReview = step === STEP_LABELS.length;
	const canContinue = step === 1 ? draft.bizType !== "" : true;

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div
				className="modal-lg"
				style={{
					width: "100%",
					maxWidth: 900,
					margin: "auto",
					flexShrink: 0,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					style={{
						background: "var(--surface-elev)",
						borderRadius: "var(--radius-lg)",
						color: "var(--ink-900)",
						boxShadow: "var(--shadow-xl)",
						maxHeight: "92vh",
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
						animation: "modalSlideIn 0.3s ease-out",
					}}
				>
					<div
						style={{
							background:
								"linear-gradient(135deg, var(--pri) 0%, var(--pri-600) 100%)",
							color: "#fff",
							padding: "18px 24px",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexShrink: 0,
							gap: 12,
						}}
					>
						<h5
							style={{
								fontWeight: 700,
								display: "inline-flex",
								alignItems: "center",
								gap: 10,
								fontSize: 18,
								margin: 0,
							}}
						>
							<i className="bi bi-rocket-takeoff" /> Business Onboarding Wizard
						</h5>
						<div className="d-flex align-items-center gap-2">
							<span
								style={{ fontSize: 12, opacity: 0.9 }}
								className="d-none d-sm-inline"
							>
								Step {step} of {STEP_LABELS.length} •{" "}
								{getBizType(draft.bizType || "small-scale").name}
							</span>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								style={{
									width: 36,
									height: 36,
									border: "none",
									background: "transparent",
									borderRadius: 8,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									cursor: "pointer",
									color: "#fff",
								}}
							>
								<i className="bi bi-x-lg" />
							</button>
						</div>
					</div>

					<div
						style={{
							padding: "20px 24px",
							overflowY: "auto",
							flex: 1,
							minHeight: 0,
						}}
					>
						{/* stepper */}
						<div className={styles.wizardStepper}>
							{STEP_LABELS.map((label, i) => {
								const n = i + 1;
								const done = draft.completedSteps.includes(n) && n !== step;
								const active = n === step;
								return (
									<div key={label} style={{ display: "contents" }}>
										<div
											className={cx(
												styles.wizardStep,
												active && styles.wizardActive,
												done && styles.wizardDone,
											)}
											role="button"
											tabIndex={0}
											onClick={() => goTo(n)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") goTo(n);
											}}
										>
											<div className={styles.wizardCircle}>
												{done ? <i className="bi bi-check" /> : n}
											</div>
											<div className={styles.wizardLabel}>{label}</div>
										</div>
										{i < STEP_LABELS.length - 1 && (
											<div
												className={cx(
													styles.wizardConnector,
													done && styles.wizardConnectorDone,
												)}
											/>
										)}
									</div>
								);
							})}
						</div>

						{/* step body */}
						<div key={step}>
							<h6 className={styles.wizardStepTitle}>
								<i
									className={cx(
										"bi",
										[
											"bi-grid-1x2",
											"bi-building",
											"bi-person",
											"bi-telephone",
											"bi-folder2-open",
											"bi-bank",
											"bi-gear",
											"bi-shield-check",
											"bi-clipboard-check",
										][step - 1],
									)}
								/>
								Step {step}: {STEP_LABELS[step - 1]}
							</h6>
							{step === 1 && <StepType draft={draft} setField={setField} setBizType={setBizType} />}
							{step === 2 && <StepIdentity draft={draft} setField={setField} />}
							{step === 3 && <StepOwner draft={draft} setField={setField} />}
							{step === 4 && <StepContact draft={draft} setField={setField} />}
							{step === 5 && (
								<StepDocs draft={draft} setDoc={setDoc} removeDoc={removeDoc} />
							)}
							{step === 6 && <StepBanking draft={draft} setField={setField} />}
							{step === 7 && <StepOps draft={draft} setField={setField} />}
							{step === 8 && (
								<StepCompliance draft={draft} setField={setField} />
							)}
							{step === 9 && <StepReview draft={draft} goTo={goTo} />}
						</div>
					</div>

					<div
						style={{
							borderTop: "1px solid var(--border)",
							padding: "16px 24px",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexShrink: 0,
							gap: 10,
							flexWrap: "wrap",
						}}
					>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={saveAndClose}
						>
							<i className="bi bi-save" /> Save &amp; Continue Later
						</button>
						{savedFlash && (
							<span style={{ fontSize: 12, color: "var(--success)" }}>
								<i className="bi bi-check-circle" /> Saved
							</span>
						)}
						<div className="d-flex" style={{ gap: 10 }}>
							{step > 1 && (
								<button
									type="button"
									className={cx(styles.btn)}
									onClick={() => goTo(step - 1)}
								>
									<i className="bi bi-arrow-left" /> Back
								</button>
							)}
							{!isReview ? (
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									onClick={() => {
										markDone();
										goTo(step + 1);
									}}
									disabled={!canContinue}
									title={
										!canContinue ? "Select a business type first" : undefined
									}
								>
									{step === STEP_LABELS.length - 1 ? "Review" : "Continue"}{" "}
									<i className="bi bi-arrow-right" />
								</button>
							) : (
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									onClick={submit}
								>
									<i className="bi bi-check-lg" /> Submit Application
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ==========================================================================
 * Shared visual blocks (checklist item / suggestion item)
 * ======================================================================== */
function ChecklistRow({
	label,
	status,
	onUpload,
	date,
}: {
	label: string;
	status: DocStatus;
	onUpload: () => void;
	date?: string;
}) {
	const tone = TONE_BADGE[status];
	const isDone = status === "verified";
	const isPending = status === "pending";
	const isRejected = status === "rejected";
	return (
		<div
			className={cx(
				styles.checklistItem,
				isDone && styles.checklistCompleted,
				isPending && styles.checklistPending,
				isRejected && styles.checklistRejected,
			)}
		>
			<div className={styles.checklistIcon}>
				<i
					className={cx(
						"bi",
						isDone
							? "bi-check"
							: isPending
								? "bi-clock"
								: isRejected
									? "bi-exclamation"
									: "bi-upload",
					)}
				/>
			</div>
			<div className={styles.checklistLabel}>{label}</div>
			{date && (
				<span style={{ fontSize: 11, color: "var(--ink-500)" }}>{date}</span>
			)}
			<span className={cx(styles.docBadge, tone.cls)}>{tone.label}</span>
			{status !== "verified" && (
				<button
					type="button"
					className={cx(styles.btn, styles.btnSm)}
					onClick={onUpload}
				>
					{status === "not-submitted" ? "Upload" : "Re-upload"}
				</button>
			)}
		</div>
	);
}

/* ==========================================================================
 * PUBLIC — all modals driven by the page's modalState map.
 * ======================================================================== */
export interface OnboardingModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	draft: WizardDraft;
	setDraft: (d: WizardDraft) => void;
	onToast: (msg: string, danger?: boolean) => void;
	onSubmitted: () => void;
	/** Activity rows for the full-log modal (defaults to built-in demo rows). */
	activity?: ActivityRow[];
}

export function OnboardingModals({
	modalState,
	openModal,
	closeModal,
	draft,
	setDraft,
	onToast,
	onSubmitted,
	activity,
}: OnboardingModalsProps) {
	const isOpen = (id: string) => Boolean(modalState[id]);
	const close = (id: string) => closeModal(id);
	const swap = (from: string, to: string) => {
		closeModal(from);
		openModal(to);
	};

	return (
		<>
			{/* ============ M1: WIZARD ============ */}
			<OnboardingWizard
				show={isOpen("wizardModal")}
				onClose={() => close("wizardModal")}
				draft={draft}
				setDraft={setDraft}
				onToast={onToast}
				onSubmitted={onSubmitted}
			/>{" "}
			{/* ============ M2: BIZ TYPE QUICK PICKER ============ */}
			<ModalShell
				show={isOpen("bizTypeModal")}
				onClose={() => close("bizTypeModal")}
				iconCls="bi bi-shop"
				title="Select Business Type"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("bizTypeModal")}
						>
							Cancel
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								if (!draft.bizType) {
									onToast("Please select a business type first.", true);
									return;
								}
								swap("bizTypeModal", "wizardModal");
							}}
						>
							Select &amp; Continue
						</button>
					</>
				}
			>
				<p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 16 }}>
					Choose the category that best describes your business. Your required
					documents and limits depend on this choice.
				</p>
				<div className="row g-3">
					{BIZ_TYPES.map((b) => (
						<div className="col-md-4 col-sm-6" key={b.key}>
							<div
								className={cx(
									styles.bizTypeCard,
									draft.bizType === b.key && styles.bizTypeSelected,
								)}
								onClick={() => setDraft({ ...draft, bizType: b.key })}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ")
										setDraft({ ...draft, bizType: b.key });
								}}
							>
								<div className={styles.bizTypeIcon}>
									<i className={cx("bi", b.icon)} />
								</div>
								<div className={styles.bizTypeName}>{b.name}</div>
								<div className={styles.bizTypeDesc}>{b.desc}</div>
								<div className={styles.bizTypeDocs}>
									<span className={styles.docCount}>
										{b.docs.filter((d) => d.required).length} required docs
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</ModalShell>
			{/* ============ M3: UPLOAD DOCUMENTS ============ */}
			<ModalShell
				show={isOpen("uploadModal")}
				onClose={() => close("uploadModal")}
				iconCls="bi bi-upload"
				title="Upload Documents"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("uploadModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								const type = getBizType(draft.bizType || "small-scale");
								const submitted = type.docs.filter((d) => draft.docs[d.key]);
								if (submitted.length === 0) {
									onToast(
										"Upload at least one document before submitting.",
										true,
									);
									return;
								}
								saveDraft({
									...draft,
									submitted: true,
									lastVisited: new Date().toISOString(),
								});
								swap("uploadModal", "successModal");
							}}
						>
							<i className="bi bi-check-lg me-1" /> Submit Documents
						</button>
					</>
				}
			>
				<p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 16 }}>
					<i
						className="bi bi-lightbulb me-2"
						style={{ color: "var(--warning)" }}
					/>
					Upload what you have now. You can update these later — rejected or
					pending documents can be re-uploaded anytime.
				</p>
				{getBizType(draft.bizType || "small-scale").docs.map((d) => (
					<UploadRow
						key={d.key}
						doc={d}
						file={draft.docs[d.key]}
						onFile={(f) =>
							setDraft({ ...draft, docs: { ...draft.docs, [d.key]: f } })
						}
						onRemove={() => {
							const docs = { ...draft.docs };
							delete docs[d.key];
							setDraft({ ...draft, docs });
						}}
					/>
				))}
				<div
					className="mt-3 p-3"
					style={{
						background: "var(--info-bg)",
						borderRadius: "var(--radius-md)",
						border: "1px solid rgba(59,130,246,0.2)",
						fontSize: 13,
					}}
				>
					<i
						className="bi bi-info-circle me-2"
						style={{ color: "var(--info)" }}
					/>
					<strong>Don't have all documents?</strong> No problem. Submit what you
					have and we'll guide you on what to get next.
				</div>
			</ModalShell>
			{/* ============ M4: AI ANALYSIS ============ */}
			<ModalShell
				show={isOpen("aiModal")}
				onClose={() => close("aiModal")}
				size="lg"
				iconCls="bi bi-robot"
				title="AI Document Analysis"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("aiModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("aiModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" /> Start Uploading
						</button>
					</>
				}
			>
				<div
					className="p-3 mb-3"
					style={{
						background:
							"linear-gradient(135deg, var(--success-bg), var(--info-bg))",
						borderRadius: "var(--radius-md)",
					}}
				>
					<h6 style={{ fontWeight: 700, marginBottom: 8 }}>
						🎯 Your Path to Certified Status
					</h6>
					<p style={{ fontSize: 13, margin: 0, color: "var(--ink-700)" }}>
						Based on your business type (
						<strong>{getBizType(draft.bizType || "small-scale").name}</strong>),
						we've analyzed the fastest path to full certification.
					</p>
				</div>

				<h6
					style={{ fontWeight: 700, marginBottom: 12, color: "var(--danger)" }}
				>
					🔴 HIGH PRIORITY
				</h6>
				<div className={styles.suggestionItem}>
					<div className={cx(styles.suggestionPriority, styles.priorityHigh)}>
						1
					</div>
					<div className={styles.suggestionContent}>
						<div className={styles.suggestionTitle}>
							Business Registration Certificate
						</div>
						<div className={styles.suggestionMeta}>
							📍 eCitizen portal (business.go.ke) • 💰 ~KES 1,000 • ⏱️ 3-5 days
						</div>
					</div>
					<div className={styles.suggestionImpact}>+KES 4.5M limit</div>
				</div>
				<div className={styles.suggestionItem}>
					<div className={cx(styles.suggestionPriority, styles.priorityHigh)}>
						2
					</div>
					<div className={styles.suggestionContent}>
						<div className={styles.suggestionTitle}>KRA PIN Certificate</div>
						<div className={styles.suggestionMeta}>
							📍 itax.kra.go.ke • 💰 Free • ⏱️ Instant
						</div>
					</div>
					<div className={styles.suggestionImpact}>Tax compliance</div>
				</div>

				<h6
					style={{
						fontWeight: 700,
						margin: "20px 0 12px",
						color: "var(--warning)",
					}}
				>
					🟡 MEDIUM PRIORITY
				</h6>
				<div className={styles.suggestionItem}>
					<div className={cx(styles.suggestionPriority, styles.priorityMedium)}>
						3
					</div>
					<div className={styles.suggestionContent}>
						<div className={styles.suggestionTitle}>County Business Permit</div>
						<div className={styles.suggestionMeta}>
							📍 County government office • 💰 ~KES 5,000-15,000/yr • ⏱️ 1-2
							weeks
						</div>
					</div>
					<div className={styles.suggestionImpact}>Physical location</div>
				</div>
				<div className={styles.suggestionItem}>
					<div className={cx(styles.suggestionPriority, styles.priorityMedium)}>
						4
					</div>
					<div className={styles.suggestionContent}>
						<div className={styles.suggestionTitle}>
							Recent Bank Statement (3 months)
						</div>
						<div className={styles.suggestionMeta}>
							📍 Your bank branch/online banking • 💰 Free • ⏱️ Same day
						</div>
					</div>
					<div className={styles.suggestionImpact}>Builds trust</div>
				</div>

				<h6
					style={{
						fontWeight: 700,
						margin: "20px 0 12px",
						color: "var(--info)",
					}}
				>
					🔵 NICE TO HAVE
				</h6>
				<div className={styles.suggestionItem}>
					<div className={cx(styles.suggestionPriority, styles.priorityLow)}>
						5
					</div>
					<div className={styles.suggestionContent}>
						<div className={styles.suggestionTitle}>
							Utility Bill (Proof of Address)
						</div>
						<div className={styles.suggestionMeta}>
							📍 KPLC/Water bill • 💰 Free • ⏱️ Same day
						</div>
					</div>
					<div className={styles.suggestionImpact}>Address verification</div>
				</div>
			</ModalShell>
			{/* ============ M5: LIMITS ============ */}
			<ModalShell
				show={isOpen("limitsModal")}
				onClose={() => close("limitsModal")}
				iconCls="bi bi-gauge-high"
				title="Transaction Limits"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("limitsModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("limitsModal", "upgradeModal")}
						>
							Upgrade Now
						</button>
					</>
				}
			>
				<div className={styles.tableWrap}>
					<table className={styles.table} style={{ fontSize: 14 }}>
						<thead>
							<tr>
								<th>Feature</th>
								<th>Basic</th>
								<th>Enhanced</th>
								<th>Certified</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Daily Limit", "KES 50K", "KES 500K", "KES 5M"],
								["Per Transaction", "KES 25K", "KES 250K", "KES 2.5M"],
								["Monthly Limit", "KES 500K", "KES 5M", "KES 50M"],
								["Fee Rate", "1.5%", "1.2%", "0.8%"],
								["Beneficiaries", "3", "20", "Unlimited"],
								["Bulk Payments", "—", "50 recipients", "Unlimited"],
								["API Access", "—", "—", "✓"],
								["International", "—", "—", "✓"],
							].map((row) => (
								<tr key={row[0]}>
									<td style={{ padding: 12 }}>
										<strong>{row[0]}</strong>
									</td>
									<td style={{ padding: 12 }}>{row[1]}</td>
									<td style={{ padding: 12 }}>
										<strong>{row[2]}</strong>
									</td>
									<td style={{ padding: 12, color: "var(--pri)" }}>
										<strong>{row[3]}</strong>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>
			{/* ============ M6: UPGRADE ============ */}
			<ModalShell
				show={isOpen("upgradeModal")}
				onClose={() => close("upgradeModal")}
				iconCls="bi bi-arrow-up-circle"
				title="Upgrade to Certified"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("upgradeModal")}
						>
							Maybe Later
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("upgradeModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" /> Start Uploading
						</button>
					</>
				}
			>
				<div className="text-center mb-4">
					<div style={{ fontSize: 64, color: "var(--pri)", marginBottom: 16 }}>
						<i className="bi bi-award" />
					</div>
					<h3 style={{ fontWeight: 700 }}>Unlock 10x Higher Limits</h3>
					<p style={{ color: "var(--ink-500)", fontSize: 14 }}>
						Complete your remaining documents to reach Certified status
					</p>
				</div>
				<div
					className="p-3 mb-3"
					style={{
						background: "var(--success-bg)",
						borderRadius: "var(--radius-md)",
						border: "1px solid rgba(16,185,129,0.2)",
					}}
				>
					<h6 style={{ fontWeight: 700, marginBottom: 12 }}>
						🎯 What You'll Unlock:
					</h6>
					<ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
						<li>
							<strong>KES 5,000,000</strong> daily limit (10x increase)
						</li>
						<li>
							<strong>0.8%</strong> transaction fees (save 40%)
						</li>
						<li>
							<strong>API access</strong> for integrations
						</li>
						<li>
							<strong>International transfers</strong>
						</li>
						<li>
							<strong>Priority support</strong>
						</li>
						<li>
							<strong>Unlimited</strong> bulk payments &amp; beneficiaries
						</li>
					</ul>
				</div>
				<h6 style={{ fontWeight: 700, marginBottom: 12 }}>
					📋 Required Documents:
				</h6>
				{getBizType(draft.bizType || "small-scale")
					.docs.filter((d) => !draft.docs[d.key])
					.map((d) => (
						<ChecklistRow
							key={d.key}
							label={d.label}
							status="not-submitted"
							onUpload={() => swap("upgradeModal", "uploadModal")}
						/>
					))}
				<div
					className="mt-3 p-3"
					style={{
						background: "var(--info-bg)",
						borderRadius: "var(--radius-md)",
						fontSize: 13,
					}}
				>
					<i className="bi bi-clock me-2" style={{ color: "var(--info)" }} />
					<strong>Estimated time:</strong> 2-3 weeks to complete all documents
				</div>
			</ModalShell>
			{/* ============ M7: STATUS ============ */}
			<ModalShell
				show={isOpen("statusModal")}
				onClose={() => close("statusModal")}
				iconCls="bi bi-shield-check"
				title="Verification Status"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("statusModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("statusModal", "wizardModal")}
						>
							Continue Onboarding
						</button>
					</>
				}
			>
				<VerificationStatusBody draft={draft} openModal={openModal} />
			</ModalShell>
			{/* ============ M8: FULL CHECKLIST ============ */}
			<ModalShell
				show={isOpen("checklistModal")}
				onClose={() => close("checklistModal")}
				iconCls="bi bi-clipboard-check"
				title="Full Document Checklist"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("checklistModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("checklistModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" /> Upload All Missing
						</button>
					</>
				}
			>
				<FullChecklistBody draft={draft} openModal={openModal} />
			</ModalShell>
			{/* ============ M9: BENEFITS ============ */}
			<ModalShell
				show={isOpen("benefitsModal")}
				onClose={() => close("benefitsModal")}
				size="lg"
				iconCls="bi bi-gift"
				title="Benefits Comparison"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("benefitsModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("benefitsModal", "upgradeModal")}
						>
							Upgrade to Certified
						</button>
					</>
				}
			>
				<div className={styles.tableWrap}>
					<table className={styles.table} style={{ fontSize: 14 }}>
						<thead>
							<tr>
								<th>Feature</th>
								<th>Basic</th>
								<th>Enhanced</th>
								<th>Certified</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Business Profile", "✓", "✓", "✓"],
								["Mobile Money", "✓", "✓", "✓"],
								["Transaction History", "Basic", "Enhanced", "Full"],
								["Analytics", "—", "Basic", "Full"],
								["Payment Links", "—", "✓", "✓"],
								["API Access", "—", "—", "✓"],
								["International Transfers", "—", "—", "✓"],
								["Priority Support", "—", "—", "✓"],
							].map((row) => (
								<tr key={row[0]}>
									<td style={{ padding: 12 }}>{row[0]}</td>
									<td style={{ padding: 12 }}>{row[1]}</td>
									<td style={{ padding: 12 }}>{row[2]}</td>
									<td style={{ padding: 12, color: "var(--pri)" }}>
										<strong>{row[3]}</strong>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ModalShell>
			{/* ============ M10: ACTIVITY LOG ============ */}
			<TabbedModal
				show={isOpen("activityModal")}
				onClose={() => close("activityModal")}
				iconCls="bi bi-clock-history"
				title="Onboarding Activity"
				tabs={[
					{
						key: "all",
						label: "All Activity",
						render: () => <ActivityTable compact={false} rows={activity} />,
					},
					{
						key: "uploads",
						label: "Uploads Only",
						render: () => <ActivityTable compact uploadsOnly rows={activity} />,
					},
				]}
			/>
			{/* ============ M11: HOW TO ============ */}
			<ModalShell
				show={isOpen("howToModal")}
				onClose={() => close("howToModal")}
				iconCls="bi bi-mortarboard"
				title="How to Get Your Documents"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => close("howToModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("howToModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" /> Start Uploading
						</button>
					</>
				}
			>
				<HowToBody />
			</ModalShell>
			{/* ============ M12: SUCCESS ============ */}
			<SimpleModal
				show={isOpen("successModal")}
				onClose={() => close("successModal")}
				iconCls="bi bi-check-circle"
				title="Documents Submitted"
				hideFooter
				successMsg="Documents received"
				onSubmit={() => close("successModal")}
			>
				<div className="text-center py-3">
					<div
						style={{
							width: 80,
							height: 80,
							background: "var(--success-bg)",
							color: "var(--pri)",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 40,
							margin: "0 auto 20px",
						}}
					>
						<i className="bi bi-check-lg" />
					</div>
					<h3 style={{ fontWeight: 700, marginBottom: 8 }}>
						Documents Submitted!
					</h3>
					<p style={{ color: "var(--ink-500)", marginBottom: 24 }}>
						Your documents have been received and are being processed. We'll
						notify you once verification is complete.
					</p>
					<div
						className="p-3 mb-4"
						style={{
							background: "var(--surface-2)",
							borderRadius: "var(--radius-md)",
							textAlign: "left",
							fontSize: 13,
						}}
					>
						<div style={{ marginBottom: 8 }}>
							<strong>Reference:</strong> DOC-20260809-001
						</div>
						<div style={{ marginBottom: 8 }}>
							<strong>Submitted:</strong> {new Date().toLocaleDateString()} at{" "}
							{new Date().toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
						<div>
							<strong>Expected Review:</strong> 24-48 hours
						</div>
					</div>
					<div className="d-flex gap-2 justify-content-center flex-wrap">
						<button
							type="button"
							className={cx(styles.btn)}
							onClick={() => close("successModal")}
						>
							Close
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								close("successModal");
								onToast(
									"You will be notified via email when verification is complete.",
								);
							}}
						>
							Got It
						</button>
					</div>
				</div>
			</SimpleModal>
		</>
	);
}

/* --------------------------------------------------------------------------
 * Reusable bodies (shared between page cards and modals)
 * ------------------------------------------------------------------------ */
export function VerificationStatusBody({
	draft,
	openModal,
}: {
	draft: WizardDraft;
	openModal: (id: string) => void;
}) {
	const prog = docProgress(draft);
	const type = getBizType(draft.bizType || "small-scale");
	return (
		<>
			<div className="text-center mb-4">
				<div style={{ fontSize: 48, marginBottom: 12 }}>🟡</div>
				<h3 style={{ fontWeight: 700 }}>Enhanced Verification</h3>
				<p style={{ color: "var(--ink-500)" }}>
					{prog.pct}% Complete • {prog.done} of {prog.required} required
					documents
					{type.name !== "Small Scale" && <> for {type.name}</>}
				</p>
				<div
					className={styles.progressBar}
					style={{ maxWidth: 400, margin: "0 auto" }}
				>
					<div
						className={styles.progressFill}
						style={{ width: `${prog.pct}%` }}
					/>
				</div>
			</div>
			<h6 style={{ fontWeight: 700, marginBottom: 16 }}>Document Status</h6>
			<div className="row g-2">
				{type.docs.map((d) => {
					const f = draft.docs[d.key];
					const status: DocStatus = f?.status ?? "not-submitted";
					return (
						<div className="col-md-6" key={d.key}>
							<ChecklistRow
								label={d.label}
								status={status}
								onUpload={() => openModal("uploadModal")}
							/>
						</div>
					);
				})}
			</div>
			<div
				className="mt-4 p-3"
				style={{
					background: "var(--success-bg)",
					borderRadius: "var(--radius-md)",
					border: "1px solid rgba(16,185,129,0.2)",
				}}
			>
				<h6 style={{ fontWeight: 700, marginBottom: 8 }}>
					📈 Your Current Privileges:
				</h6>
				<div className="row g-2" style={{ fontSize: 13 }}>
					<div className="col-6">
						<i className="bi bi-check me-2" style={{ color: "var(--pri)" }} />
						Daily limit: KES 500,000
					</div>
					<div className="col-6">
						<i className="bi bi-check me-2" style={{ color: "var(--pri)" }} />
						20 beneficiaries
					</div>
					<div className="col-6">
						<i className="bi bi-check me-2" style={{ color: "var(--pri)" }} />
						Bulk payments (50)
					</div>
					<div className="col-6">
						<i className="bi bi-check me-2" style={{ color: "var(--pri)" }} />
						Payment links
					</div>
				</div>
			</div>
		</>
	);
}

export function FullChecklistBody({
	draft,
	openModal,
}: {
	draft: WizardDraft;
	openModal: (id: string) => void;
}) {
	const type = getBizType(draft.bizType || "small-scale");
	const verified = type.docs.filter(
		(d) => draft.docs[d.key]?.status === "verified",
	);
	const pending = type.docs.filter((d) => {
		const s = draft.docs[d.key]?.status;
		return s === "pending" || s === "rejected";
	});
	const missing = type.docs.filter((d) => !draft.docs[d.key]);
	return (
		<>
			<h6 style={{ fontWeight: 700, marginBottom: 12 }}>
				✅ Verified ({verified.length})
			</h6>
			{verified.length === 0 && (
				<p style={{ fontSize: 13, color: "var(--ink-500)" }}>
					No verified documents yet for {type.name}.
				</p>
			)}
			{verified.map((d) => (
				<ChecklistRow
					key={d.key}
					label={d.label}
					status="verified"
					onUpload={() => openModal("uploadModal")}
					date="Verified"
				/>
			))}
			<h6 style={{ fontWeight: 700, margin: "24px 0 12px" }}>
				⏳ In Review / Rejected ({pending.length})
			</h6>
			{pending.map((d) => (
				<ChecklistRow
					key={d.key}
					label={d.label}
					status={
						draft.docs[d.key]?.status === "rejected" ? "rejected" : "pending"
					}
					onUpload={() => openModal("uploadModal")}
					date={
						draft.docs[d.key]?.status === "rejected" ? "Rejected" : "Reviewing"
					}
				/>
			))}
			<h6 style={{ fontWeight: 700, margin: "24px 0 12px" }}>
				⬜ Not Submitted ({missing.length})
			</h6>
			{missing.map((d) => (
				<ChecklistRow
					key={d.key}
					label={d.label}
					status="not-submitted"
					onUpload={() => openModal("uploadModal")}
				/>
			))}
		</>
	);
}

export interface ActivityRow {
	time: string;
	action: string;
	doc: string;
	status: string;
	tone: "success" | "warn" | "pending";
}

export const DEFAULT_ACTIVITY: ActivityRow[] = [
	{
		time: "Aug 9, 2026 14:22",
		action: "Upload",
		doc: "KRA PIN Certificate",
		status: "Verified",
		tone: "success",
	},
	{
		time: "Aug 8, 2026 11:45",
		action: "Upload",
		doc: "Business Photo",
		status: "Verified",
		tone: "success",
	},
	{
		time: "Aug 7, 2026 09:10",
		action: "Verification",
		doc: "Bank Account",
		status: "Pending",
		tone: "warn",
	},
	{
		time: "Aug 6, 2026 16:30",
		action: "Upload",
		doc: "National ID Front",
		status: "Verified",
		tone: "success",
	},
	{
		time: "Aug 6, 2026 16:31",
		action: "Upload",
		doc: "National ID Back",
		status: "Verified",
		tone: "success",
	},
	{
		time: "Aug 5, 2026 10:00",
		action: "Verification",
		doc: "Phone Number",
		status: "Verified",
		tone: "success",
	},
	{
		time: "Aug 5, 2026 09:45",
		action: "Verification",
		doc: "Email Address",
		status: "Verified",
		tone: "success",
	},
];

export function ActivityTable({
	compact,
	uploadsOnly,
	rows: rowsProp,
}: {
	compact?: boolean;
	uploadsOnly?: boolean;
	rows?: ActivityRow[];
}) {
	const rows = rowsProp ?? DEFAULT_ACTIVITY;
	const filtered = uploadsOnly
		? rows.filter((r) => r.action === "Upload")
		: rows;
	const shown = compact ? filtered.slice(0, 4) : filtered;
	const toneCls = {
		success: styles.badgeSuccess,
		warn: styles.badgeWarn,
		pending: styles.badgeInfo,
	} as const;
	return (
		<div className={styles.tableWrap}>
			<table className={styles.table}>
				<thead>
					<tr>
						<th>Date &amp; Time</th>
						<th>Action</th>
						<th>Document</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{shown.map((r) => (
						<tr key={`${r.time}-${r.doc}`}>
							<td style={{ padding: 12 }}>{r.time}</td>
							<td style={{ padding: 12 }}>{r.action}</td>
							<td style={{ padding: 12 }}>
								<strong>{r.doc}</strong>
							</td>
							<td style={{ padding: 12 }}>
								<span
									className={cx(
										styles.docBadge,
										toneCls[r.tone as keyof typeof toneCls],
									)}
								>
									{r.status}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function HowToBody() {
	const steps: { title: string; icon: string; items: string[] }[] = [
		{
			title: "📋 Business Registration Certificate",
			icon: "bi-file-earmark-text",
			items: [
				"Visit eCitizen portal (business.go.ke)",
				"Create/login to your account",
				'Click "Register Business Name"',
				"Fill in business details (KES 150 fee)",
				"Wait 3-5 days for approval",
				"Download certificate",
			],
		},
		{
			title: "🏛️ County Business Permit",
			icon: "bi-buildings",
			items: [
				"Visit your county government office",
				"Bring: ID, business registration, passport photo",
				"Fill application form",
				"Pay fee (KES 5,000-15,000 depending on county)",
				"Wait 1-2 weeks for inspection & approval",
			],
		},
		{
			title: "🏦 Bank Statement (3 months)",
			icon: "bi-bank",
			items: [
				"Login to your online banking OR visit branch",
				"Request statement for last 3 months",
				"Download as PDF",
				"Ensure it shows your name and account number",
			],
		},
		{
			title: "💡 Utility Bill",
			icon: "bi-lightbulb",
			items: [
				"Any recent bill: KPLC, Water, Internet",
				"Must show your name and address",
				"Must be less than 3 months old",
				"Download from provider's portal or use physical copy",
			],
		},
		{
			title: "🎨 Portfolio / Sample Work",
			icon: "bi-briefcase",
			items: [
				"Freelancers & creatives: gather 3-5 recent samples",
				"Compile into a single PDF or image set",
				"Can include links to Behance/Dribbble/GitHub",
				"Showcases your work to unlock business limits",
			],
		},
	];
	return (
		<div>
			{steps.map((g) => (
				<div className="mb-4" key={g.title}>
					<h6 style={{ fontWeight: 700, marginBottom: 12 }}>{g.title}</h6>
					<div
						className="p-3"
						style={{
							background: "var(--surface-2)",
							borderRadius: "var(--radius-md)",
						}}
					>
						<ol style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
							{g.items.map((it) => (
								<li key={it}>{it}</li>
							))}
						</ol>
					</div>
				</div>
			))}
		</div>
	);
}

export default OnboardingModals;
