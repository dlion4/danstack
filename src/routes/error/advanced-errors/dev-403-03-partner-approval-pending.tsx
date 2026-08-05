import { createFileRoute } from '@tanstack/react-router';
import { Dev40303PartnerApprovalPending } from '../../../features/errors/components/Dev40303PartnerApprovalPending';

export const Route = createFileRoute('/error/advanced-errors/dev-403-03-partner-approval-pending')({
	component: Dev40303PartnerApprovalPending,
});
