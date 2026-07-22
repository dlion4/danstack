import { createFileRoute } from '@tanstack/react-router'
import DevShell from '@/features/Layouts/dashboard-dev-layout/components/DevShell'

export const Route = createFileRoute('/dev')({
  component: DevLayout,
})

function DevLayout() {
  return <DevShell />
}
