import { createFileRoute } from '@tanstack/react-router'
import UtilityModulePage from '@/features/Layouts/dashboard-utility-layout/pages/UtilityModulePage'

/**
 * utility/$module.tsx — generic /utility/<module> destination.
 * ----------------------------------------------------------------------------
 * Every sidebar entry (Electricity, Water, Cable TV, Auto-Pay, Saved Accounts …)
 * and every overview card links to /utility/$module. The overview is the layout
 * index (/utility). Unknown slugs render a friendly empty state inside
 * UtilityModulePage instead of a broken page.
 */
export const Route = createFileRoute('/utility/$module')({
  component: UtilityModuleRoute,
})

function UtilityModuleRoute() {
  const { module } = Route.useParams()
  return <UtilityModulePage module={module} />
}
