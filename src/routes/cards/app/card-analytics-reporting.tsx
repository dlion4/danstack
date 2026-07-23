import { createFileRoute } from '@tanstack/react-router'
import CardAnalyticsReporting from '@/features/card-dashboard/card-analytics-reporting/pages/CardAnalyticsReporting'

export const Route = createFileRoute('/cards/app/card-analytics-reporting')({
  component: CardAnalyticsReporting,
})
