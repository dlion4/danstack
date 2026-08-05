import { createFileRoute } from '@tanstack/react-router';
import { Tx40301AmlHold } from '../../../features/errors/components/Tx40301AmlHold';

export const Route = createFileRoute('/error/transaction-errors/tx-403-01-aml-hold')({
	component: Tx40301AmlHold,
});
