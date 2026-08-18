import { createFileRoute } from "@tanstack/react-router";
import AppTeam from "@/features/dashboards/business-dashboard/components/Team/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/team — designed Team & Roles. */
export const Route = createFileRoute("/business-dashboard/team")({
	component: TeamRoute,
});

function TeamRoute() {
	const go = useBusinessNavigate();
	return <AppTeam onNavigate={go} />;
}
