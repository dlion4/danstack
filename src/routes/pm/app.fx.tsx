import { createFileRoute } from "@tanstack/react-router";
import FxManagement from "@/features/dashboards/transaction-dashboard/fx/pages/FxManagement";

export const Route = createFileRoute("/pm/app/fx")({
	component: FxManagement,
});
