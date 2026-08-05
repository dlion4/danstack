/* ============================================================================
 * DevSidebar.tsx — collapsible left navigation for the Paymo BAAS Dev Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-dev-sidebar.*
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The "dashboard"
 *   item points at the layout index (/dev); all others resolve to the
 *   /dev/$module route. Collapsed state keeps icons; the mobile close button
 *   only renders below the lg breakpoint.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { DevLayoutContent, NavItem } from "../data/devLayoutData";
import { cx } from "../data/devLayoutData";
import styles from "../styles/devLayout.module.css";
import PaymoLogo from "../../../../components/shared/PaymoLogo";

const s = styles as Record<string, string>;

interface DevSidebarProps {
	content: DevLayoutContent;
	isDesktop: boolean;
	expanded: boolean;
	mobileOpen: boolean;
	activeSection: string;
	onToggle: () => void;
	onCloseMobile: () => void;
	onLogout: () => void;
}

export default function DevSidebar({
	content,
	isDesktop,
	expanded,
	mobileOpen,
	activeSection,
	onCloseMobile,
	onLogout,
}: DevSidebarProps) {
	const classes = cx(
		s.sidebar,
		isDesktop && expanded && s.expanded,
		!isDesktop && mobileOpen && s["mobile-open"],
		!isDesktop && !mobileOpen && s["mobile-closed"],
	);

		const [wsOpen, setWsOpen] = useState(false);

	const handleItemClick = (item: NavItem) => {
		if (item.opensAside) return;
		if (item.key === "logout") {
			onLogout();
			return;
		}
		if (!isDesktop) onCloseMobile();
	};

	return (
		<aside className={classes} aria-label="Developer navigation">
			<div className="d-flex align-items-center justify-content-between mb-2">
				<Link
					to="/dev"
					className={s.brand}
					aria-label="Go to developer dashboard"
				>
					<PaymoLogo expanded={expanded || !isDesktop} />
				</Link>
				{!isDesktop && (
					<button
						type="button"
						className={cx(s["sidebar-toggle"], "d-lg-none")}
						onClick={onCloseMobile}
						aria-label="Close menu"
					>
						<i className="bi bi-x-lg" />
					</button>
				)}
			</div>

			<div className="flex-grow-1">
				{content.navGroups.map((group) => (
					<div className="mb-2" key={group.title}>
						<span className={s["nav-group-label"]}>{group.title}</span>
						<nav className="d-flex flex-column">
							{group.items.map((item) => {
								const active = activeSection === item.key;

								const inner = (
									<>
										<span className={s["nav-icon"]}>
											<i className={`bi ${item.icon}`} />
										</span>
										<span className={s["nav-label"]}>{item.label}</span>
										{item.badge && (
											<span className={s["nav-badge"]}>{item.badge}</span>
										)}
									</>
								);

								const className = cx(s["nav-link"], active && s.active);

								if (item.opensAside || item.key === "logout") {
									return (
										<button
											type="button"
											key={item.key}
											className={className}
											onClick={() => handleItemClick(item)}
											title={item.label}
										>
											{inner}
										</button>
									);
								}

								return (
									<Link
										key={item.key}
										to={item.key === "dashboard" ? "/dev" : "/dev/$module"}
										params={
											item.key === "dashboard"
												? undefined
												: { module: item.key }
										}
										className={className}
										title={item.label}
										onClick={() => handleItemClick(item)}
									>
										{inner}
									</Link>
								);
							})}
						</nav>
					</div>
				))}
			</div>

		<div className={s.accountSwitcher}>
			<button
				type="button"
				className={cx(s.accountSwitcherBtn, wsOpen && s.chevRotated)}
				onClick={() => setWsOpen((v) => !v)}
				aria-label="Switch workspace">
				<div
					className={s.avatar}
					style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}>
					{content.user.initials}
				</div>
				<div className={s.details}>
					<div className="fw-bold text-truncate" style={{ fontSize: "0.82rem", color: "var(--text)" }}>{content.user.name}</div>
					<div className="text-truncate" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{content.user.role}</div>
				</div>
				<i className={cx("bi bi-chevron-up", s.accountChev)} />
			</button>

			<div className={cx(s.accountDropdown, wsOpen && s.show)}>
				{[
					{ key: "sandbox", name: "Sandbox Workspace", meta: "Active • 3 keys", active: true },
					{ key: "staging", name: "Staging Workspace", meta: "2 keys • Ready", active: false },
					{ key: "production", name: "Production API", meta: "4 keys • Restricted", active: false },
					{ key: "personal", name: "Personal Lab", meta: "1 key • Offline", active: false },
				].map((ws) => (
					<div
						className={cx(s.accountOption, ws.active && s.accountOptionActive)}
						key={ws.key}
						onClick={() => { setWsOpen(false); }}>
						<span className={cx(s.accountDot, ws.active ? s.dotGreen : s.dotRed)} />
						<div className={s.accountOptionInfo}>
							<div className={s.accountOptionName}>{ws.name}</div>
							<div className={s.accountOptionMeta}>{ws.meta}</div>
						</div>
						{ws.active && <span className={s.accountActiveChip}>Current</span>}
					</div>
				))}
			</div>
		</div>
		</aside>
	);
}
