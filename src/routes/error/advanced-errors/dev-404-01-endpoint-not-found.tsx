import { createFileRoute } from '@tanstack/react-router';
import { Dev40401EndpointNotFound } from '../../../features/errors/components/Dev40401EndpointNotFound';

export const Route = createFileRoute('/error/advanced-errors/dev-404-01-endpoint-not-found')({
	component: Dev40401EndpointNotFound,
});
