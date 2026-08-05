import { createFileRoute } from '@tanstack/react-router';
import { Tx40101Pin3xLocked } from '../../../features/errors/components/Tx40101Pin3xLocked';

export const Route = createFileRoute('/error/transaction-errors/tx-401-01-pin-3x-locked')({
	component: Tx40101Pin3xLocked,
});
