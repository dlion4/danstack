import { createFileRoute } from "@tanstack/react-router";
import { InternetPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/internet/pages";

/**
 * utility/internet.tsx — 3.4 Internet & Connectivity (/utility/internet).
 * Child of routes/utility.tsx, so it renders INSIDE the utility shell.
 */
export const Route = createFileRoute("/utility/internet")({
	component: InternetPage,
});
