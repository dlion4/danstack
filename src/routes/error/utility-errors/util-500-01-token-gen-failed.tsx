import { createFileRoute } from '@tanstack/react-router';
import { Util50001TokenGenFailed } from '../../../features/errors/components/Util50001TokenGenFailed';

export const Route = createFileRoute('/error/utility-errors/util-500-01-token-gen-failed')({
	component: Util50001TokenGenFailed,
});
