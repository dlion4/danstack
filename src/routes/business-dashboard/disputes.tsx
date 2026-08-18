import { createFileRoute } from "@tanstack/react-router";
import AppDispute from "@/features/dashboards/business-dashboard/components/dispute/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/disputes — designed Disputes & Support. */
export const Route = createFileRoute("/business-dashboard/disputes")({
	component: DisputesRoute,
});

function DisputesRoute() {
	const go = useBusinessNavigate();
	return <AppDispute onNavigate={go} />;
}
