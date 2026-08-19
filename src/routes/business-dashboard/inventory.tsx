import { createFileRoute } from "@tanstack/react-router";
import AppOnlinestore from "@/features/dashboards/business-dashboard/components/Onlinestore/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/inventory — designed Inventory & Stock. */
export const Route = createFileRoute("/business-dashboard/inventory")({
	component: InventoryRoute,
});

function InventoryRoute() {
	const go = useBusinessNavigate();
	return <AppOnlinestore onNavigate={go} />;
}
