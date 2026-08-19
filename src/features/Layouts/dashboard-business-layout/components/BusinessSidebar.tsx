/* ============================================================================
 * BusinessSidebar.tsx — collapsible left navigation for the Business Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-business-sidebar.*
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The "dashboard"
 * item points at the layout index (/business-dashboard); all others resolve to the
 * /business-dashboard/$module route. The brand mark renders an icon (per the design).
 * ========================================================================== */
import { Link } from "@tanstack/react-router";
import type {
	BusinessLayoutContent,
	NavItem,
} from "../data/businessLayoutData";
import { cx } from "../data/businessLayoutData";
import styles from "../styles/businessLayout.module.css";
import PaymoLogo from "../../../../components/shared/PaymoLogo";

const s = styles as Record<string, string>;

/* Module key -> static route (mirrors src/routes/business-dashboard/*). */
const MODULE_PATH = {
	overview: "/business-dashboard",
	dashboard: "/business-dashboard",
	"command-center": "/business-dashboard/command-center",
	"marketing": "/business-dashboard/marketing",
	"products": "/business-dashboard/products",
	"inventory": "/business-dashboard/inventory",
	"portfolio": "/business-dashboard/portfolio",
	"funding": "/business-dashboard/funding",
	"insurance": "/business-dashboard/insurance",
	"integrations": "/business-dashboard/integrations",
	"team": "/business-dashboard/team",
	"notifications": "/business-dashboard/notifications",
	"profile": "/business-dashboard/profile",
	"data": "/business-dashboard/data",
	"disputes": "/business-dashboard/disputes",
} as const;

type ModulePath = (typeof MODULE_PATH)[keyof typeof MODULE_PATH];

function modulePath(key: string): ModulePath {
	return MODULE_PATH[key as keyof typeof MODULE_PATH] ?? "/business-dashboard";
}

interface BusinessSidebarProps {
	content: BusinessLayoutContent;
	isDesktop: boolean;
	expanded: boolean;
	mobileOpen: boolean;
	activeSection: string;
	onToggle: () => void;
	onCloseMobile: () => void;
	onLogout: () => void;
}

export default function BusinessSidebar({
	content,
	isDesktop,
	expanded,
	mobileOpen,
	activeSection,
	onCloseMobile,
	onLogout,
}: BusinessSidebarProps) {
	const classes = cx(
		s.sidebar,
		isDesktop && expanded && s.expanded,
		!isDesktop && mobileOpen && s["mobile-open"],
		!isDesktop && !mobileOpen && s["mobile-closed"],
	);

	const handleItemClick = (item: NavItem) => {
		if (item.opensAside) return;
		if (item.key === "logout") {
			onLogout();
			return;
		}
		if (!isDesktop) onCloseMobile();
	};

	return (
		<aside className={classes} aria-label="Business navigation">
			<div className="d-flex align-items-center justify-content-between mb-2">
				<Link
					to="/business-dashboard"
					className={s.brand}
					aria-label="Go to business dashboard"
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

			<div className={cx("flex-grow-1", s.navScroll)}>
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
						to={modulePath(item.key)}
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

{/* PayMo Pro Upgrade Section */}
			
				{/* <div className={s.upgradeCard}>
					<div className="d-flex align-items-center gap-2 mb-1">
						<i className="bi bi-stars" style={{ color: "#ffd66b" }} />
						<span className="fw-bold">PayMo Pro</span>
					</div>
					<div style={{ fontSize: "0.72rem", color: "#7b8aa3", lineHeight: 1.3 }}>
						Pro trial — 14 days left. Unlock KES 5M/day limits and priority support.
					</div>
				</div> */}

{/* User Row */}
				{/* <div className={s.userRow}>
					<div className={s.userAvatar}>{content.user.initials}</div>
					<div className="flex-grow-1" style={{ lineHeight: 1.2 }}>
						<div className="fw-semibold" style={{ fontSize: "0.78rem" }}>{content.user.name}</div>
						<div style={{ fontSize: "0.66rem", color: "#7b8aa3" }}>{content.user.role}</div>
					</div>
					<i className="bi bi-box-arrow-right" style={{ fontSize: "0.8rem", color: "#7b8aa3", cursor: "pointer" }} onClick={onLogout} />
				</div> */}
			

{/* Switch Account button */}
				<Link
					to="/auth/hub"
					className={s.switchAccountBtn}
					title="Switch Account — easily switch between Utility, Biz, Dev, and Savings accounts"
				>
					<i className="bi bi-arrow-left-right" />
					{(expanded || !isDesktop) && <span>Switch Account</span>}
				</Link>
		</aside>
	);
}
