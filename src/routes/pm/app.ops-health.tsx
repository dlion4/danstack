import { createFileRoute } from "@tanstack/react-router";
import OpsSystem from "@/features/dashboards/transaction-dashboard/system-health/pages/OpsSystem";

/**
 * app.mobile-money.tsx — Mobile Money & PSP.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/pm/app/ops-health")({
	component: OpsSystem,
});
