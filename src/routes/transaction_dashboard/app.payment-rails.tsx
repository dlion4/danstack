import { createFileRoute } from "@tanstack/react-router";
import PaymentRails from "@/features/transaction-dashboard/payment-rails/pages/PaymentRails";

/**
 * app.payment-rails.tsx — Payment Rails & Routing (Page 1.4).
 * The PaymentRails feature was already refactored; this route wires it into
 * the app shell so the page is reachable at /app/payment-rails.
 */
export const Route = createFileRoute("/transaction_dashboard/app/payment-rails")({
	component: PaymentRails,
});
