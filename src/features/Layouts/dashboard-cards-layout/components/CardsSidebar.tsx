/* ============================================================================
 * CardsSidebar.tsx — collapsible left navigation for the Paymo BAAS Cards Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-sidebar.*
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The collapsed
 *   state keeps icons. The "logout" item and any item with opensAside stay as
 *   <button>s and call back into the shell.
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { CardsLayoutContent, NavItem, AsideKind } from '../data/cardsLayoutData';
import { cx } from '../data/cardsLayoutData';
import styles from '../styles/cardsLayout.module.css';

const s = styles as Record<string, string>;

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
    if (item.key === 'logout') {
      onLogout();
      return;
    }
    if (!isDesktop) onCloseMobile();
  };

  return (
    <aside className={classes} aria-label="Cards navigation">
      <div className={s.brandRow}>
        <Link to="/cards/cards" className={s.brandLink} aria-label="Go to card overview">
          <div className={s.brand}>
            <div className={s.brandIcon}><i className={`bi ${content.brand.icon}`} /></div>
            <span className={s.brandText}>{content.brand.name}</span>
            <span className={s.brandTag}>{content.brand.tag}</span>
          </div>
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
                const isBadgeNumber = typeof item.badge === 'number';

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
                          item.badge === 'Live' && s.live,
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

                if (item.opensAside || item.key === 'logout') {
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
                    to={item.key === 'card-overview' ? '/cards/cards' : '/cards/app/$section'}
                    params={item.key === 'card-overview' ? undefined : { section: item.key }}
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

      <Link to="/cards/cards" className={s.sidebarAccount} onClick={() => { if (!isDesktop) onCloseMobile(); }}>
        <div className={s.avatar}>{content.user.initials}</div>
        <div className={s.accountDetails}>
          <div className={s.accountName}>{content.user.name}</div>
          <div className={s.accountRole}>{content.user.role}</div>
        </div>
      </Link>
    </aside>
  );
}
