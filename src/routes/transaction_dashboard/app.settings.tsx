import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/features/dashboards/transaction-dashboard/settings/page/AccountSettings";

/**
 * app.settings.tsx — Settings.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/transaction_dashboard/app/settings")({
    component: Settings,
});