import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/invoicing-billing")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/get-paid" });
	},
});
