/* ============================================================================
 * Register.tsx — Paymo BAAS · Create account
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit.
 * The legacy 1,873-line marketing wizard is condensed into a focused 4-step
 * flow (Account type → Details → Verify → Secure) with a success state.
 *
 * Kept: account types, social sign-up, country/phone data, password strength,
 * email OTP verification, terms gate, per-type next steps + sandbox API key.
 * Added: live step progress, inline validation, toasts, terms dialog and a
 * "leave setup" confirmation.
 *
 * Routes/links preserved: /auth/login · /auth/hub · /auth/identity
 * ========================================================================== */

import { useMemo, useRef, useState } from "react";
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
	OtpInput,
	PasswordInput,
	Progress,
	Select,
	Stepper,
	s,
	toast,
	useCountdown,
} from "../components/AuthKit";

type AccountType = "personal" | "business" | "developer";

const TYPES: Array<{
	id: AccountType;
	icon: string;
	tone: "green" | "blue" | "violet";
	title: string;
	sub: string;
	badge?: string;
}> = [
	{
		id: "personal",
		icon: "bi-person",
		tone: "green",
		title: "Personal",
		sub: "Send money, pay bills and manage your wallet.",
	},
	{
		id: "business",
		icon: "bi-shop",
		tone: "blue",
		title: "Business",
		sub: "Collect payments, pay suppliers, run payroll.",
		badge: "Free setup",
	},
	{
		id: "developer",
		icon: "bi-code-slash",
		tone: "violet",
		title: "Developer",
		sub: "APIs, sandbox keys, webhooks and docs.",
		badge: "Free API credits",
	},
];

const STEP_LABELS: Record<AccountType, string[]> = {
	personal: ["Type", "Your details", "Verify", "Secure"],
	business: ["Type", "Business", "Verify", "Secure"],
	developer: ["Type", "Profile", "Verify", "Secure"],
};

const COUNTRIES = [
	{ v: "KE", l: "🇰🇪 Kenya (+254)" },
	{ v: "NG", l: "🇳🇬 Nigeria (+234)" },
	{ v: "GH", l: "🇬🇭 Ghana (+233)" },
	{ v: "ZA", l: "🇿🇦 South Africa (+27)" },
	{ v: "UG", l: "🇺🇬 Uganda (+256)" },
	{ v: "GB", l: "🇬🇧 United Kingdom (+44)" },
	{ v: "US", l: "🇺🇸 United States (+1)" },
];

const BUSINESS_TYPES = [
	"Sole Proprietorship",
	"Partnership",
	"LLC",
	"PLC",
	"NGO",
	"Cooperative",
];
const USE_CASES = [
	"Neobank",
	"E-commerce",
	"Remittance",
	"Lending",
	"Treasury",
	"Other",
];

const NEXT_STEPS: Record<
	AccountType,
	Array<{ icon: string; title: string; sub: string }>
> = {
	personal: [
		{
			icon: "bi-wallet2",
			title: "Fund your wallet",
			sub: "Bank, card or mobile money",
		},
		{
			icon: "bi-receipt",
			title: "Set up a bill",
			sub: "Electricity, airtime, subscriptions",
		},
	],
	business: [
		{
			icon: "bi-link-45deg",
			title: "Create a payment link",
			sub: "Start collecting in minutes",
		},
		{
			icon: "bi-person-plus",
			title: "Invite your team",
			sub: "Roles and approval limits",
		},
	],
	developer: [
		{
			icon: "bi-terminal",
			title: "Make your first API call",
			sub: "Sandbox is live already",
		},
		{
			icon: "bi-broadcast",
			title: "Register a webhook",
			sub: "Replay and debug events",
		},
	],
};

const SANDBOX_KEY = "pk_sandbox_3xK9mP2qR7vL8nW4hT6yB1cF";
const SOCIALS = [
	{ id: "Google", icon: "bi-google" },
	{ id: "Apple", icon: "bi-apple" },
	{ id: "Microsoft", icon: "bi-microsoft" },
];

function strengthOf(pw: string) {
	const checks = [
		pw.length >= 8,
		/[A-Z]/.test(pw),
		/\d/.test(pw),
		/[^A-Za-z0-9]/.test(pw),
	];
	return checks.filter(Boolean).length;
}

const STRENGTH_LABEL = ["Too short", "Weak", "Fair", "Strong", "Excellent"];
const STRENGTH_TONE = ["#f04438", "#f04438", "#f79009", "#12b76a", "#0b8f52"];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Register() {
	const [step, setStep] = useState(0); // 0..3, 4 = success
	const [type, setType] = useState<AccountType>("business");

	const [fullName, setFullName] = useState("");
	const [orgName, setOrgName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [country, setCountry] = useState("KE");
	const [extra, setExtra] = useState(BUSINESS_TYPES[2]);

	const [otp, setOtp] = useState("");
	const [otpBad, setOtpBad] = useState(false);
	const [cooldown, setCooldown] = useCountdown(0);

	const [password, setPassword] = useState("");
	const [terms, setTerms] = useState(false);
	const [enrolPasskey, setEnrolPasskey] = useState(true);
	const [busy, setBusy] = useState(false);

	const [termsOpen, setTermsOpen] = useState(false);
	const [leaveOpen, setLeaveOpen] = useState(false);

	const timers = useRef<number[]>([]);
	const later = (fn: () => void, ms: number) => {
		timers.current.push(window.setTimeout(fn, ms));
	};

	const steps = useMemo(
		() =>
			STEP_LABELS[type].map((label, i) => ({
				label,
				icon: [
					"bi-grid",
					"bi-person-lines-fill",
					"bi-envelope-check",
					"bi-shield-lock",
				][i],
			})),
		[type],
	);

	const emailOk = email.length === 0 ? undefined : EMAIL_RE.test(email.trim());
	const nameOk =
		type === "business"
			? orgName.trim().length > 1
			: fullName.trim().length > 1;
	const detailsOk =
		nameOk && emailOk === true && phone.replace(/\D/g, "").length >= 7;
	const strength = strengthOf(password);

	const sendCode = () => {
		setCooldown(45);
		toast.success(
			"Verification code sent",
			`We emailed a 6-digit code to ${email}.`,
		);
	};

	const next = () => {
		if (step === 0) {
			setStep(1);
			return;
		}
		if (step === 1) {
			if (!detailsOk) {
				toast.warning(
					"Missing details",
					"Fill in the highlighted fields to continue.",
				);
				return;
			}
			setStep(2);
			sendCode();
			return;
		}
		if (step === 2) {
			if (otp.length < 6) {
				toast.warning(
					"Enter the 6-digit code",
					"Check your inbox — codes expire in 10 minutes.",
				);
				return;
			}
			if (otp === "000000") {
				setOtpBad(true);
				later(() => setOtpBad(false), 500);
				toast.danger(
					"Invalid code",
					"That code doesn't match. Request a new one if needed.",
				);
				return;
			}
			toast.success("Email verified", "One last step — secure your account.");
			setStep(3);
			return;
		}
		if (step === 3) {
			if (strength < 3) {
				toast.warning(
					"Password too weak",
					"Use 8+ characters with a capital, number and symbol.",
				);
				return;
			}
			if (!terms) {
				toast.warning(
					"Accept the terms",
					"You need to agree before we can create the account.",
				);
				return;
			}
			setBusy(true);
			later(() => {
				setBusy(false);
				setStep(4);
				toast.success("Account created 🎉", `Your ${type} account is ready.`);
				if (enrolPasskey) {
					later(
						() =>
							toast.info(
								"Add a passkey",
								"Skip passwords next time — takes about 10 seconds.",
								{
									action: {
										label: "Set up passkey",
										onClick: () => go("/auth/passkeys"),
									},
									duration: 7000,
								},
							),
						1200,
					);
				}
			}, 1400);
		}
	};

	const back = () => {
		if (step === 0) {
			setLeaveOpen(true);
			return;
		}
		setStep((v) => Math.max(0, v - 1));
	};

	/* -------------------------------------------------------------- success */
	if (step === 4) {
		return (
			<AuthPage>
				<AuthSplit
					pill="Welcome aboard"
					title="You're in."
					accent="Let's move your first shilling."
					copy="Your Paymo identity is live. Finish these two nudges and you're fully operational."
					features={NEXT_STEPS[type].map((n) => ({
						icon: n.icon,
						title: n.title,
						sub: n.sub,
					}))}
					trust={["PCI DSS L1", "SOC 2 Type II"]}
				>
					<Card>
						<div className={s.center}>
							<div className={cx(s.bio, s.bioDone)}>
								<i className="bi bi-check-lg" />
							</div>
							<h1 className={s.title}>Account created</h1>
							<p className={s.subtitle}>
								{type === "business" ? orgName : fullName || "Your account"} ·{" "}
								{type} tier
							</p>
						</div>

						<div className={s.stack} style={{ marginTop: "1.1rem" }}>
							{NEXT_STEPS[type].map((n) => (
								<div className={s.listRow} key={n.title}>
									<span className={cx(s.tile, s.tileSm, s.tileGreen)}>
										<i className={`bi ${n.icon}`} />
									</span>
									<span className={s.grow}>
										<span className={s.optionTitle}>{n.title}</span>
										<span className={s.optionSub} style={{ display: "block" }}>
											{n.sub}
										</span>
									</span>
									<i
										className="bi bi-chevron-right"
										style={{ color: "#98a2b3" }}
									/>
								</div>
							))}

							{type === "developer" && (
								<Notice tone="blue" icon="bi-key">
									<div className={s.spread}>
										<span className={s.mono}>{SANDBOX_KEY}</span>
										<Button
											size="sm"
											variant="ghost"
											icon="bi-clipboard"
											onClick={() => {
												navigator.clipboard?.writeText(SANDBOX_KEY);
												toast.success(
													"Sandbox key copied",
													"Never commit keys to source control.",
												);
											}}
										>
											Copy
										</Button>
									</div>
								</Notice>
							)}

							<Button
								block
								size="lg"
								icon="bi-grid-1x2"
								onClick={() => go("/auth/hub")}
							>
								Go to dashboard hub
							</Button>
							<Button
								block
								variant="ghost"
								icon="bi-person-vcard"
								onClick={() => go("/auth/identity")}
							>
								Raise limits with identity verification
							</Button>
						</div>
					</Card>
				</AuthSplit>
			</AuthPage>
		);
	}

	/* --------------------------------------------------------------- wizard */
	return (
		<AuthPage>
			<AuthSplit
				pill="Free to join · 2-minute setup"
				title="Your financial world,"
				accent="unified."
				copy="One account for payments, banking, FX and compliance across 25+ markets."
				features={[
					{
						icon: "bi-shield-lock",
						title: "Bank-grade security",
						sub: "256-bit encryption · PCI DSS L1",
					},
					{
						icon: "bi-lightning-charge",
						title: "Instant onboarding",
						sub: "No paperwork, no branch visits",
					},
					{
						icon: "bi-globe-africa",
						title: "25+ markets",
						sub: "40+ currencies, one balance",
					},
				]}
				stats={[
					{ value: "2M+", label: "Users" },
					{ value: "99.9%", label: "Uptime" },
					{ value: "Free", label: "To join" },
				]}
				trust={["PCI DSS L1", "SOC 2 Type II"]}
			>
				<div className={s.center}>
					<h1 className={s.title}>Create your Paymo account</h1>
					<p className={s.subtitle}>Step {step + 1} of 4 · about 2 minutes</p>
				</div>

				<Card>
					<Stepper steps={steps} current={step} />
					<div style={{ margin: "0.9rem 0 1.1rem" }}>
						<Progress value={((step + 1) / 4) * 100} sm />
					</div>

					{/* -------- STEP 0 · type -------- */}
					{step === 0 && (
						<div className={s.stack}>
							{TYPES.map((t) => (
								<OptionCard
									key={t.id}
									icon={t.icon}
									tone={t.tone}
									title={t.title}
									sub={t.sub}
									selected={type === t.id}
									badge={
										t.badge ? <Badge tone={t.tone}>{t.badge}</Badge> : undefined
									}
									onClick={() => setType(t.id)}
								/>
							))}
							<div className={s.dividerText}>or sign up with</div>
							<div className={s.row} style={{ justifyContent: "center" }}>
								{SOCIALS.map((p) => (
									<Button
										key={p.id}
										variant="ghost"
										icon={p.icon}
										onClick={() =>
											toast.info(
												`Opening ${p.id}`,
												"You'll come straight back to finish setup.",
											)
										}
									>
										{p.id}
									</Button>
								))}
							</div>
						</div>
					)}

					{/* -------- STEP 1 · details -------- */}
					{step === 1 && (
						<div className={s.stack}>
							{type === "business" ? (
								<>
									<Field label="Registered business name" htmlFor="rgOrg">
										<Input
											id="rgOrg"
											placeholder="TS Retail Ltd"
											value={orgName}
											onChange={(e) => setOrgName(e.target.value)}
										/>
									</Field>
									<Field label="Business type" htmlFor="rgBType">
										<Select
											id="rgBType"
											value={extra}
											onChange={(e) => setExtra(e.target.value)}
										>
											{BUSINESS_TYPES.map((b) => (
												<option key={b}>{b}</option>
											))}
										</Select>
									</Field>
								</>
							) : (
								<>
									<Field label="Full name" htmlFor="rgName">
										<Input
											id="rgName"
											placeholder="Amara Okafor"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
										/>
									</Field>
									{type === "developer" && (
										<Field label="Primary use case" htmlFor="rgUse">
											<Select
												id="rgUse"
												value={extra}
												onChange={(e) => setExtra(e.target.value)}
											>
												{USE_CASES.map((u) => (
													<option key={u}>{u}</option>
												))}
											</Select>
										</Field>
									)}
								</>
							)}

							<Field
								label="Work email"
								htmlFor="rgEmail"
								tone={
									emailOk === undefined ? undefined : emailOk ? "ok" : "err"
								}
								hint={
									emailOk === false ? "Enter a valid email address" : undefined
								}
							>
								<Input
									id="rgEmail"
									type="email"
									placeholder="you@company.com"
									value={email}
									tone={
										emailOk === undefined ? undefined : emailOk ? "ok" : "err"
									}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Field>

							<div className={s.row} style={{ alignItems: "flex-end" }}>
								<div style={{ flex: "0 0 44%" }}>
									<Field label="Country" htmlFor="rgCountry">
										<Select
											id="rgCountry"
											value={country}
											onChange={(e) => setCountry(e.target.value)}
										>
											{COUNTRIES.map((c) => (
												<option key={c.v} value={c.v}>
													{c.l}
												</option>
											))}
										</Select>
									</Field>
								</div>
								<div className={s.grow}>
									<Field label="Mobile number" htmlFor="rgPhone">
										<Input
											id="rgPhone"
											inputMode="tel"
											placeholder="712 345 678"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
										/>
									</Field>
								</div>
							</div>
						</div>
					)}

					{/* -------- STEP 2 · verify -------- */}
					{step === 2 && (
						<div className={s.stack}>
							<div className={s.center}>
								<span
									className={cx(s.tile, s.tileLg, s.tileGreen)}
									style={{ margin: "0 auto 0.7rem" }}
								>
									<i className="bi bi-envelope-check" />
								</span>
								<div className={s.cardTitle}>Confirm your email</div>
								<p className={s.tiny} style={{ margin: "0.3rem 0 0" }}>
									Enter the 6-digit code sent to <b>{email}</b>
								</p>
							</div>
							<OtpInput
								value={otp}
								onChange={setOtp}
								invalid={otpBad}
								onComplete={() => next()}
							/>
							<div className={s.row} style={{ justifyContent: "center" }}>
								<Button
									variant="subtle"
									size="sm"
									disabled={cooldown > 0}
									onClick={sendCode}
									icon="bi-arrow-clockwise"
								>
									{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
								</Button>
								<Button
									variant="subtle"
									size="sm"
									onClick={() => setStep(1)}
									icon="bi-pencil"
								>
									Change email
								</Button>
							</div>
						</div>
					)}

					{/* -------- STEP 3 · secure -------- */}
					{step === 3 && (
						<div className={s.stack}>
							<Field label="Create a password" htmlFor="rgPw">
								<PasswordInput
									id="rgPw"
									value={password}
									onChange={setPassword}
									placeholder="8+ characters"
									autoComplete="new-password"
								/>
							</Field>
							<div>
								<div className={s.progress}>
									<div
										className={s.progressBar}
										style={{
											width: `${(strength / 4) * 100}%`,
											background: STRENGTH_TONE[strength],
										}}
									/>
								</div>
								<div
									className={s.hint}
									style={{ justifyContent: "space-between" }}
								>
									<span>Uppercase · number · symbol · 8 characters</span>
									<b style={{ color: STRENGTH_TONE[strength] }}>
										{STRENGTH_LABEL[strength]}
									</b>
								</div>
							</div>

							<div className={s.listRow}>
								<span className={cx(s.tile, s.tileSm, s.tileGreen)}>
									<i className="bi bi-fingerprint" />
								</span>
								<span className={s.grow}>
									<span className={s.optionTitle}>
										Add a passkey after setup
									</span>
									<span className={s.optionSub} style={{ display: "block" }}>
										Recommended — phishing-resistant and 3× faster
									</span>
								</span>
								<Check checked={enrolPasskey} onChange={setEnrolPasskey}>
									<span className={s.srOnly}>Enrol passkey</span>
								</Check>
							</div>

							<Check checked={terms} onChange={setTerms}>
								I agree to the{" "}
								<button
									type="button"
									className={s.link}
									onClick={() => setTermsOpen(true)}
								>
									Terms &amp; Privacy Policy
								</button>
							</Check>
						</div>
					)}

					<div className={s.spread} style={{ marginTop: "1.2rem" }}>
						<Button variant="subtle" icon="bi-arrow-left" onClick={back}>
							{step === 0 ? "Cancel" : "Back"}
						</Button>
						<Button
							loading={busy}
							onClick={next}
							icon={step === 3 ? "bi-check-lg" : undefined}
						>
							{step === 3
								? busy
									? "Creating account…"
									: "Create account"
								: "Continue"}
						</Button>
					</div>
				</Card>

				<p className={cx(s.tiny, s.center)}>
					Already have an account?{" "}
					<a className={s.link} href="/auth/login">
						Sign in
					</a>
				</p>
			</AuthSplit>

			<Modal
				open={termsOpen}
				onClose={() => setTermsOpen(false)}
				title="Terms & Privacy summary"
				sub="The short version — full documents are linked at the bottom."
				icon="bi-file-earmark-text"
				footer={
					<>
						<Button variant="ghost" onClick={() => setTermsOpen(false)}>
							Close
						</Button>
						<Button
							onClick={() => {
								setTerms(true);
								setTermsOpen(false);
								toast.success(
									"Terms accepted",
									"Thanks — you can create your account now.",
								);
							}}
						>
							Accept &amp; continue
						</Button>
					</>
				}
			>
				<ul className={s.stack} style={{ paddingLeft: "1.1rem", margin: 0 }}>
					<li>
						We hold funds with licensed partner banks; balances are never lent
						out.
					</li>
					<li>
						Identity data is processed for KYC/AML and retained per local
						regulation.
					</li>
					<li>
						You can export or delete your data at any time from the security
						centre.
					</li>
					<li>
						Paymo will never ask for your password, PIN or OTP by phone or
						email.
					</li>
				</ul>
			</Modal>

			<Modal
				open={leaveOpen}
				onClose={() => setLeaveOpen(false)}
				title="Leave account setup?"
				icon="bi-box-arrow-left"
				tone="amber"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setLeaveOpen(false)}>
							Keep going
						</Button>
						<Button variant="danger" onClick={() => go("/auth/login")}>
							Leave
						</Button>
					</>
				}
			>
				Nothing you&apos;ve entered has been saved yet. You can always start
				again from the sign-in page.
			</Modal>
		</AuthPage>
	);
}
