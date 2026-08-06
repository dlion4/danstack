import { createFileRoute } from '@tanstack/react-router';
import { Card40306NotActivated } from '../../../features/errors/components/Card40306NotActivated';

export const Route = createFileRoute('/error/card/card-403-06-not-activated')({
	component: Card40306NotActivated,
});
