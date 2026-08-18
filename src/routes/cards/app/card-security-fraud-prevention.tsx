import { createFileRoute } from "@tanstack/react-router";
import {
	AuditLogSection,
	FraudEventModal,
	FraudEventsSection,
	FraudWizardModal,
	ReportCardSection,
	SafeguardsSection,
	SecurityOverview,
	SuspiciousSection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-security-fraud-prevention/pages";

/**
 * app.card-security-fraud-prevention.tsx — Security & Fraud (Module 5.7).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute(
	"/cards/app/card-security-fraud-prevention",
)({
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
