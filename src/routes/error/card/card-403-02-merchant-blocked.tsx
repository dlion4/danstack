import { createFileRoute } from '@tanstack/react-router';
import { Card40302MerchantBlocked } from '../../../features/errors/components/Card40302MerchantBlocked';

export const Route = createFileRoute('/error/card/card-403-02-merchant-blocked')({
  component: Card40302MerchantBlocked,
});
