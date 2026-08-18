import { createFileRoute } from "@tanstack/react-router";
import AppCrm from "@/features/dashboards/business-dashboard/AppCrm";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/crm — designed Customers & CRM. */
export const Route = createFileRoute("/business-dashboard/crm")({
	component: CrmRoute,
});

function CrmRoute() {
	const go = useBusinessNavigate();
	return <AppCrm onNavigate={go} />;
}
