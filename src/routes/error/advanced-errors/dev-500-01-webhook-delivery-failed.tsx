import { createFileRoute } from '@tanstack/react-router';
import { Dev50001WebhookDeliveryFailed } from '../../../features/errors/components/Dev50001WebhookDeliveryFailed';

export const Route = createFileRoute('/error/advanced-errors/dev-500-01-webhook-delivery-failed')({
	component: Dev50001WebhookDeliveryFailed,
});
