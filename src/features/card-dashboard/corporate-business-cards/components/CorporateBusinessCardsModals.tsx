import { useEffect } from 'react';

/* ======================= LEGACY JS BRIDGE PATTERNS ======================= */
function processAction(modalId: string, msg: string, ref?: string) {
  console.log(`Process action: ${modalId}`, msg, ref);
}
function moveFocus(el: HTMLInputElement) {
  if (el.value.length === 1 && el.nextElementSibling) {
    (el.nextElementSibling as HTMLInputElement).focus();
  }
}

/* ======================= MODAL REGISTRY ======================= */
interface ModalRegistry {
  [modalId: string]: () => JSX.Element;
}

const modalContent: ModalRegistry = {
  issueCardModal: () => (
    <div id="issueCardModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"><i className="bi bi-plus-circle text-primary me-2"></i>Issue Corporate Card</h5>
            <button className="btn-close" dataBsDismiss="modal"></button>
          </div>
          <div className="modal-body"><p>Issue Card modal content goes here.</p></div>
          <div className="modal-footer">
            <button className="btn" dataBsDismiss="modal">Cancel</button>
            <button className="btn btn-primary" onClick={() => processAction('issueCardModal', 'Card provisioned', '')}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  ),
  bulkIssueModal: () => (
    <div id="bulkIssueModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-people me-2"></i>Bulk Issue</h5></div>
          <div className="modal-body"><p>Bulk Issue placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  policyRulesModal: () => (
    <div id="policyRulesModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-shield-lock me-2"></i>Policy Rules</h5></div>
          <div className="modal-body"><p>Policy Rules placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  approvalQueueModal: () => (
    <div id="approvalQueueModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-check-circle me-2"></i>Approval Queue</h5></div>
          <div className="modal-body"><p>Approval Queue placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  reviewTransactionModal: () => (
    <div id="reviewTransactionModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-search me-2"></i>Review Transaction</h5></div>
          <div className="modal-body"><p>Review transaction placeholder.</p></div>
          <div className="modal-footer">
            <button dataBsDismiss="modal">Cancel</button>
            <button className="btn btn-primary">Approve</button>
            <button className="btn btn-danger">Reject</button>
          </div>
        </div>
      </div>
    </div>
  ),
  missingReceiptsModal: () => (
    <div id="missingReceiptsModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-receipt me-2"></i>Missing Receipts</h5></div>
          <div className="modal-body"><p>Missing receipts placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  uploadReceiptModal: () => (
    <div id="uploadReceiptModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-upload me-2"></i>Upload Receipt</h5></div>
          <div className="modal-body"><p>Upload receipt placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Cancel</button><button className="btn btn-primary">Submit</button></div>
        </div>
      </div>
    </div>
  ),
  expenseDetailModal: () => (
    <div id="expenseDetailModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-receipt text-primary me-2"></i>Expense Detail</h5></div>
          <div className="modal-body"><p>Expense detail placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  attentionCenterModal: () => (
    <div id="attentionCenterModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-exclamation-circle text-warning me-2"></i>Attention Center</h5></div>
          <div className="modal-body"><p>Attention center placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  violationDetailsModal: () => (
    <div id="violationDetailsModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-shield-exclamation text-danger me-2"></i>Violation Details</h5></div>
          <div className="modal-body"><p>Violation details placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  fundingModal: () => (
    <div id="fundingModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-cash-stack text-success me-2"></i>Funding</h5></div>
          <div className="modal-body"><p>Funding placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  reportsModal: () => (
    <div id="reportsModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-bar-chart text-danger me-2"></i>Reports</h5></div>
          <div className="modal-body"><p>Reports placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  statementModal: () => (
    <div id="statementModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-file-earmark-pdf text-info me-2"></i>Statement</h5></div>
          <div className="modal-body"><p>Statement placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  settlementModal: () => (
    <div id="settlementModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-cash text-success me-2"></i>Settlement</h5></div>
          <div className="modal-body"><p>Settlement placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  cardDeliveryModal: () => (
    <div id="cardDeliveryModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-truck me-2"></i>Track Delivery</h5></div>
          <div className="modal-body"><p>Delivery tracking placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  cardRosterModal: () => (
    <div id="cardRosterModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-list-ul me-2"></i>Card Roster</h5></div>
          <div className="modal-body"><p>Card roster placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  manageEmployeeCardModal: () => (
    <div id="manageEmployeeCardModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-credit-card-2-front me-2"></i>Manage Card</h5></div>
          <div className="modal-body"><p>Manage employee card placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  editLimitModal: () => (
    <div id="editLimitModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-sliders me-2"></i>Edit Limit</h5></div>
          <div className="modal-body"><p>Edit limit placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  billingSetupModal: () => (
    <div id="billingSetupModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-cash-coin me-2"></i>Billing Setup</h5></div>
          <div className="modal-body"><p>Billing setup placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  brandingModal: () => (
    <div id="brandingModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-palette me-2"></i>Branding</h5></div>
          <div className="modal-body"><p>Branding placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  createPolicyModal: () => (
    <div id="createPolicyModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-shield-plus me-2"></i>Create Policy</h5></div>
          <div className="modal-body"><p>Create policy placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
  reconciliationModal: () => (
    <div id="reconciliationModal" className="modal fade resettable" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title"><i className="bi bi-journal-check me-2"></i>Reconciliation</h5></div>
          <div className="modal-body"><p>Reconciliation placeholder.</p></div>
          <div className="modal-footer"><button dataBsDismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  ),
};

export default function CorporateBusinessCardsModals({ active, onClose, onOpen }: { active: string | null; onClose: () => void; onOpen: (id: string) => void }) {
  if (!active) return null;
  const renderModal = modalContent[active];
  if (!renderModal) return null;

  return (
    <div id={active} className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {renderModal()}
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </div>
  );
}