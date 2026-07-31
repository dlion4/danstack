import { createFileRoute } from "@tanstack/react-router";
import SettingsAdministration from "@/features/dashboards/business-dashboard/settings-administration/pages/SettingsAdministration";

/**
 * business-dashboard/settings-administration.tsx — Settings, Account & Administration (Page 3.14).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/settings-administration
 */
export const Route = createFileRoute(
	"/business-dashboard/settings-administration",
)({
	component: SettingsAdministration,
});
