import { createFileRoute } from "@tanstack/react-router";
import OpenBanking from "@/features/dashboards/business-dashboard/open-banking/pages/OpenBanking";

/**
 * business-dashboard/open-banking.tsx — Open Banking & Account Aggregation.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/open-banking
 */
export const Route = createFileRoute("/business-dashboard/open-banking")({
	component: OpenBanking,
});
