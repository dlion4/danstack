import { createFileRoute } from "@tanstack/react-router";
import BulkDisbursements from "@/features/dashboards/business-dashboard/bulk-disbursements/pages/BulkDisbursements";

/**
 * business-dashboard/bulk-disbursements.tsx — Bulk Disbursements.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/bulk-disbursements
 */
export const Route = createFileRoute("/business-dashboard/bulk-disbursements")({
	component: BulkDisbursements,
});
