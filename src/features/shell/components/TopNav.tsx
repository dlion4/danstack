/* ============================================================================
 * TopNav.tsx — fixed top header for the Paymo BAAS shell.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html -> the <header class="top-header"> block +
 *   toggleDropdown() / closeAllDropdowns() vanilla JS.
 * LEGACY BRIDGE: the three dropdowns (account-id, notifications, user) and the
 *   two aside-openers (security, developers) are kept, with dropdown open
 *   state lifted into the shell and passed down. Click-outside + Escape are
 *   handled in AppShell. Account switching + copy are wired to real behavior.
 * ========================================================================== */
import { Link } from '@tanstack/react-router';
import type { ShellContent, AsideKind } from '../data/shellData';
import { cx } from '../data/shellData';
import styles from '../styles/shell.module.css';

const s = styles as Record<string, string>;

export type DropdownName = 'accountId' | 'notifications' | 'user';

interface TopNavProps {
  content: ShellContent;
  expanded: boolean;
  openDropdown: DropdownName | null;
  onToggleSidebar: () => void;
  onToggleDropdown: (name: DropdownName) => void;
  onOpenAside: (kind: AsideKind) => void;
  onCopyAccountId: () => void;
  onSwitchAccount: (accountId: string, accountName: string) => void;
  onLogout: () => void;
  onSearchSubmit: (query: string) => void;
  unreadCount: number;
}

export default function TopNav({
  content,
  expanded,
  openDropdown,
  onToggleSidebar,
  onToggleDropdown,
  onOpenAside,
  onCopyAccountId,
  onSwitchAccount,
  onLogout,
  onSearchSubmit,
  unreadCount,
}: TopNavProps) {
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
            placeholder="Search transfers, beneficiaries, references…"
            aria-label="Search"
          />
        </form>
      </div>

      {/* ---------- right: actions ---------- */}
      <div className={s.headerActions}>
        {/* Account ID dropdown */}
        <div className={s.dropdownWrap}>
          <button
            type="button"
            className={s.accountIdChip}
            aria-expanded={isDropdownOpen('accountId')}
            aria-haspopup="menu"
            onClick={() => onToggleDropdown('accountId')}
          >
            <i className="bi bi-layers" />
            <span className={s.accountIdText}>{content.accountId}</span>
            <i className={cx('bi bi-chevron-down', s.chev)} />
          </button>
          {isDropdownOpen('accountId') && (
            <div className={cx(s.dropdownPanel, s.show)} role="menu">
              <div className={s.panelHeader}>
                <span className={s.panelTitle}>Account ID</span>
                <span className={cx(s.badgeMini, s.badgeOk)}>Live</span>
              </div>
              <div className={s.panelBody}>
                <div className="p-3">
                  <div
                    className="d-flex align-items-center justify-content-between p-2 mb-2"
                    style={{ background: 'var(--sh-glass-bg)', border: '1px solid var(--sh-glass-border)', borderRadius: 'var(--sh-radius-xs)' }}
                  >
                    <code style={{ color: 'var(--sh-accent-2)', fontWeight: 700 }}>{content.accountId}</code>
                    <button type="button" className={s.btnLink} onClick={onCopyAccountId} aria-label="Copy account ID">
                      <i className="bi bi-clipboard" />
                    </button>
                  </div>
                  <div className="d-grid gap-2">
                    {content.accounts.map((acc) => (
                      <button
                        type="button"
                        key={acc.id}
                        className={s.accountRow}
                        onClick={() => onSwitchAccount(acc.id, acc.name)}
                      >
                        <span>
                          <span className={cx(s.accountName, 'd-block')}>{acc.name}</span>
                          <span className={cx(s.accountSub, 'd-block')}>{acc.id}</span>
                        </span>
                        <span className={cx(s.badgeMini, s.badgeSoft)}>{acc.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className={cx(s.panelFooter, 'd-flex justify-content-between align-items-center')}>
                <button type="button" className={s.btnLink} onClick={() => onOpenAside('security')}>
                  <i className="bi bi-shield-check" /> Security
                </button>
                <button type="button" className={s.btnLink} onClick={() => onOpenAside('developers')}>
                  <i className="bi bi-terminal" /> Developers
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={cx(s.vr, 'd-none d-lg-block')} />

        {/* Security */}
        <button
          type="button"
          className={s.headerAction}
          onClick={() => onOpenAside('security')}
          aria-label="Security center"
          title="Security"
        >
          <i className={cx('bi bi-shield-check', s.actionIcon)} />
        </button>

        {/* Developers */}
        <button
          type="button"
          className={s.headerAction}
          onClick={() => onOpenAside('developers')}
          aria-label="Developer tools"
          title="Developers"
        >
          <i className={cx('bi bi-code-slash', s.actionIcon)} />
        </button>

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
                <span className={s.panelTitle}>Notifications</span>
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
                <Link to="/app/$section" params={{ section: 'support' }} className={cx(s.btnLink, s.btnLinkPrimary)}>
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
              <div className="d-flex align-items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--sh-glass-border)' }}>
                <div className={s.userAvatar} style={{ width: 46, height: 46, fontSize: '1rem' }}>
                  {content.user.initials}
                </div>
                <div>
                  <div className={s.userName}>{content.user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sh-ink-3)' }}>{content.user.email}</div>
                </div>
              </div>
              <div className={s.panelBody}>
                <div className="d-flex flex-column">
                  <Link to="/app/$section" params={{ section: 'settings' }} className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-person" /> Profile
                  </Link>
                  <Link to="/app/$section" params={{ section: 'settings' }} className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-gear" /> Settings
                  </Link>
                  <Link to="/app/$section" params={{ section: 'support' }} className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-envelope" /> Inbox
                    <span className={cx(s.badgeMini, s.badgeOk, 'ms-auto')}>3</span>
                  </Link>
                  <button type="button" className={s.menuItem} onClick={() => onOpenAside('security')}>
                    <i className="bi bi-shield-check" /> Security
                  </button>
                  <button type="button" className={s.menuItem} onClick={() => onOpenAside('developers')}>
                    <i className="bi bi-code-slash" /> Developers
                  </button>
                  <Link to="/app/$section" params={{ section: 'support' }} className={s.menuItem} onClick={() => onToggleDropdown('user')}>
                    <i className="bi bi-question-circle" /> Help Center
                  </Link>
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
