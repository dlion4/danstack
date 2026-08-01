import { createFileRoute } from "@tanstack/react-router";
import PayMoHub from "@/features/dashboards/wallet-activation/paymo-page-entry";

/**
 * app.activate.tsx — Wallet Activation & Cross-Dashboard Linkage Hub.
 * Renders the PayMo Wallet Hub page plus all 15 linked modals.
 */
export const Route = createFileRoute("/activate_dashboard/app/activate")({
    component: PayMoHub,
});
