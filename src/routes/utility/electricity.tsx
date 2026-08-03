import { createFileRoute } from "@tanstack/react-router";
import ElectricityManagement from "@/features/dashboards/utility-dashboard/electricity/pages/ElectricityManagement";

// 3.2 — Electricity Management Explore (named route wins over /utility/$module).
export const Route = createFileRoute("/utility/electricity")({
	component: ElectricityManagement,
});
