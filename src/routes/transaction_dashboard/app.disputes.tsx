import { createFileRoute } from '@tanstack/react-router';
import Disputes from '@/features/transaction-dashboard/disputes/pages/Disputes';

export const Route = createFileRoute('/transaction_dashboard/app/disputes')({
	component: Disputes,
});
