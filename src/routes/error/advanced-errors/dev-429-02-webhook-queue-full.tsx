import { createFileRoute } from '@tanstack/react-router';
import { Dev42902WebhookQueueFull } from '../../../features/errors/components/Dev42902WebhookQueueFull';

export const Route = createFileRoute('/error/advanced-errors/dev-429-02-webhook-queue-full')({
	component: Dev42902WebhookQueueFull,
});
