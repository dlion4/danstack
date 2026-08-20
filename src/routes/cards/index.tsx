import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /cards → /cards/app
 * ----------------------------------------------------------------------------
 * Convenience alias so the short "/cards" URL (and any existing
 * `to="/cards"` links, e.g. in the transactions dashboard sidebar) lands on
 * the designed Card Command Center shell at /cards/app.
 */
export const Route = createFileRoute("/cards/")({
	loader: () => {
		throw redirect({ to: "/cards/app" });
	},
});
