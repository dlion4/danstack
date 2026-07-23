import { createFileRoute } from '@tanstack/react-router'
import CardProgramAdministration from '@/features/card-dashboard/card-program-administration/pages/CardProgramAdministration'

export const Route = createFileRoute('/cards/app/card-program-administration')({
  component: CardProgramAdministration,
})
