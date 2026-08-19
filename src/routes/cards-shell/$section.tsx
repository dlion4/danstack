import { createFileRoute } from "@tanstack/react-router";
import CardsModulePage from "@/features/Layouts/dashboard-cards-layout/pages/CardsModulePage";

/**
 * cards-shell/$section.tsx — generic /cards-shell/<section> destination.
 * ----------------------------------------------------------------------------
 * Every sidebar entry (Command Center, Virtual Debit, Fraud Prevention …)
 * resolves here. It reads the section param, finds the matching module def,
 * and renders hero + stats + features + actions inside the re-themed shell.
 */
export const Route = createFileRoute("/cards-shell/$section")({
	component: CardsModuleRoute,
});

function CardsModuleRoute() {
	const { section } = Route.useParams();
	return <CardsModulePage section={section} />;
}
