import { createFileRoute } from '@tanstack/react-router';
import { Card40204MinTopupFailed } from '../../../features/errors/components/Card40204MinTopupFailed';

export const Route = createFileRoute('/error/card/card-402-04-min-topup-failed')({
  component: Card40204MinTopupFailed,
});
