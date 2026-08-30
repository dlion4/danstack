import { createFileRoute } from "@tanstack/react-router";
import Disputes from "@/features/dashboards/transaction-dashboard/disputes/pages/Disputes";

/**
 * app.disputes.tsx — Dispute & Chargeback.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 *
 * Accepts an optional `?modal=` search param so other pages can deep-link
 * directly into a specific modal on this page.
 */
export const Route = createFileRoute("/pm/app/disputes")({
	validateSearch: (search: Record<string, unknown>) => ({
		modal: typeof search.modal === "string" ? search.modal : undefined,
	}),
	component: Disputes,
});
