import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
import { ToastHost } from "./ui";
import {
  ApprovalsSection, AuditSection, MembersSection, PageHeader, RolesSection,
  SecuritySection, TeamCommandCenter, WizardsBanner,
} from "./teamSections";
import {
  ApprovalWizardModal, BulkWizardModal, InviteWizardModal, OffboardWizardModal,
  RoleWizardModal, TwoFaWizardModal,
} from "./teamWizards";
import {
  AccessReviewModal, ActivityDrawer, ApprovalDetailModal, AuditLogModal, BusinessAccessModal,
  ExportTeamModal, HelpModal, MemberAuditModal, MemberDrawer, PendingApprovalsModal,
  PermMatrixModal, ReactivateConfirmModal, ResetPasswordModal, RevokeInviteModal, RoleDrawer,
  SecurityPolicyModal, SessionsModal, SuspendConfirmModal, TransferOwnershipModal,
} from "./teamDialogs";

/* ---------- modal registry — 25 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "inviteWizard": return <InviteWizardModal {...props} />;
    case "roleWizard": return <RoleWizardModal {...props} />;
    case "approvalWizard": return <ApprovalWizardModal {...props} />;
    case "offboardWizard": return <OffboardWizardModal {...props} />;
    case "twofaWizard": return <TwoFaWizardModal {...props} />;
    case "bulkWizard": return <BulkWizardModal {...props} />;
    /* drawers */
    case "memberDrawer": return <MemberDrawer {...props} />;
    case "roleDrawer": return <RoleDrawer {...props} />;
    case "activity": return <ActivityDrawer {...props} />;
    /* matrices & access */
    case "permMatrix": return <PermMatrixModal {...props} />;
    case "businessAccess": return <BusinessAccessModal {...props} />;
    case "accessReview": return <AccessReviewModal {...props} />;
    /* approvals */
    case "approvalDetail": return <ApprovalDetailModal {...props} />;
    case "pendingApprovals": return <PendingApprovalsModal {...props} />;
    /* security */
    case "sessions": return <SessionsModal {...props} />;
    case "securityPolicy": return <SecurityPolicyModal {...props} />;
    case "resetPassword": return <ResetPasswordModal {...props} />;
    case "transferOwnership": return <TransferOwnershipModal {...props} />;
    /* audit */
    case "auditLog": return <AuditLogModal {...props} />;
    case "memberAudit": return <MemberAuditModal {...props} />;
    /* confirms & misc */
    case "suspend": return <SuspendConfirmModal {...props} />;
    case "reactivate": return <ReactivateConfirmModal {...props} />;
    case "revokeInvite": return <RevokeInviteModal {...props} />;
    case "exportTeam": return <ExportTeamModal {...props} />;
    case "help": return <HelpModal {...props} />;
    /* alias used by command center */
    case "members": return <MemberDrawer {...props} payload={{ id: "u8" }} />;
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
        const el = document.getElementById("team-search") as HTMLInputElement | null;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="team" data={store} brandSub="Page 6 · Team Management &amp; Roles" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="team" data={store} searchId="team-search" searchPlaceholder="Search members, roles, permissions…" />
        <main className="pm-content">
          <PageHeader />
          <TeamCommandCenter />
          <MembersSection />
          <RolesSection />
          <ApprovalsSection />
          <SecuritySection />
          <AuditSection />
          <WizardsBanner />

          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 6: Team Management &amp; Roles</div>
              <div className="pm-prod-meta">
                The control room · least privilege · maker-checker · append-only audit trail
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-people-fill me-1" />7 active members</span>
              <span className="badge-soft violet"><i className="bi bi-shield-fill-check me-1" />7 roles</span>
              <span className="badge-soft blue"><i className="bi bi-check2-square me-1" />4 approval rules</span>
              <span className="badge-soft amber"><i className="bi bi-clipboard-data me-1" />Audit 7yr retention</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-person-plus", label: "Invite Member", primary: true, onClick: () => store.openModal("inviteWizard") },
        { icon: "bi-person-gear", label: "New Role", onClick: () => store.openModal("roleWizard") },
        { icon: "bi-check2-square", label: "Approval Rule", onClick: () => store.openModal("approvalWizard") },
        { icon: "bi-shield-lock", label: "Set Up 2FA", onClick: () => store.openModal("twofaWizard") },
        { icon: "bi-people", label: "Bulk Invite", onClick: () => store.openModal("bulkWizard") },
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
