import { createFileRoute } from '@tanstack/react-router';
import { Tx40401MpesaNotRegistered } from '../../../features/errors/components/Tx40401MpesaNotRegistered';

export const Route = createFileRoute('/error/transaction-errors/tx-404-01-mpesa-not-registered')({
	component: Tx40401MpesaNotRegistered,
});
