import { createFileRoute } from "@tanstack/react-router";
import {
	AnalyticsOverview,
	ConcentrationSection,
	CorporateSpendSection,
	InsightsSection,
	IssuanceSection,
	ReportBuilderModal,
	RevenueSection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-analytics-reporting/pages";

/**
 * app.card-analytics-reporting.tsx — Analytics & Reporting (Module 5.8).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
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
