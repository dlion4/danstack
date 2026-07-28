import { createFileRoute } from "@tanstack/react-router";
import SupportSlas from "@/features/dev-dashboard/support-slas/pages/SupportSlas";

// 4.11 — Support, Escalation & SLAs.
export const Route = createFileRoute("/dev-dashboard/support-slas")({
	component: SupportSlas,
});
