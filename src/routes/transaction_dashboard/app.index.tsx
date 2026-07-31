import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/features/Layouts/shell/pages/Dashboard";

export const Route = createFileRoute("/transaction_dashboard/app/")({
	component: Dashboard,
});
