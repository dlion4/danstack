import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/business-onboarding")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/profile" });
	},
});
