import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsOverview, IssuanceSection, RevenueSection, ConcentrationSection, CorporateSpendSection, InsightsSection, ReportBuilderModal } from "../../../features/card-dashboard/card-analytics-reporting/pages";

export const Route = createFileRoute("/cards/app/card-analytics-reporting")({
	component: CardAnalyticsReporting,
});

function CardAnalyticsReporting() {
	return (
		<>
			<AnalyticsOverview />
			<IssuanceSection />
			<RevenueSection />
			<ConcentrationSection />
			<CorporateSpendSection />
			<InsightsSection />
			<ReportBuilderModal />
		</>
	);
}
