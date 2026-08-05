import { createFileRoute } from '@tanstack/react-router';
import { Dev40304MissingWebhook } from '../../../features/errors/components/Dev40304MissingWebhook';

export const Route = createFileRoute('/error/advanced-errors/dev-403-04-missing-webhook')({
	component: Dev40304MissingWebhook,
});
