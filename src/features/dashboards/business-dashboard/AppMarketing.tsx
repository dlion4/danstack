import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Search, Bell, User, Settings, Building2, Sparkles, Wallet, LayoutGrid, Zap, Package, Users, Shield, Database, Puzzle } from "lucide-react";
import { StoreProvider, useStore } from "./components/Marketing/store";
import {
  CampaignsSection, GrowthAnalytics, LoyaltySection, MarketingCommandCenter, PageHeader,
  PromotionsSection, ReviewsSection, SocialCommerce, WizardsBanner,
} from "./components/Marketing/marketingSections";
import {
  ABTestWizardModal, BroadcastWizardModal, CampaignWizardModal, FeedbackWizardModal,
  FlashSaleWizardModal, LoyaltyWizardModal, ReferralWizardModal,
} from "./components/Marketing/marketingWizards";
import {
  ActivityDrawer, AttributionModal, BoostPostModal, BudgetModal, CalendarModal, CampaignDrawer,
  ExportAnalyticsModal, HelpModal, IdeasModal, InboxDrawer, IntegrationsModal, MemberDrawer,
  NpsDetailModal, RedeemPointsModal, ReviewReplyModal, RoiCalculatorModal, SegmentBuilderModal,
  ShareReferralModal, SocialComposerModal, TemplatesModal,
} from "./components/Marketing/marketingDialogs";
import { cls } from "./lib";
import { NAVIGATION, ZONES, type NavZone } from "./lib/navigation";

type NavPage = "dashboard" | "getpaid" | "paysuppliers" | "cash" | "books" | "crm" | "productstore" | "inventory" | "marketing" | "profile" | "team" | "disputes" | "notifications" | "data" | "integrations" | "portfolio" | "funding" | "insurance";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutGrid,
  Wallet,
  User,
  Building2,
  Zap,
  Sparkles,
  Settings,
  Package,
  Users,
  Shield,
  Bell,
  Database,
  Puzzle,
};

/* ---------- modal registry ---------- */
function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const props = { payload: modal.payload, onClose: closeModal };
  switch (modal.name) {
    case "campaignWizard": return <CampaignWizardModal {...props} />;
    case "flashsaleWizard": return <FlashSaleWizardModal {...props} />;
    case "loyaltyWizard": return <LoyaltyWizardModal {...props} />;
    case "referralWizard": return <ReferralWizardModal {...props} />;
    case "abtestWizard": return <ABTestWizardModal {...props} />;
    case "broadcastWizard": return <BroadcastWizardModal {...props} />;
    case "feedbackWizard": return <FeedbackWizardModal {...props} />;
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
    case "boostPost": return <BoostPostModal {...props} />;
    case "npsDetail": return <NpsDetailModal {...props} />;
    case "help": return <HelpModal {...props} />;
    case "activity": return <ActivityDrawer {...props} />;
    default: return null;
  }
}

/* ---------- page ---------- */
function PageContent() {
  const { modal, closeModal } = useStore();

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
        const okTag = active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && !["date", "checkbox", "radio", "color", "file"].includes((active as HTMLInputElement).type)));
        if (okTag) {
          const footer = document.querySelector(".modal.show .modal-footer");
          const primary = footer?.querySelector(".btn-primary, .btn-success, .btn-danger") as HTMLButtonElement | null;
          if (primary && !primary.disabled) { e.preventDefault(); primary.click(); }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  return (
    <div className="pm-content">
      <PageHeader />
      <MarketingCommandCenter />
      <CampaignsSection />
      <SocialCommerce />
      <LoyaltySection />
      <PromotionsSection />
      <ReviewsSection />
      <GrowthAnalytics />
      <WizardsBanner />

      {/* footer */}
      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1">
          <div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Page 12: Marketing &amp; Growth</div>
          <div className="pm-prod-meta">
            Built on the PayMo superapp pattern · omnichannel · ROI tracking · Kenya-first rails
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-whatsapp me-1" />WhatsApp</span>
          <span className="badge-soft blue"><i className="bi bi-instagram me-1" />Instagram</span>
          <span className="badge-soft amber"><i className="bi bi-star me-1" />Loyalty</span>
          <span className="badge-soft violet"><i className="bi bi-graph-up me-1" />ROI 21×</span>
        </div>
      </footer>
      <ModalHost />
    </div>
  );
}

export default function AppMarketing({ onNavigate }: { onNavigate?: (p: NavPage) => void }) {
  return (
    <StoreProvider>
      <Shell onNavigate={onNavigate} currentPage="marketing" />
    </StoreProvider>
  );
}

function Shell({ onNavigate, currentPage }: { onNavigate?: (p: NavPage) => void; currentPage?: NavPage }) {
  const { business, notifications, toast, toasts, dismissToast } = useStore();
  const [sideOpen, setSideOpen] = useState(false);
  const [, setBizSwitch] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState("");

  const unread = notifications.filter((n) => !n.unread).length;

  const getNavigationWithActiveState = (): NavZone => {
    return Object.fromEntries(
      Object.entries(NAVIGATION).map(([zone, items]) => [
        zone,
        items.map((item) => ({
          ...item,
          active: item.id === currentPage,
        })),
      ])
    );
  };

  const navigation = getNavigationWithActiveState();

  const getIconComponent = (iconName: string) => {
    const IconComp = ICON_MAP[iconName];
    return IconComp ? <IconComp size={16} /> : null;
  };

  return (
    <div className="pm-shell">
      {/* ══════════ SIDEBAR ══════════ */}
      {sideOpen && <div className="pm-side-backdrop" onClick={() => setSideOpen(false)} />}
      <aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Marketing & Growth</div>
          </div>
          <button className="pm-side-x" onClick={() => setSideOpen(false)}><X size={18} /></button>
        </div>

        <button className="pm-biz-switch" onClick={() => setBizSwitch(true)}>
          <span className="pm-biz-avatar">{business[0]}</span>
          <span className="flex-grow-1 text-start">
            <b>{business}</b>
            <span className="d-block pm-fs-11 pm-muted">Operating · Retail</span>
          </span>
          <ChevronDown size={14} />
        </button>

        <nav className="pm-nav">
          {Object.entries(navigation).map(([zone, items]) => (
            <div className="pm-nav-zone" key={zone}>
              <div className="pm-nav-zone-label" style={{ color: ZONES[zone] }}>{zone}</div>
              {items.map((it) => (
                <button
                  key={it.id}
                  className={cls("pm-nav-item", it.active && "pm-nav-active")}
                  onClick={() => {
                    setSideOpen(false);
                    if (it.active) return;
                    if (onNavigate) onNavigate(it.id as NavPage);
                    else toast(`Navigate to ${it.label}`, "info");
                  }}
                >
                  <span className="pm-nav-ic">{getIconComponent(it.iconName)}</span>
                  <span>{it.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-upgrade">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Zap size={14} style={{ color: "#ffd66b" }} />
              <span className="fw-bold">Omnichannel Engine</span>
            </div>
            WhatsApp, Instagram, SMS &amp; Loyalty integrated live.
          </div>
          <button className="pm-user-row" onClick={() => setUserMenu(!userMenu)}>
            <span className="pm-avatar">WM</span>
            <span className="flex-grow-1 text-start">
              <b>Wanjiku Maina</b>
              <span className="d-block pm-fs-11 pm-muted">Owner · {business}</span>
            </span>
            <ChevronDown size={12} />
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ════════ */}
      <div className="pm-main">
        <header className="pm-topbar">
          <button className="pm-burger" onClick={() => setSideOpen(true)}><Menu size={20} /></button>
          <div className="pm-crumb">Grow / <b>Marketing & Growth</b></div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-search-box d-none d-md-block">
              <Search size={16} className="pm-search-icon" />
              <input
                id="mkt-search"
                className="pm-search-input"
                placeholder="Search campaigns, audience, codes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="pm-bell" onClick={() => setBellOpen(!bellOpen)}>
              <Bell size={18} />
              {unread > 0 && <span className="pm-bell-nub">{unread}</span>}
            </button>

            <button className="pm-avatar" onClick={() => setUserMenu(!userMenu)}>WM</button>
          </div>
        </header>

        <PageContent />
      </div>

      {/* ══════════ TOASTS ══════════ */}
      <div className="pm-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`pm-toast pm-toast-${t.type}`}>
            <div className="flex-grow-1">
              {t.title && <div className="fw-bold" style={{ fontSize: "0.82rem" }}>{t.title}</div>}
              <div style={{ fontSize: "0.76rem", color: "#667085" }}>{t.msg}</div>
            </div>
            <button className="pm-toast-close" onClick={() => dismissToast(t.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

