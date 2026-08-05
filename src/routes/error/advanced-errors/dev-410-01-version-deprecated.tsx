import { createFileRoute } from '@tanstack/react-router';
import { Dev41001VersionDeprecated } from '../../../features/errors/components/Dev41001VersionDeprecated';

export const Route = createFileRoute('/error/advanced-errors/dev-410-01-version-deprecated')({
	component: Dev41001VersionDeprecated,
});
