import { createFileRoute } from '@tanstack/react-router';
import { Dev50003ElevatedErrorRate } from '../../../features/errors/components/Dev50003ElevatedErrorRate';

export const Route = createFileRoute('/error/advanced-errors/dev-500-03-elevated-error-rate')({
	component: Dev50003ElevatedErrorRate,
});
