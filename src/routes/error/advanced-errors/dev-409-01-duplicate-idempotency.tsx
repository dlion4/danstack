import { createFileRoute } from '@tanstack/react-router';
import { Dev40901DuplicateIdempotency } from '../../../features/errors/components/Dev40901DuplicateIdempotency';

export const Route = createFileRoute('/error/advanced-errors/dev-409-01-duplicate-idempotency')({
	component: Dev40901DuplicateIdempotency,
});
