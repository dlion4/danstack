import { createFileRoute } from "@tanstack/react-router";
import Liquidity from "@/features/dashboards/transaction-dashboard/liquidity/pages/Liquidity";

/**
 * app.liquidity.tsx — Liquidity & Float Management (Page 1.5).
 * Child of routes/app.tsx, so it renders INSIDE the app shell
 * (sidebar + top nav + right aside stay fixed; only this body swaps in).
 *
 * Accepts an optional `?business=` search param (land | co2) so other pages
 * (e.g. Reconciliation float-link chips) can deep-link directly into the
 * business float workspace filtered to one business.
 */
export const Route = createFileRoute("/pm/app/liquidity")({
	validateSearch: (search: Record<string, unknown>): { business?: "land" | "co2" } => ({
		business:
			typeof search.business === "string" &&
			(search.business === "land" || search.business === "co2")
				? search.business
				: undefined,
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { business } = Route.useSearch();
	return <Liquidity initialBusiness={business} />;
}
