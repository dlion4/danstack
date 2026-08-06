import { createFileRoute } from '@tanstack/react-router';
import { Card40202LimitExceeded } from '../../../features/errors/components/Card40202LimitExceeded';

export const Route = createFileRoute('/error/card/card-402-02-limit-exceeded')({
	component: Card40202LimitExceeded,
});
