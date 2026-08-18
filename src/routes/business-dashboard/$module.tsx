import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Unknown /business-dashboard/<slug> → Command Center.
 * Real modules have static routes above.
 */
export const Route = createFileRoute("/business-dashboard/$module")({
	loader: () => {
		throw redirect({ to: "/business-dashboard" });
	},
});
