import { createFileRoute } from "@tanstack/react-router";
import Settlement from "@/features/dashboards/transaction-dashboard/settlement/pages/Settlement";

/**
 * app.settlement.tsx — Settlement & Clearing.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 *
 * Accepts an optional `?modal=` search param so other pages (e.g. Liquidity)
 * can deep-link directly into a specific modal on this page.
 */
export const Route = createFileRoute("/pm/app/settlement")({
	validateSearch: (search: Record<string, unknown>) => ({
		modal: typeof search.modal === "string" ? search.modal : undefined,
	}),
	component: Settlement,
});
