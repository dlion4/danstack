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
	"financial-reporting": "/business-dashboard/financial-reporting",
	"accounts-payable": "/business-dashboard/accounts-payable",
	"bulk-disbursements": "/business-dashboard/bulk-disbursements",
	"invoicing-billing": "/business-dashboard/invoicing-billing",
	"payroll-hr": "/business-dashboard/payroll-hr",
	"treasury-cash": "/business-dashboard/treasury-cash",
	"multi-currency-treasury": "/business-dashboard/multi-currency-treasury",
	"open-banking": "/business-dashboard/open-banking",
	"virtual-accounts": "/business-dashboard/virtual-accounts",
	"get-paid": "/business-dashboard/get-paid",
	"collections-merchant": "/business-dashboard/collections-merchant",
	"business-onboarding": "/business-dashboard/business-onboarding",
	"apps-integrations": "/business-dashboard/apps-integrations",
	"settings-administration": "/business-dashboard/settings-administration",
	"support-disputes": "/business-dashboard/support-disputes",
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
