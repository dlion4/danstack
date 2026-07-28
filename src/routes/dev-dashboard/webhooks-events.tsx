import { createFileRoute } from "@tanstack/react-router";
import WebhooksEvents from "@/features/dev-dashboard/webhooks-events/pages/WebhooksEvents";

// 4.3 — Webhooks, Events & Real-Time Integration.
export const Route = createFileRoute("/dev-dashboard/webhooks-events")({
	component: WebhooksEvents,
});
