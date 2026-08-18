import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/treasury-cash")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/cash" });
	},
});
