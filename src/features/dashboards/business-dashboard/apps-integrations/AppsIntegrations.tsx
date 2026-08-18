/* ============================================================================\n * AppsIntegrations.tsx — /business-dashboard/apps-integrations (Page 13).
 * ----------------------------------------------------------------------------
 * The designed BAAS module set does not ship a standalone Apps page; the
 * Integrations workspace in the business layout is the matching destination.
 * Renders inside BusinessShell via <Outlet />.
 * ========================================================================== */

import BusinessModulePage from "@/features/Layouts/dashboard-business-layout/pages/BusinessModulePage";

export default function AppsIntegrations() {
	return <BusinessModulePage module="integrations" />;
}
