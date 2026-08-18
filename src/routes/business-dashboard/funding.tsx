import { createFileRoute } from "@tanstack/react-router";
import AppFunding from "@/features/dashboards/business-dashboard/components/Funding/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/funding — designed Funding & Credit. */
export const Route = createFileRoute("/business-dashboard/funding")({
	component: FundingRoute,
});

function FundingRoute() {
	const go = useBusinessNavigate();
	return <AppFunding onNavigate={go} />;
}
