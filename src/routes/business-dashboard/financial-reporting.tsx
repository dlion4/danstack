import { createFileRoute } from "@tanstack/react-router";
import FinancialReporting from "@/features/dashboards/business-dashboard/financial-reporting/pages/FinancialReporting";

/**
 * business-dashboard/financial-reporting.tsx — Financial Reporting, Audit & Analytics (Page 3.8).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/financial-reporting
 */
export const Route = createFileRoute("/business-dashboard/financial-reporting")(
	{
		component: FinancialReporting,
	},
);
