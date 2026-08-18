import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/financial-reporting")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/books" });
	},
});
