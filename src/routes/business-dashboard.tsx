import { createFileRoute } from "@tanstack/react-router";
import BusinessShell from "@/features/Layouts/dashboard-business-layout/components/BusinessShell";

/**
 * business-dashboard.tsx — LAYOUT route for the Business Dashboard shell.
 * ----------------------------------------------------------------------------
 * Mirrors routes/utility.tsx and routes/cards/app.tsx: this route adds the
 * "/business-dashboard" prefix and renders the designed BusinessShell
 * (sidebar + header + page bar + toasts + drawers), whose <Outlet /> hosts
 * every /business-dashboard/<module> page below.
 */
export const Route = createFileRoute("/business-dashboard")({
	component: BusinessDashboardLayout,
});

function BusinessDashboardLayout() {
	// BusinessShell renders its own <Outlet /> for the child module pages.
	return <BusinessShell />;
}
