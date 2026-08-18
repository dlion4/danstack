import { createFileRoute } from "@tanstack/react-router";
import AppPortfolio from "@/features/dashboards/business-dashboard/components/Portfolio/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/portfolio — designed Multi-Business Portfolio. */
export const Route = createFileRoute("/business-dashboard/portfolio")({
	component: PortfolioRoute,
});

function PortfolioRoute() {
	const go = useBusinessNavigate();
	return <AppPortfolio onNavigate={go} />;
}
