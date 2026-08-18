import { createFileRoute } from "@tanstack/react-router";
import PayrollHr from "@/features/dashboards/business-dashboard/payroll-hr/pages/PayrollHr";

/**
 * business-dashboard/payroll-hr.tsx — Payroll & HR.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/payroll-hr
 */
export const Route = createFileRoute("/business-dashboard/payroll-hr")({
	component: PayrollHr,
});
