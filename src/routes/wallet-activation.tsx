import { createFileRoute } from "@tanstack/react-router";
import WalletActivation from "@/features/dashboards/wallet-activation/page/WalletActivation";

export const Route = createFileRoute("/wallet-activation")({
	component: WalletActivation,
});
