import { createFileRoute } from '@tanstack/react-router'
import BusinessModulePage from '@/features/Layouts/dashboard-business-layout/pages/BusinessModulePage'

/**
 * business/$module.tsx — generic /business/<module> destination.
 * ----------------------------------------------------------------------------
 * Every sidebar entry (Cash Management, Billing, Payroll, Compliance …) and
 * every home module card links to /business/$module. The dashboard home is the
 * layout index (/business). Unknown slugs render a friendly empty state inside
 * BusinessModulePage instead of a broken page.
 */
export const Route = createFileRoute('/business/$module')({
  component: BusinessModuleRoute,
})

function BusinessModuleRoute() {
  const { module } = Route.useParams()
  return <BusinessModulePage module={module} />
}
