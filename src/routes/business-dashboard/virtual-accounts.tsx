import { createFileRoute } from "@tanstack/react-router";
import VirtualAccounts from "@/features/dashboards/business-dashboard/virtual-accounts/pages/VirtualAccounts";

/**
 * business-dashboard/virtual-accounts.tsx — Virtual Accounts & Sub-Accounts.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/virtual-accounts
 */
export const Route = createFileRoute("/business-dashboard/virtual-accounts")({
	component: VirtualAccounts,
});
