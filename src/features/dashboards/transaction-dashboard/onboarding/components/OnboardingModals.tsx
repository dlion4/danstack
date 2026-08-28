/* ============================================================================
 * OnboardingModals.tsx — hosted workflows for the Business Onboarding page.
 * ----------------------------------------------------------------------------
 * Rebuilt on the shared PayMo modal primitives (ModalShell / SimpleModal /
 * TabbedModal): every dialog is labelled, focus-trapped, Escape-closeable,
 * scroll-locking and restores focus to its trigger. The guided nine-step
 * onboarding builder lives inline on the page (see Onboarding.tsx); this host
 * keeps every supporting workflow reachable.
 *
 * Hosted modal IDs (11):
 *   bizTypeModal   uploadModal   aiModal      limitsModal   upgradeModal
 *   statusModal    checklistModal benefitsModal activityModal howToModal
 *   successModal
 *
 * STYLES: ../styles/onboarding.module.css (scoped PayMo business tokens).
 * ========================================================================== */
"use client";
import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import { ModalShell, TabbedModal } from "../../shared/components/modals";
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
	activity: ActivityRow[];
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
	let done = 0;
	let required = 0;
	type.docs.forEach((d) => {
		const f = draft.docs[d.key];
		if (d.required) {
			required += 1;
			if (f && (f.status === "verified" || f.status === "pending")) done += 1;
		} else if (f && (f.status === "verified" || f.status === "pending")) {
			done += 1;
		}
	});
	const pct = required === 0 ? 100 : Math.round((done / required) * 100);
	return { done, required, total: type.docs.length, pct };
}

/* --------------------------------------------------------------------------
 * Small helpers
 * ------------------------------------------------------------------------ */
const TONE_BADGE: Record<
	DocStatus,
	{ cls: string; label: string; icon: string; rowCls: string; iconCls: string }
> = {
	verified: {
		cls: styles.badgeSuccess,
		label: "Verified",
		icon: "bi-check-circle",
		rowCls: styles.docRowVerified,
		iconCls: "bi-check-lg",
	},
	pending: {
		cls: styles.badgeWarn,
		label: "Pending review",
		icon: "bi-clock",
		rowCls: styles.docRowPending,
		iconCls: "bi-clock",
	},
	rejected: {
		cls: styles.badgeDanger,
		label: "Rejected",
		icon: "bi-x-circle",
		rowCls: styles.docRowRejected,
		iconCls: "bi-exclamation-lg",
	},
	"not-submitted": {
		cls: styles.badgeNeutral,
		label: "Not submitted",
		icon: "bi-upload",
		rowCls: "",
		iconCls: "bi-upload",
	},
};

function fmtBytes(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ==========================================================================
 * UploadRow — shared by the wizard Docs step (page) and the upload/status/
 * checklist/upgrade dialogs. Drag & drop, simulated upload, re-upload and
 * remove. The row is a labelled container; the real control is the file
 * input (no nested interactive elements).
 * ======================================================================== */
export function UploadRow({
	doc,
	file,
	onFile,
	onRemove,
}: {
	doc: DocDef;
	file?: UploadedFile;
	onFile: (f: UploadedFile) => void;
	onRemove?: () => void;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const inputId = useId();
	const [dragover, setDragover] = useState(false);
	const [busy, setBusy] = useState(false);
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(timerRef.current), []);

	const accept = (list: FileList | null) => {
		if (!list || list.length === 0) return;
		const f = list[0];
		setBusy(true);
		// Simulated upload → "pending review"
		timerRef.current = window.setTimeout(() => {
			onFile({ name: f.name, size: fmtBytes(f.size), status: "pending" });
			setBusy(false);
		}, 900);
	};

	const tone = file ? TONE_BADGE[file.status] : TONE_BADGE["not-submitted"];
	const openPicker = () => inputRef.current?.click();

	return (
		// Drag-and-drop is a progressive enhancement; the labelled Upload
		// button below is the accessible, keyboard-operable path to the file input.
		// biome-ignore lint/a11y/noStaticElementInteractions: drag handlers only
		<div
			className={cx(
				styles.docRow,
				tone.rowCls,
				dragover && styles.docRowDragover,
			)}
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
			<span className={styles.docRowIcon} aria-hidden="true">
				<i className={cx("bi", tone.iconCls)} />
			</span>
			<div className={styles.docRowBody}>
				<label className={styles.docRowLabel} htmlFor={inputId}>
					{doc.label}{" "}
					{doc.required && (
						<span className={styles.requiredMark} aria-hidden="true">
							*
						</span>
					)}
				</label>
				<div className={styles.docRowMeta}>
					{file ? (
						<>
							<i className="bi bi-file-earmark" aria-hidden="true" />
							<strong>{file.name}</strong>
							<span>• {file.size}</span>
							{file.rejectedReason ? (
								<span className={cx(styles.badge, styles.badgeDanger)}>
									{file.rejectedReason}
								</span>
							) : null}
						</>
					) : (
						<span>{doc.hint}</span>
					)}
				</div>
			</div>
			<div className={styles.docRowActions}>
				<span className={cx(styles.docBadge, tone.cls)}>
					<i className={cx("bi me-1", tone.icon)} aria-hidden="true" />
					{tone.label}
				</span>
				{file && file.status === "rejected" && onRemove ? (
					<button
						type="button"
						className={cx(styles.btn)}
						onClick={onRemove}
						aria-label={`Remove rejected ${doc.label}`}
					>
						<i className="bi bi-trash" aria-hidden="true" />
					</button>
				) : null}
				<button
					type="button"
					className={cx(styles.btn, !file && styles.btnPrimary)}
					onClick={openPicker}
					disabled={busy}
					aria-label={`${file && file.status !== "verified" ? "Re-upload" : "Upload"} ${doc.label}`}
				>
					{busy ? (
						<>
							<span
								className="spinner-border spinner-border-sm"
								aria-hidden="true"
							/>
							<span className={styles.srOnly}>Uploading</span>
						</>
					) : file && file.status !== "verified" ? (
						<>
							<i className="bi bi-arrow-repeat" aria-hidden="true" /> Re-upload
						</>
					) : (
						<>
							<i className="bi bi-upload" aria-hidden="true" /> Upload
						</>
					)}
				</button>
			</div>
			<input
				id={inputId}
				ref={inputRef}
				type="file"
				className={styles.srOnly}
				accept=".jpg,.jpeg,.png,.pdf"
				onChange={(e) => {
					accept(e.target.files);
					e.target.value = "";
				}}
			/>
		</div>
	);
}

/* ==========================================================================
 * ChecklistRow — read-only doc status row used inside status/checklist and
 * upgrade dialogs. Upload is a single explicit button.
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
	return (
		<div className={cx(styles.docRow, tone.rowCls)}>
			<span className={styles.docRowIcon} aria-hidden="true">
				<i className={cx("bi", tone.iconCls)} />
			</span>
			<div className={styles.docRowBody}>
				<span className={styles.docRowLabel}>{label}</span>
				{date ? (
					<div className={styles.docRowMeta}>
						<span>{date}</span>
					</div>
				) : null}
			</div>
			<div className={styles.docRowActions}>
				<span className={cx(styles.docBadge, tone.cls)}>{tone.label}</span>
				{status !== "verified" ? (
					<button type="button" className={cx(styles.btn)} onClick={onUpload}>
						{status === "not-submitted" ? "Upload" : "Re-upload"}
					</button>
				) : null}
			</div>
		</div>
	);
}

/* ==========================================================================
 * Recommendation content (AI analysis modal + page next-steps section).
 * ======================================================================== */
export interface Recommendation {
	rank: number;
	title: string;
	source: string;
	cost: string;
	time: string;
	impact: string;
	priority: "high" | "medium" | "low";
}

export const RECOMMENDATIONS: Recommendation[] = [
	{
		rank: 1,
		title: "Business Registration Certificate",
		source: "eCitizen portal (business.go.ke)",
		cost: "~KES 1,000",
		time: "3-5 days",
		impact: "+KES 4.5M limit",
		priority: "high",
	},
	{
		rank: 2,
		title: "KRA PIN Certificate",
		source: "itax.kra.go.ke",
		cost: "Free",
		time: "Instant",
		impact: "Tax compliance",
		priority: "high",
	},
	{
		rank: 3,
		title: "County Business Permit",
		source: "County government office",
		cost: "~KES 5,000-15,000/yr",
		time: "1-2 weeks",
		impact: "Physical location",
		priority: "medium",
	},
	{
		rank: 4,
		title: "Recent Bank Statement (3 months)",
		source: "Your bank branch / online banking",
		cost: "Free",
		time: "Same day",
		impact: "Builds trust",
		priority: "medium",
	},
	{
		rank: 5,
		title: "Utility Bill (Proof of Address)",
		source: "KPLC / Water bill",
		cost: "Free",
		time: "Same day",
		impact: "Address verification",
		priority: "low",
	},
];

function RecommendationItem({ rec }: { rec: Recommendation }) {
	const priorityCls =
		rec.priority === "high"
			? styles.priorityHigh
			: rec.priority === "medium"
				? styles.priorityMedium
				: styles.priorityLow;
	return (
		<div className={styles.suggestionItem}>
			<span className={cx(styles.suggestionPriority, priorityCls)}>
				{rec.rank}
			</span>
			<div className={styles.suggestionContent}>
				<div className={styles.suggestionTitle}>{rec.title}</div>
				<div className={styles.suggestionMeta}>
					<span>
						<i className="bi bi-geo-alt me-1" aria-hidden="true" />
						{rec.source}
					</span>
					<span>
						<i className="bi bi-cash-coin me-1" aria-hidden="true" />
						{rec.cost}
					</span>
					<span>
						<i className="bi bi-clock me-1" aria-hidden="true" />
						{rec.time}
					</span>
				</div>
			</div>
			<span className={styles.suggestionImpact}>{rec.impact}</span>
		</div>
	);
}

/* ==========================================================================
 * Activity table — shared by the page (compact) and the activity dialog.
 * ======================================================================== */
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
				<caption className={styles.srOnly}>
					{uploadsOnly
						? "Document upload activity"
						: "Recent onboarding and verification activity"}
				</caption>
				<thead>
					<tr>
						<th scope="col">Date &amp; time</th>
						<th scope="col">Action</th>
						<th scope="col">Document</th>
						<th scope="col">Status</th>
					</tr>
				</thead>
				<tbody>
					{shown.map((r) => (
						<tr key={`${r.time}-${r.doc}`}>
							<td>{r.time}</td>
							<td>{r.action}</td>
							<td>
								<strong>{r.doc}</strong>
							</td>
							<td>
								<span
									className={cx(
										styles.badge,
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

/* ==========================================================================
 * Reusable bodies (shared between page cards and modals)
 * ======================================================================== */
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
				<div
					className={cx(styles.kpiIcon, styles.iconAmber, "mx-auto mb-2")}
					style={{ width: 56, height: 56, fontSize: "1.4rem" }}
					aria-hidden="true"
				>
					<i className="bi bi-shield-check" />
				</div>
				<h3
					style={{ fontFamily: "'Sora', 'Inter', sans-serif", fontWeight: 700 }}
				>
					Enhanced Verification
				</h3>
				<p className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>
					{prog.pct}% complete • {prog.done} of {prog.required} required
					documents
					{type.name !== "Small Scale" ? <> for {type.name}</> : null}
				</p>
				<div
					className={styles.progressTrack}
					role="progressbar"
					aria-label="Verification progress"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={prog.pct}
					style={{ maxWidth: 400, margin: "0.8rem auto 0", height: 8 }}
				>
					<span style={{ width: `${prog.pct}%` }} />
				</div>
			</div>
			<h6
				className={styles.kicker}
				style={{ marginBottom: 10, color: "var(--ob-ink-soft)" }}
			>
				Document status
			</h6>
			<div className="d-flex flex-column gap-2">
				{type.docs.map((d) => {
					const status: DocStatus =
						draft.docs[d.key]?.status ?? "not-submitted";
					return (
						<ChecklistRow
							key={d.key}
							label={d.label}
							status={status}
							onUpload={() => openModal("uploadModal")}
						/>
					);
				})}
			</div>
			<div className={cx(styles.hintBox, styles.successHint, "mt-4")}>
				<i className="bi bi-graph-up-arrow" aria-hidden="true" />
				<span>
					<strong>Current privileges:</strong> daily limit KES 500,000 • 20
					beneficiaries • bulk payments (50) • payment links.
				</span>
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
		const st = draft.docs[d.key]?.status;
		return st === "pending" || st === "rejected";
	});
	const missing = type.docs.filter((d) => !draft.docs[d.key]);
	const groups: {
		title: string;
		icon: string;
		cls: string;
		rows: { doc: DocDef; status: DocStatus; date?: string }[];
	}[] = [
		{
			title: `Verified (${verified.length})`,
			icon: "bi-check-circle-fill",
			cls: styles.badgeSuccess,
			rows: verified.map((d) => ({ doc: d, status: "verified" as const })),
		},
		{
			title: `In review / rejected (${pending.length})`,
			icon: "bi-clock-fill",
			cls: styles.badgeWarn,
			rows: pending.map((d) => ({
				doc: d,
				status:
					draft.docs[d.key]?.status === "rejected"
						? ("rejected" as const)
						: ("pending" as const),
				date:
					draft.docs[d.key]?.status === "rejected" ? "Rejected" : "Reviewing",
			})),
		},
		{
			title: `Not submitted (${missing.length})`,
			icon: "bi-circle",
			cls: styles.badgeNeutral,
			rows: missing.map((d) => ({ doc: d, status: "not-submitted" as const })),
		},
	];
	return (
		<>
			{groups.map((group) => (
				<div key={group.title} className="mb-4">
					<span className={cx(styles.badge, group.cls, "mb-2")}>
						<i className={cx("bi me-1", group.icon)} aria-hidden="true" />
						{group.title}
					</span>
					{group.rows.length === 0 ? (
						<p className="text-muted mb-0" style={{ fontSize: "0.74rem" }}>
							Nothing in this group for {type.name} yet.
						</p>
					) : (
						<div className="d-flex flex-column gap-2">
							{group.rows.map((row) => (
								<ChecklistRow
									key={row.doc.key}
									label={row.doc.label}
									status={row.status}
									date={row.date}
									onUpload={() => openModal("uploadModal")}
								/>
							))}
						</div>
					)}
				</div>
			))}
		</>
	);
}

/* --------------------------------------------------------------------------
 * Comparison tables (limits + benefits dialogs)
 * ------------------------------------------------------------------------ */
function ComparisonTable({
	caption,
	rows,
}: {
	caption: string;
	rows: [string, string, string, string][];
}) {
	return (
		<div className={styles.tableWrap}>
			<table className={styles.table}>
				<caption className={styles.srOnly}>{caption}</caption>
				<thead>
					<tr>
						<th scope="col">Feature</th>
						<th scope="col">Basic</th>
						<th scope="col">Enhanced</th>
						<th scope="col">Certified</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row[0]}>
							<td>
								<strong>{row[0]}</strong>
							</td>
							<td>{row[1]}</td>
							<td>
								<strong>{row[2]}</strong>
							</td>
							<td style={{ color: "#067647" }}>
								<strong>{row[3]}</strong>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

const LIMIT_ROWS: [string, string, string, string][] = [
	["Daily limit", "KES 50K", "KES 500K", "KES 5M"],
	["Per transaction", "KES 25K", "KES 250K", "KES 2.5M"],
	["Monthly limit", "KES 500K", "KES 5M", "KES 50M"],
	["Fee rate", "1.5%", "1.2%", "0.8%"],
	["Beneficiaries", "3", "20", "Unlimited"],
	["Bulk payments", "—", "50 recipients", "Unlimited"],
	["API access", "—", "—", "Included"],
	["International", "—", "—", "Included"],
];

const BENEFIT_ROWS: [string, string, string, string][] = [
	["Business profile", "Included", "Included", "Included"],
	["Mobile money", "Included", "Included", "Included"],
	["Transaction history", "Basic", "Enhanced", "Full"],
	["Analytics", "—", "Basic", "Full"],
	["Payment links", "—", "Included", "Included"],
	["API access", "—", "—", "Included"],
	["International transfers", "—", "—", "Included"],
	["Priority support", "—", "—", "Included"],
];

/* --------------------------------------------------------------------------
 * How-to guide body
 * ------------------------------------------------------------------------ */
const GUIDE_GROUPS: { title: string; icon: string; items: string[] }[] = [
	{
		title: "Business Registration Certificate",
		icon: "bi-file-earmark-text",
		items: [
			"Visit the eCitizen portal (business.go.ke)",
			"Create or log in to your account",
			'Click "Register Business Name"',
			"Fill in business details (KES 150 fee)",
			"Wait 3-5 days for approval",
			"Download the certificate",
		],
	},
	{
		title: "County Business Permit",
		icon: "bi-buildings",
		items: [
			"Visit your county government office",
			"Bring ID, business registration and a passport photo",
			"Fill the application form",
			"Pay the fee (KES 5,000-15,000 depending on county)",
			"Wait 1-2 weeks for inspection and approval",
		],
	},
	{
		title: "Bank Statement (3 months)",
		icon: "bi-bank",
		items: [
			"Log in to online banking or visit your branch",
			"Request a statement for the last 3 months",
			"Download it as a PDF",
			"Ensure it shows your name and account number",
		],
	},
	{
		title: "Utility Bill",
		icon: "bi-lightbulb",
		items: [
			"Any recent bill: KPLC, water or internet",
			"Must show your name and address",
			"Must be less than 3 months old",
			"Download from the provider portal or use a physical copy",
		],
	},
	{
		title: "Portfolio / Sample Work",
		icon: "bi-briefcase",
		items: [
			"Freelancers and creatives: gather 3-5 recent samples",
			"Compile into a single PDF or image set",
			"Links to Behance, Dribbble or GitHub are accepted",
			"Samples unlock business-level limits",
		],
	},
];

function HowToBody() {
	return (
		<div>
			{GUIDE_GROUPS.map((g) => (
				<div className={styles.guideGroup} key={g.title}>
					<h6 className={styles.guideTitle}>
						<i className={cx("bi", g.icon)} aria-hidden="true" />
						{g.title}
					</h6>
					<div className={styles.guideBox}>
						<ol>
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

/* ==========================================================================
 * PUBLIC — all hosted workflows driven by the page's modalState map.
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
	const activeType = getBizType(draft.bizType || "small-scale");

	const setDoc = (key: string, file: UploadedFile) =>
		setDraft({ ...draft, docs: { ...draft.docs, [key]: file } });
	const removeDoc = (key: string) => {
		const docs = { ...draft.docs };
		delete docs[key];
		setDraft({ ...draft, docs });
	};

	return (
		<>
			{/* ============ M1: BIZ TYPE QUICK PICKER ============ */}
			<ModalShell
				show={isOpen("bizTypeModal")}
				onClose={() => close("bizTypeModal")}
				iconCls="bi bi-shop"
				title="Select business type"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								if (!draft.bizType) {
									onToast("Please select a business type first.", true);
									return;
								}
								openModal("startWizard");
								close("bizTypeModal");
							}}
						>
							Select &amp; continue <i className="bi bi-arrow-right" />
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("bizTypeModal")}
						>
							Cancel
						</button>
					</>
				}
			>
				<div className={cx(styles.hintBox, "mb-3")}>
					<i className="bi bi-info-circle" aria-hidden="true" />
					<span>
						Choose the category that best describes your business. Your required
						documents and limits depend on this choice.
					</span>
				</div>
				<div className={styles.bizTypeGrid}>
					{BIZ_TYPES.map((b) => (
						<button
							type="button"
							key={b.key}
							className={cx(
								styles.bizTypeCard,
								draft.bizType === b.key && styles.bizTypeSelected,
							)}
							aria-pressed={draft.bizType === b.key}
							onClick={() => setDraft({ ...draft, bizType: b.key })}
						>
							<span className={styles.bizTypeIcon}>
								<i className={cx("bi", b.icon)} aria-hidden="true" />
							</span>
							<span className={styles.bizTypeName}>{b.name}</span>
							<span className={styles.bizTypeDesc}>{b.desc}</span>
							<span className={styles.bizTypeDocs}>
								<span className={styles.docCount}>
									{b.docs.filter((d) => d.required).length} required docs
								</span>
							</span>
						</button>
					))}
				</div>
			</ModalShell>

			{/* ============ M2: UPLOAD DOCUMENTS ============ */}
			<ModalShell
				show={isOpen("uploadModal")}
				onClose={() => close("uploadModal")}
				iconCls="bi bi-cloud-arrow-up"
				title="Upload documents"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								const submitted = activeType.docs.filter(
									(d) => draft.docs[d.key],
								);
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
								setDraft({
									...draft,
									submitted: true,
									lastVisited: new Date().toISOString(),
								});
								swap("uploadModal", "successModal");
							}}
						>
							<i className="bi bi-check-lg me-1" aria-hidden="true" />
							Submit documents
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("uploadModal")}
						>
							Close
						</button>
					</>
				}
			>
				<div className={cx(styles.hintBox, styles.warnHint, "mb-3")}>
					<i className="bi bi-lightbulb" aria-hidden="true" />
					<span>
						Upload what you have now — you can update these later. Rejected or
						pending documents can be re-uploaded anytime.
					</span>
				</div>
				{activeType.docs.map((d) => (
					<UploadRow
						key={d.key}
						doc={d}
						file={draft.docs[d.key]}
						onFile={(f) => setDoc(d.key, f)}
						onRemove={() => removeDoc(d.key)}
					/>
				))}
				<div className={cx(styles.hintBox, "mt-3")}>
					<i className="bi bi-info-circle" aria-hidden="true" />
					<span>
						<strong>Don't have all documents?</strong> Submit what you have and
						we'll guide you on what to get next.
					</span>
				</div>
			</ModalShell>

			{/* ============ M3: AI ANALYSIS ============ */}
			<ModalShell
				show={isOpen("aiModal")}
				onClose={() => close("aiModal")}
				size="lg"
				iconCls="bi bi-robot"
				title="AI document analysis"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("aiModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" aria-hidden="true" />
							Start uploading
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("aiModal")}
						>
							Close
						</button>
					</>
				}
			>
				<div className={cx(styles.hintBox, styles.successHint, "mb-3")}>
					<i className="bi bi-stars" aria-hidden="true" />
					<span>
						<strong>Your path to Certified status.</strong> Based on your{" "}
						<strong>{activeType.name}</strong> profile, this is the fastest
						route to full certification.
					</span>
				</div>
				{RECOMMENDATIONS.map((rec) => (
					<RecommendationItem key={rec.rank} rec={rec} />
				))}
			</ModalShell>

			{/* ============ M4: LIMITS ============ */}
			<ModalShell
				show={isOpen("limitsModal")}
				onClose={() => close("limitsModal")}
				iconCls="bi bi-gauge-high"
				title="Transaction limits"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("limitsModal", "upgradeModal")}
						>
							Upgrade now
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("limitsModal")}
						>
							Close
						</button>
					</>
				}
			>
				<ComparisonTable
					caption="Transaction limits and fees by verification level"
					rows={LIMIT_ROWS}
				/>
			</ModalShell>

			{/* ============ M5: UPGRADE ============ */}
			<ModalShell
				show={isOpen("upgradeModal")}
				onClose={() => close("upgradeModal")}
				iconCls="bi bi-award"
				title="Upgrade to Certified"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("upgradeModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" aria-hidden="true" />
							Start uploading
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("upgradeModal")}
						>
							Maybe later
						</button>
					</>
				}
			>
				<div className="text-center mb-4">
					<div
						className={cx(styles.kpiIcon, styles.iconGreen, "mx-auto mb-2")}
						style={{ width: 64, height: 64, fontSize: "1.6rem" }}
						aria-hidden="true"
					>
						<i className="bi bi-award" />
					</div>
					<h3
						style={{
							fontFamily: "'Sora', 'Inter', sans-serif",
							fontWeight: 700,
						}}
					>
						Unlock 10× higher limits
					</h3>
					<p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
						Complete your remaining documents to reach Certified status.
					</p>
				</div>
				<div className={cx(styles.hintBox, styles.successHint, "mb-3")}>
					<i className="bi bi-stars" aria-hidden="true" />
					<span>
						<strong>What you'll unlock:</strong> KES 5,000,000 daily limit (10×
						increase) • 0.8% fees (save 40%) • API access • international
						transfers • priority support • unlimited bulk payments and
						beneficiaries.
					</span>
				</div>
				<h6 className={styles.kicker} style={{ color: "var(--ob-ink-soft)" }}>
					Required documents still missing
				</h6>
				{activeType.docs.filter((d) => !draft.docs[d.key]).length === 0 ? (
					<div className={cx(styles.hintBox, styles.successHint)}>
						<i className="bi bi-check-circle" aria-hidden="true" />
						<span>
							Every document for {activeType.name} is submitted — review is in
							progress.
						</span>
					</div>
				) : (
					activeType.docs
						.filter((d) => !draft.docs[d.key])
						.map((d) => (
							<ChecklistRow
								key={d.key}
								label={d.label}
								status="not-submitted"
								onUpload={() => swap("upgradeModal", "uploadModal")}
							/>
						))
				)}
				<div className={cx(styles.hintBox, "mt-3")}>
					<i className="bi bi-clock" aria-hidden="true" />
					<span>
						<strong>Estimated time:</strong> 2-3 weeks to complete all
						documents.
					</span>
				</div>
			</ModalShell>

			{/* ============ M6: STATUS ============ */}
			<ModalShell
				show={isOpen("statusModal")}
				onClose={() => close("statusModal")}
				iconCls="bi bi-shield-check"
				title="Verification status"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								openModal("startWizard");
								close("statusModal");
							}}
						>
							Continue onboarding
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("statusModal")}
						>
							Close
						</button>
					</>
				}
			>
				<VerificationStatusBody draft={draft} openModal={openModal} />
			</ModalShell>

			{/* ============ M7: FULL CHECKLIST ============ */}
			<ModalShell
				show={isOpen("checklistModal")}
				onClose={() => close("checklistModal")}
				iconCls="bi bi-clipboard-check"
				title="Full document checklist"
				size="lg"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("checklistModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" aria-hidden="true" />
							Upload missing documents
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("checklistModal")}
						>
							Close
						</button>
					</>
				}
			>
				<FullChecklistBody draft={draft} openModal={openModal} />
			</ModalShell>

			{/* ============ M8: BENEFITS ============ */}
			<ModalShell
				show={isOpen("benefitsModal")}
				onClose={() => close("benefitsModal")}
				size="lg"
				iconCls="bi bi-gift"
				title="Benefits comparison"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("benefitsModal", "upgradeModal")}
						>
							Upgrade to Certified
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("benefitsModal")}
						>
							Close
						</button>
					</>
				}
			>
				<ComparisonTable
					caption="Features available at each verification level"
					rows={BENEFIT_ROWS}
				/>
			</ModalShell>

			{/* ============ M9: ACTIVITY LOG ============ */}
			<TabbedModal
				show={isOpen("activityModal")}
				onClose={() => close("activityModal")}
				iconCls="bi bi-clock-history"
				title="Onboarding activity"
				tabs={[
					{
						key: "all",
						label: "All activity",
						render: () => <ActivityTable compact={false} rows={activity} />,
					},
					{
						key: "uploads",
						label: "Uploads only",
						render: () => (
							<ActivityTable compact={false} uploadsOnly rows={activity} />
						),
					},
				]}
			/>

			{/* ============ M10: HOW TO ============ */}
			<ModalShell
				show={isOpen("howToModal")}
				onClose={() => close("howToModal")}
				size="lg"
				iconCls="bi bi-mortarboard"
				title="How to get your documents"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => swap("howToModal", "uploadModal")}
						>
							<i className="bi bi-upload me-1" aria-hidden="true" />
							Start uploading
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("howToModal")}
						>
							Close
						</button>
					</>
				}
			>
				<HowToBody />
			</ModalShell>

			{/* ============ M11: SUCCESS ============ */}
			<ModalShell
				show={isOpen("successModal")}
				onClose={() => close("successModal")}
				iconCls="bi bi-check-circle"
				title="Documents submitted"
				footer={
					<>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={() => {
								close("successModal");
								onToast(
									"You will be notified via email when verification is complete.",
								);
								onSubmitted();
							}}
						>
							Got it
						</button>
						<button
							type="button"
							className={styles.btn}
							onClick={() => close("successModal")}
						>
							Close
						</button>
					</>
				}
			>
				<div className="text-center py-2">
					<div
						className={cx(styles.kpiIcon, styles.iconGreen, "mx-auto mb-3")}
						style={{
							width: 80,
							height: 80,
							fontSize: "2rem",
							borderRadius: "50%",
						}}
						aria-hidden="true"
					>
						<i className="bi bi-check-lg" />
					</div>
					<h3
						style={{
							fontFamily: "'Sora', 'Inter', sans-serif",
							fontWeight: 700,
							marginBottom: 8,
						}}
					>
						Documents received
					</h3>
					<p className="text-muted" style={{ fontSize: "0.8rem" }}>
						Your documents are being processed. We'll notify you once
						verification is complete — typically within 24-48 hours.
					</p>
					<div className={styles.guideBox}>
						<div className="d-flex justify-content-between gap-2 flex-wrap">
							<span>
								<strong>Reference:</strong> DOC-20260828-001
							</span>
							<span>
								<strong>Submitted:</strong> {new Date().toLocaleDateString()}
							</span>
							<span>
								<strong>Expected review:</strong> 24-48 hours
							</span>
						</div>
					</div>
				</div>
			</ModalShell>
		</>
	);
}

export default OnboardingModals;
