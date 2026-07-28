import { createFileRoute } from "@tanstack/react-router";
import PartnerMarketplace from "@/features/dev-dashboard/partner-marketplace/pages/PartnerMarketplace";

// 4.9 — Partner Program & Marketplace.
export const Route = createFileRoute("/dev-dashboard/partner-marketplace")({
	component: PartnerMarketplace,
});
