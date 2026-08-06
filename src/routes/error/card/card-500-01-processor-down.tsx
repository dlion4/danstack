import { createFileRoute } from '@tanstack/react-router';
import { Card50001ProcessorDown } from '../../../features/errors/components/Card50001ProcessorDown';

export const Route = createFileRoute('/error/card/card-500-01-processor-down')({
component: Card50001ProcessorDown,
});
