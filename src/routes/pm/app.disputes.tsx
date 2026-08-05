import { createFileRoute } from "@tanstack/react-router";
import Disputes from "@/features/dashboards/transaction-dashboard/disputes/pages/Disputes";

export const Route = createFileRoute("/pm/app/disputes")({
	component: Disputes,
});
