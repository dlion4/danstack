import { createFileRoute } from "@tanstack/react-router";
import GetPaid from "@/features/dashboards/business-dashboard/get-paid/GetPaid";

/**
 * business-dashboard/get-paid.tsx — Get Paid (Money In).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/get-paid
 */
export const Route = createFileRoute("/business-dashboard/get-paid")({
	component: GetPaid,
});
