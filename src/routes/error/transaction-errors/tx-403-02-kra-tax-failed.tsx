import { createFileRoute } from '@tanstack/react-router';
import { Tx40302KraTaxFailed } from '../../../features/errors/components/Tx40302KraTaxFailed';

export const Route = createFileRoute('/error/transaction-errors/tx-403-02-kra-tax-failed')({
	component: Tx40302KraTaxFailed,
});
