import { createFileRoute } from "@tanstack/react-router";
import DeveloperDashboard from "@/features/dev-dashboard/developer-dashboard/pages/DeveloperDashboard";

// 4.1 — Developer Dashboard & Project Management.
export const Route = createFileRoute("/dev-dashboard/developer-dashboard")({
	component: DeveloperDashboard,
});
