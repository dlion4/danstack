import { createFileRoute } from '@tanstack/react-router';
import { Dev40001PayloadValidation } from '../../../features/errors/components/Dev40001PayloadValidation';

export const Route = createFileRoute('/error/advanced-errors/dev-400-01-payload-validation')({
	component: Dev40001PayloadValidation,
});
