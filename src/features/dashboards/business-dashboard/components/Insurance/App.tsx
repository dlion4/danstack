import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
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
            Embedded insurance · Instant claims · AI underwriting · Kenya-first carriers
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-shield-check me-1" />3 active policies</span>
          <span className="badge-soft blue"><i className="bi bi-cash-stack me-1" />KES 4.2M covered</span>
          <span className="badge-soft amber"><i className="bi bi-lightning-charge me-1" />0 claims pending</span>
          <span className="badge-soft violet"><i className="bi bi-people me-1" />5 beneficiaries</span>
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
