/* ============================================================================
 * TransferModals.tsx — all modals for the Transfer Overview page.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy 1.1.html — the 23 modals at the bottom of the file.
 * Every modal is state-driven (no global openM()/closeM()/innerHTML).
 *
 * Multi-step flows (init / bulk / sched / intl) replace:
 *   - flows{} + renderStepper() + showFlowStep() + nextFlow()
 *   - cacheAndReset() (body/footer innerHTML restore) — replaced by React state
 *   - doAction()'s loading + success innerHTML — replaced by per-modal phase
 *
 * Tabbed modals (Manage Beneficiaries, Transfer Analytics) replace sw().
 * Bootstrap's Modal JS is driven via data-bs-* attributes + data-bs-dismiss,
 * bridged safely through React refs + useEffect (see useBootstrapModal).
 * ========================================================================== */
'use client';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../shell/data/shellData';
import type { ShellContent } from '../../shell/data/shellData';
import styles from '../styles/transferOverview.module.css';

const s = styles as Record<string, string>;

/* --------------------------------------------------------------------------
 * types
 * ------------------------------------------------------------------------ */
type ModalId =
  | 'initiate' | 'bulk' | 'schedule' | 'manageBeneficiaries' | 'addBeneficiary'
  | 'transferDetail' | 'editSchedule' | 'international' | 'qrPay' | 'transferLimits'
  | 'retry' | 'analytics' | 'security' | 'notifications' | 'profile' | 'attention'
  | 'dispute' | 'editBeneficiary' | 'history' | 'favoritesQuick' | 'addToFavorites'
  | 'feeCalc';

type Phase = 'form' | 'loading' | 'success';
type FlowKey = 'init' | 'bulk' | 'sched' | 'intl';

interface FlowDef { total: number; labels: string[] }
const FLOWS: Record<FlowKey, FlowDef> = {
  init: { total: 4, labels: ['Beneficiary', 'Amount', 'Confirm', 'Done'] },
  bulk: { total: 4, labels: ['Upload', 'Review', 'Pay', 'Done'] },
  sched: { total: 3, labels: ['Details', 'Schedule', 'Confirm'] },
  intl: { total: 4, labels: ['Recipient', 'Amount', 'Compliance', 'Done'] },
};

/* --------------------------------------------------------------------------
 * Pure CSS/React Modal - no Bootstrap JS dependency
 *   - shows/hides based on `show` prop with CSS transitions
 *   - backdrop click closes modal
 *   - ESC key closes modal
 * ------------------------------------------------------------------------ */
function useReactModal(show: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [show, onClose]);

  return mounted;
}

/* ==========================================================================
 * Multi-step flow modal (init / bulk / sched / intl)
 * ======================================================================= */
function FlowModal({
  id, show, onClose, flowKey, iconCls, title, children,
}: {
  id: ModalId;
  show: boolean;
  onClose: () => void;
  flowKey: FlowKey;
  iconCls: string;
  title: string;
  children: (step: number) => ReactNode;
}) {
  const mounted = useReactModal(show, onClose);
  const def = FLOWS[flowKey];
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);

  // reset whenever the modal is (re)opened
  useEffect(() => {
    if (show) { setStep(1); setPhase('form'); setLoading(false); }
  }, [show]);

  const isLastStep = step === def.total;

  const next = () => {
    // second-to-last step -> simulate processing -> jump to success step
    if (step === def.total - 1) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setPhase('success'); setStep(def.total); }, 1500);
      return;
    }
    if (isLastStep) { onClose(); return; }
    setStep((p) => Math.min(def.total, p + 1));
  };

  const nextLabel = (() => {
    if (isLastStep) return 'Done';
    if (step === def.total - 1) {
      if (flowKey === 'init') return 'Send Money';
      if (flowKey === 'intl') return 'Confirm Transfer';
      return 'Confirm';
    }
    return 'Continue';
  })();

  if (!mounted) return null;
  if (!show) return null;

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={cx(s.modalWrapper, 'modal-lg')} onClick={(e) => e.stopPropagation()}>
        <div className={cx(s.modalContent, s.modalAnimated)}>
          <div className={s.modalHeader}>
            <h5 className={s.modalTitle}>
              <i className={cx(iconCls)} /> {title}
            </h5>
            <button type="button" className={s.modalClose} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s.modalBody} style={{ position: 'relative', minHeight: 200 }}>
            {phase === 'form' && (
              <>
                <div className={s.stepper}>
                  {def.labels.map((label, i) => {
                    const n = i + 1;
                    const state = n < step ? 'stepDone' : n === step ? 'stepActive' : '';
                    return (
                      <div className={cx(s.step, s[state])} key={label}>
                        <div className={s.stepNum}>
                          {n < step ? <i className="bi bi-check" /> : n}
                        </div>
                        <div className={s.stepLabel}>{label}</div>
                        {i < def.labels.length - 1 && <div className={s.stepLine} />}
                      </div>
                    );
                  })}
                </div>
                {children(step)}
              </>
            )}
            {phase === 'success' && (
              <div className={s.receipt}>
                <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
                <h5 className={s.receiptTitle}>{title} Successful</h5>
                <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 8 }}>
                  Your request has been processed.
                </p>
              </div>
            )}
            {loading && (
              <div className={s.loadingOverlay}>
                <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }} />
                <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: 'var(--pri)' }}>Processing…</p>
              </div>
            )}
          </div>
          <div className={s.modalFooter}>
            <button type="button" className={cx(s.btn, s.btnSecondary)} onClick={onClose}>Cancel</button>
            <button type="button" className={cx(s.btn, s.btnPrimary)} onClick={next}>
              {nextLabel} {!isLastStep && <i className="bi bi-arrow-right" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Generic simple modal (form -> loading -> success, or static)
 * ======================================================================= */
function SimpleModal({
  id, show, onClose, iconCls, title, size = 'md', successMsg, onSubmit, children, submitLabel, submitPrimary = true,
}: {
  id: ModalId;
  show: boolean;
  onClose: () => void;
  iconCls: string;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  successMsg?: string;
  onSubmit?: () => void;
  children?: ReactNode;
  submitLabel?: string;
  submitPrimary?: boolean;
}) {
  const mounted = useReactModal(show, onClose);
  const [phase, setPhase] = useState<Phase>('form');
  useEffect(() => { if (show) setPhase('form'); }, [show]);

  const sizeCls = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : size === 'sm' ? 'modal-sm' : '';

  const handleSubmit = () => {
    if (!onSubmit || !successMsg) { onClose(); return; }
    setPhase('loading');
    setTimeout(() => { setPhase('success'); }, 1500);
  };

  if (!mounted) return null;
  if (!show) return null;

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={cx(s.modalWrapper, sizeCls)} onClick={(e) => e.stopPropagation()}>
        <div className={cx(s.modalContent, s.modalAnimated)}>
          <div className={s.modalHeader}>
            <h5 className={s.modalTitle}><i className={cx(iconCls)} /> {title}</h5>
            <button type="button" className={s.modalClose} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s.modalBody} style={{ position: 'relative', minHeight: 120 }}>
            {phase === 'form' && children}
            {phase === 'loading' && (
              <div className={s.loadingOverlay}>
                <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }} />
                <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: 'var(--pri)' }}>Processing…</p>
              </div>
            )}
            {phase === 'success' && (
              <div className={s.receipt}>
                <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
                <h5 className={s.receiptTitle}>{successMsg}</h5>
              </div>
            )}
          </div>
          <div className={s.modalFooter}>
            {phase === 'success' ? (
              <button type="button" className={cx(s.btn, s.btnPrimary)} onClick={onClose}>Done</button>
            ) : (
              <>
                <button type="button" className={cx(s.btn, s.btnSecondary)} onClick={onClose}>Cancel</button>
                {submitLabel && (
                  <button type="button" className={cx(s.btn, submitPrimary ? s.btnPrimary : s.btnSecondary)} onClick={handleSubmit}>
                    {submitLabel}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Tabbed modal (Beneficiaries list/favorites/recent, Analytics volume/etc)
 * ======================================================================= */
function TabbedModal({
  id, show, onClose, iconCls, title, tabs, size = 'lg', footer,
}: {
  id: ModalId;
  show: boolean;
  onClose: () => void;
  iconCls: string;
  title: string;
  tabs: { key: string; label: string; render: () => ReactNode }[];
  size?: 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}) {
  const mounted = useReactModal(show, onClose);
  const [active, setActive] = useState(tabs[0]?.key);
  useEffect(() => { if (show) setActive(tabs[0]?.key); }, [show]);
  const sizeCls = size === 'xl' ? 'modal-xl' : size === 'md' ? '' : 'modal-lg';
  if (!mounted) return null;
  if (!show) return null;

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={cx(s.modalWrapper, sizeCls)} onClick={(e) => e.stopPropagation()}>
        <div className={cx(s.modalContent, s.modalAnimated)}>
          <div className={s.modalHeader}>
            <h5 className={s.modalTitle}><i className={cx(iconCls)} /> {title}</h5>
            <button type="button" className={s.modalClose} onClick={onClose} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={s.modalBody}>
            <div className={s.pills} style={{ marginBottom: 16 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={cx(s.pill, active === tab.key && s.pillActive)}
                  onClick={() => setActive(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {tabs.find((t) => t.key === active)?.render()}
          </div>
          {footer && <div className={s.modalFooter}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Public component — renders ALL modals based on the `active` prop.
 * Only the active modal mounts (its bootstrap instance is created on demand).
 * ======================================================================= */
export interface TransferModalsProps {
  content: ShellContent;
  active: ModalId | null;
  onClose: () => void;
  onOpenModal: (id: ModalId) => void;
}

export default function TransferModals({ content, active, onClose, onOpenModal }: TransferModalsProps) {
  const isOpen = (id: ModalId) => active === id;
  const close = onClose;
  const openModal = onOpenModal;

  return (
    <>
      {/* M1: Initiate Transfer (multi-step) */}
      <FlowModal id="initiate" show={isOpen('initiate')} onClose={close} flowKey="init" iconCls="bi bi-send" title="Initiate Transfer">
        {(step) => (
          <>
            {step === 1 && (
              <>
                <div className="mb-3">
                  <label className={s.fieldLabel}>Search or Select</label>
                  <select className={s.field} defaultValue="Grace Kamau">
                    <option>Grace Kamau — 0712 345 890</option>
                    <option>Landlord Properties — Bank 0012345678</option>
                    <option>James Ochieng — 0722 111 222</option>
                    <option>Equity Bank — 0012345678</option>
                    <option>New Beneficiary</option>
                  </select>
                </div>
                <div>
                  <label className={s.fieldLabel}>Transfer Type</label>
                  <SegmentedTabs options={['M-Pesa', 'Bank', 'Internal', 'International']} defaultActive="M-Pesa" />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="row g-3">
                  <div className="col-md-6"><label className={s.fieldLabel}>Amount (KES)</label><input className={s.field} defaultValue="12500" /></div>
                  <div className="col-md-6"><label className={s.fieldLabel}>Reference / Note</label><input className={s.field} defaultValue="Rent June 2025" /></div>
                </div>
                <div className="mt-3">
                  <label className={s.fieldLabel}>Funding Source</label>
                  <select className={s.field}>
                    <option>PayMo Wallet (KES 24,500)</option>
                    <option>M-Pesa (0712***890)</option>
                    <option>Equity Bank ****4521</option>
                  </select>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <ReviewRow label="To" value="Grace Kamau" />
                <ReviewRow label="Amount" value="KES 12,500" />
                <ReviewRow label="Fee" value="KES 0" />
                <ReviewRow label="Total" value="KES 12,500" highlight />
                <label className={cx(s.fieldLabel, 'mt-3 d-block')}>Enter PIN</label>
                <div className={s.pinRow}>
                  {[0, 1, 2, 3].map((i) => <input key={i} type="password" maxLength={1} className={s.pinInput} />)}
                </div>
              </>
            )}
            {step === 4 && (
              <div className={s.receipt}>
                <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
                <h5 className={s.receiptTitle}>Transfer Successful!</h5>
                <p style={{ fontSize: 14, color: 'var(--ink-500)' }}>KES 12,500 sent to Grace Kamau via M-Pesa.</p>
                <div style={{ background: 'var(--ink-100)', padding: 16, borderRadius: 12, fontSize: 13, marginTop: 16, textAlign: 'left' }}>
                  <ReviewRow label="Reference" value="TRF-448291" />
                  <ReviewRow label="Transaction ID" value="MPESA-9K2M4P" />
                  <ReviewRow label="Time" value="27 Jun 2025, 14:32" />
                </div>
              </div>
            )}
          </>
        )}
      </FlowModal>

      {/* M2: Bulk Transfer (multi-step) */}
      <FlowModal id="bulk" show={isOpen('bulk')} onClose={close} flowKey="bulk" iconCls="bi bi-collection" title="Bulk Transfer">
        {(step) => (
          <>
            {step === 1 && (
              <>
                <div className="mb-3"><label className={s.fieldLabel}>Upload CSV</label><input type="file" className={s.field} /></div>
                <div className={cx(s.hintBox, 'mt-2')}><i className="bi bi-info-circle me-1" /> CSV format: Name, Phone/Bank, Amount, Reference</div>
              </>
            )}
            {step === 2 && (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Name</th><th>Account</th><th>Amount</th></tr></thead>
                  <tbody>
                    <tr><td>Grace Kamau</td><td>0712 345 890</td><td>KES 12,500</td></tr>
                    <tr><td>John Otieno</td><td>0722 111 222</td><td>KES 8,000</td></tr>
                    <tr><td>Landlord Ltd</td><td>Bank 0012345678</td><td>KES 45,000</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {step === 3 && (
              <>
                <ReviewRow label="Total Beneficiaries" value="3" />
                <ReviewRow label="Total Amount" value="KES 65,500" />
                <ReviewRow label="Total Fee" value="KES 0" />
              </>
            )}
            {step === 4 && (
              <div className={s.receipt}>
                <div className={s.receiptIcon}><i className="bi bi-check-all" /></div>
                <h5 className={s.receiptTitle}>Bulk Transfer Complete</h5>
                <p style={{ fontSize: 14, color: 'var(--ink-500)' }}>3 transfers processed successfully.</p>
              </div>
            )}
          </>
        )}
      </FlowModal>

      {/* M3: Schedule Transfer (multi-step) */}
      <FlowModal id="schedule" show={isOpen('schedule')} onClose={close} flowKey="sched" iconCls="bi bi-calendar-event" title="Schedule Transfer">
        {(step) => (
          <>
            {step === 1 && (
              <>
                <div className="mb-3">
                  <label className={s.fieldLabel}>Beneficiary</label>
                  <select className={s.field}><option>Grace Kamau</option><option>Landlord Properties</option></select>
                </div>
                <div className="row g-3">
                  <div className="col-md-6"><label className={s.fieldLabel}>Amount</label><input className={s.field} defaultValue="45000" /></div>
                  <div className="col-md-6">
                    <label className={s.fieldLabel}>Frequency</label>
                    <select className={s.field}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option><option>One-time</option></select>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="row g-3">
                  <div className="col-md-6"><label className={s.fieldLabel}>Start Date</label><input type="date" className={s.field} defaultValue="2025-07-01" /></div>
                  <div className="col-md-6"><label className={s.fieldLabel}>End Date (optional)</label><input type="date" className={s.field} /></div>
                </div>
                <div className="mt-3">
                  <label className={s.fieldLabel}>Funding Source</label>
                  <select className={s.field}><option>PayMo Wallet</option><option>M-Pesa</option><option>Bank</option></select>
                </div>
              </>
            )}
            {step === 3 && (
              <div className={s.receipt}>
                <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
                <h5 className={s.receiptTitle}>Schedule Created</h5>
                <p style={{ fontSize: 14, color: 'var(--ink-500)' }}>Your recurring transfer has been scheduled successfully.</p>
              </div>
            )}
          </>
        )}
      </FlowModal>

      {/* M4: Manage Beneficiaries (tabbed) */}
      <TabbedModal
        id="manageBeneficiaries"
        show={isOpen('manageBeneficiaries')}
        onClose={close}
        iconCls="bi bi-person-plus"
        title="Manage Beneficiaries"
        footer={
          <>
            <button type="button" className={cx(s.btn, s.btnSecondary)} data-bs-dismiss="modal">Close</button>
          </>
        }
        tabs={[
          {
            key: 'list', label: 'All', render: () => (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Name</th><th>Account</th><th>Type</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr><td>Grace Kamau</td><td>0712 345 890</td><td>M-Pesa</td><td><span className={cx(s.badge, s.badgeInfo)}>2 actions</span></td></tr>
                    <tr><td>Landlord Properties</td><td>Bank 0012345678</td><td>Bank</td><td><span className={cx(s.badge, s.badgeInfo)}>2 actions</span></td></tr>
                  </tbody>
                </table>
              </div>
            ),
          },
          {
            key: 'favorites', label: 'Favorites', render: () => (
              <>
                <div className={s.rowItem}><div><strong>Grace Kamau</strong></div><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('editBeneficiary')}>Remove from Favorites</button></div>
                <div className={s.rowItem}><div><strong>Landlord Properties</strong></div><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('editBeneficiary')}>Remove from Favorites</button></div>
              </>
            ),
          },
          {
            key: 'recent', label: 'Recent', render: () => (
              <div className={s.rowItem}><div><strong>James Ochieng</strong></div><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('addToFavorites')}>Add to Favorites</button></div>
            ),
          },
        ]}
      />

      {/* M5: Add Beneficiary */}
      <SimpleModal
        id="addBeneficiary" show={isOpen('addBeneficiary')} onClose={close}
        iconCls="bi bi-person-plus" title="Add Beneficiary"
        submitLabel="Add Beneficiary" successMsg="Beneficiary added successfully!"
      >
        <div className="mb-3"><label className={s.fieldLabel}>Name</label><input className={s.field} defaultValue="Mary Wanjiku" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Phone / Account</label><input className={s.field} defaultValue="0733 222 111" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Type</label><select className={s.field}><option>M-Pesa</option><option>Bank Account</option><option>PayMo Wallet</option><option>International</option></select></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked id="addFav" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="addFav">Add to Favorites</label></div>
      </SimpleModal>

      {/* M6: Transfer Detail */}
      <SimpleModal id="transferDetail" show={isOpen('transferDetail')} onClose={close} iconCls="bi bi-file-earmark-text" title="Transfer Details">
        <div style={{ background: 'var(--ink-100)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <ReviewRow label="Reference" value="TRF-448291" />
          <ReviewRow label="Amount" value="KES 12,500" />
          <ReviewRow label="To" value="Grace Kamau" />
          <ReviewRow label="Method" value="M-Pesa" />
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Status</span><span className={cx(s.badge, s.badgeSuccess)}>Success</span></div>
          <ReviewRow label="Date" value="27 Jun 2025, 14:32" />
        </div>
        <div className="d-flex justify-content-center" style={{ gap: 8 }}>
          <button className={cx(s.btn, s.btnSm)}><i className="bi bi-download" /> Receipt</button>
          <button className={cx(s.btn, s.btnSm)}><i className="bi bi-share" /> Share</button>
        </div>
      </SimpleModal>

      {/* M7: Edit Schedule */}
      <SimpleModal id="editSchedule" show={isOpen('editSchedule')} onClose={close} iconCls="bi bi-pencil" title="Edit Schedule" submitLabel="Save Changes" successMsg="Schedule updated successfully!">
        <div className="mb-3"><label className={s.fieldLabel}>Amount</label><input className={s.field} defaultValue="45000" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Frequency</label><select className={s.field}><option>Monthly</option><option>Bi-weekly</option></select></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked id="schedActive" /><label className="form-check-label" htmlFor="schedActive">Active</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="schedNotify" /><label className="form-check-label" htmlFor="schedNotify">Notify before execution</label></div>
      </SimpleModal>

      {/* M8: International Transfer (multi-step) */}
      <FlowModal id="international" show={isOpen('international')} onClose={close} flowKey="intl" iconCls="bi bi-globe" title="International Transfer">
        {(step) => (
          <>
            {step === 1 && (
              <>
                <div className="mb-3"><label className={s.fieldLabel}>Country</label><select className={s.field}><option>United Kingdom</option><option>United States</option><option>Germany</option></select></div>
                <div className="mb-3"><label className={s.fieldLabel}>Recipient Name</label><input className={s.field} defaultValue="John Smith" /></div>
                <div className="mb-3"><label className={s.fieldLabel}>Account / IBAN</label><input className={s.field} defaultValue="GB29NWBK60161331926819" /></div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="row g-3">
                  <div className="col-md-6"><label className={s.fieldLabel}>Amount (KES)</label><input className={s.field} defaultValue="150000" /></div>
                  <div className="col-md-6"><label className={s.fieldLabel}>Currency</label><select className={s.field}><option>GBP</option><option>USD</option><option>EUR</option></select></div>
                </div>
                <div className={cx(s.hintBox, s.hintBoxWarn, 'mt-3')}><i className="bi bi-info-circle me-1" /> Estimated fee: KES 2,850 | Exchange rate: 1 KES = 0.0058 GBP</div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="mb-3"><label className={s.fieldLabel}>Purpose of Transfer</label><select className={s.field}><option>Family Support</option><option>Business Payment</option><option>Education</option></select></div>
                <div className="mb-3"><label className={s.fieldLabel}>Source of Funds</label><select className={s.field}><option>Salary</option><option>Savings</option><option>Business Income</option></select></div>
              </>
            )}
            {step === 4 && (
              <div className={s.receipt}>
                <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
                <h5 className={s.receiptTitle}>International Transfer Initiated</h5>
                <p style={{ fontSize: 14, color: 'var(--ink-500)' }}>Your transfer is being processed. Expected delivery: 1-3 business days.</p>
              </div>
            )}
          </>
        )}
      </FlowModal>

      {/* M9: QR Pay */}
      <SimpleModal id="qrPay" show={isOpen('qrPay')} onClose={close} iconCls="bi bi-qr-code" title="QR Pay" submitLabel="Generate QR" successMsg="QR code generated! Recipient can scan to pay.">
        <div className="text-center">
          <div style={{ background: 'var(--ink-100)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ width: 180, height: 180, background: 'linear-gradient(135deg, var(--pri), var(--sec))', margin: '0 auto', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column' }}>
              <i className="bi bi-qr-code" style={{ fontSize: 80 }} />
              <div style={{ marginTop: 8, fontWeight: 700 }}>Scan to Pay</div>
            </div>
          </div>
          <div className="mb-3"><label className={s.fieldLabel}>Amount (KES)</label><input className={s.field} defaultValue="2500" /></div>
          <div className="mb-3"><label className={s.fieldLabel}>Reference</label><input className={s.field} defaultValue="Lunch payment" /></div>
        </div>
      </SimpleModal>

      {/* M10: Transfer Limits */}
      <SimpleModal id="transferLimits" show={isOpen('transferLimits')} onClose={close} iconCls="bi bi-sliders" title="Transfer Limits & Security" submitLabel="Save Limits" successMsg="Transfer limits updated successfully!">
        <div className="mb-3"><label className={s.fieldLabel}>Daily Limit</label><input className={s.field} defaultValue="500000" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Per Transaction Limit</label><input className={s.field} defaultValue="200000" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>International Limit</label><input className={s.field} defaultValue="100000" /></div>
        <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked id="pinReq" /><label className="form-check-label" htmlFor="pinReq">Require PIN for transfers above KES 10,000</label></div>
        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked id="twofaReq" /><label className="form-check-label" htmlFor="twofaReq">Require 2FA for international transfers</label></div>
      </SimpleModal>

      {/* M11: Retry Transfer */}
      <SimpleModal id="retry" show={isOpen('retry')} onClose={close} iconCls="bi bi-arrow-repeat" title="Retry Failed Transfer" submitLabel="Retry Now" successMsg="Transfer retried successfully!">
        <div className={cx(s.hintBox, s.hintBoxWarn, 'mb-3')}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>Failed Transfer Details</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Landlord Properties — KES 35,000</div>
          <div style={{ fontSize: 12, color: 'var(--warning)' }}>Reason: Insufficient funds in M-Pesa</div>
        </div>
        <div className="mb-3"><label className={s.fieldLabel}>New Funding Source</label><select className={s.field}><option>PayMo Wallet (KES 24,500)</option><option>Equity Bank ****4521</option></select></div>
      </SimpleModal>

      {/* M12: Transfer Analytics (tabbed) */}
      <TabbedModal
        id="analytics" show={isOpen('analytics')} onClose={close} size="xl" iconCls="bi bi-bar-chart-line" title="Transfer Analytics"
        tabs={[
          {
            key: 'volume', label: 'Volume', render: () => (
              <div className={s.chartBars} style={{ height: 120 }}>
                {[60, 75, 90, 82, 100, 95].map((h, i) => (
                  <div key={i} className={s.chartBar} style={{ height: `${h}%`, background: i === 4 ? 'var(--pri)' : 'var(--info)' }}>
                    <span className={s.barLabel}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'success', label: 'Success Rate', render: () => (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Channel</th><th>Success Rate</th><th>Failed</th></tr></thead>
                  <tbody>
                    <tr><td>M-Pesa</td><td><span className={cx(s.badge, s.badgeSuccess)}>99.4%</span></td><td>7</td></tr>
                    <tr><td>Bank</td><td><span className={cx(s.badge, s.badgeSuccess)}>97.8%</span></td><td>12</td></tr>
                    <tr><td>International</td><td><span className={cx(s.badge, s.badgeWarning)}>94.1%</span></td><td>3</td></tr>
                  </tbody>
                </table>
              </div>
            ),
          },
          {
            key: 'recipients', label: 'Recipients', render: () => (
              <>
                <div className={s.rowItem}><div><strong>Grace Kamau</strong></div><strong>24 transfers</strong></div>
                <div className={s.rowItem}><div><strong>Landlord Properties</strong></div><strong>6 transfers</strong></div>
              </>
            ),
          },
        ]}
      />

      {/* M13: Security Check */}
      <SimpleModal id="security" show={isOpen('security')} onClose={close} iconCls="bi bi-shield-check" title="Transfer Security">
        <div className="row g-3">
          <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: '#F0F4FF' }}><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--pri)' }}>96</div><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pri)' }}>SECURITY SCORE</div></div></div>
          <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: '#F5F0FF' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--sec)' }}>2FA</div><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sec)' }}>ENABLED</div></div></div>
          <div className="col-md-4"><div className="p-3 rounded text-center" style={{ background: '#FFF8F0' }}><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>14d</div><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--warning)' }}>LAST REVIEW</div></div></div>
        </div>
      </SimpleModal>

      {/* M14: Transfer Notifications */}
      <SimpleModal id="notifications" show={isOpen('notifications')} onClose={close} iconCls="bi bi-bell" title="Transfer Notifications">
        <>
          {content.notifications.map((n) => (
            <div key={n.id} className={cx(s.hintBox, 'mb-2')}>
              <strong style={{ color: 'var(--ink-900)' }}>{n.title}</strong>
              <div style={{ fontSize: 11 }}>{n.desc}</div>
            </div>
          ))}
        </>
      </SimpleModal>

      {/* M15: Profile */}
      <SimpleModal id="profile" show={isOpen('profile')} onClose={close} iconCls="bi bi-person-circle" title="Profile">
        <div className="text-center">
          <div style={{ width: 64, height: 64, margin: '0 auto 12px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--pri), var(--sec))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24 }}>{content.user.initials}</div>
          <h5 style={{ fontWeight: 700, marginBottom: 2, color: 'var(--ink-900)' }}>{content.user.name}</h5>
          <p style={{ fontSize: 13, color: 'var(--ink-500)' }}>{content.user.email}</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--ink-100)' }}><span className="text-muted">Transfers</span><br /><strong>1,248 this month</strong></div></div>
            <div className="col-6"><div className="p-2 rounded" style={{ background: 'var(--ink-100)' }}><span className="text-muted">Security</span><br /><strong style={{ color: 'var(--pri)' }}>96/100</strong></div></div>
          </div>
        </div>
      </SimpleModal>

      {/* M16: Attention Full */}
      <SimpleModal id="attention" show={isOpen('attention')} onClose={close} iconCls="bi bi-exclamation-circle" title="All Attention Items">
        <>
          <div className={s.rowItem}><div><strong>Scheduled transfer failed</strong></div><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('retry')}>Retry</button></div>
          <div className={s.rowItem}><div><strong>3 recurring payments need funding source</strong></div><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('manageBeneficiaries')}>Update</button></div>
          <div className={s.rowItem}><div><strong>Large transfer pending approval</strong></div><button className={cx(s.btn, s.btnSm)} onClick={() => openModal('initiate')}>Approve</button></div>
        </>
      </SimpleModal>

      {/* M17: Dispute Transfer */}
      <SimpleModal id="dispute" show={isOpen('dispute')} onClose={close} iconCls="bi bi-exclamation-triangle" title="Report Transfer Issue" submitLabel="Submit" successMsg="Dispute submitted. Reference: DSP-88291">
        <div className="mb-3"><label className={s.fieldLabel}>Issue Type</label><select className={s.field}><option>Wrong amount sent</option><option>Transfer not received</option><option>Wrong beneficiary</option><option>Duplicate transfer</option></select></div>
        <div className="mb-3"><label className={s.fieldLabel}>Description</label><textarea className={s.field} rows={3} defaultValue="The transfer was sent to the wrong number." /></div>
      </SimpleModal>

      {/* M18: Edit Beneficiary */}
      <SimpleModal id="editBeneficiary" show={isOpen('editBeneficiary')} onClose={close} iconCls="bi bi-pencil" title="Edit Beneficiary" submitLabel="Save Changes" successMsg="Beneficiary updated successfully!">
        <div className="mb-3"><label className={s.fieldLabel}>Name</label><input className={s.field} defaultValue="Grace Kamau" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Phone / Account</label><input className={s.field} defaultValue="0712 345 890" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked id="editFav" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="editFav">Favorite</label></div>
      </SimpleModal>

      {/* M19: Fee Calculator */}
      <SimpleModal id="feeCalc" show={isOpen('feeCalc')} onClose={close} iconCls="bi bi-calculator" title="Transfer Fee Calculator">
        <div className="mb-3"><label className={s.fieldLabel}>Amount (KES)</label><input className={s.field} defaultValue="50000" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Method</label><select className={s.field}><option>M-Pesa</option><option>Bank Transfer</option><option>International</option></select></div>
        <div className="p-3 rounded" style={{ background: 'var(--ink-100)' }}><div className="d-flex justify-content-between"><span>Estimated Fee</span><strong>KES 35</strong></div></div>
      </SimpleModal>

      {/* M20: Transfer History */}
      <SimpleModal id="history" show={isOpen('history')} onClose={close} iconCls="bi bi-clock-history" title="Full Transfer History" size="xl">
        <>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <select className={s.field} style={{ width: 'auto' }}><option>All Methods</option><option>M-Pesa</option><option>Bank</option></select>
            <input className={s.field} style={{ width: 200 }} placeholder="Search reference" />
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Date</th><th>Beneficiary</th><th>Amount</th><th>Method</th><th>Status</th><th>Ref</th></tr></thead>
              <tbody>
                <tr><td>27 Jun</td><td>Grace Kamau</td><td>KES 12,500</td><td>M-Pesa</td><td><span className={cx(s.badge, s.badgeSuccess)}>Success</span></td><td>TRF-448291</td></tr>
                <tr><td>26 Jun</td><td>Landlord</td><td>KES 45,000</td><td>Bank</td><td><span className={cx(s.badge, s.badgeSuccess)}>Success</span></td><td>TRF-447820</td></tr>
              </tbody>
            </table>
          </div>
        </>
      </SimpleModal>

      {/* M21: Favorites Quick Send */}
      <SimpleModal id="favoritesQuick" show={isOpen('favoritesQuick')} onClose={close} iconCls="bi bi-star" title="Quick Send to Favorite" submitLabel="Send Now" successMsg="Transfer sent successfully!">
        <div className="mb-3"><label className={s.fieldLabel}>Amount (KES)</label><input className={s.field} defaultValue="5000" /></div>
        <div className="mb-3"><label className={s.fieldLabel}>Note</label><input className={s.field} defaultValue="Quick payment" /></div>
      </SimpleModal>

      {/* M22: Add to Favorites */}
      <SimpleModal id="addToFavorites" show={isOpen('addToFavorites')} onClose={close} iconCls="bi bi-star" title="Add to Favorites" submitLabel="Add" successMsg="Added to favorites!">
        <div className="mb-3"><label className={s.fieldLabel}>Nickname</label><input className={s.field} defaultValue="My Landlord" /></div>
        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked id="quickSend" /><label className="form-check-label" style={{ fontSize: 13 }} htmlFor="quickSend">Enable quick-send</label></div>
      </SimpleModal>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Small shared bits
 * ------------------------------------------------------------------------ */
function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">{label}</span>
      <strong style={highlight ? { color: 'var(--pri)' } : undefined}>{value}</strong>
    </div>
  );
}

function SegmentedTabs({ options, defaultActive }: { options: string[]; defaultActive: string }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <div className={s.pills}>
      {options.map((opt) => (
        <button key={opt} type="button" className={cx(s.pill, active === opt && s.pillActive)} onClick={() => setActive(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

/* re-exported so the page can type its openModal() calls */
export type { ModalId };