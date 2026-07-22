import { createFileRoute } from "@tanstack/react-router";
import { InitiateTransfer } from "@/features/transaction-dashboard/initiate-transfer/pages/InitiateTransfer";
 
/**
 * app.initiate-transfer.tsx — Initiate Transfer (Page 1.2).
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/transaction_dashboard/app/initiate-transfer")({
	component: InitiateTransfer,
});