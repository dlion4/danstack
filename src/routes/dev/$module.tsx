import { createFileRoute } from '@tanstack/react-router'
import DevModulePage from '@/features/Layouts/dashboard-dev-layout/pages/DevModulePage'

/**
 * dev/$module.tsx — generic /dev/<module> destination for the dev layout.
 * ----------------------------------------------------------------------------
 * Every sidebar entry (API Explorer, API Keys, Webhooks, Logs …) and every
 * home module card links to /dev/$module. The dashboard home is the layout
 * index (/dev). Unknown slugs render a friendly empty state inside
 * DevModulePage instead of a broken page.
 */
export const Route = createFileRoute('/dev/$module')({
  component: DevModuleRoute,
})

function DevModuleRoute() {
  const { module } = Route.useParams()
  return <DevModulePage module={module} />
}
