/* ============================================================================
 * IdentityVerification.tsx — Paymo BAAS · Identity verification (KYC)
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit and
 * cut down from the legacy 1,190-line page to a four-stage flow:
 * Method → Verify → Review → Next steps.
 *
 * Kept: the four assurance levels (dual-channel OTP, document + selfie, live
 * video, bank micro-deposit), document types, slot booking, deposit amounts
 * and the automated review timeline.
 * Added: upload feedback, progress simulation, requirement dialog, toasts and
 * an abort confirmation.
 *
 * Routes/links preserved: /auth/hub · /auth/account-status · /auth/security
 * ========================================================================== */

import { useEffect, useState } from "react";
import {
	AuthPage,
	AuthSplit,
	Badge,
	Button,
	Card,
	cx,
	Field,
	go,
	Input,
	Modal,
	Notice,
	OptionCard,
	OtpInput,
	Progress,
	Select,
	Stepper,
	s,
	toast,
} from "../components/AuthKit";

type Method = "basic" | "document" | "video" | "bank";

const METHODS: Array<{
	id: Method;
	icon: string;
	tone: "green" | "blue" | "violet" | "amber";
	title: string;
	sub: string;
	badge: string;
	sla: string;
}> = [
	{
		id: "basic",
		icon: "bi-shield-check",
		tone: "green",
		title: "Level 1 · Basic",
		sub: "Dual-channel OTP for low-risk recovery",
		badge: "Instant",
		sla: "2 minutes",
	},
	{
		id: "document",
		icon: "bi-person-vcard",
		tone: "blue",
		title: "Level 2 · Standard",
		sub: "Government ID plus a live selfie match",
		badge: "Most common",
		sla: "2–5 minutes",
	},
	{
		id: "video",
		icon: "bi-camera-video",
		tone: "violet",
		title: "Level 3 · Video",
		sub: "Live agent review for high-risk cases",
		badge: "4h SLA",
		sla: "Same day",
	},
	{
		id: "bank",
		icon: "bi-bank",
		tone: "amber",
		title: "Bank micro-deposit",
		sub: "Confirm two small amounts on a linked account",
		badge: "1–2 days",
		sla: "1–2 business days",
	},
];

const DOC_TYPES = [
	"International Passport",
	"National ID Card",
	"Driver's Licence",
	"Voter's Card",
];
const SLOTS = [
	"Today · 14:00",
	"Today · 16:30",
	"Tomorrow · 09:00",
	"Tomorrow · 11:30",
];
const BANKS = [
	"Equity Bank",
	"KCB Bank",
	"NCBA",
	"Standard Chartered",
	"Co-operative Bank",
];

const STAGES = [
	{ label: "Method", icon: "bi-grid" },
	{ label: "Verify", icon: "bi-person-vcard" },
	{ label: "Review", icon: "bi-hourglass-split" },
	{ label: "Next steps", icon: "bi-check2-circle" },
];

const REVIEW_STEPS = [
	"Analysing document quality",
	"Matching selfie to ID",
	"Screening sanctions & PEP lists",
	"Finalising decision",
];

export default function IdentityVerification() {
	const [stage, setStage] = useState(0);
	const [method, setMethod] = useState<Method>("document");

	const [otp, setOtp] = useState("");
	const [docType, setDocType] = useState(DOC_TYPES[0]);
	const [docFront, setDocFront] = useState(false);
	const [selfie, setSelfie] = useState(false);
	const [slot, setSlot] = useState(SLOTS[0]);
	const [bank, setBank] = useState(BANKS[0]);
	const [dep1, setDep1] = useState("");
	const [dep2, setDep2] = useState("");

	const [reviewStep, setReviewStep] = useState(0);
	const [reqOpen, setReqOpen] = useState(false);
	const [abortOpen, setAbortOpen] = useState(false);

	/* review simulation */
	useEffect(() => {
		if (stage !== 2) return;
		setReviewStep(0);
		const id = window.setInterval(() => {
			setReviewStep((v) => {
				if (v >= REVIEW_STEPS.length - 1) {
					window.clearInterval(id);
					window.setTimeout(() => {
						setStage(3);
						toast.success(
							"Verification approved",
							"Your limits have been raised immediately.",
						);
					}, 900);
					return v;
				}
				return v + 1;
			});
		}, 1200);
		return () => window.clearInterval(id);
	}, [stage]);

	const submitVerify = () => {
		if (method === "basic") {
			if (otp.length < 6) {
				toast.warning(
					"Enter the 6-digit code",
					"We sent it to your email and phone.",
				);
				return;
			}
		}
		if (method === "document" && (!docFront || !selfie)) {
			toast.warning(
				"Two items required",
				"Upload your ID and capture a live selfie.",
			);
			return;
		}
		if (method === "bank") {
			if (dep1 !== "0.23" || dep2 !== "0.47") {
				toast.danger(
					"Amounts don't match",
					"Check your statement — demo values are 0.23 and 0.47.",
				);
				return;
			}
		}
		if (method === "video") {
			toast.success(
				"Slot booked",
				`${slot} · you'll get a calendar invite and SMS reminder.`,
			);
			setStage(3);
			return;
		}
		toast.info("Submitted for review", "Automated checks are running now.");
		setStage(2);
	};

	const activeMethod = METHODS.find((m) => m.id === method);

	return (
		<AuthPage>
			<AuthSplit
				pill="High-assurance verification"
				title="Prove it's you,"
				accent="once."
				copy="Verification protects your account from fraudulent recovery and unlocks higher limits across every Paymo product."
				features={[
					{
						icon: "bi-stopwatch",
						title: "2–5 minute decisions",
						sub: "Automated document review",
					},
					{
						icon: "bi-lock",
						title: "Encrypted end-to-end",
						sub: "TLS 1.3 · documents deleted after review",
					},
					{
						icon: "bi-globe-africa",
						title: "8 languages",
						sub: "Live agents across 4 time zones",
					},
				]}
				trust={["ISO 27001", "GDPR aligned"]}
				wide
			>
				<div className={s.spread}>
					<div>
						<h1 className={s.title}>Identity verification</h1>
						<p className={s.subtitle}>Triggered by: account recovery request</p>
					</div>
					<Button
						variant="subtle"
						size="sm"
						icon="bi-info-circle"
						onClick={() => setReqOpen(true)}
					>
						What do I need?
					</Button>
				</div>

				<Card>
					<Stepper steps={STAGES} current={stage} />
					<div style={{ margin: "0.9rem 0 1.1rem" }}>
						<Progress value={((stage + 1) / 4) * 100} sm />
					</div>

					{/* ---------------- stage 0 · choose ---------------- */}
					{stage === 0 && (
						<div className={s.stack}>
							{METHODS.map((m) => (
								<OptionCard
									key={m.id}
									icon={m.icon}
									tone={m.tone}
									title={m.title}
									sub={m.sub}
									selected={method === m.id}
									badge={<Badge tone={m.tone}>{m.badge}</Badge>}
									onClick={() => setMethod(m.id)}
								/>
							))}
							<Notice tone="slate" icon="bi-clock-history">
								Estimated decision time for <b>{activeMethod?.title}</b>:{" "}
								{activeMethod?.sla}.
							</Notice>
						</div>
					)}

					{/* ---------------- stage 1 · verify ---------------- */}
					{stage === 1 && (
						<div className={s.stack}>
							{method === "basic" && (
								<>
									<div className={s.center}>
										<span
											className={cx(s.tile, s.tileLg, s.tileGreen)}
											style={{ margin: "0 auto 0.6rem" }}
										>
											<i className="bi bi-envelope-check" />
										</span>
										<div className={s.cardTitle}>Confirm both channels</div>
										<p className={s.tiny} style={{ margin: "0.25rem 0 0" }}>
											Same code sent to a•••a@paymo.com and +254 •••••4321
										</p>
									</div>
									<OtpInput
										value={otp}
										onChange={setOtp}
										onComplete={submitVerify}
									/>
								</>
							)}

							{method === "document" && (
								<>
									<Field label="Document type" htmlFor="kycDoc">
										<Select
											id="kycDoc"
											value={docType}
											onChange={(e) => setDocType(e.target.value)}
										>
											{DOC_TYPES.map((d) => (
												<option key={d}>{d}</option>
											))}
										</Select>
									</Field>
									<div
										className={s.grid}
										style={{ ["--au-min" as string]: "200px" }}
									>
										<UploadTile
											done={docFront}
											icon="bi-card-image"
											title={`Photo of ${docType}`}
											hint="PNG or JPG · max 8 MB"
											onPick={() => {
												setDocFront(true);
												toast.success(
													"Document received",
													"Quality check passed — glare not detected.",
												);
											}}
										/>
										<UploadTile
											done={selfie}
											icon="bi-camera"
											title="Live selfie"
											hint="Liveness detection · 3 seconds"
											onPick={() => {
												setSelfie(true);
												toast.success(
													"Selfie captured",
													"Face match confidence: 98.4%.",
												);
											}}
										/>
									</div>
									<Notice tone="blue" icon="bi-lightbulb">
										Good lighting and a plain background cut review time from
										days to minutes.
									</Notice>
								</>
							)}

							{method === "video" && (
								<>
									<Field label="Pick a slot" htmlFor="kycSlot">
										<Select
											id="kycSlot"
											value={slot}
											onChange={(e) => setSlot(e.target.value)}
										>
											{SLOTS.map((sl) => (
												<option key={sl}>{sl}</option>
											))}
										</Select>
									</Field>
									<Notice tone="violet" icon="bi-camera-video">
										Have your ID with you. Calls last about 6 minutes and are
										recorded for compliance.
									</Notice>
								</>
							)}

							{method === "bank" && (
								<>
									<Field label="Linked account" htmlFor="kycBank">
										<Select
											id="kycBank"
											value={bank}
											onChange={(e) => setBank(e.target.value)}
										>
											{BANKS.map((b) => (
												<option key={b}>{b}</option>
											))}
										</Select>
									</Field>
									<div className={s.row}>
										<div className={s.grow}>
											<Field label="Deposit 1 (KES)" htmlFor="kycD1">
												<Input
													id="kycD1"
													placeholder="0.00"
													value={dep1}
													onChange={(e) => setDep1(e.target.value)}
												/>
											</Field>
										</div>
										<div className={s.grow}>
											<Field label="Deposit 2 (KES)" htmlFor="kycD2">
												<Input
													id="kycD2"
													placeholder="0.00"
													value={dep2}
													onChange={(e) => setDep2(e.target.value)}
												/>
											</Field>
										</div>
									</div>
									<Notice tone="amber" icon="bi-hourglass-split">
										Deposits land within 1–2 business days and are reversed
										automatically.
									</Notice>
								</>
							)}
						</div>
					)}

					{/* ---------------- stage 2 · review ---------------- */}
					{stage === 2 && (
						<div className={s.stack}>
							<div className={s.center}>
								<div className={cx(s.bio, s.bioScan)}>
									<i className="bi bi-hourglass-split" />
								</div>
								<div className={s.cardTitle}>Running automated checks</div>
								<p className={s.tiny} style={{ margin: "0.25rem 0 0" }}>
									Keep this tab open — usually done in under two minutes.
								</p>
							</div>
							<div className={s.stack}>
								{REVIEW_STEPS.map((r, i) => (
									<div className={s.listRow} key={r}>
										<span
											className={cx(
												s.tile,
												s.tileSm,
												i < reviewStep
													? s.tileGreen
													: i === reviewStep
														? s.tileBlue
														: s.tileSlate,
											)}
										>
											<i
												className={
													i < reviewStep
														? "bi bi-check-lg"
														: i === reviewStep
															? "bi bi-arrow-repeat"
															: "bi bi-dash"
												}
											/>
										</span>
										<span className={s.grow}>{r}</span>
										{i < reviewStep && <Badge tone="green">Passed</Badge>}
										{i === reviewStep && <Badge tone="blue">Running</Badge>}
									</div>
								))}
							</div>
						</div>
					)}

					{/* ---------------- stage 3 · done ---------------- */}
					{stage === 3 && (
						<div className={s.stack}>
							<div className={s.center}>
								<div className={cx(s.bio, s.bioDone)}>
									<i className="bi bi-patch-check" />
								</div>
								<div className={s.cardTitle}>
									{method === "video"
										? "Video session booked"
										: "Identity verified"}
								</div>
								<p className={s.tiny} style={{ margin: "0.25rem 0 0" }}>
									{method === "video"
										? `${slot} · invite sent to your email`
										: "Tier 3 limits are now active on your account."}
								</p>
							</div>
							<div
								className={s.grid}
								style={{ ["--au-min" as string]: "220px" }}
							>
								<Card hover onClick={() => go("/auth/hub")}>
									<div className={s.row}>
										<span className={cx(s.tile, s.tileGreen)}>
											<i className="bi bi-grid-1x2" />
										</span>
										<span className={s.grow}>
											<span className={s.optionTitle}>Back to dashboards</span>
											<span
												className={s.optionSub}
												style={{ display: "block" }}
											>
												Pick up where you left off
											</span>
										</span>
									</div>
								</Card>
								<Card hover onClick={() => go("/auth/security")}>
									<div className={s.row}>
										<span className={cx(s.tile, s.tileViolet)}>
											<i className="bi bi-shield-check" />
										</span>
										<span className={s.grow}>
											<span className={s.optionTitle}>Review security</span>
											<span
												className={s.optionSub}
												style={{ display: "block" }}
											>
												Sessions, alerts and connected apps
											</span>
										</span>
									</div>
								</Card>
							</div>
						</div>
					)}

					{stage < 3 && (
						<div className={s.spread} style={{ marginTop: "1.2rem" }}>
							<Button
								variant="subtle"
								icon="bi-arrow-left"
								disabled={stage === 2}
								onClick={() =>
									stage === 0 ? setAbortOpen(true) : setStage((v) => v - 1)
								}
							>
								{stage === 0 ? "Cancel" : "Back"}
							</Button>
							{stage < 2 && (
								<Button
									onClick={() => (stage === 0 ? setStage(1) : submitVerify())}
								>
									{stage === 0
										? "Continue"
										: method === "video"
											? "Book slot"
											: "Submit for review"}
								</Button>
							)}
						</div>
					)}
				</Card>

				<div className={s.footNote}>
					<span>Case #KYC-2026-4471</span>
					<a className={s.link} href="/auth/account-status">
						Account status
					</a>
				</div>
			</AuthSplit>

			<Modal
				open={reqOpen}
				onClose={() => setReqOpen(false)}
				title="What you'll need"
				sub="Requirements differ by assurance level."
				icon="bi-list-check"
				footer={
					<Button variant="ghost" onClick={() => setReqOpen(false)}>
						Got it
					</Button>
				}
			>
				<div className={s.stack}>
					{METHODS.map((m) => (
						<div className={s.listRow} key={m.id}>
							<span
								className={cx(
									s.tile,
									s.tileSm,
									s[`tile${m.tone[0].toUpperCase()}${m.tone.slice(1)}`],
								)}
							>
								<i className={`bi ${m.icon}`} />
							</span>
							<span className={s.grow}>
								<span className={s.optionTitle}>{m.title}</span>
								<span className={s.optionSub} style={{ display: "block" }}>
									{m.sub} · decision in {m.sla}
								</span>
							</span>
						</div>
					))}
					<Notice tone="slate" icon="bi-shield-lock">
						Documents are encrypted, reviewed and then deleted. We never share
						them with third parties outside regulatory obligations.
					</Notice>
				</div>
			</Modal>

			<Modal
				open={abortOpen}
				onClose={() => setAbortOpen(false)}
				title="Cancel verification?"
				icon="bi-x-octagon"
				tone="amber"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setAbortOpen(false)}>
							Keep verifying
						</Button>
						<Button variant="danger" onClick={() => go("/auth/account-status")}>
							Cancel
						</Button>
					</>
				}
			>
				Your account stays limited until verification completes. You can restart
				at any time from the account status page.
			</Modal>
		</AuthPage>
	);
}

function UploadTile({
	done,
	icon,
	title,
	hint,
	onPick,
}: {
	done: boolean;
	icon: string;
	title: string;
	hint: string;
	onPick: () => void;
}) {
	return (
		<button
			type="button"
			className={cx(s.option, done && s.optionOn)}
			style={{
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
				padding: "1.2rem",
			}}
			onClick={onPick}
		>
			<span className={cx(s.tile, s.tileLg, done ? s.tileGreen : s.tileSlate)}>
				<i className={`bi ${done ? "bi-check-lg" : icon}`} />
			</span>
			<span className={s.optionTitle} style={{ marginTop: "0.6rem" }}>
				{title}
			</span>
			<span className={s.optionSub}>
				{done ? "Uploaded · tap to replace" : hint}
			</span>
		</button>
	);
}
