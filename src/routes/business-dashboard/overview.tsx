import { createFileRoute } from "@tanstack/react-router";
import PayMoDashboard from "@/features/dashboards/business-dashboard/overview/PayMoDashboard";

/**
 * business-dashboard/overview.tsx — PayMo Business Overview (Command Center).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/overview
 */
export const Route = createFileRoute("/business-dashboard/overview")({
	component: PayMoDashboard,
});
