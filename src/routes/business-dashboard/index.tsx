import { createFileRoute } from "@tanstack/react-router";
import PayMoDashboard from "@/features/dashboards/business-dashboard/overview/PayMoDashboard";

/**
 * business-dashboard/index.tsx — Command Center overview (/business-dashboard).
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 */
export const Route = createFileRoute("/business-dashboard/")({
	component: PayMoDashboard,
});
