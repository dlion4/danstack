import { createFileRoute } from "@tanstack/react-router";
import ApiReference from "@/features/dev-dashboard/api-reference/pages/ApiReference";

// 4.2 — API Reference & Documentation.
export const Route = createFileRoute("/dev-dashboard/api-reference")({
	component: ApiReference,
});
