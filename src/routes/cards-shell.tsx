import { createFileRoute } from "@tanstack/react-router";
import CardsShell from "@/features/Layouts/dashboard-cards-layout/components/CardsShell";

/**
 * cards-shell.tsx — LAYOUT route for the re-themed PayMo BAAS Cards shell.
 * ----------------------------------------------------------------------------
 * Mirrors routes/business.tsx (the BusinessShell layout): this route adds the
 * "/cards-shell" prefix and renders the restyled cards chrome (sidebar + topbar
 * + drawers + toasts), whose <Outlet /> hosts the pages below. It intentionally
 * lives on its own prefix so the existing designed card dashboard at
 * "/cards/app" is left untouched.
 */
export const Route = createFileRoute("/cards-shell")({
	component: CardsShell,
});
