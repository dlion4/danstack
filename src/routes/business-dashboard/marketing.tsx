import { createFileRoute } from "@tanstack/react-router";
import AppMarketing from "@/features/dashboards/business-dashboard/components/Marketing/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/marketing — designed Marketing & Growth. */
export const Route = createFileRoute("/business-dashboard/marketing")({
	component: MarketingRoute,
});

function MarketingRoute() {
	const go = useBusinessNavigate();
	return <AppMarketing onNavigate={go} />;
}
