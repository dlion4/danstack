import { createFileRoute } from "@tanstack/react-router";
import InvoicingBilling from "@/features/business-dashboard/invoicing-billing/pages/InvoicingBilling";

/**
 * business-dashboard/invoicing-billing.tsx — Invoicing & Billing (Page 3.4).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/invoicing-billing
 */
export const Route = createFileRoute("/business-dashboard/invoicing-billing")({
	component: InvoicingBilling,
});
