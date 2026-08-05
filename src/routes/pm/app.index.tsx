import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/features/Layouts/shell/pages/Dashboard";

export const Route = createFileRoute("/pm/app/")({
	component: Dashboard,
});
