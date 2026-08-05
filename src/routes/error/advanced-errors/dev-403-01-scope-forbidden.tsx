import { createFileRoute } from '@tanstack/react-router';
import { Dev40301ScopeForbidden } from '../../../features/errors/components/Dev40301ScopeForbidden';

export const Route = createFileRoute('/error/advanced-errors/dev-403-01-scope-forbidden')({
	component: Dev40301ScopeForbidden,
});
