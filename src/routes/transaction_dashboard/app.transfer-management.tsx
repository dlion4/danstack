import { createFileRoute } from "@tanstack/react-router";
import TransferManagement from "@/features/transaction-dashboard/transfer-management/pages/TransferManagement";
 
/**
 * app.transfer-management.tsx — Transfer Management (Page 1.3).
 * Renders inside the app shell (child of routes/app.tsx).
 */
export const Route = createFileRoute("/transaction_dashboard/app/transfer-management")({
	component: TransferManagement,
});