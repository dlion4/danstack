import { createFileRoute } from '@tanstack/react-router';
import { Card41001Expired } from '../../../features/errors/components/Card41001Expired';

export const Route = createFileRoute('/error/card/card-410-01-expired')({
	component: Card41001Expired,
});
