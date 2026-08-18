import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * business-dashboard/$module.tsx — catch-all for unknown /business-dashboard/<slug>.
 * ----------------------------------------------------------------------------
 * Every real module has a static route above (overview, get-paid, payroll-hr,
 * treasury-cash, …). Any unknown or legacy deep link is redirected to the
 * Command Center so no URL ever renders a broken page.
 */
export const Route = createFileRoute("/business-dashboard/$module")({
	loader: () => {
		throw redirect({ to: "/business-dashboard" });
	},
});
