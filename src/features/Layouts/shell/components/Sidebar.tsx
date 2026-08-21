/* ============================================================================
 * Sidebar.tsx — collapsible left navigation for the Paymo BAAS shell.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html -> the <aside class="sidebar"> block +
 *   the renderNav() innerHTML helper.
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The collapsed
 *   state keeps icons + an always-visible numeric badge so badges never
 *   disappear when the rail is collapsed. The "logout" item and any item with
 *   opensAside stay as <button>s and call back into the shell.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";
import type { AsideKind, NavItem, ShellContent } from "../data/shellData";
import { cx } from "../data/shellData";
import styles from "../styles/shell.module.css";
import PaymoLogo from "../../../../components/shared/PaymoLogo";

const s = styles as Record<string, string>;

interface SidebarProps {
	content: ShellContent;
	isDesktop: boolean;
	expanded: boolean;
	mobileOpen: boolean;
	activeSection: string;
	onToggle: () => void;
	onCloseMobile: () => void;
	onOpenAside: (kind: AsideKind) => void;
	onLogout: () => void;
}

/* Mapping from nav item keys to their specific route paths */
const ROUTE_MAP: Record<string, string> = {
	"transfer-overview": "/pm/app/transfer-overview",
	"initiate-transfer": "/pm/app/initiate-transfer",
	"transfer-management": "/pm/app/transfer-management",
	"payment-rails": "/pm/app/payment-rails",
	"mobile-money": "/pm/app/mobile-money",
	"onboarding": "/pm/app/onboarding",
	"customers": "/pm/app/customers",
	"liquidity": "/pm/app/liquidity",
	"reconciliation": "/pm/app/reconciliation",
	"settlement": "/pm/app/settlement",
	"fx": "/pm/app/fx",
	"fees": "/pm/app/fees",
	"compliance": "/pm/app/compliance",
	"disputes": "/pm/app/disputes",
	"kra-government": "/pm/app/kra-government",
	"analytics": "/pm/app/analytics",
	"ops-health": "/pm/app/ops-health",
	"account": "/pm/app/account",
	"settings": "/pm/app/settings",
	"support": "/pm/app/support",
};

function getRoutePath(key: string): string {
	return ROUTE_MAP[key] || `/pm/app/${key}`;
}

export default function Sidebar({
	content,
	isDesktop,
	expanded,
	mobileOpen,
	activeSection,
	onCloseMobile,
	onOpenAside,
	onLogout,
}: SidebarProps) {
	const classes = cx(
		s.sidebar,
		isDesktop && expanded && s.expanded,
		!isDesktop && mobileOpen && s.mobileOpen,
		!isDesktop && !mobileOpen && s.mobileClosed,
	);

	const handleItemClick = (item: NavItem) => {
		if (item.opensAside) {
			onOpenAside(item.opensAside);
			return;
		}
		if (item.key === "logout") {
			onLogout();
			return;
		}
		// routing happens via <Link>; close mobile drawer after click
		if (!isDesktop) onCloseMobile();
	};

	return (
		<aside className={classes} aria-label="Primary navigation">
			<div className={s.brandRow}>
				<Link to="/app" className={s.brandLink} aria-label="Go to dashboard">
					<PaymoLogo expanded={expanded || !isDesktop} />
				</Link>
				{!isDesktop && (
					<button
						type="button"
						className={s.sidebarToggle}
						onClick={onCloseMobile}
						aria-label="Close menu"
					>
						<i className="bi bi-x-lg" />
					</button>
				)}
			</div>

			<div className={s.navScroll}>
				{content.navGroups.map((group) => (
					<div 
						className={cx("mb-2", group.bgColor === "blue" && s.navGroupBlue)} 
						key={group.title}
					>
						<span className={s.navGroupLabel}>{group.title}</span>
						
						{/* Render sub-groups if they exist */}
						{group.subGroups && group.subGroups.length > 0 ? (
							group.subGroups.map((subGroup) => (
								<div key={subGroup.title} className="mb-1">
									<span className={s.navSubGroupLabel}>{subGroup.title}</span>
									<nav className="d-flex flex-column">
										{subGroup.items.map((item) => {
											const active = activeSection === item.key;
											const isBadgeNumber = typeof item.badge === "number";

											const inner = (
												<>
													<span className={s.navIcon}>
														<i className={`bi ${item.icon}`} />
													</span>
													<span className={s.navLabel}>{item.label}</span>
													{item.badge && (
														<span
															className={cx(
																s.navBadge,
																item.badge === "Live" && s.live,
															)}
														>
															{item.badge}
														</span>
													)}
													{/* numeric badges stay visible even when collapsed */}
													{isBadgeNumber && (
														<span className={s.navBadgeAlways}>{item.badge}</span>
													)}
												</>
											);

											const className = cx(s.navLink, active && s.active);

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
													to={getRoutePath(item.key)}
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
							))
						) : (
							/* Fallback to items array if no sub-groups */
							<nav className="d-flex flex-column">
								{group.items.map((item) => {
									const active = activeSection === item.key;
									const isBadgeNumber = typeof item.badge === "number";

									const inner = (
										<>
											<span className={s.navIcon}>
												<i className={`bi ${item.icon}`} />
											</span>
											<span className={s.navLabel}>{item.label}</span>
											{item.badge && (
												<span
													className={cx(
														s.navBadge,
														item.badge === "Live" && s.live,
													)}
												>
													{item.badge}
												</span>
											)}
											{/* numeric badges stay visible even when collapsed */}
											{isBadgeNumber && (
												<span className={s.navBadgeAlways}>{item.badge}</span>
											)}
										</>
									);

									const className = cx(s.navLink, active && s.active);

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
											to={getRoutePath(item.key)}
											className={className}
											title={item.label}
											onClick={() => handleItemClick(item)}
										>
											{inner}
										</Link>
									);
								})}
							</nav>
						)}
					</div>
				))}
			</div>

			{/* Switch Account button */}
			<Link
				to="/auth/hub"
				className={s.switchAccountBtn}
				title="Switch Account — easily switch between Utility, Business, Developer, and Savings accounts"
			>
				<i className="bi bi-arrow-left-right" />
				{(expanded || !isDesktop) && <span>Switch Account</span>}
			</Link>

		</aside>
	);
}
