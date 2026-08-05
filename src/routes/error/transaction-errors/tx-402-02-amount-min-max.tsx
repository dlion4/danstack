import { createFileRoute } from '@tanstack/react-router';
import { Tx40202AmountMinMax } from '../../../features/errors/components/Tx40202AmountMinMax';

export const Route = createFileRoute('/error/transaction-errors/tx-402-02-amount-min-max')({
	component: Tx40202AmountMinMax,
});
