import { createFileRoute } from '@tanstack/react-router';
import Fees from '@/features/transaction-dashboard/fees/pages/Fees';

export const Route = createFileRoute('/transaction_dashboard/app/fees')({
	component: Fees,
});
