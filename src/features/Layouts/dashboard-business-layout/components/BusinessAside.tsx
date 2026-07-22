/* ============================================================================
 * BusinessAside.tsx — slide-in context panel for the Business Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-business-aside.*
 * LEGACY BRIDGE: panel visibility is derived from `activePanel`. The three
 *   business panels (compliance, entity, payroll) fire toasts on actions.
 * ========================================================================== */
import type { AsideKind } from '../data/businessLayoutData';
import { cx } from '../data/businessLayoutData';
import styles from '../styles/businessLayout.module.css';

const s = styles as Record<string, string>;

interface BusinessAsideProps {
  activePanel: AsideKind | null;
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function BusinessAside({ activePanel, onClose, onToast }: BusinessAsideProps) {
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
        {/* ============ COMPLIANCE ============ */}
        <div className={cx(s['aside-panel-content'], activePanel === 'compliance' && s.active)}>
          <div className={s['aside-header']}>
            <span className={s['aside-title']}>
              <i className="bi bi-shield-check text-primary" /> Compliance Center
            </span>
            <button type="button" className={s['aside-close']} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s['aside-body']}>
            <div className={s['aside-card']}>
              <h6>KYB Status</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Business Registration</span>
                <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--paymo-accent)' }}>Verified</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Tax Compliance</span>
                <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--paymo-accent)' }}>Verified</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Operating Permit</span>
                <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--paymo-warning)' }}>Expiring</span>
              </div>
            </div>
            <div className={s['aside-card']}>
              <h6>Audit Trail</h6>
              <div className={s['status-row']}>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>Payroll executed</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Martha K. · 09:00 today</div>
                </div>
              </div>
              <div className={s['status-row']}>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>Vendor approved</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>James N. · Yesterday</div>
                </div>
              </div>
              <div className={s['status-row']}>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>Limits updated</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>System · 2 days ago</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm w-100"
              onClick={() => onToast('Opening full audit log', 'info')}
            >
              View Full Audit Log
            </button>
          </div>
        </div>

        {/* ============ ENTITY ============ */}
        <div className={cx(s['aside-panel-content'], activePanel === 'entity' && s.active)}>
          <div className={s['aside-header']}>
            <span className={s['aside-title']}>
              <i className="bi bi-building text-primary" /> Entity Details
            </span>
            <button type="button" className={s['aside-close']} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s['aside-body']}>
            <div className={s['aside-card']}>
              <h6>Business Information</h6>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Entity Name</span>
                <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>Modern Retail Ltd</span>
              </div>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Registration</span>
                <span className="fw-semibold" style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>PVT-2019-04821</span>
              </div>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>KRA PIN</span>
                <span className="fw-semibold" style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>A002849102X</span>
              </div>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Industry</span>
                <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>Retail &amp; E-Commerce</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ PAYROLL ============ */}
        <div className={cx(s['aside-panel-content'], activePanel === 'payroll' && s.active)}>
          <div className={s['aside-header']}>
            <span className={s['aside-title']}>
              <i className="bi bi-people text-primary" /> Payroll Manager
            </span>
            <button type="button" className={s['aside-close']} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s['aside-body']}>
            <div className={s['aside-card']}>
              <h6>Current Batch</h6>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Employees</span>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>42</span>
              </div>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Total Amount</span>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>KES 3,200,000</span>
              </div>
              <div className={s['status-row']}>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Next Run</span>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>25 Jul 2026</span>
              </div>
            </div>
            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={() => onToast('Payroll execution started', 'success')}
              >
                <i className="bi bi-play me-2" /> Run Payroll Now
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => onToast('Payslips downloaded', 'success')}
              >
                <i className="bi bi-file-earmark-spreadsheet me-2" /> Download Payslips
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
