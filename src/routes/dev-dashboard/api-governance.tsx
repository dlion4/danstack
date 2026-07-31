import { createFileRoute } from "@tanstack/react-router";
import ApiGovernance from "@/features/dashboards/dev-dashboard/api-governance/pages/ApiGovernance";

// 4.10 — API Governance, Versioning & Roadmap.
export const Route = createFileRoute("/dev-dashboard/api-governance")({
	component: ApiGovernance,
});
