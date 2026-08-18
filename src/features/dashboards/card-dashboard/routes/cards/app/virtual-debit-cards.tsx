import { createFileRoute } from "@tanstack/react-router";
import { VirtualOverview, VirtualCardsSection, GuardrailsSection, FundingSection, VirtualActivitySection, VirtualBestPractice, VirtualIssueModal, VirtualDetailsModal } from "../../../features/card-dashboard/virtual-debit-cards/pages";

export const Route = createFileRoute("/cards/app/virtual-debit-cards")({
	component: VirtualDebitCards,
});

function VirtualDebitCards() {
	return (
		<>
			<VirtualOverview />
			<VirtualCardsSection />
			<GuardrailsSection />
			<FundingSection />
			<VirtualActivitySection />
			<VirtualBestPractice />
			<VirtualIssueModal />
			<VirtualDetailsModal />
		</>
	);
}
