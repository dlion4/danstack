import { createFileRoute } from "@tanstack/react-router";
import Analytics from "@/features/dashboards/transaction-dashboard/analytics/pages/Analytics";
// import Analytics from "@/features/dashboards/transaction-dashboard/analytics/pages/Analytics";

/**
 * app.analytics.tsx — Transaction Analytics.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/pm/app/analytics")({
	component: Analytics,
});
