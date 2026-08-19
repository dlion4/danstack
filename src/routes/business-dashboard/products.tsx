import { createFileRoute } from "@tanstack/react-router";
import AppProductstore from "@/features/dashboards/business-dashboard/components/Productstore/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/products — designed Products & Store. */
export const Route = createFileRoute("/business-dashboard/products")({
	component: ProductsRoute,
});

function ProductsRoute() {
	const go = useBusinessNavigate();
	return <AppProductstore onNavigate={go} />;
}
