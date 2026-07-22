import { createFileRoute } from '@tanstack/react-router';
import TransferOverview from '@/features/transaction-dashboard/transfer-overview/pages/TransferOverview';

/**
 * app.transfer-overview.tsx — Transfer Overview Command Center (Page 1.1).
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/transaction_dashboard/app/transfer-overview')({
	component: TransferOverview,
});
