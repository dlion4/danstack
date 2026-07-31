import { createFileRoute } from "@tanstack/react-router";
import CardProgramAdministration from "@/features/dashboards/card-dashboard/card-program-administration/pages/CardProgramAdministration";

export const Route = createFileRoute(
	"/transaction_dashboard/app/card-program-administration",
)({
	component: CardProgramAdministration,
});
