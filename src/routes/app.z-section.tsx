import { createFileRoute } from '@tanstack/react-router';
import ModulePage from '../features/shell/pages/ModulePage';

export const Route = createFileRoute('/app/z-section')({
  component: ModuleRoute,
});

function ModuleRoute() {
  const { section } = Route.useParams();
  return <ModulePage section={section} />;
}
