import { createFileRoute } from "@tanstack/react-router";
import TreasuryCash from "@/features/dashboards/business-dashboard/treasury-cash/pages/TreasuryCash";

/**
 * business-dashboard/treasury-cash.tsx — Treasury & Cash Management.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/treasury-cash
 */
export const Route = createFileRoute("/business-dashboard/treasury-cash")({
	component: TreasuryCash,
});
