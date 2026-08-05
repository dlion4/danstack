import { createFileRoute } from '@tanstack/react-router';
import { Tx40201InsufficientBalance } from '../../../features/errors/components/Tx40201InsufficientBalance';

export const Route = createFileRoute('/error/transaction-errors/tx-402-01-insufficient-balance')({
	component: Tx40201InsufficientBalance,
});
