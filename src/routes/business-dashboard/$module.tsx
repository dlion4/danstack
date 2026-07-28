import { createFileRoute } from "@tanstack/react-router";
import BusinessModulePage from "@/features/Layouts/dashboard-business-layout/pages/BusinessModulePage";

/**
 * business-dashboard/$module.tsx — generic /business-dashboard/<module> destination.
 * ----------------------------------------------------------------------------
 * Every sidebar entry resolves here. It reads the module param, finds the
 * matching module def, and renders a hero + stats + features + actions.
 * Static routes (e.g. business-dashboard/command-center) win over this
 * dynamic segment, so only not-yet-built modules land here and render
 * the friendly BusinessModulePage instead of a broken page.
 */
export const Route = createFileRoute("/business-dashboard/$module")({
	component: BusinessModuleRoute,
});

function BusinessModuleRoute() {
	const { module } = Route.useParams();
	return <BusinessModulePage module={module} />;
}