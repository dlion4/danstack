import { createFileRoute } from "@tanstack/react-router";
import CommandCenter from "@/features/dashboards/business-dashboard/command-center/pages/CommandCenter";

/**
 * business-dashboard/command-center.tsx — Business Command Center (Page 3.1).
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/command-center
 */
export const Route = createFileRoute("/business-dashboard/command-center")({
	component: CommandCenter,
});
