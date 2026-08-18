import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/overview")({
	loader: () => {
		throw redirect({ to: "/business-dashboard" });
	},
});
