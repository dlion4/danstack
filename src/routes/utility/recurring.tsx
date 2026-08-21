import { createFileRoute } from "@tanstack/react-router";
import { RecurringPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/recurring/pages";

export const Route = createFileRoute("/utility/recurring")({
	component: RecurringPage,
});
