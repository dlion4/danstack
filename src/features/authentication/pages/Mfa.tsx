/* ============================================================================
 * Mfa.tsx — Paymo BAAS · Multi-factor step-up
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit.
 * Condensed from the legacy 1,480-line screen while keeping all six factors:
 * authenticator app, SMS/WhatsApp, push approval (with number matching),
 * passkey/biometric, hardware security key and recovery codes.
 *
 * Added: live TOTP window meter, 5-minute session timer with auto-expiry,
 * risk context strip, trust-this-device switch, recovery-codes dialog and
 * toast feedback on every transition.
 *
 * Routes/links preserved: /auth/hub · /auth/login · /auth/recovery ·
 * /auth/identity · /auth/passkeys
 * ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
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
	mmss,
	Notice,
	OptionCard,
	OtpInput,
	Progress,
	s,
	toast,
	useCountdown,
	useDeviceLabel,
} from "../components/AuthKit";

type Factor = "totp" | "sms" | "push" | "passkey" | "hardware" | "recovery";

const FACTORS: Array<{
	id: Factor;
	icon: string;
	tone: "green" | "blue" | "violet" | "amber" | "slate";
	title: string;
	sub: string;
	tag?: string;
}> = [
	{
		id: "totp",
		icon: "bi-shield-lock",
		tone: "green",
		title: "Authenticator app",
		sub: "Google Authenticator, Authy, 1Password",
		tag: "Last used",
	},
	{
		id: "sms",
		icon: "bi-phone",
		tone: "blue",
		title: "SMS / WhatsApp",
		sub: "Code to +254 •••••4321",
	},
	{
		id: "push",
		icon: "bi-bell",
		tone: "violet",
		title: "Push approval",
		sub: "Approve on iPhone 15 Pro",
	},
	{
		id: "passkey",
		icon: "bi-fingerprint",
		tone: "green",
		title: "Passkey",
		sub: "Face ID, Touch ID, Windows Hello",
	},
	{
		id: "hardware",
		icon: "bi-usb-symbol",
		tone: "slate",
		title: "Security key",
		sub: "YubiKey or any FIDO2 key",
	},
	{
		id: "recovery",
		icon: "bi-key",
		tone: "amber",
		title: "Recovery code",
		sub: "Use a saved backup code",
	},
];

const RECOVERY_CODES = [
	"PAYMO-8F4A2C",
	"PAYMO-71B9E0",
	"PAYMO-3D6F90",
	"PAYMO-A1C778",
	"PAYMO-52EE14",
	"PAYMO-9C0B31",
];

export default function Mfa() {
	const device = useDeviceLabel();
	const [factor, setFactor] = useState<Factor>("totp");
	const [otp, setOtp] = useState("");
	const [bad, setBad] = useState(false);
	const [recoveryCode, setRecoveryCode] = useState("");
	const [trust, setTrust] = useState(true);
	const [busy, setBusy] = useState(false);
	const [pushState, setPushState] = useState<"idle" | "waiting" | "approved">(
		"idle",
	);
	const [bioState, setBioState] = useState<"idle" | "scanning" | "done">(
		"idle",
	);
	const [smsSent, setSmsSent] = useState(false);
	const [resend, setResend] = useCountdown(0);
	const [session] = useCountdown(300);
	const [totpTick, setTotpTick] = useState(30);
	const [helpOpen, setHelpOpen] = useState(false);
	const [codesOpen, setCodesOpen] = useState(false);

	const matchNumber = useMemo(() => 10 + Math.floor(Math.random() * 89), []);
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

	/* TOTP 30-second window */
	useEffect(() => {
		const id = window.setInterval(
			() => setTotpTick((v) => (v <= 1 ? 30 : v - 1)),
			1000,
		);
		return () => window.clearInterval(id);
	}, []);

	/* session expiry */
	useEffect(() => {
		if (session === 0) {
			toast.danger(
				"Verification window expired",
				"Sign in again to restart the step-up.",
			);
			window.setTimeout(() => go("/auth/login"), 1400);
		}
	}, [session]);

	const succeed = (label: string) => {
		toast.success(
			`${label} verified`,
			trust ? "This device is trusted for 30 days." : "Opening your hub…",
		);
		later(() => go("/auth/hub"), 700);
	};

	const fail = (msg: string) => {
		setBad(true);
		later(() => {
			setBad(false);
			setOtp("");
		}, 480);
		toast.danger("Verification failed", msg);
	};

	const submitCode = (value: string) => {
		if (value.length < 6) {
			toast.warning("Enter all 6 digits", "Codes refresh every 30 seconds.");
			return;
		}
		setBusy(true);
		later(() => {
			setBusy(false);
			if (value === "000000") fail("That code is incorrect or has expired.");
			else succeed(factor === "sms" ? "SMS code" : "Authenticator code");
		}, 900);
	};

	const runPush = () => {
		setPushState("waiting");
		toast.info(
			"Approval sent",
			`Match number ${matchNumber} on your trusted phone.`,
		);
		later(() => {
			setPushState("approved");
			succeed("Push approval");
		}, 2600);
	};

	const runBio = (label: string) => {
		setBioState("scanning");
		toast.info(
			"Waiting for authenticator",
			"Follow the prompt on your device.",
		);
		later(() => {
			setBioState("done");
			succeed(label);
		}, 2100);
	};

	const sendSms = () => {
		setSmsSent(true);
		setResend(60);
		toast.success(
			"Code sent",
			"Delivered by SMS and WhatsApp. Expires in 5 minutes.",
		);
	};

	const useRecovery = () => {
		if (!/^PAYMO-[A-Z0-9]{6}$/i.test(recoveryCode.trim())) {
			toast.danger("Invalid format", "Recovery codes look like PAYMO-1A2B3C.");
			return;
		}
		setBusy(true);
		later(() => {
			setBusy(false);
			toast.warning(
				"Recovery code used",
				"That code is now burnt — generate a fresh set soon.",
			);
			succeed("Recovery code");
		}, 900);
	};

	const active = FACTORS.find((f) => f.id === factor);

	return (
		<AuthPage>
			<AuthSplit
				pill="Risk-based step-up required"
				title="One more check"
				accent="before the money moves."
				copy="Paymo Shield scored this session against device, network and behaviour signals."
				features={[
					{
						icon: "bi-geo-alt",
						title: "Nairobi, Kenya",
						sub: "IP reputation: trusted",
					},
					{
						icon: "bi-laptop",
						title: device,
						sub: "Device fingerprint: known",
					},
					{
						icon: "bi-activity",
						title: "Risk score 34/100",
						sub: "Elevated — new network detected",
					},
				]}
				trust={["TLS 1.3", "SOC 2", "No code logging"]}
			>
				<div className={s.spread}>
					<div>
						<h1 className={s.title}>Verify your identity</h1>
						<p className={s.subtitle}>
							Choose one approved factor to continue.
						</p>
					</div>
					<Badge tone={session < 60 ? "red" : "slate"} icon="bi-stopwatch">
						{mmss(session)}
					</Badge>
				</div>

				<Card flush>
					<div style={{ padding: "1.1rem 1.25rem 0" }}>
						<div className={s.label}>Verification method</div>
						<div className={s.stack} style={{ marginTop: "0.4rem" }}>
							{FACTORS.slice(0, 3).map((f) => (
								<OptionCard
									key={f.id}
									icon={f.icon}
									tone={f.tone}
									title={f.title}
									sub={f.sub}
									selected={factor === f.id}
									badge={
										f.tag ? <Badge tone="slate">{f.tag}</Badge> : undefined
									}
									onClick={() => setFactor(f.id)}
								/>
							))}
						</div>
						<div className={s.row} style={{ marginTop: "0.6rem" }}>
							{FACTORS.slice(3).map((f) => (
								<Button
									key={f.id}
									size="sm"
									variant={factor === f.id ? "outline" : "subtle"}
									icon={f.icon}
									onClick={() => setFactor(f.id)}
								>
									{f.title}
								</Button>
							))}
						</div>
					</div>

					<hr className={s.divider} />

					<div style={{ padding: "0 1.25rem 1.25rem" }}>
						{/* ---------------- TOTP ---------------- */}
						{factor === "totp" && (
							<div className={s.stack}>
								<div className={s.center}>
									<div className={s.cardTitle}>Enter your 6-digit code</div>
									<p className={s.tiny} style={{ margin: "0.25rem 0 0" }}>
										From your authenticator app · refreshes in {totpTick}s
									</p>
								</div>
								<Progress value={(totpTick / 30) * 100} sm />
								<OtpInput
									value={otp}
									onChange={setOtp}
									invalid={bad}
									onComplete={submitCode}
								/>
								<Button
									block
									size="lg"
									loading={busy}
									onClick={() => submitCode(otp)}
								>
									{busy ? "Verifying…" : "Verify code"}
								</Button>
							</div>
						)}

						{/* ---------------- SMS ---------------- */}
						{factor === "sms" && (
							<div className={s.stack}>
								{!smsSent ? (
									<>
										<Notice tone="blue" icon="bi-info-circle">
											We&apos;ll send the same code by SMS and WhatsApp to{" "}
											<b>+254 •••••4321</b>.
										</Notice>
										<Button block size="lg" icon="bi-send" onClick={sendSms}>
											Send my code
										</Button>
									</>
								) : (
									<>
										<div className={s.center}>
											<div className={s.cardTitle}>Enter the code we sent</div>
											<p className={s.tiny} style={{ margin: "0.25rem 0 0" }}>
												+254 •••••4321 · expires in 5 minutes
											</p>
										</div>
										<OtpInput
											value={otp}
											onChange={setOtp}
											invalid={bad}
											onComplete={submitCode}
										/>
										<div className={s.row} style={{ justifyContent: "center" }}>
											<Button
												variant="subtle"
												size="sm"
												icon="bi-arrow-clockwise"
												disabled={resend > 0}
												onClick={sendSms}
											>
												{resend > 0 ? `Resend in ${resend}s` : "Resend code"}
											</Button>
										</div>
										<Button
											block
											size="lg"
											loading={busy}
											onClick={() => submitCode(otp)}
										>
											{busy ? "Verifying…" : "Verify code"}
										</Button>
									</>
								)}
							</div>
						)}

						{/* ---------------- PUSH ---------------- */}
						{factor === "push" && (
							<div className={cx(s.stack, s.center)}>
								<div
									className={cx(
										s.bio,
										pushState === "waiting" && s.bioScan,
										pushState === "approved" && s.bioDone,
									)}
								>
									<i
										className={
											pushState === "approved" ? "bi bi-check-lg" : "bi bi-bell"
										}
									/>
								</div>
								{pushState === "idle" ? (
									<>
										<div className={s.cardTitle}>Approve from your phone</div>
										<p className={s.tiny}>
											We&apos;ll ping iPhone 15 Pro · Nairobi
										</p>
										<Button block size="lg" icon="bi-send" onClick={runPush}>
											Send approval request
										</Button>
									</>
								) : (
									<>
										<div className={s.cardTitle}>
											Tap <b style={{ color: "#0b8f52" }}>{matchNumber}</b> on
											your phone
										</div>
										<p className={s.tiny}>
											{pushState === "approved"
												? "Approved — signing you in…"
												: "Waiting for approval…"}
										</p>
									</>
								)}
							</div>
						)}

						{/* ---------------- PASSKEY / HARDWARE ---------------- */}
						{(factor === "passkey" || factor === "hardware") && (
							<div className={cx(s.stack, s.center)}>
								<div
									className={cx(
										s.bio,
										bioState === "scanning" && s.bioScan,
										bioState === "done" && s.bioDone,
									)}
								>
									<i
										className={
											bioState === "done"
												? "bi bi-check-lg"
												: factor === "passkey"
													? "bi bi-fingerprint"
													: "bi bi-usb-symbol"
										}
									/>
								</div>
								<div className={s.cardTitle}>
									{factor === "passkey"
										? "Use your passkey"
										: "Insert your security key"}
								</div>
								<p className={s.tiny}>
									{factor === "passkey"
										? "2 passkeys registered on this account"
										: "Touch the key when it starts blinking"}
								</p>
								<Button
									block
									size="lg"
									loading={bioState === "scanning"}
									disabled={bioState !== "idle"}
									icon={
										factor === "passkey" ? "bi-fingerprint" : "bi-usb-symbol"
									}
									onClick={() =>
										runBio(factor === "passkey" ? "Passkey" : "Security key")
									}
								>
									{bioState === "scanning" ? "Waiting…" : "Continue"}
								</Button>
							</div>
						)}

						{/* ---------------- RECOVERY ---------------- */}
						{factor === "recovery" && (
							<div className={s.stack}>
								<Notice tone="amber" icon="bi-exclamation-triangle">
									Each recovery code works once. Using one will prompt you to
									regenerate the set.
								</Notice>
								<Field label="Recovery code" htmlFor="mfaRec">
									<Input
										id="mfaRec"
										placeholder="PAYMO-1A2B3C"
										value={recoveryCode}
										onChange={(e) =>
											setRecoveryCode(e.target.value.toUpperCase())
										}
									/>
								</Field>
								<Button block size="lg" loading={busy} onClick={useRecovery}>
									{busy ? "Checking…" : "Use recovery code"}
								</Button>
								<Button
									variant="subtle"
									size="sm"
									icon="bi-list-ol"
									onClick={() => setCodesOpen(true)}
								>
									Where do I find my codes?
								</Button>
							</div>
						)}

						<hr className={s.divider} />

						<div className={s.spread}>
							<Check checked={trust} onChange={setTrust}>
								Trust this device for 30 days
							</Check>
							<Button
								variant="subtle"
								size="sm"
								icon="bi-question-circle"
								onClick={() => setHelpOpen(true)}
							>
								Lost access?
							</Button>
						</div>
					</div>
				</Card>

				<div className={s.footNote}>
					<span>
						Verifying as <b>amara@tsretail.co.ke</b> · {active?.title}
					</span>
					<a className={s.link} href="/auth/login">
						Use another account
					</a>
				</div>
			</AuthSplit>

			{/* ---------- lost access dialog ---------- */}
			<Modal
				open={helpOpen}
				onClose={() => setHelpOpen(false)}
				title="Lost access to your factors?"
				sub="Pick the route that matches your situation."
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
						title="I have a recovery code"
						sub="Fastest route — verifies instantly"
						onClick={() => {
							setFactor("recovery");
							setHelpOpen(false);
						}}
					/>
					<OptionCard
						icon="bi-person-vcard"
						tone="violet"
						title="Verify my identity instead"
						sub="Document, video or bank micro-deposit"
						onClick={() => go("/auth/identity")}
					/>
					<OptionCard
						icon="bi-arrow-counterclockwise"
						tone="amber"
						title="Start account recovery"
						sub="Reset credentials with email or SMS"
						onClick={() => go("/auth/recovery")}
					/>
					<Notice tone="slate" icon="bi-clock-history">
						Support-assisted recovery takes 24–48 hours and always requires
						identity verification.
					</Notice>
				</div>
			</Modal>

			{/* ---------- recovery codes dialog ---------- */}
			<Modal
				open={codesOpen}
				onClose={() => setCodesOpen(false)}
				title="Your recovery codes"
				sub="Stored offline when you enabled 2FA. Sample set shown for reference."
				icon="bi-list-ol"
				tone="amber"
				footer={
					<>
						<Button
							variant="ghost"
							icon="bi-clipboard"
							onClick={() => {
								navigator.clipboard?.writeText(RECOVERY_CODES.join("\n"));
								toast.success(
									"Codes copied",
									"Paste them into your password manager.",
								);
							}}
						>
							Copy all
						</Button>
						<Button onClick={() => setCodesOpen(false)}>Done</Button>
					</>
				}
			>
				<div className={s.grid} style={{ ["--au-min" as string]: "140px" }}>
					{RECOVERY_CODES.map((c) => (
						<div
							key={c}
							className={cx(s.listRow, s.mono)}
							style={{ justifyContent: "center" }}
						>
							{c}
						</div>
					))}
				</div>
			</Modal>
		</AuthPage>
	);
}
