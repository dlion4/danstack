import { createFileRoute } from "@tanstack/react-router";
import AppGetpaid from "@/features/dashboards/business-dashboard/AppGetpaid";
import {
	takePendingAction,
	useBusinessNavigate,
} from "@/features/dashboards/business-dashboard/lib/routes";

/**
 * /business-dashboard/get-paid — designed Get Paid (Money In).
 */
export const Route = createFileRoute("/business-dashboard/get-paid")({
	component: GetPaidRoute,
});

function GetPaidRoute() {
	const go = useBusinessNavigate();
	return (
		<AppGetpaid onNavigate={go} pendingAction={takePendingAction()} />
	);
}
