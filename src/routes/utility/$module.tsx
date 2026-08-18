import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * utility/$module.tsx — catch-all fallback for unknown /utility/<module> slugs.
 * ----------------------------------------------------------------------------
 * Every real module has a static route above (overview, electricity, water,
 * internet, airtime, settings). Any unknown or legacy deep link is redirected
 * to the Utilities Command Center so no URL ever renders a broken page.
 */
export const Route = createFileRoute("/utility/$module")({
	loader: () => {
		throw redirect({ to: "/utility" });
	},
});
