/* ============================================================================
 * Login.tsx — Paymo BAAS · Sign in
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language (white cards on #f2f4f8,
 * emerald primary, navy brand rail) via ../components/AuthKit.
 *
 * Trimmed from the legacy 1,296-line screen: the marketing copy, duplicated
 * security strips and footer link farms are gone. What remains is the complete
 * interaction set — passkey, password, PIN pad, magic link, social SSO,
 * device fingerprint, smart default tab, remembered account — plus new
 * toasts, a help dialog and a switch-account confirmation.
 *
 * Routes/links preserved: /auth/register · /auth/recovery · /auth/passkeys ·
 * /auth/account-status · /auth/mfa · /auth/hub
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import {
	AuthPage,
	AuthSplit,
	Badge,
	Button,
	Card,
	Check,
	cx,
	Field,
	go,
	Input,
	Modal,
	Notice,
	OptionCard,
	PasswordInput,
	PinPad,
	SegTabs,
	s,
	toast,
	useCountdown,
	useDeviceLabel,
} from "../components/AuthKit";

type TabId = "passkey" | "password" | "pin" | "magic" | "social";

const TABS = [
	{
		id: "passkey" as const,
		label: "Passkey",
		icon: "bi-fingerprint",
		dot: true,
	},
	{ id: "password" as const, label: "Password", icon: "bi-lock" },
	{ id: "pin" as const, label: "PIN", icon: "bi-grid-3x3-gap" },
	{ id: "magic" as const, label: "Magic link", icon: "bi-magic" },
	{ id: "social" as const, label: "Social", icon: "bi-people" },
];

const SOCIALS = [
	{ id: "Google", icon: "bi-google" },
	{ id: "Apple", icon: "bi-apple" },
	{ id: "Microsoft", icon: "bi-microsoft" },
	{ id: "LinkedIn", icon: "bi-linkedin" },
];

const RAIL = {
	pill: "Secured by Paymo Shield",
	title: "One login.",
	accent: "Your entire financial world.",
	copy: "Payments, banking, FX, treasury and compliance behind a single verified identity.",
	features: [
		{
			icon: "bi-fingerprint",
			title: "Passkey-first",
			sub: "Face ID, Touch ID or Windows Hello",
		},
		{
			icon: "bi-shield-lock",
			title: "Zero-knowledge",
			sub: "Credentials are never stored in plain text",
		},
		{
			icon: "bi-graph-up-arrow",
			title: "Risk-based step-up",
			sub: "Extra checks only when something looks off",
		},
	],
	stats: [
		{ value: "2M+", label: "Accounts" },
		{ value: "99.99%", label: "Uptime" },
		{ value: "<2s", label: "Avg sign-in" },
	],
	trust: ["PCI DSS L1", "SOC 2 Type II", "ISO 27001"],
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const validId = (v: string) =>
	EMAIL_RE.test(v.trim()) || PHONE_RE.test(v.replace(/\s/g, ""));

export default function Login() {
	const device = useDeviceLabel();
	const [tab, setTab] = useState<TabId>("passkey");
	const [name, setName] = useState<string | null>(null);
	const [helpOpen, setHelpOpen] = useState(false);
	const [switchOpen, setSwitchOpen] = useState(false);

	/* passkey */
	const [passkeySupported, setPasskeySupported] = useState(true);
	const [passkeyState, setPasskeyState] = useState<
		"idle" | "scanning" | "done"
	>("idle");

	/* password */
	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [remember, setRemember] = useState(true);
	const [pwState, setPwState] = useState<"idle" | "busy">("idle");

	/* pin */
	const [pin, setPin] = useState("");
	const [pinBad, setPinBad] = useState(false);

	/* magic */
	const [magicMail, setMagicMail] = useState("");
	const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
	const [magicBusy, setMagicBusy] = useState(false);
	const [cooldown, setCooldown] = useCountdown(0);

	/* social */
	const [connecting, setConnecting] = useState<string | null>(null);

	const timers = useRef<number[]>([]);
	const later = useCallback((fn: () => void, ms: number) => {
		timers.current.push(window.setTimeout(fn, ms));
	}, []);

	useEffect(() => {
		setPasskeySupported(!!window.PublicKeyCredential);
		try {
			const last = localStorage.getItem("paymo_last_auth") as TabId | null;
			if (last && TABS.some((t) => t.id === last)) setTab(last);
			else if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) setTab("pin");
			const saved = localStorage.getItem("paymo_user_name");
			if (saved) setName(saved);
		} catch {
			/* private mode */
		}
		const t = timers.current;
		return () => {
			t.forEach(window.clearTimeout);
		};
	}, []);

	const pickTab = (id: TabId) => {
		setTab(id);
		try {
			localStorage.setItem("paymo_last_auth", id);
		} catch {
			/* noop */
		}
	};

	const remember_ = (who: string) => {
		try {
			localStorage.setItem("paymo_user_name", who);
		} catch {
			/* noop */
		}
		setName(who);
	};

	/* ---------------- flows ---------------- */
	const runPasskey = () => {
		if (passkeyState === "scanning") return;
		setPasskeyState("scanning");
		toast.info(
			"Waiting for your authenticator",
			"Touch the sensor or follow the device prompt.",
		);
		later(() => {
			setPasskeyState("done");
			remember_("Amara");
			toast.success("Passkey verified", "Taking you to your dashboard hub…");
			later(() => go("/auth/hub"), 700);
		}, 1900);
	};

	const emailOk = email.length === 0 ? undefined : validId(email);
	const canSubmitPw = emailOk === true && pass.length >= 6;

	const submitPassword = () => {
		if (!canSubmitPw || pwState === "busy") return;
		setPwState("busy");
		later(() => {
			setPwState("idle");
			if (remember) remember_(email.split("@")[0]);
			toast.warning(
				"Step-up required",
				"Risk engine flagged a new network. Verify a second factor.",
			);
			later(() => go("/auth/mfa"), 600);
		}, 1200);
	};

	const verifyPin = (value: string) => {
		later(() => {
			if (value === "000000") {
				setPinBad(true);
				toast.danger(
					"Incorrect PIN",
					"2 attempts left before a temporary lock.",
				);
				later(() => {
					setPinBad(false);
					setPin("");
				}, 500);
				return;
			}
			remember_("Amara");
			toast.success("PIN verified", "Signing you in…");
			later(() => go("/auth/hub"), 500);
		}, 250);
	};

	const sendMagic = () => {
		if (!EMAIL_RE.test(magicMail.trim()) || magicBusy) return;
		setMagicBusy(true);
		later(() => {
			setMagicBusy(false);
			setMagicSentTo(magicMail);
			setCooldown(60);
			toast.success(
				"Magic link sent",
				`Check ${magicMail}. The link expires in 15 minutes.`,
			);
		}, 1100);
	};

	const runSocial = (id: string) => {
		if (connecting) return;
		setConnecting(id);
		toast.info(`Opening ${id}`, "Complete the consent screen to continue.");
		later(() => {
			toast.success(`${id} verified`, "Signing you in…");
			later(() => go("/auth/hub"), 500);
		}, 1500);
	};

	/* ---------------- render ---------------- */
	return (
		<AuthPage>
			<AuthSplit {...RAIL}>
				<div className={s.center}>
					<h1 className={s.title}>
						{name ? `Welcome back, ${name}` : "Welcome back"}
					</h1>
					<p className={s.subtitle}>Choose how you want to sign in.</p>
				</div>

				<div
					className={cx(s.row, s.center)}
					style={{ justifyContent: "center" }}
				>
					<span className={s.metaChip}>
						<i className="bi bi-laptop" /> {device}
					</span>
					<span className={s.metaChip}>
						<i className="bi bi-shield-check" style={{ color: "#12b76a" }} />{" "}
						Trusted network
					</span>
				</div>

				<SegTabs items={TABS} value={tab} onChange={pickTab} />

				<Card>
					{/* ---------- PASSKEY ---------- */}
					{tab === "passkey" && (
						<div className={s.center}>
							<div
								className={cx(
									s.bio,
									passkeyState === "scanning" && s.bioScan,
									passkeyState === "done" && s.bioDone,
								)}
							>
								<i
									className={
										passkeyState === "done"
											? "bi bi-check-lg"
											: "bi bi-fingerprint"
									}
								/>
							</div>
							<div
								className={cx(s.row, s.rowTight)}
								style={{ justifyContent: "center" }}
							>
								<span className={s.cardTitle}>Sign in with a passkey</span>
								<Badge tone="green" icon="bi-lightning-charge-fill">
									Fastest
								</Badge>
							</div>
							<p className={cx(s.tiny)} style={{ margin: "0.4rem 0 1rem" }}>
								No password needed — your device proves it&apos;s you.
							</p>
							<Button
								block
								size="lg"
								icon={passkeyState === "idle" ? "bi-fingerprint" : undefined}
								loading={passkeyState === "scanning"}
								disabled={!passkeySupported || passkeyState !== "idle"}
								onClick={runPasskey}
							>
								{passkeyState === "scanning"
									? "Waiting for authenticator…"
									: passkeyState === "done"
										? "Verified"
										: "Continue with passkey"}
							</Button>
							{!passkeySupported && (
								<div style={{ marginTop: "0.75rem" }}>
									<Notice tone="amber" icon="bi-exclamation-triangle">
										This browser doesn&apos;t support passkeys. Use password or
										PIN instead.
									</Notice>
								</div>
							)}
							<p className={s.tiny} style={{ marginTop: "0.9rem" }}>
								No passkey yet?{" "}
								<a className={s.link} href="/auth/passkeys">
									Set one up
								</a>
							</p>
						</div>
					)}

					{/* ---------- PASSWORD ---------- */}
					{tab === "password" && (
						<form
							className={s.stack}
							onSubmit={(e) => {
								e.preventDefault();
								submitPassword();
							}}
						>
							<Field
								label="Email or phone"
								htmlFor="lgEmail"
								tone={
									emailOk === undefined ? undefined : emailOk ? "ok" : "err"
								}
								hint={
									emailOk === undefined
										? undefined
										: emailOk
											? "Looks good"
											: "Enter a valid email or phone number"
								}
							>
								<Input
									id="lgEmail"
									placeholder="you@company.com"
									autoComplete="username"
									value={email}
									tone={
										emailOk === undefined ? undefined : emailOk ? "ok" : "err"
									}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Field>
							<Field label="Password" htmlFor="lgPass">
								<PasswordInput
									id="lgPass"
									value={pass}
									onChange={setPass}
									placeholder="Enter your password"
									autoComplete="current-password"
								/>
							</Field>
							<div className={s.spread}>
								<Check checked={remember} onChange={setRemember}>
									Remember this device
								</Check>
								<a
									className={s.link}
									href="/auth/recovery"
									style={{ fontSize: "0.78rem" }}
								>
									Forgot password?
								</a>
							</div>
							<Button
								type="submit"
								block
								size="lg"
								disabled={!canSubmitPw}
								loading={pwState === "busy"}
							>
								{pwState === "busy" ? "Verifying…" : "Sign in"}
							</Button>
						</form>
					)}

					{/* ---------- PIN ---------- */}
					{tab === "pin" && (
						<div>
							<div className={s.center} style={{ marginBottom: "0.9rem" }}>
								<span className={s.cardTitle}>Enter your 6-digit PIN</span>
								<p className={s.tiny} style={{ margin: "0.25rem 0 0" }}>
									Your keyboard works too.
								</p>
							</div>
							<PinPad
								value={pin}
								onChange={setPin}
								onComplete={verifyPin}
								invalid={pinBad}
								onBiometric={() =>
									passkeySupported
										? toast.info(
												"Biometric prompt sent",
												"Approve on this device to continue.",
											)
										: toast.warning(
												"Not available",
												"Biometrics aren't supported on this device.",
											)
								}
							/>
							<p
								className={cx(s.tiny, s.center)}
								style={{ marginTop: "0.9rem" }}
							>
								Forgot your PIN?{" "}
								<a className={s.link} href="/auth/recovery">
									Reset it
								</a>
							</p>
						</div>
					)}

					{/* ---------- MAGIC LINK ---------- */}
					{tab === "magic" &&
						(magicSentTo ? (
							<div className={s.center}>
								<div className={cx(s.bio, s.bioDone)}>
									<i className="bi bi-envelope-check" />
								</div>
								<span className={s.cardTitle}>Check your inbox</span>
								<p className={s.tiny} style={{ margin: "0.35rem 0 1rem" }}>
									We sent a one-tap sign-in link to <b>{magicSentTo}</b>. It
									expires in 15 minutes.
								</p>
								<div className={s.row} style={{ justifyContent: "center" }}>
									<Button
										variant="ghost"
										size="sm"
										disabled={cooldown > 0}
										onClick={() => {
											setCooldown(60);
											toast.success(
												"Link resent",
												`A fresh link is on its way to ${magicSentTo}.`,
											);
										}}
									>
										{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
									</Button>
									<Button
										variant="subtle"
										size="sm"
										onClick={() => setMagicSentTo(null)}
									>
										Use another email
									</Button>
								</div>
							</div>
						) : (
							<form
								className={s.stack}
								onSubmit={(e) => {
									e.preventDefault();
									sendMagic();
								}}
							>
								<Field label="Email address" htmlFor="lgMagic">
									<Input
										id="lgMagic"
										type="email"
										placeholder="you@company.com"
										value={magicMail}
										onChange={(e) => setMagicMail(e.target.value)}
									/>
								</Field>
								<Button
									type="submit"
									block
									size="lg"
									icon="bi-send"
									loading={magicBusy}
									disabled={!EMAIL_RE.test(magicMail.trim())}
								>
									{magicBusy ? "Sending…" : "Email me a sign-in link"}
								</Button>
							</form>
						))}

					{/* ---------- SOCIAL ---------- */}
					{tab === "social" && (
						<div className={s.stack}>
							{SOCIALS.map((p) => (
								<OptionCard
									key={p.id}
									icon={p.icon}
									tone="slate"
									title={`Continue with ${p.id}`}
									sub={
										connecting === p.id
											? "Opening secure consent screen…"
											: "Single sign-on"
									}
									selected={connecting === p.id}
									onClick={() => runSocial(p.id)}
								/>
							))}
							<p className={cx(s.tiny, s.center)} style={{ margin: 0 }}>
								SSO accounts still require MFA for treasury actions.
							</p>
						</div>
					)}
				</Card>

				<div className={s.spread}>
					<span className={s.tiny}>
						New to Paymo?{" "}
						<a className={s.link} href="/auth/register">
							Create an account
						</a>
					</span>
					<div className={cx(s.row, s.rowTight)}>
						<Button
							variant="subtle"
							size="sm"
							icon="bi-question-circle"
							onClick={() => setHelpOpen(true)}
						>
							Help
						</Button>
						{name && (
							<Button
								variant="subtle"
								size="sm"
								icon="bi-arrow-left-right"
								onClick={() => setSwitchOpen(true)}
							>
								Switch
							</Button>
						)}
					</div>
				</div>

				<div className={s.footNote}>
					<span>© 2026 Paymo Financial Technologies</span>
					<a className={s.link} href="/auth/account-status">
						Account status
					</a>
					<a className={s.link} href="/auth/security">
						Security centre
					</a>
				</div>
			</AuthSplit>

			{/* ---------------- Help dialog ---------------- */}
			<Modal
				open={helpOpen}
				onClose={() => setHelpOpen(false)}
				title="Trouble signing in?"
				sub="Pick the closest match — we'll route you to the right flow."
				icon="bi-life-preserver"
				footer={
					<Button variant="ghost" onClick={() => setHelpOpen(false)}>
						Close
					</Button>
				}
			>
				<div className={s.stack}>
					<OptionCard
						icon="bi-key"
						title="I forgot my password or PIN"
						sub="Reset with email, SMS or security questions"
						onClick={() => go("/auth/recovery")}
					/>
					<OptionCard
						icon="bi-phone-vibrate"
						tone="blue"
						title="I lost my 2FA device"
						sub="Use a recovery code or another factor"
						onClick={() => go("/auth/mfa")}
					/>
					<OptionCard
						icon="bi-lock"
						tone="amber"
						title="My account is restricted"
						sub="See what's blocked and how to restore access"
						onClick={() => go("/auth/account-status")}
					/>
					<OptionCard
						icon="bi-person-vcard"
						tone="violet"
						title="I need to verify my identity"
						sub="KYC / KYB and high-assurance recovery"
						onClick={() => go("/auth/identity")}
					/>
				</div>
			</Modal>

			{/* ---------------- Switch account dialog ---------------- */}
			<Modal
				open={switchOpen}
				onClose={() => setSwitchOpen(false)}
				title="Forget this account?"
				sub={
					name ? `Currently remembering “${name}” on this device.` : undefined
				}
				icon="bi-arrow-left-right"
				tone="amber"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setSwitchOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="danger"
							icon="bi-trash"
							onClick={() => {
								try {
									localStorage.removeItem("paymo_user_name");
								} catch {
									/* noop */
								}
								setName(null);
								setSwitchOpen(false);
								toast.success(
									"Account forgotten",
									"Sign in with a different Paymo identity.",
								);
							}}
						>
							Forget account
						</Button>
					</>
				}
			>
				Your saved sign-in preference and remembered name will be cleared from
				this browser. Active sessions elsewhere are not affected.
			</Modal>
		</AuthPage>
	);
}
