import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
import { ToastHost, Modal } from "./ui";
import {
  DeliverySection, InboxSection, NotifCommandCenter, PageHeader, PreferencesSection,
  QuietHoursSection, RulesSection, TemplatesSection, WizardsBanner,
} from "./notifSections";
import {
  AlertRuleWizardModal, DigestScheduleModal, PreferencesWizardModal, QuietHoursWizardModal,
} from "./notifWizards";
import {
  ActivityDrawer, DeliveryLogModal, HelpModal, MarkAllReadConfirmModal, MuteCategoryModal,
  NotifActionModal, NotifDrawer, TemplateEditorModal, TestNotifModal,
} from "./notifDialogs";

/* ---------- modal registry — 20 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "preferencesWizard": return <PreferencesWizardModal {...props} />;
    case "alertRuleWizard": return <AlertRuleWizardModal {...props} />;
    case "quietHours": return <QuietHoursWizardModal {...props} />;
    case "digestSchedule": return <DigestScheduleModal {...props} />;
    /* drawers */
    case "notifDrawer": return <NotifDrawer {...props} />;
    case "activity": return <ActivityDrawer {...props} />;
    /* dialogs */
    case "deliveryLog": return <DeliveryLogModal {...props} />;
    case "testNotif": return <TestNotifModal {...props} />;
    case "templateEditor": return <TemplateEditorModal {...props} />;
    case "muteCategory": return <MuteCategoryModal {...props} />;
    case "markAllReadConfirm": return <MarkAllReadConfirmModal {...props} />;
    case "notifAction": return <NotifActionModal {...props} />;
    case "help": return <HelpModal {...props} />;
    /* extra functional popups */
    case "reversalNotice":
      return (
        <Modal open onClose={closeModal} title="Reversal claim — action required" icon="bi-shield-exclamation" size="md"
          footer={
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Later</button>
              <button type="button" className="btn btn-success" onClick={() => { closeModal(); }}>
                <i className="bi bi-file-earmark-arrow-up me-1" /> Open Dispute Defence
              </button>
            </>
          }
        >
          <div className="pm-note mb-2"><i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />Dennis Otieno lodged a KES 14,500 M-Pesa reversal on QK88123049.</div>
          <p className="mb-0" style={{ fontSize: "0.88rem" }}>Funds are held in the Dispute Reserve. Upload the Sendy waybill to defend — 48 hours remaining.</p>
        </Modal>
      );
    case "urgentList":
      return (
        <Modal open onClose={closeModal} title="Urgent alerts needing action" icon="bi-fire" size="md"
          footer={<button type="button" className="btn btn-primary" onClick={closeModal}>Got it</button>}
        >
          <ul className="mb-0" style={{ fontSize: "0.86rem" }}>
            <li className="mb-2"><b>Dispute DSP-2026-089</b> — evidence due in 48h</li>
            <li className="mb-2"><b>CR12</b> — expires in 34 days</li>
            <li><b>Meta connection</b> — Instagram orders paused</li>
          </ul>
        </Modal>
      );
    case "channelsReport":
      return (
        <Modal open onClose={closeModal} title="Channel reliability report" icon="bi-graph-up-arrow" size="md"
          footer={<button type="button" className="btn btn-primary" onClick={closeModal}>Close</button>}
        >
          <p className="mb-0" style={{ fontSize: "0.88rem" }}>In-app 89.2% · WhatsApp 85.2% · Push 85.0% · SMS 80.0% · Email 40.9%. Recommendation: move urgent money alerts to WhatsApp + SMS.</p>
        </Modal>
      );
    case "exportNotifs":
      return (
        <Modal open onClose={closeModal} title="Export notification log" icon="bi-download" size="sm"
          footer={
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={closeModal}><i className="bi bi-download me-1" /> Download CSV</button>
            </>
          }
        >
          <p className="mb-0" style={{ fontSize: "0.88rem" }}>Export the full inbox + delivery log (12 months) as CSV for compliance or analysis.</p>
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
        const el = document.getElementById("notif-search") as HTMLInputElement | null;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="notifications" data={store} brandSub="Page 8 · Notifications Center" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="notifications" data={store} searchId="notif-search" searchPlaceholder="Search notifications, rules…" />
        <main className="pm-content">
          <PageHeader />
          <NotifCommandCenter />
          <InboxSection />
          <PreferencesSection />
          <RulesSection />
          <QuietHoursSection />
          <DeliverySection />
          <TemplatesSection />
          <WizardsBanner />

          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 8: Notifications Center</div>
              <div className="pm-prod-meta">
                The control room · alert routing · quiet hours · delivery reliability · audit-logged changes
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-whatsapp me-1" />85% open</span>
              <span className="badge-soft blue"><i className="bi bi-lightning-charge me-1" />6 alert rules</span>
              <span className="badge-soft amber"><i className="bi bi-moon me-1" />Quiet 22:00–07:00</span>
              <span className="badge-soft violet"><i className="bi bi-bell me-1" />5 unread</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-sliders", label: "Preferences", primary: true, onClick: () => store.openModal("preferencesWizard") },
        { icon: "bi-bell-plus", label: "Alert Rule", onClick: () => store.openModal("alertRuleWizard") },
        { icon: "bi-moon", label: "Quiet Hours", onClick: () => store.openModal("quietHours") },
        { icon: "bi-calendar3", label: "Digest Schedule", onClick: () => store.openModal("digestSchedule") },
        { icon: "bi-pencil-square", label: "Edit Template", onClick: () => store.openModal("templateEditor") },
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
