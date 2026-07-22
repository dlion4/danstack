/* ============================================================================
 * CardsAside.tsx — slide-in context panel for the Paymo BAAS Cards Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-aside.*
 * LEGACY BRIDGE: panel visibility is now derived from `activePanel` props
 *   (instead of toggling .active on DOM nodes). The cards-specific panels
 *   (security controls, daily limits, card program) are wired to real behavior.
 * ========================================================================== */
import type { CardsLayoutContent, AsideKind } from '../data/cardsLayoutData';
import { cx } from '../data/cardsLayoutData';
import styles from '../styles/cardsLayout.module.css';

const s = styles as Record<string, string>;

interface CardsAsideProps {
  content: CardsLayoutContent;
  activePanel: AsideKind | null;
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function CardsAside({
  content,
  activePanel,
  onClose,
  onToast,
}: CardsAsideProps) {
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
            <i className={cx('bi bi-shield-shaded', 'me-1')} style={{ color: 'var(--cl-primary)' }} /> Security Controls
          </span>
          <button type="button" className={s.asideClose} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={s.asideBody}>
          <div className={s.asideCard}>
            <h6>Transaction Alerts</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cl-text)' }}>
                All Transactions
              </span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle all transactions alerts" />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cl-text)' }}>
                International Usage
              </span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle international usage alerts" />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cl-text)' }}>
                Large Threshold (&gt;KES 100K)
              </span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" aria-label="Toggle large threshold alerts" />
              </div>
            </div>
          </div>

          <div className={s.asideCard}>
            <h6>Usage Controls</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cl-text)' }}>
                Online Payments (CNP)
              </span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle online payments" />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cl-text)' }}>
                Contactless / NFC
              </span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle contactless payments" />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cl-text)' }}>
                ATM Withdrawals
              </span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" aria-label="Toggle ATM withdrawals" />
              </div>
            </div>
          </div>

          <button
            type="button"
            className={cx(s.btnPrimary, 'w-100')}
            onClick={() => onToast('Security settings saved', 'success')}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* ============ LIMITS ============ */}
      <div className={cx(s.asidePanel, activePanel === 'limits' && s.active)}>
        <div className={s.asideHeader}>
          <span className={s.asideTitle}>
            <i className={cx('bi bi-sliders', 'me-1')} style={{ color: 'var(--cl-primary)' }} /> Daily Limits
          </span>
          <button type="button" className={s.asideClose} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={s.asideBody}>
          <div className={s.asideCard}>
            <h6>Daily Limits</h6>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Per Transaction</label>
              <input type="text" className="form-control" defaultValue="$5,000" aria-label="Per transaction limit" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Daily Total</label>
              <input type="text" className="form-control" defaultValue="$25,000" aria-label="Daily total limit" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Monthly Total</label>
              <input type="text" className="form-control" defaultValue="$100,000" aria-label="Monthly total limit" />
            </div>
            <button
              type="button"
              className={cx(s.btnPrimary, 'w-100')}
              onClick={() => onToast('Limits updated', 'success')}
            >
              Update Limits
            </button>
          </div>
        </div>
      </div>

      {/* ============ CARD PROGRAM ============ */}
      <div className={cx(s.asidePanel, activePanel === 'cardProgram' && s.active)}>
        <div className={s.asideHeader}>
          <span className={s.asideTitle}>
            <i className={cx('bi bi-gear', 'me-1')} style={{ color: 'var(--cl-primary)' }} /> Card Program
          </span>
          <button type="button" className={s.asideClose} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={s.asideBody}>
          <div className={s.asideCard}>
            <h6>Program Info</h6>
            <div className={s.statusRow}>
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>Program</span>
              <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>Paymo Platinum</span>
            </div>
            <div className={s.statusRow}>
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>Issuer</span>
              <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>Visa</span>
            </div>
            <div className={s.statusRow}>
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>Cards Issued</span>
              <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>1,240</span>
            </div>
            <div className={s.statusRow}>
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>Status</span>
              <span className="d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                <span className={cx(s.statusDot, s.active)} /> Active
              </span>
            </div>
          </div>

          <div className={s.asideCard}>
            <h6>Branding</h6>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Card Label</label>
              <input type="text" className="form-control" defaultValue="Paymo Platinum" aria-label="Card label" />
            </div>
            <div>
              <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Card Color</label>
              <div className="d-flex gap-2">
                <div
                  className="rounded-circle"
                  style={{ width: 32, height: 32, background: '#1e293b', cursor: 'pointer', border: '2px solid var(--cl-primary)' }}
                  role="button"
                  aria-label="Slate color"
                />
                <div
                  className="rounded-circle"
                  style={{ width: 32, height: 32, background: '#5b4ddb', cursor: 'pointer' }}
                  role="button"
                  aria-label="Purple color"
                />
                <div
                  className="rounded-circle"
                  style={{ width: 32, height: 32, background: '#10b981', cursor: 'pointer' }}
                  role="button"
                  aria-label="Emerald color"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
