import { createFileRoute } from "@tanstack/react-router";
import {
	ApprovalModal,
	ApprovalsSection,
	BillingModal,
	BillingSection,
	CorporateOverview,
	DepartmentsSection,
	EmployeesSection,
	InviteEmployeeModal,
	PoliciesSection,
	PolicyModal,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/corporate-business-cards/pages";

/**
 * app.corporate-business-cards.tsx — Corporate Programs (Module 5.6).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute("/cards/app/corporate-business-cards")({
	component: CorporateBusinessCards,
});

function CorporateBusinessCards() {
	return (
		<>
			<CorporateOverview />
			<DepartmentsSection />
			<EmployeesSection />
			<PoliciesSection />
			<ApprovalsSection />
			<BillingSection />
			<BillingModal />
			<InviteEmployeeModal />
			<ApprovalModal />
			<PolicyModal />
		</>
	);
}
