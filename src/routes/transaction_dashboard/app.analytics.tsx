import { createFileRoute } from '@tanstack/react-router'
import Analytics from '@/features/transaction-dashboard/analytics/pages/Analytics'

/**
 * app.analytics.tsx — Transaction Analytics.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/transaction_dashboard/app/analytics')({
  component: Analytics,
})
