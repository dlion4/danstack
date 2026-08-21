/* ============================================================================
 * UtilityShell.tsx — the PayMo BAAS Utility Dashboard shell (modules 3.1 – 3.7).
 * ----------------------------------------------------------------------------
 * Owns the full layout composition for /utility/* and renders child pages
 * into <Outlet /> — the same pattern the cards dashboard uses in
 * routes/cards/app.tsx -> features/dashboards/card-dashboard/.../CardsShell
 * and the transactions dashboard uses in routes/pm/app.tsx -> AppShell.
 *
 *   src/routes/utility.tsx              renders <UtilityShell /> (layout route)
 *   src/routes/utility/<module>.tsx     renders one designed module page each
 *
 * Composition:
 *   - AppProvider (utility feature store) wrapping the designed shell
 *   - dark sidebar + topbar + palette + notifications (Shell.tsx)
 *   - every shared wizard/modal/drawer host (they self-hide via store state)
 *   - the scoped utility theme stylesheet (features/utility-dashboard/styles)
 *
 * The page designs (features/utility-dashboard/<module>/pages) are rendered
 * untouched inside <Outlet /> — all theme fonts, colors and styles intact.
 * ========================================================================== */

import { Outlet } from "@tanstack/react-router";
import "../../features/utility-dashboard/styles/index.scss";
import { AppProvider, useApp } from "../../lib";
import {
	AutopayDrawer,
	ExportModal,
	HelpModal,
	HistoryDrawer,
	ModuleModal,
	RemoveModal,
	RenameModal,
	ReportModal,
	TariffModal,
	TxnDrawer,
} from "../dialogs";
import { AddAccountWizard, BuyWizard, TopUpModal } from "../modals";
import { ToastHost } from "../ui";
import { Shell } from "./Shell";

/* ---------------- shared dialog hosts ----------------
   The original App.tsx rendered every dialog host once under the shell so any
   page can open any dialog. Each host reads the store and returns null unless
   it is the active dialog — rendering them all here keeps that composition. */

function Dialogs() {
	return (
		<>
			<BuyWizard />
			<AddAccountWizard />
			<TopUpModal />
			<TxnDrawer />
			<HistoryDrawer />
			<ExportModal />
			<AutopayDrawer />
			<RenameModal />
			<RemoveModal />
			<ModuleModal />
			<HelpModal />
			<TariffModal />
			<ReportModal />
		</>
	);
}

/* ---------------- toasts (reads the store inside the provider) ---------------- */

function ShellToasts() {
	const { toasts, dismiss } = useApp();
	return <ToastHost toasts={toasts} dismiss={dismiss} />;
}

/* ---------------- shell ---------------- */

export default function UtilityShell() {
	return (
		<AppProvider>
			<div className="pm-utility-shell">
				<Shell>
					{/* Each /utility/<module> route renders its designed page here */}
					<Outlet />
					<Dialogs />
					<ShellToasts />
				</Shell>
			</div>
		</AppProvider>
	);
}
