import { createFileRoute } from "@tanstack/react-router";
import { HeroAndTiers, OrdersSection, MyPhysCardsSection, FeeSection, AddressSection, ReplacementSection, ActivateModal, ReplaceModal } from "../../../features/card-dashboard/physical-debit-cards/pages";

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
