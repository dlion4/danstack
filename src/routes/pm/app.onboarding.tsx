import { createFileRoute } from "@tanstack/react-router";
import Onboarding from "@/features/dashboards/transaction-dashboard/onboarding/pages/Onboarding";

/**
 * app.onboarding.tsx — Business Onboarding & Verification Center.
 * Child of routes/app.tsx, so it renders INSIDE the app shell
 * (sidebar + top nav + right aside stay fixed; only this body swaps in).
 */
export const Route = createFileRoute("/pm/app/onboarding")({
	component: Onboarding,
});
