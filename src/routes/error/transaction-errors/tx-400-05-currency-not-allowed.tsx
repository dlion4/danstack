import { createFileRoute } from '@tanstack/react-router';
import { Tx40005CurrencyNotAllowed } from '../../../features/errors/components/Tx40005CurrencyNotAllowed';

export const Route = createFileRoute('/error/transaction-errors/tx-400-05-currency-not-allowed')({
	component: Tx40005CurrencyNotAllowed,
});
