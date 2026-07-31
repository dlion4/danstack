import { createFileRoute } from "@tanstack/react-router";
import CollectionsMerchant from "@/features/dashboards/business-dashboard/collections-merchant/pages/CollectionsMerchant";

/**
 * business-dashboard/collections-merchant.tsx — Collections & Merchant Services (Page 3.2).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/collections-merchant
 */
export const Route = createFileRoute(
	"/business-dashboard/collections-merchant",
)({
	component: CollectionsMerchant,
});
