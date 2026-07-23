import { createFileRoute } from '@tanstack/react-router'
import BulkDisbursements from '@/features/business-dashboard/bulk-disbursements/pages/BulkDisbursements'

/**
 * business-dashboard/bulk-disbursements.tsx — Bulk Disbursements (Page 3.5).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/bulk-disbursements
 */
export const Route = createFileRoute('/business-dashboard/bulk-disbursements')({
  component: BulkDisbursements,
})
