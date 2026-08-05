import { createFileRoute } from '@tanstack/react-router';
import { Dev42901RateLimit } from '../../../features/errors/components/Dev42901RateLimit';

export const Route = createFileRoute('/error/advanced-errors/dev-429-01-rate-limit-100')({
	component: Dev42901RateLimit,
});
