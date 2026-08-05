import { createFileRoute } from '@tanstack/react-router';
import { Dev40801WebhookTimeout } from '../../../features/errors/components/Dev40801WebhookTimeout';

export const Route = createFileRoute('/error/advanced-errors/dev-408-01-webhook-timeout')({
	component: Dev40801WebhookTimeout,
});
