import { createFileRoute } from '@tanstack/react-router'
import VirtualDebitCards from '@/features/card-dashboard/virtual-debit-cards/pages/VirtualDebitCards'

export const Route = createFileRoute('/cards/app/virtual-debit-cards')({
  component: VirtualDebitCards,
})