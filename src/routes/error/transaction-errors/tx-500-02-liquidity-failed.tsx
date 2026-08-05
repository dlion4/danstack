import { createFileRoute } from '@tanstack/react-router';
import { Tx50002LiquidityFailed } from '../../../features/errors/components/Tx50002LiquidityFailed';

export const Route = createFileRoute('/error/transaction-errors/tx-500-02-liquidity-failed')({
	component: Tx50002LiquidityFailed,
});
