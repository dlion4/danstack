import { createFileRoute } from "@tanstack/react-router";
import AccountsPayable from "@/features/dashboards/business-dashboard/accounts-payable/pages/AccountsPayable";

/**
 * business-dashboard/accounts-payable.tsx — Accounts Payable & Suppliers.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/accounts-payable
 */
export const Route = createFileRoute("/business-dashboard/accounts-payable")({
	component: AccountsPayable,
});
