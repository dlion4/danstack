import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
	kes,
	MODULES,
	NAV_GROUPS,
	NOTICES,
	PAY_METHODS,
	SCHEDULES,
	UTILITIES,
	utilityOf,
} from "../../lib/data";
import { useApp } from "../../lib/store";
import { cn } from "../../lib/utils/cn";
import { Button, Drawer, DrawerHead, IconBtn } from "../ui";
import { Icon } from "../ui/icons";
import s from "./shell.module.css";

/* ================================================================ Sidebar ================================================================ */

function SideNav({
	onNav,
	active,
	collapsed,
	onToggleCollapse,
}: {
	onNav: (key: string, target?: string) => void;
	active: string;
	collapsed: boolean;
	onToggleCollapse: () => void;
}) {
	return (
		<div className={cn(s.sidebar, collapsed && s.collapsed)} style={{ position: "relative" }}>
			{/* Brand */}
			<div className={s.brand}>
				<span className={s["brand-icon"]}>
					<Icon name="bolt" size={18} />
				</span>
				<div>
					<p className={s["brand-text"]}>PayMo</p>
					<p className={s["brand-sub"]}>Business</p>
				</div>
				<span className={s["brand-tag"]}>3.6</span>
			</div>

			{/* Collapse toggle */}
			<button
				type="button"
				onClick={onToggleCollapse}
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				className={s["sidebar-toggle"]}
			>
				<Icon name={collapsed ? "arrow-right" : "chevron-left"} size={10} />
			</button>

			{/* Org switcher */}
			<button className={s["org-btn"]}>
				<span className={s["org-avatar"]}>PH</span>
				<div style={{ minWidth: 0, flex: 1 }}>
					<div className={s["org-label"]}>PayMo Hardware</div>
					<div className={s["org-sub"]}>Kiambu Rd · 8 meters</div>
				</div>
				<Icon name="chevron-down" size={13} style={{ color: "#8a9484", flexShrink: 0 }} />
			</button>

			{/* Nav */}
			<nav className={s["nav-scroll"]}>
				{NAV_GROUPS.map((g) => (
					<div key={g.title} style={{ marginBottom: 16 }}>
						<p className={s["nav-group-label"]}>{g.title}</p>
						<div>
							{g.items.map((it) => {
								const on = active === it.key;
								return (
									<button
										key={it.key}
										onClick={() => onNav(it.key, it.target)}
										className={cn(s["nav-item"], on && s.active)}
										title={it.label}
									>
										<span className={s["nav-icon"]}>
											<Icon name={it.icon} size={16} />
										</span>
										<span className={s["nav-label"]}>{it.label}</span>
										{it.badge && (
											<span className={cn(s["nav-badge"], it.badge === "0" && s.green)}>
												{it.badge}
											</span>
										)}
									</button>
								);
							})}
						</div>
					</div>
				))}

				{/* Wallet card */}
				<div className={s["wallet-card"]}>
					<div className={s["wallet-card-header"]}>
						<Icon name="wallet" size={14} />
						<span className={s["wallet-label"]}>Wallet</span>
					</div>
					<p className={s["wallet-balance"]}>{kes(24500)}</p>
					<p className={s["wallet-desc"]}>Zero-fee utility payments</p>
					<button className={s["wallet-btn"]}>
						<span className={s["wallet-btn-label"]}>Top up wallet</span>
					</button>
				</div>
			</nav>

			{/* Footer */}
			<div className={s["sidebar-footer"]}>
				<button className={s["help-item"]}>
					<Icon name="lifebuoy" size={16} />
					<span className={s["support-text"]}>Help centre</span>
					<Icon name="external" size={11} className={s["external-icon"]} />
				</button>
				<a href="/auth/hub" className={s["switch-acct-btn"]} style={{ textDecoration: "none" }}>
					<Icon name="arrow-right" size={15} />
					<span className={s["switch-acct-label"]}>Switch Account</span>
				</a>
			</div>
		</div>
	);
}

/* ================================================================ Command palette ================================================================ */

function Palette() {
	const { paletteOpen, setPaletteOpen, open, accounts, txns } = useApp();
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [idx, setIdx] = useState(0);

	useEffect(() => {
		if (!paletteOpen) {
			setQ("");
			setIdx(0);
		}
	}, [paletteOpen]);

	useEffect(() => {
		if (!paletteOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setPaletteOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [paletteOpen, setPaletteOpen]);

	type Item = {
		id: string;
		label: string;
		sub: string;
		icon: Parameters<typeof Icon>[0]["name"];
		group: string;
		run: () => void;
	};

	const items = useMemo<Item[]>(() => {
		const acts: Item[] = [
			{
				id: "a1",
				label: "Buy electricity tokens",
				sub: "KPLC prepaid · instant",
				icon: "bolt",
				group: "Quick actions",
				run: () => open({ kind: "buy", utility: "electricity" }),
			},
			{
				id: "a2",
				label: "Pay water bill",
				sub: "NCWSC / county",
				icon: "droplet",
				group: "Quick actions",
				run: () => open({ kind: "buy", utility: "water" }),
			},
			{
				id: "a3",
				label: "Renew DSTV",
				sub: "MultiChoice packages",
				icon: "tv",
				group: "Quick actions",
				run: () => open({ kind: "buy", utility: "tv" }),
			},
			{
				id: "a4",
				label: "Top up airtime",
				sub: "Safaricom · Airtel",
				icon: "phone",
				group: "Quick actions",
				run: () => open({ kind: "buy", utility: "airtime" }),
			},
			{
				id: "a5",
				label: "Add a new meter or account",
				sub: "Verify in seconds",
				icon: "plus",
				group: "Quick actions",
				run: () => open({ kind: "addAccount" }),
			},
			{
				id: "a6",
				label: "Export transaction history",
				sub: "CSV · PDF · XLS",
				icon: "download",
				group: "Quick actions",
				run: () => open({ kind: "export" }),
			},
			{
				id: "a7",
				label: "Manage autopay rules",
				sub: "4 rules configured",
				icon: "repeat",
				group: "Quick actions",
				run: () => open({ kind: "autopay" }),
			},
			{
				id: "a8",
				label: "Top up PayMo wallet",
				sub: "Free from M-Pesa",
				icon: "wallet",
				group: "Quick actions",
				run: () => open({ kind: "topup" }),
			},
			{
				id: "a9",
				label: "Pay household bills",
				sub: "Rent · litter · cooking gas",
				icon: "building",
				group: "Quick actions",
				run: () => {
					setPaletteOpen(false);
					void navigate({ to: "/utility/recurring" as "/utility" });
				},
			},
		];
		const utils: Item[] = UTILITIES.map((u) => ({
			id: `u-${u.id}`,
			label: u.name,
			sub: u.short,
			icon: u.icon,
			group: "Utilities",
			run: () => open({ kind: "buy", utility: u.id }),
		}));
		const accs: Item[] = accounts.map((a) => ({
			id: `acc-${a.id}`,
			label: a.nickname,
			sub: `${a.provider} · ${a.ref}`,
			icon: utilityOf(a.utility).icon,
			group: "Saved accounts",
			run: () => open({ kind: "buy", utility: a.utility, accountId: a.id }),
		}));
		const txnItems: Item[] = txns.slice(0, 10).map((t) => ({
			id: `t-${t.id}`,
			label: `${t.ref} · ${kes(t.amount)}`,
			sub: `${t.provider} · ${t.account}`,
			icon: "receipt",
			group: "Transactions",
			run: () => open({ kind: "txn", txn: t }),
		}));
		const all = [...acts, ...utils, ...accs, ...txnItems];
		if (!q.trim()) return all.slice(0, 12);
		const s = q.toLowerCase();
		return all
			.filter((i) => `${i.label} ${i.sub} ${i.group}`.toLowerCase().includes(s))
			.slice(0, 12);
	}, [q, open, accounts, txns, navigate, setPaletteOpen]);

	const groups = useMemo(() => {
		const g: Record<string, Item[]> = {};
		items.forEach((i) => {
			g[i.group] = g[i.group] ?? [];
			g[i.group].push(i);
		});
		return g;
	}, [items]);

	const flat = Object.values(groups).flat();

	if (!paletteOpen) return null;

	return (
		<div
			className="position-fixed inset-0 z-95 d-flex align-items-start justify-content-center px-4 pt-10vh"
			role="dialog"
			aria-modal="true"
		>
			<div
				className="overlay-fade position-absolute inset-0 bg-side-60 backdrop-blur-3px"
				onClick={() => setPaletteOpen(false)}
			/>
			<div className="modal-pop position-relative w-100 max-w-560px overflow-hidden rounded-5 border border-line bg-white shadow-pm-lg">
				<div className="d-flex align-items-center gap-3 border-bottom border-line px-4 py-35">
					<Icon name="search" size={18} className="text-faint" />
					<input
						autoFocus
						value={q}
						onChange={(e) => {
							setQ(e.target.value);
							setIdx(0);
						}}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setIdx((i) => Math.min(i + 1, flat.length - 1));
							}
							if (e.key === "ArrowUp") {
								e.preventDefault();
								setIdx((i) => Math.max(i - 1, 0));
							}
							if (e.key === "Enter") flat[idx]?.run(), setPaletteOpen(false);
						}}
						placeholder="Search meters, providers, references or actions…"
						className="w-100 bg-transparent fs-14 fw-medium text-ink outline-none placeholder-text-faint"
					/>
					<kbd className="d-none rounded-2 border border-line bg-canvas px-15 py-05 fs-105 fw-bold text-muted d-sm-block">
						ESC
					</kbd>
				</div>
				<div className="thin-scroll max-h-52vh overflow-y-auto p-2">
					{flat.length === 0 && (
						<div className="px-4 py-10 text-center">
							<p className="fs-13 fw-semibold text-ink">No matches for “{q}”</p>
							<p className="mt-1 fs-12 text-muted">
								Try “KPLC”, “DSTV”, a meter number or a TXN reference.
							</p>
						</div>
					)}
					{Object.entries(groups).map(([g, list]) => (
						<div key={g} className="mb-15">
							<p className="px-25 py-15 fs-10 fw-bold text-uppercase tracking-0-14em text-faint">
								{g}
							</p>
							{list.map((i) => {
								const activeItem = flat[idx]?.id === i.id;
								return (
									<button
										key={i.id}
										onMouseEnter={() =>
											setIdx(flat.findIndex((x) => x.id === i.id))
										}
										onClick={() => {
											i.run();
											setPaletteOpen(false);
										}}
										className={cn(
											"d-flex w-100 align-items-center gap-3 rounded-4 px-25 py-25 text-start transition",
											activeItem ? "bg-canvas" : "hover-bg-paper-3",
										)}
									>
										<span
											className={cn(
												"d-grid h-8 w-8 flex-none place-items-center rounded-3",
												activeItem
													? "bg-white text-ink shadow-sm"
													: "bg-canvas text-muted",
											)}
										>
											<Icon name={i.icon} size={16} />
										</span>
										<span className="min-w-0 flex-1">
											<span className="d-block text-truncate fs-13 fw-semibold text-ink">
												{i.label}
											</span>
											<span className="d-block text-truncate fs-115 text-muted">
												{i.sub}
											</span>
										</span>
										{activeItem && (
											<Icon
												name="arrow-right"
												size={15}
												className="text-pmgreen"
											/>
										)}
									</button>
								);
							})}
						</div>
					))}
				</div>
				<div className="d-flex align-items-center justify-content-between border-top border-line bg-paper-2 px-4 py-25 fs-11 text-muted">
					<span className="d-flex align-items-center gap-3">
						<span className="d-flex align-items-center gap-1">
							<kbd className="rounded border border-line bg-white px-1 py-05 fs-10 fw-bold">
								↑↓
							</kbd>{" "}
							navigate
						</span>
						<span className="d-flex align-items-center gap-1">
							<kbd className="rounded border border-line bg-white px-1 py-05 fs-10 fw-bold">
								↵
							</kbd>{" "}
							open
						</span>
					</span>
					<span className="d-flex align-items-center gap-15">
						<span className="live-dot" /> PayMo services operational
					</span>
				</div>
			</div>
		</div>
	);
}

/* ================================================================ Notifications ================================================================ */

function NotifDrawer() {
	const { notifOpen, setNotifOpen, open, toast, txns } = useApp();
	return (
		<Drawer
			open={notifOpen}
			onClose={() => setNotifOpen(false)}
			width="max-w-420px"
		>
			<DrawerHead
				title="Notifications"
				subtitle="Billing alerts, autopay events and payment receipts"
				icon="bell"
				onClose={() => setNotifOpen(false)}
				actions={
					<button
						onClick={() =>
							toast({
								title: "All caught up",
								msg: "Notifications marked as read.",
								tone: "success",
							})
						}
						className="focus-ring me-1 rounded-3 px-2 py-1 fs-115 fw-bold text-pmgreen-ink transition hover-bg-pmgreen-soft"
					>
						Mark all read
					</button>
				}
			/>
			<div className="thin-scroll flex-1 overflow-y-auto p-3">
				<div className="mb-3 rounded-4 border border-line bg-paper-2 p-3">
					<div className="d-flex align-items-center gap-2">
						<span className="live-dot amber" />
						<p className="fs-125 fw-bold text-ink">
							3 bills due in the next 7 days
						</p>
					</div>
					<p className="mt-1 fs-115 leading-relaxed text-muted">
						M-KOPA KES 150 · Shop meter KES 6,000 · Office fibre KES 5,999 —
						total {kes(12149)}.
					</p>
					<Button
						size="sm"
						variant="dark"
						className="mt-25"
						icon="repeat"
						onClick={() => open({ kind: "autopay" })}
					>
						Review schedule
					</Button>
				</div>
				<div className="space-y-2">
					{NOTICES.map((n) => (
						<div
							key={n.id}
							className="group d-flex gap-3 rounded-4 border border-line bg-white p-3 transition hover-border-gray-350"
						>
							<span
								className={cn(
									"d-grid h-9 w-9 flex-none place-items-center rounded-10px",
									n.tone === "warning" && "bg-warn-soft text-warn-ink",
									n.tone === "info" && "bg-pmblue-soft text-pmblue-ink",
									n.tone === "success" && "bg-pmgreen-soft text-pmgreen-ink",
									n.tone === "danger" && "bg-danger-soft text-danger-ink",
									n.tone === "muted" && "bg-canvas text-muted",
								)}
							>
								<Icon name={n.icon} size={17} />
							</span>
							<div className="min-w-0 flex-1">
								<div className="d-flex align-items-start gap-2">
									<p className="flex-1 fs-13 fw-bold text-ink">{n.title}</p>
									<span className="text-nowrap fs-105 fw-semibold text-faint">
										{n.time}
									</span>
								</div>
								<p className="mt-05 fs-12 leading-relaxed text-muted">
									{n.body}
								</p>
								{n.cta && (
									<button
										onClick={() => {
											setNotifOpen(false);
											if (n.id === "n1")
												open({
													kind: "buy",
													utility: "electricity",
													accountId: "acc-1",
												});
											else if (n.id === "n2") {
												const pending = txns.find((t) => t.ref === "TXN-4490");
												if (pending) open({ kind: "txn", txn: pending });
											} else if (n.id === "n5")
												open({
													kind: "buy",
													utility: "water",
													accountId: "acc-3",
												});
											else
												toast({
													title: n.cta ?? "Opening",
													msg: "Loading details…",
													tone: "info",
												});
										}}
										className="focus-ring mt-15 d-inline-flex align-items-center gap-1 fs-12 fw-bold text-pmgreen-ink transition hover-gap-15"
									>
										{n.cta} <Icon name="arrow-right" size={13} />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="border-top border-line bg-paper-2 px-4 py-3">
				<Button
					variant="outline"
					full
					icon="sliders"
					onClick={() =>
						toast({
							title: "Notification settings",
							msg: "Choose channels: SMS, email, in-app push.",
							tone: "info",
						})
					}
				>
					Notification preferences
				</Button>
			</div>
		</Drawer>
	);
}

/* ================================================================ Shell ================================================================ */

export function Shell({ children }: { children: ReactNode }) {
	const {
		navOpen,
		setNavOpen,
		setPaletteOpen,
		setNotifOpen,
		notifOpen,
		open,
		toast,
		balance,
	} = useApp();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (st) => st.location.pathname });

	const active =
		pathname === "/utility/settings"
			? "utilities"
			: pathname.replace("/utility/", "") || "home";

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen(true);
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [setPaletteOpen]);

	const onNav = (key: string, target?: string) => {
		setNavOpen(false);
		if (target === "top") {
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}
		// find the nav item to check for a route
		const item = NAV_GROUPS.flatMap((g) => g.items).find(
			(it) => it.key === key,
		);
		if (item?.to) {
			void navigate({ to: item.to as "/utility" });
			if (target) {
				setTimeout(() => {
					const el = document.getElementById(target);
					if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
				}, 120);
			} else {
				setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
			}
			return;
		}
		if (target) {
			const el = document.getElementById(target);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "start" });
				return;
			}
		}
	};

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const toggleSidebar = () => setSidebarCollapsed((c) => !c);

	const pageTitle = pathname.includes("/recurring")
			? "Household bills & rent"
			: pathname.includes("/electricity")
				? "Electricity"
				: pathname.includes("/water")
					? "Water"
					: pathname.includes("/internet")
						? "Internet"
						: pathname.includes("/mobile-money")
							? "Mobile Money"
							: pathname.includes("/settings")
								? "Utility Settings & Automation"
								: "Utility command centre";

	return (
		<div style={{ minHeight: "100vh", background: "#f2f4f8" }}>
			{/* Mobile sidebar overlay */}
			{navOpen && (
				<div
					className={cn(s["mobile-overlay"], s.show)}
					onClick={() => setNavOpen(false)}
				/>
			)}

			{/* Mobile sidebar drawer */}
			<aside className={cn(s["mobile-sidebar"], navOpen && s.open)}>
				<SideNav onNav={onNav} active={active} collapsed={false} onToggleCollapse={() => setNavOpen(false)} />
			</aside>

			<div className="d-flex">
				{/* Desktop sidebar */}
				<aside className={cn(s.sidebar, sidebarCollapsed && s.collapsed)} style={{ position: "relative" }}>
					<SideNav
						onNav={onNav}
						active={active}
						collapsed={sidebarCollapsed}
						onToggleCollapse={toggleSidebar}
					/>
				</aside>

				<div className={s["main-content"]}>
					{/* Topbar */}
					<header className={s["top-header"]}>
						<div className={s["top-header-inner"]}>
							<button
							onClick={() => setNavOpen(true)}
							aria-label="Open navigation"
							className={s["menu-btn"]}
						>
							<Icon name="menu" size={18} />
						</button>

							<div className={s["breadcrumb-area"]}>
								<div className={s.breadcrumbs}>
									<span>PayMo Business</span>
									<span className={s.sep}>›</span>
									<span className={s.current}>Utilities</span>
							</div>
							<h1 className={s["page-title"]}>{pageTitle}</h1>
						</div>

						<button
							onClick={() => setPaletteOpen(true)}
							className={cn(s["search-box"], "d-none d-md-flex")}
						>
							<Icon name="search" size={16} />
							<input readOnly placeholder="Search meters, refs, actions…" style={{ cursor: "pointer" }} />
						</button>

						<IconBtn
							icon="search"
							label="Search"
							className="d-md-none"
							onClick={() => setPaletteOpen(true)}
						/>

						<div className={s["topbar-actions"]}>
							<button
							onClick={() => open({ kind: "topup" })}
							className={cn(s["wallet-chip"], "d-none d-sm-inline-flex")}
						>
							<Icon name="wallet" size={14} />
							<span className="num">{kes(balance)}</span>
							<Icon name="plus" size={11} />
						</button>

							<div style={{ position: "relative" }}>
								<button
								type="button"
								className={s["action-btn"]}
								onClick={() => setNotifOpen(!notifOpen)}
							>
								<Icon name="bell" size={18} />
								<span className={s["action-badge"]}>5</span>
							</button>							</div>

							<button
								onClick={() => open({ kind: "buy", utility: "electricity" })}
								className={cn(s["buy-btn"], "d-none d-sm-inline-flex")}
							>
								<Icon name="bolt" size={15} />
								Buy utilities
							</button>

							<button
								onClick={() => open({ kind: "help" })}
								aria-label="Account"
								className={s["user-trigger"]}
							>
								JM
							</button>
						</div>
					</div>
					</header>

					<main style={{ padding: "20px 24px 110px" }}>{children}</main>
				</div>
			</div>

			{/* Mobile bottom nav */}
			<nav className={s["bottom-nav"]}>
				{[
					{ key: "home", label: "Home", icon: "home" as const, to: "/utility" },
					{ key: "electricity", label: "Utilities", icon: "grid" as const, to: "/utility/electricity" },
					{ key: "__buy", label: "Buy", icon: "bolt" as const },
					{ key: "history", label: "History", icon: "receipt" as const, to: "/utility", target: "sec-history" },
					{ key: "water", label: "Water", icon: "droplet" as const, to: "/utility/water" },
				].map((it) =>
					it.key === "__buy" ? (
						<button
							key={it.key}
							onClick={() => open({ kind: "buy", utility: "electricity" })}
							className={s["bottom-buy-btn"]}
						>
							<span className={s["bottom-buy-icon"]}>
								<Icon name={it.icon} size={18} />
							</span>
							<span>{it.label}</span>
						</button>
					) : (
						<button
							key={it.key}
							onClick={() => {
								if (it.to) {
									setNavOpen(false);
									navigate({ to: it.to });
								}
							}}
							className={cn(s["bottom-nav-item"], pathname === it.to && s.active)}
						>
							<Icon name={it.icon} size={19} />
							<span>{it.label}</span>
						</button>
					),
				)}
			</nav>

			<Palette />
			<NotifDrawer />
			<MobileNavDrawer onNav={onNav} active={active} />
		</div>
	);
}

/* Mobile drawer nav — now handled by the mobile-sidebar above, this is a no-op */
function MobileNavDrawer(_props: { onNav: (key: string, target?: string) => void; active: string }) {
	return null;
}

export { MODULES, SCHEDULES, PAY_METHODS };
