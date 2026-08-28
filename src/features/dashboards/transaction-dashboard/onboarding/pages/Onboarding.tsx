/* ============================================================================
 * Onboarding.tsx — PayMo Business Onboarding & Verification Center.
 * ----------------------------------------------------------------------------
 * Rebuilt in the navy/emerald PayMo business-dashboard language to match
 * Transfer Overview and Initiate Transfer:
 *
 *   - Executive navy→emerald hero with live verification snapshot.
 *   - 01 Verification readiness ......... four KPI cards derived from the draft.
 *   - 02 Complete business profile ...... inline nine-step guided builder with
 *       percentage progress, semantic stepper (scoped keyboard nav + control-
 *       safe touch swipes), one focused step panel and a progressive live
 *       summary. The draft persists to localStorage and resumes anytime.
 *   - 03 Verification levels & limits ... Basic / Enhanced / Certified tiers.
 *   - 04 Documents & next steps ......... per-business-type checklist summary
 *       and priority-ranked AI document recommendations.
 *   - 05 Assurance & recent activity .... control cards + activity table.
 *   - Floating command bar (desktop) / icon-first mobile bar + page footer.
 *
 * All hosted supporting workflows (upload, AI analysis, limits, upgrade,
 * status, checklist, benefits, activity, how-to, success, business-type
 * picker) live in OnboardingModals.tsx on the shared accessible primitives.
 * ========================================================================== */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	type TouchEvent as ReactTouchEvent,
	useCallback,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { cx } from "@/features/Layouts/shell/data/shellData";
import {
	ActivityTable,
	BIZ_TYPES,
	type BizTypeDef,
	type DocStatus,
	docProgress,
	getBizType,
	loadDraft,
	type OnboardingData,
	OnboardingModals,
	RECOMMENDATIONS,
	saveDraft,
	type UploadedFile,
	UploadRow,
	type WizardDraft,
} from "../components/OnboardingModals";
import styles from "../styles/onboarding.module.css";

/* --------------------------------------------------------------------------
 * initialMockData — page content (GET /api/onboarding should return this).
 * ------------------------------------------------------------------------ */
const initialMockData: OnboardingData = {
	bizTypes: BIZ_TYPES,
	activity: [
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
	],
};

async function fetchOnboarding(): Promise<OnboardingData> {
	const res = await fetch("/api/onboarding", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()) as OnboardingData;
}

/* --------------------------------------------------------------------------
 * Guided onboarding workflow — nine adaptive steps.
 * ------------------------------------------------------------------------ */
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
		title: "Business type",
		shortTitle: "Type",
		icon: "bi-grid-1x2",
		description: "Pick the category that fits — your document list adapts.",
	},
	{
		id: 2,
		title: "Business identity",
		shortTitle: "Identity",
		icon: "bi-building",
		description: "Legal name, structure and registration details.",
	},
	{
		id: 3,
		title: "Owner details",
		shortTitle: "Owner",
		icon: "bi-person-badge",
		description: "The person PayMo verifies against KRA and ID records.",
	},
	{
		id: 4,
		title: "Contact information",
		shortTitle: "Contact",
		icon: "bi-telephone",
		description: "How we reach you about verification and payouts.",
	},
	{
		id: 5,
		title: "Documents",
		shortTitle: "Docs",
		icon: "bi-folder2-open",
		description: "Upload what you have now — finish the rest later.",
	},
	{
		id: 6,
		title: "Banking & settlement",
		shortTitle: "Banking",
		icon: "bi-bank",
		description: "Where settlements land and how you receive payments.",
	},
	{
		id: 7,
		title: "Operations",
		shortTitle: "Ops",
		icon: "bi-gear",
		description: "Expected volumes, use cases and payout preferences.",
	},
	{
		id: 8,
		title: "Compliance",
		shortTitle: "Compliance",
		icon: "bi-shield-check",
		description: "AML, sanctions and KYC declarations under Kenyan law.",
	},
	{
		id: 9,
		title: "Review & submit",
		shortTitle: "Review",
		icon: "bi-clipboard-check",
		description: "Check every section, then submit for 24-48h review.",
	},
];

const TIERS = {
	Basic: {
		limit: "KES 50,000",
		fee: "1.5%",
		beneficiaries: "3",
		bulk: "—",
	},
	Enhanced: {
		limit: "KES 500,000",
		fee: "1.2%",
		beneficiaries: "20",
		bulk: "50",
	},
	Certified: {
		limit: "KES 5,000,000",
		fee: "0.8%",
		beneficiaries: "Unlimited",
		bulk: "Unlimited",
	},
} as const;

interface TierCardDef {
	name: string;
	state: string;
	icon: string;
	iconCls: string;
	tier: (typeof TIERS)[keyof typeof TIERS];
	active: boolean;
	locked?: boolean;
	ribbon?: string;
	action: () => void;
	actionLabel: string;
}

const kpiIcons = [
	"bi-shield-check",
	"bi-file-earmark-check",
	"bi-gauge-high",
	"bi-hourglass-split",
];
const kpiTones = ["Green", "Blue", "Violet", "Amber"] as const;

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

/* --------------------------------------------------------------------------
 * Field helpers — every label is associated via useId.
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
	const autoId = useId();
	return (
		<div
			className={
				half ? styles.fieldGroup : cx(styles.fieldGroup, styles.fieldFull)
			}
		>
			<label className={styles.labelText} htmlFor={autoId}>
				{label}{" "}
				{required ? (
					<span className={styles.requiredMark} aria-hidden="true">
						*
					</span>
				) : null}
			</label>
			<input
				id={autoId}
				type={type}
				className={styles.control}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
			/>
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
	const autoId = useId();
	return (
		<div
			className={
				half ? styles.fieldGroup : cx(styles.fieldGroup, styles.fieldFull)
			}
		>
			<label className={styles.labelText} htmlFor={autoId}>
				{label}{" "}
				{required ? (
					<span className={styles.requiredMark} aria-hidden="true">
						*
					</span>
				) : null}
			</label>
			<select
				id={autoId}
				className={cx(styles.control)}
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
	);
}

/* --------------------------------------------------------------------------
 * Wizard step bodies
 * ------------------------------------------------------------------------ */
function StepType({
	draft,
	setBizType,
}: {
	draft: WizardDraft;
	setBizType: (key: string) => void;
}) {
	return (
		<div className={styles.stepContent}>
			<div className={cx(styles.hintBox)}>
				<i className="bi bi-info-circle" aria-hidden="true" />
				<span>
					Choose the category that best describes your business. The documents
					required in step 5 and your progress metric adapt to this choice.
				</span>
			</div>
			<fieldset className={styles.fieldset}>
				<legend className={styles.srOnly}>Business type</legend>
				<div className={styles.bizTypeGrid}>
					{BIZ_TYPES.map((b: BizTypeDef) => {
						const reqCount = b.docs.filter((d) => d.required).length;
						const selected = draft.bizType === b.key;
						return (
							<button
								type="button"
								key={b.key}
								className={cx(
									styles.bizTypeCard,
									selected && styles.bizTypeSelected,
								)}
								aria-pressed={selected}
								onClick={() => setBizType(b.key)}
							>
								<span className={styles.bizTypeIcon}>
									<i className={cx("bi", b.icon)} aria-hidden="true" />
								</span>
								<span className={styles.bizTypeName}>{b.name}</span>
								<span className={styles.bizTypeDesc}>{b.desc}</span>
								<span className={styles.bizTypeDocs}>
									<span className={styles.docCount}>
										{reqCount} required {reqCount === 1 ? "doc" : "docs"}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			</fieldset>
			<div className={cx(styles.hintBox, styles.successHint)}>
				<i className="bi bi-lightbulb" aria-hidden="true" />
				<span>
					You can save the completed profile once and reuse it — skipped
					sections stay unlocked whenever you return.
				</span>
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
		<div className={styles.stepContent}>
			<div className={styles.formGrid}>
				<WField
					label="Business legal name"
					value={f("id.legalName")}
					onChange={(v) => setField("id.legalName", v)}
					placeholder="e.g. Kamau Traders"
					required
				/>
				<WSelect
					label="Legal structure"
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
					label="Year established"
					value={f("id.year")}
					onChange={(v) => setField("id.year", v)}
					placeholder="e.g. 2021"
					half
				/>
				<WField
					label="Registration / certificate number"
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
					label="Sector / industry"
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
			<div className={cx(styles.hintBox)}>
				<i className="bi bi-info-circle" aria-hidden="true" />
				<span>
					Legal names must match your KRA and registration records exactly.
				</span>
			</div>
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
	const phoneId = useId();
	return (
		<div className={styles.stepContent}>
			<div className={styles.formGrid}>
				<WField
					label="Full legal name"
					value={f("owner.name")}
					onChange={(v) => setField("owner.name", v)}
					placeholder="e.g. John Kamau Mwangi"
					required
				/>
				<WField
					label="National ID / passport number"
					value={f("owner.idNo")}
					onChange={(v) => setField("owner.idNo", v)}
					placeholder="e.g. 12345678"
					required
					half
				/>
				<WSelect
					label="ID type"
					value={f("owner.idType")}
					onChange={(v) => setField("owner.idType", v)}
					options={["National ID", "Passport", "Alien Card", "Driving License"]}
					half
				/>
				<WField
					label="Date of birth"
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
				<div className={styles.fieldGroup}>
					<label className={styles.labelText} htmlFor={phoneId}>
						Phone number{" "}
						<span className={styles.requiredMark} aria-hidden="true">
							*
						</span>
					</label>
					<div className={styles.amountControl}>
						<span>+254</span>
						<input
							id={phoneId}
							className={styles.control}
							style={{ border: 0 }}
							value={f("owner.phone")}
							onChange={(e) => setField("owner.phone", e.target.value)}
							placeholder="712 345 890"
							type="tel"
						/>
					</div>
				</div>
				<WField
					label="Email address"
					value={f("owner.email")}
					onChange={(v) => setField("owner.email", v)}
					type="email"
					placeholder="you@example.com"
					required
					half
				/>
				<WField
					label="Physical address"
					value={f("owner.address")}
					onChange={(v) => setField("owner.address", v)}
					placeholder="e.g. Kawangware, Nairobi"
				/>
			</div>
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
		<div className={styles.stepContent}>
			<div className={styles.formGrid}>
				<WField
					label="Business phone"
					value={f("contact.phone")}
					onChange={(v) => setField("contact.phone", v)}
					placeholder="e.g. 0712 345 890"
					required
					half
				/>
				<WField
					label="Business email"
					value={f("contact.email")}
					onChange={(v) => setField("contact.email", v)}
					type="email"
					placeholder="hello@business.co.ke"
					required
					half
				/>
				<WField
					label="Website / social handle"
					value={f("contact.web")}
					onChange={(v) => setField("contact.web", v)}
					placeholder="kamautraders.co.ke or @kamautraders"
				/>
				<WField
					label="Business physical address"
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
					label="Preferred contact time"
					value={f("contact.hours")}
					onChange={(v) => setField("contact.hours", v)}
					placeholder="e.g. Weekdays 9am – 5pm"
					half
				/>
			</div>
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
	const requiredCount = type.docs.filter((d) => d.required).length;
	return (
		<div className={styles.stepContent}>
			<div className={cx(styles.hintBox, styles.successHint)}>
				<i className="bi bi-lightbulb" aria-hidden="true" />
				<span>
					Upload what you have now — you can always return later.{" "}
					<strong>{type.name}</strong> needs {requiredCount} documents to unlock
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
		<div className={styles.stepContent}>
			<div className={styles.formGrid}>
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
					label="Account name"
					value={f("bank.acctName")}
					onChange={(v) => setField("bank.acctName", v)}
					placeholder="Must match legal name"
					required
					half
				/>
				<WField
					label="Account number"
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
					label="Settlement currency"
					value={f("bank.currency")}
					onChange={(v) => setField("bank.currency", v)}
					options={["KES", "USD", "EUR", "GBP"]}
					half
				/>
			</div>
			<div className={cx(styles.hintBox)}>
				<i className="bi bi-shield-lock" aria-hidden="true" />
				<span>
					Bank details are used for settlements and verified against your KRA
					records. Mobile-money lines are optional for personal withdrawals.
				</span>
			</div>
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
		<div className={styles.stepContent}>
			<div className={styles.formGrid}>
				<WSelect
					label="Expected monthly volume"
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
					label="Average transaction size"
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
					label="Primary use case"
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
					label="Payout preference"
					value={f("ops.payout")}
					onChange={(v) => setField("ops.payout", v)}
					options={["Daily", "Weekly", "Bi-weekly", "Monthly"]}
					half
				/>
				<WField
					label="Number of locations"
					value={f("ops.locations")}
					onChange={(v) => setField("ops.locations", v)}
					placeholder="e.g. 1"
					half
				/>
				<WField
					label="Peak business hours"
					value={f("ops.peak")}
					onChange={(v) => setField("ops.peak", v)}
					placeholder="e.g. 8am – 9pm"
					half
				/>
			</div>
			<div className={cx(styles.hintBox, styles.warnHint)}>
				<i className="bi bi-clock-history" aria-hidden="true" />
				<span>
					<strong>Keep your account active.</strong> About one month after
					onboarding we run a light KYC check to confirm you still need the
					service. Accounts with no activity for 90+ days are flagged dormant
					and paused to protect you — reactivation just takes a fresh KYC check.
				</span>
			</div>
		</div>
	);
}

const COMPLIANCE_ITEMS = [
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
		label: "I confirm all information provided is true, accurate and complete.",
	},
];

function StepCompliance({
	draft,
	setField,
}: {
	draft: WizardDraft;
	setField: (k: string, v: string) => void;
}) {
	const f = (k: string) => draft.fields[k] ?? "";
	const agreed = COMPLIANCE_ITEMS.filter(
		(c) => f(`comp.${c.key}`) === "yes",
	).length;
	return (
		<div className={styles.stepContent}>
			<div className={cx(styles.hintBox)}>
				<i className="bi bi-shield-check" aria-hidden="true" />
				<span>
					Compliance steps protect both you and PayMo. Declarations are legally
					binding under Kenyan law (POCAMLA, 2009).
				</span>
			</div>
			<WField
				label="Beneficial owner / signatory name"
				value={f("comp.beneficial")}
				onChange={(v) => setField("comp.beneficial", v)}
				placeholder="Person(s) who control the account"
				required
			/>
			<div className={styles.formGrid}>
				<WSelect
					label="Source of funds"
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
					label="Expected monthly turnover"
					value={f("comp.turnover")}
					onChange={(v) => setField("comp.turnover", v)}
					placeholder="e.g. KES 250,000"
					half
				/>
			</div>
			<fieldset className={styles.fieldset}>
				<legend className={styles.labelText}>
					Declarations ({agreed} of {COMPLIANCE_ITEMS.length} confirmed)
				</legend>
				<div className="d-flex flex-column gap-2">
					{COMPLIANCE_ITEMS.map((c) => {
						const checked = f(`comp.${c.key}`) === "yes";
						return (
							<label
								key={c.key}
								className={styles.checkboxRow}
								htmlFor={`comp-decl-${c.key}`}
							>
								<input
									id={`comp-decl-${c.key}`}
									type="checkbox"
									checked={checked}
									onChange={(e) =>
										setField(`comp.${c.key}`, e.target.checked ? "yes" : "")
									}
								/>
								<span>
									<strong>{c.label}</strong>
								</span>
							</label>
						);
					})}
				</div>
			</fieldset>
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
		{ label: "Business type", value: draft.bizType ? type.name : "—", step: 1 },
		{ label: "Legal name", value: f("id.legalName") || "—", step: 2 },
		{ label: "Structure", value: f("id.structure") || "—", step: 2 },
		{ label: "KRA PIN", value: f("id.kraPin") || "—", step: 2 },
		{ label: "Owner", value: f("owner.name") || "—", step: 3 },
		{ label: "Owner ID", value: f("owner.idNo") || "—", step: 3 },
		{ label: "Contact phone", value: f("contact.phone") || "—", step: 4 },
		{ label: "Business email", value: f("contact.email") || "—", step: 4 },
		{
			label: "Documents",
			value: `${prog.done} of ${prog.required} required uploaded`,
			step: 5,
		},
		{ label: "Bank", value: f("bank.name") || "—", step: 6 },
		{ label: "Account", value: f("bank.acctNo") || "—", step: 6 },
		{ label: "Monthly volume", value: f("ops.volume") || "—", step: 7 },
	];
	return (
		<div className={styles.stepContent}>
			<div className={cx(styles.hintBox, styles.successHint)}>
				<i className="bi bi-clipboard-check" aria-hidden="true" />
				<span>
					<strong>
						{prog.done} of {prog.required} required documents
					</strong>{" "}
					submitted ({prog.pct}%). You can submit now and finish the rest later,
					or return to any section using the Edit links.
				</span>
			</div>
			<div className={styles.card} style={{ padding: "0.6rem 1rem" }}>
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
							className={styles.textButton}
							onClick={() => goTo(r.step)}
						>
							Edit <i className="bi bi-pencil" aria-hidden="true" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------ */
export default function Onboarding() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});
	const [draft, setDraftState] = useState<WizardDraft>(() => loadDraft());
	const [toasts, setToasts] = useState<
		{ id: number; msg: string; danger?: boolean }[]
	>([]);
	const builderRef = useRef<HTMLElement | null>(null);
	const swipeStart = useRef<{ x: number; y: number } | null>(null);

	const updateDraft = useCallback((d: WizardDraft) => {
		setDraftState(d);
		saveDraft(d);
	}, []);

	const toast = useCallback((msg: string, danger?: boolean) => {
		const id = Date.now() + Math.random();
		setToasts((p) => [...p, { id, msg, danger }]);
		window.setTimeout(
			() => setToasts((p) => p.filter((t) => t.id !== id)),
			3600,
		);
	}, []);

	const {
		data: remoteData,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["paymo-onboarding"],
		queryFn: fetchOnboarding,
		initialData: initialMockData,
		staleTime: 60_000,
		retry: 1,
	});
	const data = remoteData ?? initialMockData;
	const activity = data?.activity ?? initialMockData.activity;

	const prog = docProgress(draft);
	const type = getBizType(draft.bizType || "small-scale");
	const currentStep = Math.min(STEPS.length, Math.max(1, draft.step || 1));

	const tierName =
		prog.pct >= 100
			? "Certified"
			: prog.done > 0 || draft.bizType
				? "Enhanced"
				: "Basic";
	const tier = TIERS[tierName as keyof typeof TIERS];
	const pendingDocs = type.docs.filter(
		(d) => draft.docs[d.key]?.status === "pending",
	).length;

	/* Modal host map — the guided builder is inline; "startWizard" / legacy
	 * "wizardModal" requests jump into the inline builder instead. */
	const openModal = useCallback(
		(id: string) => {
			if (id === "startWizard" || id === "wizardModal") {
				const resume = draft.submitted
					? STEPS.length
					: Math.min(STEPS.length, Math.max(1, draft.step || 1));
				updateDraft({
					...draft,
					step: resume,
					lastVisited: new Date().toISOString(),
				});
				window.requestAnimationFrame(() =>
					builderRef.current?.scrollIntoView({
						behavior: "smooth",
						block: "start",
					}),
				);
				return;
			}
			setModalState((p) => ({ ...p, [id]: true }));
		},
		[draft, updateDraft],
	);
	const closeModal = useCallback(
		(id: string) => setModalState((p) => ({ ...p, [id]: false })),
		[],
	);

	const setField = useCallback(
		(k: string, v: string) =>
			updateDraft({ ...draft, fields: { ...draft.fields, [k]: v } }),
		[draft, updateDraft],
	);
	const setBizType = useCallback(
		(key: string) => updateDraft({ ...draft, bizType: key }),
		[draft, updateDraft],
	);
	const setDoc = useCallback(
		(key: string, file: UploadedFile) =>
			updateDraft({ ...draft, docs: { ...draft.docs, [key]: file } }),
		[draft, updateDraft],
	);
	const removeDoc = useCallback(
		(key: string) => {
			const docs = { ...draft.docs };
			delete docs[key];
			updateDraft({ ...draft, docs });
		},
		[draft, updateDraft],
	);

	const goToStep = useCallback(
		(n: number) => {
			if (n < 1 || n > STEPS.length) return;
			const completed = draft.completedSteps.includes(currentStep)
				? draft.completedSteps
				: [...draft.completedSteps, currentStep];
			updateDraft({
				...draft,
				step: n,
				completedSteps: completed,
				lastVisited: new Date().toISOString(),
			});
		},
		[currentStep, draft, updateDraft],
	);
	const nextStep = () => goToStep(currentStep + 1);
	const prevStep = () => goToStep(currentStep - 1);

	const progressPercent = Math.round((currentStep / STEPS.length) * 100);
	const activeStep = STEPS[currentStep - 1];
	const canContinue = currentStep === 1 ? draft.bizType !== "" : true;
	const isReview = currentStep === STEPS.length;

	const handleStepperKeys = (event: ReactKeyboardEvent<HTMLOListElement>) => {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const target =
			event.key === "Home"
				? 1
				: event.key === "End"
					? STEPS.length
					: event.key === "ArrowRight"
						? Math.min(STEPS.length, currentStep + 1)
						: Math.max(1, currentStep - 1);
		goToStep(target);
		window.requestAnimationFrame(() =>
			document.getElementById(`onboarding-step-${target}`)?.focus(),
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

	/* Progressive live summary — rows appear as the operator reaches steps. */
	const summary = useMemo(() => {
		const f = (k: string) => draft.fields[k] ?? "";
		const rows: {
			icon: string;
			label: string;
			value: string;
			detail?: string;
		}[] = [];
		if (draft.bizType) {
			rows.push({
				icon: "bi-grid-1x2",
				label: "Business profile",
				value: type.name,
				detail: `${type.docs.filter((d) => d.required).length} required documents`,
			});
		}
		if (currentStep >= 2 && f("id.legalName")) {
			rows.push({
				icon: "bi-building",
				label: "Legal identity",
				value: f("id.legalName"),
				detail: [f("id.structure"), f("id.kraPin")].filter(Boolean).join(" • "),
			});
		}
		if (currentStep >= 3 && f("owner.name")) {
			rows.push({
				icon: "bi-person-badge",
				label: "Owner",
				value: f("owner.name"),
				detail: [f("owner.idNo"), f("owner.email")].filter(Boolean).join(" • "),
			});
		}
		if (currentStep >= 4 && (f("contact.phone") || f("contact.email"))) {
			rows.push({
				icon: "bi-telephone",
				label: "Contact",
				value: f("contact.phone") || f("contact.email"),
				detail: [f("contact.county"), f("contact.email")]
					.filter(Boolean)
					.join(" • "),
			});
		}
		if (currentStep >= 5) {
			rows.push({
				icon: "bi-folder2-open",
				label: "Documents",
				value: `${prog.done} of ${prog.required} uploaded`,
				detail:
					pendingDocs > 0
						? `${pendingDocs} in review`
						: "Nothing pending review",
			});
		}
		if (currentStep >= 6 && f("bank.name")) {
			rows.push({
				icon: "bi-bank",
				label: "Settlement",
				value: f("bank.name"),
				detail: [f("bank.acctNo"), f("bank.currency")]
					.filter(Boolean)
					.join(" • "),
			});
		}
		if (currentStep >= 7 && f("ops.volume")) {
			rows.push({
				icon: "bi-gear",
				label: "Operations",
				value: f("ops.volume"),
				detail: f("ops.useCase"),
			});
		}
		if (currentStep >= 8) {
			const agreed = COMPLIANCE_ITEMS.filter(
				(c) => draft.fields[`comp.${c.key}`] === "yes",
			).length;
			rows.push({
				icon: "bi-shield-check",
				label: "Compliance",
				value: `${agreed} of ${COMPLIANCE_ITEMS.length} declarations`,
				detail:
					agreed === COMPLIANCE_ITEMS.length ? "All confirmed" : "In progress",
			});
		}
		return rows;
	}, [currentStep, draft, prog.done, prog.required, pendingDocs, type]);

	const kpis = [
		{
			label: "Verification level",
			value: tierName,
			badge:
				tierName === "Certified"
					? { text: "Full access", cls: styles.badgeSuccess }
					: tierName === "Enhanced"
						? { text: "Current level", cls: styles.badgeWarn }
						: { text: "Start onboarding", cls: styles.badgeNeutral },
			description: `${prog.done} of ${prog.required} required documents for ${type.name}`,
		},
		{
			label: "Documents uploaded",
			value: `${prog.done}/${prog.required}`,
			badge: { text: `${prog.pct}% complete`, cls: styles.badgeInfo },
			description:
				pendingDocs > 0
					? `${pendingDocs} awaiting review • rejections can be re-uploaded`
					: "Upload what you have, finish the rest later",
		},
		{
			label: "Daily send limit",
			value: tier.limit,
			badge: { text: `${tier.fee} fees`, cls: styles.badgeViolet },
			description: `${tier.beneficiaries} beneficiaries • bulk: ${tier.bulk}`,
		},
		{
			label: "Review window",
			value: "24-48h",
			badge:
				pendingDocs > 0
					? { text: `${pendingDocs} in review`, cls: styles.badgeWarn }
					: { text: "No queue", cls: styles.badgeSuccess },
			description: "Typical verification turnaround after submission",
		},
	];

	const missingDocs = type.docs.filter((d) => !draft.docs[d.key]);

	return (
		<div className={styles.obPage}>
			<main className={styles.main}>
				<div className={styles.content}>
					{/* ---------- Executive hero ---------- */}
					<section
						className={styles.heroBanner}
						aria-labelledby="onboarding-title"
					>
						<div className={styles.heroOrbOne} />
						<div className={styles.heroOrbTwo} />
						<div className={styles.heroContent}>
							<div className={styles.heroCopy}>
								<div className={styles.heroEyebrow}>
									<span>
										<i className="bi bi-rocket-takeoff" aria-hidden="true" />{" "}
										Guided onboarding
									</span>
									<span className={styles.livePill}>
										<span className={styles.liveDot} />{" "}
										{isFetching ? "Checking profile" : "KYC desk live"}
									</span>
								</div>
								<h1 id="onboarding-title">
									Verify once. Unlock bigger limits as your business grows.
								</h1>
								<p>
									Build a compliant business profile in nine clear steps. Start
									with what you have, upload documents progressively and resume
									anytime — a light check-in after one month keeps your account
									active, and dormant accounts are paused to protect you.
								</p>
								<div className={styles.heroActions}>
									<button
										type="button"
										className={styles.heroPrimary}
										onClick={() => openModal("startWizard")}
									>
										<i className="bi bi-play-fill" aria-hidden="true" />{" "}
										{draft.bizType ? "Continue onboarding" : "Start onboarding"}
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() =>
											draft.bizType
												? openModal("uploadModal")
												: openModal("bizTypeModal")
										}
									>
										<i className="bi bi-cloud-arrow-up" aria-hidden="true" />{" "}
										Upload documents
									</button>
									<button
										type="button"
										className={styles.heroSecondary}
										onClick={() => openModal("statusModal")}
									>
										<i className="bi bi-shield-check" aria-hidden="true" /> View
										status
									</button>
								</div>
							</div>
							<aside
								className={styles.heroSnapshot}
								aria-label="Verification snapshot"
							>
								<span>Profile completion</span>
								<strong>{prog.pct}%</strong>
								<p>
									{prog.done} of {prog.required} required documents •{" "}
									{type.name}
								</p>
								<div className={styles.heroMetricRow}>
									<div>
										<strong>{tierName}</strong>
										<span>Current level</span>
									</div>
									<div>
										<strong>{tier.limit.replace("KES ", "")}</strong>
										<span>Daily limit</span>
									</div>
									<div>
										<strong>24-48h</strong>
										<span>Review window</span>
									</div>
								</div>
							</aside>
						</div>
					</section>

					{draft.bizType && !draft.submitted ? (
						<output className={styles.resumeBanner}>
							<i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
							<div style={{ flex: 1, minWidth: 0 }}>
								<strong>
									Draft saved — you're {prog.pct}% complete for {type.name}.
								</strong>
								<small>
									Last visited{" "}
									{new Date(draft.lastVisited).toLocaleDateString()}. Skipped
									sections stay open whenever you return.
								</small>
							</div>
							<button
								type="button"
								className={cx(styles.btn, styles.btnPrimary)}
								onClick={() => openModal("startWizard")}
							>
								Resume <i className="bi bi-arrow-right" aria-hidden="true" />
							</button>
						</output>
					) : null}

					{error ? (
						<output className={styles.statusNotice}>
							<i className="bi bi-cloud-slash" aria-hidden="true" />
							<span>
								<strong>Live onboarding data is temporarily unavailable</strong>
								<small>Using the latest local profile snapshot.</small>
							</span>
						</output>
					) : null}

					{/* ---------- 01 Verification readiness ---------- */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="readiness-heading"
					>
						<SectionHeading
							index="01"
							id="readiness-heading"
							title="Verification readiness"
							description="Your current level, document progress, limits and review workload before you continue."
						/>
						<div className={styles.kpiGrid}>
							{kpis.map((kpi, index) => (
								<article
									className={cx(styles.card, styles.kpiCard)}
									key={kpi.label}
								>
									<span
										className={cx(
											styles.kpiIcon,
											styles[`icon${kpiTones[index]}`],
										)}
									>
										<i className={`bi ${kpiIcons[index]}`} aria-hidden="true" />
									</span>
									<div className={styles.kpiMeta}>
										<span>{kpi.label}</span>
										<small>{type.name} profile</small>
									</div>
									<strong className={styles.kpiValue}>{kpi.value}</strong>
									<div className={styles.kpiFoot}>
										<span className={cx(styles.badge, kpi.badge.cls)}>
											{kpi.badge.text}
										</span>
										<span>{kpi.description}</span>
									</div>
								</article>
							))}
						</div>
					</section>

					{/* ---------- 02 Complete business profile ---------- */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="builder-heading"
						ref={builderRef}
					>
						<SectionHeading
							index="02"
							id="builder-heading"
							title="Complete business profile"
							description="Work through the guided nine-step process in sequence, or revisit any completed section before you submit."
						/>
						<div className={styles.builderCard}>
							<div className={styles.builderProgress}>
								<div className={styles.progressHeading}>
									<div>
										<span>Profile progress</span>
										<strong>{progressPercent}% of steps visited</strong>
									</div>
									<span>
										Step {currentStep} of {STEPS.length}
										<button
											type="button"
											className={cx(styles.textButton, "ms-2")}
											onClick={() => {
												updateDraft({
													...draft,
													lastVisited: new Date().toISOString(),
												});
												toast(
													"Progress saved — resume anytime from where you left off.",
												);
											}}
										>
											<i className="bi bi-floppy" aria-hidden="true" /> Save
											draft
										</button>
									</span>
								</div>
								<div
									className={styles.progressTrack}
									role="progressbar"
									aria-label="Onboarding step progress"
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={progressPercent}
								>
									<span style={{ width: `${progressPercent}%` }} />
								</div>
								<div className={styles.stepTrack}>
									<ol
										onKeyDown={handleStepperKeys}
										aria-label="Onboarding steps"
									>
										{STEPS.map((step) => (
											<li
												key={step.id}
												className={cx(
													styles.stepItem,
													step.id < currentStep && styles.stepDone,
													step.id === currentStep && styles.stepCurrent,
												)}
											>
												<button
													id={`onboarding-step-${step.id}`}
													type="button"
													tabIndex={step.id === currentStep ? 0 : -1}
													aria-current={
														step.id === currentStep ? "step" : undefined
													}
													onClick={() => goToStep(step.id)}
												>
													<span>
														{step.id < currentStep ? (
															<i
																className="bi bi-check-lg"
																aria-hidden="true"
															/>
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
									aria-label="Active onboarding step"
									onTouchStart={handleTouchStart}
									onTouchEnd={handleTouchEnd}
									onTouchCancel={() => {
										swipeStart.current = null;
									}}
								>
									<header className={styles.formHeader}>
										<span className={styles.stepHeroIcon}>
											<i
												className={`bi ${activeStep.icon}`}
												aria-hidden="true"
											/>
										</span>
										<div>
											<span>
												Step {currentStep} of {STEPS.length}
											</span>
											<h3>{activeStep.title}</h3>
											<p>{activeStep.description}</p>
										</div>
									</header>
									<div className={styles.formBody} key={currentStep}>
										{currentStep === 1 && (
											<StepType draft={draft} setBizType={setBizType} />
										)}
										{currentStep === 2 && (
											<StepIdentity draft={draft} setField={setField} />
										)}
										{currentStep === 3 && (
											<StepOwner draft={draft} setField={setField} />
										)}
										{currentStep === 4 && (
											<StepContact draft={draft} setField={setField} />
										)}
										{currentStep === 5 && (
											<StepDocs
												draft={draft}
												setDoc={setDoc}
												removeDoc={removeDoc}
											/>
										)}
										{currentStep === 6 && (
											<StepBanking draft={draft} setField={setField} />
										)}
										{currentStep === 7 && (
											<StepOps draft={draft} setField={setField} />
										)}
										{currentStep === 8 && (
											<StepCompliance draft={draft} setField={setField} />
										)}
										{currentStep === 9 && (
											<StepReview draft={draft} goTo={goToStep} />
										)}
									</div>
									<div className={styles.formFooter}>
										<button
											type="button"
											className={styles.btn}
											onClick={prevStep}
											disabled={currentStep === 1}
										>
											<i className="bi bi-arrow-left" aria-hidden="true" /> Back
										</button>
										<span>
											{isReview
												? "Ready to submit for review"
												: `Next: ${STEPS[currentStep]?.title}`}
										</span>
										{isReview ? (
											<button
												type="button"
												className={cx(styles.btn, styles.btnPrimary)}
												onClick={() => {
													const final = {
														...draft,
														submitted: true,
														completedSteps: STEPS.map((s) => s.id),
														lastVisited: new Date().toISOString(),
													};
													updateDraft(final);
													openModal("successModal");
												}}
											>
												Submit application{" "}
												<i className="bi bi-check2" aria-hidden="true" />
											</button>
										) : (
											<button
												type="button"
												className={cx(styles.btn, styles.btnPrimary)}
												onClick={nextStep}
												disabled={!canContinue}
												title={
													!canContinue
														? "Select a business type first"
														: undefined
												}
											>
												Continue{" "}
												<i className="bi bi-arrow-right" aria-hidden="true" />
											</button>
										)}
									</div>
								</section>

								<aside
									className={styles.summaryPanel}
									aria-label="Live profile summary"
									aria-live="polite"
								>
									<div className={styles.summaryHeader}>
										<div>
											<span className={styles.kicker}>Live review</span>
											<h3>Profile summary</h3>
										</div>
										<span
											className={cx(
												styles.badge,
												draft.submitted
													? styles.badgeSuccess
													: styles.badgeNeutral,
											)}
										>
											{draft.submitted ? "Submitted" : "Draft"}
										</span>
									</div>
									<div className={styles.summaryBody}>
										{summary.length === 0 ? (
											<div className={styles.summaryEmpty}>
												<i
													className="bi bi-clipboard-data"
													aria-hidden="true"
												/>
												Your selections will appear here as you complete each
												step.
											</div>
										) : (
											summary.map((row) => (
												<SummaryRow
													key={row.label}
													icon={row.icon}
													label={row.label}
													value={row.value}
													detail={row.detail}
												/>
											))
										)}
									</div>
									<div className={styles.summaryTotal}>
										<span>Profile completion</span>
										<strong>{prog.pct}%</strong>
										<small>
											{prog.done} of {prog.required} required documents for{" "}
											{type.name}
										</small>
									</div>
									<div className={styles.summarySecurity}>
										<i className="bi bi-shield-check" aria-hidden="true" />
										<span>
											<strong>Protected onboarding</strong>
											<small>Encrypted • KYC governed • resume anytime</small>
										</span>
									</div>
								</aside>
							</div>
						</div>
					</section>

					{/* ---------- 03 Verification levels & limits ---------- */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="tiers-heading"
					>
						<SectionHeading
							index="03"
							id="tiers-heading"
							title="Verification levels & limits"
							description="Progressive verification unlocks more powerful features and higher limits as your business grows."
						/>
						<div className={styles.tierGrid}>
							{(
								[
									{
										name: "Basic",
										state: "Start in minutes",
										icon: "bi-patch-check",
										iconCls: styles.iconGreen,
										tier: TIERS.Basic,
										active: tierName === "Basic",
										action: () => openModal("limitsModal"),
										actionLabel: "View limits",
									},
									{
										name: "Enhanced",
										state: "For scaling businesses",
										icon: "bi-shield-check",
										iconCls: styles.iconAmber,
										tier: TIERS.Enhanced,
										active: tierName === "Enhanced",
										action: () => openModal("statusModal"),
										actionLabel: "View status",
										ribbon: "Current level",
									},
									{
										name: "Certified",
										state: "Full power unlocked",
										icon: "bi-award",
										iconCls: styles.iconViolet,
										tier: TIERS.Certified,
										active: tierName === "Certified",
										locked: tierName !== "Certified",
										action: () => openModal("upgradeModal"),
										actionLabel:
											tierName === "Certified"
												? "View benefits"
												: "Upgrade now",
										ribbon: tierName === "Certified" ? "Unlocked" : undefined,
									},
								] as TierCardDef[]
							).map((tierCard) => (
								<article
									key={tierCard.name}
									className={cx(
										styles.tierCard,
										tierCard.active && styles.tierCardCurrent,
										tierCard.locked && styles.tierCardLocked,
									)}
								>
									{tierCard.ribbon ? (
										<span className={styles.tierRibbon}>{tierCard.ribbon}</span>
									) : null}
									<div className={styles.tierHead}>
										<span
											className={cx(styles.tierIcon, tierCard.iconCls)}
											aria-hidden="true"
										>
											<i className={`bi ${tierCard.icon}`} />
										</span>
										<div>
											<div className={styles.tierName}>{tierCard.name}</div>
											<div className={styles.tierState}>{tierCard.state}</div>
										</div>
									</div>
									<div className={styles.tierStats}>
										<div className={styles.tierStat}>
											<span>Daily limit</span>
											<strong>{tierCard.tier.limit}</strong>
										</div>
										<div className={styles.tierStat}>
											<span>Fee rate</span>
											<strong>{tierCard.tier.fee}</strong>
										</div>
										<div className={styles.tierStat}>
											<span>Beneficiaries</span>
											<strong>{tierCard.tier.beneficiaries}</strong>
										</div>
										<div className={styles.tierStat}>
											<span>Bulk payments</span>
											<strong>{tierCard.tier.bulk}</strong>
										</div>
									</div>
									<div className={styles.tierFoot}>
										<p>
											{tierCard.name === "Certified"
												? "API access & international transfers"
												: tierCard.name === "Enhanced"
													? "Payment links & invoices included"
													: "Mobile money & basic history"}
										</p>
										<button
											type="button"
											className={cx(
												styles.btn,
												tierCard.active && styles.btnPrimary,
											)}
											onClick={tierCard.action}
										>
											{tierCard.actionLabel}
										</button>
									</div>
								</article>
							))}
						</div>
						<div className={styles.upgradeStrip}>
							<span>
								<i className="bi bi-stars" aria-hidden="true" />{" "}
								<strong>Upgrade to Certified</strong> to unlock{" "}
								<strong>10× higher limits</strong>, <strong>0.8% fees</strong>{" "}
								(save 40%), API access and international transfers.
							</span>
							<span className="d-flex gap-2 flex-wrap">
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									onClick={() => openModal("upgradeModal")}
								>
									Upgrade now
								</button>
								<button
									type="button"
									className={styles.btn}
									onClick={() => openModal("benefitsModal")}
								>
									Compare benefits
								</button>
							</span>
						</div>
					</section>

					{/* ---------- 04 Documents & next steps ---------- */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="next-steps-heading"
					>
						<SectionHeading
							index="04"
							id="next-steps-heading"
							title="Documents & next steps"
							description="Your checklist adapts to the selected business type. Missing documents are ranked by how much limit they unlock."
						/>
						<div className={styles.nextGrid}>
							<div className={styles.card}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<div>
										<span className={styles.kicker}>Required for</span>
										<h3
											style={{
												fontFamily: "'Sora', 'Inter', sans-serif",
												fontSize: "0.95rem",
												margin: 0,
											}}
										>
											{type.name} checklist
										</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openModal("checklistModal")}
									>
										Full checklist{" "}
										<i className="bi bi-arrow-right" aria-hidden="true" />
									</button>
								</div>
								<fieldset className={styles.pillRow}>
									<legend className={styles.srOnly}>
										Business type filter
									</legend>
									{BIZ_TYPES.map((b) => (
										<button
											key={b.key}
											type="button"
											className={cx(
												styles.pill,
												draft.bizType === b.key && styles.pillActive,
											)}
											aria-pressed={draft.bizType === b.key}
											onClick={() => setBizType(b.key)}
										>
											<i className={cx("bi me-1", b.icon)} aria-hidden="true" />
											{b.name}
										</button>
									))}
								</fieldset>
								<div className={styles.docStats}>
									<div className={cx(styles.docStat, styles.docStatGood)}>
										<strong>
											{
												type.docs.filter(
													(d) => draft.docs[d.key]?.status === "verified",
												).length
											}
										</strong>
										<span>Verified</span>
									</div>
									<div className={cx(styles.docStat, styles.docStatWarn)}>
										<strong>
											{
												type.docs.filter((d) => {
													const st: DocStatus | undefined =
														draft.docs[d.key]?.status;
													return st === "pending" || st === "rejected";
												}).length
											}
										</strong>
										<span>In review</span>
									</div>
									<div className={styles.docStat}>
										<strong>{missingDocs.length}</strong>
										<span>Missing</span>
									</div>
								</div>
								{missingDocs.slice(0, 3).map((d) => (
									<div className={styles.docRow} key={d.key}>
										<span className={styles.docRowIcon} aria-hidden="true">
											<i className="bi bi-upload" />
										</span>
										<div className={styles.docRowBody}>
											<span className={styles.docRowLabel}>{d.label}</span>
											<div className={styles.docRowMeta}>
												<span>{d.hint}</span>
											</div>
										</div>
										<div className={styles.docRowActions}>
											<button
												type="button"
												className={cx(styles.btn, styles.btnPrimary)}
												onClick={() =>
													draft.bizType
														? openModal("uploadModal")
														: openModal("bizTypeModal")
												}
											>
												Upload
											</button>
										</div>
									</div>
								))}
								{missingDocs.length === 0 ? (
									<div className={cx(styles.hintBox, styles.successHint)}>
										<i className="bi bi-check-circle" aria-hidden="true" />
										<span>
											Every {type.name} document is submitted — verification is
											in progress.
										</span>
									</div>
								) : null}
							</div>

							<div className={styles.card}>
								<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
									<div>
										<span className={styles.kicker}>
											<i className="bi bi-robot" aria-hidden="true" /> AI
											recommendations
										</span>
										<h3
											style={{
												fontFamily: "'Sora', 'Inter', sans-serif",
												fontSize: "0.95rem",
												margin: 0,
											}}
										>
											What to get next
										</h3>
									</div>
									<button
										type="button"
										className={styles.textButton}
										onClick={() => openModal("aiModal")}
									>
										Full analysis{" "}
										<i className="bi bi-arrow-right" aria-hidden="true" />
									</button>
								</div>
								{RECOMMENDATIONS.slice(0, 4).map((rec) => {
									const priorityCls =
										rec.priority === "high"
											? styles.priorityHigh
											: rec.priority === "medium"
												? styles.priorityMedium
												: styles.priorityLow;
									return (
										<div className={styles.suggestionItem} key={rec.rank}>
											<span
												className={cx(styles.suggestionPriority, priorityCls)}
											>
												{rec.rank}
											</span>
											<div className={styles.suggestionContent}>
												<div className={styles.suggestionTitle}>
													{rec.title}
												</div>
												<div className={styles.suggestionMeta}>
													<span>
														<i
															className="bi bi-geo-alt me-1"
															aria-hidden="true"
														/>
														{rec.source}
													</span>
													<span>
														<i
															className="bi bi-cash-coin me-1"
															aria-hidden="true"
														/>
														{rec.cost}
													</span>
													<span>
														<i
															className="bi bi-clock me-1"
															aria-hidden="true"
														/>
														{rec.time}
													</span>
												</div>
											</div>
											<span className={styles.suggestionImpact}>
												{rec.impact}
											</span>
										</div>
									);
								})}
								<div className="d-flex gap-2 flex-wrap mt-3">
									<button
										type="button"
										className={cx(styles.btn, styles.btnPrimary)}
										onClick={() => openModal("aiModal")}
									>
										<i className="bi bi-stars" aria-hidden="true" /> AI guide
									</button>
									<button
										type="button"
										className={styles.btn}
										onClick={() => openModal("howToModal")}
									>
										<i className="bi bi-mortarboard" aria-hidden="true" /> Show
										me how
									</button>
									<button
										type="button"
										className={styles.btn}
										onClick={() =>
											toast(
												"We'll remind you later. Tip: the 30-day KYC check keeps your account active.",
											)
										}
									>
										<i className="bi bi-bell" aria-hidden="true" /> Remind me
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* ---------- 05 Assurance & recent activity ---------- */}
					<section
						className={styles.dashboardSection}
						aria-labelledby="assurance-heading"
					>
						<SectionHeading
							index="05"
							id="assurance-heading"
							title="Assurance & recent activity"
							description="How PayMo protects your profile, your funds and your verification journey."
						/>
						<div className={styles.controlGrid}>
							<article className={styles.controlCard}>
								<span className={cx(styles.controlIcon, styles.iconGreen)}>
									<i className="bi bi-shield-lock" aria-hidden="true" />
								</span>
								<div>
									<span className={styles.kicker}>KYC assurance</span>
									<h3>Bank-grade verification</h3>
									<p>
										IDs, PINs and settlement accounts are checked against KRA
										and bank records before limits are raised.
									</p>
								</div>
								<button
									type="button"
									className={styles.textButton}
									onClick={() => openModal("statusModal")}
								>
									Review verification status{" "}
									<i className="bi bi-arrow-right" aria-hidden="true" />
								</button>
							</article>
							<article className={styles.controlCard}>
								<span className={cx(styles.controlIcon, styles.iconBlue)}>
									<i className="bi bi-cloud-arrow-up" aria-hidden="true" />
								</span>
								<div>
									<span className={styles.kicker}>Document assurance</span>
									<h3>Submit progressively</h3>
									<p>
										Upload what you have now. Rejected or pending documents can
										be re-uploaded without restarting the profile.
									</p>
								</div>
								<button
									type="button"
									className={styles.textButton}
									onClick={() =>
										draft.bizType
											? openModal("uploadModal")
											: openModal("bizTypeModal")
									}
								>
									Upload documents{" "}
									<i className="bi bi-arrow-right" aria-hidden="true" />
								</button>
							</article>
							<article className={styles.controlCard}>
								<span className={cx(styles.controlIcon, styles.iconViolet)}>
									<i className="bi bi-moon-stars" aria-hidden="true" />
								</span>
								<div>
									<span className={styles.kicker}>Dormancy protection</span>
									<h3>Active accounts stay open</h3>
									<p>
										A light check-in after ~1 month confirms you still need the
										service; 90+ day inactive accounts are paused to protect
										you.
									</p>
								</div>
								<button
									type="button"
									className={styles.textButton}
									onClick={() => openModal("howToModal")}
								>
									Read the guide{" "}
									<i className="bi bi-arrow-right" aria-hidden="true" />
								</button>
							</article>
						</div>

						<div className={cx(styles.card, "mt-4")}>
							<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
								<div>
									<span className={styles.kicker}>Last 7 days</span>
									<h3
										style={{
											fontFamily: "'Sora', 'Inter', sans-serif",
											fontSize: "0.95rem",
											margin: 0,
										}}
									>
										Recent onboarding activity
									</h3>
								</div>
								<button
									type="button"
									className={styles.btn}
									onClick={() => openModal("activityModal")}
								>
									<i className="bi bi-list-ul" aria-hidden="true" /> Full log
								</button>
							</div>
							<ActivityTable compact rows={activity} />
						</div>
					</section>
				</div>

				{/* ---------- Persistent commands ---------- */}
				<nav className={styles.floatingBar} aria-label="Onboarding shortcuts">
					<button
						type="button"
						className={styles.floatingPrimary}
						onClick={() => openModal("startWizard")}
					>
						<i className="bi bi-rocket-takeoff" aria-hidden="true" />{" "}
						{draft.bizType ? "Continue" : "Start onboarding"}
					</button>
					<button
						type="button"
						onClick={() =>
							draft.bizType
								? openModal("uploadModal")
								: openModal("bizTypeModal")
						}
					>
						<i className="bi bi-cloud-arrow-up" aria-hidden="true" /> Upload
					</button>
					<button type="button" onClick={() => openModal("checklistModal")}>
						<i className="bi bi-clipboard-check" aria-hidden="true" /> Checklist
					</button>
					<button type="button" onClick={() => openModal("statusModal")}>
						<i className="bi bi-shield-check" aria-hidden="true" /> Status
					</button>
				</nav>

				<footer className={styles.pageFooter}>
					<span>
						<i className="bi bi-shield-check" aria-hidden="true" /> Protected by
						PayMo KYC, AML and dormancy controls
					</span>
					<nav aria-label="Footer links">
						<a href="/pm/app/support">Support</a>
						<Link to="/pm/app/settings">Preferences</Link>
						<span>v2.4.0</span>
					</nav>
				</footer>
			</main>

			<OnboardingModals
				modalState={modalState}
				openModal={openModal}
				closeModal={closeModal}
				draft={draft}
				setDraft={updateDraft}
				onToast={toast}
				activity={activity}
				onSubmitted={() =>
					toast(
						"Application submitted! We'll review your documents within 24-48 hours.",
					)
				}
			/>

			{/* ---------- Toasts ---------- */}
			{toasts.length > 0 && (
				<div className={styles.toastStack} aria-live="polite">
					{toasts.map((t) => (
						<output
							key={t.id}
							className={cx(styles.toast, t.danger && styles.toastDanger)}
						>
							<i
								className={cx(
									"bi",
									t.danger ? "bi-exclamation-triangle" : "bi-check-circle",
								)}
								aria-hidden="true"
							/>
							{t.msg}
						</output>
					))}
				</div>
			)}
		</div>
	);
}
