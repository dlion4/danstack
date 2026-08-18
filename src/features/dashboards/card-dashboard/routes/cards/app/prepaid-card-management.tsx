import { createFileRoute } from "@tanstack/react-router";
import { PrepaidOverview, PrepaidCardsSection, BalancesSection, ControlsSection, PrepaidActivitySection, PrepaidFeesSection, PrepaidIssueModal, TopupModal, PrepaidManageDrawer } from "../../../features/card-dashboard/prepaid-card-management/pages";

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
