import { createFileRoute } from "@tanstack/react-router";
import { CorporateOverview, DepartmentsSection, EmployeesSection, PoliciesSection, ApprovalsSection, BillingSection, BillingModal, InviteEmployeeModal, ApprovalModal, PolicyModal } from "../../../features/card-dashboard/corporate-business-cards/pages";

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
