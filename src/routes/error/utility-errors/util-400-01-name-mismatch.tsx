import { createFileRoute } from '@tanstack/react-router';
import { Util40001NameMismatch } from '../../../features/errors/components/Util40001NameMismatch';

export const Route = createFileRoute('/error/utility-errors/util-400-01-name-mismatch')({
	component: Util40001NameMismatch,
});
