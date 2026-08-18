import { createFileRoute } from "@tanstack/react-router";
import MultiCurrencyTreasury from "@/features/dashboards/business-dashboard/multi-currency-treasury/pages/MultiCurrencyTreasury";

/**
 * business-dashboard/multi-currency-treasury.tsx — Multi-Currency Treasury & FX.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/multi-currency-treasury
 */
export const Route = createFileRoute(
	"/business-dashboard/multi-currency-treasury",
)({
	component: MultiCurrencyTreasury,
});
