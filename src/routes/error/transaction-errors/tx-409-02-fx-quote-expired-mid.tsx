import { createFileRoute } from '@tanstack/react-router';
import { Tx40902FxQuoteExpiredMid } from '../../../features/errors/components/Tx40902FxQuoteExpiredMid';

export const Route = createFileRoute('/error/transaction-errors/tx-409-02-fx-quote-expired-mid')({
	component: Tx40902FxQuoteExpiredMid,
});
