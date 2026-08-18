import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/open-banking")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/cash" });
	},
});
