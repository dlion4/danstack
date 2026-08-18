import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-dashboard/payroll-hr")({
	loader: () => {
		throw redirect({ to: "/business-dashboard/pay-suppliers" });
	},
});
