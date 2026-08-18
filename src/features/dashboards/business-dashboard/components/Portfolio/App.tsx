import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="portfolio" data={store} brandSub="Page 14 · Multi-Business Portfolio" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="portfolio" data={store} searchId="pf-search" searchPlaceholder="Search entities, tenants, transfers…" />
        <main className="pm-content">
          <PageHeader />
          <PortfolioOverview />
          <FoldersSection />
          <EntityCreationSection />
          <RentalSystemSection />
          <ConsolidationSection />
          <MatrixSection />
          <TransfersSection />
          <GroupTaxSection />
          <WizardsBanner />

          {/* footer */}
          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 14: Multi-Business Portfolio</div>
              <div className="pm-prod-meta">
                The superapp spine is complete · central ledger · multi-business aware · Kenya-first rails
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-buildings me-1" />5 entities</span>
              <span className="badge-soft blue"><i className="bi bi-shield-lock me-1" />API-enforced matrix</span>
              <span className="badge-soft amber"><i className="bi bi-house me-1" />2 rental properties</span>
              <span className="badge-soft violet"><i className="bi bi-arrow-left-right me-1" />Free inter-company</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-plus-lg", label: "New Entity", primary: true, onClick: () => store.openModal("entityWizard") },
        { icon: "bi-arrow-left-right", label: "Transfer Funds", onClick: () => store.openModal("transferWizard") },
        { icon: "bi-person-plus", label: "Add Tenant", onClick: () => store.openModal("tenantWizard") },
        { icon: "bi-cash-stack", label: "Record Loan", onClick: () => store.openModal("loanWizard") },
        { icon: "bi-tools", label: "Maintenance Job", onClick: () => store.openModal("maintenanceWizard") },
        { icon: "bi-question-circle", label: "Help", onClick: () => store.openModal("help") },
      ]} />
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
