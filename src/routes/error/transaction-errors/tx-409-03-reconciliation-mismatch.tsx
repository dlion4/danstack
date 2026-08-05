import { createFileRoute } from '@tanstack/react-router';
import { Tx40903ReconciliationMismatch } from '../../../features/errors/components/Tx40903ReconciliationMismatch';

export const Route = createFileRoute('/error/transaction-errors/tx-409-03-reconciliation-mismatch')({
	component: Tx40903ReconciliationMismatch,
});
