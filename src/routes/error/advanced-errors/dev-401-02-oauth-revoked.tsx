import { createFileRoute } from '@tanstack/react-router';
import { Dev40102OAuthRevoked } from '../../../features/errors/components/Dev40102OAuthRevoked';

export const Route = createFileRoute('/error/advanced-errors/dev-401-02-oauth-revoked')({
	component: Dev40102OAuthRevoked,
});
