import { createFileRoute } from "@tanstack/react-router";
import CardsShell from "@/features/dashboards/card-dashboard/components/layout/CardsShell";

/**
 * app.tsx — LAYOUT route for the Card Dashboard shell.
 * ----------------------------------------------------------------------------
 * Mirrors routes/pm/app.tsx (the transactions shell): this route adds the
 * "/cards/app" prefix and renders the designed card dashboard shell
 * (sidebar + topbar + quick bar + toasts + modal hosts), whose <Outlet />
 * hosts every /cards/app/<module> page below.
 */
export const Route = createFileRoute("/cards/app")({
	component: CardsLayout,
});

function CardsLayout() {
	// CardsShell renders its own <Outlet /> for the child module pages.
	return <CardsShell />;
}
