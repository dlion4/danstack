/* ============================================================================
 * TaskWizards.tsx — Paymo BAAS · six purpose-built verification wizards
 * ----------------------------------------------------------------------------
 * One wizard per restoration task on /auth/account-status. Each has its own
 * step map, its own inputs and its own validation — nothing is a re-skin:
 *
 *   Identity (KYC)        5 steps · document → capture → address → liveness → review
 *   Linked accounts       5 steps · accounts → method → confirm → wallet OTP → mandate
 *   Business (KYB)        6 steps · entity → documents → directors → ownership → ops → attest
 *   Flagged transactions  5 steps · queue → adjudicate → source of funds → evidence → declare
 *   Fraud flag appeal     6 steps · flag → grounds → explanation → evidence → contact → attest
 *   Customer dispute      6 steps · case → response → evidence → offer → message → review
 *
 * Every wizard reports a summary back to the page, which turns it into a
 * trackable application (see ApplicationTracker.tsx).
 * ========================================================================== */

import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import {
	Badge,
	Button,
	Check,
	cx,
	Field,
	Input,
	mmss,
	Notice,
	OptionCard,
	OtpInput,
	Progress,
	Select,
	s,
	Tile,
	toast,
	useCountdown,
} from "./AuthKit";
import type { WizardProps, WizStep } from "./WizardKit";
import {
	Choice,
	PickRow,
	SummaryRows,
	Upload,
	useWizard,
	WizardShell,
} from "./WizardKit";

const money = (n: number) => n.toLocaleString("en-NG");

function useSubmit(onSubmit: (rows: Array<[string, string]>) => void) {
	const [busy, setBusy] = useState(false);
	return {
		busy,
		fire: (rows: Array<[string, string]>) => {
			setBusy(true);
			window.setTimeout(() => {
				setBusy(false);
				onSubmit(rows);
			}, 900);
		},
	};
}

/* ==========================================================================
 * 1 · IDENTITY VERIFICATION (KYC) — 5 steps
 * ======================================================================== */
const ID_STEPS: WizStep[] = [
	{
		label: "Document",
		title: "Which ID are you using?",
		sub: "Pick a government-issued document that is currently valid.",
	},
	{
		label: "Capture",
		title: "Capture the document",
		sub: "Flat surface, no glare, all four corners visible.",
	},
	{
		label: "Address",
		title: "Prove your address",
		sub: "Issued in the last 90 days and showing your full name.",
	},
	{
		label: "Liveness",
		title: "Liveness check",
		sub: "A 3-second scan confirms you are physically present.",
	},
	{
		label: "Review",
		title: "Review and submit",
		sub: "Confirm everything matches your Paymo profile exactly.",
	},
];

const ID_TYPES: Array<{
	id: string;
	label: string;
	sub: string;
	both?: boolean;
}> = [
	{ id: "nin", label: "National ID (NIN)", sub: "Front and back", both: true },
	{ id: "passport", label: "International passport", sub: "Data page only" },
	{
		id: "licence",
		label: "Driver's licence",
		sub: "Front and back",
		both: true,
	},
	{ id: "voter", label: "Voter card", sub: "Front and back", both: true },
];

export function IdentityWizard({ open, onClose, onSubmit }: WizardProps) {
	const w = useWizard(ID_STEPS.length);
	const [docType, setDocType] = useState("");
	const [country, setCountry] = useState("KE");
	const [front, setFront] = useState(false);
	const [back, setBack] = useState(false);
	const [addrType, setAddrType] = useState("utility");
	const [addrDoc, setAddrDoc] = useState(false);
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [scan, setScan] = useState<"idle" | "run" | "done">("idle");
	const [consent, setConsent] = useState(false);
	const { busy, fire } = useSubmit(onSubmit);

	const doc = ID_TYPES.find((d) => d.id === docType);
	const needsBack = !!doc?.both;

	const canNext = [
		!!docType,
		front && (!needsBack || back),
		addrDoc && street.length > 3 && city.length > 1,
		scan === "done",
		consent,
	][w.step];

	const rows: Array<[string, string]> = [
		["Document", doc?.label ?? "—"],
		["Issuing country", country === "KE" ? "Kenya" : "Nigeria"],
		["Proof of address", addrType],
		["Residential address", `${street}, ${city}`],
		["Liveness", "Passed · 98% confidence"],
	];

	const runScan = () => {
		setScan("run");
		window.setTimeout(() => {
			setScan("done");
			toast.success("Liveness passed", "Face matched the document photo.");
		}, 2200);
	};

	return (
		<WizardShell
			open={open}
			onClose={onClose}
			title="Verify your identity"
			sub="KYC · reviewed within 24–48 hours"
			icon="bi-person-vcard"
			tone="green"
			steps={ID_STEPS}
			step={w.step}
			setStep={w.setStep}
			canNext={canNext}
			onBack={w.back}
			onNext={() => (w.isLast ? fire(rows) : w.next())}
			submitting={busy}
		>
			{w.step === 0 && (
				<div className={s.stack}>
					{ID_TYPES.map((d) => (
						<OptionCard
							key={d.id}
							icon="bi-card-heading"
							tone="green"
							title={d.label}
							sub={d.sub}
							selected={docType === d.id}
							onClick={() => setDocType(d.id)}
						/>
					))}
					<Field label="Issuing country">
						<Select
							value={country}
							onChange={(e) => setCountry(e.target.value)}
						>
							<option value="KE">Kenya</option>
							<option value="NG">Nigeria</option>
						</Select>
					</Field>
				</div>
			)}

			{w.step === 1 && (
				<div className={s.stack}>
					<Upload
						label={needsBack ? "Front of document" : "Passport data page"}
						hint="JPG or PNG · max 10 MB"
						done={front}
						onDone={() => setFront(true)}
					/>
					{needsBack && (
						<Upload
							label="Back of document"
							hint="Must show the machine-readable zone"
							done={back}
							onDone={() => setBack(true)}
						/>
					)}
					<Notice tone="amber" icon="bi-lightbulb">
						Blurry or cropped scans add 3–5 days to the review.
					</Notice>
				</div>
			)}

			{w.step === 2 && (
				<div className={s.stack}>
					<Field label="Document type">
						<Select
							value={addrType}
							onChange={(e) => setAddrType(e.target.value)}
						>
							<option value="utility">Utility bill</option>
							<option value="bank">Bank statement</option>
							<option value="tenancy">Tenancy agreement</option>
						</Select>
					</Field>
					<Upload
						label="Proof of address"
						hint="Dated within the last 90 days"
						done={addrDoc}
						onDone={() => setAddrDoc(true)}
					/>
					<div className={s.grid2}>
						<Field label="Street address">
							<Input
								value={street}
								placeholder="12 Riverside Drive"
								onChange={(e) => setStreet(e.target.value)}
							/>
						</Field>
						<Field label="City">
							<Input
								value={city}
								placeholder="Nairobi"
								onChange={(e) => setCity(e.target.value)}
							/>
						</Field>
					</div>
				</div>
			)}

			{w.step === 3 && (
				<div className={s.center}>
					<div
						className={cx(
							s.bio,
							scan === "run" && s.bioScan,
							scan === "done" && s.bioDone,
						)}
					>
						<i
							className={
								scan === "done" ? "bi bi-check-lg" : "bi bi-person-bounding-box"
							}
						/>
					</div>
					<div className={s.wizStepTitle}>
						{scan === "idle"
							? "Ready when you are"
							: scan === "run"
								? "Hold still…"
								: "Liveness confirmed"}
					</div>
					<p className={s.wizStepSub}>
						{scan === "done"
							? "Face matched your document photo with 98% confidence."
							: "Look straight at the camera in even lighting."}
					</p>
					{scan !== "done" && (
						<Button
							onClick={runScan}
							loading={scan === "run"}
							icon="bi-camera"
							style={{ marginTop: "0.9rem" }}
						>
							{scan === "run" ? "Scanning" : "Start liveness scan"}
						</Button>
					)}
				</div>
			)}

			{w.step === 4 && (
				<div className={s.stack}>
					<SummaryRows rows={rows} />
					<hr className={s.divider} />
					<Check checked={consent} onChange={setConsent}>
						I confirm these documents are genuine and belong to me. I consent to
						identity checks with the issuing authority.
					</Check>
				</div>
			)}
		</WizardShell>
	);
}

/* ==========================================================================
 * 2 · LINKED ACCOUNTS — 5 steps
 * ======================================================================== */
const BANK_STEPS: WizStep[] = [
	{
		label: "Accounts",
		title: "Which accounts should we verify?",
		sub: "Select every account you want restored to your profile.",
	},
	{
		label: "Method",
		title: "How do you want to prove ownership?",
		sub: "Instant login is fastest; micro-deposits take 1–2 business days.",
	},
	{
		label: "Confirm",
		title: "Confirm ownership",
		sub: "This is the only step a fraudster cannot fake.",
	},
	{
		label: "Wallet",
		title: "Verify your mobile wallet",
		sub: "We sent a 6-digit code to the wallet MSISDN.",
	},
	{
		label: "Mandate",
		title: "Authorise the debit mandate",
		sub: "Required before payouts and transfers can resume.",
	},
];

const ACCOUNTS = [
	{
		id: "gtb",
		icon: "bi-bank2",
		name: "GTBank · Current",
		mask: "•••• 4471",
		type: "bank",
	},
	{
		id: "access",
		icon: "bi-bank",
		name: "Access Bank · Business",
		mask: "•••• 8830",
		type: "bank",
	},
	{
		id: "mpesa",
		icon: "bi-phone",
		name: "M-Pesa wallet",
		mask: "+254 ••• 4321",
		type: "wallet",
	},
];

export function LinkedAccountsWizard({ open, onClose, onSubmit }: WizardProps) {
	const w = useWizard(BANK_STEPS.length);
	const [picked, setPicked] = useState<string[]>(["gtb", "access", "mpesa"]);
	const [method, setMethod] = useState("");
	const [a1, setA1] = useState("");
	const [a2, setA2] = useState("");
	const [linked, setLinked] = useState(false);
	const [stmt, setStmt] = useState(false);
	const [otp, setOtp] = useState("");
	const [left, setLeft] = useCountdown(90);
	const [mandate, setMandate] = useState(false);
	const [signature, setSignature] = useState("");
	const { busy, fire } = useSubmit(onSubmit);

	const toggle = (id: string) =>
		setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

	const walletPicked = picked.includes("mpesa");
	const confirmOk =
		method === "deposit"
			? Number(a1) > 0 && Number(a2) > 0
			: method === "instant"
				? linked
				: stmt;

	const canNext = [
		picked.length > 0,
		!!method,
		confirmOk,
		!walletPicked || otp.length === 6,
		mandate && signature.trim().length > 4,
	][w.step];

	const rows: Array<[string, string]> = [
		["Accounts", `${picked.length} selected`],
		[
			"Method",
			method === "deposit"
				? "Micro-deposit"
				: method === "instant"
					? "Instant bank login"
					: "Statement upload",
		],
		["Wallet OTP", walletPicked ? "Verified" : "Not applicable"],
		["Mandate", "Signed"],
	];

	return (
		<WizardShell
			open={open}
			onClose={onClose}
			title="Verify linked accounts"
			sub="Ownership checks · 2 banks, 1 wallet"
			icon="bi-bank"
			tone="blue"
			steps={BANK_STEPS}
			step={w.step}
			setStep={w.setStep}
			canNext={canNext}
			onBack={w.back}
			onNext={() => (w.isLast ? fire(rows) : w.next())}
			submitting={busy}
			submitLabel="Submit for confirmation"
		>
			{w.step === 0 && (
				<div className={s.stack}>
					{ACCOUNTS.map((a) => (
						<PickRow
							key={a.id}
							checked={picked.includes(a.id)}
							onToggle={() => toggle(a.id)}
							icon={a.icon}
							tone={a.type === "wallet" ? "violet" : "blue"}
							title={a.name}
							sub={a.mask}
							right={<Badge tone="amber">Pending</Badge>}
						/>
					))}
				</div>
			)}

			{w.step === 1 && (
				<div className={s.stack}>
					<OptionCard
						icon="bi-lightning-charge"
						tone="green"
						title="Instant bank login"
						sub="Read-only connection via our licensed aggregator."
						badge={<Badge tone="green">~2 minutes</Badge>}
						selected={method === "instant"}
						onClick={() => setMethod("instant")}
					/>
					<OptionCard
						icon="bi-cash-coin"
						tone="blue"
						title="Micro-deposit"
						sub="We send two small amounts you read back to us."
						badge={<Badge tone="blue">1–2 days</Badge>}
						selected={method === "deposit"}
						onClick={() => setMethod("deposit")}
					/>
					<OptionCard
						icon="bi-file-earmark-text"
						tone="slate"
						title="Upload a statement"
						sub="Last 3 months, stamped by the bank."
						badge={<Badge tone="slate">3–5 days</Badge>}
						selected={method === "statement"}
						onClick={() => setMethod("statement")}
					/>
				</div>
			)}

			{w.step === 2 && (
				<div className={s.stack}>
					{method === "deposit" && (
						<>
							<Notice tone="blue" icon="bi-info-circle">
								Two deposits under KES 10 were sent to GTBank •••• 4471. Enter
								both amounts.
							</Notice>
							<div className={s.grid2}>
								<Field label="First amount">
									<Input
										value={a1}
										inputMode="decimal"
										placeholder="0.42"
										onChange={(e) => setA1(e.target.value)}
									/>
								</Field>
								<Field label="Second amount">
									<Input
										value={a2}
										inputMode="decimal"
										placeholder="0.87"
										onChange={(e) => setA2(e.target.value)}
									/>
								</Field>
							</div>
							<Button
								variant="ghost"
								size="sm"
								icon="bi-arrow-repeat"
								onClick={() =>
									toast.info("Deposits resent", "Allow up to 24 hours.")
								}
							>
								Resend deposits
							</Button>
						</>
					)}

					{method === "instant" && (
						<>
							<Notice tone="green" icon="bi-shield-lock">
								Read-only access. Paymo never sees or stores your bank password.
							</Notice>
							{linked ? (
								<div className={s.listRow}>
									<Tile icon="bi-check-lg" tone="green" size="sm" />
									<span className={s.grow}>
										<span className={s.optionTitle}>2 accounts connected</span>
										<span className={s.optionSub} style={{ display: "block" }}>
											Names matched your Paymo profile.
										</span>
									</span>
									<Badge tone="green">Verified</Badge>
								</div>
							) : (
								<Button
									icon="bi-box-arrow-up-right"
									block
									onClick={() => {
										toast.info("Opening secure bank login…");
										window.setTimeout(() => {
											setLinked(true);
											toast.success(
												"Accounts connected",
												"Ownership confirmed instantly.",
											);
										}, 1200);
									}}
								>
									Connect with bank login
								</Button>
							)}
						</>
					)}

					{method === "statement" && (
						<Upload
							label="Bank statement · last 3 months"
							hint="PDF with the bank stamp or e-statement signature"
							done={stmt}
							onDone={() => setStmt(true)}
						/>
					)}
				</div>
			)}

			{w.step === 3 &&
				(walletPicked ? (
					<div className={s.stack}>
						<OtpInput value={otp} onChange={setOtp} />
						<div className={s.spread}>
							<span className={s.tiny}>Sent to +254 ••• 4321</span>
							{left > 0 ? (
								<span className={s.tiny}>Resend in {mmss(left)}</span>
							) : (
								<button
									type="button"
									className={s.link}
									onClick={() => {
										setLeft(90);
										toast.info("Code resent");
									}}
								>
									Resend code
								</button>
							)}
						</div>
					</div>
				) : (
					<Notice tone="slate" icon="bi-info-circle">
						No mobile wallet selected — skip ahead.
					</Notice>
				))}

			{w.step === 4 && (
				<div className={s.stack}>
					<Notice tone="slate" icon="bi-file-earmark-text">
						The mandate lets Paymo debit settlement fees and reverse failed
						payouts. You can revoke it at any time in the security centre.
					</Notice>
					<Check checked={mandate} onChange={setMandate}>
						I authorise Paymo to debit the accounts listed above under this
						mandate.
					</Check>
					<Field label="Type your full name to sign">
						<Input
							className={s.sig}
							value={signature}
							placeholder="Amara Okafor"
							onChange={(e) => setSignature(e.target.value)}
						/>
					</Field>
					<SummaryRows rows={rows} />
				</div>
			)}
		</WizardShell>
	);
}

/* ==========================================================================
 * 3 · BUSINESS VERIFICATION (KYB) — 6 steps
 * ======================================================================== */
const KYB_STEPS: WizStep[] = [
	{
		label: "Entity",
		title: "Tell us about the legal entity",
		sub: "Exactly as it appears on the certificate of incorporation.",
	},
	{
		label: "Documents",
		title: "Corporate documents",
		sub: "Three documents are mandatory for a limited company.",
	},
	{
		label: "Directors",
		title: "Directors and officers",
		sub: "Everyone with signing authority on the account.",
	},
	{
		label: "Ownership",
		title: "Beneficial ownership",
		sub: "Shareholding must add up to exactly 100%.",
	},
	{
		label: "Operations",
		title: "How the business operates",
		sub: "Used to set your limits and monitoring thresholds.",
	},
	{
		label: "Attest",
		title: "Director attestation",
		sub: "A director must sign this declaration.",
	},
];

interface Person {
	uid: string;
	name: string;
	role: string;
	share: string;
}

let personSeq = 0;
const newPerson = (): Person => ({
	uid: `p${++personSeq}`,
	name: "",
	role: "Director",
	share: "0",
});

export function KybWizard({ open, onClose, onSubmit }: WizardProps) {
	const w = useWizard(KYB_STEPS.length);
	const [legal, setLegal] = useState("TS Retail Limited");
	const [rc, setRc] = useState("");
	const [entity, setEntity] = useState("plc");
	const [incorp, setIncorp] = useState("");
	const [docs, setDocs] = useState<Record<string, boolean>>({});
	const [people, setPeople] = useState<Person[]>(() => [
		{ ...newPerson(), name: "Amara Okafor", share: "60" },
	]);
	const [volume, setVolume] = useState("");
	const [industry, setIndustry] = useState("");
	const [markets, setMarkets] = useState<string[]>(["KE"]);
	const [attest, setAttest] = useState(false);
	const [signature, setSignature] = useState("");
	const { busy, fire } = useSubmit(onSubmit);

	const docList = [
		{
			id: "cac",
			label: "Certificate of incorporation",
			hint: "CAC / registrar",
		},
		{ id: "memart", label: "Memorandum & articles", hint: "MEMART, all pages" },
		{
			id: "tin",
			label: "Tax identification (TIN)",
			hint: "Tax authority letter",
		},
		{
			id: "board",
			label: "Board resolution",
			hint: "Optional but speeds review",
		},
	];
	const docCount = docList.filter((d) => docs[d.id]).length;
	const totalShare = people.reduce((n, p) => n + (Number(p.share) || 0), 0);

	const setPerson = (i: number, patch: Partial<Person>) =>
		setPeople((prev) => prev.map((p, x) => (x === i ? { ...p, ...patch } : p)));

	const canNext = [
		legal.trim().length > 2 && rc.trim().length > 3 && !!incorp,
		docs.cac && docs.memart && docs.tin,
		people.length > 0 && people.every((p) => p.name.trim().length > 2),
		totalShare === 100,
		!!volume && !!industry && markets.length > 0,
		attest && signature.trim().length > 4,
	][w.step];

	const rows: Array<[string, string]> = [
		["Legal entity", legal],
		["Registration no.", rc],
		["Documents", `${docCount} attached`],
		["Directors / UBOs", String(people.length)],
		["Expected volume", volume || "—"],
		["Markets", markets.join(", ")],
	];

	return (
		<WizardShell
			open={open}
			onClose={onClose}
			title="Business verification (KYB)"
			sub="Unlocks higher limits and settlement in 4 currencies"
			icon="bi-building"
			tone="blue"
			steps={KYB_STEPS}
			step={w.step}
			setStep={w.setStep}
			canNext={canNext}
			onBack={w.back}
			onNext={() => (w.isLast ? fire(rows) : w.next())}
			submitting={busy}
			submitLabel="Submit KYB pack"
		>
			{w.step === 0 && (
				<div className={s.stack}>
					<Field label="Registered legal name">
						<Input value={legal} onChange={(e) => setLegal(e.target.value)} />
					</Field>
					<div className={s.grid2}>
						<Field label="Registration number">
							<Input
								value={rc}
								placeholder="RC 1284993"
								onChange={(e) => setRc(e.target.value)}
							/>
						</Field>
						<Field label="Date of incorporation">
							<Input
								type="date"
								value={incorp}
								onChange={(e) => setIncorp(e.target.value)}
							/>
						</Field>
					</div>
					<Field label="Entity type">
						<Select value={entity} onChange={(e) => setEntity(e.target.value)}>
							<option value="plc">Private limited company</option>
							<option value="llp">Limited liability partnership</option>
							<option value="sole">Sole proprietorship</option>
							<option value="ngo">NGO / non-profit</option>
						</Select>
					</Field>
				</div>
			)}

			{w.step === 1 && (
				<div className={s.stack}>
					{docList.map((d) => (
						<Upload
							key={d.id}
							label={d.label}
							hint={d.hint}
							done={!!docs[d.id]}
							onDone={() => setDocs((p) => ({ ...p, [d.id]: true }))}
						/>
					))}
					<span className={s.tiny}>{docCount} of 4 attached</span>
				</div>
			)}

			{w.step === 2 && (
				<div className={s.stack}>
					{people.map((p, i) => (
						<div key={p.uid} className={s.card} style={{ padding: "0.85rem" }}>
							<div className={s.grid2}>
								<Field label="Full name">
									<Input
										value={p.name}
										placeholder="Full legal name"
										onChange={(e) => setPerson(i, { name: e.target.value })}
									/>
								</Field>
								<Field label="Role">
									<Select
										value={p.role}
										onChange={(e) => setPerson(i, { role: e.target.value })}
									>
										<option>Director</option>
										<option>Company secretary</option>
										<option>CFO</option>
										<option>Authorised signatory</option>
									</Select>
								</Field>
							</div>
							{people.length > 1 && (
								<button
									type="button"
									className={s.link}
									onClick={() =>
										setPeople((prev) => prev.filter((_, x) => x !== i))
									}
								>
									Remove
								</button>
							)}
						</div>
					))}
					<Button
						variant="subtle"
						icon="bi-plus-lg"
						size="sm"
						onClick={() => setPeople((prev) => [...prev, newPerson()])}
					>
						Add another officer
					</Button>
				</div>
			)}

			{w.step === 3 && (
				<div className={s.stack}>
					{people.map((p, i) => (
						<div key={p.uid} className={s.listRow}>
							<Tile icon="bi-person" tone="blue" size="sm" />
							<span className={s.grow}>
								<span className={s.optionTitle}>{p.name || "Unnamed"}</span>
								<span className={s.optionSub} style={{ display: "block" }}>
									{p.role}
								</span>
							</span>
							<Input
								style={{ width: 92 }}
								inputMode="numeric"
								value={p.share}
								onChange={(e) => setPerson(i, { share: e.target.value })}
							/>
							<span className={s.tiny}>%</span>
						</div>
					))}
					<Progress value={Math.min(100, totalShare)} sm />
					<div className={s.spread}>
						<span className={s.tiny}>Allocated</span>
						<span className={s.strong}>{totalShare}% of 100%</span>
					</div>
					{totalShare !== 100 && (
						<Notice tone="amber" icon="bi-exclamation-triangle">
							Shareholding must total exactly 100% before you can continue.
						</Notice>
					)}
				</div>
			)}

			{w.step === 4 && (
				<div className={s.stack}>
					<Field label="Expected monthly volume">
						<Select value={volume} onChange={(e) => setVolume(e.target.value)}>
							<option value="">Select a range</option>
							<option>Under KES 5M</option>
							<option>KES 5M – 25M</option>
							<option>KES 25M – 100M</option>
							<option>Over KES 100M</option>
						</Select>
					</Field>
					<Field label="Primary industry">
						<Select
							value={industry}
							onChange={(e) => setIndustry(e.target.value)}
						>
							<option value="">Select an industry</option>
							<option>Retail & e-commerce</option>
							<option>Logistics</option>
							<option>Fintech & lending</option>
							<option>Travel & hospitality</option>
							<option>Professional services</option>
						</Select>
					</Field>
					<Field label="Markets you collect from" hint="Select all that apply">
						<div className={cx(s.row, s.rowTight)}>
							{["KE", "NG", "GH", "ZA", "UK", "US"].map((m) => (
								<button
									key={m}
									type="button"
									className={cx(s.miniBtn, markets.includes(m) && s.miniBtnOn)}
									onClick={() =>
										setMarkets((prev) =>
											prev.includes(m)
												? prev.filter((x) => x !== m)
												: [...prev, m],
										)
									}
								>
									{m}
								</button>
							))}
						</div>
					</Field>
				</div>
			)}

			{w.step === 5 && (
				<div className={s.stack}>
					<SummaryRows rows={rows} />
					<hr className={s.divider} />
					<Check checked={attest} onChange={setAttest}>
						I am a director of this entity and confirm the information and
						documents provided are true, complete and current.
					</Check>
					<Field label="Director signature">
						<Input
							className={s.sig}
							value={signature}
							placeholder="Amara Okafor"
							onChange={(e) => setSignature(e.target.value)}
						/>
					</Field>
				</div>
			)}
		</WizardShell>
	);
}

/* ==========================================================================
 * 4 · FLAGGED TRANSACTIONS — 5 steps
 * ======================================================================== */
const TXN_STEPS: WizStep[] = [
	{
		label: "Queue",
		title: "4 transactions need your confirmation",
		sub: "Flagged by velocity and counterparty-risk models.",
	},
	{
		label: "Adjudicate",
		title: "Do you recognise each transaction?",
		sub: "Anything you mark as unrecognised is reported to fraud ops.",
	},
	{
		label: "Source",
		title: "Where did the funds come from?",
		sub: "Required for the two transactions above KES 1M.",
	},
	{
		label: "Evidence",
		title: "Attach supporting evidence",
		sub: "Invoices or contracts covering the flagged amounts.",
	},
	{
		label: "Declare",
		title: "Declaration",
		sub: "Signed statements are admissible in a regulatory audit.",
	},
];

const FLAGGED = [
	{
		id: "t1",
		date: "12 Aug",
		party: "Kilimani Traders",
		amount: 1250000,
		flag: "Velocity spike",
	},
	{
		id: "t2",
		date: "13 Aug",
		party: "Unknown wallet ••2291",
		amount: 680000,
		flag: "New counterparty",
	},
	{
		id: "t3",
		date: "15 Aug",
		party: "Zamani Logistics",
		amount: 420000,
		flag: "Round-trip pattern",
	},
	{
		id: "t4",
		date: "17 Aug",
		party: "Payout · A. Okafor",
		amount: 100000,
		flag: "Off-hours payout",
	},
];

export function TransactionReviewWizard({
	open,
	onClose,
	onSubmit,
}: WizardProps) {
	const w = useWizard(TXN_STEPS.length);
	const [verdicts, setVerdicts] = useState<Record<string, "mine" | "not">>({});
	const [source, setSource] = useState("");
	const [note, setNote] = useState("");
	const [ev, setEv] = useState<Record<string, boolean>>({});
	const [declare, setDeclare] = useState(false);
	const [signature, setSignature] = useState("");
	const { busy, fire } = useSubmit(onSubmit);

	const answered = Object.keys(verdicts).length;
	const disputed = Object.values(verdicts).filter((v) => v === "not").length;
	const evCount = Object.values(ev).filter(Boolean).length;
	const total = FLAGGED.reduce((n, t) => n + t.amount, 0);

	const canNext = [
		true,
		answered === FLAGGED.length,
		!!source && note.trim().length >= 40,
		evCount >= 1,
		declare && signature.trim().length > 4,
	][w.step];

	const rows: Array<[string, string]> = [
		["Transactions reviewed", `${FLAGGED.length}`],
		["Recognised", `${answered - disputed}`],
		["Reported as fraud", `${disputed}`],
		["Source of funds", source || "—"],
		["Evidence files", String(evCount)],
	];

	return (
		<WizardShell
			open={open}
			onClose={onClose}
			title="Review flagged transactions"
			sub={`4 transactions · KES ${money(total)}`}
			icon="bi-arrow-left-right"
			tone="amber"
			steps={TXN_STEPS}
			step={w.step}
			setStep={w.setStep}
			canNext={canNext}
			onBack={w.back}
			onNext={() => (w.isLast ? fire(rows) : w.next())}
			submitting={busy}
			submitLabel="Submit review"
		>
			{w.step === 0 && (
				<div className={s.stack}>
					<div className={s.tableWrap}>
						<table className={s.table}>
							<thead>
								<tr>
									<th>Date</th>
									<th>Counterparty</th>
									<th>Amount</th>
									<th>Flag</th>
								</tr>
							</thead>
							<tbody>
								{FLAGGED.map((t) => (
									<tr key={t.id}>
										<td>{t.date}</td>
										<td>{t.party}</td>
										<td>KES {money(t.amount)}</td>
										<td>
											<Badge tone="amber">{t.flag}</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<Notice tone="blue" icon="bi-clock-history">
						Holds are released within 4 hours of a completed review.
					</Notice>
				</div>
			)}

			{w.step === 1 && (
				<div className={s.stack}>
					{FLAGGED.map((t) => (
						<div className={s.listRow} key={t.id}>
							<Tile
								icon="bi-receipt"
								tone={verdicts[t.id] === "not" ? "red" : "amber"}
								size="sm"
							/>
							<span className={s.grow}>
								<span className={s.optionTitle}>
									{t.party} · KES {money(t.amount)}
								</span>
								<span className={s.optionSub} style={{ display: "block" }}>
									{t.date} · {t.flag}
								</span>
							</span>
							<Choice<"mine" | "not">
								value={verdicts[t.id] ?? ""}
								options={[
									{ id: "mine", label: "I recognise" },
									{ id: "not", label: "Not mine" },
								]}
								onChange={(v) =>
									setVerdicts((prev) => ({ ...prev, [t.id]: v }))
								}
							/>
						</div>
					))}
					{disputed > 0 && (
						<Notice tone="red" icon="bi-shield-exclamation">
							{disputed} transaction(s) will be escalated to fraud operations
							and the receiving institution will be notified.
						</Notice>
					)}
				</div>
			)}

			{w.step === 2 && (
				<div className={s.stack}>
					<Field label="Primary source of funds">
						<Select value={source} onChange={(e) => setSource(e.target.value)}>
							<option value="">Select a source</option>
							<option>Business revenue</option>
							<option>Marketplace settlement</option>
							<option>Investor funding</option>
							<option>Loan disbursement</option>
							<option>Asset sale</option>
						</Select>
					</Field>
					<Field
						label="Explain the activity"
						hint={`${note.trim().length}/40 characters minimum`}
						tone={note.trim().length >= 40 ? "ok" : undefined}
					>
						<textarea
							className={s.textarea}
							rows={4}
							value={note}
							placeholder="August was our back-to-school campaign; volumes tripled across three retail outlets…"
							onChange={(e) => setNote(e.target.value)}
						/>
					</Field>
				</div>
			)}

			{w.step === 3 && (
				<div className={s.stack}>
					{[
						{
							id: "inv",
							label: "Invoices for the flagged period",
							hint: "PDF or CSV",
						},
						{ id: "con", label: "Customer contracts", hint: "Optional" },
						{
							id: "stm",
							label: "Counterparty bank statement",
							hint: "Optional",
						},
					].map((d) => (
						<Upload
							key={d.id}
							label={d.label}
							hint={d.hint}
							done={!!ev[d.id]}
							onDone={() => setEv((p) => ({ ...p, [d.id]: true }))}
						/>
					))}
				</div>
			)}

			{w.step === 4 && (
				<div className={s.stack}>
					<SummaryRows rows={rows} />
					<hr className={s.divider} />
					<Check checked={declare} onChange={setDeclare}>
						I declare the above is accurate and that the funds have no unlawful
						origin.
					</Check>
					<Field label="Signature">
						<Input
							className={s.sig}
							value={signature}
							placeholder="Amara Okafor"
							onChange={(e) => setSignature(e.target.value)}
						/>
					</Field>
				</div>
			)}
		</WizardShell>
	);
}

/* ==========================================================================
 * 5 · FRAUD FLAG APPEAL — 6 steps
 * ======================================================================== */
const APPEAL_STEPS: WizStep[] = [
	{
		label: "Flag",
		title: "What was flagged",
		sub: "Read the model's reasoning before you write your appeal.",
	},
	{
		label: "Grounds",
		title: "Grounds for appeal",
		sub: "Pick the reason that best explains the activity.",
	},
	{
		label: "Explain",
		title: "Explain what happened",
		sub: "Numbers persuade reviewers faster than adjectives.",
	},
	{
		label: "Evidence",
		title: "Evidence pack",
		sub: "At least two documents are required for an appeal.",
	},
	{
		label: "Contact",
		title: "Who should compliance call?",
		sub: "A reachable contact cuts the review time roughly in half.",
	},
	{
		label: "Attest",
		title: "Legal attestation",
		sub: "False statements void the appeal and are reported.",
	},
];

const GROUNDS = [
	{
		id: "growth",
		icon: "bi-graph-up-arrow",
		label: "Legitimate business growth",
		sub: "New customers or outlets drove the spike.",
	},
	{
		id: "campaign",
		icon: "bi-megaphone",
		label: "Seasonal campaign",
		sub: "A promotion concentrated volume in a short window.",
	},
	{
		id: "settlement",
		icon: "bi-diagram-3",
		label: "Marketplace settlement batch",
		sub: "One payout covered many underlying orders.",
	},
	{
		id: "identity",
		icon: "bi-person-x",
		label: "Mistaken identity",
		sub: "The flag matched a different entity or device.",
	},
];

export function FraudAppealWizard({ open, onClose, onSubmit }: WizardProps) {
	const w = useWizard(APPEAL_STEPS.length);
	const [ground, setGround] = useState("");
	const [before, setBefore] = useState("");
	const [after, setAfter] = useState("");
	const [customers, setCustomers] = useState("");
	const [story, setStory] = useState("");
	const [ev, setEv] = useState<Record<string, boolean>>({});
	const [contact, setContact] = useState("Amara Okafor");
	const [role, setRole] = useState("");
	const [phone, setPhone] = useState("");
	const [window_, setWindow] = useState("");
	const [truth, setTruth] = useState(false);
	const [liable, setLiable] = useState(false);
	const [signature, setSignature] = useState("");
	const { busy, fire } = useSubmit(onSubmit);

	const evList = [
		{
			id: "cac",
			label: "Certificate of incorporation",
			hint: "Proves the entity is real",
		},
		{
			id: "stmt",
			label: "Bank statement · 6 months",
			hint: "Shows the baseline trend",
		},
		{
			id: "inv",
			label: "Invoices or purchase orders",
			hint: "Ties volume to real orders",
		},
		{ id: "camp", label: "Campaign or marketing proof", hint: "Optional" },
	];
	const evCount = evList.filter((e) => ev[e.id]).length;
	const growth =
		Number(before) > 0 && Number(after) > 0
			? Math.round(((Number(after) - Number(before)) / Number(before)) * 100)
			: 0;

	const canNext = [
		true,
		!!ground,
		story.trim().length >= 80 && Number(before) > 0 && Number(after) > 0,
		evCount >= 2,
		contact.trim().length > 2 && phone.trim().length >= 9 && !!window_,
		truth && liable && signature.trim().length > 4,
	][w.step];

	const rows: Array<[string, string]> = [
		["Grounds", GROUNDS.find((g) => g.id === ground)?.label ?? "—"],
		["Volume change", growth ? `+${growth}%` : "—"],
		["Customers served", customers || "—"],
		["Evidence files", String(evCount)],
		["Contact", `${contact}${role ? ` · ${role}` : ""}`],
		["Callback window", window_ || "—"],
	];

	return (
		<WizardShell
			open={open}
			onClose={onClose}
			title="Fraud flag appeal"
			sub="High priority · compliance review"
			icon="bi-exclamation-circle"
			tone="red"
			steps={APPEAL_STEPS}
			step={w.step}
			setStep={w.setStep}
			canNext={canNext}
			onBack={w.back}
			onNext={() => (w.isLast ? fire(rows) : w.next())}
			submitting={busy}
			submitLabel="Submit appeal"
		>
			{w.step === 0 && (
				<div className={s.stack}>
					<SummaryRows
						rows={[
							["Flag", "Unusual volume spike"],
							["Detected", "17 Aug 2026 · 02:14 UTC"],
							["Model", "Velocity v4 · risk score 82/100"],
							["Restricted since", "17 Aug 2026"],
							["Appeal deadline", "16 Sep 2026"],
						]}
					/>
					<Notice tone="red" icon="bi-info-circle">
						Volume rose 11× against your 90-day baseline within 36 hours, with
						62% going to counterparties first seen this month.
					</Notice>
				</div>
			)}

			{w.step === 1 && (
				<div className={s.stack}>
					{GROUNDS.map((g) => (
						<OptionCard
							key={g.id}
							icon={g.icon}
							tone="red"
							title={g.label}
							sub={g.sub}
							selected={ground === g.id}
							onClick={() => setGround(g.id)}
						/>
					))}
				</div>
			)}

			{w.step === 2 && (
				<div className={s.stack}>
					<div className={s.grid2}>
						<Field label="Typical monthly volume (KES)">
							<Input
								inputMode="numeric"
								value={before}
								placeholder="2500000"
								onChange={(e) => setBefore(e.target.value)}
							/>
						</Field>
						<Field label="Volume in the flagged month (KES)">
							<Input
								inputMode="numeric"
								value={after}
								placeholder="27500000"
								onChange={(e) => setAfter(e.target.value)}
							/>
						</Field>
					</div>
					<Field label="Unique customers served that month">
						<Input
							inputMode="numeric"
							value={customers}
							placeholder="1,840"
							onChange={(e) => setCustomers(e.target.value)}
						/>
					</Field>
					{growth > 0 && (
						<Notice tone="blue" icon="bi-graph-up">
							You are reporting a <b>+{growth}%</b> change. Reviewers will
							compare this with your settlement data.
						</Notice>
					)}
					<Field
						label="What drove the change?"
						hint={`${story.trim().length}/80 characters minimum`}
						tone={story.trim().length >= 80 ? "ok" : undefined}
					>
						<textarea
							className={s.textarea}
							rows={5}
							value={story}
							placeholder="We onboarded two supermarket chains on 14 August and ran a national back-to-school promotion…"
							onChange={(e) => setStory(e.target.value)}
						/>
					</Field>
				</div>
			)}

			{w.step === 3 && (
				<div className={s.stack}>
					{evList.map((e) => (
						<Upload
							key={e.id}
							label={e.label}
							hint={e.hint}
							tone="red"
							done={!!ev[e.id]}
							onDone={() => setEv((p) => ({ ...p, [e.id]: true }))}
						/>
					))}
					<Progress value={Math.min(100, (evCount / 2) * 100)} sm />
					<span className={s.tiny}>
						{evCount}/2 required documents attached
					</span>
				</div>
			)}

			{w.step === 4 && (
				<div className={s.stack}>
					<div className={s.grid2}>
						<Field label="Contact name">
							<Input
								value={contact}
								onChange={(e) => setContact(e.target.value)}
							/>
						</Field>
						<Field label="Role">
							<Input
								value={role}
								placeholder="Finance lead"
								onChange={(e) => setRole(e.target.value)}
							/>
						</Field>
					</div>
					<Field label="Direct phone">
						<Input
							value={phone}
							inputMode="tel"
							placeholder="+254 712 000 000"
							onChange={(e) => setPhone(e.target.value)}
						/>
					</Field>
					<Field label="Preferred callback window (EAT)">
						<Select value={window_} onChange={(e) => setWindow(e.target.value)}>
							<option value="">Select a window</option>
							<option>08:00 – 11:00</option>
							<option>11:00 – 14:00</option>
							<option>14:00 – 17:00</option>
							<option>Any time</option>
						</Select>
					</Field>
				</div>
			)}

			{w.step === 5 && (
				<div className={s.stack}>
					<SummaryRows rows={rows} />
					<hr className={s.divider} />
					<Check checked={truth} onChange={setTruth}>
						Everything in this appeal is true to the best of my knowledge.
					</Check>
					<Check checked={liable} onChange={setLiable}>
						I understand a false appeal permanently closes the account and is
						reported to the financial intelligence unit.
					</Check>
					<Field label="Signature">
						<Input
							className={s.sig}
							value={signature}
							placeholder="Amara Okafor"
							onChange={(e) => setSignature(e.target.value)}
						/>
					</Field>
				</div>
			)}
		</WizardShell>
	);
}

/* ==========================================================================
 * 6 · CUSTOMER DISPUTE — 6 steps
 * ======================================================================== */
const DISPUTE_STEPS: WizStep[] = [
	{
		label: "Case",
		title: "Dispute #DSP-2024-8842",
		sub: "Filed by the cardholder's issuing bank.",
	},
	{
		label: "Response",
		title: "How do you want to respond?",
		sub: "Your choice determines what evidence is required.",
	},
	{
		label: "Evidence",
		title: "Build the evidence bundle",
		sub: "Two or more items materially improve the win rate.",
	},
	{
		label: "Offer",
		title: "Settlement position",
		sub: "What the customer receives if the issuer accepts.",
	},
	{
		label: "Message",
		title: "Message to the customer",
		sub: "Shared verbatim with the issuer.",
	},
	{
		label: "Review",
		title: "Review and file",
		sub: "You cannot edit a filed response.",
	},
];

const DISPUTE_AMOUNT = 150000;

export function DisputeWizard({ open, onClose, onSubmit }: WizardProps) {
	const w = useWizard(DISPUTE_STEPS.length);
	const [response, setResponse] = useState("");
	const [ev, setEv] = useState<Record<string, boolean>>({});
	const [pct, setPct] = useState(50);
	const [message, setMessage] = useState("");
	const [confirm, setConfirm] = useState(false);
	const { busy, fire } = useSubmit(onSubmit);

	const evList = [
		{
			id: "pod",
			label: "Proof of delivery",
			hint: "Courier receipt or signature",
		},
		{ id: "track", label: "Tracking history", hint: "Carrier export" },
		{
			id: "chat",
			label: "Customer communications",
			hint: "Full email or chat trail",
		},
		{ id: "terms", label: "Terms accepted at checkout", hint: "Timestamped" },
	];
	const evCount = evList.filter((e) => ev[e.id]).length;
	const refund =
		response === "accept"
			? DISPUTE_AMOUNT
			: response === "partial"
				? Math.round((DISPUTE_AMOUNT * pct) / 100)
				: 0;

	const canNext = [
		true,
		!!response,
		response === "accept" ? true : evCount >= 2,
		true,
		message.trim().length >= 30,
		confirm,
	][w.step];

	const rows: Array<[string, string]> = [
		[
			"Response",
			response === "challenge"
				? "Challenge with evidence"
				: response === "accept"
					? "Accept and refund"
					: "Partial refund",
		],
		["Evidence items", String(evCount)],
		["Refund offered", refund ? `KES ${money(refund)}` : "None"],
		["Message length", `${message.trim().length} characters`],
	];

	const template = (tone: "formal" | "warm") =>
		setMessage(
			tone === "formal"
				? "Thank you for raising this dispute. Our records show the order was delivered on 11 August and signed for at the address on file. We have attached the courier receipt and tracking history for the issuer's review."
				: "Hi — sorry this order caused trouble. We've checked our records and the parcel was signed for on 11 August, and we've attached the proof. If it never reached you, reply here and we'll make it right straight away.",
		);

	return (
		<WizardShell
			open={open}
			onClose={onClose}
			title="Resolve customer dispute"
			sub={`#DSP-2024-8842 · KES ${money(DISPUTE_AMOUNT)} · 48h to respond`}
			icon="bi-people"
			tone="violet"
			steps={DISPUTE_STEPS}
			step={w.step}
			setStep={w.setStep}
			canNext={canNext}
			onBack={w.back}
			onNext={() => (w.isLast ? fire(rows) : w.next())}
			submitting={busy}
			submitLabel="File response"
		>
			{w.step === 0 && (
				<div className={s.stack}>
					<SummaryRows
						rows={[
							["Reason code", "13.1 · Merchandise not received"],
							["Amount", `KES ${money(DISPUTE_AMOUNT)}`],
							["Order", "#TSR-99412 · 8 Aug 2026"],
							["Customer", "J. Mwangi · card ••4417"],
							["Respond by", "23 Aug 2026, 17:00 EAT"],
						]}
					/>
					<Notice tone="violet" icon="bi-clock">
						No response within 48 hours means an automatic loss plus a KES 3,500
						dispute fee.
					</Notice>
				</div>
			)}

			{w.step === 1 && (
				<div className={s.stack}>
					<OptionCard
						icon="bi-shield-check"
						tone="violet"
						title="Challenge with evidence"
						sub="You believe the charge is valid and delivery is provable."
						badge={<Badge tone="green">Win rate 71%</Badge>}
						selected={response === "challenge"}
						onClick={() => setResponse("challenge")}
					/>
					<OptionCard
						icon="bi-arrow-counterclockwise"
						tone="blue"
						title="Accept and refund in full"
						sub="Closes the case immediately, no dispute fee."
						badge={<Badge tone="blue">Fastest</Badge>}
						selected={response === "accept"}
						onClick={() => setResponse("accept")}
					/>
					<OptionCard
						icon="bi-pie-chart"
						tone="amber"
						title="Offer a partial refund"
						sub="Split the difference and settle out of the scheme."
						selected={response === "partial"}
						onClick={() => setResponse("partial")}
					/>
				</div>
			)}

			{w.step === 2 &&
				(response === "accept" ? (
					<Notice tone="green" icon="bi-check-circle">
						No evidence needed — you are refunding in full. Continue to confirm
						the amount.
					</Notice>
				) : (
					<div className={s.stack}>
						{evList.map((e) => (
							<Upload
								key={e.id}
								label={e.label}
								hint={e.hint}
								tone="violet"
								done={!!ev[e.id]}
								onDone={() => setEv((p) => ({ ...p, [e.id]: true }))}
							/>
						))}
						<span className={s.tiny}>{evCount}/2 minimum attached</span>
					</div>
				))}

			{w.step === 3 && (
				<div className={s.stack}>
					{response === "partial" ? (
						<>
							<Field label="Refund percentage">
								<div className={cx(s.row, s.rowTight)}>
									{[25, 50, 75].map((p) => (
										<button
											key={p}
											type="button"
											className={cx(s.miniBtn, pct === p && s.miniBtnOn)}
											onClick={() => setPct(p)}
										>
											{p}%
										</button>
									))}
								</div>
							</Field>
							<div className={s.refBox}>
								<span className={s.tiny}>Customer receives</span>
								<span className={s.strong}>KES {money(refund)}</span>
							</div>
							<Progress value={pct} sm />
						</>
					) : response === "accept" ? (
						<div className={s.refBox}>
							<span className={s.tiny}>Full refund issued today</span>
							<span className={s.strong}>KES {money(DISPUTE_AMOUNT)}</span>
						</div>
					) : (
						<Notice tone="slate" icon="bi-hammer">
							No refund offered. The issuer decides within 30–45 days; funds
							stay on hold until then.
						</Notice>
					)}
				</div>
			)}

			{w.step === 4 && (
				<div className={s.stack}>
					<div className={cx(s.row, s.rowTight)}>
						<span className={s.tiny}>Start from a template:</span>
						<button
							type="button"
							className={s.miniBtn}
							onClick={() => template("formal")}
						>
							Formal
						</button>
						<button
							type="button"
							className={s.miniBtn}
							onClick={() => template("warm")}
						>
							Friendly
						</button>
					</div>
					<Field
						label="Your response"
						hint={`${message.trim().length}/30 characters minimum`}
						tone={message.trim().length >= 30 ? "ok" : undefined}
					>
						<textarea
							className={s.textarea}
							rows={5}
							value={message}
							placeholder="Explain what happened, in plain language…"
							onChange={(e) => setMessage(e.target.value)}
						/>
					</Field>
				</div>
			)}

			{w.step === 5 && (
				<div className={s.stack}>
					<SummaryRows rows={rows} />
					<hr className={s.divider} />
					<Check checked={confirm} onChange={setConfirm}>
						I confirm this response and its evidence are accurate and may be
						shared with the issuing bank and card scheme.
					</Check>
				</div>
			)}
		</WizardShell>
	);
}

/* ==========================================================================
 * DISPATCHER
 * ======================================================================== */
export const WIZARDS: Record<string, ComponentType<WizardProps>> = {
	"identity-verification": IdentityWizard,
	"bank-verification": LinkedAccountsWizard,
	"business-verification": KybWizard,
	"transaction-review": TransactionReviewWizard,
	"fraud-appeal": FraudAppealWizard,
	"dispute-resolution": DisputeWizard,
};

export function TaskWizard({
	taskId,
	open,
	onClose,
	onSubmit,
}: {
	taskId: string | null;
} & WizardProps) {
	const Wizard = useMemo(() => (taskId ? WIZARDS[taskId] : null), [taskId]);
	if (!Wizard || !taskId) return null;
	return (
		<Wizard key={taskId} open={open} onClose={onClose} onSubmit={onSubmit} />
	);
}
