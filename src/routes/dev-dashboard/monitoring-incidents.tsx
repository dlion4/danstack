import { createFileRoute } from "@tanstack/react-router";
import MonitoringIncidents from "@/features/dev-dashboard/monitoring-incidents/pages/MonitoringIncidents";

// 4.8 — Monitoring, Alerting & Incident Management.
export const Route = createFileRoute("/dev-dashboard/monitoring-incidents")({
	component: MonitoringIncidents,
});
