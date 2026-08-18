import { createFileRoute } from "@tanstack/react-router";
import {
	AdminAccessSection,
	AdminOverview,
	ApiKeyModal,
	EnvironmentSection,
	GatewayLogsSection,
	HealthCheckModal,
	IntegrationsSection,
	WebhookModal,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-program-administration/pages";

/**
 * app.card-program-administration.tsx — Program Administration (Module 5.9).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute("/cards/app/card-program-administration")({
	component: CardProgramAdministration,
});

function CardProgramAdministration() {
	return (
		<>
			<AdminOverview />
			<GatewayLogsSection />
			<IntegrationsSection />
			<AdminAccessSection />
			<EnvironmentSection />
			<HealthCheckModal />
			<WebhookModal />
			<ApiKeyModal />
		</>
	);
}
