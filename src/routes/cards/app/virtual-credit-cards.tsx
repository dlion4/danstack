import { createFileRoute } from "@tanstack/react-router";
import {
	CreditActivitySection,
	CreditCardsSection,
	CreditDetailsModal,
	CreditInsightsSection,
	CreditIssueModal,
	CreditLineSection,
	CreditOverview,
	RepayModal,
	RepaymentSection,
	StatementDrawer,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/virtual-credit-cards/pages";

/**
 * app.virtual-credit-cards.tsx — Virtual Credit Center (Module 5.4).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
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
