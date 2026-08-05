import { createFileRoute } from '@tanstack/react-router';
import { Util40203ProviderNotSupported } from '../../../features/errors/components/Util40203ProviderNotSupported';

export const Route = createFileRoute('/error/utility-errors/util-402-03-provider-not-supported')({
	component: Util40203ProviderNotSupported,
});
