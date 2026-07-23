import { createFileRoute } from '@tanstack/react-router'
// import CardCommandCenter from '@/features/card-dashboard/card-command-center/pages/CardCommandCenter'
import CardCommandCenter from '@/features/card-dashboard/card-command-center/pages/CardCommandCenter'
export const Route = createFileRoute('/cards/app/card-command-center')({
  component: CardCommandCenter,
})