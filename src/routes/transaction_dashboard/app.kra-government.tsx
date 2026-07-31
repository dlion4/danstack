import { createFileRoute } from "@tanstack/react-router";
import KraGovernment from "@/features/dashboards/transaction-dashboard/kra-government/pages/KraGovernment";

export const Route = createFileRoute(
	"/transaction_dashboard/app/kra-government",
)({
	component: KraGovernment,
});
