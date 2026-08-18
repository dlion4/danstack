import { createFileRoute } from "@tanstack/react-router";
import { WaterPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/water/pages";

/**
 * utility/water.tsx — 3.3 Water Management (/utility/water).
 * Child of routes/utility.tsx, so it renders INSIDE the utility shell.
 */
export const Route = createFileRoute("/utility/water")({
	component: WaterPage,
});
