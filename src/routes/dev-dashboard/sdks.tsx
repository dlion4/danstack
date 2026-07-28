import { createFileRoute } from "@tanstack/react-router";
import SdkResources from "@/features/dev-dashboard/sdk-resources/pages/SdkResources";

export const Route = createFileRoute("/dev-dashboard/sdks")({
	component: SdkResources,
});
