import { createFileRoute } from '@tanstack/react-router'
import UtilityShell from '@/features/Layouts/dashboard-utility-layout/components/UtilityShell'

export const Route = createFileRoute('/utility')({
  component: UtilityLayout,
})

function UtilityLayout() {
  return <UtilityShell />
}
