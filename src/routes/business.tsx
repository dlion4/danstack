import { createFileRoute } from '@tanstack/react-router'
import BusinessShell from '@/features/Layouts/dashboard-business-layout/components/BusinessShell'

export const Route = createFileRoute('/business')({
  component: BusinessLayout,
})

function BusinessLayout() {
  return <BusinessShell />
}
