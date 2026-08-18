/* ============================================================================
 * CardsShell.tsx — the PayMo BAAS Card Dashboard shell (modules 5.1 – 5.10).
 * ----------------------------------------------------------------------------
 * Owns the full layout composition for /cards/app/* and renders child pages
 * into <Outlet /> — the same pattern the transactions dashboard uses in
 * routes/pm/app.tsx -> features/Layouts/shell/components/AppShell.
 *
 *   src/routes/cards/app.tsx            renders <CardsShell /> (layout route)
 *   src/routes/cards/app/<module>.tsx   renders one designed module page each
 *
 * Composition:
 *   - AppProvider (card feature store) + URL <-> store page sync
 *   - fixed dark sidebar (SidebarContent) on desktop, drawer on mobile
 *   - sticky Topbar, QuickBar, ToastViewport
 *   - every shared modal/drawer host (they self-hide via store state)
 *   - the scoped card theme stylesheet (features/card-dashboard/styles)
 *
 * The page designs (features/card-dashboard/<module>/pages) are rendered
 * untouched inside <Outlet /> — all theme fonts, colors and styles intact.
 * ========================================================================== */

import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import "../../features/card-dashboard/styles/index.css";
import { AppProvider, type PageId, ToastViewport, useApp } from "../../lib";
import {
	CardDrawer,
	ConfigureAlertsModal,
	DisputeModal,
	FraudWizardModal,
	FreezeAllModal,
	FreezeModal,
	IssueCardModal,
	LimitsDrawer,
	PinModal,
	ShortcutsModal,
	SupportDrawer,
} from "../modals";
import { MobileNav, QuickBar, SidebarContent, Topbar } from "./Shell";

/* ---------------- URL <-> module (PageId) mapping ---------------- */

const PAGE_PATH: Record<PageId, string> = {
	"5.1": "/cards/app",
	"5.2": "/cards/app/physical-debit-cards",
	"5.3": "/cards/app/virtual-debit-cards",
	"5.4": "/cards/app/virtual-credit-cards",
	"5.5": "/cards/app/prepaid-card-management",
	"5.6": "/cards/app/corporate-business-cards",
	"5.7": "/cards/app/card-security-fraud-prevention",
	"5.8": "/cards/app/card-analytics-reporting",
	"5.9": "/cards/app/card-program-administration",
	"5.10": "/cards/app/card-settings-support",
};

function pathToPage(pathname: string): PageId | null {
	if (
		pathname === "/cards/app" ||
		pathname === "/cards/app/" ||
		pathname === "/cards/app/card-command-center"
	) {
		return "5.1";
	}
	const last = pathname.split("/").filter(Boolean).pop();
	switch (last) {
		case "physical-debit-cards":
			return "5.2";
		case "virtual-debit-cards":
			return "5.3";
		case "virtual-credit-cards":
			return "5.4";
		case "prepaid-card-management":
			return "5.5";
		case "corporate-business-cards":
			return "5.6";
		case "card-security-fraud-prevention":
			return "5.7";
		case "card-analytics-reporting":
			return "5.8";
		case "card-program-administration":
			return "5.9";
		case "card-settings-support":
			return "5.10";
		default:
			return null;
	}
}

/* ---------------- URL -> store sync ----------------
   Keeps the sidebar module list, breadcrumb, quick actions and in-page nav
   in sync with the active route (deep links, back/forward, Hub links). */

function PageSync() {
	const { page, setPage } = useApp();
	const pathname = useRouterState({ select: (st) => st.location.pathname });

	useEffect(() => {
		const next = pathToPage(pathname);
		if (next && next !== page) setPage(next);
	}, [pathname, page, setPage]);

	return null;
}

/* ---------------- shell ---------------- */

export default function CardsShell() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (st) => st.location.pathname });

	// store -> URL: every setPage() call (sidebar module list, page hero
	// "module ->" buttons, keyboard shortcuts) navigates to that module's route.
	const handlePageChange = useCallback(
		(p: PageId) => {
			const to = PAGE_PATH[p];
			if (pathname !== to) navigate({ to });
		},
		[navigate, pathname],
	);

	return (
		<AppProvider onPageChange={handlePageChange}>
			<div className="pm-cards-shell">
				{/* ============ SIDEBAR (desktop) ============ */}
				<aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">
					<div className="side-glow h-full">
						<SidebarContent />
					</div>
				</aside>

				{/* ============ CONTENT COLUMN ============ */}
				<div className="flex min-h-screen flex-col lg:pl-[264px]">
					<Topbar />
					<main className="flex-1 px-4 pb-40 pt-4 sm:px-6 lg:px-8">
						{/* Each /cards/app/<module> route renders its designed page here */}
						<Outlet />
					</main>
				</div>

				{/* ============ MOBILE NAV DRAWER ============ */}
				<MobileNav />

				{/* ============ QUICK ACTIONS BAR ============ */}
				<QuickBar />

				{/* ============ SHARED MODAL / DRAWER HOSTS ============ */}
				{/* Each host reads the store and returns null unless it is the active
            modal/drawer, so rendering them all here is safe and keeps every
            designed dialog available from any module page. */}
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

				{/* ============ TOASTS ============ */}
				<ToastViewport />

				{/* ============ URL -> STORE PAGE SYNC ============ */}
				<PageSync />
			</div>
		</AppProvider>
	);
}
