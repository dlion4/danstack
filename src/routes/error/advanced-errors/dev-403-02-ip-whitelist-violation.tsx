import { createFileRoute } from '@tanstack/react-router';
import { Dev40302IpWhitelistViolation } from '../../../features/errors/components/Dev40302IpWhitelistViolation';

export const Route = createFileRoute('/error/advanced-errors/dev-403-02-ip-whitelist-violation')({
	component: Dev40302IpWhitelistViolation,
});
