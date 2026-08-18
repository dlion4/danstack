import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Search, Bell, User, Settings, Building2, Sparkles, Wallet, LayoutGrid, Zap, Package, Megaphone, Users, Shield, Database, Puzzle } from "lucide-react";
import { StoreProvider, useStore } from "./components/Productstore/store";
import { Modal } from "./components/Productstore/ui";
import { Catalog, CommandCenter, OrdersSection, PageHeader, Performance, StoreBuilder } from "./components/Productstore/sections";
import {
  ArchiveConfirmModal, BarcodeModal, BulkPriceModal, CategoryManagerModal, DuplicateConfirmModal,
  ImportCsvModal, ProductWizardModal, QuickViewModal, ReorderPOModal, StockAdjustModal,
} from "./components/Productstore/productModals";
import {
  CheckoutSettingsModal, DiscountWizardModal, DomainModal, ETimsModal, PauseStoreModal,
  PaymentMethodsModal, PublishWizardModal, ShareStoreModal, ShippingZonesModal, StorePreviewModal,
  StoreSettingsModal, TeamRolesModal, ThemeCustomizerModal,
} from "./components/Productstore/storeModals";
import {
  NotifyCustomerModal, OrderDrawer, OrderStatusModal, PackingSlipModal, RefundModal, ResendReceiptModal,
} from "./components/Productstore/orderModals";
import { ActivityDrawer, AnalyticsExportModal, HelpModal } from "./components/Productstore/extraModals";
import { cls } from "./lib";
import { NAVIGATION, ZONES, type NavZone } from "./lib/navigation";

type NavPage = "dashboard" | "getpaid" | "paysuppliers" | "cash" | "books" | "crm" | "productstore" | "inventory" | "marketing" | "profile" | "team" | "disputes" | "notifications" | "data" | "integrations" | "portfolio" | "funding" | "insurance";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutGrid,
  Wallet,
  User,
  Building2,
  Zap,
  Sparkles,
  Settings,
  Package,
  Megaphone,
  Users,
  Shield,
  Bell,
  Database,
  Puzzle,
};

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

/* ==================================================================
   PAGE CONTENT
================================================================== */
function PageContent() {
  const { modal, closeModal, openModal } = useStore();

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
    <div className="pm-content">
      <PageHeader />
      <CommandCenter />
      <Catalog />
      <StoreBuilder />
      <OrdersSection />
      <Performance />

      {/* wizard banner strip */}
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

      {/* footer */}
      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 7: Products &amp; Online Store</div>
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
    </div>
  );
}

export default function AppProductstore({ onNavigate }: { onNavigate?: (p: NavPage) => void }) {
  return (
    <StoreProvider>
      <Shell onNavigate={onNavigate} currentPage="productstore" />
    </StoreProvider>
  );
}

function Shell({ onNavigate, currentPage }: { onNavigate?: (p: NavPage) => void; currentPage?: NavPage }) {
  const { business, notifications, toast, toasts, dismissToast } = useStore();
  const [sideOpen, setSideOpen] = useState(false);
  const [, setBizSwitch] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState("");

  const unread = notifications.filter((n) => !n.unread).length;

  const getNavigationWithActiveState = (): NavZone => {
    return Object.fromEntries(
      Object.entries(NAVIGATION).map(([zone, items]) => [
        zone,
        items.map((item) => ({
          ...item,
          active: item.id === currentPage,
        })),
      ])
    );
  };

  const navigation = getNavigationWithActiveState();

  const getIconComponent = (iconName: string) => {
    const IconComp = ICON_MAP[iconName];
    return IconComp ? <IconComp size={16} /> : null;
  };

  return (
    <div className="pm-shell">
      {/* ══════════ SIDEBAR ══════════ */}
      {sideOpen && <div className="pm-side-backdrop" onClick={() => setSideOpen(false)} />}
      <aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Products & Store</div>
          </div>
          <button className="pm-side-x" onClick={() => setSideOpen(false)}><X size={18} /></button>
        </div>

        <button className="pm-biz-switch" onClick={() => setBizSwitch(true)}>
          <span className="pm-biz-avatar">{business[0]}</span>
          <span className="flex-grow-1 text-start">
            <b>{business}</b>
            <span className="d-block pm-fs-11 pm-muted">Operating · Retail</span>
          </span>
          <ChevronDown size={14} />
        </button>

        <nav className="pm-nav">
          {Object.entries(navigation).map(([zone, items]) => (
            <div className="pm-nav-zone" key={zone}>
              <div className="pm-nav-zone-label" style={{ color: ZONES[zone] }}>{zone}</div>
              {items.map((it) => (
                <button
                  key={it.id}
                  className={cls("pm-nav-item", it.active && "pm-nav-item-active")}
                  onClick={() => {
                    setSideOpen(false);
                    if (it.active) return;
                    if (it.id === "inventory") onNavigate?.("inventory");
                    else if (it.id === "marketing") onNavigate?.("marketing");
                    else if (onNavigate) onNavigate(it.id as NavPage);
                    else toast(`Navigate to ${it.label}`, "info");
                  }}
                >
                  <span className="pm-nav-ic">{getIconComponent(it.iconName)}</span>
                  <span>{it.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-upgrade">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Zap size={14} style={{ color: "#ffd66b" }} />
              <span className="fw-bold">eTIMS & M-Pesa ready</span>
            </div>
            All 14 SKUs validated with KRA. Till <b>904412</b> collecting live.
          </div>
          <button className="pm-user-row" onClick={() => setUserMenu(!userMenu)}>
            <span className="pm-avatar">WM</span>
            <span className="flex-grow-1 text-start">
              <b>Wanjiku Maina</b>
              <span className="d-block pm-fs-11 pm-muted">Owner · {business}</span>
            </span>
            <ChevronDown size={12} />
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div className="pm-main">
        <header className="pm-topbar">
          <button className="pm-burger" onClick={() => setSideOpen(true)}><Menu size={20} /></button>
          <div className="pm-crumb">Your Business / <b>Products & Store</b></div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-search-box d-none d-md-block">
              <Search size={16} className="pm-search-icon" />
              <input
                className="pm-search-input"
                placeholder="Search products, orders…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="pm-bell" onClick={() => setBellOpen(!bellOpen)}>
              <Bell size={18} />
              {unread > 0 && <span className="pm-bell-nub">{unread}</span>}
            </button>

            <button className="pm-avatar" onClick={() => setUserMenu(!userMenu)}>WM</button>
          </div>
        </header>

        <PageContent />
      </div>

      {/* ══════════ TOASTS ══════════ */}
      <div className="pm-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`pm-toast pm-toast-${t.type}`}>
            <div className="flex-grow-1">
              {t.title && <div className="fw-bold" style={{ fontSize: "0.82rem" }}>{t.title}</div>}
              <div style={{ fontSize: "0.76rem", color: "#667085" }}>{t.msg}</div>
            </div>
            <button className="pm-toast-close" onClick={() => dismissToast(t.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
