import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { ToastHost, Modal } from "./ui";
import { Catalog, CommandCenter, OrdersSection, PageHeader, Performance, StoreBuilder } from "./sections";
import {
  ArchiveConfirmModal, BarcodeModal, BulkPriceModal, CategoryManagerModal, DuplicateConfirmModal,
  ImportCsvModal, ProductWizardModal, QuickViewModal, ReorderPOModal, StockAdjustModal,
} from "./productModals";
import {
  CheckoutSettingsModal, DiscountWizardModal, DomainModal, ETimsModal, PauseStoreModal,
  PaymentMethodsModal, PublishWizardModal, ShareStoreModal, ShippingZonesModal, StorePreviewModal,
  StoreSettingsModal, TeamRolesModal, ThemeCustomizerModal,
} from "./storeModals";
import {
  NotifyCustomerModal, OrderDrawer, OrderStatusModal, PackingSlipModal, RefundModal, ResendReceiptModal,
} from "./orderModals";
import { ActivityDrawer, AnalyticsExportModal, HelpModal } from "./extraModals";

/* ---------- small inline: delete permanently ---------- */
function DeleteConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, deleteProduct, toast, recordActivity } = useStore();
  const p = products.find((x) => x.id === String(payload.id));
  if (!p) return null;
  return (
    <Modal open onClose={onClose} title="Delete permanently?" icon="bi-trash" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={() => {
            deleteProduct(p.id);
            recordActivity(`Deleted product ${p.name} permanently`, "bi-trash");
            toast(`${p.name} was deleted permanently.`, "danger", "Product deleted");
            onClose();
          }}>
            <i className="bi bi-trash me-1" /> Delete forever
          </button>
        </>
      }
    >
      <p className="mb-1"><b>{p.name}</b> ({p.sku}) will be removed permanently.</p>
      <p className="pm-prod-meta mb-0">Past sales and ledger entries are kept for audit — only the product record is deleted.</p>
    </Modal>
  );
}

/* ---------- modal registry ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const p = modal.payload;
  const props = { payload: p, onClose: closeModal };
  switch (modal.name) {
    case "productWizard": return <ProductWizardModal {...props} />;
    case "quickView": return <QuickViewModal {...props} />;
    case "duplicate": return <DuplicateConfirmModal {...props} />;
    case "archive": return <ArchiveConfirmModal {...props} />;
    case "delete": return <DeleteConfirmModal {...props} />;
    case "stock": return <StockAdjustModal {...props} />;
    case "barcode": return <BarcodeModal {...props} />;
    case "import": return <ImportCsvModal {...props} />;
    case "bulkPrice": return <BulkPriceModal {...props} />;
    case "categories": return <CategoryManagerModal {...props} />;
    case "reorder": return <ReorderPOModal {...props} />;
    case "theme": return <ThemeCustomizerModal {...props} />;
    case "domain": return <DomainModal {...props} />;
    case "checkout": return <CheckoutSettingsModal {...props} />;
    case "payments": return <PaymentMethodsModal {...props} />;
    case "shipping": return <ShippingZonesModal {...props} />;
    case "publish": return <PublishWizardModal {...props} />;
    case "preview": return <StorePreviewModal {...props} />;
    case "share": return <ShareStoreModal {...props} />;
    case "etims": return <ETimsModal {...props} />;
    case "storeSettings": return <StoreSettingsModal {...props} />;
    case "team": return <TeamRolesModal {...props} />;
    case "pause": return <PauseStoreModal {...props} />;
    case "discount": return <DiscountWizardModal {...props} />;
    case "orderDrawer": return <OrderDrawer {...props} />;
    case "orderStatus": return <OrderStatusModal {...props} />;
    case "refund": return <RefundModal {...props} />;
    case "resendReceipt": return <ResendReceiptModal {...props} />;
    case "notifyCustomer": return <NotifyCustomerModal {...props} />;
    case "packingSlip": return <PackingSlipModal {...props} />;
    case "exportReport": return <AnalyticsExportModal {...props} />;
    case "help": return <HelpModal {...props} />;
    case "activity": return <ActivityDrawer {...props} />;
    default: return null;
  }
}

/* ---------- page ---------- */
function Page({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const store = useStore();
  const { modal, closeModal, openModal } = store;
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "/" && !modal) {
        const el = document.getElementById("catalog-search") as HTMLInputElement | null;
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
      <Catalog />
      <StoreBuilder />
      <OrdersSection />
      <Performance />

      <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #123a2c)", border: "none", color: "#fff" }}>
        <span style={{ fontSize: "1.6rem" }}>🧭</span>
        <div className="flex-grow-1" style={{ minWidth: 260 }}>
          <b style={{ fontSize: "0.95rem" }}>7.3 Product Wizard — a guided 6-step flow</b>
          <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
            Basics → Pricing &amp; Tax → Variants → Inventory → Media &amp; Listing → Review &amp; Publish. Autosaves drafts, validates eTIMS, live totals as you type.
          </div>
        </div>
        <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("productWizard")}>
          <i className="bi bi-magic me-1" /> Launch the wizard
        </button>
      </div>

      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 7: Products &amp; Store</div>
          <div className="pm-prod-meta">
            Built on the PayMo superapp pattern · central ledger · multi-business aware · Kenya-first rails
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-phone me-1" />M-Pesa Express</span>
          <span className="badge-soft blue"><i className="bi bi-shield-check me-1" />eTIMS ready</span>
          <span className="badge-soft amber"><i className="bi bi-bank me-1" />KRA compliant</span>
          <span className="badge-soft violet"><i className="bi bi-receipt me-1" />PesaLink</span>
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
