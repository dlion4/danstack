import { createFileRoute } from '@tanstack/react-router'
import PayrollHr from '@/features/business-dashboard/payroll-hr/pages/PayrollHr'

/**
 * business-dashboard/payroll-hr.tsx — Payroll & HR (Page 3.4).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/payroll-hr
 */
export const Route = createFileRoute('/business-dashboard/payroll-hr')({
  component: PayrollHr,
})
