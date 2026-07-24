import { createFileRoute } from '@tanstack/react-router'
import BulkDisbursements from '@/features/business-dashboard/bulk-disbursements/pages/BulkDisbursements'

/**
 * business-dashboard/bulk-disbursements.tsx — Bulk Disbursements (Page 3.3).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/bulk-disbursements
 */
export const Route = createFileRoute('/business-dashboard/bulk-disbursements')({
  component: BulkDisbursements,
})
