import { createFileRoute } from "@tanstack/react-router";
import { OverviewSection, CardsSection, AlertsSection, TransactionsSection, SecuritySection, AnalyticsSection, ProgramSection } from "../../../features/card-dashboard/card-command-center/pages";

export const Route = createFileRoute("/cards/app/card-command-center")({
	component: CardCommandCenter,
});

function CardCommandCenter() {
	return (
		<>
			<OverviewSection />
			<CardsSection />
			<AlertsSection />
			<TransactionsSection />
			<SecuritySection />
			<AnalyticsSection />
			<ProgramSection />
		</>
	);
}
