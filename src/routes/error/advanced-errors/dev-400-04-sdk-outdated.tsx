import { createFileRoute } from '@tanstack/react-router';
import { Dev40004SdkOutdated } from '../../../features/errors/components/Dev40004SdkOutdated';

export const Route = createFileRoute('/error/advanced-errors/dev-400-04-sdk-outdated')({
	component: Dev40004SdkOutdated,
});
