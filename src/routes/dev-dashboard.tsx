import { createFileRoute } from "@tanstack/react-router";
import DevShell from "@/features/Layouts/dashboard-dev-layout/components/DevShell";

/**
 * /dev-dashboard — layout route for the Developer Portal deep-dive pages
 * (4.1 Dashboard, 4.2 API Reference, 4.3 Webhooks & Events).
 *
 * Reuses the existing DevShell chrome (sidebar + header + right aside +
 * toasts) exactly like /business-dashboard reuses BusinessShell, so the pages
 * inherit the same responsive shell behaviour instead of re-implementing it.
 */
export const Route = createFileRoute("/dev-dashboard")({
	component: DevDashboardLayout,
});

function DevDashboardLayout() {
	return <DevShell />;
}
