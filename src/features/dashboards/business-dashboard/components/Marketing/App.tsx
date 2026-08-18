import { useEffect, useState } from "react";
import "./marketing.css";
import { StoreProvider, useStore } from "./store";
import { QuickBar, Sidebar, Topbar } from "../../lib/AppShell";
import { ToastHost } from "./ui";
import {
  CampaignsSection, GrowthAnalytics, LoyaltySection, MarketingCommandCenter, PageHeader,
  PromotionsSection, ReviewsSection, SocialCommerce, WizardsBanner,
} from "./marketingSections";
import {
  ABTestWizardModal, BroadcastWizardModal, CampaignWizardModal, FeedbackWizardModal,
  FlashSaleWizardModal, LoyaltyWizardModal, ReferralWizardModal,
} from "./marketingWizards";
import {
  ActivityDrawer, AttributionModal, BoostPostModal, BudgetModal, CalendarModal, CampaignDrawer,
  ExportAnalyticsModal, HelpModal, IdeasModal, InboxDrawer, IntegrationsModal, MemberDrawer,
  NpsDetailModal, RedeemPointsModal, ReviewReplyModal, RoiCalculatorModal, SegmentBuilderModal,
  ShareReferralModal, SocialComposerModal, TemplatesModal,
} from "./marketingDialogs";

/* ---------- modal registry — 27 functional modals ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    /* wizards */
    case "campaignWizard": return <CampaignWizardModal {...props} />;
    case "flashsaleWizard": return <FlashSaleWizardModal {...props} />;
    case "loyaltyWizard": return <LoyaltyWizardModal {...props} />;
    case "referralWizard": return <ReferralWizardModal {...props} />;
    case "abtestWizard": return <ABTestWizardModal {...props} />;
    case "broadcastWizard": return <BroadcastWizardModal {...props} />;
    case "feedbackWizard": return <FeedbackWizardModal {...props} />;
    /* drawers & dialogs */
    case "campaignDrawer": return <CampaignDrawer {...props} />;
    case "segmentBuilder": return <SegmentBuilderModal {...props} />;
    case "socialComposer": return <SocialComposerModal {...props} />;
    case "inbox": return <InboxDrawer {...props} />;
    case "reviewReply": return <ReviewReplyModal {...props} />;
    case "redeemPoints": return <RedeemPointsModal {...props} />;
    case "memberDrawer": return <MemberDrawer {...props} />;
    case "shareReferral": return <ShareReferralModal {...props} />;
    case "budget": return <BudgetModal {...props} />;
    case "attribution": return <AttributionModal {...props} />;
    case "roiCalc": return <RoiCalculatorModal {...props} />;
    case "templates": return <TemplatesModal {...props} />;
    case "integrations": return <IntegrationsModal {...props} />;
    case "ideas": return <IdeasModal {...props} />;
    case "exportAnalytics": return <ExportAnalyticsModal {...props} />;
    case "calendar": return <CalendarModal {...props} />;
    case "npsDetail": return <NpsDetailModal {...props} />;
    case "boostPost": return <BoostPostModal {...props} />;
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
        const el = document.getElementById("mkt-search") as HTMLInputElement | null;
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
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} onNavigate={onNavigate} current="marketing" data={store} brandSub="Page 12 · Marketing &amp; Growth" />
      <div className="pm-main">
        <Topbar onMenu={() => setSideOpen(true)} current="marketing" data={store} searchId="mkt-search" searchPlaceholder="Search campaigns, audience, codes…" />
        <main className="pm-content">
          <PageHeader />
          <MarketingCommandCenter />
          <CampaignsSection />
          <LoyaltySection />
          <SocialCommerce />
          <PromotionsSection />
          <ReviewsSection />
          <GrowthAnalytics />
          <WizardsBanner />

          {/* footer */}
          <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 12: Marketing &amp; Growth</div>
              <div className="pm-prod-meta">
                Built on the PayMo superapp pattern · central ledger · multi-business aware · Kenya-first rails
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-soft green"><i className="bi bi-whatsapp me-1" />WhatsApp Business</span>
              <span className="badge-soft violet"><i className="bi bi-instagram me-1" />Instagram Shopping</span>
              <span className="badge-soft amber"><i className="bi bi-stars me-1" />1,284 members</span>
              <span className="badge-soft blue"><i className="bi bi-graph-up-arrow me-1" />ROI 21.4×</span>
            </div>
          </footer>
        </main>
      </div>
      <QuickBar actions={[
        { icon: "bi-plus-lg", label: "New Campaign", primary: true, onClick: () => store.openModal("campaignWizard") },
        { icon: "bi-lightning-charge", label: "Flash Sale", onClick: () => store.openModal("flashsaleWizard") },
        { icon: "bi-star", label: "Loyalty Program", onClick: () => store.openModal("loyaltyWizard") },
        { icon: "bi-pencil-square", label: "Social Post", onClick: () => store.openModal("socialComposer") },
        { icon: "bi-gift", label: "Redeem Points", onClick: () => store.openModal("redeemPoints") },
        { icon: "bi-download", label: "Export ROI", onClick: () => store.openModal("exportAnalytics") },
        { icon: "bi-question-circle", label: "Help", onClick: () => store.openModal("help") },
      ]} />
      <ModalHost />
      <ToastHost />
    </>
  );
}

export default function App({ onNavigate }: { onNavigate?: (p: any) => void }) {
  return (
    <StoreProvider>
      <Page onNavigate={onNavigate} />
    </StoreProvider>
  );
}
