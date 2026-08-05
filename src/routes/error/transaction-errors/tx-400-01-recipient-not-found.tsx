import { createFileRoute } from '@tanstack/react-router';
import { Tx40001RecipientNotFound } from '../../../features/errors/components/Tx40001RecipientNotFound';

export const Route = createFileRoute('/error/transaction-errors/tx-400-01-recipient-not-found')({
	component: Tx40001RecipientNotFound,
});
