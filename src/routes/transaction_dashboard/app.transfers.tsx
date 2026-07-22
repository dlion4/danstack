import { createFileRoute } from '@tanstack/react-router';
import TransferManagement from '@/features/transaction-dashboard/transfer-management/pages/TransferManagement';

/**
 * app.transfers.tsx — alias route for Transfer Management.
 * Child of routes/app.tsx, renders inside the app shell.
 */
export const Route = createFileRoute('/transaction_dashboard/app/transfers')({
  component: TransferManagement,
});
