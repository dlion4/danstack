import { createFileRoute } from '@tanstack/react-router';
import { Tx42201NameMismatch } from '../../../features/errors/components/Tx42201NameMismatch';

export const Route = createFileRoute('/error/transaction-errors/tx-422-01-name-mismatch')({
	component: Tx42201NameMismatch,
});
