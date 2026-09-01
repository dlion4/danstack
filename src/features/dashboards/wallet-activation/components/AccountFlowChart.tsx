import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/walletActivation.module.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlowLinkAccount {
	id: number;
	name: string;
	origin: string;
	icon: string;
	bg: string;
	color: string;
	number: string;
	balance: string;
	permission: string;
	status: "Active" | "Paused";
	linked?: string;
}

interface AccountFlowChartProps {
	links: FlowLinkAccount[];
	openModal: (id: string) => void;
}

type LaneStatus = "active" | "revoking" | "revoked";
type ViewMode = "orbit" | "table";
type SortKey = "name" | "origin" | "balance" | "permission" | "status" | "last";
type StatusFilter = "all" | "active" | "revoked";

interface LiveEvent {
	id: number;
	linkId: number;
	dir: "in" | "out";
	amount: string;
	note: string;
	at: string;
}

interface LedgerRow {
	id: string;
	when: string;
	dir: "in" | "out";
	amount: string;
	counterparty: string;
	ref: string;
	rail: string;
}

/* ------------------------------------------------------------------ */
/*  Permission + live metadata                                         */
/* ------------------------------------------------------------------ */

const PERM_META: Record<
	string,
	{
		short: string;
		color: string;
		desc: string;
		chip: string;
		flow: "Bidirectional" | "Inbound" | "One-way in" | "View";
		features: string[];
	}
> = {
	"Full Control": {
		short: "Full Access",
		color: "#10b981",
		desc: "Money moves both ways. History, limits and auto-rules are unlocked.",
		chip: "bidirectional",
		flow: "Bidirectional",
		features: [
			"Send from wallet",
			"Receive to wallet",
			"Full history",
			"Balance management",
			"Transfer limits",
		],
	},
	"View + Transfer In": {
		short: "Transfer In",
		color: "#3b82f6",
		desc: "Primary wallet funds can move INTO this dashboard.",
		chip: "inbound",
		flow: "Inbound",
		features: [
			"Receive to wallet",
			"View history",
			"View balance",
			"Limited transfers",
		],
	},
	"One-Way In": {
		short: "One-Way In",
		color: "#f59e0b",
		desc: "Funds flow one direction only — into this account.",
		chip: "one-way in",
		flow: "One-way in",
		features: ["One-way transfers", "View balance", "Limited access"],
	},
	"View Only": {
		short: "View Only",
		color: "#94a3b8",
		desc: "Balance is visible. No money moves across this link.",
		chip: "view only",
		flow: "View",
		features: ["View balance only", "Read-only access"],
	},
};

const LEDGER: Record<number, LedgerRow[]> = {
	1: [
		{
			id: "tx-1a",
			when: "Today, 14:22",
			dir: "in",
			amount: "+KES 240,000",
			counterparty: "Business Acc",
			ref: "PM-TX-884120",
			rail: "Internal",
		},
		{
			id: "tx-1b",
			when: "Today, 11:05",
			dir: "out",
			amount: "−KES 18,400",
			counterparty: "Cards Center",
			ref: "PM-TX-884091",
			rail: "Internal",
		},
		{
			id: "tx-1c",
			when: "Yesterday, 19:41",
			dir: "out",
			amount: "−KES 50,000",
			counterparty: "Savings Acc",
			ref: "REL-20250627-8841",
			rail: "Relocation",
		},
		{
			id: "tx-1d",
			when: "Yesterday, 09:12",
			dir: "in",
			amount: "+KES 12,500",
			counterparty: "Utilities Hub",
			ref: "PM-TX-883901",
			rail: "Internal",
		},
		{
			id: "tx-1e",
			when: "25 Jun, 16:03",
			dir: "in",
			amount: "+KES 85,000",
			counterparty: "M-Pesa 0712 •• 5890",
			ref: "PM-TX-882441",
			rail: "M-Pesa",
		},
	],
	2: [
		{
			id: "tx-2a",
			when: "Today, 13:10",
			dir: "in",
			amount: "+KES 410,000",
			counterparty: "Invoice INV-2041",
			ref: "BZ-TX-22071",
			rail: "Collections",
		},
		{
			id: "tx-2b",
			when: "Today, 08:44",
			dir: "out",
			amount: "−KES 96,000",
			counterparty: "Payroll batch",
			ref: "BZ-TX-22058",
			rail: "PesaLink",
		},
		{
			id: "tx-2c",
			when: "Yesterday, 17:22",
			dir: "out",
			amount: "−KES 240,000",
			counterparty: "PayMo Wallet Acc",
			ref: "PM-TX-884120",
			rail: "Internal",
		},
	],
	3: [
		{
			id: "tx-3a",
			when: "Yesterday, 19:41",
			dir: "in",
			amount: "+KES 50,000",
			counterparty: "PayMo Wallet Acc",
			ref: "REL-20250627-8841",
			rail: "Relocation",
		},
		{
			id: "tx-3b",
			when: "24 Jun, 07:00",
			dir: "in",
			amount: "+KES 4,800",
			counterparty: "MMF interest",
			ref: "SV-TX-77931",
			rail: "Internal",
		},
	],
	4: [
		{
			id: "tx-4a",
			when: "02 Apr, 11:18",
			dir: "in",
			amount: "+KES 0",
			counterparty: "Facility idle",
			ref: "LN-TX-89101",
			rail: "Credit",
		},
	],
	5: [
		{
			id: "tx-5a",
			when: "20 Jun, 15:02",
			dir: "in",
			amount: "+USD 410",
			counterparty: "On-ramp KES→USD",
			ref: "CR-TX-00421",
			rail: "Crypto",
		},
		{
			id: "tx-5b",
			when: "18 Jun, 10:44",
			dir: "out",
			amount: "−USD 90",
			counterparty: "USDT book",
			ref: "CR-TX-00418",
			rail: "Crypto",
		},
	],
	6: [
		{
			id: "tx-6a",
			when: "20 Aug, 16:11",
			dir: "in",
			amount: "+KES 2,100,000",
			counterparty: "Sandbox top-up",
			ref: "DV-TX-90911",
			rail: "Internal",
		},
	],
};

const LAST_TOUCH: Record<number, string> = {
	1: "Today, 14:22",
	2: "Today, 13:10",
	3: "Yesterday, 19:41",
	4: "02 Apr 2025",
	5: "20 Jun 2025",
	6: "20 Aug 2024",
};

const AMOUNTS = [
	"KES 2,400",
	"KES 18,400",
	"KES 50,000",
	"KES 12,500",
	"KES 6,150",
	"KES 1,200",
	"KES 85,000",
];

function metaFor(permission: string) {
	return PERM_META[permission] || PERM_META["View Only"];
}

function parseKes(balance: string): number {
	const n = Number(balance.replace(/[^\d.]/g, ""));
	return Number.isFinite(n) ? n : 0;
}

function clock(): string {
	return new Date().toLocaleTimeString("en-KE", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

/* ------------------------------------------------------------------ */
/*  AccountFlowChart — radial hub, live packets, advanced ledger       */
/* ------------------------------------------------------------------ */

export default function AccountFlowChart({
	links,
	openModal,
}: AccountFlowChartProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(860);
	const [statuses, setStatuses] = useState<Record<number, LaneStatus>>({});
	const [justLinked, setJustLinked] = useState<number | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>("orbit");
	const [selectedId, setSelectedId] = useState<number | null>(
		links[0]?.id ?? null,
	);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [permFilter, setPermFilter] = useState("all");
	const [sortKey, setSortKey] = useState<SortKey>("name");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [expanded, setExpanded] = useState<number | null>(null);
	const [events, setEvents] = useState<LiveEvent[]>([]);
	const [tick, setTick] = useState(0);
	const [volume, setVolume] = useState(1_284_300);
	const seq = useRef(1);

	const initial = useMemo(
		() =>
			links.reduce<Record<number, LaneStatus>>((acc, link) => {
				acc[link.id] = link.status === "Active" ? "active" : "revoked";
				return acc;
			}, {}),
		[links],
	);

	useEffect(() => {
		setStatuses(initial);
	}, [initial]);

	useEffect(() => {
		if (!stageRef.current) return;
		const observer = new ResizeObserver((entries) => {
			const next = entries[0].contentRect.width;
			if (next > 0) setWidth(next);
		});
		observer.observe(stageRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const active = links.filter(
			(link) => (statuses[link.id] ?? "active") === "active",
		);
		if (active.length === 0) return;
		const seed: LiveEvent[] = active.slice(0, 4).map((link, i) => ({
			id: seq.current++,
			linkId: link.id,
			dir: i % 2 === 0 ? "in" : "out",
			amount: AMOUNTS[i % AMOUNTS.length],
			note: i % 2 === 0 ? "settled inbound" : "routed outbound",
			at: clock(),
		}));
		setEvents(seed);
	}, [links, statuses]);

	useEffect(() => {
		const id = window.setInterval(() => {
			const active = links.filter(
				(link) => (statuses[link.id] ?? "active") === "active",
			);
			if (active.length === 0) return;
			const link = active[seq.current % active.length];
			const dir: "in" | "out" = seq.current % 3 === 0 ? "out" : "in";
			const amount = AMOUNTS[seq.current % AMOUNTS.length];
			setEvents((prev) =>
				[
					{
						id: seq.current++,
						linkId: link.id,
						dir,
						amount,
						note: dir === "in" ? "live inbound hop" : "live outbound hop",
						at: clock(),
					},
					...prev,
				].slice(0, 8),
			);
			setVolume((v) => v + (dir === "in" ? 2400 : 1200));
			setTick((t) => t + 1);
		}, 2600);
		return () => window.clearInterval(id);
	}, [links, statuses]);

	const relink = (id: number) => {
		setStatuses((s) => ({ ...s, [id]: "active" }));
		setJustLinked(id);
		setSelectedId(id);
		window.setTimeout(() => setJustLinked(null), 1600);
	};

	const revoke = (id: number) => {
		setStatuses((s) => ({ ...s, [id]: "revoking" }));
		window.setTimeout(() => {
			setStatuses((s) => ({ ...s, [id]: "revoked" }));
		}, 900);
	};

	const openFor = (id: number, modal: string) => {
		setSelectedId(id);
		openModal(modal);
	};

	const narrow = width < 720;
	const stageH = narrow ? 0 : Math.max(540, 168 + links.length * 28);
	const cx = width / 2;
	const cy = stageH / 2;
	const orbitR = Math.min(width * 0.34, stageH * 0.36, 236);
	const hubR = 78;

	const nodes = links.map((link, i) => {
		const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(links.length, 1);
		const x = cx + Math.cos(angle) * orbitR;
		const y = cy + Math.sin(angle) * orbitR;
		const hx = cx + Math.cos(angle) * (hubR + 8);
		const hy = cy + Math.sin(angle) * (hubR + 8);
		const sx = x - Math.cos(angle) * 54;
		const sy = y - Math.sin(angle) * 54;
		const c1x = hx + (sx - hx) * 0.35;
		const c1y = hy + (sy - hy) * 0.05;
		const c2x = hx + (sx - hx) * 0.7;
		const c2y = hy + (sy - hy) * 0.95;
		return {
			link,
			angle,
			x,
			y,
			path: `M ${hx} ${hy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${sx} ${sy}`,
		};
	});

	const selected = links.find((l) => l.id === selectedId) ?? links[0];
	const selectedStatus = selected
		? (statuses[selected.id] ?? "active")
		: "active";
	const selectedMeta = selected ? metaFor(selected.permission) : null;
	const activeCount = Object.values(statuses).filter((s) => s === "active")
		.length;
	const tps = (1.4 + (tick % 7) * 0.21).toFixed(1);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return links.filter((link) => {
			const st = statuses[link.id] ?? "active";
			if (statusFilter === "active" && st !== "active") return false;
			if (statusFilter === "revoked" && st === "active") return false;
			if (permFilter !== "all" && link.permission !== permFilter) return false;
			if (!q) return true;
			return (
				link.name.toLowerCase().includes(q) ||
				link.origin.toLowerCase().includes(q) ||
				link.number.toLowerCase().includes(q) ||
				link.permission.toLowerCase().includes(q)
			);
		});
	}, [links, query, statusFilter, permFilter, statuses]);

	const sorted = useMemo(() => {
		const copy = [...filtered];
		copy.sort((a, b) => {
			let av = "";
			let bv = "";
			if (sortKey === "balance") {
				return sortDir === "asc"
					? parseKes(a.balance) - parseKes(b.balance)
					: parseKes(b.balance) - parseKes(a.balance);
			}
			if (sortKey === "status") {
				av = statuses[a.id] ?? "active";
				bv = statuses[b.id] ?? "active";
			} else if (sortKey === "last") {
				av = LAST_TOUCH[a.id] ?? "";
				bv = LAST_TOUCH[b.id] ?? "";
			} else {
				av = String(a[sortKey]);
				bv = String(b[sortKey]);
			}
			const cmp = av.localeCompare(bv);
			return sortDir === "asc" ? cmp : -cmp;
		});
		return copy;
	}, [filtered, sortKey, sortDir, statuses]);

	const toggleSort = (key: SortKey) => {
		if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else {
			setSortKey(key);
			setSortDir("asc");
		}
	};

	const permissions = Array.from(new Set(links.map((l) => l.permission)));

	const renderActions = (link: FlowLinkAccount, compact = false) => {
		const status = statuses[link.id] ?? "active";
		return (
			<div className={styles.flowTableActions}>
				<button
					type="button"
					className={`${styles.button} ${styles.buttonSmall}`}
					onClick={() => openFor(link.id, "linkPermissionsModal")}
					title="Permissions"
				>
					<i className="bi bi-sliders" />
					{compact ? null : " Perms"}
				</button>
				<button
					type="button"
					className={`${styles.button} ${styles.buttonSmall}`}
					onClick={() => openFor(link.id, "linkNotificationsModal")}
					title="Alerts"
				>
					<i className="bi bi-bell" />
					{compact ? null : " Alerts"}
				</button>
				<button
					type="button"
					className={`${styles.button} ${styles.buttonSmall}`}
					onClick={() => openFor(link.id, "linkFlowControlModal")}
					title="Flow control"
				>
					<i className="bi bi-arrow-left-right" />
					{compact ? null : " Flow"}
				</button>
				<button
					type="button"
					className={`${styles.button} ${styles.buttonSmall}`}
					onClick={() => openFor(link.id, "moneyRelocationModal")}
					title="Relocate funds"
				>
					<i className="bi bi-send" />
					{compact ? null : " Move"}
				</button>
				{status === "active" ? (
					<button
						type="button"
						className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
						onClick={() => {
							revoke(link.id);
							openFor(link.id, "unlinkAccountModal");
						}}
						title="Unlink"
					>
						<i className="bi bi-unlink" />
						{compact ? null : " Unlink"}
					</button>
				) : (
					<button
						type="button"
						className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
						onClick={() => {
							relink(link.id);
							openFor(link.id, "relinkAccountModal");
						}}
						title="Relink"
					>
						<i className="bi bi-link-45deg" />
						{compact ? null : " Relink"}
					</button>
				)}
			</div>
		);
	};

	return (
		<div className={styles.flowChartCard}>
			<div className={styles.flowOrbitHead}>
				<div>
					<h3 className={styles.flowChartTitle}>
						<span className={styles.flowLiveDot} />
						Live fund mesh
					</h3>
					<p className={styles.flowChartSub}>
						Primary wallet at the hub. Satellites are linked dashboards.
						Packets are live hops.
					</p>
				</div>
				<div className={styles.flowChartTabs}>
					<button
						type="button"
						className={`${styles.flowChartTab} ${viewMode === "orbit" ? styles.flowChartTabActive : ""}`}
						onClick={() => setViewMode("orbit")}
					>
						<i className="bi bi-diagram-3" /> Orbit
					</button>
					<button
						type="button"
						className={`${styles.flowChartTab} ${viewMode === "table" ? styles.flowChartTabActive : ""}`}
						onClick={() => setViewMode("table")}
					>
						<i className="bi bi-table" /> Ledger
					</button>
					<button
						type="button"
						className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
						onClick={() => openModal("linkAccountModal")}
					>
						<i className="bi bi-plus-lg" /> Link account
					</button>
				</div>
			</div>

			<div className={styles.flowKpiRow}>
				<div className={styles.flowKpi}>
					<span>Hub balance</span>
					<strong>KES {volume.toLocaleString("en-KE")}</strong>
				</div>
				<div className={styles.flowKpi}>
					<span>Live lanes</span>
					<strong>
						{activeCount}/{links.length}
					</strong>
				</div>
				<div className={styles.flowKpi}>
					<span>Mesh TPS</span>
					<strong>{tps}</strong>
				</div>
				<div className={styles.flowKpi}>
					<span>Last hop</span>
					<strong>{events[0]?.at ?? "—"}</strong>
				</div>
			</div>

			{viewMode === "orbit" ? (
				<>
					<div
						className={`${styles.flowOrbitStage} ${narrow ? styles.flowOrbitStageStack : ""}`}
						ref={stageRef}
						style={narrow ? undefined : { minHeight: stageH }}
					>
						<div className={styles.flowChartGrid} />

						{narrow ? (
							<div className={styles.flowStack}>
								<div className={styles.flowHubCore}>
									<div className={styles.flowHubPulse} />
									<div className={styles.flowWalletIcon}>
										<i className="bi bi-wallet2" />
									</div>
									<div className={styles.flowWalletLabel}>Primary hub</div>
									<div className={styles.flowWalletName}>Oscar Kasongo</div>
									<div className={styles.flowWalletNum}>PM-4521-8830-1024</div>
									<div className={styles.flowWalletBalance}>
										KES {volume.toLocaleString("en-KE")}
									</div>
								</div>
								<div className={styles.flowSatGrid}>
									{links.map((link) => {
										const status = statuses[link.id] ?? "active";
										const meta = metaFor(link.permission);
										const on = selectedId === link.id;
										return (
											<button
												type="button"
												key={link.id}
												className={`${styles.flowSat} ${on ? styles.flowSatOn : ""} ${status === "revoked" ? styles.flowSatBroken : ""}`}
												onClick={() => setSelectedId(link.id)}
												style={{ ["--sat" as string]: meta.color }}
											>
												<span
													className={styles.flowLaneIcon}
													style={{ background: link.bg, color: link.color }}
												>
													<i className={link.icon} />
												</span>
												<span className={styles.flowSatBody}>
													<span className={styles.flowLaneName}>
														{link.name}
													</span>
													<span className={styles.flowLaneOrigin}>
														{link.origin}
													</span>
													<span className={styles.flowLaneBalance}>
														{link.balance}
													</span>
												</span>
												<span
													className={styles.flowLanePerm}
													style={{
														color: meta.color,
														borderColor: `${meta.color}55`,
													}}
												>
													{status === "active" ? meta.short : "Link lost"}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						) : (
							<>
								<svg
									className={styles.flowSvg}
									viewBox={`0 0 ${width} ${stageH}`}
									preserveAspectRatio="xMidYMid meet"
									role="img"
									aria-label="Live fund mesh between primary wallet and linked dashboards"
								>
									<defs>
										{nodes.map(({ link, path }) => (
											<path
												key={`def-${link.id}`}
												id={`orbitPath-${link.id}`}
												d={path}
												fill="none"
											/>
										))}
									</defs>
									<circle
										cx={cx}
										cy={cy}
										r={orbitR}
										fill="none"
										stroke="rgba(16,185,129,0.12)"
										strokeDasharray="3 10"
										strokeWidth="1"
									>
										<animate
											attributeName="stroke-dashoffset"
											from="0"
											to="26"
											dur="8s"
											repeatCount="indefinite"
										/>
									</circle>
									{nodes.map(({ link, path }) => {
										const status = statuses[link.id] ?? "active";
										const meta = metaFor(link.permission);
										const active = status === "active";
										const on = selectedId === link.id;
										return (
											<g key={link.id}>
												<path
													d={path}
													fill="none"
													stroke={
														status === "revoking" ? "#ef4444" : meta.color
													}
													strokeWidth={on ? 9 : active ? 6 : 2}
													opacity={active ? 0.14 : 0.06}
													strokeLinecap="round"
												/>
												<path
													d={path}
													fill="none"
													stroke={
														status === "revoking" ? "#ef4444" : meta.color
													}
													strokeWidth={on ? 2.6 : active ? 2 : 1.2}
													strokeDasharray={
														active ? "7 9" : status === "revoking" ? "4 6" : "3 8"
													}
													strokeLinecap="round"
													opacity={active ? 0.95 : 0.35}
												>
													{active ? (
														<animate
															attributeName="stroke-dashoffset"
															from="16"
															to="0"
															dur="1.4s"
															repeatCount="indefinite"
														/>
													) : null}
												</path>
												{active ? (
													<>
														<circle r="4.5" fill={meta.color}>
															<animateMotion
																dur="2.4s"
																repeatCount="indefinite"
															>
																<mpath href={`#orbitPath-${link.id}`} />
															</animateMotion>
														</circle>
														<circle r="3" fill="#fff" opacity="0.85">
															<animateMotion
																dur="2.4s"
																begin="1.1s"
																repeatCount="indefinite"
															>
																<mpath href={`#orbitPath-${link.id}`} />
															</animateMotion>
														</circle>
													</>
												) : null}
											</g>
										);
									})}
								</svg>

								<div
									className={styles.flowHubCore}
									style={{ left: cx - 96, top: cy - 96 }}
								>
									<div className={styles.flowHubPulse} />
									<div className={styles.flowWalletIcon}>
										<i className="bi bi-wallet2" />
									</div>
									<div className={styles.flowWalletLabel}>Primary hub</div>
									<div className={styles.flowWalletName}>Oscar Kasongo</div>
									<div className={styles.flowWalletNum}>PM-4521-8830-1024</div>
									<div className={styles.flowWalletBalance}>
										KES {volume.toLocaleString("en-KE")}
									</div>
									<div className={styles.flowWalletChips}>
										<span className={styles.flowWalletChip}>
											<i className="bi bi-broadcast" /> Live
										</span>
										<span className={styles.flowWalletChip}>Verified KYC</span>
									</div>
								</div>

								{nodes.map(({ link, x, y }) => {
									const status = statuses[link.id] ?? "active";
									const meta = metaFor(link.permission);
									const on = selectedId === link.id;
									return (
										<button
											type="button"
											key={link.id}
											className={`${styles.flowSat} ${on ? styles.flowSatOn : ""} ${status === "revoked" ? styles.flowSatBroken : ""} ${justLinked === link.id ? styles.flowSatFlash : ""}`}
											style={{
												left: x - 92,
												top: y - 52,
												["--sat" as string]: meta.color,
											}}
											onClick={() => setSelectedId(link.id)}
										>
											<span
												className={styles.flowLaneIcon}
												style={{ background: link.bg, color: link.color }}
											>
												<i className={link.icon} />
											</span>
											<span className={styles.flowSatBody}>
												<span className={styles.flowLaneName}>{link.name}</span>
												<span className={styles.flowLaneOrigin}>
													{link.origin}
												</span>
												<span className={styles.flowLaneBalance}>
													{link.balance}
												</span>
											</span>
											<span
												className={styles.flowLanePerm}
												style={{
													color: meta.color,
													borderColor: `${meta.color}55`,
												}}
											>
												{status === "active"
													? meta.short
													: status === "revoking"
														? "Breaking"
														: "Link lost"}
											</span>
										</button>
									);
								})}
							</>
						)}
					</div>

					{selected && selectedMeta ? (
						<div className={styles.flowInspector}>
							<div className={styles.flowInspectorHead}>
								<span
									className={styles.flowLaneIcon}
									style={{ background: selected.bg, color: selected.color }}
								>
									<i className={selected.icon} />
								</span>
								<div>
									<div className={styles.flowLaneName}>{selected.name}</div>
									<div className={styles.flowInspectorMeta}>
										{selected.origin} · {selected.number} · Linked{" "}
										{selected.linked ?? LAST_TOUCH[selected.id]}
									</div>
								</div>
								<span
									className={styles.flowLanePerm}
									style={{
										color: selectedMeta.color,
										borderColor: `${selectedMeta.color}55`,
									}}
								>
									{selectedStatus === "active"
										? selectedMeta.short
										: "Link lost"}
								</span>
							</div>
							<p className={styles.flowInspectorDesc}>{selectedMeta.desc}</p>
							<div className={styles.flowInspectorStats}>
								<div>
									<span>Balance</span>
									<strong>{selected.balance}</strong>
								</div>
								<div>
									<span>Flow</span>
									<strong>{selectedMeta.flow}</strong>
								</div>
								<div>
									<span>Last hop</span>
									<strong>{LAST_TOUCH[selected.id]}</strong>
								</div>
								<div>
									<span>Status</span>
									<strong>
										{selectedStatus === "active" ? "Live" : "Paused"}
									</strong>
								</div>
							</div>
							<div className={styles.flowHoverCardFeatures}>
								{selectedMeta.features.map((feature) => (
									<span key={feature} className={styles.flowHoverFeatureItem}>
										<i
											className="bi bi-check2"
											style={{ color: selectedMeta.color }}
										/>{" "}
										{feature}
									</span>
								))}
							</div>
							{renderActions(selected)}
						</div>
					) : null}

					<div className={styles.flowTape} aria-live="polite">
						{events.map((ev) => {
							const link = links.find((l) => l.id === ev.linkId);
							if (!link) return null;
							return (
								<button
									type="button"
									key={ev.id}
									className={styles.flowTapeItem}
									onClick={() => setSelectedId(link.id)}
								>
									<span
										className={
											ev.dir === "in" ? styles.flowTapeIn : styles.flowTapeOut
										}
									>
										<i
											className={`bi ${ev.dir === "in" ? "bi-arrow-down-left" : "bi-arrow-up-right"}`}
										/>
									</span>
									<span>
										<strong>{link.name}</strong>
										<em>
											{ev.note} · {ev.at}
										</em>
									</span>
									<b>{ev.amount}</b>
								</button>
							);
						})}
					</div>
				</>
			) : (
				<div className={styles.flowTableContainer}>
					<div className={styles.flowTableHeader}>
						<div className={styles.flowTableTitle}>Linked accounts overview</div>
						<div className={styles.flowTableToolbar}>
							<label className={styles.flowSearch}>
								<i className="bi bi-search" />
								<input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									aria-label="Search linked accounts"
								/>
							</label>
							<select
								className={styles.flowFilter}
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(e.target.value as StatusFilter)
								}
								aria-label="Filter by status"
							>
								<option value="all">All statuses</option>
								<option value="active">Live only</option>
								<option value="revoked">Paused / revoked</option>
							</select>
							<select
								className={styles.flowFilter}
								value={permFilter}
								onChange={(e) => setPermFilter(e.target.value)}
								aria-label="Filter by permission"
							>
								<option value="all">All permissions</option>
								{permissions.map((p) => (
									<option key={p} value={p}>
										{p}
									</option>
								))}
							</select>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => {
									setQuery("");
									setStatusFilter("all");
									setPermFilter("all");
								}}
							>
								Reset
							</button>
						</div>
					</div>
					<div className={styles.flowTableWrapper}>
						<table className={styles.flowTable}>
							<thead>
								<tr>
									{(
										[
											["name", "Account"],
											["origin", "Origin"],
											["balance", "Balance"],
											["permission", "Permission"],
											["last", "Last hop"],
											["status", "Status"],
										] as Array<[SortKey, string]>
									).map(([key, label]) => (
										<th key={key}>
											<button
												type="button"
												className={styles.flowThBtn}
												onClick={() => toggleSort(key)}
											>
												{label}
												{sortKey === key ? (
													<i
														className={`bi ${sortDir === "asc" ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}
													/>
												) : (
													<i className="bi bi-chevron-expand" />
												)}
											</button>
										</th>
									))}
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{sorted.length === 0 ? (
									<tr>
										<td colSpan={7}>
											<div className={styles.flowTablePlaceholder}>
												<strong>No accounts match</strong>
												<span>
													{query
														? `Nothing for “${query}”.`
														: "Clear filters to see every linked account."}
												</span>
												<button
													type="button"
													className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
													onClick={() => {
														setQuery("");
														setStatusFilter("all");
														setPermFilter("all");
													}}
												>
													Show all
												</button>
											</div>
										</td>
									</tr>
								) : (
									sorted.map((link) => {
										const status = statuses[link.id] ?? "active";
										const meta = metaFor(link.permission);
										const open = expanded === link.id;
										const rows = LEDGER[link.id] ?? [];
										return (
											<Fragment key={link.id}>
												<tr
													key={link.id}
													className={
														status === "revoked"
															? styles.flowTableRowDisabled
															: ""
													}
												>
													<td>
														<button
															type="button"
															className={styles.flowTableCellAccount}
															onClick={() =>
																setExpanded(open ? null : link.id)
															}
														>
															<div
																className={styles.flowTableIcon}
																style={{
																	background: link.bg,
																	color: link.color,
																}}
															>
																<i className={link.icon} />
															</div>
															<div>
																<div className={styles.flowTableAccountName}>
																	{link.name}
																</div>
																<div className={styles.flowTableAccountNum}>
																	{link.number} ·{" "}
																	{open ? "Hide ledger" : "Open ledger"}
																</div>
															</div>
														</button>
													</td>
													<td>
														<div className={styles.flowTableCellOrigin}>
															<i
																className={link.icon}
																style={{ color: link.color }}
															/>
															{link.origin}
														</div>
													</td>
													<td>
														<div className={styles.flowTableBalance}>
															{link.balance}
														</div>
													</td>
													<td>
														<span
															className={styles.flowTablePermission}
															style={{
																color: meta.color,
																borderColor: `${meta.color}55`,
																background: `${meta.color}11`,
															}}
														>
															<i className="bi bi-shield-check" /> {meta.short}
														</span>
													</td>
													<td>{LAST_TOUCH[link.id]}</td>
													<td>
														<span
															className={`${styles.flowTableStatus} ${status === "active" ? styles.flowTableStatusActive : styles.flowTableStatusRevoked}`}
														>
															{status === "active" ? (
																<>
																	<i className="bi bi-check-circle" /> Live
																</>
															) : (
																<>
																	<i className="bi bi-x-circle" /> Revoked
																</>
															)}
														</span>
													</td>
													<td>{renderActions(link, true)}</td>
												</tr>
												{open ? (
													<tr
														key={`${link.id}-ledger`}
														className={styles.flowLedgerRow}
													>
														<td colSpan={7}>
															<div className={styles.flowLedger}>
																<div className={styles.flowLedgerHead}>
																	<strong>Last hops on {link.name}</strong>
																	<span>
																		{meta.flow} · {rows.length} posted
																	</span>
																</div>
																<table className={styles.flowLedgerTable}>
																	<thead>
																		<tr>
																			<th>When</th>
																			<th>Direction</th>
																			<th>Counterparty</th>
																			<th>Rail</th>
																			<th>Reference</th>
																			<th>Amount</th>
																		</tr>
																	</thead>
																	<tbody>
																		{rows.map((row) => (
																			<tr key={row.id}>
																				<td>{row.when}</td>
																				<td>
																					{row.dir === "in"
																						? "Inbound"
																						: "Outbound"}
																				</td>
																				<td>{row.counterparty}</td>
																				<td>{row.rail}</td>
																				<td>
																					<button
																						type="button"
																						className={styles.flowRefBtn}
																						onClick={async () => {
																							try {
																								await navigator.clipboard.writeText(
																									row.ref,
																								);
																							} catch {
																								/* ignore */
																							}
																							openModal(
																								"relocationReceiptModal",
																							);
																						}}
																					>
																						{row.ref}
																					</button>
																				</td>
																				<td>{row.amount}</td>
																			</tr>
																		))}
																	</tbody>
																</table>
																<div className={styles.flowLedgerFoot}>
																	<button
																		type="button"
																		className={`${styles.button} ${styles.buttonSmall}`}
																		onClick={() =>
																			openFor(link.id, "linkLimitsModal")
																		}
																	>
																		View limits
																	</button>
																	<button
																		type="button"
																		className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
																		onClick={() =>
																			openFor(link.id, "moneyRelocationModal")
																		}
																	>
																		Relocate from here
																	</button>
																</div>
															</div>
														</td>
													</tr>
												) : null}
											</Fragment>
										);
									})
								)}
							</tbody>
						</table>
					</div>
					<div className={styles.flowTableFooter}>
						<div className={styles.flowTableStats}>
							<span className={styles.flowTableStat}>
								<i className="bi bi-link-45deg" /> {sorted.length} shown ·{" "}
								{links.length} total
							</span>
							<span className={styles.flowTableStat}>
								<i className="bi bi-check-circle" /> {activeCount} live
							</span>
						</div>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
							onClick={() => openModal("linkAccountModal")}
						>
							<i className="bi bi-plus-lg" /> Link new account
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
