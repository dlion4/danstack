import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { ToastHost, Modal } from "./ui";
import {
  AccountSection, AuditSection, ConsentSection, DataCommandCenter, ExportSection,
  PageHeader, PrivacySection, SharingSection, WizardsBanner,
} from "./dataSections";
import {
  AccountClosureModal, ConsentManagerModal, DeletionWizardModal, ExportWizardModal,
} from "./dataWizards";
import {
  AccountSecurityModal, ActivityDrawer, AuditLogModal, HelpModal, IntegrationsDataModal,
  PrivacyPolicyModal, RequestHistoryModal,
} from "./dataDialogs";

/* ---------- modal registry — 20 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal, toast } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "exportWizard": return <ExportWizardModal {...props} />;
    case "deletionWizard": return <DeletionWizardModal {...props} />;
    case "consentManager": return <ConsentManagerModal {...props} />;
    case "accountClosure": return <AccountClosureModal {...props} />;
    /* dialogs */
    case "requestHistory": return <RequestHistoryModal {...props} />;
    case "auditLog": return <AuditLogModal {...props} />;
    case "privacyPolicy": return <PrivacyPolicyModal {...props} />;
    case "integrationsData": return <IntegrationsDataModal {...props} />;
    case "accountSecurity": return <AccountSecurityModal {...props} />;
    case "help": return <HelpModal {...props} />;
    case "activity": return <ActivityDrawer {...props} />;
    /* extra popups */
    case "retentionSchedule":
      return (
        <Modal open onClose={closeModal} title="Data retention schedule" icon="bi-clock-history" size="md"
          footer={<button type="button" className="btn btn-primary" onClick={closeModal}>Close</button>}>
          <ul style={{ fontSize: "0.85rem" }}>
            <li className="mb-2"><b>Transaction records:</b> 7 years (KRA Tax Procedures Act)</li>
            <li className="mb-2"><b>eTIMS receipts:</b> 7 years (KRA)</li>
            <li className="mb-2"><b>KYB documents:</b> 5 years post-closure (CBK)</li>
            <li className="mb-2"><b>Marketing data:</b> 2 years</li>
            <li className="mb-2"><b>Team data:</b> 2 years post-departure</li>
            <li><b>Audit trail:</b> Indefinite (append-only)</li>
          </ul>
        </Modal>
      );
    case "dataBreach":
      return (
        <Modal open onClose={closeModal} title="Data breach protocol" icon="bi-exclamation-octagon" size="md"
          footer={<button type="button" className="btn btn-primary" onClick={closeModal}>Close</button>}>
          <p style={{ fontSize: "0.85rem" }} className="mb-2">In the event of a data breach, PayMo:</p>
          <ol style={{ fontSize: "0.85rem" }}>
            <li className="mb-1">Notifies the ODPC within <b>72 hours</b> of discovery</li>
            <li className="mb-1">Notifies affected customers without undue delay</li>
            <li className="mb-1">Conducts a full forensic investigation</li>
            <li>Provides remediation (free credit monitoring for 12 months)</li>
          </ol>
        </Modal>
      );
    case "dpoContact":
      return (
        <Modal open onClose={closeModal} title="Contact Data Protection Officer" icon="bi-envelope" size="sm"
          footer={<><button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Close</button><button type="button" className="btn btn-primary" onClick={() => { toast("Email drafted to privacy@paymo.co.ke", "info", "DPO contact"); closeModal(); }}>Compose email</button></>}>
          <p className="mb-0" style={{ fontSize: "0.85rem" }}>Email: <b className="pm-mono">privacy@paymo.co.ke</b><br />Response SLA: 48 hours<br />For: data access, rectification, deletion or breach concerns.</p>
        </Modal>
      );
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
        const el = document.getElementById("data-search") as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
        return;
      }
      if (e.key === "Enter" && modal) {
        const active = document.activeElement as HTMLElement | null;
        const okTag = active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && !["date", "checkbox", "radio", "color", "file", "range", "time"].includes((active as HTMLInputElement).type)));
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
      <DataCommandCenter />
      <ExportSection />
      <ConsentSection />
      <PrivacySection />
      <AuditSection />
      <SharingSection />
      <AccountSection />
      <WizardsBanner />

      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 9: Data, Privacy &amp; Account Management</div>
          <div className="pm-prod-meta">
            Kenya DPA 2019 compliant · GDPR-compatible · CBK data retention rules · append-only audit trail
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-shield-lock me-1" />AES-256 encrypted</span>
          <span className="badge-soft blue"><i className="bi bi-clipboard-data me-1" />7-yr audit</span>
          <span className="badge-soft amber"><i className="bi bi-clock-history me-1" />KRA retention</span>
          <span className="badge-soft violet"><i className="bi bi-shield-check me-1" />DPA 2019</span>
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
