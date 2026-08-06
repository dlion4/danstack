import { createFileRoute } from '@tanstack/react-router';
import { Card40103CvvAttemptsExceeded } from '../../../features/errors/components/Card40103CvvAttemptsExceeded';

export const Route = createFileRoute('/error/card/card-401-03-cvv-attempts-exceeded')({
	component: Card40103CvvAttemptsExceeded,
});
