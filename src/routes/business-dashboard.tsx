import { createFileRoute } from "@tanstack/react-router";
import BusinessAppLayout from "@/features/dashboards/business-dashboard/components/layout/BusinessAppLayout";

/**
 * business-dashboard.tsx — LAYOUT route for the designed PayMo Business pages.
 * ----------------------------------------------------------------------------
 * Mirrors routes/utility.tsx: this route adds the "/business-dashboard" prefix
 * and hosts every designed module page below. Each page keeps its own designed
 * shell (sidebar + topbar) so the original theme is not wrapped or restyled.
 */
export const Route = createFileRoute("/business-dashboard")({
	component: BusinessAppLayout,
});
