/* ============================================================================
 * UtilityHeader.tsx — fixed top header for the Paymo BAAS Utility Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-utility-header.*
 * LEGACY BRIDGE: dropdowns (notifications, user) and the auto-pay aside-opener
 *   are kept, with dropdown open state lifted into the shell. The wallet
 *   balance chip is a static read-out from the layout content.
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { UtilityLayoutContent, AsideKind } from '../data/utilityLayoutData';
import { cx } from '../data/utilityLayoutData';
import styles from '../styles/utilityLayout.module.css';

const s = styles as Record<string, string>;

export type DropdownName = 'notifications' | 'user';

interface UtilityHeaderProps {
  content: UtilityLayoutContent;
  expanded: boolean;
  openDropdown: DropdownName | null;
  onToggleSidebar: () => void;
  onToggleDropdown: (name: DropdownName) => void;
  onOpenAside: (kind: AsideKind) => void;
  onLogout: () => void;
  onSearchSubmit: (query: string) => void;
  unreadCount: number;
}

export default function UtilityHeader({
  content,
  expanded,
  openDropdown,
  onToggleSidebar,
  onToggleDropdown,
  onOpenAside,
  onLogout,
  onSearchSubmit,
  unreadCount,
}: UtilityHeaderProps) {
  const isDropdownOpen = (name: DropdownName) => openDropdown === name;

  return (
    <header className={cx(s['top-header'], expanded && s['sidebar-expanded'])}>
      {/* ---------- left: toggle + search ---------- */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className={s['sidebar-toggle']}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list" />
        </button>

        <form
          className={cx(s['global-search'], 'd-none d-md-block')}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(new FormData(e.currentTarget).get('q') as string);
          }}
        >
          <i className={cx('bi bi-search', s['search-icon'])} />
          <input
            type="text"
            name="q"
            placeholder="Search billers, meters, history…"
            aria-label="Search"
          />
        </form>
      </div>

      {/* ---------- right: actions ---------- */}
      <div className={s['header-actions']}>
        {/* Wallet balance read-out */}
        <div
          className="d-none d-sm-flex align-items-center gap-2 px-3 py-2 rounded-3"
          style={{
            background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.02))',
            border: '1px solid rgba(245,158,11,0.2)',
            color: 'var(--paymo-warning)',
            fontWeight: 700,
            fontSize: '0.82rem',
          }}
        >
          <i className="bi bi-wallet2" />
          <span>{content.walletBalance}</span>
        </div>

        <div className={cx('vr d-none d-lg-block mx-1')} style={{ height: 28, opacity: 0.15 }} />

        {/* Auto-Pay aside */}
        <button
          type="button"
          className={s['header-action']}
          onClick={() => onOpenAside('autoPay')}
          aria-label="Auto-Pay manager"
          title="Auto-Pay"
        >
          <i className={cx('bi bi-calendar-check', s['action-icon'])} />
        </button>

        {/* Notifications dropdown */}
        <div className="position-relative" data-dropdown="notifications">
          <button
            type="button"
            className={s['header-action']}
            aria-expanded={isDropdownOpen('notifications')}
            aria-haspopup="menu"
            aria-label={`Notifications, ${unreadCount} unread`}
            onClick={() => onToggleDropdown('notifications')}
          >
            <i className={cx('bi bi-bell', s['action-icon'])} />
            {unreadCount > 0 && <span className={s['header-badge']}>{unreadCount}</span>}
          </button>
          {isDropdownOpen('notifications') && (
            <div className={cx(s['dropdown-panel'], s.show)} role="menu">
              <div className={s['panel-header']}>
                <span className={s['panel-title']}>Utility Alerts</span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => onToggleDropdown('notifications')}
                >
                  Clear all
                </button>
              </div>
              <div className={s['panel-body']}>
                {content.notifications.map((n) => (
                  <div className={cx(s['notification-item'], n.unread && s.unread)} key={n.id}>
                    <div className={cx(s['notification-icon'], s[n.tone])}>
                      <i className={`bi ${n.icon}`} />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <span className="fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
                          {n.title}
                        </span>
                        {n.unread && <span className={s['notification-dot']} />}
                      </div>
                      <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{n.desc}</div>
                    </div>
                    <span className="text-muted flex-shrink-0" style={{ fontSize: '0.7rem' }}>{n.time}</span>
                  </div>
                ))}
              </div>
              <div className={cx(s['panel-footer'], 'text-center')}>
                <Link
                  to="/utility/$module"
                  params={{ module: 'history' }}
                  className={cx(s.btnLink, s.btnLinkPrimary)}
                  onClick={() => onToggleDropdown('notifications')}
                >
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="position-relative" data-dropdown="user">
          <button
            type="button"
            className={s['user-trigger']}
            aria-expanded={isDropdownOpen('user')}
            aria-haspopup="menu"
            aria-label="Account menu"
            onClick={() => onToggleDropdown('user')}
          >
            <div className={s.avatar} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              {content.user.initials}
            </div>
            <div className={s['user-meta']}>
              <div className={s['user-name']}>{content.user.name}</div>
              <div className={s['user-role']}>{content.user.role}</div>
            </div>
            <i className={cx('bi bi-chevron-down', s.chev)} style={{ fontSize: '0.8rem' }} />
          </button>
          {isDropdownOpen('user') && (
            <div className={cx(s['dropdown-panel'], s.show)} role="menu" style={{ width: 280 }}>
              <div className="p-3 d-flex align-items-center gap-3 border-bottom">
                <div
                  className={s.avatar}
                  style={{
                    width: 46,
                    height: 46,
                    fontSize: '1rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {content.user.initials}
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{content.user.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{content.user.email}</div>
                </div>
              </div>
              <div className={s['panel-body']}>
                <div className="d-flex flex-column">
                  <button type="button" className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-person" /> Profile
                  </button>
                  <button type="button" className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-gear" /> Settings
                  </button>
                  <button type="button" className={s.menuItem} onClick={() => onOpenAside('autoPay')}>
                    <i className="bi bi-calendar-check" /> Auto-Pay
                  </button>
                </div>
              </div>
              <div className={s['panel-footer']}>
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: '0.82rem' }}
                  onClick={onLogout}
                >
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
