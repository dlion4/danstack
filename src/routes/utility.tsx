import { createFileRoute } from "@tanstack/react-router";
import UtilityShell from "@/features/dashboards/utility-dashboard/components/layout/UtilityShell";

/**
 * utility.tsx — LAYOUT route for the Utility Dashboard shell.
 * ----------------------------------------------------------------------------
 * Mirrors routes/cards/app.tsx (the cards shell) and routes/pm/app.tsx (the
 * transactions shell): this route adds the "/utility" prefix and renders the
 * designed utility dashboard shell (dark sidebar + topbar + palette + toasts +
 * every shared wizard/modal/drawer host), whose <Outlet /> hosts every
 * /utility/<module> page below.
 */
export const Route = createFileRoute("/utility")({
	component: UtilityLayout,
});

function UtilityLayout() {
	// UtilityShell renders its own <Outlet /> for the child module pages.
	return <UtilityShell />;
}
