/* ============================================================================
 * RightAside.tsx — slide-in context panel (Security Center + Developer Tools).
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html -> the <aside class="right-aside"> block
 *   with the two aside-panel-content sections + openAside()/closeAside().
 * LEGACY BRIDGE: panel visibility is now derived from `activePanel` props
 *   (instead of toggling .active on DOM nodes). The 2FA and sandbox toggles
 *   are controlled inputs that fire toasts via the onChange handlers passed in.
 * ========================================================================== */
import type { ShellContent, AsideKind } from '../data/shellData';
import { cx } from '../data/shellData';
import styles from '../styles/shell.module.css';

const s = styles as Record<string, string>;

interface RightAsideProps {
  content: ShellContent;
  activePanel: AsideKind | null;
  twoFactorOn: boolean;
  sandboxOn: boolean;
  onClose: () => void;
  onToggleTwoFactor: (next: boolean) => void;
  onToggleSandbox: (next: boolean) => void;
}

export default function RightAside({
  content,
  activePanel,
  twoFactorOn,
  sandboxOn,
  onClose,
  onToggleTwoFactor,
  onToggleSandbox,
}: RightAsideProps) {
  return (
    <aside
      className={cx(s.rightAside, activePanel && s.open)}
      aria-label="Context panel"
      aria-hidden={!activePanel}
    >
      {/* ============ SECURITY ============ */}
      <div className={cx(s.asidePanel, activePanel === 'security' && s.active)}>
        <div className={s.asideHeader}>
          <span className={s.asideTitle}>
            <i className={cx('bi bi-shield-check', 'me-1')} style={{ color: 'var(--sh-accent-2)' }} /> Security Center
          </span>
          <button type="button" className={s.asideClose} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={s.asideBody}>
          <div className={s.asideCard}>
            <h6>Account protection</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sh-ink-1)' }}>
                Two-factor authentication
              </span>
              <label className={s.switch}>
                <input
                  type="checkbox"
                  checked={twoFactorOn}
                  onChange={(e) => onToggleTwoFactor(e.target.checked)}
                  aria-label="Toggle two-factor authentication"
                />
                <span className={s.slider} />
              </label>
            </div>
            <p className="mb-0" style={{ fontSize: '0.75rem', color: 'var(--sh-ink-3)' }}>
              TOTP via authenticator app is currently {twoFactorOn ? 'active' : 'disabled'}.
            </p>
          </div>

          <div className={s.asideCard}>
            <h6>Active sessions</h6>
            {content.security.sessions.map((sess) => (
              <div className={s.statusRow} key={sess.device}>
                <div>
                  <div className={s.statusDevice}>{sess.device}</div>
                  <div className={s.statusMeta}>{sess.meta}</div>
                </div>
                <span className={s.statusPill}>
                  <span className={cx(s.statusDot, s[sess.status])} /> {sess.statusText}
                </span>
              </div>
            ))}
            <button type="button" className={cx(s.btnDanger, 'btn-sm w-100 mt-2')} onClick={onClose}>
              <i className="bi bi-box-arrow-right" /> Revoke all other sessions
            </button>
          </div>

          <div className={s.asideCard}>
            <h6>Quick actions</h6>
            <div className="d-grid gap-2">
              <button type="button" className={s.btnGhost} onClick={onClose}>
                <i className="bi bi-lock" /> Change password
              </button>
              <LinkToSettings label="Security settings" afterClose={onClose} />
              <LinkToSettings icon="bi-box-arrow-up-right" label="View security logs" afterClose={onClose} />
            </div>
          </div>
        </div>
      </div>

      {/* ============ DEVELOPERS ============ */}
      <div className={cx(s.asidePanel, activePanel === 'developers' && s.active)}>
        <div className={s.asideHeader}>
          <span className={s.asideTitle}>
            <i className={cx('bi bi-code-slash', 'me-1')} style={{ color: 'var(--sh-accent-2)' }} /> Developer Tools
          </span>
          <button type="button" className={s.asideClose} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={s.asideBody}>
          <div className={s.asideCard}>
            <h6>Environment</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sh-ink-1)' }}>Sandbox mode</span>
              <label className={s.switch}>
                <input
                  type="checkbox"
                  checked={sandboxOn}
                  onChange={(e) => onToggleSandbox(e.target.checked)}
                  aria-label="Toggle sandbox mode"
                />
                <span className={s.slider} />
              </label>
            </div>
            <p className="mb-0" style={{ fontSize: '0.75rem', color: 'var(--sh-ink-3)' }}>
              Sandbox responses are mocked and do not move real money.
            </p>
          </div>

          <div className={s.asideCard}>
            <h6>API health</h6>
            {content.developers.health.map((row) => (
              <div className={s.statusRow} key={row.service}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sh-ink-1)' }}>{row.service}</span>
                <span className={s.statusPill}>
                  <span className={cx(s.statusDot, s[row.status])} /> {row.statusText}
                </span>
              </div>
            ))}
          </div>

          <div className={s.asideCard}>
            <h6>Resources</h6>
            <div className="d-grid gap-2">
              <LinkToSettings icon="bi-rocket-takeoff" label="API documentation" afterClose={onClose} />
              <LinkToSettings icon="bi-broadcast" label="Webhook settings" afterClose={onClose} />
              <LinkToSettings icon="bi-box-arrow-up-right" label="Postman collection" afterClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Small helper: a styled internal link that closes the aside on click. */
function LinkToSettings({
  icon = 'bi-key',
  label,
  afterClose,
}: {
  icon?: string;
  label: string;
  afterClose: () => void;
}) {
  return (
    <a
      href="/transaction_dashboard/app/apikeys"
      className={s.btnGhost}
      style={{ textDecoration: 'none' }}
      onClick={(e) => {
        e.preventDefault();
        afterClose();
        window.location.assign('/app/apikeys');
      }}
    >
      <i className={`bi ${icon}`} /> {label}
    </a>
  );
}
