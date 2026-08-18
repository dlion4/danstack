import { createFileRoute } from "@tanstack/react-router";
import {
	AlertsSection,
	TransactionsSection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-command-center/components/sectionsB";
import {
	AnalyticsSection,
	ProgramSection,
	SecuritySection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-command-center/components/sectionsC";
import {
	CardsSection,
	OverviewSection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-command-center/pages";

/**
 * index.tsx — /cards/app landing page: Card Command Center (Module 5.1).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute("/cards/app/")({
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
