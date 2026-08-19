import { useState } from "react";
import AppDashboard from "./AppDashboard";
import AppProductstore from "./components/Productstore/App";
import AppOnlinestore from "./components/Onlinestore/App";
import AppMarketing from "./components/Marketing/App";
import AppProfile from "./components/Profile/App";
import AppTeam from "./components/Team/App";
import AppDispute from "./components/dispute/App";
import AppNotifications from "./components/notifications/App";
import AppData from "./components/Data/App";
import AppIntegration from "./components/Intergration/App";
import AppPortfolio from "./components/Portfolio/App";
import AppFunding from "./components/Funding/App";
import AppInsurance from "./components/Insurance/App";
import type { QAction } from "./lib";

export type PageId =
  | "dashboard" | "productstore" | "inventory" | "marketing"
  | "profile" | "team" | "disputes" | "notifications" | "data"
  | "integrations" | "portfolio" | "funding" | "insurance";

export default function Root() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [pending, setPending] = useState<QAction>(null);

  const go = (p: PageId, anchor?: string, action?: QAction) => {
    setPending(action ?? null);
    setPage(p);
    window.scrollTo(0, 0);
    if (anchor) {
      window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  return page === "dashboard" ? <AppDashboard onNavigate={go} />
    : page === "productstore" ? <AppProductstore onNavigate={go} />
    : page === "inventory" ? <AppOnlinestore onNavigate={go} />
    : page === "marketing" ? <AppMarketing onNavigate={go} />
    : page === "profile" ? <AppProfile onNavigate={(p) => go(p as PageId)} />
    : page === "team" ? <AppTeam onNavigate={(p) => go(p as PageId)} />
    : page === "disputes" ? <AppDispute onNavigate={(p) => go(p as PageId)} />
    : page === "notifications" ? <AppNotifications onNavigate={(p) => go(p as PageId)} />
    : page === "data" ? <AppData onNavigate={(p) => go(p as PageId)} />
    : page === "integrations" ? <AppIntegration onNavigate={(p) => go(p as PageId)} />
    : page === "funding" ? <AppFunding onNavigate={(p) => go(p as PageId)} />
    : page === "insurance" ? <AppInsurance onNavigate={(p) => go(p as PageId)} />
    : <AppPortfolio onNavigate={(p) => go(p as PageId)} />;
}
