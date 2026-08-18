import { createFileRoute } from "@tanstack/react-router";
import AppPay from "@/features/dashboards/business-dashboard/AppPay";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/pay-suppliers — designed Pay Suppliers (Money Out). */
export const Route = createFileRoute("/business-dashboard/pay-suppliers")({
	component: PaySuppliersRoute,
});

function PaySuppliersRoute() {
	const go = useBusinessNavigate();
	return <AppPay onNavigate={go} />;
}
