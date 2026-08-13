import { createFileRoute } from "@tanstack/react-router";
import AppsIntegrations from "@/features/dashboards/business-dashboard/apps-integrations/AppsIntegrations";

/**
 * business-dashboard/apps-integrations.tsx — Apps & Integrations (Page 13).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/apps-integrations
 */
export const Route = createFileRoute("/business-dashboard/apps-integrations")({
	component: AppsIntegrations,
});
