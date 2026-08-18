import { createFileRoute } from "@tanstack/react-router";
import AppData from "@/features/dashboards/business-dashboard/components/Data/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/data — designed Data & Privacy. */
export const Route = createFileRoute("/business-dashboard/data")({
	component: DataRoute,
});

function DataRoute() {
	const go = useBusinessNavigate();
	return <AppData onNavigate={go} />;
}
