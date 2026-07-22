/* ============================================================================
 * CardsHeader.tsx — fixed top header for the Paymo BAAS Cards Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-header.*
 * LEGACY BRIDGE: the dropdowns (notifications, user) and the aside-opener
 *   (cardProgram, security) are kept, with dropdown open state lifted into
 *   the shell and passed down. Click-outside + Escape are handled in CardsShell.
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { CardsLayoutContent, AsideKind } from '../data/cardsLayoutData';
import { cx } from '../data/cardsLayoutData';
import styles from '../styles/cardsLayout.module.css';

const s = styles as Record<string, string>;

export type DropdownName = 'notifications' | 'user';

interface CardsHeaderProps {
  content: CardsLayoutContent;
  expanded: boolean;
  openDropdown: DropdownName | null;
  onToggleSidebar: () => void;
  onToggleDropdown: (name: DropdownName) => void;
  onOpenAside: (kind: AsideKind) => void;
  onLogout: () => void;
  onSearchSubmit: (query: string) => void;
  unreadCount: number;
}

export default function CardsHeader({
  content,
  expanded,
  openDropdown,
  onToggleSidebar,
  onToggleDropdown,
  onOpenAside,
  onLogout,
  onSearchSubmit,
  unreadCount,
}: CardsHeaderProps) {
  const isDropdownOpen = (name: DropdownName) => openDropdown === name;

  return (
    <header className={cx(s.topHeader, expanded && s.sidebarExpanded)}>
      {/* ---------- left: toggle + search ---------- */}
      <div className={s.headerLeft}>
        <button
          type="button"
          className={s.sidebarToggle}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list" />
        </button>
        <form
          className={cx(s.globalSearch, 'd-none d-md-block')}
          role="search"
          onSubmit={(e) => { e.preventDefault(); onSearchSubmit(new FormData(e.currentTarget).get('q') as string); }}
        >
          <i className={cx('bi bi-search', s.searchIcon)} />
          <input
            type="text"
            name="q"
            className={s.searchInput}
            placeholder="Search cards, holders, transactions…"
            aria-label="Search"
          />
        </form>
      </div>

      {/* ---------- right: actions ---------- */}
      <div className={s.headerActions}>
        {/* Card Program */}
        <button
          type="button"
          className={s.headerAction}
          onClick={() => onOpenAside('cardProgram')}
          aria-label="Card program settings"
          title="Card Program"
        >
          <i className={cx('bi bi-gear', s.actionIcon)} />
        </button>

        <div className={cx(s.vr, 'd-none d-lg-block')} />

        {/* Notifications dropdown */}
        <div className={s.dropdownWrap}>
          <button
            type="button"
            className={s.headerAction}
            aria-expanded={isDropdownOpen('notifications')}
            aria-haspopup="menu"
            aria-label={`Notifications, ${unreadCount} unread`}
            onClick={() => onToggleDropdown('notifications')}
          >
            <i className={cx('bi bi-bell', s.actionIcon)} />
            {unreadCount > 0 && <span className={s.headerBadge}>{unreadCount}</span>}
          </button>
          {isDropdownOpen('notifications') && (
            <div className={cx(s.dropdownPanel, s.show)} role="menu">
              <div className={s.panelHeader}>
                <span className={s.panelTitle}>Card Alerts</span>
                <span className={cx(s.badgeMini, s.badgeSoft)}>{unreadCount} new</span>
              </div>
              <div className={s.panelBody}>
                {content.notifications.map((n) => (
                  <div className={cx(s.notificationItem, n.unread && s.unread)} key={n.id}>
                    <div className={cx(s.notificationIcon, s[n.tone])}>
                      <i className={`bi ${n.icon}`} />
                    </div>
                    <div className={s.notificationBody}>
                      <div className="d-flex align-items-start gap-2">
                        <span className={s.notificationTitle}>{n.title}</span>
                        {n.unread && <span className={s.notificationDot} />}
                      </div>
                      <div className={s.notificationDesc}>{n.desc}</div>
                    </div>
                    <span className={s.notificationTime}>{n.time}</span>
                  </div>
                ))}
              </div>
              <div className={cx(s.panelFooter, 'text-center')}>
                <Link to="/transaction_dashboard/app/$section" params={{ section: 'card-transactions' }} className={cx(s.btnLink, s.btnLinkPrimary)}>
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className={s.dropdownWrap}>
          <button
            type="button"
            className={s.userTrigger}
            aria-expanded={isDropdownOpen('user')}
            aria-haspopup="menu"
            aria-label="Account menu"
            onClick={() => onToggleDropdown('user')}
          >
            <div className={s.userAvatar}>{content.user.initials}</div>
            <div className={s.userMeta}>
              <div className={s.userName}>{content.user.name}</div>
              <div className={s.userRole}>{content.user.role}</div>
            </div>
            <i className={cx('bi bi-chevron-down', s.chev)} />
          </button>
          {isDropdownOpen('user') && (
            <div className={cx(s.dropdownPanel, s.show)} role="menu" style={{ width: 280 }}>
              <div className="d-flex align-items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--cl-border)' }}>
                <div className={s.userAvatar} style={{ width: 46, height: 46, fontSize: '1rem' }}>
                  {content.user.initials}
                </div>
                <div>
                  <div className={s.userName}>{content.user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cl-muted)' }}>{content.user.email}</div>
                </div>
              </div>
              <div className={s.panelBody}>
                <div className="d-flex flex-column">
                  <button type="button" className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-person" /> Profile
                  </button>
                  <button type="button" className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-gear" /> Settings
                  </button>
                  <button type="button" className={s.menuItem} onClick={() => onOpenAside('security')}>
                    <i className="bi bi-shield-check" /> Security
                  </button>
                </div>
              </div>
              <div className={s.panelFooter}>
                <button type="button" className={cx(s.btnDanger, 'w-100')} onClick={onLogout}>
                  <i className="bi bi-box-arrow-right" /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
