import { createFileRoute } from '@tanstack/react-router';
import { Dev40002SignatureVerification } from '../../../features/errors/components/Dev40002SignatureVerification';

export const Route = createFileRoute('/error/advanced-errors/dev-400-02-signature-verification-failed')({
	component: Dev40002SignatureVerification,
});
