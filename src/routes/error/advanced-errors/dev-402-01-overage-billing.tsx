import { createFileRoute } from '@tanstack/react-router';
import { Dev40201OverageBilling } from '../../../features/errors/components/Dev40201OverageBilling';

export const Route = createFileRoute('/error/advanced-errors/dev-402-01-overage-billing')({
	component: Dev40201OverageBilling,
});
