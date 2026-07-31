import { createFileRoute } from "@tanstack/react-router";
import SandboxTesting from "@/features/dashboards/dev-dashboard/sandbox-testing/pages/SandboxTesting";

export const Route = createFileRoute("/dev-dashboard/playground")({
	component: SandboxTesting,
});
