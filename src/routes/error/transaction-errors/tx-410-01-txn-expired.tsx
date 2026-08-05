import { createFileRoute } from '@tanstack/react-router';
import { Tx41001TxnExpired } from '../../../features/errors/components/Tx41001TxnExpired';

export const Route = createFileRoute('/error/transaction-errors/tx-410-01-txn-expired')({
	component: Tx41001TxnExpired,
});
