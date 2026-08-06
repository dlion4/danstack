import { createFileRoute } from '@tanstack/react-router';
import { Card401013dsFailed } from '../../../features/errors/components/Card401013dsFailed';

export const Route = createFileRoute('/error/card/card-401-01-3ds-failed')({
	component: Card401013dsFailed,
});
