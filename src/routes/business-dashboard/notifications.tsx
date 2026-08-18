import { createFileRoute } from "@tanstack/react-router";
import AppNotifications from "@/features/dashboards/business-dashboard/components/notifications/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/notifications — designed Notifications Center. */
export const Route = createFileRoute("/business-dashboard/notifications")({
	component: NotificationsRoute,
});

function NotificationsRoute() {
	const go = useBusinessNavigate();
	return <AppNotifications onNavigate={go} />;
}
