import { createFileRoute } from "@tanstack/react-router";
import { UtilitiesPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/overview/pages";

/**
 * utility/index.tsx — 3.1 Utilities Command Center (/utility).
 * Child of routes/utility.tsx, so it renders INSIDE the utility shell.
 */
export const Route = createFileRoute("/utility/")({
	component: UtilitiesPage,
});
