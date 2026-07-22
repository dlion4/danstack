/* ============================================================================
 * BusinessSidebar.tsx — collapsible left navigation for the Business Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-business-sidebar.*
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The "dashboard"
 *   item points at the layout index (/business); all others resolve to the
 *   /business/$module route. The brand mark renders an icon (per the design).
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { BusinessLayoutContent, NavItem } from '../data/businessLayoutData';
import { cx } from '../data/businessLayoutData';
import styles from '../styles/businessLayout.module.css';

const s = styles as Record<string, string>;

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
    !isDesktop && mobileOpen && s['mobile-open'],
    !isDesktop && !mobileOpen && s['mobile-closed'],
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
    <aside className={classes} aria-label="Business navigation">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Link to="/business" className={s.brand} aria-label="Go to business dashboard">
          <div className={s['brand-icon']} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <i className={`bi ${content.brand.icon}`} />
          </div>
          <span className={s['brand-text']}>{content.brand.name}</span>
          <span className={s['brand-tag']} style={{ color: '#10b981', background: 'rgba(16,185,129,0.08)' }}>
            {content.brand.tag}
          </span>
        </Link>
        {!isDesktop && (
          <button
            type="button"
            className={cx(s['sidebar-toggle'], 'd-lg-none')}
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
            <span className={s['nav-group-label']}>{group.title}</span>
            <nav className="d-flex flex-column">
              {group.items.map((item) => {
                const active = activeSection === item.key;

                const inner = (
                  <>
                    <span className={s['nav-icon']}>
                      <i className={`bi ${item.icon}`} />
                    </span>
                    <span className={s['nav-label']}>{item.label}</span>
                    {item.badge && <span className={s['nav-badge']}>{item.badge}</span>}
                  </>
                );

                const className = cx(s['nav-link'], active && s.active);

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
                    to={item.key === 'dashboard' ? '/business' : '/business/$module'}
                    params={item.key === 'dashboard' ? undefined : { module: item.key }}
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

      <Link
        to="/business"
        className={s['sidebar-account']}
        onClick={() => { if (!isDesktop) onCloseMobile(); }}
      >
        <div className={s.avatar} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          {content.user.initials}
        </div>
        <div className={s.details}>
          <div className="fw-bold text-truncate" style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
            {content.user.name}
          </div>
          <div className="text-truncate" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            {content.user.role}
          </div>
        </div>
      </Link>
    </aside>
  );
}
