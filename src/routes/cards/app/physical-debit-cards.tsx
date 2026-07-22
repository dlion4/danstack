import { createFileRoute } from '@tanstack/react-router'
import PhysicalDebitCards from '@/features/card-dashboard/physical-debit-cards/pages/PhysicalDebitCards'

export const Route = createFileRoute('/cards/app/physical-debit-cards')({
  component: PhysicalDebitCards,
})
