import { createFileRoute } from "@tanstack/react-router";
import {
	ActivateModal,
	AddressSection,
	FeeSection,
	HeroAndTiers,
	MyPhysCardsSection,
	OrdersSection,
	ReplaceModal,
	ReplacementSection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/physical-debit-cards/pages";

/**
 * app.physical-debit-cards.tsx — Physical Debit Cards (Module 5.2).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute("/cards/app/physical-debit-cards")({
	component: PhysicalDebitCards,
});

function PhysicalDebitCards() {
	return (
		<>
			<HeroAndTiers />
			<OrdersSection />
			<MyPhysCardsSection />
			<FeeSection />
			<AddressSection />
			<ReplacementSection />
			<ActivateModal />
			<ReplaceModal />
		</>
	);
}
