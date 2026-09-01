/* ============================================================================
 * wallet-activation/modals/WalletActivationModals.tsx
 * ----------------------------------------------------------------------------
 * All 17 wallet-activation dialogs. Every control is stateful; every CTA
 * closes, opens another modal, copies, toasts, or navigates. No dead ends.
 * ========================================================================== */
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useId, useState } from "react";
import { go, toast } from "@/features/authentication/components/AuthKit";
import {
	FlowModal,
	InfoBox,
	ModalShell,
	ReviewRow,
	SimpleModal,
	TabbedModal,
	Toggle,
} from "../../transaction-dashboard/shared/components/modals";
import shared from "../../transaction-dashboard/shared/styles/appPage.module.css";

const s = shared as Record<string, string>;

export interface WalletActivationModalsProps {
	modalState: Record<string, boolean>;
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Shared atoms                                                       */
/* ------------------------------------------------------------------ */

const fieldGrid: CSSProperties = {
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	gap: 16,
};

function cx(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(" ");
}

function Btn({
	children,
	onClick,
	primary,
	danger,
	sm,
	disabled,
	icon,
	type = "button",
}: {
	children: ReactNode;
	onClick?: () => void;
	primary?: boolean;
	danger?: boolean;
	sm?: boolean;
	disabled?: boolean;
	icon?: string;
	type?: "button" | "submit";
}) {
	return (
		<button
			type={type}
			disabled={disabled}
			onClick={onClick}
			className={cx(
				s.btn,
				primary && s.btnPrimary,
				danger && s.btnDanger,
				!primary && !danger && s.btnSecondary,
				sm && s.btnSm,
			)}
		>
			{icon ? <i className={`bi ${icon}`} aria-hidden="true" /> : null}
			{children}
		</button>
	);
}

function Choice({
	selected,
	onSelect,
	title,
	desc,
	icon,
	letter,
	grad,
	right,
}: {
	selected: boolean;
	onSelect: () => void;
	title: string;
	desc: string;
	icon?: string;
	letter?: string;
	grad?: string;
	right?: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: "12px 14px",
				borderRadius: 12,
				border: selected ? "2px solid var(--pri)" : "1px solid var(--border)",
				background: selected ? "var(--success-bg)" : "var(--surface-2)",
				cursor: "pointer",
				marginBottom: 8,
				width: "100%",
				textAlign: "left",
				fontFamily: "inherit",
			}}
		>
			{letter ? (
				<span
					style={{
						width: 38,
						height: 38,
						borderRadius: 11,
						background: grad ?? "var(--pri)",
						color: "#fff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: 700,
						flexShrink: 0,
					}}
				>
					{letter}
				</span>
			) : icon ? (
				<i
					className={`bi ${icon}`}
					style={{
						color: selected ? "var(--pri)" : "var(--ink-400)",
						fontSize: 18,
						width: 24,
					}}
				/>
			) : null}
			<span style={{ flex: 1, minWidth: 0 }}>
				<span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>
					{title}
				</span>
				<span style={{ display: "block", fontSize: 11, color: "var(--ink-500)" }}>
					{desc}
				</span>
			</span>
			{right}
			<i
				className={`bi ${selected ? "bi-check-circle-fill" : "bi-circle"}`}
				style={{
					color: selected ? "var(--pri)" : "var(--ink-300)",
					fontSize: 17,
					flexShrink: 0,
				}}
			/>
		</button>
	);
}

function Label({
	htmlFor,
	children,
}: {
	htmlFor?: string;
	children: ReactNode;
}) {
	return (
		<label className={s.formLabel} htmlFor={htmlFor}>
			{children}
		</label>
	);
}

function Field({
	id,
	label,
	type = "text",
	value,
	onChange,
	min,
}: {
	id: string;
	label: string;
	type?: string;
	value: string;
	onChange: (v: string) => void;
	min?: string;
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<input
				id={id}
				type={type}
				className={s.formControl}
				value={value}
				min={min}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}

function Select({
	id,
	label,
	value,
	onChange,
	options,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (v: string) => void;
	options: string[];
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<select
				id={id}
				className={cx(s.formControl, s.select)}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				{options.map((opt) => (
					<option key={opt} value={opt}>
						{opt}
					</option>
				))}
			</select>
		</div>
	);
}

function PinGate({
	length = 4,
	value,
	onChange,
	label = "Security PIN",
}: {
	length?: number;
	value: string;
	onChange: (v: string) => void;
	label?: string;
}) {
	const id = useId();
	const digits = value.padEnd(length, " ").slice(0, length);
	return (
		<fieldset className={s.pinFieldset}>
			<legend className={s.pinLegend}>{label}</legend>
			<div className={s.pinRow}>
				{Array.from({ length }, (_, i) => (
					<input
						key={`${id}-${i}`}
						className={s.pinInput}
						maxLength={1}
						inputMode="numeric"
						autoComplete="one-time-code"
						aria-label={`${label} digit ${i + 1}`}
						value={digits[i] === " " ? "" : digits[i]}
						onChange={(e) => {
							const char = e.target.value.replace(/\D/g, "").slice(-1);
							const next = (value.slice(0, i) + char + value.slice(i + 1)).slice(
								0,
								length,
							);
							onChange(next.replace(/\D/g, ""));
							if (char) {
								const boxes = e.currentTarget.parentElement?.querySelectorAll(
									"input",
								);
								(boxes?.[i + 1] as HTMLInputElement | undefined)?.focus();
							}
						}}
						onKeyDown={(e) => {
							if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) {
								const boxes = e.currentTarget.parentElement?.querySelectorAll(
									"input",
								);
								(boxes?.[i - 1] as HTMLInputElement | undefined)?.focus();
							}
						}}
					/>
				))}
			</div>
			<p
				style={{
					fontSize: 11,
					color: value.length === length ? "var(--success)" : "var(--ink-500)",
					textAlign: "center",
					margin: "8px 0 0",
				}}
			>
				{value.length === length
					? "PIN captured — continue when ready."
					: `${value.length}/${length} digits · demo PIN 1 2 3 4`}
			</p>
		</fieldset>
	);
}

function copyText(value: string, label: string) {
	void navigator.clipboard?.writeText(value).catch(() => undefined);
	toast.success("Copied", `${label}: ${value}`);
}

function kes(n: number) {
	return `KES ${n.toLocaleString("en-KE")}`;
}

/* ------------------------------------------------------------------ */
/*  Catalogs                                                           */
/* ------------------------------------------------------------------ */

const CONSENT = [
	{
		name: "Terms of Service",
		desc: "General terms governing use of this PayMo dashboard.",
		optional: false,
		summary:
			"You keep credentials confidential, transact with legitimate funds, and report suspicious activity within 24 hours. Consent is timestamped with IP for the audit trail.",
	},
	{
		name: "Acceptable Use Policy",
		desc: "What you can and cannot do with dashboard features.",
		optional: false,
		summary:
			"No mule accounts, no layering, no sharing of API keys. Automated scraping of other customers’ data is prohibited.",
	},
	{
		name: "AML Compliance Declaration",
		desc: "You confirm funds are from legitimate sources.",
		optional: false,
		summary:
			"You attest that balances originate from lawful activity and that you will cooperate with CBK / FIU requests.",
	},
	{
		name: "CTF Acknowledgment",
		desc: "You agree to flag suspicious transactions.",
		optional: false,
		summary:
			"You will freeze and report any transaction you reasonably believe is linked to terrorism financing.",
	},
	{
		name: "Data Sharing Consent",
		desc: "Allows cross-dashboard balance visiblity for linked accounts.",
		optional: false,
		summary:
			"Linked surfaces may read balances and last-hop metadata. Raw statements stay in the originating dashboard unless Statement Access is on.",
	},
	{
		name: "Cross-Dashboard Transaction Authorization",
		desc: "Permits transfers between your linked dashboards.",
		optional: false,
		summary:
			"Internal ledger hops between linked accounts are authorised subject to the limits you set in Flow Control.",
	},
	{
		name: "Regulatory Compliance Attestation",
		desc: "CBK / KRA / sector-specific confirmation.",
		optional: false,
		summary:
			"You confirm tax residency in Kenya unless updated in profile, and that you will keep KYC documents current.",
	},
	{
		name: "Fee Schedule & Pricing Acknowledgment",
		desc: "You accept the published fees for this dashboard.",
		optional: false,
		summary:
			"Internal hops are waived. External rails (M-Pesa, PesaLink, RTGS) carry the published network fee at execution time.",
	},
	{
		name: "Privacy Policy Addendum",
		desc: "Dashboard-specific data processing addendum.",
		optional: true,
		summary:
			"Optional product-analytics processing. You can revoke this later from Privacy without disabling the dashboard.",
	},
];

const TOUR = [
	{
		icon: "bi-grid-1x2",
		title: "Dashboard overview",
		desc: "Balances, live links, recent hops and the four primary actions sit on Overview.",
	},
	{
		icon: "bi-wallet2",
		title: "Linked accounts",
		desc: "Every satellite on the orbit mesh is a linked dashboard with its own permission and last hop.",
	},
	{
		icon: "bi-arrow-left-right",
		title: "Transfers",
		desc: "Move money between the hub and any live lane. Relocate funds when unlinking so nothing is stranded.",
	},
	{
		icon: "bi-sliders",
		title: "Permissions",
		desc: "Presets (full, in, out, view) plus granular toggles for history, sweep and statements.",
	},
	{
		icon: "bi-bell",
		title: "Notifications",
		desc: "Route inbound, drop, fail and link-change alerts to Push, SMS, Email or WhatsApp.",
	},
	{
		icon: "bi-shield-check",
		title: "Security",
		desc: "PIN, biometric and the panic revoke live under Manage. Dual confirmation is required.",
	},
	{
		icon: "bi-clock-history",
		title: "Activity & logs",
		desc: "Expand any ledger row on the mesh table to see hops, rails and copyable references.",
	},
	{
		icon: "bi-gear-wide-connected",
		title: "Settings",
		desc: "Default landing dashboard, PIN length, tour hotspots and consent reminders.",
	},
];

const SOURCE = [
	{
		name: "PayMo KES Wallet",
		origin: "Transaction Hub",
		number: "•••• 5530",
		balance: "KES 1,284,300",
		grad: "linear-gradient(135deg,#0b8f52,#12b76a)",
		letter: "P",
	},
	{
		name: "Business Float",
		origin: "Business Portal",
		number: "•••• 2207",
		balance: "KES 6,150,000",
		grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
		letter: "B",
	},
	{
		name: "Savings Jar",
		origin: "Savings & Investments",
		number: "•••• 7793",
		balance: "KES 480,000",
		grad: "linear-gradient(135deg,#b45309,#f59e0b)",
		letter: "S",
	},
];

const DEST = [
	{
		name: "Loan Disbursement",
		origin: "Loans & Credit",
		number: "•••• 8910",
		balance: "KES 0",
		grad: "linear-gradient(135deg,#3b82f6,#2563eb)",
		letter: "L",
	},
	{
		name: "Fiat On-ramp",
		origin: "Crypto Center",
		number: "•••• 0042",
		balance: "USD 2,410",
		grad: "linear-gradient(135deg,#ef4444,#dc2626)",
		letter: "C",
	},
	{
		name: "Developer Portal",
		origin: "Developer Portal",
		number: "•••• 9091",
		balance: "KES 2,100,000",
		grad: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
		letter: "D",
	},
];

const LINKS = [
	{
		name: "PayMo KES Wallet",
		origin: "Transaction Hub",
		number: "•••• 5530",
		linked: "12 Jan 2023",
		balance: "KES 1,284,300",
		permission: "Full Control",
		status: "Active",
		grad: "linear-gradient(135deg,#0b8f52,#12b76a)",
		letter: "P",
	},
	{
		name: "Business Float",
		origin: "Business Portal",
		number: "•••• 2207",
		linked: "03 Feb 2024",
		balance: "KES 6,150,000",
		permission: "Full Control",
		status: "Active",
		grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
		letter: "B",
	},
	{
		name: "Savings Jar",
		origin: "Savings & Investments",
		number: "•••• 7793",
		linked: "15 Mar 2024",
		balance: "KES 480,000",
		permission: "View + Transfer In",
		status: "Active",
		grad: "linear-gradient(135deg,#b45309,#f59e0b)",
		letter: "S",
	},
	{
		name: "Loan Disbursement",
		origin: "Loans & Credit",
		number: "•••• 8910",
		linked: "02 Apr 2025",
		balance: "KES 0",
		permission: "View Only",
		status: "Paused",
		grad: "linear-gradient(135deg,#3b82f6,#2563eb)",
		letter: "L",
	},
	{
		name: "Fiat On-ramp",
		origin: "Crypto Center",
		number: "•••• 0042",
		linked: "12 Jun 2025",
		balance: "USD 2,410",
		permission: "View + Transfer In",
		status: "Active",
		grad: "linear-gradient(135deg,#ef4444,#dc2626)",
		letter: "C",
	},
];

const RELINK = [
	{
		name: "Business Float",
		detail: "Unlinked 20 Jun 2025 · had Full Control",
		grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
		letter: "B",
	},
	{
		name: "Old Collection Float",
		detail: "Unlinked 12 May 2025 · had View Only",
		grad: "linear-gradient(135deg,#3b82f6,#2563eb)",
		letter: "C",
	},
	{
		name: "Crypto Settlement",
		detail: "Unlinked 03 Apr 2025 · had One-Way Out",
		grad: "linear-gradient(135deg,#ef4444,#dc2626)",
		letter: "X",
	},
];

const PRESETS = [
	{
		name: "Full Control",
		desc: "Bidirectional flow + history, limits and auto-rules",
		flags: {
			visibility: true,
			inbound: true,
			outbound: true,
			sweep: true,
			topup: true,
			alerts: true,
			statements: true,
			history: true,
		},
	},
	{
		name: "View + Transfer In/Out",
		desc: "Balance visible with bidirectional transfers",
		flags: {
			visibility: true,
			inbound: true,
			outbound: true,
			sweep: false,
			topup: false,
			alerts: true,
			statements: true,
			history: true,
		},
	},
	{
		name: "View + Transfer In",
		desc: "Receive into destination only",
		flags: {
			visibility: true,
			inbound: true,
			outbound: false,
			sweep: false,
			topup: false,
			alerts: true,
			statements: false,
			history: true,
		},
	},
	{
		name: "View Only",
		desc: "Balance visible, no transfers",
		flags: {
			visibility: true,
			inbound: false,
			outbound: false,
			sweep: false,
			topup: false,
			alerts: false,
			statements: false,
			history: false,
		},
	},
	{
		name: "Custom",
		desc: "Mix any combination on the Granular tab",
		flags: {
			visibility: true,
			inbound: true,
			outbound: false,
			sweep: false,
			topup: false,
			alerts: true,
			statements: true,
			history: true,
		},
	},
];

const DESTINATIONS = [
	"Transfer to Primary PayMo Wallet",
	"Transfer to another linked dashboard account",
	"Transfer to external M-Pesa number",
	"Transfer to linked bank account (PesaLink/EFT/RTGS)",
	"Withdraw to mobile money (Airtel Money, T-Kash)",
	"Send to saved beneficiary",
	"Hold in escrow for 30 days",
	"Donate to charity (pre-verified NGO list)",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GUIDES = [
	{
		icon: "bi-link-45deg",
		title: "Understanding dashboard linking",
		desc: "How links and permissions work",
		body: "A link is a signed money path between the primary hub and another dashboard. Permission decides whether funds can move both ways, inbound only, outbound only, or stay view-only. Unlinking never deletes the destination account — it only breaks the path after any remaining balance is relocated.",
	},
	{
		icon: "bi-arrow-left-right",
		title: "How inter-dashboard transfers work",
		desc: "Move money between dashboards",
		body: "Internal hops settle on the PayMo ledger in under 4 seconds with a relocation waiver. External rails (M-Pesa, PesaLink, RTGS) add the published network fee. Velocity and daily caps from Limits apply before the hop is queued.",
	},
	{
		icon: "bi-shield-exclamation",
		title: "What happens when I revoke access?",
		desc: "The revocation flow explained",
		body: "Revoke All is the panic button. Every cross-dashboard hop is suspended immediately after PIN + SMS OTP. A 72-hour cooldown applies before you can reactivate. Individual unlinks keep a 24-hour grace and a 30-day instant-relink window.",
	},
	{
		icon: "bi-play-btn",
		title: "Money Relocation Wizard",
		desc: "8-step fund safety protocol",
		body: "Intent → destination → allocation → review → PIN → name match → execute → receipt. Reserved holds are excluded from allocatable balance. Type-to-confirm is required above KES 1,000,000.",
	},
];

const FAQ = [
	{
		q: "How do I link an account from another dashboard?",
		a: "Open Link Account, pick a source wallet, pick a destination, review the flow preview, choose a permission preset, then confirm with your PIN. The orbit mesh draws a new live lane immediately.",
	},
	{
		q: "What does a linked account actually let me do?",
		a: "Once linked, hub funds can be used inside that dashboard — pay bills, fund Business Float, or top up Savings — according to the permission you set.",
	},
	{
		q: "What happens when I unlink or revoke?",
		a: "The money path breaks. If a balance remains, the Relocation Wizard runs first so nothing is stranded. You can relink within 30 days without re-consent.",
	},
	{
		q: "Can I get notifications for linked accounts?",
		a: "Yes. Alert Routing lets you toggle inbound, drop, fail and link-change alerts, pick a channel, and set quiet hours.",
	},
	{
		q: "Is every dashboard activated the same way?",
		a: "Each surface requires its consent suite (8 mandatory + 1 optional) and a PIN. After activation you can tour, link accounts, or jump straight to the dashboard.",
	},
];

type FeatureFlags = (typeof PRESETS)[number]["flags"];

const DEFAULT_FLAGS: FeatureFlags = PRESETS[0].flags;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WalletActivationModals({
	modalState,
	openModal,
	closeModal,
}: WalletActivationModalsProps) {
	const isOpen = (id: string) => !!modalState[id];
	const close = (id: string) => closeModal(id);
	const jump = (from: string, to: string) => {
		close(from);
		openModal(to);
	};

	const [tourStep, setTourStep] = useState(0);
	const [supportFaq, setSupportFaq] = useState<number | null>(0);
	const [supportView, setSupportView] = useState<
		"home" | "guide" | "chat" | "report" | "email"
	>("home");
	const [guide, setGuide] = useState(0);
	const [chatDraft, setChatDraft] = useState("");
	const [chat, setChat] = useState<Array<{ from: "you" | "agent"; text: string }>>(
		[
			{
				from: "agent",
				text: "Hi Oscar — I’m Nia on the cross-dashboard desk. How can I help with linking or relocation?",
			},
		],
	);
	const [reportReason, setReportReason] = useState("Suspicious inbound hop");
	const [reportDetail, setReportDetail] = useState("");
	const [emailSubject, setEmailSubject] = useState("Wallet activation help");
	const [emailBody, setEmailBody] = useState("");

	const [relocationDestination, setRelocationDestination] = useState(
		DESTINATIONS[0],
	);
	const [relocatePct, setRelocatePct] = useState("100");
	const available = 6_150_000;
	const relocateAmount = Math.round((available * Number(relocatePct)) / 100);
	const [confirmPhrase, setConfirmPhrase] = useState("");
	const [saveDest, setSaveDest] = useState(true);

	const [selectedLinkAccount, setSelectedLinkAccount] = useState("Business Float");
	const [linkSourceWallet, setLinkSourceWallet] = useState(SOURCE[0].name);
	const [linkDestinationWallet, setLinkDestinationWallet] = useState(DEST[0].name);
	const [linkPreset, setLinkPreset] = useState("Full Control");
	const [linkFlags, setLinkFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

	const [permPreset, setPermPreset] = useState("Full Control");
	const [permFlags, setPermFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

	const [flowDir, setFlowDir] = useState("Bidirectional");
	const [dailyLimit, setDailyLimit] = useState("1000000");
	const [perTxLimit, setPerTxLimit] = useState("500000");
	const [monthlyLimit, setMonthlyLimit] = useState("10000000");
	const [minTx, setMinTx] = useState("100");
	const [enforceLimits, setEnforceLimits] = useState(true);
	const [pinOverride, setPinOverride] = useState(false);
	const [timeRestrict, setTimeRestrict] = useState(false);
	const [allowedFrom, setAllowedFrom] = useState("06:00");
	const [allowedUntil, setAllowedUntil] = useState("22:00");
	const [blockedDays, setBlockedDays] = useState<string[]>(["Sun"]);

	const [consentChecks, setConsentChecks] = useState<Record<number, boolean>>(
		() => Object.fromEntries(CONSENT.map((_, i) => [i, i < CONSENT.length - 1])),
	);
	const [expandConsent, setExpandConsent] = useState<number | null>(null);
	const [whyPin, setWhyPin] = useState(false);
	const [actPin, setActPin] = useState("");
	const [linkPin, setLinkPin] = useState("");
	const [unlinkPin, setUnlinkPin] = useState("");
	const [revokePin, setRevokePin] = useState("");
	const [revokeOtp, setRevokeOtp] = useState("");
	const [relocatePin, setRelocatePin] = useState("");

	const [unlinkReason, setUnlinkReason] = useState("No longer needed");
	const [unlinkNote, setUnlinkNote] = useState("");
	const [notifyEmergency, setNotifyEmergency] = useState(false);
	const [relinkTarget, setRelinkTarget] = useState(RELINK[0].name);

	const [notif, setNotif] = useState({
		received: true,
		drop: true,
		failed: true,
		daily: false,
		linkChange: true,
	});
	const [channel, setChannel] = useState("Push");
	const [quietFrom, setQuietFrom] = useState("22:00");
	const [quietTo, setQuietTo] = useState("07:00");
	const [dropThreshold, setDropThreshold] = useState("50000");

	const [capIn, setCapIn] = useState(2_000_000);
	const [capOut, setCapOut] = useState(2_000_000);
	const [capTx, setCapTx] = useState(1_000_000);
	const [capMonth, setCapMonth] = useState(12_000_000);
	const [capVel, setCapVel] = useState(50);
	const usedIn = 680_000;
	const usedOut = 360_000;
	const usedMonth = 4_920_000;
	const [requestOpen, setRequestOpen] = useState(false);
	const [requestWhich, setRequestWhich] = useState("Daily inbound");
	const [requestTo, setRequestTo] = useState("5000000");
	const [requestWhy, setRequestWhy] = useState("");

	const [privacy, setPrivacy] = useState({
		visibility: true,
		statements: true,
		bureaus: false,
		marketing: false,
		analytics: true,
	});

	const [prefs, setPrefs] = useState({
		defaultDash: "Transaction Hub",
		pinLength: "4 digits",
		bio: true,
		autoTour: true,
		actConfirm: true,
		linkAlert: true,
		consentRemind: true,
		promo: false,
		hotspots: true,
		remindLater: false,
	});

	const [linkFilter, setLinkFilter] = useState("all");
	const shownLinks = LINKS.filter(
		(a) => linkFilter === "all" || a.status.toLowerCase() === linkFilter,
	);

	const requiredOk = CONSENT.every((item, i) => item.optional || consentChecks[i]);
	const confirmNeeded = `I confirm I want to move ${kes(relocateAmount)} to Primary PayMo Wallet`;
	const confirmOk =
		confirmPhrase.trim().toLowerCase() === confirmNeeded.toLowerCase();

	const applyPreset = (name: string, setFlags: (f: FeatureFlags) => void) => {
		const found = PRESETS.find((p) => p.name === name);
		if (found) setFlags(found.flags);
	};

	const toggleFlag = (
		flags: FeatureFlags,
		setFlags: (f: FeatureFlags) => void,
		key: keyof FeatureFlags,
		next: boolean,
	) => {
		setFlags({ ...flags, [key]: next });
	};

	const sendChat = () => {
		const text = chatDraft.trim();
		if (!text) {
			toast.warning("Type a message", "The chat box is empty.");
			return;
		}
		setChat((prev) => [
			...prev,
			{ from: "you", text },
			{
				from: "agent",
				text: `Noted. Ticket WA-20260901-${String(prev.length + 11).padStart(3, "0")} is open. I’ll keep this thread attached to ${selectedLinkAccount}.`,
			},
		]);
		setChatDraft("");
		toast.success("Message sent", "Nia is on the thread.");
	};

	/* ================= Activate dashboard ================= */
	const activateDashboardModal = (
		<FlowModal
			show={isOpen("activateDashboardModal")}
			onClose={() => close("activateDashboardModal")}
			iconCls="bi bi-stars"
			title="Activate Business Portal"
			steps={["Accept consent", "Confirm PIN", "Activated"]}
			confirmLabel="Confirm & activate"
		>
			{(step) => {
				if (step === 1) {
					return (
						<div>
							<InfoBox variant={requiredOk ? "success" : "warning"}>
								<i className="bi bi-lightning-charge-fill" />{" "}
								{requiredOk
									? "All mandatory consents are accepted. Continue to PIN."
									: "Accept every mandatory item before the PIN gate unlocks."}
							</InfoBox>
							<div className={s.softBox} style={{ margin: "14px 0" }}>
								<Toggle
									checked={Object.values(consentChecks).every(Boolean)}
									onChange={(next) =>
										setConsentChecks(
											Object.fromEntries(CONSENT.map((_, i) => [i, next])),
										)
									}
									label="Accept all consents"
									description="Includes the optional privacy addendum"
								/>
							</div>
							{CONSENT.map((item, i) => (
								<div
									key={item.name}
									style={{
										display: "flex",
										alignItems: "flex-start",
										gap: 12,
										padding: "10px 0",
										borderBottom: "1px dashed var(--border)",
									}}
								>
									<button
										type="button"
										aria-pressed={!!consentChecks[i]}
										onClick={() =>
											setConsentChecks((prev) => ({
												...prev,
												[i]: !prev[i],
											}))
										}
										style={{
											width: 22,
											height: 22,
											borderRadius: 7,
											border: consentChecks[i]
												? "2px solid var(--pri)"
												: "2px solid var(--border-2)",
											background: consentChecks[i] ? "var(--pri)" : "#fff",
											color: "#fff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
											cursor: "pointer",
										}}
									>
										{consentChecks[i] ? <i className="bi bi-check" /> : null}
									</button>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ fontSize: 13, fontWeight: 600 }}>
											{item.name}
											{item.optional ? (
												<span className={cx(s.badge, s.badgePurple)} style={{ marginLeft: 8 }}>
													Optional
												</span>
											) : (
												<span className={cx(s.badge, s.badgeInfo)} style={{ marginLeft: 8 }}>
													Required
												</span>
											)}
										</div>
										<div style={{ fontSize: 11, color: "var(--ink-500)" }}>
											{item.desc}
										</div>
										<button
											type="button"
											className={cx(s.btn, s.btnSecondary, s.btnSm)}
											style={{ marginTop: 6, minHeight: 28, padding: "2px 10px" }}
											onClick={() =>
												setExpandConsent(expandConsent === i ? null : i)
											}
										>
											{expandConsent === i ? "Hide clause" : "View clause"}
										</button>
										{expandConsent === i ? (
											<div
												style={{
													fontSize: 11,
													color: "var(--ink-700)",
													background: "#fff",
													border: "1px solid var(--border)",
													borderRadius: 8,
													padding: "10px 12px",
													marginTop: 6,
													lineHeight: 1.55,
												}}
											>
												{item.summary}
											</div>
										) : null}
									</div>
								</div>
							))}
						</div>
					);
				}
				if (step === 2) {
					return (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 14,
							}}
						>
							<p style={{ fontSize: 13, textAlign: "center", maxWidth: 380, margin: 0 }}>
								Enter your PayMo PIN to activate <strong>Business Portal</strong>.
								This is logged with timestamp, IP and device.
							</p>
							<PinGate value={actPin} onChange={setActPin} />
							<Btn sm onClick={() => setWhyPin((v) => !v)}>
								{whyPin ? "Hide explanation" : "Why am I seeing this?"}
							</Btn>
							{whyPin ? (
								<InfoBox variant="info">
									Activation is a privileged action. PIN proves it is you, not a
									session cookie. After two failures an SMS OTP fallback appears;
									after three, a 15-minute lockout.
								</InfoBox>
							) : null}
						</div>
					);
				}
				return (
					<div style={{ textAlign: "center" }}>
						<div className={s.receiptIcon} style={{ margin: "0 auto 12px" }}>
							<i className="bi bi-check-lg" />
						</div>
						<div className={s.receiptTitle}>Welcome to Business Portal</div>
						<p className={s.receiptMsg}>
							Certificate ACT-20260901-4421 issued. A welcome notice is on your{" "}
							{channel} channel.
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
							<Btn
								primary
								icon="bi-play-circle"
								onClick={() => jump("activateDashboardModal", "tourGuideModal")}
							>
								Take a tour
							</Btn>
							<Btn
								icon="bi-link-45deg"
								onClick={() => jump("activateDashboardModal", "linkAccountModal")}
							>
								Link accounts
							</Btn>
							<Btn
								icon="bi-box-arrow-up-right"
								onClick={() => {
									close("activateDashboardModal");
									toast.success("Opening Business Portal");
									go("/pm/app/transfer-overview");
								}}
							>
								Go to dashboard
							</Btn>
							<Btn
								icon="bi-gear"
								onClick={() => jump("activateDashboardModal", "preferencesModal")}
							>
								Set preferences
							</Btn>
						</div>
					</div>
				);
			}}
		</FlowModal>
	);

	/* ================= Tour ================= */
	const tourGuideModal = (
		<ModalShell
			show={isOpen("tourGuideModal")}
			onClose={() => close("tourGuideModal")}
			iconCls="bi bi-signpost-2"
			title="Dashboard tour guide"
			size="lg"
			footer={
				<>
					<Btn
						onClick={() => {
							if (tourStep === 0) close("tourGuideModal");
							else setTourStep((n) => n - 1);
						}}
					>
						{tourStep === 0 ? "Skip tour" : "Back"}
					</Btn>
					<Btn
						primary
						icon={tourStep === TOUR.length - 1 ? "bi-check-lg" : "bi-arrow-right"}
						onClick={() => {
							if (tourStep < TOUR.length - 1) setTourStep((n) => n + 1);
							else {
								close("tourGuideModal");
								toast.success("Tour complete", "200 reward points posted.");
							}
						}}
					>
						{tourStep === TOUR.length - 1 ? "Finish" : "Next"}
					</Btn>
				</>
			}
		>
			<ol className={s.stepper} aria-label="Tour progress">
				{TOUR.map((step, i) => (
					<li
						key={step.title}
						className={cx(
							s.step,
							i === tourStep && s.stepActive,
							i < tourStep && s.stepDone,
						)}
					>
						<span className={s.stepNum}>
							{i < tourStep ? <i className="bi bi-check" /> : i + 1}
						</span>
						{i < TOUR.length - 1 ? <span className={s.stepLine} /> : null}
					</li>
				))}
			</ol>
			<div style={{ textAlign: "center", padding: "8px 12px 16px" }}>
				<div
					style={{
						width: 88,
						height: 88,
						borderRadius: 22,
						background: "var(--success-bg)",
						color: "var(--success)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 36,
						margin: "0 auto 16px",
					}}
				>
					<i className={`bi ${TOUR[tourStep].icon}`} />
				</div>
				<div style={{ fontFamily: "Sora, Inter, sans-serif", fontSize: 18, fontWeight: 700 }}>
					{TOUR[tourStep].title}
				</div>
				<p style={{ fontSize: 13, color: "var(--ink-700)", maxWidth: 420, margin: "8px auto 0" }}>
					{TOUR[tourStep].desc}
				</p>
				<div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
					{TOUR.map((step, i) => (
						<button
							key={step.title}
							type="button"
							aria-label={`Go to ${step.title}`}
							onClick={() => setTourStep(i)}
							style={{
								width: i === tourStep ? 20 : 8,
								height: 8,
								borderRadius: 999,
								background: i === tourStep ? "var(--pri)" : "var(--border-2)",
								border: 0,
								padding: 0,
								cursor: "pointer",
							}}
						/>
					))}
				</div>
			</div>
			<InfoBox variant="info">
				<i className="bi bi-gift" /> Completing the tour posts 200 reward points.
				Replay anytime from Preferences.
			</InfoBox>
		</ModalShell>
	);

	/* ================= Activation success ================= */
	const activationSuccessModal = (
		<ModalShell
			show={isOpen("activationSuccessModal")}
			onClose={() => close("activationSuccessModal")}
			iconCls="bi bi-check-circle"
			title="Activation certificate"
			size="lg"
			footer={
				<>
					<Btn onClick={() => close("activationSuccessModal")}>Close</Btn>
					<Btn
						icon="bi-clipboard"
						onClick={() => copyText("ACT-20260901-4421", "Certificate")}
					>
						Copy reference
					</Btn>
					<Btn
						primary
						icon="bi-download"
						onClick={() =>
							toast.success("Certificate queued", "ACT-20260901-4421.pdf")
						}
					>
						Download PDF
					</Btn>
				</>
			}
		>
			<div className={s.receipt}>
				<div className={s.receiptIcon}>
					<i className="bi bi-patch-check-fill" />
				</div>
				<div className={s.receiptTitle}>Business Portal is live</div>
				<p className={s.receiptMsg}>Oscar K. Kasongo · Verified KYC · 1 Sep 2026, 09:14 EAT</p>
				<hr style={{ border: 0, borderTop: "1px dashed var(--border)", margin: "12px 0" }} />
				<ReviewRow label="Certificate" value="ACT-20260901-4421" highlight />
				<ReviewRow label="Primary wallet" value="PM-4521-8830-1024" />
				<ReviewRow label="Consents" value={`${CONSENT.filter((_, i) => consentChecks[i]).length} / ${CONSENT.length}`} />
				<ReviewRow label="PIN length" value={prefs.pinLength} />
				<ReviewRow label="Channel" value={channel} />
			</div>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
				<Btn sm icon="bi-play-circle" onClick={() => jump("activationSuccessModal", "tourGuideModal")}>
					Replay tour
				</Btn>
				<Btn sm icon="bi-link-45deg" onClick={() => jump("activationSuccessModal", "linkAccountModal")}>
					Link an account
				</Btn>
				<Btn
					sm
					icon="bi-box-arrow-up-right"
					onClick={() => {
						close("activationSuccessModal");
						go("/pm/app/transfer-overview");
					}}
				>
					Open hub
				</Btn>
			</div>
		</ModalShell>
	);

	/* ================= Link account ================= */
	const linkAccountModal = (
		<FlowModal
			show={isOpen("linkAccountModal")}
			onClose={() => close("linkAccountModal")}
			iconCls="bi bi-link-45deg"
			title="Link account"
			steps={[
				"Select source",
				"Select destination",
				"Flow preview",
				"Configure permissions",
				"Confirm PIN",
				"Linked",
			]}
			confirmLabel="Link account"
		>
			{(step) => {
				if (step === 1) {
					return (
						<div>
							<InfoBox variant="info">
								<i className="bi bi-wallet2" /> Choose the source wallet the new
								path will debit from.
							</InfoBox>
							<div style={{ marginTop: 14 }}>
								{SOURCE.map((acc) => (
									<Choice
										key={acc.name}
										selected={linkSourceWallet === acc.name}
										onSelect={() => setLinkSourceWallet(acc.name)}
										title={acc.name}
										desc={`${acc.origin} · ${acc.number}`}
										letter={acc.letter}
										grad={acc.grad}
										right={
											<strong style={{ fontSize: 13 }}>{acc.balance}</strong>
										}
									/>
								))}
							</div>
						</div>
					);
				}
				if (step === 2) {
					return (
						<div>
							<InfoBox variant="info">
								<i className="bi bi-arrow-right" /> Destination for{" "}
								<strong>{linkSourceWallet}</strong>.
							</InfoBox>
							<div style={{ marginTop: 14 }}>
								{DEST.map((acc) => (
									<Choice
										key={acc.name}
										selected={linkDestinationWallet === acc.name}
										onSelect={() => setLinkDestinationWallet(acc.name)}
										title={acc.name}
										desc={`${acc.origin} · ${acc.number}`}
										letter={acc.letter}
										grad={acc.grad}
										right={
											<strong style={{ fontSize: 13 }}>{acc.balance}</strong>
										}
									/>
								))}
							</div>
						</div>
					);
				}
				if (step === 3) {
					return (
						<div>
							<InfoBox variant="warning">
								<i className="bi bi-diagram-3" /> Preview of the money path.
							</InfoBox>
							<div className={s.softBox} style={{ marginTop: 14 }}>
								<div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
									<div style={{ textAlign: "center", flex: 1 }}>
										<strong>{linkSourceWallet}</strong>
										<div style={{ fontSize: 11, color: "var(--ink-500)" }}>Source</div>
									</div>
									<span style={{ color: "var(--success)", fontWeight: 700, fontSize: 12 }}>
										<i className="bi bi-arrow-left-right" /> {linkPreset}
									</span>
									<div style={{ textAlign: "center", flex: 1 }}>
										<strong>{linkDestinationWallet}</strong>
										<div style={{ fontSize: 11, color: "var(--ink-500)" }}>Destination</div>
									</div>
								</div>
							</div>
							<ul style={{ fontSize: 12, color: "var(--ink-700)", marginTop: 12 }}>
								<li>Both wallets can see balances if visibility is on.</li>
								<li>Transfers follow the permission you pick next.</li>
								<li>You can change this later from Active links without unlinking.</li>
							</ul>
						</div>
					);
				}
				if (step === 4) {
					return (
						<div>
							{PRESETS.filter((p) => p.name !== "Custom").map((p) => (
								<Choice
									key={p.name}
									selected={linkPreset === p.name}
									onSelect={() => {
										setLinkPreset(p.name);
										setLinkFlags(p.flags);
									}}
									title={p.name}
									desc={p.desc}
								/>
							))}
							<div style={{ marginTop: 8 }}>
								<Toggle
									checked={linkFlags.visibility}
									onChange={(v) => toggleFlag(linkFlags, setLinkFlags, "visibility", v)}
									label="Balance visibility"
									description="Both wallets see each other's balance"
								/>
								<Toggle
									checked={linkFlags.history}
									onChange={(v) => toggleFlag(linkFlags, setLinkFlags, "history", v)}
									label="Transaction history"
									description="Share hops between the two wallets"
								/>
								<Toggle
									checked={linkFlags.sweep}
									onChange={(v) => toggleFlag(linkFlags, setLinkFlags, "sweep", v)}
									label="Auto-sweep"
									description="Move excess above threshold automatically"
								/>
								<Toggle
									checked={linkFlags.topup}
									onChange={(v) => toggleFlag(linkFlags, setLinkFlags, "topup", v)}
									label="Auto top-up"
									description="Refill when balance drops below threshold"
								/>
								<Toggle
									checked={linkFlags.alerts}
									onChange={(v) => toggleFlag(linkFlags, setLinkFlags, "alerts", v)}
									label="Notification sharing"
									description="Alerts about hops on the linked wallet"
								/>
							</div>
						</div>
					);
				}
				return (
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
						<p style={{ fontSize: 13, textAlign: "center", maxWidth: 400, margin: 0 }}>
							Link <strong>{linkSourceWallet}</strong> to{" "}
							<strong>{linkDestinationWallet}</strong> with{" "}
							<strong>{linkPreset}</strong>.
						</p>
						<PinGate value={linkPin} onChange={setLinkPin} />
						<InfoBox variant="success">
							<i className="bi bi-shield-check" /> Linking is instant and reversible
							from Active links.
						</InfoBox>
					</div>
				);
			}}
		</FlowModal>
	);

	/* ================= Permissions ================= */
	const linkPermissionsModal = (
		<TabbedModal
			show={isOpen("linkPermissionsModal")}
			onClose={() => close("linkPermissionsModal")}
			iconCls="bi bi-sliders"
			title={`Permission controls — ${selectedLinkAccount}`}
			tabs={[
				{
					key: "presets",
					label: "Presets",
					render: () => (
						<div>
							<InfoBox variant="info">
								<i className="bi bi-info-circle" /> Quick presets for{" "}
								{selectedLinkAccount}. Custom unlocks every toggle on Granular.
							</InfoBox>
							<div style={{ marginTop: 12 }}>
								{PRESETS.map((p) => (
									<Choice
										key={p.name}
										selected={permPreset === p.name}
										onSelect={() => {
											setPermPreset(p.name);
											applyPreset(p.name, setPermFlags);
										}}
										title={p.name}
										desc={p.desc}
									/>
								))}
							</div>
						</div>
					),
				},
				{
					key: "granular",
					label: "Granular",
					render: () => (
						<div>
							<Toggle
								checked={permFlags.visibility}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "visibility", v);
								}}
								label="Balance visibility"
								description={`Allow this dashboard to see ${selectedLinkAccount}`}
							/>
							<Toggle
								checked={permFlags.inbound}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "inbound", v);
								}}
								label="Inbound transfers"
								description={`Money may flow INTO the hub from ${selectedLinkAccount}`}
							/>
							<Toggle
								checked={permFlags.outbound}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "outbound", v);
								}}
								label="Outbound transfers"
								description={`Money may flow OUT to ${selectedLinkAccount}`}
							/>
							<Toggle
								checked={permFlags.sweep}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "sweep", v);
								}}
								label="Auto-sweep"
								description="Move excess balance above threshold automatically"
							/>
							<Toggle
								checked={permFlags.topup}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "topup", v);
								}}
								label="Auto top-up"
								description="Refill when balance drops below threshold"
							/>
							<Toggle
								checked={permFlags.alerts}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "alerts", v);
								}}
								label="Notification sharing"
								description={`Alerts about hops on ${selectedLinkAccount}`}
							/>
							<Toggle
								checked={permFlags.statements}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "statements", v);
								}}
								label="Statement access"
								description={`Include ${selectedLinkAccount} in consolidated statements`}
							/>
							<Toggle
								checked={permFlags.history}
								onChange={(v) => {
									setPermPreset("Custom");
									toggleFlag(permFlags, setPermFlags, "history", v);
								}}
								label="Transaction history"
								description={`View full history from ${selectedLinkAccount}`}
							/>
						</div>
					),
				},
			]}
			footer={
				<>
					<Btn onClick={() => close("linkPermissionsModal")}>Cancel</Btn>
					<Btn
						onClick={() => jump("linkPermissionsModal", "linkFlowControlModal")}
					>
						Open flow control
					</Btn>
					<Btn
						primary
						onClick={() => {
							close("linkPermissionsModal");
							toast.success("Permissions saved", `${selectedLinkAccount} · ${permPreset}`);
						}}
					>
						Save permissions
					</Btn>
				</>
			}
		/>
	);

	/* ================= Notifications ================= */
	const linkNotificationsModal = (
		<SimpleModal
			show={isOpen("linkNotificationsModal")}
			onClose={() => close("linkNotificationsModal")}
			size="lg"
			iconCls="bi bi-bell"
			title={`Alert routing — ${selectedLinkAccount}`}
			submitLabel="Save routing"
			successMsg="Alert routing updated"
			onSubmit={() =>
				toast.success("Routing saved", `${channel} · quiet ${quietFrom}–${quietTo}`)
			}
		>
			<Toggle
				checked={notif.received}
				onChange={(v) => setNotif((n) => ({ ...n, received: v }))}
				label="Notify on money received"
				description={`Alert when ${selectedLinkAccount} receives a hop`}
			/>
			<Toggle
				checked={notif.drop}
				onChange={(v) => setNotif((n) => ({ ...n, drop: v }))}
				label="Balance drop alert"
				description={`Notify when balance drops below ${kes(Number(dropThreshold) || 0)}`}
			/>
			{notif.drop ? (
				<div style={{ margin: "0 0 12px" }}>
					<Field
						id="drop-threshold"
						label="Drop threshold (KES)"
						type="number"
						value={dropThreshold}
						onChange={setDropThreshold}
					/>
				</div>
			) : null}
			<Toggle
				checked={notif.failed}
				onChange={(v) => setNotif((n) => ({ ...n, failed: v }))}
				label="Failed transaction alerts"
				description="Alert on declined or reversed hops"
			/>
			<Toggle
				checked={notif.daily}
				onChange={(v) => setNotif((n) => ({ ...n, daily: v }))}
				label="Daily balance summary"
				description="Send a 07:00 digest on your preferred channel"
			/>
			<Toggle
				checked={notif.linkChange}
				onChange={(v) => setNotif((n) => ({ ...n, linkChange: v }))}
				label="Link & permission changes"
				description="Alert when this link is unlinked or permissions change"
			/>
			<div style={{ marginTop: 12 }}>
				<Select
					id="notif-channel"
					label="Preferred channel"
					value={channel}
					onChange={setChannel}
					options={["Push", "SMS", "Email", "WhatsApp"]}
				/>
				<div style={fieldGrid}>
					<Field id="quiet-from" label="Quiet hours from" type="time" value={quietFrom} onChange={setQuietFrom} />
					<Field id="quiet-to" label="Quiet hours to" type="time" value={quietTo} onChange={setQuietTo} />
				</div>
				<div style={{ marginTop: 12 }}>
					<Btn
						icon="bi-send"
						onClick={() =>
							toast.success(`Test ${channel} sent`, `Quiet ${quietFrom}–${quietTo} honoured.`)
						}
					>
						Send test notification
					</Btn>
				</div>
			</div>
		</SimpleModal>
	);

	/* ================= Flow control ================= */
	const linkFlowControlModal = (
		<TabbedModal
			show={isOpen("linkFlowControlModal")}
			onClose={() => close("linkFlowControlModal")}
			iconCls="bi bi-arrow-left-right"
			title={`Flow control — ${selectedLinkAccount}`}
			tabs={[
				{
					key: "direction",
					label: "Direction",
					render: () => (
						<div>
							<InfoBox variant="warning">
								<i className="bi bi-arrow-left-right" /> Direction between the hub
								and {selectedLinkAccount}.
							</InfoBox>
							<div style={{ marginTop: 12 }}>
								{[
									{
										name: "Bidirectional",
										desc: "Money can flow both ways",
										icon: "bi-arrow-left-right",
									},
									{
										name: "Inbound Only",
										desc: "Only INTO this account",
										icon: "bi-arrow-right",
									},
									{
										name: "Outbound Only",
										desc: "Only OUT from this account",
										icon: "bi-arrow-left",
									},
									{
										name: "No Flow",
										desc: "View only — no hops",
										icon: "bi-x-circle",
									},
								].map((p) => (
									<Choice
										key={p.name}
										selected={flowDir === p.name}
										onSelect={() => setFlowDir(p.name)}
										title={p.name}
										desc={p.desc}
										icon={p.icon}
									/>
								))}
							</div>
						</div>
					),
				},
				{
					key: "limits",
					label: "Limits",
					render: () => (
						<div>
							<div style={fieldGrid}>
								<Field id="daily-limit" label="Daily transfer limit (KES)" type="number" value={dailyLimit} onChange={setDailyLimit} />
								<Field id="per-tx-limit" label="Per-transaction limit (KES)" type="number" value={perTxLimit} onChange={setPerTxLimit} />
								<Field id="month-limit" label="Monthly transfer limit (KES)" type="number" value={monthlyLimit} onChange={setMonthlyLimit} />
								<Field id="min-tx" label="Minimum transfer (KES)" type="number" value={minTx} onChange={setMinTx} />
							</div>
							<Toggle
								checked={enforceLimits}
								onChange={setEnforceLimits}
								label="Enforce limits strictly"
								description="Block hops that exceed a cap"
							/>
							<Toggle
								checked={pinOverride}
								onChange={setPinOverride}
								label="Allow limit override with PIN"
								description="Require PIN to exceed a cap"
							/>
							<Btn sm onClick={() => jump("linkFlowControlModal", "linkLimitsModal")}>
								Open global caps
							</Btn>
						</div>
					),
				},
				{
					key: "schedule",
					label: "Schedule",
					render: () => (
						<div>
							<Toggle
								checked={timeRestrict}
								onChange={setTimeRestrict}
								label="Enable time-based restrictions"
								description="Only allow hops during the window below"
							/>
							<div style={{ ...fieldGrid, marginTop: 12, opacity: timeRestrict ? 1 : 0.5 }}>
								<Field id="allowed-from" label="Allowed from" type="time" value={allowedFrom} onChange={setAllowedFrom} />
								<Field id="allowed-until" label="Allowed until" type="time" value={allowedUntil} onChange={setAllowedUntil} />
							</div>
							<fieldset style={{ border: 0, padding: 0, marginTop: 12 }}>
								<legend className={s.formLabel} style={{ padding: 0 }}>
									Blocked days
								</legend>
								<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
									{DAYS.map((day) => {
										const on = blockedDays.includes(day);
										return (
											<button
												key={day}
												type="button"
												aria-pressed={on}
												className={cx(s.btn, on ? s.btnPrimary : s.btnSecondary, s.btnSm)}
												onClick={() =>
													setBlockedDays((prev) =>
														on ? prev.filter((d) => d !== day) : [...prev, day],
													)
												}
											>
												{day}
											</button>
										);
									})}
								</div>
							</fieldset>
						</div>
					),
				},
			]}
			footer={
				<>
					<Btn onClick={() => close("linkFlowControlModal")}>Cancel</Btn>
					<Btn
						primary
						onClick={() => {
							close("linkFlowControlModal");
							toast.success(
								"Flow settings saved",
								`${flowDir} · daily ${kes(Number(dailyLimit) || 0)}`,
							);
						}}
					>
						Save flow settings
					</Btn>
				</>
			}
		/>
	);

	/* ================= Active links ================= */
	const activeLinksModal = (
		<ModalShell
			show={isOpen("activeLinksModal")}
			onClose={() => close("activeLinksModal")}
			iconCls="bi bi-link-45deg"
			title="Active links"
			size="xl"
			footer={
				<>
					<Btn onClick={() => close("activeLinksModal")}>Close</Btn>
					<Btn
						primary
						icon="bi-plus-lg"
						onClick={() => jump("activeLinksModal", "linkAccountModal")}
					>
						Link new account
					</Btn>
				</>
			}
		>
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
				<span className={cx(s.badge, s.badgeSuccess)}>
					<i className="bi bi-link-45deg" /> {LINKS.filter((a) => a.status === "Active").length} live
				</span>
				<span className={cx(s.badge, s.badgeWarning)}>
					{LINKS.filter((a) => a.status === "Paused").length} paused
				</span>
				{["all", "active", "paused"].map((f) => (
					<button
						key={f}
						type="button"
						className={cx(s.btn, s.btnSm, linkFilter === f ? s.btnPrimary : s.btnSecondary)}
						onClick={() => setLinkFilter(f)}
					>
						{f[0].toUpperCase() + f.slice(1)}
					</button>
				))}
			</div>
			<div className={s.tableWrap}>
				<table className={s.table}>
					<thead>
						<tr>
							<th>Account</th>
							<th>Origin</th>
							<th>Balance</th>
							<th>Permission</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{shownLinks.length === 0 ? (
							<tr>
								<td colSpan={6}>
									No accounts in this filter.{" "}
									<button type="button" className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => setLinkFilter("all")}>
										Show all
									</button>
								</td>
							</tr>
						) : (
							shownLinks.map((acc) => (
								<tr key={acc.name}>
									<td>
										<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
											<span
												style={{
													width: 32,
													height: 32,
													borderRadius: 9,
													background: acc.grad,
													color: "#fff",
													display: "inline-flex",
													alignItems: "center",
													justifyContent: "center",
													fontWeight: 700,
												}}
											>
												{acc.letter}
											</span>
											<div>
												<div style={{ fontWeight: 600 }}>{acc.name}</div>
												<div style={{ fontSize: 11, color: "var(--ink-500)" }}>
													{acc.number} · linked {acc.linked}
												</div>
											</div>
										</div>
									</td>
									<td>{acc.origin}</td>
									<td>{acc.balance}</td>
									<td>
										<span className={cx(s.badge, acc.permission === "Full Control" ? s.badgeSuccess : s.badgeInfo)}>
											{acc.permission}
										</span>
									</td>
									<td>
										<span className={cx(s.badge, acc.status === "Paused" ? s.badgeWarning : s.badgeSuccess)}>
											{acc.status}
										</span>
									</td>
									<td>
										<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
											<Btn
												sm
												onClick={() => {
													setSelectedLinkAccount(acc.name);
													jump("activeLinksModal", "linkPermissionsModal");
												}}
											>
												Perms
											</Btn>
											<Btn
												sm
												onClick={() => {
													setSelectedLinkAccount(acc.name);
													jump("activeLinksModal", "linkNotificationsModal");
												}}
											>
												Alerts
											</Btn>
											<Btn
												sm
												onClick={() => {
													setSelectedLinkAccount(acc.name);
													jump("activeLinksModal", "linkFlowControlModal");
												}}
											>
												Flow
											</Btn>
											{acc.status === "Paused" ? (
												<Btn
													sm
													primary
													onClick={() => {
														setRelinkTarget(acc.name);
														jump("activeLinksModal", "relinkAccountModal");
													}}
												>
													Relink
												</Btn>
											) : (
												<Btn
													sm
													danger
													onClick={() => {
														setSelectedLinkAccount(acc.name);
														jump("activeLinksModal", "unlinkAccountModal");
													}}
												>
													Unlink
												</Btn>
											)}
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</ModalShell>
	);

	/* ================= Unlink ================= */
	const unlinkAccountModal = (
		<FlowModal
			show={isOpen("unlinkAccountModal")}
			onClose={() => close("unlinkAccountModal")}
			iconCls="bi bi-unlink"
			title={`Unlink ${selectedLinkAccount}`}
			steps={["Check balances", "Reason & PIN", "Grace period"]}
			confirmLabel="Confirm unlink"
		>
			{(step) => {
				if (step === 1) {
					return (
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<InfoBox variant="warning">
								<i className="bi bi-exclamation-triangle" /> {selectedLinkAccount}{" "}
								holds <strong>{kes(available)}</strong>. Relocate before the path
								breaks.
							</InfoBox>
							<div className={s.softBox}>
								<div className={s.summaryRow}>
									<span>Available</span>
									<strong>{kes(available)}</strong>
								</div>
								<div className={s.summaryRow}>
									<span>Pending</span>
									<span>{kes(0)}</span>
								</div>
								<div className={s.summaryRow}>
									<span>Reserved / hold</span>
									<span>{kes(45_000)}</span>
								</div>
							</div>
							<Btn
								primary
								icon="bi-arrow-left-right"
								onClick={() => jump("unlinkAccountModal", "moneyRelocationModal")}
							>
								Move funds with Relocation Wizard
							</Btn>
						</div>
					);
				}
				if (step === 2) {
					return (
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<Select
								id="unlink-reason"
								label="Reason for unlinking"
								value={unlinkReason}
								onChange={setUnlinkReason}
								options={[
									"No longer needed",
									"Security concern",
									"Switching dashboards",
									"Account closure",
									"Other",
								]}
							/>
							{unlinkReason === "Other" ? (
								<Field id="unlink-note" label="Tell us more" value={unlinkNote} onChange={setUnlinkNote} />
							) : null}
							<PinGate value={unlinkPin} onChange={setUnlinkPin} />
						</div>
					);
				}
				return (
					<div style={{ textAlign: "center" }}>
						<div className={s.receiptIcon} style={{ margin: "0 auto 12px", background: "var(--warning-bg)", color: "var(--warning)" }}>
							<i className="bi bi-clock-history" />
						</div>
						<p style={{ fontSize: 13, maxWidth: 400, margin: "0 auto" }}>
							Unlink of <strong>{selectedLinkAccount}</strong> is confirmed. A{" "}
							<strong>24-hour grace</strong> applies. Relink within 30 days without
							re-consent.
						</p>
						<div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
							<Btn onClick={() => jump("unlinkAccountModal", "relinkAccountModal")}>Relink now</Btn>
							<Btn primary onClick={() => close("unlinkAccountModal")}>
								Done
							</Btn>
						</div>
					</div>
				);
			}}
		</FlowModal>
	);

	/* ================= Relink ================= */
	const relinkAccountModal = (
		<SimpleModal
			show={isOpen("relinkAccountModal")}
			onClose={() => close("relinkAccountModal")}
			iconCls="bi bi-link-45deg"
			title="Relink account"
			size="lg"
			submitLabel={`Relink ${relinkTarget}`}
			successMsg={`${relinkTarget} is live again`}
			onSubmit={() => toast.success("Relinked", `${relinkTarget} restored with previous permissions.`)}
		>
			<InfoBox variant="info">
				<i className="bi bi-arrow-counterclockwise" /> Inside the 30-day instant
				relink window. Previous permissions are preserved.
			</InfoBox>
			<div style={{ marginTop: 12 }}>
				{RELINK.map((acc) => (
					<Choice
						key={acc.name}
						selected={relinkTarget === acc.name}
						onSelect={() => setRelinkTarget(acc.name)}
						title={acc.name}
						desc={acc.detail}
						letter={acc.letter}
						grad={acc.grad}
					/>
				))}
			</div>
		</SimpleModal>
	);

	/* ================= Revoke all ================= */
	const revokeAllAccessModal = (
		<FlowModal
			show={isOpen("revokeAllAccessModal")}
			onClose={() => close("revokeAllAccessModal")}
			iconCls="bi bi-shield-exclamation"
			title="Revoke all dashboard access"
			steps={["Understand impact", "Confirm identity", "Revoked"]}
			confirmLabel="Revoke all access"
		>
			{(step) => {
				if (step === 1) {
					return (
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							<InfoBox variant="danger">
								<i className="bi bi-exclamation-triangle-fill" /> Emergency panic
								button. All inter-dashboard hops suspend immediately.
							</InfoBox>
							{[
								"Suspends all cross-dashboard transfers instantly",
								"Requires PIN + SMS OTP dual confirmation",
								"Optional notification to your emergency contact",
								"72-hour cooldown before reactivation",
							].map((item) => (
								<div key={item} style={{ display: "flex", gap: 10, fontSize: 13 }}>
									<i className="bi bi-x-circle" style={{ color: "var(--danger)" }} />
									<span>{item}</span>
								</div>
							))}
							<Toggle
								checked={notifyEmergency}
								onChange={setNotifyEmergency}
								label="Notify emergency contact"
								description="SMS +254 712 345 890"
								danger
							/>
						</div>
					);
				}
				if (step === 2) {
					return (
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
							<p style={{ fontSize: 13, textAlign: "center", maxWidth: 380 }}>
								Enter PIN and the 6-digit OTP sent to +254 712 345 890.
							</p>
							<PinGate value={revokePin} onChange={setRevokePin} label="PIN" />
							<PinGate length={6} value={revokeOtp} onChange={setRevokeOtp} label="SMS OTP" />
							<Btn
								sm
								onClick={() => {
									setRevokeOtp("482193");
									toast.info("OTP filled", "Demo OTP 482193 — replace in production.");
								}}
							>
								Resend OTP
							</Btn>
						</div>
					);
				}
				return (
					<div style={{ textAlign: "center" }}>
						<div className={s.receiptIcon} style={{ margin: "0 auto 12px", background: "var(--danger-bg)", color: "var(--danger)" }}>
							<i className="bi bi-shield-x" />
						</div>
						<div className={s.receiptTitle}>Access revoked across all dashboards</div>
						<p className={s.receiptMsg}>
							Hops are suspended. 72-hour cooldown is active.
							{notifyEmergency ? " Emergency contact notified." : " Emergency contact was not notified."}
						</p>
						<Btn onClick={() => jump("revokeAllAccessModal", "supportHelpModal")}>
							Talk to support
						</Btn>
					</div>
				);
			}}
		</FlowModal>
	);

	/* ================= Relocation wizard ================= */
	const fee = 50;
	const net = Math.max(0, relocateAmount - fee);
	const moneyRelocationModal = (
		<FlowModal
			show={isOpen("moneyRelocationModal")}
			onClose={() => close("moneyRelocationModal")}
			iconCls="bi bi-arrow-left-right"
			title="Money Relocation Wizard"
			steps={["Intent", "Destination", "Allocation", "Review", "Security", "Verify", "Execute", "Receipt"]}
			confirmLabel="Move funds"
		>
			{(step) => {
				if (step === 1) {
					return (
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<InfoBox variant="warning">
								<i className="bi bi-exclamation-triangle" /> {selectedLinkAccount}{" "}
								holds <strong>{kes(available)}</strong>. Reserved {kes(45_000)} stays.
							</InfoBox>
							<div className={s.softBox}>
								<div className={s.summaryRow}>
									<span>Available</span>
									<strong>{kes(available)}</strong>
								</div>
								<div className={s.summaryRow}>
									<span>Pending</span>
									<span>{kes(0)}</span>
								</div>
								<div className={s.summaryRow}>
									<span>Reserved</span>
									<span>{kes(45_000)}</span>
								</div>
							</div>
						</div>
					);
				}
				if (step === 2) {
					return (
						<div>
							<Select
								id="reloc-dest"
								label="Destination"
								value={relocationDestination}
								onChange={setRelocationDestination}
								options={DESTINATIONS}
							/>
							<InfoBox variant="info">
								<i className="bi bi-info-circle" /> {relocationDestination}. Limits
								and KYC tier are validated automatically.
							</InfoBox>
						</div>
					);
				}
				if (step === 3) {
					return (
						<div>
							<div style={fieldGrid}>
								<div>
									<Label>Amount to move</Label>
									<div className={s.formControl} style={{ fontWeight: 700 }}>
										{kes(relocateAmount)}
									</div>
								</div>
								<Select
									id="reloc-pct"
									label="Percentage of available"
									value={relocatePct}
									onChange={setRelocatePct}
									options={["100", "75", "50", "25"]}
								/>
							</div>
							<div style={{ marginTop: 16, textAlign: "center" }}>
								<div
									style={{
										width: 180,
										height: 180,
										borderRadius: "50%",
										background: `conic-gradient(var(--pri) 0 ${relocatePct}%, var(--border) ${relocatePct}% 100%)`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										margin: "0 auto",
									}}
								>
									<div
										style={{
											width: 120,
											height: 120,
											borderRadius: "50%",
											background: "#fff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexDirection: "column",
										}}
									>
										<strong>{relocatePct}%</strong>
										<span style={{ fontSize: 11, color: "var(--ink-500)" }}>moving</span>
									</div>
								</div>
							</div>
						</div>
					);
				}
				if (step === 4) {
					return (
						<div>
							<div className={s.softBox} style={{ marginBottom: 12 }}>
								<ReviewRow label="Source" value={`${selectedLinkAccount} •••• 2207`} />
								<ReviewRow label="Current" value={kes(available)} />
								<ReviewRow label="Post-transfer" value={kes(available - relocateAmount)} highlight />
							</div>
							<div className={s.softBox} style={{ marginBottom: 12 }}>
								<ReviewRow label="Destination" value={relocationDestination} />
								<ReviewRow label="Amount" value={kes(relocateAmount)} />
							</div>
							<div className={s.softBox}>
								<ReviewRow label="Platform fee" value="KES 0 (waiver)" />
								<ReviewRow label="Network fee" value={kes(fee)} />
								<ReviewRow label="Net received" value={kes(net)} highlight />
								<ReviewRow label="Reference" value="REL-20260901-8841" />
							</div>
						</div>
					);
				}
				if (step === 5) {
					return (
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
							<p style={{ fontSize: 13, textAlign: "center" }}>
								Multi-factor required to move <strong>{kes(relocateAmount)}</strong>.
							</p>
							<PinGate value={relocatePin} onChange={setRelocatePin} />
							<div style={{ width: "100%" }}>
								<Label htmlFor="confirm-phrase">Type to confirm</Label>
								<p style={{ fontSize: 12, color: "var(--ink-500)", margin: "0 0 6px" }}>
									<em>{confirmNeeded}</em>
								</p>
								<input
									id="confirm-phrase"
									className={s.formControl}
									value={confirmPhrase}
									onChange={(e) => setConfirmPhrase(e.target.value)}
								/>
								<p style={{ fontSize: 11, color: confirmOk ? "var(--success)" : "var(--ink-500)" }}>
									{confirmOk ? "Phrase matches." : "Phrase must match exactly."}
								</p>
							</div>
						</div>
					);
				}
				if (step === 6) {
					return (
						<div>
							<InfoBox variant="info">
								<i className="bi bi-person-check" /> Destination is your own Primary
								PayMo Wallet — name match confirmed.
							</InfoBox>
							<div className={s.softBox} style={{ marginTop: 12 }}>
								<ReviewRow label="Destination type" value="Internal PayMo wallet" />
								<ReviewRow label="Name confirmation" value="Oscar K. Kasongo ✓" highlight />
								<ReviewRow label="Network" value="PayMo internal ledger" />
							</div>
							<Toggle
								checked={saveDest}
								onChange={setSaveDest}
								label="Save destination for future use"
							/>
						</div>
					);
				}
				if (step === 7) {
					return (
						<div>
							{[
								{ name: "Queued", desc: "Relocation accepted", done: true },
								{ name: "Validating", desc: "Limits and fraud screen", done: true },
								{ name: "Processing", desc: `Moving ${kes(relocateAmount)}`, done: false, active: true },
								{ name: "Completed", desc: "Receipt available", done: false },
							].map((st) => (
								<div key={st.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
									<div
										style={{
											width: 30,
											height: 30,
											borderRadius: "50%",
											background: st.done ? "var(--success)" : st.active ? "var(--pri)" : "var(--border)",
											color: "#fff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										{st.done ? <i className="bi bi-check" /> : st.active ? <div className={s.spinner} style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
									</div>
									<div>
										<div style={{ fontWeight: 600, fontSize: 13 }}>{st.name}</div>
										<div style={{ fontSize: 11, color: "var(--ink-500)" }}>{st.desc}</div>
									</div>
								</div>
							))}
						</div>
					);
				}
				return (
					<div style={{ textAlign: "center" }}>
						<div className={s.receiptIcon} style={{ margin: "0 auto 12px" }}>
							<i className="bi bi-check-lg" />
						</div>
						<div className={s.receiptTitle}>Relocation complete</div>
						<p className={s.receiptMsg}>
							{kes(relocateAmount)} moved · {kes(fee)} fee · net {kes(net)}.
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
							<Btn primary icon="bi-receipt" onClick={() => jump("moneyRelocationModal", "relocationReceiptModal")}>
								View receipt
							</Btn>
							<Btn onClick={() => jump("moneyRelocationModal", "activeLinksModal")}>
								Manage links
							</Btn>
							<Btn onClick={() => close("moneyRelocationModal")}>Return</Btn>
						</div>
					</div>
				);
			}}
		</FlowModal>
	);

	/* ================= Receipt ================= */
	const relocationReceiptModal = (
		<ModalShell
			show={isOpen("relocationReceiptModal")}
			onClose={() => close("relocationReceiptModal")}
			iconCls="bi bi-receipt"
			title="Relocation receipt"
			size="lg"
			footer={
				<>
					<Btn onClick={() => close("relocationReceiptModal")}>Close</Btn>
					<Btn icon="bi-clipboard" onClick={() => copyText("REL-20260901-8841", "Reference")}>
						Copy reference
					</Btn>
					<Btn
						primary
						icon="bi-download"
						onClick={() => toast.success("Receipt queued", "REL-20260901-8841.pdf")}
					>
						Download PDF
					</Btn>
				</>
			}
		>
			<div className={s.receipt}>
				<div className={s.receiptIcon}>
					<i className="bi bi-check-lg" />
				</div>
				<div style={{ fontWeight: 700, fontSize: 22, color: "var(--pri-700)" }}>{kes(relocateAmount)}</div>
				<div style={{ fontSize: 12, color: "var(--ink-500)" }}>
					{selectedLinkAccount} → Primary PayMo Wallet
				</div>
				<hr style={{ border: 0, borderTop: "1px dashed var(--border)", margin: "12px 0" }} />
				<ReviewRow label="Reference" value="REL-20260901-8841" />
				<ReviewRow label="Date" value="1 Sep 2026, 09:22 EAT" />
				<ReviewRow label="Platform fee" value="KES 0" />
				<ReviewRow label="Network fee" value={kes(fee)} />
				<ReviewRow label="Net received" value={kes(net)} highlight />
				<ReviewRow label="Rail" value="PayMo Internal Ledger" />
				<ReviewRow label="Destination saved" value={saveDest ? "Yes" : "No"} />
				<div style={{ marginTop: 12 }}>
					<i className="bi bi-qr-code" style={{ fontSize: 44 }} />
				</div>
			</div>
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
				<Btn sm icon="bi-share" onClick={() => toast.success("Share sheet opened", "REL-20260901-8841")}>
					Share
				</Btn>
				<Btn sm icon="bi-printer" onClick={() => toast.info("Print dialog", "Use your browser print.")}>
					Print
				</Btn>
				<Btn sm onClick={() => jump("relocationReceiptModal", "activeLinksModal")}>
					Back to links
				</Btn>
			</div>
		</ModalShell>
	);

	/* ================= Support ================= */
	const supportHelpModal = (
		<ModalShell
			show={isOpen("supportHelpModal")}
			onClose={() => {
				setSupportView("home");
				close("supportHelpModal");
			}}
			iconCls="bi bi-question-circle"
			title="Support & help"
			size="lg"
			footer={
				<>
					{supportView !== "home" ? (
						<Btn onClick={() => setSupportView("home")}>Back to help</Btn>
					) : (
						<Btn onClick={() => close("supportHelpModal")}>Close</Btn>
					)}
					<Btn primary icon="bi-chat-dots" onClick={() => setSupportView("chat")}>
						Live chat
					</Btn>
				</>
			}
		>
			{supportView === "guide" ? (
				<div>
					<h3 style={{ marginTop: 0 }}>{GUIDES[guide].title}</h3>
					<p style={{ fontSize: 13, lineHeight: 1.6 }}>{GUIDES[guide].body}</p>
					<Btn sm onClick={() => jump("supportHelpModal", "tourGuideModal")}>
						Open the tour instead
					</Btn>
				</div>
			) : supportView === "chat" ? (
				<div>
					<div className={s.softBox} style={{ maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
						{chat.map((m, i) => (
							<div key={`${m.from}-${i}`} style={{ marginBottom: 10, textAlign: m.from === "you" ? "right" : "left" }}>
								<span style={{ fontSize: 11, color: "var(--ink-500)" }}>{m.from === "you" ? "You" : "Nia"}</span>
								<div style={{ fontSize: 13 }}>{m.text}</div>
							</div>
						))}
					</div>
					<Label htmlFor="chat-draft">Message</Label>
					<textarea
						id="chat-draft"
						className={s.formControl}
						rows={3}
						value={chatDraft}
						onChange={(e) => setChatDraft(e.target.value)}
					/>
					<div style={{ marginTop: 8 }}>
						<Btn primary icon="bi-send" onClick={sendChat}>
							Send
						</Btn>
					</div>
				</div>
			) : supportView === "report" ? (
				<div>
					<Select
						id="report-reason"
						label="What happened?"
						value={reportReason}
						onChange={setReportReason}
						options={[
							"Suspicious inbound hop",
							"Unauthorised unlink",
							"Device I don’t recognise",
							"Phishing SMS",
						]}
					/>
					<Label htmlFor="report-detail">Details</Label>
					<textarea
						id="report-detail"
						className={s.formControl}
						rows={4}
						value={reportDetail}
						onChange={(e) => setReportDetail(e.target.value)}
					/>
					<div style={{ marginTop: 10 }}>
						<Btn
							danger
							onClick={() => {
								if (!reportDetail.trim()) {
									toast.warning("Add detail", "Tell us what you saw.");
									return;
								}
								toast.success("Report filed", "FRD-20260901-19 is with compliance.");
								setSupportView("home");
								setReportDetail("");
							}}
						>
							Submit report
						</Btn>
					</div>
				</div>
			) : supportView === "email" ? (
				<div>
					<Field id="email-subject" label="Subject" value={emailSubject} onChange={setEmailSubject} />
					<Label htmlFor="email-body">Message</Label>
					<textarea
						id="email-body"
						className={s.formControl}
						rows={5}
						value={emailBody}
						onChange={(e) => setEmailBody(e.target.value)}
					/>
					<div style={{ marginTop: 10 }}>
						<Btn
							primary
							onClick={() => {
								if (!emailBody.trim()) {
									toast.warning("Write a message");
									return;
								}
								toast.success("Email queued", emailSubject);
								setSupportView("home");
								setEmailBody("");
							}}
						>
							Send to support@paymo.ke
						</Btn>
					</div>
				</div>
			) : (
				<div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
						<div className={s.softBox}>
							<div className={s.softLabel}>Guides</div>
							{GUIDES.map((g, i) => (
								<button
									key={g.title}
									type="button"
									onClick={() => {
										setGuide(i);
										setSupportView("guide");
									}}
									style={{
										width: "100%",
										display: "flex",
										alignItems: "center",
										gap: 10,
										padding: "8px 0",
										background: "transparent",
										border: 0,
										borderBottom: "1px dashed var(--border)",
										cursor: "pointer",
										textAlign: "left",
										fontFamily: "inherit",
									}}
								>
									<i className={`bi ${g.icon}`} style={{ color: "var(--info)" }} />
									<span style={{ flex: 1 }}>
										<strong style={{ display: "block", fontSize: 12 }}>{g.title}</strong>
										<span style={{ fontSize: 11, color: "var(--ink-500)" }}>{g.desc}</span>
									</span>
									<i className="bi bi-chevron-right" />
								</button>
							))}
						</div>
						<div className={s.softBox}>
							<div className={s.softLabel}>Contact</div>
							<div className={s.summaryRow}>
								<span>Live chat</span>
								<Btn sm onClick={() => setSupportView("chat")}>Start</Btn>
							</div>
							<div className={s.summaryRow}>
								<span>Emergency hotline</span>
								<Btn sm onClick={() => copyText("0800720720", "Hotline")}>
									0800 720 720
								</Btn>
							</div>
							<div className={s.summaryRow}>
								<span>Suspicious activity</span>
								<Btn sm danger onClick={() => setSupportView("report")}>
									Report
								</Btn>
							</div>
							<div className={s.summaryRow}>
								<span>Email support</span>
								<Btn sm onClick={() => setSupportView("email")}>
									Compose
								</Btn>
							</div>
						</div>
					</div>
				<div style={{ marginTop: 16 }}>
					<div className={s.softLabel}>FAQ</div>
					<div className={s.softBox}>
						{FAQ.map((f, i) => (
							<div key={f.q} style={{ borderBottom: i < FAQ.length - 1 ? "1px dashed var(--border)" : "none" }}>
								<button
									type="button"
									onClick={() => setSupportFaq(supportFaq === i ? null : i)}
									style={{
										width: "100%",
										display: "flex",
										justifyContent: "space-between",
										gap: 12,
										padding: "12px 4px",
										background: "transparent",
										border: 0,
										cursor: "pointer",
										textAlign: "left",
										fontWeight: 600,
										fontSize: 13,
									}}
								>
									{f.q}
									<i className={`bi ${supportFaq === i ? "bi-chevron-up" : "bi-chevron-down"}`} />
								</button>
								{supportFaq === i ? (
									<p style={{ fontSize: 12, color: "var(--ink-700)", padding: "0 4px 12px", margin: 0 }}>
										{f.a}
									</p>
								) : null}
							</div>
						))}
					</div>
				</div>
				</div>
			)}
		</ModalShell>
	);

	/* ================= Limits ================= */
	const pct = (used: number, cap: number) => Math.min(100, Math.round((used / Math.max(cap, 1)) * 100));
	const linkLimitsModal = (
		<SimpleModal
			show={isOpen("linkLimitsModal")}
			onClose={() => close("linkLimitsModal")}
			iconCls="bi bi-speedometer2"
			title="Cross-dashboard limits"
			size="lg"
			submitLabel="Save caps"
			successMsg="Limits updated"
			onSubmit={() => toast.success("Caps saved", `Inbound ${kes(capIn)} · outbound ${kes(capOut)}`)}
		>
			{[
				{ label: "Daily inbound", used: usedIn, cap: capIn, set: setCapIn },
				{ label: "Daily outbound", used: usedOut, cap: capOut, set: setCapOut },
				{ label: "Per-transaction max", used: 220_000, cap: capTx, set: setCapTx },
				{ label: "Monthly cumulative", used: usedMonth, cap: capMonth, set: setCapMonth },
			].map((row) => (
				<div key={row.label} style={{ marginBottom: 14 }}>
					<div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
						<strong>{row.label}</strong>
						<span>
							{kes(row.used)} / {kes(row.cap)}
						</span>
					</div>
					<div className={s.progressTrack}>
						<div className={s.progressBar} style={{ width: `${pct(row.used, row.cap)}%` }} />
					</div>
					<input
						type="range"
						min={100000}
						max={20000000}
						step={50000}
						value={row.cap}
						aria-label={row.label}
						onChange={(e) => row.set(Number(e.target.value))}
						style={{ width: "100%", marginTop: 6 }}
					/>
				</div>
			))}
			<div style={{ marginBottom: 12 }}>
				<strong style={{ fontSize: 13 }}>Velocity</strong>
				<div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
					<input
						type="range"
						min={5}
						max={200}
						value={capVel}
						aria-label="Velocity limit"
						onChange={(e) => setCapVel(Number(e.target.value))}
						style={{ flex: 1 }}
					/>
					<span>{capVel} tx / hour</span>
				</div>
			</div>
			<InfoBox variant="warning">
				<i className="bi bi-arrow-up-circle" /> Limit increases need a justification.
				Processing is 2–3 business days.
			</InfoBox>
			<div style={{ marginTop: 12 }}>
				<Btn icon="bi-arrow-up" onClick={() => setRequestOpen((v) => !v)}>
					{requestOpen ? "Hide request" : "Request limit increase"}
				</Btn>
			</div>
			{requestOpen ? (
				<div className={s.softBox} style={{ marginTop: 12 }}>
					<Select
						id="req-which"
						label="Which cap?"
						value={requestWhich}
						onChange={setRequestWhich}
						options={["Daily inbound", "Daily outbound", "Per-transaction", "Monthly"]}
					/>
					<Field id="req-to" label="Requested cap (KES)" type="number" value={requestTo} onChange={setRequestTo} />
					<Label htmlFor="req-why">Justification</Label>
					<textarea
						id="req-why"
						className={s.formControl}
						rows={3}
						value={requestWhy}
						onChange={(e) => setRequestWhy(e.target.value)}
					/>
					<div style={{ marginTop: 8 }}>
						<Btn
							primary
							onClick={() => {
								if (!requestWhy.trim()) {
									toast.warning("Add a justification");
									return;
								}
								toast.success("Request LIM-20260901-07 filed", `${requestWhich} → ${kes(Number(requestTo) || 0)}`);
								setRequestOpen(false);
								setRequestWhy("");
							}}
						>
							Submit to compliance
						</Btn>
					</div>
				</div>
			) : null}
		</SimpleModal>
	);

	/* ================= Privacy ================= */
	const privacyModal = (
		<SimpleModal
			show={isOpen("privacyModal")}
			onClose={() => close("privacyModal")}
			iconCls="bi bi-lock"
			title="Cross-dashboard data consent"
			size="lg"
			submitLabel="Save consent"
			successMsg="Privacy preferences saved"
			onSubmit={() => toast.success("Consent saved")}
		>
			<Toggle
				checked={privacy.visibility}
				onChange={(v) => setPrivacy((p) => ({ ...p, visibility: v }))}
				label="Cross-dashboard balance visibility"
				description="Allow dashboards to see balances of linked accounts"
			/>
			<Toggle
				checked={privacy.statements}
				onChange={(v) => setPrivacy((p) => ({ ...p, statements: v }))}
				label="Consolidated statements"
				description="Combine hops from all linked accounts"
			/>
			<Toggle
				checked={privacy.bureaus}
				onChange={(v) => setPrivacy((p) => ({ ...p, bureaus: v }))}
				label="Share data with credit bureaus"
				description="Report on-time cross-dashboard payments"
			/>
			<Toggle
				checked={privacy.marketing}
				onChange={(v) => setPrivacy((p) => ({ ...p, marketing: v }))}
				label="Partner marketing"
				description="Relevant offers from vetted partners"
			/>
			<Toggle
				checked={privacy.analytics}
				onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))}
				label="Anonymized product analytics"
				description="Help improve PayMo dashboards"
			/>
			<div style={{ marginTop: 12 }}>
				<InfoBox variant="info">
					<i className="bi bi-file-earmark-lock" /> Consent expiry: 11 July 2027.
					Renew or revoke any item from this panel.
				</InfoBox>
			</div>
		</SimpleModal>
	);

	/* ================= Preferences ================= */
	const preferencesModal = (
		<TabbedModal
			show={isOpen("preferencesModal")}
			onClose={() => close("preferencesModal")}
			iconCls="bi bi-gear"
			title="Activation preferences"
			tabs={[
				{
					key: "defaults",
					label: "Defaults",
					render: () => (
						<div>
							<Select
								id="pref-dash"
								label="Default dashboard after login"
								value={prefs.defaultDash}
								onChange={(v) => setPrefs((p) => ({ ...p, defaultDash: v }))}
								options={["Transaction Hub", "Business Portal", "Utilities Hub", "Savings & Investments"]}
							/>
							<Select
								id="pref-pin"
								label="Activation PIN length"
								value={prefs.pinLength}
								onChange={(v) => setPrefs((p) => ({ ...p, pinLength: v }))}
								options={["4 digits", "6 digits"]}
							/>
							<Toggle
								checked={prefs.bio}
								onChange={(v) => setPrefs((p) => ({ ...p, bio: v }))}
								label="Require biometric for activation"
								description="Add fingerprint / Face ID to the PIN gate"
							/>
							<Toggle
								checked={prefs.autoTour}
								onChange={(v) => setPrefs((p) => ({ ...p, autoTour: v }))}
								label="Auto-start tour on first activation"
								description="Launch the tour after the first dashboard is activated"
							/>
						</div>
					),
				},
				{
					key: "notifications",
					label: "Notifications",
					render: () => (
						<div>
							<Toggle
								checked={prefs.actConfirm}
								onChange={(v) => setPrefs((p) => ({ ...p, actConfirm: v }))}
								label="Activation confirmations"
								description="Confirm each successful dashboard activation"
							/>
							<Toggle
								checked={prefs.linkAlert}
								onChange={(v) => setPrefs((p) => ({ ...p, linkAlert: v }))}
								label="Link & unlink alerts"
								description="Notify on every link or unlink event"
							/>
							<Toggle
								checked={prefs.consentRemind}
								onChange={(v) => setPrefs((p) => ({ ...p, consentRemind: v }))}
								label="Consent expiry reminders"
								description="Remind 30 / 14 / 7 days before expiry"
							/>
							<Toggle
								checked={prefs.promo}
								onChange={(v) => setPrefs((p) => ({ ...p, promo: v }))}
								label="Promotional announcements"
								description="Product updates and feature launches"
							/>
						</div>
					),
				},
				{
					key: "tour",
					label: "Tour",
					render: () => (
						<div>
							<Toggle
								checked={prefs.hotspots}
								onChange={(v) => setPrefs((p) => ({ ...p, hotspots: v }))}
								label="Show tour hotspots"
								description="Highlight key sections while exploring"
							/>
							<Toggle
								checked={prefs.remindLater}
								onChange={(v) => setPrefs((p) => ({ ...p, remindLater: v }))}
								label="Remind me later option"
								description="Allow skipping the tour and being reminded later"
							/>
							<div style={{ marginTop: 12 }}>
								<Btn icon="bi-play-circle" onClick={() => jump("preferencesModal", "tourGuideModal")}>
									Replay tour now
								</Btn>
							</div>
						</div>
					),
				},
			]}
			footer={
				<>
					<Btn onClick={() => close("preferencesModal")}>Cancel</Btn>
					<Btn
						primary
						onClick={() => {
							close("preferencesModal");
							toast.success("Preferences saved", `Landing on ${prefs.defaultDash}`);
						}}
					>
						Save preferences
					</Btn>
				</>
			}
		/>
	);

	return (
		<>
			{activateDashboardModal}
			{activationSuccessModal}
			{tourGuideModal}
			{linkAccountModal}
			{linkPermissionsModal}
			{linkNotificationsModal}
			{activeLinksModal}
			{linkFlowControlModal}
			{unlinkAccountModal}
			{relinkAccountModal}
			{revokeAllAccessModal}
			{moneyRelocationModal}
			{relocationReceiptModal}
			{supportHelpModal}
			{linkLimitsModal}
			{privacyModal}
			{preferencesModal}
		</>
	);
}
