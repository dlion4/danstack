import { createFileRoute } from '@tanstack/react-router';
import { Tx40204PerTxnLimit } from '../../../features/errors/components/Tx40204PerTxnLimit';

export const Route = createFileRoute('/error/transaction-errors/tx-402-04-per-txn-limit')({
	component: Tx40204PerTxnLimit,
});
