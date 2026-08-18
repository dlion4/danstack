import { createFileRoute } from "@tanstack/react-router";
import AppInsurance from "@/features/dashboards/business-dashboard/components/Insurance/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/insurance — designed Insurance & Protection. */
export const Route = createFileRoute("/business-dashboard/insurance")({
	component: InsuranceRoute,
});

function InsuranceRoute() {
	const go = useBusinessNavigate();
	return <AppInsurance onNavigate={go} />;
}
