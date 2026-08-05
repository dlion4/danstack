import { createFileRoute } from '@tanstack/react-router';
import { Util41001ProviderMaintenance } from '../../../features/errors/components/Util41001ProviderMaintenance';

export const Route = createFileRoute('/error/utility-errors/util-410-01-provider-maintenance')({
	component: Util41001ProviderMaintenance,
});
