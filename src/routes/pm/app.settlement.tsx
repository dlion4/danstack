import { createFileRoute } from "@tanstack/react-router";
import Settlement from "@/features/dashboards/transaction-dashboard/settlement/pages/Settlement";

/**
 * app.settlement.tsx — Settlement & Clearing.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/pm/app/settlement")({
	component: Settlement,
});
