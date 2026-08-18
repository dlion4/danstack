import { createFileRoute } from "@tanstack/react-router";
import {
	FundingSection,
	GuardrailsSection,
	VirtualActivitySection,
	VirtualBestPractice,
	VirtualCardsSection,
	VirtualDetailsModal,
	VirtualIssueModal,
	VirtualOverview,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/virtual-debit-cards/pages";

/**
 * app.virtual-debit-cards.tsx — Virtual Debit Center (Module 5.3).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
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
