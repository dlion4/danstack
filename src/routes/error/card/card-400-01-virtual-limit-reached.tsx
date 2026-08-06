import { createFileRoute } from '@tanstack/react-router';
import { Card40001VirtualLimitReached } from '../../../features/errors/components/Card40001VirtualLimitReached';

export const Route = createFileRoute('/error/card/card-400-01-virtual-limit-reached')({
  component: Card40001VirtualLimitReached,
});
