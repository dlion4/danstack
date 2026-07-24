import { createFileRoute } from "@tanstack/react-router";
import BusinessOnboarding from "@/features/business-dashboard/business-onboarding/pages/BusinessOnboarding";

/**
 * business-dashboard/business-onboarding.tsx — Business Onboarding & KYB/KYC (Page 3.12).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/business-onboarding
 */
export const Route = createFileRoute("/business-dashboard/business-onboarding")(
	{
		component: BusinessOnboarding,
	},
);
