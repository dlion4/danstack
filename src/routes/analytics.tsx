import { createFileRoute } from '@tanstack/react-router'
import Analytics from '../features/analytics/pages/Analytics'

export const Route = createFileRoute('/analytics')({
  component: Analytics,
})
