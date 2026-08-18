import { createFileRoute } from "@tanstack/react-router";
import { CreditOverview, CreditLineSection, CreditCardsSection, RepaymentSection, CreditActivitySection, CreditInsightsSection, CreditIssueModal, CreditDetailsModal, RepayModal, StatementDrawer } from "../../../features/card-dashboard/virtual-credit-cards/pages";

export const Route = createFileRoute("/cards/app/virtual-credit-cards")({
	component: VirtualCreditCards,
});

function VirtualCreditCards() {
	return (
		<>
			<CreditOverview />
			<CreditLineSection />
			<CreditCardsSection />
			<RepaymentSection />
			<CreditActivitySection />
			<CreditInsightsSection />
			<CreditIssueModal />
			<CreditDetailsModal />
			<RepayModal />
			<StatementDrawer />
		</>
	);
}
