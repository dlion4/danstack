/* ============================================================================
 * BusinessHeader.tsx — fixed top header for the Paymo BAAS Business Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-business-header.*
 * LEGACY BRIDGE: dropdowns (accountId, notifications, user) and the compliance
 *   aside-opener are kept, with dropdown open state lifted into the shell.
 *   Click-outside + Escape + Ctrl/Cmd+B live in BusinessShell.
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { BusinessLayoutContent, AsideKind } from '../data/businessLayoutData';
import { cx } from '../data/businessLayoutData';
import styles from '../styles/businessLayout.module.css';

const s = styles as Record<string, string>;

export type DropdownName = 'accountId' | 'notifications' | 'user';

interface BusinessHeaderProps {
  content: BusinessLayoutContent;
  expanded: boolean;
  openDropdown: DropdownName | null;
  onToggleSidebar: () => void;
  onToggleDropdown: (name: DropdownName) => void;
  onOpenAside: (kind: AsideKind) => void;
  onLogout: () => void;
  onSearchSubmit: (query: string) => void;
  unreadCount: number;
}

export default function BusinessHeader({
  content,
  expanded,
  openDropdown,
  onToggleSidebar,
  onToggleDropdown,
  onOpenAside,
  onLogout,
  onSearchSubmit,
  unreadCount,
}: BusinessHeaderProps) {
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
            placeholder="Search invoices, vendors, accounts…"
            aria-label="Search"
          />
        </form>
      </div>

      {/* ---------- right: actions ---------- */}
      <div className={s['header-actions']}>
        {/* Business entity / account chip */}
        <div className="position-relative" data-dropdown="accountId">
          <button
            type="button"
            className={s['account-id-chip']}
            aria-expanded={isDropdownOpen('accountId')}
            aria-haspopup="menu"
            aria-label="Business entity"
            onClick={() => onToggleDropdown('accountId')}
          >
            <i className="bi bi-layers" />
            <span className={s['account-id-text']}>{content.accountId}</span>
            <i className={cx('bi bi-chevron-down', s.chev)} style={{ fontSize: '0.7rem' }} />
          </button>
          {isDropdownOpen('accountId') && (
            <div className={cx(s['dropdown-panel'], s.show)} role="menu">
              <div className={s['panel-header']}>
                <span className={s['panel-title']}>Business Entity</span>
                <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--paymo-accent)' }}>Active</span>
              </div>
              <div className={s['panel-body']}>
                <div className="p-3">
                  <div
                    className="d-flex align-items-center justify-content-between p-2 rounded-3 mb-2"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <code className="fw-bold" style={{ color: 'var(--paymo-accent)' }}>{content.accountId}</code>
                    <button type="button" className="btn btn-sm btn-link text-decoration-none p-1" aria-label="Copy account id">
                      <i className="bi bi-clipboard" />
                    </button>
                  </div>
                </div>
              </div>
              <div className={cx(s['panel-footer'], 'd-flex justify-content-between')}>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-muted"
                  onClick={() => onOpenAside('compliance')}
                >
                  <i className="bi bi-shield-check me-1" /> KYB Status
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-muted"
                  onClick={() => onOpenAside('entity')}
                >
                  <i className="bi bi-building me-1" /> Entity
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={cx('vr d-none d-lg-block mx-1')} style={{ height: 28, opacity: 0.15 }} />

        {/* Compliance aside */}
        <button
          type="button"
          className={s['header-action']}
          onClick={() => onOpenAside('compliance')}
          aria-label="Compliance center"
          title="Compliance"
        >
          <i className={cx('bi bi-shield-check', s['action-icon'])} />
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
                <span className={s['panel-title']}>Business Alerts</span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => onToggleDropdown('notifications')}
                >
                  Mark all read
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
                  to="/business/$module"
                  params={{ module: 'insights' }}
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
            <div className={s.avatar} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
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
                    background: 'linear-gradient(135deg,#10b981,#059669)',
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
                  <button type="button" className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-people" /> Team
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
