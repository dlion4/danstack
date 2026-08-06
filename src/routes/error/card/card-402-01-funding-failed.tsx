import { createFileRoute } from '@tanstack/react-router';
import { Card40201FundingFailed } from '../../../features/errors/components/Card40201FundingFailed';

export const Route = createFileRoute('/error/card/card-402-01-funding-failed')({
  component: Card40201FundingFailed,
});
