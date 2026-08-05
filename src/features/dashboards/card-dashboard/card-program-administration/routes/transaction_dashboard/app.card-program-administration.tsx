import { createFileRoute } from "@tanstack/react-router";
import CardProgramAdministration from "@/features/dashboards/card-dashboard/card-program-administration/pages/CardProgramAdministration";

export const Route = createFileRoute(
	"/pm/app/card-program-administration",
)({
	component: CardProgramAdministration,
});
