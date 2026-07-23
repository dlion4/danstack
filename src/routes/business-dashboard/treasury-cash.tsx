import { createFileRoute } from '@tanstack/react-router'
import TreasuryCash from '@/features/business-dashboard/treasury-cash/pages/TreasuryCash'

/**
 * business-dashboard/treasury-cash.tsx — Treasury, Cash Management & Forex (Page 3.7).
 * Self-contained page with its own sidebar, header, and modal layer.
 * Renders at /business-dashboard/treasury-cash
 */
export const Route = createFileRoute('/business-dashboard/treasury-cash')({
  component: TreasuryCash,
})
