import { createFileRoute } from "@tanstack/react-router";
import TreasuryCash from "@/features/dashboards/business-dashboard/treasury-cash/pages/TreasuryCash";

/**
 * business-dashboard/treasury-cash.tsx — Treasury, Cash Management & Forex (Page 3.7).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/treasury-cash
 */
export const Route = createFileRoute("/business-dashboard/treasury-cash")({
	component: TreasuryCash,
});
