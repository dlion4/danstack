import { createFileRoute } from '@tanstack/react-router';
import { Tx42202BeneficiaryBlacklisted } from '../../../features/errors/components/Tx42202BeneficiaryBlacklisted';

export const Route = createFileRoute('/error/transaction-errors/tx-422-02-beneficiary-blacklisted')({
	component: Tx42202BeneficiaryBlacklisted,
});
