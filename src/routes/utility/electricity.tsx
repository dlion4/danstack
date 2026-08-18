import { createFileRoute } from "@tanstack/react-router";
import { ElectricityPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/electricity/pages";

/**
 * utility/electricity.tsx — 3.2 Electricity Management (/utility/electricity).
 * Child of routes/utility.tsx, so it renders INSIDE the utility shell.
 */
export const Route = createFileRoute("/utility/electricity")({
	component: ElectricityPage,
});
