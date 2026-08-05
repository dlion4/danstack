import { createFileRoute } from '@tanstack/react-router';
import { Util40202InsufficientBalanceUtility } from '../../../features/errors/components/Util40202InsufficientBalanceUtility';

export const Route = createFileRoute('/error/utility-errors/util-402-02-insufficient-balance-utility')({
	component: Util40202InsufficientBalanceUtility,
});
