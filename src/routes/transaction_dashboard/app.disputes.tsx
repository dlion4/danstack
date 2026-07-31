import { createFileRoute } from "@tanstack/react-router";
import Disputes from "@/features/dashboards/transaction-dashboard/disputes/pages/Disputes";

export const Route = createFileRoute("/transaction_dashboard/app/disputes")({
	component: Disputes,
});
