import { createFileRoute } from "@tanstack/react-router";
import AppDashboard from "@/features/dashboards/business-dashboard/AppDashboard";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/**
 * /business-dashboard — designed Dashboard Overview (Page 0).
 * Child of routes/business-dashboard.tsx.
 */
export const Route = createFileRoute("/business-dashboard/")({
	component: DashboardRoute,
});

function DashboardRoute() {
	const go = useBusinessNavigate();
	return <AppDashboard onNavigate={go} />;
}
