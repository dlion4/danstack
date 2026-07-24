import { createFileRoute } from '@tanstack/react-router'
import OpenBanking from '@/features/business-dashboard/open-banking/pages/OpenBanking'

/**
 * business-dashboard/open-banking.tsx — Open Banking & Account Aggregation (Page 3.10).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/open-banking
 */
export const Route = createFileRoute('/business-dashboard/open-banking')({
  component: OpenBanking,
})
