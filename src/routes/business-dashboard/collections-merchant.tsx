import { createFileRoute } from "@tanstack/react-router";
import CollectionsMerchant from "@/features/dashboards/business-dashboard/collections-merchant/pages/CollectionsMerchant";

/**
 * business-dashboard/collections-merchant.tsx — Collections & Merchant Services.
 * Child of routes/business-dashboard.tsx, so it renders INSIDE BusinessShell.
 * Mounts at /business-dashboard/collections-merchant
 */
export const Route = createFileRoute("/business-dashboard/collections-merchant")({
	component: CollectionsMerchant,
});
