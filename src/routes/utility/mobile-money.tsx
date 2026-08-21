import { createFileRoute } from "@tanstack/react-router";
import { MobileMoneyPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/mobile-money/pages";

export const Route = createFileRoute("/utility/mobile-money")({
	component: MobileMoneyPage,
});
