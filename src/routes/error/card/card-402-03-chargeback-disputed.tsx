import { createFileRoute } from '@tanstack/react-router';
import { Card40203ChargebackDisputed } from '../../../features/errors/components/Card40203ChargebackDisputed';

export const Route = createFileRoute('/error/card/card-402-03-chargeback-disputed')({
	component: Card40203ChargebackDisputed,
});
