import { createFileRoute } from "@tanstack/react-router";
import {
	BalancesSection,
	ControlsSection,
	PrepaidActivitySection,
	PrepaidCardsSection,
	PrepaidFeesSection,
	PrepaidIssueModal,
	PrepaidManageDrawer,
	PrepaidOverview,
	TopupModal,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/prepaid-card-management/pages";

/**
 * app.prepaid-card-management.tsx — Prepaid Cards (Module 5.5).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute("/cards/app/prepaid-card-management")({
	component: PrepaidCardManagement,
});

function PrepaidCardManagement() {
	return (
		<>
			<PrepaidOverview />
			<PrepaidCardsSection />
			<BalancesSection />
			<ControlsSection />
			<PrepaidActivitySection />
			<PrepaidFeesSection />
			<PrepaidIssueModal />
			<TopupModal />
			<PrepaidManageDrawer />
		</>
	);
}
