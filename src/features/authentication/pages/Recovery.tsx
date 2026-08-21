/* ============================================================================
 * Recovery.tsx — Paymo BAAS · Account recovery
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit.
 * Condensed from the legacy 983-line page into a tight 3-step flow
 * (Method → Verify → New password) plus a success state.
 *
 * Kept: email / SMS / security-question / magic-link paths, 6-digit OTP with
 * shake-on-error, 60s resend cooldown, magic-link auto-advance, password
 * strength meter, "sign out other devices" toggle.
 * Added: toasts on every transition and a support-escalation dialog.
 *
 * Routes/links preserved: /auth/login · /auth/identity · /auth/account-status
 * ========================================================================== */

import { useEffect, useRef, useState } from "react";
import {
	AuthPage,
	AuthSplit,
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
	Stepper,
	s,
	toast,
	useCountdown,
} from "../components/AuthKit";

type Method = "email" | "sms" | "questions" | "magic";

const METHODS: Array<{
	id: Method;
	icon: string;
	tone: "green" | "blue" | "violet" | "amber";
	title: string;
	sub: string;
}> = [
	{
		id: "email",
		icon: "bi-envelope",
		tone: "green",
		title: "Email code",
		sub: "6-digit code to a•••a@paymo.com",
	},
	{
		id: "sms",
		icon: "bi-phone",
		tone: "blue",
		title: "SMS code",
		sub: "6-digit code to +254 •••••4321",
	},
	{
		id: "questions",
		icon: "bi-shield-question",
		tone: "violet",
		title: "Security questions",
		sub: "Answer 2 of your saved questions",
	},
	{
		id: "magic",
		icon: "bi-link-45deg",
		tone: "amber",
		title: "Magic link",
		sub: "One-tap link, expires in 15 min",
	},
];

const QUESTIONS = [
	"What was the name of your first pet?",
	"What city were you born in?",
];

const STEPS = [
	{ label: "Method", icon: "bi-grid" },
	{ label: "Verify", icon: "bi-shield-check" },
	{ label: "New password", icon: "bi-key" },
];

const REQS = [
	"At least 8 characters",
	"One uppercase letter",
	"One number",
	"One symbol",
];
const strengthOf = (pw: string) => [
	pw.length >= 8,
	/[A-Z]/.test(pw),
	/\d/.test(pw),
	/[^A-Za-z0-9]/.test(pw),
];

export default function Recovery() {
	const [step, setStep] = useState(0); // 0 method · 1 verify · 2 reset · 3 done
	const [method, setMethod] = useState<Method>("email");
	const [identifier, setIdentifier] = useState("");

	const [otp, setOtp] = useState("");
	const [otpBad, setOtpBad] = useState(false);
	const [answers, setAnswers] = useState(["", ""]);
	const [cooldown, setCooldown] = useCountdown(0);

	const [pw, setPw] = useState("");
	const [pw2, setPw2] = useState("");
	const [signOutAll, setSignOutAll] = useState(true);
	const [busy, setBusy] = useState(false);
	const [supportOpen, setSupportOpen] = useState(false);

	const timers = useRef<number[]>([]);
	const later = (fn: () => void, ms: number) => {
		timers.current.push(window.setTimeout(fn, ms));
	};
	useEffect(() => {
		const t = timers.current;
		return () => {
			t.forEach(window.clearTimeout);
		};
	}, []);

	/* magic link auto-advance, mirroring the legacy 3s demo hop */
	useEffect(() => {
		if (step === 1 && method === "magic") {
			const id = window.setTimeout(() => {
				toast.success(
					"Link opened",
					"Verified from this device — set a new password.",
				);
				setStep(2);
			}, 3200);
			return () => window.clearTimeout(id);
		}
	}, [step, method]);

	const checks = strengthOf(pw);
	const score = checks.filter(Boolean).length;
	const match = pw.length > 0 && pw === pw2;

	const startRecovery = () => {
		if (identifier.trim().length < 4) {
			toast.warning(
				"Who are we recovering?",
				"Enter the email or phone on the account.",
			);
			return;
		}
		setStep(1);
		if (method === "email" || method === "sms") {
			setCooldown(60);
			toast.success(
				"Code sent",
				`We sent a 6-digit code via ${method === "email" ? "email" : "SMS"}.`,
			);
		} else if (method === "magic") {
			toast.success(
				"Magic link sent",
				"Open it on this device — it expires in 15 minutes.",
			);
		} else {
			toast.info("Identity check", "Answer your saved questions to continue.");
		}
	};

	const verify = () => {
		if (method === "questions") {
			if (answers.some((a) => a.trim().length < 2)) {
				toast.warning(
					"Answer both questions",
					"Answers aren't case sensitive.",
				);
				return;
			}
			toast.success("Answers accepted", "Set a new password below.");
			setStep(2);
			return;
		}
		if (otp.length < 6) {
			toast.warning(
				"Enter the 6-digit code",
				"It expires 5 minutes after sending.",
			);
			return;
		}
		if (otp === "000000") {
			setOtpBad(true);
			later(() => {
				setOtpBad(false);
				setOtp("");
			}, 480);
			toast.danger(
				"Incorrect code",
				"Double-check the latest message and try again.",
			);
			return;
		}
		toast.success("Identity verified", "Set a new password below.");
		setStep(2);
	};

	const resetPassword = () => {
		if (score < 3) {
			toast.warning(
				"Password too weak",
				"Meet at least three of the four requirements.",
			);
			return;
		}
		if (!match) {
			toast.danger("Passwords don't match", "Re-type the confirmation field.");
			return;
		}
		setBusy(true);
		later(() => {
			setBusy(false);
			setStep(3);
			toast.success(
				"Password updated",
				signOutAll ? "All other sessions were signed out." : "You're all set.",
			);
		}, 1200);
	};

	/* ------------------------------------------------------------- success */
	if (step === 3) {
		return (
			<AuthPage>
				<AuthSplit
					pill="Recovery complete"
					title="Access restored."
					accent="Lock it down."
					copy="Add a passkey so the next sign-in takes two seconds and can't be phished."
					trust={["256-bit encryption", "Zero-knowledge"]}
				>
					<Card>
						<div className={s.center}>
							<div className={cx(s.bio, s.bioDone)}>
								<i className="bi bi-shield-check" />
							</div>
							<h1 className={s.title}>You&apos;re back in</h1>
							<p className={s.subtitle}>Your password was changed just now.</p>
						</div>
						<div className={s.stack} style={{ marginTop: "1.1rem" }}>
							<Notice tone="green" icon="bi-info-circle">
								We emailed a security receipt. If this wasn&apos;t you,{" "}
								<button
									type="button"
									className={s.link}
									onClick={() => setSupportOpen(true)}
								>
									tell us immediately
								</button>
								.
							</Notice>
							<Button
								block
								size="lg"
								icon="bi-box-arrow-in-right"
								onClick={() => go("/auth/login")}
							>
								Continue to sign in
							</Button>
							<Button
								block
								variant="ghost"
								icon="bi-fingerprint"
								onClick={() => go("/auth/passkeys")}
							>
								Set up a passkey
							</Button>
						</div>
					</Card>
				</AuthSplit>
				<SupportModal
					open={supportOpen}
					onClose={() => setSupportOpen(false)}
				/>
			</AuthPage>
		);
	}

	/* -------------------------------------------------------------- wizard */
	return (
		<AuthPage>
			<AuthSplit
				pill="Secure account recovery"
				title="Locked out?"
				accent="We'll get you back."
				copy="Recovery is verified end-to-end. We never reveal which factor failed, and every attempt is logged."
				features={[
					{
						icon: "bi-shield-check",
						title: "End-to-end encrypted",
						sub: "256-bit in transit and at rest",
					},
					{
						icon: "bi-eye-slash",
						title: "Privacy protected",
						sub: "Zero-knowledge architecture",
					},
					{
						icon: "bi-stopwatch",
						title: "Under 2 minutes",
						sub: "Most recoveries complete instantly",
					},
				]}
				trust={["PCI DSS L1", "SOC 2 Type II"]}
			>
				<div className={s.center}>
					<h1 className={s.title}>Recover your account</h1>
					<p className={s.subtitle}>Step {step + 1} of 3</p>
				</div>

				<Card>
					<Stepper steps={STEPS} current={step} />
					<div style={{ margin: "0.9rem 0 1.1rem" }}>
						<Progress value={((step + 1) / 3) * 100} sm />
					</div>

					{/* -------- method -------- */}
					{step === 0 && (
						<div className={s.stack}>
							<Field label="Email or phone on the account" htmlFor="rcId">
								<Input
									id="rcId"
									placeholder="you@company.com"
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
								/>
							</Field>
							<div className={s.label}>How should we verify you?</div>
							{METHODS.map((m) => (
								<OptionCard
									key={m.id}
									icon={m.icon}
									tone={m.tone}
									title={m.title}
									sub={m.sub}
									selected={method === m.id}
									onClick={() => setMethod(m.id)}
								/>
							))}
						</div>
					)}

					{/* -------- verify -------- */}
					{step === 1 && (
						<div className={s.stack}>
							{method === "questions" ? (
								QUESTIONS.map((q, i) => (
									<Field key={q} label={q} htmlFor={`rcQ${i}`}>
										<Input
											id={`rcQ${i}`}
											value={answers[i]}
											onChange={(e) =>
												setAnswers((prev) =>
													prev.map((a, j) => (i === j ? e.target.value : a)),
												)
											}
										/>
									</Field>
								))
							) : method === "magic" ? (
								<div className={s.center}>
									<div className={cx(s.bio, s.bioScan)}>
										<i className="bi bi-link-45deg" />
									</div>
									<div className={s.cardTitle}>Waiting for the link</div>
									<p className={s.tiny} style={{ margin: "0.35rem 0 0" }}>
										Open the email we sent to <b>{identifier}</b>. This page
										updates automatically.
									</p>
								</div>
							) : (
								<>
									<div className={s.center}>
										<span
											className={cx(s.tile, s.tileLg, s.tileGreen)}
											style={{ margin: "0 auto 0.7rem" }}
										>
											<i
												className={
													method === "email"
														? "bi bi-envelope-check"
														: "bi bi-phone"
												}
											/>
										</span>
										<div className={s.cardTitle}>
											Enter your verification code
										</div>
										<p className={s.tiny} style={{ margin: "0.3rem 0 0" }}>
											Sent to <b>{identifier}</b> · expires in 5 minutes
										</p>
									</div>
									<OtpInput
										value={otp}
										onChange={setOtp}
										invalid={otpBad}
										onComplete={() => verify()}
									/>
									<div className={s.row} style={{ justifyContent: "center" }}>
										<Button
											variant="subtle"
											size="sm"
											icon="bi-arrow-clockwise"
											disabled={cooldown > 0}
											onClick={() => {
												setCooldown(60);
												toast.success(
													"New code sent",
													"The previous code is now invalid.",
												);
											}}
										>
											{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
										</Button>
										<Button
											variant="subtle"
											size="sm"
											onClick={() => setStep(0)}
											icon="bi-shuffle"
										>
											Try another method
										</Button>
									</div>
								</>
							)}
						</div>
					)}

					{/* -------- reset -------- */}
					{step === 2 && (
						<div className={s.stack}>
							<Field label="New password" htmlFor="rcPw">
								<PasswordInput
									id="rcPw"
									value={pw}
									onChange={setPw}
									placeholder="Choose a strong password"
									autoComplete="new-password"
								/>
							</Field>
							<Field
								label="Confirm password"
								htmlFor="rcPw2"
								tone={pw2.length === 0 ? undefined : match ? "ok" : "err"}
								hint={
									pw2.length === 0
										? undefined
										: match
											? "Passwords match"
											: "Passwords don't match"
								}
							>
								<PasswordInput
									id="rcPw2"
									value={pw2}
									onChange={setPw2}
									placeholder="Re-type your password"
									autoComplete="new-password"
								/>
							</Field>
							<div className={s.row} style={{ gap: "0.4rem" }}>
								{REQS.map((r, i) => (
									<span
										key={r}
										className={cx(
											s.badge,
											checks[i] ? s.badgeGreen : s.badgeSlate,
										)}
									>
										<i
											className={checks[i] ? "bi bi-check-lg" : "bi bi-dash"}
										/>{" "}
										{r}
									</span>
								))}
							</div>
							<div className={s.listRow}>
								<span className={cx(s.tile, s.tileSm, s.tileAmber)}>
									<i className="bi bi-box-arrow-right" />
								</span>
								<span className={s.grow}>
									<span className={s.optionTitle}>
										Sign out all other devices
									</span>
									<span className={s.optionSub} style={{ display: "block" }}>
										Recommended if you suspect someone else had access
									</span>
								</span>
								<Check checked={signOutAll} onChange={setSignOutAll}>
									<span className={s.srOnly}>Sign out other devices</span>
								</Check>
							</div>
						</div>
					)}

					<div className={s.spread} style={{ marginTop: "1.2rem" }}>
						<Button
							variant="subtle"
							icon="bi-arrow-left"
							onClick={() =>
								step === 0 ? go("/auth/login") : setStep((v) => v - 1)
							}
						>
							{step === 0 ? "Back to sign in" : "Back"}
						</Button>
						<Button
							loading={busy}
							onClick={
								step === 0 ? startRecovery : step === 1 ? verify : resetPassword
							}
							disabled={step === 1 && method === "magic"}
						>
							{step === 2
								? busy
									? "Updating…"
									: "Update password"
								: "Continue"}
						</Button>
					</div>
				</Card>

				<p className={cx(s.tiny, s.center)}>
					Still stuck?{" "}
					<button
						type="button"
						className={s.link}
						onClick={() => setSupportOpen(true)}
					>
						Contact the recovery team
					</button>
				</p>
			</AuthSplit>

			<SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
		</AuthPage>
	);
}

function SupportModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Assisted recovery"
			sub="Identity verification is required — expect 24–48 hours."
			icon="bi-headset"
			tone="violet"
			footer={
				<Button variant="ghost" onClick={onClose}>
					Close
				</Button>
			}
		>
			<div className={s.stack}>
				<OptionCard
					icon="bi-person-vcard"
					title="High-assurance identity check"
					sub="Document, video or bank micro-deposit verification"
					onClick={() => go("/auth/identity")}
				/>
				<OptionCard
					icon="bi-lock"
					tone="amber"
					title="My account is restricted"
					sub="See what's blocked and the fastest way to unlock"
					onClick={() => go("/auth/account-status")}
				/>
				<Notice tone="red" icon="bi-shield-exclamation">
					Paymo staff will never ask for your password, PIN or OTP. Third-party
					“recovery agents” are always fraudulent.
				</Notice>
			</div>
		</Modal>
	);
}
