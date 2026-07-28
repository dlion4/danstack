import { createFileRoute } from "@tanstack/react-router";
import SecurityCompliance from "@/features/dev-dashboard/security-compliance/pages/SecurityCompliance";

export const Route = createFileRoute("/dev-dashboard/security")({
	component: SecurityCompliance,
});
