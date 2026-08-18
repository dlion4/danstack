import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/business-dashboard/multi-currency-treasury",
)({
	loader: () => {
		throw redirect({ to: "/business-dashboard/cash" });
	},
});
