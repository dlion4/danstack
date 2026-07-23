import { createFileRoute } from '@tanstack/react-router';
import FxManagement from '@/features/transaction-dashboard/fx/pages/FxManagement';

export const Route = createFileRoute('/transaction_dashboard/app/fx')({
	component: FxManagement,
});

