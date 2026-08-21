/* ============================================================================
 * AccountStatus.tsx — Paymo BAAS · Account status & restoration
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit.
 * The legacy 633-line wall of warnings and tips is now a task board: what is
 * restricted, what unlocks it, and how far along each task is.
 *
 * Kept: all six verification tasks with their original destination URLs,
 * restricted-module list, warnings, unlock tips and the 24/7 contact options.
 * Added: overall restoration progress, task detail dialog, warnings/tips moved
 * into dialogs, toasts and an appeal-submitted flow.
 *
 * Routes/links preserved: /auth/identity · /auth/security · /auth/login ·
 * verify.paymo.com deep links · tel/mailto/support links
 * ========================================================================== */

import { useMemo, useState } from "react";
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

type Tone = "green" | "blue" | "amber" | "violet" | "red";

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
			["Value", "NGN 2,450,000"],
			["Window", "Last 14 days"],
		],
		action: "Review now",
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
			["Amount", "NGN 150,000"],
			["Response due", "48 hours"],
		],
		action: "Resolve dispute",
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
			["Current limit", "NGN 10M/mo"],
		],
		action: "Start KYB",
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

export default function AccountStatus() {
	const [tasks, setTasks] = useState(TASKS);
	const [detail, setDetail] = useState<Task | null>(null);
	const [warnOpen, setWarnOpen] = useState(false);
	const [tipsOpen, setTipsOpen] = useState(false);

	const overall = useMemo(
		() =>
			Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length),
		[tasks],
	);
	const required = tasks.filter((t) => t.statusTone === "red").length;

	const openTask = (t: Task) => {
		setDetail(null);
		if (t.internal) {
			toast.info("Opening verification", "Redirecting to the identity flow…");
			window.setTimeout(() => go(t.internal as string), 700);
			return;
		}
		toast.info("Opening secure portal", `${t.title} · verify.paymo.com`);
		window.open(t.url, "_blank", "noopener");
		setTasks((prev) =>
			prev.map((x) =>
				x.id === t.id ? { ...x, progress: Math.min(95, x.progress + 10) } : x,
			),
		);
	};

	return (
		<AuthPage>
			<AuthConsole
				crumb="Account recovery centre"
				actions={
					<>
						<Badge tone="amber" icon="bi-lock-fill">
							Limited access mode
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
					title="Access restricted — here's the way back."
					copy="Complete the required tasks below to lift every restriction. Most accounts are restored within 48 hours."
					chips={
						<>
							<Badge tone="onDark">Account frozen</Badge>
							<Badge tone="onDark">Under review</Badge>
						</>
					}
					stats={[
						{ value: `${overall}%`, label: "Restored" },
						{ value: String(required), label: "Required", warn: required > 0 },
						{ value: "30d", label: "Deadline" },
					]}
					actions={
						<Button
							size="sm"
							variant="dark"
							icon="bi-headset"
							onClick={() => setTipsOpen(true)}
						>
							Unlock faster
						</Button>
					}
				/>

				<Card
					title="Restoration progress"
					sub="Weighted across all verification tasks."
					icon="bi-unlock"
					tone="amber"
				>
					<Progress value={overall} />
					<div className={s.row} style={{ marginTop: "0.8rem" }}>
						{MODULES.map((m) => (
							<span
								key={m.label}
								className={cx(s.badge, m.locked ? s.badgeRed : s.badgeGreen)}
							>
								<i className={m.locked ? "bi bi-lock-fill" : "bi bi-unlock"} />{" "}
								{m.label}
							</span>
						))}
					</div>
					<div className={s.spread} style={{ marginTop: "0.9rem" }}>
						<span className={s.tiny}>
							Risk level: High · immediate action required
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
					{tasks.map((t) => (
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
								<Badge tone={t.statusTone}>{t.status}</Badge>
							</div>
							<div className={s.row} style={{ marginBottom: "0.7rem" }}>
								{t.details.map(([k, v]) => (
									<span className={s.metaChip} key={k}>
										{k}: <b>{v}</b>
									</span>
								))}
							</div>
							<Progress value={t.progress} sm />
							<div className={s.spread} style={{ marginTop: "0.7rem" }}>
								<span className={s.tiny}>{t.progress}% complete</span>
								<Button
									size="sm"
									variant={t.statusTone === "red" ? "primary" : "ghost"}
									onClick={(e) => {
										e.stopPropagation();
										openTask(t);
									}}
								>
									{t.action}
								</Button>
							</div>
						</Card>
					))}
				</div>

				<Section
					no="2"
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
						{detail && (
							<Button onClick={() => openTask(detail)}>{detail.action}</Button>
						)}
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
						<span className={s.strong}>{detail?.progress}%</span>
					</div>
					<Progress value={detail?.progress ?? 0} sm />
					<Notice tone="slate" icon="bi-link-45deg">
						Opens{" "}
						<span className={s.mono}>{detail?.internal ?? detail?.url}</span>
					</Notice>
				</div>
			</Modal>

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
