import { createFileRoute } from '@tanstack/react-router';
import { Tx40303AccountFrozen } from '../../../features/errors/components/Tx40303AccountFrozen';

export const Route = createFileRoute('/error/transaction-errors/tx-403-03-account-frozen')({
	component: Tx40303AccountFrozen,
});
