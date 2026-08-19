import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { ToastHost } from "./ui";
import {
  AdjustmentsCounts, CommandCenter, ExpiryBatches, LocationsLevels, PageHeader,
  PurchaseOrders, ReorderAutomation, ReturnsDamage, ValuationLedger, WizardsBanner,
} from "./inventorySections";
import {
  AdjustmentWizardModal, NewPoModal, ReceivePOWizardModal, ReorderWizardModal,
  ReturnInspectionWizardModal, StockCountWizardModal, TransferWizardModal, WriteOffWizardModal,
} from "./inventoryWizards";
import {
  ActivityDrawer, AdjustmentDetailModal, AlertsModal, BarcodeScanModal, CountDetailModal,
  ExpirySettingsModal, ExportLedgerModal, HelpModal, LocationModal, PoDrawer, ReorderSettingsModal,
  ReturnsPolicyModal, SkuDrawer, ValuationModal,
} from "./inventoryDialogs";

/* ---------- modal registry — 22 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "countWizard": return <StockCountWizardModal {...props} />;
    case "transferWizard": return <TransferWizardModal {...props} />;
    case "adjustmentWizard": return <AdjustmentWizardModal {...props} />;
    case "receiveWizard": return <ReceivePOWizardModal {...props} />;
    case "reorderWizard": return <ReorderWizardModal {...props} />;
    case "writeoffWizard": return <WriteOffWizardModal {...props} />;
    case "returnWizard": return <ReturnInspectionWizardModal {...props} />;
    case "newPo": return <NewPoModal {...props} />;
    /* drawers & dialogs */
    case "sku": return <SkuDrawer {...props} />;
    case "reorderSettings": return <ReorderSettingsModal {...props} />;
    case "location": return <LocationModal {...props} />;
    case "adjustmentDetail": return <AdjustmentDetailModal {...props} />;
    case "countDetail": return <CountDetailModal {...props} />;
    case "exportLedger": return <ExportLedgerModal {...props} />;
    case "valuation": return <ValuationModal {...props} />;
    case "expirySettings": return <ExpirySettingsModal {...props} />;
    case "scan": return <BarcodeScanModal {...props} />;
    case "poDrawer": return <PoDrawer {...props} />;
    case "returnsPolicy": return <ReturnsPolicyModal {...props} />;
    case "alerts": return <AlertsModal {...props} />;
    case "help": return <HelpModal {...props} />;
    case "activity": return <ActivityDrawer {...props} />;
    default: return null;
  }
}

/* ---------- page ---------- */
function Page({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const store = useStore();
  const { modal, closeModal } = store;
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "/" && !modal) {
        const el = document.getElementById("inv-search") as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
        return;
      }
      if (e.key === "Enter" && modal) {
        const active = document.activeElement as HTMLElement | null;
        const okTag = active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && !["date", "checkbox", "radio", "color", "file"].includes((active as HTMLInputElement).type)));
        if (okTag) {
          const footer = document.querySelector(".modal.show .modal-footer");
          const primary = footer?.querySelector(".btn-primary, .btn-success, .btn-danger") as HTMLButtonElement | null;
          if (primary && !primary.disabled) { e.preventDefault(); primary.click(); }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  return (
    <>
      <PageHeader />
      <CommandCenter />
      <PurchaseOrders />
      <ReorderAutomation />
      <ReturnsDamage />
      <ValuationLedger />
      <AdjustmentsCounts />
      <ExpiryBatches />
      <LocationsLevels />
      <WizardsBanner />

      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 8: Inventory &amp; Stock</div>
          <div className="pm-prod-meta">
            Multi-location · Auto-reorder · Expiry tracking · Valuation · eTIMS
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-box-seam me-1" />1,245 SKUs</span>
          <span className="badge-soft blue"><i className="bi bi-geo-alt me-1" />3 locations</span>
          <span className="badge-soft amber"><i className="bi bi-exclamation-triangle me-1" />12 expiring</span>
          <span className="badge-soft violet"><i className="bi bi-currency-dollar me-1" />KES 8.2M value</span>
        </div>
      </footer>
      <ModalHost />
      <ToastHost />
    </>
  );
}

export default function App({ onNavigate }: { onNavigate?: (p: string) => void }) {
  return (
    <StoreProvider>
      <Page onNavigate={onNavigate} />
    </StoreProvider>
  );
}
