import { createFileRoute } from "@tanstack/react-router";
import Fees from "@/features/dashboards/transaction-dashboard/fees/pages/Fees";

export const Route = createFileRoute("/pm/app/fees")({
	component: Fees,
});
