import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
import { ToastHost, Modal } from "./ui";
import {
  ActiveDisputesSection, ChargebackRiskSection, DisputeCommandCenter, EvidenceVaultSection,
  PageHeader, PreDisputeSettlementSection, SupportTicketsSection, WizardsBanner,
} from "./disputeSections";
import {
  ArbitrationWizardModal, BulkEvidenceWizardModal, EvidenceWizardModal, FileDisputeWizardModal,
  PreDisputeSettlementWizardModal, SupportTicketWizardModal,
} from "./disputeWizards";
import {
  ActivityDrawer, ChargebackHealthModal, DisputeDrawer, EvidenceVaultModal, HelpModal,
  TicketDrawer, UrgentDeadlinesModal,
} from "./disputeDialogs";

/* ---------- Modal Registry (20+ Modals) ---------- */
function ModalHost() {
  const { modal, closeModal, openModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };

  switch (modal.name) {
    /* 6 Comprehensive Multi-step Wizards */
    case "evidenceWizard": return <EvidenceWizardModal {...props} />;
    case "fileDisputeWizard": return <FileDisputeWizardModal {...props} />;
    case "openTicketWizard": return <SupportTicketWizardModal {...props} />;
    case "settlementWizard": return <PreDisputeSettlementWizardModal {...props} />;
    case "arbitrationWizard": return <ArbitrationWizardModal {...props} />;
    case "bulkEvidenceWizard": return <BulkEvidenceWizardModal {...props} />;

    /* Slide-over Drawers */
    case "disputeDrawer": return <DisputeDrawer {...props} />;
    case "ticketDrawer": return <TicketDrawer {...props} />;
    case "activity": return <ActivityDrawer {...props} />;

    /* Dialogs & Popups */
    case "evidenceVault": return <EvidenceVaultModal {...props} />;
    case "chargebackHealth": return <ChargebackHealthModal {...props} />;
    case "urgentDeadlines": return <UrgentDeadlinesModal {...props} />;
    case "help": return <HelpModal {...props} />;

    /* Additional Functional Modals */
    case "reversalNotice":
      return (
        <Modal open onClose={closeModal} title="Safaricom M-Pesa 234 Reversal Claim Notice" icon="bi-shield-exclamation" size="md">
          <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Customer Dennis Otieno lodged an M-Pesa reversal claim with Safaricom. KES 14,500 held in reserve.</div>
          <p style={{ fontSize: "0.85rem" }}>Upload proof of delivery (Sendy Waybill SK-88412) to block the reversal within 48 hours.</p>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary btn-sm" onClick={closeModal}>Close</button>
            <button className="btn btn-success btn-sm" onClick={() => { closeModal(); openModal("evidenceWizard", { disputeId: "DSP-2026-089" }); }}>Defend Claim Now</button>
          </div>
        </Modal>
      );

    case "eTIMSHashVerifier":
      return (
        <Modal open onClose={closeModal} title="KRA eTIMS Fiscal Hash Verifier" icon="bi-shield-check" size="md">
          <div className="p-3 bg-light rounded pm-mono text-break mb-3" style={{ fontSize: "0.78rem" }}>
            Hash: HASH-P051239991Y-20260113-991204<br />
            KRA iTax Status: VALID &amp; FISCALISED ✓<br />
            Timestamp: 13 Jan 2026 09:35:12 EAT
          </div>
          <p style={{ fontSize: "0.85rem" }}>This hash proves the transaction was fiscalised with KRA, legally confirming the sale.</p>
          <div className="text-end mt-3"><button className="btn btn-primary btn-sm" onClick={closeModal}>Close</button></div>
        </Modal>
      );

    case "sendyWaybillInspect":
      return (
        <Modal open onClose={closeModal} title="Sendy GPS Waybill Inspector" icon="bi-truck" size="md">
          <div className="p-3 border rounded bg-light mb-3" style={{ fontSize: "0.82rem" }}>
            <div><b>Waybill ID:</b> SK-88412</div>
            <div><b>Courier:</b> Sendy Express (Rider: John Njuguna)</div>
            <div><b>GPS Coordinates:</b> -1.286389, 36.817222 (Delivered Lavington)</div>
            <div><b>Recipient Signature:</b> Dennis Otieno (16 Jan 14:00 EAT)</div>
          </div>
          <div className="text-end"><button className="btn btn-primary btn-sm" onClick={closeModal}>Close</button></div>
        </Modal>
      );

    case "goodwillVoucher":
      return (
        <Modal open onClose={closeModal} title="Issue Goodwill Store Credit Voucher" icon="bi-gift" size="md">
          <p style={{ fontSize: "0.85rem" }}>Issue a KES 500 store credit voucher to Dennis Otieno as goodwill settlement for cracked glassware.</p>
          <div className="text-end"><button className="btn btn-success btn-sm" onClick={() => { closeModal(); }}>Issue Voucher &amp; Notify Customer</button></div>
        </Modal>
      );

    case "dpo3DSLog":
      return (
        <Modal open onClose={closeModal} title="Visa 3D-Secure 2.0 Auth Log" icon="bi-shield-lock" size="md">
          <div className="p-3 bg-dark text-light rounded pm-mono mb-3" style={{ fontSize: "0.75rem" }}>
            3DS_VER: 2.2.0<br />
            AUTH_STATUS: Y (Authenticated)<br />
            ECI: 05 (Visa 3DS Successful)<br />
            CAVV: AAABBjA3Mlh4AAAAAAAAAAAAAAA=<br />
            LIABILITY_SHIFT: YES (Card Issuer Liable)
          </div>
          <p style={{ fontSize: "0.85rem" }}>3DS 2.0 log proves liability shifted to issuing bank for fraud claims.</p>
          <div className="text-end"><button className="btn btn-primary btn-sm" onClick={closeModal}>Close</button></div>
        </Modal>
      );

    case "exportReport":
      return (
        <Modal open onClose={closeModal} title="Export Dispute &amp; Support Report" icon="bi-download" size="md">
          <p style={{ fontSize: "0.85rem" }}>Download complete dispute register, win/loss stats, and evidence logs for auditors.</p>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={closeModal}>Download CSV / PDF</button>
          </div>
        </Modal>
      );

    default: return null;
  }
}

/* ---------- main page component ---------- */
function Page({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const store = useStore();
  const { modal, closeModal } = store;
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "/" && !modal) {
        const el = document.getElementById("dispute-search") as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  return (
    <>
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="disputes" data={store} brandSub="Page 7 · Disputes &amp; Support" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="disputes" data={store} searchId="dispute-search" searchPlaceholder="Search disputes, tickets, evidence…" />
        <main className="pm-content">
          <PageHeader />
          <DisputeCommandCenter />
          <ActiveDisputesSection />
          <EvidenceVaultSection />
          <PreDisputeSettlementSection />
          <SupportTicketsSection />
          <ChargebackRiskSection />
          <WizardsBanner />

          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Dispute Management &amp; Support Desk</div>
              <div className="pm-prod-meta">
                M-Pesa 234 Reversal Protections · DPO Visa Arbitration · KRA eTIMS Verification · CBK Financial Ombudsman
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-shield-check me-1" />75% Win Rate</span>
              <span className="badge-soft blue"><i className="bi bi-activity me-1" />0.28% CBK Ratio</span>
              <span className="badge-soft amber"><i className="bi bi-lock me-1" />Dispute Reserve</span>
              <span className="badge-soft violet"><i className="bi bi-truck me-1" />Sendy Integrated</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-shield-exclamation", label: "File Dispute", primary: true, onClick: () => store.openModal("fileDisputeWizard") },
        { icon: "bi-file-earmark-arrow-up", label: "Defend Claim", onClick: () => store.openModal("evidenceWizard") },
        { icon: "bi-life-preserver", label: "Support Ticket", onClick: () => store.openModal("openTicketWizard") },
        { icon: "bi-arrow-left-right", label: "Settle Pre-Dispute", onClick: () => store.openModal("settlementWizard") },
        { icon: "bi-gavel", label: "Escalate to Arbiter", onClick: () => store.openModal("arbitrationWizard") },
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
