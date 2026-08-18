import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/settings/pages";

/**
 * utility/settings.tsx — 3.6 Utility Settings & Automation (/utility/settings).
 * Child of routes/utility.tsx, so it renders INSIDE the utility shell.
 */
export const Route = createFileRoute("/utility/settings")({
	component: SettingsPage,
});
