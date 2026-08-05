import { createFileRoute } from '@tanstack/react-router';
import { Tx40203DailyLimitReached } from '../../../features/errors/components/Tx40203DailyLimitReached';

export const Route = createFileRoute('/error/transaction-errors/tx-402-03-daily-limit-reached')({
	component: Tx40203DailyLimitReached,
});
