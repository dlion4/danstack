import { createFileRoute } from "@tanstack/react-router";
import FxManagement from "@/features/dashboards/transaction-dashboard/fx/pages/FxManagement";

export const Route = createFileRoute("/transaction_dashboard/app/fx")({
	component: FxManagement,
});
