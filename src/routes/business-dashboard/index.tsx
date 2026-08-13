import { createFileRoute } from "@tanstack/react-router";
import PayMoDashboard from "@/features/dashboards/business-dashboard/overview/PayMoDashboard";

// Business dashboard home (/business-dashboard) — Command Center overview.
export const Route = createFileRoute("/business-dashboard/")({
	component: PayMoDashboard,
});
