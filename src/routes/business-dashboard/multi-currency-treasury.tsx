import { createFileRoute } from '@tanstack/react-router'
import MultiCurrencyTreasury from '@/features/business-dashboard/multi-currency-treasury/pages/MultiCurrencyTreasury'

/**
 * business-dashboard/multi-currency-treasury.tsx — Multi-Currency Treasury & Forex (Page 3.11).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/multi-currency-treasury
 */
export const Route = createFileRoute('/business-dashboard/multi-currency-treasury')({
  component: MultiCurrencyTreasury,
})
