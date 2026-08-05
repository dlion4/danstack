import { createFileRoute } from '@tanstack/react-router';
import { Tx40003BankOffline } from '../../../features/errors/components/Tx40003BankOffline';

export const Route = createFileRoute('/error/transaction-errors/tx-400-03-bank-offline')({
	component: Tx40003BankOffline,
});
