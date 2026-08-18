import { createFileRoute } from "@tanstack/react-router";
import AppCash from "@/features/dashboards/business-dashboard/AppCash";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/cash — designed Cash & Accounts. */
export const Route = createFileRoute("/business-dashboard/cash")({
	component: CashRoute,
});

function CashRoute() {
	const go = useBusinessNavigate();
	return <AppCash onNavigate={go} />;
}
