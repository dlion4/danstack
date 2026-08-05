import { createFileRoute } from '@tanstack/react-router';
import { Dev50002TestSuiteFailed } from '../../../features/errors/components/Dev50002TestSuiteFailed';

export const Route = createFileRoute('/error/advanced-errors/dev-500-02-test-suite-failed')({
	component: Dev50002TestSuiteFailed,
});
