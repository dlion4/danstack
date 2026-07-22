import { createFileRoute } from "@tanstack/react-router";
import Reconciliation from "@/features/transaction-dashboard/reconciliation/pages/Reconciliation";

/**
 * app.reconciliation.tsx — Reconciliation Center (Page 1.6).
 * Child of routes/app.tsx, so it renders INSIDE the app shell
 * (sidebar + top nav + right aside stay fixed; only this body swaps in).
 */
export const Route = createFileRoute("/transaction_dashboard/app/reconciliation")({
	component: Reconciliation,
});
