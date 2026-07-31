import { createFileRoute } from "@tanstack/react-router";
import ComplianceAudit from "@/features/dashboards/dev-dashboard/compliance-audit/pages/ComplianceAudit";

// 4.12 — Compliance, Audit & Regulatory Integration.
export const Route = createFileRoute("/dev-dashboard/compliance-audit")({
	component: ComplianceAudit,
});
