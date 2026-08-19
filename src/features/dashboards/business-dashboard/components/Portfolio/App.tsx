import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { ToastHost } from "./ui";
import {
  ConsolidationSection, EntityCreationSection, FoldersSection, GroupTaxSection, MatrixSection,
  PageHeader, PortfolioOverview, RentalSystemSection, TransfersSection, WizardsBanner,
} from "./portfolioSections";
import {
  EntityWizardModal, LoanWizardModal, MaintenanceWizardModal, MoveOutWizardModal,
  TenantWizardModal, TransferWizardModal,
} from "./portfolioWizards";
import {
  ActivityDrawer, ConsolidatedBSModal, ConsolidatedPnLModal, DepositLedgerModal,
  DepositStatementModal, EntityDrawer, ExportDataModal, HelpModal, LoanDrawer,
  MaintenanceDetailModal, MatrixModal, RentReminderModal, RentUnitModal, TaxCalendarModal,
  TenantDrawer, TransferDetailModal, VacancyModal,
} from "./portfolioDialogs";

/* ---------- modal registry — 22 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "entityWizard": return <EntityWizardModal {...props} />;
    case "transferWizard": return <TransferWizardModal {...props} />;
    case "loanWizard": return <LoanWizardModal {...props} />;
    case "tenantWizard": return <TenantWizardModal {...props} />;
    case "moveOutWizard": return <MoveOutWizardModal {...props} />;
    case "maintenanceWizard": return <MaintenanceWizardModal {...props} />;
    /* drawers & dialogs */
    case "entityDrawer": return <EntityDrawer {...props} />;
    case "transferDetail": return <TransferDetailModal {...props} />;
    case "loanDrawer": return <LoanDrawer {...props} />;
    case "tenantDrawer": return <TenantDrawer {...props} />;
    case "rentUnit": return <RentUnitModal {...props} />;
    case "rentReminder": return <RentReminderModal {...props} />;
    case "depositLedger": return <DepositLedgerModal {...props} />;
    case "depositStatement": return <DepositStatementModal {...props} />;
    case "maintenanceDetail": return <MaintenanceDetailModal {...props} />;
    case "consolidatedPnL": return <ConsolidatedPnLModal {...props} />;
    case "consolidatedBS": return <ConsolidatedBSModal {...props} />;
    case "matrix": return <MatrixModal {...props} />;
    case "taxCalendar": return <TaxCalendarModal {...props} />;
    case "vacancy": return <VacancyModal {...props} />;
    case "exportData": return <ExportDataModal {...props} />;
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
        const el = document.getElementById("pf-search") as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
        return;
      }
      if (e.key === "Enter" && modal) {
        const active = document.activeElement as HTMLElement | null;
        const okTag = active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && !["date", "checkbox", "radio", "color", "file", "range"].includes((active as HTMLInputElement).type)));
        if (okTag) {
          const footer = document.querySelector(".modal.show .modal-footer");
          const primary = footer?.querySelector(".btn-primary, .btn-success, .btn-danger, .btn-warning") as HTMLButtonElement | null;
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
      <PortfolioOverview />
      <EntityCreationSection />
      <ConsolidationSection />
      <TransfersSection />
      <GroupTaxSection />
      <MatrixSection />
      <FoldersSection />
      <RentalSystemSection />
      <WizardsBanner />

      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 14: Multi-Business Portfolio</div>
          <div className="pm-prod-meta">
            Consolidated view · Entity management · Inter-entity transfers · Group tax
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-buildings me-1" />4 entities</span>
          <span className="badge-soft blue"><i className="bi bi-currency-dollar me-1" />KES 12.4M total</span>
          <span className="badge-soft amber"><i className="bi bi-arrow-left-right me-1" />2 pending transfers</span>
          <span className="badge-soft violet"><i className="bi bi-file-earmark-text me-1" />Group tax ready</span>
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
