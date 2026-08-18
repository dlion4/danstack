import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/command-center")({
	loader: () => {
		throw redirect({ to: "/business-dashboard" });
	},
});
