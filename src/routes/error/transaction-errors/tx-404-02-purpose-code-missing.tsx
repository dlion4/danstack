import { createFileRoute } from '@tanstack/react-router';
import { Tx40402PurposeCodeMissing } from '../../../features/errors/components/Tx40402PurposeCodeMissing';

export const Route = createFileRoute('/error/transaction-errors/tx-404-02-purpose-code-missing')({
	component: Tx40402PurposeCodeMissing,
});
