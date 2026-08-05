import { createFileRoute } from '@tanstack/react-router';
import { Tx42301RtgsCutoff } from '../../../features/errors/components/Tx42301RtgsCutoff';

export const Route = createFileRoute('/error/transaction-errors/tx-423-01-rtgs-cutoff')({
	component: Tx42301RtgsCutoff,
});
