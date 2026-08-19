import { createFileRoute } from "@tanstack/react-router";
import CardsHome from "@/features/Layouts/dashboard-cards-layout/pages/CardsHome";

/**
 * /cards-shell/ — the re-themed cards overview home.
 * Child of routes/cards-shell.tsx.
 */
export const Route = createFileRoute("/cards-shell/")({
	component: CardsHome,
});
