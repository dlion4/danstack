import { createFileRoute } from "@tanstack/react-router";
import AppIntegration from "@/features/dashboards/business-dashboard/components/Intergration/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/integrations — designed Apps & Integrations. */
export const Route = createFileRoute("/business-dashboard/integrations")({
	component: IntegrationsRoute,
});

function IntegrationsRoute() {
	const go = useBusinessNavigate();
	return <AppIntegration onNavigate={go} />;
}
