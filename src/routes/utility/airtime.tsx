import { createFileRoute } from "@tanstack/react-router";
import { MobileMoneyPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/mobile-money/pages";

/**
 * utility/airtime.tsx — 3.5 Mobile Money & Airtime Hub (/utility/airtime).
 * Child of routes/utility.tsx, so it renders INSIDE the utility shell.
 */
export const Route = createFileRoute("/utility/airtime")({
	component: MobileMoneyPage,
});
