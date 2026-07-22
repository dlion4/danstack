/* ============================================================================
 * UtilitySidebar.tsx — collapsible left navigation for the Utility Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-utility-sidebar.*
 * LEGACY BRIDGE: every nav-link is now a real router <Link>. The utility layout
 *   has no "home" nav entry, so the brand mark links to the layout index
 *   (/utility) which renders the overview; service links use /utility/$module.
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { UtilityLayoutContent, NavItem } from '../data/utilityLayoutData';
import { cx } from '../data/utilityLayoutData';
import styles from '../styles/utilityLayout.module.css';

const s = styles as Record<string, string>;

interface UtilitySidebarProps {
  content: UtilityLayoutContent;
  isDesktop: boolean;
  expanded: boolean;
  mobileOpen: boolean;
  activeSection: string;
  onToggle: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export default function UtilitySidebar({
  content,
  isDesktop,
  expanded,
  mobileOpen,
  activeSection,
  onCloseMobile,
  onLogout,
}: UtilitySidebarProps) {
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
    <aside className={classes} aria-label="Utility navigation">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Link to="/utility" className={s.brand} aria-label="Go to utility overview">
          <div className={s['brand-icon']} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            <i className={`bi ${content.brand.icon}`} />
          </div>
          <span className={s['brand-text']}>{content.brand.name}</span>
          <span className={s['brand-tag']} style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}>
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
                    {item.badge !== undefined && <span className={s['nav-badge']}>{item.badge}</span>}
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
                    to="/utility/$module"
                    params={{ module: item.key }}
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
        to="/utility"
        className={s['sidebar-account']}
        onClick={() => { if (!isDesktop) onCloseMobile(); }}
      >
        <div className={s.avatar} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
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
