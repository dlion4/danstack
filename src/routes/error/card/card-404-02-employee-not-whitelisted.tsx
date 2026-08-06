import { createFileRoute } from '@tanstack/react-router';
import { Card40402EmployeeNotWhitelisted } from '../../../features/errors/components/Card40402EmployeeNotWhitelisted';

export const Route = createFileRoute('/error/card/card-404-02-employee-not-whitelisted')({
component: Card40402EmployeeNotWhitelisted,
});
