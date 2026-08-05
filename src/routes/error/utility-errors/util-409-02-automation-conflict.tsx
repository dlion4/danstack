import { createFileRoute } from '@tanstack/react-router';
import { Util40902AutomationConflict } from '../../../features/errors/components/Util40902AutomationConflict';

export const Route = createFileRoute('/error/utility-errors/util-409-02-automation-conflict')({
	component: Util40902AutomationConflict,
});
