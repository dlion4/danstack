import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/accounts-payable")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/pay-suppliers" });
	},
});
