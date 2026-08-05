import { createFileRoute } from '@tanstack/react-router';
import { Util40201AmountBelowMin } from '../../../features/errors/components/Util40201AmountBelowMin';

export const Route = createFileRoute('/error/utility-errors/util-402-01-amount-below-min')({
	component: Util40201AmountBelowMin,
});
