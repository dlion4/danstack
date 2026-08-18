/* ============================================================================
 * CardsSidebar.tsx — collapsible left navigation for the Paymo BAAS Cards Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-sidebar.*
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The collapsed
 *   state keeps icons. The "logout" item and any item with opensAside stay as
 *   <button>s and call back into the shell.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";
import type { CardsLayoutContent, NavItem } from "../data/cardsLayoutData";
import { cx } from "../data/cardsLayoutData";
import styles from "../styles/cardsLayout.module.css";
import PaymoLogo from "../../../../components/shared/PaymoLogo";

const s = styles as Record<string, string>;

/* Module key -> static route (mirrors src/routes/cards/app/*). */
const MODULE_PATH: Record<string, string> = {
	"card-overview": "/cards/app",
	"card-command-center": "/cards/app/card-command-center",
	"virtual-debit-cards": "/cards/app/virtual-debit-cards",
	"virtual-credit-cards": "/cards/app/virtual-credit-cards",
	"physical-debit-cards": "/cards/app/physical-debit-cards",
	"prepaid-card-management": "/cards/app/prepaid-card-management",
	"corporate-business-cards": "/cards/app/corporate-business-cards",
	"card-security-fraud-prevention": "/cards/app/card-security-fraud-prevention",
	"card-analytics-reporting": "/cards/app/card-analytics-reporting",
	"card-program-administration": "/cards/app/card-program-administration",
	"account-settings": "/cards/app/card-settings-support",
};

interface CardsSidebarProps {
	content: CardsLayoutContent;
	isDesktop: boolean;
	expanded: boolean;
	mobileOpen: boolean;
	activeSection: string;
	onToggle: () => void;
	onCloseMobile: () => void;
	onLogout: () => void;
}

export default function CardsSidebar({
	content,
	isDesktop,
	expanded,
	mobileOpen,
	activeSection,
	onCloseMobile,
	onLogout,
}: CardsSidebarProps) {
	const classes = cx(
		s.sidebar,
		isDesktop && expanded && s.expanded,
		!isDesktop && mobileOpen && s.mobileOpen,
		!isDesktop && !mobileOpen && s.mobileClosed,
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
		<aside className={classes} aria-label="Cards navigation">
			<div className={s.brandRow}>
				<Link
					to="/cards/app"
					className={s.brandLink}
					aria-label="Go to card overview"
				>
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
					<div className="mb-2" key={group.title}>
						<span className={s.navGroupLabel}>{group.title}</span>
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
										to={MODULE_PATH[item.key] ?? "/cards/app"}
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
					className={s.switchAccountEmerald}
					title="Switch Account — easily switch between Utility, Biz, Dev, and Savings accounts"
				>
					<i className="bi bi-arrow-left-right" />
					{(expanded || !isDesktop) && <span>Switch Account</span>}
				</Link>
		
		</aside>
	);
}
