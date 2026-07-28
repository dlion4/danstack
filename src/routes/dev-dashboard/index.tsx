import { createFileRoute } from "@tanstack/react-router";
import DeveloperDashboard from "@/features/dev-dashboard/developer-dashboard/pages/DeveloperDashboard";

// 4.1 — Developer Dashboard is the dev-dashboard overview (/dev-dashboard).
export const Route = createFileRoute("/dev-dashboard/")({
	component: DeveloperDashboard,
});
