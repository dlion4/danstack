import { createFileRoute } from '@tanstack/react-router'
import VirtualCreditCards from '@/features/card-dashboard/virtual-credit-cards/pages/VirtualCreditCards'

export const Route = createFileRoute('/cards/app/virtual-credit-cards')({
  component: VirtualCreditCards,
})