import { createFileRoute } from "@tanstack/react-router";
import Account from "@/features/dashboards/transaction-dashboard/account/page/AccountProfile";

/**
 * app.account.tsx — Account / Profile.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/transaction_dashboard/app/account")({
    component: Account,
});