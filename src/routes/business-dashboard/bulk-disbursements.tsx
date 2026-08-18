import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/bulk-disbursements")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/pay-suppliers" });
	},
});
