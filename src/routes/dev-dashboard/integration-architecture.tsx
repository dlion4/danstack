import { createFileRoute } from "@tanstack/react-router";
// import IntegrationArchitecture from "@/features/dashboards/transaction-dashboard/integration-architecture/pages/;"
import IntegrationArchitecture from "@/features/dashboards/dev-dashboard/integration-architecture/pages/IntegrationArchitecture";

// 4.7 — Integration Architecture & Patterns.
export const Route = createFileRoute("/dev-dashboard/integration-architecture")(
	{
		component: IntegrationArchitecture,
	},
);
