import { createFileRoute } from '@tanstack/react-router';
import { Tx50001SettlementDelayed } from '../../../features/errors/components/Tx50001SettlementDelayed';

export const Route = createFileRoute('/error/transaction-errors/tx-500-01-settlement-delayed')({
	component: Tx50001SettlementDelayed,
});
