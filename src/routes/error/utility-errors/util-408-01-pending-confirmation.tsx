import { createFileRoute } from '@tanstack/react-router';
import { Util40801PendingConfirmation } from '../../../features/errors/components/Util40801PendingConfirmation';

export const Route = createFileRoute('/error/utility-errors/util-408-01-pending-confirmation')({
	component: Util40801PendingConfirmation,
});
