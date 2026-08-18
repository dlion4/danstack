import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/business-dashboard/settings-administration",
)({
	loader: () => {
		throw redirect({ to: "/business-dashboard/profile" });
	},
});
