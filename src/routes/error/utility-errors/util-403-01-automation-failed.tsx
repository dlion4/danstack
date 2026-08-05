import { createFileRoute } from '@tanstack/react-router';
import { Util40301AutomationFailed } from '../../../features/errors/components/Util40301AutomationFailed';

export const Route = createFileRoute('/error/utility-errors/util-403-01-automation-failed')({
	component: Util40301AutomationFailed,
});
