/* ============================================================================
 * AccountStatus.tsx — Paymo BAAS · Account status & restoration
 * ----------------------------------------------------------------------------
 * A task board for a restricted account: what is locked, what unlocks it, and
 * exactly how far along each application is.
 *
 * Each of the six verification tasks opens its own purpose-built multi-step
 * wizard (5–6 steps, see ../components/TaskWizards). Submitting a wizard turns
 * the task into a tracked application with a live progress bar and status
 * badges (Pending → In review → Resolved); once resolved, the tracker offers
 * "Proceed to account", which routes to /auth/hub.
 *
 * Routes/links preserved: /auth/identity · /auth/security · /auth/login ·
 * /auth/hub · verify.paymo.com deep links · tel/mailto/support links
 * ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import {
	ApplicationTracker,
	createSubmission,
	percentOf,
	StatusBadge,
	statusOf,
} from "../components/ApplicationTracker";
import type { Tone } from "../components/AuthKit";
import {
	AuthConsole,
	AuthPage,
	Badge,
	Button,
	Card,
	cx,
	go,
	Hero,
	Modal,
	Notice,
	Progress,
	Section,
	s,
	toast,
} from "../components/AuthKit";
import { TaskWizard } from "../components/TaskWizards";
import type { Submission } from "../components/WizardKit";

interface Task {
	id: string;
	icon: string;
	tone: Tone;
	title: string;
	status: string;
	statusTone: "red" | "amber" | "slate";
	summary: string;
	details: Array<[string, string]>;
	action: string;
	steps: number;
	progress: number;
	url: string;
	internal?: string;
}

const TASKS: Task[] = [
	{
		id: "identity-verification",
		icon: "bi-person-vcard",
		tone: "green",
		title: "Verify your identity",
		status: "Required",
		statusTone: "red",
		summary: "Government ID, proof of address and a live selfie.",
		details: [
			["Documents", "3 items"],
			["Time", "5–10 min"],
			["Review", "24–48 h"],
		],
		action: "Start verification",
		steps: 5,
		progress: 0,
		url: "https://verify.paymo.com/identity/kyc",
		internal: "/auth/identity",
	},
	{
		id: "bank-verification",
		icon: "bi-bank",
		tone: "blue",
		title: "Verify linked accounts",
		status: "Required",
		statusTone: "red",
		summary: "Confirm ownership of 2 bank accounts and 1 mobile wallet.",
		details: [
			["Bank accounts", "2 pending"],
			["Wallets", "1 pending"],
			["Method", "Micro-deposit"],
		],
		action: "Verify accounts",
		steps: 5,
		progress: 25,
		url: "https://verify.paymo.com/linked-accounts",
	},
	{
		id: "transaction-review",
		icon: "bi-arrow-left-right",
		tone: "amber",
		title: "Review flagged transactions",
		status: "4 pending",
		statusTone: "amber",
		summary: "Confirm four transactions flagged for unusual patterns.",
		details: [
			["Flagged", "4 transactions"],
			["Value", "KES 2,450,000"],
			["Window", "Last 14 days"],
		],
		action: "Review now",
		steps: 5,
		progress: 40,
		url: "https://verify.paymo.com/transactions/review",
	},
	{
		id: "dispute-resolution",
		icon: "bi-people",
		tone: "violet",
		title: "Resolve customer dispute",
		status: "1 active",
		statusTone: "amber",
		summary: "Provide evidence for dispute #DSP-2024-8842.",
		details: [
			["Dispute", "#DSP-2024-8842"],
			["Amount", "KES 150,000"],
			["Response due", "48 hours"],
		],
		action: "Resolve dispute",
		steps: 6,
		progress: 15,
		url: "https://verify.paymo.com/disputes/resolve",
	},
	{
		id: "fraud-appeal",
		icon: "bi-exclamation-circle",
		tone: "red",
		title: "Fraud flag appeal",
		status: "High priority",
		statusTone: "red",
		summary: "Submit documentation proving the volume spike was legitimate.",
		details: [
			["Reason", "Volume spike"],
			["Evidence", "Business docs"],
			["Priority", "Urgent"],
		],
		action: "Submit appeal",
		steps: 6,
		progress: 5,
		url: "https://verify.paymo.com/compliance/fraud-appeal",
	},
	{
		id: "business-verification",
		icon: "bi-building",
		tone: "blue",
		title: "Business verification (KYB)",
		status: "Optional",
		statusTone: "slate",
		summary: "Unlock higher limits with corporate documents.",
		details: [
			["Entity", "Private Limited"],
			["Docs", "CAC, Tax ID"],
			["Current limit", "KES 10M/mo"],
		],
		action: "Start KYB",
		steps: 6,
		progress: 60,
		url: "https://verify.paymo.com/business/kyb",
	},
];

const MODULES = [
	{ label: "Transfers", locked: true },
	{ label: "Withdrawals", locked: true },
	{ label: "Bill payments", locked: true },
	{ label: "View balances", locked: false },
	{ label: "Support", locked: false },
];

const WARNINGS = [
	"Creating new accounts to bypass restrictions permanently suspends every linked account.",
	"False documentation is a criminal offence and is reported to the authorities.",
	"Recovery must complete within 30 days or the account becomes dormant.",
	"Third-party “recovery agents” are fraudulent — Paymo never asks for your password or PIN.",
];

const TIPS = [
	"Upload sharp, uncropped documents — blurry scans add 3–5 days.",
	"Names must match your Paymo profile exactly, including middle names.",
	"For disputes, attach the full communication trail and delivery receipts.",
	"Verify during daylight hours for better selfie lighting.",
];

const CONTACTS = [
	{
		icon: "bi-telephone",
		label: "Call 800-PAYMO-HELP",
		href: "tel:+234800PAYMO",
	},
	{
		icon: "bi-envelope",
		label: "Email recovery team",
		href: "mailto:recovery@paymo.com",
	},
	{
		icon: "bi-chat-dots",
		label: "Live chat",
		href: "https://support.paymo.com/live-chat",
	},
	{
		icon: "bi-calendar-check",
		label: "Schedule callback",
		href: "https://support.paymo.com/schedule-callback",
	},
];

/** Applications advance one stage on this cadence so the tracker stays live. */
const STAGE_TICK_MS = 7000;

export default function AccountStatus() {
	const [detail, setDetail] = useState<Task | null>(null);
	const [wizard, setWizard] = useState<Task | null>(null);
	const [tracking, setTracking] = useState<string | null>(null);
	const [apps, setApps] = useState<Record<string, Submission>>({});
	const [warnOpen, setWarnOpen] = useState(false);
	const [tipsOpen, setTipsOpen] = useState(false);
	const announced = useRef<Set<string>>(new Set());

	/* ---- applications advance through their pipeline on their own -------- */
	useEffect(() => {
		const id = window.setInterval(() => {
			setApps((prev) => {
				const entries = Object.entries(prev);
				if (!entries.length) return prev;
				let changed = false;
				const next: Record<string, Submission> = {};
				for (const [key, app] of entries) {
					if (app.stage < app.stages.length - 1) {
						changed = true;
						next[key] = { ...app, stage: app.stage + 1 };
					} else {
						next[key] = app;
					}
				}
				return changed ? next : prev;
			});
		}, STAGE_TICK_MS);
		return () => window.clearInterval(id);
	}, []);

	/* ---- announce decisions once ---------------------------------------- */
	useEffect(() => {
		for (const app of Object.values(apps)) {
			if (statusOf(app) !== "resolved" || announced.current.has(app.ref))
				continue;
			announced.current.add(app.ref);
			toast.success(app.outcome, `${app.title} · ${app.ref}`, {
				duration: 9000,
				action: {
					label: "View",
					onClick: () => setTracking(app.taskId),
				},
			});
		}
	}, [apps]);

	const appList = useMemo(() => Object.values(apps), [apps]);

	const taskPercent = (t: Task) => {
		const app = apps[t.id];
		return app ? Math.max(t.progress, percentOf(app)) : t.progress;
	};

	const overall = useMemo(() => {
		const sum = TASKS.reduce((n, t) => {
			const app = apps[t.id];
			return n + (app ? Math.max(t.progress, percentOf(app)) : t.progress);
		}, 0);
		return Math.round(sum / TASKS.length);
	}, [apps]);

	const requiredLeft = TASKS.filter((t) => {
		const app = apps[t.id];
		return t.statusTone === "red" && !(app && statusOf(app) === "resolved");
	}).length;
	const allClear = requiredLeft === 0;

	const openWizard = (t: Task) => {
		setDetail(null);
		setWizard(t);
	};

	const submitWizard = (t: Task, summary: Array<[string, string]>) => {
		const app = createSubmission(t, summary);
		setApps((prev) => ({ ...prev, [t.id]: app }));
		setWizard(null);
		toast.success("Application submitted", `${t.title} · ${app.ref}`, {
			duration: 8000,
			action: { label: "Track", onClick: () => setTracking(t.id) },
		});
		window.setTimeout(() => setTracking(t.id), 500);
	};

	return (
		<AuthPage>
			<AuthConsole
				crumb="Account recovery centre"
				actions={
					<>
						<Badge tone={allClear ? "green" : "amber"} icon="bi-lock-fill">
							{allClear ? "Restrictions lifted" : "Limited access mode"}
						</Badge>
						<Button
							variant="ghost"
							size="sm"
							icon="bi-shield-check"
							onClick={() => go("/auth/security")}
						>
							Security centre
						</Button>
					</>
				}
			>
				<Hero
					zone="ACCOUNT STATUS"
					title={
						allClear
							? "You're cleared — welcome back."
							: "Access restricted — here's the way back."
					}
					copy="Each task below opens a guided wizard. Submit it once and track the decision live; nothing else is required from you."
					chips={
						<>
							<Badge tone="onDark">
								{allClear ? "Review complete" : "Account frozen"}
							</Badge>
							<Badge tone="onDark">
								{appList.length
									? `${appList.length} application${appList.length > 1 ? "s" : ""} filed`
									: "Under review"}
							</Badge>
						</>
					}
					stats={[
						{ value: `${overall}%`, label: "Restored" },
						{
							value: String(requiredLeft),
							label: "Required left",
							warn: requiredLeft > 0,
						},
						{ value: "30d", label: "Deadline" },
					]}
					actions={
						allClear ? (
							<Button
								size="sm"
								variant="primary"
								icon="bi-box-arrow-in-right"
								onClick={() => go("/auth/hub")}
							>
								Proceed to account
							</Button>
						) : (
							<Button
								size="sm"
								variant="dark"
								icon="bi-headset"
								onClick={() => setTipsOpen(true)}
							>
								Unlock faster
							</Button>
						)
					}
				/>

				<Card
					title="Restoration progress"
					sub="Weighted across all verification tasks."
					icon="bi-unlock"
					tone={allClear ? "green" : "amber"}
				>
					<Progress value={overall} />
					<div className={s.row} style={{ marginTop: "0.8rem" }}>
						{MODULES.map((m) => {
							const locked = m.locked && !allClear;
							return (
								<span
									key={m.label}
									className={cx(s.badge, locked ? s.badgeRed : s.badgeGreen)}
								>
									<i className={locked ? "bi bi-lock-fill" : "bi bi-unlock"} />{" "}
									{m.label}
								</span>
							);
						})}
					</div>
					<div className={s.spread} style={{ marginTop: "0.9rem" }}>
						<span className={s.tiny}>
							{allClear
								? "Risk level: Cleared · full access available"
								: "Risk level: High · immediate action required"}
						</span>
						<Button
							size="sm"
							variant="subtle"
							icon="bi-exclamation-triangle"
							onClick={() => setWarnOpen(true)}
						>
							Read the warnings
						</Button>
					</div>
				</Card>

				<Section
					no="1"
					title="Verification tasks"
					sub="Required items must be finished before access is restored."
				/>
				<div className={s.grid} style={{ ["--au-min" as string]: "320px" }}>
					{TASKS.map((t) => {
						const app = apps[t.id];
						const status = app ? statusOf(app) : null;
						const pct = taskPercent(t);
						return (
							<Card key={t.id} hover onClick={() => setDetail(t)}>
								<div className={s.cardHead}>
									<span
										className={cx(
											s.tile,
											s[`tile${t.tone[0].toUpperCase()}${t.tone.slice(1)}`],
										)}
									>
										<i className={`bi ${t.icon}`} />
									</span>
									<div className={s.grow}>
										<div className={s.cardTitle}>{t.title}</div>
										<p className={s.cardSub}>{t.summary}</p>
									</div>
									{status ? (
										<StatusBadge status={status} />
									) : (
										<Badge tone={t.statusTone}>{t.status}</Badge>
									)}
								</div>
								<div className={s.row} style={{ marginBottom: "0.7rem" }}>
									{app ? (
										<>
											<span className={s.metaChip}>
												Ref: <b>{app.ref}</b>
											</span>
											<span className={s.metaChip}>
												Stage:{" "}
												<b>
													{Math.min(app.stage + 1, app.stages.length)}/
													{app.stages.length}
												</b>
											</span>
											<span className={s.metaChip}>
												SLA: <b>{app.sla}</b>
											</span>
										</>
									) : (
										<>
											{t.details.map(([k, v]) => (
												<span className={s.metaChip} key={k}>
													{k}: <b>{v}</b>
												</span>
											))}
											<span className={s.metaChip}>
												Wizard: <b>{t.steps} steps</b>
											</span>
										</>
									)}
								</div>
								<Progress value={pct} sm />
								<div className={s.spread} style={{ marginTop: "0.7rem" }}>
									<span className={s.tiny}>
										{app
											? status === "resolved"
												? app.outcome
												: app.stages[app.stage].label
											: `${pct}% complete`}
									</span>
									{app ? (
										<Button
											size="sm"
											variant={status === "resolved" ? "primary" : "subtle"}
											icon={
												status === "resolved"
													? "bi-box-arrow-in-right"
													: "bi-activity"
											}
											onClick={(e) => {
												e.stopPropagation();
												setTracking(t.id);
											}}
										>
											{status === "resolved"
												? "View decision"
												: "Track application"}
										</Button>
									) : (
										<Button
											size="sm"
											variant={t.statusTone === "red" ? "primary" : "ghost"}
											onClick={(e) => {
												e.stopPropagation();
												openWizard(t);
											}}
										>
											{t.action}
										</Button>
									)}
								</div>
							</Card>
						);
					})}
				</div>

				{appList.length > 0 && (
					<>
						<Section
							no="2"
							title="Applications in review"
							sub="Live status from the compliance queue — updates on its own."
							actions={
								allClear ? (
									<Button
										size="sm"
										icon="bi-box-arrow-in-right"
										onClick={() => go("/auth/hub")}
									>
										Proceed to account
									</Button>
								) : undefined
							}
						/>
						<Card flush>
							<div className={s.stack}>
								{appList.map((app) => {
									const status = statusOf(app);
									return (
										<div className={s.listRow} key={app.ref}>
											<span
												className={cx(
													s.tile,
													s.tileSm,
													s[
														`tile${app.tone[0].toUpperCase()}${app.tone.slice(1)}`
													],
												)}
											>
												<i className={`bi ${app.icon}`} />
											</span>
											<span className={s.grow}>
												<span className={s.optionTitle}>{app.title}</span>
												<span
													className={s.optionSub}
													style={{ display: "block" }}
												>
													<span className={s.mono}>{app.ref}</span> ·{" "}
													{status === "resolved"
														? app.outcome
														: app.stages[app.stage].label}
												</span>
											</span>
											<span style={{ width: 120 }}>
												<Progress value={percentOf(app)} sm />
											</span>
											<StatusBadge status={status} />
											<Button
												size="sm"
												variant={status === "resolved" ? "primary" : "ghost"}
												icon="bi-activity"
												onClick={() => setTracking(app.taskId)}
											>
												{status === "resolved" ? "Continue" : "Progress"}
											</Button>
										</div>
									);
								})}
							</div>
						</Card>
					</>
				)}

				<Section
					no={appList.length > 0 ? "3" : "2"}
					title="Need a hand?"
					sub="The recovery desk is staffed 24/7."
				/>
				<Card>
					<div className={s.grid} style={{ ["--au-min" as string]: "220px" }}>
						{CONTACTS.map((c) => (
							<a
								key={c.label}
								className={cx(s.listRow)}
								href={c.href}
								target={c.href.startsWith("http") ? "_blank" : undefined}
								rel="noreferrer"
								style={{ textDecoration: "none", color: "inherit" }}
							>
								<span className={cx(s.tile, s.tileSm, s.tileGreen)}>
									<i className={`bi ${c.icon}`} />
								</span>
								<span className={cx(s.grow, s.optionTitle)}>{c.label}</span>
								<i
									className="bi bi-chevron-right"
									style={{ color: "#98a2b3" }}
								/>
							</a>
						))}
					</div>
					<Notice tone="red" icon="bi-shield-exclamation">
						Paymo will never ask for your password, PIN or OTP by phone or
						email.{" "}
						<button
							type="button"
							className={s.link}
							onClick={() => setWarnOpen(true)}
						>
							See all warnings
						</button>
					</Notice>
				</Card>

				<div className={s.footNote}>
					<span>
						Route: /recovery/verify?status=restricted&amp;priority=high
					</span>
					<a className={s.link} href="/auth/login">
						Back to sign in
					</a>
				</div>
			</AuthConsole>

			{/* ---------------- task detail ---------------- */}
			<Modal
				open={!!detail}
				onClose={() => setDetail(null)}
				title={detail?.title ?? ""}
				sub={detail?.summary}
				icon={detail?.icon}
				tone={detail?.tone}
				footer={
					<>
						<Button variant="ghost" onClick={() => setDetail(null)}>
							Close
						</Button>
						{detail &&
							(apps[detail.id] ? (
								<Button
									icon="bi-activity"
									onClick={() => {
										const id = detail.id;
										setDetail(null);
										setTracking(id);
									}}
								>
									Track application
								</Button>
							) : (
								<Button icon="bi-ui-checks" onClick={() => openWizard(detail)}>
									{detail.action} · {detail.steps} steps
								</Button>
							))}
					</>
				}
			>
				<div className={s.stack}>
					{detail?.details.map(([k, v]) => (
						<div className={s.spread} key={k}>
							<span className={s.tiny}>{k}</span>
							<span className={s.strong}>{v}</span>
						</div>
					))}
					<hr className={s.divider} />
					<div className={s.spread}>
						<span className={s.tiny}>Progress</span>
						<span className={s.strong}>
							{detail ? taskPercent(detail) : 0}%
						</span>
					</div>
					<Progress value={detail ? taskPercent(detail) : 0} sm />
					<Notice tone="slate" icon="bi-link-45deg">
						Prefer the legacy portal? Open{" "}
						<a
							className={s.link}
							href={detail?.url}
							target="_blank"
							rel="noreferrer"
						>
							{detail?.url}
						</a>
						{detail?.internal && (
							<>
								{" "}
								or the full page at{" "}
								<a className={s.link} href={detail.internal}>
									{detail.internal}
								</a>
							</>
						)}
						.
					</Notice>
				</div>
			</Modal>

			{/* ---------------- the six multi-step wizards ---------------- */}
			<TaskWizard
				taskId={wizard?.id ?? null}
				open={!!wizard}
				onClose={() => setWizard(null)}
				onSubmit={(summary) => wizard && submitWizard(wizard, summary)}
			/>

			{/* ---------------- live application tracker ---------------- */}
			<ApplicationTracker
				app={tracking ? (apps[tracking] ?? null) : null}
				open={!!tracking && !!apps[tracking ?? ""]}
				onClose={() => setTracking(null)}
			/>

			{/* ---------------- warnings ---------------- */}
			<Modal
				open={warnOpen}
				onClose={() => setWarnOpen(false)}
				title="Important warnings"
				sub="Read before you submit anything."
				icon="bi-exclamation-triangle"
				tone="red"
				footer={
					<Button variant="ghost" onClick={() => setWarnOpen(false)}>
						Understood
					</Button>
				}
			>
				<ul className={s.stack} style={{ paddingLeft: "1.1rem", margin: 0 }}>
					{WARNINGS.map((w) => (
						<li key={w}>{w}</li>
					))}
				</ul>
			</Modal>

			{/* ---------------- tips ---------------- */}
			<Modal
				open={tipsOpen}
				onClose={() => setTipsOpen(false)}
				title="Unlock faster"
				sub="Four habits that cut review time in half."
				icon="bi-lightbulb"
				tone="amber"
				footer={
					<Button
						onClick={() => {
							setTipsOpen(false);
							toast.success(
								"Checklist saved",
								"We emailed the checklist to your recovery address.",
							);
						}}
					>
						Email me this checklist
					</Button>
				}
			>
				<div className={s.stack}>
					{TIPS.map((t) => (
						<div className={s.listRow} key={t}>
							<i
								className="bi bi-check-circle-fill"
								style={{ color: "#12b76a" }}
							/>
							<span className={s.grow}>{t}</span>
						</div>
					))}
				</div>
			</Modal>
		</AuthPage>
	);
}
