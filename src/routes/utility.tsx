import { createFileRoute } from "@tanstack/react-router";
import UtilityShell from "@/features/dashboards/utility-dashboard/components/layout/UtilityShell";

/**
 * utility.tsx — LAYOUT route for the Utility Dashboard shell.
 * ----------------------------------------------------------------------------
 * Renders the utility-dashboard shell (dark sidebar + topbar + palette +
 * toasts + every shared wizard/modal/drawer host).
 * Child routes (/utility/<module>) render via <Outlet /> inside the shell.
 */
export const Route = createFileRoute("/utility")({
	component: UtilityLayout,
});

function UtilityLayout() {
	return <UtilityShell />;
}
