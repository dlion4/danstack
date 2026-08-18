import { createFileRoute } from "@tanstack/react-router";
import InvoicingBilling from "@/features/dashboards/business-dashboard/invoicing-billing/pages/InvoicingBilling";

/**
 * business-dashboard/invoicing-billing.tsx — Invoicing & Billing.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/invoicing-billing
 */
export const Route = createFileRoute("/business-dashboard/invoicing-billing")({
	component: InvoicingBilling,
});
