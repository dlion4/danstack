import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/apps-integrations")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/integrations" });
	},
});
