import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
import { ToastHost } from "./ui";
import {
  ApiSection, CommandCenter, ConnectedAppsSection, HealthSection, MarketplaceSection,
  PageHeader, SyncCenterSection, WebhooksSection, WizardsBanner,
} from "./integrationSections";
import {
  ApiKeyWizardModal, InstallWizardModal, MappingWizardModal, WebhookWizardModal,
} from "./integrationWizards";
import {
  ActivityDrawer, ApiDocsModal, AppDrawer, AutomationWizardModal, ErrorDetailModal,
  ExportDataModal, HealthModal, HelpModal, MarketplaceModal, ReconnectModal, RevokeKeyModal,
  SandboxModal, SocialInboxModal, SyncNowModal, TestWebhookModal, UninstallModal,
  UsageModal, WebhookDetailModal,
} from "./integrationDialogs";

/* ---------- modal registry — 26 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "installWizard": return <InstallWizardModal {...props} />;
    case "mappingWizard": return <MappingWizardModal {...props} />;
    case "webhookWizard": return <WebhookWizardModal {...props} />;
    case "apiKeyWizard": return <ApiKeyWizardModal {...props} />;
    case "automationWizard": return <AutomationWizardModal {...props} />;
    /* connection management */
    case "appDrawer": return <AppDrawer {...props} />;
    case "reconnect": return <ReconnectModal {...props} />;
    case "syncNow": return <SyncNowModal {...props} />;
    case "errorDetail": return <ErrorDetailModal {...props} />;
    case "health": return <HealthModal {...props} />;
    case "uninstall": return <UninstallModal {...props} />;
    case "marketplace": return <MarketplaceModal {...props} />;
    /* webhooks & keys */
    case "webhookDetail": return <WebhookDetailModal {...props} />;
    case "testWebhook": return <TestWebhookModal {...props} />;
    case "revokeKey": return <RevokeKeyModal {...props} />;
    /* developer tools */
    case "apiDocs": return <ApiDocsModal {...props} />;
    case "sandbox": return <SandboxModal {...props} />;
    case "usage": return <UsageModal {...props} />;
    case "exportData": return <ExportDataModal {...props} />;
    /* social & misc */
    case "socialInbox": return <SocialInboxModal {...props} />;
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
        const el = document.getElementById("apps-search") as HTMLInputElement | null;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="integrations" data={store} brandSub="Page 13 · Apps &amp; Integrations" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="integrations" data={store} searchId="apps-search" searchPlaceholder="Search apps, webhooks, APIs…" />
        <main className="pm-content">
          <PageHeader />
          <CommandCenter />
          <MarketplaceSection />
          <ConnectedAppsSection />
          <SyncCenterSection />
          <WebhooksSection />
          <HealthSection />
          <ApiSection />
          <WizardsBanner />

          {/* footer */}
          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 13: Apps &amp; Integrations</div>
              <div className="pm-prod-meta">
                Built on the PayMo superapp pattern · central ledger · multi-business aware · Kenya-first rails
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-phone me-1" />Daraja API</span>
              <span className="badge-soft blue"><i className="bi bi-shield-check me-1" />eTIMS</span>
              <span className="badge-soft amber"><i className="bi bi-hdd-network me-1" />3 webhooks</span>
              <span className="badge-soft violet"><i className="bi bi-puzzle me-1" />Zapier live</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-plus-lg", label: "Install App", primary: true, onClick: () => store.openModal("installWizard") },
        { icon: "bi-hdd-network", label: "New Webhook", onClick: () => store.openModal("webhookWizard") },
        { icon: "bi-key", label: "API Key", onClick: () => store.openModal("apiKeyWizard") },
        { icon: "bi-magic", label: "Automation", onClick: () => store.openModal("automationWizard") },
        { icon: "bi-shop", label: "Marketplace", onClick: () => store.openModal("marketplace") },
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
