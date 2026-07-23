import { createFileRoute } from '@tanstack/react-router'
import BusinessShell from '@/features/Layouts/dashboard-business-layout/components/BusinessShell'

export const Route = createFileRoute('/business-dashboard/')({
  component: BusinessDashboardLayout,
})

function BusinessDashboardLayout() {
  return <BusinessShell />
}
