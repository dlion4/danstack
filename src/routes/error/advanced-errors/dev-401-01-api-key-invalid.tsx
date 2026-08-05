import { createFileRoute } from '@tanstack/react-router';
import { Dev40101ApiKeyInvalid } from '../../../features/errors/components/Dev40101ApiKeyInvalid';

export const Route = createFileRoute('/error/advanced-errors/dev-401-01-api-key-invalid')({
	component: Dev40101ApiKeyInvalid,
});
