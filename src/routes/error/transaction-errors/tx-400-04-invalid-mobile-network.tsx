import { createFileRoute } from '@tanstack/react-router';
import { Tx40004InvalidMobileNetwork } from '../../../features/errors/components/Tx40004InvalidMobileNetwork';

export const Route = createFileRoute('/error/transaction-errors/tx-400-04-invalid-mobile-network')({
	component: Tx40004InvalidMobileNetwork,
});
