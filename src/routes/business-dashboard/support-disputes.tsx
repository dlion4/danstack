import { createFileRoute } from "@tanstack/react-router";
import SupportDisputes from "@/features/dashboards/business-dashboard/support-disputes/pages/SupportDisputes";

/**
 * business-dashboard/support-disputes.tsx — Support, Disputes & Refunds Center (Page 3.13).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/support-disputes
 */
export const Route = createFileRoute("/business-dashboard/support-disputes")({
	component: SupportDisputes,
});
