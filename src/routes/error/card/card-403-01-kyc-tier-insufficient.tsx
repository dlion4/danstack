import { createFileRoute } from '@tanstack/react-router';
import { Card40301KycTierInsufficient } from '../../../features/errors/components/Card40301KycTierInsufficient';

export const Route = createFileRoute('/error/card/card-403-01-kyc-tier-insufficient')({
	component: Card40301KycTierInsufficient,
});
