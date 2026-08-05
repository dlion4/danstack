import { createFileRoute } from '@tanstack/react-router';
import { Util42901RateLimited } from '../../../features/errors/components/Util42901RateLimited';

export const Route = createFileRoute('/error/utility-errors/util-429-01-rate-limited')({
	component: Util42901RateLimited,
});
