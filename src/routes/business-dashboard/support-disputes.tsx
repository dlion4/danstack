import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/support-disputes")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/disputes" });
	},
});
