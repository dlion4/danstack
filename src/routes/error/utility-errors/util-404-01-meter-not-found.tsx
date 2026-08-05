import { createFileRoute } from '@tanstack/react-router';
import { Util40401MeterNotFound } from '../../../features/errors/components/Util40401MeterNotFound';

export const Route = createFileRoute('/error/utility-errors/util-404-01-meter-not-found')({
	component: Util40401MeterNotFound,
});
