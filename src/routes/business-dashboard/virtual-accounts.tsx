import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/virtual-accounts")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/cash" });
	},
});
