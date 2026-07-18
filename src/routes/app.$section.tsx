import { createFileRoute } from '@tanstack/react-router';
import ModulePage from '../features/shell/pages/ModulePage';

/**
 * app.$section.tsx — generic /app/<section> destination.
 * ----------------------------------------------------------------------------
 * Every sidebar entry + dashboard module card links to /app/$section (see
 * shell/components/Sidebar.tsx and shell/pages/Dashboard.tsx). Static routes
 * (/app/transfers, /app/liquidity, /app/reconciliation, /app/payment-rails …)
 * win over this dynamic segment, so only not-yet-built modules land here and
 * render the friendly ModulePage instead of a broken page.
 */
export const Route = createFileRoute('/app/$section')({
  component: ModuleRoute,
});

function ModuleRoute() {
  const { section } = Route.useParams();
  return <ModulePage section={section} />;
}
