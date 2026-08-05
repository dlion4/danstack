import { createFileRoute } from '@tanstack/react-router';
import { Tx40801MpesaStkTimeout } from '../../../features/errors/components/Tx40801MpesaStkTimeout';

export const Route = createFileRoute('/error/transaction-errors/tx-408-01-mpesa-stk-timeout')({
	component: Tx40801MpesaStkTimeout,
});
