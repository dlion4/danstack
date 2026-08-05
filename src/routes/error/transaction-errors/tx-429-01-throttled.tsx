import { createFileRoute } from '@tanstack/react-router';
import { Tx42901Throttled } from '../../../features/errors/components/Tx42901Throttled';

export const Route = createFileRoute('/error/transaction-errors/tx-429-01-throttled')({
	component: Tx42901Throttled,
});
