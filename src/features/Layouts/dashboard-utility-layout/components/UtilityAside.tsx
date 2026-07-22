/* ============================================================================
 * UtilityAside.tsx — slide-in context panel for the Utility Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-utility-aside.*
 * LEGACY BRIDGE: panel visibility is derived from `activePanel`. The three
 *   utility panels (autoPay, payBill, savedAccounts) fire toasts on actions.
 * ========================================================================== */
import type { AsideKind, SavedAccount } from '../data/utilityLayoutData';
import { cx } from '../data/utilityLayoutData';
import styles from '../styles/utilityLayout.module.css';

const s = styles as Record<string, string>;

interface UtilityAsideProps {
  activePanel: AsideKind | null;
  savedAccounts: SavedAccount[];
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function UtilityAside({ activePanel, savedAccounts, onClose, onToast }: UtilityAsideProps) {
  return (
    <>
      <div
        className={cx(s['aside-backdrop'], activePanel && s.show)}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        className={cx(s['right-aside'], activePanel && s.open)}
        aria-label="Context panel"
        aria-hidden={!activePanel}
      >
        {/* ============ AUTO-PAY ============ */}
        <div className={cx(s['aside-panel-content'], activePanel === 'autoPay' && s.active)}>
          <div className={s['aside-header']}>
            <span className={s['aside-title']}>
              <i className="bi bi-calendar-check text-primary" /> Auto-Pay Manager
            </span>
            <button type="button" className={s['aside-close']} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s['aside-body']}>
            <div className={s['aside-card']}>
              <h6>Active Auto-Pay</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>KPLC Prepaid</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>KES 3,000 · Monthly</div>
                </div>
                <div className="form-check form-switch m-0">
                  <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle KPLC auto-pay" />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>Safaricom Fiber</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>KES 5,999 · Monthly</div>
                </div>
                <div className="form-check form-switch m-0">
                  <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle Safaricom auto-pay" />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>DSTV Premium</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>KES 9,500 · Monthly</div>
                </div>
                <div className="form-check form-switch m-0">
                  <input className="form-check-input" type="checkbox" defaultChecked aria-label="Toggle DSTV auto-pay" />
                </div>
              </div>
            </div>
            <div className={s['aside-card']}>
              <h6>Upcoming Payments</h6>
              <div className={s['status-row']}>
                <span style={{ fontSize: '0.82rem' }}>KPLC Prepaid</span>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>15 Jul 2026</span>
              </div>
              <div className={s['status-row']}>
                <span style={{ fontSize: '0.82rem' }}>Safaricom Fiber</span>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>20 Jul 2026</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => onToast('Auto-pay settings saved', 'success')}
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* ============ PAY BILL ============ */}
        <div className={cx(s['aside-panel-content'], activePanel === 'payBill' && s.active)}>
          <div className={s['aside-header']}>
            <span className={s['aside-title']}>
              <i className="bi bi-lightning text-primary" /> Pay Utility Bill
            </span>
            <button type="button" className={s['aside-close']} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s['aside-body']}>
            <div className={s['aside-card']}>
              <h6>Payment Details</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Provider</label>
                <select className="form-select form-select-sm" defaultValue="KPLC — Electricity">
                  <option>KPLC — Electricity</option>
                  <option>NCWSC — Water</option>
                  <option>Safaricom — Fiber</option>
                  <option>DSTV — Cable TV</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Account / Meter Number</label>
                <input type="text" className="form-control form-control-sm" placeholder="Enter account number" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Amount (KES)</label>
                <input type="text" className="form-control form-control-sm" placeholder="0.00" />
              </div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="utility-enable-autopay" />
                <label className="form-check-label" style={{ fontSize: '0.82rem' }} htmlFor="utility-enable-autopay">
                  Enable auto-pay for this bill
                </label>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => onToast('Payment processing…', 'success')}
            >
              <i className="bi bi-lightning me-2" /> Pay Now
            </button>
          </div>
        </div>

        {/* ============ SAVED ACCOUNTS ============ */}
        <div className={cx(s['aside-panel-content'], activePanel === 'savedAccounts' && s.active)}>
          <div className={s['aside-header']}>
            <span className={s['aside-title']}>
              <i className="bi bi-bookmark text-primary" /> Saved Accounts
            </span>
            <button type="button" className={s['aside-close']} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s['aside-body']}>
            {savedAccounts.map((acc) => (
              <div className={s['aside-card']} key={`${acc.provider}-${acc.number}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{acc.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{acc.provider}: {acc.number}</div>
                  </div>
                  <i className="bi bi-chevron-right text-muted" />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-primary w-100 mt-2"
              onClick={() => onToast('Add account opened', 'info')}
            >
              <i className="bi bi-plus me-2" /> Add New Account
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
