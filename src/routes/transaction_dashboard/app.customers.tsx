import { createFileRoute } from "@tanstack/react-router";
import Customers from "@/features/dashboards/transaction-dashboard/customers/pages/Customers";

export const Route = createFileRoute("/transaction_dashboard/app/customers")({
	component: Customers,
});
