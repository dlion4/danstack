import { createFileRoute } from "@tanstack/react-router";
import CommandCenter from "@/features/business-dashboard/command-center/pages/CommandCenter";

// Business Command Center is the business dashboard overview (/business-dashboard).
export const Route = createFileRoute("/business-dashboard/")({
	component: CommandCenter,
});
