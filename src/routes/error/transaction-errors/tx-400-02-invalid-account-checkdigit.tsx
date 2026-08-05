import { createFileRoute } from '@tanstack/react-router';
import { Tx40002InvalidAccountCheckdigit } from '../../../features/errors/components/Tx40002InvalidAccountCheckdigit';

export const Route = createFileRoute('/error/transaction-errors/tx-400-02-invalid-account-checkdigit')({
	component: Tx40002InvalidAccountCheckdigit,
});
