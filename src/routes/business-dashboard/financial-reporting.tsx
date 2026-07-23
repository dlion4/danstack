import { createFileRoute } from '@tanstack/react-router'
import FinancialReporting from '@/features/business-dashboard/financial-reporting/pages/FinancialReporting'

/**
 * business-dashboard/financial-reporting.tsx — Financial Reporting, Audit & Analytics (Page 3.8).
 * Self-contained page with its own sidebar, header, and modal layer.
 * Renders at /business-dashboard/financial-reporting
 */
export const Route = createFileRoute('/business-dashboard/financial-reporting')({
  component: FinancialReporting,
})
