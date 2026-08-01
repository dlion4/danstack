import { createFileRoute } from "@tanstack/react-router";
import WalletActivation from "@/features/dashboards/wallet-activation/page/WalletActivation";

export const Route = createFileRoute("/transaction_dashboard/app/wallet-activation")({
	component: WalletActivation,
});
