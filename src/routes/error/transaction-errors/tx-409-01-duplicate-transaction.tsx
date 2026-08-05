import { createFileRoute } from '@tanstack/react-router';
import { Tx40901DuplicateTransaction } from '../../../features/errors/components/Tx40901DuplicateTransaction';

export const Route = createFileRoute('/error/transaction-errors/tx-409-01-duplicate-transaction')({
	component: Tx40901DuplicateTransaction,
});
