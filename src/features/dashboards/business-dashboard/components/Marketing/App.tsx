import { useEffect, useState } from "react";
import "./marketing.css";
import { StoreProvider, useStore } from "./store";
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
      <PageHeader />
      <MarketingCommandCenter />
      <CampaignsSection />
      <PromotionsSection />
      <LoyaltySection />
      <SocialCommerce />
      <GrowthAnalytics />
      <ReviewsSection />
      <WizardsBanner />

      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 12: Marketing &amp; Growth</div>
          <div className="pm-prod-meta">
            Multi-channel campaigns · Loyalty programs · Social commerce · Analytics
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-megaphone me-1" />8 active campaigns</span>
          <span className="badge-soft blue"><i className="bi bi-people me-1" />2.4K engaged</span>
          <span className="badge-soft amber"><i className="bi bi-star me-1" />4.8 avg rating</span>
          <span className="badge-soft violet"><i className="bi bi-graph-up-arrow me-1" />+34% conversion</span>
        </div>
      </footer>
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
