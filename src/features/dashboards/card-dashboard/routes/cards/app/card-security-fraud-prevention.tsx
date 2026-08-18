import { createFileRoute } from "@tanstack/react-router";
import { SecurityOverview, FraudEventsSection, SafeguardsSection, ReportCardSection, SuspiciousSection, AuditLogSection, FraudWizardModal, FraudEventModal } from "../../../features/card-dashboard/card-security-fraud-prevention/pages";

export const Route = createFileRoute("/cards/app/card-security-fraud-prevention")({
	component: CardSecurityFraudPrevention,
});

function CardSecurityFraudPrevention() {
	return (
		<>
			<SecurityOverview />
			<FraudEventsSection />
			<SafeguardsSection />
			<ReportCardSection />
			<SuspiciousSection />
			<AuditLogSection />
			<FraudWizardModal />
			<FraudEventModal />
		</>
	);
}
