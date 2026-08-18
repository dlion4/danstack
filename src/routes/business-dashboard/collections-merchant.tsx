import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/collections-merchant")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/get-paid" });
	},
});
