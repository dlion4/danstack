/* ============================================================================
 * Hub.tsx — Paymo BAAS · Dashboard hub
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit.
 * The legacy 1,171-line hub is condensed into a clean workspace picker.
 *
 * Kept: every dashboard with its original destination URL, account + category
 * filters, Cmd/Ctrl+K search, remembered default (localStorage), notifications,
 * session countdown and the custom-dashboard builder.
 * Added: preview dialog per workspace, keyboard-first search, empty state,
 * session-expiry warning and toasts throughout.
 *
 * Routes/links preserved: /pm/app/transfer-overview · /business-dashboard ·
 * /utility/ · /business/ · /dev-dashboard/ · /cards/app/card-command-center ·
 * /auth/security · /auth/login
 * ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import {
	AuthConsole,
	AuthPage,
	Badge,
	Button,
	Card,
	Check,
	Chip,
	cx,
	EmptyState,
	Field,
	go,
	Hero,
	Input,
	Modal,
	mmss,
	Notice,
	Section,
	Select,
	s,
	toast,
	useCountdown,
} from "../components/AuthKit";

type Account = "personal" | "business" | "developer";
type Category = "money" | "admin" | "dev" | "credit";

interface Workspace {
	id: string;
	account: Account;
	cat: Category;
	title: string;
	desc: string;
	icon: string;
	c1: string;
	c2: string;
	badge: string;
	badgeTone: "green" | "amber" | "blue" | "violet" | "slate";
	metrics: Array<[string, string]>;
	features: string[];
	url: string;
}

const WORKSPACES: Workspace[] = [
	{
		id: "transactions",
		account: "business",
		cat: "money",
		title: "Transaction Wallet",
		desc: "Collections, payouts, refunds and disputes.",
		icon: "bi-arrow-left-right",
		c1: "#12b76a",
		c2: "#7ee2b0",
		badge: "3 new alerts",
		badgeTone: "amber",
		metrics: [
			["1,284", "today"],
			["99.4%", "success"],
			["T+0", "settlement"],
		],
		features: ["Rail failure & retry visibility", "Reconciliation exports"],
		url: "/pm/app/transfer-overview",
	},
	{
		id: "business",
		account: "business",
		cat: "admin",
		title: "Business Wallet",
		desc: "Invoices, suppliers, payroll and approvals.",
		icon: "bi-shop",
		c1: "#0b8f52",
		c2: "#12b76a",
		badge: "2 approvals",
		badgeTone: "violet",
		metrics: [
			["42", "invoices"],
			["8", "suppliers"],
			["5", "staff"],
		],
		features: ["Invoice & payment links", "Role-based permissions"],
		url: "/business-dashboard",
	},
	{
		id: "utility",
		account: "personal",
		cat: "money",
		title: "Utility Wallet",
		desc: "Electricity, water, airtime and internet bills.",
		icon: "bi-lightning-charge",
		c1: "#f79009",
		c2: "#fdb022",
		badge: "Bills due",
		badgeTone: "amber",
		metrics: [
			["12", "bills/mo"],
			["4", "providers"],
			["T+0", "confirm"],
		],
		features: ["Scheduled payments & reminders", "Receipts & history"],
		url: "/utility/",
	},
	{
		id: "loans",
		account: "personal",
		cat: "credit",
		title: "Loans & Credit",
		desc: "Capital, repayments and credit health.",
		icon: "bi-graph-up-arrow",
		c1: "#7a5af8",
		c2: "#b39bff",
		badge: "Pre-approved",
		badgeTone: "violet",
		metrics: [
			["KES 2M", "limit"],
			["KES 500K", "outstanding"],
			["5 days", "due"],
		],
		features: ["Applications & status", "Early payoff and score tracking"],
		url: "/business/",
	},
	{
		id: "developer",
		account: "developer",
		cat: "dev",
		title: "Developer Wallet",
		desc: "API keys, webhooks, SDKs and production access.",
		icon: "bi-code-slash",
		c1: "#2e90fa",
		c2: "#84caff",
		badge: "Sandbox live",
		badgeTone: "blue",
		metrics: [
			["142ms", "latency"],
			["12", "webhooks"],
			["2", "apps"],
		],
		features: ["Key rotation & scopes", "Webhook replay and debugging"],
		url: "/dev-dashboard/",
	},
	{
		id: "cards",
		account: "personal",
		cat: "money",
		title: "Cards Wallet",
		desc: "Virtual and physical cards, limits and controls.",
		icon: "bi-credit-card",
		c1: "#101828",
		c2: "#475467",
		badge: "Default",
		badgeTone: "green",
		metrics: [
			["5", "cards"],
			["4", "currencies"],
			["Active", "program"],
		],
		features: ["Spend controls & limits", "Fraud alerts and analytics"],
		url: "/cards/app/card-command-center",
	},
];

const ACCOUNTS: Array<{ id: Account | "all"; label: string; icon: string }> = [
	{ id: "all", label: "All access", icon: "bi-grid-fill" },
	{ id: "personal", label: "Personal", icon: "bi-person" },
	{ id: "business", label: "Business", icon: "bi-building" },
	{ id: "developer", label: "Developer", icon: "bi-code-slash" },
];

const CATEGORIES: Array<{ id: Category | "all"; label: string }> = [
	{ id: "all", label: "All" },
	{ id: "money", label: "Money movement" },
	{ id: "admin", label: "Admin" },
	{ id: "dev", label: "Developer" },
	{ id: "credit", label: "Credit" },
];

const NOTIFICATIONS = [
	{
		id: 1,
		tone: "amber" as const,
		title: "Transactions",
		msg: "3 payouts require retry approval.",
	},
	{
		id: 2,
		tone: "green" as const,
		title: "Bills",
		msg: "2 scheduled bills due this week.",
	},
	{
		id: 3,
		tone: "red" as const,
		title: "Compliance",
		msg: "EDD review needed for one merchant.",
	},
	{
		id: 4,
		tone: "violet" as const,
		title: "Developer",
		msg: "Webhook endpoint returned 500 twice.",
	},
];

const WIDGETS = [
	{ name: "FX exposure", icon: "bi-currency-exchange", on: true },
	{ name: "Cash position", icon: "bi-wallet2", on: true },
	{ name: "Approval queue", icon: "bi-check2-square", on: false },
	{ name: "Rail health", icon: "bi-broadcast", on: false },
	{ name: "Audit trail", icon: "bi-journal-check", on: true },
	{ name: "ERP sync", icon: "bi-database-check", on: false },
];

const OWNERS = [
	"Finance team",
	"Engineering team",
	"Compliance team",
	"Executive team",
];

export default function Hub() {
	const [account, setAccount] = useState<Account | "all">("all");
	const [cat, setCat] = useState<Category | "all">("all");
	const [query, setQuery] = useState("");
	const [remembered, setRemembered] = useState<string | null>(null);
	const [preview, setPreview] = useState<Workspace | null>(null);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifs, setNotifs] = useState(NOTIFICATIONS);
	const [builderOpen, setBuilderOpen] = useState(false);
	const [customName, setCustomName] = useState("Treasury control room");
	const [owner, setOwner] = useState(OWNERS[0]);
	const [widgets, setWidgets] = useState(
		() =>
			Object.fromEntries(WIDGETS.map((w) => [w.name, w.on])) as Record<
				string,
				boolean
			>,
	);
	const [session, setSession] = useCountdown(899);
	const searchRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		try {
			setRemembered(localStorage.getItem("paymo_default_dashboard"));
		} catch {
			/* noop */
		}
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				searchRef.current?.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	useEffect(() => {
		if (session === 120)
			toast.warning(
				"Session expiring",
				"Two minutes left — extend to stay signed in.",
			);
		if (session === 0) {
			toast.danger("Session expired", "Redirecting to sign in…");
			window.setTimeout(() => go("/auth/login"), 1400);
		}
	}, [session]);

	const list = useMemo(
		() =>
			WORKSPACES.filter((w) => {
				if (account !== "all" && w.account !== account) return false;
				if (cat !== "all" && w.cat !== cat) return false;
				if (query.trim()) {
					const q = query.toLowerCase();
					return (
						w.title.toLowerCase().includes(q) ||
						w.desc.toLowerCase().includes(q) ||
						w.features.some((f) => f.toLowerCase().includes(q))
					);
				}
				return true;
			}),
		[account, cat, query],
	);

	const open = (w: Workspace) => {
		toast.success(`Opening ${w.title}`, w.url);
		window.setTimeout(() => go(w.url), 500);
	};

	const rememberDefault = (w: Workspace) => {
		const next = remembered === w.id ? null : w.id;
		setRemembered(next);
		try {
			if (next) localStorage.setItem("paymo_default_dashboard", next);
			else localStorage.removeItem("paymo_default_dashboard");
		} catch {
			/* noop */
		}
		toast.info(
			next ? "Default workspace set" : "Default cleared",
			next ? `${w.title} opens first next time.` : undefined,
		);
	};

	return (
		<AuthPage>
			<AuthConsole
				crumb="Dashboard hub"
				actions={
					<>
						<div style={{ position: "relative", minWidth: 220 }}>
							<Input
								ref={searchRef}
								placeholder="Search workspaces…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							<span
								className={s.kbd}
								style={{
									position: "absolute",
									right: 8,
									top: 9,
									pointerEvents: "none",
								}}
							>
								⌘K
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							icon="bi-bell"
							onClick={() => setNotifOpen(true)}
						>
							{notifs.length > 0 ? String(notifs.length) : ""}
						</Button>
						<Badge tone={session < 120 ? "red" : "slate"} icon="bi-stopwatch">
							{mmss(session)}
						</Badge>
						<Button
							variant="ghost"
							size="sm"
							icon="bi-box-arrow-right"
							onClick={() => go("/auth/login")}
						>
							Sign out
						</Button>
					</>
				}
			>
				<Hero
					zone="HUB"
					title="Choose your command centre."
					copy="Signed in as Amara Okafor · Passkey + MFA · Nairobi, KE"
					chips={
						<>
							<Badge tone="onDark">6 workspaces</Badge>
							<Badge tone="onDark">{notifs.length} unread alerts</Badge>
						</>
					}
					stats={[
						{ value: "99.97%", label: "Uptime" },
						{
							value: String(notifs.length),
							label: "Alerts",
							warn: notifs.length > 0,
						},
						{ value: "Trusted", label: "Device" },
					]}
					actions={
						<>
							<Button
								size="sm"
								variant="dark"
								icon="bi-clock-history"
								onClick={() => setSession(899)}
							>
								Extend session
							</Button>
							<Button
								size="sm"
								icon="bi-plus-lg"
								onClick={() => setBuilderOpen(true)}
							>
								Custom dashboard
							</Button>
						</>
					}
				/>

				<div className={s.spread}>
					<div className={cx(s.row, s.rowTight)}>
						{ACCOUNTS.map((a) => (
							<Chip
								key={a.id}
								on={account === a.id}
								onClick={() => setAccount(a.id)}
							>
								<i className={`bi ${a.icon}`} /> {a.label}
							</Chip>
						))}
					</div>
					<div className={cx(s.row, s.rowTight)}>
						{CATEGORIES.map((c) => (
							<Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>
								{c.label}
							</Chip>
						))}
					</div>
				</div>

				{list.length === 0 ? (
					<Card>
						<EmptyState
							icon="bi-search"
							title="No workspaces match"
							text="Try a different filter or clear your search."
							action={
								<Button
									icon="bi-arrow-counterclockwise"
									onClick={() => {
										setAccount("all");
										setCat("all");
										setQuery("");
										toast.info("Filters cleared");
									}}
								>
									Reset filters
								</Button>
							}
						/>
					</Card>
				) : (
					<div className={s.grid} style={{ ["--au-min" as string]: "330px" }}>
						{list.map((w) => (
							<Card key={w.id} hover>
								<div className={s.cardHead}>
									<span
										className={s.tile}
										style={{
											background: `linear-gradient(135deg, ${w.c1}, ${w.c2})`,
											color: "#fff",
										}}
									>
										<i className={`bi ${w.icon}`} />
									</span>
									<div className={s.grow}>
										<div className={cx(s.row, s.rowTight)}>
											<span className={s.cardTitle}>{w.title}</span>
											{remembered === w.id && (
												<Badge tone="green" icon="bi-star-fill">
													Default
												</Badge>
											)}
										</div>
										<p className={s.cardSub}>{w.desc}</p>
									</div>
									<Badge tone={w.badgeTone}>{w.badge}</Badge>
								</div>

								<div className={s.row} style={{ marginBottom: "0.75rem" }}>
									{w.metrics.map(([v, l]) => (
										<span className={s.metaChip} key={l}>
											<b>{v}</b> {l}
										</span>
									))}
								</div>

								<div className={s.spread}>
									<Button
										size="sm"
										variant="subtle"
										icon="bi-eye"
										onClick={() => setPreview(w)}
									>
										Preview
									</Button>
									<div className={cx(s.row, s.rowTight)}>
										<Button
											size="sm"
											variant="ghost"
											icon={remembered === w.id ? "bi-star-fill" : "bi-star"}
											onClick={() => rememberDefault(w)}
										>
											{remembered === w.id ? "Default" : "Remember"}
										</Button>
										<Button
											size="sm"
											icon="bi-box-arrow-up-right"
											onClick={() => open(w)}
										>
											Open
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}

				<Section
					no="1"
					title="Session context"
					sub="What this sign-in is allowed to do."
				/>
				<Card>
					<div className={s.grid} style={{ ["--au-min" as string]: "200px" }}>
						{[
							{ icon: "bi-geo-alt", label: "Location", value: "Nairobi, KE" },
							{ icon: "bi-shield-lock", label: "Auth", value: "Passkey + MFA" },
							{
								icon: "bi-clock-history",
								label: "Expires in",
								value: mmss(session),
							},
							{ icon: "bi-laptop", label: "Device", value: "Trusted · Chrome" },
						].map((row) => (
							<div className={s.row} key={row.label}>
								<span className={cx(s.tile, s.tileSm, s.tileSlate)}>
									<i className={`bi ${row.icon}`} />
								</span>
								<span className={s.grow}>
									<span className={s.tiny}>{row.label}</span>
									<span className={s.optionTitle} style={{ display: "block" }}>
										{row.value}
									</span>
								</span>
							</div>
						))}
					</div>
					<Notice tone="slate" icon="bi-shield-check">
						Manage devices, alerts and connected apps in the{" "}
						<button
							type="button"
							className={s.link}
							onClick={() => go("/auth/security")}
						>
							security centre
						</button>
						.
					</Notice>
				</Card>
			</AuthConsole>

			{/* ---------------- preview ---------------- */}
			<Modal
				open={!!preview}
				onClose={() => setPreview(null)}
				title={preview?.title ?? ""}
				sub={preview?.desc}
				icon={preview?.icon}
				footer={
					<>
						<Button variant="ghost" onClick={() => setPreview(null)}>
							Close
						</Button>
						{preview && (
							<Button
								icon="bi-box-arrow-up-right"
								onClick={() => {
									const w = preview;
									setPreview(null);
									open(w);
								}}
							>
								Open workspace
							</Button>
						)}
					</>
				}
			>
				<div className={s.stack}>
					<div className={s.row}>
						{preview?.metrics.map(([v, l]) => (
							<span className={s.metaChip} key={l}>
								<b>{v}</b> {l}
							</span>
						))}
					</div>
					<div className={s.label}>What you can do here</div>
					{preview?.features.map((f) => (
						<div className={s.listRow} key={f}>
							<i
								className="bi bi-check-circle-fill"
								style={{ color: "#12b76a" }}
							/>
							<span className={s.grow}>{f}</span>
						</div>
					))}
					<Notice tone="slate" icon="bi-link-45deg">
						Route: <span className={s.mono}>{preview?.url}</span>
					</Notice>
				</div>
			</Modal>

			{/* ---------------- notifications ---------------- */}
			<Modal
				open={notifOpen}
				onClose={() => setNotifOpen(false)}
				title="Notifications"
				sub={`${notifs.length} unread across your workspaces`}
				icon="bi-bell"
				tone="amber"
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => {
								setNotifs([]);
								toast.success("All caught up", "Notifications cleared.");
							}}
						>
							Clear all
						</Button>
						<Button onClick={() => setNotifOpen(false)}>Done</Button>
					</>
				}
			>
				{notifs.length === 0 ? (
					<EmptyState
						icon="bi-check2-all"
						title="Nothing needs you"
						text="You're all caught up."
					/>
				) : (
					<div className={s.stack}>
						{notifs.map((n) => (
							<div className={s.listRow} key={n.id}>
								<span
									className={cx(
										s.tile,
										s.tileSm,
										s[`tile${n.tone[0].toUpperCase()}${n.tone.slice(1)}`],
									)}
								>
									<i className="bi bi-dot" />
								</span>
								<span className={s.grow}>
									<span className={s.optionTitle}>{n.title}</span>
									<span className={s.optionSub} style={{ display: "block" }}>
										{n.msg}
									</span>
								</span>
								<Button
									size="sm"
									variant="subtle"
									icon="bi-x-lg"
									onClick={() =>
										setNotifs((prev) => prev.filter((x) => x.id !== n.id))
									}
								>
									{""}
								</Button>
							</div>
						))}
					</div>
				)}
			</Modal>

			{/* ---------------- custom dashboard ---------------- */}
			<Modal
				open={builderOpen}
				onClose={() => setBuilderOpen(false)}
				title="Build a custom dashboard"
				sub="Combine widgets from any workspace you have access to."
				icon="bi-columns-gap"
				tone="violet"
				footer={
					<>
						<Button variant="ghost" onClick={() => setBuilderOpen(false)}>
							Cancel
						</Button>
						<Button
							icon="bi-check-lg"
							onClick={() => {
								setBuilderOpen(false);
								toast.success(
									"Dashboard created",
									`${customName} · owned by ${owner}.`,
									{
										action: {
											label: "Open it",
											onClick: () => go("/business-dashboard"),
										},
									},
								);
							}}
						>
							Create dashboard
						</Button>
					</>
				}
			>
				<div className={s.stack}>
					<Field label="Dashboard name" htmlFor="hubName">
						<Input
							id="hubName"
							value={customName}
							onChange={(e) => setCustomName(e.target.value)}
						/>
					</Field>
					<Field label="Owner" htmlFor="hubOwner">
						<Select
							id="hubOwner"
							value={owner}
							onChange={(e) => setOwner(e.target.value)}
						>
							{OWNERS.map((o) => (
								<option key={o}>{o}</option>
							))}
						</Select>
					</Field>
					<div className={s.label}>Widgets</div>
					<div className={s.grid} style={{ ["--au-min" as string]: "200px" }}>
						{WIDGETS.map((w) => (
							<div className={s.listRow} key={w.name}>
								<span className={cx(s.tile, s.tileSm, s.tileSlate)}>
									<i className={`bi ${w.icon}`} />
								</span>
								<span className={s.grow}>
									<Check
										checked={widgets[w.name]}
										onChange={(v) =>
											setWidgets((prev) => ({ ...prev, [w.name]: v }))
										}
									>
										{w.name}
									</Check>
								</span>
							</div>
						))}
					</div>
				</div>
			</Modal>
		</AuthPage>
	);
}
