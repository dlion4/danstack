import { createFileRoute } from "@tanstack/react-router";
import { AdminOverview, GatewayLogsSection, IntegrationsSection, AdminAccessSection, EnvironmentSection, HealthCheckModal, WebhookModal, ApiKeyModal } from "../../../features/card-dashboard/card-program-administration/pages";

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
