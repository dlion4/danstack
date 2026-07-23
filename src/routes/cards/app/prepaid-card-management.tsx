import { createFileRoute } from '@tanstack/react-router'
import PrepaidCardManagement from '@/features/card-dashboard/prepaid-card-management/pages/PrepaidCardManagement'

export const Route = createFileRoute('/cards/app/prepaid-card-management')({
  component: PrepaidCardManagement,
})
