import { createFileRoute } from '@tanstack/react-router';
import { Card40901AlreadyExistsEmployee } from '../../../features/errors/components/Card40901AlreadyExistsEmployee';

export const Route = createFileRoute('/error/card/card-409-01-already-exists-employee')({
	component: Card40901AlreadyExistsEmployee,
});
