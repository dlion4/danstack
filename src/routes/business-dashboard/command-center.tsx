import { createFileRoute } from "@tanstack/react-router";
import CommandCenter from "@/features/business-dashboard/command-center/pages/CommandCenter";

/**
 * business-dashboard/command-center.tsx — Business Command Center (Page 3.1).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/command-center
 */
export const Route = createFileRoute("/business-dashboard/command-center")({
	component: CommandCenter,
});
