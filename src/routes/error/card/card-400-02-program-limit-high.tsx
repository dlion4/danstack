import { createFileRoute } from '@tanstack/react-router';
import { Card40002ProgramLimitHigh } from '../../../features/errors/components/Card40002ProgramLimitHigh';

export const Route = createFileRoute('/error/card/card-400-02-program-limit-high')({
	component: Card40002ProgramLimitHigh,
});
