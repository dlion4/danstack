import { createFileRoute } from "@tanstack/react-router";
import BusinessShell from "@/features/Layouts/dashboard-business-layout/components/BusinessShell";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/features/dashboards/business-dashboard/index.css";

/**
 * business-dashboard.tsx — LAYOUT route for the PayMo Business pages.
 * ----------------------------------------------------------------------------
 * Uses BusinessShell (the themed layout shell) with Bootstrap and business
 * dashboard CSS imported at the route level. This ensures:
 * - Business pages have access to Bootstrap utilities
 * - Business pages retain their original styles via index.css
 * - The layout shell (sidebar, header) is themed to match new design
 * - No style conflicts between shell and page content (Bootstrap overrides are scoped)
 */
export const Route = createFileRoute("/business-dashboard")({
	component: BusinessShell,
});
