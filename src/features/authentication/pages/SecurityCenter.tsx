/* ============================================================================
 * SecurityCenter.tsx — Paymo BAAS · Sessions & security centre
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit.
 * The legacy 1,603-line page is reorganised into a single console: score,
 * active sessions, login history, alert rules, connected apps and emergency
 * controls — each an actionable card instead of a wall of copy.
 *
 * Added: revoke / revoke-all dialogs, app permission drawer-style modal,
 * threshold editing, CSV export, "freeze account" confirmation and toasts.
 *
 * Routes/links preserved: /auth/passkeys · /auth/mfa · /auth/recovery ·
 * /auth/login · /auth/hub
 * ========================================================================== */

import { useMemo, useState } from "react";
import {
	AuthConsole,
	AuthPage,
	Badge,
	Button,
	Card,
	Chip,
	cx,
	Field,
	go,
	Hero,
	Input,
	Modal,
	Notice,
	Progress,
	Section,
	Select,
	Switch,
	s,
	toast,
} from "../components/AuthKit";

interface Session {
	id: number;
	device: string;
	icon: string;
	location: string;
	ip: string;
	last: string;
	current: boolean;
	trusted: boolean;
}

const SESSIONS: Session[] = [
	{
		id: 1,
		device: "iPhone 15 Pro",
		icon: "bi-phone",
		location: "Nairobi, Kenya",
		ip: "192.168.x.x",
		last: "Active now",
		current: true,
		trusted: true,
	},
	{
		id: 2,
		device: "Chrome on MacBook",
		icon: "bi-laptop",
		location: "Nairobi, Kenya",
		ip: "197.x.x.x",
		last: "2 hours ago",
		current: false,
		trusted: true,
	},
	{
		id: 3,
		device: "Safari on iPad",
		icon: "bi-tablet",
		location: "Accra, Ghana",
		ip: "154.x.x.x",
		last: "3 days ago",
		current: false,
		trusted: false,
	},
	{
		id: 4,
		device: "Edge on Windows",
		icon: "bi-pc-display",
		location: "London, UK",
		ip: "82.x.x.x",
		last: "6 days ago",
		current: false,
		trusted: false,
	},
];

const SCORE_PARTS = [
	{ key: "password", label: "Strong password", points: 20, done: true },
	{ key: "twofa", label: "2FA enabled", points: 25, done: true },
	{ key: "passkey", label: "Passkey enrolled", points: 20, done: true },
	{ key: "biometric", label: "Biometric unlock", points: 10, done: true },
	{ key: "review", label: "Recent security review", points: 10, done: false },
	{ key: "clean", label: "No suspicious activity", points: 15, done: true },
];

const HISTORY: Array<[string, string, string, string, string]> = [
	[
		"11 Jun 09:14",
		"iPhone 15 Pro · Paymo iOS",
		"Nairobi",
		"Passkey",
		"Success",
	],
	[
		"11 Jun 06:45",
		"MacBook Pro · Chrome",
		"Nairobi",
		"Password + MFA",
		"Success",
	],
	["10 Jun 23:02", "Unknown Windows · Chrome", "Dubai", "Password", "Step-up"],
	["10 Jun 03:18", "Unknown Android · Chrome", "London", "Password", "Failed"],
	["09 Jun 18:40", "iPad Pro · Safari", "Accra", "PIN", "Success"],
	["08 Jun 02:11", "Unknown Linux · Firefox", "Moscow", "Password", "Blocked"],
];

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "violet"> = {
	Success: "green",
	Failed: "amber",
	Blocked: "red",
	"Step-up": "violet",
};

const ALERTS = [
	{
		key: "newDevice",
		label: "New device login",
		desc: "Email + push",
		on: true,
	},
	{
		key: "password",
		label: "Password or PIN changed",
		desc: "Email + SMS + push",
		on: true,
	},
	{
		key: "largeTxn",
		label: "Large transaction initiated",
		desc: "Push above threshold",
		on: true,
		threshold: 10000,
	},
	{
		key: "apiKey",
		label: "API key created or rotated",
		desc: "Email to admins",
		on: true,
	},
	{
		key: "failedLogin",
		label: "Repeated failed logins",
		desc: "Email",
		on: false,
	},
	{
		key: "suspicious",
		label: "Suspicious activity detected",
		desc: "SMS + push",
		on: true,
	},
];

const APPS = [
	{
		id: "xero",
		name: "Xero Accounting",
		icon: "bi-receipt",
		last: "Used 1 hour ago",
		risk: "Low" as const,
		perms: ["Read balances", "Read transactions", "Export statements"],
	},
	{
		id: "slack",
		name: "Slack Alerts",
		icon: "bi-bell",
		last: "Used today",
		risk: "Low" as const,
		perms: ["Send security notifications"],
	},
	{
		id: "payroll",
		name: "Northstar Payroll",
		icon: "bi-people",
		last: "Used 4 days ago",
		risk: "Medium" as const,
		perms: ["Read wallets", "Initiate payouts", "View beneficiaries"],
	},
	{
		id: "legacy",
		name: "Legacy BI Connector",
		icon: "bi-database",
		last: "Used 61 days ago",
		risk: "High" as const,
		perms: ["Read transactions", "Read customers", "Export CSV"],
	},
];

const RISK_TONE = { Low: "green", Medium: "amber", High: "red" } as const;

export default function SecurityCenter() {
	const [sessions, setSessions] = useState(SESSIONS);
	const [parts, setParts] = useState(SCORE_PARTS);
	const [alerts, setAlerts] = useState(ALERTS);
	const [apps, setApps] = useState(APPS);
	const [autoLogout, setAutoLogout] = useState("480");
	const [filter, setFilter] = useState<
		"all" | "Success" | "Failed" | "Blocked"
	>("all");

	const [revoking, setRevoking] = useState<Session | null>(null);
	const [revokeAllOpen, setRevokeAllOpen] = useState(false);
	const [appOpen, setAppOpen] = useState<(typeof APPS)[number] | null>(null);
	const [freezeOpen, setFreezeOpen] = useState(false);
	const [thresholdOpen, setThresholdOpen] = useState(false);
	const [threshold, setThreshold] = useState("10000");

	const score = useMemo(
		() => parts.reduce((total, p) => total + (p.done ? p.points : 0), 0),
		[parts],
	);
	const rows = useMemo(
		() => (filter === "all" ? HISTORY : HISTORY.filter((r) => r[4] === filter)),
		[filter],
	);
	const openActions = parts.filter((p) => !p.done).length;

	const revokeSession = () => {
		if (!revoking) return;
		setSessions((prev) => prev.filter((x) => x.id !== revoking.id));
		toast.warning("Session revoked", `${revoking.device} was signed out.`);
		setRevoking(null);
	};

	const revokeAll = () => {
		setSessions((prev) => prev.filter((x) => x.current));
		setRevokeAllOpen(false);
		toast.success(
			"Other sessions ended",
			"Only this device is still signed in.",
		);
	};

	const exportHistory = () => {
		const csv = [
			"time,device,location,method,result",
			...HISTORY.map((r) => r.join(",")),
		].join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "paymo-login-history.csv";
		a.click();
		URL.revokeObjectURL(a.href);
		toast.success("History exported", "90 days of login events saved as CSV.");
	};

	return (
		<AuthPage>
			<AuthConsole
				crumb="Security · Sessions & controls"
				actions={
					<>
						<Button
							variant="ghost"
							size="sm"
							icon="bi-fingerprint"
							onClick={() => go("/auth/passkeys")}
						>
							Passkeys
						</Button>
						<Button
							variant="dangerGhost"
							size="sm"
							icon="bi-snow"
							onClick={() => setFreezeOpen(true)}
						>
							Freeze account
						</Button>
					</>
				}
			>
				<Hero
					zone="SECURITY CENTRE"
					title="Everything guarding your money."
					copy="Devices, login history, app access and alert rules — reviewed in one place."
					chips={
						<>
							<Badge tone="onDark">Amara Okafor</Badge>
							<Badge tone="onDark">Last review 34 days ago</Badge>
						</>
					}
					stats={[
						{ value: String(sessions.length), label: "Sessions" },
						{ value: `${score}`, label: "Score" },
						{
							value: String(openActions),
							label: "Open actions",
							warn: openActions > 0,
						},
					]}
					actions={
						<Button
							size="sm"
							variant="dark"
							icon="bi-box-arrow-right"
							onClick={() => setRevokeAllOpen(true)}
						>
							Sign out others
						</Button>
					}
				/>

				{/* ---------------- score ---------------- */}
				<Card
					title="Security score"
					sub={
						score >= 85
							? "Strong — finish the last item to reach 100."
							: "Room to improve."
					}
					icon="bi-shield-check"
					actions={
						<Badge tone={score >= 85 ? "green" : "amber"}>{score}/100</Badge>
					}
				>
					<Progress value={score} />
					<div className={s.row} style={{ marginTop: "0.8rem" }}>
						{parts.map((p) => (
							<button
								key={p.key}
								type="button"
								className={cx(s.badge, p.done ? s.badgeGreen : s.badgeAmber)}
								style={{ border: 0, cursor: p.done ? "default" : "pointer" }}
								onClick={() => {
									if (p.done) return;
									setParts((prev) =>
										prev.map((x) =>
											x.key === p.key ? { ...x, done: true } : x,
										),
									);
									toast.success(
										"Nice work",
										`${p.label} completed — +${p.points} points.`,
									);
								}}
							>
								<i
									className={
										p.done ? "bi bi-check-circle-fill" : "bi bi-circle"
									}
								/>{" "}
								{p.label}
								{!p.done && ` · +${p.points}`}
							</button>
						))}
					</div>
				</Card>

				{/* ---------------- sessions ---------------- */}
				<Section
					no="1"
					title="Active sessions"
					sub="Anything you don't recognise should be revoked immediately."
					actions={
						<Button
							size="sm"
							variant="ghost"
							icon="bi-box-arrow-right"
							onClick={() => setRevokeAllOpen(true)}
						>
							Sign out all others
						</Button>
					}
				/>
				<div className={s.stack}>
					{sessions.map((sess) => (
						<div
							key={sess.id}
							className={cx(
								s.listRow,
								sess.current && s.listRowAccent,
								!sess.trusted && s.listRowDanger,
							)}
						>
							<span
								className={cx(
									s.tile,
									sess.current
										? s.tileGreen
										: sess.trusted
											? s.tileSlate
											: s.tileRed,
								)}
							>
								<i className={`bi ${sess.icon}`} />
							</span>
							<div className={s.grow}>
								<div className={cx(s.row, s.rowTight)}>
									<span className={s.optionTitle}>{sess.device}</span>
									{sess.current ? (
										<Badge tone="green" icon="bi-broadcast">
											This device
										</Badge>
									) : sess.trusted ? (
										<Badge tone="slate">Trusted</Badge>
									) : (
										<Badge tone="red" icon="bi-exclamation-triangle">
											Unrecognised
										</Badge>
									)}
								</div>
								<div className={s.tiny}>
									{sess.location} · {sess.ip} · {sess.last}
								</div>
							</div>
							{!sess.current && (
								<Button
									size="sm"
									variant="dangerGhost"
									icon="bi-x-circle"
									onClick={() => setRevoking(sess)}
								>
									Revoke
								</Button>
							)}
						</div>
					))}
					<div className={s.spread}>
						<span className={s.tiny}>
							Automatically sign me out after inactivity
						</span>
						<div style={{ minWidth: 200 }}>
							<Select
								value={autoLogout}
								onChange={(e) => {
									setAutoLogout(e.target.value);
									toast.info(
										"Auto-logout updated",
										e.target.selectedOptions[0].text,
									);
								}}
							>
								<option value="15">15 minutes</option>
								<option value="60">1 hour</option>
								<option value="480">8 hours</option>
								<option value="never">Never</option>
							</Select>
						</div>
					</div>
				</div>

				{/* ---------------- history ---------------- */}
				<Section
					no="2"
					title="Login history"
					sub="Last 90 days across every Paymo surface."
					actions={
						<>
							{(["all", "Success", "Failed", "Blocked"] as const).map((f) => (
								<Chip key={f} on={filter === f} onClick={() => setFilter(f)}>
									{f === "all" ? "All" : f}
								</Chip>
							))}
							<Button
								size="sm"
								variant="ghost"
								icon="bi-download"
								onClick={exportHistory}
							>
								Export
							</Button>
						</>
					}
				/>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>When</th>
								<th>Device</th>
								<th>Location</th>
								<th>Method</th>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr key={r.join("-")}>
									<td>{r[0]}</td>
									<td className={s.strong}>{r[1]}</td>
									<td>{r[2]}</td>
									<td>{r[3]}</td>
									<td>
										<Badge tone={STATUS_TONE[r[4]]}>{r[4]}</Badge>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* ---------------- alerts + apps ---------------- */}
				<div className={s.grid} style={{ ["--au-min" as string]: "360px" }}>
					<Card
						title="Alert rules"
						sub="Where we reach you when something changes."
						icon="bi-bell"
						tone="amber"
					>
						<div className={s.stack}>
							{alerts.map((a) => (
								<div className={s.spread} key={a.key}>
									<div className={s.grow}>
										<div className={s.optionTitle}>{a.label}</div>
										<div className={s.tiny}>
											{a.desc}
											{a.threshold
												? ` · above KES ${Number(threshold).toLocaleString()}`
												: ""}
											{a.threshold ? (
												<button
													type="button"
													className={s.link}
													style={{ marginLeft: 6 }}
													onClick={() => setThresholdOpen(true)}
												>
													edit
												</button>
											) : null}
										</div>
									</div>
									<Switch
										on={a.on}
										label={a.label}
										onToggle={() => {
											setAlerts((prev) =>
												prev.map((x) =>
													x.key === a.key ? { ...x, on: !x.on } : x,
												),
											);
											toast.info(
												a.on ? "Alert muted" : "Alert enabled",
												a.label,
											);
										}}
									/>
								</div>
							))}
						</div>
					</Card>

					<Card
						title="Connected apps"
						sub="OAuth grants that can read or move money."
						icon="bi-plug"
						tone="violet"
					>
						<div className={s.stack}>
							{apps.map((app) => (
								<div className={s.listRow} key={app.id}>
									<span
										className={cx(
											s.tile,
											s.tileSm,
											s[
												`tile${RISK_TONE[app.risk][0].toUpperCase()}${RISK_TONE[app.risk].slice(1)}`
											],
										)}
									>
										<i className={`bi ${app.icon}`} />
									</span>
									<div className={s.grow}>
										<div className={cx(s.row, s.rowTight)}>
											<span className={s.optionTitle}>{app.name}</span>
											<Badge tone={RISK_TONE[app.risk]}>{app.risk} risk</Badge>
										</div>
										<div className={s.tiny}>
											{app.last} · {app.perms.length} permissions
										</div>
									</div>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setAppOpen(app)}
									>
										Manage
									</Button>
								</div>
							))}
						</div>
					</Card>
				</div>

				{/* ---------------- emergency ---------------- */}
				<Section
					no="3"
					title="Emergency controls"
					sub="Use these the moment something feels wrong."
				/>
				<div className={s.grid} style={{ ["--au-min" as string]: "260px" }}>
					<Card hover onClick={() => setRevokeAllOpen(true)}>
						<div className={s.row}>
							<span className={cx(s.tile, s.tileAmber)}>
								<i className="bi bi-box-arrow-right" />
							</span>
							<span className={s.grow}>
								<span className={s.optionTitle}>Sign out everywhere</span>
								<span className={s.optionSub} style={{ display: "block" }}>
									Ends every session except this one
								</span>
							</span>
						</div>
					</Card>
					<Card hover onClick={() => setFreezeOpen(true)}>
						<div className={s.row}>
							<span className={cx(s.tile, s.tileRed)}>
								<i className="bi bi-snow" />
							</span>
							<span className={s.grow}>
								<span className={s.optionTitle}>Freeze the account</span>
								<span className={s.optionSub} style={{ display: "block" }}>
									Blocks payouts, cards and API keys instantly
								</span>
							</span>
						</div>
					</Card>
					<Card hover onClick={() => go("/auth/recovery")}>
						<div className={s.row}>
							<span className={cx(s.tile, s.tileBlue)}>
								<i className="bi bi-key" />
							</span>
							<span className={s.grow}>
								<span className={s.optionTitle}>Rotate credentials</span>
								<span className={s.optionSub} style={{ display: "block" }}>
									Password, PIN and recovery codes
								</span>
							</span>
						</div>
					</Card>
				</div>
			</AuthConsole>

			{/* ---------------- modals ---------------- */}
			<Modal
				open={!!revoking}
				onClose={() => setRevoking(null)}
				title="Revoke this session?"
				sub={revoking ? `${revoking.device} · ${revoking.location}` : undefined}
				icon="bi-x-circle"
				tone="red"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setRevoking(null)}>
							Cancel
						</Button>
						<Button variant="danger" onClick={revokeSession}>
							Revoke session
						</Button>
					</>
				}
			>
				The device is signed out immediately and must re-authenticate with MFA.
			</Modal>

			<Modal
				open={revokeAllOpen}
				onClose={() => setRevokeAllOpen(false)}
				title="Sign out all other devices?"
				icon="bi-box-arrow-right"
				tone="amber"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setRevokeAllOpen(false)}>
							Cancel
						</Button>
						<Button variant="danger" onClick={revokeAll}>
							Sign out others
						</Button>
					</>
				}
			>
				{sessions.filter((x) => !x.current).length} other session(s) will end.
				Scheduled payouts and API keys are unaffected.
			</Modal>

			<Modal
				open={!!appOpen}
				onClose={() => setAppOpen(null)}
				title={appOpen?.name ?? ""}
				sub={appOpen ? `${appOpen.last} · ${appOpen.risk} risk` : undefined}
				icon="bi-plug"
				tone="violet"
				footer={
					<>
						<Button variant="ghost" onClick={() => setAppOpen(null)}>
							Close
						</Button>
						<Button
							variant="danger"
							icon="bi-trash"
							onClick={() => {
								if (!appOpen) return;
								setApps((prev) => prev.filter((a) => a.id !== appOpen.id));
								toast.warning(
									"Access revoked",
									`${appOpen.name} can no longer reach your data.`,
								);
								setAppOpen(null);
							}}
						>
							Revoke access
						</Button>
					</>
				}
			>
				<div className={s.stack}>
					<div className={s.label}>Granted permissions</div>
					{appOpen?.perms.map((p) => (
						<div className={s.listRow} key={p}>
							<i
								className="bi bi-check-circle-fill"
								style={{ color: "#12b76a" }}
							/>
							<span className={s.grow}>{p}</span>
						</div>
					))}
					{appOpen?.risk === "High" && (
						<Notice tone="red" icon="bi-exclamation-triangle">
							Unused for 61 days with export rights. Revoking is recommended.
						</Notice>
					)}
				</div>
			</Modal>

			<Modal
				open={thresholdOpen}
				onClose={() => setThresholdOpen(false)}
				title="Large transaction threshold"
				icon="bi-sliders"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setThresholdOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setThresholdOpen(false);
								toast.success(
									"Threshold saved",
									`Alerting above KES ${Number(threshold).toLocaleString()}.`,
								);
							}}
						>
							Save
						</Button>
					</>
				}
			>
				<Field label="Notify me above (KES)" htmlFor="thr">
					<Input
						id="thr"
						inputMode="numeric"
						value={threshold}
						onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ""))}
					/>
				</Field>
			</Modal>

			<Modal
				open={freezeOpen}
				onClose={() => setFreezeOpen(false)}
				title="Freeze this account?"
				sub="Emergency control — reversible after identity verification."
				icon="bi-snow"
				tone="red"
				footer={
					<>
						<Button variant="ghost" onClick={() => setFreezeOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="danger"
							icon="bi-snow"
							onClick={() => {
								setFreezeOpen(false);
								toast.danger(
									"Account frozen",
									"All money movement is blocked. Redirecting to status…",
								);
								window.setTimeout(() => go("/auth/account-status"), 1500);
							}}
						>
							Freeze now
						</Button>
					</>
				}
			>
				Payouts, cards, transfers and API keys stop instantly. Incoming funds
				still settle to your wallet. Unfreezing requires identity verification.
			</Modal>
		</AuthPage>
	);
}
