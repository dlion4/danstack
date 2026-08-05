import { createFileRoute } from '@tanstack/react-router';
import { Tx40205FeeCalculationFailed } from '../../../features/errors/components/Tx40205FeeCalculationFailed';

export const Route = createFileRoute('/error/transaction-errors/tx-402-05-fee-calculation-failed')({
	component: Tx40205FeeCalculationFailed,
});
