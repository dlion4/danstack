import { createFileRoute } from '@tanstack/react-router';
import { Util40901BillAlreadyPaid } from '../../../features/errors/components/Util40901BillAlreadyPaid';

export const Route = createFileRoute('/error/utility-errors/util-409-01-bill-already-paid')({
	component: Util40901BillAlreadyPaid,
});
