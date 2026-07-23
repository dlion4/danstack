import { createFileRoute } from '@tanstack/react-router'
import CardsShell from '@/features/Layouts/dashboard-cards-layout/components/CardsShell'

export const Route = createFileRoute('/cards/app')({
  component: CardsLayout,
})

function CardsLayout() {
  return <CardsShell />
}