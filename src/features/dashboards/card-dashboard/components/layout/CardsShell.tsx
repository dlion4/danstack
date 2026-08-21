/* ============================================================================
 * CardsShell.tsx — the PayMo BAAS Cards layout shell (Bootstrap 5 edition).
 * ----------------------------------------------------------------------------
 * Layout component rendered by routes/cards/app.tsx. Renders the shell chrome
 * (sidebar, topbar, quickbar, mobile nav) around the <Outlet /> where the
 * active /cards/app/<module> route renders. All modals, drawers and toasts
 * are mounted here so they persist across page navigations.
 *
 * Bootstrap + bootstrap-icons CSS are imported HERE (and nowhere else) so the
 * rest of the app stays untouched; the bootstrap JS bundle is loaded lazily
 * so .modal/.offcanvas behaviors are available. All visual overrides live in
 * ../../index.css scoped under .pmc-* selectors.
 * ========================================================================== */

import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppProvider, scrollToId, ToastViewport, useApp } from "../../store";
import { Icon, Logo } from "../../icons";
import { MobileNav, QuickBar, SidebarContent, Topbar } from "../../lib/AppShell";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../index.css";

/* ---- Modals (shared across all pages) ---- */
import { CardDrawer, ConfigureAlertsModal, FreezeAllModal, FreezeModal, LimitsDrawer, PinModal } from "../../modalsA";
import { DisputeModal, FraudWizardModal, IssueCardModal, ShortcutsModal, SupportDrawer } from "../../modalsB";
import { ActivateModal, ReplaceModal } from "../../page2";
import { VirtualDetailsModal, VirtualIssueModal } from "../../page3";
import { CreditIssueModal, CreditDetailsModal, RepayModal, StatementDrawer } from "../../page4";
import { PrepaidIssueModal, TopupModal, PrepaidManageDrawer } from "../../page5";
import { BillingModal, InviteEmployeeModal, ApprovalModal, PolicyModal } from "../../page6";
import { FraudWizardModal as FraudWizardModal7, FraudEventModal } from "../../page7";
import { ReportBuilderModal } from "../../page8";
import { HealthCheckModal, WebhookModal, ApiKeyModal } from "../../page9";
import { SettingsDefaultsModal } from "../../page10";
import { pathToCardsPage } from "../../lib/routes";

/* ---- Global keyboard shortcuts ---- */
function useShortcuts() {
  const { openModal } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = pathToCardsPage(pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (typing) return;

      const sectionMap: Record<string, string> = {
        "1": "overview",
        "2": page === "5.10" ? "card-defaults" : page === "5.9" ? "gateway-logs" : page === "5.8" ? "issuance" : page === "5.7" ? "fraud-events" : page === "5.6" ? "departments" : page === "5.5" ? "prepaid-cards" : page === "5.4" ? "credit-line" : page === "5.3" ? "virtual-cards" : page === "5.2" ? "orders" : "cards",
        "3": page === "5.10" ? "support" : page === "5.9" ? "integrations" : page === "5.8" ? "revenue" : page === "5.7" ? "safeguards" : page === "5.6" ? "employees" : page === "5.5" ? "balances" : page === "5.4" ? "credit-cards" : page === "5.3" ? "guardrails" : page === "5.2" ? "mycards" : "alerts",
        "4": page === "5.10" ? "faq" : page === "5.9" ? "admin-access" : page === "5.8" ? "concentration" : page === "5.7" ? "report-card" : page === "5.6" ? "policies" : page === "5.5" ? "controls" : page === "5.4" ? "repayment" : page === "5.3" ? "funding" : page === "5.2" ? "fees" : "transactions",
        "5": page === "5.10" ? "resources" : page === "5.9" ? "environment" : page === "5.8" ? "corporate-spend" : page === "5.7" ? "suspicious" : page === "5.6" ? "approvals" : page === "5.5" ? "prepaid-activity" : page === "5.4" ? "credit-activity" : page === "5.3" ? "activity" : page === "5.2" ? "addresses" : "security",
        "6": page === "5.10" ? "overview" : page === "5.9" ? "overview" : page === "5.8" ? "insights" : page === "5.7" ? "audit-log" : page === "5.6" ? "program-billing" : page === "5.5" ? "prepaid-fees" : page === "5.4" ? "credit-insights" : page === "5.3" ? "best-practice" : page === "5.2" ? "replacement" : "analytics",
        "7": "program",
      };

      if (e.key === "/") {
        e.preventDefault();
        (document.querySelector('input[placeholder^="Search cards"]') as HTMLInputElement | null)?.focus();
      } else if (e.key.toLowerCase() === "n") {
        openModal({ type: "issue" });
      } else if (e.key.toLowerCase() === "a") {
        openModal({ type: "alerts" });
      } else if (e.key.toLowerCase() === "f") {
        openModal({ type: "freezeAll" });
      } else if (sectionMap[e.key]) {
        scrollToId(sectionMap[e.key]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal, page]);
}

function Footer() {
  const { openDrawer, toast } = useApp();
  return (
    <footer className="pmc-card mt-5 d-flex flex-wrap align-items-center px-4 py-3" style={{ gap: "12px 24px" }}>
      <span className="d-flex align-items-center pmc-gap-2">
        <Logo size={22} />
        <span className="pmc-display" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--pmc-ink)" }}>PayMo BAAS</span>
        <span className="pmc-badge-muted badge">v2.4</span>
      </span>
      <span className="d-none d-sm-inline pmc-faint" style={{ fontSize: 11, fontWeight: 600 }}>CBK-licensed issuer partner · PCI-DSS L1 · Visa & Mastercard principal member</span>
      <span className="ms-auto d-flex align-items-center" style={{ gap: 16 }}>
        <button
          type="button"
          onClick={() => scrollToId("health")}
          className="pmc-focus d-flex align-items-center pmc-gap-2 pmc-muted"
          style={{ border: 0, background: "transparent", fontSize: 11.5, fontWeight: 700 }}
        >
          <span className="pmc-live-dot" /> System status
        </button>
        <button
          type="button"
          onClick={() => toast("info", "Opening developer docs", "API reference for card issuance, authorisations and webhooks.")}
          className="pmc-focus pmc-muted"
          style={{ border: 0, background: "transparent", fontSize: 11.5, fontWeight: 700 }}
        >
          API docs
        </button>
        <button
          type="button"
          onClick={() => openDrawer({ type: "support" })}
          className="pmc-focus pmc-green-dark d-flex align-items-center"
          style={{ border: 0, background: "transparent", gap: 4, fontSize: 11.5, fontWeight: 700 }}
        >
          <Icon name="headset" size={13} /> Support
        </button>
      </span>
    </footer>
  );
}

/* =========================================================================
 * Layout shell
 * ========================================================================= */

function LayoutShell() {
  const { openDrawer } = useApp();
  useShortcuts();

  /* bootstrap JS bundle (Popper + modal/offcanvas plugins) — loaded once */
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {
      /* shell modals are React-controlled; JS bundle is progressive enhancement */
    });
  }, []);

  useEffect(() => {
    const onOpenSupport = () => openDrawer({ type: "support" });
    const onGoto = (e: Event) => {
      const anchor = (e as CustomEvent<string>).detail;
      window.setTimeout(() => scrollToId(anchor), 120);
    };
    window.addEventListener("pm-open-support", onOpenSupport);
    window.addEventListener("pm-goto", onGoto);
    return () => {
      window.removeEventListener("pm-open-support", onOpenSupport);
      window.removeEventListener("pm-goto", onGoto);
    };
  }, [openDrawer]);

  return (
    <div className="pmc-shell pmc-canvas">
      <div className="d-flex">
        {/* Desktop sidebar */}
        <aside className="pmc-sidebar pmc-side-glow d-none d-lg-flex">
          <SidebarContent />
        </aside>

        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <Topbar />
          <main className="pmc-page-content">
            <div className="pmc-main">
              <Outlet />
              <Footer />
            </div>
          </main>
        </div>
      </div>

      <QuickBar />
      <MobileNav />

      {/* Overlays — shared across all /cards/app/* pages */}
      <ConfigureAlertsModal />
      <FreezeModal />
      <FreezeAllModal />
      <PinModal />
      <LimitsDrawer />
      <CardDrawer />
      <IssueCardModal />
      <DisputeModal />
      <FraudWizardModal />
      <ShortcutsModal />
      <SupportDrawer />
      <ActivateModal />
      <ReplaceModal />
      <VirtualIssueModal />
      <VirtualDetailsModal />
      <CreditIssueModal />
      <CreditDetailsModal />
      <RepayModal />
      <StatementDrawer />
      <PrepaidIssueModal />
      <TopupModal />
      <PrepaidManageDrawer />
      <BillingModal />
      <InviteEmployeeModal />
      <ApprovalModal />
      <PolicyModal />
      <FraudWizardModal7 />
      <FraudEventModal />
      <ReportBuilderModal />
      <HealthCheckModal />
      <WebhookModal />
      <ApiKeyModal />
      <SettingsDefaultsModal />

      <ToastViewport />
    </div>
  );
}

/* =========================================================================
 * Exported default — wraps the shell in the app provider
 * ========================================================================= */

export default function CardsShell() {
  return (
    <AppProvider>
      <LayoutShell />
    </AppProvider>
  );
}
