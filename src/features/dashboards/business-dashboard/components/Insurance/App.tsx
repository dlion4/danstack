import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
import { ToastHost } from "./ui";
import { BeneficiariesSection, ClaimsSection, CoverCommandCenter, PageHeader, PoliciesSection, WizardsBanner } from "./insuranceSections";
import {
  ActivateCyberModal, ActivityDrawer, BeneficiariesModal, ClaimDetailModal, ClaimModal, HelpModal,
  PolicyDetailDrawer, PolicyModal, RenewalsModal,
} from "./insuranceDialogs";

/* ---------- modal registry ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    case "policyDetail": return <PolicyDetailDrawer {...props} />;
    case "policy": return <PolicyModal {...props} />;
    case "claim": return <ClaimModal {...props} />;
    case "claimDetail": return <ClaimDetailModal {...props} />;
    case "renewals": return <RenewalsModal {...props} />;
    case "beneficiaries": return <BeneficiariesModal {...props} />;
    case "activateCyber": return <ActivateCyberModal {...props} />;
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
        const el = document.getElementById("ins-search") as HTMLInputElement | null;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="insurance" data={store} brandSub="Page 11 · Insurance &amp; Protection" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="insurance" data={store} searchId="ins-search" searchPlaceholder="Search policies, claims, beneficiaries…" />
        <main className="pm-content">
          <PageHeader />
          <CoverCommandCenter />
          <PoliciesSection />
          <ClaimsSection />
          <BeneficiariesSection />
          <WizardsBanner />

          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 11: Insurance &amp; Protection</div>
              <div className="pm-prod-meta">
                The protection engine · 5 underwriters · WIBA compliant · Kenya-first rails
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-shield-fill-check me-1" />KES 24.5M cover</span>
              <span className="badge-soft blue"><i className="bi bi-bank me-1" />6 policies</span>
              <span className="badge-soft amber"><i className="bi bi-shield-exclamation me-1" />1 claim in review</span>
              <span className="badge-soft violet"><i className="bi bi-people me-1" />3 beneficiaries</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-shield-exclamation", label: "File a Claim", primary: true, onClick: () => store.openModal("claim") },
        { icon: "bi-shield-plus", label: "Get a Quote", onClick: () => store.openModal("policy") },
        { icon: "bi-calendar-event", label: `${store.policies.filter((p) => p.status === "Expiring soon").length} Renewals Due`, onClick: () => store.openModal("renewals") },
        { icon: "bi-people", label: "Beneficiaries", onClick: () => store.openModal("beneficiaries") },
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
