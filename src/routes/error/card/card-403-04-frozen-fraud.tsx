import { createFileRoute } from '@tanstack/react-router';
import { Card40304FrozenFraud } from '../../../features/errors/components/Card40304FrozenFraud';

export const Route = createFileRoute('/error/card/card-403-04-frozen-fraud')({
	component: Card40304FrozenFraud,
});
